# Section 1, step KR — the red-first tests: the test writer's report (chat A211, 28 Nov 26)

From the brief `2026-11-28-msq-s1-kr-redtests-brief.md`, written by a fresh Opus test writer on branch `a211-s1`
(worktree `a211-s1-kr-dd0560`). Test files only; no app source touched; nothing committed or pushed.

## What was written

1. **New: `raptor-port/src/ui/msq-guard-drops.test.tsx`** — 60 tests and 2 todos, by the plan §8.1's D1–D8 with his
   D2836–D2838 folded in. Every press is the whole sequence on the real controls; every test names its door, its family
   and the result after KR, and cites D2825 (and D2838 / D2837 where they apply).
   - **D1, by door** (13): the pick (bar, ☰), the switch to the member view (badge, ☰), the switch back (badge), a bell line,
     the lit bell (an access request), the bell's OIL tap, his SANS reminder, a holiday's line, the page door (a line of his
     own squadron from one he only views), the Undo of "+ New squadron" with 151 picked, row 13's landing (a belt: the
     Undo engine). Each with the Input window open and words typed (the Undo's door: the Calendar with a holiday typed):
     through, window closed, words stored nowhere (every store searched: the scheduler's, each war world, the Tracker's),
     no note, nothing held.
   - **D1, by family** (16 + 1 todo), each by the pick of 149: a Users row changed **[U2]**, a Users row opened unchanged
     **[U2]**, Give access **[U2]**, "Add a person" **[U2]**, "+ New squadron" blank and typed, the Calendar with a holiday
     typed, a new holiday kept waiting for a leave period (D2837: dropped), Inputs calendar settings changed, Quals' words,
     the OIL question from a list row, the OIL list with a pick, a Leave War sheet held until Save (a Required row's
     Rename), a Tracker window (✎ Edit details typed), a lull pop-up behind the phone's Flow chart tab (by the ☰ list),
     the board's cancel-reason box. Todo: a SAVED holiday changed and kept waiting — its set-up is not reached by a
     press I could confirm.
   - **D2** (12): each door but the OIL tap (its Retry note has no ending of his — Q1 held), a window with words open and
     a failed save: refused with the Retry note (words from the tables), the window still open, nothing changed; Retry
     lands, the press again goes through.
   - **D3, D2838** (8): a template time "0730" focused → 142's template 07:30, 149's untouched; a plan name half typed →
     142's plan renamed; a plan name emptied → dropped, no warning; the Inputs day's new note in the people picker → on 142
     with no people, 149 none; a held bid's Remarks, the day's list's bid Remarks, an approved leave's Remarks box → each
     on 142 (Hunter, Plan of 149, his war following the pick); Logic's "13h" waiting its beat + a bell line → 142 13h,
     149 12h (a beat later too).
   - **D4** (3): a person's window on the Leave War, the pick: no sheet mounted, nothing held, no held band at any
     moment, the war never swapped under a sheet; the Events list open; its presets with a refused name focused.
   - **D5** (2): the template box's save, started by the closing, fails → refused with the Retry note, 142 in view, the
     window closed; a press during that wait → nothing made, nothing said. (A stand-in, named so in the file: the
     templates' store key written counts as a change to a saver the test answers.)
   - **D6** (4): chart moves + an "Add event" prompt, the pick by the keys → prompt gone, its job ended, the question
     drawn, Stay keeps the edits; the same by the badge; an import of three charts stopped at the second's question by a
     pick → the first stays, the third not imported, no further question; the Tracker's question standing, a second door
     by the keys → the new question drawn.
   - **D7** (1): the OIL list's card (the list left over 150 by the raw entry — a belt) with the OIL question waiting
     beside it → 142, the list open for 142, the question closed, the card's input open.
   - **D8** (1 + 1 todo): row 13's landing (the engine) with an Input window and words → through, closed, dropped, and
     the Redo of that Undo still offered (then pressed). **Todo, and a finding about the plan:** D8 as written (Logic's
     value typed at row 13's landing) is a state no press reaches — row 13 needs his own pages on another squadron than
     the one in view (a View holder's, D2197), and a View holder sees only View-only Sched and Help there; anyone who can
     type on that squadron's Logic has his own pages follow the pick. Logic at a landing is K8c's hard case on row 21's
     road (already pinned in `msq-guard-doors-undo.test.tsx`).
2. **New helper: `raptor-port/src/test-support/msq-guard-drops-kit.ts`** (a plain `.ts`): the store search, the "no note"
   check, the Input window with words, a filing through the app's own door, the presses the door files keep local (☰
   pick, the switch, the bell's lines, the holiday's line, "+ New squadron" then 151 picked, Ranger's row-13 set-up), and
   a press by the keys.
3. **R10 in `raptor-port/src/ui/msq-guard-rollcall.test.ts`**: every `window`, `row` and `closes` row of `GUARD_ROWS` has a
   `close`, with the check's own planted-case test and one named exception: `trkask` (the Tracker's question, which the
   plan §3's table says a door never closes — D2825 keeps it). **Note for KR's builder:** R8 still says "no other row
   carries a closer"; it turns red the moment the first window row gains one — the plan §8.2's "R8 widened", KR's to change.

## Red first — run on today's code

`npx vitest run src/ui/msq-guard-drops.test.tsx` (from `raptor-port/`): **58 fail, 2 pass, 2 todo.**
`npx vitest run src/ui/msq-guard-rollcall.test.ts`: **R10's main test fails** (26 rows with no closer: every window and
row but `trkask`); its other two tests and the file's 49 others pass.

**Every failure is for the right reason** (each read from the run):
- D1 by door, all 13: refused — the squadron, the view or the Undo did not move (the bell's OIL tap: 149 still in view,
  the old window still up; the Undo: 151 still there; row 13: the leave not undone).
- D1 by family, 15 of 16: the pick refused ("through: expected 142 to be 149"); "+ New squadron" opened blank: the pick
  goes through today, but the form is still open after it.
- D2, all 12: the note is the window's lead ("close the open window…", at the Undo's door "cancel the new holiday…")
  where D2825 leaves only the Retry note.
- D3, 7 of 8: the pick refused (the template, both plan names, the Inputs day's picker, the held bid, the day's list,
  the leave's Remarks box).
- D4, all 3: the pick refused by the open war sheet.
- D5, both: the window's note at once, the window still open.
- D6: the prompt still up where the question should be (pick and badge); the import's question refuses the pick; the
  pick's question still up where the badge's should be.
- D7: the card refused silently (150 still in view) by the OIL question beside the list.
- D8: the Undo refused by the open window.
- During the work three failed for a wrong reason and were fixed: the import file's chart ids were not valid ids; D8's
  first version (Saber) was not row 13's road at all; Logic's D3 read 142 without first closing the window the bell line
  had opened, so the pick back was refused.

**Passing on today's code (not faults; listed):**
- `D1 — [U2] a Users row opened and left unchanged — by the bar's list` (unchanged, it never refused).
- `D3 — (may pass today) Logic's Crew rest, "13h" just typed …, a bell line of 149` (the mode's end already writes the
  waiting value to 142, as A3's test pins).
- The brief expected D2 to pass "mostly": it does not, because each D2 test has a window with words open beside the
  failed save, as §8.1 says — today the window's note wins (D2627 A10's order). Pure "Not saved" with nothing else open is
  already pinned by B10 in each door file.

## Marked [U2] — re-check once chat S2's U2 lands

The four D1 family tests that press Admin → Users: a Users row changed, a Users row opened unchanged, Give access,
"Add a person". (The "+ New squadron" pair is Admin → Squadrons, not U2's panel.) No off-limits file was touched.

## Seen, not checked

- Saber (master admin), with a leave of his own filed on 142, picked 149 and pressed Undo through the engine: his 142
  leave was undone with 149 still in view. That is the K10 root's "Undo or Redo across squadrons" (Build 3), not KR's;
  left for it.

## Footer

Status: READY FOR INDEPENDENT REVIEW (tests only, red first as required)
Changes: new `raptor-port/src/ui/msq-guard-drops.test.tsx`; new `raptor-port/src/test-support/msq-guard-drops-kit.ts`;
R10 added to `raptor-port/src/ui/msq-guard-rollcall.test.ts`; this report.
Checks (all from `raptor-port/`): `npx vitest run src/ui/msq-guard-drops.test.tsx` — FAIL as intended (58 red, 2 pass,
2 todo); `npx vitest run src/ui/msq-guard-rollcall.test.ts` — FAIL as intended (R10 alone red, 51 pass);
`npm run lint:changed` — PASS for these files: its only findings are the known one, `ui/UsersPanel.tsx`'s complexity
(three places in that one file), nothing in the new or changed test files. Never run: the build, the full suite, a browser test, `msq-guard-open.test.tsx`.
Open items: (1) R8 must widen with KR (see above). (2) D8's Logic case is unreachable by a press — the builder's call
whether a belt is wanted. (3) The saved-holiday-changed-and-waiting family is a todo. (4) The tests' assertions after
"through" have never run green (KR is unbuilt): a few may need a premise adjusted once the doors pass — never an
expectation weakened. (5) This copy had no packages: `raptor-port/node_modules` is now a junction to the main folder's —
unlink it, never delete through it, before removing the copy.
