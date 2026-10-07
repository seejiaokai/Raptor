/* prints the rows of one part of bta-B.json in full: node bta-B-dump.mjs <part-name> [row-id-prefix] */
import { readFileSync } from 'node:fs'
const j = JSON.parse(readFileSync(process.env.HP_OUT, 'utf8'))
const [, , part, pre] = process.argv
for (const [k, v] of Object.entries(j.parts)) {
  if (part && !k.startsWith(part)) continue
  for (const r of v.table) if (!pre || r.id.startsWith(pre)) console.log(`${r.verdict} ${r.id} | ${r.did}\n   SAW: ${r.saw}\n   PICS: ${(r.pics || []).join(', ')}\n`)
}
