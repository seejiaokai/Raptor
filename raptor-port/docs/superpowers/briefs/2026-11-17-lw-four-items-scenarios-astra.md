The scenario review is complete. The main gaps are the less-used opening routes, awards made through different controls, saved changes read back elsewhere, and transitions between editing, selection and ordinary viewing.

These are **proposed failure scenarios, not observed defects or a pass**. I read the current app and compared my independent enumeration with the latest evidence sheet. I ran no tests or browser walkthrough and changed no files.

**Corrections needed before the walk**

- Replace “locked period” with two separate conditions: **bidding dates closed** and **balances locked for members**. The period stages were removed. Closed bidding does not make the whole period read-only; the balance lock still permits admin edits. Sources: D1177, D1225, D1247.
- “Member — figures read only” is incomplete. With balances unlocked, a member edits their own non-OIL balances; everyone else’s remain read-only.
- The rule that the background remains usable applies to particular windows. It must not become the expectation for every overlay. Source: D641 and its narrowing by D642.
- Describe the hover case as **dragging a selection on the Leave War grid**. The sheet still names the scheduler’s different drag state, although its recorded fix already distinguishes them.
- The separate OIL correction editor edits a correction, not an ordinary day of OIL taken.
- OIL is earned leave owed to a person, not money. It still warrants the full checking tier. Source: D25.

**Independent enumeration**

| Change | Renderers, doors, roles and states |
|---|---|
| **Balances** | Separate desktop and phone presentations, both containing editable boxes and read-only figures. The Balances tab is the entry; Settings is not another entry. Cover admin, member’s own row and another person’s row; member balance lock on/off independently of bidding open/closed; LVE and each of CCL, FCL, PL, EL and CL; zero, half-day and larger pending totals; own-row tint; search, Grades, scrolling and phone zoom. Balances and Days taken are separate views. Person names open person windows; OIL figures open the tracker. Returning from those windows is another state of the page. |
| **Hover ring** | The shared person-day drawing reaches every person and month: empty days, single whole-day entries, either half, both halves, multiple whole-day entries, whole-plus-half combinations, larger piles, warnings and joined runs. Include pending, approved and refused entries; Inputs-owned entries; automatic and manually awarded OIL; moved marks; posting boundaries; own and other rows. Cover ordinary hover, selecting, selected, moving, just-added and Rearrange states. Exclude names, balance columns, headings, group rows, Events, Required, Available and other manning rows. Check exposed cells behind windows that allow background use, and distinguish windows that block it. Desktop mouse and phone touch have different promises. |
| **OIL award editor** | One award editor is reused for active, partly used, fully used and expired awards, including Archive and other year lanes. Doors: OIL tab over Grid, Balances or Approvals; a Balances OIL figure; a person window opened from a grid name or LVE figure, a Balances name, or an Approvals name; and My leave → own person → OIL. Balances includes both views. Admin can edit awards; members can read them, including their own award detail. The separate new-credit form, negative correction editor, automatic credits and ordinary OIL taken are boundaries, not additional recipients of the new layout. |
| **New period name** | The shared New leave war window has distinct entrances: the period picker over Grid, Balances and Approvals; “Create the first period” when none exists; a partial-year gap in Calendar → Holidays; and a holiday waiting for coverage of a partial-year gap. The latter doors supply dates and raise the window above the scheduler’s open windows. Cover ordinary versus prefilled dates, automatic versus typed names, emptying, changing dates, overlap refusal, cancellation and reopening. Creation is admin-only; a scheduler is always an admin. |

The writers and readers also need explicit coverage:

