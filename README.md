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

3. Generate the Prisma client:

   ```bash
   pnpm db:generate
   ```

4. Run the frontend and API in separate terminals:

   ```bash
   pnpm dev:web
   pnpm dev:api
   ```

## Healthcheck

Start the API and call:

```bash
curl http://localhost:3001/api/health
```
