/* THE IGNORED BUILD STEP'S TESTS — his D2032, [VERCEL-SKIP-NOTES] (13 Nov 26). The first group feeds the decision lists
 * of changed files; the second builds a throwaway repo, makes real commits and runs vercel-ignore.mjs as Vercel does
 * (a child process, VERCEL_GIT_PREVIOUS_SHA set), asserting its exit code: 0 skips, 1 builds.
 *
 * Run alone: node --test raptor-port/scripts/vercel-ignore.test.mjs */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'
import { isNote, decide } from './vercel-ignore.mjs'

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'vercel-ignore.mjs')
const SHA = 'a'.repeat(40)

test('notes are told apart from everything else', () => {
  for (const f of [
    '.claude/rules/decisions/how-we-work.md', '.claude/decisions-full/scheduler.md', 'DECISIONS.md',
    'DECISIONS-ARCHIVE.md', 'HANDOFF.md', 'HANDOFF-ARCHIVE.md', 'OUTSTANDING.md', 'OUTSTANDING-ARCHIVE.md',
    'raptor-port/docs/ui-contracts.md', 'raptor-port/docs/img/handpass/2026-10-12-one-rule/B/s01-1.png',
    'raptor-port/docs/handpass/2026-11-13-x.md',
  ]) assert.equal(isNote(f), true, f)
  for (const f of [
    'raptor-port/src/App.tsx', 'raptor-port/package.json', 'raptor-port/package-lock.json', 'raptor-port/vite.config.ts',
    'raptor-port/index.html', 'raptor-port/public/favicon.svg', 'vercel.json', 'raptor-port/scripts/vercel-ignore.mjs',
    '.github/workflows/deploy.yml', '.claude/rules/shipping.md', '.claude/hooks/x.sh', '.claude/settings.json',
    'raptor-port/CLAUDE.md', 'AGENTS.md', 'README.md', 'raptor-port/README.md', '.gitattributes',
    'raptor-port/sample-data/x.json', 'raptor-port/reference/tfin.js',
    /* look-alikes that are not notes */
    'raptor-port/src/docs/x.ts', 'docs/x.md', 'raptor-port/docsx/a.md', 'sub/HANDOFF.md', 'sub/DECISIONS.md',
    '.claude/rules/decisions.md',
  ]) assert.equal(isNote(f), false, f)
})

test('the decision', () => {
  assert.equal(decide({ base: '', files: null }).build, true, 'first deployment builds')
  assert.equal(decide({ base: SHA, files: null }).build, true, 'unlisted builds')
  assert.equal(decide({ base: SHA, files: [] }).build, true, 'nothing listed builds')
  assert.equal(decide({ base: SHA, files: ['HANDOFF.md', 'OUTSTANDING.md'] }).build, false, 'notes only skips')
  assert.equal(decide({ base: SHA, files: ['HANDOFF.md', 'raptor-port/src/a.ts'] }).build, true, 'a mix builds')
  assert.equal(decide({ base: SHA, files: ['vercel.json'] }).build, true, 'the deploy settings build')
  assert.match(decide({ base: SHA, files: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }).reason, /and 2 more/)
})

function repo() {
  const dir = mkdtempSync(join(tmpdir(), 'vercel-ignore-'))
  const g = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8' }).trim()
  g('init', '-q')
  g('config', 'user.email', 't@t'); g('config', 'user.name', 't'); g('config', 'core.autocrlf', 'false')
  const put = (path, text) => { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text) }
  const commit = msg => { g('add', '-A'); g('commit', '-q', '-m', msg); return g('rev-parse', 'HEAD') }
  put('raptor-port/src/a.ts', '1'); put('HANDOFF.md', '1')
  const first = commit('first')
  return { dir, g, put, commit, first }
}

function run(dir, base) {
  const env = { ...process.env }
  if (base === undefined) delete env.VERCEL_GIT_PREVIOUS_SHA; else env.VERCEL_GIT_PREVIOUS_SHA = base
  const r = spawnSync(process.execPath, [SCRIPT], { cwd: dir, env, encoding: 'utf8' })
  return { code: r.status, out: r.stdout + r.stderr }
}

test('in a real repo: notes-only pushes skip, app pushes build, unknowns build', () => {
  const { dir, g, put, commit, first } = repo()
  try {
    assert.equal(run(dir, undefined).code, 1, 'no base: builds')
    assert.equal(run(dir, '').code, 1, 'empty base: builds')

    put('HANDOFF.md', '2'); put('raptor-port/docs/img/x.png', 'p'); commit('notes')
    let r = run(dir, first)
    assert.equal(r.code, 0, r.out)
    assert.match(r.out, /skipping/)

    /* two notes pushes in a row, measured from the last real build, and then an app change after them */
    put('OUTSTANDING.md', 'o'); commit('notes 2')
    assert.equal(run(dir, first).code, 0)
    put('raptor-port/src/a.ts', '2'); commit('app')
    r = run(dir, first)
    assert.equal(r.code, 1, r.out)
    assert.match(r.out, /raptor-port\/src\/a\.ts/)

    /* a rename of an app file into docs still lists the old app path, so it builds */
    const built = g('rev-parse', 'HEAD')
    g('mv', 'raptor-port/src/a.ts', 'raptor-port/docs/a.ts'); commit('move')
    assert.equal(run(dir, built).code, 1, 'a rename out of the app builds')

    /* a file name with spaces and odd characters is read whole */
    const b2 = g('rev-parse', 'HEAD')
    put('raptor-port/docs/handpass/a b é.md', 'x'); commit('odd name')
    assert.equal(run(dir, b2).code, 0)

    /* a base that is not in the clone (and cannot be fetched — there is no origin) builds */
    assert.equal(run(dir, 'b'.repeat(40)).code, 1)
    /* a base that is not even a sha builds */
    assert.equal(run(dir, 'not-a-sha').code, 1)
    /* a base equal to HEAD: nothing listed, builds to be safe */
    assert.equal(run(dir, g('rev-parse', 'HEAD')).code, 1)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a force-pushed branch is compared tree to tree, whatever the history', () => {
  const { dir, g, put, commit, first } = repo()
  try {
    put('raptor-port/src/a.ts', 'side'); const side = commit('side')
    g('reset', '-q', '--hard', first)
    put('HANDOFF.md', 'new'); commit('rewritten')
    /* the last build was `side`; the new head differs from it in the app file too, so it builds */
    assert.equal(run(dir, side).code, 1)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('outside a git repo it builds', () => {
  const dir = mkdtempSync(join(tmpdir(), 'vercel-ignore-nogit-'))
  try {
    assert.equal(run(dir, SHA).code, 1)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
