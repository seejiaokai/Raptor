# [STACK-LEFTOVERS] (1)(2) — Insights' two untried edges, one wording body, React Doctor's three — evidence (LOOK)

Job 6 of the sized plan (`docs/superpowers/plans/2026-11-05-backlog-sizing.md`), 8 Nov 26, branch
`claude/insights-leftovers`. Nothing a person sees was meant to change, and nothing did: the same steps on the build
before (main's three touched files) and after give the same words.

## The eight answers and the tier

**Tier: LOOK.** Every answer NO, each with its reason:

1. **Money** (OIL, who counts as present): NO. Nothing here touches OIL or a count. The Blue/Red answer still counts in
   Insights the same way (D530).
2. **The published record:** NO. No issued version changes. A Blue/Red answer still needs no amendment (D530), as before.
3. **Saved data:** NO. The saved context (format v1) that role ids are built from is byte for byte the same. Proof:
   - the existing mission-role tests;
   - both blind readers ran their own old-against-new comparisons, 200,012 formations and 8,006.
   No stored shape changed.
4. **A shared drawer:** NO.
5. **A new gesture or mode:** NO.
6. **A new surface:** NO.
7. **Roles:** NO.
8. **The warning list:** NO.

The code change is not cosmetic, but no screen changes. LOOK fits the job: its two edges are visible behaviours, so they
were looked at on the real app, and the wording body was compared word for word before and after.

## Roll-call — every place the change draws

| Place | Has it / must not | How seen |
|---|---|---|
| The change history's line for a Blue/Red answer (History → All changes) | has it, words unchanged | walked before and after; pictures `*-2-history-line.png`; test (2) "one real answer" |
| Undo's and Redo's passing note ("Undid: the mission role for VL — Red") | has it, words unchanged | walked before and after; `*-2-undo-words.png`, and the Redo note in `*-b-issued-look.png` |
| The Undo / Redo buttons' hover titles and "Press Undo again for: …" | has it: the same entry words | carried by test (2): `describeEntry`'s output is identical. Not walked, because hovering adds nothing the note does not show |
| The Blue/Red question ("VL: Blue or Red?") and its buttons, the Insights legend | must not change; fixed words, not built by the helper | walked: the question's words are the same before and after |
| The day's "N pending" chip after Choose with unsaved typing (edge a) | has it: counts at once | walked at both sizes; `*-a-pending-chip-and-question.png`, and `phone-a-right-after-tap.png` right after the tap; tests (a) week and board |
| The board's "Not yet signed" in its sign strip (edge a) | has it: shows at once | test (a) board. Not walked: the board's sign strip is drawn by the same rule as the week's chip, which was walked |
| The week's Templates under an issued look (edge b) | must not be drawn | walked at both sizes (`*-b-issued-look.png`); test (b) |
| The board's Templates under an issued look (edge b) | must be greyed, and the day's own not drawn | walked after the reads (`after-reads/*-b-board-issued-look.png`); test (b) |
| View-only Sched under a saved plan's look (edge b) | must not draw Templates; the look dropped on the way to Edit Schedule | test (b) "View-only Sched", which presses the page tabs and the plans picker |

## What was walked

The script is `scripts/handpass/insights-leftovers-look.mjs`. It ran on the real production bundle, served locally, at
desktop 1440×900 and phone 390×844 (touch), pressing the app's own controls. Before each press it checks that nothing
stands over the control.

The steps, in order:

1. **Setup.**
   - Logic: switch Blue/Red tracking on.
   - Board: Monday's first line gets mission ACM and Remarks "DS FOR ALPHA", answered Later.
   - Publish Monday: four sign-offs, then ORIG.
   - Edit Schedule: no "pending" chip.
2. **Edge (a).**
   - Tap the line's Remarks box on the week and type "DS FOR BRAVO" without leaving the box.
   - Press "Choose mission role".
   - Seen: the typing saved, the caret still in the box, the question "VL: Blue or Red?" opened, and the chip reading
     "1 pending" at once.
3. **The words.**
   - Press Red.
   - Open History → All changes: the line reads "Mission role · Working copy Unresolved → Red" under "Mon · Flying · VL ACM".
   - Press Undo: the note, read only once it is painted in view, is exactly "Undid: the mission role for VL — Red".
   - Press Redo.
4. **Edge (b), the week.**
   - Open the day's plans selector and pick the issued row.
   - Seen: the "Viewing the issued Original" bar, and no Templates button.
   - Back to the live copy.
5. **Edge (b), the board** (added after the reads).
   - Open the board: Templates is live.
   - Open the board's own plans selector and pick the issued row.
   - Seen: the board's Templates greyed, and the day's own Templates not drawn.
   - Back to the live copy, then close the board.

**Before against after.** Steps 1–4 ran on both builds, into `before/` and `after/`. Every step PASSED on both, at both
sizes. The words in each run's `result.json` are identical: the chip, the question, the history line and its heading,
and the Undo note. There were no console errors, no page errors and no 4xx on either build.

**After the two reads.** Steps 1–5 ran again on the rebuilt branch, into `after-reads/`. All 10 PASSED, with the same
words and no errors.

Pictures are in `../img/handpass/2026-11-08-insights-leftovers/`: 9 in `before/`, 9 in `after/` and 11 in
`after-reads/`. The host opened the ones that decide something:

- the before and after history line and the failure picture that found the script's own fault (see Faults below);
- phone and desktop after: the chip and question, the Undo note, the week's issued look, and the board's issued look on
  the phone.

## Cases carried by a test (`src/ui/insights-leftovers.test.tsx`, 7 of 7)

- **(a) week.** Choose pressed with unsaved typing on a published day. Proves: saved through the box's own door, the
  question open, the caret kept, and the chip counting it at once.
- **(a) control.** The same typing left by an ordinary blur counts the same way.
- **(a) board.** The same press on the board. Proves: "Not yet signed" in its sign strip at once.
- **(b) Edit Schedule.** The day's own plans selector, and then the board's, are pressed to their issued row. Proves: no
  Templates on the week, the board's Templates greyed, and the day's own Templates not drawn.
- **(b) View-only Sched.** The page tabs and the plans picker are pressed. Proves: no Templates anywhere under a saved
  plan's look, and the look dropped on entering Edit Schedule.
- **(2) the one body.** `roleAnswerName` and `roleSideWord` on odd and missing inputs.
  - This is the red-first test: with main's three files in place it fails because the export is missing.
  - The six other tests pass on both, so the words are the same.
- **(2) one real answer.** The History line ("VIPER 11 · mission role · Working copy", Unresolved → Red) and Undo's words
  ("the mission role for VIPER 11 — Red") name the same line and side.

## The two blind reads, and what was done (D790, D1743)

Each reader was blind to the other and had the D56 exclusion in its brief
(`docs/superpowers/briefs/2026-11-08-insights-leftovers-read-brief.md`). Neither found a high or medium finding.

**Astra** (`…-read-astra.md`):

- **Low 1, the walk exited 0 when a check failed.** Fixed: a step not PASS, or any page error, now sets a failing exit
  status.
- **Low 2, the Undo check read hidden text and accepted wrong words.** Fixed: it waits until the note is painted in view
  and compares the whole message.
- **The tidiness correction** (the kept finding's reason said "one or two" questions). Fixed, as the Opus read's low 1.

**The fresh Opus reader** (`…-read-opus.md`):

- **Low 1, the kept finding's reason in `ui/mission-role-offer.ts` contradicted D598, which sets no cap.** Fixed: the
  reason now says few, at most one a formation, each raised by his own typed edit.
- **Low 2, the board's half of edge (b) was proven only by setting the look in code.** Fixed:
  - both (b) tests now press the plans selectors, the issued row, the page tabs and the plans picker;
  - the walk gained step 5, the board's own selector.
- **Low 3, a tidiness note: a line's callsign is still tidied in three bodies.** Filed, not fixed (D489), as point (5) of
  `[STACK-LEFTOVERS]`.
- A hardening remark, not a finding: the board's Templates menu itself has no look check, and no route reaches it.

**What the fixes touched was looked at again.** The test file passed 7 of 7. Steps 1–5 were walked again (see "After the
two reads" above). The kept finding's comment is a comment only, and the rebuilt bundle walked the same.

## Faults the look found in itself

The first before-run's history step failed at both sizes. The changes window opens on "New to you", which never lists
a person's own changes. The script now presses "All changes" first, and reads the line's chip as drawn ("Mission role",
capital M). This was a fault of the script, not of the app.

## React Doctor (D1534)

`npm run lint:changed` reported no new finding.

- `engine/mission-role.ts`: fixed. The resolver reads the context's two parts before they are written, and no longer
  parses back the string it has just built.
- `state/mission-roles.ts`, the JSON clone: kept, with its reason. Saving and reloading hold an answer as JSON, which
  drops a key set to undefined; a structured clone would keep it.
- `ui/mission-role-offer.ts`, the list look-up: kept, with its corrected reason.

## Not walked, and why

- The hover titles on Undo and Redo: they show the same words as the note.
- The board's "Not yet signed": the test covers it, and it is drawn by the same rule as the week's chip, which was walked.
- His iPhone itself: the phone size here is Chromium's touch emulation at 390×844, not his iPhone.

## Gates

On his PC:

- the new test file, 7 of 7;
- every unit test file that reads the mission role, the change history's lines, Undo's words or Insights, 33 files and
  554 tests, all passed;
- `npm run build`, twice, under the lock;
- `npm run lint:changed`, no new finding.

GitHub's run of the pull request is the job's full check (D1086).

Walk: docs/handpass/2026-11-08-insights-leftovers.md · 29 pictures · 5 surfaces · 10 orders · MISSING: none (4 low read findings fixed, 1 tidiness note filed as [STACK-LEFTOVERS] (5))
