import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
const P = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/'
const out = { letter: 'N', build: 'dist-fix @ http://localhost:4232', rows: [], parts: {} }
for (const f of ['stk2-N-K.json', 'stk2-N-R.json']) { if (existsSync(P + f)) { const j = JSON.parse(readFileSync(P + f, 'utf8')); out.rows.push(...(j.rows || [])) } }
if (existsSync(P + 'stk2-N-F.json')) { const j = JSON.parse(readFileSync(P + 'stk2-N-F.json', 'utf8')); out.parts = j.parts || {} }
writeFileSync(P + 'stk2-N.json', JSON.stringify(out, null, 1))
if (process.argv[2] === 'show') {
  for (const r of out.rows) console.log(`### ${r.id}/${r.part} [${r.verdict}] pics:${(r.pics || []).join(',')}\n  did: ${String(r.did).slice(0, 200)}\n  saw: ${String(r.saw)}\n`)
}
if (process.argv[2] === 'fshow') {
  for (const [k, v] of Object.entries(out.parts)) for (const r of v.table) console.log(`### ${r.id} [${r.verdict}] pics:${(r.pics || []).join(',')}\n  saw: ${String(r.saw).slice(0, 1500)}\n`)
}
console.log('rows', out.rows.length, 'parts', Object.keys(out.parts))
