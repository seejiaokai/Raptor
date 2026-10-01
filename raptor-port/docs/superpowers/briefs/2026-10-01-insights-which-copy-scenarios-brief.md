# Scenario-design brief — [INSIGHTS-WHICH-COPY] which schedule the Insights window counts (D477, D478) — the WALK check — 1 Oct 26

You are designing TEST SCENARIOS for a walk of the running app. You are not reviewing code for style and you are not
asked whether the code is "clean". Work READ-ONLY. Report as your final message, in the format at the foot.

**The build** is on branch `claude/insights-which-copy` (commit b739c54c), under `raptor-port/src`: `engine/insights.ts`
(`computeInsights`), `engine/validate.ts` (`issuedWorld`, `officialFor`, `faceWarn`), `ui/Modals.tsx` (`insightsHTML`,
`InsightsModal`); its tests `ui/insights-published.test.tsx`. **What it promises** is the backlog item
`OUTSTANDING.md` `[INSIGHTS-WHICH-COPY]` and the screen contract `raptor-port/docs/ui-contracts.md` §Week Insights.
You found the gap yourself: `raptor-port/docs/superpowers/briefs/2026-10-01-warn-hide-kept-final-read-astra.md`, finding 1
— but note the owner then ruled DIFFERENTLY from your proposed fix (below).
**The owner's rulings**, from the live files: `.claude/rules/decisions/scheduler.md` (one line each) and the full rows in
`.claude/decisions-full/scheduler.md` — `grep -h '^| D478 |' .claude/decisions-full/*.md` (D477, D478; and D469, D471,
D472, D475, D45, D97, D98, D101, D103, D177–D179, D183–D185, D187). Also `.claude/rules/decisions/how-we-work.md` (D56),
`.claude/rules/raptor-executor.md`, and `raptor-port/docs/bug-check-order.md` §2b, §6, §7.

**In one paragraph, what the app should now do.** The Insights window (the top bar's "Insights" button on a desktop; the
drawer's "Week insights" on a phone) opens over every page, for every signed-in person. Day by day it counts that day's
LATEST PUBLISHED version — the Original, or the latest amendment (AL1, AL2 …) — and the working copy ONLY for a day not
yet published. Changes waiting on a published day (a seat, a cancelled line, a time, a leave or request filed since, a
warning hidden since) move NOTHING in the window until they go out as an amendment; then every figure moves together.
A day not yet published moves at once. It is the same on EVERY page — Edit Schedule and the Scheduler Board included
(D478 set aside D477's "the schedule the page is showing") — and a published day switched to "working draft" on
View-only Sched is still counted as published. It holds for EVERY figure: the four tiles (Sorties, Formations, Aircrew
flying, the issues tile with its "N warning"), "Flying load", "Work hours", "Not on the flying programme", "Conflicts by
type", "By day". A hidden warning is not counted (D472), by the hides that VERSION went out with (D477: 4 issues with 1
hidden read 3).

## What to do

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

Aim for 14–20 scenarios a person (or a scripted browser) can carry out through the app's OWN controls, each one checkable
on screen by reading the Insights window beside the day it describes. Cover, at least: every FIGURE of the window; every
KIND of waiting change on a published day (a man taken off or put on a flying seat, a line or formation cancelled, a
take-off time moved so a man's work hours change, a duty or ground row added, a leave filed on the Inputs page, a
warning hidden, a warning that stays LIVE on a published face such as a crew-rest breach, D183–D185); every PAGE the
window opens over (View-only Sched, Edit Schedule, the Scheduler Board, Inputs, Quals, the Leave War, the Tracker,
Admin) and both ways in (top bar, the phone's drawer); both WIDTHS; every ROLE (admin, member, the admin in his member
view, a guest if he can open it); every ORDER across the publish line (publish → change → amend; change → publish;
Unpublish; Load an older version onto the working copy; Undo / Redo of a waiting change; Undo of a publish); a week with
some days published and some not, where a change on a DRAFT day raises or clears a warning on its PUBLISHED neighbour
(crew rest across midnight); a 👁 look at an older version open on Edit Schedule while the window is opened; a saved plan
switched in on a published day; a second week (the window follows the week on screen); a reload at each stage; and the
things that must NOT change (the day's own bar and list, the ⓘ day popup, the pending counts, print / CSV, the Leave
War and OIL figures).

**And this, in the same breath — WHAT IS NOT A FINDING (owner, D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

## How to report

- A numbered list, most likely to fail FIRST. Each: a one-line title; the surface and the rule it tests (D number);
  SETUP (in the app's own words — which day, which line, which button); ACTION; EXPECTED (what the window says, and
  what the day beside it says); and THE OBSERVATION THAT WOULD DISPROVE IT.
- Then: any place you believe the build is MISSING a call site, with the file and function, and how a person would see it.
- Then: explicit negatives — surfaces you checked and believe are wired.
