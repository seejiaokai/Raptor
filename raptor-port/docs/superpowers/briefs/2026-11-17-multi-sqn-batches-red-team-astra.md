Astra — red team of the batch plan at commit 4a33e6930, read-only.

**Verdict: revise before building batch 1.** Five HIGH findings and one MEDIUM finding. The recommended order is reasonable, but the foundation needs stronger separation between the schedule being viewed and each squadron’s records.

1. **HIGH — Separate courses do not make separate Trackers.**  
   **Plan:** §3.4, Tracker.

   **Failure:** 142 and 149 each use the same built-in syllabus. Someone in 142 deletes a ball and saves the chart. Under the proposed course filtering, 149’s chart changes too, and its students’ marks for that ball can be deleted.

   **Cause:** The current Tracker keeps syllabus definitions, layouts, ball details, catalogue and flex settings globally. Saving a deleted ball scans stored courses beyond the visible course list. Adding a squadron to each course and filtering the people bridge does not constrain those operations. This contradicts the agreed separate Trackers, with charts shared only within each squadron.

   **Exact plan fix:** Expand batch 1 to separate the entire Tracker world by squadron, including chart records, destructive sweeps, Import, Export, command permissions and Undo identities. Reload that world when signing into a different home squadron; initialization currently happens once and retains loaded records across sign-outs. Prove that deleting a ball, importing a chart and changing flex settings in 142 leave 149 unchanged, including after signing out and back in.

2. **HIGH — Switching the viewed schedule can withdraw home-squadron OIL.**  
   **Plan:** §3.4, swapped schedule world and home Leave War.

   **Failure:** A 142 admin publishes Saturday and earns OIL, then views 149’s unpublished schedule for the same week. The Leave War remains 142’s, but the current earned-leave pass reads the schedule in view. Its reverse pass removes automatic credits absent from that reading. Viewing another squadron can therefore remove earned leave without any publication.

   **Cause:** The proposed architecture swaps the schedule’s live records while leaving the home Leave War active. The existing OIL pass runs on schedule notifications and combines the loaded schedule with the week stash. It assumes those sources belong to the same squadron as the war it updates. Changing stored keys does not remove that assumption.

   **Exact plan fix:** Give the earned-leave pass explicit access to the relevant squadron’s published records, independently of the viewed schedule. Its reverse sweep must cover only the records for which that calculation is authoritative. Calendar and holiday answers must also name their squadron. Put this in batch 1, with a test that repeatedly switches between two same-date schedules without changing either squadron’s credits.

3. **HIGH — Filtering people does not stop the other squadron’s inputs landing.**  
   **Plan:** §3.4, community records and the reader-classification task.

   **Failure:** A 149 member files a Training input on Tuesday. A 142 scheduler opens that week. The existing landing pass matches inputs by date and can place the 149 input on 142’s Ground Programme. A placeholder input can then involve 142’s people as well.

   **Cause:** The plan audits readers of the people list, but keeps all inputs together without specifying equivalent boundaries for their readers. The current schedule overlay loops over the entire input list. Loading a week also clears and rebuilds landing marks across that list. These operations are not roster listings, so the proposed people-reader guard does not protect them.

   **Exact plan fix:** Add an explicit batch-1 inventory of input readers and writers: list/calendar views, schedule landing, published fingerprints, placeholders, notices and Leave War absence projection. Each query must identify the target squadron and date. Keep one authoritative input record, but make its relevance to a schedule explicit; do not temporarily replace the shared list. Test a newly filed 149 input through switching, publishing and reloading, proving it never lands on 142’s day.

4. **HIGH — Separate storage keys alone leave saves and Undo sharing identities.**  
   **Plan:** §3.4, week/settings keys and per-unit Undo.

   **Failure:** Both squadrons change Logic or the same Monday’s schedule. If only the storage adapter adds the squadron, their changes still share identities inside the change-and-Undo mechanism. One squadron’s edit can block or misdirect the other’s Undo. If the proposed prefixed setting name is instead passed directly to today’s settings writer, it is unrecognized and takes the raw-write path outside the named settings command.

   **Cause:** Current settings registration recognizes fixed, unqualified names. Schedule records and Undo context identify a week by its date alone. Week hydration also decodes dates by replacing every hyphen, which is unsafe for an opaque squadron identifier containing hyphens. The plan specifies new physical keys without specifying their end-to-end identity.

   **Exact plan fix:** Before the swap is built, define one encoding for squadron plus record identity, with the calendar date kept separate. Carry it through change records, permissions, revisions, stash, hydration, persistence and Undo navigation. Keep one command stream; per-squadron Undo lists should select whole actions from that stream, including actions affecting several squads, rather than become separate snapshot stacks. Require same-date edits, reload, rollback and Undo tests across both squadrons.

5. **HIGH — Batch 2 opens detachments before all their calculations are delivered.**  
   **Plan:** §§4, 5 and 7.

   **Failure:** A man works part of his week at home and part on detachment. Batch 2 labels him “249”, but explicitly postpones his combined weekly hours until batch 5. His displayed weekly total can therefore omit part of his work through several live batches.

   The agreed checks following a person across places are also not completely allocated: batch 2 names crew rest, but does not explicitly assign days in a row, the long day or the detachment’s last-day travel boundary. Giving each calculation its home squadron’s settings in batch 3 does not itself make it read work across schedules.

   Batch 2 also permits a 142 man to join 149’s detachment. His OIL must reach 142’s record under 142’s rules immediately; this cannot depend on borrowing arriving in batch 3.

   **Exact plan fix:** Move combined weekly hours into batch 2. Explicitly assign all agreed checks across places there, including the last-day boundary. Include the minimum cross-squadron OIL routing needed for someone on another squadron’s detachment, building on finding 2’s foundation. Keep batch 5 for combined verification, rather than calculations needed by an already usable feature. Test home → detachment → home, and a 142 man on 149’s detachment.

6. **MEDIUM — Batch 2 contradicts the agreed separate DET records.**  
   **Plan:** §4.

   **Failure:** “+ Put people on it” files one DET holding all six people. When Spur’s return date changes, the shared input’s dates change for everyone, sending the other five home too.

   **Cause:** The batch says “one DET input for all” while also including round 7’s R18. R18 expressly replaced that arrangement with a separate DET for each person, grouped visually.

   **Exact plan fix:** Replace that sentence with: one action creates one DET per person, grouped on the People list; changing one person changes only that person. Include the agreed skip-and-name behavior for someone already holding a DET on those dates. Test one early return while the other five remain away.

The borrowing-before-transfer swap is supported: transfers deliberately retain old lines as borrowed work, so that behavior must exist first. Moving Tracker separation into batch 1 is also correct. I found no need to change the fixed legacy storage prefix itself; the owning squadron can sit inside the stored identifier.

The safer foundation keeps one rendered schedule and the existing shared change mechanism, while making off-screen reads explicitly ask for a squadron’s records. Its cost is a wider batch-1 change to existing readers, record mapping and Tracker loading. It avoids separate copies of the engine and does not require the database.

Checks: static tracing of the requested plan, agreed design and current code. No tests or browser walk run. No files changed, committed or pushed. The other reader’s report was not opened.

Walk: not applicable to this read-only plan review.  
Rulings: none this session.

