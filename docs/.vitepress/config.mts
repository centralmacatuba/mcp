import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "pt-BR",
  title: "@centralmacatuba/mcp",
  description: "Documentação oficial do servidor MCP da Central Macatuba.",
  base: "/mcp/",
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    siteTitle: "@centralmacatuba/mcp",
    nav: [
      { text: "Início", link: "/" },
      { text: "Guia", link: "/guide/installation" },
      { text: "Referência", link: "/reference/tools" },
      { text: "GitHub", link: "https://github.com/centralmacatuba/mcp" }
    ],
    sidebar: {
      "/guide/": [{
        text: "Guia",
        items: [
          { text: "Instalação", link: "/guide/installation" },
          { text: "Primeiros passos", link: "/guide/getting-started" },
          { text: "Configuração", link: "/guide/configuration" },
          { text: "Transportes", link: "/guide/transports" },
          { text: "Clientes", link: "/guide/clients" },
          { text: "Desenvolvimento", link: "/guide/development" }
        ]
      }],
      "/reference/": [{
        text: "Referência",
        items: [
          { text: "Ferramentas", link: "/reference/tools" },
          { text: "MCP Apps", link: "/reference/apps" },
          { text: "Arquitetura e segurança", link: "/reference/architecture" },
          { text: "Compatibilidade", link: "/reference/compatibility" }
        ]
      }]
    },
    search: { provider: "local" },
    socialLinks: [{ icon: "github", link: "https://github.com/centralmacatuba/mcp" }],
    footer: {
      message: "Servidor MCP de um projeto independente, sem vínculo institucional com a Prefeitura Municipal de Macatuba.",
      copyright: "Desenvolvido por Desenvolvedor EE (Dev EE)."
    }
  }
});
