/* www w1 report builder: reads each final run's rows.json and writes docs/handpass/parts/2026-11-16-www-w1.md */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const IMG = resolve(ROOT, 'docs/img/handpass/2026-11-16-warn-words-standalone/w1')
const runs = ['s11-d', 's11-p', 's1-d', 's1-p', 's8-d', 's8-p', 's3-d', 's3-p', 's13-d', 'ROUND2', 's3b-d', 's3b-p', 's6b-d', 's6b-p', 's6-d', 's6-p', 's2c-d', 's2c-p', 's5c-d', 's5c-p']
const esc = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
let out = '# W1 walk report — [WARN-WORDS-STANDALONE] (16 Nov 26)\n\nWalker W1 (Sonnet 5.5), frozen build, one fresh world per run. Pictures under `docs/img/handpass/2026-11-16-warn-words-standalone/w1/<run>/`.\n\n'
let total = 0
const counts = {}
for (const r of runs) {
  if (r === 'ROUND2') { out += '# Second round\n\nCarried on with what round 1 did not walk. s6-d / s6-p are the duty-block shape (see the notes); s6b is the standalone SC wave D2055 names.\n\n'; continue }
  const rowsF = resolve(IMG, r, 'rows.json')
  if (!existsSync(rowsF)) { out += `## ${r}: NO rows.json\n\n`; continue }
  const rows = JSON.parse(readFileSync(rowsF, 'utf8'))
  const pics = readdirSync(resolve(IMG, r)).filter(f => f.endsWith('.png')).length
  counts[r] = pics; total += pics
  out += `## Run ${r} (${rows.length} rows, ${pics} pictures)\n\n| scenario | size | what was done | EXPECTED | what the screen said | verdict | picture |\n|---|---|---|---|---|---|---|\n`
  for (const x of rows) out += `| ${esc(x[0])} | ${esc(x[1])} | ${esc(x[2])} | ${esc(x[3])} | ${esc(String(x[4]).slice(0, 1400))} | ${x[5]} | ${x[6] ? `${r}/${x[6]}` : ''} |\n`
  out += '\n'
}
out += `\nTotal pictures in the final runs: ${total} (${JSON.stringify(counts)}).\n`
const notes = resolve(IMG, 'notes.md')
if (existsSync(notes)) out += '\n' + readFileSync(notes, 'utf8')
const dest = resolve(ROOT, 'docs/handpass/parts/2026-11-16-www-w1.md')
mkdirSync(dirname(dest), { recursive: true })
writeFileSync(dest, out)
console.log('wrote', dest, out.length)
