# Fresh blind read of the fix commit — claude/lw-faults-1106 (7083ee930)

Reader: a fresh Opus chat that wrote none of this code. Read-only: no project file changed except this report.
Read: `git show 7083ee930 -- raptor-port/src` (Matrix.tsx's guard, store.ts's comment, `doubletap.test.tsx`,
`css-wrapper-css.test.ts`), against `read-code.md` F2–F5, F7, F8 and the walk's S4e. Context read: Sheet.tsx's tap shield,
select.ts's D262 guard, the month strip's markup. Ran `doubletap.test.tsx` and `css-wrapper-css.test.ts`: 2 files, 16 tests,
green. Ran a copy of the CSS checker over every real stylesheet, classifying each rule after a close (below).

## Findings (most severe first)

### 1. MEDIUM — (d) a deliberate re-tap on a day, after the grid tap that closed the window, is eaten (now for 600 ms)
**Steps (phone).** Open a day's window. Tap another day, Y, on the grid: the tap shield takes it and closes the window, and
nothing opens (as designed). Tap Y again, at the natural pace of someone who has just seen the window go (300–550 ms).
**Wrong result.** Nothing opens; a third tap is needed. Before (d) the second tap opened Y; with this commit's 600 ms it is
eaten nearly every time (it was 450 ms before this commit, so this commit widens it).
**Cause.** `Matrix.tsx` ~1557–1561: every close of `open` / `sel` arms `guardGrid(true)`, and `from` (~1525) is the last
press wherever it was — here the shield's grid tap (Sheet.tsx ~116–145 closes on its `click`; the always-on `pointerdown`
listener on the document sees that press, since the shield stops propagation, not same-node listeners). The second tap is a
finger within 32 px of `from` → swallowed. (d) is "a double tap on a leave button": a button that vanishes from under the
finger. A close made by a press on the grid itself has no such button — the place under the finger was the grid all along,
and the person's second tap there is the one he means.
**Fix.** Arm the place guard only when the closing press was inside a window panel. In the always-on listener record it:
`inWin: e.target instanceof Element && !!e.target.closest('.bidsheet, .sheet-part')`, and in `guardGrid`:
`if (second && !from?.inWin) return`. Test (needs `matchMedia('(pointer: coarse)')` stubbed so the shield is on): open a
day, tap another day (closes), tap it again at once → its window opens. The comment's "every press that ends it" then reads
"every press on the window that ends it".

### 2. LOW — (d) a window closed by a key (Escape), or by no press at all, guards the place of an OLD press
**Steps.** Phone with a keyboard (or any close not made by a press — an Undo's soft ask, a refused change, a store notify):
tap day X (window opens, `lastPressRef` = X's spot), press Escape, then within 600 ms tap X again → swallowed. Desktop:
click X, Escape, click X again inside the system double-click time → the browser counts detail 2 → swallowed.
**Cause.** `Matrix.tsx` ~1525 takes `lastPressRef.current` at arming with no check that it is the press that closed the
window; ~1543–1548 never forgets a press.
**Fix.** Forget the press on a key: in the same effect add
`const key = () => { lastPressRef.current = null }; document.addEventListener('keydown', key, true)` (and remove it in the
cleanup). A key's close then arms nothing (`if (second && !from) return`), which is right — a key leaves no finger to
double-tap. Finding 1's `inWin` also covers the press-that-opened-the-window case (a grid press is not `inWin`).

### 3. LOW — tests: the 600 ms and F4's always-on listener are not pinned
- `'a finger's second tap 0.3 s after the close, at the same place, is still the double tap'` passes on the parent commit
  too (its 450 ms covers 300 ms): it proves nothing this commit changed. The walk's case was ~440 ms; wait **500 ms**, so
  the test is red at 450 and green at 600.
- No test sends the second press's `pointerdown` before the guard is armed (F4's order). Reverting to a listener added at
  arming keeps every test green. Add: `pointerdown` on `bid-LL`, `pointerdown` on the day cell, then `click` on `bid-LL`,
  then `click` on the cell (same spot) → no window. Red on the parent (its listener missed the press, `finger` false).
- The "Show ›" path's month-strip exemption (`guardGrid(false)` now lets `.mstripe` through) has no test; one in
  `nightwalk.test.tsx` beside F2's: press Show, then a month button at once → it is pressed.

### 4. LOW — [CSS-WRAPPER-GUARD] the size pin lets the list grow back
**Steps.** Move one listed bidpicker.css block inside the wrapper and take its line off the JSON (201 lines, `KEPT_MAX`
still 202, green). A later change adds a new stray and a matching JSON line → 202 ≤ 202, green: the list grew.
**Cause.** `css-wrapper-css.test.ts` ~317: `toBeLessThanOrEqual(KEPT_MAX)`, lowered only if someone remembers.
**Fix.** `toBe(KEPT_MAX)` with the message "lower KEPT_MAX to the new count" — a line leaving then forces the edit, and any
growth is a visible test change. (The commit's own head comment names the remaining gap: an edit inside a listed block is
unseen. Fine as stated.)

### 5. NIT — [CSS-WRAPPER-GUARD] rule edges, all failing safe or absent today
- `bare()` strips every bracket's contents, so `:is(#page-x) .a` / `:has(#page-x …)` (full id weight, truly scoped) is now a
  stray; F7 asked only for `:not(…)`. Strict, fails safe, no real rule hit. Narrow to `:not(` / `:where(` if one ever
  appears (`:where(#page-x)` has no weight, so rejecting it is right).
- Rule 2's list lacks `@page`, `@font-palette-values`, `@view-transition`, `@position-try` (none may sit inside a style
  rule). None exist today.
