# Pictures round, group "sched" — four questions (drawn 8 Nov 26 on `main` at `6e6c55667`, served on port 4291)

Script `raptor-port/scripts/handpass/pr-sched.mjs` (run `PR_ONLY=q1,q2,q3,q4`); measures `q-sched-measured.json` in this
folder. Clock held at Mon 13 Jul 26 09:00; signed in as Saber (admin). Every picture is 2x; "real" is the app as it is
today with only an amber ring and tag added; "drawn" is a change made on the running page (nothing saved) and tagged
"Drawn: …". Every PNG below was opened and looked at.

---

## Q1 [SCHED-UNAV-PENDING-MARK] — the "waiting" mark on an Unavailable row

**(a) The question.** When someone files leave (or anything that lands under Unavailable) on a day that is already
published, should its row on the Unavailable list wear the same dotted "waiting to go out" mark that a Ground Programme
row filed the same way wears?

**(b) Still open — yes, measured today.** Wed 15 Jul published, then two inputs filed on it: LL for Bolt and a Meeting for
Saint ("Safety brief"). The day reads "2 pending". On Edit Schedule's week the Meeting's name on the Ground Programme is
underlined in dotted cyan (the AL1 colour, 59,198,232 — the mark every changed text box wears on a published day); the LL
row's name on the Unavailable list has no mark at all (no underline, no marker of any kind). On the Scheduler Board the
Meeting's name box has a dotted cyan outline; the LL row has none. On the phone the same: the Ground row marked, the
Unavailable row not. So a person reading the day sees "2 pending" but can find only one of the two.

**(c) The pictures.**
- `q-unavmark-pc-head.png` — real: the day's head, "2 pending", the count that names both.
- `q-unavmark-pc-ground.png` — real: the Ground Programme's Meeting, its name underlined as waiting.
- `q-unavmark-pc-unav.png` — real: the Unavailable list's LL for Bolt, no mark.
- `q-unavmark-pc-unav-A.png` — drawn A: the same LL row, its name underlined in the same dotted cyan.
- `q-unavmark-pc-board-ground.png` — real: the Scheduler Board, the Meeting's name box dotted.
- `q-unavmark-pc-board-unav.png` — real: the board's Unavailable panel, the LL row, no mark.
- `q-unavmark-pc-board-unav-A.png` — drawn A: the board's LL row, its name box dotted as the Meeting's is.
- `q-unavmark-ph-ground.png`, `q-unavmark-ph-unav.png` — real, on his iPhone's size: the Ground row marked, the
  Unavailable row not.
- `q-unavmark-ph-unav-A.png` — drawn A on the phone.

**(d) The options.**
- **A — the same mark (recommended).** The Unavailable row of an input filed, changed or moved after publishing wears the
  mark a Ground Programme row wears: on the week its name underlined dotted in the amendment's colour; on the board its
  name box outlined dotted. Pictures: the three "-A" files. No new words, no new look: it is the mark the app already
  draws for a change waiting on a published day, put on one more row. The mark goes when the day's next amendment goes
  out, as every other one does. Rulings: none changed — it carries out D45 ("things shouldn't change silently without the
  scheduler acknowledging it"; the pending mark is the mechanism) and D93 (times, areas and remarks keep their marks) on
  the one list that never got it; D177/D178 (a leave or any input changed after publishing is pending) already count it.
- **B — leave it as it is.** The day's count and the changes window stay the only way to find it. Nothing changes.

**(e) Recommendation: A.** The count says "2 pending" and the schedule shows one: a scheduler hunting the second has to
open the changes window. A is the same mark in the same colour on the same kind of thing (an input's name), so it reads
the same everywhere and needs nothing new learned; B leaves the one place the mark is missing.

**(f) Worked example.** Bolt files LL for Wed 15 Jul after Saber has published it. Today: the day reads "1 pending", the
four sign-offs fall, and Bolt's LL row on the Unavailable list looks exactly as it did before anything changed. With A:
the LL on that row is underlined in dotted cyan (the board: its box outlined dotted) until AL1 goes out, then plain again.

**(g) For the build.**
- The week: the Unavailable row's name is a `<button class="ntx … inpedit">` (`src/ui/html.ts`, the input row builder
  near line 2244 / `inpEditLabel` near 2350) and carries no `data-aln`; the Ground row's name gets `alAttr` from the
  pending list. The board: the Unavailable panel (`src/ui/board-html.ts` near 767, `.sb-panel.unav` rows, name
  `button.sbi-ty`) carries none either. Both need the input's pending key looked up and `alAttr` added.
- The mark's look does not reach a button today: `src/ui/scheduler/04-pucks-sections.css` (about lines 648–650) draws
  the dotted underline only for `#eWeek|#schedBoard :is(span,b,i,div)[data-aln]`, and the board's dotted outline only
  for `:is(input,textarea)[data-aln]`. The rule must name the button too.
- Found while drawing: putting `data-aln` straight on the board's `button.sbi-ty` also darkens its LL tint (another rule
  keys on it), so the drawing used the outline alone — the build should check the button's own colour stays.
