# Configuração

O servidor lê as opções de `process.env` no início da execução. O arquivo `.env.example` é apenas um modelo: o servidor não carrega arquivos `.env` automaticamente.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `CM_API_BASE_URL` | `https://publica.api.centralmacatuba.qzz.io` | URL base da API pública |
| `CM_API_TIMEOUT_MS` | `20000` | Timeout das chamadas feitas pelo SDK |
| `PORT` | `3000` | Porta HTTP; tem precedência sobre `MCP_HTTP_PORT` |
| `MCP_HTTP_PORT` | `3000` | Porta alternativa do transporte HTTP, usada quando `PORT` não está definido |
| `MCP_HTTP_HOST` | `0.0.0.0` | Interface de escuta HTTP |
| `MCP_ALLOWED_HOSTS` | `localhost,127.0.0.1,::1` | Lista separada por vírgulas de hosts HTTP aceitos; IPv6 loopback deve ser escrito como `::1`, sem colchetes |
| `MCP_ALLOWED_ORIGINS` | vazio | Origens browser explicitamente permitidas |

## Carregar um arquivo .env

Em Linux/macOS, copie o modelo e carregue as variáveis no shell antes de iniciar o processo:

```bash
cp .env.example .env
# Edite .env e mantenha somente valores públicos/locais.
set -a
. ./.env
set +a
pnpm dev
```

Para iniciar o transporte HTTP com o mesmo ambiente:

```bash
set -a
. ./.env
set +a
pnpm start:http
```

No PowerShell, defina as variáveis necessárias no ambiente da sessão com `$env:NOME = "valor"` antes de executar `pnpm dev` ou `pnpm start:http`. Não coloque credenciais privadas da Central Macatuba neste servidor: ele consome exclusivamente a API pública.

## Segurança

- Use HTTPS quando o serviço estiver exposto à Internet.
- Configure `MCP_ALLOWED_HOSTS` com os hostnames exatos utilizados.
- Defina `MCP_ALLOWED_ORIGINS` somente para origens confiáveis.
- Não use curingas ou allowlists amplas em produção.
- Não exponha o serviço diretamente sem proxy/TLS e controles de rede adequados.
