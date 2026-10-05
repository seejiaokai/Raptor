#!/bin/bash
# stream K: L-09 .. L-16 (copies of the earlier recipe); every output to a file
cd "C:/Users/User/projects/Raptor/raptor-port"
export HP_URL=http://localhost:4232
export HP_SHOTS="C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-06-codex-stack-fix/N"
export HP_OUT="C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/stk2-N-K.json"
LOG="C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/40895a2e-0dae-4bf2-829f-19d122a9ab14/scratchpad"
K_SIZE=desk node scripts/handpass/stk2-N-L09b.mjs > "$LOG/L09d.log" 2>&1
K_SIZE=phone node scripts/handpass/stk2-N-L09b.mjs > "$LOG/L09p.log" 2>&1
node scripts/handpass/stk2-N-L10.mjs > "$LOG/L10.log" 2>&1
node scripts/handpass/stk2-N-L11.mjs > "$LOG/L11.log" 2>&1
K_SIZE=desk node scripts/handpass/stk2-N-L12.mjs > "$LOG/L12d.log" 2>&1
K_SIZE=phone node scripts/handpass/stk2-N-L12.mjs > "$LOG/L12p.log" 2>&1
node scripts/handpass/stk2-N-L13t.mjs > "$LOG/L13.log" 2>&1
node scripts/handpass/stk2-N-L14.mjs > "$LOG/L14.log" 2>&1
K_SIZE=desk node scripts/handpass/stk2-N-L15.mjs > "$LOG/L15d.log" 2>&1
K_SIZE=phone node scripts/handpass/stk2-N-L15.mjs > "$LOG/L15p.log" 2>&1
node scripts/handpass/stk2-N-L16.mjs > "$LOG/L16.log" 2>&1
echo done > "$LOG/K.done"
