# [CSS-FONT-INHERIT] — the walk of the built fix (5 Nov 26)

**What was built (D1680, his "build it as drawn"):** nine `font: <weight> <size> inherit` lines, which the browser drops
whole, written out as `font-family: inherit` with their size and weight (and `line-height: 1` on the two that had `/1`):
`ui/scheduler/07-inputs-calendar.css` (1, the old day pop-up's boxes — drawn nowhere), `12-schedule-editing.css` (2),
`14-input-editors.css` (2), `25-inputs-calendar.css` (4). Guard: `src/ui/font-inherit-css.test.ts` — no `font:` shorthand
under `src/` names `inherit` beside a size or weight; red on `main`'s stylesheets (all nine named), green on the fix.
Drawing: `docs/mock/2026-11-05-font-inherit/`.

**Tier: WALK.** No money, published record, saved data, roles or warnings (questions 1–3, 7, 8: no — stylesheets only).
Question 4 yes: the input window is one drawer opened from several pages (the Inputs calendar and list, Medical, SANS,
Edit Schedule's week, the board). Questions 5, 6: no new control or surface.

## Roll-call — every place the nine rules draw

| Rule | Places on screen | Walked |
|---|---|---|
| `.ic-pop input` | none — the day pop-up became the day window; 0 on every screen walked | has it: changes nothing seen |
| `#cxReason` | the CX box, Scheduler Board (and the week's CX, the same one dialog) | yes, both sizes |
| `.cxedit-name` | the CX box's Edit list | yes, both sizes |
| `.inped-body select, input` | the input window from every door — the Inputs calendar, Edit Schedule's week (time boxes included) | yes: Inputs, member, schedule; both sizes |
| `.inped-v` | a member's fixed name (and the SANS panel's fixed kind, the same rule) | yes: member, both sizes |
| `.pp-sw` | "Several people"; **also the Leave War bid windows' Auto-approve** (`.bp-sw`, BidPicker and SelectSheet) | Inputs: yes. Leave War: **must not change, because** it was not on his drawing (D1625) — held at its old look by `.bidsheet-hd .bp-sw` in `leavewar/ui/bidpicker.css`, checked unchanged; put to him as its own question |
| `.pp-all` | the groups' All in Several people | yes, both sizes |
| `.inputsday .ic-note .ic-pkadd` | the + on a note with people | yes, both sizes |
| `.inputsday .ic-newnote-ppl` | + people on a new note | yes, both sizes |

## The walk — `scripts/handpass/font-inherit-walk.mjs`, 24 checks, ALL PASS, no page errors

Desktop 1536 (Chromium, 2x) and iPhone 402×874 (WebKit). Each marked place reads the app's letters at its size and
weight; the measured heights match the drawing's (cancel box 41 desktop / 38 phone, reasons 28 / 26, the input window's
boxes 37 and 35 desktop). Plain-user round (D1557): a line cancelled through the box with a reason typed reads
"CX DUE U/S AIRCRAFT" on the board; a note given two people through "+ people" shows them and its +. Results:
`docs/img/handpass/2026-11-05-font-inherit/walk.json`; pictures beside it (`pc1536-*`, `iphone-*`).

Not walked, with the reason: the SANS panel's fixed kind (`.inped-v`, the same rule and element as a member's fixed name,
walked); the Medical tab's and the Inputs list's "+" doors (the same window as the calendar's, walked); a phone picture
after each tap (D1281 — for the dense screens' pinned cells, none here).

## For his look
- The Inputs page: open a day, add a note with people — the "+" and "+ people" in bold.
- An input's window: the boxes and "Several people" in the app's letters.
- The Scheduler Board: CX on a line — the reason box, and Edit's list.

Walk: 24/24 PASS (2 sizes × 12), the walk script in place of a walker; 2 walk-script faults of its own fixed (the
schedule's window frame name; a reason set without typing did not reach the save).
