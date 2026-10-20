# Single-seat check — every place the app reads the back seat (D1099)

Read-only. Read on `origin/main` at b3db0675f (21 Oct 26). Paths are under `raptor-port/src/`. Nothing in the repo was changed.
"Single-seat line" here means an aircraft row with its front seat (FCP, `.p`) filled and its back seat (RCP, `.w`) empty.

**Headline.** No check or count *breaks* on a single-seat line. Every check that reads the back seat is guarded by "is
somebody there", so an empty back seat mostly reads as silent. What a single-seat squadron would actually run into:
1. Three rules give a wrong answer for a real single-seat jet: AAR training (no instructor can sit behind the pilot), an
   instrument rating test (IRT) written in one aircraft's remarks, and the OCU solo.
2. The pairing rules go quiet when nobody is behind, so the app cannot tell "single-seat, correct" from "two-seat, back
   seat not filled yet". The data has **no per-aircraft single/two-seat marker at all**.
3. A lot of the screen is built for two seats: the "+ RCP" doors, the WSO columns and rows, and the RCP columns in the
   PDF and the export. That is clutter for an F-35 squadron, not wrong numbers.

---

## A. Checks and warnings (engine/validate.ts, engine/avail.ts, engine/events.ts)

| # | Where (main) | What it does | Back seat empty today | Class | Question for his design |
|---|---|---|---|---|---|
| 1 | validate.ts:1172–1193 | Crew pairing matrix (F-15 Table 1.5-2): OCU+CAT A–D → hard ILLEGAL_CREW; OCU+OCU → amber CREW_SOLO; D+C/C+D/D+D → amber CO_APPROVAL | Needs both seats (`p&&w`), so nothing is raised: an OCU pilot or a CAT D pilot alone reads clean | Pairing rule (goes silent) | For a single-seat jet, is the pairing judged across the **formation** instead (OCU / CAT D pilot needs an IP or a flight lead in another jet)? |
| 2 | validate.ts:1225–1243 | AAR: the remarks call for AAR and the pilot is not current. Instructor behind holding "I" → clean; instructor behind without "I" → hard AAR_INSTR; else hard AAR_QUAL | Hard **AAR_QUAL**, red Q chip + ring: "`<CS>` is not DAAR current — `<line>` remarks call for day AAR". A current pilot reads clean | Flags it (correct for a two-seat jet, but a single-seat jet can never be cleared) | In a single-seat jet, can a pilot who is not current do AAR training with an instructor in **another** jet? If not, the hard red is right and stays. |
| 3 | validate.ts:1272–1275 | IRT written in **one aircraft's** remarks needs an IR in *that aircraft* | Hard **NO_IR**, red ring + CPH chip: "IRT remarks on `<line>` with no IR examiner", unless the pilot is an IR himself | Flags it (wrong for single-seat: the examiner flies chase) | For a single-seat jet, is an IRT examined from a chase jet, so an IR **anywhere in the formation** is enough? (An IRT written as the formation's mission already works that way: validate.ts:1266–1268.) |
| 4 | validate.ts:1258–1261 | OCU_NO_IP: an OCU with no instructor (IP/IR/FI/IW) anywhere in the formation | Formation-wide, so an OCU in a single-ship gets amber **OCU_NO_IP** "OCU in `<line>` with no IP"; with an IP in another jet it is clean | Works (pairing rule, judged by formation) | Is an OCU **solo** in a single-seat jet a normal event that needs no amber, or should it stay amber? |
| 5 | validate.ts:1244–1245 | `ocus` / `hasIP` from the front seats only | Never read (dead lines) | Works (no effect) | none, tidy-up only |
| 6 | validate.ts:1201 | Ground crew in the back → amber PAX_CREW "riding the rear seat … needs approval" | Nothing happens | Works | A single-seat jet has no incentive ride. Is that fine? |
| 7 | validate.ts:1200, 1206, 1210; avail.ts:383–389 | Front-seat bars: ground crew, WSO, CAT IW in the front → hard QUAL (picker refuses the same) | Front seat only | Works | Keep for mixed F-16 squadrons that have WSOs |
| 8 | validate.ts:1016–1032, 1332, 1356–1361 | SC / AVALON / BB seats: SC currency on every seat; front seat pilots only; SPARE double-booking per seat | Reads each seat on its own | Works | none |
| 9 | validate.ts:1416–1424; events.ts:416–418 | Sim boxes (OFT/AMT): front seat bars only; back seat unruled | Front only | Works | Does an F-35 sim have one seat? (see the layout section B) |
| 10 | validate.ts:275–281 | FLT_NO_LEN (take-off = land) only when somebody is on the line | Either seat counts | Works | none |
| 11 | events.ts:364–411 | Builds each person's sortie events per seat (`fcps`, `acs`, `allCrew`) | One event for the pilot, none for the empty seat | Works | none |
| 12 | Every per-person check: CREW_REST, CREW_TIGHT, TURN, DOUBLE_BOOK, NO_BRIEF, DEBRIEF, SC_QUAL, LONGDAY, DAYS_RUN, SANS_AVAIL | Per person | Unaffected | Works | none |
| 13 | validate.ts:2052–2072 (`restIfPlaced`) | The crew picker's crew-rest warning *before* a drop copies the times from another man already on the formation | A single-ship single-seat line has no other man, so the picker shows no crew-rest warning before the drop. The warning still appears after the drop. On a two-seat single-ship, the second man does get the early warning | Works (gap) | none for him: a technical fix (use the line's own times) |
| 14 | avail.ts:232, 464 | Picker: a pilot who is not AAR-current is refused from an AAR line's front seat ("not DAAR current"), whoever sits behind | Same for single-seat | Works | Fits whichever answer he gives to #2 |
| 15 | avail.ts:363–368; slots.ts sentinel bar | ALL AVAIL / ALL refused on a jet seat | Unaffected | Works | none |
| 16 | avail.ts:49–60, 120–136 (dayEngaged, availByWave, personCount) | Who is busy or free, per seat | Unaffected | Works | none |
| 17 | highlights.ts:290–310 | Jumping to a warning: a pair warning lands on the row that holds both men | With one man, it lands on him | Works | none |
| 18 | slots.ts:38–40; drag.ts:259–262 | A flying line holds two seats only. A palette drop below them shows the message "A jet line carries two — FCP and RCP" | The words assume two seats | Two-seat assumption (words) | Word it per aircraft type |

