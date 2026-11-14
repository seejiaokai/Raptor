# Job 4 — the walk of the Leave War's double-tap guard: the walker's brief (chat 64, 11 Nov 26)

You WALK the running app as a person would and report what you SEE. You do not read code for bugs, you do not fix
anything, you do not decide whether a finding is real — you record it exactly, with its picture and how to repeat it.

**The checkout:** `C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8`, branch
`claude/lw-doubletap-windows`, last code commit `245dd9a4e`. `raptor-port/dist` is ALREADY BUILT from it — do not
build, do not run `npm test` or any Playwright test file (they rebuild `dist`). Never switch branch, commit, push or
stash. The only files you may write inside the checkout are pictures under
`raptor-port/docs/img/handpass/2026-11-11-lw-doubletap-windows/` (make it; one sub-folder per run; if a run fails, use
a new folder name and say which are the citable ones). Delete nothing, anywhere. Your scripts and their output go in
`C:/Users/User/AppData/Local/Temp/claude/cee81c3498095cef/0808c898-68d1-497c-a60b-ea8a401daabb/scratchpad/job4/walk/`.

## Read first
1. `raptor-port/docs/walk-scripts.md` — how a walk script is written here and what each trap has cost. Follow it.
2. `raptor-port/CLAUDE.md` §Build & verify (signing in: `ad`/`a` is the admin, `us`/`us` a member; the login boxes;
   the browser fallback line every new Playwright script copies from `playwright.config.ts`).
3. `raptor-port/e2e/doubletap-leavewar.spec.ts` — for how to reach each Leave War window and how the double tap is
   made by real touch. Do not run that file.

## Stand it up
Check port 4392 is free (`Get-NetTCPConnection -LocalPort 4392` in PowerShell must find nothing), then from
`raptor-port` (cd by its FULL path): `npx vite preview --port 4392 --strictPort` in the background, output to a file
(its "ready" line holds colour codes — wait by trying the address, not by matching the text). Drive
`http://localhost:4392/`. Stop it BY ITS PORT when you finish. A fresh browser context per scenario. Watch console
errors, page errors and failed requests in every script and report any.

**Sizes and browsers:** a phone 402×874, touch on, device scale 3, in Chromium (real touch: `hasTouch: true`, taps
through the touchscreen or CDP touch points — never a mouse on the phone) and again in WebKit at the same size where
marked WK (if WebKit is not installed, say so; install nothing); a desktop 1280×800 by mouse where marked.

## What changed
On a phone, when a Leave War window closes by a tap, a fast second tap in the same place used to land on the grid
behind and open a day (the day's bid window, or the day panel from the pinned dates). A guard now swallows that second
tap: within about 600 ms of the close and within about 32px of the first tap. It was built on 6 Nov for the one-day
window and the drag window; this job extends it to: the person window, ⚙ Settings, the event window, the counter form,
the Events list, the Manning sheet, the OIL tracker (full-screen), and the event box (the small box a tap on an event
opens). Everything else must behave as before.

## The scenarios — for each: PASS / FAIL / OBSERVED / NOT RUN, what opened, the picture
On the phone picture the screen within about 100ms of the second tap and again once settled.

**W1 — each window × each way it closes by a tap (phone, Chromium; the rows marked WK again in WebKit).** Open the
window over the grid, then double tap its closing control — the second tap about 120ms after the first, same spot; then
the same with about 350ms between. Expected each time: the window closes and NOTHING opens behind it (no day's bid
window, no day panel, no other window), and Undo gains nothing beyond the window's own action.
- the person window: its ✕ (WK); a leave line or the OIL line in it, if a tap on one closes it
- ⚙ Settings: its ✕ (WK); Rearrange
- the event window: its ✕ (WK), Save, Delete, Move
- the counter form: its ✕, Cancel, Save, Delete
- the Events list: its ✕ — record what the second tap does (it is said to stand over the top bar's bell)
- the Manning sheet: its ✕ (WK)
- the OIL tracker: its ✕ — record what the second tap does
- the event box: its Edit
- the one-day window and the drag window (the guard's first homes): their ✕ / Cancel — still guarded

**W2 — what must still get through (phone).**
- a. After a guarded close, wait 800ms and tap the same spot: the grid answers as it normally does there.
- b. Within 300ms of the close, tap a day at least 60px away from the first tap: the grid answers.
- c. Right after a close, tap Undo, the bell, the menu button in the top bar: each answers.
- d. Close ⚙ Settings (and the event window) by a tap on the grid beside it, then tap the same spot again at once:
  record what happens (it is said to open that day, on purpose).
- e. Right after a guarded close: scroll the grid by a finger, and pinch it — both work at once.
- f. Open a window, close it, open it again at once by its own button: it opens.

**W3 — a hand's ways (phone).** For three of the windows (the person window, the counter form, the event window): a
triple tap; a double tap where the second finger lands 20px off; a double tap with 550ms between and with 700ms
between (record which side of the guard each falls); a tap-and-hold of 600ms on the ✕ then a tap.

**W4 — a desktop (1280×800, mouse).** A double click on each window's ✕ (all eight windows): record what happens
behind it — the same as a single click, or a day opening.

**W5 — a member (`us`, phone).** His own person window's ✕ double tapped; a day's bid window opened and closed, then
double tapped — nothing opens behind; he can still bid on a day after 1 s.

**W6 — the plain-user round of the Leave War (phone and desktop):** open a day and close it; open a person; ⚙
Settings and each thing it opens (+ Counter, Events…, Calendar…); the Events list and an event from it; the Manning
sheet and its Edit counter…; the OIL tracker; the tabs along the top; Undo and Redo of one change. Each opens, closes
and opens again; the grid is never left dead (a tap on a day 1 s after any close opens it).

## Your report — your FINAL REPLY, under 600 words
Per scenario id: the result, what opened or did not, the picture's folder and name. Every FAIL and every OBSERVED
difference with exactly how to repeat it (the window, the control, the gap between taps, the spot). Errors seen. What
was NOT RUN and why. The citable picture folders and how many pictures. If time runs short (aim for 35 minutes), run
W1, W2, W5, W3 first and mark the rest NOT RUN.
