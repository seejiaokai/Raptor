# The reshape plan's red team — Astra's report (blind; copy at `dc1368c27`)

Reader: GPT-6 Astra (D1770, D2210), run by chat 124 as `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only --skip-git-repo-check` on its own exported copy, brief `2026-11-20-multi-sqn-b1-reshape-read-brief.md`; blind to Fable and the fresh Opus reader; started 17:10:59, ended 17:23:13, exit 0 — **finished whole, not stopped**. Its last message as returned:

---

**The plan needs revision before building. I found six HIGH issues and one MEDIUM issue.** These are source-traced plan findings; I did not run tests or a browser.

1. **HIGH — the move exception could change unrelated rights (§4.2, rule 3).**

   A plain admin makes an otherwise permitted move of Ranger. In the same command, a crafted change ends another person’s third-squadron right, naming Ranger’s move as its reason. The proposed exception checks that the command contains the referenced move; it does not explicitly require the right’s account to belong to Ranger.

   Similarly, a genuine take-back could reopen a third-squadron View right as Plan. Merely calling this a reopening does not constrain the fields changed.

   **Change the plan:** require the right’s account to name the person being moved, and verify the exact transition. Ending preserves the account, squadron, level and original start date; reopening restores precisely the right that move ended. Only the permitted end-date and move-reference changes qualify. Test unrelated people, changed levels, substituted accounts and forged move references alongside honest Undo and Redo.

2. **HIGH — preserving Undo across the midnight switch can write into the new squadron (§3.2 A-iv).**

   Hunter changes a Leave War setting in 142. Another admin arranges his move to 149. At midnight the proposed switch loads 149 while retaining Hunter’s Undo list. Pressing Undo can apply 142’s old setting to 149.

   The plan says old steps already wait in their squadron. That is true only for changes whose identities name a squadron. Loaded Leave War and Tracker changes do not. Undo treats these as eligible everywhere, and the Leave War restore writer applies them to whichever world is loaded. Reinitialising the war’s local history does not clear or relocate those global steps.

   **Change the plan:** establish squadron identity throughout change capture, revision checks, Undo selection and restoration **before enabling the switch**. Eligibility must follow the relevant page’s world, which can differ from the schedule picked. Test both Undo and Redo across midnight and manual switches, with identical record names in both worlds. Preserve D148’s history rather than clearing it as a shortcut.

3. **HIGH — the proposed roster dates are overwritten or saved as actual postings (§6.2, A1/A7).**

   Ranger already has a saved joining window in 142, with no leaving date. An admin saves his move to 149. The plan’s new roster projection supplies the move boundary, but the existing saved-window overlay replaces it. His old war can therefore continue counting him after the move.

   The opposite path also breaks: where no saved window exists, the existing roster installer captures supplied joining/leaving dates into the saved posting records. A boundary derived from a squadron move becomes an actual stored posting window. Taking the move back can leave that false window behind.

   **Change the plan:** calculate availability from the intersection of home-squadron stints and actual posting windows. Keep derived squadron boundaries separate from saved posting instructions. Update both roster installation and reprojection, including their retained-person paths. Test saved joining windows, SANS, two separate stints, cancellation and Undo. Adding the final day-permission check alone does not correct the displayed counts.

4. **HIGH — the foreign posting pass still fails its permission check (§6.2, A5).**

   Kestrel schedules Osprey’s overseas posting in 149. On its due date only Saber opens 142. The proposed pass finds 149’s saved posting and attempts its archive and account suspension, but the current posting check recognises only posting records from the loaded war.

   It also verifies the saved posting through a loaded-world probe and compares the posted person’s home with that loaded world. Foreign profile changes do not establish an authorised posting in this check. Osprey’s archive/account changes are consequently refused: A5 survives.

   **Change the plan:** carry the posting’s squadron and person together through discovery, saved-record verification, allowed effects, completion marks and bell recipients. Extend the posting check and its probe explicitly; the planned war-day check is a different check. Test loaded and foreign postings together, later loading of the foreign war, repeated runs, and complete rollback after a refused write.

