# S2 step U1's third fix round — the builder's report (a Fable helper, for chat 205, 26 Nov 26), saved by the host from the builder's reply

Brief: `2026-11-26-msq-s2-u1fix3-brief.md`. Built tests first; reviewed by the orchestrator before the commit. **A
permissions change: the four readers' read of this round and the walk are owed.**

## Files

`src/ui/UsersPanel.tsx` (the only app file); `src/ui/msq-s2-rejudge3.test.tsx` (new, 37 tests, §12–§15);
`src/ui/msq-s2-rejudge2.test.tsx` (header; §9 +3, §8 +1 — no existing test changed);
`src/state/edit-rights-readers.test.ts` (one inventory entry widened, below); `docs/data-schema.md` (one clause in the
edit-rights table), `docs/file-map.md`. `ui/usersfilter-model.ts` not touched.

## What changed, item by item

1. **The note as the app takes the Admin page away** — `useNoteAsPageGoes` + `takenAwayUnder`. The page keeps the open
   row of its last draw in a ref (written in an effect, read only in the unmount clean-up) and judges once as it goes.
   The note only when ALL hold: the row was on the page at the last draw; the role in force is still an admin's
   (`isAdmin()`); **the Admin page is no longer offered to him (`!pageOffered('admin')`)**; the man is not deleted;
   `rowChanged`; not `closedByHisPick`. No core file edited.
2. **A pick put back by hand is let go** — `ForeignEditor`'s `onPick`: `setPicked(v === lineNow ? null : v)`, plus one
   line `if (rowChanged(p.pid, p.on)) p.onStale()` (a press that changes no state would otherwise not redraw, and round
   2's "a line picked in his open short row closes it" would lose its redraw).
3. **No note about a row not on the page** — the row still closes; the note only if it was drawn at the last draw. Form:
   a state value compared while drawing (as `hold` does); no ref is read in a draw.
4. **An open row that leaves the list by no act of his closes with the note (fix B)** — drawn at the last draw, not
   drawn now, and his search, ticks, fold tap and the row's own writes unchanged → close, the note once. Where he put it
   away himself: held, no note, as today. Applied to any open row, not only a Plan holder's short row.
- Items 3 and 4 share one held value, `PageAt` / `SeenAt` (`{ pid, drawn, q, filt, arch, wrote }`), set at the press
  and held again on each draw the row survives; `useOpenRowJudged` now runs after the list is worked out. `onWrote`
  (new, on the archived row): Save name is the one write that leaves a row open, and a rename the search no longer
  matches must not read as "left by no act of his". The comment above `ForeignEditor` narrowed: "stays open… while he
  stays on the page's list".

## Each reader's case — failed before on 7338bf1fc, passes after

Opus 1 = Fable 1 (one test, whole `<App />`; and under StrictMode) · security 1, both cases · Fable 2, both cases and a
third (hidden by a Role tick), its control a pin · Fable 3, both cases re-pointed (the row closes, the note once, a
later search shows it closed), plus strict mode and the same on a whole row. Astra: no finding. Fable's proof 0, all 15:
eleven pins in §15, the four whole-app ones in §12. Before-run: rejudge3 9 failed / 28 passed; rejudge2 2 failed / 49.

## Silent leavings — one whole-app test each (§12)

Another tab pressed · the same after the row changed unseen · Logout · the member view · his own View-only pick from
149's page · from 142's own page · his own pick where the page stays · a row already closed, then Plan lowered · a row
hidden by his own search, then Plan lowered · the man deleted in the same moment · **pin, as built today: made a member
by another admin — the Admin page goes, its own refusal words show, no note** · pin: Plan TAKEN keeps the page, the note
once, not again when he later leaves. Each term of the fix was removed in turn (12 one-line changes, restored and
byte-compared) and each made exactly the test meant to hold it fail.

## Checks run by the builder (from `raptor-port/`, one file at a time)

39 files, 853 tests passed, 0 failed (4 todo, older, in msq-guard-asis): rejudge3 37 · rejudge2 52 · rejudge 23 · row 15
· asis 24 · users-row 7 · s2-lists 14 · users-filter 24 · guard-open 174 · guard-g 13 · onedoor-users 22 · accounts-ui
21 · accounts-newperson 26 · state/msq-s2-plan 4 · state/msq-s2-order 14 · guard-rollcall 17 · guard-asis 29 · the rest
as round 2's list, plus admin 5 · memberview 7 · odds 17 · inputsfor-readers 3 · unit-setting-guard 3 · vconf-readers 2
· toastblocked 10 · noteswords 120. Type check of the app's files: exit 0 (supporting only). Document check: OK. Not
run by the builder: the changed-code check, the build, the full suite, browser tests, the running app.

## For the readers and the host

1. **The edit-rights inventory** went red on the new `isAdmin()` call (its guard counts every caller): listed for
   `ui/UsersPanel.tsx` as kind `role` with its reason (it decides only whether a note is said; offers no control, gates
   no write), and the clause added to `docs/data-schema.md`.
2. **`!pageOffered('admin')`** — beyond the reader's trial: without it a tab press after an unseen change would say the
   note. Consequence: an account put on another person, or a suspension, under an open row stays silent — the family
   of "made a member".
3. **Fix B's reach** is any open row (a whole row whose man a Role tick stops keeping after another admin's change now
   closes with the note).

## What a person sees differently (no new words — only the existing amber note)

His Plan of the squadron in view lowered to View while a row is open: he lands on that squadron's View-only Sched as
before, and now sees the note. A row he had hidden himself that then changes: no note; brought back, it is closed. An
open row whose man drops off the list through someone else's change or his own Undo: the row closes with the note;
found again it is closed. Short row: View pressed then the held line pressed again is a truly untouched row.
