/* docsize --reads — WHAT A CHAT READS, measured the same way on any day (owner, D1735, 7 Nov 26 — the rules diet's plan,
 * raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md §1 and §5; step 1, part 3c). The plan's figures were
 * taken by a script kept outside the repo; this is that measure, so each step of the diet can be measured again before
 * and after. A REPORT, never a gate (D141): no number here is a target.
 *
 *   node raptor-port/scripts/docsize.mjs --reads [--verbose]
 *
 * Five kinds of job, four columns; each file is counted ONCE, in the first column that loads it:
 *   start    before he types — every rules file under .claude/rules/ with no paths: (each loads in every chat), a
 *            CLAUDE.md at the repo root, the task-observer hook's note (the skill-notes short form since D1740), and the description of each project skill and
 *            helper (the app lists them at the start);
 *   task     what the job reads by rule before its work — the skill-notes guide (only when the start hook gives its
 *            fallback, not the short form — D1740), HANDOFF.md, OUTSTANDING.md up to its
 *            items (its head and priority list) — and what the files it opens load;
 *   check    what a bug check of a screen, interface work and the ripple map read (§1's layers G, H, I — none for a
 *            notes job), and what those reads load in turn (layer J: the ripple map and the performance guide load the
 *            scheduler's rulings, the performance guide the Leave War's);
 *   message  the decision-check note on each of his messages, × 40 a chat — over a chat's life, not before code, so it
 *            is printed beside the total, never in it (§1).
 * What a read loads, followed until nothing new loads: a rules file loads when a file read matches its paths:, a
 * CLAUDE.md below the root when a file under its folder is read. What loads is counted as read too, so a rules file
 * whose paths: named another loaded file would follow it — none does today; the loop counts one if it comes (an upper
 * bound, as §1 says of every figure). Not counted: the app's own share (its tools, prompt and skills), his PC's own
 * memory notes, and the opened source files themselves — §1's layers count what they load.
 * Tokens: docsize.mjs's estTokens (about 2.74 characters a token, capitals dearer — D969), passed in, since importing
 * docsize.mjs would run the gate. Take every figure as ±10%. The pure parts are exported for the self-test. */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import * as RL from './docsize-rulings.mjs'

export const MESSAGES = 40
/* the files each kind of job opens first (plan §1's assumptions) — each a trigger, never counted itself */
export const JOBS = [
  { job: 'notes', opens: [], check: false },
  { job: 'Leave War', opens: ['raptor-port/src/leavewar/ui/Matrix.tsx', 'raptor-port/src/leavewar/state/store.ts'] },
  { job: 'scheduler', opens: ['raptor-port/src/ui/EditWeek.tsx'] },
  { job: 'Inputs', opens: ['raptor-port/src/ui/InputsPage.tsx', 'raptor-port/src/ui/inputedit.tsx', 'raptor-port/src/ui/OilDayList.tsx'] },
  { job: 'Tracker', opens: ['raptor-port/src/tracker/app/core.js'] },
]
/* a read is a whole file, the file up to a heading (upTo), or parts of it, any of these together (partOf, below): named
   sections, spans, rows and a search's output — a heading or line named here and missing from the file is reported,
   never counted as nothing silently */
export const TASK_READS = [
  { f: '.claude/skills/task-observer/SKILL.md', why: 'the skill-notes guide, invoked at a task\'s start only when the start hook gives its fallback (D1740)' },
  { f: 'HANDOFF.md', why: 'read first in every chat' },
  { f: 'OUTSTANDING.md', upTo: '## Items', why: 'its head and priority list, before telling him anything is open (D53)' },
]
/* Since the rules diet's step 3 (D1735, plan §4 and §6) the bug-check order, the design guide and the ripple map are
   read by section, as the checklist, ui-design.md's "Which part of the guide to open" and the ripple map's head note name.
   Each read below is one stated case, for a measure that can be taken again: a different job opens other parts. */
