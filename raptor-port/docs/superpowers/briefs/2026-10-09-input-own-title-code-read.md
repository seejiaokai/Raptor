# Brief — read the CODE of "an input's own title" (one reader each; read-only; blind)

**You are one of two independent readers of finished code on a FULL bug check** (the checking order
`raptor-port/docs/bug-check-order.md` §4 rank 2, §4a; owner D67, D590, D601: Opus 5.5 planned and built; Astra and
Sol 6.1 each read it, blind). **Change no file. Run nothing that writes. Do not read the other reader's report, of this
round or any earlier one — `raptor-port/docs/superpowers/briefs/2026-10-09-reads/` is closed to you.**

The app has been WALKED already (the evidence sheet below, with its roll-call and what the walk found). You are not asked
whether the app runs; you are asked what reading finds that driving could not — and what is MISSING.

## What was built, and what it promised
- The plan, with what both plan readers changed in its §8 (where §8 and §§2–7 differ, §8 is what was built):
  `raptor-port/docs/superpowers/plans/2026-10-09-input-own-title-plan.md`. The approved drawing:
  `raptor-port/docs/mock/input-own-title.html`.
- The rules as documented: `raptor-port/docs/engine-rules.md` — the last section, "An input's own title"; the screens:
  `raptor-port/docs/ui-contracts.md` — search `An input's own title`; the record: `raptor-port/docs/data-schema.md`,
  `raptor-port/docs/data-model.md` (`title`).
- The evidence sheet — the tier, the rulings swept, the ROLL-CALL of every place an input's name is drawn or written,
  the walk and what it found, the break tests: `raptor-port/docs/handpass/2026-10-09-input-title-check.md`.
- The rulings, one line each: `.claude/rules/decisions/scheduler.md` — D715, D716, D717, and D700–D714, D654–D663,
  D681, D682, D629, D701, D178, D179, D103, D45, D98, D113, D114, D175, D468; `.claude/rules/decisions/oil.md` — D25,
  D2, D142; `how-we-work.md` — D56, D489, D29, D473; `people-accounts.md` — D200. A ruling's full row:
  `grep -h '^| D716 |' .claude/decisions-full/*.md`.

## The change itself
`git diff 6d22cf24..HEAD -- raptor-port/src raptor-port/e2e raptor-port/playwright.config.ts` (the branch
`claude/day-window-compact`; `6d22cf24` is the commit before this work). The pieces, by file:
- `src/engine/inputs.ts` — `titledKind`, `TITLE_MAX`, `titleOf`, `inpLabel` (the "Other reads by its remarks" branch is
  gone), `inpKindTag`, `goneRequestName`; `inpDetailKey` (the title, named only where there is one). The declared
  record: `src/engine/schema.ts`. The reference twin: `src/testing/refwin.ts` (`reirest`'s `_il`).
- `src/engine/events.ts` — `mapInp` carries the title; `buildDay`'s `push` and `reqRows` (a request's row is merged only
  with itself). `src/engine/validate.ts` — the sentences that name a commitment; "two items called …".
- `src/engine/drafts.ts`, `src/ui/pendlist.ts` (`requestName`, `inputWords`), `src/state/changelines.ts` (the "title"
  line; lines named by `inpLabel`), `src/ui/changesmodel.ts`, `src/ui/histbubble.ts`, `src/ui/interactions.ts` (toasts).
- `src/ui/inputedit.tsx` — `draftOf` (`title: … || null`), the new record, `commitInputEdit`, `commitGroup`'s `changes`,
  `WIN_FIELDS` / `fieldSay`, the Type row's change handler, the Title row, `oilGate`'s label.
  `src/state/inputgroup.ts` — `SHARED_FIELDS`.
- `src/ui/InputsPage.tsx` — the form's `title` state, `add()`, the pencil editor's Title box, the row's Type cell, the
  search, the two OIL-question builders. `src/ui/InputsCal.tsx` — the bar's tip, the day card's kind label, the remark
  line, `dayEntries`' search. `src/ui/inputscal-model.ts` — `BarItem.kind`, the month's search.
- `src/ui/html.ts` — `rowKindTag`, `inpKindTagHTML`, `plRow`, the input card. `src/ui/board-html.ts` — the board's row
  (`.sb-nmk`), its input cards. CSS: `src/ui/scheduler/04-pucks-sections.css` (`.nm-kind`),
  `13-board-rows-responsive.css` (`.sb-nmk`), `24-sans-calendar.css` (`.sd-kindtag`).
