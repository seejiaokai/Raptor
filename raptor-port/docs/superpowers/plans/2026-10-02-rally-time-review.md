# Rally time — independent Astra proposal/review record, 2 Oct 26

Author of responses below: delegated Astra; recorded by Sol host. Read-only runs, no app edits/tests. No approved implementation plan. D496 model split applies. Original structured-editor draft is an unapproved earlier proposal; its complete response is retained verbatim in `2026-10-02-rally-time-astra-original-draft.md`, with its impact concerns also preserved as an explicitly labelled host summary in the design note. The following is the revised response, preserved verbatim.

## Revised response after the owner's simpler-box proposal

The simpler box is viable and avoids introducing a separate timing editor or new stored structure. It is **not merely a rename** if “earliest” must work reliably: the current reader uses the first clock per line, the earliest unscoped line, but the **last matching formation-specific line**. Those rules can disagree.

This remains a proposed simplification. It does not withdraw D497’s chronology requirement or authorize building.

**Recommended minimal design**

Rename the existing block and add control to **In-time / Rally**. Keep its present editable lines and compact appearance. Show a small calculated explanation underneath, for example:

> Reporting starts 07:45 · Reaper, Saber
> An earlier commitment starts that person’s day sooner.

Demonstrate the three arrangements using the same box:

```text
08:00 Rally — WX + NOTAMs
```

```text
07:45 In-time, rally immediately after — WX + NOTAMs
```

```text
07:45 In-time
08:00 Rally — Reaper + Saber
```

Recommend **one operative clock per line**. Later clock times in prose must not accidentally become reporting instructions. The preview should reveal both the chosen time and whom it applies to before the user leaves the box.

**What still needs resolving**

- **Clock selection:** `events.ts:208` currently reads the first valid clock, not the earliest of every number. Reading every clock in arbitrary prose would allow a note such as “WX from 06:00” to move reporting earlier unintentionally.
- **Scope:** `events.ts:247` matches formation callsigns anywhere in the text. A line naming none becomes a wave-wide fallback; a specific line overrides it regardless of which time is earlier. Repeated specific lines currently use the last one. The new meaning must resolve these cases deliberately.
- **Overnight:** choose the earliest *actual time*, not the smallest clock number. For a 01:00 flight, 23:00 the previous evening is earlier than 00:15. Existing limited midnight conversion at `events.ts:275` occurs after current line selection; simply inserting `Math.min` would be insufficient.
- **Chronology:** an earliest reporting time alone cannot prove “in-time → rally → brief → take-off → landing.” Preserving that requirement needs recognizable in-time/rally labels, even if both remain in the same box. A bare line can retain a clearly stated report-time meaning, but it cannot supply an invented rally stage.
- **Earlier commitments are per person:** work-hours already take the earliest start from that person’s scheduled events (`validate.ts:139`). Crew-rest checks also consider qualifying earlier timed inputs (`validate.ts:493–518`). They do not move everyone in the wave to one person’s earlier meeting.
- **The input distinction matters:** the work-hours span excludes personal inputs while crew-rest includes certain timed work inputs. “Unless another event is earlier” should preserve those established definitions, not silently count leave or all-day records as work.

**Revised impact and safety recommendation**

Retain the shared instructed-report route through `seatIntime` and its event/availability callers. Update the relevant clock resolution and labels; keep the rest of the original impact map as a verification checklist rather than assuming every listed file needs editing.

The affected outcomes remain work-hours/Insights, long-day warnings, crew rest, SANS availability, wave availability bands and cross-week checks. Preserve:

- Insights’ latest-issued-copy rule.
- Existing nominal-report and step-time distinctions.
- SC’s separate interpretation and late-show behaviour.
- Publishing, pending marks, signature invalidation, Undo and saved-plan round trips.
- **Earned leave:** `oil.ts:219` uses the nominal reporting lead, not the current in-time reader. This proposal must not silently change OIL.

Using the existing string field avoids a new saved-data format. Nevertheless, changing its interpretation affects old **and newly written** schedules. Do not silently reinterpret ambiguous existing text or claim this is only a disposable-demo-data issue.

The minimal mock should show three normal examples, one formation-specific example and one invalid/overnight example. It need not implement a new timing table.

