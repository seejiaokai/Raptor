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
const INVENTORY_ONLY = process.argv.includes('--inventory')

/* file, tier, CEILING, TARGET (doc-budget.md's aim). Keep one row per line in exactly this shape:
   the ceiling-change check below reads the rows back out of older versions of this file. */
const FILES = [
  /* 1539 -> 1543, 23 Sep 26 (owner, D60): push a BRANCH freely, ASK before `main` — a rule the
     agent must check before acting, so it belongs in the always-loaded tier. [DOC-TRIM] still owns
     bringing this file to its 500 target. */
  ['raptor-port/CLAUDE.md',              0, 1543,  500],
  ['.claude/rules/raptor-executor.md',   0,  108,  108],
  /* 63 -> 76, 23 Sep 26 (owner, D56): data-only problems are not findings, in the always-loaded
     copy so it is in force before the order is opened. */
  ['.claude/rules/bug-check.md',         0,   76,   76],
  /* 60 -> 100, 23 Sep 26 ([DOCS-GUARD] step 1). The file had ALREADY grown to 95 with the ceiling
     unmoved — the D53 "read it before you ask him anything" rule, a genuinely live rule — and
     nothing noticed, because this gate ran nowhere. Raised to what is true plus a little room,
     never paid for by trimming a live rule. */
  ['.claude/rules/record-decisions.md',  0,  100,   60],
  ['.claude/rules/plain-language.md',    0,   60,   60],
  /* 961 -> 1000, 23 Sep 26 ([DOCS-GUARD] step 1). Already at 969: the two OIL merges (#424, #425)
     added lines inside code changes, which is exactly what F3 now allows and defers. HANDOFF must
     accept a known-issue entry during a fix (CLAUDE.md), so it carries declared headroom. */
  ['HANDOFF.md',                         1, 1000,  400],
  /* 1240 -> 1400, 23 Sep 26 ([DOCS-GUARD] step 1). Already at 1335 through the same two merges.
     The bug-check order §7.6 requires a MISSING to be filed here during a fix, so it too carries
     declared headroom. [DOC-TRIM] owns the 600 target — as its own docs-only pass. */
  ['OUTSTANDING.md',                     1, 1400,  600],
  /* DECISIONS.md is append-only and is MEANT to grow, so its ceiling is its target. What happens
     when it reaches it is [DOCS-GUARD] step 4 (F7) — not decided yet, and not to be improvised. */
  ['DECISIONS.md',                       1,  150,  150],
]
const TIER0_TARGET = 600

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

/* Every path changed since the base: committed, staged, unstaged and untracked. */
function changedPaths() {
  if (!BASE) return []
  const out = new Set()
  for (const l of (tryGit('diff', '--name-only', BASE) || '').split('\n')) if (l) out.add(l)
  for (const l of (tryGit('ls-files', '--others', '--exclude-standard') || '').split('\n')) if (l) out.add(l)
  return [...out]
}
const touchesSrc = paths => paths.some(p => p.startsWith('raptor-port/src/'))

/* Declared exceptions: `Docs-guard-allow:` lines in the commits since the base, plus the env. */
function allowances() {
  const tokens = new Set()
  const add = s => s.split(/[,\s]+/).map(t => t.trim()).filter(Boolean).forEach(t => tokens.add(t))
  if (process.env.DOCSGUARD_ALLOW) add(process.env.DOCSGUARD_ALLOW)
  if (BASE) {
    const msgs = tryGit('log', `${BASE}..HEAD`, '--format=%B') || ''
    for (const m of msgs.matchAll(/^Docs-guard-allow:\s*(.+)$/gim)) add(m[1])
  }
  return tokens
}

/* ---------- job 1: the inventory ---------- */
const ID_RE = /^### \[([A-Z][A-Z0-9-]+)\]/
/* An item runs from its heading to the next heading at EITHER level: `## Done` sits between two
   items, and a span to the next `### [` alone would swallow it (Fable F5). */
