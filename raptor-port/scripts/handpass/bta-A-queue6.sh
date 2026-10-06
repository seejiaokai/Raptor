#!/bin/bash
# walker A — queue 6: S24 again (a refusal that changes nothing is a PASS; one that says nothing is PARTIAL)
cd "C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port" || exit 1
export HP_URL=http://localhost:4231
export HP_SHOTS="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/img/handpass/2026-10-06-blank-times-absence/A"
P="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/handpass/parts"
T="${TEMP:-/tmp}"
HP_OUT="$P/bta-A-s24r.json" node scripts/handpass/bta-A-s3.mjs s24 > "$T/bta-A-s24r.txt" 2>&1
echo "s24r done exit $?" >> "$T/bta-A-queue6.log"
echo ALLDONE >> "$T/bta-A-queue6.log"
