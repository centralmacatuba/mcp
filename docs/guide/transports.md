# Transportes

O pacote oferece dois transportes oficiais.

## STDIO

Use STDIO para integrações locais em que o cliente inicia o processo do servidor. O protocolo trafega por entrada e saída padrão; mantenha stdout reservado às mensagens MCP.

```bash
npx @centralmacatuba/mcp --transport stdio
```

## Streamable HTTP

Use Streamable HTTP para executar o servidor como serviço acessível pela rede. O endpoint MCP é `/mcp`.

```bash
MCP_HTTP_PORT=3000 MCP_HTTP_HOST=0.0.0.0 MCP_ALLOWED_HOSTS=mcp.example.test node dist/cli.js --transport http
```

A implementação inicial utiliza modo stateless. O transporte HTTP valida Host e Origin de acordo com as allowlists configuradas. Em produção, utilize TLS e um proxy reverso corretamente configurado.

## Escolha do transporte

| Cenário | Transporte |
| --- | --- |
| Cliente desktop que inicia um processo local | STDIO |
| Servidor remoto compartilhado | Streamable HTTP |
| Ambiente de desenvolvimento local | Ambos |

Os transportes compartilham o mesmo registro de ferramentas, recursos e MCP Apps.
