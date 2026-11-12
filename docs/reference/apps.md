# Referência de MCP Apps

As interfaces são recursos UI associados às ferramentas correspondentes. São empacotadas como HTML autocontido em `dist/apps/`, sem dependência de CDN de terceiros durante a execução.

| Interface | URI do recurso | Ferramenta associada |
| --- | --- | --- |
| Tempo | `ui://centralmacatuba/tempo` | `tempo.listar` |
| Serviços | `ui://centralmacatuba/servicos` | `servicos.listar`, `servicos.pesquisar` |
| Mapa | `ui://centralmacatuba/mapa` | `mapa.listar` |
| Jornal | `ui://centralmacatuba/jornal` | `jornal.listar` |
| Informações | `ui://centralmacatuba/informacoes` | `informacoes.listar` |
| Cursos | `ui://centralmacatuba/servicos/cursos` | `servicos_cursos.pesquisar`, `servicos_cursos.verificar` |
| SOS | `ui://centralmacatuba/sos` | `sos.listar` |
| Calendário | `ui://centralmacatuba/calendario` | `calendario.gerar`, `calendario.verificar` |
| Novidades | `ui://centralmacatuba/novidades` | `novidades.pesquisar`, `novidades.verificar`, `avisos.verificar` |
| Docs - Serviços Macatuba | `ui://centralmacatuba/servicos/docs` | `servicos_docs.pesquisar`, `servicos_docs.verificar` |
| Jogos - Serviços Macatuba | `ui://centralmacatuba/servicos/jogos` | `servicos_jogos.pesquisar`, `servicos_jogos.verificar` |
| Streaming - Serviços Macatuba | `ui://centralmacatuba/servicos/streaming` | `servicos_streaming.pesquisar`, `servicos_streaming.verificar`, `servicos_streaming.live_verificar` |

## Paginação e consentimento\n\nAs interfaces de catálogo permitem navegar por `page` e `limit` quando a ferramenta associada oferece paginação. A interface SOS só envia a preferência `X-CM-SOS-PERMISSION: granted` quando o usuário marca explicitamente a opção de consentimento.\n\n## Compatibilidade

Clientes que implementam MCP Apps podem renderizar a interface interativa. Clientes sem suporte a Apps continuam podendo utilizar as ferramentas e receber seus conteúdos textuais/estruturados.

As interfaces são uma camada de apresentação: não criam novos endpoints nem fazem chamadas diretas a serviços privados. Os dados continuam chegando pelos handlers das ferramentas e pelo SDK público.
