// Tests for script-guard.mjs ([SHELL-SCRIPT-GUARD], D811). Run: node --test .claude/hooks/script-guard.test.mjs
//
// The everyday commands come first (note 626: a false refusal of ordinary work costs more than the gap it closes), then
// each trap the guard refuses. Every command is written as the Bash tool hands it to the hook — AFTER the tool has
// turned a typed `\\` into `\` (measured 8 Nov 26, the guard's header) — so String.raw keeps each backslash as it arrives.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { refusal } from './script-guard.mjs';

const ROOT = 'C:/Users/User/projects/Raptor';
/* git is never asked in these tests: `tracked` answers from this list (paths as the guard resolves them) */
const TRACKED = new Set([`${ROOT}/raptor-port/src/x.ts`, `${ROOT}/OUTSTANDING.md`, `${ROOT}/raptor-port/src/ui/board.ts`]);
const asked = [];
const deps = {
  tracked: (files, cwd) => {
    asked.push({ files, cwd });
    return files.some((f) => TRACKED.has((/^[A-Za-z]:\//.test(f) ? f : `${cwd}/${f}`).replace(/\/\.\//g, '/')));
  },
};
const bash = (command, extra = {}) => ({ tool_name: 'Bash', cwd: ROOT, tool_input: { command, ...extra } });
const no = (c, why) => { const r = refusal(bash(c), deps); assert.ok(r, `should refuse:\n${c}`); if (why) assert.match(r, why, c); };
const ok = (c) => assert.equal(refusal(bash(c), deps), null, `should allow:\n${c}`);

// ---- the everyday commands: never refused ----------------------------------------------------------------------------
test('a commit or pull request whose message comes from a here-document is allowed, backslashes and all', () => {
  ok("git commit -m \"$(cat <<'EOF'\nThe guard: it's built; a \\b regex and C:\\Users named in the message\n\nCo-Authored-By: x\nEOF\n)\"");
  ok("gh pr create --title \"The checks\" --body \"$(cat <<'EOF'\n## Summary\n- it's done, `code` and \\d in it\nEOF\n)\"");
  ok("git commit -F - <<'EOF'\nmessage with a \\ and it's fine\nEOF");
  ok("git commit -q -m \"$(cat <<'EOF'\nline\nEOF\n)\" && git push");
});

test('the guard judges the command word, never a word that only names a trap', () => {
  for (const c of [
    "grep -n 'sed -i' OUTSTANDING.md",
    'rg "cat >" docs',
    'echo "node -e \\"x\\" > f"',
    "git log --oneline -S'python - <<'",
    'gh pr view 12 --json body -q .body | grep -c "cat >"',
  ]) ok(c);
});

test('ordinary script runs, reads and pipes are allowed', () => {
  for (const c of [
    'node raptor-port/scripts/docsize.mjs',
    'node --test .claude/hooks/script-guard.test.mjs',
    'cd raptor-port && npx vitest run src/ui/boardnav.test.tsx 2>&1 | tail -20',
    'cat -A file.txt',
    'cat "$f" | head -5',
    'cat a.txt b.txt > both.txt',
    'echo hi | cat',
    'printf x | tee out.txt',
    'timeout 5 cat < /dev/null',
    'python script.py < /dev/null',
    'node --version',
    'python -m pytest -q',
    'echo x | python -',
    "cat <<'EOF' | python -\nprint('no backslash here')\nEOF",
    "python - <<'PY'\nprint('reads only, it\\'s fine')\nPY",
    String.raw`node -e "console.log(require('fs').readFileSync(process.argv[1],'utf8').split('\n').length)" f.txt`,
    String.raw`python -c "print('a\tb')"`,
    "sed -n '1,5p' raptor-port/src/x.ts",
    "sed 's/a/b/' raptor-port/src/x.ts > out.txt",
  ]) ok(c);
});

test('a file written by a here-document or an inline script WITHOUT a backslash is allowed', () => {
  ok("cat > notes.txt <<'EOF'\nplain words, and it's fine\nEOF");
  ok("cat <<'EOF' > notes.txt\nplain\nEOF");
  ok(`node -e "require('fs').writeFileSync('a.txt', 'plain')"`);
  ok("python - <<'PY'\nopen('a.txt', 'w').write('plain')\nPY");
});

test('the PowerShell tool is not read: it keeps a typed backslash as typed (measured)', () => {
  assert.equal(refusal({ tool_name: 'PowerShell', cwd: ROOT, tool_input: { command: "cat > x" } }, deps), null);
  assert.equal(refusal({ tool_name: 'PowerShell', cwd: ROOT, tool_input: { command: String.raw`node -e "require('fs').writeFileSync('x','\n')"` } }, deps), null);
});

test('an in-place edit of a file git does not track is allowed — a scratch file', () => {
  ok("sed -i 's/a/b/' C:/Users/User/AppData/Local/Temp/claude/x/scratchpad/t.txt");
  ok("sed -i 's/a/b/' new-untracked.txt");
});

test('anything unreadable is let through', () => {
  assert.equal(refusal(null, deps), null);
  assert.equal(refusal({}, deps), null);
  assert.equal(refusal({ tool_name: 'Bash', tool_input: {} }, deps), null);
  assert.equal(refusal({ tool_name: 'Bash', tool_input: { command: 42 } }, deps), null);
  ok("cat <<'EOF\nunclosed quote in the opener");
});

// ---- (1) a script that writes a file and holds a backslash -------------------------------------------------------------
test('refuses a here-document that writes a file and holds a backslash', () => {
  const why = /Write tool|Edit tool/;
  no("cat > src/x.ts <<'EOF'\nconst re = /\\d+/;\nEOF", why);
  no("cat >> log.md <<'EOF'\nthe path C:\\Users\\User\nEOF", why);
  no("cat <<'EOF' >notes.js\nconst s = 'a\\nb';\nEOF", why);
  no("tee out.js <<'EOF' >/dev/null\nconst s = 'a\\nb';\nEOF", why);
  no("cat>f.ts<<'EOF'\nx = /\\./;\nEOF", why);
});

test('refuses an UNQUOTED here-document that writes a file and holds a $ or a backtick — the shell expands them', () => {
  no('cat > f.js <<EOF\nconst a = `${b}`;\nEOF', /expands/);
  no('cat > f.sh <<EOF\necho $HOME\nEOF', /expands/);
  ok("cat > f.sh <<'EOF'\necho $HOME\nEOF");   // quoted: the shell leaves the body alone
});

test('refuses a script fed to an interpreter by a here-document when it writes a file and holds a backslash', () => {
  no("python - <<'PY'\np = 'x.ts'\ns = open(p).read().replace('a\\b', 'c')\nopen(p, 'w', newline='').write(s)\nPY");
  no("node - <<'EOF'\nconst fs = require('fs'); fs.writeFileSync('x', 'a\\nb');\nEOF");
  no("node <<'EOF'\nrequire('fs').appendFileSync('x', '\\n');\nEOF");
  no("cat <<'EOF' | python -\nimport pathlib\npathlib.Path('x').write_text('a\\n')\nEOF");
  no("py -3 - <<'PY'\nimport shutil\nshutil.copy('a', 'b\\c')\nPY");
});

test('refuses an inline -e / -c script that writes a file and holds a backslash, a backtick or a $', () => {
  no(String.raw`node -e "require('fs').writeFileSync('x.ts', 'a\nb')"`);
  no(String.raw`node --eval "require('fs').writeFileSync(process.argv[1], 'a\r\nb')" f.txt`);
  no(String.raw`python -c "open('x', 'w').write('\b')"`);
  no(String.raw`python3 -c "import pathlib; pathlib.Path('x').write_text('a\n')"`);
  no('node -e "fs.writeFileSync(p, \\`v=${x}\\`)"');
  no(String.raw`node -e "process.stdout.write('a\nb')" > out.ts`);           // the redirect writes the file
  no(String.raw`ruby -e "File.write('x', 'a\n')"`);
});

test('reads every place a command can hide: $( … ), a sub-shell, bash -c, eval, a launcher word', () => {
  no(String.raw`out=$(node -e "require('fs').writeFileSync('y', 'a\nb')")`);
  no("( cd raptor-port && python - <<'PY'\nopen('x', 'w').write('\\n')\nPY\n)");
  no(String.raw`bash -c "python -c \"open('x','w').write('\\t')\""`);
  no(String.raw`timeout 30 node -e "require('fs').writeFileSync('x', '\n')"`);
  no("bash <<'EOF'\ncat > f.ts <<'IN'\nx = /\\d/\nIN\nEOF");
});

// ---- (2) an in-place stream edit of a tracked file ---------------------------------------------------------------------
test('refuses sed -i (and perl -i) on a file git tracks — it rewrites every line ending', () => {
  const why = /Edit tool/;
  no("sed -i 's/a/b/' raptor-port/src/x.ts", why);
  no("sed -i.bak -e 's/a/b/' raptor-port/src/x.ts", why);
  no("sed -Ei 's/a+/b/' OUTSTANDING.md", why);
  no("sed --in-place 's/a/b/' OUTSTANDING.md", why);
  no("sed -n -i '1,5p' OUTSTANDING.md", why);
  no("cd raptor-port && sed -i 's/a/b/' src/ui/board.ts", why);
  no("perl -pi -e 's/a/b/' OUTSTANDING.md", why);
  no("grep -l x src | xargs sed -i 's/a/b/'", /pipe/);
});

test('the tracked check is asked in the folder the command has moved to', () => {
  asked.length = 0;
  refusal(bash("cd raptor-port && sed -i 's/a/b/' src/ui/board.ts"), deps);
  assert.deepEqual(asked.at(-1), { files: ['src/ui/board.ts'], cwd: `${ROOT}/raptor-port` });
});

// ---- (3) a command that waits on input that never comes ----------------------------------------------------------------
test('refuses a command that reads its input when none is given — it waits for ever, and an interrupted cat empties its file', () => {
  const why = /input/;
  no('cat > "$TMP/x"', why);
  no('cat > /tmp/x 2>/dev/null; mkdir y', why);
  no('cat >> notes.txt', why);
  no('x=$(cat)', why);
  no('tee out.txt', why);
  no('cat -n', why);
});

test('refuses an interpreter that reads its program from an input that never comes', () => {
  for (const c of ['python -', 'python', 'node', 'node -', 'py -3 -', 'python3 -u']) no(c, /input/);
});

test('refuses Python told to read its program from /dev/null — it opens its prompt and loops (measured)', () => {
  no('python - < /dev/null', /prompt/);
  no('timeout 5 python3 < /dev/null', /prompt/);
  ok('node - < /dev/null');          // node ends at once (measured)
});

test('refuses a here-document and a < redirect on one command — the later input replaces the script', () => {
  no("python - <<'PY' < /dev/null\nprint(1)\nPY", /replaces/);
  no("cat <<'EOF' < other.txt\nx\nEOF", /replaces/);
});

test('the same rules hold for a command sent to the background', () => {
  assert.ok(refusal(bash('cat > f.txt', { run_in_background: true }), deps));
  assert.equal(refusal(bash('cd raptor-port && npm test', { run_in_background: true }), deps), null);
});

// ---- as the hook --------------------------------------------------------------------------------------------------------
test('as a hook: exit 2 with the reason to refuse, exit 0 to allow, exit 0 on garbage', () => {
  const hook = fileURLToPath(new URL('./script-guard.mjs', import.meta.url));
  const run = (stdin) => spawnSync(process.execPath, [hook], { input: stdin, encoding: 'utf8' });
  const refused = run(JSON.stringify(bash("cat > f.ts <<'EOF'\nx = /\\d/\nEOF")));
  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /SCRIPT GUARD/);
  assert.equal(run(JSON.stringify(bash('git status --short'))).status, 0);
  assert.equal(run('not json').status, 0);
});
