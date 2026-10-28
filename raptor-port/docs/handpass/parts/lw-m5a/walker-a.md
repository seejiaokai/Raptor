# M5a walker A — the Balances page on a desktop, admin and member (29 Oct 26, the night)

Sonnet walker, frozen build of 92b43acf9 on 4173. Chromium at 1536 x 860 (scale 1.25) unless a row says WebKit. Scripts
`raptor-port/scripts/handpass/lw-m5a-walk-a1.mjs` … `a8.mjs` (+ `a1b`, `a2b`, helpers `lw-m5a-walk-a-lib.mjs`); pictures
`raptor-port/docs/img/handpass/2026-10-28-lw-m5a/a/<a1 … a8>/` (device scale, 1920 wide, the size of the drawings). The war's
today 25 Jan 2026. Ranger (us/us) is `bane`, Saber (ad/a) `stiff`. No code read, nothing built or edited under `src`.

**Result: 60 PASS, 5 FAIL, 10 NOT WALKED** (75 rows). No console error, page error or 4xx in any run.

Walker's notes: (1) the Undo list is session-only and is emptied by every sign-out, so Undo steps are walked inside one sign-in
(an early FAIL of mine on this was my script's, not the app's). (2) The admin's lock under the member is the **stand-in** (the
probe's `lockViaBridge`: the store's own lock writer, run between the bridge's two role switches); it names the person signed in.
(3) The 2560 and "zoomed-out" screens are a wider viewport (2560 x 1440 and 3072 x 1720), **not** Ctrl+scroll (Playwright cannot
zoom the browser). (4) The person window's desktop fault (it stands below the screen) is the host's known one: A74 pictured it
and is not counted again.

## What failed (each is a finding; the host decides)

