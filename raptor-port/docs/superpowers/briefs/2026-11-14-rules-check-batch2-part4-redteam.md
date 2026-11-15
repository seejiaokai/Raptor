# Red team of a plan's part 4 (D2014) — the brief (chat 77, 14 Nov 26)

The same brief goes to two readers, each blind to the other: Astra (Codex) and a fresh Opus reader. Read-only: change
no file, run no command that writes. Return one report.

## What you are reading

The plan `raptor-port/docs/superpowers/plans/2026-11-14-rules-check-batch2-plan.md` — **its part 4 only**: the table's
row 4, the section "Part 4, how it works today and the design", and the question for the owner under it. Parts 1–3 and 5
are not yours, except where part 4 changes what part 3's words must say.

The app is a flying-schedule planner. A weekend or holiday day that is published earns OIL (time off banked, never
money) for the people who work it — a full day or half a day, by how long their day ran against the Logic page's
"Full day of OIL" setting. A published day is changed only by an amendment; anything waiting on it reads "N pending",
and four sign-offs on it fall when what they signed changes (D103).

## The owner's rulings to read first — full rows, by the shell (the Grep tool hides long rows)

`grep -h '^| D2014 |\|^| D592 |\|^| D2005 |\|^| D2013 |\|^| D48 |\|^| D103 |\|^| D186 |\|^| D142 |' .claude/decisions-full/*.md`

Then the area pages that load with this code: `.claude/rules/decisions/scheduler.md`, `.claude/rules/decisions/oil.md`
(and their full rows, as above, for any line you rely on). The project guide `raptor-port/CLAUDE.md`, and
`.claude/rules/raptor-executor.md`. Behaviour as documented: `raptor-port/docs/engine-rules.md`, the publishing and OIL
sections (search "Which published version pays", "pending", "OIL").

## The code the design touches (read what you need; the plan names functions and rough lines)

`raptor-port/src/engine/oilev.ts`, `src/engine/publish.ts` (`oilRuleDelta`, `dayDeltaIn`, `dayDeltaCore`, `dayDelta`,
`oilRvBoundOk`), `src/engine/validate.ts` (`untouchedKept`), `src/engine/faceattrs.ts` (`KEPT_RULE_KEYS`),
`src/engine/oil.ts`, `src/engine/rules.ts`, `src/ui/pendlist.ts` (`oilRuleWords`), `src/leavewar/sync.ts` (~1838),
and wherever the published face, OIL Earn, the sign-off line, the changes window and print/export read a published
day's OIL. Tests: `src/**/oil*.test.ts`, `published-day-logic-reads.test.ts`, `oilworkstart*.test.ts`.

## What to look for — what is missing, not only what is wrong

1. **The reading of the rulings.** Does the design do what D2014 says, and is the plan right that D2014 sets aside D592
   for the full-day line only? D2014's row says, as the agent's reading, "whether the day then reads pending follows
   D592". The plan removes the pending entry for a full-day-only change. Is that a faithful reading, a contradiction,
   or a question that must go to the owner before building? Say which, and why, from the rows' own words.
2. **Every place a published day's OIL shows or is decided** — the published face, OIL Earn on the working copy and
   on View-only, the Leave War credit and its grid, the OIL tracker, the pending list and its count, the sign-off line
   and its binding, the changes window, the publish button, print and export, Unpublish then Publish AL1, a first
   publish, undo/redo of the Logic change, a reload. For each: what does it show after a full-day-only change under
   the design, and is that right? Name any the plan does not cover.
3. **The "something else waits" rule.** Its pieces, the recursion trap the plan names, `dayDeltaCore` versus
   `dayDelta`, the validator never depending on its own output, and the live block's `rv` hook (its cheap test, its
   re-entry guard). Find a case where the rule gives the wrong answer — e.g. something else waits and is then undone;
   a warning-only or hide-only change; the full-day line changed twice (there and back); a change to lead/debrief and
   full-day together; a published day with no earning man; a day published before the kept `rv` existed.
4. **The sign-offs and the pending count** across the change and its undo — do they fall and stand again exactly when
   they should (D103, D592 reading (9))?
5. **Anything the plan's checks would not catch** — a scenario its tests or walk would miss.

## Rules for a finding

- A claim is a finding only with a concrete failure (the steps, what shows, what should), its cause in the code or the
  plan, and its exact fix to the plan (D489). Mark each BLOCKING (the plan must change before building), CHANGE (fold
  into the build) or NOTE.
- **Not a finding:** a problem that lives only in data already stored, where the code is right going forward — the
  whole store is demo data, cleared before the database step (D56).
- A scheduler is always an admin; a scheduler who is not one is not a finding (D785).
- Do not review parts 1–3 or 5, code style, or the engine's compressed one-line style (verbatim port; diffs there are
  the behaviour change only).

## The report

A verdict first (APPROVE / REVISE / BLOCKED), then the findings, most serious first, each with its mark, steps, cause and
fix. Then, separately, your answer to question 1 in a few lines.
