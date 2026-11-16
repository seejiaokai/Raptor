# Scenario design for `[WARN-WORDS-STANDALONE]`'s follow-ups — Astra's brief (16 Nov 26, chat 86)

You are Astra, the standing reviewer, asked for ONE job: design the walk's scenarios (the bug-check order's §4, rank 1).
You are not reviewing whether the code is right; you are hunting for what is MISSING — the surfaces, orders and states a
walk must drive so that a defect cannot hide. Read-only: change no file, run nothing that writes. Return the whole report
as your final message.

**Where you are:** the repository root, branch `claude/warn-words-followups`, commit at HEAD. The app is in `raptor-port/`.

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

The diff: `git diff origin/main...HEAD -- raptor-port/src`. Four pieces, each from a ruling (full rows:
`grep -h '^| D2073 |' .claude/decisions-full/*.md`, the same for D2074, D2075, D2077, D2078, and D2055, D2071, D2070):
1. **D2073** — "A duty desk made from an SC shift template, with its START typed and its END blank, is left out of crew
   rest until its END is typed, as an SC wave line is (D2055) — never counted as ending an hour after its START." The
   builder's reading (in the row, not checked with him): only a desk made from an SC shift template, not every duty row
   with no END; the desk's assumed hour still stands for every other check. The code marks it by the duty block's
   template flag (`sa==='sc'`) in `engine/events.ts`.
2. **D2074** — "The seat warning is called 'Illegal seat', not 'Wrong seat', everywhere: its warning lines begin
   'Illegal seat:' … the check's short name is 'Illegal seat', and the Legend keeps 'qual / illegal seat'."
3. **D2077** — "The Logic page's explanations say 'conflict', never 'clash', in every place they name the check, so one
   thing has one name (D2070)." The setting "SC MAIN clashes" became "SC MAIN conflicts" (not a stored key).
4. **D2075, D2078** — Edit Schedule's Legend fold names each flag as its check is now named: 7 "days in a row",
   Q "qual / illegal seat", B "misses flight brief" / "misses sim brief", D "misses flight debrief" / "misses sim
   debrief", L "long day"; only the words change, both sizes keep their height. The approved picture:
   `raptor-port/docs/mock/2026-11-16-legend-words/img/` (phone and desktop, today and proposed).

The area page: `.claude/rules/decisions/scheduler.md` (§Warnings). The last check's sheet, whose roll-call of every place
a warning's words show is the starting point (find what it misses for THESE four):
`raptor-port/docs/handpass/2026-11-16-warn-words-standalone.md`.

## What to hand back

1. **The roll-call's gaps** — every surface, copy or route that draws the seat warning's words or its short name, the
   Legend, the Logic page's explanations, or crew rest's reading of a duty desk (the crew-rest trace, the warning
   list, the Board, ALL AVAIL, the day-details window, the 👁 published version, the next-week peek, the day before
   across a week's edge, Insights, OIL, a member's view, a phone width). Say for each where in the code it is drawn.
2. **The scenarios, ranked** — each with: setup (made through the app's own controls where it can be: which page, which
   row, what to type), action, EXPECTED (and its source: a ruling's row, a contract line, "as on `main` today", or two
   surfaces that must agree; where you cannot source it, write "RECORD exactly what it says"), and the observation that
   would disprove it. Cover at least, for D2073: how a desk comes to carry the SC template mark and every way it could
   lose or gain it (made from the template, typed by hand, copied or pasted, a plan saved and brought back, a day
   published and amended, undo and redo, a reload); START typed then END typed then END cleared; a plain desk as the
   control; the desk the day before a flight, and across Sunday to Monday; what "every other check" still reads from
   the desk's assumed hour. For D2074: a flight, a sim, a spare and an AVALON line, each of the three kinds of man.
   For the Legend: both sizes, folded and open. For the Logic page: every line, and the setting's name.
3. **Orders and states** that matter — a table of state × reading where a surface has more than one state (working copy
   / published / amended / a plan; desktop / phone; admin / member).
4. **What only a person can see** — name what no unit test can catch here and must be pictured.

Keep it to what one walker can drive in about an hour; rank so the top ten are the ones that would hurt most if wrong.
