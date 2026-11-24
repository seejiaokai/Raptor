# [MSQ-PICK-GUARD] the second questions page — press each open case on today's app (chat 175, the night of 24–25 Nov 26)

Four pressing helpers share this brief; each does ONLY its own section (P1–P4, named in its prompt). You establish
FACTS for a page of questions the owner (not technical) will answer before anything is built. Nothing is built.

## Rules for every presser

- Work in `C:\Users\User\projects\Raptor-msq` only (branch `claude/msq-b1-screens-135`), by full path — your shell may
  start in another folder. Change no file under `raptor-port/src`, no document but the files named here; commit nothing;
  push nothing; do not start, stop or rebuild the app — the host serves the built app at `http://localhost:4700/` (the
  branch with `main` brought in tonight). Do not run `npm run build`, the unit suite or any `npx playwright test`.
- **What is settled** (not under review — read the full rows with the shell, `grep -h '^| D2403 |'
  .claude/decisions-full/*.md`, likewise D2405, D2590–D2595): a pick of another squadron, the switch to or from the
  member view, and a bell line to another squadron are REFUSED while a window is open or a change is "Not saved", with
  the grey "Blocked:" note; Logout is never refused, it asks; where the squadron or his rights change without his
  press the app stops under a Refresh card; Undo reaches only the squadron in view. NONE of this is built yet — you
  press TODAY's app, to show him what happens now in each case his rulings do not name.
- Read first: the backlog item `[MSQ-PICK-GUARD]` in `OUTSTANDING.md` (and `[MSQ-NIGHT-153-OPEN]` under it); the first
  pressing report `raptor-port/docs/superpowers/briefs/2026-11-24-msq-pick-guard-press-report.md` — it already
  established much; do not re-press what it settled, start from its scripts; the combined scenario list
  `…/briefs/2026-11-24-msq-pick-guard-scenarios.md` §2 (H1–H13) and the fuller scenario text a row names in
  `…-scenarios-fable.md` / `…-scenarios-astra.md` (open only the scenarios your section cites).
- Reuse chat 166's helpers: `raptor-port/scripts/handpass/n166/lib.mjs` (sign-in, `press`, `covered`, `pic`, `FACT`)
  and its scripts for the demo sign-ins, how a squadron is picked, the failed-save stand-in (`save-d.mjs`), the
  midnight stand-in (`mid-e1.mjs`), the bell set-up (`bell-a.mjs`), the Tracker (`trk-b.mjs`). Put your scripts in
  `raptor-port/scripts/handpass/n175/` — `<your section>-<case>.mjs` (a small `lib.mjs` there may re-export n166's;
  if another presser already wrote it, use it, do not rewrite it).
- Sizes: desktop 1536×864 (`d`); phone 402×874, touch, WebKit as n166 does (`p`); where your section names them, a
  phone on its side 874×402 (`ps`) and a small tablet upright 768×1024 (`t`).
- **Every step presses the app's own controls as a person would.** A stand-in (a clock moved, storage refusing, a
  second tab) only where no press can make the case — named in the script and in its FACT lines.
