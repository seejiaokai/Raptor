# `[LW-ROWS-SPLIT]` — Fable's blind read (13 Oct 26)

**What I read:** the brief (`docs/superpowers/briefs/2026-10-13-lw-rows-split-read.md`); `git diff origin/main...HEAD` for
`raptor-port/src` (commit 990ba7344 on `claude/lw-rows-split`, merge base bab1ed8d8); `Matrix.tsx` as it stands on
`origin/main` (4,824 lines) and on the branch (4,265 lines), `MatrixRows.tsx` (524 lines), `matrix-rows.test.tsx` and the six
recorded rows under `__rows__/`; `tsconfig.app.json`; the gate runner, the browser suite's web-server command and the
deploy workflow; every document and comment that names a moved thing. **Blind:** nothing under `docs/handpass/` but this
file. **Not run:** no test, no build, no type check (a gate run was in progress). My helper scripts lived in my temp
folder and compared the three files and their imports; one probe asked the bundler's transformer (from the repo's
`node_modules`, in memory, nothing written) how it treats one import line.

## Findings, by severity

### F1 — HIGH (fails the build and the browser gates; nothing on screen) — a type imported as if it were a value

`raptor-port/src/leavewar/ui/Matrix.tsx` line 37:

```
import { GROUP_DRAG, GROUP_PRIO_DRAG, MANNING_DRAG, NO_QUALS, PersonMonth, PersonRow, QualPill, RowApi, RowDragCfg, cellOpenable, freeHalfBeside, ownAwardAlone, setPhWidth } from './MatrixRows'
```

`QualPill`, `RowApi` and `RowDragCfg` are `export type` in `MatrixRows.tsx` (lines 19, 77, 80) and are used in `Matrix.tsx`
only in type positions (line 369 `cfg: RowDragCfg`, line 1334 `new Map<string, QualPill[]>()`, line 1342
`useRef<RowApi>(null!)`). `tsconfig.app.json` sets `"verbatimModuleSyntax": true`, under which a type must be imported
with the `type` modifier — error 1484, *"'X' is a type and must be imported using a type-only import when
'verbatimModuleSyntax' is enabled"*. The compiler this repo runs (`typescript` 7.0.2, the native `tsc.exe` under
`node_modules/@typescript/typescript-win32-x64/lib/`) carries that message (found twice in the binary). Nowhere else under
`src/` does a type cross a module boundary without `type` — this line is the first (checked by a search for the
leavewar types imported bare; the only hit is this line), which is what that setting enforces.

- **Setup:** the branch as committed. **Action:** `npm run build` (`tsc -b && vite build`). **What happens:** `tsc -b` refuses
  `Matrix.tsx` with three 1484 errors; the build gate is red; the e2e gate is red too, because its web server runs
  `npm run build` first (`playwright.config.ts` line 76); the deploy workflow's `npm run build` step likewise. **What
  should:** green, as the HANDOFF block claims ("the type check passes") — I could not reproduce that claim without
  running the compiler, which this read forbade; the gate run in flight will show it. Look at the build gate first.
- **Why the pinning test still passed and the app still draws:** neither the test runner nor the bundler checks a named
  import against the module's exports. Vite 8's transformer keeps the three names in the import under this tsconfig
  (probe: with `onlyRemoveTypeImports` on, the import line comes out unchanged; off, the three names are dropped), and
  Rolldown treats an import that is not exported as a WARNING (`checks.importIsUndefined`, default on; the value is
  `undefined`), never a failure. The three names are never read at run time, so the built bundle behaves exactly as
  before. In the plain dev server (unbundled modules) the browser's own loader would refuse the module — not a gate.
- **Fix:** on line 37 write `type QualPill, type RowApi, type RowDragCfg` (keeping the other ten as values). While there,
  drop `PersonMonth` and `cellOpenable` from the line — `Matrix.tsx` never names either (both are used only inside
  `MatrixRows.tsx`; they may stay exported, harmlessly).

### F2 — LOW — an import the move added that the moved block never uses

`raptor-port/src/leavewar/ui/MatrixRows.tsx` line 15: `import { leaveInputAt } from '../sync'`. The 507 moved lines name
`leaveInputAt` once, inside a comment (line 150, "never `leaveInputAt`"); no code reads it. Nothing breaks (`noUnusedLocals`
is off; `Matrix.tsx` already loads `../sync` on its line 33, before `./MatrixRows`, so load order is unchanged; `sync.ts`
imports only `./ui/dates` and `./ui/warask` from the ui folder, so there is no cycle). It is still a new dependency of the
row file on the Raptor-side sync module that the rows do not have. **Fix:** delete line 15.

### F3 — LOW — "each file's imports pruned to what it uses" is overstated for `Matrix.tsx`

