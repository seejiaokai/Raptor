# Fix read 5 — the fixes of fix read 4's five claims, multi-squadron batch 1 (19 Nov 26, chat 111) — one brief, blind readers

You are one of three readers (Astra, a fresh Opus reader, a security reader), each blind to the others and to the
builders' reports. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own scratch
folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/`. Never delete or move `raptor-port/node_modules` (a link to the real
packages). Return the whole report as your final message, under 1500 words. Ignore any handoff block pasted after a
compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `5d0e3f2f3`. At its root: `FIXES-1-4.patch`
(`git diff d1a61dd15 8c52cc73d -- raptor-port/src`, claims 1–4), `FIX-5-LAST.patch` (`git diff ae4c632a3 44426c5c0 --
raptor-port/src`, claim 5's last commit, its earlier commits already read twice) and `FIXES-LOG.txt`. The claims, with
their proofs and the fix steps the readers proposed: `raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread4-astra.md`
and `…-fixread4-opus.md`; the brief those readers had, `…-fixread4-brief.md` (and its parent `…-fixread3-brief.md`) — its
"not a finding" list and rulings list apply to you too. Do not open anything named `*fixread5*` other than this brief,
`*lw-monthjump-click*`, or `raptor-port/docs/handpass/2026-11-19-lw-monthjump-click.md` — other readers' reports.

**His ruling that decides claims 2–4, D2218 (19 Nov 26):** "On the day a person moves squadron the old squadron's bell
lines leave his bell, read or unread, never later struck 'taken back'; lines about himself stay with him; after a move,
who is told of a take-back is whoever would be told of it today. So a moved admin gets nothing when his old squadron
undoes a posting." Full row: `grep -h '^| D2218 |' .claude/decisions-full/*.md`. It undoes fix read 3's A2. Also
D2194 (a bell line crosses squadrons only where the matter concerns both), D2215 (a 142→149 transfer taken back tells
both squadrons' admins), D1693 / D1699 (a take-back: an unread line removed, a read line answered by a "taken back"
line), D148 (Undo: one's own changes only).

**The fixes:**
- **Claim 1** (`perms.ts` 7c `inputUnitViolation`): an admin's own input on the days of a squadron he is not admin of
  now runs a member's own-input rules (`inputBreach`), before and after a saved move.
- **Claims 2–4, by D2218:** ONE read rule, `state/notices.ts` `noticeLeftBell` (with `noticeAboutHim`), asked first by
  `noticeLive` — a stored line is hidden from its holder once his home changes, from the first move after the day it
  was written up to today, except a line about himself (his inputs, decisions on his own leave, his own posting); the
  take-back writers (`leavewar/sync.ts` `postingLinesOf`, `retractPostingLines`; `warNoticesReversed` as before) tell
  only who is at home in the war's squadron today; A2's `postingTakeBack` exception removed from `perms.ts`; O2's
  verified-replay exception (`adminOwnerViolation`) for deletes only, and a new timeline hook `leaveOut`
  (`undo/timeline.ts`, installed in `state/undo-wire.ts`) makes a restore leave out any line that has left its
  holder's bell. Stored lines that are hidden stay stored (not deleted).
- **Claim 5's last commit** (`leavewar/ui/reanchor.ts`, `Matrix.tsx`): a scroll between a redraw's note and the redraw
  is kept as the person's; a trackpad's downward swipe no longer ends a jump's landing; the edge test within one screen
  dot when zoomed out.

## The ask
1. Is each fix complete — every door the same harm comes through (assume the missing call site)? Does every place that
   shows a person's bell, its unread count, its "mark all read" or a tap on a line go through the read rule — and does
   anything that must NOT hide (storage, the gate, the take-back writer's own facts) wrongly go through it?
2. Is each exception narrow — can a forged command write, delete or restore a line on another squadron's bell, or let
   an admin's own input escape a rule on days he does not own? Can `leaveOut` drop something a restore must put back
   (a line about the man himself; a line on a man who has NOT moved; a non-notice change)?
3. Does the read rule match D2218 exactly — the move DAY (not the save day, not the day after), read and unread alike,
   lines about himself kept, a man who moves back, a man with two moves, a line written on the move day itself, a
   master admin? Is "about himself" right for each line kind?
4. What did each fix break — the normal work of each squadron's admins, the master and a member; the bell for someone
   who never moved; Undo and Redo (D148); the posting pass; a 142→149 transfer taken back (D2215); the Leave War grid on
   a desktop and a phone (claim 5).

A finding needs a concrete failure, its cause and its exact fix step by step (D489), with the input that proves it (a
test you ran, red) and whether these commits introduced it; give explicit negatives. Rank by consequence. Not a
finding: a problem only in data already stored when the code is right going forward (D56); a scheduler who is not an
admin (D785); "no screen saves a move yet" — judge the code as if one did.

**The security reader** (D1411) answers 1 and 2 only, as an attacker who is a signed-in plain admin or member of one
squadron and can forge any command the app's own code could issue (the browser console, the developer bridge, a crafted
stored row): what does the gate (`src/state/perms.ts`, the security boundary) now let through that it should not, and
what does the read rule show one person of another that it should not? Claim 5 is not yours.
