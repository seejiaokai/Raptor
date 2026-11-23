# The read of the refusal's last wording fix (A5) — the fresh, blind Opus reader (commit 5d964e088)

Saved as it arrived (chat 149's helper, 23 Nov 26 ~08:10 MPST). `git show` only; nothing written to the repo, nothing
built; copies of four source files to the scratch folder for searching.

## Findings
None that meets the brief's bar. Each case worked against 5d964e088:
1. The step puts the mark back over a right given since: `masterRightLeft` returns that right; the step does not write
   its row, so `outOfBandWords(grant key)` runs with no rule; the right's row carries Kestrel's barrier from his remote
   write, so Kestrel is named; a right Saber gave himself in this session names nobody. Correct.
2. The step puts a right back under a mark set since: the step writes the right's row, so the account-row path runs with
   `setsMark`; `writerWhere` finds the newest command that turned the mark from not-set to set — the one standing now; a
   later rename by Kestrel is never picked (its before-image already has `master: true`). Saber's own command from another
   session gives "You changed this somewhere else…"; his own in this session names nobody. Correct.
3. A mark-setter older than the step: no case found — every way the step could have run under a standing mark is refused
   at the gate (a master admin holds no right; `setMaster` and `saveAccess` drop today's rights in the same command).
4. Another person's same-device command passed over as "his own": no — `endUndoSession` clears the list at every sign-in.
5. An old barrier naming the wrong person: no — right ids are fresh (`newId('g')`).
6. Pass or refuse unchanged: `masterRightRefusal` returns a sentence exactly when `masterRightLeft` finds something.
7. Other refusals unchanged: `outOfBandWords`' three other callers (timeline.ts 851, 852, 947) pass one argument; with no
   rule the body is as before.
8. No crash: `masterRightLeft`'s new shape has one caller, updated; `?.master` reads guarded.

Seen, not counted (the stated design, older than this commit): when the mark was his own step in this session, the
refusal reads "Something else changed this after your action — it can't be undone now." — the brief's "names nobody",
what the Opus-2 test asks; the old code gave the same sentence.

## Read
The diff 781b033de..5d964e088 under raptor-port/src with the new tests; at 5d964e088: timeline.ts (ingest, outOfBand,
trackExpectation, writerOf / writerWhere, outOfBandWords, the conflict checks, standingConflict, globalUndo / globalRedo
order, sayBlocked, abandonForkedRedo, endUndoSession); undo-wire.ts (masterRightRefusal, the restoreRefusal wiring,
standingRightKey); accounts.ts masterRightLeft; units.ts (setGrant's id, grantRowHolds); units-model.ts grantHolds;
command/commit.ts commandStream; store.ts's sign-in clearing Undo; data-model.md's UnitGrant row.

## Tidiness notes (filed, not fixed — D489)
1. `masterRightLeft` returns the first right that holds, in row order; with two standing (his own and another's) who is
   named depends on row order — a line saying either one blocks would make it plain.
2. The new tests cover only Undo — none for a Redo through either path, or for "You changed this somewhere else…" through
   the mark path.
3. `outOfBandWords`' comment in the shared timeline describes one account case; the general rule could stand there, the
   account example in `undo-wire.ts`.
