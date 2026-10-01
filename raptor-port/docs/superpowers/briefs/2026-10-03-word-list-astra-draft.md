# RAPTOR word list

Use the first column to match words seen or spoken. “(check)” means the current screen still needs confirming.

## Schedule and Scheduler Board

| On screen (or how the owner says it) | What it is, in one plain sentence | In the code | Not to be confused with |
|---|---|---|---|
| Edit Schedule | The editable schedule for the selected day. | `CURPAGE = 'editsched'` — `src/ui/Shell.tsx` | View-only Sched, which does not allow changes. |
| View-only Sched | The issued schedule as people are meant to read it. | `CURPAGE = 'viewsched'` — `src/ui/Shell.tsx` | The working copy, which may contain unpublished changes. |
| Scheduler board | The main board containing the day’s flying, duties, activities and people. | `SchedBoard` — `src/ui/SchedBoard.tsx` | Leave War or Tracker. |
| Day | One dated schedule inside the week. | `DAYS[di]` — `src/engine/data.ts` | A Leave War date column. |
| Calendar | Opens a date so the owner can jump to another day. | `CalendarPicker` — `src/ui/SchedBoard.tsx` | The Leave War period picker. |
| Previous day / Next day | Moves the board one date backward or forward. | Day navigation in `SchedBoard` — `src/ui/SchedBoard.tsx` | The previous-day warning trace. |
| Flying waves | The timed groups of flying lines for the day. | `waves` and `sbWave` — `src/ui/board-html.ts` | Formations, which sit inside a wave. |
| Go 1, Go 2… | The planned start time for a flying wave. | Wave `go` value — `src/ui/board-html.ts` | A person’s report or in-time. |
| Flying line | One aircraft or formation line with its crew and timings. | Wave line keys `gi`, `li`, `ai` — `src/ui/board.ts` | A ground activity row. |
| Common Programme | Activities that apply to everyone listed for that day. | `allhands` — `src/ui/board-html.ts` | Personal Inputs submitted by one person. |
| Duties | Named duties assigned in time blocks. | Duty panel rendering — `src/ui/board-html.ts` | Ground Programme activities. |
| Sims | The day’s AMT and OFT simulator rows. | `sims`, `amt`, `oft` — `src/ui/board-html.ts` | Live flying waves. |
| Ground Programme | Briefs, reviews, meetings and other scheduled ground work. | `ground` — `src/ui/board-html.ts` | Personal Inputs that have not been accepted. |
| Personal Inputs | Requests and commitments submitted by people. | `INPUTS` and `inputsOn` — `src/engine/inputs.ts` | Unavailable, which is how some accepted inputs appear on the board. |
| Available crew | People available for each flying wave. | `availByWave` — `src/ui/board.ts` | The full AIRCREW list. |
| SANS Avail | What SANS people have offered to do that day. | SANS availability rendering — `src/ui/board-html.ts` | The ordinary Available crew list. |
| Unavailable | People unavailable because of leave, medical status or another commitment. | Unavailable panel rendering — `src/ui/board-html.ts` | A warning about someone who was scheduled anyway. |
| AIRCREW | The people palette used when placing people onto the board. | `EditRoster` — `src/ui/Shell.tsx` | Tracker’s Crew selector, which selects a student. |
| ALL / ALL AVAIL | Placeholder pucks representing everyone or everyone available. | Special-person handling — `src/engine/people.ts` | A real person’s puck. |
| Templates | Reusable starting layouts for a day. | `DAYTPL_CFG` — `src/engine/daytpl.ts` | Saved plans or issued versions. |
| Plans / saved plan | Alternative complete plans kept for the same day. | `dayDrafts`, `draftSelect` — `src/engine/drafts.ts` | A day template, published version or automatic save. |
| Overall notes | Notes shown at the head of the day. | Notes panel rendering — `src/ui/board-html.ts` | Notes attached to one flying line. |
| Public notes | Notes intended to appear on the readable schedule. | Public-note rendering — `src/ui/html.ts` | Scheduler notes used while planning. |

