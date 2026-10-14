#!/usr/bin/env node
// The agent runs this AFTER its checkpoint (work committed and pushed, this chat's HANDOFF.md block rewritten) to say
// "compact here" — [COMPACT-WHEN-MOD] (D868, D871). It leaves a small mark beside the checkout's git data (never
// committed); the guard (compact-guard.mjs) then lets the app's next automatic compaction through, and the hook that
// runs after a compaction (compact-resume.mjs) clears it. A mark older than 10 minutes counts for nothing: it is set when a compaction is waiting, for the very next attempt.
//   node "$(git rev-parse --show-toplevel)/.claude/hooks/compact-ready.mjs"            mark ready (from any folder)
//   node "$(git rev-parse --show-toplevel)/.claude/hooks/compact-ready.mjs" --clear    take the mark away
import { writeFileSync } from 'node:fs';
import { readyPath, clearReady } from './compact-lib.mjs';

const cwd = process.cwd();
if (process.argv.includes('--clear')) {
  clearReady(cwd);
  console.log('Compaction mark cleared.');
} else {
  const p = readyPath(cwd);
  if (!p) { console.log('Not inside a git checkout — no mark written.'); process.exit(1); }
  writeFileSync(p, JSON.stringify({ at: Date.now() }));
  console.log('Marked ready: the app\'s next automatic compaction may run (for the next 10 minutes).');
}
