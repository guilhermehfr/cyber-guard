# CyberGuard

CyberGuard é uma plataforma gamificada de conscientização em segurança digital, desenvolvida como teste técnico para a AEXP Business Games.

Jogadores completam quizzes curtos sobre segurança digital, acumulam pontos e competem em um ranking.

## Status

Em desenvolvimento inicial.

## Experiência Principal

Landing Page → Autenticação → Missões → Quiz → Resultado → Ranking.

## Principais Temas

- Phishing
- Senhas e Autenticação
- Engenharia Social
- Segurança em Wi-Fi Público
- Proteção de Dados

## Stack

- TypeScript
- Next.js
- React
- NestJS
- Fastify
- Prisma
- PostgreSQL
- WebSocket
- Docker

## Estrutura

```text
/
├── api/          # Backend (NestJS + Fastify, porta 3000)
├── web/          # Frontend (Next.js, porta 3002 dev / 3001 Docker)
├── contracts/    # Contratos compartilhados entre api e web
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## Executando localmente

Monorepo pnpm com três workspaces: `api`, `web` e `contracts`.

Instale as dependências:

```sh
pnpm install
```

Crie os arquivos de ambiente a partir dos exemplos:

```sh
cp api/.env.local.example api/.env.local
cp web/.env.local.example web/.env.local
```

Preencha `api/.env.local` com as variáveis obrigatórias (`JWT_SECRET`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`). A API valida as variáveis na inicialização e falha se estiverem ausentes.

Para desenvolvimento fora do Docker:

```sh
pnpm --filter @cyber/api dev     # API em http://localhost:3000
pnpm --filter @cyber/web dev     # Web em http://localhost:3002 (desenvolvimento local)
```

A API roda na porta `3000`. O frontend usa duas portas conforme o fluxo:

- **Desenvolvimento local** (`pnpm dev`): `http://localhost:3002`;
- **Docker/containerizado**: `http://localhost:3001`.

Com a API de pé, os dados de desenvolvimento (players para o ranking) podem ser
populados com:

```sh
pnpm --filter @cyber/api db:seed
```

O seed é idempotente, serve apenas para desenvolvimento e não roda em produção.

### Com Docker

Suba a stack completa (PostgreSQL + API + Web):

```sh
pnpm docker:up
pnpm docker:down     # para a stack (mantém volume e imagens)
pnpm docker:reset    # remove containers, volume, imagens e rede
```

- API: http://localhost:3000
- Web: http://localhost:3001
- PostgreSQL: localhost:5432 (somente para depuração local)

A Web só inicia depois que a API responde ao healthcheck; a API só inicia depois que o
PostgreSQL está saudável. CORS da API liberado apenas para a origem configurada em `WEB_URL`.

No primeiro início (ou após `docker:reset`), o entrypoint do contêiner da API aplica as
migrations e executa o seed automaticamente (`prisma migrate deploy` + `prisma db seed`),
tornando um `docker:up` em banco vazio auto-suficiente. O seed é idempotente e seguro em
reinicializações.

Em produção, `NEXT_PUBLIC_API_URL` deve ser fornecida no build da Web com a URL pública da API;
`API_URL` (server-side) aponta para o serviço interno. Não há domínio fixo no código.
