# Fix read 16 — the fixes of fix read 15, multi-squadron batch 1 (20 Nov 26, chat 123) — one brief, blind readers

You are one of four readers (Astra, a fresh Opus reader, Fable, a security reader), each blind to the others and to the
builder's report. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own scratch
folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/` (if the sandbox blocks the runner's temporary folder, set `TMP`/`TEMP` to a
folder inside the copy, or run the assertions in memory and say so; if you can run nothing, name the exact input you
would run). Never delete or move `raptor-port/node_modules` (a link to the real packages). **State each finding in your
output the moment you have confirmed it** — a run can be stopped by its service, and what was said before the stop is
kept. Return the whole report as your final message, under 1500 words. Ignore any handoff block pasted after a
compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@`. At its root: `FIXES.patch`
(`git diff f27c924be @@HEAD@@ -- raptor-port/src`, the fixes of fix read 15 and their tests; it also carries a one-byte
escape in `engine/editlog.ts` that `main` already has) and `FIXES-LOG.txt` (the commit messages, each giving fault,
readers, cause, fix, test). The faults, with their proofs: fix read 15's reports
`raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread15-{astra,opus,fable,security}.md`; the brief those
readers had, `…-fixread15-brief.md` — its "not a finding" list applies to you too, and its account of the earlier fixes
is the background. Do not open anything named `*fixread16*` other than this brief, nor `*fable-sample*`;
`HANDOFF.md`'s `claude/multi-sqn-b1-107` block is blanked in your copy, and the evidence sheet is about the builder's
work — skip it. The tests: `raptor-port/src/leavewar/multi-sqn-fixread{7,8,9,10,11,12,13,14,15}.test.ts`.

