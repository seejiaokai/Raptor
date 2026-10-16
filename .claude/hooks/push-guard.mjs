#!/usr/bin/env node
// PreToolUse hook — [PUSH-LOCK-GUARD] (his "As recommended for all", D976, 17 Oct 26). Two refusals, on the Bash and
// PowerShell tools, for two rules that kept being broken by hand:
//
//  1. THE PUSH. A `git push` that would land on `main` is refused — main changes only on his "merge live", through the
//     pull request (D60). On 17 Oct 26 six pushes reached main by a slip: the branch tracked `origin/main` and git's
//     `push.default` here is `upstream`, so a bare `git push` went there (D974). So the guard works out where a push
//     really goes — an explicit target, or for a bare push the branch's upstream under that setting — not only what it
//     says. A push is also refused while a check run of the branch's last pushed commit is queued or running: any push
//     restarts the whole run and cancels the one in progress (D151, [RUN-CHECK-BOTH-RUNS]). When GitHub cannot be
//     asked (no `gh`, offline, slow), the push goes through with a note — the guard must never be what stops work.
//  2. THE PC LOCK. A full check run — the whole unit suite, a browser-test run of more than one file, the Tracker
//     smoke — is refused unless this chat holds the PC-wide lock; anything else that builds (a one-file browser test,
//     a build, the probes, perf) is refused only while ANOTHER chat holds it (D228, `.claude/rules/shipping.md`
//     §The checks). The refusal names the one command that takes the lock, runs, and always releases it:
//     `node raptor-port/scripts/gatelock.mjs exec "<branch> — <what>" -- <command>`. A command that goes through
//     gatelock.mjs is always let through.
//
// The command line is read the way a shell reads it — quotes, `$( … )`, heredoc bodies and continued lines — because
// a commit message or a pull request's text routinely NAMES a check or a push without running one (the fresh read's
// finding 1, 17 Oct 26). Like bg-cwd-guard.mjs, anything it cannot read is let through (exit 0) — a guard that breaks
// every command would be worse than the traps it guards. Its tests: `node --test .claude/hooks/push-guard.test.mjs`.
import { basename, resolve, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';

const STALE_MS = 2 * 60 * 60 * 1000; // the lock script's own: a lock older than this is broken by the next `take`
const MAIN = /^(main|master)$/;

/** Git Bash writes `/c/Users/…`; node on Windows needs `C:/Users/…`. */
const nativePath = (p) => (process.platform === 'win32' ? String(p).replace(/^\/([a-zA-Z])(\/|$)/, '$1:/') : String(p));

// ---- reading the command line --------------------------------------------------------------------------------------
/** Drop text that is never run — heredoc bodies (bash) and here-strings (PowerShell) — then join continued lines: a
 *  `\` line end in bash, a backtick line end in PowerShell. Bodies go first, so a line inside one is never joined. */
function prepare(cmd, ps) {
  let s = String(cmd).replace(/<<-?\s*(['"]?)([^\s'"<>|&;()]+)\1[^\n]*\n[\s\S]*?\n[ \t]*\2[ \t]*(?=\r?\n|$)/g, (m) => m.slice(0, m.indexOf('\n')));
  if (ps) s = s.replace(/@(['"])[ \t]*\r?\n(?:[\s\S]*?\r?\n)?\1@/g, "''").replace(/`\r?\n/g, ' ');
  else s = s.replace(/\\\r?\n/g, ' ');
  return s;
}

/** A command line read as its shell reads it. Returns { steps: [{ w: words, sub: [texts run inside it] }] }:
 *  `&&`, `||`, `&`, `|`, `;` and new lines separate steps only OUTSIDE quotes and `$( … )`; quotes are removed from a
 *  top-level word; `(`, `)`, `{`, `}` that group steps are dropped; a `#` comment (and PowerShell's `<# … #>`) is skipped;
 *  the escape is `\` in bash and the backtick in PowerShell; the text inside `$( … )` (and bash's backticks) is kept as a
 *  command of its own to be read too — `out=$(npx vitest run)` runs the suite. */
export function parse(cmd, tool) {
  const ps = /powershell/i.test(tool || ''); const s = prepare(cmd, ps);
  const steps = []; const st = []; let words = []; let word = ''; let has = false; let subs = [];
  const endWord = () => { if (word || has) words.push(word); word = ''; has = false; };
  const endStep = () => {
    endWord(); const w = words.filter((x) => x !== '{' && x !== '}');
    if (w.length || subs.length) steps.push({ w, sub: subs });
    words = []; subs = [];
  };
  const recorded = () => st.some((e) => e.start >= 0);
  const open = (k, start) => st.push({ k, start: recorded() ? -1 : start });   // only the outermost is read on its own
  const close = (i) => { const e = st.pop(); if (e.start >= 0) subs.push(s.slice(e.start, i)); };
  for (let i = 0; i < s.length; i++) {
    const c = s[i]; const k = st.length ? st[st.length - 1].k : null;
    if (k === 'sq') { if (c === "'") { st.pop(); if (st.length) word += c; } else word += c; continue; }
    if (!ps && c === '\\' && /["'\\$`]/.test(s[i + 1] || '')) { word += (st.length ? c : '') + s[i + 1]; i++; continue; }
    if (ps && c === '`' && i + 1 < s.length) { word += (st.length ? c : '') + s[i + 1]; i++; continue; }
    if (k === 'bt') { if (c === '`') close(i); word += c; continue; }
    if (k === 'dq') {
      if (c === '"') { st.pop(); if (st.length) word += c; }
      else if (c === '$' && s[i + 1] === '(') { word += '$('; i++; open('paren', i + 1); }
      else if (!ps && c === '`') { word += c; open('bt', i + 1); }
      else word += c;
      continue;
    }
    if (k === 'paren') {
      // a comment inside $( … ) — its apostrophe must not open a quote that hides the closing bracket
      if (c === '#' && /[\s(]/.test(s[i - 1] || ' ')) { const nl = s.indexOf('\n', i); const end = nl < 0 ? s.length : nl; word += s.slice(i, end); i = end - 1; continue; }
      if (c === ')') { word += c; close(i); }
      else if (c === '$' && s[i + 1] === '(') { word += '$('; i++; open('paren', i + 1); }
      else if (c === '(') { word += c; st.push({ k: 'paren', start: -1 }); }
      else if (c === '"') { word += c; st.push({ k: 'dq', start: -1 }); }
      else if (c === "'") { word += c; st.push({ k: 'sq', start: -1 }); }
      else if (!ps && c === '`') { word += c; open('bt', i + 1); }
      else word += c;
      continue;
    }
    // the top level
    if (c === '#' && word === '' && !has) { const nl = s.indexOf('\n', i); i = nl < 0 ? s.length : nl - 1; continue; }
    if (ps && c === '<' && s[i + 1] === '#') { const e = s.indexOf('#>', i + 2); i = e < 0 ? s.length : e + 1; continue; }
    if (c === "'") { st.push({ k: 'sq', start: -1 }); has = true; continue; }
    if (c === '"') { st.push({ k: 'dq', start: -1 }); has = true; continue; }
    if (c === '$' && s[i + 1] === '(') { word += '$('; i++; open('paren', i + 1); continue; }
    if (!ps && c === '`') { word += c; open('bt', i + 1); continue; }
    if (c === '\n' || c === '\r' || c === ';') { endStep(); continue; }
    if (c === '&' || c === '|') {
      if (c === '&' && (s[i - 1] === '>' || s[i + 1] === '>')) { word += c; continue; } // 2>&1, &>file, *>&1
      if (s[i + 1] === c) i++;
      endStep(); continue;
    }
    if (c === '(' || c === ')') { endWord(); continue; }
    if (/\s/.test(c)) { endWord(); continue; }
    word += c;
  }
  endStep();
  return steps;
}

const MOVE = /^(cd|pushd|push-location|chdir|set-location|sl)$/i;
const SHELL = /^(bash|sh|zsh|pwsh|powershell|cmd)(\.exe)?$/i;
const REDIRECT = /^(\d?>>?|\*>>?|&>|<)/;                                   // 2>, >>, *> (PowerShell), &>, <
const isGit = (w) => /^git(\.exe)?$/i.test(basename(w || ''));
/** A word written back for a shell: quoted when it holds a space or a shell character. */
const quoteWord = (x) => (/^[\w@%+=:,./\\-]+$/.test(x) ? x : `"${x.replace(/"/g, '\\"')}"`);

/** Every step with the folder it runs in; a `cd` (or Set-Location) moves the folder for the steps after it. A step
 *  that starts another shell with a command (`bash -c "…"`, `powershell -Command "…"`) is read as that command, and the
 *  text run inside `$( … )` is read as a command of its own. */
function steps(cmd, cwd, tool, depth = 0) {
  const out = []; let here = cwd;
  for (const { w, sub } of parse(cmd, tool)) {
    if (depth < 3) for (const t of sub) out.push(...steps(t, here, tool, depth + 1));
    if (!w.length) continue;
    if (MOVE.test(w[0])) {
      const target = w.slice(1).find((x) => !/^-/.test(x));
      if (target && here) here = isAbsolute(nativePath(target)) ? nativePath(target) : resolve(here, target);
      else if (target) here = nativePath(target);
      continue;
    }
    if (w[0] === 'eval' && w.length > 1 && depth < 3) { out.push(...steps(w.slice(1).join(' '), here, tool, depth + 1)); continue; }
    const si = w.findIndex((x) => SHELL.test(basename(x)));
    const ci = si >= 0 ? w.findIndex((x, j) => j > si && /^(-c|-lc|-ic|-command|\/c)$/i.test(x)) : -1;
    if (ci > 0 && w[ci + 1] && depth < 3) {
      out.push(...steps(w.slice(ci + 1).join(' '), here, /^(pwsh|powershell)/i.test(basename(w[si])) ? 'PowerShell' : 'Bash', depth + 1));
      continue;
    }
    out.push({ w, seg: w.join(' '), cwd: here });
  }
  return out;
}

// ---- the push --------------------------------------------------------------------------------------------------------
/** A push in a step: { cwd, remote, refspecs, flags, cfg } — or null when the step is not a push. */
function pushOf(step) {
  const w = step.w; const gi = w.findIndex(isGit);
  if (gi < 0) return null;
  let i = gi + 1; let cwd = step.cwd; const cfg = {};
  while (i < w.length && w[i].startsWith('-')) {
    if (w[i] === '-C') { cwd = cwd ? resolve(cwd, nativePath(w[i + 1] || '')) : nativePath(w[i + 1] || ''); i += 2; }
    else if (/^--(git-dir|work-tree|namespace|exec-path|super-prefix)$/.test(w[i])) i += 2;   // options whose value is a word of its own
    else if (w[i] === '-c') { const kv = w[i + 1] || ''; const e = kv.indexOf('='); if (e > 0) cfg[kv.slice(0, e).toLowerCase()] = kv.slice(e + 1); i += 2; }
    else i += 1;
  }
  if (w[i] !== 'push') return null;
  const flags = []; const pos = [];
  for (let j = i + 1; j < w.length; j++) {
    const a = w[j];
    if (REDIRECT.test(a)) break;                                            // a redirect ends the push's words
    if (/^(-o|--push-option|--repo|--receive-pack|--exec)$/.test(a)) { flags.push(a); j++; continue; }
    if (a.startsWith('-')) { flags.push(a); continue; }
    pos.push(a);
  }
  return { cwd, remote: pos[0] || null, refspecs: pos.slice(1), flags, cfg, seg: step.seg };
}

/** Where a push lands: { dsts: [branch names] } or { refuse: reason }. `deps` reads git (tests pass their own). */
function destinations(p, deps) {
  const has = (re) => p.flags.some((f) => re.test(f));
  if (has(/^--(all|mirror|branches)$/)) return { refuse: `"git push ${p.flags.join(' ')}" pushes every branch, main among them` };
  // a target written by another command ($(…):main) cannot be read here, but the text after its colon can
  if (/:(refs\/)?(heads\/)?(main|master)(?=["'\s)`]|$)/.test(p.seg)) return { refuse: 'the push names main as its target' };
  const cur = deps.branch(p.cwd);
  const config = (k) => (k.toLowerCase() in p.cfg ? p.cfg[k.toLowerCase()] : deps.config(p.cwd, k));
  const dsts = [];
  if (p.refspecs.length) {
    // a target another command computes ($(git branch --show-current), $B) cannot be read here: from main, it is main
    if (cur && MAIN.test(cur) && p.refspecs.some((r) => /[$`]/.test(r))) return { refuse: `the push's target is computed while this checkout is on ${cur}` };
    for (let r of p.refspecs) {
      r = r.replace(/^\+/, '');
      if (r === ':' || r.includes('*')) return { refuse: `the push "${r}" sends every matching branch, main among them` };
      let dst = r.includes(':') ? r.slice(r.indexOf(':') + 1) : r;
      if (dst === 'HEAD' || dst === '@') dst = cur || '';
      dst = dst.replace(/^(refs\/)?heads\//, '');
      if (!dst) continue;
      if (MAIN.test(dst)) return { refuse: `the push names "${r}", which lands on ${dst}` };
      if (!/^refs\//.test(dst)) dsts.push(dst);
    }
    return { dsts };
  }
  // a bare push (or one naming only the remote): where git itself would send it
  if (!cur) return { dsts: [] };                                            // not on a branch: git refuses by itself
  if (MAIN.test(cur)) return { refuse: `this checkout is on ${cur}, so a plain push lands on it` };
  const mode = (config('push.default') || 'simple').toLowerCase();
  if (mode === 'upstream' || mode === 'tracking') {
    const merge = (config(`branch.${cur}.merge`) || '').replace(/^refs\/heads\//, '');
    if (MAIN.test(merge)) return { refuse: `the branch ${cur} tracks ${merge} and git's push setting here is "${mode}", so a plain push lands on ${merge} (the 17 Oct 26 slip, D974). Point it at its own branch first: git branch -u origin/${cur}` };
    return { dsts: merge ? [merge] : [] };
  }
  if (mode === 'matching') return { refuse: 'git\'s push setting is "matching", which can push main too — name the branch: git push origin HEAD:refs/heads/' + cur };
  return { dsts: [cur] };
}

/** The reason to refuse a push, a note to pass on, or null. */
function pushVerdict(p, deps) {
  if (p.flags.some((f) => f === '--dry-run' || f === '-n')) return null;
  const d = destinations(p, deps);
  if (d.refuse) return { refuse: [
    'PUSH GUARD ([PUSH-LOCK-GUARD], D976): refused — this push would land on main.',
    `Why: ${d.refuse}.`,
    'Main changes only on his "merge live", through the pull request (D60). Push the branch by name instead:',
    '  git push origin HEAD:refs/heads/<this branch>',
  ].join('\n') };
  const remote = p.remote && !/[:/]/.test(p.remote) ? p.remote : 'origin';
  for (const dst of d.dsts) {
    const sha = deps.remoteSha(p.cwd, remote, dst);
    if (!sha) continue;                                                      // a branch not yet on GitHub has no runs
    const runs = deps.runs(p.cwd, dst);
    if (!runs) return { note: `Push guard: could not ask GitHub whether checks are running on ${dst} — pushed without that check. Look before the next push: gh run list --branch ${dst} --limit 6` };
    const busy = runs.filter((r) => r.headSha === sha && r.status !== 'completed');
    if (busy.length) return { refuse: [
      `PUSH GUARD ([PUSH-LOCK-GUARD], D976): refused — checks are running on ${dst}.`,
      `Running for its last pushed commit: ${busy.map((r) => `${r.workflowName || 'a run'} (${r.status})`).join(', ')}.`,
      'A push now restarts the whole run and cancels the one in progress (D151). Commit locally and push once',
      `they have finished: gh run list --branch ${dst} --limit 6 --json status,workflowName,headSha`,
    ].join('\n') };
  }
  return null;
}

// ---- the PC lock -----------------------------------------------------------------------------------------------------
// options that take a value (so the value is not a test file), for npm, vitest and playwright
const VALUED = /^(--project|--grep|-g|--grep-invert|--reporter|--workers|-j|--config|-c|--retries|--repeat-each|--shard|--timeout|--output|-t|--testNamePattern|--dir|--root|--environment|--pool|--bail|--maxWorkers|--minWorkers|--exclude|--testTimeout|--outputFile|--max-failures|--prefix|-C|--workspace|-w)$/;
/** Words naming test files: not options, not an option's value, not a number, not a whole folder. */
function files(w, from) {
  const out = [];
  for (let j = from; j < w.length; j++) {
    const x = w[j];
    if (x === '--') continue;
    if (x.startsWith('-')) { if (VALUED.test(x)) j++; continue; }
    const f = x.replace(/^\.[\\/]/, '');
    if (/^\d+$/.test(f) || /[\\/]$/.test(f) || /^((raptor-port[\\/])?(src|e2e)|\.|)$/.test(f)) continue;
    out.push(x);
  }
  return out;
}

/** What a step runs, for the PC lock: 'held' (needs this chat to hold it), 'free' (needs no one else to), or null. */
export function lockNeed(all) {
  // a redirect ends the command's own words: `npx vitest run > out.log` names no test file
  const cut = all.findIndex((x) => REDIRECT.test(x));
  const w = cut < 0 ? all : all.slice(0, cut);
  if (w.some((x) => /^(--version|-v|-V|--help|-h|--list)$/.test(x))) return null;
  // only the word in COMMAND position counts (the third read, 17 Oct 26): `grep -rn vitest .`, `git add …/smoke.mjs` and
  // `which vitest` name a tool without running it. Words that only launch the next one are skipped first.
  let p = 0;
  while (p < w.length) {
    if (/^(if|elseif|while|until|then|do|else|time|env|nohup|command|sudo|!|\$\?)$/i.test(w[p]) || /^[A-Za-z_]\w*=/.test(w[p])) { p++; continue; }
    if (w[p] === 'timeout') { p += 2; continue; }                         // timeout <seconds> <command>
    break;
  }
  return needAt(w, p);
}
/** The lock a command needs when its tool sits at word `p`. */
function needAt(w, p) {
  const t = basename(w[p] || '').toLowerCase().replace(/\.(cmd|exe)$/, '');
  if (t === 'npm' || t === 'pnpm') {
    // skip npm's own options (and their values) before the command, and after `run` before the script
    let k = p + 1; const skip = () => { while (k < w.length && w[k].startsWith('-')) { if (VALUED.test(w[k])) k++; k++; } };
    skip(); let script = w[k];
    if (script === 'run' || script === 'run-script') { k++; skip(); script = w[k]; }
    if (script === 'exec' || script === 'x' || script === 'dlx') { k++; while (k < w.length && w[k].startsWith('-')) k++; return needAt(w, k); }
    const f = script ? files(w, k + 1) : [];
    if (script === 'test' || script === 't') return f.length ? null : 'held';
    if (script === 'test:e2e' || script === 'e2e:quick') return f.length === 1 ? 'free' : 'held';
    if (script === 'e2e:board' || script === 'e2e:leave' || script === 'smoke:tracker') return 'held';
    if (script === 'build' || script === 'perf' || script === 'probes:adapted') return 'free';
    return null;
  }
  if (t === 'npx') { let k = p + 1; while (k < w.length && w[k].startsWith('-')) { if (/^(-p|--package)$/.test(w[k])) k++; k++; } return needAt(w, k); }
  if (t === 'vitest') {
    const sub = w[p + 1];
    if (sub && !sub.startsWith('-') && sub !== 'run') return files(w, p + 1).length ? null : 'held';
    return files(w, sub === 'run' ? p + 2 : p + 1).length ? null : 'held';
  }
  if (t === 'playwright') return w[p + 1] === 'test' ? (files(w, p + 2).length === 1 ? 'free' : 'held') : null;
  if (t === 'node') { const a = w.slice(p + 1).find((x) => !x.startsWith('-')); return a && /(^|[\\/])tracker[\\/]smoke\.mjs$/.test(a) ? 'held' : null; }
  return null;
}

/** The command itself, written back with its quotes: from the tool that runs it (npm, npx, node, vitest, playwright) to
 *  its last word before a redirect — never a PowerShell `if ($?) {` around it. */
function runPart(all) {
  const cut = all.findIndex((x) => REDIRECT.test(x)); const w = cut < 0 ? all : all.slice(0, cut);
  const at = w.findIndex((x) => /^(npm|npx|pnpm|node|vitest|playwright)(\.cmd|\.exe)?$/i.test(basename(x)));
  return w.slice(at < 0 ? 0 : at).map(quoteWord).join(' ');
}

/** The reason to refuse a run for the PC lock, or null. */
function lockVerdict(step, deps, tool) {
  const need = lockNeed(step.w);
  if (!need) return null;
  const lock = deps.lock();
  const live = lock && lock.ageMs < STALE_MS ? lock : null;
  const cur = deps.branch(step.cwd) || '';
  const first = live ? live.owner.split('\n')[0] : '';
  const mine = !!(live && cur && first.split(' — ')[0].trim() === cur);
  if (need === 'free' && (!live || mine)) return null;
  if (need === 'held' && mine) return null;
  const who = `${cur || '<branch>'} — <what>`;
  const gl = `${((deps.top && deps.top(step.cwd)) || '<repo>').replace(/\\/g, '/')}/raptor-port/scripts/gatelock.mjs`;
  const dir = step.cwd ? String(step.cwd).replace(/\\/g, '/') : '';
  const go = !dir ? '' : tool === 'PowerShell' ? `Set-Location "${dir}"; ` : `cd "${dir}" && `;
  const lines = [`LOCK GUARD ([PUSH-LOCK-GUARD], D976): refused — ${need === 'held' ? 'a full check run needs the PC lock' : 'another chat holds the PC lock'}.`];
  if (live && !mine) lines.push(`Held by: ${first} (${Math.round(live.ageMs / 60000)} min). Two check runs at once give false failures (D86, D228).`);
  else lines.push('Several chats share this PC; two check runs at once give false failures (D86, D228).');
  lines.push('Run it through the lock — it waits until the lock is free, takes it, runs, and always releases it:',
    `  ${go}node "${gl}" exec "${who}" -- ${runPart(step.w)}`,
    `or, for the whole gate set: node "${gl}" run`,
    'A full run outlasts the tool\'s default 2-minute timeout: run it in the background, or with a timeout of 600000.');
  return lines.join('\n');
}

/** The verdict for one tool call: { refuse } or { note } or null. `deps` reads git, GitHub and the lock. */
export function verdict(input, deps = realDeps) {
  const ti = input && input.tool_input;
  const cmd = ti && typeof ti.command === 'string' ? ti.command : '';
  if (!cmd || (!/\bpush\b/.test(cmd) && !/vitest|playwright|npm|pnpm|smoke/.test(cmd))) return null;
  const cwd = (input.cwd && nativePath(input.cwd)) || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  let note = null;
  for (const step of steps(cmd, cwd, input.tool_name)) {
    const p = pushOf(step);
    if (p) { const v = pushVerdict(p, deps); if (v && v.refuse) return v; if (v && v.note) note = v.note; continue; }
    const l = lockVerdict(step, deps, input.tool_name);
    if (l) return { refuse: l };
  }
  return note ? { note } : null;
}

// ---- the real readers: git, GitHub, the lock folder (each fails soft) -------------------------------------------------
const sh = (cwd, cmd, args, ms = 4000) => {
  try {
    const r = spawnSync(cmd, args, { cwd: cwd && existsSync(cwd) ? cwd : undefined, encoding: 'utf8', timeout: ms, windowsHide: true });
    return r.status === 0 ? String(r.stdout || '').trim() : null;
  } catch { return null; }
};
/** Is a process still running? (EPERM: it is, but not ours to signal.) */
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return !!(e && e.code === 'EPERM'); } };
export const realDeps = {
  branch: (cwd) => sh(cwd, 'git', ['symbolic-ref', '--short', '-q', 'HEAD']),
  top: (cwd) => sh(cwd, 'git', ['rev-parse', '--show-toplevel']),
  config: (cwd, key) => sh(cwd, 'git', ['config', '--get', key]),
  remoteSha: (cwd, remote, b) => sh(cwd, 'git', ['rev-parse', '--verify', '-q', `refs/remotes/${remote}/${b}`]),
  runs: (cwd, b) => {
    const out = sh(cwd, 'gh', ['run', 'list', '--branch', b, '--limit', '10', '--json', 'status,headSha,workflowName'], 10000);
    try { return out === null ? null : JSON.parse(out); } catch { return null; }
  },
  lock: () => {
    const dir = process.env.RAPTOR_GATE_LOCK || join(homedir(), '.raptor-gates-lock');
    if (!existsSync(dir)) return null;
    let owner = '(no owner.txt)';
    try { owner = readFileSync(join(dir, 'owner.txt'), 'utf8').trim(); } catch {}
    // a lock whose holding process (gatelock exec / run) has died is no lock: the next `take` breaks it
    const hp = /^holder-pid: (\d+)$/m.exec(owner); const cp = /^child-pid: (\d+)$/m.exec(owner);
    if (hp && !alive(Number(hp[1])) && !(cp && alive(Number(cp[1])))) return null;   // its run (and the checks it started) ended
    try { return { owner, ageMs: Date.now() - statSync(dir).mtimeMs }; } catch { return null; }
  },
};

// Run as the hook only when this file is the one invoked (the test imports verdict() instead).
if (process.argv[1] && basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))) {
  let s = '';
  process.stdin.on('data', (d) => (s += d)).on('end', () => {
    let v = null;
    try { v = verdict(JSON.parse(s)); } catch { process.exit(0); }
    if (v && v.refuse) { process.stderr.write(v.refuse + '\n'); process.exit(2); }
    if (v && v.note) process.stdout.write(JSON.stringify({ systemMessage: v.note }));
    process.exit(0);
  });
}
