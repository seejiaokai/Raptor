import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const rows = readFileSync(path.join(HERE, 'results.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l))
const last = new Map(); for (const r of rows) last.set(r.id + '|' + r.size, r)
const all = [...last.values()]
const errs = all.filter(r => r.id.startsWith('errs'))
const sc = all.filter(r => !r.id.startsWith('errs') && /^\d+$/.test(r.id)).sort((a, b) => +a.id - +b.id || a.size.localeCompare(b.size))
const other = all.filter(r => !r.id.startsWith('errs') && !/^\d+$/.test(r.id))
const cnt = {}; for (const r of sc) cnt[r.status] = (cnt[r.status] || 0) + 1
console.log(JSON.stringify(cnt), 'scenario-size rows', sc.length)
console.log('other', JSON.stringify(other.map(o => [o.id, o.size, o.status])))
console.log('errs', JSON.stringify(errs.map(e => [e.id, e.size, e.note.slice(0, 300)])))
const esc = t => String(t).replace(/\|/g, '\|').replace(/\n/g, ' ')
const md = ['| # | size | result | what the screen said | picture |', '|---|---|---|---|---|', ...sc.map(r => `| ${r.id} | ${r.size} | ${r.status} | ${esc(r.note)} | ${r.pic ? '`' + r.pic.replace('docs/img/handpass/2026-10-13-inputs-batch/w1/', '') + '`' : ''} |`)]
writeFileSync(path.join(HERE, 'table.md'), md.join('\n'))
for (const r of sc.filter(r => r.status !== 'PASS')) console.log('NONPASS', r.id, r.size, r.status, r.note.slice(0, 200))
