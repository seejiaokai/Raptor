**CHANGES REQUIRED — Astra’s independent read-only report**

Reviewed the change at `cfcd40b7` on `claude/inputs-sans-calendar`. The live source and tests named in the brief match that commit. I changed nothing, ran no tests or app, and did not read the other reader’s report. The findings below are source traces; the host cases are still to be run.

**A. Wrong lines — four findings**

**A1 — Save can report success without moving the input to the selected year.**

Location: [inputedit.tsx:1535](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1535), especially the date comparison at 1538 and early return at 1550.

Create a shared Meeting for two people on **13 October 2027**, while 2027 is loaded, with remark `brief`. Its stored date is `Oct 13`, anchored by `yr: 2027`. Load 2026, open that input, select **13 October 2026**, and Save.

The selected date normalizes to `Oct 13` too. The comparison ignores `yr`, finds no change, and returns success without calling the writer. The window closes with “Input updated”; both records remain in 2027.

This breaks D681 readings 1–2 and the contract’s promise that the date line shows what Save will write. It also occurs with freshly created data.

Fix:

1. Compare the records’ resolved start and end dates, including their stored year, with the draft’s actual dates.
2. Send an actual year change through the existing writer, which updates the year anchor.
3. Preserve the no-change return for genuinely identical dates.
4. Add a regression checking both people’s resolved dates and one Undo.

**A2 — Changing dates and adding someone can split one shared input into two entries.**

Locations: [inputedit.tsx:1568](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1568), the added-person path at 1574, existing-record remark handling at 1038, and new-record creation at 859. The visible split follows from [inputgroup.ts:23](C:/Users/User/projects/Raptor/raptor-port/src/state/inputgroup.ts:23).

Start with a shared Meeting for A and B on **13–14 October 2026**, remark `brief till 14 Oct`. Add C in its window, select **20–21 October**, and Save.

The picker correctly leaves the draft remark untouched. But the two write paths then disagree:

- A and B pass through `commitInputEdit`, which changes the remark to `brief till 21 Oct`.
- C passes through `commitNewInput`, which copies `brief till 14 Oct`.

All three records retain the same group identifier, but grouping also compares remarks. C therefore appears as a separate entry with a stale last-day remark.

This breaks D655’s one shared input and the contract’s promise that the “till” date follows the saved last day.

Fix:

1. At the shared save boundary, derive one effective remark for the date change, using the existing date-tail helpers.
2. Pass that same effective remark to both retained and added people.
3. Keep the editing draft untouched while dates are being picked; preserve prose and do not invent a date tail where none exists.
4. Test identical remarks **and one visible grouped entry**, then Undo. Checking only a shared group identifier misses this failure.

**A3 — Switching inputs can seed the calendar from the previous input’s month.**

Locations: [inputedit.tsx:2291](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2291), the draft reseed at 1868, and [RangeCal.tsx:22](C:/Users/User/projects/Raptor/raptor-port/src/ui/RangeCal.tsx:22).

Create shared input A on **13 October** and B on **10 December**. Open A, then open B from the page behind the window without first closing A.

The render receives B’s identity before the layout effect replaces A’s draft. B’s new calendar key therefore mounts a calendar seeded from October. The effect then supplies B’s December dates, but the calendar’s displayed month is initialized only once. The title and date line say December while the calendar still displays October.

This also affects an accepted “discard and open” transition. It contradicts the promised calendar opening on the saved dates.

Fix:

1. Keep the accepted record identity and its seeded draft together when mounting the calendar.
2. Mount or reset the calendar for an accepted record switch only after the corresponding draft is available.
3. Do not reset its month on every date tap; that would disrupt deliberate month navigation.
4. Test a clean October-to-December switch, “discard and open,” and “keep editing.”

**A4 — “Take theirs” can leave a discarded half-pick active.**

Locations: [inputedit.tsx:2480](C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2480), picker state at 2292–2294, and [RangeCal.tsx:36](C:/Users/User/projects/Raptor/raptor-port/src/ui/RangeCal.tsx:36).

Start with a shared one-day Meeting on **13 October**:

