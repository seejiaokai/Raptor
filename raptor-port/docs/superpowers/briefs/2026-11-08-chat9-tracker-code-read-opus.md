# Chat 9 — fresh, blind Opus code read of D1790, D1791, D1792 (c)

Read at commit `7d750640e` against base `549482bd5` (`git diff` / `git show`, never the working tree). Read beside it: `core.js`
(openPop, closePop, ballTap, chartKey, kbdKeepInView, kbdBack, the board's focus/blur listeners, stopGlide/dragScroll,
scrollToEvent, padBoard, renderBoard, redrawKeepView, searchGo, clearSearch), `App.jsx` (clickAway, the board and tab
layout), `Glyphs.jsx`, `tracker.css` (`.pop`, `.board`, `.board::after`, `.findpanel`, `#hSearchBtn`, the 1050 blocks,
`.ordrow`), `SidePanel.jsx` (event chips), the smoke suite at the commit, the full rows D1790/D1791/D1792/D984/D989/D980/
D1290, `notes-marks.md` §1–§3, the six pictures, `pr-marks.mjs` (r5c), the design guide §2, §5, lessons 12/45/92,
`ui-contracts.md` §The pictures round's answers, the build plan's group 7. Ran `npx vitest run src/tracker/trk-round-seen.test.ts`:
9/9 pass. Ran the pure rule (`popPlace.js` at the commit, copied to my scratchpad) on extra inputs — figures quoted below.

**Tally: 1 Medium, 1 Medium-if-confirmed, 5 Low, 1 Note.**

---

## Findings

### F1 — Medium. A second click or tap during the slide lands on the moving chart: no window, another event's window, or a window left far below its event

**Setup / action / what he sees.** Desktop 1536×864, mouse. Find "ACG-09" (it lands at about y 435–505, notes §1(b)).
Click ACG-09, and click again at the same spot about 120–200 ms later (a double-click, or a second click because nothing
showed yet). The chart has started sliding ACG-09 up ~305px, the window is drawn unseen, and the second click lands on
whatever has slid under the pointer:
- empty chart → `clickAway` closes the pending window: the chart finishes its slide and **no window ever opens**;
- another ball → **that event's window opens** (the wrong event);
- ACG-09 itself, partway up → `Pop`'s effect re-runs for the new `pop` object, measures mid-slide, finds the window now
  fits (`placePop` → `'below'`), **shows it at once**, and the first smooth scroll carries on ~100–200px: ACG-09 ends 22px
  under the bar and the window sits ~100–200px below it, beside other events.
On a phone: Find ACG-09, tap it, tap again within ~0.3s (impatience — nothing shows during the slide): same three outcomes.

**Cause.** `Pop.jsx` lines 109–127: during the slide the window is `visibility:hidden` (no feedback, takes no taps) while
the chart under the pointer moves; nothing holds input meanwhile. `App.jsx` `clickAway` closes the pending window on a
click on the chart; `ballTap` opens a new one. On a re-open, the effect's cleanup cancels only the rest-wait loop
(`cancelAnimationFrame(raf)`), never the smooth scroll still running, and the new run measures `room` and the ball
mid-flight; with no slide planned it calls `setPosn(plan)` immediately (line 104), so the window is placed against a
chart that is still moving. Before this change the window showed at once under the pointer, so a second click hit the
same ball and re-opened in place.

**Fix, step by step.**
1. `raptor-port/src/tracker/components/Pop.jsx`, the layout effect's slide path. After `setPosn(null); core.stopGlide(bd);`
   add a press-holder for the board, capturing, so a press on the moving chart reaches neither a ball nor `clickAway`:
   ```js
   /* while the chart slides the window is unseen: a press on the moving chart (a double-click, a second tap) would land
      on whatever has slid under it — held until the window shows (D1790) */
   const hold = ev => { ev.stopPropagation(); ev.preventDefault(); };
   bd.addEventListener('click', hold, true);
   const release = () => bd.removeEventListener('click', hold, true);
   ```
2. Change `settle` to `const settle = () => { release(); setPosn(placePop(geo(0))); };` and the reduced-motion early return
   to call `settle()` as now (it releases at once).
