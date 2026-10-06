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
 * reason in the commit, in a commit that touches no src. There are no TARGETS any more (owner, D141, 24 Sep 26):
 * a ceiling is a tripwire — crossing it means "move what does not belong here", never "cut to a number".
 *
 * JOB 1d, MISFILING (owner, D140, 24 Sep 26) — a document put where the structure has no place for it: a new
 * root .md outside ROOT_ALLOW, a document outside the one docs tree, an always-loaded rules file nobody
 * registered, two HANDOFF.md ## Now blocks for one branch, HANDOFF.md losing its shape (a block's end marker or one
 * of its three headings — [HANDOFF-SHAPE-GUARD]), a new reference doc no map names. Where each fact
 * belongs is `.claude/rules/doc-structure.md`. It runs with the inventory, so the Stop hook enforces it.
 *
 * THE RULINGS SINCE D390 (28 Sep 26): each ruling is a short line in its area file and a full row, kept whole, in
 * .claude/decisions-full/ — the shape both this gate and the converter read is docsize-rulings.mjs.
 *
 * Flags: --inventory runs job 1 only (the Stop hook .claude/hooks/backlog-guard.sh uses it); --moves lists
 * every line that left a Markdown file on this branch and arrived nowhere (the reading list of a D138 check);
 * --marks lists the rulings' back-marks, their drift since the base, and which short lines are extracts (D390).
 * The closing report copies the `Docs:` and `docsize:` lines this prints (bug-check-order §9). */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import * as RL from './docsize-rulings.mjs'

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
/* SINCE D390 (28 Sep 26) each ruling is a SHORT LINE in its area file (what a chat loads) and a FULL ROW, kept whole, in
   the same-named file here — searched, never loaded. A ruling's identity is its full row; the short lines are an index
   checked against it. The shape of both: docsize-rulings.mjs, which the converter (backlog-archive.mjs --rulings)
   reads too, so the two cannot disagree. */
