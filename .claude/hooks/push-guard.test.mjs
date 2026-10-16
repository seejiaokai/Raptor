// Tests for push-guard.mjs ([PUSH-LOCK-GUARD], D976). Run: node --test .claude/hooks/push-guard.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verdict, lockNeed } from './push-guard.mjs';
import { createRequire } from 'node:module';
const require_ = createRequire(import.meta.url);

const HERE = dirname(fileURLToPath(import.meta.url));
const call = (command, cwd = '/repo') => ({ tool_name: 'Bash', cwd, tool_input: { command } });
/* a stand-in for git, GitHub and the lock folder: every test says what the world looks like */
function world({ branch = 'claude/job', cfg = {}, sha = { 'origin/claude/job': 'abc' }, runs = [], lock = null } = {}) {
  return {
    branch: () => branch,
    config: (_c, k) => (k in cfg ? cfg[k] : null),
    remoteSha: (_c, r, b) => sha[`${r}/${b}`] || null,
    runs: () => runs,
    lock: () => lock,
  };
}
const refused = (v) => !!(v && v.refuse);

test('refuses a push that names main, however it is written', () => {
  for (const c of [
    'git push origin main', 'git push origin HEAD:main', 'git push origin HEAD:refs/heads/main', 'git push -f origin +main',
    'git push origin :main', 'git push origin master', 'git push --all origin', 'git push --mirror',
    'cd /c/x && git push origin claude/a:main', 'git -C ../other push origin main', 'git push origin main 2>&1 | tail -3',
  ]) assert.ok(refused(verdict(call(c), world())), c);
});

test('refuses a bare push that git would send to main (the 17 Oct 26 slip)', () => {
  const slip = world({ cfg: { 'push.default': 'upstream', 'branch.claude/job.merge': 'refs/heads/main' } });
  for (const c of ['git push', 'git push origin', 'git push -u origin']) assert.ok(refused(verdict(call(c), slip)), c);
  assert.ok(refused(verdict(call('git push'), world({ branch: 'main' }))), 'on main itself');
  assert.ok(refused(verdict(call('git push'), world({ cfg: { 'push.default': 'matching' } }))), 'matching');
  // the same bare push is fine once the branch tracks itself
  const fixed = world({ cfg: { 'push.default': 'upstream', 'branch.claude/job.merge': 'refs/heads/claude/job' } });
  assert.equal(verdict(call('git push'), fixed), null);
});

test('lets an ordinary branch push through', () => {
  for (const c of [
    'git push origin HEAD:refs/heads/claude/job', 'git push -u origin claude/job', 'git push', 'git push --dry-run origin main',
    'git push origin claude/maintenance', 'git status && git push origin claude/job',
  ]) assert.equal(verdict(call(c), world()), null, c);
});

test('refuses a push while a run of the last pushed commit is queued or running (D151)', () => {
  const busy = world({ runs: [{ headSha: 'abc', status: 'in_progress', workflowName: 'Deploy' }, { headSha: 'old', status: 'in_progress' }] });
  const v = verdict(call('git push origin HEAD:refs/heads/claude/job'), busy);
  assert.ok(refused(v)); assert.match(v.refuse, /Deploy \(in_progress\)/);
  assert.ok(refused(verdict(call('git push'), world({ runs: [{ headSha: 'abc', status: 'queued' }] }))));
  // a run of an OLDER commit, or a finished one, does not stop it
  assert.equal(verdict(call('git push'), world({ runs: [{ headSha: 'old', status: 'in_progress' }, { headSha: 'abc', status: 'completed' }] })), null);
  // a branch not yet on GitHub has no runs to ask about
  assert.equal(verdict(call('git push -u origin claude/new'), world({ runs: null })), null);
});

test('when GitHub cannot be asked, the push goes through with a note', () => {
  const v = verdict(call('git push origin claude/job'), world({ runs: null }));
  assert.ok(v && !v.refuse && /could not ask GitHub/.test(v.note));
});