- **Balances:** existing balance edits and approval decisions supply the numbers. Read the results in Balances, the person window, My leave, the grid’s LVE figure, Approvals and Days taken where applicable. The new appearance does not extend to all those readers.
- **Awards:** create fresh awards through the tracker’s one-person and multiple-person credit forms, one-day Grant OIL, and dragged-days Grant OIL. Existing awards can also be edited through the day’s list. Read a tracker edit back in its award box and breakdown, the grid’s FO/HO and day details, the member’s own award window, Balances OIL, the person window and My leave. Keep “Given by” separate from who entered it. Include Undo, Redo and reload of records created during the walk.
- **Names:** read a newly created name in the period picker, Days taken heading where shown, Open for bidding heading and out-of-range refusal, Events heading and empty messages, Approvals’ links to other periods with pending bids, a later overlap refusal, and a holiday refusal that names a period boundary.
- **Other period writers:** whole-year creation from Holidays, the waiting holiday’s whole-year button, and the schedule’s missing-period action create a year directly. They do not open the changed Name box. They need a scope check, not an invented requirement to adopt the new naming format.

**What the roll-call lacks**

Some broad rows already mention these subjects. The gaps below are the distinct cases still hidden inside those rows.

| Gap | Missing distinction |
|---|---|
| Balance permissions | Member’s editable own row beside read-only rows; balance lock independent of bidding closure; admin remaining editable while members are locked. |
| Pending tags | Every other-leave kind, different figure widths, actual input access under the corner tag, and intersections with pinned names and headings. |
| Filled-day hover | Joined-run ends and middles, half/whole combinations, piles and different entry families. One generic “filled day” cannot cover their different layering. |
| Hover transitions | What happens after release, cancellation, completion and scrolling—not only while a stronger mark is present. |
| Tracker entrances | The full person-window and My leave routes, both Balances views, and the preserved state of the page underneath. |
| Award varieties and saves | Archive, usage/expiry, different creation routes, empty reasons, multiple awards on one date, actual Save, read-back and reversal. |
| Phone editor access | The latest sizing section mentions opening visibility, but the test scrolls both the award and Delete into view before measuring. That does not establish the untouched opening state or finger access. |
| New-period entrances | Empty-world creation and both partial-gap holiday entrances; separately identify direct whole-year creation. |
| Name orders and readers | Typing before dates, typing the same text as the suggested name, refusal/retry, reopening, same-name distinct periods, and readers beyond the picker and Balances. |

**Ranked failure scenarios**

**D** means desktop with a mouse. **P** means 402px phone with touch. Use both phone engines already chosen in the evidence sheet. A mobile keyboard or physical-device claim needs that environment; browser touch emulation alone does not prove it.

1. **Edit an award outside the convenient active lane — D + P.**  
   **Setup/action:** Create fresh awards that become partly used, fully used and expired; find them in another year and Archive, then open each editor.  
   **EXPECTED:** The same fixed award layout and editable fields apply wherever that award opens; usage and expiry accounting remains correct. Sources: D2155 and the OIL award contract.  
   **Disproof:** A different layout, unreachable controls, the wrong award opening, or an amount change producing an unexplained available balance.

2. **Reach the phone editor before any automatic scrolling — P.**  
   **Setup/action:** Open an award near either horizontal edge and low on the screen. Inspect immediately, then use ordinary finger scrolling, type into reason/given-by, and reach all three action buttons.  
   **EXPECTED:** Record the initial position exactly. Controls must remain reachable; changing amount or arming Delete must not rearrange them. Source: D2155.  
   **Disproof:** A button cannot be reached, a pinned column covers it, a tap lands elsewhere, or the keyboard prevents completing or cancelling the edit. Do not count a test’s automatic scrolling as this proof.

3. **Feed the editor awards from every current creation route — D + P.**  
   **Setup/action:** Make awards through tracker credit, one-day Grant OIL and dragged-days Grant OIL, including a multiple-person grant. Open their tracker editors.  
   **EXPECTED:** All are awards with the same editor. A grid-created award without a reason can remain without one; an award that already has a reason cannot lose it. Source: the “One kind of award” contract, D400–D402.  
   **Disproof:** A route produces an uneditable or differently drawn award, loses its person/date, or applies the wrong reason requirement.

