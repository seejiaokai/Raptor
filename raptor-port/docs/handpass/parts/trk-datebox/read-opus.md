# The Tracker's date boxes — the blind read of the finished code (fresh Opus reader, 13 Oct 26)

Read at `2418d92c1` on `claude/tracker-date-boxes`, by the brief
`raptor-port/docs/superpowers/briefs/2026-10-13-tracker-date-boxes-read.md`. Blind: the builder's check
(`docs/handpass/2026-10-13-tracker-date-boxes.md`) and everything else under `docs/handpass/parts/` were not opened.
Nothing was run — every finding below is from reading, and each names the exact input the host should run before it is
believed. No file was changed but this one.

**Count: 0 high · 3 medium · 5 low · 1 nit.** Look first at F1 and F2.

Paths are from `raptor-port/src/`. "New" = introduced by this change; "older" = code this change did not write
(`tracker/app/core.js` is byte-identical to `origin/main`; `ui/DateBox.tsx` / `ui/DateCal.tsx` are step one's, not on
`main` yet).

---

## Findings, ranked

### F1 — MEDIUM — a double tap on a date box can pick and SAVE a day nobody chose

- **Setup.** A phone (390×844), Tracker → Info half. Any Tracker date box whose middle lies inside the place the
  calendar's card takes — on a phone the card is centred (`ui/scheduler/26-date-calendar.css`,
  `.dcal-layer.is-phone .dcal-card`: about x 20–370, y 244–600; its dates about y 322–586). Upchit, End date A / B,
  Last Flown, a failures-list row and the pop-up's Done on / Failed on can all sit there.
- **Action.** Tap the box twice quickly (a double tap / double click on the same spot).
- **What happens (predicted).** The first click opens the calendar (`ui/DateBox.tsx:108`). The layer is mounted at once
  and takes presses at once (the `.16s` fade is opacity only). The second click lands on whatever of the card is under
  the finger: a date (`ui/DateCal.tsx:160-163` `tap` → `onPick`) → `ui/DateBox.tsx:117` closes and calls `onChange` →
  the Tracker saves it (`tracker/components/DateBox.jsx:40-45`, `Pop.jsx:62,77`). A day up to today is accepted in all
  eight boxes, any day in Upchit / End date A / B. If the spot is a head button instead, the month turns or the lists
  open; a blank cell does nothing.
- **Should.** The calendar opens and waits; nothing is saved by the second half of the same tap. D801's own fallback
  ("if a tap proves too easy to get wrong") is exactly this.
- **Also on a desktop** when the card can sit neither under nor over its box (`ui/DateBox.tsx:202`, third branch — a
  window under about 760px tall with the box in its middle band; his PC runs at 125%, so about 730px): the card is put
  over the box. Where the card does fit below, the second click falls on the veil and the calendar just closes again
  (opens-and-shuts — harmless, but the box then looks dead to anyone who double-clicks).
- **Cause.** The guard against "the same tap made twice" (`ui/DateBox.tsx:70-94`, the patch) stands only AFTER a pick
  or a tap outside. Nothing stands at the OPENING click. In the app's other forms a stray pick fills a field of a form
  still to be saved; in the Tracker the pick is the save — which is why it is reported here.
- **Fix, step by step** (`ui/DateBox.tsx`; it protects every form):
  1. Beside `dropPatch` add `const standPatch = (at) => { if (patchTimer.current) clearTimeout(patchTimer.current);
     setPatch(at); patchTimer.current = setTimeout(() => { patchTimer.current = null; setPatch(null) }, SETTLE_MS) }`,
     and make `close(at)` call it in place of its three inline lines.
  2. The box's `onClick` becomes `e => { if (open) close(); else { setOpen(true); if (e.detail > 0)
     standPatch({ x: e.clientX, y: e.clientY }); else dropPatch() } }` — a keyboard open (detail 0) leaves none.
  3. The patch must lie over the card: add `z-index:601` to `.dcal-layer.dcal-patch` (today both are 600 and only
     the order they were added decides).
  4. Tests: in `ui/datebox.test.tsx`, a click on the box with a place leaves a `dcal-patch` at that place while the
     calendar is open, gone after `SETTLE_MS`; a browser test at 390×844 — `page.dblclick('#upchit')` with the box
     scrolled to mid-screen — expects the calendar open and `#upchit[data-value]` unchanged. Same for `#popDoneDate`.
