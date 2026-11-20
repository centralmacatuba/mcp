import { describe, expect, it } from "vitest";
import { APP_RESOURCES, readAppHtml } from "../src/apps.js";

describe("MCP App resources", () => {
  it("registers twelve unique UI resources", () => {
    expect(APP_RESOURCES).toHaveLength(12);
    expect(new Set(APP_RESOURCES.map((app) => app.uri)).size).toBe(12);
    expect(APP_RESOURCES.map((app) => app.uri)).toEqual(expect.arrayContaining([
      "ui://centralmacatuba/tempo",
      "ui://centralmacatuba/servicos",
      "ui://centralmacatuba/mapa",
      "ui://centralmacatuba/jornal",
      "ui://centralmacatuba/informacoes",
      "ui://centralmacatuba/servicos/cursos",
      "ui://centralmacatuba/sos",
      "ui://centralmacatuba/calendario",
      "ui://centralmacatuba/novidades",
      "ui://centralmacatuba/servicos/docs",
      "ui://centralmacatuba/servicos/jogos",
      "ui://centralmacatuba/servicos/streaming"
    ]));
  });

  it("uses the canonical source paths for service apps", () => {
    expect(APP_RESOURCES.filter((app) => app.file.startsWith("servicos/")).map((app) => app.file)).toEqual([
      "servicos/cursos.html",
      "servicos/docs.html",
      "servicos/jogos.html",
      "servicos/streaming.html"
    ]);
    for (const app of APP_RESOURCES.filter((resource) => !resource.file.startsWith("servicos/"))) {
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
