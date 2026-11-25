# Walker A — Share A, the Scheduler Board's Unavailable rows (the shared-row walk, 25 Nov 26)

*Saved by the host (chat 178) from the walker's hand-back, its table and FAILs word for word — the helper's file tool
refused the report file. An Opus walker on the frozen build `.tmp/build-6c7f3aac7`; every run printed bundle
`index-BiU7Aj55.js`. Counts (final runs only): PASS 58 · FAIL 10 (3 faults) · RECORDED 46 lines · NOT WALKED 0. No page
or console error in 62 runs. Pictures: `docs/img/handpass/2026-11-25-shared-row/a/<run>-<scenario>-<size>-<engine>/`
(59 run folders, 481 pictures, earlier attempts included; the final runs are the folders the table names; phone
folders also hold `*-lift.png`, taken right after each tap). Logs: `.tmp/shr-a/logs/`; results `.tmp/shr-a/res-*.json`.
Scripts: `scripts/handpass/shr-a-*.mjs` (helpers `shr-a-lib.mjs`, look-only `shr-a-probe*.mjs`).*

Key: D = desktop 1440×900 Chromium; Pc = phone 402×874 by touch, Chromium; Pw = the same phone, WebKit. Store lines
are in minutes: 480 = 08:00, 600 = 10:00.

## Results