**Four product questions**

1. **“Can each line contain one reporting clock, with the wording after it explaining the activity?”**
   Recommended: yes—e.g. `07:45 In-time` and `08:00 Rally`. This keeps notes from accidentally changing the calculation.
2. **“If the whole wave has an 08:00 in-time and Reaper has a 09:00 rally, should Reaper still start at 08:00?”**
   Recommended: yes—the earlier instruction applying to Reaper wins. This changes today’s specific-line override, so it needs an explicit answer.
3. **“When the times run backwards, should the draft remain editable but publishing be stopped?”**
   Recommended: yes, with the exact incorrect pair identified. The chronology requirement stands; this question settles enforcement.
4. **“For overnight flying, should a time explicitly say ‘previous day’ when needed?”**
   Recommended: yes, with a visible interpreted sequence. Do not guess the date merely to make a bad sequence pass.

Equality between stages and omitted-step handling remain unresolved for the next round; equal take-off/landing is already governed by D49 and should not be re-asked.

The **complete previous draft remains in my immediately preceding full plan response**. Preserve that response verbatim as the earlier, more structured proposal, followed by this revision; do not replace it with a reconstructed “original.” Its impact map remains useful, while its new structured-storage recommendation is superseded at the proposal level by this simpler direction.

No edits or tests performed. Rulings: none added.

## Generated-ruling and mock source read — complete response

**D498 meaning check passes.** The generated short line says “ASSESS,” and its full row explicitly retains proposal status, unanswered scope/grammar/midnight/enforcement questions, and unchanged earned-leave rules. D497 also retains its unapproved-design caveats.

One material mock-up defect:

- **Accepted `INTIME` becomes the wrong activity.** The parser accepts `08:15 INTIME`, but normalisation only replaces a hyphen. The result remains `INTIME`, rather than `IN TIME`; it displays as Rally and is excluded from the in-time chronology check.
- **Consequence:** `08:15 INTIME` followed by `08:00 RALLY` can say the order is valid and enable the demonstration’s publish button.
- **Fix:** normalise every accepted `IN TIME` / `IN-TIME` / `INTIME` spelling to one activity value before rendering and validation.

Otherwise, the source reflects the simpler proposal: the box remains text-based, the demo explicitly says whole wave, remarks after `|` are not parsed, overnight dates are explicit, and Saber’s earlier event affects his displayed day start separately. “Proposed design” and “proposed publish block” distinguish it from an approved app change.

Limits: source read only; no browser rendering or interaction testing. Equality, mandatory reporting time and publication blocking remain prototype assumptions—not settled rules. Its calculations provide no evidence that the real app’s downstream consumers work.

No edits. Rulings: none added.

## Host disposition

Fixed the normalisation in the mock only and verified all three spellings with the same reversed-order assertion. The lightweight mock browser results are in the design note. The follow-up source read below confirmed the mock fix; this is not a final real-app inspection. The earlier full draft has been retained verbatim, separate from the host summary.

## Final source and design-note read — complete Astra response

The mock’s `INTIME` defect is fixed in the source: every accepted in-time spelling now becomes `IN TIME` before validation and display. Its proposal labels and the design note preserve the whole-wave-only scope, unresolved choices and lack of app-build approval. I did not rerun the browser checks.

One documentation correction remains: the impact map points to three wrong locations. Use:

- `src/engine/insights.ts`, not `src/ui/insights.ts`
- `src/engine/publish.ts`, not `src/state/publish.ts`
- `src/engine/editlog.ts`, not `src/command/editlog.ts`

These references otherwise send the next implementer to the wrong modules.

The complete original draft response is archived verbatim, with an added author/status header, in [rally-astra-original-draft.md](C:/Users/User/.codex/visualizations/2026/10/02/01a0fab0-9850-7130-8da0-de797da4a3ba/rally-astra-original-draft.md). Nothing from that response was excluded.

No repository edits or tests. Rulings: none added.

Host disposition: verified the three engine module paths and corrected the design note. Preserved the original full draft on the planning branch. No app implementation or ownership choices were approved by these reads.
## D500 formation clarification — complete independent Astra read

