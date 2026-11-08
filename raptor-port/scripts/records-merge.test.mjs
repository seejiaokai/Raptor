/* THE SETTLE STEP'S TESTS — [MERGE-ONCE-RECORDS] part 2 (8 Nov 26). Each case builds a throwaway repo in the temp folder,
 * makes a real merge that clashes, runs records-merge.mjs as a child process (as a chat would), and asserts the files and
 * its report. Every case the plan's red team named is here, by its number (Astra n / Opus n); the checks it runs are two
 * small stand-ins in each throwaway repo (`npm run docsize`, `npm run rulecheck`), so a case can make them red.
 *
 * Run alone: node --test raptor-port/scripts/records-merge.test.mjs */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'

const HERE = dirname(fileURLToPath(import.meta.url))
const SCRIPT = join(HERE, 'records-merge.mjs')

/* a stand-in check: red when the file CHECK-FAIL-<name> exists (its text is the failure line), or when HANDOFF.md holds
   every word listed in CHECK-WORDS-<name>; it leaves CHECK-RAN behind so a case can tell it ran */
const FAKE = `import { existsSync, readFileSync, writeFileSync } from 'node:fs'
const name = process.argv[2], root = '..'
writeFileSync(root + '/CHECK-RAN', 'yes')
if (existsSync(root + '/CHECK-FAIL-' + name)) { console.error(readFileSync(root + '/CHECK-FAIL-' + name, 'utf8').trim()); process.exit(1) }
if (existsSync(root + '/CHECK-WORDS-' + name)) {
  const words = readFileSync(root + '/CHECK-WORDS-' + name, 'utf8').split(/\\s+/).filter(Boolean)
  const h = existsSync(root + '/HANDOFF.md') ? readFileSync(root + '/HANDOFF.md', 'utf8') : ''
  if (words.every(w => h.includes(w))) { console.error('both words together: ' + words.join(' ')); process.exit(1) }
}
console.log(name + ' OK')
`
const PKG = JSON.stringify({ name: 'x', private: true, scripts: { docsize: 'node scripts/fake-check.mjs docsize', rulecheck: 'node scripts/fake-check.mjs rulecheck' } })

function makeRepo(files) {
  const dir = mkdtempSync(join(tmpdir(), 'records-merge-test-'))
  const g = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  const w = (f, t) => { mkdirSync(dirname(join(dir, f)), { recursive: true }); writeFileSync(join(dir, f), t) }
  g('init', '-q', '-b', 'main'); g('config', 'user.email', 't@example.invalid'); g('config', 'user.name', 't'); g('config', 'core.autocrlf', 'false')
  w('raptor-port/scripts/records-merge.mjs', readFileSync(SCRIPT, 'utf8'))
  w('raptor-port/scripts/docsize-rulings.mjs', readFileSync(join(HERE, 'docsize-rulings.mjs'), 'utf8'))
  w('raptor-port/scripts/fake-check.mjs', FAKE); w('raptor-port/package.json', PKG); w('.gitignore', 'CHECK-RAN\n')
  for (const [f, t] of Object.entries(files)) w(f, t)
  g('add', '-A'); g('commit', '-q', '-m', 'base')
  const c = {
    dir, git: g, write: w,
    read: f => readFileSync(join(dir, f), 'utf8'),
    has: f => existsSync(join(dir, f)),
    edit: (f, fn) => w(f, fn(readFileSync(join(dir, f), 'utf8'))),
    commit: msg => { g('add', '-A'); g('commit', '-q', '-m', msg) },
    /* the branch's side and main's side, then the merge the step runs after */
    sides(ours, theirs, before = []) {
      g('checkout', '-q', '-b', 'feature'); ours(c); c.commit('ours')
      g('checkout', '-q', 'main'); theirs(c); c.commit('theirs')
      g('checkout', '-q', 'feature')
      return spawnSync('git', [...before, 'merge', '--no-commit', '--no-ff', 'main'], { cwd: dir, encoding: 'utf8' }).status
    },
    run(...a) {
      rmSync(join(dir, 'CHECK-RAN'), { force: true })
      const r = spawnSync(process.execPath, ['raptor-port/scripts/records-merge.mjs', ...a], { cwd: dir, encoding: 'utf8' })
      return { code: r.status, out: r.stdout + r.stderr, ran: existsSync(join(dir, 'CHECK-RAN')) }
    },
    done: () => rmSync(dir, { recursive: true, force: true }),
  }
  return c
}
const withRepo = (files, fn) => () => { const c = makeRepo(files); try { fn(c) } finally { c.done() } }

