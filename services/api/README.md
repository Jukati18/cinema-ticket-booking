# services/api (core service)

Movies, cinemas, screens, seats, showtimes, bookings, authentication, reports.

- Port: `3001` · Database: `cinema_core` · Health: `GET /health`
- `src/` layout: `config/` (env), `routes/`, `controllers/`, `services/` (business logic), `repositories/` (Knex), `middlewares/`, `schemas/` (zod), `utils/`.
- `db/migrations`, `db/seeds`: Knex (configuration to be added with the database work).
- Run: `npm run dev` · Test: `npm test` · Coverage: `npm run test:coverage` (target ≥ 60%) · Lint: `npm run lint`

## Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |

## Tables
_None yet, to be added together with the ERD._
