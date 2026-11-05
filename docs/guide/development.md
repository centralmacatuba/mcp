# Desenvolvimento

## Ambiente

- Node.js 20+.
- pnpm 12.12.1.
- SDK da API pública compatível com a dependência declarada.
- Git.

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Estrutura

| Caminho | Responsabilidade |
| --- | --- |
| `src/api.ts` | Criação do cliente oficial da API |
| `src/tools.ts` | Schemas, registro e handlers das ferramentas |
| `src/apps.ts` | Registro dos recursos MCP Apps |
| `src/server.ts` | Composição do servidor MCP |
| `src/stdio.ts` | Inicialização STDIO |
| `src/http.ts` | Inicialização Streamable HTTP e controles de origem/host |
| `src/config.ts` | Leitura e validação da configuração |
| `src/cli.ts` | Interface de linha de comando |
| `apps/` | Fontes das sete interfaces HTML |
| `test/` | Testes automatizados |

## Regras de contribuição

- Use pnpm 12.12.1; não introduza npm/yarn como gerenciador do projeto.
- Toda consulta de dados deve passar por `@centralmacatuba/api`.
- Não crie URLs ou clientes HTTP paralelos para endpoints da API.
- Não exponha endpoints privados, administrativos ou operações de escrita.
- Valide entradas com Zod e mantenha limites de tamanho.
- Atualize os testes e a documentação quando alterar ferramentas, recursos, configuração ou transportes.
- Registre mudanças publicáveis com Changesets.
