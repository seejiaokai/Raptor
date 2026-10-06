# The final code read — the crew-rest rule and a line with no times (`[REST-BLANK-LINE]`, D602) — 6 Oct 26

You are one of TWO independent readers of a finished change (bug-check order §4 rank 2, §4a; D590, D601 — Astra reviews
what Opus wrote and Sol 6.1 reads second, each blind to the other). You did not write it. Work READ-ONLY: change
nothing, build nothing, start no server; you may run a single test file to settle a doubt
(`cd raptor-port && npx vitest run src/engine/restblank.test.ts`) and nothing heavier — the gates are the host's, under
the PC's one lock. Never read the other reader's report; never approve — your report is evidence, the owner approves.

**The change:** branch `claude/rest-blank-line` against `main` — `git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e raptor-port/playwright.config.ts raptor-port/docs/engine-rules.md`.
App code in two files: `raptor-port/src/engine/validate.ts` (the crew-rest pass `crewRestDay` — yesterday's end, the
instructed report `insOf`, `legs` / `noms`, the binding leg, the wording — and the same-day turn pairing) and
`raptor-port/src/ui/logic-html.ts` (one new row on the Logic page). Tests: `raptor-port/src/engine/restblank.test.ts`,
`raptor-port/e2e/restblank.spec.ts`.

**Read first, from the live files:**
- the evidence sheet, WITH ITS ROLL-CALL — you are asked for absences against it:
  `raptor-port/docs/handpass/2026-10-06-rest-blank-line.md` (the fault on screen before and after, the walk's table,
  the break tests, what was NOT walked, what was filed and why);
- the scenario designer's report — its §3 says what a naive fix gets wrong, its §4 lists the siblings:
  `raptor-port/docs/superpowers/briefs/2026-10-06-rest-blank-line-scenarios-astra.md`;
- the fault as filed (`OUTSTANDING.md` `[REST-BLANK-LINE]`) and the first reader's proposed fix
  (`raptor-port/docs/handpass/parts/stack-read2-AB.md` F1 — NOT what was built: the build does not skip a leg for
  lacking a take-off, it takes each quantity only from the times that exist);
- the owner's rulings — one line each in `.claude/rules/decisions/scheduler.md`, `oil.md`, `how-we-work.md`, each
  ruling's full row by `grep -h '^| D185 |' .claude/decisions-full/*.md`: **D602**; **D183, D184, D185, D188** (a
  crew-rest breach, its ring and the dotted mark stay LIVE on a published day's face, never pending, never touching the
  sign-offs); **D179**; **D469, D472** (a hidden warning is keyed by its words); **D503, D505, D506, D509**; **D56**;
  and `.claude/rules/decisions/scheduler.md` §Settled before this list (the SC in-time; "The flagging engine reads
  across week boundaries"; "A new flying line comes up blank");
- `raptor-port/docs/engine-rules.md` §Crew rest (the new bullet states the rule as built), `raptor-port/CLAUDE.md`
  §Architecture rules and §Coding conventions (`src/engine/` bodies are verbatim ports: a diff there is the behaviour
  change and nothing else), "The rules-engine robustness doctrine" (full text: `raptor-port/docs/guide-full.md`);
- `.claude/rules/raptor-executor.md`.

## What the build claims — attack each

1. **With every time present the arithmetic is value-for-value what it was** (the reference parity, `node
   reference/tfin.js` 728/0 and `engine/parity.test.ts`, holds). Is there ANY input with all times present where
   `insOf`, `legs`, `noms`, `bl`, the three sentences or the turn pairing now differ from `main`? Think of: an in-time
   that is `null` against one that is not; a negative (previous-day) in-time or brief; an SC shift with and without a
   typed B; `Infinity` as the old sentinel; a leg whose `ld` is finite and `to` is not, and the reverse; a wave with a
   malformed reporting line.
2. **A line with nothing to measure neither raises a breach nor hides one** — today, yesterday, in either drawn order,
   through all three callers of the one body: the day loop, the phantom next-Monday pass, and the crew picker's pre-drop
   probe (`restIfPlaced`, which clones a sibling leg — including a sibling with no times).
3. **An instruction that exists is still read** — a typed Brief, the wave's In-time / Rally, an SC line's typed B —
   and nothing is invented from a missing one (no nominal report, no step, no dashed "sanctioned" ring, no "NaN" or
   "Infinity" in any sentence the three codes CREW_REST / CREW_TIGHT / TURN can print).
4. **A man whose only line is blank still flies that day**: an earlier commitment inside his rest binds the breach
   (`evBound` with `legs` empty, `bl` falling back to his first leg for the anchor key). Is the fallback anchor ever
   wrong or undefined? Does `first`, `leaveBy`, the trace on the day before, the `probe.hit` payload stay finite?
5. **What was left as it was**: `dturns` and the DT chip (a timeless leg still counts); `REST[di]`; the 7-day run; the
   long day (`workSpan`); the leave / downchit loops; AVALON / BB; the hidden-warning key (the words of an existing
   breach do not change when a blank line is added).
6. **The tests prove what they say.** `restblank.test.ts` plants the blank line in `board.ts addLine`'s own shape; the
   browser test drives the real controls. Is any assertion satisfied for the wrong reason? Is there a case in the
   scenario list (§2 of the Astra file) that no test and no walk row covers?

Then, as the method requires:

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

**Already found and FILED, not fixed here — do not report them again unless the build made one worse** (each is in
`OUTSTANDING.md`): `[BLANK-TIMES-ABSENCE]` (a man on all-day leave or a downchit seated on a line or row with no times
gets no line in the warning list until a time is typed), `[SC-BLANK-SHIFT-QUAL]` (an SC line with its shift times
cleared prints "(NaN:NaN–NaN:NaN)" in its currency warning), and whatever else the sheet's "Filed" section names.

**A claim is a finding only with a concrete failure, its cause and its fix (D489).** For each finding give: the exact
steps or inputs, what happens, what should, the lines, whether it is the same on `main` (compare before calling
anything new), and **exact, step-by-step fix instructions** — not a direction. Give **explicit negatives** ("I checked X
and found nothing"). Say what you did not read and how sure you are.

## One small meaning read (D138)

`.claude/rules/decisions/how-we-work.md`, the short line of **D602**, was reworded in this change after the scenario
designer found it had lost a condition of its full row (`grep -h '^| D602 |' .claude/decisions-full/*.md`). Does the
short line as it now stands state the rule its full row states — nothing added, nothing lost?

## Report format

1. Verdict in one line: PASS / CHANGES REQUIRED. 2. Findings, most serious first, each in the form above. 3. Absences
against the roll-call. 4. The six claims, each: holds / does not, with the line. 5. The D602 meaning read. 6. Explicit
negatives; what you did not read.
