# The walk brief — an SC shift's typed B (its in-time) counts for OIL (D606, on `[OIL-WORK-START]`) — 7 Oct 26

One walker, one world. You DRIVE THE REAL BUILT APP in a scripted real browser and report what the screen said —
pictures and a filled table. You do not review code and you fix nothing. You are not told whether anything is wrong
with this build.

**Read first, whole:** `raptor-port/docs/superpowers/briefs/2026-10-06-oil-work-start-walk-brief.md` — its sections
"Hard rules", "The drivers" and "What to return" bind this walk word for word, with these changes: your letter is
**E**; your scripts are `raptor-port/scripts/handpass/ows-E-*.mjs`; your pictures go in
`raptor-port/docs/img/handpass/2026-10-06-oil-work-start/E/`; your results are
`raptor-port/docs/handpass/parts/ows-E.json` and your report `raptor-port/docs/handpass/parts/ows-E.md`; your server
is `http://localhost:4294/` (already running, a frozen build — never start, stop or rebuild anything). Its section
"What the app should do" still holds EXCEPT the sentence that SC lines are "their written times and nothing else":
that is what changed, below. Do not read the other letters' files (A–D) or the host's results.

## What the app should do now

**OIL** is earned leave: work on a weekend or public holiday banks a half day (HO) or a full day (FO) into the Leave
War once the day is PUBLISHED. **6h01 or more is a full day, anything under is a half.**

On the Scheduler Board an **SC** wave ("+ Wave" → SC) has two shifts — AM 07:00–13:00 and PM 13:00–19:00 — each with
two **MAIN** rows and two **SPARE** rows. Each shift line has a **B** box. On an SC line the B is the crew's
**in-time**, not a brief.

**The rule (owner, 7 Oct 26):** where an SC shift's B is filled, the MAIN crew's OIL day starts at that in-time:
- the EARLIER of the B and the shift's written start is used — a B later than the start, a blank B, or one the app
  cannot read as a time changes nothing;
- it is the MAIN's only: a SPARE earns nothing by default, and a SPARE switched on in OIL Earn earns the shift's
  WRITTEN hours (07:00–13:00), never from the B;
- a shift that starts within the Logic page's "Nominal report before T/O" (3h) of midnight reads a B later than its
  start as the EVENING BEFORE: it lengthens the shift's own day (shown as starting 00:00) and gives the day before
  nothing;
- AVALON and BB are untouched: a time in their B box moves nothing;
- on a PUBLISHED day, a B typed or changed afterwards is a pending change like any other: the OIL holds until the
  four sign again and the amendment is published.

## Your scenarios — walk all, in order, desktop 1440×900 unless it says phone

Read every OIL result in THREE places: the Leave War cell for the man and date, the OIL tracker's row (worked times
and balance), and the day itself (version tag, "N pending", the four sign-offs). Ranger is `bane`.

