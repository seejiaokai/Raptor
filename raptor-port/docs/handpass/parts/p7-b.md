# Walker B — sim brief flags and the second spare sim seat ([DB-READINESS] phase 7, 1 Oct 26)

The frozen build on `http://localhost:4206`, a real browser, fixed date Wed 15 Jul 26, signed in as the admin (Saber).
Every fixture through the board's own controls (typed boxes, + Item / + Row, tap-arm + crew list, real pointer drags,
the four sign-off boxes, Publish / Unpublish, Undo / Redo, the Inputs form). Desktop 1440×900; the phone 390×844 for B14.
Scripts `scripts/handpass/p7-b-*.mjs`; pictures `docs/img/handpass/2026-10-01-dbr-phase7/b/`; results `p7-b.json`.
**118 of 119 checks passed; the one that did not is finding F1. No console error, page error or 4xx in any run.**

## The table

| id | what I did | what the screen said | what the stored data said | verdict | pictures |
|---|---|---|---|---|---|
| B14 | Tue board: the OFT row retyped `EP-1` 10:00–11:00 (Talisman / Echo); + Item "OPS BRIEF" 09:45–09:58 with ALL AVAIL; tapped its count (36); tapped Talisman | Window "Who's available 36". Talisman and Echo LISTED, each with the amber sentence under his puck: "No time for the OFT EP-1 brief — OPS BRIEF sits inside 09:45–10:00". Foot after the tap: "Talisman — No time for the OFT EP-1 brief — OPS BRIEF sits inside 09:45–10:00" | a read | PASS | B14-1, B14-2, B14-3 |
| B14 phone | The same world (saved right after publication) at 390×844: View-only Sched and the board, count tapped, list scrolled to Talisman, Talisman tapped | A bottom panel across the phone. Echo and Talisman amber, the sentence wrapped onto two lines directly under each man's puck, inside the panel; the foot gives the full sentence | a read | PASS | B14p-view-0…3, B14p-board-0…3 |
| B15 | Window left open; OPS BRIEF retyped 11:05–11:25 behind it; tapped Echo | Window stayed open, title followed. Talisman and Echo amber: "No time for the OFT EP-1 debrief — OPS BRIEF sits inside 11:00–11:30" | a read | PASS (see F1 for the foot) | B15-1, B15-2, B15-3 |
| B16 | AMT typed BRIEF 11:00 · BOX 11:30–12:30 · DEBRIEF 12:30; Hunter and Ledger on the BOX; OPS BRIEF 11:10–11:20; then 10:40–10:58 | Hunter and Ledger amber: "No time for the AMT brief — OPS BRIEF sits inside 11:00–11:30". At 10:40–10:58 (before the BRIEF row) both listed, no AMT flag — no lead time invented | a read | PASS | B16-1…4 |
| B17 | OPS BRIEF 12:40–12:50; 13:05–13:20; the DEBRIEF row's end typed 12:45, then OPS BRIEF 12:50–12:58 and 12:32–12:42 | "No time for the AMT debrief — OPS BRIEF sits inside 12:30–13:00" (blank end + 30 min); nothing at 13:05; with the end typed: nothing at 12:50, "…sits inside 12:30–12:45" at 12:32 | a read | PASS | B17-1…4 |
| B19 | The negatives: OPS BRIEF at 09:20–09:40 and 11:35–11:55; the sim's own time moved to 10:30–11:30 behind the window and an event put at 10:16–10:28; every other man in the window read; Ratchet (ground crew) and Nomad put on the sim's two extras | Outside both: Talisman and Echo listed, no flag. Sim moved: the 09:45 event loses the flag, the 10:16 one takes "…sits inside 10:15–10:30". None of the 34 men not on the sim wears a sim flag. Nomad (aircrew extra) is flagged like the other two; Ratchet rides the sim and is not in the window at all | a read | PASS | B19-1 (two), B19-2…6 |
| B19 warning list | Three ground rows with NAMED men: ADMIN TALK (Talisman), GC TASK 09:46–09:57 (Ratchet), AMT TALK (Hunter); times moved from the brief to the debrief | The day's list reads the same sentences: "Talisman — No time for the OFT EP-1 brief — ADMIN TALK sits inside 09:45–10:00", "Hunter — No time for the AMT brief — AMT TALK sits inside 11:00–11:30", then the two debrief ones (11:00–11:30, 12:30–13:00). No line for Ratchet | a read | PASS | B19w-1, B19w-2 |
| B18 | Published Tuesday with the overlap (four boxes, Publish day); View-only Sched's window; on the board the sim retyped 16:30–17:30; the board's, the edit week's and View-only Sched's windows; reload | Working copy: Talisman and Echo listed, NO sim flag, "who is free as things stand now"; the day reads "2 pending", the four sign-offs empty, "Not yet signed". View-only Sched: still 36, still the brief sentence for Talisman, Echo and Nomad, "who was free when this day was issued — Original"; the same after a reload | week rows: the week, Tuesday's day row, one issued version; the reload wrote nothing | PASS | B18-1…10 |
| B20 | Monday published; AMT BOX (8 passengers, a spare pair shown): Sidewinder DRAGGED from the crew list onto the SECOND spare | He sits on the second spare; the first is still offered empty; the day reads "1 pending" | `pax` = the eight men, `""`, `"mamba"` — ten entries, all text, no null | PASS | B20-0, B20-1 |
| B21 | Undo; the same seat by tap-arm + crew list | The same seats | the same text as the drag stored | PASS | B21-1 |
| B22 | Wednesday: AMT BOX with two men, Vapor DRAGGED onto its second spare; a new OFT row EP-2 with both seats and two extras, Blade DRAGGED onto its second spare | Each sits where dropped, the first spare still offered | `more` = `["","vegas"]`; `["bane","pump","","slash"]`; no null | PASS | B22-1, B22b-0, B22b-1 |
| B23 | IAT-3 (both seats): second spare by tap-arm (Sidewinder); EP-2 after Undo, the same seat by tap | As the drag | `["","mamba"]`; EP-2 the same list as the drag | PASS | B23-0, B23-1, B23b-1 |
| B25 | Board Undo, then Redo, on Monday's BOX and on EP-2 | Undo takes only that man off, the others keep their seats, the pair is offered again; Redo puts him back on the same seat | after Undo the list is back to the eight men / `["bane","pump"]` (the trailing blank trimmed); after Redo exactly what the drop stored | PASS | B25-1, B25-2, B25-3 |
| B24 | The changes window on the published Monday; reload; Wednesday published, Monday's AL1 published; every stored week row read; View-only Sched; reload; the board again | Changes window, To go out · AL1: "1 change" — one item "AMT BOX · passengers", one line "Sidewinder". Reload: the same seats on all four rows. View-only Sched shows every man on his row, before and after a reload | 14 `pax` / `more` lists read across the working days and the issued versions: all text; the padded ones stored in both; both reloads wrote nothing | PASS | B24c-1, B24-1…7 |
| B36 | Saturday: a timed Personal request for Ranger; EP-9 (Hunter / Ledger, Sidewinder on the SECOND spare); EP-10 (Blade / Basher, Piston on the FIRST spare); ALL AVAIL in the Personal row's extras; OIL Earn on, Ledger tapped off. Then reload · Publish · reload · Unpublish · reload · Publish again · reload, the Leave War after each publish / unpublish | Identical after every step and every reload: the seats, the Personal row's count (41) and its 41 men, OIL Earn (Ledger off, the other five on). Heads DRAFT → ORIG → DRAFT → ORIG. Leave War 18 Jul: Sidewinder HO\* exactly as Piston HO\*; Ledger nothing; Ranger nothing; all blank while unpublished; back the same after the second publish | EP-9 `["","mamba"]`, EP-10 `["pump"]`, the one decision kept, in the working day and both issued versions; a withdrawn-version row after Unpublish; four reloads wrote nothing | PASS | B36-0 … B36-14 |

