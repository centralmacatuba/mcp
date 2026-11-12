# Compatibilidade das ferramentas MCP

Este documento descreve as ferramentas disponibilizadas pelo servidor e como elas utilizam as operações públicas do SDK `@centralmacatuba/api`. A implementação está alinhada ao contrato público OpenAPI **1.1.2**.

A regra de implementação é simples: cada ferramenta só pode chamar operações presentes no SDK público. O servidor MCP não implementa clientes HTTP paralelos, não aceita URLs arbitrárias e não inclui operações administrativas.

## Ferramentas e operações públicas

| Ferramenta MCP | Operação do SDK | Observações |
| --- | --- | --- |
| `ping` | `health.verificar()` | Verifica a disponibilidade da API pública |
| `avisos.verificar` | `avisos.verificar()` | Somente leitura |
| `calendario.verificar` | `calendario.verificar()` | Data opcional no formato AAAA-MM-DD |
| `calendario.gerar` | `calendario.gerar()` | Aceita `formato=json`, `formato=pdf` ou `formato=png`; padrão JSON. PDF é retornado como recurso MCP incorporado e PNG como imagem renderizável e recurso nomeado. |
| `dominios.verificar` | `dominios.verificar()` | Somente dados públicos |
| `informacoes.listar` | `informacoes.verificar({ funcao: "tudo" })` | Parâmetro de função fixado pelo servidor |
| `informacoes.obter` | `informacoes.verificar({ funcao: "uma", ... })` | Exige id ou nome |
| `informacoes.pesquisar` | `informacoes.pesquisar()` | Termo `p` e filtro opcionais; aceita paginação |
| `jornal.listar` | `jornal.verificar({ funcao: "todas" })` | Parâmetro de função fixado pelo servidor |
| `jornal.obter` | `jornal.verificar({ funcao: "uma", id })` | Exige id positivo |
| `jornal.pesquisar` | `jornal.pesquisar()` | Exige `q`; filtro opcional |
| `links.pesquisar` | `links.pesquisar()` | Termo opcional |
| `links.verificar` | `links.verificar()` | Consulta links ativos, um link por id ou solicitações pendentes conforme `funcao`; exige id quando `funcao=uma`. |
| `mapa.listar` | `mapa.verificar()` | Lista pontos; aceita filtros opcionais |
| `mapa.filtrar` | `mapa.verificar()` | Exige pelo menos um filtro |
| `mapa.pesquisar` | `mapa.pesquisar()` | Aceita `q` opcional ou os quatro limites geográficos; `zoom` controla o limite padrão quando `limit` é omitido. |
| `novidades.pesquisar` | `novidades.pesquisar()` | Termo opcional, até 200 caracteres |
| `novidades.verificar` | `novidades.verificar()` | Exige id quando `funcao=uma`. |
| `paginas.pesquisar` | `paginas.pesquisar()` | Pesquisa pública |
| `paginas.verificar` | `paginas.verificar({ id })` | No MCP, exige id explícito |
| `redicionador.verificar` | `redicionador.verificar()` | Exige slug no parâmetro `url` |
| `servicos.listar` | `GET /api/servicos/pesquisar` | Lista o catálogo pelo novo endpoint de pesquisa, sem termo `q`, com paginação. |
| `servicos.obter` | `servicos.verificar({ funcao: "uma", ... })` | Exige id ou nome |
| `servicos.pesquisar` | `GET /api/servicos/pesquisar` | Pesquisa o catálogo por `q` e `campo`, com paginação. |
| `servicos_cursos.pesquisar` | `servicos.cursos.pesquisar()` | Filtros opcionais e paginação |
| `servicos_cursos.verificar` | `servicos.cursos.verificar()` | Categoria ou slug opcionais |
| `servicos_docs.pesquisar` | `servicos.docs.pesquisar()` | Filtros opcionais e paginação |
| `servicos_docs.verificar` | `servicos.docs.verificar()` | Exige slug |
| `servicos_jogos.pesquisar` | `servicos.jogos.pesquisar()` | Termo e campo opcionais; aceita paginação |
| `servicos_jogos.verificar` | `servicos.jogos.verificar()` | Exige ao menos um identificador: id, nome ou slug. |
| `servicos_streaming.pesquisar` | `servicos.streaming.pesquisar()` | Exige tipo válido; filtro validado conforme a categoria e aceita paginação |
| `servicos_streaming.verificar` | `servicos.streaming.verificar()` | Exige tipo válido e id quando `funcao=uma`. |
| `servicos_streaming.live_verificar` | `servicos.streaming.live.verificar()` | Consulta transmissões ao vivo e agendadas |
| `sos.listar` | `GET /api/sos/listar_alertas` | Consulta alertas; quando `notificacaoAceita=true`, envia `X-CM-SOS-PERMISSION: granted` como cabeçalho HTTP; nunca usa cookie. |
| `tempo.listar` | `tempo.verificar()` | MCP App Tempo |

## MCP Apps associados

| Recurso UI | Ferramenta |
| --- | --- |
| `ui://centralmacatuba/tempo` | `tempo.listar` |
| `ui://centralmacatuba/servicos` | `servicos.listar` |
| `ui://centralmacatuba/mapa` | `mapa.listar` |
| `ui://centralmacatuba/jornal` | `jornal.listar` |
| `ui://centralmacatuba/informacoes` | `informacoes.listar` |
| `ui://centralmacatuba/servicos/cursos` | `servicos_cursos.pesquisar`, `servicos_cursos.verificar` |
| `ui://centralmacatuba/sos` | `sos.listar` |\n| `ui://centralmacatuba/calendario` | `calendario.gerar`, `calendario.verificar` |\n| `ui://centralmacatuba/novidades` | `novidades.pesquisar`, `novidades.verificar`, `avisos.verificar` |\n| `ui://centralmacatuba/servicos/docs` | `servicos_docs.pesquisar`, `servicos_docs.verificar` |\n| `ui://centralmacatuba/servicos/jogos` | `servicos_jogos.pesquisar`, `servicos_jogos.verificar` |\n| `ui://centralmacatuba/servicos/streaming` | `servicos_streaming.pesquisar`, `servicos_streaming.verificar`, `servicos_streaming.live_verificar` |

