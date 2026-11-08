#!/usr/bin/env node
// PreToolUse hook — [SHELL-SCRIPT-GUARD] (his go, D811, 13 Oct 26). Refuses, on the Bash tool, the shell slips that
// eighteen skill notes logged and that a memory note never stopped (observations 246 to 694 — the backlog item names
// them): a script typed into the command line that edits a file and loses its backslashes on the way, an in-place `sed`
// that rewrites a tracked file's line endings, and a command left waiting on input that never comes.
//
// WHAT IT RESTS ON — measured on his PC, 8 Nov 26 (Claude Code's Bash tool, Git Bash 5.3.15, GNU sed 4.9, Python 3.14,
// Node 24; note 285: a guard built on an unmeasured claim refuses the wrong things):
//   M1  The Bash tool turns a typed `\\` into `\` BEFORE the shell sees it (`printf '%s' 'E:\\x'` printed `E:\x`, and the
//       command line the shell received already held one backslash). A single `\` before a letter arrives as typed, and
//       so do `\'` and `\"`. The Write tool keeps `\\` byte for byte (the same text written by it read back `\\`). The
//       PowerShell tool keeps `\\` too — so this guard reads Bash commands only.
//   M2  The Bash tool's shell input is an open pipe that never ends: a bare `cat > f` waited until killed (5 s) and left
//       `f` EMPTY; `node` reading its input waited the same; `cat < /dev/null` ended at once. NOT TRUE OF EVERY CHAT
//       (chat 27, 8 Nov 26, the same PC): there the shell's input was `/dev/null` itself — `cat > f` ended at once, `f`
//       still EMPTY, and Python still saw a keyboard (M3). Either way the command gets nothing, so refusal 3 stands;
//       its message names both.
//   M3  Python takes `/dev/null` for a keyboard here (`sys.stdin.isatty()` is True): `python - < /dev/null` opened its
//       interactive prompt, which loops on a console error until stopped (it hung a chat two minutes on 15 and 23 Oct
//       26, and this guard's own measuring once). `node - < /dev/null` ends at once. So "add `< /dev/null`" — the
//       advice of note 609 — is right for node and cat and WRONG for Python, and this guard never gives it for Python.
//   M4  A quoted here-document holding an apostrophe, even inside `$( … )` (a commit message), now works (bash 5.3): the
//       apostrophe failures of the notes are not met today, so an apostrophe alone is never refused.
//   M5  `sed -i` on a file with Windows line endings wrote every line back with plain ones (3 of 3).
//
// THE REFUSALS (each the narrowest that still catches the logged cases; note 626 — a false refusal of everyday work costs
// more than the gap it closes, so a commit or pull-request message from a here-document is always let through):
//   1. A script that WRITES A FILE and is typed into the command line — a here-document fed to `cat > f` / `tee f` or
//      to an interpreter, or an interpreter's inline `-e` / `-c` script — when it holds a backslash (M1: it may be a
//      `\\` already halved); for an unquoted here-document or an inline script, also a `$` or a backtick, which the
//      shell expands inside double quotes. "Writes a file": an output redirect to a file, `tee` with a file, or a
//      file-writing call in the script (writeFileSync, open(…, 'w'), write_text, …) — a script that only reads or prints
//      is let through. (The item said "a backslash followed by a letter or an apostrophe"; the notes show `\\.`, `\\[`
//      and `/\*/g` lost too, and M4 clears the apostrophe — the agent's reading, named to the readers.)
//   2. `sed -i` (and `perl -i`) on a file git tracks (M5) — "use the Edit tool". A file git does not track (the
//      scratchpad) is let through; files handed in by `xargs` cannot be checked, so that is refused.
//   3. A command that reads its input when none is given (M2): `cat` / `tee` with no file to read and nothing piped,
//      redirected or here-documented in; an interpreter reading its program from that input (`python -`, a bare
//      `node`); Python given `/dev/null` for its program (M3); and a here-document beside a `<` redirect on one command,
//      where the later input replaces the script (M3's hang began so).
//   Not refused (the item's last suggestion, "every script run from the shell gets `< /dev/null`"): it would refuse
//   every `node script.mjs`, and M3 shows it is the wrong cure for Python.
//
// HOW IT READS A COMMAND (note 626): here-document bodies are cut out first, by a reader that knows quotes, `$( … )`,
// backticks and comments, and each opener left as a marker word; then push-guard.mjs's shell reader (quotes, escapes,
// `$( … )`, comments, continued lines — read three times over by fresh readers, 17 Oct 26) splits the steps; `bash -c`,
// `eval` and a shell fed a here-document are read as the commands they run; launcher words (`timeout`, `env`, `nice`,
// `nohup`, `time`, `command`, `exec`, `xargs`) are stepped over; only the word in command position is judged.
//
// WIRING (note 270): settings.json runs it as `if …; then node …; else exit 0; fi`, never `test && run || exit 0`, which
// turns a refusal into "allowed". Exit 2 with the reason on stderr refuses; anything it cannot read is let through
// (exit 0) — a guard that breaks every command would be worse than the traps it guards. The PreToolUse event fires only
// for a tool call the agent makes, and refusing one breaks no recovery of the app's own (note 598); a retry of the same
// command is the same slip, refused again. Tests: `node --test .claude/hooks/script-guard.test.mjs`.
import { basename, dirname, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { parse } from './push-guard.mjs';

const MARK = (n) => `__HEREDOC_${n}__`;
const MARK_RE = /__HEREDOC_(\d+)__/g;
/** `<<` or `<<-`, then a delimiter: 'EOF', "EOF", \EOF or EOF (a name — so `1 << 2` is never an opener). */
const OPEN = /^<<(-?)[ \t]*(?:(['"])([A-Za-z_][\w.-]*)\2|(\\?)([A-Za-z_][\w.-]*))/;

/** Cut every here-document body out of a bash command line. Returns { text, docs }: `text` is the line with each body
 *  removed and each opener replaced by a marker word; `docs[n]` = { body, quoted }. The reader follows single and
 *  double quotes, $'…', $( … ) (where a body may sit — a commit message), backticks, comments and escapes, so an
 *  apostrophe in a body never opens a quote, and `<<` inside quotes is text. */
export function extractBodies(cmd) {
  const s = String(cmd); let out = ''; const docs = []; const pending = []; const st = [];
  const readBodies = (j) => {
    for (const d of pending) {
      const lines = [];
      while (j < s.length) {
        let e = s.indexOf('\n', j); if (e < 0) e = s.length;
        const line = s.slice(j, e).replace(/\r$/, ''); j = e + 1;
        if ((d.strip ? line.replace(/^\t+/, '') : line) === d.delim) break;
        lines.push(line);
      }
      d.body = lines.join('\n');
    }
    pending.length = 0;
    return j;
  };
  for (let i = 0; i < s.length; i++) {
    const c = s[i]; const k = st.length ? st[st.length - 1] : null;
    if (k === 'sq') { out += c; if (c === "'") st.pop(); continue; }
    if (k === 'ansi') { out += c; if (c === '\\' && i + 1 < s.length) out += s[++i]; else if (c === "'") st.pop(); continue; }
    if (c === '\n') { out += c; if (pending.length) i = readBodies(i + 1) - 1; continue; }
    if (c === '\\' && i + 1 < s.length) { out += c + s[i + 1]; i++; continue; }
    if (k === 'dq') {
      if (c === '"') st.pop();
      else if (c === '$' && s[i + 1] === '(') { out += '$('; i++; st.push('paren'); continue; }
      else if (c === '`') st.push('bt');
      out += c; continue;
    }
    if (k === 'bt' && c === '`') { st.pop(); out += c; continue; }
    if (k === 'paren' && c === ')') { st.pop(); out += c; continue; }
    // the top level, or inside $( … ) / backticks: quotes, substitutions, comments and here-document openers
    if (c === "'") { st.push('sq'); out += c; continue; }
    if (c === '$' && s[i + 1] === "'") { st.push('ansi'); out += "$'"; i++; continue; }
    if (c === '"') { st.push('dq'); out += c; continue; }
    if (c === '$' && s[i + 1] === '(') { st.push('paren'); out += '$('; i++; continue; }
    if (c === '(' && k === 'paren') { st.push('paren'); out += c; continue; }
    if (c === '`') { st.push('bt'); out += c; continue; }
    if (c === '#' && (i === 0 || /[\s;&|()]/.test(s[i - 1]))) {
      const nl = s.indexOf('\n', i); const e = nl < 0 ? s.length : nl; out += s.slice(i, e); i = e - 1; continue;
    }
    // a here-string `<<<` is one operator: its last two `<` are never a here-document opener (Astra's read, 8 Nov 26)
    if (c === '<' && s[i + 1] === '<' && s[i + 2] === '<') { out += '<<<'; i += 2; continue; }
    if (c === '<' && s[i + 1] === '<') {
      const m = OPEN.exec(s.slice(i));
      if (m) {
        const d = { strip: m[1] === '-', delim: m[3] || m[5], quoted: !!m[2] || m[4] === '\\', body: '' };
        out += ` <<${MARK(docs.length)} `; docs.push(d); pending.push(d); i += m[0].length - 1; continue;
      }
    }
    out += c;
  }
  return { text: out, docs };
}

// ---- reading one step ------------------------------------------------------------------------------------------------
const LAUNCH = /^(timeout|env|nice|nohup|time|command|exec|stdbuf|winpty|xargs)$/;
/** A launcher's options that take their value as the NEXT word (a value written on, `-n1` or `--max-args=1`, is one word). */
const LAUNCH_ARG = {
  env: { short: /^-[uCS]$/, long: ['--unset', '--chdir', '--split-string'] },
  timeout: { short: /^-[ks]$/, long: ['--kill-after', '--signal'] },
  nice: { short: /^-n$/, long: ['--adjustment'] },
  xargs: { short: /^-[nILPsdEa]$/, long: ['--max-args', '--max-lines', '--max-procs', '--max-chars', '--delimiter', '--eof', '--arg-file', '--replace'] },
  stdbuf: { short: /^-[ioe]$/, long: ['--input', '--output', '--error'] },
};
/** The shell's words that stand before a command in its place: the command after them is the one judged. */
const RESERVED = /^(if|then|else|elif|do|while|until|!|\{)$/;
const SHELLS = /^(bash|sh|zsh|dash)$/;
const INTERP = /^(node|nodejs|python|python2|python3|py|perl|ruby|deno|bun|tsx|ts-node)$/;
const PYTHON = /^(python|python2|python3|py)$/;
/** The operator at the head of an unquoted word: an output or input redirect, a here-string, or a here-document marker. */
const OP = /^(<<<|<<__HEREDOC_\d+__|\d*>>?\|?|&>>?|\d*<(?!<))/;
const NOT_A_FILE = /^(&\d*-?|\/dev\/(null|stdout|stderr|tty)|nul)$/i;
/** A call that writes or changes a file — JS, Python, Perl, Ruby. Writing to the screen (console.log, print,
 *  process.stdout.write) is not one. */
const WRITES = new RegExp([
  String.raw`\b(write|append)File(Sync)?\b`, String.raw`\bcreateWriteStream\b`, String.raw`\bcopyFile(Sync)?\b`,
  String.raw`\b(rename|unlink|truncate|rm|cp)Sync\b`, String.raw`\bfs(\.promises)?\.(rename|unlink|rm|cp|truncate)\s*\(`,
  String.raw`\bopen(Sync)?\s*\([^)]*?['"][rwxab+t]*[wax+][rwxab+t]*['"]`, String.raw`\.open\s*\(\s*['"][rwxab+t]*[wax+]`,
  String.raw`\bwrite_(text|bytes)\s*\(`, String.raw`\bshutil\.\w+\s*\(`, String.raw`\bos\.(replace|rename|remove|unlink)\s*\(`,
  String.raw`\bfileinput\b[\s\S]*\binplace\s*=\s*True`, String.raw`\bopen\s*\(?\s*(my\s+)?\$?\w*\s*,\s*['"]\+?>`,
  String.raw`\bFile\.(write|open|rename|delete)\b`, String.raw`\bDeno\.write(Text)?File\b`, String.raw`\bBun\.write\b`,
].join('|'));

/** Split unquoted words around redirect operators, as the shell does (`cat>f` is cat, >, f). */
function tokens(w, q) {
  const out = [];
  w.forEach((word, j) => {
    if (q[j]) { out.push({ t: word, q: true }); return; }
    let rest = word;
    while (rest) {
      const at = rest.search(/<<<|<<__HEREDOC_\d+__|\d*>>?\|?|&>>?|<(?!<)/);
      if (at < 0) { out.push({ t: rest, q: false }); break; }
      if (at > 0) {
        // a digit before > belongs to the operator only when it starts the word piece (2>&1, not abc2>f)
        out.push({ t: rest.slice(0, at), q: false });
      }
      const m = OP.exec(rest.slice(at));
      out.push({ t: m[0], q: false, op: true });
      rest = rest.slice(at + m[0].length);
    }
  });
  return out;
}

/** One step read: its command name, operands, options, output files, inputs and here-document numbers. */
function readStep(w, q, pipeIn) {
  const tk = tokens(w, q);
  const words = []; const outFiles = []; const inFiles = []; const docs = []; const strings = [];
  for (let j = 0; j < tk.length; j++) {
    const { t, op } = tk[j];
    if (!op) { words.push(tk[j]); continue; }
    const doc = /^<<__HEREDOC_(\d+)__$/.exec(t);
    if (doc) { docs.push(Number(doc[1])); continue; }
    const target = tk[j + 1] && !tk[j + 1].op ? tk[++j].t : '';
    if (t === '<<<') strings.push(target);
    else if (/^\d*<$/.test(t)) inFiles.push(target);
    else if (/^(1?>>?\|?|&>>?)$/.test(t) && target && !NOT_A_FILE.test(target)) outFiles.push(target);
  }
  // step over variable settings, the shell's reserved words and launcher words to the word in command position
  // (`if …; then python - <<…`, `for …; do cat > f; done`, `! cat > f` — the Opus read, 8 Nov 26)
  let ci = 0;
  for (;;) {
    const x = words[ci] && words[ci].t;
    if (x === undefined) break;
    if (/^[A-Za-z_]\w*=/.test(x) && !words[ci].q) { ci++; continue; }
    if (RESERVED.test(x) && !words[ci].q) { ci++; continue; }
    const name = basename(x).toLowerCase().replace(/\.(exe|cmd)$/, '');
    if (!LAUNCH.test(name)) break;
    if (name === 'command' && words[ci + 1] && /^-[vV]$/.test(words[ci + 1].t)) break;   // `command -v node` looks node up
    ci++;
    // the launcher's own options and values: `timeout -k 5 30`, `env -i A=1`, `env -u X`, `nice -n 5`, `xargs -0 -n 1`
    // — an option that takes a value consumes the next word too (`env -u X`: X is not the command — Astra's read)
    const takes = LAUNCH_ARG[name];
    while (words[ci] && (/^-/.test(words[ci].t) || (name === 'timeout' && /^\d+(\.\d+)?[smhd]?$/.test(words[ci].t))
      || (name === 'env' && /^[A-Za-z_]\w*=/.test(words[ci].t)))) {
      const o = words[ci].t;
      if (takes && (takes.short.test(o) || takes.long.includes(o))) ci++;
      ci++;
    }
  }
  const name = words[ci] ? basename(words[ci].t).toLowerCase().replace(/\.(exe|cmd)$/, '') : '';
  const viaXargs = words.slice(0, ci).some((x) => /^xargs(\.exe)?$/i.test(basename(x.t)));
  return { name, args: words.slice(ci + 1).map((x) => x.t), outFiles, inFiles, docs, strings, piped: !!pipeIn, viaXargs, pipeIn: pipeIn || '' };
}

/** An interpreter's inline script (-e, -c, --eval, -p, --print; perl's -e at the end of a cluster; `deno eval`), or null. */
function inlineScript(name, args) {
  for (let j = 0; j < args.length; j++) {
    const a = args[j];
    if (/^--(eval|print)=/.test(a)) return a.slice(a.indexOf('=') + 1);
    if (/^-(e|c|p|-eval|-print)$/.test(a) || (/^(perl|ruby)$/.test(name) && /^-[a-zA-Z]*[eE]$/.test(a))) return args[j + 1] ?? '';
    if (name === 'deno' && a === 'eval') return args[j + 1] ?? '';
    if (!/^-/.test(a)) return null;                      // the first operand is a script file: what follows is its own
  }
  return null;
}

/** Does an interpreter read its PROGRAM from its input? (`python -`, `python -u`, a bare `node`) */
function programFromInput(name, args) {
  for (let j = 0; j < args.length; j++) {
    const a = args[j];
    if (a === '-') return true;
    if (/^-(e|c|p|m|i|v|V|h|-version|-help|-eval|-print|-test|-check|-run)$|^--(eval|print|test)=/.test(a)) return false;
    if (/^(perl|ruby)$/.test(name) && /^-[a-zA-Z]*[eE]$/.test(a)) return false;
    if (name === 'deno' || name === 'bun' || name === 'tsx' || name === 'ts-node') return false;
    if (!/^-/.test(a)) return false;
  }
  return !/^(deno|bun|tsx|ts-node)$/.test(name);
}

/** sed's (or perl's) in-place flag, and the files it edits. */
function inPlace(name, args) {
  if (name === 'sed' || name === 'gsed') {
    let on = false; let script = false; const files = [];
    for (let j = 0; j < args.length; j++) {
      const a = args[j];
      if (a === '--') { files.push(...args.slice(j + 1)); break; }
      if (/^--in-place(=|$)/.test(a)) { on = true; continue; }
      if (/^--(expression|file)=/.test(a)) { script = true; continue; }
      if (/^--(expression|file)$/.test(a) || /^-[nErsuz]*[ef]$/.test(a)) { if (/i/.test(a.slice(1, -1))) on = true; script = true; j++; continue; }
      // the script written on to its flag, `-e's/a/b/'` or `-fscript.sed`: the next word is a file (Astra's read)
      if (/^-[nErsuz]*[ef]./.test(a)) { script = true; continue; }
      if (/^-l$/.test(a)) { j++; continue; }
      if (/^-[nErsuz]*i/.test(a)) { on = true; continue; }
      if (/^-/.test(a)) continue;
      if (!script) { script = true; continue; }
      files.push(a);
    }
    return on ? files : null;
  }
  if (name === 'perl' && args.some((a) => /^-[lnpaw0]*i/.test(a))) {     // -i, -pi, -ni, -lpi (not -Ilib, an include folder)
    const files = []; let skip = false;
    for (const a of args) {
      if (skip) { skip = false; continue; }
      if (/^-[a-zA-Z]*[eE]$/.test(a)) { skip = true; continue; }
      if (!/^-/.test(a)) files.push(a);
    }
    return files;
  }
  return null;
}

// ---- the rules ---------------------------------------------------------------------------------------------------------
const HEAD = 'SCRIPT GUARD ([SHELL-SCRIPT-GUARD], D811): refused.';
const FIX_WRITE = 'Write the file with the Write tool (a new file) or the Edit tool (a change or an addition), or write the script ' +
  'itself to a file with the Write tool and run that file — the file tools keep every character as typed.';
const SLASH = 'This shell halves a typed \\\\ before the command runs (measured 8 Nov 26), so the script may already have lost a ' +
  'backslash, and a regex, a "\\n" or a path in it is not what was meant.';
const EXPANDS = 'The shell expands $ and ` inside double quotes and in an unquoted here-document, so the script that runs is ' +
  'not the script typed.';

/** Git Bash writes `/c/Users/…`; node on Windows needs `C:/Users/…`. */
const nativePath = (p) => (process.platform === 'win32' ? String(p).replace(/^\/([a-zA-Z])(\/|$)/, '$1:/') : String(p));
const fwd = (p) => String(p).replace(/\\/g, '/');

/** The reason to refuse one step, or null. `here`: the folder it runs in (null when unknown). */
function judge(st, docs, here, deps, depth, raw) {
  const { name, args, outFiles, inFiles, strings } = st;
  // bodies this step reads: its own here-documents, and those the steps piped into it feed on their own input — read
  // as steps, so a here-document inside an earlier step's `$( … )` (a commit message) is not piped in (the Opus read)
  const own = st.docs.map((n) => docs[n]).filter(Boolean);
  const piped = st.piped
    ? parse(st.pipeIn.replace(/\s*\|\s*$/, ''), 'Bash').flatMap((p) => (p.w.length ? readStep(p.w, p.q, '').docs : [])).map((n) => docs[n]).filter(Boolean)
    : [];
  const fed = own.length + strings.length + inFiles.length > 0 || st.piped;
  const isInterp = INTERP.test(name);

  // a shell fed a script: read the script as commands
  if (SHELLS.test(name) && !args.some((a) => !/^-/.test(a)) && own.length && depth < 3) {
    for (const d of own) { const r = commandRefusal(d.body, here, deps, depth + 1); if (r) return r; }
    return null;
  }

  // (3) two inputs on one command: the later replaces the first — judged for the commands that run what they read only:
  // a `<` inside a quoted option (`git commit --author="Jo <jo@x>" -F - <<…`) can read as a redirect (the Opus read)
  if ((own.length || strings.length) && inFiles.length && (name === 'cat' || name === 'tee' || isInterp || SHELLS.test(name))) {
    return `${HEAD}\nThis command has a here-document AND a "<" redirect: the later input replaces the here-document, so the ` +
      `script never reaches ${name || 'the command'}${PYTHON.test(name) ? ' — and Python given /dev/null opens its prompt and loops (measured)' : ''}. ` +
      `Keep one input. ${FIX_WRITE}`;
  }

  // (2) an in-place stream edit of a tracked file
  const edits = inPlace(name, args);
  if (edits) {
    if (st.viaXargs && !edits.length) {
      return `${HEAD}\n"${name} -i" here edits files handed in by the pipe, which the guard cannot check — and ${name} -i rewrites ` +
        'every Windows line ending in a file it edits (measured 8 Nov 26), so a one-line change becomes a whole-file change. ' +
        'Use the Edit tool for each file.';
    }
    // a file named by a variable cannot be read here; a glob can (git reads it as a pattern); with the folder unknown, an
    // absolute path is still checked (the Opus read)
    const files = edits.filter((f) => !/[$`]/.test(f)).map(nativePath).filter((f) => here || isAbsolute(f));
    if (files.length && deps.tracked(files, here)) {
      return `${HEAD}\n"${name} -i" rewrites every Windows line ending in the file it edits (measured 8 Nov 26: 3 of 3 turned plain), ` +
        'so a one-line change to a tracked file becomes a whole-file change. Use the Edit tool.';
    }
  }

  // (3) input that never comes (`--help` and `--version` print and end — Astra's read)
  const readsInput = (((name === 'cat' || name === 'tee') && (name === 'tee' || !args.some((a) => !/^-/.test(a) || a === '-') || args.includes('-')))
    && !args.some((a) => a === '--help' || a === '--version'))
    || (isInterp && programFromInput(name, args));
  const fromNull = inFiles.some((f) => /^\/dev\/null$|^nul$/i.test(f));
  if (readsInput && PYTHON.test(name) && fromNull && !own.length) {
    return `${HEAD}\nPython reads its program from /dev/null here, which it takes for a keyboard (measured 8 Nov 26): it opens ` +
      'its interactive prompt and loops until stopped. Write the script to a file with the Write tool and run "python <file>".';
  }
  if (readsInput && !fed) {
    const what = isInterp ? `${name} reads its program from its input` : `${name} reads its input`;
    return `${HEAD}\n${what}, and none is given: this shell's input either never ends, so it waits until stopped, or is empty, so it gets nothing (both measured 8 Nov 26, in two chats)` +
      `${name === 'cat' && outFiles.length ? ' — and leaves the file it writes EMPTY' : ''}. ` +
      (isInterp ? 'Write the script to a file with the Write tool and run that file.' : `${FIX_WRITE} (Or give it its input: ${name} < /dev/null.)`);
  }

  // (1) a script typed into the command line that writes a file
  const inline = isInterp ? inlineScript(name, args) : null;
  const bodies = [...own, ...piped];
  const scripts = [...bodies.map((d) => ({ text: d.body, expands: !d.quoted })), ...strings.map((t) => ({ text: t, expands: false }))];
  // an inline script in single quotes is kept as typed by the shell — no $ or backtick expands (Astra's and the Opus
  // read); its backslashes are still halved by the tool (M1), so the backslash check below still holds for it
  if (inline !== null) scripts.push({ text: inline, expands: !(inline && String(raw || '').includes(`'${inline}'`)) });
  if (!scripts.length) return null;
  const writes = (name === 'cat' && outFiles.length > 0) || (name === 'tee' && (outFiles.length > 0 || args.some((a) => !/^-/.test(a))))
    || (isInterp && (outFiles.length > 0 || scripts.some((x) => WRITES.test(x.text)) || (name === 'perl' && inPlace(name, args))));
  if (!writes) return null;
  if (scripts.some((x) => x.text.includes('\\'))) return `${HEAD}\nA script typed into the command line writes a file and holds a backslash. ${SLASH} ${FIX_WRITE}`;
  if (scripts.some((x) => x.expands && /[`$]/.test(x.text))) return `${HEAD}\nA script typed into the command line writes a file and holds a $ or a backtick. ${EXPANDS} ${FIX_WRITE}`;
  return null;
}

/** The reason to refuse a whole command line, or null. */
function commandRefusal(cmd, cwd, deps, depth = 0) {
  const { text, docs } = extractBodies(cmd);
  let here = cwd;
  const visit = (t, d) => {
    for (const { w, q, sub, pipeIn } of parse(t, 'Bash')) {
      if (d < 3) for (const x of sub) { const r = visit(x, d + 1); if (r) return r; }
      if (!w.length) continue;
      const st = readStep(w, q, pipeIn);
      if (/^(cd|pushd|chdir)$/.test(st.name)) {
        // where the steps after it run; unknown (null) for `cd`, `cd -`, `~` or a variable — the tracked check then lets it be
        const to = st.args.find((a) => !/^-/.test(a));
        const known = to && to !== '-' && !/[$`~]/.test(to);
        if (!known) here = null;
        else if (isAbsolute(nativePath(to))) here = fwd(nativePath(to));
        else here = here ? fwd(resolve(here, to)) : null;
        continue;
      }
      if (st.name === 'popd') { here = null; continue; }
      if (st.name === 'eval' && depth + d < 3) { const r = commandRefusal(st.args.join(' '), here, deps, depth + d + 1); if (r) return r; continue; }
      if (SHELLS.test(st.name)) {
        const ci = st.args.findIndex((a) => /^-[a-z]*c$/.test(a));
        if (ci >= 0 && st.args[ci + 1] !== undefined && depth + d < 3) { const r = commandRefusal(st.args[ci + 1], here, deps, depth + d + 1); if (r) return r; continue; }
      }
      const r = judge(st, docs, here, deps, depth + d, text);
      if (r) return r;
    }
    return null;
  };
  return visit(text, 0);
}

/** The reason to refuse, or null to let the command run. `deps.tracked(files, cwd)` asks git (tests pass their own). */
export function refusal(input, deps = realDeps) {
  if (!input || input.tool_name !== 'Bash') return null;
  const cmd = input.tool_input && input.tool_input.command;
  if (typeof cmd !== 'string' || !cmd.trim()) return null;
  const cwd = fwd(nativePath(input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd()));
  try { return commandRefusal(cmd, cwd, deps); } catch { return null; }
}

export const realDeps = {
  /** Does git track any of these files? Asked one file at a time, in that file's own folder: over a list, git refuses the
   *  whole list when one path is outside the repo (exit 128), which hid a tracked file beside it (the Opus read, 8 Nov 26).
   *  A folder that does not exist (a glob in it) is asked from `cwd` with the path as written. false when git cannot say —
   *  the guard then lets the edit through. */
  tracked: (files, cwd) => files.some((f) => {
    try {
      const abs = isAbsolute(f) ? f : cwd ? resolve(cwd, f) : null;
      if (!abs) return false;
      const dir = dirname(abs);
      const [at, path] = existsSync(dir) ? [dir, basename(abs)] : cwd && existsSync(cwd) ? [cwd, f] : [null, null];
      if (!at) return false;
      const r = spawnSync('git', ['ls-files', '--', path], { cwd: at, encoding: 'utf8', timeout: 3000, windowsHide: true });
      return r.status === 0 && String(r.stdout || '').trim() !== '';
    } catch { return false; }
  }),
};

// Run as the hook only when this file is the one invoked (the test imports refusal() instead).
if (process.argv[1] && basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))) {
  let s = '';
  process.stdin.on('data', (d) => (s += d)).on('end', () => {
    let why = null;
    try { why = refusal(JSON.parse(s)); } catch { process.exit(0); }
    if (!why) process.exit(0);
    process.stderr.write(why + '\n');
    process.exit(2);
  });
}
