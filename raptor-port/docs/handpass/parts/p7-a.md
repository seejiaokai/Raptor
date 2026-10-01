# Walker A — a placeholder on a Personal request row ([DB-READINESS] phase 7, 1 Oct 26)

**Result: 30 scenario rows, all PASS. No defect found against the promise. Five observations (O1–O5) for the main session.**
Driven on `http://localhost:4205` (the frozen copy, built 10:13), desktop 1440×900 and phone 390×844, every fixture
through the app's own controls, each scenario in a fresh world at the fixed date Wed 15 Jul 26. 115 pictures, every
one opened. Results `p7-a.json`; scripts `scripts/handpass/p7-a-*.mjs`; pictures `docs/img/handpass/2026-10-01-dbr-phase7/a/`.

**Two things to know first.**
1. **The frozen build is OLDER than two source changes committed during the walk** — D470 built (10:39, the name box
   of an asking request earns) and walker B's window-foot fix (10:58). What I saw of the window's foot, and of A8 / A9 /
   A28b (a Training row), is the build before them. A2, A5, A8, A9, A13 and the foot need a re-walk on a fresh build.
2. Some of my early pictures and part files were swept into those commits; I have since pruned them. What is on disk
   now is the final set (git shows the rest as deleted).

## The table

| id | what I did (controls) | what the screen said | stored data / OIL credit | verdict | pictures |
|---|---|---|---|---|---|
| A1 | Inputs form: Personal, Ranger, Tue 14 Jul 10:00–11:00 (lands by itself). Board: "+ add" under its row, ALL AVAIL in the crew list. Chip tapped on board and edit week | Row "Ranger · ALL AVAIL · **33**". Chip title "33 with nothing else on at that time — tap to see them (who is free as things stand now)". Window "PERSONAL Jul 14 · 10:00–11:00 · Who's available 33" (23 pilots, 10 WSOs, Saint flagged), line "who is free as things stand now". No OIL Earn button on a weekday. Edit week: same chip, same window | Row: Ranger + extras [ALL AVAIL], saved. Ranger not in his own crowd. Leave War 14 Jul empty. Reload: same, wrote nothing | PASS | A1-1, A1-2, A1-6, A1-7 |
| A2 | Personal all day Sat 18 Jul. A tap on the name box (it holds Ranger) does not arm it; ALL **dragged** from the crew list onto the name box. OIL Earn on | Row "ALL · **44**", no times. Chip "None of these 44 earn OIL today — tap to see each one (…as things stand now)". Window "PERSONAL Jul 18", 44. OIL Earn: same chip; row cell inert "Nothing on this row can earn OIL, so there is nothing to switch off"; "Who earns OIL **0 of 44**", every man inert, title "<callsign> — a personal request earns no OIL"; a tap shows that reason at the foot | Row who = ALL; the request stays Ranger's. Tap wrote no decision. Leave War empty. Reload same | PASS | A2-1, A2-2, A2-3, A2-4, A2-6 |
| A3 | Timed Personal Sat, ALL in the extras, OIL Earn on | Row "Ranger · ALL · 44". Ranger's own puck inert, title "Ranger — a personal request earns no OIL". Earn half 0 of 44, all inert. Edit week 44 | No decision stored; Leave War empty; reload same | PASS | A3-3, A3-5, A3-9 |
| A4 | Personal all day Thu 16 Jul, ALL AVAIL in the extras | Chip **21** though the row has no times; window "PERSONAL Jul 16", 14 + 7. Edit week 21 | Saved; Leave War empty; reload same | PASS | A4-2, A4-6 |
| A5 | Timed Personal Sat; ALL dragged into the name box AND ALL AVAIL in the extras | Two chips, 44 and 44; each opens the same 44 men, nobody twice. Earn half 0 of 44 | who = ALL, extras [ALL AVAIL]; no credit | PASS | A5-1, A5-2, A5-3, A5-4, A5-6 |
| A1 / A3 phone, A3r | The same at 390 px; then a tap on Ranger's puck and on a man in the window | Chip painted on board and edit week (33 / 44). Window is a bottom panel (366×523). After a tap the foot reads "Reaper — a personal request earns no OIL", on screen, nothing over it (a toast covers the foot for ~5 s after a change) | as A1 / A3 | PASS (see O1) | A1-phone-1/6/7, A3-phone-1/2/3/4/6/7, A3r-phone-1/2, A3r-desk-1/2 |
| A6, A6e | Sat row with ALL AVAIL: CX ("Cancel line"), CX again ("Un-cancel"), ⓘ, ⓘ again, ✕ on the row, Undo. Sunday row with only Anvil | Cancelled: no chip on board, OIL Earn, edit week; restored: 44 back. Info-only: no chip. ✕: "Ground item removed — back under Personal Inputs…", no chip anywhere; Undo: 44 back. Named extra only: no chip; Ranger and Anvil inert "…a personal request earns no OIL" | request reads taken off after ✕; reload same | PASS | A6-0, A6-a ×3, A6-a2, A6-b ×2, A6-b2, A6-c, A6-c2, A6-d, A6e-1, A6e-2 |
| A7 | Tue, ALL AVAIL + Anvil. Editor: times → 14:00–15:30. Undo, Redo, reload | Row and window read 14:00–15:30; chip 32 → **33**, different men; both extras stay. Undo 32, Redo 33 | reload same, wrote nothing | PASS | A7-1, A7-2 ×2, A7-3, A7-4, A7-5 |
| A8 | Sat, ALL AVAIL + Anvil. Editor: type → Training (the OIL question is put: Yes). Undo, Redo, reload, then → Personal | Training: chip "All 43 earn half a day", earn half **43 of 43**, each HO; Ranger and Anvil "earns half a day — tap to take him off". Undo: Personal, 0 of 43. Back to Personal by the editor: 0 of 43, all inert | no decision stored; reload same | PASS | A8-1, A8-2 ×2, A8-3, A8-4, A8-5, A8-6 |
| A9 | Training first, Reaper tapped off (42 of 43). Editor → Personal. Undo, Redo, reload | Personal: chip "None of these 43 earn", 0 of 43, all inert, Ranger and Anvil too. Undo: Training, 42 of 43, Reaper still off | Reaper's tap-off stays stored while Personal (no effect on screen) | PASS | A9-0, A9-1, A9-2 ×2, A9-3, A9-4, A9-5 |
| A10 | Editor: date Sat → Sun. Undo, Redo, reload; then back to Sat | Sunday: Ranger alone, no chip. Saturday: no row, no chip. Undo: Saturday as before. Returned to Saturday: ALL AVAIL, Anvil and chip 43 are back (D468) | reload same | PASS (see O4) | A10-1, A10-2, A10-3, A10-4, A10-6, A10x |
| A11 | ✕ on the row. Undo, Redo, reload | No row, no chip; Undo brings row, 43, 0 of 43 | request taken off; reload keeps it | PASS | A11-2, A11-3 |
| A12 | ✕ on its Inputs line. Undo, Redo, reload | "Input deleted"; no row, no chip; Undo restores all | reload keeps it deleted | PASS | A12-2, A12-3 |
| A13 | Editor: person → Cobra. Undo, Redo, reload | Row "Cobra · ALL AVAIL · 43 · Anvil"; Cobra leaves the crowd, Ranger joins; 0 of 43, "Cobra — a personal request earns no OIL" | reload same | PASS | A13-2 ×2, A13-3, A13-4, A13-5 |
| A26, A26b | Sat (Personal, ALL AVAIL): four boxes signed, Publish day. View-only Sched. Leave War | ORIG. View-only Sched chip 44, "…(who was free when this day was issued)"; window "who was free when this day was issued — Original", 44, one list only | Leave War 18 Jul: of all 44 crowd men and Ranger, nobody wears FO / HO; the SDO (Fable) wears FO* — the reading works | PASS | A26-1, A26-2, A26-3, A26-5, A26b |
| A27 | Four signed again; Local leave filed for Reaper (one crowd man) | Working copy 43, Reaper gone. Day "1 pending", "Not yet signed", four boxes empty, "Publish AL1". Changes window: one line "Reaper · LL — filed", no count line. View-only Sched still 44 with Reaper | Leave War: Reaper "LL", no FO / HO | PASS | A27-1 … A27-5 |
| A28 | Undo the leave; reload | 44 again; nothing pending; four names back; View-only 44 | reload same | PASS | A28-1 … A28-4 |
| A28b (extra) | Published Sat: type → Training, sign, Publish AL1; → Personal, sign, Publish AL2 | Pending + four fall each time; issued face unchanged until published | **After AL1 every crowd man and Ranger wear HO\*; after AL2 all empty again** — the positive control | PASS | A28b-1 … A28b-4 |
| R1 | Leave pending. Plans menu → Original on edit week and board; View-only "Working draft" | Preview chip 44 "when this day was issued" while live says 43; windows agree; board's OIL Earn button disabled | a tap in a preview wrote nothing | PASS | R1-a1, R1-a2, R1-b, R1-c |
| R2 | Sunday "+ Alt Plan"; Plan A picked on View-only Sched | Chip 44 "(who is free as things stand now)"; window "…as things stand now — Plan A" | tap wrote nothing | PASS | R2-1, R2-2 |
| R3, R3b | Mon 20 Jul row with ALL AVAIL; back to 13 Jul; the peek | Row and ALL AVAIL drawn, **no chip**, both pages; a tap loads that week, no window. On its own week: 33 | — | PASS | R3-1, R3b ×4 |
| R4, R4b | Member (us) on View-only Sched | No Edit Schedule, no OIL Earn. Chip 44, same 44 men, one list only | tap wrote nothing | PASS (see O3) | R4-1 … R4-4, R4b ×2 |

