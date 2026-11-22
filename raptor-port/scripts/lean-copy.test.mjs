/* LEAN WORKING COPIES' TESTS — his D2290 and D2292, [HELPER-COPIES-NO-PICTURES] (22 Nov 26). Each test builds a
 * throwaway repo with a small "pictures" folder standing in for raptor-port/docs/img/handpass/, makes real linked
 * copies with git, and checks what lean-copy.mjs does to them: the main folder is never touched; a new copy leaves the
 * old pictures out and keeps every other file; a new walk's pictures still commit; a picture written into an old walk's
 * folder never goes missing from a commit unseen; only a NEW copy is slimmed by the hooks, never one set whole; git's
 * hooks, once installed, slim a typed copy and guard its commits. The three reads' findings each have a test here.
 *
 * Run alone: node --test raptor-port/scripts/lean-copy.test.mjs */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync, utimesSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'

const PICS = 'docs/pics'
process.env.LEAN_COPY_PICS = PICS // read when the module loads, so set before the import below
delete process.env.RAPTOR_FULL_COPY
const L = await import('./lean-copy.mjs')
const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'lean-copy.mjs')

const g = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
const put = (root, rel, text = 'x') => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), text) }
const on = (root, rel) => existsSync(join(root, rel))
const roots = []
test.after(() => { for (const r of roots) rmSync(r, { recursive: true, force: true }) })

/** A repo with two old walks (pictures, a result and a drawing record), a loose picture, and other files. */
function repo() {
  const base = mkdtempSync(join(tmpdir(), 'lean-copy-'))
  roots.push(base)
  const root = join(base, 'main')
  mkdirSync(root)
  g(root, 'init', '-q', '-b', 'main')
  g(root, 'config', 'user.email', 't@t'); g(root, 'config', 'user.name', 't'); g(root, 'config', 'core.autocrlf', 'false')
  put(root, 'README.md', 'hi')
  put(root, 'docs/guide.md', 'guide')
  put(root, `${PICS}/2026-10-01-walk-a/s01.png`, 'OLD')
  put(root, `${PICS}/2026-10-01-walk-a/B/s02.png`)
  put(root, `${PICS}/2026-10-01-walk-a/result.json`, '{}')
  put(root, `${PICS}/2026-10-01-walk-a/drawcheck-records/q1.png`)
  put(root, `${PICS}/2026-10-01-walk-a/drawcheck-records/q1.json`, '{}')
  put(root, `${PICS}/2026-10-02-walk-b/s01.png`)
  put(root, `${PICS}/loose.png`)
  put(root, 'raptor-port/scripts/lean-copy.mjs', readFileSync(SCRIPT, 'utf8'))
  g(root, 'add', '-A'); g(root, 'commit', '-qm', 'init')
  return root
}
/** A linked copy of `root`, whole at first; named the way the app names a helper's (agent-<id>) by default. */
function copy(root, name = 'agent-abc123') {
  const dir = join(root, '.claude', 'worktrees', name)
  g(root, 'worktree', 'add', '-q', '--detach', dir, 'HEAD')
  return dir
}
const gitDir = (dir) => resolve(g(dir, 'rev-parse', '--path-format=absolute', '--git-dir').trim())
const makeOld = (dir) => { const t = new Date(Date.now() - 60 * 60 * 1000); utimesSync(join(gitDir(dir), 'commondir'), t, t) }

test('a path is written as a pattern with its special characters taken literally', () => {
  assert.equal(L.esc('a/b c'), 'a/b c')
  assert.equal(L.esc('a/[x]*?.png'), 'a/\\[x\\]\\*\\?.png')
  assert.equal(L.esc('#a'), '\\#a')
  assert.equal(L.esc('!a'), '\\!a')
  assert.equal(L.esc('a  '), 'a\\ \\ ')
})

test('the patterns leave out the pictures of each walk folder and loose picture, and bring the drawing records back', () => {
  const root = repo()
  const p = L.patterns(root)
  assert.equal(p[0], '/*')
  for (const x of L.MEDIA) assert.ok(p.includes(`!/${PICS}/2026-10-01-walk-a/**/*.${x}`), x)
  assert.ok(p.includes(`!/${PICS}/loose.png`))
  assert.ok(p.includes(`/${PICS}/**/drawcheck-records/**`))
})

test('the main folder is never slimmed, and full refuses there', async () => {
  const root = repo()
  assert.match(await L.slim(root), /main folder/)
  assert.throws(() => L.full(root), /main folder/)
  assert.equal(on(root, `${PICS}/loose.png`), true)
  assert.equal(spawnSync('git', ['-C', root, 'config', '--get-regexp', 'sparse'], { encoding: 'utf8' }).stdout.trim(), '', 'nothing sparse written into the main folder')
})

