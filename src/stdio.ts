import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createMcpServer } from "./server.js";

/** Starts the MCP server over the process standard input and output streams. */
export async function startStdioServer(): Promise<void> {
  await serveStdio(() => createMcpServer());
}