/* ---------- HANDOFF.md ---------- */
const block = (b, ...ls) => [`<!-- now:${b} -->`, `### \`${b}\``, ...ls, '<!-- /now -->', ''].join('\n') + '\n'
const handoff = (blocks, gate = 'Gate: 100 green (7 Nov).') => `# HANDOFF\n\nRead this first.\n\n## Now\n\n${blocks.join('')}## Next, in order\n\n1. the order\n\n## Gate baseline\n\n${gate}\n\n## Standing constraints\n\n- none\n`
const H0 = handoff([block('claude/a', '- a line'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])

test('HANDOFF: one-sided edits, a removal and two new blocks are settled; this branch\'s new block above main\'s', withRepo({ 'HANDOFF.md': H0 }, c => {
  const st = c.sides(
    x => x.write('HANDOFF.md', handoff([block('claude/mine', '- new, mine'), block('claude/a', '- a line, edited by a'), block('claude/b', '- b line')])),
    x => x.write('HANDOFF.md', handoff([block('claude/theirs', '- new, theirs'), block('claude/a', '- a line'), block('claude/b', '- b line, edited on main'), block('claude/merged', '- finished, merged')])))
  assert.equal(st, 1, 'the merge must clash')
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  /* Astra 1, Opus 1: the block this branch removed stays removed, though main still has it */
  assert.equal(c.read('HANDOFF.md'), handoff([block('claude/mine', '- new, mine'), block('claude/theirs', '- new, theirs'), block('claude/a', '- a line, edited by a'), block('claude/b', '- b line, edited on main')]))
  assert.ok(r.ran, 'with nothing left, the checks run')
  assert.match(r.out, /green/)
}))

test('HANDOFF: an edit to ANOTHER chat\'s block on this branch is kept (Astra 1, Opus 2 — no branch-name ownership)', withRepo({ 'HANDOFF.md': H0 }, c => {
  c.sides(
    x => x.write('HANDOFF.md', handoff([block('claude/records', '- the follow-up'), block('claude/a', '- a line'), block('claude/b', '- b line', '- D1930 recorded here by a records follow-up'), block('claude/merged', '- finished, merged')])),
    x => x.write('HANDOFF.md', handoff([block('claude/main-new', '- main\'s'), block('claude/a', '- a line'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.match(c.read('HANDOFF.md'), /D1930 recorded here/)
  assert.match(c.read('HANDOFF.md'), /claude\/main-new/)
}))

test('HANDOFF: a block both sides changed on one line is left in git\'s marks for that block alone; the rest settled; the checks not run', withRepo({ 'HANDOFF.md': H0 }, c => {
  c.sides(
    x => x.write('HANDOFF.md', handoff([block('claude/a', '- a line, ours'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged'), block('claude/x', '- x')])),
    x => x.write('HANDOFF.md', handoff([block('claude/a', '- a line, theirs'), block('claude/b', '- b line, theirs'), block('claude/merged', '- finished, merged')])))
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  const h = c.read('HANDOFF.md')
  assert.equal((h.match(/^<{7} /gm) || []).length, 1, 'one clash left')
  assert.match(h, /<{7} HEAD\n- a line, ours\n={7}\n- a line, theirs\n>{7} main\n/)
  assert.match(h, /- b line, theirs/); assert.match(h, /claude\/x/)
  assert.match(r.out, /LEFT for you in HANDOFF\.md:\n\s+- the ## Now block for claude\/a — changed on both sides/)
  assert.ok(!r.ran, 'with something left the checks must not run (Opus 7)')
}))

test('HANDOFF: two edits in different lines of one block merge as git would', withRepo({ 'HANDOFF.md': handoff([block('claude/a', '- one', '- two', '- three', '- four')]) }, c => {
  c.sides(x => x.edit('HANDOFF.md', t => t.replace('- one', '- one, ours').replace('Read this first.', 'Read this first, ours.')),
    x => x.edit('HANDOFF.md', t => t.replace('- four', '- four, theirs').replace('Read this first.', 'Read this first!')))
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  const h = c.read('HANDOFF.md')
  assert.match(h, /- one, ours\n- two\n- three\n- four, theirs\n/)
  assert.match(r.out, /the head of the file — changed on both sides/)
}))

test('HANDOFF: the gate baseline changed on both sides is left, even where its lines would merge (Astra 7, D1733)', withRepo({ 'HANDOFF.md': handoff([block('claude/a', '- a')], 'Gate: 100 green (7 Nov).\n\nNotes.') }, c => {
  const st = c.sides(x => x.write('HANDOFF.md', handoff([block('claude/n1', '- n1'), block('claude/a', '- a, ours')], 'Gate: 120 green (8 Nov, ours).\n\nNotes.')),
    x => x.write('HANDOFF.md', handoff([block('claude/n2', '- n2'), block('claude/a', '- a')], 'Gate: 100 green (7 Nov).\n\nNotes, theirs.')))
  assert.equal(st, 1, 'the merge must clash')
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  assert.match(r.out, /the section "## Gate baseline" — changed on both sides \(which count is newer/)
  assert.match(c.read('HANDOFF.md'), /- a, ours/)
}))

/* the narrow re-read (Opus re-read 5, 8 Nov 26): the "different new headings at one place" leave, meant for the skill
   log's days, left the WHOLE handoff — every chat's block with it. A handoff section holds no other side's entries, so
   both are kept, this branch's first */
test('HANDOFF: two different new sections added at one place are both kept, this branch\'s first (Opus re-read 5)', withRepo({ 'HANDOFF.md': H0 }, c => {
  c.sides(x => x.edit('HANDOFF.md', t => t + '\n## Ours\n\n- ours\n'), x => x.edit('HANDOFF.md', t => t + '\n## Theirs\n\n- theirs\n'))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.equal(c.read('HANDOFF.md'), H0 + '\n## Ours\n\n- ours\n\n## Theirs\n\n- theirs\n')
}))
test('HANDOFF: a block removed on one side and changed on the other is left', withRepo({ 'HANDOFF.md': H0 }, c => {
  c.sides(x => x.write('HANDOFF.md', handoff([block('claude/a', '- a line'), block('claude/b', '- b line'), block('claude/z', '- z')])),
    x => x.write('HANDOFF.md', handoff([block('claude/a', '- a line'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged, and one more fact')])))
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  assert.match(r.out, /claude\/merged — removed on this branch and changed on the other/)
  assert.match(c.read('HANDOFF.md'), /<{7} HEAD\n={7}\n<!-- now:claude\/merged -->/)
}))

test('a hand-edited working copy is refused by name and left byte for byte (Opus 3)', withRepo({ 'HANDOFF.md': H0 }, c => {
  c.sides(x => x.edit('HANDOFF.md', t => t.replace('- a line', '- a, ours')), x => x.edit('HANDOFF.md', t => t.replace('- a line', '- a, theirs')))
  c.edit('HANDOFF.md', t => t.replace('Read this first.', 'Read this first — the chat started its part.'))
  const before = c.read('HANDOFF.md')
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  assert.match(r.out, /HANDOFF\.md:\n\s+- its working copy is not what git wrote/)
  assert.equal(c.read('HANDOFF.md'), before)
}))

/* Opus 4 (the code read, 8 Nov 26): a conflict style given on the command line only (git -c merge.conflictStyle=…)
   made git's own output look hand-edited, and every record file was refused */
for (const style of ['diff3', 'zdiff3']) {
  test(`a merge run with the ${style} conflict style on the command line only is still recognised as git's own (Opus 4)`, withRepo({ 'HANDOFF.md': H0 }, c => {
    const st = c.sides(x => x.write('HANDOFF.md', handoff([block('claude/n1', '- n1'), block('claude/a', '- a, ours'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])),
      x => x.write('HANDOFF.md', handoff([block('claude/n2', '- n2'), block('claude/a', '- a, theirs'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])), ['-c', `merge.conflictStyle=${style}`])
    assert.equal(st, 1, 'the merge must clash')
    const r = c.run()
    assert.equal(r.code, 2, r.out)
    assert.doesNotMatch(r.out, /not what git wrote/)
    assert.match(r.out, /settled: HANDOFF\.md \(in part\)/)
    assert.match(c.read('HANDOFF.md'), /claude\/n1[\s\S]*claude\/n2/)
    assert.match(c.read('HANDOFF.md'), /^\|{7} /m, `the block left keeps git's ${style} marks`)
  }))
}

test('a second run on the same input changes nothing; --dry-run writes nothing', withRepo({ 'HANDOFF.md': H0 }, c => {
  c.sides(x => x.write('HANDOFF.md', handoff([block('claude/new1', '- n1'), block('claude/a', '- a line'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])),
    x => x.write('HANDOFF.md', handoff([block('claude/new2', '- n2'), block('claude/a', '- a line'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])))
  const conflicted = c.read('HANDOFF.md')
  const d = c.run('--dry-run')
  assert.equal(d.code, 0, d.out); assert.match(d.out, /would settle: HANDOFF\.md/)
  assert.equal(c.read('HANDOFF.md'), conflicted, '--dry-run must write nothing')
  assert.ok(!d.ran, '--dry-run runs no check')
  const r1 = c.run(); assert.equal(r1.code, 0, r1.out)
  const once = c.read('HANDOFF.md')
  const r2 = c.run(); assert.equal(r2.code, 0, r2.out)
  assert.match(r2.out, /already settled by an earlier run, unchanged: HANDOFF\.md/)
  assert.equal(c.read('HANDOFF.md'), once)
  assert.equal(c.git('diff', '--name-only', '--diff-filter=U').trim(), 'HANDOFF.md', 'it never stages anything')
}))

/* Astra's and Opus's tidiness notes 2 (the code read, 8 Nov 26): no report line that is not true */
test('a first run that settles nothing never says "already settled by an earlier run"', withRepo({ 'HANDOFF.md': H0 }, c => {
  c.sides(x => x.edit('HANDOFF.md', t => t.replace('- a line', '- a, ours')), x => x.edit('HANDOFF.md', t => t.replace('- a line', '- a, theirs')))
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  assert.doesNotMatch(r.out, /already settled/)
}))

test('a revert on one side is settled like any one-sided change', withRepo({ 'HANDOFF.md': H0 }, c => {
  c.git('checkout', '-q', '-b', 'feature')
  c.edit('HANDOFF.md', t => t.replace('- a line', '- a line, a mistake')); c.commit('mistake')
  c.git('checkout', '-q', 'main'); c.git('merge', '-q', '--ff-only', 'feature'); c.git('checkout', '-q', 'feature')
  c.git('revert', '--no-edit', 'HEAD'); c.edit('HANDOFF.md', t => t.replace('Read this first.', 'Read this first, ours.')); c.commit('ours')
  c.git('checkout', '-q', 'main'); c.edit('HANDOFF.md', t => t.replace('- b line', '- b, theirs').replace('Read this first.', 'Read it first.')); c.commit('theirs'); c.git('checkout', '-q', 'feature')
  spawnSync('git', ['merge', '--no-commit', '--no-ff', 'main'], { cwd: c.dir })
  const r = c.run()
  const h = c.read('HANDOFF.md')
  assert.match(h, /- a line\n/); assert.doesNotMatch(h, /a mistake/); assert.match(h, /- b, theirs/)
  assert.match(r.out, /the head of the file — changed on both sides/)
}))

/* ---------- the skill log ---------- */
const obs = (n, title, ...body) => [`### Observation ${n}: ${title}`, '', ...body, ''].join('\n') + '\n'
const LOG0 = '# Skill Observation Log\n\nObservations captured during task-oriented work.\n\n## 2026-11-01\n\n' + obs(9, 'nine', 'body nine', 'a line ending in a carriage return\r') + obs(10, 'ten', 'body ten')

test('skill log: a doubled number is renumbered past every branch\'s highest; only this branch\'s citations rewritten; main\'s first (Astra 4, Opus 9)', withRepo({ '.claude/skill-observations/log.md': LOG0, 'HANDOFF.md': H0 }, c => {
  /* another open branch already holds 15 */
  c.git('checkout', '-q', '-b', 'other'); c.edit('.claude/skill-observations/log.md', t => t + obs(15, 'fifteen', 'b')); c.commit('other')
  c.git('update-ref', 'refs/remotes/origin/other', 'other'); c.git('checkout', '-q', 'main'); c.git('branch', '-q', '-D', 'other')
  c.sides(
    x => { x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'ours eleven', 'see Observation 11 and Observation 10') + obs(12, 'ours twelve', 'follows Observation 11', 'as Observation 11, ours eleven, said')); x.edit('HANDOFF.md', t => t.replace('- a line', '- a line (Observation 11)')) },
    x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'main eleven', 'main cites Observation 11')))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  /* round 3 (the host's guardrail after the narrow re-read — Astra re-read 1, Opus re-read 4): a citation is NEVER
     rewritten — not inside the renumbered note, not in a line naming its title; every line of this branch's that cites
     the renumbered number is listed with its place in the merged file */
  const log = c.read('.claude/skill-observations/log.md')
  assert.equal(log, LOG0 + obs(11, 'main eleven', 'main cites Observation 11') + obs(16, 'ours eleven', 'see Observation 11 and Observation 10') + obs(12, 'ours twelve', 'follows Observation 11', 'as Observation 11, ours eleven, said'))
  const at = s => log.split('\n').indexOf(s) + 1
  for (const s of ['see Observation 11 and Observation 10', 'follows Observation 11', 'as Observation 11, ours eleven, said'])
    assert.ok(r.out.includes(`look by hand: .claude/skill-observations/log.md:${at(s)} cites Observation 11 (renumbered here to 16)`), `${s} listed at its line ${at(s)}:\n${r.out}`)
  assert.ok(!r.out.includes(`log.md:${at('main cites Observation 11')} cites`), 'main\'s own line is not this branch\'s to look at')
  assert.doesNotMatch(r.out, /rewritten:/)
  assert.match(r.out, /Observation 11 → 16 "ours eleven"/)
  assert.ok(r.out.includes(`look by hand: HANDOFF.md:${c.read('HANDOFF.md').split('\n').indexOf('- a line (Observation 11)') + 1} cites Observation 11 (renumbered here to 16)`), r.out)
  assert.match(c.read('.claude/skill-observations/log.md'), /carriage return\r\n/, 'a carriage return in a line is kept')
  /* and a second run changes nothing */
  const again = c.run(); assert.equal(again.code, 0, again.out); assert.match(again.out, /already settled by an earlier run/)
}))

/* Astra 3 (the code read, 8 Nov 26): a line being new on this branch says who wrote the citation, not which note it
   means — "see Observation 11 on main" must stay attached to main's note */
test('skill log: a citation of main\'s note in this branch\'s lines is not redirected to the renumbered note (Astra 3)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  const st = c.sides(x => x.edit('.claude/skill-observations/log.md', t => t.replace('body nine\n', 'body nine\nSee Observation 11 on main, titled main finding.\n') + obs(11, 'branch finding', 'b')),
    x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'main finding', 'm')))
  assert.equal(st, 1, 'the merge must clash')
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /Observation 11 → 12 "branch finding"/)
  const log = c.read('.claude/skill-observations/log.md')
  assert.match(log, /See Observation 11 on main, titled main finding\./)
  assert.match(log, /### Observation 12: branch finding/)
  assert.ok(r.out.includes(`look by hand: .claude/skill-observations/log.md:${log.split('\n').indexOf('See Observation 11 on main, titled main finding.') + 1} cites Observation 11 (renumbered here to 12)`), r.out)
}))
/* the narrow re-read (Astra re-read 1, Opus re-read 4): inside this branch's own renumbered note, "See Observation 11
   on main" and "unlike main's Observation 11" mean MAIN's note — the step rewrote both to the note's new number */
test('skill log: a citation inside the renumbered note itself is never rewritten, only listed (Astra re-read 1, Opus re-read 4)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'Branch finding', 'See Observation 11 on main.', 'unlike main\'s Observation 11, this one is about X')),
    x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'Main finding', 'm')))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  const log = c.read('.claude/skill-observations/log.md')
  assert.equal(log, LOG0 + obs(11, 'Main finding', 'm') + obs(12, 'Branch finding', 'See Observation 11 on main.', 'unlike main\'s Observation 11, this one is about X'))
  for (const s of ['See Observation 11 on main.', 'unlike main\'s Observation 11, this one is about X'])
    assert.ok(r.out.includes(`look by hand: .claude/skill-observations/log.md:${log.split('\n').indexOf(s) + 1} cites Observation 11 (renumbered here to 12)`), `${s}:\n${r.out}`)
}))

/* Astra 5 (the code read, 8 Nov 26): a heading inside a code block is an example — never cut as a note, never counted
   for the next number, never renumbered */
test('skill log: a fenced example heading is text — not a note, not a number, not renumbered (Astra 5)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  const ours = obs(11, 'ours eleven', 'body', '~~~', '### Observation 99: an example', '### Observation 11: an example of mine', '~~~', '```', '### Observation 10: another', '```')
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + ours), x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'main eleven', 'm')))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /Observation 11 → 12 "ours eleven"/)
  assert.equal(c.read('.claude/skill-observations/log.md'), LOG0 + obs(11, 'main eleven', 'm') + ours.replace('### Observation 11: ours eleven', '### Observation 12: ours eleven'))
}))

