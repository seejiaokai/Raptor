// Tests for bg-cwd-guard.mjs ([BG-CWD-GUARD], D162). Run: node --test .claude/hooks/bg-cwd-guard.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { refusal } from './bg-cwd-guard.mjs';

const bg = (command, tool_name = 'Bash') => ({ tool_name, tool_input: { command, run_in_background: true } });
/* the folder the chat started in ($CLAUDE_PROJECT_DIR) — passed explicitly, so no test depends on where it is run from */
const ROOT = { CLAUDE_PROJECT_DIR: '/c/Users/User/projects/Raptor' };
const TREE = { CLAUDE_PROJECT_DIR: String.raw`C:\Users\User\projects\Raptor\.claude\worktrees\five-flags` };
const INSIDE = { CLAUDE_PROJECT_DIR: String.raw`C:\Users\User\projects\Raptor\raptor-port\ `.trim() };

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
  ]) assert.ok(refusal(bg(c), ROOT), c);
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
  ]) assert.equal(refusal(bg(c), ROOT), null, c);
  for (const c of [
    'Set-Location raptor-port; npm run test:e2e',
    'Set-Location -Path "raptor-port"; npx playwright test',
    'sl raptor-port; npm test',
  ]) assert.equal(refusal(bg(c, 'PowerShell'), ROOT), null, c);
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
  const env = { ...process.env, CLAUDE_PROJECT_DIR: String.raw`C:\Users\User\projects\Raptor` };
  const run = (stdin) => spawnSync(process.execPath, [hook], { input: stdin, encoding: 'utf8', env });
  const no = run(JSON.stringify(bg('npm run test:e2e')));
  assert.equal(no.status, 2);
  assert.match(no.stderr, /cd "C:\/Users\/User\/projects\/Raptor\/raptor-port"/);
  assert.equal(run(JSON.stringify(bg('cd raptor-port && npm run test:e2e'))).status, 0);
  assert.equal(run('not json').status, 0);
});

/* [BG-GUARD-FALSE] (26 Sep 26): a background shell starts in the folder the CHAT started in ($CLAUDE_PROJECT_DIR), not at
   "the repo root" and not where the foreground shell has moved to — measured the same day: a foreground `cd raptor-port`
   then a background `pwd` printed the worktree's root. The accounts chat's session had STARTED inside raptor-port, so
   its background shells were already there and the guard's own advice, `cd raptor-port && …`, failed. */
test('a chat that STARTED inside raptor-port may run a bare npm in the background — it is already there', () => {
  for (const c of ['npm run test:e2e', 'npx vitest run', 'npm run build > build.log 2>&1'])
    assert.equal(refusal(bg(c), INSIDE), null, c);
});
test('the refusal names the FULL path, which works from any starting folder', () => {
  assert.match(refusal(bg('npm test'), ROOT), /cd "\/c\/Users\/User\/projects\/Raptor\/raptor-port" && npm/);
  assert.match(refusal(bg('npm test'), TREE), /cd "C:\/Users\/User\/projects\/Raptor\/\.claude\/worktrees\/five-flags\/raptor-port"/);
  assert.match(refusal(bg('npm test'), TREE), /Set-Location "C:\/Users/);
  assert.match(refusal(bg('npm test'), TREE), /STARTED in \(C:\/Users\/User\/projects\/Raptor\/\.claude\/worktrees\/five-flags\)/);
  assert.match(refusal(bg('npm test'), {}), /<the repo>\/raptor-port/, 'no starting folder known: still a full-path shape');
  assert.doesNotMatch(refusal(bg('npm test'), ROOT), /REPO ROOT/, 'the old, wrong note is gone');
});
test('the full-path forms the accounts chat reported are let through, from any starting folder', () => {
  for (const env of [ROOT, TREE, INSIDE, {}]) for (const c of [
    'cd /c/Users/User/projects/Raptor/raptor-port && npm run build',
    'cd /c/Users/User/projects/Raptor && cd raptor-port && npm run build',
    String.raw`cd C:\Users\User\projects\Raptor\raptor-port && npx vitest run`,
    'cd "C:/Users/User/projects/Raptor/.claude/worktrees/five-flags/raptor-port" && npm test',
    'npm --prefix "C:/Users/User/projects/Raptor/raptor-port" run build',
  ]) assert.equal(refusal(bg(c), env), null, `${c} (${JSON.stringify(env)})`);
});
test('a chat started at the root is still refused a bare npm, as before', () => {
  for (const env of [ROOT, TREE, {}]) assert.ok(refusal(bg('npm run test:e2e'), env), JSON.stringify(env));
});
