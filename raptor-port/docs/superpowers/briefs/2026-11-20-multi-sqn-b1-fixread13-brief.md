# Fix read 13 — the fixes of fix read 12, multi-squadron batch 1 (20 Nov 26, chat 118, overnight) — one brief, blind readers

You are one of four readers (Astra, a fresh Opus reader, Fable, a security reader), each blind to the others and to the
builder's report. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own scratch
folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/` (if the sandbox blocks the runner's temporary folder, set `TMP`/`TEMP` to a
folder inside the copy, or run the assertions in memory and say so; if you can run nothing, name the exact input you
would run). Never delete or move `raptor-port/node_modules` (a link to the real packages). Return the whole report as
your final message, under 1500 words. Ignore any handoff block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@` (its code is `3d9743036`'s). At its root:
`FIXES.patch` (`git diff cd8231767 3d9743036 -- raptor-port/src`, the five fixes of fix read 12 and their tests) and
`FIXES-LOG.txt` (the commit messages, each giving fault, readers, cause, fix, test, and any older test changed). The
faults, with their proofs and the fix steps proposed: fix read 12's reports
`raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread12-{opus,fable,security,astra}.md`; the builder's
brief `…-fixread12-fixes-brief.md`; the brief the last readers had, `…-fixread12-brief.md` — its "not a finding" list
applies to you too, and its account of the earlier fixes is the background. Do not open anything named `*fixread13*`
other than this brief; `HANDOFF.md`'s `claude/multi-sqn-b1-107` block and the evidence sheet's "Fix read 12" section are
about the builder's work — skip them. The tests: `raptor-port/src/leavewar/multi-sqn-fixread{7,8,9,10,11,12}.test.ts`.

**His rulings that decide this round** (full rows: `grep -h '^| D2225 |' .claude/decisions-full/*.md`, the same for
each): **D2218** — on the day a person moves squadron his old squadron's lines leave his bell, read or unread, never
later struck; lines about himself stay. **D2223** (narrowed by D2225) — after a move, only input lines naming him stay
on his bell; a filer who has since moved is no longer told of the input he filed. **D2225** — a filer who never moved
stays told. **D2222** — a line about a moved man's own leave follows him. With them: D2194 (a bell line crosses
squadrons only where the matter concerns both), D1693 / D1699 (a take-back), D148 (Undo: one's own changes only), D350
(a delete is not undone), D2192 / D2199 / D2201 (View, Plan and the master admin), D2094 (who makes an admin), D2203 (a
move drops grants; the agent's reading: a person delete takes them too).

**The five fixes (one commit each; `FIXES-LOG.txt` has each in full):**
- **A** a posting's Delete — on its date by the posting pass, or at once (`lw.postout`) — of a man whose sign-in holds a
  right in another squadron now runs: a right's removal passes only where the command's own before / after records show
  an allowed delete of that person and that sign-in (`personDeletedHere`; for the pass, the matching due Delete
  posting); G5 (no account row goes while a right names it) holds for the pass too; on a refused command the in-memory
  accounts list is put back.
- **B** fix read 11's H no longer trusts the command's type: the same command must delete the man itself (a people
  change to deleted / archived by delete), no account in the after-world names him, and the actor is an admin of his
  squadron.
- **C** H on the accounts' very first write: where the command records no change of the account row, the two account
  lists are read as the loader reads them.
- **D** a request or bell line with no saved row whose change carries a before-image is judged a second time as NEW —
  only once the saved copy holds every record (`setStoredRowsWhole`: set by `writeSeedRows` or a store that came back
  from storage, both at boot through `wirePersist`). Exempt by name: a remote change and any record that came by one; a
  seed; an Undo / Redo (origin `restore`); a tried save (never reaches the gate).
- **E** a repeated Undo / Redo keeps the date an earlier restore gave a right or link (master, Plan / View, re-link,
  two different steps); still today where a move fell while the right was absent.

**The builder's choices — judge each (supported / wrong, with a failing input):** (1) A — does any honest delete now
pass that should not, or fail that should pass (a member's own posting, an Overseas Sqn posting, a pass of several
postings, a Delete posting undone with Undo post out, a master's sign-in)? (2) B — can the person-delete exception still
be reached by a command that deletes a different man, archives without deleting, or deletes and re-adds him? (3) D —
does the "whole" mark ever turn on before every record is saved, or stay off on a built site? Does the remote exemption
(kept for every record that ever came by one) or the restore exemption (any origin `restore`) open a door a person can
use? Can a person raise origin `restore` or `remote`? (4) E — an old undo step with no stamps; Redo then Undo three
times; Undo of a step another admin's change has since touched.

**Known, not a finding:** a filer who moved and is now that man's own admin is not told of the input he filed (fix
read 9's Opus O9-3 = Fable 3) — a question put to him, not yet answered; its three proofs stay red on purpose. Fix read
10's fault F (a line dated minutes ahead) — held for the database step. A war line's content field beyond its kind and
signer — already filed. A refused delete's words ("That did not save") — filed. A saved copy merely wired and never
seeded (a test harness, not a built site) is exempt from D by design — report it only through the app's real start-up.

## The ask
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.
1. Is each fix complete — every door the same harm comes through (Admin → Users' delete, the Leave War's posting sheet
   dated and at once, the posting pass, Undo post out, every writer of a request or bell line, Undo / Redo)?
2. Is each check narrow and sound — can a command still take another squadron's right, write a made-up record, or bring
   back a retired line? Does any check fail open (an unset hook, a missing record, an old row without a date, an old
   undo step without a stamp)?
3. Do the rules match D2218, D2223, D2225, D2222 and D2203 exactly?
4. Do the rounds fit together — did a fix read 12 change undo what fix reads 7–11 guarded?
5. What did the fixes break — each squadron's admins', the master's and a member's normal work; Undo and Redo (D148);
   the posting pass and its take-back; Admin → Users' delete of a person; a seeded demo store's first writes; anything
   that ran before and is now refused.

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
