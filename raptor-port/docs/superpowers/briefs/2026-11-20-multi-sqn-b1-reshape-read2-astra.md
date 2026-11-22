# The reshape plan's red team, round 2 — Astra's report (blind; copy at `f70594194`)

Reader: GPT-6 Astra (D1770, D2210), run by chat 125 as `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only --skip-git-repo-check` on its own exported copy holding no reader's report, brief `2026-11-20-multi-sqn-b1-reshape-read2-brief.md`; blind to Fable and the fresh Opus reader; started 18:12:38, ended 18:24:36, exit 0 — **finished whole, not stopped**. Its last message as returned:

---

**REVISE before build.** Six HIGH findings and one MEDIUM remain. The revision resolves several round-1 objections, but does not yet close the rights, Undo, posting-retry and picker families.

I reviewed the supplied exported folder. Its exact export revision was not independently verifiable. No other round-2 reader’s report was consulted, and no post-compaction handoff was used.

1. **HIGH — Undo of a re-link can reactivate rights already ended by a move.**  
   **Plan:** §4.3, §4.4; round-1 Fable F12.

   Ranger holds View of 150. His move ends it. A master then re-links his account to another person, removing that ended right as proposed. Both people subsequently move squadron. The master now undoes the re-link.

   The unchanged restore rules date both the restored right and the restored account link to today. The new reading rule consequently finds no move after their effective start: Ranger regains View of 150 without anyone deliberately granting it again.

   The rule that a re-link must leave no ended rights does not catch this: the restored right now appears active. This breaks D2203. A same-day Undo also needs an explicit treatment of the dormant rows it restores, rather than an unexplained collision with that cleanup rule.

   **Exact plan change:** distinguish cleanup of an already-ended right from deliberate removal of an active right. Define restoration of the account and its rights together, preserving the former’s ended status through repeated Undo/Redo. Withdraw the instruction to leave all restore-date rules unchanged. Test immediate Undo, either person moving, both moving, and repeated Undo/Redo; retain the existing retired-bell-line protections.

2. **HIGH — The new calendar writer gives one saved note two identities.**  
   **Plan:** §3.2 A-ii/A-v, §6.2 B1; round-1 Fable F5, Astra 5/6, Opus M5.

   A home-squadron calendar edited while another schedule is selected uses the proposed foreign-calendar collection. Once that squadron is selected, the ordinary calendar writer edits the same saved note through its existing collection.

   Undo’s revisions and conflict checks therefore treat those edits as different records. An older Undo can miss a newer change to the very same note. Moreover, the proposed foreign writer updates storage and discards the cached copy, but does not update the displayed calendar if that squadron is now loaded. Undo can leave the screen stale, allowing a subsequent save to overwrite the restored result.

   **Exact plan change:** give each calendar note/title one identity throughout capture, conflict checking, persistence and restoration. Route that identity to the loaded calendar or stored calendar as appropriate, with rollback covering both. Test foreign edit → load that squadron → newer edit → Undo, and foreign edit → load → Undo/Redo → reload.

3. **HIGH — Squadron stamps do not isolate Undo’s conflict tracking.**  
   **Plan:** §3.2 A-v, §15; round-1 Fable F2, Astra 2, Opus L2.

   A master changes 142’s Leave War settings, changes 149’s settings, then returns to 142 and presses Undo. The proposed world stamp permits the 142 step, but the existing conflict checks still see the two settings records as the same thing. Undo demands that the unrelated 149 change be undone first. A background change in 149 can instead create a permanent barrier against the 142 step.

   Capture and restore-location checks prevent writing into the wrong world; they do not separate the identities used by revisions, newer-change checks, background barriers and folded changes.

   **Exact plan change:** carry squadron identity through those mechanisms for every Leave War and Tracker record. Include the command-layer revision owner in the work allocation. Test identical record names in both worlds with later user changes, background changes, Undo and Redo—not just whether restoration selects the correct world.

4. **HIGH — A blocked foreign posting is not retried when its blockage disappears.**  
   **Plan:** §6.2 A5, steps 4–5; round-1 Fable F3, Astra 4, Opus M4.

   At midnight, 149’s last admin’s posting is held. Later, with 142 loaded, the master appoints another 149 admin. No posting record changes, so none of the proposed foreign-pass triggers fires. The posting remains waiting until another qualifying trigger, potentially the following midnight.

   This contradicts D306: it must run by itself once the reason goes. Likewise, deferring work encountered inside another command requires a guaranteed subsequent run; “the next own run” does not schedule one.

   **Exact plan change:** queue a separate, coalesced retry after relevant changes to accounts, people, homes, rights and other blocking conditions. Preserve pending work until that retry completes. Test clearing a last-admin blockage without touching the posting or reopening its war, and work deferred from another command.

