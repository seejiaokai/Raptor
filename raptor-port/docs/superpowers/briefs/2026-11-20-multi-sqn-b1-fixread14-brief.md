# Fix read 14 — the fixes of fix read 13, multi-squadron batch 1 (20 Nov 26, chat 119) — one brief, blind readers

You are one of four readers (Astra, a fresh Opus reader, Fable, a security reader), each blind to the others and to the
builder's report. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own scratch
folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/` (if the sandbox blocks the runner's temporary folder, set `TMP`/`TEMP` to a
folder inside the copy, or run the assertions in memory and say so; if you can run nothing, name the exact input you
would run). Never delete or move `raptor-port/node_modules` (a link to the real packages). Return the whole report as
your final message, under 1500 words. Ignore any handoff block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@` (its fix code is `aa96a9a0f`'s; `main`
was brought in after it — that merge touched no file the fixes touch). At its root: `FIXES.patch`
(`git diff b9f1d5b6b aa96a9a0f -- raptor-port/src`, the fixes of fix read 13 and their tests) and `FIXES-LOG.txt` (the
commit messages, each giving fault, readers, cause, fix, test, and any older test changed). The faults, with their proofs
and the fix steps proposed: fix read 13's reports
`raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread13-{opus,fable,security,astra}.md` (Astra's was cut
short by its service: two leads only); the builder's brief `…-fixread13-fixes-brief.md`; the brief the last readers had,
`…-fixread13-brief.md` — its "not a finding" list applies to you too, and its account of the earlier fixes is the
background. Do not open anything named `*fixread14*` other than this brief; `HANDOFF.md`'s `claude/multi-sqn-b1-107`
block and the evidence sheet's "Fix read 13" section are about the builder's work — skip them. The tests:
`raptor-port/src/leavewar/multi-sqn-fixread{7,8,9,10,11,12,13}.test.ts`.

**His rulings that decide this round** (full rows: `grep -h '^| D2228 |' .claude/decisions-full/*.md`, the same for
each): **D2228** (new this round; narrows D2223 and D2225) — a filer who moved together with the man he filed for, and
is now an admin of the man's new squadron, is told when that input changes, as any admin of the man's squadron is; the
same where he moved away and back; the lines he had before his move still leave on the move day; the agent's reading:
"that man's admin" is read on the input's own days. **D2218** — on the day a person moves squadron his old squadron's
lines leave his bell, read or unread, never later struck; lines about himself stay. **D2223** — after a move, only input
lines naming him stay on his bell; a filer who has since moved is no longer told (now narrowed by D2228). **D2225** — a
filer who never moved stays told. **D2222** — a line about a moved man's own leave follows him. With them: D2194 (a bell
line crosses squadrons only where the matter concerns both), D1693 / D1699 (a take-back), D148 (Undo: one's own changes
only), D350 (a delete is not undone), D290 / D297 (a deleted person's row stays, marked), D2192 / D2199 / D2201 (View,
Plan and the master admin), D2094 (who makes an admin), D2203 (a move drops grants).

**The fixes (one commit each; `FIXES-LOG.txt` has each in full):**
- **A** (`34f6e2c43`) a removal — a delete, or a put leaving nothing — of a request or bell line the saved copy does not
  hold is refused ("a record never saved, taken away as if it were"), under fix read 12's exemptions (store not whole, a
  restore, a seed, a remote record); a removal judged against the saved row carries that row as its before-image once
  every check has passed, so its Undo puts back the record as saved.
- **B** (`99ca62b4a`) the posting pass never carries out a posting that exists only in memory: `revertUnsavedPostOuts`
  puts memory's postings back to the saved ones before the pass reads what is due, and again inside its command; the
  gate (`postingPassViolation`) needs each posting change's before-image to equal the saved posting row while the saved
  copy is wired, its `to` and outcome unchanged; a removed record only for a Delete.
- **C** (`16a566d88`, then `aa96a9a0f`) his D2228: `filerVia` also counts, for a moved filer, his home today where his
  account is an admin and that home is a named man's home on one of the input's days; the role read through the
  accounts module.
- **D (1)** (`8b077389e`) a delete is final at the commit gate: a person row deleted before a command must keep its mark
  and date after it, and is never removed — for every actor, the app's own pass included.
- **D (2)** (`ceb60ed0f`) the Leave War's drag window, typing a remark on a war-approved leave, now tells the leave's filer
  too (only while he is still to be told, not twice), as the leave's own window does.

**The builder's choices — judge each (supported / wrong, with a failing input):** (1) A — does an honest removal now
fail (a member deleting his own saved request; an admin deleting a request on a seeded demo store's first write; a
remote record; Undo / Redo of a delete; a bell line cleared by the app's own retiring of lines on a move day)? Does the
swapped before-image ever put back a stale record, or hide a real change from the history line? (2) B — does an honest
posting now fail to run (a posting set and saved, then due on a later day; a pass of several postings; Undo post out;
an Overseas Sqn posting; a pass woken while a command is under way)? Can memory still steer the pass by another field?
(3) C — does D2228 now tell someone D2223 says must not be told (an admin of a third squadron; a man who moved but is a
member; an admin of the man's squadron on none of the input's days; a filer whose admin role was taken away after the
move)? Is anyone D2228 names still not told? (4) D (1) — does an honest action now fail (Admin → Users' archive and
restore of a person who is not deleted; a posting's Delete; the seed; a person row whose deleted date is absent on old
data going forward)? (5) D (2) — is the filer told exactly once, through the right squadron, and never when he made the
change himself? Is any other window that writes a remark (the day sheet, the phone's sheet, an approval) still out of
step?

**Known, not a finding:** fix read 10's fault F (a line dated minutes ahead) — held for the database step. A war line's
content field beyond its kind and signer — already filed. A refused delete's words ("That did not save") — filed. A saved
copy merely wired and never seeded (a test harness, not a built site) is exempt from fix read 12's D by design — report
it only through the app's real start-up. Two browser-test flakes already filed. A bell walk is owed and will be done
separately — not a finding that it has not been done.

## The ask
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.
1. Is each fix complete — every door the same harm comes through (Admin → Users' delete and restore, the Leave War's
   posting sheet dated and at once, the posting pass, Undo post out, every writer of a request, a remark or a bell line,
   Undo / Redo)?
2. Is each check narrow and sound — can a command still take another squadron's right, write a made-up record, remove
   one, or bring back a retired line or a deleted person? Does any check fail open (an unset hook, a missing record, an
   old row without a date, an old undo step without a stamp, the saved copy not yet whole)?
3. Do the rules match D2228, D2218, D2223, D2225, D2222, D350 and D2203 exactly?
4. Do the rounds fit together — did a fix read 13 change undo what fix reads 7–12 guarded?
5. What did the fixes break — each squadron's admins', the master's and a member's normal work; Undo and Redo (D148);
   the posting pass and its take-back; Admin → Users' delete and restore of a person; a seeded demo store's first writes;
   anything that ran before and is now refused.

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
