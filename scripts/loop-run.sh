#!/usr/bin/env bash
# SGP Loop — Cycle runner (orchestrates the outer loop for ONE story).
#
# Encadena: discovery (LOOP.md) -> worktree -> maker (TDD) -> ORACLE (loop-check.sh)
# -> checker (sgp-verifier via adversarial/caveman-review) -> ratchet/persist -> escalate.
#
# Uso:  bash scripts/loop-run.sh <STORY_ID>   (p.ej. C2)
# Requiere: docker compose arriba, git, gh (para PR).
set -uo pipefail

STORY="${1:-}"
if [ -z "$STORY" ]; then
  echo "Uso: bash scripts/loop-run.sh <STORY_ID>   (ej: C2)" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

YELLOW='\033[1;33m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
log() { printf "${YELLOW}◆ %s${NC}\n" "$1"; }

# 1. Discovery: confirmar story en LOOP.md
if ! grep -q "**$STORY**" LOOP.md; then
  printf "${RED}Story $STORY no encontrada en LOOP.md${NC}\n" >&2
  exit 3
fi
log "Discovery: story $STORY seleccionada."

# 2. Handoff: worktree aislado
WT=".worktrees/loop-$STORY"
BRANCH="loop/$STORY"
if [ ! -d "$WT" ]; then
  git worktree add "$WT" -b "$BRANCH"
fi
log "Handoff: worktree $WT (branch $BRANCH)."

# 3. Maker: delegado al agente sgp-maker (ralph-loop-workflow + tdd-orchestrator).
#    Aquí el runner solo prepara el entorno; el maker se invoca por el harness
#    (Codex/Claude) con el sub-agent sgp-maker. El runner verifica el resultado.
log "Maker: ejecuta el sub-agent 'sgp-maker' en $WT (ralph-loop-workflow + tdd-orchestrator)."
echo "  → cd $WT && <invocar sgp-maker con la story $STORY>"
echo "  → esperar a que scripts/loop-check.sh pase antes de continuar."

# 4. Oracle (modo ciclo: enfocado en el diff del loop)
log "Oracle: scripts/loop-check.sh $STORY"
if ! bash scripts/loop-check.sh "$STORY"; then
  printf "${RED}ORACLE RED: el maker debe ratchetear/revertir y reintentar (max 3).${NC}\n"
  exit 4
fi

# 5. Checker (maker ≠ checker): sgp-verifier revisa el diff.
log "Checker: sub-agent 'sgp-verifier' revisa el diff (adversarial-review / caveman-review)."
echo "  → invocar sgp-verifier sobre el diff de $BRANCH vs main."
echo "  → esperar VERDICT: APPROVE para continuar."

# 6. Ratchet + persist (placeholder; el maker/verifier llenan los números)
log "Ratchet: actualizar .loop_state.json y recibo en LOOP.md (tests before/after, commit)."

# 7. Escalate (human gate)
log "Escalate: abrir PR y escalar a ADMIN (nunca auto-merge)."
echo "  → git push -u origin $BRANCH && gh pr create --title \"loop($STORY)\""

printf "\n${GREEN}Cycle para $STORY listo para revisión humana.${NC}\n"
