# Section 1 (the guard rail) — step K1, second of three passes: K1b, what a component holds (chat 198, 26 Nov 26)

**K1 is part A of the plan — one answer to "what is open".** K1a landed the seam (`src/state/guard.ts`), the drawn
predicates (`src/ui/windrawn.ts`), and the guard's table and functions (`src/ui/guard.ts`) for every window whose
state is a module flag. **K1b (this brief)** adds every window and every piece of typed work whose state is a
component's own, gives the Calendar family its ruled shape, hands over the two edit modes' ends, and marks the two
Leave War windows that close by themselves. **K1c** is the Tracker — leave everything under `src/tracker/` alone.
No door asks the guard yet: after K1b the app still behaves as today, **but for one fault closed** (item 6).

## Read first

- **K1a's brief and report** — `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k1a-brief.md`,
  `…-msq-s1-k1a-report.md` — and K1a's code: `src/state/guard.ts`, `src/ui/guard.ts`, `src/ui/windrawn.ts`, the two
  test files `src/ui/msq-guard-rollcall.test.ts` and `src/ui/msq-guard-open.test.tsx` with their `TO_COME` lists
  (yours to shrink: everything marked K1b).
- The plan `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md`, by section, never whole (find
  each by its heading): **§21.1 whole** — its three blocks ("Step 0 — this part read against his answers", "K0 —
  done", "His three answers of 26 Nov 26") **win over any older line**; §21's "Rules for every section"; §21.5 (the
  files more than one section changes — the rows for `ui/UsersPanel.tsx` and `leavewar/ui/BidPicker.tsx`); §3.1,
  §3.2 (a), (e), (f), (h), (i), §3.3, §3.4 (R3, R7, R8), §3.5 (A6, A7, A12, A16, A17, and A2 / A3 / A10 for the rows
  you add); §4.7's row B18; §18.1; §10's "Every step" rule.
- `.claude/rules/raptor-executor.md`; `.claude/rules/decisions/people-accounts.md` §Many squadrons and
  `.claude/rules/decisions/inputs.md` (both with the Read tool); for the Leave War sheets
  `.claude/rules/seams/leave-war.md`.

## What is built

1. **Admin's six reports** (`useGuardWork`, §3.1, §3.2 (h)) — `ui/UsersPanel.tsx`: `PersonEditor`, `ArchivedEditor`,
   `Waiting` (Give access); `ui/SquadronsPanel.tsx`: `NewSquadron`, `MoveEditor`, `PlaceEditor`. `on` is "anything
   differs from how it opened" in each (D2595, D2598). One call a line. **The "Add a person" form's report is step
   K2b's — not here.** In `UsersPanel.tsx` change nothing else: the Admin → Users section owns the rest of that file.
2. **`oilrevise`** — the OIL question raised from a row of the Inputs list (`ui/InputsPage.tsx`, §3.2 (e)).
3. **The Calendar family, as he ruled (D2654 E1; §3.2 (a))** — K1a left these as plain `window` rows:
   - `days` (Calendar): **`closes`**, with its own setter in `ui/pops.ts`, while none of its forms and no read-in
     sheet holds something not saved;
   - `everywd` and `holiday`: `window` rows that take **`dirty`** — a holiday with anything typed or changed; Every
     Monday once something in it is pressed, not as it opens with one choice lit; a new holiday no leave period
     covers counts (read what the app does with it today before you build, and say what you found);
   - `holimport` — a holiday sheet read in and not yet added (`ui/HolidaysPanel.tsx`), a `useGuardWork` report;
   - `inputsset` and `sansset`: **`dirty`** = anything changed since it opened; unchanged, closed by `closeShown()`
     with the Calendar; changed, the row refuses.
   R8's list gains each id that now closes, **each citing D2654 E1 in the test**.
4. **Quals' "Add qualification" box** — the `qualsnew` report (`ui/QualsPage.tsx`, `counts: 'row'`), counted only
   while the box is drawn (edit mode on) and holds words (D2729 Q2).
5. **The two edit modes' ends (§18.1)** — the rows stay `'no'` and gain `end()`, handed over by
   `useGuardCloses('lgedit', …)` in `ui/LogicPage.tsx` (**`flushRuleApply()` first, then `setLgEdit(false)`**) and
   `useGuardCloses('qedit', …)` in `ui/QualsPage.tsx` (K1a's row ids — the plan's text says `logicedit` / `qualsedit`) (clearing `qEditing`, `qualsEdit` and its armed delete —
   never `newQual`). `closeShown()` runs each open mode's `end()` with the closers. Done's own toast is not said when
   `end()` ends a mode. No door calls `closeShown()` yet.
