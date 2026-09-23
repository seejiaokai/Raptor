# [HUMAN-RETEST] the Tracker — Fable 5.1 final read (23 Sep 26)

Brief: `docs/superpowers/briefs/2026-09-23-tracker-final-read-brief.md`. Read blind to Astra. The report
is kept here in full substance (findings, scenarios, fixes, negatives, roll-call gaps); dispositions are
in the evidence sheet §11.

Short version (Fable's own): **nothing high. One medium that is the owner's call on scope, six lows.**
The D126/D122 per-chart details rebuild, the one-time carry-over of typed details, the D124 sweep, the
D123 rewrite, D127 and D129 read correct on every path enumerated, including the ones the sheet says
were not walked.

## Findings, most severe first

**F-A (medium — his call).** After export → wipe → import a deleted course is gone for good, although
the delete question promises "Restore brings it back"; a deleted built-in chart's typed details go the
same way. `collectStudents` walks `COURSES` only; `collectCharts` walks `orderedSylIds()`, which
excludes a tombstoned built-in, so its `eventInfo[id]` never leaves the browser. Fix (if the file should
remember them, as D127 does for charts): carry `DELCOURSES` (and their blocks) in the students block and
merge on import; carry a tombstoned built-in's `eventInfo[id]` in `eventInfoBySyl` when `opts.deleted`,
let `checkCharts` accept a key named in `c.deleted`, merge it in `importClick`'s kept-deleted loop.

**F-B (low).** 📋 Edit events can put a deleted-but-unsaved code back before Save and the old marks come
with it — `+ Add` refuses exactly this; `saveSylText` does not; `persistSyl` computes "in the saved
chart, not on the live chart", so nothing is wiped. Fix: the same refusal in `saveSylText`.

**F-C (low, pre-existing).** Import → "Add as new" of a built-in gives the copy the long course's wording
(the file's block holds only what differed from Tx's own profile; the copy is custom, so its shipped
wording is the base table alone). ⧉ Duplicate gets it right. Fix: in `applyCharts`, for an add-as-new of
a built-in, lay the source's profile (diffed against the base table) under the file's block — the
recipe `dupSyl` uses.

**F-D (low, pre-existing in part).** A Logout reached by KEYBOARD while a Tracker question is up (the
question's shade blocks the mouse, not the keyboard — walker 1 item 14) cancels that question, and the
job behind it (an import) carries on and asks its next question into the next person's session. Fix:
`onBeforeTrackerLogout` — a question in progress keeps the session (show the tab, return false); a
session counter guards the awaited steps of `importClick` / `saveCopyClick`.

**F-E (low, pre-existing).** A "Done on" year half-typed when DCO is pressed is stored as the flight's
day (year 0002) and Last Flown ignores that flight. Fix: `popGrade` stores `popDoneDate` only when it is
a whole day, else today.

**F-F (low — his call).** A deleted ball's typed details linger and reappear on a later ball with the
same code, and ride the export for an event the chart no longer has. Fix (if wanted): drop
`eventInfo[id][code]` for the wiped codes in `persistSyl` and the Revert path.

**F-G (low).** Changing a ball between flight and non-flight in the ball box does not re-settle Last
Flown. Fix: in `persistSyl`, when a live event's flight-ness differs from the saved definition's,
re-settle every student's Last Flown (this course and, by the sweep, the others).

A belt, not reachable from any control today: `trkWriteRecords` re-reads `DELCOURSES` without the
live-course filter, and `restoreCourse` does not refuse an id that is already live.

## Explicit negatives (Fable's)

Every reader and writer of event details is per chart (the only flat-table code left reads OLD files or
converts the old key); the one-time carry-over's boot order, tombstoned built-ins, emptied/`__kept`/
profile-equal fields and the untouched old key are right; the file path (`readFile` → `normalizeImport`
→ `applyCharts`) validates and remaps both new fields; the off-screen layout snapshot is right; the
command layer records both new keys and re-reads them on `write`; D124 at every door but F-B (saved-def
wipe codes, every course namespace incl. deleted courses, failure days inside the mark, Last Flown
re-settled from the saved flight set, one gesture, undo before Save, Revert, `delSyl`, `+ Add` refusal,
the ball box never renames an id); D123 at every writer but F-G; D129 (both buttons, `resetSession`'s
only callers, Escape/outside = Stay, Discard reloads, Save runs the real save, a never-opened or
failed Tracker asks nothing, a hidden tab is brought forward); D127; D128 in-session; D126 duplicate;
F7/R-1 at both writers; W1-6/W1-7; W2-F2/F4/F5/F6; the pop-up clamp; the save corner; the bubble and
re-fit; the spacer; D121 (no role read anywhere); no weakened assertion in the tests or the smoke.

## Roll-call gaps (Fable's)

A: a deleted built-in's typed details × Export/Import (F-A); a deleted ball's typed details (F-F);
Import "Add as new" (F-C). B: 📋 Edit events re-adding a deleted-unsaved code (F-B); and Import-Replace's
"MUST NOT wipe" leaves the W2-F7 picture reachable through the import door — worth the owner's eye
against D124's own words. C: a ball's type changed in the ball box (F-G). D: Logout while a Tracker
question is up (F-D). No roll-call row for D128 × the file (F-A).
