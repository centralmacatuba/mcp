import { describe, expect, it } from "vitest";
import { registeredToolNames } from "../src/tools.js";

describe("public MCP tools", () => {
  it("registers a unique set of read-only public tools", () => {
    expect(registeredToolNames.length).toBeGreaterThan(20);
    expect(new Set(registeredToolNames).size).toBe(registeredToolNames.length);
    expect(registeredToolNames).toContain("jornal.pesquisar");
    expect(registeredToolNames).toContain("tempo.listar");
    expect(registeredToolNames).toContain("ping");
    expect(registeredToolNames).not.toContain("newsletter.verificar");
    expect(registeredToolNames).not.toContain("paginas.listar_dominios");
    expect(registeredToolNames).not.toContain("servicos_wiki.listar");
  });
});