- Which inputs: an input filed, edited, re-dated or moved onto a published day (D178), "→ Unavail" and an Other's Goes to
  as the backlog item names; the same key the day's count already uses, so the count and the marks agree.

---

## Q2 [READONLY-WEEK-WORDS] — the words when a week's saved copy cannot be read

**(a) The question.** When a week's saved copy is damaged and cannot be read, the app shows that week read-only with a
notice on every day; what should that notice, and the note when someone tries to change the week, say?

**(b) Still open — yes, and one part of the host's note is wrong.** Measured today by damaging one saved row of the week
of 13 Jul (after publishing Wed) and reloading: the week turns read-only (right), and all 7 days show the same notice,
**still the old words**: "This day's published schedule was created by an older version of the app and can't be shown
here. It has not changed — open it on the device that created it." — so the "device that created it" words are still on
screen (D837 reworded only the refusal, not this notice). Filing a Meeting for Saint on Thu 16 Jul in that week is
refused with the amber note "This week is locked. It was published by an older version of the app, so it can't be
edited." (the input window stays open, nothing saved). Both blame an older version of the app, which is not what
happened. "Ask an admin" (the backlog's proposed words) is not true either: no admin screen can repair a week. What is
true and useful: Help's "Report a problem" reaches every scheduler.

**(c) The pictures.**
- `q-readonly-pc-notice.png` — real: Wed 15 Jul's notice on Edit Schedule, the wrong reason.
- `q-readonly-pc-notice-A.png` — drawn A.
- `q-readonly-pc-notice-B.png` — drawn B.
- `q-readonly-pc-refusal.png` — real: the note when Saint's Meeting is saved into that week.
- `q-readonly-pc-refusal-A.png` — drawn, for A and B alike: the refusal reworded, in the grey "Blocked" note.
- `q-readonly-ph-notice.png` — real, on the phone.
- `q-readonly-ph-notice-A.png` — drawn A on the phone.

**(d) The options** (both change the unreadable case only; a week truly published by an older version keeps today's
words, which are right for it).
- **A — say what happened, that nothing is lost, and what to do (recommended).** The notice: "This week's saved copy
  could not be read, so it can't be shown here. It is kept as it was saved. Report it on the Help page." The refusal:
  "Blocked: this week's saved copy could not be read, so it can't be edited. Nothing was saved." — in the grey "Blocked"
  note every refusal of one change already wears (his D1667–D1669), where today it is still amber.
- **B — the same, without the last step.** The notice: "This week's saved copy could not be read, so it can't be shown
  here. It is kept as it was saved." The refusal as A.
- Rulings changed: none of his. The refusal's new look applies D1667–D1669 to a refusal their build left amber (see g).

**(e) Recommendation: A.** The writing guide says an error says how to put it right; the only thing a person can do here
is tell a scheduler, and the Help page's "Report a problem" is how. B is one sentence shorter but leaves him with nothing
to do. Neither says "Ask an admin", which would send him to someone who cannot fix it.

**(f) Worked example.** Saber opens the week of 13 Jul and one of its saved days has been damaged. Today: every day says
the schedule "was created by an older version of the app … open it on the device that created it", and when he files a
Meeting for Saint on Thu 16 Jul the app says the week "was published by an older version of the app". With A: every day
says the week's saved copy could not be read, it is kept as it was saved, and to report it on the Help page; the Meeting
is refused with "Blocked: this week's saved copy could not be read, so it can't be edited. Nothing was saved."

**(g) For the build.**
- Today one sentence serves both cases: `QUARANTINE_NOTE` (`src/ui/html.ts` ~186, used by the week's
  `dayUnsupportedHTML` and by the board's guard `src/ui/board.ts` ~83) and `LOCKED_WEEK_NOTE` (`src/engine/publish.ts`
  135, said by `src/state/store.ts` 210 and four doors in `src/ui/inputedit.tsx`). The build needs to know WHY the week
  is protected (an older format, or a row that will not read — `src/state/persist.ts` already tells them apart in its
  console line "saved week … will not read — kept as it is, shown read-only") and pick the sentence.
- The refusal is still `HOOKS.toast(LOCKED_WEEK_NOTE, 'warn')` (amber). D1667–D1669 say every refusal of one change opens
  with "Blocked:" in the grey note; that build (pull request with `46ba38c11`) converted `inputedit.tsx`'s own refusals
  but not this one. Its older-version wording, if kept, would read "Blocked: this week was published by an older
  version of the app, so it can't be edited. Nothing was saved." — the host may want to file that as its own small fix.
- The board's notice could not be pictured (below); the same sentence reaches it, so A or B changes it there too.

---

## Q3 [LOGIC-WORDS-WORKHOURS] — where a flyer's day starts when nothing is entered

**(a) The question.** When a flyer's line has nothing entered (no in-time, no rally), should his long day and his
Insights work hours start at the default rally, 3 hours before take-off, as his OIL already does and as the Logic page
says, or at the step, 1 hour before take-off, as the app does today?

**(b) Still open — yes, measured today.** The Logic page's "Default rally before take-off" (3h) says: "With no in-time or
rally entered, a flyer's day starts here: his long day, OIL and Insights hours count from it." The app does not do that
for the long day and Insights. Case: Fri 17 Jul, a new line VL on the first wave, take-off 12:00, landing 13:00, Saint in
the front seat and Echo in the back, nothing else typed (settings as shipped: step 1h, default rally 3h, debrief 2h, long
day 12h). The R box shows a faint 09:00, the time it suggests (B suggests 09:40). Insights' "Work hours · report to
debrief, this week": Saint 12h30 before the line, **16h30** with it — his Friday counted 11:00 (take-off less the step) to
15:00 (landing plus debrief), 4 hours. Typing **09:00 into the R box, the very time it suggests**, makes him **18h30**:
2 hours more. Echo the same: 21h25, 25h25, 27h25. OIL already counts a line with nothing entered from the default rally
(D592). In this case neither a 4-hour nor a 6-hour Friday reaches the 12-hour long-day note, so no note either way. The
phone's Logic page says the same words.

**(c) The pictures.**
- `q-logic-pc-today.png` — real: the Logic page's "Default rally before take-off", its sentence ringed, "Not so today".
- `q-logic-ph-today.png` — real, the same on the phone.
- `q-logic-pc-board.png` — real: the Scheduler Board, Fri 17 Jul, line VL, the empty R box suggesting 09:00 — "but
  Insights counts Saint from 11:00".
- `q-logic-pc-insights.png` — real: Insights' work hours, Saint 16h30, his Friday from 11:00.
- `q-logic-pc-insights-A.png` — drawn A: Saint 18h30 and Echo 27h25, each moved to his place in the list (it runs
  longest first). Only these two are redrawn: any other line in the week with nothing entered would move the same way;
  the demo week's lines were not counted one by one.
- `q-logic-pc-B.png` — drawn B: the default rally's sentence reworded, and one sentence added to "Step before take-off".
- `q-logic-ph-B.png`, `q-logic-ph-B-step.png` — drawn B on the phone, the two rows.

**(d) The options.**
- **A — the app changes: the long day and Insights count from the default rally (recommended).** A line with nothing
  entered starts the man's day at take-off less the default rally, for his long day and his Insights hours as for his
  OIL; the Logic page's words stay as they are, now true. Picture: `q-logic-pc-insights-A.png` (there is nothing new to
  draw on the Logic page: its words stand). What changes: a flying day with nothing entered counts 2 hours longer in
  Insights with today's settings (the gap between the 3-hour rally and the 1-hour step), and the long-day note shows on
  such a day 2 hours sooner; changing the default rally on the Logic page then moves Insights at once (D482), where today
  it moves nothing. Rulings: none of his changed. It carries out **D1032** (he said yes to "an empty box counts as its
  default" for the day's start, the long-day warning and work hours named in that question) and **D592** (1) (one clock
  for OIL, the work-hours bar and the long-day warning), and makes the words of **D928 / D932** true; **D1031** (the one
  setting) and **D482** stand. It ends the engine's own note that the report and the work hours keep separate
  definitions (a note in the code, not a ruling of his).
