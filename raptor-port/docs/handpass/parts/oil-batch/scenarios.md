# The OIL batch (20 Oct 26) — independent scenario design

Written blind to the branch: read only `main`'s code (`git show main:…`), the rulings' full rows (D2, D31, D48, D49,
D81, D101, D103, D142, D591, D592, D837, D901), the three backlog items and the bug-check order §6 / §7.4. I have not
read the branch's commits or diff. "RECORD" below means: I cannot say from the rulings what is right — write down
exactly what the screen says and put it on his look card.

**The demo-data rule (D56) applies throughout:** nothing below is about data already stored; every scenario builds its
fixture through the app's own controls on a fresh world, and every finding it can raise would happen again to new data.

**Walker traps worth naming before anyone starts** (all from `main`'s code and the backlog):
- The app's "today" is the real date (20 Oct 26), the demo week is 13–19 Jul 26. A balance is reckoned **as of today**
  with the expiry policy applied (`sync.ts oilCreditBidAgainst` → `figureCtxOf()`), so an expiry setting shorter than
  about 95 days makes the 18 Jul credit already expired and silences the Unpublish warning. Keep the policy at
  "Forever" except in U-14.
- To "spend" the Saturday's credit the take must come AFTER 18 Jul (a debit draws on credits before it). The seed's
  bidding window is Jan–Mar only. The cheapest real route is an admin's OIL **correction** (a negative entry) dated
  after 18 Jul from the OIL tracker's credit bar (sign chip −) — which is also change 3's object. A real Leave War OIL
  bid after 18 Jul needs the bidding dates widened first (Leave War → bidding dates); do that once in U-01 so at least
  one scenario spends by a BID, the words' own case.
- Seed balances useful as-is: SLAMMED's OIL opens at 0 (one credit, one spend = exactly 0); DECAL's opens at −4.5
  (already below zero before anything happens).
- Logic page: "Edit rules", type, then Tab, and press Done twice if the first does not take (`[LOGIC-DONE-FIRST-PRESS]`,
  `[LOGIC-REDRAW-DROPS-TYPING]` — older faults, not this batch's; re-read the value on screen before going on).
- Never sign in again mid-fixture on an unwritten world (order §7.7).

---

## 1. Roll-call — every place each change must show, and whether it is in reach

Columns: SHOWS the new sign · the gesture USABLE there · what else is painted on the same pixels. Marks are what the
walk must fill; the third column is my prediction from `main`'s code.

### Change 1 — [UNPUB-WARN-AL-RESTORES]

| # | Place | Must show / do | Same pixels / note |
|---|---|---|---|
| R1.1 | Edit Schedule week, the day head's **Unpublish** button, desktop 1440 | first tap warns only when the version left after the press leaves someone below zero; words say Original vs amendment | toast strip at the foot; the day's sign-off strip |
| R1.2 | the same at phone 390 | same | the toast over the bottom of the week; the button's size in the day head |
| R1.3 | **Scheduler Board's publish strip** (`board.ts` draws the same `dayStatHTML`, so the same Unpublish button is on the Board) | same warning, same arm, same done words | the Board covers the top bar; does the toast draw above the Board? |
| R1.4 | **the armed button's own face and hover title** — "Withdraw — confirm", title "…its OIL credits are bid against on the Leave War; republish to restore them. Tap to confirm." (`html.ts`) | for an amendment this title is wrong in the same way the toast was ("republish to restore them" — the earlier version's OIL is already back) and still says "bid against", the wording D837/N4 retired | **likely MISSING** — a second writer of the same warning |
| R1.5 | the done note after the second tap (Original: "…withdrawn from the Leave War until it is republished") | for an amendment it must not say the credits leave the war | toast |
| R1.6 | Leave War grid — the person's FO / HO box on the date | after an AL withdrawal shows the EARLIER version's amount (½ ↔ 1) or no box | other bids on the same cell |
| R1.7 | Leave War OIL tracker — the person's balance and the credit's box (earned, D400) | follows R1.6 | — |
| R1.8 | the top bar's Undo / Redo of the Unpublish | the OIL goes back and forth with it, no warning on undo/redo | — |
| R1.9 | a weekday (no OIL) and a holiday weekday (HO) | weekday: never warns; holiday: same rule as a weekend | — |

### Change 2 — [OIL-ZERO-SPAN-SORTIE]

| # | Place | Must say | Note |
|---|---|---|---|
| R2.1 | the day's warning list — the line's advisory "Flight times — take-off and landing are the same" | "earns nobody any OIL" when the line measures nothing; "still earns from the report and debrief" when it does | `validate.ts fltNoLenMsg` |
| R2.2 | the day's warning list — "No OIL earned — a row has no usable times" (a RED item, `OIL_NO_TIMES` is hard) | names the line, weekends and holidays only | it is one of the warnings kept LIVE on a published face |
| R2.3 | Edit Schedule week — the marked landing box's own hover words | same sentence as R2.1 | `html.ts` builds its own call to the sentence |
| R2.4 | Scheduler Board — the marked box's words | same | `board.ts` builds its own call |
| R2.5 | the next-week peek — the marked box's words | same — and the peek reads a day blob, not the live day, so the in-time it must read is next week's own | `peek.ts` builds its own call AND its own hide key from that sentence |
| R2.6 | the note after publishing ("Saturday 18 Jul published and approved. The RAP 1 line has no usable times, so nobody on it earns OIL.") and its second form ("… earned nobody any OIL — …") | names the line | read from the ISSUED snapshot (`sync.ts oilBlindLine`) |
| R2.7 | the same note after **Publish AL1** (it rides behind an amendment's receipt) | names the line | — |
| R2.8 | the Logic page's rule list — FLT_NO_LEN's line: "A flying line still earns its OIL; a standby shift with no length earns none" | now false in the zero case | **likely MISSING** — the app prints the claim here too |
| R2.9 | the Logic page — OIL_NO_TIMES's line "a row with someone on it and no usable times…" | true already; check it still reads right | — |
| R2.10 | OIL Earn mode on the line (D31) | no switch; "Nothing on this row can earn OIL" or the reason; no green OIL bar on its pucks (D1) | must agree with R2.1 — if the mode says "earns" while the advisory says "earns nobody", that is a finding |
| R2.11 | the Leave War — no FO/HO credit lands for a man on that line alone | — | the money was already right on `main` (pinned by `oilworkstart.test.ts`); confirm, don't re-prove |

### Change 3 — [LW-OIL-DATECHIP-HIDDEN]

| # | Place | Must do | Note |
|---|---|---|---|
| R3.1 | OIL tracker, everyone's view, a correction's editor → its date box | calendar opens on top of the rows, inside the screen; the day pressed is the date saved | the editor sits inside `.oil-e { overflow:hidden }`, the lane is narrow |
| R3.2 | the same in ONE person's tracker (opened from the figures bar's OIL column / the person) | same | different scroll position, `scrollIntoView` on open |
| R3.3 | the credit bar's own date box (CreditForm) | unchanged — still opens on top | regression neighbour |
| R3.4 | an AWARD's editor | date shown read-only, no calendar (D260's reading; the store refuses a changed date) | negative check |
| R3.5 | phone 390 | the phone card (centred) inside the screen, a finger's press on a day meets it | order §7.2: prove on screen before pressing |
| R3.6 | member role (`us`/`us`) | no editor at all (D1008: sees, does not edit) | negative check |

