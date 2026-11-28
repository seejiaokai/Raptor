I read an exported copy of the repo.

The plan is **not ready**. I checked section 10’s accepted and changed fixes against the revised steps. Four findings remain.

1. **High — the new permission definitions block the member actions they are meant to allow.**

   **Failure:** Ranger moves or deletes his own approved leave, or moves his own course. The proposed command is refused before it can save.

   **Cause:** Steps 4 and 7 add extra table permissions. The [existing permission check](/C:/rt/p198b/raptor-port/src/state/perms.ts:723) requires unrestricted rights for every extra table. Members have only own-entry rights for inputs and bids. Thus step 7’s added input permissions fail, and step 4’s added bid permission fails—even when no bid needs changing. Round 1’s M5 fix is therefore not closed.

   **Change the plan:** Before registering these commands, extend the extra-permission definition to support an explicit own-entry check, retaining unrestricted rights as the default for existing commands. Use own-entry checks for these commands’ input and bid changes; retain the checks of whose records actually changed. Add positive tests with a signed-in member for all four new command types, followed by tests proving another person’s entries remain protected. Run the positive cases through the card and grid-drop paths, not only the new helper.

2. **High — moving a member’s custom-hours leave cannot preserve its hours under the proposed design.**

   **Failure:** Ranger moves his approved 10:00–15:00 leave to another open day. The plan promises a pending bid, but that bid cannot represent 10:00–15:00. Using the existing conversion makes it whole-day leave; refusing conversion leaves the promised Move unusable.

   **Cause:** R5 and step 9b retain Move for custom-hours leave, while step 7 covers any one-person leave and promises the existing request shape without new fields. The [request definition](/C:/rt/p198b/raptor-port/src/leavewar/engine/warrecs.ts:38) holds only a leave code and whole-day/AM/PM notation. Step 5 recognises this limitation for sending leave back to pending, but step 7 does not. D2922 requires the member’s move to become pending; it does not authorise changing its hours.

   **Change the plan:** Add a prerequisite to step 7 for pending requests that preserve exact start and end times through saving, reload, approval, clash checks and Undo. Update the saved-data promise and affected records accordingly. Add a test moving 10:00–15:00 leave, then approving it: both the pending entry and resulting leave must retain those hours. Keep this member state on its existing window until that support and its required drawing are complete.

3. **Medium — the new safeguard rejects the untouched remainder of a longer leave.**

   **Failure:** Ranger changes Wednesday of an approved Monday–Friday leave. Monday–Tuesday and Thursday–Friday must remain approved, but the proposed safeguard rejects the operation.

   **Cause:** Step 7 forbids creating any approved leave input. The [existing date-cutting operation](/C:/rt/p198b/raptor-port/src/leavewar/sync.ts:930) necessarily creates a new input for the second surviving piece. Step 7’s negative test also says a command that “leaves” approved leave is refused, contradicting its own requirement to preserve untouched days. This is a new fault in the Astra 1 / Opus H3 safeguard.

   **Change the plan:** Judge approved **coverage**, not whether a new record was created. Permit surviving pieces only where they preserve the original person, kind, hours and unselected dates. Refuse approved coverage on the changed or destination portion. Test a middle-day delete, move, kind change and half change on a five-day leave: both untouched pieces stay approved, the changed portion follows D2922, reload agrees, and one Undo restores the original leave.

4. **Medium — step 4 requires a test that contradicts the member’s approved-leave rule.**

   **Failure:** Step 4 expects a member to move his own leave onto a closed day, replacing his pending bid there. Passing that test through step 4 would keep the moved leave approved, contrary to D2922.

   **Cause:** The new landing-on-a-bid test says this is “allowed (D1166)”. Yet step 4 explicitly excludes a member’s own approved leave, sending it to step 7; step 7 requires a pending result and currently refuses closed destinations pending Q5. D1166 protects the separate Inputs-page route.

   **Change the plan:** Replace that positive war-door test with a refusal test: neither the approved leave nor the destination bid changes. Retain the positive closed-day case through the **Inputs page**, where it remains approved. Keep the admin’s bid-replacement test. If Q5 later permits the member’s war move onto closed dates, update step 7 and its tests together; the result must still be pending.

Review only: no files changed, no build or browser checks run.

Rulings: none this session.

**REVISE**