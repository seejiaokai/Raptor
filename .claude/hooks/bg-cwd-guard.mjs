#!/usr/bin/env node
// PreToolUse hook — [BG-CWD-GUARD] (owner's go, D162, 24 Sep 26). Refuses a BACKGROUNDED shell command that
// runs npm / npx without first moving into raptor-port/.
//
// Why a hook and not a warning: a `run_in_background` shell starts in the folder the CHAT started in — the repo
// root, or a worktree's root — NOT wherever the foreground shell has since moved to, and there is no package.json
// there, so a bare `npm run test:e2e` dies at once (ENOENT) — and the wrapper's exit code can read 0, or
// `npx playwright test` reports "No tests found" as a pass. The bold warning in raptor-port/CLAUDE.md
// §Build & verify was broken three times (skills notebook #42, 1 Sep 26); each miss costs a ~10-minute re-run.
// A rule that keeps failing the same way is changed into one that refuses loudly.
//
// [BG-GUARD-FALSE] (26 Sep 26): the note this guard was built on said background shells start "at the REPO ROOT".
// Measured: they start in the CHAT's starting folder ($CLAUDE_PROJECT_DIR) — a chat opened inside raptor-port gets
// shells that are ALREADY there, where the advice `cd raptor-port && …` then fails ("no such directory"). So:
//   · a chat whose starting folder IS raptor-port may run a bare npm in the background (it is already in place);
//   · the refusal names the FULL path, which works from any starting folder.
// A `cd` to any path ending in raptor-port (full or relative) was always accepted, and still is.
//
// Foreground commands are left alone: they keep the session's own folder. Anything unreadable is let through
// (exit 0) — a guard that breaks every command would be worse than the trap it guards.
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// npm, npx or pnpm as a command word (start of the line, or after ; & | ( or a space), .cmd included.
const RUNS_NPM = /(^|[\s;&|(])(npm|npx|pnpm)(\.cmd)?(?=\s|$|;|&|\|)/i;
// A move into raptor-port before it: cd / pushd / Push-Location / Set-Location / sl / chdir, or npm's own --prefix.
// The folder must BE raptor-port or lie inside it (`raptor-port`, `…/raptor-port/`, `raptor-port/scripts` — npm walks up
// to its package.json from a sub-folder); `raptor-port-old` or `raptor-portal` are other folders (Fable F17, 26 Sep 26).
// `cd -- raptor-port` and PowerShell's `-LiteralPath` are flags before the path.
const MOVES_IN = [
  /(^|[\s;&|(])(cd|pushd|push-location|chdir|set-location|sl)(\s+--?[\w-]*)*\s+["']?[^;&|\n]*raptor-port(?![\w.-])/i,
  /--prefix(=|\s+)["']?[^\s;&|]*raptor-port(?![\w.-])/i,
];
/** The folder a background shell starts in — the chat's own starting folder. '' when unknown. */
const startDir = (env) => String((env && env.CLAUDE_PROJECT_DIR) || '').replace(/[\\/]+$/, '');

/** The reason to refuse, or null to let the command run. `env` is the hook's environment (tests pass their own). */
export function refusal(input, env = process.env) {
  const ti = input && input.tool_input;
  if (!ti || ti.run_in_background !== true) return null;
  const cmd = typeof ti.command === 'string' ? ti.command : '';
  if (!RUNS_NPM.test(cmd)) return null;
  if (MOVES_IN.some((re) => re.test(cmd))) return null;
  const start = startDir(env);
  // started inside raptor-port: the shell is already where npm needs it
  if (start && basename(start).toLowerCase() === 'raptor-port') return null;
  const full = start ? join(start, 'raptor-port').replace(/\\/g, '/') : '<the repo>/raptor-port';
  return [
    'BACKGROUND-COMMAND GUARD ([BG-CWD-GUARD], D162): refused.',
    'A background command starts in the folder this chat STARTED in' + (start ? ` (${start.replace(/\\/g, '/')})` : '') + ',',
    'not where the foreground shell has moved to. There is no package.json there, so this npm/npx command would',
    'fail at once — and can still report success. Move into raptor-port first, in the same command, by its FULL path:',
    `  Bash:       cd "${full}" && npm run test:e2e`,
    `  PowerShell: Set-Location "${full}"; npm run test:e2e`,
    `  or:         npm --prefix "${full}" run test:e2e`,
  ].join('\n');
}

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
