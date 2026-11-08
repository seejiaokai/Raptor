#!/usr/bin/env node
/* THE SETTLE STEP'S REPLAY ON REAL MERGES — [MERGE-ONCE-RECORDS] part 2, "before it is trusted" (the plan's §After the red
 * team; Astra 10, Opus 10). The step is run on the real clashing merges of 8 Nov 26, exactly as a chat would have run it,
 * and every file it settles is compared with what the chat committed.
 *
 *   node raptor-port/scripts/records-merge-replay.mjs --list [--until <ISO time>]   write the list (records-merge-replay.json)
 *   node raptor-port/scripts/records-merge-replay.mjs [--out <file.md>]             replay the list, then the held-out merges
 *
 * THE LIST is data, committed beside this script, so the corpus is reproducible (Astra 10: "the day's merges" found 113
 * one hour and 143 the next): every two-parent merge on any branch whose COMMITTER date falls in the window — Singapore
 * time, +08:00, from 8 Nov 26 00:00 to the moment the list was cut — that clashes when merged again (`git merge-tree
 * --write-tree` of its two parents exits 1). THE HELD-OUT SET is every clashing merge committed after the cut, found at
 * replay time: the step's rules were written before they existed.
 *
 * EACH MERGE, in one throwaway clone in the temp folder (never this checkout's index), its remote branches removed so the
 * renumber sees only the two sides as the chat's own merge did (the other open branches of that moment cannot be
 * rebuilt): check out the first parent, `git merge --no-commit --no-ff <second parent>`, run the step (`--no-checks`: the
 * checks' put-back would hide what it settled), and compare each file it settled with the merge's committed file — bytes
 * equal, or every difference listed, each line marked when neither parent holds it (a line the chat wrote in the merge).
 * A file the step settled IN PART is compared record by record (a handoff block, a skill note, a `## ` section, an `[ID]`
 * item): every record free of git's marks against the chat's record of the same name (Astra 6 of the code read).
 *
 * THE CHECK THAT CAN FAIL (Opus 8 of the code read): in every file the step settled, whole or in part (its left regions
 * set aside), no identity — a skill-note number, a `<!-- now:` marker, an `[ID]` heading, a ruling's D-number row, a `## `
 * heading — may stand MORE often than in the chat's file and in either parent. One that does is a record doubled by the
 * step: it is named, and the replay exits 1. Everything else is listed for the host and the readers, never judged fine
 * here: the sheet summarises, and every difference is kept whole, untruncated, in a companion file beside the sheet
 * (`--out <sheet>.md` → `<sheet>-diffs.md`; Astra 6). */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'
import { closedFencedFlags, OBS_HEAD, observationHeads } from './docsize-rulings.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..')
const LIST = join(HERE, 'records-merge-replay.json')
const STEP = join(HERE, 'records-merge.mjs')
const args = process.argv.slice(2)
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', maxBuffer: 256 << 20, stdio: ['ignore', 'pipe', 'ignore'] })
const tryGit = (cwd, ...a) => { try { return git(cwd, ...a) } catch { return null } }
const START = '2026-11-08T00:00:00+08:00'

/* every clashing two-parent merge committed in [since, until) */
function clashing(since, until) {
  const out = []
  const log = git(REPO, 'log', '--merges', '--all', `--since=${since}`, ...(until ? [`--until=${until}`] : []), '--format=%H %P|%cI')
  for (const l of log.split('\n').filter(Boolean)) {
    const [ids, when] = l.split('|'), [merge, p1, p2, extra] = ids.split(' ')
    if (extra || !p2) continue
    if (until && new Date(when) >= new Date(until)) continue
    const r = spawnSync('git', ['merge-tree', '--write-tree', '--name-only', '--no-messages', p1, p2], { cwd: REPO, encoding: 'utf8' })
    if (r.status === 1) out.push({ merge, p1, p2, committed: when, clashed: r.stdout.split('\n').slice(1).filter(Boolean) })
  }
  return out.reverse()
}

