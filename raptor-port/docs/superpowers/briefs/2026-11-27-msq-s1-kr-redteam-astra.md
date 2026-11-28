I reviewed the exported copy of commit **ab11fd033** from **claude/msq-s1-guard-6ae5e1**, with pictures, one chat’s handoff block and the plan’s own brief intentionally omitted.

**The plan is not ready to build as written.** The largest gaps concern Undo, unfinished Tracker jobs, and closers that save or refuse instead of discarding.

This was a static review of the [plan](/C:/kr-rt-astra/raptor-port/docs/superpowers/plans/2026-11-27-msq-s1-kr-no-blocks-plan.md), the code and the available full ruling rows. I ran no tests or browser walks and changed no files. D2825’s full row is absent from this export; I used the owner’s instruction supplied with this review. I also could not independently verify the plan’s cited D2827.

Findings follow, most serious first.

1. **High — Undo is explicitly allowed to cross the failed-save boundary, and row 21 lacks the Tracker question.**

   **Place:** §§4, 5 steps 3–7, KR-7 and R5; [undo-wire.ts, `squadronRefusal`](/C:/kr-rt-astra/raptor-port/src/state/undo-wire.ts:646), `undo/timeline.ts`, `globalUndo` / `globalRedo`, and `store.ts`, `maybeReenter`.

   **Example and failure:** The existing K8c test supplies a concrete case: an admin has newly created 151 selected, types “13h” into Logic’s Crew rest box and presses Undo before its delayed write runs. Closing Logic saves that value while Undo still takes back “+ New squadron”. Force that closing save to fail: the plan expressly permits Undo to remove 151 and enter 142 anyway. “Not saved” then belongs to the squadron just left.

   Separately, row 21 calls no Tracker question. Unsaved chart work can be present on the hidden Tracker page when the admin presses this Undo elsewhere. The resulting `maybeReenter` uses the automatic-change road, rather than the deliberate-change question.

   **Cause:** The plan treats a synchronous hook as permission to omit required behaviour. Replacing `closeShown()` with `closeOpen()` cannot implement its stated eight-step door order. The unchanged hook also does not wait for an already-running save.

   **Exact plan fix:** Remove the Undo exception and the “one line” / “timeline untouched” constraints. Specify preparation before either Undo’s view change or record writes: identify the intended step, wait for saves, obtain the Tracker answer, close, await closing saves, then revalidate and apply that same step. A failure or Stay must leave it unapplied. Extend K8c with a failed Logic flush, an existing save in flight, and dirty Tracker work; cover both row 21 and row 13, including Redo.

2. **High — Cancelling a Tracker dialog does not necessarily cancel its job.**

   **Place:** §3.1’s Tracker row, KR-2 and R4; [core.js, `importClick`](/C:/kr-rt-astra/raptor-port/src/tracker/app/core.js:7596), `dlgClose`, `dlgCancelAll`, `endSession`; `store.ts`, `enterRoleView`.

   **Example and failure:** An admin on his home squadron imports a file containing three charts. The first has already been saved. The second already exists, so its Replace / Add as new / Skip question is open. He switches to member view.

   The proposed closer supplies the dialog’s cancel answer. In this caller that means **“Skip this one”**, followed by `continue`. The third chart, if new, is then imported automatically. Further questions and the final report can appear after the window was supposedly closed and its unfinished work dropped.

   **Cause:** The plan requires the job to end “as its Cancel ends it”, but Cancel here deliberately continues the job. The existing import cancellation depends on `sessionSerial`; switching views on the home squadron does not end that Tracker session. Resolving all queued dialogs does not stop their callers from asking again.

   **Exact plan fix:** Require a navigation-cancellation signal distinct from a dialog answer. Invalidate the unfinished jobs before resolving their dialogs, including same-squadron role switches. Callers must stop before subsequent writes or questions. Preserve chart chunks already committed; do not roll them back as “typing”. Add the three-chart example and a queued-dialog case to KR-2. Do not reuse the whole `endSession()` blindly, since it also resets unrelated session state.

