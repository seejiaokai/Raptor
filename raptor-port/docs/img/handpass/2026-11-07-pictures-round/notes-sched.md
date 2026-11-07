# Pictures round, group "sched" — four questions (drawn 8 Nov 26 on `main` at `6e6c55667`, served on port 4291)

Script `raptor-port/scripts/handpass/pr-sched.mjs` (run `PR_ONLY=q1,q2,q3,q4`); measures `q-sched-measured.json` in this
folder. Clock held at Mon 13 Jul 26 09:00; signed in as Saber (admin). Every picture is 2x (the two enlarged ones 6x);
"real" is the app as it is today with only an amber ring and tag added; "drawn" is a change made on the running page
(nothing saved) and tagged "Drawn: …". Every PNG below was opened and looked at after its last redraw.

**Second pass (8 Nov 26), after the design read (`review-design.md`, "Schedule and words") and the cold read of the new
words (`cold-read.md`, 11–16):** every rank (1) and (2) fix made, and every (3) — Q1's rings tight on the name, its tags
moved off the column headings, two enlarged pictures; Q2's and Q3's words reworded (each change below, before → after,
with its reason); Q3's work hours worked out for the whole week; Q4's tags. Each question's changes are listed at its end.

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

**(c) The pictures.** On the week and the phone the ring sits tight round the name alone, and each tag stands in the free
room right of its section's title, so it covers no row and no column heading.
- `q-unavmark-pc-head.png` — real: the day's head, "2 pending", the count that names both.
- `q-unavmark-pc-ground.png` — real: the Ground Programme's Meeting, its name underlined as waiting.
- `q-unavmark-pc-unav.png` — real: the Unavailable list's LL for Bolt, no mark.
- `q-unavmark-pc-unav-A.png` — drawn A: the same LL, its name underlined in the same dotted cyan.
- `q-unavmark-pc-unav-zoom.png` — enlarged (6x), the LL cell alone, today and drawn A side by side: "Enlarged: the dotted
  line under LL".
- `q-unavmark-pc-board-ground.png` — real: the Scheduler Board, the Meeting's name box dotted (the row ringed).
- `q-unavmark-pc-board-unav.png` — real: the board's Unavailable panel, the LL row, no mark.
- `q-unavmark-pc-board-unav-A.png` — drawn A: the board's LL row, its name box dotted as the Meeting's is.
- `q-unavmark-ph-ground.png`, `q-unavmark-ph-unav.png` — real, on his iPhone's size: the Ground row marked, the
  Unavailable row not.
- `q-unavmark-ph-unav-A.png` — drawn A on the phone.
- `q-unavmark-ph-unav-zoom.png` — enlarged (6x), the phone's LL cell, today and drawn A side by side.

**(d) The options.**
- **A — the same mark (recommended).** The Unavailable row of an input filed, changed or moved after publishing wears the
  mark a Ground Programme row wears: on the week its name underlined dotted in the amendment's colour; on the board its
  name box outlined dotted. Pictures: the three "-A" files and the two enlarged ones. No new words, no new look: it is the
  mark the app already draws for a change waiting on a published day, put on one more row. The mark goes when the day's
  next amendment goes out, as every other one does. **On a two-letter name like "LL" the mark is small** — a dotted line
  about as wide as the two letters, faint at the picture's size, so on a phone the "today" and "A" pictures look nearly
  alike; the enlarged pictures show it, and he judges it at its real size. On the board the dotted box runs the whole
  name box, so it shows plainly. The board's A keeps the LL box's own purple tint (the design read sampled it); the
  Ground row's teal tint is the "came from an input" look, not the waiting mark, so A adds exactly the one mark. Rulings:
  none changed — it carries out D45 ("things shouldn't change silently without the scheduler acknowledging it"; the
  pending mark is the mechanism) and D93 (times, areas and remarks keep their marks) on the one list that never got it;
  D177/D178 (a leave or any input changed after publishing is pending) already count it.
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
- If he finds the underline too small on a short name, a thicker dotted line is a look change for every waiting name,
  not this row alone — a question of its own, not drawn here.