if (args.includes('--list')) {
  /* now, written as Singapore wall time */
  const until = opt('--until') || new Date(Date.now() + 8 * 3600e3).toISOString().replace(/\.\d+Z$/, '+08:00')
  const merges = clashing(START, until)
  writeFileSync(LIST, JSON.stringify({ window: { since: START, until, by: 'committer date, Singapore time (+08:00)' }, note: 'every two-parent merge on any branch in the window whose two parents clash when merged again (git merge-tree --write-tree exits 1); the merge, its first and second parent, its committer time and the paths that clashed', merges }, null, 1) + '\n')
  console.log(`records-merge-replay: ${merges.length} clashing merges from ${START} to ${until} → ${LIST}`)
  process.exit(0)
}

/* ---------- reading a file the step wrote ---------- */
const MARK = /^(<{7}|\|{7}|={7}|>{7})( |\r?$)/
/* the text with git's clash regions (marks included) taken out — what the step itself settled */
function withoutRegions(t) {
  const out = []; let inside = false
  for (const l of t.split('\n')) {
    if (/^<{7}( |\r?$)/.test(l)) { inside = true; continue }
    if (inside) { if (/^>{7}( |\r?$)/.test(l)) inside = false; continue }
    out.push(l)
  }
  return out.join('\n')
}
/* records by name — a handoff block, a skill note, a `## ` section, an `[ID]` item; a clash region that starts at a
   record's start is a record of its own, one inside a record marks that record; fences are text */
