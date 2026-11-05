import { McpServer } from "@modelcontextprotocol/server";
import { createApiClient } from "./api.js";
import { registerApiTools } from "./tools.js";

export function createMcpServer() {
  const server = new McpServer({
    name: "centralmacatuba-mcp",
    version: "0.1.0",
    title: "Central Macatuba"
  }, {
    capabilities: { tools: {} }
  });

  registerApiTools(server, createApiClient());
  return server;
}
