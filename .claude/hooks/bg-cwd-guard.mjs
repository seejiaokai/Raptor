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
const RUNS_NPM = /(^|[\s;&|(])(npm|npx|pnpm)(\.cmd)?(?=\s|$|;|&|\||\))/i;
// A folder that IS raptor-port or lies inside it: a path component exactly `raptor-port` (`raptor-port`,
// `…/raptor-port/`, `raptor-port/scripts` — npm walks up to its package.json from a sub-folder). `raptor-port-old` and
// `raptor-portal` are other folders (Fable F17, 26 Sep 26).
const IN_RP = /(^|[\\/])raptor-port([\\/]|$)/i;
// npm's own --prefix into raptor-port, on the npm step itself.
const PREFIX_RP = /--prefix(=|\s+)["']?[^\s;&|"']*raptor-port(?![\w.-])/i;
// A step that moves the shell: cd / pushd / Push-Location / Set-Location / sl / chdir (flags like `--` or `-Path` before
// the folder), and popd / Pop-Location (back to an unknown folder).
const MOVE = /^(cd|pushd|push-location|chdir|set-location|sl)((?:\s+--?[\w-]*)*)(?:\s+["']?(.*?)["']?)?$/i;
const POP = /^(popd|pop-location)\b/i;
/** The folder a background shell starts in — the chat's own starting folder. '' when unknown. */
const startDir = (env) => String((env && env.CLAUDE_PROJECT_DIR) || '').replace(/[\\/]+$/, '');

/** Where a step leaves the shell: true inside raptor-port, false outside, or `was` when a relative move keeps it where
 *  it was (a sub-folder of raptor-port stays in; a folder elsewhere stays out). Unknown targets count as OUT. */
function moveTo(target, was) {
  const t = String(target || '').trim();
  if (!t || t === '~' || t === '-') return false;                   // home, or back to the previous folder: not known
  if (IN_RP.test(t)) return true;
  if (/^\.\.([\\/]|$)/.test(t)) return false;                       // up and out
  if (/^([\\/]|[A-Za-z]:|~|\$)/.test(t)) return false;              // an absolute (or variable) path not naming it
  return was;
}

/** ORDER MATTERS (Astra's read, 26 Sep 26): `npm test; cd raptor-port` and `cd raptor-port; cd ..; npm test` used to
 *  pass, because a move ANYWHERE in the line counted. Each step is followed in turn — `&&`, `||`, `;`, `|` and new
 *  lines separate steps, `( … )` runs a step group whose moves end with it — and every npm step must run inside
 *  raptor-port (or carry its own --prefix). `inside`: where the shell starts. */
function npmOutside(cmd, inside) {
  let here = inside;
  const stack = [];
  for (let seg of cmd.split(/&&|\|\||;|\||\n/)) {
    seg = seg.trim();
    while (seg.startsWith('(')) { stack.push(here); seg = seg.slice(1).trim(); }
    let close = 0;
    while (seg.endsWith(')') && !/\([^)]*\)$/.test(seg)) { close++; seg = seg.slice(0, -1).trim(); }
    const m = MOVE.exec(seg);
    if (m) here = moveTo(m[3], here);
    else if (POP.test(seg)) here = false;
    else if (RUNS_NPM.test(seg) && !here && !PREFIX_RP.test(seg)) return true;
    for (; close > 0; close--) here = stack.length ? stack.pop() : here;
  }
  return false;
}

/** The reason to refuse, or null to let the command run. `env` is the hook's environment (tests pass their own). */
export function refusal(input, env = process.env) {
  const ti = input && input.tool_input;
  if (!ti || ti.run_in_background !== true) return null;
  const cmd = typeof ti.command === 'string' ? ti.command : '';
  if (!RUNS_NPM.test(cmd)) return null;
  const start = startDir(env);
  // a chat started inside raptor-port (or a folder in it) has shells that are already where npm needs them
  if (!npmOutside(cmd, !!start && IN_RP.test(start))) return null;
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
