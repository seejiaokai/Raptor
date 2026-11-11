# Job 4 — the re-walk after the fix round: the walker's brief (chat 64, 11 Nov 26)

You WALK the running app as a person would and report what you SEE. You do not read code for bugs, you do not fix
anything, you do not decide whether a finding is real — you record it exactly, with its picture and how to repeat it.

**The checkout:** `C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8`, branch
`claude/lw-doubletap-windows`, last code commit `be789fdc7`. `raptor-port/dist` is ALREADY BUILT from it — do not
build, do not run `npm test` or any Playwright test file (they rebuild `dist`). Never switch branch, commit, push or
stash. The only files you may write inside the checkout are pictures under
`raptor-port/docs/img/handpass/2026-11-11-lw-doubletap-windows/` in NEW sub-folders whose names start with `rw-`
(one per run; if a run fails, use a new name and say which are the citable ones). Delete nothing, anywhere — not even
an empty folder of your own. Your scripts and their output go in
`C:/Users/User/AppData/Local/Temp/claude/cee81c3498095cef/0808c898-68d1-497c-a60b-ea8a401daabb/scratchpad/job4/rewalk/`.
The first walk's scripts are in `…/scratchpad/job4/walk/` — READ them and reuse their helpers (how each window is
opened, how a double tap is made by real touch); do not start from nothing.

## Read first
`raptor-port/docs/walk-scripts.md` (how a walk script is written here); `raptor-port/CLAUDE.md` §Build & verify
(`ad`/`a` is the admin, `us`/`us` a member; the login boxes; the browser fallback line every new Playwright script
copies from `playwright.config.ts`).

## Stand it up
Check port 4393 is free (`Get-NetTCPConnection -LocalPort 4393` in PowerShell must find nothing), then from
`raptor-port` (cd by its FULL path): `npx vite preview --port 4393 --strictPort` in the background, output to a file
(its "ready" line holds colour codes — wait by trying the address, not by matching the text). Drive
`http://localhost:4393/`. Stop it BY ITS PORT when you finish. A fresh browser context per scenario. Watch console
errors, page errors and failed requests in every script and report any.

**Sizes:** a phone 402×874, touch on, device scale 3, Chromium (real touch — the touchscreen or CDP touch points, never
a mouse on the phone); WebKit at the same size where marked WK (if it is not installed say so; install nothing); a
desktop 1280×800 by mouse; and for R1c a desktop-size Chromium context with `hasTouch: true` (a touch laptop).

## What changed since the first walk
The guard that swallows a fast second tap after a Leave War window closes was being armed in a few cases where NO tap
closed anything — the small event box (the box a tap on an event opens) closed by a swipe, a scroll, the Escape key or
a pinch — so the next real tap on a day near that spot did nothing. Fixed: the guard is now armed only by a tap made
just before the window went. Everything the first walk passed must still pass.

## The scenarios — for each: PASS / FAIL / OBSERVED / NOT RUN, what opened, the picture
On the phone picture the screen within about 100 ms of the deciding tap and again once settled.

**R1 — the fixed case: the event box closed without a tap, then a real tap (must OPEN the day).**
- a. Phone: tap an event (the box opens); put a finger ON the box and swipe the page up about 150px (a real touch
  drag begun on the box) — the box closes; within 300 ms tap a day close to where the finger first came down: that
  day's bid window opens. Run it three times at different events.
- b. Phone: tap an event; tap the event's name inside the box (it stays open); pinch the grid (the box closes);
  within 300 ms tap a day near the earlier tap: it opens.
- c. Touch laptop (1280×800, touch on): touch an event (the box opens); touch the name inside it; press Escape on
  the keyboard (the box closes); within 300 ms touch a day within 30px of that touch: its window opens.
- d. Phone: tap an event; tap the name inside the box; wait 2 s; tap the grid elsewhere (the box closes by that tap);
  record what the next tap on a day does.
- e. Phone: the box's Edit by ONE tap — the event window opens and stays. Then the box's Edit by a double tap (120 ms):
  record what happens (it is known that the second tap, landing beside the new window, closes it — record only).

**R2 — the guard still guards (phone, Chromium, the second tap 120 ms after the first, same spot; nothing may open).**
The person window's ✕ (WK too); ⚙ Settings' ✕; the event window's ✕ (WK too) and Save; the counter form's Cancel; the
Manning sheet's ✕; the one-day window's ✕. And a slow hand: press and HOLD the person window's ✕ for 1.3 s, release (it
closes), tap the same spot 120 ms later — nothing opens.

**R3 — what must still get through (phone).** After a guarded close: the same spot after 800 ms opens the day; a day
60px or more away within 300 ms opens; Undo, the bell and the menu button answer at once.

**R4 — the two the first walk did not run.**
- a. The drag window: drag across three days of one row by a finger (a long press then a drag, as the app's own
  browser tests do it — see `raptor-port/e2e/` for a Leave War drag-select by touch); the window opens; double tap its
  ✕ (120 ms) — nothing opens behind. If the finger drag cannot be made in 10 minutes of trying, mark NOT RUN and say
  what was tried.
- b. The person window: tap one of his leave lines (the window closes and the grid goes to that leave) twice quickly
  — record what the second tap does.

**R5 — the plain-user round of the Leave War (phone, then desktop by mouse):** open a day and close it; open a
person; ⚙ Settings and each thing it opens (＋ Counter, Events…, Calendar…); the Events list and an event from it; the
Manning sheet and its Edit counter…; the OIL tab; the tabs along the top (Grid, Approvals, Balances, OIL); place one
leave on a day, Undo it, Redo it, Undo it. Each opens, closes and opens again; the grid is never left dead — a tap
on a day 1 s after any close opens it.

## Your report — your FINAL REPLY, under 500 words
Start with the exact words "Re-walk report, job 4". Per scenario id: the result, what opened or did not, the picture's
folder and name. Every FAIL and every OBSERVED difference with exactly how to repeat it. Errors seen. What was NOT RUN
and why. The citable picture folders and how many pictures in each. Aim for 30 minutes: run R1, R2, R3 first, then R5,
then R4; mark the rest NOT RUN if time runs out.
