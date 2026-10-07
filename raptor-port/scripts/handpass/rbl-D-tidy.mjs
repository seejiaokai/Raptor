/* walker D: drop picture names from the results file that no longer exist in the folder, and list pictures nobody names */
import fs from 'node:fs'
const dir = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-06-rest-blank-line/D'
const out = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/rbl-D.json'
const have = new Set(fs.readdirSync(dir))
const j = JSON.parse(fs.readFileSync(out, 'utf8'))
const named = new Set()
let dropped = 0
for (const [k, part] of Object.entries(j.parts)) {
  for (const r of part.table) {
    const keep = (r.pics || []).filter(f => have.has(f))
    dropped += (r.pics || []).length - keep.length
    r.pics = keep
    keep.forEach(f => named.add(f))
  }
}
fs.writeFileSync(out, JSON.stringify(j, null, 1))
console.log('dropped names', dropped, '| pictures in folder', have.size, '| named', named.size)
console.log('NOT NAMED:', [...have].filter(f => !named.has(f)).join(', ') || 'none')
console.log('parts:', Object.keys(j.parts).join(', '))
