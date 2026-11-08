# The Tracker trial (D1941) — sorting the page's rulings, 9 Nov 26

Chat 36's overnight job 2. Every ruling of the Tracker's own area stated on its page before the trial (73; the
"From other areas" pointer lines left as they were) is sorted by the trial's test for a line: *without this line, would a
fresh model working on the Tracker likely do the wrong thing — and would no test catch it?*

Kinds: **standing** (a lasting preference, principle, constraint or "don't reopen": stays) · **built** (detail of
something built: leaves only when a test really pins it) · **not built** (stays, one short line naming its backlog item) ·
**spent / history** (leaves).

"Named by" uses the one test finder the gate and `npm run rulecheck` now share (`docsize-rulings.mjs` `namesId`: the
number as a word in a `*.test.ts(x)` / `*.spec.ts(x)` file under `raptor-port/src` or `raptor-port/e2e`). Each test was
then read: **pins** means an assertion fails if the behaviour goes; **comment only** or **partial** means it does not, and
the ruling stays on the page.

The page: 20,007 bytes before → 10,631 after (hard limit 20,061). 39 rulings moved to the "Built, held by tests" line;
34 stay stated.

| # | In a few words | Kind | Named by (file — test) | Pins it? | Verdict |
|---|---|---|---|---|---|
| D64 | event box's hint "e.g. Lecture, OFT/AMT, 2 x F-15" | built | retest.test.tsx — "F11 — both event-details editors carry the same Type/format hint (D64)": the placeholder asserted word for word | pins | leaves |
| D120 | database route export, wipe, import; a fault it removes is no finding | standing | several tests name it for export behaviours | the process rule is not testable | stays |
| D121 | a member can do everything an admin can, the File menu too | built | perms.test.ts "the Tracker: every member (D121)"; tracker.test.tsx "D121 — the Tracker reads no role", a member's rename | pins | leaves |
| D122 | an import never wipes an event's typed details | built | retest.test.tsx — three D122 tests; eventDetails.test.tsx mergeBlock | pins | leaves |
| D123 | Last Flown is the latest day actually flown | built | retest.test.tsx "D123 / W2-F3", "Fable F-G"; leftovers.test.tsx K12, F3 | pins | leaves |
| D124 | deleting a ball wipes its marks | built | retest.test.tsx "D124 / W2-F7", "Fable F-B", "Astra #4" | pins | leaves (still cited on D132's line) |
| D126 | event details belong to the chart they were typed on | built | retest.test.tsx "D126 / W1-8", duplicate, "Fable F-C"; eventDetails.test.tsx | pins | leaves |
| D127 | the export file remembers a deleted built-in chart | built | retest.test.tsx "D127 — a backup … remembers a deleted built-in" | pins | leaves |
| D128 | a deleted course can be restored | built | retest.test.tsx "D128 — delete says how to get it back; Restore … brings it back" | pins | leaves |
| D129 | logging out with unsaved chart edits asks first | built | retest.test.tsx — two D129 tests (Stay / Discard / Save; nothing unsaved) | pins | leaves |
| D130 | deleting a ball deletes its typed details | built | retest.test.tsx "D130 — …"; leftovers.test.tsx bake | pins | leaves |
| D131 | a backup does not carry deleted courses — leave it | standing (settled) | retest.test.tsx, one message check | a "don't reopen" | stays |
| D132 | an import never deletes marks; a chart import writes none | built | none | — | stays |
| D134 | the pinch's take-back stays as built | standing (settled) | trk-chart-fps.test.tsx | a "don't reopen" | stays |
| D157 | Raptor's colours fully | built | trk-palette.test.ts — the whole file: every Tracker colour is Raptor's, retired colours never return, the words name the colour drawn | pins | leaves |
| D158 | the tap after a drag: closed as a test-browser quirk | standing (settled) | none | — | stays |
| D370 | the Failures card leaves out an N.A. event's failures | built | leftovers.test.tsx "D370 — the Failures card leaves out …" | pins | leaves |
| D371 | failures follow their days; − takes back the latest | built | leftovers.test.tsx "D371 — failures take their X by DAY"; tracker.test.tsx | pins | leaves |
| D372 | pace, end dates and lulls are undo steps | built | leftovers.test.tsx "D372 — ↶ and Ctrl+Z take back …" | pins | leaves |
| D373 | on a short screen Edit chart layout folds its tools | built | leftovers.test.tsx "D373 — the folded tool row and its Tools ▾"; e2e save-note.spec.ts | pins | leaves |
| D374 | a day after today is refused in four boxes | built | leftovers.test.tsx "C8 + D374 — a day after today is refused …", "C5 + D374"; datebox.test.tsx | pins | leaves |
| D375 | a students import puts a new course at the bottom | standing (settled) | none | — | stays |
| D376 | each person reopens on his own last course, chart, student | built | leftovers.test.tsx "D376 — each person reopens …"; trk-rows.test.ts | pins | leaves |
| D377 | a half-typed day is refused, never recorded as today | built | none | — | stays |
| D462 | Tracker records saved one piece per thing | built | trk-rows.test.ts, app/rows.test.ts, trk-restore.test.ts, tracker.test.tsx (one row per course) | pins | leaves |
| D463 | an empty real database starts with no course | built | trk-nocourse.test.tsx "boots with no course and nobody on it — never the demo course" | pins | leaves |
| D464 | his charts are kept; he is told first so he can export | standing | rows / trk-rows tests pin the conversion keeping everything | "told first" no test can hold | stays |
| D474 | a syllabus is one shared thing; marks are the student's | standing | none | — | stays |
| D560 | clearer labels; that alone approved no shape, size or palette | standing | e2e geometry.spec.ts, a comment only | comment only | stays |
| D564 | the blocky wide wing rejected | standing | none | — | stays |
| D566 | the tapered wing; sizes, palette, fonts stay unless he changes them | built + standing | e2e geometry.spec.ts "D566 tapered flight wing and blue label backing" | pins the shape, not "stay unless he changes them" | stays (the shape's own line left) |
| D801 | the three date boxes open the app's calendar; his tick fallback | built + standing | leftovers.test.tsx, tracker.test.tsx, nodatebox.test.ts | pins the calendar, not the fallback | stays (one line, the fallback) |
| D899 | drags carried to the edge pan; a fix adding a look waits for him | built + standing | edgeturn.test.ts — a comment above the shared edge-pan tests, which test a plain box, not the Tracker | comment only | stays |
| D922 | the reorder windows take a finger drag | built | reorderdrag.test.tsx "D922 / D924 — a finger drags a row by its grip" | pins | leaves |
| D924 | the grip ⠿, the ring, one landing line; "Drag a row…" deleted | built | reorderdrag.test.tsx "D924 — the grip and the words", "a mouse drag wears the same look" | pins | leaves |
| D979 | the attempt history is what the pop-up keeps; no second list | built | none | — | stays |
| D980 | the chart by keyboard | built | trk-batch-ui.test.tsx "D980 — the chart by keyboard", the scenario designer's cases | pins | leaves |
| D981 | a man deleted through Post out leaves the courses still running | built | trk-batch-store.test.ts — two D981 describes | pins | leaves |
| D982 | the Currency & flex bars' ink comes with their colour | built | trk-batch-ui.test.tsx "D982 — …"; trk-legend.test.tsx | pins | leaves |
| D983 | two faults wait for the database step | not built | — | — | stays (names `[TRK-IMPORT-ONE-GROUP]`, `[TRK-FIRST-ORDER-PLACE]`) |
| D984 | the chart lands its event mid-box | built | none | — | stays |
| D985 | a finger scroll glides | built | none | — | stays |
| D986 | a touch while gliding only stops it | built | none | — | stays |
| D987 | a glide bounces at an end | built | none | — | stays |
| D988 | only a finger or pen glides | built | trk-chart-fps.test.tsx, one check that a mouse press is the app's drag | partial | stays |
| D989 | the glide's five calls | built | trk-chart-fps.test.tsx "D989, kept by D992 — the app's own move stops the phone's glide" — one of the five | partial | stays |
| D992 | the phone scrolls the chart; a pinch stretches as a picture | built | trk-chart-fps.test.tsx "D992 — two fingers are the pinch's, one finger is the phone's" — not the picture-stretch | partial | stays |
| D1002 | down days worked out from the Inputs; the window | built | trk-down-days.test.tsx "D1002, D1005, D1018 — the Info panel" (the count, ½ days, the window) and the medical kinds, ATT B included | pins | leaves |
| D1003 | a course start entered when a student is added | built | trk-down-days.test.tsx "D1003, D1018 — the course start, set in + Add" | pins | leaves |
| D1004 | the landing-currency bar takes no down days | built | trk-batch-ui.test.tsx "D1004 — the currency bar without down days" | pins | leaves |
| D1005 | every student a man on the roster; "Last flown currency" moves only the IP requirement | built + standing | trk-down-days.test.tsx pins the typed box gone, not the currency half | partial | stays |
| D1006 | flex editable; one switch turns it off | built | trk-flex-setting.test.tsx "D1006 / D1018 — flex off" | pins | leaves |
| D1007 | the legend | built | trk-legend.test.tsx "D1007 — the pop-out" | pins | leaves |
| D1014 | flex settings: an admin's alone | built | perms.test.ts "…except the flex settings … refused to a member"; trk-flex-setting.test.tsx "D1014 — a member cannot change them" | pins | leaves |
| D1015 | the import's refusal words | built | file-transfer-boundary.test.ts "his wording B, word for word"; tracker.test.tsx | pins | leaves |
| D1018 | down days, flex settings and legend as drawn | built | trk-down-days, trk-flex-setting ("the defaults and the ⚙ in the bar", "an admin changes the From days"), trk-legend ("the Legend button") | pins | leaves |
| D1132 | the bar's buttons wear line icons | built | tracker.test.tsx "D1132: Show All, File and the view tabs wear the line icons" | pins | leaves |
| D1135 | menu items and Students card wear line icons | built | tracker.test.tsx "D1134, D1135: … no typed ✎ ⇅ ⧉ 🗑 ⇪ ⤓ or × left" | pins | leaves |
| D1136 | desktop labels in Quals' small spaced capitals | built | none | — | stays |
| D1170 | every control on the bar as tall as its dropdowns | built | e2e consistency-heights.spec.ts "every control on the Tracker's bar is as tall as its dropdowns (D1170)" | pins | leaves |
| D1171 | a narrow desktop's bar may be 2 taller | standing (settled) | none | — | stays |
| D1405 | the stray scroll bars fixed first, before two other jobs | spent / history | e2e trk-scrollbars.spec.ts names it in its head; the fix itself is D1406's, pinned there | the order of work is spent | leaves, on the Built line — the gate's one way off the page without archiving the row, which waits for his word |
| D1406 | on a touch screen the chart draws no scroll bars | built | e2e trk-scrollbars.spec.ts — three D1406 tests | pins | leaves |
| D1538 | never exported standalone again | standing | tests name it in comments | a principle | stays |
| D1564 | the iPhone dropdowns draw their words whole: nothing changed | standing (settled) | none | — | stays |
| D1705 | Edit chart layout's tools take drawn marks | built | tracker.test.tsx "D1705, D1707: … wear drawn marks — none typed", each tool's mark checked by name | pins | leaves |
| D1790 | the marking window: the chart slides the event up | built | trk-round-seen.test.ts "D1790 — where the marking window opens" pins the placing; not "stays after Close" nor the slide's own behaviour | partial | stays |
| D1791 | the phone's Find ✕ clears and puts Find away | built | trk-round-seen.test.ts, a comment in its head only | comment only | stays |
| D1860 | Delete course's words without the typed ↺ and ⇅ | built | retest.test.tsx — the exact words asserted, no typed mark left | pins | leaves |
| D1861 | a screen too short: the window opens under the lifted event | built | none by number (trk-round-seen.test.ts covers it unnamed) | — | stays |
| D1900 | the search magnifier is the app's own | built | none | — | stays |
| D1931 | no student added by a typed name | not built | — | — | stays (names `[TRK-NO-TYPED-STUDENT]`) |
| D1935 | the window above at the chart's end, and Find's ✕ up to 1050 — kept, his word | standing | none | — | stays |

## Counts

- standing: 13 — D120, D131, D134, D158, D375, D464, D474, D560, D564, D1171, D1538, D1564, D1935 — all stay.
- not built: 2 — D983, D1931 — stay.
- spent / history: 1 — D1405 — leaves (on the Built line; see its row).
- built: 57 — 38 leave (a test pins each); 19 stay:
  - no test names them: D132, D377, D979, D984, D985, D986, D987, D1136, D1861, D1900;
  - a test names them but does not pin the whole rule: D566, D801, D899, D988, D989, D992, D1005, D1790, D1791.

## What a reader should check

- Each "leaves" row: does the named test really fail if that behaviour goes? The verdicts above come from reading the
  test titles and the lines that name the number, with the assertions read where the title left doubt (D64, D1705,
  D1860, D899, D463, the Tracker's down-days and placing tests) — not every assertion of every test.
- D1405 on the Built line: it is spent, not built; archiving its row is the honest end, left for his word.
- Lines kept whole on the page whose rulings stay: Moving (the glide), Marking (the window's slide, kept as it was), the
  Find lines, D132's import line. Only the date-box line was shortened to its standing part (his fallback).

## After the two blind reads (9 Nov 26, chat 36)

Astra and a fresh Opus reader, blind to each other (their reports: `2026-11-09-tracker-trial-read-{astra,opus}.md`),
read the tests themselves. Both found 20 of the 39 "pins" verdicts above were only partial: a named test holds part of the
ruling and a condition or exception goes unchecked (for example D372's list of what is NOT undoable, which no test checks;
D1170's "the bar no taller and nothing moving", never measured; D130's "Revert edits only", never exercised). D1405 is
spent, its test naming it only in a comment. By the trial's own rule — a ruling leaves only when a test holds it whole —
each went back on the page in its old words, under "Built, stated here: their tests hold only part": D64, D121 with D1014,
D124 with D130, D372, D373, D374, D376, D922, D924, D980, D1003 with D1018, D1132, D1135, D1170, D1405 with D1406, D1705;
the flight symbol's shape line (D566) and D474's enrolment condition came back to their own places; D1931's "none of it
kept or extended" is marked the agent's reading. The Built line keeps 19: D122, D123, D126, D127, D128, D129, D157,
D370, D371, D462, D463, D981, D982, D1002, D1004, D1006, D1007, D1015, D1860. The page: 15,593 bytes of its 20,061. The tests each restored ruling would need before it can leave are in the two
reports; writing them is a job of its own, his to order.
