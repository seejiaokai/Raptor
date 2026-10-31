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
  lines(readFileSync(resolve(ROOT, f), 'utf8')).forEach((line, i) => {
    if (!added.has(line)) return
    const m = line.match(DISABLE)
    if (!m) return
    const rule = m[1].replace(/^react-hooks\//, '').replace(/^react-doctor\//, '')
    const k = f + '|' + rule
    if (!reasons.has(k)) reasons.set(k, [])
    reasons.get(k).push({ line: i + 2, why: (m[2] || '(no reason written)').trim() })
  })
}
const afterCount = new Map()
for (const x of after) { const k = norm(x.filePath) + '|' + x.rule; afterCount.set(k, (afterCount.get(k) || 0) + 1) }
const used = new Map()
const rows = before.sort((a, b) => norm(a.filePath).localeCompare(norm(b.filePath)) || a.line - b.line).map(x => {
  const f = norm(x.filePath), k = f + '|' + x.rule
  const rs = reasons.get(k) || []
  const n = used.get(k) || 0
  if (n < rs.length) { used.set(k, n + 1); return [f, x.line, x.rule, x.severity, 'KEPT', rs[n].why + ' (now line ' + rs[n].line + ')'] }
  if ((afterCount.get(k) || 0) > 0) { afterCount.set(k, afterCount.get(k) - 1); return [f, x.line, x.rule, x.severity, 'OPEN', 'still reported'] }
  return [f, x.line, x.rule, x.severity, 'FIXED', '']
})
const tally = s => rows.filter(r => r[4] === s).length
const md = [
  '| File:line (before) | Rule | Level | Outcome | Reason kept |', '|---|---|---|---|---|',
  ...rows.map(r => `| ${r[0]}:${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} | ${String(r[5]).split('|').join('\\|')} |`),
].join('\n')
writeFileSync(outF, `${rows.length} findings in the batch: FIXED ${tally('FIXED')}, KEPT ${tally('KEPT')}, OPEN ${tally('OPEN')}.\n\n` + md + '\n')
console.log(`${rows.length} findings: FIXED ${tally('FIXED')}, KEPT ${tally('KEPT')}, OPEN ${tally('OPEN')}; after-run batch findings ${after.length}`)
