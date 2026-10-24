// Walker 2 — compile the result files into the report's table (stdout). usage: node lw-night-w2-compile.mjs file1.json file2.json ...  (later files win for the same scenario id + size)
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const dir = path.resolve(here, '../../docs/img/handpass/2026-10-25-lw-night/w2')
const rel = 'docs/img/handpass/2026-10-25-lw-night/w2/'
const DROP = new Set((process.env.DROP || '').split(',').filter(Boolean))
const all = new Map()
for (const f of process.argv.slice(2)) for (const r of JSON.parse(readFileSync(path.join(dir, f), 'utf8'))) { const k = `${r.id}|${r.size}`; if (DROP.has(k)) continue; all.set(k, { ...r, src: f }) }
const num = id => { const m = String(id).match(/^(\d+)/) || String(id).match(/(\d+)/); return m ? Number(m[1]) : 99 }
const order = id => {
  const m = String(id).match(/^B(\d)/) || String(id).match(/^(\d)-errors$/)
  if (m) return 100 + Number(m[1])
  if (/^S34/.test(id) || /^34-/.test(id)) return 34
  if (/^INC/.test(id)) return 200
  if (/^B5\/B6/.test(id)) return 199
  return num(id)
}
const rows = [...all.values()].filter(r => !(process.env.NO_ERRORS && /errors/.test(r.id))).sort((a, b) => order(a.id) - order(b.id) || String(a.id).localeCompare(String(b.id)) || String(a.size).localeCompare(String(b.size)))
const esc = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const cut = (s, n) => { s = String(s ?? ''); return s.length > n ? s.slice(0, n) + ' …' : s }
const out = ['| Scenario | Size / engine | What the screen did | Verdict | Pictures |', '|---|---|---|---|---|']
for (const r of rows) out.push(`| ${esc(r.id)} | ${esc(r.size)} | ${esc(cut(r.said, Number(process.env.CUT || 900)))} | **${r.verdict}** | ${(r.pics || []).map(p => '`' + p + '.png`').join(' ')} |`)
console.log(out.join('\n'))
const counts = {}
for (const r of rows) counts[r.verdict] = (counts[r.verdict] || 0) + 1
console.error('rows', rows.length, JSON.stringify(counts))
