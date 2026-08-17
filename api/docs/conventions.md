# API Conventions

## Module Structure

The API follows a modular monolith architecture.

Business domains are organized under:

`src/modules/`

A module normally contains:

- `*.module.ts`
- `*.controller.ts`
- `*.service.ts`
- `dto/` when required

Only create additional directories when the module actually needs them.

## Configuration

Access environment variables only through the centralized config in `src/config/config.ts`.

Do not read `process.env` elsewhere.

Environment variables are validated at boot with the Joi schema in `src/config/env.validation.ts`.

The CORS origin comes from `WEB_URL` and is restricted to that single origin.

## Controllers

Controllers handle HTTP transport concerns.

They should:

- receive requests;
- validate input through DTOs;
- delegate operations to services;
- return responses.

Controllers should not contain business rules.

## Services

Services contain application behavior and business rules.

Services may access Prisma through the database infrastructure.

Keep services focused on their module's responsibility.

## DTOs

DTOs define and validate external input.

Use NestJS validation with `ValidationPipe`.

Do not use DTOs merely because a module contains them. Create them when a specific contract requires one.

## Database

Prisma is the database access layer.

PostgreSQL is the source of truth.

Use database constraints to enforce integrity where appropriate.

For example, mission completion must prevent the same player from completing the same mission more than once.

## Redis

Redis is used for temporary, session-oriented state (temporary gameplay session
state). The connection and TTL configuration live in the centralized config
(`REDIS_URL`, `REDIS_TTL_SECONDS`, default 600 seconds).

The `redis` infrastructure module (`src/infrastructure/redis/`) exposes
`RedisService` with `get`, `set` (with an expiry), and `delete` only. Business
modules must not create or use Redis clients directly.

Gameplay sessions live under `game-session:<uuid>` keys and are handled by
`GameSessionService` in the missions module, which persists them with the
configured default TTL. A session is deleted once its mission completion
commits; expired sessions are treated as missing.

Redis is not the source of truth: data that must survive restarts belongs in
PostgreSQL.

## Missions

`GET /missions/:id/questions` exposes a mission's questions without any
correctness information: the payload only carries question prompts and answer texts.

`POST /missions/:id/start` creates a gameplay session in Redis
(`GameSessionService`) and returns a `sessionId` together with the same public
question/answer data. The correct answers are stored server-side inside the
session and never leave the API.

`POST /missions/:id/answer` returns `{ isCorrect }` for a single submitted
answer, evaluated against the session's correct answers in Redis without a
database query, and records the submission in the session (refreshing its TTL).

`POST /missions/:id/complete` requires the `sessionId` and evaluates the
submitted answers server-side. The session must exist, belong to the
authenticated player, and reference the same mission. A submission must contain
exactly one answer for every question of the session: duplicate `questionId`
values, multiple answers for the same question, answers referencing questions
outside the session, and answers that do not belong to their submitted question
are rejected. The correct count is derived exclusively from the session's
correct answers. The score is `correctCount * mission.points`, stored in
`Attempt.score`, and `Player.points` increases by the same amount. The
transaction also prevents double completion (`@@unique([playerId, missionId])`
and `P2002` handling). On success the realtime events are emitted and the
session is deleted from Redis. The mission timer is a frontend concern and is
neither validated nor persisted by the API.

## Authentication

Authentication is handled through the authentication module.

Protected endpoints must require valid authentication.

Never trust user identity or authorization data supplied directly by the client.

Browser sessions are cookie-based. On successful register or login the API sets:

- an HttpOnly session cookie (`AUTH_COOKIE_NAME`, default `cyberguard.session`) that
  holds the JWT. Browser JavaScript never has access to it;
- a non-HttpOnly marker cookie (`AUTH_COOKIE_MARKER_NAME`, default `cyberguard.auth`)
  set to `1`. It is only an auth-state indicator for the frontend and never contains
  the JWT.

The cookie lifetime is derived from the JWT `exp` claim, so it stays synchronized
with the JWT lifetime.

SameSite/Secure defaults depend on `NODE_ENV`:

- development: `SameSite=Lax` and `Secure=false` (local ports differ but are still
  same-site);
- production: `SameSite=None` and `Secure=true` (cross-domain cookies).

`AUTH_COOKIE_SECURE` and `AUTH_COOKIE_SAMESITE` environment variables override the
defaults.

Bearer authentication remains supported as a fallback for curl and tests: JWT
extraction prefers the configured auth cookie and falls back to
`Authorization: Bearer ...`.

Logout is `POST /auth/logout`. It is an authenticated endpoint, returns HTTP `204`,
and clears both the session cookie and the marker cookie.

## WebSocket

A WebSocket gateway in the `realtime` module broadcasts `ranking.updated` and
`player.score.updated` events after a mission completion commits.

The gateway is public and read-only: it carries no authentication and never sends
sensitive data (tokens, passwords, hashes).

WebSocket notifies clients about state changes rather than replacing normal HTTP
operations; the ranking leaderboard is still served over REST.

## Error Handling

Use NestJS HTTP exceptions when appropriate.

Avoid generic `Error` instances when a more specific HTTP exception represents the failure.

## Naming

Use:

- `camelCase` for variables and functions;
- `PascalCase` for classes;
- descriptive names for services and modules;
- kebab-case for file names.

Follow NestJS naming conventions.

## General Principle

Prefer the simplest implementation that correctly represents the business requirement.

Do not introduce abstractions solely to satisfy an architectural pattern.
