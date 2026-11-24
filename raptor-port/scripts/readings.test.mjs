/* THE READINGS CHECK'S TESTS — his D2567 and D2610, [READINGS-LAPSE-FIX] (plan
 * docs/superpowers/plans/2026-11-24-readings-lapse-fix-plan.md §C7). The first group feeds the check's pure parts;
 * the second builds a throwaway repo and makes real commits, so the "lines a branch adds" are git's own.
 *
 * The first case is the plan's own: the 22 Nov 26 comment that left a builder's reading of "planned" in the code
 * (commit 62a898654, src/leavewar/sansunfiled.ts), pasted whole as lines a branch adds. It must fail.
 *
 * Run alone: node --test raptor-port/scripts/readings.test.mjs */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { unmarkedComments, marksIn, tagsIn, tagsWithoutMark, addedLines, check, summary } from './readings.mjs'

/* The comment exactly as commit 62a898654 added it — not a word changed. */
const NOV22 = `/* HIS SANS DAYS WITH NOTHING FILED — THE LINE HIS OWN BELL WORKS OUT (owner D2338, 22 Nov 26 — "Should we tell the user
   too": yes; "on that date his bell tells him the planned days with nothing filed, a tap opening the SANS calendar"; built
   without a drawing first on his D2339).

   A man posted out as SANS from a date ahead can be named on our programme for days past that date before it comes (D2329),
   and nobody can file his SANS availability until it does: who may be filed for SANS goes by who is SANS today (D2327). So
   on the posting's date — once the posting has run and he is SANS — his bell lists the days he is planned with us and has
   filed nothing for, a tap opening the SANS calendar on the first of them (ui/topstate.ts openNotice).

   THE AGENT'S READINGS, TOLD TO HIM (D2338's row): the man himself only, never an admin's bell; not before the posting's
   date; one line naming the days. And the build's (his to change): the days are those from the posting's date on, today
   on — a day gone by is no longer one to file — of the weeks the app holds (the week loaded and the saved weeks of his own
   squadron); "planned with us" is ALL AVAIL's own SANS read, named anywhere on that day's programme (engine/avail.ts
   dayEngaged); the line is worked out from the schedule as it stands, never stored — the "off the manpower" line's way
   (leavewar/sync.ts postedLines, D1690, D1696) — so it shrinks as he files and goes once every day is filed, and goes with
   the posting if it is taken back or his SANS is taken off. Its id is steady (the man and the posting's date), so once read
   it stays read while its days change.

   A NEW FILE, NOT sync.ts (the night of 22–23 Nov 26: another chat's work was changing sync.ts heavily) — the war's half
   is read only here, through its own store; the one line in sync.ts is the bell's list gaining this one. */
import { PEOPLE, sansOnP } from '../engine/people'
`
const allLines = text => new Set(text.split('\n').map((_, i) => i + 1))

/* A full row carrying the open mark, in the shape DECISIONS.md's "A reading" gives it. */
const ROW_OPEN = '| D2338 | 22 Nov 26 | "Should we tell the user too" | **The bell lists his planned days with nothing filed.** **READING, OPEN (24 Nov 26, not asked): "planned" is any row of the day; the other: flying seats and sims only.** | sansunfiled.ts |'
const ROW_PLAIN = '| D2339 | 22 Nov 26 | "build it" | **Built without a drawing first.** | sansunfiled.ts |'

test('the 22 Nov comment, added whole by a branch, fails', () => {
  const found = unmarkedComments('raptor-port/src/leavewar/sansunfiled.ts', NOV22, allLines(NOV22))
  assert.ok(found.length >= 1, 'the original comment must fail the check')
  assert.ok(found.some(f => /his to change/i.test(f.phrase)), 'the "his to change" phrase is named')
})

test('the same comment, NOT added by the branch, blocks nothing', () => {
  assert.deepEqual(unmarkedComments('raptor-port/src/leavewar/sansunfiled.ts', NOV22, new Set()), [])
  /* only the import line added: the phrase sits on an old line, so the old comment stays the audit's */
  const importLine = NOV22.split('\n').findIndex(l => l.startsWith('import')) + 1
  assert.deepEqual(unmarkedComments('raptor-port/src/leavewar/sansunfiled.ts', NOV22, new Set([importLine])), [])
})

test('a comment that speaks of a reading passes once it carries its tag', () => {
  const tagged = NOV22.replace('And the build\'s (his to change):', 'And the build\'s (his to change, READING D2338):')
  assert.deepEqual(unmarkedComments('raptor-port/src/leavewar/sansunfiled.ts', tagged, allLines(tagged)), [])
})

test('every free-words phrase is caught, in a line comment and a block comment', () => {
  for (const p of ['his to change', 'the agent\'s reading', 'the builder\'s reading', 'the build\'s reading',
    'until he rules', 'not put to him', 'the agent’s reading', 'THE BUILDER\'S READINGS']) {
    const a = `const x = 1\n// ${p}: any row counts\nconst y = 2\n`
    assert.equal(unmarkedComments('raptor-port/src/a.ts', a, allLines(a)).length, 1, `line comment: ${p}`)
    const b = `/* first line\n   ${p}: any row counts */\nconst y = 2\n`
    assert.equal(unmarkedComments('raptor-port/src/a.ts', b, allLines(b)).length, 1, `block comment: ${p}`)
  }
})

