# Compatibilidade das ferramentas MCP

Este documento descreve as ferramentas disponibilizadas pelo servidor e como elas utilizam as operações públicas do SDK `@centralmacatuba/api`.

A regra de implementação é simples: cada ferramenta só pode chamar operações presentes no SDK público. O servidor MCP não implementa clientes HTTP paralelos, não aceita URLs arbitrárias e não inclui operações administrativas.

## Ferramentas e operações públicas

| Ferramenta MCP | Operação do SDK | Observações |
| --- | --- | --- |
| `ping` | `health.verificar()` | Verifica a disponibilidade da API pública |
| `avisos.verificar` | `avisos.verificar()` | Somente leitura |
| `calendario.verificar` | `calendario.verificar()` | Data opcional no formato AAAA-MM-DD |
| `calendario.gerar` | `calendario.gerar()` | Somente JSON; arquivos binários não são retornados pela ferramenta |
| `dominios.verificar` | `dominios.verificar()` | Somente dados públicos |
| `informacoes.listar` | `informacoes.verificar({ funcao: "tudo" })` | Parâmetro de função fixado pelo servidor |
| `informacoes.obter` | `informacoes.verificar({ funcao: "uma", ... })` | Exige id ou nome |
| `informacoes.pesquisar` | `informacoes.pesquisar()` | Exige o termo `p` |
| `jornal.listar` | `jornal.verificar({ funcao: "todas" })` | Parâmetro de função fixado pelo servidor |
| `jornal.obter` | `jornal.verificar({ funcao: "uma", id })` | Exige id positivo |
| `jornal.pesquisar` | `jornal.pesquisar()` | Exige `q`; filtro opcional |
| `links.pesquisar` | `links.pesquisar()` | Termo opcional |
| `links.verificar` | `links.verificar()` | Lista links ativos ou obtém um link por id; exige id quando `funcao=uma`. A função `pendentes` é deliberadamente excluída por poder retornar dados operacionais. |
| `mapa.listar` | `mapa.verificar()` | Lista pontos; aceita filtros opcionais |
| `mapa.filtrar` | `mapa.verificar()` | Exige pelo menos um filtro |
| `mapa.pesquisar` | `mapa.pesquisar()` | Exige `q`; filtro opcional |
| `novidades.pesquisar` | `novidades.pesquisar()` | Termo opcional, até 200 caracteres |
| `novidades.verificar` | `novidades.verificar()` | Exige id quando `funcao=uma`. |
| `paginas.pesquisar` | `paginas.pesquisar()` | Pesquisa pública |
| `paginas.verificar` | `paginas.verificar({ id })` | No MCP, exige id explícito |
| `redicionador.verificar` | `redicionador.verificar()` | Exige slug no parâmetro `url` |
| `servicos.listar` | `servicos.verificar({ funcao: "tudo" })` | Parâmetro de função fixado pelo servidor |
| `servicos.obter` | `servicos.verificar({ funcao: "uma", ... })` | Exige id ou nome |
| `servicos.pesquisar` | `servicos.verificar({ funcao: "pesquisar", termo })` | Termo obrigatório, até 200 caracteres |
| `servicos_cursos.pesquisar` | `servicos.cursos.pesquisar()` | Filtros opcionais |
| `servicos_cursos.verificar` | `servicos.cursos.verificar()` | Categoria ou slug opcionais |
| `servicos_docs.pesquisar` | `servicos.docs.pesquisar()` | Filtros opcionais |
| `servicos_docs.verificar` | `servicos.docs.verificar()` | Exige slug |
| `servicos_jogos.pesquisar` | `servicos.jogos.pesquisar()` | Termo e campo opcionais |
| `servicos_jogos.verificar` | `servicos.jogos.verificar()` | Exige ao menos um identificador: id, nome ou slug. |
| `servicos_streaming.pesquisar` | `servicos.streaming.pesquisar()` | Exige tipo válido |
| `servicos_streaming.verificar` | `servicos.streaming.verificar()` | Exige tipo válido e id quando `funcao=uma`. |
| `servicos_streaming.live_verificar` | `servicos.streaming.live.verificar()` | Consulta transmissões ao vivo e agendadas |
| `sos.listar` | `sos.listarAlertas()` | Consulta alertas públicos; não encaminha cookies de navegador |
| `tempo.listar` | `tempo.verificar()` | MCP App Tempo |

## MCP Apps associados

| Recurso UI | Ferramenta |
| --- | --- |
| `ui://centralmacatuba/tempo` | `tempo.listar` |
| `ui://centralmacatuba/servicos` | `servicos.listar` |
| `ui://centralmacatuba/mapa` | `mapa.listar` |
| `ui://centralmacatuba/jornal` | `jornal.listar` |
| `ui://centralmacatuba/informacoes` | `informacoes.listar` |
| `ui://centralmacatuba/cursos` | `servicos_cursos.verificar` |
| `ui://centralmacatuba/sos` | `sos.listar` |

As sete interfaces são empacotadas como HTML autocontido durante o build. Seus scripts usam o pacote oficial de MCP Apps incluído nas dependências do servidor, sem carregar bibliotecas de terceiros por CDN em tempo de execução.

## Compatibilidade de argumentos

Os nomes das ferramentas e os argumentos são mantidos no nível superior, sempre que compatíveis com a operação pública. Os schemas Zod validam os campos antes de chamar o SDK. Campos fixos como `funcao=tudo`, `funcao=uma` e `funcao=pesquisar` são definidos pelo servidor, não pelo cliente, para que a ferramenta mantenha o significado anunciado.

As ferramentas de lista que historicamente aceitavam filtros continuam aceitando-os. `mapa.listar` aceita `tipo`, `criador` e `verificado` como filtros opcionais; `mapa.filtrar` exige pelo menos um desses filtros não vazio.

A ferramenta `paginas.verificar` requer um id explícito no servidor MCP. O contexto HTTP de um cliente MCP não é o mesmo contexto de Host/path de um navegador, portanto o servidor não tenta inferir a página atual do cliente.

A ferramenta `links.verificar` não disponibiliza `funcao=pendentes`: a documentação do contrato público alerta que essa consulta pode conter dados operacionais, portanto ela não é apropriada para exposição irrestrita via MCP. A função `uma` exige um id.

As funções `uma` de `novidades.verificar` e `servicos_streaming.verificar` também exigem id explícito.

A ferramenta `sos.listar` usa a operação pública de alertas do SDK. Não envia permissões de notificação do navegador e não tenta reproduzir preferências locais do usuário.

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

Respostas binárias não são expostas pelas ferramentas. Os erros são simplificados para evitar revelar detalhes internos de infraestrutura.

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
