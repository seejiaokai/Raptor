# Astra's blind code read — multi-squadron batch 1, steps 0–4 (18 Nov 26)

Head (from the run command and its log): Astra (`codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`), in an exported copy of `7e0a7c661` (app code `a646aa024`), brief `2026-11-18-multi-sqn-b1-coderead-brief.md`; blind to the walk, to the Opus and security reads (finished before it started, kept in a scratch folder it could not reach). Started Wed Nov 18 04:12:00 MPST 2026, finished 04:28. Read-only: no proof tests; it named its proof inputs for the host. Saved as it came.

---

I found **six defects**, including a cross-squadron Tracker write and automatic loss of unsaved-to-disk work.

This is a read-only review of the supplied export, app code `a646aa024`. I changed no files and ran no tests. The results below are predictions from the code; each includes an exact proof case for the host. I did not read `SCENARIO-BRIEF.md` or another reader’s report.

Paths below are relative to `raptor-port/`. Findings involving `switchUnit` or `moveUnit` concern the built internal operations; I am not reporting the missing step-5 controls.

**1. High — A failed save lets the next squadron use and change the previous squadron’s Tracker**

**Setup and action:** Sign in as `ad / a`, open the Tracker and change its flex settings. Make backend writes fail. Sign out, then sign in as `ad9 / a9` on the same tab and reopen the Tracker.

**Expected:** The second login sees and writes only 149’s Tracker.

**Code-predicted failure:** Sign-out exposes the login screen but skips the reload because a save is waiting. The Tracker remains loaded and bound to 142. The next person sees that Tracker, and changes continue through 142’s storage door.

**Cause:** `src/ui/logout.ts:28–30` ends the session before determining whether reload is possible. `src/ui/Login.tsx:32` accepts the next login without resolving that incomplete handover. `src/tracker/storage.js:59–73` deliberately retains its original binding; `src/tracker/app/core.js:7334–7338` does not initialise again. The command records at `src/tracker/app/core.js:521–526` retain bare IDs, so the unit check in `src/state/perms.ts:1209–1229` does not independently stop this write.

**Exact proof input:** Extend the setup of `src/tracker/trk-per-unit.test.ts`, but **do not call `vi.resetModules()` between users**:

- Boot the real application wiring and sign in as `ad`.
- Initialise the Tracker; set flex to `{on:true, from:[8,14,21,31,60,120]}`.
- Wire `watchSaves` to a saver whose `flush()` completes but whose status remains `'failed'`; spy on `setReloadSeam`.
- Call `logOut()`, then sign in as `ad9` through `resetSession(sessionFor(signIn('ad9','a9')))`.
- Open the Tracker and change flex again.
- Assert that either the second login was held pending a safe handover, or `storageUnit() === 'u149'` and every `u142@…` Tracker row remains unchanged.

Today, the binding remains `u142`.

**Fix:** Make session handover explicit. Hold new sign-ins until queued saves finish and the required reload occurs. Retry must finish that pending handover. Also qualify Tracker command identities—or validate their bound world against the actor’s home—so a missed lifecycle reset cannot permit a foreign write.

**Origin:** New on this branch: two separately owned Tracker worlds now rely on a reload that this path omits.

**2. High — Signing out automatically discards work when browser storage is unavailable**

**Setup and action:** Open the built app with `?nostore`, sign in, add a calendar note, then sign out.

**Expected:** The application must not itself discard the in-memory work that its “Not kept” band warns about.

**Code-predicted failure:** The memory backend reports successful saves. Consequently, `saveWaiting()` returns false and sign-out reloads the page, destroying that backend and its new records.

**Cause:** `src/ui/logout.ts:30` checks only save-queue status. `src/storage/savewait.ts:19–22` does not distinguish durable storage from the memory fallback. That distinction already exists as `storageRefused()` in `src/storage/boot.ts:79–80`; `chooseBackend` deliberately selects memory for `?nostore`.

