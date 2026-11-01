# The scenario designer's report — the Leave War's next batch (1 Nov 26)

A fresh, blind Opus helper, read-only, handed the change (`7c0103e17` against `3833780ad`), the four backlog items, the
rulings' full rows and the finder brief with the demo-data exclusion (D56). Saved whole as it arrived; the dispositions are
in `../../2026-11-01-lw-next-batch.md` §The scenario designer.

---

SCENARIO DESIGN — commit 7c0103e17 (four Leave War fixes). Read-only; no file changed.

Premises checked in code: Undo/Redo of a war step is one `lw` gesture, with its Inputs write folded in. The posting itself is not on the global Undo (NOT_UNDONE_HERE), so setting or moving a posting never drops a waiting Redo. `restoreRefusal` is asked fresh, not cached (`deadFor` is cached). A refused press shows a warning toast (topbits.tsx). The Redo button stays enabled with the step's label.

RANKED SCENARIOS (most specialised first)

S1 — Day's list / Approvals, same-day half pair (Fix 4 body; Delete posting not run, or a deleted man). Setup: Ranger has approved LL PM on 13 Jul and a pending LL AM bid on 13 Jul. One war step approves the AM and sends back the PM. Then Undo, set a Delete posting dated 12 Jul, Redo. Expected: refused (D1545; the item's own rule, "day by day"). Disproof: AM approved leave comes back. Can it be driven on screen? Only if one gesture approves and sends back together; the item says none does. Unit-drive it (see FAULTS).

