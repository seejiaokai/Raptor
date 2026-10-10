These are scenarios to execute, **not test results**. The change needs a **FULL** check because titles are saved and can change a published day’s pending status.

Use three independent browser worlds, one per walker. Build fixtures through the app’s controls. **Both sizes** means repeat at **390px phone width and 1440px desktop width**, saving and opening pictures of the stated results. Use fresh inputs; do not test conversion of old demo data.

For publication scenarios, start with no unrelated pending changes. After each title change, check **Save → Undo → Redo → reload**. Replay separately with **Undo → reload** so the undone state’s persistence is also tested. Do not rely on an undo list surviving sign-out.

**Walker A — title entry, shared inputs and display**

For scenarios 1–7, run this complete title sequence through each named door. Use separate inputs where needed to keep the results distinguishable.

| Case | Action | What must be seen |
|---|---|---|
| T1 — untouched | Choose Event; leave Title untouched; save. Reopen, choose Duty without typing a title, save. | Initially `Event`, subsequently `Duty`. No leftover `Event` title or extra kind label repeating the name. |
| T2 — typed | Choose Event; replace Title with `Sports day`; save and reopen. | Title `Sports day`, Type `Event`. Remarks have not acquired `Sports day`. |
| T3 — emptied | Select all of `Sports day` and delete it; pause, leave the box, then save. | The box stays empty while editing; `Event` may appear as placeholder text. After saving, the input is named `Event`, without a second Event label. |
| T4 — kind’s own name | Retitle to `Sports day`, save; replace it with `eVeNt`, save and reopen. Change Type to Duty without typing another title. | The saved name first returns to canonical `Event`; changing kind then produces `Duty`, not a retained custom `eVeNt`. |
| T5 — limit | Enter `1234567890123456789012345678901234567890`; save. Repeat by pasting that text followed by `EXTRA`. | Exactly the first 40 characters survive. No overflow covers times, people, buttons or remarks. |
| T6 — literal characters | Enter `<b>Ops</b> "A&B"`; save and reopen. | Those literal characters appear. No bold “Ops” produced by markup, missing quotation marks, extra element or broken control. |
| T7 — whitespace | Enter `  Sports   day  `; save and reopen. Then try spaces alone. | First saves as `Sports day`; spaces alone return the name to `Event`. |
| T8 — change kind | Type `Sports day`; switch Event → Training. Then switch to LL → Event before saving. | Training retains `Sports day`. LL has no Title control. Returning to Event shows the default `Event`; the discarded custom title does not return. |
| T9 — reload | Reload after each saved outcome above and reopen the input. | The same title, kind, remarks, person and dates return. |

1. **Calendar’s new-input window — admin, both sizes.** Open Inputs → Calendar, select 22 July 2026, press **+ Input**, select Ranger and 14:00–15:00. Run T1–T9 using the window’s **Add** button. Inspect the opened day after each add. Each new card must show the saved name and correct kind.

2. **Calendar’s existing-input window — Ranger, both sizes.** File Ranger’s own Event, then reopen its day card. Run T1–T9 using **Save**. The existing entry changes; no second input appears, and an untouched remark remains intact.

3. **List’s Add form — admin, both sizes.** Open Inputs → List; select Ranger, 22 July and 14:00–15:00. Run T1–T9 through the form’s Add control. The resulting row must show the custom title in bold above `Event` in the Type cell; an untitled row shows `Event` without a duplicate title line.

4. **List’s pencil editor — Ranger, both sizes.** Find Ranger’s own saved Event and press its pencil. Run T1–T9 using the row’s save control. Title must be editable in that row, cancellation must leave its saved value alone, and saving must update that input only.

5. **Scheduler Board’s new and existing windows — admin, both sizes.** Open the day’s Board → Ground Programme → **+ Inputs**. Run T1–T7 and T9 through Add; open a saved input from Personal Inputs and repeat through Save. For T8, assert that the new Ground Programme picker offers only its permitted kinds; perform the leave-and-back round trip in the existing-input editor. The dialog must appear above the Board, and its buttons must work.

6. **Several people — admin and member filer, both sizes.** Independently create a shared Event for Ranger and Saber through **Calendar → + Input**, then through the **List’s Add form**, using **Several people**. Run T1–T9 on creation and on the saved shared window. Inspect both people through the person filter. They must have the same title; the Calendar and List must retain one shared entry, not split it into separate entries because only some people received the title.

