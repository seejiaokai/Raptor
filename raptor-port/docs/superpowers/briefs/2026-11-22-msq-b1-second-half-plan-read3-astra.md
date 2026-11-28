# Red team of batch 1's second-half plan, round 3 — Astra's report (22 Nov 26, chat 139)

Brief: `2026-11-22-msq-b1-second-half-plan-read3-brief.md` (§15 alone), blind to the fresh Opus reader's and Fable's
reports. Read an exported copy of commit 310496564 (picture-free; the builder's handoff block removed), by
`codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`. Saved by the host as returned.

I read an exported copy of commit **310496564** from **claude/msq-b1-screens-135**. This report reviews **§15, D1–D14**, with §15 taking precedence. No files were changed. Four new findings follow.

1. **High — D1’s exception for derived notices brings retired messages back after a fresh grant.**

   **Concrete case:** Hunter, a 142 admin with Plan of 149, sees Osprey’s “off the manpower” posting line. Saber removes Hunter’s Plan at 10:00 and gives it back at 11:00. The line disappears while Hunter lacks Plan, then returns.

   **Cause:** D1 removes **stored** admin notices but explicitly exempts derived lines because they use today’s audience. That audience cannot distinguish uninterrupted access from access given back. [The posting-line builder](/C:/rt139/raptor-port/src/leavewar/sync.ts:1713) checks today’s admins and recreates recent posting lines with stable IDs. D6’s squadron stamp does not record retirement. D1’s own “taken at 10:00 and given at 11:00 — none back” test therefore cannot pass for these lines.

   **Fix:** Include derived admin notices in permanent retirement. In the access-loss command, record which recipient, squadron and posting events have been retired, irrespective of whether their bell switch was on or their lines were read. Make the derived reader consult that record. Validate those retirements against the same command’s actual loss of access. Undo may reverse them only where it lawfully restores the corresponding access, as finding 3 requires.

   **Check:** Exercise stored and derived posting lines separately: remove Plan, give it back that morning, reload, and confirm neither old line returns. A genuinely new posting must still appear. Repeat with Undo and Redo.

2. **High — D1’s promotion write conflicts with D6’s owner-only bell rule and overwrites an explicit choice.**

   **Concrete case:** Hunter holds Plan of 149. Saber selects Master admin on Hunter’s row and presses Save. D1 requires that command to write Hunter’s 149 bell switch on. D6 permits only Hunter, through the bell-switch command, to write his switch row. Enforcing D6 therefore refuses the lawful promotion.

   If that protection is simply bypassed, another failure follows: Hunter may already have deliberately switched 149 off. D1 turns it back on without his choice.

   **Cause:** §15 D1 requires an unconditional switch write during promotion; §15 D6 forbids that actor and command from making it. Earlier §7 item 3 also says the setting contains **only the person’s own choices**, and D2202 makes switching Plan notifications off his choice.

   **Fix:** Preserve every explicit bell choice. Carry forward the former Plan default only for squadrons with no explicit choice, using separately validated promotion information rather than rewriting the person’s choices. Permit that information only beside a verified promotion, and only for squadrons the person actually held Plan of immediately before it. Keep D6’s owner-only switch rule intact.

   **Check:** Promote Hunter with 149 unset, explicitly on, and explicitly off. All three promotions must save; the effective settings must respectively remain on, on and off. Test Undo/Redo and reject a forged attempt to carry forward an unrelated squadron.

3. **High — D1 promises to restore Plan and notices together where an ordinary admin’s Undo deliberately restores only the role.**

   **Concrete case:** Kestrel, 149’s ordinary admin, also holds Plan of 142. Hunter is a 142 admin with Plan of 149. Kestrel makes Hunter a member, then presses Undo.

   The existing rule restores Hunter’s 142 admin role but **does not restore Plan of 149**: only a master admin may restore Plan. D1 nevertheless says Undo puts the removed notices back with the right. Restoring those 149 notice records would leave them without the corresponding restored right; a later fresh grant of Plan would expose the old records again.

   **Cause:** D1’s blanket Undo promise conflicts with the explicit non-master restore restriction in [the grant restore check](/C:/rt139/raptor-port/src/state/perms.ts:2162), also recorded in the security table’s `UnitGrant` row. The [notice restore filter](/C:/rt139/raptor-port/src/state/undo-wire.ts:641) currently excludes notices retired by a **move**, not notices whose Plan restoration was omitted. These are separate decisions today.

   Restoring Plan merely to satisfy D1 would instead breach the master-only rule.

   **Fix:** First calculate the lawful result of Undo, including omitted grant rows. Restore retired admin notices only for squadrons where that result actually restores the lost admin access. Use the same decision in the restore filter and commit gate. Leave 149’s notices retired in this ordinary-admin example, including through a later fresh grant. D7’s follow-up must describe the changes that actually happened, not an assumed complete reversal.

   **Check:** Compare ordinary-admin and master-admin Undo of the same downgrade. The ordinary admin restores the home role and its eligible notices only; the master can also restore eligible Plan and its notices. Check Redo, repeated Undo, and a later fresh grant.

4. **Medium — D2 introduces a misleading navigation question, and the drawing list omits it and D3’s new toast.**

   **Concrete case:** Hunter has unsaved edits in 149’s Tracker and picks 142. D2 calls the sign-out question. Its [current wording](/C:/rt139/raptor-port/src/tracker/app/core.js:94) asks, “Save them before logging out?” Hunter has not asked to log out. Choosing Save or Discard continues a squadron pick, so the question describes the wrong action.

   Separately, Hunter tapping a 149 access alert from 142 receives D3’s new “1 waiting for access to 149” toast. That new message is not included in §15’s drawing additions.

   **Cause:** D2 specifies reuse of `trackerMayLogOut`, but F2 covers the retained-Tracker messages and F7 the open-window bands—not the new pick-time question. D3 adds new toast wording without adding its picture. D1625 expressly requires a drawing even when a new question copies an existing look.

   **Fix:** Give the shared unsaved-edit question the action’s context. For a squadron pick, name the destination and keep Save, Discard and Stay; retain the existing logout wording for logout. Add the pick-time question to F2’s drawings and D3’s toast to the drawing list before implementation.

   **Check:** Stay leaves the pick and draft unchanged; Save saves to the original Tracker before changing the pick; Discard discards only after that choice. Include the menu and bell-driven navigation paths.

These are source-based plan findings. I did not run tests or inspect rendered screens; the supplied copy omits the pictures.

Step A — holds.  
Step B — holds with finding 4.  
Step C — holds with findings 2 and 3.  
Step D — holds with finding 4.  
Step E — holds.  
Step F — holds with findings 1–4.  
Step G — holds.

Rulings: none this session.

D1 — does not hold: findings 1, 2 and 3.  
D2 — holds with finding 4.  
D3 — holds with finding 4.  
D4 — holds.  
D5 — holds.  
D6 — holds with finding 2.  
D7 — holds with finding 3.  
D8 — holds.  
D9 — holds.  
D10 — holds.  
D11 — holds.  
D12 — holds.  
D13 — holds.  
D14 — holds.