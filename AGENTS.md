# SGP — AGENTS.md

## Architecture

- **npm workspaces monorepo** — packages: `backend`, `frontend`. Root `package.json` holds orchestration scripts only.
- **Docker is the sole runtime manager.** `docker compose up -d --build` handles all `npm install` inside each Dockerfile. Build contexts are `./backend` and `./frontend` — root is invisible to containers.
- **Anonymous volume `/app/node_modules`** in `docker-compose.yml` protects container-installed deps from host overwrites.

## Services (docker-compose)

| Service | Port | Build context |
|---------|------|--------------|
| `sgp_nginx` | 80 | image: nginx:alpine |
| `sgp_frontend_dev` | 5173 (int) | `./frontend` |
| `sgp_api_backend` | 3000 (int) | `./backend` |
| `sgp_mysql` | 3306 | image: mysql:8.4 |
| `sgp_redis` | — | image: redis:7-alpine |

Nginx routes: `/api/*` → backend, `/*` → frontend.

## Key commands (run from root)

```bash
# Start everything (rebuild with --build if deps changed)
docker compose up -d --build

# Follow logs
docker compose logs -f sgp_api_backend
docker compose logs -f sgp_frontend_dev

# Install deps (MUST run inside container, not host)
docker compose exec sgp_api_backend npm i <package>
docker compose exec sgp_frontend_dev npm i <package>

# Restart a service
docker compose restart sgp_api_backend
```

## Backend (NestJS, CommonJS, node:22)

- **Stack**: NestJS 11, Sequelize, MySQL 8.4, Redis/BullMQ, Zod v4 env validation
- **Module system**: CommonJS (`"module": "commonjs"` in tsconfig)
- **Architecture**: Vertical Modular (Hexagonal). Each module in `src/modules/*` owns its domain/application/infrastructure layers.
- **Path aliases**: `@config/*` → `src/config/*`, `@share/*` → `src/share/*`, `@modules/*` → `src/modules/*`
- **Key scripts**: `npm run start:dev` (nodemon + ts-node), `npm run test` (jest), `npm run lint`
- **DI tokens**: Uses `@Inject(SYMBOL)` for interface injection (symbol tokens)
- **Config**: `@nestjs/config` with Zod validation via `validate` callback
- **Dev**: nodemon watches `src/`, ignores `*.spec.ts` and `*.dto.ts`

## Frontend (React 19 + Vite, ESM, node:26)

- **Stack**: React 19, Vite 8, HeroUI, Tailwind CSS v4, TanStack Query, Zustand, React Hook Form + Zod
- **Module system**: ESM (`"type": "module"` in package.json)
- **Architecture**: Folder-by-Feature in `src/features/*` — each feature has its own `components/`, `hooks/`, `schemas/`, `services/`, `views/`, and barrel `index.ts`
- **Path alias**: `@/*` → `./src/*`
- **Build**: `tsc -b && vite build`
- **TS strict**: `verbatimModuleSyntax: true`, `noUnusedLocals`, `noUnusedParameters`
- **Watch polling**: `server.watch.usePolling: true` in vite config (needed for WSL/Docker)
- **Dev**: `npm run dev -- --host`

## Testing

- **Backend unit**: jest, `*.spec.ts` in `src/`, config in `backend/package.json` jest section
- **Backend e2e**: jest, `*.e2e-spec.ts` in `test/`, config at `backend/test/jest-e2e.json`
- **Frontend**: no test script currently configured

## Conventions

- **Backend**: no `console.log` — use NestJS `Logger` (constructor injection). Path aliases mandatory (no relative `../../`). All DB fields/tables in English.
- **Frontend**: barrel `index.ts` file at root of each feature module — external imports must go through it. Server data managed via TanStack Query hooks, not Zustand. Zustand reserved for local volatile state (sidebar, session).
- **Root Prettier** (`.prettierrc`): `singleQuote: true`, `trailingComma: "all"`.
- **Docker is the truth**: Do not `npm install` on host. Do not expect root `node_modules` to resolve in containers.

## Important gotchas

- Backend and frontend `package.json` files must NOT be modified to remove dependencies — Docker build contexts cannot see the root `package.json`.
- `docker compose up -d --build` is the only safe way to pick up dependency changes.
- `backend/` uses `ts-node` + `nodemon` for dev (not `nest start --watch`).
- Frontend `eslint.config.js` follows the flat config pattern with `eslint/config` `defineConfig`.
- Backend `eslint.config.mjs` uses `tseslint.configs.recommendedTypeChecked` with `projectService: true`.
- Root `skills-lock.json` references installed OpenCode skills — the `.agents/` directories under `backend/` and `frontend/` contain per-package skill configs.
