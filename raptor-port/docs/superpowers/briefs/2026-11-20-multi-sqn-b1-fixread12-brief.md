# Fix read 12 — the fixes of fix read 11, multi-squadron batch 1 (20 Nov 26, chat 118, overnight) — one brief, blind readers

You are one of four readers (Astra, a fresh Opus reader, Fable, a security reader), each blind to the others and to the
builder's report. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own scratch
folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/` (if the sandbox blocks the runner's temporary folder, set `TMP`/`TEMP` to a
folder inside the copy, or run the assertions in memory and say so; if you can run nothing, name the exact input you
would run). Never delete or move `raptor-port/node_modules` (a link to the real packages). Return the whole report as
your final message, under 1500 words. Ignore any handoff block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@` (its code is `c2fd83020`'s). At its root:
`FIXES.patch` (`git diff 2a286f49e c2fd83020 -- raptor-port/src`, the eight fixes of fix read 11 and their tests) and
`FIXES-LOG.txt` (the commit messages, each giving fault, readers, cause, fix, test, and any older test changed). The
faults, with their proofs and the fix steps proposed: fix read 11's reports
`raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread11-{opus,fable,security}.md` (Astra's did not
finish); the builder's brief `…-fixread11-fixes-brief.md` (faults A–G; H was added by the host, below); the brief the last
readers had, `…-fixread11-brief.md` — its "not a finding" list applies to you too, and its account of the earlier rounds
is the background. Do not open anything named `*fixread12*` other than this brief; `HANDOFF.md`'s
`claude/multi-sqn-b1-107` block and the evidence sheet's "Fix read 11" section are about the builder's work — skip them.
The tests: `raptor-port/src/leavewar/multi-sqn-fixread{7,8,9,10,11}.test.ts`.

**His rulings that decide this round** (full rows: `grep -h '^| D2225 |' .claude/decisions-full/*.md`, the same for
each): **D2218** — on the day a person moves squadron his old squadron's lines leave his bell, read or unread, never
later struck; lines about himself stay. **D2223** (narrowed by D2225) — after a move, only input lines naming him stay
on his bell; a filer who has since moved is no longer told of the input he filed. **D2225** — a filer who never moved
stays told. **D2222** — a line about a moved man's own leave follows him; an Undo by his old squadron tells him "taken
back" (read) or removes it (unread); its Redo puts it back. With them: D2194 (a bell line crosses squadrons only where
the matter concerns both), D2215, D1693 / D1699 (a take-back), D148 (Undo: one's own changes only), D350 (a delete is not
undone), D2192 / D2199 / D2201 (View, Plan and the master admin), D2094 (who makes an admin), D2203 (a move drops grants).

**The eight fixes (one commit each; `FIXES-LOG.txt` has each in full):**
- **A** for every change of a request or a bell line, put or delete, whose id the SAVED copy holds (not a remote or seed
  change, not the requests' order row), the owner checks run a second time against the saved row as the before-image;
  either failing refuses. The probe `persist.ts wireRows` installs now returns the saved row.
- **B** no exemption by the command's label: `sched.load` no longer skips the saved-copy checks, and a `sched.load` of
  a person's origin is refused at the gate.
- **C** a holiday line passes as the holiday's own only where the command's own holiday change owes it
  (`leavewar/sync.ts` holiday lines owed, through a setter, owing nothing unset), minted by `noticeHoliday` and signed
  by the actor.
- **D** a war line carries the signer its writer gives (the maker for a decision, bidding, "taken back" / "again" and a
  posting's take-back; none for the posting pass's line); an edit of a leave owes a line only where it came, went, or
  changed its person, dates (half days included), type or war mark.
- **E** a right goes with its account; a new account row under an id a right still names is a re-link (dated today, by
  the re-link rules); no account row goes while a right names it unless the same command removes those rights.
- **F** an Undo or Redo that keeps a link unchanged keeps its recorded link day; the gate asks the same.
- **G** a Redo re-stamps the moment the right went off; a restore taking an account from not-admin to admin of a squadron
  (Plan back from View) counts as a right put back; an UNDO that puts a re-linked account back on its recorded person
  keeps the recorded link and mark days where no move falls between (a Redo of a re-link stays dated today, fix read
  10's F10-4) — the restore's direction passed to the gate (`restoreDir`).
- **H** (the host's) a person delete takes his rights in every squadron with him, inside its own command, all or nothing:
  the gate allows a right's removal by the deleting admin only where the same command removes that person's account row
  as part of a person delete he may make; a bare removal of another squadron's right stays refused. The agent's reading
  of D2203 (a move clears them; a delete is a fuller leaving).

**The builder's choices — judge each (supported / wrong, with a failing input):** (1) A — does a second pass against the
saved row refuse any honest path (a week load, a remote copy, a seed, an Undo / Redo of a delete or of a rewrite, the
posting pass, a person delete, two commands in a row before the save lands, a save that failed and is retried)? Can it
be bypassed (a collection not asked, a change with no id, the order row, an unset probe)? (2) B — does anything in the
app still raise `sched.load` from a person? (3) C — a master adding a holiday at a shared place; a holiday's Undo / Redo;
a holiday changed (dates or name); removed. (4) D — every real writer still passes (decisions, bidding open / close, a
posting, Undo post out, the restore's follow-ups); a half-day edit. (5) E and H — can a 149 admin now strip 142's rights
from a man he may delete, then restore the man? Can a delete be used to take a right from a man who stays (an account row
removed and written back in one command)? Is a person delete by someone who may not make it still refused whole? (6) F
and G — an old undo step with no stamps; a Redo of a Plan → View; two Undos of different steps touching the same
account.

**Known, not a finding:** a filer who moved and is now that man's own admin is not told of the input he filed (fix
read 9's Opus O9-3 = Fable 3) — a question put to him, not yet answered; its three proofs stay red on purpose. Fix read
10's fault F (a line dated minutes ahead) — held for the database step. A war line's content field beyond its kind and
signer — already filed; report it only with a concrete harm through a door. A refused delete's words ("That did not
save") — filed.

## The ask
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.
1. Is each fix complete — every door the same harm comes through? Every place that writes or restores a right (Admin →
   Users, Squadrons, Undo / Redo, an account's own edit, a person delete), every writer of a war or holiday line, every
   change of a saved record — does each ask the same rules?
2. Is each check narrow and sound — can a command still write, delete, rewrite or restore a line on another squadron's
   bell, or a line about someone other than its addressee? Can a mark, a date, a grant's day, a link's day or a registry
   entry be made up, dropped or widened? Does any check fail open (an unset hook, a missing record, an old row without a
   date, an old undo step without a stamp)?
3. Do the rules match D2218, D2223, D2225 and D2222 exactly — the move day, read and unread, a man who moves back, two
   moves, a master, a Plan holder (given before, on and after the move), a re-linked account, a deleted man, a filer who
   never moved, a filer who moved?
4. Do the rounds fit together — did a fix read 11 change undo what fix reads 7–10 guarded?
5. What did the fixes break — each squadron's admins', the master's and a member's normal work; Undo and Redo (D148) of
   a grant, the mark, a re-link, a leave decision, a posting, a holiday, a delete of an input; the posting pass and its
   take-back; Admin → Users' delete of a person; the Leave War saving a leave through an input command; a holiday added
   at a shared place; anything that ran before and is now refused.

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
