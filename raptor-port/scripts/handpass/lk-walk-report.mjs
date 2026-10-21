/* builds the table part of docs/handpass/parts/lk/walk.md from the four walk-*.jsonl files */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/handpass/parts/lk')
const rows = []
for (const part of ['a', 'b', 'c', 'd']) {
  const f = resolve(OUT, `walk-${part}.jsonl`)
  if (!existsSync(f)) continue
  for (const l of readFileSync(f, 'utf8').split('\n').filter(Boolean)) rows.push(JSON.parse(l))
}
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
const pic = (p) => p.map(x => `walk/${x}`).join(', ')
const counts = {}
for (const r of rows) counts[r.verdict] = (counts[r.verdict] || 0) + 1
let md = '| Scenario | Size | What was pressed | What was MEASURED | Verdict | Pictures (under `raptor-port/docs/img/handpass/2026-10-21-look-keys/`) |\n|---|---|---|---|---|---|\n'
for (const r of rows) md += `| ${esc(r.id)} | ${esc(r.size)} | ${esc(r.pressed)} | ${esc(r.measured)} | **${r.verdict}** | ${esc(pic(r.pics || []))} |\n`
writeFileSync(resolve(OUT, 'walk-table.md'), md)
console.log(JSON.stringify(counts), rows.length)
