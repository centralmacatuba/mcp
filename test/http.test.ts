import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: {
    httpHost: "127.0.0.1", httpPort: 3000,
    allowedHosts: new Set(["localhost", "::1"]),
    allowedOrigins: new Set(["https://client.example"])
  },
  callback: undefined as undefined | ((request: unknown, response: unknown) => Promise<void>),
  listen: vi.fn(),
  connect: vi.fn(),
  handleRequest: vi.fn(),
  closeTransport: vi.fn(),
  closeMcp: vi.fn(),
  closeHttp: vi.fn(),
  transportOptions: undefined as unknown
}));

vi.mock("node:http", () => ({
  createServer: (callback: typeof mocks.callback) => {
    mocks.callback = callback;
    return {
      once: vi.fn(),
      listen: mocks.listen,
      close: mocks.closeHttp
    };
  }
}));
vi.mock("../src/config.js", () => ({ loadConfig: () => mocks.config }));
vi.mock("../src/server.js", () => ({
  createMcpServer: () => ({ connect: mocks.connect, close: mocks.closeMcp })
}));
vi.mock("@modelcontextprotocol/node", () => ({
  NodeStreamableHTTPServerTransport: class {
    constructor(options: unknown) { mocks.transportOptions = options; }
    handleRequest = mocks.handleRequest;
    close = mocks.closeTransport;
  }
}));

import { startHttpServer } from "../src/http.js";

class Response extends EventEmitter {
  headers: Record<string, string> = {};
  status?: number;
  body: string | undefined;
  headersSent = false;
  writableEnded = false;
  setHeader(name: string, value: string) { this.headers[name] = value; }
  writeHead(status: number, headers: Record<string, string>) {
    this.status = status;
    Object.assign(this.headers, headers);
    this.headersSent = true;
  }
  end(body?: string) { this.body = body; this.writableEnded = true; }
}

