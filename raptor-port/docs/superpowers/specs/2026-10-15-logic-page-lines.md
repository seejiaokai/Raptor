# The Logic page — every line, for the build (D928, D929, D930)

**Status: v1, written 15 Oct 26 for one fresh reader before the build (D928).** The design: the mock-up
`raptor-port/docs/mock/2026-10-15-logic-page/index.html`, approved as drawn (D928 — "All as recommended"); what the page
holds today and what each setting does: `2026-10-15-logic-page-inventory.md`. Backlog: `[LOGIC-PAGE-LAYOUT]`.

**What every line is held to.** D925: the page is for the scheduler or admin reading it, never a description of how the
app works inside. D929: it shows how each rule applies to the reader and how the rules affect one another — a
setting's line names what else moves with it; a check's line names, in brackets, the setting it reads. D930: key
points only — every word is asked whether it is needed at all. D931: the page is a guide for a user who wants to
know how the app's rules work in depth, without jargon or what is not essential — every line is read as that user
would read it, and one too short to follow is a plain sentence instead. D932: every number in the text that is an
editable setting is read from that setting (the `{crewRest}` form below), never typed — so the words stay true when an
admin changes it; a test changes every setting and finds no standard value left. D933: a check's key info is said as his crew-rest
example says it — who and what it applies to, and its limit — so crew rest reads "For a flying member: at least
{crewRest} (Crew rest) from the end of his day before to his earliest in-time, or to anything earlier that day." The writing guide (`design-practices.md` §1, §1a, §1b):
"you", never "we"; a dash only as a named choice; the app's own names. No rule's value or meaning changes (D809, D925):
these are words and places only.

**How a value prints.** `{crewRest}` and the like are the live value, as the page shows it today (`12h`, `2h20`,
`30m`). A check's name is the warning list's own name for it (`WCODE`, with its value filled in), so the reader meets
the same words on the schedule — never a second name.

## The page's one row (D926, the guide §3)
`Logic` · the search box (placeholder **"Search"**) · **Filter** (a menu: All · Warnings · Advisories · Notes · Fired
this week (N)) · **✎ Edit** (admin; **Done** while editing) · **Reset to standard** (admin, only while a value is off standard — its words as today).
The line under the title today ("every rule the engine applies — …") goes (D846 test 1: the page says what it is).
The count line ("N of M rules · K fired…") goes: the list itself shows what the filter left. "Fired this week (N)" keeps
the count where it is needed, on the filter.

**The strip while a value is changed** (admin and member alike, only while a setting a check reads is off standard —
W2): **"N settings changed from the squadron standard. The schedule is checked against them now; a published day keeps
its brief, report, debrief and OIL values until it is published again."** For a member it adds **"Only an admin can
change them."** (Corrects today's "checked against these values, not the published ones" — the inventory's one
misleading line, D928.)

**Nothing matches:** "Nothing matches “{search}”." (as today).