test('a new copy leaves out the old pictures only — results, notes and drawing records stay — and shows no change', async () => {
  const root = repo(); const dir = copy(root)
  assert.equal(await L.slim(dir), 'slimmed')
  assert.equal(on(dir, `${PICS}/2026-10-01-walk-a/s01.png`), false)
  assert.equal(on(dir, `${PICS}/2026-10-01-walk-a/B/s02.png`), false)
  assert.equal(on(dir, `${PICS}/loose.png`), false)
  assert.equal(on(dir, `${PICS}/2026-10-01-walk-a/result.json`), true, 'a walk result stays')
  assert.equal(on(dir, `${PICS}/2026-10-01-walk-a/drawcheck-records/q1.png`), true, 'the drawing record and its picture stay')
  assert.equal(on(dir, `${PICS}/2026-10-01-walk-a/drawcheck-records/q1.json`), true)
  assert.equal(on(dir, 'docs/guide.md'), true)
  assert.equal(g(dir, 'status', '--porcelain'), '')
  assert.equal(await L.slim(dir, { auto: true }), 'already lean')
  assert.equal(on(root, `${PICS}/2026-10-01-walk-a/s01.png`), true, 'the main folder keeps them')
})

test("a new walk's pictures save and commit in a lean copy with no extra step", async () => {
  const root = repo(); const dir = copy(root)
  await L.slim(dir)
  put(dir, `${PICS}/2026-11-22-new-walk/s01.png`)
  g(dir, 'add', '-A')
  assert.match(g(dir, 'status', '--porcelain'), /A {2}docs\/pics\/2026-11-22-new-walk\/s01\.png/)
  assert.deepEqual(L.stranded(dir), [])
})

test("a picture RE-WRITTEN into an old walk's folder: git add -A skips it without a word — the guard finds it", async () => {
  const root = repo(); const dir = copy(root)
  await L.slim(dir)
  put(dir, `${PICS}/2026-10-01-walk-a/s01.png`, 'NEW')
  assert.equal(spawnSync('git', ['-C', dir, 'add', '-A'], { encoding: 'utf8' }).status, 0, 'git says nothing')
  assert.doesNotMatch(g(dir, 'diff', '--cached', '--name-only'), /s01\.png/, 'and stages nothing of it')
  assert.deepEqual(L.stranded(dir), [`${PICS}/2026-10-01-walk-a/s01.png`])
  assert.equal(L.onPreCommit(dir), 1, 'the commit guard stops the commit')
  L.get(dir, ['2026-10-01-walk-a'])
  assert.equal(readFileSync(join(dir, PICS, '2026-10-01-walk-a/s01.png'), 'utf8'), 'NEW', 'fetching the folder kept the new picture')
  g(dir, 'add', '-A')
  assert.match(g(dir, 'diff', '--cached', '--name-only'), /2026-10-01-walk-a\/s01\.png/, 'adding again takes it')
  assert.equal(L.onPreCommit(dir), 0)
})