1. **F1 — an empty box says nothing (scenario 19).** Ranger's App bal box, Ctrl+A, Backspace (box reads ""), Enter — and the same
   leaving by pressing another box. Expected (designer): refused with its reason under the box, never a silent nothing.
   Saw: the box shows 15 again at once, no words under it, no Undo step (the "abc" and "1,5" boxes do say "Type a whole number or
   a half, like 17 or 17.5"). Pictures `a1b/blank-typed`, `a1b/blank-enter`, `a1b/blank-leave`; `a1/refuse-empty`.
2. **F2 — the OIL heading does not stand over its figures (lesson 9).** The Balances page's OIL figures ("0 ›", "3.5 ›", "−1 ›") are
   set at the left of their column; their right edges end between 10 px and 23 px short of the heading's right edge and differ by
   up to 12.8 px from line to line (the 0 › ends 11 px left of the heading; 3.5 › ends level with it); every other heading
   (APP BAL, INCL., PENDING, WAR BAL, CCL, FCL, PL, EL, CL) stands exactly on its figures' right edges on all 50 lines, 61 with SANS shown. The
   drawing m5b-b1-desk sets OIL's figures to the heading's right edge. Pictures `a5/50b-oil-crop`, `a5/50-hard-cases`,
   `a3/35-lock-on` (Vector "3.5 ›", Wisp "−1 ›", Hex "1 ›"); measured in `a5` (A50, A52, and again at 2560 and 3072).
3. **F3 — a box cuts a wide figure.** Typed 10.5 into PL and −12.5 into App bal: the box shows "10.5" with the 5 half cut and "−12.5"
   with the last digit cut (123.5 and 100 fit). Pictures `a5/50b-oil-crop` (PL "10.5"), `a5/54-wide-2560` (Anvil "−12.5" and Cinch "10.5").
   (Scenario 30's "a two-digit and a three-digit figure": the three-digit ones fit; a figure with a decimal does not.)
4. **F4 — the pinned headings are see-through while the rows slide under them (D1281's kind, on a desktop).** Scrolled the page
   down: between the "LVE / OTHER LEAVE" heading line and the NAME heading line a strip of the rows underneath shows through (a
   puck, boxes, their figures), and box edges peek above and below the heading rows. Computed backgrounds are opaque on every
   cell (rgb 17 22 28), so the strip is a gap between the two sticky rows (the second pins at 30 px). Pictures `a8/80-scrolled-heading`
   (cropped), `a3/35-lock-on` and `a3/33-grade-list` (full screen, the same strip).
5. **F5 (counted with F2: A52)** — the same OIL misalignment with SANS shown (61 rows): not a separate fault.

## The rows

| # | Scenario / step | Size | Verdict | What the screen said | Pictures (in `…/a/`) |
|---|---|---|---|---|---|
| 1 | A1 the page beside `m5b-b1-desk` | desk | PASS | tabs Grid · Approvals 13 · Balances · OIL, ⚙ at x 1472; 50 rows; headings LVE / OTHER LEAVE over NAME, GRADE · AUTO + LVE ON 1 JAN, APP BAL, INCL. CARRIED FWD, PENDING, WAR BAL, OIL, CCL, FCL, PL, EL, CL; groups SXO 12, IP 8, OPS P 8, IWSO 5, OPS W 11, OCU 3, Personnel 3; Balances / Days taken, Find a person, Grades…, Lock for members | a1/01-page-top, a0-balances-top |
| 2 | A2 type Ranger's App bal 16 + Enter | desk | PASS | 15 → 16, War bal 12.5 → 13.5, incl. 2, Pending −2.5; focus stays in the box; no words | a1/02-typed-16 |
| 3 | A3 type incl. carried fwd 3 + Enter | desk | PASS | 16 incl. 3, War bal 13.5 | a1/03-typed-cf3 |
| 4 | A4 the grid's figure beside his name | desk | PASS | the grid cell reads "13.5" with "7.5" under it | a1/04-grid-figure |
| 5 | A5 Approvals' LVE BAL | desk | PASS | Ranger's five pending lines: LL Thu 29 Jan AM "13.5", LL Thu 12–Fri 13 Feb "13.5", CCL "CCL 2", PL "PL 1.5", CL "CL 0" | a1/05-approvals |
| 6 | A6 as Ranger: My leave and his row | desk | PASS | My leave "next 26 Jan · LVE 13.5 · OIL 0 · 5 pending"; his row 16 / incl. 3 / −2.5 / 13.5, 7 boxes | a1/06-member-view |
| 7 | A7a Undo of the typed incl.; screen stays (D672) | desk | PASS | incl. back to 2, App 16; Balances scrolled to 600 before and after (600 / 600); note "Undid: LVE carried fwd 2 → 3" | a1/07-undo-1 |
| 8 | A7b Undo again | desk | PASS | App 15, incl. 2, War 12.5; scroll 600 | — |
| 9 | A7c Redo twice | desk | PASS | 16 incl. 3, War 13.5 | — |
| 10 | A7d / A7e reload (scn 35, typed figures) | desk | PASS | reload signs him out; after signing in 16 incl. 3 are kept; Undo and Redo both disabled (D148) | a1/08-after-reload |
| 11 | A8a refuse 17.3 | desk | PASS | box puts 16 back; words under it "Type a whole number or a half, like 17 or 17.5" (red bubble over the next row's grade box) | a1/refuse-17-3 |
| 12 | A8b Escape on a refused box | desk | PASS | box 16, words gone | a1/refuse-17-3-esc |
| 13 | A8c carried fwd 30 over App bal 16 | desk | PASS | refused, box back to 3, words "Carried forward is from 0 to 16" (the designer expected a clamp; the build refuses) | a1/refuse-cf-over |
| 14 | A8 "abc", "1,5" | desk | PASS | each refused with the same words, old figure back | a1/refuse-abc, refuse-comma |
| 15 | **A8 empty box (scn 19)** | desk | **FAIL** | see F1 | a1b/blank-enter |
| 16 | A8 17.5, −2, .5 accepted | desk | PASS | 17.5 (War 15); Piston −2 (War −2, red); .5 shown 0.5 | a1/negative-2 |
| 17 | A9 (scn 18) focus / Enter / Escape without typing; retype the same figure | desk | PASS | nothing written; the Undo tip unchanged ("Undo — LVE balance 0.5 → 0") | — |
| 18 | A10 (scn 6) incl. only, App bal only, two Undo | desk | PASS | incl. 3 → "15 incl. 3" (Undo tip "LVE carried fwd 2 → 3"); App 16 → "16 incl. 3" (tip "LVE balance 15 → 16"); Undo once 15/3, twice 15/2 | — |
| 19 | A11 ★17 typed 16, no Enter, then Days taken | desk | PASS | box dirty; back on Balances Ranger 16, War 13.5; Undo tip "LVE balance 15 → 16"; its Undo gives 15 | a2/10-star17-taken |
| 20 | A12 ★17 typed 16, no Enter, then Lock | desk | PASS | Ranger 16 and the lock on; Undo tip "Undo — the balance lock" | a2/11-star17-lock |
| 21 | A12b (scn 47) the lock is an Undo step | desk | PASS | one Undo unlocks (Ranger still 16), the next puts him back to 15; the tip names "the balance lock" | — |
| 22 | A13 ★17 typed in Ranger's box, no Enter, then the top bar's Undo | desk | PASS | the blur saved 16 first and the Undo took it back: Ranger 15, the earlier Piston CL 2 step untouched, Redo tip "LVE balance 15 → 16"; Redo gives Ranger 16 | — |
| 23 | A14 Days taken, this period | desk | PASS | heading "DAYS TAKEN IN JAN - DEC 26"; Ranger LL 3, the rest –; picker lists JAN - DEC 26, JAN - DEC 27, + New period | a2/12-taken-26 |
| 24 | A14 View switched to a future period | desk | PASS | heading "DAYS TAKEN IN JAN - DEC 27", Days taken stays on, all 539 cells a dash | a2/12-taken-JAN_DEC_27 |
| 25 | A14c / A14d a past period (Jul 24 – Jun 25) made through "+ New period" | desk | PASS | selection words "1 Jul 24 – 30 Jun 25"; heading "DAYS TAKEN IN Past 24-25" (the period's own name, mixed case); every cell a dash | a2/12-newperiod-picked, a2/12-taken-past |
| 26 | A15 (scn 28) Find a person "rec" | desk | PASS | Find **filters**: only the OCU group and Recon's row stay, under the headings (scn 28 expected the row scrolled into view and marked; reading) | a2/13-find-rec |
| 27 | A15b no match | desk | PASS | "No one by that name on the Leave War", 0 rows | a2/14-find-none |
| 28 | A15c Find on Days taken | desk | PASS | the row under the headings | a2/15-find-taken |
| 29 | A20 Grades… opens (beside `m5c-c1-grades`) | desk | PASS | five grades: Senior pilot 16 people +36, Junior pilot 12 +33, Senior WSO 7 +21, Junior WSO 11 +18, Ops A 3 +14; the page behind stays working | a3/20-grades-open |
| 30 | A21 rename Junior pilot → "Junior pilot X" | desk | PASS | the sheet and Recon's grade box follow; Undo tip "the grades list" | a3/21-renamed |
| 31 | A22 rename to a live name; Escape | desk | PASS | "Another grade has that name"; Escape puts the old name back and the sheet stays open | a3/22-rename-duplicate |
| 32 | A23 empty name | desk | PASS | "Give the grade a name" | a3/23-rename-empty |
| 33 | A24 "+ days" 35 accepted; −1, x refused; 36.5 accepted | desk | PASS | Recon's box "+35"; −1 and x: "Type the days added each 1 Jan, like 36"; 36.5 shown "+36.5" | a3/24-days-neg, -half, -x |
| 34 | A25 reorder by drag (Ops A to the top) | desk | PASS | order sp,jp,sw,jw,opsa → opsa,sp,jp,sw,jw; one cyan landing line over the first row while dragging, the dragged row dimmed | a3/25-drag-mid, 26-drag-done |
| 35 | A26 delete a grade people hold | desk | PASS | "12 people hold Junior pilot X: they become No grade" Delete / Keep; Keep leaves it | a3/27-delete-ask |
| 36 | A27 delete confirmed | desk | PASS | Recon's box "No grade –" in amber (text rgb 242 200 121, dashed edge); the grade gone from the sheet | a3/28-after-delete |
| 37 | A28 Undo of the delete with the sheet open | desk | PASS | the grade and its holders come back in place; the sheet stays open | a3/29-undo-delete |
| 38 | A29–A31 + Grade, its refusals, Undo, ✕ | desk | PASS | "Test grade +12" added; a live name "Another grade has that name"; days x "Type the days added each 1 Jan, like 36"; Undo removes it; ✕ closes, focus back on Grades… | a3/30-add-draft, 31-added, 32-add-dup |
| 39 | A32 a row's grade box and list (beside `m5c-c1-picker`) | desk | PASS | list of five + "No grade –" under a rule; Down Down Enter picks; "No grade" sets the amber dashed box; Escape closes it, focus back on the box; Undo twice restores | a3/33-grade-list, 34-no-grade |
| 40 | A33 lock on (beside `m5c-c3-lock`); admin keeps his boxes (scn 47) | desk | PASS | switch on, cyan; Ranger's 7 boxes stay; Saber typed Ranger 14 | a3/35-lock-on |
| 41 | A34 lock off | desk | PASS | aria-checked false | a3/36-lock-off |
| 42 | A40 member, unlocked (beside `m5c-c2-desk-open-cut`) | desk | PASS | tabs Grid · Balances · OIL, no ⚙; 7 boxes, all Ranger's; every other row read only; grades as words "Senior pilot +36"; no Grades…, no lock | a4/40-member-open |
| 43 | A41 (scn 42) a tap on his grade words | desk | PASS | no picker opens | — |
| 44 | A42 (scn 45) his own write, reload, Saber reads it | desk | PASS | Ranger types 21 incl. 3 and CL 2 (War 18.5, CL "2 −1"); after a reload Saber reads the same | a4/41-member-typed |
| 45 | A43 / A72 / A73 (scn 49) no bell line for a balance change | desk | PASS | the bell proved to read: Approve all gave Ranger 5 lines ("Your leave · Thu 12 – Fri 13 Feb LL approved · Saber now" …); then Saber typed 20 and set No grade: still 5 lines | — |
| 46 | A44 member, locked (beside `m5c-c2-desk-locked-cut`) | desk | PASS | "Locked by admin" with the padlock; no box on the page; Ranger's grade as words, now "Senior WSO +21" after the admin's change | a4/42-member-locked |
| 47 | A45 (scn 46) his two typings, Undo both, Redo both | desk | PASS | each accepted while unlocked | — |
| 48 | A46 / A46b (scn 46) his Undo while locked, then unlocked | desk | NOT WALKED | the stand-in's lock lands on his own Undo stack, so his Undo is a refusal of undoing the *lock* ("Switch back to the admin view to undo that."), not of undoing his typing; cannot be separated without the real second person | a4/43-undo-while-locked |
| 49 | A47 (scn 36) the admin's member view with Balances up | desk | PASS | the page stays; badge "Saber · Member"; only Saber's row in boxes; no Grades…, no lock | a4/44-admin-member-view |
| 50 | **A50 (lesson 9) Balances, 50 lines incl. 123.5, −12.5, a pending figure, No grade rows** | desk | **FAIL** | F2 (OIL) and F3 (clipped figures) | a5/50-hard-cases, 50b-oil-crop |
| 51 | A51 (lesson 9) Days taken, 50 lines | desk | PASS | every heading's right edge on its figures' right edge, 0 px, all columns | a5/51-taken |
| 52 | **A52 (lesson 9) SANS shown (⚙ → Show SANS), 61 lines** | desk | **FAIL** | F2 again (OIL); the rest 0 px | a5/52-settings-sans, 53-with-sans |
| 53 | A53 (lesson 11) 2560 wide | desk (wider viewport) | PASS | the list stays at its width at the left, 1220 px from the name to the last figure, headings on figures as at 1536; the Sync pill appears in the top bar; the OIL note is F2 | a5/54-wide-2560 |
| 54 | A53 (lesson 11) 3072 wide (half-zoom stand-in) | desk (wider viewport) | PASS | same | a5/54-wide-half |
| 55 | A61.1 (lesson 10) back from Grid, a leave of Ranger's approved while hidden, 3.2 s idle | Chromium | PASS | first frame: 50 rows with boxes, Ranger App 14.5 / Pending −2 / War 12.5 — the settled figures | a6/chromium-way-back-1 |
| 56 | A61.2 back from Approvals | Chromium | PASS | first frame 50 rows, App 12.5, Pending – | a6/chromium-way-back-2 |
| 57 | A61.3 back from OIL (Escape first: the OIL page covers the tab row) | Chromium | PASS | first frame 50 rows, figures right | a6/chromium-way-back-3 |
| 58 | A61 the same three routes | WebKit | PASS | identical: 50 rows with boxes on the first frame, figures right | a6/webkit-way-back-1…3 |
| 59 | A62 Balances → Grid, first frame | both | PASS | 50 rows and Ranger's 90 cells drawn on the first frame (WebKit's second frame 181), figure "12.5" | a6/chromium-balances-to-grid, webkit-… |
| 60 | A63 View period changed on the Grid while Balances was hidden | both | PASS | Balances back on its Balances view (the page does not keep Days taken across leaving); Days taken's heading "DAYS TAKEN IN JAN - DEC 27" | a6/chromium-period-switch |
| 61 | A64 the bell as a way back to Balances | both | NOT WALKED | the bell holds no line that opens Balances (a Leave War line opens the grid at a date), and the slim bar's ✕ leads to Approvals / Grid | — |
| 62 | A70 (scn 12) Approve all | desk | PASS | Approvals 13 → 2 (the two left are in JAN - DEC 27, outside the list: "+2 pending in JAN - DEC 27"); the 11 approved: each App bal down by his pending days, Pending gone, War bal unchanged for 4 men with LVE pending in 2026 | a7/70-approve-all-armed, 71-approve-all-done |
| 63 | A71 one Undo puts all back; the page stays | desk | PASS | every row as before; scroll 500 → 500 (D672) | a7/72-approve-all-undone |
| 64 | A74 (scn 54) a tap on the LVE figure beside a name | desk | PASS | opens the person window (no breakdown sheet); no "figures" button on the grid; the window stands below the screen (the known fault) | a7/73-grid-after-drawer-removal, 74-tap-lve-figure |
| 65 | A75 (scn 54d) drag down the LVE figures | desk | PASS | no bar or window to give LVE | a7/75-drag-down-lve, 76-after-drag-down-lve |
| 66 | **A80 pinned headings opaque (desktop scroll)** | desk | **FAIL** | F4 | a8/80-scrolled-heading |
| 67 | **A81 a decimal figure fits its box** | desk | **FAIL** | F3 (same pictures as row 50) | a5/50b-oil-crop |
| 68 | scn 27 a newly added man and a man put back on the war | desk | NOT WALKED | needs Admin → Users; out of the time I had | — |
| 69 | scn 39 / 40 a grade changed or deleted, then 1 Jan | desk | NOT WALKED | the clock rows belong to walker D; the deletion with "No grade" (rows 35–37) was walked, the 1 Jan roll-over was not | — |
| 70 | scn 38 the grid's two lines follow View | desk | NOT WALKED | the grid, not the Balances page | — |
| 71 | scn 41 a quick flick against a slow drag in Grades | desk | NOT WALKED | only a mouse drag walked (row 34); no touch speed on a desktop | — |
| 72 | scn 56 speed with 50 rows behind (4x CPU) | desk | NOT WALKED | no timing run | — |
| 73 | scn 37 Days taken's cell matrix (a course, an OD, a half, a period off the calendar year) | desk | NOT WALKED | one period of each kind was walked for its heading and dashes only (rows 23–25); no cell-by-cell matrix | — |
| 74 | scn 35 the reload, grades, lock and which tab it lands on | desk | NOT WALKED | typed figures kept (row 10); grades and the lock were not reloaded; after a reload the person signs in again and the war opens on the Grid | — |
| 75 | scn 15 / 14 / 16 / 17 person-window rows | — | NOT WALKED | walker C's | — |

## Differences from the drawings (the host decides which are faults)

`m5b-b1-desk` (the Balances page; my picture a1/01-page-top at the same 1920-wide size):
- The Balances / Days taken switch is narrower (43–257 against the drawing's 43–316), so Find a person starts 59 px further left; its lit half is a cyan-edged chip, the drawing's is a pale tint with no edge.
- The names: the puck's callsign is centred inside its box; the drawing sets it at the left of the box.
- The OIL heading stands about 11 px to the right of its figures (the drawing's figures end on the heading's right edge) — F2.
- Not in the drawing: the see-through pinned headings (F4) and boxes that cut a decimal figure (F3).
- Equal: the group rows, the LVE / OTHER LEAVE bands, the column spacing, the grade box with its "+36", the boxes' look, the amber pending figures after CCL / PL / CL, the Saber row tint, the Lock for members switch on (a3/35-lock-on, as `m5c-c3-lock`).

`m5b-b3-desk` (Days taken): column positions are identical to the pixel (LL 517 … OD 1088); the heading's dash is a hyphen ("JAN - DEC 26") where the drawing writes an en dash ("JAN – DEC 26"); a period named by the squadron shows its own name in mixed case ("DAYS TAKEN IN Past 24-25").

`m5c-c1-grades`: the built sheet docks at the right of the page bar and covers the Grades… button (the drawing stands under it); its "+ days" boxes are wider and right-set; the rows, grips, "N people" words, red ✕ and "+ Grade" match.

`m5c-c1-picker` and `m5c-c1-nograde-cut`: match (amber dashed "No grade –", the list with "No grade –" under a rule).

`m5c-c2-desk-open-cut` and `m5c-c2-desk-locked-cut`: match (his row in boxes with the others plain; the padlock line "Locked by admin"). One small thing: in the read-only locked row the amber pending figures (−1, −0.5) sit about 2 px lower than their main figure.

`m5c-c3-lock`: matches (outlined button with padlock, "Lock for members", the switch).

## Other things seen (not judged)

- Find a person **filters** the list to the matches (others vanish); scenario 28 described "scrolled into view and marked". The refusal bubble under a box covers the next row's grade box while it shows.
- Balances' Pending still counts requests pending in JAN - DEC 27 while the View is JAN - DEC 26 (harpoon −4, ammo −0.5 stayed after Approve all; their requests are in 2027) — walker D's D1474 reading.
- ⚙ Settings still has "Show SANS" (D1221's "+ SANS" is not M5a's).
- The wide screen shows the "Sync · slow" pill in the top bar where 1536 shows a dot.
- Escape in a refused grade-name box puts the old name back and leaves the sheet open; a second Escape would close it.

## Not walked and why

Rows 48, 61, 68–75 above; also scenarios 1–5, 7–11, 13 (money, walker D) and the phone ones (walker B).
