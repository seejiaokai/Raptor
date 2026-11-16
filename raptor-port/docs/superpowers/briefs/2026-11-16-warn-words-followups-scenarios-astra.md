# Astra's scenario design — [WARN-WORDS-STANDALONE]'s follow-ups (16 Nov 26, chat 86)

Astra (codex exec, read-only, repo root, branch claude/warn-words-followups at 7eade5b52), from the brief beside this file. Saved whole, unedited, below.

This is the scenario-design report for the four follow-ups. It identifies missing coverage, not confirmed defects. I changed no files and ran no tests or browser steps.

The proposed walk has ten ranked scenarios, budgeted at about one hour for one walker. That estimate is unmeasured. Reuse the fixtures and batch visits to each page; keep each omitted step visible in the report.

Two distinctions govern the expectations:

- D2073 excludes the blank-END SC-template desk from the endings used for crew rest. Its assumed hour still counts for conflicts, availability, the long day and Insights. **OIL requires written times and must not credit that assumed hour** (D31, D360).
- A next-week peek deliberately has no warning list, warning chips or crew-rest traces. Check Sunday’s forward mark, then load Monday to inspect its warning.

All code locations below are relative to `raptor-port/src/`.

The previous sheet covers many shared displays, but it does not establish these changes on each specialised route. Add the following proof rows to the roll-call. Each remains **to walk**, rather than a runtime PASS.

| Surface or route | Required sign and working gesture | Where it is drawn or read |
|---|---|---|
| AVALON and BB, MAIN and SPARE | Front-seat warning begins **Illegal seat:** and identifies the correct kind, role and hours; warning tap finds its own crew | `engine/validate.ts:1157–1163`; collector `engine/events.ts:314–325` |
| SC SPARE | Same new prefix, with SPARE and its hours | `engine/validate.ts:1492–1497` |
| Ordinary flight | New prefix, formation and take-off time | `engine/validate.ts:1334–1347` |
| OFT and AMT BOX | New prefix and the correct sim’s hours | `engine/validate.ts:1555–1563`; `ui/board-html.ts:490–554` |
| Edit Schedule and View-only warning lists | New sentence and **Illegal seat** short name; tap highlights the right crew; admin hide/show still works | `ui/html.ts:1195–1221` |
| Board warning list | Same warning through its separate renderer; tap and hide/show | `ui/board.ts:512–544` |
| Q chip and whole-puck note | **Illegal seat** in the chip’s title and the puck’s warning words | `ui/html.ts:538,552–554`; labels `engine/validate.ts:28,75` |
| Day-details window | Correct warning names, sentences and counts for the document on screen; tapping a warning closes the window and finds it | `ui/html.ts:2544–2607`; `ui/Modals.tsx:23–69` |
| Placement note and warning’s foot note | Fresh placement says **Illegal seat:** with the person named; warning focus reads the correct line | `state/dropflag.ts:84–105`; `state/view.ts:796–807` |
| Pending list and change history | A newly hidden seat warning carries the new words; its link returns to the right warning | `ui/pendlist.ts:419–426`; `state/changelines.ts`; `ui/ChangesWindow.tsx:63–72` |
| Previous day’s crew-rest mark | Blank-END SC desk contributes no ending, breach, tight-rest note or forward trace; typed END restores its contribution | `engine/validate.ts:501–599`; `ui/html.ts:1037–1069` |
| Crew picker: unarmed and seat selected | Same-day occupied hours remain; next-day clearance agrees with the crew-rest judgment | `engine/avail.ts:18–44,466–470` |
| ALL and ALL AVAIL | Count, names and reasons remain usable over the assumed hour; original seat and additional-people line both covered | `engine/oil.ts:440–452`; `ui/AvailWindow.tsx:95–190,314–330`; `ui/oilmode.ts:960,1002–1012` |
| Insights | **Illegal seat** category; hours still include the desk’s assumed hour in the appropriate working/issued document | `ui/insights-html.ts:55–56`; `engine/insights.ts:12–20,60–64` |
| OIL Earn and downstream earned leave | Blank END earns nothing, with a reason; typed times can earn after publication | `engine/oil.ts:267–270,395–401`; `ui/AvailWindow.tsx:326–330` |
| Current and older issued-version looks, from week and Board | Each displays the right document and warning bundle; preview stays read only | `ui/html.ts:184–185`; `ui/SchedBoard.tsx:458–492`; `engine/validate.ts:1867–1896` |
| Saved plan: preview versus switching | Preview is flag-free; switching makes it the checked working day | `ui/html.ts:389–428`; `ui/board.ts:1867–1938` |
| Next-week peek | Correct desk times and people, with no warning annotations; clicking a day loads that week | `ui/peek.ts:54–65,185–195,263–264,307–318` |
| Logic | Every changed explanation says “conflict”; new setting name, search, editing and Reset work; Q name also changed in the flag-order explanation | `ui/logic-html.ts:47–66,89–94,126–188,217`; `ui/LogicPage.tsx:136–191` |
| Both Legend doors | Edit Schedule **and View-only Sched**, folded/open/folded, desktop and phone; same approved words and height at each size | `ui/Shell.tsx:577–579,659–661`; `ui/html.ts:430–457` |
| Member and phone copies | Ranger reads the warning list, day details, Legend, ALL AVAIL, Insights and Logic through normal doors | Same renderers; member controls in `ui/AvailWindow.tsx:89–93` and `ui/LogicPage.tsx:440–447` |

