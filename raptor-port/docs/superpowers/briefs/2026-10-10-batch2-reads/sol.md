**REVISE — four findings: three in this batch’s changed behaviour, and one older fault left in place.**

Independent code read of `1a806aa0`, against `49e3d579`. I read the supplied evidence and scenario list. I opened no other reader’s report, changed no file, and ran no build or test. The failures below are established by code traces; I did not reproduce them in the running app.

1. **P1 — “Take me out” can delete everyone after permission is gained. IN this batch’s incomplete confirmation fix.**

   **Setup and action:** As Saber, file a shared commitment for Saber and Ranger. Turn filing for other people off, then use Saber’s member view. Open the day and press Delete on that commitment. The question says “Take yourself out of this input?” and its button says “Take me out”. Leave that question standing, switch Saber back to admin, then confirm it.

   **Actual:** Both records are deleted. **Expected:** Only Saber’s record goes. Gaining permission must not enlarge the action already confirmed.

   **Cause:** In [InputsCal.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsCal.tsx:816), `doDelete` first checks whether the current reader may delete every row and calls `removeEntry` when that is true. It consults `askedAll` only afterwards, to protect the opposite transition—permission lost. The renderer retains the original “Take me out” wording, so the visible question and the executed action disagree.

   The production role switch preserves the Inputs page and its local question; this case needs no logout or simulated identity change.

   **Exact fix:**
   - Capture the requested operation when asking: whole entry, own record, or single record. Capture the own/single record’s `iid`.
   - Dispatch confirmation by that captured operation **before** checking current permission.
   - For “Take me out”, resolve that captured record and call only `removeInput`, even if whole-entry permission has since been gained.
   - For whole-entry deletion, recheck every affected record and refuse if permission was lost.
   - Add control regressions for permission gained and lost, including Saber’s member-view switch. The current regression covers loss only.

2. **P2 — The new group OIL count includes a request taken off the programme. IN this batch.**

   **Setup and action:** File a two-person weekend Duty and answer Yes for both. Change the second person’s own answer to No. On the schedule or board, take the first person’s request off the programme. Reopen the shared input on the Inputs page.

   **Actual:** The group line says “credited for 1 of 2 — \<second person\>: no”, counting the first person’s retained Yes. **Expected:** The removed request contributes no current OIL standing. This is separate from whether a previously published credit remains until republication.

   **Cause:** In [inputedit.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:762), `oilSummaryOf` reads each row’s stored answer without checking `acc === 'r'`. `oilAskPlan` does not perform that check. Group membership also excludes neither `acc` nor individual OIL answers, so these records remain one entry.

   Other readers already suppress the removed request: `oilAnswered`, `oilUnansweredDay`, the pending scan, and `oilInputEligible`. `unacceptInput` deliberately preserves its stored answer while setting `acc` to `'r'`. The new aggregation misses that qualification.

   **Exact fix:**
   - Apply the dormant-request exclusion when deriving each row’s effective marks for the group summary.
   - Count positive marks only from operative requests.
   - Calculate the “everyone alike” shortcut from that same effective standing; do not fall back to a dormant first row’s raw positive answer.
   - Keep the stored answers intact, so accepting the request again can restore its standing.
   - Add cases with the removed person first and last alphabetically, another person answering No or Yes, and subsequent acceptance again.

   This affects newly filed records and ordinary supported actions; D56 does not exclude it.

3. **P2 — Escape cannot close a note’s people picker while an input window remains open. OLDER code left as it was.**

   **Setup and action:** As Saber on desktop, leave an input window open with unsaved remarks. Bring an opened day forward, then open a planning note’s people picker. Press Escape with focus inside the picker.

   **Actual:** The picker remains open. **Expected:** Escape performs that picker’s Cancel action, preserving the input draft and the day.

   **Cause:** The picker’s capture listener in [InputsCal.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsCal.tsx:349) returns immediately whenever `INPEDIT` exists. The input editor correctly declines the key because the day is the front window. The shell also declines it because focus is in the blocking picker outside its window. No handler closes the picker.

   This is the separate picker run of scenario 18. The evidence sheet labels it older and unw walked; its roll-call’s “had it already” is not sufficient for this coexistence state.

   **Exact fix:**
   - Handle an open `pickFor` picker before the `INPEDIT` early return.
   - Prevent the default action, stop propagation, and call the existing `cancelPick`.
   - Leave the input-editor guard for cases where no picker is open.
   - Add both opening orders with an unsaved input draft. Verify that new-note cancellation retains its words according to the existing picker rule, existing-note selections are discarded, and neither underlying window closes.

4. **P3 — The List dates calendar consumes Escape intended for a blocking document or OIL question. IN this batch.**

   **Setup and action:** On desktop, open the List’s dates calendar. Using Tab and Enter, activate a visible row’s paperclip without an outside pointer press. The document viewer opens while the dates calendar remains open underneath. Press Escape. The same order is possible through an ordinary row’s OIL chip.

   **Actual:** The new window-capture listener closes the underlying dates calendar and stops the key. The visible document viewer or OIL question remains. **Expected:** The blocking layer handles its cancellation first.

   **Cause:** In [InputsPage.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/InputsPage.tsx:329), `listShown` establishes which page tab is selected, but not whether a blocking layer covers it. The unconditional window-capture listener precedes and prevents the document/OIL listeners.

   The settled dates-calendar-first behaviour beside an ordinary input window is sound. That does not establish priority over a blocking question or viewer.

   **Exact fix:**
   - Make the dates-calendar Escape handler stand down while a blocking viewer or question is open, using actual overlay state or explicit visible-layer identification.
   - Preserve its existing priority beside an ordinary input window.
   - Add keyboard-only opening regressions for the paperclip and OIL chip. First Escape must close the blocking layer; subsequent Escape may close the dates calendar. No OIL answer may be written.