## Observations (nothing fixed, nothing judged)
- **O1 — in OIL Earn a tap on an inert puck says nothing.** Steps: A3, OIL Earn on, tap Ranger's puck (or the row's
  name cell). Seen: the puck turns blue (selected), no words. The reason is a hover title only, so on a phone it cannot
  be read on the row — only in the window's foot. The same silence on an ordinary row with no end time, so it is the
  mode's general behaviour, not this change. Pictures A3r-phone-1, A3r-desk-1.
- **O2 — the earn half's hint invites a tap that cannot work.** On a Personal row, before any tap, the foot reads "Tap a
  puck to stop a man earning from this event." beside "0 of 44". Picture A5-4.
- **O3 — the member's "new to you" mark sits on the count chip.** A dotted "OG" badge on the seat overlaps the chip's
  top edge; the number stays legible close up, crowded at normal size. Admin's view is clean. Pictures R4b ×2, R4-1.
- **O4 — side finding, outside this change: a stale "till 19 Jul" in the remarks.** Inputs editor, a one-day request on
  18 Jul: click 19 Jul (dates read "18 Jul → 19 Jul", remarks gain "till 19 Jul"), click 19 Jul again (dates "19 Jul")
  — the remarks keep "till 19 Jul"; Save stores it and the row prints it. New data, not stored-only. Picture A10x.
- **O5 — note only.** Sent to Edit Schedule by the developer bridge (no control leads a member there), the member's
  page drew the Amendments panel with "Discard marks" and "Publish AL1" looking live. Nothing pressed. Picture R4-4.

## Errors seen
None: no console error, page error, 4xx or native dialog in any world. Every reload gave back the same state and wrote nothing.

## Not walked
- The published-day matrix beyond the leave and the retype (times, move, take off, delete, hand over on a published day).
- D468's other branch (the old day saved before the request returns).
- A hand-over's effect on stored OIL decisions of an ASKING request (A → B → A).
- A saved plan previewed on the board / edit week (the plans menu offers a parked plan only "tap to make it the live
  day" — previewed through View-only Sched's picker instead); previews and the member at phone width.
- Print / PDF / CSV; a scheduler-role account (only `ad` and `us`); a drag of the placeholder into the extras (tap-arm
  used); a "kept" dead row as a negative; the window dragged or resized on the phone.
