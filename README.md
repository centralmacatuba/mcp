# @centralmacatuba/mcp

Servidor MCP oficial da **Central Macatuba**, escrito em TypeScript. Expõe ferramentas de consulta aos serviços públicos por meio do SDK oficial do Model Context Protocol e do SDK cliente `@centralmacatuba/api`.

> **Status:** implementação inicial em desenvolvimento. Não substitui o servidor PHP atualmente publicado em `https://mcp.centralmacatuba.qzz.io/mcp`. A migração de produção depende de auditoria de paridade, conformidade e estabilidade.

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
npx centralmacatuba-mcp --transport stdio
```

Streamable HTTP:

```bash
MCP_HTTP_PORT=3000 MCP_ALLOWED_HOSTS=localhost,127.0.0.1 node dist/cli.js --transport http
```

Endpoint: `http://localhost:3000/mcp`.

## Configuração

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `CM_API_BASE_URL` | `https://publica.api.centralmacatuba.qzz.io` | URL base do gateway público |
| `CM_API_TIMEOUT_MS` | `20000` | Timeout das chamadas ao SDK |
| `PORT` | `3000` | Porta HTTP (compatível com Render) |
| `MCP_HTTP_PORT` | `3000` | Porta HTTP alternativa |
| `MCP_HTTP_HOST` | `0.0.0.0` | Interface de escuta |
| `MCP_ALLOWED_HOSTS` | localhost / loopback | Hosts HTTP permitidos, separados por vírgula |
| `MCP_ALLOWED_ORIGINS` | vazio | Origens browser explicitamente permitidas; vazio rejeita requisições que enviem Origin |

Em produção, configure `MCP_ALLOWED_HOSTS` com os hostnames exatos do serviço. Não configure `X-API-KEY`, `X-CM-CLIENT-ID` ou `X-CM-REQUEST-TOKEN`: este servidor não precisa desses segredos e não deve recebê-los.

## Ferramentas

As ferramentas iniciais são somente leitura e mapeiam para endpoints presentes na allowlist do SDK público. Consulte [matriz de compatibilidade](docs/compatibilidade.md) para ver o que foi preservado, redesenhado ou excluído do servidor PHP legado.

Ferramentas com parâmetros recebem um objeto `query`, validado com os campos, tipos, enums e obrigatoriedades definidos no OpenAPI. Campos de texto são limitados a 2.048 caracteres e respostas MCP a 100.000 caracteres. O servidor não aceita caminhos arbitrários nem nomes de endpoint fornecidos pelo cliente.

## MCP Apps

A primeira integração usa o SDK oficial `@modelcontextprotocol/ext-apps` e associa a ferramenta `tempo.listar` ao recurso `ui://centralmacatuba/tempo.html`. Clientes compatíveis recebem um painel interativo com atualização sob demanda; clientes sem suporte a Apps continuam recebendo a resposta textual normal da ferramenta. A interface é empacotada em um único HTML durante o build. A integração pode ser ampliada para outras ferramentas conforme a iniciativa [centralmacatuba/site#7](https://github.com/centralmacatuba/site/issues/7).

## Transporte e migração

- STDIO: processo local para clientes MCP.
- Streamable HTTP: endpoint `/mcp`, em modo stateless nesta primeira implementação.
- O servidor PHP e seu endpoint público permanecem intactos durante o desenvolvimento.
- Não aponte produção para este pacote antes de validar paridade, conformidade e segurança.

## Desenvolvimento

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

A CI usa pnpm 12.12.1. O lockfile será versionado assim que a resolução das dependências puder ser executada com o SDK público disponível. O build compila o servidor e empacota a interface MCP App em `dist/apps/tempo.html`.

## Projeto e licença

A Central Macatuba é um projeto independente desenvolvido por **Desenvolvedor EE (Dev EE)**, sem relação ou vínculo institucional com a Prefeitura Municipal de Macatuba.

MIT. Consulte [LICENSE](LICENSE).
