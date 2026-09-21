# Astra / Codex — the hands-on scenario list for the OIL build (21 Sep 26)

Designed, not executed, by Codex at the owner's instruction (*"ask fable and codex to think
through all the possible scenarios to test for bugs and opus be the executor"*). 24 scenarios,
ordered by likely financial harm; ★ marks the ones most likely to expose another missing surface.

Companion: `2026-09-21-oil-scenarios-fable.md`. Execution results: `2026-09-21-oil-handpass-results.md`.

---

Below is the complete hands-on pass, ordered by likely financial harm. ★ marks the scenarios most likely to expose another missing surface or interaction.

Use a fresh disposable dataset for each scenario unless the scenario explicitly spans weeks. The dates below match the seeded week:

- Wednesday W: 15 Jul 2026
- Saturday S: 18 Jul 2026
- Sunday U: 19 Jul 2026
- “Publish” means complete CUR CK, SKED CK, PLANNED BY and APPROVED BY, then publish.
- Before checking money, record each subject’s OIL balance. FO should add 1; HO should add 0.5.

## 1. ★ Every board puck surface both shows OIL and accepts the OIL gesture

**Title:** Walk every board renderer: cockpit, SC, sims, all duty kinds, programmes and inputs.

**Why this could break:** These surfaces use several independent puck builders. This is the exact seam that previously omitted cockpit seats, SC seats, Common Programme pucks and their tap targets.

**SET UP:**

On S, create and publish:

- Ordinary flying line `VIPER 1`, T/O 1000, land 1101: Ranger FCP, Echo RCP. Both are FO because the flying work window is 0700–1301.
- SC MAIN 0700–1500: Piston.
- SC SPARE 0700–1500: Saber.
- Plain duty `SDO` 0800–1500: Hunter.
- SC-linked duty `SC DESK` 0700–1500: Warden.
- AVALON line and its linked desk, both staffed.
- BB line and its linked desk, both staffed.
- OFT `EP SIM` 0900–1200: Reaper and Basher.
- Ground item `OPS BRIEF` 0900–1200: Blade.
- Common Programme `FAMILY DAY` 0900–1600: Trident.
- Accepted Training input for Cinch, 0900–1700, member answers Yes to OIL. It must appear both on Ground Programme and in Personal Inputs.
- All-day OD for Sidewinder, member answers Yes. It must appear only under Unavailable.
- Give Piston an overlapping ground commitment so his puck carries an advisory chip as well as earning OIL.

**DO:**

1. Open S on the scheduler board and enter OIL Earn mode.
2. Expand Personal Inputs.
3. For every earning surface above, tap its named person off, confirm the immediate visual change, then tap the same puck on again.
4. For Cinch, tap the Personal Inputs copy and then the Ground Programme copy.
5. Tap Sidewinder under Unavailable off and on.
6. Try the same gesture on SC SPARE, AVALON and BB pucks.
7. Exit with `✓ Done`, then make one ordinary schedule edit to prove editing is restored.

**EXPECT:**

- Every eligible puck becomes an actual OIL control. Tapping must not arm a seat, open a crew picker or edit the row.
- FO pucks have a solid green glow and show `FO` where the CAT letter normally sits.
- HO pucks have an outline-only glow and show `HO`.
- Cinch’s two visible representations control the same input decision: changing either representation immediately updates the other.
- Sidewinder’s OD puck is reachable and tappable under Unavailable despite having no Ground Programme row.
- Piston’s glow/figure remains legible with the advisory chip present.
- SC SPARE, AVALON and BB are plain and inert with a truthful “nothing measurable” reading; tapping them changes nothing.
- Restoring every tap leaves the Leave War amounts unchanged from the published values.
- `✓ Done` always remains available and restores all normal schedule controls.

**Which ruling(s):** OIL1, OIL2, OIL3, OIL5, OIL6, OIL8, OIL12, OIL21a, OIL21b, OIL28, OIL31.

## 2. ★ The positive strip reaches every board, edit-week and issued-week occurrence

**Title:** Compare the same published Saturday on the board, Edit Schedule and View Schedule.

**Why this could break:** Board rows, week rows and input-derived panels do not all share one rendering path. Personal Inputs and Unavailable are especially likely omissions because they are not ordinary schedule rows.

**SET UP:**

Reproduce the published S schedule from Scenario 1. Also add:

- Ground item `SHORT BRIEF` 0800–1100 for Saber, producing HO.
- A second info-only ground item for Saber, 1400–1700.
- Ensure Piston still has an advisory chip on his earning SC MAIN puck.

**DO:**

1. With OIL mode off, inspect S on the board.
2. Inspect the same live day in the Edit Schedule week.
3. Inspect the issued version in View Schedule.
4. Open the issued-version preview from the edit side and inspect it too.
5. Hover or focus one FO strip and one HO strip.
6. Search the visible day for any old `NO OIL` label, day line or remarks tag.

