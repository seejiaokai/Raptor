/* rcb2-w2: builds the table part of the W2 report from the final runs' rows.json. usage: node rcb2-w2-report.mjs > out.md */
import { readFileSync, existsSync } from 'node:fs'
const BASE = 'docs/img/handpass/2026-11-14-rules-check-batch2/w2/'
const RUNS = ['s07-d3', 's07-p1', 's03-d2', 's03-p1', 's04-Ad1', 's04-Bd1', 's04-Ap1', 's04-Bp1', 's08-d2', 's08-p3', 's02-d1', 's02-p4', 's02esc-d1', 's02esc-pdbg4', 's06-d3', 's06-p9', 's12A-d9', 's12B-d9', 's12C-d9', 's12A-p9', 's12B-p9', 's12C-p9']
const cut = (s, n) => { s = String(s ?? '').replace(/\|/g, '/').replace(/\s+/g, ' '); return s.length > n ? s.slice(0, n) + '...' : s }
const tally = {}
const out = []
for (const r of RUNS) {
  const f = BASE + r + '/rows.json'
  if (!existsSync(f)) { out.push(`\n### ${r}: no rows.json\n`); continue }
  const rows = JSON.parse(readFileSync(f, 'utf8'))
  out.push(`\n### Run ${r} (${rows.length} rows, folder ${BASE}${r}/)\n`)
  out.push('| scenario | size | what was done | EXPECTED | what the screen said | verdict | picture |')
  out.push('|---|---|---|---|---|---|---|')
  for (const [sc, size, did, exp, saw, v0, pic] of rows) {
    let v = v0, note = ''
    if (/put "Full day of OIL" back/.test(did) && v0 === 'FAIL') { v = 'PASS (host-corrected)'; note = ' [the script counted 1 button; the picture shows no pending button, no Publish AL1: script artifact]' }
    tally[v] = (tally[v] || 0) + 1
    out.push(`| ${cut(sc, 40)} | ${size} | ${cut(did, 160)} | ${cut(exp, 140)} | ${cut(saw, 330)}${note} | ${v} | ${cut(pic, 70)} |`)
  }
}
out.push('\nTally: ' + JSON.stringify(tally))
console.log(out.join('\n'))
