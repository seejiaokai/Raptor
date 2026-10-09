// Walker C: merge the per-script row files into docs/handpass/parts/it-C.json and it-C.md
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
const DIR = 'C:/Users/User/projects/Raptor/raptor-port/scripts/handpass/it-C-rows'
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts'
const PICS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-09-input-title-check/C'
const files = readdirSync(DIR).filter(f => f.endsWith('.json') && !f.endsWith('.errors.json') && !['overrides.json', 'extras.json'].includes(f))
let rows = []
for (const f of files) for (const r of JSON.parse(readFileSync(join(DIR, f), 'utf8'))) rows.push({ ...r, file: f })
// overrides decided by reading the lines and the pictures (the script's own verdict test could not know these grades)
const overrides = JSON.parse(existsSync(join(DIR, 'overrides.json')) ? readFileSync(join(DIR, 'overrides.json'), 'utf8') : '{}')
for (const r of rows) {
  const o = overrides[r.file]
  if (o && o.mergeInto) continue
  if (o) { if (o.picsOnly) r.pics = o.picsOnly;
    if (o.verdict) r.verdict = o.verdict; if (o.role) r.role = o.role; if (o.note) r.said = r.said + ' || HOST-READING NOTE: ' + o.note; if (o.pics) r.pics = (r.pics || []).concat(o.pics) }
  r.pics = [...new Set((r.pics || []).filter(Boolean))].filter(p => existsSync(join(PICS, p)))
}
for (const f of Object.keys(overrides)) { const o = overrides[f]; if (!o.mergeInto) continue; const src = rows.find(r => r.file === f), dst = rows.find(r => r.file === o.mergeInto); if (src && dst) { dst.said += ' || EXTRA PICTURES (warning list opened): ' + src.said; dst.pics = [...new Set(dst.pics.concat(o.pics || []))].filter(p => existsSync(join(PICS, p))) } }
rows = rows.filter(r => !(overrides[r.file] && overrides[r.file].mergeInto))
const order = [44, 45, 46, 47, 48, 50, 53, 54, 55, 57, 58, 59, 60, 61, 63, 64]
rows.sort((a, b) => order.indexOf(a.n) - order.indexOf(b.n) || a.file.localeCompare(b.file))
const errs = []
for (const f of readdirSync(DIR).filter(f => f.endsWith('.errors.json'))) for (const e of JSON.parse(readFileSync(join(DIR, f), 'utf8'))) errs.push(f.replace('.errors.json', '') + ': ' + e)
const extras = existsSync(join(DIR, 'extras.json')) ? JSON.parse(readFileSync(join(DIR, 'extras.json'), 'utf8')) : []
const counts = rows.reduce((a, r) => (a[r.verdict] = (a[r.verdict] || 0) + 1, a), {})
writeFileSync(join(OUT, 'it-C.json'), JSON.stringify({ walker: 'C', server: 'http://localhost:4233/', counts, rows: rows.map(({ file, ...r }) => ({ ...r, script: file })), consoleErrors: errs, extras }, null, 1))
let md = `# Walker C — input's own title walk (9 Oct 26)\n\nServer http://localhost:4233/ (frozen build). Pictures: raptor-port/docs/img/handpass/2026-10-09-input-title-check/C/\n\nCounts: ${Object.entries(counts).map(([k, v]) => k + ' ' + v).join(', ')} (rows = scenario x size)\n\n| # | size | role | verdict | pictures |\n|---|---|---|---|---|\n`
for (const r of rows) md += `| ${r.n} | ${r.size} | ${r.role} | ${r.verdict} | ${r.pics.join(', ')} |\n`
md += '\n## What the screen said, row by row\n'
for (const r of rows) md += `\n### ${r.n} · ${r.size} · ${r.role} — ${r.verdict}\n${String(r.said).split(' || ').map(x => '- ' + x).join('\n')}\n`
md += `\n## Console / page errors seen\n${errs.length ? errs.map(e => '- ' + e).join('\n') : 'None in any run.'}\n`
md += `\n## Other things that looked wrong or odd (not in a scenario)\n${extras.length ? extras.map(e => '- ' + e).join('\n') : 'None.'}\n`
writeFileSync(join(OUT, 'it-C.md'), md)
console.log('rows', rows.length, JSON.stringify(counts), 'errors', errs.length)
