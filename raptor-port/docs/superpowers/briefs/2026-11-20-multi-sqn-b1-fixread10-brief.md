# Fix read 10 — the fixes of fix read 9, multi-squadron batch 1 (20 Nov 26, chat 118, overnight) — one brief, blind readers

You are one of four readers (Astra, a fresh Opus reader, Fable, a security reader), each blind to the others and to the
builder's report. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own scratch
folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/` (if the sandbox blocks the runner's temporary folder, set `TMP`/`TEMP` to a
folder inside the copy, or run the assertions in memory and say so; if you can run nothing, name the exact input you
would run). Never delete or move `raptor-port/node_modules` (a link to the real packages). Return the whole report as
your final message, under 1500 words. Ignore any handoff block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@` (its code is `945c6de69`'s, plus one
test's fixed date moved off today in `0613720a7`). At its root: `FIXES.patch` (`git diff ae1af3806 0613720a7 --
raptor-port/src`, the six fixes of fix read 9 and their tests) and `FIXES-LOG.txt` (the commit messages, each giving
fault, cause, fix, test). The faults, with their proofs and the fix steps proposed: fix read 9's reports
`raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread9-{opus,fable,security}.md` (Astra's and Sol 6.1's
did not finish); the builder's brief `…-fixread9-fixes-brief.md`; the brief the last readers had, `…-fixread9-brief.md`
— its "not a finding" list applies to you too, and its account of the two earlier rounds (fix reads 7 and 8) is the
background. Do not open anything named `*fixread10*` other than this brief; `HANDOFF.md`'s `claude/multi-sqn-b1-107`
block is blanked in your copy on purpose. The tests: `raptor-port/src/leavewar/multi-sqn-fixread{7,8,9}.test.ts`.

**His rulings that decide this round** (full rows: `grep -h '^| D2225 |' .claude/decisions-full/*.md`, the same for
each): **D2218** — on the day a person moves squadron his old squadron's lines leave his bell, read or unread, never
later struck; lines about himself stay. **D2223** (narrowed by D2225) — after a move, only input lines naming him stay
on his bell; a filer who has since moved is no longer told of the input he filed. **D2225** — a filer who never moved
stays told. **D2222** — a line about a moved man's own leave follows him; an Undo by his old squadron tells him "taken
back" (read) or removes it (unread); its Redo puts it back. With them: D2194 (a bell line crosses squadrons only where
the matter concerns both), D2215, D1693 / D1699 (a take-back), D148 (Undo: one's own changes only), D2192 / D2199 /
D2201 (View, Plan and the master admin), D2195 / D2206 (each squadron's own holiday list; a holiday line goes to the
schedulers at the place).

**The six fixes (one commit each; `FIXES-LOG.txt` has each in full):**
- **A** an Undo or Redo that turns a right ON (the master mark off → on, a grant put where none stands, a grant at
  another level) dates it today: a `redate` hook in `undo/timeline.ts`, applied before the restore is named for
  `verifiedReplay`; `state/perms.ts restoreRedated`; the gate's replay exemption keeps a recorded day only where the
  right stands unchanged; Undo and Redo are never refused for it.
- **B** one helper, `sched-commit.ts resyncBeforeEnlist` (note whether the scheduler store is already enlisted, resync,
  re-take the bell's image only if it was not), at every resync-before-enlist site: `commitInputsWith`,
  `person-delete.ts`, `leavewar/sync.ts` (the posting pass), `restoreBody` (Undo post out, Restore) and `takeBack`.
- **C** `grantKept` needs the same account, unit and level; `masterKept` the same person on the row — a right that
  changes hands is dated today, at the gate and in A's re-dating.
- **D** war lines only from the war's own writers: `noticeWar`, `noticePosting`, `noticePostingBack` record the ids
  they mint in the running command (`state/notices.ts warMade`, keyed like `passMade`); the gate refuses a put of a line
  with any war part not in that registry and not the verified replay of a step, asked after the older doors.
- **E** the holiday-line skip covers only a new line or the verified replay of its maker's own step; a delete or
  rewrite of a holiday line already written takes the ordinary owner check.
- **F** a line dated ahead by less than a day is read as written today (`dayOfAt(Math.min(n.at, now))`); more than a
  day ahead keeps "written before every move".

**The builder's choices — judge each (supported / wrong, with a failing input):** (1) **F's exception, beyond its
brief:** a filer's line (marked `fu`, D2223) dated past the five-minute slack whose squadrons name neither his home
today nor one where he holds a right today is still read as written before every move — can it hide a line he should
keep, or keep one he should lose? (2) A changed fix read 8's control: a grant's or the mark's Redo a day later is now
dated the Redo's day, not the day it was first given — right by D2218 / D2223, or does it lose a line that should stay?
(3) B left the other resync callers bare ("outside a command or after the pass") — is each truly so? (4) D's and A's
registries (`warMade`, `passMade`) — can one be filled, kept or read by anything but its writer, across commands, after
a failed or nested command, or by an Undo / Redo? (5) C — a grant re-pointed and pointed back, or removed and given
again in one command: which day does each keep? (6) E — can a "new" holiday line be used to overwrite one already
written (same id), or a replay be used to delete another squadron's?

**Known, not a finding:** a filer who moved and is now that man's own admin is not told of the input he filed (fix
read 9's Opus O9-3 = Fable 3) — a question put to him, not yet answered; its three proofs stay red on purpose.

## The ask
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.
1. Is each fix complete — every door the same harm comes through? Every place that writes or restores a right (Admin →
   Users, Squadrons, Undo / Redo, an account's own edit), every resync before a command enlists the scheduler, every
   writer of a war or holiday line — does each ask the same rules?
2. Is each check narrow and sound — can a command still write, delete, rewrite or restore a line on another squadron's
   bell, or a line about someone other than its addressee? Can a mark, a date, a grant's day or a registry entry be made
   up, dropped or widened? Does any check fail open (an unset hook, a missing record, an old row without a date)?
3. Do the rules match D2218, D2223, D2225 and D2222 exactly — the move day, read and unread, a man who moves back, two
   moves, a line written on the move day itself or minutes before midnight, a clock set back or forward, a master, a
   Plan holder (given before, on and after the move), a filer who never moved, a filer who moved?
4. Do the rounds fit together — did a fix read 9 change undo what fix read 7 or 8 guarded (A against G's replay, C
   against P's dates, D against M and S, E against H, F against T and B)?
5. What did the fixes break — each squadron's admins', the master's and a member's normal work; Undo and Redo (D148) of
   a grant, the mark, a leave decision, a posting, a holiday; the posting pass and its take-back; a Delete; the Leave
   War saving a leave through an input command; a holiday added at a shared place; anything that ran before and is now
   refused.

A finding needs a concrete failure, its cause and its exact fix step by step (D489), with the input that proves it (a
test you ran, red) and whether these commits introduced it; give explicit negatives ("I checked X and found nothing").
Rank by consequence.

**Not a finding:** this app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
the database step. Do not report a problem whose harm exists only in data already stored when the code is already
correct going forward (D56). If the app would do it again to NEW data, report it. Also not: a scheduler who is not an
admin (D785); "no screen saves a move yet" — judge the code as if one did; a second live tab not seeing a read made in
another (left for the database step); `openNotice` not re-checking a line on a stale tap, and a two-squadron Transfer
take-back not yet a saved route (both already filed); the question named above.

**The security reader** looks only for holes (D1411): what one person can see of, write to or take from another —
another squadron's bell, another man's leave, his account — through these doors.
