#!/bin/bash
# walker A — queue 9: SANS Availability, the five cockpit seats again (the first judge counted an unrelated "OCU in with no IP" ring as a fault)
cd "C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port" || exit 1
export HP_URL=http://localhost:4231
export HP_SHOTS="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/img/handpass/2026-10-06-blank-times-absence/A"
export BTA_X=bullet BTA_CS=Zulu BTA_SEAT=w
P="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/handpass/parts"
T="${TEMP:-/tmp}"
HP_OUT="$P/bta-A-h01s2.json" node scripts/handpass/bta-A-cells.mjs h01s2 "SANS Availability" fly,scMain,scSpare,bbMain,bbSpare all > "$T/bta-A-h01s2.txt" 2>&1
echo "h01s2 done exit $?" >> "$T/bta-A-queue9.log"
echo ALLDONE >> "$T/bta-A-queue9.log"
