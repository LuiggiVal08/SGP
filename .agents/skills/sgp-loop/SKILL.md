---
name: sgp-loop
description: >-
  Loop Engineering orchestrator for the SGP system. Drives the autonomous
  outer loop that discovers work from docs/spec-xp.md, hands it to isolated
  maker agents, verifies via an external oracle (tests + lint + dbml2sql),
  and persists state to LOOP.md. Use when implementing a user story from the
  SGP backlog, running the agent loop, or verifying a diff against the SRS/DBML.
risk: high
source: project
---

# SGP Loop Engineering — Orchestrator Skill

This skill is the **durable intent** for the SGP agent loop. It ties together the
four supporting skills already installed in this repo and encodes the project's
Definition of Done so the loop never has to re-derive it.

## What this loop is (and is not)

- **It is**: an autonomous *outer* control loop around the coding agent — discovery
  → handoff → isolated implementation → independent verification → persist → repeat,
  with a human gate on irreversible actions (merge / deploy / delete).
- **It is NOT**: a replacement for XP/TDD. SGP is built with Extreme Programming
  (see `docs/metodologia.md`). This loop *automates* that methodology; it does not
  change it.

## The five moves + memory (Osmani/Steinberger model)

1. **Discovery** — read `LOOP.md` (backlog of épicas A–J, 28 stories from
   `docs/spec-xp.md`). Pick the next INVEST story whose dependencies are done.
2. **Handoff** — open an isolated git worktree on a branch `loop/<story-id>`.
   Give the maker the story Card + Confirmation criteria + this skill.
3. **Verification (external oracle)** — run `scripts/loop-check.sh` *inside the
   Docker containers*. Exit code is the only truth. The maker does **not** grade
   its own homework.
4. **Persist** — append a receipt to `LOOP.md` (halt reason, tests passed before/after,
   cost, commit). Update story status.
5. **Schedule / escalate** — on green, open a PR and escalate to a human (ADMIN).
   The human approves the merge. Never auto-merge.
6. **Memory** — `LOOP.md` + `.loop_state.json` live on disk; the model forgets
   between runs, the repo does not. Optionally reinforce with `supermemory`.

## Sub-agents (maker ≠ checker — the load-bearing split)

Defined as TOML in `.agents/agents/` (Codex/Claude compatible):

- **`sgp-maker`** — implements ONE story in an isolated worktree using
  `ralph-loop-workflow` + `tdd-orchestrator`. Never reviews its own diff.
- **`sgp-verifier`** — independent reviewer (distinct model) that checks the diff
  against `docs/requisitos.md` + `docs/dbml/sgp.dbml` + DoD. Uses `adversarial-review`
  and `caveman-review` for the report. Report-only; emits `VERDICT: APPROVE |
  REQUEST_CHANGES | REJECT`. The maker never grades itself.

Run a full cycle with `bash scripts/loop-run.sh <STORY>` (discovery → worktree →
maker → oracle → checker → persist → escalate).

## Supporting skills (already installed — invoke as needed)

| Skill | Role in this loop |
|---|---|
| `ralph-loop-workflow` | Autonomous loop engine: breaks a wide outcome prompt into tasks, builds/tests/ships, gated by preflight. Use for the maker's inner drive. |
| `tdd-orchestrator` | Red-green-refactor discipline + verification checklists. Use to keep the maker TDD-correct. |
| `adversarial-review` | Independent cross-model verifier of the diff. Use as the checker (maker ≠ checker). Report-only. |
| `supermemory` | Durable memory outside the context window. Use for cross-session loop state. |
| `docker-expert` | Build the `loop-check.sh` oracle and run `dbml2sql` validation (P3) inside containers. |

## Definition of Done (transversal — from docs/spec-xp.md §DoD)

1. Every story has ≥1 automated test (backend jest/e2e; frontend vitest).
2. Lint clean: `tseslint` type-checked (backend), ESLint flat (frontend).
3. Scope visibility respected: Coordinador→his PNF; Docente→his groups; Alumno→his project.
4. No `console.log` in backend — use NestJS `Logger`.
5. Path aliases mandatory: `@modules/*` (backend), `@/*` (frontend).

## Hard business rules the loop MUST enforce (from docs/requisitos.md)

- **D3** — `project_academic_tutors.professorId` MUST NOT equal the
  `project.subjectAssignment.professorId` (whoever imparts the assignment cannot
  tutor those groups). Backend rejects invalid assignment with 422.
- **G3** — TOMO correction flow: group uploads TOMO (`version+1`); tutor creates
  `project_corrections` (`PENDIENTE`); tutor marks `RESUELTA` (`resolvedAt`) after
  verifying re-upload. Traceability "correction → resolved?".
- **Scope by role** — filtering is a backend *application* rule, not in the DBML.
- **DBML is source of truth** — validate schema changes with `dbml2sql` (P3).

## Convergence guardrails (loopengineering.run properties)

- **External oracle**: `loop-check.sh` exit code, never the agent's self-report.
- **Ratchet**: accept a diff only if the passing-test set is a **superset** of the
  last accepted set. A diff that fixes one test while regressing another is
  reverted and re-prompted.
- **Stop rules** (whichever first): all tests+lint pass AND checker finds no
  unrelated change; OR 3 failed attempts; OR repeated identical failure; OR
  pre-set token/time budget exceeded.
- **Isolation**: every cycle runs in its own worktree; never touches the main checkout.
- **Receipts**: every halt emits a computed reason + replayable record in `LOOP.md`.

## How to start a cycle

```
1. Read LOOP.md → choose next story (e.g. C2 Perfil de estudiante).
2. git worktree add .worktrees/loop-C2 -b loop/C2
3. Maker (ralph-loop-workflow + tdd-orchestrator): implement + TDD in worktree.
4. Oracle: bash scripts/loop-check.sh   # inside docker
5. Checker: adversarial-review on the diff.
6. On green: open PR, escalate to ADMIN. Append receipt to LOOP.md.
7. On red: ratchet check; revert if regressed; re-prompt (max 3).
```

See `references/loop-runbook.md` for the exact commands and the `loop-check.sh`
contract.
