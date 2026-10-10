**Three findings: one P1 and two P2.** This is a read-only code review of the requested batch. Files are unchanged; I ran no build, tests or application checks.

1. **P1 — “Take me out” can delete the entire shared input after permission is gained. IN this batch.**

   **Setup and action:** As Saber, file a shared Duty for Saber and Ranger. Turn off filing for others, switch to member view, open its calendar day and press Delete on the card. The question says “Take yourself out of this input?” Leave it open, use the role button to return to admin view, then press **Take me out**.

   **Expected:** Remove Saber’s record only. Ranger’s input remains.

   **Failure established by the code:** The question and button retain their self-removal wording, but confirmation deletes both records.

   **Cause:** In [InputsCal.tsx, `doDelete`](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsCal.tsx:816), `rows.every(mayDeleteInput)` dispatches to `removeEntry` **before** consulting the captured `askedAll` intent. The new [confirmation wording](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsCal.tsx:990) preserves that intent only on screen. `switchRoleView` leaves the Inputs page and its open day intact. The write-time permission check permits the deletion because the user is now an admin; it cannot detect that the confirmation asked for less.

   **Exact fix:**
   - Dispatch on the captured confirmation intent first.
   - For an all-person confirmation, recheck every record’s deletion permission; delete all or refuse.
   - For a self-removal confirmation, resolve and remove only the asker’s captured record, regardless of subsequently gained permissions.
   - Retain the existing lost-permission regression and add its reverse: self-removal question → gain permission → confirm → only self removed. Check Undo restores exactly that record.

   The broader-permission dispatch predates the batch; the batch introduces the frozen “Take me out” wording that now conceals its broader action.

2. **P2 — A schedule dialog reports another person’s unanswered OIL question, but its button cannot answer that question. OLDER code left by this batch.**

   **Setup and action:** File a shared weekday Duty for Ace and Ranger, drag it onto a Saturday and cancel the ensuing OIL question. Have Ace answer only his own question. As admin, open **Ace’s individual row** from Edit Schedule or the Scheduler Board.

   **Expected:** This individual dialog’s OIL standing, unanswered warning and answer action all concern Ace. The Inputs page remains the place for the whole entry.

   **Failure established by the code:** Ace’s dialog prints Ranger under “Not answered yet.” Its only OIL action is Ace’s **Change…** button. Answering that sheet writes Ace’s record and leaves Ranger unanswered; reopening the dialog repeats the warning.

   **Cause:** [InputEditor’s `unanswered` calculation](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2442) reads every entry record. Immediately below, the new `oilRows` correctly limits the schedule/board dialog to `[r]`. The summary, button suppression, sheet heading and save therefore use a different scope from the unanswered warning. `saveNow` correctly writes one record here; widening that writer would be the wrong repair.

   **Exact fix:**
   - Derive `oilRows` before calculating unanswered records.
   - Calculate `unanswered` and its date from `oilRows`.
   - Base the appended participant names on that same scope.
   - Add coverage for both schedule surfaces: Ace answered/Ranger unanswered, then the reverse. Keep the whole-entry warning and group answer on the Inputs page.

   This is a misleading warning/action combination, not evidence that the OIL credit calculation itself changed.

3. **P2 — The List’s dates calendar steals Escape from a blocking sheet opened by keyboard. IN this batch.**

   **Setup and action:** On the desktop List, open the dates calendar. Without clicking outside it, Tab to a medical row’s newly keyboard-accessible paperclip and press Enter. With the document viewer open, press Escape. The same sequence applies to an ordinary row’s OIL chip.

   **Expected:** Escape closes the foreground document viewer or OIL question.

   **Failure established by the code:** The first Escape closes the calendar underneath and leaves the foreground sheet open. Only the next Escape reaches that sheet.

   **Cause:** [InputsPage’s range-calendar effect](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsPage.tsx:329) captures Escape on `window` and stops propagation whenever `calOpen && listShown`. Keyboard activation produces no outside pointer event, so both remain true. The document viewer and OIL question listen on `document`, which the event never reaches. `listShown` protects against a hidden tab, but not a calendar covered by a blocking sheet.

   **Exact fix:**
   - Before consuming Escape, check whether a displayed blocking sheet is above the calendar; if so, leave the event to that sheet.
   - Include the document viewer and OIL/medical/document confirmation sheets, excluding hidden sheets and hidden ancestors.
   - Preserve the explicitly required calendar-first behaviour when only a nonblocking input window is open.
   - Add keyboard sequences for calendar → paperclip → Escape and calendar → OIL chip → Escape, alongside the existing hidden-List and nonblocking-window cases.

**Roll-call and missing coverage**

Starting with the specialised surfaces, these are the objects, doors and consumers that matter to this batch:

