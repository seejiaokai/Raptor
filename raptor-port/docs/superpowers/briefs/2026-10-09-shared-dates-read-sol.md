**Sol — independent read-only report**

**CHANGES REQUIRED: three source-supported failures.** No tests, builds or servers were run; no files were changed; neither reader’s report was read. This report is evidence, not approval.

Reviewed `cfcd40b7` on `claude/inputs-sans-calendar`. The three files in its source/test diff match the current checkout. The results below are source traces; the host should run the exact cases listed.

**A. Wrong lines**

**1. A fresh OIL answer can miss everyone already in the input — high consequence.**

Setup: freshly file an all-day shared Duty for A and B on Saturday, 17 October 2026. Both initially answer Yes. A subsequently changes his own answer to No. As the filer or an admin, reopen it, tap 17 October, add C, Save, and answer Yes.

Expected under D682: the latest answer replaces the answers of **A, B and C**, including A’s earlier No.

Actual source path: adding C forces the question in [inputedit.tsx:2082](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2082). However, the existing dates, hours and remarks have not changed. `oilOnly` is false because someone was added. The kept records therefore receive no answer; only C receives the fresh Yes. A remains No.

Cause: [inputedit.tsx:1548](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1548) and line 1570 apply the answer to unchanged kept records only when **nothing was added or removed**. This contradicts D682’s explicit reading that answering again after adding someone answers for everyone.

This writer logic predates this diff, but remains contrary to the live ruling claimed by this door.

Exact fix:

1. Add a connected failing regression for this sequence, asserting every person’s actual OIL value; repeat with a fresh No replacing earlier Yes answers.
2. When `commitGroup` receives a fresh answer, apply it to **every kept record and every added record**, whether their other fields changed or not.
3. Check permission for every kept record receiving that answer before writing, rather than only in the `oilOnly` case. Preserve the existing OIL-only stamping behaviour and original placement details.
4. Correct [groupwrite.test.ts:381](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/groupwrite.test.ts:381): it currently requires old answers to remain when a person is added, directly opposing D682.
5. Verify one Undo restores the previous individual answers and removes C; the scheduler’s refusal must still win.

**2. Changing dates while adding someone can split one shared input into two.**

Setup: freshly file a shared Meeting for A and B, 13–14 October 2026, 10:00–11:00, with remark `brief till 14 Oct`. Reopen, pick 20–21 October, add C, and Save. Repeat with C added before picking the dates.

Expected under D655, D681 and the contract: one shared input for A, B and C, with the same dates and remark `brief till 21 Oct`.

Actual source path:

- Kept records use `commitInputEdit`, which rewrites the date token at [inputedit.tsx:1039](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1039).
- Added records use the unchanged draft remark through `commitNewInput`, at [inputedit.tsx:1574](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1574).
- A and B receive `brief till 21 Oct`; C receives `brief till 14 Oct`.
- Remarks are a shared field, and [inputgroup.ts:57](/C:/Users/User/projects/Raptor/raptor-port/src/state/inputgroup.ts:57) groups records by those shared fields. The result is two entries despite the common group identifier.

Exact fix:

1. Add failing regressions for both orders of adding C and picking dates.
2. In `commitGroup`, derive one effective shared remark from the validated new dates when the saved entry’s dates changed. Reuse the existing date-token helpers and preserve surrounding prose.
3. Use that same effective draft for change comparison, kept-record edits and new-record creation.
4. Keep the picker itself from changing remarks. Preserve remarks-only edits and remarks without a recognised date token.
5. Assert identical shared fields, **one result from `entriesOf`**, one displayed entry, persistence after reload, and one Undo restoring the original people, dates and remarks.

Checking only that every record has the same group identifier will miss this failure.

**3. A first tap on the saved day can be silently replaced by a background move.**

Setup: freshly file a one-day shared Meeting for A and B on 13 October 2026. Open its window. Tap **13 October as the new start**. While that pick is half made, drag its bar behind the window to 22 October. Then tap 25 October and Save.

