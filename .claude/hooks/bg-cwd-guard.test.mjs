// Tests for bg-cwd-guard.mjs ([BG-CWD-GUARD], D162). Run: node --test .claude/hooks/bg-cwd-guard.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { refusal } from './bg-cwd-guard.mjs';

const bg = (command, tool_name = 'Bash') => ({ tool_name, tool_input: { command, run_in_background: true } });

test('refuses a backgrounded npm / npx command that never moves into raptor-port', () => {
  for (const c of [
    'npm run test:e2e',
    'npm test 2>&1 | tail -20',
    'npx playwright test',
    'npx vite preview --port 4173',
    'git status && npm run build',
    'npm.cmd run build',
    'pnpm test',
    'cd .. && npm test',
    'npm run build > raptor-port/build.log',
  ]) assert.ok(refusal(bg(c)), c);
});

test('lets a backgrounded command through once it moves into raptor-port', () => {
  for (const c of [
    'cd raptor-port && npm run test:e2e',
    'cd "C:/Users/User/projects/Raptor/raptor-port" && npm test',
    'cd /home/user/Raptor/raptor-port && npx playwright test',
    '(cd raptor-port; npm run smoke:tracker)',
    'pushd raptor-port && npm test',
    'npm --prefix raptor-port run build',
    'npm --prefix=raptor-port test',
  ]) assert.equal(refusal(bg(c)), null, c);
  for (const c of [
    'Set-Location raptor-port; npm run test:e2e',
    'Set-Location -Path "raptor-port"; npx playwright test',
    'sl raptor-port; npm test',
  ]) assert.equal(refusal(bg(c, 'PowerShell')), null, c);
});

test('leaves foreground commands and non-npm background commands alone', () => {
  assert.equal(refusal({ tool_name: 'Bash', tool_input: { command: 'npm test' } }), null);
  assert.equal(refusal({ tool_name: 'Bash', tool_input: { command: 'npm test', run_in_background: false } }), null);
  for (const c of ['node raptor-port/reference/tfin.js', 'gh run list --limit 1', 'echo npmrc', 'ls node_modules/npm-run-all'])
    assert.equal(refusal(bg(c)), null, c);
});

test('lets anything unreadable through rather than blocking every command', () => {
  assert.equal(refusal(null), null);
  assert.equal(refusal({}), null);
  assert.equal(refusal({ tool_input: { run_in_background: true } }), null);
});

test('as a hook: exit 2 with the reason to refuse, exit 0 to allow, exit 0 on garbage', () => {
  const hook = fileURLToPath(new URL('./bg-cwd-guard.mjs', import.meta.url));
  const run = (stdin) => spawnSync(process.execPath, [hook], { input: stdin, encoding: 'utf8' });
  const no = run(JSON.stringify(bg('npm run test:e2e')));
  assert.equal(no.status, 2);
  assert.match(no.stderr, /cd raptor-port/);
  assert.equal(run(JSON.stringify(bg('cd raptor-port && npm run test:e2e'))).status, 0);
  assert.equal(run('not json').status, 0);
});
