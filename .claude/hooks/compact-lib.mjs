// Shared by the compaction hooks — [COMPACT-WHEN-MOD] (his rulings D868, D870, D871; the design:
// raptor-port/docs/superpowers/specs/2026-10-15-compact-when-ready.md).
//
// How full is the chat? The app does not hand a hook that figure, but the conversation's own record (the transcript
// file every hook is given) holds, on each assistant entry, the token counts of that request. Input + cache-written +
// cache-read is the context the request carried — measured 15 Oct 26: 335,823 from the record against the app's own
// 336,480. So every piece here reads the fullness itself and needs nothing else to work.
//
// Everything fails OPEN: an unreadable record, no git, no temp folder — each returns null, and the caller then does
// what the app would have done without these hooks. A guard that broke compaction would be worse than none.
import { openSync, readSync, closeSync, fstatSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

/** The chat's room, in tokens. The models in use have a 1M window; CLAUDE_CONTEXT_WINDOW overrides it for tests. */
export const WINDOW = Number(process.env.CLAUDE_CONTEXT_WINDOW) || 1_000_000;
/** From here the agent starts looking for a clean point (D868), and is reminded again every five points. */
export const BANDS = [80, 85, 90, 95];
/** At or above this the guard never holds a compaction back: the app's own point stays the backstop (D870). */
export const NEVER_HOLD_AT = 90;
/** A "ready" mark older than this is stale — the work has moved on since the state was written. */
export const READY_FRESH_MS = 45 * 60 * 1000;

/** Read the last `bytes` of a file as text ('' when it cannot be read). */
function tail(path, bytes) {
  let fd;
  try {
    fd = openSync(path, 'r');
    const size = fstatSync(fd).size;
    const start = Math.max(0, size - bytes);
    const buf = Buffer.alloc(size - start);
    readSync(fd, buf, 0, buf.length, start);
    return buf.toString('utf8');
  } catch { return ''; } finally { if (fd !== undefined) try { closeSync(fd); } catch { /* nothing to do */ } }
}

/** The fullness from the transcript: { tokens, pct } of the LAST request, or null when it cannot be told — no record,
 *  no assistant entry with token counts, or a compaction recorded after it (the old figure no longer describes the
 *  chat). Reads the record's tail only, widening once when the last entries are very long. */
export function readFill(transcriptPath, window = WINDOW) {
  if (!transcriptPath) return null;
  for (const bytes of [1 << 20, 8 << 20]) {
    const lines = tail(transcriptPath, bytes).split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (/"subtype"\s*:\s*"compact_boundary"|"isCompactSummary"\s*:\s*true/.test(line)) return null;
      if (!line.includes('"usage"') || !line.includes('"assistant"')) continue;
      let entry;
      try { entry = JSON.parse(line); } catch { continue; } // the first line of a tail is usually cut short
      if (entry.type !== 'assistant' || entry.isSidechain) continue;
      const u = entry.message && entry.message.usage;
      if (!u) continue;
      const tokens = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
      if (!tokens) continue;
      return { tokens, pct: Math.round((tokens / window) * 1000) / 10 };
    }
  }
  return null;
}

/** The checkout's git folder (a worktree has its own), or null. The "ready" mark lives there: never committed, one
 *  per checkout — and one chat works in one checkout. */
export function gitDir(cwd) { return git(['rev-parse', '--absolute-git-dir'], cwd) || null; }

/** Run git in `cwd`, falling back to this process's own folder when `cwd` is unusable — a folder written the POSIX way
 *  (`/c/Users/…`, as Git Bash hands it) does not exist for Node on Windows (found by the end-to-end run, 15 Oct 26: the
 *  mark was written and then never found). '' when git cannot answer. */
export function git(args, cwd) {
  for (const dir of [cwd, process.cwd()]) {
    if (!dir) continue;
    try {
      const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8', timeout: 3000 });
      if (r.status === 0) return r.stdout.trim();
    } catch { /* try the next folder */ }
  }
  return '';
}

export const readyPath = (cwd) => { const g = gitDir(cwd); return g ? join(g, 'claude-compact-ready.json') : null; };

/** The "ready" mark, if fresh: { at, pct } — written by compact-ready.mjs after the agent's checkpoint. */
export function readReady(cwd, now = Date.now()) {
  const p = readyPath(cwd);
  if (!p || !existsSync(p)) return null;
  try {
    const r = JSON.parse(readFileSync(p, 'utf8'));
    return r && typeof r.at === 'number' && now - r.at <= READY_FRESH_MS ? r : null;
  } catch { return null; }
}

export function clearReady(cwd) { const p = readyPath(cwd); if (p) try { rmSync(p, { force: true }); } catch { /* fine */ } }

/** Per-chat memory of which reminder band was last given, in the temp folder (gone at a restart — harmless). */
const statePath = (sessionId) => join(tmpdir(), 'claude-compact', `${String(sessionId || 'unknown').replace(/[^\w-]/g, '_')}.json`);
export function readState(sessionId) {
  try { return JSON.parse(readFileSync(statePath(sessionId), 'utf8')); } catch { return {}; }
}
export function writeState(sessionId, state) {
  try { mkdirSync(join(tmpdir(), 'claude-compact'), { recursive: true }); writeFileSync(statePath(sessionId), JSON.stringify(state)); } catch { /* fine */ }
}

/** The highest reminder band the fullness has reached, or 0. */
export const bandOf = (pct) => BANDS.filter((b) => pct >= b).pop() || 0;

/** Read all of stdin as JSON ({} when there is none or it is not JSON). */
export function readInput() {
  try { return JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { return {}; }
}
