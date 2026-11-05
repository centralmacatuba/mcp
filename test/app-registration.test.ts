import { beforeEach, describe, expect, it, vi } from "vitest";
import type { McpServer } from "@modelcontextprotocol/server";

const mocks = vi.hoisted(() => ({ readFile: vi.fn(), register: vi.fn() }));
vi.mock("node:fs/promises", () => ({ readFile: mocks.readFile }));
vi.mock("@modelcontextprotocol/ext-apps/server", () => ({
  RESOURCE_MIME_TYPE: "text/html;profile=mcp-app",
  registerAppResource: mocks.register
}));
import { APP_RESOURCES, readAppHtml, registerAppResources } from "../src/apps.js";

const missing = () => Object.assign(new Error("missing"), { code: "ENOENT" });

describe("app resource loading and registration", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("falls back to the other bundle directory only when a file is missing", async () => {
    mocks.readFile.mockRejectedValueOnce(missing()).mockResolvedValueOnce("<html>fallback</html>");
    expect(await readAppHtml("tempo.html")).toBe("<html>fallback</html>");
    expect(mocks.readFile).toHaveBeenCalledTimes(2);
    expect(mocks.readFile.mock.calls[0]?.[0]).toMatch(/\/apps\/tempo\.html$/);
    expect(mocks.readFile.mock.calls[1]?.[0]).toMatch(/\/src\/apps\/tempo\.html$/);
  });

  it("reports a missing bundle with its underlying error", async () => {
    const lastError = missing();
    mocks.readFile.mockRejectedValueOnce(missing()).mockRejectedValueOnce(lastError);
    await expect(readAppHtml("tempo.html")).rejects.toMatchObject({
      message: expect.stringContaining("não encontrado"), cause: lastError
    });
  });

  it("propagates non-missing I/O errors without trying another path", async () => {
    const error = Object.assign(new Error("permission denied"), { code: "EACCES" });
    mocks.readFile.mockRejectedValue(error);
    await expect(readAppHtml("tempo.html")).rejects.toBe(error);
    expect(mocks.readFile).toHaveBeenCalledOnce();
  });

  it("registers each app and returns HTML with its own URI and MIME type", async () => {
    const server = {} as McpServer;
    mocks.readFile.mockResolvedValue("<html>app</html>");
    registerAppResources(server);
    expect(mocks.register).toHaveBeenCalledTimes(APP_RESOURCES.length);
    for (const [index, app] of APP_RESOURCES.entries()) {
      const [registeredServer, name, uri, metadata, handler] = mocks.register.mock.calls[index]!;
      expect([registeredServer, name, uri]).toEqual([server, app.name, app.uri]);
      expect(metadata).toEqual({ description: app.description, mimeType: "text/html;profile=mcp-app" });
      expect(await handler()).toEqual({ contents: [{ uri: app.uri, mimeType: "text/html;profile=mcp-app", text: "<html>app</html>" }] });
      expect(mocks.readFile.mock.calls[index]?.[0]).toMatch(new RegExp(`/${app.file.replace(".", "\\.")}$`));
    }
  });
});
