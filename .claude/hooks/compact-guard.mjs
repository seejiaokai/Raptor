#!/usr/bin/env node
// PreCompact hook, automatic compactions only — [COMPACT-WHEN-MOD] (D868, D870). The app's own compaction point is
// lowered to about 85% (the project settings' autoCompactWindow). This guard holds an automatic compaction back until
// the agent has saved its state and marked "ready" (compact-ready.mjs), so the compaction lands at a clean point and
// not in the middle of a walk or a gate run.
//
// It never makes compaction LATER than the app would have made it without these hooks (D870): at 90% full or more it
// always lets it through, and so it does when the fullness cannot be read. A manual /compact is never held. Claude
// Code's documentation: a PreCompact hook that answers {"decision":"block"} skips a proactive automatic compaction and
// the chat carries on uncompacted.
import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';
import { readFill, readReady, readInput, NEVER_HOLD_AT } from './compact-lib.mjs';

/** 'allow' or 'hold' — pure, for the tests. */
export function decide({ trigger, fill, ready }) {
  if (trigger !== 'auto') return 'allow';
  if (!fill) return 'allow';
  if (fill.pct >= NEVER_HOLD_AT) return 'allow';
  if (ready) return 'allow';
  return 'hold';
}

function main() {
  const input = readInput();
  const verdict = decide({ trigger: input.trigger, fill: readFill(input.transcript_path), ready: readReady(input.cwd || process.cwd()) });
  if (verdict === 'hold') {
    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason: 'Held until the state is saved (D868): finish the step, commit, push, rewrite this chat\'s HANDOFF.md block, then run node .claude/hooks/compact-ready.mjs.',
    }));
  }
}

if (process.argv[1] && basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))) {
  try { main(); } catch { /* fail open: let the compaction run */ }
  process.exit(0);
}
