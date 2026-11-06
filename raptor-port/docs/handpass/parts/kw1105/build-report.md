# The keyboard and windows batch — the builder's report (the night of 5 Nov 26, phase A)

Saved as it arrived, before anything was done about it (the overnight guide). Builder: a fresh Opus helper. Branch
`claude/keyboard-windows-batch-5eff45`, last pushed commit `373af8bbc` (11 commits on `d7f63b6a8`). Status: READY FOR WALK.

## Built
- **D1645** — `ui/barfree.ts` (new) `useBarFree(pop, open, close)` carries the Traffic window's way for four windows
  (AirPop now uses it too): the veil from the bar's foot (`.air-below`, the bar's height watched), Undo and Redo free
  (`BAR_KEEPS`), any other bar control closing the window first; the keys back to the opener when the window closes
  while they are on Undo/Redo (in a passive effect, after React's own focus move); over another veil it keeps its whole
  veil (the viewer opened over an input's own window keeps the bar covered). `Modals.tsx`: AirPop's copy removed,
  DayPop wired. `WeekCal.tsx`: Escape heard on the document (`useEscWindow`), keys back to its button. `DocViewer.tsx`:
  re-reads each row by id (not on read-only pages), closes when an undo removes the input. `pops.ts`: `DAYPOP_NAV`
  (week and page), `WEEKCAL_NAV`, `DOCVIEW_NAV` (page). `08-windows-tools.css`: comment only.
- **D1647** — `Modals.tsx airEditable()` = `isAdmin() && CURPAGE === 'editsched'`, deciding what is drawn and guarding
  every write (`airEdit`, typing, ✕, Add row).
- **D1648** — `html.ts reportNote(w, gi)` the one body of the red note, each distinct sentence once in order met; all four
  writers use it (`intimesInner`, `refreshWaveReports`, two in `textedit.ts`); the issues list unchanged.
- **D1646** — `sheetfocus.ts menuKeys`/`menuFirst`: a menu opened by Enter, Space or ↓ (pressed on its button, no pointer
  press since) puts the keys on its first `.wm` pick, ↑ ↓ move and wrap; mouse-opened unchanged. `board.ts popMenu`: a
  pick by keys gives them back to the button. `interactions.ts routeMenuKey` (↓ opens a menu; ↓ in the duty-role box opens
  its list; registered in `Shell.tsx`); the stores menu keeps the keys on its chip through its redraw; `routeOpenKey`
  takes Enter/Space on the day name. `board.ts dayTabsHTML`: chips `role="button" tabindex="0"`, `aria-current` on the
  picked day. `SchedBoard.tsx`: Enter/Space press a chip, keys kept on it through the redraw; Sort all closes on Escape
  (`useEscClose`). `html.ts`: the edit week's `.dow.crewday` gets role and tabindex (`html.test.ts normDow` lifts them;
  the view week unchanged). `boardescape.ts keepTabOnBoard`: Tab goes round the open board, a Tab from behind comes back
  onto it; what lies over the board keeps its own keys. CSS: the cyan `:focus-visible` ring inside a pick's edge
  (`10-board-history.css`, as picture 2b), on the chips and the day name (`11-drag.css`).
- **[WINDOWS-KEEP-KEYS] leftovers** — the keys on nothing after the OIL question had two causes: the OIL question put
  before a change (`OILWAIT`) was not counted as a window over the schedule, so the Tab route walked on behind it; and a
  sheet gave the keys back to the exact node, replaced by the answer's redraw. Fixed: `pops.ts windowOverSchedule` counts
  `OILWAIT`; `schedule-tab.ts` notes its source as opener when its save raises a window; `useSheetFocus` finds the
  control again by its marks (`locate`). The red note's refresh test: `reportnote.test.tsx`.
- **[DOC-POINTERS-CODE]** — comment pointers in `leavewar.spec.ts`, `audit-d-keyspace.test.ts`, `overnight.test.ts`,
  `html.ts`, `latemark.test.tsx`, `AdminPage.tsx`, `hooks.ts`, `refwin.ts`. Differences from the item: the `CHIP_LABEL`
  trap is in `HANDOFF-ARCHIVE.md` (checked by search), so the pointer names it; `AdminPage.tsx` has one HANDOFF pointer
  now. `canonical.ts` and `weekglide.ts` left, as the item says.
- **Records** — `docs/ui-contracts.md` four paragraphs (D1645, D1646, D1647, the keys-back leftover) and a D1648 line; the
  stale "other veiled windows keep the veil" sentence fixed; `docs/file-map.md` a job line and `barfree.ts`.
  `playwright.config.ts` adds `keys-windows`; `inputs-readers.test.ts` adds `ui/DocViewer.tsx` to RECORDS;
  `amendretest.test.tsx` reopens day details after each page change (a page change now closes it; readings unchanged).

## Tests added (red without the change checked by reverting the source each time)
`barfree.test.tsx` 10 (9 red, 1 pin) · `reportnote.test.tsx` 8 (D1648 red; the issues-list count and the AB-F2 refresh
are pins, the refresh confirmed by removing its note half) · `boardmenukeys.test.tsx` 20 (19 red, mouse-open pin) ·
`oilkeysback.test.tsx` 2 (both red) · `e2e/keys-windows.spec.ts` 12 (11 red on the old code; the input window keeping
its veil a pin).

## Checks run (from `raptor-port/`)
Touched and neighbouring unit files PASS (~30). 100 unit files of windows and keys under the lock: one failure
(`amendretest`), fixed, PASS. Full unit suite under the lock: 13737 passed, 20 skipped, 1 failed (`inputs-readers`),
fixed and that file passes — the full suite NOT re-run after (GitHub's run covers it). `npm run build` PASS.
`e2e/keys-windows.spec.ts` 12/12 under the lock. Neighbouring e2e (board-escape-traffic, medical, inputs-batch2, datecal,
sched-phone, look-keys, oilwait, schedule-tab, topbar-names) 137 passed, 2 skipped. `lint:changed` no new finding (one
raised and fixed). `docsize` OK. NOT run: `reference/tfin.js`, the Tracker smoke (untouched areas; GitHub's run).

## Seen that the mock-up does not draw (D1625) — to put to him as built
1. The cyan ring on a menu's small buttons (pencil, gear, Manage, the stores editor's ↑ ↓ ✕), drawn just outside them;
   the mock-up shows it on a pick only. Keys only.
2. With "Jump to a date" open, a press on the calendar button closes it and opens it again (no toggle) — "any other bar
   control closes it first, then does its job".
3. After "Don't add" on the OIL question put before a change, the keys go to the bar's "Answer OIL", as before; only an
   answer gives them back to the box.

## Not built / left
- In the stores menu's pencil (editing) mode, deleting a store still loses the keys; ↑ ↓ and toggles keep them.
- A read-only document viewer (the Leave War's papers, a file not yet saved) is not closed when an undo removes its
  input; shown as given.
- Older faults met: none new.
