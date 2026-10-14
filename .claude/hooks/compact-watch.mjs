#!/usr/bin/env node
// PostToolUse hook, every tool — [COMPACT-WHEN-MOD] (D868, D870, D871). Two short notes, each said once, put in front
// of the agent after a tool use:
//   1. Once the chat is about 80% full (and again at 85, 90, 95): find a clean point, save the state the way a handoff
//      would, and judge — he is here and the job is nearly done → offer him a handoff (D871); otherwise carry on.
//   2. Once the guard has held an automatic compaction: a compaction is WAITING — at the next clean point save the
//      state and mark "ready"; it then comes at the next step. The mark is asked for only here, so the compaction
//      lands at that clean point and not wherever 85% is crossed later (the fresh read of 15 Oct 26, finding 3).
//
// Why a hook and not only the guide's line: the figure is only seen when the agent thinks to ask for it; on a long
// walk it does not. Silent inside a helper — a helper's tool use also reaches this hook, with the main chat's record,
// and must neither get the note nor use it up (finding 2). Silent below 80% and on any error.
import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';
import { readFill, readState, writeState, bandOf, readInput, READY_COMMAND } from './compact-lib.mjs';

/** The note for a band just reached, or ''. Pure, for the tests. */
export function reminder(fill, lastBand) {
  if (!fill) return '';
  const band = bandOf(fill.pct);
  if (!band || band <= (lastBand || 0)) return '';
  return [
    `This chat is ${Math.round(fill.pct)}% full (about ${Math.round(fill.tokens / 1000)}k tokens) — his rulings D868 and D871.`,
    'At the next clean point: finish the step in hand, commit, push, and rewrite this chat\'s block in HANDOFF.md as a',
    'handoff would (the step in hand, the files it touches, open faults, questions parked, what is next). Start no new',
    'helper, walk or gate run before that. Then judge: he is using the chat and the job is nearly done → do not wait',
    'for a compaction; ask him once, in one line with your judgement, whether to hand off to a fresh chat (give the',
    'opening line). At any point you judge suitable, the usual handoff advice stands (D874). Otherwise carry on —',
    'when a compaction is due you will be told, and mark ready then.',
    `He has said he is away (or this is an /overnight run) and the guard is still on? Switch it off: ${READY_COMMAND} --away (D872).`,
  ].join('\n');
}

/** The note that a held compaction is waiting, or ''. Pure, for the tests. */
export function waitingNote(state) {
  if (!state || !state.waiting || state.waitingTold) return '';
  return [
    'A compaction is waiting: the app tried and the guard held it until the state is saved (D868).',
    `At the next clean point: commit, push, rewrite this chat's HANDOFF.md block, then run ${READY_COMMAND} — the`,
    'compaction then comes at your next step. (He is away, or an /overnight run? Run it with --away instead — D872.)',
    'After it: re-read the block, the guide in use and the files of the step in hand before the next change.',
  ].join('\n');
}

/** What to say and the state to keep — pure, for the tests. A band falls back when the chat is emptier than it was
 *  (a compaction whose after-hook did not run), so the reminders never stop for the rest of a chat (finding 4). */
export function step(fill, state) {
  const s = { ...state };
  if (fill && bandOf(fill.pct) < (s.band || 0)) s.band = bandOf(fill.pct);
  const parts = [reminder(fill, s.band), waitingNote(s)].filter(Boolean);
  if (fill && parts.length && bandOf(fill.pct) > (s.band || 0)) s.band = bandOf(fill.pct);
  if (s.waiting && !s.waitingTold && parts.length) s.waitingTold = true;
  return { text: parts.join('\n\n'), state: s };
}

function main() {
  const input = readInput();
  if (input.agent_id) return;
  const before = readState(input.session_id);
  const { text, state } = step(readFill(input.transcript_path), before);
  if (JSON.stringify(state) !== JSON.stringify(before)) writeState(input.session_id, state);
  if (text) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: text } }));
}

if (process.argv[1] && basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))) {
  try { main(); } catch { /* fail open: say nothing */ }
  process.exit(0);
}
