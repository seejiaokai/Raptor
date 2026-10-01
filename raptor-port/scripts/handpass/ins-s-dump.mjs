/* print rows of ins-s.json: node ins-s-dump.mjs <prefix>  (e.g. 1. or 1.c) */
import { readFileSync } from 'node:fs'
const d = JSON.parse(readFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/ins-s.json', 'utf8'))
const pre = process.argv[2] || '', only = process.argv[3]
for (const [k, v] of Object.entries(d.parts)) {
  if (only && !k.endsWith(only)) continue
  for (const r of v.table) if (r.id.startsWith(pre)) console.log(`[${k}] ${r.verdict} ${r.id} — ${r.did}\n   ${String(r.saw).slice(0, 1500)}\n   pics: ${(r.pics || []).join(', ')}\n`)
}