## Publishing and amendments

| On screen (or how the owner says it) | What it is, in one plain sentence | In the code | Not to be confused with |
|---|---|---|---|
| DRAFT | A day that has not yet been issued. | `verTagHTML` — `src/ui/html.ts` | A published day with unpublished changes. |
| Publish day | Issues a day for the first time. | `dayApproved`, `commitSetDayApproved` — `src/engine/publish.ts`; `src/state/sched-commit.ts` | Saving the working copy. |
| ORIG / Original | The first issued version of a day. | `verLabel`, `dayCurVer` — `src/engine/publish.ts` | The current working copy. |
| AL1, AL2… | Later issued versions containing amendments. | `verSeq`, `verLabel` — `src/engine/publish.ts` | The number of pending changes. |
| Amendments | Changes made after the original day was issued. | `ALPanel` — `src/ui/ALPanel.tsx` | Changes made before the first publication. |
| Publish AL1, AL2… | Issues the next amendment for one day. | `publishALDay`, `commitPublishALDay` — `src/engine/publish.ts`; `src/state/sched-commit.ts` | Publishing the original day. |
| Changes to publish | Unissued differences between the working copy and latest issued version. | `dayDelta`, `dayPendingItems` — `src/engine/publish.ts` | All historical edits. |
| N pending / N new / N changes | A count of items waiting to be issued for that day. | `dayShownPendCount`, `chgDayCounts` — `src/ui/html.ts` | Warnings and advisories. |
| Working draft — not issued | The current editable version containing changes people cannot yet see in view-only mode. | `VWORK` and `viewVerSelHTML` — `src/ui/html.ts` | A saved alternative plan. |
| Original / AL… — as issued | A read-only view of exactly what was issued in that version. | `viewVerSelHTML` — `src/ui/html.ts` | Today’s working copy. |
| Load onto working copy | Copies a selected issued version back into the editable schedule. | `loadVersionToWorkingCopy` — `src/engine/drafts.ts` | Republishing that version immediately. |
| Unpublish | Withdraws the current issued state so it can be corrected. | `unpublishDay`, `commitUnpublish` — `src/engine/publish.ts`; `src/state/sched-commit.ts` | Publishing a new amendment. |
| Signed | Shows that the required sign-off names are present for the issued version. | `SIGN_ROLES` and signing renderer — `src/engine/publish.ts`; `src/ui/html.ts` | Publishing; a day can show that it is not yet signed. |
| CUR CK / SKED CK / PLANNED BY / APPROVED BY | The four sign-off roles printed with an issued version. | `SIGN_ROLES` — `src/engine/publish.ts` | User access roles such as Admin and Member. |
| Not yet signed | The issued version does not yet have every required sign-off. | `nysMarkHTML` — `src/ui/html.ts` | Not yet published. |
| Not yet published | The day remains an unissued draft. | `nysMarkHTML` — `src/ui/html.ts` | Published with pending amendments. |

## Inputs

