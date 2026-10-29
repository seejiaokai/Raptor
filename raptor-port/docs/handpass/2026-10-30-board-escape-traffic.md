# Bug check — Escape closes the Scheduler Board; the Traffic window leaves its bar pressable (30 Oct 26)

The night of 30 Oct 26, job 4 (`claude/board-escape-traffic`, pull request — see §10). Two backlog items:
`[BOARD-ESCAPE-CLOSE]` (`OUTSTANDING.md`) and `[TRAFFIC-WIN-COVERS-UNDO]` (its evidence: `2026-10-21-schedule-pages.md` §4).
Built, walked and checked by the host (Opus 5.5) alone — "Low" tonight, no helpers. The rules: `src/ui/boardescape.ts`,
`src/ui/Modals.tsx` (AirPop); the contracts: `docs/ui-contracts.md` §Closing the board.

## Questions waiting for him

None for this job. One filed for later, not put to him (D994): `[SCHED-CTRL-Z]` — should Ctrl+Z / Ctrl+Y press Undo /
Redo on the schedule pages, as on the Tracker (recommended yes). Nothing in this job waits on it.

## 1. The eight questions and the tier

1. Money (OIL) — NO: nothing earns or is worked out differently; the Traffic window writes `traffic`, which earns nothing.
2. The published record — NO: no publish, sign-off or amendment path changed; an Undo pressed over the window is the same
   Undo as before, its amendment marks unchanged (the Traffic `tr:` funnel, `markEdit`, untouched).
3. Saved data — NO: nothing new is stored; `AIRRID` is a window's view state, cleared with it.
4. A shared drawer — NO for marks; the veil is the Traffic window's own (`.airpop.air-below`), the shared `.airpop` rule
   is unchanged.
5. A new gesture or mode — YES: Escape on the board; Undo / Redo pressable over a window.
6. A new surface — NO.
7. Roles — NO: the window's admin / member split is unchanged.
8. The warning list — NO.

