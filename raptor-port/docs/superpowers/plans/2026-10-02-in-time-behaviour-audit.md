# Existing in-time behaviour audit — 2 Oct 26

Owner asked why the whole existing in-time flow had not been checked before Rally recommendations. The earlier 18-test check established the parser, not the complete feature. The design's impact table was a map of seams to investigate, not proof that every consumer had been verified. Sol accepts the investigation was under-scoped and completes this bounded behaviour audit before further design. No new product decision, source change, Rally build approval or change to checking guides.

Baseline: app source on `codex/discard-marks-remove`, HEAD `3e0970259cd5b6564c53dddc448d210c2dc1ae3d`; freshly rebuilt locally. The audited events, validation, availability, Insights, text editor, board and export sources compare identically with `claude/planning-filing-3-oct` (planning HEAD before filing: `fcd45100`). Source remains untouched. Astra independently read engine semantics; Sol traced editing, storage, issued copy, exports and checked the actual editor. Original response and writer correction are retained in `2026-10-02-rally-time-review.md`.

## Scope and tier

NONE for this change: documentation/evidence only. All eight change questions are NO: no money/entitlement logic, published-record writer, storage shape, shared renderer, gesture/mode, surface, permission or warning rule is changed. Supplemental existing-behaviour tests and a targeted real-app audit were run to answer the owner; this is not a FULL certification or a Rally release check. Any Rally build affecting warnings/publication will require FULL under the standing order.

## Current input interpretation — source read and actual editor cases

| Input / action | Existing result | Consequence for Rally |
|---|---|---|
| `10:00H: FIRST WAVE VL IN TIME + WX/NOTAMS` | A bounded, case-insensitive match to VL in this wave scopes that line to VL. | Existing free text works; retain D500. |
| No own-wave callsign | Supplies a wave-wide fallback. | An unknown name is not refused: it may become wide. |
| Wide 07:00 plus named VL 08:00 | VL 08:00; RU 07:00, independent of line order. Wave heading shows 07:00. | Heading and every individual's report are different readings. |
| Named VL in-time 07:00 plus named VL Rally 08:00 | Last named line wins; reversing lines changes VL's report. IN TIME / RALLY are not stage labels to the reader. | The requested earliest applicable stage needs actual logic; a rename alone cannot supply it. |
| `07:00 IN TIME — coordinate with VL` | VL only, including a name in remarks. | No general understanding of attendee versus organiser or incidental name. |
| `RU 07:00, VL 08:00` | Both formations get the first valid clock, 07:00. | One operative clock per line (D501) prevents this ambiguity; no clock/name pairing exists. |
| `07:00 reference note; report 08:00` | 07:00 wins. | First valid clock is not first clock semantically called report. |
| Invalid clock or TBD, no valid instruction | Ignored by the current parser; individual flying event falls back to step. | Future invalid-input feedback must distinguish absent versus malformed (pending implementation). |
| 23:00 before TO 01:30 | Rolls to previous evening under configured report-lead condition. | Existing bounded day recognition exists. |
| Wide 23:00 and wide 01:00 before TO 01:30 | Raw-clock minimum picks 01:00 before date adjustment. | Earliest actual instant across midnight is not implemented. |
| Change formation VL to XX, leave text naming VL | Text is not rewritten; if VL matches no current formation it becomes wave-wide. | Source-derived retargeting risk; this rename combination was not driven in this walk. |

Source: `src/engine/events.ts:208–280,580–595`, `src/engine/slots.ts:303,359`. Compact 3-digit numbers also qualify as clocks (`100` becomes 01:00); formatting rewrites accepted clock tokens without giving prose a new meaning. Dedicated existing parser tests cover its grammar/format invariants. Runtime observations are in the retained JSON, not assumptions from the mock.

## Consumers and lifecycle roll-call

