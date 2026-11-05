import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("uses the public API and safe local HTTP defaults", () => {
    const config = loadConfig({});
    expect(config.apiBaseUrl).toBe("https://publica.api.centralmacatuba.qzz.io");
    expect(config.httpPort).toBe(3000);
    expect(config.allowedHosts.has("localhost")).toBe(true);
    expect(config.allowedOrigins.size).toBe(0);
  });

  it("normalizes API base URLs", () => {
    const config = loadConfig({ CM_API_BASE_URL: "https://example.test///" });
    expect(config.apiBaseUrl).toBe("https://example.test");
  });

  it("rejects invalid protocols and URL credentials", () => {
    expect(() => loadConfig({ CM_API_BASE_URL: "ftp://example.test" })).toThrow();
    expect(() => loadConfig({ CM_API_BASE_URL: "https://user:pass@example.test" })).toThrow();
  });

  it("rejects invalid timeout and port values", () => {
    expect(() => loadConfig({ CM_API_TIMEOUT_MS: "0" })).toThrow();
    expect(() => loadConfig({ PORT: "-1" })).toThrow();
  });

  it("parses host and origin allowlists", () => {
    const config = loadConfig({
      MCP_ALLOWED_HOSTS: "mcp.example.test, localhost",
      MCP_ALLOWED_ORIGINS: "https://client.example.test"
    });
    expect(config.allowedHosts.has("mcp.example.test")).toBe(true);
    expect(config.allowedOrigins.has("https://client.example.test")).toBe(true);
  });
});