Expected: the deliberately picked start remains 13 October, or the window asks which start to keep. Keeping the picked start and completing the range should save 13–25 October.

Actual source path:

- The first tap sets `midPick` but leaves the draft’s date values equal to the saved values: [inputedit.tsx:2294](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2294).
- The following effect treats equality with the old value as “not touched” and silently adopts 22 October: [inputedit.tsx:1923](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:1923).
- `midPick` remains true. The next tap completes **22–25 October**, through [RangeCal.tsx:36](/C:/Users/User/projects/Raptor/raptor-port/src/ui/RangeCal.tsx:36).
- No start-date choice is offered.

Cause: the editor remembers the picking phase but does not remember that a date was explicitly picked when that pick equals the saved value.

Exact fix:

1. Add this exact failing connected regression.
2. Track explicit date picks separately from value comparison. A background start differing from an explicitly picked start must produce a clash, even when the pick equalled the old saved date.
3. Preserve the pending pick through “Keep mine”, a refused save and a re-found record. Reset it when a genuinely different record is seeded.
4. When external dates are accepted, reconcile the picking phase with the accepted dates.
5. Test moves before the first tap, between taps and after both taps. Assert the draft line, selected dates, clash choices and saved values.

Other A checks: year-end conversion and a record anchored to a different loaded year show no additional source failure. The title deliberately shows saved dates; the calendar and line derive from the draft. The calendar’s month view is seeded once, so following an off-month move need not automatically page to that month; that alone is not a finding.

**B. Missing lines**

Against §12’s R1–R11 roll-call, **checked, none**: the qualifying doors share this editor and [inputedit.tsx:2197](/C:/Users/User/projects/Raptor/raptor-port/src/ui/inputedit.tsx:2197). No additional qualifying door missing the calendar was found.

OIL: finding 1 is the missing application of an answer to every kept person.

Permissions, including Enter and a stale window: no additional bypass found. The display uses live permissions; the writer checks changed and removed records; the command gate independently checks authority.

Medical: the grouped Save branch refuses medical conversion even after the people are reduced to one. The existing one-person route must then ask its medical questions.

Leave clashes and published-day acknowledgement: the new route uses the existing group command and individual edit path. No new bypass was found. That is a source result, not a fresh runtime verification.

**C. Rules held in only one place**

D682 is effectively held at the question but incompletely at the writer: the sheet asks once for everyone, while the writer can apply the answer only to the added person. Findings 1 and its fix cover both locations.

The shared remark’s date-following rule is held for kept records but absent from the new records created in the same save: finding 2.

No additional permission or medical rule held only on screen was found.

**D. Tests**

- Ordinary movement, a one-tap one-day save, member-filer access and hiding the calendar from non-filers are covered. Removing `!readOnly` should make the existing visibility assertions fail: [groupeditor.test.tsx:436](/C:/Users/User/projects/Raptor/raptor-port/src/ui/groupeditor.test.tsx:436).
- No added test exercises a tapped start equal to the saved start followed by a background move. The existing background-change test moves dates **before any calendar pick**: line 468.
- No added test proves a half-pick is reset after “Discard and open” onto another saved one-day record. Removing the reset at line 1872 has no demonstrated failing regression.
- The fixtures use `brief`, without a date token. No added assertion proves a saved picker leaves a token-bearing remark untouched **before Save**.
- The date tests neither combine a token-bearing remark with adding someone nor assert one resulting entry using the complete shared fields.
- The new weekend test changes the dates of all kept records. It does not expose the unchanged-kept-record OIL failure, and the existing writer test positively enforces that incorrect result.

These are source coverage assessments; mutation tests were not run.

**E. Words**

D681’s readings 3, 5, 6 and 7 agree with the inspected routing. The ordinary source path supports one group command and one Undo.

The claims need the three fixes above before they are universally true:

- The first tapped start can be lost: finding 3.
- The saved result can cease to be one shared input: finding 2.
- A fresh OIL answer can fail to reach everyone: finding 1.

