# [STANDBY-FLIES] — the scenario designer's report (a fresh Opus, blind to the build, 19 Oct 26)

Read-only scenario design for the FULL bug check of D1042–D1046 and D1060–D1065. Read: the design note
(`docs/superpowers/specs/2026-10-19-standby-flies-design.md`) and its register SF1–SF10; the full rows of D1040–D1046,
D1060–D1065, D24, D15, D516, D1009, D606, D592, D45, D103; the scheduler rulings' settled notes on the MAIN / SPARE
badge, SC's B box and the standby templates; the plan's red team (H1–H13, Q1–Q4); the four approved pictures (the
phone and desktop board with the chips, the desktop week, the phone board with the faint dash); the previous job's list
(`../rally-changes/scenarios.md`), which this builds on and does not repeat; the order's §2b, §7.4 and §8. No code and
no diff read.

**Defaults.** Desktop = 1440 wide by mouse; phone = 402 wide by finger (WebKit where it matters — his iPhone). Signed in
as admin `ad`/`a`; a member is `us`/`us`. "Pub Sat" = a Saturday published through the app (its four sign-offs signed);
"Unpub" = an unpublished weekday. "Standby lines" = SC, AVALON and BB. "The chain" = the day's count badge, Insights
(sorties, formations, flying load, work hours), OIL Earn, the Leave War's OIL tracker, the warning list, the changes
window and its pending count, the sign-offs. Every state is built through the app's own controls (+ Wave → SC /
AVALON / BB, seats filled from the crew palette, times typed, the chip pressed); if a state cannot be reached that way,
that is the finding. After every change: Undo, Redo, reload — record the screen and the chain each time. A problem that
lives only in demo data already stored, when the app is right for new data, is not a finding (§2b) — e.g. a standby row
saved before this build is not a finding if a newly built one behaves.

## Scenarios (most valuable first)

1. **A hand tick on a published Saturday — its whole life, both directions** (desktop, then the Leave War's OIL tracker).
   Pub Sat with SC AM 07:00–13:00, R and B empty, SPARE Drifter seated; OIL Earn shows him earning nothing. (a) Press
   his dashed FLIES → lit "✓ FLIES"; the day reads 1 pending; the four sign-offs fall (D103); the changes window names
   the SC line, SPARE, and the Flies change in words he would use; OIL Earn and the tracker do NOT move yet (D592 (4)).
   (b) Undo → pending back to 0, sign-offs restored, chip dashed. (c) Redo, then publish the amendment → AL1; the tracker
   now credits Drifter for 07:00–13:00; the earlier issued version's look still shows him without the chip. (d) The
   opposite AFTER publishing: press the lit chip off → pending; amend → his OIL leaves the tracker. (e) Roll the day back
   to the earlier version, if the app offers it → the chip and the OIL follow. RECORD where the amendment mark sits —
   the change has no time box to wear a gold dot.

2. **AVALON overnight that flies, and Sunday's crew rest** (desktop, then phone). Pub Sat, AVALON NIGHT 19:00–07:00, two
   MAIN and two SPARE seated, a Sunday flying line with a 09:00 take-off. Put AVALON SPARE Ace on the Sunday line too.
   Type the AVALON R 18:30 → all four rows lit; Saturday's badge gains an "X 4" (or the build's form) for AVALON; OIL Earn
   offers all four, ON by default, from 18:30 to 07:00 Sunday (12h30 — a full day); Ace's Sunday seat goes red for crew
   rest, its sentence naming the AVALON shift and its 07:00 end — no debrief added (a rest from 09:00 would be wrong,
   D1045); the long-day note on each. Clear R → everything goes back, Ace's Sunday seat clean. Repeat with the AVALON on a
   SUNDAY crossing into next week's Monday → Monday's crew rest (load the next week) and the peek from the week before.
   Repeat on a weekday → no OIL, everything else the same.

