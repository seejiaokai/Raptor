/* walker A — merges the part files into bta-A.json (the later part wins for the same id and size) and prints the H-01 matrix. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
const DIR = 'C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/handpass/parts'
/* order matters: a later part replaces an earlier row with the same id and size (the reruns after a too-strict wording in the first judge) */
const ORDER = ['h01a', 'h01b', 'h01u', 'h01s', 'h01s2', 'h01bb', 'h02d2', 'h02p', 's01d', 's01p', 's12d', 's12r', 's13d', 's14d', 's19d', 's19r', 's22d', 's22bd', 's23d', 's23rows', 's24d', 's24r', 'nan']
const rows = new Map()
const supersededBy = {}
for (const part of ORDER) {
  const f = `${DIR}/bta-A-${part}.json`
  if (!existsSync(f)) { console.log('missing part', part); continue }
  const j = JSON.parse(readFileSync(f, 'utf8'))
  for (const [name, p] of Object.entries(j.parts || {})) {
    for (const r of p.table) {
      const key = r.id + '|' + (p.phone ? 'phone' : 'desk')
      if (rows.has(key) && !/\.err$/.test(r.id)) supersededBy[key] = (supersededBy[key] || []).concat(rows.get(key).part)
      rows.set(key, { ...r, size: p.phone ? 'phone' : 'desk', part })
    }
  }
}
const all = [...rows.values()]
const count = v => all.filter(r => r.verdict === v).length
const out = { walker: 'A', at: new Date().toISOString(), build: 'http://localhost:4231', counts: { PASS: count('PASS'), FAIL: count('FAIL'), PARTIAL: count('PARTIAL'), RECORDED: count('RECORDED'), 'NOT WALKED': count('NOT WALKED') }, rows: all, superseded: supersededBy }
writeFileSync(`${DIR}/bta-A.json`, JSON.stringify(out, null, 1))
console.log('rows', all.length, JSON.stringify(out.counts))
/* the H-01 matrix */
const TYPES = ['LL', 'OL', 'ATT C', 'ATT B', 'OD', 'Training', 'Meeting', 'SANS Availability', 'Upchit']
const FAMS = ['fly', 'scMain', 'scSpare', 'bbMain', 'bbSpare', 'duty', 'sim', 'ground', 'prog', 'bbDesk']
console.log(['type', ...FAMS].join('\t'))
for (const t of TYPES) console.log([t, ...FAMS.map(f => { const r = rows.get(`H-01 ${t} × ${f}|desk`); return r ? r.verdict[0] : '-' })].join('\t'))
/* every non-PASS row, short */
for (const r of all) if (r.verdict !== 'PASS' && !/^H-01/.test(r.id)) console.log(`${r.verdict}\t${r.id}\t${r.size}`)