**EXPECT:**

- Every counted ordinary flight, SC MAIN, plain/SC duty, sim, Ground Programme, Common Programme and accepted claim occurrence has a left-edge green strip on all applicable surfaces.
- Cinch’s accepted input is marked wherever that claim is visibly represented, including its Personal Inputs echo and landed Ground Programme row.
- Sidewinder’s OD puck has the strip under Unavailable in the week and board views; this is the only schedule surface where that OD earner exists.
- FO is a full-height 4px green strip. HO is a paler strip occupying only the bottom half.
- Piston’s strip remains visible through the chip sitting over its left edge.
- Saber’s strip appears on `SHORT BRIEF` only, not on the info-only row.
- Hover/focus text says the person earns a full or half day, not that the individual event itself is worth FO/HO.
- No `NO OIL` marking remains anywhere.
- The issued face and Leave War agree exactly: each strip corresponds to a counted event and the displayed FO/HO matches the landed credit.

**Which ruling(s):** OIL20, OIL21, OIL21a, OIL21b, OIL22, OIL24.

## 3. ★ Full OIL workflow at 390px phone width

**Title:** A scheduler can see, operate and leave OIL mode on a phone.

**Why this could break:** The phone uses different control placement and narrow-grid layouts. Previous defects included a second top-bar row and an overflowing Done label.

**SET UP:**

At a real 390px viewport, build S with:

- One ordinary flying line containing Ranger and Echo.
- One SC MAIN containing Piston.
- One Common Programme item containing Trident.
- One ground row with `ALL AVAIL`.
- One all-day OD input for Sidewinder answering Yes.
- Publish the day.

**DO:**

1. Open S on the phone board.
2. Tap `OIL Earn` in the `THIS DAY` bar.
3. Scroll through the whole board and tap Ranger, Piston, Trident and Sidewinder off and on.
4. Tap the ALL AVAIL count chip, then operate one expanded real puck.
5. Turn `Nothing today earns` on and off.
6. Tap `✓ Done`.
7. Repeat with the phone rotated or resized just below and just above 390px.

**EXPECT:**

- The fixed top bar remains one row; there is no blank second row.
- `THIS DAY`, `OIL Earn`, `Nothing today earns` and `✓ Done` remain fully visible, tappable and inside the viewport.
- No horizontal page scrolling, clipped puck figures or overlapping buttons.
- Every listed surface is operable by touch; no required behaviour depends on hover.
- The ALL AVAIL count chip opens a readable list and its expanded people are large enough to tap individually.
- The blanket explanation remains readable and says hidden marks are kept.
- `✓ Done` leaves the mode immediately and restores schedule editing.

**Which ruling(s):** OIL1, OIL2, OIL5, OIL8, OIL9, OIL12, OIL21a; unruled – phone usability judgement.

## 4. Envelope measurement, exact six hours and a one-minute boundary

**Title:** Live figures follow first start to last end, including gaps.

**Why this could break:** The screen may look plausible while using duration sums or per-event amounts. A tap on a short edge event must sometimes change the whole day’s figure.

**SET UP:**

On clean S:

- Ranger: `MORNING` 0700–0800 and `AFTERNOON` 1200–1300. Envelope = exactly 6 hours.
- Saber: `MORNING` 0700–0800 and `AFTERNOON` 1200–1301. Envelope = 6 hours 1 minute.
- No other work or claims for either person.

**DO:**

1. Enter OIL mode.
2. Read both figures on both of Ranger’s pucks and both of Saber’s.
3. Tap Ranger’s MORNING puck off, then back on.
4. Tap Saber’s AFTERNOON puck off.
5. Exit OIL mode and inspect the positive strips.
6. Restore Saber, publish, then inspect Leave War.

**EXPECT:**

- Ranger shows HO on both pucks: exactly six hours is HO despite only two hours of booked work.
- Tapping one Ranger event off leaves his remaining event at HO; it does not sum to zero.
- Saber initially shows FO on both pucks.
- Removing Saber’s one-minute-extending AFTERNOON event changes his remaining MORNING puck to HO; the removed event is dim and shows no earning figure.
- Outside the mode, a strip appears only on events that still counted.
- After restoring and publishing, Ranger receives HO/+0.5 and Saber FO/+1.

**Which ruling(s):** OIL3, OIL4, OIL5, OIL6, OIL20, OIL21, OIL30.

## 5. Sentinel display: unanimous FO, unanimous HO, none and mixed

**Title:** ALL AVAIL tells the truth in all four visual states.

**Why this could break:** One sentinel puck summarizes many people with different day figures. Its bar, count chip and detail list can easily disagree.

**SET UP:**

Use a clean S with no other work or inputs for the sentinel’s participants. Add Common Programme `FAMILY DAY` 0800–1700 with `ALL AVAIL`. Record its initial plain count as N.

**DO:**

