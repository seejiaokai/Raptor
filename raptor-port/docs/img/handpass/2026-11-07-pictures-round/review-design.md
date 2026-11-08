# Pictures round: the blind design read (8 Nov 26)

A fresh reader who drew none of it read the four notes files whole and opened every question's pictures (all ~135; the
deciding ones cropped or pixel-sampled where a mark was small). Each question was checked against the brief's five tests:
(1) the "today" picture is cut to its area, ringed on the element, the problem named on the picture; (2) each option is
drawn the app's way (D1496, D1478, lesson 92, lessons 59 and 53 at an iPhone's width); (3) new words follow the writing
guide (§1, §1a, §1b); (4) one decision, a worked example naming a case, the recommendation first, earlier rulings named
(one or more full rows opened per question); (5) each before/after pair differs in the thing asked.

> ⚠️ DEGRADED: single-context (target is PNG mock-up pictures; the detector reads markup; one blind reader asked).
> The design skill's critique was applied as a lens, not run as its two-reader protocol: its heuristics (the screen
> shows its state; the words match the user's world; one thing looks one way; a pressable thing looks pressable) drove
> the findings. His rulings win where they meet.

**Ranks:** (1) misleads him or shows the wrong thing · (2) out of step with the app or its rulings · (3) polish.
A question is PASS when it has no (1) or (2); its (3)s are listed and optional.

**Result: 7 PASS, 7 need fixes, 1 stale confirmed.** Board: 1 PASS (Q2), 3 fixes (Q1, Q3, Q4). Leave War: 1 PASS (Q3),
1 fix (Q2), Q1 stale confirmed. Schedule and words: 2 PASS (Q2, Q4), 2 fixes (Q1, Q3). Tracker and marks: 3 PASS (Q1, Q2,
Q4), 1 fix (Q3).
**Worst finding:** the Leave War's "more below" cue, option B: its own pictures print the wrong count (phone "↓ 8 more"
where 9 are not in view; PC "↓ 2 more" with Havoc visibly cut, where 3 are not), and the notes state the counts
differently again. The very number the question is about is wrong on the picture.

---

## Board (`notes-board.md`)

### Q1 [BOARD-SIDEWAYS-KEYS] — needs a fix
1. **(1) The worked example says what no picture shows.** (f) ends "151 px of the list is in view, the line before and
   after included". `q-sideways-fold-keys.png` shows the cut wave heading, the column headings, an empty band and the
   one VL line (its boxes only); nothing before or after it. It cannot: each line is 189 px tall at this width (Q2's
   fault), more than the 151 px.
   **Fix:** reword (f)'s last sentence to: "With B, the title and day strip scroll away as the box rises: the bar with
   Undo and Done stays at the top, and 151 px of the list is in view: the line's boxes whole, with the empty top of its
   own 189 px line above them. The lines before and after come into view only once Q2 shortens the line (C makes it
   111 px)." Say the same in (d) B ("151 px for the list" → "151 px for the list, about one line once Q2 is fixed").
   This also ties the two questions together as the notes' head already says.
2. (3) In `q-sideways-today-keys.png` and `q-sideways-fold-keys.png` the main tag sits in the keyboard stand-in, not on
   the ringed part; the stand-in's own label carries the meaning, so either move the tag onto the ring or leave it and
   say so on the page.
