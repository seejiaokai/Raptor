# Astra's challenge of the plan's second add-on: an input filed for a group - 7 Oct 26

The brief: `2026-10-07-inputs-sans-redesign-plan-group-input-brief.md`. The section: §3.13 of `../plans/2026-10-07-inputs-sans-redesign-plan.md`, as committed in `e84cfe4f`. Run read-only through the Codex tool (model gpt-6-astra, high effort), alone. Its text is as returned. What was done with each finding: the plan's section 10.

---

CHANGES REQUIRED

1. **The filer can erase another person’s OIL answer without changing the commitment.**

   **Where:** §3.13, commit-gate rule.

   **Failure:** With the setting on, Ranger changes a Meeting he filed for Wisp from `oil: {'2026-10-10': 0}` to no `oil`, leaving every other field unchanged. The proposed rule accepts this: the remaining answers contain no new value. Wisp’s explicit “No” disappears and becomes an unanswered question. The same hole permits removing a positive answer.

   **Why:** “No new answers” does not distinguish legitimate invalidation by changed hours from directly clearing another person’s decision.

   **Exact fix:** Require another person’s answers to remain unchanged except for the precise removals produced by the existing invalidation rules. Check those removals against the actual before-and-after commitment. Add tests refusing direct removal of both zero and positive answers, while allowing the existing legitimate invalidations.

2. **The subject’s permission branch bypasses the protection on who filed the input.**

   **Where:** §3.13, commit-gate alternatives (a) and (b).

   **Failure:** Ranger changes his own Meeting from `person: Ranger, by: Saber, at: originalTime` to `person: Ranger, by: Ranger, at: newTime`. Alternative (a) accepts it because the person remains Ranger. He can likewise create his own input falsely attributed to Saber. This works even with the members’ setting off.

   **Why:** The restrictions on `by` and `at` exist only inside alternative (b). Those fields now determine both displayed attribution and permission.

   **Exact fix:** Validate filing provenance independently of the subject-or-filer permission choice. Ordinary creation must attribute the actual actor; ordinary edits must preserve the original filing identity and time. Specify the trusted exceptions for exact history restoration and system-created records. Extend the proposed forgery tests to **own-record creation and editing**, including with the setting off.

3. **The promised filer Undo and Redo fail at two separate checks.**

   **Where:** §3.13’s unchanged-reader claim and commit-gate rule; the existing `mayReverse` check and restore path.

   **Failure:** Ranger files a Meeting for Wisp and immediately presses Undo. The existing Undo check requires every recorded owner to be Ranger; input ownership is derived from `person`, so Wisp’s record fails before restoration starts.

   Fixing that alone is insufficient. Suppose Wisp has answered a weekend commitment and Ranger changes its hours, legitimately clearing the outdated answer. Undo must restore that answer. The proposed comparison rejects it because the current record no longer contains that answer. Undoing deletion of an answered input has the same problem.

   **Why:** The plan treats ordinary editing permission as sufficient for history reversal, while leaving the earlier owner check unchanged and prohibiting a necessary part of the recorded inverse.

   **Exact fix:** Explicitly include Undo authorization in the change. Preserve the same-actor rule, effective-role restrictions, revision checks and publication barriers; evaluate filer rights using the affected records and current setting. Permit OIL restoration only through a verified recorded inverse or replay—not merely because a command calls itself a restore. Test the actual Undo/Redo route for creation, answered-input deletion and hours changes, plus on/off/on setting changes and another actor’s attempted reversal.

4. **An admin adding someone can remove the original filer’s ability to edit the shared input.**

   **Where:** §3.13, record permissions, group writer and later-addition provenance.

   **Failure:** Ranger files one shared Meeting for Wisp and Ace. Both records have `by: Ranger`. Admin Saber adds a third person; the plan correctly stamps that new record `by: Saber`. Ranger then changes the shared Meeting’s time. The third record fails Ranger’s permission check, so the entire edit is refused.

   A subject turning an admin-filed single input into a group creates the same mixed-filer problem.

   **Why:** The plan promises one filer who controls the entry but stores only the separate records’ actual filers.

   **Exact fix:** Define and protect a stable **group filer**, separately from each person’s actual filing attribution. Establish who becomes group filer when an existing single input becomes a group; preserve that authority when an admin adds people. Apply it consistently to whole-entry editing, deletion, dragging and the commit check. Keep the later addition’s true `by`/`at`. Add tests for both sequences and for removal of the original filer from the participant list.

