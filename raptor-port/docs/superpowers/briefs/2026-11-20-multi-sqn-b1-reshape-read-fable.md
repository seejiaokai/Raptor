# The reshape plan's red team — Fable's report (blind; copy at `dc1368c27`)

Reader: Fable (D2238 — his word, under D903, for a big open-ended plan), a background helper of chat 124, blind to Astra
and the fresh Opus reader; brief `2026-11-20-multi-sqn-b1-reshape-read-brief.md`; its own exported copy; finished whole.
Read only; no proof tests run. The report as returned:

---

# Fable's blind read of the reshape plan — multi-squadron batch 1

Read only: the plan, the fault table, the rulings named, and the code by slices. I ran no proof tests; every finding below is from reading the code, with the lines named. No handoff block was pasted, so there was none to ignore. I changed no file.

## Findings, most important first

**F1 — HIGH — A1 writes a posting nobody set into each war's saved data (Piece D).**
- Failure: Kestrel's move 142 → 149 is saved. 142's war now saves a posting-out window for him, and 149's a posting-in. Undo the move the same day and both stay. His Admin → Users row reads "posting out 21 Nov", then "posted out", and the Post out sheet opens on him.
- Cause: the plan has `projectPeople` set `from`/`to` from his stint. `leavewar/state/store.ts setPeople` (l.2501–2504) records any window that arrives with the roster into `postOuts` and persists it; its own comment says "`projectPeople` emits no window". After the first capture a stored window always exists, so "where the war holds no stored window" is never true again.
- Also: a war `Person` holds one window, so the plan's "two stints, two rows of months" (§6.4) has no shape. An existing stored posting window dated past the move lies over the stint, so A1 and A7 survive for that man at the door.
- Fix: carry home stints as their own never-stored field, and make the window readers use the stint cut by the posting window. That needs `setPeople` to skip it, so A1 must be sequenced after R1's file is free, not "nothing in store.ts". Add both tag changes to §11's mock-up.

