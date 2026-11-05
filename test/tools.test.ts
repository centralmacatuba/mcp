import { describe, expect, it } from "vitest";
import { registeredToolNames } from "../src/tools.js";

describe("public MCP tools", () => {
  it("registers a unique set of public, read-only tool names", () => {
    expect(registeredToolNames.length).toBeGreaterThan(20);
    expect(new Set(registeredToolNames).size).toBe(registeredToolNames.length);
    expect(registeredToolNames).toContain("jornal_pesquisar");
    expect(registeredToolNames).toContain("tempo_verificar");
    expect(registeredToolNames).not.toContain("newsletter_verificar");
    expect(registeredToolNames).not.toContain("paginas_listar_dominios");
  });
});
