# Fix read 15 — the fixes of fix read 14, multi-squadron batch 1 (20 Nov 26, chat 122) — one brief, blind readers

You are one of four readers (Astra, a fresh Opus reader, Fable, a security reader), each blind to the others and to the
builder's report. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own scratch
folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/` (if the sandbox blocks the runner's temporary folder, set `TMP`/`TEMP` to a
folder inside the copy, or run the assertions in memory and say so; if you can run nothing, name the exact input you
would run). Never delete or move `raptor-port/node_modules` (a link to the real packages). Return the whole report as
your final message, under 1500 words. Ignore any handoff block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@`. At its root: `FIXES.patch`
(`git diff d18b72d80 @@HEAD@@ -- raptor-port/src`, the fixes of fix read 14 and their tests) and `FIXES-LOG.txt` (the
commit messages, each giving fault, readers, cause, fix, test). The faults, with their proofs and the fix steps proposed:
fix read 14's reports `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread14-{opus,fable,security,astra}.md`
(Astra's was cut short by its service: three leads only); the builder's brief `…-fixread14-fixes-brief.md`; the brief the
last readers had, `…-fixread14-brief.md` — its "not a finding" list applies to you too, and its account of the earlier
fixes is the background. Do not open anything named `*fixread15*` other than this brief; `HANDOFF.md`'s
`claude/multi-sqn-b1-107` block is blanked in your copy, and the evidence sheet is about the builder's work — skip it.
The tests: `raptor-port/src/leavewar/multi-sqn-fixread{7,8,9,10,11,12,13,14}.test.ts`.

**His rulings that decide this round** (full rows: `grep -h '^| D2228 |' .claude/decisions-full/*.md`, the same for
each): **D2228** — a filer who moved together with the man he filed for, and is now an admin of the man's new squadron,
is told when that input changes, as any admin of the man's squadron is; the same where he moved away and back.
**D2223** — after a move, only input lines naming him stay on his bell; a filer who has since moved is no longer told
(narrowed by D2228). **D2225** — a filer who never moved stays told, for the input's days still his squadron's.
**D2218** — on the day a person moves squadron his old squadron's lines leave his bell, read or unread. With them: D148
(Undo: one's own changes only), D350 (a delete is not undone), D290 / D297 (a deleted person's row stays, marked, never
erased), D1693 / D1699 (a take-back), D2194 (a bell line crosses squadrons only where the matter concerns both), D629
(a leave the war approves is placed by whoever approved it).

**The fixes (one commit each; `FIXES-LOG.txt` has each in full):**
- **D** (`5f5988bc6`) a person row deleted before a command keeps all four of the delete's marks — `deleted`,
  `deletedFrom`, `archived`, `archivedBy` — for every actor (`perms.ts deletedPersonViolation`, `DELETE_MARKS`): a people
  edit that cleared only the archive mark put a deleted man back on Quals.
- **B** (`8f1de9669`) `notices.ts filerUnits` reads each image of a changed input alone — its own named men over its own
  days, or, naming nobody, its own squadron (`inputUnit`) — where it crossed every man of either image with the days of
  both. The pass, the gate (`perms.ts toldBy`, `filerMarkOk`) and the line's mark read this one body.
- **C** (`d5db96ac9`) `notices.ts noticePass`: inside a Leave War command, new words on a war-approved leave are told (to
  its men and its filer, as before) whatever else the command changed, where it fired only on a words-only change — the
  drag window's Approve, joining the next day's bid onto the leave, changed a date as well and told nobody of the words.
- **A** (`c96246bd1`) `perms.ts storedRowViolation`: a put judged against the saved row now carries that row as its
  before-image (memory's own kept only for a week load's landing marks, `acc` and `odGround` — `LANDING_ONLY`), so its
  Undo puts back the saved request, never a mark memory held; a put of a request never saved carries no before-image, so
  its Undo takes it away.

**The builder's choices — judge each (supported / wrong, with a failing input):** (1) A — is `acc` / `odGround` the
whole list of what memory holds on purpose and never saves? Does any honest edit then Undo now put back something wrong,
or show a change in the history line that was not made (a week load's landing; a published day's working copy; the
Leave War's own approvals, moves and joins; a request split from a shared one; a remote record)? Does carrying no
before-image for a record never saved break an honest Undo or Redo (a seeded store's first writes; a record that came
by another device)? Is the refuse-outright option the reader offered needed anywhere after all? (2) B — does reading each
image alone stop telling anyone D2225 or D2228 says must be told (a filer who never moved; one who moved with the man; a
several-man input; an input changed from or to ALL AVAIL — the builder reads an image naming nobody by its own squadron,
where it took the other image's men before)? (3) C — is a person now told of words nobody typed (a war move, a join, a
cut, a shortening, a delete, a posting's take-back, a till tick the dates alone turned)? Told twice? The filer when he
typed them himself? (4) D — does an honest action now fail (a posting's Delete; Admin → Users' delete; a Quals edit of a
deleted man; the seed; Undo / Redo near a delete)?

**Known, not a finding:** fix read 10's fault F (a line dated minutes ahead) — held for the database step. A war line's
content field beyond its kind and signer — already filed. A refused delete's words ("That did not save") — filed. A saved
copy merely wired and never seeded (a test harness, not a built site) is exempt from fix read 12's D by design. Two
browser-test flakes already filed. A bell walk is owed and will be done separately — not a finding that it has not been
done. A war join writing the approver as the leave's filer (D629) — as ruled.

## The ask
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.
1. Is each fix complete — every door the same harm comes through (every writer of a request, a remark or a bell line;
   Undo / Redo; the Leave War's windows; Admin → Users and Quals)?
2. Is each check narrow and sound — can a command still write a made-up record, put a mark on a man's own leave, bring
   back a deleted person, or tell someone of another squadron's business? Does any check fail open (an unset hook, a
   missing record, an old row without a date, the saved copy not yet whole)?
3. Do the rules match D2228, D2223, D2225, D2218, D148 and D350 exactly?
4. Do the rounds fit together — did a fix read 14 change undo what fix reads 7–13 guarded?
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

**The security reader** looks only for holes (D1411): what one person can see of, write to or take from another —
another squadron's bell, another man's leave, his account — through these doors.