- **Confidence.** High that no guard exists at the open; medium-high on where the second click lands (geometry worked
  out from the stylesheet, not measured). **Older code (step one's box), harmful through the Tracker's use.** I have
  not seen step one's own read — if it weighed this and left it, the Tracker is still the place it costs.

### F2 — MEDIUM — a double press on "take this date off" in the failures list takes the day off TWO failures

- **Setup.** A student with two dated failures on one event — ST-02 on 5 Oct, ST-02X on 8 Oct. Side panel →
  Failures title → the full list.
- **Action.** Double-click (double-tap) the ✕ on the FIRST row.
- **What happens.** First press: `setFailDate(s,'ST-02',0,'')` (`tracker/app/core.js:4429-4440`) empties that day
  and re-sorts — undated go last (D371) — so the 8 Oct failure moves UP into row 0. Rows are keyed by their place
  (`tracker/components/SidePanel.jsx:182`, `key={x.id + ':' + x.i}`), so the same ✕ button stays under the finger,
  now belonging to the other failure. `renderSide` is `notify` — the row is redrawn before the second press arrives.
  Second press: `setFailDate(s,'ST-02',0,'')` again → the 8 Oct day is gone too. Both failures read "Pick a date".
  The two are folded into ONE undo step (F4), so one ↶ brings both back — if the person notices.
- **Should.** One failure loses its day.
- **On every other Tracker box** the same double press does this instead: the first press empties the box, the ✕ is
  removed (`DateBox.jsx:50`), and the second press falls on the box underneath and opens the calendar.
- **Cause.** `tracker/components/DateBox.jsx:50` — the ✕ acts at once and has no settle, while what it acts on moves
  under it. (The house rule "a control tapped repeatedly must not move under them" is the same family.)
- **Fix, step by step** (`tracker/components/DateBox.jsx`):
  1. `const offAt = useRef(0);`
  2. On the `trdatebox-row` span: `onClickCapture={e => { if (Date.now() - offAt.current < 400) e.stopPropagation(); }}`
     — for 400ms after a ✕ (the app box's own `SETTLE_MS`) a press on the row reaches neither a new ✕ nor the box.
  3. The ✕: `onClick={() => { offAt.current = Date.now(); hand(''); }}`.
  4. Tests: unit (`leftovers.test.tsx`) — two failures on one event, open the list, `fireEvent.click` the first
     row's `.trdate-x` twice with no wait: `failDates` is `['<the later day>', null]`, not `[null, null]`; and on a
     plain box two clicks on ✕ leave no `dcal-card`. Browser: `page.dblclick('#failLog .frow >> nth=0 >> .trdate-x')`.
- **Confidence.** High (read end to end; not run). **New in this change** (the ✕ is new).

### F3 — MEDIUM, HIS TO DECIDE — ✕ on a Last Flown box blanks the currency reading though flights are recorded

- **Setup.** A student with flights marked done on 5 and 10 Oct; Last Flown (Syllabus) and (Currency) read 10 Oct.
- **Action.** One tap on the ✕ inside Last Flown (Syllabus) — on a phone it stands where the box's arrow used to be,
  about 21×29px (26px wide, `tracker.css:243`, inside the side panel's 0.8 zoom at ≤1050px — computed, not measured).
- **What happens.** `setLastSyll(s,'')` (`core.js:4020-4027`) empties BOTH Last Flown days and drops the "typed by
  hand" marks. "Days since" read "—", the bar reads "No currency date set". Nothing puts it back but ↶, a day picked
  by hand, or the next change to a flight's grade (`settleLastFlown` runs only from a grade).
- **Should — the question.** D123: "Last Flown is the latest day actually flown". The builder's list of what an
  emptied box MEANS names Upchit, the end dates and a failure — not Last Flown. D801's row told him the way to empty
  is kept "where … that means something". The store has behaved this way since 23–28 Sep (an emptied typed box did the
  same), so this is **older behaviour the change has put one tap away**, not a new rule.
- **Parked for him, in the app's words:** *"Last Flown has a small ✕ to take its date off. Today that leaves Last
  Flown blank even when flights are marked done. Should ✕ instead put Last Flown back to the latest flight marked
  done (recommended — blank only when no flight is done), stay as built, or not be offered on the two Last Flown
  boxes?"*
- **Fix for the recommended answer** (`core.js`): in `setLastSyll` and `setLastCurr`, after `stamp(d)`, add
  `if (!v) settleLastFlown(s);` (the hand marks are already deleted, so it takes the latest flight flown, or stays
  empty when there is none); one undo step still covers it (the step is pushed before). Test: two flights done, ✕ on
  Last Flown (Syllabus) → both boxes read the later flight's day; no flight done → both empty.
  **For "not offered":** a `noClear` prop on the Tracker's `DateBox`, passed at `SidePanel.jsx:338-339`.
- **Confidence.** High on what the code does; the ruling is his.

### F4 — LOW — two picks on one box within two seconds are ONE undo step

- **Setup / action.** Upchit holds 10 Oct. Pick 12 Oct, then at once (inside 2s) pick 13 Oct — or ✕ and then a pick.
- **What happens.** `pushMarkUndo(s, what, field)` (`core.js:2988-2994`) folds a second change to the same box inside
  two seconds into the first step — written for keystrokes. One ↶ goes back to 10 Oct, not to 12 Oct. In the failures
  list the "box" is the row's place (`'failDate:' + id + ':' + i`), so two different failures re-dated through the same
  row inside 2s are one step as well.
- **Should.** `ui-contracts.md` (this change's own sentence): "one day picked is one step". No data is lost; the
  history is coarser than promised.
- **Fix.** A date is never typed now, so the seven date setters stop asking to be folded: drop the third argument of
  `pushMarkUndo` in `setLastSyll`, `setLastCurr`, `setUpchit`, `setTarget`, `setTarget2` (`core.js:4023,4031,4037,
  4041,4042`), `setDoneDate` (`:4420`) and `setFailDate` (`:4435`). `setEpw` and `setDownDays` keep theirs (still
  typed). Test: two `setUpchit` calls with different days inside 2s → the undo depth rises by two. (Check
  `leftovers.test.tsx` "a slowly typed day re-dates the flight once" does not lean on the fold.) Or, if the fold is
  wanted, correct the contract's sentence instead — a technical call, the builder's.
- **Confidence.** High. **Older code; the change made its premise (typing) false.**

### F5 — LOW — the calendar's "today" is the device's day; the Tracker refuses by the squadron's day

- **Setup.** A device whose clock is not on Singapore time — Darwin at 00:30 on 14 Oct (Singapore: 23:00, 13 Oct).
- **Action.** Open Done on (or Last Flown); tap the date the calendar marks as today (14 Oct), or its Today icon then
  that date.
- **What happens.** `ui/DateCal.tsx:142` takes today from `ui/daysfmt.ts:12` (the device's local date). The Tracker's
  rule uses `core.isoToday()` (`core.js:4152`, Singapore). The pick is refused: "That day hasn't come yet — pick today
  or earlier" — on the day the calendar itself calls today. West of Singapore the mark simply lags a day (nothing
  refused wrongly). The Tracker's own lull calendar marks the squadron's day (`SidePanel.jsx:16`), so two calendars on
  one screen can disagree.
- **Should.** D374 reading 1: "today" is the squadron's day, not the device's clock.
- **Fix.** `ui/DateBox.tsx`: add `today?: string` to the props, hand it through `Layer` to `<DateCal today={…}>`
  (`DateCal` already takes it). Pass `today={core.isoToday()}` at `tracker/components/DateBox.jsx:49` and
  `Pop.jsx:61,76`. Test: with the device date and `isoToday` set apart, the `is-today` cell is the Tracker's.
- **Confidence.** High. **Not a regression** — the phone's own date box marked the device's day too — but it is now
  the app's own drawing, and the call site that should pass the day is missing.

### F6 — LOW — a screen reader hears five boxes called "Date"; the keyboard is dropped after ✕

- **What happens.** `tracker/components/DateBox.jsx:49` gives the app's box `label={title || 'Date'}`, and
  `SidePanel.jsx:338,339,341,372,377` pass no `title` — so Last Flown ×2, Upchit and End date A / B are each announced
  "Date: Tue 13 Oct 2026", and each calendar "Date — pick a date" (`ui/DateBox.tsx:104,233`). Every ✕ says "Take this
  date off" with no word of which. A failures row says "No day recorded for this failure — set one: no date picked".
  After ✕ is pressed by keyboard the button is removed and the keyboard is left on nothing.
- **Should.** The app box's contract: `label` is "what the date is"; the product bar asks for labels and keyboard reach.
- **Fix.** (1) `SidePanel.jsx`: pass `title="Last Flown (Syllabus)"`, `"Last Flown (Currency)"`, `"Upchit date"`,
  `"End date A"`, `"End date B"`; the failures row: `title={x.label + ' failed on'}`. (2) `DateBox.jsx`: the ✕'s
  `aria-label` and `title` become `'Take the date off — ' + (title || 'this date')`. (3) `DateBox.jsx`: a ref on the
  `trdatebox-row` span; after `hand('')` from the ✕, `rowRef.current?.querySelector('button.datebox')?.focus()`.
  (4) Tests: the five accessible names; focus is on the box after ✕. (The unit test's `'Take this date off'`
  expectation changes with (2).)
- **Confidence.** High. **New** (the label is this change's); the old typed boxes had no name either, so nothing got
  worse — it stops short of what the new box asks for.

### F7 — LOW — a refusal's line stays under a box that is now right

- **Setup / action.** Last Flown holds 10 Oct. Pick 20 Oct → refused, the line shows, the box still reads 10 Oct. Open
  the calendar again and pick 10 Oct (or close it without picking).
- **What happens.** The app's box hands over a date only when it differs from the one held (`ui/DateBox.tsx:117`), so
  `hand` never runs and `warn` is never cleared (`tracker/components/DateBox.jsx:39-45`). "That day hasn't come yet —
  pick today or earlier" stays under a valid date until another day is saved or the student changes. The same in the
  pop-up for an event already done (`popMsg` is cleared only by `popDoneChanged`).
- **Should.** The line goes when the person acts on the box again (the old box cleared it on the next keystroke).
- **Fix.** `DateBox.jsx`: in the row's `onClickCapture` (F2 adds one) also call `setWarn('')` — a press on the box or
  in its calendar clears the old line; a refused pick sets it again after the commit answers. `Pop.jsx`: wrap the Done
  on box in a span whose `onClickCapture` does `if (core.popMsg && core.popMsg.where === 'done' &&
  core.isDone(s, p.id)) core.popDoneChanged(core.popDoneDate, false)` (only when the event is done — for one not yet
  done the refused day is still in the box and its line must stay). Test each.
- **Confidence.** High. Cosmetic. **New** (the "same day is no change" rule is the new box's).

### F8 — LOW — Delete on a date box, in Edit chart layout, deletes the selected line

- **Setup.** Edit chart layout on; a drawn line selected (Line / Edit lines tool). Pick an Upchit date in the side
  panel — the keyboard comes back to the box (`ui/DateBox.tsx:93`).
- **Action.** Press Delete or Backspace — the key that cleared a typed date box.
- **What happens.** `handleDeleteKey` (`core.js:5572-5590`) spares INPUT / TEXTAREA / SELECT; the box is a BUTTON
  now, so `deleteLine(selLine)` runs at once, with no question (balls selected: the "Delete …?" question comes up).
  The chart's ↶ brings the line back.
- **Should.** Nothing happens to the chart.
- **Fix.** In both guards of `handleDeleteKey` add `|| (t && t.closest && t.closest('.trdatebox, button.datebox'))`
  (and the `t0` twin). Test: arrange mode, a line selected, `keydown Delete` dispatched on `#upchit` → the line is
  still there.
- **Confidence.** Medium-high (the side panel is live in edit mode — nothing hides or disables it — not run).
  **Older code made reachable**: the guard knew the box as a typing field.

### F9 — NIT — a year before 1900 is dropped without a word

- The calendar's year list has no end (`ui/DateCal.tsx` `Wheel`); `validIso` accepts 1899, `core.isWholeDay` does not
  (`core.js:4410`). A side-panel pick of such a day returns silently at `DateBox.jsx:41` — no save, no line. In the
  pop-up it shows `NOT_WHOLE` — "type the whole day, or clear the box for today" — words for a box that can no longer
  be typed in or cleared, over a box reading "Pick a date". `ui-contracts.md` says that line "can no longer be
  reached from the box"; it can, this one way.
- **Fix.** Pass `min="1900-01-01"` AND `at={core.isoToday()}` to the three `AppDateBox` uses (without `at`, an empty
  box would open on January 1900 — `ui/DateBox.tsx:116`). Earlier days are then faint and cannot be picked.
- **Confidence.** High; reaching it takes scrolling the years back 127 rows.

---

## The builder's readings, each ruled

1. **A date is saved the moment it is picked** — *supported.* D801's full row: "a date is saved the moment it is
   picked", told to him. Its cost is F1 (a stray second tap is a save).
2. **A box that holds a date carries ✕ INSIDE its right end** — *his to decide on the look, with three things to
   know.* D801's row told him the way to empty is kept "**beside** the box"; it was built inside, over where the arrow
   was, for room — a visual choice he has not seen. It acts at once with no settle (F2). And on the two Last Flown
   boxes "emptied" was never given a meaning (F3). The substance — a way to empty is kept where empty means
   something — is supported for Upchit, End date A / B and a failure's day.
3. **Done on and Failed on carry none** — *supported.* D377: empty there means today; the box opens holding a day and
   can only be changed to another. The route back to today is the calendar's Today icon and a tap.
4. **End date A and B show the date without its weekday** — *supported* (D801: "reads the date in words" — it still
   does; the screen reader still hears the weekday). A visual call to tell him.
5. **A refused day in Done on / Failed on of an event NOT yet done stays in the box with its line** — *supported as
   the safer reading, to tell him.* D374's words are "the box goes back to what it had"; the 28 Sep store rule kept
   the day in the box because leaving a typed box raced the press that followed. With a picker that race is gone, so
   either would now be safe; as built, a refused pick behaves three ways (side panel: box unchanged; pop-up, event
   done: back to the mark's day; pop-up, not done: the refused day stays). Not a fault — nothing wrong is ever saved.
6. **The Tracker's other dates stay dd/mm/yy** — *supported* (his 16 Aug choice; D801 changes the boxes only). The
   pop-up now shows both forms a line apart ("Tue 13 Oct 2026" over "ST-02 05/10/26") — for his look.
7. **The lull periods' own calendar is not touched** — *supported.* D801 names the three date boxes; that calendar
   picks a range the Tracker draws itself.

---

## The state table — the cells that are wrong or unproved

Every other cell of the brief's table was walked in the code and is right; the negatives below say what was checked.

| State | Event | What the code does | Verdict |
|---|---|---|---|
| a calendar just opened by a tap | the same tap again | the second click acts on the card (a pick saves) | **wrong — F1** |
| no calendar, failures list | "take this date off" twice | the next failure slides under the ✕ and loses its day too | **wrong — F2** |
| no calendar, any other box | "take this date off" twice | the second press opens the calendar | wrong, harmless — F2 |
| no calendar, Last Flown | "take this date off" | both Last Flown days blank though flights are done | **his to decide — F3** |
| no calendar | a pick, then another inside 2s | one undo step for both | wrong against the contract — F4 |
| any, device off Singapore time | a pick of the calendar's "today" | refused east of Singapore | wrong — F5 |
| a refusal's line showing | the saved day picked again / the calendar closed | the line stays | wrong, cosmetic — F7 |
| no calendar, Edit chart layout, keyboard on a box | the Delete key | the selected line is deleted | wrong — F8 |
| a calendar open over the pop-up | a press on a date, the veil, the patch | the pop-up stays: React stops the click at `<body>` (the portal's home) before the document's "click outside" hears it | right by reading; **proved only in a browser** (the builder's smoke check) — keep that check |
| a calendar open, the keyboard dropped to the page (Safari does not focus a pressed button: open the calendar, press the month title — the focused date is unmounted) | Ctrl+Z | the key is no longer inside the layer, so the Tracker's Undo hears it; a mark step closes the pop-up and the calendar goes with it | **unproved** — predicted harmless; run in WebKit: open Done on, click the title, Ctrl+Z |
| a calendar open from a side-panel box, 621–1050px wide or the panel's own zoom not 100% | the desktop placing of the card | the card is placed from the box's measured place, under a CSS `zoom` (`tracker.css:509`, `SidePanel.jsx:204`) | **unproved in Safari** (it may report a zoomed box's place unscaled; Chromium ≥128 is right). Run: iPad portrait or desktop Safari at 800px, open Upchit — the card should sit under the box. Phones are centred by the stylesheet and not affected |
| a calendar open | Enter held down on a date | pick → the box → opens → picks the same day (no change) … while held | unproved, harmless — step one's own |

---

## Explicit negatives — each thing the brief said to look hardest at

- **What removing the typed box took away, caller by caller.** Side panel ×5 and the failures rows: save on blur /
  Enter / unmount → the pick (same setter, same refusal words back); emptying → the ✕ (same `''`); the half-typed
  guard → still there (`isWholeDay`), now only reachable per F9; the row's hover tooltip (`title`) is gone — it became
  the spoken label (F6); `style` moved from the box to its wrapper (no caller passes one). Pop-up ×2: `partial` is
  always `false` now and nothing else reads it; commit on Escape is not needed (nothing can be pending when Escape
  closes the pop-up); "clear the box for today" is replaced by picking today. **Nothing a caller relied on is lost
  beyond F6/F7.** The date-input rules left in `tracker.css` (`:380, :497, :533, :568, :572`) no longer match
  anything — dead, harmless.
- **The order of the two store calls in the pop-up** (`Pop.jsx:62,77`). `popDoneChanged` sets the day and clears the
  line, then `popDoneCommit` reads that day — the right order; both run inside one React click, so no draw happens
  between the two `notify()`s (I found no other listener of the Tracker's store that reads the pop-up's day — searched
  by name, not exhaustively). A done event is
  re-dated once (`setDoneDate`, one step, Last Flown settled in the same command); a refused day pushes no step; a
  not-done event saves nothing. **Nothing found.**
- **An `onCommit` that answers after the box has gone or its row has moved** (`DateBox.jsx:40-45`). Every setter does
  its work before its first `await`; `gone` stops a late `setWarn`; a successful re-date answers nothing, so no line
  can land on the failure that slid into the row; a refused one does not move the row; the `[saved]` effect clears a
  line when another failure arrives. `hand`, `onCommit` and the app box's `onPick` are rebuilt each draw — no stale
  student or row index. **Nothing found.** (Under the dev server's StrictMode `gone` sticks at `true` after the
  rehearsed unmount, so refusal lines never show in `vite dev` — older, dev-only; `useEffect(() => { gone.current =
  false; return () => { gone.current = true } }, [])` cures it. A built bundle is not affected.)
- **A double press on "take this date off".** **Found — F2.** The setters' own "same value" guards do stop a second
  identical write on the side-panel boxes.
- **The ✕ laid over the box.** A later sibling, absolutely placed, 26px wide: a press in that strip is the ✕'s, the
  rest the box's; no button inside a button; Tab goes box → ✕; what a screen reader hears is F6. Its size on a phone
  and what it does on Last Flown is F3.
- **A calendar left open when what it belongs to goes away.** The layer and the patch are children of the box — when
  the pop-up closes (`endSession`, an undo step, `resumeForPerson`), the failures list closes, or the Crew changes
  (the boxes are keyed by student), they unmount with it; the patch's timer is cleared. The Tracker page itself stays
  mounted on a page change, and a calendar would then stand over the next page — **but no gesture gets there**: the
  veil is at 600, over the top bar (60) and every Tracker layer (≤81); Tab is held inside the card; there is no
  keyboard page shortcut, no history routing, no sign-out without a press (searched). **Nothing found**; if a page
  change without a press is ever added, this is where it would show.
- **Escape's order.** The calendar takes Escape at the window on the way down and stops it; the second press reaches
  `handleEscapeKey`, which closes the failures list before the pop-up. **Nothing found.**
- **The undo history.** One accepted pick → one `pushMarkUndo`; a refused pick returns before it; the same day never
  reaches a setter. **Only F4** (the two-second fold).

## Notes for the records (no fault on screen)

- Comments now out of date: `Pop.jsx:5` (a line about the browser's part-typed flag, its code gone), `Pop.jsx:49-55`
  and `SidePanel.jsx:185-187, 335-337` (still say the boxes save when LEFT); `leftovers.test.tsx:220` ("the button
  beside the box"); `scripts/tracker/smoke.mjs` near `pickDay('#targetIn', …)` ("Enter: a Tab only steps…").
- `.claude/rules/decisions/tracker.md` §Architecture still says the Raptor-only code is `people.js`, `peoplewire.ts`,
  `TrackerPage.tsx` and one branch. Two Tracker components now draw Raptor's own date box and lean on its global
  stylesheet — a standalone export must carry `ui/DateBox.tsx`, `ui/DateCal.tsx` and what they import, and
  `26-date-calendar.css`. Worth one line there or in `known-gaps.md` (D201).
- The browser suite's "numeric dates" check now really saves a Last Flown day (20 Aug 2026) where the old script
  saved nothing. I checked it cannot hollow out the later "marking a flight done sets Last Flown" check: the store is
  cleared several times in between, and a flight on the same day takes a hand-picked day over.

## What I did not read or run

- By instruction: the builder's check and everything under `docs/handpass/parts/` but this file. By choice, to stay
  blind: `scripts/handpass/breaks/2026-10-13-tracker-date-boxes.json` and the two `scripts/handpass/trk-datebox-*.mjs`.
- Not run: any test, build, server or browser. Every "predicted" above is from reading.
- Read in part only: `tracker/app/core.js` (the functions the brief names, the undo section, the session end, the
  key handlers, `dragScroll`, the Last Flown settling — not its other 6,000 lines); `leftovers.test.tsx` (titles and
  the first date-box test); `tracker.css` (the rules that reach the new box); `Modals.jsx`, `Header.jsx`,
  `ShowAllPanel.jsx` (searched for date boxes and listeners only); `e2e/`; the calendar's own tests.
- Not measured: any size on screen (the ✕'s on a phone, the card's place) — worked out from the stylesheets.
