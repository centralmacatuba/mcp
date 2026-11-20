# Arquitetura e limites

```text
Cliente MCP
   │
   ├── STDIO
   └── Streamable HTTP (/mcp)
          │
          ▼
@centralmacatuba/mcp
   ├── validação de entrada (Zod)
   ├── ferramentas e recursos MCP
   ├── MCP Apps
   └── cliente @centralmacatuba/api
          │ HTTPS
          ▼
API Pública Central Macatuba
```

## Responsabilidades

- O servidor MCP adapta operações públicas a ferramentas e recursos MCP.
- O SDK da API mantém a allowlist de rotas, os tipos e o cliente HTTP.
- A API pública é responsável pelos dados e regras de negócio.
- MCP Apps fornecem interfaces de apresentação para clientes compatíveis.

## Limites de segurança

- Ferramentas são somente leitura.
- Cada ferramenta aponta para uma rota estática permitida pelo SDK.
- Os argumentos são validados antes da chamada.
- O servidor não aceita URLs arbitrárias nem nomes de endpoint dinâmicos.
- Operações privadas, administrativas e de escrita não são expostas.
- As allowlists de Host e Origin protegem a superfície HTTP; não equivalem a autenticação de usuário.

Consulte a [matriz de compatibilidade](/reference/compatibility) para a relação detalhada entre ferramentas e operações do SDK.