test('the lock: what each check command needs', () => {
  const need = (c) => lockNeed(c.split(' '));
  for (const c of ['npm test', 'npm run test', 'npx vitest run', 'npx vitest run --reporter dot', 'npx vitest run > out.log',
    'npm run test:e2e', 'npx playwright test', 'npx playwright test a.spec.ts b.spec.ts', 'npx playwright test --project raptor',
    'npm run smoke:tracker', 'node scripts/tracker/smoke.mjs', 'npm run e2e:board']) assert.equal(need(c), 'held', c);
  for (const c of ['npx playwright test e2e/a.spec.ts', 'npm run test:e2e -- e2e/a.spec.ts', 'npm run build', 'npm run perf',
    'npm run probes:adapted']) assert.equal(need(c), 'free', c);
  for (const c of ['npx vitest run src/a.test.ts', 'npm test -- src/a.test.ts', 'npm run docsize', 'npm ci', 'npx tsc -b',
    'node raptor-port/scripts/gatelock.mjs exec "x — y" -- npx vitest run', 'git status']) assert.equal(need(c), null, c);
});

test('the lock: a full run needs this chat to hold it; a build waits only for another chat', () => {
  const held = (owner, min = 5) => ({ owner, ageMs: min * 60000 });
  const full = 'cd raptor-port && npx vitest run';
  assert.ok(refused(verdict(call(full), world())), 'nobody holds it');
  assert.ok(refused(verdict(call(full), world({ lock: held('claude/other — unit') }))), 'another chat holds it');
  assert.equal(verdict(call(full), world({ lock: held('claude/job — unit') })), null, 'this chat holds it');
  assert.ok(refused(verdict(call(full), world({ lock: held('claude/job — unit', 200) }))), 'its own stale lock is no lock');
  const build = 'cd raptor-port && npm run build';
  assert.equal(verdict(call(build), world()), null, 'free');
  assert.equal(verdict(call(build), world({ lock: held('claude/job — e2e') })), null, 'held by this chat');
  assert.ok(refused(verdict(call(build), world({ lock: held('claude/other — e2e') }))), 'held by another');
  assert.equal(verdict(call(build), world({ lock: held('claude/other — e2e', 200) })), null, 'a stale lock');
  const v = verdict(call(full), world());
  assert.match(v.refuse, /gatelock\.mjs" exec "claude\/job — <what>" -- npx vitest run/);
});

test('as the hook: refuses with exit 2 and its reason; lets the rest through with exit 0', () => {
  const run = (command) => spawnSync(process.execPath, [join(HERE, 'push-guard.mjs')], {
    input: JSON.stringify(call(command, HERE)), encoding: 'utf8' });
  const r = run('git push origin main');
  assert.equal(r.status, 2); assert.match(r.stderr, /PUSH GUARD/);
  assert.equal(run('echo hello').status, 0);
  assert.equal(spawnSync(process.execPath, [join(HERE, 'push-guard.mjs')], { input: 'not json', encoding: 'utf8' }).status, 0);
});

test('gatelock exec takes the lock, runs the command, releases it and passes its exit code on', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gl-')); const lock = join(dir, 'lock');
  const gl = join(HERE, '..', '..', 'raptor-port', 'scripts', 'gatelock.mjs');
  const env = { ...process.env, RAPTOR_GATE_LOCK: lock };
  const seen = join(dir, 'seen');
  const probe = `node -e "require('fs').writeFileSync(process.argv[1], String(require('fs').existsSync(process.argv[2])))" "${seen}" "${lock}"`;
  let r = spawnSync(process.execPath, [gl, 'exec', 'test — exec', '--', probe], { env, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(require_('fs').readFileSync(seen, 'utf8'), 'true', 'the lock was held while the command ran');
  assert.equal(existsSync(lock), false, 'released after');
  r = spawnSync(process.execPath, [gl, 'exec', 'test — exec', '--', 'node -e "process.exit(3)"'], { env, encoding: 'utf8' });
  assert.equal(r.status, 3); assert.equal(existsSync(lock), false, 'released after a failure too');
  rmSync(dir, { recursive: true, force: true });
});

// ---- the fresh read's findings of 17 Oct 26, each pinned with its own inputs ----------------------------------------

test('finding 1: a commit message, a pull request body or a heredoc that only NAMES a check or a push is let through', () => {
  const held = { lock: null };
  for (const c of [
    "git commit -m \"$(cat <<'EOF'\nAdd the guard\n\nChecks: npm test\nEOF\n)\"",
    "git commit -m \"$(cat <<'EOF'\nnpm run smoke:tracker — 345/345\nEOF\n)\"",
    "gh pr create --body \"$(cat <<'EOF'\n## Checks\n- npx vitest run\nEOF\n)\"",
    "git commit -m \"git push origin main is now refused\"",
    'git commit -m "docs; git push to main is refused"',
    "git commit -m 'npx vitest run | tail; git push origin main'",
    "cat > notes.md <<'EOF'\nnpx playwright test\ngit push origin main\nEOF",
  ]) assert.equal(verdict(call(c), world(held)), null, c);
});

test('finding 2: a lock whose exec process was killed is broken by the next take, at once', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gl-')); const lock = join(dir, 'lock');
  const gl = join(HERE, '..', '..', 'raptor-port', 'scripts', 'gatelock.mjs');
  // a holder that is gone: the lock folder names a process id that no longer runs
  const dead = spawnSync(process.execPath, ['-e', 'console.log(process.pid)'], { encoding: 'utf8' }).stdout.trim();
  mkdirSync(lock); writeFileSync(join(lock, 'owner.txt'), `claude/other — unit\nstarted: x\npid: 1\nholder-pid: ${dead}\n`);
  const r = spawnSync(process.execPath, [gl, 'exec', 'test — exec', '--', 'node -e "process.exit(0)"'], {
    env: { ...process.env, RAPTOR_GATE_LOCK: lock }, encoding: 'utf8', timeout: 20000 });
  assert.equal(r.status, 0, r.stdout + r.stderr); assert.match(r.stdout, /run ended without releasing it/);
  assert.equal(existsSync(lock), false);
  rmSync(dir, { recursive: true, force: true });
});

test('finding 3: full runs written other ways still need the lock', () => {
  for (const c of [
    'cd raptor-port; if ($?) { npx vitest run }', 'Set-Location raptor-port; if ($?) { npm test }',
    'npm --prefix raptor-port test', 'npm -C raptor-port test', 'npm run --silent test',
    'npx vitest run --bail 1', 'npx vitest run --maxWorkers 2', 'npx vitest run --exclude x',
    'npx vitest run src/', 'npm test -- src/', 'npx playwright test e2e/', 'npx vitest',
  ]) assert.ok(refused(verdict(call(c), world())), c);
});

test('finding 4: pushes to main written other ways are refused', () => {
  for (const c of [
    'git push origin HEAD:heads/main', 'git push origin :', 'git push origin +:', "git push origin 'refs/heads/*:refs/heads/*'",
    'git status & git push origin main', 'git push origin \\\nmain', 'bash -c "git push origin main"',
    "sh -c 'git push origin main'", 'powershell -Command "git push origin main"',
    'git push origin $(git branch --show-current):main',
  ]) assert.ok(refused(verdict(call(c), world())), c);
});

test('finding 5: a lock held by a branch whose name only begins like this one is not this chat\'s', () => {
  const w = world({ branch: 'claude/x', sha: {}, lock: { owner: 'claude/x-fix — unit', ageMs: 60000 } });
  assert.ok(refused(verdict(call('npx vitest run'), w)));
  const mine = world({ branch: 'claude/x', sha: {}, lock: { owner: 'claude/x — unit', ageMs: 60000 } });
  assert.equal(verdict(call('npx vitest run'), mine), null);
});

test('finding 6: in the PowerShell tool the way through is written for PowerShell', () => {
  const v = verdict({ tool_name: 'PowerShell', cwd: '/repo', tool_input: { command: 'Set-Location raptor-port; npx vitest run' } }, world());
  assert.match(v.refuse, /Set-Location "[^"]*raptor-port"; node /); assert.doesNotMatch(v.refuse, /&&/);
});

test('finding 7: asking a test tool for its version, help or list needs no lock', () => {
  for (const c of ['npx vitest --version', 'npx playwright test --list', 'npm run test:e2e -- --list', 'npx playwright --help'])
    assert.equal(verdict(call(c), world()), null, c);
});

test('finding 8: a -c push setting given on the command wins over the checkout\'s own', () => {
  const w = world({ cfg: { 'push.default': 'simple', 'branch.claude/job.merge': 'refs/heads/main' } });
  assert.equal(verdict(call('git push'), w), null, 'simple: git itself refuses a differently named upstream');
  assert.ok(refused(verdict(call('git -c push.default=upstream push'), w)));
});

// ---- the second read's findings of 17 Oct 26 --------------------------------------------------------------------------
const ps = (command) => ({ tool_name: 'PowerShell', cwd: '/repo', tool_input: { command } });
const slip = () => world({ cfg: { 'push.default': 'upstream', 'branch.claude/job.merge': 'refs/heads/main' } });

test('round 2, finding 1: a # comment neither hides a command after it nor counts as one', () => {
  assert.ok(refused(verdict(call("git add -A && git commit -m x\n# push it (it's ready)\ngit push"), slip())));
  assert.ok(refused(verdict(call("cd raptor-port\n# run the whole suite (it's slow)\nnpx vitest run"), world())));
  assert.ok(refused(verdict(ps("Set-Location raptor-port\n# run the whole suite (it's slow)\nnpx vitest run"), world())));
  assert.ok(refused(verdict(ps("<# a note (it's long) #>\nnpx vitest run"), world())));
  assert.equal(verdict(call('# then run npm test\nnode --test .claude/hooks/push-guard.test.mjs'), world()), null);
  assert.equal(verdict(call('git log --format=#%h -1'), world()), null);
});

test('round 2, finding 2: a PowerShell here-string message is text, not commands', () => {
  for (const c of [
    "git commit -m @'\nFix the guard's parser\nChecks: npm test\n'@",
    "git commit -m @'\ngit push origin main is refused\n'@",
    'git commit -m @"\nChecks: npx vitest run; npm run smoke:tracker\n"@',
    "git commit -m @'\n'@",
  ]) assert.equal(verdict(ps(c), world()), null, c);
  assert.ok(refused(verdict(ps("git commit -m @'\nmsg\n'@\nnpx vitest run"), world())), 'a real command after it still counts');
});

test('round 2, finding 3: the suggested command keeps its quotes', () => {
  const v = verdict(call('npx playwright test -g "drag the puck"'), world());
  assert.match(v.refuse, /-- npx playwright test -g 'drag the puck'/);   // single quotes since [PUSH-GUARD-LEFTOVERS] (2)
  const t = verdict(ps('Set-Location raptor-port; if ($?) { npx vitest run -t "crew rest" }'), world());
  assert.match(t.refuse, /-- npx vitest run -t 'crew rest'/); assert.doesNotMatch(t.refuse, /-- if/);
});

test('round 2, finding 4: commands inside $( … ) and backticks are read too', () => {
  for (const c of ['out=$(cd raptor-port && npx vitest run 2>&1 | tail -5); echo "$out"', 'echo "$(git push origin main 2>&1)"',
    'echo `git push origin main`']) assert.ok(refused(verdict(call(c), world())), c);
  assert.equal(verdict(call('echo "$(git rev-parse HEAD)"'), world()), null);
});

test('round 2, finding 5: PowerShell\'s *> redirect is a redirect', () => {
  assert.ok(refused(verdict(ps('npx vitest run *> out.log'), world())));
  assert.ok(refused(verdict(ps('npx vitest run *>&1 | Out-File x.log'), world())));
  assert.equal(verdict(ps('git push origin claude/job *> $null'), world()), null);
});

test('round 2, finding 6: PowerShell quoting is PowerShell\'s', () => {
  assert.ok(refused(verdict(ps('Get-ChildItem "C:\\temp\\" | Out-Null; npm test'), world())));
  assert.ok(refused(verdict(ps('Write-Output "a`"b"; npm test'), world())));
  assert.equal(verdict(ps('Write-Output "npm test; git push origin main"'), world()), null);
});

test('round 2, findings 7 and 8: npm exec, and ./src, are full runs', () => {
  for (const c of ['npm exec vitest run', 'npm exec -- vitest run', 'npx vitest run ./src', 'npx vitest run raptor-port/src'])
    assert.ok(refused(verdict(call(c), world())), c);
  assert.equal(verdict(call('npx vitest run ./src/engine/medical.test.ts'), world()), null);
});

test('round 2, finding 10: breaking a dead lock never removes a fresh one', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gl-')); const lock = join(dir, 'lock');
  const { breakLock } = await import('../../raptor-port/scripts/gatelock.mjs');
  mkdirSync(lock); writeFileSync(join(lock, 'owner.txt'), 'claude/fresh — unit\nholder-pid: 1');
  assert.equal(breakLock(lock, { owner: 'claude/dead — unit\nholder-pid: 2' }), false, 'not the lock that was judged');
  assert.equal(existsSync(join(lock, 'owner.txt')), true, 'the fresh lock is put back');
  assert.equal(breakLock(lock, { owner: 'claude/fresh — unit\nholder-pid: 1' }), true);
  assert.equal(existsSync(lock), false);
  rmSync(dir, { recursive: true, force: true });
});

