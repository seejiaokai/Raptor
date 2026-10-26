# The night of 25 Oct 26 — the independent scenario designer's list

A fresh Opus helper that did not build this batch, read only. Read: the bug-check order §6, §7 (with §7.11's four
lessons), `docs/walk-scripts.md`, the full rows of D1344, D1345, D1351, D1339, D1341, D1354, D1277, D1227, D1272, D1274,
D1338, D1346, D1307, D418, the diff `140dd5cf3..HEAD` (Matrix's bubble, SelectSheet's `keepWords`, the store's `actCount` /
`filedSince` / `setRemarksOn`, RemarksSheet, ClosedNoteSheet), the drawings `docs/img/handpass/2026-10-25-lw-drawings/bubble/`
and the evidence sheet's roll-call. Code was read only to learn what exists and where; nothing was checked in the app.
**Not a finding (D56):** a problem living only in data already stored, where the code is right going forward.

## The gaps suspected most (from reading — each is a scenario below, to be proved or cleared on screen)

1. **A filing in the member's closed-day window with words typed in his bid's box** is followed by the words' own save,
   which counts as the latest act — the bubble may then say "This bid …" for an overseas duty or course (S13 case B).
2. **A long "Pick a range" on a phone into a month not drawn when the window opened**: the Available rows are compared only
   over days drawn at the opening, so a day there that turns red may raise nothing (S17).
3. **A posting out from the ⋯** lowers the manning from its date and closes a window — the bubble would read "This bid …"
   for something that is neither a bid nor a filing (S19 f). Whether a posting raises it at all is not ruled.
