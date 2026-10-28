# M5a — the fresh narrow read of the FIX commits (29 Oct 26) — one Opus reader, read-only, who wrote none of the fixes

Scope (the checking order §5, "a fix is new code"): `git diff 92b43acf9 ea53c8fcb -- raptor-port/src raptor-port/e2e` — commits
8490d08ca (the walk's ten), 3bc897876 (walker D's four and the code read's five), 4a9cd01cb, d7ac53369, 654798c3f, 91928bd65,
ea53c8fcb (the browser-test fixer's) — read against the findings they answer (`walk-triage.md` "To fix", `walker-d.md` FAILs,
`code-read.md` 1–5, `e2e-fixer.md`, `fixer-2.md`) and the spec. Read from the code; nothing run. D56 applied: every failure below
happens to data made after the fix. D489: each has its failure, its cause and its exact fix.

**Count: 7 findings — 1 MEDIUM-LOW, 1 LOW-MEDIUM, 5 LOW.** Findings 1 and 7 are older than these fixes but sit on the very
paths the fixes claim (Escape closes what opened last; a refusal stands at its box); the rest are in the fixes' own lines.

## 1. MEDIUM-LOW — Escape with two war windows closes the one opened FIRST: the person window goes, the bid window over it stays

**Failure.** Desktop, the grid: tap a name — the person window docks at the right (it blocks nothing). Press a free day cell —
the bid window opens over it (C-F1, as built). Press Escape: the PERSON WINDOW closes; the bid window, opened last, stays. Same
on the Balances page: a name's window up, then "Grades…" — Escape closes the person window, not Grades. And while the person
window stands, the bid window (a blocking window) no longer holds Tab: Tab walks out to the grid and the person window behind
it — the W5-F3 failure the Tab hold exists to stop (a bid landing in a war no longer on screen).

**Cause.** `Sheet.tsx` decides "the topmost sheet" by DOCUMENT order — `all[all.length - 1] !== panelRef.current` in both the
Escape listener and the Tab trap. The person window is portalled to the END of `#page-leavewar` (`Matrix.tsx`, the
`createPortal(<PersonWindow…>, #page-leavewar)`), so it is always the last `.bidsheet`, whatever opened after it: the bid
window renders inside the grid host, Grades inside the Balances page, both earlier in the document. C-F2's fix (`under` /
`topSheet()`) settled app windows over war windows; war over war still goes by where a node sits, not when it opened.

**Fix.** In `Sheet.tsx` keep the war's own open order: a module-level `const OPEN: HTMLElement[] = []`; in a `useEffect` on
mount push `panelRef.current`, on unmount splice it out (`lastIndexOf`). Replace both `const all = document.querySelectorAll
('.bidsheet'); if (all.length && all[all.length - 1] !== panelRef.current) return` with `if (OPEN.length && OPEN[OPEN.length -
1] !== panelRef.current) return` (the trap's `!panel ||` guard kept). The kept-mounted guard and the `under` guard stay as they
are. (The `over`/`raised` layer read is not touched.)

**Red test** (`sheet-keyboard.test.tsx` or a new `sheet-order.test.tsx`): render a `<Sheet testid="a" modal={false}>` through
`createPortal(…, document.body)` (so it sits last), then a `<Sheet testid="b">` rendered inline before it; `fireEvent.keyDown(
document, { key: 'Escape' })` → `b`'s `onClose` called once, `a`'s not. And `Tab` with focus on `b`'s last control lands on
`b`'s first (red today: the trap returns, focus leaves `b`).

## 2. LOW-MEDIUM — the phone's person window stands over the top bar again while Approvals' slim bar is up (the walk's #7, its twin)

**Failure.** Phone (402 × 874): Approvals → tap a request's dates (the slim bar comes up at the foot) → back on the grid, tap
a man with several leave lines. His window is as tall as allowed and stands at top ≈ 35 — over the top bar's lower half, the
very fault #7 fixed (top 33–45), now only while the slim bar is up.

**Cause.** #7's fix holds the phone window's top under the bar through its `max-height` (`personwindow.css`, the
`@media (max-width: 700px)` rule: `calc(100dvh - 2 * (var(--topbar-h) + 8px))`, specificity (1,2,0)). `approvals.css`'s
`&:has([data-testid="appr-slim"].ph) .bidsheet:not(.full):not(.fullpage)` — (1,5,0) — overrides it to `bottom: calc(64px +
safe-area)` and `max-height: calc(100dvh - 122px)`. Centred by `margin: auto 0` between top 12 and bottom 64, a window at
that height stands at 12 + (874 − 76 − 752) / 2 = 35. d7ac53369 gave the person window its own slim-bar rule on the DESKTOP
only (inside `min-width: 700.02px`).