| On screen (or how the owner says it) | What it is, in one plain sentence | In the code | Not to be confused with |
|---|---|---|---|
| Personal Inputs | The page where people submit availability, leave, medical status and commitments. | `InputsPage` — `src/ui/InputsPage.tsx` | The Personal Inputs section on the schedule board. |
| Person | The person the input belongs to. | Input `pid` — `src/engine/inputs.ts` | The user account used to sign in. |
| Dates | The period covered by the input. | Input date fields — `src/ui/inputedit.tsx` | The schedule week currently open. |
| Available for | The flying or simulator work a SANS person is offering. | SANS availability fields — `src/ui/inputedit.tsx` | A confirmed schedule assignment. |
| All day / Start time / End time | Whether the input covers the whole day or only part of it. | Input timing fields — `src/ui/inputedit.tsx` | A flying wave’s Go time. |
| LL, OL, OIL, CCL, PL, FCL, EL, CL | The leave choices shown in the Type list. | `INPUT_META` leave entries — `src/engine/inputs.ts` | Medical or duty choices. |
| HL, OML, ATT C, ATT B | The medical choices showing why and how a person is medically unavailable. | `INPUT_META` medical entries — `src/engine/inputs.ts` | Upchit, which marks someone fit again. |
| “Downchit” (no single screen choice) | The owner’s general word for a medical input that makes someone unavailable or unable to fly. | `isDownchit` — `src/engine/inputs.ts` | One exact medical Type; the screen uses the specific choices above. |
| Upchit | A record that the person is medically fit again. | `INPUT_META.Upchit` — `src/engine/inputs.ts` | An absence or leave input. |
| Training, CSE, Meeting, Fly with, Personal, Appointment, Duty, OD, Other | The duty and other commitment choices in the Type list. | `INPUT_META`, `TYPE_GROUPS` — `src/engine/inputs.ts` | Leave or medical choices. |
| → Ground | Accepts an input into the Ground Programme. | `accCtl` — `src/ui/html.ts` | Merely recording the input. |
| → Unavail | Accepts an input into the board’s Unavailable section. | `accCtl` — `src/ui/html.ts` | Deleting the input. |
| Undo beside an accepted input | Removes that input’s accepted placement from the board. | Acceptance undo control — `src/ui/html.ts` | The main app Undo button. |
| LATE | The input was filed after its allowed filing point. | `isLateInput`, late tag rendering — `src/engine/inputs.ts`; `src/ui/InputsPage.tsx` | A schedule warning; hiding it on the board does not remove it here. |
| OIL? | The app still needs an answer about earned leave for that non-working day. | OIL question handling — `src/ui/InputsPage.tsx` | An OIL balance or manual OIL award. |

## Warnings and rules

| On screen (or how the owner says it) | What it is, in one plain sentence | In the code | Not to be confused with |
|---|---|---|---|
| N issues / tap to review | Opens the day’s current warnings, advisories and notes. | Issue-bar rendering — `src/ui/html.ts` | Pending publication changes. |
| ✓ No issues | No current rule has raised an item for that day. | Issue-bar rendering — `src/ui/html.ts` | No unpublished changes. |
| Warning | A serious problem that normally needs action. | Warning severity in `WARN` — `src/engine/validate.ts` | An advisory or note. |
| Advisory | Something to review that is less serious than a warning. | Advisory severity in `WARN` — `src/engine/validate.ts` | A warning. |
| Note | Useful rule information, such as a long work day. | Note severity in `WARN` — `src/engine/validate.ts` | A scheduler note typed by a person. |
| “Warning list” | The owner’s name for the issue list opened from the schedule. | Warning-list HTML — `src/ui/html.ts` | The Logic page, where the rules themselves are set. |
| “The ring around the puck” | A coloured outline showing that a rule has raised an issue for that person. | `puckMarks` — `src/ui/html.ts` | The puck’s normal colour. |
| Dashed ring | A warning whose crew-rest breach has been specifically sanctioned. | `dashOf` — `src/ui/html.ts` | A hidden warning. |
| Dotted ring / “previous-day mark” | A trace showing that today’s work breaks the next day’s crew rest. | `traceOf`, `traceLeads` — `src/ui/html.ts` | An issue caused entirely within the current day. |
| C, Q, R, 7, B, D, L, CP | Small puck flags identifying the kind of issue. | Chip text and warning ranking — `src/ui/html.ts`; `src/engine/validate.ts` | Qualifications, duties or names printed elsewhere. |
| Hide this warning | Stops one warning from being shown without changing the schedule. | `warnShown` and warning hide key — `src/ui/html.ts` | Fixing the cause of the warning. |
| Flag this again | Makes a previously hidden warning visible again. | `warnShown` reset control — `src/ui/html.ts` | Creating a new warning. |
| Logic | The page containing every rule and its current setting. | `LogicPage` — `src/ui/LogicPage.tsx` | The day’s warning list. |
| Edit rules | Allows the owner to change rule settings and limits. | `VCONF`, `RULE_SPEC` — `src/engine/rules.ts` | Editing the schedule itself. |
| Off standard | A rule is no longer using its standard setting. | Rule comparison in `LogicPage` — `src/ui/LogicPage.tsx` | A rule that is switched off. |
| Fired this week | Shows rules that raised at least one issue during the week. | Logic filter state — `src/ui/LogicPage.tsx` | Issues hidden on one day. |
| ⓘ Info only | The item is displayed but is not tested by the rules and earns no OIL. | `info`, `fyiTag` — `src/ui/board-html.ts` | A harmless rule note. |
| B box | The suggested briefing time beside a flying line. | Brief-time rendering — `src/ui/board-html.ts` | A warning flag; on an SC line it can mean in-time. |
| Already on… | An immediate message that the person is already placed elsewhere. | Drop validation in `src/ui/board.ts` | A saved warning in the issue list. |

