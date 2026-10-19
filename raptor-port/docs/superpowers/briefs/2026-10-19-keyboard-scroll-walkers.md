# [KEYBOARD-SCROLL] with D1080 — the walkers' briefs (19 Oct 26)

Two Sonnet 5.5 walkers (D588), in parallel, on ONE served build: **http://localhost:4333/** (a frozen copy of the
branch's build; prove it before you start: the index page's script name must equal the one the host gives you). Read
`raptor-port/docs/walk-scripts.md` §3–§7 first. You change no app source file. Every script is written to a file with
the file tool and run from that file (never inline to the shell); a rewrite and its run are never in one step; every
script prints a version line first. Stop and report after 3 failed attempts at one gesture. Send your report ONCE,
after stopping every browser you started.

Sign in: `#luser` / `#lpass` / `#loginForm button[type=submit]`, admin `ad` / `a`, member `us` / `us`; the week is up when
`#vWeek .day` is attached. Pages: `page.evaluate(p => window.go(p), 'editsched' | 'inputs' | 'quals' | 'logic' |
'leavewar' | 'tracker' | 'admin')`. The Scheduler Board: `window.openScheduler(0)`. Use the repo's browser:
`existsSync(CH) ? { executablePath: CH } : {}` with `CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'`.
Scripts live in `raptor-port/scripts/handpass/kbs-<A|B>-*.mjs` and run from `raptor-port/`.

