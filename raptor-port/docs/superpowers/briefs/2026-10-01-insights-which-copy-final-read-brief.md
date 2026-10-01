# Final-read brief — [INSIGHTS-WHICH-COPY] which schedule the Insights window counts (D477, D478) — 1 Oct 26

You are the independent final reader of FINISHED code. You did not write it. Work READ-ONLY; run nothing that writes.
Report as your final message, in the format at the foot.

**The change** is `git diff origin/main...claude/insights-which-copy -- raptor-port/src` (the code commit is `b739c54c`):
`raptor-port/src/engine/validate.ts` (`officialFor`, `issuedWorld`), `raptor-port/src/engine/insights.ts`
(`computeInsights`), `raptor-port/src/ui/Modals.tsx` (`insightsHTML`), and the tests
`raptor-port/src/ui/insights-published.test.tsx`.
**What it promises:** `raptor-port/docs/ui-contracts.md` §Week Insights; the rule IN1
(`raptor-port/docs/superpowers/specs/2026-10-01-insights-which-copy-behaviour-register.md`); the backlog item
`OUTSTANDING.md` `[INSIGHTS-WHICH-COPY]`.
**The owner's rulings**, from the live files: `.claude/rules/decisions/scheduler.md` (one line each) and the full rows —
`grep -h '^| D478 |' .claude/decisions-full/*.md` (D477, D478; and D469, D471, D472, D45, D98, D101, D103, D177–D179,
D183–D187). Also `.claude/rules/decisions/how-we-work.md` (D56), `.claude/rules/raptor-executor.md` and
`raptor-port/CLAUDE.md` (§Architecture rules, §Coding conventions — `src/engine/` keeps its compressed style on purpose).
**THE EVIDENCE SHEET — read it first:** `raptor-port/docs/handpass/2026-10-01-insights-which-copy-check.md` — the tier, the
roll-call (§4), your own 19 scenarios as walked by two walkers (§5), the three things the walk found and how each was
disposed (§5.2), the break tests (§6), what was NOT walked (§8).

## What to do

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

Read for WRONG lines and for MISSING ones. In particular:
1. `issuedWorld()` answers for "the last validate()". Is there any path by which `ISS_DAYS` / `ISS_EVD` are stale or belong
   to another week, another official pass, or a pass run inside a snapshot swap (`withDaySnap`, `withChipWorld`, a version
   look, a week load, `withIssuedWeek` re-entered)? When the official pass is the alias, are the working `DAYS` / `EVD`
   really the issued content for every published day — is there any pending change `officialDiverges()` does not see that
   still alters a figure of the window (a pending hide is meant to be handled by `faceWarn` alone)?
2. A protected / unreadable published day is stripped in the official pass: the window then counts it as empty. Is that
   reachable with NEW data?
3. Does `computeInsights` still read anything from the working copy — `PEOPLE` aside (a rename is a label)?
4. `faceWarn()` for a draft day beside published ones: the warnings come from the official pass. Do the draft day's
   COUNTS (from `ISS_DAYS[di]`, the working day) and its warnings describe the same day?
5. Any other reader that shows a week total and should agree with the window, and does not.
6. The roll-call in the sheet's §4: any door, page, role or figure missing from it.
7. The three dispositions in §5.2 — say plainly if you disagree with any, and why.

**WHAT IS NOT A FINDING (owner, D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

## How to report
- A verdict line: APPROVE / REVISE / BLOCKED.
- Findings, most serious first. Each: severity; the file and function; how a person would SEE it (setup, action, expected,
  observed); whether it is NEW with this branch or older (compare with `origin/main`); and **exact, step-by-step fix
  instructions** — not a direction.
- Explicit negatives: what you checked and found sound ("I checked X and found nothing").
