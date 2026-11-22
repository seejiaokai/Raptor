// asp-w2 tally: counts the FINAL run of each scenario from the results files (reads only).
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { OUT } from './asp-w2-lib.mjs'
console.log('asp-w2-tally v1')
/* which results file holds the final run of each scenario */
const FINAL = { s22: ['results-s22d.json', 'results-s22p_s28d.json'], s28: ['results-s22p_s28d.json', 'results-s28p_s23d_s23p_s8d_s8p.json'], s8: ['results-s28p_s23d_s23p_s8d_s8p.json'], s12: ['results-s12d_s12p_s13d_s13p_s3d_s3p.json'], s13: ['results-s13d_s13p.json'], s23: ['results-s3d_s3p_s23d_s23p.json'], s3: ['results-s3d_s3p.json'], pu: ['results-pu-pud.json', 'results-pu-pup.json'] }
const tot = { steps: 0, PASS: 0, FAIL: 0, REC: 0, NW: 0, NOTE: 0 }
for (const [scn, files] of Object.entries(FINAL)) {
  const rows = files.flatMap(f => JSON.parse(readFileSync(path.join(OUT, f), 'utf8'))).filter(r => r.scn === scn && r.id !== 'today' && r.id !== 'errors')
  const seen = new Set(); const uniq = rows.filter(r => { const k = r.size + r.id; if (seen.has(k)) return false; seen.add(k); return true })
  const c = { steps: uniq.length, PASS: 0, FAIL: 0, REC: 0, NW: 0, NOTE: 0 }
  for (const r of uniq) c[r.ok === true ? 'PASS' : r.ok === false ? 'FAIL' : r.ok === 'REC' ? 'REC' : r.ok === 'NW' ? 'NW' : 'NOTE']++
  for (const k of Object.keys(tot)) tot[k] += c[k]
  const errs = files.flatMap(f => JSON.parse(readFileSync(path.join(OUT, f), 'utf8'))).filter(r => r.scn === scn && r.id === 'errors').map(r => r.size + ':' + (r.ok ? 'none' : r.note))
  console.log(scn, JSON.stringify(c), 'errors', errs.join(' '))
}
console.log('TOTAL', JSON.stringify(tot))
const pics = readdirSync(OUT).filter(f => f.endsWith('.png')).length, taps = readdirSync(path.join(OUT, 'taps')).filter(f => f.endsWith('.png')).length
console.log('pictures', pics, 'taps', taps)
