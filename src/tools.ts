import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CentralMacatubaSDK, PUBLIC_ENDPOINTS } from "@centralmacatuba/api";

const queryValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.union([z.string(), z.number(), z.boolean()]))
]);
const querySchema = z.record(z.string(), queryValue);

interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  endpoint: (typeof PUBLIC_ENDPOINTS)[number];
  query?: boolean;
}

const tools: ToolDefinition[] = [
  { name: "ping", title: "Verificar disponibilidade", description: "Verifica a disponibilidade do gateway público da Central Macatuba.", endpoint: "/" },
  { name: "avisos.verificar", title: "Consultar avisos", description: "Consulta avisos ativos publicados pela Central Macatuba.", endpoint: "/api/avisos/verificar" },
  { name: "calendario.verificar", title: "Consultar calendário", description: "Consulta os dados públicos do calendário da Central Macatuba.", endpoint: "/api/calendario/verificar", query: true },
  { name: "dominios.verificar", title: "Verificar domínios", description: "Consulta informações públicas de domínios disponibilizadas pela API.", endpoint: "/api/dominios/verificar", query: true },
  { name: "informacoes.pesquisar", title: "Pesquisar informações", description: "Pesquisa informações públicas. Informe os parâmetros aceitos pela API, como p e filtro.", endpoint: "/api/informacoes/pesquisar", query: true },
  { name: "informacoes.verificar", title: "Verificar informações", description: "Consulta o estado do serviço público de informações.", endpoint: "/api/informacoes/verificar", query: true },
  { name: "jornal.pesquisar", title: "Pesquisar no Jornal", description: "Pesquisa publicações no Jornal Macatuba. Use q para o termo e filtro para restringir o campo.", endpoint: "/api/jornal/pesquisar", query: true },
  { name: "jornal.verificar", title: "Verificar Jornal", description: "Consulta o estado do serviço Jornal Macatuba.", endpoint: "/api/jornal/verificar", query: true },
  { name: "links.pesquisar", title: "Pesquisar links", description: "Pesquisa links públicos catalogados pela Central Macatuba.", endpoint: "/api/links/pesquisar", query: true },
  { name: "links.verificar", title: "Verificar links", description: "Consulta o estado do catálogo público de links.", endpoint: "/api/links/verificar", query: true },
  { name: "mapa.pesquisar", title: "Pesquisar no mapa", description: "Pesquisa locais e informações disponíveis no Mapa Macatuba.", endpoint: "/api/mapa/pesquisar", query: true },
  { name: "mapa.verificar", title: "Verificar mapa", description: "Consulta o estado do serviço Mapa Macatuba.", endpoint: "/api/mapa/verificar", query: true },
  { name: "novidades.pesquisar", title: "Pesquisar novidades", description: "Pesquisa novidades publicadas na Central Macatuba.", endpoint: "/api/novidades/pesquisar", query: true },
  { name: "novidades.verificar", title: "Verificar novidades", description: "Consulta o estado do serviço de novidades.", endpoint: "/api/novidades/verificar", query: true },
  { name: "paginas.pesquisar", title: "Pesquisar páginas", description: "Pesquisa páginas públicas catalogadas pela Central Macatuba.", endpoint: "/api/paginas/pesquisar", query: true },
  { name: "paginas.verificar", title: "Verificar páginas", description: "Consulta o contexto público do catálogo de páginas.", endpoint: "/api/paginas/verificar", query: true },
  { name: "redicionador.verificar", title: "Verificar redirecionador", description: "Consulta informações públicas do serviço de redirecionamento.", endpoint: "/api/redicionador/verificar", query: true },
  { name: "servicos.verificar", title: "Verificar serviços", description: "Consulta o catálogo público de Serviços Macatuba.", endpoint: "/api/servicos/verificar", query: true },
  { name: "servicos_cursos.pesquisar", title: "Pesquisar cursos", description: "Pesquisa cursos publicados no catálogo de serviços.", endpoint: "/api/servicos/cursos/pesquisar", query: true },
  { name: "servicos_cursos.verificar", title: "Verificar cursos", description: "Consulta o estado do catálogo de cursos.", endpoint: "/api/servicos/cursos/verificar", query: true },
  { name: "servicos_docs.pesquisar", title: "Pesquisar documentação", description: "Pesquisa documentação no catálogo de serviços.", endpoint: "/api/servicos/docs/pesquisar", query: true },
  { name: "servicos_docs.verificar", title: "Verificar documentação", description: "Consulta o estado do catálogo de documentação.", endpoint: "/api/servicos/docs/verificar", query: true },
  { name: "servicos_jogos.pesquisar", title: "Pesquisar jogos", description: "Pesquisa jogos no catálogo de serviços.", endpoint: "/api/servicos/jogos/pesquisar", query: true },
  { name: "servicos_jogos.verificar", title: "Verificar jogos", description: "Consulta o estado do catálogo de jogos.", endpoint: "/api/servicos/jogos/verificar", query: true },
  { name: "servicos_streaming.pesquisar", title: "Pesquisar streaming", description: "Pesquisa conteúdos e serviços no catálogo de streaming.", endpoint: "/api/servicos/streaming/pesquisar", query: true },
  { name: "servicos_streaming.verificar", title: "Verificar streaming", description: "Consulta o estado do catálogo de streaming.", endpoint: "/api/servicos/streaming/verificar", query: true },
  { name: "servicos_streaming_live.verificar", title: "Verificar streaming ao vivo", description: "Consulta o estado público do serviço de streaming ao vivo.", endpoint: "/api/servicos/streaming/live/verificar", query: true },
  { name: "sos.listar", title: "Listar alertas SOS", description: "Lista alertas disponibilizados pelo serviço SOS público, conforme as permissões do endpoint.", endpoint: "/api/sos/listar_alertas" },
  { name: "tempo.listar", title: "Consultar Tempo Macatuba", description: "Consulta informações meteorológicas disponibilizadas pelo Tempo Macatuba. Parâmetros opcionais aceitos pelo serviço podem ser enviados em query.", endpoint: "/api/tempo/verificar", query: true }
];

function jsonText(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => typeof item === "bigint" ? item.toString() : item, 2);
}

export function registerApiTools(server: McpServer, api: CentralMacatubaSDK): void {
  for (const definition of tools) {
    const inputSchema = definition.query
      ? { query: querySchema.optional().describe("Parâmetros de consulta aceitos pelo endpoint público. Não inclua URLs, caminhos ou cabeçalhos.") }
      : {};

    server.registerTool(definition.name, {
      title: definition.title,
      description: definition.description,
      inputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
    }, async (args) => {
      try {
        // A rota é selecionada exclusivamente pela tabela estática acima.
        // O SDK também verifica sua própria allowlist antes de enviar a chamada.
        const request = api.request as unknown as (
          endpoint: (typeof PUBLIC_ENDPOINTS)[number],
          query?: Record<string, string | number | boolean | Array<string | number | boolean>>
        ) => Promise<unknown>;
        const query = "query" in args ? args.query : undefined;
        const result = await request(definition.endpoint, query ?? {});
        if (result instanceof Blob) {
          return {
            isError: true,
            content: [{ type: "text", text: "Este endpoint retorna um arquivo binário. A disponibilização de arquivos por MCP será implementada após definir o contrato de recursos." }]
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
