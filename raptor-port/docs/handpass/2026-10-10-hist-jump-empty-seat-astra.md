# Astra's scenario read of `[HIST-JUMP-EMPTY-SEAT]` — its report, as returned (10 Oct 26)

*The brief it answered: `docs/superpowers/briefs/2026-10-10-hist-jump-empty-seat-scenarios.md`. What the host did with
each finding and each scenario: `docs/handpass/2026-10-10-hist-jump-empty-seat.md` §8. Its finding 4 is not a fault of
the change: it read a source file during the minute the host's break test had one line cut out of it (the sheet's §8).
The text below is unchanged.*

**Three navigation failures remain, plus a wrong line present at my final read.** I changed no files.

This is the requested scenario-design report. The first three failures were demonstrated in isolated checks of the navigation logic; they still need confirmation in the running app. The files changed during this review, so the fourth finding describes the final version I read.

**Failures and exact fixes**

1. **“To go out” can open another detail’s history.**  
   Publish a duty with a main occupant and an extra person, then remove only the extra person. Tapping that removal can mark the main occupant and open that seat’s history. A programme removal can similarly open the row heading’s history.

   **Cause:** these lines offer several possible destinations. The search accepts another seat or the heading before trying the removed seat’s row. It then treats that substitute as the actual changed detail.

   **Fix:** first resolve the seat named by the change. If its seat is absent, use its own row’s fallback before considering secondary destinations. Keep that landing identified as a row fallback: show the empty-seat note when appropriate, mark the row briefly, and open no history bubble. Preserve the separate handling of input changes.

2. **A board showing an older version does not return to the working copy.**  
   Save a plan or publish a day with Ranger present, remove him from the working copy, then look at the older version on the board. Tapping his removal can say “That seat is empty now” while the board still visibly shows Ranger, with no landing mark.

   **Cause:** returning from a version look happens on the week but is skipped on the board. The subsequent search correctly refuses to land inside the frozen version.

   **Fix:** leave the target day’s version look on either surface before drawing and finding the destination. Return to the working copy without loading the old version into it or altering the saved record.

3. **OIL Earn mode hides valid destinations from the history search.**  
   With OIL Earn on, an ordinary person can be visible on a programme, duty, sim or ground row, yet tapping their change says the detail is not shown. An emptied row can produce the empty-seat note without marking its visible row.

   **Cause:** OIL’s person and row-name controls replace the ordinary controls, but the history search does not recognise their destinations.

   **Fix:** give those visible rows and people a read-only history destination and teach the search to recognise it. A history jump must only scroll and mark; it must not toggle anyone’s OIL, enable schedule editing or invent a seat for an expanded crowd.

4. **The final version I read stops before using the row’s name.**  
   The last fallback currently reports no destination after checking the people box and remaining occupants. It never returns the row-name box. This breaks the promised landing on an AMT brief/debrief row, including an occupied place that the board deliberately does not display.

   **Fix:** restore the final lookup and return of the live row-name box, retaining the exclusion of frozen versions. Check both occupied and empty cases. This line changed during the review, so verify that it is restored in the finished version.

**Coverage that the additional walk needs**

| Objects or surface | Visible sign and working gesture |
|---|---|
| Common Programme; duty main and extra people; ground main and extra people | Tap the change to mark the actual seat, or its own people box/remaining people/name when the seat is absent. |
| OFT and AMT fixed seats, passengers, extra people, brief/debrief rows | Preserve the particular seat or passenger position. Where people are deliberately hidden, mark the row name. |
| Flying seats, including SC, AVALON and BB | Mark the same aircraft and seat; a remaining mate may supply the row fallback on View-only Sched. |
| ALL, ALL AVAIL, their crowds, and free-text people | Keep the placeholder/text intact and land on the relevant place or row. A crowd member must not become a fictitious stored seat. |
| Personal Inputs, Unavailable and accepted ground rows | Go to the input’s current standing row and day; unfold Personal Inputs when required. |
| Names, times, remarks and other non-seat details | Land on their own detail. Only give an other-page instruction when that other page actually draws it. |
| Edit Schedule, board, View-only Sched, issued face, working draft, saved-plan/older-issue look, OIL Earn | Use the correct day and live destination while preserving role restrictions and frozen records. |

The entry doors are the top-bar clock, day change count and board History button; within the window, **New to you, All changes, To go out, Item and Who** must agree about the destination. Phone Hide/Show, folded groups, gold dots and an already-open bubble must not obscure or substitute it.

The writers needing coverage are drag, tap-to-place, removal, text entry, row movement, Auto Sort, deletion, input filing and Undo/Redo. Readers include admins and members; members must remain read-only, and guests must gain no changes-window access. Navigation must leave publishing, sign-offs, pending changes, OIL awards and saved versions unchanged.

**Additional scenarios, ranked — none is the ordinary current-Monday walk already reported**

1. **OIL Earn’s alternative controls.**  
   On an eligible day, place and remove people through normal schedule controls, then turn on OIL Earn. Tap both an occupied-place change and an emptied-place change across programme, duty, sim and ground rows. **Expected:** the correct visible place/row is marked without changing OIL. **Disproof:** a visible occupied place produces “not shown”.

