# Fix read 11 — the fixes of fix read 10, multi-squadron batch 1 (20 Nov 26, chat 118, overnight) — one brief, blind readers

You are one of four readers (Astra, a fresh Opus reader, Fable, a security reader), each blind to the others and to the
builder's report. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own scratch
folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/` (if the sandbox blocks the runner's temporary folder, set `TMP`/`TEMP` to a
folder inside the copy, or run the assertions in memory and say so; if you can run nothing, name the exact input you
would run). Never delete or move `raptor-port/node_modules` (a link to the real packages). Return the whole report as
your final message, under 1500 words. Ignore any handoff block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@` (its code is `eb51fa689`'s). At its root:
`FIXES.patch` (`git diff 3242f3b3b eb51fa689 -- raptor-port/src`, the five fixes of fix read 10 and their tests) and
`FIXES-LOG.txt` (the commit messages, each giving fault, readers, cause, fix, test, and any older test changed). The
faults, with their proofs and the fix steps proposed: fix read 10's reports
`raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread10-{opus,fable,security}.md` (Astra's did not
finish); the builder's brief `…-fixread10-fixes-brief.md`; the brief the last readers had, `…-fixread10-brief.md` — its
"not a finding" list applies to you too, and its account of the earlier rounds is the background. Do not open anything
named `*fixread11*` other than this brief; `HANDOFF.md`'s `claude/multi-sqn-b1-107` block is blanked in your copy on
purpose. The tests: `raptor-port/src/leavewar/multi-sqn-fixread{7,8,9,10}.test.ts`.

**His rulings that decide this round** (full rows: `grep -h '^| D2225 |' .claude/decisions-full/*.md`, the same for
each): **D2218** — on the day a person moves squadron his old squadron's lines leave his bell, read or unread, never
later struck; lines about himself stay. **D2223** (narrowed by D2225) — after a move, only input lines naming him stay
on his bell; a filer who has since moved is no longer told of the input he filed. **D2225** — a filer who never moved
stays told. **D2222** — a line about a moved man's own leave follows him; an Undo by his old squadron tells him "taken
back" (read) or removes it (unread); its Redo puts it back. With them: D2194 (a bell line crosses squadrons only where
the matter concerns both), D2215, D1693 / D1699 (a take-back), D148 (Undo: one's own changes only), D2192 / D2199 /
D2201 (View, Plan and the master admin), D2094 (who makes an admin), D2203 (a move drops grants).

**The five fixes (one commit each; `FIXES-LOG.txt` has each in full):**
- **A** a war line passes only where the command's own change of the war owes it: `leavewar/sync.ts warLinesOwed` /
  `warLineCovered`, installed into `state/perms.ts` by a hook (fails closed when unset), beside `warMade`; the telling
  door refuses any war part; every put's `what` is a non-empty array of objects with a string `k`; `iid:''` only where
  owed, a follow-up, a holiday line by B, or a replay; `noticeAboutHim` false with no first part.
- **B** a new holiday-shaped line skips the checks only where `noticeHoliday` minted it in the running command
  (`holMade`) and it is signed by the actor himself; any other takes the ordinary checks.
- **C** a backstop: the commit gate refuses a put with no before-image of an input or a bell line whose id the SAVED
  copy already holds (`writtenAsNewViolation`, asked through `setStoredRowProbe`, which `state/persist.ts wireRows`
  installs as the whiteboard). The resync was NOT changed to throw a bare write away (fix read 8's W tests rely on it).
- **D** the account row's `pidFrom` (the day linked to its present person): `updateAccount` writes today on a re-link
  (and `masterFrom` today on a master account); the gate checks it (G2b); `restoreRedated` dates a re-linked restored
  row today; `adminThen` counts a grant and the mark from the later of their own day and `pidFrom`; re-linking a sign-in
  holding a right in a squadron where the actor is not admin is refused unless he is a master (door and gate, G4 — the
  agent's reading of D2094 / D2199).
- **E** an Undo or Redo putting back a right taken off keeps its recorded day where no move of his falls between the
  moment it went off (`madeAt` of the step; for a Redo `undoneOn`) and today, otherwise today; the gate's replay
  exemption asks the same predicate (`setRestoreOffAt`).

**Held, not built (not a finding):** fix read 10's fault F — a filer line dated minutes ahead (a clock set back) leaves
his bell for those minutes once the right it came through is removed. Left for the database step, where the server
sets the time.

**The builder's choices — judge each (supported / wrong, with a failing input):** (1) A's match — can a real war
change still owe a line it should not (another man, another day, another kind), or fail to owe one the war really
writes (a decision, bidding open / closed, a posting and its Undo, the restore's "taken back" and "again")? (2) B's
"signed by the actor himself" — does any real holiday path sign otherwise (a master adding at a shared place, an Undo
or Redo by someone else)? (3) C — every path that legitimately puts an input or a bell line again under an id already
saved (an Undo / Redo of a delete, a restore, the posting pass, a week load, a remote copy, a seed): is any now refused?
Can the backstop be bypassed (a probe unset, the row writer not yet wired, a collection not asked)? (4) D — the door
and the gate say the same; a re-link and back in one command; a new account; a master re-linking; a 149 admin
re-linking a 149-only account; the Undo / Redo of a re-link. (5) E — `madeAt` / `undoneOn` on steps made before this
change (no stamp); a move on the very day of the off-moment; a Redo after a second Undo.

**Known, not a finding:** a filer who moved and is now that man's own admin is not told of the input he filed (fix
read 9's Opus O9-3 = Fable 3) — a question put to him, not yet answered; its three proofs stay red on purpose. Fault F
above. A war line's content field beyond its kind not being checked is already filed — report it only with a concrete
harm through a door.

## The ask
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.
1. Is each fix complete — every door the same harm comes through? Every place that writes or restores a right (Admin →
   Users, Squadrons, Undo / Redo, an account's own edit), every writer of a war or holiday line, every put of a saved
   record — does each ask the same rules?
2. Is each check narrow and sound — can a command still write, delete, rewrite or restore a line on another squadron's
   bell, or a line about someone other than its addressee? Can a mark, a date, a grant's day, a link's day or a registry
   entry be made up, dropped or widened? Does any check fail open (an unset hook, a missing record, an old row without a
   date, an old undo step without a stamp)?
3. Do the rules match D2218, D2223, D2225 and D2222 exactly — the move day, read and unread, a man who moves back, two
   moves, a line written on the move day itself or minutes before midnight, a master, a Plan holder (given before, on
   and after the move), a re-linked account, a filer who never moved, a filer who moved?
4. Do the rounds fit together — did a fix read 10 change undo what fix reads 7, 8 or 9 guarded (A against D's
   registries and M, S; B against E; C against W and B's resync; D against C and G2; E against A's re-dating, F1, F1b,
   O9-2)?
5. What did the fixes break — each squadron's admins', the master's and a member's normal work; Undo and Redo (D148) of
   a grant, the mark, a re-link, a leave decision, a posting, a holiday, a delete of an input; the posting pass and its
   take-back; the Leave War saving a leave through an input command; a holiday added at a shared place; Admin → Users'
   own edit of an account; anything that ran before and is now refused.

A finding needs a concrete failure, its cause and its exact fix step by step (D489), with the input that proves it (a
test you ran, red) and whether these commits introduced it; give explicit negatives ("I checked X and found nothing").
Rank by consequence.

**Not a finding:** this app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
the database step. Do not report a problem whose harm exists only in data already stored when the code is already
correct going forward (D56). If the app would do it again to NEW data, report it. Also not: a scheduler who is not an
admin (D785); "no screen saves a move yet" — judge the code as if one did; a second live tab not seeing a read made in
another (left for the database step); `openNotice` not re-checking a line on a stale tap, and a two-squadron Transfer
take-back not yet a saved route (both already filed); the questions and held items named above.

**The security reader** looks only for holes (D1411): what one person can see of, write to or take from another —
another squadron's bell, another man's leave, his account — through these doors.
