# Bug check — the windows and Escape (24 Oct 26, the night of 23–24 Oct, job 2)

Branch `claude/windows-escape`, pull request 570 into `main`. Three backlog items as one batch (D485):
**[BOARD-MODALS-ESCAPE]** (the Duty templates, Day templates and Plans windows close on Escape, the keyboard back on the
button that opened them), **[WINDOWS-KEEP-KEYS]** (the larger windows take and keep the keyboard), **[ARM-STRIP-STALE-TITLE]**
(the strip over the crew list follows a callsign typed after the seat was picked).

## The eight answers and the tier

1. Money (OIL, a count of who is present) — NO: no OIL, no count; the windows' own actions are unchanged.
2. The published record — NO: nothing publishes, signs or amends; the Plans window's Escape only closes it (a name half
   typed is not saved, as Escape does in every box).
3. Saved data — NO: nothing stored changes shape or is written by the new code.
4. A shared drawer — **YES**: `ui/sheetfocus.ts` is shared by every question sheet (OIL, upchit, medical clash, "no
   medical document", the board's cancel reason and Sort all); its hand-back path and its ✕-last rule changed.
5. A new gesture or mode — **YES**: Escape on seven windows; the keyboard handed back to a menu's button.
6. A new surface — NO.
7. Roles — NO (every window is still admin-only where it was; nothing about who may open one changed).
8. The warning list — NO.

**Tier: WALK** (4 and 5). Required: the gates (GitHub's run of pull request 570 — D1086), the roll-call, the door check,
the walk sized below at desktop and phone, the new key in both orders, a break test per surface, this sheet. No code read
is required at WALK; none is owed (`[NO-ASTRA-LIST]` not touched).

## Roll-call — every place these windows and the strip are drawn or opened

Columns: **has it** (the change applies here) / **must not, because…** / **MISSING**. Each row is marked SEEN and OPERATED
in the walk column once the walk has run.

| Surface / door | Has it? | Walk |
|---|---|---|
| Duty templates — the board's "+ Block" menu → pencil | has it: Escape, keyboard held, back on "+ Block" || SEEN, OPERATED — D1, B1–B4, P1 (A) |
| Duty templates — Admin → "Duty templates…" | has it: Escape, held, back on the Admin button || SEEN, OPERATED — D9 (A) |
| Day templates — the board's Templates button → Manage templates | has it || SEEN, OPERATED — D2, B3 (A) |
| Day templates — "+ Save this day as a template" (opens it pre-selected) | has it || SEEN, OPERATED — D3 (A) |
| Day templates — the week's day-head Templates button → Manage | has it || NOT WALKED — the same menu and window as D2 from another button; the keyboard's way back to a redrawn week button is proved by D4 |
| Day templates — Admin → "Day templates…" | has it || SEEN, OPERATED — D9 (A) |
| Plans — the week's day-head plans selector → Manage plans / a plan's pencil | has it || SEEN, OPERATED — D4, D5, P2 (A) |
| Plans — the board's sign strip plans selector | has it || NOT WALKED — the same menu and window as D4 from the board's copy of the selector |
| Flying waves — the board's "+ Wave" ⚙ and "N hidden · Manage" | has it || SEEN, OPERATED — D6 by the ⚙ (A); "N hidden · Manage" is the same menu item, not walked |
| Flying waves — Admin's button | has it || SEEN, OPERATED — D9 (A) |
| Week insights — Edit Schedule's top bar "Insights", View-only Sched's | has it (held, Escape) || SEEN, OPERATED — D8a, D8b (A) |
| Week insights — the board's Insights button; the phone's ⋯ → Insights | has it || SEEN, OPERATED — D7, B4, P3 (A); the board's phone ⋯ → Insights not walked |
| A request's window opened from the week or the board | has it: held (its Escape is older) || SEEN, OPERATED — D10, P4 from the week (A), D10 again after the fixes (host); from the board not walked (the same label control) |
| A request's window on the Inputs page | **must not, because** it is a window the page behind still works with (D641): it holds no keys || SEEN, OPERATED — D11 (A): the keys leave it, as they must; D12 re-walk (host) |
| The document viewer | has it: held (its Escape is older) || SEEN, OPERATED — D12 (A), re-walked (host) |
| The question sheets (OIL, upchit, medical clash, "no medical document", cancel reason, Sort all) | unchanged in what they do — the shared helper's hand-back changed under them: they must still give the keyboard back || SEEN, OPERATED — cancel reason (D13: FAIL, fixed, re-walked PASS) and Sort all (A); the four others carried by their own tests (below) |
| The strip over the crew list — Edit Schedule's crew panel | has it: follows the line || SEEN, OPERATED — D14b (A) |
| The strip over the crew list — the Scheduler Board's crew list (desktop, phone) | has it || SEEN, OPERATED — D14a, P5 (A) |

## The door check

The new doors are the Escape key on seven windows and the keyboard's way back to a menu's button. Both orders: Escape
then reopen; reopen by another door then Escape; a question sheet over a held window (the sheet's Escape first, then the
window's).

## The five sizing lines (§7.0, D607)

1. **Type of change:** C (a new key on seven windows and the keyboard's way back) and D at its edge (one shared helper
   behind every question sheet, each drawn by its own code).
2. **What only a walk could find here:** a real browser's focus — whether a press really lands in the window, whether the
   board behind it hears the Escape too, whether the redrawn week still has the button the keyboard goes back to; on a
   phone, whether a window that takes the keyboard pops the phone's keyboard or scrolls the page (it must do neither).
   The tests (jsdom) prove the order of events but not a real browser's focus, scrolling or redraw.
3. **What the ledger says:** walks of type C — 15, 8 found a real fault, 31 faults; the nearest, `[SEEN-BATCH-2]`
   (10 Oct 26, Escape in four places), was walked by the host alone and found 1 fault of its own.
4. **The walk chosen:** ONE Sonnet walker (D787), by script, from the brief
   `docs/superpowers/briefs/2026-10-24-windows-escape-walk.md`: desktop 1440×900 as admin (14 scenarios) and a phone
   402×874 by touch (5 scenarios), with a picture right after each tap holding the touched state on the phone (D1281). The
   host's own short walk proved the driver first (the Duty templates window, Escape, the keyboard back on "+ Block"). The
   tests carry: the Tab round in each window 40 times (`ui/windowkeys.test.tsx`, through the real App's controls and a
   keydown on the focused element), the strip on the board (`ui/armstrip.test.tsx`, typing in the real box). The walk drives
   each door once by the real controls.
5. **After the walk:** its row is added to `docs/walk-ledger.md`.

## Orders walked

Walker A (Sonnet 5.5) by script on the build `index-BfCwF2UF.js`, 23 scenarios: desktop 1440×900 (D1–D14, B1–B4) and a
phone 402×874 by touch (P1–P5), a picture right after each phone tap with the touched look held and a settled one (D1281).
**PASS 21 · FAIL 1 · RECORDED 1 · NOT WALKED 0.** Its report: `docs/handpass/parts/2026-10-24-windows-escape-A.md`.
The host re-walked the two fixes on the rebuilt bundle `index-DmRf5VEV.js` (`R/`, 5 steps, all PASS).

| Order | What the screen did |
|---|---|
| Escape, then reopen by another door (B3: Duty templates closed by ✕, then Day templates by Escape) | the keyboard on the second window's own button (`#sbTpl`), never on "+ Block" |
| Two windows one after another over the board (B4: Insights, then Duty templates) | each Escape closed only its window; the board stayed open |
| Escape twice (B1) | the first closed the window, the second did nothing (the board does not close on Escape at all — older, RECORDED) |
| A sheet over a held window (D12: the viewer over a request's window) | before the fix one Escape closed BOTH; after it one Escape closes the viewer, the next the window (host re-walk) |
| A question sheet's keys given back (D13: CX, then Sort all) | before the fix CX left the keyboard on the page; after it on the CX button by ✕ and by Escape (host re-walk) |
| A name half typed, then Escape (D5) | the window closed, the plan's name unchanged |

## Cases carried by a test

| Case | Test | What it proves | Real controls? |
|---|---|---|---|
| Tab and Shift+Tab stay inside each held window, 40 and 5 presses | `ui/windowkeys.test.tsx` | the keyboard never leaves the window | yes — the App's own controls; the key sent to the focused element |
| The ✕ is the last stop in a window's head | `ui/windowkeys.test.tsx` | Tab from the ✕ goes to the first control, Shift+Tab back to the ✕ | yes |
| The strip follows a callsign typed on the board after picking | `ui/armstrip.test.tsx` | the strip's words come from the line at paint | yes — the board's own callsign box |

## Pictures

`docs/img/handpass/2026-10-24-windows-escape/`

## Break tests

B1 (Escape twice) RECORDED as above; B2 (a click on the window's own empty space, then Escape) PASS; B3 (✕ then another
window by Escape) PASS; B4 (two windows over the board) PASS. The phone's checks (P1–P4): every window stood in the middle
of the screen (D997), wholly on screen, the page not scrolled, and no text box took the keys (so no phone keyboard).

## Errors seen

None — no console error, page error or failed request in any run, the walker's or the host's.

## Not walked, and why

The week's day-head Templates button, the board's sign-strip plans selector, Flying waves' "N hidden · Manage" and a
request's window from the board: each opens the same window through the same menu or label code as a door walked, from
another button (the roll-call's rows say which). The board's phone ⋯ → Insights: the same window as P3. The OIL, upchit,
medical-clash and "no medical document" sheets: their keyboard path is unchanged by this batch (the keys come from outside
the sheet, the branch the helper always took); their own tests passed (`schedule-tab.test.tsx`, `batch2.test.tsx`,
`oilconfirm-look.test.tsx` — 150 tests).

## Gates

GitHub's run of pull request 570 (D1086): GREEN on the records commit (both runs, the documents guard and the full checks); the run on the fixes' push is read before the morning report. On his PC: the touched suites — `windowkeys` 9, `armstrip` 1,
and the suites of every file touched (74 files / 1975 tests; 35 / 1054; 11 / 365; 3 / 150), all green.

## What the walk found, and each disposition

| # | Found | Older? | Disposition |
|---|---|---|---|
| D13 | The board's cancel-reason dialog left the keyboard on the page when it closed, not on the CX button that opened it | older (the dialog focused its box before the helper noted where the keys came from) | **fixed** — the helper runs first and lands the keys in the box (`SchedBoard.tsx`); test red first (`windowkeys.test.tsx`, D13); re-walked PASS |
| D12 | On the Inputs page, one Escape with the document viewer over a request's window closed both | older (the window's Escape runs before the viewer's) | **fixed** — the window leaves Escape to the topmost keyboard-holding sheet when that is not itself (`inputedit.tsx`, `sheetfocus.ts topSheet`); test red first (D12); re-walked PASS |
| B1 | The board does not close on Escape, with or without a window — though a comment in the board said it did, and the design guide says Escape closes what opened last | older (only ✓ Done closes it, D349) | **filed** — `OUTSTANDING.md` [BOARD-ESCAPE-CLOSE], with the next keyboard batch (Escape in a time box must still put the old time back first, D1011); the stale comment corrected |
| — | The walker's first phone tap on a day right after sign-in did not open the board; the same tap after a scroll to the top did | — | not reproduced; most likely the script's first touch landing as a scroll — named, not filed |

The sizing was looked at again after the two finds (§7.0): both are older behaviour in the same listener family this batch
changed, so they were fixed and re-walked rather than filed; neither shows a surface of THIS change with no proof, so the
walk's size held.

## The pictures the host opened

`A/D1-afteresc-1440` (the board still up after Escape, "+ Block" wearing the keyboard's ring) and `R/D12-after-one-escape-1440`
(the viewer gone, the request window still up, its paperclip wearing the ring). The rest were looked at by the walker, who
opened every picture it cites (D1273).

Walk: docs/handpass/2026-10-24-windows-escape.md · 93 pictures · 14 surfaces · 6 orders · MISSING: 2 fixed (D13, D12), 0 ruled, 1 filed (B1)