## B. Counts and figures

| # | Where | What it counts | Single-seat today | Class | Question |
|---|---|---|---|---|---|
| 19 | engine/insights.ts:46–57 | Sorties = one per aircraft row; each person seated +1 | One sortie, the pilot +1. Correct | Works | none |
| 20 | engine/oil.ts:341, 493 (and oilmode, board OIL) | OIL earned per person seated | Pilot earns; the empty seat earns nothing | Works | none |
| 21 | leavewar/engine/availability.ts:342–345 | "Crew sets" = the lower of pilots and WSOs | 0 for an all-pilot squadron. **No row shows it today**: the manning block has no default counters (D669) | Two-seat assumption (dormant) | none now; drop it or hide it by aircraft type |
| 22 | leavewar/engine/availability.ts:65–85 | SC teams = 2 pilots + 2 WSOs + 1 SXO + 1 more | 0 for an all-pilot squadron. Reached only through a counter a squadron builds | Two-seat assumption (dormant) | What makes up an SC team for F-35 (4 pilots + SXO?) |
| 23 | leavewar/ui/CounterForm.tsx:129, 223–230 | Counter form: the "WSOs" seat chip; a new team starts as 1 pilot + 1 WSO | Offers a WSO slot to a squadron that has no WSOs | Two-seat assumption | Hide by aircraft type |
| 24 | leavewar/ui/FlyRows.tsx:63–75; engine/availrows.ts:35–39 | Required W and Available W rows at the foot of the manning block (fixed, cannot be hidden) | Required W shows "–", Available W shows 0. Not red unless a figure is typed. Two dead rows | Two-seat assumption | Hide the W rows when there is no back seat? |
| 25 | leavewar/engine/people.ts:140–172; state/raptorRoster.ts:62 | Groups SXO / IP / OPS P / **IWSO** / **OPS W** / OCU / Personnel; any seat that is not pilot and not ground counts as WSO | Groups with no members (needs a walk: does an empty group draw a heading?) | Two-seat assumption (layout) | none |
| 26 | state/flyplan-model.ts:154–182; state/flyplan.ts:203–226 | Required, SANS committed and still needed, per seat; the day's colour = pilots + WSOs still needed | W is null or 0, so the colour is driven by pilots alone. Correct (D622 kept two figures for this) | Works | none |
| 27 | ui/sanscal-model.ts:37–65, 155–161; SansCal.tsx:61–65, 280–331; SansDay.tsx:49, 120–143; SansSettings.tsx:99 | SANS calendar pair "pilots · WSOs" on every date; legend; day sheet table Pilots/WSOs and a "WSOs · n to fly" group | The WSO half reads "–" or 0 on every date | Two-seat assumption (layout) | Show a single figure when there is no back seat? |
| 28 | ui/InputsCal.tsx:1176–1186; ui/PeoplePick.tsx:37–38 | Picker groups Pilots / WSOs / SANS·Pilots / SANS·WSOs. In InputsCal, any SANS seat other than FCP goes under WSOs | WSO groups empty | Two-seat assumption (layout) | none |

