# D2028 — the scenario brief for Astra (13 Nov 26, chat 68)

You are Astra, the standing reviewer, asked for SCENARIO DESIGN, read only: change no file, run no test that writes.
You did not build this. Speak plainly in the report (`.claude/rules/plain-language.md` is for the owner; your report is
for the host, so file and function names are welcome).

## Read first
- `AGENTS.md`, then `.claude/rules/bug-check.md` and `raptor-port/docs/bug-check-order.md` §4 (the finder wording, what
  is not a finding — a problem that lives only in data already stored is NOT a finding, D56) and §2a's "Rules and logic" row.
- The rulings, full rows: `grep -h '^| D2028 |\|^| D2005 |\|^| D2013 |\|^| D2014 |\|^| D360 |\|^| D592 |\|^| D44 |\|^| D45 |\|^| D98 |\|^| D103 |\|^| D482 |' .claude/decisions-full/*.md .claude/rules/decisions/*.md`
- The area pages: `.claude/rules/decisions/scheduler.md`, `.claude/rules/decisions/oil.md`.
- The plan and what the code did before: `raptor-port/docs/superpowers/plans/2026-11-13-d2028-open-end-published-plan.md`.
- `raptor-port/docs/engine-rules.md` §Publishing.

## The change (commit `bbc24acbc` on `claude/rules-check-small-batch`; `git show bbc24acbc --stat`)
His ruling D2028: a published day's row with a start and no end keeps the assumed length it was published under; a
change to that Logic setting ("Any other row", and by the agent's reading "A sim") reaches the day only from its next
amendment and raises no pending mark. Built as: the working copy's OIL block counts the crowd behind every placeholder
under the settings the issued version kept wherever it is COMPARED with what went out (`publish.ts oilDelta`,
`oilNowAs`), and under the settings the validator laid on the day while nothing waits on it (`oilev.ts oilEvidence`,
`faceattrs.ts keptRulesOf`); a version being frozen counts under today's; the ALL AVAIL window's title reads the
lengths through `withShownRules` (`ui/oilmode.ts oilItemLabel`). The same edit covers the step and dekit times, which
moved a published day's crowd the same way (D2005's ground). OIL's own report lead and debrief are left out of the
overlay (D592 (4)).

## What is asked
Not "is the code right" — what is MISSING. Design the scenarios a walker should drive in the running app and the
tests that should exist, for this change, naming for each: the starting state, each press, and what the person must
SEE (EXPECTED), with the ruling it rests on. Look hardest for:
1. A state or an order of presses in which a published day's open-ended row shows a length, a count or a crowd that
   disagrees with another place on the same screen, or with View-only Sched, or with the pending count.
2. A way a Logic change alone still makes a published day read pending, or drops a sign-off — any setting, any row
   kind (ground, Common Programme, duty desk, sim, a request's row, the extras line), an earning day and a weekday.
3. A way a REAL change behind a placeholder is now hidden (must still read pending — D44, D45).
4. The edges: Unpublish and publish again; an older version looked at; "Load onto working copy"; a saved plan switched
   in; Undo and Redo across the Logic change and across a publish; a reload; the week changed and back; the
   neighbouring week's Monday; a day published before this build (no kept settings — today's, D56, not a finding).
5. An earning day (Saturday, a holiday): does anyone's OIL, or the "would earn" warnings, read differently between
   Edit Schedule, View-only Sched and the Leave War after a Logic change, with nothing waiting and with something waiting?
6. `validate.ts` near line 1543 lifts the settings overlay for OIL's earning test (`withLiveRules`); the fresh block
   computed inside it now counts an untouched published day's crowd under the kept settings. Name a scenario where that
   matters, or say why none can.
7. The surfaces a roll-call should list that the plan's draft table misses.

A finding needs a concrete failure, its cause and its fix (D489). Say what you could not check. Return the whole
report as your final message.