/* the narrow re-read (Opus re-read 3, 8 Nov 26): a lone "```" that never closes hid every later note heading — this
   branch's 12 sat "inside" the open fence, was not cut as a note, and the file ended with Observation 12 twice. Round 3:
   a fence still open at the end of the text is not a fence */
/* ROUND 4 (Astra r3-3, 9 Nov 26): each side's stray fence read as text on its own, but joined, two strays close each
   other across real notes and hide them. So a log whose base or either side holds a code block that never closes is
   left whole (round 3 settled the one-sided case by renumbering both; the gate still names the stray fence) */
const leftWholeForFence = r => {
  assert.equal(r.code, 2, r.out)
  assert.match(r.out, /LEFT for you in \.claude\/skill-observations\/log\.md:\n\s+- left whole — .*code block that never closes/)
}
test('skill log: a code block that never closes on one side leaves the log whole (round 4; was renumbered — Opus re-read 3)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'ours with a stray fence', 'before', '```', 'after') + obs(12, 'ours later', 'b')),
    x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'main eleven', 'm') + obs(12, 'main twelve', 'm')))
  const before = c.read('.claude/skill-observations/log.md')
  leftWholeForFence(c.run())
  assert.equal(c.read('.claude/skill-observations/log.md'), before, 'git\'s own marks untouched')
}))
test('skill log: a stray fence on each side never pairs up across real notes — left whole (round 4 — Astra r3-3)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'ours with a stray fence', '```') + obs(12, 'ours later', 'b')),
    x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'main with a stray fence', '```') + obs(12, 'main later', 'm')))
  const before = c.read('.claude/skill-observations/log.md')
  leftWholeForFence(c.run())
  assert.equal(c.read('.claude/skill-observations/log.md'), before, 'no note turned into a fenced example')
}))
/* the replay's finding (7c3b3afe1 and its like): the log's last note ends with no blank line, so two notes added after it
   on both sides ran together, a heading straight under the other note's last line */
test('skill log: notes both sides added after a last note with no blank line stay apart by one', withRepo({ '.claude/skill-observations/log.md': LOG0.replace(/\n$/, '') }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + '\n' + obs(11, 'ours', 'o').replace(/\n$/, '')), x => x.edit('.claude/skill-observations/log.md', t => t + '\n' + obs(12, 'theirs', 't').replace(/\n$/, '')))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.equal(c.read('.claude/skill-observations/log.md'), LOG0 + obs(12, 'theirs', 't') + obs(11, 'ours', 'o').replace(/\n$/, ''))
}))

/* Astra 1 (the code read, 8 Nov 26): a note added as the file's last, with no line ending at all, ran straight into the
   next note's heading ("theirs### Observation 11: ours") — zero, one and two endings, both headings and bodies whole */
