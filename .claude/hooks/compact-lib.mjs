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
import { join, dirname } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** The model's whole room, in tokens: the models in use have a 1M window. */
export const MODEL_WINDOW = 1_000_000;

/** THE APP'S OWN ROOM — what every figure here is a percentage of ([COMPACT-BANDS-WINDOW], his ruling D878, 15 Oct 26).
 *  The app counts the chat against the `autoCompactWindow` setting when one is set (880,000 here) and compacts at 96%
 *  of it — about 845,000. Counted against the whole 1M, as first built, the first note came at 800,000, only about
 *  45,000 before the compaction, and read about 10 points lower than the app's own figure. So the room is read the way
 *  the app reads it: the setting in this project's local settings, else its shared settings (the folder these hooks
 *  sit in — the app runs them from its project folder), else his own settings; else the whole 1M. CLAUDE_CONTEXT_WINDOW
 *  overrides it for a test. A figure that is not a sensible token count is ignored. */
export function appRoom(env = process.env, files = settingsFiles()) {
  const forced = Number(env.CLAUDE_CONTEXT_WINDOW);
  if (forced > 0) return forced;
  for (const f of files) {
    try {
      const v = Number(JSON.parse(readFileSync(f, 'utf8')).autoCompactWindow);
      if (v >= 10_000 && v <= MODEL_WINDOW) return v;
    } catch { /* no such file, or not JSON: the next one */ }
  }
  return MODEL_WINDOW;
}
function settingsFiles() {
  const project = join(dirname(fileURLToPath(import.meta.url)), '..');
  return [join(project, 'settings.local.json'), join(project, 'settings.json'), join(homedir(), '.claude', 'settings.json')];
}
/** The chat's room, in tokens — the app's own (above). */
export const WINDOW = appRoom();
/** The first note comes at 75% of the app's room — about 660,000 of 880,000, some 185,000 before the app compacts at
 *  96% of it (D878's reading) — then again every five points. On a room of the whole 1M they are 750,000 and up. */
export const BANDS = [75, 80, 85, 90];
/** The token count from which the guard never holds a compaction back: 90% of the model's whole room (900,000), so a
 *  compaction is never held near the true limit (D870); the app's own point stays the backstop. As a percentage of the
 *  app's room: about 102% of 880,000 — the guard's window runs from the first note to just past the app's own point
 *  (the app tries again at the next request), and on a room of the whole 1M it is 90%, as first built. */
export const NEVER_HOLD_TOKENS = Math.round(MODEL_WINDOW * 0.9);
export const NEVER_HOLD_AT = Math.round((NEVER_HOLD_TOKENS / WINDOW) * 1000) / 10;
/** Below this the guard never holds either — a compaction asked for lower down is something else: the app's compaction
 *  of an idle chat, or a chat on a model with a smaller room (the reader's findings 1 and 5, 15 Oct 26). The first note's
 *  point, so the agent has been told before anything is held. */
export const HOLD_FROM = BANDS[0];
/** A "ready" mark older than this is stale. Short on purpose: the mark is set only once a compaction is WAITING (the
 *  guard has held one), so it is meant for the very next attempt, not for whatever crosses the point later (finding 3). */
export const READY_FRESH_MS = 10 * 60 * 1000;
/** Roughly how many bytes of the record make one token — used only to estimate what came in AFTER the last request. */
const BYTES_PER_TOKEN = 4;

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

/** The fullness from the transcript, or null when it cannot be told — no record, no assistant entry with token counts,
 *  or a compaction recorded after it (the old figure no longer describes the chat). Returns:
 *    tokens, pct — what the LAST request carried;
 *    uuid        — that request's entry id (the guard never holds twice on the same one — finding 1);
 *    after       — an estimate, in tokens, of what has come in since (tool output not yet sent): the bytes of the later
 *                  lines, about four to a token. A request that overran the room shows here before it shows anywhere.
 *  Reads the record's tail only, widening once when the last entries are very long. */
export function readFill(transcriptPath, window = WINDOW) {
  if (!transcriptPath) return null;
  for (const bytes of [1 << 20, 8 << 20]) {
    const lines = tail(transcriptPath, bytes).split('\n');
    let afterBytes = 0;
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (/"subtype"\s*:\s*"compact_boundary"|"isCompactSummary"\s*:\s*true/.test(line)) return null;
      let entry = null;
      if (line.includes('"usage"') && line.includes('"assistant"')) {
        try { entry = JSON.parse(line); } catch { /* the first line of a tail is usually cut short */ }
      }
      const u = entry && entry.type === 'assistant' && !entry.isSidechain && entry.message && entry.message.usage;
      const tokens = u ? (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0) : 0;
      if (!tokens) { afterBytes += Buffer.byteLength(line, 'utf8') + 1; continue; }
      const after = Math.round(afterBytes / BYTES_PER_TOKEN);
      return { tokens, pct: Math.round((tokens / window) * 1000) / 10, uuid: entry.uuid || '', after,
        pctNow: Math.round(((tokens + after) / window) * 1000) / 10 };
    }
  }
  return null;
}

/** The command the agent runs to mark ready, from any folder of the checkout (finding 10). */
export const READY_COMMAND = 'node "$(git rev-parse --show-toplevel)/.claude/hooks/compact-ready.mjs"';

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

/** The "away" mark — he is away (an /overnight run, or his word that he leaves a job unattended): the guard is OFF
 *  (his ruling D872 — a request refused by mistake at night ends the run, with nobody there to say "continue"). Set at
 *  the start of the run, cleared when he is back; it lapses by itself after sixteen hours, so a forgotten mark does
 *  not switch the guard off for good. */
export const AWAY_FRESH_MS = 16 * 60 * 60 * 1000;
export const awayPath = (cwd) => { const g = gitDir(cwd); return g ? join(g, 'claude-away.json') : null; };
export function readAway(cwd, now = Date.now()) {
  const p = awayPath(cwd);
  if (!p || !existsSync(p)) return null;
  try {
    const r = JSON.parse(readFileSync(p, 'utf8'));
    return r && typeof r.at === 'number' && now - r.at <= AWAY_FRESH_MS ? r : null;
  } catch { return null; }
}
export function clearAway(cwd) { const p = awayPath(cwd); if (p) try { rmSync(p, { force: true }); } catch { /* fine */ } }

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
