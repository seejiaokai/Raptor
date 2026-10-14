#!/usr/bin/env node
// SessionStart hook, after a compaction — [COMPACT-WHEN-MOD] (D868, D870). Claude Code adds what this prints to the
// fresh context. It hands the agent back the state it saved: the instruction to re-read before the next change, and
// this chat's own block from HANDOFF.md (the branch in hand names it). Then it clears the "ready" mark and the
// reminders, so the next fill starts the count again.
//
// Why: a compaction's summary is the model's memory of the work; the block is the record of it. Work resumed from
// the summary alone has picked up stale file contents and test results before (the reason D766 and D667 put the
// state in the repo first). Prints nothing when it cannot find a block — the reminder line still goes out.
import { readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readInput, clearReady, writeState, git } from './compact-lib.mjs';

/** This branch's block from HANDOFF.md, between its own markers (each anchored to the start of its line), or ''. */
export function blockFor(handoff, branch) {
  if (!handoff || !branch) return '';
  const lines = handoff.split(/\r?\n/); // a file written with Windows line endings still finds its block (finding 7)
  const start = lines.findIndex((l) => l === `<!-- now:${branch} -->`);
  if (start < 0) return '';
  const end = lines.findIndex((l, i) => i > start && l === '<!-- /now -->');
  return end < 0 ? '' : lines.slice(start, end + 1).join('\n');
}

export function message(branch, block) {
  const head = [
    'This chat was just compacted (his rulings D868, D871). Before the next change: re-read this chat\'s block in',
    'HANDOFF.md (below), the working guide in use, and the files of the step in hand — never carry on from the',
    'summary\'s memory of a file, a ruling or a test result. Note the compaction in the block with its time.',
  ].join('\n');
  if (!block) return `${head}\n\n(No HANDOFF.md block found for ${branch || 'this branch'} — read HANDOFF.md and the last commits.)`;
  const whole = `${head}\n\nThe block for ${branch}, as saved:\n\n${block}`;
  // The app passes on at most 10,000 characters of a hook's output and keeps only a preview of more; a block that long
  // would come back cut short, so it is named and opened instead (the fresh read, finding 6 — blocks have reached 11k).
  return whole.length <= MAX_CHARS ? whole
    : `${head}\n\nThis chat's block for ${branch} is longer than the app passes on — open it in HANDOFF.md now, before anything else.`;
}

const MAX_CHARS = 9500;

function main() {
  const input = readInput();
  const cwd = input.cwd || process.cwd();
  const top = git(['rev-parse', '--show-toplevel'], cwd);
  const branch = git(['branch', '--show-current'], cwd);
  const file = top ? join(top, 'HANDOFF.md') : '';
  const handoff = file && existsSync(file) ? readFileSync(file, 'utf8') : '';
  process.stdout.write(message(branch, blockFor(handoff, branch)) + '\n');
  clearReady(cwd);
  writeState(input.session_id, { band: 0, waiting: false, waitingTold: false, heldUuid: '' });
}

if (process.argv[1] && basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))) {
  try { main(); } catch { /* fail open */ }
  process.exit(0);
}
