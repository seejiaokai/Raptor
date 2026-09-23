# [HUMAN-RETEST] the Tracker — the final code read. Brief for BOTH providers, independently.

**Bug-check order §4 rank 2 and §4a.** This change touches SAVED DATA — what the Tracker stores (event
details re-keyed per chart, a one-time carry-over of the old key, a deleted-courses list, marks wiped
when a ball is deleted, Last Flown recomputed) and the FILE the owner's charts reach the database by
(D120: export → wipe → import). One inspector is not enough: Fable 5.1 and Astra/Codex each read the
finished code, **blind to each other. Neither is shown the other's report before both exist.** The
builder was Opus 5.5 (D67 — the model that wrote it never reviews it).

**READ-ONLY.** Do not edit, create or delete any file, and do not run anything that writes (no builds,
no test runs that write caches, no git commits). Read files and run read-only commands only
(`git diff`, `git log`, `git show`, reading files, searching).

**The walk has already run** (§4a's first rule — reading for absence works with a roll-call in hand):
three walkers, then the host's re-walk of every fix on the rebuilt app. The sheet names what was NOT
walked (§9) — those are the best places to look.

## What to read

- Branch `claude/tracker-human-retest-8d3411`, against `main`:
  `git diff main...HEAD -- raptor-port/src raptor-port/scripts/tracker/smoke.mjs`. Round three is the
  commits `41e22411` `85a6562a` `01e0c1a6` `245687a6` `060f3359`; rounds one and two (`5322db46`,
  `b95f7844`, `912ee458`) were not read by a model before either — read the whole branch diff.
- **The evidence sheet: `raptor-port/docs/handpass/2026-09-23-tracker.md`** — §0 (where it stands),
  §3 (the findings), §4 (the ROLL-CALL — every place each shared thing is drawn or written, with a
  written answer), §5 doors, §6 orders, §8 every finding's disposition, §9 what was NOT walked, §12
  the re-walk.
- The walkers' own sheets: `raptor-port/docs/handpass/parts/tracker/w1.md`, `w2.md`, `w3.md`.
- The rulings: `DECISIONS.md` — **read the whole file**; the ones that govern this are **D56, D120,
  D121, D122, D123, D124, D126, D127, D128, D129** (D125 is about running beside another chat).
- The Tracker's contract: `raptor-port/docs/ui-contracts.md` §The Tracker tab (the last bullet is this
  work); `raptor-port/docs/tracker/known-gaps.md` (the head note); `raptor-port/docs/data-schema.md`
  §World 3.

## The brief itself — the standing order's wording, verbatim

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove
> correctness. Start with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

**The one exception to that exclusion, stated by the owner (D120):** his HAND-DRAWN CHARTS and the
event details he typed are NOT demo data — they are what he exports on the way to the database. So the
one-time carry-over of the old one-table details key (`convertFlatEventInfo` in `core.js`) and the
reading of a charts file written by the build before this one ARE in scope: a detail he typed must not
be lost or moved onto the wrong chart by either.

Required of both:

- **Exact, step-by-step fix instructions per finding** — file, function, what to change, the test that
  should go red first. Not a direction.
- **Explicit negatives**: "I checked X and found nothing." A confident all-clear from one reader on an
  area the other found a defect in is the cheapest pointer to a real bug.
- **Compare against `main` before calling anything newly introduced.** "Pre-existing" never erases
  severity; the dangerous category is old code a change has just made reachable.
- Rank findings most severe first; give each a one-line plain-English summary a non-technical owner
  could read.

## Where to read first

1. `raptor-port/src/tracker/app/core.js` — the event-details block near the top (`eventInfo`,
   `loadEventInfo`, `convertFlatEventInfo`, `infoFor` / `docInfoFor` / `hasDocInfo`), `writeInfo` /
   `resetInfoFor`, `collectCharts` (`eventInfoBySyl`, `deleted`), `applyCharts` (the per-chart merge,
   the old-file path), `importClick` (Skip this one, the relabel pass, the kept-deleted pass),
   `normalizeImport`, `dupSyl` / `delSyl` (details copied / dropped; the Revert path's mark wipe),
   `persistSyl` + `wipeEventMarks` (D124), `latestFlown` / `settledDates` / `settleLastFlown` and
   `setLastSyll` / `setLastCurr` (D123), `popDoneChanged` / `isWholeDay` (W2-F2), `addModule` (the
   deleted-code refusal), `delCourse` / `restoreCourse` / `loadDelCourses` and `trkCollectionOf` /
   `trkWriteRecords` (D128, and the command layer's record of the new key), `onBeforeTrackerLogout`
   (D129), `layoutSnapshotFor` / `computeFlow(evs)` / `bestDefaultLayout(evs)` (W1-3), `removeLull`,
   `setLullCopyAll`, `applyMarkHist` (the undo view), `hideDetailBubble` / `refitAfterShow`.
2. `raptor-port/src/tracker/app/eventDetails.js` (the pure helpers), `app/sylIds.js`
   `reconcileSylIds` (W1-6), `app/fileFormat.js` (the new file fields' checks).
3. `raptor-port/src/tracker/role.js` + `raptor-port/src/ui/logout.ts` + the two Logout buttons
   (`src/ui/Shell.tsx`, `src/ui/Drawer.tsx`) — is there any OTHER way to end a session that skips the
   question? (`resetSession` callers.)
4. The components: `Modals.jsx` (details window's Reset, the dialog's cancel label, the Reorder
   window's deleted-courses list), `ShowAllPanel.jsx`, `SidePanel.jsx` (Select all), `Header.jsx` (the
   save corner), `Pop.jsx` (on-screen placement), `App.jsx` (bubble + re-fit effects), `tracker.css`.
5. The tests that pin all this: `src/tracker/retest.test.tsx`, `src/tracker/eventDetails.test.tsx`,
   `src/tracker/app/sylIds.test.ts`, and the smoke suite's changed checks.

## Questions worth your time (not a limit)

- Is there any writer of event details, any reader, or any file path that still treats them as ONE
  table keyed by event code? (Search every use of `eventInfo`, `infoFor`, `EVENT_INFO_BY_SYL`.)
- The command layer (`trkStore`, `trkWriteRecords`, `trkReloadGlobalsFromMem`): after an undo/restore
  that touches `v3:master:eventinfo` or `v3:delcourses`, do the live lets follow?
- D124: every door that takes an event off a chart — does each one wipe (or deliberately not wipe) its
  marks, as the sheet's roll-call B says? What about the marks' failure days, the "last edit" pointer,
  and a course the sweep cannot see?
- D123: every writer of a flight's grade or day — does each settle Last Flown? Does undo / redo leave
  the hand marks consistent?
- D129: can the question be dismissed in a way that neither logs out nor keeps the edit? What happens
  if the Tracker was never opened this session, or the tab is hidden when Logout is pressed?
- D127 / D128: can an import delete the chart on screen or the last chart? Can a restored course
  collide with a live one?