S2 — Bid window, free half beside an Other that has hours (Fix 1). Setup: on the Inputs page, Unavailable → Other, 13:00–17:00, typed words, one PDF. Tap that Leave War day: it opens on AM. Expected (designer's reading, D754 "one body"): the held line shows what a held day's line shows. A held day prints hours for a window that is not exactly AM/PM; this line prints "PM". D1371/D1525 say only AM/PM, so put it to him. Disproof of "one body": the same Other beside a second Inputs half (a held day) reads "13:00–17:00", but here it reads "PM".

S3 — Bid window, multi-day AM Other (Fix 1). Setup: Other AM, 3–7 Nov, words "Board". Tap 5 Nov. Expected: “Board till 7 Nov” (D948, D952). Disproof: no till, or the day's own date.

S4 — Bid window, one-day Other, till tick left at default vs ticked vs unticked (D952/D953). Expected: matches the day's list for each state. Disproof: a till shows on a default one-day commitment, or is missing when ticked.

S5 — Bid window, Attach with a "To", plus 2 documents (Fix 1). Expected: box · AM/PM · To · “words till …” · two chips · "change it on the Inputs page". Each chip opens its document read-only (D1150). Disproof: a chip missing, or a tap that does nothing or can edit.

S6 — Phone 375/402 wide, S5 with a long remark (Fix 1). Expected: the line wraps inside the window, with no sideways scroll or clipped chip (designer's reading). Disproof: overflow. Picture right after the tap (D1281).

S7 — Member's own row, half-day Other he filed himself (Fix 1; D1371 "same for admin and member"). Expected: the same line, his words shown (ownWords is false for a commitment) and his chips. Disproof: different text from the admin view, or no chips.

S8 — Documents added on the Inputs page after the line was first seen (Fix 1). Reopen the day: the chip appears. Disproof: stale line.

S9 — Order: approve → set Delete posting (posting sheet) → Undo the approval (must pass) → Redo (refused). Expected: Undo puts the bid back pending. Redo toasts "Can’t redo that — Ranger posts out on <date>, so leave from that day can’t be approved" (D1545). No leave is written and the bid stays pending. Disproof: Undo refused, or Redo lands leave. The tests cover approve → Undo → post; this order is untested.

S10 — Redo after a refusal: press it again, and try an older undone step (designer's reading). The refusal is not sticky, so every press repeats the toast and every older Redo is out of reach while the posting stands. Expected: the same words each time, nothing written. Compare D1263 F1, which says a step that can never pass is passed over — this one can pass later. Disproof: a different or empty message, or a silent no-op. Put the "older steps blocked" effect to him if it shows.

S11 — Posting changed after a refused Redo, on the posting sheet: (a) taken back, (b) moved past the day, (c) outcome to Overseas / Transfer / none, (d) to SANS. Each Redo should then go through (D1541, D283). Then set Delete again earlier: refused again. Disproof: a stale refusal or a stale pass.

S12 — Delete posting dated in the past but not yet run (it runs late). Expected: Redo refused, words in the past tense ("posted out on"). After it runs: refused through the deleted man's rule, or the redo is dropped ("Nothing to redo"), never leave written. Disproof: leave restored in the window between date and run.

S13 — Delete posting held back (the last admin who can sign in, `postingBlocked`). Expected: live Approve still refuses (postingOutWhy reads only the outcome), so Redo is refused too. Disproof: the two disagree.

S14 — Approve all over two men, only one with a Delete posting (D148, own steps). Expected: the whole Redo is refused and names that man; the other man's approval is not redone (designer's reading: one step). Disproof: half applied, or the wrong callsign.

S15 — Auto-approve ("Approve what I enter") in the bid window and in the drag window, on days after a Delete posting date. Live: lands pending with "kept pending — He posts out on …". Undo/Redo of that placement: no approval appears. Disproof: approved leave on Redo.

S16 — Approval extending an approved run across the date. Approved row 20–23 Nov, posting 24 Nov (Delete); Redo an approval of 19 Nov (before the date, merges to 19–23): must pass. Redo of 25 Nov: refused. Disproof: either answer flipped.

S17 — Wrong-refusal sweep: Redo, after a Delete posting is set, of a move of approved leave, a block move (pending bid and approved leave shifted together), a re-type of approved leave, a refuse, a delete, a send-back, an Inputs-page leave filed over his bid, and an Inputs-page edit of his war leave. Expected: all pass (D1541; the item's caution RR-A). Disproof: any refusal toast.

S18 — Undo of a send-back done before the posting was set (approve → second tap sends back → set Delete → Undo). Expected: refused (tested). Variant: send-back of a day before the date → must pass.

S19 — Another admin sets the posting (D148). Admin A approves and undoes; admin B sets the Delete posting; A presses Redo. Expected: refused with the same words. Disproof: passes.

S20 — The live Move after a Delete posting (designer's question, not this change). Move approved leave from before the date onto a day after it: `doorMoveApproved` never checks the posting, so it lands. D1545 names only the approve doors, so this is consistent, but ask him whether a Delete posting's date should bar a move too.

S21 — Browser tests (Fix 2). Run the three `@pinned-today` tests in both the desktop and phone projects. Expected: never skipped. The page's today reads 4 Nov 26 in the runner's time zone (GitHub's machines are UTC; 09:00+08:00 is still 4 Nov in UTC). Disproof: a skip, or a date one day off. Check also that no untagged test in the same file gained or lost a skip.

EXPLICIT NEGATIVES
- Every approve door (Approvals, Approve all, the day's list, the bid windows, Auto-approve/placeApproved, the drag window) goes through `doorApprove` or `placeApproved` inside an `lw` gesture. I found no approval made under another module, so the Redo branch's `module === 'lw'` check misses no door.
- `postingRefusedFrom` uses the same date as `postingOutWhy` (posting-sheet date = to + 1) and gives way to the deleted man's rule once he is gone. A taken-back posting leaves `to` null, so nothing is refused.
- The per-day rule over-refuses no war writer I could find: a move carries its bid id, a block move carries ids, a re-type takes no request, a refuse or delete writes no leave.
- Fix 1's half and box placement match the old code. Its till rule and doc chips match the day's list (DayList.tsx 108).
- Undo and Redo show the refusal in a toast. The second rules check inside the commit also passes the step.

FAULTS (PLAUSIBLE — unreachable on screen today, by the item's own note)

F1 — `raptor-port/src/state/person-delete.ts`, `replaysApproval`, the per-day block (the `days()` / `had` comparison, about lines 315–325). "Leaves war-approved leave on that same day where it was not" is keyed by DAY alone.
- Failure: S1. Taken = {13 Jul}. The new AM row covers 13 Jul, but `had` holds 13 Jul from the PM row being deleted, so the check returns false. The net sum is +1 −1 = 0. Both rules let the Redo through, and the AM approval comes back on a refused day.
- Fix: key by row and day, not day alone. Build `had` as a Set of `${row.iid}|${d}` from the before rows. Return true when some after row has `${row.iid}|${d}` not in `had` for a `d` in `taken`. This still catches a merge that extends a row (same iid, new date) and a new half row (new iid). It does not refuse a re-type (same iid, same dates).
- Add a red unit test for S1 for both the deleted man and the Delete posting.

No other line found that is already a fault.