**Exact proof input:** Call:

```ts
chooseBackend({ DEV: false, MODE: 'production' }, '?nostore')
```

Boot that backend, write the calendar title `KEEP THIS NOTE` on `2026-07-15`, flush successfully, and wire the real postman to `watchSaves`. Install a reload spy and call `logOut()`.

Assert that `storageRefused()` is true and the reload spy is **not** called. Today it is called. A browser test should additionally confirm that signing back in after the actual reload loses the note.

**Fix:** Include storage durability in the handover decision. In memory-fallback mode, preserve the existing whiteboard and reset/rebind the session-owned worlds in place before admitting another user. Do not merely suppress reload while leaving finding 1’s stale Tracker available.

**Origin:** New on this branch: automatic reload was added to sign-out.

**3. High, internal switch — Home-page permissions, settings and calendar records still follow the schedule in view**

D2132’s people/input filtering is present, but several accompanying readers and writers still use the viewed squadron.

**Concrete failures:**

| Surface | Exact setup and action | Expected versus code-predicted result |
|---|---|---|
| Inputs permission | Set 142’s members-file-for-others switch **off**, leave 149’s **on**. Give `acus` View of 149. Sign in as `us / us`, then call `switchUnit('u149')`. Ask `mayFileInputFor('prowler','Meeting')`. | Expected `false`; reads 149’s switch and returns `true`, allowing a 142 member to bypass 142’s restriction. |
| OIL question | Set 142’s full-day threshold to **361 minutes**, 149’s to **480**. As a 142 user, switch the viewed schedule to 149. Call `oilAskPlan({person:'bane',date:'Jul 18',yr:2026,allday:false,s:540,e:960})`. | Expected `[{iso:'2026-07-18',amt:1}]`; the viewed squadron’s threshold produces `amt:0.5`. |
| Quals | Give 142 a column `{k:'only142',h:'Only 142',lav:true}` and 149 a distinct `only149` column. As master Saber, switch to 149 and open Quals. Rename a column. | The people remain 142’s, but the headings and saved column change belong to 149. |
| Inputs calendar | Give the same date distinct titles in the two squadrons. As Saber, switch to 149 and open Inputs → Calendar; edit its title. | Home inputs are combined with 149’s title/planning rows, and the edit is saved to 149. |

**Cause:** `src/state/store.ts:831–853` swaps settings and planning singletons together. `src/engine/hooks.ts:218–222` resolves unqualified settings against `UNIT`.

Missing home-unit call sites include:

- `src/state/perms.ts:380`: `membersFileOn`.
- `src/leavewar/sync.ts:1307–1318`, through `src/engine/oil.ts:107–113`: OIL question pricing.
- `src/ui/QualsPage.tsx:303–304`: column reading and writing.
- `src/ui/InputsCal.tsx:123,379,719,1387–1388`: planning rows and titles.

**Exact proof:** Run the four inputs above using one unchanged session for each switch. Check both returned values and persisted keys. In the Quals/calendar cases, assert that the `u149@…` rows remain byte-for-byte unchanged after editing the home page.

**Fix:** Add explicit unit arguments to these readers and writers. Home-page operations must use `myUnit()` or the input owner’s unit on its date; Logic and schedule operations must continue using `UNIT`. Preserve the owning unit through the command and persistence layers. Apply the same separation to the SANS/flying-plan readers sharing these settings.

**Origin:** New on this branch: previously there was only one squadron. These are missing call-site changes, not requests for the future schedule menu.

**4. Medium, internal switch — Mission-role Undo can delete another squadron’s answer**

**Setup and action:** Using the same master session, create the same conditional formation identity in both squadrons. Answer Blue in 149, then Red in 142. Switch back to 149 and press Undo.

**Expected:** Undo selects 149’s own change. It must not apply 142’s inverse to 149.

