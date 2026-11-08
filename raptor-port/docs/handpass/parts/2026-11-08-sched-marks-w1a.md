# W1a — the waiting mark: kinds and identities (walker w1a, 8 Nov 26)

Frozen build, origin `http://localhost:4391`. PC = Chromium 1536 x 864 at 1.25; phone = WebKit 402 x 874. Every world was
built on real storage, Saber (admin), clock Mon 13 Jul 26 09:00. Scripts: `scripts/handpass/sm-w1a-s18.mjs`,
`sm-w1a-main.mjs` (`<pc|phone> <s17|s17c|s25|s6|s6b|s7|s8|s8b|s9>`), probes `sm-w1a-probe*.mjs`. Pictures:
`docs/img/handpass/2026-11-08-sched-marks/w1a/` (prefix `<scenario>-<size>-…`; results JSON beside them). Every picture
named below was opened. A mark is judged by its computed style AND its picture: week = dotted underline on the name,
board = dotted 1px outline on the name box, both in the next amendment's colour (cyan, rgb 59,198,232).

How routes were reached: the week's pending chip ("N pending") opens the changes window ("To go out"); a shared input is
filed with the window's "Several people" switch; Ground / Unavailable placement uses the window's two buttons (offered for
Other only — Training, Meeting, Personal offer no such buttons and file onto the Ground Programme); an input is edited by
pressing its name on the week; Undo / Redo by the top bar's buttons; OIL Earn only exists on a non-working day, so S9 was
walked on Saturday 18 Jul (published, then filed); OIL Earn on `#sbOil` (`oeb-w1-lib.mjs oilOn`).

## 1. Table

