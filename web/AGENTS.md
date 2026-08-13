<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# Web Agent Guidelines

## Context

This directory contains the CyberGuard frontend.

The frontend uses Next.js, React, and TypeScript.

## Before Making Changes

Read:

- `../AGENTS.md`
- `docs/conventions.md`

Follow the existing UI and application structure.

## Responsibilities

The frontend is responsible for:

- presentation;
- user interaction;
- local UI state;
- navigation;
- animations;
- communicating with the API.

The frontend is not the source of truth for business rules.

Never determine authoritative:

- player points;
- mission completion;
- correct answers;
- ranking position.

## API Communication

Use the shared contracts from the root `contracts/` package when applicable.

Do not duplicate API types manually when an existing shared contract exists.

## Quiz

Quiz state may be managed locally for UI purposes.

The frontend must not assume that locally stored answers, scores, or completion state are authoritative.

## Realtime

WebSocket is used for leaderboard and player score updates.

Do not use WebSocket where a normal HTTP request is sufficient.

## UI

Follow the CyberGuard visual identity and Material Design principles established by the project.

Prefer reusable components over duplicated UI structures.

Avoid introducing a component abstraction for a single trivial element.

## Code Quality

Use TypeScript strictly.

Use Biome for formatting and linting.

Prefer simple React components and predictable state management.

Run relevant linting and tests before completing changes.
