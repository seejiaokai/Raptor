# The RE-WALK brief — the one-rule job's check, after its fixes (12 Oct 26)

**Read first, whole:** `raptor-port/docs/superpowers/briefs/2026-10-12-one-rule-walk-brief.md` — everything above
"# The scenarios" applies to you word for word (and the older brief's "Hard rules" it points at). This is the SAME
method on a NEW build: `http://localhost:4186/` now serves the build WITH the fixes (its page loads
`assets/index-BkNByU3k.js` — check that name in the page's HTML before your first step and stop if it differs).
Only what the fixes touched is walked again. Your own files: scripts `raptor-port/scripts/handpass/or-RW<n>-*.mjs`;
pictures `raptor-port/docs/img/handpass/2026-10-12-one-rule/RW<n>/` (a NEW folder — the first walk's pictures are the
faults' evidence and are never overwritten); report `raptor-port/docs/handpass/parts/or-RW<n>.md`. You MAY read and
copy from the first walk's scripts named in your share (`scripts/handpass/or-<letter>-*.mjs`) — they hold the
working selectors and gestures — but never edit or overwrite them. Desktop 1440 × 900 with a real mouse unless a
line says a phone (390 × 844 by touch). Set the browser's clock to 2026-06-22T09:00 as before.

**What changed, so you know what to expect:**
- A man dropped ON the one person's puck of a PERSONAL input is refused: "A Personal input is one person's own".
- A swap the seat refuses says why, naming both men (… "cannot take …'s place — already on …").
- The last-person refusal reads "<callsign> is the last on this input — take the input off the programme, or delete
  it in its own window" (no "use ✕").
- The changes window's line for a person put in or taken out NAMES him ("Tally · Range brief 15 Jul · added"); a tap
  on it lands on HIS puck on the row, or HIS row of the Unavailable list.
- With History on, the rows of an absence filed for several wear the gold dot; a line about one man is on HIS row.
- On the Leave War, a remark saved on one man's cell of a leave filed for several is HIS alone (he gets a leave of
  his own); the man himself may save it.
- A man given his own time on a published day reads "his own now — <hours>" in "To go out", not "taken out".
- The Inputs List has no "Export to Excel" button.

## Share RW1 — the hands (copy from `or-B-*.mjs`, `or-A-*.mjs`, `or-D-*.mjs`)
- **RW1-1.** B8 again: a Personal input for Ranger (Thu 16 Jul 19:00–20:00). Drag Tally from the crew list onto
  Ranger's puck on its row. EXPECTED: refused with the Personal sentence; INPUTS unchanged; no Undo step made. Then
  drag a man FROM A FLYING SEAT onto the same puck: refused the same way, and he keeps his seat. And the "+ add"
  drop: still refused with the same sentence.
- **RW1-2.** B3 again (the scheduler's own row holding Tally and Ranger; a Training for Ranger alone; drag Tally from
  that row onto Ranger's lone puck). EXPECTED: refused whole, the note names both and says why — never "Not saved".
- **RW1-3.** A swap that SUCCEEDS still works: B2's steps (a man from a flying seat onto Ranger's lone Training puck):
  the two change places, "… and … swapped", one Undo puts both back. And B1's replace from the crew list on a
  Saturday: the OIL question opens at once.
- **RW1-4.** B5's last-person refusals (drag off, right-click; and ALL AVAIL alone): EXPECTED the new sentence, whole
  and readable — on the desktop week, on the board, and on a PHONE (390 × 844: measure the note's box inside the screen).
- **RW1-5.** The Inputs List, desktop and phone, as Saber and as Ranger: EXPECTED no "Export to Excel" button and no
  gap or broken layout where it stood (open the picture of the List's row of tools); every other tool there works
  (the dates button, the filters, "+ Input").
- **RW1-6.** The ordinary join, leave and move still say their notes: add Tally to a Meeting of three ("Tally added to
  …"), right-click him off ("… taken out of …"), drag a man between two inputs' rows.

## Share RW2 — History and the changes window (copy from `or-C-c11*.mjs`, `or-J-*.mjs` (J1, J2), `or-L-*.mjs` (L13))
- **RW2-1.** C11 again: a Meeting "Range brief" for Drifter, Hunter, Ranger on Wed 15 Jul; add Tally by a drop on
  "+ add"; right-click Hunter off; type 11:00 in the row's end box. Open the changes window, "All changes", Wed.
  EXPECTED: a line that NAMES Tally with "added", a line that NAMES Hunter with "taken out", a line for the time.
  Tap the "added" line: Tally's own puck is the one marked (not the first puck). Tap the "taken out" line: the row
  (Hunter has no puck left) — no wrong note.
- **RW2-2.** J2 again: leave (LL) for Drifter, Hex, Hunter Wed 15 – Thu 16 Jul; drag Anvil from the crew list onto
  Hex's row of the Unavailable list. Turn History on (the clock). EXPECTED: gold dots on that leave's rows — Anvil's
  row wears one; "All changes" lines name Anvil ("added") and Hex ("taken out"); a tap on Anvil's line lands on
  ANVIL's row; a tap on a gold dot of Anvil's row tells his line; a tap on Drifter's row's dot does NOT tell "Anvil
  added" (that line is Anvil's row's) but does tell the leave's own filing line.
- **RW2-3.** Under Personal Inputs: a Meeting of three NOT on the programme (press its row's ✕ on the board first, or
  file one and take it off). Add nobody; re-time it in its window. With History on: EXPECTED its one line under
  Personal Inputs wears a dot and its bubble tells the change.
- **RW2-4.** A one-person input's history is as before: a Training for Ranger alone, re-timed on its row and
  re-worded in its window: its lines in "All changes" read sensibly (his name not doubled, not missing), the dot on
  its Personal Inputs line / row tells them.
- **RW2-5.** RECORDED: for RW2-1's Meeting with History on, say where gold dots sit on its Ground Programme row (the
  filed item `[HIST-DOT-INPUT-ROW]` says none for the people — confirm what is there now).
- **RW2-6.** The changes window on a PUBLISHED day still reads as the first walk saw it: publish Wed with a Meeting
  of three; add Tally; "To go out" reads one line naming Tally with "added"; the History tab names him too.

## Share RW3 — the Leave War's remark, a man's own part, a delete (copy from `or-L-*.mjs` (L1, L3, L5, L10), `or-J-*.mjs`)
- **RW3-1.** L1 again, part A: LL for Drifter, Hex and Hunter Mon 13 – Fri 17 Jul; the war PUBLISHED; as Saber tap
  Hex's Wed cell, type "Dental", save. EXPECTED: the Unavailable list reads "Dental" on HEX's row only; the Inputs
  calendar shows the leave for Drifter and Hunter and a leave of Hex's own with "Dental"; the war's cells for all
  three are still leave on every day; ONE Undo puts the three back as one input with no "Dental".
- **RW3-2.** L1 part B: new world, as HEX himself (in place): the same save. EXPECTED: saved, his alone.
- **RW3-3.** A leave of ONE person (file LL for Hex alone, publish the war, type a remark on his cell): EXPECTED the
  remark is saved on that one input, no second input appears. And a leave the WAR itself approved (bid a leave for a
  man and approve it through the war's own controls, publish, type a remark): saved, one input.
- **RW3-4.** L3 again: OD for Drifter and Hunter on Thu 16 Jul; publish Thu; type 10:00 on Drifter's row.
  EXPECTED: "1 pending"; the line reads that Drifter's OD is "his own now" with the hours — not "taken out";
  publish again: the face shows Drifter at 10:00 on his own row, Hunter as before.
- **RW3-5.** A person TRULY taken out on a published day still reads "taken out": publish Wed with a Meeting of
  three; right-click one man off; "To go out" says he was taken out. And sick leave cutting one man of a shared
  leave on a published day (G4's steps): still 2 pending, the lines sensible.
- **RW3-6.** L10 again (a delete of a man in an input someone else filed): the others' bells read "<callsign> taken
  off" with no name after it; the row is re-made without him on every surface.
- **RW3-7.** Hex's bell after RW3-1: RECORDED — is he told anything when Saber types the remark on his cell, and
  what do Drifter's and Hunter's bells say.
