# The app’s words — what a person sees, what it means, what the code calls it

This page translates between the app’s words, their everyday meaning and the names a reviewer can search for in the code. Search it when writing to the owner or briefing a reviewer; never load it in every chat. Add a term the moment its meaning is settled in a planning round. Labels below come from the interface source, including button hints and accessible labels; descriptions in brackets identify visible things with no separate caption. “Two names on screen” records a difference without choosing a replacement. Checked against the app’s source on 10 Nov 26 — every label and code name searched; not walked on screen.

## Scheduler Board and Edit Schedule

| On screen | What it means | In the code |
|---|---|---|
| Edit Schedule | The scheduler’s editable view of the week’s programme. | `EditWeek`, `CURPAGE` |
| scheduler board | The full-screen view for arranging and checking one day. | `SchedBoard`, `SBDAY` |
| View-only Sched | The reading view of the programme, showing the issued version of a published day by default. | `ViewWeek`, `issuedWorld` |
| [The week’s dates] | The selected week whose days are shown together. | `CURWEEK`, `DAYS`, `loadWeek` |
| Jump to a date | Opens the calendar for moving to another date’s week. | `WeekCal`, `setWeekCal` |
| [A day’s heading and date — the day bar] | Identifies the day and carries its version, plan and publication controls. | `dayStatHTML`, `planSelectorHTML`, `verTagHTML` |
| Flying waves | Groups the day’s flying formations into waves. | `Wave`, `Day.waves` |
| + Wave | Adds a flying wave using the chosen wave template. | `addWave`, `WaveTpl` |
| Formations | Groups of aircraft sharing a formation’s callsign, mission and times. | `Formation`, `Wave.formations` |
| + Line | Adds a new formation with a blank first aircraft row. | `addLine`, `Formation`, `Aircraft` |
| [An aircraft’s line] | One aircraft’s crew and remarks within a formation. | `Aircraft`, `Formation.aircraft` |
| [A person’s puck] | The small name tile used to show, select or place a person. | `puck`, `Person`, `PEOPLE` |
| FCP (pilot) / RCP (WSO) | The front and rear flying seats to which people are assigned. | `Seat`, `AircraftSeat` |
| Placeholders | Group pucks that stand for people worked out from the day’s circumstances. | `palette-html.ts`, `Person.special` |
| ALL | A placeholder that works exactly like ALL AVAIL: it stands for the people available for that row’s time; the two differ only in name. | `PEOPLE.all`, `isSpecial`, `avail.ts` |
| ALL AVAIL | A placeholder for the people available for that row’s time and activity. | `avail.ts`, `AvailWindow` |
| AIRCREW / CREW — two names on screen | The crew panel from which the scheduler picks people. | `EditRoster`, `paletteHTML` |
| Available crew | People the app considers available for the selected day or time. | `availHTML`, `avail.ts` |
| Personal Inputs | The day’s filed personal commitments and their place on the schedule. | `Input`, `INPUTS`, `board-html.ts` |
| SANS Avail / SANS availability — two names on screen | Offers from SANS aircrew to fly or attend simulators during stated times. | `SansOffer`, `sansCardsHTML` |
| Unavailable | Leave, medical restrictions and other inputs filed as time away. | `Input.acc`, `isAway`, `board-html.ts` |
| Overall notes | Notes shown at the top of the day. | `Day`, `board-html.ts` |
| Common Programme | Activities for the wider group, including inputs containing ALL or ALL AVAIL. | `AllhandsRow`, `onCommon` |
| Duties | Duty blocks containing roles, times and assigned people. | `DutyBlock`, `DutyRow` |
| Sims | Simulator sessions, their crew, passengers and supporting rows. | `SimRow`, `Day` |
| Ground Programme | Scheduled ground activities and inputs placed on the programme. | `GroundRow`, `Input.acc` |
| Remarks / Rmks — two names on screen | Notes attached to a row, some of whose recognised words also affect checks. | `AircraftSeat.rmks`, `GroundRow.rmks`, `remarks-vocabulary.md` (doc) |
| Traffic | The wave’s airspace bookings. | `AirPop`, `setAirKey` |
| CX | Cancels an item while leaving its cancelled line visible. | `RowFlags.cx`, `cxCommit` |
| CX DUE | Introduces the reason written beside a cancellation. | `cxText`, `CXT` |
| Info only | Shows an item without checking it against the scheduling rules or earning OIL from it. | `RowFlags.info`, `inputSilent` |
| Red box | Marks a row for the next scheduler’s attention. | `RowFlags.flag` |
| Auto sort / Sort all | Puts one section, or the whole day’s sections, into their reading order. | `askSortAll`, `sortAllCommit`, `order.ts` |
| DRAFT | The day has not yet been published. | `dayApproved`, `verTagHTML` |
| Working copy / Working draft — not issued / live copy — two names on screen | The editable day, including changes that viewers have not yet been issued. | `DAYS`, `SCHED`, `SchedFields` |
| Plans | Named alternatives saved for one day, with one selected as the working day. | `DayDraft`, `dayDrafts`, `DraftsModal` |
| + Alt Plan | Makes another named plan from a copy of the current day. | `draftDup` |
| Switch to this plan / Select — two names on screen | Makes a saved plan the working day and stores the previous working plan. | `switchDraft`, `draftSelect` |
| Load onto working copy | Loads an issued version into the editable day without publishing it. | `loadVersionToWorkingCopy` |
| Publish day | Issues the day’s first published version after its required sign-offs. | `setDayApproved`, `DaySnapshot` |
| ORIG | The day’s original published version. | `SCHED.orig`, `verTagHTML` |
| Publish AL1, Publish AL2… | Issues the next amendment for that day. | `alIssue`, `nextSeq`, `AlRecord` |
| Amendments | The issued changes to individual published days. | `ALPanel`, `SCHED.als`, `Amendment` |
| Unpublish | Withdraws the current issued version so the day can be corrected. | `publish.ts`, `SCHED.retired` |
| CUR CK / SKED CK | The currency-check and schedule-check sign-offs on the working day. | `SIGN_ROLES`, `SignSet`, `setSign` |
| PLANNED BY / APPROVED BY | The planner’s and approver’s sign-offs on the working day. | `SIGN_ROLES`, `SignSet`, `setSign` |
| Signed | Shows who signed the particular issued version being read. | `signedLineHTML`, `verSigners` |
| Not yet signed | The working copy contains changes that still need sign-off and publication. | `nysMarkHTML`, `daySigned` |
| Not yet published | The working copy has all four signatures but has not been issued. | `nysMarkHTML`, `daySigned` |
| History / Changes — two names on screen | Opens the record of changes and who made them. | `ChangesWindow`, `ELOG`, `HISTMODE` |
| New to you | Changes the signed-in person has not yet seen. | `ChangesWindow`, `changesmodel.ts` |
| All changes | Every recorded change within the chosen day or week. | `ChangesWindow`, `ELOG` |
| To go out | Changes on published days waiting for their next amendment. | `dayPendingItems`, `ChangesWindow` |
| Group by: Item / Who | Groups the change list by the thing changed or the person who changed it. | `ChangesWindow`, `changesmodel.ts` |
| Undo / Redo | Takes back or reapplies an eligible change by the signed-in person. | `UndoPair`, `globalUndoEngine`, `trackerUndoEngine` |
| issues / No issues / No conflicts flagged — two names on screen | The day’s checks, with hidden warnings excluded from its displayed count. | `WARN`, `dayWarnHTML`, `boardWarnHTML` |
| Warning / Advisory / Note | The three levels of scheduling findings, from red warnings to grey notes. | `LG_TIER`, `WARN`, `WCODE` |
| Hide this warning / Flag this again | Stops or restores a particular warning’s visible flags while retaining its line in the list. | `warnhide.ts` |
| Crew rest | The rest a flyer needs between the previous day’s finish and the next day’s reporting point. | `VCONF.crewRest`, `REST`, `validate.ts` |
| [The crew-rest ring around a puck] | Shows the crew-rest condition applying to that person at that place. | `puckMarks`, `REST`, `html.ts` |
| Tight turn | A short gap between landing and the next take-off. | `VCONF.tightTurn`, `validate.ts` |
| + In-time | Adds a reporting instruction above the wave’s formations. | `REPORTING_LABEL`, `Wave.intimes` |
| R / Rally | The formation’s rally time, which can supply its reporting time. | `Formation.rl`, `resolveReporting` |
| B | The brief time on a flying formation, suggested when blank. On SC it is the crew’s in-time. Standby lines have no suggested brief. | `Formation.br`, `flightBrief`, `scReport` |
| TO / LD | The formation’s take-off and landing times. | `Formation.to`, `Formation.ld` |
| START / END | A standby line’s planned start and finish. | `Formation`, `scReport` |
| Flies | Marks a standby aircraft row as actually flying. | `saFlies`, `AircraftSeat` |

