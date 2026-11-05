# Configuração

O servidor lê as opções de ambiente no início da execução.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `CM_API_BASE_URL` | `https://publica.api.centralmacatuba.qzz.io` | URL base da API pública |
| `CM_API_TIMEOUT_MS` | `20000` | Timeout das chamadas feitas pelo SDK |
| `PORT` | `3000` | Porta HTTP, compatível com plataformas de hospedagem |
| `MCP_HTTP_PORT` | `3000` | Porta do transporte HTTP; tem precedência sobre `PORT` |
| `MCP_HTTP_HOST` | `0.0.0.0` | Interface de escuta HTTP |
| `MCP_ALLOWED_HOSTS` | `localhost,127.0.0.1,[::1]` | Lista separada por vírgulas de hosts HTTP aceitos |
| `MCP_ALLOWED_ORIGINS` | vazio | Origens browser explicitamente permitidas |

## Exemplo de ambiente

Copie `.env.example` para `.env` e ajuste apenas as variáveis necessárias. Não coloque credenciais privadas da Central Macatuba neste servidor: ele consome exclusivamente a API pública.

## Segurança

- Use HTTPS quando o serviço estiver exposto à Internet.
- Configure `MCP_ALLOWED_HOSTS` com os hostnames exatos utilizados.
- Defina `MCP_ALLOWED_ORIGINS` somente para origens confiáveis.
- Não use curingas ou allowlists amplas em produção.
- Não exponha o serviço diretamente sem proxy/TLS e controles de rede adequados.
