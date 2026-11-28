# The walk — the passing note's box, and the Scheduler Board's held sections (chat 170's helper, 25 Nov 26)

You are the walker, a fresh Opus helper. You drive the BUILT app in a real browser, take pictures, and report what the
screen said. You do not read the app's code for bugs and you do not fix anything. The host (the builder) opens your
pictures and reproduces every finding before it counts.

## Where, and with what

- Work in `C:/Users/User/projects/Raptor-words` (branch `claude/r4-walk-faults-170` — do not switch it, commit, push or
  edit any file under `raptor-port/src`). Start every shell command with `cd "C:/Users/User/projects/Raptor-words/raptor-port"`.
- Two frozen builds, served inside the test browser with no port (the round-4 tooling,
  `scripts/handpass/wr4-lib.mjs` — read its head and its exports first; its `newPage(size, state, dir, engine)` takes
  `'phone'` (402×874 with touch) or `'desk'` (1440×900), and `'webkit'` as the engine):
  - **AFTER** — this branch: `D:/rw4/night3/build-fix2` (its bundle is named in `D:/rw4/night3/build-fix2.txt`).
  - **BEFORE** — `main`: `D:/rw4/build-new3`.
  Every case's first log line names the bundle its page really ran (`bundleOf`).
- Write your scripts as `scripts/handpass/r4wf-*.mjs` (each line an assertion of the RIGHT behaviour, so a re-run is the
  re-walk), importing `./wr4-lib.mjs`; run each with `WR4_OUT=docs/img/handpass/2026-11-25-r4-walk-faults/<run>
  WR4_NEW=<build>`. Read `docs/walk-scripts.md` before writing the first one. Pictures go only under
  `docs/img/handpass/2026-11-25-r4-walk-faults/`. Do not take the checks lock — a walk on a frozen build needs none.
- Signing in: `ad` / `a` (the scheduler, an admin), `us` / `us` (a member, Ranger). `fileInput`, `editInput`,
  `recOf`, `openBell`, `catchToast`, `shownToast`, `shot`, `boxOf` are in the library.
- **Run every scenario on BEFORE first, then AFTER**, into separate run folders (`<id>-main`, `<id>-fix`). The BEFORE run
  shows the fault (or that a line was the same on `main`); the AFTER run is judged.
- On a phone: a picture right after each tap (within about 100ms of the lift) as well as the settled one (D1281). For
  each WebKit step that needs the caret to stay in a box through a tap on a button, check `document.activeElement`
  after the tap: if the browser moved the focus, write "could not be made here", never PASS.
- Watch console errors and page errors; list them.
- Before the first push of a picture folder — there is none: you do not commit. Leave the pictures and scripts in the
  working tree; the host commits them.

## The two changes, in a person's words

1. **The passing note** — the box at the foot of the screen (the top on a phone while a window is up) that says what a
   press did. Sixty letters with no space typed into a time box raise "<what was typed> is not a time. Try 0900 or
   09:00."; on a phone the letters ran about 10px past the note's border. Now a word too long for the box is broken
   inside it. No ordinary note should look any different.
2. **The Scheduler Board while he types** — with the Board open, an accepted input's start changed in its own box
   under Personal Inputs (0900, Tab) saved, but the Board's own Ground Programme row for it kept the old time until the
   caret left the Board, and after a second change showed the first. Now every section of the Board's day except the
   one he is typing in shows what is saved at once; the section he is typing in is never redrawn under him, and catches
   up the moment the caret leaves it.

## The scenarios (Astra's and a fresh, blind Fable's lists, combined by the host; in order of likely failure)

An EXPECTED line's source is in brackets. "RECORD" means: write exactly what the screen shows, on both builds; the host
judges. A blind designer's line with no source has been turned into RECORD.

### The Board