**Changed in the second pass:** the rings tight round the name (they were wide boxes round the cell); the tags moved from
over the column headings to beside each section's title (the design read asked for "below the ring"; below, they
covered the next row — OL, MAINT CONF, Cobra — so they went to the title row, where they cover nothing); the two
enlarged pictures added; the "small on a two-letter name" sentence added to (d).

---

## Q2 [READONLY-WEEK-WORDS] — the words when a week's saved copy cannot be read

**(a) The question.** When a week's saved copy is damaged and cannot be read, the app shows that week read-only with a
notice on every day; what should that notice, and the note when someone tries to change the week, say?

**(b) Still open — yes, and one part of the host's note is wrong.** Measured today by damaging one saved row of the week
of 13 Jul (after publishing Wed) and reloading: the week turns read-only (right), and all 7 days show the same notice,
**still the old words**: "This day's published schedule was created by an older version of the app and can't be shown
here. It has not changed — open it on the device that created it." — so the "device that created it" words are still on
screen (D837 reworded only the refusal, not this notice). Filing a Meeting for Saint on Thu 16 Jul in that week is
refused with the amber note "This week is locked. It was published by an older version of the app, so it can’t be
edited." (the input window stays open, nothing saved). Both blame an older version of the app, which is not what
happened. "Ask an admin" (the backlog's proposed words) is not true either: no admin screen can repair a week. What is
true and useful: Help's "Report a problem" — its own words, "The schedulers see every report."

**(c) The pictures.**
- `q-readonly-pc-notice.png` — real: Wed 15 Jul's notice on Edit Schedule, the wrong reason.
- `q-readonly-pc-notice-A.png` — drawn A.
- `q-readonly-pc-notice-B.png` — drawn B.
- `q-readonly-pc-refusal.png` — real: the note when Saint's Meeting is saved into that week.
- `q-readonly-pc-refusal-A.png` — drawn A: the refusal reworded, in the grey "Blocked" note, with A's last step. (Under B
  the refusal is the same without its last sentence; not drawn separately.)
- `q-readonly-ph-notice.png` — real, on the phone.
- `q-readonly-ph-notice-A.png` — drawn A on the phone.

**(d) The options** (both change the unreadable case only; a week truly published by an older version keeps its own
reason — see (g) for its refusal).
- **A — say what happened, that nothing is lost, and what to do (recommended).**
  - The notice: "This week’s saved copy could not be read, so it can’t be shown. The saved copy is kept as it was.
    Report it with “Report a problem” on the Help page."
  - The refusal: "Blocked: this week’s saved copy could not be read, so it can’t be edited. Nothing was saved. Report it
    with “Report a problem” on the Help page." — in the grey "Blocked" note every refusal of one change already wears
    (his D1667–D1669), where today it is still amber.
- **B — the same, without the last step.**
  - The notice: "This week’s saved copy could not be read, so it can’t be shown. The saved copy is kept as it was."
  - The refusal: "Blocked: this week’s saved copy could not be read, so it can’t be edited. Nothing was saved."
- Rulings changed: none of his. The refusal's new look applies D1667–D1669 to a refusal their build left amber (see g).

**(e) Recommendation: A.** The writing guide says an error says how to put it right; the only thing a person can do here
is tell a scheduler, and Help's "Report a problem" is how. B is one sentence shorter but leaves him with nothing to do —
the cold reader, given B alone, said exactly that: "It leaves me with no next step, so I'd go and ask someone." Neither
says "Ask an admin", which would send him to someone who cannot fix it.