4. **The drag window left open while a Required P cell behind it is typed higher** (the drag window leaves the page
   working; only a man's cell closes it): closing it then may raise "This bid turns Available P red." though nothing was
   placed (S19 g).
5. **A dragged day holding two approved leaves** (a morning and an afternoon, two Inputs entries): only the first leave
   found is given the typed words (S25 e).
6. **A refused save is silent**: the drag window ignores whether an approved leave's words were saved (S27); the member's
   own-leave window passes no way to say a save was refused (break test 5).
7. **Words typed in the drag window and then ✕, Escape or a tap behind** are dropped — D1339 says "whatever is pressed";
   ✕ is a press. A question for him unless a ruling settles it (S26).
8. **An overseas duty or course reaches the war through the Inputs door** — the grid's figures may not have caught up when
   the closed window is compared, and a weekend inside the range may run more writes after the filing (S10, S12).
9. **The foot note may cover the bid just placed** — on a phone the grid scrolls the tapped day to just above the window
   (D1290), and the note then appears at the foot, where that day now sits (S6).
10. **The bubble sits over the month buttons** (seen while drawing): a tap on a month button may only dismiss it (S21).
11. **Undo of one drag-window press** may take two or three presses (the words on the bids, the words on an approved
    leave's Inputs entry, the decision — three commands, two stores) (S22, S23).

## Fixtures — made through the app's own controls, each asserted before the step that relies on it

- **Real storage for anything reloaded:** a fresh browser context, never `?fresh=1` (walk-scripts §3). Make one write
  before any reload or sign-in again (order §7.7); change role in place with `window.lwSetRole` / `window.raptorRole` where
  the fixture must stay unwritten.
- **F1 — a day at the red edge:** a weekday inside the open stretch (the drawings used Tue 15, Wed 16, Thu 17 Dec). Tap its
  Required P cell and type that day's Available P figure (28 in the drawings): one pilot's whole-day bid then takes
  Available P to 27, red. Assert the figure and its colour first.
- **F2 — already red:** F1 plus one bid. The next bid takes it lower, still red.
- **F3 — amber:** the Available P row's amber point (its own window, "+ n" over Required — D1190, D1191) set so the day
  stands in the amber band; or a counter's amber number typed (D1080) — IP's demo amber point is 3, so raise it to the
  day's IP figure and one IP pilot's bid turns IP amber.
- **F4 — Ranger's open day** (member `us`, row `bane`): a day from today inside the open stretch.
- **F5 — Ranger's closed day with his pending bid:** admin opens a stretch, Ranger bids (a run with Pick a range for some
  steps), admin closes that stretch in "Open for bidding"; assert the dimmed, locked day.
- **F6 — Ranger's approved leave:** admin places LL on Ranger's row with "Approve what I enter" on (war-approved, filled);
  a second one filed by Ranger on the Inputs page (the blue "filed on the Inputs page" edge).

**Readings, every bubble step:** `manning-bubble` (under the button) or `manning-bubble-foot` with `manning-bubble-text`
and `manning-bubble-show`; its `data-level`; the words as SEEN (walk-scripts §4 — the parts with a width); its box inside
the screen (left ≥ 0, right ≤ width, bottom ≤ the visible bottom); the element at its centre is the bubble; its fill, edge,
words and the little arrow in one colour family (red: fill `#2e1418`, edge red, words `#FFAAB0`); the Manning row's
figure and colour before and after. **On the phone every tap gets a picture within ~100 ms of the lift, pointer left
where it pressed, beside the settled one (D1281).** Sizes: phone 402 × 874 at 3×, touch; desktop 1440 × 900.

## The bubble's state table (lesson 1) — every cell a scenario or a named test

| A row on the day, before → after the press | Raised? | Colour | Words |
|---|---|---|---|
| ok → ok, lower | no | — | — |
| ok → amber | yes | amber | "turns X amber" |
| ok → red, amber → red | yes | red | "turns X red" |
| amber → amber, lower | yes (D1345) | amber | "takes X lower, still amber" |
| red → red, lower | yes (D1345) | red | "takes X lower, still red" |
| red → amber, amber → ok, unchanged | no | — | — |

Crossed with the lead word (bid / course / overseas duty / UNA; a moved bid), the place (under the button / at the foot)
and the size. `bidbubble.test.tsx` carries the words' combinations by calling the comparison and the wording directly — a
calculation, not a route; each lead word, place, colour and way in below is driven on screen at least once.

## Scenarios

**The bubble — where it is drawn, and its colour**

1. **Under the button, red, phone.** Admin, phone. F1 on Tue 15 Dec, Manning folded (a phone's start). Tap Drifter's
   15 Dec → LL (a second LL tap if the below-zero ask comes). RIGHT: the window closes; the Manning rows open by
   themselves; under the Manning button "This bid turns Available P red." in red; Available P 27 in red; the bid's box
   still in view. Reopen the bid window on that bid: its day line reads Available P 27 · red (D1296). NOT: an amber box;
   the foot note; two notes; a sideways page scroll.
2. **Under the button, desktop.** Admin, desktop, F1 on another day; the rows already open. RIGHT: as 1. Then: a click
   anywhere → gone; an arrow key → gone; Tab alone → still there (D1277's "next tap or key"; Tab is the way to Show).
3. **His report: a second and third bid on a red day (D1345).** Both sizes, after 1 / 2: Ridge's 15 Dec → LL, then
   Trident's. RIGHT: each raises "This bid takes Available P lower, still red." in red; 26, then 25. NOT: no bubble (the
   report); "turns".
4. **Amber, then lower amber, then red.** Admin, phone. F3 on Available P: a bid that turns it amber → "This bid turns
   Available P amber." amber; a second bid, still amber → "This bid takes Available P lower, still amber." amber; a third
   that crosses the red point → "This bid turns Available P red." red. NOT: red while it says amber.
5. **Mixed rows, the worst colour and the list.** Admin, desktop. F2 on Available P and F3 on IP, same day. An IP
   pilot's bid → "This bid turns IP amber and takes Available P lower, still red." — red. On a day at F1 + F3: "This bid
   turns IP amber and Available P red." — red, joined by "and". NOT: amber when any red is named; the old comma form
   "IP amber, Available P red."
6. **At the foot, phone (D1277).** Admin, phone. F1 on Wed 16 Dec. Scroll down by finger until the Manning button is off
   screen; tap a man low on the roster on 16 Dec (the grid moves that day just above the window — D1290) → LL. RIGHT: at
   the foot, the words and "Show ›", red; the note's centre hit is the note; **the bid just placed is not under it**
   (lesson 3 — measure). Tap Show › → the page goes up to the Manning rows, opened, the note gone, the keyboard on the
   Manning button. A second bid out of view → the foot note again, "takes … lower, still red". Run once in WebKit too (a
   fixed note at the foot of an iPhone screen; the smooth scroll). NOT: nothing at the foot (his report); the bubble up at
   the hidden button.
7. **At the foot, desktop and a short screen.** Admin, desktop, the page scrolled so the Manning button is out of view →
   foot note, red. Keyboard: Tab until Show is reached (RECORD how many; the note stays), Enter → up. A wheel scroll that
   brings the button back leaves the note at the foot until a click (decided once — RECORD). Then the phone on its side,
   874 × 402: the note fits, Show can be pressed.

**Each way in**

8. **Placed approved ("Approve what I enter").** Admin, both sizes, switch on, F2 day: a man → OL → filled. RIGHT: "This
   bid takes Available P lower, still red." Then on a day of a locked week where the approval keeps it pending: the window
   stays open with its note and no bubble shows; ✕ → the bubble then.
9. **The drag window's fill.** Admin, desktop and phone (hold and drag). One man, Mon 14 – Fri 18 Dec, with 15 Dec at F2
   and 16 Dec at F1 → LL. RIGHT: one bubble, "This bid turns Available P red." (a row turned on one day and lowered on
   another reads as turned). Three men on 15 Dec → one bubble naming the row once. The below-zero ask: first tap writes
   nothing, no bubble; the second places, bubble. A fill with a day skipped (a posted-out man's day) → the window stays
   with its note, no bubble; ✕ → the bubble.
10. **Overseas duty and course from the one-day window (D1351).** Admin, both sizes. F1 on Thu 17 Dec, Drifter → OD.
    RIGHT: "This overseas duty turns Available P red." red; the OD's slate box; the OD on the Inputs page. Another man,
    same day → CSE → "This course takes Available P lower, still red." NOT: "This bid …" (the old words); no bubble.
11. **UNA from the one-day window (admin).** F2 day: UNA whole day → "This UNA takes Available P lower, still red."; a
    morning UNA → lower by .5 → raised; a morning UNA beside his approved afternoon leave → whole day away → raised. Then
    a bid in the next window → "This bid …" (the latest act was the bid).
12. **Filings from the drag window.** Admin, one man and three men, a range holding a red day: CSE → "This course …"; OD
    over Thu 17 – Mon 21 Dec (a weekend inside) → still "This overseas duty …" (nothing that runs after the filing may turn
    it into "This bid"); UNA on three men → "This UNA …". One man's range with a day outside his stint → the skip note, ✕ →
    the bubble with the filing's word.
13. **The member's closed-day window (D1318, D1351).** Ranger, phone. (A) A closed day holding nothing of his, Available P
    at F1 (admin set it): tap → the closed note → OD → "This overseas duty turns Available P red." (B) F5 with a **morning**
    pending LL on a red day: type words in his bid's box, no Enter → OD (a whole day: .5 more away). RIGHT: "This overseas
    duty takes Available P lower, still red." AND the typed words on the morning bid (reopen). FAIL if "This bid". (C) F5
    with a whole-day pending LL → OD: RECORD Available P before and after; unchanged → no bubble; if it moved, the bubble
    names the OD.
14. **Move from the one-day window (D1274).** Admin, both sizes (a phone stages a Confirm). A bid on a fine Mon 14 Dec →
    Move → 15 Dec (F2) → "This bid takes Available P lower, still red." From one red day to a day that turns red → "turns"
    (the day it left getting better does not hide it). From red to a fine day → no bubble. A move refused, onto its own day
    ("already on that day"), or cancelled by an empty tap or Escape → no bubble, the reason said.
15. **Move from the drag window.** Admin, desktop: a man's three pending days → Move → land a week later onto red days →
    bubble. Ranger, phone: his own pending run, held and dragged → Move → onto a red open day → the bubble on his phone.
16. **The member's own bid.** Ranger, phone, Manning folded, F4 day at F1 → his day → LL. RIGHT: the rows open by
    themselves and the red bubble. Reload: RECORD whether the Manning rows open folded (his remembered choice — D1258) or
    open (the bubble's opening taken as his choice). Then desktop, same.
17. **A long range on a phone (suspected gap 2).** Admin, phone. F1 on a day two to three months ahead of the month on
    screen (set it, then scroll back). On today's month: a man → Pick a range up to and over that far day → LL. RIGHT: the
    bubble names Available P (D1345: every bid taking the row lower where it then stands red). FAIL if none. Desktop, same
    range: named (the control).

**Nothing raised — each with proof the press happened (walk-scripts §4)**

18. **Better or no change.** Desktop, one on the phone, figure read before and after each: (a) Refuse a pending bid on a
    red day; (b) Delete a bid on a red day; (c) LL changed to OL, same man, same half; (d) a bid that lowers a row still
    above its amber point; (e) a bid for a shown SANS man, a ground-crew man, a man posted out that day; (f) UNA or OD on a
    day he already holds approved leave; (g) the second tap on a lit Approve (back to a bid). RIGHT: no bubble in any.
19. **Changes that are not a bid.** (a) Required P typed higher so Available P turns red; (b) the Required rows' picked
    block, Apply; (c) the Available row's amber or red point changed in its window; a counter's amber number typed;
    (d) Undo of a Refuse, Redo of a bid; (e) an OD filed on the Inputs page, then back to the war; (f) **Post out** from the
    ⋯ (one-day and drag windows) on a date that turns Available P red after it — RECORD: a bubble must never say "This bid"
    for it; whether a posting raises one is a question for him; Post in → none. (g) **Lesson 4:** open the drag window on
    a man's days, then type a higher Required P in its cell behind the open window, then ✕ the drag window → RIGHT: no
    bubble (nothing was placed); FAIL on "This bid turns …". (h) Approve a refused bid back (the day's list or the drag
    window) — he counts again → RECORD the bubble's words (D1345 reads: raised, "This bid …").
20. **Every Manning counter, and a renamed row.** Admin, desktop. For each of the demo's six counters (D1312), Available P
    and Available W: one bid taking it lower where it already stands amber or red → "takes <the row's own name> lower,
    still …"; a WSO's bid names Available W. Rename Available P in its window (D1193) → the bubble uses the new name, at
    both sizes (the phone's row reads AVAIL P; the bubble the full name). NOT: a counter going lower at amber or red with
    no bubble.
21. **At a person's speed (lesson 2).** Phone. With the bubble up, tap another man's day within ~300 ms → the bubble goes,
    the window opens; place → a new bubble. A double tap (~150 ms) on a leave button → one bid, one bubble, one Undo. A
    tap on a month button the bubble covers → RECORD whether that tap is swallowed (only dismissing the bubble).

**The drag window's typed words (D1339, D1341)**

22. **On Refuse.** Admin, desktop and phone. One man, three separate entries: 1 Dec pending LL "Dentist", 2 Dec pending LL
    no words, 3 Dec pending OL "Trip". Drag 1–3 Dec → type "Family trip to KL" → Refuse. RIGHT: all three refused; each
    one's one-day window and the day's list show "Family trip to KL"; a reload keeps it. Undo: RECORD each press — what it
    takes back and the Undo's words (the house order elsewhere: the words saved first, one Undo takes the action and leaves
    them; the next takes the words — "Dentist", none, "Trip" back). NOT: a day keeping its old words; words lost.
23. **On Approve, an approved leave inside, a run reaching past the drag.** Admin, desktop. Ranger: 7–11 Dec one pending
    LL run "Old" (Pick a range); 14 Dec an approved LL "Family"; 15 Dec empty. Drag Ranger 9–14 Dec → "New words" →
    Approve. RIGHT: 7–11 Dec all read "New words" (the whole run took them, the two days outside the drag too); 9–11 Dec
    approved and filed as ONE leave with "New words" on the Inputs page; 7–8 Dec still pending, "New words"; 14 Dec's
    Inputs entry reads "New words"; 9–11 and 14 stay separate entries (D1346 — RECORD the Inputs page's entries). Reload →
    the same. Undo, press by press, as 22. NOT: 14 Dec still "Family"; 7–8 keeping "Old".
24. **On Move.** Admin, desktop: one man's two pending bids with different words → "Moved together" → Move → a week later →
    both moved bids carry the words. Type → Move → Escape (no landing) → RECORD whether the words stay on the bids
    (D1339's "whatever is pressed" reads yes) and what one Undo takes. Ranger, phone, his own drag → Move with words → kept.
25. **The box's edges.** (a) Empty box → Approve → each keeps its own words; (b) spaces only → the same; (c) two men
    dragged → no Remarks row; Approve → each man's words unchanged; (d) words equal to one day's own → the others replaced;
    (e) **a dragged day holding two approved leaves** (a war-approved morning, an Inputs-filed afternoon) → both take the
    words (D1341: every day dragged) — FAIL if only one; (f) an Inputs-filed approved leave inside → RECORD whether its
    words change (the day's list reads such words only — "change it on the Inputs page"); (g) a leave Ranger shares with
    another man on one Inputs entry → only Ranger's part changes; RECORD whether he is split off and who is told; (h) a
    dragged day holding an OD, CSE or UNA → RECORD its words after the press.
26. **Words typed, then no action (lesson 4).** Drag window, one man, pending days: type, then (a) ✕, (b) Escape, (c) a
    tap on another man's cell behind. RECORD what each day holds afterwards. (c) RIGHT: the tapped cell's window shows its
    own words; nothing typed lands on the tapped man. Whether (a) and (b) should keep the words under D1339 is a question
    for him if no ruling settles it. Then type and Delete → the bids gone, no words written anywhere else.
27. **A save that cannot be made.** An approved leave in a locked or published week inside the drag → Approve with words →
    RECORD its words on the Inputs page; if unchanged, the window must say so — FAIL if it is silent.

**His own approved leave and his closed day — the one row (D1354)**

28. **The approved-leave window.** Ranger, phone and desktop, F6's war-approved 14 Dec. Tap → RIGHT: one row — the dark
    box, "till 14 Dec 26" ticked, Document — on one line at 402, measured beside `q2-drawn-*`; no "Remarks" or "Document"
    labels, no Save, no light box. Type "At home, call me" → Enter → reopen: there; the Inputs page entry: there; the
    admin's one-day window on that day: there; reload: there. RECORD what on screen tells him it saved (lesson 3).
29. **Every save route.** Same window, each followed by reopening and the Inputs page: typed then a press on the title
    (leaving the box); typed then ✕; typed then Escape; typed then a tap outside; a picture added (saved at once, its chip
    opens the viewer — D1292) and its ✕; till unticked (the Inputs page prints no till) and ticked again; the box emptied
    then Enter (the remark gone); 200 characters (wraps and grows, all shown — D1333); 250 pasted (200 kept). On the iPhone
    engine: the keyboard's Done (leaving the box) and return (Enter).
30. **The page behind (lesson 4) and a run.** Ranger has approved 14 and 21 Dec. Open 14 Dec, type "A words", no Enter,
    tap 21 Dec on the grid behind. RIGHT: "A words" on 14 Dec only; 21 Dec's window shows its own words. A 7–9 Dec approved
    run: type on 8 Dec → 7 and 9 Dec show the same (one note for the run).
31. **The closed-day window.** Ranger, both sizes, F5 run 1–3 Dec. Tap 2 Dec → his bid line, the pending note, one row
    (dark box, "till 3 Dec 26", Document), Delete, CSE · OD; no labels on the row. Type → Enter → 1 and 3 Dec show it; the
    admin's window shows it. Typed then ✕ → saved. A document → at once. Reload → kept. A closed day with two pending
    bids (a morning LL, an afternoon OL) → two rows, each saved to its own bid. Typed then Delete → the bid gone; one Undo
    brings it back with its old words.
32. **Undo and the published week.** After the saves of 28 and 31: the top bar's Undo once per save → each takes back one,
    its words name it, the screen stays where it is (D672); Redo. A leave on a published day: type, add a document, close →
    RECORD how many changes the day's changes list shows (two saves where Save made one).
33. **The other doors to the same window.** Ranger's Inputs-filed leave (F6) → tap → RECORD: the same editable row (and
    whether that matches the day's list, which shows such words read only). The admin switched to the member view (D292)
    on his own approved leave → the same window.
34. **Two tabs (§6, a storage writer).** Two tabs of this build signed in. Tab B places a bid that turns a row red; tab A
    then opens and closes a window without placing anything. RIGHT: tab A shows no "This bid …". NOT WALKED if the war
    does not carry a change across tabs — say so.

## Break tests — one per surface

1. **The bubble under the button:** Available P renamed to 40 letters with `<b>&amp;</b>` in it, three rows named at once →
   it wraps inside 402 wide, the words shown literally, no sideways scroll; a mouse press on the bubble itself also ends
   it.
2. **The foot note:** with it up, turn the phone to its side and back, and narrow a desktop window across 700 wide → it
   stays wholly on screen or goes, never half off; Show pressed twice fast → one scroll, no error in the console.
3. **What raises it:** a fast double tap on LL, Escape at the below-zero ask, a move dropped on a refused day then on its
   own day then cancelled, the same UNA with the same words placed again → no bubble at any, no error, no stray Undo step.
4. **The drag window's words:** 300 characters pasted with a line break, `<script>alert(1)</script>` and an emoji → 200
   kept, one line, shown literally in every window and on the Inputs page, nothing runs; two men dragged → no box at all.
5. **His approved leave's window:** the leave deleted by an admin in another tab while his window is open, then typed and
   Enter → the window says it could not be saved — never silent (no refusal message is wired in today's window). Two lines
   pasted, then Enter → saved as one line.
6. **The closed-day window:** words typed, then Delete → no words left anywhere; words typed, then OD → the OD filed
   without them, the words on the bid; the admin reopening that stretch while his window is open → RECORD what the
   window then does.

## §7.11's lessons, for this change

1. A reading in one state only → the state table above; 1 (the bid window reopened), 3, 4, 28, 31 (windows reopened).
2. A gesture at one speed → 21; break test 3; the phone drags in 9 and 15 at a person's speed as well as slowly.
3. Feedback never looked for → 6 (the placed bid not under the note), 28 (what tells him a save happened with no Save).
4. A press behind an open window → 19 (g), 26 (c), 30.
