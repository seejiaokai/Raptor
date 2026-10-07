#!/bin/bash
# walker A — queue 3: H-01 for the types of group b (OD, Training, Meeting, SANS Availability, Upchit) on the right server, then the phone S01
cd "C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port" || exit 1
export HP_URL=http://localhost:4231
export HP_SHOTS="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/img/handpass/2026-10-06-blank-times-absence/A"
P="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/handpass/parts"
T="${TEMP:-/tmp}"
FAMS=fly,scMain,scSpare,bbMain,bbSpare,duty,sim,ground,prog,bbDesk
HP_OUT="$P/bta-A-h01b.json" node scripts/handpass/bta-A-cells.mjs h01b "OD,Training,Meeting,SANS Availability,Upchit" $FAMS few > "$T/bta-A-h01b2.txt" 2>&1
echo "h01b done exit $?" >> "$T/bta-A-queue3.log"
HP_PHONE=1 HP_OUT="$P/bta-A-s01p.json" node scripts/handpass/bta-A-s1.mjs s01p > "$T/bta-A-s01p.txt" 2>&1
echo "s01p done exit $?" >> "$T/bta-A-queue3.log"
echo ALLDONE >> "$T/bta-A-queue3.log"