## Part 1 — Settings (shown only with the filter on All)
Each row: the name, the value (a box while editing), one line. While editing, a changed value shows
**"Standard {std} · Reset"** under its line (the mock-up's per-setting Reset).

**Crew rest and the working day**
| Setting | Value | Line |
|---|---|---|
| Crew rest | crewRest | The rest a flyer needs before his day starts. The crew-rest warning and the tight crew-rest note move with it. |
| Days in a row | maxRun | One day more raises the red break-day warning. |
| Long work day | longDay | A longer day, first commitment to last, shows the grey long-day note. |
| Report before take-off | reportLead | With no in-time or rally typed, a flyer's day starts here: his long day, OIL and Insights hours count from it. "+ In-time / Rally" fills in this time. |

**Flying lines**
| Setting | Value | Line |
|---|---|---|
| Brief before take-off | briefLead | Sets the suggested B on a line with no brief typed, and a blank B is checked against it. A published day keeps its B until it is published again. |
| Step before take-off | step | A man counts as busy from step: clashes and the crew list follow it. It also turns a LATE SHOW crew-rest ring solid. |
| Dekit after landing | dekit | A man counts as busy until dekit. |
| Debrief after landing | debrief | Ends a flyer's day: tomorrow's crew rest, the long day, OIL and Insights hours count to here. |
| Tight turn | tightTurn | A shorter gap from landing to the next take-off is a tight turn. It is never less than dekit plus step. |
| In-time / Rally words | reportText | What "+ In-time / Rally" writes after the time. |

**Sims**
| Setting | Value | Line |
|---|---|---|
| EP sim brief | epBrief | The brief before an EP sim, unless its remarks name one. |
| Sim debrief | simDebrief | The debrief after a sim. |
| AMT debrief | amtDebrief | How long an AMT debrief runs when its DEBRIEF row has no end. |

**Rows with no end time**
| Setting | Value | Line |
|---|---|---|
| A sim | simLen | A sim with a start and no end runs this long: for clashes, the crew list and OIL. |
| Any other row | openEnd | The same for a ground, programme or duty row. |

**Standby (SC, AVALON, BB)**
| Setting | Value | Line |
|---|---|---|
| SC day window | scDayFrom to scDayTo | A shift wholly inside it needs SC DAY; one reaching outside it needs SC NIGHT. |
| SC MAIN clashes | the six kinds (a flight, a sim, a duty post, another shift, a ground event, a programme item), each Warning or Advisory | What an SC MAIN man's clash with each shows: a red warning or an amber advisory. |

**Inputs** (each set in its calendar's own settings window; an admin's row opens it — D639)
| Setting | Value | Line |
|---|---|---|
| Inputs late cut-off | cutRuleText('inputs') | An input last changed after it wears LATE. |
| SANS late cut-off | cutRuleText('sans') | The same for SANS availability. |
| Members file for others | On / Off | A member may file a duty or commitment for someone else. |

**OIL**
| Setting | Value | Line |
|---|---|---|
| Full day of OIL | oilFullMin | Weekend or holiday work this long or longer earns a full day; less earns a half. |

**Insights**
| Setting | Value | Line |
|---|---|---|
| Track Blue and Red sorties | On / Off | Splits Insights' flying bars into Blue and Red, and asks Blue or Red under a formation. |

**Not on the page (D928):** Minimum turn and Default sortie length — nothing in the app reads them. They stay in the
engine's settings (a stored value still loads; Reset to standard still clears it).

## Part 2 — The checks
Each row: a dot (red warning, amber advisory, grey note), the name, one line. Four carry a folded **"How it works"**.
A row with no warning code is a grey note: something the app does that a reader acts on.

**Crew rest and the working day**
| Tier | Name | Line | Fold |
|---|---|---|---|
| Warning | CREW_REST — "Crew rest (<{crewRest})" | Less than {crewRest} (Crew rest) between yesterday's last commitment and today's first. | **F1** |
| Advisory | CREW_TIGHT — "Tight turning — crew rest" | Rest is short only from the nominal {reportLead} report (Report before take-off); his instructed report clears it. | |
| Warning | DAYS_RUN — "No break day — too many days in a row" | On the programme more than {maxRun} days in a row (Days in a row). | **F2** |
| Note | LONGDAY — "Long work day" | More than {longDay} from first commitment to last (Long work day). | |

**Two things at once**
| Tier | Name | Line |
|---|---|---|
| Warning | DOUBLE_BOOK — "Conflict — two events at once" | Two commitments overlap for one man. Touching end to end is not a clash. |
| Advisory | SHIFT_SOFT — "On shift — also down for a ground event" | An SC MAIN man is also down for something SC MAIN clashes grades amber. A commitment input across the shift is red; a meeting stays amber. |
| Note | ⓘ info only | A ground or programme item marked ⓘ is printed but never checked, and earns no OIL. |
| Note | Past midnight | A row whose end reads earlier than its start runs into the next day. |

**Flying lines**
| Tier | Name | Line | Fold |
|---|---|---|---|
| Note | Flying wave | kindNote('fly') — the "+ Wave" picker's own words, unchanged | |
| Warning | REPORT_ORDER — "In-time / Rally — timings out of order" | In-time, rally, brief, take-off and landing are not in that order. | **F3** |
| Advisory | REPORT_UNRESOLVED — "In-time / Rally — check the reporting instruction" | The app cannot read an In-time / Rally line, or RALLY AFTER IN TIME has no in-time. | |
| Advisory | NO_BRIEF — "No time for the flight brief" | Something sits between the brief and take-off. | |
| Advisory | DEBRIEF — "No time for the flight debrief" | Something sits inside landing plus {debrief} (Debrief after landing). | |
| Advisory | TURN — "Tight turn" | Less than {max(tightTurn, dekit+step)} from landing to the next take-off (Tight turn). | |
| Advisory | DT_SUM — "Double turning" | Two or more sorties in one day. One line names everyone; it is routine, not an error. | |
| Advisory | FLT_NO_LEN — "Flight times — take-off and landing are the same" | A line's take-off and landing are the same time. A flying line still earns its OIL; a standby shift earns none. | |

**Sims**
| Tier | Name | Line |
|---|---|---|
| Advisory | SIM_BRIEF — "No time for the sim brief" | Something sits inside an EP sim's {epBrief} brief (EP sim brief), or an AMT's BRIEF row. |
| Advisory | SIM_DEBRIEF — "No time for the sim debrief" | Something sits inside a sim's {simDebrief} debrief (Sim debrief), or an AMT's DEBRIEF row. |

**Qualifications and currency**
| Tier | Name | Line |
|---|---|---|
| Warning | QUAL — "Qualification — illegal seat" | A man in a seat he may not hold, such as a WSO in the front seat. Any pilot may fly the rear seat. |
| Warning | ILLEGAL_CREW — "Illegal aircrew combination" | An OCU pilot with a CAT A–D WSO, or the reverse. An instructor in either seat clears it. |
| Advisory | CREW_SOLO — "Crew solo — only allowed under syllabus" | An OCU pilot with an OCU WSO. |
| Advisory | CO_APPROVAL — "Crew combination — CO approval required" | D+C, C+D or D+D, pilot and WSO. |
| Advisory | OCU_NO_IP — "OCU without IP" | An OCU formation with no instructor (IW, IP, IR or FI). |
| Advisory | PAX_CREW — "Incentive passenger — crew pairing needs approval" | Ground crew in a rear seat. Ground crew are checked only for clashes, the long day and days in a row. |
| Warning | NO_IR — "IRT without an IR examiner" | IRT in the mission needs an IR in the formation; IRT in an aircraft's remarks needs one in that aircraft. |
| Warning | AAR_QUAL — "AAR currency — not qualified" | AAR in the remarks needs the front seat's currency: night on a night wave, day otherwise. NAAR or DAAR says it outright. |
| Warning | AAR_INSTR — "AAR — back seat not cleared to instruct" | A pilot not current may fly AAR as training only with an instructor marked I for it in the back seat. |
| Warning | SC_QUAL — "SC currency — wrong shift" | A standby seat inside {scDayFrom} to {scDayTo} (SC day window) needs SC DAY; outside it, SC NIGHT. A spare too. |
| Note | Night after day | NAAR needs DAAR, and SC NIGHT needs SC DAY. Quals keeps them in that order. |

**Standby (SC, AVALON, BB)**
| Tier | Name | Line |
|---|---|---|
| Note | SC | kindNote('sc'), unchanged |
| Note | AVALON | kindNote('avalon'), unchanged |
| Note | BB | kindNote('bb'), unchanged |
| Note | A shift's hours | A standby shift takes exactly its written hours: no step, dekit, brief or debrief. |
| Advisory | SC_INTIME — "In-time window cut — busy between report and shift start" | A typed B on an SC MAIN is the crew's in-time, and something sits between it and the shift start. A SPARE's B does nothing. |
| Note | Arming an SC seat | The crew list judges each man against that shift's hours only. |

**Leave, downchits and inputs**
| Tier | Name | Line |
|---|---|---|
| Note | An input closes its hours | From the moment it is filed. One taken off the programme closes nothing. |
| Warning | LEAVE_FLY — "On leave + flying" | A man on leave is planned for a flight, sim, duty or ground slot. |
| Warning | DNIF_FLY — "Downchit + flying" | A medically down man is planned. On ATT B he may still stand a duty, sim or ground slot, but not fly. |
| Warning | INPUT_FLY — "Personal input clash" | Any other input clashes with a planned slot: a course, a meeting, an appointment, overseas duty. |
| Note | A seat with no times | Still checked against an absence covering the whole day; a part-day absence waits until the seat has times. |
| Note | Half days | Leave and medical can be AM (to 12:00), PM (from 12:01) or all day. A sortie's hours start at step. |
| Note | Standing SC SPARE | Local leave may. Overseas (OL, OD) and the four medical codes may not. |
| Advisory | SANS_AVAIL — "SANS availability — planned outside the availability filed" | A SANS man planned outside the event or the hours he filed. Filing nothing raises nothing. |
| Note | LATE | An input last changed after its cut-off (Inputs late cut-off) wears LATE: a mark, never a warning. Downchits never do. |

**OIL**
| Tier | Name | Line | Fold |
|---|---|---|---|
| Note | Weekend and holiday work earns OIL | When the day is published, by Full day of OIL. | **F4** |
| Warning | OIL_NO_TIMES — "No OIL earned — a row has no usable times" | A weekend or holiday desk with a man on it and no times earns him nothing. | |
| Advisory | OIL_UNPUBLISHED — "OIL waiting — this day is not published" | A weekend or holiday with someone to earn is not published yet. | |
| Advisory | OIL_NO_PERIOD — "No OIL — no Leave War period covers this date" | The OIL has nowhere to land. | |
| Advisory | OIL_STALE_DAY — "Became a holiday after publishing — republish for its OIL" | (the name says it; no line) | |
| Advisory | OIL_STALE_HOLIDAY — "No longer a holiday — republish to withdraw its OIL" | (the name says it; no line) | |
| Advisory | OIL_OLD_BLOCK — "Published before these seats counted — republish to credit them" | An ALL AVAIL on a desk, sim or extras line, on a day published before the app counted it. | |

**On the puck**
| Tier | Name | Line |
|---|---|---|
| Note | Several problems on one puck | It shows the most serious flag, in this order, and its ring the most serious colour: [the chip row, from RANK, as today] |

### The four folds ("How it works")
- **F1 — Crew rest.** Rest runs from the end of yesterday's last commitment of any kind to the first thing today,
  which may be a meeting before the report. A flight ends at landing plus the debrief ({debrief}); anything else ends
  at its written end. An input counts only if it is a duty or commitment with typed times. Exactly {crewRest} is legal,
  and a day with no flying asks for no rest. A LATE SHOW remark keeps the warning: the ring is dashed while rest still
  clears by step, solid after. Monday checks last Sunday, and a Sunday that breaks Monday shows a "Breaks Monday" box. A
  flying line with no times yet is not measured, but a typed brief, in-time or landing on it still counts. An SC SPARE
  carries no crew rest either way, and a shift's start is its report.
- **F2 — Days in a row.** Any tasking counts: a flight, a duty, a sim, a ground or programme row. Leave or a downchit
  resets the count. It counts last week's tail, and the warning lands on the day to clear.
- **F3 — Times out of order.** The order is in-time, rally, brief, take-off, landing; equal times are fine. The B on the
  line is what is checked, and a blank B is checked as the suggested brief, take-off less {briefLead}. Out of order is
  red, but it never stops a day being published. On an In-time / Rally line the first clock is used (09:00H or 0900):
  write IN TIME, RALLY or both. A formation's name makes the line that formation's, otherwise it is the whole wave's,
  and a clock later than take-off means the day before.
- **F4 — OIL.** Weekend or holiday work earns OIL once the day is published. A man's day runs from his first report to
  his last end, gaps included: {oilFullMin} or more is a full day (FO), less is a half (HO). A flight runs from its
  in-time (or the nominal report) to landing plus the debrief. A row with no times earns nothing, and an Off day earns
  nothing. SC SPARE, AVALON and BB earn only if switched on in OIL Earn. A Duty & commitments input earns once its OIL
  question is answered yes. A published day keeps its OIL until it is published again.

## What leaves the page, and why (D928's "Gone", D930's test)
- The code names, the grey column of engine text, the "fired N× / not fired" on every row, the history and the owner's
  dated quotes, every group's sub-line, the title's sub-line, the count line.
- The duplicated rows: Step (twice), the nominal report (twice), "Wave types at a glance" beside "The standby lines"
  (merged: the kind notes are the Standby checks), the 26 Aug overlay prose.
- Publishing and amendments (four rows): the publish screen itself shows the sign-offs and what an AL takes.
- The absence-type list (every input kind and what it closes): the Inputs page's "?" legend shows it, from the same
  sentence (`inputRuleText`) — it stays there, one reader instead of two.
- "Not currently used: minTurn and dur" (D928 — removed from the page).
- Long "why" paragraphs: their key point is in the line or its fold; the rest is how the app works inside (D846 test 2).
