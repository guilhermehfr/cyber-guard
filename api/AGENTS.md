# API Agent Guidelines

## Context

This directory contains the CyberGuard backend API.

The API is a modular monolith built with NestJS, Fastify, Prisma, and PostgreSQL.

## Current State

The API currently has only the foundation layer in place:

- NestJS with the Fastify adapter;
- centralized configuration in `src/config/config.ts`;
- environment validation with Joi in `src/config/env.validation.ts`;
- CORS restricted to the configured frontend origin;
- Docker setup (`api/Dockerfile`, root `docker-compose.yml`).

The domain modules (`auth`, `players`, `missions`, `attempts`, `ranking`), Prisma
integration, and WebSocket gateway described below are the target architecture and
are not implemented yet.

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
- `attempts`
- `ranking`

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

WebSocket is currently used for leaderboard and player score updates.

Do not use WebSocket for normal quiz interactions unless explicitly required.

## Code Quality

Use Biome for formatting and linting.

Prefer simple and explicit code.

Avoid premature abstractions.

Run relevant linting and tests before completing changes.