describe("HTTP transport request guards", () => {
  let signals: Map<NodeJS.Signals, Array<(signal: NodeJS.Signals) => void>>;
  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.config.allowedHosts = new Set(["localhost", "::1"]);
    mocks.config.allowedOrigins = new Set(["https://client.example"]);
    mocks.listen.mockImplementation((_port, _host, callback) => callback());
    mocks.connect.mockResolvedValue(undefined);
    mocks.handleRequest.mockResolvedValue(undefined);
    mocks.closeTransport.mockResolvedValue(undefined);
    mocks.closeMcp.mockResolvedValue(undefined);
    mocks.closeHttp.mockImplementation((_callback?: (error?: Error) => void) => _callback?.());
    signals = new Map((["SIGINT", "SIGTERM"] as const).map((signal) => [signal, process.listeners(signal)]));
    await startHttpServer();
  });
  afterEach(() => {
    for (const [signal, original] of signals) {
      for (const listener of process.listeners(signal)) {
        if (!original.includes(listener)) process.removeListener(signal, listener);
      }
    }
  });

  async function send(overrides: Record<string, unknown> = {}) {
    const request = { url: "/mcp", method: "POST", headers: { host: "localhost:3000" }, ...overrides };
    const response = new Response();
    if (!mocks.callback) throw new Error("HTTP handler not registered");
    await mocks.callback(request, response);
    return { request, response };
  }

  it("listens on the configured address and rejects other paths before dispatch", async () => {
    expect(mocks.listen).toHaveBeenCalledWith(3000, "127.0.0.1", expect.any(Function));
    const { response } = await send({ url: "/other" });
    expect(response.status).toBe(404);
    expect(JSON.parse(response.body!)).toEqual({ error: "Not found" });
    expect(response.headers).toMatchObject({ "cache-control": "no-store", "content-type": "application/json; charset=utf-8" });
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it.each([undefined, "evil.example", "[invalid"])("rejects missing, unlisted, or malformed Host %s", async (host) => {
    const { response } = await send({ headers: { host } });
    expect(response.status).toBe(421);
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it("rejects unlisted origins and disallowed methods", async () => {
    expect((await send({ headers: { host: "localhost", origin: "https://evil.example" } })).response.status).toBe(403);
    const { response } = await send({ method: "PUT" });
    expect(response.status).toBe(405);
    expect(response.headers.allow).toBe("GET, POST, DELETE");
    expect(mocks.connect).not.toHaveBeenCalled();
  });

  it.each(["GET", "POST", "DELETE"])("dispatches %s with normalized IPv6 host and allowed origin", async (method) => {
    const { request, response } = await send({ url: "/mcp?query=1", method, headers: { host: "[::1]:3000", origin: "HTTPS://CLIENT.EXAMPLE" } });
    expect(mocks.transportOptions).toEqual({ sessionIdGenerator: undefined, maxRequestBodySize: 1_048_576 });
    expect(mocks.connect).toHaveBeenCalledOnce();
    expect(mocks.handleRequest).toHaveBeenCalledWith(request, response);
    response.emit("close");
    response.emit("close");
    expect(mocks.closeTransport).toHaveBeenCalledOnce();
    expect(mocks.closeMcp).toHaveBeenCalledOnce();
  });

  it("handles concurrent requests with isolated transports and servers", async () => {
    const [first, second] = await Promise.all([send(), send()]);
    expect(mocks.connect).toHaveBeenCalledTimes(2);
    expect(mocks.handleRequest).toHaveBeenCalledTimes(2);
    first.response.emit("close");
    second.response.emit("close");
    expect(mocks.closeTransport).toHaveBeenCalledTimes(2);
    expect(mocks.closeMcp).toHaveBeenCalledTimes(2);
  });

  it("accepts any host when the wildcard is configured", async () => {
    mocks.config.allowedHosts = new Set(["*"]);
    await send({ headers: { host: "example.test" } });
    expect(mocks.connect).toHaveBeenCalledOnce();
  });

  it("returns a sanitized error and cleans up when transport handling fails", async () => {
    mocks.handleRequest.mockRejectedValue(new Error("private detail"));
    const { response } = await send();
    expect(response.status).toBe(500);
    expect(JSON.parse(response.body!)).toEqual({ error: "MCP request failed" });
    expect(mocks.closeTransport).toHaveBeenCalledOnce();
    expect(mocks.closeMcp).toHaveBeenCalledOnce();
  });

  it("ends an already-started response when handling fails", async () => {
    mocks.handleRequest.mockImplementation(async (_request, response: Response) => {
      response.writeHead(200, {});
      throw new Error("failed");
    });
    const { response } = await send();
    expect(response.status).toBe(200);
    expect(response.writableEnded).toBe(true);
    expect(response.body).toBeUndefined();
    expect(mocks.closeTransport).toHaveBeenCalledOnce();
    expect(mocks.closeMcp).toHaveBeenCalledOnce();
  });
});


describe("HTTP transport startup and shutdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listen.mockImplementation((_port, _host, callback) => callback());
    mocks.closeHttp.mockImplementation((callback?: (error?: Error) => void) => callback?.());
  });

  it("rejects when the HTTP listener cannot start", async () => {
    const startupError = Object.assign(new Error("address already in use"), { code: "EADDRINUSE" });
    mocks.listen.mockImplementationOnce(() => { throw startupError; });
    await expect(startHttpServer()).rejects.toBe(startupError);
  });

  it.each(["SIGINT", "SIGTERM"] as const)("closes the listener on %s", async (signal) => {
    const originalListeners = process.listeners(signal);
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
    try {
      await startHttpServer();
      const handler = process.listeners(signal).find((listener) => !originalListeners.includes(listener));
      expect(handler).toBeDefined();
      handler?.();
      expect(mocks.closeHttp).toHaveBeenCalledOnce();
      expect(exitSpy).toHaveBeenCalledWith(0);
    } finally {
      for (const listener of process.listeners(signal)) {
        if (!originalListeners.includes(listener)) process.removeListener(signal, listener);
      }
      exitSpy.mockRestore();
    }
  });
});
