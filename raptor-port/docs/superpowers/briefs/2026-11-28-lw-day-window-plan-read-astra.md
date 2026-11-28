I read an exported copy of the repository.

The plan needs revision before building. I found six actionable problems, ranked below. This was a read-only review of the plan, rulings, drawing scripts and current code. I did not run the app or tests, read HANDOFF, read another reviewer’s report, or change any file.

1. **High — the proposed permission change does not enforce “a member’s change returns approved leave to pending.”**

   **Failure:** Ranger moves his approved leave through a Leave War command that only changes the saved leave’s dates. The existing permission checks can accept that change while the leave remains approved. They deliberately permit comparable changes through Inputs, where the owner has ruled that leave stays approved.

   **Cause:** Step 7 relies on the existing own-input permission check and proposes widening only the check of who originally placed the request. Neither change requires the command to remove the selected approved leave and replace it with pending requests. Step 4 also introduces a general move route covering leave filed through Inputs; that route needs the same distinction.

   **Evidence:** D2922 requires a member’s Leave War move or change to return leave to pending. D1166 preserves the different Inputs behaviour. The current permission gate checks ownership and protected fields, but does not enforce this Leave War conversion. Step 7’s proposed handmade-command tests correctly demand refusals that its implementation instructions do not provide.

   **Change the plan:**

   - Before widening the placement-stamp check, specify a command-specific rule for member changes to approved leave through Leave War.
   - Require the selected approved portion to be removed, untouched portions to remain unchanged, and its replacements to be pending requests on permitted dates. Reject any replacement approved leave.
   - Apply that rule to every proposed Leave War route that can move or change approved leave, including the new Inputs-entry move route.
   - Tie an inherited placement stamp to the particular removed portion and its replacement. Cutting one day must not authorize unrelated requests carrying the same old stamp.
   - Test these commands directly, alongside a positive test showing that an ordinary Inputs edit still keeps leave approved.

2. **High — changing AM to PM can leave both halves booked, and a failed replacement can leave an intermediate change saved.**

   **Failure:** An admin changes approved AM leave to PM. The proposed sequence first turns AM into a pending request, then invokes the existing replacement operation with PM. That operation replaces requests overlapping the *new* portion. AM does not overlap PM, so the AM request remains while a PM request is added. The pending-bid route has the same problem.

   If the replacement is refused after the first conversion, merely returning failure does not roll back the enclosing command.

   **Cause:** Steps 6 and 11 treat the existing cell-placement operation as an identity-based edit. It is an overlap-based placement operation. Step 6’s specified duration test covers Whole day → AM, which does overlap and therefore misses the AM → PM failure. The command wrapper does not treat every inner false return as a rollback.

   **Evidence:** D2922 and D2925 describe changing the existing leave, not adding another half. D2923 requires its remarks and documents to survive. The current replacement code selects old requests by overlap; the command wrapper requires an explicit abort for an unsuccessful compound change.

   **Change the plan:**

   - Add a replacement operation targeting the selected entry by identity.
   - Check the proposed final state before removing approved leave or requests, excluding only the selected entry from collision checks.
   - Preserve a separate neighbouring half; refuse an attempted change that would overwrite it.
   - Make every failed stage abort the entire command, including reapproval.
   - Test AM → PM, PM → AM and both half-to-whole changes, for pending and approved leave. Include an occupied destination half, retained documents and remarks, balances, reload, and one-step Undo. A refused operation must leave the original state unchanged.

3. **High — the new course and duty moves bypass the question about earning off in lieu.**

   **Failure:** A member moves his weekday course onto Saturday, where the entry needs an answer about earning off in lieu. The proposed date-cutting and refiling path can save the move without asking first.

   **Cause:** Step 4 lists permission and collision checks but omits the question-before-save workflow. Section 7, K5 assumes that using the Inputs write path automatically supplies this behaviour. It does not: the existing calendar move explicitly wraps its save in the question workflow; the lower-level write operation does not ask.

   **Evidence:** D783 and D804 require the answer before an applicable move, with the answer and change forming one operation and one Undo. The existing calendar-move code implements that ordering explicitly.

   **Change the plan:**

   - Add the existing off-in-lieu question workflow to Step 4 before any source dates are cut.
   - Calculate the question from the proposed moved entry, including a moved portion of a longer entry.
   - Cancellation must leave both dates unchanged and create no completed-change notification or Undo entry.
   - After an answer, recheck the entry, permission, destination and protection before saving the move and answer together.
   - Add weekday-to-weekend and weekday-to-holiday tests, cancellation, existing-answer cases, and an entry changed while the question is open.

