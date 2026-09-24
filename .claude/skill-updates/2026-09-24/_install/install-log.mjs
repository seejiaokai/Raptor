#!/usr/bin/env node
/* The 24 Sep 26 skill review's two writes to the observation log, done the way the task-observer skill's
 * "Log-write safety" demands: a backup first, a fresh read immediately before each write, one bounded entry at
 * a time (a status line is replaced only inside its own entry, line-anchored), and a header-count invariant
 * checked against the LIVE file before and after.
 *
 *   node install-log.mjs statuses <groups|all>   status lines from _review/dispositions.md, for the approved groups
 *   node install-log.mjs archive                  every ACTIONED/DECLINED entry → archive/log-<today>.md (D69: same day)
 *
 * Run from the repo root. Both are dry unless --write is given; --write keeps a backup beside the scratch copy. */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const LOG = '.claude/skill-observations/log.md'
const ARCH_DIR = '.claude/skill-observations/archive'
const DISP = '.claude/skill-updates/2026-09-24/_review/dispositions.md'
const DATE = '2026-09-24', REVIEW = 'weekly review 24 Sep 26, owner-approved'
const [cmd, arg] = process.argv.slice(2)
const write = process.argv.includes('--write')
const die = m => { console.error('install-log: ' + m); process.exit(1) }

const HEAD = /^### Observation (\d+):/
const heads = t => t.split('\n').filter(l => HEAD.test(l)).map(l => +HEAD.exec(l)[1])
/* Split into [preamble, ...entries]; each entry runs from its header to the next header, so an entry's own
   trailing lines (and any "## date" section heading after it) stay with it byte for byte. */
function split(t) {
  const ls = t.split('\n'), out = [{ n: null, lines: [] }]
  for (const l of ls) { const m = HEAD.exec(l); if (m) out.push({ n: +m[1], lines: [l] }); else out[out.length - 1].lines.push(l) }
  return out
}
const join_ = parts => parts.map(p => p.lines.join('\n')).join('\n')

if (cmd === 'statuses') {
  if (!arg) die('usage: statuses <groups|all> [--write]')
  const want = arg === 'all' ? null : new Set(arg.split(',').map(s => s.trim()))
  const rows = readFileSync(DISP, 'utf8').split('\n').map(l => /^\| (\d+) \| (ACTIONED|DECLINED|OPEN) \| ([^|]+?) \| (.+) \|\s*$/.exec(l)).filter(Boolean)
    .map(m => ({ n: +m[1], d: m[2], g: m[3].trim(), where: m[4].trim() }))
  const todo = rows.filter(r => r.d !== 'OPEN' && (want === null || want.has(r.g)))
  if (!todo.length) die('no rows for those groups')
  const before = readFileSync(LOG, 'utf8')
  const parts = split(before), h0 = heads(before).length
  for (const r of todo) {
    const hits = parts.filter(p => p.n === r.n)
    if (hits.length !== 1) die(`#${r.n} heads ${hits.length} entries — refusing`)
    const e = hits[0], i = e.lines.findIndex(l => /^\*\*Status:\*\* /.test(l))
    if (i < 0) die(`#${r.n} has no Status line`)
    if (!/^\*\*Status:\*\* OPEN\b/.test(e.lines[i])) { console.log(`#${r.n}: not OPEN (${e.lines[i].slice(0, 60)}…) — left alone`); continue }
    const text = /^(already reflected|filed as)/.test(r.where) ? r.where : 'Applied to ' + r.where
    e.lines[i] = `**Status:** ${r.d} (${DATE}) — ${text} (${REVIEW})`
  }
  const after = join_(parts)
  if (heads(after).length !== h0) die(`header count would change ${h0} → ${heads(after).length} — nothing written`)
  console.log(`${todo.length} status line(s) prepared; headers ${h0} → ${heads(after).length}`)
  if (!write) { console.log('dry run — add --write'); process.exit(0) }
  if (readFileSync(LOG, 'utf8') !== before) die('the live log changed while preparing — re-run')
  copyFileSync(LOG, join(tmpdir(), `skill-log-backup-${Date.now()}.md`))
  writeFileSync(LOG, after)
  const check = split(readFileSync(LOG, 'utf8'))
  for (const r of todo) { const e = check.find(p => p.n === r.n); if (!e.lines.some(l => l.startsWith(`**Status:** ${r.d} (${DATE})`))) die(`#${r.n} did not take`) }
  console.log('written and verified')
} else if (cmd === 'archive') {
  const before = readFileSync(LOG, 'utf8'), parts = split(before), h0 = heads(before).length
  const isResolved = p => p.n !== null && p.lines.some(l => /^\*\*Status:\*\* (ACTIONED|DECLINED) \(\d{4}-\d\d-\d\d\)/.test(l))
  const resolved = parts.filter(isResolved)
  const archPath = join(ARCH_DIR, `log-${DATE}.md`)
  if (!existsSync(archPath)) die(`${archPath} missing — create it with the log's header first`)
  const arch0 = readFileSync(archPath, 'utf8'), a0 = heads(arch0).length
  /* The moved entries keep their bytes. A "## …" section heading that trails an entry belongs to the NEXT
     section, so it stays in the live log, in its place. */
  const keep = [], moved = []
  for (const p of parts) {
    if (!isResolved(p)) { keep.push(p); continue }
    const sec = p.lines.findIndex((l, k) => k > 0 && /^## /.test(l))
    moved.push((sec < 0 ? p.lines : p.lines.slice(0, sec)).join('\n').replace(/\n+$/, ''))
    if (sec >= 0) keep.push({ n: null, lines: p.lines.slice(sec) })
  }
  const liveAfter = join_(keep)
  const archAfter = arch0.replace(/\n*$/, '\n') + '\n' + moved.join('\n\n') + '\n'
  const h1 = heads(liveAfter).length, a1 = heads(archAfter).length
  console.log(`${resolved.length} resolved entr(ies): ${resolved.map(p => '#' + p.n).join(' ')}; live ${h0} → ${h1}, archive ${a0} → ${a1}`)
  if (h1 !== h0 - resolved.length || a1 !== a0 + resolved.length) die('counts do not balance — nothing written')
  if (!write) { console.log('dry run — add --write'); process.exit(0) }
  if (readFileSync(LOG, 'utf8') !== before) die('the live log changed while preparing — re-run')
  copyFileSync(LOG, join(tmpdir(), `skill-log-backup-${Date.now()}.md`))
  writeFileSync(archPath, archAfter); writeFileSync(LOG, liveAfter)
  if (heads(readFileSync(LOG, 'utf8')).length !== h1 || heads(readFileSync(archPath, 'utf8')).length !== a1) die('verification failed — restore from the backup in the temp folder')
  console.log('written and verified')
} else die('usage: statuses <groups|all> [--write] | archive [--write]')