1. Inspect the sentinel outside OIL mode.
2. Tap its count chip.
3. Enter OIL mode and confirm the sentinel is replaced by N real pucks.
4. Deny Ranger on this event and exit OIL mode.
5. Inspect and tap the count chip again.
6. Re-enter and restore Ranger.
7. Change the event to 0800–1200 and publish that version.
8. Turn the whole event off and inspect its sentinel again.

**EXPECT:**

- With everyone earning FO: full-height green bar and plain chip `N`.
- The chip list names N people and says `full day` for each.
- In OIL mode there is no untappable sentinel; N real pucks appear.
- With Ranger denied: no sentinel bar and a green chip `N−1 of N earn`; the list names Ranger as `nothing` and the others as full day.
- Once Ranger is restored and the event is four hours: half-height paler bar and plain `N`; every listed person says half day.
- With the item off: no bar, plain `N`, and every listed person says nothing.
- The sentinel itself never receives a Leave War row or credit.

**Which ruling(s):** OIL8, OIL21, OIL23, OIL28, OIL35.

## 6. ALL and ALL AVAIL use the same real-world availability definition

**Title:** Overlap, ATT B, SANS, ground crew and paired sentinels.

**Why this could break:** Availability is assembled from roster state, inputs and schedule occupancy. It is easy for the crew picker, sentinel list and frozen money membership to use different answers.

**SET UP:**

On S, add two Common Programme rows, both 1000–1400: one `ALL`, one `ALL AVAIL`. Arrange:

- Ranger: otherwise free.
- Saber: ATT B covering the event.
- Piston: Training 0900–1700.
- Reaper: Appointment 1500–1600, not overlapping.
- Hunter: named on another schedule row 1100–1200.
- Blade: removed/dormant Meeting 0900–1700.
- Zenith, a SANS member: named on our programme 0700–0800 only.
- Ratchet, ground crew: otherwise free.
- Sidewinder: OD covering the event.

**DO:**

1. Tap each sentinel’s count chip and save the two lists.
2. Enter OIL mode and compare the expanded people.
3. Move Zenith’s own row to 1100–1200 and recheck.
4. Restore it to 0700–0800.
5. Restore Blade’s Meeting from dormant to active and recheck.
6. Publish and inspect the landed credits.

**EXPECT:**

- ALL and ALL AVAIL contain identical people in identical order.
- Included: Ranger, Saber despite ATT B, Reaper because the appointment does not overlap, Blade while his Meeting is dormant, and Zenith while planned with us outside the sentinel window.
- Excluded: Piston, Hunter, Ratchet and Sidewinder.
- When Zenith’s own work overlaps 1000–1400, he is excluded; merely being SANS-planned does not defeat ordinary overlap exclusion.
- When Blade’s Meeting is restored and overlaps, he is excluded.
- The two sentinel rows do not empty one another.
- Only real included people receive credit; neither sentinel nor Ratchet receives credit through expansion.

**Which ruling(s):** OIL13, OIL14, OIL15, OIL28, OIL35.

## 7. Member answer, admin override and the input’s surviving identity

**Title:** The member keeps the first word; the admin can override without rewriting it.

**Why this could break:** The displayed input, its landed row and the stored decision have different lifecycles. Ordinary edits must preserve an override, while a genuinely different input must not inherit one.

**SET UP:**

On S:

- Ranger files all-day Training, answers No, and it lands on Ground Programme.
- Saber files all-day Duty, answers Yes, and it lands.
- Sidewinder files all-day OD, answers Yes, under Unavailable.

**DO:**

1. Enter OIL mode and inspect defaults.
2. Tap Ranger on; leave OIL mode and open his input editor.
3. Confirm his own answer still reads No.
4. Change only Ranger’s remarks, then his times; return to OIL mode.
5. Remove Ranger’s input from the programme, then restore it.
6. Change the input’s person from Ranger to Piston; then change it back.
7. Delete the input entirely and create a new equivalent Ranger Training input.
8. Tap Saber off and back on.
9. Tap Sidewinder off and back on.

**EXPECT:**

- Ranger defaults dim because his answer is No; Saber and Sidewinder default FO.
- Admin-allowing Ranger lights the input without changing the member’s recorded No.
- Remarks/times edits preserve the admin decision and both visible representations stay synchronized.
- While removed, Ranger earns nothing whatever the stored answer or override says.
- Restoring the same input may restore its existing override because it retains the same input identity; if the product instead clears it, that clearing must be explicit and visible.
- Changing the person makes it a different decision target: Piston must not inherit Ranger’s override, and changing back must not silently resurrect a supposedly cleared person decision.
- A deleted-and-recreated input starts from its new member answer, not the old input’s override.
- Tapping Saber or Sidewinder twice removes the override and restores their own Yes, rather than permanently writing an `allow`.
- The history names the callsign and the input type for each admin gesture.

**Which ruling(s):** OIL10, OIL12, OIL13, OIL25, OIL28; re-acceptance behaviour partly unruled – judgement.

