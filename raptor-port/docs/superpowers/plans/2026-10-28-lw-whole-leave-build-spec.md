# [LW-WHOLE-LEAVE-WINDOW] — build spec (28 Oct 26)

**His rulings:** D1448 (a tap on any day of a leave of several days opens the whole leave; any one day still decided or
changed alone), D1461 (version 2: the title names its dates, the grid marks its days, and at the right end of the Duration
row, in place of "Pick a range", "All <n> days" — picked to start with — or the day tapped chooses what Approve, Refuse,
Move and Delete act on; the window keeps its height), D1462 (the title's dates the size of the name, white — already
built), D1463 ("Auto-approve" — already built), D1289 (the day tapped wears the cyan selection mark while its window is
open — the drawing shows it). The design of record: `docs/img/handpass/2026-10-28-lw-whole-leave/v2-all.png`, `v2-one.png`
(drawn by `scripts/handpass/lw-whole-leave-mock.mjs`). **Check:** FULL (it decides leave — saved data).
**Branch:** `claude/lw-whole-leave-window`, cut from `main` at 603feaa93 (M4 merged).

## 1. What "a leave of several days" is — the one entry the app already knows

The grid's joined bar (D1359, `ui/MatrixRows.tsx entryKey`) and the Approvals list's one line (`approvals.ts linesOfWar`)
already agree on what one leave is. The window uses the same answer, so the three never disagree:

