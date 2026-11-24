// w7: counts of a results file (PASS / FAIL / RECORDED / NOT WALKED / notes), per scenario and size, and the pictures named.
// Run: node scripts/handpass/sud-w7-sum.mjs <results.json> [...]
import { readFileSync } from 'node:fs'
console.log('sud-w7-sum v1')
for (const f of process.argv.slice(2)) {
  const r = JSON.parse(readFileSync(f, 'utf8'))
  const k = x => x.ok === true ? 'PASS' : x.ok === false ? 'FAIL' : x.ok === 'REC' ? 'REC' : x.ok === 'NW' ? 'NW' : 'NOTE'
  const by = {}
  let pics = 0
  for (const x of r) { const key = x.scn + '/' + x.size; by[key] ||= { PASS: 0, FAIL: 0, REC: 0, NW: 0, NOTE: 0 }; by[key][k(x)]++; if (x.pics) pics += String(x.pics).split(',').filter(s => s.trim()).length }
  const tot = { PASS: 0, FAIL: 0, REC: 0, NW: 0, NOTE: 0 }
  for (const [key, v] of Object.entries(by)) { console.log(f.split('/').pop(), key, JSON.stringify(v)); for (const t in v) tot[t] += v[t] }
  console.log('TOTAL', JSON.stringify(tot), 'pictures cited', pics)
}
