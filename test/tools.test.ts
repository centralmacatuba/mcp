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
  it("registers a unique set of supported legacy and public tool names", () => {
    expect(registeredToolNames.length).toBeGreaterThan(25);
    expect(new Set(registeredToolNames).size).toBe(registeredToolNames.length);
    for (const name of [
      "ping",
      "jornal.pesquisar",
      "jornal.listar",
      "jornal.obter",
      "informacoes.listar",
      "informacoes.obter",
      "mapa.filtrar",
      "servicos.listar",
      "servicos.obter",
      "servicos.pesquisar",
      "paginas.verificar_id",
      "tempo.listar",
      "calendario.gerar"
    ]) {
      expect(registeredToolNames).toContain(name);
    }
  });

  it("does not expose operations that require private credentials or client-only context", () => {
    for (const name of [
      "sos.listar",
      "newsletter.verificar",
      "paginas.verificar",
      "paginas.listar_dominios",
      "servicos_wiki.listar",
      "comunicacao.pesquisar"
    ]) {
      expect(registeredToolNames).not.toContain(name);
    }
  });

  it("validates required OpenAPI parameters and enum values", () => {
    expect(schema("jornal.pesquisar").safeParse({ query: { q: "Macatuba" } }).success).toBe(true);
    expect(schema("jornal.pesquisar").safeParse({}).success).toBe(false);
    expect(schema("jornal.pesquisar").safeParse({ query: { q: "Macatuba", filtro: "url" } }).success).toBe(false);

    expect(schema("servicos_streaming.pesquisar").safeParse({ query: { tipo: "radio" } }).success).toBe(true);
    expect(schema("servicos_streaming.pesquisar").safeParse({ query: { tipo: "music" } }).success).toBe(false);

    expect(schema("calendario.verificar").safeParse({ query: { data: "2026-11-05" } }).success).toBe(true);
    expect(schema("calendario.verificar").safeParse({ query: { data: "05/11/2026" } }).success).toBe(false);
  });

  it("requires identifying fields for get/filter tools", () => {
    expect(schema("servicos.obter").safeParse({ query: { id: 3 } }).success).toBe(true);
    expect(schema("servicos.obter").safeParse({ query: {} }).success).toBe(false);
    expect(schema("mapa.filtrar").safeParse({ query: { tipo: "praça" } }).success).toBe(true);
    expect(schema("mapa.filtrar").safeParse({ query: {} }).success).toBe(false);
    expect(schema("paginas.verificar_id").safeParse({ query: { id: 12 } }).success).toBe(true);
    expect(schema("paginas.verificar_id").safeParse({}).success).toBe(false);
  });

  it("locks legacy list/get/search behavior to the intended public API functions", () => {
    const find = (name: string) => registeredToolDefinitions.find((tool) => tool.name === name);
    expect(find("informacoes.listar")?.fixedQuery).toEqual({ funcao: "tudo" });
    expect(find("informacoes.obter")?.fixedQuery).toEqual({ funcao: "uma" });
    expect(find("jornal.listar")?.fixedQuery).toEqual({ funcao: "todas" });
    expect(find("jornal.obter")?.fixedQuery).toEqual({ funcao: "uma" });
    expect(find("servicos.pesquisar")?.fixedQuery).toEqual({ funcao: "pesquisar" });
  });
});