As doze interfaces são empacotadas como HTML autocontido durante o build. Seus scripts usam o pacote oficial de MCP Apps incluído nas dependências do servidor, sem carregar bibliotecas de terceiros por CDN em tempo de execução.

## Paginação

As ferramentas de listagem e pesquisa que possuem suporte no OpenAPI aceitam `page` (base 1) e `limit` (de 1 a 100). O padrão da API é página 1 e 20 itens por página. Isso inclui calendário, informações, jornal, links (pesquisa), mapa, novidades, páginas, catálogo de serviços, cursos, documentação, jogos, streaming, SOS e tempo. A consulta de pontos no mapa preserva o limite padrão dinâmico por zoom quando `limit` não é informado. Ferramentas de consulta individual não expõem paginação quando ela não tem efeito semântico.

## Compatibilidade de argumentos

Os nomes das ferramentas e os argumentos são mantidos no nível superior, sempre que compatíveis com a operação pública. Os schemas Zod validam os campos antes de chamar o SDK. Campos fixos como `funcao=tudo` e `funcao=uma` são definidos pelo servidor, não pelo cliente, para que a ferramenta mantenha o significado anunciado.

As ferramentas de lista que historicamente aceitavam filtros continuam aceitando-os. `mapa.listar` aceita `tipo`, `criador` e `verificado` como filtros opcionais; `mapa.filtrar` exige pelo menos um desses filtros não vazio.

A ferramenta `mapa.pesquisar` segue o contrato atualizado: `q` é opcional (quando informado, não pode ser vazio); sem `q`, exige os quatro limites geográficos `min_lat`, `min_lng`, `max_lat`, `max_lng`. Aceita nível `zoom` e paginação; quando `limit` é omitido, o tamanho da página depende do zoom. A consulta de Tempo valida `source` em até 50 caracteres e datas em `AAAA-MM-DD` ou `AAAA-MM-DD HH:MM:SS`.

A ferramenta `paginas.verificar` requer um id explícito no servidor MCP. O contexto HTTP de um cliente MCP não é o mesmo contexto de Host/path de um navegador, portanto o servidor não tenta inferir a página atual do cliente.

A ferramenta `links.verificar` acompanha o enum público `funcao=tudo|uma|pendentes`; a função `uma` exige um id. A consulta de pendentes é encaminhada somente pela rota pública documentada no OpenAPI.

As funções `uma` de `novidades.verificar` e `servicos_streaming.verificar` também exigem id explícito.

A ferramenta `sos.listar` usa a operação pública de alertas. O argumento opcional `notificacaoAceita` só deve ser `true` quando o usuário já tiver concedido a permissão; nesse caso, o MCP envia `X-CM-SOS-PERMISSION: granted` por meio das opções de requisição do SDK. O MCP não solicita permissão, não lê nem encaminha cookies do navegador e não presume consentimento quando o argumento é omitido ou `false`.

## Funcionalidades não incluídas

As seguintes ações não são expostas porque não possuem uma operação pública correspondente no SDK ou não são adequadas ao contrato somente de leitura:

- Operações de comunicação e newsletter que não estejam presentes no SDK público.
- Ações administrativas de listagem/gerenciamento de páginas.
- Operações de status e tags sem operação pública correspondente.
- Operações de escrita, modificação, administração ou gerenciamento.
- Ferramentas de catálogo especializado que ainda não tenham uma operação correspondente no SDK público.

Essas ausências são intencionais: o servidor não amplia a superfície pública da API nem simula operações que não fazem parte do contrato público.

## Formato das respostas

As ferramentas retornam:
- `content` textual com JSON legível, para compatibilidade ampla com clientes MCP.
- `structuredContent` com o objeto JSON quando a resposta é estruturada, para hosts e MCP Apps que suportam dados estruturados.

A ferramenta `calendario.gerar` também expõe os formatos binários declarados pelo SDK. PDF é entregue como recurso MCP incorporado (`application/pdf`) e PNG como conteúdo de imagem (`image/png`) acompanhado de recurso incorporado nomeado. O tamanho máximo de arquivo binário retornado é 8 MiB. Outros endpoints não podem retornar conteúdo binário. Os erros são simplificados para evitar revelar detalhes internos de infraestrutura.

## Limites e segurança

- Todas as chamadas de dados passam pelo SDK oficial da API pública.
- Cada ferramenta usa uma rota fixa do contrato público.
- Os argumentos são validados e os campos desconhecidos são descartados pelo schema.
- Entradas de texto são limitadas a 2.048 caracteres, exceto quando o contrato da operação define limite menor.
- A pesquisa de serviços respeita o limite de 200 caracteres.
- As respostas de ferramentas são limitadas a 100.000 caracteres.
- O servidor não oferece proxy HTTP genérico nem ferramentas de escrita/gerenciamento.
- Nenhuma credencial ou configuração privada faz parte do pacote.

## Validação antes da migração de produção

Antes de substituir qualquer implantação existente, valide a execução de todas as ferramentas contra a API pública, compare os resultados observáveis, teste clientes com e sem MCP Apps e confirme o transporte Streamable HTTP no ambiente de hospedagem. A implementação deste pacote, por si só, não altera endpoints de produção.