## Inputs

| On screen | What it means | In the code |
|---|---|---|
| Inputs | The page for filing and reading leave, medical records, duties and other commitments. | `InputsPage`, `INPUTS` |
| + Input | Opens a new input for the chosen person or people. | `InputWindow`, `commitNewInput` |
| Calendar / List | Shows inputs as month bars or as a list. | `InputsCal`, `InputsPage`, `INPVIEW` |
| Type / What each type means | Chooses an input’s kind and explains the rules attached to it. | `INPUT_META`, `TypeLegend` |
| Several people | Files one shared commitment containing several people. | `PeoplePick`, `Input.people`, `InputPerson` |
| Goes to | Chooses whether an eligible input belongs on the Ground Programme or under Unavailable. | `Input.acc`, `InputWindow` |
| Accept / Reject | Puts an eligible input back onto the programme or leaves it inactive until accepted again. | `autoAcceptInput`, `unacceptInput`, `inputDormant` |
| LL | Local leave, charged to annual leave. | `INPUT_META`, `LEAVE_TYPES` |
| OL | Overseas leave, charged to annual leave. | `INPUT_META`, `LEAVE_TYPES` |
| CCL — childcare leave / child care leave — two names on screen | Leave charged to the person’s child care leave balance. | `INPUT_META`, `LEAVE_TYPES` |
| FCL / PL / EL / CL | Family care, paternity, embarkation and compassionate leave, each with its own balance. | `INPUT_META`, `LEAVE_TYPES`, `BAL_KINDS` |
| ATT B / B — two names on screen | A medical restriction that prevents flying but allows other work. | `INPUT_META`, `canWork`, `displayCell` |
| ATT C / C — two names on screen | A medical restriction that prevents reporting to work. | `INPUT_META`, `displayCell` |
| HL | Hospitalisation leave recorded as medical absence. | `INPUT_META`, `MEDICAL_TYPES` |
| OML — ordinary medical leave | A medical absence; ordinary medical leave everywhere it is spelled out, the Leave War included (his ruling D1950, 10 Nov 26). | `INPUT_META`, `MEDICAL_LABELS` |
| Upchit | A record that the person has been medically cleared to fly again. | `isUpchit`, `medAskFor`, `UpchitConfirm` |
| CSE / Course — two names on screen | A course commitment, normally filed under Unavailable. | `INPUT_META`, `landsUnavail` |
| OD / Overseas duty — two names on screen | Duty away overseas, normally filed under Unavailable. | `INPUT_META`, `landsUnavail` |
| Attach / ATCH — two names on screen | Attachment to another squadron, job or exercise, counted as time away. | `INPUT_META`, `Input.to`, `COMMIT_CODE` |
| Training / Meeting / Appointment / Duty / Event / Personal / Other | Commitment kinds whose dates, times and filing determine how they affect the schedule. | `INPUT_META`, `inputFlags` |
| All day / AM / PM / Custom | Chooses a whole day, a half day or explicitly entered start and finish times. | `SpanPicker`, `SPANS`, `spanFields` |
| Document | Attaches or opens supporting photos and PDFs. | `DocViewer`, `rowDocIds`, `state/docs.ts` |
| LATE | The input was last changed after the applicable filing cut-off. | `isLateInput`, `lateTag`, `cutoff.ts` |
| Medical | Shows the medical position on a chosen date. | `MedicalView`, `MEDASOF` |
| Medically Down / Pending Upchit / Upchit Complete | Separates current medical restrictions, outstanding clearance paperwork and recently completed clearances. | `MedicalView` |
| SANS | The calendar of SANS commitments and the remaining need for aircrew. | `SansCal`, `sanscal-model.ts` |
| + Commitment | Files SANS availability for the chosen dates and times. | `openSansAdd`, `SansOffer` |
| Fly / AMT / OFT | Chooses the activities offered in a SANS availability record. | `SANS_ROWS`, `SansOffer`, `SansPicker` |
| Calendar… | Opens the flying-day plan and holidays used by the availability calendars. | `DaysWindow`, `setDaysWin`, `flyplan.ts` |
| Day flying / Night flying / No fly | The planned flying status of a date. | `flyplan.ts`, `DaysWindow` |
| Inputs calendar settings / SANS calendar settings | Sets each calendar’s own filing cut-off and other calendar controls. | `InputsSettings`, `SansSettings` |

