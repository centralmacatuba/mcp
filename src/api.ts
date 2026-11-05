import { CentralMacatubaSDK } from "@centralmacatuba/api";
import { loadConfig } from "./config.js";

const config = loadConfig();

export function createApiClient() {
  return new CentralMacatubaSDK({
    baseUrl: config.apiBaseUrl,
    timeoutMs: config.apiTimeoutMs
  });
}