7. **ALL and ALL AVAIL — admin and member filer, both sizes.** Run T1–T7 and T9 for each placeholder through the Calendar window, List Add, List pencil and Board Add. Use a single day and a permitted kind. For T8, Event → Training retains the custom title; switching to LL removes Title and must refuse saving the placeholder as leave. Returning to Event must not resurrect the cleared title. No named person may silently replace the placeholder.

8. **Every eligible kind — admin, both sizes.** In each available Type picker, select Training, CSE, Meeting, Fly with, Personal, Appointment, Duty, Event, OD and Other in turn. Give each `Kind check` as its title and save on separate dates or times. Each supports Title and retains its actual kind. Leave, medical and Upchit must never gain a Title control. Do not expect every kind in a context-restricted Board picker.

9. **A title-only unsaved draft — Ranger, both sizes.** Open Ranger’s Event, change only Title to `Unsaved title`, then click another input behind the window. The **Unsaved changes** question must appear. **Keep editing** retains the draft; **Discard and open** opens the other input without lending it the draft title. Reopen the first: its saved title is unchanged.

10. **Cancel and refused save — admin, both sizes.** In each title editor, type `Must stay here`, set equal start and end times and save. The refusal must leave the title draft available and create no new input. Correct the times and save: the title survives. Separately cancel a title edit: reopening must show the previous saved title.

11. **Other, three distinct cases — admin, both sizes.** Create: Other titled `Dental visit` with remark `Bring letter`; untitled Other with remark `Dental visit`; Other with both title and remark `Dental visit`. Open their day and List. The names must be `Dental visit`, `Other`, `Dental visit` respectively. Every explicitly entered remark must remain visible, including the repeated title-and-remark case.

12. **Shared membership changes — member filer, both sizes.** File a two-person Event titled `Team session`; reopen, retitle to `Team review` and add a third person in the same save. Then remove the person whose callsign sorts first. The remaining people must still form one entry named `Team review`. Undo restores the removed person with that title; redo and reload preserve the result.

13. **Shared dates and title together — admin, both sizes.** Create a shared Event covering 30–31 July, titled `July session`. In its window change the range to 31 July–1 August, retitle `Summer session` and add a person. Every covered day and every participant must show the new name and dates. A generated `till` remark must name the new last date without copying the title into remarks.

14. **Move and ordinary edits preserve a title — admin, both sizes.** Create `Sports day`, drag its Calendar bar to another date, then edit its hours and remarks through the schedule’s existing controls. Reopen the input and reload. It must still be titled `Sports day`; neither the move nor a non-title editor may clear or replace it.

15. **Two edits while a window is open — admin, both sizes.** Keep an input window open with draft title `Window choice`; behind it, use the List pencil to save `List choice` on the same input. The window must show **Changed while this window was open**, identify **title**, and show both values. Saving before choosing must be refused. Test **Keep mine** and **Take theirs** separately; each must save the chosen title.

16. **An unrelated change behind the window — admin, both sizes.** Keep draft title `Window choice` open; change only the same input’s remark through the List pencil. Save the window. Both the new title and the separately saved remark must remain. There must be no invented title conflict or silent loss of the remark.

17. **Short screen and keyboard — admin and Ranger, both sizes.** Repeat a window edit and List pencil edit with the desktop only 700px tall and the phone’s visible height reduced by its keyboard. Reach Title, Type, Remarks, Save and Cancel through normal scrolling or Tab. All remain reachable; the active field and save result are visible. Enter in the window’s Title box must save once, not add a duplicate.

For scenarios 18–25, create comparable titled and untitled inputs **on the same day**, with the same kind, remark length and duration but different times. Use `Sports day` / Event and a second untitled Event; use `Overseas visit` / OD and an untitled OD where required.

18. **Month bars and opened day — admin, both sizes.** View the paired Events in Calendar. Desktop bars show `Sports day` and `Event`; the custom bar’s tip includes person, title, kind and dates. Phone bars retain their compact person-only presentation. Open the day: `Sports day` has small `Event` at the left of the placed-by line; the untitled Event has no redundant kind tag.

