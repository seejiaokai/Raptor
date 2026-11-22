# The reshape plan's red team — the fresh Opus reader's report (blind; copy at `dc1368c27`)

Reader: a fresh Opus reader (D790), a background helper of chat 124, blind to Astra and Fable; brief
`2026-11-20-multi-sqn-b1-reshape-read-brief.md`; its own exported copy; finished whole. Read only; no tests run. The
report as returned:

---

No handoff block was pasted into this run, so there was nothing to ignore. Read-only throughout: I changed no file, ran no test and committed nothing.

# Findings, most important first

## H1 (HIGH): A1's stint window would be stored as a fake posting, and it outlives an Undo
**Failure.** Saber saves Ranger's move 142 → 149. With Piece D, `projectPeople` now gives Ranger `from`/`to` from his stint. `setPeople` (`leavewar/state/store.ts` ~2502, its "caught" rule) records any window "with no record behind it" into `postOuts` and saves it. Its own comment relies on "projectPeople emits no window". The results:
- **Admin → Users shows a posting that does not exist.** `postingPendingTag` reads `postOuts`/people `to`, so Ranger's row reads "posting out 16 Jul", then "posted out 16 Jul". 149's side gets a stored "posting in".
- **Undo of the move leaves 142's war wrong.** The stored record stays, so 142's war still ends him on 15 Jul. Weekends after that date drop out of his 142 window, which puts OIL at risk.
- **A later move back starts on the wrong day.** The stored window lies over the new projection.
- **The carry-over branch fights the stint.** `reprojectRoster` (`sync.ts` ~2575, `else if (ex)`) keeps the old in-memory window over the projection. A war already open when the move is saved keeps `to = null` (A1 not closed). After an Undo it keeps the stale 15 Jul.

**Cause.** §6.2 puts the stint in the posting window fields and says "Nothing in `leavewar/state/store.ts`".

**Fix.**
- Carry the stint in fields of its own (for example `stint.from`/`stint.to`), read by the grid's month filter and the A7 door, never by `postOuts` capture or `postingPendingTag`. Or exclude stint windows from the capture.
- Either way `store.ts` changes, so A1 waits for R1 to merge. Name this.
- Add tests: a saved move creates no `postOuts` row; Undo of a move gives 142's war his open window back in the same session; Admin → Users shows no posting tag on a moved man.