3. (3) "146 px of the 402", "56 px", "151 px": give him a plain fraction beside the numbers ("over a third of the
   screen", "about one line's height").
4. (3) (a) is phrased as option B ("should the title and day strip scroll away…?"). Make it neutral: "With your phone on
   its side and the keys up, how should the board's top give the list room?"

### Q2 [BOARD-NARROW-DESKTOP-REMARKS] — PASS
Seen: today 821 / 900 / 1000 / 1100, A 821 / 1000, B 821 / 1000, C 821 / 1000. Every number on a tag matches the table;
each pair differs in the line's height and the remarks' width. D1029's full row opened: C's change to it is named.
- (3) The tag covers the wave's second header row (the row with its ✕) in every picture: lift the tag 20 px, or hang it
  below the ringed line.
- (3) C at 1000 (`q-narrow-c-1000.png`): the two seats sit about 370 px apart (two equal columns) and the line's buttons
  drift right; a working screen stays dense. For the build, not the picture: give the seats fixed widths and let the
  remarks take the rest.

### Q3 [OIL-EARN-DAY-SWITCH-WORDS] — needs a fix
1. **(2) A's switch is not the look the design guide names for a new on/off control, and the notes do not say so.**
   §4 (approved, D887): "a new on/off control takes the same look [the filter chip's 'on': a pale cyan fill, cyan words
   and a cyan edge] unless he rules otherwise". A draws the Logic page's slider. The notes name only §4's other half
   (OIL Earn's on looks stay).
   **Fix:** either (a) draw A as the chip — "No OIL this day" in the filter chip's look, plain at rest, pale cyan fill,
   cyan words and cyan edge when on — in `q-oilswitch-a-off/on-desk/phone.png`, or (b) keep the slider and add to (d) A:
   "a departure from §4's line that a new on/off control takes the filter chip's look (D887): the Logic page's slider is
   used because …, your call". (a) is the guide's own default; recommend it unless the slider has a reason.
2. **(2) B's pressed words are not shown to fit his iPhone.** "Let this day earn again" (167 px) on the phone bar leaves
   about 2–3 px either side in `q-oilswitch-b-on-phone.png`, and the drawing used the test browser's letters. Lesson 59
   (D1387) asks for every state a button changes to, at a phone's width with an iPhone's wider letters; lesson 53 for
   the row staying one line. **Fix:** redraw B pressed on the phone with every letter a seventh wider (as the marks
   helper did for `q-r5e-ph-drawn-wide.png`), measure the room left, and put the number in (d) B; if it breaks, say so.
3. (3) A's words touch the ring's right edge on the desktop picture; A is also not drawn wide (about 40 px spare); say
   the spare room in (d).
4. (3) The on-note A keeps, "… The marks underneath are kept — turn it off and they come back.", joins with a dash
   (§1b test 2). If it is a ruled wording, list the guide's wording beside it for him: "… The marks underneath are kept.
   Turn it off and they come back."
5. (3) A's hover keeps only "covers anything added later too", a phrase with no subject (§1a test 4). See the wording
   list, item W2.

### Q4 [OIL-INERT-TAP-SILENT] — needs a fix
1. **(1) The worked example contradicts (b).** (f): "the reason is only in the ALL AVAIL window's foot". (b) and
   `q-inert-today-desk.png` say the reason shows only as a hover on his puck on a PC; Fable is a named man, not a row
   in the ALL AVAIL window. **Fix:** "Today he lights blue and nothing says why; the reason shows only when a mouse
   rests on his puck on a PC, so on your phone you never see it."
2. **(2) The new note joins with a dash.** A: "Fable: no OIL worked out — this row has no end time"; B: "Blocked: no OIL
   worked out — this row has no end time". D360's full row gives his words "in substance", so the wording is open.
   **Fix:** draw and propose, beside the kept words, the guide's form: A "Fable earns no OIL here: this row has no end
   time."; B "Blocked: this row has no end time, so no OIL is worked out." Say on the page which you recommend.
   (The drawing already turns the hover's first dash into a colon; the second dash stays.)
3. (3) The empty end-time box is ringed but has no tag; tag it "No end time".

---

## Leave War (`notes-lw.md`)

### Q1 [LW-TWO-BOX-LETTERS] — stale, confirmed
All four "today" pictures (`q-twobox-ph-today.png`, `-x4`, `q-twobox-pc-today.png`, `-x4`) show LL, CSE, CCL and FO
whole, turned on their side, every letter in. D1727's full row opened. Nothing to put to him.

### Q2 [LW-MORE-BELOW-CUE] — needs a fix
1. **(1) B's pictures print the wrong count.** The script's own measures (`q-lw-measured.json`) say:
   phone B at the top, 10 whole, 1 cut, 8 below: not wholly in view = 9, but `q-morebelow-ph-B-top.png` reads
   "↓ 8 more"; PC B at the top, 16 whole, 1 cut, 2 below = 3, but `q-morebelow-pc-B-top.png` reads "↓ 2 more" with
   Havoc's line visibly cut at the foot. A's and B's mid pictures are right. The notes then say the phone B reads 9
   (not what the picture shows) and that PC "A and B read ↓ 2 more" (B should be 3).
   **Fix, step by step:** (a) in `pr-lw.mjs`, count B's cue after B's taller button is in place, with A's rule (cut +
   below); (b) re-shoot `q-morebelow-ph-B-top.png` ("↓ 9 more") and `q-morebelow-pc-B-top.png` ("↓ 3 more"); (c) add a
   check in the script that the printed number equals cut + below and fail otherwise; (d) correct (c) of the notes: phone
   A 8, B 9; PC A 2, B 3.
2. **(2) A is tappable but drawn as plain grey words.** Lesson 27 (D1185): something that acts when tapped looks
   tappable. The tap is the agent's reading in D1295's full row, not his words. The notes count "plainly pressable" as
   B's merit but do not name lesson 27 against A.
   **Fix:** in (d) A, name it: "A's grey line can be tapped, which lesson 27 says should look tappable." And give him the
   honest pair: A as drawn without the tap (it only says how many, as the bell does today; nothing to look pressable),
   or B (pressable, looks it). Keep the bell in step with whichever he picks.
3. (3) `q-morebelow-ph-inputsday-today.png`: the ring shows only along the top edge; ring the whole window.
4. (3) On the end pictures (`-ph-A-end`, `-ph-B-end`, `-pc-A-end`, …) the tag covers the first line in view; hang it
   in the window's title bar instead.

### Q3 [LW-FROZEN-BAR-GAP] — PASS
Desktop and phone frames are ringed and tagged; D991 and D1518 (full row and line) opened; the options are honest about
the speed risk.
- (3) `q-blink-desk-old-2026-09-23.png` has no ring and no tag, and shows the old name and a member's view. Tag it
  "23 Sep 26, before the rename: frame 1 has no dates row" or leave it off his page.
- (3) The phone frames are small at his phone's width; crop each frame to the dates row and the top bar.
- (3) Words for him: "16.7 ms", "1/60 of a second", "17 to 33 thousandths of a second" → "one or two blinks of a
  frame, under a twentieth of a second".

---

## Schedule and words (`notes-sched.md`)

### Q1 [SCHED-UNAV-PENDING-MARK] — needs a fix
Drawing checked: the board's A keeps the LL box's purple tint (pixel-sampled, the same in both), and the Ground row's
teal tint is the "promoted from an input" look, not the pending mark, so A adds exactly the one mark. D45 full row opened.
1. **(1) On the week and the phone the mark cannot be seen at the picture's size.** The dotted underline under "LL" is
   about two letters wide and faint (`q-unavmark-pc-unav-A.png`, `q-unavmark-ph-unav-A.png`); beside the "today"
   pictures the pair looks the same on his phone, and the ring is a wide empty box round the cell.
   **Fix:** (a) ring tightly round "LL" alone; (b) add one enlarged crop per size, before and after side by side, of the
   LL cell only (deviceScaleFactor 4, or the 2× picture cut to about 120 × 60 px), tagged "Enlarged: the dotted line under
   LL"; (c) in (d) or (e), say plainly that on a two-letter name the mark is small, so he judges it at its real size.
2. (3) The tags cover the column headings (TIME, PEOPLE); hang them below the ring.

### Q2 [READONLY-WEEK-WORDS] — PASS
Seen: all seven pictures. The refusal is drawn in the grey "Blocked" look as D1667–D1669 have it; D837 full row opened;
the notes are right that D837 changed only the refusal.
- (3) Notice, second sentence, "It is kept as it was saved.": "It" stands for "this week's saved copy" (§1a test 5,
  never trade a name for "it", and here "it" could be the week). Proposed: "The saved copy is kept as it was."
- (3) "Report it on the Help page.": name the control he will find there: "Report it with "Report a problem" on the Help
  page." (the Help page's heading is "Report a problem").
- (3) `q-readonly-ph-notice*.png` cut through the top bar (half of TALON shows); start the crop under the bar.
- (3) The drawn refusal uses a curled apostrophe ("can’t"), the notes and the notice a straight one; pick one for the
  build, as the app's other notes do.

### Q3 [LOGIC-WORDS-WORKHOURS] — needs a fix
D1032 and D592 full rows opened: A carries out D1032 as the notes say.
1. **(2) A's Insights picture redraws only Saint and Echo.** The notes say any other line with nothing entered "would
   move the same way" and were not counted, so every other man's number in `q-logic-pc-insights-A.png` may be wrong,
   and the picture understates A's cost, which is the one thing he must weigh.
   **Fix:** make A's picture true by the notes' own measure (typing the suggested time adds exactly A's 2 hours): type
   the faint suggested time into every empty R box of the demo week (nothing saved), then picture Insights; ring every
   man who moved and tag "Drawn A: every line with nothing entered starts at the default rally: N men move, +2h a
   flying day". If that cannot be done tonight, tag the present picture "Only Saint and Echo redrawn; every man on a line
   with nothing entered moves too".
2. (3) On the PC pictures (`q-logic-pc-today.png`, `q-logic-pc-B.png`) the ring cuts through the row's heading
   ("Default rally before take-off", "Step before take-off"); ring the whole row or start the ring under the heading.
   The phone pictures are right.
3. (3) B is two sentences in two rows saying the same thing (D726: a screen is not wordy). Offer B with the rally row's
   sentence alone; the step row's addition only if he wants both.
4. (3) B's picture does not show which words changed (§1a test 8, show the change). Underline the new words, or put
   today's and B's sentence one above the other on the page.
5. (3) `q-logic-pc-insights.png`'s tag sits on the list's heading; Echo, whom A also moves, is not ringed in "today".

### Q4 [INP-ADD-RIGHT] — PASS
Seen: all eight pictures. A copies the Medical tab exactly; D1300, D1137, D729 and D1188 full rows opened; every one A
touches is named.
- (3) `q-addright-pc-listopen-A.png`: with the list pulled in, the Remarks column narrows to about 190 px and remarks
  wrap to two lines (Vector, Wisp, Cobra, Nomad), while Name and Start keep wide empty columns. Name it in (d) A as a
  cost, and for the build let Name and Start give up room before Remarks does.
- (3) `q-addright-pc-medopen.png`: the tag "The cards make room for the window" sits inside the window, on its Person
  box; move it onto the cards' ring.
- (3) `q-addright-pc-med.png`'s tag says "(his D1300)"; on his page say "(as you ruled)".

---

## Tracker and marks (`notes-marks.md`)

### Q1 [TRK-ROUND-SEEN] (2) the marking pop-up — PASS
Seen: all four. Today's covering is plain; A and B are drawn honestly, B's cut-off foot visible. D1290 and D984 full rows
opened. The build notes (the window's top 2–3 px over the ball) are a good catch.
- (3) The phone "today" tag stands on the chart beside the window, not on it; fine as it is, or hang it from the ring.

### Q2 [TRK-ROUND-SEEN] (3) Find's ✕ — PASS
Seen: all four. D1127's full row opened: its reading (2), the ✕ stays, holds in every option.
- (3) `q-trkfind-ph-open.png` and `-after-x.png` look nearly the same: that is the point (✕ changes nothing), and the
  tag says so; the keyboard coming back cannot be shown, which the notes say.

### Q3 [UI-CONSISTENCY-LOOK] round 5 (a)–(d) — needs a fix
D1700, D1703 and D1705 full rows opened.
1. **(1) (a) The "today" pictures do not show the problem.** The test browser draws 👁 as a grey filled eye (it has
   text presentation without its emoji selector), so `q-r5a-*-week.png` / `-board*.png` and their `-drawn` pairs differ
   only between a filled grey eye and an outline grey eye. What he sees on his iPhone, a coloured emoji, is in no picture.
   **Fix:** re-shoot the four "today" pictures with the eye drawn as a colour emoji, by adding the emoji selector
   (👁 followed by U+FE0F) or setting the font to Segoe UI Emoji on that one span, and tag them "Typed 👁: drawn in colour
   on a phone (your iPhone draws its own colour eye)". Or ask him to open Monday's Original on his phone and compare.
2. **(2) (b) The words do not match the drawing.** (d) A says "four arrows out and four arrows in"; `q-r5b-*-drawn.png`
   draw two arrows each (out to opposite corners; in from them). **Fix:** "two arrows pointing out" / "two arrows
   pointing in", in the notes and on his page.
3. **(2) (d) A is judged without naming D1700, the ruling it comes nearest.** D1700: "any new mark a person could mistake
   for another on its bar or page is redrawn before it is built"; its full row adds the agent's reading, told to him,
   that the Reset arrow is History's arrow without the clock and "kept unless he says otherwise". A puts that arrow in
   the warning list on the same page as History's clock; the notes cite lesson 92 under B only and say A "changes no
   ruling". **Fix:** (i) in (d) A, name D1700 and its reading, and say A relies on it; (ii) give him one picture with
   History's clock (from `q-r5d-ph-board-history.png`) and the drawn Reset arrow (from `q-r5d-ph-board-drawn.png`) side by
   side at the same scale, tagged "History · Flag this again (drawn)", so he can judge the look-alike at a glance on his
   phone.
4. (3) The drawn r5d tag reads "Drawn: ↺ the Reset arrow, ✕ stays": the typed ↺ in the tag looks like the mark itself.
   Say "Drawn: the hidden line's arrow becomes the Reset arrow; ✕ stays".
5. (3) r5a and r5d tags cover the issue count ("6 warning", "16 issues · 5"); hang them elsewhere.

### Q4 [UI-CONSISTENCY-LOOK] round 5 (e) the phone day bar — PASS
Seen: all four, the wide-letter drawing included; one row with room (lesson 53 measured). D1703 and D1704 named.

---

## Every new wording, with its verdict

Rulings-bound words are marked; the guide's form is given beside any that break §1b.

| # | Where | Words | Verdict |
|---|---|---|---|
| W1 | Board Q3 A: the switch's label | "No OIL this day" | Keep. Says what on does (§1, lesson 66). |
| W2 | Board Q3 A: the switch's hover | "covers anything added later too" | Reword: no subject (§1a test 4). "Also covers anything added to this day later." |
| W3 | Board Q3 B: button at rest | "Stop OIL for this day" | Keep. Starts with its verb. |
| W4 | Board Q3 B: button pressed | "Let this day earn again" | Keep the words; its fit on his phone is unproven (Q3 fix 2). |
| W5 | Board Q3 B: note under the bar | "Nothing on this day earns OIL. The marks underneath are kept and come back when you let the day earn again." | Keep. No dash; facts first. |
| W6 | Board Q3 B: note after tapping a man | "Nothing on this day earns. Let the day earn again first." | Keep. Changes D845 (his own words); the notes say so. |
| W7 | Board Q4 A: passing note | "Fable: no OIL worked out — this row has no end time" | Reword: dash join (§1b test 2); D360 is "in substance". "Fable earns no OIL here: this row has no end time." |
| W8 | Board Q4 A: the other reason | "Fable: nothing measurable to earn from here" | Reword: "nothing measurable" and "from here" are vague. "Fable earns no OIL here: this row has no times to measure." |
| W9 | Board Q4 B: grey refusal | "Blocked: no OIL worked out — this row has no end time" | Reword if B: dash join. "Blocked: this row has no end time, so no OIL is worked out." |
| W10 | Leave War Q2: foot of a long day list | "↓ 8 more" | Keep. His D1295 words. |
| W11 | Schedule Q2 A: notice on each day | "This week's saved copy could not be read, so it can't be shown here. It is kept as it was saved. Report it on the Help page." | Light reword: "…The saved copy is kept as it was. Report it with "Report a problem" on the Help page." |
| W12 | Schedule Q2 B: notice on each day | "This week's saved copy could not be read, so it can't be shown here. It is kept as it was saved." | Light reword as W11's second sentence. |
| W13 | Schedule Q2: refusal | "Blocked: this week's saved copy could not be read, so it can't be edited. Nothing was saved." | Keep. D1669's form. |
| W14 | Schedule Q2: older-version refusal | "Blocked: this week was published by an older version of the app, so it can't be edited. Nothing was saved." | Keep. D1669's form. |
| W15 | Schedule Q3 B: Logic, default rally row | "An empty R box suggests take-off less this time, and "+ In-time" fills in the same time. With no in-time or rally entered, a flyer's OIL counts from here. His long day and Insights hours count from step. It also sets when the tight crew-rest advisory shows." | Keep. "from step" is the page's own way ("busy from step"); show the change (Q3 fix 4). |
| W16 | Schedule Q3 B: Logic, step row's added sentence | "With no in-time or rally entered, a flyer's long day and Insights hours count from it too." | Keep the words; offer B without it (D726, Q3 fix 3). |
| W17 | Marks Q2 A: the ✕'s hover on a phone | "Clear the search and close Find" | Keep. Verb first, says both acts. |
| W18 | Marks Q2 B: the ✕'s hover once the box is empty | "Close Find" | Keep. |

Not app words, so not listed: the Leave War stale item's page line ("Already fixed: …"), and every picture's tag.
The cold-read list is `words-for-cold-read.md`, the eighteen above as drawn, nothing else.
