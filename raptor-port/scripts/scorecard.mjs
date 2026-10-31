#!/usr/bin/env node
/* THE TWO-WEEK SCORECARD — his D1409 (27 Oct 26), [REVIEW-LAYERS] step 1.
 *
 * Every two weeks the agent puts one page to him with three numbers, each beside the two weeks before:
 *   (a) the faults he found after a change went live,
 *   (b) the changes undone or redone within two weeks,
 *   (c) the merges into main in those two weeks.
 * Speed (c) counts only while (a) and (b) hold. The page's home: raptor-port/docs/bug-check-order.md §9a.
 *
 * Run (from anywhere in the repo):
 *   node raptor-port/scripts/scorecard.mjs                     three windows ending today
 *   node raptor-port/scripts/scorecard.mjs --end 2026-10-31    three windows ending that day (inclusive)
 *   node raptor-port/scripts/scorecard.mjs --list              also every item counted, window by window
 *   node raptor-port/scripts/scorecard.mjs --json              the same as JSON
 *   --ref <git ref>   the line of history read as "main" (default origin/main; main if there is no origin/main)
 *   --windows <n>     how many two-week windows (default 3: this one, the one before, the one before that)
 * It reads only this repository: git history and four record files. Nothing is fetched, nothing is written.
 *
 * WINDOWS. A window is 14 calendar days ending on --end inclusive, in the time zone of the repo's commits (+08:00 —
 * every commit on main carries it); the window before ends the day before this one starts, and so on.
 *
 * HOW EACH NUMBER IS COUNTED — the heuristics, plainly. Each is an approximation, and the page says so.
 *
 * (a) FAULTS HE FOUND. The project has no single list of his finds, so two records are read:
 *   1. The bug-check order §7.11, "the faults he found that a walk missed" (D1297, kept since 24 Oct 26) — every
 *      numbered lesson is one find of his, dated by the last date in its bold title (a title with no date that says
 *      "the same look" takes the date of the lesson before it).
 *   2. The backlog and its archive (OUTSTANDING.md, OUTSTANDING-ARCHIVE.md): every item heading ("### [ID] …") whose
 *      words mark it as his find — "his find", "his report", "his picture(s)", "his video", "his recording",
 *      "HIS FIND", "found by him", "he found" — dated by the first date in the heading. "His question" is NOT a find
 *      (a question is not a fault). A heading about a guide change drawn from a find ("from his find", "lines for the
 *      checking guide") is left out: its find has its own item.
 *   A lesson and an item that name the same ruling number (D…) are counted once.
 *   LIVE OR PREVIEW: the records seldom say whether he saw the fault on the live app or on a preview link before the
 *   merge. A find whose record says "preview", "pull request N", "look" (his look is, in this project, the look at a
 *   preview before "merge live") or "before merge" is counted as a PREVIEW find — for a lesson, read in its title and
 *   what happened, never in the lesson drawn from it; the rest are "live or not stated". The scorecard's (a) is that second count — an UPPER BOUND on the
 *   faults found after going live, since some of them were surely previews. Both are shown.
 *   And §7.11 began on 24 Oct 26: before it only the backlog headings are read, so earlier windows are undercounted.
 *
 * (b) UNDONE OR REDONE WITHIN TWO WEEKS.
 *   1. Reverts: a commit on main's history whose message says "This reverts commit <id>", where the reverted commit
 *      was already on main (live) when the revert landed, and had landed at most 14 days before it.
 *   2. Redone pull requests: a pull request merged in the window with ONE of its own commits (merges left out) that
 *      (i) changes the app's own code (raptor-port/src, test files and test helpers left out), (ii) says it fixes
 *      something (fix, fixes, fixed, re-fix, regression, broke, broken, fault, his report / find / picture / video /
 *      recording), and (iii) NAMES by its number ("pull request N", "PR N", "PR #N") an earlier pull request merged
 *      at most 14 days before, which changed at least one of the same app files. A bare "#N" is not enough: the
 *      project numbers its notes and skill observations that way too. By number only: a backlog id is shared by every
 *      phase of a long item, and records commits name earlier pull requests all the time — all three were tried on
 *      31 Oct 26 and counted bookkeeping as redos. So this is a FLOOR: a fix that does not name what it fixes is
 *      missed (most of his finds are fixed without naming the pull request that brought them).
 *   Shown beside it, NOT counted: "possible" redos — a pull request whose text says it fixes something, which names
 *   nothing, but more than half of whose app files were changed by one pull request merged in the 14 days before.
 *   File overlap alone over-reads in a project where many changes touch the same large files, so these are listed
 *   for a person to judge, not added up into the number.
 *
 * (c) MERGES. Pull requests landed on main, read from main's first-parent line and dated by the commit that landed
 *   them: GitHub's "Merge pull request #N …", a merge made on his PC ("Merge PR #N: …", late Sep 26) and a squash
 *   ("… (#N)"). Commits made straight onto main (no pull request) are not merges and are shown apart. Checked on
 *   31 Oct 26 against GitHub's own list of merged pull requests, window by window: the same, but for two GitHub
 *   counts as merged that never landed on that line by themselves — #427 (its commit went in another way, 23 Sep 26)
 *   and #568 (merged into #569's branch, which then merged).
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(name)
const opt = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt }

const git = (args, opts = {}) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 28, ...opts })
const ROOT = git(['rev-parse', '--show-toplevel']).trim()
const g = (args) => git(['-C', ROOT, ...args])

const TZ_MS = 8 * 3600 * 1000 // +08:00, the zone of every commit on main
const DAY = 86400000
const today = new Date(Date.now() + TZ_MS).toISOString().slice(0, 10)
const END = opt('--end', today)
if (!/^\d{4}-\d{2}-\d{2}$/.test(END)) { console.error('--end wants a date as YYYY-MM-DD'); process.exit(2) }
const NWIN = Math.max(1, parseInt(opt('--windows', '3'), 10) || 3)
let REF = opt('--ref', '')
if (!REF) { try { g(['rev-parse', '--verify', '--quiet', 'origin/main']); REF = 'origin/main' } catch { REF = 'main' } }
const REF_SHA = g(['rev-parse', REF]).trim()

/* Day numbers: days since 1970-01-01 in +08:00, so windows compare as integers. */
const dayOf = (ymd) => Math.floor(Date.parse(ymd + 'T00:00:00Z') / DAY)
const ymdOf = (day) => new Date(day * DAY).toISOString().slice(0, 10)
const dayOfIso = (iso) => Math.floor((Date.parse(iso) + TZ_MS) / DAY)
const endDay = dayOf(END)
const windows = Array.from({ length: NWIN }, (_, k) => ({ from: endDay - 14 * k - 13, to: endDay - 14 * k }))
const winIndex = (day) => windows.findIndex((w) => day >= w.from && day <= w.to)
const earliest = windows[NWIN - 1].from

