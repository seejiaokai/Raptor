/* WALKER H — the closing table (verdicts as judged from the runs in cal-H-x10 … x18b; the per-step rows are the other parts of cal-H.json) */
import * as H from './cal-H-lib.mjs'
const V = (id, verdict, why) => H.row(id, 'see the part rows of this file and cal-H.md', why, verdict, [])
V('X-10', 'FAIL', 'different items PASS (group input; requirement on two days); same-item conflicts refuse and leave the other man\'s work, but the refusal never names the newer actor (group input, holiday, requirement); two different holidays also refuse (A\'s Undo of his own holiday refused after B added another)')
V('X-11', 'FAIL', 'All changes and New to you hold ONE shared item with the names; deletion and amendments keep the names; individual history stays attributable; jumps land on the right row; BUT To go out lists one line per man (3 lines), not one shared item')
V('X-12', 'PASS', '3 pending after the three-person filing; still 3 after the remark edit; 4 after an unrelated solo input; AL1 clears pending and issues the final wording')
V('X-13', 'FAIL', 'desktop and 390x568: failure band, Retry reachable, one saved result after retry and reload — PASS; 844x390: the opened-day window (and the settings window) lie over Retry')
V('X-14', 'PASS', 'settings window, Calendar window, Required cell, group editor, a drag begun as admin: none completed a write after authority was gone; doors by role as expected; guest and no-access paths held; sign-in card usable; the Medical tab draws no write door to any role')
V('X-15', 'PASS', 'no disproof: SANS counts excluded, published Fri 9 Oct reads 1 pending, issued face unchanged, nobody else touched (observations for the host: past days 6-7 Oct also lost the SANS count; the man\'s inputs were not trimmed)')
V('X-16', 'PASS', 'placement lines on the opened day, List and editor foot only; board, week, View-only Sched, print document and CSV carry none and match the baseline (print differs by the one publication line)')
V('X-17', 'FAIL', 'month: no inner scroll, button heights equal to the tall phone — PASS at all sizes; touch reach — PASS at 390x844 and 390x568 apart from Undo being under the pulled-up day window; 844x390: the day window covers the month arrows, Today and the gear, its cross is 28px')
V('X-18', 'PASS', 'all four stages keep the group, the single OIL credit, the pending count and the placed/changed line through a reload and a sign-in as Ranger and back; Undo does not carry over')
H.save('final', {})
