# Fix read 12's faults — the builder's brief (20 Nov 26, chat 118, overnight; branch `claude/multi-sqn-b1-107`)

You are the builder (Opus). Build the five faults below, each RED FIRST by a test that fails on `c2fd83020`'s code, then
fixed at its cause, one commit each, in a new file `raptor-port/src/leavewar/multi-sqn-fixread12.test.ts`. Read first:
`AGENTS.md`'s rules list, `.claude/rules/raptor-executor.md`, `.claude/rules/decisions/people-accounts.md`, and the
reports `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread12-{opus,fable,security,astra}.md`. The
readers' proofs, each red on this code (the host ran them all), sit in chat 118's scratch
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/9fd34fb7-f6fc-4b49-8eb7-eec4d211d74d/scratchpad/fr12-{opus,fable,security}/raptor-port/src/zz-*12/`
— copy their set-ups, never import from there. `multi-sqn-fixread{7,8,9,10,11}.test.ts` stay green (fix read 9's three
Q1 proofs are not in them — leave that case: it waits for his answer); Fable's `f11-c-legit` honest paths (in the fix
read 11 file) stay green.

## The faults

**A. The posting pass's Delete is refused whole when the man's sign-in holds a right in another squadron (Opus O12-2,
Fable F12-1; high; INTRODUCED by fault E of fix read 11).** The posting pass runs the same delete body, which now drops
his grants; `perms.ts postingPassViolation`'s last loop allows only `accessreq:` / `reqseen:` removals, so the grant row
refuses the pass — the man not deleted, the posting not done, every other posting that day refused with it, again on
every pass (Opus `pass-delete-grant.test.ts:153`, `:136`; Fable `f12-1-posting-delete.test.ts:87`). Fix: (1) in that loop
also allow a `grant:` row's removal whose before-image's `account` is an account row this same pass removes and whose
posted man's outcome is `'delete'`; (2) G5 (no account row goes while a right names it) holds for the pass too — run it
before the system actor's early return, or in `postingPassViolation`; (3) on a refused command the in-memory accounts
list (`ACCOUNTS_LIST`, `ACCOUNTS_STORED`) is put back (re-read in the rollback of any command that enlisted the settings
store), so a retry never runs on the refused try's list (Opus `:136`); (4) tests: a Delete posting of a man holding View,
and one holding Plan, of the other squadron runs on its date, sign-in and right gone; the accounts saved as rows; a pass
of two postings, one this one; an Overseas Sqn posting removes no right; a pass removing a grant of a man it does NOT
post out stays refused. `data-model.md` §11, the posting pass's row. **Astra adds the immediate route** (its finding 1,
run in memory, no file — make it red yourself first): Hunter selects a Delete posting dated TODAY for a man whose saved
sign-in holds a right in another squadron — the `lw.postout` command is refused, person, sign-in and right remain. The
same rule must serve both routes: a grant row's removal passes only where the command's own before / after records show
an allowed delete removing that person and that sign-in (for the pass, also the matching due Delete posting); tests for
View and Plan, a home admin and a master, scheduled and immediate, plus the no-grant controls.

**B. Fault H trusts the command's label (O12-1, F12-2, SEC12-1; high; INTRODUCED by fault H).** A command typed
`person.delete` that deletes nobody strips 142's Plan from a 149 man who stays, and a new sign-in for him in the same or a
later command (Opus `h-forged-delete.test.ts:157`; Fable `f12-2-delete-label.test.ts:74`; security
`sec12-h-label.test.ts:142`, `:152`). Fix: the WHO skip in `unitRowViolation` passes only where the same command carries
the person delete itself — a helper `personDeletedHere(env, pid)` beside `accountGoesHere`: a `people` change of the
account's person (`accountBefore(aid, c.before).pid`), before not deleted, after `deleted === true`, `archived === true`,
`archivedBy === 'del'`; no account in the after-world names that pid; the actor an admin of that man's squadron as
section 8 reads it; the type an extra condition at most, never alone. Tests: the label with no people change refused;
with ANOTHER man's delete beside this man's account row refused; sign-in removed and a new one under a new id in one
command refused; the real `deletePerson` allowed.

**C. Fault H fails on the accounts' very first write (Fable F12-3; low, the seeded demo; INTRODUCED by fault H).** Kestrel
deletes Osprey whose seeded sign-in holds View of 142, on a store that never wrote its accounts: "That did not save"
(`f12-3-first-write.test.ts:75`). Cause: `writeAccounts` records no change for a row it drops on the first write. Fix:
where the command carries no change of that row, `accountGoesHere` reads the two lists as the loader does
(`worldsOf(env)`: in the before list, not in the after list), as section 8 does.

**D. A record made up in memory, then "changed", skips the rules for a new record (SEC12-2; medium; older — the missing
half of fix read 11's A).** Ranger (member) saves his own leave "filed by Kestrel" a month ago; Hunter saves a line on his
own man's bell dated 2099 (security `sec12-fabricated-before.test.ts:135`, `:159`; control `:154` green). Fix: in
`storedRowViolation`, with the probe installed and the origin not remote or seed, an inputs or notices change (not the
order row) whose id has NO saved row but a `before` in the change is judged a second time with `before: null` — as new
(a member's request filed by himself, now; a line dated now; a war or holiday line one its writer minted). FIRST check no
honest path edits an unsaved record before its row lands — `writeSeedRows` on a store not started, `tryInputsBatch`'s
thrown-away runs, a restore's verified replay, a record that came by a remote change never written locally; exempt each
such path by name, with a test. Controls: Fable's honest paths, the week-load control.

**E. A repeated Undo / Redo brings back a date a move retired (Astra 2; high; the same-step cycle INTRODUCED by fix read
11's G, the two-steps variant older).** Astra ran these in memory — make each red yourself first; one you cannot make red
is not a finding (say so). Master: Hunter master 10 Jul, his filer line; the mark removed 11 Jul; he moves 12 Jul; Undo
13 Jul restores the mark dated 13 Jul (line hidden — correct); on 14 Jul Redo the removal and Undo again: the date
becomes 10 Jul and the retired line returns. Plan: Plan dated 13 Jul set to View 15 Jul; he moves 16 Jul; Undo 17 Jul
restores Plan dated 17 Jul (correct); Redo / Undo on 18 Jul restores 13 Jul. And the same with two different master
steps. Cause: the restore takes the right's date from the original Undo record and forgets the later date an earlier
restore set. Fix: when a restore takes a right or a link away, keep its effective dates, tied to account, person and
squadron; reversing that restore uses them where keeping the day is allowed; still today when a move fell while the
right was absent; a Redo of a re-link stays today. Tests: master, Plan / View and re-link round trips, two different
steps; fix read 11's G tests and fix read 9's F1 / F1b / O9-2 stay green.

## Rules
- Change only what each fault needs; no other tidying. Every gate change goes through `state/perms.ts` with
  `docs/data-model.md` §11 in the same commit (D200). A changed expected result in an older test only where a fault here
  requires it, said in the commit.
- Each commit message: the fault, the readers, the cause, the fix, the test, "red on c2fd83020's code (…), green now".
- Before you hand back: from `raptor-port/`, the unit suite under the lock (`node scripts/gatelock.mjs exec
  "claude/multi-sqn-b1-107 — fixread12 unit" -- npm test`), `npm run build`, `node reference/tfin.js` (728/0), `npm run
  rulecheck`, `npm run docsize`. `docs/file-map.md` names the new test file.
- Commit on `claude/multi-sqn-b1-107`; do NOT push, do NOT touch `HANDOFF.md`, do NOT merge. A blocker: stop and say it.

## Hand back (short)
Status, the commits (one line each), each fault's red-then-green evidence, the checks with their counts, any departure
from this brief with its reason, and anything found outside it.