const FULL_DIR = RL.FULL_DIR
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
     Pages-era text to raptor-port/docs/archive/ — 702 lines left, the rest is room. A tripwire, not a target.
     760 -> 340, 28 Sep 26 (D391, the slim-down's guide step): most rules became one-line short forms, their full text
     moved whole to raptor-port/docs/guide-full.md (284 lines left). Lowered so a crossing is SEEN — a crossing asks
     "what here is detail that belongs in the full text?", never "cut to a number" (D141); each short form also has a
     character cap (GUIDE_SHORT_MAX, below). */
  ['raptor-port/CLAUDE.md',              0,  340],
  ['.claude/rules/raptor-executor.md',   0,  108],
  /* 63 -> 76, 23 Sep 26 (owner, D56): data-only problems are not findings, in the always-loaded
     copy so it is in force before the order is opened. */
  /* 76 -> 78, 7 Oct 26 (owner, D608): the approved walk-sizing wording adds two lines to step 4 - sizing never
     means no walk, and a test that changes the data directly never stands in for pressing a control. They belong
     in the always-loaded copy (Astra's read: the marker is a tripwire, not a limit - D141). The file was already
     2 over before this and still is; that excess waits for his ruling on [START-CONTEXT-AUDIT]. */
  ['.claude/rules/bug-check.md',         0,   78],
  /* 60 -> 100, 23 Sep 26 ([DOCS-GUARD] step 1). The file had ALREADY grown to 95 with the ceiling
     unmoved — the D53 "read it before you ask him anything" rule, a genuinely live rule — and
     nothing noticed, because this gate ran nowhere. Raised to what is true plus a little room,
     never paid for by trimming a live rule. 100 -> 125, 24 Sep 26 (owner, D136 + D137): the rule for
     keeping the rulings whole and split by area, and how a new or replaced ruling is filed, are live
     rules every session must carry — the same argument. 125 -> 145, 26 Sep 26 (owner, D201): what to fix when a
     ruling overwrites another is a live rule every session must carry, the moment a ruling is heard. 145 -> 160,
     28 Sep 26 (owner, D390): how a ruling is read and filed now that each loads as one line — open its full row
     before acting on its detail; search the full-text folder with the shell — is a live rule every session carries. */
  ['.claude/rules/record-decisions.md',  0,  160],
  ['.claude/rules/plain-language.md',    0,   60],
  /* NEW 24 Sep 26 (owner, D140 + D143): the two rule files every chat carries so the structure and the way a
     change ships are in force before any project file is read. Ceilings set at what they hold plus room. */
  ['.claude/rules/doc-structure.md',     0,  100],
  ['.claude/rules/shipping.md',          0,  110],
  /* 961 -> 1000, 23 Sep 26 ([DOCS-GUARD] step 1). Already at 969: the two OIL merges (#424, #425)
     added lines inside code changes, which is exactly what F3 now allows and defers. HANDOFF must
     accept a known-issue entry during a fix (CLAUDE.md), so it carries declared headroom. */
  /* 1000 -> 250, 24 Sep 26 (the spring clean, D140): HANDOFF.md became the ONE current-state handoff — a block per
     chat under ## Now, the order, the standing facts; its history, file map and traps moved whole to their homes
     (86 lines left). The room is for parallel chats' blocks; a crossing means a merged block or a story is sitting
     there (the session-handoff skill removes those), never "cut to fit". HANDOFF-NEXT.md is its three-line
     signpost — a tight ceiling so it can never grow back into a second handoff. */
  ['HANDOFF.md',                         1,  250],
  ['HANDOFF-NEXT.md',                    1,   12],
  /* 1240 -> 1400, 23 Sep 26 ([DOCS-GUARD] step 1). Already at 1335 through the same two merges.
     The bug-check order §7.6 requires a MISSING to be filed here during a fix, so it too carries
     declared headroom. [DOC-TRIM] owns the 600 target — as its own docs-only pass. */
  /* 1400 -> 1150, 24 Sep 26 (the spring clean): the old priority list and plain-terms block archived whole, nine
     finished items archived by the item mover, a live-only list written; eight items filed (1,025 lines). A tripwire
     (D141): crossing it asks "is a finished item still sitting here?", never "cut to a number". 1150 -> 1260,
     26 Sep 26: two days of filing from the amendment, accounts and late-published work crossed it; the answer to
     "what is finished here?" needs a reading of each item, so it is its own docs pass, filed as [BACKLOG-TIDY] —
     not a trim squeezed into a rulings change (D29). 1260 -> 1290 the same day: D203 filed [DB-READINESS] and
     [IT-QUESTIONS]; the tidy stays [BACKLOG-TIDY]'s. 1290 -> 1330 the same day: [ACCOUNTS]' plan read filed two
     questions for him ([MED-VISIBILITY], [SIGNOFF-SELF]) and notes on three items; still [BACKLOG-TIDY]'s pass.
     1330 -> 1430, 27 Sep 26 ([BACKLOG-TIDY], D324): every item was read; the three finished ones left for the archive
     (1,452 -> 1,367 lines) and the other 75 are live work — open, deferred, or a question for him — so what crossed the
     line belongs here (D141: the ceiling rises with its reason, never "cut to a number"). Set about 60 lines above what
     the file holds, the room two parallel chats ([ONE-DOOR], [LW-MOVE-STANDARD]) need to merge in beside it.
     1430 -> 1650, 2 Oct 26 ([DOCS-SIZE-PASS]): the file had reached 1,706 lines. Every item's heading and first line was
     read, and each one that looked finished was read whole: the five finished ones left for the archive (1,706 -> about
     1,590); three that looked finished stay because part of each is still open ([GLOBAL-UNDO]'s seven deferrals,
     [AMEND-SMALL-SEEN], [DEPLOY-DOCS]). The other 94 are live work — 19 more than at the last tidy, most of them small
     finds filed by the walks of [DB-READINESS] and the checks since — so what crossed the line belongs here (D141).
     Set about 60 lines above what the file holds. NOT done here, and owed: the priority list at the head of the file
     still tells finished stories — rewriting it is a reword, which needs a reader's check (D138): [PRIORITY-LIST-REWRITE].
     1650 -> 1750, 2 Oct 26 (the planning and filing chat, D484, D490): the file crossed the line by ONE line when the
     three tidy-ups he approved (D493) were filed as their own items; nothing here is finished ([DOCS-SIZE-PASS] read
     every item the same day). He is giving his features and bugs to be FILED until the reset, so what crosses belongs
     here (D141) — set with room for those items. */
  ['OUTSTANDING.md',                     1, 1750],
  /* THE RULINGS (owner, D136 + D137, 24 Sep 26). They are MEANT to grow, so each ceiling is its target,
     and a rulings file is NEVER trimmed to fit: at a ceiling, archive what is replaced or spent
     (DECISIONS.md, step 2) and then RAISE the ceiling here, with the reason. DECISIONS.md is now only
     the front door and the map (was 150 with every row in it). How we work loads in EVERY session, so
     it is tier 0; each other area loads only when a file in that area is read, so it is tier 2. Set
     24 Sep 26 at roughly two to three times each file's size on the day it was split — "increase the
     budget to be safe". DECISIONS-ARCHIVE.md has no ceiling: searched, never loaded. */
  /* 80 -> 90, 28 Sep 26 (owner, D390): the recording steps now say where a full row and its short line go, and how a
     merge across the slim-down runs — live rules every chat that records a ruling follows (D141: the ceiling rises
     with its reason). */
  ['DECISIONS.md',                       1,   90],
]
/* THE AREA RULINGS FILES — a tripwire in UTF-8 BYTES of the whole file, frontmatter and every section included (owner,
   D390 narrowing D141, 28 Sep 26): since each ruling became ONE short line, a line count cannot see a file growing
   (Astra's red team). EVERY file under .claude/rules/decisions/ must have a row here — the gate fails one that has
   none, path-scoped or not. Crossing a tripwire means SPLIT THE AREA (a new area file, paths, map row and full-text
   file, with `backlog-archive.mjs --rulings --move-rows`) or raise it here with its reason — never trim a ruling (D136).
   The full-text files under .claude/decisions-full/ have none: searched, never loaded. Same row shape as FILES, so the
   ceiling-moved-with-code check reads these too. Set 28 Sep 26 at what each held after the conversion (How we work
   11.6k bytes, People & accounts 13.7k, scheduler 47.0k — most of it the settled notes and architecture, not rows —
   OIL 7.0k, Leave War 24.2k, Tracker 13.1k) plus room for about thirty more rulings each. */
