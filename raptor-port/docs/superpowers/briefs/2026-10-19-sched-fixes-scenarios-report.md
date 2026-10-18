# Report — scenario design for the Schedule-and-amendments small-fixes batch (D994), 19 Oct 26

**Reader:** a fresh Opus 5.5 reader that wrote none of this code (bug-check order §4 rank 1). Read-only: this is the one
file written. **Branch read:** `claude/schedule-amendments-fixes-fffce0` at `7423a23ea`, against `origin/main`
(`git diff origin/main...HEAD -- raptor-port/src`, the eleven commits' messages, the 21 backlog entries, the rulings
D97, D98, D103, D107, D109, D119, D167, D183, D271, D275, D339, D418, D503, D506, D551, D553–D555, D593 (archived),
D594, D597, D600, D605, D606, D672, D733, D860, D877 — full rows opened).
**Not read:** any other reader's report, or the walkers' brief.

**For every walker (D56):** the whole stored world is demo data, cleared before the database step. A problem that lives
only in data already stored, where the app would not do it again to new data, is not a finding. Build every fixture
through the app's own controls (§7.7); if a state cannot be reached that way, that is the finding.

**How to read a scenario.** Each has an id, the surface and the sizes, the setup (through the app's controls), the
action, an EXPECTED line a walker can judge PASS / FAIL (with the ruling or commit it rests on), and what would disprove
it. "RECORD" means no ruling or commit fixes the words or the result — write down exactly what the screen says or does,
with a picture. Sizes: desktop 1440×900 (D), phone 390×844 (P), phone on its side 844×390 (L). "Undo / Redo" means the
top bar's pair. Every scenario: watch the browser's error list; any error is a finding (§7.2).

**Ranking.** Within each share the scenarios are ordered by how likely they are to find something, most likely first;
the ones marked ★ rest on a suspected missing call site or guard found by reading (listed again at the end).

---

## The roll-call — where each item's sign and gesture should exist

| Item | Where the visible sign must show | Where the working gesture must exist | Must NOT |
|---|---|---|---|
| In-time / Rally drag (D594) | the board's In-time block (the new order; the landing ring, D877); Edit Schedule's week (the board's order); View-only Sched (draft day: new order; published day: the issued order until the AL, then the new one with its AL mark); the day head's "N pending", the four sign-offs, the working-copy marker (D97), "To go out", the Amendments panel, "Discard N edits & load" (all one unit, D109) | the board's six-dot grip on each line — desktop mouse, phone and phone-on-its-side touch | a grip or drag on Edit Schedule's week (D594 (1)); a grip in a look at a version, in OIL Earn mode, for a member; a line crossing into another wave |
| Auto sort / Sort all (D594 (2)(3)) | the same places as the drag | the wave's ⇅ Auto sort on the board; the board's Sort all (desktop button; phone ⋯ menu) | a sort on the week (none exists — checked) |
| "To go out" words (`[PEND-INTIME-WORDS]`) | the changes window's To go out tab, on the week and the board, admin and member (member: read only, D338) | — | "N In-time / Rally lines → N In-time / Rally lines" |
| `[BOARD-INTIME-JUMP]` | the changes window line is a button on the board | a tap lands on the board's In-time block and marks it (D107: on the page you are on; D167: the window stays) | a dead line; a jump to the week |
| SC B words (`[SC-B-CHANGE-SAYS-BRIEF]`, `[SC-INTIME-REST-WORDS]`) | the change history label, To go out, the changes window detail, the gold-dot bubble, Undo's words, the crew-rest sentence in the issues list (week, board, a published face — D185 keeps crew rest live) | — | "brief" for an SC line's B; "in-time" for a flying, AVALON or BB line's B |
| Blank-seat sentences and the crew list (`[SC-BLANK-SHIFT-QUAL]` `[BLANK-LINE-SANS-WORDS]` `[BLANK-STANDBY-STRIKE]` `[BLANK-SEAT-ACTIVITY-HINT]`) | the issues list (week, board, View-only); the crew list on the week (desktop side list, phone drawer) and on the board; the drop's note | arming a seat, tapping a name, dragging a puck in | "NaN"; an empty "( )"; a strike on a man the rule lets stand a standby place |
| SC SPARE ring (`[SC-SPARE-RING-BORROWS]`) | the SPARE puck on the week, the board, View-only Sched's published face | — | the SPARE puck borrowing the MAIN seat's leave ring |
| History lines (`[BLOCK-NO-HISTORY-LINE]`) | the changes window's history, for "+ Block", "+ Wave → SC / AVALON / BB", a document added to or taken off a filed request | — | a structural add with no line |
| Discard count (`[DISCARD-FILING-NOOP]`) | the version menu's "Load onto working copy" / "Discard N edits & load — confirm", on the week and the board; the load's note | — | a promised discard that changes nothing |
| Layers and notes (`[SECDEFAULT-OFFER-BEHIND-BOARD]` `[BUBBLE-SMALL-SEEN]` (2)(3)) | the "Use this section order as the default for every day?" offer, above the board, both sizes; a passing note on a phone with the changes window open | the offer's "Set as default" / "Not now" | a note over the offer's buttons or the window's first lines |
| Trace focus (`[TRACE-FOCUS-STAYS]`) | the lit crew and the dimmed page | closing the list the "Breaks <day>" line was tapped in | the light left on with no way to clear it |
| Landing flash (`[ONE-ROW-DRAG-FLASH]`) | the plain blue landing ring (D860, D877) on the row that moved | a ground row's grip, a shared input's one row | the ring on a row that did not move |
| Undo's words (`[OIL-NOTIFY-SEEN]` (1)) | the Undo / Redo note and the Undo button's title | — | an internal id or code in the words |
| Touch edge band (`[OIL-NOTIFY-SEEN]` (6)) | — | a puck held near the top or foot of a short board pane | the pane scrolling under a finger held clear of the edge |
| Second click (`[EDIT-SECOND-CLICK]`) | the caret in the box clicked once | a mouse click, a finger tap, on the week and the board | a click that lands nowhere |
| Tab route (`[TAB-LAST-BOX-TEST-GAPS]`, D553, D597) | the keyboard's ring on the next control | Tab and Shift+Tab | the focus left on the page itself |
| Resize (`[ARROW-GUTTER-STRIP]`) | the front day flush at the left (D275); "day a–b of 7" | a window resize, a zoom change, on Edit Schedule and View-only Sched | a day sitting partly under ‹ after the resize settles |
| OFT "+" (`[OFT-ADD-TWICE-SILENT]`, D271) | the refusal note | the OFT row's "+" with a man armed; the row's "+ add" then his name | silence |
| Leave War phone (`[AMEND-SMALL-SEEN]` (6)(7)) | the grid stays on its month; no question for a weekend LL | a tap on a man's name; a bid on a weekend | the grid jumping to 1 January; "takes … to −1 ANNUAL" for a weekend LL |

---

## Share 1 — In-time / Rally (the board drag, the sorts, a published day, the words, the jump)

**Fixture F1 (build it once, through the app).** Sign in `ad`/`a`. On Edit Schedule pick a weekday not yet published
(call it Mon). Open the Scheduler Board on Mon. In the first flying wave type the first line's take-off 10:00. Press
"+ In-time / Rally" three times and type the three lines, leaving each line by a click elsewhere:
L1 `08:00H: IN TIME + WX/NOTAMS`, L2 `07:30H: RALLY`, L3 `BRIEF ROOM 2` (no clock). Assert the three lines show in that
order before going on. **Fixture F1P:** the same on another weekday (Tue), then sign all four and publish it (ORIG);
assert the ORIG tag and four sign-offs before going on. Give each line DIFFERENT words — two lines with the same text hide
a lost line.

**S1-01 ★ — a line dragged while the caret is in a line of the same block.** Board; D (mouse) and P (finger).
Setup: F1 on Mon. Press "+ In-time / Rally" (the app puts the caret in the new last line); type `06:45H: STEP`; do NOT leave
the line.
Action: with the caret still in that line, drag L1 by its ⠿ grip below L2. Picture. Then click (tap) a blank part of the
board. Picture.
EXPECTED: the lines show the new order the moment the drag ends, and after leaving the line there are four lines, each
with the words it was given — none missing, none twice (D594: a drag changes only the order; D506: order never changes
meaning).
Disproved by: the drop seeming to do nothing until the line is left; after leaving, one line's words appearing twice and
another's gone, or `06:45H: STEP` written over another line. Repeat with the caret in L2 and L3 dragged above L1.
(Why: the board holds the panel the caret is in, so the screen can keep the old order while the stored order changes,
and the focused line still carries its old position — `textedit.ts` writes the line by that position when it is left.)

**S1-02 ★ — the same, with the wave's ⇅ Auto sort instead of a drag.** Board; P (finger) and D.
Setup: F1; caret in L3 (tap into it, type a space and delete it).
Action: tap the wave's ⇅ Auto sort; then leave the line.
EXPECTED: L2, L1, L3 (S1-06's order) shown at once; after leaving, all three lines with their own words.
Disproved by: the order not changing on screen, or a line lost or doubled after leaving.

**S1-03 ★ — a phone on its side.** Board; L, finger.
Setup: F1.
Action: hold L3's grip; move it up and keep the finger still about 40px below the top of the board's pane for two
seconds; then over L1; let go. Repeat holding 15px from the top.
EXPECTED: held 40px from the edge the pane does not scroll; L3 lands first. Held at 15px the pane may scroll — RECORD the
distance at which it starts.
Disproved by: the pane scrolling away under a finger held well clear of its edge, the line let go over nothing, or the
line landing in another place than the one under the finger. (The puck drag's edge band now shrinks on a short pane —
`[OIL-NOTIFY-SEEN]` (6) — but the row drag that carries these lines keeps a fixed 72px band.)

**S1-04 — the basic drag, then the week, a reload, Undo and Redo.** Board, then Edit Schedule's week, then View-only
Sched; D and P.
Setup: F1.
Action: drag L3 above L1. Close the board with ✓ Done. Reload. Undo. Redo.
EXPECTED: board order L3, L1, L2, the moved line in the plain blue landing ring with no glow (D877); the week shows the
same order with no grip on any line (D594 (1)); View-only Sched shows the same order (a draft day); after reload the order
is kept; Undo puts L1, L2, L3 back in one step and Redo the new order, the screen staying where it is when the block is in
view (D672). RECORD Undo's words.
Disproved by: the week showing the old order; a grip on the week; the order lost on reload; Undo needing two steps.

**S1-05 — Edit Schedule's week has no drag for these lines (D594 (1)).** Edit Schedule's week; D and P.
Setup: F1 (on the week).
Action: press and drag on L2's text and on the space left of it; then use the wave's own grip to drag the wave below the
next wave.
EXPECTED: no ⠿ beside any In-time line; pressing on a line puts the caret in it and moves nothing; the wave's own grip
still moves the whole wave, its lines with it, in their order.
Disproved by: a grip on a line on the week, a line moving, or the wave arriving with its lines reordered.

**S1-06 — the wave's ⇅ Auto sort orders the lines by time (D594 (2), D503).** Board; D and P.
Setup: F1, plus a fourth line L4 `23:30H: CREW IN` (later than the 10:00 take-off, so the evening before — D503).
Action: press the wave's ⇅ Auto sort; press it again; Undo; Redo.
EXPECTED: L4 (23:30 the evening before) first, then L2 07:30, L1 08:00, then L3 (no clock) last (D594's full row (2): "a
previous-evening clock … before the same day's, a line with no clock last"); the second press says "Already in order"
and changes nothing; Undo one step back to the typed order; Redo the sorted.
Disproved by: 23:30 sorted last; the no-clock line anywhere but last; the second press moving anything.

**S1-07 — a line for a named formation is read against that formation's take-off.** Board; D.
Setup: F1; a second line in the wave with callsign VL, take-off 07:00; add a line `VL 07:30H: RALLY` (later than VL's
07:00 take-off, so the evening before — D503, D505), and a line `09:00H: IN TIME`.
Action: ⇅ Auto sort.
EXPECTED: `VL 07:30H: RALLY` sorts before every same-day clock (it is the evening before for VL); RECORD the whole order.
Lines with equal clocks keep the order they had (the commit: "ties in their own order").
Disproved by: the VL line sorted among the morning clocks as 07:30.

**S1-08 — Sort all does it too (D594 (3)), and how many history lines it writes.** Board; D (Sort all button) and P (⋯ →
Sort all).
Setup: F1 with L4 as in S1-06; also put the day's Ground Programme rows out of time order.
Action: Sort all, confirm; open the changes window's history for the day; Undo.
EXPECTED: the In-time lines in S1-06's order alongside every other section sorted; the note "Every section on <day>
sorted"; ONE Undo step puts every section back. RECORD every history line Sort all wrote (the code means to write one;
the In-time sort writes its own line too — see the missing-call-site list, item 8).
Disproved by: the In-time lines left unsorted by Sort all; Undo needing more than one step.

**S1-09 — a drag on a published day is a change waiting (D594 (4), D103, D97).** Board, then View-only Sched, then the
member's view; D and P.
Setup: F1P on Tue (published, four sign-offs).
Action: drag L2 above L1. Look at the day head, the sign-offs, the working-copy marker, the changes window's To go out
tab, the Amendments panel. Then View-only Sched for Tue (admin, then `us`/`us`).
EXPECTED: "1 pending"; the four sign-offs fall (D103 — "any change that shows as pending on a published day wipes the
sign-offs"); the marker reads "Not yet signed" (D97); To go out has ONE item for the In-time / Rally lines reading
"order changed" (commit 0df4b36a3); View-only Sched's published face keeps the ISSUED order for admin and member alike until
the amendment goes out (D178/D179: the face keeps what it was issued with).
Disproved by: no pending; sign-offs still standing; To go out reading "3 In-time / Rally lines → 3 In-time / Rally
lines" or naming every line; the published face showing the new order.

**S1-10 — dragged back, it nets to nothing (D98, D103).** Board; D and P.
Setup: S1-09 done.
Action: drag L2 back below L1.
EXPECTED: "0 pending" / no pending count; the In-time block wears no change mark; the four sign-offs are back (D103's
full row: "putting the change back restores the signatures, as ever"); the "Not yet signed" marker gone; To go out empty
(D98: "a day that is back to what was published shows nothing pending").
Disproved by: "1 pending" or an AL tag remaining; the sign-offs not coming back.

**S1-11 — Undo and Redo on the published day.** Board; D and P.
Setup: S1-09's drag (not dragged back).
Action: Undo; Redo; Undo.
EXPECTED: Undo — issued order, nothing pending, sign-offs back; Redo — new order, 1 pending, sign-offs fallen; the screen
stays put when the block is in view (D672). RECORD the Undo note's words.
Disproved by: a pending count or sign-offs that do not follow the order back and forth.

**S1-12 — a drag and a typed edit on the same block, both orders.** Board; D.
Setup: F1P on Tue.
Action (A): drag L2 above L1, then change L1's clock 08:00 → 07:45 by typing. (B, after Undo to clean): change the clock
first, then drag.
EXPECTED: in both orders the day head reads "1 pending" and To go out has ONE In-time item (the lines are one field —
D109: every count uses the same counting); its words name the line that changed (`08:00H: IN TIME … → 07:45H: IN TIME …`,
commit 0df4b36a3) — RECORD whether the order change is also said. The Amendments panel and "Discard N edits & load" say the
same number (D109).
Disproved by: two counts that disagree, or "2 pending" for one block.

**S1-13 — the amendment goes out with the new order.** Board, View-only Sched; D.
Setup: S1-09's drag.
Action: sign all four; Publish AL1; open View-only Sched for Tue (admin and member).
EXPECTED: the published face now shows the new order; the In-time block carries the AL1 mark ("Changed at AL1"); nothing
pending.
Disproved by: the face still in the old order, or a pending count after the AL.

**S1-14 — "Load onto working copy" after a drag (D98, D109).** Board's version menu, then the week's; D.
Setup: S1-09's drag.
Action: pick the Original, "Load onto working copy", then "Discard 1 edit & load — confirm".
EXPECTED: the button promises 1 edit; after the load the issued order is back and nothing is pending.
Disproved by: a count of 0 or 3; the order not restored.

**S1-15 — the words for a typed change, a removal and an addition (`[PEND-INTIME-WORDS]`).** Changes window on the board
and on the week; D and P.
Setup: F1P on Tue.
Action: (a) change L1 08:00 → 07:00; (b) after Undo, ✕ L2; (c) after Undo, "+ In-time / Rally" and type `06:00H: STEP`.
EXPECTED (commit 0df4b36a3): (a) the changed line before → after (`08:00H: IN TIME … → 07:00H: IN TIME …`); (b) `07:30H:
RALLY → removed`; (c) `added: 06:00H: STEP`. The count stays 1 each time.
Disproved by: "3 In-time / Rally lines → 3 In-time / Rally lines" (or 3 → 2, 3 → 4) anywhere. (The unit test calls the
wording directly — only the screen proves the window gets these words.)

**S1-16 — the In-time line in the changes window is a button on the board (`[BOARD-INTIME-JUMP]`, D107, D167).** Board;
D and P; then the week.
Setup: S1-15 (a) done.
Action: on the board open the changes window and tap the In-time line; then the same on Edit Schedule's week.
EXPECTED: on the board the line is a button; the tap brings the board's In-time block into view and marks it briefly, the
window staying open (D167); on the week the tap lands on the week's block (D107 — on the page you are on).
Also: remove every line of a wave on a published day, then tap that change's line — RECORD what it does or says (the
block is not drawn when the wave has no lines).
Disproved by: a line that is not a button on the board; a tap that opens the week or does nothing.

**S1-17 — a line cannot cross into another wave.** Board; D and P.
Setup: F1 and a second wave with one In-time line.
Action: drag L1 onto the second wave's line; let go.
EXPECTED: no drop place lights in the other wave and nothing moves (the drag keeps a row in its own container).
Disproved by: the line arriving in the other wave.

**S1-18 — ✕ and clearing a line, straight after a drag.** Board; D and P.
Setup: F1.
Action: drag L3 to the top; at once press the ✕ beside the line now second; Undo; clear the words of the second line
(select all, delete, leave it); then drag the new last line to the top.
EXPECTED: the ✕ removes the line it stands beside, and its note names that line ("In-time / Rally line removed —
<its words>"); clearing a line removes it; the following drag moves the line held.
Disproved by: a different line removed or moved.

**S1-19 — a published day already in order.** Board; D.
Setup: F1P with lines already in S1-06's order.
Action: the wave's ⇅ and Sort all.
EXPECTED: "Already in order"; nothing pending; the four sign-offs stay (`[AMEND-SMALL-SEEN]` (9) — a sort that changes
nothing visible keeps them).
Disproved by: the sign-offs falling.

**S1-20 — no grip where no edit is allowed.** Board; D.
Setup: F1P.
Action: open a look at the issued version (👁 / the version menu); switch on OIL Earn mode; sign in as `us`/`us` and look
at Tue on View-only Sched.
EXPECTED: no ⠿ on any In-time line in the look, in OIL Earn mode, or for the member; nothing can be dragged.
Disproved by: a grip, or a line that moves.

---

## Share 2 — the crew list, the warning sentences, the rings, the trace focus, the published-day flags

**Fixture F2 (a weekday not yet published — call it Wed — through the app).** On the Inputs page file, for Wed, all day:
man A local leave (LL); man B overseas leave (OL); man C Training (a whole-day personal commitment); man G an ATT C
(downchit). On the SANS calendar file, for a SANS man D, Fly 14:00–16:00 on Wed. On Edit Schedule's Wed: "+ Wave → SC"
(an SC line); "+ Wave → BB" (it comes up with no shift times); "+ Line" in the first flying wave, left with no callsign,
mission or times. Assert each input shows on Wed before going on. Read the crew-rest setting on Logic; give man E a duty on
Tue ending late enough that his crew rest clears at 12:30 on Wed (assert the issues list says so when he is placed on an
early seat).

**S2-01 — the SC crew-rest sentence names the in-time (`[SC-INTIME-REST-WORDS]`).** Issues list on the week and the board;
D and P.
Setup: F2; the SC line's first shift 13:00–19:00, its B typed 05:00; man E in its first MAIN seat.
Action: open Wed's issues list; then set the B blank; then set the shift 11:00–17:00 with B 12:00 (later than the start).
EXPECTED: with B 05:00 the line reads "… but SC AM's in-time is 05:00 — …" (commit 6a6509fff; the backlog's fix); with the
B blank there is no breach (the shift starts 13:00); with B 12:00 the line says "SC AM starts 11:00" (the earlier of the
two is the report — D606 (1); "starts" stays for the start). Publish Wed and look at View-only Sched's face: the same
words (D185: crew rest stays live on a published face).
Disproved by: "SC AM starts 05:00"; "in-time" said of the shift start.

**S2-02 — an SC shift with its times cleared (`[SC-BLANK-SHIFT-QUAL]`).** Issues list, week and board; D and P.
Setup: F2's SC line; clear the first shift's start and end boxes; put a man who holds SC DAY currency only in its first
MAIN seat.
Action: open the issues list; then clear only the start; then type 19:00–01:00; then 07:00–13:00.
EXPECTED: no "NaN" anywhere on the page; no "SC NIGHT currency needed" line while either time is blank (the commit: no
day or night to tell); with 19:00–01:00 the night-currency line with the real clock; with 07:00–13:00 nothing.
Disproved by: "(NaN:NaN–NaN:NaN)", or a currency line with a blank shift.

**S2-03 — a SANS man on a line with no times (`[BLANK-LINE-SANS-WORDS]` (1)).** Crew list and issues list; week and
board; D and P.
Setup: F2; arm the blank line's front seat.
Action: look at man D in the crew list; place him; open the issues list; then type the line's take-off 09:00 and landing
10:30; then type its callsign VL.
EXPECTED: with no times — no line about his offer and no strike (the commit: nothing to hold his window against); with
09:00–10:30 — "<D> planned for this line — available 14:00–16:00 only", and the crew list strikes or hints him as it does
on any timed seat; with VL — "planned for VL".
Disproved by: "planned for   —" (blank hole), or the offer line before any time is typed.

**S2-04 — the blank-name sentences (`[BLANK-LINE-SANS-WORDS]` (2)).** Issues list; week and board; D.
Setup: F2's blank line (no callsign, no mission), timed 09:00–10:30.
Action: put a WSO in its front seat; an OCU pilot with no IP aboard; one man in both its seats; a second blank line
09:30–11:00 with the same man as the first; a man landing from the first blank line and taking off on the second within
the tight-turn threshold.
EXPECTED (commit 6a6509fff): "… cannot fly FCP (this line)", "OCU in this line with no IP", "<man> is in two seats on this
line at once" — no empty "( )", no double space where a name was. RECORD the clash sentence for the two blank lines (the
code now writes "this line & this line clash") and the tight-turn sentence ("Tight turn this line→this line") — both
read oddly; for him to judge.
Disproved by: an empty name in any sentence.

**S2-05 — a man on local leave may stand a standby place with no times (`[BLANK-STANDBY-STRIKE]`).** Crew list on the
week (desktop side list, phone drawer) and the board; D and P.
Setup: F2's BB line (no shift times) and an SC line with its shift times cleared.
Action: arm a BB seat; look at man A (LL) and man B (OL); place A; then arm the SC SPARE seat and do the same; then type
the BB shift's times.
EXPECTED: A is not struck and placing him raises no line (local leave may stand a standby place — the owner, 10–11 Aug 26;
D605 keeps each kind's exemptions); B is struck and flagged (the positive control); typing the times changes nothing for A.
Disproved by: A struck "local leave (LL)" on a blank standby seat.

**S2-06 — a whole-day commitment is advised on a seat with no hours (`[BLANK-SEAT-ACTIVITY-HINT]`).** Crew list and issues
list; week and board; D and P.
Setup: F2 (man C: whole-day Training).
Action: arm the blank line's seat; look at C; place him; then arm: a ground row with no times; a duty desk with no times;
the Training input's own row on the Ground Programme; a BB seat. Then file a part-day Training 09:00–11:00 for another man
and arm the blank seat.
EXPECTED: on the blank line, the ground row and the desk C reads "already on Training" — advised, never struck the way a
leave is (D279: the words say which); placed on the blank line, the list says "Training clashes with this line" (D605);
on the Training input's own row and on the BB seat, nothing; the part-day man, nothing (no hour to compare).
Disproved by: no hint before placing; a strike; a hint on the input's own row.

**S2-07 — the SC SPARE does not borrow the MAIN's leave ring (`[SC-SPARE-RING-BORROWS]`).** Week, board, View-only Sched's
published face; D and P.
Setup: F2's SC line with its shift times BLANK; man A (LL) in its first MAIN seat AND its SPARE seat.
Action: look at both pucks; then put man B (OL) in the SPARE instead; then man G (ATT C); then type the shift times with A
in both seats; publish Wed and look at View-only Sched.
EXPECTED: A's MAIN puck red ring and C, the list "On leave but tasked — SC AM"; A's SPARE puck no red ring and no C
(local leave may stand a spare); B and G in the SPARE do ring (positive controls); with times typed the pair is red for
being in two places ("standing SC SPARE … and also on …") — that is right. The published face draws the same.
Disproved by: the SPARE puck ringed red with C for A's local leave, with blank times.

**S2-08 — the two-places ring across waves still rings both (control).** Week and board; D.
Setup: one man in an AVALON seat and a BB seat with overlapping times.
EXPECTED: both pucks ring for the two places (the change kept the two-places matching whole).
Disproved by: one puck unringed.

**S2-09 ★ — closing the list a crew-rest "Breaks <next day>" line was tapped in (`[TRACE-FOCUS-STAYS]`).** Edit Schedule's
week; D and P; then the board (RECORD whether the board draws these lines).
Setup: a man flying late on Mon so that Tue's early take-off breaks his crew rest (Tue's list carries the breach; Mon's
list shows "Breaks Tuesday · <man>").
Action: open Mon's list; tap the "Breaks Tuesday" line; close Mon's list by its strip.
EXPECTED: the tap lights the man and dims the rest; closing Mon's list puts it all back — nothing lit, nothing dim (commit
4c328fb02).
Disproved by: the man still lit and the page still dim with every list closed.

**S2-10 ★ — the same with the run-of-days line ("Breaks <day> — his Nth day in a row").** Week; D and P.
Setup: on Logic lower the run limit (e.g. to 3); give one man a flying or duty place on four days in a row, so the day
before the breach shows "Breaks <day> — his 4th day in a row …".
Action: open that day's list; tap the line; close the list by its strip. Then look for a way to clear the light.
EXPECTED: the same as S2-09 — closing the list puts everything back (the promise of `[TRACE-FOCUS-STAYS]`).
Disproved by: the light left on. (Suspected: the run line carries no "pan" day, so the fix does not reach it, and "✕ Clear
focus" is drawn only in the breach day's own list.)

**S2-11 — other lists: opening and closing another day's list.** Week; D.
Setup: S2-09's tap.
Action: open Thu's list; close Thu's list; tap S2-09's line again; close Thu's (not Mon's).
EXPECTED: opening any list lets the focus go; closing a list the line was not tapped in leaves it (the commit's second
test).
Disproved by: either the other way round.

**S2-12 — the crew list judges the desk copy on a published day (`[CRP-FLAG]`).** Crew list on Edit Schedule; D.
Setup: Sun: man F on a duty 19:00–23:00. Mon: F flying at 06:00 (a crew-rest breach); publish Mon. Then on Mon's working
copy change that line's take-off to 14:00 and take F out of his seat.
Action: arm that seat; look at F in the crew list. Then the reverse: issue it at 14:00, desk copy 06:00, seat emptied.
EXPECTED: issued 06:00 / desk 14:00 — F is not struck for crew rest; issued 14:00 / desk 06:00 — F is struck for crew rest
(the commit: "the crew list asks the desk copy").
Disproved by: the crew list judging him by the issued time.

**S2-13 — "Breaks Tuesday" on a published Mon, with Tue shown as its working draft (`[CRP-FLAG]`).** View-only Sched; D.
Setup: Sun-or-Mon late duty so Tue's early take-off breaks F's crew rest; publish Mon and Tue; on Tue's working copy move
the take-off later (not published).
Action: View-only Sched: show Tue's working draft; open Mon's list; tap its "Breaks Tuesday" line.
EXPECTED: the line is drawn, its title "As published — that day has changed since"; the tap does nothing (no light, no
jump); no error in the error list.
Disproved by: an error, a jump into Tue, or the wrong crew lit.

---

## Share 3 — the changes window, history, the discard count, the board's layers, Undo's words, the edge band, the landing flash

**S3-01 ★ — Undo's words after swapping ALL AVAIL on an input's row (`[OIL-NOTIFY-SEEN]` (1)).** Board and week; D and P.
Setup: on Inputs file a one-day Meeting for ALL AVAIL on a weekday (it lands on the Common Programme — D955); on the
schedule drop a named man (Ranger) from the crew list onto the ALL AVAIL puck so they swap; and, separately, an ALL input
swapped the same way.
Action: Undo; Redo.
EXPECTED: the words name what was done in the app's names — RECORD them exactly; a lower-case id such as "allavail" or
"all" in "swapping allavail for Ranger" is a finding (the words must never show an internal code).
Disproved by: an internal id in the note or the Undo button's title.

**S3-02 — Undo's words after a swap of two men, and after an OIL answer.** Board; D and P.
Setup: a Meeting filed for Ranger, on the Ground Programme.
Action: drop Saber from the crew list onto Ranger's puck on that row; Undo; Redo. Then open the input's own window and
answer its OIL question; Undo. Then change its remarks; Undo.
EXPECTED (commit 4c328fb02): "Undid: swapping Ranger for Saber" / "Redid: swapping Ranger for Saber"; "Undid: an OIL
answer"; the remarks change "Undid: a personal input".
Disproved by: "a personal input" for the swap or the OIL answer.

**S3-03 ★ — a note already up when the changes window opens on a phone (`[BUBBLE-SMALL-SEEN]` (3)).** Edit Schedule and
the board; P.
Setup: any edit made, so Undo has something.
Action (the backlog's own order): press Undo, and while its note is still showing open the changes window. Then the other
order: open the window first, then press Undo.
EXPECTED: in BOTH orders the note does not sit over the window's first lines (the backlog's fix: "the window likewise").
Disproved by: in the first order, the note at the foot over the window's lines. (Suspected: the note is moved only when
it is raised while the window is open; the changes window, unlike the shell's windows, does not ask it to move when it
opens.)

**S3-04 — the "Use this section order as the default for every day?" offer above the board
(`[SECDEFAULT-OFFER-BEHIND-BOARD]`).** Board; D, P and L.
Setup: a day on the board.
Action: drag a section (the Ground Programme panel) by its grip to another place; read the element at the offer's centre
(§6 layering test); press "Set as default"; on another day press "Not now"; on a third let it go by itself.
EXPECTED: the offer is drawn above the board, its own element at its centre, both buttons pressable at every size; "Set as
default" says "Saved as the default section order for every day" and the next day opened shows that order; "Not now"
closes it; untouched it goes after about seven seconds.
Disproved by: the offer hidden behind the board, or a button under something else.

**S3-05 ★ — a note and the offer, both orders (`[BUBBLE-SMALL-SEEN]` (2)).** Board; D and P.
Action (A): press Undo, and within two seconds drag a section. (B): drag a section, and while the offer is up press Undo.
EXPECTED (A): the note goes when the offer comes (commit 4c328fb02); (B): RECORD whether the Undo note covers "Set as
default" or, on a phone, "Not now" — the backlog's harm is the note over those buttons.
Disproved by (A): the note over the offer's buttons.

**S3-06 — the discard count after an input filed since the day went out (`[DISCARD-FILING-NOOP]`).** Edit Schedule's
version menu and the board's; D and P.
Setup: publish Mon; then on Inputs file a Meeting for a man on Mon (it lands on the Ground Programme; Mon reads "1
pending").
Action: Mon's version menu → the Original → "Load onto working copy".
EXPECTED: no "Discard 1 edit & load — confirm"; the note "Mon is already at the Original. 1 input filed since publishing
stays on the programme, pending." (drafts.ts inputsLeftSaid, commit 7062a2963); the row still there, still "1 pending".
Disproved by: a promise to discard 1 edit, or the row taken off.

**S3-07 — the same with a real edit beside it.** Same surfaces; D.
Setup: S3-06, plus a take-off time changed on Mon.
Action: "Load onto working copy".
EXPECTED: "Discard 1 edit & load — confirm" (the take-off); after it, the take-off back as issued, the Meeting still on
the programme, "1 pending"; RECORD the load's note.
Disproved by: "Discard 2 edits"; the Meeting gone.

**S3-08 ★ — an input filed since that lands under Unavailable or Personal Inputs.** Same surfaces; D.
Setup: publish Mon; on Inputs file for Mon (one at a time, Undo between) an overseas duty, a course, and a Personal input.
Action: "Load onto working copy" of the Original each time.
EXPECTED: no promise of a discard the load does not make — RECORD the button's words, then whether anything changed after
the load, and the note's words (it says "stays on the programme" — wrong words if the input is under Unavailable).
Disproved by: "Discard 1 edit & load" followed by a load that changed nothing.

**S3-09 — a man added to an input, and a CX, after publishing (controls).** Same surfaces; D.
EXPECTED: no discard offered; the note says the change stays (the backlog calls this right).

**S3-10 — SC B is "in-time" everywhere it is named (`[SC-B-CHANGE-SAYS-BRIEF]`).** Changes window (To go out, history),
the gold-dot bubble with History on, Undo; week and board; D and P.
Setup: publish a day carrying an SC line, a flying line, an AVALON line and a BB line.
Action: type the SC line's B 06:00; change it to 08:00; Undo; Redo. Then type the flying line's B, the AVALON's B, the BB's
B.
EXPECTED (commit 7062a2963): the SC change reads "in-time" ("SC AM · in-time 06:00", "06:00 → 08:00") in To go out, the
history, the changes window's detail and the bubble; Undo "Undid: an in-time"; the flying, AVALON and BB lines' B read
"brief" ("a brief time" in Undo).
Disproved by: "brief" for the SC line anywhere, or "in-time" for the others.

**S3-11 — a wave turned from SC to a flying wave after a B edit.** Changes window; D.
Setup: S3-10's SC B edit.
Action: on the board change that wave's title select from SC to "1st wave" (if offered); then reopen the changes window.
EXPECTED: RECORD what each place calls the change (the history keeps the word it was written with; the window's detail
reads the wave as it is now).

**S3-12 — "+ Block" and "+ Wave → SC / AVALON / BB" write a history line (`[BLOCK-NO-HISTORY-LINE]`).** Changes window's
history; board and week (wherever "+ Block" exists — RECORD); D and P; a draft day and a published day.
Action: "+ Block" → pick a duty block; "+ Wave → SC"; "+ Wave → AVALON"; "+ Wave → BB"; Undo each; Redo.
EXPECTED: lines "Duty block added · <its name>", "SC added", "AVALON added", "BB added" (commit 7062a2963), as "+ Wave"
writes "Wave added"; on the published day each reads pending. RECORD what the history shows after Undo.
Disproved by: a block or standby wave added with no line.

**S3-13 — a document added to or taken off a filed request writes a line.** Inputs (the Medical tab / the input's own
window), then the changes window for its days; D and P.
Setup: an ATT C filed with one photo.
Action: open it, add a second document, save; open it, remove one, save; Undo.
EXPECTED: lines "<who> · ATT C <dates> · documents" reading "1 document → 2 documents" and "2 documents → 1 document"
(commit 7062a2963). RECORD where the line is shown.
Disproved by: no line.

**S3-14 — the landing ring on a day's first ground-row drag (`[ONE-ROW-DRAG-FLASH]`).** Board; D and P.
Setup: a day never hand-ordered; add its Ground Programme rows in the order 13:00, 08:00, 10:00 (the board draws them by
time: 08:00, 10:00, 13:00).
Action: drag the 13:00 row above the 08:00 row; picture straight after the drop; drag the 10:00 row to the bottom; Undo.
EXPECTED: after the first drag the 13:00 row (now first) wears the plain blue landing ring and no other row does (D877,
D860); the second drag rings the 10:00 row; RECORD what Undo rings.
Disproved by: the ring on the row now standing where the 13:00 row was aimed.

**S3-15 — the same for a shared input's one row dragged DOWN on the first hand move.** Board; D.
Setup: a Meeting filed for three people on one day (one row on the Ground Programme, D661), drawn above two other rows.
Action: drag it below the last row.
EXPECTED: the shared row, in its new place, wears the ring (the backlog: "the one row dragged DOWN … no flash").
Disproved by: no ring, or a ring on another row.

**S3-16 — a puck held near the top of a short board pane (`[OIL-NOTIFY-SEEN]` (6)).** Board; L (finger), then P.
Setup: a day whose rows run past the pane.
Action: L: pick a puck up from the crew drawer and hold it still 40px below the pane's top for two seconds, then 15px;
then over a row in view; let go. P: the same at 40px and 60px.
EXPECTED: L — at 40px nothing scrolls (the band is a sixth of the pane, about 32px); at 15px the pane scrolls; the puck lands on the row under the finger. P — the band
stays 52px as before.
Disproved by: the pane scrolling under a finger held 40px from the edge on L; the puck let go over nothing.

**S3-17 ★ — the same hold for a ROW, a SECTION and a WAVE grip.** Board; L.
Action: hold a ground row's grip, then a section's grip, 40px below the pane's top for two seconds.
EXPECTED: RECORD whether the pane scrolls. (Suspected: row, section and wave drags keep a fixed 72px band, so on a pane of
about 190px most of its height scrolls.)

**S3-18 — Undo past a published amendment (`[CRP-FLAG]`).** Board, then View-only Sched; D.
Setup: publish Mon; change a take-off; sign four; Publish AL1.
Action: Undo (past the publish); look at View-only Sched; Redo.
EXPECTED: after Undo the published face is the Original again with its own warnings, and the working copy reads the change
pending; after Redo the AL1 face is back and nothing pending (commit 8d78bc4da).
Disproved by: the face stuck on AL1 after Undo, or warnings of the other version.

---

## Share 4 — text boxes (one click, Tab), the desktop resize, OFT "+", the Leave War on a phone

**S4-01 — one click into another box after a changed box (`[EDIT-SECOND-CLICK]`).** Edit Schedule's week; D (mouse).
Setup: a draft weekday with two flying lines.
Action: click line 1's take-off, type a new time, then click ONCE into line 2's mission box and type `BFM`. Repeat, each
time clicking once into: line 1's landing (same line); a remarks box; the day note; an In-time line; a box on another day.
EXPECTED: each single click puts the caret where it was clicked and the typing lands there; line 1's change is saved, and
what it moves (the area time, the warnings) catches up when the caret leaves (the backlog: one click, not two).
Disproved by: the first typed letters going nowhere or into the page; a second click needed.

**S4-02 — the same when the change brings the day's first warning, or takes its last.** Week; D.
Setup: a day with no issues.
Action: type a take-off that breaks someone's crew rest, then click once into another box on the same day; Undo to clean;
on a day with one issue, type the change that clears it, then click once into another box.
EXPECTED: one click takes the caret in both; the issues box appears / goes.
Disproved by: a second click needed, or the caret lost when the issues box changes.

**S4-03 — the same on the Scheduler Board.** Board; D.
Action: change a callsign; click once into another line's mission; change an In-time line's words; click once into a
take-off.
EXPECTED: one click each.
Disproved by: as S4-01.

**S4-04 — a finger tap after a changed box.** Week and board; P (touch).
Action: as S4-01 with taps.
EXPECTED: one tap puts the caret (and the keyboard) in the box tapped. Name "his iPhone" in the sheet as the device only he
can prove (§7.9).
Disproved by: as S4-01.

**S4-05 — a changed box left by a click on a button or on blank space (no caret to keep).** Week and board; D.
Action: change a take-off, then click "+ Line"; change a take-off, then click blank page.
EXPECTED: the button acts once; the day redraws — derived values (area time, warnings, "N pending") catch up at once and
nothing stays stale until a later click.
Disproved by: a day left showing old derived values after the caret is gone.

**S4-06 — a published day.** Week; D.
Action: as S4-01 on a published day.
EXPECTED: one click; the change reads pending; sign-offs fall (D103).

**S4-07 — Tab out of the last box onto a control on a weekend day (`[TAB-LAST-BOX-TEST-GAPS]`, D553).** Edit Schedule's
week; D (keyboard only).
Setup: a Saturday whose last open text box is followed by a control (the commit's case: the ground note).
Action: Tab through to the last box; type in it; Tab. Then do it where the typed change brings the day's first warning
(a clash) and where it clears the last one.
EXPECTED: the keyboard's ring lands on the next control after the last box (D553: "tab continues to the next normal button
or control without looping or changing day") in all three cases — including when the day's issues box appears or goes;
the next Tab goes on from there.
Disproved by: no visible focus (the page itself holding it); the focus on another day.

**S4-08 — a day with no control after its last box (D597).** Week (a weekday) and the phone board; D and P (an external
keyboard on the phone, or the walker's scripted Tab).
Action: Tab from the last box; Shift+Tab.
EXPECTED: Tab keeps the caret in that box; nothing vanishes, no other day reached (D597); Shift+Tab goes back one box.
Disproved by: the caret gone, or another day's button focused.

**S4-09 — Shift+Tab from the first box onto the control before it, with the save changing the day.** Week; D.
Action: type in the day's first box a value that brings the day's first warning; Shift+Tab.
EXPECTED: the focus on the control before the first box (D553's reverse), visible.
Disproved by: no visible focus.

**S4-10 — the board's last box goes on to the first ✕ of its warning list (D597's full row).** Board; D.
Action: Tab from the board's last box, once on a day with warnings, once where the typed change brings the first warning.
EXPECTED: the focus on the first ✕ of the warning list; RECORD where it lands when that ✕ appeared with the save.
Disproved by: the focus on nothing.

**S4-11 — a save that opens the OIL question stops the route (control).** Week; D.
Action: on a weekend day type a duty request's time and Tab.
EXPECTED: the OIL question window takes the keyboard; the caret does not land in a box behind it.

**S4-12 — a resize re-lands the desktop week on a day (`[ARROW-GUTTER-STRIP]`, D275).** Edit Schedule's week, then
View-only Sched; D.
Setup: 1440×900; press › twice.
Action: resize the window to 1200 wide; then 1366; then maximise; then drag the bottom scroll track to stop mid-day and
resize again.
EXPECTED: once each resize settles, the day at the front sits flush at the left, the ‹ arrow over its first few pixels
only (D275), no day half under the arrow; the label names only the days at least half on screen — at 1440 "day a–b" counts
two days where a third shows only ~212px (commit d401fbc02).
Disproved by: a day left partly under ‹ after the resize settles; the label naming a sliver.

**S4-13 ★ — a resize during an arrow's glide.** Week; D.
Action: press › and resize within a fifth of a second.
EXPECTED: RECORD where the week comes to rest. (Suspected: the re-land is skipped while a glide runs and is not tried
again after it, and the glide was aimed with the old day width — the day may sit mid-way.)

**S4-14 — across the phone layout and back, the last day, a zoom.** Week; D.
Action: resize 1440 → 800 → 1440; press › to the last day and widen the window; in a browser started at 125% display
scaling (walk-scripts §7) press › once and change the zoom.
EXPECTED: back on a day each time; never past the last day at the front; no blank space at the right.

**S4-15 — a resize with the caret in a box.** Week; D.
Action: type in a remarks box, resize without leaving it.
EXPECTED: the caret stays; the words kept.

**S4-16 — an OFT row's "+" pressed twice for the same man (`[OFT-ADD-TWICE-SILENT]`, D271).** Edit Schedule's week and the
board; D and P; a draft and a published day.
Setup: Sims → an OFT row with a time.
Action: arm a man in the crew list, press the row's "+"; press "+" again with him armed (re-arm if the first press used
him). Door 2: press the row's "+ add", then his name, twice. Then give him an overseas leave that day and do it again. Then
tap his own puck already on the row.
EXPECTED: the second press is refused and says why — "<cs> — already on Sim … <time> · not added twice" (D271's full row:
"the message every refused drop gives"); with the leave, the first press warns of the leave and the second refuses; a tap
on his own puck selects him (blue) and arms nothing (the commit's explanation of the walk's silence).
Disproved by: silence on the second press, or a second copy of him.

**S4-17 — a man's figures on a phone leave the Leave War grid where it was (`[AMEND-SMALL-SEEN]` (6)).** Leave War; P, and
D as the control.
Setup: scroll the grid to July.
Action: tap a man's name where it shows (the name column the finger sees); close his figures; then the same for a man who
joined mid-year and for a man posted out.
EXPECTED: the grid stays on July, his row in view, open and closed (commit 7423a23ea); the late joiner's and posted-out man's
rows stay on screen.
Disproved by: the grid back at 1 January, or the row gone off screen.

**S4-18 — a weekend LL bid asks nothing (`[AMEND-SMALL-SEEN]` (7), D418).** Leave War bid sheet; P and D.
Setup: a man with 0 ANNUAL left.
Action: place an LL bid on a Saturday; then on a weekday; then a drag across Fri–Mon.
EXPECTED: the Saturday asks nothing and his figure stays 0 (a weekend LL charges nothing); the weekday asks "That takes <cs>
to −1 ANNUAL" (D418: going below zero asks); the drag asks too (D418's fourth) — RECORD its words and the count it names.
Disproved by: a question for the Saturday alone.

---

## Suspected missing call sites and guards (one line each — the host checks each)

1. `raptor-port/src/ui/ChangesWindow.tsx` — opening the window does not call `toast.ts placeToast()` (the shell's
   windows do, `FloatWindow.tsx`); a note already up when the window opens on a phone stays at the foot over its lines — the
   backlog's exact `[BUBBLE-SMALL-SEEN]` (3) order; `toastplace.test.tsx` pins only a note raised after the window is open
   (S3-03).
2. `raptor-port/src/state/view.ts toggleDayWarn` — lets the focus go only when `WFOCUS.di` or `WFOCUS.panDi` is the
   day; `html.ts dayTraceHTML` gives the run-of-days "Breaks <day>" line (and a crew-rest trace with no `fromKey`) no
   `data-wpd`, so closing the list it was tapped in leaves the focus up — and "✕ Clear focus" is drawn only in the breach
   day's own list (S2-10).
3. `raptor-port/src/undo/describe.ts oneInputWords` — `nameOf` (`state/undo-wire.ts setDescribeNames`, PEOPLE only)
   answers null for the placeholders `allavail` / `all`, so a swap with ALL AVAIL or ALL reads "swapping allavail for
   Ranger" (S3-01).
4. `raptor-port/src/ui/rowdrag.ts` — `EDGE = 72` is fixed; the short-pane band `drag.ts tdEdge` brought in for pucks is
   not used for row, section, wave or In-time line drags; on a pane of ~190px, 144px is edge band (S1-03, S3-17).
5. `raptor-port/src/ui/rowdrag.ts onDown` / `SchedBoard.tsx` (the panel held for a caret) — nothing commits or blurs a
   caret in the block before a move: with the caret in an In-time line (as "+ In-time / Rally" leaves it), a grip drag
   reorders the stored list while the board keeps the old order on screen, and the focused line's `data-itline` position is
   stale; leaving it, `textedit.ts routeFocusOut` (the itline branch) writes its words over whichever line now has that
   position — a line lost or doubled (S1-01, S1-02). The same family exists for other board rows; the In-time lines are new
   to it.
6. `raptor-port/src/engine/publish.ts dayDiscardCount` — `relands` looks only at `ground` / `allhands` rows; an input
   filed since that lands under Unavailable (or as a Personal Inputs line) may still be counted as a discard the load does
   not make; and `drafts.ts inputsLeftSaid` says "stays on the programme" for every pending input add, wherever it stands
   (S3-08).
7. `raptor-port/src/ui/SecDefaultSnackbar.tsx` — the note is put away only when the offer opens; a note raised while the
   offer is up (an Undo inside its seven seconds) covers it again (the note's layer 540 is above the offer's 420, and
   `placeToast` does not consider the offer) (S3-05 (B)).
8. `raptor-port/src/ui/board.ts sortAllCommit` — means ONE history line under `HIST.lock`, but `reorder.ts sortInTimes`
   (and `moveInTime`) call `markEdit(key, was, now)`, and `editlog.ts logEdit` logs whatever the lock; Sort all on a day with
   unsorted In-time lines may write two lines; a drag of In-time lines writes a history line where other row drags write
   none — RECORD for consistency (S1-08).
9. `raptor-port/src/ui/pan.ts relandWeekAfterResize` — returns while an arrow's glide runs and nothing tries again after
   the glide; the glide was aimed with the old day width (S4-13).
10. `raptor-port/src/ui/histbubble.ts` / `board.ts` — in OIL Earn mode (and any read-only board) the In-time block is drawn
    without `data-intimes`, so the now-a-button changes-window line has no cell to land on there; low (S1-16).
11. `raptor-port/src/ui/changesmodel.ts` vs `engine/editlog.ts keyLabel` — the history's label is frozen when written but
    the changes window's detail reads the wave's kind as it is now; a wave switched between SC and a flying wave after a B
    edit reads "in-time" in one place and "brief" in the other; low (S3-11).

## Checked by reading, and found nothing

- No other door sorts In-time lines: `sortWave` is called only from the board's ⇅ and `sortDay` (Sort all); Edit
  Schedule's week has no sort and no ⇅ (D594 (1) holds by construction).
- The board's drag keeps an In-time line in its own wave (rowdrag's same-container rule matches day and wave).
- The sort reads the evening-before clock with the same rule as the reader (`reporting.ts reportingSortKeys` uses D503's
  test against the take-off the line speaks for, standalone guard included).
- The issued copy's In-time value is stored as a list (`engine/restore.ts`), so "To go out" receives the lists the new
  wording parses; a drag back is cleared by the epilogue's reconcile (`view.ts rawSchedEpilogue → reconcileIssuedMarks`).
- AVALON and BB lines never carry an in-time into the crew-rest pass (`events.ts`), so "in-time" cannot leak into their
  sentences.
- The week's dayswap already handles the issues box coming and going around a held caret, so S4-02 should pass — walk it
  anyway.
- The landing ring's engine answer (`LANDED_KEY`) is cleared at the start of every drop and read only for ground rows.
- `scShiftKind` now refuses a cleared time (NaN); the two other places that print an SC shift's clock need overlapping
  hours, which a blank shift cannot have.

## Words to RECORD for him (no ruling fixes them)

The Undo words after an In-time drag (S1-04, S1-11); the history lines after Sort all (S1-08); "this line & this line
clash" and "Tight turn this line→this line" (S2-04); what a tap on a removed wave's In-time change says (S1-16); the
load's note for an input under Unavailable (S3-08); what Undo rings after a ground drag (S3-14).
