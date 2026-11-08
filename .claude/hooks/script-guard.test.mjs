// Tests for script-guard.mjs ([SHELL-SCRIPT-GUARD], D811). Run: node --test .claude/hooks/script-guard.test.mjs
//
// The everyday commands come first (note 626: a false refusal of ordinary work costs more than the gap it closes), then
// each trap the guard refuses. Every command is written as the Bash tool hands it to the hook — AFTER the tool has
// turned a typed `\\` into `\` (measured 8 Nov 26, the guard's header) — so String.raw keeps each backslash as it arrives.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { refusal, realDeps } from './script-guard.mjs';

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

// ---- the two blind reads of 8 Nov 26 (chat 27): Astra's and a fresh Opus reader's findings, each pinned ----------------
test('reads: never refused — here-strings, --help, single-quoted inline scripts, messages with a quoted < or a tee', () => {
  ok('cat <<< hello');                                                                  // Astra 3
  ok('git commit -m "$(cat <<< fix)"');
  ok("tee out.txt <<< 'plain'");
  ok('cat --help');                                                                     // Astra 5
  ok('tee --version');
  ok(`python -c 'open("x","w").write("$y")'`);                                          // Astra 4, Opus 6
  ok("node -e 'require(\"fs\").writeFileSync(\"x\", `${1}`)'");
  ok("git commit --author=\"Jo Bloggs <jo@example.com>\" -F - <<'EOF'\nmessage\nEOF");   // Opus 1A
  ok("gh pr create --title=\"a <b> c\" --body-file - <<'EOF'\nbody\nEOF");
  ok("git commit -q -m \"$(cat <<'EOF'\nFix the \\d regex\nEOF\n)\" 2>&1 | tee commit.log");   // Opus 1B
  ok("gh pr create --title \"x\" --body \"$(cat <<'EOF'\na \\n here\nEOF\n)\" | tee pr-url.txt");
});

test('reads: still refused — a single-quoted inline script that writes a file and holds a backslash', () => {
  no(String.raw`node -e 'require("fs").writeFileSync("x", "a\nb")'`, /backslash/);
});

test('reads: refused — sed with an attached -e or -f, launcher options with values, a reserved word first', () => {
  no("sed -i -e's/a/b/' OUTSTANDING.md", /Edit tool/);                                  // Astra 1
  no('sed -i -fscript.sed OUTSTANDING.md', /Edit tool/);
  no("env -u X sed -i 's/a/b/' OUTSTANDING.md", /Edit tool/);                           // Astra 2
  no("printf 'OUTSTANDING.md' | xargs -n 1 sed -i 's/a/b/'", /pipe/);
  no('env -u NODE_OPTIONS node', /input/);
  no('timeout -k 5 30 cat > f.txt', /input/);
  no("if [ -d raptor-port ]; then python - <<'PY'\np = 'x'\nopen(p, 'w', newline='').write('a\\b')\nPY\nfi");   // Opus 4
  no('for f in *.md; do cat > "$f.bak"; done', /input/);
  no('! cat > f.txt', /input/);
  no('while true; do node; done', /input/);
});

test('reads: sed -i asks git about each file in its own folder, a path outside the repo never hiding one inside', () => {
  // Opus 5: git ls-files over a list exits 128 when one path is outside the repo — the tracked one was missed
  const repo = fileURLToPath(new URL('../..', import.meta.url)).replace(/\\/g, '/').replace(/\/$/, '');
  assert.equal(realDeps.tracked(['OUTSTANDING.md', 'C:/Windows/not-in-the-repo.txt'], repo), true);
  assert.equal(realDeps.tracked([`${repo}/OUTSTANDING.md`], 'C:/Windows'), true);
  assert.equal(realDeps.tracked([`${repo}/OUTSTANDING.md`], null), true);
  assert.equal(realDeps.tracked(['C:/Windows/not-in-the-repo.txt', 'no-such-file.txt'], repo), false);
  // an absolute repo path is checked even when the folder the command runs in is unknown
  no(`cd "$TMP" && sed -i 's/a/b/' ${ROOT}/OUTSTANDING.md`, /Edit tool/);
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