## Insights

| On screen (or how the owner says it) | What it is, in one plain sentence | In the code | Not to be confused with |
|---|---|---|---|
| Insights | Opens a summary of the selected week. | `InsightsModal` — `src/ui/Modals.tsx` | The Logic page or Changes window. |
| Week insights | The summary covering the displayed week. | `insightsHTML` — `src/ui/Modals.tsx` | One day’s warning list. |
| Sorties | The number of planned flying sorties counted for the week. | `computeInsights` — `src/engine/insights.ts` | Formations. |
| Formations | The number of planned formations counted for the week. | `computeInsights` — `src/engine/insights.ts` | Individual aircraft or sorties. |
| Aircrew flying | The number of people included in the flying programme. | `computeInsights` — `src/engine/insights.ts` | Everyone on the roster. |
| Flying load · sorties this week | A person-by-person view of the week’s flying load. | Flying-load result — `src/engine/insights.ts` | Work hours. |
| Work hours · report to debrief, this week | Time from report to debrief, or from an activity’s start to end. | Work-hours result — `src/engine/insights.ts` | Airborne hours. |
| Not on the flying programme | Available people who are not currently used for flying. | Unused-aircrew result — `src/engine/insights.ts` | People who are unavailable. |
| Conflicts by type | A count of current visible issues grouped by their cause. | Conflict summary — `src/engine/insights.ts` | Hidden warnings, which are not counted. |
| By day | The same weekly figures split across individual dates. | Daily insight results — `src/engine/insights.ts` | The Scheduler Board’s day selector. |

## OIL

| On screen (or how the owner says it) | What it is, in one plain sentence | In the code | Not to be confused with |
|---|---|---|---|
| OIL | Earned leave: time off banked because qualifying work was done. | OIL state and calculations — `src/engine/oil.ts` | Pay, money or an expense. |
| OIL Earn | Opens the schedule mode used to review who earns OIL from planned work. | `oilModeOn`, `toggleOilMode` — `src/ui/oilmode.ts` | The OIL tracker. |
| Green edge | The published activity counted toward someone’s earned leave. | `oilSeatDeco`, `oilEvidence` — `src/ui/oilmode.ts` | A warning ring. |
| Green ring in OIL Earn | The selected person is currently set to earn OIL from that activity. | OIL-mode puck decoration — `src/ui/oilmode.ts` | A person’s ordinary puck colour. |
| Tap off / on in OIL Earn | Removes or restores earned leave for that person and activity. | OIL earn toggle — `src/ui/oilmode.ts` | Removing the person from the schedule. |
| Yes — credit FO / HO | Confirms a full-day or half-day earned-leave credit. | `OilConfirm` — `src/ui/OilConfirm.tsx` | Approving leave to be taken. |
| FO / HO on Leave War | A full-day or half-day OIL amount shown for that date. | OIL award cell rendering — `src/leavewar/ui/WarSheet.tsx` | A normal leave bid. |
| OIL TRACKER | The record of each person’s earned-leave balance and credits. | `OilTracker` — `src/leavewar/ui/OilTracker.tsx` | OIL Earn on the schedule. |
| Bal | The person’s current earned-leave balance. | Balance rendering in `OilTracker` — `src/leavewar/ui/OilTracker.tsx` | Annual or other leave figures. |
| Credit OIL | Adds earned leave to a person by hand. | Credit form and grant action — `src/leavewar/ui/OilTracker.tsx` | Automatic credit from published work. |
| Auto | The credit came automatically from qualifying published work. | Automatic-credit tag — `src/leavewar/ui/OilTracker.tsx` | A hand-entered credit. |
| Credits · oldest first | Lists the person’s OIL entries in date order. | Ledger rendering — `src/leavewar/ui/OilTracker.tsx` | The schedule’s change history. |
| Archive | Hides an old OIL credit from the active tracker view. | Archive action — `src/leavewar/ui/OilTracker.tsx` | Archiving a person. |
| OIL lasts | Sets how long an earned-leave credit remains available. | OIL expiry settings — `src/leavewar/ui/OilTracker.tsx` | The history display range. |
| History: From first entry / Last N months / Range | Chooses which OIL records are displayed. | Tracker window state — `src/leavewar/ui/OilTracker.tsx` | The lifetime of the credits themselves. |