function blocks(text) {
  const ls = splitLines(text), out = []
  let cur = null, fence = false
  for (const l of ls) {
    if (/^\s*```/.test(l)) fence = !fence // a `# comment` inside a code block is not a heading
    const m = fence ? null : ID_RE.exec(l)
    if (!fence && (m || /^#{1,3} /.test(l))) { if (cur) out.push(cur); cur = m ? { id: m[1], lines: [l] } : null; continue }
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
  for (const b of left) {
    if (!nowIds.has(b.id) || allow.has(`[${b.id}]`)) continue // already reported as gone, or a declared rename
    const missing = nonBlank(b.lines).filter(l => !archNow.has(l))
    if (missing.length) fails.push(`[${b.id}] left ${LIVE} but ${missing.length} of its ${nonBlank(b.lines).length} lines are not in ${ARCHIVE} — truncated on the way? first: "${short(missing[0].trim())}"`)
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
  const dNow = [...readNow(DECISIONS).matchAll(/^\| D(\d+) \|/gm)].map(m => +m[1])
  const dBase = new Set([...readBase(DECISIONS).matchAll(/^\| D(\d+) \|/gm)].map(m => +m[1]))
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
  const all = [...(tryGit('ls-files') || '').split('\n'), ...(tryGit('ls-files', '--others', '--exclude-standard') || '').split('\n')].filter(Boolean)
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
  const baseRows = new Set([...readBase(DECISIONS).matchAll(/^\| (D\d+) \|/gm)].map(m => m[1]))
  for (const line of splitLines(readNow(DECISIONS))) {
    const m = /^\| (D\d+) \|/.exec(line)
    if (!m) continue
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
/* DECISIONS.md is the only home of some rulings (D29 rule 2), and it too will one day move its
   oldest rows to a dated section — the same kind of move that destroyed two backlog items. So a
   D-number at the base must still be there, and none may newly appear twice. Numbers may SKIP:
   parallel branches hold ranges and the later one renumbers its own (D70), so a gap is legal —
   a loss is not. And rulecheck.mjs carries a hand-copied map of ruling ids: a register row
   deleted by accident made nothing red, so every id in that map must still head an entry in a
   behaviour register. `Docs-guard-allow: D<n>` for a deliberate removal. */
const RULECHECK = 'raptor-port/scripts/rulecheck.mjs'
const REGISTERS = 'raptor-port/docs/superpowers/specs'
function rulings(allow) {
  const fails = []
  const dNow = [...readNow(DECISIONS).matchAll(/^\| (D\d+) \|/gm)].map(m => m[1])
  const dBase = [...readBase(DECISIONS).matchAll(/^\| (D\d+) \|/gm)].map(m => m[1])
  const cNow = multiset(dNow), cBase = multiset(dBase)
  for (const d of cBase.keys()) if (!cNow.has(d) && !allow.has(d)) fails.push(`${d} is GONE from ${DECISIONS} — a ruling number is never lost`)
  for (const [d, n] of cNow) if (n > 1 && n > (cBase.get(d) || 0) && !allow.has(d)) fails.push(`${d} now appears ${n} times in ${DECISIONS} — renumber the later branch's own row (D70)`)

  const src = readNow(RULECHECK)
  const start = src.indexOf('const RULES = {')
  if (start >= 0) {
    const body = src.slice(start, src.indexOf('\n}\n', start))
    const ids = [...body.matchAll(/^\s+([A-Z]+\d+[a-z]?):/gm)].map(m => m[1])
    /* the registers, plus the clash-check spec the one-absence register names as its own source
       for B1–B9 and H1–H6 (B9 and H5 are written only there) */
    const regs = (tryGit('ls-files', REGISTERS) || '').split('\n').filter(f => /behaviour-register\.md$|arch-stack-4-clash-check\.md$/.test(f))
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

/* ---------- job 2: the ceilings ---------- */
const lines = t => { let n = 0; for (let i = 0; i < t.length; i++) if (t.charCodeAt(i) === 10) n++; return n }
const ROW_RE = /^\s*\['([^']+)',\s*(\d+),\s*(\d+),\s*(\d+)\],?/gm
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
  const overTarget = []
  const pad = (s, n) => String(s).padEnd(n)
  console.log(`  ${pad('file', 38)} ${pad('tier', 5)} ${pad('lines', 7)} ${pad('ceiling', 8)} target`)
  for (const [f, tier, ceiling, target] of FILES) {
    if (!existsSync(join(REPO, f))) { console.log(`  ${pad(f, 38)} MISSING`); continue }
    const n = lines(readNow(f))
    if (tier === 0) tier0 += n
    if (n > target) overTarget.push([f, n, target])
    let note = ''
    if (n > ceiling) {
      if (codeChange) { deferred.push(n - ceiling); note = `   OVER by ${n - ceiling} — code change: do NOT trim here (D29); deferred to its own pass` }
      else { fails.push(`${f} is ${n - ceiling} line(s) over its ceiling of ${ceiling}`); note = `   *** OVER CEILING by ${n - ceiling} ***` }
    }
    console.log(`  ${pad(f, 38)} ${pad(tier, 5)} ${pad(n, 7)} ${pad(ceiling, 8)} ${target}${note}`)
  }
  console.log(`\n  tier 0, always loaded: ${tier0} lines (target ${TIER0_TARGET})`)
  if (overTarget.length) {
    console.log('\n  over TARGET — reported, not failed; the trim is [DOC-TRIM] in OUTSTANDING.md, as its own pass:')
    for (const [f, n, t] of overTarget) console.log(`    ${pad(f, 38)} ${n} → ${t}`)
  }
  return { fails, deferred }
}

/* ---------- run ---------- */
const allow = allowances()
const paths = changedPaths()
const codeChange = touchesSrc(paths)
console.log(`docsize — measured against ${BASE ? BASE.slice(0, 8) : 'NOTHING (no git base found)'}${codeChange ? ' · this change touches raptor-port/src' : ' · docs-only change'}\n`)
if (allow.size) console.log(`  declared exceptions: ${[...allow].join(', ')}\n`)

const inv = inventory(allow)
const hm = homes(paths, allow)
let failures = [...inv.fails.map(f => `inventory: ${f}`), ...hm.fails.map(f => `homes: ${f}`), ...rulings(allow).map(f => `rulings: ${f}`)]
for (const w of inv.warns) console.log(`  note: ${w}`)

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
  console.error('A file over its ceiling on a docs-only change: this change is the trim pass. Raising a ceiling is a')
  console.error('deliberate edit here, with its reason in the commit, in a commit that touches no raptor-port/src.')
  process.exit(1)
}
console.log(INVENTORY_ONLY ? '\ninventory OK — every record accounted for.' : '\ndocsize OK — every record accounted for.')
