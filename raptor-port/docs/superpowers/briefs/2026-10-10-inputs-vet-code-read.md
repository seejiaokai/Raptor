# Brief — read the CODE of "the design vet's changes to the Inputs calendar and list" (one reader each; read-only; blind)

**You are one of two independent readers of finished code on a FULL bug check** (the checking order
`raptor-port/docs/bug-check-order.md` §4 rank 2, §4a; owner D67, D590, D601: Opus 5.5 planned and built; Astra and
Sol 6.1 each read it, blind). **Change no file. You cannot run anything — read the source; where you would run
something, name the exact input and the host runs it. Do not read the other reader's report, of this round or any
earlier one — every folder `raptor-port/docs/superpowers/briefs/*-reads/` is closed to you.**

The host has WALKED the app (forty steps by script, at a desktop and a phone, as an admin and as a member — the
evidence sheet below, with its roll-call and its DOOR LIST); three walkers are walking the scenario designer's list
while you read. You are not asked whether the app runs; you are asked what reading finds that driving could not — and
what is MISSING.

## What was built, and what it promised
- The plan: `raptor-port/docs/superpowers/plans/2026-10-10-inputs-vet-plan.md` — §1 the seven pieces, §2 the door
  inventory (every thing the List's own add form did, and where it is in the window). The drawings the owner approved:
  `raptor-port/docs/mock/inputs-vet.html`, `raptor-port/docs/mock/card-questions.html`.
- The screens as documented: `raptor-port/docs/ui-contracts.md` — search `AFTER THE DESIGN VET`, `THE CARD'S REMARK
  LEAVES OUT`, `A SHARED INPUT NAMES EVERYONE`; `raptor-port/docs/feature-impact.md` — search `after the design vet`.
- The evidence sheet — the tier, the rulings swept, the ROLL-CALL (§3) and THE DOORS (§3a):
  `raptor-port/docs/handpass/2026-10-10-inputs-vet-check.md`. The host's walk: `raptor-port/scripts/handpass/ivet-walk.mjs`.
- The rulings, one line each: `.claude/rules/decisions/scheduler.md` — D727, D728, D729, and D620, D629, D641, D654–D660,
  D672, D681, D682, D700–D725; `how-we-work.md` — D726, D56, D489, D487, D29; `oil.md` — D25, D660 (named there);
  `people-accounts.md` — D287, D290, D299. A ruling's full row: `grep -h '^| D729 |' .claude/decisions-full/*.md`.

## The change itself
`git diff 5927fa70..HEAD -- raptor-port/src raptor-port/e2e` (the branch `claude/day-window-compact`; `5927fa70` is the
commit before this work). The pieces, by file:
- `src/ui/InputsPage.tsx` — **the List's own add form removed whole**: its fields, its state, `add()`, `filedFor`,
  `finishAdd`, and its own upchit, medical-clash and document sheets (the OIL sheet stays, for the desktop row's OIL
  chips). In its place `openNew` and the button `#inNew`. The reveal effect now also LIGHTS the row (`setFlash`). The
  desktop row asks `cardOf(team || [r])` for `names` and `by`. `rangeWords`. The filter boxes without label words.
  What the form did before: `git show 5927fa70:raptor-port/src/ui/InputsPage.tsx` (search `const add = (skipDoc`,
  `filedFor`, `finishAdd`, `<div className="inbar"`).
- `src/ui/inputedit.tsx` — `newInputSeed` (the one seed of a new input on the Inputs page; no date when the List asks);
  `archivedHere` (now also for a NEW input with `ctx === 'i'`); the Type field's key and `TypeLegend` (only where
  `win && !readOnly`); `save`'s first refusal ("Pick a start date on the calendar first"); `doSave` / `doMedSave` each
  run inside `HOOKS.toastBatch` (`saveNow`, `medSaveNow`); the `hint` at the foot of the form.
