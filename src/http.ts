import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { loadConfig } from "./config.js";
import { createMcpServer } from "./server.js";

function requestHost(request: IncomingMessage): string | undefined {
  const raw = request.headers.host;
  if (!raw) return undefined;
  try {
    return new URL(`http://${raw}`).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function reject(response: ServerResponse, status: number, message: string): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify({ error: message }));
}

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
    if (origin && config.allowedOrigins.size > 0 && !config.allowedOrigins.has(origin)) {
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
      enableJsonResponse: true,
      maxRequestBodySize: 1_048_576
    });
    const mcpServer = createMcpServer();
    response.once("close", () => {
      void transport.close();
      void mcpServer.close();
    });

    try {
      await mcpServer.connect(transport);
      await transport.handleRequest(request, response);
    } catch {
      if (!response.headersSent) reject(response, 500, "MCP request failed");
      else response.end();
    } finally {
      if (response.writableEnded) {
        await transport.close();
        await mcpServer.close();
      }
    }
  });

  await new Promise<void>((resolve, rejectPromise) => {
    httpServer.once("error", rejectPromise);
    httpServer.listen(config.httpPort, config.httpHost, () => resolve());
  });

  const shutdown = () => {
    httpServer.close(() => process.exit(0));
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
