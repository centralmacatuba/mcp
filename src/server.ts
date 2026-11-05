import { McpServer } from "@modelcontextprotocol/server";
import { createApiClient } from "./api.js";
import { registerApiTools } from "./tools.js";
import { registerAppResources } from "./apps.js";

/** Creates an MCP server and registers its public API tools and UI resources. */
export function createMcpServer() {
  const server = new McpServer({
    name: "centralmacatuba-mcp",
    version: "0.1.0",
    title: "Central Macatuba - MCP"
  });

  registerAppResources(server);
  registerApiTools(server, createApiClient());
  return server;
}
