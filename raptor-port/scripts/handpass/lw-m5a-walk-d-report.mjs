// Walker D: builds the table of the report from the scripts' result files (docs/img/.../d/*.json) plus the by-hand overrides and extras.
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const dir = path.resolve(here, '../../docs/img/handpass/2026-10-28-lw-m5a/d')
const files = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6-desk', 'd6-phone', 'd7a', 'd7b', 'd7c', 'd8']
let rows = []
for (const f of files) for (const r of JSON.parse(readFileSync(path.join(dir, f + '.json'), 'utf8'))) rows.push({ ...r, src: f })
const set = (pre, patch) => { const r = rows.find(x => x.id.startsWith(pre)); if (!r) throw new Error('no row ' + pre); Object.assign(r, patch) }
set('row6 route', { verdict: 'NOTE', said: r => r })
rows.find(x => x.id.startsWith('row6 route')).said = 'The bid window\'s Pick a range could not carry a leave from Thu 31 Dec 26 over into 2027: after both ends were picked the selection read "31 Dec 26" only, and only Thu 31 Dec 26 was placed (Gambit\'s list: "LL Thu 31 Dec 1 Approved"). The same leave filed on the Inputs page as one input reaches D1473\'s example (next row). Not counted as a fault of M5a; the host may want to know the grid route stops at the period\'s end.'
set('52 the window reopened', { verdict: 'FAIL' })
rows.find(x => x.id.startsWith('52 the window reopened')).said = 'After midnight the window left open reads App bal 69 incl 33 and the year picker "2027 and ahead" (options "2027 and ahead", "2026") but STILL LISTS the eight 2026 leave lines (19–21 Jan … 17 Mar 2026, 8 lines); closed and reopened the same picker lists 0 lines. The figures follow midnight, the list under the picker does not.'
set('2 below-zero ask', { verdict: 'PASS' })
rows.find(x => x.id.startsWith('2 below-zero ask')).said = 'Saint War bal 10 (typed 20, LL 1–12 Feb 2027 approved = 10 charged), LL Sat 13 – Sun 21 Feb 2027 picked: the LL button reads 10; after the first press the window stays open and says "That takes Saint to -1 LVE. Tap the same leave again to go ahead." — the ask names −1 (10 − 11), as the designer expected, though the bid\'s own days count 5. Second press placed it: App bal −1.'
set('5d carried fwd 25', { verdict: 'FAIL' })
rows.find(x => x.id.startsWith('5d carried fwd 25')).said = 'Designer\'s reading: carried fwd 25 typed beside App bal 20 is clamped at once to "incl. 20". Seen: it is REFUSED — the box goes back to 0 and the words under it read "Carried forward is from 0 to 20"; App bal 20 kept. (Then App bal 3 → 3 incl 0, because the incl. was still 0.) A host reading — refusal with words is a fair design; second half passes in the next row (a typed incl. 20 then App bal 3 → 3 incl 3).'
// extras walked in the first run of d7a (its result file was overwritten by the re-run from step 7) and by hand
const extra = [
  { id: '38 the grid\'s two lines beside Ranger follow the View period (26 → 27 → 26)', size: 'desk', verdict: 'PASS', said: 'View JAN-DEC 26: "12.5" over "7.5"; View JAN-DEC 27: the first line 12.5 unchanged, no second line (no LL/OL in 2027); back to 26: 12.5 / 7.5.', pics: ['d7a-38-view27'] },
  { id: '6 correcting only "incl." (row-1 state 15 incl 2): incl. 3 → 15 incl 3 (never 17); then App bal 16 → 16 incl 3; Undo twice', size: 'desk', verdict: 'PASS', said: 'incl. 3: App bal 15 incl 3; App bal 16: 16 incl 3; Undo once: 15 incl 3 (note "Undid: LVE balance 15 → 16"); Undo twice: 15 incl 2 (note "Undid: LVE carried fwd 2 → 3"). No "15 → 15" line.', pics: ['d7a-6-incl3', 'd7a-6-app16', 'd7a-6-undone-twice'] },
  { id: '10a a holiday added after typing: PH on Tue 20 Jan (inside 19–21 Jan, in the snapshot)', size: 'desk', verdict: 'PASS', said: 'App bal 15 incl 2 unchanged (window, row, grid 12.5); the leave line now reads "Mon 19 – Wed 21 Jan 2 Approved".', pics: ['d7a-10a-bal-win'] },
  { id: '10b PH on Tue 27 Jan (inside 26–27 Jan, approved after typing)', size: 'desk', verdict: 'PASS', said: 'App bal rose 15 → 16 incl 2 → 3 at once with no reload on the Balances row, the window tile and the grid figure (13.5); line "Mon 26 – Tue 27 Jan 1 Approved".', pics: ['d7a-10b-bal-win', 'd7a-10b-grid'] },
  { id: '9 kind change LL → CCL on an approved leave (26–27 Jan) from the grid', size: 'desk', verdict: 'NOT WALKED', said: 'The bid window has no kind change on an existing leave: pressing the CCL button over the approved LL says "2 days not written: already holding leave or a medical." and writes nothing. The Inputs-page route (an input\'s own Type) was not tried (time).', pics: ['d7a-9-kind-changed'] },
  { id: 'glyph: a negative figure on each surface (Saint typed −2)', size: 'desk', verdict: 'FAIL', said: 'Balances box and War bal "−2" and the window\'s box and War bal "−2" use the true minus (U+2212); the grid\'s figure beside the name reads "-2" with a hyphen (U+002D); the below-zero ask reads "That takes Saint to -1 LVE" with a hyphen. Scenario 7 asks for one minus glyph on every surface.', pics: ['d7b-glyph-window', 'd7b-glyph-grid', 'd7b-2-ask'] },
  { id: '3 the leave buttons\' "left" (whole-leave window not tried)', size: 'desk', verdict: 'NOT WALKED', said: 'Only the one-day window walked (rows above). The whole-leave window\'s "All n days" versus one day, and the drag window, were not walked.', pics: [] },
  { id: '43 an approval lands while his box is open (via the bridge)', size: 'phone', verdict: 'NOT WALKED', said: 'The brief allows the bridge only for the lock; no bridge function approves a bid, so the approval cannot be made while his box is open without injecting it.', pics: [] },
  { id: '13 MED / Days taken with an ATT B', size: 'desk', verdict: 'NOT WALKED', said: 'Marked TEST + one picture; not walked here.', pics: [] },
]
rows = rows.concat(extra.map(e => ({ ...e, src: 'by hand' })))
const count = v => rows.filter(r => r.verdict === v).length
const pass = count('PASS'), fail = count('FAIL'), nw = count('NOT WALKED'), note = count('NOTE')
const esc = s => String(s).replace(/\|/g, '/').replace(/\n/g, ' ')
let md = `**${pass} PASS, ${fail} FAIL, ${nw} NOT WALKED, ${note} NOTE** (counted over the table below; each "errors" line is one check).\n\n| Scenario (designer's number or step) | Size | Verdict | What the screen said | Pictures |\n|---|---|---|---|---|\n`
for (const r of rows) md += `| ${esc(r.id)} | ${r.size} | ${r.verdict === 'FAIL' ? '**FAIL**' : r.verdict} | ${esc(r.said)} | ${(r.pics || []).map(p => p + '.png').join(', ')} |\n`
writeFileSync(path.resolve(here, '../../docs/handpass/parts/lw-m5a/_walker-d-table.md'), md)
console.log({ pass, fail, nw, note, total: rows.length })
