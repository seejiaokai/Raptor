// Merge the per-scenario row files into docs/handpass/parts/it-B.json and it-B.md (walker B).
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
const PIC = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-09-input-title-check/B/'
const D = 'C:/Users/User/projects/Raptor/raptor-port/scripts/handpass'
const OUTD = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts'
mkdirSync(OUTD, { recursive: true })
let rows = [], errs = []
for (const f of readdirSync(D).filter(f => /^it-B-rows-s.*\.json$/.test(f))) {
  const j = JSON.parse(readFileSync(D + '/' + f, 'utf8'))
  rows.push(...j.rows); errs.push(...j.errs)
}
for (const r of rows) r.pics = [...new Set(r.pics || [])].filter(x => existsSync(PIC + x))
rows.sort((a, b) => (+a.n - +b.n) || (a.size < b.size ? -1 : 1))
writeFileSync(OUTD + '/it-B.json', JSON.stringify({ letter: 'B', rows, errors: [...new Set(errs)] }, null, 1))
const cnt = v => rows.filter(r => r.verdict === v).length
const esc = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
let md = `# Walker B — an input's own title, publication scenarios (28–35, 37–43)\n\nServer: http://localhost:4232/ (frozen copy). Pictures: docs/img/handpass/2026-10-09-input-title-check/B/. Rows: ${rows.length} — PASS ${cnt('PASS')}, FAIL ${cnt('FAIL')}, NOT WALKED ${cnt('NOT WALKED')}.\n\nReading guide: "pend" is the day's pending chip on the week; "nys" is the "Not yet signed" mark (the working sign-offs having fallen); "signedLn" is the issued face's SIGNED line; "togo" is the changes window's "To go out" tab; "view" is View-only Sched. [A] = Save, Undo, Redo, reload; [B] = Save, Undo, reload.\n\n| # | size | role | verdict | what the screen said | pictures |\n|---|---|---|---|---|---|\n`
for (const r of rows) md += `| ${r.n} | ${r.size} | ${r.role} | ${r.verdict} | ${esc(r.said)} | ${(r.pics || []).join(', ')} |\n`
md += `
## Extras — seen while walking, not part of a scenario's expected result
- Sign-offs: on a published day the working sign-off boxes are already empty right after the publish ("4 to sign"). The sign-offs FALLING after a change shows as the orange "Not yet signed" mark beside the version tag (rows call it "nys"). The issued face's own "SIGNED ORIG/AL1 ..." line stays as published in every case.
- 40: the Take off toast reads only "Accept undone" — it names neither "Sports day" nor "Event". The Accept toast reads "Ranger's Sports day added to the ground programme". (s40-desk-1takeoff-togo.png)
- 41: after the dormant request is accepted again, To go out reads "Ranger · Games afternoon — Sports day → Games afternoon" for a row that was never on the issued face (reads like a rename, not an add). Pending count is 1 as expected. (s41-desk-A-2accepted-togo.png)
- 43: after the input is retitled, the working row's hand-typed name ("Board wording") is replaced by the new title in capitals (GAMES AFTERNOON); the issued face keeps "Board wording". (s43-desk-4retitled-edit.png)
- 37: a shared Event of three people shows three Ground Programme rows, a "3 pending" chip and three lines in To go out, one per person (D661 is out of scope in the brief, but the scenario expected To go out to group them as one item). (s37-desk-A-3retitled-togo.png)
- Every July-dated input shows the LATE mark (the app's today is 9 Oct 26) — expected, not a title fault.
- Undo's tooltip after a title change reads "Undo — a personal input".

## Console / page errors seen
${errs.length ? [...new Set(errs)].map(e => '- ' + e).join('\n') : 'None.'}\n`
writeFileSync(OUTD + '/it-B.md', md)
console.log(rows.length, 'rows', cnt('PASS'), 'PASS', cnt('FAIL'), 'FAIL', cnt('NOT WALKED'), 'NOT WALKED')