3. **Hand tick, then type R — and the reverse — then clear R** (desktop, Unpub, then Pub Sat). SC AM, no times typed.
   (a) Press Viper's (SPARE) dashed chip → his row alone lit, the other three dashed. Type R 06:30 → all four lit; Viper's
   chip is no longer a button (its title says to CX the row). Clear R → RECORD: Viper's row should stay lit and become a
   button again (his hand tick is stored), the other three go dashed. (b) Reverse: type R first, then try Viper's chip →
   not pressable; clear R → all four dashed (no tick was stored). (c) Undo each step one at a time: one Undo per action,
   never two Undos for one press, never a tick left behind (red team H12). (d) The same on Pub Sat: the pending count
   after each step equals what really differs from the issued day — tick-then-R-then-clear leaves exactly one change
   (Viper's tick), not three.

4. **CX and the tick, both orders** (desktop, Pub Sat). SC AM with R typed: (a) CX Viper's row → his chip goes (or is
   no longer lit), the badge drops one jet, his OIL and crew rest go, the rest of the shift still flies (D1046). Un-CX →
   back. (b) Shift without R: tick Viper by hand, then CX him → he neither counts nor earns; un-CX → he flies again (the
   tick survived the cancel). (c) CX first, then try to tick a cancelled row → RECORD whether the dashed chip is shown on
   a cancelled row and what a press does; it must never make a cancelled row count. (d) CX the whole SC shift with R
   typed → no row flies, the badge loses the term. Undo / Redo / reload each.

5. **The empty-row count rule** (desktop, the badge, then Insights). Unpub, SC AM R 06:30: two MAIN seated, both SPARE
   rows empty → the badge counts 2 jets, Insights 2 sorties and 1 formation (D1062). Seat only the FCP of one SPARE → 3.
   Put a placeholder (ALL AVAIL) in the other SPARE → 4 (D1062's reading: a placeholder counts as seated). Clear every
   seat of the shift → the badge drops the term entirely; the chips? RECORD whether lit chips still show on empty rows.
   Compare with an ordinary flying line with nobody seated on the same day → still counted (D1009). Check the day heading
   on the board, the week, View-only Sched and the peek all show the same figure.

6. **A man on a flying SPARE and on another seat in the same hours** (desktop, then phone). Unpub, SC AM 07:00–13:00 no
   times, Viper on SPARE and on a 10:00 sim and on a ground row 11:00–12:00. Nothing warns (a spare is free). Type the
   SC R → hard clashes for Viper against both; his puck rings red on the board; the crew palette shows him barred when
   another seat in those hours is armed, with the reason. Tick-by-hand instead of R → the same for Viper only, never his
   shift-mate's SPARE row. Put Viper also on the SC duty desk at 08:00 (an SC desk is an SC seat for the spare rule) →
   RECORD. Put him on SC AM SPARE and SC PM MAIN (abutting 13:00) with R on both → no overlap clash at 13:00, the long-day
   note from 06:30 to 19:00.

7. **Absence against a flying row and a standing-by one** (desktop admin, then member `us`/`us` on phone). Ranger on
   AVALON SPARE Saturday night. File local leave for Ranger Saturday (through Inputs, as the member) → no warning while
   AVALON stands by (the standby allowance). Type the AVALON R → the leave-on-a-flying-seat warning on his row, in the
   warning list, on his puck. Clear R → it goes. Repeat with overseas leave and with a medical (both should warn whether
   or not the row flies — RECORD each against today's standby rule). Then the reverse order: R typed first, then the
   member files the local leave → RECORD what the request card and the Inputs calendar tell him and the scheduler.

8. **BB with no times** (desktop, Pub Sat). + Wave → BB (START / END blank). Seat two rows. Type R 08:00 → rows lit, the
   badge counts them, an amber line in the warning list naming BB, and a tap on it lands on the START box (SF9); no OIL,
   no crew rest. Type START 08:30 / END 14:00 → the amber line goes, OIL by default from 08:00, crew rest from 14:00.
   Clear END only → the amber line returns. Then tick a BB row by hand with no times at all (R empty) → RECORD whether the
   amber line also fires for a hand-ticked row (it should — it flies with no START or END).

9. **Every surface that draws a standby row** (desktop and phone, admin then member). One Saturday with: SC AM R typed
   (four lit), SC PM with one hand-ticked SPARE, AVALON standing by, BB standing by. Look at: the Scheduler Board (phone
   stacked, desktop one line) → dashed chips on non-flying rows, lit on flying rows; Edit Schedule's week (desktop and
   phone) → lit chips only, no dashed chip anywhere, not pressable; View-only Sched → lit only; the next-week peek from the
   week before → "✓ FLIES" text on the right rows only; the read-only board for the member → lit only, and no dashed chip
   that looks pressable (D1063); an earlier published version's look; the Excel export and the PDF → RECORD whether
   MAIN / SPARE and Flies appear (the design names the three screens and the peek only — the export is unruled).
   Duty desks, including AVALON / BB / SC desks made from a template with a wave → never a chip.

10. **SC's B on the board, seen from the week** (desktop). SC AM, type B 06:15 on the board only (the week has no B box
    for SC). The week's SC rows show lit chips with no time visible to explain them → RECORD whether a scheduler can find
    out why, and whether he can take it back from the week at all (he cannot — only the board has the B). Do the same
    with R (which the week does show). On View-only Sched, the same question for the member.