**W1 — The plain-user round of an input's two rows (Fable B5, Astra S06).** Desktop Chromium, then the phone in WebKit.
Scheduler. Edit Schedule, Wed 15 Jul 2026, Board open on it (the week's day header, or `window.openScheduler(di)`
only to reach the day — say which). Ground Programme → "+ Inputs": Training, one man (Ranger), 08:00–10:00, title
"Range brief" (or `fileInput`, saying so). Open Personal Inputs. A picture after each step, the Ground Programme row and
the Personal Inputs row both in it:
(1) Personal Inputs start: 0900, Tab. (2) start again: 0800, Tab. (3) end: 1130, Tab. (4) remarks: "bring kit", Tab.
(5) the Ground Programme row of the same input, START: 0830, Tab. (6) ✓ Done / ✕ close; the week's two rows for the
day. (7) reopen the Board. (8) Inputs page: the input on its date, and its window. (9) the bell as the scheduler, and
signed in as `us`. (10) reload; look again.
EXPECTED: after each of 1–4 the Board's Ground Programme row reads what was just saved, at once, the caret still on the
Board [the fault, `OUTSTANDING.md` [UI-SLEEK-PASS] round 4's leftovers (4)]; after 5 the Personal Inputs row reads 08:30
at once [D739: a time typed on an input's row changes the input itself]; the box holding the caret is the same box,
its text and caret as left, and Tab goes start → end → remarks → the next open box [D554, D555]; 6–10 every place reads
08:30–11:30 "bring kit" [the saved input]; the bell's lines and the change history: RECORD, beside `main`'s.

**W2 — The other rows an input stands on (Fable B6, Astra S05, S11).** Desktop Chromium; (c) also on the phone. A
picture after each Tab.
(a) A shared input (Ranger and Hex): its end under Personal Inputs, Tab → the one Ground Programme row reads it at once,
both men still on it [D661, D739].
(b) An input for ALL AVAIL (and one for ALL): its start under Personal Inputs, Tab → its row under the COMMON PROGRAMME
reads it at once and keeps its time order there [D955].
(c) Unavailable: a leave 08:00–17:00 for a man seated on a flying line that day; type its end 0900 in the Unavailable
row, Tab → at once his puck's ring on the flying line, his place in Available crew, the warning list and its count
[D509; `docs/ui-contracts.md` "the warnings are current while he types on"]; his own Unavailable row may wait.
(d) Personal Inputs FOLDED (its default on a phone), the caret in a Ground Programme row of a request: START, Tab → the
folded heading keeps its count; open the heading → the row there reads the new time.
(e) "abc" typed in the input's start under Personal Inputs, Tab → the amber note, the box back to the stored time, the
Ground Programme row unchanged [as on `main`].

**W3 — One man's row of a shared Unavailable input, edited twice (Astra S01).** Phone WebKit and desktop. File a timed
Unavailable input for Ranger and Hex, 08:00–10:00; open Unavailable on the Board. On Ranger's row: start 0900, Tab; end
1100, Tab; remarks "own hours", Tab. Look at both men's rows and their input windows. Undo and Redo each step (the
Board's own Undo / Redo buttons).
EXPECTED: Ranger's first change gives him an input of his own and the next changes reach that same input; Hex keeps
08:00–10:00 and his remark [`docs/ui-contracts.md` own-part contract — the input of several on the Unavailable list,
D737]; every section other than the one being typed in reads the saved times at once. RECORD what Undo / Redo show.

**W4 — OIL Earn pressed while the caret is in a box (Fable B1, Astra S02).** Phone WebKit (a tap that keeps the caret),
then desktop. A Saturday or Sunday with EXACTLY TWO flying waves (add or remove one through the Board's own controls),
an accepted input on its Ground Programme, Personal Inputs open. Tap the input's start box (keyboard up), then — without
closing it — tap "OIL Earn" on the day bar. Pictures. Repeat with the caret in a Ground Programme box, a Duties box, a
flying line's callsign. Then close the keyboard / click blank space.
EXPECTED: every section appears once, in the day's order, never a mix of OIL Earn and the editable day [the change's
promise]; once the caret has left, the whole day in OIL Earn. RECORD the one-wave and three-wave days the same way.

**W5 — Undo and Redo with the caret in a box (Fable B2, B7; Astra S04).** Phone WebKit and desktop.
(a) Drag Personal Inputs by its grip above Ground Programme (decline "Set as default"); tap the input's start box,
nothing typed; tap the Board's Undo; picture; Redo; picture; close the keyboard; picture. EXPECTED: each section once,
in one order, at every picture; after the caret leaves, the order Undo / Redo left [the promise].
(b) Personal Inputs start 0800 → 0900, Tab (caret in End); type 1100 in End without leaving it; tap Undo; Undo again;
Redo twice; then leave the box. EXPECTED: the unfinished End is saved as its own step before Undo takes it back, the
next Undo takes back 0900 [`docs/ui-contracts.md` "Undo and Redo never run under a caret"]; the Ground Programme row
follows each step; once the caret has left, the Personal Inputs row shows what is stored [the D994 lesson].

**W6 — The caret moved to another section with nothing typed (Fable B3) — RECORD.** Desktop Chromium. A published
weekday; a man on Go 1; an input for him clear of the flight. Under Personal Inputs type a start that overlaps the
flight, Tab. Then click into a Duties time box and type nothing; picture after one second; Tab once more, typing
nothing; picture; click blank space; picture. RECORD when the Personal Inputs row catches up (its ring / mark / time).
(The host expects: only when the caret leaves every box or the next save — as `main` did for the whole Board.)

**W7 — Leaving the day with the caret in a box (Fable B4, Astra S09).** Phone WebKit, then desktop. Board on Tuesday
with an In-time line; Wednesday visibly different. Tap into the In-time line, type "0715 ALL" (do not leave it); tap
the › day arrow; picture; close the keyboard; picture; step back to Tuesday. Repeat with the caret in an AREA box, a
stores box, and a plain time box. Then the same with the Calendar to another week, and ✓ Done / reopen.
EXPECTED: the title and, once the caret has left, the whole day are Wednesday's — never Wednesday's sections beside
Tuesday's; "0715 ALL" is saved once, on Tuesday's line [board.ts's day change: a typed value goes to the day being
left]. RECORD what shows between the arrow and the keyboard closing, on both builds.

**W8 — The box he types in never moves (Fable B8, Astra S03).** Phone WebKit, phone layout; then the ⋯ menu's desktop
layout on the phone, pinched out. W2 (c)'s set-up with enough crew that Available crew gains or loses a line of pucks;
the Unavailable row mid-screen. Type the end, the keyboard's Tab / next. Measure the next box's top before and after.
Repeat making the list shrink; repeat with the day's first warning appearing.
EXPECTED: the box moves by no more than 1px on screen, the keyboard stays up, a half-typed value in the next box
survives a second save [the promise; `docs/ui-contracts.md` holdingPlace]. RECORD the page scrolled to its very foot.

**W9 — A row removed in another section while the caret is in a box (Fable B9) — RECORD.** Phone WebKit. Two accepted
inputs on the Ground Programme. Tap the remarks box of the LOWER one's Ground Programme row, type "xyz" (keyboard up),
tap "Reject" on the UPPER one under Personal Inputs; picture; close the keyboard; picture. EXPECTED (sourced part):
"xyz" ends on the row it was typed in, once, no other row gains it. RECORD the rest.

**W10 — A re-ordered day and the Tab route across sections (Fable B10, Astra S07, S08).** Desktop Chromium. Flying waves
dragged to the foot, Personal Inputs above Ground Programme. W1's steps 1–5; then Tab from the last box of one section
into the first of the next, typing a change in each; Shift+Tab back; Tab from the day's last open box.
EXPECTED: the right section updates, none drawn twice; Tab follows the order on screen, reaches only open boxes, and
after the last goes to the next button or stays [D551, D553, D555, D597].

**W11 — Frozen and read-only (Astra S10).** Desktop. A published day with a live change after it: open the earlier
version from the plans selector, back to live, type and Tab. As `us`, the View-only schedule. EXPECTED: no box takes
typing on the frozen look or for the member [as on `main`]; the live day resumes correctly.

### The note

**N1 — The long word at every door that raises it (Fable N1, Astra S13).** Phone 402×874 and 320 wide, Chromium AND
WebKit. Scheduler. Type `abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz01234567`, then Tab, in: (a) the week's
take-off box; (b) the Board's take-off box; (c) an input's start under Personal Inputs on the Board; (d) the same on
the week; (e) an Unavailable row's start; (f) a duty template's and a wave template's time box, if a box there takes
typing. (The input's own window has the browser's time picker, which cannot hold letters — not a door.)
EXPECTED: every letter inside the note's border on every line, the note 12px from each side on a phone [D828], amber,
at the foot, nothing off the screen; the box back to its stored time; on `main` the overrun shows [the fault]. Measure
each line's right edge against the note's inner edge (as `scripts/handpass/wr4-c-c6c7.mjs` `inkOf` does).

**N2 — No ordinary note moved (Fable N2, Astra S14).** Phone 402 (WebKit and Chromium) and desktop 1440, on BOTH builds:
raise and measure (box left, width, height, number of lines, colours) a plain note ("Input added"), an amber one, a red
one if a hard breach can be made, the grey "Blocked:" one (its sign, bold lead, quieter rest — D1668), a publish receipt
joined with " · ", a note with a window up on a phone (at the top — D731 (1)), and a note while "OIL not answered"
stands. EXPECTED: identical on both builds in every measure [the promise].

**N3 — Widths between a phone and a desktop (Fable N3, Astra S13).** 621, 768, 900 wide, and the phone on its side
(874×402, WebKit): the 60-letter note from the week's take-off box, both builds. EXPECTED: inside its border and on the
screen. RECORD its width and lines beside `main`'s (on `main` the box widened past half the window to hold the word;
now the word is broken there — the host expects that change).

**N4 — Where the note stands, over windows (Astra S15) — RECORD beside `main`.** Phone WebKit: the 60-letter note with an
input's window up, and with "OIL not answered" standing. EXPECTED: at the top / just above the bar, as on `main`.

## Also, the plain-user round (the order's §7.0a)

W1 is it for the Board's ground rows: every control that opens or closes something in it pressed (the input's window:
its Close, its ✕, Escape; the Board's ✓ Done and its ✕), every other place that should show the result looked at.

## Your report

Write it to `docs/handpass/parts/r4wf/walk-report.md` (make the folder): one line per scenario and build — PASS / FAIL /
RECORD / NOT WALKED (with why) — the picture names, the bundle each ran, errors seen. Under about 2,000 words. Then reply
to the host with one line saying it is written and how many FAIL.
