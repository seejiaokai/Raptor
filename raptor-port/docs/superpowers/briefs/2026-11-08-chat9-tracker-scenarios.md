# Scenario design — chat 9, the Tracker: D1790 (the marking window and the chart's slide), D1791 (Find's ✕ on a phone), D1792 (c) (↺ Restore drawn)

Written 8 Nov 26 by a fresh Opus reader who did not build the change and did not open its code or its diff (`popPlace.js`,
`Pop.jsx`, `Header.jsx`, `Modals.jsx` and `git diff` unread). Worked from the promise: the full rows of D1790–D1792 and of
D984, D986, D989, D980, D992, D1406, D373, D129, D801, D1127, D1290, D991, D672; the pictures round's notes
(`docs/img/handpass/2026-11-07-pictures-round/notes-marks.md` §1, §2, §3(c)) and its pictures `q-trkpop-*`, `q-trkfind-*`,
`q-r5c-*`; `ui-contracts.md` §The Tracker tab and §The pictures round's answers; `design-practices.md` §2, §5 and lessons
45 and 12; the bug-check checklist and the order's §2a, §2b, §4, §5, §6, §7.0, §7.0a, §7.2, §7.10, §7.11 (all 23 lessons and
the second 23), §8; `walk-ledger.md`; `walk-scripts.md`; `feature-impact.md` §3 and its Tracker and failed-save-band rows;
`scripts/handpass/pr-marks.mjs` (the drawing's own route). Nothing was run.

Marks used below: **(builder)** — a choice the builder made, handed to me as such, so its EXPECTED line rests on the
build's description, not on a ruling; **(host's reading)** — no ruling settles the case: the host settles the EXPECTED
line before the brief goes to a walker (§9 lists them), and until then the step is RECORD.

**Not a finding (D56):** this app is pre-promulgation and its whole stored world is demo data that will be cleared before
the database step. A problem whose harm exists only in data already stored, while the code is already correct going
forward, is not reported. Every scenario below makes its own fixture through the app's controls.

---

## 1. The tier — WALK

| # | Question | Answer, and why |
|---|---|---|
| 1 | Money (pay, OIL, who counts as present) | NO — a Tracker mark is a training record; none of the three changes alters what a mark records. |
| 2 | The published record | NO — the Tracker has no publish, signature or amendment. |
| 3 | Saved data | NO, **on one condition the host checks in the diff**: the three rulings move a window, scroll the chart and close Find — view state only (D376 keeps a person's course, chart and student, not the scroll) — and swap Restore's mark while Restore still calls the same restore (D128). If the diff touches any save, store or undo writer, this is YES and the tier is FULL. |
| 4 | A shared drawer | YES — one marking window, placed by one rule, opened five ways (a tap, a click, Enter, after a Find landing, after a crew landing); the chart's one scroller that D984's landing also moves; the Tracker's one Reset arrow drawn in a second place. |
| 5 | A new gesture or mode | YES — a new motion with a waiting state (the chart slides while the window waits unseen), and a new action on the strip's ✕. |
| 6 | A new surface | NO — the same window; scrolling inside itself is already its contract ("the grading pop-up stays on screen and scrolls inside itself when taller than it"). |
| 7 | Roles | NO — the Tracker reads no role (D121). |
| 8 | The warning list | NO — no rule, no warning. |

**YES to 4 and 5 → WALK**: the gates, the roll-call (a shared drawer), the door check (a new mode), a sized walk at both
widths and the short screen, the new motion in every order, a break test per surface, the drawing check (three approved
drawings), the evidence sheet; and, because the job needs a code read, Astra's read and the fresh, blind Opus read of the
finished code (D790, D1770). The same tier the ledger gave the Tracker's glide and scroll changes (17 and 18 Oct 26).

---

## 2. The rulings the walk checks, in the app's words

- **D1790** — when the marking window would not fit below the event tapped, the chart slides the event up under the tabs
  with its own smooth scroll, only as far as needed, and stays there after Close; the window opens whole below it; phone
  and desktop (on a desktop, under the Tracker bar); an event too near the chart's end to slide: option B — nothing moves,
  the window held between the tabs and the event, its lower part scrolling inside it.
  **(builder)** the window stays unseen while the chart slides and opens when it rests; it opens 4px under the event's
  edge; with less motion asked for, the chart jumps; on a screen too short for the window anywhere (a phone on its side)
  the event slides as high as it may and the window scrolls inside itself under it.
- **D1791** — on a phone the ✕ in Find's strip empties the box and puts Find away — the keys down, the tabs back — as
  Escape does; its hover words "Clear the search and close Find"; a pick from the list puts Find away on purpose; on a
  desktop nothing changes. **(builder)** the strip is Find at any width up to 1050.
- **D1792 (c)** — the typed ↺ on Restore in the Syllabus order and Course order windows becomes the app's drawn Reset
  arrow; the button keeps its word.
- **Left as they are, each checked against the build:** D984 (Find, a crew pick and the boot land an event in the chart's
  middle, never with space above the chart's start; the slide comes only when the window opens); D986 (a touch on the
  gliding chart only stops it, nothing opens); D989 (the app's own move stops a glide and wins; a lift after a drag or
  glide opens nothing); D992 (on a phone the phone scrolls the chart itself); D980 (one Tab to the chart, arrows, Enter
  opens the window with the keys inside, Escape back to the same event); D801 (Done on and Failed on open the app's
  calendar; a tap picks; the window stays open); D374 (a day after the squadron's day is refused, the window staying
  open); D371 (failures in day order); D128 (a deleted course or chart comes back whole); D1127 (the ✕ stays in the
  search box); D1406 (a mouse keeps the chart's scroll bars, a touch screen draws none); D373 (under about 500px tall the
  short-screen layout); D672 and the contract "↶ ↷ keep the chart's view"; D121 (the same for every login); the
  design guide's §2 (a window's keys go round inside it; when it closes, the keys go back to its opener; a drawn glyph's
  spoken name says what it does; nothing that takes the keys hides under a bar that stays) and §5 (motion off for less
  motion; a new motion's frame rate measured, D991); lesson 45 (the window never hides what it is about); lesson 12 (the
  keys closing make nothing jump for a frame).

---

## 3. The roll-call (§6)

Three columns: **SHOW** (the window whole, the event in view / Find gone and the tabs back / the arrow drawn), **USABLE**
(every control in it reached and pressed; it closes), **PAINTED** (what else stands on those pixels). Each cell:
**has it** / **must not, because…** / **MISSING** (no ruling and no stated choice gives this place a route — the build
may well lack it).

### 3a. The marking window and the slide (D1790) — 38 rows

