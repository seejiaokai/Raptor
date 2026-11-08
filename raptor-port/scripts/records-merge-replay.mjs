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
 * equal, or every difference listed, each line marked when neither parent holds it (a line the chat wrote in the merge);
 * plus the count of each identity in both: `<!-- now:` markers, `### Observation N` numbers, ledger rows, `[ID]` headings,
 * D-numbers. NOTHING is judged fine here: every difference is listed for the host and the readers. */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'
import { observationHeads } from './docsize-rulings.mjs'

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

/* ---------- the replay ---------- */
const listed = JSON.parse(readFileSync(LIST, 'utf8'))
const heldOut = clashing(listed.window.until, null).filter(m => !listed.merges.some(x => x.merge === m.merge))
const work = mkdtempSync(join(tmpdir(), 'records-merge-replay-'))
const clone = join(work, 'repo')
execFileSync('git', ['clone', '-q', '--shared', '--no-checkout', REPO, clone], { stdio: 'ignore' })
const cg = (...a) => git(clone, ...a)
cg('config', 'core.autocrlf', 'false'); cg('config', 'user.email', 'replay@example.invalid'); cg('config', 'user.name', 'replay')
spawnSync('git', ['remote', 'remove', 'origin'], { cwd: clone })

const IDS = {
  'now markers': t => t.match(/^<!-- now:\S+ -->/gm) || [],
  'Observation numbers': t => observationHeads(t).map(h => `Observation ${h.n}`), // the shared definition (Astra 5)
  'ledger rows': t => { const a = t.indexOf('<!-- ledger:rows -->'), b = t.indexOf('<!-- /ledger:rows -->'); return a < 0 || b < 0 ? [] : t.slice(a, b).split('\n').filter(l => l.startsWith('|')) },
  '[ID] headings': t => t.match(/^#{2,3} \[[A-Z0-9-]+\]/gm) || [],
  'D-numbers': t => t.match(/\bD\d{1,4}\b/g) || [],
}
const tally = a => a.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map())
function idDiffs(mine, chat) {
  const out = []
  for (const [name, f] of Object.entries(IDS)) {
    const a = tally(f(mine)), b = tally(f(chat)), diffs = []
    for (const k of new Set([...a.keys(), ...b.keys()])) if ((a.get(k) || 0) !== (b.get(k) || 0)) diffs.push(`${k}: step ${a.get(k) || 0}, chat ${b.get(k) || 0}`)
    if (diffs.length) out.push(`${name} — ${diffs.slice(0, 12).join('; ')}${diffs.length > 12 ? `; … ${diffs.length - 12} more` : ''}`)
  }
  return out
}
function lineDiff(mine, chat, p1Text, p2Text) {
  const a = join(work, 'mine'), b = join(work, 'chat')
  writeFileSync(a, mine); writeFileSync(b, chat)
  const r = spawnSync('git', ['diff', '--no-index', '--no-color', '-U0', '--diff-algorithm=histogram', a, b], { encoding: 'utf8', maxBuffer: 256 << 20 })
  const parents = new Set([...p1Text.split('\n'), ...p2Text.split('\n')])
  return r.stdout.split('\n').filter(l => /^[-+@]/.test(l) && !/^(---|\+\+\+) /.test(l)).map(l => {
    if (l.startsWith('@@')) return l.replace(/ @@.*$/, ' @@')
    const body = l.slice(1)
    const mark = l[0] === '+' ? (parents.has(body) ? 'chat kept' : 'chat wrote (in neither parent)') : (parents.has(body) ? 'step kept' : 'step wrote')
    return `${l[0]} ${body.length > 160 ? body.slice(0, 157) + '...' : body}   «${mark}»`
  })
}

function replay(m) {
  spawnSync('git', ['merge', '--abort'], { cwd: clone })
  cg('reset', '-q', '--hard'); cg('clean', '-q', '-fdx'); cg('checkout', '-q', '-f', '--detach', m.p1)
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
  const files = settled.map(({ f, part }) => {
    if (part) return { f, part: true }
    const mine = readFileSync(join(clone, f), 'utf8')
    const chat = tryGit(clone, 'cat-file', 'blob', `${m.merge}:${f}`)
    if (chat === null) return { f, gone: true }
    if (mine === chat) return { f, same: true }
    const p1Text = tryGit(clone, 'cat-file', 'blob', `${m.p1}:${f}`) || '', p2Text = tryGit(clone, 'cat-file', 'blob', `${m.p2}:${f}`) || ''
    return { f, same: false, lines: lineDiff(mine, chat, p1Text, p2Text), ids: idDiffs(mine, chat) }
  })
  const renumbers = [...out.matchAll(/^ {2}renumbered in .*$/gm)].map(x => x[0].trim())
  return { ...m, gitStatus: st.status, stepCode: r.status, unmerged, files, left: [...left], notRecord, rulings, renumbers, crashed: r.status === 1 ? out.trim().split('\n').slice(-3).join(' / ') : null }
}