## Findings

**F1 — the window's foot keeps a sentence that is no longer true after a time is edited behind it (minor).**
Steps: board, Tuesday, the B14 setup; tap the OPS BRIEF count; tap Talisman (the foot reads "Talisman — No time for the
OFT EP-1 brief — OPS BRIEF sits inside 09:45–10:00"); with the window open, retype OPS BRIEF to 09:20–09:40.
Expected (the brief's "edit a time BEHIND the open window: the flag follows"): the window agrees with itself.
What happened: the title and the list follow — Talisman is listed with no flag — but the foot still gives the old
sentence about 09:45–10:00. A second tap on the man does not clear it either. Closing and re-opening the window clears it
("Tap a puck for why. One man is flagged."). Seen on every later behind-the-window edit of the walk too.
Pictures: B19f-1, B19f-2, B19f-3; also B15-2, B16-4, B17-3. I did not compare with the build before phase 7, so I
cannot say whether this is new.

## Observations (reported, not judged)

- **Where the second-spare man is drawn on the read surfaces.** The board shows him on the second spare with the first
  still empty. The edit week, View-only Sched and the board in OIL Earn draw no empty seats, so there he is drawn
  straight after the last filled seat — the same place a first-spare man is drawn (IAT-3 with Sidewinder on the second
  spare and EP-3 with Blade on the first look alike). The stored position is kept. Pictures: B24v-1…3, B36-6.
- **What "amber" is.** A man flagged only for this event wears the amber SENTENCE under his puck; his puck gets no ring
  (the flagged row's colours equal a clean row's except the reason's own amber). A ring and a letter appear only when he
  also has a line of his own in the warning list (Hunter's "D").
- **Ground crew.** Ratchet is never in the ALL AVAIL crowd, so "clean" in the window means "not listed"; the warning
  list, with him named inside the sim's brief, has no sim line for him.

## Errors seen
None — no console error, page error, 4xx or native dialog in any of the six runs.

## Not walked
- The phone: only B14 (the brief) on View-only Sched and the board; not the debrief, the AMT block, the second spare
  seat, or the issued-versus-working contrast (the phone opened the world before the sim was moved).
- The second spare by a drag FROM ANOTHER SEAT (only from the crew list); the top bar's Undo (only the board's).
- Undo / Redo on IAT-3 and the Wednesday AMT BOX (walked on Monday's BOX and EP-2).
- The second spare from the edit week: it draws no empty spare seat, so there is no such door there.
- A version preview or a saved plan of a day with a padded seat; an amendment after the Saturday reissue.
- B36's "tap a man off" was done on a sim row (Ledger), not in the Personal crowd, which earns nothing.
- Ledger's and Ranger's Leave War cells were read off the grid's cells by the script; only the Piston / Sidewinder
  rows are on the pictures.
- Pictures: every one was opened. For about thirty the image did not come back to me (a tool limit) — B14-1, B14-3,
  B15-1, B15-3, B17-1, B18-2, B18-3, B19-2, B19-5, B21-1, B22-1, B22b-1, B23-1, B24-4, B24-7, B24v-1, B24v-2,
  B14p-board-0 and all the B36 pictures except B36-1-sat-oil-earn-ledger-off, B36-6 and B36-13. Those steps rest on the
  script's reading of the screen; the same content is confirmed by eye on their neighbours.
