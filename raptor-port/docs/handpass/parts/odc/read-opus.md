# [ONE-DATE-CALENDAR] step one — the blind read of the finished code (Opus, 13 Oct 26)

Read at `729961bd3` (`git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e`), by a reader that wrote none of it
and opened nothing else under `docs/handpass/parts/odc/`. Method: the brief's
(`docs/superpowers/briefs/2026-10-13-one-date-calendar-read.md`) — from the promise (D786, D795, D796, D797, D798, full
rows read) outward to every caller and every listener on the page, then the state table.
Nothing was built or served. One existing unit file was run once (`TZ=Pacific/Midway npx vitest run
src/ui/datecal.test.tsx` — 27 passed). Every "host: run this" below is a case I could NOT run.

**Count: 0 high · 2 medium · 5 low · 1 to file (a script outside the app).** Nothing here touches OIL, a published
day, who may do what, or a saved shape. No finding lives only in stored data.

---

## 1. Findings, ranked

### F1 — MEDIUM — the second click of a double-click on a date lands on the form the calendar has just uncovered
**New in this change** (the phone's own box kept its popup up, or was the browser's own). Confidence: high for a
mouse (the mechanism is certain); unproved on an iPhone (Safari may treat the second tap as its own gesture).

- **Setup / action.** Any floating calendar. Double-click a date (a common Windows habit).
- **What happens.** The first click picks; `DateBox.tsx:92` calls `close()` and the layer leaves the page inside that
  same click. The second click's press therefore lands on whatever lay UNDER that date:
  - Leave War, the one-day sheet, "PO from" / "PI from": the sheet stands at the foot of the screen, so the calendar
    opens ABOVE its box (`DateBox.tsx:142`) — over the sheet's own bid controls and its shade. The second click either
    presses a control of the sheet (a leave chip there places a bid at one press) or lands on the shade
    (`Sheet.tsx:453` `onScrimClick`) and CLOSES the sheet — the posting date just picked is lost with it, and no
    posting was made (it needs "Post out").
  - "Every <weekday>", From: the card sits under the box, over "No end / A date", Cancel / Save and each listed
    rule's Remove (`EveryWeekday.tsx:92–122`) — the second click saves the rule and closes the window, or removes a
    rule, or flips the Until choice.
  - Admin → Users / Data, the upchit window: whatever button is under the date.