- **B — the words change: the app stays as it is.** The Logic page says what the app does. "Default rally before
  take-off" reads: "An empty R box suggests take-off less this time, and "+ In-time" fills in the same time. With no
  in-time or rally entered, a flyer's OIL counts from here. His long day and Insights hours count from step. It also sets
  when the tight crew-rest advisory shows." — and "Step before take-off" gains one sentence at its end: "With no in-time or
  rally entered, a flyer's long day and Insights hours count from it too." (Either sentence alone would do; both are drawn
  so a reader of either row finds it.) Pictures: the three "-B" files. Rulings: it narrows **D1032** for the long day and
  work hours (they keep counting from the step when the box is empty) and leaves **D592** (1)'s "one clock" untrue for a
  line with nothing entered; the Logic words of **D928 / D932** change.

**(e) Recommendation: A.** One start for a day with nothing entered, the same for OIL, the long day and the hours, as
the Logic page already says and as he answered for the R box (D1032). The faint 09:00 in the R box is what the scheduler
sees as the start of the day; today typing that very time adds 2 hours to the man's week, which nobody would expect from
accepting a suggestion. With A, typing the suggested time changes nothing, and two starts become one, which leaves fewer
places for a bug. B is cheaper but keeps a flyer's day starting at two different times depending on what is counted. The
cost of A: more long-day notes, about 2 more hours a flying day in Insights where nothing is entered, and it is a change
to the rules engine (see g).