## OIL

| On screen | What it means | In the code |
|---|---|---|
| OIL | Off in lieu: earned or granted time off, held as a leave balance. | `OilCredit`, `OilLedger` |
| OIL Earn | Shows which schedule seats contribute to OIL and lets the scheduler change eligible seats’ answers. | `oilmode.ts`, `oilModeOn` |
| [The green OIL edge on a puck] | Marks an event that contributed to that person’s OIL. | `puckMarks`, `oil.ts`, `oilev.ts` |
| OIL? | An input on a non-working day still needs an OIL answer. | `oilAnswered`, `oilUnansweredDay`, `OilConfirm` |
| Yes / No / Only some days… | Decides which of an input’s non-working days deserve OIL. | `OilConfirm`, `oilGate` |
| Yes to all / No to all | Answers every listed OIL question for the day together. | `OilDayList` |
| Answer OIL | Reopens the OIL question holding up the named change. | `OilWaitSheet`, `oilwait.ts` |
| OIL TRACKER | Shows credits, days taken, expiry and the remaining balance. | `OilTracker`, `oilLedgerFor` |
| FO / HO | A credit marker for a full day or half a day of OIL. | `OilCredit`, `CODE_GLOSSARY` |
| FO* / HO* / Auto | Marks OIL credited automatically by the app. | `OilCredit.source`, `displayCell` |
| Grant OIL | Gives OIL by hand with an amount and reason. | `CreditForm`, `OilAmount` |
| Bal / left | The person’s remaining OIL balance, or the unused part of one credit. | `oilBalanceOf`, `OilCredit.left` |
| Archive | Holds used-up and expired credits for reference. | `OilTracker` |
| OIL lasts | Sets whether credits expire after a number of days or months, or last forever. | `OilPolicy`, `expiryOf` |

