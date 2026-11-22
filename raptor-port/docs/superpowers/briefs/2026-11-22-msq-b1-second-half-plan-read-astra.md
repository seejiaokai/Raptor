# Red team of batch 1's second-half plan — Astra's report (22 Nov 26)

Brief: `2026-11-22-msq-b1-second-half-plan-read-brief.md`. Run: `codex exec -m gpt-6-astra`, high, read only, on the exported copy; saved by the host as returned (its links point into that copy).

Read an exported copy of commit 225c6eab (picture-free; the builder's handoff block removed).

1. **Step B’s Tracker spike can pass while losing unsaved work.**

   **Failure:** Hunter edits 142’s chart without saving, then picks 149. Resetting the Tracker’s caches and remounting it can discard his draft. The proposed clean 142 → 149 → 142 test would not catch this.

   **Cause:** §3.3 preserves only the existing hold, and §3.5 proposes resetting caches. The existing Tracker deliberately needs no switching hold because it cannot switch once loaded. Its unsaved-work protection currently covers logout, not this new navigation path: [core.js:82](C:/rt138/raptor-port/src/tracker/app/core.js:82).

   **Fix:** Before accepting the spike, define what happens to an open draft and pending Tracker operation. Resolve or retain that work before resetting caches; canceling must leave the original Tracker intact. Prevent an operation started in 142 from completing against 149’s storage. Add tests for an unsaved chart, an open question and a delayed operation during a pick. Any new question or band needs its drawing before implementation.

2. **Step F keeps admin notices after Plan becomes View.**

   **Failure:** Hunter has Plan of 149 and receives its posting notices. Saber changes that right to View. Hunter can still read 149’s schedule, so the proposed “can no longer read” test keeps its admin notices on his bell, contrary to D2310.

   **Cause:** §7.4 tests readability through `levelFrom`; View is a non-null level. The current posting-notice filter asks only whether Hunter is an admin somewhere: [notices.ts:767](C:/rt138/raptor-port/src/state/notices.ts:767).

   **Fix:** Separate permission to receive a squadron’s admin notices from permission to read its schedule. For non-personal admin lines, require the relevant admin right in the line’s squadron. Keep the personal-line exception. Distinguish an actual loss of rights from temporarily switching to member view, which must not permanently retire notices. Test Plan → View, Plan → None, demotion and removal of master status, with read and unread lines and the bell already open.

3. **Step C’s chosen Home squadron does not carry through the new person’s post-in record.**

   **Failure:** Saber stays on 142’s Users page, chooses Home squadron 149 and adds a person with a post-in date. Writing his home as 149 is insufficient: the post-in writer still projects people from the loaded 142 war. With that war present, the add is refused; without a war, it can return without recording the date.

   **Cause:** §4.7 names only the change to `putNewHome`. Both account creation and roster-only creation subsequently call the loaded-war writer: [accounts.ts:973](C:/rt138/raptor-port/src/state/accounts.ts:973), [sync.ts:3646](C:/rt138/raptor-port/src/leavewar/sync.ts:3646). The existing foreign-war command allow-list also excludes creation: [perms.ts:1781](C:/rt138/raptor-port/src/state/perms.ts:1781).

   **Fix:** Carry the selected unit through both creation paths and the request-approval path. Write the new identity and first stint to that unit’s war within the same command, using the foreign store when necessary. Extend the gate narrowly for that new person’s first profile. Test creation with and without a sign-in while another war is loaded, then reload and verify the post-in date exists only in the selected squadron. A refused operation must leave no person, account, home or stint.

4. **Step C’s archive rule needs two gate changes; otherwise legitimate archives and overseas postings fail.**

   **Failure:** Hunter archives a 142 man holding View or Plan of 149. The required removal of those rights is refused because Hunter is not authorised to remove them directly. An automatic overseas posting also fails when its command includes those removals.

   **Cause:** §4.8 specifies the removals but does not identify the existing exceptions that must change. The ordinary gate permits special grant removal for deletion, relinking and demotion—not archive: [perms.ts:2541](C:/rt138/raptor-port/src/state/perms.ts:2541). The posting-pass gate permits grant deletion only when the account itself is deleted, whereas an overseas posting retains it: [perms.ts:1348](C:/rt138/raptor-port/src/state/perms.ts:1348).

   **Fix:** Add an exception proven by the actual archive transition and its account, never merely by the command’s name. Add the equivalent narrow allowance for a verified overseas outcome. Keep the last-admin checks over the complete result. Remove rights even when the account was already manually suspended—the suspension helpers currently return early in that case. Test ordinary archive, loaded and foreign overseas postings, already-suspended accounts, and forged removals beside an unrelated archive.

5. **Step C’s combined Save conflicts with the master-mark gate.**

   **Failure:** Saber selects Master admin for Hunter and presses the proposed Save. A newly registered combined command still fails because the master mark may currently change only through `account.master` or a verified restore. Master admin → Member has the same problem.

   **Cause:** §4.5 introduces `saveAccess` while promising to retain the existing checks, but does not replace this command-specific restriction: [perms.ts:2652](C:/rt138/raptor-port/src/state/perms.ts:2652). Its named tests cover grants, not either master transition.

   **Fix:** Specify the combined command’s exact gate contract. Permit its master-mark delta only for a master actor, never on himself, preserving the last-master and date checks. Validate the proposed account and grants together, without committing intermediate states. Add tests for Member → Admin plus Plan, Admin → Master, Master → Member, last-master refusal and last-admin refusal. Each successful Save must reverse as one step; every refusal must leave all parts unchanged.

6. **Step F’s own-account notice rule excludes grant-only changes and does not cover changes taking effect tomorrow.**

   **Failure:** Saber gives Hunter View of 149 without changing his role. Only a grant row changes, so a gate requiring “the man whose account the command changed” has no changed account row to justify Hunter’s notice. Similarly, a move saved today ends rights tomorrow; putting its “ended: you moved” line in today’s command tells him too early.

   **Cause:** §7.6 ties the notice to an account change, while grants are separate records: [units.ts:266](C:/rt138/raptor-port/src/state/units.ts:266). §9 F3 also promises notices for rights ending on a move. Those endings are calculated from dated homes, not necessarily written as an account or grant change at midnight.

   **Fix:** Define the notices owed from effective access transitions, including account, grant and home changes. Resolve the recipient from the affected account’s person; verify the exact transition and wording. For a future move, provide an idempotent notice when the transition becomes effective, not when it is scheduled. Explicitly support the system writer for overseas suspension and rights ending. Test grant-only changes, a canceled future move, midnight, repeated loads, and a forged notice naming an unaffected person.

7. **Step F’s failed-posting notice needs a separate, justified write after rollback.**

   **Failure:** A 149 posting fails. A notice written inside that posting’s command rolls back with it. Retrying a notice-only posting command also fails the existing gate because no posting successfully ran in that command.

   **Cause:** §7.7 specifies a new war-line kind and a stable ID, but no surviving write path. The posting gate requires a completed posting in the same changeset; ordinary war-line checks require a change that owes the line: [perms.ts:1321](C:/rt138/raptor-port/src/state/perms.ts:1321). The runners handle refusals after the command returns: [sync.ts:3013](C:/rt138/raptor-port/src/leavewar/sync.ts:3013).

   **Fix:** Record the failure through a dedicated system operation after rollback, justified by the attempted saved posting and its failed result. Restrict it to that posting’s identity, unit and audience. Define whether “first failure” means the initial attempt or failure after the existing retry/isolation process; a failed group attempt must not falsely label every posting as individually failed. Test loaded and foreign wars, mixed successful/failed postings, queued failures, three reloads and forged failure notices.

8. **Step D can mark another squadron’s unseen requests as read.**

   **Failure:** Saber has waiting requests in both 142 and 149. He opens 142’s Users page. Its Waiting list shows only 142, but filtering the seen helper merely to squadrons he administers marks both requests read. The 149 request loses its alert without appearing on screen.

   **Cause:** §4.1 scopes the visible Waiting list to the page’s squadron; §5.2 scopes `reqseen` only by administrative access. The existing effect calls a helper that marks the entire request collection: [UsersPanel.tsx:492](C:/rt138/raptor-port/src/ui/UsersPanel.tsx:492), [accounts.ts:1026](C:/rt138/raptor-port/src/state/accounts.ts:1026).

   **Fix:** Pass the IDs actually displayed to the seen operation. Merge those IDs with previously seen requests that still exist; do not replace the record with just the current squadron’s list. Keep visibility, administrative authority and bell switches as separate questions. Test a master and a Plan holder with requests in two squadrons: opening one must leave the other unread.

9. **Step C explicitly requires an archive Undo that D350 forbids.**

   **Failure:** The builder follows §4.8’s test requiring Undo to restore an archived man and his grants. Passing it requires lifting the existing archive exclusion, introducing the deferred posting-record Undo work without authorisation.

   **Cause:** §4.8 contradicts D350. Archive remains excluded in [timeline.ts:539](C:/rt138/raptor-port/src/undo/timeline.ts:539), and `[UNDO-POSTING-RECORD]` remains deferred in [OUTSTANDING.md:2006](C:/rt138/OUTSTANDING.md:2006). D2311 does not authorise changing that rule.

   **Fix:** Remove the archive-Undo requirement. Qualify §0’s blanket “one press, one Undo step” statement with the existing exclusions. Test that Archive remains unavailable to global Undo, Restore returns the person without restoring overseas rights, and ordinary access edits remain one Undo step. Keep posting-record Undo outside this half.

This was a static, read-only review. No files changed; no tests or browser walks run.

Rulings: none this session.

Step A — holds.  
Step B — holds with finding 1.  
Step C — does not hold: findings 3, 4, 5 and 9.  
Step D — holds with findings 3 and 8.  
Step E — holds.  
Step F — does not hold: findings 2, 6 and 7.  
Step G — holds.