import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { loadConfig } from "./config.js";
import { createMcpServer } from "./server.js";

/**
 * Extracts a lowercase hostname without IPv6 brackets from the HTTP Host header.
 * Returns undefined for a missing header or a value that cannot be parsed as a URL.
 */
function requestHost(request: IncomingMessage): string | undefined {
  const raw = request.headers.host;
  if (!raw) return undefined;
  try {
    const hostname = new URL(`http://${raw}`).hostname.toLowerCase();
    return hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
  } catch {
    return undefined;
  }
}

/** Sends a small JSON error response without caching it. */
function reject(response: ServerResponse, status: number, message: string): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify({ error: message }));
}

/**
 * Starts the stateless Streamable HTTP transport at /mcp with host and origin checks.
 * Resolves when listening; rejects configuration and listener startup errors.
 * Transport connection and request errors become HTTP 500 responses when headers
 * have not been sent, or end the response otherwise. Registers SIGINT and SIGTERM
 * handlers that close the listener and exit the process.
 */
export async function startHttpServer(): Promise<void> {
  const config = loadConfig();
  const httpServer = createServer(async (request, response) => {
    if (request.url?.split("?")[0] !== "/mcp") {
      reject(response, 404, "Not found");
      return;
    }

    const host = requestHost(request);
    if (!host || (!config.allowedHosts.has("*") && !config.allowedHosts.has(host))) {
      reject(response, 421, "Misdirected request");
      return;
    }

    const origin = request.headers.origin?.toLowerCase();
    if (origin && !config.allowedOrigins.has(origin)) {
      reject(response, 403, "Origin not allowed");
      return;
    }

    if (!["GET", "POST", "DELETE"].includes(request.method ?? "")) {
      response.setHeader("allow", "GET, POST, DELETE");
      reject(response, 405, "Method not allowed");
      return;
    }

    const transport = new NodeStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      maxRequestBodySize: 1_048_576
    });
    const mcpServer = createMcpServer();
    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      void transport.close().catch(() => undefined);
      void mcpServer.close().catch(() => undefined);
    };
    response.once("close", cleanup);

    try {
      await mcpServer.connect(transport);
      await transport.handleRequest(request, response);
    } catch {
      if (!response.headersSent) reject(response, 500, "MCP request failed");
      else response.end();
    } finally {
      if (response.writableEnded) cleanup();
    }
  });

  await new Promise<void>((resolve, rejectPromise) => {
    const onError = (error: Error) => {
      httpServer.off("error", onError);
      rejectPromise(error);
    };
    httpServer.once("error", onError);
    httpServer.listen(config.httpPort, config.httpHost, () => {
      httpServer.off("error", onError);
      resolve();
    });
  });

  const shutdown = () => {
    httpServer.close(() => process.exit(0));
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