4. **Save one of two awards on the same date — D + P.**  
   **Setup/action:** Give one person two distinct awards on one date, with another entry beside them. Edit just one award’s amount, half, reason and given-by; save and inspect every award reader listed above. Undo, Redo, then reload.  
   **EXPECTED:** Exactly that award changes; its date and original entered-by information remain. The saved amount and half agree everywhere. Sources: D260, D1164, D400–D402, D148.  
   **Disproof:** Its neighbour changes, awards merge, a reader remains stale, attribution changes, or reversal affects another record.

5. **Open New leave war through both partial-gap holiday doors — D + P.**  
   **Setup/action:** Use a partially covered year. Open first from its uncovered-gap list, then separately from a holiday waiting for that gap. Keep the surrounding scheduler windows open.  
   **EXPECTED:** Each opens above those windows with its own exact dates and automatic name, immediately ready when valid. Creation supplies the requested period; the holiday can then be completed. Sources: D2158 and the holiday coverage contract.  
   **Disproof:** A buried window, lost taps, stale dates from the other request, an empty default name, or a holiday that remains unable to use the new coverage.

6. **Create the first-ever period — D + P.**  
   **Setup/action:** Use a separate empty test world, without deleting existing data. As admin, choose “Create the first period”, pick dates and create it. Check the member’s empty-world view separately.  
   **EXPECTED:** The same naming rule works without the normal period picker. Creation selects the new period and its first date; bidding starts closed. Members cannot create it. Sources: D2158, D1177 and the creation contract.  
   **Disproof:** This entrance misses automatic naming, cannot finish, selects nothing, opens bidding, or exposes creation to a member.

7. **Mix editable and read-only balance rows — D + P.**  
   **Setup/action:** As a member with balances unlocked, inspect and edit the own row beside another person’s row. Repeat with bidding closed; then lock balances as admin and revisit both roles.  
   **EXPECTED:** Only the member’s own non-OIL figures are editable while unlocked; the member lock removes that ability, while admin boxes remain. Tags keep the appropriate alignment in both presentations. Sources: D1247, D2156, D1493/D1497.  
   **Disproof:** All member rows become read-only prematurely, another person becomes editable, bidding closure acts as the balance lock, or admin editing disappears.

8. **Put pending tags on every other-leave corner — D + P.**  
   **Setup/action:** Create pending CCL, FCL, PL, EL and CL, including half-day and larger totals. Use permitted balance values of different widths. Click or tap into each editable box beneath its tag.  
   **EXPECTED:** Positive pending amounts have the dashed amber corner treatment without a minus, remain legible, and do not take the box’s intended press. Source: D2156. **RECORD exactly what zero pending shows.**  
   **Disproof:** A missing kind, clipped figure, tag covering another value, or a press prevented or diverted by the tag.

9. **Hover the painted parts of filled days — D.**  
   **Setup/action:** Exercise all filled-day families in the enumeration, including the first, middle and last day of joined runs. Move across the text, half-day divisions and warning marks.  
   **EXPECTED:** The one underlying day has the hollow cyan ring, with its contents and row tint retained. Source: D2157.  
   **Disproof:** The ring exists only over empty pixels, disappears beneath a block, surrounds several days, or gains a fill. Inspect the picture; a reported style alone is insufficient.

10. **Leave every stronger-mark state — D.**  
    **Setup/action:** Drag and release a selection; cancel a move; complete a move; wait for the just-added mark to end; enter and leave Rearrange. Hover before, during and after each transition.  
    **EXPECTED:** Stronger marks win while applicable; ordinary hover resumes afterwards. Source: D2157 and the brief’s stated precedence.  
    **Disproof:** Hover overwrites a stronger mark, stays suppressed after the mode ends, or remains on the former target.

11. **Round-trip a half-day choice — D + P.**  
    **Setup/action:** Open a PM half-day award, change 0.5 → 1 → 2.5 → 0.5, choose PM and save. Open another AM award, then return to the first. On desktop, also Tab through the editor.  
    **EXPECTED:** AM/PM is shown only for 0.5; its empty place preserves layout otherwise. Hidden choices cannot receive focus or presses. Each reopened award shows its own saved half. Sources: D2155, D1164.  
    **Disproof:** Grey controls appear, focus enters the blank space, another award’s half leaks across, or the saved HO appears in the wrong half.