## Leave War

| On screen (or how the owner says it) | What it is, in one plain sentence | In the code | Not to be confused with |
|---|---|---|---|
| Leave War | The grid used to collect, decide and publish leave choices for a period. | Leave War shell — `src/leavewar/ui/Chrome.tsx` | The schedule or Personal Inputs page. |
| Period | The named date span currently open in Leave War. | Period picker — `src/leavewar/ui/Chrome.tsx` | The dates of one person’s bid. |
| + New | Creates a new Leave War period starting in draft. | `WarSheet` creation flow — `src/leavewar/ui/WarSheet.tsx` | Adding a leave bid. |
| DRAFT | The Leave War is still being prepared. | `stageLabel` — `src/leavewar/engine/stages.ts` | A draft schedule day. |
| OPEN FOR BIDDING | People may enter their leave choices. | `stageLabel` — `src/leavewar/engine/stages.ts` | A published result. |
| BIDDING CLOSED | New bidding is closed while decisions are completed. | `stageLabel` — `src/leavewar/engine/stages.ts` | A deleted or archived period. |
| PUBLISHED | The Leave War decisions have been released. | `stageLabel` — `src/leavewar/engine/stages.ts` | A published schedule day. |
| Bidding on | Shows the dates during which people may submit bids. | Bidding-window rendering — `src/leavewar/ui/Chrome.tsx` | The Leave War period itself. |
| THE WHOLE YEAR | The bidding window covers the full year. | Bidding-window label — `src/leavewar/ui/Chrome.tsx` | A one-year leave entitlement. |
| Grid | The table with people down the side and dates across the top. | `WarSheet` — `src/leavewar/ui/WarSheet.tsx` | The schedule board. |
| Bid | A person’s request for leave on a date. | `BidPicker` — `src/leavewar/ui/BidPicker.tsx` | An approved leave result. |
| Ack | Marks a bid as seen and waiting for a decision. | Bid state in `BidPicker` — `src/leavewar/ui/BidPicker.tsx` | Approve. |
| Approve | Accepts the selected leave bid. | Bid approval action — `src/leavewar/ui/BidPicker.tsx` | Acknowledging it. |
| Refuse | Declines the selected leave bid. | Bid refusal action — `src/leavewar/ui/BidPicker.tsx` | Deleting the bid. |
| Move | Moves a selected bid to another date. | Move action — `src/leavewar/ui/SheetActions.tsx` | Rearranging whole people rows. |
| Delete | Removes the selected bid from the grid. | Delete action — `src/leavewar/ui/SheetActions.tsx` | Refusing it while keeping the decision visible. |
| Under-manned | Too few available people remain on one or more dates. | Manning verdicts — `src/leavewar/ui/Chrome.tsx` | A warning from the schedule’s Logic rules. |
| Manning | The rules that decide how many people must remain available. | Manning requirements and counts — `src/leavewar/engine` | Leave balances in Figures. |
| Figures | Leave balances and totals shown beside each person. | Figure definitions and ordering — `src/leavewar/engine/counters.ts` | Manning figures. |
| +LVE, +OIL, +CCL, +FCL, +CL, +PL | The remaining amounts shown for the different leave pools. | Figure columns — `src/leavewar/engine/counters.ts` | Leave already used. |
| −LVE TOT / −MED TOT | Totals already taken for leave or medical reasons. | Figure columns — `src/leavewar/engine/counters.ts` | Remaining balances. |
| Rearrange | Allows people’s rows to be put in a different order. | Arrange mode — `src/leavewar/ui/Chrome.tsx` | Moving a bid to another date. |
| Filed on Inputs page — change there | The grid mark came from Personal Inputs and must be edited there. | Input-source edge marker — `src/leavewar/ui/Chrome.tsx` | A Leave War bid entered directly in the grid. |
| * before / * after | The leave covers only the morning or only the afternoon. | Partial-day legend — `src/leavewar/ui/Chrome.tsx` | A full-day bid. |
| ! needs admin | The item needs an administrator to resolve it. | Admin-attention marker — `src/leavewar/ui/Chrome.tsx` | An under-manning result. |