**D500 short/full meaning read: passes.** It preserves existing own-wave callsign recognition and free text, without approving a new parser or changing specific-over-wide precedence.

**Sol-authored clarification: no material findings.** The legacy VL example is correctly described. The engine rule preserves the existing fallback; the spec keeps dual-stage precedence, mandatory grammar and publication enforcement undecided. The reported 18 passing tests are clearly limited to the existing reader, not Rally implementation or a full app walk.

I am not approving my own copied scope paragraph. I did not rerun or observe the tests.

No edits. Rulings: none added by this agent.

Host disposition: preserved the existing production callsign reader and accepted free text; no source/test edits. The mock remains an explicitly limited whole-wave demonstration, not proof of flight-specific parsing. Existing focused in-time suite 18/18 passed. Future Rally dual-stage calculations and enforcement still require product choices and an independently challenged implementation plan.
## D501–D502 answers — complete independent Astra read

**D138 meaning read: passes.** D501/D502’s short/full pairs and D497/D498’s narrowed status preserve the owner’s answers:

- One operative clock per line is approved; legacy free text remains, with no mandatory separator.
- Editing feedback, saveable drafts and publication blocking are approved.
- Specific-over-wide precedence remains unchanged and unresolved for the proposed dual-stage calculation.
- Broader overnight inference remains unanswered.

**Sol’s clarification: no material findings.** It explicitly exposes whole-line callsign matching, including names in remarks, and does not promise semantic understanding or ignore those matches. Existing overnight recognition is described as separately bounded for report and brief. No equality, blank-B or implementation approval is inferred.

I did not approve my own earlier proposals or rerun tests. The prior 18-test result is correctly labelled historical evidence.

No edits. Rulings: none added by this agent.

Host disposition: two accepted product directions recorded, older tentative statuses narrowed in the same change, and existing recognition preserved. The one overnight question remains pending; no time elapsed is taken as an answer. No Rally app build started or mock parser represented as application behaviour. The publication block concerns the agreed incorrect timing order, not a blanket block for every existing advisory. Equal take-off/landing retains D49 pending no new contrary ruling.
## Full independent Astra existing-engine audit — 2 Oct 26

Read-only response to owner's challenge, retained before Sol disposition. This is an existing-behaviour audit, not approval of Astra's own Rally proposal. The writer correction below qualifies the original brief-after-take-off sentence.

The owner’s challenge is justified: checking the text reader alone does not establish the complete reporting behaviour. The existing system has several deliberately different time windows. A simple rename can retain them; adding Rally selection and chronology enforcement requires decisions and checks beyond the parser.

Read-only audit completed against current engine source and existing test definitions. No edits or tests run. UI/state/publication/export verification remains Sol’s parallel scope. References below are relative to `C:/Users/User/.codex/worktrees/8c06/Raptor/raptor-port/`.

**What the current text means**

`src/engine/events.ts:208–280` establishes three separate steps:

1. Each line contributes its **first valid clock token**, not its earliest number. Invalid tokens are skipped. Labels such as IN TIME, RALLY and BRIEF have no semantic significance to this reader.
2. Any bounded, case-insensitive match against that wave’s actual formation callsigns scopes the entire line. Matching includes remarks. No matching own-wave callsign makes the line wave-wide.
3. The **last specific line wins** for each named formation. Otherwise the earliest raw-clock wave-wide line supplies the fallback. Midnight adjustment happens afterward, per formation.

Worked cases with formations VL and RU:

| Entered lines | Current result |
|---|---|
| `09:00 IN TIME`; `10:00 VL IN TIME` | VL 10:00; RU 09:00, either line order. |
| `09:00 VL IN TIME`; `10:00 VL RALLY` | VL 10:00. Reverse the lines and VL becomes 09:00. Current code does not recognize stages or select the earlier specific instruction. |
| `10:00 IN TIME — coordinate with VL` | VL only. “Coordinate with” does not make VL incidental to scope. |
| `10:00 UNKNOWN IN TIME` | Wave-wide fallback, provided UNKNOWN matches no own-wave formation. It is not rejected as an unknown attendee. |
| `10:00 IN TIME — previous brief 08:00` | 10:00. The second clock is ignored for reporting. |
| `08:00 reference note; report 10:00` | 08:00. Prose does not distinguish reference clocks. |
| `RU 08:45, VL 09:15` | Both RU and VL receive 08:45. The reader does not pair each callsign with its adjacent clock. |
| `100 rounds; report 10:00` | 01:00: the compact token `100` is a valid clock in the existing grammar. |
| `25:90 IN TIME` or `IN TIME TBD` | No instruction. The downstream fallbacks apply. |
| Wide `23:00 IN TIME`; wide `01:00 RALLY`, TO 01:30 | Raw minimum selects 01:00 before midnight interpretation. It does not compare previous-evening 23:00 against next-day 01:00. |

