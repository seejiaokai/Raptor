# M5a — the person window builder's report (29 Oct 26, ~01:15) — saved as it arrived, lightly trimmed

**Checks:** `npx vitest run src/leavewar` 215 files, 3,762 passed, 4 failed — all the recorded-rows test (the tooltip words on
the figure beside each name changed); re-recorded with `-u`, each of the six `__rows__/*.html` checked against HEAD but for
those words, a dated note in `matrix-rows.test.tsx` (5 / 5). Re-run after: `counters.test.ts`, `store.test.ts`,
`personwindow.test.tsx`, `balances.test.tsx` 375 / 375; `changelines.test.ts`, `changesmodel.test.ts` 62 / 62.
`npm run build` exit 0 (with the host's security fixes in). e2e not run.

**New:** `ui/PersonWindow.tsx`; `ui/personleave.ts` (one man's leave lines and the new-since marks — approved leave one Input
one line; pending and refused one line a run by `reqRunKey`, across every war; days from `ownDays`); `ui/personwindow.css`
(the drawing's CSS, its class names); `ui/personwindow.test.tsx` (28). **Deleted:** `ui/CounterSheet.tsx` (the dead picker,
`PersonFiguresSheet`, `FigureBreakdownSheet`) — the helper ran `git rm --cached` on it by mistake and restored the index;
deleted in the working tree only.

**Changed:** `Matrix.tsx` — the window portalled into `#page-leavewar` (shows over Balances and Approvals); `openWho` takes
`openOwnWindow(pid)` at the tap, not during render; the OIL ask uses its `id`; the soft-focus guard `lwPage() !== 'grid'`; the
phone's frozen name copy reads `nameLines` (`figureCtx`, `figSel` gone); a leave line's tap — from Approvals the slim bar,
from Balances the grid, the OIL tracker closed, `ringCell`, on a phone the window closes; "0 ›" sets the page to the grid,
opens his tracker, closes the window. `MatrixRows.tsx` — `setBalOpen` gone, a tap on the LVE figure opens the window (reading
15), its tooltip "Tap for his leave". `LeaveLine.tsx` — an optional no-puck form with the dot, the muted "who, when", refused
and deleted states, paperclip and tap; the day panel's line unchanged. `BalancesPage.tsx` — `FigBox` gains `cls` and `fit`;
the page's save is an exported `saveTypedFigure`, shared with the window. `sync.ts openWarAt` — also `setBalancesUp(false)`.
`store.ts` — `setBalance` removed with its unused imports; `moveFigure`, `resetFigureOrder`, `visibleFigures`, `toggleFigure`
removed (nothing else used them); the stored `figureOrder` / `figureHidden` fields left. `counters.ts` — `figureLines`
removed. `state/changelines.ts` — the "approval taken back" line carries `fld: 'back'` ("put back to a bid"). `docs/file-map.md`.

**Tests rewritten:** `permsparity` (the balance case through `setTypedBalance` against `T.balance`, own row and another's);
`rows.test` (a typed balance is one `bal:` row); `store.test` (the pin that OIL could be set → "OIL is refused as a typed
figure"; App bal typed, a bid after it off War bal); `undoaudit` (Undo of a typed figure); `bidding` (brought to zero by a
typed CCL or an OIL correction, read in the window); `oiltracker` (the old "Set" tests type in the window's boxes; one
test's OIL opening written straight into the rows); `scrim` (the window blocks nothing — the scrim tests use the bid picker;
drag and Escape stay on the window, plus two "does not block" checks); `counters.test.tsx` (the breakdown, reorder and hide
tests deleted, each with why; "every tile, boxes on typed kinds, never OIL"; two type through `setTypedBalance`); engine
`counters.test.ts` (`figureLines` assertions against the figure itself); `person`, `frozencols`, `gridfigures` (reading 15),
`matrix`, `namepuck`, `phonehead` (new test ids). **e2e edited, not run:** `leavewar.spec.ts` (ids; the breakdown test →
"LVE figure opens his window"; the desktop scrim test on the bid window; 8 tiles and no boxes on another man's window);
`step4-leavewar.spec.ts` (`figures()` reads `pw-LVE-war`, `pw-oil`, `pw-med` — RISK: MED counts this year to today, where MED
TOT counted every year; its `medtot` assertions 2, 0.5 may fail).

**Readings to name to him:** a member who never opened his own window sees everything someone else did as new; the words
under a line — "added and approved by X", "added by X" (filed on the Inputs page by someone else), "changed by X" (an Input
changed later), "placed by X" (a pending bid an admin put on his row), "changed from LL by X", "put back to a bid by X";
ages "today 09:05", "yesterday 08:40", "26 Jan 08:40"; a deleted leave struck through, not a link, several days deleted
together one struck line; built for keyboard and screen readers where nothing was drawn — the year picker a real list styled
as the drawing's button, the dates a button; on a phone the window closes after a line tap; while locked every window shows
the padlock, another man's too; a man with no row gets no line links (★15); the lock landing while he types — his boxes go,
the figure refused by a passing note (FigBox's own). **Not done / left:** no machine mark for an Input deleted on the Inputs
page, so the window cannot strike such a leave through; `figureParts` and the old balance helpers stay in `counters.ts`
(`FIGURES` is still read by the store, Approvals, Balances and the history; `figureParts` carries D400's OIL tests);
`docs/ui-contracts.md` and `docs/feature-impact.md` not updated (the host's).