11. **Tick, then flip MAIN / SPARE; tick, then clear the seat** (desktop, Pub Sat). (a) Hand-tick a SPARE row, then flip
    its badge to MAIN → still lit, still a button; pending counts both changes; OIL default is on both ways now. Flip back
    → still lit. (b) Hand-tick a SPARE, then remove both his crew from the row → the badge drops him (nobody seated), the
    chip RECORD; then drag a different man onto the row → he inherits the tick (the tick is the row's, not the man's) —
    RECORD and say whether that is what a scheduler would expect. (c) Drag the ticked crew from one SC row to another
    unticked row → the tick stays behind on the old row.

12. **OIL Earn's switch on a flying row — its state table** (desktop, Pub Sat, OIL Earn mode). AVALON with R typed: every
    row's switch ON by default. (a) Switch Ace off → off; clear R → off (standby default); retype R → RECORD whether Ace is
    back ON (default) or still off (his earlier choice). (b) AVALON standing by, switch a SPARE ON (D24) → he earns the
    written window; now type R → the window starts at R. (c) An SC MAIN, which earned before: the tick adds no OIL change,
    only the badge and Insights (red team H8) — confirm the tracker figure is identical before and after R on an SC MAIN
    whose R equals START. (d) A public-holiday weekday instead of a weekend → the same as Saturday.

