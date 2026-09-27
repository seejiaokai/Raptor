The plan is not ready to build. I found eight gaps—four of them high-risk state-corruption or authorization issues. No files were changed, and I did not run the app because this was the requested pre-implementation review.

## Ranked findings

### 1. Critical — historical stints have no correct door or writer

**Ruling/promise:** D320 requires every stint to remain editable, gap days to represent absence, and Leave War’s Post in/Post out buttons to edit the stint containing that day.

The plan incorrectly says the existing Matrix routing needs “no code change” ([plan:101](</C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-09-27-one-door-plan.md:101>)). Today, Matrix checks whether the selected date precedes the latest `from` before checking stint membership ([Matrix.tsx:1820](</C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/Matrix.tsx:1820>)). After a restore, every older stint date therefore opens the latest stint’s Post in sheet. The underlying writers also accept only a person ID and mutate only the current window ([store.ts:1491](</C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/store.ts:1491>), [store.ts:1620](</C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/store.ts:1620>)).

- **Setup:** Person has stints 1 Jan–31 Mar and 1 Jun–current.
- **Action:** Open a February day, an April gap day, and each stint’s final day; try Post in/out and Undo.
- **Expected:** February is an ordinary in-squadron day. April opens Post in for the June stint. Every writer targets the selected stint, not merely the latest one.
- **Disproof:** A test demonstrates that the router resolves a containing stint before checking gaps, passes a stable stint identity to the sheet, and persists changes to that exact stint across reload. The proposed plan cannot currently do this.

**Required plan correction:**

1. Replace the “no code change” row with an explicit date-to-stint router.
2. Add helpers for:
   - the stint containing a date;
   - the following stint for a gap;
   - before the first stint;
   - after the latest closed stint.
3. Pass a stint index or stable stint key through Matrix, BidPicker, `postingProblem`, `setPostIn`, `setPostOut`, and Undo.
4. Add past-stint endpoint writers with ordering, overlap, and non-empty validation.
5. Define historical Undo PO explicitly. If a later stint exists, refuse it with a message such as: “He came back on 1 June — move that Post in date instead.”
6. Test at least three stints, every gap, both endpoint corners, and reload after every edit.

### 2. Critical — Leave War Undo can corrupt a manual Archive

**Ruling/promise:** D322 says Restore undoes Archive. D321 says Undo post out undoes a posting-out action. These are different doors.

Manual Archive will produce an overseas-looking war boundary but tag the person/account with `archivedBy: 'admin'` and `offBy: 'archive'`. Existing Undo PO clears the war post-out, while only reversing archive/suspension when the tags equal `po` ([sync.ts:1662](</C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts:1662>), [sync.ts:1686](</C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts:1686>)). That can leave the person archived and suspended while reopening or deleting the stint boundary that justified their absence.

- **Setup:** Archive an active person from Admin → Users.
- **Action:** Open their posting boundary in Leave War and press Undo.
- **Expected:** Refusal directing the admin to Restore in Admin → Users; no data changes.
- **Disproof:** The Undo button is unavailable or explicitly refused for `archivedBy: 'admin'`, and people, accounts, and war state remain byte-equivalent after reload.

**Required plan correction:**

1. Add an `undoPostOutProblem` rule refusing manually archived people.
2. State that Restore is the only undo for Admin → Users Archive.
3. State that a future posting replaced by Archive is superseded, not recoverable through the ordinary PO Undo.
4. Test:
   - Archive → Undo PO attempt → unchanged → reload;
   - ordinary posting → Undo PO → same stint continues;
   - Restore → later historical Undo attempt → refused if another stint follows.

### 3. Critical — the plan deliberately creates invalid negative stints

**Ruling/promise:** D320 preserves real stints and gaps; it does not authorize phantom service periods.

For a not-yet-started current stint, the plan closes it with `to = from - 1` ([plan:114](</C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-09-27-one-door-plan.md:114>)). It also says `openStint` pushes the closed current stint into `past`. That creates `from > to`. Archive → Restore → Archive on the same day can therefore accumulate empty or negative historical stints and distort “first stint,” row visibility, and routing.

