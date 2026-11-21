# The full review (D2235), area B — the fresh Opus reader's report (blind; copy at `424a4310c`)

Reader: a fresh Opus reader, a background helper of chat 123, blind to the other five readers and to the builder's
report; brief `2026-11-20-multi-sqn-b1-full-review-brief.md` with area B (accounts, people, squadron records, saved data
and Undo); its own exported copy of `424a4310c` with `AREA.patch`; finished whole. Not yet reproduced by the host. The
report as returned:

---

# Area B review (accounts, people, squadron records, saved data, Undo): blind Opus reader

**Setup.** I ran proof tests one at a time from `raptor-port` in `src/zz-proof-b.test.ts`, using the seeded world (Saber `ad` = master in 142, Hunter `ad2` = 142 admin, Kestrel `ad9` = 149's only admin, Osprey `us9` = 149 member). All six tests failed (red). I deleted the scratch file and the temporary folder afterwards and changed nothing under `src`.

## Findings, worst first

### B3. A squadron can be left with no admin, and a new one can start with none. D2184 Q10 and D2191 are broken.
**Failing inputs:**
- Saber runs `addUnit('150','p1')` with no first admin. Result: `{ok:true}`, so squadron 150 exists with no admin.
- Saber runs `addUnit('151','p1','acad2')`, so Hunter is 151's admin. Then Saber runs `removeGrant('acad2', u151)`. Result: `{ok:true}`, and no admins of 151 are left.
- Same setup with 152. Hunter, signed in, removes his own right. Result: `{ok:true}`.

**Cause:**
- In `state/units.ts`, `addUnit`'s `firstAdmin` is optional. `COMMAND_OPS 'unit.add'` does not require an admin grant either.
- A new squadron's first admin is only a *grant* admin. Every lock counts only admins whose home is that squadron. This holds in `accounts.ts lockProblem`, `postingLock`, `homeMoveLockWords` and the gate's `perms.ts lastAdminViolation` (by design: "a grant admin is not ITS admin").
- So a new squadron is never protected. Removing his right, or suspending, demoting, archiving or deleting the first admin, all go through.
- `removeGrant` asks no lock at all.

**Fix:**
1. In `addUnit`, refuse when `firstAdmin` is missing ("Name the squadron's first admin"). In `unitRowViolation`, refuse `unit.add` unless its own changes give the new unit an admin, either an admin grant or an admin home row.
2. Follow the plan's own step-3 reading: make the first admin a person whose *home* is the new unit, created in the same command as `addUnit`. The existing locks then protect him.
3. Until then, add a "last admin-level holder" check, counted as `levelFrom(...)==='admin'` with masters left out, for any unit that has no home admin. Run it in `removeGrant`, in `setGrant` when lowering an admin to view, and in `lastAdminViolation`, comparing before and after.

### B2. "Request access" names no squadron, so every request reaches every squadron's admins and the approver's squadron takes him. D2094 and D2111 (plan §3.1), D2194.
**Failing input:**
- A new sign-in, `newbie@x`, files `requestAccess(...)`.
- `unseenRequests()` shows the request to Kestrel (149: 1) and to Hunter (142: 1). The test expected only one squadron's admins: got 2.
- The stored request's fields are `id, name, cs, ini, seat, cat, at, seenBy`, with no squadron.
- Kestrel then runs `approveRequestNew(...)`, and the new man's home becomes `u149`. Had he applied to 142, he would now be 149's.

**Cause:** `requestAccess` and `AccessRequest` carry no unit. `unseenRequests` and the bell list `ACCESS_REQS` whole. `approveRequestNew` calls `putNewHome(pid, me())`, which uses the approver's home. The only note of this is a code comment in `perms.ts` ("filed"); nothing in `OUTSTANDING.md` holds it.

**Fix:**
1. Add `unit` to `AccessRequest` and `reqRow`, set from the squadron he picks on the access screen (`ui/AccessScreen.tsx`). Refuse a request with no valid unit.
2. Filter `unseenRequests`, `waitingCount` and the Admin → Users waiting list by `levelIn(admin, rq.unit)==='admin'`.
3. Have `approveRequestNew` take the home from `rq.unit`: give `putNewHome` an explicit unit parameter. Gate it: only an admin of `rq.unit` may approve or decline. Close the `accessreq:` gap that the `perms.ts` comment mentions.

### B1. 149's guest switch does nothing. Before the batch, the one switch worked for everyone.
**Failing input:**
- `newbie@x` requests access.
- Kestrel signs in and runs `setGuestView(true)`, which returns `null` ("done"). The stored key is `sqn142_u149@guestview`.
- After sign-out, `signIn('newbie@x','p').kind` is `'waiting'`; the test expected `'guest'`.

**Cause:**
- `guestview` is listed as a unit setting (`storage/keyowner.ts UNIT_SETTINGS`), so `storedKey` qualifies it with the unit in view.
- A waiting person has no home, so his unit in view is always the boot unit (142): `store.ts sessionUnit`, `perms.ts myUnit`.
- So only 142's switch ever applies. 142's switch also shows 142's published week to an applicant of any squadron.
- 149's admin is shown a switch that is on, while it does nothing.

**Fix:**
- Until B2 exists: move `'guestview'` from `UNIT_SETTINGS` to `COMMUNITY_SETTINGS` and keep it as one switch, since nothing on screen asks a guest's squadron.
- Once B2 exists: start a guest's unit in view at his request's squadron (in `sessionUnit` for role guest), and read that unit's switch.

### B4. The last-admin check at the door looks at today only, while the gate looks at every date. A correct refusal reaches the screen as "That did not save".
**Failing input:**
- Saber makes Osprey a 149 admin: `updateAccount('acus9',{role:'admin'})`.
- Saber moves Osprey to 142 from tomorrow: `setHome('osp9','u142')`, which returns ok.
- Saber runs `updateAccount('acad9',{on:false})` on Kestrel. It returns "That did not save"; the test expected "Kestrel is 149's last admin. Make another admin of 149 first."

**Cause:**
- `lockProblem` (used by `updateAccount`, `suspendForArchive` and `deleteAccountProblem`) asks `homeOn(x.pid)` for today only.
- `postingLock` and the gate's `lastAdminViolation` check today and every saved move date.
- The door lets it through, the gate refuses, and `saidOf` maps the refusal to the generic words. The same happens for demote and Archive. The known "refused delete's words" item covers Delete only.

**Fix:** make `lockProblem` use `postingLock`'s dates: today plus every `home.from > today`. Better still, call one shared function (see Shape 1), and word its result as `lastAdminIfGone` does.

## Explicit negatives (checked, found nothing)
- The `weekId`/`weekKey` codec splits off the unit before the hyphen rule. `hydrate` skips week rows with no unit (D22).
- `tableOf`, `resetEntry` and `leaveWarStarted` all read the local name.
- `stashPreflight` and `roster-restore stillNamed` read every unit's stored weeks. The old double-stringify fix is correct.
- `setHome` writes a today-row for a demo 142 man who has no row, so his past is not rewritten. A second move on the same date replaces the earlier row, and a move drops his rights inside its own command.
- `putNewHome` runs inside the adding command and before the Leave War post-in, and it rolls back with it.
- Settings records include every unit's stored fixed keys. Rollback reruns `unitsLoad`. A raw write of unit rows outside a command is refused.
- `changes.ts` keeps one seen-cursor per squadron and writes old-shape rows forward.
- `logReversed` files a people-step Undo line in the squadron recorded at the time of the change.
- `switchUnit` puts the calendar, history, roles and settings back in the right order.

Not reported (later batches, or outside my files):
- Inputs are judged by their first day (`inputsFor(UNIT)` with no date, in `holderbase.rederive`, `store.applyWeekModel`, `initStore` and `overlay`). A move in the middle of an input would put its later days on the wrong squadron. This is batch 4's Transfer (D2221), but batch 4 must pass the date of each day.
- A shared store whose first squadron is not 142 still boots `BOOT_UNIT='u142'` as the pre-sign-in unit and Leave War. It writes nothing, but waiting people sit on a squadron that does not exist. Low priority.

## Shape (D2235): recommendations only
1. **One "who is a unit's admin, and is the lock breached" answer.** Today it is written in at least six bodies that disagree:
   - `lockProblem` (today, home admins only)
   - `postingLock` (every date)
   - `homeMoveLockWords` (one date)
   - `lastAdminViolation` (before/after, every date)
   - the Leave War's `poHeldReason`
   - `otherSquadronProblem` / `otherSquadronPersonProblem` / `relinkRightsProblem`, which mirror `homeUnitViolation` / `accountShapeAndMasterViolation`

   B3 and B4 are this drift. The simpler shape is one pure function in `units-model`, `lockBreach(rowsBefore, rowsAfter, acctsB, acctsA, people, dates) → {unit, date, pid} | null`. The gate refuses on it, and every door calls the same function and words its result. That removes the door/gate disagreement ("That did not save") and the gaps where one copy leaves a case out.
2. **The unit sits in the record id in some places and only at the storage edge in others**, against §3.4's own principle:
   - `insights.role` ids carry no unit, and the persist mapper qualifies them with the unit in view only when writing (its comment admits step 5 breaks it).
   - The change history stores the unit in a field (`u`), not the id.
   - `guestview` is a unit setting with a consumer who has no unit (B1).
   - Another squadron's war needed a parallel `lwx.*` family beside `lw.*`.

   Once the "▾" switch (P3) lands, each of these becomes an Undo or saved-data fault across squadrons. The simpler shape: every record a unit owns carries `<unit>@` in its change-stream id, with one `lw.*` family, and a test that fails on any unit-owned collection or prefix whose record ids lack a unit.
3. **The dated-rights patch stack.** Grant `from`, `masterFrom`, `pidFrom`, the timeline's `madeAt`/`undoneOn`/`redoneOn`/`stoodBefore`, and the `redate`/`stoodNow`/`restoreOffAt`/`restoreDir` hooks were added over fix reads 7–12, all to keep a bell line a move retired from coming back. The cause is that the bell works out its audience again from *current* rights, which Undo can rewrite. Simpler: settle a line's recipients when it is written (stored on the notice), or keep rights as an append-only log that a restore adds to and never re-dates. That removes this whole class of faults and most of the hooks.
4. **Rights have no dates, homes do.** A move drops rights when it is saved, not on its date, which forces the "He moves squadron tomorrow" special cases in `setGrant` and in the gate. Simpler: give grants `from`/`to` the way homes have them, so a move ends them on its own date, and use one `atOn` resolver for both.
