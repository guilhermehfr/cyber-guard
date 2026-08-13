# @cyber/api

Backend da plataforma CyberGuard, construído com NestJS e o adaptador Fastify.

## Stack

- NestJS 11
- Fastify
- PostgreSQL (via Docker Compose)
- @nestjs/config + Joi para configuração e validação de variáveis de ambiente
- Biome para formatação e lint
- pnpm como gerenciador de pacotes (monorepo)

## Requisitos

- Node.js 22+
- pnpm 11+
- Docker (opcional, para subir PostgreSQL e o container da API)

## Setup

Instale as dependências na raiz do monorepo:

```sh
pnpm install
```

Crie o arquivo de ambiente local a partir do exemplo:

```sh
cp .env.local.example .env.local
```

Preencha `JWT_SECRET`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no `.env.local`.
`WEB_URL` define a origem liberada no CORS (padrão: `http://localhost:3001`).
A API valida as variáveis obrigatórias na inicialização e falha caso estejam ausentes.

## Scripts

```sh
pnpm dev           # compila e observa mudanças (tsc --watch)
pnpm build         # compila para dist/
pnpm start         # executa dist/main.js
pnpm lint          # biome check src
pnpm lint:fix      # biome check --write src
pnpm format        # biome format --write src
pnpm format:check  # biome format src
```

## Configuração

A configuração da aplicação é centralizada em `src/config/`:

- `config.ts` — fábrica `configuration()` que expõe um objeto tipado `AppConfig`
  (app, database, jwt, google). Não acesse `process.env` fora daqui.
- `env.validation.ts` — schema Joi que valida as variáveis de ambiente
  obrigatórias no boot da aplicação.

## CORS

O CORS é habilitado no bootstrap com origem restrita a `app.webUrl`
(variável `WEB_URL`) e `credentials: true`, para suportar o fluxo de autenticação.
A origem do frontend deve ser configurada em `WEB_URL`, nunca hardcoded.

Os arquivos de ambiente são escolhidos conforme o `NODE_ENV`:

- desenvolvimento: `.env.local`
- produção: `.env.prod`

## Docker

A stack completa (PostgreSQL + API + Web) é gerenciada pelo `docker-compose.yml` da raiz:

```sh
pnpm docker:up      # sobe a stack em detached
pnpm docker:down    # para a stack (mantém volume e imagens)
pnpm docker:reset   # remove containers, volume, imagens e rede
```

- API exposta em `http://localhost:3000`.
- PostgreSQL exposto em `localhost:5432` apenas para depuração local.
- Dados do PostgreSQL persistentes no volume nomeado `pgdata`.
- A API só inicia após o healthcheck do PostgreSQL responder.
- A API possui healthcheck próprio (`GET /`); a Web só inicia após a API ficar saudável.

Ajuste credenciais do banco via `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`.

## Estrutura

```text
src/
├── config/
│   ├── config.ts
│   └── env.validation.ts
├── app.controller.ts
├── app.module.ts
└── main.ts
```