1. Tap **20 October** in its window, beginning a new range.
2. Behind the window, drag the saved input from **13 to 14 October**.
3. Resolve the start-date conflict with **Take theirs**.
4. Tap **15 October**, then Save.

“Take theirs” restores the saved start, 14 October, but leaves `midPick` true. The next tap is treated as an end date. Save writes **14–15 October**, rather than treating 15 October as the new one-day start.

After accepting the saved one-day dates, the contract’s “first tap is always the NEW START” should apply again.

Fix:

1. Reconcile the picker phase when a background date is adopted.
2. When “Take theirs” replaces the pending start with the saved dates, mark that selection finished.
3. Preserve a genuine pending pick when choosing “Keep mine,” retrying a refused save, or re-finding the same record.
4. Add the sequence above and its “Keep mine” counterpart as regressions.

**B. Missing lines and doors**

Checked, none beyond the failures above.

The qualifying doors share the same editor: month bar and day entry (`InputsCal.tsx:329,679`), shared List row (`InputsPage.tsx:1244`), and SANS day entry (`SansDay.tsx:65`). The `datesHere` condition at `inputedit.tsx:2197` matches the roll-call’s Inputs-page, saved, shared, editable scope.

For the remaining roll-call:

- R5–R6: read-only users have no picker; the form is inert and Save is withheld.
- R7: the board/week dialog is excluded.
- R8: the bell opens the same editor and therefore uses the same permission condition.
- R9–R10: ordinary single-person and medical entries do not acquire this shared-date door.
- R11: no additional editor door identified.

The shared save checks OIL for **every retained person**, not just its representative (`inputedit.tsx:2087`). Medical conversion is stopped before that branch can skip the medical questions (`2077`). Normalization, leave handling and published-change processing remain on the existing command path. I found no new bypass; the published-day result still needs the host check below.

**C. A rule enforced only on screen or only at the write**

Checked, none introduced by this change.

The screen checks every shared record’s edit permission (`inputedit.tsx:2175`). The shared command checks changed records again (`1544`), individual writes check permission (`952`), and the mutation gate applies the ownership rules (`state/perms.ts:538`; `state/store.ts:166`).

Thus hiding the calendar is not the sole protection against Enter, a stale window, or a direct write attempt.

**D. Tests missing a wire**

The new tests at `groupeditor.test.tsx:396` cover basic date changes, one-day selection, permissions, OIL, ordinary background following and SANS. They miss:

- The year-only change in A1.
- Different remark normalization for retained and added people in A2.
- Switching shared inputs in different months in A3.
- Accepting an external date during a half-pick in A4.
- Preserving a half-pick through refusal or re-finding the representative.
- Explicitly proving that date taps leave the remark field untouched.

For the brief’s suggested mutations:

- **Remove the new-record `midPick` reset:** no new test exercises a half-pick followed by an accepted record switch.
- **Remove `!readOnly`:** the existing negative assertions at `groupeditor.test.tsx:442,446` should fail. This wire is covered.
- **Rewrite the remark in the saved-input picker:** the new tests do not directly assert the untouched remark or its interaction with a background remark change.

The “still one shared input” assertion at line 408 checks only group identifiers. It should also check the entry produced by `entriesOf`, which considers remarks.

These are source-based coverage conclusions; I ran no mutation tests.

**E. The words**

Against D681’s seven readings:

1. **Existing window and two-tap picker:** implemented, but the record-switch and conflict transitions have A3–A4.
2. **One change for everyone, one Undo:** the command structure supports this; A1 skips the intended change, and A2 breaks the shared entry.
3. **Filer/admin authority:** consistent with the screen and write checks.
4. **OIL question for new qualifying days:** each retained person is examined; missing or stale answers bring back the shared question.
5. **Medical entries never shared:** consistent with grouping and the save guard.
6. **Dragging preserves length:** this diff does not change that route.
7. **Ordinary single-person editing unchanged:** consistent with the condition.

The contract at `ui-contracts.md:9507` is stronger than the implementation in A1–A4. In particular, the promises about a finished saved range and the remark following its last day are not universally met.

The hint at `inputedit.tsx:2384` is truthful for a range. It also works for one day if the same day is tapped twice, but omits the supported shortcut: **one tap, then Save**. That omission is not a separate blocking finding.