19. **List and its editors — admin, both sizes.** View the same pair in List, then open each pencil editor. The custom title is bold above the kind; the untitled row has one kind label. Title and Type remain separate controls. Times, dates, remarks and actions stay aligned with the correct row.

20. **Edit Schedule week — admin, both sizes.** Inspect both Ground Programme rows. The names are `SPORTS DAY` and `EVENT`. The custom row shows small `EVENT` **under** its name on the phone and **beside** it on desktop. The short custom title must not make the phone row taller than its comparable untitled row. Tapping the kind tag must not edit it or include it in the editable name.

21. **Scheduler Board — admin, both sizes.** Inspect the same rows, edit a time, add a person and cancel that edit. The custom name and small kind must remain associated with the name cell. Times, people, remarks and row controls must not shift into neighbouring columns. The untitled row must not acquire duplicate `EVENT`.

22. **Personal Inputs cards — admin, both sizes.** Inspect the pair under Personal Inputs in both the week and Board; use their input-opening control. The custom card and opened editor must name `Sports day`, with `Event` retained in the card’s kind treatment or tip as specified. The untitled card names `Event`. Opening either must reach the correct input.

23. **Unavailable cards — admin, both sizes.** Inspect titled and untitled OD under Unavailable in the week and Board; open each. The custom card names `Overseas visit` and retains `OD`; the other names `OD`. Neither OD may gain a Ground Programme row because of its title.

24. **Long title with normal marks — admin, both sizes.** Use the 40-character title beside an untitled control; add a long remark and a genuine overlapping commitment so the person carries a warning. Inspect Calendar day, List, week and Board. The title and kind remain distinguishable; LATE, warning rings, amendment marks, times and controls must not obscure one another. The opened editor must reveal all 40 characters.

25. **Search stays consistent — admin and Ranger, both sizes.** Give an Event the unique title `Copper exercise`, with no matching callsign or remark. Search `copper` in List and Calendar; open the matching day without clearing search. The input remains visible inside the day. Change the title to `Silver exercise`: searching `copper` no longer finds it, and `silver` finds it in all three places.

26. **Inputs export — admin and Ranger, both sizes.** Through the Inputs export control, export the titled/untitled pair and an input titled `Ops, "A&B"`. Open the downloaded table. `Title` stands beside `Type`; rows contain `Event / Sports day`, `Event / Event`, and the literal quoted title. Commas and quotes must not shift dates or remarks into another column.

27. **Excluded surfaces — admin and member, both sizes.** Open SANS’s commitment editor, a leave entry, a medical entry and an Upchit editor through their ordinary routes. No Title control appears. Separately create Events titled `LL`, `ATT B` and `SANS Availability`: those names must not create leave cells, medical records or SANS offers. Their kind remains Event.

**Walker B — publication, retained records and permissions**

28. **Publish, then title — admin, both sizes.** Create an untitled Event for Ranger, sign all four positions and publish the day. Retitle it `Sports day`. Edit Schedule shows the new name, **one pending change**, and cleared sign-offs. View-only Sched keeps `EVENT`. To go out identifies the input and `Event → Sports day`. Run the publication checkpoint sequence.

29. **Title, then publish — admin, both sizes.** Create `Sports day` first, then sign and publish. Both the issued week and the Board’s published view show `SPORTS DAY` with its Event kind; there is no pending title change. Reload and compare again. This is the titled/untitled side-by-side check of the issued surface.

30. **Title → amendment → retitle — admin, both sizes.** Publish untitled Event; title it `Sports day`, sign and publish AL1; retitle it `Games afternoon`. Working copy shows the latest title with one pending change. Latest issued view still shows `SPORTS DAY`; ORIG still shows `EVENT`. AL1’s sign-offs remain visible on its issued face while working-copy sign-offs are cleared.

31. **Type back the published title — admin, both sizes.** Publish `Sports day`; change it to `Games afternoon`; then type `Sports day` back. The pending change disappears and the original signatures become valid again, with no extra amendment required. Repeat with an originally untitled Event and return to `eVeNt`. Its published state must likewise be restored.

32. **Capital letters alone — admin, both sizes.** Publish title `Sports day`, then change it to `SPORTS DAY`. The Ground Programme’s capitalised name may look identical, but the input’s title has changed: one pending change and cleared working sign-offs are required. To go out must show the actual case change. Returning to `Sports day` removes it.

