# Astra report: late changes on a published day

The controlling test rule is:

- The working copy changes immediately.
- The current issued version does not change.
- Each affected published day shows the net pending change to the admin.
- All four sign-offs fall.
- The pending list describes the change in the app’s language.
- Returning exactly to the issued state clears the count and restores the sign-offs.
- Publishing the next AL makes the working state the new issued state.
- Each day remains independent.

## Door roll-call

Every writer that must enter this flow:

| Writer | Production gesture | Working-copy sign |
|---|---|---|
| Inputs | Add, edit, delete, re-date, change span/person/type/remarks, all-day ↔ timed | Inputs row plus affected edit-week/board rows, warnings and availability |
| Input filing | Put under Unavailable, accept onto Ground Programme, take off | Personal Inputs, Unavailable or Ground Programme |
| Calendar/input row | Date drag, inline time or remarks edit | Same input on its new date or with its new value |
| Unavailable row | Drag the puck to another person | New person appears unavailable |
| Leave War | Approve, unapprove, move or delete approved leave | Leave War cell and linked Inputs row |
| Leave War remarks | Edit the published leave’s remarks | Leave War remarks editor and working Unavailable row |
| Medical | File/edit a downchit; file an upchit that trims or closes it | Medical/Inputs pages and working availability/warnings |
| SANS Availability | File, edit or delete an offer | Working SANS panel, badges, picker reasons and advisories |
| Other/activity request | Add normally or file under Unavailable | Ground Programme or Unavailable, as chosen |
| Quals | Add or lapse a relevant qualification | Quals page and working warnings/badges |
| Logic | Change a rule setting | Logic page and working derived values/warnings |

A member may add, edit or delete only their own inputs. Moving an input to another person, editing qualifications or rules, signing, publishing, loading versions, switching plans and unpublishing remain admin actions.

## Reader roll-call

The new working state should appear immediately on the Inputs, Leave War, Medical, Quals and Logic pages, and on the live edit week and live board.

The old issued state must remain on:

- View-only Sched by default, desktop and phone.
- A board showing an issued version.
- An issued-version preview on the edit week.
- The day-information panel opened from an issued face.
- The warning list and ALL AVAIL reasons opened from an issued face.
- Print and CSV.
- The desktop next-week preview when its day is already published.
- Every previously issued Original or AL inspected later.

View-only Sched’s clearly labelled “Working draft” choice should show the new working state. The admin’s live edit week and board should show both the new state and the pending controls.

## Ranked scenarios

1. **Unpublished neighbour changes a published day**

   Setup: Publish Monday with a clean issued result; leave Sunday or Tuesday unpublished. Action: add, edit, move or delete a timed input on the neighbour so its midnight tail, crew rest or seven-day run changes Monday. Expected: Monday gets one pending item, all four sign-offs fall, Monday’s issued warning remains unchanged, and its working warning changes. The list should name the neighbour’s input and its effect on Monday. Disproved if Monday silently changes, stays at zero, or only the neighbour receives a mark. Surfaces: edit week, board, View-only Sched and warning/ALL AVAIL overlays; include the previous week crossing into Monday.

2. **A rule change reaches derived output and exports**

   Setup: Publish a day with a blank brief time and warnings governed by editable Logic settings. Action: change brief lead, crew rest, maximum run, open-ended duration or another applicable rule. Expected: the Logic page and working copy use the new setting; the issued face, issued overlays, print and CSV retain the issued answer; each genuinely affected published day gets one pending item per changed setting and loses its sign-offs. Disproved if the printed/CSV brief or issued warnings change before reissue, or if unaffected days become pending. Surfaces: Logic, edit week, board, View-only Sched, print and CSV.

3. **Medical downchit and upchit cascade**

   Setup: Publish a day with the person fit, and separately publish a day while a downchit is in force. Action: file a new downchit; then test an upchit that trims, splits or closes a medical period. Expected: Medical and Inputs show the current truth immediately; the working schedule changes; the issued schedule keeps the issued fit/unfit state until reissue; the admin sees one logical medical-status change per affected day and the sign-offs fall. Disproved if medical remains live on the issued face, if a trimmed older record vanishes from history, or if one upchit produces contradictory counts. Surfaces: Medical, Inputs, edit week, board, View-only desktop/phone, day information and ALL AVAIL.

4. **Qualification added or lapsed**

   Setup: Publish a day where a scheduled person’s qualification controls a warning or visible badge. Action: add or remove that qualification. Expected: Quals and the working copy update; the issued qualification display and warning stay frozen; the affected day becomes pending and unsigned. Changing the qualification back clears the pending item. Disproved if only the warning freezes while the badge changes, or vice versa. Surfaces: Quals, week, board, View-only desktop/phone, warning list and issued previews.

