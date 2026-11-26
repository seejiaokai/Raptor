# Merge walk — walker B (Share B), 25 Nov 26

Builds: merged `D:/rw4/r183/build-merged-0ff30dbdf` (bundle `index-B9okpSpf.js`, checked by every run); main
`D:/rw4/r183/build-main-1993bed86` (bundle `index-DCU_WN_H.js`, checked by every run). Each scenario ran the same script,
unchanged, on both builds. Pictures under `docs/img/handpass/2026-11-25-r4-walk-faults/merge/r4wf-mb/<scenario>-<build>-<size>-<engine>/`.
Brief: `docs/superpowers/briefs/2026-11-25-r4-walk-faults-merge-walk-brief.md`, Share B. Logs and result files:
`.tmp/r4wf-mb/`.

Counts (24 rows below): PASS 10 · FAIL 2 (X8 (b), both builds — the same on main) · RECORD 10 · COULD NOT BE MADE 2
(the phone's Blue tap in M11, both builds; the rest of those two rows passed) · NOT WALKED 0.

## Results

| Scenario | Build | Size / engine | Verdict | What the screen and the store said | Pictures |
|---|---|---|---|---|---|
| X3 | merged | desk Chromium | PASS | Every click put the caret in the box clicked, first time (Ground remark, Hex's End, Outlaw's Remark, the Overall notes line). The moment the caret reached the Ground box, Unavailable was rewritten: Hex's row on his own new leave 09:00–17:00, no held rows, screen = store, order Ranger, Hex, Outlaw at every step. End: three leaves — Ranger alone 08:00–17:00, Hex 09:00–11:00, Outlaw's own 08:00–17:00 "C". Available crew: none of the three at any step. Warnings "10 issues · 3 warnings" → "9 issues" once Hex's end was 11:00; Hex's flying puck (wave 1) kept its red clash mark throughout (09:00–11:00 still overlaps his flight). | `x3-merged-desk-chromium/001…007` (002 at once, 003 after 1s) |
| X3 | main | desk Chromium | RECORD (old behaviour; same end) | Clicks all landed first time. While the caret sat in the Ground box, Hex's row stayed a held row (still addressed to the shared leave) until the caret left the Board; two held rows after Outlaw's remark. Values still matched the store. End store identical to merged. Warnings 10 → 9 at the same step. | `x3-main-desk-chromium/` |
| X3 | merged | phone WebKit | PASS | As merged desk: each tap one caret move, rows rewritten at once in the other section, order kept, three leaves as expected. | `x3-merged-phone-webkit/` (a lift picture beside each tap) |
| X3 | main | phone WebKit | RECORD (old behaviour; same end) | As main desk: held rows while the caret was elsewhere on the Board; same end store. | `x3-main-phone-webkit/` |
| X5 | merged | desk Chromium | PASS | Ranger first Unavailable row, Personal Inputs folded (no boxes shown). `0900` then Shift+Tab: caret in the Ground Programme's last box (its notes line); Unavailable rewritten at once — Ranger on his own leave 09:00–10:00. Tab: Ranger's Start reading 09:00; Tab: his End reading 10:00 (his); `1100` Tab: caret in his Remarks; store two leaves, Ranger 09:00–11:00, Hex 08:00–10:00. | `x5-merged-desk-chromium/001…006` |
| X5 | main | desk Chromium | PASS | The same boxes at every key (Ground notes line, his Start 09:00, his End 10:00, his Remarks); his row stays a held row until the caret leaves, then reads his own leave. Same two leaves. | `x5-main-desk-chromium/` |
| X2 shared | merged | desk Chromium | RECORD (not worse than main) | Walked on **Sat 18 Jul** — the only days of the week with no Unavailable row of their own are Sat and Sun (Wed has four seeded rows that always sit below a new one; the two first tries on Wed are listed under "Attempts"). The OD's OIL question was answered Yes by the filing helper (store `oil 0.5`). Rows: OD Hex, OD Ranger (last); Unavailable the last section. Start `0900` Tab → his End; End `1100` Tab → his Remarks; Remark `own` Tab → **focus on the page body**; Tab once more → the Board's top-bar Calendar button. "own" saved on Ranger's own duty (09:00–11:00); Hex's 08:00–12:00 untouched. | `x2-shared-sat-merged-desk-chromium/` |
| X2 shared | main | desk Chromium | RECORD | Identical focus route: body after the Remark's Tab, then Calendar. Same store. The lost focus is already on `main`, not new with the merge. | `x2-shared-sat-main-desk-chromium/` |
| X2 control (one-man duty) | merged | desk Chromium | RECORD | Remark's Tab → Ranger's **Reject** on his row; Tab once more → the Board's side grip. Remark on his duty. | `x2-solo-sat-merged-desk-chromium/` |
| X2 control (one-man duty) | main | desk Chromium | RECORD | Identical to merged (Reject, then the side grip). | `x2-solo-sat-main-desk-chromium/` |
| X8 (b) | merged | desk Chromium | **FAIL** (same on main) | See "Each FAIL in full". One press on Reject only saved the 09:00 (Ranger cut onto his own duty, still under Unavailable); a second press rejected it. Hex untouched. | `x8b-merged-desk-chromium/002-x8b-1-after-one-press.png`, `004-x8b-2-after-second-press.png` |
| X8 (b) | main | desk Chromium | **FAIL** (the same) | Identical. | `x8b-main-desk-chromium/` |
| M3 | merged | desk Chromium | PASS | Shared Meeting Ranger+Hex 08:00–12:00: one Ground Programme row, one Personal Inputs row (both men on it). Ground End cleared, then a click into the Personal Inputs Start: saved **all day** (one input, both men); Ground row blank–blank at once. `0900` Tab: saved **09:00–23:59**, one input, both men; the Ground row read 09:00–23:59 while the caret was still under Personal Inputs; every box agrees after the caret left. RECORD: in the moment the caret sat in the Personal Inputs Start (store all day), that same row's End box still read 12:00 — the caret's own section, rewritten at the Tab (then 23:59). | `m3-merged-desk-chromium/` (003/004 caret in Personal Inputs; 005/006 after Tab) |
| M3 | main | desk Chromium | RECORD (old behaviour; same store) | Same saved times at each step. After `0900` Tab, with the caret still under Personal Inputs, the Ground row's boxes still read blank–blank against 09:00–23:59 stored; they caught up when the caret left. | `m3-main-desk-chromium/` |
| M1 | merged | desk Chromium | PASS | The ALL AVAIL Meeting 10:00–11:00 drew as "ALL HANDS" under the Common Programme with a count **35** ("35 with nothing else on at that time — tap to see them"); its window opened on a tap and stayed open while Ranger's Start was clicked (caret in at the first click). `1130` Tab: caret in Ranger's End; at once the count read **36**, the open window listed 36 with Ranger and without Hex, Available crew gained Ranger (32 → 33 people), Hex in none. The same after the caret left and on re-opening the window. Store: Ranger's own leave 11:30–12:00, Hex 08:00–12:00. | `m1-merged-desk-chromium/` (002 window; 003/004 caret in Ranger's End) |
| M1 | main | desk Chromium | RECORD | With the caret in Ranger's End: the row's count still read **35** and Available crew lacked Ranger, while the open window already listed 36 with Ranger — the three disagreed until the caret left (then 36 / Ranger in all). Caret kept. Same store. | `m1-main-desk-chromium/` |
| M11 | merged | desk Chromium | PASS | Blue/Red tracking on; shared ALL-DAY leave; question "VL: Blue or Red?" open in wave 1. Ranger's Start `1800`, Tab: his End box moved **0px**, kept the caret, read 23:59; the question stayed open (one); store Ranger's own 18:00–23:59, Hex all day. Blue clicked: question gone, the Board's Undo reads "the mission role for VL — Blue" (VL = wave 1's first formation, the one asked about). The caret stayed in Ranger's End through the click. | `m11-merged-desk-chromium/` |
| M11 | main | desk Chromium | PASS | The same: 0px, question kept, Blue landed on VL, same store. | `m11-main-desk-chromium/` |
| M11 | merged | phone WebKit | PASS for the box and store; the Blue tap **COULD NOT BE MADE** | Ranger's End tapped after `1800`: box moved 0px, caret in it, reads 23:59; question kept; store right. Tapping Blue (three tries: a locator tap, then a finger at the button's measured middle twice; the button itself under the finger each time) changed nothing — question still open, no Undo entry. A control run with the caret taken out first did the same; so did main. Not about the caret or the merge — the test browser's tap on that button does nothing; a lead to check on his iPhone, not a finding. | `m11-merged-phone-webkit/`, control `m11-control-merged-phone-webkit/m11-blue-try2-lift.png` |
| M11 | main | phone WebKit | as merged | Box 0px, store right; Blue taps do nothing (also in the control). | `m11-main-phone-webkit/`, `m11-control-main-phone-webkit/` |
| M10 | merged | desk Chromium | RECORD (no FAIL condition met) | Shared ALL-DAY leave. Available crew already sits above Unavailable in this day's order (no grip drag needed). Set-up: wave 1 formation 1's own "+" added an empty line (front seat "+ FCP"). Ranger's Start `1800` Tab: caret in his End; Ranger **offered** in Available crew at once, Hex not. Mouse drag of his puck from Available crew to the empty front seat (drag ghost and the seat's drop mark seen): Ranger planted in that seat, gone from Available crew. Both leaves unchanged by the drop (Ranger 18:00–23:59, Hex all day); Hex's own seat untouched. | `m10-merged-desk-chromium/` |
| M10 | main | desk Chromium | RECORD (drag not possible) | With the caret in Ranger's End after `1800`, Ranger is **not** offered in Available crew (the section waits until the caret leaves the Board), so there was no puck to drag — the drag could not be made on main. Store as on merged. | `m10-main-desk-chromium/` |
| M8 | merged | desk Chromium | PASS | Wed signed four times (Ace, Anvil, Anvil, Anvil) and published at the first try ("Wednesday published and approved"; ORIG). Board: `0900` in Ranger's Start, a Ground box clicked → Ranger cut onto his own leave 09:00–10:00, row rewritten at once; the count read **"1 pending"** (it read "6 changes" just after publishing). The count opened "Changes · Wednesday 15/7 Published · 1 change waiting to go out as AL1", tab "To go out · AL1 1": one line "Ranger · LL … his own now — 09:00–10:00". Pressing it flashed **Ranger's own row** under Unavailable (the window stayed open). His leave name opened "Ranger · 15 Jul", person Ranger alone, 09:00–10:00. Week after closing the Board: "1 pending", "Not yet signed", "Publish AL1". Member (us/us), View-only Sched: "Original — as issued", Ranger 08:00–10:00 and Hex 08:00–10:00 — the published times. | `m8-merged-desk-chromium/001…006` |
| M8 | main | desk Chromium | PASS | Identical counts, window, press (Ranger's own row), leave window and member view; only difference: Ranger's row stayed held while the caret was in the Ground box. | `m8-main-desk-chromium/` |

## Each FAIL in full

**X8 (b) — one Reject press is not enough after a time typed and not left (merged and main, desktop Chromium).**
- Presses: Wed 15 Jul, a shared OD Ranger + Hex 08:00–12:00 filed through the Inputs page; Board; click Ranger's Start
  under Unavailable, Ctrl+A, type `0900`, do not leave it; one real mouse press (move, down, up) at the middle of
  Reject on Ranger's row — the element under the pointer just before the press was that Reject button.
- Expected (brief, Fable's X8 (b), `[EDIT-BUTTON-AFTER-CHANGE]`): one press does its job on HIS duty; Hex's untouched.
- Seen: after the one press, no note; store `OD Ranger Jul 15 09:00–12:00` (his own new duty) and `OD Hex 08:00–12:00`;
  Ranger's row still under Unavailable with a fresh Reject. A second press: note "Ranger's OD taken out of Unavailable";
  Ranger's duty marked rejected and shown under Personal Inputs ("1 input"); Hex's untouched throughout.
- `main` shows exactly the same (not new with the merge). Pictures: `x8b-merged-desk-chromium/002-x8b-1-after-one-press.png`
  (Ranger 09:00–12:00 still under Unavailable with REJECT), `004-x8b-2-after-second-press.png`; `x8b-main-desk-chromium/`.

## Leads, not findings
- **X2:** on a shared duty, Tab from Ranger's Remark (the day's last box) drops the focus onto the page body; on a one-man
  duty the same Tab lands on Reject. Same on `main` — so not a merge fault, and the brief's FAIL line does not apply;
  the host may want it filed.
- **M11 phone:** Blue on the Blue/Red question does nothing when tapped in the test WebKit, caret or no caret, on both
  builds. Unchecked on a real iPhone.

## Page errors
None on any run (every run's page-error and console-error list was empty).

## Not walked, and attempts kept apart
- Nothing in Share B went unwalked.
- X2's first two tries (Wed 15 Jul, a timed duty and then one meant to be all day — it came out 06:00–18:00) left
  Ranger above the four seeded Unavailable rows, so "Ranger the last row" could not be made on Wed; their pictures are
  `x2-shared-merged-desk-chromium/` and `x2-shared-allday-merged-desk-chromium/` — attempts, not cited. (They showed the
  Remark's Tab going on to the next row's Start, Cobra's.)
- M11 phone's first run (v2) tapped Blue once; v3/v4 replaced it with three tries and the control; the cited folders are
  the last runs.
- M10's first two runs found no empty seat (the script looked for the wrong mark); the cited runs are v2.
- Sizes: Share B's lines name the phone only for X3 and M11; the others ran on the desktop only.

## Scripts written, and the commands that ran them
All from `C:/Users/User/projects/Raptor-r4/raptor-port`, through `.tmp/r4wf-mb/run.sh <scenario> <merged|main|both>
<desk|phone|both> [VAR=value…]`, which runs, for each build and size:
`WR4_OUT=docs/img/handpass/2026-11-25-r4-walk-faults/merge/r4wf-mb/<scenario>[SUFFIX]-<build>-<size>-<engine>
WR4_NEW=<D:/rw4/r183/build-merged-0ff30dbdf | D:/rw4/r183/build-main-1993bed86> SHR_BUNDLE=<index-B9okpSpf.js |
index-DCU_WN_H.js> SZ=<desk|phone> ENG=<chromium|webkit> node scripts/handpass/r4wf-mb-<scenario>.mjs`.
- `scripts/handpass/r4wf-mb-lib.mjs` — helpers over `shr-a-lib.mjs` (results to `.tmp/r4wf-mb/`).
- `r4wf-mb-probe.mjs`, `r4wf-mb-probe2.mjs`, `r4wf-mb-probe3.mjs` — looks at the day before writing (merged, desk; output in `.tmp/r4wf-mb/`).
- `r4wf-mb-x3.mjs` — `run.sh x3 both both`.
- `r4wf-mb-x5.mjs` — `run.sh x5 both desk`.
- `r4wf-mb-x2.mjs` (v2, Sat 18 Jul) — `SUFFIX=-shared-sat run.sh x2 both desk VAR=shared`; `SUFFIX=-solo-sat run.sh x2 both desk VAR=solo`.
- `r4wf-mb-x8b.mjs` — `run.sh x8b both desk`.
- `r4wf-mb-m3.mjs` — `run.sh m3 both desk` (run as merged, then main).
- `r4wf-mb-m1.mjs` (v2) — `run.sh m1 both desk` (merged, then main).
- `r4wf-mb-m11.mjs` (v4) — `run.sh m11 both desk` (v2), `run.sh m11 both phone` (v3), control `SUFFIX=-control run.sh m11 both phone AWAY=1` (v4).
- `r4wf-mb-m10.mjs` (v2) — `run.sh m10 both desk`.
- `r4wf-mb-m8.mjs` — `run.sh m8 both desk` (merged, then main).
