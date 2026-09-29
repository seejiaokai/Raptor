# Scenario brief — the change-recording re-test (`[HUMAN-RETEST]`, D147) with `[UNDO-ROSTER-SETTINGS]` and D148: design the walk (FULL tier), 28 Sep 26

You are an independent designer of TEST SCENARIOS for code you did not write (Opus wrote it, over several weeks).
Another model from a different provider does the same job at the same time; you will not see each other's list.
**Read-only: do not edit any file, do not run git commands that change anything, and do NOT run tests, builds or the
app.** Reading and searching only. The repository is `C:\Users\User\projects\Raptor`, branch
`claude/change-recording-retest` (cut from `main` at `60a6792c`; nothing built on it yet).

## Your job

Ask **what is MISSING**, not whether the code is right. The builder will walk the RUNNING app with a scripted browser
(desktop and phone widths) and your list is what that walk must cover. The builder's own tests share the builder's
blind spots; yours should not.

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

## What is under test — three parts

**Part 1 — the re-test of what exists (the owner's D147: "re-test change-recording — the one undo and the command
layer").** Every earlier build was checked by code review plus unit tests; the owner's standing order now wants it
walked the way a person uses it, because that is where unwired surfaces hide (`raptor-port/docs/bug-check-order.md` §1,
§2). The one global Undo was built and merged 18 Sep 26 and has been extended by nearly every build since (the Leave
War's absence record, Unpublish, the OIL Earn mode's own stop, accounts' clear-at-sign-in, the posting and delete's
"passed over" steps, the change history's undo lines). What exists:
- The engine — `raptor-port/src/undo/timeline.ts` (the dispatcher, conflicts, `mayReverse`, `endUndoSession`,
  `deadRefusal`), `src/undo/derive.ts`, `src/undo/describe.ts` (the bubble's words); the wiring —
  `src/state/undo-wire.ts` (which modules are cut over: schedule, Leave War, inputs, plans; the hooks); the command
  layer — `src/command/` (`commit.ts` is the one write gate), the stores `src/state/sched-commit.ts`,
  `src/state/people-settings-commit.ts`, `src/leavewar/state/store.ts` (`lwStore`), the week stash
  (`src/state/store.ts` `weekstashStore`).
- **The Undo / Redo doors** (a starting point for your roll-call — prove it complete or add to it): the top bar's pair,
  shown only on Edit Schedule (`src/ui/Shell.tsx`, `#undoBtn` / `#redoBtn`, with the OIL Earn mode's stop — 
  `src/ui/oilmode.ts` `oilUndoBoundary`); the scheduler board's own pair (`src/ui/SchedBoard.tsx`); the Leave War's pair
  (`src/leavewar/ui/Chrome.tsx`). There is no keyboard shortcut. The Inputs page, Quals, Admin, the Logic page, the
  Tracker and View-only Sched carry NO Undo today — so an input filed on the Inputs page is undone from Edit Schedule.
- The change history's line for an undo or a redo (`src/state/changelines.ts` `logReversed`, D263 / the changes window,
  D168–D172, D337–D346).
- Known and filed, so you need not re-find them — rank them only if you think a person meets them: `OUTSTANDING.md`
  `[GLOBAL-UNDO]` (GU-E2E, CMDLF-002 — `lw.postouts` is deliberately NOT undoable yet, GU-C3, GU-E5 — an input-only
  undo does not jump to its week, GU-LWLOCK, GU-COSMETIC), `[AMEND-SMALL-SEEN]` item 2 (the take-off-time undo says
  "a note on the schedule").

**Part 2 — `[UNDO-ROSTER-SETTINGS]`, to be BUILT (`OUTSTANDING.md` item of that name; register row AM39d in
`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`).** The owner's 16 Sep 26 rule
(`raptor-port/docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md` §3.4): **roster and settings edits
ARE undoable — ordinary user changes, never amendments.** Today they are not: `setCutoverModules(['sched', 'lw',
'inputs', 'plan'])` leaves out `people` and `settings`, so adding a person, renaming a callsign, a Quals tick, a Logic
setting, a template, an account change cannot be undone. The two stores already exist and implement `write()`
(`src/state/people-settings-commit.ts` — `peopleStore`, `settingsStore` over `SETTINGS_KEYS`). The item itself names one
rule a restore must re-check: **an account restore must re-check the guards `[ACCOUNTS]` enforces at the write** (at
least one admin keeps access; an admin never changes his own account — `src/state/accounts.ts` header), or an undo could
lock the squadron out. Find every OTHER rule a roster or settings restore could break, and every write that must NOT
become an Undo step at all. Starting points, not a complete list:
- the writers: `src/state/accounts.ts` (`ACCOUNT_TYPES` — note `access.seen`, `person.backSeen`, and the pending
  person's own `access.request`), `src/state/changes.ts` (`changes.seen` — "Mark all as seen"), `src/state/roster-add.ts`,
  `src/state/quals-write.ts`, `src/state/person-delete.ts` (D287: a delete "cannot be undone"; `deletedRestoreProblem`),
  `src/leavewar/sync.ts` (`archivePerson`, `restoreBody`, `runPoOutcomes`, `postOut` — the posting pass writes people
  and accounts on its date), `src/engine/slots.ts` `renameCallsign`, `src/engine/qualcols.ts`, the settings loaders
  listed in `people-settings-commit.ts`;
- the one-callsign rule on the roster (D286, D295 — an archived man's callsign is free; Restore refuses while a roster
  man holds it); a person added, then placed on the schedule or given leave, then the add undone; a person archived or
  restored by Admin → Users (D310, D322, D323 — Archive is "posted out from today" on the war and also suspends the
  sign-in); Quals ticks feeding the warnings, the sign-off boxes and the Leave War's groups; a Logic rule change feeding
  every warning (D48, D179: a published day's warnings freeze — what does an undone rule change do to it?); the member's
  own Quals row (D149, D218); the admin's member view (D292).
- **Where the button is** for a change made on Quals, Admin or the Logic page, and where an undo of one takes the person
  (the one undo "takes you to where the change was" — AM39b, the 13 Sep 26 snap-to-page ruling).

**Part 3 — D148, to be BUILT where not already** (`.claude/rules/decisions/how-we-work.md` D148;
`raptor-port/docs/undo-contract.md` §4 "Whose changes Undo reverses"): **Undo reverses only the signed-in person's OWN
changes; the list clears when they sign out; it never greys out because someone else changed something since, and never
undoes another person's change; if someone else has since changed the very same thing, Undo refuses and SAYS WHO.**
What exists: the list empties at every sign-in and sign-out (`endUndoSession`, `src/state/session-undo.test.ts`);
`mayReverse` lets an ADMIN reverse any entry; the out-of-band refusal says "Something else changed this after your
action" (no who). The app has no shared database yet — one browser, one person at a time — so the "someone else"
half can only arrive as a `remote` envelope in a unit model (`src/command/door.ts` `MemoryDoor`). Say which parts of
D148 a walk CAN prove today and which only a unit model can, and what each must show.

## The rulings (a later one wins — D90)

`.claude/rules/decisions/how-we-work.md`: **D148**, D166 (accounts — signing in makes you that callsign), D200/D202 (one
permissions module, `src/state/perms.ts`, mirrored in `raptor-port/docs/data-model.md` §11), D204, D217, D218, D285,
D286, D287, D290, D292, D295, D297, D306, D308, D310, D320, D322, D323, D327, D329. `.claude/rules/decisions/scheduler.md`:
D44, D45, D98, D103, D263, D337 (and the undo-of-publish model — `raptor-port/docs/undo-contract.md` §4, the global-undo
design `raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-3-global-undo-design.md` §0, §4–§6).
`.claude/rules/decisions/leave-war.md` (its Architecture section: the one absence record), `.claude/rules/decisions/oil.md`
(OIL comes from the latest published version; the earn mode). The register rows AM32–AM39d. The global-undo behaviour:
`raptor-port/docs/undo-contract.md` (the front door — read it first), `raptor-port/docs/engine-rules.md` §History.

**The demo world:** sign in `ad` / `a` (admin, Saber) or `us` / `us` (member, Ranger); the demo week is Mon 13 – Sun
19 Jul 26 (the weekend published or publishable), a second week from Mon 20 Jul; the calendar date is 28 Sep 26 (a
delete's and a posting's "today"). A walk builds its state through the app's own controls.

## Weigh especially

- **Every door × every kind of change** — each Undo / Redo pair against each kind of change it can reach (a schedule
  slot, a text box, a section / wave move, a wave or row delete, a publish, an Unpublish, a sign-off, Discard, an OIL
  decision, an input filed / edited / deleted on the Inputs page, the calendar, the board; a plan switched / loaded; a
  Leave War bid, decision, move, delete, award, setting; an off-week edit; and, once built, every roster and settings
  change). Which doors can reach a change made on a page that has no door?
- **Orders** — each action then Undo, Redo, reload; two actions in both orders, then two Undos; a change on page A,
  a change on page B, Undo twice from each door; Undo across a publish on a published day and an unpublished one; a
  refusal, then the next press; Undo inside and at the edge of OIL Earn; Undo after a sign-out and sign-in; Undo in the
  admin's member view.
- **Roles** — admin, member (his own Quals row, his own inputs and bids), the admin in member view, a guest, someone
  waiting for access. Every door and every refusal's words.
- **Downstream** — what an undone roster or settings change must repaint or re-derive: the warnings, the sign-off
  boxes, the Leave War roster and groups, the counts, accounts' sign-in, the change history, a published day's pending.
- **The words** — every bubble and every refusal read by a person who has never seen the code.

**What is NOT a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that will
be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when the
code is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly". If
the app would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it. Also
out of scope: the Tracker's own undo (the Tracker is not cut over to the one undo; its re-test is done).

## How to report

1. **A roll-call**: every place a change can be made that should be undoable, and every Undo / Redo door — each with
   has it / must not, because… / MISSING. No blank cells.
2. **A numbered list of scenarios**, ranked by how likely each is to find a defect, each with: **start state**, **the
   gestures in order** (in the app's words — Edit Schedule, the scheduler board, the Leave War grid, Quals, Admin →
   Users, the Logic page, the changes window), **what the screen must show**, and **what would prove it wrong**. Few
   lines each.
3. **For Parts 2 and 3: the rules a restore must re-check** and **the writes that must never be an Undo step**, each
   with the file and function that decides it today, and **exact, step-by-step fix instructions** where you are sure.
4. **Explicit negatives**: what you checked and found nothing in.
5. **Questions only the owner can answer** (a product choice the code cannot settle), each with your recommendation.