## The Leave War

| On screen | What it means | In the code |
|---|---|---|
| Leave War | Plans leave and shows its effect on balances and available people. | `LeaveWarPage`, `leavewar/state/store.ts` |
| Grid | The period’s day-by-day picture of leave, absences, events and manning. | `Matrix`, `MatrixRows` |
| View | Chooses the leave period to display. | `Chrome.tsx`, `wars` |
| Open for bidding / Open — two names on screen | Identifies dates on which members may place new leave bids. | `OpenDatesSheet`, `opendates.ts` |
| Bidding closed | No currently usable dates are open for member bids. | `StageBar`, `opendates.ts` |
| [A leave bid] | A requested leave entry waiting for an admin’s decision. | `RequestRec`, `BidPicker` |
| Approved / Pending a decision / Refused | Shows whether a leave request has been accepted, remains undecided or was refused. | `RequestRec`, `decideRequests` |
| Approvals | The admin’s list of leave requests needing a decision. | `ApprovalsPage`, `leavewar/approvals.ts` |
| Approve all | Approves exactly the requests shown by the current list and filters. | `ApprovalsPage`, `decideRequests` |
| My leave | The signed-in person’s leave summary and next leave. | `myLeaveOf`, `Chrome.tsx` |
| Manning | Shows how many people meet the chosen requirements on each date. | `CountRows`, `counters.ts` |
| Required P / Required W | The planned numbers of pilots and WSOs needed on a date. | `ReqPanel`, `requirements.ts` |
| Available P / Available W | The available pilots and WSOs after the relevant absences are counted. | `availrows.ts`, `availability.ts` |
| Lowest Avail | The lowest relevant availability shown across a request’s dates. | `ApprovalsPage`, `leavewar/approvals.ts` |
| Balances | Everyone’s leave balances and grades, with editing controlled by role and the members’ lock. | `BalancesPage`, `personFigures` |
| LVE | The shared annual-leave balance used by local and overseas leave. | `BAL_KINDS`, `KIND_COUNTER` |
| App bal | The balance entered from the official leave app, reduced by later approvals. | `TypedBal`, `personFigures` |
| Pending | The number of days requested but not yet approved. | `personFigures`, `RequestRec` |
| War bal | App bal after pending leave has also been deducted. | `personFigures` |
| INCL. CARRIED FWD / CARRIED — two names on screen | The carried-forward part already included in the annual-leave balance. | `TypedBal`, `leaveyear.ts` |
| Days taken | Shows leave and other counted absence days over the chosen dates. | `daysTaken`, `DAYS_TAKEN_COLS` |
| Grades | Sets the leave grades and the annual leave each adds on 1 January. | `GradesSheet`, `GradeDef`, `gradeDaysOn` |
| Lock for members | Stops members changing their own leave figures while leaving admin editing available. | `setBalanceLock`, `BalancesPage` |
| [A person’s name puck] | Opens that person’s balances and leave. | `NamePuck`, `PersonWindow` |
| Events | Lists and manages events applying to the leave period. | `EventsSheet`, `EventSheet`, `saveEvent` |
| Public holiday / Off day | Marks a non-working date used by the calendars, manning and OIL rules. | `eventdefs.ts`, `holidays.ts` |
| Rearrange | Changes the display order of the grid’s rows and groups. | `LeaveWarPage`, `leavewar/state/screen.ts` |
| [The moved mark on leave] | Shows that approved leave was moved from another date. | `shiftedFrom`, `moveRecords` |