12. **Recover from a refused award edit — D + P.**  
    **Setup/action:** Try zero, a negative amount, a quarter-day amount and more than 365; separately clear an existing reason. Then enter a valid amount and reason and save.  
    **EXPECTED:** Invalid edits explain the refusal without saving; the fixed rows remain steady and a valid retry succeeds. Sources: D2155 and the award validation contract.  
    **Disproof:** Silent refusal, partial saving, controls moving sideways when the message appears, or a valid retry remaining blocked.

13. **Carry Delete through cancellation and navigation — D + P.**  
    **Setup/action:** Arm Delete, then Cancel. Reopen; arm it and change person or leave the tracker. Reopen again, deliberately confirm deletion, then Undo.  
    **EXPECTED:** Arming alone deletes nothing; a new editing session does not inherit confirmation. Confirming deletes only the chosen award, and Undo restores it. Sources: D2155, D148 and the editor’s two-press contract.  
    **Disproof:** A first press deletes, another award inherits “Really delete?”, or navigation leaves an invisible armed action.

14. **Return through every OIL entrance — D + P.**  
    **Setup/action:** Use all tracker doors in the enumeration. Before opening, change Balances view/search/zoom/scroll, or Approvals dates and decision states. Edit an award where allowed, then close the tracker. Also try choosing another tab while it is open.  
    **EXPECTED:** Closing restores the originating page and its retained state; an explicit different tab goes there. Sources: D1503, D1506.  
    **Disproof:** Return to Grid unexpectedly, reset list position or zoom, lost Approvals decisions, or a stale OIL figure.

15. **Watch a pending tag become an approved balance — D + P.**  
    **Setup/action:** Start with a known LVE balance and a new 2.5-day pending request on chargeable dates. Inspect Balances, approve it, return, reverse the decision and inspect again.  
    **EXPECTED:** Approval removes that pending amount and reduces approved balance by the same amount; War balance stays consistent. The new tag changes with the actual request state. Sources: D1479, D2156.  
    **Disproof:** A lingering tag, double subtraction, a minus reappearing, or disagreement with person/grid figures.

16. **Cross pinned edges while zoomed and scrolled — P.**  
    **Setup/action:** With populated pending tags, scroll vertically until rows meet the headings, horizontally past pinned names, and to CL at the far end. Pinch out until all columns fit, then back in.  
    **EXPECTED:** Tags remain attached to the correct figures; headings and names keep their intended pinned positions; all columns remain obtainable. Sources: D1483, D2156.  
    **Disproof:** A tag appears over the wrong row, vanishes under a pinned layer, cannot be uncovered, or causes alignment to drift.

17. **Use the taller headings at actual desktop sizes — D.**  
    **Setup/action:** At the planned desktop widths, inspect the top and bottom of a long list, search down to a few rows, switch Days taken and return. Include ordinary browser zoom.  
    **EXPECTED:** Heading starts, boxes/figures and group rules retain the approved alignment without obscuring the first row or losing controls. Source: D2156.  
    **Disproof:** Wrapping breaks alignment or group spans, or the longer header overlaps usable content. Keep the already-declared three-line heading departure separate from a newly found fault.

18. **Hover across own-row and date backgrounds — D.**  
    **Setup/action:** Test own and other rows as both roles, open and closed bidding dates, past dates, and posting boundaries. Scroll or change month, then hover newly shown cells.  
    **EXPECTED:** The ring remains hollow; existing tints, own-row lines and posting marks remain. Source: D2157.  
    **Disproof:** A background disappears, own-row lines are replaced, a stale day stays ringed, or newly shown months miss the ring. Ensure an own row actually exists; do not silently skip it.

19. **Distinguish usable background from blocked background — D.**  
    **Setup/action:** Hover and press exposed grid cells behind the picked-days panel. Separately open New leave war and move over the grid behind its blocking layer.  
    **EXPECTED:** The picked-days panel preserves the permitted background interaction. A blocking window must not pass the press through. Sources: D641/D642 and the respective window contracts.  
    **Disproof:** The usable background becomes dead, or an obscured grid action fires through a blocking window. Record which window was used.