for (const [name, end] of [['no line ending', ''], ['one line ending', '\n'], ['two line endings', '\n\n']]) {
  test(`skill log: notes both sides added as the last, with ${name}, stay whole and apart (Astra 1)`, withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
    c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + '### Observation 11: ours\n\nours' + end), x => x.edit('.claude/skill-observations/log.md', t => t + '### Observation 12: theirs\n\ntheirs' + end))
    const r = c.run()
    assert.equal(r.code, 0, r.out)
    assert.equal(c.read('.claude/skill-observations/log.md'), LOG0 + '### Observation 12: theirs\n\ntheirs\n\n' + '### Observation 11: ours\n\nours' + end)
  }))
}
/* the insertion-only files read git's own clash regions, and git ends every line of a region — so a side whose text did
   not end at a line end cannot be told apart there; round 3 (the host's guardrails, 8 Nov 26): such a region is LEFT,
   never joined (was settled — Astra 1) */
test('rulings archive: rows both sides added as the last line, with no line ending, are left (round 3; Astra 1)', withRepo({ 'DECISIONS-ARCHIVE.md': '# Archive\n\n| # | ruling |\n|---|---|\n| D1 | one |\n' }, c => {
  c.sides(x => x.edit('DECISIONS-ARCHIVE.md', t => t + '| D2 | ours |'), x => x.edit('DECISIONS-ARCHIVE.md', t => t + '| D3 | theirs |'))
  const before = c.read('DECISIONS-ARCHIVE.md')
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  assert.equal(c.read('DECISIONS-ARCHIVE.md'), before, 'nothing settled there: git\'s own marks untouched')
}))

/* Opus 5, 6 (the code read, 8 Nov 26): the other chats on this PC work in worktrees of the same repository, so their
   unpushed notes are local branches — counted too; and a second run after a fetch that brought a higher number keeps
   the number the first run chose, rather than calling its own file hand-edited */
test('skill log: a local branch\'s number counts, and a run after a fetch keeps the number already chosen (Opus 5, 6)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  c.git('checkout', '-q', '-b', 'other'); c.edit('.claude/skill-observations/log.md', t => t + obs(15, 'fifteen', 'b')); c.commit('other'); c.git('checkout', '-q', 'main')
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'ours eleven', 'o')), x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'main eleven', 'm')))
  const r1 = c.run()
  assert.equal(r1.code, 0, r1.out)
  assert.match(r1.out, /Observation 11 → 16 "ours eleven"/)
  const once = c.read('.claude/skill-observations/log.md')
  /* a fetch brings a branch holding 30 */
  const wt = c.dir + '-later'
  c.git('worktree', 'add', '-q', '--detach', wt, 'main')
  try {
    const log = join(wt, '.claude/skill-observations/log.md')
    writeFileSync(log, readFileSync(log, 'utf8') + obs(30, 'thirty', 'x'))
    execFileSync('git', ['commit', '-q', '-am', 'later'], { cwd: wt })
    c.git('update-ref', 'refs/remotes/origin/later', execFileSync('git', ['rev-parse', 'HEAD'], { cwd: wt, encoding: 'utf8' }).trim())
  } finally { c.git('worktree', 'remove', '--force', wt) }
  const r2 = c.run()
  assert.equal(r2.code, 0, r2.out)
  assert.match(r2.out, /already settled by an earlier run, unchanged: \.claude\/skill-observations\/log\.md/)
  assert.equal(c.read('.claude/skill-observations/log.md'), once)
}))

test('skill log: with no other branch, the new number is past this branch\'s own higher notes', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'ours eleven', 'x') + obs(12, 'ours twelve', 'y')),
    x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'main eleven', 'z')))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /Observation 11 → 13 "ours eleven"/)
  assert.doesNotMatch(r.out, /Observation 12 →/, 'a number that does not clash is never moved')
}))

test('skill log: a note archived on one side and its status changed on the other is left (Astra 3, Opus 5)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t.replace('body ten', 'body ten\n**Status:** done')),
    x => x.edit('.claude/skill-observations/log.md', t => t.replace(obs(10, 'ten', 'body ten'), '') + obs(11, 'eleven', 'e')))
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  assert.match(r.out, /Observation 10 — removed on main's side and changed on the other/)
  assert.match(c.read('.claude/skill-observations/log.md'), /### Observation 11: eleven/)
}))

test('a refused skill log reports no renumber (the tidiness notes 2)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'ours', 'o')), x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'main', 'm')))
  c.edit('.claude/skill-observations/log.md', t => t.replace('# Skill Observation Log', '# Skill Observation Log, edited by the chat'))
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  assert.match(r.out, /its working copy is not what git wrote/)
  assert.doesNotMatch(r.out, /renumbered/)
}))

/* ---------- the insertion-only files ---------- */
const LEDGER0 = '# Walk ledger\n\n<!-- ledger:rows -->\n| 7 Nov | a walk | found 1 |\n<!-- /ledger:rows -->\n\n## The figures\n'
test('walk ledger: a row each side added at the same place — this branch\'s, then main\'s', withRepo({ 'raptor-port/docs/walk-ledger.md': LEDGER0 }, c => {
  c.sides(x => x.edit('raptor-port/docs/walk-ledger.md', t => t.replace('<!-- /ledger', '| 8 Nov | ours | found 0 |\n<!-- /ledger')),
    x => x.edit('raptor-port/docs/walk-ledger.md', t => t.replace('<!-- /ledger', '| 8 Nov | theirs | found 2 |\n<!-- /ledger')))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.equal(c.read('raptor-port/docs/walk-ledger.md'), LEDGER0.replace('<!-- /ledger', '| 8 Nov | ours | found 0 |\n| 8 Nov | theirs | found 2 |\n<!-- /ledger'))
}))

test('walk ledger: a row edited on one side and a row added on the other is left (Astra 3, Opus 5)', withRepo({ 'raptor-port/docs/walk-ledger.md': LEDGER0 }, c => {
  c.sides(x => x.edit('raptor-port/docs/walk-ledger.md', t => t.replace('found 1 |', 'found 1, fixed |')),
    x => x.edit('raptor-port/docs/walk-ledger.md', t => t.replace('<!-- /ledger', '| 8 Nov | theirs | found 2 |\n<!-- /ledger')))
  const before = c.read('raptor-port/docs/walk-ledger.md')
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  assert.match(r.out, /LEFT for you in raptor-port\/docs\/walk-ledger\.md/)
  assert.equal(c.read('raptor-port/docs/walk-ledger.md'), before, 'nothing settled there: git\'s own marks untouched')
  assert.equal((before.match(/found 1/g) || []).length, 2, 'both versions shown, neither doubled into the file unmarked')
}))

const FMAP0 = '# File map\n\n8 Nov 26 on `claude/old` (a paragraph).\n\n| file | what |\n|---|---|\n| a.ts | a |\n'
test('file map: a paragraph each side added at the top changelog are both kept (Opus 8)', withRepo({ 'raptor-port/docs/file-map.md': FMAP0 }, c => {
  c.sides(x => x.edit('raptor-port/docs/file-map.md', t => t.replace('# File map\n\n', '# File map\n\n8 Nov 26 on `claude/ours` (added x).\n\n')),
    x => x.edit('raptor-port/docs/file-map.md', t => t.replace('# File map\n\n', '# File map\n\n8 Nov 26 on `claude/theirs` (added y).\n\n')))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.equal(c.read('raptor-port/docs/file-map.md'), FMAP0.replace('# File map\n\n', '# File map\n\n8 Nov 26 on `claude/ours` (added x).\n\n8 Nov 26 on `claude/theirs` (added y).\n\n'))
}))

const DARCH0 = '# Archive\n\n## Moved 7 Nov 26\n\n| # | Date | ruling |\n|---|---|---|\n| D1 | 7 Nov 26 | one |\n'
/* ROUND 3 (the host's decision after the narrow re-reads, 8 Nov 26 — a cascade of faults in the joining logic): a region
   of an insertion-only file is settled ONLY when both sides only inserted, share no line that is not blank, hold no line
   starting with `#` and no table head, and each is whole rows or whole paragraphs. Anything else is left exactly as git
   marked it — fewer settled, never silently wrong. The cases the earlier rounds settled with headings are left now. */
