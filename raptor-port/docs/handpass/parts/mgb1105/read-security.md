# Security read — the member / guest build (D1651, D1657, the waiting pass)

Fresh, blind security reader (D1411), Opus 5.5, 5 Nov 26. Read at `2fb6d6c54`, the change `42df6337b..2fb6d6c54 -- raptor-port/src`,
compared against `origin/main` (`c7ddf441b`, the merge base). Read-only: no file changed but this one.
Unit tests run: `quals-write.test.ts`, `perms.test.ts`, `perms-scan.test.ts`, `ui/quals.test.tsx`, `ui/SaveStatus.test.tsx` — 5 files, 239 passed.

## Holes found

**None.** No route was found by which a member, a guest, a pending or a suspended person can change his own or anyone's
Scheduler tick, and nothing new in the Retry, the waiting pass or the guest page's band shows or writes what it should not.

Two low observations, neither a hole (no concrete failure today):

- **O1 (low, coverage, older pattern):** `perms.test.ts` ties the permission table to §11 but has no case for the own-row
  admin-only list (`perms.ts:373-381`, `OWN_ROW_ADMIN_ONLY`) — neither Management (D1510, already on main) nor the new Scheduler
  row. §11 itself is updated (`data-model.md:1547`, `:1549`, `:140`) and the gate is pinned by `quals-write.test.ts`
  ("the commit gate refuses a member's own-row change…", the new Scheduler case). If wanted: one `perms.test.ts` case that reads
  §11's Person / QualMark rows for `quals.sched` / `quals.mgmt` and asserts both keys are in `OWN_ROW_ADMIN_ONLY`. Not required.
- **O2 (forward, database step, older design):** the postman's queued letters carry no author (`storage/postman.ts`); the
  backoff retry already re-sends a signed-out person's failed group whoever is signed in next, and the new Retry on the sign-in,
  access and guest screens only makes that same send happen sooner. Harmless today (per-browser storage; each change was
  authorised by the commit gate under its own author and its change-log line names him). The database-era design already
  covers it: "Signing out waits for unsent changes to finish, and with no signal it warns" (`data-model.md:1367-1368`). Nothing
  to build now; whoever builds the server-side send must send a letter under its author's identity (or hold sign-out), as that
  line says.

## Explicit negatives, by hunt item

1. **A different command / write path that skips the Quals write.** Every write that changes a `people` record under a member
   actor reaches `ownershipViolation`'s `people` case (`perms.ts:1174-1180`), which now compares `!!p?.quals?.sched` before and
   after (`perms.ts:376`) — whatever command carries it (`people.edit`, `person.backSeen`, an LW posting command, a restore).
   The before-image is the last SAVED roster (`people-settings-commit.ts` baseline), so an in-memory edit made outside a command
   and swept into a later member command is caught too. Tested: `quals-write.test.ts` gate case "Scheduler" (a raw
   `bane.quals.sched` flip inside `commitPeopleEdit` rolls back with "his Scheduler tick"). No negative.
2. **A different collection or field `isScheduler` or the sign-off lists read.** `isScheduler` reads only
   `PEOPLE[id].quals.sched`, truthy (`engine/people.ts:375`); `signRoleOk` and `signPeople` (`engine/publish.ts:1636-1680`) call
   only `isScheduler` and store signers by person id, not by a callsign or initials a member could edit. The gate's reader is
   the same truthiness, so `"false"`, `1`, an object all read alike on both sides. No other collection feeds it. The signatures
   themselves live in the schedule, which a member never writes (`SCHEDULE_RECORDS` refusal, `perms.ts` people case's sibling).
3. **A command whose actor is wrong.** The actor is derived from SESSION at command creation (`command/actor.ts`): admin, member,
   guest/pending/off, or system only when SESSION is null. Guest/pending/off envelopes are refused outright except a pending
   person's own access request (`perms.ts` ownershipViolation, the `a.role !== 'member'` branch). The only system-actor command
   that enlists the roster is the posting pass, held by `postingPassViolation` — for the SANS outcome every `quals` key but `san`
   must be unchanged (`perms.ts` ~1060). `persistPeopleProjection` (a system people write) is imported but never called. No
   negative.
4. **A rollback that leaves the change in memory.** `updatePersonField` refuses the Scheduler tick before anything moves
   (`quals-write.ts:55`); a refusal at the gate restores the roster from the saved snapshot (`peopleStore.restore`). The test
   checks the tick is back after the gate's refusal. No negative.
5. **Undo / Redo replaying an admin's change as the member.** Undo runs as a command under the current actor and the `people`
   case has no "restore" exemption, so a member's Undo or Redo that would move his Scheduler tick is refused like any other
   command. An admin's step undone in the member view runs as a member and is refused (another row: "another person's row"; his
   own row: "his Scheduler tick"). Correct and safe; at worst an admin in member view cannot undo his own appointment until he
   switches back.
