import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { McpServer } from "@modelcontextprotocol/server";
import { registerAppResource, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";

export const APP_RESOURCES = [
  { name: "Tempo Macatuba", uri: "ui://centralmacatuba/tempo", file: "tempo.html", description: "Painel interativo de dados climáticos." },
  { name: "Serviços Macatuba", uri: "ui://centralmacatuba/servicos", file: "servicos.html", description: "Catálogo interativo de serviços públicos." },
  { name: "Mapa Macatuba", uri: "ui://centralmacatuba/mapa", file: "mapa.html", description: "Consulta interativa de pontos e locais." },
  { name: "Jornal Macatuba", uri: "ui://centralmacatuba/jornal", file: "jornal.html", description: "Leitura das notícias publicadas." },
  { name: "Informações Macatuba", uri: "ui://centralmacatuba/informacoes", file: "informacoes.html", description: "Consulta de informações públicas." },
  { name: "Cursos - Serviços Macatuba", uri: "ui://centralmacatuba/cursos", file: "cursos.html", description: "Consulta de cursos e conteúdos educacionais." },
  { name: "SOS Macatuba", uri: "ui://centralmacatuba/sos", file: "sos.html", description: "Consulta informativa de alertas e orientações públicas." }
] as const;

export type AppResourceUri = (typeof APP_RESOURCES)[number]["uri"];

/**
 * Reads an MCP App bundle from the source tree during development or dist/apps after build.
 * Only missing-file errors trigger the fallback; permission and I/O errors remain visible.
 */
export async function readAppHtml(file: string): Promise<string> {
  if (!APP_RESOURCES.some((resource) => resource.file === file)) {
    throw new Error(`MCP App HTML "${file}" não pertence à lista de recursos permitidos.`);
  }
  const isBuilt = fileURLToPath(import.meta.url).split(/[\\/]/).includes("dist");
  const relativePaths = isBuilt ? [`./apps/${file}`, `../apps/${file}`] : [`../apps/${file}`, `./apps/${file}`];
  let missingError: NodeJS.ErrnoException | undefined;

  for (const relativePath of relativePaths) {
    const path = fileURLToPath(new URL(relativePath, import.meta.url));
    try {
      return await readFile(path, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      missingError = error as NodeJS.ErrnoException;
    }
  }

  throw new Error(`MCP App HTML "${file}" não encontrado nos diretórios de origem nem de build.`, { cause: missingError });
}

export function registerAppResources(server: McpServer): void {
  for (const resource of APP_RESOURCES) {
    registerAppResource(
      server,
      resource.name,
      resource.uri,
      { description: resource.description, mimeType: RESOURCE_MIME_TYPE },
      async () => {
        const html = await readAppHtml(resource.file);
        return { contents: [{ uri: resource.uri, mimeType: RESOURCE_MIME_TYPE, text: html }] };
      }
    );
  }
}
