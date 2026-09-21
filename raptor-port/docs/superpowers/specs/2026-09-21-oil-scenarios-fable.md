# Fable 5.1 — the hands-on scenario list for the OIL build (21 Sep 26)

Designed, not executed, at the owner's instruction. 44 scenarios plus one shared fixture (S0),
ranked; S1–S12 are "eyes" work, the rest ordered gestures, retractions and publish paths.

**Two of its top three predicted defects that had already been found by hand and fixed** —
S1 (the week view's flying-line seats) and S2 (the week's input pucks). That is the method
working: a reader who is TOLD to look for unwired surfaces finds them.

Companion: `2026-09-21-oil-scenarios-codex.md`. Results: `2026-09-21-oil-handpass-results.md`.

---

# THE HANDS-ON TEST PASS — the OIL build (branch `claude/oil-auto-remove-design`)

Designed by Fable 5.1, 21 Sep 26, from the design doc, the behaviour register, the fix plan, the
build handoff and a read of the surfaces in the code. Every scenario below is meant to be DRIVEN in
the running app and LOOKED AT. None of them is a unit-test restatement.

## How to read this

- **Ranked.** S1 is the one most likely to find something. The first block (S1–S12) is "eyes"
  work — surfaces and readings; the rest are ordered gestures, retractions, publish paths and the
  edges of the measure. Within each block, most-dangerous first.
- **Six fields each**: Title · Why this could break · SET UP · DO · EXPECT · Rulings.
- **"Reading the code suggests …"** marks a suspicion I formed by reading; it is a guess until the
  app shows it. Where I say **likely real**, I found the call site that never asks for the thing.
- **Where things are, in app words.** Login `ad`/`a` is the admin/scheduler; `us`/`us` a squadron
  member. The seeded week is Mon 13 Jul 26; **Saturday 18 Jul** carries one duty desk (SDO
  PLASMA 08:00–18:00) and **Sunday 19 Jul** one (SDO SPACEMAN 08:00–18:00); both are unpublished.
  The **OIL Earn** button is on the phone's THIS DAY bar at the top of the day's board, and on a
  desktop in the board's action row (beside Undo/Redo). Inside the mode that bar turns green,
  reads OIL EARN, and carries **Nothing today earns** and **✓ Done**. The green bar is the strip
  down the LEFT edge of a puck (full height = full day, bottom half and paler = half day). The
  **count chip** is the small number beside an ALL / ALL AVAIL puck. The **Leave War** tab holds
  the grid (a credit shows as FO/HO on the person's day) and the **OIL tracker** (one box per
  credit: amount, date, "Auto", reason FLT / SIM / Duty / the input's type, and what's left). The
  **amendment panel** is the day's pending "N changes" chip / "view all changes"; the **history**
  is the day's change history list.
- **Declaring a public holiday** the way the demo does: on the Leave War grid, write the PH word
  into the top event row on that date. Removing it is clearing that cell.
- **When a scenario says "the standard Saturday"**, build S0 once and keep it. Publish only where a
  scenario says so — several scenarios depend on the day being unpublished first.

---

## S0 — THE STANDARD SATURDAY (build once, reuse)

Admin, week of 13 Jul 26, Saturday 18 Jul, on the board. Keep the seed's SDO PLASMA 08:00–18:00.
Add, from the board's own controls:

