#!/bin/bash
# walker A — queue 8: H-01 for SANS Availability, filed for Zulu (bullet, a WSO and a SANS man) because the app refuses it for Vandal ("SANS Availability is for SANS aircrew only")
cd "C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port" || exit 1
export HP_URL=http://localhost:4231
export HP_SHOTS="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/img/handpass/2026-10-06-blank-times-absence/A"
export BTA_X=bullet BTA_CS=Zulu BTA_SEAT=w
P="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/handpass/parts"
T="${TEMP:-/tmp}"
HP_OUT="$P/bta-A-h01s.json" node scripts/handpass/bta-A-cells.mjs h01s "SANS Availability" fly,scMain,scSpare,bbMain,bbSpare,duty,sim,ground,prog,bbDesk all > "$T/bta-A-h01s.txt" 2>&1
echo "h01s done exit $?" >> "$T/bta-A-queue8.log"
echo ALLDONE >> "$T/bta-A-queue8.log"