The desk’s identity needs its own writer roll-call:

| Writer or operation | What the walk must establish | Source |
|---|---|---|
| Duties → **+ Block → SC Shift** | Creates the qualifying desk. Explicitly clear the template’s existing END | `ui/board.ts:1705–1724`; `engine/dutytpl.ts:180–184` |
| **Empty block**, with SC-looking title or role typed/pasted | Remains the plain-desk control; a name alone does not confer SC identity | `ui/board.ts:1719`; `engine/dutytpl.ts:171–184` |
| Duty-template editor → **For wave** | SC-linked custom template versus identically named template with **None**; later library edits do not reclassify an already placed copy | `ui/DutyTplModal.tsx:103–110`; `engine/dutytpl.ts:171–184` |
| **+ Row inside an SC block** | Record the result separately: identity belongs to the block, so this is a product interpretation worth exposing | `ui/board.ts:1155–1159`; `engine/events.ts:542–544` |
| **Save this day as a template**, then apply it | Identity and times survive; people are intentionally cleared and must be placed again | `engine/daytpl.ts:99–104,136–142,245–262` |
| **+ Alt Plan**, switch plans, publish, amend, load an issued version | Identity survives each complete-day copy and restoration | `engine/drafts.ts:301–316,367–374,699–704`; `engine/publish.ts:545–555,1393–1397` |
| Undo, Redo, reload, week away and back | Restored behaviour matches the restored END and desk type | `state/history.ts:64,95–96`; `state/store.ts:608–624` |
| Row/day/week clipboard copy or schedule import | **No production control found.** Do not invent one. Exercise the real template/plan copies and ordinary text paste instead | Schedule exports are output readers: `ui/Shell.tsx:624,631` |

Rows cannot be dragged between duty blocks. For the reversed-order case below, create two fixtures in opposite block-add order.

Run these ten scenarios in priority order, allowing route batching.

1. **Cold Monday across the week boundary — 6 minutes.**

   **Setup:** Through the Board, make Sunday’s SC Shift desk with Ranger in its original seat and Echo as an additional person. Type START `2000`; clear END. Remove competing commitments for these two men in this isolated fixture. Make Monday’s ordinary flight with Ranger front, Echo rear, B `0800`, take-off `1020`, landing `1120`. Keep Crew rest at 12 hours.

   **Action:** Open Monday directly after a reload, before visiting Sunday’s week. Then visit Sunday, type END `2300`, load Monday again, and finally clear Sunday’s END.

   **EXPECTED:** Blank END contributes no rest ending for either man; `2300` gives clearance at `1100` and breaches their `0800` report; clearing it removes that contribution again. Inspect Monday’s list, day details and picker clearance, plus Sunday’s forward mark. Source: D2073, D2055 and the cross-week contract in `docs/engine-rules.md:166–179,567–594`.

   **Disproof:** Cold and warm loads disagree; an additional person retains a false clearance; or a blank-END desk still supplies `2100` as its ending. The peek itself must remain unflagged.

