/* Compare two folders written by onerule-surfaces.mjs, record by record, byte for byte.
     node scripts/handpass/onerule-compare.mjs <folder A> <folder B>
   Pictures are not compared (a picture is for a person to look at); every other file must be identical. Exits 1 on any
   difference, printing where the first one is in each file that differs. */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const [a, b] = process.argv.slice(2)
/* records that are EXPECTED to differ between two builds — named on the command line, shown, and never a failure:
     --apart=-events-allavail.json */
const APART = process.argv.slice(2).filter(x => x.startsWith('--apart=')).map(x => x.slice(8))
const apart = f => APART.some(s => f.endsWith(s))
if (!a || !b) { console.error('usage: onerule-compare.mjs <folder A> <folder B>'); process.exit(2) }
const names = d => readdirSync(d).filter(f => !f.endsWith('.png')).sort()
const A = names(a), B = names(b)
let bad = 0, bytes = 0, set = 0
for (const f of [...new Set([...A, ...B])].sort()) {
  if (!A.includes(f) || !B.includes(f)) { console.log(`ONLY IN ${A.includes(f) ? 'A' : 'B'}: ${f}`); bad++; continue }
  const x = readFileSync(join(a, f), 'utf8'), y = readFileSync(join(b, f), 'utf8')
  bytes += x.length
  if (x === y) continue
  if (apart(f)) { set++; console.log(`APART (expected to differ): ${f} — A holds ${JSON.parse(x).length} entries, B holds ${JSON.parse(y).length}`); continue }
  bad++
  let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++
  console.log(`DIFFERS: ${f} at character ${i} (A ${x.length}, B ${y.length})`)
  console.log('   A: …' + JSON.stringify(x.slice(Math.max(0, i - 120), i + 160)))
  console.log('   B: …' + JSON.stringify(y.slice(Math.max(0, i - 120), i + 160)))
}
console.log(bad ? `${bad} of ${new Set([...A, ...B]).size} records differ` : `IDENTICAL: ${A.length - set} records, ${bytes} characters${set ? ` — and ${set} set apart, shown above` : ''}; ${readdirSync(a).filter(f => f.endsWith('.png')).length} pictures beside them`)
process.exit(bad ? 1 : 0)