## The Tracker

| On screen | What it means | In the code |
|---|---|---|
| Tracker | Tracks students’ progress through training events. | `TrackerPage`, `tracker/App.jsx` |
| Crew / Students — two names on screen | The students enrolled on the selected course and syllabus. | `roster`, `core.js`, `SidePanel.jsx` |
| Course | The training cohort whose students and progress are being viewed. | `COURSES`, `loadCourse` |
| Syllabus | The shared set of events and requirements followed by its courses and students. | `SYL`, `curSylId` |
| Flow chart | Draws the syllabus events and the links between them. | `renderBoard`, `tracker/App.jsx` |
| [An event ball] | One training event, with a coloured result slice for each student. | `ballParts`, `marks` |
| [The links between events] | Shows which events depend on earlier events. | `prereqs`, `SYL` |
| Info | The selected student’s progress, currency, dates and pace. | `SidePanel.jsx` |
| Show All | Lists the details of every event. | `ShowAllPanel`, `openShowAll` |
| Find event… | Finds and highlights an event on the chart. | `searchQ`, `Header.jsx` |
| Not done | The student has no completion grade for that event. | `marks`, `popGrade` |
| DCO | A grade counted as completed; its full wording and distinction from DPCO are **unsure**. | `GRADE_FILL`, `DONE`, `popGrade` |
| DPCO | A grade counted as completed; its full wording and distinction from DCO are **unsure**. | `GRADE_FILL`, `DONE`, `popGrade` |
| Marginal | A marginal grade that the Tracker counts as completed. | `DONE`, `popGrade` |
| N.A. | Marks the event as not applicable to that student. | `popGrade`, `marks` |
| Done on | The date attached to the event’s completion. | `popDoneDate`, `marks` |
| Fails / Failed on / Failures | Records failures and their dates, and opens their history. | `popFail`, `popFailDate`, `openFailLog` |
| Last Flown (Syllabus) | The most recent syllabus flight date used for syllabus currency and flex. | `setLastSyll`, `dates` |
| Last Flown (Currency) | The latest qualifying flight date, including an entered non-syllabus flight. | `setLastCurr`, `landingCurrency` |
| Course start | The student’s start date, used when counting medical down days. | `courseStartOf`, `pace` |
| No. of Down Days | Medical down days counted from the linked person’s inputs since course start. | `DownDays`, `peoplewire.ts` |
| Currency / Currency & flex | Shows the recency of flying and, when enabled, the resulting flex requirement. | `landingCurrency`, `flexBands`, `flexOn` |
| Pace & expected end | Compares a chosen weekly training pace with projected and target finish dates. | `pace`, `SidePanel.jsx` |
| End date A / End date B | Two target finish dates whose required weekly paces can be compared. | `setTarget`, `setTarget2` |
| Lull periods | Date ranges excluded from that student’s pace calculations. | `lulls`, `openLullPicker` |
| Edit chart layout | Moves or edits the syllabus’s events, links and layout. | `arrangeMode`, `toggleArrange` |
| Edit details | Changes an event’s title, format, hours and other descriptive details. | `openInfo`, `eventDetails.js` |
| Save changes | Saves pending edits to the syllabus’s events, prerequisites and lines. | `saveChangesClick` |
| Duplicate syllabus | Copies a syllabus’s events and layout without copying students or marks. | `dupSyl` |
| File: Import… / Export… | Brings in Tracker data or saves a file copy, with the selected content. | `fileTransfer.js`, `importClick`, `openCopy` |

