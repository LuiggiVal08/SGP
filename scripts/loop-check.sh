#!/usr/bin/env bash
# SGP Loop — External Oracle (the only truth for the agent loop).
# Runs verification INSIDE the Docker containers (host has no deps/CLI).
# Exit code 0 = pass; any non-zero = fail. The maker never grades itself.
#
# Uso:
#   bash scripts/loop-check.sh            # valida el repo completo
#   bash scripts/loop-check.sh <STORY>    # valida solo el diff del ciclo loop/<STORY>
#                                         # (lint enfocado en los archivos del worktree)
#
# Contract (see .agents/skills/sgp-loop/references/loop-runbook.md):
#   - backend: jest unit tests, e2e tests, lint
#   - frontend: lint, vitest
#   - DBML: dbml2sql validation (closes P3)
set -uo pipefail

STORY="${1:-}"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
step() { printf "${YELLOW}▶ %s${NC}\n" "$1"; }
ok()   { printf "${GREEN}✓ %s${NC}\n" "$1"; }
fail() { printf "${RED}✗ %s${NC}\n" "$1"; }

overall=0

# Si se pasa STORY, la verificación se enfoca en el diff real del worktree
# loop/<STORY> contra su rama base (develop por defecto; main como fallback).
# NO se usa `main` ciegamente: en este repo `main` está rezagado y el código
# alineado al DBML vive en `develop`. Esto aísla la verificación del loop de la
# deuda de lint/tests preexistente y la hace representativa del roadmap.
if [ -n "$STORY" ]; then
  WT=".worktrees/loop-$STORY"
  if [ ! -d "$WT" ]; then
    WT="."  # fallback: diff desde el checkout actual
  fi
  # Elegir la mejor upstream base (la realidad operativa del repo).
  BASE_REF=""
  for cand in develop origin/develop main origin/main; do
    if git -C "$WT" rev-parse --verify "$cand" >/dev/null 2>&1; then
      BASE_REF="$cand"
      break
    fi
  done
  if [ -z "$BASE_REF" ]; then
    # Sin upstream: comparar contra el padre inmediato del HEAD del worktree.
    BASE_REF="HEAD~1"
  fi
  step "Modo ciclo: diff de loop/$STORY vs $BASE_REF"
  # Archivos tocados por el ciclo (commits del branch fuera de la base).
  BE_DIFF=$(git -C "$WT" diff --name-only "$BASE_REF"...HEAD 2>/dev/null \
            || git -C "$WT" diff --name-only HEAD~1 HEAD 2>/dev/null)
  BE_LINT_FILES=$(echo "$BE_DIFF" \
    | grep '^backend/src' \
    | sed 's#^backend/##' \
    | tr '\n' ' ')
  # Archivos frontend tocados
  FE_LINT_FILES=$(echo "$BE_DIFF" \
    | grep '^frontend/src' \
    | sed 's#^frontend/##' \
    | tr '\n' ' ')
  # Si el diff no arrojó nada, cubrir todo para no dar un falso verde.
  if [ -z "$BE_LINT_FILES" ]; then BE_LINT_FILES="src"; fi
  if [ -z "$FE_LINT_FILES" ]; then FE_LINT_FILES="src"; fi
  RUN_E2E=0
  printf "  backend files: %s\n" "${BE_LINT_FILES:-<none>}"
  printf "  frontend files: %s\n" "${FE_LINT_FILES:-<none>}"
else
  BE_LINT_FILES="src"
  FE_LINT_FILES="src"
  RUN_E2E=1
  step "Modo repo completo"
fi

run_in() {
  # $1 = service, rest = command
  local svc="$1"; shift
  step "docker compose exec $svc: $*"
  if docker compose exec "$svc" "$@"; then
    ok "$svc: $*"
  else
    fail "$svc: $*"
    overall=1
  fi
}

# --- Backend ---
if [ -n "$STORY" ]; then
  # En modo ciclo corremos TODOS los unit tests (rápido, ~20s) para respetar el
  # ratchet (tests pasados ⊇ anterior). El lint sí se enfoca en el diff.
  run_in sgp_api_backend npm test
else
  run_in sgp_api_backend npm test
  run_in sgp_api_backend npm run test:e2e
fi
# shellcheck disable=SC2086
run_in sgp_api_backend npx eslint $BE_LINT_FILES

# --- Frontend ---
# shellcheck disable=SC2086
run_in sgp_frontend_dev npx eslint $FE_LINT_FILES
run_in sgp_frontend_dev npm test

# --- DBML validation (P3) ---
step "docker compose exec sgp_api_backend: dbml2sql validate"
# El DBML vive en el root; en el contenedor se monta en /app/docs-dbml (ver docker-compose.yml).
DBML_IN_CONTAINER="/app/docs-dbml/sgp.dbml"
if docker compose exec sgp_api_backend npx --yes dbml2sql --help >/dev/null 2>&1; then
  if docker compose exec sgp_api_backend npx --yes dbml2sql "$DBML_IN_CONTAINER" >/dev/null 2>&1; then
    ok "dbml2sql: schema valid"
  else
    fail "dbml2sql: schema INVALID — revisa docs/dbml/sgp.dbml"
    overall=1
  fi
else
  printf "${YELLOW}⚠ dbml2sql CLI not installed in container — skipping (install via 'docker compose exec sgp_api_backend npm i -D @dbml/cli')${NC}\n"
fi

if [ "$overall" -eq 0 ]; then
  printf "\n${GREEN}ORACLE: GREEN — loop may proceed to checker + escalate.${NC}\n"
else
  printf "\n${RED}ORACLE: RED — loop must ratchet/revert and re-prompt.${NC}\n"
fi
exit $overall