33. **OD without a programme row — admin, both sizes.** Publish a day containing OD titled `Overseas visit`; retitle it `Detachment visit`. Unavailable and the working input show the new name; the issued face keeps the old name. There is one pending change and cleared sign-offs even though no Ground Programme row exists.

34. **Two covered published days — admin, both sizes.** Create one Event covering 22–23 July titled `Two-day session`; publish both dates. Retitle `Revised session`. **Each day** must show one pending input change and lose its working sign-offs, including the covered day with no landed row. Both issued faces keep their previous names. Undo and redo must change both days together.

35. **A range across weeks — admin, both sizes.** Create and publish an input covering Sunday 26 and Monday 27 July. Leave one week, retitle the input from Inputs, and visit both weeks. Neither week may lose the title change because it was not loaded when saved. Both published dates show the correct pending state after reload.

36. **Next-week peek — admin, both sizes.** Put titled and untitled Events, plus titled and untitled ODs, in the next week. Return to the preceding week and expose its next-week peek through normal navigation. The peek shows the correct title/kind treatment wherever those items are drawn. For a published next-week day with a later retitle, it must show the issued name, not borrow the live title. Cross into that week and compare.

37. **Shared title after publication — member filer, then admin, both sizes.** A member files a shared Event; the admin publishes its day. The filer changes only its title. Every participant receives the new title, while the issued face stays unchanged. To go out groups the filing as one item with its people underneath; it must not omit participants or show unrelated inputs under that title.

38. **ALL / ALL AVAIL after publication — member filer, then admin, both sizes.** Publish one of each on separate days, then retitle them without changing person, kind, hours or availability. Each day gets one title change. The published placeholder count, its people and earned-leave figures remain frozen. The working count must not change merely because the title did.

39. **Delete a titled published request — admin, both sizes.** Publish `Sports day`, then delete its input. To go out and history must still identify `Sports day`, rather than only `Event` or “A request”. The issued row retains its name and Event tag. Undo restores the input with its title; redo and reload retain the deletion and correct issued face.

40. **Take off and accept again — admin, both sizes.** On a published titled Event, use the schedule’s take-off and accept controls. Inspect their messages and To go out after each action. Messages name `Sports day`; the issued face stays as published. Putting it back without changing its details restores the published state. No action renames the input to Event.

41. **Taken off before publication — admin, both sizes.** Take a titled request off the day, then publish. Retitle that still-dormant request. The Inputs page shows the new title, but the issued day still contains no row and must not invent a title-only pending change for an item absent from both faces. Accept it afterward: it arrives under its latest title and becomes pending.

42. **History and the history bubble — admin and member, both sizes.** Add `Sports day`, retitle `Games afternoon`, then clear the title. Open the changes window’s History tab and the relevant gold-dot bubble where offered. The entries identify the correct input, author and before/after names, including `Event` as the cleared result. A title-only edit must not be described merely as an unexplained generic change.

43. **The scheduler’s row name is separate — admin, both sizes.** Create input title `Sports day`. On Edit Schedule and separately on the Board, rename its landed row to `Scheduler wording`. The row keeps its Event tag; reopening the input still shows `Sports day`. Publish, then change the input title to `Games afternoon`: working and issued names must follow their respective copies, without silently changing the input when only the row was edited.

44. **Member’s own versus another person’s input — Ranger, both sizes.** File and retitle Ranger’s own Event through the window and List pencil. Then open Saber’s titled Event, which Ranger did not file. Saber’s title and Type must be readable as locked values; no usable Title editor, Save or Delete is offered. Typing, Enter and closing/reopening must not change it.

45. **Member who filed for someone else — Ranger, both sizes.** With members’ filing for others enabled, file Saber’s Event titled `Filed by Ranger`; reopen and retitle it. Ranger retains the permitted edit right despite not being its subject. Sign in as Saber: a single-person input is editable by its subject too. Neither edit changes the original placed-by person.

46. **Being in a shared input is not permission to rename it — Ranger, both sizes.** Have Saber file a shared Event containing Ranger. Ranger opens it: its shared title is readable, but he cannot rename it for everyone. His permitted **Take me out** and own OIL-answer actions remain available where applicable. Leaving must not alter the title for the people remaining.

