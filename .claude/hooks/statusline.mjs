#!/usr/bin/env node
// The status line — [COMPACT-WHEN-MOD] (his question of 14 Oct 26, D857; D868, D870). One short line under the chat
// so HE can see how full it is, which only the agent could read before:
//   "Chat 36% full"   ·   from 75% of the app's room (D878): "Chat 77% full · compact at the next clean point"   ·   marked: "… · ready"
// Claude Code hands a status line the fullness itself (context_window.used_percentage); when it does not, the
// figure is read from the chat's record as the hooks read it. Prints nothing it cannot work out.
import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';
import { readFill, readReady, readInput, BANDS } from './compact-lib.mjs';

/** The line, from a percentage and whether a "ready" mark is set — pure, for the tests. */
export function line(pct, ready) {
  if (typeof pct !== 'number' || Number.isNaN(pct)) return '';
  let s = `Chat ${Math.round(pct)}% full`;
  if (pct >= BANDS[0]) s += ready ? ' · ready to compact' : ' · compact at the next clean point';
  return s;
}

function main() {
  const input = readInput();
  const given = input.context_window && input.context_window.used_percentage;
  const pct = typeof given === 'number' ? given : (readFill(input.transcript_path) || {}).pct;
  const text = line(pct, !!readReady(input.cwd || (input.workspace && input.workspace.current_dir) || process.cwd()));
  if (text) process.stdout.write(text);
}

if (process.argv[1] && basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))) {
  try { main(); } catch { /* print nothing */ }
  process.exit(0);
}