These are executable-source deductions, not newly run examples. The accepted free-text example `10:00H: FIRST WAVE VL IN TIME + WX/NOTAMS` correctly selects VL.

**Where those results go**

| Consumer | Actual current behaviour and consequence |
|---|---|
| Individual flying report | `events.ts:365–383`: explicit resolved in-time; otherwise **step**, TO minus the configured step lead. Blank brief separately uses TO minus brief lead. |
| Work hours / long-day note | `validate.ts:139–160,959`: report through landing plus debrief, combined with other scheduled events’ starts/ends. A late invalid report can produce negative hours. Its nominal TO−reportLead fallback is present in `workSpan`, but ordinary `buildDay` flying events already supply `report = intime ?? step`; describing blank in-time as invariably TO−3h is wrong. |
| Insights | `insights.ts:14–39`: same `workSpan`, using the issued-world events. It inherits the calculation, including defects; it is not an independent timing engine. |
| Crew rest | `validate.ts:460–518`: actual flying anchor is the earlier of explicit in-time and typed/default brief. A qualifying earlier commitment for that person can move the anchor earlier still. Nominal TO−reportLead separately governs the tight-turn advisory. Therefore report 10:00 with brief 09:00 can mean work-hours start 10:00 but crew-rest anchor 09:00. |
| Earlier personal Inputs | `validate.ts:443–447,515–518,601`: qualifying timed commitment Inputs affect crew rest, but are not added to EVD/workSpan merely because they were entered. “An earlier event starts the day earlier” needs this distinction. Ordinary scheduled duty/sim/ground/programme events can affect both. |
| Ordinary busy/clash window | `events.ts:417–421`, `avail.ts:245`: step through dekit, with brief/debrief checks handled separately. Changing report does not automatically widen all clash or absence windows. |
| SANS | `avail.ts:264`, `validate.ts:1243`: earlier of report and step through dekit. Picker and validator share `seatIntime`. This intentionally prevents a late report shrinking availability requirements. |
| SC | `events.ts:275–280`: typed SC B outranks wave lines. Work hours and crew rest clamp its start to no later than shift start. Early report-to-shift overlap has its own `SC_INTIME` advisory (`validate.ts:720–732`). SC spares are excluded from the main event stream; AVALON/BB have separate exemptions. |
| Late show | `validate.ts:466–477,542–555`: does **not** move the crew-rest anchor or remove the breach. It permits a dashed red ring only when rest clears by step and no earlier event binds. The contrary explanatory comment beside `lateShowOf` in `events.ts` is stale; do not repeat it. |
| Earned leave/OIL | `oil.ts:219–222`: flying accrual uses nominal TO−reportLead through landing+debrief, not typed in-time. SC uses the written shift window. Rally must not silently redefine this. |

**Midnight and border-day behaviour**

`events.ts:275–280,365–370` already rolls an entered in-time to the previous day when **TO−reportLead < 0 and entered clock > TO**. Typed brief uses its own briefLead condition. These are separate bounded heuristics, not general date inference.

With current defaults (reportLead 180, briefLead 140 minutes), TO 02:30 and typed 23:00 can roll the in-time backward while the same typed brief remains forward. TO exactly at the configured lead does not satisfy the strict `<0` condition. A daytime late time remains late; it is not silently moved yesterday.

Landing earlier than take-off rolls forward a day. Input tails shift adjacent-day records by ±1440 (`events.ts:522–563`). Crew-rest boundary seeds use the same `buildDay` (`weekctx.ts:204,256`); Monday reads previous Sunday, and Sunday performs a next-Monday phantom check (`validate.ts:1008,1402`). Replacing only the local reader would therefore affect cross-week warnings and their forward traces too.

