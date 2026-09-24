#!/usr/bin/env node
/* THE DOCUMENT GATE — two jobs, docs/doc-budget.md (owner D14, 21 Sep 26) and [DOCS-GUARD]
 * (Fable's attack on D29, D30, 22 Sep 26: docs/superpowers/specs/2026-09-22-backlog-process-attack.md).
 *
 * JOB 1, THE INVENTORY (F1) — does a filed record survive the change? On 22 Sep 26 a trim script
 * destroyed two filed items, one of them a ruling's only recorded home, and NOTHING went red: this
 * gate counted lines only, and a heading count passes a file whose every body has been doubled.
 * So it now compares the backlog against the BASE of the change (the fork point from main, or
 * DOCSGUARD_BASE in CI) and fails, naming each record, when:
 *   - an item id present at the base is gone from BOTH OUTSTANDING.md and OUTSTANDING-ARCHIVE.md;
 *   - an id now appears more often than it did (a new duplicate);
 *   - a non-blank archive line from the base is gone (the archive is append-only);
 *   - any non-blank line of a block that LEFT the live file is missing from the archive (this is
 *     the one that catches truncation, which no heading count can see);
 *   - a long line now appears more times than it did (this catches doubling).
 * A deliberate exception is declared in a commit message, never in this file:
 *   `Docs-guard-allow: [ITEM-ID]` (lost or duplicated on purpose), `archive-lines`,
 *   `duplicate-lines`, `homes` — or, before committing, DOCSGUARD_ALLOW=... in the environment.
 * It also reads the home every DECISIONS.md row claims (F6) — job 1b below.
 *
 * JOB 2, THE CEILINGS (F3) — a line budget per always-read file. It must NEVER demand a trim inside
 * a code change (D29 rule 3): a squeeze inside a money change is what made the 22 Sep destruction
 * happen. So: over a ceiling AND the change touches raptor-port/src → reported as deferred, exit 0.
 * Over a ceiling on a docs-only change → fail, because that change IS the trim pass. A ceiling
 * constant may change only in a commit that touches no raptor-port/src file.
 *
 * CEILINGS CARRY HEADROOM ON PURPOSE. The old rule here was a ratchet that lowered a ceiling to the
 * file's new size after every trim — zero headroom — and Fable measured seven of eight files sitting
 * at exactly zero, so every mandatory addition during a fix tripped the gate. That clause is
 * WITHDRAWN (D29 as corrected). Raise or lower a ceiling only as a deliberate, argued edit with the
 * reason in the commit, in a commit that touches no src. TARGET is where doc-budget.md says each
 * file should end up; over target is reported, never failed — [DOC-TRIM] owns that.
 *
 * Flags: --inventory runs job 1 only (the Stop hook .claude/hooks/backlog-guard.sh uses it).
 * The closing report copies the `Docs:` and `docsize:` lines this prints (bug-check-order §9). */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = join(ROOT, '..')
const SELF = 'raptor-port/scripts/docsize.mjs'
const LIVE = 'OUTSTANDING.md'
const ARCHIVE = 'OUTSTANDING-ARCHIVE.md'
const DECISIONS = 'DECISIONS.md'
/* THE RULINGS ARE SPLIT BY AREA (owner, D136 + D137, 24 Sep 26): one file per area under RULINGS_DIR —
   How we work loads in every session, each other area loads by itself when a file in that area is read
   (its `paths:`) — the replaced and spent ones in RULINGS_ARCHIVE, and DECISIONS.md is the front door
   holding only the MAP of which file carries which D-number. Every check on the rulings reads all of
   them together, so a row moved between files is a move, never a loss. */
const RULINGS_DIR = '.claude/rules/decisions'
const RULINGS_ARCHIVE = 'DECISIONS-ARCHIVE.md'
const INVENTORY_ONLY = process.argv.includes('--inventory')

/* file, tier, CEILING. Keep one row per line in exactly this shape: the ceiling-change check below reads the
   rows back out of older versions of this file (which also carried a fourth number, the TARGET).
   NO TARGETS (owner, D141, 24 Sep 26 — "no hard line, more of like is this info needed etc and optimised"):
   a ceiling is a TRIPWIRE, never a number to cut to. Crossing it means "look at what in this file does not
   belong here and move it to its home" (`.claude/rules/doc-structure.md`); when what crossed it belongs, the
   ceiling RISES here, with its reason, in a docs-only commit. */
