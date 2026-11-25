// sah-w8-table — READ ONLY: builds walker w8's report table from the final runs' results files (each scenario taken from
// the run named for it below; earlier attempts are left out). Writes D:/raptor-work/c152-walk/w8/table.md.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
console.log('sah-w8-table v1')
const R = 'D:/raptor-work/c152-walk/w8/'
const SRC = [
  ['run2/results-w8-d1.json', ['s1', 's2', 's3', 's15', 's19', 's23'], 'run2'],
  ['run2/results-w8-d2.json', ['s5', 's17m', 's20', 's21', 'pu'], 'run2'],
  ['run3/results-w8-d3.json', ['s4r', 's4s', 's17'], 'run3'],
  ['run2p/results-w8-p1.json', ['s1', 's2', 's3', 's15', 's19', 's23'], 'run2p'],
  ['run2p/results-w8-p2.json', ['s17', 's17m', 's20', 's21', 'pu'], 'run2p'],
  ['run3p/results-w8-p3.json', ['s4r', 's4s', 's5'], 'run3p'],
]
const ORDER = ['s1', 's2', 's3', 's4r', 's4s', 's5', 's15', 's17', 's17m', 's19', 's20', 's21', 's23', 'pu']
const rows = []
for (const [f, scns, run] of SRC) {
  if (!existsSync(R + f)) { console.log('missing', f); continue }
  for (const r of JSON.parse(readFileSync(R + f, 'utf8'))) if (scns.includes(r.scn) && !['today', 'world'].includes(r.id)) rows.push({ ...r, run })
}
rows.sort((a, b) => ORDER.indexOf(a.scn) - ORDER.indexOf(b.scn) || (a.size < b.size ? -1 : a.size > b.size ? 1 : 0))
/* two rows re-judged by hand (the report says why): the phone's short month, and a bar that is pulled, not tapped */
for (const r of rows) {
  if (r.scn === 's15' && r.size === 'phone' && r.id === 'S15-03') { r.ok = true; r.note += ' — *re-judged PASS: the phone writes the month "Jul 2026" (D705); the script wanted "July"*' }
  if (r.scn === 'pu' && r.size === 'phone' && r.id === 'PU-06') { r.ok = 'NW'; r.note += ' — *re-judged NOT WALKED: D648 pulls the bar (a finger drag WebKit cannot play); the script tapped it*' }
}
const verdict = r => r.ok === true ? 'PASS' : r.ok === false ? 'FAIL' : r.ok === 'REC' ? 'RECORDED' : r.ok === 'NW' ? 'NOT WALKED' : 'NOTE'
const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
let md = '| Scn | Size | Step | What was done / expected | What the screen said (read) | Result | Pictures (folder) |\n|---|---|---|---|---|---|---|\n'
const count = {}
for (const r of rows) {
  const v = verdict(r)
  count[v] = (count[v] || 0) + 1
  md += `| ${r.scn} | ${r.size} | ${r.id} | ${esc(r.what)} | ${esc(r.note).slice(0, 700)} | ${v} | ${esc(r.pics || '')} (${r.run}) |\n`
}
const pics = rows.reduce((n, r) => n + (r.pics ? String(r.pics).split(',').filter(x => x.trim()).length : 0), 0)
writeFileSync(R + 'table.md', md)
/* appended once to the report under its last heading (the head is written by hand above it) */
const REP = new URL('../../docs/handpass/parts/sud/w8-report.md', import.meta.url)
const head = readFileSync(REP, 'utf8')
if (head.trimEnd().endsWith('sah-w8-table.mjs`)')) writeFileSync(REP, head.trimEnd() + '\n\n' + md)
else console.log('the report does not end at its table heading — not appended')
console.log(JSON.stringify({ rows: rows.length, count, pics }))
