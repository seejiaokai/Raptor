# The fresh, blind Opus read of the second round of fixes — multi-squadron batch 1's full check (18 Nov 26)

Head: a fresh Opus agent (Agent tool, model opus, a new agent, not the check lead), brief `FIX2-READ-BRIEF.md` (saved
beside this report as `2026-11-18-multi-sqn-b1-fixread2-brief.md`), working only in the exported copy of `4934adaa4`
(app code = the second round of fixes, on `34a07036a`) at `scratchpad/fixread2/copy`, blinded as for Astra's read (the
walk's results, the evidence sheet below its job-5 heading and every earlier reader's report removed); blind to Astra's
read of the same change (finished 09:16:16, before this one started; kept outside the copy, and the agent told not to
open any `astra*` file) and to the security read (started after this one ended). Started 09:16, finished 09:27 on
18 Nov 26 (the reader's own clock). Its proof tests stayed in `scratchpad/fixread2/opus-proofs/` (linked into the copy
as `raptor-port/src/__proof_opus__/` while it ran, the link removed before the security read), never in the app. Saved
as it came.

---

Started 09:16, finished 09:27 on 18 Nov 26 (my own clock). I read the brief and the second-round fix patch, then the code around each fix in the copy. I opened none of the forbidden files, other readers' reports or the walk. No handoff block was pasted into my context. I changed no app file. Proofs are in `C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\4b825657-ab4e-4e7a-aba0-42051bdae95b\scratchpad\fixread2\opus-proofs\`.

# Findings, ranked by consequence

## F1 (medium): the last-admin lock at the gate misses a home move. A squadron's only admin can be moved out, leaving it with no admin from tomorrow (promise 6). Proved red.
- **Setup and action:** the demo, signed in as the master (Saber). Move Kestrel, 149's only admin, to 142 with the "set home" command (a console or forged command for now; no screen offers it yet).
- **What happens:** the move is saved from tomorrow. From tomorrow 149 has no admin of its own who can sign in.
  - Expected under D2184 Q10 and promise 6 ("a squadron with an admin at home who can sign in keeps one … for every actor, the master included"): refused, in words.
  - From that day the lock no longer protects 149 at all, because "a squadron with none before is not asked".
- **Cause:**
  - In `raptor-port/src/state/perms.ts`, homeUnitViolation calls adminLockBroken only inside `if (img)`, and `img` exists only when the command changes an account row. A home-only command never reaches the lock.
  - adminLockBroken also judges each admin's squadron on today alone (`homeBefore(pid, today, …)`). A home row dated tomorrow cannot fail it even when an account row rides along.
  - The screen-side setHome in `state/units.ts` has no lock check either.