| Scenario.step | Size | EXPECTED | Screen said / showed | Result | Picture |
|---|---|---|---|---|---|
| S18.1 published clean Wed: Bolt not on Unavailable, no mark | PC, phone | clean | no Bolt row, no mark; the day's chip reads "5 changes" (the issued version's change chip, not "pending") | PASS | s18-pc-1-clean-week, s18-phone-1-clean-week |
| S18.2 file Bolt LL + Saint Meeting "Safety brief" | PC, phone | "2 pending", Unavailable name AND Ground name marked | chip "2 pending"; LL name underline dotted rgb(59,198,232); Ground MEETING name the same; board: LL box outline dotted 1px same colour, Ground name `ain` dotted; board chip "2 pending"; changes window "To go out · AL1 2" lists Saint · Meeting and Bolt · LL | PASS | s18-pc-3-pending-unav, s18-pc-4-pending-ground, s18-pc-5-changes-window, s18-pc-6-board-unav; s18-phone-3-pending-unav, -4-pending-ground, -5-changes-window |
| S18.3 Publish AL1 | PC, phone | both marks gone, count back to zero | toast "Published AL1 · 2 items on Wed only · approved by Cinch"; LL deco none, board outline none; Ground name plain (solid underline = its ordinary look, no dotted); changes window "To go out · AL2 0 — Nothing is waiting to go out." | PASS | s18-pc-8-board-after-al1, s18-pc-9-after-week, s18-phone-9-after-week |
| S17 LL (leave) | PC, phone | marked, listed | marked on week and board; listed "Bolt · LL filed" | PASS | s17-pc-1pend-week, -board; s17-phone-1pend-week, -board |
| S17 ATT C, HL (medical) | PC, phone | marked, listed | both marked on week and board; listed "Saint · ATT C filed", "Ranger · HL filed" | PASS | same |
| S17 OD | PC, phone | marked, listed | marked; listed "Warden · OD filed" | PASS | same |
| S17 Other filed under Unavailable | PC, phone | marked, listed | marked; listed "Piston · Other … under Unavailable" | PASS | same |
| S17 shared input (Comet + Forge, Other, Unavailable) | PC, phone | one change, both faces marked | two faces marked; listed once "Other · 2 people — Comet, Forge"; day total "9 pending" = 9 inputs filed (5 Unavailable-kind, 1 shared, 3 Ground) | PASS | s17-pc-1pend-week, s17-phone-1pend-week |
| S17 Training / Meeting / Personal (file onto Ground) | PC, phone | Ground names marked as before, listed | marked; listed "on the programme" | PASS | s17-phone-1pend-week |
| S17 Training or Other filed under Unavailable by the window | PC, phone | marked | Training has no Unavailable button in the window; only Other can be placed there (done above). A Training moved there by "→ Unavail" was not walked | NOT DRIVEN (Training-U) | probe-window.png |
| S17 negative: Personal Inputs card and SANS cards | PC | no mark | Personal Inputs card opened (Training, Personal rows with REJECT): no dotted underline or outline anywhere in it; SANS cards: none | PASS | s17c-pc-1personal-open, s17c-pc-2sans |
| S17 Upchit, OL/OIL/CCL… kinds, rest of the groups | — | RECORDED if time allows | not walked | NOT DRIVEN | — |
| S25.1 file shared Bolt + Saint | PC, phone | all faces marked; one change | both rows marked (week and board); "1 pending"; list "Other · 2 people — Bolt, Saint not on the programme → under Unavailable"; list count 1 = chip 1 | PASS | s25-pc-1filed-week, -changes, -board; s25-phone-1filed-* |
| S25.2 change its remarks | PC, phone | still one change, marks stay | "1 pending", both marked, list unchanged in count | PASS | s25-pc-2edited-*, s25-phone-2edited-* |
| S25.3 add Hunter, S25.4 remove Saint | PC, phone | marks follow people, count stays 1 | add: three faces marked, list "Other · 3 people"; remove: Bolt and Hunter marked, Saint's row gone (not ghosted), list "Other · 2 people — Bolt, Hunter" | PASS | s25-pc-3added-*, -4removed-*; s25-phone-* |
| S6.1 shared input published (Bolt + Saint, issued), then edit remarks through Bolt's row (window) | PC, phone | host's reading: mark on a row exactly when the window lists its input | both faces marked, list "Other · 2 people — Bolt, Saint "Range party" → …"; after Publish AL1 all marks gone (PC), count 0 | PASS | s6-pc-1edited-*, s6-phone-1edited-*, s6b-pc-5after-week |
| S6.2 split one man by editing his own row's remarks on the BOARD | PC | the split row keeps his mark (marks and list agree) | the edit made two separate rows ("Range party" for Bolt, "Saint only — on the range" for Saint); list "Saint · Other — his own now — 06:00–18:00"; Edit Schedule week: both rows marked, "1 pending". BUT on the board itself, right after the edit and still 2.5 s later, neither row wears the mark (outline none); closing and reopening the board shows both marked | FAIL (board stays unmarked until reopened; the week and list are right) | s6b-pc-1board-split (unmarked), s6b-pc-1reopened-board (marked), s6b-pc-1split-week |
| S6.3 Undo, Redo, reload | PC | marks and count leave and return together; survive reload | Undo: all marks gone, chip back to "9 changes"; Redo: marks and "1 pending" back; reload (sign-in screen came back, signed in again): "1 pending", both marked, list same | PASS | s6b-pc-2undo-week, -3redo-week, -4reload-week |
| S7.1 remove Bolt from A (Bolt+Saint), then add Bolt to B (Hunter+Piston) | PC, phone | each changed input's faces marked; list agrees | step 1: list "Bolt · Other taken out", Saint's surviving row marked (Hunter, Piston plain); step 2: list one folded line "Bolt — Other → Other", all four faces (Saint, Hunter, Piston, new Bolt) marked, "1 pending"; board: same four | PASS | s7-pc-1removeBolt-week, s7-pc-2addBolt-week, -board; s7-phone-2addBolt-board |
| S8.1 delete Bolt's published LL and file a changed replacement | PC, phone | the changed replacement is marked | list "Bolt · LL “till 15 Jul” → “changed remarks till 15 Jul”"; the new LL marked on week and board; "1 pending" | PASS | s8-pc-1replaced-*, s8-phone-1replaced-* |
| S8.2 delete then file an identical replacement | PC | no pending, no mark | list empty, chip "8 changes" (no "pending"), LL plain, board plain | PASS | s8b-pc-1deleted-changes, s8b-pc-2identical-week, -board |
| S9.1 OIL Earn on Saturday, Ground name measured first | PC, phone | Unavailable name carries no mark, as the Ground name carries none in the same mode | normal mode: Ground MEETING name dotted; OIL Earn on: zero dotted outlines/underlines anywhere on the board (Ground rows included); Unavailable shows only Other and OD (name boxes grey, outline none) — the LL row is drawn as the OIL pill; leave rows never earn | PASS | s9-pc-1normal-board, s9-pc-2oil-unav, s9-phone-1normal-board, s9-phone-2oil-unav |
| S9.2 OIL Earn off again | PC, phone | marks come back | the three marks back, same colour | PASS | s9-pc-3back-unav, s9-phone-3back-unav |
| Lesson 1 state x reading (unpublished / published clean / pending / after AL1) | PC | table | published clean = none; pending = dotted in AL1's colour; after AL1 = none (changes window "AL2 0"); unpublished day: not walked here | RECORDED | s18-pc-1, -3, -9 |