**Code-predicted failure:** Mission-role command IDs contain no unit. The newest 142 answer therefore remains eligible in 149. Its inverse deletes 149’s Blue answer; 142’s Red answer remains stored. Redo can then write that Red answer into 149.

**Cause:** `src/state/mission-roles.ts:44–51,108–118` uses bare annotation identities. `src/undo/timeline.ts:498–504` treats entries without a qualified ID as unscoped. `src/state/persist.ts:430` adds the **current** `UNIT` only when persisting the change.

**Exact proof input:** Reuse the conditional formation fixture in `src/state/mission-role-persist.test.ts`: week `13/07/2026`, day 0, formation RID `role-persist`, callsign `VIPER`, mission `ACM`, and the fixture’s `DS FROM VIPER` remarks.

Create it in both units before clearing the test timeline. Then:

1. Answer Blue in 149.
2. Switch to 142 and answer Red.
3. Switch to 149 and call `globalUndo()`.
4. Assert that `u142@missionrole:<id>` still contains Red and 149’s own Undo behaviour is independent of that step.
5. Call Redo and assert that no 142 answer is copied into 149.

Inspect the emitted command IDs as well: they must differ between units.

**Fix:** Qualify mission-role identities before they enter the command stream, revisions and Undo. Decode the local annotation ID only inside the role reader/writer. Persist using the unit carried by the record, never the current view.

**Origin:** New on this branch. The new persistence prefix does not provide the promised end-to-end identity.

**5. Medium — The “one master left” check can leave no usable master**

**Setup and action:** On fresh demo data, sign in as `ad2 / a2`. In Admin → Users, suspend Saber, the sole master.

**Expected:** A change that removes the last usable master is refused.

**Code-predicted failure:** The suspension succeeds because other ordinary admins remain. Saber retains `master:true` but cannot sign in. No enabled master remains.

A related case is `setMaster('acus', true)`: it marks a member as master without changing or rejecting the member account role, while master commands still require an admin session.

**Cause:** `src/state/accounts.ts:404` protects any usable admin, rather than a usable master. `setMaster` at lines 418–427 counts flags only. `src/state/perms.ts:1241–1249` runs the master protection only when the Boolean flag changes; disabling or demoting the account leaves that flag unchanged.

**Exact proof input:** Fresh boot, then:

```ts
resetSession(sessionFor(signIn('ad2', 'a2')))
updateAccount('acad', { on: false })
```

Assert that the operation is refused and `acad.on` remains true. Repeat independently with `{role:'main'}`. Today both can leave zero usable masters.

Also test promotion of `acus`: success must produce a usable admin account, or the operation must refuse the invalid target.

**Fix:** Define one usable-master predicate covering the mark, enabled account, admin role and usable person. Enforce it over the proposed resulting state for account changes, master changes, archive/posting/deletion and their restores. Validate or atomically promote the account role when granting master status.

**Origin:** New on this branch: master status is new; the older global-admin guard is insufficient for it.

**6. Medium, internal move — A cached shared holiday survives moving away from its place**

**Setup and action:** At a shared place, add a future public holiday in 149. Open 142’s Leave War so the shared holiday is cached. Move 142 to another place effective before that holiday, without signing out or swapping Leave War worlds.

**Expected:** The holiday disappears from 142’s future calendar and ceases to make that day OIL-earning there.

**Code-predicted failure:** The place lookup changes, but the merged Leave War remains cached. Its holiday display and `nonWorkingFor('u142', date)` can retain the old holiday until another invalidation occurs.

**Cause:** `src/leavewar/state/store.ts:1353` returns the cached merged state before asking for current place holidays. Its cache depends on `PLACE_VER`; that version is advanced through `placeHolidaysMoved`, but `src/state/units.ts:149–160` does not trigger it after a move. The overlay cache at `src/leavewar/state/store.ts:1316` has the same dependency.

