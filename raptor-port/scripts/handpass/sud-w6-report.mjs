// w6: the step table of the report, built from the final run's results files (docs/img/handpass/2026-11-23-sans-unfiled/w6/<run>/results-*.json)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const RUN = process.env.W6_RUN || 'run2'
const DIR = process.env.W6_JSON || 'D:/raptor-work/c147-walk/w6/json-' + RUN
console.log('sud-w6-report v1', DIR)
const rows = []
for (const f of readdirSync(DIR).filter(f => /^results-.*\.json$/.test(f)).sort()) for (const r of JSON.parse(readFileSync(path.join(DIR, f), 'utf8'))) rows.push(r)
/* each process saved its whole list after every scenario: keep the last copy of each (scenario, size, step) */
const seen = new Map()
for (const r of rows) seen.set(`${r.scn}|${r.size}|${r.id}`, r)
const order = ['build', 'a5', 'a6', 'a7', 'a8', 'a9', 'a11um', 'a11rm', 'a11uu', 'a11ru', 'a12s', 'a12h', 'a12x', 'a14po', 'a14pn', 'a14uo', 'a14rn', 'a14rd', 'a15', 'a19u', 'a19r', 'a19d', 'a21', 'a22', 'a23j', 'a23d', 'wp']
const list = [...seen.values()].sort((a, b) => (order.indexOf(a.scn) - order.indexOf(b.scn)) || (a.size < b.size ? -1 : a.size > b.size ? 1 : 0))
const word = ok => ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'REC' ? 'RECORDED' : ok === 'NW' ? 'NOT WALKED' : 'NOTE'
const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
let md = '| Scenario | Size | Step | What was done | What the screen said | Result | Pictures |\n|---|---|---|---|---|---|---|\n'
const count = { PASS: 0, FAIL: 0, RECORDED: 0, 'NOT WALKED': 0, NOTE: 0 }
const pics = new Set()
for (const r of list) {
  const w = word(r.ok); count[w]++
  for (const p of String(r.pics || '').split(/,\s*/).filter(Boolean)) pics.add(p)
  md += `| ${r.scn} | ${r.size} | ${r.id} | ${esc(r.what)} | ${esc(String(r.note || '').slice(0, 520))} | ${w} | ${esc(r.pics || '')} |\n`
}
const fails = list.filter(r => r.ok === false).map(r => `- ${r.scn} / ${r.size} / ${r.id} — ${r.what} :: ${String(r.note || '').slice(0, 400)}`).join('\n')
writeFileSync(path.join(DIR, 'table.md'), md)
writeFileSync(path.join(DIR, 'fails.md'), fails || 'none')
console.log(JSON.stringify({ steps: list.length, ...count, pictures: pics.size }))
