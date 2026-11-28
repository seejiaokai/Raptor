Security read of an exported copy of `abc44cea3` (fixes `334353046..abc44cea3`)

**1. What I read.** `review/fixes.diff`, all of `ui/InputWindow.tsx` and `ui/topstate.ts`, the landing and session parts of `state/store.ts`, `state/belltap.ts`, `state/pick.ts`, `ui/heldro.ts`, `ui/OilDayList.tsx`, `ui/oilday.ts`, `ui/DocViewer.tsx`, the parts of `ui/pops.ts` that close windows, and from `state/perms.ts` the page-squadron questions, `mayChangeInput`, `inputWhoProblem`, `inputUnitViolation` and `ownershipChecks`. I also read the Tracker's question and session-end code (`tracker/role.js`, `core.js`), `leavewar/sync.ts` `oilPendingFor` and `openInputWindow`, `noticeLive`/`rightHolds`, and rulings D2323, D2389, D2310 and D2218.

**The commit gate on its own:** for inputs, yes. `inputUnitViolation` → `inputWhoProblem` judges every changed input by its stamp and by each named man's squadron on every day it covers. An admin acting as admin must be admin of all of them; a member must belong to them. That is decided from the rights as they stood before the command, whether or not the window is held. So nobody without rights in 149 can write a 149 input through any door. The window hold is the only guard for someone who has rights in both squadrons (a master admin, or a Plan holder): for them the gate lets a 142 record be written under a bar saying 149. Both findings below are that case.

**2. Findings**

**F1 · The OIL list opens another squadron's input in a live window after a pick · medium**
- *What goes wrong:* Hunter (142's admin, Plan of 149) makes Sat 15 Aug a holiday in 142, and the OIL list opens for 142. He picks 149 from Schedules; the list stays up, as it is built to. He taps one of its cards. The Inputs page opens on 149 with 142's input in a live window: no band, Save, Delete and the OIL answer all working, and they change 142's record under a bar saying 149. That is the C1 failure again (D2323). If he then picks 142, the window is held with an untrue band, "This is 149's. You picked 142", over a 142 input.
- *Cause:* `ui/OilDayList.tsx` Body `openInput` calls `setInpEdit(r)` and `setPage('inputs')` for an input of the list's squadron, not the page's. `InputEditor`'s note then records the page's squadron (149) as where it was opened. The new swap check doesn't help: `swapOn` is also the page's squadron, so "Discard and open" from that list opens the 142 input live too.
- *Fix:*
  1. In `openInput`, before opening, run `const where = enterForLine(unit, () => openInput(r))`. `unit` is the list's squadron. Return if the answer is 'asked'.
  2. Then call `setInpEdit(INPUTS.find(x => x.iid === r.iid))` afresh.
  3. A belt for every door, in `InputWindow.tsx`: where the first note is taken for an existing input on his own page, use `u = inputUnitOf(r)`. When `u` is not `pageSqn`, `u` is not in `inputSquadrons(r)`, and `ownPageMayBe(u)` is true, record `unit: u` instead, so the window opens held with the true band ("This is 142's. You picked 149").
- *Test that fails today:* Plan holder, 142's OIL list open, pick 149, tap a card. Expect the window held with the band, or the page entered to 142. Today the window is live with no band.

**F2 · The bell's OIL tap opens another squadron's input under the squadron in view (fix 2's door) · medium**
- *What goes wrong:* Hunter, Plan of 149, picks 149. His own 142 weekend duty has an unanswered OIL question, and he taps the bell. The Inputs page opens on 149 with his 142 duty live and its OIL question up. His answer, Save and Delete write 142's record under the 149 bar, with no band. Picking 142 afterwards holds the window with the untrue band. This also covers inputs he filed for several people, which are other 142 men's.
- *Cause:* `ui/topstate.ts` `bellTap`, the oilHit branch, calls `openInputOnPage(oilHit.iid, …)` without bringing the input's squadron into view. `openNotice` does this first, through `enterForLine`. `oilPendingFor` reads every squadron's inputs (`warInputs` is `INPUTS`).
- *Fix:*
  1. In the oilHit branch, after `row` is found, call `const where = enterForLine(inputUnitOf(row), () => bellTap(from))`.
  2. Return if the answer is 'asked'.
  3. Then call `openInputOnPage` as now. On 'no' the window already judges its rights by the input's squadron.
  4. F1's step 3 covers this route too.
- *Test that fails today:* Plan holder with 149 picked and his own 142 OIL pending taps the bell. Expect the squadron in view to be 142, or a held window with the band. Today it is a live window under 149.

**F3 · A bell line opened after the Tracker question, though a right ended while the question was up · low**
- *What goes wrong:* Hunter holds Plan of 149 until 24 Nov, and unsaved Tracker edits on 142. On the 24th he taps a 149 admin line about Osprey's ATT C input. "Save them before switching to 149?" comes up. Midnight passes and his Plan ends; by D2310 the line has left his bell. He presses Discard. The stored retry re-runs `openNotice(n)`; `enterForLine` now answers 'no', and the input branch still opens Osprey's 149 input, with its kind, remarks and document clip. He no longer holds any right in 149. It opens read only, but it is shown to him.
- *Cause:* `ui/topstate.ts` `openNotice`, and the `again` retry in `state/belltap.ts` `enterForLine`. The line is never checked again to see if it is still live. `openInputOnPage`'s `open()` likewise re-finds the input with no check.
- *Fix:*
  1. At the top of `openNotice`, for a line that is not his own account's, run `if (!noticesFor(me()).some(x => x.id === n.id)) { notify(); return }`.
  2. In `openInputOnPage`, take `const who = me()` before asking, and in `open()` return if `me() !== who`.
  3. For the OIL door, also return if `!oilPendingFor(me()).some(h => h.iid === iid)`.
- *Test that fails today:* raise the Tracker question from a 149 line, end the Plan by moving the day past its end date, answer Discard. Expect no window; today Osprey's input opens.

**Checked and holding:**
- Every write inside the window stops on `held`: Save, the medical save, Delete, delete-for-all, take-me-out, "No document", the upchit question's delete, and Enter in the fields. Under a pick's band the document field is greyed with the form.
- The swap question goes when the page's squadron changes, and its "Discard and open" checks the squadron again.
- A sign-out while the landing question is up answers it "cancelled" (`dlgCancelAll` → false), so nothing opens for the next person.
- A right lowered with a write question up still gets the gate's refusal.

**3. Unproven leads**
- The Leave War's clash note `goClash` → `openInputWindow` (`leavewar/ui/Chrome.tsx`). While a war window holds 142's war across a pick of 149, the note may still be pressable. If it is, it opens a 142 input live under 149, the same failure as F1. Settled by pressing it with a held war window open.
- `InputsCal`'s opened day: the just-saved row it adds to the top of the list (`revealed`) may outlive a pick and carry a 142 card into 149's day. Settled by saving an input, picking another squadron, and looking at that day.

**4. Tidiness (filed, not fixed)**
- `swapOn` copies the squadron rule into a second place beside `openedOn`. A single "which squadron the input belongs to" field in the note would serve both (see F1's step 3).
- In `openInputOnPage`, the input looked up before the question (`inpById` in `bellTap`/`openNotice`) and the one looked up after it in `open()` can differ, and nothing checks that they are the same input.