## People & accounts

| On screen | What it means | In the code |
|---|---|---|
| Admin → Users | Manages people’s roster status, accounts and access requests. | `UsersPanel`, `ACCOUNTS`, `PEOPLE` |
| Sign in | Opens the app using an account linked to a person. | `Login`, `SESSION` |
| Username / Sign-in (defence mail) — two names on screen | The account identifier entered at sign-in and managed by an admin. | `Login`, `UsersPanel`, `ACCOUNTS` |
| Request access | Sends an admin a request to join the app. | `AccessScreen`, `ACCESS_REQS` |
| Waiting for access | Lists requests that an admin has not yet decided. | `UsersPanel`, `ACCESS_REQS` |
| Give access | Approves a request and links the account to a roster person. | `UsersPanel`, `accounts.ts` |
| Guest view / View the schedule | Lets a person waiting for access read the schedule when the admin enables it. | `GuestApp`, `guestEntry` |
| Member / Admin | The access role for personal work or scheduling and management. | `AccountRole`, `perms.ts` |
| [The signed-in name badge] | Identifies the current person and lets an admin switch between admin and member views. | `switchRoleView`, `mayViewAsMember` |
| Add a person / + Add person — two names on screen | Creates a roster person and, when supplied, that person’s sign-in. | `UsersPanel`, `NewPerson`, `openAdminUsers` |
| Callsign/Name / Displayed callsign/name — two names on screen | The name shown on the person’s puck and roster row. | `CALLSIGN_LABEL`, `Person.cs` |
| Sign-in / Roster | The two status dots showing account access and active roster membership. | `UsersPanel`, `ACCOUNTS`, `PEOPLE` |
| Suspend / Enable | Turns an existing account’s sign-in access off or back on. | `accounts.ts`, `UsersPanel` |
| Archive | Takes the person off the active roster from today (on the Leave War, posted out from today) and suspends their sign-in, keeping earlier records. | `archivePerson`, `leavewar/sync.ts`, `UsersPanel` |
| Restore | Returns an archived person to the roster from a chosen post-in date. | `UsersPanel`, `restoreArchivedPerson`, `restoreArchivedAs` |
| Delete | Removes the person, their account, their Quals row and every day still to come; days they flew keep their puck. Cannot be undone. | `deletePerson`, `state/person-delete.ts`, `UsersPanel` |
| Post in / PI from — two names on screen | The date from which the person belongs in the squadron’s manning. | `PostInField`, `BidPicker`, `postouts` |
| Post out / PO from — two names on screen | The date from which the chosen posting outcome applies. | `BidPicker`, `PostOutcome`, `postouts` |
| SANS | An aircrew status for people who file availability to join flying or simulator tasks. | `Person.san`, `SansOffer` |
| Quals | The roster’s qualifications, category, flight and initials. | `QualsPage`, `PEOPLE`, `QualCol` |
| CAT | The person’s qualification category used when checking crew and seats. | `Person.q`, `QLevel`, `LEVELNAME` |
| Edit / Done / Edit quals | Edits people’s values, ends that editing, or changes the qualification columns themselves. | `qEditing`, `QualsPage`, `QualCol` |
| Scheduler / Management | Admin-controlled marks used for scheduling authority and management grouping. | `SCHED_KEY`, `MGMT_KEY`, `Person` |
| Export to Excel / Export — two names on screen | Exports the Quals table, with the shorter button name on a phone. | `QualsPage` |

