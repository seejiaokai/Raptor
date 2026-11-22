# Walker w2 — SANS from its date (D2313), the publish note's names (D2314) — 22 Nov 26

Build `dist` (bf333f432), served on 4322. Script `scripts/handpass/sfd-w2.mjs` (v2 final run; v3 adds the "+ SANS" read to S2 only),
`sfd-w2-drawer.mjs` (phone crew drawer), `sfd-w2-probe.mjs` (route probe). Final pictures: `docs/img/handpass/2026-11-22-sans-from-date/w2/final/`
(334, phone tap pictures in `taps/`; S2 re-run with "+ SANS" in `final/s2-plus-sans/`). `try1`–`try3` are earlier attempts — not cited.
Desktop Chromium 1536×864, phone WebKit 402×874 ×3 touch. Clock installed before load and left running. Every state made by the app's own controls, except S6's input (below).

## S5 — Hex named on published days, then posted out as SANS from Mon 20 Jul (clock Wed 22 Jul 09:00)
Desktop PASS · phone PASS. Ground rows by + Item, the people box, then his crew-list puck; four sign-offs; Publish day. Posting: Leave War ⋯ → Post out → SANS ("On 20 Jul: becomes SANS.").
- Mon 13 Jul after the posting: nothing pending, SIGNED ORIG and four names stand, his row puck and crew-list puck with no purple line, a WSO not under SANS Avail — board, Edit Schedule, View-only Sched as Ranger. PASS both (`s5-06*`, `s5-07`, `s5-13`, phone drawer `drawer-mon13-crew-phone.png`).
- Tue 21 Jul: "1 pending", "Not yet signed", sign-offs fallen. PASS both (`s5-08-tue-board-pending-*`). Working copy: his row puck wears the purple line; crew list: under SANS AVAIL · 0 FREE, struck (`s5-08b`, `drawer-tue21-crew-phone.png`).
- Pending list line (To go out · AL1): "Hex · SANS — Saber 22/7 09:00 — no → yes" (`s5-10-tue-pendlist-*`).
- S9 👁 look at the Original: his puck, no purple line. PASS both (`s5-09-tue-eye-*`). View-only Sched as Ranger keeps him as published, no purple line. PASS both (`s5-12-tue-view-ranger-*`).
- S9 All changes on Tue: RECORD — the posting leaves NO line in "All changes" (only the day's publish, four signatures, the ground item and "Hex put on"); its one line is in "To go out": "Hex · SANS no → yes" (`s5-11-all-changes-*`).
- AL1 on Tue ("Published AL1 · 1 item on Tue only · approved by Bolt"): nothing pending, SIGNED AL1; purple line on the board's row, Edit Schedule, and View-only Sched as Ranger. PASS both (`s5-14*`, `s5-15`, `s5-16-*`).
- Undo post out (sheet's "Undo post out (PO)"): SANS off. RECORD Tue 21 Jul: "1 pending", "Not yet signed", his puck a regular (no line, in the WSOs column) — as the host expected (`s5-18*`). Mon 13 Jul still nothing pending. PASS (`s5-19`).

## S2 — published weekend, then a SANS tick by hand on Wed 22 Jul
Desktop PASS · phone PASS (with the note on the Leave War read).
- Sat 18 Jul published with SQN EVENT 08:00–15:00 for ALL AVAIL: count chip "45"; window lists Hex as a regular. Leave War 18 Jul "FO*"; OIL tracker 2 (`s2-02`, `s2-03`, `s2-04*`).
- Wed 22 Jul published with an ALL AVAIL item; then Quals ✎ Edit → Hex's SANS cell: SANS from 2026-07-22 (`s2-05`, `s2-06`).
- Sat 18 Jul after the tick: no pending, SIGNED ORIG and four names, chip still 45, window still lists Hex with no purple line, crew list WSOs, no line. PASS both (`s2-07`, `s2-08`, `s2-08b`, `drawer-sat18-crew-phone.png` for the posting case).
- His Leave War 18 Jul after the tick: his row is GONE from the grid and the OIL tracker ("NO CELL", "NO OIL ROW") — SANS men are off the war unless "+ SANS" (D1215; the war's row goes by today's tick, "Known, already filed"). Not a finding. With ⚙ → "+ SANS" pressed the cell reads "FO*" and his OIL 2, unchanged. PASS both (`s2-plus-sans/s2-13d-lw-sans-on-*`, `s2-13e`).
- Remark changed, signed, AL1 published ("Published AL1 · 1 item on Sat only"): his 18 Jul FO* still there (above, read after AL1); window after AL1 still lists him, no line. PASS (`s2-11`, `s2-12`).
- Wed 22 Jul: "1 pending", sign-offs fallen; his crew-list puck under SANS Avail, line on. Pending list line: "Hex · SANS — Saber 22/7 09:00 — no → yes". PASS both (`s2-14*`, `s2-15-wed-pendlist-*`).
- Usability note: an admin who ticks a man SANS and then looks for that man's earned OIL on the Leave War finds his row and his OIL tracker line gone until "+ SANS" — by design, but surprising.

## S6 — the publish note's words (clock Wed 15 Jul 09:00)
Desktop PASS ×4 · phone PASS ×4. Notes, exact:
- "Saturday 18 Jul published and approved. Ranger’s Training has no OIL answer, so nobody on it earns OIL." (`s6one-03-note-*`)
- "Saturday 18 Jul published and approved. Ranger and Hex’s Training has no OIL answer, so nobody on it earns OIL." — Ranger first, the order the input lists them (`s6two-03-note-*`)
- "… Training for 3 people has no OIL answer, so nobody on it earns OIL." (`s6three-03-*`) · "… Training for ALL AVAIL has no OIL answer, so nobody on it earns OIL." (`s6aa-03-*`)
- Apostrophe is the curly ’. Fits its box: phone 376 wide, two lines, nothing cut (scroll = client width, both ways); desktop one line.
- FIXTURE NOT BY THE REAL DOOR (§7.7): + Input → Training for Ranger on Sat 18 Jul → Save asks the OIL question with only Yes / No OIL / Back, Add disabled; Back files nothing (`s6one-00a-oil-question-*`, `s6one-00b`). No real door leaves a weekend input unanswered (as frf-w3 found), so the input was filed through the bridge's own filing command without its answer, as frf-w3 does. The sign-off press then opened the day's OIL list and Later was pressed (`s6*-02-oil-list-*`).

## Findings
None. No difference from an EXPECTED line once the Leave War read went through "+ SANS".

## Errors seen
No console errors, page errors or failed requests in any final run (every scenario's "errors" line PASS).

## NOT WALKED / limits
- S6's unanswered input could not be made through a real door (above) — planted via the bridge, said so.
- On the phone the crew list lives in the AIRCREW drawer; sfd-w2.mjs read it from the page with the drawer shut — the drawer was opened and pictured separately in `sfd-w2-drawer.mjs` (posting case: Mon 13 / Sat 18 regular, Tue 21 SANS). The S2 tick case on the phone's crew list was read from the page, not pictured open.
- Known, filed (not findings): the Leave War's own row and Available counts go by today's tick.
- My own slip: one shell `sed -i` changed only the script's version line (v2→v3); no other file touched that way.

## Lessons of §7.11 — how my steps meet them
1 state table: each day read before/after each action (published, posted, AL1, undone). 3 after each press: toast and pending chip read and pictured. 4/12/19 windows: ALL AVAIL window closed by Escape; changes window by ✕; Settings by Escape — page beneath pictured after. 5 row in view: puck pictures framed on the subject. 9 lists measured: pending/changes text read whole. 22 drawn: pucks judged by class AND opened pictures; note fit by box sizes. 25 thing made in each place: row on the Ground Programme only (ALL AVAIL on the Common Programme in S2). 28 phone pop-ups proved in view by tap pictures. 29 reads today: clock installed and stated each scenario; midnight crossing is w1's S4. 30 a picture within ~100 ms of every phone tap (`taps/`, opened: no tint or see-through). Not applicable to these scenarios (no drags, pinches, keyboard, scroll bars, prints, drawings, sticky bars, zoom, hidden pages, keyboards, 125% windows): 2, 6, 7, 8, 10, 11, 13, 14, 15, 16, 17, 18, 20, 21, 23, 23b, 24, 26, 27, 31.