47. **Admin retitles a member’s input — admin, both sizes.** Retitle an Event that Ranger filed. Reopen it as Ranger. The new title must be visible and editable by Ranger; the original placed-by attribution remains Ranger, while history identifies the admin’s title change.

48. **Permission removed after filing — member filer and admin, both sizes.** Ranger files a titled Event for Saber. The admin turns off members’ filing for others in Inputs settings. Ranger must now be unable to retitle that input through either the window or List pencil, while still able to retitle his own. Turning the setting back on restores the permitted route. Reload must not bypass the restriction.

49. **Undo stays on the visible item — admin, both sizes.** Retitle an input midway down List; undo and redo while its row is fully visible. The list must not jump it to the top. Repeat with the row out of view: the changed row must be brought into view below the top bar, showing the expected title. On Calendar, undoing an in-month retitle must not switch month or tab.

**Walker C — rules, warnings, OIL and less-used paths**

For scenarios 50–52, use these titles one at a time:

`Meeting`, `Training`, `SC`, `Brief`, `Off`, `Event`, `OD`, `Ranger`, `08:00`.

Start from an untitled control and record its warning, availability and work-hours result. Retitle only; keep people, kind, times and remarks unchanged.

50. **Against standby — admin, both sizes.** Put Ranger on an SC MAIN shift, 08:00–16:00. File an overlapping Event, 10:00–11:00, and run the title list. The overlap stays a **red clash**, even when the title is `Meeting`, `SC`, `Brief` or `Off`. Repeat with a Meeting: its SC overlap stays the existing **amber advisory**, even when titled `Training` or `Event`. Warning wording uses the title; severity follows Type.

51. **Against flying — admin, both sizes.** Put Ranger on a flying line whose occupied period overlaps the input. Run the same title list on an Event. The clash remains; `Brief` must not supply a missing flight brief, `SC` must not grant standby exemptions, `OD` must not turn the Event into overseas absence, and `08:00` must not change any time. Repeat with the input filed before the flying assignment and afterward.

52. **Against another commitment — admin, both sizes.** Create a separate timed commitment for Ranger, then file an overlapping Event and run the title list. The overlap remains with the same people and hours. Select another person and try placing that person on the conflict: the **already on…** notice must name the titled commitment, not its former name. A callsign used as a title must not reassign the input.

53. **Two inputs with one name — admin, both sizes.** File Training titled `Meeting` and a separate Meeting for Ranger at 10:00–11:00, alongside his SC MAIN shift. Repeat with the filing order reversed. Both commitments remain visible; the warning includes **“two items called MEETING at once”**, and Training’s hard SC clash is not lost behind Meeting’s amber one. Repeat with two separately filed Events titled `Same name`.

54. **A request and a hand-written row sharing a name — admin, both sizes.** Add a hand-written Ground Programme row named `MEETING`, then a Training input titled `Meeting`, for the same person and hours. Repeat in reverse order. They remain separate commitments and the hard clash remains. Rename the request away and back: it must not disappear from checking on the second collision.

55. **Whole-day and overnight warning names — admin, both sizes.** File an all-day OD titled `Overseas visit`, then place its person on a blank-time flying line. The warning must identify that title. Separately file a timed Event titled `Night exercise`, 23:00–02:00, and overlap it with next-day work; repeat across Sunday–Monday. Warnings must retain `Night exercise` through the midnight and week boundary, with the same grades as the untitled control.

56. **Crew rest and work hours ignore the words — admin, both sizes.** Create a late Event followed by an early next-day flight that produces a known crew-rest warning. Note the displayed hours and warning. Retitle the Event `Off`, `SC`, `Brief` and `08:00` in turn. The rest result and hours remain unchanged. Repeat after publishing the earlier day; retitling must not silently alter issued work or earned leave.

57. **OIL question at every save door — admin and member filer, both sizes.** On Saturday 25 July, file a 08:00–12:00 Event titled `Weekend exercise` through Calendar Add, List Add, Board Add and shared Add. For List pencil and existing-window saves, start with a weekday entry and change it to the weekend through the available date-edit route. The question names **`Weekend exercise`**, identifies the right person or group, and offers **HO — half a day** for that isolated four-hour input. Cancel writes nothing; answering and saving retains the title.

