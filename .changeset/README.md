# Changesets

Este diretório registra alterações que devem entrar no próximo release de `@centralmacatuba/mcp`.

Antes de concluir um PR com mudanças publicáveis, execute `pnpm changeset` e inclua o arquivo Markdown gerado. Escolha:

- `patch` para correções compatíveis;
- `minor` para novos recursos compatíveis;
- `major` para mudanças incompatíveis.

O workflow `Release` reúne os changesets em um PR de versionamento. A publicação só acontece depois que esse PR for revisado e integrado à branch `principal`.
