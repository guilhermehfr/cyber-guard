# @cyber/web

Frontend da plataforma CyberGuard, construído com Next.js.

## Stack

- Next.js 16 (App Router + Turbopack)
- React 19
- Tailwind CSS 4
- @cyber/contracts para contratos HTTP compartilhados com a API
- Biome para formatação e lint
- pnpm como gerenciador de pacotes (monorepo)

## Requisitos

- Node.js 22+
- pnpm 11+

## Setup

Instale as dependências na raiz do monorepo:

```sh
pnpm install
```

Crie o arquivo de ambiente local a partir do exemplo:

```sh
cp .env.local.example .env.local
```

## Variáveis de ambiente

| Variável                | Uso                                     | Exemplo (dev local)   |
| ----------------------- | --------------------------------------- | --------------------- |
| `NEXT_PUBLIC_API_URL`   | URL da API vista pelo browser           | `http://localhost:3000` |
| `API_URL`               | URL da API usada no server-side         | `http://api:3000`       |

`NEXT_PUBLIC_API_URL` é embutida no bundle durante o `next build` — por isso
deve ser fornecida no build (no Docker, via build arg `NEXT_PUBLIC_API_URL`).
Em produção, use a URL pública real da API; não há domínio fixo no código.
`API_URL` é lida em tempo de execução no server-side e pode usar o nome do
serviço interno (ex.: `http://api:3000` no Docker Compose).

## Scripts

```sh
pnpm dev      # servidor de desenvolvimento em http://localhost:3002
pnpm build    # build de produção
pnpm start    # executa o build em http://localhost:3001
pnpm lint     # biome check .
pnpm format   # biome format --write .
```

A API roda na porta `3000`. O frontend usa portas diferentes conforme o fluxo:

- **Desenvolvimento local** (`pnpm dev`): `http://localhost:3002`;
- **Docker/containerizado** (`pnpm start` / container): `http://localhost:3001`.

As portas são definidas nos scripts (`next dev -p 3002` / `next start -p 3001`) e
no container via `PORT=3001`.

## Docker

A imagem é construída a partir do `web/Dockerfile` (multi-stage, pnpm). O build
recebe `NEXT_PUBLIC_API_URL` como argumento:

```sh
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.exemplo.com \
  -f web/Dockerfile .
```

No Docker Compose, a Web expõe `3001:3001`, conecta-se à API por
`http://api:3000` (server-side) e só inicia após a API ficar saudável.

## Estrutura

```text
src/
├── app/                    # Rotas (App Router)
│   ├── layout.tsx
│   ├── page.tsx
│   └── play/
│       └── page.tsx
├── components/             # Componentes de UI
│   ├── landing/
│   ├── layout/
│   └── play/
├── features/               # Recursos por domínio
│   └── auth/
├── lib/
│   ├── api/                # Cliente HTTP
│   └── websocket.ts
└── proxy.ts
```