5. **HIGH — deleting someone from another squadron’s planning calendar lacks both a writer and permission (§6.2, B1).**

   The master deletes Osprey with 142 open while Osprey remains on a future 149 planning note. The proposed cleanup finds the note, but the existing planning writer refuses records outside the squadron in view.

   There is a second failure for an ordinary admin: Ranger moves from 149 to 142, retaining a future 149 note, and 142’s admin deletes him. The plan claims the person-delete permission also permits the calendar cleanup. It does not: the separate squadron-record check still requires rights in 149.

   **Change the plan:** provide a transaction-aware planning writer for a named squadron, covering stored notes and the session’s cached calendars. Add a narrowly verified permission exception for removing the deleted person from future notes, preserving every unrelated field and person. Include rollback of cached changes. Test the master’s case, an ordinary admin’s case, refusal, reload and subsequent editing of the cleaned note.

6. **HIGH — own-page settings are corrected, but the Inputs calendar still follows the other squadron (§3.2 A-ii; B4 family).**

   A 142 member with View of 149 picks 149. The proposed helpers keep his Inputs rows and settings on 142, but calendar planning notes and day titles still come from the shared arrays that the schedule switch replaces with 149’s.

   A 142 admin in the same position also loses the ability to edit his own calendar: its write permission still asks about the picked schedule.

   The missing chain is the calendar’s note/title readers, mutation permissions, change capture, storage and Undo—not another setting reader.

   **Change the plan:** give calendar reads and writes an explicit owning squadron throughout that chain. Share this work with finding 5’s planning writer. Test member and ordinary-admin View access, then master and Plan access, checking displayed notes, edited notes, saved destinations and Undo.

7. **MEDIUM — closing an open war window at midnight is an unspecified visible change (§14.7).**

   Someone is typing in a Leave War window when the move takes effect. The fallback says to close the window as sign-out does, but does not define whether the typed work is preserved, refused or discarded.

   This exceeds §11’s claim that A2 introduces no new visible behavior.

   **Change the plan:** define what happens to unsaved work and show that transition to the owner before building it. The switch must neither silently discard typing nor save an old-world draft into the new world. Include the open-window case in the drawing and browser walk.

The caller audit covered these paths, grouped by the question each answers:

| Family | Bodies checked and plan coverage |
|---|---|
| Person’s squadron on a date | Current and before-change home lookup; roster membership and record lists; session home; free-person lists; frozen and unpublished rosters; signing lists; draft and reassignment pickers; Inputs filters. The named date conversions cover the identified schedule callers. |
| Input’s squadron | Day membership, first-day ownership, span membership, list selection, permission calculation, filer recipients, move/span helpers, schedule landing and holder reconciliation. The proposed shared calculation addresses these; calendar notes remain outside it—finding 6. |
| Rights and last admin | Grant lookup, effective level, account references, deletion/relink checks, bell eligibility, restore redating; account, posting, move, archive/delete and final last-admin checks. The main missing constraint is finding 1. |
| World switching and Undo | Session entry, notification refresh, war swap, Tracker binding, Undo eligibility, revision identity and restore targets. Finding 2 is the missing prerequisite. |
| War and deletion | Roster projection, saved-window overlay, retained rows, posting discovery, saved-posting probe, outcome check, held note, bell, planning cleanup, cache and planning writer. Findings 3–5 identify the omitted or incompatible bodies. |

**Order and safer cut:** retain one owner for the shared permission and account work. Add a prerequisite stage for squadron-aware Undo and planning transactions. Then build the complete foreign-posting path—including its final check—before enabling its caller. Build the roster/date intersection with the war-day check as one tested change.

The advertised file split does not expose those dependencies. The fixes also expand ownership into shared restore, planning and war-store code; assign those explicitly instead of leaving helpers to discover overlapping work. The cost is less parallel work initially and a broader foundation change, but it avoids building callers on incomplete guarantees.

**Explicit negatives:** I checked the proposed last-admin date boundaries and found no additional omission beyond the rights constraints above. I found no additional plan gap in the named free-person/frozen-roster changes, mission-role identity fix, refusal-stamp comparison, template-hole guard or own-squadron holiday direction. Keeping OIL and absence reconciliation on war load has a stated rationale; I found no separate failure in that choice. I did not reopen the deliberately held items, demo-only stored-data problems or later batches.

A1’s drawing requirement is correctly identified. The four owner questions remain explicitly conditional; I have not treated their unanswered outcomes as closed faults.

No files were changed, committed or pushed. I did not read the other reshape reports. No pasted post-compaction handoff was supplied or relied on.

**Rulings: none.** Read-only review; the host records the result.