3. **High — The waiting-holiday protection misses a changed holiday.**

   **Place:** §§3.1, 4, Q3 and D8; [HolidaysPanel.tsx, the holiday form’s report and `save`](/C:/kr-rt-astra/raptor-port/src/ui/HolidaysPanel.tsx:305).

   **Example and failure:** An admin changes an existing holiday’s dates to a year without a covering leave period and presses Save. The form says it is keeping the change and will save it when covered. He then picks another squadron. Under the proposed retention of only the `holiday` **`noleave`** report, this accepted waiting change is discarded.

   **Cause:** The report chooses `line ? 'changed' : waiting ? 'noleave' : 'new'`. An existing holiday remains labelled `changed` even when `waiting` is true. `holidayChange` can return `noperiod`; this is also covered by an existing holiday test.

   **Exact plan fix:** Report pending-save status separately from the note’s wording. Apply Q3’s eventual decision to both new holidays and changes to existing holidays. Add a test that starts with a saved holiday, requests uncovered dates, receives the keeping promise, then presses a door. Check both the original saved record and the pending request.

4. **High — The Inputs day’s proposed “Escape path” can create a saved note.**

   **Place:** §3.1 `inputsday`, §5(6a), R2 and D1; [InputsCal.tsx, `showDay`, `cancelPick`, `finishNewNote`, `closePop`](/C:/kr-rt-astra/raptor-port/src/ui/InputsCal.tsx:287).

   **Example and failure:** An admin types a new calendar note, opens its people picker and selects people without confirming. A squadron-changing door closes the day. The proposed `noteGone; closePop()` path saves the note’s words without its selected people.

   **Cause:** `closePop()` itself calls `showDay(null)`. That calls `settlePick.current()`, which is `cancelPick`; for a new note, `cancelPick` calls `finishNewNote([])`. `noteGone` suppresses the note box’s blur save, but does not suppress this separate write. The plan’s distinction between `closePop` and `showDay(null)` is therefore false.

   **Exact plan fix:** Specify a dedicated abandon path: suppress note blur, abandon the people picker without `finishNewNote`, synchronously remove its settlement callback, and then close the day and child questions. Clearing React state alone is insufficient before the callback runs. Test new-note words plus unconfirmed people, an existing-note edit, and no additional saved note or Undo entry.

5. **High — A Leave War closer can refuse to close, while the plan removes it from the open-sheet list anyway.**

   **Place:** §3.1 `lwsheet`, §5(6d), KR-2 and D4; [EventSheet.tsx, `typesBack` and `boxDone`](/C:/kr-rt-astra/raptor-port/src/leavewar/ui/EventSheet.tsx:159), `Sheet.tsx`, `MARK` / `OPEN`, and `state/guard.ts`, the proposed `closeWarAll`.

   **Example and failure:** From the Events list, an admin opens Edit presets and types an invalid or duplicate preset name. He presses outside it on a squadron-changing control. That press marks the box as leaving; its blur records the error. `typesBack()` deliberately returns without closing on that first refusal.

   If KR-2 removes the sheet from the list merely because its closer ran, `holdNow()` can report no sheet while the editor remains mounted. The app then changes the war beneath an editor that the guard has stopped tracking.

   **Cause:** “Its own close” is not always an unconditional dismiss operation. The plan equates calling the closer with successful closure.

   **Exact plan fix:** Give this sheet an explicit navigation-discard path that cannot be held open by exit validation. Audit the other sheet closers for the same distinction. Remove a sheet from the registry only when its dismissal is committed. D4 must inspect the actual remaining sheets as well as `holdNow()`, including nested Edit presets and both valid and invalid text.

