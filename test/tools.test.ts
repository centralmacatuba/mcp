import { describe, expect, it } from "vitest";
import {
  registeredToolDefinitions,
  registeredToolNames,
  registeredToolSchemas
} from "../src/tools.js";

const schema = (name: string) => {
  const value = registeredToolSchemas[name];
  if (!value) throw new Error(`Missing tool schema: ${name}`);
  return value;
};

describe("public MCP tools", () => {
  it("registers unique public tools and preserves compatible names", () => {
    expect(new Set(registeredToolNames).size).toBe(registeredToolNames.length);
    for (const name of [
      "ping", "avisos.verificar", "calendario.verificar", "calendario.gerar",
      "dominios.verificar", "informacoes.listar", "informacoes.obter", "informacoes.pesquisar",
      "jornal.listar", "jornal.obter", "jornal.pesquisar", "links.pesquisar", "links.verificar",
      "mapa.listar", "mapa.filtrar", "mapa.pesquisar", "novidades.pesquisar", "novidades.verificar",
      "paginas.pesquisar", "paginas.verificar", "redicionador.verificar",
      "servicos.listar", "servicos.obter", "servicos.pesquisar",
      "servicos_cursos.pesquisar", "servicos_cursos.verificar",
      "servicos_docs.pesquisar", "servicos_docs.verificar",
      "servicos_jogos.pesquisar", "servicos_jogos.verificar",
      "servicos_streaming.pesquisar", "servicos_streaming.verificar",
      "servicos_streaming.live_verificar", "sos.listar", "tempo.listar"
    ]) expect(registeredToolNames).toContain(name);
  });

  it("does not expose administrative or unsupported operations", () => {
    for (const name of [
      "newsletter.verificar", "paginas.listar_dominios", "paginas.gerenciar",
      "servicos_wiki.listar", "comunicacao.pesquisar", "status.verificar", "tags.verificar"
    ]) expect(registeredToolNames).not.toContain(name);
  });

  it("validates required OpenAPI parameters and enum values", () => {
    expect(schema("jornal.pesquisar").safeParse({ q: "Macatuba" }).success).toBe(true);
    expect(schema("jornal.pesquisar").safeParse({}).success).toBe(false);
    expect(schema("jornal.pesquisar").safeParse({ q: "Macatuba", filtro: "url" }).success).toBe(false);

    expect(schema("informacoes.pesquisar").safeParse({ p: "saúde" }).success).toBe(true);
    expect(schema("informacoes.pesquisar").safeParse({}).success).toBe(false);

    expect(schema("servicos_streaming.pesquisar").safeParse({ tipo: "radio" }).success).toBe(true);
    expect(schema("servicos_streaming.pesquisar").safeParse({ tipo: "music" }).success).toBe(false);

    expect(schema("calendario.verificar").safeParse({ data: "2026-11-05" }).success).toBe(true);
    expect(schema("calendario.verificar").safeParse({ data: "05/11/2026" }).success).toBe(false);

    expect(schema("servicos.pesquisar").safeParse({ termo: "Macatuba".repeat(30) }).success).toBe(false);
  });

  it("preserves optional map filters and validates filter mode", () => {
    expect(schema("mapa.listar").safeParse({}).success).toBe(true);
    expect(schema("mapa.listar").safeParse({ tipo: "praça" }).success).toBe(true);
    expect(schema("mapa.filtrar").safeParse({ tipo: "praça" }).success).toBe(true);
    expect(schema("mapa.filtrar").safeParse({}).success).toBe(false);
  });

  it("requires identifying fields for lookup tools", () => {
    expect(schema("servicos.obter").safeParse({ id: 3 }).success).toBe(true);
    expect(schema("servicos.obter").safeParse({}).success).toBe(false);
    expect(schema("paginas.verificar").safeParse({ id: 12 }).success).toBe(true);
    expect(schema("paginas.verificar").safeParse({}).success).toBe(false);
    expect(schema("sos.listar").safeParse({}).success).toBe(true);
  });

  it("locks list/get/search operations to their intended public query parameters", () => {
    const find = (name: string) => registeredToolDefinitions.find((tool) => tool.name === name);
    expect(find("informacoes.listar")?.fixedQuery).toEqual({ funcao: "tudo" });
    expect(find("informacoes.obter")?.fixedQuery).toEqual({ funcao: "uma" });
    expect(find("jornal.listar")?.fixedQuery).toEqual({ funcao: "todas" });
    expect(find("jornal.obter")?.fixedQuery).toEqual({ funcao: "uma" });
    expect(find("servicos.pesquisar")?.fixedQuery).toEqual({ funcao: "pesquisar" });
    expect(find("sos.listar")?.endpoint).toBe("/api/sos/listar_alertas");
  });
});