export const CHECK_READS = [
  { f: 'raptor-port/docs/bug-check-checklist.md', why: 'a bug check: the checklist first, which names each section of the order to open (D1735)' },
  { f: 'raptor-port/docs/bug-check-order.md', sections: ['## 2a.', '## 2b.', '## 3.', '## 5.', '## 6.', '## 8.', '## 9.', '## 11.', '## 12.'],
    spans: [{ from: '**Opus sizes the coverage', to: '**The owner\'s trigger rule' }, { from: '**7.0', to: '**7.11' }],
    why: 'a WALK of a screen: each section the checklist names for it — the roll-call\'s and the door check\'s included — and §4\'s fan-out paragraphs; not the rest of §4 or §4a (FULL, or a code read), nor §7.11\'s lessons, each opened only when it applies' },
  { f: 'raptor-port/docs/walk-ledger.md', sections: ['## Before any walk — the sizing step', '## The types of change'], why: 'a walk is sized first (D607) — its step 1 picks from the types of change' },
  { f: 'raptor-port/docs/walk-scripts.md', why: 'every walker\'s brief names it' },
  { f: 'raptor-port/docs/design-practices.md', spans: [{ to: '## 0.' }, { from: '## 1.', to: '### 1a.' }], sections: ['## 0.', '## 3.', '## 6.', '## 9.'],
    why: 'interface work, by section (ui-design.md): the head, §0 and §9, his lessons, for every design job; then words (§1\'s own text), placing (§3), polish before he sees it (§6)' },
  { f: 'raptor-port/docs/performance.md', sections: ['# Part 1'], why: 'interface work: Part 1, the guardrails' },
  { f: 'raptor-port/docs/feature-impact.md', spans: [{ to: '**Schedule keyboard flow' }, { from: '## 1.', to: '| **Warnings**' }],
    rows: ['| **Warnings**', '| **Undo / redo**', '| **Edit Schedule**', '| **Publishing / AL**'], sections: ['### Flow A', '## 3.', '### The single funnels'], grep: '^\\| \\*\\*[^*]*\\*\\*',
    why: 'weigh the whole ecosystem, by section (its head note) — a schedule cell edit: the note, §3, the surface list its note\'s search prints, four §1 rows, Flow A, §4\'s funnels' },
]
export const START_NOTE = '.claude/hooks/task-observer-session-start.sh'
/* since the rules diet's step 2 (D969, point F; D1740) the start hook prints the skill-notes short form, read from this
   file, and keeps its here-document only as the fallback: a hook that names the file is counted by the file */
export const START_SHORT = '.claude/skills/task-observer/SHORT-FORM.md'
/* the full guide the short form replaces at a task's start: not read again as a task read when the short form is given */
export const START_FULL = '.claude/skills/task-observer/SKILL.md'
export const MESSAGE_NOTE = '.claude/hooks/record-decisions.sh'

const linesOf = t => (t || '').split('\n').map(l => l.replace(/\r$/, ''))
const dirOf = f => (f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '')

/* the part of a file a read takes. A heading or line is matched by its start, then a boundary — never a letter or digit —
   so "## 1." or "## 1" never takes "## 10." (the step-1 reader's question 4), and "**7.0" never takes "**7.0a".
     upTo      the file up to that heading; alone, a missing heading counts the file whole (an upper bound);
     sections  each from its heading to the next heading of the same or a higher level;
     spans     [{ from, to }] — from the line that starts with from (with none, the file's first line) up to the line
               before the next that starts with to: a part that is no heading of its own, such as a run of bold-led
               paragraphs (the bug-check order's §7.0 to §7.10) or a section's own text above its first sub-heading;
     rows      the one line that starts with each — a table row;
     grep      a pattern: the text each line's matches give, as grep -o prints it (a list a rule says to print).
   Any of these together; a line two parts share is counted once, the parts kept in the file's order, and the grep's text
   after them. A missing heading or line — a span's from or its to — is reported, and that part counted as nothing. Not a
   fence's lines for any of them but the grep, which reads what the command would. Returns { text, missing, whole }. */
