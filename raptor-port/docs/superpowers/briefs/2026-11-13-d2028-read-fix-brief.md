# D2028 — a narrow, blind read of one fix (13 Nov 26)

You are a fresh reader. You did not write this code and you have seen no other reader's report and no walk's report.
Do not open any file under `raptor-port/docs/superpowers/briefs/` whose name contains `d2028-read-opus`,
`d2028-read-astra` or `d2028-walk`, nor `raptor-port/docs/handpass/2026-11-13-rules-check-small-batch.md` — they hold
other readers' conclusions and would spoil the read.

## What to read

Repo: `C:\Users\User\projects\Raptor`, branch `claude/rules-check-small-batch` (already checked out; change no branch).

- The fix: `git diff 7fef5f352 22e4cb2b1 -- raptor-port/src/engine` (three files: `publish.ts`, `validate.ts`,
  `hooks.ts`).
- Its tests: `git diff 7fef5f352 22e4cb2b1 -- raptor-port/src/published-day-open-end.test.ts raptor-port/src/leavewar/published-open-end-oil.test.ts`.
- The build it sits on (D2028 itself): `git diff f80b5804b 7fef5f352 -- raptor-port/src` — for context only; it has
  been read already.
- The callers of what changed: `dayDeltaIn`, `dayDeltaCore`, `dayDelta`, `dayPendingItemsIn`, `oilDelta`, `oilNowAs`,
  `daySnap` (all `raptor-port/src/engine/publish.ts`); `untouchedKept`, `faceWaits` and the `validate()` that calls them
  (`raptor-port/src/engine/validate.ts`); `keepRulesOn`, `keptRulesOf`, `keptRulesDiffer`, `withDayRules`
  (`raptor-port/src/engine/faceattrs.ts`); `oilEvidence` (`raptor-port/src/engine/oilev.ts`); `pendItemWords` and
  `crowdChange` (`raptor-port/src/ui/pendlist.ts`).
- Read source with the shell (`sed -n`, `grep -n`) rather than whole-file reads; the engine files are long, one-line
  style on purpose — the style is not a finding.

## The rules the code must keep (the owner's rulings — open a full row with
`grep -h '^| D2028 |' .claude/decisions-full/*.md`, the shell)

