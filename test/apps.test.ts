import { describe, expect, it } from "vitest";
import { APP_RESOURCES } from "../src/apps.js";

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
});
