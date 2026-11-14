# The small schedule-and-board fixes — the re-walk of the reads' fixes: the walker's brief (11 Nov 26, chat 64)

**You are a walker.** You drive the REAL app in a real browser as a person would, take pictures, and report PASS or
FAIL for each scenario. You do not read code to find bugs and you fix nothing in the app. Read
`raptor-port/docs/walk-scripts.md` first (how a walk script is written here, and what each trap has cost) — whole.

**The build:** the production build already standing at `raptor-port/dist` (do not rebuild — a build needs the checks
lock). Serve it yourself on a port you have CHECKED is free (not 4173, 4188, 4191, 4197, 4463, 4477), and stop your
server by its PORT when you finish. The recipe every scenario starts from is the passing browser test
`raptor-port/e2e/board-undo-land.spec.ts` (how it signs in as `ad` / `a`, opens the Scheduler Board, changes a box,
scrolls, presses Undo and Redo, pinches the board's desktop layout, signs off, hides a warning, folds Personal Inputs)
and the earlier walk `raptor-port/scripts/handpass/sb63-walk.mjs` with its helpers `sb61-lib.mjs` (the world, the
sizes, `shot`, `ok`, `note`, `finish`). A control you press comes from one of those passing runs, never from reading
the source.

**What changed (so you know what to look at):** on the Scheduler Board, Undo and Redo bring the changed box on screen
when it is out of view and move nothing when it is in view (the owner's rule: "Undo and Redo, everywhere, leave the
screen where it is when what they change is in view, moving to the change only when it is out of view"). Tonight's
fixes extend that to: the board's desktop layout pinched smaller or larger on a phone; a row that was re-ordered; a
Personal Input whose panel is folded; a sign-off; a hidden warning; a SANS availability card; and an accepted input
shown on a programme row.

## Your files

- Your script: `raptor-port/scripts/handpass/sb64-rewalk.mjs` (prints `sb64-rewalk v<n>` at the top of every run; a
  rewrite and its run are never sent in one step; saved as UTF-8 with LF line endings; written with the file tool, never
  passed inline to the shell). It sets its output folder BEFORE loading `sb61-lib.mjs`
  (`process.env.SB61_OUT ||= 'docs/img/handpass/2026-11-10-sched-board-small/rewalk'`, then `await import(...)`) — check
  `sb61-lib.mjs` reads the folder with `||=` or from the environment, so nothing is written over `walk/` or `walk2/`.
- Your pictures: `raptor-port/docs/img/handpass/2026-11-10-sched-board-small/rewalk/` only.
- Your notes file: `raptor-port/docs/handpass/parts/2026-11-11-sched-board-small-rewalk.md`.
- Scratch: `C:/Users/User/AppData/Local/Temp/claude/cee81c3498095cef/0808c898-68d1-497c-a60b-ea8a401daabb/scratchpad/job1-walk/`.
- Write nothing else. No git commit, switch, stash or push. Full paths or `git -C`; never `cd ..`.

## Sizes

Desktop 1536 × 730 in Chromium (`pc`); phone 402 × 874 in WebKit with touch (`phone`); the phone on its side
874 × 402 (`side`) where a scenario says so.

## The scenarios — each is PASS or FAIL; a PASS means the screen is right

For every scenario: the picture right after the press (within about 100 ms) AND the settled picture (a long smooth
scroll takes over 0.9 s — wait until two readings of the box's place 200 ms apart agree); the changed box measured
at rest — wholly between the board's bar and the list's foot, and ON TOP there (`elementFromPoint` at its middle is the
box or inside it: nothing stands over it — not the bar, not a window, not the keyboard's room); and for the
"already in view" half, the list's scroll position read before and after — it must not change by a pixel.

- **R1 — the earlier Undo routes still hold.** Re-run `sb63-walk.mjs` steps `w8` and `w9` only (`ONLY=w8,w9`,
  `SIZES=pc,phone,side`) into your `rewalk/` folder. EXPECTED: every assertion passes, as it did before the fixes.
- **R2 — the pinched board** (`phone`). Board → its desktop layout → pinch to about half size. Retype a remark near
  the top of the day; scroll to the foot; Undo. EXPECTED: the remark's box comes into view, not under the bar. Redo with
  the box in view: nothing moves. Again pinched to about twice the size.
- **R3 — a re-ordered row** (`pc`, `phone`). (a) Press Auto sort (or Sort all) on a day it re-orders; scroll so the
  moved rows are out of view; Undo. EXPECTED: a row that MOVED comes into view. Redo likewise. (b) Drag ONE row — the
  last Common Programme row to the head — scroll to the head; Undo. EXPECTED: the list goes to the foot, where that
  row went back; then at the foot press Redo: the row leaves for the head and the list follows it there. (c) A row
  moved while both its old and new place are in view: nothing moves. (d) Scroll down to the Ground Programme and press
  Sort all on a day where it re-sorts Ground rows in view AND rows far above; with the Ground rows still in view press
  Undo, then Redo. EXPECTED: the list does not move either time — part of what changed is in view (the third fix
  round).
- **R4 — Personal Inputs folded** (`pc`, `phone`). Change the remarks of a rejected input under Personal Inputs, tap
  away to save, fold the panel, scroll away, Undo. EXPECTED: the panel is open again and the input's line is in view.
  Redo likewise. And: with the panel folded, undo a change to something ELSE on the day (a remark): the panel stays
  folded.
- **R5 — a sign-off and a hidden warning.** (a) `phone`: sign the day off (one of its sign-off boxes), scroll to the
  foot, Undo. EXPECTED: the sign-off line is in view. (b) `phone`: hide a warning (its ✕), scroll to the foot, Undo.
  EXPECTED: that warning's own line is in view. (c) `pc`: hide a warning low in the issues list, scroll the issues list
  back to its top, Undo. EXPECTED: the issues list brings that line into view, and the board's own list does not
  move. (d) `pc`, the warning's line in view: Undo moves nothing.
- **R6 — a SANS availability card** (`pc`, `phone`). From the board's SANS availability panel open a card, change its
  time, save; scroll away; Undo. EXPECTED: the card is in view. With the card in view: nothing moves.
- **R7 — an accepted input on a programme row** (`pc`, `phone`). An accepted input shown on the Ground or Common
  Programme, its time retyped on that row while the row is in view and Personal Inputs is out of view; Undo.
  EXPECTED: the screen does not move.
- **R8 — with a window open** (`phone`, and `pc`). The changes window open (opened from the board's History): undo a
  change whose box is out of view. EXPECTED: the box lands clear of the window — on the phone above the window standing
  on the screen's foot; on the desktop not beneath the floating window (if the window covers the board's column, say
  where the box rests and picture it).
- **R9 — the plain-user check after it all** (`pc`, `phone`): make three ordinary changes on the board in a row (a seat,
  a remark, a time), Undo all three and Redo all three with the boxes in view. EXPECTED: the screen never moves; no
  console error, page error or failed request during the whole walk (collect them and list any).

**Stop rule:** after three failed attempts at one gesture, stop that scenario, picture what you see and report it as
NOT RUN with the reason — never guess a result. A FAIL is first read against your own script's world (did the script
do what a person would? was the box really out of view? was the scroll settled?) before it is reported — say what you
checked. Do not shrink a scenario to make it pass.

## What you hand back

Your notes file: one line per scenario and size — PASS / FAIL / NOT RUN — with the picture names; for a FAIL the steps
a person takes, what the screen shows, what was expected, and the two pictures; the totals; the console and network
errors seen. Then stop every script, browser and server you started.
Your final message to me, under 300 words: the totals, each FAIL and NOT RUN in a line, the picture count, your
script's last version line, and the port you used and stopped.
