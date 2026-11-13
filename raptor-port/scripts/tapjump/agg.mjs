import { readdirSync, readFileSync, existsSync } from 'node:fs'
const S = process.argv[2]
const groups = new Map()
let measured = 0
for (const d of readdirSync(S)) {
  const f = `${S}/${d}/findings.jsonl`
  if (!existsSync(f)) continue
  if (existsSync(`${S}/${d}/summary.json`)) { const s = JSON.parse(readFileSync(`${S}/${d}/summary.json`, 'utf8')); measured += s.measured; console.log('SUM', d, s.measured, s.findings, 'left', s.left) } else console.log('SUM', d, 'no summary')
  for (const l of readFileSync(f, 'utf8').split('\n').filter(Boolean)) {
    const j = JSON.parse(l)
    const k = `${j.kind}|${j.sig}|${j.path.join(' > ')}`
    const g = groups.get(k) ?? { n: 0, where: [], j }
    g.n++; g.where.push(`${d}/${j.id}`); groups.set(k, g)
  }
}
console.log('measured', measured, 'groups', groups.size)
const rows = [...groups.values()].sort((a, b) => a.j.kind.localeCompare(b.j.kind) || a.j.sig.localeCompare(b.j.sig))
for (const g of rows) console.log(`${g.j.kind} d=(${g.j.dx},${g.j.dy}) dwh=(${g.j.dw},${g.j.dh}) [${g.j.sig}] "${g.j.txt.slice(0, 28)}" path=${g.j.path.join(' > ').slice(0, 90)} under=${g.j.under.slice(0, 50)} @ ${g.where.slice(0, 3).join(', ')}${g.where.length > 3 ? ` +${g.where.length - 3}` : ''}`)