2. **Board version look.**  
   Save a plan, publish a day, then remove someone from its working copy. Look at the saved plan and repeat with the older issue; tap the removal. **Expected:** return to the working copy and mark the correct destination. **Disproof:** the older version remains visible after the tap.

3. **Published removal through “To go out”.**  
   Publish a duty with a main occupant and extra person; remove the extra. Repeat with a sole programme occupant, having also changed the programme heading. Tap each pending removal. **Expected:** empty-seat note, row mark, no bubble. **Disproof:** the main occupant’s or heading’s history opens.

4. **AMT brief/debrief with hidden people.**  
   Place someone on the brief/debrief row from Edit Schedule, then inspect their change on the board. Repeat after removing them. **Expected:** mark the row name; say nothing for the occupied place and give the empty-seat note after removal. **Disproof:** the visible row receives no mark.

5. **Member looking at the issued day.**  
   Publish a populated row, remove its occupant from the working copy, then sign in as a member and tap the change from View-only Sched’s issued face. **Expected:** an explained switch to Working draft, correct landing and continued read-only access. **Disproof:** the issued occupant is marked as though it were the current place.

6. **Another day while the board is open.**  
   Make similar changes on two days with identically named rows. Leave the board on the first day and tap the second day’s change from the week-wide list. **Expected:** the second day and its particular row. **Disproof:** the first day’s matching row is marked.

7. **Another day on the phone week.**  
   Make a removal on Sunday, return to Monday, open the week-wide changes window and tap Sunday’s line by touch. Repeat in landscape. **Expected:** Sunday’s target is visible above the collapsed History bar. **Disproof:** the target remains outside the visible area or behind the bar.

8. **Reordering, Auto Sort and parent deletion.**  
   Make a change, drag its row elsewhere, then Auto Sort. Tap its old change after each action. Delete a preceding row, then the target’s whole block, and repeat. **Expected:** follow the same row while it exists; report its deletion afterward. **Disproof:** another row inherits the landing.

9. **Input filing and folded Personal Inputs.**  
   Create a fresh multi-day input through Inputs. Tap its change while Personal Inputs is folded; then accept/file it, change its dates and tap the earlier change again. **Expected:** unfold or navigate to its current standing row on a covered day. **Disproof:** landing on an obsolete retained row or calling the input an empty seat.

10. **Free-text people after a named occupant.**  
    On a row whose people control accepts text, replace a named occupant with free text through that control. Tap the earlier occupant’s change on both surfaces. **Expected:** preserve the text and mark the correct row, with wording consistent with the actual seat state. **Disproof:** a jump to another row or an instruction to use the other page despite the row being visible.

11. **ALL / ALL AVAIL and an open crowd window.**  
    Place a placeholder, open its crowd, remove the placeholder, then tap its change. Refill the same place with the other placeholder and repeat through All changes and To go out. **Expected:** empty-row handling after removal; the current placeholder after refill, with no extra wording. **Disproof:** marking one expanded crowd member as the changed seat.

12. **Remaining mate, no mate and passenger gaps.**  
    In View-only Sched, remove one flying/sim occupant while retaining another, then remove both. Separately remove a middle AMT passenger while keeping later passengers. **Expected:** use the correct remaining people cell where available; never shift the change onto another passenger. **Disproof:** the next passenger is marked as the removed person’s former place.

13. **Details genuinely exclusive to one page.**  
    Edit a Common Programme second line and a standby brief time through their available controls. Tap their changes from both pages; then delete their parent row and repeat. **Expected:** truthful page guidance while the row exists, deletion wording afterward. **Disproof:** reciprocal instructions or other-page guidance for a deleted row.

14. **Gold dots, grouping and an existing bubble.**  
    Open a real detail’s history bubble, then tap an emptied-seat line using Item and Who grouping and, under another member, New to you. On a phone, use Hide/Show between taps. **Expected:** the previous bubble closes; the row gets only the brief landing ring; unrelated gold dots still work. **Disproof:** the old bubble remains attached to the fallback landing.

15. **Undo and Redo after navigation.**  
    Move someone, tap the emptied-place change, Undo, tap again, then Redo and tap again. Repeat with the affected row already visible and then off-screen. **Expected:** Undo/Redo affects the move; each tap follows the current place state, and an already-visible target does not cause unnecessary view movement. **Disproof:** Undo consumes the navigation instead of undoing the move.

**Explicit negatives**

- I found no additional wrong line in the new local inspection helper; it reads the current row position and does not write schedule data.
- I found no fault in the two stated ordinary-page distinctions: the programme second line and standby brief time.
- I found no evidence that a normal same-place replacement needs extra wording. The existing silent landing follows the recorded ruling.
- Row identities are resolved before landing. Reordering alone is not a demonstrated defect; the sequence above tests that protection through real controls.
- I found no new schedule, publication, permission or OIL-award write introduced by the changed navigation.
- None of the findings depends solely on old stored data. Each can arise from fresh actions.

**Walk:** no new running-app walk or full gate run performed. The supplied 44-step result remains the builder’s evidence; isolated checks do not prove screen visibility or touch behaviour.

**Next:**

1. Restore the row-name fallback and reproduce the first three failures through the app.
2. Fix those paths, then complete the ranked additional walk with visible landing and no-bubble checks.

Rulings: none this session.

