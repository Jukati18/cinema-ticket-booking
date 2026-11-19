-- Each service reads/writes only its own database.
-- cinema_core is created by POSTGRES_DB; the others are created here.
-- NOTE: runs only when the pgdata volume is empty (use `docker compose down -v` to re-run).
CREATE DATABASE cinema_payment;