2. **A skipped desk must not erase a real ending — 4 minutes.**

   **Setup:** Give Ranger an ordinary duty ending `1900`, followed by an SC-template desk START `2000`, END blank. Next day, give him a flight reporting `0600`.

   **Action:** Read next-day crew rest. Then make two otherwise identical fixtures with both a plain and an SC desk: same person, role, START and blank END, added in opposite orders.

   **EXPECTED:** The real `1900` ending still clears at `0700`, so `0600` breaches. In the twin fixtures, the plain desk must retain the plain-control behaviour regardless of order. Sources: the rest-bearing-event contract in `docs/engine-rules.md:138–164`; D2073’s recorded builder reading that plain desks are unchanged.

   **Disproof:** Adding the blank-END SC desk removes the genuine breach, or opposite block order changes the answer. This targets the collection that can otherwise collapse matching person/time/label events (`engine/events.ts:503–524`).

3. **New publication, pending edit and amendment — 7 minutes.**

   **Setup:** Publish a newly made Sunday containing the blank-END SC desk. Keep its following Monday flight.

   **Action:** Type END `2300` on Sunday’s working copy. Read Edit Schedule, View-only Sched and the pending list. Publish the amendment. Open current and Original issued-version looks from both the week and Board; open their day details. Load Original onto the working copy, then Undo.

   **EXPECTED:** The pending edit does not silently rewrite the issued END or credited OIL. After amendment, the newly issued typed END contributes to Monday’s rest. Loading Original restores its blank END and SC identity. Day details match the issued document being viewed. Current issued looks use the current live-warning exceptions; older looks retain their recorded warnings and have no new forward trace. Sources: D187, D183–D188, D2005, D2044 and the version-preview contract.

   **RECORD exactly what each Monday surface says before Sunday’s amendment**, identifying working versus issued content.

   **Disproof:** A preview reads the working END behind it, loading Original loses SC treatment, or publication changes only one of the warning/picker/trace readers.

4. **SC identity versus an SC-looking name — 5 minutes.**

   **Setup:** Make an SC Shift block and an Empty block. Give their test rows the same START `2000` and blank END; use different men with otherwise identical next-day `0800` flights. Type or paste the SC role/title into the plain block.

   **Action:** Compare rest. Rename the placed SC block. In the template editor, make an SC-linked custom template and a template with **For wave: None**; place each. Change the library association after placing a copy.

   **EXPECTED:** Behaviour follows the template association carried into the block, rather than its visible name. The plain control still assumes its end. Existing placed copies remain independent of later library edits. Sources: D2073’s recorded reading and `docs/engine-rules.md:1239–1282`.

   Add a hand-typed row **inside** the SC block and **RECORD exactly what it says**. D2073 does not expressly settle that appended-row interpretation.

   **Disproof:** Renaming changes rest treatment, a plain SC-named desk gains the exemption, or a later library edit changes an existing block.

5. **Copies, plans, Undo/Redo and reload — 6 minutes.**

   **Setup:** On an unpublished day, make Plan A with the SC desk’s END blank. Use **+ Alt Plan** to create Plan B; type END `2300` there. Also save the day as a day template and apply it to another unpublished test day.

   **Action:** Switch A → B → A; Undo and Redo an END change and a plan switch. Leave the week, return, reload after saving settles, and switch again. Re-seat people on the applied day template before testing rest. Paste valid time text once, then clear it.

   **EXPECTED:** The next-day result follows the selected plan and restored END; copying does not lose or invent SC identity. Day-template copying clears people but retains the desk type and times. Sources: the plans-selector contract in `docs/ui-contracts.md:1382–1416` and the writer map above.

   View an inactive saved plan through View-only Sched’s never-published-day selector: it is flag-free. **RECORD exactly what its day details say**; that reader retains separate live-day behaviour. Return through the Edit Schedule plans menu, not the already-filed unreachable preview-banner switch.

   **Disproof:** The same restored row behaves differently after a switch, Undo, reload or template application.

6. **The assumed hour still works everywhere else — 7 minutes.**

   **Setup:** SC desk START `2000`, END blank, with a named person and an additional person. Add an overlapping ground MEETING `2030–2045`. On an isolated variant, add an `0800` task.

   **Action:** Inspect conflicts, busy indications, ALL AVAIL on another overlapping row, Insights and the long-day warning. Put ALL AVAIL, then ALL, directly on the blank-END desk, covering original and additional-person positions. Open the counts and OIL explanation.

   **EXPECTED:** The desk remains occupied through its assumed `2100` end. It still conflicts with the meeting. An isolated desk contributes one hour to Insights; with the `0800` task, the span reaches `2100`, giving 13 hours at the standard 12-hour long-day limit. Placeholder counts remain available. **No OIL is credited from the blank END**, and the admin sees the missing-END reason. Sources: unchanged `workSpan`/occupied-window contracts; D31 and D360.

   Type END, then clear it, and repeat the decisive reads. A desk may still provide today’s first commitment; **RECORD** that separate crew-rest reading rather than assuming the desk is absent from every calculation.

   **Disproof:** The exemption makes the man free during that hour, removes the conflict/hours, loses the count, or invents earned leave.

