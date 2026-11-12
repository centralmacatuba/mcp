import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const client = new Client({
  name: "centralmacatuba-mcp-package-smoke-test",
  version: "1.0.0"
});

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [fileURLToPath(new URL("../dist/cli.js", import.meta.url)), "--transport", "stdio"],
  env: {
    ...process.env,
    CM_API_BASE_URL: "https://publica.api.centralmacatuba.qzz.io"
  }
});

let connected = false;

try {
  await client.connect(transport);
  connected = true;

  const { tools } = await client.listTools();
  const toolNames = new Set(tools.map(({ name }) => name));

  assert.equal(tools.length, 35, "The installed package should expose all 35 public tools.");
  assert.ok(toolNames.has("ping"), "The MCP client should discover the ping tool.");
  assert.ok(toolNames.has("calendario.gerar"), "The MCP client should discover calendar generation.");

  const { resources } = await client.listResources();
  assert.equal(resources.length, 12, "The installed package should expose all twelve MCP App resources.");

  for (const uri of [
    "ui://centralmacatuba/calendario",
    "ui://centralmacatuba/novidades",
    "ui://centralmacatuba/servicos/docs",
    "ui://centralmacatuba/servicos/jogos",
    "ui://centralmacatuba/servicos/streaming"
  ]) assert.ok(resources.some((resource) => resource.uri === uri), `Missing MCP App resource: ${uri}`);

  const tempoResource = resources.find(({ uri }) => uri === "ui://centralmacatuba/tempo");
  assert.ok(tempoResource, "The Tempo Macatuba MCP App resource should be discoverable.");

  const { contents } = await client.readResource({ uri: tempoResource.uri });
  assert.ok(
    contents.some((content) => content.mimeType === "text/html;profile=mcp-app" && content.text?.includes("data-mcp-app")),
    "The MCP client should be able to read the self-contained Tempo Macatuba app."
  );

  console.log("Installed-package MCP client integration test passed.");
} finally {
  if (connected) await client.close();
}
