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

The `contracts/` directory contains types and contracts shared between the API and frontend.

Do not place Prisma models, database-specific types, or internal implementation details inside shared contracts.

## Local Development

The API runs on port `3000`; the web application runs on port `3001`.

Environment files are committed only as examples:

- `api/.env.local` (example: `api/.env.local.example`)
- `web/.env.local` (example: `web/.env.local.example`)

The web application uses two API URL variables:

- `NEXT_PUBLIC_API_URL` — browser-side, embedded at build time;
- `API_URL` — server-side, resolved at runtime (Docker service name inside compose).

The API CORS origin is configured through `WEB_URL` and restricted to that single
origin. Never hardcode CORS origins or API URLs in code.

Docker Compose manages the full stack (PostgreSQL, API, web) from the repository
root. Containers start in dependency order: the API waits for a healthy PostgreSQL,
and the web application waits for a healthy API.

## Communication

HTTP is used for normal application operations.

WebSocket is used for realtime leaderboard and player score updates.

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

Avoid introducing microservices, brokers, Redis, or additional infrastructure without a concrete requirement.

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
