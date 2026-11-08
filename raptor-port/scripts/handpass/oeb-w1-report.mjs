console.log('oeb-w1-report v1')
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const H = dirname(fileURLToPath(import.meta.url))
const files = ['fresh-pc', 'fresh-phone', 'more-pc', 'more-phone', 'saved-phone', 'saved-phone-A27', 'saved-pc']
const map = new Map(); const odd = []
for (const f of files) { const j = JSON.parse(readFileSync(join(H, `.oeb-w1-${f}.json`), 'utf8')); for (const r of j.rows) map.set(r.sc + '|' + r.size, r); odd.push(...j.odd) }
const order = s => { const m = s.match(/^(W1\.(\d+)|A(\d+))/); return m ? (m[2] ? +m[2] : 100 + +m[3]) : 999 }
const rows = [...map.values()].sort((a, b) => order(a.sc) - order(b.sc) || a.sc.localeCompare(b.sc) || a.size.localeCompare(b.size))
const esc = s => String(s).replace(/\|/g, '\|').replace(/\n/g, ' ')
const cnt = {}; for (const r of rows) cnt[r.res] = (cnt[r.res] || 0) + 1
let md = `# W1 report — OIL Earn on the Scheduler Board (8 Nov 26)\n\nWalker W1 (Sonnet 5.5). Build: frozen folder dist-a827307a5 (commit a827307a5). Fresh world at origin 4381, saved Saturday at origin 4173, both served in-browser; clock Mon 13 Jul 09:00, running. Phone = WebKit 402x874 touch (taps); PC = Chromium 1536x864 at 1.25 (mouse/keys). Pictures: raptor-port/docs/img/handpass/2026-11-08-oil-earn-board/w1/ .\n\nTotals (rows below, one row per check): ${Object.entries(cnt).map(([k, v]) => k + ' ' + v).join(', ')}.\n\n## Table\n\n| Scenario | Size | Result | What the screen showed | Picture(s) |\n|---|---|---|---|---|\n`
for (const r of rows) md += `| ${esc(r.sc)} | ${r.size} | ${r.res} | ${esc(r.said)} | ${esc(r.pic)} |\n`
const fails = rows.filter(r => r.res === 'FAIL')
md += `\n## FAILs in detail\n\n${fails.length ? fails.map(r => `- ${r.sc} (${r.size}): ${r.said}`).join('\n') : 'None.'}\n`
md += `\n## Notes on how scenarios were read (script-side, not app faults)\n
- "Switch off, note gone": the bar's note line is never empty. Switched off it reads "Tap a puck to take a man off that event · tap an item to stop the whole item earning"; "gone" was judged as the switch's own sentence no longer showing.
- On the PC the day bar's Templates / OIL Earn buttons are hidden at rest (the top toolbar holds OIL Earn); the bar with THIS DAY, Templates and OIL Earn is a phone thing, so W1.1 is phone only.
- W1.7 / A15: moving to another day, and reloading, leave OIL Earn mode OFF on arrival (RECORDED in each row); I pressed OIL Earn to read the switch.
- A24: a fresh browser world signed in as us/us stands in for "sign out, sign in" (the member's nav shows no Edit Schedule). Neither the member nor the admin on View-only Sched was offered a board (window.openScheduler(5) opened none there), so "no OIL Earn, no switch" holds because no board opens; contrast: the same admin on Edit Schedule has the OIL Earn control.
- A5/A6: no day was published in the world; I published Saturday through the real controls (four sign-offs, Publish day). After publishing the sign-off strip is gone from the board, so no sign-off figures can be read; the readable markers are the version chip (ORIG) and the day's publish button. Switch ON adds a disabled "Publish AL1" button and the issues panel goes from "3 issues" to "2 issues"; switch OFF returns both exactly to the published state (RECORDED in A5/A6 rows).
- A12: after the four real changes (man, event, switch on, switch off) Undo is disabled, so the entry boundary ("Undo exits OIL Earn") was not reached; the two refused taps added no Undo step.
- A13: two quick presses were 120 ms apart.
- A25: on the phone both windows open at the same place and the Changes window covers the ALL AVAIL window completely (the ALL AVAIL window is open, one on screen, under it).
- W1.10 and A25 used the saved Saturday; A5/A6 and W1.9 published it in a world of its own per size.
`
md += `\n## Odd things seen that no scenario asked about\n
- ESCAPE DOES NOT CLOSE THE ALL AVAIL WINDOW (PC and phone): opened from a placeholder's count in OIL Earn, Escape pressed with the keys on the page, on the window's title and on its tab: the window stayed open every time. Its ✕ closes it. After "✓ OIL done" and "✓ Done" the window is still open, floating over the week view (picture W1.10-pc-board-closed.png). W1.10 asked for "close it by Escape" without an EXPECTED line, so RECORDED, not FAIL. I did not check whether this predates the change.
- The keyboard ring on the switch (W1.4) is a white outline around the slider, not the app's cyan ring (picture W1.4-pc-ring.png).
- Undo / Redo passing notes read "Undid: an OIL decision" / "Redid: an OIL decision" (W1.5 rows).
- In OIL Earn with the switch on, every item name on the board (FAMILY DAY, VIPER, COBRA, SDO…) is drawn struck through.
- On the phone in the board's desktop layout the day bar shows THIS DAY with Templates and OIL Earn pushed off to the right edge (measured 104x23 and 93x23 with marks, but outside the first screen; pan sideways).
- Passing notes seen on a press of the switch: on "Nothing on this day earns OIL, including anything added later"; off "This day can earn OIL again, and the marks underneath are back".
- Page errors: ${odd.filter(o => /page errors/.test(o)).length ? odd.filter(o => /page errors/.test(o)).join('; ') : 'none in any run'}.
`
const out = join(H, '..', '..', 'docs', 'handpass', 'parts'); mkdirSync(out, { recursive: true })
writeFileSync(join(out, '2026-11-08-oil-earn-w1.md'), md)
console.log(JSON.stringify(cnt), fails.map(f => f.sc + '/' + f.size))