Existing chronological defects must not be described as already enforced: `audit-c-times.test.ts:84` explicitly documents a daytime brief later than take-off disabling the brief overlap window. The new D502 pair validation is additional work.

**Wave heading and sorting are different again**

- `events.ts:580`: wave heading takes the earliest raw first-token time across **all** lines, without resolving specific overrides. If no clock exists, it falls back to earliest TO.
- `events.ts:589`, `avail.ts:87`: availability bands sort by those raw wave times. First band begins at midnight; later boundaries follow subsequent wave times.
- `reorder.ts:312,362`: actual formation/wave Auto sort uses TO, not in-time.
- `ui/board.ts:148` displays the wave-level value; the add-line default also reads it (`ui/interactions.ts:742`).

Consequently a heading can show 09:00 while every relevant individual has a later overriding instruction. “Earliest in-time sorts the waves” would incorrectly conflate availability-band ordering with board Auto sort.

**Existing evidence and uncovered combinations**

Existing tests explicitly cover first-token grammar, specific-over-wide in either order, minimum among wide lines, seed compatibility and formatting invariance (`intimes.test.ts:30–160`); bounded previous-evening and daytime non-roll behaviour (`brieftime.test.ts:54–75`); SC B, work hours and early-window advisories (`scintime.test.ts:45–150`); picker/validator SANS agreement (`sansavail.test.ts:261–303`); midnight input tails (`overnight.test.ts:429–496`); cross-week rest (`weekctx.test.ts:85–110`); and late-show ring behaviour (`brieftime.test.ts:177–213`).

I did not find dedicated assertions in the inspected suites for repeated specific-line precedence, incidental matched names versus genuinely unknown names, multiple formation names paired with different clocks, or wide-line raw minimum versus date-normalized minimum around midnight. Parser tests establish adjacent pieces, not these complete downstream combinations. No new pass count is claimed.

**Disposition for the Rally plan**

Preserve the current free-text/callsign behaviour as D500 requires, but do not call it semantic recognition of attendees. The next design must explicitly reconcile multiple specific stage lines, wide/specific stage precedence, date resolution and missing/equal stages. D501 does not settle those merely by approving one operative clock per line.

The spec correctly keeps these choices pending and warns about names in remarks. Its “same resolved reporting instant” wording should be read as shared input to consumers, **not** a promise that work hours, crew rest, SANS, wave bands and OIL acquire one identical anchor.

No build approval and no approval of my own design is supplied. Rulings: none added; this is an audit of current behaviour.

## Full Astra writer correction/addendum — 2 Oct 26

Correction/addendum to my original audit:

1. **The daytime brief example is a direct-model limitation, not a reachable normal-editor defect.** I should have included that distinction. `src/engine/slots.ts:338–384` refuses an entered B later than daytime TO; moving TO earlier clears the stranded B, explains why, and records the change. Both board editing (`src/ui/board.ts:1195`) and inline editing (`src/ui/textedit.ts:79`) use this path. Small-hours previous-evening briefs and standalone exceptions remain allowed. `audit-c-times.test.ts:89–92` explicitly qualifies its direct assignment, while `audit-c-briefguard.test.ts` covers refusal, no pending change on refusal, visible clearing, overnight acceptance and preservation of the brief-conflict warning. D502 extends reporting-stage validation; it does not introduce the app’s first chronological guard. How its saveable-invalid-draft direction interacts with these existing brief guards still needs deliberate scoping.

2. **Normal formation callsign edits do not rewrite in-time strings.** `txtRef` resolves `ff:…cs` directly to the formation field (`slots.ts:303`); `txtSet` updates that field and records the change (`slots.ts:359`). It has no accompanying rewrite of `w.intimes`. Because scope is resolved against current formation names, changing VL to XX while retaining `10:00 VL IN TIME` can make that line wave-wide if no other current formation matches VL. Another matching name in the line can produce a different scope instead. This is existing text-based retargeting behaviour, not stable attachment to a formation identity. Rally planning must account for it; a rename-safe interpretation is not already implemented.

