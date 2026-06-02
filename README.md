# TaskFlow

A modern Task Management Dashboard built with React 19, TypeScript, Tailwind CSS v4, TanStack Query, and Axios.

## Features

- Create, edit, delete tasks
- Debounced search
- Advanced filtering and sorting
- Local storage persistence
- React Query integration
- Optimistic updates
- Dark mode
- Responsive design

# Task Dashboard

A lightweight task management front-end built with React, TypeScript, Vite, React Query and Tailwind CSS.

This repository demonstrates a feature-oriented codebase with optimistic updates, client-side pagination, basic bulk actions, persisted filters, and accessibility improvements.

---

## Project Architecture

The app follows a feature-driven architecture with clear separation of concerns:

- App shell and providers: global wrappers that configure runtime and 3rd-party libraries.
  - See [src/app/providers/QueryProvider.tsx](src/app/providers/QueryProvider.tsx)
- Router & layout: central routing, main layout and shared chrome.
  - See [src/app/router/index.tsx](src/app/router/index.tsx) and [src/app/layouts/MainLayout.tsx](src/app/layouts/MainLayout.tsx)
- Feature modules: each feature (tasks) contains its own pages, components, hooks, api and types.
  - See [src/features/tasks](src/features/tasks)
- Shared utilities & hooks: generic helpers (debounce, localStorage), services (axios client), and UI primitives.
  - See [src/hooks](src/hooks) and [src/services](src/services)

Design goals:

- Feature encapsulation for ease of scaling and team ownership.
- Localized state where appropriate and hooks for shared behaviors.
- React Query for server-state management with optimistic updates.
- TypeScript strict mode to prevent runtime issues early.

---

## Folder Structure (overview)

- `src/`
  - `app/` — app shell, layout, router and providers
    - `layouts/` — durable application layouts (MainLayout)
    - `providers/` — React Query and other providers
    - `router/` — route definitions
  - `features/` — feature modules
    - `tasks/` — pages, components, hooks, api, types, utils for tasks
  - `hooks/` — reusable hooks (`useDebounce`, `useLocalStorage`)
  - `services/` — API client wrappers (`axios.ts`)
  - `assets/`, `components/` — shared assets and UI primitives
  - `main.tsx`, `App.tsx` — application entry

See the concrete layout in the repository root and `src/`.

---

## Features

- Task CRUD: create, update, delete tasks via `features/tasks/api/tasksApi.ts`.
- Search & filters: searchable and filterable task lists with debounced search.
- Persisted filters: filter state stored in localStorage (`useLocalStorage` hook).
- Bulk actions: select tasks per page, bulk complete and bulk delete (optimistic updates via React Query).
- Client-side pagination: simple page controls implemented in `Dashboard`.
- Recent activity: local activity log for mutations.
- Performance optimizations: `React.memo`, `useMemo`, `useCallback`, and route code-splitting with `React.lazy`.
- Accessibility improvements: ARIA attributes and ESLint a11y rules added.

Key files:

- [src/features/tasks/pages/Dashboard.tsx](src/features/tasks/pages/Dashboard.tsx)
- [src/features/tasks/components/TaskList.tsx](src/features/tasks/components/TaskList.tsx)
- [src/features/tasks/components/TaskCard.tsx](src/features/tasks/components/TaskCard.tsx)
- [src/features/tasks/hooks/useTasks.ts](src/features/tasks/hooks/useTasks.ts)

---

## Setup Instructions

Prerequisites: Node.js 18+ and npm.

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Lint (ESLint + TypeScript rules):

```bash
npm run lint
```

Format with Prettier:

```bash
npm run format
```

Notes:

- The project uses Vite for development and build.
- ESLint configuration at `.eslintrc.json` includes TypeScript, React and accessibility rules.

---

## Testing & Verification

This repo does not include a test suite by default. Recommended tests:

- Unit tests for `taskHelpers` and hooks (`useTaskFilters`, `useLocalStorage`).
- Integration tests for `Dashboard` flows (search, filters, bulk actions) using React Testing Library.
- Accessibility checks using `axe` in CI.

---

## Future Improvements

- Server-side pagination or cursor-based APIs for large datasets.
- Virtualized rendering for long lists (`react-window` or `react-virtual`).
- Centralize reusable UI primitives into `src/components/ui/` (`StatCard`, `Pagination`, `Checkbox`).
- Add comprehensive test coverage (unit, integration, e2e).
- Add CI workflows: lint, typecheck, build, test, and bundle-size gating.
- Improve undo UX for destructive actions (snackbars with undo).
- Add telemetry and performance monitoring (Lighthouse, RUM).
- Enhance accessibility: focus management, keyboard shortcuts, and automated axe checks.

---

## Technical Decisions

- React + Vite: fast dev feedback loop and modern bundling.
- TypeScript (`strict: true`): catch issues early and improve developer DX.
- React Query: out-of-the-box caching, background refetching and mutation helpers; used here with optimistic updates for smooth UX.
- Axios: simple HTTP client wrapped in `src/services/axios.ts` for typed requests.
- Tailwind CSS: utility-first styling for rapid UI iteration.
- Feature-based folder structure: keeps feature code co-located for easier ownership.
- Performance: prefer memoization (`React.memo`, `useCallback`, `useMemo`) for list-heavy components and route-level code-splitting using `React.lazy`.
- Accessibility: added `jsx-a11y` rule set and ARIA attributes where appropriate.

---

## Where to look first (files)

- App entry: [src/main.tsx](src/main.tsx)
- Router: [src/app/router/index.tsx](src/app/router/index.tsx)
- Tasks feature: [src/features/tasks](src/features/tasks)
- Hooks: [src/hooks](src/hooks)
- Services: [src/services/axios.ts](src/services/axios.ts)
- Lint config: [.eslintrc.json](.eslintrc.json)

---

If you'd like, I can open a PR with these docs and a small CI workflow that runs lint and TypeScript checks on push.
