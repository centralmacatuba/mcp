---
layout: home
hero:
  name: "@centralmacatuba/mcp"
  text: Servidor MCP da Central Macatuba
  tagline: Conecte clientes compatíveis ao catálogo público da Central Macatuba por ferramentas, recursos e interfaces MCP Apps.
  actions:
    - theme: brand
      text: Começar agora
      link: /guide/installation
    - theme: alt
      text: Explorar ferramentas
      link: /reference/tools
features:
  - title: Ferramentas públicas
    details: Consultas somente leitura, validadas e vinculadas às operações permitidas pelo SDK oficial da API.
  - title: Dois transportes
    details: Execução local por STDIO ou serviço remoto por Streamable HTTP.
  - title: MCP Apps
    details: Interfaces interativas autocontidas para Tempo, Serviços, Mapa, Jornal, Informações, Cursos e SOS.
---

## Sobre

O `@centralmacatuba/mcp` é o servidor oficial de integração do projeto independente **Central Macatuba** com o [Model Context Protocol](https://modelcontextprotocol.io/).

Ele não é um SDK de API: atua como uma camada de adaptação entre clientes MCP e o pacote `@centralmacatuba/api`. As requisições de dados passam pelo SDK público, sem criar um segundo cliente HTTP ou expor operações privadas e administrativas.

## Comece

- [Instalação](/guide/installation)
- [Primeiros passos](/guide/getting-started)
- [Configuração](/guide/configuration)
- [Transportes](/guide/transports)
- [Clientes MCP](/guide/clients)
- [Referência de ferramentas](/reference/tools)
- [MCP Apps](/reference/apps)
- [Arquitetura e segurança](/reference/architecture)

## Estado do projeto

O pacote está em desenvolvimento inicial. A implantação PHP existente permanece separada; a publicação deste pacote não altera automaticamente o servidor MCP em produção.

## Projeto independente

A Central Macatuba é desenvolvida por **Desenvolvedor EE (Dev EE)** e não possui relação, vínculo institucional ou afiliação com a Prefeitura Municipal de Macatuba.
