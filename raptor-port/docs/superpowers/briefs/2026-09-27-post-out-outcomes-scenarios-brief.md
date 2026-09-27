# Scenario brief — the finished `[POST-OUT-OUTCOMES]` build: design the walk (FULL tier), 27 Sep 26

You are an independent designer of TEST SCENARIOS for code you did not write (Opus 5.5 wrote it). Another model from a
different provider does the same job at the same time; you will not see each other's list. **Read-only: do not edit any
file, do not run git commands that change anything, and do NOT run tests or builds** (the PC is running the full gate
set; a second heavy run gives false failures). Reading and searching only.

## Your job

Ask **what is MISSING**, not whether the code is right. The builder will walk the running app with a scripted browser
(desktop and phone), and your list is what the walk must cover. The builder's own tests share the builder's blind spots;
yours should not. Design scenarios a person could actually do on screen, in the order a person would do them, with the
state each starts from, the gesture, what the screen must then show, and **the observation that would prove the build
wrong**. Put the least-shared, most specialised surfaces first.

## What was built (on branch `claude/post-out-outcomes`)

`git log --oneline -8` and `git diff 4f3c40cc~1...HEAD -- raptor-port/src` (the posting work is the commits whose message
starts `[POST-OUT-OUTCOMES]`; `4f3c40cc` merged PR #444's posting code in, which Part B builds on). The main files:
`raptor-port/src/state/person-delete.ts` (a delete), `src/state/accounts.ts` (suspend / enable / delete account, the
posting's suspension `offBy: 'po'`), `src/state/perms.ts`, `src/state/store.ts` (`switchRoleView` — the admin's member
view), `src/ui/UsersPanel.tsx`, `src/ui/QualsPage.tsx` (the Archived list: Rename, Restore, Restore-as, the "he's back"
prompt), `src/engine/people.ts` (the callsign index — roster and placeholders only), `src/state/roster-add.ts`
(`callsignProblem`), `src/engine/publish.ts` (`peopleAttrsNow`), `src/leavewar/sync.ts` (`postOut`, `runPoOutcomes`,
`restoreBody`, `restoreArchivedAs`, `undoPostOut`, `takeBack`, `availableFor`, the OIL pass's `creditable`),
`src/leavewar/state/store.ts` (`setPostOut`, `windowFor`, `markPostingDone`, `forgetPersonFrom`),
`src/leavewar/ui/OutcomeChips.tsx`, `BidPicker.tsx`, `SelectSheet.tsx`, `Matrix.tsx`, `src/undo/timeline.ts`
(`deadRefusal` — a step that would bring a deleted man back is passed over).

## What it must do — the owner's rulings (a later one wins, D90)

`.claude/rules/decisions/how-we-work.md`: **D229, D280, D283, D284, D285, D286, D287, D290, D292, D294, D295, D297,
D298, D299, D300, D301**, with D166, D200, D201, D204, D214, D217, D226. `.claude/rules/decisions/leave-war.md` (its
Settled and Architecture sections), `.claude/rules/decisions/scheduler.md` **D44, D45, D103, D186** (nothing on a
published day changes without the scheduler seeing it pending), `.claude/rules/decisions/oil.md` **D2, D142** (OIL comes
from the latest published version). The plan: `raptor-port/docs/superpowers/plans/2026-09-27-post-out-outcomes-plan.md`
— its **Round 2** section wins over Round 1 and the text above it; its roll-call and "roll-call gains" list the places
the change reaches. The approved mock-up: `raptor-port/docs/mock/post-out.html` (§1 the sheet, §3 the Quals line, §5 what
stays after a delete, §6 Restore when the callsign is taken). The register: `raptor-port/docs/superpowers/specs/2026-09-26-accounts-behaviour-register.md` rows PO1–PO12.

**The one clock:** a posting's outcome runs on the CALENDAR date (today, 27 Sep 26), and a delete's cutoff is the later
of its date and the calendar date — so the demo's July weeks are "past" to a delete. A walk that wants a "day still to
come" must build one in a week after 27 Sep 26.

## Weigh especially

- **Orders** — every pair of the feature's actions in both orders: post out then Restore; Restore then post out; SANS
  posting then Show SANS on/off, and the reverse; a posting then Enable by hand then another notify; a delete then
  Undo / Redo; a posting moved later after it ran; the outcome changed after it ran; a reload between steps.
- **Published days** — a delete when a day he flew is published and a day to come is published; loading an older
  published version or switching a plan onto a day to come after the delete; the four sign-offs; ALL AVAIL crowds.
- **Roles** — a member, a guest, a suspended account, the admin in the member view, the last admin — every new door
  by the screen and by a hand-made call.
- **Every list and picker a person appears in** (a deleted man on none; an archived man on the Archived list only).
- **The Leave War** — the three posting doors, the row of a SANS man with Show SANS on and off, a deleted man's past
  months, the OIL tracker, manning counts.

**What is NOT a finding (owner, D56):** this app's whole stored world is DEMO DATA, cleared before the database step.
Do not design scenarios whose harm exists only in data already stored when the code is already correct going forward.

## How to report

A numbered list, ranked by how likely the scenario is to find a defect, each with: **start state**, **the gestures in
order** (in the app's words — the Leave War grid, the post-out sheet, Admin → Users, Quals' Archived list), **what the
screen must show**, and **what would prove it wrong**. Then a short list of **surfaces or orders the plan's roll-call
does not name at all**. Keep each scenario to a few lines.
