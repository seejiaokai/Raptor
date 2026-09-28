# Baseline — desktop (1440×900)

| # | What | Result | Note | Picture |
|---|---|---|---|---|
| B1 | a Quals tick, then Edit Schedule: Undo greyed (nothing it can reverse) | PASS | tick dj/san ""→"✓"; Undo disabled=true title="Undo" | 01-quals-tick.png, 02-editsched-undo-after-quals.png |
| B2 | a schedule note, then a Quals tick: Undo reverses the NOTE, the tick stays | PASS | Undo title "Undo — a note on the schedule", toast "Undid: a note on the schedule"; note now "EP: ENGINE FIRE ON TAKE OFF"; tick dj/sxo ""→"✓", after Undo "✓" | 03-quals-tick-survives-undo.png |
| B3 | a Logic rule switched: Undo greyed | PASS | switch fly true→false; Undo disabled=true | 04-logic-switch.png, 05-editsched-undo-after-logic.png |
| B4 | Admin → Users "Add a person", then Edit Schedule: Undo greyed | PASS | (add-person form not driven in the baseline — see the walk) Undo disabled=true | 06-admin-users.png |
| B5 | Quals, Admin, Logic and Inputs carry no Undo button | PASS | quals:0 admin:0 logic:0 inputs:0 | 07-inputs-no-undo.png |

Errors seen: none