// ---- the third read's findings of 17 Oct 26 ---------------------------------------------------------------------------
test('round 3, finding 1: a command that only names a test tool or the smoke script is not a run', () => {
  for (const c of [
    'git add raptor-port/scripts/tracker/smoke.mjs && git commit -m x', 'git diff raptor-port/scripts/tracker/smoke.mjs',
    "sed -n '1,40p' raptor-port/scripts/tracker/smoke.mjs", 'grep -rn "vitest" raptor-port/src', 'git grep -n playwright test',
    'git log --oneline -S vitest', 'which vitest', 'ls raptor-port/node_modules/.bin/vitest', 'echo npm test',
  ]) assert.equal(verdict(call(c), world()), null, c);
  for (const c of ['Get-Content raptor-port\\scripts\\tracker\\smoke.mjs', 'Get-Command vitest', "Select-String -Path package.json -Pattern 'vitest'"])
    assert.equal(verdict(ps(c), world()), null, c);
  // still runs, wherever the launcher words put the tool
  for (const c of ['timeout 600 npx vitest run', 'CI=1 npx vitest run', 'env CI=1 npm test', 'npx -y vitest run',
    'node scripts/tracker/smoke.mjs', 'node_modules/.bin/vitest run']) assert.ok(refused(verdict(call(c), world())), c);
  assert.ok(refused(verdict(ps('cd raptor-port; if ($?) { npx vitest run }'), world())));
});

