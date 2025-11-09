# Activity Forecast Frontend

React + Vite frontend for inspecting the `ActivityForecast(location: String!)`
GraphQL endpoint. The UI lets you search for a city, then reviews a ranked
7-day outlook across skiing, surfing, and indoor/outdoor sightseeing.

The GraphQL API defaults to `http://localhost:8000/graphql`. Override with
`VITE_API_URL` if the backend runs elsewhere.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 once the Vite dev server is running.

### Testing

```bash
npm run test
```

Runs Vitest with Testing Library + jsdom. Coverage output is written to `coverage/`.

## Feature Overview

- **Location search** – compact form with recent-search history, backed by a
  Redux slice to keep preferences predictable.
- **Forecast workspace** – Apollo Client powers a tabbed activity view with
  reusable components for headers, overview cards, and the daily outlook grid.
- **Enterprise polish** – skeleton states, consistent iconography, and lean
  surface styling for an internal tools look and feel.

## Key Decisions

- **Apollo Client** wraps the app to provide declarative GraphQL queries with
  caching and devtools integration.
- **Redux Toolkit** persists the last location and short history so routing or
  other global state can plug in later with minimal changes.
- **Tailwind CSS** is used directly; no component library, just utility-first
  styling to keep the surface area small and easy to tweak.
- **Typed data layer** – GraphQL shapes live in `src/types/activity.ts`, keeping
  rendering logic type-safe.
- **Composable UI** – forecast widgets are split into granular components under
  `src/components/forecast` for easier reuse in future layouts.

## Project Structure

- `src/App.tsx` – page layout, query orchestration, and conditional UI states.
- `src/components/` – reusable presentation primitives (search form, recent
  history, forecast widgets, skeletons).
- `src/graphql/` – Apollo client configuration and query documents.
- `src/types/` – shared TypeScript definitions for GraphQL data.

## Communicating Trade-offs

- The UI focuses on data exploration rather than persistence; there is no
  routing or state management framework beyond React hooks and Apollo cache.
- Error handling is surfaced in the UI, but there is no retry or offline
  support.
- Styling is functional and accessible, deferring advanced design polish for a
  future iteration.

## AI Assistance

ChatGPT (GPT-5 Codex) helped scaffold components, types, and docs. All
generated output was reviewed and adjusted to align with the assessment goals.