| Consumer / door | Actual existing behaviour | Evidence / limits |
|---|---|---|
| Edit Schedule and Scheduler Board | Shared per-line editor; colon formatting; Enter/blur commit; Escape restores; clearing removes line. Scheduler permission checks precede writes. Add/remove uses shared command path. | `ui/textedit.ts:104–151`, `ui/interactions.ts:717–787`, `ui/html.ts:1183–1197`, `ui/board.ts:148–179`; focused editor/board suites, board desktop/phone operation. Escape covered by existing tests, not newly driven. |
| Individual flight | Explicit scoped in-time, otherwise TO minus step. Brief is separately typed/default. | `events.ts:365–383`; real editor reads of production event construction. Do not describe ordinary blank in-time as invariably TO minus reportLead: workSpan's fallback is normally bypassed by this populated report. |
| Work hours / long day | Report through landing plus debrief, combined with the person's other scheduled events. Personal Inputs alone are not EVD work hours. | `validate.ts:139–160,959`; existing Insights/work-hour suites. The already-filed negative-span fault stays next under D495. |
| Crew rest | Earlier of explicit in-time and typed/default brief, with an earlier qualifying commitment for that person; qualifying timed Inputs have a separate contribution here. | `validate.ts:460–518`; duty-rest/brief/SC/cross-day/cross-week suites. An earlier event does not move everybody in the wave. |
| Ordinary busy/absence conflicts | Step to dekit; brief/debrief checks separate. Reporting does not widen every window. | `events.ts:417–421`, `avail.ts:245`; source read. |
| SANS picker and warning | Earlier of report and step through dekit, shared report resolver; a late report cannot shrink occupied time. | `avail.ts:264`, `validate.ts:1243`; existing SANS suite. |
| SC / spare / AVALON / BB | SC typed B outranks wave strings; MAIN rest/work start clamps no later than shift start. SPARE excluded from ordinary event stream; other standalone exemptions persist. | `events.ts:275–280`, `validate.ts:720–732`; existing SC suite; no new SC live walk. |
| Late show | Does not move/remove crew-rest breach; can change ring to dashed when rest clears by step and no earlier commitment binds. | `validate.ts:466–477,542–555`; brief suite. An explanatory comment beside lateShowOf is not authoritative over this logic. |
| Cross-day/week | Previous-evening report/brief use separately bounded lead conditions. Landing may roll forward. Adjacent input tails and Sunday/Monday checks read the same buildDay. | `events.ts:275–280,365–370,522–563`, `weekctx.ts`, `validate.ts`; existing cross-day/week suites. No physical calendar-week gesture proof in this audit. |
| Heading / available-crew bands / Auto sort | Heading is raw-clock minimum over every line, else earliest TO; bands sort on that value. Actual formation/wave Auto sort uses TO. | `events.ts:580–595`, `avail.ts:87`, `reorder.ts:312,362`; heading observed. Do not conflate bands with Auto sort. |
| Earned leave / OIL | Nominal TO minus reportLead through landing+debrief; SC shift hours separately. Does not use typed flight in-time. | `oil.ts:219–222`; source read, no new money run. Keep separate unless owner explicitly changes it. |
| Pending / published / Insights | Draft timing moves visible Insights at once. Once published, pending timing edits clear signatures and move working report, but issued View-only Sched and Insights retain issued value. Amendment then moves Insights; reload retains amended text. | `publish.ts`, `validate.ts:1683–1705`, `insights.ts:14–39`, `ui/html.ts:111–168`; real signature/publish/amend/reload routes and published-Insights suite. D478 and D482 remain distinct. |
| History / Undo / save / copy / templates | String array belongs to day snapshots and `it:` diffs. Commands, day clones, whole-wave template copies and week stash retain it without extra Rally storage. Normal edits are logged. | `restore.ts:68`, `state/sched-commit.ts`, `state/history.ts:60`, `state/store.ts:449`, `drafts.ts:238`, `daytpl.ts:100,244`; editor, publish, week-stash, draft and template suites. Undo/copy/template gestures not newly walked. |
| CSV and Print/PDF | Resolve issued days, but flatten formation rows; neither currently includes in-time lines. | `ui/export.ts:59–91`, `ui/printpdf.ts:119`, `ui/Shell.tsx:540`; export-published suite. A rename cannot add reporting instructions to these outputs. No download/PDF rendering in this audit. |
| Existing chronological editor guards | Daytime B after TO is refused. Moving TO earlier clears a stranded B with explanation; overnight/standalone exceptions exist. In-time strings bypass that time-cell guard. | `slots.ts:338–384`, both editor callers, dedicated brief-guard tests. Astra's original direct-model example needed this writer correction. D502 must deliberately scope new report-stage feedback without silently removing existing B guards. |

## Checks actually watched

- Fresh production build passed. PC-wide lock held for primary test/browser work and released afterward.
- First run: 317/317 existing tests across 15 files: in-times, brief/late-show, duty rest, SC in-time, SANS, cross-day/time, cross-week, Insights, per-line editor, board, issued Insights, export issued-copy selection, week stash and publication command. Vite/React test-environment warnings appeared; no failed tests.
- After examining the existing brief writer, ran 93/93 additional existing tests across 3 files: brief guard, day templates, drafts. Raw supplementary output retained.
- Targeted real browser: desktop 1440×900 and phone 390×844, 18 named checks (13 desktop including error check, 5 phone including error check). Zero browser errors. Functional scope/clock/publication cases run on desktop; phone separately operates editing/add/remove/reload. This is Chromium viewport proof, not physical Safari or a full short-height audit.
- Three final distinct pictures: desktop scope/header, issued schedule during pending amendment, phone editor; all opened by Sol. Two earlier diagnostic pictures also opened.
- Initial reload assertion failed because the harness selected `?fresh=1`, which intentionally uses MemoryBackend (`storage/boot.ts:57–74`). Diagnostic results/pictures retained. Corrected the fixture to normal browser-backed storage in new isolated contexts; unchanged reload assertions passed. No application fix or test weakening.

Evidence: `docs/img/in-time-audit/` contains final `walk-results.json`, three final PNGs, `guard-copy-tests.log`, and `diagnostic-memory-backend/` with the first results/two PNGs. Driver stored alongside results; it only writes through actual controls and uses the local bridge for observations. No user browser store was edited.

Walk: targeted existing-behaviour audit · 3 final pictures · 4 surfaces (board, Edit Schedule navigation, issued View-only Sched, Insights) · 18 named checks · no Rally release claim. NOT DONE: whole-app FULL gates, full role matrix, physical-device/short-height, Undo/copy/template/week-switch gestures, export download/print, SC live scenarios. Those remain in the future build's FULL matrix where affected.

## Disposition

The feature is feasible to plan, but current text recognition is deterministic matching, not general understanding. The mock must not be used to certify current scope, earliest-stage selection or midnight comparison. Preserve explicit per-consumer meanings; reconcile stage precedence, date resolution, missing/equal stages and remarks scope before building. Show interpretation as a recommended UI direction, still awaiting final design approval. D500–D502 stand; overnight question remains unanswered. WORKSPAN-NEGATIVE stays next. No new ruling or working-guide edit from this audit. Claude's independent plan/build reads remain owed after Monday 5 Oct 26, 19:00, before main.

Independent capped read of Sol's summary: Astra found no material contradiction; corrected the label to passing test cases rather than assertions. It verified supplementary 93-test raw output and final JSON/driver, not primary suite/build raw output or pictures. Primary 317-test/build success are Sol's watched-run report. All pictures opened by Sol. Browser Insights comparisons prove visible copy transitions, not independently calculated expected-hour totals. Complete read/disposition retained in the Rally review log.