3. Change the cleanup to `return () => { if (raf) cancelAnimationFrame(raf); release(); };`.
4. Guard the remaining re-open path (a keyboard Enter mid-slide — see F2's fix too): keep `const sliding = useRef(false)`
   on the component; set `sliding.current = true` where the smooth scroll starts and `false` in `settle`. At the top of the
   effect, before any measuring: `if (sliding.current && bd) { bd.scrollTo({ top: bd.scrollTop, behavior: 'instant' }); sliding.current = false; }`
   so the new plan is made against a chart at rest.
5. Pin it in `scripts/tracker/smoke.mjs`: land ACG-09 by Find; `page.mouse.click(x, y)` on its centre; `waitForTimeout(150)`;
   `page.mouse.click(x, y)` again (not Playwright's `dblclick`, whose two clicks come before any frame); wait for `#pop`
   visible (3s); assert the window is open on ACG-09 (`#popTitle` starts "ACG-09") and `pop.top − ball.bottom` is 0–8.
   It fails on the commit (no window, or a gap of ~100px+).

### F2 — Low. Keys pressed during the slide go to the chart, not to the window Enter opened

**Setup / action.** Desktop: Find ACG-09 (the keyboard's place follows the landing — `scrollToEvent` sets `kbdId`), Tab to
the chart, press Enter, then within ~0.3s press ↓ (meaning to step down the grades). **Sees:** the blue ring jumps to the
event below ACG-09; the window then opens on ACG-09 and takes the keys; ↓ never reached the grades; and on Escape the keys
return to the other event, not the one marked (D980: "Escape returns to the same event"). A second quick Enter re-opens
the window mid-slide (F1's re-measure path).

**Cause.** Reading 2: the window waits unseen for the slide, and `Pop.jsx` (lines 134–140) focuses a grade only once
`placed`. Until then the focus is still on `#board`, whose keydown runs `chartKey`; `chartKey` (core.js ~4056) checks
`windowUp()`, which does not count a pending marking window.

**Fix.** `raptor-port/src/tracker/app/core.js`, `chartKey`, right after `if (windowUp()) return false;`:
```js
/* the marking window Enter opened is on its way (it waits, unseen, while the chart slides — D1790): its keys are its
   own, never the chart's behind it (D980) */
if (pop && popByKey) { e.preventDefault(); return true; }
```
Once placed, the focus is inside the window, so this only bites while it is pending. Pin: the keyboard browser check
named under F5.

### F3 — Low. Closing a keyboard-opened window that slid nudges the chart 5–6px — it does not stay where it slid

**Setup / action.** Desktop 1536×864: Find ACG-09, Tab to the chart, Enter (the chart slides ACG-09's top to 22px under
the Tracker bar and the window opens), then Escape — or Enter on DCO, or Enter on Close. **Sees:** the chart snaps ~5–6px
down as the window closes. D1790: "stays there after Close".

**Cause.** The slide parks the ball's top at `POP_TOP_ROOM` = 22px under the chart box's top (`popPlace.js`). Every
keyboard close goes `closePop` → `kbdBack` → `bd.focus()`; the board's `focus` listener (core.js ~3957) sees
`:focus-visible` and calls `kbdKeepInView()`, whose margin is 28px (`m = 28`): `r.top < b.top + 28` → `scrollTop -= 6`.
Before this change the event was never left within 28px of the top, so the call did nothing. A mouse or finger Close does
not move it (no focus-visible).

**Fix.** Do not change the 22 (it is the drawing's, D1495). In `core.js`:
1. `function kbdKeepInView(m = 28) { … }` (use the parameter where `m = 28` is now declared).
2. Add `let kbdReturning = false;` beside `kbdShown`; in `kbdBack`, wrap the focus:
   `kbdReturning = true; try { bd.focus({ preventScroll: true }); } catch (_) { bd.focus(); } finally { kbdReturning = false; }`.
3. In the board's `focus` listener, `if (fv) kbdKeepInView(kbdReturning ? 0 : 28);` — a return only brings the event back
   if it is actually out of the box (e.g. the chart was wheeled away while the window was up), never a nudge.
Pin: desktop, the steps above; read `#board` scrollTop with the window open, press Escape, wait 300ms: equal, and the
focus on `#board`.

### F4 — Medium if the host's measurement confirms, else Low. On a phone on its side the window can run off the screen's foot — the w3-F3 fix ("held on screen") is no longer guaranteed

**Cause (certain, in the pure rule).** `popPlace.js` case 4 (`'short'`): `maxH: Math.max(POP_MIN, foot - y)`. Whenever less
than 120px is left under the slid event, the window is given 120px anyway and its foot goes past `innerHeight − 8`. The old
code clamped `y` so the window was always on screen (`y = Math.max(8, Math.min(y, innerHeight - 8 - h))`), which is what
[HUMAN-RETEST] w3-F3 fixed; Pop.jsx's own comment still claims it ("it is held on screen").
Run on the rule at the commit (ball 63 tall — a phone on its side fits the chart at zoom 1, `fitPhoneWidth`, so the ball
with its gold ring is ~60–63px, ~73 with Find's ring; the unit test uses the portrait's 29px):
- vh 390, chart-box top 150 → on screen; top 170 → on screen; **top 195 → foot past the screen by 22px; top 210 → 37px**;
- vh 370 (an iPhone on its side in Safari with its bars) → top 170: 17px off; top 195: 42px off;
- vh 340 → off by 27–87px for tops 150–210.
The code comment of 23 Sep 26 says a phone on its side had 165px for the chart, i.e. a chart-box top near 190 on a
390-tall screen — inside the failing band. With the inner scroll at its end, the box's own lower part is off screen, so the
last part of the window's content (Edit details, at worst Failed on) can never be brought into view.

**Host to measure (browser).** Viewport 844×390 and 874×370, `hasTouch`, `isMobile`: Find ACG-09, tap its centre, wait for
`#pop` visible, read `#pop` `getBoundingClientRect().bottom` and `innerHeight`. Expected (w3-F3): bottom ≤ innerHeight − 8.
Predicted failing whenever `innerHeight − 8 − (chart-box top + 22 + ball height + 4)` < 120.

**Fix.** `raptor-port/src/tracker/app/popPlace.js`, case 4, replace the last two lines with:
```js
const y = below - can;
if (foot - y >= POP_MIN) return { slide: can, x, y, maxH: foot - y, how: 'short' };
/* not even POP_MIN left under the event: held on screen all the same ([HUMAN-RETEST] w3-F3), lifted only as far as
   POP_MIN needs and never above the chart box */
const yy = Math.max(ceil, foot - POP_MIN);
return { slide: can, x, y: yy, maxH: foot - yy, how: 'short' };
```
(That lifted window covers part of the event on a screen too short for anything else — the trade the old w3-F3 fix made
the other way, covering the bars. If he prefers the event kept clear, use a smaller floor such as 80 under the event; either
way `y + maxH` never passes `foot`.) Then make the unit test real: the side phone's measured chart-box top and a 60–73px
ball, and assert `p.y + p.maxH <= vh - POP_EDGE` across tops 150–220 and balls 29–73; and add the browser pin above.

### F5 — Low. The pins: one cannot fail, one cannot see a detached window, and the promise's other halves are unpinned

- **The pick pin passes with the deliberate close undone.** `smoke.mjs` "phone: a pick from Find's list puts Find away"
  — the strip also closes by the old accident (the `away` mousedown listener on `document` sees the removed row as outside),
  as `notes-marks.md` §2(b) and the builder's own comment say. Removing `setOpen(false)` from `pick` leaves it green.
  **Fix:** before `row.tap()`, add
  `await pp.evaluate(() => document.body.addEventListener('mousedown', e => e.stopPropagation(), { once: true }))` —
  React's root listener (inside `body`) still runs `pick`, but the `document` listener never hears it, so only the
  deliberate close can pass. (§2(g) also asked for a pin in `tracker.test.tsx`; none was added.)
- **The slide pin does not bound the gap.** It asserts `g1.pop.t >= g1.ball.b`, which a window left 200px below its
  event (F1) passes. **Fix:** add `g1.pop.t - g1.ball.b <= 8` (reading 3's 4px under the event's edge).
- **Unpinned halves of D1790** (each with a concrete fault above or a ruling clause): the desktop ("on a phone and a
  desktop" — no check that the window opens whole under the event and clear of the Tracker bar at 1536×864); the keyboard
  open with a slide (notes §1(g): "work the same for a window opened by keyboard (D980)" — focus on the grade once placed,
  Escape returning with the view unchanged: F2, F3); the side phone (F4); B at a chart's end on a desktop (the bottom rows:
  the rule returns `'above'`, y 112, 299 of 429 shown, for the last row at 1536×864 — no browser check that it sits
  between the bar and the event).

### F6 — Low (rare). A keyboard Enter right after a finger glide cuts the slide short, and the window falls back to B

**Setup.** An iPad (or touch laptop) with a keyboard: flick the chart, and while it still glides (within 150ms of its last
scroll) press Enter on the ringed event. **Sees:** the chart starts its slide and stops after two frames; ~150ms later the
window opens from where it stopped — under the tabs only partly, or between the tabs and the event, scrolling (B) — though
the chart had room for A.

**Cause.** `chartKey` → `kbdKeepInView` → `stopGlide` engages `dragScroll`'s two-frame trick (`overflow:hidden`, then
`back()` re-writes `scrollTop` two frames later). Pop's `scrollTo({behavior:'smooth'})` starts inside those two frames, and
`back()`'s instant `scrollTop` write aborts it (any new scroll aborts a smooth one). Pop's own `stopGlide` call is then a
no-op (`stopping` is already true), so nothing waits.

**Fix.** `core.js` `dragScroll`: expose the trick's state — beside `el.__glideStop = …` add `el.__glideBusy = () => stopping;`.
`Pop.jsx`, slide path: after `core.stopGlide(bd)`, wrap the start of the slide in a function `go()` (compute `target`,
call `bd.scrollTo`, start `tick`), and run it at once unless `bd.__glideBusy && bd.__glideBusy()`, in which case
`raf = requestAnimationFrame(() => { raf = requestAnimationFrame(go); });` (the trick's two frames); the cleanup already
cancels `raf`.

### F7 — Low. Find's ✕ changed what it does, but a screen reader still names it "✕"

**Setup.** VoiceOver on his iPhone, Find open: the ✕ is read as "✕" / "multiplication sign", not "Clear the search and
close Find". **Cause.** `Header.jsx` gives the new words only as `title`; a button with text content takes its spoken name
from the text, so the title is at most a description. The design guide §2: "A control drawn from a picture or a glyph has
a spoken name that says what it DOES" (new work must). Pre-existing for the old words, but D1791 is new work on this
button. **Fix.** On `#hSearchClear` add `aria-label={strip ? 'Clear the search and close Find' : 'Clear the search'}`
beside the `title` (nothing he sees changes).

### F8 — Note. Two messages still send him to "↺ Restore in ⇅ Reorder"

The button now wears the drawn Reset arrow, but the Delete course question (core.js ~5893: "Its students and marks are
kept: ↺ Restore in ⇅ Reorder courses brings it back in this browser.") and the Import summary (core.js ~7278: "(↺ Restore
in ⇅ Reorder brings it back)") still name it by the typed ↺ (and the ⇅ the Reorder item lost in D1135). Not a breach of
D1792 (c), whose subject is the button; a leftover of "one thing, one mark". Changing words on screen goes to him first
(D1625): file it with [UI-CONSISTENCY-LOOK] round 6 beside the ⠿ ▲ ▼ the notes already list, suggesting "Restore in
Reorder courses brings it back" (the Delete syllabus button's hover words already read "can be restored from Reorder").

---

## The builder's readings

1. **Supported.** The page's A says "slides the event up under the tabs … only as far as needed (here 232 px)", and the
   drawing shows ACG-09 at 187–216 under tabs ending at 165 — a destination, not the least slide (15px would leave it
   mid-screen). Consequence to know: on a desktop the slide is to just under the bar even where far less was needed (the
   rule slides 470px for an event whose window needed 235) — the page's "on a desktop the same".
2. **Supported** by the ruling's order (the chart slides, then "the window opens whole below it") and notes §1(g) ("follow
   the slide — the window is fixed to the tap's place", met by placing it from where the event landed). Its cost is F1 and
   F2: for 0.2–1s nothing shows and input acts on the moving chart.
3. **Supported** — notes §1(g): "open it under the ball's edge".
4. **Supported** — notes §2(b)/(d): "where Find is the strip … any screen up to 1050 wide (a phone, an iPad, a narrow
   window)".
5. **Supported** — design guide §2 (the keyboard goes back to the button that opened it); the tap half matches Escape. Side
   note: Escape from the keyboard itself still leaves the keys nowhere (pre-existing, a gap for the keyboard sweep).
6. **Supported in intent** (w3-F3, the bars and the event kept in view; never drawn — notes "Could not picture: a phone held
   sideways"), **not met in full**: F4.

## Explicit negatives — what I checked and found nothing

- **Never over the bars or tabs:** every branch of `placePop` returns `y ≥ chart-box top + 4` (checked algebraically:
  'below' ≥ ceil; 'slide' and 'short' ≥ top + ball height + 26; 'above' whole fits inside `aboveRoom`; 'above' scroll = ceil).
- **Never over the event once placed:** `settle` re-plans from where the event really landed (`geo(0)`), so a slide cut
  short still yields a window under or above it, never on it — except the deliberate lift F4's fix proposes.
- **Every way the window opens:** only `ballTap` → `openPop` (a click/tap on a ball, or `chartKey`'s Enter/Space). Find's
  pick and Enter, a crew pick (`setActive` closes it), the Info half's event chips (`showEvent`), Show All and Details mode
  open no marking window; Edit chart layout wires balls to its own tools (`wireBoard`), so no slide can run there.
- **Close during the slide** (Escape, a tap outside the chart): the cleanup cancels the wait, nothing shows later, the chart
  finishes its slide and stays (as D1790 says). A grade after the slide: `redrawKeepView` keeps the scroll — stays.
- **Reduced motion:** a jump and an immediate placement; `.board` has no CSS `scroll-behavior`, so the jump is instant.
- **WebKit's missing `scrollend`:** not relied on — a frame poll ends at the target, after 150ms still, or at 1s; a browser
  without smooth scrolling reaches the target at once.
- **The unseen phase:** `visibility:hidden` takes no taps; `position:fixed` adds no page overflow; the keyboard focus waits
  for placement (D980), and the board's blur listener keeps the ring.
- **Re-open on another event while one is placed:** no flash — the layout effect re-renders before paint; the height is read
  through `scrollHeight` while the old `maxHeight` still clips.
- **A desktop with the window too tall for the room under the event:** slides; the chart's last rows fall back to B (as
  ruled). jsdom tests (zero-size boxes) take the 'below' branch, so the existing keyboard tests are untouched.
- **A pinch, a resize or a turn mid-slide:** placement waits for 150ms of stillness (or 1s); after placement the window does
  not follow later moves — as before this change.
- **D984 and D989:** `scrollToEvent` untouched; the slide calls `stopGlide` first (but see F6).
- **Find's ✕:** desktop unchanged (live media query; empties, keeps the keyboard in the box, "Clear the search"); on the
  strip it empties, closes and blurs; from the keyboard it focuses 🔍, which stays drawn while the strip is open
  (`#hSearchBtn{display:inline-flex}` in the 1050 block), so the focus lands; with the list open the blur hides the list
  first with no shift under the ✕; with the box already empty it still closes; resized across 1050 while open, the words and
  the behaviour follow the live width.
- **A pick:** mouse and finger go through the row's `onMouseDown` and now close on purpose; the keyboard has no pick —
  Enter walks to the next match and the strip stays, as the page's §2(b) recorded and his A kept.
- **Restore:** one line draws both the Course and Syllabus windows' button; the arrow is `aria-hidden`, the word names it;
  15px with `vertical-align:-3px` as drawn (the drawing's 1px right margin is absent — under the 2px tolerance). No other
  typed ↺ on a Tracker button; only F8's two messages.
- **Stored data:** nothing the change touches is saved; no persistence path changed.

## Seen in passing (not findings)

- Find's ✕ and Escape clear with a redraw that parks the chart at its start (`renderBoard`), so "finishing" a Find loses
  the place the find landed. The approved drawing `q-trkfind-ph-A-drawn.png` shows the chart at ST-01, so it is as drawn;
  worth asking him in D672's spirit.
- Lesson 45 asks that what a tap picked be marked on the thing itself while its window is open; a tapped event wears no
  mark (only the keyboard's ring) — pre-existing, outside D1790.
- Lesson 12 (no one-frame jump as the keyboard closes): the ✕ hides the strip and drops the keyboard in the same moment;
  only his iPhone can show whether anything stutters.

## Tidiness note (filed, not fixed — D489)

1. **Duplicated:** the ball finder `[...document.querySelectorAll('#flowSvg .ball')].find(…)` is now in `Pop.jsx` as well as
   `core.js` (`kbdBall`, `scrollToEvent`) — one exported finder would do; the 1050 breakpoint now lives in three places
   (`tracker.css`, `core.js` `PHONE`, `Header.jsx` `STRIP_Q`); `clearX` reads `isStripNow()` while `strip` holds the same fact.
2. **Unused:** the plan's `how` is read only by the unit tests; `settle` carries `slide` along unused.
3. **Named for what it was:** Pop.jsx's comment says the side phone's window "is held on screen" (F4); the unit test "a
   phone on its side (390 tall)" uses the portrait's figures (a 29px ball, top 150); the smoke comment "Find's landing
   scrolls the chart smoothly" — `scrollToEvent` writes the scroll at once (the wait is harmless).
