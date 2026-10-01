/* p7 walker C — gathers the walk's parts (p7-c.json `parts`) into ONE final table, the latest run of each scenario
   winning, and checks every picture a row names is on disk. Writes `final` back into the same file. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const OUT = process.env.HP_OUT, SHOTS = process.env.HP_SHOTS
const all = JSON.parse(readFileSync(OUT, 'utf8'))
/* later parts replace earlier rows of the same id */
const ORDER = ['doors-desktop', 'doors-phone', 'namebox-N1', 'namebox-N2', 'namebox-X1', 'previews', 'lists-all', 'lists-quals', 'lists-counters', 'warnhide', 'warnhide-2', 'misc-all', 'misc-outback']
const byId = new Map(); const errors = []
for (const name of ORDER) {
  const part = all.parts[name]; if (!part) { console.log('MISSING PART', name); continue }
  for (const r of part.table) byId.set(r.id, { ...r, part: name, at: part.at })
  for (const e of part.errors || []) errors.push(name + ': ' + e)
}
const final = [...byId.values()]
const missing = []
for (const r of final) for (const pic of r.pics || []) if (!existsSync(`${SHOTS}/${pic}`)) missing.push(`${r.id}: ${pic}`)
all.final = { at: new Date().toISOString(), rows: final.length, verdicts: final.reduce((a, r) => { const k = r.verdict.split(' ')[0]; a[k] = (a[k] || 0) + 1; return a }, {}), errors, missingPictures: missing, table: final }
writeFileSync(OUT, JSON.stringify(all, null, 1))
console.log(`${final.length} rows`, JSON.stringify(all.final.verdicts), 'errors', errors.length, 'missing pictures', missing.length, missing.slice(0, 8))
for (const r of final) console.log(`${r.verdict.slice(0, 22).padEnd(22)} ${r.id.padEnd(34)} ${(r.pics || []).length} pics`)
