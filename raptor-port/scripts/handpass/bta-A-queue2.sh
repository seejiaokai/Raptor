#!/bin/bash
# walker A — queue 2: S12, S13, S14 one after another (desktop)
cd "C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port" || exit 1
export HP_URL=http://localhost:4231
export HP_SHOTS="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/img/handpass/2026-10-06-blank-times-absence/A"
P="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/handpass/parts"
T="${TEMP:-/tmp}"
for s in s12 s13 s14; do
  HP_OUT="$P/bta-A-${s}d.json" node scripts/handpass/bta-A-s2.mjs $s > "$T/bta-A-${s}d.txt" 2>&1
  echo "$s done exit $?" >> "$T/bta-A-queue2.log"
done
echo ALLDONE >> "$T/bta-A-queue2.log"