## 8. Masks preserve hidden decisions, cover later additions and survive Undo/Redo

**Title:** Item and day masks never rewrite what they hide.

**Why this could break:** A dim puck under a mask can be mistaken for the person’s own state. This previously allowed an invisible tap to destroy a stored decision.

**SET UP:**

On S, create `FAMILY DAY` 0800–1700 with Ranger and Saber. Enter OIL mode.

**DO:**

1. Deny Ranger. Undo, Redo, then confirm Ranger is denied.
2. Turn the whole item off. Undo, Redo.
3. While the item is off, try Ranger’s and Saber’s pucks.
4. Turn the item back on.
5. Turn `Nothing today earns` on. Undo, Redo.
6. While the blanket is on, try the item name and both pucks.
7. Exit OIL mode while the blanket remains on; add Piston to FAMILY DAY and add a new row `LATE ADD` with Reaper.
8. Re-enter OIL mode.
9. Turn the blanket off.
10. Undo and Redo the blanket removal.

**EXPECT:**

- Each Undo/Redo reverses and reapplies exactly one OIL gesture.
- Under an item mask, pucks are visibly inert and do not invite a tap. If a click reaches them, the message says to turn the event back on first.
- Restoring the item reveals Ranger still denied and Saber still earning.
- Under the day blanket, item names and pucks are inert; messages say to turn `Nothing today earns` off first.
- Piston and the new LATE ADD row are also covered, proving the blanket is a day fact rather than a stamp on existing rows.
- Turning the blanket off restores Ranger’s denial, Saber’s allow, and default earning for Piston and Reaper.
- None of these deliberate marks is amber or red.
- History contains meaningful action lines for Ranger, FAMILY DAY and the day blanket, not anonymous edits.

**Which ruling(s):** OIL7, OIL9, OIL17, OIL27.

## 9. Mark before first publication versus mark after publication

**Title:** The same OIL decision has the right publication cost in either order.

**Why this could break:** Before publication the decision belongs in the Original; after publication it must become a real, signable amendment without rewriting the issued snapshot.

**SET UP:**

- On S, create `FAMILY DAY` 0800–1700 with Ranger.
- On U, create the equivalent row with Saber.

**DO:**

1. On S, deny Ranger before any publication.
2. Sign and publish S.
3. On U, publish first with Saber earning.
4. Enter OIL mode on U and deny Saber.
5. Inspect the issued face, working face, sign-off strip, Amendments panel, day history and Leave War before publishing the change.
6. Undo and Redo Saber’s denial.
7. Re-sign U and publish its amendment.

**EXPECT:**

- S publishes as Original with Ranger denied; there is no AL number and no Ranger credit.
- U initially publishes Original with Saber FO.
- After denying Saber on the working copy, the issued face and FO credit remain frozen.
- U shows `Not yet signed`; previous sign-offs no longer display as valid.
- Amendments shows exactly `1 day with changes` and `1 change`, not one change per person or span.
- History says `Saber earns nothing from FAMILY DAY`.
- Undo returns to no delta and restores the valid signed-content state; Redo restores the one OIL change.
- After re-signing and publishing, U becomes AL1 with one item, Saber’s automatic credit is removed, and S remains Original.

**Which ruling(s):** OIL11, OIL16, OIL24, OIL27, OIL29.

## 10. ★ A new member request after publication stays on the working copy

**Title:** Late-filed weekend input becomes a pending amendment, not silent money.

**Why this could break:** The input, working schedule, issued schedule, signature digest and money pass all meet here. This is a high-risk “surface appears after publication” sequence.

**SET UP:**

Publish S with no Ranger input and record Ranger’s OIL balance.

**DO:**

1. As Ranger, file Training 0900–1200 for S and answer Yes to the OIL question.
2. Return as scheduler.
3. Compare the issued face, working face, Personal Inputs, Ground Programme and Leave War.
4. Open OIL mode on the working board and deny, then restore Ranger.
5. Re-sign and publish AL1.

**EXPECT:**

- The Training input auto-lands only on the working Ground Programme.
- Personal Inputs shows it as dealt with; the issued face remains unchanged.
- The day shows `Not yet signed` and a pending amendment.
- Before AL1, Ranger receives no credit.
- OIL mode reaches both visible copies of the new claim and they agree.
- After AL1, the issued face includes the input and Ranger receives HO/+0.5.
- The day-cell detail reads `HO — OIL earned`, gives `Weekend/PH` only if schedule evidence also earned; otherwise `Duty input`, and shows the worked hours.
- No unrelated day receives an amendment number.

**Which ruling(s):** OIL11, OIL16, OIL25, OIL27, OIL37.

## 11. ★ Published input evidence stays frozen through member edits and quiet correction

**Title:** A member cannot move already-issued money by revising their input.

**Why this could break:** Live inputs and frozen issued evidence previously disagreed. Retiming, answer changes and retraction must wait for a new publication.

