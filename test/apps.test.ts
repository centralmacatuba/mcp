import { describe, expect, it } from "vitest";
import { APP_RESOURCES, readAppHtml } from "../src/apps.js";

describe("MCP App resources", () => {
  it("registers seven unique UI resources", () => {
    expect(APP_RESOURCES).toHaveLength(7);
    expect(new Set(APP_RESOURCES.map((app) => app.uri)).size).toBe(7);
    expect(APP_RESOURCES.map((app) => app.uri)).toEqual(expect.arrayContaining([
      "ui://centralmacatuba/tempo",
      "ui://centralmacatuba/servicos",
      "ui://centralmacatuba/mapa",
      "ui://centralmacatuba/jornal",
      "ui://centralmacatuba/informacoes",
      "ui://centralmacatuba/cursos",
      "ui://centralmacatuba/sos"
    ]));
  });

  it("uses only local standalone HTML resources", () => {
    for (const app of APP_RESOURCES) {
      expect(app.file).toMatch(/^[a-z]+\.html$/);
    }
  });

  it("loads the compiled standalone HTML for MCP App resources in development", async () => {
    for (const app of APP_RESOURCES) {
      const html = await readAppHtml(app.file);
      expect(html).toContain("<html");
      expect(html).toContain("</html>");
      expect(html).toContain("data-mcp-app");
      expect(html).not.toContain("/src/catalog.ts");
    }
  });

  it("rejects file names outside the registered resource allowlist", async () => {
    await expect(readAppHtml("../README.md")).rejects.toThrow(/não pertence à lista/);
  });

});