Still imported, no longer used anywhere in `Matrix.tsx` (every remaining mention is inside a comment): line 1 `memo`;
line 3 `beforeFirstStint`, `isDuty`, `lastDayIn` and the types `Period`, `Grid`, `States`, `Role`, `Figure`, `FigureCtx`;
line 37 `PersonMonth`, `cellOpenable`. No gate fails (`noUnusedLocals: false`, no lint gate), so this is tidiness only.
(`Group`, `balanceOf`, `groupOf`, `oilLedgerOf`, `popAt` were already unused on `origin/main` — not this change's.)
**Fix:** drop them from those three lines, or leave them; nothing depends on it.

### F4 — documents and comments the move made untrue (hunt 4)

Each says the thing lives in `Matrix.tsx`; it now lives in `MatrixRows.tsx`. Historical records (plans, briefs, specs
under `docs/superpowers/`, the evidence sheets) are dated and stay as written.

| Where | Says | Correction |
|---|---|---|
| `OUTSTANDING.md` line 1491 | "the free half, `Matrix.tsx freeHalfBeside`" | `MatrixRows.tsx freeHalfBeside` |
| `raptor-port/docs/ui-contracts.md` line 6769 | "(`Matrix.tsx startRowDrag`, `MANNING_DRAG`)" | `startRowDrag` is still Matrix's; `MANNING_DRAG` is `MatrixRows.tsx`'s — "(`Matrix.tsx startRowDrag`, `MatrixRows.tsx MANNING_DRAG`)" |
| `raptor-port/docs/ui-contracts.md` lines 7231–7233 | "`Matrix.tsx`'s `startRowDrag` is now driven by a `RowDragCfg` … `ROSTER_DRAG` (people) and `MANNING_DRAG` (counts)" | add: the `RowDragCfg` type and the four configurations live in `MatrixRows.tsx` since 13 Oct 26 |
| `raptor-port/docs/performance.md` line 473 (round 12, "roster row is a memoised `PersonRow`") | files: "`Matrix.tsx`, `period.ts`, `availability.ts`" | add `MatrixRows.tsx` (the row itself) |
| `raptor-port/docs/performance.md` line 520 (the round with "(b) day cells memoised per-month (`PersonMonth`)") | files: "`Matrix.tsx`, `matrix.css`" | add `MatrixRows.tsx` |
| `raptor-port/docs/leavewar/known-gaps.md` lines 712–714 | "`Matrix.tsx` the measuring … the ROW memo contract (a `PersonRow` is a pure function of its props …)" | the measuring is still Matrix's; the row contract is now `MatrixRows.tsx`'s — name it |
| `raptor-port/src/leavewar/ui/CountRows.tsx` line 145 (comment) | "(Matrix: MANNING_DRAG)" | "(MatrixRows: MANNING_DRAG)" |
| `raptor-port/src/leavewar/ui/FigureCell.tsx` line 21 (comment) | "Matrix's own title-tooltip text (PersonRow)" | "MatrixRows' own title-tooltip text (PersonRow)" |
| `raptor-port/docs/file-map.md` | the new line 1153 is right; there is no entry for `Matrix.tsx` itself to correct (none exists — the six mentions are inside other files' rows) | nothing |

Not made untrue: `.claude/rules/decisions/leave-war.md` lines 160 and 233 and `performance.md` line 273 name the
components without a file; `settingssheet.test.tsx` line 305 names `GROUP_DRAG` without a file.

## The five hunts — what I checked, and what I found nothing in

1. **A line changed in the move — NOTHING.** A script took the one block `git diff` removes from `Matrix.tsx` (main lines
   200–706, 507 lines, the only non-import change) and compared it line by line with `MatrixRows.tsx` lines 18–524: 507 of
   507 identical, the only differences being `export ` prefixed on exactly thirteen lines (19, 35, 43, 49, 77, 78, 80, 108,
   128, 135, 223, 228, 353). No other line left `Matrix.tsx`; the only other changes in it are its import lines (1, 3–4, 19,
   23, 37). All three files are LF, no byte-order mark. `ROSTER_DRAG` and `ownAwardPresent` stay unexported, and
   `Matrix.tsx` does not name either.
2. **An import that changed what a name means — F1 and F2 above; otherwise NOTHING.** Every name the block uses and does
   not declare is imported in `MatrixRows.tsx` from the same module, under the same name and the same kind (value or
   type), as `Matrix.tsx` imported it on `origin/main` (checked by script: no name differs). No module-level declaration
   of `Matrix.tsx` outside the block is read by the block (none of Matrix's remaining module-level names — `MONTHS`,
   `monthLabel`, `moveReason`, `postInOr`, `postOutOr`, `rowInWindow`, `sameStuck`, `stayWords` — appears in it), so
   nothing is missing or shadowed. The names pruned from `Matrix.tsx` (`MutableRefObject`, `ReactPointerEvent`,
   `recordsAt`, the four `move*` store functions, `touchesAM`, `touchesPM`, `winsOf`, `DayView`, `Portion`, `CreditRec`,
   `parseHM`, `Views`) are not used anywhere in the file that remains (`startRowDrag` types its event as
   `React.PointerEvent`, the global namespace). Pruning removed no module: every module those names came from is still
   imported by `Matrix.tsx` for other names, except `../engine/dayview` and `../../engine/time`, which are pure
   helpers with no load-time side effect and are still loaded (through `MatrixRows.tsx` and the engine). **The
   stylesheet:** `./matrix.css` is imported by `Matrix.tsx` alone (line 38, its last import, exactly as on main); no other
   source file imports it; `MatrixRows.tsx` is imported on line 37, before it, and everything `MatrixRows.tsx` imports was
   already imported higher up in `Matrix.tsx`, so the order in which stylesheets and modules are evaluated is unchanged.
   Not importing it from the row file is right — the rows never stood alone, and the one test that renders them
   renders `<Matrix />`.
3. **The memo boundary and identity — NOTHING.** `PersonRow` and `PersonMonth` are the same `memo(function …)` calls with
   the same props types (`PersonRowProps`, `PersonMonthProps`, moved verbatim) and the default shallow comparison — no
   comparator was there to lose. `NO_QUALS`, `MANNING_DRAG`, `GROUP_DRAG`, `GROUP_PRIO_DRAG` and `setPhWidth` are declared
   once, in `MatrixRows.tsx`, at module level, and `Matrix.tsx` imports those instances; `ROSTER_DRAG` is declared once
   there and used only by `PersonRow`. Nothing in either file re-creates any of them per render. `Matrix.tsx` on main
   had no module-level `let`, so no binding is written across the boundary; the block read nothing hoisted from below
   it. No circular import: `MatrixRows.tsx` imports `../engine`, `../engine/dayview`, `../state/store`, `../sync`,
   `./FigureCell`, `./dates` — none of which imports `./Matrix` or `./MatrixRows` (`sync.ts` reaches the ui folder only for
   `./ui/dates` and `./ui/warask`).
4. **Everything else that names the moved things — F4.** Code: `LeaveWarPage.tsx` and forty-odd tests import only
   `Matrix` from `./Matrix`; nothing imported `PersonRow`, `PersonMonth`, `cellOpenable`, the configurations or the
   predicates from `Matrix.tsx` on main, so no import breaks. (`UsersPanel.tsx` has its own unrelated `PersonRow`.)
5. **The pinning test — what it holds and what it does not.** It renders the real `<Matrix />` with the date held at
   15 Jan 26 and records the `outerHTML` of every `row-*` and `group-*` element — all twelve months of 2026 are drawn in
   the test's window (every `cell-ramp-2026-01 … -12` is in the record), sixteen rows, ~375 KB a world. In the record:
   the callsign, seat bar and CAT chip with `has-quals`; the `me` row (member worlds); the figure box (`bal act`,
   `data-fig`); whole-day, `am`, `pm` leave; duty `sc`; `info` codes; `appr`, `ref`, `tbc` states; the `raptor` edge;
   the corner mark `mkd`/`more`; a posted-out man (`gone`, `pofin`, `polast`); `weekend`, `off`, `locked`, `act`.
   **Not in the record, and a row drawn differently there would pass it:** the placeholder cells (`lwph-l` / `lwph-r` —
   never present, because the whole year is drawn), the rearrange grip and `arrange` / `dragging` / `dragover` classes,
   leave or an award dated outside a man's time in the squadron (`outlv`, `potag`), the SANS tag, the `moved` stripe,
   the amber `warn` mark, the quals popover, hover states, the deciding mode, the header, the counters and the four
   fixed rows, any sheet, the phone's layout, and the memo boundary itself (the tidiness read asked the new test to
   assert that an unrelated sheet does not repaint `PersonRow`; it does not — no test pins a render count, and
   `repaint.test.tsx` checks that the grid DOES redraw on an Inputs change, the opposite property). What stands for
   each: placeholders — `e2e/leavewar.spec.ts` (the only suite that names `lwph`) and `colwindow.test.ts`;
   rearrange and drag classes — `rowglow.test.ts`, `arrangepaint.test.ts`, `settingssheet.test.tsx`,
   `countersamong.test.tsx`, `matrix.test.tsx`, the e2e; outside-window leave and the PO tags — `po.test.tsx`,
   `pi.test.tsx`, `daylist.test.tsx`; the SANS tag — `po.test.tsx`; the moved stripe — `bidding.test.tsx`,
   `movestandard.test.tsx`, `moveone.test.tsx`; the amber mark — `bidding.test.tsx`, `counters.test.tsx`,
   `daylist.test.tsx`; the quals popover — `matrix.test.tsx`; deciding — `deciding.test.tsx`; the free half —
   `freehalf.test.tsx`; the own award — `ownaward.test.tsx`; header, counters and fixed rows — `counters.test.tsx`,
   `counts.test.tsx`, `monthstrip.test.tsx`, `flyrows.test.tsx`; the phone — `phonehead.test.tsx` and the e2e at phone
   width; the memo boundary — nothing but the code read (hunt 3). Since the move is line-identical, the gap is a gap
   in the record, not evidence of a change.

**Rulings:** none this read (read-only).
