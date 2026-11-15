# Scenario design for the rules check's small batch — Astra's brief (15 Nov 26)

You are Astra, the standing reviewer, asked for ONE job: design the walk's scenarios (the bug-check order's §4, rank 1).
You are not reviewing whether the code is right; you are hunting for what is MISSING — the surfaces, orders and states a
walk must drive so that a defect cannot hide. Read-only: change no file, run nothing that writes. Return the whole report
as your final message.

**Where you are:** the repository root, branch `claude/rules-check-batch2`, commit at HEAD. The app is in `raptor-port/`.

## The finder wording (use it)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

A scheduler is always an admin: never design a scenario for a scheduler who is not one (D785); a member (`us`/`us`,
Ranger) is in scope as a person who is not a scheduler. Sign-in: `ad`/`a` (admin, Saber).

## What changed (the user promise)

Read `raptor-port/docs/superpowers/plans/2026-11-14-rules-check-batch2-plan.md` and the diff
`git diff origin/main...HEAD -- raptor-port/src`. In the app's words:
1. **D2009** — the checks "On leave + flying" and "Downchit + flying" are named "On leave + planned" and "Downchit + planned"
   — *"one name, true on every row"* (D2009's full row). The label is read in four builders: the warning list
   (`ui/html.ts` ~1201, ~1221, ~2606), the Scheduler Board (`ui/board.ts` ~515 — the warning's own message first),
   Insights (`ui/insights-html.ts` ~56), the Logic page (`ui/logic-html.ts` `lgChkName`). The host's reading (a question,
   not a requirement): all four print the new name; the day's own message ("On leave but tasked — BRIEFING") is unchanged.
2. **D2010 (with D1990)** — where the previous day's last flight had no landing typed (blank, or "TBD"), the crew-rest
   warning reads "Mon took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00",
   never "landed" at the take-off time (`engine/validate.ts` ~483–528, ~656–660). The ruling's reading: the same words
   wherever the borrowed take-off is shown as a landing.
3. **D2015** — the Logic page's note under the changed-settings strip (`ui/LogicPage.tsx` `#lgOff`) now reads: "A published
   day keeps the settings it was published under, and the OIL they gave it, until it is published again. If a changed OIL
   setting would change that OIL, the day reads pending."
4. **D2044** — nothing of OIL built (comments only). As built (D592 (4)): changing "Full day of OIL" (or the default rally
   / debrief) makes a published earning weekend read "1 pending" and drop its four sign-offs; the OIL already credited stays
   until the day is published again.

The full rows of every ruling (his words, the readings): `grep -h '^| D2009 |' .claude/decisions-full/*.md` — the same for
D2010, D2015, D2014, D2044, D1990, D1786, D592, D186, D2005, D2013, D183, D184, D103, D928. The scheduler's and OIL's pages:
`.claude/rules/decisions/scheduler.md`, `.claude/rules/decisions/oil.md`. The roll-call the host drew (find what is
missing from it): `raptor-port/docs/handpass/2026-11-14-rules-check-batch2.md` §3.

## What to hand back

1. **The roll-call's gaps** — every surface, copy or route that draws a check's name or the crew-rest line that §3 of the
   sheet does not list (a title, a tooltip, an ⓘ, a print, a CSV, a notification, the next-week peek, the previous week's
   day, a published version's look (👁), a member's view, a phone width). Say for each where in the code it is drawn.
2. **The scenarios, ranked** — each with: setup (made through the app's own controls where it can be: which page, which
   row, what to type), action, EXPECTED (and its source: a ruling's row, a contract line, "as on `main` today", or two
   surfaces that must agree; where you cannot source it, write "RECORD exactly what it says"), and the observation that
   would disprove it. Cover at least: a blank landing and a "TBD" landing, each in the same week and across the week
   boundary; a landing typed (the old "landed" kept); the previous commitment being a flying SC line or a duty input (no
   "landed" either way); the next-week peek / phantom Monday; a published day showing the crew-rest line and the renamed
   checks (does any published day read pending from this batch alone?); a hidden (struck) warning of each renamed check;
   the board and Insights; the Logic page as admin (one setting changed, two changed, Reset to standard) and as a member;
   the as-built OIL Saturday across a "Full day of OIL" change end to end (the pending count, the sign-offs, the pending
   list's line, OIL Earn, the Leave War's credit, after republishing).
3. **The plain-user round (D1557)** — the area's everyday tasks start to finish: file a leave, put the man on a briefing
   row, see the warning, hide it, Undo; type a take-off with no landing, then type the landing, then "TBD"; open and close
   every window those steps open (Close, ✕, Escape, a tap outside); every other place that should show the result.
4. **Explicit negatives** — "I checked X and found nothing".
5. Any question that is the owner's to decide, with its case.

Keep the report under about 400 lines. Write nothing into the repository.
