# SGP — AGENTS.md

## Architecture

- **npm workspaces monorepo** — packages: `backend` (CommonJS, node:22), `frontend` (ESM, node:26). Root `package.json` has orchestration scripts only.
- **Docker is the sole runtime manager.** `docker compose up -d --build` handles all `npm install` inside each Dockerfile. Build contexts are `./backend` and `./frontend` — root is invisible to containers.
- **Anonymous volume `/app/node_modules`** prevents host overwrites of container-installed deps.
- **Vertical-slice backend**: each `src/modules/*` owns domain/application/infrastructure layers. `@share/*` for cross-cutting: cache, pagination DTOs.
- **Folder-by-Feature frontend**: `src/features/*`. Some features have barrel `index.ts` (admin, catalogs); others (auth, profile, projects) do not.

## Services (docker-compose)

| Service | Internal port | Build context |
|---------|---------------|---------------|
| `sgp_nginx` | 80 | nginx:alpine image |
| `sgp_frontend_dev` | 5173 | `./frontend` |
| `sgp_api_backend` | 3000 | `./backend` |
| `sgp_mysql` | 3306 | mysql:8.4 image |
| `sgp_redis` | 6379 | redis:7-alpine image |

Nginx routes: `/api/*` → backend, `/*` → frontend. Swagger UI at `/api/docs`.

## Key commands (run from root)

```bash
docker compose up -d --build                  # start (or rebuild after dep changes)
docker compose logs -f sgp_api_backend        # follow backend logs
docker compose restart sgp_api_backend        # quick restart (no --build)

# Install deps (MUST run inside container, not host)
docker compose exec sgp_api_backend npm i <package>
docker compose exec sgp_frontend_dev npm i <package>
```

Root orchestration scripts (also work): `npm run dev:backend`, `npm run dev:frontend`, `npm run test:backend`, `npm run lint:backend`, `npm run build:frontend`.

## Backend (NestJS 11, Sequelize, CommonJS)

- **Start**: `npm run start:dev` (nodemon + ts-node via `nodemon.json`, watches `src/`, ignores `*.spec.ts` and `*.dto.ts`)
- **Test**: `npm test` (jest, `*.spec.ts` in `src/`). 10 suites, 33 tests. **E2E**: `npm run test:e2e` (jest, `test/*.e2e-spec.ts`)
- **Lint**: `npm run lint` — `tseslint.configs.recommendedTypeChecked` with `projectService: true`. Strict about `any`; uses `eslint-disable` for unavoidable casts (e.g. `ms` v2, Sequelize Op symbols)
- **Path aliases**: `@config/*`, `@share/*`, `@modules/*`
- **DI**: `@Inject(SYMBOL)` for interface injection. All modules import other modules for repository access.
- **Redis**: ioredis for caching (ICacheService). BullMQ is a dead dependency (packaged but unused).
- **Config**: Zod v4 env validation in `src/config/env.config.ts`
- **DI pattern quirks**: `Record<string | symbol, any>` needed for Sequelize `Op.or`/`Op.like` keys; `as any` + eslint-disable for `ms` v2 `StringValue`
- **Uploads**: static assets served at `/uploads` from `./uploads/` directory
- **Seeder**: `src/seed.ts` exists
- **Swagger**: configured at `/docs` (accessible via nginx at `/api/docs`), bearer auth

### Key endpoints (all protected by JwtAuthGuard except auth)

| Path | Notes |
|------|-------|
| `POST /auth/login`, `/auth/refresh`, `/auth/logout` | Public. Login returns JWT pair + user |
| `GET /users/me`, `PATCH /users/me` | Profile read/update for authenticated user |
| `GET /projects/stats` | Dashboard: total, by-status, by-year counts |
| `GET/POST /:resource` + `PATCH /:id` + `DELETE /:id` | CRUD for institutions, careers, projects |
| `POST /projects/:id/files` | File upload (multipart, 50MB limit) |

## Frontend (React 19, Vite 8, ESM)

- **Start**: `npm run dev -- --host` (Vite dev server, watch polling enabled for WSL/Docker)
- **Build**: `tsc -b && vite build` (TS strict: `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`)
- **Test**: `npm test` (vitest, `*.{test,spec}.{ts,tsx}` in `src/`). 9 suites, 38 tests. jsdom env.
- **Lint**: `npm run lint` — flat config with `defineConfig`
- **Stack**: HeroUI, Tailwind CSS v4, TanStack Query, Zustand, React Hook Form + Zod, recharts, Recharts, lucide-react
- **Path alias**: `@/*` → `./src/*`
- **Data flow**: Server data via TanStack Query hooks (not Zustand). Zustand for local volatile state only (sidebar, session, auth tokens).

## Conventions

- **Backend**: no `console.log` — use NestJS `Logger` (constructor injection). Path aliases mandatory (no relative `../../`). All DB fields/tables in English.
- **Frontend**: barrel `index.ts` at feature root for external imports (present in admin, catalogs; absent in auth, profile, projects). Re-export pattern preferred over direct `../../` imports.
- **Root Prettier**: `singleQuote: true`, `trailingComma: "all"`.
- **Docker is the truth**: Do not `npm install` on host. Rebuild (`--build`) is the only safe way to pick up dependency changes.

## OpenCode skills

Root `skills-lock.json` references installed skills. Per-package config at `backend/.agents/skills/` and `frontend/.agents/skills/`.

## Loop Engineering (orquestación de agentes)

SGP usa **XP/TDD** para construirse (`docs/metodologia.md`, `docs/spec-xp.md`). Encima
corre un **bucle externo de agentes** (Loop Engineering) para avanzar las 28 stories
del backlog de forma autónoma pero verificada.

- **Memoria durable**: `LOOP.md` (backlog épicas A–J + recibos de ciclos).
- **Oráculo (única verdad)**: `scripts/loop-check.sh` — corre tests/lint/e2e
  backend+frontend y `dbml2sql` **dentro de los contenedores**; exit-code decide.
- **Skill orquestador**: `.agents/skills/sgp-loop` (ata las 4 skills de soporte +
  DoD XP + reglas duras SRS D3/G3). Runbook en `references/loop-runbook.md`.
- **Skills de soporte instalados**: `ralph-loop-workflow` (motor de bucle),
  `tdd-orchestrator` (disciplina TDD), `adversarial-review` (verifier maker≠checker),
  `supermemory` (memoria durable), `docker-expert` (oráculo + dbml2sql).
- **Puerta humana**: el loop abre PR y escala a ADMIN; **nunca auto-merge**.
- **Ratchet**: acepta un diff solo si `tests pasados ⊇ anterior`.

# toon-memory

La memoria se auto-inyecta vía .opencode/instructions/memory-autoload.md; usa memory_recall solo como fallback.
