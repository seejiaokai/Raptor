/* print rows of my part file: node ins-a-show.mjs <part> [rowIdRegex] [maxChars] */
import { readFileSync } from 'node:fs'
const all = JSON.parse(readFileSync(process.env.HP_OUT, 'utf8')).parts
const [part, re = '.', max = '1500'] = process.argv.slice(2)
if (!part) { for (const k of Object.keys(all)) console.log(k, all[k].table.map(r => r.verdict[0]).join(''), 'errors:', (all[k].errors || []).length) }
else for (const r of all[part].table) if (new RegExp(re).test(r.id)) console.log(`${r.verdict} ${r.id} — ${r.did}\n   ${String(r.saw).slice(0, +max)}\n   pics: ${(r.pics || []).join(', ')}\n`)
