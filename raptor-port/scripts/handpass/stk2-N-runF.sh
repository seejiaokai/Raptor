#!/bin/bash
# stream F: P5-01..08 and X-06/07 (copies of the earlier recipe), then X-06/07; every output to a file
cd "C:/Users/User/projects/Raptor/raptor-port"
export HP_URL=http://localhost:4232
export HP_SHOTS="C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-06-codex-stack-fix/N"
export HP_OUT="C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/stk2-N-F.json"
LOG="C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/40895a2e-0dae-4bf2-829f-19d122a9ab14/scratchpad"
F_RUN=a F_ONLY=1,2,3,4 node scripts/handpass/stk2-N-p5a.mjs > "$LOG/p5a.log" 2>&1
F_RUN=b F_ONLY=5,6,6p,7,8 node scripts/handpass/stk2-N-p5b.mjs > "$LOG/p5b.log" 2>&1
F_RUN=c F_ONLY=6,7 node scripts/handpass/stk2-N-x2.mjs > "$LOG/x2.log" 2>&1
echo done > "$LOG/F.done"
