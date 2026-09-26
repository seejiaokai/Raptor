#!/usr/bin/env node
// PreToolUse hook — [BG-CWD-GUARD] (owner's go, D162, 24 Sep 26). Refuses a BACKGROUNDED shell command that
// runs npm / npx without first moving into raptor-port/.
//
// Why a hook and not a warning: a `run_in_background` shell starts at the REPO ROOT, where there is no
// package.json, so a bare `npm run test:e2e` dies at once (ENOENT) — and the wrapper's exit code can read 0,
// or `npx playwright test` reports "No tests found" as a pass. The bold warning in raptor-port/CLAUDE.md
// §Build & verify was broken three times (skills notebook #42, 1 Sep 26); each miss costs a ~10-minute re-run.
// A rule that keeps failing the same way is changed into one that refuses loudly.
//
// Foreground commands are left alone: they keep the session's own folder. Anything unreadable is let through
// (exit 0) — a guard that breaks every command would be worse than the trap it guards.
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';

// npm, npx or pnpm as a command word (start of the line, or after ; & | ( or a space), .cmd included.
const RUNS_NPM = /(^|[\s;&|(])(npm|npx|pnpm)(\.cmd)?(?=\s|$|;|&|\|)/i;
// A move into raptor-port before it: cd / pushd / Set-Location / sl / chdir, or npm's own --prefix.
const MOVES_IN = [
  /(^|[\s;&|(])(cd|pushd|chdir|set-location|sl)(\s+-\w+)*\s+["']?[^;&|\n]*raptor-port/i,
  /--prefix(=|\s+)["']?[^\s;&|]*raptor-port/i,
];

/** The reason to refuse, or null to let the command run. */
export function refusal(input) {
  const ti = input && input.tool_input;
  if (!ti || ti.run_in_background !== true) return null;
  const cmd = typeof ti.command === 'string' ? ti.command : '';
  if (!RUNS_NPM.test(cmd)) return null;
  if (MOVES_IN.some((re) => re.test(cmd))) return null;
  return [
    'BACKGROUND-COMMAND GUARD ([BG-CWD-GUARD], D162): refused.',
    'A background command starts at the REPO ROOT, where there is no package.json, so this npm/npx command would',
    'fail at once — and can still report success. Move into raptor-port first, in the same command:',
    '  Bash:       cd raptor-port && npm run test:e2e',
    '  PowerShell: Set-Location raptor-port; npm run test:e2e',
    '  or:         npm --prefix raptor-port run test:e2e',
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
