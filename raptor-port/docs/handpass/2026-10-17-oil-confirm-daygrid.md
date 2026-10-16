# Bug check — the OIL question's "Only some days…" as the app's one calendar (17 Oct 26)

Branch `claude/oil-confirm-daygrid-d05aeb`, cut from `main` after pull request 527. The ruling: **D923** (15 Oct 26 —
shown pictures 2a / 2b of `docs/img/handpass/2026-10-15-two-leftovers/`: "Pic 2 & 3 yes use the new calendar format but
allow to tap separate days for this function"). The backlog item: `[OIL-CONFIRM-DAYGRID]`. Order: `docs/bug-check-order.md`.

## Questions waiting for him
None that blocks. For his look (told in the closing report, each with its picture):
- **On a phone the calendar sits straight on the question's card, with no box of its own** — the walk's fix S13 (below
  400 wide the calendar's head did not fit inside its box). On a desktop it keeps its box, as in the input's own window.
- **The count line's words:** "No days selected — tap a day to credit it" (was "…tap the highlighted days to credit
  them"): the days that take a tap are no longer tinted, so "highlighted" would be untrue. Words he has not seen.

## 1. The eight answers and the tier
1 money (OIL) — **YES**: the days pressed are the days credited (the sheet's `sel` → `row.oil`). 2 the published record —
NO: the question writes an input's answer, not a published day; a published day takes it as before (D142). 3 saved data
— NO new shape: `row.oil` as before, written by the unchanged save; but proved on the saved copy (S9: undo, redo, reload).
4 a shared drawer — **YES**: `DateCal.tsx` is every calendar's; the new mode and `only` must not reach the others. 5 a new
gesture or mode — **YES**: a tap that turns one day on or off; keys that step over faint dates. 6 a new surface — NO (the
same sheet, its grid redrawn). 7 roles — NO: a member's own input asks the same question (walked, S11); `perms.ts`
untouched. 8 the warning list — NO. **Tier: FULL.**

## 2. The roll-call
**A — every place that draws the OIL question's several-days form** (all draw `OilConfirm`, so the calendar is one body;
each is a separate way in and was walked through its own control).
| Way in | Shows the one calendar? | Tap works there? | What else is on its pixels | Walked |
|---|---|---|---|---|
| The input's window — a new input's Add (Inputs calendar, + Input) | YES | YES | the card's pinned foot (Back / Add) over the lower dates on a short screen — dates scroll above it (S14) | S1 desk / phone / side, S2–S4, S7, S8, S11 |
| The input's window — a saved input's OIL line, "Change…" (earlier answers lit) | YES | YES | as above | S5 desk / phone |
| The input's window — a saved input's dates changed, Save | YES — the same gate (`oilGate`) | YES | as above | carried by `oilconfirm.test.tsx` "a span offers…" (the same component, the same gate; the edit route itself unchanged) |
| The input's window — "Answer…" (an unanswered input) | YES — the same gate | YES | as above | NOT WALKED: the demo world holds no several-day input without an answer (probe, `scripts/handpass/ocd/probe.mjs`); the same `oilGate(…, true)` call as "Change…", walked |
| The Inputs list's row chip (desktop) | YES | YES | none | S6 |
| The question before a change (`OilWait`) — a move on the Inputs calendar | YES | YES | none (App level, over the month) | S10 |
| …a swap / add / put back / file / un-cancel | YES — the same `OilWait` body | YES | as above | carried by S10: one body (`OilWaitSheet.tsx` passes `gate.plan` straight to `OilConfirm`); the doors' own rules are `oilwait.test.tsx` |

**B — the other calendars that share `DateCal`** (must NOT change: none passes `mode="many"` or `only`).
| Calendar | Changed? | Proof |
|---|---|---|
| The input's own dates (`RangeCal`) | must not, because no `only` / `many` | S12 (a run, nothing faint, no `is-many`); `datecal.test.tsx` run tests |
| Jump to a date (`WeekCal`), the date box (`DateBox`), Admin's ranges, the Leave War's range picker | must not, as above | `e2e/datecal.spec.ts` 18 / 18 on this build; unit files of each in the full run |

**C — the styles removed** (`.rangecal`, `.rc-*` but `.rc-read`, `.oc-ask`, `.oc-off`): nothing in `src`, `e2e` or `probes`
draws them (searched); one old walk script, `scripts/handpass/icard-C-s68.mjs`, reads `.oc-ask` — not the app.

## 3. Sizing the walk (§7.0)
1. **Type:** C (a new mode of a control) and E (its look in one sheet), touching what earns OIL.
2. **What only a walk could find:** the calendar inside the card and on top at each size; a press at a point reaching the
   date; the card's pinned foot over the dates on a short screen; every way in actually drawing it; the keyboard in the
   real page. The tap and key rules in every state are unit tests (`datecal.test.tsx` "several separate days").
3. **The ledger:** walks of type C found the most in the change itself (every door and order); E walks found layout at
   the sizes nobody measured.
4. **Chosen:** the host alone, one scripted walk (`scripts/handpass/ocd/walk.mjs`), 14 scenarios: every way in once at
   least, the new-input door at desktop, phone and a phone on its side, orders of answers, a month's end, the keyboard
   alone, undo / redo / reload, a member, the other calendars, and narrow phones at 430, 400, 390, 375, 360 and 320. Repeated
   key cases are carried by the unit tests (§5).
5. **Its row:** added to `docs/walk-ledger.md` after the walk.

## 4. The walk
Built bundle served at `http://localhost:4173` (`npm run build`, the preview `raptor-walk`), a fresh demo world each run.
Pictures: `docs/img/handpass/2026-10-17-oil-confirm-daygrid/` — `walk/` (the first run, 24), `walk-b/` (the corrected
script and two new scenarios, 13), `walk-c/` (narrow phones after the fix, 6), `rewalk/` (the whole walk on the final
build, 29: **112 PASS, 0 FAIL, 0 NOT WALKED**, no error — `HP_SHOTS=…/rewalk S13_WIDTHS=430,390,360,320 node
scripts/handpass/ocd/walk.mjs`).

| # | Scenario (size) | Result | What the screen and the money said |
|---|---|---|---|
| S1 | New input Fri 17 – Sun 19 Jul, Only some days…, press Saturday, Add (desk / phone / side) | PASS ×3 | the one calendar (`dcal is-many`), on July; only 18 and 19 take a press; Saturday the thing under its own centre; "1 of 2 days selected…"; the faint Friday does nothing; saved {18: FO, 19: 0} |
| S2 | Pick Saturday, then All days | PASS | the calendar goes; both days credited |
| S3 | Pick 26th, No OIL, Only some days again | PASS | the 26th still lit; saved as No OIL: both 0 |
| S4 | Back, then Add again | PASS | nothing written, the window stays; asked again with nothing picked, on August (31 Jul – 2 Aug) |
| S5 | A saved input's "Change…" (desk / phone) | PASS ×2 | its line "credited on 1 of 2 non-working days"; Saturday lit as it opens; Sunday on, Saturday off; Save; saved {18: 0, 19: FO} |
| S6 | The Inputs list's row chip (desk) | PASS | both days lit (answered All); Sunday off; saved Saturday only |
| S7 | Fri 24 Jul – Sun 2 Aug, four days; › / a sideways finger; the lists back to July (desk / phone) | PASS ×2 | August reached; back by the month list with 25 Jul still lit; "2 of 4"; saved 25 Jul and 2 Aug only |
| S8 | The keyboard alone (desk); Escape | PASS | Tab reaches 25 Jul; → Sunday, → again over the weekdays into August; Space on; ← back over the month's end; Tab to Add, Enter; saved 1 Aug only. Escape closes the question, nothing written, the window stays |
| S9 | Undo, redo, a reload (desk) | PASS | Undo takes input and answer in one step, Redo both back; after a reload the answer is kept |
| S10 | A Mon–Wed input's bar dragged to Fri–Sun on the Inputs calendar (desk) | PASS | "Don't move" / "Move"; only 25 and 26 take a press; moved with Saturday credited only |
| S11 | A member files his own (phone) | PASS | the same calendar; saved Sunday only |
| S12 | The input's own dates calendar beside it | PASS | a run, nothing faint, not the several-days mode |
| S13 | Narrow phones 430 / 400 / 390 / 375 / 360 / 320 | **FAIL at 390, 375, 360, 320 → fixed** | the head (304px) ran past the calendar: at 390 into its own box's edge, at 360 and 320 the › arrow past the card's edge, cut (`walk-b/11-S13-360-narrow.png`). Fixed (below); after: PASS at all six (`walk-c/`) |
| S14 | A phone on its side, the keyboard: are the dates it reaches in sight? | PASS | each focused date above the card's pinned foot |

**The script's own mistakes in the first run (`walk/`), each read on its picture before it was called anything:** the
heading is drawn in capitals (case-blind match), the empty places before the 1st were counted as dates, `S5` pressed the
window's Save after the question had already saved and closed it, `S6` pressed Calendar where it meant List, `S9`
reloaded a `?fresh=1` world (memory only), and `S1-side` scrolled Saturday the "nearest" way, under the card's pinned
foot — a person scrolls it into the middle (§7.2's trap). All corrected in `walk-b/`; S14 was added to prove the keyboard
does not park a date under that foot.

## 5. Cases carried by a test
| Case | Test | What it proves | Through the real controls? |
|---|---|---|---|
| Each key from each state: → ← ↑ ↓ over faint dates and across a month's end; Home / End inside the week; nothing further that way | `datecal.test.tsx` "several separate days" | the key's landing date | key events on the calendar's own dates |
| A tap turns on / off; several at once; no run band; earlier answers lit; kept across a month's turn; the tab stop | the same | the picked set and classes | clicks on the calendar's own dates |
| The question through the real input window, a Friday that takes no tap, the count, the save | `oilconfirm.test.tsx` D923 | `row.oil` saved | the app's own window and buttons |
| At five sizes: in the card, on top, the head inside, a press at a point, the buttons in sight, the save | `e2e/oil-someday-cal.spec.ts` | the same in a real browser | yes |

## 6. Gates
The whole set under the PC lock, in one run, on `c47dfa2ae` (every code change of the job): **build clean · tfin 728 / 0 · unit 11592 / 11592 (651 files) · e2e 844 passed, 0 failed, 59 skipped · smoke 446 / 0 · rulecheck OK · docsize OK — WHOLLY GREEN.**
(A first run on `2babc476e`, before the code read's fix, passed unit 11592 / 11592, build and tfin and was stopped so the
set ran once on the final code.) Between the fix rounds, the touched files: the three unit files 127 / 127; the browser files
`oil-someday-cal` and `datecal` 23 / 23.

Walk: docs/handpass/2026-10-17-oil-confirm-daygrid.md · 46 pictures (+ 29 re-walk) · 7 ways in · 14 scenarios · MISSING: none open — 1 fault the walk found (fixed), 2 the scenario designer's (fixed), 1 the code read's (fixed), 1 filed ([CAL-ESC-LISTS]), 1 put to him (the count line's words)

## 7. The model reads
**The scenario designer (a fresh Opus reader, asked what is MISSING — 17 Oct 26), and what became of each:**
F1 Home walked back out of the week — **fixed** (`DateCal.tsx`: Home / End to the first / last of this week's dates that
take a tap, else stay; `datecal.test.tsx`, its old line changed from the 19th to the 25th and an End test added). F2 the
documents still described the old grid — **fixed** (`file-map.md`, `ui-contracts.md`). F3 narrow phones — **confirmed by
the walk (S13) and fixed**, wider than the reader thought (390 too); the 360 and 320 sizes added to the browser test.
Its scenarios: 1 (OilWait) walked as S10; 2 (the list chip asked again) S6; 3 (month and year end) S7 and the unit tests
(the year end: carried by `datecal.test.tsx`'s month-turn tests, the plan sorted — set aside for a walk: the same code
path as the month's end); 4 (a re-ask after the input is lengthened) — the same gate as S5, the calendar opening on the
plan's first day as before (the old grid did the same); 5 (a weekday holiday) — NOT WALKED: no holiday on a weekday in the
demo July, and the tap rule reads only `only` (unit-tested); 6 (HO, many weeks) — the amount comes from the plan, the
calendar only picks days (unchanged save); 7–10 unit tests and S8; 11 S13; 12 S7-phone (the swipe), the click after it
picked nothing; 13 S12 and `e2e/datecal.spec.ts`.

**The code read (a fresh, blind Opus reader — D790, D903; it saw neither the walk nor the scenario designer's report):**
nothing that credits OIL wrongly and no door missing (its roll-call matched §2: one component, three ways in); the removed
styles unused; no rule leaking to another calendar. Three low points:
- **F1 — on a phone on its side the calendar opened mostly below the card's pinned foot** (the reader's reading, worked
  out from the stylesheet). **Confirmed and fixed:** `OilConfirm.tsx` scrolls the card by what the calendar runs under the
  foot, never past its top, when "Only some days…" opens; nothing moves where it fits. `e2e/oil-someday-cal.spec.ts` now
  asserts Saturday in sight as the answer opens, nothing scrolled by the test — **red on the build before** (Saturday at
  370, the foot at 301, on the phone on its side only), green after. Picture: `rewalk/07-S1-side-opened.png`.
- **F2 — the count line reworded without his word.** Put to him (Questions, above); the file's own note that the form keeps
  its words now says which line changed and why.
- **F3 — Escape with the month-and-year lists open closes the whole question** (in the question before a swap, the swap is
  not made). The calendar's header leaves Escape to its form, and the input's own window behaves the same — older than this
  job and every inline calendar's: **filed** as `[CAL-ESC-LISTS]`, his to place.
- Not examined by it, named: a new input's OIL days take their year from the loaded week (`oilGate` → `baseYear()`) — older
  than this job; not chased here.

**The fixes' own read (§5 "a fix is new code" — a fresh Opus reader handed only the fix commits `fccb79c8a` and `fee6bdf64`
and the findings they answer):** all three right and complete, nothing broken beside them (the narrow rule's arithmetic
checked from 320 to 440 wide; Home / End never empty; the scroll the same on all three ways in, instant, idle where it
fits). One note below its bar, recorded: a DESKTOP window under 400 wide with a classic scroll bar on a card that scrolls
would lose 17px — not reachable at his 125% display without extra browser zoom; left. Last round: this one.

## 8. Break tests
`scripts/handpass/breaks/2026-10-17-oil-confirm-daygrid.json`, run by `scripts/handpass/breaks.mjs` on the committed code:
**11 of 11 caught** (`only` ignored; a tap that picks one date; the days on not lit; the keys stopping on a faint date;
Home / End out of the week; the tab stop; the mode's class; the question giving no `only`; opening on today's month; the
one-date mode; the earlier answer not handed in). The first run reported eight as "did not finish": the runner's child
process was killed for its output (3.2 MB — the whole app's page printed with a failure) past the default 1 MB. Each was
caught by hand in 12 seconds; the runner now takes the output and names a run that itself failed (`breaks.mjs`;
observation 628). **What only a browser sees, proved red in a browser:** the narrow-phone rule (the browser test at 360 and
320 red on the build before it — the › arrow at 351 past the calendar's 313) and the calendar in sight on a phone on its
side (red on the build before F1's fix).

## 9. Errors seen
None in any run (console, page errors, 4xx all watched by the walk script).

## 10. Not walked, and why
- "Answer…" on an unanswered several-day input — none in the demo world; the same gate call as "Change…" (walked).
- A public holiday on a weekday — none in the demo July; the tap rule reads only `only` (unit-tested).
- His iPhone — the app loads no font of its own, so Apple's wider letters could make the head wider than measured
  here; the head is fixed-width rooms (the title's 10em), so letters change little. On his look card.

## 11. Disposition of what was found
| Find | Who found it | Disposition |
|---|---|---|
| The head past the calendar / the card under 400 wide | the walk (S13), the scenario designer (F3) | fixed, `14-input-editors.css`; `e2e/oil-someday-cal.spec.ts` at 360 and 320 |
| The calendar opening below the pinned foot on a phone on its side | the code read (F1) | fixed, `OilConfirm.tsx`; the browser test, red first |
| The count line reworded | the code read (F2) | put to him |
| Escape with the lists open closes the question | the code read (F3) | filed, `[CAL-ESC-LISTS]` |
| The break runner killed by a long failure's output | the break tests | fixed, `breaks.mjs` |
| Home out of the week | the scenario designer (F1) | fixed, `DateCal.tsx`; `datecal.test.tsx` |
| Documents describing the old grid | the scenario designer (F2) | fixed |
