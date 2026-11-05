import type { McpServer } from "@modelcontextprotocol/server";
import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import * as z from "zod/v4";
import type { AppResourceUri } from "./apps.js";
import type { CentralMacatubaSDK, PublicEndpoint } from "@centralmacatuba/api";

const text = z.string().max(2048);
const positiveId = z.number().int().positive();
const MAX_TOOL_OUTPUT_CHARS = 100_000;
type ToolQuery = Record<string, string | number | boolean | Array<string | number | boolean>>;

const queryInput = (schema: z.ZodType<any>) => schema as z.ZodObject<any>;
const noInput = z.object({});

const infoByIdOrName = queryInput(z.object({
  id: z.number().int().optional(),
  nome: text.optional()
}).refine((value) => value.id !== undefined || Boolean(value.nome?.trim()), "Informe id ou nome."));
const searchInfo = queryInput(z.object({
  p: text.min(1),
  filtro: z.enum(["nome", "tipo", "bairro", "zona"]).optional()
}));
const mapList = queryInput(z.object({
  tipo: text.optional(),
  criador: text.optional(),
  verificado: text.optional()
}));
const searchJournal = queryInput(z.object({
  q: text.min(1),
  filtro: z.enum(["criador", "titulo", "subtitulo", "conteudo", "tudo"]).optional()
}));
const journalById = queryInput(z.object({ id: positiveId }));
const searchMap = queryInput(z.object({
  q: text.min(1),
  filtro: z.enum(["nome", "tipo", "criador", "descricao", "tudo"]).optional()
}));
const filterMap = queryInput(z.object({
  tipo: text.optional(),
  criador: text.optional(),
  verificado: text.optional()
}).refine((value) => Object.values(value).some((item) => item !== undefined && item !== ""), "Informe ao menos um filtro."));
const searchLinks = queryInput(z.object({ termo: text.optional() }));
const verifyLinks = queryInput(z.object({
  funcao: z.enum(["tudo", "uma", "pendentes"]).optional(),
  id: positiveId.optional()
}));
const verifyItems = queryInput(z.object({
  funcao: z.enum(["tudo", "uma"]).optional(),
  id: z.number().int().optional()
}));
const searchCourses = queryInput(z.object({
  q: text.optional(),
  categoria: text.optional(),
  nivel: text.optional(),
  campo: z.enum(["titulo", "descricao", "conteudo", "todos"]).optional()
}));
const verifyCourses = queryInput(z.object({
  categoria: text.optional(),
  slug: text.optional()
}));
const searchDocs = queryInput(z.object({
  categoria: text.optional(),
  q: text.optional(),
  campo: z.enum(["nome", "descricao", "conteudo", "data_criacao", "data_atualizacao", "todos"]).optional()
}));
const verifyDocs = queryInput(z.object({ slug: text.min(1) }));
const searchGames = queryInput(z.object({
  q: text.optional(),
  campo: z.enum(["tudo", "titulo", "slug", "descricao_curta", "descricao_longa"]).optional()
}));
const verifyGames = queryInput(z.object({
  id: z.number().int().optional(),
  nome: text.optional(),
  slug: text.optional()
}));
const streamingTypes = ["radio", "tv", "vod", "camera", "podcast"] as const;
const searchStreaming = queryInput(z.object({
  tipo: z.enum(streamingTypes),
  p: text.optional(),
  filtro: z.enum(["nome", "descricao_curta", "descricao_longa", "tipo", "categoria", "qualidade", "classificacao", "tipo_stream", "tudo"]).optional()
}));
const verifyStreaming = queryInput(z.object({
  tipo: z.enum(streamingTypes),
  funcao: z.enum(["tudo", "uma"]).optional(),
  id: positiveId.optional()
}));
const serviceByIdOrName = queryInput(z.object({
  id: z.number().int().optional(),
  nome: text.optional()
}).refine((value) => value.id !== undefined || Boolean(value.nome?.trim()), "Informe id ou nome."));

interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  endpoint: PublicEndpoint;
  inputSchema: z.ZodObject<any>;
  fixedQuery?: ToolQuery;
  appUri?: AppResourceUri;
}

const tools: ToolDefinition[] = [
  { name: "ping", title: "Verificar disponibilidade", description: "Verifica a disponibilidade do gateway público da Central Macatuba.", endpoint: "/", inputSchema: noInput },
  { name: "avisos.verificar", title: "Consultar avisos", description: "Consulta avisos ativos publicados pela Central Macatuba.", endpoint: "/api/avisos/verificar", inputSchema: noInput },
  { name: "calendario.verificar", title: "Consultar calendário", description: "Consulta o calendário público. data, quando informada, deve usar AAAA-MM-DD.", endpoint: "/api/calendario/verificar", inputSchema: queryInput(z.object({ data: text.regex(/^\d{4}-\d{2}-\d{2}$/).optional() })) },
  { name: "calendario.gerar", title: "Gerar calendário em JSON", description: "Gera os dados JSON do calendário. PDF e PNG não são disponibilizados por esta ferramenta.", endpoint: "/api/calendario/gerar", inputSchema: queryInput(z.object({ ano: z.number().int().min(1).max(9999).optional(), formato: z.literal("json").optional() })) },
  { name: "dominios.verificar", title: "Verificar domínios", description: "Consulta informações públicas de domínios disponibilizadas pela API.", endpoint: "/api/dominios/verificar", inputSchema: noInput },
  { name: "informacoes.listar", appUri: "ui://centralmacatuba/informacoes", title: "Listar informações", description: "Lista as informações públicas cadastradas.", endpoint: "/api/informacoes/verificar", inputSchema: noInput, fixedQuery: { funcao: "tudo" } },
  { name: "informacoes.obter", title: "Obter informação", description: "Obtém uma informação pública por id ou nome; informe pelo menos um deles.", endpoint: "/api/informacoes/verificar", inputSchema: infoByIdOrName, fixedQuery: { funcao: "uma" } },
  { name: "informacoes.pesquisar", title: "Pesquisar informações", description: "Pesquisa informações públicas por p e filtro (nome, tipo, bairro ou zona).", endpoint: "/api/informacoes/pesquisar", inputSchema: searchInfo },
  { name: "jornal.listar", appUri: "ui://centralmacatuba/jornal", title: "Listar notícias", description: "Lista as notícias públicas do Jornal Macatuba.", endpoint: "/api/jornal/verificar", inputSchema: noInput, fixedQuery: { funcao: "todas" } },
  { name: "jornal.obter", title: "Obter notícia", description: "Obtém uma notícia pública pelo ID.", endpoint: "/api/jornal/verificar", inputSchema: journalById, fixedQuery: { funcao: "uma" } },
  { name: "jornal.pesquisar", title: "Pesquisar no Jornal", description: "Pesquisa publicações no Jornal Macatuba. q é obrigatório; filtro restringe o campo pesquisado.", endpoint: "/api/jornal/pesquisar", inputSchema: searchJournal },
  { name: "links.pesquisar", title: "Pesquisar links", description: "Pesquisa links públicos catalogados pela Central Macatuba pelo termo informado.", endpoint: "/api/links/pesquisar", inputSchema: searchLinks },
  { name: "links.verificar", title: "Verificar links", description: "Consulta o catálogo de links, podendo filtrar por função e id.", endpoint: "/api/links/verificar", inputSchema: verifyLinks },
  { name: "mapa.listar", appUri: "ui://centralmacatuba/mapa", title: "Listar pontos do mapa", description: "Lista pontos e locais do Mapa Macatuba; aceita filtros opcionais por tipo, criador e verificação.", endpoint: "/api/mapa/verificar", inputSchema: mapList },
  { name: "mapa.filtrar", title: "Filtrar pontos do mapa", description: "Filtra pontos do mapa por tipo, criador ou estado de verificação. Informe ao menos um filtro.", endpoint: "/api/mapa/verificar", inputSchema: filterMap },
  { name: "mapa.pesquisar", title: "Pesquisar no mapa", description: "Pesquisa locais no Mapa Macatuba. q é obrigatório; filtro restringe o campo.", endpoint: "/api/mapa/pesquisar", inputSchema: searchMap },
  { name: "novidades.pesquisar", title: "Pesquisar novidades", description: "Pesquisa novidades publicadas na Central Macatuba.", endpoint: "/api/novidades/pesquisar", inputSchema: queryInput(z.object({ q: text.max(200).optional() })) },
  { name: "novidades.verificar", title: "Verificar novidades", description: "Consulta novidades por função e, opcionalmente, id.", endpoint: "/api/novidades/verificar", inputSchema: verifyItems },
  { name: "paginas.pesquisar", title: "Pesquisar páginas", description: "Pesquisa páginas públicas catalogadas pela Central Macatuba.", endpoint: "/api/paginas/pesquisar", inputSchema: queryInput(z.object({ q: text.optional() })) },
  { name: "paginas.verificar", title: "Consultar página por ID", description: "Consulta uma página pública pelo ID explícito. O servidor MCP não herda o Host/path do cliente.", endpoint: "/api/paginas/verificar", inputSchema: queryInput(z.object({ id: positiveId })) },
  { name: "redicionador.verificar", title: "Verificar redirecionador", description: "Verifica se o slug derivado do parâmetro url existe e se o domínio do cliente está autorizado.", endpoint: "/api/redicionador/verificar", inputSchema: queryInput(z.object({ url: text.min(1) })) },
  { name: "servicos.listar", appUri: "ui://centralmacatuba/servicos", title: "Listar serviços", description: "Lista os serviços públicos do catálogo Serviços Macatuba.", endpoint: "/api/servicos/verificar", inputSchema: noInput, fixedQuery: { funcao: "tudo" } },
  { name: "servicos.obter", title: "Obter serviço", description: "Obtém um serviço por id ou nome; informe pelo menos um deles.", endpoint: "/api/servicos/verificar", inputSchema: serviceByIdOrName, fixedQuery: { funcao: "uma" } },
  { name: "servicos.pesquisar", title: "Pesquisar serviços", description: "Pesquisa serviços públicos pelo termo informado (até 200 caracteres).", endpoint: "/api/servicos/verificar", inputSchema: queryInput(z.object({ termo: text.min(1).max(200) })), fixedQuery: { funcao: "pesquisar" } },
  { name: "servicos_cursos.pesquisar", title: "Pesquisar cursos", description: "Pesquisa cursos por termo, categoria, nível e campo.", endpoint: "/api/servicos/cursos/pesquisar", inputSchema: searchCourses },
  { name: "servicos_cursos.verificar", appUri: "ui://centralmacatuba/cursos", title: "Verificar cursos", description: "Consulta cursos por categoria ou slug.", endpoint: "/api/servicos/cursos/verificar", inputSchema: verifyCourses },
  { name: "servicos_docs.pesquisar", title: "Pesquisar documentação", description: "Pesquisa documentação por categoria, termo e campo.", endpoint: "/api/servicos/docs/pesquisar", inputSchema: searchDocs },
  { name: "servicos_docs.verificar", title: "Verificar documentação", description: "Consulta uma documentação pelo slug, obrigatório.", endpoint: "/api/servicos/docs/verificar", inputSchema: verifyDocs },
  { name: "servicos_jogos.pesquisar", title: "Pesquisar jogos", description: "Pesquisa jogos por termo e campo.", endpoint: "/api/servicos/jogos/pesquisar", inputSchema: searchGames },
  { name: "servicos_jogos.verificar", title: "Verificar jogos", description: "Consulta jogos por id, nome ou slug.", endpoint: "/api/servicos/jogos/verificar", inputSchema: verifyGames },
  { name: "servicos_streaming.pesquisar", title: "Pesquisar streaming", description: "Pesquisa streaming. tipo é obrigatório e aceita radio, tv, vod, camera ou podcast.", endpoint: "/api/servicos/streaming/pesquisar", inputSchema: searchStreaming },
  { name: "servicos_streaming.verificar", title: "Verificar streaming", description: "Consulta streaming. tipo é obrigatório e aceita radio, tv, vod, camera ou podcast.", endpoint: "/api/servicos/streaming/verificar", inputSchema: verifyStreaming },
  { name: "servicos_streaming.live_verificar", title: "Verificar streaming ao vivo", description: "Consulta o estado público do serviço de streaming ao vivo.", endpoint: "/api/servicos/streaming/live/verificar", inputSchema: queryInput(z.object({ funcao: text.optional() })) },
  { name: "sos.listar", appUri: "ui://centralmacatuba/sos", title: "Consultar alertas SOS", description: "Lista os alertas públicos do SOS Macatuba. A consulta não solicita nem armazena permissões de notificação do navegador.", endpoint: "/api/sos/listar_alertas", inputSchema: noInput },
  { name: "tempo.listar", appUri: "ui://centralmacatuba/tempo", title: "Consultar Tempo Macatuba", description: "Consulta informações meteorológicas. source, start e end são parâmetros opcionais aceitos pelo serviço.", endpoint: "/api/tempo/verificar", inputSchema: queryInput(z.object({ source: text.optional(), start: text.optional(), end: text.optional() })) }
];

