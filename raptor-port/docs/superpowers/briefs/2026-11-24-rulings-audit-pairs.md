# The rulings audit — step B: where two or more surfaces answer one question about a person

Written 24 Nov 26 by a fresh Fable helper, for `../plans/2026-11-24-rulings-audit-plan.md` §2 step B (lesson 32 of
`docs/bug-check-order.md` §7.11). Reading only — nothing in the app, a drawing or a rule was changed.

## How to read this

- **One block a question.** Each names the surfaces that answer it, the rule each applies (file and function, read from
  the code on this working copy), whether they agree, the rulings that govern it, and the slice that owns it.
- **The verdict words.** **AGREE** — one body, or two bodies read side by side and found the same. **DIFFER, RULED** —
  they differ and a ruling names the difference. **DIFFER** — they differ and no ruling found names it: a finding for the
  slice to classify (the plan's §3 step 6), never a fault called here. **NOT SETTLED** — read part of the way; what is
  left is named for the slice.
- **What was read.** The code named in each row was opened and read in this pass unless the row says "(not opened)".
  Ruling numbers come from the area pages' lines; the full rows opened in this pass are marked †. A slice opens every row
  it leans on (`grep -h '^| D149 |' .claude/decisions-full/*.md`).
- **Which copy of the app.** This working copy (branch `claude/readings-lapse-fix-fdbb3c`) carries the SANS job's source
  as it stood before its round 5: `src/leavewar/sansunfiled.ts` and the rest of that job are **not on `main`** (84 source
  files differ from `main`, nearly all additions). D2564's build is commit `1d2ed3415` on
  `claude/allavail-sans-postout-141`. Questions 14–17 are marked where this matters.
- **Left out, as the plan's §5 says:** a problem only in data already stored (D56); anything of the shape "a scheduler who
  is not an admin" (D785). A difference inside `src/engine` is listed like any other.
- **Order:** the core first — OIL, the published record, who may do what, SANS and inputs, the bell — then the schedule's
  day, the Leave War, and what crosses areas.

## The differences, in one place

| # | Question | The difference, in one sentence | Verdict |
|---|---|---|---|
| 3 | Is this a day off for this input's OIL | The OIL question asks "off for any squadron the input sits in"; the credit asks "off for the squadron whose schedule is in view" | NOT SETTLED — slice 1 follows it to the credit |
| 7 | How many changes wait on this day | One place reads the raw marks where every other reads the worked-out difference | NOT SETTLED — slice 2 |
| 10 | Who may edit the schedule | ~100 call sites ask the role only; the newer question also asks his level in the squadron picked — same answer until the squadron picker goes live | AGREE today, DIFFER once the picker is live |
| 13 | Who is "a scheduler" | Sign-off lists go by the Scheduler tick; editing and the bell's "schedulers" go by the admin role | DIFFER |
| 14 | Is a SANS man planned that day | The reminder counts any row; D2564 says flying seats and sims only (built on the SANS branch, not here, not on `main`) | DIFFER, RULED — fix built, not merged |
| 14 | — the same, which copy | The reminder reads the working copy; the man's own schedule shows the published version of a published day | DIFFER |
| 15 | Is a SANS man with nothing filed flagged | The crew list strikes him and an armed seat says why; the warning list says nothing | DIFFER |
| 16 | Is he SANS on this day | The schedule's readers go by the date; the Leave War's rows and counts, and the Inputs calendar's people groups, go by today's tick | DIFFER (the highlight chip's use of today is ruled) |
| 20 | Is he busy at that time | A man only standing by (SC SPARE, AVALON, BB) is free to the crew list, the seat check and the warning list, busy to the ALL AVAIL crowd | DIFFER |
| 21 | Is he tasked that day | Three sets: the crew list leaves standby rows out, the day's figures keep them, the ALL AVAIL crowd leaves out commitments under Unavailable | DIFFER, RULED in part |
| 25 | Is he away that day, and how many are available | The Leave War counts a waiting leave bid and half days; the schedule's day figures count whole-day inputs only | DIFFER — on purpose by the code's notes; the ruling for the waiting bid not found in this pass |
| 18 | Is this input late | The Inputs page always prints LATE; the schedule's printers obey a scheduler's drop | DIFFER, RULED |

---

# Core — OIL (slice 1, `oil`)

## 1. Does this man earn OIL from this event on this day, and how much

| Surface | The rule it applies | Where |
|---|---|---|
| OIL Earn on the board — the green bar, the figure on each puck | the earned spans of the working copy's day, by the day's evidence block | `ui/oilmode.ts` `oilDaySpans` → `engine/oilev.ts` `oilEarnedWork`; amount `oilAmount` |
| The credit written at publication | the same body, on the issued day | `leavewar/sync.ts` (the two callers of `oilEarnedWork`, about lines 2344 and 2657); amount `oilAmount` |
| The warning list — "earns nobody any OIL", "nobody earns until the day is published" | the same body | `engine/validate.ts` (the `earnsOil` block) → `oilWouldEarn`, `dayOilBlind` |
| The pending mark for OIL on a published day | the evidence key compared with the issued one | `engine/oilev.ts` `oilEvidenceKey`, `oilSignKey` (not opened beyond their heads) |
| The ALL AVAIL count chip | the crowd the evidence block froze | `engine/oilev.ts` `oilEvidenceNow` → `leavewar/sync.ts` `availableFor` |

**AGREE** — one body (`oilEarnedWork` over `dayOilWork`) for the mode, the credit and the warning. `engine/oil.ts`
`dayOilCredits` works an amount without the day's kept settings and has no caller outside tests.
**Rulings:** D1, D2, D15, D24, D28, D31, D43, D48, D49, D142, D592, D755, D776, D1042–D1046, D1060–D1066.

## 2. Is this day one that can earn OIL

| Surface | The rule | Where |
|---|---|---|
| OIL Earn offered on a day; the evidence block's "earns" | a weekend, or a public holiday in the war of the squadron whose schedule is in view | `HOOKS.oilEarningDay` set in `leavewar/sync.ts` → `nonWorkingFor(UNIT, iso)` → `leavewar/engine/eventdefs.ts` `isNonWorkingDay` |
| The warning list's OIL lines | the day's own name is Saturday or Sunday, or the same hook | `engine/validate.ts` (`earnsOil`) |
| Leave charging — a leave day that costs nothing | the same `isNonWorkingDay` | `leavewar/engine/charge.ts` `nonWorking` |
| The OIL tracker's reason words ("weekend duty" / "PH duty") | weekend by date, else a holiday | `leavewar/engine/oiltracker.ts` `oilLedgerFor` |
| A new holiday's "already published as working days" list | published days that are working days now | `leavewar/sync.ts` `holidayOutOfDate` |

**AGREE** — one body; an Off day earns nothing in every reader (D21).
**Rulings:** D2, D19, D21, D79, D2184, D2193, D2195, D2207.

## 3. Is this a day off for an input's OIL question — and whose holiday list decides

| Surface | The rule | Where |
|---|---|---|
| The OIL question at filing, the one list, the bell's pending scan | a weekend; else a day off for **any** squadron the input sits in that day | `leavewar/sync.ts` `oilAskPlan` → `inputDayOff` |
| The credit when the day is published | the day is off for the squadron whose schedule is in view | `engine/oilev.ts` `oilEvidenceNow` (`HOOKS.oilEarningDay`) |

**NOT SETTLED.** The two tests are not the same test. Where an input names men of two squadrons and only one lists the
holiday, the question is asked of the input; what each man is then credited was not followed to the end. D2206† says a
man's holiday OIL follows his own squadron's list. Slice 1 to follow one such input from the ask to each man's credit.
**Rulings:** D2195, D2206†, D2262, D804, D1578.

## 4. How much OIL does he hold — earned, awarded, the balance

| Surface | Where |
|---|---|
| The OIL tracker's list and balance | `leavewar/engine/oiltracker.ts` `oilLedgerFor`, `oilBalanceOf` |
| The Balances page, the person window, a bid's "below zero" | `leavewar/engine/counters.ts` `oilLedgerOf`, `figureParts`, `balanceOf` (not opened); `leavewar/ui/belowzero.ts` (not opened) |
| An award's box on the war grid | `leavewar/ui` (not opened) |

**NOT SETTLED** — `feature-impact.md` §One balance engine says every reader takes one figure; the bodies were not read
side by side here. Slice 1 (the tracker) with slice 7 (the Balances page).
**Rulings:** D82, D400, D402, D261, D1008, D1209, D1479, D1480, D1482–D1492.

## 5. What an input's yes is worth — half a day or a full day

| Surface | The rule | Where |
|---|---|---|
| The OIL question's FO / HO | the input's own hours (all day = FO, else its length against "Full day of OIL") | `leavewar/sync.ts` `oilAskPlan` → `engine/oil.ts` `inputOilAmt` |
| The box finally posted | the day's whole span, so published work the same day can raise it | `engine/oilev.ts` `oilAmount` over `oilEarnedWork` |

**DIFFER, on purpose by the code's own note** ("the CELL finally posted may still upgrade"). No ruling was opened that
says what the man is shown when the two differ. Slice 1.
**Rulings:** D82, D592, D782, D783.

---

# Core — the published record (slice 2, `published`)

## 6. Which copy of a day does each reader take — the working copy or the latest published version

| Surface | The copy | Where |
|---|---|---|
| View-only Sched, the issued face | the latest published version; the working copy for a day never published | `engine/validate.ts` `issuedWorld`, `withDaySnap` |
| Insights — days, hours, warnings, who is not flying | the same world, with the roster each day went out with | `engine/insights.ts` `computeInsights` → `issuedWorld`, `issuedRoster` |
| OIL credit | the latest published version only | question 1 |
| The crew list, Edit Schedule, the board's edit side | the working copy | `ui/palette-html.ts` (its note: "never drawn inside a published face") |
| The ALL AVAIL crowd | the day handed in — frozen at publication, live on the working copy | `leavewar/sync.ts` `availableFor(iso, win, day)` |
| The SANS reminder | the working copy of every week held | `leavewar/sansunfiled.ts` `weeksHeld` (question 14) |
| The Leave War's counts | inputs and bids as they stand, never the schedule's version | `leavewar/engine/availability.ts` |

**AGREE** for View-only Sched, Insights and OIL (one world). The SANS reminder is the odd one — see question 14.
**Rulings:** D142, D477, D478, D482, D178, D189, D1784.

## 7. Has this day changes waiting, and how many

| Surface | The rule | Where |
|---|---|---|
| The day head, the day panel, the plan-switch message | on a published day the worked-out difference from the issued version; on a draft the raw marks | `engine/publish.ts` `dayShownPendCount` |
| "Not yet signed", the Publish button, the amendment panel | the worked-out difference | `notYetSigned`, `dayHasChanges`, `pendingPublishDays` → `dayDelta` |
| "Load onto working copy" — how many edits it discards | its own count | `dayDiscardCount` |
| The same bar's `pend` | the raw marks | `ui/html.ts` about line 1802 (`dayPendCount`) |
| The amendment panel's "draft changes" test | the raw marks, unpublished days only | `ui/ALPanel.tsx` (`pendDays`) |

**NOT SETTLED** — every count a person reads goes through `dayShownPendCount` except the one raw read in `ui/html.ts`;
what that value draws was not followed. Slice 2.
**Rulings:** D109, D178, D424's line on the scheduler page (every input change after publication is pending), D1621.

## 8. Is this day signed, and who may be picked for each box

| Surface | The rule | Where |
|---|---|---|
| The four boxes' lists | the Scheduler tick, counted in that squadron on that day, for the boxes that need it | `engine/publish.ts` `signPeople`, `signRoleOk`, `tickAt` → `state/units-model.ts` `schedTickHolds` |
| "Signed" for publishing | no box missing | `daySigned`, `signMissing`, `canPublishAL` |
| The OIL list opening at the first press | the day's open OIL questions | `ui/oilsign.ts` `signPick`, `signAsks` |

**AGREE** as read (one body each). **Rulings:** D212, D1651, D2160, D2184, D2195, D2294, D2297, D2299.

## 9. Which Logic settings judge this day

Stated once by the scheduler page (D2005, D2013, D2024, D48, D592, D482): a published day keeps the settings it went out
with; its working copy, once anything waits, is judged by today's; Insights' hours by today's; OIL by its own three kept
values. Readers: `engine/validate.ts` (`withLiveRules`), `engine/publish.ts` `faceRuleVals`, `engine/oilev.ts`
`oilKeptVals`, `engine/insights.ts`. **NOT SETTLED** — not read side by side; slice 2, with slice 1 for the OIL half.

---

# Core — who may do what (slice 3, `permissions`)

## 10. Who may edit the schedule

| Surface | The rule | Where |
|---|---|---|
| Edit mode, the board, the week's writes — about 100 call sites in `ui/interactions.ts`, `ui/board.ts`, `ui/html.ts`, `state/plan.ts` and others | the role in force is admin | `state/auth.ts` `canEditSched` → `state/perms.ts` `mayEditSched` |
| The newer question | the same, and his level in the squadron picked that day is admin | `state/perms.ts` `maySchedEditPage`, `adminOfPage` |
| The command gate | the role and the rows the command changed | `state/perms.ts` `cmdAuthorize`, `ownershipViolation`, and its squadron checks |

**AGREE today** — the code's note says the squadron pick has one caller, sign-in, so both answer the same. They part the
day the squadron picker goes live: a View holder who picks another squadron is an admin to `mayEditSched` and not to
`adminOfPage`. Slice 3 to confirm the gate refuses what the first would draw.
**Rulings:** D200, D292, D785, D2191, D2197, D2201, D2242.

## 11. Who may file, change or delete an input

| Surface | The rule | Where |
|---|---|---|
| The input's window, card and row controls | an admin; the input's only named person; its filer, for a duty-and-commitments kind, while the members' switch is on and everyone in it was put in by him | `state/perms.ts` `mayFileInputFor`, `mayFileGroup`, `mayEditInput`, `mayDeleteInput`, `filedForOther` |
| What a member's command really changed | the same rule asked of every changed record | `state/perms.ts` `ownershipViolation`, `inputWhoProblem` |
| Where it stands (Goes to) once a scheduler moved it | a scheduler only | `mayMovePlace` → `engine/inputs.ts` `placeHeld` |
| The Leave War's leave filed as an input | the war's own gate | `leavewar/inputgate.ts` (not opened) |
| The refusal's words | chosen after the refusal | `filerSwitchedOff` |

**AGREE** as read for the first three (the doors and the gate ask one rule). **NOT SETTLED** for the war's gate against
the same rule. **Rulings:** D149, D654, D655, D658, D660, D731, D755, D762, D763, D1388, D2340 (who may be filed for SANS).

## 12. Who may write on the Leave War — a bid, a decision, an award

| Surface | The rule | Where |
|---|---|---|
| The grid's controls and the store's writes | a member his own row, on an open day from today; an admin any row, any day; only an admin decides | `leavewar/engine/access.ts` `canEditCell`, `canEditRow`, `canDecide` |
| What the schedule's side asks of it | the permissions table | `state/perms.ts` `mayDecideBids`, `mayAwardOil` |
| The command gate | closed days, the man's day, the squadron | `state/perms.ts` `lwClosedKeys` and the war's probes |

**NOT SETTLED** — two modules answer (the war's own, and `perms.ts`); a parity test is named in the code but the two were
not read side by side. Slice 3. **Rulings:** D1177, D1211, D1225, D418, D333, D352, D1223, D261, D1209.

## 13. Who is "a scheduler"

| Surface | The rule | Where |
|---|---|---|
| The sign-off lists (SKED CK, PLANNED BY, APPROVED BY) | the Scheduler tick on Quals, counted by squadron and day | `engine/people.ts` `isScheduler`; `engine/publish.ts` `tickAt` |
| Who may edit the schedule | the admin role | question 10 |
| The bell's lines "to the schedulers" (a holiday's OIL questions, a posting) | the admins of that squadron that day | `state/accounts.ts` `adminsOf` (question 26) |

**DIFFER** — an admin with no Scheduler tick edits the schedule and gets the schedulers' bell lines but cannot be picked
for the three boxes. D785 settles the other way round (a scheduler is always an admin); no ruling found says whether
"the schedulers" in a bell line means the tick or the role.
**Rulings:** D785, D1651, D2160, D2194, D2198, D2202.

## 13a. Who may read a man's medical detail

`state/perms.ts` `mayReadMedicalOf` (every admin and member) is asked once, by the schedule's rows (`ui/html.ts`
`hideMed`); the Medical page, the change history (D169, D211) and the Leave War's grid, which shows a medical code to
every member, were not opened. Every signed-in person reads it today, so the readers cannot disagree in effect.
**AGREE in effect; NOT SETTLED** as a list of readers — slice 3. **Rulings:** D211, D169, D2239.

---

# Core — SANS and inputs (slice 5, `inputs-sans`)

## 14. Is a SANS man "planned" on this day — lesson 32's own question

| Surface | What "planned" covers | Where |
|---|---|---|
| The SANS reminder in his bell — **this working copy and `claude/allavail-sans-postout-141` before round 5; not on `main`** | named on any row of the day: a flying seat, a sim, a duty desk, a ground row, all hands; never an SC SPARE row or an ⓘ row; AVALON and BB standby rows count | `leavewar/sansunfiled.ts` `unfiledNow` → `engine/avail.ts` `dayEngaged(d)` |
| The same, after D2564's build (commit `1d2ed3415`, not merged) | a flying seat or a sim only | the SANS branch — to be read there by slice 5 |
| The ALL AVAIL crowd — a SANS man is in only when planned with us | any row, as the first line | `leavewar/sync.ts` `availableFor` → `dayEngaged(day)` |
| The crew list, no seat picked | not asked: every SANS man with nothing filed that day is struck, planned or not | `ui/palette-html.ts` `whyOf` |
| An armed seat | a flying seat or a sim with times, never a spare seat | `engine/avail.ts` `slotBarNow` → `sansGate` |
| The warning list | flying seats and sims | `engine/validate.ts` (`sansChecks`) |
| The "you're on the schedule" line for anything else (D2566) | a ground row, a duty desk, all hands | not built |

**DIFFER, RULED** for the reminder against D2564† — the fix is built on the SANS branch. The ALL AVAIL crowd's wider
"planned" is his own (D2329†: "if hes planned like briefing, hes going to be counted in the all avail").
**DIFFER, not ruled — which copy:** the reminder reads the **working copy** of each week held, so on a published day
with changes waiting it can name a day his own View-only Sched does not yet show him on, and drop a day it still shows.
D2338's row† calls "the schedule as it stands" the build's reading; D2566 ("as soon as he is planned") leans the same
way but rules another line.
**Also for the slice:** D2564's own words say the reminder now counts "the same the crew list greys and the warning
reads" — the crew list strikes on nothing filed alone, and the warning list never speaks for nothing filed (question 15).
**Rulings:** D2338†, D2340†, D2390†, D2394†, D2560†, D2564†, D2565†, D2566†, D2329†, D2420.

## 15. Is a SANS man with nothing filed, put in a flying seat or a sim, flagged

| Surface | The rule | Where |
|---|---|---|
| The crew list | struck | `ui/palette-html.ts` `whyOf`, `rosterPuck` |
| An armed seat, the drag's reason, the toast | refused with the reason | `engine/avail.ts` `slotBarNow` (`sansNoneWhy`) |
| The warning list | **nothing** — only "not offering Fly/OFT/AMT today" and "available hh:mm–hh:mm only" raise | `engine/validate.ts` (`g.status!=='not-offered'&&g.status!=='window'` returns) |
| His own bell | the reminder (question 14) | `leavewar/sansunfiled.ts` |

**DIFFER.** The validator's note gives the builder's reasons (14 Aug 26): his example only described planting against a
filed record, and a warning would have lit every SANS flyer of the demo week. No ruling found for the silence; D605†
flags a man on leave the moment he is seated. A reading for slice 5 to place (the plan's §3 step 5).
**Rulings:** D605†, D2420, D2564†.

## 16. Is he SANS on this day

| Surface | The rule | Where |
|---|---|---|
| The crew list's SANS Avail section, the seat check, the warning list, the ALL AVAIL crowd, the reminder, whether a filed availability shows | SANS by the date — the tick's dates kept on the person, a posting saved ahead | `engine/people.ts` `sansOn`, `sansOnP`, `sansAheadFrom`; `engine/inputs.ts` `sansShownOn` |
| A puck's purple line on a drawn day | by the day drawn | `engine/faceattrs.ts` (`withDrawDay`), `ui/html.ts` |
| The SANS highlight chip | today's tick | `state/view.ts` (`f==='SANS'`) — **ruled**, D2327† |
| Who may be filed for SANS availability | the day filed | `engine/people.ts` `sansFiler` — **ruled**, D2340† |
| The Leave War — who has a row, and who the Available P / W rows count | today's tick, for every date | `leavewar/state/raptorRoster.ts` (`p.san && !includeSans`); `leavewar/engine/availrows.ts` `withoutSans` |
| The Inputs calendar's people groups (Pilots, WSOs, SANS) | today's tick | `ui/InputsCal.tsx` about line 1248 |

**DIFFER.** D2313† rules "only from the date his SANS starts, on every screen"; its row leaves the Leave War's row on
today's tick as the agent's reading, and D2327† confirms the highlight chip and who may be filed — it does not name the
Leave War's counts or the Inputs calendar. So a man SANS from a date is counted out of the war's Available rows on days
before it once the tick is on, and counted in on days after it until the posting runs (his posting window aside).
**Rulings:** D2313†, D2327†, D2328, D2329†, D2340†, D2341, D283, D321, D1692, D1215.

## 17. Has he filed SANS availability for this day, and does it cover this seat

| Surface | The rule | Where |
|---|---|---|
| The crew list's badge and strike, the seat check, the warning list | one record a day; the ticked kinds; all day covers a slot past midnight; else the window must hold the whole slot | `engine/avail.ts` `sansGate` over `engine/inputs.ts` `sansAvailOn`, `sansWindow` |
| A flying seat's front edge | the in-time where earlier than the step | `engine/avail.ts` `slotRules` (`sansStart`) and `engine/validate.ts` (`Math.min(e.report,e.step)`) — the notes say one body, `events.ts seatIntime` |
| The reminder's "nothing filed" | no record on the day | `sansAvailOn` |
| The SANS calendar and day | `ui/sanscal-model.ts`, `ui/SansCal.tsx`, `ui/SansDay.tsx` (not opened) |

**AGREE** for the first three (one gate). **NOT SETTLED** for the SANS calendar's own reading of a day. Slice 5.
**Rulings:** D2341, D2313†, the SANS availability lines of `inputs.md`.

## 18. Is this input late

| Surface | The rule | Where |
|---|---|---|
| The Inputs page, the SANS calendar | its last change is after its own due time | `engine/inputs.ts` `isLateInput` |
| The week, the board's read side, View-only Sched | the same, and a scheduler has not dropped the mark | `ui/html.ts` (`lateTag`, `lateOne`) → `state/view.ts` `lateShown` |

**DIFFER, RULED** — the Inputs page keeps the mark as the paperwork record. **Rulings:** D1586, D1620, D1621, D2165.

## 19. Where does this input stand — on the programme, under Unavailable, taken off — and does it count him away

| Surface | The rule | Where |
|---|---|---|
| The schedule: crew list, seat check, day figures | `isAway`: leave and medical by kind; an activity or an Attach only under Unavailable; an overseas duty unless a scheduler took it out; never a cancelled or ⓘ one | `engine/inputs.ts` `isAway`, `odOut`, `inputSilent`, `inputDormant` |
| The warning list | `inputFlags` — never a taken-off, cancelled or ⓘ one, never an upchit | `engine/inputs.ts` `inputFlags` |
| The ALL AVAIL crowd | its own list of the same tests | `leavewar/sync.ts` `availableFor` (`keptOut`) |
| The Leave War — shows it and counts him out | `warCounts`: leave and medical by kind; a course only under Unavailable; an overseas duty unless taken out; any other commitment only under Unavailable | `leavewar/absences.ts` `warCounts`, `warVisible` |
| Where it is listed on the schedule | `listedPersonal`, `listedUnavail`, `placeOf` | `engine/inputs.ts` |

**AGREE** as read: four bodies, read side by side, give one answer for the kinds a scheduler can move or cancel. They
are four copies of one rule; a new kind or mark must reach all four. Slice 5, with slice 7 for the war's half.
**Rulings:** D760, D815, D1356, D1357, D1372, D1374, D1381, D1389, D1390, D1393, D2144.

---

# Core — the bell (slice 9, `bell`)

## 26. Which admins are told

| Surface | The rule | Where |
|---|---|---|
| A posting's lines, its take-back, "off the manpower" | the admins of the man's own squadron that day: at home there as its admin, or a plain admin holding Plan of it; a master admin through his home only | `state/accounts.ts` `adminsOf` ← `leavewar/sync.ts` `postingAdmins` |
| A holiday's OIL questions | the same body, the holiday's own squadron | `leavewar/sync.ts` (`holidayTodo`, about line 1602) |
| The commit gate's check of who a command wrote to | the same body, on the rows as they stood before | `state/perms.ts` (about lines 1327, 3059) |
| An input's filer-or-schedulers line, by squadron | its own test | `state/notices.ts` `adminThen`, `filerTold`, `filerVia` |
| The extra names in a sign-off list | `adminsOf` not at home | `state/sign-more.ts` |

**AGREE** for the first three (one audience). **NOT SETTLED** — `adminThen` is a second body answering "is he an admin
of that squadron then"; not read against `adminsOf`. Slice 9.
**Rulings:** D2194, D2195, D2198, D2202, D2215, D785, D1690, D1696.

## 27. Who is told when an input changes, and who is not

One writer, `state/notices.ts` `noticePass` (each person in the input; the filer; never the one who made the change), and
the register's rows B1–B11. Beside it: the day's own marks (an input filed after publication reads pending — D1784,
question 7) and the Leave War's "Also since you last looked" group (P9), which answers "what changed" for the admins
with no bell line (D1199, D1208). **NOT SETTLED** — slice 9 sets each register row beside its writer.
**Rulings:** D769, D760, D815, D711, D1142, D1199, D1208, D1214, D1216, D1422, D1460.

## 28. Is this bell line still live, and has he read it

| Surface | Where |
|---|---|
| The bell's list and its count | `state/notices.ts` `noticesFor`, `noticeLive`, `noticeLeftBell`; `state/noticeseen.ts` `unreadFor`, `isUnread` |
| The Leave War's Approvals count, "since you last looked" | `state/apprseen.ts` `openApprovals`; `leavewar/approvals.ts` (not opened) |
| His own leave's window on the war | `state/lwseen.ts` `openOwnWindow` |
| The SANS reminder's "read" | `leavewar/sansunfiled.ts` (`readOf`, `dueBase`) with `state/noticeseen.ts` `reminderDays` |

**NOT SETTLED** — three "seen" marks answer "is there something new for him"; not read side by side. Slice 9.
**Rulings:** D1693, D1699, D1710, D2391, D2423, D2437, D2560†.

## 29. Does an Undo take the line back, and what does a man who read it see

Stated once on the scheduler page (D1693, D1699, D1710, D2437): built today as struck with "taken back"; ruled as a new
line saying what is true now, not built. Readers: `state/notices.ts` `sansRetracted`, `backWords`; `leavewar/sync.ts`
(`warNoticesReversed`, `endedLines`). **NOT SETTLED** — a ruled-not-built item; slice 9 lists each line's present form.

---

# The schedule's day (slice 4, `day`)

## 20. Is he busy at this time

| Surface | The rule | Where |
|---|---|---|
| The seat check (crew list with a seat picked, drag reason, toast) | any event of his that overlaps, read from the validator's own event list; a spare seat asks nothing; spare rows are not in that list | `engine/avail.ts` `slotBarNow` → `engine/validate.ts` `dayEvents`; `engine/events.ts` `scSeatHit`, `avSeatHit` |
| The warning list | the validator's event list | `engine/validate.ts` |
| The ALL AVAIL crowd | `personBusy`: every non-cancelled row naming him — **an SC SPARE row and a standby row included**, a standalone line from START to END | `leavewar/sync.ts` `availableFor` → `engine/avail.ts` `personBusy` |
| The free-crew strip by wave | not tasked → free all day; else `personBusy` plus timed absences | `engine/avail.ts` `availByWave` |

**DIFFER.** A man only standing by is free to the crew list (D1120†: "they are available to be planned"), the seat
check and the warning list; the ALL AVAIL crowd drops him from any item overlapping his standby hours, and with it that
item's OIL. D1120† changes "the crew list … the day's figures and the Leave War are not changed" and does not name the
crowd; the crowd's own rule is "planned for anything on the schedule that conflicts in timing". Slice 4, with slice 1
for the OIL it moves.
**Rulings:** D1120†, D702†, D2329†, D271, D276, D2046.

## 21. Is he tasked that day

| Surface | The set | Where |
|---|---|---|
| The crew list's fade and "N free" | rows naming him, **without** standby rows, plus a commitment under Unavailable with hours | `ui/palette-html.ts` → `engine/avail.ts` `dayTasked(d, true)` |
| The day panel's "Aircrew tasked", the free-crew strip | the same **with** standby rows (never an SC SPARE) | `ui/html.ts` → `dayTasked(d)`; `availByWave` |
| The ALL AVAIL crowd's "SANS planned with us" | rows only — no commitments | `leavewar/sync.ts` → `dayEngaged(day)` |
| The SANS reminder | rows only (question 14) | `dayEngaged(d)` |

**DIFFER, RULED in part** — D1120† names the crew list against the day's figures. The third and fourth sets differ from
the first two by the commitment under Unavailable; the code's note says why for the crowd. Slice 4.
**Rulings:** D1118, D1119, D1120†, D1357, D1372.

## 22. May he be planned into this seat — the reason said before the drop and the warning after

The crew list's strike, the green rings, the drag's reason and the toast call `engine/avail.ts` `slotBar`; the warning
list is `engine/validate.ts`. Shared bodies read: `sansGate`, `scSeatHit`, `avSeatHit`, `crossDayIfPlaced` (the seven-day
run and crew rest), `restClear`, `rowTwice`. **AGREE** where a shared body is called; the seat rules (front seat, CAT
IW, SC currency, AAR) are written once in `slotBarNow` and again in the validator — **NOT SETTLED**, slice 4 sets each
pair side by side. **Rulings:** D271, D274, D276, D278, D33, D605†, D1996, D1013, D1017.

## 23. How long is his working day — for the long-day note, Insights' hours, crew rest and OIL

`engine/validate.ts` `workSpan` serves the long-day note and Insights (`engine/insights.ts`); OIL measures by its own
`engine/oil.ts` `fltOilWin` with its three kept values. **AGREE** for the first two (one body); the OIL window is a
second body on purpose (D48, D592). **Rulings:** D592, D606, D1786, D1936, D2053, D482, D1988, D1989.

## 24. Who is on the squadron's roster on this day

| Surface | Where |
|---|---|
| The crew list | `ui/palette-html.ts` (`rosOn`, and `!archived`) |
| A published day's "free all day", Insights' "who is not flying" | `engine/faceattrs.ts` `rosterShown`; `engine/validate.ts` `issuedRoster` (the roster the day went out with) |
| The ALL AVAIL crowd | `engine/roster.ts` `rosterOf(UNIT, iso)`, then by date: deleted, archived, posted in or out, SANS | `leavewar/sync.ts` `availableFor` |
| The Leave War's rows and counts | `leavewar/engine/people.ts` `inSquadron`; `leavewar/state/raptorRoster.ts` |
| The sign-off lists, the people picker, Admin → Users, Quals | `engine/publish.ts` `signPeople`; `ui/PeoplePick.tsx`, `ui/UsersPanel.tsx`, `ui/QualsPage.tsx` (not opened) |

**NOT SETTLED** — the crew list filters by today's archive mark where the crowd reads the archive by date (D327);
whether that shows a man differently on a past day was not followed. Slice 4, with slice 3 for the account side.
**Rulings:** D286, D290, D295, D297, D320, D321, D323, D327, D2328, D2132.

---

# The Leave War (slices 6 and 7)

## 25. Is he away that day, and how many are available

| Surface | The rule | Where |
|---|---|---|
| The war's Available P / W rows, the Manning rows, the bid's day line | a fraction a man: a leave bid counts unless refused (a waiting one included), half a day is 0.5; SANS and ground crew out; nobody outside his posting window | `leavewar/engine/availability.ts` `availabilityOf`, `haveOf`, `countsFor`; `leavewar/engine/bids.ts` `removesAvailability`; `leavewar/engine/availrows.ts` `availHave`; `leavewar/sync.ts` `availVerdictAt`, `bidDayLine` |
| The schedule's day panel — "Leave / downchit", "Free all day" | whole-day inputs only; a waiting bid is no input and counts nobody | `ui/html.ts` → `engine/avail.ts` `dayOff`, `availByWave` |
| The crew list and the ALL AVAIL crowd | inputs only | questions 19, 20 |
| The day's class and Required figures | one resolver | `leavewar/sync.ts` `flyAnswer` → `state/flyplan-model.ts` `planFor` |

**DIFFER** — on purpose by the code's notes (a waiting bid warns while there is time to act; "owner, 9 Aug 26"). The
ruling behind counting a waiting bid was not found in this pass; an OIL day no longer removes him (the note of 21 Sep
26). Slice 6 to find the rows and say whether a man with a waiting bid may be planned on the schedule unmarked.
**Rulings:** D1190, D1191, D1193, D1202, D1243, D1357, D80, D668, D640.

## 30. Does this leave day cost him a day

`leavewar/engine/charge.ts` (a weekend or holiday costs nothing unless a pilot's run of 15 or more) against the
Balances page's figures and the bid window's "would leave" line (`leavewar/engine/counters.ts`, `whatif.ts` — not
opened). Shares the day-off body of question 2. **NOT SETTLED** — slice 7. **Rulings:** D21, D1479–D1492.

## 31. May a member bid on this day

`leavewar/engine/access.ts` `canEditCell` (open, and not before today) with `leavewar/engine/opendates.ts` `isOpenOn`;
the chip's "Bidding closed", the day's note, the bell's P4 / P7 lines and the commit gate (`state/perms.ts`
`lwClosedKeys`) answer the same question. **NOT SETTLED** — slice 6. **Rulings:** D1177, D1211, D1214, D1225, D1176.

---

# Crossing areas (slice 12)

## 32. Which squadron is he in on this day, and whose page is this

`state/units.ts` `homeOn`, `engine/roster.ts` `homeUnitOf`, `rosterOf`; `state/perms.ts` `myUnit`, `pageUnit`,
`pickStandsOn`; `engine/inputs.ts` `inputOnDay`, `inputBelongs`; `leavewar/sync.ts` `worldUnit`, `warUnit`;
`state/notices.ts` `inputUnit`. `feature-impact.md` lists these seams one by one (§The drift-seams, the four
multi-squadron headings). **NOT SETTLED** — not read side by side here. **Rulings:** D2132, D2160, D2183, D2184, D2191,
D2195, D2197, D2201, D2206†, D2243.

## 33. What does a flying count include

Insights counts a flying line with nobody on it as a sortie, as the day's heading does (D1009; `engine/insights.ts`,
`ui/html.ts` day panel — the panel's own count was read: every aircraft line, cancelled ones shown apart). The Leave
War's fly rows (`leavewar/ui/FlyRows.tsx`) and the Tracker's marks were not opened. **NOT SETTLED** — slices 4 and 8.

## 34. Can this Undo step be taken, and whose is it

`how-we-work.md` §App-wide product rules (D148, D350): the schedule's Undo (`state/history.ts`, `undo/timeline.ts`), the
Leave War's and the Tracker's (`ui/topstate.ts` `globalUndoEngine`, `trackerUndoEngine`). **NOT SETTLED** — not opened;
slice 12. **Rulings:** D148, D350, D352, D1752.

---

## Count and hand-off

- **Questions listed: 35** (1–34 and 13a). By slice: `oil` 1–5 · `published` 6–9 · `permissions` 10–13a · `inputs-sans`
  14–19 · `bell` 26–29 · `day` 20–24 · `lw-grid` 25, 31 · `lw-balances` 4 (shared), 30 · crossing areas 32–34.
- **Read to a verdict: 20.** AGREE: 1, 2, 6, 8, 19, 23 (and 10 for today, 13a in effect, the shared parts of 11, 17,
  22, 26). DIFFER, RULED: 18, and 14's reminder. DIFFER: 5, 13, 14 (which copy), 15, 16, 20, 21 (in part), 25.
- **Not settled, named for its slice: 15** — 3, 4, 7, 9, 12, 24, 27, 28, 29, 30, 31, 32, 33, 34, and the unopened halves
  of 11, 17, 22, 26.
- **For every slice's brief:** a difference here is a thing to judge, never part of the rule; each reading named in a
  code note (the validator's silence in 15, the war's SANS row in 16, the reminder's copy in 14) is a reading to place
  with him, not a pass.
