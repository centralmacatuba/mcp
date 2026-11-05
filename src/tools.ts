import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CentralMacatubaSDK, PUBLIC_ENDPOINTS } from "@centralmacatuba/api";

const queryValue = z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number(), z.boolean()]))]);
const querySchema = z.record(z.string(), queryValue);

interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  endpoint: (typeof PUBLIC_ENDPOINTS)[number];
  query?: boolean;
}

const tools: ToolDefinition[] = [
  { name: "health_verificar", title: "Verificar disponibilidade", description: "Verifica a disponibilidade do gateway público da Central Macatuba.", endpoint: "/" },
  { name: "avisos_verificar", title: "Consultar avisos", description: "Consulta avisos ativos publicados pela Central Macatuba.", endpoint: "/api/avisos/verificar" },
  { name: "calendario_verificar", title: "Consultar calendário", description: "Consulta os dados públicos do calendário da Central Macatuba.", endpoint: "/api/calendario/verificar", query: true },
  { name: "dominios_verificar", title: "Verificar domínios", description: "Consulta informações públicas de domínios disponibilizadas pela API.", endpoint: "/api/dominios/verificar", query: true },
  { name: "informacoes_pesquisar", title: "Pesquisar informações", description: "Pesquisa informações públicas da Central Macatuba. Informe os parâmetros de pesquisa aceitos pela API.", endpoint: "/api/informacoes/pesquisar", query: true },
  { name: "informacoes_verificar", title: "Verificar informações", description: "Consulta o estado do serviço público de informações.", endpoint: "/api/informacoes/verificar", query: true },
  { name: "jornal_pesquisar", title: "Pesquisar no Jornal", description: "Pesquisa publicações no Jornal Macatuba. Use q para o termo de pesquisa e os filtros documentados pela API.", endpoint: "/api/jornal/pesquisar", query: true },
  { name: "jornal_verificar", title: "Verificar Jornal", description: "Consulta o estado do serviço Jornal Macatuba.", endpoint: "/api/jornal/verificar", query: true },
  { name: "links_pesquisar", title: "Pesquisar links", description: "Pesquisa links públicos catalogados pela Central Macatuba.", endpoint: "/api/links/pesquisar", query: true },
  { name: "links_verificar", title: "Verificar links", description: "Consulta o estado do catálogo público de links.", endpoint: "/api/links/verificar", query: true },
  { name: "mapa_pesquisar", title: "Pesquisar no mapa", description: "Pesquisa locais e informações disponíveis no Mapa Macatuba.", endpoint: "/api/mapa/pesquisar", query: true },
  { name: "mapa_verificar", title: "Verificar mapa", description: "Consulta o estado do serviço Mapa Macatuba.", endpoint: "/api/mapa/verificar", query: true },
  { name: "novidades_pesquisar", title: "Pesquisar novidades", description: "Pesquisa novidades publicadas na Central Macatuba.", endpoint: "/api/novidades/pesquisar", query: true },
  { name: "novidades_verificar", title: "Verificar novidades", description: "Consulta o estado do serviço de novidades.", endpoint: "/api/novidades/verificar", query: true },
  { name: "paginas_pesquisar", title: "Pesquisar páginas", description: "Pesquisa páginas públicas catalogadas pela Central Macatuba.", endpoint: "/api/paginas/pesquisar", query: true },
  { name: "paginas_verificar", title: "Verificar páginas", description: "Consulta o estado do catálogo de páginas.", endpoint: "/api/paginas/verificar", query: true },
  { name: "redicionador_verificar", title: "Verificar redirecionador", description: "Consulta informações públicas do serviço de redirecionamento.", endpoint: "/api/redicionador/verificar", query: true },
  { name: "servicos_verificar", title: "Verificar serviços", description: "Consulta o catálogo de Serviços Macatuba.", endpoint: "/api/servicos/verificar", query: true },
  { name: "cursos_pesquisar", title: "Pesquisar cursos", description: "Pesquisa cursos publicados no catálogo de serviços.", endpoint: "/api/servicos/cursos/pesquisar", query: true },
  { name: "cursos_verificar", title: "Verificar cursos", description: "Consulta o estado do catálogo de cursos.", endpoint: "/api/servicos/cursos/verificar", query: true },
  { name: "docs_pesquisar", title: "Pesquisar documentação", description: "Pesquisa documentação no catálogo de serviços.", endpoint: "/api/servicos/docs/pesquisar", query: true },
  { name: "docs_verificar", title: "Verificar documentação", description: "Consulta o estado do catálogo de documentação.", endpoint: "/api/servicos/docs/verificar", query: true },
  { name: "jogos_pesquisar", title: "Pesquisar jogos", description: "Pesquisa jogos no catálogo de serviços.", endpoint: "/api/servicos/jogos/pesquisar", query: true },
  { name: "jogos_verificar", title: "Verificar jogos", description: "Consulta o estado do catálogo de jogos.", endpoint: "/api/servicos/jogos/verificar", query: true },
  { name: "streaming_pesquisar", title: "Pesquisar streaming", description: "Pesquisa conteúdos e serviços no catálogo de streaming.", endpoint: "/api/servicos/streaming/pesquisar", query: true },
  { name: "streaming_verificar", title: "Verificar streaming", description: "Consulta o estado do catálogo de streaming.", endpoint: "/api/servicos/streaming/verificar", query: true },
  { name: "streaming_live_verificar", title: "Verificar streaming ao vivo", description: "Consulta o estado público do serviço de streaming ao vivo.", endpoint: "/api/servicos/streaming/live/verificar", query: true },
  { name: "sos_listar_alertas", title: "Listar alertas SOS", description: "Lista alertas disponibilizados pelo serviço SOS público. O acesso depende das permissões/cookies públicos definidos pelo serviço.", endpoint: "/api/sos/listar_alertas", query: true },
  { name: "tempo_verificar", title: "Consultar Tempo Macatuba", description: "Consulta informações meteorológicas disponibilizadas pelo Tempo Macatuba.", endpoint: "/api/tempo/verificar", query: true }
];

function jsonText(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => {
    if (typeof item === "bigint") return item.toString();
    return item;
  }, 2);
}

export function registerApiTools(server: McpServer, api: CentralMacatubaSDK): void {
  for (const definition of tools) {
    const inputSchema = definition.query
      ? { query: querySchema.optional().describe("Parâmetros de consulta documentados para este endpoint. Não inclua URLs nem caminhos.") }
      : {};

    server.registerTool(definition.name, {
      title: definition.title,
      description: definition.description,
      inputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
    }, async (args: { query?: Record<string, string | number | boolean | Array<string | number | boolean>> }) => {
      try {
        const result = await api.request(definition.endpoint, args.query ?? {});
        if (result instanceof Blob) {
          return {
            isError: true,
            content: [{ type: "text", text: "Este endpoint retorna um arquivo binário. A disponibilização de arquivos por MCP será definida em uma etapa específica." }]
          };
        }
        return { content: [{ type: "text", text: jsonText(result) }] };
      } catch (error) {
        const status = typeof error === "object" && error !== null && "status" in error
          ? (error as { status?: unknown }).status
          : undefined;
        const statusText = typeof status === "number" ? ` (HTTP ${status})` : "";
        return {
          isError: true,
          content: [{ type: "text", text: `A consulta à API pública falhou${statusText}. Verifique os parâmetros ou tente novamente mais tarde.` }]
        };
      }
    });
  }
}

export const registeredToolNames = tools.map(({ name }) => name);