- **A bid (pending or refused):** the days in a row, from the day tapped back and forward, each holding a request with the
  same run key (`state/store.ts reqRunKey` — its kind, state, words, till tick and documents). Found from the day's one
  request (`heldRequest`); a day holding two requests is not a run start (it opens the day's list anyway).
- **A leave the war approved:** the days in a row holding the same Input (one input id, `absencesAt … c.id`), war-approved
  (`c.lw`) — the one the window's Remarks row already speaks for (`approvedRow`).
- **Bounded by the period holding the day tapped** (`warHolding`): the Approvals list draws a line per period, and the grid
  shows one period, so a run crossing 31 Dec is two leaves here too.
- More than one day → the window opens whole. One day → the window as built, unchanged ("Pick a range" stays).
- **Not in scope, unchanged:** leave filed on the Inputs page (its read-only window); a course, an overseas duty or an
  Other (not leave — D1461 says leave); a day holding two entries (it opens the day's list).

One new store reader: `leaveRunAt(personId, date) → { kind: 'request' | 'absence'; from; to; dates; recs: MoveRec[];
parts: DecidePart[]; state } | null` — null for a single day or nothing. Pure read, no write.

## 2. The window

- **Title:** "All" picked → the run's dates in the drag window's voice (`BidBits compactSpan`: "13–16 Apr"; "30 Dec 26 –
  2 Jan 27" never occurs — bounded by the period); the day picked → today's `dayLabel` ("Tue 13 Apr").
- **The Duration row's right end:** two chips in the pchip look, "All <n> days" and the day tapped ("Tue 13" — weekday and
  day of the month), the picked one lit as "Whole day" is lit; "Pick a range" is not drawn. n = the run's days.
- **Opens on "All"** (D1461). The pick is window state only — never saved, never remembered.
- **Height unchanged** — the chips take "Pick a range"'s place on the same row (test: one line at 402).
- **The grid marks what the window acts on** with the drag-selection's own cyan (`matrix.css td.selcell`): every day of the
  run on "All", the day tapped on the day, the picked range on a range, the day tapped on any other window. Painted onto the
  cells while the window is open, taken off when it closes (class on the cell, never a grid repaint — `docs/performance.md`
  §E, the way `cellring.ts` rings a cell). A picked day's joined bar shows its own box (the stylesheet's `td:not(.selcell)`
  join rules — the drawing shows this).

## 3. What acts on what is picked

| Control | "All <n> days" | The day tapped |
|---|---|---|
| Approve / Refuse | the whole leave as ONE line — `store.decideRequests([{ personId, parts, to }])` (Approvals' writer: one command, one Undo; a refusal by the rules leaves the line exactly as it was and its reason is said in the window) | as built — `setBidStates([that day])` |
| Lit Approve / Refuse tapped again | the whole leave back to pending (`to: 'pending'`) | as built (that day) |
| Move | the leave's own records only — `onMove(runCells, only=recs)` → `moveSel.only` (the day's list's per-record path, D266); an award or the other half's bid on those days stays | as built |
| Delete | the leave's own records only, in ONE command — new `store.clearRecords(recs)` (requests by the same gates as `clearRecordById`; a war-approved leave by `DOOR.removeApproved`); awards and other entries on those days stay, so no award confirm | as built (the day's Delete with its award confirm, D260) |
| A leave button (re-type) | every day of the run, as a picked range writes today (`setCellRange` / `placeApproved` with Auto-approve), the below-zero ask over the run's days | as built |
| CSE · OD · ⋯ Attach / Other | every day of the run, as a picked range files today (`fileStraight(selCells())`) | as built |
| Grant OIL, Post out, Post in | unchanged — the day tapped (they never took a range) | unchanged |
| Remarks · Document | the leave's own, as built (a bid's words are its whole run's — `setRequestWords`; an approved leave's are its Input's) | the same |
| The day line (manning) | over the run's days | the day tapped |

Why Delete and Move take only the leave: what is picked is the leave, not the days (D1461: "chooses what Approve, Refuse,
Move and Delete act on"). A drag over the same days still takes everything on them (D260) — that is a block of days.

## 4. Who sees it

Everyone who gets the window on such a day: an admin (all four actions), a member on his own bid (Move and Delete, as
built — D333, D1225; the store's gates decide day by day). A member's own approved leave opens his remarks window (D1354)
and a day closed for him its own window — both unchanged (their titles already read the day).

## 5. Readings to state to him (his to strike)

R1 the leave is the joined bar's entry, bounded by its period · R2 "All" re-types and files over the whole leave too, as a
picked range does · R3 Delete and Move on "All" take only the leave, not an award or the other half's bid on its days · R4
the cyan mark is drawn on every bid window's picked days (D1289 built whole: the day tapped, a range, the leave) · R5 the
title on "All" reads "13–16 Apr", the drag window's voice, where the drawing spaced it "13 – 16 Apr" (a difference from the
drawing — D1424, D1426: shown to him side by side).

## 6. Red first — the tests

`ui/wholeleave.test.tsx` (new), written and run red before the build:
1. `leaveRunAt`: a four-day pending LL found from each of its days; a single day → null; words differing on day 3 → two
   runs; a refused run; a half-day (AM) run beside a PM bid; a war-approved leave over four days; stops at the period's end.
2. The window on a four-day bid: title "11–14 Feb", "All 4 days" pressed, the day chip, no "Pick a range"; picking the day
   → title "Wed 11 Feb", the day chip pressed.
3. Approve on "All" approves all four days; ONE Undo puts all four back. Approve on the day approves that day alone.
4. Refuse on "All"; the lit Refuse again → all four pending.
5. A war-approved four-day leave: "Approved" lit; tapped again → all four pending; Delete on "All" removes the leave.
6. Delete on "All" removes the bid's four days and keeps an OIL award on one of them and an afternoon bid beside a
   morning run; one Undo brings the four back.
7. Move on "All" carries only the leave's records (the move banner / `moveSel.only`).
8. A leave button on "All" re-types all four days.
9. A member on his own four-day pending bid: the chips; Delete on "All" takes his four days.
10. The marks: on open every day of the run wears `selcell`; on the day only the day tapped; on close none; a single-day
    window marks its day.
11. A single-day leave's window is as built ("Pick a range", no chips).
12. A rule refusing the line (a posting-out date inside the run) — nothing written, its reason in the window.
Browser (`e2e/`): on a phone the Duration row holds Whole day · AM · PM · All 4 days · Tue 13 on one line and the window's
height equals the one-day window's on the same leave.

## 7. The check (FULL — `docs/bug-check-order.md` §5)

Rules sweep (D1448, D1461, D1462, D1463, D1289, D1290, D1330, D1361, D260, D262, D265, D266, D333, D335, D1225, D1339,
D1346, D1359, D1421, D1436) · scenario design by a fresh reader (what is MISSING) · roll-call of every place a leave's
window opens and every place the grid draws the picked days · walk sized by §7.0 (phone WebKit and desktop) · break tests ·
a fresh, blind Opus code read with the evidence sheet (D790; Astra and Sol 6.1 owed — the [NO-ASTRA-LIST] row, D761) ·
fixes red first · re-walk · evidence sheet with pictures and the `Walk:` line · his look.
