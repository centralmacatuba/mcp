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

Antes da publicação de `@centralmacatuba/api@0.1.0`, a dependência precisa ser compilada localmente e ligada ao pacote MCP, seguindo o mesmo fluxo da CI:

```bash
git clone https://github.com/centralmacatuba/mcp.git
cd mcp
git clone https://github.com/centralmacatuba/api-sdk.git api-sdk
cd api-sdk
git checkout 4582e6591ecdd197ccbc03a8edec92ff9dac71da
pnpm install --frozen-lockfile
pnpm build
cd ..

node -e "const fs=require('node:fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.dependencies['@centralmacatuba/api']='file:./api-sdk';fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\\n')"

pnpm install --no-frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

O ajuste para `file:./api-sdk` é local e temporário; não o versione. Depois que a versão compatível do SDK estiver publicada, uma instalação limpa poderá resolver a dependência diretamente pelo npm.