5. **HIGH — C6 survives for an input spanning a move.**  
   **Plan:** §3.3 C6.

   Ranger belongs to 142 on the draft’s first day and 149 on its remaining days. A plain 142 admin drafts leave across that interval. The proposed picker checks only the first day and offers Ranger; Save checks every squadron touched and refuses.

   The plan removes “today” but leaves a second answer to the picker’s actual question: whom may this person file this draft for?

   **Exact plan change:** use one whole-draft eligibility calculation at the picker and save door, considering the full interval, saved moves, the actor’s rights and the existing own-input exceptions. Recalculate when either date or the selected people change. Test a span crossing a move and an end date extended across one.

6. **HIGH — A7’s “puts only” rule still rejects legitimate removals.**  
   **Plan:** §6.2 A7; round-1 Opus L3.

   A Leave War day can contain several entries in one saved cell. An admin’s Undo removing one entry while retaining another is saved as a replacement of that cell, not deletion of the entire saved record.

   If the man now belongs to another squadron on that date, the proposed rule rejects this replacement. Thus the explicit promise that removing an admin’s own earlier entry remains possible is false for a populated cell.

   **Exact plan change:** judge the contents before and after. Allow removal-only changes that preserve every surviving entry unchanged; reject additions or alterations outside the squadron’s days. Test removal from a two-entry cell as well as removal of its final entry, including verified Undo.

7. **MEDIUM — Re-link permission still differs between the form and final check.**  
   **Plan:** §4.3 reader inventory; round-1 Opus L4.

   An account retains an ended right in another squadron. The revised form counts only active rights and permits an ordinary home admin to attempt a re-link. The deliberately unchanged final check counts every named right and refuses it. Removing the dormant foreign right also retains its squadron-specific permission requirement.

   **Exact plan change:** make one explicit decision about who may perform this cleanup and re-link. Apply it consistently to the form, cleanup writer and final check. If it remains master-only while any foreign right is stored, say so at the form before Save. Test the ordinary-admin and master cases.

**Round-1 recheck and caller audit**

The taken rows concerning Undo, foreign postings, calendar writing, inferred right endings, removal-only war changes and re-link wording remain incomplete for the reasons above.

I found no further counterexample in the remaining taken rows: separate home stints and posting windows; preservation of first-day landing marks; first-admin continuity; whole-squadron creation/removal; midnight waking; the explicit Tracker fallback; dated OIL questions; move re-targeting; history attribution; mandatory dates; master counting; own-page setting writes; and the removal of the move’s broad rights exemption.

The body audit covered:

| Question | Bodies checked against the plan | Result |
|---|---|---|
| Whose squadron, on which day? | Home lookup, roster membership/enumeration, session home, bell move scans, restore move scans, posting-lock dates and history attribution | Explicitly reassigned to dated answers |
| Whose input? | First-day ownership, span ownership, list inclusion, filer/audience calculations, permission checks, landing marks, protected-day signatures, OIL questions and pickers | Picker interval gap remains; first-day writers correctly stay separate |
| Which page’s world? | Schedule selection, own-page settings reads/writes, calendar notes/titles, session entry, war swap, Tracker binding, Undo selection/restoration and conflicts | Calendar identity and conflict gaps remain |
| Which rights/admins hold? | Right lookup, give/remove, bell history, re-link checks, cleanup, account deletion, row validation, last-admin checks and posting preflight | Restore and re-link gaps remain; no additional last-admin counting fault found |
| Who belongs on a war day? | Roster projection, saved-window capture, carry-over/kept-person paths, membership and stint boundaries, manning, availability, day lists, grid posting-sheet routing and save checks | Separate-stint direction is sound; removal check needs correction |
| Which background work runs? | Loaded/foreign posting passes, held reasons, deletion routes, calendar cleanup, notices, stored writes and cache invalidation | Retry and calendar restoration gaps remain |

**Piece B, order and exclusions**

Piece B’s move-day timing is what its recommendation says: existing rights survive until the move takes effect, then end. The basic cut addresses R2–R4 without a cross-squadron grant-write exemption; R5 and K1 have explicit door-and-check work. It is not yet safe under D148/D2203 because of finding 1. I am not reopening Q4.

The declared split resolves the earlier shared-file collisions. Its prerequisites are sensible, but the missing revision/identity work must finish before enabling the midnight swap or calendar callers.

I found no additional fault in retaining loaded-war OIL/absence reconciliation, keeping the named database-stage exclusions, or holding B2 with B7. Retiring the bell’s restore-date machinery may remain deferred; preserving it unchanged despite the new cleanup operation may not.

No additional visible redesign was identified beyond the drawings already required for A1 and the midnight band. Those drawings still require the owner’s agreement.

This was a static plan-and-code review. I read the supplied proof texts; I did not execute tests or browser walks, and changed no files.

Rulings: none this session.