const leftAsGitMarked = (c, f, r, before) => {
  assert.equal(r.code, 2, r.out)
  assert.match(r.out, new RegExp(`LEFT for you in ${f.replace(/[.]/g, '\\.')}`))
  assert.equal(c.read(f), before, 'nothing settled there: git\'s own marks untouched')
}
test('rulings archive: a "## Moved <day>" heading both sides inserted is left for the chat (round 3; was kept once — Astra 8, Opus 13)', withRepo({ 'DECISIONS-ARCHIVE.md': DARCH0 }, c => {
  const day1 = row => '\n## Moved 8 Nov 26\n\n| # | Date | ruling |\n|---|---|---|\n' + row + '\n'
  c.sides(x => x.edit('DECISIONS-ARCHIVE.md', t => t + day1('| D2 | 8 Nov 26 | ours |')), x => x.edit('DECISIONS-ARCHIVE.md', t => t + day1('| D3 | 8 Nov 26 | theirs |')))
  const before = c.read('DECISIONS-ARCHIVE.md')
  leftAsGitMarked(c, 'DECISIONS-ARCHIVE.md', c.run(), before)
}))
const day = (d, ...rows) => `\n## Moved ${d} Nov 26\n\n| # | Date | ruling |\n|---|---|---|\n${rows.map(r => `| ${r} | ${d} Nov 26 | x |\n`).join('')}`
test('rulings archive: one day heading both sides added at different places is left, never doubled (Opus 1)', withRepo({ 'DECISIONS-ARCHIVE.md': DARCH0 }, c => {
  c.sides(x => x.edit('DECISIONS-ARCHIVE.md', t => t + day(8, 'D2')), x => x.edit('DECISIONS-ARCHIVE.md', t => t + '| D3 | 7 Nov 26 | later |\n' + day(8, 'D4')))
  const before = c.read('DECISIONS-ARCHIVE.md')
  leftAsGitMarked(c, 'DECISIONS-ARCHIVE.md', c.run(), before)
}))
test('rulings archive: main\'s row and this branch\'s new day at one place are left (round 3; was settled — Astra 2, Opus 2)', withRepo({ 'DECISIONS-ARCHIVE.md': DARCH0 }, c => {
  c.sides(x => x.edit('DECISIONS-ARCHIVE.md', t => t + day(8, 'D2') + day(9, 'D3')), x => x.edit('DECISIONS-ARCHIVE.md', t => t + day(8, 'D4')))
  const before = c.read('DECISIONS-ARCHIVE.md')
  leftAsGitMarked(c, 'DECISIONS-ARCHIVE.md', c.run(), before)
}))
test('rulings archive: both sides opening different new days at one place is left (Astra 2)', withRepo({ 'DECISIONS-ARCHIVE.md': DARCH0 }, c => {
  c.sides(x => x.edit('DECISIONS-ARCHIVE.md', t => t + day(8, 'D2') + day(9, 'D3')), x => x.edit('DECISIONS-ARCHIVE.md', t => t + day(8, 'D4') + day(10, 'D5')))
  const before = c.read('DECISIONS-ARCHIVE.md')
  leftAsGitMarked(c, 'DECISIONS-ARCHIVE.md', c.run(), before)
}))
/* the replay's finding (ab43e7413): main opened the day ABOVE a base row, so its heading stood outside the clash and this
   branch's inside it */
