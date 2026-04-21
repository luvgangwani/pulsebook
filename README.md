# Pulsebook

Basic monorepo scaffold with:

- `apps/web`: Next.js 15 frontend
- `apps/api`: NestJS API
- `packages/database`: Prisma schema and client generation

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy env files as needed:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   cp packages/database/.env.example packages/database/.env
   ```

   Prisma reads `packages/database/.env` through `packages/database/prisma.config.ts`.

3. Start Postgres locally and create the development database.

   Connection format:

   ```bash
   postgresql://<username>:<password>@localhost:5432/pulsebook?schema=public
   ```

   Example setup flow:

   ```bash
   psql postgres
   ```

   Then in `psql`:

   ```sql
   CREATE ROLE <username> WITH LOGIN PASSWORD '<password>';
   ALTER ROLE <username> CREATEDB;
   CREATE DATABASE pulsebook OWNER <username>;
   ```

4. Apply the database schema locally:

   ```bash
   pnpm db:migrate:dev
   ```

5. Generate the Prisma client:

   ```bash
   pnpm db:generate
   ```

6. Run the frontend and API in separate terminals:

   ```bash
   pnpm dev:web
   pnpm dev:api
   ```

## Healthcheck

Start the API and call:

```bash
curl http://localhost:3001/api/health
```

## PR Review Automation

We considered adding subagent-based PR review to the local `git-commit-push-pr` workflow, with separate checks for security, code quality, race conditions, and maintainability. That approach is not enabled for this project right now because it consumes too many tokens for routine small PRs and makes the commit/push flow slower.

If we revisit this later, the expected shape is to capture a fixed base/head diff, run one focused reviewer per category, summarize the findings in the PR description, and only create or update the PR after all reviews complete.
