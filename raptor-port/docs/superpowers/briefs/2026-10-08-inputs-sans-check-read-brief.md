# The code read — the Inputs calendar and the SANS availability calendar (steps 1 to 5, and the check's own fixes) — 8 Oct 26

You are one of TWO independent readers of a finished job (bug-check order §4 rank 2, §4a; D590, D601 — Astra reviews
what Opus wrote and Sol 6.1 reads second, each blind to the other). You did not write it. Work READ-ONLY: change
nothing, build nothing, start no server. **You cannot run anything** (the sandbox has no writable temp folder — a test
run reports zero tests): read the source, and where you would have run a case, NAME the exact input and the answer you
expect; the host runs it. Never read the other reader's report (`2026-10-08-inputs-sans-check-read-astra.md` /
`…-read-sol.md`); never approve — your report is evidence, the owner approves.

## What it is

Branch `claude/inputs-sans-calendar` against `main` at `126c6074`: `git diff 126c6074 HEAD -- raptor-port/src` (about
210 files — read the ones named below WHOLE; the rest as they lead you). The promise: the owner's rulings **D614–D677**
(`.claude/rules/decisions/scheduler.md`, `leave-war.md`; a ruling's full row: `grep -h '^| D655 |'
.claude/decisions-full/*.md`, the shell's grep), the plan
`raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` (§3 the design; every "AS BUILT" note lists
choices the builder made that the owner has only been TOLD — judge each against his words), and the contracts in
`raptor-port/docs/ui-contracts.md` ("The four rows at the foot of the Manning block", "Days — the month", "The SANS
calendar", "The Inputs calendar", "One input filed for several people") and `raptor-port/docs/engine-rules.md` ("The
cut-off has two shapes", "The flying plan — one day's answer"). Also: `raptor-port/CLAUDE.md` §Architecture rules,
`.claude/rules/raptor-executor.md`, `raptor-port/docs/bug-check-order.md` §2b, §4, §6.

**In your hands: the evidence sheet** — `raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md`. Its §3 is
the ROLL-CALL of every place each thing is drawn and every door an input can be changed through; its §5 is what the
check has already found and fixed (do not report those again — but DO read each fix: a fix is new code nobody has read).
The walk of the running app has been done before you (§6 of the sheet, the walkers' reports under
`raptor-port/docs/handpass/parts/cal-*.md`); you are asked for what a walk cannot see.

## Read these whole — the high-consequence code

1. **Who may file, change and delete whose input** (D654–D660): `src/state/perms.ts` (`mayFileInputFor`, `mayFileGroup`,
   `mayEditInput`, `mayDeleteInput`, `mayChangeInput`, `inputBreach` and the command gate around it, `COMMAND_OPS`,
   `INPUT_FILER_NOTE`), `src/state/inputgroup.ts`, `src/state/inputstamp.ts`, `src/ui/inputedit.tsx` (`commitGroup`,
   `removeEntry`, "Take me out", the OIL question at a group's save, `commitInputEdit`, `reassignInput`, the editor as a
   window — its follow-the-record effect, its Escape handler, its unsaved-work question), `src/ui/caldrag.ts`,
   `src/ui/PeoplePick.tsx`, the List in `src/ui/InputsPage.tsx`. Against `raptor-port/docs/data-model.md` §11.
2. **What is saved** (D473): `src/state/flyplan.ts`, `src/state/flyplan-model.ts`, `src/state/cutoff.ts`,
   `src/engine/schema.ts`, the settings commands (`settings.memberfile`, `settings.sanscalendar`, the cut-offs in
   `rules`); in the Leave War `src/leavewar/state/store.ts` — `holidayAdd` / `holidayChange` / `holidayRemove`, the
   Event sheet's save and remove with short forms, `manningBlockOrder`, the two Available rows, every
   `cmdDefinePermission` — with `src/leavewar/engine/holidays.ts`, `eventshort.ts`, `availrows.ts`, `fixedrows.ts`, and
   `src/leavewar/state/rows.ts` (is every new thing written as its own row from its command, and read back?). Against
   `raptor-port/docs/data-schema.md`.
3. **The count of who is present** (D617, D640): `src/leavewar/engine/availrows.ts`, `src/leavewar/sync.ts`
   (`warFactsVersion`, `dayFacts`, `holidaysIn`, `flyAnswer`, `flyMonth` — can the kept answers ever be stale: which
   writer replaces none of the four things the version compares?), `src/state/flyplan.ts sansCommittedOn`,
   `flyplan-model.ts planFor`.
4. **The late rule** (D628, D639): `src/engine/inputs.ts` (`cutSetOf`, `cutBackOf`, `isLateInput`, `cutRuleText`),
   `src/engine/rules.ts`, `src/ui/sanscal-model.ts lateWord` — is a cut-off set in DAYS byte-for-byte what it was; is
   any input judged by the wrong one of the two settings; a year's end; an unreadable date.
5. **OIL** (D660; OIL is earned leave, never pay — D25): `src/engine/oil.ts voidedOil`, the group's one answer applied
   per man, `src/leavewar/sync.ts oilAskPlan` / `oilPendingFor` — can a shared duty leave a man unasked AND unanswered,
   answer for a man it should not, or carry one man's answer to another when a person is added, removed or "taken out"?
6. **The published record** (D45, D103, D178): an input filed, moved, changed or deleted for SEVERAL people on a
   published day — is each man's change pending, are the four sign-offs taken down, does anything on the issued face
   move before the amendment? `src/ui/changesmodel.ts` — one item for a group filing (D663) without losing any man's own
   line.
7. **Undo** (D148, D670, D672): the words and the landing for every new command (`src/leavewar/undo/describe.ts`,
   `src/state/undo-wire.ts`); one command = one Undo step for a group save, a picked block of cells, a holiday over a run
   of dates; is a refused command ever half-applied?
8. **The check's own fixes** — `git log --oneline 2c64041e..HEAD -- raptor-port/src`, each diff: `src/ui/DaysWindow.tsx`
   (the holiday tag), `src/ui/FloatWindow.tsx` (which window is in front), `src/ui/inputedit.tsx` (Escape; the people
   as unsaved work; following only the record shown), and any later fix commit.

## What to answer — each with a file and line, or "checked, none"

A. **A wrong line** in any of the eight areas: the input, what the code does, what the ruling says it should do.
B. **A MISSING line.** Against the roll-call (sheet §3): a place that draws an input, a day's tag, the need, the
   placed-by line or the late tag that this job should have reached and did not — or reached and should not have. A
   DOOR that writes an input and skips the permission rule, the stamp, the OIL question, the group's one command, or the
   mutation funnel (`raptor-port/CLAUDE.md` §Architecture rules: a write that ends outside a command is not saved).
C. **A rule held in ONE place only where two are needed** — on screen but not at the command gate, or the reverse (the
   sheet's row H8; the sheet notes one already: a medical entry or an upchit for several people is refused on screen and
   at the save, not at the gate — is that reachable through any door, and what would be saved?).
D. **The tests:** for each of the eight areas, name the wire of the diff no test would go red for. (The builder's
   strictness lists — `raptor-port/scripts/handpass/breaks/2026-10-08-*.json`, each rule broken alone and the test that
   caught it — are evidence of what IS held; you are asked for what is not on those lists.)
E. **The words:** does each "AS BUILT" reading contradict a ruling's own words? Do the six corrected documents
   (commit `2c64041e`) say what the code does — above all `data-model.md` §11 against `perms.ts`?
F. **What is NOT a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that
   will be CLEARED before the database step. Do not report a problem whose harm exists only in data already stored when
   the code is already correct going forward — no migration, no back-compat. If the app would do it again to NEW data,
   report it. Also not yours: one row for a group input on the SCHEDULE (D661, D662 — its own job), the Leave War's
   other windows still blocking the grid (filed), the top of the Leave War on a phone (D678, D679).

Then: up to twelve exact cases for the host to run, ranked (setup, action, what you expect, what would disprove it);
explicit negatives — what you checked and found sound, one line each; and a verdict line — **PASS** or **CHANGES
REQUIRED** with the changes listed. A claim is a finding only with a concrete failure, its cause and its fix (D489):
give exact, step-by-step fix instructions for each.