test('the phrase outside a comment, or a tag in the same comment, passes', () => {
  const inString = `const s = 'his to change'\n`
  assert.deepEqual(unmarkedComments('raptor-port/src/a.ts', inString, allLines(inString)), [])
  /* a run of // lines is one comment: the tag on its last line covers the phrase on its first */
  const run = `// his to change: any row counts\n// READING D2338\nconst y = 2\n`
  assert.deepEqual(unmarkedComments('raptor-port/src/a.ts', run, allLines(run)), [])
  /* a tag in a DIFFERENT comment does not */
  const apart = `// his to change: any row counts\nconst y = 2\n// READING D2338\n`
  assert.equal(unmarkedComments('raptor-port/src/a.ts', apart, allLines(apart)).length, 1)
})

test('the open mark is read from a full row, with its state', () => {
  const m = marksIn('.claude/decisions-full/leave-war.md', [ROW_PLAIN, ROW_OPEN].join('\n'))
  assert.equal(m.length, 1)
  assert.equal(m[0].d, 'D2338')
  assert.equal(m[0].state, 'not asked')
  assert.equal(m[0].date, '24 Nov 26')
  const asked = marksIn('x.md', ROW_OPEN.replace('not asked', 'asked'))
  assert.equal(asked[0].state, 'asked')
})

test('a tag with its row\'s open mark passes', () => {
  const src = `// planned: any row of the day — READING D2338\nconst x = 1\n`
  const tags = tagsIn('raptor-port/src/a.ts', src)
  assert.equal(tags.length, 1)
  assert.deepEqual(tagsWithoutMark(tags, marksIn('f.md', ROW_OPEN)), [])
})

test('a tag whose row carries no open mark fails', () => {
  const src = `// built without a drawing — READING D2339\nconst x = 1\n`
  const fails = tagsWithoutMark(tagsIn('raptor-port/src/a.ts', src), marksIn('f.md', [ROW_PLAIN, ROW_OPEN].join('\n')))
  assert.equal(fails.length, 1)
  assert.match(fails[0], /D2339/)
})

test('the count line', () => {
  const marks = marksIn('f.md', [ROW_OPEN, ROW_OPEN.replace('D2338', 'D2340').replace('not asked', 'asked')].join('\n'))
  assert.equal(summary(marks), 'Readings open: 2 (1 not asked)')
})

/* ---------- a real repo: the lines a branch adds are git's ---------- */
const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
function repo() {
  const dir = mkdtempSync(join(tmpdir(), 'readings-'))
  git(dir, 'init', '-q', '-b', 'main')
  git(dir, 'config', 'user.email', 't@t'); git(dir, 'config', 'user.name', 't'); git(dir, 'config', 'core.autocrlf', 'false')
  const put = (f, t) => { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), t) }
  put('.claude/decisions-full/leave-war.md', ROW_PLAIN + '\n' + ROW_OPEN + '\n')
  put('raptor-port/src/old.ts', '// his to change: an old comment the audit clears\nexport const a = 1\n')
  git(dir, 'add', '-A'); git(dir, 'commit', '-q', '-m', 'base')
  return { dir, put, base: git(dir, 'rev-parse', 'HEAD').trim() }
}

test('in a repo: old comments block nothing; a branch adding the 22 Nov comment fails', () => {
  const r = repo()
  try {
    assert.deepEqual(check({ repo: r.dir, base: r.base }).fails, [], 'today\'s tree, nothing added')
    r.put('raptor-port/src/leavewar/sansunfiled.ts', NOV22)          // a new, untracked file: every line is added
    const res = check({ repo: r.dir, base: r.base })
    assert.ok(res.fails.some(f => f.includes('sansunfiled.ts') && /his to change/i.test(f)), res.fails.join('\n'))
    assert.ok(!res.fails.some(f => f.includes('old.ts')), 'the old comment is not this branch\'s')
    git(r.dir, 'add', '-A'); git(r.dir, 'commit', '-q', '-m', 'branch')  // committed: still added since the base
    assert.ok(check({ repo: r.dir, base: r.base }).fails.some(f => f.includes('sansunfiled.ts')))
  } finally { rmSync(r.dir, { recursive: true, force: true }) }
})

test('in a repo: a line added inside an old file counts; the old lines do not', () => {
  const r = repo()
  try {
    r.put('raptor-port/src/old.ts', '// his to change: an old comment the audit clears\nexport const a = 1\n// until he rules, any row\nexport const b = 2\n')
    const added = addedLines(r.dir, r.base)
    assert.deepEqual([...added.get('raptor-port/src/old.ts')], [3, 4])
    const fails = check({ repo: r.dir, base: r.base }).fails
    assert.equal(fails.length, 1, fails.join('\n'))
    assert.match(fails[0], /old\.ts:3/)
  } finally { rmSync(r.dir, { recursive: true, force: true }) }
})

test('in a repo: a tagged reading with its mark passes, a tag with none fails, and the count is printed', () => {
  const r = repo()
  try {
    r.put('raptor-port/src/b.ts', '// his to change — READING D2338\nexport const b = 1\n')
    let res = check({ repo: r.dir, base: r.base })
    assert.deepEqual(res.fails, [])
    assert.equal(res.line, 'Readings open: 1 (1 not asked)')
    r.put('raptor-port/src/c.ts', '// READING D2339\nexport const c = 1\n')
    res = check({ repo: r.dir, base: r.base })
    assert.equal(res.fails.length, 1)
    assert.match(res.fails[0], /D2339/)
  } finally { rmSync(r.dir, { recursive: true, force: true }) }
})
