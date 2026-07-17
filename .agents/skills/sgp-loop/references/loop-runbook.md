# SGP Loop — Runbook

Exact commands for the SGP agent loop. The repo uses Docker as the sole runtime
manager, so **all verification runs inside containers** (host has no deps/CLI).

## 0. Preconditions (preflight)

```bash
docker compose up -d --build          # mysql, redis, backend, frontend, nginx
docker compose ps                     # all healthy before starting a cycle
```

## 1. Discovery

Read `LOOP.md`. Pick the next INVEST story whose dependencies are `HECHO`.
Story IDs follow `docs/spec-xp.md`: A1–A3, B1–B2, C1–C2, D1–D4, E1–E2,
F1–F2, G1–G3, H1–H2, I1, J1–J2.

## 2. Handoff (isolated worktree)

```bash
git worktree add .worktrees/loop-<STORY> -b loop/<STORY>
cd .worktrees/loop-<STORY>
```

## 3. Maker (inside the worktree)

Drive implementation with `ralph-loop-workflow` + `tdd-orchestrator` discipline:
- Write the test first (jest/e2e backend, vitest frontend) — red.
- Implement — green.
- Refactor; keep lint clean.
- Respect path aliases: `@modules/*`, `@/*`.
- No `console.log` in backend; use `Logger`.

## 4. Oracle — `scripts/loop-check.sh` (THE ONLY TRUTH)

Exit code 0 = pass. Anything else = fail. Runs inside containers:

```bash
bash scripts/loop-check.sh            # valida el repo completo
bash scripts/loop-check.sh <STORY>    # modo ciclo: lint+test enfocado en el diff del loop
```

En **modo ciclo** (`<STORY>`), el oráculo aísla la verificación del loop:
- backend: solo `npm test -- --testPathPattern=loop` + `eslint src/modules/loop`
- frontend: solo `eslint src/features/loop-dashboard` + todos los tests
- dbml2sql: siempre (P3)
- e2e del repo: omitido (deuda preexistente fuera de alcance del ciclo)

Esto evita que la deuda de lint/tests del repo completo bloquee el ciclo del loop.
En modo repo completo valida todo (usado como gate de CI global).

The script MUST do (contract):
- `docker compose exec sgp_api_backend npm test`
- `docker compose exec sgp_api_backend npm run test:e2e`
- `docker compose exec sgp_api_backend npm run lint`
- `docker compose exec sgp_frontend_dev npm run lint`
- `docker compose exec sgp_frontend_dev npm test`
- `docker compose exec sgp_api_backend npx dbml2sql docs/dbml/sgp.dbml` (P3: validate DBML)

If DBML changed, regenerate SQL and review the migration diff.

## 5. Checker — `adversarial-review`

Independent cross-model review of the diff. Report-only. Survivors become the
verification evidence recorded in the receipt. The maker never grades itself.

## 6. Ratchet + Persist

- Read `.loop_state.json` `testsPassedBefore`.
- If `testsPassedAfter` ⊉ `testsPassedBefore` → revert diff, re-prompt (max 3).
- On green: write receipt to `LOOP.md` (halt reason, before/after test counts,
  cost, commit SHA) and update story status to `EN_REVISION` / `HECHO`.

## 7. Escalate (human gate)

```bash
git push -u origin loop/<STORY>
gh pr create --title "loop(<STORY>): <title>" --body "Receipt: see LOOP.md"
```

A human (ADMIN) reviews and merges. **Never auto-merge.**

## 8. Stop rules

Stop the cycle when ANY of:
- all tests + lint pass AND `adversarial-review` finds no unrelated change, OR
- 3 failed attempts, OR
- the same failure repeats, OR
- token/time budget exceeded.

## State files

- `LOOP.md` — backlog + receipts (durable spine).
- `.loop_state.json` — `{ storyId, testsPassedBefore, testsPassedAfter, lastCommit, halted: bool, haltReason }`.