- **Setup:** Set a future Post in, Archive before it begins, Restore, then Archive again on the restoration date.
- **Action:** Inspect `past`, current window, Matrix rows, and earliest-service calculations after reload.
- **Expected:** No empty or negative stint is stored; no phantom day appears.
- **Disproof:** `openStint` demonstrably discards empty windows, persistence rejects `from > to`, and all readers ignore such windows.

**Required plan correction:**

1. Define `from > to` as an invalid/empty temporary marker that is never appended to `past`.
2. Make `openStint` replace an empty current window instead of preserving it.
3. Make `beforeFirstStint` ignore empty windows.
4. Validate both load and write paths against reversed or overlapping windows.
5. Add future-PI → Archive → Restore and same-day Restore → Archive → Restore tests.

### 4. Critical — suspension does not revoke an already active session

**Ruling/promise:** D310/D322 require archived and suspended people to lose the signed-in member door, without a half-active state.

`SESSION` is a sign-in snapshot. Suspending the account or archiving its person changes stored account/person state, but does not reconcile the already active session ([accounts.ts:194](</C:/Users/User/projects/Raptor/raptor-port/src/state/accounts.ts:194>), [accounts.ts:215](</C:/Users/User/projects/Raptor/raptor-port/src/state/accounts.ts:215>)). The old session can therefore retain member permissions until logout or reload.

- **Setup:** Sign in as a member; in another administrative path, Archive them or let their due posting archive them.
- **Action:** Without signing out, attempt Inputs, own Quals, or another member write.
- **Expected:** Immediate suspended/access screen and all writes refused.
- **Disproof:** A central reconciliation mechanism invalidates or downgrades the live session after local commands and incoming persisted-state refreshes.

**Required plan correction:**

1. Add a single live-session reconciliation seam after account/person commits and external refresh.
2. If the signed-in account becomes off or its person becomes archived/deleted, immediately move it to the suspended AccessScreen or sign it out.
3. Specify that Restore/re-enable requires a fresh sign-in; do not silently resurrect the old session.
4. Test scheduled PO while signed in, administrative Archive from another session, attempted writes afterward, reload, and admin view-as-member.

### 5. High — restored people without accounts lose the welcome promise

**Ruling/promise:** D305 says the restored person sees the welcome-back prompt on their first sign-in.

The plan sets `Person.back = true` only when the person already has an account ([plan:73](</C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-09-27-one-door-plan.md:73>)). A roster-only archived person may be restored and receive sign-in access later. They would never receive the promised first-sign-in message.

- **Setup:** Restore an archived person who has no account; later use Give sign-in.
- **Action:** Sign in as that person for the first time.
- **Expected:** Persistent welcome prompt, cleared only by that person’s `person.backSeen`.
- **Disproof:** Restore always records the pending welcome independently of present account existence.

**Required plan correction:**

1. Set `Person.back = true` on every Restore.
2. Keep it until that exact person signs in and acknowledges it.
3. Keep the admin’s session-only back prompt separate.
4. Test no-account → Restore → Give sign-in → first sign-in, plus attempts by another member or admin view-as-member to clear it.

### 6. High — new-person commands gain a writer that their permission contracts do not declare

**Ruling/promise:** D200 requires every table written by a command to be declared in the command permission map and mirrored in A11 documentation.

The plan adds `postInOnWar(txn, id, date)` to `person.add`, `account.addNew`, and `access.approveNew`, but its permissions section does not add `LeavePersonProfile U` to those commands. Current mappings confirm that omission ([perms.ts:301](</C:/Users/User/projects/Raptor/raptor-port/src/state/perms.ts:301>)). The plan also does not say how the existing people/settings transaction enlists the Leave War store.

- **Setup:** Exercise each of the three new-person doors with a Post in date.
- **Action:** Inject a failure after the war write and inspect authorization plus all stores.
- **Expected:** One authorized command envelope; every participating store commits or rolls back together.
- **Disproof:** The completed plan explicitly declares the profile operation and transaction enlistment for all three commands.

