# The fresh, blind read of `claude/upchit-sheet-leave-cut` (18 Oct 26)

You are a fresh reader. You did not write this code and have seen no other reader's report. READ ONLY: change no file,
run no build, no browser test, no full test suite (one unit test file at a time is fine: `cd raptor-port && npx vitest run
<file>`; a throwaway test of your own goes OUTSIDE the checkout). Return your whole report as your final message.

**What to read:** the diff `git diff origin/main...HEAD -- raptor-port/src` in the checkout
`C:\Users\User\projects\Raptor\.claude\worktrees\upchit-sheet-leave-cut-714b00`, and every file it touches, whole where it
is under ~400 lines, else the functions it touches and their callers (`ui/inputedit.tsx` is 3,300 lines: read
`giveBackCuts`, `dryRun`, `medAskFor`, `commitEditUpchit`, `removeInput`, `upchitDeleteAsk`, the window's two layout
effects that re-seed and follow its record, its `save` upchit branch, `del`, `delNow`, `stay`). Also `state/store.ts
tryInputsBatch` and `runInputWrite`, `leavewar/inputgate.ts` whole, `state/inputgate-hook.ts`, `ui/caldrag.ts
commitChipMove`, `ui/inputedit.tsx reassignInput`, `ui/InputsCal.tsx` around its Delete key (`upchitDeleteAsk`). The
evidence sheet with the roll-call: `raptor-port/docs/handpass/2026-10-18-upchit-sheet-leave-cut.md`. The area rules:
`.claude/rules/decisions/inputs.md`, `.claude/rules/decisions/leave-war.md` (short lines; a ruling's full row:
`grep -h '^| D1023 |' .claude/decisions-full/*.md`).

**The promise — D1023, copied from its full row:** "Before an upchit moved later or deleted gives a downchit its days back,
the upchit sheet also lists each leave and each bid of his that the days given back will cut, one line each, before
anything changes; nothing about the cut itself changes. Applies to D999's move (the window, the table and the calendar
drag) and D1022's delete (the window and the opened day's Delete key). The line is worded from the Leave War's own warning
for that cut."

**How it was built (the builder's account — check it, do not trust it):** the door's own save is tried and thrown away
(`dryRun` → `tryInputsBatch`), with the Leave War gate saying each leave cut and each bid replaced to a listener
(`gateCuts` / `hearGateCuts`); the lines are kept only if the try would have gone through. A tried save puts the inputs
back as NEW objects, so: the asks re-read their plan off the lists after the try; an open input window is re-pointed to
its record's new copy, flagged `INPEDIT_REFOUND` so its re-seed effect keeps what was typed (on the Inputs page the
window's own "follow" effect already does this; off it — the schedule's dialog — only the flag does).

**The finder's brief (verbatim, the bug-check order §4):**
> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

**Questions to answer explicitly:**
1. Does the thrown-away try leave ANYTHING behind? The Leave War's store (a replaced bid, a notice), its absence index and
   grid, the change history / edit log, the "just added" flash, a pending mark or lost sign-offs on a published day, a
   saved row (the row writer), the undo history, the bell, a passing note, the week stash, validation state.
2. Every holder of an input OBJECT across the try: the open window (both modes), its sheets' state (`upConf` effects and
   leftovers, `medConf`, `oilConf`, `swap`), `MEDMOVE`, `OILWAIT`, `OILASK`, an opened day's list, the Medical tab, the
   DocViewer — does any act on a stale object afterwards? An input window open on ANOTHER input while the calendar's drag
   of an upchit runs its try.
3. Every door that gives days back — the window's Save of a later date, its Delete, the calendar's drag, the opened day's
   Delete key, the schedule's reassign (can it ever give back?), the Inputs list on a desktop, the Medical tab — does each
   list the cuts, and does each list only those?
4. Is every cut the gate can make said (both kinds of leave cut — whole day and half day; a leave filed for several of
   which he is one; a bid of his own — "your" — and another's), and nothing that is not a cut (leave over recorded work)?
   Can a line be said twice?
5. Does the try ever run a write the real Save would not (a different draft, removals, the OIL path, `normalizeInputDraft`
   mutating the draft), so the sheet and the save could disagree?
6. State table: the upchit sheet with cut lines × each event (Save, Cancel, Escape, a click outside, the record changed
   behind it, a second ask).
7. Cost: the try runs a whole save each time the sheet opens on a give-back — anything slow or repeated on a render path?

**A claim is a finding only with a concrete failure, its cause and its exact fix (D489)** — step-by-step fix
instructions. Give explicit negatives ("I checked X and found nothing"). Rank by severity.