58. **Title-only edit after an OIL answer — member and admin, both sizes.** Prepare one weekend Event answered Yes and one answered No, including a shared input whose participants have different answers. Retitle only through the window, pencil and shared editor. **No OIL question reopens.** Each answer and each displayed earned-leave figure remains unchanged. Undo, redo and reload preserve this.

59. **OIL Earn mode on the Board — admin, both sizes.** Place titled and untitled weekend inputs side by side; switch OIL Earn on. The custom item cell names `Weekend exercise`; the kind remains discoverable without confusing it with the title. Operate the earning control, leave the mode and reopen the input. The operation changes earning only, never Title, Type or another row’s switch. Check alignment again with the 40-character title.

60. **ALL / ALL AVAIL OIL heading and individual switches — member filer, then admin, both sizes.** File a titled weekend Event for each placeholder and answer once as the filer. On the Board, tap its count. The window heading identifies the titled item, not just `Event`; its people and earning state match the filed answer. In OIL Earn, switch one person off, retitle the input, then reopen the count: that person remains off and everyone else’s answer is unchanged.

61. **Published OIL stays fixed across a title amendment — admin, both sizes.** Publish a weekend titled input with a recorded OIL result. Retitle it, inspect pending and issued views, then sign and publish its amendment. The title changes at the publication boundary; the earned-leave amount is identical before retitling, while pending and after the amendment. Test both a named person and ALL AVAIL.

62. **Titles cannot dodge OIL rules — member filer, both sizes.** File an Event titled `Personal`, then a Personal input titled `Duty`, for equivalent weekend hours. Event still follows Event’s OIL-question rules; Personal still follows Personal’s rules. Likewise, naming a forbidden placeholder kind `Event` must not make ALL / ALL AVAIL legal for it.

63. **Escaping on the less-used surfaces — admin, both sizes.** Use `<b>Ops</b> "A&B"` on a weekend input; produce an overlap, publish it, retitle it and finally delete it. Inspect its warning, OIL question, ALL AVAIL heading where applicable, To go out, history, history bubble and deletion wording. All must show literal text, with no broken layout, executable markup or lost title. Include the Inputs export.

64. **A title edit is still a late edit — member, both sizes.** Choose a future date whose deadline has not passed and file an input. Through Inputs settings, make that date’s deadline fall before today; then edit only its title. The input must now show LATE with its last-change explanation. It must not gain a new clash merely because it is late. Undo must restore the previous title and its previous change state.

The additional cases most likely to expose a missing connection are **15–16** (a second editor changing a title behind an open window), **26** (export), **32–36** (no visibly changed row, no row at all, or a week not loaded), **39** (the input has gone), **53–55** (name collisions and copied overnight inputs), and **59** (OIL Earn replaces the normal name control).

Keep already-filed issues separate: unchanged List-pencil saves producing an edit stamp, existing one-day `till` wording, existing window-Escape faults, and the schedule print/export omitting all Ground Programme rows. None proves a new title fault by itself.

**The five scenarios to run first**

1. **33 — titled OD after publication:** catches a pending/signature check that depends on a Ground Programme row.
2. **53 — two inputs with one name:** catches a commitment disappearing from clash checking because the names match.
3. **7 — ALL / ALL AVAIL through every editor:** covers the specialised person choice, title states and invalid-kind refusal.
4. **58 — title-only edit after OIL answers:** catches a harmless rename reopening questions or changing someone’s entitlement.
5. **59 — Board in OIL Earn mode:** exercises the alternative name control most likely to have missed the title/kind treatment.

**Break tests — deliberate faults for the host to introduce individually**

These are proposed mutations only. Apply one, run its named scenario, require failure, then restore it before the next.

