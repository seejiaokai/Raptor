# Fresh blind code read — claude/lw-faults-1106 ((d), (f), [CSS-WRAPPER-GUARD])

Reader: a fresh Opus chat that wrote none of this code. Read-only: no project file changed except this report.
The change read: `git diff origin/main..HEAD -- raptor-port/src` (Matrix.tsx, store.ts, three new tests, the outside list).
The three new test files were run once on this PC: 3 files, 14 tests, all green.

## Findings (most severe first)

### 1. MEDIUM — (d) the other windows over the grid keep the same fall-through
**Failure.** On a phone: tap an event on an event row → the event window opens → double tap its Save (or ✕). The first
tap saves and closes; the second lands on the grid where the button stood and opens that day's window (or a man's
figures). The same for the person window (a man's figures — ✕), and the other windows the grid opens over itself
(Settings, the counter form, the Events list, the Manning sheet, the OIL tracker).
**Cause.** `Matrix.tsx` (the new effect after `unswallowRef`): `const up = !!open || !!sel` — only the one-day window and
the drag window arm the guard. `eventEdit`, `who`, `counterEdit`, `settings`, `eventsOpen`, `manningInfo`, `oilTracker`,
`evPeek` (states declared at Matrix.tsx ~306–367) close the same way, over the same grid, through the same `Sheet`.
The roll-call (§6) for "a window over the grid closing" has these as MISSING rows.
**Fix.** Widen `up` to every window state the grid opens:
`const up = !!open || !!sel || !!eventEdit || !!who || counterEdit !== false || settings || eventsOpen || !!manningInfo || !!oilTracker || !!evPeek`
(one window replacing another keeps `up` true, so no guard there). Better still, one place: arm it from the shared
`Sheet`'s unmount, so every window built on it is covered, including ones added later. Tests: a double tap on the event
window's Save and on the person window's ✕ opens nothing behind.

### 2. MEDIUM — [CSS-WRAPPER-GUARD] rule 3 lets the very mistake through when it starts with `body` or `html`
**Failure.** Append `body .bidsheet-row { flex-wrap: nowrap }` (or `html .mx td .c { … }`) after bidpicker.css's wrapper.
It is unscoped and weaker than the wrapped `#page-leavewar .bidsheet-row` rule, so it silently loses — the 24 Oct
fault exactly — and the guard reports nothing. Checked with a copy of the checker: both selectors return no stray.
**Cause.** `css-wrapper-css.test.ts`, `strays`: `const outside = (sel) => /^(body|html)\b/.test(sel)` passes any
selector that merely starts at body/html.
**Fix.** Pass rule 3 only when the body/html part itself carries a state: `/^(html|body)[.:\[#]/` (every real rule-3
pass today is `body:has(.bidsheet.raised) .airpop…` in bidpicker.css, which still passes; `html body #page-x .y` in the
self-test still passes by rule 1). Add `body .a { … }` to the checker's broken examples.

### 3. LOW–MEDIUM — (d) on a phone the guard eats a deliberate tap on ANOTHER day (time only, no place)
**Failure.** On a phone, close a window (its ✕, or a tap on the grid, which the sheet's shield turns into a close) and
tap a different day within 450 ms: the tap is swallowed, nothing opens, he must tap again. D262 met this exact
trade-off for move mode and ruled "a PLACE as well as a time … a double-click's second click lands where the first did,
a deliberate one elsewhere" (select.ts `MOVE_SETTLE` / `SETTLE_PX`). The mouse path here is place-aware already (the
browser's detail ≥ 2 needs the same spot); the finger path is not.
**Cause.** Matrix.tsx `guardGrid`: `if (secondOnly && !finger && e.detail < 2) return` — any finger click on `.mx` in
the window is swallowed wherever it lands.
**Fix.** Remember where the closing press landed (select.ts already keeps `LAST_PRESS` for D262 — export a reader, or
keep the same module-level note) and, for a finger, swallow only a tap within about 24 px of it. Test: a finger's tap
40 px away, at once, opens its day. (A tap on the SAME day right after the shield closed a window is still eaten — that
one cannot be told from the fall-through; say so in the comment.)

### 4. LOW — (d) the finger test depends on the second press arriving after the guard is armed
**Failure (to walk on the iPhone, not proven).** If a browser holds the first tap's click back (a double-tap-zoom wait —
possible for a button inside a window's own scrolling body, which the page's `touch-action: pan-x pan-y` does not
reach), the second tap's pointerdown fires before the guard exists; `finger` stays false, and a second click that the
browser counts as detail 1 goes through to the grid.
**Cause.** `guardGrid` registers its `pointerdown` listener only at arming, so it never sees a press made earlier.
**Fix.** Read the last pointer type from an always-on capture listener (module-level, like select.ts `watchFingers` /
`LAST_PRESS`) instead of one added at arming. Walk step: a fast double tap on a leave button on his iPhone.

### 5. LOW — (f) the rollback still puts back the focus (the grid's jump), so the comment's "records only" is not true
**Failure.** Open the Leave War tab (LeaveWarPage asks `focusDay(today)`), scroll by hand to March, make a change the
commit refuses (the test's own case: words on a refused bid, member view, closed day). The rollback puts `focusSeq` and
`focusDate` back to the last saved state's; the grid's jump effect is keyed on `[focusSeq, focusDate]`
(Matrix.tsx ~3386–3407), so at the next repaint the grid jumps from March back to today. The same after the
under-manned list's or the clash note's jump (Chrome.tsx), a ring (cellring.ts), or Undo's soft ask.
**Cause.** `store.ts` `lwStore.restore` keeps only `role` and `viewer`; `focusDay` changes focus with `notify()` only,
never moving the baseline — the same shape as `setRole`. Pre-existing, but it is the twin path §5 asks a fix to list,
and the new comment says "a rollback puts back the RECORDS only".
**Fix.** Keep the four focus fields live too:
`{ ...snap, role: state.role, viewer: state.viewer, focusDate: state.focusDate, focusSeq: state.focusSeq, focusSoft: state.focusSoft, focusQuiet: state.focusQuiet }`,
and a test beside the role one. Leave `people` and `qualCatalog` restored: both are re-projected on Raptor's next
notify (sync.ts `reprojectRoster`), and `people` carries the posting windows that ARE records (`postOuts`), so keeping
the live copy could keep a refused posting's window on the man. `currentId` is a record (`lw.current`) — correctly
restored.

### 6. LOW — (d) tests: the drag window and the phone's frozen names are not driven
`doubletap.test.tsx` drives only the one-day window. The drag window (`sel`) is armed by the same effect but no test
closes it (its Done / ✕ double-tapped), and no test taps the phone's frozen name copy (`.mxband`, also a `table.mx`, so
covered by the code — but unproven). Add one test each. Of the six tests, four fail without the fix (the two finger
taps, the mouse double, the ✕); the key-press and single-mouse-click tests pass either way, as guards should.

### 7. LOW — [CSS-WRAPPER-GUARD] parser and rule edges
- `@font-face`, `@property`, `@counter-style`, `@font-feature-values` after the close are flagged as strays, but none may
  sit inside a style rule (nested, the browser drops them) and the list may not grow — the only way to green would break
  the stylesheet. None exist today. Fix: add them to rule 2 beside `@keyframes`.
- Comments are blanked before strings are stepped over: `content: "/*"` blanks everything to the next `*/`, hiding the
  rules between (checked: a stray `.r { … }` between `"/*"` and `"*/"` is not reported). Fix: blank comments in the
  same scan that steps over strings.
- Rule 1 is `sel.includes(page)`: a selector naming the page only inside `:not(#page-x)` counts as named (checked).
  Fix: drop `:not(…)` arguments before the test. (`:has(#page-…)` does scope by specificity; leave it.)
- `@layer name { … }` is flagged whole rather than looked into like `@media` — safe, but its message ("move it inside")
  is the right answer only for its rules; recurse it as rule 4 does.
- Rules BEFORE the first wrapper are not checked (tracker.css has six there today, all ids or `body.`/`html body #page`);
  by design, but say so in the head comment.

### 8. LOW — [CSS-WRAPPER-GUARD] the ratchet keys selectors only, and the "no growth" is prose
A declaration added INSIDE one of the 202 listed outside blocks of bidpicker.css — the counter form onward, the very
family of the 24 Oct fault — passes unseen; and nothing in the test stops a line being added to the JSON. Fix: pin the
count in the test (total ≤ 202, lowered as lines leave) so growing the list needs a visible test edit; optionally key
each listed block by selector plus a short hash of its body, so an edit to an outside block fails until it is moved in.

### Nit
Matrix.tsx, the guard's head comment: "Armed by "Show ›" (F2), every pointer click, and by a window …" — it is not
armed by every pointer click; read "only a pointer's click is swallowed".

## Checked and sound
- The guard never stacks (each arming ends the last), ends on unmount with its timer, and is armed in the same
  turn as the closing click (React 19 runs a click's effects before the next event), well before a second tap at ~170 ms.
- Capture order: move mode's own click listener (select.ts `wireMove`) is registered earlier on the same node and runs
  first, so its D262 place check still decides a landing; select.ts's drag-tail swallow, the sheet's tap shield (gone
  once the window closes) and the "close the drag window on a cell click" listener (bubble phase) do not clash.
- The pinned header and the phone's frozen names are `table.mx` copies, so they are covered; the top bar, the app's
  pop-ups, the Approvals and Balances pages and a key's click (detail 0) all pass.
- (f) Keeping role and viewer is right for both callers (the commit's rollback and the un-enlisted-store guard):
  `setRole`/`setViewer` are written only by sign-in, the admin's member-view switch and the "View as" mirror, none of
  them inside a war command, so a kept role can never be a refused command's own. The role test's second case goes
  through the real commit (the words pass the row check, then the commit refuses), so it is red without the fix.
- The CSS checker reads strings, `@media`/`@supports`/`@container` nesting, `;`-ended at-rules (`@import`, `@layer a;`),
  and finds all nine wrapped stylesheets; its self-tests show a broken example first.

Not a finding under D56: none of the above lives only in stored data.