function jsonText(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => typeof item === "bigint" ? item.toString() : item, 2) ?? String(value);
}

export function registerApiTools(server: McpServer, api: CentralMacatubaSDK): void {
  for (const definition of tools) {
    const handler = async (rawArgs: unknown) => {
      let args: ToolQuery;
      try {
        args = definition.inputSchema.parse(rawArgs ?? {}) as ToolQuery;
      } catch {
        return {
          isError: true,
          content: [{ type: "text" as const, text: "Os parâmetros informados não são válidos para esta ferramenta." }]
        };
      }

      try {
        // A rota é estática, os argumentos seguem schemas Zod derivados do OpenAPI,
        // e o SDK ainda valida a allowlist pública antes de enviar a requisição.
        const request = api.request as unknown as (
          endpoint: PublicEndpoint,
          query?: ToolQuery
        ) => Promise<unknown>;
        const query = { ...args, ...(definition.fixedQuery ?? {}) };
        const result = await request(definition.endpoint, query);
        if (result instanceof Blob) {
          return {
            isError: true,
            content: [{ type: "text" as const, text: "Este endpoint retornou um arquivo binário não disponibilizado por esta ferramenta." }]
          };
        }
        const serialized = jsonText(result);
        if (serialized.length > MAX_TOOL_OUTPUT_CHARS) {
          return {
            isError: true,
            content: [{ type: "text" as const, text: "A resposta excedeu o limite de tamanho permitido para uma ferramenta MCP." }]
          };
        }
        const structuredContent = result !== null && typeof result === "object" && !Array.isArray(result)
          ? result as Record<string, unknown>
          : { data: result };
        return {
          content: [{ type: "text" as const, text: serialized }],
          structuredContent
        };
      } catch (error) {
        const status = typeof error === "object" && error !== null && "status" in error
          ? (error as { status?: unknown }).status
          : undefined;
        const statusText = typeof status === "number" ? ` (HTTP ${status})` : "";
        return {
          isError: true,
          content: [{ type: "text" as const, text: `A consulta à API pública falhou${statusText}. Verifique os parâmetros ou tente novamente mais tarde.` }]
        };
      }
    };

    const config = {
      title: definition.title,
      description: definition.description,
      inputSchema: definition.inputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
    };

    if (definition.appUri) {
      registerAppTool(server, definition.name, {
        ...config,
        _meta: { ui: { resourceUri: definition.appUri } }
      }, handler);
    } else {
      server.registerTool(definition.name, config, handler);
    }
  }
}

export const registeredToolNames = tools.map(({ name }) => name);
export const registeredToolSchemas = Object.fromEntries(tools.map(({ name, inputSchema }) => [name, inputSchema]));
export const registeredToolDefinitions = tools.map(({ name, endpoint, fixedQuery }) => ({ name, endpoint, fixedQuery }));
