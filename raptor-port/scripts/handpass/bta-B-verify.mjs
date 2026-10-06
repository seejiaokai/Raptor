/* lists the parts of bta-B.json, the pictures they reference that are missing, and the picture files nothing references */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
const out = process.env.HP_OUT, dir = process.env.HP_SHOTS
const j = JSON.parse(readFileSync(out, 'utf8'))
const refd = new Set(); const missing = []
for (const [k, v] of Object.entries(j.parts)) {
  let n = 0
  for (const r of v.table) for (const p of (r.pics || [])) { n++; refd.add(p); if (!existsSync(`${dir}/${p}`)) missing.push(`${k}: ${r.id} → ${p}`) }
  console.log(`${k}: ${v.table.length} rows, ${v.table.filter(r => r.verdict === 'PASS').length} PASS, ${v.table.filter(r => r.verdict === 'FAIL').length} FAIL, ${n} pictures referenced (${v.phone ? 'phone' : 'desktop'}, ${v.at})`)
}
console.log('MISSING', missing)
const files = readdirSync(dir)
const orphans = files.filter(f => !refd.has(f))
console.log('files', files.length, 'referenced', refd.size, 'unreferenced', orphans.length)
console.log(orphans.join('\n'))
if (process.argv[2] === 'drop-part') { for (const k of process.argv.slice(3)) delete j.parts[k]; writeFileSync(out, JSON.stringify(j, null, 1)); console.log('dropped', process.argv.slice(3)) }
