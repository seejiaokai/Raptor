// Tests for code-check-stop.mjs (the end-of-turn code check, D1539) and for how raptor-port/scripts/code-check.mjs reads
// React Doctor's report. Run: node --test .claude/hooks/code-check-stop.test.mjs
// The hook is driven against a throwaway git project whose raptor-port/scripts/code-check.mjs is a stand-in: it counts its
// runs in a file and answers what the test tells it — so these tests never start React Doctor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { run, codeChange } from './code-check-stop.mjs';
import { read } from '../../raptor-port/scripts/code-check.mjs';

const HOOK = join(dirname(fileURLToPath(import.meta.url)), 'code-check-stop.mjs');
const g = (cwd, ...a) => { const r = spawnSync('git', a, { cwd, encoding: 'utf8' }); assert.equal(r.status, 0, `git ${a.join(' ')}: ${r.stderr}`); return r.stdout; };

const STUB = `import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const here = dirname(fileURLToPath(import.meta.url))
export function runCheck(opts) {
  const n = join(here, 'runs.txt'); writeFileSync(n, String((existsSync(n) ? Number(readFileSync(n, 'utf8')) : 0) + 1))
  writeFileSync(join(here, 'opts.json'), JSON.stringify(opts))
  const answer = existsSync(join(here, 'answer.json')) ? JSON.parse(readFileSync(join(here, 'answer.json'), 'utf8')) : { status: 'clean', newCount: 0, findings: [], changedFiles: 1, base: opts.base }
  if (answer.throw) throw new Error('boom')
  return answer
}
export const sentence = (r) => r.status + ':' + r.newCount
`;

