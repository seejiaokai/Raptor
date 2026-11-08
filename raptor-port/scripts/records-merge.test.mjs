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
    sides(ours, theirs) {
      g('checkout', '-q', '-b', 'feature'); ours(c); c.commit('ours')
      g('checkout', '-q', 'main'); theirs(c); c.commit('theirs')
      g('checkout', '-q', 'feature')
      return spawnSync('git', ['merge', '--no-commit', '--no-ff', 'main'], { cwd: dir, encoding: 'utf8' }).status
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
    x => { x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'ours eleven', 'see Observation 11 and Observation 10') + obs(12, 'ours twelve', 'follows Observation 11')); x.edit('HANDOFF.md', t => t.replace('- a line', '- a line (Observation 11)')) },
    x => x.edit('.claude/skill-observations/log.md', t => t + obs(11, 'main eleven', 'main cites Observation 11')))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.equal(c.read('.claude/skill-observations/log.md'), LOG0 + obs(11, 'main eleven', 'main cites Observation 11') + obs(16, 'ours eleven', 'see Observation 16 and Observation 10') + obs(12, 'ours twelve', 'follows Observation 16'))
  assert.match(r.out, /Observation 11 → 16 "ours eleven"/)
  assert.match(r.out, /look by hand: HANDOFF\.md cites the old number/)
  assert.match(c.read('.claude/skill-observations/log.md'), /carriage return\r\n/, 'a carriage return in a line is kept')
  /* and a second run changes nothing */
  const again = c.run(); assert.equal(again.code, 0, again.out); assert.match(again.out, /already settled by an earlier run/)
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

/* the replay's finding (7c3b3afe1 and its like): the log's last note ends with no blank line, so two notes added after it
   on both sides ran together, a heading straight under the other note's last line */
test('skill log: notes both sides added after a last note with no blank line stay apart by one', withRepo({ '.claude/skill-observations/log.md': LOG0.replace(/\n$/, '') }, c => {
  c.sides(x => x.edit('.claude/skill-observations/log.md', t => t + '\n' + obs(11, 'ours', 'o').replace(/\n$/, '')), x => x.edit('.claude/skill-observations/log.md', t => t + '\n' + obs(12, 'theirs', 't').replace(/\n$/, '')))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.equal(c.read('.claude/skill-observations/log.md'), LOG0 + obs(12, 'theirs', 't') + obs(11, 'ours', 'o').replace(/\n$/, ''))
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
test('rulings archive: a "## Moved <day>" heading both sides inserted is kept once, both rows under it (Astra 8, Opus 13)', withRepo({ 'DECISIONS-ARCHIVE.md': DARCH0 }, c => {
  const day = row => '\n## Moved 8 Nov 26\n\n| # | Date | ruling |\n|---|---|---|\n' + row + '\n'
  c.sides(x => x.edit('DECISIONS-ARCHIVE.md', t => t + day('| D2 | 8 Nov 26 | ours |')), x => x.edit('DECISIONS-ARCHIVE.md', t => t + day('| D3 | 8 Nov 26 | theirs |')))
  const r = c.run()
  assert.equal(r.code, 0, r.out)
  assert.equal(c.read('DECISIONS-ARCHIVE.md'), DARCH0 + '\n## Moved 8 Nov 26\n\n| # | Date | ruling |\n|---|---|---|\n| D2 | 8 Nov 26 | ours |\n| D3 | 8 Nov 26 | theirs |\n')
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