7. **Every illegal-seat producer, starting with AVALON — 8 minutes.**

   Through the Board, place Echo or Hex, then Cotter or Ratchet, in the front seat of each row below. Supply valid hours first. Capture the immediate placement note and settled warning.

   | Row | WSO | Ground crew | Pilot record carrying CAT IW |
   |---|---|---|---|
   | AVALON, with BB sibling | Walk | Walk | Test-only guard |
   | SC SPARE | Walk | Walk | Test-only guard |
   | OFT, with AMT BOX sibling | Walk | Walk | Test-only guard |
   | Ordinary flight | Walk | Walk | Test-only guard |

   **EXPECTED:** Each warning begins **Illegal seat:**, names the person and correct row, and gives its relevant times. Source: D2074; four producer locations in the roll-call.

   **Disproof:** Any branch retains “Wrong seat”, omits its row context, or fails to warn after the real placement.

   The third branch is **not SANS**: it is an inconsistent pilot/CAT-IW record. Proper app controls do not offer IW to pilots. Inventory all four guards and have the host check their exact new wording through direct tests; do not manufacture that record and call it a user walk. Existing guard tests are in `engine/validate.test.ts:396–405` and `engine/avalon-rules.test.ts:148–167`; I did not run them.

   As quick negative controls, a pilot remains legal in either seat; a SANS pilot does not become illegal merely for being SANS; a SANS WSO remains illegal in front.

8. **One fresh seat warning through every drawer and role — 6 minutes.**

   **Setup:** Retain one newly created illegal-seat warning without competing severe warnings obscuring its reason. Publish it during this walk.

   **Action:** Read and operate its week list, Board list, Q/puck note, day details, ALL AVAIL reason, warning-focus note and Insights category. Hide it, inspect pending/history using **All changes**, show it again and Undo. Make an amendment so current and older issued looks were both created during this walk. Finally sign in as Ranger and inspect the member doors at phone width.

   **EXPECTED:** The sentence uses **Illegal seat:** and its short name is **Illegal seat** throughout. Warning taps identify the correct crew in warning colours. Issued looks follow D187. Members can read the applicable surfaces through normal member doors. Sources: D2074, D187, D188 and the renderer roll-call.

   **Disproof:** A separate drawer retains the old label, points to another row, or reads the wrong document. Do not require a new frozen-warning pending row merely because a QUAL warning changes: QUAL is live on the published face.

   Use this as the short ordinary-user round: place, inspect, correct, undo; open and close the relevant windows through their own controls. Use ALL AVAIL’s close button; its older Escape/outside-click fault is already filed.

9. **Every Logic wording, plus a functioning setting — 6 minutes.**

   **Setup:** Open Logic, clear search and expose the explanations. Inspect these ten changed fields:

   | Field | Source in `ui/logic-html.ts` |
   |---|---|
   | Step before take-off explanation | `:47` |
   | A sim explanation | `:61` |
   | SC MAIN conflicts name **and** explanation | `:66` |
   | Conflict | `:126` |
   | Overlaps standby | `:127` |
   | Incentive passenger | `:162` |
   | A standby row that flies | `:177` |
   | Conflict with a request | `:186` |
   | Half days | `:188` |

   **Action:** Read all explanations, including the already-correct **A flight** row and **Several problems on one puck**. Search “conflict”, “clash” and “Illegal seat”. In Edit, inspect all six SC MAIN choices; change **a ground event**, finish editing, leave/return, reload, then Reset that setting. Read the page as Ranger too.

   **EXPECTED:** No explanation naming this check says “clash”. The setting remains **SC MAIN conflicts**, with its six existing choices and saved grading intact. The check and Q flag-order entry say **Illegal seat**. Member reading remains available without editing controls. Sources: D2077, D2074; controls `ui/LogicPage.tsx:136–191`.

   **Disproof:** An unsearched/collapsed line retains the old word, search misses the renamed setting, or the label change alters the saved choice or Reset.