**His rulings that decide this round** (full rows: `grep -h '^| D2228 |' .claude/decisions-full/*.md`, the same for
each): **D2228** — a filer who moved together with the man he filed for, and is now an admin of the man's new squadron,
is told when that input changes, as any admin of the man's squadron is; the same where he moved away and back.
**D2223** — after a move, only input lines naming him stay on his bell; a filer who has since moved is no longer told
(narrowed by D2228). **D2225** — a filer who never moved stays told, for the input's days still his squadron's.
**D2218** — on the day a person moves squadron his old squadron's lines leave his bell, read or unread. **D1388** (widened
by D1398) — once a scheduler has moved a member's input (onto the Ground Programme, under Unavailable, or Removed), only a
scheduler changes where it goes; the member's own window does not. With them: D148 (Undo: one's own changes only), D350
(a delete is not undone), D290 / D297 (a deleted person's row stays, marked, never erased), D1693 / D1699 (a take-back),
D2194 (a bell line crosses squadrons only where the matter concerns both), D629 (who placed an input is shown; a leave
the war approves is placed by whoever approved it).

**The fixes (one commit each; `FIXES-LOG.txt` has each in full):**
- **`74b452c2b`** (fix read 15's one shared finding — the security reader, the Opus reader and Fable each found it): a
  member's honest edit of his own saved leave, then Undo, cleared a scheduler's Remove ('r') on it, or put Unavailable
  ('u') over it — fix read 14's item A took memory's `acc` and `odGround` onto the saved before-image whatever their
  values. Now `perms.ts withLanding` takes from memory only a 'g'-or-nothing change of `acc`, and only where the saved
  row's is 'g' or nothing too; 'u' or 'r' on either side is the saved row's, and `odGround` always is (`LANDING_ONLY`
  gone). Fix read 14's honest control test changed from 'u' to 'g'.
- **`5f6e3f5df`**, two faults (Astra's): (1) a Leave War approval that bridges two war-approved leaves keeps the leave
  before and removes the one after; new words typed over the removed leave were told to nobody. Now one body,
  `notices.ts foldedInto` — among the records a command removed, each war-approved leave of the same war, kind and people
  as the leave that stands, whose days lie within its days — read by the pass (each folded leave whose words changed
  tells its filer, and the men once, on the leave that stands; nobody twice; never the one who typed them) and by the
  commit gate (`perms.ts foldedFor`, in `toldBy` and `filerMarkOk`). (2) An accepted edit of a record never saved
  carried `before: null`; Undo reads a create only where the before-image is absent, so it built a put of null and
  failed whole. Now such a put carries no before-image.
- **`0e81a165c`** (the code check's findings, "no behaviour changed"): JSON copies to `structuredClone` / `deepClone`
  in test files and `leavewar/state/foreign.ts` capture / restore; in `perms.ts`, `droppedKeys` and the master-account
  loop read each kept account by its id (the first of an id, as `find` read it).

**The builder's choices — judge each (supported / wrong, with a failing input):** (1) `74b452c2b` — is 'g' the only
filing a week load's landing ever writes into memory? Does any honest edit then Undo now put back something wrong or
show a change in the history line that was not made (a landing that clears a 'g'; a 'g' over a saved 'u'; a scheduler's
own move then a member's edit; a published day's working copy)? Is `odGround` truly written only inside a command?
(2) `foldedInto` — is "same war, kind and people, days within" the right test? Can it fold a leave that was not folded
(two leaves of the same men removed by one command for another reason — a cut, a delete, a posting's take-back, a
squadron move), so someone is told of words on a leave that still stands elsewhere or was deleted? Does it miss a fold
(a bridge of three; a join from the other side; leaves of a man and a group)? Can the gate's reading and the pass's
differ, so a line is refused, or a mark stands without its line? (3) The absent before-image — does a create's Undo now
remove a record that was in fact saved (a record saved by another device; a row the saved copy has not loaded yet; a
seeded store)? Redo after it? (4) `0e81a165c` — does `structuredClone` differ from the JSON copy anywhere it is now used
(a `Date`, `undefined`, a function, a `Map`, a property that JSON dropped and a check now sees; an object
`structuredClone` cannot copy and throws on)? Does reading accounts by id change which account wins where two share an
id or one has none?

**Known, not a finding:** fix read 10's fault F (a line dated minutes ahead) — held for the database step. A war line's
content field beyond its kind and signer — already filed. A refused delete's words ("That did not save") — filed. A saved
copy merely wired and never seeded (a test harness, not a built site) is exempt from fix read 12's D by design. Two
browser-test flakes already filed. A war join writing the approver as the leave's filer (D629) — as ruled. A remote
edit applied to memory only, making the next local Undo put back a stale saved image — nothing raises a remote change
yet; filed for the database step. After a delete, the Leave War grid still drawing the deleted man's row — a lead being
checked against D297 separately. A bell walk of the bridge is owed and will be done separately — not a finding that it
has not been done.

## The ask
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.
1. Is each fix complete — every door the same harm comes through (every writer of a request, a remark, a filing mark or
   a bell line; Undo / Redo; the Leave War's windows, its approvals, joins, cuts and moves; Admin → Users and Quals)?
2. Is each check narrow and sound — can a command still write a made-up record, put or clear a mark on a man's own
   leave, bring back a deleted person, or tell someone of another squadron's business? Does any check fail open (an
   unset hook, a missing record, an old row without a date, the saved copy not yet whole)?
3. Do the rules match D2228, D2223, D2225, D2218, D1388, D148 and D350 exactly?
4. Do the rounds fit together — did fix read 15's changes undo what fix reads 7–14 guarded?
5. What did the fixes break — each squadron's admins', the master's and a member's normal work; Undo and Redo (D148);
   the bell; anything that ran before and is now refused.

A finding needs a concrete failure, its cause and its exact fix step by step (D489), with the input that proves it (a
test you ran, red) and whether these commits introduced it; give explicit negatives ("I checked X and found nothing").
Rank by consequence.

**Not a finding:** this app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
the database step. Do not report a problem whose harm exists only in data already stored when the code is already
correct going forward (D56). If the app would do it again to NEW data, report it. Also not: a scheduler who is not an
admin (D785); "no screen saves a move yet" — judge the code as if one did; a second live tab not seeing a read made in
another (left for the database step); `openNotice` not re-checking a line on a stale tap, and a two-squadron Transfer
take-back not yet a saved route (both already filed); the held items named above.
