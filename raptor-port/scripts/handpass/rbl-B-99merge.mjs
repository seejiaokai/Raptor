/* merge the final per-run part files into rbl-B.json and print the report table (my own files only) */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
const dir = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/'
const finals = ['s03a-dk', 's03b-dk', 's03a-ph', 's03b-ph', 'h02-dk', 'h02-ph', 'inda', 'indb', 's12-hf-dk', 's12-bf-dk', 's12-pub-dk', 's12-hf-ph', 's23p', 's23v', 's27', 's02', 'ord-logic', 'ord-pub', 'ord-plan']
const out = { merged: new Date().toISOString(), base: 'http://localhost:4175', parts: {} }
for (const f of finals) {
  const p = dir + `rbl-B-${f}.json`
  if (!existsSync(p)) { console.log('MISSING', p); continue }
  const j = JSON.parse(readFileSync(p, 'utf8'))
  for (const [k, v] of Object.entries(j.parts)) out.parts[k + '#' + f] = v
}
writeFileSync(dir + 'rbl-B.json', JSON.stringify(out, null, 1))
const rows = []
for (const [k, v] of Object.entries(out.parts)) for (const r of v.table) rows.push({ part: k, ...r })
const cnt = {}
for (const r of rows) cnt[r.verdict.split(' ')[0]] = (cnt[r.verdict.split(' ')[0]] || 0) + 1
console.log(JSON.stringify(cnt), rows.length)
for (const r of rows) if (!/err$/.test(r.id)) console.log(`${r.verdict.padEnd(9)} ${r.id}`)
for (const r of rows) if (/err$/.test(r.id) && r.saw !== 'none') console.log('ERRORS', r.id, r.saw)