10. **Both Legend doors, both sizes, folded and open — 5 minutes.**

    **Setup:** Use desktop `1536 × 864` and the approved phone size `390 × 844`. Compare against the approved `desktop-2-proposed.png` and `phone-2-proposed.png`.

    **Action:** On Edit Schedule and View-only Sched, press folded → open → folded → open. Repeat View-only as Ranger. Inspect the contents and measure the fold and following content before/after opening.

    **EXPECTED:** Exactly the approved labels: **days in a row**, **qual / illegal seat**, **misses flight brief**, **misses sim brief**, **misses flight debrief**, **misses sim debrief**, **long day**. Other words, glyphs and colours stay unchanged. Each size retains **its own** approved height; desktop and phone need not have equal heights. Sources: D2075, D2078.

    **Disproof:** View-only retains old words, closed contents remain painted, labels clip or overlap, the fold becomes hard to press, or either size grows beyond its approved layout.

Where a surface has several states, use this state-by-reading table rather than applying one expectation everywhere:

| State | Warnings and crew rest | Availability / hours / OIL | Controls and coverage |
|---|---|---|---|
| Unpublished working day | Current items and today’s settings; D2073 applies | Assumed desk hour still occupies time and contributes hours; blank END earns no OIL | Admin edits; scenarios 1, 2, 4–7 |
| Published, nothing waiting | Issued content; retained settings for its checks; live safety exceptions remain | Latest issued content supplies Insights; its hours use today’s settings. OIL remains issued | Scenarios 3, 8 |
| Amendment pending | Edit Schedule shows next amendment under today’s settings; View-only retains issued content | Pending day edits do not change issued Insights content or credited OIL before publication | Scenario 3 |
| Current issued-version look | Same warning judgment as current View-only face | Read its own rows; **RECORD** published-preview availability differences after a Logic change—the older limitation is filed | Read only; scenario 3 |
| Older version made in this walk | That version’s recorded warnings; no current forward trace | Do not demand its hours replace the latest-issued Insights totals | Read only; scenarios 3, 8 |
| Saved plan merely previewed | Flag-free | **RECORD** day-details text; do not demand agreement with the parked plan | Scenario 5 |
| Saved plan switched into working day | Checked as the restored working day | END and desk identity must survive | Scenario 5 |
| Desktop | Operate warning hover/tap, Board and peek doors | Inspect count/list and Insights doors | All scenarios |
| Phone | Same applicable judgment, readable words and reachable taps; no peek | Inspect bottom windows and immediate feedback | Each distinct display; arithmetic permutations need not all repeat |
| Admin | Edit Schedule, Board, settings and publication controls | OIL decisions available | Main walk |
| Member Ranger | View-only warnings, details, Legend, Logic, ALL AVAIL and Insights | Read the available reasons and figures | No invented non-admin scheduler; scenarios 8–10 |

Orders that must appear in the evidence are: START → END → clear END; make desk before/after its matching plain twin; publish before/after typing END; switch away/back before reload; Undo/Redo before sign-out; Monday opened cold versus after Sunday; and warning hide → show → Undo on newly created data.

The pictures must prove what unit tests cannot:

- The specialised warning actually appears after placing a person through the real control, including the immediate placement note.
- A warning tap visibly highlights the right crew, with the Q chip, warning ring, SANS edge and selection state present.
- Crew-rest trace, next-day list and picker agree after each END transition.
- Current, older and working documents are visibly distinguished, including their day-details windows.
- ALL AVAIL’s count opens the correct people and reasons, and its OIL explanation remains readable.
- Both Legends match the approved wrapping and height, and hide their contents when folded.
- Logic’s words are drawn and readable through search, editing and member viewing.

On the phone, save an immediate picture after each decisive tap beside its settled picture; inspect pinned cells for leakage. Real iPhone text, keyboard movement and browser-toolbar bounce remain matters for his phone look.

The host should prove the source-derived opening routes once on the frozen production build before dispatching the walker. Use ordinary persistent browser storage for the reload cases. Do not count a planted record, an unopened picture, or an unperformed step as a successful walk.

This report excludes migration, pre-change hides and old stored warning wording. Known filed limits—the published-preview availability setting, saved-plan preview details, and existing window dismissal faults—must be recorded separately from failures of these four promises.

Rulings: none this session.  
Walk: NOT DONE — scenario design only.  
Files changed by me: none.