const runAll = ms => ms.map((m, i) => { process.stderr.write(`\r  ${i + 1}/${ms.length} ${m.merge.slice(0, 9)}   `); return replay(m) })
const main = runAll(listed.merges), held = runAll(heldOut)
process.stderr.write('\n')
spawnSync('git', ['merge', '--abort'], { cwd: clone })
rmSync(work, { recursive: true, force: true })

/* ---------- the report ---------- */
const short = id => id.slice(0, 9)
function section(title, rs) {
  const L = [`## ${title}`, '']
  const all = rs.filter(r => r.unmerged.length && !r.left.length && !r.notRecord.length && !r.rulings.length && !r.crashed)
  const part = rs.filter(r => !all.includes(r) && r.files.length)
  const none = rs.filter(r => !all.includes(r) && !part.includes(r))
  const files = rs.flatMap(r => r.files)
  const diff = rs.flatMap(r => r.files.filter(f => f.same === false).map(f => ({ r, f })))
  L.push(`- merges replayed: **${rs.length}**`)
  L.push(`- the step settled EVERYTHING git left (nothing for the chat): **${all.length}**`)
  L.push(`- the step settled part, the rest left for the chat (rulings files, app code or a record it leaves): **${part.length}**`)
  L.push(`- the step settled nothing (every clash outside what it settles, or left): **${none.length}**`)
  L.push(`- files it settled whole: **${files.filter(f => !f.part).length}** — the same bytes as the chat's: **${files.filter(f => f.same).length}**, different: **${diff.length}**; settled in part (a record left): **${files.filter(f => f.part).length}**`)
  L.push(`- the step stopped with an error: **${rs.filter(r => r.crashed).length}**${rs.filter(r => r.crashed).map(r => ` (${short(r.merge)}: ${r.crashed})`).join('')}`)
  L.push('')
  L.push('| merge | parents | git left | the step settled | left for the chat |', '|---|---|---|---|---|')
  for (const r of rs) L.push(`| ${short(r.merge)} | ${short(r.p1)} ← ${short(r.p2)} | ${r.unmerged.join(', ') || '—'} | ${r.files.map(f => `${f.f}${f.part ? ' (part)' : f.same ? ' (=)' : f.gone ? ' (gone in the merge)' : ' (≠)'}`).join(', ') || '—'} | ${[...r.left, ...r.notRecord, ...r.rulings].join(', ') || '—'} |`)
  L.push('')
  if (rs.some(r => r.renumbers.length)) { L.push('### Renumbers the step made', ''); for (const r of rs) for (const x of r.renumbers) L.push(`- ${short(r.merge)}: ${x}`); L.push('') }
  L.push(`### Every file whose settled result differs from the chat's (${diff.length})`, '')
  L.push('Each line: `-` the step wrote it and the chat\'s file lacks it, `+` the chat\'s file has it and the step\'s lacks it; «chat wrote» marks a line neither parent holds (written in the merge itself). None is judged here.', '')
  for (const { r, f } of diff) {
    L.push(`#### ${short(r.merge)} — ${f.f}`, '')
    if (f.ids.length) { L.push('Identity counts that differ:', ''); for (const x of f.ids) L.push(`- ${x}`); L.push('') } else L.push('Identity counts: all equal.', '')
    L.push('```diff', ...f.lines.slice(0, 80), ...(f.lines.length > 80 ? [`… ${f.lines.length - 80} more lines`] : []), '```', '')
  }
  return L
}
const report = [
  `<!-- generated by raptor-port/scripts/records-merge-replay.mjs — the list: ${listed.merges.length} merges, ${listed.window.since} to ${listed.window.until} (${listed.window.by}) -->`,
  '', ...section(`The list — 8 Nov 26's clashing merges to ${listed.window.until}`, main), ...section(`The held-out merges — committed after the list was cut (${heldOut.length})`, held)]
const outFile = opt('--out')
if (outFile) {
  const prev = existsSync(outFile) ? readFileSync(outFile, 'utf8') : ''
  const cutAt = prev.indexOf('<!-- generated by raptor-port/scripts/records-merge-replay.mjs')
  writeFileSync(outFile, (cutAt >= 0 ? prev.slice(0, cutAt) : prev) + report.join('\n') + '\n')
  console.log(`records-merge-replay: the report → ${outFile}`)
} else console.log(report.join('\n'))