const FILES = [
  /* 1539 -> 1543, 23 Sep 26 (owner, D60): push a BRANCH freely, ASK before `main` — a rule the
     agent must check before acting, so it belongs in the always-loaded tier.
     1543 -> 760, 24 Sep 26 (the spring clean, D140 + D141): each area's settled decisions and
     architecture moved WHOLE to its area file, the shipping rules to .claude/rules/shipping.md, the
     Pages-era text to raptor-port/docs/archive/ — 702 lines left, the rest is room. A tripwire, not a target. */
  ['raptor-port/CLAUDE.md',              0,  760],
  ['.claude/rules/raptor-executor.md',   0,  108],
  /* 63 -> 76, 23 Sep 26 (owner, D56): data-only problems are not findings, in the always-loaded
     copy so it is in force before the order is opened. */
  ['.claude/rules/bug-check.md',         0,   76],
  /* 60 -> 100, 23 Sep 26 ([DOCS-GUARD] step 1). The file had ALREADY grown to 95 with the ceiling
     unmoved — the D53 "read it before you ask him anything" rule, a genuinely live rule — and
     nothing noticed, because this gate ran nowhere. Raised to what is true plus a little room,
     never paid for by trimming a live rule. 100 -> 125, 24 Sep 26 (owner, D136 + D137): the rule for
     keeping the rulings whole and split by area, and how a new or replaced ruling is filed, are live
     rules every session must carry — the same argument. */
  ['.claude/rules/record-decisions.md',  0,  125],
  ['.claude/rules/plain-language.md',    0,   60],
  /* NEW 24 Sep 26 (owner, D140 + D143): the two rule files every chat carries so the structure and the way a
     change ships are in force before any project file is read. Ceilings set at what they hold plus room. */
  ['.claude/rules/doc-structure.md',     0,  120],
  ['.claude/rules/shipping.md',          0,  110],
  /* 961 -> 1000, 23 Sep 26 ([DOCS-GUARD] step 1). Already at 969: the two OIL merges (#424, #425)
     added lines inside code changes, which is exactly what F3 now allows and defers. HANDOFF must
     accept a known-issue entry during a fix (CLAUDE.md), so it carries declared headroom. */
  ['HANDOFF.md',                         1, 1000],
  /* 1240 -> 1400, 23 Sep 26 ([DOCS-GUARD] step 1). Already at 1335 through the same two merges.
     The bug-check order §7.6 requires a MISSING to be filed here during a fix, so it too carries
     declared headroom. [DOC-TRIM] owns the 600 target — as its own docs-only pass. */
  ['OUTSTANDING.md',                     1, 1400],
  /* THE RULINGS (owner, D136 + D137, 24 Sep 26). They are MEANT to grow, so each ceiling is its target,
     and a rulings file is NEVER trimmed to fit: at a ceiling, archive what is replaced or spent
     (DECISIONS.md, step 2) and then RAISE the ceiling here, with the reason. DECISIONS.md is now only
     the front door and the map (was 150 with every row in it). How we work loads in EVERY session, so
     it is tier 0; each other area loads only when a file in that area is read, so it is tier 2. Set
     24 Sep 26 at roughly two to three times each file's size on the day it was split — "increase the
     budget to be safe". DECISIONS-ARCHIVE.md has no ceiling: searched, never loaded. */
  ['DECISIONS.md',                       1,   80],
  ['.claude/rules/decisions/how-we-work.md', 0, 150],
  ['.claude/rules/decisions/oil.md',     2,  120],
  /* 100 -> 560, 240, 360 — 24 Sep 26 (the spring clean, D140): each area file now also carries that area's
     settled decisions from before the rulings list and (Leave War, Tracker) its architecture, moved WHOLE from
     raptor-port/CLAUDE.md so they load only with the area's files. Set at what they hold plus room for the
     rulings to keep growing (D136: a rulings file is never trimmed to fit). */
  ['.claude/rules/decisions/scheduler.md', 2, 560],
  ['.claude/rules/decisions/tracker.md', 2,  240],
  ['.claude/rules/decisions/leave-war.md', 2, 360],
]
const RULING_CEILING = f => f === DECISIONS || f.startsWith(RULINGS_DIR + '/')

/* ---------- git plumbing ---------- */
const git = (...args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] })
const tryGit = (...args) => { try { return git(...args) } catch { return null } }
const isCommit = ref => ref && tryGit('rev-parse', '--verify', '--quiet', `${ref}^{commit}`) !== null

/* The base is what the change is measured against. CI passes the PR's base commit. Locally it is
   the fork point from main, so a destructive edit already COMMITTED on the branch is still seen —
   comparing against HEAD alone would miss it the moment it was committed. */
function findBase() {
  const env = process.env.DOCSGUARD_BASE
  if (env && !/^0+$/.test(env) && isCommit(env)) return env.trim()
  if (env) {
    const prev = tryGit('rev-parse', 'HEAD~1')
    if (prev) return prev.trim()
  }
  for (const ref of ['origin/main', 'main']) {
    const mb = tryGit('merge-base', 'HEAD', ref)
    if (mb) return mb.trim()
  }
  return tryGit('rev-parse', 'HEAD')?.trim() || null
}
const BASE = findBase()

const readNow = f => existsSync(join(REPO, f)) ? readFileSync(join(REPO, f), 'utf8') : ''
const readBase = f => (BASE && tryGit('show', `${BASE}:${f}`)) || ''
const splitLines = t => t.split('\n').map(l => l.replace(/\r$/, ''))

/* Every file that may hold a ruling row, now and at the base: the map, the archive, and each area file
   (tracked or not yet — a new area file counts the moment it exists). */
const areaFilesNow = () => [...new Set([...(tryGit('ls-files', '--', RULINGS_DIR) || '').split('\n'), ...(tryGit('ls-files', '--others', '--exclude-standard', '--', RULINGS_DIR) || '').split('\n')])]
  .filter(f => f.endsWith('.md') && existsSync(join(REPO, f))).sort()
const areaFilesBase = () => BASE ? (tryGit('ls-tree', '-r', '--name-only', BASE, '--', RULINGS_DIR) || '').split('\n').filter(f => f.endsWith('.md')) : []
const rulingFiles = when => [DECISIONS, ...(when === 'base' ? areaFilesBase() : areaFilesNow()), RULINGS_ARCHIVE]
/* Lines outside code blocks: an example row inside a ``` block is not a ruling, and must neither stand in
   for a lost one nor be moved as one (Astra, 24 Sep 26). fenceStep is job 1's rule, hoisted. */
const unfenced = ls => { let fence = null; return ls.filter(l => { const was = fence; fence = fenceStep(fence, l); return !was && !fence }) }
/* { d: 'D12', file, line } for every `| D<n> |` row — read loosely (`|D12|`, `| D12  |`), so a row typed
   with odd spacing is still counted and protected, and then failed for its shape (Fable, 24 Sep 26) */
