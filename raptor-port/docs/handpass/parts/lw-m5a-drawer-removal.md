# M5a — the builder helper's report: the grid's FIGURES drawer and the drag-grant bar removed (D1245, D1491) — 28 Oct 26

Saved as it arrived (the overnight guide: a helper's report is kept before anything is done about it), lightly trimmed.

**Checks it ran:** `npm run build` exit 0; `npx vitest run src/leavewar/ui src/ui/noglow-css.test.ts` 102 files, 1,478 passed,
24 skipped, 0 failed; e2e NOT run (the host holds the lock). Nothing committed by the helper.

**Deleted:** `leavewar/ui/FiguresDrawer.tsx` (only Matrix used it); `leavewar/ui/BalanceBar.tsx` (only Matrix and its own test).
`CreditForm.tsx` stays — the OIL tracker and DayList (`HalfPick`) use it; its header comment rewritten.

**Matrix.tsx removed:** `figuresOpen`, `drawerAt`, `drawerRef`, `onDrawerBox`, the drawer's two measuring effects (the
`--drawer-w` one included), `syncDrawerHeights`, `drawerRows`, the drawer mount, `mx-figures`, the stuck mirror's drawer
columns, `headerRow`'s drawer branch (now `(testids)` only), the dead `bracketRow` and its `brackets`, the figure-select
wiring and its outside-press / Escape effect, the reset effect, `figSelCtxRef`, `figSelFigure` / `figSelIds`, the BalanceBar
mount, the unused `figures` memo and the imports; `drawerRef` from the pinch's `alsoY`; `figuresOpen` (and `drawerAt?.width`)
from the four dependency lists — only those names. **Kept:** the LVE figure beside each name, its tap (`setBalOpen` →
`FigureBreakdownSheet`), the person sheet mount, the OIL tracker, the `PersonMonth` memos, `LwBody`, the inline placeholder
widths; `syncOverlayHeights` for the phone band.

**select.ts:** `wireFigureSelect`, `FigureSelectCtx`, `FigureSelection`, `FIGSEL_ATTR`, `FIGDRAG_ATTR` and the box helpers gone;
the gesture core's optional `edge` and `nodes` settings now unused, left in place. **matrix.css:** the drawer's rules, `.figpop`,
`.rot`, the bracket rows, every `.balbar` rule, the `data-figsel` / `data-figdrag` rules and the two `--figw` gone; `.mv-banner`
keeps the dock rule it shared. Comments only: `Sheet.tsx`, `CreditForm.tsx`. `docs/file-map.md` updated.

**Tests deleted:** `figdrawer.test.tsx` (its one live "unreachable" check moved to the new file); `figselect.test.tsx`;
`balancebar.test.tsx` (its `parseAmount` cases moved unchanged to `creditform.test.ts`); in `select.test.ts` the two
`wireFigureSelect` blocks; in `rowglow.test.ts` the drawer landing-line and selected-figure tests (`.mxdrawer` dropped from the
viewer-row test; the docked-panel test reads `.mv-banner`); `noglow-css.test.ts`'s dock check reads `.mv-banner`.
`draggrantoil.test.tsx` left — it pins Grant OIL in the day-cell drag window (D1394), live.
**Tests added:** `leavewar/ui/gridfigures.test.tsx` — no drawer toggle / drawer / `mx-figures` for admin and member; one LVE
heading and one figure cell a row; a mouse drag across three figures raises no bar, marks and writes nothing; a phone hold and
drag raises no bar; a tap on a figure still opens the breakdown, both roles. Not run against the old code.

**e2e edits (to be run by the host):** `e2e/leavewar.spec.ts` — `putDrawerAway` and its calls gone (the shared beforeEach's
too), the drawer guard in `openPicker`, the helpers `figBar`, `openDrawer`, `drawerBox`, `drawerNum`, `bar`, `pickRun`,
`keyAmount`; every skipped test that opened the drawer or used the bar; two live tests lost dead drawer branches (`dayAreaLeft`,
step 2 of the month-buttons / outline check); "a held finger dragged to the drawer's edge…" renamed "…the frozen columns'
edge…"; **"a member never sees the bar" replaced by "a drag down the LVE figures raises no bar and lights nothing, for an admin
or a member (D1491)" — to run.** `e2e/step4-leavewar.spec.ts`: `putDrawerAway` gone.

**Left dead in files the helper could not touch (for the next steps):** `MatrixRows.tsx` `PersonRow`'s required `figSel`
prop (Matrix passes `null`) and `selected={figSel === shown.id}`; `FigureCell.tsx`'s `selected` prop and `data-figsel`;
`engine/counters.ts selectableFigure` (only its own test); `CreditForm.tsx`'s `initialAmount`, `autoFocus`, `onCancel` props;
`docs/feature-impact.md` (~L1228–1233) and `docs/ui-contracts.md` (§Bulk balance entry from the figures, §The figures drawer)
still describe the drawer and bar; `src/testing/unit-times.ts` lists the deleted test files (script-written, ignores missing).