const headed = (l, s) => l.startsWith(s) && !/^[\p{L}\p{N}]/u.test(l.slice(s.length))
export function partOf(text, { upTo, sections, spans, rows, grep } = {}) {
  const ls = linesOf(text), inF = RL.fencedFlags(ls), level = i => { const m = !inF[i] && /^(#{1,6})\s/.exec(ls[i]); return m ? m[1].length : 0 }
  const find = (s, after = 0) => ls.findIndex((l, i) => i >= after && !inF[i] && headed(l, s))
  if (!upTo && !sections && !spans && !rows && grep == null) return { text: ls.join('\n'), missing: [], whole: true }
  if (upTo && !sections && !spans && !rows && grep == null) {
    const at = find(upTo); return at < 0 ? { text: ls.join('\n'), missing: [upTo], whole: true } : { text: ls.slice(0, at).join('\n'), missing: [], whole: false }
  }
  const take = ls.map(() => false), missing = [], mark = (a, b) => { for (let i = a; i < b; i++) take[i] = true }
  if (upTo) { const at = find(upTo); if (at < 0) missing.push(upTo); else mark(0, at) }
  for (const s of sections || []) {
    const at = ls.findIndex((l, i) => level(i) && headed(l, s))
    if (at < 0) { missing.push(s); continue }
    let end = at + 1; while (end < ls.length && !(level(end) && level(end) <= level(at))) end++
    mark(at, end)
  }
  for (const { from, to } of spans || []) {
    const at = from == null ? 0 : find(from)
    if (at < 0) { missing.push(from); continue }
    const end = find(to, at + 1)
    if (end < 0) { missing.push(`${to}" (the end of the span from "${from ?? 'the top'}`); continue }
    mark(at, end)
  }
  for (const r of rows || []) { const at = find(r); if (at < 0) missing.push(r); else mark(at, at + 1) }
  const hits = grep == null ? [] : ls.flatMap(l => [...l.matchAll(new RegExp(grep, 'gu'))].map(m => m[0]).filter(Boolean))
  return { text: [...ls.filter((_, i) => take[i]), ...hits].join('\n'), missing, whole: false }
}
/* a hook's note: the body of its first here-document (a comment line never opens one) */
export function heredocOf(text) {
  const ls = linesOf(text), open = /<<-?\s*['"]?(\w+)['"]?/
  const at = ls.findIndex(l => !/^\s*#/.test(l) && open.test(l)); if (at < 0) return ''
  const tag = open.exec(ls[at])[1], end = ls.findIndex((l, i) => i > at && l.trim() === tag)
  return ls.slice(at + 1, end < 0 ? undefined : end).join('\n')
}
/* a skill's or helper's description: its frontmatter's description:, with any indented lines that continue it */
export function descriptionOf(text) {
  const ls = linesOf(text); if (ls[0] !== '---') return ''
  const end = ls.indexOf('---', 1), at = ls.findIndex((l, i) => i < end && /^description:/.test(l)); if (end < 0 || at < 0) return ''
  const out = [ls[at].replace(/^description:\s*/, '').replace(/^[>|][-+]?\s*$/, '')]
  for (let i = at + 1; i < end && /^\s+\S/.test(ls[i]); i++) out.push(ls[i].trim())
  return out.filter(Boolean).join(' ')
}

/* What a set of reads loads, followed until nothing new loads. scoped: [{ f, globs }] (a rules file and its paths:);
   claudes: CLAUDE.md files below the root; have: what is loaded already (never loaded or counted again). */
export function follow(reads, scoped, claudes, have = new Set()) {
  const seen = new Set(have), out = [], queue = [...reads]
  while (queue.length) {
    const r = queue.shift()
    for (const s of scoped) if (!seen.has(s.f) && RL.matchesPaths(s.globs, r)) { seen.add(s.f); out.push({ f: s.f, why: `its paths: match ${r}` }); queue.push(s.f) }
    for (const c of claudes) if (!seen.has(c) && r.startsWith(dirOf(c) + '/')) { seen.add(c); out.push({ f: c, why: `${r} is under ${dirOf(c)}/` }); queue.push(c) }
  }
  return out
}

/* The whole measure, from a file list and a reader — pure, so the self-test can run it on a set held in memory.
   Returns each column's items ({ f, part, tokens, why }) and every heading a read names that its file lacks. */
export function measure({ files, read, est, jobs = JOBS, taskReads = TASK_READS, checkReads = CHECK_READS }) {
  const missing = []
  const item = (f, text, why, part = '') => ({ f, part, tokens: est(text || ''), bytes: Buffer.byteLength(text || '', 'utf8'), why })
  const take = (r, col) => {
    const t = read(r.f); if (t == null) { missing.push(`${r.f} (${col}) does not exist`); return null }
    const p = partOf(t, r); for (const m of p.missing) missing.push(`${r.f} has no heading or line "${m}" (${col}) — ${p.whole ? 'counted whole' : 'that part counted as nothing'}`)
    const names = [...(r.upTo ? [`up to ${r.upTo}`] : []), ...(r.spans || []).map(s => `${s.from ?? 'the top'} … ${s.to}`), ...(r.sections || []),
      ...(r.rows || []).map(x => `the row ${x}`), ...(r.grep != null ? [`grep -o ${r.grep}`] : [])]
    return item(r.f, p.text, r.why, p.whole ? '' : names.join(' + '))
  }
  const rules = files.filter(f => /^\.claude\/rules\/.+\.md$/.test(f) && read(f) != null)
  const scoped = rules.filter(f => RL.isScoped(read(f))).map(f => ({ f, globs: RL.pathsOf(read(f)) }))
  const claudes = files.filter(f => /\/CLAUDE\.md$/.test(f) && read(f) != null)
  const start = [
    ...rules.filter(f => !RL.isScoped(read(f))).map(f => item(f, read(f), 'no paths: — loads in every chat')),
    ...files.filter(f => f === 'CLAUDE.md' && read(f) != null).map(f => item(f, read(f), 'the repo root\'s guide')),
  ]
  /* the hook names the file on a line that is not a comment, and the file has text — else the hook prints its fallback
     (a fresh reader's F5, 7 Nov 26) */
  let usesShort = false
  if (read(START_NOTE) != null) {
    const hook = read(START_NOTE), names = linesOf(hook).some(l => !/^\s*#/.test(l) && l.includes(START_SHORT))
    const s = names ? read(START_SHORT) : null, short = s != null && s.trim() ? s : null
    usesShort = short != null
    start.push(short != null ? item(START_SHORT, short, 'the start hook\'s note — the skill-notes short form, at every session\'s start')
      : item(START_NOTE, heredocOf(hook), 'its note, at every session\'s start', 'its note'))
  }
  const tReads = usesShort ? taskReads.filter(r => r.f !== START_FULL) : taskReads
  const descs = files.filter(f => (/^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(f) || /^\.claude\/agents\/[^/]+\.md$/.test(f)) && read(f) != null)
  for (const f of descs) start.push(item(f, descriptionOf(read(f)), 'listed at the start', 'description'))
  const message = read(MESSAGE_NOTE) != null ? item(MESSAGE_NOTE, heredocOf(read(MESSAGE_NOTE)), `its note, on each of his messages × ${MESSAGES}`, 'its note') : null
  const atStart = new Set(start.filter(x => !x.part).map(x => x.f))
  const out = jobs.map(j => {
    const task = tReads.map(r => take(r, 'task')).filter(Boolean)
    const loadedT = follow([...tReads.map(r => r.f), ...j.opens], scoped, claudes, atStart)
    task.push(...loadedT.map(x => item(x.f, read(x.f), x.why)))
    const check = []
    if (j.check !== false) {
      const had = new Set([...atStart, ...loadedT.map(x => x.f)])
      check.push(...checkReads.map(r => take(r, 'check')).filter(Boolean))
      check.push(...follow(checkReads.map(r => r.f), scoped, claudes, had).map(x => item(x.f, read(x.f), x.why)))
    }
    return { job: j.job, task, check }
  })
  return { start, message, jobs: out, missing: [...new Set(missing)] }
}

const sum = xs => xs.reduce((a, x) => a + x.tokens, 0)
const n = x => x.toLocaleString('en-GB')
export function printReads(repo, est, verbose) {
  /* only where a file that loads can sit — the rules, skills, helpers and hooks, and the CLAUDE.md guides: the whole list
     outgrows a command's output with the walks' pictures, and a listing that failed would read as nothing loading */
  const git = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 })
  const where = ['--', '.claude', 'CLAUDE.md', '*/CLAUDE.md']
  const files = [...new Set([...git('ls-files', ...where).split('\n'), ...git('ls-files', '--others', '--exclude-standard', ...where).split('\n')])].filter(Boolean)
  const read = f => (existsSync(join(repo, f)) ? readFileSync(join(repo, f), 'utf8') : null)
  const m = measure({ files, read, est })
  const s = sum(m.start), msg = m.message ? m.message.tokens * MESSAGES : 0, pad = (x, w) => String(x).padStart(w)
  console.log(`docsize --reads — what a chat reads, in tokens (estTokens, ±10%; each file once, in the first column that loads it)\n`)
  console.log(`  ${'job'.padEnd(10)} ${pad('start', 9)} ${pad('task', 9)} ${pad('check', 9)} ${pad('total', 9)}    ${pad(`each message ×${MESSAGES}`, 18)}`)
  for (const j of m.jobs) console.log(`  ${j.job.padEnd(10)} ${pad(n(s), 9)} ${pad(n(sum(j.task)), 9)} ${pad(n(sum(j.check)), 9)} ${pad(n(s + sum(j.task) + sum(j.check)), 9)}    ${pad(n(msg), 18)}`)
  console.log(`\n  start: ${m.start.filter(x => x.part !== 'description').length} files and notes, and ${m.start.filter(x => x.part === 'description').length} skill and helper descriptions (${n(sum(m.start.filter(x => x.part === 'description')))}); the note on each message is ${n(m.message?.tokens || 0)} tokens.`)
  for (const x of m.missing) console.log(`  NOTE: ${x}`)
  if (verbose) {
    const row = x => `      ${pad(n(x.tokens), 8)}  ${x.f}${x.part ? ` (${x.part})` : ''} — ${x.why}`
    console.log(`\n  start (every job):\n${m.start.filter(x => x.part !== 'description').map(row).join('\n')}\n      ${pad(n(sum(m.start.filter(x => x.part === 'description'))), 8)}  the skill and helper descriptions`)
    for (const j of m.jobs) console.log(`\n  ${j.job} — task:\n${j.task.map(row).join('\n') || '      (nothing)'}\n  ${j.job} — check:\n${j.check.map(row).join('\n') || '      (none — no bug check)'}`)
  } else console.log('  (add --verbose to list each file, its part, its tokens and why it loaded)')
  console.log('\nA report, never a target (D141).')
}
