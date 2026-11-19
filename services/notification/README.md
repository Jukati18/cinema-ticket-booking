# services/notification

Sends e-ticket emails with QR codes through Mailpit.

- Port: `3003` · Database: none · Health: `GET /health`
- `src/` layout: `config/`, `routes/`, `controllers/`, `services/`, `middlewares/`, `templates/`, `utils/`.
- Run: `npm run dev` · Test: `npm test` · Lint: `npm run lint`

## Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