test('round 3, finding 3: a comment inside $( … ) does not hide the command after it', () => {
  assert.ok(refused(verdict(call("out=$(\n  # it's slow\n  npx vitest run\n)"), world())));
});

test('round 3, finding 6: a heredoc named with a dash is text too', () => {
  assert.equal(verdict(call("git commit -m \"$(cat <<'EOF-MSG'\nChecks: npm test\nEOF-MSG\n)\""), world()), null);
});

test('round 3, finding 7: a computed target from main, --git-dir, and eval', () => {
  assert.ok(refused(verdict(call('git push origin $(git branch --show-current)'), world({ branch: 'main' }))));
  assert.equal(verdict(call('git push origin $(git branch --show-current)'), world({ sha: {} })), null, 'from a branch it is that branch');
  assert.ok(refused(verdict(call('git --git-dir .git push origin main'), world())));
  assert.ok(refused(verdict(call('git --work-tree . push origin main'), world())));
  assert.ok(refused(verdict(call("eval 'git push origin main'"), world())));
});

test('round 3, finding 8: a lock whose holder died while its checks still run is still held', async () => {
  const { holderGone } = await import('../../raptor-port/scripts/gatelock.mjs');
  const dead = spawnSync(process.execPath, ['-e', 'console.log(process.pid)'], { encoding: 'utf8' }).stdout.trim();
  assert.equal(holderGone({ owner: `a — b\nholder-pid: ${dead}\nchild-pid: ${process.pid}` }), false, 'its child still runs');
  assert.equal(holderGone({ owner: `a — b\nholder-pid: ${dead}\nchild-pid: ${dead}` }), true, 'both gone');
  assert.equal(holderGone({ owner: `a — b\nholder-pid: ${dead}` }), true);
  assert.equal(holderGone({ owner: 'a — b' }), false, 'a lock taken by hand is judged by its age only');
});