13. **Insights for flying standby rows** (desktop, the week's Insights). A week with SC AM R typed Saturday and one
    hand-ticked AVALON row Friday. Sorties and formations go up by the right amount; a standby sortie joins no blue / red
    mission count; each SPARE's personal sortie count and work hours go up; flying load (D516 narrowed) includes them.
    Untick / clear R → back. The empty-row rule (scenario 5) holds here too.

14. **Copies of a day, a plan, a wave** (desktop). From a day with SC AM R typed and one hand-ticked AVALON row: (a) save
    a day template and apply it to an Unpub day → R travels as it did before; RECORD whether the hand tick travels (the
    red team recommended it should not; the design is silent — a question for him if it does). (b) A saved plan with a
    hand tick different from the live day, brought out on a Pub day → a pending amendment that includes the Flies change,
    named in the changes window. (c) + Wave from a standby wave template → no tick, faint dashes in R and B. (d) Leave the
    week and come back, then reload → every tick and every lit chip survives. (e) Copy a day / + Line inside an SC wave /
    duplicate a row, if the app offers it → RECORD whether the tick is copied.

15. **The chip by keyboard and screen reader** (desktop board). Tab from the badge to the dashed chip → a visible focus
    ring; Enter and Space each tick; again to untick; Escape does nothing harmful. The lit chip on a typed shift: reachable
    or not, but Enter must not untick it, and its explanation (CX the row) must be readable without a mouse hover. On the
    week, the lit chip takes no focus and no press. RECORD the accessible name ("Flies", "Flies — on", or similar).

16. **The faint dash on every standby box, never on a flying line** (board desktop and phone, the week, View-only).
    SC, AVALON and BB lines with R and B empty → a faint grey "–" in both boxes, the colour of the faint "Remarks"; a tap
    leaves the box empty and ready to type (no value placed, no ring, nothing pending on Pub Sat); typing 0630 → "06:30"
    in the ordinary colour, the dash gone; clearing brings it back. Flying lines on the same day keep their faint
    suggested times. The Excel export and PDF print nothing for an empty standby box (never a "–"). Dark and light
    themes. Phone: the dash lines up in its box, the boxes keep their size.

17. **SC AM and SC PM on one day, one flying, one not** (desktop, Unpub). SC AM R 06:30 (flies), SC PM nothing. The same
    man MAIN on AM and SPARE on PM → PM stays standby for him (no warnings from PM); his day from 06:30 to 13:00. Now type
    the PM's B 12:30 → both fly; RECORD that his AM row and PM row do not hard-clash at 12:30–13:00 (the PM's B starts its
    window inside the AM's), or, if it does warn, that the warning names a real overlap in plain words.

18. **Warnings in the middle of the shift window** (desktop, Unpub). SC AM 07:00–13:00 R 06:00, SPARE Viper. Put Viper on
    a ground row 06:15–06:45 → RECORD whether the amber in-time advisory (once MAIN-only) now covers a flying SPARE's
    R → START window too, or whether it is a hard clash, or nothing. AVALON / BB rows with R before START → the same.

19. **Currency and seats on a flying standby row** (desktop). A SPARE whose currency is lapsed, and a SPARE crew pair that
    breaks a seat rule (e.g. two non-instructor pilots, or a WSO in the front seat) → silent while standing by; type R →
    the currency and seat warnings appear on that row, SC currency asked once per shift, not once per row (SF4).

20. **Two tabs** (desktop, same Saturday open in two tabs). Tab A ticks a row by hand; tab B types the shift's R at the
    same time → after sync both tabs agree; tab A's chip turns non-pressable; no tick lost or doubled; the pending count
    the same in both. Then tab A clears R while tab B unticks → both agree.

21. **Member and read-only reach** (member `us`/`us`, phone and desktop). On the board and the week no chip can be
    pressed, no dashed chip is offered; a direct tap or Enter on a lit chip does nothing and raises no message. The
    member's own warnings (if shown to him) name the flying shift. View-only Sched as an admin: the same.

22. **Reload and the error list** (all of the above). After the whole walk: reload, every hand tick and lit chip comes
    back exactly; the browser's error list stayed empty throughout; nothing on the board moved order by itself.

## Break tests (deliberate abuse)

1. **Junk in R or B on a standby line:** type "abc", " ", "7", "25:90" into an AVALON R → the chip lit only if the app
   also counts the time; never a lit chip with a day that starts at nothing, never a lit chip with no OIL and no rest and
   no advisory. A text that cannot be read as a clock must decide the same thing for the chip, the badge and OIL.
2. **Type a literal "–"** into an empty standby R (the same mark as the faint dash) → RECORD: it must not make the shift
   fly, and the export must not print it as a time.
3. **Hammer the chip:** double-tap / triple-tap the dashed chip fast (phone) and double-click (desktop) → it ends in a
   clear state, Undo steps match the presses, a Pub Sat that ends where it started reads 0 pending.
4. **Press the chip while a time box is mid-edit:** focus the R box, type 06, then press Viper's chip without leaving the
   box → the R is saved or put back cleanly, the chip state follows the final R, no half state.
5. **Delete the wave with a ticked row, then Undo** → the tick comes back; delete one ticked line, then Undo → the same;
   reload after each.
6. **Hand-tick every row of a shift, then type R, then clear R** → all four stay lit (all were ticked by hand) — and the
   pending count on a Pub Sat says four changes, not eight.
7. **A ticked row moved across shifts by drag** (SC AM SPARE row dragged to SC PM, if allowed) → the tick travels or is
   dropped consistently, and the badge counts it in the right shift.
8. **R typed later than END on AVALON** (19:00–07:00, R 08:00) or on SC AM (R 14:00) → no negative or 24-hour day, no
   false long-day note, no OIL beyond END; RECORD what the screen says.

## Most likely missing — places to look first

- **The changes window, "To go out", History and Undo's words for a hand tick**, and where the amendment mark sits on a
  published day (the chip has no box for a gold dot) — the board and the week, desktop and phone.
- **The earlier published version's look and the read-only board** — an older drawing path that may draw no chip, or a
  dashed chip that looks pressable to a member.
- **The next-week peek** — built separately from the week; its "✓ FLIES" text and its day figure.
- **The + Wave picker's wave-kind notes and the Logic page's "Standby" line** — one shared sentence for each kind; it
  may still say standby lines are outside the warnings or that a rally there is "shown only" (D1041, now narrowed).
- **The crew palette's barred reasons and the puck's warning ring** on a flying SPARE / AVALON / BB row — the ring rules
  for exempt lines were written for standby-only warnings.
- **Inputs:** a member's local-leave request landing on a flying AVALON SPARE — the request card's and the Inputs
  calendar's own warnings, which may still treat the seat as standby.
- **Copies:** day templates, saved plans, copy-a-day, + Line and a dragged row — whether the hand tick travels (unruled;
  RECORD and put to him if it does).
- **Insights' per-person figures** (a SPARE's own sorties and work hours) beside the day totals; the blue / red mix.
- **OIL Earn's default for AVALON and BB items** — those kinds were skipped before entering the OIL sum (D24's note); a
  flying row must enter it ON, while their duty desks stay out.
- **The amber BB line for a hand-ticked row**, and its tap landing on the START box on the phone.