**SET UP:**

On S, Ranger files Duty 0800–1200, answers Yes, it lands, and S is published. Confirm Ranger receives HO.

**DO:**

1. As Ranger, change the Duty time to 0800–1700.
2. Check the issued face and Leave War before any republication.
3. Change the OIL answer from Yes to No.
4. Check again.
5. As scheduler, unpublish S.
6. Re-sign and republish without changing the version label.
7. Repeat once more, this time correcting back to Yes and 0800–1700 before reissuing.

**EXPECT:**

- Neither the time edit nor answer edit moves the issued HO credit immediately.
- The issued face remains the old 0800–1200 truth; the working copy shows the new input and a publishable divergence.
- Unpublish withdraws the issued credit temporarily.
- Republishing under the same label costs no AL number.
- With answer No, no credit lands.
- After the second correction to Yes/0800–1700, FO/+1 lands and the old HO hours no longer survive.
- History retains the retired issue/correction record according to the app’s disclosure rules; it must not pretend an AL was issued.

**Which ruling(s):** OIL24, OIL25, OIL29, OIL36.

## 12. Public holiday declared or revoked after publication

**Title:** Only the issued calendar status pays, in both directions.

**Why this could break:** The live Leave War calendar and frozen day snapshot are two possible authorities. Grant and withdrawal must follow the same freeze rule.

**SET UP:**

On W, create `PH DUTY` 0800–1700 with Ranger. W begins as an ordinary working Wednesday.

**DO:**

1. Publish W while it is not a public holiday.
2. Mark 15 Jul as PH in Leave War.
3. Inspect W’s warning list, positive strip and Ranger’s credit.
4. Unpublish and republish W under the same label.
5. Confirm the credit.
6. Remove the PH designation after the republish.
7. Inspect again.
8. Unpublish and republish once more.

**EXPECT:**

- Initial publication pays nothing.
- After PH is added live, the issued face still pays nothing and the day says: `This day started earning OIL after it was published — publish it again so the OIL lands`.
- No misleading green issued strip or credit appears before republication.
- Reissue under the same label produces no AL and lands Ranger FO/+1.
- Removing the PH live does not silently sweep that issued FO; the frozen issued day remains authoritative.
- Only the next quiet reissue removes the strip and credit.
- Neither direction changes another day’s amendment sequence.

**Which ruling(s):** OIL18, OIL24, OIL36.

## 13. Hand-built row identity through reorder, delete, copy and person swap

**Title:** A decision follows the surviving event, never its position or replacement.

**Why this could break:** Decisions use hidden row identity while humans manipulate visible order and people. Positional reuse can put an old denial onto the wrong row.

**SET UP:**

On S, create:

- Ground `ALPHA` 0800–1000 with Ranger.
- Ground `BRAVO` 1200–1700 with Ranger.
- Deny Ranger on BRAVO only.

**DO:**

1. Exit OIL mode and reorder BRAVO above ALPHA.
2. Return to OIL mode.
3. Swap BRAVO’s person from Ranger to Saber, then back to Ranger.
4. Delete BRAVO; inspect Ranger’s remaining result.
5. Undo deletion, then Redo it.
6. Undo again and duplicate/copy BRAVO by the app’s normal row-copy/template route.
7. Inspect original and copied BRAVO rows.

**EXPECT:**

- After reorder, the denial remains on BRAVO; ALPHA does not inherit it.
- Saber does not inherit Ranger’s person decision.
- Returning Ranger must not silently resurrect a decision that the person change was supposed to clear.
- While BRAVO is deleted it contributes no hours or credit.
- Undo restores the row and its prior state as one undo snapshot; Redo removes it again.
- A genuinely copied/new row starts with no decision, even if its visible name, times and person match BRAVO.
- The original and copy can be controlled independently.
- History names the visible item and person, not an internal row identifier.

**Which ruling(s):** OIL25, OIL28, OIL29.

## 14. ★ Plans, draft switching and recovery never restore stale evidence

**Title:** Parked plans retain choices but re-derive current inputs and sentinel membership.

**Why this could break:** A stored plan can accidentally carry a frozen projection of old inputs or roster state. This was the least independently reviewed design boundary.

**SET UP:**

On unpublished S:

- Ground `BRIEF` 0800–1700 with Ranger.
- Ranger also has an all-day Duty input answering Yes.
- Create Plan A and Plan B.
- In Plan A, deny Ranger on BRIEF.
- In Plan B, leave BRIEF earning.

**DO:**

1. Switch repeatedly between Plan A and Plan B and inspect OIL mode.
2. While Plan B is selected, edit Ranger’s input answer to No.
3. Return to Plan A.
4. Confirm Plan A retained its scheduler decision but now reflects the current member answer.
5. Publish Plan A.
6. Make a new OIL-only decision on the working copy.
7. Use the issued-version action `Load onto working copy`.
8. Inspect the delta, signatures, mode, strips and Leave War.
9. Undo and Redo the load/recovery action.

