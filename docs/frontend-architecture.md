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

For every frontend request, always check the **shadcn/ui registry** first. If a suitable component exists (e.g., Card, Badge, Dialog), use it to maintain consistency. If no suitable match is found in the registry, you MUST confirm and get approval from the user before creating any custom UI components.

## 4. Development Phasing: UI-First vs Auth-First

We have elected to build out core UI pages (search, schedules, dashboards) prior to integrating the full authentication layer.

### Why UI-First?

- **Velocity:** Rapid prototyping of interfaces without being blocked by login flows or token management.
- **Feedback Loop:** Stakeholders can review layouts and user journeys earlier.
- **Isolation:** Component design and styling can be perfected independently of backend integration.

## 5. Theme Management

We use a combination of `next-themes`, CSS Variables, and Tailwind CSS to support Light, Dark, and System modes.

### The Flow

1.  **State Management**: `next-themes` acts as the central engine, handling persistence (via `localStorage`) and system preference detection (`prefers-color-scheme`).
2.  **HTML Class Toggling**: When a theme is selected (e.g., "dark"), `next-themes` injects the corresponding class (`.dark`) into the `<html>` element.
3.  **CSS Variable Mapping**: In `globals.css`, set colors are defined for both `:root` (light) and `.dark`.
    - `:root` contains the light theme values.
    - `.dark` overrides those values for the dark theme.
4.  **Tailwind Utility Classes**: All components use semantic Tailwind classes (e.g., `bg-background`, `text-primary`). These classes are mapped to the CSS variables.
5.  **Instant Updates**: Because variables are defined globally, toggling the `.dark` class on the `<html>` element instantly swaps the color values across the entire application without a page reload.

### Component Implementation

A `ModeToggle` component (standard shadcn pattern) provides the user interface for theme selection, interacting with the `useTheme` hook from `next-themes`.

## 6. Accessibility (A11y)

Accessibility is first-class citizen in Pulsebook. All new/existing components MUST include appropriate accessibility attributes (ARIA roles, labels, states) ensure application usable by everyone, including those using assistive technologies.

### General Rules

- **Interactive Elements:** All buttons, links, inputs must have descriptive `aria-label` or `aria-labelledby` if purpose not clear from text.
- **Icon-Only Buttons:** Buttons containing only icon MUST include `<span className="sr-only">` with descriptive label.
- **Semantic HTML:** Use semantic tags (`<nav>`, `<main>`, `<header>`, `<footer>`, `<aside>`, etc.) provide structural context.
- **States:** Use `aria-expanded`, `aria-hidden`, `aria-current`, etc., communicate state of collapsible elements, menus, current nav items.
- **Keyboard Navigation:** Ensure all interactive elements reachable/usable via keyboard (proper `tabIndex`, focus styles).
- **Cursor State:** All interactive items (buttons, links, selectable items) MUST have `cursor: pointer` to indicate interactivity.