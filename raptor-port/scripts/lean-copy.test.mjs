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

/** A repo with two old walks (pictures, a result and a drawing record), a loose picture, and other files; the commit
 *  guard put in place unless `guard: false` (no copy is slimmed without it). */
function repo({ guard = true } = {}) {
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
  if (guard) L.install(root)
  return root
}
/** A linked copy of `root`, whole at first; named the way the app names a helper's (agent-<id>) by default. */
function copy(root, name = 'agent-abc123') {
  const dir = join(root, '.claude', 'worktrees', name)
  // made the way the app makes its copies: without git's checkout hook (so it starts whole, as the app's do)
  g(root, '-c', `core.hooksPath=${join(dirname(root), 'no-hooks')}`, 'worktree', 'add', '-q', '--detach', dir, 'HEAD')
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

test('a hook past its time says "still being slimmed", returns at once, and the copy then ends lean', async () => {
  const root = repo(); const dir = copy(root, 'agent-slow')
  process.env.LEAN_COPY_BUDGET_MS = '1'
  const t0 = Date.now()
  let out
  try { out = await L.onAppHook({ hook_event_name: 'SubagentStart', agent_id: 'slow', cwd: dir }) } finally { delete process.env.LEAN_COPY_BUDGET_MS }
  assert.ok(Date.now() - t0 < 15_000, 'the hook did not wait past its budget')
  assert.ok(out, 'a note is handed over')
  assert.match(out.hookSpecificOutput.additionalContext, /still being slimmed|leaves out/)
  for (let i = 0; i < 150 && !(L.isLean(dir) && !on(dir, `${PICS}/loose.png`) && !existsSync(join(gitDir(dir), 'index.lock'))); i++)
    await new Promise((ok) => setTimeout(ok, 200))
  assert.equal(L.isLean(dir), true)
  assert.equal(on(dir, `${PICS}/loose.png`), false)
  assert.equal(await L.slim(dir), 'slimmed', 'and the hook\'s deadline did not outlive it')
})

test('no copy is slimmed until the commit guard is in place — the hooks and by hand alike', async () => {
  const root = repo({ guard: false }); const dir = copy(root, 'agent-g1')
  assert.match(await L.slim(dir), /commit guard is not in place/)
  assert.equal(await L.onAppHook({ hook_event_name: 'SubagentStart', agent_id: 'g1', cwd: dir }), null)
  assert.equal(on(dir, `${PICS}/loose.png`), true)
  L.install(root)
  assert.equal(await L.slim(dir), 'slimmed')
})

test('a copy git is still busy in, already marked lean, is reported as busy — never as plainly lean', async () => {
  const root = repo(); const dir = copy(root, 'agent-b1')
  await L.slim(dir)
  writeFileSync(join(gitDir(dir), 'index.lock'), '')
  assert.match(await L.slim(dir, { auto: true }), /still slimming, or stopped part-way/)
  const out = await L.onAppHook({ hook_event_name: 'SubagentStart', agent_id: 'b1', cwd: dir })
  assert.match(out.hookSpecificOutput.additionalContext, /stopped part-way/)
  assert.match(L.status(dir), /git is busy/)
  rmSync(join(gitDir(dir), 'index.lock'))
})

test('a loose picture re-written straight under the pictures folder is found by the guard too', async () => {
  const root = repo(); const dir = copy(root)
  await L.slim(dir)
  put(dir, `${PICS}/loose.png`, 'NEW')
  assert.deepEqual(L.stranded(dir), [`${PICS}/loose.png`])
  assert.equal(L.onPreCommit(dir), 1)
})

test('a guard that cannot check stops the commit; LEAN_COPY_GUARD=off lets one through', async () => {
  const root = repo(); const dir = copy(root)
  await L.slim(dir)
  rmSync(g(dir, 'rev-parse', '--path-format=absolute', '--git-path', 'info/sparse-checkout').trim())
  assert.throws(() => L.stranded(dir))
  assert.equal(L.onPreCommit(dir), 1)
  process.env.LEAN_COPY_GUARD = 'off'
  try { assert.equal(L.onPreCommit(dir), 0) } finally { delete process.env.LEAN_COPY_GUARD }
})

test('keeping one copy whole, in a project that never had a lean copy, keeps only that copy whole', async () => {
  const root = repo({ guard: false })
  const a = copy(root, 'chat-a'), b = copy(root, 'chat-b')
  assert.match(L.full(a), /leave it whole/)
  assert.equal(spawnSync('git', ['-C', root, 'config', '--file', join(root, '.git', 'config'), '--get', 'raptor.leanCopy'], { encoding: 'utf8' }).stdout.trim(), '', 'not in the shared settings')
  L.install(root)
  assert.match(await L.slim(a, { auto: true }), /set whole/)
  assert.equal(await L.slim(b, { auto: true }), 'slimmed', 'the other copy is slimmed as usual')
})

test('get takes a folder however it is written: a name, from the top, from a sub-folder, whole, or with ./', async () => {
  const root = repo(); const dir = copy(root)
  await L.slim(dir)
  for (const name of [`./${PICS}/2026-10-02-walk-b`, join(dir, PICS, '2026-10-02-walk-b'), 'pics/2026-10-02-walk-b/'])
    assert.match(L.get(dir, [name]), /Fetched/, name)
  assert.equal(on(dir, `${PICS}/2026-10-02-walk-b/s01.png`), true)
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

test('a lean copy switched to a branch without the script is still guarded, by the copy kept beside the hooks', async () => {
  const root = repo()
  g(root, 'checkout', '-q', '-b', 'old-branch'); g(root, 'rm', '-q', 'raptor-port/scripts/lean-copy.mjs'); g(root, 'commit', '-qm', 'no script')
  g(root, 'checkout', '-q', 'main')
  const dir = copy(root, 'agent-sw')
  await L.slim(dir)
  g(dir, 'checkout', '-q', 'old-branch')
  assert.equal(on(dir, 'raptor-port/scripts/lean-copy.mjs'), false)
  put(dir, `${PICS}/2026-10-01-walk-a/s01.png`, 'NEW')
  const r = spawnSync('git', ['-C', dir, 'commit', '-qam', 'x'], { encoding: 'utf8', env: { ...process.env, LEAN_COPY_PICS: PICS } })
  assert.notEqual(r.status, 0, `the commit is stopped: ${r.stderr}`)
  assert.match(r.stderr, /written into an old walk's folder/, 'by the full guard, from the copy beside the hooks')
  // and with no script anywhere, a lean copy is still stopped, never waved on
  rmSync(join(resolve(g(root, 'rev-parse', '--path-format=absolute', '--git-common-dir').trim()), 'hooks', 'lean-copy.mjs'))
  const r2 = spawnSync('git', ['-C', dir, 'commit', '-qam', 'x'], { encoding: 'utf8', env: { ...process.env, LEAN_COPY_PICS: PICS } })
  assert.notEqual(r2.status, 0)
  assert.match(r2.stderr, /guard cannot run/)
})

test('a copy marked lean whose list is missing is called stopped part-way, with full named', async () => {
  const root = repo(); const dir = copy(root)
  await L.slim(dir)
  rmSync(g(dir, 'rev-parse', '--path-format=absolute', '--git-path', 'info/sparse-checkout').trim())
  assert.match(L.status(dir), /stopped part-way.*full/)
})

test('install never replaces a hook of another kind', () => {
  const root = repo({ guard: false })
  const file = join(root, '.git', 'hooks', 'pre-commit')
  mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, '#!/bin/sh\necho mine\n')
  assert.throws(() => L.install(root), /another hook/)
  assert.equal(existsSync(join(root, '.git', 'hooks', 'post-checkout')), false, 'nothing put in place')
  assert.match(L.uninstall(root), /another hook; left in place/)
  assert.equal(readFileSync(file, 'utf8'), '#!/bin/sh\necho mine\n')
})

test('in an exported read-copy (its own repo, no pictures), get says where the pictures are — never that they are here', async () => {
  const root = repo()
  const exp = join(dirname(root), 'export')
  mkdirSync(exp)
  g(exp, 'init', '-q', '-b', 'main'); g(exp, 'config', 'user.email', 't@t'); g(exp, 'config', 'user.name', 't')
  put(exp, 'docs/guide.md', 'guide'); put(exp, `${PICS}/2026-10-01-walk-a/result.json`, '{}')
  put(exp, `${PICS}/2026-10-01-walk-a/s01.webp`) // the export recipe leaves .webp in (the third read)
  g(exp, 'add', '-A'); g(exp, 'commit', '-qm', 'export')
  assert.throws(() => L.get(exp, ['2026-10-01-walk-a']), /exported read-copy/)
  assert.throws(() => L.get(exp, ['2026-10-02-walk-b']), /exported read-copy/)
  assert.match(L.status(exp), /exported read-copy/, 'status never calls it the main folder')
  assert.match(await L.slim(exp), /exported read-copy/)
})
