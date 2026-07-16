#!/bin/bash
CFG="/home/egraterol/projects/sgp/.toon-memory/memory/config.json"
if [ -z "$TOON_MEMORY_CAPTURE" ]; then
  if [ ! -f "$CFG" ]; then exit 0; fi
  grep -q '"capture"[[:space:]]*:[[:space:]]*true' "$CFG" 2>/dev/null || exit 0
fi
node "/home/egraterol/.nvm/versions/node/v24.15.0/lib/node_modules/toon-memory/dist/cli/capture.js" claude
exit 0
