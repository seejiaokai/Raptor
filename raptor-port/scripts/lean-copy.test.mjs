/* LEAN WORKING COPIES' TESTS — his D2290, [HELPER-COPIES-NO-PICTURES] (22 Nov 26). Each test builds a throwaway repo
 * with a small "pictures" folder standing in for raptor-port/docs/img/handpass/, makes real linked copies with git,
 * and checks what lean-copy.mjs does to them: the main folder is never touched; a new copy leaves the old pictures
 * out; a new walk's pictures still commit; an old walk's folder comes back with `get`; the app's hook acts only on a
 * helper's own copy; git's hook, once installed, slims a copy made by `git worktree add`.
 *
 * Run alone: node --test raptor-port/scripts/lean-copy.test.mjs */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
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

/** A repo with two old walks' pictures, a loose picture, and other files; returns its folder. */
function repo() {
  const root = mkdtempSync(join(tmpdir(), 'lean-copy-'))
  g(root, 'init', '-q', '-b', 'main')
  g(root, 'config', 'user.email', 't@t'); g(root, 'config', 'user.name', 't'); g(root, 'config', 'core.autocrlf', 'false')
  put(root, 'README.md', 'hi')
  put(root, 'docs/guide.md', 'guide')
  put(root, `${PICS}/2026-10-01-walk-a/s01.png`)
  put(root, `${PICS}/2026-10-01-walk-a/B/s02.png`)
  put(root, `${PICS}/2026-10-02-walk-b/s01.png`)
  put(root, `${PICS}/loose.png`)
  put(root, 'raptor-port/scripts/lean-copy.mjs', readFileSync(SCRIPT, 'utf8'))
  g(root, 'add', '-A'); g(root, 'commit', '-qm', 'init')
  return root
}
/** A linked copy of `root`, made the way the app makes a helper's (named agent-<id>), whole at first. */
function copy(root, name = 'agent-abc123') {
  const dir = join(root, '.claude', 'worktrees', name)
  g(root, 'worktree', 'add', '-q', '--detach', dir, 'HEAD')
  return dir
}

test('a path is written as a pattern with its special characters taken literally', () => {
  assert.equal(L.esc('a/b c'), 'a/b c')
  assert.equal(L.esc('a/[x]*?.png'), 'a/\\[x\\]\\*\\?.png')
  assert.equal(L.esc('#a'), '\\#a')
  assert.equal(L.esc('!a'), '\\!a')
  assert.equal(L.esc('a  '), 'a\\ \\ ')
})

test('the patterns keep everything but each picture folder and file the commit holds', () => {
  const root = repo()
  assert.deepEqual(L.patterns(root), ['/*', `!/${PICS}/2026-10-01-walk-a/`, `!/${PICS}/2026-10-02-walk-b/`, `!/${PICS}/loose.png`])
})

test('the main folder is never slimmed', () => {
  const root = repo()
  assert.match(L.slim(root), /main folder/)
  assert.equal(existsSync(join(root, PICS, 'loose.png')), true)
})

test('a new copy leaves out the old pictures, keeps the rest, and shows no change', () => {
  const root = repo(); const dir = copy(root)
  assert.equal(L.slim(dir), 'slimmed')
  assert.equal(existsSync(join(dir, PICS, '2026-10-01-walk-a')), false)
  assert.equal(existsSync(join(dir, PICS, 'loose.png')), false)
  assert.equal(existsSync(join(dir, 'docs/guide.md')), true)
  assert.equal(existsSync(join(dir, 'README.md')), true)
  assert.equal(g(dir, 'status', '--porcelain'), '')
  assert.equal(L.slim(dir), 'already lean')
  assert.equal(existsSync(join(root, PICS, '2026-10-01-walk-a/s01.png')), true, 'the main folder keeps them')
})

test("a new walk's pictures save and commit in a lean copy with no extra step", () => {
  const root = repo(); const dir = copy(root)
  L.slim(dir)
  put(dir, `${PICS}/2026-11-22-new-walk/s01.png`)
  g(dir, 'add', '-A')
  assert.match(g(dir, 'status', '--porcelain'), /A {2}docs\/pics\/2026-11-22-new-walk\/s01\.png/)
})

