# Scenario design for [WARN-WORDS-STANDALONE] — Astra's brief (16 Nov 26)

You are Astra, the standing reviewer, asked for ONE job: design the walk's scenarios (the bug-check order's §4, rank 1).
You are not reviewing whether the code is right; you are hunting for what is MISSING — the surfaces, orders and states a
walk must drive so that a defect cannot hide. Read-only: change no file, run nothing that writes. Return the whole report
as your final message.

**Where you are:** the repository root, branch `claude/warn-words-standalone`, commit at HEAD. The app is in `raptor-port/`.

## The finder wording (use it)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly", no "a hide stored before the
> rewording comes back once", no "a published day's frozen list carries the old words". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

A scheduler is always an admin: never design a scenario for a scheduler who is not one (D785); a member (`us`/`us`,
Ranger) is in scope as a person who is not a scheduler. Sign-in: `ad`/`a` (admin, Saber).

## What changed (the user promise)

The diff: `git diff origin/main...HEAD -- raptor-port/src`. Three pieces:
1. **Every warning reads on its own** (D2045, D2048, D2058, D2068–D2071, D2054): every line the rules engine writes
   names who, which items, their times and why; an assumed time is called "assumed"; "Conflict:" for every "Clash:";
   a conflict between a flight and another item shows the step or dekit time that causes it; the Logic page's note one
   sentence; the pending list says what moved and whether OIL changed. The approved words: the proposal
   `raptor-port/docs/superpowers/specs/2026-11-15-warn-words-standalone.md` — read §3c to §3g FIRST, they overrule its
   earlier sections; §7 and §3b are the build's notes.
2. **The assumed landing** (D2046, D2047, D2053; documents of D1990, D2010, D2022 corrected): a flight with a take-off
   and no landing typed (blank or "TBD") is taken to land a new Logic setting's length after take-off — "A flight",
   60 min to start (`VCONF.fltLen`). Read by the tight turn, the debrief, a conflict's dekit, crew rest, the long day,
   Insights' hours, OIL's worked times, the crew list's and ALL AVAIL's busy windows. A published day keeps the setting
   it went out with (D2005) and its OIL keeps it as a fourth value (D2044) — a change reads pending.
3. **D2055**: a standby shift (SC and the like) with START typed and END blank is left out of crew rest until END is
   typed; its own warning ("flies but has no END" or its kin) stays. The builder's reading: the same for a shift that flies.

The builder's report (what was built, its decisions and its open points): 
`raptor-port/docs/superpowers/briefs/2026-11-16-warn-words-build-report.md`.

The full rows of each ruling (his words, the readings): `grep -h '^| D2046 |' .claude/decisions-full/*.md` — the same
for D2045, D2047, D2048, D2053, D2054, D2055, D2058–D2071, D1990, D2010, D2022, D2005, D2013, D2044, D2001, D2018, D592,
D1936. The area pages: `.claude/rules/decisions/scheduler.md`, `.claude/rules/decisions/oil.md`,
`.claude/rules/decisions/leave-war.md` (OIL's credit reaches the Leave War). The roll-call the builder drew (find what is
missing from it): `raptor-port/docs/handpass/2026-11-16-warn-words-standalone.md`.

## What to hand back

1. **The roll-call's gaps** — every surface, copy or route that draws a warning's words, a check's short name, or the
   assumed landing's effect, that the sheet's roll-call does not list (a title, a tooltip, the day-details window, the
   look at a published version (👁), print, a CSV, a notification, the next-week peek, the previous week's day, a
   member's view, a phone width, the Leave War's cells, the OIL tracker). Say for each where in the code it is drawn.
2. **The scenarios, ranked** — each with: setup (made through the app's own controls where it can be: which page, which
   row, what to type), action, EXPECTED (and its source: a ruling's row, the proposal's §3c–§3g, a contract line, "as on
   `main` today", or two surfaces that must agree; where you cannot source it, write "RECORD exactly what it says"), and
   the observation that would disprove it. Cover at least: a blank landing and a "TBD" landing; a landing typed after
   (does every line go back); the setting changed and Reset on the Logic page, and on a published day; a weekend
   flight with no landing earning OIL; the crew list and ALL AVAIL beside the conflict list for the same window; an SC
   with START and no END, flying and not, then END typed; a hide of a reworded warning made and undone with the new
   words; the Sunday-to-Monday and week-end boundaries; the phone fit of the longest new lines.
3. **Orders and states** that matter — a table of state × reading where a surface has more than one state (working copy
   / published / amended / a plan; desktop / phone; admin / member).
4. **What only a person can see** — name what no unit test can catch here and must be pictured.

Keep it to what a walker can drive in about two hours; rank so the top ten are the ones that would hurt most if wrong.
