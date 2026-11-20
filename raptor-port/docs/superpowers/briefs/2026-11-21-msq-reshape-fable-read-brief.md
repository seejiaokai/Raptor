# Blind read — the multi-squadron reshape's core rights change (Piece B with Piece C)

You are a fresh reader. You did not write this code and you have seen no other reader's report or any walk. The owner
(not technical) ruled that you read this change blind before any further work builds on it (his D2244). Your job: find
REAL faults in the rights change — each with a concrete failure, its cause and its fix — and prove each with a failing
test you write and run yourself. A claim without a red test does not count.

## The copy you read

`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/1a11278d-e218-4f1e-8b56-4190582a1f2f/scratchpad/fable-export/raptor-port` — the app's code at the commit under review, with no project records (no hand-over notes, no
evidence sheets, no review logs). Its `node_modules` is linked in, so tests run:

- run ONE test file at a time: `cd C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/1a11278d-e218-4f1e-8b56-4190582a1f2f/scratchpad/fable-export/raptor-port && npx vitest run src/state/<file>.test.ts` — never the whole
  suite, never a build, never a browser test (the PC is shared);
- write your tests as `src/state/fable-<short-name>.test.ts`; for a world with the seeded sign-ins use
  `src/test-support/msq-world.ts` (`useMsqWorld`, `signInAs('saber' | 'hunter' | 'ranger' | 'kestrel' | 'osprey')`,
  `PID`, `ACCT`, `on(day)`, `at(iso)`, `moveMan`) — today there is Wed 15 Jul 2026; see the existing
  `src/state/reshape-*.test.ts`, `src/state/piece-b-tables.test.ts`, `src/state/lastadmin.test.ts` and
  `src/state/reshape-piece-c-doors.test.ts` for the shape.
- The seeded world: squadron 142 — Saber (master admin, account `acad`, person `stiff`), Hunter (admin, `acad2`,
  `prowler`), Ranger (member, `acus`, `bane`); squadron 149 — Kestrel (admin, `acad9`, `kes9`), Osprey (member,
  `acus9`, `osp9`). One place, `p1`.

## What changed

`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/1a11278d-e218-4f1e-8b56-4190582a1f2f/scratchpad/fable-export/brief/piece-bc.diff` — the core files from just before Piece B to now. Read the diff, then the files whole
where you need them:

- `src/state/units-model.ts` — the reading rule (`grantStart`, `grantHolds`, `grantOn`), `levelFrom` (PA2), the one check
  for homes and places (`datedRowsBreach`), `isAdminRole`.
- `src/state/lastadmin.ts` (new) — Piece C, the one last-admin rule.
- `src/state/units.ts` — the doors `setGrant`, `removeGrant`, `setHome`, `addUnit`; `lockBreach`, `rowsDraft`,
  `unitRowsAfter`.
- `src/state/accounts.ts` — `updateAccount` (the re-link drops every right; a demoted Plan holder's Plan dropped),
  `relinkRightsProblem`, `lockProblem` / `lockProblemFor` / `lockWords` (the one words table), `postingLock`,
  `lastAdminIfGone`, `lastAdminLock`, `accountsRestoreProblem`.
- `src/state/perms.ts` — the commit gate: §6 `unitRowViolation` (rights: who gives what, "an ended right never comes
  back", moves-tomorrow, `datedBreach`), `lastAdminViolation` (G3, now also for rights and new squadrons), G4 and the
  re-link line, R7, `restoreLeavesOut` / `movedSinceStart` / `restoreRedated` (guardrail 2), `buildWorlds`.
- `src/state/notices.ts` — `adminThen` on the reading rule. `src/state/roster-restore.ts`, `src/leavewar/sync.ts` — one
  line each (the restore's rows to the lock; Archive's words from the words table).

The design and its reasons: `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/1a11278d-e218-4f1e-8b56-4190582a1f2f/scratchpad/fable-export/brief/plan-sections.md` (the plan's ground rules, Piece B and Piece C). The owner's
rulings: `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/1a11278d-e218-4f1e-8b56-4190582a1f2f/scratchpad/fable-export/brief/people-accounts.md` (his rulings page for accounts and squadrons) and
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/1a11278d-e218-4f1e-8b56-4190582a1f2f/scratchpad/fable-export/brief/rulings-rows.md` (the full rows of the rulings it cites). Where code and plan differ, the rulings win.

## What to read for

1. **A right that holds when it should not, or not when it should** — after a move of squadron (it ends at the start of
   his move day and never holds again — D2203, D2243), after a re-link (none survives — guardrail 1), after an Undo or a
   Redo, on the day itself and the days after.
2. **A door that lets through what the gate then refuses** — the person sees "That did not save" or the gate's raw
   reason instead of the door's words (the B3 shape) — for every door: Suspend, Demote, Archive, Delete, a posting,
   give / raise / lower / take a right, "+ New squadron", a move of squadron, a re-link, the Undo of an account step.
3. **A step the gate lets through that the rulings forbid** — Plan given or taken by anyone but a master admin (PA1),
   Plan on a member's sign-in (PA2), a re-link by the wrong person (PA3, D2241), a squadron left with no admin on ANY
   date (Piece C), a day already begun rewritten (D2119), a man moving himself (R1).
4. **A false refusal of an honest step** — above all on a squadron that has only a Plan holder, the first admin moving
   into his new squadron, and a posting held for ever.
5. **The dates** — every date the lock and the dated check judge; a move saved for tomorrow vs one saved for a later
   date; two rows of one date; a first row reaching back over the days before it.

## Not findings — do not report these

- A problem that lives ONLY in data already stored, where the code is right going forward (D56): the whole store is
  demo data, cleared before the database step. A finding must harm data made from now on.
- A scheduler who is not an admin (D785): every scheduler is an admin; a member, a guest and a person with no sign-in
  stay in scope.
- Owed to later jobs, on purpose:
  (a) the Undo of a re-link (test `multi-sqn-fixread11` F11-4) is refused at the gate — it fails closed — until the
      Undo job wires the leave-out; its words and its "link back, no right" outcome are that job's;
  (b) guardrail 2's probe `setRestoreGrantCtx` is installed by that same job; until then a restore keeps the
      pre-Piece-B rules and `restoreRedated` keeps a moved man's recorded day — report a fault there ONLY if a restore
      puts back a right that HOLDS (reads as a level) after his move;
  (c) the words of R1 (moving yourself), R7 (a Plan holder demoted by one who is not a master admin) and "+ New
      squadron" with a first admin who does not count are "This change could not be saved." on purpose, until drawn;
  (d) the Leave War's screens and its posting pass's other-squadron half, the Inputs, the schedule pages — other jobs.
- Style, naming, tidiness, comments.

## Your report

Your final reply IS the report (do not write it to a file). Begin it with the token `FABLE-READ-BC`. Then, per finding,
most severe first:

- **Title** and **severity** — HIGH (a real person gets or keeps a right, or a squadron loses its last admin, wrongly;
  or an honest step is refused with no way round), MED, LOW;
- **The case** — who, which day, what was pressed, what the app does, what it should do, and the ruling that says so;
- **Cause** — file and function;
- **Fix** — exact, step by step, the lines to change and what to change them to (the builder will apply it as written);
- **Proof** — your test's file name, and the failing assertion line as you saw it run red.

Then a short list, "Checked and found sound", naming what you tested that held. Keep the report under about 2,500
words.
