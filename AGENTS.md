# Repository Guidelines

## Project Structure & Module Organization

`pulsebook` is a `pnpm` monorepo. Application code lives in `apps/`:

- `apps/web`: Next.js 15 frontend using the App Router under `src/app/`
- `apps/api`: NestJS API with feature modules under `src/`
- `packages/database`: Prisma schema and config in `prisma/`

Keep new backend features grouped by module in `apps/api/src/<feature>/`. Keep shared database concerns in `packages/database` rather than duplicating schema or client setup inside apps.

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
