# Web Conventions

## Framework

The frontend uses Next.js with the App Router.

Prefer server components by default.

Use client components only when client-side interactivity or browser APIs are required.

## Components

Reusable components should be organized according to their scope.

Keep page-specific components close to the page when they are not reused elsewhere.

Avoid creating generic components without a concrete reuse case.

## State

Separate UI state from server state.

Local state may control:

- selected answers;
- current question;
- animations;
- modal visibility;
- visual feedback.

Server state controls authoritative data such as:

- player points;
- mission completion;
- ranking;
- authenticated player identity.

## API

API communication should use shared contracts whenever applicable.

Do not duplicate backend response types manually.

Do not calculate authoritative scores on the client.

The API base URL must come from environment variables, never hardcoded:

- `NEXT_PUBLIC_API_URL` for browser-side code (embedded at build time);
- `API_URL` for server-side code (runtime, may use the Docker service name).

The API runs on port `3000`. The frontend runs on port `3002` with local `pnpm dev`
and on port `3001` in the Docker/containerized workflow.

## Authentication

Authentication relies on an HttpOnly session cookie set by the API
(`cyberguard.session`); the token is never exposed to browser JavaScript.

Requests must send `credentials: "include"` so the browser includes the cookie
on cross-origin calls to the API.

Client-side code determines the authenticated state by reading the non-HttpOnly
marker cookie `cyberguard.auth` (set to `1` when signed in) via
`isAuthenticated()` in `features/auth/lib/session.ts`. The marker reflects the
server-issued session and is cleared together with the session cookie by
`POST /auth/logout`.

Do not store tokens in `localStorage`. Log out by calling `authApi.logout()` and
then navigating away.

## Quiz Flow

The frontend may maintain the current quiz state locally.

A mission attempt should identify:

- `attemptId`;
- `questionId`;
- selected `answerId`.

The backend validates the submitted answers and determines the authoritative result.

## Realtime

A WebSocket connection (`web/src/lib/websocket.ts`) receives realtime events from
the API gateway on `/realtime`.

Realtime events signal that server-side state changed; the client should refetch
the affected REST resources. The ranking is still loaded via `GET /ranking`.

Do not send credentials or sensitive data over the realtime channel.

## Styling

Follow the CyberGuard design system.

Primary colors:

- Deep Blue: `#0B1F33`
- Electric Blue: `#2563EB`
- Cyan: `#06B6D4`
- Light Gray: `#F1F5F9`

Follow Material Design 3 principles for spacing, hierarchy, accessibility, components, and interaction feedback.

## Accessibility

Interactive elements must be keyboard accessible.

Buttons should have clear labels.

Do not rely solely on color to communicate success or failure.

## Naming

Use:

- `camelCase` for variables and functions;
- `PascalCase` for React components;
- descriptive component names;
- kebab-case for route segments where appropriate.

## General Principle

Prefer clear UI logic over excessive abstraction.

Keep business rules on the backend.

Do not introduce state management libraries unless the application's complexity actually requires them.