Scope: source and existing test definitions inspected; no tests rerun, no edits, no approval of my own proposal. Parent’s new runtime results are separate evidence and should remain attributed to Sol.

Rulings: none added.

## Sol disposition of the audit

Adopt the source findings as current-behaviour evidence, with the above writer correction; do not treat Astra's static audit as a browser check. Sol's actual-editor observations reproduce the scope/clock/stage/midnight cases and publication lifecycle in `2026-10-02-in-time-behaviour-audit.md`, which records 317 + 93 existing tests in separate watched runs and 18 named browser checks. Three final pictures and two diagnostic pictures opened. The initial memory-backend reload failure is retained, explained and rerun on normal persistent storage without weakening its assertions. No live app defect fixed or Rally source written. Clarified two impact-map sentences to preserve distinct consumer anchors. Existing negative-hours backlog remains next; all unapproved stage/date/remarks choices remain unapproved.

## Full Astra capped read of Sol's audit/evidence — 2 Oct 26

Capped independent read completed. No material contradiction in Sol’s behaviour summary or the revised consumer map. One evidence-label correction is needed: **410 is the reported number of passing test cases, not individual assertions**. The supplementary log records “Tests 93 passed”; individual tests contain multiple assertions. Use “410 existing tests across 18 files” in the spec and retention summary.

Verified:

- Final JSON contains **18 passing named checks: 13 desktop and 5 phone**, including one browser-error check per viewport; `failure` is null.
- The driver supports the reported scope/clock cases, actual publication/amendment routes, pending-versus-issued isolation, and persistent reload checks.
- The retained diagnostic records the original reload failure (`360 !== 465`). The final driver removes the memory-only URL selection; `storage/boot.ts:57–74` confirms why that selection prevented persistence. The explanation does not claim an application fix.
- Revised impact-map language preserves the distinct crew-rest, work-hours, SANS, ordinary busy-window and OIL meanings. It incorporates the existing brief editing guard and correctly labels callsign-renaming behaviour as source-derived, not walked.
- Limits explicitly exclude FULL certification, physical Safari, complete role/gesture coverage and Rally implementation or approval. Pending product choices remain pending.

Evidence limits: I verified the retained **93-test/3-file** supplementary output. The **317-test/15-file** first-run result and fresh-build success remain Sol’s watched-run report; their raw output is not in the inspected evidence directory. The browser Insights checks establish visible content changing or remaining unchanged, not independently calculated expected work-hour totals. No stronger numerical-correctness claim should be inferred.

I did not reopen pictures, rerun tests, edit files, or approve my original audit/design. This read concerns Sol’s summary and evidence claims only.

Rulings: none added.

Sol disposition: terminology corrected to tests, with no count change or rerun. Retain the evidence limits: first primary suite/build success are Sol-watched outputs; supplementary log and final JSON were read by Astra; all pictures were opened by Sol only. Insights runtime comparison proves the copy/visibility transition, not independent expected-hour arithmetic. No stronger FULL approval is claimed. D500–D502 are unchanged.

## Astra — D503 and compact display, 2 Oct 26 (complete response)

D503 short/full meaning check passes. Both record the immediately preceding day, maximum one day back, and removal of the routine interpretation line/manual day control. The full ruling and revised spec preserve D500–D502, other checks and unresolved stage choices; production implementation remains explicitly pending.

The compact mock passed local Chromium checks at **736px/light** and **320px/dark**. I opened both pictures: exact legacy text retained, no interpretation line or day buttons, no clipping or horizontal overflow, and no JavaScript errors.

One documentation qualification: the spec’s mock section still calls the older `rally-reporting.html` the current recommendation. Mark that as the earlier interaction prototype and link the new compact preview as the D503 display reference, so its explicit-day demonstration is not mistaken for the current design.

Pictures saved in the thread visualization directory as `rally-day-automatic-astra-736.png` and `rally-day-automatic-astra-320.png`. No app build, tests or document edits; this verifies the display, not date-resolution implementation.

Rulings: D503 verified; none added.

Writer follow-through: retained the new source and both reviewer-opened pictures under `docs/img/rally-time-proposal/`; the spec now labels the older interaction prototype historical and links the D503 display reference. No production source change or new application-test claim.
