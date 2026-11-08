// Builds the report table for W2 from results.json (last result of each scenario+step wins).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const R = JSON.parse(readFileSync(resolve(HERE, '../../docs/img/handpass/2026-11-08-chat28-not-kept/w2/results.json'), 'utf8'))
const m = new Map()
for (const r of R) m.set(r.sc + '|' + r.step, r)
// drop the "script stopped" lines of earlier tries (each was fixed and re-run) and the two Jump to a date NOTRUNs that the later run replaced with PASS
const rows = [...m.values()].filter(r => !(r.step === 'script' && r.res === 'NOTRUN') && !(r.sc === '14' && /^Jump to a date closed by (esc|outside)$/.test(r.step)))
const order = s => { const n = parseInt(s, 10); return Number.isNaN(n) ? 99 : n }
rows.sort((a, b) => order(a.sc) - order(b.sc))
const cnt = { PASS: 0, FAIL: 0, NOTRUN: 0, RECORD: 0 }
for (const r of rows) cnt[r.res]++
const esc = s => String(s).replace(/\|/g, '/').replace(/\n/g, ' ')
let out = `# W2 walk: his iPhone (402x874, WebKit, touch), storage refused, chat 28 "Not kept" band\n\n`
out += `Counts (graded steps): PASS ${cnt.PASS}, FAIL ${cnt.FAIL}, NOTRUN ${cnt.NOTRUN}; plus ${cnt.RECORD} RECORD lines (measurements the brief asked to be written down, not graded).\n\n`
out += `| Scenario | Step | Result | What the screen showed | Pictures |\n|---|---|---|---|---|\n`
for (const r of rows) out += `| ${r.sc} | ${esc(r.step)} | ${r.res} | ${esc(r.said)} | ${esc(r.pics || '')} |\n`
writeFileSync(resolve(HERE, '../../docs/handpass/parts/chat28/w2-table.md'), out)
console.log(JSON.stringify(cnt), rows.length)
