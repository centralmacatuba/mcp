import { CentralMacatubaSDK } from "@centralmacatuba/api";
import { loadConfig } from "./config.js";

const config = loadConfig();

/** Creates the public API SDK client using the validated process configuration. */
export function createApiClient() {
  return new CentralMacatubaSDK({
    baseUrl: config.apiBaseUrl,
    timeoutMs: config.apiTimeoutMs
  });
}
