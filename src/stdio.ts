import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createMcpServer } from "./server.js";

export async function startStdioServer(): Promise<void> {
  await serveStdio(() => createMcpServer());
}