// ---- [PUSH-GUARD-LEFTOVERS], 17 Oct 26 --------------------------------------------------------------------------------
const pscall = (command) => ({ tool_name: 'PowerShell', cwd: '/repo', tool_input: { command } });

test('leftover 1: a quoted word that begins with > or < is a word, not a redirect', () => {
  // the suggested command keeps it, and a quoted ">" never ends a push's words
  const v = verdict(call('npx vitest run -t ">8h rest"'), world());
  assert.ok(refused(v)); assert.match(v.refuse, /-- npx vitest run -t '>8h rest'/);
  assert.ok(refused(verdict(call('git push origin ">x" main'), world())), 'the target after a quoted ">x" is still read');
  // an unquoted redirect still ends the words
  assert.equal(lockNeed(['npx', 'vitest', 'run', '>', 'out.log']), 'held');
  assert.equal(lockNeed(['npx', 'vitest', 'run', '>x.test.ts'], [false, false, false, true]), null, 'a quoted file name');
});

test("leftover 2: PowerShell's doubled quote is one quote, and the suggestion never lets $ expand", () => {
  const v = verdict(pscall("npx vitest run -t 'it''s $x'"), world());
  assert.ok(refused(v)); assert.match(v.refuse, /-- npx vitest run -t 'it''s \$x'/);
  const b = verdict(call("npx vitest run -t 'cost $5'"), world());
  assert.match(b.refuse, /-- npx vitest run -t 'cost \$5'/, 'bash: single quotes too');
  assert.ok(refused(verdict(pscall('git push origin "a""b" main'), world())), 'a doubled "" inside "…" does not hide the target');
});

