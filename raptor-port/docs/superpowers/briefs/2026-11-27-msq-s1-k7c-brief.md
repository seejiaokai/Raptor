# Section 1 (the guard rail) — step K7c: a window opened on another squadron stays held when a landing brings his own back (chat 204, 27 Nov 26)

**Found by K7's builder (report `2026-11-27-msq-s1-k7-report.md`, finding 2). Answered by the coordinator from the
typing-hold rule (`src/state/typing-hold.ts`, its head): a window opened on one squadron is never made live on, nor
saved into, another.**

## The case

1. Hunter, 142's admin, holds Plan of 149, has 149 picked, and has an Input window open on 149's Inputs.
2. Saber lowers Hunter's Plan of 149 to View. That is a change he did not make, so the window is no longer on a page
   the squadron in view offers. It is out of reach and does not count (D2627 A7).
3. Hunter taps a 142 bell line that opens his Inputs, or presses anything else that brings his own squadron back
   through the page door.

The door passes, and the landing enters 142. **From the code, the 149 window may then be live on 142's Inputs.** It
must instead stay held:
- the band the typing-hold rule gives a window open across a move, with Close;
- its Save, Add, Delete and the rest doing nothing;
- never live, and never saved into 142.

First read the code and the tests that hold this today (`src/ui/InputWindow.tsx`, its band; `state/typing-hold.ts`;
`state/store.ts heldWindowBand` or `heldWords`; `ui/msq-fix-sched-windows-midnight.test.tsx`; `ui/msq-pick-windows.test.tsx`).
Then **press the case** in a test.
- **If the window is already held** (its open-time squadron is remembered and the band shows): the test is a pin.
  Say so, and nothing else changes.
- **If it comes live:** that is the fault. Fix it in the smallest place that keeps the window's own open-time squadron
  (the Input window already remembers it — `pageSqn`), so the band shows and every control is dead.

Which band wording applies is read from the rules already built:
- the generic "This change could not be saved." for a change he did not make;
- the pick's "This is 149's. You picked 142 — close this to go on." if the landing counts as his own press.

The landing is his press (byPick true), so the pick's band is the likely one. Name the one the code gives and why.
**No new word is written.** If neither built wording fits, stop and report.

Also cover the same case through the Leave War window, if a war window can be open on 149 in the same state.

## Tests first, seen red (patch-file method), unless it is a pin

In `src/ui/msq-guard-doors-bell.test.tsx`, a new describe. The whole sequence is pressed on the real controls where a
control exists. The Plan lowered is made as the app's own way does it, the grant changed (see how K4–K7 tests lower a
grant). The assertions:
- the window still on the page;
- the band's words read from the code's own function;
- every control dead (`data-heldro`);
- a press of its Save changes nothing stored for 142 or 149;
- Close closes it.

## Checks and the rest

- The touched files, plus K4–K7b's guard files.
- The checker is on, so a raw state goes through the raw helpers (`src/test-support/raw-entry.ts`).
- `npm run lint:changed`.
- `npm run build` under the lock if `src` changed.
- No full suite unless `src` changed. If it did, run the full suite under the lock.

Do not commit, push, or edit `HANDOFF.md`, the plan or `OUTSTANDING.md`. Read source with shell tools. No `sed -i`.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-k7c-report.md`

The report says:
- whether it was a fault or a pin;
- what changed;
- which band, and why;
- every check's numbers.

End with the path and one line: is K7c whole.
