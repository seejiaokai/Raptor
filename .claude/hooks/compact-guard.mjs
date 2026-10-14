#!/usr/bin/env node
// PreCompact hook, automatic compactions only — [COMPACT-WHEN-MOD] (D868, D870). The app's own compaction point is
// lowered to about 845,000 tokens (96% of the app's 880,000 room — the project settings' autoCompactWindow). This guard holds such a compaction back until the
// agent has saved its state and marked "ready" (compact-ready.mjs), so it lands at a clean point and not in the
// middle of a walk or a gate run.
//
// It must never make compaction LATER than the app would have made it without these hooks (D870), and it must never
// hold a compaction the app needs to RECOVER — Claude Code's hooks page: blocking a compaction triggered to recover
// from a context-limit error "makes the underlying error surface and the current request fail" (the fresh read of
// 15 Oct 26, finding 1: overnight, that ends the run). The hook is not told which kind it is, so it holds ONLY when
// every one of these is true, and otherwise lets the compaction run:
//   · it is automatic (a manual /compact is never held), and not inside a helper (no agent_id);
//   · the fullness can be read, and the last request stood from 90% of the app's own room (792,000 of 880,000 — the
//     last note's point, just below the app's own attempt at 96%; D878) to under 900,000 tokens (90% of the model's
//     whole room; about 102% of an 880,000 room) — lower down it is an idle chat's compaction or a smaller model's room
//     (findings 1, 5; and the fresh read of [COMPACT-BANDS-WINDOW], finding 1); from 900,000 the backstop stands;
//   · with what has come in since that request added (tool output not yet sent), it is still under 900,000 — a request
//     that overran shows here, so even the FIRST attempt to recover goes through;
//   · it has not already held once on this same last request — a second attempt with no new request in between is
//     not the app's ordinary try at the next turn, so it goes through;
//   · no fresh "ready" mark;
//   · he is not away — at night, or when he leaves a job unattended, the guard is OFF (his ruling D872): the app then
//     compacts at about 845,000 tokens (96% of its 880,000 room) whenever it gets there, the state being saved at every commit anyway.
// When it holds, it notes that in the chat's state, so the reminder hook can say once that a compaction is waiting.
import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';
import { readFill, readReady, readAway, readInput, readState, writeState, NEVER_HOLD_AT, HOLD_FROM, READY_COMMAND } from './compact-lib.mjs';

/** 'allow' or 'hold' — pure, for the tests. */
export function decide({ trigger, agentId, fill, ready, heldUuid, away }) {
  if (trigger !== 'auto' || agentId || away) return 'allow';
  if (!fill) return 'allow';
  if (fill.pct < HOLD_FROM || fill.pct >= NEVER_HOLD_AT) return 'allow';
  if ((fill.pctNow ?? fill.pct) >= NEVER_HOLD_AT) return 'allow';
  if (fill.uuid && heldUuid && fill.uuid === heldUuid) return 'allow';
  if (ready) return 'allow';
  return 'hold';
}

function main() {
  const input = readInput();
  const fill = readFill(input.transcript_path);
  const state = readState(input.session_id);
  const cwd = input.cwd || process.cwd();
  const verdict = decide({ trigger: input.trigger, agentId: input.agent_id, fill, ready: readReady(cwd), heldUuid: state.heldUuid, away: readAway(cwd) });
  if (verdict !== 'hold') return;
  writeState(input.session_id, { ...state, heldUuid: fill.uuid || '', waiting: true, waitingTold: false });
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: `Held until the state is saved (D868): at the next clean point commit, push, rewrite this chat's HANDOFF.md block, then run ${READY_COMMAND}.`,
  }));
}

if (process.argv[1] && basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))) {
  try { main(); } catch { /* fail open: let the compaction run */ }
  process.exit(0);
}
