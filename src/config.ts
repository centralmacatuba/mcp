export interface McpConfig {
  apiBaseUrl: string;
  apiTimeoutMs: number;
  httpHost: string;
  httpPort: number;
  allowedHosts: ReadonlySet<string>;
  allowedOrigins: ReadonlySet<string>;
}

/** Parses trimmed, lowercase CSV entries into a set, using fallback when none remain. */
function csvSet(value: string | undefined, fallback: string[]): ReadonlySet<string> {
  const values = value?.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  return new Set(values?.length ? values : fallback);
}

/**
 * Parses an integer from 1 through 2,147,483,647, using fallback for missing or empty input.
 * Throws if a supplied nonempty value is outside that range or is not an integer.
 */
function positiveInteger(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 2_147_483_647) {
    throw new Error(`${name} deve ser um inteiro positivo válido.`);
  }
  return parsed;
}

/**
 * Loads public API and HTTP settings from env, defaulting to process.env.
 * API timeouts are in milliseconds; PORT takes precedence over MCP_HTTP_PORT, even if empty.
 * Host and origin allowlists are trimmed and lowercased; empty lists use their defaults.
 *
 * @throws If the API URL is malformed, is not HTTP(S), or includes credentials,
 * a query, or a fragment, or if a nonempty timeout or port is not an integer
 * from 1 through 2,147,483,647.
 */
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