test('rulings archive: a day heading inside the clash that already stands outside it is left, never doubled', withRepo({ 'DECISIONS-ARCHIVE.md': DARCH0 + '| D9 | 7 Nov 26 | nine |\n' }, c => {
  const st = c.sides(x => x.edit('DECISIONS-ARCHIVE.md', t => t + day(8, 'D2')),
    x => x.edit('DECISIONS-ARCHIVE.md', t => t.replace('| D9 |', '| D3 | 7 Nov 26 | three |\n' + day(8) + '| D9 |') + '| D4 | 8 Nov 26 | four |\n'))
  assert.equal(st, 1, 'the merge must clash')
  const before = c.read('DECISIONS-ARCHIVE.md')
  leftAsGitMarked(c, 'DECISIONS-ARCHIVE.md', c.run(), before)
}))
test('rulings archive: rows both sides added under the same day, no heading in the clash, are settled — this branch\'s, then main\'s', withRepo({ 'DECISIONS-ARCHIVE.md': DARCH0 }, c => {
  c.sides(x => x.edit('DECISIONS-ARCHIVE.md', t => t + '| D2 | 7 Nov 26 | ours |\n'), x => x.edit('DECISIONS-ARCHIVE.md', t => t + '| D3 | 7 Nov 26 | theirs |\n'))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.equal(c.read('DECISIONS-ARCHIVE.md'), DARCH0 + '| D2 | 7 Nov 26 | ours |\n| D3 | 7 Nov 26 | theirs |\n')
}))
test('backlog archive: items both sides archived at one place are left (round 3; was settled with a blank line — Opus 2)', withRepo({ 'OUTSTANDING-ARCHIVE.md': '# Archive\n\n## Moved 6 Nov 26\n\n### [A] a\n\nbody a\n' }, c => {
  c.sides(x => x.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n## Moved 7 Nov 26\n\n### [B] b\n\nbody b\n'), x => x.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n## Moved 7 Nov 26\n\n### [C] c\n\nbody c\n'))
  const before = c.read('OUTSTANDING-ARCHIVE.md')
  leftAsGitMarked(c, 'OUTSTANDING-ARCHIVE.md', c.run(), before)
}))
/* the narrow re-read's findings (Opus re-read 1, 2, 7): the shared start fused two versions of one archived item, the
   shared end moved a last line from one item to the other, and a day heading written with different spacing doubled a
   table head inside one table */
test('backlog archive: two versions of one item archived on both sides are never fused into one (Opus re-read 1)', withRepo({ 'OUTSTANDING-ARCHIVE.md': '# Archive\n\n### [A] a\n\nbody a\n' }, c => {
  c.sides(x => x.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n### [X] the item\n\nFirst line.\nBuilt and live 8 Nov 26 (PR 700).\n'), x => x.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n### [X] the item\n\nFirst line.\nDropped on his word, 8 Nov 26.\n'))
  const before = c.read('OUTSTANDING-ARCHIVE.md')
  leftAsGitMarked(c, 'OUTSTANDING-ARCHIVE.md', c.run(), before)
}))
test('backlog: one new item added on both sides with different lines is never fused (Opus re-read 1)', withRepo({ 'OUTSTANDING.md': '# Outstanding\n\n## Items\n\n### [ALPHA] a\n\nbody\n' }, c => {
  c.sides(x => x.edit('OUTSTANDING.md', t => t + '\n### [NEW] new\n\n**Place:** the board\n'), x => x.edit('OUTSTANDING.md', t => t + '\n### [NEW] new\n\n**Place:** the week\n'))
  const before = c.read('OUTSTANDING.md')
  leftAsGitMarked(c, 'OUTSTANDING.md', c.run(), before)
}))
/* ROUND 4 (Astra r3-1, Opus r3-2, 9 Nov 26): the guard looked only inside the clash, so lines both sides appended to an
   EXISTING item's body were joined into one item, and an indented line continuing the entry above the clash was moved
   under the other side's new entry. A region is settled only at an entry boundary — the line just above it blank, a
   table row or the start of the file — and neither side opening with an indented line */
for (const f of ['OUTSTANDING.md', 'OUTSTANDING-ARCHIVE.md']) {
  test(`${f}: lines both sides appended to an existing item's body are left, never joined (round 4 — Astra r3-1)`, withRepo({ [f]: '# Items\n\n### [A] a\n\nbody a\n\n### [X] the item\n\nFirst line.\n' }, c => {
    c.sides(x => x.edit(f, t => t + 'Built and live 8 Nov 26 (PR 700).\n'), x => x.edit(f, t => t + 'Dropped on his word, 8 Nov 26.\n'))
    const before = c.read(f)
    leftAsGitMarked(c, f, c.run(), before)
  }))
}
test('backlog: an indented sub-bullet main added under an entry never moves under this branch\'s new entry (round 4 — Opus r3-2)', withRepo({ 'OUTSTANDING.md': '# Outstanding\n\n## Priority list\n\n- **Night 1:** [A] first\n- **Night 2:** [B] second\n\n## Items\n' }, c => {
  c.sides(x => x.edit('OUTSTANDING.md', t => t.replace('[B] second\n', '[B] second\n- **Night 3:** [C] ours\n')), x => x.edit('OUTSTANDING.md', t => t.replace('[B] second\n', '[B] second\n  - (b) of night 2: [D] theirs\n')))
  const before = c.read('OUTSTANDING.md')
  leftAsGitMarked(c, 'OUTSTANDING.md', c.run(), before)
}))
test('file map: an indented line continuing a note never moves under the other side\'s new note (round 4 — Opus r3-2)', withRepo({ 'raptor-port/docs/file-map.md': '# File map\n\n8 Nov 26 on `claude/old` (a note).\n\n| file | what |\n|---|---|\n' }, c => {
  c.sides(x => x.edit('raptor-port/docs/file-map.md', t => t.replace('(a note).\n', '(a note).\n8 Nov 26 on `claude/ours` (x).\n')), x => x.edit('raptor-port/docs/file-map.md', t => t.replace('(a note).\n', '(a note).\n  and its follow-up (y).\n')))
  const before = c.read('raptor-port/docs/file-map.md')
  leftAsGitMarked(c, 'raptor-port/docs/file-map.md', c.run(), before)
}))
test('backlog archive: a last line both items share is never moved from one to the other (Opus re-read 2)', withRepo({ 'OUTSTANDING-ARCHIVE.md': '# Archive\n\n### [A] a\n\nbody a\n' }, c => {
  c.sides(x => x.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n### [X] x\n\nbody x\nStatus: closed, live.\n'), x => x.edit('OUTSTANDING-ARCHIVE.md', t => t + '\n### [Y] y\n\nbody y\nStatus: closed, live.\n'))
  const before = c.read('OUTSTANDING-ARCHIVE.md')
  leftAsGitMarked(c, 'OUTSTANDING-ARCHIVE.md', c.run(), before)
}))
test('rulings archive: one day heading written with different spacing never doubles a table head (Opus re-read 7)', withRepo({ 'DECISIONS-ARCHIVE.md': DARCH0 }, c => {
  c.sides(x => x.edit('DECISIONS-ARCHIVE.md', t => t + '\n## Moved 8 Nov 26\n\n| # | Date | ruling |\n|---|---|---|\n| D2 | 8 Nov 26 | ours |\n'), x => x.edit('DECISIONS-ARCHIVE.md', t => t + '\n## Moved 8 Nov 26\n| # | Date | ruling |\n|---|---|---|\n| D3 | 8 Nov 26 | theirs |\n'))
  const before = c.read('DECISIONS-ARCHIVE.md')
  leftAsGitMarked(c, 'DECISIONS-ARCHIVE.md', c.run(), before)
}))
/* the file map's notes at its head are lines one under the other: under round 3's rule a paragraph-shaped insertion gets
   one blank line between this branch's text and main's (the host's rule; the chats wrote them with none — the replay
   counts those files as different) */
test('file map: a note line each side added at the head — this branch\'s, one blank line, then main\'s (round 3)', withRepo({ 'raptor-port/docs/file-map.md': '# File map\n\n8 Nov 26 on `claude/old` (a note).\n\n| file | what |\n|---|---|\n' }, c => {
  c.sides(x => x.edit('raptor-port/docs/file-map.md', t => t.replace('# File map\n\n', '# File map\n\n8 Nov 26 on `claude/ours` (x).\n')),
    x => x.edit('raptor-port/docs/file-map.md', t => t.replace('# File map\n\n', '# File map\n\n8 Nov 26 on `claude/theirs` (y).\n')))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.equal(c.read('raptor-port/docs/file-map.md'), '# File map\n\n8 Nov 26 on `claude/ours` (x).\n\n8 Nov 26 on `claude/theirs` (y).\n8 Nov 26 on `claude/old` (a note).\n\n| file | what |\n|---|---|\n')
}))
test('file map: a row both sides added the same is left (round 3; was kept once — Opus 3)', withRepo({ 'raptor-port/docs/file-map.md': FMAP0 }, c => {
  c.sides(x => x.edit('raptor-port/docs/file-map.md', t => t + '| shared.ts | same |\n| o.ts | o |\n| z.ts | z |\n'), x => x.edit('raptor-port/docs/file-map.md', t => t + '| shared.ts | same |\n| t.ts | t |\n| z.ts | z |\n'))
  const before = c.read('raptor-port/docs/file-map.md')
  leftAsGitMarked(c, 'raptor-port/docs/file-map.md', c.run(), before)
}))
/* ROUND 3 (the host's guardrail after the narrow re-read, 8 Nov 26 — Astra re-read 2 and its mirror): a note could still
   move under the wrong day heading, so a day heading added on EITHER side since the base leaves the whole log for the
   chat — which note goes under which day is never guessed */
const leftWholeForDays = r => {
  assert.equal(r.code, 2, r.out)
  assert.match(r.out, /LEFT for you in \.claude\/skill-observations\/log\.md:\n\s+- left whole — .*changed the day headings/)
}
test('skill log: a day heading both sides opened is left whole (round 3; was settled — Astra 2)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + '## 2026-11-08\n\n' + obs(13, 'ours')),
    x => x.edit('.claude/skill-observations/log.md', t => t + '## 2026-11-08\n\n' + obs(11, 'main') + '## 2026-11-09\n\n' + obs(12, 'main later')))
  const before = c.read('.claude/skill-observations/log.md')
  leftWholeForDays(c.run())
  assert.equal(c.read('.claude/skill-observations/log.md'), before, 'git\'s own marks untouched')
}))
test('skill log: both sides opening different new days at one place is left whole (Astra 2)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + '## 2026-11-09\n\n' + obs(12, 'ours')), x => x.edit('.claude/skill-observations/log.md', t => t + '## 2026-11-08\n\n' + obs(11, 'main')))
  leftWholeForDays(c.run())
}))
test('skill log: a day heading only this branch added is left whole (Astra re-read 2)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + '## 2026-11-08\n\n' + obs(12, 'ours on the new day')), x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'main under the old day')))
  const before = c.read('.claude/skill-observations/log.md')
  leftWholeForDays(c.run())
  assert.equal(c.read('.claude/skill-observations/log.md'), before, 'git\'s own marks untouched')
}))
/* ROUND 4 (Astra r3-2, Opus r3-1, 9 Nov 26): the count of day headings missed a heading MOVED (the same count) and one
   REMOVED (a skill review archiving a whole day) — each carried a new note of the other side under another day. Now the
   log is left whole when either side's day headings, with the base notes under each, differ from the base's at all */
