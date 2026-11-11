# Brief — a blind code read of the rules check's fixes, jobs 2 and 3 (12 Nov 26)

You are an independent reader. You did not write this change. You have seen no other reader's report and no walk
report, and you will not: none exists anywhere you can open. Do not look for one. If a handoff block is pasted into
your context after a compaction of your own, do not read it, and name it in your report.

**What you read is an exported copy of commit `52163215d`** of branch `claude/rules-check-fixes` — `C:/Users/User/AppData/Local/Temp/claude/f4202d016722bdbc/cb4f03b3-b05a-4aac-84e8-eaf47858fa25/scratchpad/read-copy-52163215d` — a
throwaway folder, its own git history one commit. Read only inside it. Do not open the live checkout or any other
folder. The change under review is `THE-CHANGE.diff` at the copy's root: `git diff 55e370068 52163215d --
raptor-port/src raptor-port/e2e` (35 files, the app code and its tests). Read the live files the diff touches, whole
where it matters, and their callers.

**Your sandbox is read-only.** You may run an existing unit test file from `raptor-port/` (`npx vitest run <file>`; the packages are linked in) if the sandbox lets it run. You cannot write a new test: for every claim, write out in your report the exact failing test you would add (its file, its case, its assertion) — the host will run each one before your finding counts.

## What to read for the promise

1. The rulings' full rows (the shell, never a search tool that cuts long lines): `grep -h '^| D1990 |'
   .claude/decisions-full/*.md` — for each of D1988, D1989, D1990, D1991, D1992, D1993, D1994, D1995, D1996, D1997,
   D1998, D1999, D2000, D2001, D2002, D2003, D2004, and D505, D592, D606, D1041, D479 which some of them lean on.
   **D2005 is the NEXT job, not built here — a finding that D1991 does not reach every check is out of scope, except
   where a check this change touched reads the wrong lead.**
2. The two area pages — how the scheduler and OIL work now: `.claude/rules/decisions/scheduler.md` and
   `.claude/rules/decisions/oil.md`.
3. The review's report these fixes answer: `raptor-port/docs/superpowers/specs/2026-11-11-engine-rules-review-report.md`
   — §2 (F1–F11), §3 (Q1–Q10), §5.
4. The words changed, old and new: `raptor-port/docs/superpowers/briefs/2026-11-12-rules-check-fixes-words.md`.
5. Reference: `raptor-port/docs/engine-rules.md`, `raptor-port/docs/ui-contracts.md` (search them).

## What was built (the builder's summary — claims to test, not facts)

- **D1990** (`validate.ts` crew rest): a landing that is not a time ("TBD", blank, any word) ends the day at take-off +
  the debrief for crew rest.
- **D1991 / F1** (`faceattrs.ts` withKeptRules / ruleFor / keptRulesDiffer; `events.ts`; `validate.ts` withIssuedWeek,
  officialDiverges; `publish.ts`): a published day's crew rest and missed-brief advisory are judged with the brief lead
  it was published with; the working copy reads today's Logic setting.
- **D1993 / F2** (`validate.ts` RUNLEN; `weekctx.ts` workedSet): a row with no times counts as a day on the programme
  for days in a row.
- **D1995** (`reporting.ts` parseReportingLines; `events.ts`; `oil.ts`): every typed In-time line with a clock is an
  in-time whatever its words; the rally is the R box alone; a clockless line sets no time; an unreadable clock raises
  "reporting line N has no recognised clock. Check the time."
- **D1996** (`events.ts` a flying shift row's `flies`; `validate.ts` turns, the clash loop, the Meeting's soft branch;
  `avail.ts` slotRules for the crew list): a standby shift line that flies is checked like a sortie.
- **D1997** (`waves.ts` saDeskFlies; `events.ts`, `oil.ts`, `avail.ts`): once its wave flies, a desk made from the
  AVALON or BB template is fully checked and earns OIL by default.
- **D1999** (`oil.ts` saZeroSpanWin; `validate.ts` fltNoLenSays): a flying standby shift with START = END earns from
  its earlier B or R to its END; the amber same-time note's ending changes with it.
- **F3** (`ui/html.ts` fltNoLenShown, the week and the board): a hidden same-time warning also plains a second line's
  amber box worded the same.
- **D2001** (`validate.ts` clashItem; `warnhide.ts` hideKey; `state/view.ts` warnMuteKey; `events.ts`): a clash
  warning carries its two items by row id; a hidden clash is keyed to its man and its two items, not its words.
- **Words** (`validate.ts` OIL_STALE_DAY / OIL_STALE_HOLIDAY, `ui/DutyTplModal.tsx`, `ui/logic-html.ts`,
  `reporting.ts`): D2003, D2004, D1994, the Logic page's lines.

The builder's roll-call — every place the app draws each thing — is below. Read it for ABSENCES.

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

## How to read

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

Ask also: what does each changed path NO LONGER run that it ran before? Which readers of a changed quantity (OIL
credit, crew rest, a warning's key, who counts as on the programme) work the number out by themselves and never saw
the change? Every order across the publish boundary — before and after publishing, undo, redo, a reload.

**What is NOT a finding — do not report these:**
- This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
  **Do not report a problem whose harm exists only in data already stored when the code is already correct going
  forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
  NEW data, report it (D56).
- **A scheduler is always an admin** (D785): never a case of a scheduler who is not one.
- A Logic-page or warning wording you would merely prefer: words are his. A sentence that is UNTRUE for some settings
  or some case is a finding.
- `src/engine/` bodies are verbatim ports of an original app: style there is never a finding.

**One open question — answer it with evidence:** the test that compares this app's engine with the original's
(`raptor-port/src/engine/parity.test.ts`) already strips fields this app adds to a warning (`key`, sacrew, blank, whole,
spareAcs) from both sides before comparing; this change adds the clash warning's new `items` field to that strip list
(commit `106881aaf`). Is that right — does stripping `items` hide any difference that matters (a warning the original
gives that this app no longer gives, or the reverse), or is it only the app's own added field?

## What to hand back

- **Findings: concrete failures only** (D489): each with the case (set up through the app's own controls where you can
  name them), what the person sees, what they should see and the ruling or contract that says so, the cause (file and
  function), and **the exact fix, step by step**. Rank them. Say for each whether it is new in this change or older
  code this change has made reachable. A claim with no concrete failure is not a finding.
- **Explicit negatives:** what you checked and found sound ("I checked X and found nothing").
- **The tidiness note** — filed, never fixed: three questions of the CHANGED lines only, never of `src/engine/`: (1) a
  new responsibility put into an already busy file; (2) a feature-only branch put into a shared flow; (3) a new helper
  where one already exists. No size number.
- Plain text. Your final message is your report.
