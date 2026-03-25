# Repository Guidelines

## Project Overview

Puslebook is a self-serve appointment tracking app for patients and healthcare professionals.

### Terminology

Users - Any user with an account on the application
Role - A user can be one of patient/healthcare professional (hcp)
Patient - The user who makes an application for an appointment
HCP - The user who receives and takes action on the application for appointment
Slot - A default 15 minute timeslot within the schedule (day/days in a week) specified by the HCP
Appointment - The actual action where a patient books a timeslot with an HCP

For more information refer the below table:

| Database | docs/database.md |
| -------- | ---------------- |

## Project Structure & Module Organization

`pulsebook` is a `pnpm` monorepo. Application code lives in `apps/`:

- `apps/web`: Next.js 15 frontend using the App Router under `src/app/`
- `apps/api`: NestJS API with feature modules under `src/`
- `packages/database`: Prisma schema and config in `prisma/`

Keep new backend features grouped by module in `apps/api/src/<feature>/`. Keep shared database concerns in `packages/database` rather than duplicating schema or client setup inside apps.

When creating a new API module:

- create a feature folder in `apps/api/src/<feature>/`
- add `<feature>.module.ts`, controller, service, and any DTOs inside that folder
- keep `<feature>.module.ts` responsible for wiring the feature's controller, service, and any imported shared modules
- keep the controller responsible for HTTP routes, request/response boundaries, and passing validated data to the service
- keep the service responsible for the feature's business logic and database orchestration
- keep DTOs responsible for request validation and normalization
- import the feature module into `apps/api/src/app.module.ts`
- keep request validation in DTOs and enable it through the app bootstrap, not controllers
- put shared Prisma access in a reusable database service/module rather than instantiating Prisma in each feature
- if the feature needs database access, import the shared database module and use the Prisma service from there

## Build, Test, and Development Commands

- `pnpm install`: install workspace dependencies
- `pnpm dev:web`: start the Next.js frontend on the default local port
- `pnpm dev:api`: start the NestJS API in watch mode
- `pnpm build`: build all workspace packages
- `pnpm db:generate`: generate the Prisma client
- `pnpm db:migrate:dev`: create and apply a development migration
- `pnpm db:studio`: open Prisma Studio

Example: run the healthcheck with `curl http://localhost:3001/api/health`.

## Coding Style & Naming Conventions

Use TypeScript everywhere. Follow the existing style:

- 2-space indentation
- double quotes in TS/TSX files
- `PascalCase` for Nest modules and React components
- `kebab-case` for feature folders such as `src/health/`
- If there are any new values that are being used across the `/api` or `/web` apps put them in a `constants.ts` file within the respective directory
- If there are any mappings/configurations that are being used across the `/api` or `/web` apps put them in a `config.ts` within the respective directory
- Use `camelCase` for TypeScript-facing names across the repo, including DTO fields, request payloads, response payloads, variables, and object keys
- Reserve `snake_case` for actual database column names and Prisma `@map(...)` mappings to those database fields

Prefer small modules with explicit exports. Keep Next route files inside `src/app` and Nest controllers/services close to their feature module.

## Testing Guidelines

There is no test framework configured yet. For now, treat `pnpm build` as the minimum verification step before opening a PR. When adding tests, place them next to the code as `*.spec.ts` for API logic and use the framework-native conventions adopted for the web app.

## Commit & Pull Request Guidelines

The current history uses short, imperative commit messages, for example: `Initial scaffold`. Continue that pattern.

When Codex contributes code or docs, include a co-author trailer on the commit:
`Co-authored-by: Codex <codex@openai.com>`.

PRs should include:

- a brief summary of the change
- any setup or migration steps
- linked issue or task reference when applicable
- screenshots for visible frontend changes

## Security & Configuration Tips

Do not commit real secrets. Copy from `.env.example` files in `apps/api`, `apps/web`, and `packages/database` when setting up local development.

## Documentation

- If a new database entity is introduced or updated, make the required updates to `docs/database.md`
