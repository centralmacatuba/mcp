# Configuração de clientes

A configuração exata depende do cliente MCP utilizado. Para clientes que aceitam servidores locais por STDIO, configure o executável `npx` e seus argumentos:

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

Para clientes que aceitam servidores remotos Streamable HTTP, informe o endereço completo do endpoint:

```text
https://SEU_HOST/mcp
```

O exemplo local não deve ser copiado para produção sem avaliar o método de autenticação e os controles de acesso do cliente/ambiente. O servidor não implementa autenticação de usuário própria nesta versão; não o exponha como serviço privado sem uma camada de proteção apropriada.