/* How we work 18000 → 22000 (3 Oct 26, with D491–D492): the thirty rulings of room were used in five days (D453–D492
   are nearly all general rulings — the order to the database, the reviewers, the allowance). No row here is replaced
   or spent yet (D484 and D492 are spent only after the 5 Oct 26 reset — archive them then), and a ruling is never
   trimmed (D136), so the tripwire rises (D390). */
const RULING_BYTES = [
  ['.claude/rules/decisions/how-we-work.md', 0, 22000],
  ['.claude/rules/decisions/people-accounts.md', 2, 22000],
  /* scheduler 62000 -> 69000 and Tracker 18000 -> 19000 (7 Oct 26, D609 - the documents pass he ordered): every row
     that was spent or replaced went to the archive first (the scheduler's D515, D549, D556, D559; the Tracker's D190,
     D565); what is left - 161 and 34 rulings, and the scheduler's settled notes - is live, and a ruling is never
     trimmed (D136). The scheduler's real answer is to split its rulings by screen: option 8 of [START-CONTEXT-AUDIT],
     which he has NOT ruled (D609) - when he does, this marker comes down with the split. */
  ['.claude/rules/decisions/scheduler.md', 2, 69000],
  ['.claude/rules/decisions/oil.md',     2, 12000],
  ['.claude/rules/decisions/leave-war.md', 2, 32000],
  ['.claude/rules/decisions/tracker.md', 2, 19000],
  /* 2 Oct 26 ([DOCS-SIZE-PASS]): a new area — the nine rulings on what the IT flow guide shows and when it is rebuilt
     (D403, D410-D417) moved here from How we work, which had crossed its tripwire carrying them into every chat; only
     a chat working on the guide needs them (D137, D141). Set about 1.5 kB above what it holds. */
  ['.claude/rules/decisions/it-flow-guide.md', 2, 5000],
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
  /* An unusable DOCSGUARD_BASE (all zeroes on a first push, or not a commit) falls through to the fork point from main,
     as a local run does — HEAD~1 alone missed a ruling dropped two commits back (Astra's code read, 28 Sep 26). Only
     when that fork point IS HEAD (a push to main itself) does it fall back to the commit before. */
  const head = tryGit('rev-parse', 'HEAD')?.trim()
  for (const ref of ['origin/main', 'main']) {
    const mb = tryGit('merge-base', 'HEAD', ref)?.trim()
    if (mb && !(env && mb === head)) return mb
  }
  if (env) { const prev = tryGit('rev-parse', 'HEAD~1'); if (prev) return prev.trim() }
  return head || null
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
const fullFilesNow = () => [...new Set([...(tryGit('ls-files', '--', FULL_DIR) || '').split('\n'), ...(tryGit('ls-files', '--others', '--exclude-standard', '--', FULL_DIR) || '').split('\n')])]
  .filter(f => f.endsWith('.md') && existsSync(join(REPO, f))).sort()
const fullFilesBase = () => BASE ? (tryGit('ls-tree', '-r', '--name-only', BASE, '--', FULL_DIR) || '').split('\n').filter(f => f.endsWith('.md')) : []
const rulingFiles = when => [DECISIONS, ...(when === 'base' ? [...areaFilesBase(), ...fullFilesBase()] : [...areaFilesNow(), ...fullFilesNow()]), RULINGS_ARCHIVE]
/* Lines outside code blocks: an example row inside a ``` block is not a ruling, and must neither stand in
   for a lost one nor be moved as one (Astra, 24 Sep 26). fenceStep is job 1's rule, hoisted. */
const unfenced = ls => { let fence = null; return ls.filter(l => { const was = fence; fence = fenceStep(fence, l); return !was && !fence }) }
/* { d: 'D12', file, line } for every `| D<n> |` row — read loosely (`|D12|`, `| D12  |`), so a row typed
   with odd spacing is still counted and protected, and then failed for its shape (Fable, 24 Sep 26) */
const ROW_ID = /^\|\s*(D\d+)\s*\|/
/* kind: 'short' (four `|` — an index line), 'full' (six — the ruling itself) or 'bad' (any other count, failed for it) */
const rulingRowsIn = (f, text) => unfenced(splitLines(text)).filter(l => ROW_ID.test(l)).map(line => ({ d: ROW_ID.exec(line)[1], file: f, line, kind: RL.kindOf(line) }))
const rulingRows = when => rulingFiles(when).flatMap(f => rulingRowsIn(f, when === 'base' ? readBase(f) : readNow(f)))
/* a ruling's IDENTITY is its full row (a malformed one still counts, so it is failed for its shape, never as lost) */
const identityRows = when => rulingRows(when).filter(r => r.kind !== 'short')
/* A row whose ruling cell OPENS with a replaced or spent mark belongs in the archive (DECISIONS.md, step 2). */
const MARKED = RL.MARKED /* one definition, shared with the converter (Fable's code read, D390) */
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
  const dNow = identityRows('now').map(r => +r.d.slice(1))
  const dBase = new Set(identityRows('base').map(r => +r.d.slice(1)))
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
   names touched by this change too (a home you did not write is not a home) — and every Markdown
   home it names must mention its number ([RULING-HOMES-AUDIT], 28 Sep 26). Paths after "on
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
  const baseRows = new Set(identityRows('base').map(r => r.d))
  /* a short line's last cell is its rule, not a home — only the full rows name homes (D390) */
  for (const { line } of identityRows('now')) {
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
      /* ...and a document home must SAY its number ([RULING-HOMES-AUDIT], 28 Sep 26): touching a file is not carrying the
         ruling. The audit found rows whose homes had been written without the number — one whose home had never been
         written at all (D21's "corrected" sentence, still stale four days on) — and could check them only by reading. A
         home that names the D-number makes the next audit a search. Markdown homes only (a code comment may cite it, but
         is not required to); the frozen archives are exempt, being append-only; "on build:" homes are future. */
      else if (isNew && (future < 0 || tm.index < future) && tok.endsWith('.md') && !hit.every(isFrozen) && !hit.filter(h => !isFrozen(h)).some(h => citesRuling(readNow(h), m[1])))
        fails.push(`${m[1]} is new and names \`${tok}\` as a home, but that file never mentions ${m[1]} — write the number beside the ruling there, so a later check can find it`)
    }
  }
  return { fails, ok: !fails.length }
}
/* the archives are append-only or frozen (D29, HANDOFF-ARCHIVE, docs/archive/): a ruling is never written into them */
const isFrozen = f => [ARCHIVE, RULINGS_ARCHIVE, 'HANDOFF-ARCHIVE.md'].includes(f) || f.startsWith('raptor-port/docs/archive/')
/* does this text mention ruling D<n> — alone ("D21", never inside "D210") or inside a range ("D5–D13", "D338-D340")? */
function citesRuling(text, d) {
  const n = +d.slice(1)
  if (new RegExp('(^|[^A-Za-z0-9])D' + n + '(?![0-9])').test(text)) return true
  for (const r of text.matchAll(/(?:^|[^A-Za-z0-9])D(\d+)\s*[–-]\s*D?(\d+)(?![0-9])/g)) if (+r[1] <= n && n <= +r[2]) return true
  return false
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
  const allNow = rulingRows('now')
  const rowsNow = allNow.filter(r => r.kind !== 'short')
  const dNow = rowsNow.map(r => r.d)
  const dBase = identityRows('base').map(r => r.d)
  const cNow = multiset(dNow), cBase = multiset(dBase)
  /* Every number the rulings held at the base OR in any commit since — a ruling filed on a branch and
     dropped by a later commit (a bad merge of a branch still in the one-file shape) is a loss too, the
     same way the backlog check reads every commit (Fable, 24 Sep 26). A D78 renumbering declares
     `Docs-guard-allow: D<old>`. Since D390 a ruling's number lives in its FULL row, wherever it sits — the
     full-text folder joins every read, so a row moved into it is a move, never a loss. */
  const ever = new Set(dBase)
  const since = BASE ? (tryGit('log', '--format=%H', `${BASE}..HEAD`, '--', DECISIONS, RULINGS_ARCHIVE, RULINGS_DIR, FULL_DIR) || '').split('\n').filter(Boolean) : []
  for (const c of since)
    for (const f of [DECISIONS, RULINGS_ARCHIVE, ...(tryGit('ls-tree', '-r', '--name-only', c, '--', RULINGS_DIR, FULL_DIR) || '').split('\n').filter(f => f.endsWith('.md'))])
      for (const r of rulingRowsIn(f, tryGit('show', `${c}:${f}`) || '')) if (r.kind !== 'short') ever.add(r.d)
  for (const d of ever) if (!cNow.has(d) && !allow.has(d)) fails.push(`${d} is GONE from the rulings (${DECISIONS}, ${RULINGS_DIR}/, ${FULL_DIR}/, ${RULINGS_ARCHIVE}) — a ruling number is never lost${cBase.has(d) ? '' : ' (it was added in a commit since the base)'}`)
  for (const [d, n] of cNow) if (n > 1 && n > (cBase.get(d) || 0) && !allow.has(d)) fails.push(`${d} now appears ${n} times across the rulings files — a row is MOVED, never copied; and a clash with a parallel branch renumbers that branch's own row (D78)`)

  /* THE STRUCTURE KEEPS ITSELF (D137, D390). A ruling lives in its AREA, never in the map file; a row marked replaced
     or spent does not stay live; the archive holds only marked rows; the map agrees with the files; and every live
     full row has exactly one short line in the area file of the same name, and every short line one full row. */
  const areas = new Set(areaFilesNow()), fulls = new Set(fullFilesNow())
  for (const r of allNow) {
    /* the shape every tool here reads: `| D<n> | <d> Mon yy | …` — six `|` for a full row, four for a short line */
    if (!/^\| D\d+ \| \d{1,2} [A-Z][a-z]{2} \d{2} \| /.test(r.line)) fails.push(`${r.d}'s row in ${r.file} is not in the shape "| ${r.d} | <date, e.g. 24 Sep 26> | …" — fix its spacing and date cell`)
    if (r.kind === 'bad') { fails.push(`${r.d}'s row in ${r.file} has ${RL.pipes(r.line)} column dividers — a full row has 6 ("| D<n> | date | his words | meaning | home |"), a short line 4 ("| D<n> | date | the rule |"); a "|" inside a cell is written "\\|"`); continue }
    if (r.kind === 'short') {
      if (!areas.has(r.file)) fails.push(`${r.d}'s short line is in ${r.file} — a short line lives only in an area file under ${RULINGS_DIR}/`)
      continue
    }
    const by = RL.REPLACED_BY.exec(rulingCell(r.line))
    if (by && !dNow.includes(by[1])) fails.push(`${r.d} is marked replaced by ${by[1]}, and no such ruling exists`)
    if (r.file === DECISIONS) fails.push(`${r.d} is written in ${DECISIONS} — a ruling lives in its area's file under ${RULINGS_DIR}/ (the map in ${DECISIONS} names them); move the row there, then run: ${MOVER_CMD}`)
    else if ((areas.has(r.file) || fulls.has(r.file)) && MARKED.test(rulingCell(r.line))) fails.push(`${r.d} is marked replaced/spent but is still in ${r.file} — move it to the archive: ${MOVER_CMD}`)
    else if (r.file === RULINGS_ARCHIVE && !MARKED.test(rulingCell(r.line))) fails.push(`${r.d} is in ${RULINGS_ARCHIVE} without its mark — an archived row opens its ruling cell with **REPLACED BY D<n>** or **SPENT <date>** (${DECISIONS}, step 2)`)
    else if (areas.has(r.file)) {
      /* a full row still in an area file: a new ruling not yet converted — say what the converter will do with it */
      const why = RL.headingProblem(r.d, RL.headingOf(RL.cellsOf(r.line)))
      fails.push(`${r.d}'s full row is still in ${r.file} — ${why ? `the converter will refuse it: ${why}` : `move it to ${FULL_DIR}/ and leave its short line: ${MOVER_CMD}`}`)
    }
  }
  /* the index: a short line per live full row, the same area, the same date, within the cap, and a change tail naming
     exactly the rulings its full row's marks name (Fable and Astra's red team: both directions) */
  const fullLive = new Map(rowsNow.filter(r => fulls.has(r.file)).map(r => [r.d, r]))
  const shorts = allNow.filter(r => r.kind === 'short' && areas.has(r.file))
  const shortCount = multiset(shorts.map(r => r.d))
  for (const [d, n] of shortCount) if (n > 1) fails.push(`${d} has ${n} short lines — one ruling, one line`)
  for (const s of shorts) {
    const f = fullLive.get(s.d), p = RL.parseShort(s.line)
    if (!f) { if (!rowsNow.some(r => r.d === s.d && areas.has(r.file))) fails.push(`${s.d}'s short line (${s.file}) has no full row in ${FULL_DIR}/ — a ruling's full row is never lost; restore it, or retire the ruling (${DECISIONS}, step 2)`); continue }
    if (RL.stem(f.file) !== RL.stem(s.file)) fails.push(`${s.d}'s short line is in ${s.file} but its full row in ${f.file} — the full row follows its short line: ${MOVER_CMD}`)
    const cells = RL.cellsOf(f.line)
    if (p.date !== cells[1]) fails.push(`${s.d}'s short line says ${p.date}, its full row ${cells[1]} — the date is the full row's`)
    const bad = RL.shortTextProblem(s.d, p.text)
    if (bad) fails.push(`${bad} (${s.file})`)
    const marks = RL.marksOf(cells), missing = [...marks].filter(x => !p.tail.has(x)), extra = [...p.tail].filter(x => !marks.has(x))
    if (missing.length || extra.length) fails.push(`${s.d}'s short line ${missing.length ? `does not name ${missing.join(', ')}, which ${missing.length > 1 ? 'change' : 'changes'} it` : ''}${missing.length && extra.length ? ', and ' : ''}${extra.length ? `names ${extra.join(', ')}, which its full row carries no mark for` : ''} — write the mark in the full row (${DECISIONS} step 2), then: ${MOVER_CMD}`)
  }
  for (const [d, f] of fullLive) if (!shortCount.has(d)) fails.push(`${d}'s full row (${f.file}) has no short line — every live ruling loads as one line: ${MOVER_CMD}`)
  /* every area file carries a byte tripwire (Astra's red team: an unregistered file could grow unseen) */
  const tripwired = new Set(RULING_BYTES.map(r => r[0]))
  for (const f of areas) if (!tripwired.has(f)) fails.push(`${f} has no byte tripwire in ${SELF}'s RULING_BYTES — add its row, with the reason, in a docs-only commit`)
  /* the back-mark check (Fable's red team): a NEW row that names an older one beside a change verb ("narrows D293") while
     the older row's marks do not name it — the older row must say so in its own words (DECISIONS.md step 2) */
  const liveCells = new Map(rowsNow.filter(r => fulls.has(r.file) || areas.has(r.file)).map(r => [r.d, RL.cellsOf(r.line)]))
  for (const bm of RL.backMarks(liveCells)) if (!cBase.has(bm.later) && !allow.has(bm.later)) fails.push(`${bm.later} is new and changes ${bm.older}, but ${bm.older}'s full row carries no mark naming ${bm.later} — write one in it ("**— NARROWED <date> BY ${bm.later}: …**"), then: ${MOVER_CMD}`)
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
    for (const r of allNow) if (r.file !== DECISIONS && byFile.has(r.file) && !byFile.get(r.file).has(r.d)) stale.push(`${r.d} (in ${r.file.split('/').pop()})`)
    for (const [f, ids] of byFile) for (const d of ids) if (!allNow.some(r => r.d === d && r.file === f)) stale.push(`${d} (listed under ${f.split('/').pop()}, not in it)`)
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
const HANDOFF = 'HANDOFF.md', NOW_MARK = /^<!-- now:(\S+) -->\s*$/, NOW_END = /^<!-- \/now -->\s*$/
/* HANDOFF.md's SHAPE ([HANDOFF-SHAPE-GUARD], found 25 Sep 26). One span replace ate everything from a ## Now block's
   last lines to the gate counts — the block's <!-- /now -->, the whole ## Next, in order and the ## Gate baseline
   heading — and this gate passed it, three commits running, into main (PR #437): nothing here read HANDOFF.md's
   shape. So: its three headings each once, in order; every block opened by <!-- now:… --> closed by <!-- /now -->
   before the next block or ## heading (a block's own ### title is inside it); every block inside ## Now; no end
   marker with nothing open. Returns the problems as sentences, so the caller can tell a new one from one the base
   already had. */
const HANDOFF_HEADS = ['## Now', '## Next, in order', '## Gate baseline']
function handoffShape(text) {
  if (!text) return []
  const probs = [], ls = unfenced(splitLines(text))
  const at = HANDOFF_HEADS.map(h => ls.flatMap((l, i) => l.trimEnd() === h ? [i] : []))
  HANDOFF_HEADS.forEach((h, k) => { if (at[k].length !== 1) probs.push(`the heading "${h}" appears ${at[k].length} times — it must appear exactly once`) })
  const once = at.every(a => a.length === 1)
  if (once && !(at[0][0] < at[1][0] && at[1][0] < at[2][0])) probs.push(`its headings are out of order — "${HANDOFF_HEADS.join('", then "')}"`)
  let open = null
  ls.forEach((l, i) => {
    const m = NOW_MARK.exec(l)
    if (m || /^## /.test(l)) {
      if (open) probs.push(`the ## Now block for ${open} has no <!-- /now --> before the next ${m ? `block (${m[1]})` : `heading "${l.trim()}"`}`)
      open = m ? m[1] : null
      if (m && at[0].length === 1 && at[1].length === 1 && !(i > at[0][0] && i < at[1][0])) probs.push(`the block for ${m[1]} sits outside ## Now`)
    } else if (NOW_END.test(l)) {
      if (!open) probs.push('a <!-- /now --> closes no block — a block\'s opening <!-- now:<branch> --> line is missing')
      open = null
    }
  })
  if (open) probs.push(`the ## Now block for ${open} has no <!-- /now --> before the end of the file`)
  return probs
}
/* THE PROJECT GUIDE AND ITS FULL TEXT (D391, 28 Sep 26 — the slim-down's guide step, plan §2.6). Most rules in
   raptor-port/CLAUDE.md are ONE line, a short form ending ` · full text: docs/guide-full.md §<heading>`; the text under
   that ### heading in guide-full.md is what stood in the guide, moved whole by `backlog-archive.mjs --move`. A pointer
   to a heading that is not there sends a chat to nothing, and a heading no pointer names is a rule no chat will find
   (Astra's manifest idea, in its lighter form). So: every short form names an existing ### heading; every ### heading is
   named by exactly one short form; every ## there is a section of the guide; a short form states its rule in at most
   GUIDE_SHORT_MAX characters, the cap of a ruling's short line — so the guide cannot grow back one long line at a time
   (crossing it means: move the detail to the full text, never trim the rule's meaning). A line naming the file with a §
   anywhere but at its end is a pointer typed wrong, and fails. Neither file there: nothing to check. */
const GUIDE = 'raptor-port/CLAUDE.md', GUIDE_FULL = 'raptor-port/docs/guide-full.md', GUIDE_SHORT_MAX = 350
const GUIDE_POINTER = / · full text: docs\/guide-full\.md §(.+)$/
function guidePairing() {
  const fails = [], g = readNow(GUIDE), full = readNow(GUIDE_FULL)
  const gl = unfenced(splitLines(g)), pointers = []
  let gSec = null
  for (const l of gl) {
    if (/^## /.test(l)) gSec = l.trim()
    const m = GUIDE_POINTER.exec(l.trimEnd())
    if (m) pointers.push({ name: m[1].trim(), short: l.slice(0, m.index), sec: gSec })
    else if (l.includes('guide-full.md §')) fails.push(`${GUIDE} has a line naming ${GUIDE_FULL} with a § that is not typed as a short form's ending — it must END exactly " · full text: docs/guide-full.md §<heading>" (a space, a middle dot, a space): ${l.slice(0, 80)}…`)
  }
  if (!full) {
    if (pointers.length) fails.push(`${GUIDE} has ${pointers.length} short form(s) pointing into ${GUIDE_FULL}, which is GONE — restore it from the base; it holds the guide's full text`)
    return fails
  }
  const fl = unfenced(splitLines(full))
  const h3 = fl.filter(l => /^### /.test(l)).map(l => l.slice(4).trim())
  /* the ## a full text sits under must be the section its short form sits in (Fable, 28 Sep 26): "above" and "below"
     inside a moved block are read by that section */
  const secOf = new Map()
  { let s = null; for (const l of fl) { if (/^## /.test(l)) s = l.trim(); else if (/^### /.test(l) && !secOf.has(l.slice(4).trim())) secOf.set(l.slice(4).trim(), s) } }
  const guideH2 = new Set(gl.filter(l => /^## /.test(l)).map(l => l.trim()))
  for (const h of fl.filter(l => /^## /.test(l)).map(l => l.trim())) if (!guideH2.has(h)) fails.push(`${GUIDE_FULL} has the section "${h}", which is not a section of ${GUIDE} — its ## headings mirror the guide's, so a moved block is found under the section it came from`)
  const named = new Map()
  for (const p of pointers) named.set(p.name, (named.get(p.name) || 0) + 1)
  for (const h of new Set(h3)) {
    if (h3.filter(x => x === h).length > 1) fails.push(`${GUIDE_FULL} has the heading "### ${h}" more than once — each full text has its own heading`)
    const n = named.get(h) || 0
    if (n !== 1) fails.push(`${GUIDE_FULL} §${h} is named by ${n} short forms in ${GUIDE} — it must be named by exactly one${n ? '' : ' (a full text no short form points to is a rule no chat will find: restore its short form, or move the text back)'}`)
  }
  for (const p of pointers) {
    if (!h3.includes(p.name)) fails.push(`${GUIDE} has a short form pointing to "${GUIDE_FULL} §${p.name}", and there is no such ### heading there — a pointer to nothing`)
    else if (secOf.get(p.name) !== p.sec) fails.push(`${GUIDE_FULL} §${p.name} sits under "${secOf.get(p.name) || 'no ## section'}", but its short form sits in the guide's "${p.sec || 'no ## section'}" — file the full text under the section its short form is in`)
    const n = [...p.short.replace(/^(- |> )/, '')].length
    if (n > GUIDE_SHORT_MAX) fails.push(`${GUIDE}: the short form for §${p.name} is ${n} characters — at most ${GUIDE_SHORT_MAX}: move its detail into the full text, keep the rule (D141 — never cut the rule's meaning to fit)`)
  }
  return fails
}
function structure() {
  const fails = [...guidePairing()], warns = []
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
  /* its shape: a problem the base did not have fails; one the base already had is only reported, so a branch that
     never touched HANDOFF.md is not failed for someone else's damage (the rest of this job judges only what is new).
     In CI the base is main's tip, not the fork point (Fable, 28 Sep 26): a branch forked before a fix on main merges
     main in first (D78), as it must anyway. */
  const hNow = readNow(HANDOFF), hBase = readBase(HANDOFF), shapeBase = new Set(handoffShape(hBase))
  if (hBase && !hNow) fails.push(`${HANDOFF} is GONE — it was at the base; it is the one handoff every chat reads first`)
  for (const p of handoffShape(hNow)) {
    if (shapeBase.has(p)) warns.push(`${HANDOFF}: ${p} (already so at the base)`)
    else fails.push(`${HANDOFF} has lost its shape: ${p} — an edit that spanned too much may have eaten the lines between; restore them from the base (git show <base>:${HANDOFF}), never "fix" the check`)
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
  /* the area rulings files, in UTF-8 bytes of the whole file (D390) — the same tripwire rules as the lines above */
  console.log(`\n  ${pad('rulings file (loaded)', 44)} ${pad('tier', 5)} ${pad('bytes', 8)} ${pad('~tokens', 8)} tripwire`)
  let rTier0 = 0
  for (const [f, tier, ceiling] of RULING_BYTES) {
    if (!existsSync(join(REPO, f))) { console.log(`  ${pad(f, 44)} MISSING`); continue }
    const n = Buffer.byteLength(readNow(f), 'utf8')
    if (tier === 0) rTier0 += n
    let note = ''
    if (n > ceiling) {
      if (codeChange) { deferred.push(n - ceiling); note = `   OVER by ${n - ceiling} bytes — code change: deferred (D29)` }
      else { fails.push(`${f} is ${n - ceiling} bytes over its tripwire of ${ceiling} — a rulings file is NEVER trimmed (D136): split the area (a new area file, paths, map row and full-text file: backlog-archive.mjs --rulings --move-rows), archive what is replaced or spent, or raise the tripwire with its reason (D390)`); note = `   *** OVER by ${n - ceiling} bytes ***` }
    }
    console.log(`  ${pad(f, 44)} ${pad(tier, 5)} ${pad(n, 8)} ${pad('~' + Math.round(n / 3.7), 8)} ${ceiling}${note}`)
  }
  console.log(`\n  always-loaded rulings: ${rTier0} bytes (~${Math.round(rTier0 / 3.7)} tokens); the full text, searched: ${fullFilesNow().reduce((a, f) => a + Buffer.byteLength(readNow(f), 'utf8'), 0)} bytes`)
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

/* ---------- --marks: what the meaning read works from (D138, D390) — reports, never failures ----------
   The back-mark report: a row naming an older one beside a change verb where the older row's marks do not name it
   (only a row NEW since the base fails, in the rulings check). The drift report: a short line changed since the base
   while its full row did not, and a full row whose heading changed while its short line did not. The extract list:
   which short lines are their row's heading word for word, and which were written by hand. */
if (process.argv.includes('--marks')) {
  const rows = identityRows('now').filter(r => r.file.startsWith(FULL_DIR + '/'))
  const cells = new Map(rows.map(r => [r.d, RL.cellsOf(r.line)]))
  const bms = RL.backMarks(cells)
  console.log(`back-marks — a later row changes an older one that carries no mark naming it: ${bms.length}`)
  for (const b of bms) console.log(`  ${b.older} ← ${b.later}`)
  const shortNow = new Map(rulingRows('now').filter(r => r.kind === 'short').map(r => [r.d, r.line]))
  const shortBase = new Map(rulingRows('base').filter(r => r.kind === 'short').map(r => [r.d, r.line]))
  const fullBase = new Map(identityRows('base').map(r => [r.d, r.line]))
  const drift = []
  for (const [d, line] of shortNow) {
    const fb = fullBase.get(d), fn = rows.find(r => r.d === d)?.line
    if (shortBase.has(d) && shortBase.get(d) !== line && fb === fn) drift.push(`${d}: its short line changed, its full row did not`)
    if (fb && fn && fb !== fn && RL.headingOf(RL.cellsOf(fb)) !== RL.headingOf(RL.cellsOf(fn)) && shortBase.get(d) === line) drift.push(`${d}: its full row's heading changed, its short line did not`)
  }
  console.log(`\ndrift since the base: ${drift.length}`); for (const x of drift) console.log('  ' + x)
  const extract = [], written = []
  for (const [d, line] of shortNow) { const c = cells.get(d); if (!c) continue; (RL.parseShort(line).text === RL.headingOf(c) ? extract : written).push(d) }
  console.log(`\nshort lines that are their row's heading word for word: ${extract.length} — ${extract.join(', ')}`)
  console.log(`\nshort lines written by hand: ${written.length} — ${written.join(', ')}`)
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
