import { expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ serveStdio: vi.fn(), createMcpServer: vi.fn() }));
vi.mock("@modelcontextprotocol/server/stdio", () => ({ serveStdio: mocks.serveStdio }));
vi.mock("../src/server.js", () => ({ createMcpServer: mocks.createMcpServer }));
import { startStdioServer } from "../src/stdio.js";

it("supplies a fresh MCP server factory to the STDIO transport", async () => {
  const server = {};
  mocks.createMcpServer.mockReturnValue(server);
  mocks.serveStdio.mockResolvedValue(undefined);
  await startStdioServer();
  expect(mocks.serveStdio).toHaveBeenCalledOnce();
  expect(mocks.createMcpServer).not.toHaveBeenCalled();
  const factory = mocks.serveStdio.mock.calls[0]![0];
  expect(factory()).toBe(server);
  expect(mocks.createMcpServer).toHaveBeenCalledOnce();
});

it("propagates transport startup failures", async () => {
  const error = new Error("transport failed");
  mocks.serveStdio.mockRejectedValueOnce(error);
  await expect(startStdioServer()).rejects.toBe(error);
});
