import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createApiClient } from "./api.js";
import { registerApiTools } from "./tools.js";

export function createMcpServer() {
  const server = new McpServer({
    name: "centralmacatuba-mcp",
    version: "0.1.0",
    title: "Central Macatuba",
    description: "Servidor MCP para descoberta e consulta dos serviços públicos da Central Macatuba."
  }, {
    capabilities: { tools: {} }
  });

  registerApiTools(server, createApiClient());
  return server;
}
