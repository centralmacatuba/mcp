# Compatibilidade

A relação completa das ferramentas MCP, operações públicas do SDK, argumentos, limitações e funcionalidades deliberadamente excluídas está em [Compatibilidade das ferramentas MCP](https://github.com/centralmacatuba/mcp/blob/feat/mcp-server/docs/compatibilidade.md).

A referência gerada de ferramentas está em [Ferramentas](./tools).

## Princípio de compatibilidade

Uma ferramenta só pode invocar uma operação já disponibilizada pelo SDK público `@centralmacatuba/api`. A existência de um endpoint na API, isoladamente, não autoriza sua exposição pelo servidor MCP. Isso mantém o contrato de segurança e evita que o MCP se torne um cliente HTTP genérico.