**(f) Worked example.** Saber opens the week of 13 Jul and one of its saved days has been damaged. Today: every day says
the schedule "was created by an older version of the app … open it on the device that created it", and when he files a
Meeting for Saint on Thu 16 Jul the app says the week "was published by an older version of the app". With A: every day
says the week's saved copy could not be read, the saved copy is kept as it was, and to report it with "Report a problem"
on the Help page; the Meeting is refused with "Blocked: this week’s saved copy could not be read, so it can’t be edited.
Nothing was saved. Report it with “Report a problem” on the Help page."

**The words, before → after, and why** (the first pass's words, then the cold read's number):
- **Notice A (cold read 11).** Before: "This week's saved copy could not be read, so it can't be shown here. It is kept as
  it was saved. Report it on the Help page." After: "This week’s saved copy could not be read, so it can’t be shown. The
  saved copy is kept as it was. Report it with “Report a problem” on the Help page."
  - "here" dropped: the cold reader asked "might it be shown somewhere else; where?" — it cannot be shown anywhere.
  - "It is kept as it was saved" → "The saved copy is kept as it was": "it" could be read as the week (the design read;
    the writing guide never trades a name for "it").
  - "Report it on the Help page" → "Report it with “Report a problem” on the Help page": names the control he will find
    (the Help page's heading is "Report a problem"), so he knows what to press.
  - Kept: "saved copy" (the cold reader asked whether another copy exists — the working copy does, but it is built from
    this one, so it cannot stand in; "saved copy" is the true name of what failed). Kept on every day, as the notice is
    today: showing it once at the week's top would be a new look, to be drawn first (D1625) — not drawn here.
- **Notice B (cold read 12).** Before: as A's first two sentences before. After: "This week’s saved copy could not be
  read, so it can’t be shown. The saved copy is kept as it was." No next step, by design: that is the whole difference
  from A, and the cold reader's catch is the reason A is recommended.
- **The refusal (cold read 13).** Before: "Blocked: this week's saved copy could not be read, so it can't be edited.
  Nothing was saved." After, under A: the same, then "Report it with “Report a problem” on the Help page." — the cold
  reader: "I'd want to report it, but this note doesn't say how". Under B it ends at "Nothing was saved."
- **The older-version refusal (cold read 14; not pictured, see g).** Before: "Blocked: this week was published by an
  older version of the app, so it can’t be edited. Nothing was saved." After: the same, then "Report it with “Report a
  problem” on the Help page." — the cold reader called it "a dead end". The step is true: the schedulers see every
  report; it promises no repair. "by" stays: "published by an older version of the app" are his approved words (D837);
  the cold reader's "with" is his call, not taken.
- **Apostrophes:** the drawn words use the curled ’ and “ ”, as the app's refusal of record already does ("can’t" in
  today's amber note); today's notice uses the straight one. The build should use one, the curled, as that note does.

**(g) For the build.**
- Today one sentence serves both cases: `QUARANTINE_NOTE` (`src/ui/html.ts` ~186, used by the week's
  `dayUnsupportedHTML` and by the board's guard `src/ui/board.ts` ~83) and `LOCKED_WEEK_NOTE` (`src/engine/publish.ts`
  135, said by `src/state/store.ts` 210 and four doors in `src/ui/inputedit.tsx`). The build needs to know WHY the week
  is protected (an older format, or a row that will not read — `src/state/persist.ts` already tells them apart in its
  console line "saved week … will not read — kept as it is, shown read-only") and pick the sentence.
- The refusal is still `HOOKS.toast(LOCKED_WEEK_NOTE, 'warn')` (amber). D1667–D1669 say every refusal of one change opens
  with "Blocked:" in the grey note; that build (pull request with `46ba38c11`) converted `inputedit.tsx`'s own refusals
  but not this one. Its older-version wording would read "Blocked: this week was published by an older version of the
  app, so it can’t be edited. Nothing was saved. Report it with “Report a problem” on the Help page." — the host may want
  to file that as its own small fix.
- The board's notice could not be pictured (below); the same sentence reaches it, so A or B changes it there too.

**Changed in the second pass:** the words above; the phone pictures cut under the top bar (half of TALON showed); the
refusal picture's tag reads "Drawn: A".

---

## Q3 [LOGIC-WORDS-WORKHOURS] — where a flyer's day starts when nothing is entered

**(a) The question.** When a flyer's line has nothing entered (no in-time, no rally), should his long day and his
Insights work hours start at the default rally, 3 hours before take-off, as his OIL already does and as the Logic page
says, or at the step, 1 hour before take-off, as the app does today?

**(b) Still open — yes, measured today.** The Logic page's "Default rally before take-off" (3h) says: "An empty R box
suggests take-off less this time, and "+ In-time" fills in the same time. With no in-time or rally entered, a flyer's day
starts here: his long day, OIL and Insights hours count from it. It also sets when the tight crew-rest advisory shows."
The app does not do that for the long day and Insights. Case: Fri 17 Jul, a new line VL on the first wave, take-off
12:00, landing 13:00, Saint in the front seat and Echo in the back, nothing else typed (settings as shipped: step 1h,
default rally 3h, debrief 2h, long day 12h). The R box shows a faint 09:00, the time it suggests (B suggests 09:40).
Insights' "Work hours · report to debrief, this week": Saint 12h30 before the line, **16h30** with it — his Friday
counted 11:00 (take-off less the step) to 15:00 (landing plus debrief), 4 hours. Typing **09:00 into the R box, the very
time it suggests**, makes him **18h30**: 2 hours more. Echo the same: 21h25, 25h25, 27h25. OIL already counts a line with
nothing entered from the default rally (D592). In this case neither a 4-hour nor a 6-hour Friday reaches the 12-hour
long-day note, so no note either way. The phone's Logic page says the same words.

**How his D1032 bears on it — and why it is still his question.** D1032 (19 Oct 26) — his "4 yes" to "Does the R box count
for OIL and the day's start exactly like a typed rally does today? … an empty box counts as its default". Its rule: "A
formation's R box counts exactly as a typed rally did: the earliest applicable in-time or rally starts its report (with no
in-time, the rally) for crew rest, OIL and the rest, where it is the man's first event; an empty box's default counts only
where no in-time or rally is entered (D592)." Its full row adds: "The long-day warning and work hours were named in the
question he said yes to." Read plainly, that yes points to A: an empty box counts as its default "for crew rest, OIL and
the rest", and the rest named the long day and work hours. But this question was found the same day, 19 Oct 26, by the
walk of that same job, and that chat filed it for him as a question rather than reading his yes as the answer — so it is
put to him as open, with D1032 quoted. If he answers A, D1032 is carried out in full; if B, D1032 is narrowed for the long
day and work hours.