const LOG2 = '# Skill Observation Log\n\nObservations captured during task-oriented work.\n\n## 2026-11-07\n\n' + obs(10, 'ten') + '## 2026-11-08\n\n' + obs(20, 'twenty')
const moved = '# Skill Observation Log\n\nObservations captured during task-oriented work.\n\n## 2026-11-07\n\n## 2026-11-08\n\n' + obs(10, 'ten') + obs(11, 'ours') + obs(20, 'twenty')
const added12 = LOG2.replace(obs(20, 'twenty'), '').replace('## 2026-11-08', obs(12, 'main') + '## 2026-11-08').replace(/$/, obs(20, 'twenty'))
test('skill log: a day heading moved on this branch is left whole (round 4 — Astra r3-2)', withRepo({ '.claude/skill-observations/log.md': LOG2 }, c => {
  c.sides(x => x.write('.claude/skill-observations/log.md', moved), x => x.write('.claude/skill-observations/log.md', added12))
  const before = c.read('.claude/skill-observations/log.md')
  leftWholeForDays(c.run())
  assert.equal(c.read('.claude/skill-observations/log.md'), before, 'git\'s own marks untouched')
}))
test('skill log: a day heading moved on main is left whole (round 4 — Astra r3-2, its mirror)', withRepo({ '.claude/skill-observations/log.md': LOG2 }, c => {
  c.sides(x => x.write('.claude/skill-observations/log.md', added12), x => x.write('.claude/skill-observations/log.md', moved))
  leftWholeForDays(c.run())
}))
const DAYS3 = '# Skill Observation Log\n\n## D1\n\n' + obs(9, 'nine') + '## D2\n\n' + obs(10, 'ten')
test('skill log: a day removed whole on this branch while main adds a note under it is left whole (round 4 — Opus r3-1 dayrm)', withRepo({ '.claude/skill-observations/log.md': DAYS3 }, c => {
  c.sides(x => x.write('.claude/skill-observations/log.md', '# Skill Observation Log\n\n## D1\n\n' + obs(9, 'nine')), x => x.write('.claude/skill-observations/log.md', DAYS3 + obs(11, 'main under D2')))
  leftWholeForDays(c.run())
}))
test('skill log: a middle day removed whole, a note added under it on main, is left whole (round 4 — Opus r3-1 dayrm2)', withRepo({ '.claude/skill-observations/log.md': DAYS3 + '## D3\n\n' + obs(12, 'twelve') }, c => {
  c.sides(x => x.write('.claude/skill-observations/log.md', '# Skill Observation Log\n\n## D1\n\n' + obs(9, 'nine') + '## D3\n\n' + obs(12, 'twelve')),
    x => x.write('.claude/skill-observations/log.md', DAYS3 + obs(11, 'main under D2') + '## D3\n\n' + obs(12, 'twelve')))
  leftWholeForDays(c.run())
}))
test('skill log: a day heading only main added is left whole (Astra re-read 2, its mirror)', withRepo({ '.claude/skill-observations/log.md': LOG0 }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + obs(12, 'ours under the old day')), x => x.edit('.claude/skill-observations/log.md', t => t + '## 2026-11-08\n\n' + obs(11, 'main on the new day')))
  leftWholeForDays(c.run())
}))
const OUT0 = '# Outstanding\n\n## Priority list\n\n- [ALPHA] alpha\n- [BRAVO] bravo\n\n## Items\n\n### [ALPHA] a\n\n### [BRAVO] b\n'
test('backlog: an item line removed on one side and a line added beside it on the other is left, never revived (Astra 8, Opus 8)', withRepo({ 'OUTSTANDING.md': OUT0 }, c => {
  c.sides(x => x.edit('OUTSTANDING.md', t => t.replace('- [ALPHA] alpha\n', '')), x => x.edit('OUTSTANDING.md', t => t.replace('- [ALPHA] alpha\n', '- [ALPHA] alpha\n- [NEW] new\n')))
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  assert.match(r.out, /LEFT for you in OUTSTANDING\.md/)
}))

/* ---------- other files, the rulings, the checks ---------- */
test('app code is listed, not touched; a rulings file gets the next command', withRepo({ 'raptor-port/src/a.ts': 'export const a = 1\n', '.claude/rules/decisions/x.md': '| D1 | one |\n', 'HANDOFF.md': H0 }, c => {
  c.sides(x => { x.write('raptor-port/src/a.ts', 'export const a = 2\n'); x.write('.claude/rules/decisions/x.md', '| D1 | ours |\n'); x.edit('HANDOFF.md', t => t.replace('## Now\n\n', '## Now\n\n' + block('claude/n1', '- n1'))) },
    x => { x.write('raptor-port/src/a.ts', 'export const a = 3\n'); x.write('.claude/rules/decisions/x.md', '| D1 | theirs |\n'); x.edit('HANDOFF.md', t => t.replace('## Now\n\n', '## Now\n\n' + block('claude/n2', '- n2'))) })
  const code = c.read('raptor-port/src/a.ts')
  const r = c.run()
  assert.equal(r.code, 2, r.out)
  assert.equal(c.read('raptor-port/src/a.ts'), code)
  assert.match(r.out, /not a record file — yours to settle: raptor-port\/src\/a\.ts/)
  assert.match(r.out, /git add HANDOFF\.md\), then run:\n\s+node raptor-port\/scripts\/backlog-archive\.mjs --rulings --merge/)
  assert.ok(!r.ran)
}))

test('a merge that ended clean still runs the checks (Astra 2, Opus 4)', withRepo({ 'HANDOFF.md': H0 }, c => {
  const st = c.sides(x => x.edit('HANDOFF.md', t => t.replace('- a line', '- a, ours')), x => x.edit('HANDOFF.md', t => t.replace('- finished, merged', '- merged, theirs')))
  assert.equal(st, 0)
  const r = c.run()
  assert.equal(r.code, 0, r.out); assert.ok(r.ran); assert.match(r.out, /0 unmerged path/)
}))

test('a check already red on the commit being merged in is not counted (Opus 7)', withRepo({ 'HANDOFF.md': H0 }, c => {
  c.sides(x => x.edit('HANDOFF.md', t => t.replace('## Now\n\n', '## Now\n\n' + block('claude/n1', '- n1')).replace('- a line', '- a, ours')),
    x => { x.edit('HANDOFF.md', t => t.replace('## Now\n\n', '## Now\n\n' + block('claude/n2', '- n2')).replace('- b line', '- b, theirs')); x.write('CHECK-FAIL-docsize', 'an old failure on main') })
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /red the same way on the commit being merged in — not counted/)
  assert.match(c.read('HANDOFF.md'), /- a, ours[\s\S]*- b, theirs/)
  assert.doesNotMatch(c.read('HANDOFF.md'), /^<{7}/m)
}))