test("an old walk's folder is refused until fetched, then fetched alone, then commits", () => {
  const root = repo(); const dir = copy(root)
  L.slim(dir)
  put(dir, `${PICS}/2026-10-01-walk-a/s03.png`)
  const refused = spawnSync('git', ['-C', dir, 'add', '-A'], { encoding: 'utf8' })
  assert.notEqual(refused.status, 0, 'git refuses it loudly')
  assert.match(L.get(dir, ['2026-10-01-walk-a']), /Fetched/)
  assert.equal(existsSync(join(dir, PICS, '2026-10-01-walk-a/B/s02.png')), true, 'its subfolders come too')
  assert.equal(existsSync(join(dir, PICS, '2026-10-02-walk-b')), false, 'the other walk stays out')
  g(dir, 'add', '-A')
  assert.match(g(dir, 'status', '--porcelain'), /A {2}docs\/pics\/2026-10-01-walk-a\/s03\.png/)
  assert.match(L.status(dir), /Fetched: \/docs\/pics\/2026-10-01-walk-a\//)
  assert.throws(() => L.get(dir, ['no-such-walk']), /no folder/)
})

test('a whole path works for get, and full puts every picture back', () => {
  const root = repo(); const dir = copy(root)
  L.slim(dir)
  L.get(dir, [`${PICS}/2026-10-02-walk-b/`])
  assert.equal(existsSync(join(dir, PICS, '2026-10-02-walk-b/s01.png')), true)
  g(dir, 'sparse-checkout', 'disable')
  assert.equal(existsSync(join(dir, PICS, 'loose.png')), true)
})

test('a copy with picture work of its own, or RAPTOR_FULL_COPY=1, is left whole', () => {
  const root = repo(); const dir = copy(root)
  put(dir, `${PICS}/2026-10-01-walk-a/s01.png`, 'changed')
  assert.match(L.slim(dir), /picture changes/)
  const dir2 = copy(root, 'agent-def456')
  process.env.RAPTOR_FULL_COPY = '1'
  try { assert.match(L.slim(dir2), /RAPTOR_FULL_COPY/) } finally { delete process.env.RAPTOR_FULL_COPY }
  assert.equal(existsSync(join(dir2, PICS, 'loose.png')), true)
})

test("the app's helper hook slims only the helper's own copy, and hands it the note", () => {
  const root = repo(); const dir = copy(root, 'agent-a1')
  // a helper started WITHOUT its own copy runs in the chat's copy: never touched
  const chat = copy(root, 'some-chat')
  assert.equal(L.onAppHook({ hook_event_name: 'SubagentStart', agent_id: 'a1', cwd: chat }), null)
  assert.equal(existsSync(join(chat, PICS, 'loose.png')), true)
  assert.equal(L.onAppHook({ hook_event_name: 'SubagentStart', agent_id: 'zz', cwd: dir }), null)
  const out = L.onAppHook({ hook_event_name: 'SubagentStart', agent_id: 'a1', cwd: dir })
  assert.equal(out.hookSpecificOutput.hookEventName, 'SubagentStart')
  assert.match(out.hookSpecificOutput.additionalContext, /lean-copy\.mjs get/)
  assert.match(out.hookSpecificOutput.additionalContext, new RegExp(`${root.replace(/\\/g, '/').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/${PICS}`))
  assert.equal(existsSync(join(dir, PICS, 'loose.png')), false)
})

test("the app's chat hook slims a chat's new copy, never the main folder", () => {
  const root = repo(); const dir = copy(root, 'dreamy-chat')
  assert.equal(L.onAppHook({ hook_event_name: 'SessionStart', source: 'startup', cwd: root }), null)
  assert.equal(existsSync(join(root, PICS, 'loose.png')), true)
  assert.match(L.onAppHook({ hook_event_name: 'SessionStart', source: 'startup', cwd: dir }).hookSpecificOutput.additionalContext, /old walk pictures/)
  assert.equal(existsSync(join(dir, PICS, 'loose.png')), false)
})

test("git's hook only acts on a NEW copy", () => {
  const root = repo(); const dir = copy(root, 'typed')
  assert.equal(L.onGitHook(['a'.repeat(40), 'b'.repeat(40), '1'], dir), null, 'a branch switch is not a new copy')
  assert.equal(L.onGitHook([L.NULL_REF, 'b'.repeat(40), '0'], dir), null, 'a file checkout is not a new copy')
  assert.equal(L.onGitHook([L.NULL_REF, 'b'.repeat(40), '1'], dir), 'slimmed')
})

test('installed, git\'s hook slims a copy made by typing git worktree add; uninstall takes it out', () => {
  const root = repo()
  assert.match(L.install(root), /Installed/)
  assert.match(L.install(root), /Installed/, 'installing twice is fine')
  const dir = join(root, '..', `${root.split(/[\\/]/).pop()}-typed`)
  execFileSync('git', ['-C', root, 'worktree', 'add', '-q', '--detach', dir, 'HEAD'], { env: { ...process.env, LEAN_COPY_PICS: PICS } })
  assert.equal(L.isLean(dir), true)
  assert.equal(existsSync(join(dir, PICS, 'loose.png')), false)
  assert.equal(existsSync(join(dir, 'docs/guide.md')), true)
  // a branch switch in the main folder runs the hook too, and leaves it whole
  g(root, 'checkout', '-q', '-b', 'other')
  assert.equal(existsSync(join(root, PICS, 'loose.png')), true)
  assert.match(L.uninstall(root), /Taken out/)
  assert.equal(existsSync(join(g(root, 'rev-parse', '--git-common-dir').trim(), 'hooks', 'post-checkout')), false)
})

test('install never replaces a hook of another kind', () => {
  const root = repo()
  const file = join(root, '.git', 'hooks', 'post-checkout')
  mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, '#!/bin/sh\necho mine\n')
  assert.throws(() => L.install(root), /another hook/)
  assert.throws(() => L.uninstall(root), /another hook/)
  assert.equal(readFileSync(file, 'utf8'), '#!/bin/sh\necho mine\n')
})
