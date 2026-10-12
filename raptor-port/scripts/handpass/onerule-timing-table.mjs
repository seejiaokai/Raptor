/* The middle figure of several runs of onerule-timing.mjs, two builds side by side.
     node scripts/handpass/onerule-timing-table.mjs <folder> [beforePrefix=before] [afterPrefix=after]
   Reads <folder>/<prefix>-<n>.json. For each act: the middle of the runs' middles, and the spread of the runs — so a
   difference smaller than the spread of one unchanged build is read as noise, which it is. */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const [dir, bp = 'before', ap = 'after'] = process.argv.slice(2)
if (!dir) { console.error('usage: onerule-timing-table.mjs <folder> [before] [after]'); process.exit(2) }
const load = p => readdirSync(dir).filter(f => f.startsWith(p + '-') && f.endsWith('.json')).sort().map(f => JSON.parse(readFileSync(join(dir, f), 'utf8')))
const B = load(bp), A = load(ap)
const mid = xs => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)] }
const fig = (runs, world, act) => { const xs = runs.map(r => r[world].out[act].mid); return { m: mid(xs), lo: Math.min(...xs), hi: Math.max(...xs) } }
const f1 = n => (n >= 100 ? n.toFixed(0) : n.toFixed(1))
console.log(`${B.length} runs before, ${A.length} after — ${B[0].cpu}x slowdown, a phone's width`)
for (const world of ['demo', 'big']) {
  console.log(`\n${world === 'demo' ? `the demo as it boots (${B[0].demo.inputs} inputs)` : `with 250 more filed (${B[0].big.inputs} inputs)`}`)
  console.log('act'.padEnd(46) + 'before (ms)'.padStart(22) + 'after (ms)'.padStart(22) + '   after ÷ before')
  for (const act of Object.keys(B[0][world].out)) {
    const b = fig(B, world, act), a = fig(A, world, act)
    console.log(act.padEnd(46) + `${f1(b.m)}  [${f1(b.lo)}–${f1(b.hi)}]`.padStart(22) + `${f1(a.m)}  [${f1(a.lo)}–${f1(a.hi)}]`.padStart(22) + `   ${(a.m / b.m).toFixed(2)}`)
  }
}
