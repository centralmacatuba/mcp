# Instalação

## Requisitos

- Node.js 20 ou superior.
- Um cliente compatível com Model Context Protocol.
- Acesso à versão compatível de `@centralmacatuba/api`, conforme declarada em `package.json`.

## Instalação do pacote publicado

Depois que `@centralmacatuba/mcp` e sua dependência pública `@centralmacatuba/api` estiverem disponíveis no npm:

```bash
pnpm add @centralmacatuba/mcp
```

O pacote fornece executáveis e módulos para os transportes STDIO e Streamable HTTP. O uso de outro gerenciador pelo consumidor também é possível, mas o desenvolvimento deste repositório é padronizado em pnpm 12.12.1.

## Desenvolvimento a partir do código-fonte

Enquanto os pacotes ainda não estiverem publicados, clone o repositório e siga as instruções de desenvolvimento:

```bash
git clone https://github.com/centralmacatuba/mcp.git
cd mcp
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

A CI constrói a dependência `@centralmacatuba/api` a partir do repositório `centralmacatuba/api-sdk` durante a fase de desenvolvimento integrado. O consumidor do pacote publicado utilizará a versão do SDK indicada em `package.json`.