- **Flying wave (1st wave)**: line VIPER, T-O 10:00, land 11:00, FCP YETI, RCP SHAFT. Line COBRA,
  T-O 14:00, land 15:30, FCP RAZER, RCP any WSO. (VIPER's working day is report 07:00 → release
  13:00 = exactly six hours = **HO**; COBRA's is 11:00 → 17:30 = 6h30 = **FO**.)
- **SC wave**: MAIN shift 06:00–14:00 crew BAPSTER + any WSO; SPARE shift 06:00–14:00 crew two
  others.
- **AVALON wave**: one line 09:00–12:00 with two crew, plus its own duty block from the + Block
  picker (a template "for wave AVALON") with a man on it, 09:00–12:00.
- **Duties**: keep SDO PLASMA 08:00–18:00; add SXO with a man and **no times**; add an ops desk
  with a man, 07:00–07:00 (zero length).
- **Sims**: OFT row EP-6 14:00–15:30 with two crew; an AMT block whose BOX row is 09:00–11:00 with
  two pax.
- **Ground Programme**: OCU REVIEW 09:00–11:00, STIFF; ADMIN 13:00–14:00 with a man, then press
  its ⓘ (info-only).
- **Common Programme**: FAMILY DAY 10:00–14:00, people = ALL AVAIL; MASS BRIEF 15:00–16:00 with
  two named men (one of them STIFF).
- **Inputs** (file from the board: Ground Programme "+ Inputs" for commitments, Unavailable
  "+ Add" for leave/OD; each OIL question answered as stated):
  - Training 09:00–12:00 on Sat for person T (auto-lands on the Ground Programme) — answer **Yes**.
  - Overseas duty, all day Sat, person O — answer **Yes** (lands under Unavailable as OD).
  - Leave, all day Sat, person L.
  - ATT B (the medical that says "no flying, may still work"), all day Sat, person M.
  - Meeting 13:00–14:00 on Sat for person N — answer **No**.
- Leave War: confirm a war holds July 2026; Show SANS **off**.

Note which callsigns you used for T, O, L, M, N and the unnamed seats; the scenarios refer to
them by letter.

---

# BLOCK A — SURFACES AND READINGS (eyes first)

## S1 — The WEEK view's flying lines and SC shifts: is the green bar there?

**Why this could break.** The owner found the BOARD's cockpit seats drawing no bar. The board's
seat builder was fixed. Reading the code suggests the WEEK view's cockpit seats are drawn by a
different builder that still never asks for the decoration — the same missing-call-site shape,
one surface over. **Likely real.**

**SET UP.** S0, then publish Saturday (sign the four roles, Publish day).

**DO.**
1. Leave the board. On the Edit Schedule WEEK view, look at Saturday's 1st wave, COBRA line, and
   the SC MAIN shift.
2. Open the board for the same day and look at the same seats.
3. Open the View-only schedule page and look again.
4. Repeat on a phone width.

**EXPECT.** RAZER (COBRA) and BAPSTER (SC MAIN) wear a full-height green bar on ALL THREE surfaces;
YETI and SHAFT (VIPER) wear the half-height paler bar on all three. If the week or the view page
shows bare pucks while the board shows bars, that is the S1 defect. Leave War: RAZER FO (FLT),
BAPSTER FO (FLT), YETI HO, SHAFT HO — the money must be right whichever surface is wrong.

**Rulings.** OIL20, OIL21a, OIL21b, OIL30.

## S2 — The overseas-duty earner: his bar on the board versus the week

**Why this could break.** Overseas duty has no row on the programme; the only puck it has is in
the Unavailable block. The board's Unavailable panel was wired to draw his bar. Reading the code
suggests the WEEK's Unavailable block (and its Personal Inputs group, and the SANS cards) draw
their pucks with no decoration at all. **Likely real** for the week.

**SET UP.** S0, Saturday published.

**DO.**
1. Board → Unavailable panel: find person O (OD).
2. Week view → Saturday's Unavailable block: find O.
3. View-only page → same block.
4. Also look at person T (Training, landed on the Ground Programme) in the board's Personal
   Inputs panel (unfold it) and on the week's Personal Inputs group.

**EXPECT.** O wears a full-height bar everywhere he is drawn (an all-day OD answered Yes is a full
day). T wears a bar on his Ground Programme row AND on his Personal Inputs row (the two are one
event). Leave War: O FO with reason "Overseas duty", T HO (09:00–12:00 is three hours) with reason
"Training". Any surface where O has no bar while the board shows one is a miss.

**Rulings.** OIL12, OIL20, OIL21a, OIL10.

## S3 — Item switches drawn on rows that can never earn

**Why this could break.** In the mode an item's NAME becomes its switch. Reading the code suggests
the switch is drawn for EVERY row with an id, with no check that the row can earn — so an AVALON
line, the AVALON desk, the SC SPARE shift, a cancelled row, a ⓘ row, a no-times desk and a
zero-length desk all read "Earns OIL — tap to stop this item earning" while earning nobody
anything. Tapping one writes a decision, which on a published day becomes a pending amendment
that moves no money. **Likely real** (a control that should not be usable).

**SET UP.** S0, Saturday published.

**DO.**
1. Enter OIL Earn on Saturday.
2. Hover/read the name cell of: the AVALON line; the AVALON desk row; the SC SPARE shift; the SXO
   desk (no times); the 07:00–07:00 ops desk; the ⓘ ADMIN ground row.
3. Tap the AVALON line's name once. Read the toast and the day's history line.
4. Press ✓ Done. Look at the day's pending-changes chip and open the amendment panel.
5. Cancel (CX) the OCU REVIEW ground row, re-enter the mode, read its name cell.

**EXPECT (what a scheduler would expect).** A row that earns nobody should not offer a switch, or
should say plainly "earns nothing — nothing to switch". The pucks on those rows are inert
("nothing measurable to earn from here") — the switch beside them contradicts that. After step 3
the day should NOT show "1 change" for a decision that changes nothing; if it does, that is a
phantom amendment. Report exactly which rows offer a live switch.

**Rulings.** OIL7, OIL28, OIL31, OIL16, OIL17 (the switched-off state must be neutral grey /
struck through, never amber or red — check while you are there).

## S4 — A pending OIL change: the scheduler's page, the reader's page and the Leave War disagree

**Why this could break.** On a published day the scheduler's schedule shows the WORKING COPY. An
OIL change made in the mode and not yet published changes the bars on the scheduler's screen at
once, while the Leave War still pays the ISSUED figure. Reading the code suggests nothing on the
puck marks the bar as "pending" — a typed edit gets a dotted amendment mark, an OIL decision gets
only the day's aggregate "1 change". A scheduler reading his own screen would conclude the man is
not being paid while he still is.

**SET UP.** S0, Saturday published (ORIG). Leave War shows PLASMA FO.

**DO.**
1. Board → OIL Earn → tap PLASMA's puck on the SDO desk (he earns nothing from it) → ✓ Done.
2. Read PLASMA's puck on the board, on the week view, and on the View-only page.
3. Read the Leave War: PLASMA's Saturday cell and his OIL tracker box.
4. Read the day's pending chip and the amendment panel item.
5. Now publish AL1. Repeat 2–3.

**EXPECT.** After step 1: board and edit week show PLASMA with NO bar; the View-only page (the
issued face) still shows his bar; Leave War still FO; the day says "1 change" and the panel item
reads that the OIL decisions on this day changed. After AL1: no bar anywhere, the Leave War cell is
gone (the tracker box removed or struck), history has a line naming PLASMA and the SDO desk. The
question for the report: between steps 1 and 5, is there ANYTHING on PLASMA's puck telling the
scheduler the bar he sees is pending, not in force? If not, say so — it is a judgement call for
the owner.

**Rulings.** OIL11, OIL16, OIL24, OIL27, unruled — judgement on the pending mark.

## S5 — A second man planted on a member's landed input row

**Why this could break.** A ground row that came from a member's input is the INPUT's event: the
schedule half skips the row so the claim owns it. Reading the code suggests a second man the
scheduler drops onto that row earns nothing from it and, in the mode, reads "nothing measurable
to earn from here" — while the man beside him glows. A scheduler who adds a second name to a
Saturday Training row means both to be there.

**SET UP.** S0. Person T's Training row on the Ground Programme (09:00–12:00).

**DO.**
1. Outside the mode, drop any second pilot (P2) onto T's Training row (the "+ add" strip).
2. Enter OIL Earn. Read both pucks on that row and their tooltips. Tap P2.
3. ✓ Done. Publish. Read the Leave War for P2.

**EXPECT (judgement).** Either P2 earns from the row like T does, or the app says clearly why he
cannot. Silent "nothing measurable" beside a glowing T is the wrong answer for a scheduler. Report
what it does.

**Rulings.** OIL31 (the input row rule), OIL28, unruled — judgement.

## S6 — ALL AVAIL on a duty desk, a sim row and a cockpit

**Why this could break.** A sentinel expands only on the Ground and Common Programme. Reading the
code suggests a sentinel planted anywhere else earns nobody, wears no bar and no count chip, and
in the mode is an inert puck saying "nothing measurable" — nothing tells the scheduler the row
is silently paying nobody.

**SET UP.** S0.

**DO.**
1. From the crew palette drag ALL AVAIL onto: the SXO desk (give it times 08:00–12:00 first); the
   OFT EP-6 row's spare seat; VIPER's RCP seat (swap SHAFT out).
2. Outside the mode read each puck; inside the mode read and tap each.
3. Publish. Read the Leave War for anyone who might have been swept in.

**EXPECT (judgement).** Compare with the FAMILY DAY row, where ALL AVAIL wears a count chip and
opens into pucks. On the desk/sim/cockpit the puck should either behave the same or carry a plain
"a placeholder here earns nobody" reading. Report the tooltip text and whether a scheduler could
tell the difference.

**Rulings.** OIL8, OIL23, OIL31, unruled — judgement.

## S7 — The blanket, then publish: does anything say nobody earned?

**Why this could break.** The publish-time "earned nobody any OIL" sentence is built from desks
with missing times. Reading the code suggests that under the day blanket — every man has hours,
nobody earns — the publish says nothing at all, and the day's own warning list is silent too
(the "not published yet" reminder only speaks when somebody would earn).

**SET UP.** S0, Saturday unpublished, the SXO desk given real times so no desk is blind.

**DO.**
1. OIL Earn → Nothing today earns → ✓ Done.
2. Read the day's warning list (the checks panel).
3. Sign and Publish day. Read the toast(s).
4. Read the Leave War for PLASMA, RAZER, BAPSTER, O, T.

**EXPECT.** Nobody lands (correct). The question: did any screen say, at publish, that a worked
Saturday paid nobody? OIL33 asks for that. If the day and the publish were silent, report it as a
gap for the owner's judgement.

**Rulings.** OIL9, OIL33, OIL11.

## S8 — Holiday removed after publish: the day keeps paying, and what says so?

**Why this could break.** R-1 rules both directions wait for a republication, and the app must
"say so on the day". The forward direction has an advisory. Reading the code suggests the REVERSE
has none: a Tuesday published as a holiday keeps paying after the holiday is cleared, the day
shows an unexplained "1 change", and the amendment item says the OIL decisions changed though
nobody decided anything.

**SET UP.** Declare Wednesday 15 Jul a public holiday on the Leave War. On Wednesday's board put a
man on a duty desk 08:00–16:00. Publish Wednesday. Confirm his FO in the Leave War.

**DO.**
1. On the Leave War clear the PH from 15 Jul. Return to the schedule.
2. Read Wednesday: the man's puck (bar?), the day's warning list, the pending chip, the amendment
   panel, and whether OIL Earn is still offered.
3. Read the Leave War: is his FO still there?
4. Publish AL1 (sign first). Read the Leave War and the history.
5. Now the forward direction: pick Thursday 16 Jul, put a man on a desk 08:00–16:00, publish it as
   an ordinary day. THEN declare Thursday a PH. Read Thursday's warning list, pending chip, and the
   Leave War. Publish AL1 and read again.

**EXPECT.** Step 3: FO still there (R-1 — only a republication moves money). Step 2: the honest
reading would be a bar still drawn (it is still paying) OR an advisory saying "this day stopped
being a holiday after it was published — publish it again to withdraw the OIL"; report which you
got, and whether the "1 change" is explained. Step 4: FO gone, one history line. Step 5: the
advisory "This day started earning OIL after it was published — publish it again so the OIL
lands" must be on the day; no money until AL1; then FO with reason Duty. Check the AL numbers:
Wednesday AL1 and Thursday AL1 are independent (per-day numbering).

**Rulings.** R-1, OIL24, OIL27, OIL38, OIL1/OIL18 (the button must appear/disappear with the
holiday).

## S9 — A weekend no Leave War period covers: bars everywhere, money nowhere

**Why this could break.** The bar is drawn from the day's evidence; the credit needs a war
holding the date. Reading the code suggests a published weekend outside every war period shows
green on every puck and lands nothing, with nothing on screen saying why.

**SET UP.** Find (or make, via the week calendar) a weekend outside the Leave War's periods. Put a
man on a duty desk 08:00–18:00 on its Saturday. Publish.

**DO.** Read the bar, the day's warning list, the publish toast, then the Leave War / OIL tracker
for that man.

**EXPECT (judgement).** Either no bar (nothing will be paid) or a plain line saying the credit has
nowhere to land. Green with silence is the wrong answer. Report which.

**Rulings.** OIL20, OIL33, unruled — judgement.

## S10 — The sentinel after publish: the mode opens the LIVE membership, the issued chip is frozen

**Why this could break.** The issued day freezes who stood behind ALL AVAIL. The working copy
re-resolves it live. So after a member files leave on a published Saturday, the mode and the edit
week show one membership while the View-only page shows another — and the day grows "2 changes"
(the filing, and the OIL evidence) with nobody having touched OIL.

**SET UP.** S0 published. Count chip on FAMILY DAY reads some number N (note it, and tap it to list
the men).

**DO.**
1. Log in as `us`/`us` (or file as admin for a man who is currently inside the family day). File
   leave for him on Sat 18 Jul.
2. Back as admin: read the FAMILY DAY count chip on the edit week, on the board, in the mode
   (opened pucks), and on the View-only page.
3. Read the pending chip and the amendment panel wording.
4. Publish AL1. Read the chip everywhere and the Leave War for the man who left.

**EXPECT.** Before AL1: View-only page still says N (frozen); edit surfaces say N−1 (live);
Leave War still pays him for the family day (issued). Panel: two items — the leave filing and
"the OIL decisions on this day changed". Report how that second line reads to someone who decided
nothing. After AL1: N−1 everywhere, his family-day credit gone, the leave shows on the war.

**Rulings.** OIL24, OIL23, OIL37, OIL27, §7.3 full freeze.

## S11 — A warning chip on a Saturday puck must not hide the bar

**Why this could break.** The owner found the chip painting over the strip; it was re-drawn on
the chip. Only the crew-rest and conflict chips were seen. Check every chip kind, both sizes, both
surfaces.

**SET UP.** S0 published. Make chips appear on Saturday earners: put RAZER also on the SDO desk
09:00–10:00 so he is in two places at once (a conflict C); give YETI a Friday night line landing
23:30 so Saturday's VIPER breaks crew rest (CR); put a WSO in VIPER's FCP (Q); give a man a
seventh straight day (RUN, if the week allows); a "note"-level ring if any.

**DO.** Read each man's puck on the board, the week, the View-only page, at desktop and phone
width, with the chip showing.

**EXPECT.** The green bar is visible under/over every chip kind on every surface; the dashed
sanctioned-late-show ring and the dotted trace ring do not erase it. Hover title still says "earns
a full day of OIL".

**Rulings.** OIL21b, OIL20.

## S12 — The standard Saturday, read as a squadron scheduler would

**Why this could break.** This is the owner's own test: open the day and see if what it says is
what a scheduler expects. Do it last in this block, when you know what "right" is.

**SET UP.** S0 published, nothing marked.

**DO.** On the board, outside the mode, walk every row top to bottom and write down for each puck:
bar or not, height, tooltip. Then enter the mode and write down for each puck: glow/dim/inert,
figure shown, tooltip. Then the Leave War for every man on the day.

**EXPECT.** Earning: PLASMA FO (Duty, 10h); RAZER + his WSO FO (COBRA); YETI + SHAFT HO (VIPER,
exactly 6h — if the sortie shows FO, the boundary is wrong); BAPSTER + WSO FO (SC MAIN 8h); OFT
EP-6 crew HO (1h30); AMT BOX pax HO (2h); STIFF: OCU REVIEW 09:00–11:00 plus MASS BRIEF
15:00–16:00 → envelope 09:00–16:00 = 7h → FO, bar on BOTH rows; MASS BRIEF's other man HO (1h);
T HO (Training 3h) on his input row; O FO (OD); N nothing (answered No — dim in the mode, no bar);
FAMILY DAY: count chip "x of y earn" green if mixed (it will be: some members earn a full day
from other rows, some only the 4h family day → HO, some nothing). NOT earning, inert in the mode,
no bar: SC SPARE crew; AVALON line crew and the AVALON desk man; SXO (no times); the 07:00–07:00
desk man; the ⓘ ADMIN man; L (leave); M (ATT B, no work). Warning list: "SXO has no times —
nobody on it earns OIL" (hard) plus, before publishing, the "not published yet" reminder. Anything
that reads differently is a finding — including anything that says "NO OIL" anywhere (retired).

**Rulings.** OIL2, OIL5, OIL6, OIL22, OIL23, OIL30, OIL31, OIL32, OIL33, OIL4.

---

# BLOCK B — ORDER OF GESTURES

## S13 — Mark then publish, versus publish then mark

**SET UP.** Two fresh copies of S0's shape: use Saturday and Sunday (Sunday: build the same rows).

**DO.**
1. Saturday (unpublished): OIL Earn → tap PLASMA off → ✓ Done → sign four roles → Publish day.
2. Sunday: sign → Publish day → OIL Earn → tap SPACEMAN off → ✓ Done → look at the sign-offs →
   sign again → Publish AL1.
3. On Saturday now tap PLASMA back ON (unpublished change) → ✓ Done → read the pending chip → tap
   him off again → read the chip.

**EXPECT.** Step 1: Saturday goes out as ORIG with PLASMA earning nothing; no amendment number; no
"1 change" before the publish (a draft day shows no marks); Leave War: nothing for PLASMA. Step 2:
the tap invalidates the four sign-offs (the Publish AL1 button reads "Sign off … before
publishing"); after re-signing, AL1 publishes; SPACEMAN's FO disappears; the panel's one item
names the OIL change; history names SPACEMAN and the SDO desk. Step 3: "1 change", then after
tapping back exactly as issued, the chip returns to no changes (a round trip is not a change).

**Rulings.** OIL11, OIL16, OIL27, OIL38, §9.3 (signature binds the OIL evidence).

## S14 — Switch an event off then add a man, versus add a man then switch off (the tenth man)

**SET UP.** S0, MASS BRIEF 15:00–16:00 with two men.

**DO.**
1. OIL Earn → tap MASS BRIEF's name (off) → ✓ Done → drop a third man onto MASS BRIEF → OIL Earn.
2. Read the third man's puck. Publish. Leave War for him.
3. Now on OCU REVIEW: drop a second man first, then enter the mode and switch the item off. Read
   both. Switch it back on. Read both.

**EXPECT.** Step 1–2: the third man is dim/inert under the switched-off item ("this event earns
nobody"), earns nothing from it, and his tooltip must NOT invite a tap ("tap to put him back on
it") — he cannot be changed under the mask. Step 3: both dim under the switch, both back when the
switch lifts, and any per-person mark made before the switch comes back exactly as it was.

**Rulings.** OIL7, OIL9 (mask, not delete), the masked-puck fix.

## S15 — Blanket on then mark, versus mark then blanket; undo and redo after each

**SET UP.** S0.

**DO.**
1. OIL Earn → tap RAZER off (COBRA) → tap OFT EP-6's name off → Nothing today earns → read every
   puck and every name → tap RAZER's puck under the blanket → read the toast.
2. Nothing today earns (off) → read RAZER (still off?) and EP-6 (still off?).
3. Undo (board's Undo) three times, reading the board after each; Redo three times.
4. Fresh: Nothing today earns FIRST, then try to tap any puck and any name; read the toasts; then
   turn the blanket off.

**EXPECT.** Under the blanket every puck is inert and every name reads "the day blanket is on";
a tap under it changes nothing and says which mask is on. Lifting the blanket brings RAZER's deny
and EP-6's switch back exactly. Each Undo reverses one gesture and the board stays IN the mode
(the mode is not an edit); the Undo button's own label should say something a scheduler
understands, not a blank. Step 4: a tap under the blanket must not create a hidden decision —
after turning the blanket off nobody should have changed.

**Rulings.** OIL9, the masked-tap fix (§9.1), OIL2.

## S16 — Double tap, and the decision that restores the member's own word

**SET UP.** S0. Person N answered No to the Meeting; T answered Yes to Training.

**DO.**
1. OIL Earn: tap N once (now glows — the admin's Yes over the member's No), read the tooltip;
   tap again (back to dim). Read the pending chip afterwards (day published first for this).
2. Tap T once (dim), tap again (glow). Go to the Inputs page: T's row still says his own answer.
3. Tap N on (allow) → ✓ Done → as the member, open N's input and use the OIL "Change…" to answer
   Yes → back on the board read N.

**EXPECT.** A double tap leaves no change (chip shows none). The member's answer on the Inputs page
never changes because of an admin tap. Step 3: the admin's allow still stands and the puck glows;
if the admin then taps him off, the member's own Yes is what comes back next time (the override
is removed, not inverted) — check by tapping once more: he should glow from the member's Yes, not
need a second tap.

**Rulings.** OIL10, §9.1 three-state, OIL25.

## S17 — Undo across a publish, and undo across a week step

**SET UP.** S0 published (ORIG), PLASMA FO on the war.

**DO.**
1. OIL Earn → PLASMA off → ✓ Done → sign → Publish AL1 (PLASMA's FO goes). Press Undo once.
2. Read: the day's version tag (ORIG or AL1?), PLASMA's bar, the Leave War, the history.
3. Redo. Read the same.
4. Enter the mode on Saturday, then use the board's week arrows to step to next week and back.
5. Read: is the mode on? Is the board editable? Is the Done button there?

**EXPECT.** Step 2: the undo of a publish is silent on screen until the shared record registers
it, then just a line in the history — report what you saw and whether the Leave War went back to
FO; nothing should be left half-way (a day reading AL1 with the war reading ORIG's money, or the
reverse). Step 5: stepping weeks leaves the mode; coming back, the board is a normal editable
board with OIL Earn offered again — nothing greyed with no way out.

**Rulings.** OIL39, OIL24, fix 7 (week step leaves the mode).

---

# BLOCK C — RETRACTION AND EDITING

## S18 — The member edits his own input after the day went out

**Why this could break.** OIL36: re-timing an input on a published day moves nothing by itself.
Also the decision is addressed by the input, not its row, so an admin's deny must survive the
member's edit.

**SET UP.** S0 published. Admin: OIL Earn → tap T off (deny on his Training) → publish AL1. Leave
War: T has nothing.

**DO.**
1. As `us`/`us` (if T is the member) or as admin "filed for" T: change the Training to 08:00–16:00
   (eight hours). Save; answer the OIL sheet Yes again if asked.
2. Admin: read T on the board (bar? mode state?), the pending chip, the amendment panel.
3. Read the Leave War for T.
4. Publish AL2. Read again.
5. Change the input's PERSON to someone else (T2). Read both men in the mode.

**EXPECT.** Step 2: the working copy shows the new hours but T still dim (the deny survived the
edit); the day shows a change (the times moved) and the panel names the OIL evidence as changed.
Step 3: nothing (issued still says denied; and even if allowed, nothing moves until AL2). Step 5:
T2 glows by default (the deny was T's, not the row's), T's old deny applies to nobody.

**Rulings.** OIL25, OIL36, OIL24, OIL10.

## S19 — Input removed, then restored; input cancelled row, then un-cancelled

**SET UP.** S0 published. OIL Earn → tap N ON (allow over his No) → publish AL1. War: N HO
(Meeting, 1h).

**DO.**
1. Personal Inputs panel: remove N's Meeting from the programme (the Accept control's undo /
   "removed"). Read N in the mode (inert? dim?). Publish AL2. War.
2. Accept it back onto the programme. Read N in the mode. Publish AL3. War.
3. Cancel (CX) T's Training ground row. Read T in the mode and in the Personal Inputs panel.
   Publish. War. Then restore the row and publish again.
4. Turn T's Training row ⓘ (info-only). Read the ⓘ tooltip, T in the mode. Publish. War.

**EXPECT.** Removed → earns nothing whatever anyone answered or allowed; inert in the mode; the
allow is not shown but not destroyed either. Restored → the allow comes back (N glows without a
new tap). Cancelled or ⓘ landed row → the claim earns nothing (fix 3); the ⓘ tooltip says it earns
no OIL (OIL19); un-cancelled → earns again.

**Rulings.** OIL13, OIL25, OIL28, OIL19, fix 3 (R-2).

## S20 — A row deleted, reordered, or its man swapped, under a decision

**SET UP.** S0 published. OIL Earn: tap STIFF off on OCU REVIEW; tap OFT EP-6's name off. Publish
AL1.

**DO.**
1. Drag OCU REVIEW below ADMIN (reorder). Enter the mode: STIFF still off on it?
2. Swap STIFF out of OCU REVIEW for RAZER. Mode: RAZER glows? Swap STIFF back in: still off?
3. Delete the EP-6 row. Pending chip. Undo the delete. Mode: EP-6 still switched off?
4. Delete EP-6 for real, publish AL2, add a NEW OFT row with the same label and times and crew.
   Mode: the new row on or off?

**EXPECT.** 1: still off (the decision rides the row's identity, not its position). 2: RAZER earns
by default; STIFF's deny remembers him when he returns. 3: undo brings the switch back. 4: a new
row starts fresh (on) — and the deleted row's dead decision must not show anywhere or count as a
change on its own.

**Rulings.** OIL25, §7.4 identity.

## S21 — A man archived, hidden or transferred after the day went out

**SET UP.** S0 published; BAPSTER FO (SC MAIN). Also: make a SANS man fly with us on Saturday
(put him in COBRA's RCP), publish, Show SANS OFF on the war.

**DO.**
1. On the Quals/roster page archive BAPSTER (or post him out). Read the Leave War / OIL tracker for
   him, then un-archive.
2. The SANS man: with Show SANS off, look for his credit (tracker search / his row absent). Turn
   Show SANS on. Read his row and his tracker box.
3. On the board, is the SANS man's puck wearing a bar, and is he inside FAMILY DAY's count (he is
   planned with us today)?

**EXPECT.** 1: archiving moves no money — his FO stands (R-2); the row may be hidden but the
credit is not deleted; back from archive, it is there. 2: the credit landed while hidden; his row
arrives carrying it. 3: bar yes; FAMILY DAY includes him (but not if COBRA's window overlaps the
family day — COBRA's day runs 11:00–17:30, FAMILY DAY 10:00–14:00, so he is OUT of the family day
by the busy rule; say so in the report if the count agrees).

**Rulings.** OIL35, R-2, OIL14.

---

# BLOCK D — PUBLISH, AMEND, CORRECT

## S22 — Unpublish and republish under the same label

**SET UP.** S0 published (ORIG). PLASMA FO.

**DO.**
1. Press Unpublish on Saturday (read whether it warns about bid-against credits; it should not
   unless someone has spent OIL). Read the Leave War at once: is PLASMA's FO gone?
2. OIL Earn → tap PLASMA off → ✓ Done → sign → Publish day.
3. Read the version tag (still ORIG, no AL1), the history, the Leave War.
4. Give PLASMA a leave bid on the war that draws on his OIL, then repeat 1 and read the button.

**EXPECT.** 1: the credit is withdrawn during the gap (the day is unapproved); 3: reissued as
ORIG, no amendment number, PLASMA earns nothing, one history line; 4: the Unpublish button becomes
two-tap with its warning about credits bid against.

**Rulings.** OIL24, OIL39.

## S23 — Version preview, and loading an old version onto the working copy

**SET UP.** S0 published ORIG; then OIL Earn: STIFF off on OCU REVIEW; publish AL1.

**DO.**
1. Preview ORIG (the plans selector / version chip). Read STIFF's bar, the FAMILY DAY chip, the
   OIL Earn button (it should be disabled/absent in a preview), and try to tap a puck.
2. Preview AL1. Same reads.
3. From the ORIG preview choose "Load onto working copy". Read the confirm's count of discarded
   changes (there are no unpublished edits, so it should be about the decision only), then read
   STIFF in the mode and the pending chip.
4. Publish AL2 and read the Leave War.

**EXPECT.** ORIG preview: STIFF bar on OCU REVIEW (frozen); AL1 preview: no bar; no mode in a
preview. Step 3: the recovered working copy carries ORIG's decisions (STIFF on again), no frozen
evidence stuck to it (the FAMILY DAY chip must now be LIVE — file a leave for a member and see the
count move; if it does not move, the recovery installed a frozen block); the day shows "1 change"
(the OIL evidence differs from AL1). Step 4: STIFF FO again.

**Rulings.** OIL29, OIL24, §9.3.

## S24 — A saved plan brought out under a decision

**SET UP.** S0 published ORIG. Plans selector: duplicate the day (Plan A / Plan B, B live).

**DO.**
1. On Plan B: OIL Earn → RAZER off → ✓ Done. Switch to Plan A. Read RAZER in the mode. Switch
   back to B. Read.
2. On Plan A make an ordinary edit (a remark). Switch to B, sign, publish AL1 (RAZER's FO goes).
3. Switch to A. Read the pending chip and the panel (A has RAZER on → an OIL change relative to
   AL1). Switch back to B: no changes.
4. Leave the week (calendar to another week) and come back a while later; read B again.

**EXPECT.** Decisions belong to the plan; A shows RAZER on, B off; the pending chip follows the
plan; a plan restored later re-derives everything except its decisions (the FAMILY DAY count is
live, not what it was when the plan was parked).

**Rulings.** OIL29, OIL16, OIL27.

## S25 — A day template applied over decisions

**Why this could break.** Reading the code suggests applying a day template replaces the whole
day's content and carries no decisions — the marks vanish with no warning.

**SET UP.** S0 published; OIL Earn: PLASMA off, EP-6 off; publish AL1.

**DO.**
1. Templates → save this day as a template. Templates → apply that template to Sunday. Read
   Sunday in the mode: any decisions?
2. Templates → apply any template to Saturday. Read the confirm (does it mention OIL decisions?),
   then Saturday in the mode, then the pending chip and panel.

**EXPECT (judgement).** A template is a shape and carries no decisions — Sunday starts fresh
(fine). On Saturday the decisions are gone and the day shows an OIL change relative to AL1; if
nothing warned that the OIL decisions would be dropped, report it.

**Rulings.** OIL29, unruled — judgement.

## S26 — Reload, leave the week and return, and the reset

**SET UP.** S0 published ORIG; AL1 with PLASMA off and STIFF off.

**DO.**
1. Reload the browser. Read: bars on Saturday, the FAMILY DAY count chip, the pending chip (must
   be "no changes"), the Leave War, the history.
2. Calendar to the week of 20 Jul; read the Leave War for 18 Jul; come back; read Saturday.
3. (Only if the reset is armed on this branch) note what the first load after the merge will do:
   the demo data is cleared and re-seeded together; confirm the seeded Saturday shows the "not
   published yet — nobody earns" reminder and PLASMA's puck wears no bar until published.

**EXPECT.** Nothing changes across a reload or a week trip: no phantom "1 change", no lost
credit, no chip that changed its number. Step 3: the reminder shows; no bar on an unpublished day.

**Rulings.** OIL26, OIL11, OIL29.

## S27 — An input filed on an already-published day

**SET UP.** S0 published ORIG.

**DO.**
1. As admin, file Training 08:00–17:00 on Sat 18 Jul for a new person Q; answer Yes.
2. Read: Q's row on the Ground Programme (pending amendment look), Q's bar on the board and the
   View-only page, the pending chip (how many changes?), the panel wording, the Leave War for Q.
3. Publish AL1. Read again.

**EXPECT.** Before AL1: the row is on the working copy only; Q's bar shows on the scheduler's
surfaces but not on the View-only page; the Leave War has nothing for Q; the chip probably reads
"2 changes" (the filing and the OIL evidence) — report exactly what the panel says for one filed
input. After AL1: Q FO (9h, "Training").

**Rulings.** OIL37, OIL11, OIL27.

## S28 — The blank desk at publish, and a credit landing on an undecided bid

**SET UP.** S0 unpublished; SXO desk still has no times; PLASMA has an UNDECIDED leave bid on the
war for 18 Jul.

**DO.**
1. Read Saturday's warning list. Sign, Publish day. Read the toast(s) in full.
2. Read the Leave War: PLASMA's day, the bid, the day's flag.
3. Give the SXO desk times 08:00–12:00, publish AL1, read the toast.

**EXPECT.** 1: the warning list has the hard "SXO has no times — nobody on it earns OIL"; the
publish toast carries BOTH facts in one message — the blind desk line AND "PLASMA's bid on 18 Jul
now sits on published work — the day is flagged, the bid is still live". 2: the FO lands anyway;
the bid is not replaced; the day flags. 3: no blind line any more; SXO man now earns.

**Rulings.** OIL33, OIL34, OIL31, fix 5.

---

# BLOCK E — THE EDGES OF THE MEASURE

## S29 — Exactly six hours, by three routes

**SET UP.** Sunday, empty apart from SPACEMAN's SDO.

**DO.**
1. SDO 08:00–14:00 → read SPACEMAN's puck in the mode and the bar. Change end to 14:01. Read.
2. A flying line T-O 10:00 land 11:00 with a crew → read (report 07:00 → release 13:00 = 6h00).
   Land 11:01 → read.
3. Two desks for one man: 07:00–08:00 and 12:00–13:00 → read (envelope 6h00 → HO). Second desk to
   12:00–13:01 → read (FO). Then switch the FIRST desk off in the mode → read (12:00–13:01 alone
   → HO — the far end went).
4. Publish once at the end and check each man's tracker box says what the puck said.

**EXPECT.** 360 minutes is HO (outline glow, half bar); 361 is FO (solid glow, full bar). The two
gapped desks pay for the gap. Switching off the desk holding the far end drops him to HO on every
puck he still wears.

**Rulings.** OIL30, OIL4, OIL6, OIL5.

## S30 — Rows that cross midnight, no times, and zero length

**SET UP.** Sunday.

**DO.**
1. SC MAIN 20:00–02:00 with a crew → mode figure (6h00 → HO); 20:00–02:01 → FO. Publish; read the
   tracker box's work times (what does it show for a span past midnight?) and Monday's day on the
   war (nothing should spill onto Monday).
2. A night line T-O 23:00 land 00:30 → FO (20:00 → 02:30).
3. A desk with a man and NO times → inert in the mode, no bar, hard warning on the day.
4. A desk 09:00–09:00 → inert, listed as "no times" in the warning.
5. Try an allow on the no-times man in the mode (there is no puck to tap — confirm he cannot be
   allowed into a figure).

**EXPECT.** Money never comes from a guess; nothing overrides ineligibility; the midnight span
credits Sunday only, with sensible times printed.

**Rulings.** OIL31, OIL28, OIL30.

## S31 — A man on four rows, two of which count

**SET UP.** Saturday: for one pilot Z put him on: SDO 08:00–10:00; OFT 11:00–12:00; the ⓘ ADMIN
13:00–14:00; MASS BRIEF 15:00–16:00.

**DO.**
1. Mode: read all four pucks (figure and glow), then the bars outside the mode.
2. Switch MASS BRIEF off. Read all four. Switch it back on; tap Z off on MASS BRIEF only. Read.
3. Publish; tracker box reason.

**EXPECT.** Start: envelope 08:00–16:00 → FO; bar on SDO, OFT, MASS BRIEF; NO bar on the ⓘ row;
the ⓘ puck inert. After switching MASS BRIEF off: envelope 08:00–12:00 → HO on all his pucks;
bars now only on SDO and OFT. Tapping him off MASS BRIEF alone: same as the switch for him. Reason
reads "Duty + SIM" (or the app's join) not four separate part-days.

**Rulings.** OIL3, OIL4, OIL21 (O-1), OIL31, OIL32.

## S32 — Two men on one line, one denied

**SET UP.** COBRA (14:00–15:30) with RAZER / his WSO, Saturday published.

**DO.** Mode: tap RAZER off → ✓ Done → read the two pucks on the week, board, View-only page (before
and after AL1) → publish AL1 → Leave War for both.

**EXPECT.** Same line, two readings: RAZER no bar, the WSO full bar; RAZER's tooltip in the mode
"earns nothing from this event — tap to put him back on it"; war: WSO FO, RAZER nothing, history
"RAZER earns nothing from COBRA".

**Rulings.** OIL3, OIL21, OIL16.

---

# BLOCK F — THE SENTINEL

## S33 — Who ALL AVAIL stands for, exactly

**SET UP.** S0, Saturday unpublished. FAMILY DAY 10:00–14:00 ALL AVAIL. Plant the exclusion cases:
YETI on VIPER (busy 07:00–13:00 by the sortie's working day); T Training 09:00–12:00; N Meeting
13:00–14:00; L on leave; M ATT B; O OD; a SANS man NOT planned; the SANS man from S21 planned in
COBRA (busy 11:00–17:30); a ground-crew (Personnel) man; a man with a Training the scheduler
REMOVED from the programme (dormant); a man posted out on the war.

**DO.**
1. Tap FAMILY DAY's count chip. Write the list down.
2. Change FAMILY DAY to ALL (not ALL AVAIL). Tap again.
3. Enter the mode: the puck opens into real pucks — count them.
4. Add a second Common Programme row 12:00–13:00 ALL AVAIL. Do the two rows empty each other?

**EXPECT.** OUT: YETI (sortie overlaps), T, N (commitments overlap), L, O, the unplanned SANS, the
planned SANS if his sortie overlaps, ground crew, the posted-out man. IN: M (ATT B may still
work), the dormant-Training man (a removed input is silent), everyone else free. ALL and ALL AVAIL
give the SAME list. Two sentinel rows do not empty each other. The opened pucks in the mode match
the chip's list exactly.

**Rulings.** OIL14, OIL15, OIL8, OIL23.

## S34 — The four states of the sentinel puck, and the chip counts THIS row

**SET UP.** S0 published. Make FAMILY DAY's membership small: three men only free (take the others
off by the rules above).

**DO.**
1. All three earn a full day from elsewhere (put each on a desk 08:00–18:00): read the puck — full
   bar, plain chip "3".
2. Take them off the desks so only the family day (4h) counts: half bar, chip "3".
3. Deny one in the mode: no bar, green chip "2 of 3 earn"; tap the chip — the list names him
   "nothing".
4. Switch FAMILY DAY off in the mode: no bar, chip plain "3" — even though one of them still earns
   from a desk (put one back on a desk to prove the chip counts this row only).
5. Empty the row of people (a window nobody is free for): the chip and the tooltip.

**EXPECT.** As listed; the chip and the bar on the same puck never contradict each other; the
tooltip invites a tap and the tap works on the week view AND on the View-only page as a member.

**Rulings.** OIL23, O-3 (re-examined), OIL8.

---

# BLOCK G — THE INTERFACE AS A HUMAN READS IT

## S35 — Can the scheduler get stuck in the mode?

**SET UP.** Wednesday 15 Jul declared a PH; Wednesday's board.

**DO.**
1. Enter the mode on Wednesday. Switch to the Leave War tab, clear the PH, come back to the
   schedule and reopen Wednesday's board. Read: is the board editable, is a green OIL EARN bar
   left, is Done offered, is OIL Earn offered?
2. Enter the mode on Saturday; press the board's day arrows to Sunday and back; read.
3. Enter the mode; close the board (phone) / navigate to View-only and back; reopen; read.
4. Enter the mode; press Undo repeatedly past the mode's own gestures; read.
5. On a phone at 390px: enter the mode; is ✓ Done fully visible; does the top bar stay one row.

**EXPECT.** Every route out works and the board is never left read-only with no button; the
decisions recorded on Wednesday are not lost when the day stops being a holiday (they are simply
not offered) and do not produce a "1 change" by themselves — report if they do.

**Rulings.** OIL18, fix 7, F6.

## S36 — Is anything usable that should not be, in the mode?

**SET UP.** S0, in the mode on the board (desktop and phone).

**DO.**
1. Try to drag a puck from the crew palette onto a seat. Try the "+ add" strip. Try typing in a
   time box. Try CX, ⓘ, the red flag, delete, + Line, + Row, Templates, the wave title select, the
   grip drags, the sign-off names, the plans selector, Publish.
2. Tap the count chip on FAMILY DAY (it should be opened into pucks, so no chip) and the inert
   pucks' tooltips.
3. Read the day-bar note line: "Tap a puck to take a man off that event · tap an item to stop the
   whole item earning" — is it true for every kind of row on the day (flying, SC, AVALON, duty,
   sim, ground, programme, input under Unavailable, input under Personal Inputs)?

**EXPECT.** No schedule write is possible in the mode; every write control is absent or disabled;
signing and publishing — report whether they are offered in the mode and, if publishing works from
inside it, whether the bars refresh and the mode survives. Every kind of row's puck is tappable
where the man earns; the two input surfaces (Personal Inputs, Unavailable) toggle the SAME
decision (tap in one, read the other).

**Rulings.** OIL1, OIL2, OIL12, build decision 5 (read-only in the mode).

## S37 — A reader, not a scheduler

**SET UP.** S0 published with a mixed FAMILY DAY.

**DO.** Log in as `us`/`us`. Look at Saturday on the week, on the View-only page, on the board if
a member can open one, at desktop and phone width. Tap the count chip. Hover a bar.

**EXPECT.** Bars and chip visible; the chip's tap lists the men; no OIL Earn anywhere (not offered
and not merely refused); nothing reads "NO OIL"; the bar's tooltip names the figure in words.

**Rulings.** OIL20, OIL22, OIL23, F6.

## S38 — What the history says, for every kind of gesture

**SET UP.** S0 published.

**DO.** In one sitting: tap a man off a flying line; off an SC shift; off a duty desk; off a sim;
off a ground row; off the family day (an opened sentinel puck); off his OD in Unavailable; off
his Training in Personal Inputs; switch a row with an EMPTY name off; blanket on; blanket off.
Then open the day's history and the amendment panel.

**EXPECT.** Eleven history lines, each naming the man and the event as the board names it (the
line's callsign, the desk's role, the sim's label, the row's name, "Overseas duty" / "Training"
for the claims) — an empty-named row reads "this event", not blank; the blanket lines read as
the toast did. The amendment panel shows ONE OIL item however many gestures were made.

**Rulings.** fix 6, OIL27.

## S39 — Phone width, every surface

**SET UP.** S0 published; phone width (390px) and a real phone if available.

**DO.** Walk: the day bar (Templates + OIL Earn in one row, THIS DAY heading), enter the mode
(green bar, Nothing today earns, ✓ Done all on one line, note line below), the small pucks' bars
(4px strip visible at that size, half-height distinguishable), the count chip beside ALL AVAIL not
wrapping the row, tapping small pucks in the mode (hit target), the flying line's callsign switch
readable and tappable, the sim BOX pucks, the Unavailable panel's OD puck.

**EXPECT.** One-row top bar (never a second row), nothing clipped, every tap lands on the intended
puck, the half bar still reads as half at small size.

**Rulings.** OIL5, OIL6, OIL20, the fit lesson in the build notes.

## S40 — The tooltips never invite a gesture the app refuses

**SET UP.** S0 published, in and out of the mode.

**DO.** Read every OIL tooltip you can find: mode pucks (on/off/inert/masked), item names
(on/off/blanket/no identity), the day bar buttons, the count chip (in mode and out), the bar's
own title, the ⓘ buttons, the Unpublish button's warning, the Publish AL button when locked.

**EXPECT.** Each tooltip's verb matches what a tap does. Specifically: a masked puck must not say
"tap to put him back on it"; a row that cannot earn must not say "tap to stop this item earning";
"This row has no identity yet — save the day" must never appear on a row the scheduler just added
through the board (report if it does: add a row, enter the mode at once, read its name).

**Rulings.** the masked-puck fix, OIL7, OIL19.

---

# BLOCK H — OTHER RULINGS NOT YET COVERED

## S41 — Weekdays are untouched; an "off day" tag behaves like a holiday

**DO.** Open Tuesday's board: no OIL Earn, no THIS DAY OIL button, no bars, no OIL warnings, no
count chip on an ALL AVAIL row. Then tag Tuesday as an off day on the Leave War (an event word
whose type is tagged off-day, if the war offers one besides PH); reread Tuesday.

**EXPECT.** Five days a week byte-for-byte the old board; the off-day tag turns everything on
exactly as a PH does.

**Rulings.** OIL1, OIL18.

## S42 — A multi-day input answered differently per day

**SET UP.** File Training Fri 17 – Mon 20 Jul, 09:00–12:00, for person W; on the OIL sheet choose
"Only some days…" and pick Saturday only.

**DO.** Read W on Saturday (glows by default) and Sunday (dim by default) in the mode; publish both;
Leave War.

**EXPECT.** Sat HO, Sun nothing; the admin can allow Sunday by one tap and the member's own "No"
for Sunday is still what the Inputs page shows.

**Rulings.** OIL10, OIL11, §7.1 multi-day.

## S43 — The day labelled "schedule" when both the schedule and a claim back it

**SET UP.** T on Training 09:00–12:00 (Yes) AND on the SDO desk 13:00–18:00.

**DO.** Publish; open T's OIL tracker box.

**EXPECT.** One credit, FO (09:00–18:00 envelope), reason names the schedule's work (Duty + the
input's type, or the app's join), given by "Auto"; not two boxes.

**Rulings.** OIL32, OIL4.

## S44 — The reminder to publish, and its silence

**DO.** On an unpublished Saturday with earners: the advisory "This day is not published yet, so
nobody earns their OIL for it — publish it before the day is out" is on the day. Publish: it goes.
Empty the day of earners (or blanket it): it must not show. On a weekday: never.

**Rulings.** OIL11, §2.3.

---

## The ten I would bet on, and why

1. **S1** — the week view's cockpit seats: the exact shape the owner found on the board, and the
   week's seat builder for flying lines is a different function from the one that was fixed.
2. **S2** — the OD earner's bar on the week's Unavailable block: the board's input row was wired,
   the week's twin builder draws a bare puck.
3. **S3** — live item switches on rows that can never earn: nothing in the switch asks whether the
   row earns, and the puck beside it says the opposite.
4. **S4** — the pending-bar problem: a scheduler reading his own screen sees "not paid" while the
   war still pays; there is no per-puck pending mark for an OIL decision.
5. **S5** — a second man on a member's input row: the row is skipped for everyone but the member.
6. **S8** — the reverse holiday direction has no advisory and produces an unexplained change.
7. **S10** — the frozen/live membership split shows up as "the OIL decisions changed" when a member
   files leave.
8. **S6** — a sentinel anywhere but the programmes is silently nobody.
9. **S25** — templates drop decisions without a word.
10. **S35** — the stuck-mode family: one exit was fixed (week step); the holiday-removed and
    close-and-reopen routes were not walked.

Everything from S13 on is the assurance pass: ordered gestures and the correction paths, where a
defect would be a money defect rather than a display one, and where I found nothing by reading
but would not trust reading.