5. **Leave War approval, remarks, move and delete**

   Setup: Publish days before a leave request is approved, and separately publish with approved leave already present. Actions: approve; edit remarks; unapprove; move one or several approved days; delete approved leave. Expected: every affected published day independently follows the freeze/pending/sign-off rule; remarks-only edits count even when operational tasking is unchanged; a move creates one net item on each day it leaves or enters. Disproved if the Leave War and Inputs disagree, the issued Unavailable row changes, or a range is treated as one week-wide amendment. Surfaces: Leave War, Inputs, week, board and View-only.

6. **SANS Availability**

   Setup: Publish with a SANS person planned in a seat, and repeat with the person not planned. Action: file, edit and delete SANS Availability. Expected: working SANS cards, badge, warning and picker reason update; the issued versions remain as issued. Because it is a member input, even the no-visible-effect case still tells the admin that the input changed. Disproved if only one of the SANS panel, warning or picker freezes. Surfaces: Inputs, SANS panels, board, warning list, ALL AVAIL and View-only where the result is drawn.

7. **Accepted activity retyped after publication**

   Setup: Publish an accepted Other/activity request whose source type determines whether an SC MAIN clash is red or amber. Action: retype the source input without moving its issued Ground row. Expected: the working clash grade changes, the issued grade remains unchanged, one input change is pending and the four sign-offs fall. Disproved if the frozen row reads the live source type. Surfaces: Inputs, Ground Programme, board and warning list.

8. **Drag an Unavailable input to another person**

   Setup: Publish a leave or other Unavailable row for one person. Action: as admin, drag it to another person. Expected: the working copy shows the new person; the issued copy retains the old person; the list reads as one person change, not a delete plus add. Disproved if either person changes on the issued face or the count is two. Surfaces: edit week and board, desktop and phone.

9. **Complete Inputs field matrix**

   Setup: Publish an input that is visible or operationally relevant. Change one field at a time: person, type, start, end, all-day/timed, half-day, start date, end date/span, remarks, attached paperwork and the activity’s OIL answer. Expected: each save is one logical pending input change on every published day the resulting net difference affects; visible fields stay frozen on the issued face. Disproved if value-only edits retain zero pending because the input keeps the same identity or filing state. Surfaces: Inputs, edit week, board, View-only and relevant overlays.

10. **Late badge created by an edit**

    Setup: Publish an input before its deadline with no LATE badge. Action: edit it after the deadline. Expected: the working copy and Inputs paperwork show the late state; the issued face retains the issued badge state until reissue. Hiding one’s own LATE mark remains a personal view choice and creates no pending item. Disproved if the issued face gains the badge merely because the modification time changed.

11. **Deletion boundaries: preserve D174 and D176**

    Run these separately:

    - Filed after publication, then taken off: zero pending.
    - Taken off when published, then deleted or re-dated away: zero pending.
    - Live when published, then deleted or re-dated away: one pending.
    - Taken off, published, woken and published as an AL, then deleted: one pending against that newer issued baseline.

    In every case the issued face must remain byte-for-byte the issued state. Any collapsed distinction between “absent”, “live” and “taken off” disproves correctness.

12. **Multi-day input across mixed publication states**

    Setup: A single input spans one published day, one draft day and one published day in another week. Action: edit, shorten, extend, retype or delete it. Expected: each published day receives its own correct net pending item; the draft day simply changes; neither loading nor correcting one day moves another day’s programme. Disproved by a week-wide count, a missing distant-day item, or duplicated accepted rows.

13. **All issued-reader contexts**

    Setup: Publish with a visible Unavailable row, warning and availability reason, then change the input. Expected: the old result agrees across View-only desktop/phone, issued board, issued edit-week preview, information panel, warning list and ALL AVAIL. The working result agrees across the live board, edit week and View-only “Working draft”. Disproved by any overlay reading the opposite world from the face behind it.

14. **Desktop next-week preview**

    Setup: Publish a day next week, return to the current week, then change that future day’s working inputs. Expected: the inert next-week card continues to show the issued programme for the published day; a draft future day shows its working programme. Clicking through loads the week, where the admin can see the working copy and its pending state. Disproved if the preview silently shows unpublished work. Desktop only; the phone has no such preview.

15. **Counts and pending-list words**

    Setup: Make one change from each family above, then combine several. Expected: the day head, board, day-information panel, Amendments panel, sign-off sentence, “Discard N edits”, stored AL item count and pending list agree. Suggested lines include:

    - “Warden · Local leave — filed under Unavailable.”
    - “Warden · Local leave — 0800–1200 → All day.”
    - “Warden → Bane · Local leave.”
    - “Warden · OML — filed.”
    - “Warden · SC NIGHT — removed.”
    - “Crew rest — 12 hours → 10 hours.”
    - “Tuesday Meeting — changes Monday’s crew-rest warning.”

    Disproved by double-counting a request’s row and filing, or by vague wording such as only “Input changed”.

16. **Undo, redo and direct return to issued state**

    Setup: Make each kind of pending change. Action: undo; redo; manually restore the exact old value; add then delete; move away then back. Expected: undo or exact restoration returns every count to zero and restores the four sign-offs; redo restores pending and clears them again. The issued face never moves. Disproved by inert pending marks, stale list entries or signatures that do not return.

