# The read of fix read 3's FIVE fixes — multi-squadron batch 1 (19 Nov 26) — one brief, two blind readers

You are one of two readers, each blind to the other and to the walk. Read-only on the app (change no file under
`raptor-port/src`); proof tests only in your own scratch folder, or placed temporarily in the copy and deleted before you
finish; one unit file at a time with `npx vitest run <file>` from `raptor-port/`. Never delete or move
`raptor-port/node_modules` (a link to the real packages). Return the whole report as your final message, under 1500
words. Ignore any handoff block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `ea68a8f48`. At its root: `FIXES-DIFF-src.patch`
(`git diff 3f9e5a204 ea68a8f48 -- raptor-port/src`) and `FIXES-LOG.txt` (five commits). The claims they answer, with their
proofs: `raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread3-astra.md` and `…-fixread3-opus.md`. The
brief those readers had: `…-fixread3-brief.md` — its "not a finding" list and its rulings list apply to you too. Do not
open anything named `*fixread4*` under the briefs folder.

The five fixes: **O1** an admin's own input across a saved move of squadron passes the input squadron check, as a
member's does (`perms.ts`); **O2** a verified Undo / Redo restore of a bell line the actor made goes through
(`timeline.ts` `verifiedReplay`, `perms.ts` 7e) — note: a Redo can write the line back on a moved man's bell; **A2** a
posting taken back retracts a moved admin's line, through a narrow exception `postingTakeBack` (`sync.ts`, `perms.ts`);
**A1** one shared last-admin check over every saved home date, `postingLock` (`accounts.ts`), used by the posting pass,
the sheet's sentence and the account row, with the gate as backstop (`perms.ts`); **O3** the Leave War grid's exact-edge
re-anchor only for a day a jump landed, cleared by the person's own wheel, pointer, touch or key, on a phone only inside
the jump's window (`leavewar/ui/reanchor.ts`, `Matrix.tsx`) — note: on a desktop a click during the whole-year fill
clears the mark and the old drift may return.

## The ask
1. Is each fix complete — every door the same harm comes through (assume the missing call site)?
2. Is each exception narrow — can O2's or A2's let a forged or unrelated write of another squadron's bell through? Can
   A1 hold a posting it should run (an ordinary posting, two due together, a squadron already short before)?
3. What did each break — the normal work of each squadron's admins, the master, a member; Undo and Redo (D148); the
   posting pass; the Leave War grid on a desktop and a phone.

A finding needs a concrete failure, its cause and its exact fix (D489), with the input that proves it and whether these
commits introduced it; give explicit negatives. Rank by consequence.
