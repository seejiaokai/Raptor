# Brief — read the CODE of "an input filed for ALL AVAIL / ALL" and the new input kind "Event" (one reader each; read-only; blind)

**You are one of two independent readers of finished code on a FULL bug check** (the checking order
`raptor-port/docs/bug-check-order.md` §4 rank 2, §4a; owner D67, D590, D601: Opus 5.5 planned and built; Astra and
Sol 6.1 each read it, blind). **Change no file. Run nothing that writes. Do not read the other reader's report, of this
round or any earlier one — `raptor-port/docs/superpowers/briefs/2026-10-09-reads/` is closed to you.**

The app has been WALKED already (the evidence sheet below, with its roll-call and what the walk found). You are not asked
whether the app runs; you are asked what reading finds that driving could not — and what is MISSING.

## What was built, and what it promised
- The plan (version 2, with both plan readers' changes in its §11): `raptor-port/docs/superpowers/plans/2026-10-09-input-all-avail-plan.md`.
- The rules as documented: `raptor-port/docs/engine-rules.md` — the last section, "An input filed for ALL AVAIL / ALL";
  the screens: `raptor-port/docs/ui-contracts.md` — search `"ALL AVAIL" and "ALL" as a choice of person`.
- The evidence sheet — the tier, the rulings swept, the ROLL-CALL of every place an input's person or kind is drawn,
  the walk and what it found: `raptor-port/docs/handpass/2026-10-09-all-avail-event-check.md`.
- The rulings, one line each: `.claude/rules/decisions/scheduler.md` — D700, D702, D711, D712, D713, D714, and D27, D33,
  D36, D37, D44, D45, D47, D103, D178, D654–D660, D682; `.claude/rules/decisions/oil.md` — all, above all D2, D18, D28,
  D43, D46, D48, D142, D470; `.claude/rules/decisions/people-accounts.md` — D200, D327; `how-we-work.md` — D25, D56,
  D489. A ruling's full row: `grep -h '^| D711 |' .claude/decisions-full/*.md`.

## The change itself
`git diff d3f265a1..HEAD -- raptor-port/src raptor-port/e2e` (the branch `claude/day-window-compact`; `d3f265a1` is the
commit before this work). The pieces, by file:
- `src/engine/inputs.ts` — the kind `Event` (one row of `INPUT_META`); `PLACEHOLDER_KINDS`, `placeholderKind`,
  `isPlaceholderInput`, `placeholderProblem`. Its hand-written twins: `src/engine/schema.ts`, `src/testing/refwin.ts`
  (`reshift`, `reirest`).
- `src/engine/oilev.ts` — `claimDefault`; `spanDefault`; the input half of `oilEarnedWork`.
- `src/ui/oilmode.ts` — `heldClaim`, `oilHeldClaimHint`, `oilOffReason` (two new reasons), `oilSeatHTML`,
  `oilItemCellHTML`; `src/ui/AvailWindow.tsx` (the hint).
- `src/state/store.ts` — `placeholderShapeViolation`, registered as a HARD check in `wireStore`; `batchResult`.
- `src/ui/PeoplePick.tsx` — `PlaceholderGroup`, `pickProblem`; `src/ui/inputedit.tsx` — `placeholderRefused`,
  `normalizeInputDraft`, `commitGroup`, `reassignInput`, the editor's `save`; `src/ui/InputsPage.tsx` — `add()`,
  `saveEdit()`, the pencil editor's Person list, the person filter.
- `src/ui/inputscal-model.ts` — `EVERYONE`, `personFilterValue`, `personFilterId`, `personFilterPasses`;
  `src/ui/InputsCal.tsx dayEntries`.
- `src/engine/slots.ts acceptInput` ('u'); `src/engine/avail.ts dayAway`; `src/ui/html.ts` (the accept buttons);
  `src/leavewar/sync.ts oilPendingFor`; `src/state/demoseed.ts seedDemoPlaceholders`; `src/state/perms.ts`
  (`INPUT_FILER_NOTE`).
- The tests written for it: `src/engine/eventkind.test.ts`, `placeholderinput.test.ts`, `oilplaceholderclaim.test.ts`;
  `src/ui/oilplaceholderclaim.test.tsx`, `placeholderdoors.test.tsx`, `placeholderlist.test.tsx`;
  `src/state/demostamps.test.ts`; `e2e/input-allavail.spec.ts`.
Read the code these call and are called by — not only the changed lines.

## Your method (the order's §4, verbatim)
> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

## NOT a finding (owner D56)
> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.
Not open either: the owner's own choices (D711–D714 — the filer's one answer and no answer of a man's own; the six
kinds; one day; the filer's bell only; Event red, not amber; no "count me in / out"), and the five readings told to him
(the sheet's §0). A claim counts only with a concrete failure, its cause and its exact fix (D489).

## What we most want from you
1. **OIL — earned leave owed or withheld silently.** Trace every reader of "does this man earn from this request":
   `oilEarnedWork`, `spanDefault`, `claimDefault`, `earnsFrom`, `oilPersonOn`, `effectiveDefault`, `toggleOilPerson`,
   `oilEligible`, `oilFigureFor`, the window's counts, the publish comparison (`publish.ts` — the OIL delta, the
   pending words), the credit pass (`leavewar/sync.ts`). Is there a reader the one default does NOT reach? Can a tap
   write a decision that does the opposite of what the screen said? Does an ISSUED day ever read live inputs or live
   availability for this? `pruneHandedOverDecisions` — does it wrongly drop, or wrongly keep, a decision about a crowd
   man when the input's person changes to or from a placeholder (the request's `hand` / `leftAt`)? What happens to the
   answers and the scheduler's decisions when an admin turns a named man's input into an ALL AVAIL one, and back?
2. **The save boundary.** `placeholderShapeViolation` on `env.changes`: is `c.after` really the record as saved for
   every writer (the scheduler store's records, a restore, the Leave War's door, the projection that lands rows)? Can a
   legitimate command be refused by it? Can an illegitimate record reach storage without passing it (a path that
   writes inputs outside a command; boot; `loadWeek`; a plan switch; a version load)? Is the sentence shown, once?
3. **Every Person list and every reader of `person`.** A list that still omits the placeholders or shows another name
   over one; a reader that prints the raw id, treats a placeholder as a man (a count, an absence, a warning, crew
   rest, work hours, Insights, the Leave War, person delete / archive / post-out, the late mark, the bell), or
   compares the person filter with a person by hand. `isMe`, "mine", "Take me out", the member's read-only window.
4. **Event.** Any list, regex, switch, colour map, document or test that names the kinds by hand and missed it; the two
   `refwin.ts` twins; the typed-word matcher; anything that special-cases `Duty` or `Appointment` by name.
5. **The tests.** A test that would pass with its feature removed; a fixture that writes what the app could not
   (bug-check order §8.3); a claim in a comment that no named test proves.
6. **What is MISSING** from the sheet's roll-call (§3) — a surface, a door, a role, an order.

## What to hand back
Numbered findings, most serious first. For each: the concrete failure (setup → action → wrong result), its cause (file
and function), **exact step-by-step fix instructions**, and whether it is new with this change or older code this change
made reachable. Then **explicit negatives** — what you checked and found sound. Then a line: `VERDICT: PASS` /
`VERDICT: CHANGES REQUIRED`. End with `Rulings: none this session`.
