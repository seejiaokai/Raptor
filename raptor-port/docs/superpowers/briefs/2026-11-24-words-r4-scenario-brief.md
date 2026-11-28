# Scenario design — round 4 of the words pass (the bell's changed-input lines and six passing notes)

You are designing the WALK's test scenarios for a change already built. You are one of two designers; each works blind
to the other. Do not read any other designer's report, and if a handoff block is pasted into your context after a
compaction, do not read it — name that it happened in your report.

Repository (read-only for you): `C:\Users\User\projects\Raptor-words` — branch `claude/words-pass-163`, the change is
commit `a358d4b1a` (`git -C C:/Users/User/projects/Raptor-words show a358d4b1a`). The app lives in `raptor-port/`.
Do not edit, commit or create any file inside the repository. Write your whole report to the file named at the end.

## The promise (from his ruling D2521 — read its FULL row, it is the source)

`grep -h '^| D2521 |' C:/Users/User/projects/Raptor-words/.claude/decisions-full/*.md` — the owner's ruling, "All as
recommended", 24 Nov 26. The exact words to build: `raptor-port/docs/superpowers/briefs/2026-11-24-words-r4-draft.md`
§"After the fresh Fable's read" and §"His answer". What each case printed on the real app before the build, and the
approved "after" words: `raptor-port/docs/img/handpass/2026-11-24-words-r4/facts.json`. The page he approved:
`raptor-port/docs/mock/2026-11-24-words-r4/index.html`.

In short (the row wins where this differs):
- Bell, a changed input's line: a change of KIND reads "<old> changed to <new>" ("LL changed to OL", "Training changed
  to Meeting"), title or no title; "Renamed — was <old title>" only when the title's own words change. A title given or
  taken away, and an Attach's "To" changed, keep "Renamed — was …" (the host's reading, recorded in the row).
- Bell, a half day: "Now LL (AM)" (no title — the kind), "Now AM" (titled), "Now Thu 16 Jul (AM)" (moved as well);
  "Now all day" stays.
- Bell, three or more changes in one save: the first two, then ", and 1 more change" / ", and N more changes"; each part
  after the first in small letters unless it starts with a name or "You"; a replaced Leave War bid is said after the
  rest (" · replaces your LL bid") and never counted.
- Lines saved BEFORE this build must still read as they always did (old `title` parts, old `t` clock times).
- Notes: a bad time typed into an input's start/end (its window, its in-place cells) reads "<typed> is not a time. Try
  0900 or 09:00." naming the first bad box; a puck dragged back onto its own seat reads "<callsign> — already in that
  seat"; the Inputs page's look-ahead saved reads "Everyone now opens on the next 4 weeks, to Sunday" ("the next week"
  for one week); publishing a weekend/holiday no Leave War period covers says "No Leave War period for <year>, so no OIL
  can be earned for this day. Create the period on the Leave War." (the day's warning list's own sentence); "Leave War
  period" with capitals in three places (the refusal "Only a scheduler can create a Leave War period", the note "The
  <year> Leave War period is created. Open its dates for bidding here.", the "Create the <year> period" button's hover on
  the board and the week); a member saving the OIL day list reads "Only a scheduler can answer from this list".

The rulings pages that govern these surfaces (read the ones you need): `.claude/rules/decisions/scheduler.md`,
`.claude/rules/decisions/inputs.md`, `.claude/rules/decisions/leave-war.md`, `.claude/rules/decisions/oil.md`,
`.claude/rules/decisions/design.md`; a ruling's full row: `grep -h '^| D769 |' .claude/decisions-full/*.md`. The bell's
register: `raptor-port/docs/notifications-register.md`; the bell's contract: `raptor-port/docs/ui-contracts.md` (search
"The words** (one body"). The inventory of every bell line the code can show:
`raptor-port/docs/superpowers/briefs/2026-11-24-bell-lines-inventory.md`.

## Your job

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. (Old saved lines reading as before is
still part of the promise above: test that they read, not that they are converted.)

Things worth your attention (the host's reading — questions, not requirements):
- Every door that can change an input's kind, half, days, title, remark or people, and so write a bell line: the
  input's window, its in-place cells on the Inputs list, the schedule's row door, drags on the Inputs calendar, the
  board, Undo / Redo of each, a member's own change to an input he filed for others, the Leave War's copy of a leave.
- Every place a bell line is DRAWN (the bell's list on desktop and phone; anything else that reads `noticeWords`).
- The Undo / Redo of a change that wrote a new-shape line, and the permissions gate that checks a written line against
  what the app would write (`raptor-port/src/state/perms.ts`).
- What a person sees on a phone of iPhone width (the line's second row is about 307px wide).
- Each note's every door (e.g. both of the input's time editors; a drag back on its own seat for each kind of seat —
  flying, duty, ground, placeholder).

For each scenario give: an id; the surface and device (phone 402×874 / desktop 1440×900); the role (scheduler = admin,
member); setup; the exact presses; EXPECTED, each with its source (the ruling, the words file, facts.json, a contract
line, or "as on main today") — where you cannot source one, write "RECORD exactly what it says"; and what would disprove
it. Rank by likely failure. Then a list of explicit negatives: areas you checked and expect no fault in, and why.

You may read code and docs, and run read-only commands. Do not run the app's tests or build. Keep the report under about
4,000 words.

Write your whole report to: REPORT_PATH