Keeping saved dates in the title and draft dates below the calendar is deliberate and explained; I found no separate title defect.

The evidence sheet’s §12 accurately identifies the intended doors and states its published-day check was inherited. Its broad claims about switching, background following and people-plus-dates do not cover the specific sequences above. Its reported walk is host evidence, not a walk I independently performed. I have not reopened the already-filed shared pending-count issue.

**F. Exclusions**

All four findings recur with newly created inputs. Clearing demo data will not prevent them; no migration is proposed.

I have excluded ordinary single-person date controls, phone day-button size, grouped schedule rows, and the three named outstanding items: Undo by others, shared pending counts, and check-seen behavior.

**Ranked host cases**

Use newly created inputs, eligible people A/B/C, and no unrelated overlaps unless specified.

| Rank | Setup and action | Required result; what would disprove the finding or check |
|---|---|---|
| **1** | While 2027 is loaded, create A/B’s Meeting on **13 Oct 2027**, 10:00–11:00, remark `brief`. Load 2026, open it, tap **13 Oct 2026**, Save. | Both resolved dates become 2026; one Undo restores 2027. If the present code does this, A1 is disproved. Check actual years, not just `Oct 13` labels. |
| **2** | A/B Meeting **13–14 Oct 2026**, remark `brief till 14 Oct`. Add C and pick **20–21 Oct**, Save. Repeat with dates picked before adding C. | All three have `brief till 21 Oct` and form one entry. One Undo restores the original people, dates and remark. If both orders already satisfy this, A2 is disproved. |
| **3** | A/B one-day Meeting **13 Oct**. Tap **20 Oct**; behind the window drag the saved input to **14 Oct**; choose **Take theirs**; tap **15 Oct**, Save. | Saves **15 Oct only**. If present code does so, A4 is disproved. Companion: “Keep mine,” then tap **21 Oct**, must retain **20–21 Oct**. |
| **4** | Shared A on **13 Oct**, shared B on **10 Dec**. Open A, then B without closing. Repeat after a half-pick using “discard and open.” | B opens on December with its saved selection. Correct behavior in both sequences disproves A3. “Keep editing” must preserve A’s draft and calendar position. |
| **5** | A/B Meeting **30 Dec 2026**. Pick **31 Dec 2026–2 Jan 2027**, answering any OIL question, Save and reopen. | Both resolve to the exact cross-year range; one Undo restores 30 December. A reversed, truncated or wrong-year result fails the check. |
| **6** | With an editable A/B window and a half-pick open, revoke the filer’s authority to change the other person’s input. Try Enter and Save; also exercise the shared command directly. | No dates change for either person. A partial or unauthorized write fails the check. |
| **7** | A/B Meeting **16 Oct 2026**. Move to **17 Oct**, answer OIL; move to weekday **20 Oct**; then move to **24 Oct**. Include differing standing answers before the final move. | A new qualifying day is checked for every person and answered once for all; no out-of-span answer earns time off. No partial save before the editor’s answer. A skipped required question or wrong person’s answer fails the check. |
| **8** | Publish a schedule covering a shared input and its intended destination. Move its dates through this window, inspect the published view before acknowledgement, then acknowledge. | The published result stays unchanged until the scheduler acknowledges the change, then reflects it. An immediate published change fails the check. Do not assert an aggregate pending count; that is already a separate item. |

**Explicit negatives — source checks only**

- No new permission bypass found, including the remark’s Enter route.
- No missing qualifying editor door found in R1–R11.
- No first-person-only OIL check found in this save route.
- No new shared-medical conversion bypass found.
- No separate mutation or history route introduced; accepted writes still use the existing batch.
- No direct published-schedule write introduced.
- No separate defect found in the saved-title/draft-line distinction.

**Verdict: CHANGES REQUIRED.** Fix A1’s year comparison, A2’s shared remark handling, A3’s record/month reseeding, and A4’s picker phase after accepting external dates. Add their regressions and have the host run the ranked cases. This report is review evidence, not approval.

Checks: source review only; no tests, builds or runtime walk performed.  
Rulings: none this session.