**(f) Worked example.** Saber puts Saint and Echo on a new line VL on Fri 17 Jul, take-off 12:00, landing 13:00, and types
nothing else; the R box shows a faint 09:00. Today: Insights counts Saint's Friday from 11:00, 16h30 for the week; if
Saber then types 09:00, the time the box suggested, Saint jumps to 18h30. With A: Saint reads 18h30 whether or not Saber
types it, and his OIL already counts from 09:00. With B: Saint stays 16h30, and the Logic page now says the hours count
from the step.

**(g) For the build.**
- A is a change to the rules engine: `src/engine/validate.ts` `workSpan` (about line 168; the long day and Insights both
  read it) takes its start from the report, and the report with nothing entered is `in-time ?? step` in
  `src/engine/events.ts`; it would take take-off less `VCONF.reportLead`, as OIL does. `src/engine/rules.ts` (about line
  112) already titles the setting "a day with nothing entered starts at it". The robustness doctrine applies (the five
  gotcha families) and the original's 728 checks must stay green — whether one of them pins the step start is not known
  without running them. A long-day note that newly appears on a day already published must be checked against the
  published-day rule (D179 freezes the face; its exceptions are named); Insights moves at once there (D482).
- SC, AVALON and BB lines are not in this question: their B (in-time) rules are their own (D606, D1041, D1045).
- B is words only: `src/ui/logic-html.ts`, the default rally's row (about line 43) and the step's (about line 47); the
  Logic tests that pin those words (`logic.test.tsx`) follow.
- What the drawing touched that the item did not name: the step row (option B), and Echo, the second man on the line.

---

## Q4 [INP-ADD-RIGHT] — "+ Input" on the desktop Inputs list

**(a) The question.** On a desktop, should "+ Input" on the Inputs list move to the right end of its row, with the list
making room while its window is open, as "+ Medical" already does on the Medical tab?