| Surface or object | Required visible sign and working gesture | Review result |
|---|---|---|
| Edit Schedule and Scheduler Board: one person’s input | That person’s OIL summary, unanswered warning, sheet heading and one-record save; named take-off message | Finding 2. The take-off wording follows the shared handler correctly. |
| Document viewer: List paperclip, input-window paperclip, Medical page and schedule puck | Correct document/episode, reachable footer actions; foreground Escape | Shared footer rule reaches these doors. Finding 3 affects keyboard opening over the List calendar. |
| OIL question: new/save, Change, Answer, drag follow-up and bell | Heading matches the people whose answers will be written; applicable day includes another year | Heading/save scope is sound on the traced routes. Foreground Escape has finding 3. |
| Opened day: shared and individual input cards | Delete asks about the actual removal; self-removal stays self-removal; refusal writes nothing | Finding 1. Loss-of-permission protection covers only one direction. |
| Shared Inputs editor | Counted OIL standing; one entry-level answer action for an authorised filer/admin | First unanswered/another answered is handled by `anyAnswered`. |
| Participant reading a group they cannot edit | Read-only entry, live **Your OIL** action and **Take me out** for their own record | Own OIL uses `saveOwnOil`; it does not become a group answer. |
| Unrelated reader; filer with switch off; ALL/ALL AVAIL filer | No dead edit action; truthful refusal after the real permission decision | No permission bypass found. The wording helper is not itself a permission predicate. |
| Desktop List and phone cards | Desktop chips are keyboard controls; cards open the editor; sorting retains the selected record’s identity | No remaining actionable span requires the removed row-click exception. |
| List date picker | End-date selection stays open; outside mouse/touch closes it; Escape respects foreground layers | Ordinary and hidden-List paths are covered; finding 3 is the missing overlap. |
| New note, existing note, “+ people”, people picker | Escape cancels the note edit only; subsequent edit and ordinary blur still save | No additional defect found in `noteGone` ordering. Day-title Escape is already filed separately. |
| Input draft changed behind its window | Untouched fields follow; conflicting fields require a decision; Undo removes obsolete conflicts | No additional defect found in the traced `madeOver` paths. |
| Shell windows on phones | Toast clears footer buttons, including a window opened under an existing toast | Shared mount hook covers Inputs/SANS days, editors and settings. Other dialog families retain the ruled behaviour. |
| Saved records and downstream readers | Per-person answers feed the pending bell and OIL processing; deletes affect the intended records; Undo restores that scope | No new credit writer was introduced. Finding 1 requires saved-result and Undo verification. |
| Quals and filtered calendar days | “Quals saved”; filtered-empty explanation with working Clear filters | No missing call site found. |

The meaningful action orders missing from the evidence are principally **permission gained while a deletion question remains open**, **keyboard opening of a blocking sheet while the List calendar remains open**, and **mixed group answers read through each individual schedule dialog**. They are not covered by reopening after a switch, checking each overlay separately, or testing only the shared Inputs window.

**Explicit negatives**

- **`madeOver`:** I traced untouched fields, touched fields, original-value restoration, a third external value, Keep mine, Take theirs, equal changes, reseeding and `datesPicked`. I found no new silent-overwrite path. `base.current` advances before `redraw`; the next effect pass exits on equality, so this does not create a redraw loop.
- **`oilSummaryOf` / `anyAnswered`:** Differing Yes/No/unanswered answers, partial days, identical answers and a one-person remainder are handled. An unanswered first record does not hide another record’s answer or remove the group’s only action.
- **OIL headings and writers:** Group headings use the selected names in sorted order; own-answer sheets retain one person’s name and writer. The schedule/board remains a one-record writer. Finding 2 concerns its warning scope.
- **`filerSwitchedOff`:** It decides no right. It **can** return true for a member’s own input despite that member retaining permission. Also, `commitGroup` calculates the refusal sentence before its permission loops, contrary to the helper’s comment. Neither produces a failure in the current callers: the sentence is used only after an actual refusal.
- **List chips:** Paperclip and OIL actions are buttons; their descendants are covered by `closest('button')`. Their handlers use the rendered record rather than resolving a stale sorted index.
- **`noteGone`:** Escape sets the guard before removing the box; opening the next edit clears it. Enter on “+ people” remains the button’s activation, while Escape cancels that unfinished note.
- **`placeToast`:** The new import does not introduce an eager circular dependency. The missing-`matchMedia` path is guarded. Mount placement and retaining an existing toast’s position on close match the stated choice.
- **`interactions.ts` / `was`:** The previous acceptance state and programme day are captured before mutation. Unavailable, same-day programme, other-day programme and failed-operation branches remain distinguishable.
- **Styles:** The button reset is limited to direct action-cell buttons. The range rules are limited to the named List picker and stated breakpoints. The sticky footer targets only the document viewer. No further scope defect found; this is not an independent visual verification.

**Check adequacy**

The evidence sheet’s saved-data answer—“Nothing stored changes shape”—does not account for the added deletion-confirmation logic. That logic changes whether records are deleted, even though their shape is unchanged. Under the checking order’s saved-data and destructive-result rules, the host should reassess this batch as **FULL** and obtain the required blind second read.

The host’s reported walk and green tests are evidence I read, not checks I repeated. The three findings above still require production-route reproduction and focused regression coverage. I have not reopened the ruled choices, the filed landscape issues, day-title Escape, or old-data-only concerns.

Rulings: none this session.