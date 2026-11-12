# [RULES-CHECK-FIXES] the small batch (D2009, D2010, D2014, D2015) — the builder's report at "built", before the walk (13 Nov 26, 04:50, chat 67's night)

Saved by the night's coordinator as it arrived. The builder: a fresh Opus helper; branch `claude/rules-check-small-batch`,
commit `300be6535`. The walk, the two code reads and the full gate run had NOT started. The evidence sheet is
`docs/handpass/2026-11-13-rules-check-small-batch.md`; Astra's scenarios `docs/superpowers/briefs/2026-11-13-rules-check-small-batch-scenarios.md`.
The builder's own context compacted once, about 04:04, and it re-read its state.

## What was built
- **D2009 (the check's name).** "On leave + flying" is now "On leave + planned", and "Downchit + flying" "Downchit + planned".
  The name lives in one table, read by the Logic page's check rows, the warning list's bold name (Edit Schedule,
  View-only Sched, a hidden line), the day's info panel and Insights' "Conflicts by type" — so it changes in all of
  them. The messages under them are unchanged ("On leave but tasked — BRIEFING", "planned to fly"). The Scheduler Board
  shows the message, not the name, so nothing changes there.
- **D2010 (the crew-rest words).** When a day's last flight has no landing typed, the sentence reads: "Monday took off
  12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00". "No landing typed" covers
  a blank, "TBD" or any word that is not a time. Left as they are: a typed landing, and a landing typed equal to the
  take-off (D49, a real landing), still say "landed". Where the new words show: the crew-rest warning, the amber
  tight-turn note, the day before's trace, and next Monday across the week's edge. The ruling's "Mon" is shorthand: the
  app prints the day's full name, as it always has. The reference app's copy used by the 728 checks mirrors the change.
- **D2014 (a published day's OIL).** NO ENGINE CHANGE WAS NEEDED: the ruling's premise ("as built, a published day's OIL
  reads today's settings") was wrong. A published day's OIL already follows the report lead, debrief and "Full day of
  OIL" kept in its published record — true since [OIL-WORK-START] (D592 (4), 5 Oct 26). A change that would move
  someone's OIL already shows as one pending change and takes the four sign-offs down. Now pinned end to end by a new
  12-case test (both directions, every surface, Undo and Redo, older versions and Unpublish, another day published
  under the new value, the working copy, a holiday made after publication, the five gotcha families). Break test: made
  to read today's value, 9 of its 11 OIL cases went red.
- **D2015 (the Logic page's strip).** Old: "N settings changed from the squadron standard. The schedule is checked
  against them now. A published day keeps its printed B and its OIL until it is published again." New, after a cold
  read by a fresh reader: "N settings changed from the squadron standard. Days not yet published use them now. A
  published day keeps the settings it was published with, for its checks and its OIL, until its next amendment is
  published." ("it" for one setting.) The member's "Only an admin can change them." is unchanged. (A first draft,
  "… Days not yet published are checked against them now. A published day keeps the settings it was published with
  until its next amendment.", was dropped: the reader took "checked against" to mean the warnings only, and could not
  tell whether drafting an amendment already switches the day.)

## Files
- New tests: `src/engine/rules-small-batch.test.ts` (17 cases), `src/leavewar/oil-fullday-published.test.ts` (12 cases).
- Changed code: `src/engine/validate.ts`, `src/engine/events.ts`, `src/testing/refwin.ts`, `src/ui/LogicPage.tsx`.
- Changed tests: `src/ui/logic.test.tsx`, `src/engine/rulesfirst-5-seats-quals.test.ts` (a test's name only).
- Documents (D201): `docs/engine-rules.md` (§Publishing rewritten; the crew-rest tail paragraph); the AM7 row of
  `docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` (now names D592, D2005, D2014);
  `docs/superpowers/specs/2026-10-15-logic-page-lines.md` (the strip's words; the two renamed rows with their old
  names); `docs/file-map.md`. No change needed: remarks-vocabulary, data-schema, data-model (the "no landing typed"
  mark is worked out afresh at each check and never saved).

## Counts the builder watched
Touched test files 89 of 89 across the four files, plus the OIL test's 12 of 12 after a type fix; the reference-window,
crew-rest and blank-rest tests 284 of 284 (before its compaction); `npx tsc -b` 0 errors (it caught two places where the
new OIL test read `.ok` off a command result — fixed); `npm run lint:changed` no new finding; `npm run build` through the
lock; `node reference/tfin.js` 728 passed, 0 failed; `npm run docsize` passes (the known "OUTSTANDING.md OVER by 2, deferred").

## Roll-call: the other OIL settings
None reaches a published day's OIL at once (Astra agrees). The OIL arithmetic reads only the three kept values; the
open-ended row's assumed hour and the sim length only change what is drawn; step, dekit, brief lead, sim debrief, AMT
debrief and the hard SC shift are not read by it; the placeholder crowd is frozen at publication; an input's OIL
question reads today's value, but only when asked or edited, on the working copy. Nothing parked.

## Parked, filed or to record
1. The IT flow guide deck (`scripts/itflow/content.mjs`, two slides) still quotes the old names; re-made only on his
   word (D403) — to file.
2. Old walk scripts under `scripts/handpass/` quote the old names — the record of past walks, left.
3. For the walk (Astra's side question): does a change to the open-ended row's assumed hour make a published day
   pending through its crowd? D360's reading (3) says a crowd change reads pending; D2005 says a setting change never
   does. Not judged yet.
4. Two other Logic lines still say "until it is published again" (the brief lead's line and the OIL fold) — the same
   meaning for one setting, left as built.

## Lines for the coordinator's records
- The scheduler page's "Not built yet" lines become — D2009: "The Logic page's checks read "On leave + planned" and
  "Downchit + planned", one name true on every row, the day's own message unchanged [D2009]." D2010: "Where a day's
  last flight has no landing typed (blank, TBD or not a time) the crew-rest warning reads "Monday took off 12:00 with no
  landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00"; a typed landing, one equal to the
  take-off too, keeps "landed" [D2010, D1990, D49]." D2014: "A published day's OIL follows the "Full day of OIL",
  report lead and debrief it was published under, kept in its published record since [OIL-WORK-START]; a change reaches
  it from its next amendment, one pending item that takes the sign-offs down [D2014, D592]." D2015: "The Logic page's
  strip reads "Days not yet published use them now. A published day keeps the settings it was published with, for its
  checks and its OIL, until its next amendment is published." [D2015]."
- D2014's full row needs a correction: its "as built 12 Nov 26 the OIL of a published day reads today's settings" was not so.
- The project guide's "no rule versioning" line (D2024), the builder's suggested wording: "no rule versioning beyond a
  published day's own copy: a published day is checked by, and keeps its OIL from, the Logic settings it was published
  under (its printed B, D186; every check, D2005; its OIL's report lead, debrief and full-day line, D592, D2014) until
  its next amendment; the rulebook itself keeps no history."

## Trap met
A test file can run green in vitest while failing the type check (vitest does not type-check): run `npx tsc -b` before
calling a new test file done.

## The builder's plan for the walk (Low)
Two Sonnet walkers, one after the other — W1: the published-day OIL scenarios, the Logic page's strip and the
plain-user round, a real window at 125%; W2: the two names and the crew-rest words on every surface, at 125% and the
iPhone's 402 in WebKit. Then Astra and a fresh, blind Opus read, the fixes, the re-walk, the full gate run.