4. **High, if Step 16 is included — its proposed helpers cannot separate one person from a group.**

   **Failure:** An admin chooses Cutter alone and moves or deletes one day of a three-person leave. The helpers named in Step 16 cut dates from the shared entry. Used as described, they change that day for all three people.

   **Cause:** Step 16 says the existing date-cutting helpers already perform a person split. They do not. They preserve the complete people list when copying each date portion. There is a separate existing operation that removes one person from a shared entry and gives him his own entry.

   **Evidence:** D2778 requires an individual change to affect that person alone. The current date-splitting code has no person-selection argument; the existing person-splitting code does.

   **Change the plan:**

   - Replace the claimed existing person split with an explicit dependency on the actual person-splitting operation.
   - Follow the owner’s answer to Q1 about when that split happens. If it happens with the edit, put the split and edit in one command.
   - Apply date cutting only to the resulting individual entry. Whole-group actions must retain the complete people list.
   - Test choosing the first, middle and last person, changing one day and all days. Check the other people’s dates, documents, remarks and entry identity, plus reload and Undo.
   - Keep Step 16’s fallback available while its owner questions remain unanswered; this finding does not require delaying the independent single-person work.

5. **Medium — “To review” has an incorrect cross-week placement test.**

   **Failure:** A request covers Sunday and Monday and has already been placed on Sunday’s programme. Loading Monday’s week can make it appear under “To review” again, despite already being placed.

   **Cause:** T1 defines “not placed” by looking for a programme row in the week currently displayed. Its own test list and R12 require checking other weeks too. The accepted flag alone is insufficient because it is recalculated when a week is loaded.

   **Evidence:** D2883 requires this section to contain unplaced entries. The existing acceptance controls already consult saved weeks to detect a request placed elsewhere and identify its date.

   **Change the plan:**

   - Replace “no row in the week in view” with a placement check covering the current and saved weeks, reusing the existing lookup.
   - Use that same result for rows and folded-heading counts.
   - Specify how an unreadable saved week is handled; do not silently equate an unsuccessful lookup with “unplaced.”
   - Test the Sunday-to-Monday case after switching weeks and after reload. Then remove the original programme row and check that the request returns to “To review.”

6. **Medium — the schedule steps can remove the week view’s Reject before its replacement exists.**

   **Failure:** The builder follows Q6’s “meanwhile” instruction and enables the Board plus the shared filtering rule while holding back the week’s new Reject button. Accepted entries disappear from the week’s Personal Inputs section, taking their existing Reject controls with them. Their programme rows do not yet have the replacement.

   **Cause:** T1 switches both schedule views before T2 adds their replacement controls. Q6 explicitly permits the shared rule to proceed while the week’s Reject is waiting for its drawing.

   **Evidence:** D2883 requires Reject on the placed row in both views. In the current week view, that control is supplied by the Personal Inputs entry; the programme-row builder does not supply its replacement.

   **Change the plan:**

   - Resolve the week drawing before enabling its filtering change.
   - Build and verify Reject on both Ground and Common rows first.
   - Enable removal of accepted copies only when the corresponding view has its replacement controls, late marks and working jump targets.
   - State this as a release dependency: preparatory work may proceed, but the week must never ship with neither Reject route.
   - Test Reject, return to “To review,” reacceptance and Undo from both views, plus the absence of editing controls on issued views.

The two-branch split is sensible: the day-window work and schedule work have separate purposes and can be reviewed independently. The schedule branch does, however, need the dependency above between its two views. The permission enforcement, targeted replacement and question-before-save work belong ahead of the new day-window controls.

Rulings: none this session.

REVISE