const ROW_ID = /^\|\s*(D\d+)\s*\|/
const rulingRowsIn = (f, text) => unfenced(splitLines(text)).filter(l => ROW_ID.test(l)).map(line => ({ d: ROW_ID.exec(line)[1], file: f, line }))
const rulingRows = when => rulingFiles(when).flatMap(f => rulingRowsIn(f, when === 'base' ? readBase(f) : readNow(f)))
/* A row whose ruling cell OPENS with a replaced or spent mark belongs in the archive (DECISIONS.md, step 2). */
const MARKED = /^\*\*(?:(?:REPLACED|REVERSED|SUPERSEDED|ENDED) BY D\d+|SPENT\b)/
const rulingCell = line => (line.split('|').map(s => s.trim())[3] || '')
/* The map: DECISIONS.md's rows whose second cell is a backticked ruling file; the last cell lists its D-numbers. */
const MAP_ROW = /^\| ([^|]+?) \| `([^`]+)` \| ([^|]*?) \| ([^|]*?) \|\s*$/
const readMap = text => unfenced(splitLines(text)).map(l => MAP_ROW.exec(l)).filter(m => m && (m[2] === RULINGS_ARCHIVE || m[2].startsWith(RULINGS_DIR + '/')))
  .map(m => ({ area: m[1], file: m[2], ids: m[4].match(/D\d+/g) || [] }))
const MOVER_CMD = 'node raptor-port/scripts/backlog-archive.mjs --rulings'

/* Every path changed since the base: committed, staged, unstaged and untracked. */
function changedPaths() {
  if (!BASE) return []
  const out = new Set()
  for (const l of (tryGit('diff', '--name-only', BASE) || '').split('\n')) if (l) out.add(l)
  for (const l of (tryGit('ls-files', '--others', '--exclude-standard') || '').split('\n')) if (l) out.add(l)
  return [...out]
}
const touchesSrc = paths => paths.some(p => p.startsWith('raptor-port/src/'))

/* Declared exceptions: `Docs-guard-allow:` TRAILERS on the commits since the base, read by git's own
   trailer parser — so the line must sit in the message's final trailer block, and a body line that
   merely mentions the syntax grants nothing (Astra, 23 Sep 26) — plus the env. */
function allowances() {
  const tokens = new Set()
  const add = s => s.split(/[,\s]+/).map(t => t.trim()).filter(Boolean).forEach(t => tokens.add(t))
  if (process.env.DOCSGUARD_ALLOW) add(process.env.DOCSGUARD_ALLOW)
  if (BASE) add(tryGit('log', `${BASE}..HEAD`, '--format=%(trailers:key=Docs-guard-allow,valueonly)') || '')
  return tokens
}

/* ---------- job 1: the inventory ---------- */
const ID_RE = /^### \[([A-Z][A-Z0-9-]+)\]/
/* A code block's `# lines` are not headings. A block opens on 3+ backticks or tildes (up to three
   spaces in) and closes only on the SAME character, at least as long, with nothing after it — so a
   ```-example inside a ````-block, or a ~~~ block, cannot flip the state (Astra, 23 Sep 26).
   backlog-archive.mjs carries the same function; keep the two identical. */
function fenceStep(fence, line) {
  const f = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line)
  if (!f) return fence
  if (fence) return f[1][0] === fence.ch && f[1].length >= fence.len && !f[2].trim() ? null : fence
  return { ch: f[1][0], len: f[1].length }
}
/* An item runs from its heading to the next heading at EITHER level: `## Done` sits between two
   items, and a span to the next `### [` alone would swallow it (Fable F5). */
