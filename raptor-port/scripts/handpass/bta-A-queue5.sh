#!/bin/bash
# walker A — queue 5: S12's AVALON cockpit seats again (the first run judged their sentence against too strict a wording), H-02 on the desktop again
cd "C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port" || exit 1
export HP_URL=http://localhost:4231
export HP_SHOTS="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/img/handpass/2026-10-06-blank-times-absence/A"
P="C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/handpass/parts"
T="${TEMP:-/tmp}"
HP_OUT="$P/bta-A-s12r.json" node scripts/handpass/bta-A-s2.mjs s12 cockpit > "$T/bta-A-s12r.txt" 2>&1
echo "s12r done exit $?" >> "$T/bta-A-queue5.log"
HP_OUT="$P/bta-A-h02d2.json" node scripts/handpass/bta-A-s1.mjs h02 > "$T/bta-A-h02d2.txt" 2>&1
echo "h02d2 done exit $?" >> "$T/bta-A-queue5.log"
echo ALLDONE >> "$T/bta-A-queue5.log"