| # | Where, and how it opens | SHOW | USABLE | PAINTED | Scen. |
|---|---|---|---|---|---|
| A1 | Tap, phone upright, mid-chart, after a Find pick (ACG-09) | has it | has it | has it — top bar, Tracker bar and tabs above the slid event; the turquoise ring on it | S1, S2 |
| A2 | Tap, phone, after the Crew dropdown's landing | has it | has it | has it | S5 |
| A3 | Tap on ANOTHER student's wedge | must not, because that tap only picks (contract, 9 Sep 26) | has it — the pick works, the chart unmoved | has it — the cyan edge moves to him | S5 |
| A4 | Tap where the window fits below (the chart's top, or high on screen) | must not slide, because D1790 slides only when it would not fit | has it | has it | S2, S4 |
| A5 | Tap near the chart's end, no room to slide — option B | has it | has it — scrolls inside; no scroll passes to the chart | has it | S3 |
| A6 | Near the end, room to slide part of the way | MISSING — unruled between B and the slide | MISSING | MISSING — the window may sit on the event or run past the foot | S3 |
| A7 | Event half under the tabs, window fits below | must not slide, because it fits — RECORD how much of the event shows | has it | has it — the tabs cover its top half; for him if it reads badly | S2 |
| A8 | Click, his PC 1536×864 (under the Tracker bar) | has it | has it | has it | S6 |
| A9 | Click, his real window 1536×730 at 125% | has it | has it | has it | S6 |
| A10 | Click, 2560×1440 (fits) | must not slide, because it fits | has it | has it | S6 |
| A11 | Click, narrow desktop 1000×800 (tabs; the chart's scroll bars) | has it | has it | has it — the chart's scroll bar beside the window | S9 |
| A12 | Enter by keyboard, PC (D980) | has it | has it — the keys inside once it shows; Escape back to the event | has it — the event's blue ring below the bar | S7 |
| A13 | Enter by keyboard, narrow desktop | has it | has it | has it | S7 |
| A14 | Enter on the chart's last event (B) | has it | has it — Tab brings the scrolled-away part into view | has it | S7 |
| A15 | Phone on its side 874×402 (too short anywhere) | has it (builder) | has it — scrolls inside | has it | S10 |
| A16 | On its side AND at the chart's end | MISSING — B and the short-screen rule meet; neither says which wins | has it — must stay reachable | has it | S10 |
| A17 | A short desktop (768×432 ≈ his PC at 200%; 1000×500) | has it (builder's short path) | has it | has it | S11 |
| A18 | Chart zoomed in (pinch, zoom buttons) | has it — 4px under the drawn edge at that zoom | has it | has it | S6, S12 |
| A19 | Chart zoomed out; ⤢ Fit | has it | has it | has it | S6, S12 |
| A20 | Less motion (phone, PC, WebKit) | has it — the jump (builder) | has it | has it | S13 |
| A21 | His iPhone's engine (WebKit) | has it — must open once the chart rests | has it | has it | S21 |
| A22 | Member `us` (D121) | has it | has it | has it | S22 |
| A23 | The app's calendar from Done on / Failed on, over the slid window | has it — whole on screen at the window's new place | has it — pick, Escape, a press outside | has it — the calendar over the window | S10, S16, S17 |
| A24 | ✎ Edit details from the slid window | has it | has it — Cancel, ✕, Escape, outside | has it | S17 |
| A25 | The window grows after it opened (a refusal line, failures added) | MISSING — no rule named for a window that grows | must stay reachable | has it | S16 |
| A26 | A press elsewhere during the slide (a ball, a tab, a drag, Undo, the wheel, Escape, a menu) | MISSING — D986 and D989 rule the glide, not this slide | MISSING | MISSING — a waiting window must take no press | S14 |
| A27 | A second press on the same event during the slide (double tap, double click, Enter twice) | MISSING | MISSING — must record no grade nobody saw | MISSING | S8 |
| A28 | A second event tapped while a window is open | has it — what one tap does stays as today | has it | has it — the first window gone before the chart moves | S15 |
| A29 | Another student's wedge pressed beside an open window (lesson 4) | has it — as today | has it | has it — what lights matches the window | S15 |
| A30 | Closed by Close, a press outside, a tab, Escape, Undo, a half switch | has it — the chart stays (D1790; ↶ ↷ keep the view) | has it | has it | S17 |
| A31 | The page or the half switched during the slide | MISSING | MISSING | MISSING — a window could open over another half or page | S20 |
| A32 | The phone turned with a window open | MISSING | MISSING | has it | S10, S20 |
| A33 | The failed-save band — up before the tap; arriving while the window is open | has it — the top limit moves down with the band | has it | MISSING — the band arriving may push the event under the fixed window | S19 |
| A34 | ⓘ Details mode (the bubble) | must not slide, because D1790 names the marking window — RECORD the bubble's own place | has it | has it | S5 |
| A35 | Edit chart layout | must not, because a tap there arranges | has it | has it | S5 |
| A36 | Show All open | MISSING — what a row opens is unknown here; the chart behind must not slide | has it | has it | S5 |
| A37 | "Loading…" while a person's place loads | must not, because a press on a ball does nothing then (contract) — not walked: no control reaches it quickly; its existing test carries it | — none | — none | — |
| A38 | The found and "can fly next" rings, wider than the ball | has it — the whole ball | has it | MISSING — "4px under the event's edge": the ball's or its ring's? The window may sit on the ring (lesson 45) | S1, S6 |

### 3b. Find's ✕ and every way Find is put away (D1791) — 22 rows

| # | Where, and in what state | SHOW | USABLE | PAINTED | Scen. |
|---|---|---|---|---|---|
| B1 | Phone strip, typed, no Enter (list open) → ✕ | has it | has it | has it — tabs back and pressable | S24 |
| B2 | Phone strip, after Enter landed a match → ✕ | has it — the ring goes, the chart stays | has it | has it | S24 |
| B3 | Phone strip, empty box → ✕ | has it | has it | has it | S24 |
| B4 | Phone strip, no match → ✕ | has it | has it | has it | S24 |
| B5 | The ✕'s hover words and spoken name | has it — "Clear the search and close Find" | has it | has it | S24 |
| B6 | Under the ✕ lies the tabs' row | must not open a tab, Show All or Legend, because the tap ends at the ✕ | has it | must not — no tab left looking pressed | S24 |
| B7 | Escape on the strip | must not change, because D1791 matches ✕ to it | has it | has it | S25 |
| B8 | Enter | must not change — lands, the strip and keys stay | has it | has it | S25 |
| B9 | 🔍 again | must not change | has it | has it | S25 |
| B10 | A press outside | must not change | has it | has it | S25 |
| B11 | A pick from the list | has it — away on purpose, the result as today's | has it | must not reach the ball under the row | S25 |
| B12 | WebKit phone | has it | has it | has it | S24 |
| B13 | Phone on its side (the strip) | has it | has it | has it | S26 |
| B14 | Narrow desktop 1000×800 with a mouse (the strip) | has it — (host's reading of "on a phone", §9 Q4) | has it | has it | S26 |
| B15 | Narrow desktop by keys — where the keys go after ✕ | has it — closes | MISSING — no stop named; the design guide's §2 says back to 🔍 | has it | S26 |
| B16 | His PC 1536 — the box in the bar → ✕ | must not change, because "on a desktop nothing changes" | has it — the keys stay in the box | has it | S27 |
| B17 | His PC — a pick | must not change | has it | has it | S27 |
| B18 | The width crossing 1050 with Find open | MISSING — the ✕'s words and action must follow the layout on screen | MISSING | has it | S27 |
| B19 | Find from the Info half or the Show All half | has it — ✕ leaves the half as it was | has it | has it | S28 |
| B20 | 🔍 and ✕ back and forth (lesson 17) | has it | has it | has it — nothing moves | S29 |
| B21 | The keys going down on ✕ with no one-frame jump (lesson 12) | has it — his iPhone only | has it | has it | §7 |
| B22 | The ✕ in the box, its size (D1127, D1170) | must not change, because D1127 keeps it in the box | has it | has it | S24 |

### 3c. ↺ Restore drawn (D1792 c) — 11 rows

| # | Where | SHOW | USABLE | PAINTED | Scen. |
|---|---|---|---|---|---|
| C1 | Syllabus order window, a deleted chart's row | has it | has it — Restore brings it back (D128) | has it | S30 |
| C2 | Course order window, a deleted course's row | has it | has it | has it | S31 |
| C3 | Several deleted rows (first, middle, last; the list scrolling) | has it — every row | has it | has it | S30 |
| C4 | A long deleted name | has it — the button one line, the row one height | has it | has it | S30 |
| C5 | Phone 402 by touch; a WebKit picture | has it | has it | has it | S30 |
| C6 | Hover; the keys on it | has it — the arrow in the word's colour; the cyan ring | has it | has it | S30 |
| C7 | Its spoken name | has it — "Restore"; the arrow silent | has it | has it | S30 |
| C8 | The crew reorder window | must not, because it has no deleted list | has it | has it | S31 |
| C9 | ⠿ ▲ ▼ in the same windows | must not change, because D1792 names ↺ Restore only | has it | has it | S31 |
| C10 | Any other typed ↺ or ↻ left in the Tracker | has it — the host's search of the code, each walked | has it | has it | S31 |
| C11 | Beside the approved drawings `q-r5c-pc/ph-restore-drawn` | has it | has it | has it | S32 |

**71 rows; 12 MISSING** (A6, A16, A25, A26, A27, A31, A32, A33, A36, A38, B15, B18).

---

## 4. The world, and what every scenario asserts

**Builds.** BRANCH — this branch's production build, frozen, on its own port (prove the port free and that it serves the
branch's bundle by its hashed name — walk-scripts §1). MAIN — `origin/main`'s build at the branch's merge-base, on a
second port, for every "as today" comparison.

**Sign-in** `ad` / `a` (Saber, admin); S22 as `us` / `us`. **Clock:** `ctx.clock.install({ time: new
Date('2026-07-13T09:00:00') })`, left running (walk-scripts §1), as the drawing did — **except S1, S6, S7, S13, S14, S21**,
which install none: Playwright's clock takes over `requestAnimationFrame` and the timers, and the slide and the moment it
rests are the subject; where the window goes does not depend on the date.

**Never** add `*{scroll-behavior:auto!important}` in a D1790 scenario — `lib.mjs open()` and `pr-marks.mjs`' ring style
both do, and it can turn the slide into a jump and hide W4.

**Sizes.** PHONE 402×874, touch (isMobile, hasTouch), 2× pictures · SIDE 874×402, touch, 2× · PC 1536×864 mouse at device
scale 1.25 (his display runs at 125%) · PC-REAL 1536×730 at 1.25 (his browser's real window, as the ledger's 1 Nov 26 row
drove it) · NARROW 1000×800 mouse (≤1050: the phone's tabs and Find strip, with a mouse; launched with
`--hide-scrollbars` off, since D1406 keeps the chart's bars for a mouse) · SHORT-PC 768×432 mouse at 2× (his PC at 200%)
· BIG 2560×1440 mouse (S6 only).

**Engines.** Chromium throughout; WebKit (his iPhone's engine) for S13, S17, S21, S24, S30's phone picture and S33's
closing steps. In WebKit a ball is tapped by `locator.tap()` / `touchscreen.tap()`; if that opens nothing on MAIN either,
click with the mouse in the touch context and say so in the sheet (walk-scripts §4: in-page touches drive no pointer
events there). Headed Chromium (`headless: false`) for S23e (a headless CDP finger makes no fling), and before any "the
window never appeared" is reported.

**Route (host-proven, walk-scripts §2).** `scripts/handpass/trk1105-walk-lib.mjs` `open({ engine, size, touch, who,
tracker: true })` (passing, 5 Nov 26); from `pr-marks.mjs`: `trkOpen`, `findType` (sets the box's value and fires a
bubbling input — never `page.type`), `ballAt`, `trkGeo`. The controls seen on the drawing's passing run — prove each on
BRANCH before use: 🔍 `#hSearchBtn`, the box `#hSearch`, ✕ `#hSearchClear`, the strip `#hSearchPanel`, the list rows
`#hSearchList .findrow`, the count `#hSearchStat`, the tabs `#viewtabs`, the chart's scroller `#board`, the balls `#flowSvg
.ball[data-id]`, the window `#pop` (its Close: `#pop button` with "Close"), the Tracker bar `#page-tracker header`, the
chart picker `#sylSel`, the Syllabus pencil `#sylMenuBtn`, menu rows `.menupanel button`, the question's OK `#dlgOk`, the
order window `#ordModal`, its Restore buttons `#ordHidden .ordrow button`.

**Premise of every scenario** (asserted first): course 26ABSG, chart 2026, Student A picked; ACG-09 drawn on the chart.

**Helpers, written once.** GEO — the rects of the app's top bar, the Tracker bar, the tabs (when shown), the failed-save
band (when shown), `#board`, `#pop`, a named ball and its outermost ring. LIMIT — the foot of the lowest of those bars.
TRACE(ms) — an in-page recorder, one line per animation frame: time, `#board.scrollTop`, the named ball's rect, `#pop`'s
display / visibility / opacity / rect, `document.activeElement`. SNAP — Find's state: the box's value, the strip shown,
the active element, any ball wearing the turquoise found ring (read it as the smoke suite does — prove it first), the
list shown, `#hSearchStat`'s words, `#board.scrollTop`, the half shown, any panel open.

**Pictures** to `raptor-port/docs/img/handpass/2026-11-08-chat9-tracker/walk/`, one folder a run, named `S<nn>-<step>.png`.
On a touch size, a picture within about 100ms of each tap's lift, the pointer left where it pressed, as well as the
settled one (D1281, §7.10). Watch console errors, page errors and every 4xx throughout.

### The marking window's invariants — W1–W8 (every D1790 step asserts all eight)

- **W1** — the window's top ≥ LIMIT: never over the top bar, the Tracker bar, the tabs or the band.
- **W2** — the window's box meets neither the ball's drawn box nor its outermost ring; RECORD the gap from the ball's foot
  and from the ring's foot to the window's top (builder: 4px from the event's edge — §9 Q5).
- **W3** — the whole window can be used: either its top ≥ LIMIT and its foot ≤ the screen's foot (RECORD the margin), or
  it scrolls inside itself and Close and ✎ Edit details can be scrolled into view and are what `elementFromPoint` finds
  at their centres.
- **W4** — the window is never seen moving: in every frame until `#board.scrollTop` stops changing, `#pop` is not shown
  AND the screen's pixels in its final box show no window (lesson 22 — count the window's own background colour, read at
  rest, in one picture taken mid-slide); after it shows, its rect never changes; no frame shows it at its old place
  (flipped above, 8px from the top). RECORD the time from the last scroll change to its first shown frame.
- **W5** — no waiting window takes a press: during the slide, `elementFromPoint` at the window's final centre and at the
  first tap's point is not inside `#pop`.
- **W6** — the slid event's top ≥ LIMIT (never under a bar); RECORD its gap below LIMIT and the slide's length.
- **W7** — after the window closes by any way, `#board.scrollTop` holds (±1px) for 1s.
- **W8** — no error, no 4xx; no grade written unless the step pressed one (the top bar's Undo greyed, or its words
  unchanged, and the ball's fill and the Failures card as before).

### Find's invariants after ✕ on the strip — F1–F7

- **F1** the box empty. **F2** the strip gone, and `elementFromPoint` at each tab's centre finds that tab. **F3** the keys
  out of the box (`document.activeElement` is not `#hSearch` — on a phone, the keys down). **F4** no ball wears the found
  ring. **F5** the list gone; RECORD `#hSearchStat`'s words. **F6** `#board.scrollTop` and the half shown unchanged; no
  panel opened. **F7** the ✕'s hover words "Clear the search and close Find"; RECORD its spoken name.

### Restore's invariants — R1–R6

- **R1** an arrow drawn in the button — its ink in its box (lesson 22) — and no "↺" in the words the button shows.
- **R2** the arrow before the word: its right edge at or left of the word's left, their middles within 2px (walk-scripts
  §4).
- **R3** the button one line, as tall as on MAIN, the word at its size there; every deleted row one height (the second 23).
- **R4** the arrow in the word's colour at rest, on hover and with the keys on it (the cyan ring painted).
- **R5** the button's spoken name "Restore" (design guide §2).
- **R6** pressed, the chart or course comes back whole (D128) and leaves the deleted list; the other rows keep the arrow.

---

## 5. The scenarios

### The slide (D1790)

**S1 — The ruled case on his iPhone's size, with the frames.** PHONE, Chromium, no clock.
1. Open. 🔍, `findType('ACG-09')`, tap the row reading ACG-09. Assert D984 unchanged: ACG-09's centre within 4px of the
   chart box's middle, and within 2px of where MAIN lands it (the notes measured the ball at 419–448).
2. Start TRACE(2000). Tap ACG-09's centre. Picture at +100ms.
3. Must: W1–W8. The chart moves over at least 6 frames, upward only, no step back; the window shows once it rests, below
   ACG-09. RECORD: the slide's length and time, the frames, the delay to the window, ACG-09's resting top, the window's top
   and foot.
4. Set beside the approved drawing (ACG-09 at 187–216, the window 214–643): list each difference over 2px. **(host's
   reading, §9 Q1)** — the drawing slid 232px to just under the tabs; a build that slides only until the window fits
   (here about 15–50px) reads "only as far as needed" the other way: RECORD which, and it goes to him as a named
   departure (D1424, D1426) if it is not the drawing's.
5. `elementFromPoint` at each control's centre, Not done to ✎ Edit details, finds it (press none).
6. Tap Close; pictures at +100ms and settled. W7.
7. Tap ACG-09 again (now high): the window opens with no slide; W1–W3.
Pictures: `S01-landed`, `S01-tap100`, `S01-midslide`, `S01-open`, `S01-closed`, `S01-reopen`.

**S2 — Where the window goes, all down the chart (lesson 1's table).** PHONE, Chromium.
1. Place ACG-09 by a real finger drag of the chart (a CDP finger that rests 90ms before it lifts; assert the scroller
   moved — walk-scripts §4) with its centre at LIMIT+20, then every 40px to the screen's foot; and, found by halving to
   2px, the last place the window fits below and the first where it does not.
2. At each: tap, wait 1.5s, classify NO-SLIDE / SLIDE / B / OTHER; W1–W8; Close.
3. Must: NO-SLIDE wherever the window fits whole below (RECORD the foot margin the build keeps); SLIDE everywhere else
   (ACG-09 is mid-chart — never B). A table: place × class × window top and foot × ACG-09's top after.
4. ACG-09 with its top 15px under the tabs: tap its visible half. Must: no slide (it fits below), W1, W2; RECORD how much
   of it shows (A7).
Pictures: one of each class, the two threshold places, the half-hidden ball.

**S3 — The chart's end: option B, and part of a slide.** PHONE, Chromium; then PC.
1. Drag the chart to its end (until `scrollTop` stops growing). RECORD the code of the lowest event.
2. Tap it. Must (D1790's B): `scrollTop` unchanged ±1; the window between LIMIT and the event (top ≥ LIMIT, foot above the
   ball's top — RECORD the gap); its lower part scrolls inside it: a finger drag inside the window moves the window's own
   scroll, and dragged on past its end the chart does NOT move; ✎ Edit details and Close then found and pressed by a tap.
3. Walk up the last screenful's events one row at a time; tap each: RECORD the class and W1–W8. **(host's reading, §9
   Q2)** — an event with room for part of a slide: the expected is the invariants; whether it slides part-way, does not
   slide, or slides and lets the window scroll inside below is RECORDED and put to him if it is not B.
4. PC: the same end; the mouse wheel inside the window scrolls the window and not the chart.
Pictures: `S03-B`, `S03-inner-scrolled`, one per new class.

**S4 — The chart's top.** PHONE and PC.
1. Scroll to the top. Tap the highest event: no slide, W1–W3.
2. PC: the same by a click.

**S5 — The other openers, and the taps that must not open it.** PHONE, Chromium.
1. Crew dropdown → Student B: the chart lands on his latest work (D984 — within 2px of MAIN's landing). Tap that event's
   centre: the slide, then the window naming Student B (RECORD its heading); W1–W8.
2. Close. On a ball beside it, tap ANOTHER student's wedge: he is picked, the Crew dropdown follows, nothing opens, the
   chart does NOT move (A3). Picture right after the tap. Tap his own wedge: the window, with its slide if needed.
3. ⓘ on: tap a mid-chart event — the details bubble, not the marking window, and no slide. RECORD where the bubble
   stands: if it covers the bars or the tabs as the marking window used to, file it for him as D1790's twin — not this
   build's fault (A34). ⓘ off.
4. Syllabus pencil → Edit chart layout: tap a ball — no window, no slide; ✓ Done editing chart.
5. Show All tab: press ACG-09's row. RECORD beside MAIN what opens; if the marking window, W1–W3 for it at the Show All
   half, and no slide of the chart behind it (A36). Flow chart again: the chart where it was, `scrollTop` as before.

**S6 — His PC.** PC and PC-REAL, Chromium, mouse, no clock; then BIG.
1. Type ACG-09 in the bar's Find box, Enter: ACG-09 lands (within 2px of MAIN), the turquoise ring on it.
2. TRACE; click ACG-09's centre. Must: the chart slides ACG-09 up under the Tracker bar (LIMIT is the Tracker bar's
   foot), the window whole below; W1–W8; RECORD as S1. No desktop drawing of the result exists: the walk carries it.
3. Close; W7. Click ACG-09 again: no slide.
4. Steps 1–2 at PC-REAL (730 tall — RECORD how many of S2's places need the slide here) and at BIG 2560×1440, where a
   mid-chart event must open with NO slide.
5. The chart's zoom buttons: in three times, click a mid-chart event; out three times, the same; ⤢ Fit, then the lowest
   event (RECORD its class). W2 measured from the ball's drawn edge at each zoom.

**S7 — By keyboard (D980).** PC, Chromium, no clock; then NARROW.
Before the walk the host lists, from the code, every control in the marking window the keys can reach (lesson 14 — the
designer cannot).
1. Tab until the chart takes the keys (one Tab stop — RECORD the presses); arrows to ACG-09 (or the nearest event whose
   window would not fit below — RECORD its code); its blue ring painted.
2. TRACE; Enter. Must: the slide, then the window; `document.activeElement` inside `#pop` from its first shown frame
   (RECORD the frame) — never inside it while it is unseen, never left on the page's body; W1–W8.
3. Tab and Shift+Tab: round the host's list inside the window, each stop with the cyan ring; a stop in a scrolled-away
   part is brought into view as it takes the keys.
4. Escape: the window closes, the keys back on ACG-09, its blue ring whole below the Tracker bar (`elementFromPoint` at
   the ring's top point is the chart, not the bar — design guide §2); W7.
5. ↓ then Enter within 100ms (the arrow's own move still running — D989): the window opens for the event the ring is on,
   whole; W1–W8.
6. Steps 1–4 at NARROW (LIMIT is the tabs' foot).
7. Enter on S3's last event: B; Tab reaches every stop, each brought into view.

**S8 — A second press while the chart slides (the riskiest).** PHONE, Chromium; PC.
- (a) PHONE, ACG-09 landed: two taps on its centre 300ms apart, then 600ms apart (two taps under about half a second are
  Chromium's double tap — walk-scripts §4 — so run both).
- (b) PC: a double click on ACG-09; two clicks 250ms apart.
- (c) PC by keys: Enter, Enter within 150ms; Enter, Space within 150ms.
Must, each, 1.5s later: no grade written (W8 — the top bar's Undo as before, ACG-09's wedge fill and the Failures card as
before); any window shown reads "Not done" as before; W1–W8. RECORD what the second press did — nothing, closed the
window, reopened it, pressed inside it.
*Why:* the second tap lands at the event's OLD place, which after the slide lies inside the window's final box; a window
waiting there unseen but pressable records a grade nobody saw.

**S9 — The narrow desktop with a mouse.** NARROW, Chromium, scroll bars on.
1. Open: the Flow chart / Info / Show All tabs show, and the chart's scroll bars (D1406).
2. 🔍 → the strip; type ACG-09; click its row: lands; the strip goes.
3. Click ACG-09: the slide under the TABS; W1–W8; RECORD whether the window overlaps the chart's scroll bar.
4. With the window open, roll the mouse wheel over the chart: RECORD, beside MAIN, whether the window stays, closes or
   follows; never left over the event's new place (RECORD — not ruled).

**S10 — The phone on its side.** SIDE, Chromium, touch.
1. Open. RECORD the bars' and tabs' heights, the chart box's height, the window's full height.
2. Find ACG-09 (the strip), pick, tap it. Must (builder): ACG-09 as high as it may go (its top at LIMIT plus the same gap
   as upright), the window under it scrolling inside itself, its foot ≤ the screen's foot (RECORD the margin); W1–W8.
3. A finger drag inside the window scrolls it; past its end the chart does not move; ✎ Edit details and Close reached and
   pressed.
4. Tap Done on: the app's calendar whole on screen (`elementFromPoint` just inside its four corners), or itself
   scrollable — RECORD; pick a past day: the calendar goes, the window where it was, the chart unmoved.
5. The chart's last event here: tap. RECORD which rule wins, B or the short-screen rule (**host's reading, §9 Q3**); W1–W3.
6. A window open, turn the phone to 402×874 and back: RECORD — closed, or placed again by the rules; never left over the
   tabs or off the screen with no way to close it (A32).

**S11 — A short desktop.** SHORT-PC and 1000×500, Chromium, mouse.
S10's steps 2–3 by a click and the wheel, and once by Enter; W1–W8.

**S12 — The chart pinched.** PHONE, Chromium, two real CDP fingers (worked example `trk-small-walk.mjs`; a finger lifted
by a touch-end that names it).
1. ACG-09 landed. Pinch out to about twice the size, around a point part-way down the chart (lesson 13); a picture
   mid-pinch; lift. Re-measure ACG-09's drawn box. Tap its centre: W1–W8, W2 from the ball's edge at this zoom.
2. Pinch in to the smallest; tap a mid-chart event; W1–W8.

**S13 — Less motion.** PHONE and PC, Chromium, `reducedMotion: 'reduce'`, no clock; PHONE again in WebKit.
S1 / S6 step 2. Must (builder): `scrollTop` changes in one frame; the window shows within 2 frames after (RECORD the ms),
in the same place as S1 / S6 (±1px); W1–W8; no fade or growing on the window (design guide §5 — RECORD any).

**S14 — Something else pressed during the slide.** PHONE (headed if headless makes no slide), PC, no clock.
From S1's landing each time; the second press sent about 80ms after the tap — confirm from TRACE that `scrollTop` was
still changing when it landed, else RECORD "too late" and send it at 40ms:
(a) a tap on another ball one row down; (b) a tap on the Info tab; (c) a 60px finger drag on empty chart; (d) a tap on
the top bar's Undo, with one grade made earlier so Undo is live (RECORD what it takes back); (e) PC: three notches of the
wheel over the chart; (f) PC: Escape; (g) PC: a click on the Course pencil.
Must, each, watched for 2s: either no window, or one window obeying W1–W3 for the event it names (RECORD which); no window
later over another half or page or at a stale place; no grade written (W8); no `#pop` left unseen yet pressable — after
2s it is either shown or gone; the next ordinary tap on ACG-09 opens it at once. (A26 — the expected line is these
invariants, §9 Q6.)

**S15 — A second event while a window is open.** PHONE, Chromium; PC.
1. On MAIN first: RECORD what one tap on another ball does while a window is open (closes only, or closes and opens).
2. BRANCH: ACG-09's window open after its slide. Tap a ball beside the window (not under it) whose own window would not fit
   below. Must: one tap does what it does on MAIN; if its window opens, ACG-09's window is gone before the chart moves (no
   TRACE frame shows it while `scrollTop` changes), the second event slides under LIMIT, its window names its code; W1–W8.
3. With a window open, tap ACG-09's own ball again: as MAIN.
4. Lesson 4: with ACG-09's window open for Student A, tap Student B's wedge on a ball beside it. RECORD beside MAIN what
   lights and what the window then says; must not be a window naming Student A while Student B is picked and lit.

**S16 — The window grows; a refusal inside it.** PHONE, Chromium, clock held at Mon 13 Jul 26.
1. ACG-09's window open after its slide; RECORD its height and foot.
2. Failed on → the calendar: RECORD whether Tue 14 Jul 26 is offered; if it can be picked, the line under the box (D374 —
   "That day hasn’t come yet…") appears and the window grows. Must: its foot still on screen or the window scrolls inside
   itself; its top unchanged; nothing slides again (A25). Tap away, tap Failed on afresh, pick Fri 10 Jul 26: the line
   goes; press +: the failure ACG-09 is added (D371). Then Thu 9 Jul and Wed 8 Jul, + each: after each, W1–W3, Close
   reachable.
3. Done on → Sun 12 Jul 26 → DCO: Student A's wedge filled DCO; the box reads "Sun 12 Jul 2026" (D801); the chart unmoved.
4. − takes back the failure with the latest day (D371). Close.
Pictures after each change of height.

**S17 — Every way it closes, and the windows over it (lesson 19).** PHONE Chromium, PHONE WebKit, PC.
From S1's open window each time, reopened between:
(a) Close; (b) a tap on empty chart; (c) the Info tab — the Info half, no window over it; Flow chart again — the chart
where it was; (d) Escape (PC); (e) a grade pressed in the window, then the top bar's Undo — the window closes (contract),
the grade goes, the chart does NOT move (↶ ↷ keep the chart's view; D672); Redo — unmoved; (f) ✎ Edit details: the
details window whole (W3 for it), closed by its Cancel, its ✕, Escape, a press outside — each: RECORD beside MAIN whether
the marking window is still there; if so, its rect unchanged and the chart unmoved; (g) Done on → the calendar over the
window → closed by a pick, Escape (PC), a tap on the window's own area, a tap on the chart: RECORD beside MAIN; the
calendar goes first (design guide §2 — Escape closes what opened last; contract — a press on the calendar is not a press
outside the window).
Must, each: W7; a picture right after each tap.

**S18 — What stands over the slid event and the window (lessons 4, 5, 15).** PHONE and PC.
With ACG-09 slid and its window open, and once more with the window closed after the slide:
(a) `elementFromPoint` at ACG-09's centre and its top point finds the ball; inside the window's four corners and centre
finds `#pop`. (b) 🔍 with the window open: RECORD (closes it as a press outside?); with it closed and ACG-09 under the
tabs, type "ACG": RECORD whether the list from the strip covers ACG-09 (Find's own list, over the chart while finding).
(c) Legend, the Course pencil's menu, the Syllabus pencil's menu, ⚙ flex settings, each opened while ACG-09 sits under
the tabs: each over the chart as on MAIN, each closed by a press outside, ACG-09 unmoved. (d) The chart's zoom control
against the window: RECORD any overlap; in it, `elementFromPoint` finds `#pop`. (e) After a grade, the passing note: RECORD
where; not over Close. (f) The tabs and the Tracker bar over the slid chart keep their own fill — no ball shows through
(D1518); a picture.

**S19 — The failed-save band (D587; `?savefail`, D1666).** PHONE and PC.
1. Open at `/?savefail`. Find ACG-09, pick. Press a grade on another event: the save fails, the "Not saved — keep this
   page open · Retry" band comes under the top bar and the page moves down a line (RECORD the tabs' new foot). Close.
2. Tap ACG-09: the slide stops at the tabs' NEW foot; W1–W8, W1 against the band too.
3. A fresh `?savefail` world, step 1's first grade skipped: ACG-09's window open after its slide, press DCO — the band
   arrives while the window is open. RECORD the window's and ACG-09's rects after the page moves. Must not: the window
   over the band or the tabs, or over ACG-09 (A33 — the band fires a window resize, and a thing that measures the bar must
   hear it: `feature-impact.md` §the failed-save band).

**S20 — Hidden or turned during the slide (lesson 10; a listener above its component).** PHONE Chromium and WebKit; PC.
(a) PHONE: tap ACG-09; at about 60ms tap the Info tab. Watch 2s: no window over Info, no error. Flow chart again: no stale
window; RECORD `scrollTop`. (b) PC: click ACG-09; at about 60ms click the top bar's Edit Schedule. Watch 2s there: no
Tracker window; a click and Escape on that page work, not taken by the Tracker. Back to the Tracker: no stale window;
RECORD where the chart stands. (c) PHONE WebKit: (b) through the ☰ menu. (d) S10 step 6 from upright.

**S21 — His iPhone's engine.** PHONE, WebKit, no clock.
1. RECORD `'onscrollend' in window` in this WebKit.
2. S1 steps 1–6. Must: the window shows within 1s of the chart resting (RECORD the ms), placed per W1–W3; W4 — no frame of
   it before the rest, none at its old place at the top; a picture right after the tap.
3. S3 step 2 (B at the chart's end) in WebKit.
*Why:* a window that waits for a "the scroll has ended" signal his phone's engine does not send never opens on his iPhone.

**S22 — The member.** PHONE, Chromium, `us` / `us`. S1 steps 1–6, and S24 (a) once (D121).

**S23 — The ways a hand taps (lesson 20; D986, D989).** PHONE, Chromium; (e) headed.
From a fresh ACG-09 landing each time: (a) a quick tap, the finger down 40ms; (b) a slow tap, down 400ms, still; (c) a
tap that drifts 4px; (d) a 15px drag, then lift — D989: nothing opens, no slide; (e) flick the chart, and tap ACG-09
while it still glides — D986: the glide stops, nothing opens; tap again — the window with its slide; (f) the moment the
window shows, tap DCO within 100ms — the grade lands on the first tap; (g) Close, and within 150ms tap another mid-chart
event — its window, with its slide, on the first tap (the app's own slide must not leave the chart thinking a glide is
under way).
Must: (a)–(c) as S1, or as MAIN where MAIN opens nothing; (d) and (e) as ruled; (f) and (g) work first time.

### Find's ✕ (D1791)

**S24 — ✕ on the phone's strip, in every state.** PHONE, Chromium; (a)–(d) again in WebKit.
Each from a fresh 🔍: (a) ACG-09 typed, no Enter, the list open; (b) ACG-09 typed, Enter — it lands, the strip and the
keys stay (as MAIN); (c) the box empty; (d) "zz" typed, no match (RECORD the count's words); (e) after a pick, 🔍 again
(RECORD what the box holds, beside MAIN).
Tap ✕; pictures within 100ms and settled. Must: F1–F7; in (b) the chart stays where Enter landed it. **Under the ✕ lies
the tabs' row:** the half shown unchanged, no Show All panel, no Legend, no tab looking pressed in the picture after the
tap (B6). Then tap the Info tab once: Info shows on that one tap.
The ✕'s size and place in the box as on MAIN (D1127, D1170); the strip's box and ✕ one height (the second 23).

**S25 — ✕ is Escape; the rest as today.** PHONE (Chromium with a keyboard), BRANCH and MAIN.
1. From S24 (b)'s state, SNAP after ✕; from the same state, SNAP after Escape: the two identical.
2. From the same state on MAIN and on BRANCH, SNAP after each of: Enter, 🔍 again, a tap outside the strip on empty chart,
   a pick from the list. Must: identical on both builds — the pick's result too (it lands, the ring on the picked event,
   the box's words kept or not as on MAIN, the keys down, the tabs back).
3. A pick whose row lies over a ball: no marking window, no student picked, no slide — only the landing (B11).

**S26 — The strip on a narrow desktop and on a phone on its side.** NARROW, mouse; SIDE, touch.
1. NARROW: 🔍, type ACG-09, Enter; hover ✕: "Clear the search and close Find"; click it: F1–F6. **(host's reading, §9
   Q4)** — D1791 says "on a phone" and "on a desktop nothing changes"; the option he chose said "where Find is the strip",
   and the builder applied it at any width up to 1050: expected — it closes.
2. NARROW by keys: 🔍, type, Tab to ✕, Enter: F1–F6; RECORD `document.activeElement`. Expected (design guide §2: when a
   panel closes, the keys go back to the button that opened it): on 🔍, never on the page's body (B15, §9 Q7).
3. SIDE: S24 (a) and (b).

**S27 — His PC's box is untouched.** PC, mouse, BRANCH and MAIN.
1. Type ACG-09 in the bar's box, Enter; hover ✕: "Clear the search". Click it: the box empty, the ring gone, the box still
   there with the keys IN it (`document.activeElement` is `#hSearch`) — SNAP identical to MAIN.
2. A pick from the list: as MAIN (the list shuts, the keys leave, the words stay).
3. Words typed, the window narrowed 1536 → 1000: RECORD whether the strip is open; the ✕'s hover words now "…and close
   Find"; ✕ closes. Back to 1536: the box; its ✕ "Clear the search", emptying and keeping the keys (B18 — a ✕ whose words
   or action lag behind the width is a FAIL).

**S28 — Find from the Info and Show All halves.** PHONE, Chromium.
1. Info tab. 🔍, ACG-09, Enter: RECORD beside MAIN whether the half switches to the chart. ✕: F1–F7, the half as it was
   just before ✕.
2. Info tab. 🔍, ACG-09, pick: RECORD the half beside MAIN; if the chart shows, tap ACG-09 — S1's slide and window,
   W1–W8.
3. Show All tab: step 1 again.

**S29 — Find shown and hidden, back and forth (lesson 17).** PHONE, Chromium.
🔍 → ✕ → 🔍 → Escape → 🔍 → a tap outside → 🔍 → pick → 🔍 → ✕. After each: the chart box's top and height and the tabs'
rect as at the start; at each 🔍 the keys go into the box and the strip covers the tabs, as today.

### ↺ Restore (D1792 c)

**S30 — The Syllabus order window.** PC and PHONE (touch), Chromium; one PHONE picture in WebKit.
Fixture, through the app's controls: Syllabus pencil → Duplicate "Tx 2026" (RECORD the copy's name) → rename it "Tx 2026
copy for the long-name fit check, Wednesday 28 October" → delete it; delete "Tx 2026"; delete one more chart. Syllabus
pencil → ⇅ Reorder syllabi. For the phone, force an iPhone's wider letters from the first paint (§7.2).
Must, every deleted row: R1–R5 (hover on PC; Tab to it for R4's ring). A close-up of the button at 2× beside the chart's
Reset layout button (§7.10). Press Restore on "Tx 2026": R6 — back in the chart picker; the others keep the arrow. Close
the window by each of its ways; RECORD each beside MAIN.

**S31 — The Course order window, and nowhere else.** PC and PHONE.
1. Course pencil → Duplicate 26ABSG (RECORD the name) → delete the copy → Course pencil → ⇅ Reorder courses → "Deleted
   courses": R1–R5; press Restore: R6 — the course back with its students (D128).
2. The crew reorder window: no deleted list, no Restore (C8).
3. The host searches `src/tracker` for every typed ↺ and ↻ left; each is walked on screen and drawn, or named with its
   reason (C10).
4. The ⠿ ▲ ▼ in these windows stay typed (C9).

**S32 — The drawing check (the host's; §7.0, `walk-scripts.md` §10).** No part list exists for these three drawings:
write them in `scripts/drawcheck/specs/` and record them from `pr-marks.mjs` on the drawing's build (`main` at
`6e6c55667`), then check BRANCH.
- `q-trkpop-ph-A-drawn` (402×874) — parts: ACG-09's ball (place), `#pop` (place, size), `#viewtabs` (place); reach: Find
  ACG-09, pick, tap. Drawn at the phone's size only; the desktop is S6's. Departures to name to him: the window's top 4px
  under the ball (drawn 2px over it — the notes §1(g) asked for "under the ball's edge"), and ACG-09's resting place if
  the build slides less than the drawing (S1 step 4).
- `q-trkfind-ph-A-drawn` — parts: `#viewtabs` (place, shown), `#hSearchPanel` (gone), 🔍 (place); reach: 🔍, ACG-09, Enter,
  ✕ (the drawing pressed Escape for A — the same end).
- `q-r5c-pc-restore-drawn`, `q-r5c-ph-restore-drawn` — parts: the Restore button (place, size), its arrow (place, size —
  drawn at 15), the word (words-place); reach: `pr-marks.mjs` r5c's route.
Each difference over 2px goes to him side by side (D1426).

### The plain-user round (D1557, §7.0a)

**S33 — The Tracker's everyday round on his iPhone's size.** PHONE, Chromium, touch, clock held at Mon 13 Jul 26;
step (k)'s closes again in WebKit.
(a) Sign in; ☰ → Tracker. (b) Crew → Student A. (c) 🔍 → ACG-09 → pick (Find goes). (d) Tap ACG-09: the slide, the window.
(e) Failed on → Fri 10 Jul 26 → +. (f) Done on → Sun 12 Jul 26 → DCO. (g) ✎ Edit details → read → Cancel. (h) Close.
(i) Every place that should show it: the ball (Student A's wedge DCO, the red failure tick); the Info half (the Failures
card lists ACG-09 with Fri 10 Jul; Last Flown (Syllabus) — RECORD whether it reads 12 Jul: D123, the latest day flown);
Show All's row for ACG-09; ⓘ's bubble on ACG-09 (its failure); the top bar's Undo words ("Undo the mark on ACG-09 for
STUDENT A"); the save corner. (j) Undo: DCO goes, the chart unmoved; Redo: back. (k) Every control that opens or closes,
opened and shut: the marking window (Close, a press outside), the calendar, Edit details, Find (🔍, ✕, a press outside,
a pick), the Course and Syllabus pencils' menus, ⇅ Reorder courses and syllabi, Legend, ⚙ flex settings, the Flow chart /
Info / Show All tabs. (l) Reload and sign in: the marks there (DCO, the failure with its day), the same course, chart and
student (D376).
A picture at each step and right after each tap.

**S34 — The same round on his PC.** PC-REAL, Chromium, mouse and keys, clock held.
S33 with the bar's Find box and clicks; once by keys (Tab to the chart, arrows, Enter, Escape); Undo by Ctrl+Z and Redo by
Ctrl+Y (not from inside a box); the reload.

**34 scenarios** (S1–S34, S32 the host's drawing check among them).

---

## 6. Breaks for the host's list (§8 item 4)

One break a wired surface, each with the test or walk step that must go red: the slide skipped (S1, S6); the window
shown during the slide (S1 W4); the wait for the rest removed (S8, S14); the top limit set to 8 (S1 W1, S6); the 4px
gap taken off (S1 W2); the less-motion jump removed (S13); the keys put into the window before it shows (S7); ✕ back to
refocusing on the strip (S24); the ✕'s words reverted (S24 F7); the strip-only test removed so ✕ closes the desktop's box
(S27); the pick's deliberate close removed (S25); the Restore arrow removed or put after the word (S30 R1, R2).

---

## 7. What only his iPhone can show — for his look card (lessons 6, 21)

- The slide's smoothness at his phone's 120 frames (D991) and the moment the window appears after it.
- Whether the window opens at all in Safari — the "the scroll has ended" signal (S21 says what this WebKit does; his
  phone is the proof).
- A tap during the slide: Safari stops the app's own scroll under a finger its own way (S14 shows only the test browser's).
- ✕ on the strip: the keys going down with nothing jumping for a frame (lesson 12), and no hover tint left on the tab
  under his finger (D1281).
- A pick from Find's list: the keys going down while the chart lands.

---

## 8. Every lesson of §7.11 — where it is covered

| Lesson | Covered by, or why it cannot apply |
|---|---|
| 1 states × readings | S2's table (no slide / slide / B / part / short), S3, S10 |
| 2 speeds | S23 |
| 3 what tells him it happened | S1 (the slide and the window), S24 (the tabs back), S30 (the row leaves) |
| 4 the page behind a window | S15 step 4, S18 |
| 5 a box moved into sight, against what stands over it | S18, S19, S1 W6 |
| 6 handed to the phone | the slide moves a chart the phone scrolls (D992) — §7; S9 with scroll bars on |
| 7 steered frame by frame | applies only if TRACE shows the app setting the scroll itself each frame: then his recording before merge (the host reads S1's trace) |
| 8 the approved drawing | S32, S1 step 4, S24, S30 |
| 9 a list measured | S30 (each deleted row, phone and desktop) |
| 10 hidden and shown again | S20, in WebKit too |
| 11 how much fits on screen | S2, S6 (PC-REAL, BIG, zoom), S11, S12; the chart's two ends S3, S4 |
| 12 every page a window opens from | the marking window: S1, S5, S6, S7, S9 (each opener); Find: S28 (each half) |
| 13 a pinch part-way down | S12 |
| 14 the keyboard's stops from the code | S7 — the host's list |
| 15 bars over a scrolling area | S18 (f), S1 W6 |
| 16 after a refusal | S16 |
| 17 shown and hidden both ways | S29, S20 |
| 18 print | cannot apply — nothing here prints or downloads |
| 19 windows over windows, closed every way | S17 |
| 20 the ways a hand does it; again before it settles | S23, S8, S14 |
| 21 a test browser's touch is not his | §7 |
| 22 judged by what is drawn | S1 / S13 W4 (pixels mid-slide), S30 R1 (the arrow's ink) |
| 23 what a tap opens, set against the rulings | S5 (a wedge picks, the centre opens; ⓘ; Edit chart layout; a Show All row), S23 |
| the second 23 — side-by-side boxes one height | S24 (the strip's box and ✕), S30 (each row), every picture |

---

## 9. For the host to settle before the brief leaves

- **Q1 — how far the chart slides.** The ruling: "slides the event up under the tabs … only as far as needed". The
  approved drawing and the notes §1(d)–(f) slid ACG-09 232px, to just under the tabs; a slide only until the window fits
  is the other reading (about 15–50px for ACG-09). S1 step 4 records which; the drawing check names the difference.
- **Q2 — part of a slide near the chart's end** (A6). Not ruled.
- **Q3 — on its side and at the chart's end** (A16): B or the short-screen rule.
- **Q4 — Find's ✕ on a narrow desktop** (B14): the ruling's line says "on a phone"; the option he chose says "where Find
  is the strip".
- **Q5 — "4px under the event's edge"** (A38): the ball's edge, or its outermost ring's (the turquoise found ring after
  every Find, the "can fly next" ring).
- **Q6 — a press during the slide** (A26, A27): the expected line is the invariants, not one behaviour.
- **Q7 — where the keys go after ✕ at ≤1050** (B15): the design guide's §2 says back to 🔍.
- **Q8 — question 3 of the tier:** confirm from the diff that no save, store or undo writer changed.

---

## 10. The sizing line (for `walk-ledger.md` — the host adds the row after the walk)

1. **The type of change:** C (a new motion with a waiting state — the chart slides while the window waits unseen; a new
   action on the strip's ✕) and E (where the window sits; the drawn Restore arrow). Not G: nothing saved changes (§1 Q3,
   on the host's check); not H: no role.
2. **What only a walk could find here:** the five openers of the one window (a tap, a click, Enter, after a Find landing,
   after a crew landing); the slide's frames and the window's first frame; a press during the slide; the window at rest
   against the bars, the tabs, the strip, the band and the zoom control; each size (402 by touch, 1536×864 and his real
   1536×730 at 125%, 1000×800 with a mouse, 874×402, 768×432); whether WebKit ever tells the window the chart has rested;
   the ✕'s tap on the tabs' row beneath it and where the keys go; the arrow's place on Restore. The tests and the reads
   carry the placing rule's arithmetic and the ✕'s states.
3. **What the ledger says:** the Tracker's pop-up and keyboard walk of 17 Oct 26 (D980) found 3 faults by walking, all in
   the window and the keys (the keys not taken into the window, the ring dropping while it was up); the glide walk of the
   same day found 2, one a finger on an event mid-glide still opening it — the family S8 and S14 test; the scroll walks
   of 18 and 21 Oct 26 found none in the test browser, their reads finding what it cannot show; one Sonnet walker on a
   Tracker job has cost about 277,000–445,000 tokens (21 Oct and 5 Nov 26) and found 0 faults on tidy-ups.
4. **The walk chosen:** ONE Sonnet 5.5 walker, scripted, on a frozen BRANCH build with MAIN beside it for the "as today"
   steps; 34 scenarios (S32 the host's drawing check); Chromium at PHONE, SIDE, PC, PC-REAL, NARROW, SHORT-PC and BIG,
   WebKit at PHONE for S13, S17, S21, S24, S30, S33; headed Chromium for S23 (e); the host first proves the route and
   the selectors, writes the three part lists, lists the window's keyboard stops and the Tracker's remaining ↺ from the
   code, then opens every deciding picture and reproduces every FAIL. A test carries only the repeated places of S2's
   sweep beyond those walked — a browser test that taps the real ball at each place (the host names it and what it
   proves); the ✕'s states and the pick are pinned in `tracker.test.tsx` and the smoke suite, beside the walk, not
   instead of it. His iPhone carries §7. Time: not measured for this shape; the walker's tokens are expected near the
   ledger's 277,000–445,000.
5. **After the walk:** its row in the ledger, with what it found, before the closing report.
