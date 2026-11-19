# Fix read 11 — Fable's blind read (D2224) (20 Nov 26, chat 118; copy at `a45a1e002`, code = `eb51fa689`)

Read in the copy only; no handoff block pasted. Proofs in `fr11-fable/raptor-port/src/zz-fable11/` (helper pieces
`_head.txt`, `_tail-*.txt`, temp `.tmp-f11`), each run alone. Nothing under `src` outside its folder changed. Six
findings, all red: 1–3 let through what should be refused, 4 fails open on dates, 5–6 lose a line a man should keep.

## F11-1 (fault B still open): a holiday line with no holiday
- `f11-b1.test.ts:106` red. Outlaw (plain 142 admin) calls `noticeHoliday(['kes9','osp9'], 'casper', '149: all leave
  cancelled…', …)` in an ordinary input command: saved on 149's admin's bell and a 149 member's (no scheduler).
- Cause: the skip asks only "minted by `noticeHoliday` here" and "signed by the actor"; nothing asks that the command made
  a holiday or who it goes to; the skip passes before the squadron check. Saved, not shown in the run; by reading, shown
  only while a holiday with unanswered inputs stands on those dates, a newer line replacing the real one.
- Not introduced (B narrowed it). Fix: (1) `leavewar/sync.ts` works out the holiday lines a command owes from its own
  changes, as `warLinesOwed` does — a working day made a holiday on exactly `a..b`, under that holiday's own name;
  (2) installed into `perms.ts` by a setter owing nothing when unset; (3) the skip needs owed, `holMade` and self together.

## F11-2 (fault A still open): a made-up war line in another admin's name
- `f11-a2.test.ts:114` red. Hunter places approved LL for Ranger (control: he is told). Outlaw changes only that leave's
  remarks in an ordinary input command and calls `noticeWar(['bane'], 'stiff', {k:'lw', c:'LL', d:'refused', …})`:
  saved as "LL refused", signed as Saber, still on Ranger's bell after his move.
- Cause: `warLinesOwed` counts any change of an input carrying `lw` as owing a line for that man, day and kind — a
  remarks edit included; no check asks who signed a war line.
- Not introduced (A incomplete). Fix: (1) in `adminOwnerViolation`'s war-line check require the writers' signer —
  `by === self` for `lw`, `lwopen`, `poback`; `by == null` for `po`; (2) the `inputs` branch of `warLinesOwed` owes only
  where the leave came, went, or changed person, dates, type or `lw` mark between before and after.

## F11-3 (INTRODUCED by fault C): the backstop switched off by a label
- `f11-ac.test.ts:118` red. The builder's SEC10-2 case (Outlaw drops Saber's line to Ranger, re-adds it under its id in
  his words) through `commitInputs('sched.load', …)`: the stored line overwritten, `by: casper`.
- Cause: `writtenAsNewViolation` returns early on `env.type === 'sched.load'`; the row writer skips that label for inputs
  only, so bell lines are still saved. Fix: delete `|| env.type === 'sched.load'`; no app command carries it
  (`sched-commit.ts`). Checked green: the input variant under the same label did not reach the stored request
  (`f11-c1b.test.ts`).

## F11-4 (INTRODUCED by fault D): an older Undo writes the link's day back, a retired line returns
- `f11-d3.test.ts:122` red. Hunter Plan of 149 from 13 Jul, told as filer; 15 Jul Saber renames his sign-in, then links
  it to Newby; 16 Jul Hunter moves without it, the line leaves; 17 Jul Saber undoes the link — dated 17 Jul, line off
  (correct); then undoes the rename — the link's day goes back to none, the retired line is on his bell again.
- Cause: `restoreRedated` keeps the stored day for the mark (`masterKept`) and a grant (`grantKept`), not the link; G2b
  skips a verified replay that keeps the link. Fix: (1) `restoreRedated`, account branch: where `was` exists with the same
  person, write `pidFrom: was.pidFrom`; (2) G2b: drop the `replayed && !relinked` skip — an unchanged link always carries
  `was.pidFrom`.

## F11-5 (fault E left open, two cases): the line a man kept still lost
- (a) `f11-ed.test.ts:119` red — master since 10 Jul; mark off and undone 11 Jul; moves 12 Jul as master; 13 Jul a Redo by
  mistake and its Undo at once: the mark back dated 13 Jul, his line gone. Cause: `madeAt` stamped once; after a Redo the
  right went off at the Redo. Fix: in `globalRedo` set `entry.madeAt = Date.now()` (or a `redoneOn` preferred by
  `offAtOf` for an Undo).
- (b) `f11-e2.test.ts:115` red — F10-5's story with `setGrant(…, 'view')` in place of `removeGrant`: the Plan back dated
  17 Jul, line off. Cause: E covers only a right put back where none stands (`b == null`). Fix: in `restoreRedated` and
  the gate's `back`, the same account and squadron going not-admin → admin by a restore counts as "put back"; keep the
  recorded day where `restoredDayHolds`.

## F11-6 (fault D, the builder's choice): a re-link made by mistake and undone loses the kept line
- `f11-ed.test.ts:134` red. Hunter master since 10 Jul, moved 12 Jul, line kept; 15 Jul Saber links his sign-in to Newby
  by mistake and presses Undo: mark and link back dated 15 Jul, the line gone (O10-1's harm by another click).
- Fix: where a restore puts the account back on the person its recorded image names and `restoredDayHolds(n.pid,
  offAt)`, keep the recorded `pidFrom` and `masterFrom`; the gate asks the same.

## The builder's choices
1. A's match — wrong on the `inputs` branch and the unsigned line (F11-2); no real line refused in any test. 2. B's
"signed by himself" — supported (no real path signs otherwise), not sufficient (F11-1). 3. C — no honest path refused;
bypassed by the label (F11-3). 4. D — door and gate agree where tried; wrong on two Undo cases (F11-4, F11-6). 5. E — no
stamp fails closed (today); a move on the off-day keeps the recorded day (a move counts from its day's start) — checked,
not a fault; wrong after a Redo and on a level change (F11-5).

## Checked, found nothing
- Honest paths with the saved copy wired (`f11-c-legit.test.ts`, 6 green): an input filed, changed, deleted, the delete
  undone and redone; a decision read, Undo / Redo twice; a bid set approved, Undo / Redo twice; bidding opened, the same;
  a posting, Undo post out, posted again; a holiday line, Undo / Redo twice.
- Existing files each run alone, all green: m4bell, m4decide, m4ride, m4sec, holnotice, postout-notice, postout-takeback,
  postout-outcomes, open-undo, job2-warbell, job2-retract, holidays-by-place, deleteposting-restore, poarchive, undoaudit,
  movestandard.
- A new `lw`-marked input pushed beside `noticeWar` in an input command: refused (`f11-ac.test.ts`, second case). A 149
  admin linking a 149 admin sign-in to a 142 man: refused (`f11-ed.test.ts`, third case).
- By reading: every account-row writer carries `pidFrom`; restore and gate read the same home rows for E; the row writer
  wired before the boot's first command.

## Not reported
D2203 by Undo (undoing a grant removal after a move puts the grant back before the move day — so before these commits
too); fault F, the O9-3 question, a war line's content beyond its kind (named by the brief).
Host re-run 03:17: every proof alone on eb51fa689 — b1, a2, ac(1 of 2), d3, ed(2 of 3), e2 red as claimed; c1b and c-legit (6) green — reproduced.
