# @cyber/api

Backend da plataforma CyberGuard, construído com NestJS e o adaptador Fastify.

## Stack

- NestJS 11
- Fastify
- Prisma
- PostgreSQL (via Docker Compose)
- @nestjs/config + Joi para configuração e validação de variáveis de ambiente
- @cyber/contracts para contratos HTTP compartilhados com o frontend
- Vitest para testes unitários
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
pnpm dev           # executa e observa mudanças (tsx watch src/main.ts)
pnpm build         # compila para dist/
pnpm start         # executa dist/main.js
pnpm test          # roda os testes unitários (vitest)
pnpm test:watch    # roda os testes unitários em watch mode
pnpm lint          # biome check src
pnpm lint:fix      # biome check --write src
pnpm format        # biome format --write src
pnpm format:check  # biome format src
pnpm db:seed       # popula dados de desenvolvimento (players fictícios)
```

Comandos Prisma:

```sh
pnpm prisma:generate   # gera o client Prisma
pnpm prisma:migrate    # cria e aplica migrations
pnpm prisma:studio     # abre o Prisma Studio
```

## Configuração

A configuração da aplicação é centralizada em `src/config/`:

- `config.ts` — fábrica `configuration()` que expõe um objeto tipado `AppConfig`
  (app, database, jwt, google). Não acesse `process.env` fora daqui.
- `env.validation.ts` — schema Joi que valida as variáveis de ambiente
  obrigatórias no boot da aplicação.

## Banco de dados e seed

O Prisma é configurado em `prisma.config.ts` (schema, migrations e comando de seed).
A config de ambiente é carregada pelo mesmo padrão do `NODE_ENV` (`.env.local` no
desenvolvimento, `.env.prod` na produção).

Seed de desenvolvimento:

```sh
pnpm db:seed
```

Cria ou atualiza um conjunto fixo de players fictícios (identificados por email,
portanto idempotente) para desenvolvimento local. Fora do Docker é um comando manual;
no Docker, o entrypoint do contêiner da API executa `prisma migrate deploy` e este seed
automaticamente a cada início. Em ambos os casos recusa-se a rodar em produção
(`NODE_ENV=production`).

## CORS

O CORS é habilitado no bootstrap com origem restrita a `app.webUrl`
(variável `WEB_URL`) e `credentials: true`, para suportar o fluxo de autenticação.
A origem do frontend deve ser configurada em `WEB_URL`, nunca hardcoded.

Os arquivos de ambiente são escolhidos conforme o `NODE_ENV`:

- desenvolvimento: `.env.local`
- produção: `.env.prod`

## Docker

A stack completa (PostgreSQL + Redis + API + Web) é gerenciada pelo `docker-compose.yml` da raiz:

```sh
pnpm docker:up      # sobe a stack em detached
pnpm docker:down    # para a stack (mantém volume e imagens)
pnpm docker:reset   # remove containers, volume, imagens e rede
```

- API exposta em `http://localhost:3000`.
- PostgreSQL exposto em `localhost:5432` apenas para depuração local.
- Redis exposto em `localhost:6379` apenas para depuração local.
- Dados do PostgreSQL persistentes no volume nomeado `pgdata`.
- Dados do Redis persistentes no volume nomeado `redisdata` (AOF).
- A API só inicia após os healthchecks do PostgreSQL e do Redis responderem.
- A API possui healthcheck próprio (`GET /`); a Web só inicia após a API ficar saudável.
- Para rebuilds, reconstrua apenas o serviço alterado (`docker compose up -d --build api` ou
  `... --build web`). Ao reconstruir a stack inteira, serialize os builds com
  `COMPOSE_PARALLEL_LIMIT=1` para reduzir o pico de memória da build no WSL.
- No primeiro início (ou após `docker:reset`), o entrypoint aplica as migrations e executa
  o seed automaticamente (`prisma migrate deploy` + `prisma db seed`), tornando a stack
  auto-suficiente em banco vazio.

Ajuste credenciais do banco via `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`.

## Estrutura

```text
src/
├── config/
│   ├── config.ts
│   └── env.validation.ts
├── health.controller.ts
├── app.module.ts
├── main.ts
├── infrastructure/
│   └── database/
│       ├── prisma.module.ts
│       └── prisma.service.ts
└── modules/
    ├── auth/
    │   ├── dto/
    │   ├── guards/
    │   ├── strategies/
    │   ├── auth.controller.ts
    │   ├── auth.module.ts
    │   ├── auth.service.ts
    │   └── password.service.ts
    ├── players/
    ├── missions/
    └── ranking/
prisma/
├── migrations/
├── schema.prisma
└── seed.ts
prisma.config.ts
```
