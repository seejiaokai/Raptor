# D814 — a fresh, blind Opus read of the fix (commit `8cf82d7ab`)

Read 13 Oct 26 on `claude/inputs-schedule-batch`, by a reader that did not write the change and read neither the
evidence sheet nor any other reader's report. Read-only: nothing built, no browser run; one unit file at a time.
Scope: the six edits of the commit under `raptor-port/src`, every caller of `oilGate`, every other reader of "does this
input still need an OIL answer", and the two test files. Rulings opened in full: D814, D804, D760, D783.

## Verdict

**The fix is right and complete for what the ruling says: no high finding, no "still asks".** Each of the six edits is
correct. Every one of the thirteen callers of `oilGate` hands it the saved record itself (or nothing, for a brand-new
input, which cannot be cancelled), so no door still prices a question for a cancelled or information-only input, and
none wrongly skips a different input. Every other reader of "needs an answer" — the "OIL?" tag and button, the window's
two OIL lines, the one list and its save, the member's bell, the schedulers' holiday line and its count, the notice a
new holiday makes — now agrees; the credit side (which already ignored these inputs) was not touched, so a published
day's pending count, its sign-offs and what it credits do not move because of this change. Nothing is cached stale: the
mark off, all of it comes back on the next draw. **One medium finding, and it is the other side of the fix rather than a
fault in it:** now that a cancelled input is quiet at every door, the door that takes the CX (or ⓘ) OFF is the one
moment its OIL question re-opens — and that door asks nothing; and in one order of events the schedulers get no bell
line and no list either, which the ruling's own reading (3) and `engine-rules.md` say they do. Reproduced. It rests on
a reading the builder told the owner, so the fix needs his word. Two low notes on the tests.

## Findings

### F1 — MEDIUM — the CX (or ⓘ) taken off re-opens the OIL question and asks nobody; in one order the schedulers are not told at all

**Reproduced** (scratch tests, deleted: `OPUSREAD-A`, `-B` on a copy of `src/ui/oilwait.test.tsx`; `OPUSREAD-1`, `-2`
on a copy of `src/leavewar/holnotice.test.tsx`).

**The failure, two faces of one cause.**

1. *A door skipped while cancelled, then the CX off.* A Duty of Bane's on Saturday, no answer; the scheduler puts CX on
   its row; takes it off the programme; presses Accept — no question (correct, D814); then takes the CX off. The app:
   the input stands on Saturday's programme, live, with no OIL answer; no question was put, no bar; the scheduler who
   did it has nothing on his bell; only Bane's own bell and the "OIL?" tag on the Inputs page say so. The same
   put-back WITHOUT the CX waits on the question (D793 — probed in the same test). The same end state is reached by
   replacing the input's only person while it is cancelled (his answer is voided, the new man is not asked —
   `OPUSREAD-B`), or by dragging it onto a weekend or holiday on the Inputs calendar while cancelled (`OPUSREAD-E`
   confirmed the drag asks nothing). Should: D783 / D793 — a change that raises the OIL question is not made until it
   is answered; this is that rule at the one door D814 newly made matter.