**Required plan correction:**

1. Amend `COMMAND_OPS`:
   - `person.add`: Person C + LeavePersonProfile U
   - `account.addNew`: User C + Person C + AccessRequest D + LeavePersonProfile U
   - `access.approveNew`: AccessRequest D + User C + Person C + LeavePersonProfile U
2. State that each command enlists the Leave War store in the same transaction before `postInOnWar`.
3. Avoid introducing a `roster-add.ts` ↔ `leavewar/sync.ts` import cycle; place the transactional seam below both callers or inject it through the existing command boundary.
4. Add authorization-drift, command-scan, rollback, and reload tests.
5. Update A11/data-model documentation in the same change.

### 7. High — Archive has no defined war path for a hidden active SANS person

**Ruling/promise:** The one-door Archive action must work for every visible Users-row state and preserve the person’s stint history.

Leave War projection excludes SANS people when Show SANS is off ([raptorRoster.ts:41](</C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/raptorRoster.ts:41>)). Admin → Users can still show and Archive that person. The plan assumes the war current stint exists but does not require Archive to recover it from stored records or an all-people projection.

- **Setup:** Active SANS person, Show SANS off.
- **Action:** Archive, Restore with a later Post in, reload, then turn Show SANS on.
- **Expected:** Original stint, absence gap, and restored stint all appear correctly.
- **Disproof:** Archive explicitly resolves the war person through stored post-outs or `projectPeople(true)` and persists the boundary even while the row is hidden.

**Required plan correction:**

1. Add the hidden-SANS case to Archive’s war half.
2. Resolve identity/window from persisted Leave War data or the inclusive projection, never only the displayed roster.
3. Test Show SANS off/on across Archive, Restore, repeated Archive, and reload.

### 8. Medium — the published-roster assertion covers only the badge, not D45/D103

**Ruling/promise:** D45 freezes issued content. D103 says a working-content change drops all four signoffs, and exact restoration restores them. D321 says Archive makes affected published days show one pending difference.

The plan checks only that a published day reads “1 pending” ([plan:29](</C:/Users/User/projects/Raptor/raptor-port/docs/superpowers/plans/2026-09-27-one-door-plan.md:29>)). It does not assert the issued face remains unchanged or that all four signoffs behave correctly.

- **Setup:** Fully signed-off published day containing the person.
- **Action:** Archive, inspect issued and working versions, then Restore to the exact prior state.
- **Expected:** Issued face unchanged; working comparison exactly one pending; all four signoffs fall; exact restoration returns to zero pending and restores signatures.
- **Disproof:** Tests explicitly assert all four effects on desktop and phone after reload.

**Required plan correction:** Add those assertions to Sections 1, 5, and 6, including a day where Archive is the only content difference.

## Explicit negatives

I also checked the following areas and found no additional plan-level contradiction:

- The one-door row-state/button matrix broadly matches D310/D322: active, suspended, no-account, archived, and waiting states remain distinguishable.
- Restore enabling an account even when it was manually suspended matches D322.
- The plan correctly avoids an Enable action on archived rows.
- Last-admin manual Archive refusal and the scheduled-posting wait/atomicity rule match the rulings.
- Callsign reuse, Restore collision handling, direct rename, 14-character limit, and initials treatment are covered.
- Quals keeps the Add person shortcut and roster rename while losing its archive/archived-list responsibilities.
- Active and archived Delete routes preserve the existing two-tap wording and past-record rules.
- Centralizing availability/manning readers through `inSquadron` is sound once historical routing and hidden-SANS state are fixed.
- The proposed persisted `past` shape, load/reprojection updates, and storage-version handling are adequate in principle; I raised no D56 legacy-demo migration finding.
- Guest, pending, and suspended users should not receive the welcome banner once the live-session issue above is fixed.
- Admin view-as-member correctly refers to the viewed member’s own welcome state; it should remain in the acceptance tests.
- No code or documents were modified.

