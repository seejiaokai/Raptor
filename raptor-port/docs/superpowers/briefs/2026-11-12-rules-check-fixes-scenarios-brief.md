# Brief — design the walk's scenarios for the rules check's fixes (12 Nov 26)

You are the scenario designer for a bug check (the order's §4 rank 1). You did not build this change. Read-only: change
no file in the repository; write nothing anywhere but your final message. If a handoff block is pasted into your
context after a compaction of your own, do not read it, and name it in your report.

## Your job — find what is MISSING, from what was PROMISED

Work from the owner's rulings and the review's report, NOT from the code. Do not open `raptor-port/src` or the branch's
diff: your value is that you work from the promise, not from what the builder happened to build. You may read the
reference documents that say what the app shows and where (`raptor-port/docs/feature-impact.md`,
`raptor-port/docs/ui-contracts.md`, `raptor-port/docs/engine-rules.md`, `raptor-port/docs/word-list.md` — searched,
not whole) to name surfaces and controls in the app's own words.

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

**What is NOT a finding (the owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. Do not write a scenario whose harm exists only in data already stored when
the code is already correct going forward — no migration, no back-compat, no "an existing record would read wrongly".
If the app would do it again to NEW data, it is in scope. **And (D785): a scheduler is always an admin** — never set up
a scheduler who is not an admin; a member, a guest and a person with no sign-in stay in scope.

## The promise — read these, whole

Repository: `C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2`, branch
`claude/rules-check-fixes`.

1. The rulings' full rows — the shell: `grep -h '^| D1990 |' .claude/decisions-full/*.md`, for each of D1988, D1989,
   D1990, D1991, D1992, D1993, D1994, D1995, D1996, D1997, D1998, D1999, D2000, D2001, D2002, D2003, D2004 (and D505,
   D592, D606, D1041, which some of them lean on). D2005 is the NEXT job, not this one — out of scope.
2. The review's report these fixes answer: `raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-report.md`
   — §2 (F1–F11), §3 (Q1–Q10), §5.
3. The words changed, old and new, with where each shows:
   `raptor-port/docs/superpowers/briefs/2026-11-12-rules-check-fixes-words.md`.
4. The area pages, for the standing rules around these: `.claude/rules/decisions/scheduler.md` and `oil.md`.

## What was built (the builder's own summary — a claim to test, not a fact)

Nine rule fixes and a words job, on one branch:
- D1990: a landing that is not a time ("TBD", blank) ends the day at take-off + the debrief for crew rest.
- D1991 (F1): a published day's crew rest and missed-brief checks use the brief lead it was published with, not
  today's Logic setting; the working copy reads today's.
- D1993 (F2): a row with no times counts as a day on the programme for days in a row.
- D1995: every typed In-time line with a clock is an in-time, whatever its words (even "RALLY"); the rally is the R
  box alone; a clockless line sets no time.
- D1996: a standby (SC) shift line that flies is checked like a sortie (clashes red, crew rest, turns); and the crew
  list on Edit Schedule now crosses a man out for a lecture or Meeting inside his flying shift.
- D1997: once its wave flies, a desk made from the AVALON or BB template is fully checked and earns OIL by default.
- D1999: a flying standby shift typed with the same START and END earns from its R or B (if earlier) to its END; its
  amber "takes off and lands at the same time" note now ends "the shift still earns from its R or B".
- F3: hiding one "same time" warning no longer leaves a second identically worded line's amber box.
- D2001: a hidden clash stays hidden by its man and its two items, not its words.
- Words: D2003/D2004 amber OIL lines in his words; D1994 template note; D2000 "OIL earned" not "pays"; the Logic
  page's lines F5–F11 and thirteen others.

The builder's roll-call (where each thing is drawn) is below; check it for absences.

**Crew rest (D1990, D1991, D1996)** — every surface reads the one warning bundle.
- Has it: the week's and board's seats and rings; the crew list; ALL AVAIL; the copies of a man's puck on Ground,
  Personal Inputs, Unavailable and SANS; the issues lists; ⓘ; Insights counts; View-only Sched's published face
  (the official pass).
- Must not, because the next-week preview draws no warnings but the same-time box: the next-week preview.

**Reporting (D1995)**
- Has it: crew rest; OIL; the week header "In-time / Rally"; the live rally feedback on the week and board; the
  warning REPORT_UNRESOLVED (its words); the Logic page's report-order lines.
- Must not, because: the board header shows no clock (D947); "+ In-time" writes words and is unchanged.

**Days in a row (D1993)**
- Has it: the RUN warning; its dotted twin mark on the days before; across the week's edge.

**A standby line that flies, checked like a sortie (D1996)**
- Has it: the issues lists; ALL AVAIL flags; the crew list on Edit Schedule (a lecture or Meeting inside the flying
  shift crosses him out, built after the first roll-call found it MISSING); the Logic page's SC MAIN lines.

**A desk from a flying wave (D1997)**
- Has it: the OIL Earn default; the crew list's standing-by look; a seat's duty mark; the warnings; the Leave War's
  OIL credit; the duty-template sheet's note (D1994 words, "until the AVALON / BB flies"); the Logic page's OIL fold.

**A zero-length shift that flies earns (D1999)**
- Has it: the OIL credit; OIL Earn's figures; the board's OIL figures; the Leave War's credit; the day's "no usable
  times" line; the same-time note on the week, board and next-week preview titles (one shared sentence); the Logic
  page's fltnolen line.
- Must not, because D1999 is about earning only: Insights hours.

**F3, the amber same-time box**
- Has it: the week and the board (one shared function); the published face; the next-week preview.

**D2001, the hide key**
- Has it: every reader of a hidden warning (rings, counts, lists, ⓘ, Insights) through one decision; the published
  face's kept hides; the pending hides lines; the D479 amber note.
- Must not, because it is the "new flag" pulse, not a hide: the drop's new-flag check.

**The amber OIL lines (D2003, D2004)**
- Has it: the day's warning list on Edit Schedule (OIL_STALE_DAY, OIL_STALE_HOLIDAY); RECORD where else.

**The words (D2000, Logic F5–F11)**
- Has it: the Logic page (Settings and Checks, their "how" folds); the duty-template sheet's notes.

## What to hand back

A ranked table of scenarios for walkers who drive the real built app in a browser (desktop 1536 and an iPhone at 402),
signing in as admin `ad` (Saber) or member `us` (Ranger), making every state through the app's own controls
(Edit Schedule, publish, amend, the ✕ that hides a warning, OIL Earn, Logic, Admin). For each:

- **id, title, the ruling or report item it tests;**
- **setup** — through the app's own controls, step by step, from the demo world (a fresh boot);
- **action;**
- **EXPECTED** — each with its SOURCE: a ruling (number), a report item, or "two surfaces that must agree" (name both).
  Where you cannot settle the expectation from the rows, write "RECORD exactly what it says" instead;
- **the observation that would disprove it** — which surface, which words or mark;
- **surfaces to look at** — every place the result should show (the warning list, the puck's ring, the board, the
  crew list, ALL AVAIL, OIL Earn, the Leave War's OIL, View-only Sched's published face, the Logic page, Insights…).

Include:
- **both orders across the publish boundary** for each fix that touches a published day or OIL (do it before
  publishing / after publishing; undo; reload);
- **the plain-user round** (the order's §7.0a): the area's everyday tasks end to end as a user would — build a day,
  publish it, amend it, hide a warning with its ✕ and bring it back, open and close OIL Earn, open the Logic page —
  pressing every control that opens or closes something, and looking at every other place that should show the
  result;
- the **"left as it is today" half** of each ruling — what must NOT have changed (a standby shift that does NOT fly; a
  desk before its wave flies; a working copy; a clockless line; a ground row) — as scenarios too;
- for each of the owner's lessons below that could apply, the scenario that covers it, or one line why it cannot:
  - (1) a surface with more than one state: a table of state × every reading it shows;
  - (3) after every press, what tells the person it happened;
  - (12) every page a window can be opened from;
  - (16) after a refusal or warning at a box: tap away, tap it afresh, type the figure it shows;
  - (25) the thing made through the app's own controls in every place it can be put — each kind of row, seat or list
    — not only where the demo data has it;
  - (29) anything that reads today: past midnight with the page open.

Finally, **explicit negatives**: name what you checked and found nothing to add. Aim for 25–45 scenarios, ranked by
how likely each is to find a real fault. Plain text, no preamble.