**Tier: WALK** (question 5). The rulings swept: D349 (the board's one exit, ✓ Done — its reading (a): Escape still closes
the board), D1011 (Escape in a board box puts the old time back), D1012 and D1020 (a calendar's lists close first), D641
(a window leaves the page behind it working — its windows are the calendar job's, with no veil), D686 (a finger on a
window never scrolls the page behind), D66 (the ALL AVAIL window closes on a page change — the precedent for the Traffic
window's page and week closes), D1106 (a window over the board opens below its bar), D347 (no Undo on View-only Sched),
D812 (the design guide §2: Escape closes what opened last; the keyboard returns to what opened a thing; focus visible).
Each is held by a walk step or a test below; none contradicts another.

## 2. The roll-call (the order's §6)

### What opens the board, and every way out

| Place | Escape now | Because / proved by |
|---|---|---|
| The edit week's day date (`.dt.sb-open`, a press) | closes it | E1, E2 (all three worlds); `boardescape.test.tsx` |
| An Undo that reopens the board after a week load (`undo-wire.ts`, `BOARD_WAS`) | closes it | the listener is wired on the board being open, whatever opened it (`SchedBoard.tsx`); not walked — no other route differs |
| A day step across a week (`boardDayStep` — the board closed and reopened in one paint) | stays wired | the board never shows closed between, so the listener stays; walked as part of nothing new — unchanged code |
| By the keyboard | MISSING — the date takes no keys | filed `[BOARD-OPEN-BY-KEYS]` (older) |
| ✓ Done | closes, the keyboard off the hidden board | E2a; `boardescape.test.tsx` "✓ Done pressed by the keys…" |
| A page change, the bell, a sign-out | close, as before | unchanged (`setPage`, `resetSession`) |

### What can lie over the board, and who answers Escape

| Over the board | Escape | Because / proved by |
|---|---|---|
| The Traffic window | the board stays (the window does not close on Escape) | E4a (three worlds); unit; e2e; the window's own Escape filed `[VEILED-WINDOWS-BAR]` |
| The changes window (History) | the board stays | E4b (three worlds); unit; break 6 (unit) |
| The ALL AVAIL window | the board stays | the same flag line as the changes window (`AVAILWIN`), break 6 red; not walked |
| The ⋯ menu (phone) | the menu closes, the board stays; the next Escape closes the board | E4c (P, PW); unit; break 5 |
| The small menus (+ Block, Templates, plans, stores, + Wave — `.wavemenu`) | the board stays (the menus do not close on Escape) | unit (+ Block); filed `[VEILED-WINDOWS-BAR]` |
| Sort all, the cancel reason (CX) | the board stays | unit (Sort all); `windowOverSchedule` names both; CX not walked |
| The templates and plans windows (`useEscClose`) | the window closes, the board stays | `windowkeys.test.tsx` (unchanged, green) — their listener stops the key before the board's |
| A question sheet (OIL, upchit, covers other days, no document, medical clash) | the sheet answers | `topSheet()`; not walked — no route to them from the board's keys differs |
| The input window, day details, document viewer, Insights, the week calendar | the board stays | their flags (`windowOverSchedule`) and the veil (`.airpop:not([hidden])`); not walked |
| A date box's calendar | the calendar answers (its listener stops the key) | `DateBox.tsx` (unchanged); not walked |
| The bell's list | it closes; the board stays (read before it closes) | break 5's design; not walked over the board |
| A picked seat (`ARM`) | put down first; the next Escape closes the board | unit; break 3 |
| A drag under way | the board stays | `overBoard` (`.tdrag`, `.dnd`, `.rowdrag`, `.secdrag`); not walked |
| The history bubble, a passing note | not windows: Escape closes the board, they go with it | `closeBoardDialogs` (unchanged) |

### Every window that lays the `.airpop` veil (the Traffic item's roll-call)

| Window | Bar pressable over it | Because |
|---|---|---|
| Traffic (`AirPop`) | YES — fixed | this job |
| Day details (`DayPop`) | NO — filed | read only; D641 does not plainly cover it (`[VEILED-WINDOWS-BAR]`) |
| The schedule's input window (`#inpEditPop`) | NO — filed | an editing form; an Undo behind it could leave its draft stale — the agent's call later, with a test |
| The document viewer, the week calendar | NO — filed | as above |
| Cancel reason, Sort all, upchit, no document, covers other days, medical clash, the OIL question | MUST NOT | each is a question: a change behind an unanswered one is what it exists to stop |

### Where the Traffic window opens, and the bar's controls over it

| Place / control | Result | Proved by |
|---|---|---|
| Edit Schedule's week | veil from the top bar's foot; Undo / Redo pressable and read back | T1–T3, T6 (three worlds); e2e |
| The Scheduler Board | veil from the board's bar; its Undo pressable | T7 (three worlds); e2e |
| View-only Sched (admin) | veil from the top bar's foot; the bell pressable (the page has no Undo, D347) | T10 (D) |
| Undo, Redo | keep the window open, its list read back | T1, T2, T3, T6b, T7; unit; breaks 9, 10 (unit), 4 (browser) |
| The bell | closes the window first, its list on top | T4 (three worlds); unit; e2e; breaks 9 (unit), 5 (browser) |
| A page tab | closes the window, the next page clear | T9 (D); unit (by any route); break 11 |
| ✓ Done (board) | closes the window, then the board | T8 (three worlds) |
| The other bar controls (the changes clock, the menu, Insights, Logout, the board's calendar, day arrows, search, highlight chips, ⋯, History, Templates, Sort all, OIL Earn) | close the window first | one capture listener for the whole bar (`Modals.tsx`), the bell standing for them; not each walked |
| A press on the veil | closes the window, as before | T5 (three worlds) |
| A week change; an undo that moves or removes the wave | closes / follows / closes | unit; breaks 12–14 |

No blank cells; every MISSING has a disposition (filed).

## 3. The sizing lines (§7.0, `walk-ledger.md`)

1. **Type:** C (a new gesture — Escape on the board; a press newly reachable over a window) and E (layering — where the
   Traffic window's veil starts).
2. **What only a walk could find:** whether a real press at Undo meets it over the window (jsdom lets every click through);
   where the box lands against each bar at his PC's and his iPhone's size and on a short screen; whether Escape with real
   keys in a real engine (WebKit) reaches the board after the windows' own listeners; what the iPhone's pressed state
   shows right after a tap; focus visible on a board button.
3. **The ledger:** walks of type C/E by the host alone, one script, both sizes, ran 2–15 minutes and found 1–2 faults
   each (29 Oct 26 rows); the windows-and-Escape night (24 Oct 26) found this item's fault by walking Escape.
4. **The walk chosen:** the host alone, one script (`scripts/handpass/bet-walk.mjs`), three worlds — D: Chromium started at
   125%, 1536 × 730 (1229 × 584 page pixels — itself a short screen); P: WebKit 402 × 874 at 3x, touch, the board's phone
   layout; PW: the same with the board's Desktop layout (the ⋯ menu). 26 steps a world (E1–E5, T1–T10), both orders of
   the new gesture (Escape → Done → reopen → Escape; Escape in a box → Escape), Escape with a window up then again, a
   picture within 100 ms of each phone tap. Beyond the required sizes: a phone on its side (874 × 402) in the browser
   spec for the long list. Left to tests: every listener order jsdom can hold (the ⋯ menu, a picked seat, a held key, a
   week change, an undo moving or removing the wave, the log's "before") — `boardescape.test.tsx`,
   `trafficwin.test.tsx`, through the App's real buttons except where §6 says the state was set directly.
5. **After the walk:** its row is in `walk-ledger.md` (30 Oct 26).

**§7.11, lesson by lesson:** (1) one state only — the window empty, one line, fifteen lines, over the week and over the
board (T1, T6, T7); (2) a gesture at one speed — no drag in this change; taps at ordinary speed; (3) feedback — after
Escape the week shows on the board's day, after Undo the list changes in the window (pictures E1, T1); (4) a press on
the page behind — the window is veiled (not D641's); its bar and its veil are pressed (T1, T4, T5, T9); (5) a box
against what stands over it — the box against each bar (T1a, T6, T7a; e2e long list on a phone on its side); (6) what
only the real phone draws — nothing handed to the phone; an iPhone's hardware-keyboard Escape is driven in WebKit, his
own look is not needed; (7) a modelled phone motion — none; (8) an approved drawing — none for these; (9) a list's
alignment — no list drawn; (10) a way back — ✓ Done then reopen (E2), a page tab and back (unit); (11) a reading that
depends on how much fits — the veil's top follows the bar's real height: measured with the two-line bar at 1229 (103)
and the phone's (49), and at 874 × 402; (12) a window opened from one page only — from the week, the board and View-only
Sched (T10); (13) a pinch — none; (14) a keyboard walk's boxes — the window's line typed on the phone (T3); (15) a
pinned bar letting things through — the veil now stops at the bar's foot: pictures show the bar's own fill above it, no
seam (D 29, P 44); (16) a warning cleared by a value — none.

## 4. The walk — results (`scripts/handpass/bet-walk.mjs`, the frozen build of commit 5715197c1, served from its own folder on 4189)

**76 of 76 checks: 73 PASS, 3 RECORDED, 0 FAIL** (`../img/handpass/2026-10-30-board-escape-traffic/results.json`).
Pictures: `../img/handpass/2026-10-30-board-escape-traffic/D/` (26), `P/` (49), `PW/` (51) — 126.

| Step | What | D | P | PW | Pictures (D) |
|---|---|---|---|---|---|
| E1 | the board open, the keyboard nowhere; Escape closes it — picture right after and settled | PASS | PASS | PASS | 02, 03, 04 |
| E2 | ✓ Done; reopen; Escape closes it again (the other order) | PASS | PASS | PASS | 07, 09 |
| E3 | a take-off typed "2359", Escape: the old time back, the box left, the board kept; the second Escape closes it | PASS | PASS | PASS | 11, 12, 13 |
| E4 | Escape with the Traffic window over the board — both stay; with the changes window — the board stays; the ⋯ menu (phone) — it closes, the board stays; then Escape closes the board | PASS | PASS | PASS | 16, 19, 21 |
| E5 | Tab onto a board button: its ring drawn (1.6px cyan, the app's); Escape closes the board, the keyboard off it | PASS | — | — | 23, 24 |
| T1 | the window opens below the top bar; a press at Undo's middle meets Undo; Undo takes the added line back, the window open | PASS | PASS | PASS | 26, 29 |
| T2 | Redo puts it back | PASS | PASS | PASS | 31 |
| T3r | Undo pressed while a line is still being typed: greyed at the press — the press leaves the box, which saves the line, and the same press takes it back | RECORDED | RECORDED | RECORDED | 33, 34 |
| T3 | the typed line taken back, the window open | PASS | PASS | PASS | 34 |
| T4 | the bell: the window closes, the bell's list on top | PASS | PASS | PASS | 36 |
| T5 | a press on the veil below the bar closes the window | PASS | PASS | PASS | 38 |
| T6 | fifteen lines: the box below the bar and on the screen; fourteen Undos take them back with the window open | PASS | PASS | PASS | 40 |
| T7 | over the board: the box below the board's bar; its Undo takes the line back | PASS | PASS | PASS | 44, 47 |
| T8 | ✓ Done with the window open: the window closes, then the board | PASS | PASS | PASS | 49 |
| T9 | a page tab with the window open: Inputs opens, the window closed | PASS | — | — | 52 |
| T10 | View-only Sched: the window below the top bar, the bell pressable | PASS | — | — | 55 |
| ERR | no console error, page error or 4xx | PASS | PASS | PASS | — |

**The script's own first-run failures** (each fixed in the script, the step then walked): a box read by a locator that
matched the board's two copies of the take-off box; the phone's board opened from a day off the screen (the week
stands on Monday — the phone opens it from the day in view); the page left scrolled down before a date press; a
Playwright click refused on the greyed Undo (a person's press at its middle is what T3r now records); View-only Sched
asked for an Undo it rightly does not carry (D347). None is a fault of the app.

**Opened by the host** (D1271): every picture behind a deciding step — D 29 and 44 (the bar unveiled, the box below it),
D 23 (the focus ring), P 27a (the pressed Undo, no tint left on it), P 36 (the bell's list on top), P 44 (the board's
phone bar unveiled). No tint, see-through cell or shifted box shows only in a pressed picture.

## 5. The orders, and what the screen said

| Order | Result |
|---|---|
| Escape → (board closed) → open → ✓ Done → open → Escape | closed each time (E1, E2) |
| a box: type → Escape → Escape | old time back, box left, board kept → board closed (E3) |
| a window up → Escape → close the window → Escape | board kept → board closed (E4) |
| the ⋯ menu → Escape → Escape | menu closed → board closed (E4c; unit) |
| a seat picked → Escape → Escape | seat down → board closed (unit) |
| Traffic: add → Undo → Redo → Undo | the line gone → back → gone, the window open throughout (T1, T2) |
| Traffic: type → Undo (greyed at the press) | the press saves and takes back the line (T3r, T3) |
| Traffic: add → Undo → type → leave | the log's "before" is what the Undo left (unit; break 15) |
| Traffic: a wave deleted → open on the next → Undo | the window follows its wave to its new place (unit; break 13) |
| Traffic: a wave added → open on it → Undo | the window closes with the wave, nothing thrown (unit; break 14 — on `main` it threw) |

## 6. Cases carried by a test, each with what it proves

| Test | Claim | Through |
|---|---|---|
| `src/ui/boardescape.test.tsx` (15) | every Escape order above; the windows over the board; a held key's repeat; the search box left; the keyboard's way back | the App's real buttons and keys; the keyboard's way back sets the keyboard on a week control directly (no route puts it there today — `[BOARD-OPEN-BY-KEYS]`) |
| `src/ui/trafficwin.test.tsx` (9) | Undo / Redo read back; the log's "before"; the bell and a page tab close it; a page change by any route; a week change; the week reset alone; a wave moved or removed by an undo | the App's real buttons (Undo, Redo, the bell, a wave's ✕, + Wave); the page and week changes call the app's own `setPage` / `loadWeek`, and the week reset is the registry entry itself |
| `e2e/board-escape-traffic.spec.ts` (9) | the real press at Undo meets it (top bar, board's bar) at his PC's and iPhone's size; the box below the bar, a long list on a phone on its side and his PC; the bell's list on top; Escape with real keys | a real browser (Chromium), real presses |

**Red on `main` first:** `boardescape.test.tsx` 10 of 15 red (the five green are the windows that already kept the board,
pinned as the half that must not change — the order's §8.7); `trafficwin.test.tsx` 7 of 8 red (Undo keeping the window
open was already true in jsdom, which has no veil — the browser spec carries it); `e2e/board-escape-traffic.spec.ts` 7 of
7 red ("a press at Undo's middle meets Undo, not airpop"; the bell's click timed out; "Escape closed the board"). Run in a
copy of `main` (`git archive`, `C:\rmbe`, its `node_modules` joined), with `boardescape.ts` stubbed to export nothing.

## 7. Break tests (§8.4)

Unit (`scripts/handpass/breaks.mjs scripts/handpass/breaks/bet.json`): **15 of 15 caught.** Two first stayed green and
were read: break 7 (the keyboard's way back cut) — its test never moved the keys off the opener, reading (2): the test
now presses Escape from a board button; break 12 (the week reset cut) — the wave's own id closes the window on a week
change too, reading (4), a second guard: a test now pins the week reset on its own.
Browser (`scripts/handpass/breaks-browser.mjs scripts/handpass/breaks/bet.browser.json`): **6 of 6 caught.** Break 6 (the
box not held inside the shortened veil) first stayed green at his PC's size — the veil's 22px padding absorbs the
overflow there, reading (2): the long-list test moved to a phone on its side as well, where it is red.

## 8. Errors seen

None — no console error, page error or 4xx response in any world (the ERR rows).

## 9. Not walked, and why

- The ALL AVAIL window, the input window, day details, the CX dialog, Insights, the week calendar, the question sheets,
  a date box's calendar and the bell's list over the board: each is held by the one condition line the changes window
  and the Traffic window walk (`overBoard`), and break 6 (unit) shows that line is tested; none has a route of its own.
- Each of the bar's other controls over the Traffic window: one listener closes the window for all of them; the bell
  and a page tab are walked.
- A member's read-only Traffic window: its page has no Undo, and the view is unchanged.
- His own iPhone: nothing was handed to the phone's own drawing or motion.
- The code read: not required at WALK (the order's §5 table); none run.

## 10. Gates

- On this PC: the touched unit tests — 59 files, 1773 tests, all green; the build (typecheck) green; the browser spec
  9 of 9 green (under the lock).
- GitHub's run of the pull request is the full check while the repo is public (D1086): see the pull request.

## 11. What the walk and the checks found, and each disposition

| Found | Disposition |
|---|---|
| An undo with the Traffic window open could take its wave away — the window then threw (older code made reachable by this change) | fixed, red first (`trafficwin.test.tsx`) |
| An undo could move the wave — the window would show another wave's traffic | fixed, red first |
| The log's "before" stayed from before an undo pressed over the window | fixed, red first |
| The window would have stayed over another page or week after a bar press | fixed (bar press closes; page and week resets), red first |
| The board cannot be opened by the keys | filed `[BOARD-OPEN-BY-KEYS]` (older) |
| The other veiled windows; three things not closing on Escape; an admin's editing Traffic window on View-only Sched | filed `[VEILED-WINDOWS-BAR]` (older) |
| No Ctrl+Z on the schedule pages | filed `[SCHED-CTRL-Z]`, a question for later (older) |

`Walk: docs/handpass/2026-10-30-board-escape-traffic.md · 126 pictures · 9 surfaces · 10 orders · MISSING: 0 fixed / 0 ruled / 3 filed`