6. **Medium — The blanket blur saves a plan rename that the plan promises to discard.**

   **Place:** §3.1 `drafts`, §5(6a–c), R12 and D1; [DraftsModal.tsx, `commitName`](/C:/kr-rt-astra/raptor-port/src/ui/DraftsModal.tsx:68).

   **Example and failure:** An admin has “Backup” half typed over a saved plan name. A door reaches the closing helper with that input still focused—the situation §5(6b) explicitly handles. The helper blurs it before running the Drafts closer. `commitName()` saves the rename and adds its history entry. Clearing `nm` afterwards cannot undo that. An invalid name can instead produce a warning, despite the promised silent discard.

   **Cause:** Drafts is missing from the pre-blur suppression phase. Its input has `onBlur={commitName}`.

   **Exact plan fix:** Add a synchronous discard/suppress-blur operation for Drafts before the general blur. Do not rely on an uncommitted `setNm(null)` alone. Test valid and invalid names, unchanged saved name and history, and no warning. Verify actual focus ordering in the browser.

7. **Medium — An ordinary Tracker prompt prevents the retained chart question from appearing.**

   **Place:** §5 steps 4–6 and D6; [core.js, `onBeforeTrackerSwitch`](/C:/kr-rt-astra/raptor-port/src/tracker/app/core.js:132), `addModule`, and `tracker/role.js`.

   **Example and failure:** An admin moves a chart event without saving, then opens Add event’s name prompt. He presses the member-view switch using the top bar. The ordinary prompt is still open when the door asks about unsaved chart edits.

   `onBeforeTrackerSwitch.ask()` immediately returns false whenever `dlg` exists. The switch silently stops; the approved Save / Discard / Stay question never appears.

   **Cause:** The plan closes ordinary dialogs only at step 6, but this check stops at step 4. Its special handling of an existing `trkask` does not cover an ordinary `dlg`.

   **Exact plan fix:** Specify arbitration between an ordinary prompt and the chart question before implementing the door order. The ordinary job must be safely suspended or cancelled, using the job distinction in finding 2. The chart question must appear, and Stay must satisfy the plan’s preservation promise. Add dirty-chart-plus-Add-event tests for pick and both role-switch directions.

8. **Medium — Open, unchanged Admin forms are deliberately left behind.**

   **Place:** §§3.1, 7.3, 10 and R9; [SquadronsPanel.tsx, `NewSquadron` and `PlaceEditor`](/C:/kr-rt-astra/raptor-port/src/ui/SquadronsPanel.tsx:96), `UsersPanel.tsx`, and `ui/guard.ts`.

   **Example and failure:** A master admin opens a blank “+ New squadron” form, changes nothing, then picks another squadron. The form’s report is false because nothing differs. The proposed closer never sees it, so it remains open. An unchanged place editor has the same problem.

   **Cause:** A predicate designed to answer “does this form contain changed work?” is being reused to answer “is this form open?”. R9 expressly preserves that mismatch. The supplied D2825 instruction says what is open closes.

   **Exact plan fix:** Separate open state from changed state. Register closers whenever these forms or rows are open, including unchanged forms and forms in hidden Admin sections. Retain the changed predicate only where interim compatibility needs it. This is not a product choice to leave to chat 205.

9. **Medium — The proposed checker rejects windows that the successful door is supposed to open.**

   **Place:** §7.2, D1 and KR-8; [entry-checker.ts, `makeEntryChecker`](/C:/kr-rt-astra/raptor-port/src/testing/entry-checker.ts:57), `topstate.ts`, `openNotice` / `openInputOnPage`.

   **Example and failure:** An admin presses another squadron’s Input bell line. The old window closes, the squadron changes, and `openInputOnPage()` opens the line’s intended Input window. At the end of the turn, a counted window is correctly open. The proposed checker reports failure. A holiday line correctly opening the OIL list has the same problem.

   **Cause:** “Nothing open at the end of the entry’s turn” confuses old work that must close with the destination that the press intentionally opens.

   **Exact plan fix:** Check old-work closure immediately before entry, or track old window instances through the transition. Permit the destination window without broadly exempting its window family. Keep the separate “nothing opens behind a refusal” check. Test both a legitimate newly opened Input and an old Input whose closer was omitted; do not weaken the existing destination-opening assertions to satisfy the new checker.

