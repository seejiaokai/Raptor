# Walker 2 — the Inputs page and the schedule side (read `brief-common.md` first)

Scenarios from `designer.md` table (b), with these EXPECTED lines checked against the rulings on 25 Oct 26 (where one
differs from the designer's "Right if…", this one stands). Use days of the loaded week (Mon 13 – Sun 19 Jul 2026) where the
schedule is involved.

| # | Size | EXPECTED |
|---|---|---|
| 13 | desktop | an Other for Ranger, Goes to Unavailable (the grey line reads "Counted as away on the Leave War"): Edit Schedule's Unavailable list holds it with its remarks; the war's box OTH outlined, Available P −1; the SANS calendar's "still needed" that day +1 (D1356, D1357, D1352). Undo, Redo, reload after |
| 14 | desktop | flip Goes to → Ground Programme: on the Ground Programme, the war's box gone, manning back; flip back: under Unavailable again — an unpublished day |
| 15 | desktop | as 14 on a PUBLISHED day (publish it first through the Scheduler Board — `lib.mjs publish`): each flip reads as a pending change on that day (its count rises, the row marked); View-only Sched's issued face unchanged until the amendment is published; publish it — the war agrees |
| 16 | desktop | a Training (Ranger) on the Ground Programme → Reject → "→ Unavail": on the Unavailable list, the war's TRG outlined, Available −1; "→ Ground": the war's box gone. The same pair on the Scheduler Board |
| 17 | desktop + phone for the box | each kind under Unavailable: Meeting MTG, Personal PERS, Appointment APPT, Duty DTY, Event EVT, Attach ATCH — four letters fit the box on a phone, a step smaller |
| 18 | desktop | a course (CSE) for Ranger over two days, and an Attach with To "145 Sqn": both land under Unavailable without being asked; "Attach · 145 Sqn" on the Unavailable row, the Inputs list card, the Inputs calendar's bar, and the war's day list; the war's ATCH outlined. Press the Inputs calendar behind the open window (§7.11 lesson 4): what lights must match what the window says |
| 19 | desktop | 18's Attach: Reject → out of the war's count; "→ Ground" → out; "→ Unavail" → back in |
| 20 | desktop | an Other for ALL AVAIL (one day): no Goes to row; never under Unavailable; nothing on the war |
| 21 | desktop | an Other for Ranger AND ALL AVAIL (switch to several people): no Goes to row once ALL AVAIL is picked; it saves, on the Ground Programme (the designer's G3, fixed today) |
| 22 | desktop | an Other for Ranger + two named men, Goes to Unavailable: three OTH boxes on the war; each man his own row on the Unavailable list (D737) |
| 23 | phone, member | Ranger files his own Other, AM if offered else 09:00–11:00, Goes to Unavailable: his row shows OTH on the morning half, Available −0.5; his bid window's row reads CSE · OD · ⋯, the ⋯ holding Attach alone (D1379 — no Other, no Grant OIL) |
| 30 | desktop | a Training for Ranger on Saturday 18 Jul, OIL answered Yes, the weekend published, then "→ Unavail": the war's Saturday shows TRG outlined and the credit; the OIL tracker unchanged by the move |
| 32 | desktop | an Appointment 10:00–11:00, a Meeting 09:00–17:00 and a Duty 22:00–02:00 under Unavailable (for three men): RECORD the war's Available figure each half that day and the next morning (the agent's reading: the appointment takes the morning, 0.5; the meeting the whole day, 1; the duty that evening, 0.5, and the next morning, 0.5) |
| 38 | desktop | reload after 13, 16, 18: every OTH / TRG / ATCH box and count back; Goes to reopens on what was saved |
| 40 | phone | the input window with the keys up (use `scripts/handpass/kbs-his-measure.mjs`'s stand-in keyboard as `kbs-other-rmk.mjs` does): an Attach's To box and an Other's Goes to, tapped, each lifted clear of the keys AND of the window's own Cancel / Add (§7.11 lesson 5) |
| 41 | desktop | a Meeting (or Duty, Event) on the Ground Programme of Saturday 18 Jul with no OIL answer → Reject → "→ Unavail": the OIL question first, nothing moved until answered; a course filed on a Saturday from the Inputs page asks it at the save (D804, D793) |
| A5 | desktop | G5: an Other of Ranger's that a scheduler REJECTED (as admin press Reject on it), then signed in as Ranger in a NEW context — no: the world is per context; instead switch in place, as `e2e/app.ts lwRole` does: `window.raptorRole('member'); window.raptorMe('bane'); window.lwSetRole('member')` (back: `raptorRole('admin'); raptorMe('stiff'); lwSetRole('admin')`) (the order §7.7) — opens it: Goes to picks neither, the line reads "Rejected by a scheduler", the buttons do nothing; back as admin, Unavailable can be picked and the save files it under Unavailable |

Roll-call rows to mark from what you see: R1 (a published day's amendment panel and the AL marks on an Unavailable row),
R2 (the issued face), R3 (the board's Unavailable, Personal Inputs, Ground and Common panels, separately from the week),
R4 (the changes window and the bell), R5 (Undo / Redo's name and landing), R6 (the window from the Inputs list, the Inputs
calendar and the schedule row's tap), R7 (the Attach card, bar, row), R8 (the type list: no "Fly with", "Attach" there,
no ALL / ALL AVAIL for it), R9, R11 (the OIL question after a filing), R15 (the SANS calendar's day and month).
