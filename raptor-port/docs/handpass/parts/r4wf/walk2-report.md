# r4wf — the second walk (25 Nov 26, sent by the host; a fresh Opus walker)

Brief: `D:/rw4/night3/walk2-brief.md` (the host's, outside the repo). Nothing under `src/` changed; no test changed.

**The build of the fix.** `D:/rw4/night3/build-fix3` (bundle `index-C-8yJleY.js`) was built at 03:58, before the last
source commit `ebff3189b` (04:09). `git diff 5b524f1ab ebff3189b -- raptor-port/src` is not empty, so the build could not
be matched to a commit by date; instead the bundle was searched for the three source changes `ebff3189b` brought over
`60e594d29` — the panel record holding its navigation generation (`{nav:…,kids:null}`), `owesBeside` (its `.some(…)`
over the owed sections) and the Blue/Red put-back wrapped in the held place (`e&&e.isConnected?UT(e,HN):HN()`): all
three are in it. No file under `raptor-port/src` changed after `ebff3189b` (the branch is clean at it). Main:
`D:/rw4/build-new3` (`index-DIr933hk.js`); for task B also the first cut, `D:/rw4/night3/build-fix2`
(`index-BZt7HLBD.js`, without the Blue/Red line). Every run's `facts.json` names the bundle its page ran; page errors
and console errors: **none on any run**.

Sizes: desktop Chromium 1440×900; his iPhone's 402×874 with touch in WebKit; for task B also desktop WebKit.
Scripts: `scripts/handpass/r4wf-w2-b.mjs` (task B), `r4wf-w2-a.mjs`, `r4wf-w2-a2.mjs`, `r4wf-w2-w3.mjs` (task A),
`r4wf-w2-probe*.mjs` (probes, no verdicts). Pictures and each run's `facts.json`:
`docs/img/handpass/2026-11-25-r4-walk-faults/walk2/<run>/` (run = `<script>-<build>-<size>-<engine>[-<round>]`).

## Task B — Astra's finding 2 (the Blue/Red question put back outside the held place)

**Outcome: the claim is proven, but only with the browser's own scroll anchoring switched off; with it on (as the test
Chromium and the test WebKit both run), nothing moves on any build.**

How the question was raised: the Logic page's switch (Blue/Red tracking on), Monday 13 Jul on the Board, the first
formation's mission "ACM" and its Remarks "DS FOR RU", Tab — the question "Working copy VL: Blue or Red?" opens under
the formation, 69px tall (picture `b-fix2-desk-chromium/b-desk-chromium-b0-question.png`). Ranger flies that wave
(take-off 12:40); his Training input 05:00–06:00 on the same day sits under Personal Inputs, below the flying section.

What redraws the flying section while the caret is below it and the question is open — tried four ways:
- **B1** — Ranger's input END typed 1300 (into his flight) then 0600, Tab: the flying section's markup does not change
  for that (it was rewritten only once, on the first cut, as a catch-up of an earlier owed write). END/REMARKS 0px on all.