- Rule 3 passes a body/html *state* by convention, not by weight: `body.x .a` (0,2,1) still loses to `#page-x .a`. The
  three real passes (`body.lw-bal-on`, `body:has(.bidsheet.raised) .airpop…`) are meant to be outside, so it holds today;
  worth one line in the head comment that a state pass is trusted as intent.

### 6. LOW (records) — F5's comment says "filed", and nothing is filed
`store.ts` ~1568–1570: "keeping them live could part the two — filed (the code read of 6 Nov 26, F5)". No backlog item for
the rollback putting back the jump-to-a-day fields exists in `OUTSTANDING.md` yet. The reasoning holds (a period switch
writes `focusDate` beside `currentId` — store.ts ~6211), so the comment-only answer is sound. File the item before this
work closes, or the comment points nowhere. Also still open from `read-code.md`: F1 (the other windows over the grid) and
F6 (drag window / frozen-name tests) — not in this commit.

## Checked and sound
- **Mouse double click** (detail 1 then 2): the second press is recorded, `detail ≥ 2`, `at` = its own press, within 32 px →
  swallowed; a mouse single click (detail 1) always goes through, whatever its place. A mouse cannot lose a press it meant
  unless it is a browser-counted double click at the same spot (finding 2's Escape edge only).
- **Finger double tap, iOS / Chromium:** the second `pointerdown` is caught by the always-on capture listener on
  `document` (the shield's `stopPropagation` does not stop a listener on the same node); if it ever came before the arming,
  `from` is that press and `now === from` falls back to the click's own spot — still swallowed. 32 px against fingers'
  spread of about 5–20 px between two taps is a fair catch; it is wider than D262's 12 px, but there the second click is a
  mouse's on the same spot, here a finger's. Coordinates are the viewport's, so a grid that scrolls under the close still
  matches the screen spot the finger hit; the grid's CSS zoom does not change `clientX`.
- **The closing click is never its own victim:** the guard is armed from the effect React flushes inside the click's
  dispatch, and a capture listener added on `document` during that dispatch is not run for it.
- **600 ms**: covers the walk's 440 ms Chromium touch click; on the desktop it only matters for detail ≥ 2, and the
  browser's own double-click time (500 ms by default on Windows) already bounds that. A system set to a longer
  double-click time could let a slow double click through after 600 ms — accepted.
- **"Show ›" (`guardGrid(false)`)**: `from` is null, so every pointer click on the grid is swallowed for 450 ms exactly as
  before; the only change is the month strip passing. The strip exists once (`tbody.mstripe`, Matrix.tsx ~3706), not in a
  pinned copy.
- **S4e**: the `.mstripe` test is red on the parent (finger, time only) and, since both taps fall at (10,10), it passes
  only by the strip's exemption, not by the place check — it proves its name.
- **F3's test** ("a finger's quick tap … away … opens it") is red on the parent and green now. The four older tests
  still prove their names with the new press-then-click helpers.
- **CSS checker**: `blankComments` steps over strings with their escapes before opening a comment; it gives the same blocks
  as the old regex on every real stylesheet. `@layer` recursion and `;`-ended `@layer a, b;` both read right. Over the real
  set: approvals.css (one `@keyframes`, one named), balances.css (`body.lw-bal-on` — a state), bidpicker.css (14 named,
  3 `body:has(.bidsheet.raised) .airpop…` states, the 202 listed blocks), matrix.css (4 `@keyframes`, 11 named),
  oiltracker.css (7 named); no selector passes by naming the page only in brackets, none by a bare `body`/`html`; JSON
  unchanged at 202. It passes for the right reasons.
- **store.ts**: comment only; `restore` unchanged.

Not a finding under D56: none of the above lives only in stored data.
