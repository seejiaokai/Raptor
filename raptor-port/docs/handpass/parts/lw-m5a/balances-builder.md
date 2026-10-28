# M5a — the Balances page builder's report (29 Oct 26, ~00:20) — saved as it arrived, lightly trimmed

**Status:** built, unit tests pass; not seen in a browser (no preview, no e2e, per the brief). Not committed by the helper.

**Files (raptor-port/):** new `src/leavewar/ui/BalancesPage.tsx` (the page, the `FigBox` box, the row's grade list), new
`ui/GradesSheet.tsx`, new `ui/balances.css` (the drawing's CSS under `bp-` / `gw-`, scoped under `#page-leavewar`), new
`ui/balances.test.tsx` (31 tests); `ui/lwnav.ts` (`LwPage`, `lwPage()`, `setBalancesUp()`; `setApprMode` other than 'off'
takes Balances down; the OIL ask may carry `id?`); `ui/Chrome.tsx` tab row only (Balances between Approvals and OIL, round
19's bars glyph, `tabOn` general; the member guard still switches only Approvals off); `LeaveWarPage.tsx` (`Body` off
`lwPage()`, the grid hidden but mounted with `setLwOnScreen(page === 'grid')`; Approvals' scroll unchanged; Balances opens at
its top and scrolls inside itself; leaving the Leave War ends Balances); `ui/phonehead.test.tsx` "is one tab stop" rewritten
(the member row is Grid → Balances → OIL); `docs/file-map.md`.

**Checks:** vitest on balances, phonehead, chrome, m4page, leavewarpage, m5a-gate, sheet-keyboard, nonmodal — 8 files,
155 / 155; `npm run build` exit 0 (with the other helpers' edits in).

**★17:** `FigBox` takes the person, kind and shown figure at focus; saves on blur; unmounted with typing in it (to Days
taken) still saves to that man; a refused unmount save says so in a passing note ("Ranger LVE App bal not saved: Locked by
admin"). Tested: another name, Days taken, Lock, Grades…, Undo / Redo. **★20:** `inputMode="text"` as CounterForm's boxes;
accepts "-2", "−2", "2.5", "+3"; else `balanceProblem`'s words at the box. Whether his iPhone shows a minus — his phone only.

**Built with tests:** admin, member unlocked, member locked; Enter / leaving saves, Escape reverts, a refusal at the box, a
carried-forward correction writes the row afresh, Undo / Redo; Days taken's heading names the View period; the grade box and
list (arrow keys, Escape back to the box, "No grade" amber dashed); Grades — rename (duplicate refused with the store's
words), + days, + Grade, delete asks first ("3 people hold Junior WSO: they become No grade"), Undo restores, a grade nobody
holds goes at once, the grip's arrow keys, one landing line (D890), Escape in a box reverts then closes and returns focus;
non-blocking sheet, under Grades… on a desktop, in the middle on a phone; the lock (switch / padlock), a member's slim
"Locked by admin" line on a phone; phone names stay while figures slide, the pinch with the OIL tracker's `wirePinch`
set-up; rows memoised on a figure signature. Not testable in jsdom: icons dropped under 400 wide, the pinch.

**Needs changes in files not its own (handed to the person window builder):**
1. The person window and the OIL tracker render inside the grid host, `hidden` while Balances or Approvals is up — a name
   tap on Balances, and My leave from either page, open nothing visible; portal the window into `#page-leavewar`.
2. "0 ›" opens the OIL tracker at the top: it asks `{ kind: 'oil', id }` but `Matrix.tsx` ~L381 ignores the id —
   `setOilTracker({ person: a.id ?? null })`.
3. The bell's Leave War line from Balances: `sync.ts openWarAt` calls `setApprMode('off')` but not `setBalancesUp(false)`.
4. Undo can scroll the hidden grid: `Matrix.tsx` ~L3342's soft-focus guard checks `apprMode() === 'page'`; it should be
   `lwPage() !== 'grid'`.

**Departures from the drawings (to name to him — D1424):** the puck is `sync.ts puckHtml` (what the drawing script and
Approvals use), not `NamePuck`; the phone's search — the drawing shows the closed magnifier only, a tap opens a slim search
line under the bar (a state not drawn); the phone's tabs keep at least their words' width (the walk fix B-F1), where the
drawing used 0 — the same wherever the tabs fit; CSS marked "(built)" for the inner scroll with sticky headings, focus
rings and the refusal bubble; the phone tab spacing and icon drop live in `balances.css`; round 14's fake figures not
reused — the real engine is.
