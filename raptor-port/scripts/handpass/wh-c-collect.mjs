/* walker C — reads the parts file and prints one line per step: part · id · verdict · pictures (for the report). */
import { readFileSync } from 'node:fs'
const OUT = process.env.HP_OUT || 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/wh-c.json'
const all = JSON.parse(readFileSync(OUT, 'utf8')).parts
let pass = 0, fail = 0, other = 0
for (const [name, part] of Object.entries(all).sort()) {
  const t = part.table || []
  const p = t.filter(r => r.verdict === 'PASS').length, f = t.filter(r => r.verdict === 'FAIL').length
  pass += p; fail += f; other += t.length - p - f
  console.log(`\n## ${name}  (${p} PASS, ${f} FAIL, ${t.length - p - f} other) errors: ${JSON.stringify(part.errors || [])}`)
  for (const r of t) console.log(`  ${r.verdict.padEnd(8)} ${r.id}  [${(r.pics || []).join(', ')}]${r.verdict === 'PASS' ? '' : '\n      ' + String(r.saw).slice(0, 500)}`)
}
console.log(`\nTOTAL ${pass} PASS · ${fail} FAIL · ${other} other`)