20. **Check touch after tap, drag and closing a window — P.**  
    **Setup/action:** Tap an empty day, a filled day and the own row; close their windows; drag a selection and scroll away and back.  
    **EXPECTED:** No desktop hover ring sticks after touch; existing touch selection and stronger marks still work. Source: D2157.  
    **Disproof:** A lingering thin hover ring, a lost selection mark, or a newly required extra tap. This extends the existing test that inspects the mouse-only rule.

21. **Establish ownership of the Name box in different orders — D + P.**  
    **Setup/action:** Type before choosing dates; type exactly the automatic suggestion and then change months; clear the box and begin typing a replacement; separately clear it and change dates.  
    **EXPECTED:** A typed name remains typed even when its text happens to match the suggestion. Clearing does not refill under typing; the next date change resumes automatic naming. Source: D2158 and its stated readings.  
    **Disproof:** Text equality causes an unwanted rename, typing is interrupted, or an emptied box fails to resume following dates. **RECORD whitespace-only handling explicitly.**

22. **Retry after overlap, then cancel and reopen — D + P.**  
    **Setup/action:** Choose overlapping dates, attempt creation, then select a valid span and create. In a separate attempt, cancel after typing and reopen through a different entrance; exercise the calendar’s month/year chooser and Escape.  
    **EXPECTED:** The refusal identifies the existing period; a valid retry uses the final dates and correct name. Reopening carries no abandoned name, dates or refusal. Sources: D2158 and the period-creation/calendar contracts.  
    **Disproof:** A stale name or error survives, the wrong span is created, or closing a nested chooser unexpectedly dismisses the whole task.

23. **Read a newly saved name beyond the picker — D + P.**  
    **Setup/action:** Create a period through the real calendar, using a one-month, ordinary multi-month or cross-year span. Visit every name reader enumerated above, making the necessary pending bid or boundary refusal. Reload and reselect the period.  
    **EXPECTED:** Each reader uses the saved name of the relevant period, including refusals and links to another period. Source: D2158 and those readers’ contracts.  
    **Disproof:** A blank or earlier suggestion, the current period’s name substituted for another, or a link opening the wrong period. Reload need not automatically select the last-viewed period.

24. **Create two distinct periods with the same automatic name — D + P.**  
    **Setup/action:** In an uncovered month, create two non-overlapping spans within that month. Both naturally receive the same month/year name. Select each and add distinguishable permitted content.  
    **EXPECTED:** They remain distinct by their dates and identity; neither replaces or merges into the other. Source: the non-overlapping-period contract. **RECORD exactly how the picker and other readers distinguish—or fail to distinguish—the equal names; no ruling supplied here requires a new naming suffix.**  
    **Disproof:** Selecting one opens the other, their content merges, or creation overwrites an earlier period.

**Explicit negatives**

- I checked for another Balances entrance through Settings and found nothing to add; the tab is the current entrance.
- I checked the person-window tiles, Days taken layout, grid counters and Approvals for an extension of the new pending-tag design and found no authority to add one. Read-back checks still apply.
- I checked new credit entry, corrections, automatic OIL credits and ordinary OIL taken for the fixed award-editor promise and found no additional qualifying editor.
- I checked whole-year creation from Holidays and the schedule. Those routes bypass the Name box; I found no basis to demand the new month-range format there. Record their resulting names and dates as boundary checks.
- I checked scheduler roles and found no non-admin scheduler case to add.
- I checked the evidence sheet’s two existing improvement candidates and its drawing departures. They are already recorded and are not new findings from this review.
- I excluded legacy-data-only migration and compatibility cases. Reload, Undo and reader scenarios above concern records newly created during the walk.
- The latest update changes the evidence sheet and test positioning, not the app code reviewed. Its test adjustment does not replace the phone opening-and-reachability scenario.

**Rulings: none this session.**

