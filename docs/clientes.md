# Configuração de clientes MCP

## STDIO

Depois que `@centralmacatuba/mcp` estiver publicado e `@centralmacatuba/api` estiver disponível no npm, adicione a configuração equivalente ao cliente MCP utilizado:

```json
{
  "mcpServers": {
    "centralmacatuba": {
      "command": "npx",
      "args": ["-y", "@centralmacatuba/mcp", "--transport", "stdio"]
    }
  }
}
```

O processo usa o gateway público padrão. Não são necessárias chaves privadas ou credenciais internas.

### Execução a partir do clone

Enquanto o pacote ainda não estiver publicado, depois de instalar as dependências e compilar o repositório:

```json
{
  "mcpServers": {
    "centralmacatuba": {
      "command": "node",
      "args": ["/caminho/absoluto/para/mcp/dist/cli.js", "--transport", "stdio"]
    }
  }
}
```

## Streamable HTTP local

Para testar o transporte HTTP:

```bash
PORT=3000 MCP_ALLOWED_HOSTS=localhost,127.0.0.1 node dist/cli.js --transport http
```

Configure o cliente para conectar em `http://localhost:3000/mcp`.

O endpoint HTTP hospedado ainda não foi migrado. O servidor PHP atual continua sendo o endpoint de produção. Não configure clientes para um endpoint público novo antes de concluir a validação de paridade e o plano de migração.
