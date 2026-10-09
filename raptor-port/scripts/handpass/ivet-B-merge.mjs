// merges Walker B's partial result files into docs/handpass/parts/ivet-B.json and ivet-B.md
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
const DIR = 'docs/img/handpass/2026-10-10-inputs-vet-check/B'
const all = [], errs = new Set()
for (const f of readdirSync(DIR).filter(f => f.startsWith('_rows-'))) { const j = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')); all.push(...j.rows); j.errs.forEach(e => errs.add(e)) }
const num = n => parseFloat(String(n)) + (String(n).includes('-') ? 0.1 : 0)
all.sort((a, b) => num(a.n) - num(b.n))
const opened = {
  20: ['s20-OML-docquestion.png'], 21: ['s21-r1-attached.png'], 23: ['s23-summary.png', 's23-confirmed-list.png'], 25: ['s25-clash-chosen.png'], 28: ['s28-9-after-heading-press.png'], 29: ['s29-second-save.png'],
  30: ['s30-a-redo.png'], 56: ['s56-week-zoom.png'], 57: ['s57-month.png'], 58: ['s58-lifted.png'], 63: ['s63-four.png'], 67: ['s67-ranger-switch-off.png'],
}
const rows = all.map(r => ({ scenario: r.n, size: r.size, role: r.role, status: r.status, said: r.said, pictures: r.pics, opened: opened[r.n] || [], note: r.note || '' }))
const pics = readdirSync(DIR).filter(f => f.endsWith('.png')).length
const counts = rows.reduce((o, r) => { o[r.status] = (o[r.status] || 0) + 1; return o }, {})
mkdirSync('docs/handpass/parts', { recursive: true })
writeFileSync('docs/handpass/parts/ivet-B.json', JSON.stringify({ walker: 'B', server: 'http://localhost:4232/', counts, rows, errors: [...errs], pictures: pics }, null, 1))
const one = r => {
  const bad = r.said.filter(s => /^(FAIL|NOT RUN)/.test(s)).map(s => s.slice(0, 200))
  const first = r.said.filter(s => s.startsWith('ok')).slice(0, 2).map(s => s.slice(4, 130))
  return `| ${r.scenario} | ${r.size} | ${r.role} | ${r.status} | ${(bad.length ? bad.join(' / ') : first.join(' / ') + (r.said.length > 2 ? ` (+${r.said.length - 2} more checks, all as expected)` : '')).replace(/\|/g, '/')} | ${r.pictures.slice(0, 4).join(', ')}${r.pictures.length > 4 ? ' …' : ''} |`
}
const md = `# Walker B — the design vet's walk — 10 Oct 26

Server: http://localhost:4232/ (frozen build). Scenarios walked: ${rows.length} rows (scenarios 20, 21, 23, 25, 28–31, 53–63, 67–69; 58, 59 and 60 have a second row for the other size). Counts: ${Object.entries(counts).map(([k, v]) => k + ' ' + v).join(', ')}.
Sizes and roles follow the brief's rule (odd = phone by touch, even = desktop; admin Saber when the number mod 4 is 0 or 1, member Ranger when 2 or 3), except where a scenario names its own (53, 54, 55 Saber; 54 names 390 px; 67 and 68 Saber then Ranger; 21 phone admin). The Medical tab shows no entry for Saber's own medical input (see extras), so scenario 21's document was also opened from a Ranger entry filed by Saber.

| # | size | role | result | what the screen said | pictures (all in docs/img/handpass/2026-10-10-inputs-vet-check/B/) |
|---|---|---|---|---|---|
${rows.map(one).join('\n')}

## Detail of every check
${rows.map(r => `### ${r.scenario} — ${r.status} — ${r.size} — ${r.role}${r.note ? ' — ' + r.note : ''}\n${r.said.map(s => '- ' + s).join('\n')}`).join('\n\n')}

## Errors seen (console, page, 4xx)
${errs.size ? [...errs].map(e => '- ' + e).join('\n') : 'None. No console error, page error or failed request in any run.'}

## Anything that looked wrong and was not in a scenario
- **Only the new row is lit after Redo of a two-record filing** (picture s30-a-redo.png, opened): after Undo then Redo of the upchit filing the screen said "Redid: 2 inputs", the upchit row is lit, but the downchit row Redo shortened to 28 Jul is not lit.
- **Lights come back after a filter is reset** (scenario 28, picture s28-7-after-reset-lights.png): three rows saved a few seconds earlier, which had been dropped out of view by a filter being touched, were lit again the moment the filters were reset (still inside their six seconds).
- **A blue translucent block over the open window on a phone** (s63-four.png and s67-ranger-switch-off.png, both opened; both as the member Ranger, both within a few seconds of a save or the window opening): a blue box lies over the window's people list / Type box, at the place of the list card or "+ Input" button behind it. Not reproduced on a plain run (s-lit-behind-window-A.png, opened, is clean) — may be a transition caught in the picture.
- **The passing note stays over the question windows and over the window's Cancel button** on a phone (the stale "Input added" in s20-OML-docquestion.png, s21-*, s23-summary.png, s25-clash-chosen.png; "Input added for 4 people" over Cancel in s63-four.png).
- **On a phone the window covers the list's "+ Input"**; a finger can drag the window down by its title to reach it (scenario 31), and the window keeps that dragged-down place the next time it opens (it then has to be dragged back up to reach its dates).
- **A member's Calendar and List are filtered to himself by default** ("Ranger" with "Clear filters"): the demo's ALL event on 22 Jul does not show in his month or day (scenario 59 crowding test; 7 records on that day, 6 shown).
- **The Medical tab did not list Saber's own ATT C** filed with a document for 13–14 Jul (count stayed 2 / 1); Ranger's did appear. Not checked further (Saber may not be aircrew).
- **Scenario text differs from the ruling:** scenarios 1 and 30 say a fresh window starts on Duty; the brief and the screen say "Training" — the screen matches the brief. The fresh window's Title box is pre-filled with the kind's name ("Training"), which is not carried-over text.
- **Scenario 28's heading rule:** see the FAIL — pressing a column heading does not release the light on a row that is still visible (picture s28-9-after-heading-press.png, opened; the lit row has moved out of the first screen by the sort).

## Not walked
- 69: the sign-in card offers only username, password and "Sign in" — no guest route (s69-card.png). Nothing was created or tried.
- 25: only ONE resolution was walked (as told): "ATT B replaces" with the leftover default "Remove those days" (ATT C 31 Jul removed); "Keep them" was not walked.

## Pictures
${pics} pictures saved in the folder (including a few probe pictures); ${Object.values(opened).flat().length + 4} opened and looked at, among them one behind every FAIL, the medical scenarios (20, 21, 23, 25), the member scenarios (30, 58, 63, 67), and 56 and 57.
`
writeFileSync('docs/handpass/parts/ivet-B.md', md)
console.log(counts, 'pictures', pics)
