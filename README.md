<div align="center">

# 🛡️ CyberGuard

A gamified digital security learning platform where players complete missions, answer questions, earn points, and compete on a real-time leaderboard.

[![License: MIT](https://img.shields.io/github/license/guilhermehfr/cyber-guard)](https://github.com/guilhermehfr/cyber-guard/blob/dev/LICENSE)
[![Vercel](https://img.shields.io/badge/Vercel-Demo-000000?logo=vercel&logoColor=white)](https://cyberguard-aexp.vercel.app)
[![Render](https://img.shields.io/badge/Render-API-46E3B7?logo=render&logoColor=white)](https://cyber-guard-8j1x.onrender.com)


**Backend:** NestJS · Fastify · Prisma · PostgreSQL · Redis  
**Frontend:** Next.js · React · TypeScript  
**Infrastructure/Tooling:** Docker Compose · pnpm · Vitest · Biome

🌐 _[Leia em Português](README-pt-br.md)_

<img src="https://github.com/user-attachments/assets/d9e1aef3-1709-4975-8cca-7d64ad18962f" alt="CyberGuard" width="820" />

[GitHub](https://github.com/guilhermehfr/cyber-guard) · [Demo](https://cyberguard-aexp.vercel.app) · [Report a Bug](https://github.com/guilhermehfr/cyber-guard/issues)

</div>

---

## ✨ Features

- **Sign-up and login** with email and password, with password hashing via Argon2.
- **JWT authentication stored in an HttpOnly cookie**, preventing the token from being accessed directly by browser JavaScript.
- **Google social login (OAuth 2.0)**, with its own `state` flow for CSRF protection on the callback.
- **Protected routes** on the backend via `JwtAuthGuard`/Passport-JWT strategy, and access gating on the frontend based on session state.
- **Gamified missions** with three difficulty levels (Easy, Medium, Hard), each with its own scoring.
- **Questions and answers per mission**, with a flow for starting a mission, submitting answers, and finishing.
- **Player leaderboard** with deterministic tiebreak criteria.
- **Real-time leaderboard updates via WebSocket**, automatically reflecting new scores without needing to reload the page.

### Mission mechanics

Each mission belongs to a difficulty level (`EASY`, `MEDIUM`, or `HARD`), which determines the mission's total score. The player starts a mission, answers its questions one by one, and upon completion the backend calculates the score based on the number of correct answers multiplied by the mission's points — the result is never calculated or trusted from the client.

---

## 🛡️ Security & Integrity

CyberGuard was designed so the frontend is never treated as a trusted source for scoring or critical game state. Some relevant technical decisions:

- **The frontend is not the source of truth.** The client only sends the answers chosen by the player; all correctness validation and score calculation happen on the backend, based on answer-key data loaded from the database at the start of the mission.
- **JWT in an HttpOnly cookie.** The authentication token is never exposed to browser JavaScript — it travels automatically between browser and API through an HttpOnly cookie, reducing the attack surface for XSS.
- **Duplicate mission-completion prevention.** Beyond service-level validation, there's a uniqueness constraint at the database level (`@@unique([playerId, missionId])`, on the `Attempt` table), ensuring a player can't be scored twice for the same mission even under concurrent requests.
- **Transactional mission completion.** Reading the mission, creating the attempt (`Attempt`), and incrementing the player's points happen within a single Prisma transaction. If a concurrent request violates the uniqueness constraint, the conflict is handled as an appropriate domain error (`ConflictException`) instead of corrupting the player's state.

---

## 🛠 Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| NestJS | Main API framework |
| Fastify | HTTP adapter used by NestJS |
| Prisma | ORM and database access |
| PostgreSQL | Relational database, source of truth |
| Redis | Temporary state for in-progress game sessions |
| Passport + JWT | Token-based authentication |
| Google OAuth 2.0 | Social authentication |
| WebSocket (`@nestjs/websockets`) | Real-time communication with the frontend |
| class-validator / ValidationPipe | Input data validation |
| Vitest | Unit and integration testing |

### Frontend

| Technology | Purpose |
|---|---|
| Next.js | React framework with App Router |
| React | UI library |
| TypeScript | Static typing |
| Tailwind CSS | Utility-first styling |
| Native WebSocket | Receiving real-time events from the API |
| Biome | Linting and formatting |

### Tooling & Infrastructure

| Tool | Purpose |
|---|---|
| TypeScript | Foundation of the entire monorepo |
| pnpm | Package manager and workspaces |
| Docker Compose | Local orchestration of API, frontend, database, and Redis |
| Biome | Code standardization across the monorepo |
| Vitest | Automated API testing |
| Prisma | Database migrations and schema |
| GitHub Actions | Quality pipeline on pull requests |

---

## 🎮 Gameplay

The game flow follows this journey:

```
Landing page → sign-up/login → game area → difficulty selection
→ mission selection → mission start → questions → answer submission
→ mission completion → score update → leaderboard
```

Missions are organized into three difficulty levels:

- **Easy** — questions with 2 answer options.
- **Medium** — questions with 3 answer options.
- **Hard** — questions with 4 answer options.

Each mission has its own set of questions, and the mission's total score varies according to the chosen difficulty level.

During gameplay, a timer is displayed as a gamification element and visual feedback for the player. Answer validation and score calculation remain entirely the backend's responsibility, regardless of the time elapsed in the interface.

---

## 📡 Real-time

CyberGuard uses WebSocket to keep the leaderboard updated in real time. Whenever a player completes a mission, the backend emits events (`ranking.updated` and `player.score.updated`) through a public, read-only WebSocket gateway. The frontend listens for these events to automatically update the displayed leaderboard, without needing to reload the page.

WebSocket is used exclusively for state-change notifications — it does not replace the HTTP API or participate in the authentication flow; all sensitive communication continues to happen via REST.

---

## 📁 Project Structure

```
cyber-guard/
├── api/                        # NestJS Backend
│   ├── src/
│   │   ├── config/              # Environment variable configuration and validation
│   │   ├── infrastructure/
│   │   │   ├── database/        # Prisma integration
│   │   │   └── redis/           # Redis access (game sessions)
│   │   └── modules/
│   │       ├── auth/            # Sign-up, login, JWT, Google OAuth
│   │       ├── missions/        # Missions, questions, game sessions, completion
│   │       ├── players/         # Internal player queries
│   │       ├── ranking/         # Leaderboard and player standing
│   │       └── realtime/        # WebSocket gateway
│   └── prisma/                  # Schema, migrations, and database seed
│
├── web/                        # Next.js Frontend
│   └── src/
│       ├── app/                 # Routes (App Router)
│       ├── components/          # Shared UI components
│       ├── features/
│       │   ├── auth/             # Login, sign-up, session
│       │   ├── missions/         # Mission selection and gameplay
│       │   └── ranking/          # Leaderboard and podium
│       └── lib/                 # HTTP client and WebSocket client
│
├── contracts/                  # TypeScript types shared between API and frontend
│   └── src/
│
├── docs/                       # Supplementary documentation
├── docker-compose.yml           # Local orchestration (API, web, PostgreSQL, Redis)
└── pnpm-workspace.yaml           # Monorepo definition
```

---

## 🧱 Architecture

CyberGuard is a monorepo managed with pnpm, split into three main packages: `api` (backend), `web` (frontend), and `contracts` (shared types).

The backend is a modular monolith built with NestJS — not a microservices architecture — with a clear separation of concerns between the `Auth`, `Missions`, `Players`, `Ranking`, and `Realtime` modules, each encapsulating its own business logic within the same process and deployment. PostgreSQL, via Prisma, is the source of truth for data.

During a mission, the game session state — questions, answer key, and answers already submitted by the player — is temporarily kept in Redis, isolated from PostgreSQL, between the start and completion of the mission. Upon completion, the result is persisted to PostgreSQL transactionally and the corresponding session is removed from Redis; this is also the moment the real-time update event is emitted to the leaderboard.

The `contracts` package holds the TypeScript types shared between frontend and backend — such as request/response formats for authentication, missions, leaderboard, and real-time events — avoiding type duplication between the two applications.

---

## 🧪 Testing

The backend has unit tests for services and controllers, covering authentication, missions, leaderboard, Redis infrastructure, and the real-time gateway. Some examples:

- `missions.service.spec.ts` — covers mission completion logic, duplicate prevention, and transactions.
- `auth.controller.spec.ts` / `auth.service.spec.ts` — sign-up, login, and session cookie flow.
- `password.service.spec.ts` — password hashing and verification.
- `ranking.service.spec.ts` — leaderboard sorting and tiebreak criteria.
- `realtime.gateway.spec.ts` — real-time event emission.
- `redis.service.spec.ts` — Redis infrastructure access.

Tests are run with Vitest.

---

## 🚀 Getting Started

### Prerequisites

- Node.js
- pnpm
- Docker

### Installation

```bash
git clone https://github.com/guilhermehfr/cyber-guard.git
cd cyber-guard
pnpm install
```

### Running with Docker Compose

```bash
pnpm docker:up     # docker compose up -d --build
pnpm docker:down   # docker compose down
pnpm docker:reset  # docker compose down -v --rmi all --remove-orphans
```

This brings up the four services defined in `docker-compose.yml`: `api` (port 3000), `web` (port 3001), `db` (PostgreSQL, port 5432), and `redis` (port 6379).

### Environment variables

The API validates its environment variables on startup (`api/src/config/env.validation.ts`). Use `api/.env.local.example` as a reference. The frontend uses `web/.env.local.example` as a reference.

> Google OAuth credentials are required for the API to start, even if you only intend to test email/password login.

### Running locally without Docker

With PostgreSQL and Redis available (locally or via Docker) and environment variables configured:

```bash
pnpm --filter api prisma:migrate   # applies migrations
pnpm --filter api db:seed          # seeds development data
```

Running everything in parallel:

```bash
pnpm dev
```

Or running each application individually:

```bash
pnpm --filter api dev   # http://localhost:3000
pnpm --filter web dev   # http://localhost:3002
```

### Build

```bash
pnpm build
```

---

## 👋 Contact

- GitHub: [guilhermehfr](https://github.com/guilhermehfr)
- LinkedIn: [guilhermehe](https://www.linkedin.com/in/guilhermehe/)