**(c) The pictures.**
- `q-logic-pc-today.png` — real: the Logic page's "Default rally before take-off", the whole row ringed, "Not so today:
  the long day and Insights hours count from step".
- `q-logic-ph-today.png` — real, the same on the phone (the sentence ringed, under the row's name).
- `q-logic-pc-board.png` — real: the Scheduler Board, Fri 17 Jul, line VL, the empty R box suggesting 09:00 — "but
  Insights counts Saint from 11:00".
- `q-logic-pc-insights.png` — real: Insights' work hours, Saint 16h30 and Echo 25h25 both ringed, "Their Friday counts
  from 11:00, take-off less step".
- `q-logic-pc-insights-A.png` — drawn A, the whole week worked out: "Drawn: A, whole week checked: only Saint and Echo
  move, +2h each" — Saint 18h30, Echo 27h25, each moved to his place in the list (it runs longest first), both ringed;
  the same rows as today's picture (Bolt to Wildcard), so the two compare side by side. How it was worked out: every
  man's day in the week, from the app's own events, was counted as today and as under A (a flying line with nothing
  entered starting at take-off less the default rally). All 56 men's totals counted as today matched the figures
  Insights shows, to the minute, so the counting is checked. Of the week's 66 seats on flying lines (a man on one
  sortie), only 2 have nothing entered — Saint's and Echo's on Friday's VL, the line made for this question; every other
  in the demo week has an in-time or a rally typed. So only those two move, by 2 hours each, and under A nobody's day in
  the week newly reaches the 12-hour long-day note. In a real week, every man on a line with nothing entered would move
  the same way.
