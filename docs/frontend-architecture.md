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

We use **Tailwind CSS v4** for utility-first styling. The application utilizes a dark-themed, responsive layout built with standard Tailwind classes to maintain high performance and low bundle size.

## 4. Development Phasing: UI-First vs Auth-First

We have elected to build out core UI pages (search, schedules, dashboards) prior to integrating the full authentication layer.

### Why UI-First?

- **Velocity:** Rapid prototyping of interfaces without being blocked by login flows or token management.
- **Feedback Loop:** Stakeholders can review layouts and user journeys earlier.
- **Isolation:** Component design and styling can be perfected independently of backend integration.