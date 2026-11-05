export interface McpConfig {
  apiBaseUrl: string;
  apiTimeoutMs: number;
  httpHost: string;
  httpPort: number;
  allowedHosts: ReadonlySet<string>;
  allowedOrigins: ReadonlySet<string>;
}

function csvSet(value: string | undefined, fallback: string[]): ReadonlySet<string> {
  const values = value?.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  return new Set(values?.length ? values : fallback);
}

function positiveInteger(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 2_147_483_647) {
    throw new Error(`${name} deve ser um inteiro positivo válido.`);
  }
  return parsed;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): McpConfig {
  const apiBaseUrl = env.CM_API_BASE_URL ?? "https://publica.api.centralmacatuba.qzz.io";
  const parsedUrl = new URL(apiBaseUrl);
  if (!["https:", "http:"].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) {
    throw new Error("CM_API_BASE_URL deve ser uma URL HTTP(S) válida, sem credenciais, query ou fragmento.");
  }

  return {
    apiBaseUrl: parsedUrl.toString().replace(/\/+$/, ""),
    apiTimeoutMs: positiveInteger(env.CM_API_TIMEOUT_MS, 20_000, "CM_API_TIMEOUT_MS"),
    httpHost: env.MCP_HTTP_HOST ?? "0.0.0.0",
    httpPort: positiveInteger(env.PORT ?? env.MCP_HTTP_PORT, 3000, "PORT/MCP_HTTP_PORT"),
    allowedHosts: csvSet(env.MCP_ALLOWED_HOSTS, ["localhost", "127.0.0.1", "::1"]),
    allowedOrigins: csvSet(env.MCP_ALLOWED_ORIGINS, [])
  };
}
