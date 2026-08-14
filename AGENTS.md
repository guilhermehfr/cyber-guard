# AGENTS.md

## Project Overview

CyberGuard is a gamified cybersecurity learning platform built as a monorepo.

The project consists of a web application and a backend API. Players complete cybersecurity missions, earn points, and compete on a leaderboard.

## Repository Structure

```text
/
├── api/          # Backend API
├── web/          # Next.js frontend
├── contracts/    # Shared TypeScript contracts
├── docs/         # Project documentation
├── AGENTS.md     # Agent instructions
└── README.md     # Project overview and setup
```

## General Rules

Keep changes focused on the requested task.

Do not introduce new dependencies unless they provide clear value.

Follow the existing architecture and conventions before introducing new patterns.

Prefer simple solutions over unnecessary abstractions.

Do not modify unrelated files.

Do not rewrite existing code merely for stylistic preference.

Before changing architecture, verify whether the existing project structure already supports the requirement.

## Technology

The main stack is:

* TypeScript
* NestJS
* Fastify
* Next.js
* React
* PostgreSQL
* Prisma
* Docker
* WebSockets
* Biome
* pnpm

The API uses Prisma as its database access layer.

The frontend and backend are separate applications within the monorepo.

## Code Quality

Use TypeScript strictly.

Prefer explicit types at system boundaries.

Avoid `any` unless there is a justified reason.

Prefer small, cohesive functions.

Keep business logic out of controllers and UI components when it belongs to a dedicated application/domain layer.

Validate external input before processing it.

Never trust client-provided game state, scores, or completion results.

## Formatting and Linting

Biome is the project's formatter and linter.

Do not introduce ESLint or Prettier unless explicitly requested.

Follow the existing `biome.json` configuration.

Before considering a change complete, run the relevant checks for the affected application.

## Environment Variables

Never hardcode secrets, credentials, database URLs, JWT secrets, or OAuth credentials.

Environment variables must be validated before application startup.

Do not commit real `.env` files or secrets.

Example environment files may be committed.

## Backend

Backend-specific architecture and conventions are documented in:

```text
api/AGENTS.md
api/docs/conventions.md
```

Follow those documents when working inside `api/`.

## Frontend

Frontend-specific architecture and conventions are documented in:

```text
web/AGENTS.md
web/docs/conventions.md
```

Follow those documents when working inside `web/`.

## Contracts

Shared contracts belong in `contracts/`.

Do not duplicate shared request/response types across the frontend and backend when an appropriate shared contract already exists.

## Documentation

Update documentation when a change introduces or modifies a persistent project rule, architectural decision, setup requirement, or development convention.

Do not update documentation merely because a file or implementation detail changed.

Keep documentation concise and synchronized with the actual implementation.

## Git

Make focused commits.

Every commit must include a clear, simple, and direct description of its changes in the message body.

Do not combine unrelated changes into a single commit.

Do not rewrite or squash existing commits unless explicitly requested.

Never commit secrets, credentials, generated build artifacts, or local environment files.

## Agent Behavior

Inspect the existing implementation before making changes.

Prefer modifying existing patterns over creating competing patterns.

If requirements are ambiguous, identify the ambiguity before making a consequential architectural decision.

Do not claim that a change works without verifying it when verification is possible.

Keep changes proportional to the current stage of the project.