# Configuração de clientes

A configuração exata depende do cliente MCP utilizado. Depois que o pacote estiver publicado, clientes que aceitam servidores locais por STDIO podem iniciar o pacote com `npx`:

```json
{
  "mcpServers": {
    "centralmacatuba": {
      "command": "npx",
      "args": ["--yes", "@centralmacatuba/mcp", "--transport", "stdio"]
    }
  }
}
```

Enquanto o pacote não estiver publicado, use o clone local já compilado:

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

Para clientes que aceitam servidores remotos Streamable HTTP, informe o endereço completo do endpoint configurado pelo operador:

```text
https://SEU_HOST/mcp
```

Não há um endpoint remoto público novo anunciado por este pacote. O servidor não implementa autenticação de usuário própria nesta versão; não o exponha como serviço privado sem uma camada de proteção apropriada.
