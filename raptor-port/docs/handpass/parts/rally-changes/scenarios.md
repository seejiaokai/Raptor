# [RALLY-BOX-CHANGES] — the scenario designer's report (a fresh Opus, blind to the build, 19 Oct 26)

Read-only scenario design for the bug check of D1038–D1041. Read: the rally design note from "A rally box for each
formation" to its end; the full rows of D1026–D1041, D606, D592, D591, D516, D24; the scheduler rulings' notes on SC's
in-time box and on MAIN / SPARE; the previous job's list (`../rally-box/scenarios.md`, RB-1…22 below), which this builds
on and does not repeat; the order's §8 and §2b. No code and no diff read.

**Defaults.** Signed in as an admin. "Pub Sat" = a Saturday published through the app; "Unpub" = an unpublished
weekday. "Standby lines" = SC, AVALON and BB. After every step that changes something: Undo, Redo, reload — record the
screen each time. A problem that lives only in demo data already stored, when the app is right for new data, is not a
finding (§2b) — e.g. an old SC line saved before this build with no rally field is not a finding if a new one behaves.

## Scenarios (most valuable first)

1. **SC MAIN rally earns OIL — both orders** (desktop, then the Leave War's OIL tracker and OIL Earn). Pub Sat, SC MAIN
   START 08:30, END 14:30 (6h — half a day under D592's worked example), R and B empty. (a) Unpublished copy first: type
   R 08:00 → OIL Earn shows a full day; publish → the tracker credits a full day. (b) Publish with R empty (half day),
   then type R 08:00 → the pending mark, sign-offs fall, a gold dot on R, the tracker still a half day; publish the
   amendment → full day; the first version's look still shows R empty. (c) As (b), Undo before amending → pending clears,
   OIL never moved. (d) With B 07:45 also typed → the earlier, 07:45, counts (D1041, D606(1)).

2. **SC SPARE, AVALON and BB earn nothing from R** (desktop, Pub Sat). Type R 06:00 on the SC SPARE row, an AVALON line
   and a BB line → each reads pending (a printed time changed) but OIL Earn, the tracker, crew rest, the long day and
   Insights do not move. Then switch the SPARE's OIL on in OIL Earn (D24) → he earns the shift's written hours, not from
   06:00 (D606(3)). Flip that row's badge SPARE → MAIN (the remarks badge) → now R starts his day; flip back → it stops.

3. **SC MAIN rally breaks crew rest** (desktop, then phone 402). A man lands Friday 21:10 and is SC MAIN Saturday START
   09:00. Type an R early enough to break his rest → the red crew-rest warning, its sentence says "rally" (not "in-time",
   not "B"); Friday's puck the dotted red ring; his crew-palette mark; arming another Saturday seat shows him barred with
   the reason. Clear R → all go. Type R and B both, B the earlier → the sentence names the in-time, not the rally. Put
   him on the SC SPARE row instead → no warning at all.

4. **An empty standby R counts for nothing** (Unpub). SC MAIN START 06:00, R empty: crew rest, the long day and Insights'
   work hours all start at 06:00 — never at START less the Logic page's "Default rally before take-off" (03:00). Change
   that Logic value → nothing about the SC line moves, and a Pub Sat whose only lines are standby does NOT read pending.

5. **The flash on a taken suggestion — desktop board, mouse** (desktop 1440, a flying line with TO 12:00, R and B
   empty). Click R → 09:00 in the ordinary typed colour at once (not blue, not highlighted), the plain blue ring for about
   a second, then gone. Type 0830 → replaces (08:30, never "09:000830"). Repeat: click, wait 3 s (ring gone), type → still
   replaces. Click B → the same. One Undo brings back the empty box and its faint suggestion; Redo → RECORD whether the
   ring flashes again (it should not need to). No ring ever lasts six seconds (that is "just added", not "taken").

6. **The flash on his iPhone** (phone 402 by finger, WebKit — his device; then dark and light theme if the app has both).
   Tap R → white at once, no blue selection fill, the ring about a second; the keyboard's first digits replace the time.
   Tap R, then the keyboard's Done → saved, ring gone. Tap R, then scroll the board at once → saved, no ring left stuck
   on screen, the scroll stays smooth (D991). Picture the frame just after the tap beside the old blue look.

7. **Fast actions inside the flash** (desktop and phone). (a) Tap R then B within half a second → both placed and saved,
   both white, each ring ends; neither box left blue. (b) Tap R then Escape inside the second → empty again, faint
   suggestion back, ring gone, no Undo entry, no pending mark on a Pub Sat. (c) Tap R then Escape after the ring ended →
   RECORD whether Escape still takes it out (D1030 says a "just-placed" one). (d) Tap R then at once ✓ Done, a day arrow,
   or Undo → RECORD whether the rally was saved and the ring did not reappear on the next screen.

8. **A redraw replaces the box mid-flash** (desktop, two tabs on the same day). Tab A taps a suggested R; within the
   second, tab B saves another line of the same wave (sync redraws tab A) → tab A keeps the taken time, the ring ends
   (not frozen on, not replayed on every later redraw), and tab B shows it after sync. Also: tap R while the "Saving…"
   note is up from a previous change.

9. **The flash on the Edit Schedule week** (desktop by mouse, 402 by finger). The week's R/B cell: click the faint R →
   ordinary colour plus the short ring; the same for B; type replaces; Tab out saves. The board shows the same value in
   the same colour when opened next.

10. **No faint times on standby lines** (board, week, View-only Sched, desktop and phone). SC, AVALON and BB lines with
    TO/START and END typed: R and B empty and plain — no faint time, no blue line above B; clicking an empty one gives a
    blank box to type in, places nothing, no ring. Flying lines on the same day still show their faint R and B.
    View-only Sched: a flying line's empty B prints its suggested brief; a standby line's empty B prints nothing (D1039's
    reading).

11. **The standby R box by keyboard** (desktop board and week). On an SC MAIN line: Tab runs callsign/role → R → B →
    START → END (RECORD the real order; R must come before B, as on a flying line, D554); Shift+Tab reverses; Enter on R
    commits and moves as Enter does on a flying R; Escape while typing a new R puts back the previous typed value (not
    empty, not a suggestion). The same on AVALON and BB.

12. **Where the standby R sits** (board desktop 1440 one line; phone 402 stacked; the week; the peek). Board: R before B on
    the desktop line, R over B on the phone, START/END (TO/LD) unchanged. Week, View-only Sched and the next-week peek:
    the column heading reads "R / START" on standby rows, R above START. Picture an SC wave with MAIN and SPARE rows, an
    AVALON overnight wave and a BB wave, each with R typed.

13. **One value, every surface** (desktop). Type SC MAIN R 07:10 on the board → the week, View-only Sched, the read-only
    board, next week's peek (from the week before), the Excel export and the printed PDF all show 07:10 on that line.
    Then type it on the week instead and check the board. RECORD especially SC's B (in-time): the rulings say it shows on
    the board only and the week has no B for SC — R must not be confused with it on the week.

14. **Export and PDF of standby lines** (Pub Sat, then an amendment). Excel export: the Rally column carries each standby
    line's typed R; Brief is blank unless typed — no worked-out brief on SC, AVALON or BB; flying lines unchanged.
    The PDF the same. A pending (not yet published) R change on a published day is not printed; after amending it is.

15. **A published standby R through its life** (Pub Sat). Change SC MAIN R → the changes window names "Rally" on the SC
    line (and MAIN or SPARE); "To go out" words it; the gold-dot bubble shows the history and jumps to the R box; Undo's
    words say "a rally time". Amend → the AL mark on R; the first version's look shows the old R; roll the day back →
    R returns to the issued value and OIL with it.

16. **Two SC shifts on one day** (Unpub). SC 06:00–12:00 (MAIN A, SPARE B) and SC 12:00–18:00 (MAIN C, SPARE D). Type R
    05:30 on the first, 11:00 on the second → A's day starts 05:30, C's 11:00, B and D untouched; neither rally leaks to
    the other shift's crew. Swap: put A also on a flying line at 08:00 → his day still starts 05:30 (first event).

17. **The SC in-time advisory reaches back to the rally** (Unpub). SC MAIN START 09:00, R 07:00, B empty; put the same man
    on a ground or duty desk at 07:30–08:30 → RECORD whether the amber SC in-time advisory now covers R → START as it
    covers B → START (the rulings make R start the day "as SC's in-time box does"). Then R cleared → the advisory goes.

18. **The long day and Insights from a standby R** (Unpub weekday). SC MAIN R 05:00, START 07:00, END 18:00 → the grey
    long-day note; Insights' work hours from 05:00. The same R on an AVALON line → no long-day note, no work hours, no
    flying load (D516).

19. **A member's view** (a member account, phone 402 and desktop). View-only Sched and the read-only board: typed standby
    R shows under "R / START"; no faint times anywhere on standby lines; a tap on any R does nothing, raises no toast, no
    ring. His own crew-rest warning (if shown to members) says "rally" for an SC MAIN rally.

20. **Copies carry the standby rally** (Unpub). Save a day template from a day with SC/AVALON/BB R typed, apply it to
    another day → RECORD whether R travels. A saved plan with a different SC R brought out on a Pub day → a pending
    amendment with R marked. Place an SC, AVALON and BB wave from a wave template → R empty and no faint time. Copy a
    day, if the app offers it → RECORD.

21. **Layout at the edges** (desktop at 125% browser scaling — his PC; 821 and 820 wide; phone sideways ~874×402). The
    standby lines' R/B and R/START cells stay level with flying lines'; nothing overflows or clips the role badge or
    remarks; the phone header's hidden cells still line up with what they hide.

22. **Reload and the error list** (all surfaces). After the whole walk: reload, every typed standby R survives; the
    browser's error list stayed empty throughout.

## Most likely missing — places that draw or read these times

- The version look of a published day (an earlier issued version) for standby lines — it may use an older drawing path
  without the R row.
- The changes window, "To go out" and the pending list's wording for a standby R (may say "Brief" or "In-time", or name
  no line); Undo's description for it.
- The Logic page's explanation of SC's in-time box and the OIL row (D606) — it should now say the rally counts too, on
  SC MAIN only; the crew-rest and long-day explanation sentences.
- The SC in-time amber advisory (scenario 17) — the likeliest engine reader to be left on B alone.
- The MAIN / SPARE flip badge: R must start or stop counting with the flip, and mark the change pending.
- Day templates, saved plans, copying a day, wave templates for SC/AVALON/BB (should carry no faint time; whether they
  carry R is unruled — record).
- Insights' work hours and the long-day note (SC MAIN only); flying load must stay untouched for all three (D516).
- OIL Earn's readout of the worked times stored beside an SC MAIN record (D592(8)) — a Pub Sat with an SC rally changed
  must read pending only if that record would be written differently.
- The read-only board (members, and an admin out of edit mode) and the next-week peek's own heading row, which is
  built separately from the week (design requirement 2).
- The ring's timer when the box is replaced by a redraw; a reduced-motion setting; a second suggestion taken within the
  first's second.
- View-only Sched's printed suggested brief on standby lines (should print nothing).
- The Excel export's Brief column for standby lines (worked-out brief must not print) and the PDF.
- 125% desktop scaling and a sideways phone for the new stacked standby cell.

## Break tests (hostile inputs)

1. **Junk in the standby R box:** type "abc", "7", "0 7 1 0", "07:10am" into SC MAIN R → it is refused or read the way a
   flying R reads the same text; a line the app cannot read as a clock counts as nothing typed — the day starts at
   START, no warning names a nonsense time, the export prints what the screen shows.
2. **25:90 and 24:00:** refused or normalised exactly as on a flying R; never saved as a time that moves crew rest.
3. **A rally later than START on SC MAIN** (START 06:00, R 08:00): the day still starts 06:00 (the earlier counts; a
   later R never shortens the shift — D606(1)); RECORD whether an out-of-order warning shows, and that OIL does not drop.
4. **Overnight AVALON 19:00–07:00, R 17:00:** shown, printed, exported as 17:00 that evening; no warning, no OIL, no long
   day. **R 01:00:** RECORD how it is shown (no wrong "(prev day)" label) — and nothing counts. Repeat both on an
   overnight SC MAIN 19:00–07:00: R 17:00 starts his day 17:00; R 01:00 must NOT be read as 01:00 that morning (18 hours
   before START), raising a false crew-rest breach or an 18-hour long day — RECORD what it does.
5. **Clearing a box:** delete a typed SC MAIN R (Backspace to empty, then leave) → the day returns to START, no faint time
   appears (standby), the published day reads pending only if it was issued with that R; Undo restores the value.
6. **Two SC shifts, the same man on both** (MAIN on 06:00–12:00 and SPARE on 12:00–18:00, or MAIN on both): R on the
   second shift must not start his day later than the first shift's START, nor earlier than its own R; RECORD the warning
   list.
7. **R typed on a standby line, then the line's START cleared:** no crash, the R still shows; nothing counts that needs a
   START; restoring START brings the count back.
