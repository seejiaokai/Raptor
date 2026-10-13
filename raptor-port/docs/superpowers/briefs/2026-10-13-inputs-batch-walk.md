# The walk of the Inputs / schedule batch — the walker's brief (13 Oct 26)

You are the walker. You DRIVE THE RUNNING APP in a real browser, as a person would, and report what the screen did.
You do not read the app's code to find bugs, you do not decide whether a finding is real (the host reproduces every
one), and you change no file of the app.

## What was built (in the app's own words)

1. **An input put back on the programme waits on its OIL question (owner D793).** A scheduler can take an input off the
   day's programme ("Undo" on its card under Personal Inputs, on the Scheduler Board and on Edit Schedule's week) and
   put it back ("Accept"). Where the input NEEDS an OIL answer and has none — its day is a weekend or a public holiday,
   and nobody answered — "Accept" now puts the OIL question FIRST and puts nothing back: a small sheet, its first line
   "Putting Ranger's Range brief back on the programme", its two buttons "Don't put back" and "Put back" (greyed until
   an answer is picked). Answered: the input is back on the programme with its answer, as one step (one Undo takes both
   away). Not answered ("Don't put back", the sheet's ✕, Escape, a press outside): nothing is put back, the input's card
   flashes, and a bar stays — "Not put back — OIL not answered", with "Answer OIL" (the question comes back) and "OK"
   (it only closes). Where nothing needs asking (a working day; an input already answered — a No is an answer) Accept
   puts it back at once, as before. Taking it off ("Undo") asks nothing. The app's own Undo of a take-off asks nothing.
2. **History's gold dot on the puck of a man put on an input's row.** With History on (the clock button on the Scheduler
   Board's bar / Edit Schedule's top bar), every detail with a history wears a small gold dot, and a hover (desktop) or
   tap (phone) on it raises a bubble telling what changed. A man ADDED to an input by dropping his puck on the input's
   row of the Ground Programme used to wear no dot; now his puck wears one and its bubble tells the line that put him in.
   A man who was simply filed with the input wears none.

## Read first

`raptor-port/docs/walk-scripts.md` §3 to §7 — how a walk script is written. Every line is a trap that cost a walk.

## The machine, and its traps

- **The build is already served: `http://localhost:4187/`.** Do NOT build, do NOT start or stop any server, do NOT run
  the app's tests. Drive that address with Playwright scripts of your own (`@playwright/test` is installed: import
  `chromium` from it and run your script with `node` from `raptor-port/`).
- **A script is written to a file with the file tool and run from there** — never passed inline to the shell. A
  rewrite and its run are two steps. Print a version line at the top of every run. Write scripts only in YOUR scratch
  folder (below), never under `raptor-port/src` or `raptor-port/e2e`.
- **Sign in:** `#luser` / `#lpass` / `#loginForm button[type=submit]`; admin is `ad` / `a` (Saber — a scheduler), a
  member is `us` / `us` (Ranger). `#vWeek .day` attached means the app is up. Pages: `window.go('inputs' |
  'editsched' | 'viewsched' | …)` or the app's own tabs.
- **A fresh browser context per scenario** (a new context is a clean world). A phone is `{ viewport: { width: 390,
  height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }` and is driven by `locator.tap()`; a desktop
  (1440 × 900) by `click()`.
- **The clock is left running.** The loaded week is 13–19 July 2026: Friday is `2026-07-17` (day 4), Saturday
  `2026-07-18` (day 5). Ranger's id is `bane`, Tally's `nick`, Saber's `stiff`.
- **WORKING RECIPES — copy from them, do not edit them:** `raptor-port/e2e/oilwait.spec.ts`. Its `fileIt()` files an
  input through the Inputs calendar's own window; its "a day made a holiday" test makes a Friday a public holiday by the
  Calendar window's own controls and leaves the list for later; its last test (D793) is the whole route of scenario 1 —
  file on Friday, make Friday a holiday, leave the list for later, open the Scheduler Board on Friday, take the input
  off, press Accept. (It imports the suite's helpers `login` and `go` from `e2e/app.ts` — in your own script sign in
  and change page as above.)
