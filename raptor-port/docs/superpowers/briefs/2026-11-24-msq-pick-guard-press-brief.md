# [MSQ-PICK-GUARD] step 1 — press every case on the running app (chat 166, 24 Nov 26)

You are a helper establishing FACTS before anything is drawn or built. Nothing is built: change no file under
`raptor-port/src`; commit nothing; do not start, stop or rebuild the app — the host serves the built app of branch
`claude/msq-b1-screens-135` at `http://localhost:4700/`. Work in `C:\Users\User\projects\Raptor-msq` only.

## What the owner ruled (settled, not under review)

- **D2403 ("Yes guard rail."):** a pick of another squadron, and the switch to or from the member view, is REFUSED
  while an Input, Leave War or other window (the OIL list among them) is open, with a note saying to close it first;
  unsaved Tracker chart edits are asked about at both, with the question a pick asks today; a bell line that would take
  him to another squadron follows the same rule.
- **D2405 ("Yes refresh for those"):** where the squadron in view or his rights change WITHOUT his press (his own move
  taking effect at midnight, a right taken away, the Tracker failing part-way through a switch) the app stops under one
  note asking him to refresh, with its own Refresh button; unsaved work is lost and the note says so. The greyed windows,
  their two bands (D2323, D2389) and the Tracker's hold at his own move are removed by that build.
- Full text: the backlog item `[MSQ-PICK-GUARD]` in `OUTSTANDING.md` (read it whole first), and
  `grep -h '^| D2403 |' .claude/decisions-full/*.md` (likewise D2405, D2323, D2389, D2318) — use the shell.

## Your job: what TODAY's app does in each case, at 1536×864 and 402×874

Reuse chat 162's helpers: `raptor-port/scripts/handpass/n162/lib.mjs` (sign-in, `press`, `covered`, `pic`, `FACT`) and
read `sw-a.mjs`, `ph-b.mjs` for the demo sign-ins and how a squadron is picked. Put your scripts in
`raptor-port/scripts/handpass/n166/` (a small `lib.mjs` there may re-export n162's with pictures going to
`raptor-port/docs/mock/2026-11-24-msq-pick-guard/today/`). Every step presses the app's own controls as a person would; a
stand-in (a clock moved forward, another tab's change, a storage refusal) is allowed only where no press can make the
case, and is named in the script and in its FACT lines. Each script prints `FACT <key>=<value>` lines of what the
screen SAID (its own words, button labels, which controls are live or greyed) and what happened — re-runnable by the
host with `node raptor-port/scripts/handpass/n166/<script>.mjs <size>`.

A. **Every window that can be open while a squadron pick or the view switch is pressed.** First list, from the code
   (search `raptor-port/src` for the app's windows and overlays — Input window, Leave War windows, Export, the OIL list,
   Import, Admin windows, the bell's own panel, the Tracker's questions, and any other), every window or overlay the app
   has. For each, at both sizes: can the squadron control (☰ menu → the squadron list, and the desktop top-bar picker if
   there is one) and the member-view switch be REACHED while it is open (`covered`)? If reachable, press the pick and
   the view switch: what does the screen show today (the band words, greyed buttons, whether the window closes)? Also
   a bell line that leads to another squadron, pressed with each reachable window open.
B. **Unsaved Tracker chart edits** — a pick, and the switch to and from the member view: is the question asked at each
   today? Its exact words and buttons.
C. **A page with unsaved typing that is not a window** — an opened row on Admin → Users, a text box on Edit Schedule,
   Logic, Quals: pick another squadron mid-typing; is the typing kept, lost, or asked about?
D. **A save still going, or failed ("Not saved" with Retry)**, then a pick.
E. **A change he did not make, with a window open** (D2405's cases): (1) **his own move to another squadron taking
   effect at midnight while an Input window is open, and again while a Leave War window is open** (a demo person with a
   posting that starts tomorrow; move the page's clock past midnight — find how the app's midnight wake runs and name
   your stand-in); (2) a right taken away by another tab (a master admin in a second page of the same browser context
   removes his Plan) while a window is open; (3) the Tracker failing part-way through a switch (chat 162's `sw-a.mjs`
   shows how far a stand-in reaches); (4) sign-out with a window open and unsaved Tracker edits. For each: the exact
   words on screen, what is greyed, what is lost.
F. **A second switch pressed during the first**, and **Undo / Redo** pressed after a pick (does Undo show the other
   squadron's step?).

Take one picture for each case that decides something (the window and the control, cropped); open each yourself
before you call a fact settled.

## Your hand-back — your final message (a report file is refused; do not try)

Under 1,200 words: a table, one row per case and size — case · reachable? · what the screen said today (its words) ·
script name · picture name; then anything that surprised you, and every stand-in you used. Every fact in the table must
come from a `FACT` line your script prints; list the scripts in the order the host should re-run them. Do not write
recommendations or new wording.
