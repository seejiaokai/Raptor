# Sol 6.1's challenge of the plan's second add-on: an input filed for a group - 7 Oct 26

The brief: `2026-10-07-inputs-sans-redesign-plan-group-input-brief.md`. The section: §3.13 of `../plans/2026-10-07-inputs-sans-redesign-plan.md`, as committed in `e84cfe4f`. Run read-only through the Codex tool (model gpt-6.1-sol, high effort), alone. Its text is as returned, but for the file links, which pointed into this PC's folders and are made relative. What was done with each finding: the plan's section 10.

---

**CHANGES REQUIRED**

1. **A member can forge who filed his own input.**

   **Where:** §3.13, the commit rule’s own-record branch; §3.8’s attribution.

   **Failure:** Member A creates a Meeting for himself with `person=A, by=B`, or changes an existing own record from `by=A` to `by=B`. Branch (a) accepts it because the person remains A. The screen then wrongly names B as the filer; while the setting is on, B gains permission to change or delete A’s record.

   **Cause:** The proposed checks on `by` and `at` apply only to records filed for someone else. Own records remain unrestricted. The existing [permission check](../../../src/state/perms.ts:443) supplies no attribution protection.

   **Exact fix:** Before either ownership branch, require every new user filing to carry the actual saver’s identity and creation time. Preserve both on every ordinary edit, including an edit by the subject. Define separate, trusted handling for exact Undo restoration and the explicitly listed approval/split doors. Add real-command tests for forged creation and changed attribution on **own** records.

2. **The filer can erase another person’s OIL answer without changing the commitment.**

   **Where:** §3.13, “after.oil holds no answer that before.oil did not hold”.

   **Failure:** With the setting on, A files a Saturday Duty for B. B answers Yes, storing `oil[date]=0.5`. A submits an input batch that removes this answer while leaving the person, type, dates and hours unchanged. The proposed rule accepts it: no new answer appeared. The same rule permits erasing B’s explicit No.

   **Cause:** Any removal passes, although the stated exception concerns answers invalidated by the app’s existing edit rule. That [rule](../../../src/ui/inputedit.tsx:1040) preserves a No and clears a positive answer only when the commitment no longer supports it.

   **Exact fix:** Require the other person’s resulting OIL answers to equal the result of applying the existing invalidation rule to the before-record and the permitted edit. Do not accept arbitrary subsets. Test unchanged-hours deletion, deletion of a No, valid hours-driven invalidation, and rollback of the whole group after an illegal answer change.

3. **The promised filer Undo fails at two separate checks.**

   **Where:** §3.13’s unchanged-Undo claim and permission tests.

   **Failure A:** Member A files a Meeting for B and C, then presses Undo. The current [Undo permission check](../../../src/undo/timeline.ts:458) refuses because the records’ owning people are B and C, rather than A. Changing the input commit rule alone cannot fix this.

   **Failure B:** After that check is corrected, let B confirm half-day OIL and let A extend the group’s hours enough to invalidate it. Undo must restore the old hours **and B’s recorded answer**. The proposed input rule rejects that restoration because the answer is absent from the current record. Undoing deletion of an answered record has the same problem.

   **Cause:** Undo still requires subject ownership, and its exact restoration is judged as a fresh attempt to answer someone else’s OIL question.

   **Exact fix:** Explicitly update Undo authorization for the filer’s own recorded input changes, subject to the current setting and kind restrictions. Permit OIL restoration only through a trusted replay of that step’s recorded inverse/forward images, retaining conflict and absence checks; merely naming a command “undo.restore” must grant nothing. Test filing, hours invalidation and deletion through actual Undo/Redo, plus off/on transitions and forged restoration attempts.

4. **An admin adding someone removes the original filer’s ability to edit the whole group.**

   **Where:** §3.13’s per-person attribution, filer permissions and shared editor.

   **Failure:** Member A files one group for B and C. An admin opens it and adds D. The plan preserves `by=A` on B and C but gives D the admin’s `by`. All three still form one entry. A’s next shared date or remarks change fails on D, because A did not file D’s individual record. A therefore loses the whole-group editing right described by D655.

   **Cause:** Per-person creation attribution also determines whole-entry authority. Once additions have different authors, those rules cannot deliver the promised authority.

   **Exact fix:** Define whole-entry filer authority separately from who added each person. For example, carry an immutable original group-filer identity on every constituent record; later additions inherit that authority while retaining truthful individual `by`/`at` stamps. Protect this identity at the commit gate and mirror it in §11. Test an admin adding someone, followed by the original member filer changing and deleting the complete entry.

5. **Group leave introduces a refusal the existing absence rule explicitly removed.**

   **Where:** §3.13, “All or nothing”—“no leave … over recorded work”.

   **Failure:** An admin files group leave for six people. One has overlapping recorded work, with no conflicting leave or medical. The plan refuses all six. Today, filing that leave is allowed: the day is flagged and the filer is told.

   **Cause:** The plan treats a warning as a refusal. The live [absence rule](../../../src/leavewar/inputgate.ts:177) expressly records the owner’s reversal of that refusal.

   **Exact fix:** Remove recorded work from the group’s refusal conditions. Preserve the existing warning and day flag, reporting the affected people together. Keep whole-group rollback for actual refusals, such as overlapping leave or medical. Add both cases to the writer tests.

6. **Changing the people list falsely changes everyone else’s modified date and LATE mark.**

   **Where:** §3.13’s writer and attribution paragraphs.

   **Failure:** A group is filed before its deadline. After the deadline, its filer removes one person without changing any shared field. The specified writer calls the per-record edit body for every person kept. That body always writes today’s modified date, so all remaining people become LATE and acquire new change stamps. Yet the plan expressly says their records remain untouched. Adding someone later has the same problem.

   **Cause:** “Edit each record kept” includes records whose actual fields have not changed. The [current save body](../../../src/ui/inputedit.tsx:1000) stamps those saves unconditionally.

   **Exact fix:** Compute the actual per-record changes after rebasing. Skip the edit body for unchanged survivors; create additions and delete removals only. Stamp survivors when their fields really change. Test addition/removal after the deadline: existing records and stamps remain unchanged, and only a newly added person can become late.

The existing batch and rollback mechanism supports an atomic group writer. Keeping OIL decisions, schedule landings, absence checks and history per person is compatible with the proposed storage shape. The plan also names all three Inputs lists and explicitly discloses the per-person presentation elsewhere.

SANS exclusion and withdrawal of filer rights when the switch is off are stated defaults. The fourth “Personnel” heading departs from D656’s three groups and must remain an explicit proposed exception for the owner, rather than being described as settled.

I read the brief, required rulings, scoped plan/design sections, named live code and specified tests independently. This is a plan review: nothing is built, so runtime behaviour, atomicity and phone presentation remain unverified.

I changed nothing, ran nothing beyond file reads, and read no other reader’s report.

Rulings: none this session.

