# Fix read 17 — Astra's report (blind; copy at `7dbc13fd0`, whose app code is `6e08cdf25`'s) — run again by chat 124, finished whole

Reader: GPT-6 Astra (D1770, D2210), run by chat 124 as `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only --skip-git-repo-check` on its own exported copy, brief `2026-11-20-multi-sqn-b1-fixread17-brief.md`; blind to the other three readers and to the builder's report; started 15:47:30, ended 16:01:50, exit 0 — **finished whole, not stopped** (chat 123's first run of this read was stopped by its service with nothing stated; that run is replaced by this one, so fix read 17's Astra is no longer owed). Its last message as returned:

---

Read-only review of the exported copy at `7dbc13fd0`: **REVISE — four confirmed failures.** No files changed. I opened no other fix-read-17 report or builder evidence. No post-compaction handoff was received.

**1. High — the final save check accepts a squadron move that retains old access**

**Proof, run red:** On 15 July, Saber gives Ranger View of 150 and gives Hunter Plan of 149. Hunter then submits a home-change command containing Ranger’s 142 home from 15 July and 149 home from 16 July, without removing the existing View.

**Expected:** reject the command because the move leaves an old right standing.

**Observed:** the command succeeds. On 16 July, Ranger belongs to 149 and still has View of 150. This violates D2203.

**Cause:** the normal move writer removes rights, but the final check does not require that removal. Its new protection examines rights being written; an untouched existing right escapes it.

**Fix:**
1. Compare each affected person’s actual squadron before and after the command, across the affected dates.
2. For a genuine move, require removal of every pre-existing View and Plan belonging to that person’s account.
3. Reject the entire command if any survives; retain the first-placement and legitimate-restoration distinctions.
4. Test retained View and Plan, ordinary moves, first placement and same-day cancellation.

**Age:** older than these commits; reversing the patch in memory reproduces it. The current fix remains incomplete at the final save check.

**2. Medium — moving a refused bid reports success but saves nothing**

**Proof, run red:** Open 27–31 July for bidding. Ranger bids LL on 28 July; Hunter refuses it. Ranger selects the offered Move action and moves it to 29 July.

**Expected:** the permitted move lands the bid pending on 29 July.

**Observed:** the command answers “moved”, but the refused bid remains on 28 July and 29 July is empty.

Moving a pending bid works. An admin moving the refused bid also works.

**Cause:** the new decision-state check requires a request retaining its identity to retain its state. The existing move writer deliberately carries that identity to another day and changes a refused bid to pending. The final check rejects that ordinary operation, after the move writer has reported success.

**Fix:**
1. Recognise a genuine move from the complete before-and-after records: the request leaves its source and appears once on a different permitted day of the same person.
2. Allow that move’s refused-to-pending transition and removal of its decision stamps.
3. Keep same-day refusal clearing, copying and invented decisions forbidden; the command’s name alone must grant no exception.
4. Propagate final-save rejection to the move result.
5. Test the day list, single-bid window and selected-block routes, including Undo/Redo.

**Age:** introduced by this round’s decision-state change. Reversing the patch in memory makes this exact move pass.

**3. Medium — an ordinary admin cannot undo the newly permitted move**

**Proof, run red:** Saber gives Ranger View of 150 and Hunter Plan of 149. Hunter moves Ranger from 142 to 149, effective tomorrow. The move succeeds and removes Ranger’s View of 150. Hunter immediately presses Undo.

**Expected:** restore Ranger’s original home and the View removed by Hunter’s own move.

**Observed:** Undo fails; the move remains scheduled and View stays removed. The equivalent master-admin control passes.

**Cause:** the new exception permits removing another squadron’s right during a move, but the inverse operation still requires the mover to administer that third squadron.

**Fix:**
1. Permit restoration of those rights only during a verified Undo of the same authorised move.
2. Require the corresponding home reversal and the exact recorded rights; retain ownership and conflict checks.
3. Keep unrelated grants and standalone restorations subject to ordinary permissions.
4. Test ordinary-admin move → Undo → Redo with third-squadron rights.

**Age:** newly exposed by this round’s move exception. Before it, the original move itself was refused.

**4. Medium — a member can erase who refused a bid**

**Proof, run red:** Ranger places LL on 28 July; Hunter refuses it. In Ranger’s own command, retain the request’s identity, placement stamps and refused state, but remove the refusal’s maker and time.

**Expected:** reject this alteration of an admin’s decision record.

**Observed:** both the final permission check and the actual save path accept it. The request remains refused, with its decision maker and time gone.

**Cause:** decision stamps are compared only when the submitted record still contains either stamp. Removing both bypasses that comparison; the new state comparison passes because “refused” is unchanged.

**Fix:**
1. Compare decision stamps in both directions, including their removal.
2. Preserve the narrowly verified move exception described above and verified Undo/Redo.
3. Test removal of either stamp separately and both together.

**Age:** older than these commits, confirmed with the patch reversed in memory.

**Coverage and where the promise must hold**

I started with specialised move and restoration paths, then followed the shared writers and readers.

| Objects and surfaces | Required visible result and working action |
|---|---|
| Refused, pending, approved, morning and afternoon leave; day list, bid window, selected-block window and Approvals | Move, Delete, Refuse, Back to bid and Approve must produce the stated dates and state. Finding 2 affects the shared move path. |
| Joined leaves, remarks, documents and filing attribution | The surviving leave retains the correct contents; eligible filers and named people receive one applicable notification. |
| Inputs list/calendar/editor and schedule placement | Permitted member edits preserve scheduler-controlled placement; subsequent Undo/Redo preserves that restriction. |
| Homes and View/Plan rights; account administration and schedule access | Rights follow the move rules. Findings 1 and 3 concern the underlying commands, assessed as requested even where the eventual screen is pending. |
| Bell list, unread state, retired lines and notification destinations | Recipients follow the input’s people, days and move history; a join’s notification points to the surviving leave. |
| Saved-copy checks, command capture, restoration and history | Rejected work leaves nothing half-saved; accepted work and its reported outcome agree. |

Roles covered included members, ordinary home admins, admins holding Plan and masters. Orders included filing → move → remarks change; approval → join/cut/move; move → Undo/Redo; and deletion/restoration protections.

**Builder’s choices and explicit negatives**

- **Fold identification: supported on the exercised paths.** Separate halves, deletion/un-approval, a three-leave bridge, backward extension into the later survivor, unchanged survivor remarks, notification deduplication and bridge Undo/Redo passed.
- **Filer-image selection: no concrete new failure found.** The folded leave’s own-day restriction and existing moved-filer, moved-together and away-and-back cases passed.
- **Decision-state rule: too broad**, as finding 2 proves; decision attribution also remains incompletely protected.
- **Move window: partly sound, incomplete.** Granting before the scheduled move is blocked; granting after it works. Bare removal, a home written then taken back, another person’s move and an unauthorised move did not let Hunter remove Ranger’s third-squadron right.
- Existing exercised protections for scheduler placement, deleted people, saved records and bell retirement passed. These negatives do not clear the four findings.

**Verification:** 291 existing cases passed through an in-memory assertion runner using bundled production code, plus targeted controls. Native Vitest stopped before tests because temporary-folder creation was denied. Counterexamples were run red; relevant pre-change comparisons used the reversed patch only in memory.

**Walk:** not performed; this was the requested code read. Screen behaviour was traced through production callers, not browser-verified.

**Tidiness:** the central weakness is inconsistent treatment of forward actions, their inverse and the final save check. Repair those shared rules without adding screen-specific exceptions.

**Rulings:** none this session.