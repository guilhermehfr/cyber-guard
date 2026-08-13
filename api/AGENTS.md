# API Agent Guidelines

## Context

This directory contains the CyberGuard backend API.

The API is a modular monolith built with NestJS, Fastify, Prisma, and PostgreSQL.

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
