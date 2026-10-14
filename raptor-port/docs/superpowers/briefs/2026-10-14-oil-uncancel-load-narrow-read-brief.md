# The brief for the narrow read of the fixes (14 Oct 26) — the small OIL job

A fresh Opus reader read the finished code of `[OIL-UNCANCEL-UNASKED]` (owner D816) and `[OIL-LOAD-VERSION-UNASKED]`
(owner D818) and found four faults (F1–F4). They were fixed, tests first, in ONE commit. Two of the fixes rewrite
logic at the load's door, so the order asks for a narrow read of the fix by someone who wrote neither the code nor the
fix. You are that reader. You have not seen the first reader's report, and need not.

**Read-only: change no file. Run NOTHING** — no test, no build, no server: break tests are rewriting the working files
while you read, so read only AT THE COMMIT: `git show 8fc7d5dac:<path>`, and the fix itself with
`git diff 6a37554d3 8fc7d5dac -- raptor-port/src`. Do not open `raptor-port/docs/superpowers/plans/2026-10-14-*`,
`raptor-port/docs/handpass/2026-10-14-*` or the other briefs and reports of this job.

## What each fix is meant to do

- **The load counts an input of several days (D818 — "the app says how many of the inputs it put back still need an
  OIL answer and opens that day's one list of them — the load itself is not held").** An input of several days has ONE
  row, on its first day; the day it has no OIL answer for can be another of its days. Before: counted and listed on the
  loaded day only. Now (`ui/interactions.ts`, the `data-restore` door): the open OIL questions are read over every day
  that the inputs covering the loaded day span (`lo`..`hi`), before and after the load; an input standing on the day
  after the load, open now, and not standing-and-open before, is counted; the list opens for the days THOSE inputs
  need an answer for (`from` = the first, `to` = the last).
- **The list's heading:** "Public holiday · <name>" only where every one of those days is a public holiday of one
  name — the holiday's OWN name through `leavewar/sync.ts holidayOwnName` (now exported), so a holiday stored under the
  preset's word ("PH") is headed "Public holiday" alone; `plain` (no holiday line at all) where any of the days is not
  a public holiday.
- **The list's foot (`ui/OilDayList.tsx`):** "What is left goes to the schedulers’ bells" is printed only where a
  scheduler's holiday line is live for the reader on one of the days still unanswered (`state/notices.ts
  holidayLineOn`, `state/perms.ts me`) — the list is now also opened on a plain weekend and on a holiday that told no
  scheduler, where no bell carries a line.
- **The flash after "not answered" (`ui/reqdoor.ts rowMark`, `ui/oilwait.ts oilBarAgain`):** the un-cancel's wait
  names its row's button by POSITION (the board's buttons are addressed so); the position is now found when the
  question is put (`placeOf`, from where the input stands), and "Answer OIL" no longer carries the old place into the
  new wait for these two kinds (`uncx`, `uninfo`) — other kinds keep the carry-over they were given on 13 Oct 26.

## What to look for

Read the changed lines and enough around them to judge. For each fix: does it do what it says, for every input the
old code handled (one day; several days; a week's edge — an input whose days run into a week that is not loaded; an
input under Unavailable, which has no row; a cancelled or information-only one; one deleted or moved since; one a load
must leave as filed)? Can the wider run (`lo`..`hi`) count an input that was NOT put back by this load, or miss one
that was? Can `days` be empty while `need` is not? Can the list open for a run so wide it holds days nobody asked
about — and is that harmful or only wide? Does `belled` hide the sentence anywhere it was TRUE before (the holiday's
own save; the bell's line tapped)? Does `placeOf` return a place for an input whose row is on a day other than the
board's, or none at all — and what then flashes? Did any OTHER kind of waiting change lose a place it needed?

This is OIL — earned leave, banked time off (never pay). Rank highest anything that makes the count wrong, opens the
list for the wrong days, or leaves an unanswered input with no sign at all.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database
> step. **Do not report a problem whose harm exists only in data already stored when the code is already correct
> going forward.** If the app would do it again to NEW data, report it.

**What a finding is:** a concrete failure — the setup, the press, what the app then shows or saves, what it should —
its cause (file and line at the commit) and its exact fix, step by step. Give your explicit negatives too. Return the
whole report as your final message, and save the same text to the scratch file the host names.