**Exact proof input:** Extend `src/leavewar/holidays-by-place.test.ts` using its clock of **1 July 2026**:

1. As 149, add a public holiday on **15 July 2026**.
2. As 142, call `dayFacts('2026-07-15')` and confirm it is a PH.
3. Create `{name:'Det base',tz:'Australia/Darwin'}` and call `moveUnit('u142', newPlaceId)`; it takes effect 2 July.
4. Notify, without swapping worlds.
5. Assert `placeHolidaysFor('u142').has('2026-07-15') === false`, `dayFacts(...).kind !== 'ph'`, and `nonWorkingFor('u142', ...) === false`.

The latter reads can retain the cached PH.

**Fix:** Invalidate the merged calendar and holiday overlays when the unit/place rows they depend on change, including Undo and Redo. Prefer tracking that dependency centrally rather than adding a refresh only to the future move form. Re-run calendar-dependent schedule validation after invalidation.

**Origin:** New on this branch: the shared-place overlay and its caches are new.

**Ownership and surface roll-call**

This is the production coverage map used for the read, not a claim of browser execution.

| Objects and consumers | Production door and required visible behaviour | Review result |
|---|---|---|
| Tracker courses, charts, marks, dates, flex, imports and destructive edits | Tracker selectors, marking window, Info, Settings and File; only the home world appears and changes | Storage separation traced; failed-handover defect in finding 1 |
| Leave War periods, bids, approvals, balances, awards and posting records | Grid, day/person windows, Approvals, Balances and OIL; home people and balances | World swap and own-unit OIL sweep traced; holiday cache defect in finding 6 |
| Inputs, named/group/placeholder records, medical and SANS | Inputs List/Calendar, Medical, SANS and person picker; home records and applicable permissions | Main filtering traced; companion settings/planning defects in finding 3 |
| Schedule days, issued versions, amendments, drafts and templates | Edit/View Schedule, Board, version picker and templates; viewed squadron’s records | Qualified storage and date parsing traced; no additional finding |
| Mission-role answers and Undo | Remarks question, Insights and top-bar Undo/Redo | Finding 4 |
| Holidays and Off days | Holidays form, Leave War events, pre-save warning and OIL answer list | Shared PH/local Off distinction traced; finding 6 |
| Accounts, grants, master status and role changes | Existing Users controls; future unit/grant controls excluded | Qualified-record gate traced; usable-master defect in finding 5 |
| Sign-out and saving | Desktop bar, phone drawer, guest/access screens, login save band | Shared logout route traced; findings 1 and 2 |

The action orders examined included fresh boot, first Tracker load, sign-out followed by another squadron’s sign-in, failed and volatile saves, switch followed by Undo/Redo, holiday declaration after publication, holiday read followed by a place move, and account suspension/demotion.

**Explicit negatives and limits**

- I checked the main qualified week/day/version paths and found no additional date-parsing or same-week collision defect.
- I checked `desiredOilCells` and the reverse sweep: they select the loaded war’s unit, consume issued evidence, protect unreadable evidence and restrict reversal by home unit. I found no additional cross-unit credit reversal there.
- I checked shared holiday projection: it does not copy the projected holiday into the receiving war’s raw records, and ordinary Off days are not shared.
- I checked the qualified-record permission gate: a plain 142 admin does not gain permission to write 149’s qualified Logic or schedule records merely by changing the view.
- Normal sign-out does flush and reload when saving succeeds. The Tracker separation test resets modules between users, so it does not cover finding 1’s retained-page path.
- I found no concrete consequence beyond the already-known change-history mixing from unqualified `elog:` records.
- I excluded old-data migration, borrowing, the named steps 5–6 UI work and the existing raw-NUL check failure.

The fixes should remain focused on ownership, identity and lifecycle boundaries; this review does not justify a broader rewrite.

**Walk:** Not done; read-only code review.  
**Tests:** Not run; host proof inputs supplied above.  
**Rulings:** None.