- `src/ui/oilmode.ts` — `oilRequestName`. `src/ui/export.ts` — `inputRows`. `src/state/demoseed.ts` — the demo's Event.
- The tests written or restated for it: `src/engine/inputtitle.test.ts`, `src/ui/inputtitle.test.tsx`,
  `src/ui/inputtitle-row.test.tsx`, `src/ui/latepub.test.tsx` (its last `describe`), `src/engine/scshift-inputs.test.ts`,
  `accept.test.ts`, `dutyrest.test.ts`, `blankabsence.test.ts`, `src/ui/inputscal-model.test.ts`, `inputsday.test.tsx`,
  `export.test.ts`, `src/state/demostamps.test.ts`, `src/engine/schema.test.ts`; `e2e/input-title.spec.ts`.
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
Not open either: the owner's own choices (D715–D717 — which kinds; the title as the name; "Other" takes the box and its
remarks are plain remarks; remarks left alone; the kind kept in sight) and the six readings told to him (the sheet's
§0 — among them: the label sits UNDER the name at every width; rows the scheduler types by hand keep the old "one
commitment" test). A claim counts only with a concrete failure, its cause and its exact fix (D489).

## What we most want from you
1. **A writer that drops or keeps a title wrongly.** Every path that creates, copies or rewrites an input record: the
   window, the List's form and pencil, `commitGroup` (kept, added, gone, regroup), the medical splits and trims
   (`mintMedSegments`, the tail), a re-date, `reassignInput`, `setInpField` (an in-place cell edit seeds `draftOf` —
   is the title carried, and is `null` vs `''` handled?), `setLeaveRemarks`, the calendar's drag, `person-delete.ts`,
   the Leave War's doors, the probe bridge's `fileInput`, undo / redo / restore. Can a draft that never knew of a title
   (a hand-made call) WIPE a stored one through `commitInputEdit`? Is `delete r.title` right for a leave turned into an
   Event later?
2. **`push` and `reqRows` in `events.ts`.** Is the new test right in every order of arrival — request row first,
   hand-typed row first, the same request row pushed twice (the seat and `more[]`), a row whose man is in the seat and
   also among its extras, the `blank` rows, rows of the midnight tail? Does any OTHER reader of `day.events` rely on
   one event per name (`avail.ts` live, Insights' counts, work hours, crew rest, OIL's work)? Could a man now be
   counted twice for one commitment anywhere a figure is shown?
3. **The published day.** `inpDetailKey` with a title on one side: `frozenInputMatch`'s pairing (a title-only change
   must pair as ONE changed input, never one gone and one new), `dayPendingItems`' folding of the input change with its
   re-made row (one item, D113/D114), the sign-offs' binding, a load of an older issued version, an Unpublish, and the
   issued face reading the FROZEN input (`inputOn`) for the row's name and its kind label. Is there an order in which
   the issued face shows the live title?
4. **The kind label's markup.** `rowKindTag` inside `plRow` (which lists share `plRow`, and can a non-request row carry
   `src` / `srcType`?), the per-block swap (`ui/dayswap.ts`), in-place editing of the name (`txtSet` reading the cell's
   text — can the label's text enter the name?), the amendment marks on the name cell, drag targets; the board's
   `.sb-nmk` wrapper against every CSS rule that addresses the row's children by position (`:nth-child`) at each
   breakpoint; the DOM ceilings (`probes/perf-port.cjs`). The view week against the reference: is the claim "a row
   named by its kind emits nothing new" true for every fixture the parity tests compare?
5. **Names that still bypass the title, or labels that leak.** Any surface that prints `inp.type` or a kind's name as
   the NAME of a titled input (search the tree — a tooltip, an `aria-label`, a confirm sheet, a toast, the bell, print,
   the Leave War, the SANS calendar); and the reverse — a place that must show the KIND (the Logic table, a kind
   filter, Insights) now showing a title.
6. **The tests.** Which of them would stay green with the feature broken? (Forty break tests were run — the sheet's
   §5.5 — find the wire they did not break.) Is any restated test weaker than the one it replaced?
7. The contracts as now written (`engine-rules.md`, `ui-contracts.md`, `data-schema.md`, `data-model.md`): anything they
   say that the code does not do.

## Your report
Findings first, numbered, most serious first: the failure (concrete — setup, action, what goes wrong), its cause (file
and function), the exact fix, and whether it is new with this change or older. Then explicit negatives — what you
traced and found sound. Then one line: `VERDICT: CLEAN` / `CLEAN WITH THESE EXACT CHANGES` / `CHANGES REQUIRED`.