The contract at [ui-contracts.md:9512](/C:/Users/User/projects/Raptor/raptor-port/docs/ui-contracts.md:9512) and §12’s corresponding claims overstate those cases.

The hint correctly describes a range, but omits the supported one-day path. Add “For one day, tap the start and Save.” This is a clarity improvement, not another blocking failure.

**F. Exclusions**

All three findings can recur with freshly filed data. None requires repairing old demo records.

No finding is raised for ordinary one-person date editing, phone day-button size, one schedule row for a group, or the already-filed Undo, To-Go and check-seen items.

**Ranked cases for the host**

1. **Fresh OIL answer after adding C.** Use finding 1’s all-day Saturday setup; reselect the same day, add C, answer Yes. Expect all three records to contain `2026-10-17: 1`; repeat with No. An unchanged old answer confirms the failure; identical fresh answers on every record disprove the source prediction.

2. **Date-token remark plus added person.** Use finding 2’s Meeting and exact remark; run both action orders. Expect one entry, identical `brief till 21 Oct` remarks and dates, including after reload. Different remarks or two entries confirm the failure.

3. **Same-day first tap, then background drag.** Use finding 3’s sequence. Expect a start-date clash; “Keep mine”, then 25 October, must save 13–25 October. Silent replacement with 22–25 confirms the failure.

4. **Weekend transitions and refusal.** Fresh shared all-day Duty on Friday 16 October; move to Saturday 17, answer Yes; move to Sunday 18, answer No; move to Tuesday 20. Expect one question where needed, current-day answers on all records, and no weekend credit on Tuesday. Repeat with a scheduler refusal on Saturday: a filer’s Yes must not override it. Any disagreement between question, records and credited day disproves the expected result.

5. **Rights change while the question is open.** As an authorised member-filer, open a shared Duty and trigger its OIL question. Turn off member filing for others before answering. Expect the save to refuse for everyone and preserve all original records. Any partial save or another person’s changed record disproves the permission result.

6. **Picking phase through record changes.** Half-pick a saved shared one-day entry; request another entry. “Keep editing” must retain the first pick. “Discard and open” must seed the second entry so its first tap starts a new range. Separately re-find the first record after a refused command and exercise both clash choices. Any unexplained old start, lost draft or Save without resolving a clash disproves the expected result.

7. **Year boundaries and the row’s anchor.** With 2026 loaded, save a shared Meeting spanning 30 December 2026–2 January 2027; reopen and move it to 31 December–3 January. Separately open a freshly filed 2027-anchored record while 2026 is loaded. Expect the picked years to survive Save and reload for every person. A shift to the loaded year disproves the conversion result.

8. **Existing save guards through this door.** In separate fresh setups, move shared leave onto one person’s conflicting leave; attempt a shared-to-medical conversion after reducing the draft to one person; move a shared Meeting onto a published day. Expect respectively: whole-save refusal naming the person; refusal requiring the separate one-person medical route; and pending acknowledgement without silently changing the published programme. A partial save, skipped medical question or automatic acknowledgement disproves the expected result.

**Explicit negatives**

- Calendar access: checked, no additional missing or wrongly exposed door found.
- Permission backstop: checked, no additional keyboard or stale-window write bypass found.
- Medical exclusion: checked, enforced in grouping and grouped Save.
- Drag length: checked, the same delta moves both ends.
- Year handling: checked, explicit years and the record’s anchor are retained.
- Picker remarks: checked, this saved-input branch does not rewrite them while picking.
- Persistence and Undo route: checked, Save remains inside the existing group command.
- Published acknowledgement: checked, no direct acknowledgement bypass introduced.
- Title versus draft line: checked, their different purposes agree with the contract.

**Verdict: CHANGES REQUIRED** — apply fresh OIL answers to every kept person; use one effective remark for kept and added people; preserve an explicitly picked start against background replacement. Add the specified regressions and have the host run the ranked cases.

Rulings: none.

