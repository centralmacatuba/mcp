import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/server";
import { registerAppResource, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";

export const TEMPO_APP_URI = "ui://centralmacatuba/tempo.html";

export function registerTempoAppResource(server: McpServer): void {
  registerAppResource(
    server,
    "Tempo Macatuba",
    TEMPO_APP_URI,
    {
      description: "Painel interativo para visualizar a resposta do serviço Tempo Macatuba.",
      mimeType: RESOURCE_MIME_TYPE
    },
    async () => {
      const htmlPath = fileURLToPath(new URL("./apps/tempo.html", import.meta.url));
      const html = await readFile(htmlPath, "utf8");
      return {
        contents: [{
          uri: TEMPO_APP_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: html
        }]
      };
    }
  );
}
