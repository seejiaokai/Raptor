# Brief — a fresh, blind read of the finished code of `[OIL-PLAN-SWITCH-UNASKED]` (D865; D875)

You are a fresh reader. You did not write this code and you have seen nothing of how it was built or walked. You read;
you change no file, run no gate, commit nothing. Return ONE report (the format at the end).

**Branch / commits:** `claude/checkout-stale-compaction-7ee93a` — read the diff `git diff 62b649e29..HEAD -- raptor-port/src`
(the documents in that range are records; read them only where a finding needs them).

## What was asked (his rulings — open each full row before relying on its detail: `grep -h '^| D865 |' .claude/decisions-full/*.md`)
- **D865 (his question 3, "as recommend"):** "Switch to this plan" that brings back an input with no OIL answer for a
  non-working day gets the load's short note and list: its note ends "N input(s) need(s) an OIL answer." and the day's
  one list opens for the days that need the answer; its note is shortened to plain sentences the same way as the load's.
- **D818, D862:** the load of a published version (the model the switch copies) — counted are inputs it PUT BACK (standing
  after and not before) that need an answer; an input of several days is counted where its unanswered day is another of
  its days, and the list opens for THAT day. **D863:** the load's note is short plain sentences.
- **D814, D804:** a cancelled or information-only input is never asked and never counted; one under Unavailable counts.
- **D793:** Accept that puts an input back waits on its OIL question (the switch is NOT held: it is made, then says so).
- **The settled design of 28 Sep 26** (`raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`, the Fable
  F1 row): a request taken off by hand stays "taken off" through a plan switch; Accept adopts its row. Not a finding.

## What was built (the builder's account — verify, do not trust)
- `raptor-port/src/ui/oilputback.ts` (new): the load's before/after reading moved out of `ui/interactions.ts` so the load and
  the switch share it; `oilPutBackWatch(di)` before the replacement returns `after()`, which counts and opens the list.
- `raptor-port/src/ui/board.ts switchDraft`: reads before `draftSelect`, tells after; the note in sentences; a redraw
  after the list opens. `raptor-port/src/ui/DraftsModal.tsx`: "Select" closes the plan editor when the list is open
  (the walk found the list under the editor's backdrop).
- `raptor-port/src/engine/drafts.ts`: `rowsLeftSaid` removed. Tests: `raptor-port/src/ui/oilwait.test.tsx` blocks ON11
  (the load) and ON12 (the switch), and five test files re-pointed at the new sentences.
- The builder's reading: only a PUBLISHED day can be brought to this (a plan without the row unfiles the input there and
  nothing lands it again); on an unpublished day a filed input lands by itself on whichever plan is live.

## Ask for ABSENCES, not only errors
1. **Every door that switches a plan** — the plans menu (week day head, board sign strip), the preview's "Switch to this
   plan" (week and board), the plan editor's "Select", anything else that calls `draftSelect` or replaces a day: does each
   say the OIL tail and open the list, and is the list drawn and reachable from each? Is any replacement of a whole day
   (a template applied, an Undo/Redo of a switch, a week load) a door that should say it too and does not? Say which, and
   whether a ruling covers it.
2. **The reading itself:** can `oilPutBackWatch` count wrongly — an input that stood before but was not "open", the date
   range read before the swap vs after, an input of several days crossing the week's end, inputs under Unavailable, an
   input whose answer is partly given, ALL AVAIL on a shared input, the load's behaviour changed by the move (compare
   with the code it replaced, `git show 62b649e29:raptor-port/src/ui/interactions.ts`)?
3. **Order and state:** the note, the log line, the list and the redraw — any order in which the list is set but never
   drawn, drawn twice, or left open over the wrong day; Undo of the switch; the switch refused (already live, a frozen
   week); the editor closing when a list was ALREADY open before Select.
4. **The words:** each sentence in `switchDraft` and the plural/singular forms ("1 difference … is", "2 differences …
   are"); every fact the old note gave is still given.

## Not a finding (D56; D489)
- **A problem that lives ONLY in data already stored is not a finding** — the store is demo data, cleared before the
  database — when the code is correct going forward. Both must be true.
- **A claim is a finding only with a concrete failure (the steps or the state), its cause, and its exact fix.** No style
  notes; no "consider". Older behaviour this change did not touch: name it in one line as OLDER, do not count it.

## The report (to `raptor-port/docs/superpowers/briefs/2026-10-15-reads/oil-plan-switch-code-opus.md`)
A verdict line (CLEAN / CLEAN WITH THESE CHANGES / NOT READY), then each finding: an id (F1…), severity (high / medium /
low), the failure, the cause with file and function, the exact fix, and how a test would show it red. Then the doors you
checked (question 1) as a table, each YES / NO-because / MISSING. Then what you did not read.
