# Cinema Ticket Booking System

Online cinema ticket booking platform for a cinema chain (web course project, team of 5).
The system consists of one React SPA and three Express services that communicate over REST APIs (service-oriented architecture).

## Architecture

| Component | Directory | Port | Role |
|---|---|---|---|
| SPA (React + Vite) | `apps/web` | 5173 | Customer, admin and staff UI |
| Core service | `services/api` | 3001 | Movies, cinemas, showtimes, seats, bookings, auth, reports (DB `cinema_core`) |
| Payment service | `services/payment` | 3002 | Simulated payments, HMAC-signed webhooks (DB `cinema_payment`) |
| Notification service | `services/notification` | 3003 | E-ticket emails with QR codes |
| PostgreSQL 17 | (Docker) | 5432 | Each service reads/writes only its own database |
| Mailpit | (Docker) | 1025 / 8025 | Fake inbox, view emails at http://localhost:8025 |

## Directory structure

```
.
├── apps/
│   └── web/                  # React SPA (Vite)
│       └── src/              # components/, features/, hooks/, lib/, pages/, routes/, store/
├── services/
│   ├── api/                  # Core service
│   │   ├── src/              # config/ routes/ controllers/ services/ repositories/ middlewares/ schemas/ utils/
│   │   ├── db/               # migrations/ seeds/ (Knex)
│   │   └── tests/            # unit/ integration/
│   ├── payment/              # Payment service (same src/ layout)
│   └── notification/         # Notification service (adds src/templates/)
├── e2e/                      # Playwright
├── docs/                     # api/ architecture/ database/ report/
├── docker/postgres/init/     # Database init scripts (run when the volume is empty)
├── .github/                  # workflows/ci.yml, pull_request_template.md
├── docker-compose.yml
├── .env.example
└── CONTRIBUTING.md           # Branch, commit and Pull Request conventions
```

Request flow inside each service: `routes → middlewares → controllers → services → repositories → DB`.
Controllers only handle HTTP, business logic lives in `services/`, database queries live in `repositories/`.

## Requirements

- Node.js 22 LTS or later
- Docker and Docker Compose v2

## Quick start with Docker

```bash
cp .env.example .env       # edit values if needed, do NOT commit .env
docker compose up --build
```

Verify:

| URL | Expected result |
|---|---|
| http://localhost:5173 | The SPA |
| http://localhost:3001/health | `{"status":"ok","service":"api",...}` |
| http://localhost:3002/health | `{"status":"ok","service":"payment",...}` |
| http://localhost:3003/health | `{"status":"ok","service":"notification",...}` |
| http://localhost:8025 | Mailpit UI |

Stop and delete data: `docker compose down -v` (required after editing scripts in `docker/postgres/init/`).

## Run locally (without Docker)

```bash
npm run install:all                      # install dependencies for all 4 packages
docker compose up -d postgres mailpit    # infrastructure only
cd services/api && npm run dev           # same for payment, notification
cd apps/web && npm run dev
```

Services read environment variables from the root `.env` (`--env-file-if-exists`).

## Common commands

| Command (repo root) | Description |
|---|---|
| `npm run install:all` | Install dependencies for all 4 packages |
| `npm run lint` | Lint all 4 packages |
| `npm test` | Run tests for all 4 packages |
| `npm run up` / `npm run down` | `docker compose up --build` / `down` |

Each package has its own `package.json` and `package-lock.json`; run `npm run lint` and `npm test` inside the package directory.

## Environment variables

- Only `.env.example` is committed; all secrets (DB password, JWT key, API keys, SMTP) go in `.env`.
- To add a variable: update the zod schema in the service's `src/config/env.js` **and** `.env.example`.
- `VITE_*` variables are embedded in the client bundle, so they must never contain secrets.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every Pull Request and push to `main`:
1. `lint-and-test`: lint and test each package (4-package matrix).
2. `compose-smoke`: `docker compose up --wait`, then calls `/health` on the 3 services and the SPA.

## Team conventions

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Demo accounts

_To be added once seed data exists (admin, manager, staff, customer)._