function blocks(text) {
  const ls = splitLines(text), out = []
  let cur = null, fence = null
  for (const l of ls) {
    const was = fence
    fence = fenceStep(fence, l)
    const m = was || fence ? null : ID_RE.exec(l)
    if (!was && !fence && (m || /^#{1,3} /.test(l))) { if (cur) out.push(cur); cur = m ? { id: m[1], lines: [l] } : null; continue }
    if (cur) cur.lines.push(l)
  }
  if (cur) out.push(cur)
  return out
}
const countIds = bs => bs.reduce((m, b) => m.set(b.id, (m.get(b.id) || 0) + 1), new Map())
const nonBlank = ls => ls.map(l => l.trimEnd()).filter(l => l.trim())
const multiset = ls => ls.reduce((m, l) => m.set(l, (m.get(l) || 0) + 1), new Map())
const LONG = 40 // a line this long repeating is a doubled body, not a coincidence
const short = s => (s.length > 90 ? s.slice(0, 87) + '...' : s)

function inventory(allow) {
  const fails = [], warns = []
  const now = { live: blocks(readNow(LIVE)), arch: blocks(readNow(ARCHIVE)) }
  const base = { live: blocks(readBase(LIVE)), arch: blocks(readBase(ARCHIVE)) }
  const nowIds = countIds([...now.live, ...now.arch]), baseIds = countIds([...base.live, ...base.arch])

  for (const id of baseIds.keys())
    if (!nowIds.has(id) && !allow.has(`[${id}]`)) fails.push(`[${id}] is GONE — it was at the base and is in neither ${LIVE} nor ${ARCHIVE}`)
  for (const [id, n] of nowIds)
    if (n > 1 && n > (baseIds.get(id) || 0) && !allow.has(`[${id}]`)) fails.push(`[${id}] now appears ${n} times (was ${baseIds.get(id) || 0}) — ids must be unique`)

  const archNow = multiset(nonBlank(splitLines(readNow(ARCHIVE))))
  if (!allow.has('archive-lines')) {
    const lost = []
    for (const [l, n] of multiset(nonBlank(splitLines(readBase(ARCHIVE))))) if ((archNow.get(l) || 0) < n) lost.push(l)
    if (lost.length) fails.push(`${ARCHIVE} is append-only, and ${lost.length} line(s) from the base are gone — first: "${short(lost[0].trim())}"`)
  }

  const liveNowIds = new Set(now.live.map(b => b.id))
  const left = base.live.filter(b => !liveNowIds.has(b.id))
  const liveCommits = BASE ? (tryGit('log', '--format=%H', `${BASE}..HEAD`, '--', LIVE) || '').split('\n').filter(Boolean) : []
  /* Compare what arrived with the item's LAST committed text in the live file, not its text at the
     base: closing an item with a status line and then moving it is normal, and the edit before the
     move is an ordinary visible diff. The move itself is what must be exact. */
  const lastLive = id => {
    const found = src => blocks(src).find(b => b.id === id)
    const head = found(tryGit('show', `HEAD:${LIVE}`) || '')
    if (head) return head
    for (const c of liveCommits) {
      const b = found(tryGit('show', `${c}~1:${LIVE}`) || '')
      if (b) return b
    }
    return null
  }
  /* Every item that was live at the base OR in any commit since (one added on the branch and archived
     later is still a move — Astra) and is now archived instead is compared line for line, counting
     repeats, with ITS OWN archived block — never with the archive as a whole, where a missing line
     that happens to exist in some other archived item would hide the cut (Astra). */
  const everLive = new Map(base.live.map(b => [b.id, b]))
  for (const c of liveCommits) for (const b of blocks(tryGit('show', `${c}:${LIVE}`) || '')) if (!everLive.has(b.id)) everLive.set(b.id, b)
  /* [DOCSGUARD-MERGE] (fixed 24 Sep 26, Astra's red team of the spring clean): an item already in the archive
     AT THE BASE was moved — and checked — on the base's own history. A branch that merged `main` in (D78) still
     carries its own pre-merge commits, whose older live copy of that item is not a second move; comparing the
     two failed a clean merge ("left OUTSTANDING.md but N lines did not arrive"). */
  const archivedAtBase = new Set(base.arch.map(a => a.id))
  for (const [id, b0] of everLive) {
    if (liveNowIds.has(id) || !now.arch.some(a => a.id === id) || archivedAtBase.has(id) || allow.has(`[${id}]`)) continue
    const b = lastLive(id) || b0
    const arrived = multiset(nonBlank(now.arch.filter(a => a.id === id).flatMap(a => a.lines)))
    const missing = [...multiset(nonBlank(b.lines))].filter(([l, n]) => (arrived.get(l) || 0) < n).map(([l]) => l)
    if (missing.length) fails.push(`[${id}] left ${LIVE} but ${missing.length} of its ${nonBlank(b.lines).length} distinct lines did not all arrive in its archived block — truncated on the way? first: "${short(missing[0].trim())}"`)
  }

  if (!allow.has('duplicate-lines')) for (const f of [LIVE, ARCHIVE]) {
    const was = multiset(nonBlank(splitLines(readBase(f))).filter(l => l.trim().length >= LONG))
    for (const [l, n] of multiset(nonBlank(splitLines(readNow(f))).filter(l => l.trim().length >= LONG)))
      if (n > 1 && n > (was.get(l) || 0)) fails.push(`${f}: a line now appears ${n} times (was ${was.get(l) || 0}) — a doubled body? "${short(l.trim())}"`)
  }

  /* A live item losing most of its body is usually a legitimate rewrite, so it is only reported. */
  /* keyed by id AND its occurrence, so the second of two same-id headings is compared to its twin */
  const keyed = bs => { const seen = new Map(); return bs.map(b => { const k = (seen.get(b.id) || 0) + 1; seen.set(b.id, k); return [`${b.id}#${k}`, b] }) }
  const baseLive = new Map(keyed(base.live).map(([k, b]) => [k, nonBlank(b.lines).length]))
  for (const [k, b] of keyed(now.live)) {
    const was = baseLive.get(k), n = nonBlank(b.lines).length
    if (was >= 6 && n < was / 2) warns.push(`[${b.id}] shrank from ${was} to ${n} lines — check nothing was cut by accident`)
  }

  const baseLiveIds = new Set(base.live.map(b => b.id))
  const added = [...liveNowIds].filter(id => !baseLiveIds.has(id)).length
  const allInArchive = left.every(b => now.arch.some(a => a.id === b.id))
  const dNow = rulingRows('now').map(r => +r.d.slice(1))
  const dBase = new Set(rulingRows('base').map(r => +r.d.slice(1)))
  const dNew = dNow.filter(n => !dBase.has(n)).sort((a, b) => a - b)
  const dRange = dNow.length ? `D${Math.min(...dNow)}–D${Math.max(...dNow)}` : 'none'
  const docsLine = `Docs: OUTSTANDING ${liveNowIds.size} items (+${added} −${left.length}${left.length ? (allInArchive ? `, −${left.length} all in ARCHIVE` : ', NOT all in ARCHIVE') : ''})` +
    ` · DECISIONS ${dRange}${dNew.length ? ` (new: ${dNew.map(n => 'D' + n).join(', ')})` : ''}`
  return { fails, warns, docsLine }
}

/* ---------- job 1b: the homes of the rulings (F6) ---------- */
/* D29's row claimed two homes that did not carry it — the "comment that vouches", committed by the
   entry written to stop exactly that. So every `| D<n> |` row's last cell is read: each backticked
   thing that looks like a file must exist, and a row ADDED in this change must have every file it
   names touched by this change too (a home you did not write is not a home). Paths after "on
   build:" name a future home and are only checked for existence. Memory entries have no path and
   are not checked. `Docs-guard-allow: homes` for a deliberate exception. */
const PATHLIKE = /\/|\.(md|mjs|cjs|js|ts|tsx|sh|json|ya?ml|html|css)$/
function homes(paths, allow) {
  const fails = []
  if (allow.has('homes')) return { fails, ok: true }
  /* only files that exist NOW — `git ls-files` still lists a tracked file this change deleted (Astra) */
  const all = [...(tryGit('ls-files') || '').split('\n'), ...(tryGit('ls-files', '--others', '--exclude-standard') || '').split('\n')].filter(f => f && existsSync(join(REPO, f)))
  const changed = new Set(paths)
  const resolve = tok => {
    /* `…/x`, a bare `x.ts` and a folder `…/briefs/` are all shorthand the rows really use */
    const tail = tok.replace(/^(…|\.\.\.)\//, '').replace(/^(\.\.?\/)+/, '')
    const bySuffix = () => all.filter(f => tail.endsWith('/') ? ('/' + f).includes('/' + tail) : (f === tail || f.endsWith('/' + tail)))
    if (tail !== tok.replace(/^(\.\.?\/)+/, '') || !tail.includes('/')) return bySuffix()
    for (const pre of ['', 'raptor-port/', 'raptor-port/src/', 'raptor-port/docs/', 'raptor-port/docs/superpowers/'])
      if (existsSync(join(REPO, pre + tail))) return [pre + tail]
    return bySuffix()
  }
  const baseRows = new Set(rulingRows('base').map(r => r.d))
  for (const { line } of rulingRows('now')) {
    const m = ROW_ID.exec(line)
    const cells = line.split(' | '), home = cells[cells.length - 1]
    const isNew = !baseRows.has(m[1]), future = home.search(/on build:/i)
    for (const tm of home.matchAll(/`([^`]+)`/g)) {
      const tok = tm[1].trim()
      if (!PATHLIKE.test(tok) || /[{}*<>\s]/.test(tok)) continue
      const hit = resolve(tok)
      if (!hit.length) { fails.push(`${m[1]} names \`${tok}\` as a home, and no such file exists`); continue }
      if (isNew && (future < 0 || tm.index < future) && !hit.some(h => changed.has(h)))
        fails.push(`${m[1]} is new and names \`${tok}\` as a home, but this change does not touch that file — write the ruling there too`)
    }
  }
  return { fails, ok: !fails.length }
}

