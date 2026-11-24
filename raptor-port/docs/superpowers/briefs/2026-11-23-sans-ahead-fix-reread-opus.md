# Narrow re-read of the SANS-ahead fixes — the fresh, blind Opus reader (chat 154, 23 Nov 26)

Brief: `2026-11-23-sans-ahead-fix-reread-brief.md`; read `bde8ef0a0..e64c78752` in a blind copy. Its test file, written in
the copy and not run there (no packages): `2026-11-23-sans-ahead-fix-reread-opus.test.ts.txt` beside this file — copy it to
`raptor-port/src/leavewar/sans-reread154-opus.test.ts` to run (R1 expected red; R2, R3 expected green). The host's summary of
its report, kept whole in substance:

## R1 — a published face drops a SANS card it went out with (= Astra's re-read #2)
State: Hex posted out as SANS from Fri 17; one offer for another man SANS all week and Hex on Sat 18; Sat 18 published (its
frozen copy holds both); then Hex's posting moved to Fri 24. The board's look at the issued Sat 18 (`SchedBoard.tsx` inside
`withDaySnap` → `sbSansPanel` with the frozen list) no longer draws Hex's card, while `sansAvailOn('rocky', Sat 18)` on the
same face still says yes and his puck's SANS line reads as issued (`faceattrs` from `snap.pa`). Rule D44 / D178. Cause:
`engine/inputs.ts sansFaceShown` asks today's `sansOnP` even on a frozen face (a frozen copy is already the day's own view,
via `sansDayView`). Fix: in `sansFaceShown`, after the SANS-type check, `if(inputsFrozenOn(at))return true;` — as
`sansAvailOn` does. Test: R1.

## What else it checked (no finding)
- The window and the gate agree (each man asked; "had and inside the old span" = "except holds him and covers the day").
  An admin's edit of a record a later posting change hid saves (test R2); a man taking himself out passes; Undo / Redo of a
  filing or of a delete of a hidden offer passes (R3); posting changes, "Undo post out", a run, a squadron move, an
  amendment or Unpublish write no SANS input with new days. **To tell him (not a bug):** extending a shared offer by a day
  one of its men is hidden on is refused (D2340), so a hidden man blocks extending the other man's offer until taken out.
- The `sansback` line: no door but the verified replay deletes one today; the `lw.postouts` exception is unused but harmless.
- A member's own SANS days: tick on, a tick joining an earlier stretch, untick (posting-set SANS too), same-day untick, the
  CAT change — the gate's recomputation matches each; a forged before-image is judged again against the saved row; no way round.
- Speed: nothing heavy added.
- **One check to make (not confirmed):** a day published with both men, then Hex hidden, where Hex is on the day only
  through the offer — his person-attribute record (`publish.ts dayPeopleAttrs`) may change too ("SANS yes → no"), reading
  2 pending for one posting move where D109 / D113 give one act one change; a `dayPendingItems` count after the move settles it.

## Tests it says are missing
The published face after a hiding (R1); an admin's edit of a shared offer hidden later, through `commitInput` and the gate
(R2); Undo of a delete of a hidden offer (R3); the pending count above; the allow side of the `sansback` delete (the Undo of
the posting change takes its line away).
