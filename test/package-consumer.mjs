import assert from "node:assert/strict";
import * as entry from "../dist/index.js";
import * as http from "../dist/http.js";
import * as stdio from "../dist/stdio.js";
import { readFileSync } from "node:fs";
const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const expected = [
  "createMcpServer",
  "registerApiTools",
  "registeredToolNames",
  "startHttpServer",
  "startStdioServer",
  "loadConfig"
];

for (const name of expected) {
  assert.ok(name in entry, `Public entry point is missing export: ${name}`);
}

assert.equal(typeof http.startHttpServer, "function");
assert.equal(typeof stdio.startStdioServer, "function");
assert.ok(packageJson.exports["./http"]);
assert.ok(packageJson.exports["./stdio"]);
assert.ok(packageJson.bin["centralmacatuba-mcp"]);
assert.ok(entry.registeredToolNames.length > 0);

console.log("Package consumer smoke test passed.");