## Insights

| On screen | What it means | In the code |
|---|---|---|
| Insights / Week insights — two names on screen | Summarises the week using each day’s latest issued version, or its working copy if never published. | `InsightsModal`, `computeInsights` |
| Sorties | Counts the week’s flying aircraft rows, including eligible standby rows that fly. | `computeInsights`, `saFlies` |
| Formations | Counts the week’s flying formations. | `computeInsights`, `Formation` |
| Aircrew flying | Counts the people assigned to the counted flying rows. | `computeInsights` |
| Flying load · sorties this week | Compares the number of sorties assigned to each person. | `insightsHTML`, `computeInsights` |
| Blue / Red | Splits flying load by the formation’s mission role when tracking is enabled. | `resolveMissionRole`, `mission-role.ts` |
| Choose mission role / Change mission role | Records or corrects the formation’s Blue or Red answer. | `mission-role-offer.ts`, `readRole` |
| Work hours · report to debrief, this week | Totals each person’s working-day spans, rather than airborne time alone. | `workSpan`, `computeInsights` |
| Not on the flying programme | Lists every aircrew member on that week’s roster with no counted flying sortie; it does not check leave or other absences, though its heading counts them as “available”. | `computeInsights`, `rosterIds` |
| Conflicts by type / By day | Groups the week’s scheduling findings by their kind or date. | `computeInsights`, `insightsHTML` |

## Admin and settings

| On screen | What it means | In the code |
|---|---|---|
| Squadron config | Holds the squadron’s reusable schedule templates and default arrangement. | `AdminPage` |
| Default arrangement | Sets the default order of day sections and flying waves. | `SecDefault`, `WaveDefault`, `AdminPage` |
| Duty templates… | Manages reusable duty blocks with their rows and times. | `DutyTpl`, `DutyTplModal` |
| Day templates… / Templates — two names on screen | Manages or applies reusable copies of a whole day’s schedule. | `DayTpl`, `DayTplModal`, `dayTplMenu` |
| Wave templates… | Manages reusable flying waves and their lines. | `WaveTpl`, `WaveTplModal` |
| Data / Old clutter | Provides date-based controls for removing selected old records. | `AdminPage`, `ClearControl` |
| Clear edit history… | Clears the selected period of recorded edit history. | `ClearControl`, `ELOG` |
| Logic | Shows the scheduling settings and explains the checks that use them. | `LogicPage`, `VCONF`, `lgChecks` |
| Default rally before take-off | Sets the suggested rally lead and the reporting fallback used by work hours and OIL. | `VCONF.reportLead`, `resolveReporting` |
| Full day of OIL | Sets how long qualifying work must last to earn a full day rather than half a day. | `VCONF.oilFullMin` |
| Track Blue and Red sorties | Switches the Insights mission-role split on or off. | `missionTracking`, `lgSettings` |

## App-wide