- `q-logic-pc-A.png`, `q-logic-ph-A.png` — drawn A: the default rally's sentence in clearer words, the same facts; new
  words underlined.
- `q-logic-pc-B.png`, `q-logic-ph-B.png` — drawn B: the default rally's sentence saying what the app does; new words
  underlined.
- `q-logic-pc-B-step.png`, `q-logic-ph-B-step.png` — drawn B, only if he also wants it said on "Step before take-off":
  one sentence added there.

**(d) The options.**
- **A — the app changes: the long day and Insights count from the default rally (recommended).** A line with nothing
  entered starts the man's day at take-off less the default rally, for his long day and his Insights hours as for his
  OIL. The Logic page's facts stay as they are, now true; drawn in clearer words (the cold read's points hold for today's
  sentence too) — keeping today's words word for word also works under A. The drawn words: "An empty R box, a
  formation's rally, suggests a time this long before take-off, and "+ In-time" fills in that same time. When no in-time
  or rally is entered, a flyer's day starts at that time: his long day, OIL and Insights hours count from it. The tight
  crew-rest advisory also checks his rest as if he reported at that time." Pictures: `q-logic-pc-insights-A.png`,
  `q-logic-pc-A.png`, `q-logic-ph-A.png`. What changes: a flying day with nothing entered counts 2 hours longer in
  Insights with today's settings (the gap between the 3-hour rally and the 1-hour step), and the long-day note shows on
  such a day 2 hours sooner; changing the default rally on the Logic page then moves Insights at once (D482), where today
  it moves nothing. Rulings: none of his changed. It carries out **D1032** (above) and **D592** (1) (one clock for OIL,
  the work-hours bar and the long-day warning), and makes the words of **D928 / D932** true; **D1031** (the one setting)
  and **D482** stand. It ends the engine's own note that the report and the work hours keep separate definitions (a note
  in the code, not a ruling of his).
- **B — the words change: the app stays as it is.** The Logic page says what the app does. "Default rally before
  take-off" reads: "An empty R box, a formation's rally, suggests a time this long before take-off, and "+ In-time" fills
  in that same time. When no in-time or rally is entered, a flyer's OIL counts from that time, but his long day and
  Insights hours count from step. The tight crew-rest advisory also checks his rest as if he reported at that time."
  Offered with that row alone (D726: a screen is not wordy). Only if he wants it said on both rows, "Step before take-off"
  gains at its end: "When no in-time or rally is entered, a flyer's long day and Insights hours also count from step."
  Pictures: `q-logic-pc-B.png`, `q-logic-ph-B.png`; the step row: `q-logic-pc-B-step.png`, `q-logic-ph-B-step.png`.
  Rulings: it narrows **D1032** for the long day and work hours (they keep counting from the step when the box is empty)
  and leaves **D592** (1)'s "one clock" untrue for a line with nothing entered; the Logic words of **D928 / D932**
  change.

**(e) Recommendation: A.** One start for a day with nothing entered, the same for OIL, the long day and the hours, as
the Logic page already says and as he answered for the R box (D1032). The faint 09:00 in the R box is what the scheduler
sees as the start of the day; today typing that very time adds 2 hours to the man's week, which nobody would expect from
accepting a suggestion. With A, typing the suggested time changes nothing, and two starts become one, which leaves fewer
places for a bug. B is cheaper but keeps a flyer's day starting at two different times depending on what is counted — the
cold reader, reading B's first words alone, took the two starts for a contradiction. The cost of A: about 2 more hours a
flying day in Insights where nothing is entered, more long-day notes on such days, and it is a change to the rules engine
(see g). In the demo week only the one line made for this question is touched.

