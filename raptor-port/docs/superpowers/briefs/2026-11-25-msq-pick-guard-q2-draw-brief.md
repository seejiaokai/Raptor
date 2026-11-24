# [MSQ-PICK-GUARD] the second questions page — the drawings owed (chat 175, the night of 24–25 Nov 26)

You are a fresh Fable helper drawing mock-up pictures for the owner (not technical; he reads on an iPhone) to answer
questions BEFORE anything is built (D1625). One of them is a small design of your own (§D2). Change no file under
`raptor-port/src`; commit nothing; push nothing; do not start, stop or rebuild the app — the host serves the built app
at `http://localhost:4700/`. Work in `C:\Users\User\projects\Raptor-msq` (branch `claude/msq-b1-screens-135`) by full
path — your shell may start in another folder, which you must not write to. Four pressing helpers work at the same
time under `raptor-port/scripts/handpass/n175/p*-*.mjs` and `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/today/`
— leave their files alone.

## Read first

- The backlog item `[MSQ-PICK-GUARD]` in `OUTSTANDING.md`; the full rows `grep -h '^| D2590 |'
  .claude/decisions-full/*.md` (the shell) — likewise D2591, D2592, D2593, D2594, D2595, D731, D1622, D1625, D1496,
  D1222, D1667, D1668, D487.
- The first drawing brief and its scripts — `raptor-port/docs/superpowers/briefs/2026-11-24-msq-pick-guard-draw-brief.md`,
  `raptor-port/scripts/handpass/n166/draw-lib.mjs`, `draw-pick.mjs`, `draw-beside.mjs`, `draw-bell.mjs` (how the note
  was placed under the control pressed — the approved look, pictures `raptor-port/docs/mock/2026-11-24-msq-pick-guard/drawn/p1b-*`,
  `p2b-*`, `p4b-*`, `p3-p-*`; open them) — and the pressing report `…/briefs/2026-11-24-msq-pick-guard-press-report.md`.
- The words read `…/briefs/2026-11-24-msq-pick-guard-words2-fable.md` (the words below come from it).
- The design rules: `.claude/rules/ui-design.md`; `.claude/rules/decisions/design.md` (whole); in
  `raptor-port/docs/design-practices.md` the sections its checklist names for a mock-up and for a new control; the
  mock-up guide (search `.claude/skills` for "mockups-on-the-real-app").

## How to draw (the app's own parts — D1496)

Every picture is the REAL app driven by a script to the case's state, then the new thing added on top in the app's own
look: the grey note by `window.toast(text, 'blocked')` placed as `n166/draw-beside.mjs` places it; a question card by
cloning the app's own question card (the Input window's "This input has unsaved changes…" card, or the Tracker's) with
`page.evaluate` and changing its words and buttons — never a hand-styled box. Nothing else on screen changes.
deviceScaleFactor 2; desktop 1536×864 (`d`), phone 402×874 touch, WebKit as n166 does (`p`); where named, a phone on
its side 874×402 (`ps`) and a small tablet upright 768×1024 (`t`). Each picture saved whole and as a crop (`-crop`) cut
to what it is about. Open every picture you take before you call it done; one that shows the wrong screen, a cut-off
note or unreadable words is redrawn or reported.

Scripts: `raptor-port/scripts/handpass/n175/draw-<name>.mjs`, each re-runnable by the host by itself from the repo
root (`node raptor-port/scripts/handpass/n175/draw-<name>.mjs`), each printing `FACT` lines of the words actually on
screen in each picture and the note's or card's box (x, y, width, height, lines). Pictures:
`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/drawn/<id>-<size>-<what>.png`.

## The drawings