const recKey = l => { let m; if ((m = /^<!-- now:(\S+) -->\s*$/.exec(l))) return `now:${m[1]}`; if ((m = OBS_HEAD.exec(l))) return `obs:${m[1]}`; if (/^## /.test(l)) return `sec:${l.trim()}`; if ((m = /^#{2,3} \[([A-Z0-9-]+)\]/.exec(l))) return `id:${m[1]}`; return null }
function records(t) {
  const ls = t.split('\n').map(l => l.replace(/\r$/, '')), fenced = closedFencedFlags(ls), recs = []
  let cur = { key: 'head', lines: [] }, inside = false, boundary = false, n = 0
  const start = key => { recs.push(cur); cur = { key, lines: [] } }
  ls.forEach((l, i) => {
    if (!inside && /^<{7}( |$)/.test(l)) {
      inside = true
      const next = ls[i + 1] ?? ''
      boundary = !!(recKey(next) || MARK.test(next))
      if (boundary) start(`region ${++n}`)
    } else if (inside) { if (/^>{7}( |$)/.test(l)) { inside = false; cur.lines.push(l); cur.marks = true; if (boundary) start(`after region ${n}`); return } }
    else if (!fenced[i]) { const k = recKey(l); if (k) start(k) }
    if (inside || MARK.test(l)) cur.marks = true
    cur.lines.push(l)
  })
  recs.push(cur)
  const map = new Map()
  for (const r of recs) { if (!r.lines.length && r.key.startsWith('after region')) continue; let k = r.key, j = 1; while (map.has(k)) k = `${r.key} (${++j})`; map.set(k, r) }
  return map
}

/* ---------- the identities ---------- */
const IDS = {
  'skill-note numbers': t => observationHeads(t).map(h => `Observation ${h.n}`), // the shared definition (Astra 5)
  'now markers': t => t.match(/^<!-- now:\S+ -->/gm) || [],
  '[ID] headings': t => t.match(/^#{2,3} \[[A-Z0-9-]+\]/gm) || [],
  'ruling rows': t => (t.match(/^\|\s*D\d+\s*\|/gm) || []).map(s => s.replace(/\s+/g, '')),
  '## headings': t => (t.match(/^## .*$/gm) || []).map(s => s.replace(/\r$/, '').trim()),
  /* round 3 (Opus re-read 6): the plan's "before it is trusted" named the ledger rows among the identities */
  'ledger rows': t => { const a = t.indexOf('<!-- ledger:rows -->'), b = t.indexOf('<!-- /ledger:rows -->'); return a < 0 || b < 0 ? [] : t.slice(a, b).split('\n').map(l => l.replace(/\r$/, '')).filter(l => l.startsWith('|')) },
}
/* round 3 (Astra re-read 3, Opus re-read 6): the generic guard — every line that is not blank is counted, so a doubled
   line with no identity (a file-map row, a line moved into a second entry) is seen too */
const everyLine = t => t.split('\n').map(l => l.replace(/\r$/, '')).filter(l => l.trim())
const tally = a => a.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map())
/* counts that differ from the chat's (listed), and counts above the chat's AND both parents' (a failure) */
function identities(mine, chat, p1Text, p2Text, renumbered = new Set()) {
  const differ = [], doubled = []
  for (const [name, f] of Object.entries(IDS)) {
    const a = tally(f(mine)), b = tally(f(chat)), x = tally(f(p1Text)), y = tally(f(p2Text)), diffs = []
    for (const k of new Set([...a.keys(), ...b.keys()])) {
      const s = a.get(k) || 0, c = b.get(k) || 0
      if (s !== c) diffs.push(`${k}: step ${s}, chat ${c}`)
      /* a number the step gave a renumbered note stands once and in no parent — that is the renumber, not a doubling */
      if (s > Math.max(c, x.get(k) || 0, y.get(k) || 0) && !(s === 1 && renumbered.has(k))) doubled.push(`${name} — "${k}" stands ${s} times in the step's file; the chat's ${c}, the first parent's ${x.get(k) || 0}, the second's ${y.get(k) || 0}`)
    }
    if (diffs.length) differ.push(`${name} — ${diffs.join('; ')}`)
  }
  {
    const a = tally(everyLine(mine)), b = tally(everyLine(chat)), x = tally(everyLine(p1Text)), y = tally(everyLine(p2Text))
    /* exempt only the heading line of a note the step renumbered: it stands once, under a number no parent gave it */
    const renumberedHead = l => { const m = OBS_HEAD.exec(l); return !!m && renumbered.has(`Observation ${m[1]}`) }
    for (const [k, s] of a) {
      const c = b.get(k) || 0
      if (s > c && s > (x.get(k) || 0) && s > (y.get(k) || 0) && !renumberedHead(k)) doubled.push(`every line — "${k.slice(0, 120)}" stands ${s} times in the step's file; the chat's ${c}, the first parent's ${x.get(k) || 0}, the second's ${y.get(k) || 0}`)
    }
  }
  return { differ, doubled }
}

/* ---------- the comparison ---------- */
let work
function lineDiff(mine, chat, p1Text, p2Text) {
  const a = join(work, 'mine'), b = join(work, 'chat')
  writeFileSync(a, mine); writeFileSync(b, chat)
  const r = spawnSync('git', ['diff', '--no-index', '--no-color', '-U0', '--diff-algorithm=histogram', a, b], { encoding: 'utf8', maxBuffer: 256 << 20 })
  const parents = new Set([...p1Text.split('\n'), ...p2Text.split('\n')])
  return r.stdout.split('\n').filter(l => /^[-+@]/.test(l) && !/^(---|\+\+\+) /.test(l)).map(l => {
    if (l.startsWith('@@')) return l.replace(/ @@.*$/, ' @@')
    const body = l.slice(1)
    const mark = l[0] === '+' ? (parents.has(body) ? 'chat kept' : 'chat wrote (in neither parent)') : (parents.has(body) ? 'step kept' : 'step wrote')
    return `${l[0]} ${body}   «${mark}»`
  })
}
function compare(clone, m, f, part, renumbered) {
  const mine = readFileSync(join(clone, f), 'utf8')
  const chat = tryGit(clone, 'cat-file', 'blob', `${m.merge}:${f}`)
  if (chat === null) return { f, part, gone: true, doubled: [] }
  const p1Text = tryGit(clone, 'cat-file', 'blob', `${m.p1}:${f}`) || '', p2Text = tryGit(clone, 'cat-file', 'blob', `${m.p2}:${f}`) || ''
  const settled = part ? withoutRegions(mine) : mine
  const { differ, doubled } = identities(settled, chat, p1Text, p2Text, renumbered)
  if (!part) return mine === chat ? { f, same: true, doubled } : { f, same: false, lines: lineDiff(mine, chat, p1Text, p2Text), ids: differ, doubled }
  /* in part: each record the step settled (free of marks) against the chat's record of the same name */
  const ours = records(mine), theirs = records(chat), recs = []
  for (const [k, r] of ours) {
    if (r.marks) { recs.push({ k, left: true }); continue }
    const c = theirs.get(k), text = r.lines.join('\n')
    if (!c) recs.push({ k, same: false, lines: [`(the chat's file has no record "${k}")`, ...r.lines.map(l => `- ${l}`)] })
    else if (c.lines.join('\n') === text) recs.push({ k, same: true })
    else recs.push({ k, same: false, lines: lineDiff(text + '\n', c.lines.join('\n') + '\n', p1Text, p2Text) })
  }
  return { f, part: true, recs, ids: differ, doubled }
}

function replay(clone, m) {
  spawnSync('git', ['merge', '--abort'], { cwd: clone })
  git(clone, 'reset', '-q', '--hard'); git(clone, 'clean', '-q', '-fdx'); git(clone, 'checkout', '-q', '-f', '--detach', m.p1)
  const st = spawnSync('git', ['merge', '--no-commit', '--no-ff', m.p2], { cwd: clone, encoding: 'utf8' })
  mkdirSync(join(clone, 'raptor-port', 'scripts'), { recursive: true })
  copyFileSync(STEP, join(clone, 'raptor-port', 'scripts', 'records-merge.mjs'))
  copyFileSync(join(HERE, 'docsize-rulings.mjs'), join(clone, 'raptor-port', 'scripts', 'docsize-rulings.mjs'))
  const unmerged = [...new Set((tryGit(clone, 'diff', '--name-only', '--diff-filter=U') || '').split('\n').filter(Boolean))]
  const r = spawnSync(process.execPath, ['raptor-port/scripts/records-merge.mjs', '--no-checks'], { cwd: clone, encoding: 'utf8', maxBuffer: 256 << 20 })
  const out = r.stdout + r.stderr
  const settled = [...out.matchAll(/^ {2}settled: (\S+)( \(in part\))?$/gm)].map(x => ({ f: x[1], part: !!x[2] }))
  const left = new Set([...out.matchAll(/^ {2}LEFT for you in (\S+):$/gm)].map(x => x[1]))
  const notRecord = [...out.matchAll(/^ {2}not a record file — yours to settle: (\S+)$/gm)].map(x => x[1])
  const rulings = (/^ {2}rulings files, not touched here: (.*)$/m.exec(out) || [, ''])[1].split(', ').filter(Boolean)
  const renumbers = [...out.matchAll(/^ {2}renumbered in .*$/gm)].map(x => x[0].trim())
  const renumbered = new Set(renumbers.flatMap(x => { const n = /→ (\d+) /.exec(x); return n ? [`Observation ${n[1]}`] : [] }))
  const files = settled.map(({ f, part }) => compare(clone, m, f, part, renumbered))
  return { ...m, gitStatus: st.status, stepCode: r.status, unmerged, files, left: [...left], notRecord, rulings, renumbers, crashed: r.status === 1 ? out.trim().split('\n').slice(-3).join(' / ') : null }
}

/* ---------- the run ---------- */
const listed = JSON.parse(readFileSync(LIST, 'utf8'))
const heldOut = clashing(listed.window.until, null).filter(m => !listed.merges.some(x => x.merge === m.merge))
work = mkdtempSync(join(tmpdir(), 'records-merge-replay-'))
const clone = join(work, 'repo')
execFileSync('git', ['clone', '-q', '--shared', '--no-checkout', REPO, clone], { stdio: 'ignore' })
git(clone, 'config', 'core.autocrlf', 'false'); git(clone, 'config', 'user.email', 'replay@example.invalid'); git(clone, 'config', 'user.name', 'replay')
spawnSync('git', ['remote', 'remove', 'origin'], { cwd: clone })
/* the clone's own local branch (today's main) goes too: the step counts local branches for the next note number (Opus 6),
   and today's notes did not exist when the chat merged */
git(clone, 'checkout', '-q', '--detach', 'HEAD')
for (const b of (tryGit(clone, 'for-each-ref', '--format=%(refname:short)', 'refs/heads') || '').split('\n').filter(Boolean)) git(clone, 'branch', '-q', '-D', b)
const runAll = ms => ms.map((m, i) => { process.stderr.write(`\r  ${i + 1}/${ms.length} ${m.merge.slice(0, 9)}   `); return replay(clone, m) })
const main = runAll(listed.merges), held = runAll(heldOut)
process.stderr.write('\n')
spawnSync('git', ['merge', '--abort'], { cwd: clone })
rmSync(work, { recursive: true, force: true })

/* ---------- the report: the sheet's summary, and every difference whole in the companion ---------- */
const outFile = opt('--out')
const diffsFile = outFile ? join(dirname(outFile), basename(outFile).replace(/\.md$/, '') + '-diffs.md') : null
const short = id => id.slice(0, 9)
const anchor = (r, f) => `${short(r.merge)} — ${f.f}`
const slug = s => s.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/ /g, '-')
const failures = []
function section(title, rs, C) {
  const L = [`## ${title}`, '']
  C.push(`## ${title}`, '')
  const all = rs.filter(r => r.unmerged.length && !r.left.length && !r.notRecord.length && !r.rulings.length && !r.crashed)
  const part = rs.filter(r => !all.includes(r) && r.files.length)
  const none = rs.filter(r => !all.includes(r) && !part.includes(r))
  const files = rs.flatMap(r => r.files), whole = files.filter(f => !f.part), parts = files.filter(f => f.part)
  const diff = rs.flatMap(r => r.files.filter(f => f.same === false || (f.part && f.recs.some(x => x.same === false))).map(f => ({ r, f })))
  const recs = parts.flatMap(f => f.recs)
  const doubled = rs.flatMap(r => r.files.flatMap(f => f.doubled.map(d => `${short(r.merge)} ${f.f}: ${d}`)))
  failures.push(...doubled)
  /* round 3 (Astra re-read 3, Opus re-read 6): a replayed merge whose step stopped with an error fails the run */
  failures.push(...rs.filter(r => r.crashed).map(r => `${short(r.merge)}: the step stopped with an error — ${r.crashed}`))
  L.push(`- merges replayed: **${rs.length}**`)
  L.push(`- the step settled EVERYTHING git left (nothing for the chat): **${all.length}**`)
  L.push(`- the step settled part, the rest left for the chat (rulings files, app code or a record it leaves): **${part.length}**`)
  L.push(`- the step settled nothing (every clash outside what it settles, or left): **${none.length}**`)
  L.push(`- files it settled whole: **${whole.length}** — the same bytes as the chat's: **${whole.filter(f => f.same).length}**, different: **${whole.filter(f => f.same === false).length}**`)
  L.push(`- files it settled in part: **${parts.length}** — their records it settled, compared with the chat's: **${recs.filter(x => !x.left).length}** (the same: **${recs.filter(x => x.same).length}**, different: **${recs.filter(x => x.same === false).length}**); records left in git's marks: **${recs.filter(x => x.left).length}**`)
  L.push(`- **identities the step's file holds more often than the chat's and both parents' (a doubled record — the replay fails on any): ${doubled.length}**${doubled.map(d => `\n  - ${d}`).join('')}`)
  L.push(`- the step stopped with an error: **${rs.filter(r => r.crashed).length}**${rs.filter(r => r.crashed).map(r => ` (${short(r.merge)}: ${r.crashed})`).join('')}`)
  L.push('')
  L.push('| merge | parents | git left | the step settled | left for the chat |', '|---|---|---|---|---|')
  for (const r of rs) L.push(`| ${short(r.merge)} | ${short(r.p1)} ← ${short(r.p2)} | ${r.unmerged.join(', ') || '—'} | ${r.files.map(f => `${f.f}${f.part ? ` (part: ${f.recs.filter(x => x.same).length} =, ${f.recs.filter(x => x.same === false).length} ≠, ${f.recs.filter(x => x.left).length} left)` : f.same ? ' (=)' : f.gone ? ' (gone in the merge)' : ' (≠)'}`).join(', ') || '—'} | ${[...r.left, ...r.notRecord, ...r.rulings].join(', ') || '—'} |`)
  L.push('')
  if (rs.some(r => r.renumbers.length)) { L.push('### Renumbers the step made', ''); for (const r of rs) for (const x of r.renumbers) L.push(`- ${short(r.merge)}: ${x}`); L.push('') }
  L.push(`### Every file whose settled result differs from the chat's (${diff.length})`, '')
  L.push(`Each with its identity counts that differ and its count of differing lines; every line of every difference, whole, is in the companion file${diffsFile ? `, [${basename(diffsFile)}](${basename(diffsFile)})` : ''}, under the same heading.`, '')
  C.push('Each line: `-` the step wrote it and the chat\'s file lacks it, `+` the chat\'s file has it and the step\'s lacks it; «chat wrote» marks a line neither parent holds (written in the merge itself). None is judged here. Nothing is shortened.', '')
  for (const { r, f } of diff) {
    const n = f.part ? f.recs.filter(x => x.same === false).reduce((a, x) => a + x.lines.filter(l => /^[-+]/.test(l)).length, 0) : f.lines.filter(l => /^[-+]/.test(l)).length
    L.push(`- **${anchor(r, f)}**${f.part ? ` (settled in part; records different: ${f.recs.filter(x => x.same === false).map(x => x.k).join(', ')})` : ''} — ${n} differing line(s)${diffsFile ? ` ([whole](${basename(diffsFile)}#${slug(anchor(r, f))}))` : ''}; identity counts: ${f.ids.length ? f.ids.join(' · ') : 'all equal'}`)
    C.push(`### ${anchor(r, f)}`, '')
    if (f.ids.length) { C.push('Identity counts that differ:', ''); for (const x of f.ids) C.push(`- ${x}`); C.push('') }
    if (f.part) for (const x of f.recs.filter(y => y.same === false)) C.push(`Record "${x.k}":`, '', '```diff', ...x.lines, '```', '')
    else C.push('```diff', ...f.lines, '```', '')
  }
  L.push('')
  return L
}
const C = [`# [MERGE-ONCE-RECORDS] — the replay's differences, whole (generated by raptor-port/scripts/records-merge-replay.mjs)`, '', `The companion of ${outFile ? `[${basename(outFile)}](${basename(outFile)})` : 'the replay report'}: every difference between a file the settle step wrote and the file the chat committed, with nothing shortened.`, '']
const report = [
  `<!-- generated by raptor-port/scripts/records-merge-replay.mjs — the list: ${listed.merges.length} merges, ${listed.window.since} to ${listed.window.until} (${listed.window.by}) -->`,
  '', ...section(`The list — 8 Nov 26's clashing merges to ${listed.window.until}`, main, C), ...section(`The held-out merges — committed after the list was cut (${heldOut.length})`, held, C)]
if (outFile) {
  const prev = existsSync(outFile) ? readFileSync(outFile, 'utf8') : ''
  const cutAt = prev.indexOf('<!-- generated by raptor-port/scripts/records-merge-replay.mjs')
  writeFileSync(outFile, (cutAt >= 0 ? prev.slice(0, cutAt) : prev) + report.join('\n') + '\n')
  writeFileSync(diffsFile, C.join('\n') + '\n')
  console.log(`records-merge-replay: the report → ${outFile}; every difference whole → ${diffsFile}`)
} else console.log(report.join('\n'))
if (failures.length) {
  console.error(`\nrecords-merge-replay: FAILED — ${failures.length} failure(s): an identity or a line the step's file holds more often than the chat's and both parents' (a doubled record), or a step that stopped with an error:`)
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}