10. **Medium — The sub-step order does not support its promise of unchanged behaviour and green checks.**

   **Place:** KR-1, KR-3, KR-7/8 and §14 risk 9; [guard.ts, `rowRefuses` and `closeShown`](/C:/kr-rt-astra/raptor-port/src/ui/guard.ts:301).

   **Example and failure:** After KR-1 converts an Input row to `drops`, an admin presses a pick while it is open. The existing `rowRefuses()` does not recognise `drops`; the existing door still calls `closeShown()`, which does not close it. The press can therefore pass with the Input still open before KR-4 supplies its new closer.

   **Cause:** The compatibility mechanism is introduced in KR-3, after the row-kind conversion. KR-1’s “no behaviour change” and “A-tests stay green” are not supported by the specified edits. There is also a contradictory integration boundary: §11 says after KR-8; risk 9 says after KR-7.

   **Exact plan fix:** Introduce compatibility before changing row kinds, or leave old blocking classifications intact until each door is converted. Convert a door, its closure assertions and its checker coverage together. State one integration boundary, and require later behaviour changes such as KR-12 to receive their own finished-code review rather than relying solely on reads scheduled after KR-7.

The three owner questions need these changes:

- **Q1 — Retry-note endings:** The recommendation is sound. The owner can approve the new wording and its presentation. The failed-save protection itself is already settled; do not present that as undecided. Silence is the current gap, not evidence that these doors are exempt from the retained protection.

- **Q2 — A window held since midnight:** This is a reasonable question about an explicit exception to D2825, because D2654 E5 previously preserved the window. The recommendation’s reason is wrong, however: midnight was involuntary; the **next pick is deliberate**. Picking 142 and picking 150 are also different outcomes. Returning to 142 can restore editing; picking 150 cannot make 142’s work live under 150. Put those outcomes separately, including the existing held band. My recommendation is that the next deliberate door follows close-and-drop unless the owner expressly retains this exception. Do not ship an interim refusal as the completed D2825 behaviour.

- **Q3 — A holiday promised to be kept:** This is genuinely his decision because the app has accepted a Save and promised to finish it later. Protecting that request is sensible. Calling it “Not saved” is a new exception, however: this is a missing prerequisite, not a failed persistence save, and Retry does not resolve it. Explain that distinction and include changed holidays from finding 3. If he wants both the keeping promise and unrestricted navigation, preserving the pending request independently of the open form is a further implementation option; it is not the proposed small closer change.

**One owner question is missing: do the Leave War’s keep-on-close drafts remain an exception?**

The relevant places are §3.1 `lwsheet`, R1/R3, and `BidPicker.closeKeeping`, `ClosedNoteSheet.closeKeeping` and `SelectSheet.keepWords`. The code explicitly describes some of these words as **typed and not yet saved**. For example, an admin types new remarks over selected days containing saved bids, then picks another squadron. The proposed close writes those new remarks onto the saved entries, potentially replacing existing remarks; it does not merely preserve an already-saved change.

D1339 supports the earlier keep-words behaviour, so this is a real ruling conflict to resolve. The plan must not settle it by calling all those words “saved things”. Ask whether these pending edits are retained under the older rule or discarded under D2825. If discarded, suppress blur saves and `BidPicker`’s unmount save too. Already saved bids, remarks and attached documents must remain intact either way.

Where I found nothing wrong:

- I found **no entirely omitted top-level door** among the named pick, role switch, bell, page, OIL-card and Undo routes. The gaps are within their preparation and closing paths.
- I found no saved-record deletion in the proposed ordinary Input Cancel, Sort all cancellation or medical-question cancellation.
- Closing the OIL list without using Later correctly avoids treating navigation as a signature. Cancelling the pending OIL question should not perform the proposed swap.
- Preserving already saved calendar classifications, template edits, draft leave periods and document records is correct.
- Keeping show-only closure, Logic/Quals mode ending, the failed-save protection and the Tracker chart question is consistent with the supplied instruction.
- Repointing useful tests instead of deleting them is the right approach. The fixes above concern what those tests must prove.
- None of these findings depends solely on old demo data.

Rulings: None made in this read-only review.