**EXPECT:**

- Plan A and Plan B retain their own stored OIL decisions.
- Both plans re-read the current input answer; neither resurrects the Yes projection that existed when it was parked.
- Publishing freezes exactly the selected plan’s current evidence.
- A later OIL-only working edit does not move money before publication.
- Loading the issued version onto the working copy removes that unpublished divergence and does not install a permanently frozen evidence block into the live copy.
- Undo restores the discarded working decision and its pending state; Redo restores the issued working copy.
- Leave War always follows the issued version, never whichever plan is merely selected.

**Which ruling(s):** OIL24, OIL25, OIL27, OIL29.

## 15. Structural ineligibility cannot be overridden

**Title:** Spare, exempt, cancelled, info-only, blind and zero-length work stay at zero.

**Why this could break:** The mode may offer a persuasive-looking control on work the money engine will never count.

**SET UP:**

On S, give different people:

- SC SPARE 0700–1500.
- AVALON line and desk 0700–1500.
- BB line and desk 0700–1500.
- Cancelled ground row 0800–1700.
- Ground row with no start/end.
- Ground row 1200–1200.
- Info-only ground row 0800–1700.
- Info-only Common Programme row 0800–1700.
- Sim row containing only free text in `who`.
- Accepted Training input answering Yes; cancel its landed Ground Programme row.
- A second accepted input answering Yes; turn its landed row info-only.

**DO:**

1. Inspect the day warning list before publication.
2. Enter OIL mode and try every visible puck/item.
3. Restore the cancelled claim row, then cancel it again.
4. Remove info-only from the second claim row, then restore info-only.
5. Publish without correcting the deliberately blind row.

**EXPECT:**

- None of the structurally ineligible items glows or offers a working person override.
- No positive strip appears on them.
- The info-only control’s wording explicitly says the item never earns OIL.
- Restoring the eligible claim row makes its claim controllable; cancelling it removes earning again.
- Removing info-only makes the second claim eligible; restoring info-only removes it again.
- Free-text sim text never becomes a person or credit.
- The blind named row produces the warning that it has no times and nobody on it earns OIL.
- No `allow` gesture can manufacture a credit for these states.

**Which ruling(s):** OIL19, OIL21, OIL28, OIL31, OIL33.

## 16. Reminder and “nobody earned” messages match the visible day

**Title:** The app speaks before and at publication when money would otherwise fail silently.

**Why this could break:** Warnings are separate from puck rendering and money. Masks or missing times can make the warning describe a different set of earners.

**SET UP:**

Prepare three clean days:

- S: Ranger on `SDO` 0800–1700, not published.
- U: Saber on `SDO` with blank times.
- Another eligible off-day-tagged weekday: Piston on `OPS` 0800–1700, with `Nothing today earns` enabled.

**DO:**

1. Inspect S’s warnings before publication.
2. Publish S and confirm the reminder disappears.
3. Inspect U before publication, then publish it.
4. Publish the off-day-tagged day with the blanket still on.
5. Read all toasts and warning-list entries.

**EXPECT:**

- S says: `This day is not published yet, so nobody earns their OIL for it — publish it before the day is out`.
- After S publishes, Ranger receives FO and that reminder disappears.
- U warns on the day that SDO has no times and nobody on it earns OIL.
- Publication also reports that the worked Sunday earned nobody any OIL because the desk has no start and end times.
- The blanket day visibly says nothing earns while being built and lands no credits.
- No warning claims a masked or denied person will receive money.
- An empty eligible day with no work does not produce the unpublished-OIL reminder.

**Which ruling(s):** OIL9, OIL11, OIL28, OIL31, OIL33.

## 17. OIL credit and an undecided leave bid coexist and flag the conflict

**Title:** Publishing work never silently deletes or suppresses a live bid.

**Why this could break:** The result depends on both the publish door and the Leave War reconciliation order.

**SET UP:**

Before publishing S:

- Ranger has an undecided LL bid covering 0800–1200.
- Ranger is on published-intent duty 0800–1700.

**DO:**

1. Record Ranger’s bid and OIL balance.
2. Publish S.
3. Read the publication toast, S’s warning list and Ranger’s Leave War cell.
4. Open the day detail and OIL tracker.
5. Undo the publish, then Redo it.

**EXPECT:**

- The LL bid remains live and unchanged.
- Ranger’s FO automatic credit also lands; balance increases by 1.
- The day is amber/flagged for the overlap.
- The publication message says Ranger’s bid now sits on published work, the day is flagged and the bid is still live.
- Day detail separately shows the bid and `FO — OIL earned`; neither replaces the other.
- Undo removes only the issued automatic credit, not the bid. Redo restores the credit and conflict once.

**Which ruling(s):** OIL34, OIL39.

