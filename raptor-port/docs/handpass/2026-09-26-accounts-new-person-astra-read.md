# Astra independent review

## Findings

1. **The Add form does not fully clear after success, allowing stale hidden state to affect the next account.**

   - **What:** Each success path resets only the fields visible in that mode. A successful roster add leaves the draft new-person object intact; a successful new-person add leaves the previously selected roster person intact.
   - **Where:** `raptor-port/src/ui/UsersPanel.tsx:274-282`
   - **Failure scenario:**
     1. Select an existing roster person under “On the roster.”
     2. Switch to “New person” and successfully add someone.
     3. The form returns to “On the roster,” but the old roster selection remains.
     4. Enter another sign-in and press “Add account.”
     5. The new account is linked to the stale person rather than starting from a cleared form. The inverse path resurrects stale new-person fields after a roster-account success.
   - **New or on main:** **New in this branch.**
   - **Exact step-by-step fix:**
     1. Extract one `resetAddForm()` helper.
     2. Have it clear `name`, `pid`, `np`, and `role`, and restore `mode` to `roster`.
     3. Call it after both successful branches.
     4. Add a UI test that selects a roster person, switches modes, completes a new-person add, and verifies the roster picker is blank.
     5. Add the inverse test: type new-person fields, complete a roster-account add, reopen New person, and verify every field is blank.

2. **Personnel incorrectly has an internal CAT list, so a CAT can survive invisibly through Personnel.**

   - **What:** `catsFor()` treats every non-pilot seat—including `GND`, blank, and invalid values—as WSO. Personnel therefore internally accepts CAT values even though the UI says personnel hold no CAT.
   - **Where:** `raptor-port/src/state/roster-add.ts:42-43`; consumed by `raptor-port/src/ui/UsersPanel.tsx:94-106` and `raptor-port/src/ui/AccessScreen.tsx:109-120`
   - **Failure scenario:**
     1. Choose Pilot and CAT C.
     2. Change the seat to Personnel.
     3. The CAT control disappears or displays “None,” but CAT C remains in component state because `catsFor('GND')` includes C.
     4. Change the seat to WSO.
     5. CAT C silently reappears instead of returning to “Pick…”.
     6. The persisted Personnel record is normalized safely, but the editing state contradicts the stated “personnel hold no CAT” rule.
   - **New or on main:** **New in this branch.**
   - **Exact step-by-step fix:**
     1. Make `catsFor()` explicit: return pilot CATs for `FCP`, WSO CATs for `RCP`, and `[]` for everything else.
     2. Keep both seat-change handlers using the helper so selecting Personnel or an empty seat clears CAT.
     3. Unit-test `catsFor('GND')` and `catsFor('')` as empty.
     4. Add UI tests for Pilot/C → Personnel → WSO in both the sign-up and admin forms; WSO must show “Pick…”.
     5. Retain a persistence assertion that Personnel is stored with `cat: ''`.

3. **The evidence sheet calls `walk2` the fixed build even though two fixes landed after it; final gates and break tests are also absent.**

   - **What:** The sheet says P1 and P2 were found in `walk2`, then calls that same run “the fixed build.” It acknowledges that those fixes landed after `walk2` and promises a future re-walk. There is consequently no rendered evidence for the actual reviewed build. The required break-test and final-gate sections are still placeholders.
   - **Where:** `raptor-port/docs/handpass/2026-09-26-accounts-new-person.md:96-116`
   - **Failure scenario:**
     1. An owner relies on the stated “47/47 PASS, fixed build.”
     2. The screenshots actually predate P1/P2.
     3. A regression in either fix, or in another final-build surface, reaches the owner without being rendered.
     4. There are no recorded final test/build counts or intentional break-test reds to compensate for that gap.
   - **New or on main:** **New in this branch.**
   - **Exact step-by-step fix:**
     1. Run `np-walk.mjs` against the exact final commit into a new immutable `walk3`/`final` folder.
     2. Confirm all 47 assertions and zero browser errors.
     3. Inspect the former P1/P2 surfaces explicitly at desktop and phone widths.
     4. Perform the brief’s break tests and record which named test went red for each deliberately broken seam.
     5. Run the required final gates after restoring/fixing everything and record commands, counts, and commit SHA.
     6. Replace the contradictory `walk2` wording and complete §§6, 7, and 9 before the owner look.

4. **Both legacy Accounts handpass walks now abort at approval because they assume the old roster-only form.**

   - **What:** Requests whose typed callsigns are not already on the roster now open approval in “New person.” The scripts still immediately look for `#apvPid`, which exists only in “On the roster.”
   - **Where:** `raptor-port/scripts/handpass/acc-walk.mjs:123-129`; `raptor-port/scripts/handpass/acc-walk2.mjs:246-253`; default selection in `raptor-port/src/ui/UsersPanel.tsx:129-132`
   - **Failure scenario:**
     1. `acc-walk` submits Viper, opens approval, and expects `#apvPid`.
     2. Approval opens in New person, so that assertion fails.
     3. Its subsequent `#apvGo` can actually create Viper instead of testing the missing-person refusal.
     4. The later `selectOption('#apvPid', ...)` then aborts because the selector is absent.
     5. `acc-walk2` aborts immediately at the equivalent selection.
   - **New or on main:** **New in this branch**, caused by the new default-mode semantics.
   - **Exact step-by-step fix:**
     1. After each affected Approve click, explicitly click `#apvModeRoster`.
     2. Wait for `#apvPid` before asserting or selecting it.
     3. Preserve `acc-walk`’s intended empty-picker refusal check only after that mode switch.
     4. Run both scripts from fresh state and record their complete pass results in the evidence sheet.

## Explicit negatives

- I found no second production writer for creating a roster person; the new-person paths converge on the shared state command.
- I found no partial durable-write path in the new commands: person, account, request, and seen-state stores are enlisted together, and identifiers are minted inside the committing operation.
- I found no missing `CommandOp.more` authorization check. The new command shapes and corrected account/request command shapes require every declared object permission.
- I found no new door exposed to members, guests, pending users, or switched-off users; state functions also enforce the role boundary rather than relying only on hidden controls.
- I found no cross-admin bell state: request visibility is keyed to the current admin account, and the desktop/phone “shown” distinction is wired through the Admin surface.
- I found no remaining Quals-side person writer. Its button routes to Admin → Users.
- I found no missing downstream roster projection among the inspected Quals, crew-list, Inputs, Leave War, Tracker, search, and account-picker readers.
- I found no divergence in the shared Callsign/Name, seat, CAT, or overlength wording at the inspected call sites.
- I found no issue dependent only on old/demo data under D56.
- I found no duplicate-add path in the command layer; collision validation is repeated inside the committing operation.

## Verification limitation

The requested focused Vitest run could not collect tests in this read-only environment: Vitest received `EPERM` while creating its temporary client/SSR directories. It reported zero collected tests, so that is an environment limitation—not a test failure or a green result. The checkout remained clean.

## Verdict: **FIX FIRST**

Finding 1 can durably link a subsequent account to stale state. Findings 2–4 also need correction and final-build evidence before the owner look. I do not see a reason to block the design outright once these are fixed and the required gates are recorded.