**Fix.** In `personwindow.css`, inside the phone block, as specific as approvals.css's rule (so it wins):
`&:has([data-testid="appr-slim"].ph) .bidsheet[data-testid="person-window"]:not(.full):not(.fullpage) { max-height:
calc(100vh - 2 * (var(--topbar-h, 0px) + 8px) - 52px); max-height: calc(100dvh - 2 * (var(--topbar-h, 0px) + 8px) - 52px -
env(safe-area-inset-bottom, 0px)); }` — with top 12 and bottom 64 + s, a window of that height centres at exactly the bar's
foot + 8 (12 + (H − 76 − s − h) / 2 = bar + 8 ⇔ h = H − 2·bar − 68 − s).

**Red test** (e2e, lw-phone): put the slim bar up (`appr-slim` visible), open `person-bane`'s window; `box.y ≥ topbar.bottom
+ 7.5` and `box.y + box.height ≤ slimBar.top − 7.5`.

## 3. LOW — Undo of an admin's Inputs-page delete leaves a struck "deleted by Saber" line beside the leave that is back

**Failure.** Saber deletes Ranger's approved LL (Mon 3 Aug) on the Inputs page, then presses Undo — the leave is back. Ranger
opens his window: his LL line stands AND a struck-through "Mon 3 Aug — deleted by Saber · today 09:00" with a dot. He reads a
leave of his as deleted that is not. Same for a bid "taken away" by a clashing input whose filing is undone.

**Cause.** 3bc897876 gave `inputLines`' delete branch and `crossLines` the `fld: 'deleted'` mark (code read 2). An Undo writes
only "Undo — …" (`changelines.ts logReversed`, no `fld`), and `personleave.ts` builds a struck line from every 'deleted' mark
since his visit without asking whether that leave stands again. (The war's own delete marks — `warLines`, `warInputLines` —
have the same gap and always had; the fix carries it to the Inputs page.)

**Fix.** In `personLeave`, before pushing each joined deletion `j`: skip it when `r0.iid` is set and an approved line of the
same `iid` is already in `out` (an Undo restores an Input under its own id), or, with no `iid` (a bid), when a pending or
approved line of the same `code` (and half, for a one-day line) covers every date of `j` and its `news`/placing moment is
later than `r0.t` — or simply when such a line covers all of `j`'s dates.

**Red test** (`personwindow.test.tsx`): Ranger's approved LL on D1; `ranger(); openOwnWindow(RANGER)`; `T(9); saber();
removeInput(it); globalUndo()`; `T(10); ranger()` → `personLeave(RANGER, since).filter(l => l.state === 'deleted')` is empty
and the approved D1 line is there (red today: one 'deleted' line).

## 4. LOW — the carried-forward box saves a figure that is no half, if it is past its bounds

**Failure.** App bal 20. In the carried-forward box "17.3" + Enter is refused ("Type a whole number or a half…"); "25.3" +
Enter saves 20 with nothing said, and "−0.3" saves 0. The fix's own comment says the opposite ("a figure that is no number,
or no half, still meets the store's refusal").

**Cause.** `BalancesPage.tsx saveTypedFigure`: `cf = Math.max(0, Math.min(n, Math.max(amount, 0)))` clamps before the store's
half check, so any n past a bound becomes a valid half; only NaN survives the clamp.

**Fix.** Clamp only a figure the store would take: `const half = Number.isFinite(n) && Number.isInteger(n * 2)`; `const cf =
part === 'cf' ? (half ? Math.max(0, Math.min(n, Math.max(amount, 0))) : n) : …` (the App bal branch unchanged). A non-half then
reaches `balanceProblem` and is refused in its words.

**Red test** (`balances.test.tsx`): App bal 20 incl. 5 typed; `saveTypedFigure(pid, 'LVE', 25.3, 'cf')` returns a string and
the stored cf is still 5; `saveTypedFigure(pid, 'LVE', 25, 'cf')` returns null and cf is 20.

## 5. LOW — a window that re-places itself while the keys are up loses that place when they go down

**Failure.** An iPhone held upright, the person window centred (the phone's form); he taps App bal, the keys come up; he turns
the phone sideways (844 wide — the desktop form, the window now docked) and closes the keys: the window drops to its place in
the page's flow, below the screen, its ✕ out of reach — the fault 4a9cd01cb fixed, back by this route. The Grades window the
same (it places itself in a `[phone]` effect too). An iPad turned with the keys up gets its old orientation's top back.

**Cause.** `Sheet.tsx useKeyboardInset` takes `before` once, at the first keyboard frame, and restores it when the keys go.
`PersonWindow.tsx` (its `[phone]` layout effect → `dock`, and `dock` on `resize`) and `GradesSheet.tsx` write a new place
while the keys are up; the follower overwrites it on its next frame and, on the way down, restores the stale `before` (here
the phone form's empty top, on a window whose desktop CSS has no top).

**Fix.** Remember what the follower itself last wrote (`let wrote: {top, bottom, maxHeight} | null`); at each keyboard frame,
if `before` is set and the panel's inline `top`/`bottom`/`maxHeight` differ from `wrote`, another writer placed it — take
`before` afresh from the panel before overwriting; set `wrote` after each write; clear both on the way down.

**Red test** (`sheet-keyboard.test.tsx`, the `Docked` set-up): keys up (`vv.height = 380`, resize); then write
`panel.style.top = '200px'` (the window re-placing itself) and fire resize again; keys down (`vv.height = 844`, resize) →
`panel.style.top` is `'200px'` (red today: `'120px'`).

## 6. LOW — a refusal under a box in the person window's right-hand tiles is cut at the window's edge

**Failure.** Desktop, an admin's own window: type "17.3" + Enter in the right-most kind tile's box (the five-column tile row,
`.r17-bal`). The refusal (`.bp-err`, `left: 0`, up to 220 wide) starts at that box and runs ~100px past the window's right
edge; the window scrolls sideways and cuts the words. On a phone the words end 4px off the screen's edge but the window's own
edge is 10px in, so its border and padding are cut.

**Cause.** `BalancesPage.tsx keepInSight` keeps the words inside `.bp-hs, .bp-scroll` (the Balances page's scrollers) or the
screen. The person window (`.bidsheet`, `overflow: auto` — personwindow.css) and the Grades window are neither, so the words
are kept on the screen but not in the window that clips them.

**Fix.** `const area = e.closest('.bp-hs, .bp-scroll, .bidsheet')?.getBoundingClientRect()` — the window a box stands in is
its sliding area.

**Red test** (e2e, lw-desktop): open `bal-name-bane`'s window as admin, type "17.3" + Enter in the last kind's box
(`pw-<last kind>`); the `-err` box's right ≤ the window's right − 3.5.

## 7. LOW (older than these fixes, on A-F1's path) — a refusal's words, "Type a figure" included, vanish the moment he leaves the box after Enter

**Failure.** Clear a box, press Enter: "Type a figure" shows (A-F1 — right). Tap anywhere else: the words go, the old figure
stands, nothing said — the A-F1 failure by one more step. Every refusal does the same ("17.3" + Enter, then a tap away), on the
page, in the person window and in Grades. FigBox's own docstring says "the words stand at the box until it is next typed in".

**Cause.** `FigBox`'s `onBlur` calls `commit()`, which with nothing typed since (`text === null`) runs
`setErr(commitText(null))` — `null` — and clears the words Enter just put up.

**Fix.** `const commit = () => { const t = text; if (t === null) return; setText(null); setErr(commitText(t)) }` — typing
(`onChange`), Escape and `lw-revert` already clear the words themselves.

**Red test** (`balances.test.tsx`): `typeIn('bal-LVE-bane', '')`, Enter → `bal-LVE-bane-err` reads "Type a figure";
`fireEvent.blur(box)` → still there (red today).

## Named limits and readings, not findings (each for the host or for him)

- **A deleted half-day Input's struck line reads as a whole day, 1 day** (fixer-2 named it). `inputLines` writes `itype:
  b.type` ('LL'); a half Input keeps its half in `half` / its times. If wanted: write `itype` as the war's notation (`*LL` /
  `LL*`) from the Input's portion (`leavewar/absences.ts`'s portion reader) in the delete branch's mark.
- **The 1 Jan reading (code read 4)** reaches a case the code read did not name: a man given his FIRST grade on 1 Jan gets
  nothing that year (was +33); the admin types his App bal. That follows D1490's "corrected by typing", but it is the agent's
  reading of a change made ON 1 Jan — name it to him with the regrade case.
- **The tab row between 341 and ~352 wide** keeps the ≤399 spacing; by the 320 figures (31px over, the ≤340 tightening worth
  ~35px) a wider-letter row there would still run ~10px over. No phone stands in that band (Android's smallest common is 360,
  where it fits by ~9px) — not measured; one e2e width at 345 would settle it.
- **B-F4's desktop twin:** at 701–1000 wide (an iPad upright) the Balances table scrolls sideways and a box tabbed into at its
  right may show its pending figure cut; `showCell` runs on the phone's list only. Not walked — a walk item.
- **A shrunk figure on a hidden page:** `fitFigure` measures 0 × 0 while the Leave War section is hidden, resets the letters
  and returns; a figure that needed shrinking (longer than "−12.5") changed by Undo or a sync while he is on another page shows
  cut when he comes back, until it next changes. Rare; a re-fit on the page showing again would close it.

## What held (one line each)

1. Escape, app window over a war window (C-F2): `under` / `topSheet()` leaves Escape to the viewer, the "No document",
   upchit, OIL and medical questions and the Inputs editor dialog (each has its own Escape); the next Escape is the window's.
2. A viewer opened BEFORE a war window cannot arise: the viewer is a blocking overlay that holds the keys, so no war window
   mounts under it; a question inside the war panel (`contains`) behaves as before.
3. C-F3: the person window's opener is focused back when the keyboard is lost or in the window; a tap on another name keeps it.
4. The keyboard follower, keys up/down/up on one mounted sheet, and a sheet closed and reopened (a fresh `before`): restores
   exactly what it found; a non-placing sheet gets its CSS back as before; dock and Grades write in layout effects, before the
   follower's first frame.
5. A-F3: the person window's boxes one width (4ch + edge); `fitFigure` resets then shrinks only an overflowing figure, ≥ 9px;
   the page's columns keep their widths; the 3px left padding keeps right edges on the drawing's.
6. A-F4: the second heading row pins at the first's measured height (both rows integer heights in the CSS), on resize too.
7. A-F2: the desktop OIL cell is a plain table cell, set right; the phone keeps `bp-oilc`.
8. B-F5: the page's height read in the page's measure (top + scrollY) — independent of where the window is scrolled.
9. B-F4 (phone): the box's whole cell brought inside the list, clear of the held names, after the browser's own slide.
10. #7 (no slim bar): the phone window's height puts its top at the bar's foot + 8, centred as drawn.
11. A-F6 desktop: the person window's slim-bar rule out-specifies approvals.css's (1,5,0 > 1,4,0); dock's inline
    `bottom: auto` keeps it top-anchored; `--pw-top` carries the top to the height rule.
12. A-F1: an emptied box says "Type a figure" on Enter or on leaving; Escape stays silent; a box taken away emptied says nothing.
13. FigBox in Grades' "+ days": the same words, the same clamp-free path (Grades saves through its own `save`).
14. The leave buttons' "left" (D 1–4): `.after` over `selCells()`'s dates in the window's half — the days and code a press
    writes; the drag window over its days, one man only; a Saturday or a re-press of the same bid unchanged.
15. The one minus (D 5): `figWords` in `FigureCell.tsx` (no import circle); the grid figure, its tooltip and the ask; a total
    keeps `show`; halves rounding changes nothing for figures that are halves.
16. The year picker across midnight (D 6): 'ahead' re-read from the app's today each draw; a past year picked stays picked.
17. Carried forward clamped (D 7) for a valid half; a clamp onto the figure shown saves nothing (finding 4 is the non-half case).
18. Pending "–" in the window, as the page writes it.
19. `rows.ts` config removal (code read 1): only `grades` is ever written absent (`lwDecompose`); every other field is always
    present, and one that JSON-drops to absent is truly gone — its row removed, the boot's default read; Redo puts it back.
20. Code read 2's marks: a member's own Inputs delete or clashing filing is his own hand, dropped by `marksOf` (`pid === me`);
    the war's own deletes keep `warInputLines`' mark (`!war`); CSE/OD never marked; crossLines runs only for non-war commands.
21. Code read 3's `markCands`: an Input's own mark (iid/iids) always counts; else same dates, same kind (`itype` is the code
    after for 'kind'/'moved', the Input's type for war-approved marks, whose missing half passes), same half where both halves.
22. Code read 4: `gradeBefore` / `<` only in the roll-over; `gradeOn`, `gradeOf`, `gradeDaysNow` untouched; the start grades
    (0001-01-01), a grade or days changed any day but 1 Jan, a deletion on 31 Dec, and a never-typed man (his first year's 1 Jan
    never runs) read as before.
23. Code read 5: `peopleCountedFor` is the engine's and `ownDays`' one list; a caller's context lacking him gets it; one with
    him is left alone.
24. The browser tests: no assertion loosened to pass — the scrim test moved to the blocking bid window (D641), HARPOON's
    figure read against the grid's own, the demo's own leave stepped round, MED read under its own today, `test.slow()` on
    the twenty-opening reload test.
