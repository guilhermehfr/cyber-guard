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

## Authentication

Authentication is handled through the authentication module.

Protected endpoints must require valid authentication.

Never trust user identity or authorization data supplied directly by the client.

## WebSocket

The ranking gateway handles realtime communication.

WebSocket should notify clients about state changes rather than replace normal HTTP operations.

The server remains the source of truth.

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