**D1 — Logout while a change is not saved** (a new card). State: a failed save ("Not saved — keep this page open" with
Retry; the stand-in of `n166/save-d.mjs`), Logout pressed. Two versions, each at `d` and `p`, the band in sight:
- `d1a` (nothing is lost — what today's app does): "Your last changes aren't saved yet. Log out anyway?" — buttons
  "Log out" · "Stay".
- `d1b` (the change dropped at Logout): "Your last changes aren't saved. Log out and lose them?" — buttons "Discard
  and log out" · "Stay".

**D2 — the way to reach Logout on a phone with a window open — YOUR DESIGN, two options drawn.** His ruling (D2592):
"on a phone Logout can be reached with a window open". Today an Input window fills an upright phone and its title
strip covers ☰, where Logout lives; other windows (Leave War My leave) leave ☰ free. Look at each window on a phone
first (the pressing report's table; press them yourself). Design the smallest thing that makes Logout reachable over
every window, in the app's own parts, changing no button's size (D487), adding no second gear or pencil, and honest
about what else it makes reachable (if ☰ becomes reachable, so do the squadron list and the member-view line — which
the guard will then refuse with the note at the foot; say so). Draw TWO options at `p` over the Input window (and the
better one over one more window): `d2a-…`, `d2b-…`; in your hand-back say which you recommend and why in two
sentences, and what each costs. The control's word is "Logout", as the bar's button has it.

**D3 — the notes with new words, in the approved look** (under the control pressed on a desktop; at the foot on a
phone):
- `d3a` at `d` and `p`: Admin → Users, a row open with typing, 149 picked — "Blocked: save or cancel the open row,
  then pick 149." (At `p`, the pick is made in the ☰ menu: draw the menu closed after the refusal, the row in sight.)
- `d3b` at `d` and `p`: the "Not saved" band showing, 149 picked — "Blocked: press Retry to save your changes, then
  pick 149." The band and its Retry must be in the same picture as the note; if on a phone the band cannot be seen
  where the note shows, show that and say so.
- `d3c` at `d`: an Input window open, the bell itself tapped where a tap acts directly (the lit bell for his own OIL
  question — find the state in `n166/bell-a.mjs` / `ui/topstate.ts`; if you cannot raise it, draw the note under the
  bell with the bell lit by any means and say so) — "Blocked: close the open window, then press the bell again."
  (these four last words are a draft).
- `d3d` at `d`: a window open AND "Not saved" showing, 149 picked — the note that would show first: "Blocked: close
  the open window, then pick 149." (the Retry note following at the next press).

**D4 — Logout's questions over typed work** (each the app's own question card, cloned):
- `d4a` at `d`: an Input window with unsaved changes, Logout pressed — TODAY'S words kept: "This input has unsaved
  changes. Close it and lose them?" — "Discard and close" · "Keep editing"; and `d4b`, the proposed words: "This input
  has unsaved changes. Log out and lose them?" — "Discard and log out" · "Keep editing".
- `d4c` at `d`: Admin → Users, an opened row with typing, Logout pressed — "The open row has unsaved changes. Log out
  and lose them?" — "Discard and log out" · "Keep editing".
- `d4d` at `d`: Inputs settings → Calendar → Add a holiday with a name typed (a window with no question of its own),
  Logout pressed — "This window has unsaved changes. Log out and lose them?" — "Discard and log out" · "Keep
  editing". If Logout cannot be reached over that window on a desktop (a shade covers the bar), say so and draw it
  over a window where it can.

**D5 — where the note stands between a phone and a desktop.** At `t` and `ps`, an Input window open (or, where the
squadron control cannot be reached over it at that size, the first window where it can), 149 picked: `d5a` the note
just under the control pressed (as on a desktop), `d5b` the note at the foot (as on a phone). And at `p`: a window
whose own buttons stand at the foot of the phone (find one where the squadron control is still reachable — Inputs
settings, the Calendar window or My leave), 149 picked from ☰: `d5c` the note at the foot (D2590) and `d5d` the note
at the top (today's rule for a passing note while such a window is open, D731 (1)) — so he can see which covers the
window's buttons.

**D6 — the greyed Undo's reason.** At `d`: a step made on 142, 149 picked, nothing done on 149 — the Undo button
greyed, its reason showing as the button's hover text: "Pick 142 to undo your changes there." (`d6a`). At `p`: the same
state, showing what a phone shows (a greyed button has no hover on an iPhone) — `d6b`, as it would be, nothing added.

## Your hand-back

Write it to `C:\Users\User\AppData\Local\Temp\claude\e2bface01731fdd2\3f35f52f-80e8-41e0-a951-e8a0fa3cf3ab\scratchpad\n175\drawer.md`
AND give the same text as your final message. Under 700 words: one line per picture (name · what it shows · the words
on screen, from the FACT lines · lines taken by the note); D2's two options, your recommendation and each one's cost;
anything that would not draw and why; anything the owner should know (a note covered, cut off, wrapping to three
lines, a button out of reach). No wording changes of your own — a word you think wrong is reported, not redrawn.
