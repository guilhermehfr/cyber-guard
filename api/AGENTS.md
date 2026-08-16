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
- `missions` module: list missions, list a mission's questions
  (`GET /missions/:id/questions`, no correctness data), start a gameplay
  session (`POST /missions/:id/start` returns a `sessionId` with the public
  question data while the correct answers stay server-side), submit a single
  answer (`POST /missions/:id/answer` returns `{ isCorrect }` evaluated from
  the session in Redis without a database query), complete a mission
  (`POST /missions/:id/complete`, transactional), and list the authenticated
  player's completed mission ids (`GET /missions/completed`). Completion
  requires the `sessionId`; the session must exist, belong to the player, and
  match the mission. A submission must contain exactly one answer for every
  session question, validated against the session's questions (duplicates,
  multiple answers per question, and out-of-session references are rejected).
  `correctCount` is derived exclusively from the session's correct answers, the
  score is `correctCount * mission.points` persisted in `Attempt.score`, and
  `Player.points` increases by the score. Reusing the same mission more than
  once is prevented by `@@unique([playerId, missionId])` and the `P2002`
  handling. Realtime events are emitted and the session is deleted only after a
  successful commit;
- `ranking` module: all players ordered by points with deterministic
  tie-breaking;
- shared HTTP contracts in the `contracts/` package used at the API boundary;
- Vitest unit tests for the services;
- development seed (`pnpm db:seed`) that upserts fictional players for local
  development;
- `realtime` module: WebSocket gateway (public, read-only) that broadcasts
  `ranking.updated` and `player.score.updated` events after a mission completion
  commits;
- `redis` infrastructure module (`src/infrastructure/redis/`): a small
  `RedisService` wrapping a lazy-connected `ioredis` client with `get`, `set`
  with an expiry (`EX`), and `delete`. The client connects during startup and
  closes cleanly during shutdown. The connection URL and the default
  session-oriented TTL (600 seconds) come from configuration (`REDIS_URL`,
  `REDIS_TTL_SECONDS`). Gameplay sessions are stored under `game-session:<uuid>`
  keys by the missions module's `GameSessionService` and expire after the
  configured TTL.

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
- `realtime`

Cross-cutting infrastructure lives under `src/infrastructure/` (`database`,
`redis`).

There is no standalone `attempts` module: mission completions are recorded
through the `Attempt` Prisma model inside the `missions` module.

Keep responsibilities inside their respective modules.

Do not introduce microservices, message brokers, repositories, factories, or additional architectural layers without a concrete requirement.

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

## Redis

Redis is used for temporary, session-oriented state only. Access it exclusively
through the `redis` infrastructure module (`RedisService`); never talk to a Redis
client directly from business modules.

The Redis URL and the default session TTL come from the configuration layer
(`REDIS_URL`, `REDIS_TTL_SECONDS`, default 600). Do not hardcode a TTL or a
connection URL elsewhere.

The missions module keeps temporary gameplay sessions in Redis through
`GameSessionService`; a session is deleted once its mission completion commits,
and expired sessions are treated as missing.

PostgreSQL remains the source of truth: anything that must survive restarts
belongs in the database, not in Redis.

## Realtime

A WebSocket gateway (`realtime` module) broadcasts `ranking.updated` and
`player.score.updated` events after a mission completion commits.

The gateway is public and read-only: it carries no authentication and only
notifies clients of state changes.

The ranking leaderboard is still served over REST by the `ranking` module;
realtime events signal clients to refresh.

Do not use WebSocket for normal quiz interactions unless explicitly required.

## Code Quality

Use Biome for formatting and linting.

Prefer simple and explicit code.

Avoid premature abstractions.

Run relevant linting and tests before completing changes.