## 18. Hidden SANS, archived people and named ground crew keep the correct money

**Title:** Display membership cannot become a second money authority.

**Why this could break:** A credit may belong to someone whose Leave War row is currently hidden or whose live roster status changed after publication.

**SET UP:**

On S:

- Zenith, a SANS member, is named on our programme 0700–0800.
- `ALL AVAIL FAMILY DAY` runs 1000–1700.
- Ratchet, ground crew, is explicitly named on a separate ground row 0800–1700.
- Leave War’s `Show SANS` is off.
- Publish S.

**DO:**

1. Confirm Zenith is absent from the visible Leave War roster.
2. Turn `Show SANS` on.
3. Inspect Zenith’s day and OIL balance.
4. Turn it off again.
5. Archive Ranger after giving Ranger an issued FO on another clean weekend day; then restore Ranger.
6. Inspect Ratchet and the sentinel itself.

**EXPECT:**

- Zenith earns FO while hidden; when `Show SANS` is enabled, his row arrives already carrying the FO and correct balance.
- Hiding him again does not delete the credit.
- Archiving Ranger after issue does not sweep Ranger’s issued credit; restoring the row reveals it still present.
- Ratchet is excluded from ALL/ALL AVAIL expansion but earns FO when explicitly named.
- The sentinel itself has no Leave War credit.
- No current display or roster switch silently changes issued money.

**Which ruling(s):** OIL14, OIL24, OIL35; named-ground-crew behaviour is the owner’s recorded “leave it”.

## 19. Schedule and claim pool into one day with schedule provenance

**Title:** Two evidence sources produce one credit and the stronger label.

**Why this could break:** The same person can enter through both evidence branches, creating duplicate credits or the wrong giver/source.

**SET UP:**

On S:

- Ranger has schedule work `MORNING BRIEF` 0900–1100.
- Ranger files Duty 1500–1700 and answers Yes.
- No other Ranger work.

**DO:**

1. Enter OIL mode and inspect both events.
2. Publish S.
3. Open Ranger’s Leave War day detail and OIL tracker.
4. Count records for that date and read the reason, hours and giver.

**EXPECT:**

- Both pucks show Ranger’s day figure FO because the envelope is 0900–1700.
- Exactly one automatic FO credit lands, not two HO credits.
- The stored worked spans remain 0900–1100 and 1500–1700; the gap affects the amount but is not falsely presented as worked time.
- Day detail says `FO — OIL earned`, shows both work windows, `given by Weekend/PH`, and `From the published schedule`.
- The tracker balance rises by exactly 1.
- If the schedule row is later denied and that change is published, the remaining claim becomes HO and its provenance becomes `Duty input`.

**Which ruling(s):** OIL4, OIL11, OIL21, OIL30, OIL32.

## 20. Cross-week persistence, mode exit and Undo across a week step

**Title:** Leaving a week neither strands the mode nor collects old credits.

**Why this could break:** OIL mode is indexed by day, while money scans loaded and stashed weeks. The same Saturday index in a new week must not inherit either UI state or edits.

**SET UP:**

- Publish Ranger FO on S.
- Enter OIL mode and deny Saber on a different S event, leaving that edit unpublished.
- Note the history text and amendment state.

**DO:**

1. Use the desktop next-week arrow while still in OIL mode.
2. Inspect the same weekday in the new week.
3. Return to the original week and inspect S.
4. Navigate two more weeks away and back.
5. From the adjacent week, try Undo once; return to S and inspect which day changed.
6. Redo and recheck.
7. Inspect Ranger’s Leave War credit after every navigation.

**EXPECT:**

- Week stepping exits OIL mode immediately.
- The new week is editable and shows no stuck green mode, blanket or `✓ Done`.
- The original S decision/history remains attached to the original date.
- Undo from another week must never mutate the same day index in the wrong week. If global Undo supports the original action, returning to S shows that exact action undone; otherwise it must refuse clearly.
- Redo follows the same date-safe rule.
- Ranger’s previously issued FO never disappears merely because its week is no longer loaded.
- Returning to S restores the correct issued strips, pending decision and history.

**Which ruling(s):** OIL24, OIL29; week-step and cross-week Undo are unruled – judgement.

## 21. Ordinary weekdays, off days and read-only viewers see only usable controls

**Title:** No dead OIL buttons and no weekday visual pollution.

**Why this could break:** The desktop and phone entrances are rendered in different places, and permission changes can leave stale controls on an already-open board.

**SET UP:**

Prepare:

- Ordinary Tuesday with normal work.
- W as a public holiday or explicitly off-day-tagged weekday with work.
- S with work.
- An admin scheduler account and a read-only/member account.

**DO:**

1. Open the Tuesday board as admin on desktop and phone.
2. Open W and S as admin.
3. Open the same boards as the read-only/member account.
4. While an admin board remains open, change to a role/page without edit authority and try any still-visible OIL control.
5. Inspect normal schedule markings on all three days.