- **What should happen.** A tap picks and the calendar goes (D796, D797); the same tap made twice does nothing more.
- **Cause.** `raptor-port/src/ui/DateBox.tsx:92` — the layer is unmounted on the pick with nothing left to take the
  click that may follow at the same spot. The file's own head note guards the VEIL against this ("a layer that went at
  the press would hand the click that follows to whatever of the form lies under the finger") but not a date. The
  Leave War met the same thing on its Move button and guards it by place AND time (`leavewar/ui/select.ts`
  `MOVE_SETTLE` / `SETTLE_PX` — D262, Fable's S1; a time alone ate deliberate quick clicks elsewhere).
- **Fix, step by step** (place and time, as the Leave War's; a document click-eater is NOT enough here — on a touch
  screen the sheet's tap shield, `Sheet.tsx:123`, is an older listener on the same node and would run first):
  1. `DateBox.tsx`, `Layer`: remember where the picking click landed —
     `const pt = useRef<{ x: number; y: number } | null>(null)` and on `.dcal-card`
     `onClickCapture={e => { pt.current = e.detail > 0 ? { x: e.clientX, y: e.clientY } : null }}` (a keyboard pick has
     `detail` 0 and needs no guard). Hand it up: `onPick={iso => onPick(iso, pt.current)}`.
  2. `DateBox`: `const [patch, setPatch] = useState<{ x: number; y: number } | null>(null)`; in the pick handler, after
     `close()`: `if (at) { setPatch(at); timer.current = window.setTimeout(() => setPatch(null), 400) }`; clear the
     timer in an unmount effect.
  3. Draw, beside the layer's portal:
     `{patch && createPortal(<div className="dcal-layer" data-testid="dcal-patch" style={{ inset: 'auto', left: patch.x - 12, top: patch.y - 12, width: 24, height: 24 }} onClick={e => { e.stopPropagation(); setPatch(null) }} onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} />, document.body)}`
     — a 24px see-through patch at layer 600 for 400ms. It carries `.dcal-layer`, so the Leave War sheet's shield
     leaves it alone (`Sheet.tsx:118`) and a press 13px away is untouched.
  4. Tests: unit — a pick with coordinates leaves `dcal-patch` for 400ms (fake timers), a keyboard pick leaves none;
     browser — `dblclick()` on a date of "PO from" on the one-day sheet (the sheet is still up, the date in its box,
     no bid placed) and on a date lying over Save in "Every Thursday" (the window is still up, no rule saved).
- **Host: run this.** Desktop 1280×800, `ad`/`a`: Leave War → tap a day on a man's row → PO → press "PO from" →
  `page.locator('[data-testid="dcal-day-…"]').dblclick()` on a date in the upper rows. Expected: sheet up, date picked.
  Predicted: the sheet closes, or a control of the sheet is pressed. Then the same on "Every Thursday" → From, on the
  date drawn over Save.

### F2 — MEDIUM — on the Leave War's blocking sheets, Tab does not go round the calendar; the keyboard cannot reach the year list, "Today", the last-month arrow, or get back to the dates
**New in this change** (the new layer meets an older listener). Confidence: high (read line by line; not run).

- **Setup.** Leave War, admin, keyboard. Any BLOCKING sheet with a date box: the one-day sheet's "PO from" and
  "PI from" (`BidPicker.tsx:690, 723`), the Post out sheet and the Post in sheet (`:1034, :1156`). Open the box
  (Enter): the keyboard is on the picked date.
- **Action / what happens.** Press Tab. `Sheet.tsx:415–436` (`trap`, on the document, capture, every blocking sheet)
  runs BEFORE the calendar's own Tab handler (React, on the layer — `DateBox.tsx:154–164`): the keyboard is "not in
  the sheet" (`!panel.contains(at)`, line 430), so it cancels the key and focuses the sheet's FIRST control, behind
  the veil. Then the calendar's handler runs, finds the focused element is not one of its stops (`indexOf` = −1) and
  focuses stop 0. Net: **Tab always lands on the title; Shift+Tab always on "Next month"** (stop n−2). With the lists
  open: Tab → title, Shift+Tab → the month list; **the year list is never reached**. After one Tab there is no way
  back to the dates but Escape and opening the box again.
- **What should happen.** `DateBox.tsx` head: "the keyboard … stays inside it (Tab goes round)". And the removed
  comment at this very box said why it matters here: a posting can be years away, and "the keyboard path is what
  reaches a year" — the year list is now the only such path, and on these four boxes a keyboard cannot reach it
  (Page Up / Down still walk a month at a time). The evidence sheet's §3 "WHAT WAS REMOVED (1)" promises the lists to
  a keyboard.
- **Cause.** `raptor-port/src/ui/DateBox.tsx:154–164` — Tab is held by a React handler on the layer, which every
  document-capture Tab trap beats: `leavewar/ui/Sheet.tsx:434`, and by the same shape `ui/sheetfocus.ts:42` and
  `ui/InputsCal.tsx:403` if one is ever up with a calendar. Escape was put at the window on the way down for exactly
  this reason (`:112–120`); Tab was not.
- **Fix, step by step.**
  1. `DateBox.tsx`, the first effect of `Layer` (`:112–120`): take Tab there too —
     ```ts
     const onKey = (e: globalThis.KeyboardEvent) => {
       if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeRef.current(); return }
       if (e.key !== 'Tab' || e.ctrlKey || e.altKey || e.metaKey) return
       const n = card.current
       if (!n) return
       e.preventDefault(); e.stopPropagation()      // before any sheet's own Tab trap on the document
       const stops = [...n.querySelectorAll<HTMLElement>('button, [tabindex]')].filter(x => !(x as HTMLButtonElement).disabled && x.tabIndex >= 0)
       if (!stops.length) return
       const i = stops.indexOf(document.activeElement as HTMLElement)
       const to = i < 0 ? (e.shiftKey ? stops.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length
       stops[to].focus({ preventScroll: true })
     }
     ```
  2. Cut the React `onKey` on the layer (`:154–164`) down to `e.stopPropagation()`.
  3. Test (`leavewar/ui/datebox-sheet.test.tsx`): a blocking `<Sheet>` holding a `<DateBox>` and one more button; open
     the box; `fireEvent.keyDown(document.activeElement!, { key: 'Tab' })` twice → the keyboard is on `dcal-today`, and
     at no point on an element inside the sheet; open the lists and Tab to `dcal-years`.
  This one change also closes F3.
- **Host: run this.** Leave War → a day → PO → focus "PO from", Enter, Tab, Tab. Expected: title, then "Go to today".
  Predicted: title, title — and `document.activeElement` is the sheet's ✕ between the two.

### F3 — LOW — with the keyboard on nothing, Tab walks out of the calendar onto the page behind the veil
**New.** Confidence: medium-high (browser's own Tab order; not run). Same fix as F2.

- **Setup / action.** Open any calendar with a mouse; click an empty part of the card that is not a button (its foot
  padding, the MON…SUN line, a faint date); press Tab.
- **What happens.** The click leaves the keyboard on the page (`document.body`). The calendar's Tab handler is a React
  handler on the layer and hears only keys pressed INSIDE it, so the browser's own Tab runs: from a click at the
  card's foot the next stop is outside the layer — the page behind the veil (top bar, tabs, the form's Save). Enter
  then presses that control with the calendar still up; on the Leave War a tab change leaves the calendar and its
  veil floating over another page (the war's page stays mounted, the layer is on `<body>`). On a blocking Leave War
  sheet the sheet's trap pulls the keyboard into the sheet behind the veil instead.
- **Cause / fix.** `DateBox.tsx:154–164`; F2's step 1 (`i < 0` → the first or last stop).

### F4 — LOW — on a desktop the card follows its box off the screen when the page behind is scrolled
**New.** Confidence: high (arithmetic), not run.

- **Setup / action.** Desktop, Admin → Users or Data (the page scrolls with the document). Open a date box; turn the
  mouse wheel over the veil. The page scrolls (nothing on the veil stops a wheel) and the card follows its box.
- **What happens.** `DateBox.tsx:142`: `top = below + h <= vh - EDGE ? below : …` — with the box scrolled above the
  screen `below` is negative and still passes the test, so the card goes off the top; with the box below the screen
  `above` passes `>= EDGE` and the card hangs off the foot. Only the dim is left on screen.
- **What should happen.** The file's own words: "kept on the screen, following the box if the page moves".
- **Fix.** `:142` → `const want = below + h <= vh - EDGE ? below : above >= EDGE ? above : vh - EDGE - h` then
  `const top = Math.max(EDGE, Math.min(want, vh - EDGE - h))`. Browser test: open `#admWipeDate`'s calendar,
  `page.mouse.wheel(0, 900)`, `calendarOnTop` still holds.

### F5 — LOW — a calendar open while the screen narrows to phone width is drawn half off the screen
**New.** Confidence: medium (needs a redraw of the form at that moment; read, not run).

- **Setup / action.** A phone on its side (844 wide — a desktop layout for windows), Calendar window → "Every
  Thursday" → From (the card is placed by script: inline `left` / `top`). Turn the phone upright (390 wide).
- **What happens.** The Calendar window redraws (its 820px media hook), so `Layer` redraws with `phone` true: the
  layer gets `is-phone`, the placing effect's clean-up runs and the new run returns at once (`DateBox.tsx:133`) — the
  inline `left` / `top` stay. They beat the stylesheet's `left:50%;top:50%` (`26-date-calendar.css:47`), whose
  `translate(-50%,-50%)` then drags the card up and left by half its size: its head is above the screen.
- **Fix.** `DateBox.tsx:133`: `if (!n) return` / `if (phone) { n.style.left = ''; n.style.top = ''; return }`.

### F6 — LOW — Admin → Data, "A date range": a date picked in another mode after a range was made becomes the START of a run to the OLD end
**New** (the builder's reading says "a run of that one day"; the old two boxes kept a stale end too, but showed both).
Confidence: high.

- **Setup / action.** "A date range": tap 28 Oct, 2 Nov. Switch to "A specific date": the box reads 28 Oct; pick
  20 Oct. Switch back to "A date range".
- **What happens.** `AdminPage.tsx:95` only repairs `b` when it is empty or before `a`; here `b` (2 Nov) is after the
  new `a`, so the calendar shows and the form is ready to clear **20 Oct to 2 Nov** — fourteen days, where he last
  chose one. It is said in words beneath and the first press only counts, but the end is in another month, off the
  page of the calendar, and clearing edit history is permanent.
- **Fix.** `AdminPage.tsx:86`: `onChange={x => { set(x); setB(''); setArmed(-1) }}` — a date picked in a one-date mode
  drops the old end; line 95 then makes it a run of that one day. A range left alone still survives a look at
  another mode. Test (`adminclear.test.tsx`): range 28 Oct–2 Nov → mode `on` → pick 20 Oct → mode `range` → the foot
  reads `Tue 20 Oct 2026`.

### F7 — LOW (latent; no route found) — a box switched off while its calendar is up stays "open" underneath
`DateBox.tsx:88` hides the layer while `disabled`, but `open` stays true (`aria-expanded="true"`, the `is-open` edge)
and the calendar comes back by itself when the box is switched on again. Only the two posting sheets pass `disabled`
(`locked`), and I found nothing that can lock a posting while the veil is up (no keyboard Undo, no change arriving
from outside). Fix: `useEffect(() => { if (p.disabled) setOpen(false) }, [p.disabled])`.

### F8 — TO FILE, not a fault of the app — the IT flow guide's picture script fills two of these boxes
`raptor-port/scripts/itflow/j/leaving.mjs:10` (`po-date`) and `:24` (`#accArPostIn`) call `page.fill` on what is now
a button: the next re-shoot of the guide stops at its first step, and slides "leaving-1" / "leaving-3" picture the
old boxes. The guide is re-shot only on his word (D403) — file it beside `[ITFLOW-OIL-RESHOOT]`: press the box, turn
the calendar, tap `dcal-day-<date>`. (The old walk scripts under `scripts/handpass/` are records, not maintained.)

---

## 2. The builder's readings, each ruled

| Reading | Ruling |
|---|---|
| The Today icon goes to today's month and picks nothing | **The owner's to decide.** D796 says only "a today's icon on the right of the year" in place of Reset. The code does as read (`DateCal.tsx:155`). Tell him with it: after step two the same icon will JUMP in "Jump to a date" and only turn the page here. |
| Escape closes an open calendar first, the window behind on a second press | **Supported** — the app's own rule (the input window "peels one layer"; D795's reading "Escape … behave as now"). Built and pinned (`datebox.test.tsx`, `everyweekday.test.tsx`). Still to be TOLD to him, as the design says. |
| The calendar closes on the CLICK on its veil, not on the press | **Supported in effect** — a tap outside closes and changes nothing (D797). It differs in the letter from the 4 Sep rule ("outside pointer-down") and agrees with D538 (a press begun inside and let go outside does not close). A technical call. Its reason — click-through — is half-finished: see F1. |
| On a desktop the veil is a light dim | **The owner's to decide** (a look). D797 says "a small panel right under the box" and nothing of a dim; the design's sentence is ambiguous. Note with it: the veil also stops the page behind working while a date is picked, in windows that otherwise leave it working (D641). |
| A run is always whole; a tap before it starts over | **Supported** — D797 ("two taps make the run … no Clear") and the Leave War's range calendar has both rules (`RangePicker.tsx:94–103`). Consequence to tell him: in "A date range" ONE tap is already a whole run of one day, and the clear button is live. |
| The page that arrives after a swipe slides in; an arrow press does not | **Half supported, half the owner's.** The slide on a swipe is D795's words. But "the swipe is the Inputs calendar's", and on the Inputs and SANS calendars an ARROW press slides too (`InputsCal.tsx:484`, `SansCal.tsx:147`). Not sliding here is a difference between like screens (D754). |
| Admin's "A date range" keeps a date picked in another mode as a run of that one day | **Supported as a call — and contradicted by the code in one case: F6.** |
| The fifth Leave War posting date (the dragged-block panel's "PO from") is in step one | **Supported** — D797's own words: "every date box that is still the phone's own". |
| The new calendar itself does not turn its month on a swipe | **The owner's to decide** — D795's swipe is scoped to the Calendar window; D796 asks for "something like" his iPhone's calendar, whose month does turn on a sideways finger. The card is `touch-action:none`, so today a swipe on it does nothing at all. |

---

## 3. The state table — the cells that are wrong or unproved

States: **C** closed · **D** open on the dates · **L** open on the lists · **R1 / R2** a run of one day / a finished run
(Admin, in the form) · **G** a swipe just made, its guard up. Every cell not listed was read and is right.

| State × event | What the code does | Verdict |
|---|---|---|
| D × a second click at the same spot | the layer is gone; the click falls on the form | **WRONG — F1** |
| D, L × Tab, on a blocking Leave War sheet | the sheet's trap and the calendar's fight | **WRONG — F2** |
| D, L × Tab with the keyboard on nothing | the browser's own Tab leaves the layer | **WRONG — F3** |
| D, L × the page scrolled (desktop wheel) | the card follows its box past the screen's edge | **WRONG — F4** |
| D, L × the window resized across the phone width, with a redraw | inline place kept on the phone card | **WRONG — F5** |
| R2 × a date picked in another mode, then back | the new date runs to the old end | **WRONG — F6** |
| D, L × the box switched off | `open` stays true underneath | latent — **F7**; no route found |
| D, L × a page change or sign-out | the veil takes every press, so none by pointer; by keyboard only through F3's hole — the layer then floats over the next page | wrong only via **F3** |
| D × Escape with the "?" card of an input's window, or the Inputs list's own calendar, also open | each listens at the window on the way down; one press closes both | harmless; noted |
| L × a finger's fling on an iPhone (momentum, the snap, `settle` 110ms after the last scroll, the re-centre while a finger is still down) | read as right; a row tapped in the instant between `settle` and the redraw could be left out of the band | **UNPROVED** — his iPhone (order §7.9) |
| D × opening on an iPhone | the keyboard is put on the picked date by script; WebKit may draw the focus ring on it though he tapped | **UNPROVED** — his look |
| G × a click after a swipe on iOS | the guard eats one click for 350ms, retired by the next press | **UNPROVED** on a real phone; right as read and as its unit tests say |
| G × a swipe right begun at the screen's left edge | Safari's own "back" may take it before the page | **UNPROVED** — his iPhone; not the app's code |
| D × today turning over while open | "today" is read at each draw; an open card keeps yesterday's mark until it redraws | right enough; noted |
| D × a time zone west of UTC | all date sums are UTC on the date string; only "today" is the wall clock | right — ran `datecal.test.tsx` under `Pacific/Midway`, 27 passed |

---

## 4. Explicit negatives — what I checked and found sound

- **What removing the phone's box took away, caller by caller (read from the removed lines).** `EveryWeekday`: `min`
  on Until kept as faint dates; emptying From gone, its "Choose the date it starts." now unreachable (D796).
  `UsersPanel` (three forms): only `value` / `onChange`; nothing read the box by id. `AdminPage`: the two-box range
  became one run; `ready`, the disarm on every change and the dry count are intact; "before" and "on" ignore `b`
  (`inputedit.tsx clearWindow`). `inputedit` upchit: the same `{ start, end: '' }` write. `BidPicker` ×4,
  `SelectSheet`: same writes; the two posting sheets now commit ONCE per pick where the phone's box committed at
  every complete date typed (better); the "emptied field commits nothing" guards are no longer needed and were
  removed with their boxes; `disabled={!piDate}` / `!poDate` are now dead but harmless. No product code reads any of
  these boxes' `.value` (searched `src`, `probes`, `scripts`).
- **Every date box still the phone's own.** Searched `src` for `type="date"` in markup, strings and assignments: only
  the Tracker's three (D798) — and `nodatebox.test.ts` holds that. (The upchit window's two TIME boxes are still the
  phone's own; times are not this job.)
- **Listeners added above their component.** The layer's Escape (window, on the way down) exists only while a layer
  is mounted and is taken off with it; it beats the window shell (`FloatWindow.tsx:244`, bubble — never reached after
  the stop), the input window and the Leave War sheet (both document-capture — reached after the window). The swipe's
  click guard lives ≤350ms and is retired on unmount. The swipe's own listeners are on the Calendar window's two
  parts only: a calendar layer over them takes the finger (it is on `<body>`), and while a blocking Leave War sheet
  covers the window on a touch screen the sheet's shield stops the touch before the window hears it — the sheet is
  the one entitled. The shield's new exemption (`Sheet.tsx:118`) covers the whole layer, veil included, for all
  eleven shielded events.
- **React handing a portal's events to the form that drew it.** Walked every caller's React ancestors: the window
  shell's `onPointerDownCapture` (it brings the box's own window forward — harmless), the input pop-up's
  `onClick` close (stopped, and it tests an id the layer never has), the Leave War's `.stage` (no handlers), Admin
  (none). Not stopped by the layer — pointer-up, mouse-up, touch, focus, wheel, context menu, key-up: no ancestor of
  any of the nine callers handles one (searched). A `<label>` round the upchit box is not an ancestor of the layer in
  the page. Document-level BUBBLE listeners never hear a press or key from inside the layer (React stops it at
  `<body>`): each one I found is a "close my own menu" or a schedule route keyed to schedule elements — none needs it.
  The Leave War's move mode stands down while any sheet is up, and the veil's test id happens to match its
  "not an empty spot" list.
- **Focus when it closes.** Back to the box unless the keyboard is already elsewhere; a veil click (keyboard on
  nothing) is covered; where the pick unmounts the form (a Post out date moved past the tapped day) focus falls to
  the page, as it did with the phone's box.
- **A keyboard-only or screen-reader user.** CAN: open with Enter / Space; arrows, a week up and down, Page Up / Down
  across months and years' ends; one tab stop for the month; Tab round the card (except F2, F3); the lists by
  Up / Down; Escape; every date says itself in words, the box says its name and date, the card is a named dialog.
  CANNOT: type a date as figures (told to him, §13 of the sheet); Home / End; reach the year list on the four
  Leave War boxes (F2).
- **The scrolled lists' arithmetic.** Row `i` rests in the band at `scrollTop = (i − first) × 44` at both heights
  (284 / 248 — the padding is half the list less half a row at each). The window is 121 rows, re-centred past 30;
  the re-centre writes the place outright and `byScroll` is cleared on it; a stale timer cannot fire after a
  re-centre (the write's own scroll event replaces it within a frame, 94ms before it is due); the month list's own
  number keeps December → January without moving the year, as his phone does. Years below 100 would be read as
  19xx by the date sums — some 1,900 rows away; not reachable in practice.
- **The swipe's guard.** One click, document capture, off at the next press or 350ms; a second finger voids the
  swipe; a cancelled touch voids it; the part is decided by where the finger LANDED; the window shell's own
  touch-move handler leaves sideways moves alone; a mouse sends no touch events.
- **Date arithmetic.** Month steps cross a year both ways; Page Down from the 31st lands on a shorter month's last
  day; 42 places always; Monday first; nothing uses the local clock but "today" (the same clock as the Post in
  default, `effectiveToday`).
- **A caller that still expects "".** None is hurt: Until starts empty and has "No end"; Admin's box starts empty and
  the button stays off until a date is picked; every other box always held a date.
- **Layers.** 600 is above every layer in the stylesheets (the highest other is 520).
- **The re-expressed tests** (`everyweekday`, `po`, `pi`, `selectsheet`, `onedoor-users`, `e2e/leavewar`,
  `e2e/onedoor`): each still proves what it proved; the two that can no longer be reached from the screen (an emptied
  start, an end typed before the start) are pinned as "cannot be done" instead. None weakened.

---

## 5. Noticed beside the change — older, not findings of this read

- The Post out sheet commits a moved date at one tap — as the phone's box did. Where the stored outcome is Delete
  and the date tapped has already come, I did not trace whether the delete then runs without its second ask (D287).
  It bears on his open question of a tick (D798). **Unverified; older code.**
- `23-days.css`: `.dayswin .days-grid{flex:1 0 auto}` (the phone month "fits the height") looks inert — its parent
  `.days-part` is not a column — which is why the new `flex:1 0 auto` on `.days-parts` was needed for the room at the
  foot. Not this change.
- The first layer drawn on `<body>` makes React listen there too for the life of the page: one more short lookup
  per event anywhere. Likely nothing; `npm run perf` does not time it. **Unmeasured.**

## 6. What I did not read

The Tracker (out of this step). `e2e/datecal.spec.ts` beyond its test list and the phone-fit block;
`dayswipe.test.tsx`, `datebox.test.tsx` and `adminclear.test.tsx` beyond their test names and the parts quoted.
`leavewar/ui/bidpicker.css` and how each form's own box look sits on the new button (a look — the walkers').
`RangePicker.tsx` beyond its tap rule. `people-accounts.md` beyond the posting rulings (D229, D287, D300, D308, D320);
`ui-contracts.md` and `feature-impact.md` not opened. `sync.ts postOut` only as far as the note in §5. Nothing was
built, served or driven in a browser — every geometry claim above is from the code and is the host's to run.
