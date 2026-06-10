# GEMINI.md - Pulsebook Project Context

## Project Overview

Pulsebook is a healthcare appointment booking platform. It is structured as a TypeScript monorepo using `pnpm` workspaces.

### Terminology

Users - Any user with an account on the application
Role - A user can be one of patient/healthcare professional (hcp)
Patient - The user who makes an application for an appointment
HCP - The user who receives and takes action on the application for appointment
Slot - A default 15 minute timeslot within the schedule (day/days in a week) specified by the HCP
Appointment - The actual action where a patient books a timeslot with an HCP

### Architecture

- **apps/api**: NestJS backend application.
- **apps/web**: Next.js 15 frontend application.
- **packages/database**: Prisma-based database layer shared across the monorepo.

## Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript.
- **Backend**: NestJS, TypeScript, class-validator, class-transformer.
- **Database**: Prisma ORM, PostgreSQL.
- **Package Management**: pnpm.

## Mandatory Libraries & Patterns

To maintain codebase consistency, all new code MUST strictly adhere to these established libraries and patterns.

### Frontend (apps/web)

- **Forms**: Use `react-hook-form` combined with `zod` and `@hookform/resolvers/zod` for ALL forms. Custom `useState` for form fields is forbidden.
- **Data Fetching**: Use `@tanstack/react-query` for all data fetching (`useQuery`) and mutations (`useMutation`).
- **API Client**: Use the shared Axios instance in `@/lib/api.ts` for all manual API calls. Always set `withCredentials: true` for cookie-based auth.
- **Notifications**: Use `sonner` (`toast`) for all user feedback/notifications.
- **Icons**: Use `lucide-react`.
- **Styling**: Use Tailwind CSS and Shadcn UI components.
- **State Management**: Use `zustand` for global client-side state when React Context or Query is insufficient.

### Backend (apps/api)

- **DTOs**: Use `class-validator` decorators for input validation and `class-transformer` for payload transformation.
- **Database**: Always use the `PrismaService` from the `database` module.
- **Auth**: Use the existing `JwtAuthGuard` and `RoleGuard` for protected routes.

### Critical Mandate for Agents

Before implementing ANY feature or fix, you MUST:
1. Grep the codebase for similar existing functionality (e.g., if adding a form, look for `useForm` usage).
2. Check `package.json` in the relevant app to identify preferred libraries.
3. Align your implementation 100% with discovered patterns. "Just-in-case" or "simpler" alternatives that deviate from these standards are considered errors.

## Building and Running

### Prerequisites

- Node.js (v22+ recommended based on `pnpm-lock.yaml`)
- pnpm (v10+)
- PostgreSQL

### Setup

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```
2.  **Environment Variables**:
    Copy `.env.example` to `.env` in the following locations:
    - `apps/api/`
    - `apps/web/` (use `.env.local`)
    - `packages/database/`

3.  **Database Migration**:

    ```bash
    pnpm db:migrate:dev
    ```

4.  **Prisma Client Generation**:
    ```bash
    pnpm db:generate
    ```

### Running the Project

- **Start Backend**: `pnpm dev:api` (Runs on port 3001 by default)
- **Start Frontend**: `pnpm dev:web` (Runs on port 3000 by default)
- **Build All**: `pnpm build`
- **Database Studio**: `pnpm db:studio`

## Planning Workflow

For complex user requests (e.g., architectural changes, cross-cutting features, or ambiguous tasks), the agent should enter **Plan Mode** to draft a design before implementation. 

**Mandatory Step:** Before entering Plan Mode, the agent MUST ask for and receive explicit approval from the user. This allows the user to judge whether the complexity of the request truly warrants a formal planning phase.

### API (NestJS)

- **Global Prefix**: All API routes are prefixed with `/api`.
- **Validation**: `ValidationPipe` is enabled globally with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`.
- **Authentication**: JWT-based authentication using cookies (`access_token`).
- **Guards**: `JwtAuthGuard` for authentication and `RoleGuard` for authorization.
- **Decorators**: `@CurrentUser()` and `@AllowedRoles()` are used for access control.
- **Structure**: Feature-based modules (e.g., `users`, `clinic-locations`).

### Database (Prisma)

- **Schema**: Located at `packages/database/prisma/schema.prisma`.
- **Entities**: Includes `User`, `Role`, `Permission`, `Patient`, `Hcp`, `ClinicLocation`, `Slot`, `Appointment`, etc.
- **Naming**: Database fields use snake_case (standardized via `@map` in Prisma if necessary, or directly in schema).

### Git Workflow

- The project includes skills for branch management and PR creation (`.codex/skills`).
- PR reviews were considered but are currently disabled to save tokens.
- **Co-authorship**: When Google Gemini makes code changes, it should be added as a co-author (e.g., in commit message trailers as `Co-authored-by: Google Gemini <gemini-code-assist@google.com>`).
- **PRs should include**:
  - a brief summary of the change
  - any setup or migration steps
  - linked issue or task reference when applicable
  - screenshots for visible frontend changes
- **Post-PR Commit Rule**: After each commit added to an existing PR, first evaluate if the change warrants a PR description update (e.g., new features, schema changes, DTO updates). If an update is necessary, propose the revised description to the user and apply it via \`gh pr edit\` only after receiving explicit confirmation.


### Coding Style & Naming Conventions

Use TypeScript everywhere. Follow the existing style:

- 2-space indentation
- double quotes in TS/TSX files
- `PascalCase` for Nest modules and React components
- `kebab-case` for feature folders such as `src/service-health/`
- If there are any new values that are being used across the `/api` or `/web` apps put them in a `constants.ts` file within the respective directory
- If there are any mappings/configurations that are being used across the `/api` or `/web` apps put them in a `config.ts` within the respective directory
- Use `camelCase` for TypeScript-facing names across the repo, including DTO fields, request payloads, response payloads, variables, and object keys
- Reserve `snake_case` for actual database column names and Prisma `@map(...)` mappings to those database fields

Prefer small modules with explicit exports. Keep Next route files inside `src/app` and Nest controllers/services close to their feature module.

## Important Documentation

- `docs/database.md`: Detailed entity definitions and relationships.
- `docs/api-endpoints.md`: List of available API endpoints.
- `docs/roles-and-permissions.md`: Details on the RBAC system.
- `docs/frontend-architecture.md`: Tradeoffs and decisions for the Next.js frontend.

| Documentation         | Path                            |
| --------------------- | ------------------------------- |
| Database              | ./docs/database.md              |
| API Endpoints         | ./docs/api-endpoints.md         |
| Roles and permissions | ./docs/roles-and-permissions.md |
| Frontend Architecture | ./docs/frontend-architecture.md |
| Slot Creation Logic   | ./docs/slot-creation-logic.md   |