/* Dates as the records write them: "24 Oct 26", "25–27 Oct 26". */
const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }
const DATE_RE = /(?:(\d{1,2})\s*[–-]\s*)?(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{2})\b/g
const recDay = (d, mon, yy) => dayOf(`20${yy}-${String(MONTHS[mon]).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
const datesIn = (text) => [...text.matchAll(DATE_RE)].map((m) => recDay(m[2], m[3], m[4]))
const dNums = (text) => new Set([...text.matchAll(/\bD(\d{2,5})\b/g)].map((m) => 'D' + m[1]))
// "His look" is this project's word for his look at a preview before "merge live" (the bug-check order's last step).
const PREVIEW_RE = /preview|pull request \d+|\bPR \d+|\blook\b|before (?:the )?merge/i

/* ---------- (a) his finds ---------- */
function lessons() {
  const p = join(ROOT, 'raptor-port/docs/bug-check-order.md')
  const text = readFileSync(p, 'utf8')
  const start = text.indexOf('**7.11 ')
  if (start < 0) return []
  const end = text.indexOf('\n## ', start)
  const block = text.slice(start, end < 0 ? undefined : end)
  const out = []
  // Each lesson: a line "N. **title.**" and its body up to the next numbered line.
  const parts = block.split(/\n(?=\d{1,3}\. \*\*)/).slice(1)
  let prev = null
  for (const part of parts) {
    const m = part.match(/^(\d{1,3})\. \*\*([\s\S]*?)\*\*/)
    if (!m) continue
    const title = m[2].replace(/\s+/g, ' ')
    // Where he saw it is read from the title and what happened, never from the lesson drawn ("**Lesson:** … before merge").
    const told = part.split('**Lesson:**')[0]
    const ds = datesIn(title)
    // "(D1294, the same look)" — a lesson with no date of its own takes the one before it, which it says it shares.
    const same = !ds.length && /\bthe same\b/i.test(title) && prev
    if (!ds.length && !same) continue
    const day = ds.length ? ds[ds.length - 1] : prev.day
    const item = { source: `§7.11 lesson ${m[1]}`, day, title: title.slice(0, 160), d: dNums(title), preview: PREVIEW_RE.test(told) || (same ? prev.preview : false) }
    out.push(item)
    prev = item
  }
  return out
}
const FIND_RE = /\b(?:his (?:find|report|pictures?|video|recording)|found by him|he found)\b/i
// Left out: a guide change drawn from a find, and a fault the WALK found while fixing his ("the walk of his video's fix").
const DERIVED_RE = /from his find|lines? for the checking guide|guide gains a line|the walk of his/i
function backlogFinds() {
  const out = []
  for (const f of ['OUTSTANDING.md', 'OUTSTANDING-ARCHIVE.md']) {
    const p = join(ROOT, f)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      if (!line.startsWith('### [')) continue
      const hit = line.match(FIND_RE)
      if (!hit || DERIVED_RE.test(line)) continue
      // Where and when he found it is read up to the end of the bracket, clause or dash that holds "his find"; what follows is the
      // item's later story ("BUILT … waiting for his look"), which is about the fix, not the find.
      const rest = line.slice(hit.index).search(/[);]| — /)
      const found = rest < 0 ? line : line.slice(0, hit.index + rest + 1)
      const ds = datesIn(found)
      if (!ds.length) continue
      const id = (line.match(/^### \[([^\]]+)\]/) || [])[1]
      out.push({ source: `${f} [${id}]`, day: ds[0], title: line.slice(4, 164), d: dNums(line), preview: PREVIEW_RE.test(found) })
    }
  }
  return out
}
function finds() {
  const ls = lessons()
  const bs = backlogFinds().filter((b) => ![...b.d].some((d) => ls.some((l) => l.d.has(d))))
  return [...ls, ...bs]
}

/* ---------- (c) merges, and the material for (b) ---------- */
const APP_FILE = (f) => f.startsWith('raptor-port/src/') && !/\.test\.[cm]?[jt]sx?$/.test(f) && !f.startsWith('raptor-port/src/testing/')
function firstParentLog() {
  const sinceDay = earliest - 15 // the 14 days before the first window, for (b)
  const raw = g(['log', REF, '--first-parent', `--since=${ymdOf(sinceDay)}T00:00:00+08:00`, '--format=%H%x1f%P%x1f%cI%x1f%s%x1e'])
  return raw.split('\x1e').map((r) => r.trim()).filter(Boolean).map((r) => {
    const [sha, parents, iso, subject] = r.split('\x1f')
    return { sha, parents: parents.split(' '), day: dayOfIso(iso), subject }
  })
}
// A pull request lands on main's first-parent line in one of three shapes: GitHub's merge ("Merge pull request #N
// from …"), a merge made on his PC while the checks ran there (late Sep 26 — "Merge PR #N: …"), or a squash ("… (#N)"
// at the end of a one-parent commit).
function prOf(c) {
  const merge = c.parents.length > 1 && (c.subject.match(/^Merge pull request #(\d+)/) || c.subject.match(/^Merge PR #(\d+)/))
  const squash = c.parents.length === 1 && c.subject.match(/\(#(\d+)\)\s*$/)
  const m = merge || squash
  if (!m) return null
  const files = g(['diff', '--name-only', c.parents[0], c.sha]).split('\n').filter(Boolean)
  // The pull request's title: GitHub's merge carries it in the body; the other two in the subject.
  const body = c.subject.startsWith('Merge pull request') ? g(['log', '-1', '--format=%b', c.sha]) : c.subject.replace(/^Merge PR #\d+:\s*/, '')
  // The pull request's own commits, merges left out (a "bring main in" merge names other pull requests in passing),
  // each with the app files it changed — a redo is judged commit by commit, below. A squash is one commit.
  const range = merge ? [`${c.parents[0]}..${c.parents[1]}`] : ['-1', c.sha]
  const commits = g(['log', '--no-merges', '--name-only', '--format=%x1e%B%x1f', ...range])
    .split('\x1e').filter((x) => x.trim()).map((x) => {
      const [msg, names = ''] = x.split('\x1f')
      return { msg, app: names.split('\n').map((f) => f.trim()).filter(APP_FILE) }
    })
  const title = body.split('\n').find((l) => l.trim()) || ''
  const ids = new Set([...title.matchAll(/\[([A-Z][A-Z0-9]+(?:-[A-Z0-9]+)+)\]/g)].map((x) => x[1]))
  return { n: Number(m[1]), sha: c.sha, day: c.day, title: title.trim(), files, app: new Set(files.filter(APP_FILE)), text: body + '\n' + commits.map((k) => k.msg).join('\n'), commits, ids }
}
const FIX_RE = /\b(?:fix|fixes|fixed|re-?fix(?:es|ed)?|regression|broke|broken|faults?|his (?:report|find|pictures?|video|recording))\b/i
// By its NUMBER only: a backlog id is shared by every phase of a long item (tried 31 Oct 26 — "[DB-READINESS] phase 7"
// read as a redo of phase 6), so naming one is not naming a redo.
const names = (text, p) => new RegExp(`(?:\\bpull request #?|\\bPR #?)${p.n}\\b`, 'i').test(text)
function redos(prs) {
  const counted = [], possible = []
  for (const m of prs) {
    if (winIndex(m.day) < 0 || !m.app.size || !FIX_RE.test(m.text)) continue
    const before = prs.filter((p) => p.n !== m.n && p.app.size && p.day <= m.day && p.day >= m.day - 14 && p.sha !== m.sha && isEarlier(p, m))
    // Counted only where ONE commit of it changes the app, says it fixes something and names the earlier pull request
    // (by number or by its backlog id) — so a records commit that only mentions an earlier pull request is not a redo.
    const named = before.filter((p) => m.commits.some((k) => k.app.some((f) => p.app.has(f)) && FIX_RE.test(k.msg) && names(k.msg, p)))
    if (named.length) { counted.push({ pr: m, of: named }); continue }
    const over = before.map((p) => ({ p, share: [...m.app].filter((f) => p.app.has(f)).length / m.app.size })).filter((x) => x.share > 0.5)
    if (over.length) possible.push({ pr: m, of: over.map((x) => x.p), share: Math.max(...over.map((x) => x.share)) })
  }
  return { counted, possible }
}
let ORDER = new Map()
const isEarlier = (p, m) => ORDER.get(p.sha) > ORDER.get(m.sha) // git log lists newest first
function reverts(log) {
  const out = []
  for (const c of log) {
    if (winIndex(c.day) < 0) continue
    const range = c.parents.length > 1 ? `${c.parents[0]}..${c.sha}` : `${c.sha}~1..${c.sha}`
    const raw = g(['log', '--format=%H%x1f%B%x1e', range])
    for (const r of raw.split('\x1e').map((x) => x.trim()).filter(Boolean)) {
      const [sha, msg] = r.split('\x1f')
      const m = msg.match(/This reverts commit ([0-9a-f]{7,40})/)
      if (!m) continue
      let live = false
      try { git(['-C', ROOT, 'merge-base', '--is-ancestor', m[1], c.parents[0]], { stdio: 'ignore' }); live = true } catch { live = false } // a reverted commit no longer in the history (a rewritten branch) is not live work
      if (!live) continue
      // When did the reverted commit land on main? The oldest first-parent commit that contains it.
      const landed = g(['log', REF, '--first-parent', '--ancestry-path', `${m[1]}..${c.parents[0]}`, '--format=%cI']).trim().split('\n').filter(Boolean).pop()
      const landedDay = landed ? dayOfIso(landed) : c.day
      if (c.day - landedDay <= 14) out.push({ day: c.day, revert: sha.slice(0, 9), of: m[1].slice(0, 9), subject: msg.split('\n')[0] })
    }
  }
  return out
}

const log = firstParentLog()
log.forEach((c, i) => ORDER.set(c.sha, i))
const prs = log.map(prOf).filter(Boolean)
const prShas = new Set(prs.map((p) => p.sha))
const direct = log.filter((c) => c.parents.length === 1 && !prShas.has(c.sha) && winIndex(c.day) >= 0)
const F = finds()
const R = reverts(log)
const D = redos(prs)

const rows = windows.map((w, k) => {
  const inW = (x) => winIndex(x.day) === k
  const f = F.filter(inW)
  return {
    window: `${ymdOf(w.from)} to ${ymdOf(w.to)}`,
    a_live_or_unstated: f.filter((x) => !x.preview).length,
    a_preview: f.filter((x) => x.preview).length,
    b_reverts: R.filter(inW).length,
    b_redone_prs: D.counted.filter((x) => inW(x.pr)).length,
    b_possible: D.possible.filter((x) => inW(x.pr)).length,
    c_merges: prs.filter(inW).length,
    direct_commits: direct.filter(inW).length,
    items: {
      finds: f.map((x) => `${ymdOf(x.day)} ${x.preview ? '(preview) ' : ''}${x.source} — ${x.title}`),
      reverts: R.filter(inW).map((x) => `${ymdOf(x.day)} ${x.revert} reverts ${x.of}: ${x.subject}`),
      redone: D.counted.filter((x) => inW(x.pr)).map((x) => `${ymdOf(x.pr.day)} #${x.pr.n} redoes ${x.of.map((p) => '#' + p.n).join(', ')} — ${x.pr.title.slice(0, 100)}`),
      possible: D.possible.filter((x) => inW(x.pr)).map((x) => `${ymdOf(x.pr.day)} #${x.pr.n} shares ${Math.round(x.share * 100)}% of its app files with ${x.of.map((p) => '#' + p.n).join(', ')} — ${x.pr.title.slice(0, 100)}`),
      merges: prs.filter(inW).map((p) => `${ymdOf(p.day)} #${p.n}`),
    },
  }
})

if (flag('--json')) {
  console.log(JSON.stringify({ end: END, ref: REF, refSha: REF_SHA, windows: rows }, null, 2))
} else {
  console.log(`Scorecard — windows of 14 days ending ${END}; main read at ${REF} ${REF_SHA.slice(0, 9)}`)
  console.log('window                     (a) finds live/unstated  (preview)  (b) reverts + redone PRs  (possible)  (c) merges  (direct commits)')
  for (const r of rows) {
    console.log(`${r.window.padEnd(27)}${String(r.a_live_or_unstated).padStart(10)}${('(' + r.a_preview + ')').padStart(17)}${String(r.b_reverts + r.b_redone_prs).padStart(14)}  (${r.b_reverts}+${r.b_redone_prs})${('(' + r.b_possible + ')').padStart(12)}${String(r.c_merges).padStart(12)}${('(' + r.direct_commits + ')').padStart(17)}`)
  }
  if (flag('--list')) {
    for (const r of rows) {
      console.log(`\n== ${r.window}`)
      for (const [k, v] of Object.entries(r.items)) {
        if (k === 'merges') { console.log(`  merges: ${v.join(' ')}`); continue }
        console.log(`  ${k}:`)
        for (const line of v) console.log(`    ${line}`)
        if (!v.length) console.log('    (none)')
      }
    }
  }
}
