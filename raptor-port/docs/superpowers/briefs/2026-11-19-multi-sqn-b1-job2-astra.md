# Job 2 — Astra's code read (Codex, gpt-6-astra, via the CLI: `codex exec` in the copy, read-only, 19 Nov 26)

Read of an exported copy of `claude/multi-sqn-b1-107` at `2b792ebc5` (job 1 = `b63195c56..2b792ebc5`), brief `…-job2-read-brief.md` (the readers' shared brief, saved beside this file). Blind to the walk of the running app and to every other reader's report. Saved here by the check lead after all four had reported (19 Nov 26); the report below is unchanged.

---

The fixes are **not complete**. I found six issues, including a new Undo regression and a missing change-history consumer for the new foreign-war records.

This is Astra’s independent, read-only source review. I changed no files and ran no tests or browser walk. The failures below follow from the code; the exact proof inputs are supplied for the host to run. I opened no other current JOB2 report and did not reopen the handoff after compaction.

All source paths below are relative to `raptor-port/src`.

**1. High — a later account change can still leave a squadron without an admin on a future date.**

The new guard checks future dates only for people whose **home rows change in that command**. Suspending or demoting an account changes no home row, so the guard checks today alone.

Concrete sequence:

1. Saber makes Osprey another admin of 149.
2. Saber schedules Kestrel’s home change to 142 tomorrow.
3. Saber suspends Osprey today.

Both account operations use Admin → Users’ ordinary writer. The home change can be exercised through the exact command below; I am not claiming the deferred transfer screen exists.

Expected: step 3 is refused because tomorrow it would leave 149 without an admin. The source instead permits it: Kestrel still counts for 149 today.

Cause: `state/perms.ts:1534–1540`, especially the `movedPids` restriction. The account door’s `lockProblem` at `state/accounts.ts:290` also checks current homes only. This leaves D2184 Q10’s “any later step” unfulfilled.

**Host proof:** use a fresh copy of the fixture from `state/units-sqn-fixread2.test.ts`.

```ts
vi.useFakeTimers({ toFake: ['Date'] })
vi.setSystemTime(new Date(2026, 10, 18, 9))

signInAs('ad', 'a')
expect(updateAccount('acus9', { role: 'admin' })).toBeNull()
expect(setHome('kes9', 'u142').ok).toBe(true)
expect(homeOn('kes9', '2026-11-19')).toBe('u142')

// Must refuse. The present code returns null.
expect(updateAccount('acus9', { on: false })).not.toBeNull()
```

Run a second fresh case with `{ role: 'main' }` instead of `{ on: false }`.

**Fix:** build the continuity checkpoints from today and all relevant future home transitions in both candidate worlds, including transitions of other admins. Apply that same calculation to account, person and home changes. Use it for the door’s refusal as well as the commit guard. Include the inverse ordering: an existing later departure followed by another admin’s earlier move.

**Status:** pre-existing harm left open by the new G3 implementation.

**2. High — the last-admin guard counts an archived person as able to sign in.**

A forged people-only archive of Kestrel passes the new combined guard while leaving his account enabled. However, session validation refuses an archived person. Thus 149 loses its only usable admin.

Expected: refuse the whole command. Observation disproving correctness: the command succeeds, `kes9.archived` becomes true, and Kestrel’s session is then switched off.

Cause:

- `state/perms.ts:1541–1542` excludes missing, special and deleted people, but includes archived people.
- `state/accounts.ts:143` and `:282` use the same incomplete eligibility rule.
- `state/accounts.ts:627` explicitly refuses a session whose person is archived.

This is within the brief’s people-only forged-command scope. The normal Archive door suspends the account too; that does not close the other door.

**Host proof:** fresh units fixture, additional existing helper `commitPeopleIntent`.

```ts
signInAs('ad', 'a')

const r = commitPeopleIntent('person.archive', null, () => {
  Object.assign(P('kes9'), {
    archived: true,
    archivedBy: 'admin',
    archivedOn: todayIso(),
  })
}) as any

// Present code admits this.
expect(r.ok).toBe(false)
expect(P('kes9').archived).toBeFalsy()
```

**Fix:** define usable-admin eligibility once, consistently with session eligibility, and use it on each side of the continuity calculation. Exclude archived people. Preserve the distinction between an account that may remain stored for an archived person and an admin who can actually use the app.

**Status:** pre-existing eligibility mismatch left open by G3’s new people guard.

**3. High — the mixed-squadron “take myself out” exception permits unrelated edits and refuses the corresponding Undo.**

These are two consequences of the same new exception.

**Forward:** it checks only that one named person disappeared and nobody was added. It does not check that the input’s other content stayed unchanged. A member who filed an input for himself and another person can remove himself **and rewrite the other squadron’s remaining commitment** after that person’s home changes.

**Undo:** a legitimate take-out passes, but its Undo adds the member back. The exception therefore does not apply, and the foreign-squadron check refuses before the verified-replay check is reached.

Cause: `state/perms.ts:1295–1306`. The existing `ownPart` predicate at `:727` already compares the whole relevant input and supports both directions. The new squadron guard does not use it. `ownershipViolation` calls the squadron guard at `:1798`, before the later input replay handling.

The visible doors are the shared input’s editor/take-out action and global Undo. The unsafe combined edit below uses the exact command writer, without depending on the editor offering foreign people.

**Host proofs:** fresh units fixture for each case. Import `takePerson` from `engine/inputown.ts`. Use this input constructor:

```ts
const input = (iid: string, ids: string[], by: string): any => ({
  iid,
  type: 'Training',
  date: 'Nov 20',
  yr: 2026,
  allday: true,
  remarks: 'original',
  by,
  at: Date.now(),
  people: ids.map(p => ({ p, by, at: Date.now() })),
})
```

First, an unrelated edit must be refused:

```ts
vi.useFakeTimers({ toFake: ['Date'] })
vi.setSystemTime(new Date(2026, 10, 18, 9))

signInAs('us', 'us')
expect(writeInputsBatch(() => {
  INPUTS.push(input('proof-cross-edit', ['bane', 'rocky'], 'bane'))
})).toBe(true)

signInAs('ad', 'a')
expect(setHome('rocky', 'u149').ok).toBe(true)

signInAs('us', 'us')
const r = INPUTS.find(x => x.iid === 'proof-cross-edit')!
expect(writeInputsBatch(() => {
  takePerson(r, 'bane')
  r.remarks = 'changed for the remaining 149 man'
})).toBe(false) // Present code permits it.
```

Second, a pure take-out must undo and redo:

```ts
vi.useFakeTimers({ toFake: ['Date'] })
vi.setSystemTime(new Date(2026, 10, 18, 9))

signInAs('ad', 'a')
expect(writeInputsBatch(() => {
  INPUTS.push(input('proof-cross-undo', ['bane', 'osp9'], 'stiff'))
})).toBe(true)

signInAs('us', 'us')
expect(writeInputsBatch(() => {
  takePerson(INPUTS.find(x => x.iid === 'proof-cross-undo')!, 'bane')
})).toBe(true)

expect(globalUndo().ok).toBe(true) // Present squadron guard refuses.
expect(globalRedo().ok).toBe(true)
```

**Fix:**

1. Require the forward exception to be a genuine `ownPart` removal, including unchanged remaining entries and unchanged shared content.
2. Permit the inverse only when the timeline’s existing verified-replay mechanism confirms the recorded change.
3. Keep an ordinary forward insertion into someone else’s input refused.
4. Test shared inputs with named people and with ALL/ALL AVAIL, including filer handover.

**Status:** the Undo refusal is introduced by job 1. The unauthorized forward edit is a hole left in its new squadron restriction.

**4. Medium — deleting a foreign-squadron person removes bids and OIL awards without their required history lines.**

The foreign-war store correctly emits `lwx.rec` and `lwx.ledger` changes. The history subscriber consumes neither.

Concrete production sequence: Kestrel gives Osprey a future bid and OIL award; sign out and sign in as Saber; delete Osprey through Admin → Users while 142’s war is loaded.

Expected under D337: Osprey’s deleted line **and** a separate line on each removed bid/award’s date, in 149’s history.

The source removes the foreign records, but only the person-level deletion is described. A later look at the affected dates cannot explain why the bid and award disappeared.

Cause:

- `state/changelines.ts:307` accepts only `lw.cell` for bids removed by a non-war command.
- `state/changelines.ts:716` sends only `lw.ledger` to the ledger history writer.
- `leavewar/state/foreign.ts` emits the new collections instead.
- No `lwx.*` consumer exists in `changelines.ts`.

**Host proof:** use the fixture from `leavewar/multi-sqn-a3-foreign.test.ts`, which fixes today at 15 July 2026. Add imports for `store` and `elogFlush`.

```ts
kestrel()
expect(setCell('osp9', '2026-08-10', 'LL')).toBe(true)
expect(grantOil(['osp9'], 1, '2026-08-03', 'future')).toBeNull()

saber()
elogFlush()
const before = new Set(store.keys('elog:'))

expect(deletePerson('osp9')).toBeNull()
elogFlush()

const added = store.keys('elog:')
  .filter(k => !before.has(k))
  .map(k => store.get(k, null)) as any[]

expect(added.some(x =>
  x.u === 'u149' && x.sub === 'osp9' &&
  x.date === '2026-08-10' &&
  x.fld === 'deleted' && x.itype === 'LL'
)).toBe(true)

expect(added.some(x =>
  x.u === 'u149' && x.sub === 'osp9' &&
  x.date === '2026-08-03' &&
  /OIL award taken away/.test(x.lbl)
)).toBe(true)
```

Both final assertions lack a producer today. Keep the existing assertions that the foreign records disappeared and 142’s war stayed unchanged.

**Fix:** extend the existing history consumer to interpret foreign bid and ledger changes, preserving their explicit unit. Reuse the existing wording and machine marks; preserve the rule that automatic OIL credits make no line. Do not add duplicate posting-window lines for Archive/Restore/Delete: `postoutLines` deliberately leaves those to the person’s line.

**Status:** introduced by the new foreign collections; this is a missing downstream call site.

**5. Medium — selecting another squadron’s view bypasses the new history-push restriction.**

The push guard treats the unit in view as automatically writable. A member viewing 149 can therefore push a forged line into 149’s history, despite having only View there.

This is a command-level finding, not a complaint that the deferred squadron menu is missing.

Cause:

- `engine/editlog.ts:450` calls the permission hook only when the target differs from `UNIT`.
- `state/perms.ts:1333–1335` independently exempts `u === UNIT`.
- The held line is subsequently saved by `state/store.ts:966–971` through the system projection door. The raw-write guard therefore does not repair the skipped actor check.

**Host proof:** fresh units fixture. Import `switchUnit` from `state/store.ts`.

```ts
signInAs('ad', 'a')
expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)

signInAs('us', 'us')
switchUnit('u149')
logAction(null, 'proof-forged-149-history', {
  date: '2026-11-20',
  sect: 'day',
  unit: 'u149',
})
elogFlush()

const rows = store.keys('elog:')
  .map(k => store.get(k, null)) as any[]

expect(rows.some(x =>
  x.u === 'u149' && x.lbl === 'proof-forged-149-history'
)).toBe(false) // Present code stores it.
```

**Fix:** authorize every requested destination at push time, including the current view. Remove both current-view exemptions. If retaining fallback behavior, choose an authorized destination rather than blindly using `UNIT`, and validate that destination too. Keep the authorization decision attached to the held line before the system flush.

**Status:** H5’s previous vulnerability remains reachable through a different path.

**6. Medium — changing any local input lets an admin attach a bell line to an unrelated foreign person.**

The new bell guard exempts a notice whenever its `iid` names an input changed by the command. It never checks whether the recipient belongs to that input or is its filer.

A 142 admin can therefore alter a wholly local input and add a notice addressed to Osprey. Osprey’s bell reader accepts the addressed notice. The matter does not concern 149, contrary to D2194.

Cause: `state/perms.ts:1769`. After this exemption, the admin branch returns without further notice checks. `state/notices.ts:442` reads notices by their recipient; it does not establish the missing relationship.

**Host proof:** fresh units fixture, with `NOTICES` imported from `state/notices.ts`. Reuse the input constructor above.

```ts
signInAs('ad2', 'a2')
const by = String(deriveActor().personId)

expect(writeInputsBatch(() => {
  INPUTS.push(input('proof-local-input', ['bane'], by))
})).toBe(true)

const r = INPUTS.find(x => x.iid === 'proof-local-input')!
expect(writeInputsBatch(() => {
  r.remarks = 'local change'
  NOTICES.push({
    id: 'proof-unrelated-foreign-notice',
    to: 'osp9',
    by,
    at: Date.now(),
    iid: r.iid,
    name: 'Training',
    day: '2026-11-20',
    what: [{ k: 'rmk' }],
  })
})).toBe(false) // Present guard permits the whole command.
```

**Fix:** qualify the exception by the actual before/after input relationship: the recipient must be someone the change legitimately concerns, including the appropriate filer case. Share that recipient calculation with the notice producer. Check removals against the corresponding recorded relationship too. Preserve legitimate cross-squadron telling; the deferred holiday-list work is not this finding.

**Status:** the previously unrestricted admin-notice path is only partly closed by job 1.

**Coverage and explicit negatives**

I started with the unloaded foreign war, its stored records and downstream readers, then traced the shared gates and ordinary doors. “No further finding” below means source inspection, not a runtime pass.

| Objects and production surfaces | Writers, readers and meaningful orders examined | Result |
|---|---|---|
| Foreign person’s Archive, Restore, Restore as and Delete; Admin → Users, then that squadron’s Leave War | Foreign profiles, bid rows and ledger rows; unopened world; stored readback; rollback; restored stint; delete cutoff; SANS identity; history consumer | Finding 4. No additional defect found in the unit-qualified storage mapping, retained past records or rollback snapshots. |
| Person, account and home; Users and Quals | Account add/update, new person, request approval linked/new, archive/restore/delete, people-only writes, account loader, master mark, future homes | Findings 1–2. No additional re-key/name-collision or master-account escape found in the paths inspected. |
| New person’s post-in | Roster-only add, person-and-account add, new-person request approval → home assignment → war projection | I checked all three call sites. Each now assigns home before post-in; no further finding. |
| Inputs; calendar/table editor, shared input editor and schedule’s input-backed rows | Create/edit/delete, people added/removed, shared filer rights, named people, ALL/ALL AVAIL, derived schedule rows, Undo/Redo | Finding 3. Ordinary same-squadron input changes remain eligible through the new guard. |
| Loaded Leave War and posting sheets | War-unit probe, sign-in world swap, member bid versus admin decision, master Overseas/Delete posting, system posting pass and held posting retry | No further finding in the new probe or master-posting checks. Runtime swap/reload and held-retry evidence remains for the host. |
| Grants and home moves; rights controls | Set/remove grants, home change, combined rollback, Undo restoring removed grants | The ordinary `setHome` path removes grants in the same command, so its inverse includes them. No further finding in that path. |
| Change history and its read marks; history windows and Admin → Data sweep | Push destination, held flush, raw writes inside commands, sweep, person-change Undo after midnight | Finding 5 and the missing consumer in finding 4. The tested pure-person midnight path now captures the original unit; no additional defect found in that path. |
| Bell notices and read marks | Input telling, war telling, posting telling, recipient reads, admin foreign writes/deletes, seen rows, Undo removal | Finding 6. Straight foreign read-mark writes and notices without an exemption are now checked. |
| Tracker; course/chart/marks/date/layout controls and its Undo | Bound storage unit, boot-installed probe, `trk.*` record check, member/admin distinction, admin-only flex | No additional defect found in the new unit gate. Its live reload and full gesture coverage were not executed here. |
| Roles and overlays | Master, plain 142 admin, sole 149 admin, members of both, View rights, admin’s member view, raised developer role, system passes | Effective-role checks remain present. I found no additional raised-role escape in the inspected account/person refusals. |

For the foreign store, separate store keys and unit-qualified record IDs support two foreign squadrons in one command without aliasing. I did **not** execute that combined command or a forced rollback across both stores. Those remain host checks, not a claimed pass.

I also checked the D350 exclusion: Archive, Restore, Restore as, Delete and posting operations are deliberately outside global Undo. The foreign store’s lack of a global-Undo writer is **not** a finding. Earlier eligible steps must still undo while those actions remain in place.

**The test-fixture changes**

`settleWorld()` only refreshes scheduler and people baselines. It introduces no permission bypass, role flag or production branch. The changed call sites inspected establish a fixture after direct resets, before the action being tested; the exceptional mid-test calls follow explicit fixture replacement.

I found no case in those changes where it consumes the tested action before its assertion or makes the test inherently vacuous. The tightened posting-text assertions and corrected master-account fixture strengthen their stated checks. This is a source conclusion; I have not independently reproduced the reported suite results.

The new tests miss the sequences identified above: a later account change after scheduling a move, archived eligibility, mixed-squadron withdrawal reversal, foreign-record history consumption, history push while viewing the foreign unit, and an unrelated recipient borrowing a changed input’s ID.

For the host, place the proof bodies in scratch tests using copies of the named fixtures, adjust imports, and run each scratch file separately. Do not insert `settleWorld()` between a proof’s action and assertion. Each proof should first demonstrate the specified failure on this export, then pass with its repair and the stated positive controls.

Rulings: none this session. No files changed, committed or pushed.