## C. Drawing and words (all are two-seat assumptions in layout or words; none count wrong)

| # | Where | What is drawn | With the back seat empty |
|---|---|---|---|
| 29 | ui/html.ts:2001, 575 | Week (View/Edit Schedule): every aircraft row draws FCP and RCP | Edit shows "+ RCP" on every line; read-only shows a blank space |
| 30 | ui/html.ts:1871–1872; ui/peek.ts:70–71, 156–157 | Column heading "FCP / RCP" (week, peek) | The heading names a seat the jet does not have |
| 31 | ui/scheduler/09-week-responsive.css:156–175, 286; 03-week.css:516 | Phone/desktop week column sized for **two** pucks (2×74 + gap = 159px) | Half the column empty; more room needed for the other columns |
| 32 | ui/board.ts:330; ui/board-html.ts:876–904; 10-board-history.css:274–278; 13-board-rows-responsive.css:733–751, 921 | Scheduler Board seat pair, desktop grid columns FCP / RCP | Edit "+ RCP" door; **published board prints "— RCP empty —"** on every line |
| 33 | ui/board-html.ts:476–560 | Sim boxes (OFT/AMT) on a fixed two-column grid, pads to even counts | An F-35 sim gets an "RCP" door it does not have |
| 34 | ui/palette-html.ts:185–187 | Crew palette columns "Pilots \| WSOs" | WSOs column empty |
| 35 | ui/AvailWindow.tsx:71–79, 135–136, 228 | ALL AVAIL / OIL window: pilots left, WSOs right | Right column empty |
| 36 | ui/html.ts:407, 414; html.ts:465, peek.ts:60 | Legend "FCP (pilot) · RCP (WSO)" and IW (IWSO) chip; green colour for a WSO's puck | Legend names a seat and a CAT that do not exist |
| 37 | ui/printpdf.ts:19, 42, 54 | Printed PDF columns FCP and RCP | RCP column blank on every row |
| 38 | ui/export.ts:70–78 | Export columns FCP, FCP lvl, RCP, RCP lvl | Two blank columns |
| 39 | ui/QualsPage.tsx:191, 235, 307, 809–810; state/roster-add.ts:36–48; ui/AccessScreen.tsx:109; ui/UsersPanel.tsx:108, 231 | Seat choice "Pilot / WSO / Personnel" (sign-up, Admin → Users, Quals); Quals views Pilots / WSOs / Personnel / All; CAT list per seat (IW for WSOs); AAR "I" = cleared to teach AAR **from the back seat** | WSO option and WSOs view are offered to a squadron with no WSOs; the AAR "I" has no meaning for a single-seat jet |
| 40 | leavewar/ui/SettingsSheet.tsx:251–252; seat-colour bar in matrix.css | "pilots above WSOs" ordering words, the WSO green colour bar | Words only |
| 41 | ui/logic-html.ts:148–151 | Logic page explains QUAL / ILLEGAL_CREW / CREW_SOLO / CO_APPROVAL in WSO terms | Explains rules that never fire |
| 42 | ui/changesmodel.ts:122; ui/pendlist.ts:59; engine/editlog.ts:393; state/view.ts:1343; undo/describe.ts:355 | Change history and undo words "· RCP" or "required pilots and WSOs" | Shown only when an RCP is touched. Works |
| 43 | tracker/app/core.js:1212, 5260; tracker/peoplewire.ts:32 | Tracker labels a person "Pilot" or "WSO" and sorts pilots first | Label only. Works |
| 44 | engine/daytpl.ts:121–132; restore.ts:88, 115 | Templates and restore clear or restore both seats | Works |

---

## (1) What an admin "no back seat" setting (aircraft type, D1099/D1100) would switch off or reshape

- **Week (View/Edit Schedule):** draw one seat per aircraft row; no "+ RCP"; narrow the seat column (desktop and phone CSS);
  heading "FCP / RCP" → "Pilot" (html.ts, peek.ts, 03/09 week CSS).
