# Round 1 — Astra

## 1. Diagnosis

**Keep the three pages, but give an item the same editing rules wherever it appears.** Each page serves a useful job. The confusion comes from the boundaries between them.

Four root causes:

- **Where something was entered still decides what can be done to it.** Two leaves that look equivalent can offer different actions. Changing one on Inputs can even change what the Leave War subsequently allows.
- **The thing selected and the thing changed are sometimes different.** A person’s box can stand for a group. A person’s row can change only him through one control and everyone through another.
- **Bidding, recording an absence and placing a commitment on the programme are mixed together.** These are different decisions, but the windows often distinguish them by their page rather than their purpose.
- **Time controls and movement rules belong to individual screens.** People must learn several ways to describe or move the same absence.

I checked these foundations against the current code: the editing windows, group changes, permissions, leave approval, calendar movement and time conversion. This is a design proposal, not a browser walk; visual fit and ease of use remain to be demonstrated.

## 2. The model, in one paragraph a scheduler could read

The Leave War is where we bid for leave and judge manning over the coming months; Inputs is where members record and correct their day-to-day commitments; the schedule is where schedulers plan the work. Wherever an item appears, tapping it opens the same window, with the same people, dates, hours and actions. Your rights follow the item, not the page. A bid waits for a decision; an approved or directly filed absence is an input. A group input has one set of details for everyone, and changing one person is an explicit choice. Dragging an item across dates moves its dates; dragging a person onto a schedule row changes who is in it. Saving an input updates the current information, while any affected published schedule waits for a signed amendment.

## 3. What each page offers

This table describes the **proposed end state**.

The **item window** is one consistent window, opened over the page being used. Its fields vary only with the kind of item and the person’s rights. It closes back to the same place.

| Item | Leave War | Inputs | Schedule |
|---|---|---|---|
| **Leave approved from a bid** | Tap to open the item window; change dates, duration, remarks or documents; Move or drag across dates; delete. Admin may change its people under the proposal below. Its bidding history remains available. | The same item window; calendar drag moves its dates. | Scheduler opens the same window, including dates and people; edits time or remarks on its row; uses the ordinary input drops. |
| **Pending or refused bid** | Tap to open the bid version of the window. Member adds or changes his own pending bid on open dates and may withdraw it after bidding closes. Admin approves, refuses or revises it. Move uses the grid. | No bid card: it has not become a filed input. | No absence row: it has not been approved. |
| **One-person input** | When it belongs on the war, tap to edit, Move, drag or delete here. Adding another item remains possible from the day’s window. | Add or edit through the item window; move by calendar drag. | Scheduler adds or edits through the same window, with a date range and people picker; time and remark remain editable on the row. |
| **Group input** | One box per person because the grid answers who is away. Opening any box identifies the whole group. Move shifts the whole input; the explicit one-person action is described below. | One card or bar naming everyone. The window edits the group; a calendar drag moves the group. | One row of pucks everywhere, including Unavailable. Row fields change everyone. Drop on a puck replaces; drop on the extra place adds; drag off removes. |
| **Medical** | A medical absence shown here opens the same medical window; dates, hours, remarks and documents can be corrected here. Move uses the same checks as editing its dates. | One person’s medical window, with its document and existing overlap/upchit handling. | One person’s row; tap opens that medical window. A people drop is refused with its reason. |
| **OD, course and Attach** | File directly, without a leave-bid decision. Tap to edit locally; move dates by Move or drag. They appear here while their existing manning rules require it. | One item, for one or several people; full editing and calendar movement. | Full editing and ordinary input drops. Scheduler may change where it stands through the item window or the existing schedule controls. |
| **Duties and commitments** | Show those that count under Unavailable. Tap to edit or move them here. A new Other started here defaults to Unavailable. | File for oneself, or for others where permitted; edit and drag through the usual window and calendar. | Plan on the Ground Programme or under Unavailable. Personal Inputs remains the accept/Reject list. The item window also offers the scheduler’s placement actions, so no trip elsewhere is needed. |
| **ALL / ALL AVAIL** | No individual absence boxes: these represent a changing crowd, not leave for named people. | File and edit the eligible one-day commitments through the item window; calendar drag keeps them one day. | Show on the Common Programme. Edit shared details through the same window; open the crowd to inspect or exclude people. They cannot become group leave or medical. |

The common limits are short:

- Members keep their existing rights over their own inputs. Filing for others remains limited to permitted commitments. Whole-group editing stays with the authorised filer or scheduler.
- Once a scheduler has placed a commitment, a member cannot change that placement. Changing his own dates or remarks does not remove that restriction.
- View-only Sched stays read-only.
- **Delete removes the input; Reject changes its scheduling treatment.** They remain separate actions.
- OIL awards, earned credits and postings keep their own controls. An absence drag never moves an earned-leave award.
- On a day holding several entries, the day’s window lists them with their actions and an Add action. The user chooses the entry, without being sent to another page.
- Every drag has a tap-and-keyboard alternative through Move, the date calendar or the people picker.