17. **Load an issued version: “Discard N edits”**

    Setup: Change, delete or re-date an issued input, including one whose record no longer exists. Action: load the current issued version onto the working copy. Expected: the input projection, filing, programme and derived warnings return to the issued state; count becomes zero and face/working copy agree. A request already standing on another day is left out and named rather than duplicated. Disproved if the app claims zero while it cannot reconstruct the issued input.

18. **Plans and drafts**

    Setup: Save two plans, publish one, then add or edit an input and switch plans. Expected: switching changes day content but does not duplicate, erase or revive a global input; all plan-content and input differences are counted once in the same pending list. Issued versions remain fixed. Disproved if a stale plan resurrects an old input, loses the pending input, or places its request on two days.

19. **Publish an input-only AL**

    Setup: Make no schedule-cell change; make only an input value, filing, qualification or applicable rule change. Action: sign and publish the next AL. Expected: the AL is offered, records the same logical items the pending list showed, clears pending, and becomes the new issued face. Later input edits must not mutate that AL’s own view. Disproved if there is no Publish AL button, the stored item count differs, or history reads current live input values.

20. **Unpublish and republish**

    Setup: Make a late change that affects nobody operationally. Action: Unpublish, re-sign and publish under the same label. Expected: the prior issuance remains in history, the corrected same-label issuance contains the current input state, and no extra AL is created. Sign-offs clear on Unpublish. Disproved if the old issuance is erased, the late input stays pending afterward, or the label advances.

21. **Roles and the member’s own view**

    Setup: A member files, edits and deletes their own late leave; attempt the same against another member and attempt admin-only actions. Expected: their own working record changes and the admin receives pending; View-only’s issued face remains issued, while “Working draft” shows the late leave with its warning label. Cross-person writes and all publish/sign/load/unpublish actions are refused. Disproved if hiding buttons is the only protection or a member can affect another person.

22. **Navigation, reload and persistence**

    Setup: Create pending input-only changes, leave the week, sign out/in and reload. Expected: issued snapshots, pending comparison, sign-off state and input projection return consistently; the current issued face still shows the old state. Disproved if navigation clears the pending item, makes the issued face live, or produces a phantom amendment.

## Design questions still open

1. **How should qualifications, rule changes and medical cascades be counted?**  
   Recommendation: one logical object change per affected day. One qualification toggle is one; one changed rule setting is one; one medical status transition for one person/day is one even if its storage operation trims several rows. Keep the detailed stored changes, but do not make the person count implementation rows.

2. **Which changes count when the issued appearance is unchanged?**  
   Recommendation: every member input edit covering the day counts, including remarks, paperwork and an OIL answer, because D178 explicitly says every member input change and provides the unpublish/reissue path for changes affecting nobody. Qualification and Logic changes should count only on days whose issued result would actually differ.

3. **Where should a neighbour-day pending item lead?**  
   Recommendation: the affected published day owns the item. Name the source date and input, explain the resulting warning, and make the tap land on the affected warning or puck. Do not move the user to a different week without an explicit second action.

4. **What should the next-week preview show?**  
   Recommendation: issued content for a published future day and working content for a draft future day. It has no version controls and is easily mistaken for an official schedule, so showing unpublished work there is unsafe.

5. **What should a member see about pending work?**  
   Recommendation: the issued View-only face shows no admin pending controls. The member sees their current input on Inputs/Leave War and may deliberately choose “Working draft”, where a plain count may appear but the admin’s actionable pending list does not.

6. **What exactly must be frozen for rules and qualifications?**  
   Recommendation: freeze the facts needed to reproduce the issued result, not generated HTML. That must reproduce visible badges, availability, warnings, fallback times, print and CSV consistently while allowing future renderers to use the same issued facts.

## Explicit negatives

Checked and intentionally requiring no new behaviour:

- “Working draft” remains a live, clearly labelled reader choice.
- A reader’s own hidden LATE choice remains live and creates no pending change.
- Leave War’s “period missing” reminder remains live; it is an admin task, not issued schedule content.
- Draft days do not gain AL-style amendment marks.
- The issued View-only face and issued previews do not expose the admin’s pending list or “Not yet signed” state.
- Available crew remains absent from read-only/issued surfaces; this work should not add it.
- Print and CSV need no new Personal Inputs, Unavailable or SANS sections; they only need their existing output to use issued facts.
- The phone has no next-week preview, so no phone case should be invented for it.
- Day templates remain refused on published days.
- There is no publish-all-days path.
- EOD publication is still deferred; these scenarios must not quietly build it.
- Existing D174 and D176 zero-pending cases must be preserved.
- No migration or compatibility work is warranted for demo data that will be cleared, provided new data is correct going forward.
- OIL continues to follow the latest issued version only; working-copy input changes must not move credit before publication.

No files were edited. This was a read-only scenario-design and source review; no automated or rendered-app execution was performed.