**(b) Still open — yes, measured today at his PC's size (1536 × 864).** "+ Input" stands first at the left of its row,
the dates button ("13 Jul → 27 Jul") beside it. Its "New input" window opens at the right (about 430 wide, from 1090 to
1520 across) and covers the list's right columns — the end of Remarks, the documents column and Changed; the list does
not make room. On the Medical tab "+ Medical" stands at the right end of its row (his D1300), its window opens there and
the cards make room for it (they stop short of the window), the window then covering "+ Medical" itself. On the phone
"+ Input" and "+ Medical" both stand first at the left of their row; a window there stands in the middle (D997), so
neither option changes the phone.

**(c) The pictures.**
- `q-addright-pc-list.png` — real: "+ Input" at the row's left, beside the dates button.
- `q-addright-pc-listopen.png` — real: its window open, covering the list's right columns.
- `q-addright-pc-med.png` — real: the Medical tab, "+ Medical" at the right (D1300).
- `q-addright-pc-medopen.png` — real: the Medical window open, the cards making room for it.
- `q-addright-pc-list-A.png` — drawn A: "+ Input" at the right end of its row, as "+ Medical" stands.
- `q-addright-pc-listopen-A.png` — drawn A: the window open, the list pulled in so every column stays in view, "+ Input"
  under the window as "+ Medical" is.
- `q-addright-ph-list.png`, `q-addright-ph-med.png` — real, on the phone: both buttons first at the left; unchanged.

**(d) The options.**
- **A — move it, as the Medical tab (recommended).** On a desktop "+ Input" stands at the right end of its row (the
  dates button stays at the left); while its window is open the list makes room on the right, so every column stays in
  view and a new input's row is seen arriving with the just-added ring (the app already rings it). The phone is unchanged.
  No new words and no new look: it copies the Medical tab. Pictures: the two "-A" files. Rulings: it carries out design
  lesson 47 (D1300), which names "+ Input" as the next place; it keeps D1137's pairing ("+ Medical" stands where "+ Input"
  stands) on the desktop too; it narrows D729's drawing (the button "beside the dates button") for the desktop; and it
  sets design lesson 28 (D1188: a button stands in the same place on a phone as on a desktop) aside for this button, as
  D1300 already did for "+ Medical". D1139 (the buttons 36 tall) stands.
- **B — leave it as it is.** "+ Input" stays at the left; its window keeps covering the list's right columns; the two
  "+" buttons of the Inputs page stand on opposite sides on a desktop. Lesson 28 is kept for this button.

**(e) Recommendation: A.** The window opens at the right, so the button that opens it stands there, and the list moves
aside so what is added is seen landing, which is the point of lesson 47 and of his D1300. The Inputs page's two "+"
buttons then behave alike on a desktop, as D1137 had them alike. The cost is lesson 28 for this one button, which he
already accepted for "+ Medical"; a desktop user used to the left finds it at the right.

**(f) Worked example.** On his PC Saber opens the Inputs list (13 Jul → 27 Jul) and presses "+ Input" to file OL for
Cobra on 15 Jul. Today: the button is at the left, the window opens at the right and hides the end of the remarks, the
documents column and the Changed dates, so Cobra's new row arrives with half its line under the window. With A: the
button is at the right end, the list pulls in beside the window, and Cobra's new row shows whole, ringed for a few
seconds.

**(g) For the build.**
- The button: `src/ui/InputsPage.tsx` about line 666 (`#inNew`, inside `listTools`, first before the dates button
  `.inrange`; its comment cites D729 and D910). On a desktop it moves to the row's right end; on a phone it stays first in
  the switch's row (D910).
- The room: copy the Medical tab's — `src/ui/MedicalView.tsx` line 226 adds `med-room` while the window is open on a
  desktop, and `src/ui/scheduler/16-medical.css` line 82 pads the cards by the window's width
  (`padding-right: calc(min(430px, 100vw - 24px) + 16px)`); the Inputs list's style is `src/ui/scheduler/06-inputs.css`.
  The drawing gave the list's table the same padding. Its test is `medicalview.test.tsx` line 264 for Medical's.
- The Inputs calendar's own top row is a different row (D1702, D1708) and is not touched.

---

## Could not picture

- **Q2, the Scheduler Board's notice for a damaged week.** A damaged week's days carry no button that opens the board
  (the script's click on the day's board button waited 30 s and found none), so the board cannot be reached there. Its
  guard prints the same sentence (`src/ui/board.ts` ~83), so the chosen words reach it too.
