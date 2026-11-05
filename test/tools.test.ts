import { describe, expect, it } from "vitest";
import { registeredToolNames } from "../src/tools.js";

describe("public MCP tools", () => {
  it("registers a unique set of read-only public tools", () => {
    expect(registeredToolNames.length).toBeGreaterThan(20);
    expect(new Set(registeredToolNames).size).toBe(registeredToolNames.length);
    expect(registeredToolNames).toContain("jornal.pesquisar");
    expect(registeredToolNames).toContain("jornal.listar");
    expect(registeredToolNames).toContain("jornal.obter");
    expect(registeredToolNames).toContain("informacoes.listar");
    expect(registeredToolNames).toContain("informacoes.obter");
    expect(registeredToolNames).toContain("mapa.filtrar");
    expect(registeredToolNames).toContain("servicos.listar");
    expect(registeredToolNames).toContain("servicos.obter");
    expect(registeredToolNames).toContain("servicos.pesquisar");
    expect(registeredToolNames).toContain("paginas.verificar_id");
    expect(registeredToolNames).toContain("tempo.listar");
    expect(registeredToolNames).toContain("calendario.gerar");
    expect(registeredToolNames).toContain("ping");
    expect(registeredToolNames).not.toContain("newsletter.verificar");
    expect(registeredToolNames).not.toContain("sos.listar");
    expect(registeredToolNames).not.toContain("paginas.verificar");
    expect(registeredToolNames).not.toContain("servicos_wiki.listar");
    expect(registeredToolNames).not.toContain("paginas.listar_dominios");
    expect(registeredToolNames).not.toContain("servicos_wiki.listar");
  });
});
