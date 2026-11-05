#!/usr/bin/env node
import { startHttpServer } from "./http.js";
import { startStdioServer } from "./stdio.js";

const transportIndex = process.argv.indexOf("--transport");
const transport = transportIndex >= 0 ? process.argv[transportIndex + 1] : "stdio";

try {
  if (transport === "stdio") await startStdioServer();
  else if (transport === "http") await startHttpServer();
  else throw new Error("Transporte inválido. Use --transport stdio ou --transport http.");
} catch (error) {
  const message = error instanceof Error ? error.message : "Falha ao iniciar o servidor MCP.";
  console.error(message);
  process.exitCode = 1;
}