## Tracker

| On screen (or how the owner says it) | What it is, in one plain sentence | In the code | Not to be confused with |
|---|---|---|---|
| PROGRESS TRACKER | The area used to follow each student through a training chart. | Tracker `App` — `src/tracker/App.jsx` | The schedule or Leave War. |
| Crew | Selects the student whose progress is being viewed. | `active`, `roster` — `src/tracker/app/core.js` | The schedule’s AIRCREW palette. |
| Course | The group or intake the selected student belongs to. | `COURSES`, `course` — `src/tracker/app/core.js` | Syllabus. |
| Syllabus / “the chart” | The shared set and layout of training events. | `SYLS`, `plan.sylId`, `SYL` — `src/tracker/app/core.js` | One student’s marks. |
| Flow chart | Shows event order and prerequisite links visually. | Flow-chart tab — `src/tracker/App.jsx` | Show All. |
| Info / Details mode | Allows an event to be opened for its details and marking. | `showDetails` — `src/tracker/App.jsx` | Editing the chart layout. |
| Show All | Displays the complete chart without following only one route. | `openShowAll` — `src/tracker/app/core.js` | Showing all students. |
| Event / “ball” / “poke-ball” | One training event shown as a coloured node on the chart. | Event definitions in `SYL`; edit modal — `src/tracker/Modals.jsx` | A student’s mark for that event. |
| Prereq links / Prerequisites | The events that should be completed before another event. | Event prerequisite fields — `src/tracker/Modals.jsx` | Next event, which is calculated for one student. |
| Ring segment | One student’s result around an event ball. | `marks` and ring rendering — `src/tracker/Legend.jsx` | The event’s centre colour, which shows its type. |
| DCO, DPCO, Marginal, NA, Not done | The result choices for one student and event. | Mark values — `src/tracker/Legend.jsx` | Event types such as Flight or Sim. |
| Flight, Acad/Spec, Test, Sim, CFT/IAT/EPT | The event types shown by the centre colour of a ball. | Event type legend — `src/tracker/Legend.jsx` | Student result marks around the edge. |
| Students | The people included in the selected Tracker course. | Tracker roster — `src/tracker/SidePanel.jsx` | The full app roster. |
| Overall: Complete / Done / Remaining | A summary of how much of the chart the student has finished. | Overall summary — `src/tracker/SidePanel.jsx` | One event’s result. |
| Next event | The next event suggested by the chart’s order and prerequisites. | Next-event calculation — `src/tracker/SidePanel.jsx` | Plannable now. |
| Plannable now | Events that can currently be planned for the student. | Planning calculation — `src/tracker/SidePanel.jsx` | Events that are merely next on the chart. |
| Last Flown (Syllabus) | The last date the student completed flying in this syllabus. | Tracker `dates` summary — `src/tracker/SidePanel.jsx` | Last Flown (Currency). |
| Last Flown (Currency) | The date used for the student’s current flying currency. | Currency summary — `src/tracker/SidePanel.jsx` | Syllabus progress. |
| Down Days / Upchit Date | Medical timing recorded for the student. | Medical fields — `src/tracker/SidePanel.jsx` | Schedule Personal Inputs. |
| Pace & expected end | An estimate of progress speed and likely completion date. | Pace calculation — `src/tracker/SidePanel.jsx` | A promised completion date. |
| Failures | The student’s recorded unsuccessful attempts. | Failure summary — `src/tracker/SidePanel.jsx` | Marginal marks. |
| Lull periods | Longer gaps between the student’s recorded events. | Lull calculation — `src/tracker/SidePanel.jsx` | Leave periods. |
| Edit chart layout | Allows event balls and links to be rearranged. | `arrangeMode` — `src/tracker/App.jsx` | Entering student marks. |
| Save changes | Saves structural changes to the chart. | `saveChangesClick` — `src/tracker/app/core.js` | Marks, dates and student details, which save automatically. |
| Import / Export | Loads or copies Tracker data as a file. | `importClick`, `openCopy` — `src/tracker/app/core.js` | Saving current changes. |

