# Compatibilidade com o servidor MCP PHP legado

Este documento registra o mapeamento entre o manifesto em `centralmacatuba/site/mcp.centralmacatuba.qzz.io/mcp.json` e as operações disponíveis no SDK `@centralmacatuba/api` (branch `feat/sdk-inicial`).

A regra de migração é restritiva: uma ferramenta só é implementada quando existe uma operação correspondente na allowlist pública do SDK. O pacote novo não copia chamadas HTTP privadas, cookies de sessão ou cabeçalhos internos encontrados nos wrappers PHP.

## Mapeamento inicial

| Ferramenta legada | Operação pública do SDK | Situação |
| --- | --- | --- |
| `ping` | `/` | Coberta com o mesmo nome |
| `avisos.verificar` | `/api/avisos/verificar` | Coberta |
| `calendario.verificar` | `/api/calendario/verificar` | Coberta |
| `calendario.gerar` | `/api/calendario/gerar` | Coberta somente no formato JSON; PDF/PNG ficam fora desta ferramenta inicial |
| `dominios.verificar` | `/api/dominios/verificar` | Coberta |
| `informacoes.listar` | `/api/informacoes/verificar?funcao=tudo` | Coberta |
| `informacoes.obter` | `/api/informacoes/verificar?funcao=uma` | Coberta; exige id ou nome |
| `informacoes.pesquisar` | `/api/informacoes/pesquisar` | Coberta |
| `jornal.listar` | `/api/jornal/verificar?funcao=todas` | Coberta |
| `jornal.obter` | `/api/jornal/verificar?funcao=uma` | Coberta; exige id |
| `jornal.pesquisar` | `/api/jornal/pesquisar` | Coberta |
| `links.pesquisar` / `links.verificar` | `/api/links/pesquisar`, `/api/links/verificar` | Cobertas |
| `mapa.listar` | `/api/mapa/verificar` | Coberta |
| `mapa.filtrar` | `/api/mapa/verificar` | Coberta; exige pelo menos um filtro |
| `mapa.pesquisar` | `/api/mapa/pesquisar` | Coberta |
| `novidades.pesquisar` / `novidades.verificar` | `/api/novidades/pesquisar`, `/api/novidades/verificar` | Cobertas |
| `paginas.pesquisar` | `/api/paginas/pesquisar` | Coberta |
| `paginas.verificar_id` | `/api/paginas/verificar?id=...` | Coberta; exige id |
| `redicionador.verificar` | `/api/redicionador/verificar` | Coberta |
| `servicos.listar` | `/api/servicos/verificar?funcao=tudo` | Coberta |
| `servicos.obter` | `/api/servicos/verificar?funcao=uma` | Coberta; exige id ou nome |
| `servicos.pesquisar` | `/api/servicos/verificar?funcao=pesquisar` | Coberta; exige termo |
| `servicos_cursos.*` | `/api/servicos/cursos/*` | Cobertas |
| `servicos_docs.*` | `/api/servicos/docs/*` | Cobertas |
| `servicos_jogos.*` | `/api/servicos/jogos/*` | Cobertas |
| `servicos_streaming.*` | `/api/servicos/streaming/*` | Cobertas |
| `tempo.listar` | `/api/tempo/verificar` | Coberta; também possui MCP App |

## Ferramentas já registradas

`ping`, `avisos.verificar`, `calendario.verificar`, `calendario.gerar`, `dominios.verificar`, `informacoes.listar`, `informacoes.obter`, `informacoes.pesquisar`, `jornal.listar`, `jornal.obter`, `jornal.pesquisar`, `links.pesquisar`, `links.verificar`, `mapa.listar`, `mapa.filtrar`, `mapa.pesquisar`, `novidades.pesquisar`, `novidades.verificar`, `paginas.pesquisar`, `paginas.verificar_id`, `redicionador.verificar`, `servicos.listar`, `servicos.obter`, `servicos.pesquisar`, operações de cursos/docs/jogos/streaming e `tempo.listar`.

A ferramenta `tempo.listar` também está associada ao primeiro MCP App. Clientes sem suporte a Apps continuam recebendo o resultado textual da ferramenta.

Os nomes antigos são preservados quando há correspondência clara. Os parâmetros são definidos individualmente a partir do OpenAPI (incluindo enums, tipos, campos obrigatórios, limites e formato de data). Algumas operações usam parâmetros fixos internos, como `funcao=tudo`, para manter a semântica do nome legado. Os argumentos são mantidos no nível superior, como no manifesto antigo, sempre que a operação tem equivalência. Os schemas Zod validam os campos antes de montar a query HTTP; parâmetros fixos internos preservam o comportamento de listar/obter/pesquisar.

## Fora da nova implementação por enquanto

- `comunicacao.pesquisar` e `comunicacao.verificar`: não há operação correspondente no contrato/allowlist do SDK.
- `newsletter.verificar`: não há operação correspondente no contrato/allowlist do SDK.
- `sos.listar`: o endpoint público exige o cookie de permissão `centralmacatuba_sos-permissao`, gerenciado pelo navegador; o servidor MCP Node não recebe nem armazena esse cookie e não usará credenciais privadas como substituto.
- `paginas.verificar`: depende do contexto Host + path do cliente original. Uma chamada feita pelo servidor MCP teria como contexto o próprio servidor/API, não o cliente MCP; por isso não é reproduzida como se tivesse a mesma semântica.
- `paginas.listar` e `paginas.listar_dominios`: o wrapper PHP chama `/api/paginas/gerenciar.php` por POST, operação administrativa que não pertence ao SDK público.
- `status.verificar` e `tags.verificar`: não há operação correspondente no SDK.
- `servicos_wiki.*`: manter a responsabilidade da integração especializada `centralmacatuba/wiki-mcp`; não duplicar neste pacote sem decisão arquitetural.
- Ações legadas sem equivalência comprovada não serão simuladas com parâmetros extras nem por acesso direto à API privada.

## Observações de segurança

Os wrappers PHP legados usam `X-API-KEY`, `X-CM-CLIENT-ID` e `X-CM-REQUEST-TOKEN` para consultar rotas internas. Esses mecanismos não são copiados. A implementação nova chama somente os métodos públicos do SDK e não registra cabeçalhos, cookies ou respostas internas em logs.

## Pendências para fechar a paridade

1. Executar testes de integração por ferramenta e comparar respostas com o comportamento legado.
2. Validar a semântica dos endpoints públicos no gateway real, principalmente operações que usam parâmetros fixos.
3. Decidir se cada ação sem correspondência será descontinuada, redesenhada na API pública ou mantida no PHP.
4. Só depois atualizar o manifesto/discovery e planejar a migração do endpoint `/mcp`.
