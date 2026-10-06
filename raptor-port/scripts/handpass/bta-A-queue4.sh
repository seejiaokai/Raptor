#!/bin/bash
# walker A — queue 4: H-01 again for the BB seats of OL, ATT C, ATT B (the first run judged their sentence against too strict a wording) and LL AM flying line of S19
cd "C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port" || exit 1
export HP_URL=http://localhost:4231
export HP_SHOTS="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/img/handpass/2026-10-06-blank-times-absence/A"
P="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/handpass/parts"
T="${TEMP:-/tmp}"
HP_OUT="$P/bta-A-h01bb.json" node scripts/handpass/bta-A-cells.mjs h01bb "OL,ATT C,ATT B" bbMain,bbSpare,bbDesk all > "$T/bta-A-h01bb.txt" 2>&1
echo "h01bb done exit $?" >> "$T/bta-A-queue4.log"
HP_OUT="$P/bta-A-s19r.json" node scripts/handpass/bta-A-s3.mjs s19 fly LL > "$T/bta-A-s19r.txt" 2>&1
echo "s19r done exit $?" >> "$T/bta-A-queue4.log"
echo ALLDONE >> "$T/bta-A-queue4.log"
