# Evidence — the night of 3 Nov 26: the swipe across weeks, the keyboard leftovers, the schedule's React Doctor warnings

Branch `claude/week-swipe-pdf-print` (its name kept from the plan; [PDF-PRINT-TWICE] was skipped on his word, 3 Nov 26).
Tier: **WALK** for the batch — a changed gesture (the swipe), keys added to existing controls; no published record, saved
data, roles or warnings (bug-check-order §5, questions 1–3, 7, 8 answered NO: nothing here writes, publishes or decides who
may do what; 5 YES — a gesture's reading and new keys).

## 0. The jobs
1. **[WEEK-SWIPE-CROSS]** — his iPhone recording, 3 Nov 26 00:05 (frames `raptor-port/docs/img/handpass/2026-11-03-week-swipe/owner/`).
2. **The keyboard leftovers** — [BOARD-OPEN-BY-KEYS]; [VEILED-WINDOWS-BAR]'s Escape part (the board's small menus, the
   Traffic and day-details windows). His word: "Skip the pdf replace with something else" — the agent's pick, the job offered.
3. **The schedule's React Doctor warnings** (D1534, D490 — they ride with the area's batch), after D1572's full run.

## 1. Job 1 — the builder's report (a fresh Opus helper, saved as it arrived, commit `4b377ec6e`)

**Reduce Motion ruled out** (his answer: off), and the glide does run on his iPhone: frames f02.75 and f06.50 of his
recording catch the two copies near the end of their slide.

**Why the cross felt abrupt (`ui/weekglide.ts`):**
- A1 — the leaving copy jumped back first: snapped to the day's resting place, not where the day stood (Sunday stood at 24px,
  its copy went up at 12; on the iPhone the jump would be Safari's whole pull past the end, about 80px in his recording).
- A2 — each copy snapped itself: the copies carry the week's class and so its scroll-snap; the arriving card drifted 12px
  mid-slide and settled 12px off where the real day rests, so the day hopped again as the copies came off — both directions.
- A3 — the slide was too fast: about 3.9px/ms at the start, three-quarters across in about 100ms; the browser's own snap for a
  within-week swipe peaks at about 2.3px/ms. At his recording's four frames a second a 280ms slide is one frame.
- A4 — Monday landed 12px off its snap point (0, where Monday's point is 12px in); Safari does not re-snap after a scroll the
  page writes (the snap-hold note), so on the iPhone Monday would sit 12px off.

**Why the swipe sometimes did not cross (`ui/pan.ts`):**
- M1 — a second swipe while the week was still settling: the week was 139–197px out, not read as at the edge.
- M2 — a short quick flick (under 45px) never crossed at the edge (both engines).
- M3 — direction judged on the whole path: a thumb's arc curling down (70 across, 80 down) was refused; the same rule crossed
  weeks on a drag begun down the day that drifted sideways (a second fault, found by the new test).

**What changed:** `pan.ts` — the end day counts while the week is still moving toward it (within half a day and 150ms); a
flick of 24px or more crosses if it is still moving at 0.3px/ms over its last 100ms; direction from the first 10px, held;
`weekLanding()` the one reading of where a cross lands. `weekglide.ts` — the leaving copy keeps its live place (a pull capped
at a quarter of a day); neither copy snaps; landing from `weekLanding`; 340ms from about 2.4px/ms, easing out.
`EditWeek.tsx`, `ViewWeek.tsx` — the Monday and Sunday landings use `weekLanding`. Tests: `e2e/weekswipe.spec.ts` (new,
registered in `playwright.config.ts`), `src/ui/swipeweeks.test.tsx` (+6), `src/ui/weekglide.test.ts` (+2; one timing 400 →
470ms for the longer slide). Records: `docs/ui-contracts.md` (the bullet after the snap-hold), `docs/file-map.md`.

**Red first:** 4 of the 6 new swipe unit tests failed on the old reading (the other 2 pin what must still not cross — at
rest, a slow drag, a held flick, a jiggle); both new glide tests failed (offset 0 where 60 expected; start 3.86px/ms); the new
browser spec failed its 4 new cases on the old code (the within-week guard passed); A2 shown red on an intermediate build.
**Now:** the browser spec 5/5, and 20/20 at 3× CPU slowdown; 13 existing week, arrow and board browser tests alongside;
63 unit files near the landing, 1,395 tests; build clean; `lint:changed` no new finding; docsize OK.

**The builder's own check by finger** (Chromium by real touch, 402 × 874; WebKit by touches inside the page with a
frame-position trace): Mon 13 → Sun 12 slow, back by a 40px flick; Sun 19 → wave-dense Mon 20 slow; Mon 20 → Sun 19 begun
on a wave block; Sun 19 → Mon 20 by flick; Tue 21 → Mon 20 and straight on to Sun 19; Wed → Thu inside the week one day
(390px), no glide. WebKit: the leaving copy goes up where the day stood (0 Monday, 24 Sunday), the arriving copy ends where
the real day rests, both directions; a 40px flick crosses, a slow 34px drag does not. Pictures
`raptor-port/docs/img/handpass/2026-11-03-week-swipe/build/` (`chromium-1…7`, `webkit-1`).

