#!/usr/bin/env node
// PostToolUse hook, every tool — [COMPACT-WHEN-MOD] (D868, D870, D871). Once the chat is about 80% full, and again at
// 85, 90 and 95, it puts one reminder in front of the agent: find a clean point, save the state the way a handoff
// would, then judge — hand off (he is here and the job is nearly done) or mark "ready" and let the compaction come.
//
// Why a hook and not only the guide's line: the overnight command and the general instructions already say "from
// about 80%", but the figure is only seen when the agent thinks to ask for it; on a long walk it does not. One line,
// once per band, costs nothing and is the moment the rule needs. Silent below 80% and on any error.
import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';
import { readFill, readState, writeState, bandOf, readInput } from './compact-lib.mjs';

/** The reminder for a band just reached, or '' when there is nothing new to say. Pure, for the tests. */
export function reminder(fill, lastBand) {
  if (!fill) return '';
  const band = bandOf(fill.pct);
  if (!band || band <= (lastBand || 0)) return '';
  return [
    `This chat is ${Math.round(fill.pct)}% full (about ${Math.round(fill.tokens / 1000)}k tokens) — his rulings D868 and D871.`,
    'At the next clean point: finish the step in hand, commit, push, and rewrite this chat\'s block in HANDOFF.md as a',
    'handoff would (the step in hand, the files it touches, open faults, questions parked, what is next). Start no new',
    'helper, walk or gate run before that. Then judge:',
    '· he is using the chat and the job is nearly done → do not compact; ask him once, in one line with your judgement,',
    '  whether to hand off to a fresh chat (give the opening line);',
    '· he has said he is away, or this is an /overnight run, or he has not answered and the chat keeps filling → run',
    '  `node .claude/hooks/compact-ready.mjs` so the compaction comes at this clean point.',
    'After any compaction: re-read the block, the guide in use and the files of the step in hand before the next change.',
  ].join('\n');
}

function main() {
  const input = readInput();
  const fill = readFill(input.transcript_path);
  const state = readState(input.session_id);
  const text = reminder(fill, state.band);
  if (!text) return;
  writeState(input.session_id, { ...state, band: bandOf(fill.pct) });
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: text } }));
}

if (process.argv[1] && basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))) {
  try { main(); } catch { /* fail open: say nothing */ }
  process.exit(0);
}