- **The names to press and read.** The take-off: on the Scheduler Board it is the ✕ at the end of the input's own row
  of the Ground Programme — `#sbBoard [data-grdel="<day>.<row>"]`, the row being the index in `window.DAYS[<day>].ground`
  of the row whose `src` is the input's iid; where a card carries an "Undo" button it is
  `[data-acc="x"][data-acck="<the input's iid>"]` — look for either and say which you found on each surface;
  **the board's Personal Inputs panel opens FOLDED** — open it by its header (`#schedBoard [data-pitog="<day>"]`; the
  recipe is `openInputs()` in `raptor-port/scripts/handpass/lib.mjs`: press only when the panel shows no rows);
  the put-back: `[data-acc="g"][data-acck="<iid>"]` ("Accept" — an input of kind Other shows "→ Ground" and "→ Unavail").
  The input's iid: `window.INPUTS.find(r => r.title === '<title>').iid`. The question: `[data-testid="oilconf"]`, its
  first line `oilconf-lead`, its buttons `oilconf-cancel` / `oilconf-save`, the answers `oil-yes` / `oil-no`. The bar:
  `oilbar`, `oilbar-text`, `oilbar-answer`, `oilbar-ok`. What is on the programme: `window.DAYS[4].ground` (a row that
  came from an input carries `src` = the iid). An input's answer: `window.INPUTS.find(…).oil` (an object by date; empty
  or absent = no answer). The app's Undo: the ↶ button in the top bar (`#undoBtn` if present — else find the button
  whose title begins "Undo"). History: `#sbHist` on the Scheduler Board's bar; a dotted cell carries the attribute
  `data-histdot`; the bubble is `.histbub` (find it by its text if that name is not there).
- **A drag** (scenario group 2) is made with the mouse: press on the puck, move a few pixels, move to the target in
  steps, one more pixel, release — as `oilwait.spec.ts`'s first test does. On a phone use the armed tap instead: tap a
  name in the crew list, then tap the row's "+ add".
- **Navigate by reading** the screen until it says what you want — never by a counted number of presses.
- **What a press opens is proved ON SCREEN before anything in it is pressed:** its box inside the screen, and the
  element at its centre is that thing (`document.elementFromPoint`).
- **Stop after three failed attempts at one gesture** and report it as it stands. A check whose own set-up could not
  act is **NOT WALKED**, never FAIL — say why.

## Judging

- A scenario with an **EXPECTED** line is **PASS** or **FAIL**, with the value you observed written beside it.
- A scenario marked **RECORD** has no expected answer: write down exactly what the screen did, in the app's words,
  with a picture. The host judges it.
- Anything else you notice that looks wrong on the way: a short line under "Seen in passing", with a picture.
- **Not a finding:** a problem that exists only in data already stored when the app is right going forward (the whole
  store is demo data, cleared before the database). If the app would do it again to NEW data, report it.

## The scenarios

**Group 1 — the put-back (each at the desktop AND the phone unless it says otherwise)**