test('leftover 3: pushes to main through a variable, xargs, or after a $\'…\' quote', () => {
  for (const c of ['B=main; git push origin $B', 'B=main && git push origin "${B}"', 'export B=main; git push origin HEAD:$B',
    'echo main | xargs git push origin', "echo $'it\\'s'; git push origin main"]) assert.ok(refused(verdict(call(c), world())), c);
  assert.ok(refused(verdict(pscall("$B = 'main'; git push origin $B"), world())), 'PowerShell variable');
  assert.ok(refused(verdict(pscall("$B='main'; git push origin $B"), world())), 'PowerShell variable, no spaces');
  for (const c of ['B=claude/job; git push origin $B', 'echo claude/job | xargs git push origin', "echo $'a\\'b' && git status"])
    assert.ok(!refused(verdict(call(c), world())), c);
});

test('leftover 4: breaking a lock looks before it moves it — a lock no longer the one judged is never touched', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gl-')); const lock = join(dir, 'lock');
  const { breakLock } = await import('../../raptor-port/scripts/gatelock.mjs');
  mkdirSync(lock); writeFileSync(join(lock, 'owner.txt'), 'claude/fresh — unit\nholder-pid: 1');
  const { readdirSync, statSync } = require_('node:fs');
  // a folder moved aside and back leaves the same names, but a newer time on the folder that holds them
  const before = statSync(dir).mtimeMs; await new Promise((r) => setTimeout(r, 50));
  assert.equal(breakLock(lock, { owner: 'claude/dead — unit\nholder-pid: 2' }), false);
  assert.deepEqual(readdirSync(dir), ['lock']);
  assert.equal(statSync(dir).mtimeMs, before, 'nothing was set aside, not even for an instant');
  rmSync(dir, { recursive: true, force: true });
});

