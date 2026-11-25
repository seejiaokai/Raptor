// sah-r1-table — builds re-walker r1's table from the run's per-scenario results files and prints it with the counts.
// Run from raptor-port/:  R1_RUN=run1 node scripts/handpass/sah-r1-table.mjs > <file>
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
console.error('sah-r1-table v1')
const DIR = 'D:/raptor-work/c152-walk/r1/' + (process.env.R1_RUN || 'run1')
const files = ['w81-desktop', 'w81-phone-chromium', 'w81-phone', 'w82-desktop', 'w82-phone', 'w101-desktop', 'w101-phone']
const rows = []
for (const f of files) { const p = path.join(DIR, `results-${f}.json`); if (existsSync(p)) rows.push(...JSON.parse(readFileSync(p, 'utf8'))) }
const V = ok => ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'REC' ? 'RECORDED' : ok === 'NW' ? 'NOT WALKED' : 'NOTE'
const esc = s => String(s || '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const c = {}
let pics = 0
console.log('| scenario | size | step | what was done / expected | what the screen said | verdict | pictures |')
console.log('|---|---|---|---|---|---|---|')
for (const r of rows) {
  const v = V(r.ok); c[v] = (c[v] || 0) + 1
  const n = r.pics ? String(r.pics).split(',').filter(s => s.trim()).length : 0; pics += n
  console.log(`| ${r.scn} | ${r.size} | ${r.id} | ${esc(r.what)} | ${esc(r.note).slice(0, 900)} | ${v} | ${esc(r.pics)} |`)
}
console.log(`\nCOUNTS ${rows.length} rows · ${Object.entries(c).map(([k, n]) => k + ' ' + n).join(' · ')} · ${pics} pictures named`)