test("a NEW picture in an old walk's folder is refused aloud, found by the guard, and fetched with get", async () => {
  const root = repo(); const dir = copy(root)
  await L.slim(dir)
  put(dir, `${PICS}/2026-10-01-walk-a/s03.png`)
  assert.notEqual(spawnSync('git', ['-C', dir, 'add', '-A'], { encoding: 'utf8' }).status, 0, 'git refuses it aloud')
  assert.deepEqual(L.stranded(dir), [`${PICS}/2026-10-01-walk-a/s03.png`])
  assert.match(L.get(dir, ['2026-10-01-walk-a']), /Fetched/)
  assert.equal(on(dir, `${PICS}/2026-10-01-walk-a/B/s02.png`), true, 'its subfolders come too')
  assert.equal(on(dir, `${PICS}/2026-10-02-walk-b/s01.png`), false, 'the other walk stays out')
  g(dir, 'add', '-A')
  assert.match(g(dir, 'status', '--porcelain'), /A {2}docs\/pics\/2026-10-01-walk-a\/s03\.png/)
  assert.match(L.status(dir), /Fetched: \/docs\/pics\/2026-10-01-walk-a\//)
  assert.throws(() => L.get(dir, ['no-such-walk']), /no folder/)
})

test('slimming by hand again keeps the fetched folders', async () => {
  const root = repo(); const dir = copy(root)
  await L.slim(dir)
  L.get(dir, [`${PICS}/2026-10-02-walk-b/`])
  assert.equal(await L.slim(dir), 'slimmed')
  assert.equal(on(dir, `${PICS}/2026-10-02-walk-b/s01.png`), true)
  assert.equal(on(dir, `${PICS}/2026-10-01-walk-a/s01.png`), false)
})

test('full puts every picture back, and the hooks then leave the copy whole', async () => {
  const root = repo(); const dir = copy(root, 'dreamy-chat')
  await L.slim(dir)
  assert.match(L.full(dir), /back/)
  assert.equal(on(dir, `${PICS}/loose.png`), true)
  assert.match(await L.slim(dir, { auto: true }), /set whole/)
  assert.equal(await L.onAppHook({ hook_event_name: 'SessionStart', source: 'startup', cwd: dir }), null)
  assert.equal(on(dir, `${PICS}/loose.png`), true)
})

test('a copy with picture work of its own, or RAPTOR_FULL_COPY=1, is left whole — and RAPTOR_FULL_COPY keeps it so', async () => {
  const root = repo(); const dir = copy(root)
  put(dir, `${PICS}/2026-10-01-walk-a/s01.png`, 'changed')
  assert.match(await L.slim(dir), /picture changes/)
  const dir2 = copy(root, 'agent-def456')
  process.env.RAPTOR_FULL_COPY = '1'
  try { assert.match(await L.slim(dir2), /RAPTOR_FULL_COPY/) } finally { delete process.env.RAPTOR_FULL_COPY }
  assert.match(await L.slim(dir2, { auto: true }), /set whole/)
  assert.equal(on(dir2, `${PICS}/loose.png`), true)
})

test('the hooks never slim a copy that is not new — a chat started in a copy already in use leaves it as it is', async () => {
  const root = repo(); const dir = copy(root, 'reused-chat')
  makeOld(dir)
  assert.match(await L.slim(dir, { auto: true }), /not a new copy/)
  assert.equal(await L.onAppHook({ hook_event_name: 'SessionStart', source: 'startup', cwd: dir }), null)
  assert.equal(on(dir, `${PICS}/loose.png`), true)
  assert.equal(await L.slim(dir), 'slimmed', 'by hand it still can')
})

test("the app's helper hook slims only the helper's own new copy, and hands it the note", async () => {
  const root = repo(); const dir = copy(root, 'agent-a1')
  // a helper started WITHOUT its own copy runs in the chat's copy: never touched
  const chat = copy(root, 'some-chat')
  assert.equal(await L.onAppHook({ hook_event_name: 'SubagentStart', agent_id: 'a1', cwd: chat }), null)
  assert.equal(on(chat, `${PICS}/loose.png`), true)
  assert.equal(await L.onAppHook({ hook_event_name: 'SubagentStart', agent_id: 'zz', cwd: dir }), null)
  const out = await L.onAppHook({ hook_event_name: 'SubagentStart', agent_id: 'a1', cwd: dir })
  assert.equal(out.hookSpecificOutput.hookEventName, 'SubagentStart')
  assert.match(out.hookSpecificOutput.additionalContext, /lean-copy\.mjs get/)
  assert.match(out.hookSpecificOutput.additionalContext, /OLD walk's folder/)
  assert.ok(out.hookSpecificOutput.additionalContext.includes(`${root.replace(/\\/g, '/')}/${PICS}`), 'names the main folder')
  assert.equal(on(dir, `${PICS}/loose.png`), false)
})

test("the app's chat hook slims a chat's new copy, never the main folder", async () => {
  const root = repo(); const dir = copy(root, 'dreamy-chat')
  assert.equal(await L.onAppHook({ hook_event_name: 'SessionStart', source: 'startup', cwd: root }), null)
  assert.equal(on(root, `${PICS}/loose.png`), true)
  const out = await L.onAppHook({ hook_event_name: 'SessionStart', source: 'startup', cwd: dir })
  assert.match(out.hookSpecificOutput.additionalContext, /old walk pictures/)
  assert.equal(on(dir, `${PICS}/loose.png`), false)
})

test('a slim still running past its time is reported as such, not as lean or whole, and then ends lean', async () => {
  const root = repo(); const dir = copy(root)
  process.env.LEAN_COPY_BUDGET_MS = '1'
  let r
  try { r = await L.slim(dir) } finally { delete process.env.LEAN_COPY_BUDGET_MS }
  assert.ok(r === 'slimmed' || r.startsWith('still slimming'), r)
  if (r.startsWith('still slimming')) assert.match(L.note(root, r), /still being slimmed/)
  for (let i = 0; i < 100 && !(L.isLean(dir) && !on(dir, `${PICS}/loose.png`) && !existsSync(join(gitDir(dir), 'index.lock'))); i++)
    await new Promise((ok) => setTimeout(ok, 200))
  assert.equal(L.isLean(dir), true)
  assert.equal(on(dir, `${PICS}/loose.png`), false)
})

test("git's checkout hook only acts on a NEW copy", async () => {
  const root = repo(); const dir = copy(root, 'typed')
  assert.equal(await L.onGitHook(['a'.repeat(40), 'b'.repeat(40), '1'], dir), null, 'a branch switch is not a new copy')
  assert.equal(await L.onGitHook([L.NULL_REF, 'b'.repeat(40), '0'], dir), null, 'a file checkout is not a new copy')
  assert.equal(await L.onGitHook([L.NULL_REF, 'b'.repeat(40), '1'], dir), 'slimmed')
})

test('installed, git\'s hooks slim a typed copy (with the note on screen) and stop a commit that would leave a picture behind', () => {
  const root = repo()
  assert.match(L.install(root), /Installed/)
  assert.match(L.install(root), /Installed/, 'installing twice is fine')
  const dir = join(dirname(root), 'typed')
  const env = { ...process.env, LEAN_COPY_PICS: PICS }
  const made = spawnSync('git', ['-C', root, 'worktree', 'add', '-q', '--detach', dir, 'HEAD'], { encoding: 'utf8', env })
  assert.match(made.stderr, /leaves out the old walk pictures/, 'the typed copy is told')
  assert.equal(L.isLean(dir), true)
  assert.equal(on(dir, `${PICS}/loose.png`), false)
  put(dir, `${PICS}/2026-10-01-walk-a/s01.png`, 'NEW')
  const stopped = spawnSync('git', ['-C', dir, 'commit', '-qam', 'x'], { encoding: 'utf8', env })
  assert.notEqual(stopped.status, 0, 'the commit is stopped')
  assert.match(stopped.stderr, /commit stopped/)
  assert.match(stopped.stderr, /lean-copy\.mjs get 2026-10-01-walk-a/, 'with the command to run')
  L.get(dir, ['2026-10-01-walk-a'])
  g(dir, 'add', '-A')
  const again = spawnSync('git', ['-C', dir, 'commit', '-qm', 'x'], { encoding: 'utf8', env })
  assert.equal(again.status, 0, `then it commits: ${again.stderr}`)
  assert.equal(g(dir, 'show', `HEAD:${PICS}/2026-10-01-walk-a/s01.png`), 'NEW', 'with the new picture')
  // the main folder: a branch switch and a commit run the hooks too, and leave it whole
  g(root, 'checkout', '-q', '-b', 'other')
  put(root, 'docs/guide.md', 'changed')
  assert.equal(spawnSync('git', ['-C', root, 'commit', '-qam', 'y'], { encoding: 'utf8', env }).status, 0)
  assert.equal(on(root, `${PICS}/loose.png`), true)
  assert.match(L.uninstall(root), /Taken out/)
  const hooks = join(resolve(g(root, 'rev-parse', '--path-format=absolute', '--git-common-dir').trim()), 'hooks')
  assert.equal(existsSync(join(hooks, 'post-checkout')), false)
  assert.equal(existsSync(join(hooks, 'pre-commit')), false)
})

test('install never replaces a hook of another kind', () => {
  const root = repo()
  const file = join(root, '.git', 'hooks', 'pre-commit')
  mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, '#!/bin/sh\necho mine\n')
  assert.throws(() => L.install(root), /another hook/)
  assert.equal(existsSync(join(root, '.git', 'hooks', 'post-checkout')), false, 'nothing put in place')
  assert.match(L.uninstall(root), /another hook; left in place/)
  assert.equal(readFileSync(file, 'utf8'), '#!/bin/sh\necho mine\n')
})

test('in an exported read-copy (its own repo, no pictures), get says where the pictures are — never that they are here', () => {
  const root = repo()
  const exp = join(dirname(root), 'export')
  mkdirSync(exp)
  g(exp, 'init', '-q', '-b', 'main'); g(exp, 'config', 'user.email', 't@t'); g(exp, 'config', 'user.name', 't')
  put(exp, 'docs/guide.md', 'guide'); put(exp, `${PICS}/2026-10-01-walk-a/result.json`, '{}')
  g(exp, 'add', '-A'); g(exp, 'commit', '-qm', 'export')
  assert.throws(() => L.get(exp, ['2026-10-01-walk-a']), /exported read-copy/)
  assert.throws(() => L.get(exp, ['2026-10-02-walk-b']), /exported read-copy/)
})