**(f) Worked example.** Saber puts Saint and Echo on a new line VL on Fri 17 Jul, take-off 12:00, landing 13:00, and types
nothing else; the R box shows a faint 09:00. Today: Insights counts Saint's Friday from 11:00, 16h30 for the week; if
Saber then types 09:00, the time the box suggested, Saint jumps to 18h30. With A: Saint reads 18h30 whether or not Saber
types it, and his OIL already counts from 09:00. With B: Saint stays 16h30, and the Logic page now says the hours count
from step.

**The words, before → after, and why** (cold read 15 called B's first words "the hardest of the set"; the writing guide,
`raptor-port/docs/design-practices.md` §1b; every sentence ends with a full stop, as the page is prose; the page's own
names kept):
- "An empty R box suggests" → "An empty R box, a formation's rally, suggests": the cold reader guessed R meant rally;
  the Logic page's own line says "A formation's rally is its R box.", so the box is named in the page's words.
- "take-off less this time" → "a time this long before take-off": the cold reader first read "less" as "less often".
- "fills in the same time" → "fills in that same time": "the same as what?" — now it points back at the suggested time.
- "With no in-time or rally entered," → "When no in-time or rally is entered,": a whole clause.
- A: "a flyer's day starts here: his long day, OIL and Insights hours count from it." → "a flyer's day starts at that
  time: his long day, OIL and Insights hours count from it." — "here" for a setting read oddly; it means that time.
- B: "a flyer's OIL counts from here. His long day and Insights hours count from step." → "a flyer's OIL counts from that
  time, but his long day and Insights hours count from step." — one sentence, so the condition plainly covers both halves
  (the cold reader could not tell whether it still applied to the second), and "but" shows the two starts differ on
  purpose.
- "It also sets when the tight crew-rest advisory shows." → "The tight crew-rest advisory also checks his rest as if he
  reported at that time." — "it" was unclear and "tight" unexplained; the page's own line for that advisory says it
  warns when "His rest would be short if he reported the usual … before take-off (Default rally before take-off)", so
  this says what the setting does for it.
- The step row, B only (cold read 16): "With no in-time or rally entered, a flyer's long day and Insights hours count
  from it too." → "When no in-time or rally is entered, a flyer's long day and Insights hours also count from step." —
  "it" and "too" pointed at words the reader cannot see; the condition worded the same as the rally row's.
- Kept, the page's own names: "R box", "+ In-time", "long day", "step", "OIL", "Insights hours", "tight crew-rest
  advisory". "long day" and "step" each have their own row on the same page.

**(g) For the build.**
- A is a change to the rules engine: `src/engine/validate.ts` `workSpan` (about line 154–181; the long day and Insights
  both read it) takes its start from the report. Its own fallback is already take-off less the default rally (`to −
  VCONF.reportLead`) when a flying line has no report — but it never fires, because `src/engine/events.ts` (about line
  359) sets `report = in-time ?? step`, so a line with nothing entered always carries its step as its report. A would make
  that start take-off less `VCONF.reportLead`, as OIL does; every other reader of `report` (crew rest, the tight
  crew-rest advisory, OIL) must be checked to keep its own behaviour. `src/engine/rules.ts` (about line 112) already
  titles the setting "a day with nothing entered starts at it". The long-day block's own comment reads "Report (T/O −
  3h, or the published in-time)". The robustness doctrine applies (the five gotcha families) and the original's 728
  checks must stay green — whether one of them pins the step start is not known without running them. A long-day note
  that newly appears on a day already published must be checked against the published-day rule (D179 freezes the face;
  its exceptions are named); Insights moves at once there (D482).
- SC, AVALON and BB lines are not in this question: their B (in-time) rules are their own (D606, D1041, D1045).
- The words: `src/ui/logic-html.ts`, the default rally's row (about line 43) and the step's (about line 47); the Logic
  tests that pin those words (`logic.test.tsx`) follow.
