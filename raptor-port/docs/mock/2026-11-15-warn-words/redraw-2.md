# Redraw 2 — whole lines in place of the "…" fragments, unbroken time ranges, the pending line

Same folder, same file names (overwrite), same method. Update `manifest.json`. No build is needed: serve the build
that is there (`npx vite preview --port 4391` from `raptor-port`), stop it by its port when done. No git commands.

## 1. Every row is a whole line — no row starts with "…", none holds " / "

Replace the row at the given place. T = the "today" picture's row, P = the "proposed" picture's row. Prefix as given.

### b4-brief (phone)
- Row 3 — T: `Ranger — Not enough time to attend the VL BFM debrief — MEETING sits inside 12:00–14:00 (take-off + 2h, no landing typed)`
  P: `Ranger — Misses VL BFM debrief 13:00–15:00 (landing assumed): MEETING 13:30–14:00`
- Row 6 — T: `Ranger — No time for the VL BFM flight brief — BRIEFING, Meeting sits inside 09:40–12:00 (brief 09:40)`
  P: `Ranger — Misses VL BFM brief 09:40–12:00: BRIEFING 10:00–10:30, Meeting 11:00–11:30`

### b5-turns1 (phone and desktop)
- Row 2 — T: `Ranger — Tight turn VL BFM→RU: 60 min take-off→next T/O, no landing typed (needs 120 min — threshold 120, dekit+step 30+60)`
  P: unchanged.
- Row 4 — T: `Ranger — Crew rest breach — Thu took off 20:30 with no landing typed, +2h debrief assumed → ended 22:30 → crew rest clear at 10:30, but told to report 08:40 — only 10h10 rest.`
  P: unchanged (`…landing assumed 21:30 (T/O + 1h) + 2h debrief (assumed) → ended 23:30 → clear 11:30. Report 08:40: 9h10 rest, needs 12h.`)
- Row 6 — T: `Ranger — Crew rest breach — Thu ended 20:00 → crew rest clear at 08:00, but SC AM's in-time is 06:00 — only 10h rest.`
  P: `Ranger — Crew rest: Thu duty ended 20:00 → clear 08:00. SC AM in-time 06:00: 10h rest, needs 12h.`
- Row 7 — T: `Ranger — Crew rest breach — Thu ended 23:30 → crew rest clear at 11:30, but his day starts 07:00 (MEETING) before the 08:40 report — only 7h30 rest.`
  P: `Ranger — Crew rest: Thu duty ended 23:30 → clear 11:30. Day starts 07:00 (MEETING), before report 08:40: 7h30 rest, needs 12h.`
- Row 8 — T: `Ranger — Crew rest breach — Thu ended 23:30 → crew rest clear at 11:30, but his day starts 07:00 (MEETING), and he is on a line with no take-off yet — only 7h30 rest.`
  P: `Ranger — Crew rest: Thu duty ended 23:30 → clear 11:30. Day starts 07:00 (MEETING): 7h30 rest, needs 12h. His flight has no T/O yet.`

### b5-turns2 (phone and desktop)
- Row 1 — T: `Ranger — Crew rest breach — Thu ended 02:00 → crew rest clear at 14:00, but told to report 00:30 — 1h30 before his Thu duty ends.`
  P: `Ranger — Crew rest: Thu duty ended 02:00 → clear 14:00. Report 00:30: 1h30 before his Thu duty ends.`
- Row 2 — T: `Ranger — Crew rest breach — Thu ended 23:30 → crew rest clear at 11:30, but told to report 10:00 — only 10h30 rest. Late show — he still makes the 12:00 step.`
  P: `Ranger — Crew rest: Thu duty ended 23:30 → clear 11:30. Report 10:00: 10h30 rest, needs 12h. Late show: still makes the 12:00 step.`
- Row 3 — T: `Ranger — Crew rest breach — Thu ended 01:30 → crew rest clear at 13:30, but told to report 10:00 — only 8h30 rest. Late show cannot save it — the 12:00 step is still before rest clears.`
  P: `Ranger — Crew rest: Thu duty ended 01:30 → clear 13:30. Report 10:00: 8h30 rest, needs 12h. Late show doesn't help: the 12:00 step is before rest clears.`
- All three stay red.

### b6-crew2 (phone)
- Row 4 — T: `Jinx — Jinx is a WSO — cannot fly FCP (SC AM MAIN)`
  P: `Jinx — Wrong seat: a WSO in the front seat of SC AM MAIN 07:00–13:00`

### b7-oil1 (phone) — no prefix, as now
- Row 2 — T: `SC AM MAIN takes off and lands at the same time (09:00) — one of the two is wrong; the shift still earns from its R or B`
  P: `Times look wrong: SC AM MAIN T/O and landing are both 09:00. The shift still earns OIL from its R or B.`
- Row 3 — T: `SC PM MAIN takes off and lands at the same time (19:00) — one of the two is wrong; a shift with no length earns nobody any OIL until it is fixed`
  P: `Times look wrong: SC PM MAIN T/O and landing are both 19:00. A shift with no length earns nobody any OIL until it is fixed.`
- Row 4 — T: `RU takes off and lands at the same time (13:00) — one of the two is wrong; with no report before it and no debrief after it, the line earns nobody any OIL until it is fixed`
  P: `Times look wrong: RU T/O and landing are both 13:00. With no report before it and no debrief after it, the line earns nobody any OIL until it is fixed.`

### b7-oil2 (phone)
- Row 3 — T: unchanged. P: `This day was published before the app counted who is behind an ALL AVAIL puck on a duty desk, a sim or an extras line. Publish it again to credit them.`

## 2. Time ranges never break across lines — EVERY proposed picture (A2 and all b*, phone and desktop)

In every PROPOSED row, a time range (`12:40–13:00`) must stay on one line: wrap each `HH:MM–HH:MM` in a span with
`white-space: nowrap` when the row's words are set. The build will do the same. "Today" pictures are left as the app
draws them. Report any proposed row whose line count changed, and any that now reaches 4 lines on the phone.

## 3. The pending list (d-pending-proposed, phone and desktop)

Remove the added third row ("RU crew: OIL counts from 10:30 …"). Instead add ONE line of plain text INSIDE Ranger's
own row, under its "full day · 05:00–18:00 → full day · 05:10–18:00" line, in the row's ordinary text colour (the white of
the row's title, normal weight, not struck, not amber):

`Still a full day of OIL. It counts from 05:10, not 05:00.`

Nothing else on that picture changes.

## 4. Hand back
The list of files rewritten, any line-count change, and confirm: port 4391 free, no lock held, no git command run.
