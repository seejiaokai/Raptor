/* WALKER C: merge this walker's part files into bta-C.json (the final rows; stale first-run S35 rows dropped, my verdicts applied) */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
const D = 'C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/docs/handpass/parts/'
const load = f => existsSync(D + f) ? JSON.parse(readFileSync(D + f, 'utf8')).parts : {}
const rows = []
const take = (file, partKey, keep) => { const p = load(file)[partKey]; if (!p) { console.log('MISSING', file, partKey); return }; for (const r of p.table) if (!keep || keep(r)) rows.push({ ...r, src: file + ':' + partKey }) }
take('bta-C.json', 'bta-C-1-all-dk')
take('bta-C.json', 'bta-C-2-all-dk', r => /^(S32|S33|S34)/.test(r.id))
take('bta-C-2b.json', 'bta-C-2-s35-dk'); take('bta-C-2b.json', 'bta-C-2-s35b-dk')
take('bta-C-5.json', 'bta-C-5-1-dk'); take('bta-C-5.json', 'bta-C-5-2-dk')
take('bta-C-2c.json', 'bta-C-2-s20-dk')
take('bta-C-3.json', 'bta-C-3-all-dk')
take('bta-C-3t.json', 'bta-C-3-s29t-dk'); take('bta-C-3n.json', 'bta-C-3-s29n-dk')
take('bta-C-4.json', 'bta-C-4-dk')
take('bta-C-ph.json', 'bta-C-1-s08-ph'); take('bta-C-ph.json', 'bta-C-1-s10-ph')
/* my verdicts where the script wrote RECORDED / a crude check */
const V = { 'S35.2': 'PASS', 'S35.2b': 'PASS', 'S35.3': 'PASS', 'S35.3b': 'RECORDED', 'S35.4': 'PASS', 'S35.5': 'PASS', 'S36.1': 'PASS', 'S36.2': 'PASS', 'S36.3': 'PASS', 'S36.4': 'PASS', 'S20.0500': 'PASS', 'S20.05:00': 'PASS', 'S20.0500H': 'PASS', 'S20.12:90': 'PASS', 'S20.25:00': 'PASS',
  'S29.Meeting.1': 'PARTIAL', 'S29.Training.1': 'PARTIAL', 'S29.Appointment.1': 'PARTIAL', 'S29.Personal.1': 'PARTIAL', 'S29.Other.1': 'PARTIAL', 'S29.none.0': 'RECORDED', 'S29.none.1': 'RECORDED' }
for (const r of rows) { if (V[r.id]) r.verdict = V[r.id] }
const phone = rows.filter(r => r.src.includes('-ph.json')); for (const r of phone) r.id = 'PHONE ' + r.id
writeFileSync(D + 'bta-C.json', JSON.stringify({ walker: 'C', base: 'http://localhost:4233', rows }, null, 1))
for (const r of rows) console.log(`${r.verdict}\t${r.id}\t${(r.pics || []).join(', ')}`)
console.log(rows.length, 'rows;', new Set(rows.flatMap(r => r.pics || [])).size, 'distinct pictures cited')
