/* phase 6 check — lay this branch's screen facts beside the build before phase 6's (p6-lib.mjs): every fact that differs.
   Usage: node p6-compare.mjs <p6-facts.json> <base-facts.json>. Request ids are minted per run and differ by nature, so
   they are folded to "<iid>" before comparing; the facts that exist only on one side (phase 6's new fields) are listed
   apart, not as differences. */
import { readFileSync } from 'node:fs'
const [a, b] = process.argv.slice(2).map(f => JSON.parse(readFileSync(f, 'utf8')).facts)
const norm = v => JSON.stringify(v).replace(/imrldi1s0[a-z0-9]{6}/g, '<iid>').replace(/mrldi1s0[a-z0-9]{4}\.\d+/g, '<line>').replace(/rmrldi1s0[a-z0-9]{6}/g, '<rid>')
const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]
let same = 0
for (const k of keys) {
  if (!(k in a)) { console.log(`ONLY BASE  ${k} = ${norm(b[k]).slice(0, 300)}`); continue }
  if (!(k in b)) { console.log(`ONLY P6    ${k} = ${norm(a[k]).slice(0, 300)}`); continue }
  if (norm(a[k]) === norm(b[k])) { same++; continue }
  console.log(`DIFF  ${k}\n   p6:   ${norm(a[k]).slice(0, 400)}\n   base: ${norm(b[k]).slice(0, 400)}`)
}
console.log(`\n${same} of ${keys.length} facts the same`)
