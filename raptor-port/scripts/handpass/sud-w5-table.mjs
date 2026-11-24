// sud-w5-table — prints the report's table (markdown) from run folders' results-*.json files, and the counts.
// Each argument: <folder>[@<size>][~<file regex to leave out>] — e.g. final~^results-a3 final/fit@phone
// Run from raptor-port/:  node scripts/handpass/sud-w5-table.mjs <args…> > <out>
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
console.error('sud-w5-table v2', process.argv.slice(2).join(' '))
const rows = []
for (const a of process.argv.slice(2)) {
  const m = a.match(/^([^@~]+)(?:@([a-z]+))?(?:~(.+))?$/)
  const [, dir, size, ex] = m
  const rel = path.relative('docs/img/handpass/2026-11-23-sans-unfiled/w5', dir).replace(/\\/g, '/')
  for (const f of readdirSync(dir).filter(f => /^results-.*\.json$/.test(f) && !(ex && new RegExp(ex).test(f))).sort())
    for (const r of JSON.parse(readFileSync(path.join(dir, f), 'utf8'))) if (!size || r.size === size) rows.push({ ...r, folder: rel })
}
const esc = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
const verdict = ok => ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'REC' ? 'RECORDED' : ok === 'NW' ? 'NOT WALKED' : 'NOTE'
const c = { PASS: 0, FAIL: 0, RECORDED: 0, 'NOT WALKED': 0, NOTE: 0 }
const pics = new Set()
console.log('| Step | Size | What was done | What the screen said | Verdict | Pictures (folder) |')
console.log('|---|---|---|---|---|---|')
for (const r of rows) {
  const v = verdict(r.ok); c[v]++
  for (const p of String(r.pics || '').split(',').map(s => s.trim()).filter(Boolean)) pics.add(r.folder + '/' + p)
  console.log(`| ${esc(r.scn)} ${esc(r.id)} | ${r.size} | ${esc(r.what)} | ${esc(r.note).slice(0, 500)} | ${v} | ${r.pics ? esc(r.pics) + ' (' + r.folder + ')' : ''} |`)
}
console.error(JSON.stringify({ rows: rows.length, ...c, picsCited: pics.size }))