// ---- the fix's own read, 17 Oct 26 ------------------------------------------------------------------------------------
test('fix read 1: a redirect whose file name alone is quoted is still a redirect — the run still needs the lock', () => {
  for (const c of ['npm test 2>"err.log"', 'npx vitest run >"out.log"', 'npx playwright test >"out.log"'])
    assert.ok(refused(verdict(call(c), world())), c);
  assert.ok(refused(verdict(pscall('npx vitest run *>"out.log"'), world())), 'PowerShell *>"…"');
  assert.equal(verdict(call('npx vitest run ">8h.test.ts"'), world()), null, 'a quoted word that starts with > is a file');
});

test('fix read 2: xargs reads only its own pipeline, through variables and xargs.exe too', () => {
  assert.ok(!refused(verdict(call('echo feat | xargs git push origin && gh pr create --body "main: uses xargs"'), world())), 'another step names main');
  for (const c of ['B=main; echo $B | xargs git push origin', 'echo main | xargs.exe git push origin', 'printf main | sort | xargs git push origin'])
    assert.ok(refused(verdict(call(c), world())), c);
});

test('fix read 3: PowerShell variable names ignore case', () => {
  assert.ok(refused(verdict(pscall("$b='main'; git push origin $B"), world())));
});

test('fix read 4: a lock whose owner.txt is not written yet is never set aside', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'gl-')); const lock = join(dir, 'lock');
  const { breakLock } = await import('../../raptor-port/scripts/gatelock.mjs');
  mkdirSync(lock);                                                     // made, its name not written yet
  const { statSync } = require_('node:fs');
  const before = statSync(dir).mtimeMs; await new Promise((r) => setTimeout(r, 50));
  assert.equal(breakLock(lock, { owner: 'claude/dead — unit\nholder-pid: 2' }), false);
  assert.equal(existsSync(lock), true);
  assert.equal(statSync(dir).mtimeMs, before, 'not set aside, even for an instant');
  assert.equal(breakLock(join(dir, 'gone'), { owner: 'x' }), false, 'no lock at all');
  rmSync(dir, { recursive: true, force: true });
});

test('fix read 5: a bash backslash-dollar inside "…" comes back without its backslash', () => {
  const cmd = 'npx vitest run --grep "it\'s \\$HOME"';
  assert.ok(cmd.includes('\\$'), 'the command holds a real backslash');
  const v = verdict(call(cmd), world());
  assert.ok(refused(v)); assert.match(v.refuse, /-- npx vitest run --grep 'it'\\''s \$HOME'/);
});

test('fix read round 2: a pipe split across a line break, and bash |&, still carry the target', () => {
  for (const c of ['echo main |' + String.fromCharCode(10) + '  xargs git push origin', 'echo main |& xargs git push origin'])
    assert.ok(refused(verdict(call(c), world())), JSON.stringify(c));
  assert.ok(!refused(verdict(call('echo feat |& xargs git push origin'), world())), 'a pipe naming no main');
});
