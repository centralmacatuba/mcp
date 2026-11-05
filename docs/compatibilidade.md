# Compatibilidade com o servidor MCP PHP legado

Este documento registra o primeiro mapeamento entre o manifesto e os arquivos de ferramentas em `centralmacatuba/site/mcp.centralmacatuba.qzz.io` e as operações existentes no SDK `@centralmacatuba/api` (branch `feat/sdk-inicial`).

A regra de migração é restritiva: uma ferramenta só pode ser implementada quando existe uma operação correspondente na allowlist pública do SDK. O pacote novo não copia as chamadas HTTP privadas, cookies de sessão ou cabeçalhos internos encontrados nos wrappers PHP.

## Mapeamento inicial

| Ferramenta legada | Operação pública do SDK | Situação |
| --- | --- | --- |
| `ping` | `/` | Coberta com o mesmo nome |
| `avisos.verificar` | `/api/avisos/verificar` | Coberta |
| `calendario.verificar` | `/api/calendario/verificar` | Coberta |
| `calendario.gerar` | `/api/calendario/gerar` | Coberta somente no formato JSON; PDF/PNG ficam fora desta ferramenta inicial |
| `dominios.verificar` | `/api/dominios/verificar` | Coberta |
| `informacoes.listar` / `informacoes.obter` | `/api/informacoes/verificar` | Reavaliar semântica e parâmetros antes de prometer paridade |
| `informacoes.pesquisar` | `/api/informacoes/pesquisar` | Coberta |
| `jornal.listar` / `jornal.obter` | `/api/jornal/verificar` | Reavaliar semântica e parâmetros antes de prometer paridade |
| `jornal.pesquisar` | `/api/jornal/pesquisar` | Coberta |
| `links.pesquisar` / `links.verificar` | `/api/links/pesquisar`, `/api/links/verificar` | Cobertas |
| `mapa.listar` / `mapa.filtrar` / `mapa.pesquisar` | `/api/mapa/verificar`, `/api/mapa/pesquisar` | Cobertas como operações públicas; contratos de parâmetros precisam de validação funcional |
| `novidades.pesquisar` / `novidades.verificar` | `/api/novidades/pesquisar`, `/api/novidades/verificar` | Cobertas |
| `paginas.pesquisar` / `paginas.verificar` | `/api/paginas/pesquisar`, `/api/paginas/verificar` | Cobertas |
| `redicionador.verificar` | `/api/redicionador/verificar` | Coberta |
| `servicos.*` | `/api/servicos/verificar` | Coberta como consulta do catálogo; ações obter/pesquisar legadas não são assumidas equivalentes |
| `servicos_cursos.*` | `/api/servicos/cursos/*` | Cobertas |
| `servicos_docs.*` | `/api/servicos/docs/*` | Cobertas |
| `servicos_jogos.*` | `/api/servicos/jogos/*` | Cobertas |
| `servicos_streaming.*` | `/api/servicos/streaming/*` | Cobertas |
| `sos.listar` | `/api/sos/listar_alertas` | Não exposta: depende de cookie de permissão gerenciado pelo navegador; não será substituído por credencial interna no processo MCP |
| `tempo.listar` | `/api/tempo/verificar` | Coberta como consulta; validar parâmetros opcionais |

## Ferramentas já registradas na primeira implementação

A primeira implementação registra consultas públicas para: `ping`, `avisos.verificar`, `calendario.verificar`, `calendario.gerar` (somente JSON), `dominios.verificar`, `informacoes.pesquisar`, `informacoes.verificar`, `jornal.pesquisar`, `jornal.verificar`, `links.pesquisar`, `links.verificar`, `mapa.pesquisar`, `mapa.verificar`, `novidades.pesquisar`, `novidades.verificar`, `paginas.pesquisar`, `paginas.verificar`, `redicionador.verificar`, `servicos.verificar`, operações de cursos/docs/jogos/streaming e `tempo.listar`. A ferramenta `tempo.listar` também está associada ao primeiro MCP App.

Os nomes antigos são mantidos quando existe correspondência clara. Os parâmetros são definidos individualmente a partir do OpenAPI (incluindo enums, tipos, campos obrigatórios, limites e formato de data/URL). A interface de argumentos foi normalizada: endpoints com parâmetros recebem um objeto `query`, validado por schema. Isso é uma mudança de formato em relação aos parâmetros de topo do manifesto antigo e deverá ser documentado na migração.

## Fora da nova implementação por enquanto

- `comunicacao.pesquisar` e `comunicacao.verificar`: não há operação correspondente no contrato/allowlist do SDK.
- `newsletter.verificar`: não há operação correspondente no contrato/allowlist do SDK.
- `sos.listar`: o endpoint público exige o cookie de permissão `centralmacatuba_sos-permissao`, gerenciado pelo navegador; o servidor MCP Node não recebe nem armazena esse cookie e não usará credenciais privadas como substituto.
- `paginas.listar` e `paginas.listar_dominios`: o wrapper PHP chama `/api/paginas/gerenciar.php` por POST, operação administrativa que não pertence ao SDK público.
- `status.verificar` e `tags.verificar`: não há operação correspondente no SDK.
- `servicos_wiki.*`: manter a responsabilidade da integração especializada `centralmacatuba/wiki-mcp`; não duplicar neste pacote sem decisão arquitetural.
- Ações legadas que não tenham equivalência comprovada não serão simuladas com parâmetros extras nem por acesso direto à API privada.

## Observações de segurança

Os wrappers PHP legados usam `X-API-KEY`, `X-CM-CLIENT-ID` e `X-CM-REQUEST-TOKEN` para consultar rotas internas. Esses mecanismos não são copiados. A implementação nova chama somente os métodos públicos do SDK e não registra cabeçalhos, cookies ou respostas internas em logs.

## Pendências para fechar a paridade

1. Conferir os schemas/argumentos reais do OpenAPI e dos endpoints PHP públicos.
2. Executar testes de integração por ferramenta e comparar respostas com o comportamento legado.
3. Decidir explicitamente se cada ação legada sem correspondência será descontinuada, redesenhada na API pública ou mantida no PHP.
4. Só depois atualizar o manifesto/discovery e planejar a migração do endpoint `/mcp`.
