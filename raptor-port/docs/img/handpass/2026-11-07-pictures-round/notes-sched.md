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

Q3_PLACEHOLDER

---

## Q4 [INP-ADD-RIGHT] — "+ Input" on the desktop Inputs list

Q4_PLACEHOLDER

---

## Could not picture

- **Q2, the Scheduler Board's notice for a damaged week.** A damaged week's days carry no button that opens the board
  (the script's click on the day's board button waited 30 s and found none), so the board cannot be reached there. Its
  guard prints the same sentence (`src/ui/board.ts` ~83), so the chosen words reach it too.