- **B2 (Astra's own steps)** — the caret in a Ground Programme remarks box, "+ Line" pressed in the second wave:
  **could not be made** on any build or browser — the press takes the caret (the focus ends on the page, nothing).
- **B3 (a person's path, keyboard and pointer)** — a callsign typed in the SECOND wave with Tab (the flying section is
  now owed, the caret still in it), the page scrolled so Ranger's END is mid-screen, END clicked, a time typed, Tab.
  On the fix the section left is painted at the click (Fable's B3 fix); on the first cut at the Tab. Either way the
  flying section is rewritten with the question open and the caret in Personal Inputs below it — the claim's state.

B3's numbers — how far the box holding the caret moved on screen (END across the click, REMARKS across the Tab), the
scroll of the Board's list, the focus kept:

| Build | Scroll anchoring | Desktop Chromium | Phone WebKit 402 | Desktop WebKit |
|---|---|---|---|---|
| main | on | 0 (section not rewritten — the old fault) | 0 | 0 |
| first cut, no line (fix2) | on | 0 (rewritten at the Tab) | 0 | 0 |
| the fix (fix3) | on | 0 (rewritten at the click) | 0 | 0 |
| main | **off** | 0 | 0 | 0 |
| first cut, no line (fix2) | **off** | **+85px**, scroll 2971→2886, question −1805→−1720 | **+117px**, scroll 5878→5761 | **+77px**, scroll 2935→2858 |
| the fix (fix3) | **off** | 0 | 0 | 0 |

The caret stayed in its box in every row (the value and the box kept); the question was open after every step, once.
"Anchoring off" is one style added by the script (`overflow-anchor:none` on everything), so the app's own guard is
measured alone. Pictures: `b3-<build>-<size>-<engine>-<on|off>/b-*-B3-after-click.png`, `…-B3-after-tab.png` (the
decisive one: `b3-fix2-phone-webkit-off/b-phone-webkit-B3-after-tab.png`, REMARKS lit, 117px lower than before the Tab).

Reading, for the host: the operation-order defect Astra named is real — without the line the question's return moves
the box he is in by about its height (77–117px); with the line it holds. In both test browsers the browser's own scroll
anchoring already hides it. Not checked: whether his iPhone's Safari anchors this list (I could not run his phone);
where it does not, the line is what holds the box. On `main` the state cannot arise (nothing of the day is rewritten
while the caret is on the Board).

## Task A — each order, each build

Words: PASS / FAIL / RECORD / COULD NOT BE MADE / NOT WALKED. "main" = `build-new3`, "fix" = `build-fix3`.

| Order | main desktop | main phone | fix desktop | fix phone | Pictures (`walk2/`) |
|---|---|---|---|---|---|
| W2 (b) ALL AVAIL input, start 0730 under Personal Inputs, Tab | FAIL | FAIL | PASS | PASS | `a-*/a-*-W2b-after-tab.png` |
| W2 (c) leave 08:00–17:00 for Ranger, end 0900 in Unavailable, Tab | FAIL | FAIL | PASS | PASS | `a-*/a-*-W2c-before.png`, `-after-tab.png` |
| W2 (d) phone's folded Personal Inputs, Ground Programme START 0915, Tab | PASS | PASS | PASS | PASS | `a-*/a-*-W2d-*.png` |
| W2 (e) "abc" in the input's start, Tab | PASS | PASS | PASS | PASS | `a-*/a-*-W2e-note.png` |
| W3 one man's row of a shared timed leave, three edits | **FAIL** | **FAIL** | **FAIL** | **FAIL** | `w3-*/w3-*-caret-still-in.png`, `-caret-left.png` |
| W8 the box holding the caret, measured at every Tab | PASS | PASS | PASS | PASS | (numbers in each run's facts) |
| W9 "xyz" half typed on the lower row, Reject on the upper | RECORD | RECORD | RECORD | RECORD | `a2-*-r2/a2-*-W9-*.png` |
| W10 the Tab route across sections, Shift+Tab back | PASS | PASS | PASS | PASS | `a-*/a-*-W10-route-end.png` |
| W10 Personal Inputs dragged above Ground Programme, then 0900 / 1130 typed | FAIL | FAIL | PASS | PASS | `a2-*/a2-*-W10d-*.png` |
| W5 (a) Undo ×3, Redo ×3 after the drag (no caret — see W4/W5/W7) | PASS | PASS | PASS | PASS | `a2-*/a2-*-W5a-*.png` |
| W4 / W5 (a) / W7 with the caret kept through the press | COULD NOT BE MADE | same | same | same | `a-*-r3/`, `a-*-phone-webkit-r4/` |
| W11 the member (Ranger) — no box takes typing | PASS | PASS | PASS | PASS | `a-*/a-*-W11-member.png` |
| W11 a frozen look (an issued version) and back to live | PASS | PASS | PASS | PASS | `a2-*-r2/a2-*-W11f-*.png` |
| N1 (b) the Board's take-off box, 60 letters, Tab | PASS | FAIL | PASS | PASS | `a-*/a-*-N1b.png` |
| N1 (c) an input's start under Personal Inputs | PASS | FAIL | PASS | PASS | `a-*/a-*-N1c.png` |
| N1 (d) the same input's start on the week | PASS | FAIL | PASS | PASS | `a-*/a-*-N1d.png` |
| N1 (e) an Unavailable row's start | PASS | FAIL | PASS | PASS | `a-*/a-*-N1e.png` |
| N1 (f) a duty or wave template's time box | NOT WALKED | | | | — |
| N4 the long note with an input's window up | RECORD | RECORD | RECORD | RECORD | `a-*/a-*-N4-window-up.png` |
| The other places (week, Inputs page, bell) after a change on the Board | FAIL (Board row only) | FAIL (Board row only) | PASS + RECORD | PASS + RECORD | `a2-*-r3/a2-*-OTHER-*.png` |

### What each showed

- **W2 (b)** — Training for ALL AVAIL, Wed 15 Jul 08:00–09:00. main: stored 07:30, the Common Programme still shows its
  row at 08:00 (starts "07:45, 08:00"). fix: the row reads 07:30 at once and sits first in time order ("07:30, 07:45");
  the caret went on to END, its box 0px.
- **W2 (c)** — the warning list followed at once on both builds (21 issues · 9 warnings → 18 · 7). Available crew: main
  not rewritten, Ranger not in it; fix rewritten, Ranger in it at once. His puck on the flying line kept its marks on
  both (he still clashes with Sim EP-4 at 12:00) — RECORD. The caret went to REMARKS, 0px.
- **W2 (d)** — the folded heading "PERSONAL INPUTS 1 input · 1 on programme" kept its count; opened, 09:15. Both builds.
- **W2 (e)** — "abc is not a time. Try 0900 or 09:00."; the box back to 08:00; the Ground Programme row 08:00; stored 08:00.
- **W3 — a fault, on both builds (older than this change, not caused by it; new data is hurt).** A leave (LL) for
  Ranger and Hex, Wed 15 Jul 08:00–10:00; on the Board's Unavailable list, Ranger's row: start 0900 Tab, end 1100 Tab,
  remarks "own hours" Tab. Expected: Ranger 09:00–11:00 "own hours" on an input of his own; Hex 08:00–10:00, no remark.
  Seen (store read after each Tab, identical on main and fix, desktop and phone): the first Tab splits Ranger out — a new
  leave for him 09:00–10:00, the shared one now Hex's alone — but his row on screen keeps the shared leave's address
  (the section holding the caret is not redrawn under him), so **the end 1100 and the remark "own hours" are saved onto
  HEX's leave**. Once the caret leaves: Hex 08:00–11:00 "own hours", Ranger 09:00–10:00, no remark
  (`w3-fix3-phone-webkit/w3-phone-webkit-caret-left.png`). While the caret is in it, the screen shows Ranger 09:00–11:00
  "own hours" and Hex 08:00–10:00 — neither true. Stopped there; nothing fixed.
- **W8** — every Tab measured the box the caret landed in before and after: 0px in W2 (b)–(e), W10 (re-ordered day),
  W11, task B (anchoring on), on both builds and sizes. W2 (c) on the fix is W8's own case — Available crew, above the
  caret's section, rewritten with a man more — and the box held at 0px.
- **W9** — "xyz" ends on the lower input only (its Ground Programme row and its own Personal Inputs remark — one
  input); the upper input rejected. Same on both builds. (The first run's FAIL word was the script's, reading the
  lower row's old place; the re-run `a2-*-r2` reads its new place.)
- **W10** — route from the input's Ground Programme START: its END, REMARKS, then each Ground Programme row in order,
  its scheduler-notes box, then Personal Inputs' boxes; Shift+Tab retraced the last four. Identical on both builds, desktop and
  phone. (The phone run's FAIL word in `a-*-phone-webkit/facts.json` is the script's: it added the wrong scroller to
  the boxes' tops; the order is the desktop's.) The re-ordered day: Personal Inputs dragged by its grip above Ground
  Programme (no "set as default" question came); main kept the Ground Programme row at 08:00 / 10:00 (the old fault),
  the fix read 09:00 and 11:30 at once, each section once.
- **W4 / W5 (a) / W7, the caret kept through the press — no person can make it.** Tried: desktop click — OIL Earn and
  Undo take the focus themselves; the "Sun 19" day button changes the day and leaves no focus. Phone tap — Undo and
  "› Next" leave no focus; OIL Earn on the phone sits behind "⋯ More", whose tap leaves no focus. The keyboard — 40 Tabs
  from the box reach text boxes and Personal Inputs' "Reject" button only, never OIL Earn, Undo or the day arrows.
  Same on both builds. W5 (a) walked without a caret instead: each section once after every Undo and Redo; the third
  Undo took the drag back (Ground Programme above Personal Inputs again), Redo put it back.
- **W11** — Ranger signed in: no box on the schedule takes typing. Frozen: no issued version existed in the demo week,
  so Wed 15 Jul was published through the Board (the four sign-offs, Publish day — "Wednesday published and approved"),
  a Ground Programme start then changed live; the plans selector's issued row opened the frozen look: no box takes
  typing ("1234" typed into its first box left 07:45); back to live by the selector, 0610 typed and Tab saved, the caret
  on the next box. Both builds.
- **N1 (b)–(e)** — desktop: the note 577 wide, one line, inside (both builds). Phone: main — letters to 399 against the
  note's inner edge at 373 (past its border); fix — to 372 against 373, two lines, 12px from each side. Each box back
  to its stored time.
- **N1 (f)** — NOT WALKED: no duty or wave template time box was found that takes typing within the time; the note is
  the one element every door uses, and four doors were measured.
- **N4** — raised by the app's own note call with an input's window up (no time box in that window takes letters):
  phone — at the top (10px), 12px from each side, two lines; main's letters run to 399 against 373 there too, the fix's
  stay inside. Desktop — at the foot, as without the window. "OIL not answered" standing: NOT WALKED.
- **The other places** (an input changed on the Board to 09:00–11:30 "bring kit", ✓ Done): the week's rows, the Inputs
  page's day card ("LATE 09:00–11:30 Ranger TRAINING Range brief · bring kit By Saber") and the store agree on both
  builds; main's Board Ground Programme row showed 08:00 / 10:00 / no remark until it closed (the old fault). The bell:
  the scheduler's list empty on both; Ranger's: "Remark changed", "Now 09:00–11:30", "Now 09:00–10:00", "You were
  added" — the same lines on both builds (RECORD).

## Not walked, and why

N1 (f) (above); N4's "OIL not answered" bar; W7's other kinds of box (AREA, stores, In-time line) and the Calendar
jump with the caret kept — the press is the same kind and takes the caret; the "picture within 100ms of the lift" on
the phone was not taken (settled pictures only).

## Count

FAIL on the fix: **W3** (all four runs) — the same on main, older than this change. FAIL on main only (the fault this
change fixes, shown): W2 (b), W2 (c), W10's re-ordered typing, N1 (b)–(e) on the phone, the Board row in "the other
places". Task B: proven with anchoring off (+77 to +117px without the line, 0 with it); 0 everywhere with anchoring on.
