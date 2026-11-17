Three HIGH findings need resolution before this design is built. This was a read-only design review, checked against the existing code. No tests or browser walk were run.

1. **HIGH — Two publications can preserve different OIL rules for the same person and date**

   **Failure.** Saber belongs to 142. For Saturday 28 November, 149 publishes his work from 09:00–12:00, keeping 142’s six-hour full-day threshold. Later, 142 changes that threshold to eight hours and publishes his afternoon work from 12:00–16:00.

   Q1 combines those latest publications into one seven-hour day. F23 preserves six hours in one publication and eight in the other. The same work therefore supports either a full-day or half-day credit. The design does not say which preserved value governs.

   **Cause.** Q1 correctly establishes one credit per person and date, but F23 preserves the deciding settings separately in every contributing publication. Naming the person’s home squadron does not resolve two different versions of that squadron’s settings. This is a remaining fault in the proposed fix, beyond the earlier question about whose settings apply.

   **Recommendation.**
   - Keep one agreed set of OIL settings for each person and earning date.
   - The first contributing publication establishes that set. Later publications update the contributing work and reuse those settings.
   - Changing that date’s settings requires an explicit home-scheduler publication of a revised OIL calculation. Show the previous and replacement credit, retain both calculations, and identify the contributing issues.
   - Amend F23 to distinguish the settings used to measure each source’s work from the single policy deciding the combined credit.

   **Other choice.** Let the latest contributing publication replace the policy for the whole person-day. That is simpler, but the Publish card must disclose that it can change credit for work already issued elsewhere. F23’s promise would need narrowing accordingly.

   **Checked today.** `raptor-port/src/leavewar/sync.ts`, particularly `desiredOilCells`, currently relies on one issued settings block per date. `raptor-port/src/engine/oilev.ts` measures issued work using its kept settings; `raptor-port/src/engine/publish.ts` detects changes to those settings. Those existing rules do not select between two independently preserved policies.

2. **HIGH — A delayed transfer has no consistent effective date**

   **Failure.** Rune’s transfer from 142 to 149 is set for 1 December. On that date he is 142’s last administrator, so Q7 holds the transfer. Another administrator becomes available on 3 December.

   F13 describes Rune as belonging to 149 from 1 December. Q7 and D306 require the held transfer to do nothing until it can complete. Following the first rule changes his squadron while the transfer is held; following the second leaves him in 142. Applying the original date when it finally runs would then change ownership of 1–2 December retrospectively.

   Q7 also removes cancellation after the planned date, even though this transfer has not happened.

   **Cause.** F13 supplies dated membership, while Q7 and D2147 allow execution to wait. The design does not distinguish the requested date from the date the move actually takes effect. D306’s “waits, whole” cannot coexist with an independently effective destination stint.

   **Recommendation.**
   - Store the requested date separately from the completed transfer’s effective date.
   - While held, keep Rune wholly in 142: membership, permissions, leave administration and OIL policy must agree.
   - Show “Transfer to 149 waiting” with the reason. Future planning may show the intended move, clearly marked as provisional.
   - When the hold clears, use that home date as the effective date, recheck the affected work, and move membership and permissions together. Preserve the earlier days.
   - Allow cancellation while the transfer remains uncompleted, including after its requested date. “No Undo” starts after completion.

   **Other choice.** Keep the requested date compulsory. If it cannot run then, mark the transfer unsuccessful and require a new future date. This avoids an automatic late move but requires another action.

   **Checked today.** `raptor-port/src/leavewar/sync.ts`, particularly `poHeldReason` and `runPoOutcomes`, checks the hold again when carrying out a posting and leaves a held outcome unapplied. That confirms D306’s existing behaviour; it does not answer the new membership-date question.

3. **HIGH — Close can clear a detachment day that has already started overseas**

   **Failure.** Home is four hours behind the detachment. Ace presses Close at 21:30 home time on 23 July. At the detachment it is already 01:30 on 24 July, and Hawk is flying a published 24 July line.

   F12 uses home’s date for Close. F16 clears every published day after that date, including 24 July. The clearing amendment would therefore remove a flight already underway and withdraw its OIL contribution. F15’s protection for “the closing day” protects 23 July, not the local day being flown.

   **Cause.** F12 combines home-date actions with locally timed schedules. F15 and F16 then use “today” as the dividing line between retained work and cancelled future work. The earlier recommendation resolves disagreement between devices but does not make that dividing line safe when the detachment is ahead of home.

   If schedule dates are instead intended to mean home dates even overseas, that must be stated and displayed: a local clock time alone does not identify the intended local day.

   **Recommendation.**
   - Give the detachment’s schedule dates an explicit local meaning.
   - Before Close, determine which local schedule days have already begun and retain them, including their overnight work.
   - Clear only subsequent detachment days.
   - Work out the home-return date after the retained work ends, using the next whole home day so the one-place-per-day rule remains intact.
   - Show both dates on the card: the last retained detachment day and the first day available at home. Save those dates with the closure.

   **Other choice.** Keep the fixed home-date cutoff, but refuse Close whenever it would clear a local schedule day already begun. Explain when Close can safely be tried again.

   This is a contradiction in the proposed date rules; it is not a claim about built multi-squadron code.

## Questions the design never answers

- **Does F19’s “never pending” exempt only the foreign row?** Recommend yes: a changed home ALL AVAIL membership must still raise its own pending change under D44/D45, preserving the issued membership and OIL until the home amendment.
- **Who may change a syllabus used by both squadrons?** Recommend requiring authority for both before a shared edit can remove either’s marks; R10’s course ownership alone cannot contain the all-course deletion in `raptor-port/src/tracker/app/core.js`. This needs an explicit narrowing of D121 while preserving D474’s shared syllabus.
- **Does F24 also prohibit Unpublish of a Close amendment?** Recommend yes: `raptor-port/src/engine/publish.ts` makes the previous issue current again when an amendment is withdrawn, which could restore the cancelled programme and its OIL without reopening the detachment.
- **Does F20’s borrowed-line view include the applicable wave reporting instructions?** Recommend including its in-time, rally and other instructions needed to attend, with the source issue identified and a direct opening from the bell and automatic home row.

Rulings: none this session. No files changed.