| id | size/engine | verdict | what the screen said and what was saved | pictures |
|---|---|---|---|---|
| A1 | D, Pc, Pw | PASS ×3 | 0900 Tab, 1100 Tab, "own hours" Tab: the first Tab gave Ranger his own input (540-600), the later ones reached it. End: Ranger 540-660 "own hours"; Hex 480-600 "" on the original. Screen = store at every step, after the caret left, and after a reload | r2-a1-desk-chromium, r3-a1-phone-chromium, r3-a1-phone-webkit |
| A1 row order | all | RECORDED | While held, Ranger stays on top. Once the caret leaves, the section repaints and Ranger's row moves BELOW Hex's. After the reload: Hex, then Ranger | same |
| A1 Undo label | all | RECORDED | Straight after the first Tab: "Undo — 2 inputs". After later changes: "Undo — Ranger's LL" | logs |
| A2 | D | PASS | Shift+Tab back lands in his end box showing 11:00. Escape after 1200 in his end gives 11:00; after 1000 in his start, 09:00; after "cancel me" in his remark, empty. The Board stayed open; nothing saved. RECORD: Escape also takes the caret out to the page body, and on the first Escape the row repaints to his own address | r2-a2-desk-chromium |
| A2 | Pc, Pw | PASS | His end box reached by a tap shows 10:00 (his); his start box reached by a tap shows 09:00, and 11:00 was saved; tapped again the end shows 11:00. 1130 typed and a tap outside: 11:30 saved on Ranger's own; Hex untouched | r1-a2-phone-* |
| A3 pass 2 (start cleared first) | D, Pc, Pw | PASS ×3 | His own input all day, both his boxes empty, Hex 480-600. Untouched traversal saved nothing. A new start 0930 re-timed his own to 09:30–23:59, no third input | r1-a3-* (004–006) |
| **A3 pass 1 (end cleared after a split)** | D, Pc, Pw | **FAIL ×3** | Store right (Ranger all day on his own, Hex untouched) but his start box still showed 09:00 while the caret was in his remark box; it cleared only once the caret came back into the start box | r2-a3-desk-chromium/001, r1-a3-phone-* |
| A3 pass 3 (control) | D, Pc, Pw | RECORDED | The same stale 09:00 on his own repainted one-man row — not specific to the held shared row | r2-a3-desk-chromium/007 |
| A4 (Opus S11) | D | PASS | Three inputs: Ranger 540-660; Outlaw 570-600 "gym"; Hex 480-720, changed in place on the original. No fourth | r1-a4-desk-chromium/001–002 |
| A4 (Astra S06) | D | PASS | Ranger 540-660 "Ranger only"; Hex 480-720 "Hex only" (his own); Outlaw alone on the original, 480-600 "" | r1-a4-desk-chromium/003–004 |
| A5 2570 first | D, Pc, Pw | PASS ×3 | Nothing saved: one input, both men; the box healed to 10:00; retyping the figure it shows (1000) changed nothing | r1-a5-*/002 |
| **A5 0700 first (end before start)** | D, Pc, Pw | **FAIL ×3** | Not refused: with no note it saved Ranger's own input 480-420 (08:00 to 07:00) and cut him out; Hex untouched; the box shows 07:00 | r1-a5-desk-chromium/001 |
| **A5 0830 after a good 0900** | D, Pc, Pw | **FAIL ×3** | The same: 540-510 saved, no note. 2570 after it refused and healed to his current 08:30; 1100 then saved 540-660 on his own | r1-a5-desk-chromium/003–005 |
| A5 one-man control, 0700 | D, Pc, Pw | RECORDED | Also saved silently (480-420): the Board accepts an end before the start on any Unavailable row | r2-a5-desk-chromium, r1-a5-phone-* |
| A5 words | all | RECORDED | 2570: "2570 is not a time. Try 0900 or 09:00.", no second note. 0700 and 0830: no note at all | |
| A6 | D | PASS | 0900 Tab, Undo: one shared input 08:00–10:00. End 1100 then gave Ranger his own afresh, 08:00–11:00; Undo took back that one change; Redo restored it; remark "x" on Ranger's own. Nothing ever on Hex's. After the caret left, screen = store | r1-a6-desk-chromium |
| A6 | Pc, Pw | PASS | Two saves (Ranger 09:00–11:00), two Undos: one input, both men, 08:00–10:00. "Dental" typed and Hex's start box tapped: a fresh own input for Ranger, 08:00–10:00 "Dental". Undo then Redo: the same. " pm" gave "Dental pm" on his own. Nothing on Hex's | r1-a6-phone-* |
| A6 row after Undo | all | RECORDED | Desktop: the held row shows 08:00–10:00 at the shared address, matching the store. Phone: the first Undo shows his own row 09:00–10:00, the second the shared 08:00–10:00. On the phone the tap on Undo moved the caret out of his box onto the Undo button, both engines | logs |
| A7(a) the leave's name, then Delete | D, Pc, Pw; held and control | PASS ×6 | The window read "Ranger · 15 Jul", Ranger alone, 09:00–10:00. Delete removed his input ("Input deleted"); Hex kept 480-600. Undo then read "Undo — Ranger's LL" | r1-a7-a-desk, r3-a7-a-phone-* |
| A7(b) Reject, shared overseas duty | D, Pc, Pw; held and control | PASS ×6 | "Ranger's OD taken out of Unavailable"; Ranger's own duty under Personal Inputs (seen once that folded section was opened); Hex's stayed under Unavailable | r2-a7-b-desk, r3-a7-b-phone-* |
| A7(c) LATE chip | D, Pc, Pw; held and control | PASS ×6 | Ranger's mark hidden, saved on his own input; Hex's still shown. "LATE mark hidden. The Inputs page still shows it." | r2-a7-c-desk, r3-a7-c-phone-* |
| A7(d) his puck, then Outlaw on the crew list | D, Pc, Pw; held and control | PASS ×6 | The arm strip read "Planning Unavailable · Ranger". "Outlaw is now unavailable instead of Ranger". Outlaw on Ranger's own input, 09:00–10:00; Hex untouched | r4-a7-d-desk, r4-a7-d-phone-* |
| **A7(e) Outlaw dragged onto Ranger's puck, row held** | D | **FAIL** (three runs, the same) | "Outlaw is now unavailable instead of Hex". Store: Outlaw 480-600 on the original shared input; Ranger 540-600. Hex lost his leave | r4-a7-e-desk-chromium/001–003 |
| A7(e) control (caret left first) | D | PASS | "Outlaw is now unavailable instead of Ranger"; Hex untouched | r4-a7-e-desk/004–007 |
| A7(f) the drag, re-aimed after it began | D; held and control | PASS ×2 | Ranger's puck had moved from y=660 to y=694; dropped on it: "instead of Ranger" | r4-a7-f-desk |
| A7 caret on a phone | Pc, Pw | RECORDED | Every button tapped while his box held the caret took the caret OUT of the box (into the window for the leave's name; to the page body for Reject, LATE and his puck), the same in Chromium and WebKit — so these steps need naming for his own iPhone | logs |
| A8 | D | PASS | Caret back in his held start box, day stepped Thu 16 and back: nothing saved, Undo unchanged. End 1100 typed and Thu 16 pressed at once: committed once (540-660). 2570 and the day pressed at once: the refusal's words, nothing saved. Away to the Inputs page and a week on and back: rows show the saved values; remark "back again" on his own | r1-a8-desk-chromium |
| A9 | D | PASS ×2 | 0800 over his 08:00 and Tab; 1000 over his 10:00 and Tab: nothing changed, one input, both men. RECORD: Undo before and after "Undo — LL for 2 people" (the filing's own step), Redo greyed | r1-a9-desk-chromium |
| A10 kinds | D | PASS ×7 | All-day leave; morning half leave; overseas duty Mon–Wed typed on Wednesday; course Mon–Wed; Attach with To "Base North"; Other filed to Unavailable; an Appointment moved to Unavailable (its Reject on the Ground Programme, then "→ Unavail" on its Personal Inputs line). Each time Ranger got his own input of the same kind, title, "To", dates and filing; every later change reached it; Hex stayed as filed. RECORD: no OIL question at any Tab; all day: start 0900 gave 09:00–23:59; the morning half shows 00:00–12:00, end 1000 made Ranger's 00:00–10:00 with his half mark cleared, Hex kept his | r1-a10-*-desk-chromium, r2-a10-moved |
| A11 | Pc | RECORDED | The member (`us`, Ranger) has no door to the Board: his menu is View-only Sched, Inputs, Quals, Logic, Leave War, Tracker, Help. On the view-only schedule the day shows both rows with no box that takes typing | r3-a11-phone-chromium |
| A12 | D, Pc, Pw | PASS ×3 | Reject on Ranger's untouched row: "2 people's OD taken out of Unavailable". Under Personal Inputs (unfolded) one line, Hex+Ranger. Start 0900 Tab re-timed it for both: 540-600, still one input. RECORD: after the Tab the same note showed again; the line's boxes carry Hex's suffix in their address | r1-a12-* |
| A13 | D | PASS | The window opened from the leave's name ("Ranger · 15 Jul") closed by Cancel, by ✕, by Escape and by a tap on its dimmed backdrop — each closed only that window, the Board stayed open, the store unchanged. RECORD after Undo: Inputs page "… 08:00–10:00 Hex LL By Saber" and "… 09:00–10:00 Ranger LL By Saber"; the week the same; Leave War grid both "LL"; the admin's bell "Nothing new" | r1-a13-desk-chromium/001–013 |

## Each FAIL, with its exact presses

Common set-up: sign in as `ad`; file a leave (LL) for Ranger and Hex, 08:00–10:00, Wed 15 Jul, through the Inputs
page's window; Edit Schedule, open the Board on Wed 15.

**FAIL 1 — A3: a cleared end leaves the start box showing a stale time.** Ranger's start box: Ctrl+A, `0900`, Tab (the
caret in his end box); Ctrl+A, Delete, Tab (the caret in his remark box). Saved: Ranger's own input all day (correct),
Hex 08:00–10:00. Screen: his start box still shows **09:00**, his end box empty (`r2-a3-desk-chromium/001`); empty only
when the caret comes back into the start box. Phones the same. Control: the same on his own repainted one-man row —
the Board's general behaviour on a cleared end, not the shared-row change.

**FAIL 2 — A5: an end before the start is saved, not refused.** First change: Ranger's end box, Ctrl+A, `0700`, Tab —
no note; Hex 480-600, Ranger on his own input 480-420. After a good change: start `0900` Tab, end `0830` Tab — saved
540-510, no note. Control: a one-man leave's end `0700` is saved the same way.

**FAIL 3 — A7(e): a name dragged onto Ranger's puck while his row is held replaces Hex.** (1) Ranger's start box:
`0900`, Tab; the caret held in his end box; rows: Ranger on top (y about 660), Hex below. (2) In the Board's crew list
on the right, press the mouse on Outlaw at (1205,639); move in 15 steps to the middle of Ranger's puck as measured at
the press, (518,667); release. Result: "Outlaw is now unavailable instead of Hex"; store: Outlaw 480-600 on the
original shared input, Ranger 540-600 — Hex has lost his leave. Why (the picture taken mid-drag,
`r4-a7-e-desk-chromium/002`): as the drag starts the box loses the caret, the section repaints, and Hex's row moves up
under the pointer while Ranger's moves down to y about 694; the drop lands on Hex's puck. Right when the pointer is
re-aimed at Ranger's puck after the reorder (A7(f)), when the caret is already out (the control), or by the phone's
tap-then-name way (A7(d)). Three runs, from the Available Crew section and from the right-hand crew list.

## Not walked, and why; earlier attempts

Nothing in share A is NOT WALKED. A11 cannot be walked as worded (a member has no door to the Board). A7(e) desktop
only; A4, A8, A9, A10, A13 desktop only, as the share gives them. Earlier attempts, each a fault of the script and
replaced by the final run named above: `r2-a1-phone-*` (the "tap away" hit the Board's own Undo), `r1-a2-desk`,
`r1-a3-desk`, `r1-a7-b`, `r1-a7-c`, `r1-a7-d-desk` and `r3-a7-d-*` (a hidden copy of Outlaw on the week behind the
Board), `r1` and `r2-a7-e` (the same FAIL as `r4`), `r1-a11`, `r2-a11`.
