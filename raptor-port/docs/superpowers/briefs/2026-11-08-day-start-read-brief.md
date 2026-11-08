# Where a day with nothing entered starts (D1786) — the code readers' brief (8 Nov 26, chat 6)

One brief, the same for every reader (D790): Astra, Sol 6.1 (D1743, until Mon 9 Nov 26 19:00) and a fresh, blind Opus
reader. Read-only: change no file, commit nothing, push nothing. Do not open any other reader's report or any walk
evidence for this job (`raptor-port/docs/handpass/2026-11-08-day-start*`).

## The change

Branch `claude/pr-day-start-7b064c`, pull request 678; the diff is `git diff origin/main...claude/pr-day-start-7b064c`.
The owner's ruling D1786 (8 Nov 26): **a flyer's line with no in-time or rally entered starts his day at take-off less
the default rally (`VCONF.reportLead`, 3h shipped) for his long day and his Insights hours, as it already does for his
OIL — one start, not the step — and the Logic page says so.** Open the full rows first:
`grep -h '^| D1786 |\|^| D1032 |\|^| D592 |\|^| D179 |\|^| D482 |\|^| D36 |' .claude/decisions-full/*.md`.
Background: `raptor-port/docs/img/handpass/2026-11-07-pictures-round/notes-sched.md` Q3 (§(d) the drawn words, §(g)
for the build); `raptor-port/docs/engine-rules.md` §Where a day with nothing entered starts (D1786) — the build's own
account; `.claude/rules/decisions/scheduler.md` (the area's rulings); `raptor-port/CLAUDE.md` §The rules-engine
robustness doctrine (its five gotcha families).

What was built: `raptor-port/src/engine/events.ts` gives a sortie's EVENT (`day.events`, read into `EVD`) only the report
entered for it — `report: shiftLine ? report : intime` — so `validate.ts workSpan` (the one definition read by the
long-day note and Insights' work hours) falls to its own `o.to - VCONF.reportLead`. `day.fly` is unchanged
(report-or-step); a shift is unchanged. The Logic page's row (`src/ui/logic-html.ts`, reportLead) takes the drawn words.
Tests: `src/engine/daystart-default-rally.test.ts`, `src/ui/logic.test.tsx`.

## What to look for — ask what is MISSING, not only what is wrong

1. **Every reader of a sortie event's `report`** (anything reading `EVD`, `day.events`, `dayEvents`, the cross-week
   seeds in `weekctx.ts`, `issuedWorld`, the probe bridge, avail.ts, crowd checks, exports): does any of them now meet
   `null` where it needed a number, or change behaviour it should not (crew rest, the tight advisory, the ALL AVAIL
   availability window — step to dekit, D36 — the SANS checks, OIL, the in-time-window advisory)?
2. **One start:** for every input shape, does the work span now start exactly where OIL's `oil.ts fltOilWin` does? Look
   for a case where they still differ (a typed RALLY line, a formation-specific in-time, an unreadable clock, a clock
   the evening before, a take-off after midnight, no landing, the same take-off and landing, a lateShow remark, a
   standby row that flies, the Logic value below the step or zero).
3. **The five gotcha families** (people not following the format, missing input, user errors, deletions and edits
   from another page — the Logic page changing the default rally — and sync between copies: the week, the board,
   View-only Sched, Insights, the long-day chip and ring, print/CSV, the next-week peek, the published face).
4. **A published day (D179, D482):** the long-day note is frozen on the issued face (`LIVE_ON_FACE` does not hold it);
   Insights reads `issuedWorld` by today's code. Is there a place where a published day now moves, reads pending, loses
   its sign-offs, or shows two different hours for one man, that the rulings do not allow?
5. **Parity with the original** (`src/engine/parity.test.ts`, `src/testing/refwin.ts`): the original starts such a day
   at the step; the seed's five days have no sortie with nothing entered. Is anything relying on the two engines
   agreeing on this that the tests would not catch?
6. **The Logic page's words:** true for every value of the settings (D932, D933)? Anything else on the Logic page, in
   Help, or in a code comment that still says the long day or the hours start at the step?

## What is not a finding (D56)

A problem that lives only in data already stored, where the code is already correct going forward, is not a finding —
the whole store is demo data, cleared before the database step. A hidden long-day note whose words change with its new
start showing again is the hide rule working as built, not a finding.

## The report

Each finding: **severity · where (file and function) · a concrete failure (the input and what goes wrong) · its cause ·
the exact fix, step by step** (a finding without a concrete failure is not one). Then what you checked and found whole.
End with "Read-only review completed" and "Rulings: none this session".
