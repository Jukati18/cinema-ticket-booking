# services/payment

Simulated payment service with HMAC-signed webhooks.

- Port: `3002` · Database: `cinema_payment` · Health: `GET /health`
- `src/` layout: `config/`, `routes/`, `controllers/`, `services/`, `middlewares/`, `utils/`.
- Run: `npm run dev` · Test: `npm test` · Lint: `npm run lint`

## Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
