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

## Documentation

Documentation should describe decisions that matter to future contributors and agents.

Do not document obvious implementation details that can be understood directly from the code.