6. **The admin's member-view switch (D292).** `mayTickScheduler` reads the role in force (`roleOf`), as the Quals cell
   (`QualsPage.tsx:252`) and the gate (actor from the session's role) do — all three agree. `switchRoleInForce` only moves
   between admin and member for an `acct === 'admin'` session. No negative.
7. **The posting pass (system actor).** Covered in 3; it never touches `quals.sched`, and `revertUnsavedPeople` runs first so no
   unsaved in-memory change rides in it.
8. **An import / restore path.** No member-reachable import writes the roster. A person is made only by `personRecord`
   (`roster-add.ts`), which builds from the tidied form fields alone and runs `deriveQuals` → `sched:false`; an access request's
   extra fields never reach the person (approval takes the admin's form). The stored roster is loaded as saved
   (`state/persist.ts` hydrate) — the seed's "every SXO is a scheduler" line (`engine/people.ts:237`) runs once on the seed at
   module load and is never re-applied, so a member's own SXO tick (still his, D149) does not make him a scheduler (the test "the
   member still ticks the columns beside it" passes through the gate).
9. **Can `deriveQuals` produce or drop `quals.sched` in a member's command?** `deriveQuals` merges `{…, sched: !!p.sched}` UNDER
   the existing `p.quals` (`engine/people.ts:148-166`), so an existing tick (true or false) is kept on a CAT change; nothing writes
   a raw `p.sched`, so it cannot add one. Personnel get `quals = {}`, but a personnel row has no CAT box and no qualification cells
   (`QualsPage.tsx:235`), so no member command reaches that branch. So the gate neither refuses a legitimate CAT / initials /
   flight change of an appointed member (tested: "a member the admin appointed changes his own CAT…") nor lets a change through.
10. **Retry where nobody — or a pending / guest / off person — is signed in.** `Warning`'s Retry only calls `source.flush()`
    (`SaveStatus.tsx`), which sends what is already queued; it makes no command and no new write, and every queued change was
    authorised when its author made it. It cannot flush something the screen's person may not do. Another person's queued
    writes: see O2 — the same send already happens by itself on backoff (older, on main); no identity is attached to a letter
    today, so nothing is re-attributed. The Retry is `type="button"` outside the sign-in and request forms, so it submits
    nothing. No negative.
11. **Does the waiting screen show one person's details to another?** `requestByName(SESSION.name)` keys on the session's own
    normalised sign-in name (`accounts.ts:236`), and a pending session's name is the one typed at sign-in. Someone who types
    another person's waiting sign-in name lands on that person's waiting screen (no password is asked for a request —
    `accounts.ts signIn`), but that is unchanged from main: main's waiting screen already printed the same callsign, initials,
    seat and CAT (`requestSummary`), and the sign-in is not security (the site lock is Vercel's). Not new; not a finding.
12. **Unsafe escaping of user text.** Every new piece of request text renders as React text (`PassCallsign`'s `{cs}`, the
    `<dd>{v}</dd>` fields); `PassCallsign`'s layout effect sets only `style.fontSize` and a class. The request is read defensively
    on load (`accounts.ts` accountsLoad: `cs` stringified and cut to 14, `ini` to the initials limit, seat and CAT checked against
    the lists), so a forged request cannot put an object on screen and crash the pass. The Quals cell's new `title` is one of two
    fixed strings. `SplitWords` in the OIL bar renders `b.text` as React text. No negative.
13. **Does the guest page's new band expose anything?** `SaveStatus` shows only "Saving…" or "Not saved — keep this page open"
    and Retry; no record, name or count. A guest learns only that a save on this browser has not landed. No negative.

## Verdict

D1651 holds at the screen (`QualsPage.tsx:252`), the write (`quals-write.ts:55`) and the commit gate (`perms.ts:376`), and §11
says so (`data-model.md:1547`, `:1549`). D1657's band and Retry write nothing. The waiting pass shows only what main already
showed, as React text. No hole; two low observations (O1 a missing §11 tie-test, O2 a database-step note the design already
carries).
