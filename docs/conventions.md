# Project Conventions

## Architecture

CyberGuard is a modular monolithic application.

The repository contains:

- `api/` — backend API;
- `web/` — frontend;
- `contracts/` — shared contracts.

Backend and frontend remain separate applications while sharing explicit contracts.

## Source of Truth

The backend is authoritative for application state.

The frontend is responsible for presentation and interaction.

PostgreSQL is the persistent source of truth.

## Shared Contracts

The `contracts/` package contains the API wire contracts shared between the API and frontend.

`contracts/` is an API contract package, not a generic shared-types folder. Rules:

- contains only data crossing the backend ↔ frontend HTTP boundary;
- is framework-agnostic: no NestJS, Prisma, React, Next.js, or browser imports;
- dates are represented as ISO `string` values (the JSON wire format);
- the API `Difficulty` is the string union `"EASY" | "MEDIUM" | "HARD"`;
- the backend maps internal Prisma/domain representations to the wire contracts
  at the API boundary.

Realtime event types (`RealtimeEvent`, `ranking.updated`, `player.score.updated`)
also live in `contracts/` and follow the same rules (data crosses the API boundary
over the WebSocket channel).

Types that remain outside `contracts/`:

- NestJS DTO classes stay backend-local (they carry framework validation decorators);
- Prisma-generated types stay backend-local;
- frontend UI-specific types stay frontend-local (for example `DifficultyVariant`
  is a frontend presentation concern and is not merged with the API `Difficulty`).

## Local Development

The API runs on port `3000`.

The frontend runs on different ports depending on the workflow:

- local development (`pnpm dev`): `3002`;
- Docker/containerized frontend: `3001`.

Environment files are committed only as examples:

- `api/.env.local` (example: `api/.env.local.example`)
- `web/.env.local` (example: `web/.env.local.example`)

The web application uses two API URL variables:

- `NEXT_PUBLIC_API_URL` — browser-side, embedded at build time;
- `API_URL` — server-side, resolved at runtime (Docker service name inside compose).

`NEXT_PUBLIC_AUTH_BYPASS` bypasses the client-side `/play` authentication guard.
It is development-only: it is honored only when `NODE_ENV` is `development`, so
production builds compile the bypass out even if the variable is set. Never enable
it in a production build.

The API CORS origin is configured through `WEB_URL` and restricted to allowed
frontend origins. `WEB_URL` accepts a comma-separated list of origins (used in
development to support multiple frontend ports). Never use `*` or hardcode CORS
origins or API URLs in code.

Docker Compose manages the full stack (PostgreSQL, Redis, API, web) from the
repository root. Containers start in dependency order: the API waits for healthy
PostgreSQL and Redis, and the web application waits for a healthy API.

## Communication

HTTP is used for normal application operations.

A WebSocket gateway on `/realtime` broadcasts `ranking.updated` and
`player.score.updated` events after a mission completion commits. The gateway is
public and read-only; it never carries credentials or sensitive data.

Realtime events notify clients that server-side state changed so they can refetch
the affected REST resources (the leaderboard remains served over REST).

Do not introduce realtime infrastructure where normal HTTP communication is sufficient.

## Security

Never trust client-controlled business data.

The server must determine:

- player identity;
- mission validity;
- answer correctness;
- mission completion;
- points;
- ranking.

## Dependencies

Prefer existing project dependencies.

Do not introduce a library when the existing stack already provides an adequate solution.

## Architecture Decisions

Favor simple, explicit solutions.

Avoid premature abstraction.

Avoid introducing microservices, brokers, or additional infrastructure without a concrete requirement.

Redis is reserved for temporary, session-oriented state (gameplay sessions). It is
accessed only through the API's `redis` infrastructure module; PostgreSQL remains
the persistent source of truth.

## Code Quality

Use TypeScript.

Use Biome for formatting and linting.

Keep code readable, predictable, and maintainable.

## Imports

Group imports by category, with exactly one blank line between categories.

Categories are based on the import's actual role, in this order:

- External dependencies
- Internal aliases
- Components
- Services / libraries
- Types
- Local relative imports

Keep imports from the same category together. Do not create arbitrary categories for individual imports.

```ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { configuration } from "@/config/config.js";
import { envValidationSchema } from "@/config/env.validation.js";

import { HealthController } from "@/health.controller.js";

import type { AppConfig } from "@/config/config.js";
```

## ESM Import Conventions

The project runs on ESM. TypeScript source imports use explicit `.js` extensions so the emitted output resolves at runtime under Node's ESM resolver.

- Do not strip `.js` extensions to satisfy a linter; they are required for ESM resolution.
- NestJS dependency-injection classes referenced in constructor parameters require normal runtime imports rather than `import type`, because `emitDecoratorMetadata` records the class reference for injection. A `biome-ignore` for `useImportType` is intentional in those cases.
- DTO imports should be value imports when NestJS requires their runtime metatype (for example `@Body() dto: RegisterDto` so `ValidationPipe` can validate), and type-only imports when the class is used purely as a type.
- Linting rules may change independently of the project's ESM and runtime requirements; a lint suggestion must not override a runtime requirement.

## Documentation

Documentation should describe decisions that matter to future contributors and agents.

Do not document obvious implementation details that can be understood directly from the code.
