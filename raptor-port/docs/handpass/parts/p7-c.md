# Walker C — the doors, the name box, the previews, the stored lists (phase 7 walk, 1 Oct 26)

Served build: `http://localhost:4207` (the frozen copy). Clock fixed at Wed 15 Jul 26. Desktop 1440×900, phone 390×844.
Every fixture through the app's own controls. Pictures (186, every row's opened and looked at):
`raptor-port/docs/img/handpass/2026-10-01-dbr-phase7/c/`. Results, one row per attempt (69 rows):
`raptor-port/docs/handpass/parts/p7-c.json` → `final.table`. Scripts: `raptor-port/scripts/handpass/p7-c-*.mjs`.

**Result: 64 PASS, 5 RECORDED (not judged), 0 FAIL on the scenarios — and one finding inside C35 (F1).**

## The table

| Id | What I did | What the screen said | Stored data / OIL credit | Verdict | Pictures |
|---|---|---|---|---|---|
| C29 | Tuesday published first. Board: both seats of VL #1 emptied (right-click), each tapped to arm, then ALL and ALL AVAIL tapped in the crew list (4 attempts) | Amber message every time: "ALL — cannot crew a jet; name the people flying it" (or "ALL AVAIL — …"). With the seat armed the two placeholder pucks are struck out and the same reason is printed under each. The seat stays "+ FCP" / "+ RCP" and stays armed | Seat empty; pending marks, day head, Undo list and button, change history unchanged; no row written | PASS | `C29-00…`, `C29-01…`, `C29-arm-*` (8) |
| C30 | Board: a real pointer drag of each placeholder from the crew list onto both OCCUPIED seats of VL #2 (day at 0 pending, four signed) and both EMPTY seats of VL #1 (8 attempts) | The same amber reason each time. Outlaw / Hex stay; the empty seats stay empty; day head still reads 0 pending / ORIG | As C29, every attempt | PASS | `C30-occ-*`, `C30-drag-*` (8) |
| C31 | ALL put legally on MASS BRIEF (Common Programme) and in a ground row's name box, ALL AVAIL on the AMT BOX sim seat; each dragged onto the empty front, empty rear and an occupied front seat (9); plus the reverse — the pilot dragged onto the seat holding ALL (a swap) | The reason each time. The source keeps its puck and its count (43 / 35 / 34); the cockpit is as it was. The swap is refused whole | As C29; the source seat still holds the placeholder | PASS | `C31-00…`, `C31-cp-*`, `C31-ground-*`, `C31-sim-*`, `C31-reverse-swap` |
| C32 | Other routes: keyboard Enter/Space on the puck; name search + Enter; double-click; Edit Schedule's own arm + crew list (4) and drags (4); a seat-to-cockpit drag on the week (2). Phone: tap-arm on the board (4) and on the week (4); a finger held and dragged from the crew drawer (3) | Reason on screen at every route that acts (keyboard and search do nothing at all). On the phone the drawer opens by itself, shows the placeholders struck out with the reason printed, and the toast wraps to two lines | As C29 at every one of the 23 attempts; a reload on each width gives the same day back and writes nothing | PASS | `C32-*`, `C32-phone-*` |
| C29–32 | The changes window for Tuesday, before and after the doors; reload | Same six lines before and after (two men taken off, three legal placeholder landings); no line puts a placeholder on a flying line | Reload: same state, nothing written | PASS | `C29-99-changes-window`, `C29-98-after-reload` |
| C33-N1 | Ranger's Training request (Sat 18 Jul 08:00–16:00, OIL: Yes) on the Ground Programme. Tap the name box then Blade; then drag Blade onto the name box. OIL Earn; four sign-offs; Publish; Leave War | The tap does NOT arm an occupied name box (it highlights Ranger's puck) — nothing lands. The drag is allowed, silently: the row shows Blade alone. Inputs page still says Ranger. OIL Earn: Blade plain, title "Blade — nothing measurable to earn from here"; Ranger "FO" on the Personal Inputs card, "earns a full day" | Request's person: Ranger. Issued row: Blade. Leave War 18 Jul: **Ranger FO\*, Blade blank**; same after reload | RECORDED | `C33-N1-*` (12); owner pictures `C33-N1-06-OIL-EARN-the-row`, `C33-N1-09-leavewar-*` |
| C33-N2 | Same, by the other way in: Ranger taken off the name box, the row's "+ add" tapped, Blade tapped | "Ranger removed", "Blade planned"; Blade lands in the name box. Everything else exactly as N1 | Same as N1: Ranger FO\*, Blade blank | RECORDED | `C33-N2-*` (12) |
| C33-X1 | Same row, Blade added to the EXTRAS (Ranger stays in the name box) | Row shows Ranger and Blade. OIL Earn: both "FO", "earns a full day — tap to take him off this event" | Leave War 18 Jul: **Ranger FO\*, Blade FO\*** ("Earned off a duty input… Training… worked 08:00–16:00") | RECORDED | `C33-X1-*` (11); `C33-X1-06-OIL-EARN-the-row` |
| C34a | Tuesday draft with ALL AVAIL under MEDICAL APPT; "+ Alt Plan"; Plan A previewed on View-only Sched | Chip 35, title "…(who is free as things stand now)"; window lists 35, line "who is free as things stand now — Plan A"; never "issued" | A tap on a man wrote nothing | PASS | `C34a-*` (4) |
| C34b | Wednesday with ALL AVAIL, published (37), then a leave for Reaper; the Original looked at from Edit Schedule, the board and View-only Sched | Previewed chip 37, "…(who was free when this day was issued)"; window 37, same words, Reaper still listed. Live copy / working draft: 36, "as things stand now". Day head "1 pending" | Taps in the preview windows changed nothing and wrote nothing | PASS | `C34b-*` (5) |
| C35 | Admin and member open Wednesday's chip, desktop and phone | Same 37 men, same two flagged (Kraken, Otter, with their reason readable), "when this day was issued", in all four; member has no earn controls; phone window is a bottom panel | Taps wrote nothing | PASS for list / flags / roles; **FAIL for the finger tap — F1** | `C35-*` (6) |
| C37-i | A jet's stores list: ✕ on all six → reload | Menu offers no stores before and after the reload (not the six back) | `settings/stores = []`; reload same, nothing written | PASS | `C37i-*` |
| C37-ii | Cancel-reason list: ✕ on all three → reload → Reset to standard (two taps) | "No quick reasons…"; still none after the reload; Reset brings WX, OPS, LOGS back | `settings/cxreasons = []` | PASS | `C37ii-*` |
| C37-iii | Quals → Edit quals: ✕ on all ten columns (six ask again: "REMOVE?") → Save changes → reload | No qualification columns before or after the reload | `settings/qualcols = []` | PASS | `C37iii-*` |
| C37-iv | Leave War ⚙ → ＋ Counter, 49 added through the form | At 60: "60 counters is the most the app keeps. Delete one to add another."; Add counter disabled with a name typed. After reload: 60 on the grid, none missing, form still full | `leavewar/manningdefs` holds 60 before and after | PASS | `C37iv-*` |
| C37-v | Hide one warning on 13 Jul and one on 20 Jul; reload; sign out and in; both orders | See F3 | Both hides were written to their weeks' rows | RECORDED | `C37v-*`, `C37v2-*` |
| C37-vi | Post In with no Post Out; out-and-back (PO 13 Jul → Admin Restore, in from 15 Jul); a sixth event row with a 3-day bar; a PDF on an ATT C downchit; Tracker ball details + re-ordered charts + a deleted built-in | Each reads the same after its reload (boxes, bar, paperclip opens the PDF, chart order, "2024 deleted — Restore", the typed name) | Reload: same state, nothing written, all five | PASS ×5 | `C37vi-*` |