---

## 2. Scenarios — change 1 (Unpublish), ranked most-specialised first

Common fixture **F1** (through the app): admin `ad`/`a`. Saturday 18 Jul: put SLAMMED on a flying line (RAP 1, take-off
10:00, landing 11:30, nominal report and debrief at their defaults) and on nothing else; make sure the day earns him
a full day; sign the four sign-offs; **Publish day** (Original). Leave War → OIL tracker: SLAMMED shows +1 earned on
18 Jul, balance 1. Spend it: the credit bar, SLAMMED, −1, dated 25 Jul, reason "spent" (or, in U-01, a real OIL bid on
25 Jul after widening the bidding dates). His balance reads 0.

**U-01 — An amendment withdrawn to a LOWER credit, spent → warns, with amendment words** (the backlog's core case)
- Setup: as F1, but publish the Original with RAP 1 giving SLAMMED only **½** (a short line), and spend that ½ by a
  real Leave War OIL bid after 18 Jul. Then lengthen the line (an earlier in-time) so it is a full day, sign,
  **Publish AL1** (SLAMMED now +1, balance ½). Spend another ½ (balance 0). Withdrawing AL1 would put back the
  Original's ½ → balance −½.
- Action: tap **Unpublish** once.
- Expected: it warns (the earlier version leaves him below zero), the words name the amendment case, not "withdraws
  them until you republish" (the backlog item; D142, D101). Exact words: RECORD — they are not among his words of record
  (D837 covers the Original's only), so they go on his look card. Second tap: the done note says AL1 is withdrawn, the
  Original is the issued schedule, and says what happened to the OIL in the amendment's terms; RECORD the words.
  Leave War: his 18 Jul box reads ½, balance −½.
- Disproved by: no warning; the Original's words ("…withdraws them until you republish"); a done note that says the
  credits "are withdrawn from the Leave War"; a box that disappears instead of reading ½.

**U-02 — An amendment withdrawn to a HIGHER credit → one tap, no warning** (the backlog's screen evidence: 0 → 0.5)
- Setup: Original gives SLAMMED a full day; shorten the line, Publish AL1 (½); spend ½ so balance 0.
- Action: tap Unpublish once.
- Expected: it unpublishes on the one tap (withdrawing AL1 RAISES him to ½ — D142); no OIL sentence that says
  credits leave the war. Leave War: box 1, balance ½.
- Disproved by: a warning, an armed "Withdraw — confirm" face, or the balance not moving to ½.

**U-03 — An amendment withdrawn to an EQUAL credit → no warning**
- Setup: Original full day; AL1 changes something else on the day (a ground row, another man) that leaves SLAMMED at
  a full day; spend his 1 → 0.
- Action: Unpublish once.  Expected: no warning, one tap; balance stays 0. Disproved by: a warning.

**U-04 — The Original withdrawn, spent → warns with the words of record (regression)**
- Setup: F1 (Original only, spent).  Action: tap once, then again.
- Expected: first tap exactly "Some of Saturday’s OIL credits are already spent on the Leave War. Unpublishing
  withdraws them until you republish. Tap again to confirm." (D837 N4); the button turns "Withdraw — confirm"; second
  tap "Saturday unpublished. It is a draft again, and publishing reissues the Original. Its OIL credits are withdrawn
  from the Leave War until it is republished." (N2); Leave War box gone, balance −1 (D2).
- Disproved by: any changed word, or the box surviving.

**U-05 — The armed button's face and hover title in the amendment case (R1.4 — least-shared surface)**
- Setup: U-01 after the first tap.  Action: hover the armed button (desktop), read its title; at 390 read its face.
- Expected: the title must not say "republish to restore them" nor "bid against" for an amendment withdrawal — it must
  agree with the toast just shown. RECORD its words; if it still reads the old sentence, that is a MISSING writer of
  the same warning (order §6, "a wording ruling … gets its own small roll-call").
- Disproved by: toast and button title disagreeing about what happens to the OIL.

**U-06 — The same on the Scheduler Board (R1.3)**
- Setup: U-01's fixture, open the Scheduler Board on Saturday.  Action: tap the Board's Unpublish once, read, tap again.
- Expected: identical warning, armed face and done note to Edit Schedule; the toast visible above the Board (not under
  it) at 1440 and 390. Also: arm on the week, open the Board — the Board's button is already armed (one shared arm):
  RECORD whether the first tap on the Board then commits without a second warning, and say so on the look card.
- Disproved by: a different sentence on the Board, or a toast hidden behind it.

**U-07 — Withdraw AL2 → back to AL1, not to the Original**
- Setup: Original ½, AL1 1, AL2 ½ (three publishes); SLAMMED spends so that AL1's 1 keeps him ≥ 0 but the Original's ½
  would not.  Action: Unpublish once.
- Expected: no warning (AL1 is what comes back — D142, `priorVerId`); balance rises by ½; then Unpublish AL1 → this
  time it warns (the Original comes back). Disproved by: a warning on the first press (reckoned against the Original
  or against none), or silence on the second.

**U-08 — Two men, one up and one down**
- Setup: Original has SLAMMED on RAP 1; AL1 takes SLAMMED off and puts CAGE on (both full days). Spend CAGE's credit
  to 0; SLAMMED holds nothing from that day.  Action: Unpublish AL1.
- Expected: warns (CAGE goes below zero; SLAMMED's coming back does not cancel it); second tap: CAGE's box gone,
  SLAMMED's box back at 1. RECORD whether any words name CAGE.
- Disproved by: no warning; SLAMMED's credit not returning.

**U-09 — The earlier version was published BEFORE the day became a holiday (D2 + D142 + frozen evidence)**
- Setup: a weekday, e.g. Wed 15 Jul. Publish its Original (earns nothing — a working day). On the Leave War, make
  15 Jul a public holiday. The day says it waits for a republication (D2). Put SLAMMED on a line, Publish AL1 → he
  earns HO. Spend it to 0.  Action: Unpublish AL1.
- Expected: warns — the Original went out as a working day and pays nothing (its evidence froze `earns` false), so
  his HO goes; words in the amendment form. Leave War: HO box gone, balance −½/−1.
- Disproved by: no warning (reckoned the Original under today's calendar, i.e. as a holiday); HO box surviving.
- Mirror (optional, may be carried by a test): a holiday LIFTED between Original and AL1 — withdrawing AL1 brings the
  Original's HO back; no warning.

**U-10 — The earlier version was published under OTHER Logic values (D592 (4))**
- Setup: Original published with debrief 2h giving SLAMMED a full day. Change Logic "Debrief after landing" to 0 and
  shorten nothing; the day reads pending (D592 (8)); sign and Publish AL1 — now ½ under the new value. Spend so AL1's
  ½ leaves 0.  Action: Unpublish AL1.
- Expected: no warning — the Original comes back with ITS kept values (full day), balance +½. Disproved by: a
  warning, or the Original reckoned under today's debrief of 0 (½ or none).

**U-11 — A credit that never landed (Astra's check list) — the clash rule on the earlier version**
- Setup: SLAMMED has an undecided half-day leave bid (AM) on 18 Jul. Original: RAP 1 in the morning → his credit
  overlaps the bid and does NOT land (the day is flagged). AL1 moves RAP 1 to the afternoon → the credit lands. Spend
  it to 0.  Action: Unpublish AL1.
- Expected: warns — the Original's credit would clash and not land, so he loses AL1's. Reverse (optional): Original
  lands, AL1 clashes — withdrawing AL1 raises him, no warning.
- Disproved by: no warning (the reckoning counted the Original's credit as landed when it could not).

**U-12 — A man already below zero, and the press raises him (DECAL, −4.5)**
- Setup: Original gives DECAL ½; AL1 gives him 1. His balance is still negative.  Action: Unpublish AL1.
- Expected per the promise's literal words: warns ("…warns only if that leaves someone below zero" — he is). But the
  press LOWERS his balance from −3.5 to −4.0 here; and with Original 1 / AL1 ½ it RAISES him yet he is still below
  zero. RECORD both; put to him: should a press that does not lower anyone warn? (Older behaviour also warned for an
  already-negative man; not new.)
- Disproved by: nothing yet — this is a question, not a verdict.

**U-13 — Orders around the arm (§7.4)**
- a) Arm on AL1 (U-01 after tap 1), then **Publish AL2** (needs a fresh change and sign-offs), then tap Unpublish once.
  Expected: a fresh reckoning for AL2 (the arm was about AL1). From `main`'s code the arm survives a publish
  (`UNPUBARM` resets only per session/week) and the next tap would commit AL2 straight away. RECORD; a commit with no
  warning about AL2 is a finding if AL2's withdrawal leaves someone below zero.
- b) Arm, then go to next week and back. Expected: arm gone, button reads "Unpublish", next tap warns again.
- c) Arm, then on the Leave War delete the spend; come back, tap. Expected: unpublishes; no OIL sentence in the done
  note (nothing was spent). Disproved by: the done note still claiming credits withdrawn.
- d) Arm Saturday, tap Unpublish on Sunday (no clash) — Sunday unpublishes, Saturday's arm is cleared. RECORD.
- e) After U-01's second tap: Undo, then Redo, then reload. Expected: undo brings AL1 back and SLAMMED's 1; redo
  withdraws it again without a warning; after reload the state holds (persistence funnel). Then Publish AL1 again →
  balance as before (D101: no "Reissue" button, "Publish AL1" brings it back).

**U-14 — Expiry: the Saturday's credit already expired → no warning (from `main`'s own comment)**
- Setup: F1 spent; set the OIL policy to expire after 30 days (today 20 Oct → 18 Jul's credit has expired).
- Expected: RECORD — by the code's comment an expired credit is worth nothing to take away, so no warning; but if the
  spend drew on it before it expired, removing it may strand that spend. Put back "Forever" afterwards.

**U-15 — Negatives (one tap each)**: a weekday Original with no holiday → one tap, no OIL words; a Saturday where
nobody spent anything → one tap, done note with no OIL sentence; no Leave War period for the date (e.g. a 2027 week if
reachable) → no warning (nothing landed).

---

## 3. Scenarios — change 2 (a take-off-equals-landing sortie)

Common fixture **F2**: Saturday 18 Jul, add a flying line RAP 3 with CAGE in the front seat and nobody else on the day
for CAGE; take-off 10:00, landing 10:00.

**Z-01 — Still earns (D49), with the nominal report** — Logic at defaults, no in-time. Expected: the advisory says the
line still earns from the report and debrief; RAP 3 is NOT in "no usable times"; OIL Earn mode offers the switch.
Disproved by: the new "earns nobody" words here (over-reach).

**Z-02 — Debrief 0, in-time typed = take-off (the backlog case)** — Logic "Debrief after landing" 0; type the wave's
In-time for RAP 3 as 10:00. Expected: advisory says RAP 3 earns nobody any OIL (not "still earns from the report and
debrief"); the red "No OIL earned — a row has no usable times" item names "the RAP 3 line"; the landing box's hover
words on the week, the Board and (Z-07) the peek say the same; OIL Earn mode: no switch, its reason shown (D31), no green
bar on CAGE (D1). Disproved by: any surface still saying it earns, or the red item not naming it.

**Z-03 — Debrief 0, the formation's own Rally (R) box = take-off, no wave in-time** (the second entry point, D1041 /
D1026). Same expectations as Z-02.

**Z-04 — Debrief 0, nominal report 0, nothing typed** (the old route). Same expectations as Z-02.

**Z-05 — Debrief 0, in-time ONE MINUTE before take-off (09:59)** — the line measures one minute and earns ½ (any
positive minute earns half). Expected: advisory "still earns…"; not in the red list. Disproved by: "earns nobody".

**Z-06 — Debrief 0, in-time AFTER take-off (10:01)** — the app reads a later clock as the evening before (D503) → a
~24h day, full. Expected: advisory "still earns"; not named. RECORD the advisory words; the in-time warning itself is
not this batch's.

**Z-07 — The next-week peek (R2.5) and its hide** — Put F2 + Z-02 on NEXT week's Saturday (25 Jul), go back to 13 Jul,
open the peek. Expected: RAP 3's box marked with the "earns nobody" words. Then on 25 Jul hide that advisory (✕),
return, open the peek: the box is NOT marked (D469). Then change the debrief back to 2h: on 25 Jul the advisory returns
by itself with the "still earns" words (a changed message unhides — `warnhide.ts`), and the peek agrees with the week.
Disproved by: the peek marking a hidden warning, or week and peek disagreeing.

**Z-08 — A wave In-time that applies to ANOTHER formation** — wave has RAP 2 (10:00–11:00) and RAP 3 (10:00–10:00);
type an In-time line that applies to RAP 2 only, at 10:00; debrief 0, nominal report 3h. Expected: RAP 3 uses the
nominal 07:00 report → still earns; advisory "still earns". Disproved by: RAP 3 named as earning nothing.

**Z-09 — Published face, Logic changed afterwards (D592 (4), LIVE_ON_FACE)** — publish Saturday with Z-02's in-time but
debrief 2h (CAGE earns ½). Then set debrief 0. Expected: the OIL line reads pending (D592 (8)); the Leave War still
holds CAGE's ½. RECORD what the published face's red "no usable times" item and the advisory say: if they say RAP 3
"earns nobody" while the issued version still pays him ½, the two disagree — put to him which the published face should
speak from. Then republish (AL1): the note after publishing names RAP 3; CAGE's ½ goes.

**Z-10 — The note after publishing (R2.6, R2.7)** — Z-02 on Saturday, SDO desk earning someone else: Publish day.
Expected: "Saturday 18 Jul published and approved. The RAP 3 line has no usable times, so nobody on it earns OIL."
Then a day where RAP 3 is the only work: "Saturday 18 Jul earned nobody any OIL — the RAP 3 line has no usable times".
Then an AL publish carrying it: the same line behind the amendment's receipt.

**Z-11 — A man on the zero sortie AND on a desk** — CAGE on SDO 08:00–12:00 and on RAP 3 at 16:00 (Z-02 conditions).
D592 (5) counts first event to last end. Expected: RECORD whether CAGE earns ½ (desk only) or a full day (08:00 to
16:00); and the red item says "nobody on it earns OIL" while CAGE earns from the desk. Older sentence shape for desks
too; put the reading to him only if the amount differs from what he would expect.

**Z-12 — Holiday weekday** — Z-02 on a weekday made a holiday on the Leave War: named in the red item (the warning list
speaks on weekends and holidays). Plain weekday with Z-02: the advisory's words RECORD (no OIL is earned on a weekday
anyway — "earns nobody any OIL" is true but may read as alarming); not in the red list.

**Z-13 — Regressions**: a standalone shift (SC MAIN) 08:00–08:00 keeps "a shift with no length earns nobody any OIL
until it is fixed" and stays named; a cancelled line (✕) with equal times — no advisory; an empty line with equal times
— no advisory; Logic page FLT_NO_LEN rule line (R2.8) — RECORD; if it still says "A flying line still earns its OIL"
unconditionally, it is a missing writer.

---

## 4. Scenarios — change 3 (the correction's date calendar)

Fixture **F3**: Leave War → OIL tracker (everyone), admin. Give SLAMMED a correction: credit bar, −1, date 30 Sep 26,
reason "test". (Repeat the backlog's own case: WARDEN −1.)

**D-01 — Desktop 1440, the backlog case** — tap the correction's box → editor; tap its date box. Expected: the calendar
is drawn, on top (the element at the card's centre is the card — `elementFromPoint`), inside the screen; press 5 Oct;
the box reads 5 Oct; Save → the entry moves to 5 Oct in its lane; reload → still 5 Oct. Disproved by: the box reading
"open" with nothing drawn, a press landing on a row behind, the date reverting.

**D-02 — Phone 390** — same; prove the card is on screen before pressing (order §7.2: no scripted scroll-into-view);
a press at a point on a day meets it.

**D-03 — A correction near the foot and near the right edge** — scroll the tracker so the editing box sits low / far
right (the lanes are wide). Expected: the card opens above / pulled left, never off screen. Then scroll the tracker's
own scroll box with the calendar open (a finger drag at 390, a scrollbar drag at 1440): the card follows its box or
stays put on screen; never detached over another row with the box gone.

**D-04 — Cancel after picking** — pick a new day, then Cancel. Expected: date unchanged after reload.

**D-05 — Pick, then tap another correction** — editor A picked a new date, not saved; tap correction B. Expected:
editor B opens with B's own date; A unchanged. RECORD (no prompt expected).

**D-06 — A date in another year (2027)** — Save. Expected: the entry leaves the 2026 lane and appears in a 2027 lane;
balance unchanged. With the history window set to "Last N months", RECORD whether the entry vanishes from view and
whether anything says so.

**D-07 — The award's editor (R3.4)** — tap an FO/HO award: its date is read-only text, no calendar. Disproved by: a
calendar opening, or a picked day being saved onto an award.

**D-08 — The credit bar's date box with a selection open (R3.3, the outside-tap listener)** — select two people (bar
open), open the bar's date box, press a day. Expected: the bar stays open with the date picked (the calendar's layer is
"inside"). Then, with the bar open, tap a correction to edit and open ITS date box: RECORD — the tap on the correction
closes the bar (outside tap) and the editor opens; its calendar works.

**D-09 — Undo of the date change** — after D-01's Save, top bar Undo: back to 30 Sep; Redo: 5 Oct.

**D-10 — Member** — sign in as `us`/`us` (a fresh browser context, not mid-fixture): the correction shows (D1008) but a
tap opens no editor.

**D-11 — Keyboard (desktop)** — Tab to the correction box, Enter → editor; Tab to the date box, Enter → calendar with
focus on the picked date; arrow + Enter picks; Escape closes the calendar and leaves the editor open.

**D-12 — Cross-check with change 1** — move SLAMMED's spend correction from 25 Jul to 10 Jul (before the Saturday).
RECORD whether the Unpublish warning of U-04 still fires (a debit before the credit cannot draw on it; whether the
balance still goes below zero depends on how the tracker counts an uncovered take — "not covered").

---

## 5. Break tests (a careless person's inputs)

1. In-time typed "10:00 " with a trailing space, "1000", "10.00", "10:00L", "10:0" — unreadable counts as nothing
   typed → nominal report (D592 (7)); with nominal 0 + debrief 0 the line earns nothing and the advisory must say so;
   with nominal 3h it earns and must not.
2. Take-off "24:00", landing "00:00" (or "0000"/"2400") — RECORD whether the app reads them as the same minute, a
   24-hour line or unreadable, and that the advisory, the red list and the OIL agree with each other.
3. Debrief typed "0:00", "00", "-1", blank on the Logic page — whichever the page accepts as zero must give Z-02's words;
   a refused value must leave the old value on screen.
4. Take-off and landing equal AND the line cancelled, then un-cancelled — the advisory appears/disappears with it.
5. Unpublish tapped three times fast (double-tap on a phone) on U-01 — exactly one withdrawal (AL1 only, not AL1 then
   the Original); the third tap, if it lands on the fresh "Unpublish" of the Original, is a new first tap (warns if due).
6. Unpublish on the Board and the week in quick succession for the same day — one withdrawal.
7. Correction date: open the calendar and press the SAME day it already has, then Save — no change, no error; press
   today; press a date before every credit (1 Jan 26) — RECORD the balance and "not covered".
8. Correction amount edited to 0 or +1 in the same edit as a date change — refused with "The amount must be a number
   other than 0" / "A correction stays a correction…" and the date NOT saved either.

---

## 6. Explicit negatives — checked, nothing to test there

- **The OIL money of a zero sortie** is unchanged by this batch's promise (only its words are): `main` already credits
  nothing (pinned by `oilworkstart.test.ts`); R2.11 confirms on screen once, no more.
- **"Load onto working copy" / "Switch to this plan"** change the working copy only, never the issued version, so they
  move no OIL and cannot reach the Unpublish reckoning — nothing to test for change 1 beyond U-13.
- **A member** cannot see Unpublish (`canEditSched`), and a scheduler is always an admin (D785) — one role to walk.
- **A previewed older version** hides Unpublish (`DPREV`) — no new door there.
- **A quarantined week** draws no Unpublish (`protectedWeek`) — not reachable through the app's controls.
- **The Leave War's per-person award on the same date** stays out of the reckoning by design (N16 comment) — U-04/U-01
  should leave any hand award untouched; no separate scenario.

---

## 7. Most likely missing

1. **The armed button's own title on Edit Schedule and the Board** ("…bid against on the Leave War; republish to
   restore them") — a second writer of the Unpublish warning, wrong for an amendment and still in the retired wording
   (U-05, R1.4).
2. **The four separate callers of the zero-sortie sentence** — warning list, week box, Board box, next-week peek — each
   builds its own call from the take-off alone; the new words need the line's in-time / Rally and the debrief, so any
   caller not handed them keeps "still earns from the report and debrief", and the peek's hide key (built from the
   sentence) can stop matching the week's (Z-02, Z-07). Plus the Logic page's rule line "A flying line still earns its
   OIL" (R2.8).
3. **The earlier version's OWN evidence in the reckoning** — its frozen holiday state and its kept Logic values and the
   clash rule — rather than today's calendar, today's Logic or an assumed landing (U-09, U-10, U-11); and the arm
   surviving a new publish so AL2 is withdrawn on one tap with AL1's reckoning (U-13a).
4. **Which values the published face's live "no usable times" item speaks from** after a Logic change (Z-09) —
   today's, while the issued version still pays under its kept ones.
5. **Words not his of record**: the amendment form of the warning and of the done note, and the zero-sortie advisory's
   new sentence, are new text — they belong on his look card (D837 covers only the Original's N4 / N2).
