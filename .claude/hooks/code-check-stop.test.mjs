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
import { read, doctorArgs, runTool } from '../../raptor-port/scripts/code-check.mjs';

const CLEAN = 'Code check: no new problem in the code this branch changes.';
const COULD_NOT = "Code check: could not run this time. The pull request's code check still runs.";
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
  // tracked from the start, as in the real repo (the fix read's finding 4: a change to them is a `git diff`, not a new file)
  for (const f of ['doctor.config.json', 'package.json', 'tsconfig.app.json']) writeFileSync(join(root, 'raptor-port', f), '{}\n');
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
    assert.equal(await run({ cwd: root }), CLEAN);
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
    assert.equal(await run({ cwd: root }), CLEAN);
    assert.equal(runs(root), 2);
  } finally { done(root); }
});

test('a new, never-added file under src counts, and so does a change to its contents', async () => {
  const root = project();
  try {
    writeFileSync(join(root, 'raptor-port', 'src', 'b.tsx'), 'export const b = 1\n');
    assert.equal(await run({ cwd: root }), CLEAN);
    writeFileSync(join(root, 'raptor-port', 'src', 'b.tsx'), 'export const b = 2\n');
    assert.equal(await run({ cwd: root }), CLEAN);
    assert.equal(runs(root), 2);
  } finally { done(root); }
});

test('a run that cannot compare is reported once, not at every turn', async () => {
  const root = project();
  try {
    answer(root, { status: 'error', reason: 'x', newCount: 0, findings: [], changedFiles: 0, base: 'origin/main' });
    writeFileSync(join(root, 'raptor-port', 'src', 'a.ts'), 'export const a = 4\n');
    assert.equal(await run({ cwd: root }), COULD_NOT);
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
    assert.equal(r.status, 0); assert.deepEqual(JSON.parse(r.stdout), { systemMessage: CLEAN });
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
  // files the linter dropped are marked only here (the fix read's finding 1): their new findings are missing, so no pass
  assert.equal(read({ ...good, projects: [{ skippedChecks: [], skippedCheckReasons: { 'lint:partial': '2 file(s) failed to lint' } }] }, 'origin/main').status, 'error');
});

test('the run is told its own time limit, inside the kill timer (the read\'s finding 1: a killed shell left it running)', () => {
  const a = doctorArgs({ base: 'origin/main', timeoutMs: 150000, out: 'r.json' });
  const at = a.indexOf('--max-duration');
  assert.ok(at > 0, 'React Doctor is given --max-duration');
  const secs = Number(a[at + 1]);
  assert.ok(secs >= 10 && secs <= 150 - 15, `it stops itself at least 15 s before the kill (${secs})`);
  assert.equal(Number(doctorArgs({ base: 'origin/main', timeoutMs: 5000, out: 'r.json' })[at + 1]), 10, 'never under 10 s');
});

test('an error from React Doctor is told in its own words, not as raw data (the read\'s finding 4)', () => {
  const r = read({ ...good, error: { message: 'Diff base branch "x" does not exist', name: 'E', sentryEventId: null } }, 'x');
  assert.equal(r.status, 'error'); assert.match(r.reason, /Diff base branch "x" does not exist/); assert.doesNotMatch(r.reason, /sentryEventId/);
});

test('a change to React Doctor\'s settings or the project file counts as a new state of the code (the read\'s finding 2)', async () => {
  const root = project();
  try {
    writeFileSync(join(root, 'raptor-port', 'src', 'a.ts'), 'export const a = 7\n');
    await run({ cwd: root });
    for (const [f, body] of [['doctor.config.json', '{"rules":{}}\n'], ['package.json', '{"name":"x"}\n'], ['tsconfig.app.json', '{"compilerOptions":{}}\n']]) {
      const before = runs(root);
      writeFileSync(join(root, 'raptor-port', f), body);
      assert.notEqual(await run({ cwd: root }), null, `${f} changed: checked again`);
      assert.equal(runs(root), before + 1);
    }
  } finally { done(root); }
});

test('the line in the chat is plain words for him — no file names or line numbers (the read\'s finding 3)', async () => {
  const root = project();
  try {
    answer(root, { status: 'new', newCount: 2, findings: [{ file: 'src/x.tsx', line: 3, title: 't' }, { file: 'src/y.tsx', line: 4, title: 'u' }], changedFiles: 2, base: 'origin/main' });
    writeFileSync(join(root, 'raptor-port', 'src', 'a.ts'), 'export const a = 8\n');
    const text = await run({ cwd: root });
    assert.match(text, /2 new problems in the code this branch changes/); assert.doesNotMatch(text, /src\/|\.tsx|:\d/);
  } finally { done(root); }
});

test('the report: a finding listed but not counted is still counted', () => {
  const r = read({ ...good, diagnostics: [{ filePath: 'a', line: 1, rule: 'r', title: 't' }] }, 'origin/main');
  assert.equal(r.status, 'new'); assert.equal(r.newCount, 1);
});

test('out of time, the whole tree is stopped — the program and what it started (the read\'s finding 1)', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-tree-'));
  try {
    const pids = join(dir, 'pids.txt');
    const prog = join(dir, 'parent.cjs');
    writeFileSync(prog, `const { spawn } = require('child_process'); const fs = require('fs');
const c = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
fs.writeFileSync(${JSON.stringify(pids)}, process.pid + ' ' + c.pid); setInterval(() => {}, 1000);`);
    const started = Date.now();
    const r = await runTool('node', [prog], { cwd: dir, timeoutMs: 2500 });
    assert.equal(r.timedOut, true);
    assert.ok(Date.now() - started < 15000, 'it does not wait on a survivor');
    const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
    await new Promise((d) => setTimeout(d, 500));
    for (const pid of readFileSync(pids, 'utf8').trim().split(' ').map(Number)) assert.equal(alive(pid), false, `process ${pid} still running`);
  } finally {
    // a failed run must not leave its survivors behind either
    try { for (const pid of readFileSync(join(dir, 'pids.txt'), 'utf8').trim().split(' ').map(Number)) try { process.kill(pid); } catch { /* gone */ } } catch { /* never started */ }
    done(dir);
  }
});