**Roll-call and missing coverage**

| Qualifying object or surface | Where its sign and gesture belong | Result |
|---|---|---|
| Shared and single inputs; admin, filer, participant and unrelated reader | Day-card Delete/Backspace question; editor Delete and “Take me out”; permission repeated at the writer | Gained-permission day confirmation is wrong: finding 1 |
| Group OIL: Yes, No, unanswered, partial days, dormant request, one person remaining | Entry standing and one applicable question button in the Inputs editor | Dormant contribution is missing: finding 2 |
| Participant’s own OIL | Live own-answer controls outside the inert group form; own name; one-record writer | Sound on the traced paths |
| Schedule and board input dialogs | One person’s standing and heading; one-record save | Group summary deliberately does not belong here |
| Group-question doors | Save, Change, Answer, bell and post-drag question all reach the editor’s common sheet | Common heading matches the group writer; `own` matches the own writer |
| ALL / ALL AVAIL inputs | Filer-only answer; switch-off explanation at the editor and day-key refusal | Sound for the changed refusal paths |
| Planning notes: new words, existing words, “+ people”, people picker | Local Escape before the day; blur/Enter save; picker cancellation follows its existing rule | Text cancellation sound; picker coexistence fails: finding 3 |
| List dates calendar and other layers | Range remains after second date; outside press closes; Escape respects the applicable layer | Ordinary input coexistence sound; blocking layers fail: finding 4 |
| Desktop List paperclip and OIL chips | Named buttons, Tab/Enter/Space activation, no additional row opening | Markup and row guard sound |
| Filtered versus genuinely empty day | Correct empty sentence; Clear filters resets person, type and search | Sound |
| Every shell window on a phone | Toast at top when said or when a shell window mounts | Common mount call covers input, Inputs/SANS day, settings and Calendar-family windows |
| Document viewer from List, editor, Medical or puck | Same viewer footer; applicable Edit/Upchit rights; image/PDF/no-file and paging | Sticky rule reaches the common footer; Escape interaction is finding 4 |
| Request take-off and Quals | Shared week/board take-off message; Quals Save message | Changed wording paths sound |
| Downstream consumers | Per-person records continue to feed schedule landing, warnings, OIL evidence, history and Undo | No changed consumer writer found; dormant OIL exclusion exposes finding 2 |

The highest-value omitted orders are permission **gained** after asking, take-off **before** reading the new group count, picker cancellation with an input still open, and keyboard opening of a blocking layer above the List dates calendar. None is disproved by the supplied passing walk.

**Explicit negatives**

- **`madeOver` and record-follow effect:** No hidden-conflict or redraw-loop finding. Untouched fields follow live values. Touched competing fields raise a dispute. Returning to the original value clears it. Keep mine permits a later different competing value to raise it again. Take theirs clears the origin; equal changes and reseeding also clear it. `datesPicked` preserves deliberate date choices. Updating `base` before the extra redraw makes the following pass terminate.
- **`oilRows` / `anyAnswered`:** A first unanswered record with another answered record gets the standing plus one Change button. An unrelated reader gets no dead group button. A participant’s own actionable question remains outside the inert form. One remaining record takes the single-record branch. Finding 2 concerns the aggregate’s dormant qualification.
- **OIL heading and write scope:** `grouped`, `ppl.length`, `own`, `saveOwnOil` and `doSave → commitGroup` agree on the traced one-person and group routes. The alphabetical heading correction is sound.
- **Deletion writers:** `removeInput` and `removeEntry` retain their live-record, protection, permission and command checks. `delEntry` stays a whole-entry operation after permission loss. `takeMeOut` does not redirect to whole-entry deletion after a gain. The changed refusal sentence grants no right.
- **`filerSwitchedOff`:** It decides wording only. It can be true for an own-row member who still has permission; callers must retain their permission gates, and the traced writers do. `commitGroup` computes the sentence eagerly, but that computation neither grants nor refuses anything.
- **List outside listeners and row guard:** Pointer/mouse closure is idempotent and does not consume the outside action. Hidden List listeners are removed. The action cell’s remaining controls are buttons; the removed span guard leaves no independent span action exposed.
- **`noteGone`:** Escape blocks the cancellation blur. Opening another edit resets the flag. Enter and genuine blur retain the existing save path; the new-note people handoff still uses `pickingNew`.
- **Toast imports and timing:** The added import does not create an eager circular evaluation failure. `phoneLayout` guards absent `matchMedia`. Mount placement occurs after the window exists; closing does not move an already visible note. Pointer events remain disabled.
- **Take-off `was`:** `inp.acc` is captured before `unacceptInput` writes `'r'`; Unavailable and same-/other-day programme messages use the pre-write state.
- **Styles:** The chip reset reaches the intended direct action buttons. Range sizing is confined to the List calendar IDs; short-height rules change surrounding space. The sticky footer selector is confined to the document viewer. I found no concrete spillover; rendered geometry remains supplied evidence, not something I independently verified.

The day-title Escape question is already filed and excluded from these findings. Landscape, unchanged publication calculations, retained answers outside the current date span, and existing button sizes remain the settled scope.

**Walk:** No independent walk performed; read-only code review as instructed.  
**Rulings:** None to record. No approval or merge clearance given.