/** A project with main, and a branch `work` checked out, level with it. `origin/main` is a plain ref, as a fetch leaves it. */
function project() {
  const root = mkdtempSync(join(tmpdir(), 'cc-hook-'));
  g(root, 'init', '-q', '-b', 'main');
  g(root, 'config', 'user.email', 't@t'); g(root, 'config', 'user.name', 't'); g(root, 'config', 'core.autocrlf', 'false');
  mkdirSync(join(root, 'raptor-port', 'scripts'), { recursive: true });
  mkdirSync(join(root, 'raptor-port', 'src'), { recursive: true });
  mkdirSync(join(root, 'raptor-port', 'docs'), { recursive: true });
  writeFileSync(join(root, 'raptor-port', 'scripts', 'code-check.mjs'), STUB);
  writeFileSync(join(root, '.gitignore'), 'raptor-port/scripts/runs.txt\nraptor-port/scripts/opts.json\nraptor-port/scripts/answer.json\n');
  writeFileSync(join(root, 'raptor-port', 'src', 'a.ts'), 'export const a = 1\n');
  g(root, 'add', '-A'); g(root, 'commit', '-qm', 'base');
  g(root, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
  g(root, 'checkout', '-qb', 'work');
  return root;
}
const runs = (root) => { const f = join(root, 'raptor-port', 'scripts', 'runs.txt'); return existsSync(f) ? Number(readFileSync(f, 'utf8')) : 0; };
const answer = (root, a) => writeFileSync(join(root, 'raptor-port', 'scripts', 'answer.json'), JSON.stringify(a));
const done = (root) => rmSync(root, { recursive: true, force: true });

test('no change under raptor-port/src: silent, no run', async () => {
  const root = project();
  try {
    assert.equal(await run({ cwd: root }), null);
    writeFileSync(join(root, 'raptor-port', 'docs', 'note.md'), 'a note\n');
    writeFileSync(join(root, 'raptor-port', 'scripts', 'walk.mjs'), 'export const w = 1\n');
    assert.equal(await run({ cwd: root }), null, 'a note or a walk script alone does not start a run');
    assert.equal(runs(root), 0);
  } finally { done(root); }
});

test('a change under src runs once, reports, and is not run again until the code changes', async () => {
  const root = project();
  try {
    writeFileSync(join(root, 'raptor-port', 'src', 'a.ts'), 'export const a = 2\n');
    assert.equal(await run({ cwd: root }), 'clean:0');
    assert.equal(runs(root), 1);
    const opts = JSON.parse(readFileSync(join(root, 'raptor-port', 'scripts', 'opts.json'), 'utf8'));
    assert.equal(opts.base, 'origin/main'); assert.equal(opts.includeUntracked, true);
    assert.ok(opts.timeoutMs > 0 && opts.timeoutMs <= 170000, 'the run is cut off inside the hook\'s own time');
    assert.equal(await run({ cwd: root }), null, 'the same code: silent');
    g(root, 'add', '-A'); g(root, 'commit', '-qm', 'same code, committed');
    assert.equal(await run({ cwd: root }), null, 'committing the same code is not a new state of the code');
    writeFileSync(join(root, 'raptor-port', 'docs', 'note.md'), 'a note\n');
    assert.equal(await run({ cwd: root }), null, 'a note beside it is not a code change');
    assert.equal(runs(root), 1);
    writeFileSync(join(root, 'raptor-port', 'src', 'a.ts'), 'export const a = 3\n');
    assert.equal(await run({ cwd: root }), 'clean:0');
    assert.equal(runs(root), 2);
  } finally { done(root); }
});

test('a new, never-added file under src counts, and so does a change to its contents', async () => {
  const root = project();
  try {
    writeFileSync(join(root, 'raptor-port', 'src', 'b.tsx'), 'export const b = 1\n');
    assert.equal(await run({ cwd: root }), 'clean:0');
    writeFileSync(join(root, 'raptor-port', 'src', 'b.tsx'), 'export const b = 2\n');
    assert.equal(await run({ cwd: root }), 'clean:0');
    assert.equal(runs(root), 2);
  } finally { done(root); }
});

test('new findings are named, five at most, the rest counted', async () => {
  const root = project();
  try {
    const findings = Array.from({ length: 7 }, (_, i) => ({ file: `src/f${i}.tsx`, line: i + 1, title: `t${i}` }));
    answer(root, { status: 'new', newCount: 7, findings, changedFiles: 7, base: 'origin/main' });
    writeFileSync(join(root, 'raptor-port', 'src', 'a.ts'), 'export const a = 9\n');
    const text = await run({ cwd: root });
    assert.match(text, /^new:7\n/);
    assert.match(text, /src\/f0\.tsx:1 — t0/); assert.match(text, /src\/f4\.tsx:5 — t4/);
    assert.doesNotMatch(text, /f5\.tsx/);
    assert.match(text, /… and 2 more: npm run lint:changed/);
  } finally { done(root); }
});

test('a run that cannot compare is reported once, not at every turn', async () => {
  const root = project();
  try {
    answer(root, { status: 'error', reason: 'x', newCount: 0, findings: [], changedFiles: 0, base: 'origin/main' });
    writeFileSync(join(root, 'raptor-port', 'src', 'a.ts'), 'export const a = 4\n');
    assert.equal(await run({ cwd: root }), 'error:0');
    assert.equal(await run({ cwd: root }), null);
    assert.equal(runs(root), 1);
  } finally { done(root); }
});

test('silent whenever it cannot run: held turn, no script, no origin/main, not a repo, a failing check', async () => {
  const root = project();
  try {
    writeFileSync(join(root, 'raptor-port', 'src', 'a.ts'), 'export const a = 5\n');
    assert.equal(await run({ cwd: root, stop_hook_active: true }), null);
    assert.equal(await run(null), null);
    answer(root, { throw: true });
    assert.equal(await run({ cwd: root }), null, 'a check that throws is let through');
    rmSync(join(root, 'raptor-port', 'scripts', 'answer.json'));
    g(root, 'update-ref', '-d', 'refs/remotes/origin/main');
    assert.equal(codeChange(root), null);
    g(root, 'update-ref', 'refs/remotes/origin/main', 'main');
    rmSync(join(root, 'raptor-port', 'scripts', 'code-check.mjs'));
    assert.equal(codeChange(root), null, 'a branch from before the script is left alone');
    const plain = mkdtempSync(join(tmpdir(), 'cc-plain-'));
    try { assert.equal(await run({ cwd: plain }), null); } finally { done(plain); }
  } finally { done(root); }
});

test('as a program: always exit 0; a systemMessage only when it ran', () => {
  const root = project();
  try {
    const go = (input) => spawnSync(process.execPath, [HOOK], { input: JSON.stringify(input), encoding: 'utf8' });
    let r = go({ cwd: root });
    assert.equal(r.status, 0); assert.equal(r.stdout, '');
    writeFileSync(join(root, 'raptor-port', 'src', 'a.ts'), 'export const a = 6\n');
    r = go({ cwd: root });
    assert.equal(r.status, 0); assert.deepEqual(JSON.parse(r.stdout), { systemMessage: 'clean:0' });
    r = spawnSync(process.execPath, [HOOK], { input: 'not json', encoding: 'utf8' });
    assert.equal(r.status, 0); assert.equal(r.stdout, '');
  } finally { done(root); }
});

// ---- how the shared script reads React Doctor's report ----
const good = { mode: 'baseline', ok: true, error: null, baseline: { newCount: 0, matchedCount: 2 }, diff: { changedFileCount: 3 }, projects: [{ skippedChecks: [] }], diagnostics: [] };

test('the report: a real comparison is believed', () => {
  assert.equal(read(good, 'origin/main').status, 'clean');
  const one = { ...good, baseline: { newCount: 1, matchedCount: 2 }, diagnostics: [{ filePath: 'src/x.tsx', line: 3, plugin: 'react-doctor', rule: 'r', severity: 'warning', title: 'T' }] };
  const r = read(one, 'origin/main');
  assert.equal(r.status, 'new'); assert.equal(r.newCount, 1); assert.equal(r.findings[0].rule, 'react-doctor/r'); assert.equal(r.changedFiles, 3);
});

test('the report: a comparison not made is never a pass', () => {
  // React Doctor's own fallback when main's side cannot be read: every finding listed, its pass/fail switched off
  assert.equal(read({ ...good, baselineDegraded: true, mode: 'diff' }, 'origin/main').status, 'error');
  assert.equal(read({ ...good, baselineDegraded: true }, 'origin/main').status, 'error', 'the degraded mark alone is enough');
  assert.equal(read({ ...good, mode: 'diff', baseline: undefined }, 'origin/main').status, 'error');
  assert.equal(read({ ...good, error: { message: 'no base' } }, 'origin/main').status, 'error');
  assert.equal(read({ ...good, projects: [{ skippedChecks: ['lint'] }] }, 'origin/main').status, 'error');
  assert.equal(read(null, 'origin/main').status, 'error');
});

test('the report: a finding listed but not counted is still counted', () => {
  const r = read({ ...good, diagnostics: [{ filePath: 'a', line: 1, rule: 'r', title: 't' }] }, 'origin/main');
  assert.equal(r.status, 'new'); assert.equal(r.newCount, 1);
});