- **Fix, step by step:**
  1. Run the lock whenever the command changes accounts or homes. When there are no account changes, use the unchanged account list for both sides.
  2. In adminLockBroken, judge the squadrons on every date the command could change: today, plus each `from` date of the home rows it changes, both before and after.
  3. For each such date, take each squadron that had an able admin at home on that date before the command. If none is left after it, refuse.
  4. Give setHome the same check in words (the lock's sentence), so the step-5 screen inherits it.
- **Introduced by these fixes?** No. The gate lock is new in this round, but it only ever covered account changes. It is a gap in promise 6's coverage, not a regression. The screen door is step 5's; the gate gap is this round's promise.
- **Proof:** `p2-last-admin-home-move.test.ts` ran **red**: setHome said ok, and 149 has 0 admins tomorrow.

## F2 (low, not proved): a pass the gate refuses for a reason nobody foresaw is held for the session in silence
- `PO_REFUSED` (`leavewar/sync.ts`) is never read by postingHeldNote or poHeldReason. Such a posting stops running until the next reload, and neither the posting sheet nor his Admin → Users row says why. It still reads as an ordinary posting.
- Promise 2 does not promise words for this case, so this may be by design.
- **Fix if wanted:** have postingHeldNote return a fixed sentence, for example "This posting could not run — it will try again when the app is next opened", when any of his keys is in `PO_REFUSED`.

## F3 (low, not proved): the day-by-day home check lets a man with no squadron be given one dated in the past
- In homeUnitViolation, `if (was === now || was == null) continue` skips every date where he had no squadron, including dates before today. The promise is "may be given one from today".
- It cannot be reached in the demo: a man with no row falls back to 142, so `was` is never empty. It can be reached on a shared store with no seeds (the future database), through a forged home row dated in the past.
- **Fix:** when `was == null` and `d < tomorrow`, refuse unless `d` is today.

## Note on two loosened tests (not a defect)
`m4page.test.tsx` now accepts "posts out" or "posted out" by a pattern. The test can no longer tell if the wrong tense is shown. A fixed clock and the exact sentence would keep it a real check.

# Explicit negatives, promise by promise

1. **A master is never deleted.**
   - Admin → Users' Delete (deleteProblem then deleteAccountProblem) and the posting sheet's Delete (postOut, then postOutProblem with masterDeleteProblem) both refuse.
   - A Delete posting saved before he became master is held on its date: poHeldReason, then deleteBlocked, then masterDeleteProblem. It is said once and the others run.
   - I searched for every writer of a delete (applyDelete, dropAccountOfPid, setPostOut) and found no other door.
   - Order: another squadron's admin deleting Saber hears "He is 142's…" before the master sentence. That is still a refusal in words.
2. **Retry, then hold.**
   - Bounded: the retry happens once (`PO_RETRIED`), then one posting at a time, and each single run that is refused is held.
   - The queued branch calls `refused()` before `settle()`. This is safe because the command's apply calls `settle()` first.
   - A held key includes the outcome and date, so changing the posting frees it. A world swap on sign-in cannot lose a posting or run it twice; `markPostingDone` guards repeats.
   - A successful single run's notify does not re-run the keys still held.
   - Proof `p1-two-admins-one-day.test.ts` (**green**): Overseas Sqn postings for 142's only two admins (Saber and Prowler) due on one day. Saber's runs, Prowler's is held inside the same pass, because poHeldReason is asked again one posting after another inside the command, and 142 keeps an admin.
3. **The first write of the account list.**
   - On the first write nothing is written over a row never stored.
   - `ACCOUNTS_STORED` is reloaded on rollback through accountsLoad.
   - The seeded rows written out compare equal to the seed: same keys, same order as accountRow. So a plain admin's first write is not read as changing 149's accounts.
4. **The posting-pass check.** `posted` is a map of each man to his outcome, filled only from done marks that changed in this command. A posting that waits is never in it, and only Overseas Sqn expects his account switched off.
5. **The whole-list comparison** goes by account id, so the order a list was written in does not matter. A renamed account is judged as changed. An extra account for a 149 man is refused.
6. **The lock at the gate on account changes** matches the screens' own lock rule (same "able" test, same squadron), so I found no false refusal of a 142 admin's ordinary work.
   - Undo goes back in order, and an Undo refused by the gate reads "That couldn't be completed just now", never the gate's words.
   - The gap is F1.
7. **Day-by-day home judgement.**
   - The dates tested are complete: his squadron changes only on a row's start date.
   - Rows in the past are refused, and so are rows on the same date.
   - A plain admin cannot move a man into another squadron at all (section 6 asks both units), so an Undo of a move by a plain admin cannot be refused falsely.
   - A delete never touches home rows.
8. **History lines.**
   - A mission-role line is now filed by its person only when the roster has him; a deleted man stays in the roster as a hidden record.
   - The Undo or Redo of a Quals change to one man of 149 is filed with 149.
   - A change that mixes the roster with other records stays with the squadron in view. Undo of archive, delete and postings is not offered (D350), and an account-only Undo writes no line, so no mismatch reaches the history.
9. **"Seen" per squadron.** An old-shape row reads as every squadron's. Marking writes only the squadron in view and copies the old cursor to the rest. The gate's own-row check is unaffected by the new shape. The history in memory holds only the squadron in view's lines.
10. **The words.**
    - Archive, both Restore doors and the Quals edit say "He is 149's. Only an admin of 149 can change him." first.
    - Members still get "your own row" only. The master or an admin with a right there gets no refusal.
    - Archive's refusal now says "That did not save", never the gate's words.
    - The per-squadron lock sentences name his own squadron. Where the whole app would be left without an admin, the old sentences stay.

Unfinished: I did not prove F2 or F3 with tests, and did not examine the developer bridge's raised role.