**EXPECT:**

- Ordinary Tuesday has no OIL Earn control, green strips, sentinel earn chip or OIL-mode chrome.
- W and S offer exactly one working entrance for an editable scheduler.
- A read-only/member viewer is not shown an OIL Earn button that will refuse or do nothing.
- Losing edit authority leaves no live OIL write control on stale board markup.
- Issued positive strips may still be read by viewers because they are part of the schedule.
- No surface displays `NO OIL`; absence of green means no earning.
- Decisions use neutral styling, not amber warning or red conflict styling.

**Which ruling(s):** OIL1, OIL17, OIL18, OIL20, OIL22.

## 22. Publish Undo/Redo and per-day amendment numbers

**Title:** Undoing publication is date-safe, and Saturday/Sunday each own AL1.

**Why this could break:** Publish is an undo boundary, and amendment numbering is per day. OIL reconciliation must follow the actual issued versions without duplicating history.

**SET UP:**

- Publish S and U with Ranger and Saber earning FO respectively.
- Make one OIL-only denial on each day.
- Re-sign both.

**DO:**

1. Publish S’s change.
2. Confirm S is AL1 while U still offers AL1.
3. Publish U’s change.
4. Undo U’s publish.
5. Inspect U’s issued label, working state, credit and history.
6. Redo.
7. Navigate away and back, then inspect both days’ amendment histories.

**EXPECT:**

- S publishes AL1 with one item.
- U independently publishes AL1, never AL2 because S already used AL1.
- Undo retracts only U’s latest issue and restores its working correction state; S remains AL1.
- U’s automatic credit follows the currently issued version.
- Redo restores U AL1 once, without creating AL2 or a duplicate issue record.
- Undo is silent until the shared database registers it; only then should history show the retraction line.
- Issued history retains signatures and the correct one-item count for each day.

**Which ruling(s):** OIL16, OIL27, OIL38, OIL39.

## 23. Automatic credits remain schedule-owned; manual awards stay separate

**Title:** Leave War cannot silently disagree with the published schedule.

**Why this could break:** If the generated credit can be cleared or edited like an award, reconciliation may recreate it, lose metadata or conceal a disagreement.

**SET UP:**

Publish Ranger FO on S. On the same date, add a separate manual HO award with a clear reason and giver.

**DO:**

1. Open Ranger’s S cell and inspect both records.
2. Attempt to edit or clear the automatic FO.
3. Edit the manual award’s reason/giver, then clear only the manual award.
4. Reopen the day and OIL tracker.
5. Change the schedule decision, publish it, and inspect again.

**EXPECT:**

- The automatic record reads `OIL earned`, `given by Weekend/PH`, with worked hours and `From the published schedule`.
- It has no Edit or Clear action in Leave War.
- The manual record reads `OIL award`, preserves its reason/giver and is independently editable/clearable.
- Clearing the award does not touch the automatic credit.
- Publishing the schedule denial removes only the automatic credit.
- There is no separate Leave War “remove generated OIL” door and no `NO OIL` marker left on the schedule.

**Which ruling(s):** OIL1, OIL22, OIL24.

## 24. Deployment cutover resets all dependent demo state together

**Title:** First load across the schema cutover does not mix old schedules with new money.

**Why this could break:** Clearing only credits would leave old published snapshots without frozen evidence, while clearing only schedules would leave orphaned inputs or Leave War cells.

**SET UP:**

This requires a controlled upgrade profile:

- In the pre-cutover build, create recognisable demo data: a published Saturday, an input, a Leave War bid and an automatic OIL credit.
- Close the browser cleanly so all state persists.
- Start this build against that same browser profile.

**DO:**

1. Load the app for the first time on this build.
2. Inspect the week, published status/version history, Inputs page and Leave War.
3. Reload the page.
4. Create and publish one new S OIL event.
5. Reload again and inspect the new state.

**EXPECT:**

- On first load, weeks including published snapshots, inputs and Leave War are cleared and re-seeded as one coherent reset.
- No fragment of the old automatic credit, bid, input or issued day survives beside the new seed.
- The reset happens once; a second reload does not clear newly created data.
- New publication produces a normal positive strip and matching Leave War credit.
- The user receives the expected release/reset notice rather than experiencing an unexplained partial loss.

**Which ruling(s):** OIL26.


tokens used
257,043
Below is the complete hands-on pass, ordered by likely financial harm. ★ marks the scenarios most likely to expose another missing surface or interaction.

Use a fresh disposable dataset for each scenario unless the scenario explicitly spans weeks. The dates below match the seeded week:

- Wednesday W: 15 Jul 2026
- Saturday S: 18 Jul 2026
- Sunday U: 19 Jul 2026
- “Publish” means complete CUR CK, SKED CK, PLANNED BY and APPROVED BY, then publish.
- Before checking money, record each subject’s OIL balance. FO should add 1; HO should add 0.5.
