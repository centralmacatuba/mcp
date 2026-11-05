import type { McpConfig } from "../src/index.js";

const publicConfigContract: McpConfig = {
  apiBaseUrl: "https://publica.api.centralmacatuba.qzz.io",
  apiTimeoutMs: 20_000,
  httpHost: "0.0.0.0",
  httpPort: 3000,
  allowedHosts: new Set(["localhost"]),
  allowedOrigins: new Set()
};

// Compile-time contract check; intentionally no runtime test.
void publicConfigContract;
