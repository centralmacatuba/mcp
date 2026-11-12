import { describe, expect, it } from "vitest";
import type { McpServer } from "@modelcontextprotocol/server";
import type { CentralMacatubaSDK, PublicEndpoint } from "@centralmacatuba/api";
import { PUBLIC_ENDPOINTS } from "@centralmacatuba/api";
import {
  createCalendarFileContent,
  registerApiTools,
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
    expect(schema("informacoes.pesquisar").safeParse({}).success).toBe(true);
    expect(schema("mapa.pesquisar").safeParse({}).success).toBe(false);
    expect(schema("mapa.pesquisar").safeParse({ q: "" }).success).toBe(false);
    expect(schema("mapa.pesquisar").safeParse({ min_lat: -90, min_lng: -180, max_lat: 90, max_lng: 180, zoom: 22, page: 1, limit: 100 }).success).toBe(true);
    expect(schema("mapa.pesquisar").safeParse({ q: "praça", min_lat: -90 }).success).toBe(false);
    expect(schema("mapa.pesquisar").safeParse({ zoom: 23 }).success).toBe(false);

    expect(schema("servicos_streaming.pesquisar").safeParse({ tipo: "radio" }).success).toBe(true);
    expect(schema("servicos_streaming.pesquisar").safeParse({ tipo: "music" }).success).toBe(false);
    expect(schema("servicos_streaming.pesquisar").safeParse({ tipo: "radio", filtro: "qualidade" }).success).toBe(false);
    expect(schema("servicos_streaming.pesquisar").safeParse({ tipo: "tv", filtro: "qualidade" }).success).toBe(true);

    expect(schema("calendario.verificar").safeParse({ data: "2026-11-05" }).success).toBe(true);
    expect(schema("calendario.verificar").safeParse({ data: "05/11/2026" }).success).toBe(false);
    expect(schema("calendario.gerar").safeParse({ formato: "json" }).success).toBe(true);
    expect(schema("calendario.gerar").safeParse({ formato: "pdf", ano: 2026 }).success).toBe(true);
    expect(schema("calendario.gerar").safeParse({ formato: "png" }).success).toBe(true);
    expect(schema("calendario.gerar").safeParse({ formato: "jpg" }).success).toBe(false);
    expect(schema("calendario.gerar").safeParse({ ano: 0 }).success).toBe(false);

    expect(schema("servicos.pesquisar").safeParse({ q: "Macatuba".repeat(30) }).success).toBe(false);
    expect(schema("servicos.pesquisar").safeParse({ q: "Macatuba", campo: "nome", page: 2, limit: 100 }).success).toBe(true);
    expect(schema("servicos.pesquisar").safeParse({ q: "Macatuba", limit: 101 }).success).toBe(false);
    expect(schema("sos.listar").safeParse({ page: 2, limit: 50, notificacaoAceita: true }).success).toBe(true);
    expect(schema("servicos.listar").safeParse({ page: 1, limit: 100 }).success).toBe(true);
    expect(schema("tempo.listar").safeParse({ source: "observatorio", start: "2026-11-12 10:00:00", end: "2026-11-12", page: 1, limit: 100 }).success).toBe(true);
    expect(schema("tempo.listar").safeParse({ source: "x".repeat(51) }).success).toBe(false);
    expect(schema("tempo.listar").safeParse({ start: "12/11/2026" }).success).toBe(false);
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
    expect(schema("links.verificar").safeParse({ funcao: "pendentes" }).success).toBe(true);
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
    expect(find("servicos.pesquisar")?.endpoint).toBe("/api/servicos/pesquisar");
    expect(find("servicos.listar")?.endpoint).toBe("/api/servicos/pesquisar");
    expect(find("servicos.listar")?.fixedQuery).toBeUndefined();
    expect(find("sos.listar")?.endpoint).toBe("/api/sos/listar_alertas");
    expect(find("sos.listar")?.requestHeaders?.({ notificacaoAceita: true })).toEqual({ "X-CM-SOS-PERMISSION": "granted" });
    expect(find("sos.listar")?.requestHeaders?.({ notificacaoAceita: false })).toBeUndefined();
    expect(find("tempo.listar")?.appUri).toBe("ui://centralmacatuba/tempo");
    expect(find("mapa.listar")?.appUri).toBe("ui://centralmacatuba/mapa");
    expect(find("jornal.listar")?.appUri).toBe("ui://centralmacatuba/jornal");
    expect(find("informacoes.listar")?.appUri).toBe("ui://centralmacatuba/informacoes");
    expect(find("servicos.listar")?.appUri).toBe("ui://centralmacatuba/servicos");
    expect(find("servicos_cursos.verificar")?.appUri).toBe("ui://centralmacatuba/servicos/cursos");
    expect(find("sos.listar")?.appUri).toBe("ui://centralmacatuba/sos");
    expect(find("avisos.verificar")?.appUri).toBe("ui://centralmacatuba/novidades");
    expect(find("calendario.verificar")?.appUri).toBe("ui://centralmacatuba/calendario");
    expect(find("calendario.gerar")?.appUri).toBe("ui://centralmacatuba/calendario");
    expect(find("novidades.pesquisar")?.appUri).toBe("ui://centralmacatuba/novidades");
    expect(find("novidades.verificar")?.appUri).toBe("ui://centralmacatuba/novidades");
    expect(find("servicos_docs.pesquisar")?.appUri).toBe("ui://centralmacatuba/servicos/docs");
    expect(find("servicos_docs.verificar")?.appUri).toBe("ui://centralmacatuba/servicos/docs");
    expect(find("servicos_jogos.pesquisar")?.appUri).toBe("ui://centralmacatuba/servicos/jogos");
    expect(find("servicos_jogos.verificar")?.appUri).toBe("ui://centralmacatuba/servicos/jogos");
    expect(find("servicos_streaming.pesquisar")?.appUri).toBe("ui://centralmacatuba/servicos/streaming");
    expect(find("servicos_streaming.verificar")?.appUri).toBe("ui://centralmacatuba/servicos/streaming");
    expect(find("servicos_streaming.live_verificar")?.appUri).toBe("ui://centralmacatuba/servicos/streaming");
  });
});


