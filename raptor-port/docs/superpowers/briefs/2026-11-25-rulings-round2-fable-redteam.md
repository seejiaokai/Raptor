# The round-2 rulings page: a fresh Fable's red team, design look and improved page (25 Nov 26)

A fresh, blind Fable reader, on his word ("review the artifact … what do u think makes more sense and feel free to
improve it, red team it and suggest. including using /impeccable for design improvement. user interface"). Read: the
page `raptor-port/docs/mock/2026-11-25-rulings-round2/index.html` and its pictures; the drawing work
`raptor-port/docs/mock/2026-11-25-guardrail-wording/`; `HANDOFF.md` (this branch's block); the scheduler, OIL and design
pages; the full rows D2046, D2053, D1990, D2055, D2072, D2073, D2080, D360, D782, D2294, D2611–D2615, D2001, D2018; the
design guide §4, §8 and the lessons list; app code by slice. The design skill (impeccable, critique) was loaded; its
setup asked for an app to be picked, so it ran on the guide's rules with his rulings winning. Nothing committed or
pushed. `index.html` is untouched.

## 1. Verdict

- The content is sound and honest about what his words do and do not settle. I disagree with no recommendation outright.
  Three things are missing that he will meet in real life, and one fact is wrong.
- **The biggest gap: the end-time rule was only ever shown to him on a flight and a duty desk.** The demo week as it
  ships has seven programme and ground rows with a start and no end (DINNER WITH CMD 18:30, MASS DEBRIEF + BEER CALL
  17:00, …), on four of its five working days. Under the rule none of those days can be signed. Whether "every item"
  meant a dinner is a reading, never put to him — the exact lapse this job exists to fix. Now question H, with a picture.
- **The refusal is designed as a passing note at the foot of the screen, after the press.** On a phone the scheduler
  then hunts a long day for thin red boxes. The better design says it on the sign-off panel before anything is pressed,
  and takes him to the box. Now question G, drawn at both sizes.
- **Four pictures showed words that are not the words to be built** (the sign-off note, F2, F5, F6), each excused in its
  caption. "As drawn" cannot be answered on a drawing that differs. All four are redrawn.
- The page put the oldest things first and kept an "Answered" block; his rule is newest first, answered ones off the
  page. Reordered, letters kept.

## 2. Item by item

**Agree as written:** small points 1–19 (see the note on 1 and 12 below); A; C's three parts; D's recommendation; E2,
E3, E4, E5, E6, E7, E8, E9, E10; F1, F2, F3, F4, F6.

| Item | Problem | The real-life case | My recommendation | Ruling touched |
|---|---|---|---|---|
| **C** (scope) | The rule as recorded lists "a ground or programme row, an ALL AVAIL row"; his words were "every item". He was shown a flight and a desk only. The page's "What stays as you ruled" box never names these rows. | Demo week, untouched: Mon — OPS SHARING + NAV SYS BRIEF 17:55, DINNER WITH CMD 18:30, CMD ENGAGEMENT @ CREW ROOM (ALL) 21:30; Tue — OPS BRIEFER / EP SUP 05:00, FLY W EXT SQN 08:45; Wed — NAV-SYS TRIAL PREP 14:00; Fri — MASS DEBRIEF + BEER CALL 17:00. Seven rows; Mon, Tue, Wed, Fri blocked. (Read from the running app's own week: `…/img/fable/facts-fable.json`.) | Put it to him as its own question (**H**). My recommendation there: yes, every row — one rule; a typed end is the scheduler's, an assumed hour is the app's invention, which is what the rule set out to stop. It differs from D only because in D the app already knows the end. | D2612 (the list in its rule is the agent's), D2611, D360 |
| **C** (where the refusal speaks) | A grey note at the foot, after the press, gone in seconds. "Each outlined in red" — but on a phone one box is on screen (see `fable-c4-sign-refused-phone.png`, the whole screen). Feedback belongs on the screen first; a note only for what the screen does not show. | Saber on his phone, Saturday done, two ends missed far down the day. He picks Ace, the box snaps back, a note flashes, he scrolls the day looking for a 1px outline. | Question **G**: the line that says "4 to sign" says "2 end times missing · 4 to sign", red, always there, beside Publish; a tap goes to the first empty box, the next tap to the next. The "Blocked:" notes stay for a refused press. | D850 (feedback in the screen), lesson 77 (where the hand is), lesson 46 (a tap goes to what is out of view), D2612 ("Publish says how many") |
| **C** (four words differ from the drawing) | The sign-off picture read "Type their ends, then sign."; captions told him to ignore the picture. | He answers "C as drawn" — to which words? | Redrawn with the words to build. Done. | D1625, D1478 |
| **C** (the pink tag) | The numbered tag sat on the take-off / START time — the one fact that makes the box red. | He cannot see "12:45" beside the empty landing. | Redrawn, label beside the box. Done. | D1222 (lesson 32) |
| **D** (a fact) | "The app already gives both rows their length from the Logic page's settings" is half wrong. | — | The BRIEF row ends when the BOX row starts (no setting); only the DEBRIEF takes the Logic page's "AMT debrief" length. Corrected on the new page; it makes the recommendation stronger. Read in the engine's sim-window code. | D2611 (no fact unchecked, D2140) |
| **E1** | "It is the only way Publish can say it" is true only without G. Checked: a change to a signed draft day does clear its shown sign-offs, so Publish does grey again — the page's claim holds as built. A button that looks dead but answers a press is a weak pattern on its own. | — | Keep E1 as recommended, but G makes it secondary: the count is already beside the button. Said on the page. | D2612 |
| **E5** | An amendment is not a small point in real life: a member's late input with a start and no end on a published day would block "Publish AL1" until the scheduler finishes the member's input. | Could not check whether the Inputs page lets an input be saved with a start and no end. | Left as E5; the open fact is named inside H and in §6 below. | D178, D739 |
| **New — E11** | The red outline is a new mark and the Legend names every mark. Nobody asked. | A new scheduler sees a red box and has nowhere to look it up. | One Legend line, drawn before it is built. Added as E11. | D876 (a new kind of mark), D2078 |
| **New — E12** | D2613 (red from the moment the start is typed) was ruled without his own D2072 worry beside it (a sign that pops up before END is typed "would irritate"). | Every new line: the landing box is red for the seconds between take-off and landing. | Leave as he ruled — it reads as "this one next" — but tell him. Added as E12. | D2613, D2072 |
| **F5** | "It returns only if the man or either item is a different one" takes two readings; it states the exception, not the surprise. | A scheduler hides a conflict, moves the sim by an hour, and expects it back. | Offer the plainer line beside it, drawn: "…It stays hidden while the same man is on the same two items, even if their times change." Three lines on his iPhone against two. Recommended; his to pick ("F5 plainer"). A cold read is still owed on whichever he picks. | D2001, D2018, D836 |
| **B** | Both choices mark Ranger LATE for a deadline that did not exist when he filed. The page frames it as "published or not"; the real question is whether a new cut-off reaches back at all. Also "View-only Sched was not looked at" — that is the face members read, the heart of the question. | Ranger files on 25 Jun, on time by the rule of the day; in July the cut-off is raised and he reads LATE. | A third choice added: judged by the cut-off that stood when filed or last changed. I did not replace the page's recommendation; a "second read" box says which is fair if LATE is a record, and what it costs (a saved-data change — the largest). His to say what LATE is for. View-only must be looked at before either build. | D742, D1621, D45 |
| **A** | Sound. One thing he will ask that the page does not answer: after Save, how does the scheduler answer the two rows left, before publishing? (The page says only that the note names them afterwards.) | — | Not changed; the host should add one sentence once it has checked the app. | D2294 |
| **Small points 1, 12** | Both now say "only while a day is being drafted, since a day with a missing end can no longer be published". That is true only if H is answered "every row" (and E5 for amendments). | — | If he picks another choice on H, reword 1 and 12. | D2612 |
| **Record words** | "was not walked", "in this walk" on a page for him. | — | Changed to "not tried in the running app" / "was not looked at". | D2164 |

**A reading dressed as his rule — what I looked for (D2611):** the page is careful ("This is a recommendation, not
something your words settle" on A, B, D). The two I found are the scope of "every item" (H) and C's rec box saying "What
stays as you ruled … A row with no times at all is not touched" — that last is the agent's reading told to him in the
D2612 answer, which the row says; acceptable, but it is not his words.

## 3. Design findings (the design skill's critique, his rulings winning)

What was looked at: the red outline (phone, desktop; Edit Schedule's week), the refused sign-off and Publish notes
(phone, desktop), the greyed Publish day, the six sentences on a phone, and the page at 402 wide. Not looked at: the
Scheduler Board's outline (pictures exist in the drawing folder, not on the page), View-only Sched, a keyboard pass, a
screen reader, the dark theme of the page.

**It misleads or hides how to recover**
1. *Edit Schedule, signing a day on a phone.* The reason for a refusal shows only after the press, at the far end of the
   screen from the box, for a few seconds; the red boxes it points to are off screen. Fix: G (the line on the panel, the
   tap to the box).
2. *Edit Schedule, the greyed "Publish day" on a phone (as built today).* It gives no reason at all — a phone has no
   hover. The status line "4 to sign" is the only clue. G mends it for end times; the wider fault is as built and is
   worth a backlog line.
3. *The red outline is colour alone.* Thin (1px), on a small box, red on dark. The grey dash inside is the same dash an
   SC line's empty R/B box shows to mean "normally left blank". A colour-blind scheduler has only the count to go by —
   another reason for G's words. No change proposed to the outline itself: it is his own design.

**Inconsistent**
4. *Red on a time box now means two things.* Today a 2px red edge on a take-off / landing pair means "the warning you
   tapped is about these times"; the new 1px red edge means "end time missing". Different weight, same colour, same
   boxes. Acceptable (both say "look here"), but it wants its Legend line — E11.
5. *The count in the note depends on D* (4 or 2). The pictures now show both and say why.

**Polish**
6. The note's singular form exists in the words file and not on the page ("1 item has no end time, outlined in red.").
   Fine; build from the words file.

**The page itself, on his phone**
7. Oldest first; his rule is newest first (D1237, D1363). Fixed: C, G, D, H, E, F, then A, B, the nineteen.
8. An "Answered this morning" block stood second on the page; answered ones leave the page. Now one folded line at the
   foot (kept, because points 5 and 9 refer to those answers).
9. The opening paragraph was three long sentences before the list. Cut.
10. Nineteen points with four "change" ones scattered among fifteen "leave". A line now names the five that change
    something (2, 9, 11, 16, 17 — the page's amber).
11. Every item from C to F wore "New", so nothing stood out. Kept (D2159: all are new since round 1); the second read's
    additions wear "Added" instead.
12. No ruling numbers or review codes in the text: clean (checked by search). "walk" as a record word: fixed.

**Considered and left:** making the outline thicker or adding a word in the box (his design; a picture would be needed);
moving the "Blocked:" note up to the sign-off box (the grey note is one look app-wide, D1667); greying the four sign-off
boxes instead of refusing after the pick (it would hide the names list and say nothing more than G's line does);
collapsing the nineteen points (he must still read them once).

**Delete candidates:** none on the surfaces looked at.

## 4. New questions for him (each is on the improved page in the question shape)

- **G — the sign-off panel says what is missing, and takes you to it.** When: every time a day is signed with an end
  missed; on a phone, most of the time. Example: Saber, Saturday, VL's landing and SXO's END. Recommended: yes, with the
  tap. Cost: a few words on the sign-off line; a small build; the tap is not drawn.
- **H — programme and ground rows with only a start.** When: any dinner, beer call, visit; seven rows on the demo week.
  Example: Monday's three. Recommended: yes, every row, one rule. Cost: an end typed on each before signing; a
  templated row keeps its end.
- **E11 — a Legend line for the red box.** Recommended: yes, drawn first.
- **E12 — red while he is still typing the line.** Recommended: leave as he ruled; told so he can weigh it against his
  16 Nov answer.
- **B, third choice — a new cut-off reaches only inputs filed after it.** Offered, not recommended over the page's
  answer; cost and the deciding question ("is LATE a record or a planning aid?") stated.
- **F5 plainer** — a wording choice, drawn.

## 5. What changed in `index-fable.html`, and the pictures added

`raptor-port/docs/mock/2026-11-25-rulings-round2/index-fable.html`, built by a script from `index.html` (every existing
question, letter and number kept, so "C as drawn", "E3", "F2", "A as recommended" still work):

- Order: C, G, D, H, E, F, A, B, the nineteen, waiting, answered (folded). The top list follows it; the reply line lists
  every letter.
- C: the outline pictures replaced (the start time readable); the sign-off pictures replaced with the words to build,
  phone whole-screen and desktop; a sentence on why G follows.
- G and H added as full questions with pictures. E11 and E12 added to the list (now twelve points).
- D: the fact about the BRIEF and DEBRIEF rows corrected.
- F2, F5, F6: pictures now show the words to build, captions shortened; F5 carries the plainer wording and its picture.
- B: the third choice and a "second read" box; the View-only sentence says it must be looked at.
- Small points: the line naming the five that change something. Record words removed.

Pictures (source `raptor-port/docs/mock/2026-11-25-guardrail-wording/img/fable/`, copied beside the page as
`img/fable-*.png`): `fb-c1-landing-{phone,desktop}`, `fb-c2-desk-{phone,desktop}`, `fb-c3-status-line-{phone,desktop}`
(G), `fb-c4-sign-refused-{phone,desktop}`, `fb-f2-oil-card-{phone,desktop}`, `fb-f5-note-{phone,desktop}`,
`fb-f5-alt-note-{phone,desktop}`, `fb-f6-logic-line-{phone,desktop}`, `fb-h-monday-programme-{phone,desktop}` (H), and
what each run read off the screen, `facts-fable.json`, `facts-fable-h.json`. Scripts, on the existing kit:
`draw-fable.mjs`, `draw-fable-h.mjs` in the drawing folder. Each proposed frame changes only words of an element the app
drew or adds the earlier drawings' one red-edge class.

How they were drawn: this worktree's existing build (made 24 Nov 10:29, a few hours older than the branch's last app
change — the SANS work, not the screens drawn), served locally on port 4791 with the checks lock free, on the earlier
helper's staged Saturday; the server stopped by its port afterwards. Nothing was built.

For publishing: the new page needs the same `img/` files map plus the thirteen `img/fable-*.png`.

## 6. What I could not check

- Whether the Inputs page lets a member save an input with a start and no end (it decides how often H and E5 bite).
- A landing typed "TBD" (E3): typing TBD into the landing box in the drawing run left the box empty, so it is not drawn,
  and I do not know how a TBD landing is entered today.
- View-only Sched after a cut-off change (B); the Scheduler Board's outline on the page; the tap of G (not drawn).
- How the two unanswered OIL rows of question A are answered before publishing.
- The information-only case of F6 in the running app (the code agrees: such a row is skipped by the checks and by "who
  is free").
- The page in its dark theme and with a keyboard; a cold read of the new G line, the plainer F5 and the E11 Legend
  words (owed before any is built).
- Whether the build drawn on matches `main` exactly (see §5).
