# END-TIME-GUARD — walk scenarios, the Fable seat (a fresh, blind Opus this week, his D2819; owed to Fable)

Branch `claude/end-time-guard-202`. Designed from the rulings D2612, D2613, D2734, D2790, D2852, D2853, D2854, D2855,
the plan (its R1–R8, Q-W1–Q-W6, Q14–Q21 left as they are today), the bug-check order §7.0, §7.0a, §7.2–§7.10 and the
§7.11 lessons, and a read of what the branch draws (the outline is painted by key on `#eWeek` and on the board's
`input[data-bfld]`; the board's sign bar is allowed to wrap; the count-line tap and the Amendments panel's Publish AL
were left for later).

**Devices.** P = iPhone, 402 wide, WebKit, 3x, real touch. D = desktop, 1536 wide, Chromium, 2x. "Both" = each.
**Rules for every step.** Every state is made by pressing the app's own controls (§7.7) — never written into the data.
The refusing sign pill and the greyed Publish are aria-disabled, so a scripted press needs `force: true`; on P each tap
is pictured within about 100 ms of the lift and again settled (§7.10, lesson 30). The outline is judged by what is drawn
(computed `box-shadow` AND the box's pixels: grey = `--ink-3`, red = `--hard`, no glow — lesson 22), never by the class
alone. The browser's error list is watched throughout; any error is a finding.
**The words, exactly (D2854):** S-sign = "Blocked: N items are missing a time, each outlined in red. Type the missing
times, then sign."; S-sign-1 = "Blocked: 1 item is missing a time, outlined in red. Type the missing time, then sign.";
S-pub = "Blocked: N items are missing a time, each outlined in red. Thursday was not published." (the day's own name);
S-al = "… AL1 was not published." (the AL the press would issue).
**Cases marked READING** sit on an open question of the plan's §R5: the build keeps today's behaviour there. The walk
pictures what shows and marks it for him (lesson 32) — it is never a pass, and no expected result is assumed beyond
"as the app did before".

Demo week 1 is Mon 13 – Sun 19 Jul 26. "Draft Thursday" = Thursday 16 Jul as booted. "Published Wednesday" = Wednesday
15 Jul after T-02 publishes it through the controls.

---

## A. The demo week, fresh (D2616, D2612)

**T-01 — the demo is clean.** Both. Fresh boot, admin scheduler, Edit Schedule, week 1.
Steps: scroll every day Mon–Sun; open the Scheduler Board for Monday, then each other day, by its own way in; switch to
week 2 by the week selector and back; as an admin with Plan of 149, pick 149 and look at its week.
Expect: no outlined time box anywhere, on the week or the board, either week, either squadron; every sign-off line reads
"N to sign" with no "missing a time" (D2852 — nothing on the demo is missing a time). Monday's OPS SHARING + NAV SYS
BRIEF shows 17:55–18:55, DINNER WITH CMD 18:30–19:30, CMD ENGAGEMENT 21:30–22:30; Tuesday's OPS BRIEFER / EP SUP
05:00–06:00 and FLY W EXT SQN 08:45–09:45; Wednesday's NAV-SYS TRIAL PREP 14:00–15:00; Friday's MASS DEBRIEF + BEER
CALL 17:00–18:00 (the remake, D2616). Lesson 25 (what the demo carries is listed, not assumed).

**T-02 — the demo publishes again, end to end.** D. Fresh boot.
Steps: on Wednesday pick a name in CUR CK, SKED CK, PLANNED BY, APPROVED BY (in that order); press Publish day; then on
Monday the same, and on the board for Tuesday the same through the board's own sign boxes and its Publish day.
Expect: each day publishes exactly as before the build — the green title tag, its usual note, no "Blocked" note at any
step; the bell and the Leave War show what a publish always did (D2612: the guard refuses only a missing time).

**T-03 — the warning list on the remade days.** D. Fresh boot.
Steps: open Monday's and Tuesday's warning lists on the week and on the board; count lines and read each.
Expect: the same lines as `main` for these days, except any line that said a row's end was assumed (those rows now have
an end); every crew-rest, overlap and hours line unchanged (the ends given are the ones the app assumed). Picture both
builds side by side. (D2612 "the assumed times keep working"; D2852 I2 no new warning line.)

## B. The outline appears, row kind by row kind, made through the controls (D2852, D2853, D2790)

Each: grey outline only on the boxes named; the sign-off line's count goes up by one item (not one per box); nothing
red until a press is refused. Lesson 25 — every place a person can put someone or a time, not only what the demo has.

**T-04 — flight line, crew and no take-off.** Both, week. Draft Thursday.
Steps: press + to add a flying line in WAVE 1; type a callsign and mission; seat a pilot and a WSO from the crew panel;
type the landing 14:10, leave the take-off empty; tap away.
Expect: the take-off box outlined grey; the landing plain; "1 item missing a time · 4 to sign" (D2852, D2854).

**T-05 — flight line, take-off and no landing, then no crew.** Both, week.
Steps: on T-04's line type take-off 12:40, clear the landing; picture; then take both crew off the line.
Expect: the landing outlined while crewed; with nobody on it the landing STILL outlined ("a row with a start needs its
end even with nobody on it", D2852); count stays 1.

**T-06 — the board's own flight boxes.** Both, board. Draft Thursday, T-05's line.
Steps: open Thursday's Scheduler Board; find the line; picture its take-off and landing inputs; type the landing on the
board; then clear it again on the board.
Expect: the board's landing input outlined grey exactly as on the week; typing removes it at once, clearing brings it
back; the week, when reopened, agrees (the board's inline time inputs are a separate builder — roll-call row 8b).

**T-07 — a formation of two aircraft, one cancelled.** D, week then board.
Steps: add a line with two aircraft; seat crew on both; type the take-off only; cancel one aircraft by its CX control.
Expect: still counted (the other aircraft is crewed), the landing outlined; cancel the whole line → no outline, count
gone (D2852 "a cancelled item"); take the line's CX back → the outline returns at once.

**T-08 — SC standby line, MAIN with a man, START and no END.** Both, week and board.
Steps: add a line with callsign SC; put a man in MAIN; type START 06:00; leave END; open the warning list before and
after.
Expect: END outlined grey; count +1; the warning list gains NO line (D2852 I2 — outline only, never a new warning line).

**T-09 — SC SPARE alone, no times.** Both, week.
Steps: on an SC line put a man in SPARE only, both times empty.
Expect: both boxes outlined, ONE item counted; no new warning line (D2852 I2, "someone on it").

**T-10 — AVALON and BB with a man, no times; then the AVALON flies.** D, week; P, board.
Steps: add an AVALON line and a BB line, a man on each, no times; check the warning list; then type a B on the AVALON
so it flies.
Expect: both lines outlined (both boxes each), no new warning line; once it flies, its existing standby-that-flies
advisory shows exactly as before, still no new line (D2852 I2, D2072).

**T-11 — a duty desk with a man and no times; a desk with its role only.** Both, week and board.
Steps: add a desk to a duty wave (SXO), put Anvil on it, leave both times empty; add another desk showing only its role
(SDO), nobody on it.
Expect: SXO — both boxes outlined, one item; SDO role only — plain, not counted (D2852 "a desk showing only its role does
not count").

**T-12 — ALL AVAIL and ALL on a duty desk.** D, week.
Steps: on a new desk pick ALL AVAIL as its person; no times; then change it to ALL.
Expect: outlined and counted in both cases (D2852 "ALL or ALL AVAIL"). Lesson 25: the demo never puts ALL AVAIL on a
desk — this is the case he found once before (22 Sep 26).

**T-13 — a callsign typed into a people box, not on the roster.** D, week; P, board.
Steps: on a ground row's people box type a callsign the roster does not hold (e.g. "GHOST"); no times.
Expect: counted, both boxes outlined (D2852 "a callsign typed in its people box").

**T-14 — a sim row with crew and only its END.** Both, week.
Steps: add an OFT row, label EP-4, seat a pilot and WSO, type END 10:30, START empty.
Expect: START outlined, count +1 (D2852 "an empty start is outlined and refused as an empty end is").

**T-15 — an AMT row with passengers and no end.** D, week; P, board.
Steps: add an AMT row (not BRIEF / DEBRIEF), add passengers, type START, no END.
Expect: END outlined, counted.

**T-16 — a typed ground row with someone, both boxes empty (a typed row never gets all day).** Both, week and board.
Steps: add a ground row SAFETY DAY, put Diesel on it, leave both times empty; then type 07:30 and 17:00.
Expect: both outlined, ONE item; after typing both, plain and the count gone (D2790, D2852).

**T-17 — Common Programme rows: ALL AVAIL, ALL, nobody.** Both, week; both, board (its two inline time inputs).
Steps: add SQN PT at 15:00 with ALL AVAIL, no end; another with ALL; another DINNER at 18:30 with nobody.
Expect: each END outlined, each one item; on the board the Common Programme's own two inputs carry the same outline
(the inline builder, roll-call row 8). DINNER with nobody counted by its start (D2852 "a row with a start").

**T-18 — the row is made by dragging a man on.** P (touch drag), D (mouse drag), week.
Steps: add a blank ground row, no times — plain; drag a man from the crew panel onto it; then drag him off.
Expect: plain → both boxes grey at the moment he lands (picture within 100 ms and settled) → plain again when he is
taken off (D2852 "a blank row with nobody on it" is left out). Lessons 2, 20 (the drag at a person's speed, quick and
slow).

## C. What is left out, each both ways (D2852)

**T-19 — an input with All day ticked.** D, Inputs page then Edit Schedule.
Steps: as a member, file a Training input on Thursday with All day ticked; as the scheduler accept it so it lands on
the Ground Programme; look at its row on the week and on the board.
Expect: never outlined, never counted (D2852, I1). Then a second input with times typed (09:00–11:00) — its row plain
because its times are in.

**T-20 — information-only and cancelled rows, and taking them back.** Both, week.
Steps: a ground row with a man and no end; mark it ⓘ information-only; then take ⓘ off; then CX it; then take CX back.
Expect: ⓘ → plain, not counted; ⓘ off → outlined at once; CX → plain; CX taken back → outlined at once (D2852).

**T-21 — AMT BRIEF and DEBRIEF with nobody; a man put on BRIEF.** D, week; P, board.
Steps: on a day with an AMT block, clear the END of its BRIEF row (or find one without); nobody on it; then put a man on
BRIEF; then take him off.
Expect: nobody → plain, not counted; a man on → counted, the empty box outlined; off again → plain (D2852 "while nobody
is on them"). If BRIEF's people cell cannot be filled on the board by any control, write that as a missing door (§7.7).

**T-22 — a blank row with nobody, and a duty template laid blank.** Both, week.
Steps: press + for a new ground row and leave it; place a Standard duty template that lays blank desks.
Expect: nothing outlined, count unchanged (D2852 "a blank row with nobody on it"); seat one man on one desk → only that
desk outlined, at once, grey.

**T-23 — a template that lays a START with no END.** D, week. (Only if some day, duty or wave template lays such a row;
if none does, write "no template does" with the list searched.)
Expect: that row counted at once, nobody on it too ("a row with a start needs its end", D2852).

**T-24 — the Unavailable list and Personal Inputs on the day.** D, week.
Steps: a member files leave and an ATTACH on Thursday; look at the day.
Expect: no outline on anything under Unavailable or the Personal Inputs lines, never counted (D2852 I1 — the rule does
not look there).

## D. The count line (D2854, D2734)

**T-25 — the week's line.** Both, week. Draft Thursday with three gaps from section B (a flight, a desk, a ground row).
Expect: "3 items missing a time · 4 to sign" (D2854). Read the colour of "3 items missing a time" and picture it beside
the try-out.

**T-26 — the board's line on a phone: no box names, one line.** P, board; D, board. Same day.
Expect: "3 items missing a time · 4 to sign" with NO "CUR CK, SKED CK…" names, on ONE line at 402 in WebKit (D2734).
Measure the line's height against one line of its font. Then sign CUR CK after typing all times → names back: "3 to
sign · SKED CK, PLANNED BY, APPROVED BY".

**T-27 — the worst case at 402.** P, board and week.
Steps: through the controls make 12 items missing on one day (e.g. 12 seated rows with an end left empty); then a
squadron view where the sign-off line also carries the plans selector and version tag.
Expect: the board's "12 items missing a time · 4 to sign" stays on one line at 402 (D2734); nothing overflows the
screen sideways; measured with an iPhone's letters as well as the forced wide letters (§7.2, lesson 23b; memory: his
iPhone's font). Record the week's line at 402 too (no ruling on its line count — picture it).

**T-28 — one item.** Both, week and board.
Expect: "1 item missing a time · 4 to sign" (the plan's Q-W1 — built as recommended; picture it for him).

**T-29 — the line moves as the count changes, and its neighbours stay put.** Both, week and board.
Steps: from 0 gaps → 1 → 3 → 0 by typing and clearing times; measure the boxes of the four sign pills, the Publish
button, the plans selector and the warning fold before and after each step.
Expect: the line's words change at once each step (no repaint needed); no neighbouring control moves unless he ruled it
(lesson 27); on the board at 402 the bar's height does not change (lesson 17).

**T-30 — some signed, then a gap appears.** D, week.
Steps: on a day with no gaps sign CUR CK and SKED CK ("2 to sign"); then clear a desk's END.
Expect: the shown names drop as any change drops them; the line reads "1 item missing a time · 4 to sign" (D2854).

**T-31 — the count line's tap (ruled, left for later by the plan).** Both, week.
Steps: with three gaps, tap "3 items missing a time".
Expect by D2854: it goes to each empty box in turn. The plan builds this later (§R3 step 7): the walk records what the
tap does now and the item's written disposition (filed, with its place) — §7.6, never "rare".

**T-32 — the stale-appointment words beside the count.** D, week. (READING Q21.)
Steps: through Admin, make a SKED CK name stale (unappoint the scheduler who signed) on a day that then gets a gap.
Expect: record the line as built ("… · SKED CK needs an appointed scheduler" after the count, as today) — marked for him.

## E. Every route to sign or publish is refused while a time is missing (D2612, D2854, D2855)

**T-33 — a sign box on the week, by mouse.** D. Draft Thursday, three gaps.
Steps: click CUR CK.
Expect: the list does not open; the pill stays "— name —"; the grey note reads S-sign with 3; every outlined box on
Thursday turns red; no line in the Changes window, nothing in the bell, no Undo step added (D2853, D2854). Lesson 3:
picture what tells him the press happened.

**T-34 — each of the four boxes.** D, week; P, board.
Steps: press SKED CK, PLANNED BY, APPROVED BY in turn.
Expect: the same words each time; nothing written in any (D2612).

**T-35 — a sign box on the iPhone, by touch.** P, week then board.
Steps: tap CUR CK with a finger; picture at 100 ms and settled.
Expect: no native picker rises (WebKit); the note S-sign; boxes red. On the look card: "the native list not opening on
a real iPhone is unproven until he taps it" (§7.9, lessons 6, 21).

**T-36 — a sign box by the keys.** D, week and board.
Steps: Tab to CUR CK (its focus ring shows); press Enter; then Space; then ArrowDown, Alt+ArrowDown and F4; then hold
Enter down (a repeat).
Expect: Enter and Space each give the note once; the arrows and F4 open nothing and write nothing; the held Enter gives
one note, not a row of them, and lands on nothing else (§7.4 held key). Tab moves on past the pill to the next one
(the shut list is out of the tab order).

**T-37 — the greyed Publish day takes a press.** Both, week and board. Draft Thursday, three gaps, nothing signed.
Steps: press the greyed Publish day (🔒).
Expect: it looks greyed exactly as before (dashed edge, 🔒, dim blue); the press gives S-pub "… Thursday was not
published."; every outlined box turns red; nothing published, no title tag change, no bell line, no Leave War OIL
(D2855 E1). Hover words unchanged ("Sign off CUR CK, … before publishing Thursday" — Q-W6 as today).

**T-38 — the greyed Publish with no gap does nothing, as before.** Both. A draft day with no gaps, not signed.
Steps: press the greyed Publish day.
Expect: nothing happens, no note — today's behaviour (the guard speaks only for a missing time).

**T-39 — a day signed, then a time emptied, each row kind.** D, week; P, board.
Steps: on a draft day sign all four; empty, in turn (Undo between each): a flight's landing, a desk's END, a sim's END,
a ground row's END, a Common Programme row's END, a standby line's END.
Expect: each time the four names drop and the line reads "1 item missing a time · 4 to sign". If any kind keeps its
names (the line says "Signed — this day can be published" with a box outlined), press Publish day: it must refuse with
S-pub, and the kept names are a finding (the signature binding must cover every time — roll-call row 17).

**T-40 — the published day being amended: Publish AL.** Both, week and board. Published Wednesday.
Steps: empty an SXO desk's END on Wednesday; read the day's head ("1 pending"); look at the box (dotted waiting mark
inside the grey outline, the try-out's frame c); press a sign box; press the greyed Publish AL1; type the END; sign
four; press Publish AL1.
Expect: names dropped; the box grey with its dotted mark; sign press → S-sign-1; Publish AL1 press → "Blocked: 1 item is
missing a time, outlined in red. AL1 was not published." (Q-W2, built as recommended); both turn the box red; after
typing and signing, AL1 publishes as before (D2853 "the same on a published day being amended").

**T-41 — the second amendment.** D, week. Wednesday after AL1.
Steps: empty a time again; press Publish AL2.
Expect: "… AL2 was not published." — the AL the press would issue, never the one out.

**T-42 — the desktop Amendments panel's Publish AL.** D. Published Wednesday with a time emptied. (READING R6.)
Steps: open the Amendments panel; look at and press its Publish AL.
Expect: as today (greyed until signed; signing is refused, so it stays greyed); record whether a press says anything —
marked for him. With a version previewed, still locked.

**T-43 — Unpublish, edit, republish.** D, week. Published Wednesday.
Steps: Unpublish (a correction); clear a ground row's END; press the publish control the corrected day shows.
Expect: refused with the note naming what the press would issue; nothing reissued; type it → reissues as before.

**T-44 — the OIL list's held sign-off: time first, list second.** Both, week. Saturday 18 Jul with a member's Duty
input whose OIL question nobody has answered (filed by the member on the Inputs page), and a desk with a man and no END.
Steps: press CUR CK.
Expect: the time note S-sign-1; the OIL list does NOT open (D2855 E2). Type the END; press CUR CK, pick Ace → the OIL list
opens holding Ace; Save → Ace signed, the list closed. Repeat with the list's ✕, Escape, a tap outside, and Later — each
as before the build (lessons 12, 19).

**T-45 — a gap made while the OIL list is up.** D, week. T-44's Saturday, list open holding a name.
Steps: with the list up, press the page behind it (lesson 4) and clear a desk's END if the page lets you; press the
list's Save; then repeat with Later.
Expect: Save writes no name and the sign note shows (the backstop, D2612); record whether the list stays or closes and
what the pill shows. If the page behind cannot be typed in while the list is up, say so and the case is a test's.

**T-46 — two days, one refused.** D, week. Thursday and Friday each with a gap.
Steps: press Thursday's CUR CK.
Expect: only Thursday's boxes turn red; Friday's stay grey (red follows the refused day only, D2853).

**T-47 — the wrong-week (protected) book still answers first.** D. A week the app protects (the read-only copy of a
past issued week, opened from the week selector), with a gap.
Expect: its own read-only words, never the time note.

## F. The outline's colour and its life (D2853)

**T-48 — red stays until typed; each box leaves red as its time goes in.** Both, week. After T-33 (three red boxes).
Steps: type one missing time, the caret still in that section; then tap away; type the second.
Expect: the typed box's outline goes at once, while the caret is still in the section (the held section is not
repainted — the in-place pass must clear it); the count drops to 2 then 1; the boxes not yet typed stay red.

**T-49 — lesson 16 at a box.** P, week.
Steps: after a refusal, tap away; tap a red box afresh; type a time; clear it; type the same time again.
Expect: outline gone after each typed time, back after clearing; never stuck on the old state.

**T-50 — a box emptied after the refusal, and a fresh press.** Both. (READING R3.)
Steps: after T-48 leaves one red box, clear another box that was full.
Expect: record its colour (the build draws it grey until the next refused press — the plan's literal reading); then
press a sign box again → every outlined box red. Marked for him.

**T-51 — red across pages, weeks and reload.** Both. (READING R4, except where D2853 settles it.)
Steps: after a refusal, go to View-only Sched and back; to week 2 and back; open and close the board; sign out and in;
reload the page.
Expect: back on Edit Schedule the outline is drawn at once, without a scroll or tap (lesson 10, WebKit included);
record the colour after each route (red kept, grey, or none) — marked for him. Sign-out clears red (the plan, R4).

**T-52 — the note's own life.** Both.
Steps: press a sign box; within the note's life press it again; then press Publish day; then type a time and press
again.
Expect: one note at a time (no stack), its words switching to S-pub on the Publish press, with the count it reads
current; the note at the foot does not cover the sign boxes or the Publish button at 402 or 1536 (§7.4 lifetime table).

**T-53 — the box brought into sight on a phone, nothing over it.** P, week and board.
Steps: after a refusal, tap a red box near the foot of the screen to type; then one near the top under the top bar.
Expect: the box at rest above the keys, not under the note, the sign bar, the top bar or a sticky day head (lessons 5,
24); flick to the page's foot and back — outlines still drawn.

**T-54 — side-by-side boxes one height with the outline.** Both, week and board.
Steps: measure a START / END pair where one is outlined and one not, on a flight line, a desk, a sim, a ground row and a
Common Programme row.
Expect: each pair one height and one line, the outline inside the box, no jump of the row's height (lesson 23b, his
lesson 43); then the drawing check against the try-out and the board frames at 402 and 1536 (D1494).

## G. Undo, redo, plans, versions (D2852, D2853; Q15 as today)

**T-55 — Undo after a refused press.** D, week.
Steps: clear a desk's END (one gap); press CUR CK (refused); press Undo.
Expect: Undo puts the END back (the refused press made no step); the outline and the count go at once; Redo empties it
again — outline back, grey.

**T-56 — sign four, empty a time, Undo, Redo.** D, week; P, board's Undo / Redo.
Steps: sign all four on a full day; clear a flight's landing (names drop); Undo; Redo.
Expect: Undo → landing back, names back, no outline; Redo → landing empty, names gone, outline grey, count 1.

**T-57 — Undo of an Unpublish while a gap stands on the working copy.** D. (READING Q15.)
Steps: published Wednesday; Unpublish; clear a time; Undo twice.
Expect: record what Undo does (today: allowed, the issued day comes back as it was) — marked for him.

**T-58 — saved plans: refused on plan A, plan B, back to A.** D, week.
Steps: Thursday plan A with one gap; press CUR CK (refused, red); make plan B with every time in; switch to plan B;
switch back to plan A; preview plan B while A is live.
Expect: plan B — no outline, signable and publishable; back on A — its untyped box still red (D2853 "staying red until
the time is typed"; two plans never share a colour); the preview of a parked plan shows no outline (READING R5 —
recorded for him).

**T-59 — load an issued version onto the working copy.** D. Published Wednesday with a time emptied.
Steps: open the version list; load AL0 / Original onto the working copy.
Expect: the time back, the outline and the count gone.

## H. Who sees it, and where it must not be (D2853 K)

**T-60 — View-only Sched never shows it.** Both. Thursday with three gaps, one refused (red on Edit Schedule).
Steps: as the same admin, open View-only Sched; then sign in as a member and open it; on a published day with a gap
on its working copy, open the "Working draft" peek.
Expect: no outline (grey or red) on any box, no "missing a time" words, in every case (D2853 K).

**T-61 — another squadron's day.** Both. An admin of 142 with Plan of 149.
Steps: pick 149; on its Thursday clear a desk's END; press a sign box and the greyed Publish day; then sign in as a
View holder of 149.
Expect: the Plan holder sees the outline, the line and the same refusal; the View holder sees View-only only, no
outline. Red on 149's Thursday does not colour 142's Thursday.

**T-62 — the previews and peeks.** D. (READING R5 for each.)
Steps: preview an issued version of a day with a gap on its working copy; the next-week peek; OIL Earn mode on a day
with a gap.
Expect: record whether each shows an outline (the build: none where a box cannot be typed in) — marked for him; OIL
Earn mode pictured with whether its boxes can be typed.

**T-63 — the export.** D, P.
Steps: on a day with red boxes, use the week's export button; picture the print-media result in Chromium and WebKit.
Expect: no outline and no count line in what it makes (lesson 18).

## I. Readings — both sides pictured, marked for him, never passes (lesson 32)

**T-64 — R1: only the END typed, nobody on it.** D. A Common Programme row "— 17:00", nobody.
Record: as today, not counted and not refused. Beside it, a row with only a START and nobody — counted (ruled).

**T-65 — R7: every aircraft cancelled, the line not.** D. Two aircraft, take-off typed, no landing, both aircraft CX'd.
Record: as today, never counted. Beside it, the line itself CX'd — never counted (ruled).

**T-66 — R8: the OFT "EXT SQN" row.** D. Tuesday's SIMS (EXT SQN) row, its END cleared, then its START cleared too.
Record: END cleared → counted by its START (ruled); both cleared → as today, not counted (the label is not someone).

**T-67 — Q16: an AMT row labelled "BOX — DEBRIEF PRACTICE", nobody, START only.** D.
Record: as today, never counted (the engine's own label test). Beside it a plain AMT row with START only — counted.

**T-68 — Q17 and Q14.** D. (a) A timed input's ground row: clear its END. Record: the input turns all day (D739,
D740), the row left out. (b) Type "TBD" in a landing box. Record: today's refusal "TBD is not a time. Try 0900 or
09:00.", the old value kept, no new words (D2855 — "TBD" has no words of its own).

**T-69 — Q20: two marks on one gap.** Both. A Common Programme ALL AVAIL row with no START.
Record: the built "?" chip and the outlined START box, both pictured together.

## J. The plain-user round (§7.0a) — a scheduler's day, start to finish

**T-70 — the scheduler's day, desktop.** D. Fresh boot.
Steps: Edit Schedule → Thursday: add a flying line and seat its crew (drag and the crew panel); add a desk, a sim, a
ground row, a Common Programme item, leaving one time out of each; try to sign — refused; open the board from the day,
type two of the times there, close it by its ✕; reopen, close by Escape and by its back way; type the rest on the week;
sign the four; publish; then amend: clear a time, try Publish AL1 — refused; type it, sign, publish AL1; Unpublish and
republish. Open and close on the way: the Changes window, the day's ⓘ window, the plans menu, the version list, the
Legend, the warning list's fold, the OIL list (✕, Escape, Later, Save) — each by every way it closes.
Then look at every other place the result shows: View-only Sched (no outline), the Inputs page, the bell (one line per
publish, none per refusal), a crewman's Leave War OIL card on the weekend day, the next week and back, the Changes
window (no line for any refused press).
Expect: every refusal in the ruled words; no window left open behind another; no error in the browser's list.

**T-71 — the same day on the iPhone.** P. Fresh boot.
Steps: the same tasks on the phone week and the phone board, by touch, each tap pictured at 100 ms and settled; the
board's sign bar read at each count.
Expect: as T-70; the board's line one line throughout; no pinned cell turns see-through while pressed (§7.10); nothing
under the top bar, the keys or the note.

**T-72 — a member's day.** P. Member signed in.
Steps: file an input on the Inputs page, open View-only Sched for the day a scheduler left a gap on, open the bell.
Expect: no outline, no count, no "Blocked" note ever reaches a member; his input shows as filed.

---

## Lessons of §7.11 — where each is covered

| Lesson | Scenario | Lesson | Scenario |
|---|---|---|---|
| 1 state × reading | T-25–T-30, T-39, T-40, T-58 (draft / amending / correcting / plan × signed × gaps × colour) | 17 width/height change | T-29, T-27 |
| 2 gesture speeds | T-18 | 18 print | T-63 |
| 3 feedback | T-33, T-37, T-52 | 19 window over window closed | T-44, T-70 |
| 4 page behind a window | T-45 | 20 gesture ways | T-18 (drag only — no new gesture) |
| 5 box at rest vs what covers it | T-53 | 21 test touch ≠ his phone | T-35 (look card) |
| 6 only the phone draws | T-35 (native picker) | 22 judged by pixels | every outline step (header) |
| 7 frame-by-frame model | not applicable — nothing steered against the phone's motion | 23 tap's window vs rulings | T-44 (the OIL list as ruled, E2) |
| 8 drawing beside the build | T-54 | 23b side-by-side boxes | T-54, T-27 |
| 9 list alignment measured | T-29 (the sign bar's parts measured) | 24 flick to foot | T-53 |
| 10 page hidden and shown | T-51 | 25 every place to put it | T-04–T-18 (standby lines, ALL AVAIL on a desk, typed callsign, drag) |
| 11 depends on what fits | not applicable — nothing read from how much fits | 26 gesture by where it went | T-18 (the man lands where dropped) |
| 12 window from every page | T-44 (week), T-70 (board and week) | 27 neighbours measured | T-29 |
| 13 pinch part-way | not applicable — no pinch change | 28 press by a scrolling script | T-35, T-53 (no script scroll on P) |
| 14 keyboard roll-call by search | T-53, T-71 (every time box kind tapped on P) | 29 page open past midnight | not applicable — nothing reads today |
| 15 pinned bar's fill | T-71 (the board's sign bar while the list scrolls under it) | 30 tint after a tap | header, T-35, T-71 |
| 16 refusal then same figure | T-49 | 31 page fitted at 125% | not applicable — no fitted page changes |
| | | 32 a builder's reading | T-31, T-32, T-42, T-50, T-51, T-57, T-58 (preview), T-62, T-64–T-69 |

## Roll-call gaps this list puts to the host

- The board's sign bar is allowed to wrap (`white-space: normal` on it while a time is missing): T-26 / T-27 decide
  whether D2734's one line holds at 402.
- The count-line tap (D2854) and the Amendments panel's Publish AL (R6) are not built: T-31 and T-42 need written
  dispositions (§7.6).
- The red state is keyed by squadron, date and saved plan; T-46, T-58 and T-61 check that the keys keep days, plans and
  squadrons apart.
- The signature binding must drop the names for every row kind's time, or a signed day with a gap shows "Signed — this
  day can be published" without the count: T-39.
