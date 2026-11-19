# apps/web (SPA)

React 19 + Vite. Currently an empty scaffold; Tailwind, shadcn/ui, React Router and TanStack Query are added by the front-end owner.

- Dev port: `5173` (Docker: nginx serves the production build)
- Environment variable: `VITE_API_URL` (baked into the bundle at build time, never put secrets here)
- `src/` layout: `components/ui` (shadcn), `components/layout`, `features/`, `hooks/`, `lib/`, `pages/`, `routes/`, `store/`.
- Run: `npm run dev` · Build: `npm run build` · Test: `npm test` · Lint: `npm run lint`