- **D2028:** a published day's row with a start and no end keeps the assumed length it was published under; a change
  of that Logic setting reaches the day only from its next amendment and raises no pending mark by itself. (The
  builder's reading, told to the owner: the same holds for the sim length and the step / dekit times.)
- **D2013:** once anything waits on a published day, its working copy shows the next amendment checked under today's
  settings; the published face (View-only) keeps what went out.
- **D44, D45:** who stood behind a placeholder (ALL AVAIL / ALL) is frozen at publication; a later change to that
  crowd shows as pending, and anything pending takes the four sign-offs down. Nothing on a published schedule may
  change without the scheduler acknowledging it.
- **D2005, D2014:** a published day's checks and its OIL are judged by the Logic settings it was published under,
  until its next amendment.
- **D142, D48:** a day's OIL comes from its latest published version.

## What the fix claims to do

On a published day whose kept Logic settings differ from today's:
- while nothing else waits, the crowd behind a placeholder is counted under the kept settings (no pending mark from
  the Logic change alone);
- once anything else waits — a change to the day, a filing, a hidden warning, a person's attributes, the printed brief
  lead, an OIL decision, or a crowd change that is real under today's settings — the pending comparison, the pending
  list's words, the screen and the amendment that is then published all count the crowd under today's settings.

## The questions — answer each, with a concrete case where the answer is no

1. Is there any state of a published day in which the pending comparison (`dayDeltaIn` / `dayDelta`), the pending
   list (`dayPendingItemsIn`, and its words in `ui/pendlist.ts`), the working copy the screen draws (the settings
   `validate()` lays on the day through `untouchedKept`) and the snapshot the next publish freezes (`daySnap`) count
   the crowd under DIFFERENT settings from one another? Name the state and the two that differ.
2. `faceWaits` was moved out of `untouchedKept`. Does `untouchedKept` decide exactly as it did before the move, for
   every input? Does `crowdSide`'s "other" mean the same thing as "`untouchedKept` did not lay the kept settings on
   this day"? Find a state where one says "something waits" and the other says "nothing waits".
3. Can the pending count flicker — one answer on one `validate()` and another on the next, with nothing changed
   between? Look at the memo on `dayDeltaCore`, at what `crowdSide` reads that the memo's key does not cover
   (`HOOKS.faceWaits`, the laid-on settings, people's attributes, hidden warnings), and at the order in which
   `validate()` lays settings and the comparison is asked.
4. Can the new code call itself (a cycle through `HOOKS.faceWaits`, `dayDeltaCore`, `validate`), or be asked before
   `HOOKS.faceWaits` is set (tests, the first load, a saved plan — `sc!==SCHED`)? What does it answer then, and is
   that answer safe?
5. A saved plan or a loaded older version (`sc` not the live schedule): which settings does the comparison use, and
   does it agree with what that plan would publish?
6. The last branch of `crowdSide` (falls back to the kept comparison when today's settings give the issued crowds
   back and nothing else waits) has no test. Is it reachable? Is its answer right? Write the test if you can reach it.
7. The cost: `oilDelta` may now run twice a day a comparison. On the paths that run per keystroke or per drag (the
   week's draw, the board's draw, the day's count), is anything now noticeably slower for a week of seven published
   days? A reasoned answer; no timing rig needed.
8. Does any OTHER reader of a published day's crowd or OIL — the Leave War's OIL pass (`runOilPass`), the OIL tracker,
   Insights, the print / CSV, the ALL AVAIL window's title and its earning half, OIL Earn — now disagree with the
   pending list about which settings it counts under, in the "something else waits" state?
9. The tests: does each new test fail on the code before the fix for the reason its name gives (check out the three
   engine files at `7fef5f352` into a scratch copy or use `git stash`-free means — do NOT leave the repo changed), and
   is any assertion weaker than its name claims?

## What is not a finding

- A problem that exists only in data already stored, where the code is right going forward (the whole store is demo
  data, cleared before the database step — D56).
- A scheduler who is not an admin (D785: a scheduler is always an admin).
- The one-line engine style, `:any`, missing types.
- That a published day's OIL keeps its settings at all (D2005, D2014 — ruled).

## How to work

- Read only. Change no file in the repo; commit nothing; switch no branch. Proof tests go in
  `C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\adf8ff36-c578-43b7-9ec7-e7038fb9df15\scratchpad\fix-read\`
  — to run one, copy it into `raptor-port/src/` under a name starting `zz-fixread-`, run
  `cd "C:/Users/User/projects/Raptor/raptor-port" && npx vitest run src/zz-fixread-<name>.test.ts`, then DELETE the
  copy and check `git status --short --untracked-files=all raptor-port/src` shows none of yours left.
- Do NOT run `npm run build`, any Playwright / browser test, or the full unit suite: a walk is driving the served
  build and a build would swap it under the walker. One vitest file at a time is fine.
- Every claim is written as a failing test before it counts. A claim you could not reproduce is reported as
  "not reproduced", with why.
- Model the existing tests for set-up: `raptor-port/src/published-day-open-end.test.ts` (weekday, a stand-in crowd)
  and `raptor-port/src/leavewar/published-open-end-oil.test.ts` (the seed Saturday through the real stores).

## The report

Return it as your final message, in this shape:
- one headline line: how many findings, the worst in a sentence;
- per finding: severity (P1 a wrong published record or wrong OIL; P2 a wrong or missing pending line / count;
  P3 words or tidiness), the concrete case step by step, the cause with its place in the code, the exact fix you
  recommend step by step, and the proof test's path with its red output's last lines;
- the nine questions, each answered in a line or two, "no finding" said plainly where that is the answer;
- what you did not look at.
