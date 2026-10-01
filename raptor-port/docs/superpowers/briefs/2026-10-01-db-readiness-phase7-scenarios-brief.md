# Scenario-design brief — [DB-READINESS] group A phase 7, the small OIL follow-ups (1 Oct 26)

You are Astra, the independent scenario designer (bug-check order §4 rank 1 — one reviewer, D353). You did not write this
plan and will not build it. READ-ONLY: change no file. The code you read is `main` plus a plan — the build has NOT
started, so you are designing the scenarios the finished build will be WALKED against in the running app.

## Read first (live files — read them, do not rely on this brief's summary)
- The plan: `raptor-port/docs/superpowers/plans/2026-10-01-db-readiness-phase7-plan.md` (the six items, §1; the rulings, §2).
- The backlog items: `OUTSTANDING.md` — `[OIL-PERSONAL-PLACEHOLDER]`, `[CROWD-SIM-BRIEF]`, `[OIL-READ-LEFTOVERS]`,
  `[STORE-READER-SWEEP]`, `[OIL-REQ-NAMEBOX]`, `[OIL-WORDS]`.
- The method: `raptor-port/docs/bug-check-order.md` (§2b what is NOT a finding, §6 the roll-call, §7 the walk).
- The rulings (you load none of `.claude/rules/` by yourself): `.claude/rules/decisions/oil.md`,
  `.claude/rules/decisions/scheduler.md`, `.claude/rules/decisions/how-we-work.md`; a ruling's full row is one line of
  `.claude/decisions-full/<same name>` (`grep -h '^| D43 |' .claude/decisions-full/*.md`). Also
  `.claude/rules/raptor-executor.md`.
- The code the items name: `raptor-port/src/engine/oilev.ts`, `engine/oil.ts`, `engine/validate.ts` (`crowdClashes`, the
  sim brief / debrief block of the warning pass), `engine/events.ts` (`simwin`), `engine/slots.ts` (`setSlotVal`),
  `engine/overlay.ts` (a request's row worked out on read), `ui/oilmode.ts`, `ui/AvailWindow.tsx`, `ui/html.ts` and
  `ui/board-html.ts` (the count chip), `engine/publish.ts` (the frozen block, the pending comparison),
  `raptor-port/docs/data-schema.md` and `raptor-port/src/storage/`, `src/leavewar/state/` (the stored records' readers).
- Earlier evidence for these surfaces: `raptor-port/docs/handpass/2026-09-23-allavail-window.md`.

## The job — use this wording as your method
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

## What is NOT a finding (owner, D56)
This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step. **Do
not report a problem whose harm exists only in data already stored when the code is already correct going forward** — no
migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to NEW data, report
it: that is a real finding and this exclusion does not touch it.

## What to return
1. **A roll-call draft** for each item: every place the app draws the thing the item touches (the count chip of a
   placeholder; a crowd man's flag in the ALL AVAIL window; a sim row's seats; each stored record's reader), with where
   the sign and the gesture should be — the board, the edit week, View-only Sched (the issued face), a version preview, a
   saved-plan preview, the next-week peek, the phone, the print, the changes window, the Leave War where a credit lands.
2. **Ranked scenarios** (aim for 25–40), each: setup (through the app's own controls) · action · expected (what the screen
   says, and what the OIL credit says) · the observation that would disprove it. Cover at least: a Personal request row
   with ALL / ALL AVAIL in the name box and in the extras, timed and all-day, on a weekday, a Saturday and a published
   day (the crowd frozen, a later leave reading pending, the sign-offs); the request then edited, re-typed (Personal ↔
   Training), moved to another day (D468), taken off, deleted, handed to another man; undo / redo / reload after each;
   a crowd man on an OFT EP sim and on the AMT block whose brief or debrief the event sits inside, on the working copy
   and on an issued face; the second spare sim seat by drop, by tap-arm, in `pax` and in the extras, then publish,
   reload, undo; every door a placeholder could reach a cockpit by; the name box of another man's request row.
3. **For `[STORE-READER-SWEEP]`:** which reader / writer pairs you judge most likely to be narrower on read, with the
   exact write that would be lost and how the walk would show it (write through the app, reload, look).
4. **Rulings that conflict or leave a case open** for this batch — name both rulings and the case.
5. **Explicit negatives** — what you checked and found nothing in.
Be concrete and exact; where you propose a test, say which file and what it asserts.
