import { describe, expect, it } from "vitest";
import { PUBLIC_ENDPOINTS } from "@centralmacatuba/api";
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

  it("uses only endpoints in the public SDK allowlist", () => {
    const allowed = new Set<string>(PUBLIC_ENDPOINTS);
    for (const tool of registeredToolDefinitions) expect(allowed.has(tool.endpoint)).toBe(true);
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

  it("preserves optional map listing filters and requires at least one filter when filtering", () => {
    expect(schema("mapa.listar").safeParse({}).success).toBe(true);
    expect(schema("mapa.listar").safeParse({ tipo: "praça" }).success).toBe(true);
    expect(schema("mapa.filtrar").safeParse({ tipo: "praça" }).success).toBe(true);
    expect(schema("mapa.filtrar").safeParse({ criador: "Central" }).success).toBe(true);
    expect(schema("mapa.filtrar").safeParse({ verificado: "sim" }).success).toBe(true);
    expect(schema("mapa.filtrar").safeParse({}).success).toBe(false);
    expect(schema("mapa.filtrar").safeParse({ tipo: " " }).success).toBe(false);
  });

  it("requires identifying fields for lookup tools", () => {
    expect(schema("servicos.obter").safeParse({ id: 3 }).success).toBe(true);
    expect(schema("servicos.obter").safeParse({ id: -1 }).success).toBe(false);
    expect(schema("servicos.obter").safeParse({}).success).toBe(false);
    expect(schema("servicos_jogos.verificar").safeParse({ slug: "jogo-exemplo" }).success).toBe(true);
    expect(schema("servicos_jogos.verificar").safeParse({}).success).toBe(false);
    expect(schema("servicos_jogos.verificar").safeParse({ id: 0 }).success).toBe(false);
    expect(schema("paginas.verificar").safeParse({ id: 12 }).success).toBe(true);
    expect(schema("paginas.verificar").safeParse({}).success).toBe(false);
    expect(schema("sos.listar").safeParse({}).success).toBe(true);
    expect(schema("links.verificar").safeParse({ funcao: "tudo" }).success).toBe(true);
    expect(schema("links.verificar").safeParse({ funcao: "uma", id: 4 }).success).toBe(true);
    expect(schema("links.verificar").safeParse({ funcao: "uma" }).success).toBe(false);
    expect(schema("links.verificar").safeParse({ funcao: "pendentes" }).success).toBe(false);
    expect(schema("novidades.verificar").safeParse({ funcao: "uma", id: 4 }).success).toBe(true);
    expect(schema("novidades.verificar").safeParse({ funcao: "uma" }).success).toBe(false);
    expect(schema("servicos_streaming.verificar").safeParse({ tipo: "radio", funcao: "uma", id: 4 }).success).toBe(true);
    expect(schema("servicos_streaming.verificar").safeParse({ tipo: "radio", funcao: "uma" }).success).toBe(false);
  });

  it("locks list/get/search operations to their intended public query parameters", () => {
    const find = (name: string) => registeredToolDefinitions.find((tool) => tool.name === name);
    expect(find("informacoes.listar")?.fixedQuery).toEqual({ funcao: "tudo" });
    expect(find("informacoes.obter")?.fixedQuery).toEqual({ funcao: "uma" });
    expect(find("jornal.listar")?.fixedQuery).toEqual({ funcao: "todas" });
    expect(find("jornal.obter")?.fixedQuery).toEqual({ funcao: "uma" });
    expect(find("servicos.pesquisar")?.fixedQuery).toEqual({ funcao: "pesquisar" });
    expect(find("sos.listar")?.endpoint).toBe("/api/sos/listar_alertas");
    expect(find("tempo.listar")?.appUri).toBe("ui://centralmacatuba/tempo");
    expect(find("mapa.listar")?.appUri).toBe("ui://centralmacatuba/mapa");
    expect(find("jornal.listar")?.appUri).toBe("ui://centralmacatuba/jornal");
    expect(find("informacoes.listar")?.appUri).toBe("ui://centralmacatuba/informacoes");
    expect(find("servicos.listar")?.appUri).toBe("ui://centralmacatuba/servicos");
    expect(find("servicos_cursos.verificar")?.appUri).toBe("ui://centralmacatuba/cursos");
    expect(find("sos.listar")?.appUri).toBe("ui://centralmacatuba/sos");
  });
});
