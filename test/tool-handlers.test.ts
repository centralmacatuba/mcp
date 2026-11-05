import { beforeEach, describe, expect, it, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/server";
import type { CentralMacatubaSDK } from "@centralmacatuba/api";
import { registerApiTools, registeredToolNames } from "../src/tools.js";

type ToolResult = {
  isError?: boolean;
  content: Array<{ type: string; text?: string; data?: string; resource?: { blob: string; uri: string; mimeType: string } }>;
  structuredContent?: unknown;
};
type Handler = (args: unknown) => Promise<ToolResult>;

describe("registered API tool handlers", () => {
  const handlers = new Map<string, Handler>();
  const request = vi.fn();

  beforeEach(() => {
    handlers.clear();
    request.mockReset();
    const server = {
      registerTool: (name: string, _config: unknown, handler: Handler) => handlers.set(name, handler)
    } as unknown as McpServer;
    registerApiTools(server, { request } as unknown as CentralMacatubaSDK);
  });

  async function call(name: string, args: unknown = {}) {
    const handler = handlers.get(name);
    if (!handler) throw new Error(`Missing tool: ${name}`);
    return handler(args);
  }

  it("registers every public tool and forwards validated queries with fixed operations", async () => {
    expect([...handlers.keys()]).toEqual(registeredToolNames);
    request.mockResolvedValue({ items: ["example"] });
    const result = await call("servicos.obter", { id: 7, funcao: "tudo", ignored: "value" });
    expect(request).toHaveBeenCalledWith("/api/servicos/verificar", { id: 7, funcao: "uma" });
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify({ items: ["example"] }, null, 2) }],
      structuredContent: { items: ["example"] }
    });
  });

  it.each([
    ["jornal.pesquisar", {}],
    ["servicos.obter", { nome: "  " }],
    ["links.verificar", { funcao: "uma" }],
    ["calendario.gerar", { ano: 10000 }]
  ])("rejects invalid %s arguments without calling the API", async (name, args) => {
    expect(await call(name, args)).toEqual({
      isError: true,
      content: [{ type: "text", text: "Os parâmetros informados não são válidos para esta ferramenta." }]
    });
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    [null, "null"],
    [[1, 2], "[\n  1,\n  2\n]"],
    [42, "42"],
    [undefined, "undefined"]
  ])("wraps a non-object result in structured content", async (value, text) => {
    request.mockResolvedValue(value);
    expect(await call("ping", null)).toEqual({ content: [{ type: "text", text }], structuredContent: { data: value } });
    expect(request).toHaveBeenCalledWith("/", {});
  });

  it("serializes bigint values in text output", async () => {
    request.mockResolvedValue({ count: 12n });
    const result = await call("ping");
    expect(result.content[0]?.text).toBe('{\n  "count": "12"\n}');
  });

  it("bounds serialized output at 100,000 characters", async () => {
    request.mockResolvedValue("x".repeat(99_998));
    expect((await call("ping")).isError).toBeUndefined();
    request.mockResolvedValue("x".repeat(99_999));
    expect(await call("ping")).toEqual({
      isError: true,
      content: [{ type: "text", text: "A resposta excedeu o limite de tamanho permitido para uma ferramenta MCP." }]
    });
  });

  it("converts calendar binary output and rejects unexpected or unsupported files", async () => {
    request.mockResolvedValue(new Blob(["png"], { type: "image/png" }));
    const png = await call("calendario.gerar", { ano: 2026, formato: "png" });
    const data = Buffer.from("png").toString("base64");
    expect(request).toHaveBeenCalledWith("/api/calendario/gerar", { ano: 2026, formato: "png" });
    expect(png.content).toEqual([
      { type: "image", data, mimeType: "image/png" },
      { type: "resource", resource: { uri: "urn:centralmacatuba:calendario:calendario-2026.png", mimeType: "image/png", blob: data } }
    ]);
    expect(await call("ping")).toMatchObject({ isError: true, content: [{ text: expect.stringContaining("não oferece") }] });
    request.mockResolvedValue(new Blob(["x"], { type: "text/plain" }));
    expect(await call("calendario.gerar")).toMatchObject({ isError: true, content: [{ text: "Formato binário de calendário não suportado." }] });
  });

  it.each([
    [{ status: 503, message: "sensitive details" }, " (HTTP 503)"],
    [new Error("sensitive details"), ""],
    [{ status: "503" }, ""]
  ])("returns a sanitized API failure", async (error, status) => {
    request.mockRejectedValue(error);
    expect(await call("ping")).toEqual({
      isError: true,
      content: [{ type: "text", text: `A consulta à API pública falhou${status}. Verifique os parâmetros ou tente novamente mais tarde.` }]
    });
  });
});
