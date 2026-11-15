# Job 3 — the walk of the Leave War's double-tap guard on six more windows: the walker's brief (chat 81, 15 Nov 26)

You WALK the running app as a person would and report what you SEE. You do not read code for bugs, you do not fix
anything, you do not decide whether a finding is real — you record it exactly, with its picture and how to repeat it.

**The checkout:** `C:/Users/User/projects/Raptor`, branch `claude/lw-doubletap-more`, last code commit `a9d6937a0`.
`raptor-port/dist` is ALREADY BUILT from it — do not build, do not run `npm test` or any Playwright test file (they
rebuild `dist`). Never switch branch, commit, push or stash. The only files you may write inside the checkout are
pictures under `raptor-port/docs/img/handpass/2026-11-15-lw-doubletap-more/` (make it; one sub-folder per run; if a run
fails, use a new folder name and say which are the citable ones). Delete nothing, anywhere. Your scripts and their
output go in `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/6e376de7-ce28-4b0e-ad14-7848f71c5f9a/scratchpad/job3/walk/`
(make it). A multi-line script goes in a file you write, never a heredoc or `node -e`.

## Read first
1. `raptor-port/docs/walk-scripts.md` — how a walk script is written here and what each trap has cost. Follow it.
2. `raptor-port/CLAUDE.md` §Build & verify (signing in: `ad`/`a` is the admin, `us`/`us` a member; the login boxes;
   the browser fallback line every new Playwright script copies from `playwright.config.ts`).