- **Each script prints `FACT <key>=<value>` lines** of what the screen SAID (its own words, button labels, which
  controls are live, greyed or covered) and what happened to what he typed (kept, lost, saved — and into which
  squadron's record). The host re-runs every script: `node raptor-port/scripts/handpass/n175/<script>.mjs <size>`
  must run by itself from the repo root, start to finish, on a fresh browser.
- **Pictures:** at deviceScaleFactor 2. For each case ONE or TWO deciding pictures, each saved twice in
  `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/today/`: the whole screen `<section>-<case>-<size>-<what>.png`
  and a crop `…-crop.png` cut to what the case is about, the thing in question ringed (a 3px outline in `#e6007e`
  drawn around it by the script just before the picture, removed after). Every other picture goes to
  `raptor-port/.tmp/n175/<section>/` (not in the repo). Open every deciding picture yourself before you call a fact
  settled — a picture that shows a blank page, a spinner or the wrong screen is retaken.
- Run logs and scratch data: `raptor-port/.tmp/n175/<section>/`.
- Stop after about two hours of work even if cases remain — hand back what is done and list what is not.

## Your hand-back

Write it to `C:\Users\User\AppData\Local\Temp\claude\e2bface01731fdd2\3f35f52f-80e8-41e0-a951-e8a0fa3cf3ab\scratchpad\n175\<section>.md`
(make the folder if missing) AND give the same text as your final message. Under 1,200 words: a table, one row per
case and size — case · what he did (the presses) · what the screen said and did today (its own words) · what happened
to his typing · script · the deciding picture's name; then what surprised you; every stand-in; every case not
pressed and why; the scripts in re-run order. Every fact must come from a `FACT` line. No recommendations, no new
wording, no design.

---

## P1 — which things count as "a window", and the editing modes

His ruling says "an Input, Leave War or other window". The first press settled the big windows. Open: the small ones.

1. **The four small pop-ups** — Traffic, Jump to a date, Day details ⓘ, the document viewer (an input's attached
   document). For each, at `d` and `p`: open it; is anything typed or chosen in it that could be lost? Press the
   squadron picker, the role badge (member-view switch) and the bell: does the pop-up close at the press on the bar
   (the first report says they "close silently")? Does the pick then go through in the same press or need a second?
   Then: the document viewer opened OVER an Input window with typed words — pick 149: what closes, what stays, are the
   words kept?
2. **The Changes window**, opened out and folded (its folded form): what it looks like folded; a pick and the view
   switch with each form.
3. **The Scheduler Board** (and its own bell, its cancel-reason box with a reason typed, "Sort all" if it is a mode):
   is the board a page or a window over a page? With a reason typed in the cancel-reason box: pick 149, switch view —
   the typed reason kept, lost, asked? (Scenarios F28, A28.)
4. **The Tracker**: "Edit chart layout" opened with NOTHING moved; "Show All"; an event's ⓘ; the flex settings;
   reorder. For each: pick 149 and the view switch — what closes, is anything asked? (F5, A25.)
5. **Editing modes that are not windows** (scenarios F52, F57, A53): OIL "Earn" mode; an armed slot on Edit Schedule;
   an armed "Discard N edits & load"; **Logic's edit mode with a change made and not yet saved; Edit quals with a tick
   changed and not yet saved**. For each: pick 149, and the view switch — is the unsaved change kept, lost, saved (into
   which squadron's record), asked about?
6. **ALL AVAIL** — the first press could not open it (no count chip in the demo). Scenario A26 says make it on a fresh
   day; try, then press the pick over it.

## P2 — Admin → Users, the bell, his own pages, a save still going

1. **Admin → Users beyond "a row with typing"** (H3; F17). At `d` and `p`, for each, then a pick of 149 and the view
   switch — kept, lost, asked? (a) a row opened, its Role changed, nothing typed; (b) the "Give access" form under
   "Waiting for access" with typing; (c) "+ Add person" with a name typed; (d) an archived man's row opened and his
   name edited; (e) "+ New squadron" with typing. (f) a row opened with typing, then another Admin section opened
   (e.g. Squadrons): is the row still open, out of sight, with its typing, on coming back? Then the pick from that
   other section. (g) a row opened with typing, then another page's tab pressed (leaving Admin): typing kept, lost,
   asked?
2. **A bell line of the other squadron — read or unread, list open or closed** (C5; F4, A41). Hunter on 149, a 142
   line in his bell (bell-a's set-up), NO window open: press the line — does the line turn read, does the list close?
   Record the line's look before and after (a picture of each).
3. **A tap on the bell itself that acts without a list** (H7; C4; F58): his own OIL question (an OIL question nobody
   answered for an ALL / ALL AVAIL input lights the bell, and a tap opens the question) and the access alert — find in
   `raptor-port/src/ui/topstate.ts` (`bellTap`, `openNotice`) every case where a tap on the bell opens something
   directly. For each you can raise: what the tap does today, with nothing open and with an Input window open.
4. **The bell's own OIL tap opening another squadron's input** (C1; F1, A1 — `[MSQ-NIGHT-153-OPEN]` security F1, F2):
   a man on 149 whose bell holds his 142 OIL question (or 142's OIL list open, then a pick): what opens, what the bar
   says, and whether the window's Save, Delete and OIL answer are live and what record they write. This is the fault
   the build's part F closes; the page shows him today's behaviour.
5. **One of his own pages opened from a squadron he only views** (C8; F18): read F18 whole and press it — with no
   window open, and with one open.
6. **A save still going when a pick is pressed, which then fails** (H8; C27; F9, A35). The first press showed a save in
   flight lands in its own squadron's record. Now make the save slow and then FAIL after the pick (a stand-in: storage
   that waits, then refuses): on which squadron does the "Not saved" band appear, what does it say, and what does Retry
   save, and where?

## P3 — where the note stands, and Logout

1. **Where today's grey "Blocked:" note stands at each size** (H11; C22, C25). The app exposes `window.toast(text,
   'blocked')` (see `n166/draw-lib.mjs`). At `p`, `ps`, `t` and `d`, with (a) no window, (b) an Input window open,
   (c) Leave War My leave open, (d) Inputs settings open, (e) the Calendar window open: is the squadron control
   reachable (the first report's table says which — confirm at `ps` and `t`, which it did not press)? Raise the note
   with the words "Blocked: close the open window, then pick 149." and record where it stands (top or foot — the rule
   on a phone today: at the top while a "shell window" is open, else at the foot), its box (x, y, width, height), how
   many lines it takes, and what it covers — a window's buttons, its ✕, the squadron control? A picture of each of
   (b)–(e) at `p`, `ps` and `t`.
2. **The ☰ menu after a pick on a phone**: today, after a pick from the ☰ squadron list, does the menu close? (The
   drawing shows it closed after a refused pick.)
3. **Logout while a change is "Not saved"** (H1; C30; F31, A44): raise the failed save (save-d's stand-in), press
   Logout — exactly what the screen shows and says (the band, Retry, the sign-in card, the line under it), whether the
   next sign-in waits; then lift the stand-in, press Retry: is the change saved, does the page reload? At `d` and `p`.
4. **Logout over a window that holds typing and has no question of its own** (H4; C36; F33, A43): a holiday's name
   typed in Add a holiday; a bid being placed in Leave War's Place a bid; the OIL list with an answer chosen and not
   saved; a Tracker remark typed in the marking window. For each at `d`: can Logout be reached (or does the window's
   shade cover it)? Pressed: is anything asked, is the typing lost?
5. **Logout with an Input window holding typed words and NO unsaved chart edits** (H6): what happens — the window's own
   question, or signed out with the words lost unasked? And **with an opened Admin → Users row holding typing** (N5).
6. **Logout on a phone with a window open** (H5; C35; F11): for the Input window, My leave, Inputs settings, Place a
   bid — is ☰ (where Logout lives on a phone) reachable? One whole-screen picture at `p` of each, for the drawer.

## P4 — Undo, the refresh card's edges, a drag, typing left in a box

1. **Undo's edges** (H9; C41–C45; F56): (a) steps made on 142 and on 149 by one admin (and on a third squadron if the
   demo's "+ New squadron" makes one): today's Undo and Redo labels on each squadron in turn; (b) undo a 142 step, pick
   149, make a new change there, go back to 142 — is 142's Redo still offered today? (c) "+ New squadron" made, that
   squadron in view, Undo pressed — what today does and says; (d) on a phone, the greyed Undo: can its reason be read
   at all (a tap, a long press)?
2. **The refresh card's edges** (H10; C46–C51) — today's behaviour in each: (a) his move at midnight with NOTHING open
   (mid-e1's stand-in): what changes on screen, is anything said? (b) the app opened two days AFTER his move date:
   where he lands, what is said; (c) a posting OUT, and an archive, taking effect at midnight with the app open: what
   the screen shows; (d) a midnight for a man who is NOT moving: confirm nothing appears; (e) a reload (the browser's
   own) while a save is waiting ("Not saved"): does the browser ask, is the change lost? (f) 149's Tracker failing at
   EVERY pick (trk-e3's stand-in, picked three times): what the panel says each time.
3. **A drag in progress when a door is pressed** (H12; C54; F26, A49): a puck being dragged on Edit Schedule (pointer
   down and moved, not released) — then, on a phone, a second finger taps ☰ / the squadron control; on a desktop, a key
   that reaches a door if one exists (Tab to the picker and Enter). What happens to the drag — dropped where it was,
   put back, or landed on the other squadron?
4. **Typing left in a box at a pick** (H13; C55; F27, F44, A37), at `p` and `d`: Help's bug-report box with words
   typed; the calendar's "+ Note" with words typed; a Balances figure box with a number typed and not left; on a phone
   the caret left in a day's note on Edit Schedule (the first report: the words go into 142's note) — pick 149: for
   each, kept in the box, lost, saved (into which squadron's record)?
