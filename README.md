# Activity Forecast Assessment

## Architecture Overview & Technical Choices
- **Two-package workspace** – `api/` exposes a Node.js + TypeScript GraphQL service (Apollo Server on Express), while `client/` delivers a React that consumes it. The projects stay decoupled so they can scale or deploy independently.
- **Deterministic data pipeline** – requests flow from the client’s Apollo query to the GraphQL resolver, which leverages `OpenMeteoClient` (via `undici`) for geocoding/forecast data and `ActivityScoringService` for translating weather signals into ranked scores per activity.
- **Typed contracts** – shared schema lives in `src/app/graphql/schema.graphql`; generated/handwritten TypeScript types keep validation strict across service boundaries, and frontend view models in `src/types/activity.ts` shield UI components from raw transport details.
- **Stateful yet lean UI** – Redux Toolkit tracks location history, while Apollo Client caches forecast responses. Tailwind CSS and a componentised forecast workspace (`src/components/forecast/*`) emphasise reuse and predictable styling without heavy UI frameworks.
- **DX focus** – comprehensive npm scripts, Jest/Vitest suites, and Prettier/ESLint/Tailwind configs provide a fast feedback loop. Docker/compose support exists for the API to ease parity with production-like environments.

## AI Assistance
- Used GPT-5 Codex (ChatGPT) iteratively to scaffold resolver/service boilerplate, draft tests, and propose weather-scoring heuristics; each suggestion was reviewed and hand-tuned for determinism and clarity.
- Leveraged AI pair-programming to sketch UI composition (tabs, skeleton states) and tighten TypeScript types, accelerating ideation while keeping final implementations developer-reviewed.
- Asked AI for documentation scaffolds (including this README) to summarise decisions consistently across the repository.

## Omissions & Trade-offs
- **No upstream caching/backoff** – Open-Meteo calls hit the public API directly; production would introduce request deduplication, retries, and telemetry to stay within rate limits.
- **Limited scoring sophistication** – heuristic weights prioritise clarity over meteorological accuracy; a future iteration would ingest humidity, swell period, and historical performance data, ideally behind feature flags with validation datasets.
- **Minimal cross-cutting concerns** – auth, RBAC, and observability hooks are absent because the assessment centres on forecast logic. Adding them would require shared middleware layers and trace instrumentation.
- **Offline/poor network UX deferred** – the frontend surfaces loading and error states but skips optimistic updates, persistent caching, or skeleton variations for revalidation to keep scope tight.

## Shortcuts & Follow-up Plan
- **Testing surface** – integration/e2e coverage is intentionally thin (unit + component tests only). Next step is wiring contract tests between client and API (e.g., MSW + Vitest) and smoke tests in CI.
- **Config management** – environment handling stays per-package; a centralised config module or monorepo tooling (e.g., Turborepo) would streamline shared secrets and build orchestration.
- **Accessibility polish** – components meet basic semantics, yet skip exhaustive keyboard testing and prefers minimal ARIA annotations. A follow-up pass would add automated axe checks and manual QA.

---

To explore locally:
1. `cd api && npm install && npm run start:dev` – GraphQL endpoint at `http://localhost:8000/graphql`.
2. `cd client && npm install && npm run dev` – Vite dev server at `http://localhost:5173` (expects the API above).


