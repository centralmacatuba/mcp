# @centralmacatuba/mcp

Servidor MCP oficial da **Central Macatuba**, escrito em TypeScript. Expõe ferramentas de consulta aos serviços públicos por meio do SDK oficial do Model Context Protocol e do SDK cliente `@centralmacatuba/api`.

> **Status:** implementação inicial em desenvolvimento. Não substitui automaticamente a implementação MCP PHP atualmente utilizada em produção. A migração depende de auditoria de paridade, conformidade e estabilidade.

## Arquitetura

```text
Cliente MCP
    │ MCP / Streamable HTTP ou STDIO
    ▼
@centralmacatuba/mcp
    │ métodos e allowlist do SDK
    ▼
@centralmacatuba/api
    │ HTTPS
    ▼
API Pública Central Macatuba
```

Este pacote não implementa uma segunda camada HTTP para os endpoints de dados. Toda consulta passa pelo SDK público. Não há acesso a APIs privadas/administrativas nem uso de credenciais internas do gateway.

## Requisitos e instalação

- Node.js 20 ou superior.
- pnpm 12.12.1 para desenvolvimento.
- MCP TypeScript SDK v2 (`@modelcontextprotocol/server` e `@modelcontextprotocol/node`).
- SDK `@centralmacatuba/api` compatível com `^0.1.0`.

Após a publicação dos dois pacotes:

```bash
pnpm add @centralmacatuba/mcp
```

A instalação completa e a validação de integração dependem de `@centralmacatuba/api@^0.1.0` estar disponível no npm. Enquanto isso, a implementação pode ser desenvolvida em paralelo, mas não deve ser considerada pronta para release.

## Execução

STDIO (padrão para clientes MCP locais):

```bash
npx @centralmacatuba/mcp --transport stdio
```

Streamable HTTP:

```bash
MCP_HTTP_PORT=3000 MCP_ALLOWED_HOSTS=localhost,127.0.0.1 node dist/cli.js --transport http
```

Endpoint local: `http://localhost:3000/mcp`.

## Configuração

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `CM_API_BASE_URL` | `https://publica.api.centralmacatuba.qzz.io` | URL base do gateway público |
| `CM_API_TIMEOUT_MS` | `20000` | Timeout das chamadas ao SDK |
| `PORT` | `3000` | Porta HTTP |
| `MCP_HTTP_PORT` | `3000` | Porta HTTP alternativa |
| `MCP_HTTP_HOST` | `0.0.0.0` | Interface de escuta |
| `MCP_ALLOWED_HOSTS` | localhost / loopback | Hosts HTTP permitidos, separados por vírgula |
| `MCP_ALLOWED_ORIGINS` | vazio | Origens browser explicitamente permitidas; vazio rejeita requisições que enviem Origin |

Em produção, configure `MCP_ALLOWED_HOSTS` com os hostnames exatos do serviço. O servidor usa somente as operações disponibilizadas pelo SDK público.

## Documentação

A documentação completa está em [docs.mcp.centralmacatuba.qzz.io](https://docs.mcp.centralmacatuba.qzz.io/), com guias de instalação, configuração, transportes, desenvolvimento, referência de ferramentas e MCP Apps. Para executar localmente: `pnpm docs:dev`; para validar e gerar o site: `pnpm docs:test` e `pnpm docs:build`.

## Ferramentas

As ferramentas iniciais são somente leitura e mapeiam para endpoints presentes na allowlist do SDK público. Consulte a [matriz de compatibilidade](docs/compatibilidade.md) para ver o que foi preservado, redesenhado ou excluído da implementação PHP anterior.

Os argumentos das ferramentas são recebidos no nível superior, preservando os contratos legados quando há equivalência. Cada ferramenta valida campos, tipos, enums e obrigatoriedades definidos no OpenAPI. Campos de texto são limitados a 2.048 caracteres e respostas MCP a 100.000 caracteres. O servidor não aceita caminhos arbitrários nem nomes de endpoint fornecidos pelo cliente.

Consulte [configuração de clientes](docs/clientes.md) para exemplos de conexão via STDIO e Streamable HTTP.

## MCP Apps

As interfaces usam o SDK oficial `@modelcontextprotocol/ext-apps` e são associadas às ferramentas correspondentes: Tempo, Serviços, Mapa, Jornal, Informações, Cursos, SOS, Calendário, Novidades, Docs, Jogos e Streaming. Cada interface é empacotada em um HTML autocontido, sem depender de CDN em tempo de execução. Clientes compatíveis recebem uma experiência interativa; clientes sem suporte a Apps continuam recebendo conteúdo textual e `structuredContent` das ferramentas.

## Transporte e migração

- STDIO: processo local para clientes MCP.
- Streamable HTTP: endpoint `/mcp`, em modo stateless nesta primeira implementação.
- A implementação MCP PHP e seu endpoint atual permanecem intactos durante o desenvolvimento deste pacote.
- Não altere o endpoint de produção antes de validar paridade, conformidade e segurança.

## Desenvolvimento

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm docs:test
pnpm docs:build
pnpm build
pnpm test:package
```

O projeto utiliza pnpm 12.12.1. O lockfile será versionado após a dependência pública `@centralmacatuba/api@^0.1.0` estar disponível no npm; o workflow manual de sincronização verifica essa condição antes de gerar o arquivo. O build compila o servidor e empacota as doze interfaces em `dist/apps/`.

## Projeto e licença

A Central Macatuba é um projeto independente desenvolvido por **Desenvolvedor EE (Dev EE)**, sem relação ou vínculo institucional com a Prefeitura Municipal de Macatuba.

MIT. Consulte [LICENSE](LICENSE).