describe("calendar binary tool content", () => {
  it("returns PDF as a named embedded MCP resource with its MIME type", async () => {
    const content = await createCalendarFileContent(
      new Blob(["%PDF-test"], { type: "application/pdf" }),
      2026
    );
    expect(content).toHaveLength(1);
    expect(content[0]).toEqual({
      type: "resource",
      resource: {
        uri: "urn:centralmacatuba:calendario:calendario-2026.pdf",
        mimeType: "application/pdf",
        blob: Buffer.from("%PDF-test").toString("base64")
      }
    });
  });

  it("returns PNG as renderable image content and a named embedded resource", async () => {
    const bytes = new Uint8Array([137, 80, 78, 71]);
    const content = await createCalendarFileContent(
      new Blob([bytes], { type: "image/png" }),
      2025
    );
    expect(content).toHaveLength(2);
    expect(content[0]).toMatchObject({ type: "image", mimeType: "image/png" });
    expect(content[1]).toMatchObject({
      type: "resource",
      resource: {
        uri: "urn:centralmacatuba:calendario:calendario-2025.png",
        mimeType: "image/png"
      }
    });
  });

  it("rejects unsupported media types and oversized files", async () => {
    await expect(createCalendarFileContent(new Blob(["x"], { type: "text/plain" })))
      .rejects.toThrow("Formato binário de calendário não suportado.");
    await expect(createCalendarFileContent(
      new Blob([new Uint8Array(8 * 1024 * 1024 + 1)], { type: "application/pdf" })
    )).rejects.toThrow("excedeu o limite");
  });
});


describe("API tool handler integration", () => {
  it("preserves the SDK instance context when invoking a registered tool", async () => {
    const handlers = new Map<string, (args: unknown) => Promise<unknown>>();
    const fakeServer = {
      registerTool(name: string, _config: unknown, handler: (args: unknown) => Promise<unknown>) {
        handlers.set(name, handler);
      }
    } as unknown as McpServer;

    const calls: Array<{ endpoint: PublicEndpoint; query?: Record<string, unknown> }> = [];
    const api = {
      marker: "sdk-instance-context",
      async request(this: { marker: string }, endpoint: PublicEndpoint, query?: Record<string, unknown>) {
        expect(this.marker).toBe("sdk-instance-context");
        if (!query) throw new Error("Expected tool query arguments.");
        calls.push({ endpoint, query });
        return { success: true, endpoint };
      }
    } as unknown as CentralMacatubaSDK;

    registerApiTools(fakeServer, api);
    const handler = handlers.get("calendario.gerar");
    expect(handler).toBeDefined();

    const result = await handler!({ ano: 2026, formato: "pdf" });

    expect(calls).toEqual([{
      endpoint: "/api/calendario/gerar",
      query: { ano: 2026, formato: "pdf" }
    }]);
    expect(result).toMatchObject({
      structuredContent: { success: true, endpoint: "/api/calendario/gerar" }
    });
  });
});