**Known traps in the drivers (the host met each one):**
- Admin's "Duty templates…" (`#admDutyTpl`) and "Wave templates…" (`#admWaveTpl`) sit in a folded section: press them by
  `page.evaluate(() => document.getElementById('admDutyTpl').click())`. Their windows close by `#tplClose` /
  `#waveTplClose` — Escape does NOT close them (an older gap, not this job's).
- The Duty templates' Standard times are only a faint placeholder (the box is empty): type a time first.
- The Wave templates window starts with no template: press its "+ New wave template" button first.
- The Logic page's boxes exist only in ✎ Edit: press `#lgEdit` first. A crew-rest value is typed with its unit ("11h");
  a bare "11" means minutes and is refused.
- Two taps at one spot closer together than about half a second are the browser's double tap, which SELECTS a word —
  wait 600ms between taps on the same box unless the step is about a second tap.
- The Leave War: its ⚙ is `[data-testid="settings-open"]`; "＋ Counter" is a button inside `[data-testid="settings-sheet"]`;
  the counter's numbers are `[data-testid="cform-amber"]`, `cform-red`, `s0-count`. A Required P cell is
  `[data-testid="req-p-<iso>"]` (on a phone it opens the app's own number pad, no keyboard).

## Walker A — the box being typed in shows above the keyboard (D1048), on a phone

**The stand-in keyboard.** Chromium cannot raise an iPhone keyboard. Before the app loads (`context.addInitScript`),
replace `window.visualViewport` by a stand-in with the same fields and events:
```js
class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
const f = new FakeVV(); Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f }); window.__vv = f
```
Keys up: `__vv.height = innerHeight - 336; __vv.dispatchEvent(new Event('resize'))`, then wait 300ms. Keys down:
`__vv.height = innerHeight` and the same event. The visible screen with the keys up is `0 … innerHeight - 336`.

**Size:** phone 402 × 874, `isMobile: true, hasTouch: true`, `deviceScaleFactor: 3`, dark; press by
`page.touchscreen.tap` at a point ON the box (never a scripted scroll-into-view just before the tap — the step itself
brings the box low, as below). Pictures to `raptor-port/docs/img/handpass/2026-10-19-keyboard-scroll/walk/A/`.
Report to `raptor-port/docs/handpass/parts/keyboard-scroll/A.md`.

**Each scenario:** bring the chosen box LOW on the screen with the surface's own scroll (so its bottom is below
`innerHeight - 336`); record its rect; tap it; picture "before"; keys up; picture "after"; record. **PASS when:** the box
has the focus; its bottom is at or above `innerHeight - 336 - 8` (+1px) and its top at or below the visible top + 8 (or
the box is taller than the room and its top is in sight); `document.elementFromPoint` at the box's centre is the box or
inside it (nothing covers it); the page behind a window or the board did not scroll (`document.scrollingElement.scrollTop`
unchanged) when the box is in a window, a sheet or the board. Then keys down: a window that was raised (its
`style.translate` was set) is back where it stood (`style.translate` empty, its rect as before) — record.

| # | Surface | The box |
|---|---|---|
| A1 | Scheduler Board (Edit Schedule → the board), phone | a remarks box of a flying line low in the board's panel |
| A2 | the same, the phone on its side (874 × 402, keys 200) | a time box low on screen |
| A3 | Edit Schedule's week, phone | a remarks cell (a typing cell) low on the day |
| A4 | the schedule's own input window (tap an input's row on the board's Personal Inputs) | its remarks box, then its time box |
| A5 | Inputs page — the calendar's opened day (tap a date) | the day's title box and a note's box |
| A6 | Inputs page — "+ Input" window | the remarks box, low in the window |
| A7 | SANS calendar (Inputs page's SANS tab) — "+ Commitment" window, and its ⚙ settings | the remarks box; the "Red from" number |
| A8 | Logic page (✎ Edit) | the LAST setting box on the page (the page scrolls itself); and the search box at the top (already in sight: must not move) |
| A9 | Admin → Duty templates | the last role's End time (the window's rows all fit: nothing in it scrolls — the window itself must rise, and go back down with the keys) |
| A10 | Admin → Wave templates (+ New wave template, + Add line ×3) | the last line's LD box |
| A11 | Admin → Users — the new person form | its lowest box |
| A12 | Quals page (Edit) | a cell low in the table |
| A13 | Leave War — ⚙ → ＋ Counter | the "Red below" number at the sheet's foot (the sheet moves itself for a keyboard too — both must end with the box in sight) |
| A14 | Leave War — the OIL tracker's add / credit box | its days box |
| A15 | Tracker tab | any box to type in low on screen (search, an event's box) |
| A16 | Help → report a problem | its text box |
| A17 | the sign-in page (sign out first) | the password box |

**Orders (each a scenario):**
- O1 keys already up, tap a SECOND box lower in the same window (A9's Start then End): it is brought up too.
- O2 with A9's window raised, tap a box near the window's TOP: the window comes back down towards where it stood, never
  below it.
- O3 with a window raised, tap blank space (the focus goes nowhere): the window goes back where it stood.
- O4 a box tapped, then 3 seconds later a resize (the keys' height changes to 300): nothing moves (only a resize within
  about 1.5s of the focus counts).
- O5 the desktop (1440 × 900, no stand-in shrink): focus A1's box and A8's last box by a click: nothing scrolls.
- O6 pinch zoom: set the stand-in's `scale = 2` with the keys up: nothing moves.

**Break tests (one per wired surface — say what you broke and that the step went red):** in a browser console step,
not in the source: (a) remove the stand-in's resize event (keys up without dispatching): A1's box must stay covered —
proves the event is what drives it; (b) on A9, set the window's `style.translate = ''` after the lift: the box is
covered again — proves the raise is what shows it.

## Walker B — one tap then typing replaces, in four more places (D1080)

**Sizes:** desktop 1440 × 900 by MOUSE (`page.mouse.click` at the box's centre); phone 402 × 874 by FINGER
(`page.touchscreen.tap`), `isMobile: true, hasTouch: true`. Pictures to
`raptor-port/docs/img/handpass/2026-10-19-keyboard-scroll/walk/B/`. Report to
`raptor-port/docs/handpass/parts/keyboard-scroll/B.md`.

**Each box, at both sizes:** (1) one press, then type → the box holds ONLY what was typed (EXPECTED below); (2) leave the
box (Tab or a press elsewhere) → the screen's own save/normalise runs and shows the new value; reopen the window or
reload where the screen keeps it, and it is still there; (3) wait 600ms, press once, then press AGAIN (second press),
then type one digit → the digit is ADDED at the caret, nothing replaced; (4) one press, then Backspace → the box is
empty; (5) Tab INTO the box from the box before it, then type → added to (a Tab arms nothing).

| # | Place | Box | EXPECTED after one press + typing |
|---|---|---|---|
| B1 | Admin → Duty templates (type a start of 0700 first) | a Start time | "0800" → "0800", shown 08:00 on leaving |
| B2 | Admin → Wave templates (+ New wave template) — type a T/O 0900 first | the T/O box | "1000" → "1000", 10:00 on leaving |
| B3 | Leave War ⚙ → ＋ Counter | Amber below, Red below, Slot 1's count | "3" → "3" (not "03" / "30") |
| B4 | Leave War — Manning's thresholds (the Manning button's sheet) | Amber below / Red below | "2" → "2" |
| B5 | Leave War — OIL tracker: a credit's days box, a bid sheet's OIL days (an admin, a weekend day) | the days box (type "2" over "1") | "2" |
| B6 | Inputs page's ⚙ (the late cut-off) | Days before the week starts (14) | "10" → "10"; the line under it says the new date |
| B7 | SANS calendar's ⚙ | Yellow / Amber / Red from | "2" → "2"; Save keeps it |
| B8 | Logic page ✎ Edit | Crew rest (12h), Days in a row, Brief before take-off | "11h" → "11h"; saved (still 11h after leaving and coming back to the page) |
| B9 | Logic page ✎ Edit | the "+ In-time" WORDS setting (a words box) | NOT replaced: typing adds where the caret is |
| B10 | Leave War — a Required P cell (phone: its pad) | — | the first pad digit replaces (unchanged, already so) |
| B11 | the Scheduler Board — a take-off box that holds a time (D1047, regression) | — | "1000" replaces |
| B12 | a member (`us` / `us`) on the Logic page and the Leave War | — | no ✎ Edit / no counter tools: nothing to arm (record what he sees) |

**Break tests:** (a) remove the box's class in a console step (e.g. `sset-num`) before pressing: typing adds again —
proves the list is what arms it; (b) on B8 type through the box's own value setter only (no press): nothing replaces.