/* ---------- job 1c: the rulings themselves and the rule registers (F7) ---------- */
/* The rulings files are the only home of some rulings (D29 rule 2), and rows MOVE between them — to
   an area, to the archive — the same kind of move that destroyed two backlog items. So a D-number at
   the base must still be there, in some rulings file, and none may newly appear twice. Numbers may SKIP:
   parallel branches hold ranges and the later one renumbers its own (D78), so a gap is legal —
   a loss is not. And rulecheck.mjs carries a hand-copied map of ruling ids: a register row
   deleted by accident made nothing red, so every id in that map must still head an entry in a
   behaviour register. `Docs-guard-allow: D<n>` for a deliberate removal. */
const RULECHECK = 'raptor-port/scripts/rulecheck.mjs'
const REGISTERS = 'raptor-port/docs/superpowers/specs'
function rulings(allow) {
  const fails = []
  const rowsNow = rulingRows('now')
  const dNow = rowsNow.map(r => r.d)
  const dBase = rulingRows('base').map(r => r.d)
  const cNow = multiset(dNow), cBase = multiset(dBase)
  /* Every number the rulings held at the base OR in any commit since — a ruling filed on a branch and
     dropped by a later commit (a bad merge of a branch still in the one-file shape) is a loss too, the
     same way the backlog check reads every commit (Fable, 24 Sep 26). A D78 renumbering declares
     `Docs-guard-allow: D<old>`. */
  const ever = new Set(dBase)
  const since = BASE ? (tryGit('log', '--format=%H', `${BASE}..HEAD`, '--', DECISIONS, RULINGS_ARCHIVE, RULINGS_DIR) || '').split('\n').filter(Boolean) : []
  for (const c of since)
    for (const f of [DECISIONS, RULINGS_ARCHIVE, ...(tryGit('ls-tree', '-r', '--name-only', c, '--', RULINGS_DIR) || '').split('\n').filter(f => f.endsWith('.md'))])
      for (const r of rulingRowsIn(f, tryGit('show', `${c}:${f}`) || '')) ever.add(r.d)
  for (const d of ever) if (!cNow.has(d) && !allow.has(d)) fails.push(`${d} is GONE from the rulings (${DECISIONS}, ${RULINGS_DIR}/, ${RULINGS_ARCHIVE}) — a ruling number is never lost${cBase.has(d) ? '' : ' (it was added in a commit since the base)'}`)
  for (const [d, n] of cNow) if (n > 1 && n > (cBase.get(d) || 0) && !allow.has(d)) fails.push(`${d} now appears ${n} times across the rulings files — a row is MOVED, never copied; and a clash with a parallel branch renumbers that branch's own row (D78)`)

  /* THE STRUCTURE KEEPS ITSELF (D137). A ruling lives in its AREA's file, never in the map file; a row
     marked replaced or spent does not stay live; the archive holds only marked rows; and the map agrees
     with the files — so "DECISIONS.md D38" always lands, and an old habit fails loudly, not silently. */
  const areas = new Set(areaFilesNow())
  for (const r of rowsNow) {
    /* the shape every tool here reads: `| D<n> | <d> Mon yy | ruling | meaning | home |` */
    if (!/^\| D\d+ \| \d{1,2} [A-Z][a-z]{2} \d{2} \| /.test(r.line)) fails.push(`${r.d}'s row in ${r.file} is not in the shape "| ${r.d} | <date, e.g. 24 Sep 26> | ruling | meaning | home |" — fix its spacing and date cell`)
    const by = /^\*\*(?:REPLACED|REVERSED|SUPERSEDED|ENDED) BY (D\d+)/.exec(rulingCell(r.line))
    if (by && !dNow.includes(by[1])) fails.push(`${r.d} is marked replaced by ${by[1]}, and no such ruling exists`)
    if (r.file === DECISIONS) fails.push(`${r.d} is written in ${DECISIONS} — a ruling lives in its area's file under ${RULINGS_DIR}/ (the map in ${DECISIONS} names them); move the row there, then run: ${MOVER_CMD}`)
    else if (areas.has(r.file) && MARKED.test(rulingCell(r.line))) fails.push(`${r.d} is marked replaced/spent but is still in ${r.file} — move it to the archive: ${MOVER_CMD}`)
    else if (r.file === RULINGS_ARCHIVE && !MARKED.test(rulingCell(r.line))) fails.push(`${r.d} is in ${RULINGS_ARCHIVE} without its mark — an archived row opens its ruling cell with **REPLACED BY D<n>** or **SPENT <date>** (${DECISIONS}, step 2)`)
  }
  if (areas.size || readMap(readNow(DECISIONS)).length) {
    const map = readMap(readNow(DECISIONS))
    const byFile = new Map()
    for (const m of map) {
      if (byFile.has(m.file)) fails.push(`the map in ${DECISIONS} lists \`${m.file}\` twice`)
      const twice = m.ids.filter((d, i) => m.ids.indexOf(d) !== i)
      if (twice.length) fails.push(`the map in ${DECISIONS} lists ${[...new Set(twice)].join(', ')} twice under \`${m.file}\` — run: ${MOVER_CMD}`)
      byFile.set(m.file, new Set(m.ids))
      if (!existsSync(join(REPO, m.file))) fails.push(`the map in ${DECISIONS} names \`${m.file}\`, and no such file exists`)
    }
    for (const f of [...areas, RULINGS_ARCHIVE]) if (!byFile.has(f) && existsSync(join(REPO, f))) fails.push(`\`${f}\` holds rulings but is not in the map in ${DECISIONS} — add its row, then run: ${MOVER_CMD}`)
    const stale = []
    for (const r of rowsNow) if (r.file !== DECISIONS && byFile.has(r.file) && !byFile.get(r.file).has(r.d)) stale.push(`${r.d} (in ${r.file.split('/').pop()})`)
    for (const [f, ids] of byFile) for (const d of ids) if (!rowsNow.some(r => r.d === d && r.file === f)) stale.push(`${d} (listed under ${f.split('/').pop()}, not in it)`)
    if (stale.length) fails.push(`the map in ${DECISIONS} does not match the files — ${stale.slice(0, 6).join(', ')}${stale.length > 6 ? ` and ${stale.length - 6} more` : ''}; run: ${MOVER_CMD}`)
  }

  const src = readNow(RULECHECK)
  const start = src.indexOf('const RULES = {')
  if (start >= 0) {
    const body = src.slice(start, src.indexOf('\n}\n', start))
    const ids = [...body.matchAll(/^\s+([A-Z]+\d+[a-z]?):/gm)].map(m => m[1])
    /* the registers, plus the clash-check spec the one-absence register names as its own source
       for B1–B9 and H1–H6 (B9 and H5 are written only there) */
    const listed = [...(tryGit('ls-files', REGISTERS) || '').split('\n'), ...(tryGit('ls-files', '--others', '--exclude-standard', '--', REGISTERS) || '').split('\n')] // a new, untracked register counts (Astra)
    const regs = [...new Set(listed)].filter(f => /behaviour-register\.md$|arch-stack-4-clash-check\.md$/.test(f))
    /* an entry is a line that STARTS one — a heading, a bold bullet, a table row, or `B9.` — and
       carries the id near its start, so `- **H4 / Q13**` heads both */
    const leads = regs.flatMap(f => splitLines(readNow(f))).filter(l => /^(#{2,4} |- \*\*|\| |\*\*|[A-Z]+\d+[a-z]?\. )/.test(l)).map(l => l.slice(0, 48))
    for (const id of ids) {
      const re = new RegExp(`(^|[^A-Za-z0-9])${id}(?![A-Za-z0-9])`)
      if (!leads.some(l => re.test(l))) fails.push(`${id} is in ${RULECHECK}'s map but heads no entry in any behaviour register — was its row deleted?`)
    }
  }
  return fails
}

/* ---------- job 1d: misfiling — where a document sits (owner, D140, 24 Sep 26) ----------
   "Teach it such that new info going into the repo will follow this structure automatically." These are not
   SIZE checks (a size never blocks a turn — D29 rule 3, the Stop hook's own promise); they catch a document put
   where the structure has no place for it, so they run with the inventory, at the end of every turn. Only what
   is NEW since the base is judged, so an older file on a parallel branch never fails someone else's change.
   Where each kind of fact belongs: `.claude/rules/doc-structure.md`. */
/* The Markdown files the repo root may hold. A tool that truly needs another one at the root is added here, with
   its reason, in a docs-only commit. HANDOFF-NEXT.md is the three-line signpost his opening line still reads. */
const ROOT_ALLOW = ['README.md', 'HANDOFF.md', 'HANDOFF-NEXT.md', 'HANDOFF-ARCHIVE.md', 'OUTSTANDING.md', 'OUTSTANDING-ARCHIVE.md',
  'DECISIONS.md', 'DECISIONS-ARCHIVE.md', 'CLAUDE.md', 'AGENTS.md']
const HANDOFF = 'HANDOFF.md', NOW_MARK = /^<!-- now:(\S+) -->\s*$/
function structure() {
  const fails = [], warns = []
  const listed = [...new Set([...(tryGit('ls-files') || '').split('\n'), ...(tryGit('ls-files', '--others', '--exclude-standard') || '').split('\n')])].filter(f => f && existsSync(join(REPO, f)))
  const atBase = new Set(BASE ? (tryGit('ls-tree', '-r', '--name-only', BASE) || '').split('\n').filter(Boolean) : [])
  const isNew = f => BASE && !atBase.has(f)
  const md = listed.filter(f => f.endsWith('.md'))
  for (const f of md.filter(isNew)) {
    if (!f.includes('/') && !ROOT_ALLOW.includes(f)) fails.push(`${f} is a new Markdown file at the repo root, which every chat sees — put it in its home (.claude/rules/doc-structure.md: a design or brief under raptor-port/docs/superpowers/, a handoff in HANDOFF.md ## Now, a finished document in raptor-port/docs/archive/); if a tool truly needs it at the root, add it to ROOT_ALLOW in ${SELF} with the reason`)
    else if (f.includes('/') && !/^(raptor-port|\.claude|\.github)\//.test(f)) fails.push(`${f} is a new document outside the one docs tree — documents live under raptor-port/docs/ (.claude/rules/doc-structure.md)`)
    /* a new top-level reference doc must be on the map, or no session will know to read it */
    const ref = /^raptor-port\/docs\/([^/]+\.md)$/.exec(f)
    if (ref && !readNow('raptor-port/CLAUDE.md').includes(ref[1]) && !readNow('raptor-port/docs/file-map.md').includes(ref[1])) fails.push(`${f} is a new reference doc that no map names — add it to raptor-port/CLAUDE.md §Where things live (or file it under raptor-port/docs/superpowers/ if it serves one task)`)
  }
  /* an always-loaded rules file is read by EVERY chat: it must be registered, with its ceiling */
  const registered = new Set(FILES.map(r => r[0]))
  for (const f of md.filter(f => f.startsWith('.claude/rules/') && isNew(f))) {
    const head = readNow(f).replace(/\r/g, '')
    const scoped = head.startsWith('---\n') && /^paths:/m.test(head.slice(4, head.indexOf('\n---', 4) + 1))
    if (!scoped && !registered.has(f)) fails.push(`${f} loads in EVERY chat (no paths:) but is not registered in ${SELF}'s FILES — register it with a ceiling (tier 0), or give it paths: so it loads only with its area`)
  }
  /* HANDOFF.md ## Now: one block per branch, and a merged branch's block is stale */
  const seen = new Map()
  for (const l of unfenced(splitLines(readNow(HANDOFF)))) { const m = NOW_MARK.exec(l); if (m) seen.set(m[1], (seen.get(m[1]) || 0) + 1) }
  for (const [b, n] of seen) {
    if (n > 1) fails.push(`${HANDOFF} has ${n} ## Now blocks for ${b} — one block per branch; a chat rewrites only its own (.claude/skills/session-handoff/SKILL.md)`)
    if (isCommit(`origin/${b}`) && isCommit('origin/main') && tryGit('merge-base', '--is-ancestor', `origin/${b}`, 'origin/main') !== null && tryGit('rev-parse', `origin/${b}`)?.trim() !== tryGit('rev-parse', 'origin/main')?.trim())
      warns.push(`${HANDOFF} ## Now still has a block for ${b}, which is merged into main — the next handoff removes it once its open residue is filed`)
  }
  return { fails, warns }
}

/* ---------- job 2: the ceilings ---------- */
const lines = t => { let n = 0; for (let i = 0; i < t.length; i++) if (t.charCodeAt(i) === 10) n++; return n }
const ROW_RE = /^\s*\['([^']+)',\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\],?/gm
const rowsOf = src => new Map([...src.matchAll(ROW_RE)].map(m => [m[1], +m[3]]))
const sameRows = (a, b) => a.size === b.size && [...a].every(([f, c]) => b.get(f) === c)

/* A ceiling may move only in a commit that touches no src — checked commit by commit, and for
   the uncommitted change as a whole. */
function ceilingMovedWithCode(paths) {
  const bad = []
  if (BASE) {
    const commits = (tryGit('log', '--format=%H', `${BASE}..HEAD`, '--', SELF) || '').split('\n').filter(Boolean)
    for (const c of commits) {
      const files = (tryGit('show', '--name-only', '--format=', c) || '').split('\n')
      if (!touchesSrc(files)) continue
      const before = tryGit('show', `${c}~1:${SELF}`) || '', after = tryGit('show', `${c}:${SELF}`) || ''
      if (!sameRows(rowsOf(before), rowsOf(after))) bad.push(`commit ${c.slice(0, 8)}`)
    }
  }
  const dirty = (tryGit('status', '--porcelain') || '').split('\n').map(l => l.slice(3).trim()).filter(Boolean)
  if (dirty.includes(SELF) && touchesSrc(dirty)) {
    const head = tryGit('show', `HEAD:${SELF}`) || ''
    if (!sameRows(rowsOf(head), rowsOf(readNow(SELF)))) bad.push('the uncommitted change')
  }
  return bad
}

function ceilings(codeChange) {
  const fails = [], deferred = []
  let tier0 = 0
  const pad = (s, n) => String(s).padEnd(n)
  console.log(`  ${pad('file', 38)} ${pad('tier', 5)} ${pad('lines', 7)} ceiling`)
  for (const [f, tier, ceiling] of FILES) {
    if (!existsSync(join(REPO, f))) { console.log(`  ${pad(f, 38)} MISSING`); continue }
    const n = lines(readNow(f))
    if (tier === 0) tier0 += n
    let note = ''
    if (n > ceiling) {
      if (codeChange) { deferred.push(n - ceiling); note = `   OVER by ${n - ceiling} — code change: do NOT trim here (D29); deferred to its own pass` }
      else { fails.push(`${f} is ${n - ceiling} line(s) over its ceiling of ${ceiling}${RULING_CEILING(f) ? ' — a rulings file is NEVER trimmed (D136): archive what is replaced or spent, then RAISE this ceiling with its reason' : ' — a TRIPWIRE, not a target (D141): move what does not belong here to its home (.claude/rules/doc-structure.md), or raise the ceiling with its reason if it does'}`); note = `   *** OVER CEILING by ${n - ceiling} ***` }
    }
    console.log(`  ${pad(f, 38)} ${pad(tier, 5)} ${pad(n, 7)} ${ceiling}${note}`)
  }
  console.log(`\n  tier 0, always loaded: ${tier0} lines (no target — D141)`)
  return { fails, deferred }
}

/* ---------- --moves: did every line that left a document arrive somewhere? (D138, 24 Sep 26) ----------
   A move is exact only if the text it took out of one file is found, the same number of times, in the
   files it went to. This compares, across every Markdown file the change touches (committed, staged,
   unstaged and new), each non-blank line REMOVED against the lines ADDED, and lists what left and did not
   arrive anywhere. That list is exactly the set a meaning check must read by eye: a rewrite, a pointer
   edit, or a real loss. A REPORT, never a failure — a deliberate rewrite is legitimate (D138 sends it to
   two reviewers instead). */
if (process.argv.includes('--moves')) {
  const removed = new Map(), added = new Map(), byFile = new Map()
  const bump = (m, l) => m.set(l, (m.get(l) || 0) + 1)
  let file = null
  const diff = BASE ? (tryGit('diff', '-U0', '--no-color', '--no-renames', BASE, '--', '*.md') || '') : ''
  for (const raw of diff.split('\n')) {
    if (raw.startsWith('+++ ') || raw.startsWith('--- ')) { if (raw.startsWith('--- ')) file = raw.slice(6); continue }
    if (raw.startsWith('diff --git')) { file = raw.split(' b/')[1]; continue }
    const l = raw.slice(1).replace(/\r$/, '').trimEnd()
    if (!l.trim()) continue
    if (raw[0] === '-') { bump(removed, l); if (!byFile.has(l)) byFile.set(l, file) }
    else if (raw[0] === '+') bump(added, l)
  }
  for (const f of (tryGit('ls-files', '--others', '--exclude-standard', '--', '*.md') || '').split('\n').filter(Boolean))
    for (const l of splitLines(readNow(f))) if (l.trim()) bump(added, l.trimEnd())
  const lost = [...removed].filter(([l, n]) => (added.get(l) || 0) < n)
  const fresh = [...added].filter(([l, n]) => (removed.get(l) || 0) < n)
  const perFile = new Map()
  for (const [l, n] of lost) { const f = byFile.get(l) || '?'; perFile.set(f, [...(perFile.get(f) || []), [l, n - (added.get(l) || 0)]]) }
  const total = [...removed.values()].reduce((a, b) => a + b, 0)
  console.log(`--moves, against ${BASE ? BASE.slice(0, 8) : 'NOTHING'}: ${total} non-blank line(s) left a Markdown file; ${lost.reduce((a, [, n]) => a + n, 0)} did not arrive anywhere (a rewrite, a pointer edit — or a loss):`)
  for (const [f, ls] of perFile) {
    console.log(`\n  ${f} — ${ls.length}`)
    for (const [l, n] of ls) console.log(`    ${n > 1 ? `(x${n}) ` : ''}${l.length > 150 ? l.slice(0, 147) + '...' : l}`)
  }
  /* and the other half: lines that ARRIVED without having left anywhere — new text, a rewrite, a pointer */
  console.log(`\n--moves: ${fresh.reduce((a, [l, n]) => a + n - (removed.get(l) || 0), 0)} non-blank line(s) are NEW — written, not moved (the rewrites and pointers a meaning check reads):`)
  if (process.argv.includes('--verbose')) for (const [l, n] of fresh) console.log(`    ${l.length > 150 ? l.slice(0, 147) + '...' : l}`)
  else console.log('    (add --verbose to list them)')
  process.exit(0)
}

/* ---------- run ---------- */
const allow = allowances()
const paths = changedPaths()
const codeChange = touchesSrc(paths)
console.log(`docsize — measured against ${BASE ? BASE.slice(0, 8) : 'NOTHING (no git base found)'}${codeChange ? ' · this change touches raptor-port/src' : ' · docs-only change'}\n`)
if (allow.size) console.log(`  declared exceptions: ${[...allow].join(', ')}\n`)

const inv = inventory(allow)
const hm = homes(paths, allow)
const st = structure()
let failures = [...inv.fails.map(f => `inventory: ${f}`), ...hm.fails.map(f => `homes: ${f}`), ...rulings(allow).map(f => `rulings: ${f}`), ...st.fails.map(f => `structure: ${f}`)]
for (const w of [...inv.warns, ...st.warns]) console.log(`  note: ${w}`)

let docsizeLine = null
if (!INVENTORY_ONLY) {
  const c = ceilings(codeChange)
  for (const f of c.fails) failures.push(`ceiling: ${f}`)
  for (const where of ceilingMovedWithCode(paths)) failures.push(`ceiling: a ceiling in ${SELF} changed in ${where}, which also touches raptor-port/src — move it in a docs-only commit`)
  docsizeLine = c.fails.length ? `docsize: OVER by ${c.fails.length} file(s) — FAIL` : c.deferred.length ? `docsize: OVER by ${c.deferred.reduce((a, b) => a + b, 0)}, deferred (D29)` : 'docsize: OK'
}

console.log(`\n${inv.docsLine} · homes ${hm.ok ? 'OK' : 'FAIL'}`)
if (docsizeLine) console.log(docsizeLine)

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} problem(s):`)
  for (const f of failures) console.error(`  - ${f}`)
  console.error('\nIf a record was lost, restore it from the base (git show <base>:OUTSTANDING.md) — never "fix" the check.')
  console.error('If the change is deliberate, say so in the commit: Docs-guard-allow: [ITEM-ID] | archive-lines | duplicate-lines | homes.')
  console.error(`A rulings map out of step, or a replaced/spent ruling still live: ${MOVER_CMD} fixes both.`)
  console.error('A file over its ceiling on a docs-only change: this change is the trim pass. Raising a ceiling is a')
  console.error('deliberate edit here, with its reason in the commit, in a commit that touches no raptor-port/src.')
  process.exit(1)
}
console.log(INVENTORY_ONLY ? '\ninventory OK — every record accounted for.' : '\ndocsize OK — every record accounted for.')
