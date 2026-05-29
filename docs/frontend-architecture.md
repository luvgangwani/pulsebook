# Frontend Architecture

This document captures the architectural decisions and tradeoffs for the `apps/web` Next.js frontend application.

## 1. Routing: Next.js App Router

We use the **Next.js App Router** (`src/app`) rather than the legacy Pages Router.

### Why App Router?

- **Nested Layouts:** Pulsebook has distinct user roles (Patient, HCP, Admin). The App Router allows us to define persistent layouts (e.g., sidebars, navigation) for specific route groups without re-rendering them on navigation.
- **Server Components (RSC):** By default, components are Server Components. This allows us to fetch data securely on the server, keeping the client bundle small and improving perceived performance.
- **SEO & Public Pages:** We have a specific requirement to keep the HCP search feature public for SEO and discoverability. The App Router provides excellent support for generating dynamic metadata and server-side rendering these public pages.

### Tradeoffs

- **Learning Curve:** Developers must understand the boundary between Server Components (`async` components that run on the server) and Client Components (`"use client"` directive, necessary for interactivity like forms and hooks).
- **Ecosystem Compatibility:** Some older React libraries might not be fully compatible with Server Components yet, requiring them to be wrapped in Client Components.

## 2. State Management: React Query & Zustand

Instead of a monolithic state manager like Redux, we split state management into Server State and Client State.

### Server State: TanStack React Query

Used for managing asynchronous state from the NestJS API.

- **Why?** React Query handles caching, background refetching, deduping multiple requests, and provides built-in `isLoading` and `error` states. It eliminates the massive boilerplate associated with Redux actions and thunks.
- **Tradeoffs:** We do not have a single global state tree. Data is cached at the query level.

### Client State: Zustand

Used for managing global UI state (e.g., active theme, sidebar toggle, or current user role).

- **Why?** Zustand is extremely lightweight, requires almost zero boilerplate, and hooks directly into React without context providers.
- **Tradeoffs:** Because it is so flexible, teams must be disciplined not to overuse it for data that should instead be derived from the URL or handled by React Query.

## 3. Styling & UI Components

We use **Tailwind CSS** paired with **shadcn/ui**.

### Accessibility-First Approach: Radix UI
Pulsebook is a healthcare application, making accessibility (A11y) a core requirement. We chose **shadcn/ui** specifically because it is built on top of **Radix UI** primitives.
- **WAI-ARIA Compliance:** Radix handles complex accessibility patterns (focus management, keyboard navigation, aria-attributes) out of the box.
- **Inclusion:** Using accessible primitives ensures the platform is usable by patients with diverse needs and assistive technologies.
- **Customization:** shadcn/ui provides "copy-paste" components that we own locally, allowing us to maintain full control over the markup while keeping the accessible behavior.

## 4. Development Phasing: UI-First vs Auth-First

We have elected to build out core UI pages (search, schedules, dashboards) prior to integrating the full authentication layer.

### Why UI-First?

- **Velocity:** Rapid prototyping of interfaces without being blocked by login flows or token management.
- **Feedback Loop:** Stakeholders can review layouts and user journeys earlier.
- **Isolation:** Component design and styling can be perfected independently of backend integration.