// Walker B — turns the results file into the report's tables. VERSION 1
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { RES } from './kbs-B-lib.mjs'
const rows = readFileSync(RES, 'utf8').trim().split('\n').map(l => JSON.parse(l))
const nativeFail = r => r.step === 5 && r.result === 'FAIL' && /selection was 0-/.test(r.note)
const numNative = r => r.step === 5 && r.result === 'FAIL' && /selection was null-null/.test(r.note)
const tag = r => (nativeFail(r) || numNative(r)) ? 'FAIL as worded (N1)' : r.result
const esc = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
let out = ''
const order = ['B1', 'B1-control', 'B2', 'B3', 'B3b', 'B4', 'B5', 'B5b', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12']
const key = r => `${r.id}`
const ids = [...new Set(rows.map(key))].sort((a, b) => order.indexOf(a) - order.indexOf(b))
for (const id of ids) {
  out += `\n### ${id}\n\n| id / box | size | step | what I did | EXPECTED | the box showed | result | pictures |\n|---|---|---|---|---|---|---|---|\n`
  for (const size of ['desktop', 'phone']) {
    for (const r of rows.filter(x => key(x) === id && x.size === size)) {
      out += `| ${esc(r.id)} — ${esc(r.box)} | ${size} | ${r.step} | ${esc(r.did)} | ${esc(r.expected)} | \`${esc(typeof r.shown === 'string' ? r.shown : JSON.stringify(r.shown))}\` | ${tag(r)}${r.note ? ' — ' + esc(r.note) : ''} | ${r.pics.map(p => '`' + p + '`').join(', ')} |\n`
    }
  }
}
const count = {}
for (const r of rows) { const t = tag(r); count[t] = (count[t] || 0) + 1 }
out += `\n<!-- counts: ${JSON.stringify(count)} -->\n`
writeFileSync(RES.replace('kbs-B-results.jsonl', 'report-B-tables.md'), out)
console.log(count)
console.log('rows', rows.length, 'pictures in folder', readdirSync(new URL('../../docs/img/handpass/2026-10-19-keyboard-scroll/walk/B/', import.meta.url)).length)