## People and accounts

| On screen (or how the owner says it) | What it is, in one plain sentence | In the code | Not to be confused with |
|---|---|---|---|
| Admin → Users | The screen for managing people, sign-ins and access. | `UsersPanel` — `src/ui/UsersPanel.tsx` | Quals, which manages qualifications. |
| People | The current roster of people known to the app. | `PEOPLE` — `src/state/accounts.ts` | Accounts used to sign in. |
| Sign-in | The account that lets a person enter the app. | `Account` — `src/state/accounts.ts` | The person’s roster record. |
| Roster | The person’s operational record used by schedules and other areas. | Person records in `PEOPLE` — `src/state/accounts.ts` | Sign-in access. |
| Callsign/Name | The visible name used for a person throughout the app. | `CALLSIGN_LABEL` and person `pid` — `src/ui/UsersPanel.tsx` | The defence mail used for sign-in. |
| Sign-in (defence mail) | The mail address used to identify the person’s account. | Account login field — `src/ui/UsersPanel.tsx` | Callsign/Name. |
| Admin / Member | The person’s app access role. | Account role and `SESSION` — `src/state/accounts.ts` | Pilot, WSO or Personnel. |
| Pilot / WSO / Personnel | The person’s roster seat or working group. | Seat choice in `UsersPanel` — `src/ui/UsersPanel.tsx` | Admin or Member access. |
| Add a person | Creates a roster record without necessarily creating a sign-in. | `NewPerson` — `src/ui/UsersPanel.tsx` | Add person and sign-in. |
| Add person and sign-in | Creates both the roster person and their account. | `addPersonAndAccount` — `src/state/roster-add.ts` | Adding only a roster person. |
| Give sign-in | Adds account access to a person already on the roster. | Account creation in `UsersPanel` — `src/ui/UsersPanel.tsx` | Restoring an archived person. |
| Waiting for access / Request access | The person has asked for an administrator to grant app access. | `requestAccess` — `src/state/accounts.ts` | A suspended account. |
| Suspend / Enable | Turns sign-in access off or on without removing the roster person. | Account enabled state — `src/ui/UsersPanel.tsx` | Archive, which also removes the person from the current roster. |
| Archive | Removes the person from the current roster while retaining past records. | `archivePerson` — `src/leavewar/sync.ts` | Delete or OIL-credit archive. |
| Restore | Returns an archived person to the roster and restores their sign-in where possible. | `restoreArchivedPerson` — `src/leavewar/sync.ts` | Enabling a merely suspended account. |
| Delete | Removes the person from today and future use while keeping historical records. | Person deletion flow — `src/state/person-delete.ts` | Erasing historical schedules. |
| Guest view | Shows the app as a read-only guest would see it. | `GUESTVIEW` — `src/state/accounts.ts` | Member access. |
| Quals | The page containing each person’s seat, category and qualifications. | Qualifications page and `mayEditQualsOf` — `src/ui` | Tracker progress marks. |
| Enable editing / Edit quals | Allows permitted qualification values to be changed. | Qualification edit state — `src/ui` | Editing the person’s account or role. |

