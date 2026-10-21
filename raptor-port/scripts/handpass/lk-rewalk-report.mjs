/* appends the re-walk section to docs/handpass/parts/lk/walk.md from walk-rewalk.jsonl (run once) */
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/handpass/parts/lk')
const rows = readFileSync(resolve(OUT, 'walk-rewalk.jsonl'), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
const counts = {}
for (const r of rows) counts[r.verdict] = (counts[r.verdict] || 0) + 1
let md = `\n## Re-walk (the code read's fixes)\n\nThe frozen server now serves the FIXED build, bundle \`assets/index-CanCZEkk.js\` (proved by curl). Script: \`raptor-port/scripts/handpass/lk-rewalk.mjs\` (data: \`walk-rewalk.jsonl\`). Pictures: \`raptor-port/docs/img/handpass/2026-10-21-look-keys/rewalk/\` (device scale factor 2). **Counts: ${Object.entries(counts).map(([k, v]) => v + ' ' + k).join(', ')}.**\n\nW6 is withdrawn: the brief's error (closing a window forgets where it was dragged by design, D41/S11, pinned by e2e/availwin.spec.ts) — not a fault.\n\n`
md += '| Scenario | Size | What was pressed | What was MEASURED | Verdict | Pictures (under `raptor-port/docs/img/handpass/2026-10-21-look-keys/`) |\n|---|---|---|---|---|---|\n'
for (const r of rows) md += `| ${esc(r.id)} | ${esc(r.size)} | ${esc(r.pressed)} | ${esc(r.measured)} | **${r.verdict}** | ${esc((r.pics || []).map(x => 'rewalk/' + x).join(', '))} |\n`
md += `
Notes on the re-walk:
- R3 ring: every ▲ ▼ ✕ reached by Tab (7 of them) has its 4px ring box inside the list's scroll box; the ✕ buttons sit with 0px slack on the right and the first row's ▼ and ✕ have 0.5px above (the last row's ▲ and ✕ 0.5px below), so the ring is exactly inside, not clipped. The zoomed pictures show the full ring all round (the magenta marker is 7px outside the button, outside the ring).
- R3b (the only FAIL): with the edit list open, the first name box's left edge is 537 and the reason box's left edge is 526 — 11px apart, not equal (expected equal within 1px "as before"); the list's scroll box starts at 533 and the name box stands 4px inside it. Picture \`rewalk/r3-rows-align-1440.png\` (the reason box and the first name box marked). I cannot say what it was before the fix.
- R1/R2: at 1920 both windows stand at 96; after narrowing to 1200x800 both are at 112 (bar bottom 104 + 8) whichever was opened first; the ALL AVAIL window (left 972) then lies behind the changes window (left 804), both in the same right-hand column.
- R4/R5: on the phone the note stands at the top (data-at "top", box y 10, height 38), clear of the window (window top 309); after tapping the window's ✕ the note stays at the top, still showing, 600ms later too. The notes were raised by Undo (R4) and Redo (R5).
- R6: the reader's copy held the note's words at +100ms and was empty once the note's opacity reached 0 (about 2.5s).
- Console / page errors in the re-walk: none.
`
appendFileSync(resolve(OUT, 'walk.md'), md)
console.log(JSON.stringify(counts))