## 4. The group input

**“Change for Cutter only” belongs on every page where a named group input can be edited.** Making it a Leave War exception would create another rule to remember.

Opening a group input shows everyone first. Shared fields clearly belong to that group. The one-person action is available **before** editing, rather than being an unexpected choice after Save.

- **Leave War:** tapping Cutter’s box already identifies Cutter. The window offers “Change for all 3 people” and “Change for Cutter only”; it never asks the user to pick him again.
- **Inputs:** opening the card starts with the group. Selecting Cutter’s puck offers the same one-person action.
- **Schedule:** editing the combined row’s time or remark changes everyone. The row’s item window offers the same people and one-person action as Inputs.

Choosing Cutter only prepares his own input, carrying the original dates and details for correction. **Nothing separates until a changed version is saved.** Cancel, an unchanged Save or a refused Save leaves the group intact.

On successful Save, Cutter leaves the original group and his own input appears. The others retain their details. It is one operation, with one Undo. A change affecting only part of his original dates must preserve and show the remaining days explicitly; it must not quietly remove his other days.

A member can use this for himself where he could already take himself out and file his own input. It grants no right to change another person or to clear the scheduler’s restrictions.

Documents are different: adding Cutter’s private paper does **not** separate him. His paper remains attached to him within the group, visible only to him and admins. If he later leaves for his own input, his paper follows him; nobody else’s does.

For movement:

- A group’s calendar bar or Leave War Move means the whole group and the whole date range.
- Before movement, the selected group’s visible boxes light together, and the move display identifies its people and dates, including people outside the view.
- Selecting several boxes of the same input moves that input once.
- A selection containing other kinds states what will move and what will stay.

I would not squeeze a group count into each tiny half-day box. The selected group, its window and the move display should carry that information. This changes D2778’s requirement for a shared mark inside the box.

ALL / ALL AVAIL remains a meaningful exception: an unnamed person inside a changing crowd is not a named group member. His crowd exclusion and any separate commitment must be handled explicitly through the crowd’s controls.

## 5. Time

**Use one set of controls for filed inputs, with a deliberate restriction for bids.**

For filed leave, medical, OD, course, Attach and commitments, use the same Duration choices wherever opened:

**Whole day · AM · PM · Custom**

Custom reveals the start and end times. A date move preserves those hours. The date range stays visible, and the window makes clear that the hours apply to each date in that range.

A **bid** keeps Whole day, AM and PM. Bidding is a decision about leave days and half-days; it does not need to become an appointment planner. Once approved, its input can be corrected using the same controls as any other filed leave.

The Leave War keeps its dense half-day grid. It does not become an hourly calendar. However, opening a custom-time item must show:

- its actual hours;
- how much leave it uses, where applicable;
- how it affects the war’s manning count.

For example, a 10:00–14:00 leave keeps those exact hours on the schedule while the war currently treats it as covering both halves. That distinction must be visible where the hours are edited. Medical keeps its existing counting rule, including the six-hour rule; this redesign does not silently change balances or manning.

Adding AM and PM shortcuts to OD and course changes D1350’s whole-day-only filing from the war. Removing the separate trip to Inputs for an Other’s custom hours changes D1365.

## 6. What changes, and what stays

| Ruling or existing direction | Proposed treatment |
|---|---|
| **D1724: full editing on the Leave War** | Fulfil it through the common item window and local Move/Delete actions. This is already agreed direction, not a fresh question about whether editing should be allowed. |
| **D1166, D1177, D1225: bidding dates and everyday leave** | Keep open dates governing bids, withdrawal of pending bids after closure, and management’s verbal approval for everyday leave changes. Extend direct filing to an explicit action on the war, instead of making Inputs the required location. |
| **D1548, D1552, D1553, D1565: held-day windows** | Keep access to existing entries and adding more. Replace the page-dependent windows and directions elsewhere with the common day list and item window, following D1724. |
| **D1542: opening approved leave from a clash** | Open its item window over the current page, including when the person has no visible grid row. |
| **D2770 and D2778: no one-person shortcut** | Change them: provide the explicit one-person action everywhere for named groups. Keep the rule that ordinary group edits affect everyone. |
| **D735 and D681: one time and one date range per group** | Keep them. A deliberate one-person change produces separate input(s), rather than hidden exceptions inside the group. |
| **D2778: war-approved leave remains one person’s** | Change this restriction for approved inputs: an admin may add people regardless of where the original leave began. Adding someone records a new direct filing for him; it never claims that he won the original bid. Individual approval history remains intact. |
| **D1145, D1350, D1365: duration** | Keep AM/PM bidding and the half-day grid. Standardise filed-input controls and allow their exact hours to be changed locally. |
| **D655, D763, D1388, D1398: permissions** | Keep the limits on filing for others, changing group membership and overriding a scheduler’s placement. The one-person shortcut combines actions already permitted; it must preserve those limits. |
| **D2781: personal documents within a group** | Keep it. A document upload does not change membership or make a separate leave. |
| **D756 and D1346: records and joining** | Keep one record per input with its people. Separate inputs never join themselves merely because their details match. |