| On screen | What it means | In the code |
|---|---|---|
| TALON | The app’s displayed name. | `TalonMark`, `Shell`, `Login` |
| [The top bar] | Holds navigation, account controls and shared actions above the current page. | `Shell`, `topbits.tsx` |
| Menu | Opens the navigation drawer when the page names are folded away. | `Drawer`, `setDrawer` |
| [The gear] | Opens settings for the page or feature beside it. | `GearIcon`, `InputsSettings`, `SansSettings` |
| Notifications | The bell’s list of notices for the signed-in person. | `BellButton`, `BellList`, `NOTICES` |
| Mark all read | Marks the current person’s notices as read. | `markAllNoticesRead` |
| Saving… | Indicates that a save is still in progress. | `SaveStatus` |
| Not saved — keep this page open / Retry | Warns that saving failed and offers another attempt. | `SaveBand`, `retrySaves` |
| Not kept — this browser loses your work on a reload | Warns that the browser cannot retain the work across a reload. | `SaveBand`, `savestatus-source.ts` |
| Logout / Sign out — two names on screen | Ends the current person’s session. | `logOut` |

## Two names on screen

These are naming differences found in the interface source, including shortened labels and button hints; they are not proposed renames.

| Names | Where each appears |
|---|---|
| AIRCREW / CREW | AIRCREW on the crew palette and board panel; CREW on Edit Schedule’s panel rail. |
| SANS Avail / SANS availability | SANS Avail on the schedule panel; SANS availability in its hints and the availability picker. |
| Remarks / Rmks | Remarks on editing fields and Inputs; Rmks on board column headings. |
| Working copy / Working draft — not issued / live copy | Working copy in loading controls; Working draft — not issued in the viewing selector; live copy in the return button and hints. |
| Switch to this plan / Select | Switch to this plan in a plan preview; Select in the Plans manager. |
| History / Changes | History on the board’s button; Changes on the main control and the window. |
| No issues / No conflicts flagged | No issues on the week’s checks bar; No conflicts flagged in the board’s empty checks list and Insights. |
| childcare leave / child care leave | The Inputs type explanation uses childcare leave; the Leave War legend uses child care leave. |
| ATT B / B; ATT C / C | ATT B and ATT C in Inputs; B and C on the Leave War grid and its legend. |
| CSE / Course | CSE as an input type and grid code; Course in explanations and the Leave War legend. |
| OD / Overseas duty | OD as an input type and grid code; Overseas duty in explanatory labels. |
| Attach / ATCH | Attach on Inputs; ATCH on the Leave War grid and legend. |
| Open for bidding / Open | Open for bidding on the desktop Leave War bar; Open on its phone bar. |
| INCL. CARRIED FWD / CARRIED | INCL. CARRIED FWD on the desktop Balances table; CARRIED on its phone heading. |
| Crew / Students | Crew on the Tracker’s selector; Students on its student-list card. |
| Username / Sign-in (defence mail) | Username on the sign-in form; Sign-in (defence mail) in Admin → Users. |
| Add a person / + Add person | Add a person in Admin → Users; + Add person on Quals, opening that admin form. |
| Callsign/Name / Displayed callsign/name | Callsign/Name on person-management fields; Displayed callsign/name on Request access. |
| Post in / PI from | Post in in Admin → Users; PI from in the Leave War’s posting window. |
| Post out / PO from | Post out on the posting action; PO from on its date field. |
| Export to Excel / Export | The same Quals export action on desktop and phone. |
| Insights / Week insights | Insights on the opening controls; Week insights on the window’s heading. |
| Day templates… / Templates | Day templates… in Admin; Templates on the Scheduler Board’s day-template control. |
| Logout / Sign out | Logout in the main app; Sign out on the access screens. |

## Unsure

| Term | What is unsure | What would settle it |
|---|---|---|
| DCO | The full wording and the operational distinction from DPCO; the code establishes only that it is a completion grade. | An approved training-grade definition or the owner’s explanation. |
| DPCO | The full wording and the operational distinction from DCO; the code establishes only that it is a completion grade. | An approved training-grade definition or the owner’s explanation. |