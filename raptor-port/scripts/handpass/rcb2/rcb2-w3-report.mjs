/* rcb2-w3 report builder v1: joins the final runs' rows.json into the step tables of docs/handpass/parts/2026-11-15-rcb2-w3.md (table part printed to stdout) */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const BASE = resolve(ROOT, 'docs/img/handpass/2026-11-14-rules-check-batch2/w3')
const runs = ['r1-d1', 'r1-p1', 'r2-d1', 'r2-p2', 'r3-d6', 'r3-p6', 'r4-d1', 'r4-p1', 'r5-d2', 'r5-p1', 'r6-d1', 'r6-p4', 'r7-d1', 'r7-p2']
const esc = s => String(s ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ').slice(0, 330)
let out = '| step | size | what was done | EXPECTED | what the screen said | result | picture |\n|---|---|---|---|---|---|---|\n'
const count = {}
for (const r of runs) {
  const f = resolve(BASE, r, 'rows.json')
  if (!existsSync(f)) { out += `| ${r} | - | no rows.json | | | NOT WALKED | |\n`; continue }
  for (const [sc, size, did, exp, saw, verdict, pic] of JSON.parse(readFileSync(f, 'utf8'))) {
    count[verdict] = (count[verdict] || 0) + 1
    out += `| ${esc(sc)} | ${size} | ${esc(did)} | ${esc(exp)} | ${esc(saw)} | ${verdict} | ${pic ? 'docs/img/handpass/2026-11-14-rules-check-batch2/w3/' + r + '/' + pic : ''} |\n`
  }
}
console.log(out)
console.log('COUNTS', JSON.stringify(count))