5. **Splitting and rejoining can create two live records for the same person while displaying only one.**

   **Where:** §3.13, entry definition and “One man, once an entry.”

   **Failure:** An admin files a group for Ranger and Wisp, then changes Wisp’s time through the board. Wisp separates into another entry while retaining the same group ID. The admin adds Wisp to Ranger’s remaining entry, creating a new record. Finally, the admin changes the detached Wisp record back to the original time.

   Both Wisp records now share the group ID and all shared fields. The display hides the duplicate person, while downstream readers still receive two inputs.

   **Why:** The handover refusal protects one operation only. Display deduplication conceals the resulting duplicate without removing its scheduling and OIL effects.

   **Exact fix:** Enforce uniqueness of person within the resulting group-and-shared-fields combination at the write boundary, including additions, ordinary edits and restores. Refuse the operation that creates the collision with a clear reason. Add this complete split/add/rejoin sequence to the writer tests; a pure display-deduplication test is insufficient.

6. **Adding one late participant marks the unchanged participants late too.**

   **Where:** §3.13, writer instruction to edit every retained record; opened-day promise that a later addition can be late alone.

   **Failure:** A group is filed before the deadline. After the deadline, its filer adds Wisp without changing the shared details. The prescribed writer calls the existing edit body for every retained person. That body unconditionally sets `mod` to now, and the late calculation reads `mod`. Everyone becomes late.

   **Why:** Reusing an ordinary edit for unchanged retained records has a visible side effect.

   **Exact fix:** Apply edits only to retained records whose actual commitment fields changed. A membership-only addition or removal must preserve the others’ modification and filing stamps. Add a before-deadline/after-deadline test proving only the new participant becomes late, including Undo and Redo.

7. **The group preflight reintroduces a leave refusal that the live absence rule deliberately removed.**

   **Where:** §3.13, “All or nothing.”

   **Failure:** An admin files group leave. One participant has recorded work that day but no overlapping leave or medical record. The proposed preflight refuses the entire group because it lists recorded work as a blocker.

   **Why:** The live absence check explicitly allows leave over recorded work, returns a warning and flags the conflict. It separates that warning from genuine refusals.

   **Exact fix:** Remove recorded work from the refusal list. Reuse the existing distinction: genuine leave/medical conflicts refuse the whole command; recorded-work conflicts allow filing and return the named warnings. Test both outcomes, including that warnings do not produce a partially filed group.

8. **Switching back to one person can substitute someone the member did not select.**

   **Where:** §3.13, picker: “keeps the first one picked (for a member, himself).”

   **Failure:** With the setting on, Ranger selects Wisp first and Ace second for a Meeting, then switches back to one person. The proposed member exception substitutes Ranger, although Ranger was not selected.

   **Why:** D656’s full row says to retain the first person picked. The parenthetical changes that rule.

   **Exact fix:** Retain the first selected person whenever the current actor may file that type for them. Show that retained person accurately in single-person mode. If a setting or type change makes the selection invalid, require an explicit correction rather than silently substituting the actor. Test this sequence and the intervening-setting-change case.

9. **Two §8 defaults contradict the recorded scope and need an explicit decision.**

   **Where:** §3.13’s permitted kinds and picker; §8’s final paragraph.

   **Failure:** An admin selecting SANS Availability cannot file for several people, although D655’s disclosed reading permits admin group filing for every kind except medical. D620 moves availability to the SANS calendar; it does not prohibit group filing there. Separately, a roster containing ground crew produces four picker headings despite D656’s explicit three-group choice.

   **Why:** These are changes to recorded product choices, not implementation details. The reason given for the SANS restriction—availability being the person’s own word—also does not explain why an admin may file it individually but not for several people.

   **Exact fix:** Replace “Nothing is with him now” with these two precise scope decisions. Obtain an explicit amendment before retaining the SANS exclusion or fourth heading. Otherwise preserve admin group eligibility through the SANS-only filing door and the approved three-heading picker; settle how ground crew remain selectable without silently inventing another heading. Update the corresponding permission and screen tests to the resulting decision.

I checked the brief’s named live material independently. The per-person storage approach fits the existing scheduling, absence and OIL readers. Keeping schedule rows, pending changes and history lines per person is consistent with D655’s disclosed implementation reading. The outer batch with refusal-driven rollback is a sound foundation. The setting’s guarded registration, effective-role treatment and explicit withdrawal of filer rights are also reasonable, subject to the Undo and mid-edit cases above.

The tests proposed in the plan cover the basic paths, but need the concrete combinations listed in these findings. These are conclusions from reading the plan and code; I could not verify built behaviour, rollback execution, browser interaction or phone appearance because nothing is built or run in this review.

**D138: PASS.** I compared the short lines D646–D657 with their full rows. The short lines preserve the operative rulings and the stated supersessions; I found no added or lost condition in those summaries.

I changed nothing, ran nothing, and read no other reader’s report.

Rulings: none.