## Saving, undo and history

| On screen (or how the owner says it) | What it is, in one plain sentence | In the code | Not to be confused with |
|---|---|---|---|
| Saving… | The latest change is being stored in the background. | `SaveStatus` — `src/ui/SaveStatus.tsx` | Publishing a schedule. |
| No label after saving | The save message disappears when current changes have been stored. | Saved state in `SaveStatus` — `src/ui/SaveStatus.tsx` | A saved alternative plan. |
| Not saved — Retry | The latest change could not be stored and should be tried again. | Save-error state in `SaveStatus` — `src/ui/SaveStatus.tsx` | A validation warning. |
| Sync | Checks for newer shared data and brings the screen up to date. | Sync control — `src/ui/Shell.tsx` | Saving or publishing. |
| Undo | Reverses the latest eligible change made in the current work session. | `UndoPair`, `globalUndo` — `src/ui/topbits.tsx`; `src/undo/timeline.ts` | Viewing the permanent change history. |
| Redo | Reapplies the latest change that was undone. | `UndoPair`, `globalRedo` — `src/ui/topbits.tsx`; `src/undo/timeline.ts` | Repeating a failed save. |
| Tracker Undo / Redo | Reverses or reapplies Tracker changes only. | `trackerUndoEngine` — `src/ui/topbits.tsx` | The main app Undo and Redo. |
| Changes | Opens the read-only record of edits and who made them. | `ChangesWindow` — `src/ui/ChangesWindow.tsx` | Pending amendments. |
| History | Opens the same changes record from the schedule board. | History control and `CHGWIN` — `src/ui/SchedBoard.tsx`; `src/ui/ChangesWindow.tsx` | Undo history. |
| Changes · day / Changes · week of | Shows recorded edits for one day or a whole week. | `ChangesWindow` range state — `src/ui/ChangesWindow.tsx` | The issued-version selector. |
| New to you | Shows recorded changes the current person has not marked as seen. | Changes-window tab — `src/ui/ChangesWindow.tsx` | New pending publication items. |
| All changes | Shows the full recorded change list for the chosen date range. | Changes-window tab — `src/ui/ChangesWindow.tsx` | Undoable actions from this session. |
| Group by Item / Who | Groups the change record by the thing changed or the person who changed it. | Changes-window grouping — `src/ui/ChangesWindow.tsx` | Sorting the schedule board. |
| History on: Tap a gold dot on the schedule | Gold dots can be tapped to see the recorded edits for that item. | History mode in `ChangesWindow` — `src/ui/ChangesWindow.tsx` | A warning or OIL marker. |
| Gold dot (no printed name) | The schedule item has a recorded change that can be opened in History mode. | Edit-history dot rendering — `src/ui/html.ts` | The ring around a puck. |
| Mark all as seen | Removes the “new to you” status from all currently listed changes. | Seen-state action — `src/ui/ChangesWindow.tsx` | Deleting the history. |
| Working copy | The editable schedule state currently being saved. | Working data in `DAYS`; `VWORK` — `src/engine/data.ts`; `src/ui/html.ts` | A published version or saved plan. |
| Saved plan | A deliberately kept alternative day plan. | `dayDrafts` — `src/engine/drafts.ts` | Automatic saving, Undo or change history. |

## Terms not confidently placed

- **Discard marks (check):** the source still contains this label, but the latest ruling says the control was removed; verify the running screen before documenting it as current.
- **EOD (check):** older decisions use this term for an issued state, but no current visible label was found.
- **Insights directly on the Scheduler Board (check):** the ruling calls for an entry point there, but the current board control was not confidently located.
- **Earned / Awarded as visible headings (check):** the distinction is defined—automatic earned leave versus a hand-entered award—but those exact headings were not confidently found on the current screen.