- What the drawing touched that the item did not name: the step row (option B, offered as optional), and Echo, the second
  man on the line.

**Changed in the second pass:** the whole week worked out for A's work-hours picture (it had redrawn Saint and Echo only);
both men ringed in "today"; the PC rings round the whole row, the phone's moved under the row's name (they cut through
it); B offered with the rally row's sentence alone, the step row's optional; new words underlined in every drawn
sentence; A and B reworded after the cold read, as above.

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
- `q-addright-pc-med.png` — real: the Medical tab, "+ Medical" at the right — tag "Medical: + Medical at the right, as you
  ruled".
- `q-addright-pc-medopen.png` — real: the Medical window open, the cards making room for it — tag "The cards make room for
  the window", on the cards' ring.
- `q-addright-pc-list-A.png` — drawn A: "+ Input" at the right end of its row, as "+ Medical" stands.
- `q-addright-pc-listopen-A.png` — drawn A: the window open, the list pulled in so every column stays in view, "+ Input"
  under the window as "+ Medical" is.
- `q-addright-ph-list.png`, `q-addright-ph-med.png` — real, on the phone: both buttons first at the left; unchanged.

**(d) The options.**
- **A — move it, as the Medical tab (recommended).** On a desktop "+ Input" stands at the right end of its row (the
  dates button stays at the left); while its window is open the list makes room on the right, so every column stays in
  view and a new input's row is seen arriving with the just-added ring (the app already rings it). The phone is unchanged.
  No new words and no new look: it copies the Medical tab. Pictures: the two "-A" files. **Its cost on the list:** pulled
  in beside the window, the Remarks column narrows to about 190 px, so a longer remark wraps onto two lines (in the
  picture: Vector, Wisp, Cobra, Nomad), while Name and Start keep wide empty columns — the build should let Name and Start
  give up room before Remarks does (see g). Rulings: it carries out design lesson 47 (D1300), which names "+ Input" as the
  next place; it keeps D1137's pairing ("+ Medical" stands where "+ Input" stands) on the desktop too; it narrows D729's
  drawing (the button "beside the dates button") for the desktop; and it sets design lesson 28 (D1188: a button stands in
  the same place on a phone as on a desktop) aside for this button, as D1300 already did for "+ Medical". D1139 (the
  buttons 36 tall) stands.
- **B — leave it as it is.** "+ Input" stays at the left; its window keeps covering the list's right columns; the two
  "+" buttons of the Inputs page stand on opposite sides on a desktop. Lesson 28 is kept for this button.

**(e) Recommendation: A.** The window opens at the right, so the button that opens it stands there, and the list moves
aside so what is added is seen landing, which is the point of lesson 47 and of his D1300. The Inputs page's two "+"
buttons then behave alike on a desktop, as D1137 had them alike. The costs are lesson 28 for this one button, which he
already accepted for "+ Medical" (a desktop user used to the left finds it at the right), and a narrower Remarks column
while the window is open.

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
- The columns while the list is pulled in: Name and Start have the most spare room and should narrow first, so Remarks
  keeps its width as long as it can.
- The Inputs calendar's own top row is a different row (D1702, D1708) and is not touched.

**Changed in the second pass:** the open Medical picture's tag moved off the window's Person box onto the cards' ring;
the Medical tag says "as you ruled"; the Remarks cost named in (d) and (g).

---

## Could not picture

- **Q2, the Scheduler Board's notice for a damaged week.** A damaged week's days carry no button that opens the board
  (the script's click on the day's board button waited 30 s and found none), so the board cannot be reached there. Its
  guard prints the same sentence (`src/ui/board.ts` ~83), so the chosen words reach it too.
- **Q2, the older-version refusal (cold read 14).** This round pictured the damaged-week case only; a week truly
  published by an older version was not made, so that refusal's reworded words are given in words only, in (g).