test('a NEW check failure puts every settled file back to git\'s conflicted state and names it', withRepo({ 'HANDOFF.md': H0, 'CHECK-WORDS-docsize': 'ALPHA-EDIT BETA-EDIT' }, c => {
  c.sides(x => x.write('HANDOFF.md', handoff([block('claude/n1', '- n1'), block('claude/a', '- a ALPHA-EDIT'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])),
    x => x.write('HANDOFF.md', handoff([block('claude/n2', '- n2'), block('claude/a', '- a line'), block('claude/b', '- b BETA-EDIT'), block('claude/merged', '- finished, merged')])))
  const r = c.run()
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /npm run docsize — a NEW failure:\n\s+both words together/)
  assert.match(c.read('HANDOFF.md'), /^<{7} /m, 'put back to git\'s conflicted state')
  assert.match(r.out, /back to git's conflicted state: HANDOFF\.md/)
}))

/* ---------- the replay (records-merge-replay.mjs) ---------- */
/* Astra 6, Opus 8 (the code read, 8 Nov 26): the replay skipped a file settled in part, and could not fail. Here a
   stand-in step settles HANDOFF.md in part — one block left in git's marks — and DOUBLES a block it settled: the replay
   must compare that settled block, name the doubling and exit 1; with the stand-in writing it once, the replay passes. */
test('the replay compares the records of a file settled in part, and fails on a doubled one (Astra 6, Opus 8)', () => {
  const c = makeRepo({ 'HANDOFF.md': H0 })
  try {
    const ours = handoff([block('claude/n1', '- n1'), block('claude/a', '- a, ours'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])
    const theirs = handoff([block('claude/n2', '- n2'), block('claude/a', '- a, theirs'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])
    c.sides(x => x.write('HANDOFF.md', ours), x => x.write('HANDOFF.md', theirs))
    const p1 = c.git('rev-parse', 'HEAD').trim(), p2 = c.git('rev-parse', 'main').trim()
    /* the chat's own merge */
    c.write('HANDOFF.md', handoff([block('claude/n1', '- n1'), block('claude/n2', '- n2'), block('claude/a', '- a, both'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')]))
    c.git('add', '-A'); c.git('commit', '-q', '-m', 'the chat\'s merge')
    const merge = c.git('rev-parse', 'HEAD').trim()
    c.write('raptor-port/scripts/records-merge-replay.mjs', readFileSync(join(HERE, 'records-merge-replay.mjs'), 'utf8'))
    c.write('raptor-port/scripts/records-merge-replay.json', JSON.stringify({ window: { since: '2026-11-08T00:00:00+08:00', until: '2099-01-01T00:00:00+08:00', by: 'a test' }, merges: [{ merge, p1, p2, committed: 'x', clashed: ['HANDOFF.md'] }] }))
    const left = '<<<<<<< HEAD\n<!-- now:claude/a -->\n### `claude/a`\n- a, ours\n<!-- /now -->\n\n=======\n<!-- now:claude/a -->\n### `claude/a`\n- a, theirs\n<!-- /now -->\n\n>>>>>>> main\n'
    const stand = text => `import { writeFileSync } from 'node:fs'\nwriteFileSync('HANDOFF.md', ${JSON.stringify(text)})\nconsole.log('records-merge: 1 unmerged path(s)\\n  settled: HANDOFF.md (in part)\\n  LEFT for you in HANDOFF.md:\\n    - the ## Now block for claude/a')\nprocess.exit(2)\n`
    const settled = (...bs) => `# HANDOFF\n\nRead this first.\n\n## Now\n\n${bs.join('')}${left}${block('claude/b', '- b line')}${block('claude/merged', '- finished, merged')}## Next, in order\n\n1. the order\n\n## Gate baseline\n\nGate: 100 green (7 Nov).\n\n## Standing constraints\n\n- none\n`
    const sheet = join(c.dir, 'sheet.md'), run = () => spawnSync(process.execPath, ['raptor-port/scripts/records-merge-replay.mjs', '--out', sheet], { cwd: c.dir, encoding: 'utf8' })
    c.write('raptor-port/scripts/records-merge.mjs', stand(settled(block('claude/n1', '- n1'), block('claude/n2', '- n2'), block('claude/n1', '- n1'))))
    c.git('add', '-A'); c.git('commit', '-q', '-m', 'the replay and a stand-in step')
    const bad = run()
    assert.equal(bad.status, 1, bad.stdout + bad.stderr)
    /* the marker as an identity, and its three lines that are not blank by the every-line guard (round 3) */
    assert.match(bad.stderr, /FAILED — 4 failure\(s\)/)
    assert.match(bad.stderr, /every line — "- n1" stands 2 times in the step's file; the chat's 1/)
    assert.match(bad.stderr, /now markers — "<!-- now:claude\/n1 -->" stands 2 times in the step's file; the chat's 1, the first parent's 1, the second's 0/)
    assert.match(readFileSync(sheet, 'utf8'), /HANDOFF\.md \(part: \d+ =, 1 ≠, 1 left\)/)
    assert.match(readFileSync(join(c.dir, 'sheet-diffs.md'), 'utf8'), /Record "now:claude\/n1 \(2\)"/)
    c.write('raptor-port/scripts/records-merge.mjs', stand(settled(block('claude/n1', '- n1'), block('claude/n2', '- n2'))))
    c.git('add', '-A'); c.git('commit', '-q', '-m', 'the stand-in writes each block once')
    const good = run()
    assert.equal(good.status, 0, good.stdout + good.stderr)
    assert.match(readFileSync(sheet, 'utf8'), /HANDOFF\.md \(part: \d+ =, 0 ≠, 1 left\)/)
  } finally { c.done() }
})

/* the narrow re-read (Astra re-read 3, Opus re-read 6, 8 Nov 26): the replay's fail rule could not see a step that
   crashed, a doubled walk-ledger row (no ledger identity), nor a doubled line with no identity at all (a file-map row).
   Round 3: a crash fails the run; the ledger rows are an identity again; and every line that is not blank, held by the
   step's file more often than by the chat's AND by each parent, fails it (only a renumbered heading line is exempt). */
function replayOne(f, base, ours, theirs, chat, stepText, stepCode = 0) {
  const c = makeRepo({ [f]: base })
  try {
    c.sides(x => x.write(f, ours), x => x.write(f, theirs))
    const p1 = c.git('rev-parse', 'HEAD').trim(), p2 = c.git('rev-parse', 'main').trim()
    c.write(f, chat); c.git('add', '-A'); c.git('commit', '-q', '-m', 'the chat\'s merge')
    const merge = c.git('rev-parse', 'HEAD').trim()
    c.write('raptor-port/scripts/records-merge-replay.mjs', readFileSync(join(HERE, 'records-merge-replay.mjs'), 'utf8'))
    c.write('raptor-port/scripts/records-merge-replay.json', JSON.stringify({ window: { since: '2026-11-08T00:00:00+08:00', until: '2099-01-01T00:00:00+08:00', by: 'a test' }, merges: [{ merge, p1, p2, committed: 'x', clashed: [f] }] }))
    c.write('raptor-port/scripts/records-merge.mjs', stepCode === 1
      ? `console.error('records-merge: something broke'); process.exit(1)\n`
      : `import { writeFileSync } from 'node:fs'\nwriteFileSync(${JSON.stringify(f)}, ${JSON.stringify(stepText)})\nconsole.log('records-merge: 1 unmerged path(s)\\n  settled: ${f}')\n`)
    c.git('add', '-A'); c.git('commit', '-q', '-m', 'the replay and a stand-in step')
    const r = spawnSync(process.execPath, ['raptor-port/scripts/records-merge-replay.mjs', '--out', join(c.dir, 'sheet.md')], { cwd: c.dir, encoding: 'utf8' })
    return { code: r.status, out: r.stdout + r.stderr }
  } finally { c.done() }
}
const L2 = LEDGER0.replace('<!-- /ledger', '| 8 Nov | ours | found 0 |\n<!-- /ledger'), L3 = LEDGER0.replace('<!-- /ledger', '| 8 Nov | theirs | found 2 |\n<!-- /ledger')
const LBOTH = LEDGER0.replace('<!-- /ledger', '| 8 Nov | ours | found 0 |\n| 8 Nov | theirs | found 2 |\n<!-- /ledger')
test('the replay fails when a replayed merge crashed (Astra re-read 3, Opus re-read 6)', () => {
  const r = replayOne('raptor-port/docs/walk-ledger.md', LEDGER0, L2, L3, LBOTH, '', 1)
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /FAILED[\s\S]*stopped with an error/)
})
test('the replay fails on a doubled walk-ledger row (the ledger rows identity, restored — Opus re-read 6)', () => {
  const r = replayOne('raptor-port/docs/walk-ledger.md', LEDGER0, L2, L3, LBOTH, LBOTH.replace('<!-- /ledger', '| 8 Nov | ours | found 0 |\n<!-- /ledger'))
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /ledger rows — "\| 8 Nov \| ours \| found 0 \|" stands 2 times in the step's file; the chat's 1/)
  const ok = replayOne('raptor-port/docs/walk-ledger.md', LEDGER0, L2, L3, LBOTH, LBOTH)
  assert.equal(ok.code, 0, ok.out)
})
test('the replay fails on any doubled line, one with no identity among them — a file-map row (Opus re-read 6)', () => {
  const F2 = FMAP0 + '| o.ts | o |\n', F3 = FMAP0 + '| t.ts | t |\n', FBOTH = FMAP0 + '| o.ts | o |\n| t.ts | t |\n'
  const r = replayOne('raptor-port/docs/file-map.md', FMAP0, F2, F3, FBOTH, FBOTH + '| o.ts | o |\n')
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /every line — "\| o\.ts \| o \|" stands 2 times in the step's file; the chat's 1, the first parent's 1, the second's 0/)
})
/* the host's ruling after round 3's replay (8 Nov 26, option 2): a line BOTH sides added — a handoff block's closing
   line when each side adds a block — stands base + 2 times in a correct merge, more than in either parent; the chat's
   file may hold fewer (0db7d583b lost a closer, 8b54a2cd5 dropped a merged branch's block). Bounded by the base, that
   is no failure; a doubled row or block still is (the regressions above) */
test('the replay does not fail on a line both sides added, standing base + 2 times (the host\'s option 2)', () => {
  const ours = handoff([block('claude/n1', '- n1'), block('claude/a', '- a line'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])
  const theirs = handoff([block('claude/n2', '- n2'), block('claude/a', '- a line'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])
  const both = handoff([block('claude/n1', '- n1'), block('claude/n2', '- n2'), block('claude/a', '- a line'), block('claude/b', '- b line'), block('claude/merged', '- finished, merged')])
  /* the chat kept only this branch's new block: its file holds the closing line base + 1 times, the step's base + 2 */
  const r = replayOne('HANDOFF.md', H0, ours, theirs, ours, both)
  assert.equal(r.code, 0, r.out)
})