3. `raptor-port/e2e/doubletap-more-leavewar.spec.ts` (this job's browser test) and `raptor-port/e2e/doubletap-leavewar.spec.ts`
   (the older one) — for how to reach each Leave War window and how a double tap is made by real touch. Do not run them.

## Stand it up
Check port 4392 is free (`Get-NetTCPConnection -LocalPort 4392` in PowerShell must find nothing; if held, use 4393),
then from `raptor-port` (cd by its FULL path): `npx vite preview --port 4392 --strictPort` in the background, output to
a file (its "ready" line holds colour codes — wait by trying the address, not by matching the text). Drive
`http://localhost:4392/`. Stop it BY ITS PORT when you finish. A fresh browser context per scenario. Watch console
errors, page errors and failed requests in every script and report any.

**Sizes and browsers:** a phone 402×874, touch on, device scale 3, in Chromium (real touch: `hasTouch: true`, taps
through the touchscreen or CDP touch points — never a mouse on the phone) and again in WebKit at the same size where
marked WK (if WebKit is not installed, say so; install nothing); a tablet 820×1180 by touch where marked; a desktop
1536×864 by mouse where marked.

## What changed
On a phone, when a Leave War window closes by a tap, a fast second tap in the same place used to be able to land on
the grid behind and open a day (its bid window, or the day panel from the pinned dates). A guard swallows that second
tap: within about 600 ms of the close and within about 32px of the first tap. It already covered the one-day and drag
windows and eight more. This job extends it to six more:
- the Required rows' selection panel (✕, Apply, Clear), their rename form (✕, Save, Cancel), and the phone's number
  pad (Done) — reached by tapping, or long-pressing and dragging across, Required P / Required W cells in the Manning
  block;
- the day panel (opened by a tap on a date in the pinned dates row): its ✕; its ‹ › should simply step the day;
- the under-manned days list (from the Manning chip / count): a row tapped takes the grid to that day and closes the
  list;
- the move banners (after "⇄ Move" on a record, or on an event): Confirm and Cancel;
- New period (the last line of the period list, admin): ✕ and Create;
- Open for bidding (admin, from the grid's bar) on a tablet or desktop; on a phone it fills the screen.
Also new: presses inside the day panel, the number pad, the under-manned list and the move banners now count as
"inside a window". Nothing a person sees is meant to change.

## The scenarios — for each: PASS / FAIL / OBSERVED / NOT RUN, what opened, the picture
On the phone, picture the screen within about 100 ms of the second tap's lift and again once settled.

**M1 — each window × each way it closes by a tap (phone, Chromium; those marked WK again in WebKit).** Open the window
over the grid, then double tap its closing control — the second tap about 120 ms after the first, same spot; then the
same with about 350 ms between. Expected each time: the window closes (or does its action) and NOTHING opens behind it
(no day's bid window, no day panel, no other window, no cell picked), and Undo gains nothing beyond the window's own
action.
- the Required selection panel: ✕ (WK), Apply, Clear
- the rename form: ✕, Save (WK), Cancel
- the number pad: Done (WK) — after typing a figure; read the figure saved
- the day panel: ✕ (WK); then ‹ and › double tapped — expected: it steps two days and stays open
- the under-manned list: a row (WK) — expected: the grid at that day, nothing else open
- the move banner of a record: Confirm, Cancel (WK); the move banner of an event: Confirm, Cancel
- New period: ✕ (WK); Create (then Undo it)
- Open for bidding: ✕ on the phone (it fills the screen) — record what the second tap does

**M2 — the tablet (820×1180, touch, Chromium):** Open for bidding ✕ and the day panel ✕ double tapped — nothing behind.

**M3 — what must still get through (phone).**
- a. After a guarded close, wait 800 ms and tap the same spot: the grid answers as it normally does there.
- b. Within 300 ms of a close, tap a day at least 60px away: the grid answers.
- c. Right after a close, tap Undo, the bell, the menu button in the top bar: each answers.
- d. Each of the six closed WITHOUT a tap — by Escape where a keyboard can, a swipe or scroll of the grid, a tap on the
  shade or beside it, a pinch — then, after about 300 ms, a real tap on a day far from the window's place: it opens.
  (The last walk's lesson: a close without a tap once left the guard holding an old press, so the next real tap did
  nothing.)
- e. With the Required selection panel OPEN, the grid behind it still works: tap or drag other Required cells and a
  day behind it — they answer while the panel is up (it is meant not to block the page).
- f. With the day panel open, press inside it repeatedly (its rows, ‹ ›): nothing falls through to the grid.
- g. Open each window, close it, and open it again at once by its own control: it opens.

**M4 — a hand's ways (phone).** For the selection panel's Apply, the day panel's ✕ and a move banner's Cancel: a triple
tap; a double tap with the second finger 20px off; a double tap with 550 ms and with 700 ms between (record which side
of the guard each falls); a 600 ms hold on the control then a tap.

**M5 — a desktop (1536×864, mouse).** A double click on each window's closing control (selection panel, rename form,
the desktop figure editor closed by Enter then a click on the same cell, day panel, under-manned row, a move banner,
New period, Open for bidding): record what happens behind — the same as a single click, or a day opening.

**M6 — a member (`us`, phone).** The day panel's ✕ double tapped; the under-manned list if he can open it; a move of
his own bid — Confirm and Cancel double tapped; then he bids on a day after 1 s: it works.

**M7 — the plain-user round of the Leave War (phone, then desktop):** set a Required figure (one cell, then a dragged
run with Apply), rename a Required row and put it back; open a date's day panel, step it, close it; open the
under-manned list and take a row; move a bid and Confirm, move another and Cancel; open New period and close it;
open Open for bidding, open a month and put it back; open a person; Undo and Redo of one change. Each opens, closes
and opens again; the grid is never left dead (a tap on a day 1 s after any close opens it). Look at the places that
should show the result (the Manning rows after a Required change; the grid after a move).

## Your report — your FINAL REPLY, under 650 words
Per scenario id: the result, what opened or did not, the picture's folder and name. Every FAIL and every OBSERVED
difference with exactly how to repeat it (the window, the control, the gap between taps, the spot). Errors seen. What
was NOT RUN and why. The citable picture folders and how many pictures. Aim for about 40 minutes; if time runs short,
run M1, M3, M6, M4 first and mark the rest NOT RUN.