| # | Do | Expected |
|---|---|---|
| E01 | Fresh world. Saturday 18 Jul: "+ Wave" → SC. Ranger on the FIRST MAIN row of the AM shift. Leave B blank. Sign the four, Publish. | ORIG. Leave War: **HO**. Tracker: +0.5, worked **07:00–13:00**. |
| E02 | Continue. On the board, type **06:00** in the AM shift's B box. | Leave War still **HO**, tracker still 07:00–13:00 (+0.5). The day reads pending (≥ 1), the four sign-offs are empty; open "To go out" and RECORD its words for this change. |
| E03 | Continue. Turn on OIL Earn on the board (working copy) and RECORD the FO / HO figure it shows for Ranger; turn it off. Open View-only Sched and RECORD the green edge on Ranger's puck on the published Saturday (half or full). | Working copy: a full day. Published face: still the half day. |
| E04 | Continue. Sign the four, Publish AL. | AL1. Leave War: **FO**. Tracker: +1, worked **06:00–13:00**. Nothing pending. |
| E05 | Continue. Undo, Redo, then reload the page. | After Undo: back to ORIG's HO, 07:00–13:00 (the B change waiting again or not — RECORD exactly). After Redo and after the reload: AL1, FO, 06:00–13:00. No doubled credit (ONE tracker row for 18 Jul). |
| E06 | Continue. Change the B to **08:00** (later than the start). Sign, Publish AL. | Before publishing: FO holds, pending. After AL2: **HO**, worked **07:00–13:00**. |
| E07 | Continue. Type **abc** in the B box, then **25:90**. | RECORD what the box does with each (refuses, keeps, flashes). OIL unchanged: HO, 07:00–13:00; RECORD whether the day reads pending. |
| E08 | Fresh world. Saturday: SC wave; Ranger on the first MAIN row of the AM shift; B **06:00** typed BEFORE publishing. Sign, Publish. | ORIG. **FO**, worked **06:00–13:00**, +1. |
| E09 | Fresh world. Sunday 19 Jul: SC wave; Ranger on the FIRST SPARE row (the third row) of the AM shift; B **06:00**. Sign, Publish. Then OIL Earn on the board: switch Ranger's SPARE seat / line ON (RECORD which control). Sign, Publish AL. | After ORIG: no OIL for Ranger on 19 Jul (cell empty, no tracker row). After the AL: **HO**, worked **07:00–13:00** — the written hours, NOT 06:00. |
| E10 | Fresh world. Saturday: SC wave. Re-time the AM shift to **01:00–07:00** (its start and end boxes), B **23:00**, Ranger on the first MAIN row. Sign, Publish. | **FO** on 18 Jul; the tracker's worked times start at **00:00** and end 07:00. Friday 17 Jul: nothing for Ranger. |
| E11 | Continue E10. Logic → Edit rules → "Nominal report before T/O" **3h → 0h30** (type `30` or `0h30`; RECORD what the box accepted). | Leave War holds **FO**, 00:00–07:00. The Saturday reads **1 pending**; "To go out" carries the line "OIL on this day · Logic values changed since it was published" naming the value and Ranger (RECORD its words — expected his published full day against a half day 01:00–07:00 under today's values). The four sign-offs empty. Then put the value back to 3h: pending clears, the sign-offs return (sign them first if they were not signed — say which you did). |
| E12 | Fresh world. Sunday: "+ Wave" → AVALON. Ranger on its first MAIN row. Type **17:00** in its B box. OIL Earn: switch Ranger's AVALON seat ON. Sign, Publish. | Worked times start **19:00** (the written shift), never 17:00. RECORD the cell, the worked times and the balance exactly (the shift runs past midnight). |
| E13 | Fresh world. Saturday: SC wave; Ranger on the first MAIN row of the AM shift. Before any B: open Insights (the week's Insights) and RECORD Ranger's work hours. Type B **06:00**; RECORD them again. | The work hours grow by one hour with the B (this part is older than this build — RECORD, no verdict). |
| E14 | Fresh world, sign in as the member (`us` / `us`) after an admin world has published E08's Saturday — or use `window.raptorRole` in place as the first brief allows. View-only Sched, Saturday. | The member sees the published SC line and Ranger's puck with its green edge; no control of his changes the B or the OIL. |
| E15 | **Phone 390×844.** Repeat E01 → E02 → E04. | The same numbers. RECORD whether the phone's board shows the SC line's B box and how you reached it. |
| E16 | Fresh world. Saturday: SC wave; Ranger on the first MAIN row of the AM shift, B 06:00, published (FO). Then file a leave for Ranger on 18 Jul 06:00–06:30 through the Inputs page. | RECORD the note the app gives (expected: it says he is recorded as working 06:00–13:00 and files the leave anyway), and whether the Leave War day goes amber. |

**Known, NOT a finding — report as RECORDED:** the changes window has no history line for a Logic change; the
Unpublish warning's wording when an amendment is withdrawn.

If a control named here does not exist or behaves otherwise, that is a finding: say exactly what you found.
