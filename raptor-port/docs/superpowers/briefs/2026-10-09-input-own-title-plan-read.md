# Brief — read of the PLAN for "an input's own title" (one reader each; read-only; blind)

**You are one of two independent readers of a plan** (owner D67, D590, D601: Opus 5.5 planned; Astra and Sol 6.1 each
read it, blind — the change adds a field to a SAVED record, so two readers). Nothing is built. **Change no file. Do not
read the other reader's report** (`raptor-port/docs/superpowers/briefs/2026-10-09-reads/` is closed to you).

One round only. The owner has made every product choice (D715, D716, D717) and has approved the drawing. Say plainly at
the end: `VERDICT: CLEAN` (build it as written), `VERDICT: CLEAN WITH THESE EXACT CHANGES` (list them, each precise
enough to apply without asking you), or `VERDICT: NOT CLEAN` (what must be redesigned first, and by whom — the owner for
a product choice he has NOT already made, the planner for a technical one).

## The plan
`raptor-port/docs/superpowers/plans/2026-10-09-input-own-title-plan.md` — read it whole.
The approved drawing: `raptor-port/docs/mock/input-own-title.html` (its pictures in `docs/mock/img/input-own-title/`).

## Read these to judge it (nothing loads by itself for you)
- The rulings, one line each: `.claude/rules/decisions/scheduler.md` — **D715, D716, D717**, and D700–D714 (the
  placeholder input and the kind "Event"), D654–D663 and D681, D682 (a shared input), D629, D701 (the day card's small
  print), D178, D179, D103, D45 (a published day), D175, D468 (a request's row). `.claude/rules/decisions/oil.md` — D25,
  D2, D142. `.claude/rules/decisions/how-we-work.md` — D56, D489, D29, D473. `.claude/rules/decisions/people-accounts.md`
  — D200. **A ruling's full row — open it before leaning on its detail:**
  `grep -h '^| D716 |' .claude/decisions-full/*.md`.
- The backlog item: `OUTSTANDING.md` `[INPUT-OWN-TITLE]`.
- The code the plan leans on — verify every claim it makes about each:
  `raptor-port/src/engine/inputs.ts` (`INPUT_META`, `TYPE_GROUPS`, `typeGroup`, `inpLabel`, `isOther`, `isPersonal`,
  `isUnavail`, `shiftHardInput`, `shiftHardLabel` and its regex, `inputFlags`), `src/engine/schema.ts` (the input
  record, the ground row's `src` / `srcType`), `src/engine/overlay.ts` (`requestRowFields`, `srcvOf`, the landing on
  read), `src/state/holderbase.ts`, `src/engine/events.ts` (`shiftHardGround`, every push of a ground row's `prog` as an
  event label), `src/engine/validate.ts` (every use of an event's or an input's `label`), `src/engine/avail.ts`,
  `src/engine/oilev.ts` (`oilEvidenceKey`, what the evidence names of an input), `src/engine/drafts.ts` and
  `src/ui/pendlist.ts` (the changes window's labels), `src/engine/publish.ts` (`dayDelta`, `requestRow`),
  `src/engine/restore.ts` (`dayKeys`), `src/ui/inputedit.tsx` (`draftOf`, `normalizeInputDraft`, `commitNewInput`,
  `commitInputEdit`, `commitGroup`, the split / trim / re-date rewrites that mint a record from another, `setInpField`,
  `WIN_FIELDS`, the editor's Type row and read-only view), `src/ui/InputsPage.tsx` (`add()`, `saveEdit`, the row's Type
  cell, `fSearch`), `src/ui/InputsCal.tsx` and `src/ui/inputscal-model.ts` (`word`, the bar's tip, the day card),
  `src/ui/html.ts` (the week's ground row, `inpEditLabel`, the Personal Inputs / Unavailable cards),
  `src/ui/board-html.ts` (the board's ground row and input cards), `src/ui/oilmode.ts`, `src/testing/refwin.ts` and
  `reference/tfin.js` (the parity compare of the view week — search, never read whole), `src/state/demoseed.ts`,
  `src/probe-bridge.ts`.
- The contracts: `raptor-port/docs/engine-rules.md` (search "request", "shiftHard", "Other"), `docs/ui-contracts.md`
  (search "request row", "ground"), `docs/data-schema.md` and `docs/data-model.md` (the Input record),
  `docs/remarks-vocabulary.md` (every typed word that switches a rule on), `docs/feature-impact.md`.

## NOT a finding (owner D56)
The app's entire stored world is DEMO DATA that will be CLEARED before the database step. **Do not report a problem
whose harm exists only in data already stored when the code is already correct going forward** — no migration, no
back-compat, no "an existing record would read wrongly" (the plan's §3.3 ripple is known and accepted). If the app would
do it again to NEW data, report it. A claim counts only with a concrete failure, its cause and its exact fix (D489).
**Not open either: the owner's own choices** — which kinds take a title; that the title is the name wherever a name
stands; that "Other" takes the same box and its remarks become plain remarks; that remarks are left as they are; that
the kind stays in sight small (under the title on a phone's schedule row, on the day card's small-print line). Report
only where the PLAN fails to deliver one of them, or contradicts another ruling.

## What we most want from you
1. **Can a title's WORDS ever decide a rule?** The plan's §3.6 claims every rule goes on reading the KIND. Find every
   reader in `src/engine/` of a ground row's `prog`, an event's `label` or an input's label words (keyword regexes,
   `shiftHardLabel`, brief / standby / info / "OFF" / "SC" word tests, OIL, crew rest, the late mark, availability).
   For each: with a row that came from an input whose title is one of the vocabulary's words, does the result differ
   from the same input untitled? Name each reader that would, with the exact fix. Include the case the input is later
   DELETED (the row keeps `srcType`) and the case the scheduler renames the row by hand.
2. **Is "Other" safe to change?** `inpLabel` loses its remarks branch. Find everything that relied on an Other being
   named by its remarks — in the engine, the UI, the tests and BOTH twins of the original's suite (`refwin.ts`,
   `tfin.js`). Will `tfin` stay 728/0 and the view week stay byte-identical to the reference? Name what breaks.
3. **Is the new span on the schedule's row safe?** §3.5 adds `.nm-kind` inside the row's name cell on the week (edit,
   view, an issued face, the peek) and the board. Check the per-block swap (`ui/dayswap.ts`), the in-place text editing
   of the name cell (`data-txt`, carets, the amendment marks), drag targets, the row-height contracts in
   `scheduler.css`, the DOM ceilings, and the reference compare. Is reading it "off the ROW" (`srcType` against `prog`)
   right on an issued face, in the peek and for a row whose input is gone?
4. **The save paths.** Is there any door that writes an input and would DROP or fail to carry `title` — `commitGroup`,
   the split around a kept status, the trim, a re-date, `reassignInput`, `setInpField`, the List's `add()` /
   `saveEdit`, the Leave War's writes of an input, undo / redo, a load of an older issued version, the probe bridge?
   Is "stored only when it differs from the kind's name" sound when the KIND is changed later (title kept? cleared?)?
5. **A published day.** Trace a title-only edit of an input whose row is on an issued day: is it exactly ONE pending
   change, are the sign-offs dropped (D103), does the issued face keep the issued name, and does republishing clear it?
   And a title-only edit must ask NO OIL question again and move no OIL figure.
6. **The roll-call (§4).** Which surface that draws an input's name or kind is missing from it? (Print / export, the
   bell, the Logic page's kind table, Insights, the History bubble, a toast, a confirm sheet, an `aria-label`.)
7. Anything in the plan that is wrong about the code as it stands.

## Your report
Findings first, numbered, most serious first: the failure (concrete), its cause (file and function), the exact fix.
Then explicit negatives — what you traced and found sound. Then the VERDICT line.