6. **The one behaviour change of this pass — a fault the presser confirmed** (§21.1 "K0 — done"; the report
   `…-msq-s1-k0p-report.md`, Part 2 C): Quals' Done leaves words typed in "Add qualification" hidden in the box, and
   today they come back in the **next squadron's** box after a pick. **Words left hidden after Done are dropped when
   the squadron in view changes; on the same squadron they come back as today.** Nothing new is drawn. Its test
   first, seen failing.
7. **The Leave War's two show-only windows (his D2740)** — `leavewar/ui/Sheet.tsx`: a sheet may be opened with
   `showOnly`; `OPEN` keeps that mark and the sheet's own closer beside its id. Two rows read the one list:
   `lwsheet` (`window` — any sheet open without the mark) and **`lwshow` (`closes` — the marked ones, each closed by
   its own closer)**. **Exactly two `<Sheet …>` calls take the mark:** the sheet for a leave filed on the Inputs page
   (the same sheet reads "OIL the app credited") and the sheet "Your OIL award" — in `leavewar/ui/BidPicker.tsx`,
   **one word on each call and nothing else in that file** (the posting-sheet section owns it; §21.5). Find the two
   by their spoken names; if either is not where the plan says, or one `<Sheet>` call serves a window that must
   refuse as well, stop and report before marking it. "Open for bidding", a person's window, "OIL TRACKER" and every
   other sheet stay unmarked. R8 gains `lwshow`, citing D2740.

**Not in K1b:** any door, the note and every word a person reads (K3), the checker (K7), `ui/guardnote.ts`,
`ui/toast.ts`, anything under `src/tracker/` or `src/engine/`, `state/perms.ts` beyond reading,
`ui/usersfilter-model.ts`, `ui/userslist-model.ts`, `ui/AdminPage.tsx`, `leavewar/ui/SelectSheet.tsx`,
`OutcomeChips.tsx`, `bidpicker.css`.

## Tests first, each seen failing (a pin seen passing, and named a pin)

- **`src/ui/msq-guard-rollcall.test.ts`:** **R3** whole for everything outside `src/tracker/` (every frame counted,
  per file, each occurrence mapped to a row id, to the counted window it stands in, or to a `'no'` reason — §3.4);
  R7's planted cases for R3; R8's additions; `TO_COME` shrunk to K1c's items only.
- **`src/ui/msq-guard-open.test.tsx`:** **A6** (all but the "Add a person" half, which is K2b's — leave it in
  `TO_COME` marked K2b), **A7** (the Leave War's half: a person's window behind the Inputs tab; then his right
  lowered to View; the day panel never counted), **A12**, **A16**, **A17**, **B18** (a pin from here); **A2, A3 and
  A10 extended** to every row this pass adds — A3 with: each of the two marked Leave War windows opened by its own
  door, `whatIsOpen()` null, `closeShown()` closes it, an unmarked sheet beside it left as it was; `closeShown()` ends
  Logic's edit mode after flushing a value still waiting, and Quals' edit mode; and the test for item 6.
- **Must stay green, untouched:** every test of `UsersPanel`, `SquadronsPanel`, `QualsPage`, `LogicPage`,
  `InputsPage`, the Calendar, the settings windows, `HolidaysPanel`, `EveryWeekday` and the Leave War's sheets (find
  them by name and run them), with `src/ui/pops.test.ts`, `src/state/view-reset.test.ts`, the `msq-guard-*` files.
  The Leave War's suite runs under a hostile time zone — do not weaken that.

A test that will not fail first and is not a pin is reported, never bent. An existing test is changed only where
item 6 changes what it pinned — named in the report with why.

## Then

As K1a's brief: the touched and named test files green (`npx vitest run <files>`, in `raptor-port/` by its full
path); `npm run build` only with the checks lock free and taken, and nothing serving on port 4741; no full suite, no
browser test, no Tracker smoke. Do not commit, do not push, do not edit `HANDOFF.md`, the plan, or any file outside
`raptor-port/src` and your report. A file you need that is not named here or on §21.1's list — stop and say so.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k1b-report.md`

Every file changed and why; each report and row added, with its ruling; the two `<Sheet>` calls marked (file and
line) and how you made sure no other window shares them; what the app does today with a new holiday no leave period
covers, and with Every Monday as it opens; each test seen failing first then green, or "pin — seen passing", with
counts; `TO_COME` as it now stands; every place today's code differs from the plan's account of it; anything you
could not check without a browser. End your reply with the report's path and the four-line footer of
`.claude/rules/raptor-executor.md` (Status / Changes / Checks / Open items).
