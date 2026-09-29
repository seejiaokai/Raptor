# Independent review — the one Undo

The proposed split is mostly right, but it omits several real controls and one phrase puts two different “Give access” actions on opposite sides without distinguishing them. I recommend removing Leave War stage changes from the one Undo.

## 1. Missing from the list

Put these under **Already taken back today**:

- **Edit Schedule → Plans:** `+ Alt Plan`, switching plans, renaming or deleting a plan, and loading an issued version onto the working copy. These are ordinary schedule changes and already use schedule history (`sched-commit.ts:396-397`). Without Undo, deleting or switching the wrong alternative plan requires rebuilding it.
- **Leave War → Edit aircrew:** changing Seat, Band or SXO in the person sheet (`leavewar/state/store.ts:1468`). This changes the Leave War’s grouping and manning counts. It should remain undoable; otherwise an accidental tap must be reconstructed manually.
- **Leave War → “OK, seen” on a replaced-bid notice** (`leavewar/state/store.ts:2846-2855`). This is not the same as a personal read receipt: it removes a squadron record and clears the amber warning, sometimes across several days. Undo should restore the notice and warning.

Put these under **Never taken back by the one Undo**:

- **Tracker changes.** D349 settled that the pair in the Tracker’s top bar remains the Tracker’s own Undo, not the shared one. Its private history covers marks, dates and unsaved chart edits; student/course/syllabus administration, event details and Import remain outside that history (`tracker/app/core.js:2649-2667`). The shared Undo must never cross into it.
- **The ADMIN ↔ MEMBER view switch** made by tapping the admin’s name (`state/store.ts:380`). It changes the view and authority in force, not squadron data. If it became an Undo step, Undo could unexpectedly change the whole interface instead of taking back work.
- **Automatic consequences must never be separate steps:** automatic OIL credits from a published schedule, Leave War/Input mirroring, warning recalculation, callsign-index rebuilding and similar projections. They must go back with the human action that caused them. Otherwise one Publish could require several Undo presses and briefly leave the schedule disagreeing with earned leave.

## 2. On the wrong side

- **Leave War stage:** move it from “Already taken back” to **Never taken back by the one Undo; use the stage’s own forward/back buttons**. This is my only substantive side change.
- **“Give access” needs splitting:**
  - Give access **to an existing person** belongs on the new undoable list.
  - Give access **as New person** belongs with Adding a person and remains non-undoable under D350 (`accounts.ts:311` versus `accounts.ts:475`).
  
  Leaving the words broad risks implementing the second path contrary to the settled ruling.
- **“OIL awards” should say “manual OIL awards.”** Automatically earned FO/HO credit is a consequence of the schedule and must reverse with its originating Publish, Unpublish or OIL Earn action—not as an independent award step.

## 3. The stage question

**Recommendation: the one Undo should not move the Leave War stage. Use only the stage’s own buttons.**

A stage is not merely another field: it immediately changes what every member may do. While Open, a member can bid inside the bidding window; once Closed or Published, the member’s grid becomes read-only (`leavewar/engine/stages.ts:90-110`).

If stage Undo is kept:

- Undoing **Bidding closed** immediately reopens bidding.
- A member sees **OPEN FOR BIDDING**, the green bidding-window outline and writable bid controls again.
- The member can submit or move a bid before the admin notices.
- Redo closes bidding again, but bids entered during the reopened interval remain because a stage move deliberately erases nothing.

If stage Undo is removed:

- The member continues to see **BIDDING CLOSED** or **PUBLISHED** when the admin uses the general Undo.
- An admin who closed or published by mistake uses the visible stage-back button deliberately.
- Only then does the member see bidding reopen.

The dedicated button already provides the safe way back. Keeping this squadron-wide permission change out of the general Undo makes the action deliberate and easier to explain.

## 4. Additional refusals needed on the new list

Besides the callsign, last-admin, own-account and archived-account refusals already named, an account restore must also refuse—whole and in plain words—if it would:

- give two accounts the same normalized sign-in name;
- attach two accounts to the same person;
- attach an account to a missing or deleted person.

It must not silently “repair” the result by dropping an account during reload.

Every new roster/settings Undo also remains subject to D148: if another person has since changed that same record, refuse without consuming the step and name that person. A change to an unrelated record must not block it.

I found no extra domain refusal needed for ordinary qualification ticks, CAT, initials, flight, remarks, LoX columns, templates, defaults, Logic rules, stores or cancel reasons. Those should restore exactly and then recalculate their dependent displays and warnings.

## 5. Explicit negatives

I checked and agree with:

- D350’s settled exclusion of Add person, Archive, Restore/Restore as, Delete and postings. Consequence worth remembering: an accidentally added person has no one-Undo recovery; removing him uses the deliberate Delete route, which is final.
- The three personal acknowledgements staying outside Undo: changes seen, access-request bell seen and welcome-back dismissed.
- A pending person’s access request staying outside Undo because that person has no Undo door.
- The posting pass and all other automatic projections staying outside the action list.
- Navigation, week/war/day selection, previews, filters, search, highlights, folds, hidden LATE marks and modal opening/closing staying outside Undo.
- Bug-report filing and the Help page’s automatic seen-on-open state staying outside Undo.
- Change History never being erased; successful Undo/Redo adds a new line, while a refusal adds none.
- The existing schedule, input, planning-calendar, Publish/Unpublish, sign-off, Discard, warning-mute and OIL Earn classifications.
- The proposed Quals, account, configuration, Logic, stores and cancel-reason additions, subject to the refusals above.
- One shared chronological history across the writable Raptor pages—never a private stack per page or button—with the Tracker as the deliberately separate exception.

This was a read-only review of the current clean `claude/change-recording-retest` checkout. I edited nothing and ran no tests, builds or app.

