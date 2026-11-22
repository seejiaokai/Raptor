# Fix read 13's faults, and his D2228 — the builder's brief (20 Nov 26, chat 118, overnight; branch `claude/multi-sqn-b1-107`)

You are the builder (Opus). Build each item below RED FIRST by a test that fails on `3d9743036`'s code, then fixed at
its cause, one commit each, in a new file `raptor-port/src/leavewar/multi-sqn-fixread13.test.ts`. Read first:
`AGENTS.md`'s rules list, `.claude/rules/raptor-executor.md`, `.claude/rules/decisions/people-accounts.md`, and the
reports `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread13-{opus,fable,security,astra}.md`. The
readers' proofs, each red on this code (the host ran them all), sit in chat 118's scratch
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/9fd34fb7-f6fc-4b49-8eb7-eec4d211d74d/scratchpad/fr13-{opus,fable,security}/raptor-port/src/zz-*13/`
— copy their set-ups, never import from there. `multi-sqn-fixread{7,8,9,10,11,12}.test.ts` stay green except fix read
9's three Q1 proofs, which item C turns green.

## The items

**A. A record made up in memory still reaches the saved copy through a delete (O13-1, F13-1, SEC13-2; high — fault D
of fix read 12 incomplete; the door older).** (1) Ranger pushes "his leave, filed by Kestrel a month ago" into memory,
deletes it, then presses Undo: the Undo saves the made-up record (`o13-d-undo.test.ts:77`); the same for a bell line
dated 2099 (`:100`) and for his own SAVED request rewritten in memory, then deleted and undone (`:88`). (2) The delete
alone sends a saved bell line to a "filer" who never filed it, words the member chose (`f13-1-delete-door.test.ts:118`,
`:124`; `sec13-deleted-madeup.test.ts:123`, `:129`). Cause: `perms.ts storedRowViolation` judges only a put — an unsaved
record passes on `c.op !== 'put'`; a delete whose before-image differs from the saved row is judged against the saved row
and passes as a delete; the Undo step records memory's before-image and puts it back under origin `restore`, which every
check exempts. Fix: (a) for an input or notice change on a whole store, origin not restore / seed / remote, id not in
REMOTE_ONLY: a removal (op delete, or a put with after null) of a record with NO saved row is refused, "a record never
saved, taken away as if it were"; (b) the robust half: the Undo step of such a change records the SAVED row as its
before-image, never memory's (the gate hands the timeline the saved image, or the timeline reads the probe) — so a
delete of a rewritten saved record, undone, puts back the saved row; (c) tests: the seven red proofs above, plus the
controls — a member deletes his own saved request and Undoes it (the row back as saved); Ranger deletes a REAL request
Hunter filed (allowed, Hunter told); the made-up record edited (still refused); a 149 filer (still refused).

**B. A Delete posting made up in memory is carried out by the posting pass in a member's browser (SEC13-1; high —
older; fix read 12's A widens it to the man's rights in another squadron).** Ranger (142 member) sets
`getState().postOuts.prowler = {…, to: <a past date>, poOutcome: 'delete'}` outside every command; the pass runs in his
browser: Hunter deleted, sign-in gone, 149's grant gone (`sec13-forged-posting.test.ts:111`, `:121` on a seeded saved
copy; `:135` the older half, Casper with no rights elsewhere). Cause: `leavewar/sync.ts runPoOutcomes` reads whatever
postings are in memory (`poDueNow`), putting back unsaved roster changes (`revertUnsavedPeople`) but never unsaved
postings; `perms.ts postingPassViolation` accepts any `lw.postouts` change whose after has `poDone` due, even with no
before-image. Fix: (a) `runPoOutcomes` puts the war's unsaved postings back to the saved ones before `poDueNow` runs, as
`revertUnsavedPeople` does for the roster; (b) `postingPassViolation`: each `lw.postouts` change needs a before-image
equal to the war's SAVED posting row (a probe for the war's saved copy, like `setStoredRowProbe`), its `to` and outcome
unchanged in the after; no `!b` except the removed-record Delete branch, where `b` must equal the saved row; where no war
probe is installed (a test without saved rows) nothing is asked, as `setStoredRowProbe`; (c) tests: the three red proofs
green, the control (no posting, nothing done) green; fix read 12's A tests, `postout-roster`, `postout-persist`,
`onedoor` stay green; a real posting set by an admin runs on its date, and its Undo post out works.

**C. His D2228 (20 Nov 26): a filer who moved and is again an admin of the man's squadron is told.** Read its full row
(`grep -h '^| D2228 |' .claude/decisions-full/*.md`). Hunter (142 admin) files Ranger's leave on 15 Jul; both move to 149
on 16 Jul, Hunter an admin of 149; on 17 Jul Kestrel changes its remark: Hunter told. Also Hunter moving away and back,
an admin of the man's squadron again: told. Still NOT told: a moved filer who is no admin of the man's squadron on the
input's days (D2223); a filer who never moved, for days none of which is still his squadron's (D2225). The lines he had
before his move still leave his bell on the move day (D2218) — nothing from before comes back. Cause: `state/notices.ts
filerVia` counts a moved filer only through a right he holds (Plan, the master mark), never his home admin role. Fix:
count a moved filer's admin role in a squadron that is the named man's home on one of the input's days, read today
(his role as it stands when the input changes — the agent's reading in D2228's row); the gate (`perms.ts toldBy`, `filerMarkOk`) and the line's mark (`Notice.fu`) the same. Fix read 9's three Q1
proofs (Opus O9-3, Fable 3 — in fix read 9's reports and scratch `fr9-*`) green; tests for the move-together case, the
move-and-back case and the two not-told controls. `docs/data-model.md` (`filerUnits` and §11) and `docs/data-schema.md`
rewritten with it (D201); `docs/notifications-register.md` if it states the filer rule.

**D. Astra's two leads (it was stopped before its report; its last line only — the host has NOT reproduced them).**
(1) "A command can revive a deleted person" — D350: a person delete is never undone; (2) "the Leave War's
dragged-selection remark editor omits an eligible filer's notification" (a remark changed on a dragged block of days
does not tell the filer the input command would tell). Make each red yourself first through the app's own doors; one
you cannot make red is not a finding — say what you tried. A red one: fix it at its cause, a test, one commit.

## Rules
- Change only what each item needs; no other tidying. Every gate change goes through `state/perms.ts` with
  `docs/data-model.md` §11 in the same commit (D200). A changed expected result in an older test only where an item here
  requires it, said in the commit.
- Each commit message: the item, the readers, the cause, the fix, the test, "red on 3d9743036's code (…), green now".
- Before you hand back: from `raptor-port/`, the unit suite under the lock (`node scripts/gatelock.mjs exec
  "claude/multi-sqn-b1-107 — fixread13 unit" -- npm test`), `npm run build`, `node reference/tfin.js` (728/0), `npm run
  rulecheck`, `npm run docsize`. `docs/file-map.md` names the new test file.
- Commit on `claude/multi-sqn-b1-107`; do NOT push, do NOT touch `HANDOFF.md`, do NOT merge. A blocker: stop and say it.

## Hand back (short)
Status, the commits (one line each), each item's red-then-green evidence, the checks with their counts, any departure
from this brief with its reason, and anything found outside it.
