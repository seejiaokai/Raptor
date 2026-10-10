// Merges the per-scenario rows into it-A.json and it-A.md (walker A's hand-back).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { ROWS_DIR } from './it-A-lib.mjs'
const rows = []
for (const f of readdirSync(ROWS_DIR).filter(f => /^rows-s\d+\.json$/.test(f))) rows.push(...JSON.parse(readFileSync(join(ROWS_DIR, f), 'utf8')))
const ov = JSON.parse(readFileSync(join(ROWS_DIR, 'overrides.json'), 'utf8'))
for (const r of rows) { const o = ov.find(x => x.n === r.n && (!x.size || r.size.startsWith(x.size)) && (!x.role || r.role.includes(x.role))); if (o) { if (o.verdict) r.verdict = o.verdict; if (o.add) r.say += ' · ' + o.add; if (o.pics) r.pics = [...(r.pics || []), ...o.pics] } }
rows.sort((a, b) => a.n - b.n || a.size.localeCompare(b.size) || String(a.role).localeCompare(String(b.role)))
writeFileSync('docs/handpass/parts/it-A.json', JSON.stringify(rows.map(r => ({ n: r.n, size: r.size, role: r.role, verdict: r.verdict, said: r.say, pictures: r.pics || [] })), null, 1))
console.log(rows.map(r => `${r.n} | ${r.size} | ${r.role} | ${r.verdict}`).join('\n'))