- `src/ui/TypeLegend.tsx` (moved out of `InputsPage.tsx`; its Escape listener is on `window`, capture).
- `src/ui/inputcard-model.ts` — `remarkOnce`, and `cardOf(rows, people, corner)`; its two callers
  (`InputsCal.tsx` the opened day, `InputsPage.tsx` the phone's list) hand in `cardWhen(...)`.
- `src/ui/inputscal-model.ts` — `barText`; `src/ui/InputsCal.tsx` — the bar's `timed` class, `openAdd` through
  `newInputSeed`, the fold's four lines, the key; `src/ui/InputsSettings.tsx` — the three helper lines;
  `src/ui/PeoplePick.tsx` — the `form` variant removed.
- CSS: `src/ui/scheduler/25-inputs-calendar.css` (`.ib-bar.timed`, `--ib-c`, `.in-placed`, the filter labels' rules
  removed), `14-input-editors.css` (`.inped-kh` and the card laid in the flow), `06-inputs.css` (the form's own rules
  removed; the Name column 250px; `.in-open` wraps).
- Tests: new `src/ui/inputsvet.test.tsx`; restated for the window — `inputs.test.tsx`, `inputtitle.test.tsx`,
  `sharedline.test.tsx`, `placeholderlist.test.tsx`, `docconfirm.test.tsx`, `inputstabs.test.tsx`,
  `audit-e-window-sort.test.tsx`, `whoplaced.test.tsx`, `placedshown.test.tsx`, `groupeditor.test.tsx`,
  `inputs-calendar-flow.test.tsx`, `windowdoors.test.tsx`, `inputsmonth.test.tsx`, `inputssettings.test.tsx`,
  `inputscal-model.test.ts`, `inputcard-model.test.ts`; `e2e/inputs-calendar.spec.ts` (three new tests named D729),
  `e2e/step4-leavewar.spec.ts` (`fileOnInputsPage` now drives the window), `e2e/input-allavail.spec.ts`.
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
Not open either: the owner's own choices (D727 every name and the pill on the desktop list alone; D728 the card only —
the app still WRITES "till" into remarks, `[TILL-FROM-DATES]` is a later job; D729's five as drawn) and what D729 left
out on purpose (LATE's tooltip, "Default window", the button word "Add", month-first dates in the window, the
schedule's and the board's dialogs and their lines, the SANS calendar's window, a time box shown am / pm by the
browser, a saved shared input's window opening on the whole people picker, the desktop month re-laying when a day
opens). Told to him, not a finding: the window opens fresh each time (the form kept its dates, kind, people and hours)
and on the calendar's first kind; the window's title still reads "Drifter +3"; a row is lit when it is added, changed
or put back by Undo; no "?" for a reader who may not change the input. A claim counts only with a concrete failure,
its cause and its exact fix (D489).

## What we most want from you
1. **A thing the List's form did that nothing does now** — or does only for some roles, or only at one width. Compare
   the old `add()` line by line, refusal by refusal and question by question, with the window's `save` / `saveNow` /
   `medSaveNow` / `commitNewInput` / `commitGroup`: the order of refusals; `inputProtected` (a locked week) for a new
   input, a group, a medical cascade; `placeholderRefused` for one person and for "Several people"; `pickProblem`; the
   SANS branch (must be unreachable); `docGate`; the upchit summary and its removals; the medical clash and its kept
   segments (`medKeptSegments`, `mintMedSegments`, the `withRemarksTail` of the first segment); `oilAsks` / `oilGate`
   and who the question names; `stampPlaced` (who filed it — `by`, `at`, `grpBy`); `mod`; the title (`titleOf`); the
   half (`half` only where not all day); `yr`; what is revealed and lit after each kind of save (one record, a group,
   a medical save that mints several rows) and after a REFUSED save.
2. **The no-date seed (`newInputSeed()` with no argument).** `draftOf` of a record with no `date`; every reader of
   `draft.start` before the new first refusal and after it — `placeholderRefused`, `pickProblem`, `docGate`,
   `normalizeInputDraft`, `oilGate`, `upchitEffects`, `medClashes`, `withRemarksTail`, the window's title (`when`), the
   `RangeCal`'s month, `datesHere`, the "changed behind the window" follower (`base`, `WIN_FIELDS`), the swap question
   (`other`, `pplTouched`) when "+ Input" is pressed over another new window or over a saved one. Is there any path —
   Enter in the Title or Remarks box, the OIL "Answer…" buttons, a sheet's resume (`save(true)`) — that reaches a
   write with no date? Does `fmt('')` (the loaded week's Monday) reach a record anywhere?
3. **The one note (`HOOKS.toastBatch` round `saveNow` and `medSaveNow`).** Every toast raised inside: a refusal, the
   Leave War door's own sentences, "Input added"; `close()` and `stay()` inside the batch; a throw; a save that opens
   a second sheet and returns; the OIL-only path; `saveOwnOil` (outside it — right?); `del` / `delEntry` / `takeMeOut`
   (outside it — do THEY cover a sentence the delete itself raised?). `ui/toast.ts toastBatch` joins in order and takes
   the strongest colour — can a success be painted as a warning wrongly, or a warning lost?
4. **`remarkOnce`.** The corner strings `cardWhen` can produce (hours + "till", another year, a half day) against the
   remarks `withRemarksTail` / `remarksDateTail` can write ("till 17 Jul", "on 9 Feb", the Leave War's and the medical
   cut's own tails — `remarksTailWord`); the regular expression's edges (a day "1" inside "11", "Jul" inside "July",
   capitals, two tokens in one remark, separators left behind, a remark of spaces); a shared input whose records'
   remarks differ; the desktop row must NOT use it. Is there any other surface that draws a CARD and was missed?
5. **The desktop row.** `cardOf(team || [r])` for `names` / `by` against the old `placedLineOf` / `placedLine` and the
   old "Saber +N": a person on no list, a deleted or archived man, a placeholder, a group that shrank to one, records
   whose `by` differ, a record with `by` and no readable `at`; the `alone` class; the search and the Person filter
   against names that are now all printed; the sort key by Name; the CSV export (must be unchanged).
6. **The month.** `barText` for every `BarItem` (`more`, `narrow`, a one-day shared bar on a phone, a titled shared
   bar); every other reader of a bar's text or of "+N" (the tooltip, the drag ghost, `aria`, tests, the keyboard's
   announcements); `timed` for a half day, for a shared entry whose records differ, for the ghost; `.ib-bar.timed`
   against `.is-cont`, `.is-on`, `:hover`, `.ic-ghost`, `.is-picking`, the phone's rules; `--ib-c` where `color-mix`
   is not supported.
7. **`TypeLegend` in the window.** Its Escape listener (on `window`, capture) against the window's own (on `document`,
   capture), the shell's (`ui/FloatWindow.tsx`) and a sheet's; its outside-press listener against the window's
   drag handle and the page behind (D641); `inert`; two windows; the legend's ids (`inTypeHelp`, `inTypePop`) now
   that the form's are gone — is anything else still looking for the form's ids (`inAdd`, `inType`, `inRemarks`,
   `inCal`, `inPerson`, `inTitle`, `inDates`, `.inbar`, `.ingrid`, `.ifield`) in `src`, `e2e`, `probes`, the Help
   page's words, the IT flow guide's scripts?
8. **Tests that prove less than they say** — a restated test that no longer exercises the claim in its title; a claim
   of the form's old tests that was dropped rather than restated (compare `git diff 5927fa70..HEAD --
   raptor-port/src/ui/inputs.test.tsx`); an assertion that cannot fail.
9. **Tidiness (D489 — filed, not fixed; three questions of the CHANGED lines only):** is a thing said twice that
   could be said once; is there a name that misleads; is there dead code or a dead style this change left behind?

## What to hand back
Findings, most serious first. Each: what breaks (the concrete failure — setup, action, what the screen or the record
says), where (file and function), why, and the EXACT step-by-step fix. Then explicit negatives ("I checked X and found
nothing") for each numbered area above. Then the tidiness notes. Say plainly what you could not determine by reading.
