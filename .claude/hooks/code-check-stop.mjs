#!/usr/bin/env node
// Stop hook — the code check at the end of a turn ([CODE-CHECK-CI]; his D1536 point 4 — "the code check runs by itself every
// session and on every change" — and D1539, 31 Oct 26, his permission to change the hooks and settings for it).
//
// At the end of a turn, when this branch changes the app's code (anything under raptor-port/src, against main), it runs
// React Doctor's "no new finding" check — raptor-port/scripts/code-check.mjs, the same script as `npm run lint:changed` and
// the pull request's "code check" — and shows the count in the chat. It BLOCKS NOTHING (his D1539, reading 2): it always
// ends 0 and never holds the turn open for a fix; a red count is stopped where it matters, by the pull request's check.
//
// Kept cheap, so it costs nothing on most turns:
//   · nothing under raptor-port/src changed against main → it does nothing (a few git reads, well under a second);
//   · the code it would check (the change's code files, tracked and new) is the same as at its last run → nothing again:
//     a fingerprint of that change is kept in this checkout's own git folder (`claude-code-check.json`), so each state of
//     the code is checked once, however many turns end on it;
//   · otherwise one run, cut off at 150 s (a one-file change took 15 s on his PC; the whole project 48 s), then reported.
// It runs during an unattended run too: a run is bounded as above and never waits on anyone, so it cannot stall one.
// The fingerprint is saved even when a run fails, so a check that cannot run says so once, not at every turn's end.
//
// Main is this checkout's own `origin/main`, as last fetched — the hook never goes to the network. A checkout without
// `origin/main`, or without the script (a branch from before it), is left alone. Anything unreadable is let through,
// silently: a hook that breaks a turn would be worse than the count it reports.
// Its tests: `node --test .claude/hooks/code-check-stop.test.mjs`.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

export const BASE = 'origin/main';
export const RUN_LIMIT_MS = 150 * 1000;
// the code React Doctor reads; a change to anything else (a note, a picture) neither starts a run nor changes the fingerprint
const CODE = ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs', '*.cjs', '*.html'].map((g) => `raptor-port/${g}`);
const STATE = 'claude-code-check.json';
const SHOWN = 5; // findings listed by name in the chat; the rest are counted

/** Git Bash hands a folder as `/c/Users/…`; Node on Windows needs `C:/Users/…`. */
const nativePath = (p) => (process.platform === 'win32' ? String(p).replace(/^\/([a-zA-Z])(\/|$)/, '$1:/') : String(p));

function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, windowsHide: true, timeout: 20000 });
  if (r.error || r.status !== 0) return null;
  return r.stdout;
}
const line = (s) => (s == null ? null : s.trim() || null);

/** The change this branch makes to the app's code, or null when there is none (or git cannot say). */
export function codeChange(cwd) {
  const root = line(git(['rev-parse', '--show-toplevel'], cwd));
  if (!root) return null;
  const gitDir = line(git(['rev-parse', '--absolute-git-dir'], root));
  if (!gitDir || !existsSync(join(root, 'raptor-port', 'scripts', 'code-check.mjs'))) return null;
  if (!line(git(['rev-parse', '--verify', '--quiet', `${BASE}^{commit}`], root))) return null;
  const mb = line(git(['merge-base', BASE, 'HEAD'], root));
  if (!mb) return null;
  // committed, staged and unsaved changes alike: the working files against where the branch left main
  const tracked = git(['diff', '--name-only', mb, '--', 'raptor-port/src'], root);
  const fresh = git(['ls-files', '--others', '--exclude-standard', '--', 'raptor-port/src'], root);
  if (tracked == null || fresh == null) return null;
  if (!tracked.trim() && !fresh.trim()) return null;
  // the fingerprint: where main was left, every changed code line, and every new code file's contents
  const diff = git(['diff', '--no-ext-diff', '--no-textconv', mb, '--', ...CODE], root);
  const added = git(['ls-files', '--others', '--exclude-standard', '-z', '--', ...CODE], root);
  if (diff == null || added == null) return null;
  const h = createHash('sha256').update(`${mb}\n${diff}`);
  for (const f of added.split('\0').filter(Boolean).sort()) {
    h.update(`\0${f}\0`);
    try { h.update(readFileSync(join(root, f))); } catch { h.update('(unreadable)'); }
  }
  return { root, gitDir, fingerprint: h.digest('hex') };
}

const readState = (gitDir) => { try { return JSON.parse(readFileSync(join(gitDir, STATE), 'utf8')); } catch { return {}; } };
const writeState = (gitDir, s) => { try { writeFileSync(join(gitDir, STATE), JSON.stringify(s)); } catch { /* next turn just runs again */ } };

/** What to show in the chat for one run's result. */
export function message(r, sentence) {
  const lines = [sentence(r)];
  for (const f of (r.findings || []).slice(0, SHOWN)) lines.push(`  ${f.file}:${f.line} — ${f.title}`);
  if ((r.findings || []).length > SHOWN) lines.push(`  … and ${r.findings.length - SHOWN} more: npm run lint:changed`);
  return lines.join('\n');
}

/** The whole hook, given its input. Returns the text to show, or null to stay silent. Never throws. */
export async function run(input, { limitMs = RUN_LIMIT_MS } = {}) {
  try {
    if (!input || input.stop_hook_active === true) return null;
    const change = codeChange(nativePath(input.cwd || process.cwd()));
    if (!change) return null;
    const state = readState(change.gitDir);
    if (state.fingerprint === change.fingerprint) return null; // this state of the code was checked and reported already
    const mod = await import(pathToFileURL(join(change.root, 'raptor-port', 'scripts', 'code-check.mjs')).href);
    const r = mod.runCheck({ base: BASE, includeUntracked: true, timeoutMs: limitMs, cwd: join(change.root, 'raptor-port') });
    writeState(change.gitDir, { fingerprint: change.fingerprint, at: Date.now(), status: r.status, newCount: r.newCount });
    return message(r, mod.sentence);
  } catch {
    return null;
  }
}

async function main() {
  let raw = '';
  try { for await (const chunk of process.stdin) raw += chunk; } catch { /* no input: nothing to do */ }
  let input = null;
  try { input = JSON.parse(raw); } catch { input = null; }
  const text = await run(input);
  if (text) process.stdout.write(JSON.stringify({ systemMessage: text }));
  process.exit(0);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