**F2 — HIGH — After the midnight swap, Undo writes his old squadron's war or Tracker step into the new one (A-iv).**
- Failure: at 23:50 he places a bid in 142's war. At 00:00 the page swaps to 149's war. He presses Undo: the 142 step's images are restored into 149's loaded war, and the gate allows it because he is now at home in 149.
- Cause: the plan keeps the Undo list and says his old steps "wait there, as `inUnitView` already treats them". `undo/timeline.ts` l.523 passes any step whose ids name no squadron, and war and Tracker ids name none (`perms.ts` 7b and 7f comments say so). Today sign-in clears the list after the swap, so this is new.
- Fix: stamp each step with the war and Tracker squadron loaded when it was made, and have `inUnitView` require them to match (step 5's pick needs this too). Or clear the list at his own move's midnight, as sign-in does. Add a red test: Undo of a war step and a Tracker step across the swap.

**F3 — HIGH — The foreign posting pass (A5) is refused by the gate, and its safeguards are not carried over.**
- Failure: Saber signs in on 149's posting day. The pass writes 149's posting as `lwx.profile` plus people, account and bell changes. `postingPassViolation` builds its "posted" list only from `lw.postouts` (`perms.ts` l.1121–1129), so the people change is refused and A5 stays open.
- Cause: Piece D lists "the one gate line in 7b" as its only core change. Also missed: the saved-posting check reads only the loaded war's row; the "another squadron's man" check compares with the loaded war (l.1135–1141); the bell check accepts any admin, not that squadron's (D2194).
- Fix: add to the core's Piece D work — the pass check reads `lwx.profile` rows, verifies each against that squadron's stored posting, requires the man's home to be that row's squadron, and requires each line's reader to be an admin of it. Helper "war" cannot go green before this, so order it.

**F4 — HIGH — The acceptance-mark callers are given the wrong question (A-iii).**
- Failure: a leave starts on a 142 day and runs past his move. Loading 149's week (his own page after midnight, or a pick later) deletes that input's accepted mark, because no row for it stands on 149's week. 142's published day then shows a pending amendment nobody made.
- Cause: the plan sends `store.ts` l.686 and l.1114 to `inputsTouching`, and `holderbase.ts` l.209 to "per day landed". All three rewrite `acc` on the shared input for "this week's own requests". Under "touches", one input is two squadrons' and each load undoes the other.
- Fix: these three and `overlay.ts` l.430/481 ask `inputOnDay(r, unit, its first day)`, the day a request lands, as today. `store.ts` l.171 asks per protected date. State the rule: a body that writes never iterates `inputsTouching`.

**F5 — MEDIUM — B1's strip is refused by section 7.**
- Failure: 142's plain admin deletes a man who is named on 149's planning calendar (he was 149's before). The delete now writes `plan/u149@pp:` rows and is refused whole, "That did not save". Today it succeeds.
- Cause: the plan says "the gate's section 7 allows it". `unitRecordViolation` (l.1278–1292) reads the squadron off each id and needs admin there.
- Fix: a core exemption like the one for a deleted man's rights: a plan row whose only change removes a man this same command deletes. Red-first test with a plain admin.

**F6 — MEDIUM — A new squadron's first admin can never be moved into it (Pieces B and C together).**
- Failure: the master makes 150 with first admin X (home 142). Moving X to 150 ends his Plan today; his home is 150 only from tomorrow. The last-admin rule finds 150 with nobody today and refuses.
- Cause: `to = today` leaves the rest of the save day uncovered.
- Fix: a right in the squadron he moves into ends on the move day, not the save day (the "old rights" of D2203 are other squadrons'). Add the case to the lock table. See F12, which removes it.

**F7 — MEDIUM — Undo of "+ New squadron" would be refused twice over.**
- Cause: rule 1 extended to places reads the removed place row as a difference on today; `lastAdminBreach` sees a squadron with a Plan holder before and none after.
- Fix: both skip a squadron that does not exist after the command. Add Undo and Redo of `unit.add` to §4.4 and §5.4.

**F8 — MEDIUM — A2 closes only after a first refused action.**
- Failure: he sits on the Leave War across midnight with nothing due. Nothing calls `notify()`. At 00:05 his first tap is judged against 142's war and refused; only then does the page swap.
- Fix: run the check from the existing midnight wake (`boot.ts installPostingClock`) and on the page regaining focus. The proof must not call `notify()` itself.

**F9 — MEDIUM — The held Tracker rebind can hold for ever.**
- Failure: an unsaved chart edit at his move's midnight. The Tracker stays on 142; every save is refused by 7f because he is 149's now, so it never becomes "clean".
- Fix: the plan must say the edit is discarded at the swap, with words shown to him. That is a new thing on screen and needs a drawing first (D1625). Also `boot.ts` l.90–93 holds the Tracker's wiring but belongs to helper "own pages" — a collision with helper "session".

**F10 — MEDIUM — The OIL answer list is a missing caller.**
- Cause: `leavewar/sync.ts oilOpenOn` (l.1416) and `holidayLeft` use `inputBelongs(row, unit)` with no day. No list in the plan names them.
- Failure: for a duty across a move, 149's schedulers are never asked for 149's days, or under "touches" both squadrons are asked for every day.
- Fix: filter each asked day by `inputOnDay(row, unit, that day)`. Name it in helper "war"'s brief with a row in the behaviour guard.

**F11 — LOW — smaller gaps.**
- Rule 5 says "removing or replacing" a home row. Re-pointing tomorrow's move from 149 to 150 the same day is honest today and would be refused. Say "changed back to the squadron he is in the day before".
- Rule 4 must judge only rights the command writes and rights of men whose homes it writes, or one old row blocks every command.
- `engine/editlog.ts` l.449 and `state/changelines.ts` l.635 read a man's squadron with no day and have no A-i owner.
- `home.set` in the command table lists a grant delete; it becomes a change. Update `data-model.md` §11.
- A posting of a 142 man who is 150's only Plan holder is held with 150's words on 142's page, where 142's admins cannot fix it. Tell him with §14 item 2.

## F12 — A simpler cut of Piece B (option, needs his nod)

Store no `to` and no `endedBy`. Make "a right holds only inside the home stint that contains its `from`" a reader rule in `holdsOn`. A move then writes no grant row.
- Gone by construction: R2 (no answer needed from him), R3, R4, rule 3's special case, rule 5, and F6.
- Cost: rights end at the start of the move day, not the moment the move is saved. Tests pinning "gone on save" change, and the "tomorrow window" refusal stays for new rights. This changes built timing, so he should be told.

## Order and split

- Helper "war" depends on F3's gate work and on store.ts for F1; neither is in its phase.
- B1 depends on F5's core change.
- Otherwise I found no two phase-2 jobs sharing a file, apart from `boot.ts` (F9).

## Checked, nothing found

- Undo of a move under Piece B: the restore's re-dating keeps the right's day (`restoreRedated` reads account, squadron and level only), so the bell's retired lines stay as fix reads 7–12 pinned.
- `adminThen` with `to`: same answers as deletion on the move day and after an Undo.
- `notify()` already defers inside a command, so the swap never runs inside a reducer.
- The landing in `overlay.ts` is first-day by nature; no latent fault there.
- `creditable` and the OIL credit sweep already read the squadron by day.
- Engine verbatim bodies: the plan touches only the build's own lines.
- K4/B5, C8, C9, R6, A4: no objection from what I read; not traced in depth.