## Findings

**F1 — at phone width a finger tap on the count chip does not open the ALL AVAIL window on the week views (C35).**
Steps: 390 px, View-only Sched (member or admin), Wednesday's MAINT CONF row, tap the "37" chip under the ALL AVAIL puck.
Expected: the window opens (it does on the desktop, and on the phone's board). Happened: the ALL AVAIL puck above the chip is
highlighted instead and no window opens — the touch lands on the puck, 2 px above. A mouse click at the same spot opens it.
The same on Edit Schedule. Pictures `C35-admin-phone-finger-tap.png`, `C35-member-phone-finger-tap.png`.
**Caveat:** seen in the script's Chromium phone emulation only; I could not test a real iPhone (compare D158, a touch-emulation quirk).

**F2 — the name box (C33), for the owner's picture.** In this frozen build a man put in the name box earns nothing (blank
Leave War box, "nothing measurable to earn from here"), while the same man in the extras earns FO. D470, recorded today, says
he should earn — the served build does not show that. Also seen: the requester disappears from the row but still earns from
his own request; the replace-by-drag gives no message; a tap never arms an occupied name box.

**F3 — hidden warnings (record only).** The hide on the week that is ON SCREEN when the page is reloaded, or when the
person signs out, comes back as a live warning; the hide on the other week stays hidden. So after a reload: 13 Jul's is
back, 20 Jul's still hidden. Signing out with 20 Jul on screen brings 20 Jul's back too. D469 (today) says hidden stays hidden.

**F4 — small.** Saving on Quals says "Quals saved (prototype — writes to Dataverse in the full build)." — prototype wording on screen.

## Errors seen
None: no console error, page error, 4xx or native dialog in any run.

## Not walked
- Seat-to-cockpit drags by finger on the phone, and a finger drag on the phone's week (only the crew-drawer finger drag on the board).
- Templates, copied days and loaded saved plans as ways a placeholder could reach a cockpit (not placement gestures).
- C33 on the phone, and after an amendment.
- C37-iii's "Reset" — the stores and Quals editors have none (one entry added back with Add instead).
- C37-v with a second person signing in (only the same admin, and the member's read-only view).
- F1 on a real device.

Note: `git status` shows changes under walker A's and B's files — not mine; I touched only `p7-c-*`, `c/` and `p7-c.{json,md}`.
