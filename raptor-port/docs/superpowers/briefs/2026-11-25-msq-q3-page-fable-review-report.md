# The guard rail's questions page, round 5 — a fresh Fable's design review and red team (chat 187, 25 Nov 26)

Brief: `2026-11-25-msq-q3-page-fable-review-brief.md`. The helper could not write its report file (the harness refused a
helper's report file, as for the q2 review), and its transcript file came back empty; the host saved its final reply
here, as delivered. Its improved page: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page-r5b.html`. Host checks
of its claims follow at the end, under "Host checks".

---

Read cold on `claude/msq-b1-screens-135`. The one repository file written: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page-r5b.html` (100 KB, untracked). Nothing committed, pushed or published; the app not started.

**How the look was run.** DEGRADED: single-context (I am the helper; the design skill's two-helper critique and its closing questions to the user do not fit a helper's run). The skill was loaded and its critique / clarify / distill lenses applied by me alone. The new page was rendered at 390 px (WebKit, dark and light) from a scratch copy: no sideways scroll, no broken picture, no control under 44 px, no script error; the reply bar, the named choices, the group B fold and the zoom were pressed. **Not verified:** the two phone films' cut (the test browser would not paint them) — the host checks D2 on the published page.

**Not read or done:** the q2 pictures of group B were not re-opened (group B is unchanged and deferred); the four films were not watched frame by frame (their sizes and one still were read); `design.md` and `ui-design.md` read whole, `design-practices.md` only §8 and by search; the plan only §1, §8, §10, §17, §19.1, §19.3, §19.7–19.11 and by search; D2610 and D2611 are not on this branch, so they were taken from the brief's wording.

## 0. Three things the host should act on first

1. **The live page's reply bar does not work.** On `page.html` as published, tapping "Differently" lights the button but the bar stays "As recommended for all." — reproduced in WebKit: `TypeError: null is not an object (evaluating 'a.getAttribute')`. Cause: `show()` walks every `.top li`, and the "Told" box's three `<li>` have no link, so it throws before it writes the reply. He cannot build a reply on the live page. Fixed in `page-r5b.html` (one guard line).
2. **Three pictures must be added to the publish map** (they exist; the old page did not use them): `drawn/e2-d-1-before.png`, `drawn/e5-d-primary-top-crop.png`, `today/k5-d-2-member-view-crop.png`. The two phone films are now addressed as `drawn/e2-p.mp4#t=0.001` and `drawn/e2-p-rm.mp4#t=0.001` (same files; the fragment makes an iPhone paint the first frame).
3. **Six recommendations are changed on the page** (E1 widened, E6, E8, D5, D8, D10), each in the "changed in review" style with its reason, its cost and a named button for the page's first recommendation. E8 and D8 touch his rulings' own words (D2270 / D2631; D2633's button words) — the page says so plainly; read those two boxes before republishing.

## 1. The recommendations I would change

**E1 — the Calendar: the settings window beside it (added; the Calendar's own rule kept).** Case: Saber, in Inputs settings → Calendar on 142, picks 149 — the page's own example. The Calendar is opened *beside* Inputs settings, which stays open (`ui/InputsSettings.tsx openDays`: "beside this window, never over it"; the same in `ui/SansSettings.tsx`; the presser saw it on the phone, where it lies *under* the Calendar). A settings window has a Save and refuses after Build 1 (plan §8.3, N13's own words). So the recommended "closes by itself" never happens in the example: he gets "Blocked: close the open window, then pick 149.", closes Inputs settings, picks again. On a phone he cannot see the window the note means. Fix on the page: recommended — a settings window with nothing changed since it opened closes by itself with the Calendar; changed and not saved it refuses, the note naming it ("Blocked: save or cancel Inputs calendar settings, then pick 149.", a draft). The same rule he gave for Admin → Users (D2598). Other choice: settings always refuses, as planned. Cost: the `inputsset` / `sansset` rows gain a changed-or-not predicate and a closer; one more note to word and draw. Rests on D2596/D2597, D2598, D754. Also added: the fifth note (a holiday no leave period covers) is marked "read from how the app is made, not yet pressed"; none of the five notes is drawn yet (D1625).

**E6 — who is told (changed).** The page: "only 149's own admins, the people who can give or end Plan of 149". Case: Saber, a master admin with 149 switched on under Show, can give and end Plan of 149 — by the page's own reason he should be told, and its wording leaves him out. Mako (150's admin, Plan of 149) plans 149's week beside Hunter and receives every other 149 admin line, but not the one saying a new planner joined. Fix: everyone who already gets 149's admin lines — its own admins, a Plan holder of it, a master admin with it switched on — never the presser. That is the plan's reading 10 as it stands (§17, §19.2), so page and plan now agree and no new audience is built (the third read's Fable 1: "the other answer needs a new audience — not a one-line switch"). Cost: Mako is told of something he cannot change. "Own admins only" kept as a named button. D2626 says "every admin of that squadron": either way a reading, so it stays a question. Hunter's home number on his name: kept. But on a bell showing several squadrons the line then carries two identical grey boxes with two meanings — "149" (whose line) first, "142" (where he is from) after the name. Not drawn; the page now says so; the drawer's list has the picture.

**E8 — the "All squadrons" tick (changed).** The page: with the tick on, Saber "sees every row whole", 142 open. Case: Saber, 149 picked, ticks All squadrons, opens Ranger (142), archives him under a bar reading 149 — exactly the fault D2625 fixes for Hunter *and Saber* (plan §19.1: "a 142 record changed under a bar reading 149, against D2191"), let back in through the tick; and D2593's "a change belongs to the squadron it was made on" then has to decide whose Undo holds it (Astra, round 3: "E8 must govern saving as well as appearance"). Second step: since D2629/D2635 every Admin → Users page already shows every squadron to a master admin — the plan itself says "the tick shows nothing the page does not already show" (§17, first clash); drawings e5 (tick on) and e4a (no tick) are the same page. Fix: recommended — the tick goes; the squadron picked stands open with whole rows, every other folded with short rows, for everyone; on his own 142 that is D2631's "his sqn mainly opened and the rest hidden"; a whole row of a 150 man is one pick away. Cost: it retires D2270's tick and D2631's "in All squadrons too" — named on the page as taking away something he ruled; Saber loses one list of everyone whole. Choices 2 (the page's) and 3 (tick kept, other rows short) have buttons. Rests on D2622, D2625, D2197, D754.

**D5 — a man of another squadron (changed).** The page: "as drawn; None stays lit" — the access line live on all sixty rows. Three faults. (a) Drawing and plan disagree and neither was put to him: plan §19.1 builds a row that is *opened* to one line "with Save and Cancel"; the drawing has no opening and no Save. D2625's summary says "Save … show only on his own squadron's page", D2629's "each row offering only his access line" — whether a press takes effect at once is a reading on both sides. Case: Kestrel scrolls sixty rows on his phone and brushes "View" on Basher — given at once with no Save, or waiting for a Save the drawing does not have. (b) The drawing offers View and a live Plan to every man: most of the sixty have no sign-in (e5t shows "no sign-in" down the list), and Plan is for admins only (D2306; today's row e4t greys it with "Plan is for admins only."). (c) Sixty lit "None" say nothing. Fix: recommended — short closed rows (callsign, 142, seat · CAT, and in words what he already holds: "views 149"); a press opens the row to the one line with Save and Cancel, as every row on the page opens; a man with no sign-in opens to "No sign-in". The guard's rule (D2598, "an opened row with a change not saved") then covers it with nothing new. Cost: one more press to give access; new closed-row words to draw. The first way kept as a named button.

**D8 — the archived callsign (changed).** The page: "Add person" greyed while the question shows, "Someone new: add him" the one way on. Case: the note appears as soon as "Jester" is typed (e6a: Seat and CAT still read "Pick…"); Kestrel presses "Someone new: add him" and nothing can be added. And the form's main button is greyed at the foot while a quieter button mid-form does the adding — two add buttons in two places (ui-design short form 4: one main button a view, in the same place). Fix: the button reads "Someone new" and only answers the question; "Add person", greyed until answered, does the adding; 142's admin's bell line goes when the man is added, not when "Someone new" is pressed (else: Someone new, then Cancel, and 142 is told "149 added a new Jester"). Also: "Ranger is already taken on 142" stands under the callsign box where the archived note stands, not as the amber note at the screen's foot. Cost: changes button words D2633 quotes (a fresh Fable's, "not yet approved by him") — said on the page; one more press. "As first drawn" kept as a button.

**D10 — the badge (changed).** The page: a press still switches to the member view. Tried (e8t): on 150 both views show the same two pages. By D2628 C7 a member's badge there also reads "· View only" (plan §19.7: the squadron decides the words, whatever the view). Case: Hunter on 150 presses the badge; nothing he can see changes, not even the badge; he is now in the member view; he picks 142 and Edit Schedule is gone. Fix: on a squadron he only views the badge is plain words, not a switch, and the ☰ menu's "Switch to the member view" is left out there. Cost: the badge is a switch on some squadrons and words on others. This answers the plan's V-Q4. "A press still switches" kept as a button.

**D12 — a small one.** "Hunter · 142" with the app's dot, not "Hunter 142" (reads as one callsign). And a third step nobody checked: the sign-off box is the browser's own list, so a signed box shows the option's words — whether the published day then carries "· 142" must be checked before the build (said on the page).

**Kept, with a consequence added:**
- **E5:** on a phone the way back cannot be reached today (☰ lies under the held window — the plan's N6 row says so, the page did not); the fault stays until Build 2 / B5.
- **E7:** the page gave "an open window or a change not saved goes with it" as today's fact — the presser pressed it only with nothing open (P4 1c). Reworded as unpressed. Added: a draft of the note ("Blocked: close the open window, then press Undo again."), where it stands, and that B7 as recommended later replaces this refusal, so the piece is built for the meantime only.
- **E4:** the lull pop-ups' "if one holds a choice" moved out of the recommendation into "still to check" — an unpressed fact.

## 2. The ones I agree with

- **E1** (the Calendar's own rule) — D2597's open half, shaped as D2598. Astra 3's holiday-sheet preview is in the page's notes.
- **E2** — as today; the plan's N7 says the refusal cannot be built without changing the Tracker's outside press.
- **E3** — the editor closes at the switch; the plan's N10 recommends the same.
- **E4** — Down days and Failures close by themselves: his own rule (D2596, D2597). The plan (N12: refused) must fold to the page.
- **E5** — a held window is given back: refusing would make Close, which drops his words, the only way on.
- **E7** — refuse this one Undo in Build 1: the one squadron change by his own press the guard would leave open (plan reading 2).
- **D1, D2, D3, D4, D7, D9** — as drawn, each against its ruling (D2599/C11; C10; D2624/C1; D2629/D2635; D2631; C5). D4 with one row to redraw.
- **D6** — the reason as words under the line. Added: which reason shows when more than one is true.
- **D11** — greyed, the reason as words. The drawing shows the opposite (a hover label): to redraw.
- **"Told", item 2** (N9 cannot happen) — the presser's k4 bears it out.
- **Group B** — not red-teamed again; nothing clashes with it beyond E7/B7 (said on the page).

## 3. The readings found on the page, and how I put them (D2611, D2610)

**E9 was ten readings in one item, no example, one button.** It is now fourteen short blocks, E9a–E9n, each with a named person and press, "I would build", and its own Differently; the list row says "take them as one, or tap any" (D2610's one list he can take whole; D2611's worked example each). The page states none can lose work.

| | Reading | Where it was |
|---|---|---|
| a | "a squadron he can still pick" = one whose Inputs page he can open (plan reading 1) | E9, no example |
| b | windows never shown singly: checked one by one (reading 3 — the plan refuses all; the page follows his rule) | E9 |
| c | a bell line closes show-only windows and ends edit modes; an ended edit mode is not put back (reading 4) | E9; second half missing |
| d | a waiting pick is dropped at any other press (reading 5) | E9 |
| e | the fade at a move at midnight; top bar's number only; none after the refresh card, which brings the sign-in screen (reading 7 and §17's C10 clash) | E9; the clash missing |
| f | Add a person: clears and stays open; Escape; "Add person and sign-in"; **a second press on the button** (reading 8; the last is mine, from Opus F-h 2 — the plan leaves it "to the drawing") | E9; two parts missing |
| g | no dots or role badge; a Plan holder on the main list; a search opens the heading (reading 9) | E9; third part missing |
| h | folding a heading over a changed row closes it as Cancel (plan V12; Astra 6, Opus F-h 1: unmarked) | **not on the page** |
| i | "more than one squadron" read by the Show buttons (reading 11) | E9 |
| j | bug reports kept; the number once there is more than one squadron; **a Plan holder rung as its admin** (reading 12) | E9; last part missing |
| k | a restore's "taken on 149" (reading 13) | E9 |
| l | a Plan the app ends by itself is told too, with its reason (reading 10's second half; `planEndedMoved`, `planEndedMember`) | **not on the page** |
| m | "Every Monday" counts only once something is pressed (the words review's case 5) | **not on the page** |
| n | a note's two halves joined; "on Squadrons" a draft (reading 6) | **not on the page** |

**Readings that stood as recommendations, now shown as choices:** D5's "None stays lit" (and the whole inline line); E6's audience; D10's press; E8.
**"What you ruled" lines checked against the full rows:** D1 (D2598, D2599, C11 — "folds shut" added), D2 (C10), D3 (D2624, C1 — "plain grey number" corrected to the app's grey number box, which is what is drawn and what the earlier Fable review specified), D4 (D2629, D2635), D5 (D2625), D6 (D2626), D7 (D2631), D8 (D2632, D2633). D9, D11 and D12 had no ruling or when line; each has one now (C5, C3, C2/C8), with who presses (D11: Saber — Hunter, View of 150, never reaches that calendar: Astra 7).
**Left, flagged:** the "other choice" lines in E3, E4, E5 are mine where the page gave none. E7's note words are my draft, marked so. D2610's "never round after round" is strained by the foot box (two finds carried from the last page "still to be put to you") — I had no pictures for them; they should come with the three new questions as the last page of this round.

## 4. The page critique, and what `page-r5b.html` changes

Heuristics (the live page, as something he answers from a phone): status 1 (the reply bar is dead) · his language 3 · control 3 · consistency 2 (group B's sections lead with the answer; E and D did not) · error prevention 2 ("Differently" cannot say *which* other answer) · recognition 2 (the cast in a fold; three sections with no "when") · efficiency 3 · minimal 2 (every row amber, so nothing is) · recovery n/a · help 3 — **21 of 36, acceptable.** Cognitive load: 3 of 8 fail (E9's wall; pictures he cannot read without zooming; who-is-who behind a fold).

Priority issues and the change made:
1. **[P0] The reply bar never changes.** Fixed (§0).
2. **[P1] Pictures unreadable at 390 px.** Ten were strips or whole screens 1,500–3,000 px wide: E7's "before" drew 17 px tall, D10's badge 17 px, E3's two 50 px, E5's two whole 3072×1720 screens; the desktop films are 1536 px wide, so the number that fades was about 2 px tall — **he could not see the one thing D2 asks him to judge.** Change: a `.cut` frame crops each on the page itself to the part the question is about (25 cuts across E3, E5, E7, D1, D6, D7, D10, D12), a tap still opening the whole picture; the films show only the corner holding the number at about real size, with a Play button in place of the browser's controls. No picture file changed.
3. **[P1] Everything highlighted.** All 21 rows wore the amber "new" ground and every heading "· new" (D2159). Change: "new" is said once at the top; amber means only "changed in review" (six rows). Group B's three old "changed in review" boxes take the normal colour, relabelled "Changed at the earlier review", words whole.
4. **[P1] E9** — §3.
5. **[P2] The answer was not where he looks.** Every E and D section now opens with its recommendation in one green line (as B's did); the other choice is the last line before the buttons. Where a question has a real second answer, a named button beside "Differently" writes it into the reply ("E8 (choice 2: keep the tick, every row whole)"); one choice a question.
6. **[P2] Who is who** — one line in the open (Saber, Hunter, Kestrel, Mako, Ranger). E3's two identical pictures gain the middle one (the member view). D7 gains the top of the list. E8 gains its two pictures (it had none — D853).
7. **Words:** "first build" was wrong for two "Told" items — the 142 man's row and bug reports are Build 1V's (plan §10) — now "the build straight after the first"; the "Mark all read" line called a fault what the presser found is the list being marked as shown (P6 A7, A8) — reworded as the question it is; "read by a fresh reviewer" (a record word, D2164) removed.

Kept: the head, the colours, the top list's shape, the zoom, group B's fold and its twelve sections word for word, every question and fact. The build script checks every picture of the old page is on the new one and every link has its section. Not changed: the page is about 43,000 px tall at 390 px (D1 and D8 hold eight and six pictures).

## 5. The drawings — keep / fix (the exact notes are also HTML comments beside each picture on the page)

**Keep:** today/k1-d-8, k1-d-9, k2-d-3, k2-d-4, k6-d-1, k6-d-2; drawn/e1t-d, e1a-p, e1b-p, e1c-d, e3-d, e3-p, e3h-d, e4t-d, e5-d-primary-open, e6a-d and e6a-p (until D8 is answered), e6c-d, e7t-d, e7-d, e8-p (until D10), e9t-d, e10-d.

**Fix — content (wrong, or against a ruling):**
1. **e4a-p** — Hunter's row (a 142 man on 149's page) shows his sign-in name "ad2", "Admin" and both dots: against D2625 and the page's own E9g. Redraw: "Hunter [142]" / "Pilot · CAT IP · also plans 149", no dots. Start **e4a-d**'s crop one row higher so the desktop shows the same row.
2. **e4b-d, e4b-p** — View and Plan live for every man, no-sign-in men and members included (D2306). If D5 is answered as recommended: closed rows "Anvil [142]" / "Pilot · CAT IP", nothing at the right; a View holder adds " · views 149"; Hunter not in this group; one row opened (a 142 admin with a sign-in): the single line "149 None · View · Plan", Save (cyan), Cancel, nothing else. New **e4b2**: a no-sign-in man opened — "No sign-in", Cancel only. New **e4b3**: a 142 member with a sign-in opened by Kestrel — Plan greyed, "Plan is for admins only." Phone twins. Keep today's two files as "the first way".
3. **e4c-d-note, e4c-d-greyed** — the reason hangs right-aligned between Basher's and Blade's rows, under men with no sign-in to whom it does not apply. Redraw on one opened row of a 142 admin, the reason on its own line directly under that row's access line, left-aligned with it, pink mark round it. Words unchanged.
4. **e9-d-greyed** — drawn as a hover label; the recommendation is words under the button. Remove the label; "150 has no SANS aircrew." as a quiet line under the greyed button, left-aligned, above "No commitments yet." Add the phone twin.
5. **e11-d-plannedby** — drawn with the grey box in an app-made list; the recommendation says plain letters. Redraw as the browser's own list: "— name —", "Kestrel", "Hunter · 142", "Saber · 142". Add the closed box after choosing ("Hunter · 142").
6. **e6b-d** — the archived rows show "no sign-in ·", both dots and "by Saber" — more than D2632 allows (seat, CAT, date) and against D2625. Each man one line in e6a's shape: "142 has an archived Ace: Pilot, CAT A, archived 25 Nov 26. If this is him, ask 142's admin"; the same for 150; then the one button.
7. **e3b-d, e3b2-d** — Kestrel's own bell showing lines signed "· Kestrel", which nobody gets of his own press; three unrelated lines under them. Redraw on a second 149 admin's bell (make Osprey an admin of 149), cropped to the two Plan lines and the list's foot, the "Sync · slow" pill out. New **e3b3-d / -p**: Saber's bell with 142, 149 and 150 on, the line "149 | Hunter [142] Wed 25 Nov / Given Plan of 149 · Kestrel" — both numbers on one line.
8. **If D8 is answered as recommended — e6a-d, e6a-p:** the button reads "Someone new"; "Add person" greyed while unanswered. New **e6a2**: after the press — "A new Jester. 142's admin is told when he is added." (my draft), "Add person" live. **e6d-d-taken**: "Ranger is already taken on 142" under the callsign box; today's picture kept as the other choice.
9. **If D10 is answered as recommended — e8-d-badge, e8-p-menu:** the badge as plain words (no button edge, the member badge's grey letters); the phone menu without "Switch to the member view", its crop extended to the whole Account block.
10. **e5-d-primary-top** — the open group's heading reads "142 · 60" in small capitals beside buttons reading "▸ 149 · 10 people": make it "142 · 60 people", no arrow. If E8 is answered as recommended: no "Filter · 1", no "Showing 73 of 73".
11. **e1b-d, e1b-p** — while the form is open, "+ Add a person" in the app's "on" look (the filter chip's), so the form visibly belongs to it.

**Fix — crop, mark, size only (the page already cuts these; make the files match):**
12. **k5-d-1, k5-d-3b** → the left 600 px; **k5-d-2** → the left 420 px.
13. **q2 p5-n6 held and after-pick** → two crops each: the bar's left 560×105 and the window 890×860 from (2170, 175).
14. **q2 p4-undoc before** → the left 640 px and the right 1082 px; **after** → the bar's left 640×130, the Squadrons panel 900×400 from (1180, 150), the passing note 420×110 from (1340, 1590).
15. **e1a-d** → 480 px from x 600; **e1d-d** → the left 780×230, **with the pink mark round the note** (it has none); **e1d-p** → the lower half.
16. **e8-d-badge, e8t** → left 640 px and right 650 px; **e8b** → the right 648 px. **e11t** → 540 px from x 580. **e10t** → the top 300 px. **e5t** → the top 460 px. **e4d** → from y 620. **e4c-d-greyed** → 916×320 from (830, 170).
17. **The four films** → cut to the number's corner (desktop 400×128 from the left; phone the top bar, 804×200), looped three times with a second's rest; a still of the phone's first frame. The fade itself unchanged.

## 6. What the page misses or states wrongly

1. **Stated wrongly (corrected on the new page):** the two "first build" lines (Build 1V's); "Mark all read" as a fault; E7's "today" for a case never pressed; D3's "plain grey number"; e3b's captions (Kestrel would not get his own lines); E1's example, which its recommendation did not actually cover (§1).
2. **Page against plan — the plan must fold once he answers:** E4 (plan N12 refuses), E5 (plan N6 refuses, and its test F4 builds on refusal), E7 (no step 6b), E9b (the plan refuses all; the Leave War is one row that "does not tell its sheets apart"), N9 (the page tells him it cannot happen; step 8 still waits on it). E6 now agrees with the plan. New for the plan from this review: E1's settings-window rule; D5 (the plan's opened row is right, the drawing was not); D10 answers V-Q4; E8 answers V-Q1 by retiring the tick; D8's bell line at the add, not at "Someone new".
3. **The three new questions (Opus F-a, F-b, security S3) — not added, as told.** What they touch: **F-a** — D1's drawn form keeps its "Home squadron" box (e1b shows "142" with a list); the page's D1 note says only that a question about that box is still to come. **F-b** — D4/D5 keep "the search still finds them" and the search box reads "Find a callsign or sign-in" in every drawing, on a page that now hides another squadron's sign-in. **S3** — D6's "never by someone who only holds Plan of it" is not the whole truth while a Plan holder can make a 149 man an admin who then gives Plan. None reverses a recommendation on the page.
4. **Names:** 150's admin is Mako on the page and in the drawer's world, Zephyr in the presser's, Petrel in the plan.
5. **Not drawn, needed before any of it is built (D1625):** E1's five notes and the settings note; E7's note; E6's line on a several-squadron bell; D5's recommended row; D8's note for an admin of both squadrons (V-Q2); D12's words for "Add" with nobody picked; the singular heading ("▸ 150 · 1 person"); "Plan of 149 ended: he moved to 150" and its kin on a bell.
6. **Seen once by the drawer, not followed up, not on the page:** 150's "+ Input" Person list offered the archived Ace and Saber — against C2 if it holds; to press before the build.
7. **Design, beyond this page:** a live callsign's refusal is an amber passing note at the screen's foot while every other refusal of one change takes the grey "Blocked:" note (the design page, §Saving) — D8 recommends moving it under the box; its colour and look left alone. The empty number place on a bell line about his own account (e3h) reads as a misalignment at first glance; it is ruled (C1), so it stays, and D3's caption now points at it.
8. **Words I drafted that need the usual second read before he approves them (D2441 — I am one Fable, not a second):** "Blocked: save or cancel Inputs calendar settings, then pick 149."; "Blocked: close the open window, then press Undo again."; "Someone new"; "A new Jester. 142's admin is told when he is added."; "views 149"; "No sign-in"; "Hunter · 142".

## Files (the helper's)

- The page: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page-r5b.html`
- In chat 187's scratchpad `fable-review\`: `build.py` with `head.html`, `top.html`, `body-e.html`, `body-d.html`, `tail.html` (the page is assembled from these; group B is lifted whole from `page.html` by line number, so re-run `python build.py <that folder> <page.html> <page-r5b.html>` after any edit); `shot.cjs` and `live.cjs` (the 390 px render and the live page's reply-bar check); `shot-*.png`; `render\` (a scratch copy with the pictures).

Rulings: none (a helper's run).

## Host checks

(filled in by the host below)