- **Scheduler Board:** one seat per line; no "— RCP empty —" on the published board; grid columns re-laid on desktop and phone
  (board.ts, board-html.ts, 10/13 board CSS).
- **Sims (OFT/AMT):** one seat per pair, or keep two? It depends on the sim (his answer, Q7).
- **Crew palette:** a single Pilots column; the "A jet line carries two" message reworded.
- **ALL AVAIL / OIL window:** one column.
- **Legend:** no RCP (WSO) colour, no IW chip.
- **Quals:** no WSOs view; seat choice Pilot / Personnel only; no IW CAT; AAR "I" (back-seat instructor) hidden or given a
  new meaning; the same in sign-up and Admin → Users.
- **Leave War:** no IWSO / OPS W groups; no Required W / Available W rows; the counter form has no WSOs chip and its
  default team has no WSO slot; the "pilots above WSOs" words.
- **SANS calendar and Inputs:** one figure (pilots) per date instead of the pair; no WSOs column in the day sheet; no WSO
  groups in the pickers; the colour setting's "pilots and WSOs added together" wording.
- **PDF and export:** no RCP column (or an option to keep it for the agency's sake).
- **Logic page:** hide the pairing rules (ILLEGAL_CREW, CREW_SOLO, CO_APPROVAL, PAX_CREW) and show whatever replaces them.
- **Rules:** switch the pairing matrix and PAX_CREW off; change AAR training, per-aircraft IRT and OCU solo to the new rules (questions below).
- **Insights, OIL, the Tracker, the change history:** nothing to change.
- **For a mixed F-16 squadron** a squadron-wide switch is not enough: each aircraft row needs a "single-seat" marker
  (today there is none: engine/schema.ts AircraftSeat has only `p` and `w`).

## (2) Design questions for him (plain words, each with a recommendation)

1. **How does the app know a jet is single-seat?** For a mixed F-16 squadron the app must tell a single-seat jet from a
   two-seat jet whose back seat is simply not filled yet. *Recommended:* a mark on each flying line ("single-seat"), defaulted by
   the aircraft-type setting: F-35 always single-seat, F-15 always two-seat, F-16 chosen per line. *Example:* Viper 1 is an
   F-16C (single-seat) and Viper 2 an F-16D (two-seat): Viper 1 shows one seat, Viper 2 shows an empty back seat with a "+".
2. **May an OCU pilot fly a single-seat jet with no instructor in the formation?** *Recommended:* keep today's amber "OCU
   with no IP" when no instructor is anywhere in the formation; clean when an IP flies another jet of it. *Example:* Tally
   (OCU) flies a 1-ship single-seat sortie, so the amber shows. If Tally flies with an IP leading a 2-ship, it reads clean.
3. **Does a single-seat pilot's CAT need a check across the formation** (in place of the two-seat pairing table)? *Recommended:*
   no new rule until he names one; the pairing table simply does not apply. *Example:* two CAT D pilots in a 2-ship F-35:
   today nothing shows. Should it say "CO approval required" as a two-seat CAT D pair does?
4. **AAR training in a single-seat jet:** may a pilot who is not AAR-current do it with an instructor in another jet?
   *Recommended:* no, keep the hard red "not DAAR current". The "cleared to instruct" mark becomes meaningless for
   single-seat. *Example:* Hex is not DAAR-current on an AAR line in an F-35, so it shows red whatever the formation.
5. **An instrument rating test in a single-seat jet:** is the examiner in a chase jet? *Recommended:* yes, an IR anywhere in
   the formation is enough. Today "IRT" written in one jet's remarks shows red unless that pilot is an IR himself. *Example:*
   "IRT" in Viper 2's remarks, with the IR flying Viper 1: today it shows red; after the change it would read clean.
6. **The F-35 switch: what disappears?** *Recommended:* everything in (1) above: WSO columns, rows, groups, the RCP colour,
   the PDF column, the "Pilot/WSO" choice. The checks and counts stay. *Example:* the SANS calendar shows one number per date
   ("3 pilots still needed") instead of "3 · 0".
7. **Sims for a single-seat type:** one seat or two? *Recommended:* one seat (the pilot), observers and instructors on the
   extra line below as today. *Example:* an F-35 sim box shows Hex alone, with "+ observer" beneath.
8. **Ground crew incentive rides:** with no back seat, there is no flying ride. Is that fine? *Recommended:* yes; on a mixed F-16
   squadron they can still ride a two-seat line. *Example:* Widget (ground crew) can only be placed in the back of an F-16D.

## (3) Scenarios for a walker (Sonnet), on today's main build

1. **Front seat only, ordinary sortie.** Edit Schedule, Monday: put a current CAT B pilot in the front seat of a line and
   leave the back seat empty. Look at the week, the warning list, the Scheduler Board (edit and published), Insights' sortie
   count and his OIL. Expect: no warning; "+ RCP" in edit; "— RCP empty —" on the published board; one sortie counted.
2. **AAR with nobody behind.** Same line, type "AAR" in its remarks, front seat a pilot whose DAAR tick is off (Quals). Expect
   a red Q chip and the hard warning "… is not DAAR current — … remarks call for day AAR". Then seat an IP holding the "I"
   in the back and confirm it clears. Picture both states.
3. **OCU alone.** Put an OCU pilot alone in a 1-ship line (back seat empty, no instructor in the formation). Expect amber
   "OCU in … with no IP" and no pairing warning. Then add a 2nd jet with an IP in its front seat: the amber should go.
4. **IRT per aircraft.** Type "IRT" in one aircraft's remarks with a non-IR pilot alone, and an IR in the front seat of the
   formation's other jet. Expect red "IRT remarks on … with no IR examiner" (the case to put to him as Q5).
5. **PDF and export.** Publish a day with only front seats filled; open the printed PDF and the export. Expect empty RCP
   columns. Picture both.
6. **Leave War and SANS calendar with WSOs.** Open the Leave War manning block and the SANS calendar. Picture the Required
   W / Available W rows, the IWSO / OPS W groups, the SANS pair "pilots · WSOs" and the day sheet's WSOs column, for
   the F-35 layout question. If a squadron with no WSOs can be set up (archive every WSO on a test copy), check whether
   an empty group still draws its heading.

Not a finding (D56): nothing here depends on stored demo data.

*The pictures named below are in `raptor-port/docs/img/handpass/2026-10-21-single-seat/` (the walker's scripts in its `scripts/`).*

*The pictures named below are in `raptor-port/docs/img/handpass/2026-10-21-single-seat/` (the walker's scripts in its `scripts/`).*

## The walk (one Sonnet 5.5 walker, 21 Oct 26 ~03:20; build of main + the tag change, served on 4293; every picture with the area talked about in a red box)

All six scenarios matched the code reading. Errors: none.

| # | Result | What the screen showed | Pictures |
|---|---|---|---|
| 1 Front seat only | PASS | Saint (CAT B, current) alone in the front seat of line VL (Fri 17 Jul, a new flying wave): "No conflicts flagged for Friday"; Edit Schedule's week and the board show a dashed "+ RCP" door beside him; View-only Sched shows the pilot with the back seat blank; the same on a phone | s1-*, phone-s1-* |
| 2 AAR, nobody behind | PASS | his DAAR tick off on Quals, "AAR" in the remarks: red "Saint is not DAAR current — VL BFM remarks call for day AAR", red Q chip and ring | s2-* |
| 3 OCU alone | PASS | Recon (OCU) alone on 1-ship RU, no IP in the formation: amber "Recon — OCU in RU BFM with no IP"; no pairing warning | s3-ocu-alone |
| 4 IRT in one jet's remarks | PASS | "IRT" in aircraft 1's remarks (Torch, CAT C), Reaper (IR) in aircraft 2's front seat of the same formation: red "Torch — IRT remarks on TX BFM with no IR examiner" even so | s4-* |
| 5 Print and export | PASS (notes) | published (ORIG) with the warnings standing — nothing stopped it; the published board prints "— RCP empty —" on every line; the print page's RCP column blank; the export's RCP and RCP lvl columns blank. The print page was captured from its hidden frame and drawn in print mode — no print dialog pictured | s5-* |
| 6 Leave War and SANS calendar | PASS (pictures) | with WSOs: Required W "–", Available W 18; SANS dates show "pilots · WSOs"; the day sheet has a WSOs column. With every WSO archived (Admin → Users) and a reload: Required W and Available W rows stay (Available W 0 from the archive date), the IWSO and OPS W headings disappear (an empty group draws none), the SANS WSOs column stays at 0, the pair still shown; on a phone the legend reads "Still needed:" | desk-wso-*, desk-nowso-*, phone-wso-*, phone-nowso-* |

**Odd (filed):** right after archiving every WSO, in the same session, the Leave War's groups still read IWSO 5, OPS W 12 until a reload — the grid did not refresh its groups after an archive. Not chased tonight.