**Only his iPhone can show:** whether Safari reports its pull past the end as a scroll below 0 (if so the leaving day holds
it; if not, no worse than before); the feel of the 340ms pace; the 130–190ms pause after the lift while the week loads
(Safari's bounce plays in it — not changed); iOS momentum — whether a short flick and a swipe during settling now cross every time.
**A possible later step, not built:** put up the frozen copy of the day being left the instant the finger lifts, before the
week loads — within the settled design, more moving parts; wait for his look first.
**Seen in passing (older, not this job's):** old previews of other chats still hold ports 4179, 4180, 4188, 4191, 4197, 4290,
4301, 4311; the `?kbdebug` readout writes only on focus, resize and the visible screen's scroll — no frames lost to it.

## 1b. Job 2 — the builder's report (a fresh Opus helper, saved as it arrived, commit `e76f32440`)

**A. [BOARD-OPEN-BY-KEYS].** Was: the edit week's date that opens the board took no Tab and no key. Now: `html.ts` — the edit
week's `.dt.sb-open` is `role="button" tabindex="0"` (the view week's markup unchanged — parity); `interactions.ts`
`routeOpenKey` (Enter or Space open the board; a held-key repeat or a modifier does nothing; the same edit-page check as a click;
delegated on the document), wired in `Shell.tsx`; `board.ts` `openSchedulerByKeys`, `takeKeysIn`; `SchedBoard.tsx` — opened by
the keys, the keys go onto the board's own box (tabindex -1 only while that board is up, no ring), Escape and ✓ Done still put
them back on the date; `11-drag.css` the app's keyboard ring on the date, `:focus-visible` only; `10-board-history.css` no ring
on the board's box. **Beyond the brief, nothing on screen:** the keys move onto the board when it opens by them — else the next Tab
went into the week hidden under the board and the focus left sight (the guide: focus always visible).

**B. [VEILED-WINDOWS-BAR], the Escape part.** Was: the board's five small menus, the Traffic window and the day-details window did
not close on Escape (with one up, Escape did nothing). Now: `sheetfocus.ts` — one list of these, newest on top, one capture
listener that takes Escape and lets a question sheet over them answer first; `menuEscape` (removes the menu, unhooks its
click-outside listener, the keys back on its button); `useEscWindow` (closes the window, every way out puts the keys back on its
opener); `locate` finds the opener on the board, never the week's identical button under it. `board.ts popMenu` and
`interactions.ts openStoresMenu` call `menuEscape`; `Modals.tsx` AirPop and DayPop use `useEscWindow` (a Traffic line being typed
is saved first, as ✕ saves it); `boardescape.ts` comment brought up to date. Which windows cover the top bar: unchanged.

**Tests.** New `src/ui/boardkeys.test.tsx`, 16 cases — 14 red on the old code, each for its reason; the 2 Tab-route cases green
before and after, as they should be. `html.test.ts` (a pin that the view week's date has no tabindex); `boardescape.test.tsx` (the
Traffic case expects Escape to close it). All of `src/ui` under the lock: 4935 / 4936 — the one its own Tab-walk test timing out
under load, capped at 30 Tabs and a 60s limit, green on rerun. `e2e/board-escape-traffic.spec.ts` (real keys at 1536 × 864, two new
tests) 11 / 11 — **not run against the old code** (the builder's reasoning says they would fail there; the unit tests carry the red);
`e2e/schedule-tab.spec.ts` 31 / 31 — the Tab route unchanged. Build OK, `lint:changed` no new finding, docsize OK, **tfin 728 / 0**.

**The builder's keyboard run** (`scripts/handpass/keys-build-walk.mjs`, the built bundle): 20 / 20, no console or page errors, no
failed request. Pictures `raptor-port/docs/img/handpass/2026-11-03-week-swipe/keys-build/` — 01 the ring on Monday's date after
Shift+Tab (the host opened it: the cyan ring round "Jul 13 · Today", nothing else changed); 02 the board open after Enter, no ring
on its box; 03 + Block up, then gone after Escape with the ring back on + Block; 04–09, 11 the other menus and both windows; 10 the
ring back on the date after Escape closed the board; 12 no ring after a mouse click. Its one first-run failure was its own: after
the mouse round trip the week moved — the owner's 10 Aug 26 rule (a closed board brings its day to the week's front); the click
itself leaves the week where it was (20 → 20); the check now measures at the click.

**Seen in passing:** the duty role list on board rows is built by the same menu, so it closes on Escape too (with the caret in the
role box, the first Escape closes the list, the second puts the old text back); a menu's items cannot be reached by the keys; Tab
is not kept inside the board; the board's day-head crew-day picker is mouse-only — the three filed as [BOARD-KEYS-LEFT]. An older
line of `ui-contracts.md` (about line 673) that still said the board does not close on Escape was corrected.

## 1c. Job 3 — the schedule's React Doctor warnings (a fresh Opus helper, saved as it arrived, commit `6eb79cfdb`)

**67 dealt with: 41 FIXED, 26 KEPT** with a reason on the line above (one line each:
`raptor-port/docs/handpass/parts/rdc1103/dispositions.md`). Nothing a person sees changed.

| Kind | Fixed | Kept |
|---|---|---|
| only-export-components | 11 | 2 |
| js-set-map-lookups | 7 | 6 |
| control-has-associated-label | 9 | 0 |
| no-placeholder-only-field | 8 | 0 |
| no-static-element-interactions | 4 | 4 |
| no-high-complexity-react-function | 2 | 3 |
| prefer-html-dialog | 0 | 4 |
| click-events-have-key-events | 0 | 4 |
| no-giant-component | 0 | 2 |
| no-unthrottled-scroll-mutation | 0 | 1 |

(The 67 included three in `FloatWindow.tsx`; all three kept.)
**Fixed:** code moved word for word to new files — `topbits.tsx`'s non-screen exports to `ui/topstate.ts` (the sync chip's state,
the bell's tap and list state, `openNotice`, both undo engines), `jumpOf` to `ui/changesjump.ts`, `openAvailWinFrom` to
`ui/availopen.ts`, importers repointed; screen-reader names (aria-label only) on the duty and wave template editors' unnamed
controls and the board's search box; the shades behind the two template editors, the cancel dialog and Sort all marked as not a
control; faster look-ups in `highlights.ts warnTarget`, `histbubble.ts storyOf`, `board.ts`'s ground-sort note, `html.ts
signoffHTML`; two complexity findings by small parts drawing the same markup (`EntryChange` in the changes window, `WaveLine` and
`WaveEye` in the wave template editor).
**Kept:** the complexity of the changes window, the ALL AVAIL window and the board (splitting them re-wires ruled, checked
behaviour); four windows that could be a `<dialog>` (layered, non-blocking — a dialog brings the browser's own top layer);
FloatWindow's two exports (moving them touches the input window, the Inputs and SANS settings, the SANS day and about 40 tests —
the Inputs batch); three click boxes passing a press to buttons inside them (the board's day chips — real buttons would change a
measured bar's look, a picture first, D853); the ALL AVAIL window's list of men (pucks answer no key anywhere — a design job); the
wave menu following its box on scroll (D1081 — a throttle leaves it a frame behind); six look-ups in lists searched once.
**Checks:** React Doctor 0.9.18, the whole app after the job: 0 left in these files, the project 742 → 675 (exactly 67 fewer —
nothing new, the three new files included); `lint:changed` no new finding; build passes; tfin 728 / 0; unit — all of `src/ui` and
the moved code's other tests under the lock, 274 files, 5011 tests green; browser specs under the lock 155 passed (`availwin`,
`changeswin`, `boardside`, `look-keys`, `kbscroll`, `board-escape-traffic`, `sched-phone`, `save-note`); docsize OK. No behaviour
changed, so no new tests. **Left:** the board's day and week chips take no keys (most felt on a desktop, where the ‹ › day buttons
are not drawn) — added to [BOARD-KEYS-LEFT]; FloatWindow's two exports and the input window's 91 ride with the Inputs batch
([DOCTOR-INPUTS-RIDE]). **Seen in passing:** `ChangesWindow.tsx` still re-exports `openChanges`, which nothing imports from there.

## 2. The lesson (D1297)
`bug-check-order.md` §7.11 lesson 20 — a gesture walked once, slowly, pictured only at rest.

## 3. React Doctor's full run (D1572), 3 Nov 26, `main` at `0becbf0e7` plus the night's records
742 findings: 1 error — `no-eval` in `reference/probes/tdrag.js`, read-only, left (as D1572 found) — so the app's own errors
stay 0; 741 warnings (performance 427, bugs 72, security 1, maintainability 139, accessibility 102 — by the tool's groups).
By place: `src/ui` 333, `src/engine` 105, `docs` (old walk and mock-up scripts) 119, `reference` 66, `src/state` 58,
`scripts` 32, the rest 29. The schedule's own screens and windows carry about 65 (job 3); the input window's 91
(`ui/inputedit.tsx`) ride with the next Inputs batch.

## 4. The roll-call (bug-check-order §6) — every place the three jobs reach

| # | Place | What it must do | Mark |
|---|---|---|---|
| R1 | Edit Schedule's week, phone, upright (402 × 874) — swipe off Monday / Sunday | cross into the next / last week with the slide, landing on Sunday / Monday at its resting place; every way a hand swipes (lesson 20) | has it — to walk (WebKit, Chromium) |
| R2 | View-only Sched's week, phone — the same swipe | the same as R1 (its own landing code, `ViewWeek.tsx`) | has it — to walk |
| R3 | Inside a week, phone — a swipe between Tuesday and Wednesday | one day, no glide, unchanged | must not change — to walk |
| R4 | The Scheduler Board on a phone — a sideways swipe | never crosses a week (its arrows own the day, 12 Aug 26) | must not, because the board steps by its arrows — to walk |
| R5 | A phone on its side, up to 820 wide (812 × 375) — the week's swipe | the cross as R1 (above 820 wide the page is the desktop layout, by design — §6) | has it — walked A12x |
| R6 | Desktop week (1536 × 864) — ‹ › across weeks, the week picker | instant, unchanged (desktop never glides) | must not change — to walk |
| R7 | Edit Schedule's week, desktop — Tab to a day's date, Enter, Space | opens the board; ring only for the keys; Escape / ✓ Done put the keys back on the date | has it — to walk |
| R8 | View-only Sched's date | no key stop (parity) | must not, because the view week is the reference copy — to walk |
| R9 | Phone — a tap on the edit week's date | opens the board as before, no ring | must not change — to walk |
| R10 | The board's small menus — + Block, Templates, plans, a jet's stores, + Wave, the duty role list | Escape closes the menu only, the board stays, the keys on its button | has it — to walk |
| R11 | The Traffic window, the day-details window | Escape closes it only; a Traffic line being typed is saved | has it — to walk |
| R12 | A question sheet over a menu or window | Escape answers the sheet first | has it — test `boardkeys.test.tsx`; one walk step |
| R13 | Undo / Redo, the bell and its list, the sync chip (their code moved to `topstate.ts`) | work as before | must not change — plain-user round |
| R14 | The changes window (a line tapped jumps — `changesjump.ts`) | as before | must not change — plain-user round |
| R15 | The ALL AVAIL window (`availopen.ts`) | opens from a count as before | must not change — plain-user round |
| R16 | The duty and wave template editors, Sort all, the cancel dialog, the board's search | as before; names for a screen reader only | must not change visibly — plain-user round |

## 5. Sizing the walk (D607, `walk-ledger.md`)
1. **Type:** C (a changed gesture — the swipe's reading; new keys on existing controls) with E (the slide's motion) for jobs 1–2;
   job 3 is code moved and names added with no behaviour change — the plain-user round is its walk (D1557).
2. **What only a walk can find:** how the cross moves on a real touch screen frame by frame (lesson 20); whether a swipe crosses
   the ways a hand makes it; the ring and where the keys land on the real page; whether moved code still answers on screen
   (Undo, the bell, the changes window, ALL AVAIL). The tests carry: the edge reading's thresholds (`swipeweeks.test.tsx`), the
   glide's offsets and speed (`weekglide.test.ts`), the keys (`boardkeys.test.tsx`), Escape order with a sheet over (R12).
3. **The ledger:** gesture walks by the host or one helper by real fingers over CDP found faults their tests missed (the pinch,
   21 Oct 26: 3; [NO-PAGE-ZOOM], 2 Nov 26: 0 faults, 3 walk-script faults); the keyboard walks of the windows (24 Oct, 30 Oct 26)
   found focus faults no unit test saw. The August swipe walks pictured one slow drag at rest — lesson 20.
4. **The walk chosen (Low — one walker at a time):** walker A, Sonnet 5.5 — the phone: R1–R5 on the built bundle at `e44d50a26`,
   Chromium by real touch over CDP and WebKit by touches inside the page, each cross slow, quick-short, curling, and again before
   the snap settles, on a ground day and a wave-dense day, with a frame-position trace of both copies and the real day; about 16
   scenarios. Walker B, Sonnet 5.5 — the desktop and the plain-user round: R6–R16 at 1536 × 864, by keyboard only for R7–R12, then
   the schedule's everyday tasks start to finish (a man dragged on and off, Undo, Redo, the bell, the changes window and a jump,
   ALL AVAIL, the duty and wave templates, Sort all, a cancel, the board's search); about 18 scenarios. The host opens every
   deciding picture. His iPhone carries what a test browser cannot: Safari's own pull past the end and momentum.
5. **After:** its row in `walk-ledger.md`.

## 6. The walk — walker A, the phone (Sonnet 5.5; its report `raptor-port/docs/handpass/parts/ws-walk-a.md`, pictures and traces `raptor-port/docs/img/handpass/2026-11-03-week-swipe/walk/A/`)

On the bundle at `e44d50a26`. **Chromium by real touch: 13 PASS, 2 FAIL; WebKit by touches inside the page: 4 PASS, 1 not walked.**
No console error, page error or failed request anywhere.
- **PASS** A1 (slow), A2 (a quick 30px flick), A3 (a curling thumb), A4 (a vertical drag drifting sideways — no cross), A5 (back),
  A6 (a second swipe straight on), A7 (a wave-dense Monday, begun on a wave block), A8 (a slow 34px drag held — no cross), A9 (inside
  the week — one day, no copies), A10a/b (View-only Sched), A11 (the board on a phone — never crosses; its arrows do). In every cross
  on both weeks the leaving copy went up exactly where the day stood and the arriving copy ended exactly where the real day rests
  (difference 0); nothing sped up or reversed mid-slide; the only steps over 30px are the glide's own, 42–50px a frame.
  WebKit A1, A2, A5, A9 — the endpoints; WebKit draws the glide at about 5 frames a second at pixel ratio 3, so A1, A2, A5 were
  also run at ratio 1, all PASS. The host opened A1's mid-slide and after pictures: Monday sliding out with Sunday under it; Sunday at
  its resting place.
- **FAIL A6b — a second swipe about 120ms after the first lifts crosses only most times:** 4 of 24 runs at gaps of 100–170ms did not
  cross (3 of 3 at 17ms did). In the four, the week stood still 84 or 127px from Monday for 160ms or more, so it was not read as
  settling and the swipe only carried it on to Monday. The test browser's snap may start late; the fix makes the reading not depend
  on it (§7).
- **A12 — not a fault; the roll-call's R5 was wrong:** at 844 × 390 the page is the desktop layout (above 820 wide — the ‹ › arrows,
  no phone swipe, by design); at 812 × 375 the cross works each way (A12x, PASS). R5 is corrected to "a phone on its side up to 820
  wide". His iPhone on its side is wider than 820, so it shows the desktop layout — as before.
- **Not walked:** WebKit A6 — touches raised inside the page cannot hold the strip part-way, so the premise cannot be made there.
- **The walk's own:** A2 as first driven (two moves) read as a stopped finger (this browser leaves about 34ms before the lift) —
  one move crosses; A10b first began on empty page under a short card, where a swipe does nothing (older) — re-aimed at the card.
- **Seen in passing:** the arriving copy stands two frames under the leaving one before it slides, and a 12px strip of its card
  (390–402) is then not covered — not caught in a picture (§7 asks the builder); a cyan ring round "MAKE PUBLIC" in A7's last picture
  — likely the touch's hover or focus, not looked into yet.

### 6b. Walker B — the desktop keys and the plain-user round (Sonnet 5.5; `raptor-port/docs/handpass/parts/ws-walk-b.md`, 78 pictures `…/walk/B/`)

On the bundle at `e44d50a26`, 1536 × 864. **18 / 18 PASS**; no console error, page error or failed request.
- **Keys (R7–R12):** Tab from the top bar reaches Monday's date in 13 stops, the ring and nothing else; Enter opens the board, Escape
  closes it with the ring back on the date, Space opens it again; ✓ Done by Tab (9 stops) and Enter, the ring back on the date. All
  five small menus close on Escape alone, the board staying, the ring on their button (the host opened B5's stores picture: the
  menu gone, the ring on the jet's stores button). The Traffic and day-details windows close on Escape over the board and on the
  week, the keys back on their openers; a Traffic line typed but not left survives Escape. The Tab route over a day's text boxes
  unchanged, the date never a stop in it; 100 Tabs on View-only Sched never land on a date. A mouse click, and a tap at 402 × 874,
  open the board with no ring after.
- **The plain-user round (R13–R16, D1557):** a man dragged onto an empty seat shows on the week and the board, Undo takes him off,
  Redo puts him back; the bell opens and closes by a click outside, Escape and the bell; the changes window opens, a tapped line
  takes the schedule to the change, ✕ closes it; the ALL AVAIL window opens from its count, moves, closes; both template editors
  open, Tab stays inside, ✕ and Escape close them with nothing saved; Sort all and the CX dialog open and close changing nothing;
  the board's search lights the matching pucks and clears; the sync chip as before. The demo week has no empty flying seat and no
  ALL AVAIL count — both made through real controls (+ aircraft; ALL AVAIL dragged onto a programme row).
- **The walk's own:** three first-run reads of its script (the Traffic text begins with its line's template; the change found by the
  seat, not a stored key; the dialogs by their real ids) — fixed and re-run.
- **Seen in passing (older — `main` the same):** Escape does nothing on the Sort all dialog (Cancel, ✕ and a click outside close
  it) — filed under [BOARD-KEYS-LEFT]; the duty and wave template editors have no Cancel (Done and ✕; ✕ only) — as built, not a fault.
