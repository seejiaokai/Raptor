import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
const dir = 'C:/Users/User/projects/Raptor/.claude/worktrees/tracker-palette-prompt-a0c90f/raptor-port/docs/handpass/parts/'
const files = readdirSync(dir).filter(f => /^ows-C-pairs-.*\.json$/.test(f))
const rows = []
for (const f of files) { const j = JSON.parse(readFileSync(dir + f, 'utf8')); for (const [k, v] of Object.entries(j.parts || {})) for (const r of v.table) rows.push(r) }
rows.sort((a, b) => a.id.localeCompare(b.id))
const out = []
for (const r of rows) {
  const checks = String(r.saw).split(' · ')
  const bad = checks.filter(c => c.startsWith('✗'))
  const rec = (String(r.saw).match(/\(record\) what the day said[^]*$/) || [''])[0]
  out.push(`${r.verdict} ${r.id} | ${(r.did || '').slice(0, 150)}\n   BAD: ${bad.join(' || ').slice(0, 600)}\n   REC: ${rec.slice(0, 900)}\n   pics: ${(r.pics || []).length}`)
}
writeFileSync(dir + '../../../scripts/handpass/ows-C-summ.out.txt', out.join('\n'))
console.log(rows.length, 'rows;', rows.filter(r => r.verdict === 'PASS').length, 'PASS;', rows.filter(r => r.verdict !== 'PASS').map(r => r.verdict + ' ' + r.id).join(', '))