2. *A day made a holiday while its only unanswered input is cancelled.* Harpoon's Gate duty on a working Friday,
   cancelled; Friday is made a public holiday — nobody is told and no list opens (correct, D814). The CX comes off.
   The app: the input is in the one list's count and lights Harpoon's own bell, but **no scheduler has a holiday line,
   the list never opens and cannot be reached** (its only doors are the line and the holiday's own save). Should:
   D780 ("the schedulers are told … never silent"), D783 (6) (one bell line a holiday, counting what is left) — and
   D814's reading (3) / `raptor-port/docs/engine-rules.md` line ~2427 ("the three signs come back by themselves"),
   which is true only where a holiday notice already exists (`OPUSREAD-2`: there the count falls by one and returns).

**Cause.** `raptor-port/src/ui/reqdoor.ts` `rowMark` (lines 392–407): with `on === false` it clears the mark, stamps
and saves — it never asks the gate. And the schedulers' line is a STORED notice, pushed only by
`raptor-port/src/leavewar/sync.ts` `tellHoliday` (line ~930) when `oilOpenOn(from, to).length > 0` at the moment the
day becomes a holiday — which a cancelled input, rightly, no longer counts toward.

**Exact fix — needs his word, because it changes reading (3) as it was told to him.**
- *(a) the consistent one (recommended — D754: the same everywhere):* in `rowMark`, when a `cx` or `info` mark comes
  OFF and the other of the two is not set, go through this file's own `gated(...)`: `gate: () => oilGate(draftOf(inp),
  { ...inp, [what]: false })` (the record as it would stand), `make: oil => saveBatchX(() => { clear the mark;
  if (oil) inp.oil = { ...oil }; stampChanged(inp) })` — the un-mark and the answer one command, one Undo; answered or
  nothing to ask, it is made; not answered, it is not, and the bar says so. It needs one new kind in
  `ui/oilwait.ts WAIT_WORDS` / `CHANGED` and `state/view.ts OilWaitKind` — its three wordings are his to approve
  (e.g. "Keep it cancelled" / "Bring it back" / "Still cancelled — OIL not answered"). `ui/board.ts` 1122 and 1141
  then treat `'asked'` as "not done yet" (no toast). This closes both faces.
- *(b) the small one, keeping reading (3):* leave the door silent, and make face 2 true — in `rowMark`'s command, when
  a mark comes off and the input then has an unanswered day that is a public holiday no scheduler's notice covers,
  push that holiday's notice (export a thin wrapper round `tellHoliday` from `leavewar/sync.ts`, opening no list).
  Face 1 then stays as the builder's reading: "the next door that would ask, asks".
- Either way, correct the sentence in `engine-rules.md` (~2427) to what is built.

### F2 — LOW (tests) — one edit of the six is held by no test; three doors and the window's Save are held only at the gate

**Read, not reproduced** (the source may not be changed; see "The tests" below for what was run).
- The pending signature (`leavewar/sync.ts` ~2211, `!oilSilent(r)`): put back to `r.acc !== 'r'`, no D814 test fails.
  Its only effect is one extra repaint of the scheduler side — harmless either way, but it is the sixth edit and
  nothing pins it.
- The ruling names "a save": no test presses the input's own window's Save on a cancelled input (`inputedit.tsx`
  2550 / 2606 — a window that handed the gate nothing in place of its record would still pass). The swap / add / move
  on a cancelled input's row (`reqdoor.ts gated`), the Unavailable row's hand-over (`reassignInput`) and the Inputs
  calendar's drag (`caldrag.ts`) have no D814 test either — all share the one gate, and my probes of the swap and the
  drag were right.
- A new holiday on a day whose only unanswered input is cancelled "tells nobody and opens nothing" — true (probed),
  unpinned.
- Fix: one test each — (i) `tellHoliday` with a cancelled-only day leaves `NOTICES` empty and `pops.OILLIST` null;
  (ii) `rowPut` on a cancelled input's row answers `'done'` with `view.OILWAIT` null; (iii) the window's Save on a
  cancelled weekend input closes with no `oilConf`.

### F3 — LOW (the record) — "seven failed before" reads six

**Reproduced.** With the two helpers put back to their pre-fix meaning (a module mock: `oilNeverEarns` → never,
`oilSilent` → taken-off only), SIX of the D814 tests fail and one passes: `(D814) the mark taken off again, the input
needs its answer again: the next put-back asks` passes with or without the fix. It is a sound guard — `rowMark` leaves
`cx: false` on the record, so a fix that tested "has a `cx` field" would fail it — but it is not a red-first test, and
the commit message's count is one high. Nothing to change in the code; the evidence sheet should say six and one guard.

## Question 1 — the six edits, and every caller of `oilGate`

All six are right: `oilNeverEarns` / `oilSilent` (`engine/inputs.ts` 826–827) are null-safe and read `cx: false` (what
`rowMark` leaves) as not cancelled; `oilGate` tests the saved record after the kind test and before the draft is
normalised, so a bad draft on a cancelled input is still refused by the save itself, in the save's words; `oilSilent`
keeps "filed under Unavailable" (`acc: 'u'`) asked, as D804 rules.

| # | Caller | What `prevRow` is | Verdict |
|---|---|---|---|
| 1 | `ui/inputedit.tsx` 1532 — Unavailable row, one of several replaced | the live record, found by id | right |
| 2 | `ui/inputedit.tsx` 1562 — Unavailable row, the only person handed over | the live record (draft names the new man) | right — a cancelled input's new holder is not asked |
| 3 | `ui/inputedit.tsx` 1625 — `askOilIfPending` | the live record | right |
| 4 | `ui/inputedit.tsx` 2296 — the window opened for a question (bell, row) | the window's record | right — closes itself where nothing is asked |
| 5 | `ui/inputedit.tsx` 2550 — the window's Save, several people | `rows[0]` = the saved record; `null` only for a new input | right |
| 6 | `ui/inputedit.tsx` 2606 — the window's Save, one person | the saved record; `null` only for a new input | right |
| 7, 8 | `ui/inputedit.tsx` 2888, 2903 — "Change…", "Answer…" | the saved record | right — and both lines are no longer drawn |
| 9 | `ui/InputsPage.tsx` 375 — the List's OIL / OIL? chips | the row's record | right — the chips are no longer drawn |
| 10 | `ui/interactions.ts` 799 — Accept, → Unavail | the live record | right (the committed tests) |
| 11 | `ui/reqdoor.ts` 276 — a puck on an input's row (swap / add) | that row's input | right (probe B) |
| 12 | `ui/reqdoor.ts` 377 — a move between two inputs' rows | the input he moves INTO | right — out of a cancelled one into a live one still asks |
| 13 | `ui/caldrag.ts` 166 — the Inputs calendar's date drag | the live record | right (probe E) |

No caller passes nothing, or another input, for a cancelled one. No caller has a cancelled `prevRow` while saving a
different input. A retype or a re-date does not take the mark off (D760: it goes with the input), so "retyped and
should be asked" does not arise. A new input is never cancelled: only the board's three buttons set the marks
(`ui/board.ts` 1122, 1129, 1141 → `rowMark`), and a member's save that changes one is refused (`state/perms.ts` 645).

## Question 2 — everything else that reads "does this input still need an answer"

| The reader | Agrees / still asks / n.a. | Where |
|---|---|---|
| `oilAnswered` — whether "Change…" / the List's "OIL" chip shows | agrees (changed) | `ui/inputedit.tsx` 753 |
| `oilUnansweredDay` — the window's "Not answered yet" line, the List's "OIL?" button (one person) | agrees (changed) | `ui/inputedit.tsx` 768; `ui/InputsPage.tsx` 829 |
| `oilSignDay` — the card's "OIL?" tag (opened day, phone List), the List's "OIL?" button (several) | agrees (through the above) | `ui/inputedit.tsx` 784; `ui/InputsCal.tsx` 1044; `ui/InputsPage.tsx` 663, 839 |
| `oilSummary` — the window's OIL line | n.a. — drawn only where `oilAnswered` | `ui/inputedit.tsx` 792, 2883 |
| The window's Save (one person; several) | agrees (gate) | `ui/inputedit.tsx` 2606, 2550 |
| The window opened by a question | agrees (gate) | `ui/inputedit.tsx` 2288–2302 |
| `askOilIfPending` — the question that follows a save | agrees (gate) | `ui/inputedit.tsx` 1612 |
| `setInpField` — a time typed on a row | agrees (gate, and only off the schedule side) | `ui/inputedit.tsx` 1685 |
| `oilFirst` — the Unavailable row's person, the calendar drag | agrees (gate first) | `ui/inputedit.tsx` 1413; `ui/caldrag.ts` 158 |
| `gated` — a puck dropped on an input's row: swap, add, move | agrees (gate first) | `ui/reqdoor.ts` 147, 272, 374 |
| `afterPut` — the note after someone is added | n.a. — words only | `ui/reqdoor.ts` 196 |
| Accept / → Unavail | agrees (gate) | `ui/interactions.ts` 791–818 |
| `reviseOil` — the List's chips | agrees (gate; chips not drawn) | `ui/InputsPage.tsx` 374 |
| `oilPendingFor` — the member's (or filer's) bell | agrees (changed) | `leavewar/sync.ts` 811; `ui/topbits.tsx` 60, 83; `ui/Shell.tsx` 310 |
| `oilOpenOn` — the one list | agrees (changed) | `leavewar/sync.ts` 859; `ui/OilDayList.tsx` 47 |
| `saveOilDay` — the list's Save | agrees — it re-reads the list, so an input cancelled behind an open list is not written (probe 3) | `ui/oilday.ts` 28 |
| `holidayLeft` → `noticeLeft`, `noticeLive`, `holidayLineOn` — the holiday line and its count | agrees (probe 2); its kept count is dropped on every store change | `leavewar/sync.ts` 881; `state/notices.ts` 213–249 |
| `tellHoliday` — the notice a new holiday makes, the list opening by itself | agrees — a cancelled-only day tells nobody (probe 1); **but see F1, face 2** | `leavewar/sync.ts` 914 |
| The pending signature | agrees (changed) | `leavewar/sync.ts` 2210 |
| `rowMark` — the CX / ⓘ put on or taken off | does not ask when the mark comes OFF — **F1** | `ui/reqdoor.ts` 392 |
| OIL Earn: the row's switch, the puck's reason, the line under Personal Inputs | n.a. — reads what the day credits, which already said "cancelled / information only, nothing is earned" | `ui/oilmode.ts` 566–604, 683–684; `ui/board-html.ts` 683 |
| The credit: `landedStanding`, `projectOilInputs`, `oilInputEligible`, the evidence key | n.a. — untouched (one comment), already ignores these inputs | `engine/oilev.ts` 377, 444, 948, 1069 |
| `voidedOil` / `repricedOil` — which answers a change leaves | n.a. — never asks | `engine/oil.ts` 117, 133 |
| The member's command check on an OIL answer | n.a. — validates an answer, never asks | `state/perms.ts` 688–701 |
| The crowd of a non-asking input for ALL AVAIL | n.a. — already leaves out cancelled / ⓘ | `engine/oilev.ts` 626 |
| The member's "taken off / put back" notices | n.a. — not about OIL | `state/notices.ts` 98–99 |
| The schedule's own checks | n.a. — no advisory reads an unanswered input | `engine/validate.ts` |

**27 readers: 17 agree, 9 not applicable, 0 still ask; 1 (`rowMark`) is F1.**

## Question 3 — what it broke

- **Nothing a person needs is lost.** While cancelled, the standing answer cannot be read or changed anywhere on
  screen (the window's OIL line and the List's chip are gone with the mark); it counts for nothing meanwhile, the
  window says the input is cancelled (D771), and the CX off brings the line, the answer and "Change…" straight back
  (probe C). Worth knowing, not a fault: the old answer starts counting again the moment the CX comes off, unasked —
  the ruling's reading (2).
- **The CX off again:** `rowMark` writes `cx: false` and drops the reason; the tag, the window's lines, the one list,
  the member's bell and the gate all read the record live and are back at once (the committed tests; probe A). No
  memo is keyed on the old state: `engine/oilev.ts` reads the input's marks afresh at every projection (its only memo
  is of a stashed week's rows, keyed on the stored text, and a cancelled input returns before it); the holiday line's
  kept count is dropped whenever the store's version moves, which `rowMark`'s command and notify do; the pending
  signature is only compared. The row on the schedule loses its copy of the mark in the same pass
  (`engine/overlay.ts` 385–387).
- **A published day:** none of the six edits is read by the pending count, the sign-offs or the credit
  (`oilNeverEarns` / `oilSilent` are imported only by `ui/inputedit.tsx`, `leavewar/sync.ts` and the browser-test
  bridge). Probe D: on a published Saturday a cancelled input taken off and put back asks nothing, writes no answer
  and leaves nothing pending. If anything the day is quieter than before — a question answered for a cancelled input
  used to write an answer the comparison then read as a change.

## Question 4 — the tests

Run as committed: `src/ui/oilwait.test.tsx` 62 of 62 pass; `src/leavewar/holnotice.test.tsx -t D814` 2 of 2 pass.
Run against the pre-fix meaning of the two helpers (a module mock in a scratch copy, deleted):

| Test | Without the fix | For the reason its name gives? |
|---|---|---|
| a cancelled input put back with Accept is asked nothing | FAILS — "no question: expected { kind: 'back' … } to be null" | yes |
| a cancelled Other filed with "→ Unavail" is asked nothing | FAILS — "… { kind: 'file' … }" | yes |
| an information-only input put back … | FAILS — the same | yes |
| an information-only Other filed … | FAILS — the same | yes |
| the mark taken off again … the next put-back asks | PASSES | a guard, not red-first (F3) |
| a cancelled input and an information-only one are not listed, wear no sign, light no bell, are priced no question | FAILS — at "no unanswered day" | yes for the tag, the sign and the gate. The list and the bell lines of it could not be reached by the mock (this suite's setup loads `sync.ts` before a mock can apply): by reading, the pre-fix test `row.acc === 'r'` keeps a cancelled input listed and its bell lit, and each of the four is asserted on its own line, so each edit put back alone fails it |
| an answer given before the input was cancelled stays, and "change my answer" goes with the mark | FAILS — "nothing to revise while it is cancelled: expected true to be false" | yes |
| the two "(D804, the reads)" pins | pass either way | pins, as their comment says |

Claims of the ruling no test holds: listed in F2. Also: both `holnotice` tests set `cx` / `info` straight on the record
rather than through the board's button (the `oilwait` tests do use the button), and the "OIL?" tag is asserted as a
value, not as drawn.

## What I did not read

- `raptor-port/docs/handpass/2026-10-13-inputs-batch.md` and every other `read-*.md`, as briefed; the break-test list
  (`docs/handpass/breaks/2026-10-13-inputs-batch.json`) — so "breaks 31–36: 6 of 6 caught" is not checked here.
- The running app: no build, no browser. Every "is drawn / is not drawn" above is from the code and the unit tests.
- `ui/OilConfirm.tsx`, `ui/OilWaitSheet.tsx`, `ui/InputCard.tsx` beyond their use of the readers above; the Leave
  War's OIL tracker and its credit pass (`runOilPass`, `desiredOilCells`) beyond confirming they do not read the two
  new helpers; `engine/validate.ts` beyond a search for an advisory on an unanswered input (none).
- The whole unit suite was not run (a full check held the PC): only the two files named, one at a time.
- The pending-signature edit and the list/bell half of the holiday test were judged by reading, not by a failing run.

Tidiness (three lines, filed not fixed): `oilNeverEarns` and `inputSilent` (`engine/inputs.ts` 803, 826) are the same
test under two names — fine while the reasons differ, but a third mark must be added to both. The comment at
`inputs.ts` 824 says "the three signs"; four readers and a signature use it. `ui-contracts.md`'s put-back section does
not say a cancelled input is not asked — one clause would do.