## H2 (HIGH): Rule 3's "ended in step with a move" lets a forged command end anyone's right
**Failure.** An admin of 142 and 149 (a Plan holder, or the master's bridge) forges one command. It moves Ranger (home row h9) and also sets `to`/`endedBy = h9` on Kestrel's Plan of 150. Rule 3 passes it ("whoever may make that move"). Rule 7 keeps `from` (`grantKept` compares only account, unit and level). Nothing limits `to`, so a back-dated `to` also rewrites what the bell's `adminThen` reads for past days.

**Fix.** The exemption holds only when all of these are true:
- the right's account is the moved man's account, as the rows stood before;
- `to` equals the save day (or that row's `from`);
- `endedBy` equals the row this command adds, removes or turns back.

Anything else is an ordinary change by an admin of the right's squadron. Add these cases to §4.4's table.

## M1 (MEDIUM): Rule 5 refuses an honest re-target of a move
**Failure.** Saber moves Ranger to 149, then that same day corrects it to 150. `setHome` replaces the same row h1 (`same`). Rule 5 ("removing or replacing a home row … while a right with `endedBy` = that row stays ended") refuses it. Before the reply to R2 comes in, Saber is shown the take-back words "Take the move back with Undo" — wrong, because he is not taking anything back.

**Fix.** Rule 5 applies only when, after the command, his squadron on that row's day equals his squadron the day before (no move is left). A re-target keeps the ended rights ended.

## M2 (MEDIUM): With `to = today`, a new squadron's first admin can never move into it
**Failure.** Saber makes squadron 150 with Hunter as first admin (Plan of 150). He then moves Hunter into 150 from tomorrow. `setHome` ends the Plan with `to = today`. On today 150 now has no Plan holder and no home admin (Hunter arrives tomorrow). `lastAdminBreach` refuses: "Hunter is 150's last admin. Make another admin of 150 first." Today's gate allows this move, because it counts home admins only.

**Fix.** Either end a right in the squadron he is joining at the move day (rule 4 already allows `to` = the move day; tell him this reading of D2203, "of other squadrons"), or have the last-admin check treat that gap as covered.

## M3 (MEDIUM): Undo of "+ New squadron" would be refused
**Failure.** The Undo removes a place row dated today. Rule 1 calls that a difference on a day already begun. It also removes the only Plan holder, which Piece C counts as a breach. `unit.add` is not on the timeline's not-undone list, so today this Undo works (D148).

**Fix.** Rule 1 and `lastAdminBreach` skip a squadron the command removes whole. Its removal stays judged by "a unit removed while still named" and the master-only rule. Add a test.

## M4 (MEDIUM): The posting pass over every squadron (A5)
- **Joined to someone else's command.** When `runPoOutcomes` runs inside another command's reducer it joins that command and is judged as its maker (`sync.ts` ~2785; the comment says a posting made today runs inside the Post out command). If a 149 posting is due at that moment, a 142 admin's Post out — or a member's command — carries a 149 archive, delete, `lwx.*` writes and 149 bell lines. Sections 8, 7 and 7e refuse it, so the whole action fails with "That did not save". Fix: foreign postings run only in the pass's own command (`own`); when joined, defer them.
- **Speed.** The pass runs on every Raptor notify (`raptorSubscribe`). `readForeign` scans every key of a squadron's war for each man. Fix: run the foreign half only at boot, on the midnight clock and when a foreign war's stored postings change, and read only `profile:` rows. Add it to C10's measure.
- **Delete outcome on the wrong war.** The pass's delete calls `applyDelete` and `forgetPersonFrom` on the loaded war. Fix: name that a foreign delete goes through `deleteOnForeign` / `deletePersonOnWar`. Its bell recipients need a "schedulers of squadron X" reader, which lives in a core file, so schedule it in phase 1.

## M5 (MEDIUM): B1's writes to another squadron's planning calendar have no safe store and no bounded gate rule
**Failure.** The scheduler store diffs only the planning records of the squadron in view (`inView`). Its apply refuses another squadron's planning record (`sched-commit.ts` ~331). So `plan/<unit>@pp:` writes inside the delete have no enlistable store to roll back through, and a refused delete is left half done. The gate allowance "section 7 allows it" sits in `perms.ts` (core) but is not in any phase. As worded it would let a person delete rewrite another squadron's notes freely (compare fix read 12's fault B).

**Fix.**
- Give foreign planning rows a store like `foreign.ts`.
- Write the gate line in core phase 1 or 2, allowing it only when (a) the delete really happens (`personDeletedHere`) and (b) each row's after-image equals its before-image minus that man's id (removed only when it becomes empty).
- Add a test: a refused delete leaves the other calendar untouched.

## M6 (MEDIUM): Callers the plan misses, and the compiler net has a hole
**Not moved by the plan:**
- `sync.ts` ~1416 `oilOpenOn` uses `inputBelongs(row, unit)` on the input's first day. A duty from 14 to 17 Jul across Ranger's 16 Jul move puts the 16–17 Jul OIL questions on 142's list and none on 149's. It should be judged per asked day.
- `notices.ts noticeLeftBell` scans home rows itself twice (~701, ~712).
- `perms.ts restoredDayHolds`.
- `sync.ts atWarHome`, `ownSchedulerIds` and `holidayLeft` read today.
- `perms.ts` ~1243 reads grant rows and is missing from the 17-site list.

**The hole.** Engine files are typed `any`. Once a default is removed, a caller passing `undefined` still compiles, and `atOn` with no date silently returns his *first* home, his old squadron.

**Fix.** List these callers. During the contract step, add a check inside `homeOn`, `rosterOf` and `inputOnDay` that refuses anything but a valid date in tests and development.

## L1 (LOW): "A master (never counted)" is ambiguous
Today `lockProblem` and the gate count Saber as an admin at home in 142. If the builder reads §5.4 as "never counted at all", Suspend, Demote, Archive or Delete of Hunter is refused, because 142's admins are only Saber and Hunter. Write it as: counted at home, never as a Plan holder.

## L2 (LOW): The midnight swap (A2)
- Name what fires at midnight: tie it to `installPostingClock`, not to his next click.
- At sign-in the swap's passes stay off his Undo list only because `endUndoSession` runs afterwards. Check whether they land in his Undo list at midnight.
- "The squadron the session entered" must mean the home recorded at entry, never the pick. Otherwise step 5's master pick, which the plan builds on `enterSquadron`, is pulled back to his home on every notify.

## L3 (LOW): A7's backstop should not refuse removals
It should judge only puts. As written it refuses deleting a stale 142 record on a day that is now 149's, so a 142 admin's Undo of his own earlier cell is refused (D148).

## L4 (LOW): Re-link should not count ended rights
Re-link counting ended rows gives the false words "This sign-in holds a right in 150". `pidFrom` already guards the past. Count ended rows for G5 only.

## L5 (LOW): Rule 4's scope
Scope rule 4 to the men and accounts the command touches. Otherwise one bad stored row blocks every later command.

## L6 (LOW): Own-page setting writes
Writes from own pages still go through `storedKey(UNIT)` while reads use `pageUnit('own')`. Harmless until step 5, but name it.

## L7 (LOW): Two phase-2 helpers share a file
`state/persist.ts` is touched by helper "roles" (the mapper line) and by B1 (reading other squadrons' planning rows through `hydratePlan`).

# A safer cut
Piece B could close R2, R3 and R4 without dated grants:
- **R3:** let the timeline vouch for a grant put back by a verified Undo whose same restore removes the move's home row.
- **R2:** refuse the take-back at the door, with the gate backing it.
- **R4:** refuse any grant standing for an account whose man has a home change from tomorrow on.

This leaves alone the 17 grant readers, the bell's `adminThen` and the re-dating hooks, and M1, M2 and H2 do not arise. The cost: batch 4's months-ahead transfer would build `to`/`endedBy` then.

# Checked and found sound
- The arithmetic adds up: 21 + 6 + 1 + 7 = 35, and each piece's count matches.
- Undo and Redo of a move keep `from` (`restoreRedated`/`grantKept` ignore `to` and `endedBy`). A verified replay compares whole images.
- Gate 7c judges a stamped `u` (C3) through `levelInForce`, so a forged stamp is refused.
- No `.js` file calls the resolvers. The test-support import guard and `switchUnit`'s single caller are as the plan says.
- A person delete drops ended rows (`dropGrantsOfAccount` filters by account only).
- The pass's own command is a projection and is still judged by `lastAdminViolation` for `lw.postoutRun`.
- The year-wrap rule matches what `inputsOn` lands.
- C4's day-frozen roster agrees with `issuedRoster`.
- Nothing else new a person sees beyond what §11 names — except H1's posting tag on Admin → Users.
