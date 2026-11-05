# Primeiros passos

## Executar por STDIO

STDIO é indicado quando o cliente MCP inicia o servidor como um processo local. Depois que o pacote estiver publicado:

```bash
npx @centralmacatuba/mcp --transport stdio
```

Enquanto estiver em desenvolvimento, execute o build local:

```bash
node dist/cli.js --transport stdio
```

O processo mantém o canal MCP em `stdin/stdout`. Não escreva logs ou mensagens de diagnóstico diretamente em stdout.

## Executar por Streamable HTTP

```bash
MCP_HTTP_PORT=3000 MCP_ALLOWED_HOSTS=localhost,127.0.0.1 node dist/cli.js --transport http
```

O endpoint MCP local será:

```text
http://localhost:3000/mcp
```

Para acesso por navegador ou clientes web, configure explicitamente os hosts e origens permitidos. Consulte [configuração](/guide/configuration) e [transportes](/guide/transports).

## Fazer uma primeira consulta

Depois de conectar um cliente, experimente solicitar a lista de serviços, pesquisar uma notícia ou consultar o Tempo Macatuba. As ferramentas disponíveis estão descritas na [referência](/reference/tools).
