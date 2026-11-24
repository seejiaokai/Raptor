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
import { unmarkedComments, marksIn, badMarks, tagsIn, tagsWithoutMark, addedLines, check, summary, unrecordedIn, rowWarnings,
  answeredIn, answersIn, listing } from './readings.mjs'

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
  /* round 2: a tag covers its own sentence only — the comment's other reading sentence still fails until tagged too */
  const rest = unmarkedComments('raptor-port/src/leavewar/sansunfiled.ts', tagged, allLines(tagged))
  assert.equal(rest.length, 1)
  assert.match(rest[0].phrase, /AGENT'S READINGS/)
  const both = tagged.replace("TOLD TO HIM (D2338's row):", "TOLD TO HIM (D2338's row, READING D2338):")
  assert.deepEqual(unmarkedComments('raptor-port/src/leavewar/sansunfiled.ts', both, allLines(both)), [])
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

/* ---------- round 1 of the reads (Astra, a fresh Opus, Fable — 24 Nov 26) ---------- */
const fails = (text, file = 'raptor-port/src/a.tsx') => unmarkedComments(file, text, allLines(text))

test('a phrase wrapped across comment lines is caught, on the line it starts', () => {
  const a = `const x = 1\n// the days are his to\n// change: any row counts\n`
  const f = fails(a)
  assert.equal(f.length, 1, 'his to / change')
  assert.equal(f[0].line, 2)
  const b = `/* the agent's\n * reading: any row counts */\nconst y = 2\n`
  assert.equal(fails(b).length, 1, 'the agent\'s / reading')
  const c = `/*\n   kept until he\n   rules on it */\n`
  assert.equal(fails(c).length, 1, 'until he / rules')
  /* only the second line added: the wrapped phrase still touches an added line */
  assert.equal(unmarkedComments('raptor-port/src/a.ts', a, new Set([3])).length, 1)
  /* a tag anywhere in the same comment still covers it */
  assert.deepEqual(fails(`// the days are his to\n// change — READING D2338\n`), [])
})

test('the other phrasings the readers reproduced are caught', () => {
  for (const p of ['the host\'s reading', 'the agent\'s own reading', 'the builder\'s first reading', 'my reading',
    'our reading', 'Opus\'s reading', 'for him to change', 'his to rule', 'read here as', 'the host’s reading']) {
    assert.equal(fails(`// ${p}: any row counts\nconst y = 2\n`).length, 1, p)
  }
})

test('look-alike words are not a reading (false-fail guards)', () => {
  for (const p of ['his callsign', 'his call', 'the section\'s own reading order', 'the validator\'s own reading',
    'your reading', 'his to-do list', 'until he returns', 'the reading list', 'the reader reads here as well',
    'his to changeover', 'put to him by the scheduler']) {
    assert.deepEqual(fails(`// ${p}\nconst y = 2\n`), [], p)
  }
})

test('code before a comment no longer hides it', () => {
  /* JSX text with an apostrophe on the same line */
  assert.equal(fails(`const a = <p>Don't</p> // until he rules, any row\nconst b = 1\n`).length, 1, 'JSX apostrophe')
  assert.equal(fails(`const a = <p>Don't</p> {/* his to change */}\n`).length, 1, 'JSX apostrophe, block comment')
  /* a regex holding a quote, or a backtick, then a comment lines later */
  assert.equal(fails(`const r = /'/\nconst s = 2\n// his to change: any row\n`).length, 1, 'regex with a quote')
  assert.equal(fails(`const r = /\`/g\nconst s = 2\n// his to change: any row\n`).length, 1, 'regex with a backtick')
  assert.equal(fails(`const r = s.replace(/["']/g, '')\n// until he rules, any row\n`).length, 1, 'regex class with quotes')
  /* a comment inside a template literal's \${…} */
  assert.equal(fails('const t = `a ${ b /* his to change */ } c`\n').length, 1, 'comment inside ${…}')
  assert.equal(fails('const t = `a ${ f({ x: 1 }) } c` // not put to him\n').length, 1, 'comment after a template with braces')
  /* division is not a regex */
  assert.equal(fails(`const q = a / b / c // his to change\n`).length, 1, 'division')
})

test('ordinary quoted text is still ignored', () => {
  for (const s of [`const s = 'his to change'\n`, `const s = "until he rules"\n`, 'const s = `not put to him`\n',
    'const s = `x ${y} the agent\'s reading`\n', `const s = 'it\\'s his to change'\n`, `const s = "a // his to change"\n`])
    assert.deepEqual(fails(s), [], s)
})

test('a comment that cites his answer, ruled D<n>, passes', () => {
  /* round 2: only a ruling that answered a recorded reading counts as his answer (here both are taken to have) */
  const ok = new Set(['D2186', 'D2564'])
  const failsOk = t => unmarkedComments('raptor-port/src/a.tsx', t, allLines(t), ok)
  assert.deepEqual(failsOk(`// caps stay paused until he rules — ruled D2186\nconst y = 2\n`), [])
  assert.deepEqual(failsOk(`/* no longer the build's reading:\n   ruled D2564 */\n`), [])
  /* a bare citation is not an answer — the 22 Nov comment cites D2338 and still fails */
  assert.equal(fails(`// the agent's reading (D2338's row): any row\n`).length, 1)
})

test('a mark typed with small variants still counts', () => {
  const base = '| D2338 | 22 Nov 26 | "x" | **Rule.** MARK | home |'
  for (const m of ['READING, OPEN (24 Nov 26, not asked): one way; the other: two.',
    '**READING, OPEN (24 Nov 26, not asked) : one way; the other: two.**',
    '**READING, OPEN (24 Nov 26,not asked): one way; the other: two.**',
    '**Reading, open (24 Nov 26, not asked): one way; the other: two.**']) {
    const got = marksIn('f.md', base.replace('MARK', m))
    assert.equal(got.length, 1, m)
    assert.equal(got[0].state, 'not asked', m)
    assert.match(got[0].text, /^one way; the other: two\.?$/, m)
  }
})

test('a mark that cannot be read fails rather than dropping off the list', () => {
  const row = '| D2338 | 22 Nov 26 | "x" | **Rule.** **READING, OPEN (24 Nov 26): one way.** | home |'
  assert.equal(marksIn('f.md', row).length, 0)
  assert.equal(badMarks('f.md', row).length, 1)
  assert.deepEqual(badMarks('f.md', ROW_OPEN), [])
})

test('the listing finds untagged reading comments, old lines included', () => {
  const u = unrecordedIn('raptor-port/src/leavewar/sansunfiled.ts', NOV22)
  assert.ok(u.length >= 2, 'the 22 Nov comment holds unrecorded readings')
  assert.ok(u.some(x => /his to change/i.test(x.phrase)))
  assert.deepEqual(unrecordedIn('a.ts', '// his to change — READING D2338\n'), [])
  assert.deepEqual(unrecordedIn('a.ts', '// his to change — ruled D2564\n', new Set(['D2564'])), [])
  assert.equal(unrecordedIn('a.ts', '// his to change — ruled D2564\n').length, 1, 'not his answer to any recorded reading')
})

/* ---------- round 2 of the reads (Astra, a fresh Opus, Fable — 25 Nov 26) ---------- */
/* D2338's row once he has answered the reading: the open mark stays, step 2's ANSWERED mark names his answer */
const ROW_ANSWERED = ROW_OPEN.replace(' | sansunfiled.ts |', ' **— ANSWERED 25 Nov 26 BY D2564: flying seats and sims only.** | sansunfiled.ts |')
const ANSWERS = new Set(['D2564'])
const failsA = (text, answers = ANSWERS) => unmarkedComments('raptor-port/src/a.tsx', text, allLines(text), answers)

test('an answered reading leaves the list, and its tag must become ruled D<n>', () => {
  assert.equal(marksIn('f.md', ROW_ANSWERED).length, 0, 'not listed as open')
  const ans = answeredIn('f.md', ROW_ANSWERED)
  assert.deepEqual(ans.map(a => [a.d, a.by]), [['D2338', 'D2564']])
  /* an ANSWERED mark dated BEFORE the reading was marked answers something else: the reading stays open */
  const older = ROW_OPEN.replace(' | sansunfiled.ts |', ' **— ANSWERED 1 Nov 26 BY D2100: another point.** | sansunfiled.ts |')
  assert.equal(marksIn('f.md', older).length, 1)
  assert.deepEqual(answeredIn('f.md', older), [])
  /* NARROWED counts as his answer too */
  assert.equal(marksIn('f.md', ROW_OPEN.replace(' | sansunfiled.ts |', ' **— NARROWED 25 Nov 26 BY D2564: x.** | sansunfiled.ts |')).length, 0)
  const tags = tagsIn('raptor-port/src/a.ts', '// planned: any row — READING D2338\n')
  const f = tagsWithoutMark(tags, marksIn('f.md', ROW_ANSWERED), ans)
  assert.equal(f.length, 1)
  assert.match(f[0], /ruled D2564/)
})

test('ruled D<n> passes only for the ruling that answered a recorded reading', () => {
  assert.equal(failsA(`// the agent's reading: any row — ruled D2338\n`).length, 1, 'the misread ruling itself fails')
  assert.equal(failsA(`// the agent's reading: any row — ruled D2339\n`).length, 1, 'any other ruling fails')
  assert.deepEqual(failsA(`// the agent's reading: any row — ruled D2564\n`), [], 'his answer passes')
  /* the 22 Nov comment, its citation turned into "ruled D2338", still fails */
  const turned = NOV22.replace("(D2338's row)", '(ruled D2338)')
  assert.ok(failsA(turned).length >= 1)
  assert.deepEqual(answersIn([['f.md', ROW_ANSWERED], ['g.md', ROW_PLAIN]]), new Set(['D2564']))
})

test('code before a comment no longer hides it — round 2 cases', () => {
  assert.equal(failsA(`const a = <p>Don't</p> // the agent's reading: any row\n`).length, 1, 'apostrophe, then one in the comment')
  assert.equal(failsA(`const a = <p>Don't</p>{/* his to change */}<p>won't</p>\n`).length, 1, 'comment between two apostrophes')
  assert.equal(failsA(`const a = <p>Don't {/* the builder's reading */} won't</p>\n`).length, 1, 'inside one text run')
  assert.equal(failsA(`const a = <p>it's the men's</p>\n// his to change: any row\n`).length, 1, 'two apostrophes in one text run')
  assert.equal(failsA('if (x) /`/.test(s)\nconst y = 1\n// his to change: any row\n').length, 1, 'regex after an if condition')
  assert.equal(failsA('while (go(a)) /\'/.exec(s)\n// until he rules, any row\n').length, 1, 'regex after a while condition')
  /* still quoted text: a string right after an identifier would not be JavaScript, a tagged template still is one */
  for (const s of [`const s = f('his to change')\n`, `const s = ["until he rules"]\n`, 'const s = css`not put to him`\n',
    `const s = x ? 'his to change' : "the agent's reading"\n`, `const t = (a) / 2 // ok\nconst u = 'his to change'\n`])
    assert.deepEqual(failsA(s), [], s)
})

test('a wrapped ruled + D<n> is read, and checked, across the line break', () => {
  assert.deepEqual(failsA(`// our reading: any row counts; ruled\n// D2564\n`), [], 'a wrapped answer passes')
  assert.equal(failsA(`// our reading: any row counts; ruled\n// D999999\n`).length, 1, 'a wrapped unknown one fails')
})

test('a tag or an answer covers its own sentence only', () => {
  assert.equal(failsA(`// caps paused — ruled D2564.\n// the agent's reading: any row\n`).length, 1, 'a line under an answered one')
  assert.equal(failsA(`// READING D2338 is open.\n// his to change: any row\n`).length, 1, 'a line under a tagged one')
  assert.equal(failsA(`/* the build's reading: seats only, ruled D2564. Also his to decide: the desks */\n`).length, 1, 'two sentences in a block')
  assert.equal(failsA(`// his to change: any row\n//\n// READING D2338\n`).length, 1, 'a blank comment line ends the sentence')
  assert.deepEqual(failsA(`// his to change: any row of the day,\n// READING D2338\n`), [], 'one sentence across lines')
  assert.deepEqual(failsA(`// e.g. his to change: any row — READING D2338\n`), [], 'an abbreviation inside the sentence')
})

test('round 2 phrasings are caught; look-alikes are not', () => {
  for (const p of ['his to decide', 'his to settle', 'for him to decide', 'for him to rule', 'pending his ruling',
    'until he decides', 'until he answers', 'not yet put to him', 'the agent\'s interpretation', 'the agents\' reading',
    'Fable\'s reading', 'Claude\'s reading', 'the builder\'s own interpretation'])
    assert.equal(failsA(`// ${p}: any row counts\nconst y = 2\n`).length, 1, p)
  for (const p of ['his to rule on', 'the date is his to rule on later', 'pending his return', 'until he decided to leave',
    'the agents list', 'Fable\'s brief'])
    assert.deepEqual(failsA(`// ${p}\nconst y = 2\n`), [], p)
})

test('a malformed mark of any kind fails', () => {
  const row = m => `| D2338 | 22 Nov 26 | "x" | **Rule.** ${m} | home |`
  for (const m of ['READING, OPEN: one way; the other: two.', 'READING OPEN (25 Nov 26, not asked): one way.',
    '**READING, OPEN** (25 Nov 26, not asked): one way.', '**READING OPEN (25 Nov 26, not asked): one way.**',
    'READING — OPEN (25 Nov 26, maybe): one way.']) {
    assert.equal(marksIn('f.md', row(m)).length, 0, m)
    assert.equal(badMarks('f.md', row(m)).length, 1, m)
  }
  assert.deepEqual(badMarks('f.md', ROW_ANSWERED), [])
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

test('in a repo: an old comment moved or re-indented is not new; a changed one is', () => {
  const r = repo()
  try {
    /* the old comment re-indented and moved below new code */
    r.put('raptor-port/src/old.ts', 'export const a = 1\nfunction f() {\n    // his to change: an old comment the audit clears\n}\n')
    assert.deepEqual(check({ repo: r.dir, base: r.base }).fails, [])
    /* reworded: new words, so new */
    r.put('raptor-port/src/old.ts', '// his to change: an old comment, reworded\nexport const a = 1\n')
    assert.equal(check({ repo: r.dir, base: r.base }).fails.length, 1)
  } finally { rmSync(r.dir, { recursive: true, force: true }) }
})

test('in a repo: ruled D<n> must name the ruling that answered a recorded reading', () => {
  const r = repo()
  try {
    r.put('.claude/decisions-full/leave-war.md', ROW_PLAIN + '\n' + ROW_ANSWERED + '\n')
    r.put('raptor-port/src/d.ts', '// no longer the build\'s reading — ruled D2564\nexport const d = 1\n')
    assert.deepEqual(check({ repo: r.dir, base: r.base }).fails, [], 'his answer, D2564, passes')
    /* round 2 (Opus M2): a ruling that exists but answered no recorded reading — D2339, or the misread D2338 — fails */
    for (const d of ['D2339', 'D2338', 'D9999']) {
      r.put('raptor-port/src/d.ts', `// no longer the build's reading — ruled ${d}\nexport const d = 1\n`)
      const f = check({ repo: r.dir, base: r.base }).fails
      assert.ok(f.some(x => x.includes(d)), `${d}: ${f.join('\n')}`)
    }
  } finally { rmSync(r.dir, { recursive: true, force: true }) }
})

test('in a repo: the failure message never steers to citing any ruling, and offers rewording', () => {
  const r = repo()
  try {
    r.put('raptor-port/src/e.ts', '// the agent\'s reading: any row\nexport const e = 1\n')
    const f = check({ repo: r.dir, base: r.base }).fails
    assert.equal(f.length, 1)
    assert.match(f[0], /ANSWERED/, 'ruled D<n> only for a reading answered on its row')
    assert.match(f[0], /reword/i, 'the honest way out for words that are not a reading')
  } finally { rmSync(r.dir, { recursive: true, force: true }) }
})

test('in a repo: a line moved into another file is not new; a copy is', () => {
  const r = repo()
  try {
    /* old.ts's comment moved whole into a new file, old.ts keeping only its code */
    r.put('raptor-port/src/old.ts', 'export const a = 1\n')
    r.put('raptor-port/src/moved.ts', '// his to change: an old comment the audit clears\nexport const m = 1\n')
    assert.deepEqual(check({ repo: r.dir, base: r.base }).fails, [], 'moved')
    /* copied: the old one still stands, so the new one is new */
    r.put('raptor-port/src/old.ts', '// his to change: an old comment the audit clears\nexport const a = 1\n')
    const f = check({ repo: r.dir, base: r.base }).fails
    assert.equal(f.length, 1, f.join('\n'))
    assert.match(f[0], /moved\.ts:1/)
  } finally { rmSync(r.dir, { recursive: true, force: true }) }
})

test('in a repo: the whole listing shows a wrapped old comment and a wrapped citation is checked', () => {
  const r = repo()
  try {
    r.put('raptor-port/src/w.ts', 'export const w = 1\n// the days are his to\n// change: an old wrapped comment\n')
    git(r.dir, 'add', '-A'); git(r.dir, 'commit', '-q', '-m', 'old wrapped')
    const named = listing(r.dir, ['raptor-port/src/w.ts']).join('\n')
    assert.match(named, /w\.ts:2/, named)
    assert.match(named, /Unrecorded readings in what was named: 1/)
    const all = listing(r.dir, []).join('\n')
    assert.match(all, /Unrecorded readings in src[^:]*: 2/, all)   // old.ts's and w.ts's
    /* a wrapped "ruled ⏎ D<n>" naming no answer fails the whole-tree check */
    r.put('raptor-port/src/x.ts', '// fine — ruled\n// D999999\nexport const x = 1\n')
    git(r.dir, 'add', '-A'); git(r.dir, 'commit', '-q', '-m', 'x')
    const f = check({ repo: r.dir, base: git(r.dir, 'rev-parse', 'HEAD').trim() }).fails
    assert.ok(f.some(x => /D999999/.test(x)), f.join('\n'))
  } finally { rmSync(r.dir, { recursive: true, force: true }) }
})

test('in a repo: an unreadable mark fails; a new row speaking of a reading with no mark is a warning only', () => {
  const r = repo()
  try {
    r.put('.claude/decisions-full/leave-war.md', ROW_PLAIN + '\n' + ROW_OPEN + '\n' +
      '| D2400 | 24 Nov 26 | "x" | **A rule.** The agent\'s reading: any row of the day. | home |\n')
    assert.deepEqual(check({ repo: r.dir, base: r.base }).fails, [], 'a warning never fails the check')
    const w = rowWarnings(r.dir, r.base)
    assert.equal(w.length, 1)
    assert.match(w[0], /D2400/)
    r.put('.claude/decisions-full/leave-war.md', ROW_PLAIN + '\n' + ROW_OPEN.replace(', not asked)', ')') + '\n')
    const f = check({ repo: r.dir, base: r.base }).fails
    assert.equal(f.length, 1, f.join('\n'))
    assert.match(f[0], /D2338/)
  } finally { rmSync(r.dir, { recursive: true, force: true }) }
})
