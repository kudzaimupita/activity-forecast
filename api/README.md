# Collinson Assessment API

GraphQL backend that ranks skiing, surfing, outdoor sightseeing, and indoor sightseeing over the next 7 days for a given location.

## Quickstart
```bash
npm install
npm run start:dev
# GraphQL endpoint: http://localhost:8000/graphql
```

Tests:
```bash
npm test      # unit + resolver tests
npm run lint
```

## Config
Environment variables (`.env.example`):
- `HTTP_PORT` (default 8000)
- `DEBUG` (default true)
- `GRAPHQL_INTROSPECTION_ENABLED` (default true)
- `GRAPHQL_CSRF_PREVENTION` (default true)

Docker (optional):
```bash
docker-compose up --build
```

## Architecture
- `src/app/graphql/schema.graphql` defines `activityForecast(location: String!)`.
- `OpenMeteoClient` fetches geocoding + forecast data, normalises daily metrics.
- `ActivityScoringService` generates daily/weekly scores per activity using deterministic heuristics.
- Resolver orchestrates validation, weather fetch, scoring, and structured response.

## Notes & Next Steps
- Layer caching/backoff for Open-Meteo requests.
- Tune heuristics with additional weather inputs (humidity, visibility, swell period).
