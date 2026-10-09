import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
const dir = 'docs/handpass/parts'
const files = readdirSync(dir).filter(f => /^icard-A-rows-.*\.json$/.test(f))
const rows = []; const errs = new Set()
for (const f of files) { const j = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')); for (const r of j.rows) rows.push({ ...r, src: f }); for (const e of j.errs) errs.add(e) }
const num = r => parseInt(String(r.id), 10)
rows.sort((a, b) => num(a) - num(b) || String(a.size).localeCompare(String(b.size)))
const notes = JSON.parse(readFileSync('scripts/handpass/icard-A-notes.json', 'utf8'))
for (const r of rows) { const k = `${r.id}|${r.size}`; if (notes[k]) { r.note = notes[k].note; if (notes[k].verdict) r.verdict = notes[k].verdict; if (notes[k].detail) r.detail = notes[k].detail } }
const esc = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
let md = `# Walker A - the input card walk (10 Oct 26)\n\nServer http://localhost:4231/ (frozen build). Scripts \`scripts/handpass/icard-A-*.mjs\`; pictures \`docs/img/handpass/2026-10-10-input-card-check/A/\`.\n\n| # | size | role | verdict | what the screen said | pictures |\n|---|---|---|---|---|---|\n`
for (const r of rows) md += `| ${r.id} | ${esc(r.size)} | ${esc(r.role)} | ${r.verdict} | ${esc(r.detail).slice(0, 700)}${r.note ? ' **NOTE:** ' + esc(r.note) : ''} | ${(r.pics || []).join(', ')} |\n`
md += `\n## Console / page errors\n${errs.size ? [...errs].map(e => '- ' + e).join('\n') : 'None - no console error, page error or 4xx in any script run.'}\n`
md += `\n## Extras\n` + notes._extras.map(e => '- ' + e).join('\n') + '\n'
md += `\n## Not run\n` + notes._notrun.map(e => '- ' + e).join('\n') + '\n'
writeFileSync(`${dir}/icard-A.md`, md)
writeFileSync(`${dir}/icard-A.json`, JSON.stringify({ rows, errors: [...errs], extras: notes._extras, notRun: notes._notrun }, null, 1))
const c = { PASS: 0, FAIL: 0, 'NOT RUN': 0 }; for (const r of rows) c[r.verdict] = (c[r.verdict] || 0) + 1
console.log(JSON.stringify(c), rows.length, 'rows;', 'scenarios', [...new Set(rows.map(num))].join(','))