## 2. Roll-call rows given to me

| Row | SHOWS | Gesture WORKS | Else DRAWN on those pixels | Picture |
|---|---|---|---|---|
| 1 week, PC | dotted underline in the amendment colour on the name (LL, ATT C, HL, OD, Other; Ground names the same) | pressing the name opens the input window (used for every edit above) | the existing red LATE tag and the type's tint stay; underline sits under the text only | s17-pc-1pend-week, s18-pc-3 |
| 2 week, phone | same dotted underline | name press opens the window | LATE tag, REJECT buttons; no wrap of the name | s17-phone-1pend-week, s18-phone-3 |
| 3 board, PC | dotted 1px outline on the name box, tint kept | name box opens the window (read: row edit used) | the type's tint, LATE tag, start/end boxes | s17-pc-1pend-board, s18-pc-6 |
| 4 board, phone | same outline on the name box, per-row stack | not pressed separately (same builder) | LATE tag, start/end beside | s17-phone-1pend-board, s7-phone-2addBolt-board |
| 6 OIL Earn | NO mark on any Unavailable or Ground name; Ground name measured first: marked in normal mode, plain in OIL Earn | OIL press not exercised | OIL pill / grey boxes | s9-pc-2oil-unav, s9-phone-2oil-unav |
| 9 Personal Inputs and SANS cards | no mark (PC only) | REJECT shown | — | s17c-pc-1personal-open, s17c-pc-2sans |
| 10 count vs changes window | agree in every walked state: N pending = N lines in "To go out"; a shared input is one line, several marked faces; after AL1 both zero | window opened from the chip (Escape does not close it — see 4) | — | s18-pc-5, s25-pc-1filed-changes, s7-pc-2addBolt-changes |

## 3. Page and console errors

None in any of the 22 runs (the script's error list was empty each time).

## 4. Odd things no step asked about

- **Board does not repaint the mark after an inline edit on its own row** (S6.2): marks missing until the board is closed
  and reopened. Not compared with the Ground name in the same flow (not walked) — the host should check that it is not
  already the Ground rows' behaviour. Pictures s6b-pc-1board-split vs s6b-pc-1reopened-board.
- The changes window does not close on Escape; it stays over the board (on the phone it covers most of the board, so my
  phone board picture s18-phone-6-board-unav shows the window, not the panel; the phone board was pictured clean in
  s17-phone-1pend-board and s7-phone-2addBolt-board). s18-pc-6-board-unav, s18-phone-5-changes-window.
- A clean published day's chip reads "5 changes" (issued-version changes), only "N pending" when something waits; after
  AL1 "12 changes". Reads fine, but a "changes" chip next to a "pending" chip is the same place.
- After AL1 the Ground name keeps a solid underline (its ordinary look) while an Unavailable name has none; both lose the
  dotted mark. s18-pc-9-after-week, s18-pc-4-pending-ground.
- A shared input draws one Unavailable row per person, each with its own REJECT button (s25-pc-err-open.png shows the
  window of such an input: title "Bolt +1 · 15 Jul").
- Reload returns to the sign-in screen (saved data kept).
- Not walked by me: the unpublished-day reading, Upchit, OL/OIL/CCL leave kinds, Training moved by "→ Unavail", the
  phone Personal Inputs/SANS check, a Ground-name comparison of S6.2, the board's "N pending" chip read (my reader found
  it only in S18).
