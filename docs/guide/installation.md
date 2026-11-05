# Instalação

## Requisitos

- Node.js 20 ou superior.
- Um cliente compatível com Model Context Protocol.
- Acesso ao pacote `@centralmacatuba/api` na versão compatível definida em `package.json`.

## Instalação pelo npm

```bash
npm install @centralmacatuba/mcp
```

Ou com pnpm:

```bash
pnpm add @centralmacatuba/mcp
```

O pacote fornece executáveis e módulos para os transportes STDIO e Streamable HTTP.

## Desenvolvimento local

```bash
git clone https://github.com/centralmacatuba/mcp.git
cd mcp
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

O repositório utiliza pnpm 12.12.1. Durante o desenvolvimento integrado, a CI compila o SDK da API a partir da branch de desenvolvimento correspondente; consumidores devem utilizar a versão publicada indicada pelo pacote.