| # | Do | EXPECTED / RECORD |
|---|---|---|
| 1 | The recipe's whole route: Training "Range brief" for Ranger, Friday 09:00–12:00; Friday made a public holiday, the list left for later; Scheduler Board, Friday; take the input off (the row's ✕, or its card's "Undo"); then "Accept" on its card under Personal Inputs. | EXPECTED: the sheet with "Putting Ranger's Range brief back on the programme", "Don't put back", "Put back" greyed; nothing on Friday's Ground Programme from the input; the sheet wholly inside the screen and on top. |
| 2 | From 1: pick Yes, press "Put back". | EXPECTED: the sheet and any bar gone; the input's row is on the Ground Programme again; its answer is `{ "2026-07-17": 0.5 }`; a note says it was added to the ground programme. |
| 3 | From 2: press the app's Undo ONCE. | EXPECTED: the row is off the programme again AND the answer is gone (one step took both). RECORD the Undo button's own words before pressing. |
| 4 | From 1 (fresh): "Don't put back". | EXPECTED: nothing on the programme; the bar "Not put back — OIL not answered" on top and inside the screen. RECORD whether the input's card flashes (a picture straight after). |
| 5 | From 4: "OK". Then "Accept" again → the sheet → press Escape (desktop) / tap outside the sheet (phone). | EXPECTED: OK closes the bar and changes nothing; the second time the bar is back with the same words and nothing is on the programme. |
| 6 | From 4 (fresh): "Answer OIL" → No → "Put back". | EXPECTED: back on the programme; the answer is `{ "2026-07-17": 0 }`. |
| 7 | The same route as 1 but answer the holiday's list with Yes for the input BEFORE taking it off; then "Undo", then "Accept". | EXPECTED: no question — it is back on the programme at once. |
| 8 | An input on a WORKING day (Wednesday 15 July, no holiday): "Undo" then "Accept". | EXPECTED: no question; back at once. |
| 9 | Route 1 to the taken-off state; then press the app's Undo (the take-off undone). | EXPECTED: the input is on the programme again; NO question and no bar. RECORD what its card shows (an "OIL?" tag?). |
| 10 | Route 1 to the bar (scenario 4); with the bar up, press the app's Undo until the take-off is undone (the input is on the programme again); then "Answer OIL" on the bar. | EXPECTED: no question; a note that the input has changed — "not put back"; nothing else changes. |
| 11 | Edit Schedule's WEEK (not the board), desktop: the same input's card under Friday's Personal Inputs — "Undo", then "Accept". | EXPECTED: the same question, over the week; "Put back" with Yes puts it back. |
| 12 | A shared input: Training "Range brief" for Ranger AND Tally on Friday; the holiday; later; the board; "Undo"; "Accept". | EXPECTED: the sheet's first line names "2 people's Range brief"; answered Yes, ONE row with both men is back, and the input has its one answer. RECORD the exact first line. |
| 13 | As Ranger (`us` / `us`, a member), View-only Sched and — if he can open it — Edit Schedule: is there any "Accept" or "Undo" on the card? | RECORD what he sees. EXPECTED: he cannot put it back (no button, or a refusal that says only a scheduler can). |
| 14 | Route 1 to the question on the PHONE turned on its side (844 × 390): are both of the sheet's buttons inside the sheet and the screen? Then "Don't put back": is the bar inside the screen? | EXPECTED: yes to both. |

**Group 2 — the gold dot (desktop: Scheduler Board AND Edit Schedule's week; phone: the board)**

| # | Do | EXPECTED / RECORD |
|---|---|---|
| 15 | Training "Range brief" for Ranger on Wednesday 15 July (a working day). Scheduler Board, Wednesday. Put Tally on the input's row (drag his puck from the crew list onto the row's "+ add"; phone: armed tap). Turn History on. | EXPECTED: Tally's puck on that row carries `data-histdot`; Ranger's does not. A picture with the dot in sight. |
| 16 | From 15: hover Tally's puck (desktop) / tap it (phone). | EXPECTED: a bubble whose words name Tally and "added". RECORD the bubble's whole text. |
| 17 | From 15: go to Edit Schedule's week (History still on). | EXPECTED: the same puck is dotted on the week too. |
| 18 | From 15: take Tally off the row again (right-click his puck / drag it off). | RECORD what is dotted now, and what the changes window lists. (No expected answer: a man taken out has no puck left to wear a dot.) |
| 19 | From 15: turn History off. | EXPECTED: no element carries `data-histdot`. |
| 20 | A plain programme row (no input) on the same day with a man put on it by the same drop: History on. | EXPECTED: his puck is dotted as it always was (a seat's own line). |

## Your output

- **Pictures:** `raptor-port/docs/img/handpass/2026-10-13-inputs-batch/w1/` — one per assertion that matters, taken
  AFTER the step, named `<scenario>-<size>-<what>.png`. Empty the folder at the start of a run that numbers them.
- **Scratch (scripts, logs):** `raptor-port/scripts/handpass/ib/w1/` — make it.
- **Your report:** `raptor-port/docs/handpass/parts/ib/w1.md` — a table: scenario · size · PASS / FAIL / RECORD / NOT
  WALKED · what the screen said (the observed values) · the picture. Then "Seen in passing". Then every console or page
  error met, and where. Then what you could not walk and why.
- Reply to the host with at most eight lines: the counts, and each FAIL in one line.
