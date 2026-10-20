# Bug check — the Insights and Logic small fixes (D994's small fixes, 21 Oct 26): `[LOGIC-REDRAW-DROPS-TYPING]`, `[LOGIC-DONE-FIRST-PRESS]`

Branch `claude/insights-logic-fixes-3416c8`, cut from `main` at pull request 553; pull request 554. Built 21 Oct 26 by Opus,
one area (the Logic page's ✎ Edit), one check (D1087). His pick (D994): the two Logic items, in his words "the Insights and
Logic small fixes ([LOGIC-REDRAW-DROPS-TYPING], [LOGIC-DONE-FIRST-PRESS])".

## 0. What each item was, what was found, and what it is now
| Item | Found (reproduced on the built app first — `scripts/handpass/logic-repro.mjs`, `-repro2`, `-repro3`) | Now |
|---|---|---|
| `[LOGIC-REDRAW-DROPS-TYPING]` — the Logic page redraws its rules just after it opens and drops a value being typed | **What asks for the redraw: every repaint of the app.** React 19 sets a `dangerouslySetInnerHTML` again whenever its OBJECT is new, not only when the markup differs (as Quals found on 19 Oct 26), and the page built a new object each repaint. On the desktop a late recheck repainted the app 1,319 ms after the page opened and the list was set again with the same 32,832 characters — new boxes, nothing visibly different. So anything that repaints the app — later, the database's arrivals every 30 s (D356) — dropped a half-typed value. | The object is made once per change of the words: nothing changed, nothing redrawn. And when the words do change (a value saved, a setting changed elsewhere) the page puts the keyboard back on the control drawn in its place, carrying a half-typed value and its caret. The browser test's retry (`oilworkstart.spec.ts` `logicLead`) is gone, as the item asked. |
| The same cause, met while reproducing — **Tab after a changed value left the keyboard in the box just left** (and keyboard-only Tab could land on nothing) | A box saves on `change`, which the browser raises as the keyboard LEAVES it, before it has moved. Writing the setting announces itself to the whole app, which repainted the list there and then; Chrome found the box it was leaving gone and gave the move up (traced: `change`, then no focus move at all). The press-remembering the page had (LGNEXT) then sent the keyboard back to the box last pressed. Older than this job; same listener family, so fixed here (the order §7.0). | The value is taken from the box at once (shown in the squadron's spelling) and applied a beat later, once the keyboard has landed; the page puts the keyboard back where it landed. Chrome also tells a box it lost the keyboard while a redraw is removing it — the page asks a moment later whether the box is still on the page before it counts that as leaving. |
| `[LOGIC-DONE-FIRST-PRESS]` — the first press of Done straight after a changed setting is lost | Measured at 402 wide: Done stood at x=338 before the press; the press took the keyboard from the box, which saved the value, which brought "Reset to standard" (its short words "Reset all") up after Done — Done moved to x=260, 77 px left, between the finger going down and coming up, and the tap landed on nothing. On a desktop the bar has room and Done did not move (one press worked there). | Done's press leaves the box alone until it is complete; Done itself saves what the box holds (or the box refuses it, as ever), then ends editing. One press at both sizes. |

## 1. The tier — the eight questions (the order's §5)
1. Money (OIL): **NO** — no rule or figure changes; the same values are saved by the same code, a beat later.
2. The published record: **NO**. 3. Saved data: **NO** — what is saved and how is unchanged (`rulesSave`); only WHEN a
box's value is applied moves, by one tick. 4. A shared drawer: **NO** — the Logic page's own list only. 5. A new gesture or
mode: **NO** — Done and the boxes exist; how they respond to a press and Tab changes. 6. A new surface: **NO**. 7. Roles:
**NO** — admin-only editing untouched (`isAdmin()` still asked at the change). 8. The warning list: **NO**.
→ **LOOK** by the questions; kept at **WALK**, as the backlog filed both items (a typed value, a press, both sizes) and
because the change is to how the keyboard and a finger behave, which only a real browser shows.

## 2. The rules sweep — every ruling that bounds the Logic page's ✎ Edit
| Ruling | What it says | Checked |
|---|---|---|
| D1080 | One tap into a Logic setting, then typing, replaces it | D2c: the box pressed after a save, "1h30" typed, reads 1h30 (not added to) |
| D936 | No passing note after a value is changed; on a phone "Reset to standard" reads "Reset all" | unit test "D936 a changed value raises no passing note" green; P03 shows "Reset all" |
| D850 | Feedback is designed into the screen — the row shows the new value and its standard | D12, P03: "Standard 3h", "Standard 12h" under the changed rows |
| D926 | A page's controls are one row | P02, P03, D02, D12: one row at both sizes |
| D521 | The Insights switch is live while editing | D7: flipped by the keys, the keyboard kept on it |
| D639 | A calendar setting's value is a door to its own window | untouched; the keeper's mark covers a door that had the keyboard |
| D928 / D930 | The "How it works" folds | D8: a fold opened stays open through a save |
| D561 | Search stays in view | untouched (the bar's own code) |
No ruling contradicts or is narrowed by this change.

## 3. The roll-call — every control in the Logic list a redraw can take from under the keyboard, and Done
| Control | Keeps the typing / the keyboard through a redraw — has it / must not, because… |
|---|---|
| A setting's box (`data-lgset`, by its place `data-lgi`) | has it — walked D1, D2, D4, D5, P1; unit tests (repaint with nothing changed; with the words changed; Tab) |
| The SC MAIN clash toggles (`data-lgkind`) | has it — walked D6 (Space, the keyboard stays) |
| The Insights switch (`data-lgmix`) | has it — walked D7; unit test "the Insights switch keeps the keyboard" |
| A row's own Reset (`data-lgreset`) | has it, and its own landing wins — walked D9 (the keyboard on the row's box), P3; unit test |
| A door to a calendar's settings (`data-lgopen`) | has it — marked by `data-lgopen`; its press opens a window that takes the keyboard (unchanged), so not walked further |
| A "How it works" fold (`summary`) | has it — marked by its fold; D8 the fold's open state survives a save (LGOPEN, unchanged) |
| Search, Filter, ✎ Edit, Reset to standard (the bar — outside the list) | must not be pulled into the list — D3: a press outside the list leaves the keyboard there; the bar is React's own, never redrawn by the list |
| Done | one press — walked D10 (mouse), P2 (finger); D11 a refused value: refused, said, editing ends |
| Leaving the page with a value typed | saved on the way out — walked D12 |

## 4. The sizing step (D607, `docs/walk-ledger.md`)
1. **Type of change:** C (how existing controls answer a press, a finger and the keys) and R (two reported faults,
   reproduced on the built app first).
2. **What only a walk could find here:** the late repaint and the abandoned Tab exist only in a real browser (jsdom has
   neither layout nor the browser's own focus move); Done's move needs a phone's width and a finger. The unit tests carry
   the keeper's arithmetic (which control, which value, which caret).
3. **What the ledger says:** small one-surface walks of type C/E by the host found 0–1 faults each, the script's own
   mistakes the commonest finding.
4. **The walk chosen:** the host alone, one scripted walk of the built bundle (`scripts/handpass/walk-logic-fixes.mjs`),
   every value typed by real keys and every press by a real mouse or finger; desktop 1440 × 900, phone 402 × 874 (his
   iPhone's width). 13 desktop steps, 3 phone steps, 36 checks, 20 pictures. Carried by tests, not walked: the half-typed
   value carried across a redraw caused by a setting changed ELSEWHERE (`logic.test.tsx` — it can only be caused from
   outside the page; the unit test changes the setting directly, which is what "elsewhere" is).
5. **After the walk:** its row is in the ledger.

## 5. The walk
`node scripts/handpass/walk-logic-fixes.mjs 4290` on the built bundle — **36 PASS · 0 FAIL · 0 NOT WALKED · 0 errors**
(the browser's error list watched throughout). Pictures `docs/img/handpass/2026-10-21-logic-fixes/walk/`, all opened.
D1 a value typed across the late repaint, Tab: all there, saved, the keyboard on the next box (D01, D02) · D2 a press on
another box saves, the keyboard there, typing replaces (D03) · D3 a press on the heading saves, the keyboard stays out (D04)
· D4 "abc" + Tab: refused and said, the live 11h shown, the keyboard on the row's Reset (D05) · D5 Enter saves, the keyboard
stays (D06) · D6 a clash toggle by Space (D07) · D7 the Insights switch by Space (D08) · D8 a fold stays open (D09) · D9 a
row's Reset, the keyboard on its box (D10) · D10 Done by mouse, one press (D11 before, D12 after) · D11 Done with a refused
value (D13) · D12 a value typed, then Edit Schedule by the top bar: saved (D14) · D13 Reset to standard (D15) · P1 a value
typed across the late repaint, a tap on the next box (P01) · P2 one tap on Done: saved, editing ended, Reset all offered
(P02 before, P03 after; Done stood at x=338) · P3 a row's Reset and Reset all by finger, Done with nothing changed (P04, P05).

**The re-walk** (after the fixes of §6a and §7): `WALK_DIR=rewalk node scripts/handpass/walk-logic-fixes.mjs 4290` —
**39 PASS · 0 FAIL · 0 errors**, pictures `docs/img/handpass/2026-10-21-logic-fixes/rewalk/`, opened. The walk's 36 again,
and the code read's F1 and F2 as checks: D14 a row's Reset pressed while that row's box is retyped — 12h, the box shows
12h (D16) · P4 a value still in its box and "Reset all" tapped at once — both settings standard (P06).

## 6. The tests and the break tests
- Unit, `src/ui/logic.test.tsx`: 8 new; 4 of the first 5 FAIL on the old page (run against `HEAD`'s file, put back), the
  fifth guards the fix's own reach (a press outside the list is not pulled back); F1–F3 for the code read. The Logic page's
  test files with `freshbox.test.tsx`: 104 / 104.
- Browser, `e2e/logicedit.spec.ts` LE1–LE4 (new), `e2e/oilworkstart.spec.ts` (its retry gone) and `e2e/kbscroll.spec.ts`:
  16 / 16 under the PC lock.
- Breaks, `scripts/handpass/breaks-logic-fixes.mjs`: each wire broken alone — the memo, the apply a beat later, the
  half-typed value carried, Done's press, Done's own save, the keeper, the flush before a reset (F1), the carried value's
  owed change (F3) — **all red**; F2's two guards (the row's Reset clearing its box; the carry refused when the setting
  changed underneath) each stay green alone and are **red together** — the second guard is pinned with the first (the
  walk-scripts guide §9, reading 4). Browser breaks, `breaks-logic-fixes-browser.mjs`: **4 / 4 red** — the apply at once
  (LE1: the abandoned Tab), the leaving decided before the rebuild's keeper (LE1), a change raised as a rebuild takes a box
  saved (LE4), the parked cursor not cleared (KS5). A second guard of the owed change ("only for a box still on the page")
  stayed green — a change raised on a removed box never reaches the list — so it was deleted too (reading 4).
  One slip: a command meant only to check the break script's syntax ran it once outside the PC lock; it put the file back
  as designed, and no other chat was running checks.
  One break of the first browser set stayed green: a guard that a removed box is not "left" — the rebuild's keeper always
  runs first, so the line decided nothing on screen; it was deleted (reading 4) and the delay itself is what is pinned.
  Bytes put back each time (`git diff --stat` clean).

## 6a. GitHub's first run — a fault the touched tests on his PC did not run
GitHub's run of `044904c81` failed one browser test, `e2e/kbscroll.spec.ts` KS5 ("one tap then typing replaces" — D1080 —
on a Logic setting, then a number in the SANS settings window opened from Logic): the "2" typed into the window's box was
never typed. Reproduced here; passes with the old page; each part of the fix undone alone (`scripts/handpass/bisect-ks5.mjs`)
— only undoing "drawn again only when its words change" made it pass. Traced (`scripts/handpass/logic-repro-ks5.mjs`): the
test blurs the Logic box by script, so the page's text cursor stayed parked inside it; the window's box, focused next by a
tap that placed no caret, then took no typing. The old page threw that box (and the stray cursor) away at the next repaint.
**Fixed:** when the keyboard really leaves the Logic list, a cursor parked in it is cleared (break B12 pins it). The lesson
for the next check: a change to a page's boxes runs every browser test that drives those boxes — found by searching the
browser tests for the page's own selectors — not only the page's own file (logged in the skill notes).

## 7. The code reads
**Read 1 — one fresh, blind Opus read (D790)**, not required at WALK; taken because the change is about timing. Three
findings, all real, all fixed and walked or tested:
| # | Finding | Disposition |
|---|---|---|
| F1 | "Reset to standard" tapped while a typed value was still waiting its beat: the value landed after the reset | Fixed — values waiting are applied first (`flushRuleApply`), in Reset to standard and a row's Reset; unit F1, re-walk P4 |
| F2 | A row's Reset pressed while that row's box was being retyped: the typing was carried into the reset box (and could be saved over the Reset) | Fixed — the row's Reset clears its own box; typing is carried only while the setting under it is unchanged; unit F2, re-walk D14 |
| F3 | A carried half-typed value was written by script, so leaving the box saved nothing | Fixed — the carried box owes its change (`oweChange`, shared with the board); unit F3 |
Its older notes: on an iPhone a keyboard put back by a redraw may drop (filed as [LOGIC-IOS-REFOCUS], a check on his
phone); a row's Reset lands by the setting's key, not its place (no setting is drawn twice since D928 — left); a refused
box's red edge now stays until the next real redraw rather than the next repaint (cosmetic — left).

**Read 2 — a fresh Opus read of the fix round alone** (the order §5, "a fix is new code"), handed only the fix commit and
the findings it answers. F1, F2, the parked-cursor clear and the removed guard: right and complete. One finding:
| # | Finding | Disposition |
|---|---|---|
| R2-1 | A carried value could be saved half-typed: a second rebuild while the box still had the keyboard made Chrome raise "lost the keyboard" on it while it was still on the page, and the owed change (the board's shared helper) paid there | Fixed in the Logic page alone (the board's helper back as on `main`): the page owes the carried box its change itself and raises it on Enter or once the keyboard has really left. The new browser test LE4 then showed more: **Chrome raises a typed box's own change as a rebuild removes it** — "1h4" saved as 1h04 before any owed change. Fixed: a change raised while the page is rebuilding its list saves nothing (the typing is carried, owed, and saved when the box is left). LE4 pins both; break B14 red |
Its older note — a box armed by a tap (D1080) owing its change could pay it as a rebuild removes it — is closed by the same
rebuilding guard (the change is ignored while the list is rebuilt). This is the last round of reads: the fix of R2-1 is
carried by LE4, its break, and the final re-walk.

**The final re-walk** (after R2-1): `WALK_DIR=rewalk2` — **39 PASS · 0 FAIL · 0 errors**, pictures `…/rewalk2/`, opened.

## 8. Gates
GitHub's run (the full check while the repo is public, D1086): `044904c81` red (KS5 — §6a); `95104b353` **green** (KS5's fix
in); `e829a9f91` (read 2's fix) running when this was written — the next chat reads it before his "merge live". On his PC: the
touched tests only (unit 104 / 104, browser 16 / 16, under the lock). His look: `docs/img/handpass/2026-10-21-logic-fixes/look/`.

**Walk:** 36 checks at desktop 1440 (mouse, keys) and phone 402 (finger), 0 FAIL, 0 errors, 20 pictures opened —
`docs/img/handpass/2026-10-21-logic-fixes/walk/`; re-walks after the fixes 39 / 39 and, after the last, 39 / 39 — `…/rewalk/`,
`…/rewalk2/`, opened.
