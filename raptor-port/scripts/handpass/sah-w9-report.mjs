// w9's report table: reads the result files of the final runs and prints one markdown row per step and size.
// Usage (from raptor-port/): node scripts/handpass/sah-w9-report.mjs <results.json> ... > <table.md>
import { readFileSync } from 'node:fs'
console.error('sah-w9-report v2')
/* an argument "<file>!s9" leaves that file's scenario s9 out (an attempt not cited) */
const rows = process.argv.slice(2).flatMap(a => { const [f, skip] = a.split('!'); return JSON.parse(readFileSync(f, 'utf8')).filter(r => !skip || r.scn !== skip) })
const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/\[2m|\[22m/g, '')
const mark = ok => ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'REC' ? 'RECORDED' : ok === 'NW' ? 'NOT WALKED' : 'NOTE'
const n = { PASS: 0, FAIL: 0, RECORDED: 0, 'NOT WALKED': 0, NOTE: 0 }
const pics = new Set()
console.log('| Scen. | Size | Step | What was done / expected | What the screen said (read) | Result | Picture(s) |')
console.log('|---|---|---|---|---|---|---|')
for (const r of rows) {
  const m = mark(r.ok); n[m]++
  for (const p of String(r.pics || '').split(/,\s*/).filter(Boolean)) pics.add(p)
  console.log(`| ${r.scn} | ${r.size} | ${esc(r.id)} | ${esc(r.what)} | ${esc(String(r.note || '').slice(0, 420))} | **${m}** | ${esc(r.pics || '')} |`)
}
console.log(`\nCounts: ${rows.length} rows — ${Object.entries(n).map(([k, v]) => k + ' ' + v).join(', ')}; ${pics.size} distinct pictures named.`)
console.log('\nFAILS:')
for (const r of rows.filter(r => r.ok === false)) console.log(`- ${r.scn}/${r.size} ${r.id}: ${esc(r.what)} — ${esc(String(r.note || '').slice(0, 400))} [${r.pics || ''}]`)
