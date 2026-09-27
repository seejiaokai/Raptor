# Red-team brief — the `[POST-OUT-OUTCOMES]` plan (round 1), 27 Sep 26

You are an independent reviewer of a PLAN, before any code is written. You did not write it (Opus 5.5 did). Another
reviewer from a different provider is reading the same plan at the same time; you will not see each other's report.
**Read-only: do not edit any file in the repository** — except the ONE report file named at the end.

## What to read (live files — read them, do not rely on this brief's summary)

1. **The plan:** `raptor-port/docs/superpowers/plans/2026-09-27-post-out-outcomes-plan.md` — the whole file.
2. **The approved design (D299, trimmed D300):** `raptor-port/docs/mock/post-out.html` and its pictures in
   `raptor-port/docs/mock/img/post-out/`. The script that drew them: `raptor-port/scripts/handpass/am/mk-post-out.mjs`.
3. **The owner's rulings** (the plan must obey every one; a later ruling wins over an earlier one — D90):
   - `.claude/rules/decisions/how-we-work.md` — **D229, D280–D302**, and the accounts rulings they build on: **D165,
     D166, D200, D201, D202, D204, D214, D217, D223**.
   - `.claude/rules/decisions/scheduler.md` — **D45, D103, D149, D175, D186, D218**.
   - `.claude/rules/decisions/oil.md` — **D48, D142** (OIL from the latest published version).
   - `.claude/rules/decisions/leave-war.md` (its §Settled and §Architecture — the war's roster projection, Show SANS).
   - `.claude/rules/raptor-executor.md` (how the build must be done) and `.claude/rules/bug-check.md`.
4. **The backlog item:** `OUTSTANDING.md` — search `[POST-OUT-OUTCOMES]`.
5. **What the database will be built from:** `raptor-port/docs/data-model.md` §3 (`Person`, `User`, `LeavePersonProfile`),
   §10, §11 (the permissions table — the plan edits it).
6. **The code the plan changes** (read what you need): `raptor-port/src/engine/people.ts` (`ID_BY_CS`, `nameToId`,
   `whoId`), `state/roster-add.ts`, `engine/slots.ts` (`setSlotVal`, `renameCallsign`, `unacceptInput`),
   `state/accounts.ts`, `state/perms.ts`, `state/auth.ts`, `command/actor.ts`, `command/commit.ts` (multi-store enlist
   and rollback), `undo/timeline.ts` (why a people change is not undoable and blocks earlier entries),
   `state/people-settings-commit.ts`, `state/store.ts` (`resetSession`, `loadWeek`, `applyWeekModel`, `initStore`),
   `engine/weekstash.ts` (`stashEditDays`), `engine/drafts.ts` + `engine/publish.ts` (`rowsLeftOut`, `attrsOf`,
   `setSign`, `signPeople`), `state/plan.ts` (`PLANPUCKS`), `ui/inputedit.tsx` (`dropInputRow`, `applyMedPlan`,
   `withRemarksTail`), `ui/UsersPanel.tsx`, `ui/AccessScreen.tsx`, `ui/QualsPage.tsx` (the Archived list), `ui/Shell.tsx`
   (`#roleBadge`), `ui/Drawer.tsx`, `leavewar/sync.ts` (`runPoArchive`, `restoreArchivedPerson`, `reprojectRoster`,
   `creditable`, `availableFor`), `leavewar/state/store.ts` (`setPostOut`, `setPeople`, the keep rule, `postOuts`),
   `leavewar/state/raptorRoster.ts`, `leavewar/ui/BidPicker.tsx` (the PO controls, `PostOutSheet`),
   `leavewar/ui/SelectSheet.tsx`, `leavewar/ui/Matrix.tsx` (`rowInWindow`), `leavewar/ui/OilTracker.tsx`,
   `tracker/peoplewire.ts`.
7. **The other chat's posting code the plan builds on (PR #444, not merged):** read it from its branch —
   `git show claude/absence-record-d147-af6a50-c451ac:raptor-port/src/leavewar/sync.ts` (search `postOut`,
   `undoPostOut`, `restoreArchivedPerson`, `runPoArchive`, `archivedBy`) and the same branch's
   `raptor-port/src/leavewar/ui/BidPicker.tsx` and `raptor-port/src/leavewar/state/store.ts` (`postingProblem`). (On
   Windows Git Bash set `MSYS_NO_PATHCONV=1` for `git show <rev>:<path>`.)
8. **How this project checks work:** `raptor-port/docs/bug-check-order.md` (§2b, §5, §6, §7, §8).

## What NOT to report

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

## What to do

> Do not merely review the plan's text. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

Answer, specifically:

1. **The rulings.** Does the plan obey every ruling above, as he worded it? Name any it misreads, narrows or
   contradicts, and any it FORGOT. Of the plan's "On the look card" items, is any really his to decide BEFORE the build
   (a product fork the build would bake in) rather than a call the agent may make and show him?
2. **The delete — completeness.** Every place a person id can live on a day or in a store (the live week, the stash, the
   parked plans, the sign boxes, `oild`, the planning calendar, inputs, the Leave War's records, a day template, a
   copied day, a published version loaded onto the working copy, undo/redo): does §4.3 reach each one on every day on
   or after his date, and leave every day before it alone? Is the "belt" (`rowsLeftOut`) sufficient, or can he come back
   another way (a week load, a boot with no stash, an undo, a redo, an input re-landing, the OIL pass, the ALL AVAIL
   crowd frozen on an issued day, a Leave War re-projection)? Is "the later of his date and the real today" right, given
   the scheduler's demo clock (13 Jul 26) and the war's real clock?
3. **The delete — atomicity.** Is ONE command over people, settings, the schedule, the stash, inputs, the Leave War and
   the plan layer really all-or-nothing (read `command/commit.ts`, `engine/weekstash.ts`'s store, the inputs
   batch)? What on a refusal inside, a throw half way, a storage failure? What do the Leave War projection, the Tracker
   bridge and the callsign index see mid-command?
4. **The past keeps its record.** Does §4.4's rule for `attrsOf` hold, and does anything else make a day he flew read
   pending or change (the Available crew on an issued face, `snap.ros`, the pending list's "no longer on the roster",
   the OIL pass's reverse sweep deleting past credits, the war's `rowInWindow`, the OIL tracker)?
5. **The outcome pass (§3) and #444's code.** Is "each effect once, never undo a later hand change" (`poDone`) sound
   beside #444's `postOut` / `undoPostOut` / `restoreArchivedPerson` / `archivedBy`? Walk: set Overseas for a date to
   come, the date arrives, the admin enables the account by hand; the admin changes the outcome after the date; Undo
   post out after each outcome's date; Restore; a posting's date moved later after it ran; the SANS outcome with Show
   SANS toggled either side of the date.
6. **Permissions (D200).** Are the new commands and the §11 edits correct and complete? Can a member, a guest, a pending
   person, a suspended account, or an admin in the MEMBER VIEW reach any new door, by the screen or by a hand-made call?
   Does the member view (§10) really make him "exactly a member" everywhere — the command actor, the ownership check,
   the Leave War's own role, the page gates, the editor sheets, undo — and is anything decided outside `perms.ts`
   (`perms-scan.test.ts`)?
7. **The callsign rule (§9).** Does ONE `indexCallsigns` + ONE `callsignProblem` cover every writer and reader (the one
   add, the sign-up, approve, rename, Restore, the Quals table's own callsign box, search, a typed ground/programme
   `who`)? What does a legacy callsign string in a stored `who` resolve to once the callsign is free?
8. **The Leave War side (§4.2, §4.5, §7).** Is keeping a deleted man as a posted-out row right for "the past keeps his
   record / his row after he left goes"? Is laying (or not laying) the posting window in `setPeople` the right single
   place for the SANS outcome, and what else reads the window (`inSquadron`, manning, `availableFor`, `rowInWindow`,
   the OIL tracker)?
9. **Missing from the roll-call.** Any surface, door, role, overlay or order the roll-call omits.
10. **The build order (§13).** Is Part A truly free of #444's files? Is building Part B on #444's code sound?

**For every finding: exact, step-by-step fix instructions (which file, which function, what to change), not a
direction.** And give **explicit negatives** — "I checked X and found nothing" — for each of questions 2–8.

End with a verdict: **APPROVE / APPROVE WITH CHANGES / REVISE**, and a ranked list of the findings.

## Your report

Write it — and only it — to the file you were given
(`raptor-port/docs/superpowers/specs/2026-09-27-post-out-outcomes-redteam-r1-<you>.md`).
