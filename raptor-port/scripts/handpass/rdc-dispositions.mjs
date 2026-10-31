/* [REACT-DOCTOR-CLEANUP] (D1534, 31 Oct 26): the per-finding outcome table, made mechanically.
   Usage: node scripts/handpass/rdc-dispositions.mjs <before diagnostics.json> <after diagnostics.json> <out.md>
   The batch = every app finding (src/, tests left out) that is an error, an exhaustive-deps warning, or in src/tracker/.
   Each is KEPT when a disable comment for its rule that THIS BRANCH ADDED stands in its file (its reason quoted), else
   OPEN when the after run still reports that rule in that file, else FIXED. Line numbers are the before run's; a kept
   finding's reason is matched by rule within its file, in line order (the comment sits above the moved line). */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const [beforeF, afterF, outF] = process.argv.slice(2)
const norm = p => p.split('\\').join('/')
const lines = s => s.split('\n').map(l => (l.endsWith('\r') ? l.slice(0, -1) : l))
const isTest = p => /\.(test|spec)\.[jt]sx?$/.test(p) || /(^|\/)e2e\//.test(p)
const inBatch = x => {
  const p = norm(x.filePath)
  return p.startsWith('src/') && !isTest(p) && (x.severity === 'error' || x.rule === 'exhaustive-deps' || p.startsWith('src/tracker/'))
}
const before = JSON.parse(readFileSync(beforeF, 'utf8')).filter(inBatch)
const after = JSON.parse(readFileSync(afterF, 'utf8')).filter(inBatch)

/* the disable comments this branch added in the batch's files, by file and rule — an older one is not this batch's */
const reasons = new Map()
const DISABLE = /eslint-disable-next-line\s+([\w@/-]+)(?:\s+--\s*(.*?))?\s*(?:\*\/\s*\})?\s*$/
for (const f of new Set(before.map(x => norm(x.filePath)))) {
  const diff = execSync(`git diff origin/main -U0 -- "${f}"`, { cwd: ROOT, encoding: 'utf8' })
  const added = new Set(lines(diff).filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.slice(1)))
  const now = lines(readFileSync(resolve(ROOT, f), 'utf8'))
  now.forEach((line, i) => {
    if (!added.has(line)) return
    const m = line.match(DISABLE)
    if (!m) return
    const rule = m[1].replace(/^react-hooks\//, '').replace(/^react-doctor\//, '')
    const k = f + '|' + rule
    if (!reasons.has(k)) reasons.set(k, [])
    /* the line the comment sits above, as text: it is paired with the finding whose line on main reads the same
       (the code read's F2, 31 Oct 26 — pairing by order put reasons on the wrong lines) */
    reasons.get(k).push({ line: i + 2, code: (now[i + 1] || '').trim(), why: (m[2] || '(no reason written)').trim(), used: false })
  })
}
const mainLines = new Map()
const mainLine = (f, n) => {
  if (!mainLines.has(f)) mainLines.set(f, lines(execSync(`git show "origin/main:raptor-port/${f}"`, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1e8 })))
  return (mainLines.get(f)[n - 1] || '').trim()
}
const afterCount = new Map()
for (const x of after) { const k = norm(x.filePath) + '|' + x.rule; afterCount.set(k, (afterCount.get(k) || 0) + 1) }
const rows = before.sort((a, b) => norm(a.filePath).localeCompare(norm(b.filePath)) || a.line - b.line).map(x => {
  const f = norm(x.filePath), k = f + '|' + x.rule
  const was = mainLine(f, x.line)
  const r = (reasons.get(k) || []).find(r => !r.used && r.code === was)
  if (r) { r.used = true; return [f, x.line, x.rule, x.severity, 'KEPT', r.why + ' (now line ' + r.line + ')'] }
  if ((afterCount.get(k) || 0) > 0) { afterCount.set(k, afterCount.get(k) - 1); return [f, x.line, x.rule, x.severity, 'OPEN', 'still reported'] }
  return [f, x.line, x.rule, x.severity, 'FIXED', '']
})
/* a reason above a line the clean-up ALSO edited cannot match main's text: it takes the nearest still-unpaired finding of
   its rule in its file, and says so; one that still meets none is listed, never silently dropped */
for (const [k, rs] of reasons) for (const r of rs.filter(r => !r.used)) {
  const [f, rule] = k.split('|')
  const cands = rows.filter(row => row[0] === f && row[2] === rule && row[4] === 'FIXED')
  if (!cands.length) { console.log('UNPAIRED reason at line ' + r.line + ' above: ' + r.code.slice(0, 80)); continue }
  const best = cands.reduce((a, b) => (Math.abs(b[1] - r.line) < Math.abs(a[1] - r.line) ? b : a))
  r.used = true; best[4] = 'KEPT'; best[5] = r.why + ' (now line ' + r.line + '; paired by place — the line itself was edited too)'
  console.log('paired by place: ' + f + ':' + best[1] + ' ' + rule)
}
const tally = s => rows.filter(r => r[4] === s).length
const md = [
  '| File:line (before) | Rule | Level | Outcome | Reason kept |', '|---|---|---|---|---|',
  ...rows.map(r => `| ${r[0]}:${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} | ${String(r[5]).split('|').join('\\|')} |`),
].join('\n')
writeFileSync(outF, `${rows.length} findings in the batch: FIXED ${tally('FIXED')}, KEPT ${tally('KEPT')}, OPEN ${tally('OPEN')}.\n\n` + md + '\n')
console.log(`${rows.length} findings: FIXED ${tally('FIXED')}, KEPT ${tally('KEPT')}, OPEN ${tally('OPEN')}; after-run batch findings ${after.length}`)