| Rule or connection | Deliberate code fault | Scenario that must fail |
|---|---|---|
| Only eligible kinds take titles | Make `titledKind` accept leave or medical. | 8, 27 |
| Default title follows kind | Store the initial kind name as a custom title even when untouched. | T1 in 1–7 |
| Empty stays empty while typing | Render `draft.title || draft.type`. | T3 in 1–7 |
| Kind-name equality ignores case | Remove the case-insensitive equality check from `titleOf`. | T4; 31 |
| Whitespace is normalised | Remove trimming or whitespace collapse. | T7 |
| Maximum length is enforced | Raise the Title control’s limit above 40 and remove the normaliser’s cut. | T5 |
| Unsupported-kind switch clears title | Keep the draft title when changing to LL. | T8 |
| Calendar/Board creation saves title | Omit title from `commitNewInput`. | 1, 5 |
| List creation saves title | Omit title from the List’s new-record construction. | 3 |
| Existing saves retain title | Remove the title write from `commitInputEdit`. | 2, 4 |
| Shared title-only changes count | Remove title from `commitGroup`’s changed-field comparison. | 6, 37 |
| Every new participant gets the title | Drop title when adding a person to a shared input. | 12, 13 |
| Shared grouping distinguishes titles | Remove title from the shared-field grouping comparison. | 6, 12 |
| Unsaved-title detection | Remove title from `WIN_FIELDS`. | 9, 15 |
| Other no longer takes its name from Remarks | Restore the remarks-based branch of `inpLabel`. | 11 |
| Repeated remarks remain visible | Reinstate “hide remark when equal to name”. | 11 |
| Month bar uses title | Use kind instead of the input name for bar text. | 18 |
| Month tip retains kind | Omit kind from the custom bar’s tip. | 18 |
| Opened day uses title and kind | Replace its title with Type, then separately remove its small kind tag. | 18 |
| List shows custom title | Remove the bold title line from the Type cell. | 19 |
| Week row retains kind | Make the week’s `rowKindTag` return empty. | 20, 29 |
| Phone/desktop kind placement | Force the week’s kind tag onto the same line at phone width. | 20 |
| Board grid remains aligned | Emit the kind tag as a separate grid cell. | 21 |
| Personal Inputs uses title | Replace its `inpLabel` call with Type, separately in week and Board. | 22 |
| Unavailable uses title | Replace its name with Type, separately in week and Board. | 23, 33 |
| Search agrees across surfaces | Remove title matching from List, month, then opened-day filtering, one at a time. | 25 |
| Export carries title | Remove the Title column or fill it with Type only. | 26 |
| Title-only publication comparison | Omit title from `inpDetailKey`. | 32–35 |
| Issued names remain frozen | Read live input titles while drawing an issued row/card. | 28–30, 36 |
| Sign-offs follow pending changes | Skip signature invalidation for a title-only change. | 28, 33 |
| Returning to issued content clears pending | Compare title edits against a touched flag instead of issued content. | 31 |
| Pending wording names both titles | Remove the title pair from `inputWords`. | 28, 32 |
| Deleted request keeps its name | Make `goneRequestName` always return `srcType`. | 39 |
| History records title-only edits | Remove the title-change line from `changelines`. | 42 |
| Row labels use the row’s own kind | Make `rowKindTag` consult the current live input instead of the row. | 39, 43 |
| Member permissions are unchanged | Permit title edits without `mayEditInput`. | 44, 46, 48 |
| Member filer keeps permitted access | Restrict title editing to the input’s subject alone. | 45 |
| Undo/persistence includes title | Drop title from restored or saved input records. | T9; 28–35, 49 |
| Classification follows kind | Classify a request’s clash using its title instead of Type. | 50–52 |
| Separate requests remain separate events | Restore name-and-time-only deduplication in `events.ts`’s `push`. | 53, 54 |
| Copied inputs retain title | Omit title from `mapInp`. | 55 |
| Titles cannot act as timing/rule instructions | Feed title into brief, standby or time-word interpretation. | 51, 56 |
| OIL questions use the title | Pass Type as `typeLabel`, separately in the window and List question builders. | 57 |
| Renaming does not invalidate OIL answers | Add title to `oilEvidenceKey`. | 58 |
| OIL Earn’s alternative name control is wired | Make its item-name builder print Type only. | 59 |
| ALL AVAIL heading uses title | Make `oilRequestName` return Type only. | 60 |
| Title amendments leave earned amounts alone | Clear or recompute accepted OIL answers on title-only saves. | 58, 61 |
| User text is escaped everywhere | Bypass escaping in one HTML title output at a time. | T6; 63 |
| Title edits receive change stamps | Skip the change stamp when only Title changed. | 64 |

Walk: not performed — scenario design only. No files changed.  
Rulings: none this session.

