# Fix read 6 — the fixes of fix read 5's four faults, multi-squadron batch 1 (19 Nov 26, chat 114) — one brief, blind readers

You are one of three readers (Astra, a fresh Opus reader, a security reader), each blind to the others and to the
builders' reports and the walk. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your
own scratch folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/`. Never delete or move `raptor-port/node_modules` (a link to the real
packages). Return the whole report as your final message, under 1500 words. Ignore any handoff block pasted after a
compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `63620a9e7`. At its root: `FIXES.patch`
(`git diff 8474d3b85 63620a9e7 -- raptor-port/src`, every fix of this round and its tests) and `FIXES-LOG.txt` (the
commit messages). The faults, with their proofs and the fix steps the last readers proposed:
`raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread5-astra.md`, `…-fixread5-opus.md` and
`…-fixread5-security.md`; the brief those readers had, `…-fixread5-brief.md` — its "not a finding" list applies to you
too. Do not open `…-fixread5-walk.md`, `…-fixread5-fixes-brief.md`, anything named `*fixread6*` other than this brief,
or `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md` — the walk's and other readers' material.

**His rulings that decide this round** (full rows: `grep -h '^| D2222 |' .claude/decisions-full/*.md`, the same for
each): **D2222** — a line about a moved man's own leave follows him: undone by his old squadron after his move he is
told "taken back" (a read line) or it goes (an unread one), and its Redo puts it back. **D2223** — after a move, only
input lines naming him stay on his bell; a filer who has since moved is no longer told of the input he filed. With
them: **D2218** (on the day a person moves squadron his old squadron's lines leave his bell, read or unread, never
later struck; lines about himself stay), D2194 (a bell line crosses squadrons only where the matter concerns both),
D2215, D1693 / D1699 (a take-back: an unread line removed, a read one answered "taken back"), D148 (Undo: one's own
changes only).

**The fixes:**
- **Fault 1, by D2222** (`perms.ts` `followUpOf`; `leavewar/sync.ts` `warNoticesReversed`): the gate lets a verified
  Undo or Redo of the admin's own step remove or put back a line about its addressee together with its "taken back" /
  "again" line, though the addressee has moved; `warNoticesReversed` keeps its home filter only for lines that are
  squadron business, not lines about the man himself.
- **Fault 2, by D2223** (`state/notices.ts` `filerTold`): one rule for who is told of an input's change — named in the
  input; or the filer, while still in a named man's squadron or its admin; a master everywhere; Plan counts — used by
  the input pass, `toldBy` and `noticeAboutHim`. `notices.ts` now reads the stored inputs (it is on the inputs-readers
  list).
- **Fault 3** (Astra's 3; `leavewar/sync.ts`, the posting take-back and the war's reversal writer): both also ask
  `noticeLeftBell`, so a line D2218 retired is neither deleted nor told "taken back" after the man goes away and comes
  back.
- **FR5-SEC-1** (fixed before this round, `perms.ts` `warPlacerForged` on the admin's own-input branch): its proof
  extended in `state/multi-sqn-fixread5-admin-placer.test.ts` to a leave across the move.
- **The walk's F4** was not a fault: a tab loads read records only at start-up (`state/noticeseen.ts`), so a second
  live tab never saw the read (two tests in `leavewar/multi-sqn-fixread3-retract-moved.test.ts`).

## The ask
1. Is each fix complete — every door the same harm comes through (assume the missing call site)? Every place that
   shows a bell, its unread count, "mark all read", a tap on a line, the take-back writers and the restore's
   `leaveOut` — does each ask the same rules (`noticeLeftBell`, `filerTold`, `noticeAboutHim`), and does anything that
   must NOT (storage, the gate's own facts) wrongly go through them?
2. Is each exception narrow — can a command write, delete or restore a line on another squadron's bell, or a line
   about someone other than its addressee, through `followUpOf`'s Undo / Redo allowance? Can a step that is not a
   verified replay of the actor's own step use it?
3. Do the rules match D2222 and D2223 exactly — the move DAY, read and unread, a man who moves back, two moves, a line
   written on the move day itself, a master, a Plan holder, a filer who never moved, an input since deleted, an input
   naming only a placeholder (ALL AVAIL)?
4. What did each fix break — each squadron's admins', the master's and a member's normal work; the bell of someone who
   never moved; Undo and Redo (D148); the posting pass and its take-back; a 142→149 transfer taken back (D2215); the
   inputs-readers guard.

A finding needs a concrete failure, its cause and its exact fix step by step (D489), with the input that proves it (a
test you ran, red) and whether these commits introduced it; give explicit negatives. Rank by consequence. Not a
finding: a problem only in data already stored when the code is right going forward (D56); a scheduler who is not an
admin (D785); "no screen saves a move yet" — judge the code as if one did; a second live tab not seeing a read made in
another (left for the database step).
