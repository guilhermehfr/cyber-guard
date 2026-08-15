# API Agent Guidelines

## Context

This directory contains the CyberGuard backend API.

The API is a modular monolith built with NestJS, Fastify, Prisma, and PostgreSQL.

## Current State

Implemented:

- NestJS with the Fastify adapter;
- centralized configuration in `src/config/config.ts`;
- environment validation with Joi in `src/config/env.validation.ts`;
- CORS restricted to the configured frontend origins;
- Prisma integration through `src/infrastructure/database/prisma.service.ts`;
- `auth` module: register, login and current-player endpoints with JWT;
- `players` module: internal player lookups used by auth;
- `missions` module: list missions and complete a mission. Completion is
  transactional, awards points from the persisted mission, and reuses the
  `Attempt` model as the completion record, enforced by `@@unique([playerId, missionId])`
  and the `P2002` handling;
- `ranking` module: top 10 players ordered by points with deterministic
  tie-breaking;
- shared HTTP contracts in the `contracts/` package used at the API boundary;
- Vitest unit tests for the services;
- development seed (`pnpm db:seed`) that upserts fictional players for local
  development.

Not implemented yet:

- WebSocket gateway (planned; REST ranking is implemented).

## Foundation Conventions

Access environment variables only through `src/config/config.ts`. Do not read
`process.env` elsewhere in the codebase.

The CORS origin must come from configuration (`WEB_URL`), never be hardcoded.

Environment variables are validated at boot through `env.validation.ts`; the
application fails to start when required variables are missing.

The API exposes a health check (`GET /`) used by Docker Compose to gate dependent
services.

## Before Making Changes

Read:

- `../AGENTS.md`
- `docs/conventions.md`

Follow the existing architecture before introducing new patterns.

## Architecture

Business domains belong inside `src/modules/`.

Current modules include:

- `auth`
- `players`
- `missions`
- `ranking`

There is no standalone `attempts` module: mission completions are recorded
through the `Attempt` Prisma model inside the `missions` module.

Keep responsibilities inside their respective modules.

Do not introduce microservices, message brokers, Redis, repositories, factories, or additional architectural layers without a concrete requirement.

## Business Logic

The backend is the source of truth.

Never trust client-provided:

- scores;
- mission completion status;
- correct answers;
- player points.

Mission completion must remain protected against duplicate and concurrent requests.

## Database

Use Prisma for database access.

PostgreSQL is the persistent source of truth.

Prefer database constraints when enforcing data integrity.

## Realtime

The WebSocket gateway is planned but not implemented.

The ranking leaderboard is currently served over REST by the `ranking` module.

Do not use WebSocket for normal quiz interactions unless explicitly required.

## Code Quality

Use Biome for formatting and linting.

Prefer simple and explicit code.

Avoid premature abstractions.

Run relevant linting and tests before completing changes.