Of the combined-row job:

- **Keep:** one row under Unavailable too; medical individual; add/replace drops; no routine drop confirmation; the original seat left unchanged; adding or removing a person affects every date; existing bell notifications. These retain D2771–D2777, D2779 and D2780.
- **Change:** give a scheduler the full date range and people picker when adding or editing from the schedule. Apply the one-person action across all three pages.
- **Keep D2773’s distinction:** Personal Inputs is the decision list, not another drop surface. A refused drop must say why; the proper row can be brought into view directly.
- **Drop:** silent separation from a person’s remark or time edit, page-based editing restrictions, and the proposed war-only one-person shortcut.

The fixed points remain: signed amendments for published schedules, OIL as earned leave, one record per input, and the database work at the end.

## 7. Cost, risk and build order

This is a substantial behaviour change. The common window is the smaller part; group separation, approval history and changes spanning published days carry most of the risk.

**The smallest useful first delivery is the same complete item window from all three pages.** Bring dates and the permitted actions to the item, and make the group unmistakable. This removes the largest source of confusion before adding more gestures.

After agreement on the drawings, build in this order:

1. **Common opening and editing.** One-person inputs first, plus clearly identified whole-group editing. Keep the user on the page. Remove the “change it elsewhere” restrictions only as the corresponding action becomes available.
2. **Honest group rows and deliberate individual changes.** Deliver the combined rows, one-person Save, owned documents and Undo together. Eliminate the remaining silent separations.
3. **Consistent movement and creation.** Apply the ruled schedule drops; extend Leave War movement to eligible inputs; provide group creation and full dates from the schedule; standardise Duration.
4. **Approval-origin restrictions.** Allow an admin to extend previously bid-approved leave into a group while retaining each person’s approval story. Do not release this until returning or revising one person’s bid cannot affect the others.

The checks must follow the consequences: a five-day group across two published weeks; one member leaving early; a medical overlap; an OIL-earning weekend; a private paper; a person changing squadron; refusal, Cancel and Undo. Compare the three pages after each action. Published days must retain their issued version until amended.

A person’s separation must save wholly or not at all. It must preserve the scheduler’s placement, cancellation and OIL decisions where applicable, and must not create duplicate earned leave.

Keep the year grid, dense schedule rows and existing button sizes. Group highlighting must not make the whole year redraw during a drag. Check speed and touch behaviour on a slow computer and the iPhone.

**Platform flag:** the repository identifies no obstacle to the common window and gestures in the planned Power Apps code app. I have not verified the platform externally in this round. At the database step, private-document access and saving a separation wholly or not at all need confirmation and testing under the IT side’s actual restrictions. Hiding controls alone cannot enforce either promise. No database work starts now.

## 8. What to draw for him

Draw these six views using the app’s existing appearance, with the relevant area marked:

1. **Leave War, member’s phone:** an open-date bid beside an approved leave opened for correction, showing the distinct tasks and the common controls.
2. **Leave War, group movement:** Cutter’s box selected, the other members identified, the whole-group move shown, and a mixed day retaining Add and each entry’s actions.
3. **Inputs, member’s phone:** the group card, Cutter’s one-person action, his edited dates and private document, with the result after Save and the unchanged result after Cancel.
4. **Schedule, desktop:** a six-person Unavailable row, clear replace/add landing places, shared time editing, and the full item window including dates.
5. **Custom hours:** the same timed absence opened from the war and schedule, with exact hours and the war’s count explained beside the relevant value.
6. **Published dates:** a group change spanning several days, showing the changed current input and the published days awaiting amendment.

Each drawing should include the keyboard route and the resulting feedback, not just the resting window.

## 9. Questions only he can answer

These are choices for the agreed drawings, not assumptions a builder should treat as approval.

1. **When Cutter returns earlier than the rest of a group, should “Change for Cutter only” be available wherever that group is opened?**  
   **Recommend yes.** Separate him only on a changed Save, with Cancel leaving everyone untouched. This changes D2770 and D2778, but removes the repeated take-out-and-refile task without introducing hidden exceptions.

2. **When a scheduler adds someone to leave that originally came from an approved bid, should that work like adding him to other group leave?**  
   **Recommend yes.** Record the added person as directly filed by the scheduler, while retaining the original bidder’s approval history. Otherwise the item’s birthplace continues to determine its controls.

3. **When a member has already obtained management’s approval and is looking at the Leave War, may he file that leave there?**  
   **Recommend yes, through an explicit “File approved leave” action.** Bidding remains the primary action on open dates. This extends D1166’s everyday workflow to the page already in use without presenting an ordinary bid as approved.

4. **When an OD or course covers only a morning or afternoon, should the person be able to enter that directly on the war?**  
   **Recommend yes.** Use the same Duration controls as Inputs, keeping Whole day as the initial choice. This changes D1350 and makes the recorded time follow the actual commitment.

Rulings: none this session. No files changed.