# Rally review fixes — independent Astra inspection 2, 3 Oct 2026

**PASS for the approved A–F/D2 scope on snapshot2.** R1 is repaired; R2's missing distinct runtime proof is supplied and its availability limitation is explicitly characterized and filed. No further concrete failure requiring a source repair was found in this read. This is the sole fresh post-repair inspection under D496, not approval for main, merging, release, or a new availability policy. The owner has not accepted the result. Claude's further reads remain owed.

Sol authored the implementation. This fresh Astra inspector did not plan or build it, run application gates, drive or mutate the app, or change source/Git. I independently read the changes and evidence rather than adopting inspection1's conclusions. My only written artifact is this report. Preserve it unchanged. The host explicitly announced the evidence frozen before this verdict; later source/test/bundle changes spend this read, and the two-read cap is exhausted rather than silently reset.

## Exact snapshot and independent checks

- Branch `codex/rally-workspan`; reviewed base/HEAD `8002699d7c4965b2d9b41e2ac83c0ef73b5e9f9d`.
- Source/e2e group SHA256 **9a33a3787b9d65d772f916035ffa908ba54b5a9589c1c63b4d23b838bc2e6b08**; bundle group **00c048577dc94d1352f8f99f1c96682f16760c03ffb9c94e1c175e36a61d4185**. Independently hashed all **781 source/e2e** and **19 bundle** files and recomputed both ordered JSON group hashes: zero mismatches, including a second verification after the reads.
- All **90 changed source/e2e paths** are covered by the manifest and read. `source-snapshot2.zip` has 92 entries, including all 90 changed files, each independently matching its manifest hash. SHA256 **4B198181B90D82694A20697474846573BB08F6949C64AF7DD267A5D9606F26C8**. The current `source-snapshot.zip` is byte-identical.
- Compared every source entry with snapshot1: only `src/ui/scheduler.css` and `e2e/geometry.spec.ts` differ. The first contains the local header wrap repair; the second adds its four viewport regressions. No functional source changed after inspection1.
- Immutable [inspection1](2026-10-03-rally-review-fixes-inspection-1.md) independently retains SHA256 **B3A3F7D570DE460E8D6674C7D91C324E886E3F79D1117B299B4D69F50877D5C7**. Its original portable archive independently retains SHA256 **CD577A0182091AA02B46CDDA99D872D74A61B3197BA3F65F91609DE94C6A31C3**.
- Final [portable snapshot2 evidence](../../handpass/2026-10-03-rally-review-fixes-evidence-2.zip): **13,741,702 bytes**, SHA256 **4101CD55321815B1BF0FA9F54463D66082EEE9FF7637FDD5FC861C6675A4F170**. Independently opened its 239-entry directory: 69 PNGs and all 19 final bundle entries, with zero bundle hash mismatches. Raw drivers, retained failed attempts, results, worlds, source snapshots and opened-picture ledger are included. The incomplete packing attempt is disclosed in the sheet, not treated as final proof.
- Read the completed snapshot2 section of [the evidence sheet](../../handpass/2026-10-02-rally-workspan.md). Independently checked every hash in the host's 69-picture ledger against the saved PNG: zero mismatches. Its claim that Sol opened all 69 is the host's recorded inspection; my separate 23-picture selection is listed below.

## Initial findings: exact disposition

### R1 — closed: constrained Board header

The original landscape failure is real: the summary was 29.92×117px, with Line/Wave clipped and failed hit tests. Tablet was 114.11×39px. The repair adds `flex-wrap:wrap` to the existing header and `flex-shrink:0;max-width:100%` to its summary. It permits the summary and existing controls to wrap without changing the buttons' dimensions. There is no new layout system or unrelated source repair.

The four new regressions check text geometry, overflow, every header button's bounds and actual centre hit. Corrected genuine RED is 2 failures/2 passes; the preceding duplicate-field locator failure is preserved and distinguished. Post-repair geometry/warning tests are **161/161 PASS**. Runtime measurements at 1440×900, 390×844, 844×390 and 1024×600 all show the complete summary at **233.34×13px**, zero header overflow and every control inside the header with its own hit target. I opened the original landscape failure and all four repaired views. The cue is readable and the controls are reachable.

The actual formerly clipped Add, Line and Wave controls were then operated, each followed by exact-data Undo. Same-day 09:00 remains without a previous-day suffix; issued 22:00 retains the date cue and exposes no edit controls. These six action/state checks pass without browser/page/HTTP errors. I read the driver/results and opened both state pictures. This closes the demonstrated failure, unlike the first supplement's rejected text-presence/Add-only claim.

### R2 — closed as an evidence gap; availability scope remains explicit

The repaired production bundle was used for distinct I1–I3 routes, with isolated saved UI-created worlds. I read the driver and raw results, not only the handpass totals.

| Required surface | Actual evidence and conclusion |
|---|---|
| I1: existing Insights view | Tuesday's 22:00 previous-day report gives 15h00. Issued weekly hours are 21h40. Editing the working report to 21:00 makes Tuesday 16h but leaves issued Insights at 21h40; actual AL raises the visible week to 22h40, exactly +60 minutes. Changing future default words leaves existing reporting and hours unchanged. Five checks pass in downstream-01 before a separately retained I2 harness failure. Both graph pictures were opened. This tests the existing view, not the future Insights feature. |
| I2: actual Inputs, picker and accepted placement | Monday PM Fly for Kraken alone leaves Tuesday's picker at “no availability filed for today”; an accepted placement has no persistent SANS_AVAIL under the existing no-offer rule. Tuesday AM Fly produces the 00:00–12:00-only gate and an accepted placement retains its advisory against report −120 through dekit 690. The actual empty added-aircraft seat is used and undone. The two date-specific offers are not combined. Downstream-07 proves both routes; all three pictures were opened. |
| I3: actual issue, Leave War and earned record | Saturday TO12:00/LD13:00 with reportLead180/debrief120 gives nominal 09:00–15:00, 360 minutes, HO* and an actual +0.5 earned entry. An earlier actual report and AL leave that nominal basis unchanged. Changing the numeric lead to120 then issuing gives 10:00–15:00, 300 minutes, still HO*/+0.5. All three earned-entry pictures were opened; the displayed spans match the raw assertions. The unchanged unit contract separately pins 360→0.5 and361→1. |

Downstream-07 has ten passing checks and no browser/page/HTTP errors. Downstream-01's five I1 checks are retained staged coverage, not a claim that its subsequent failed I2 attempt passed. Other failed date-representation and occupied-seat harness attempts are preserved. None required an app change, a forced click or synthetic replacement of availability data to claim a passing route.

`[SANS-PREVIOUS-REPORT-OFFER]` is now in the backlog and its priority list, with caps/ops under D490/D495. It accurately records the prior-date limitation, including the absence of a persistent advisory for the prior-only offer, and requires owner policy/design before a repair. This closes R2's demand to observe and disposition the distinct surface; it does **not** certify cross-date availability support, declare the limitation harmless stored data, or infer an owner waiver. A–F/D2 did not authorize a new availability policy.

## Independent source and contract coverage

Read HANDOFF's newest Claude block first; actual AGENTS and mandatory rule files in order; project guide; scheduler/OIL/People/Leave War rulings and applicable full rows; executor, workflow, bug-check order, backlog, approved brief, independent plan and Sol challenge, inspection1, and final appended evidence. D509–D511 govern the work; D496/D499 govern independence and proportional proof. No protected working guide or reference source changed.

Every changed production and test/e2e hunk was inspected. Forty-seven unit files were also checked mechanically for only the exact retired-helper import/call/comment removal; mixed files were read for their additional changes. All six changed e2e paths were covered. The two helper definitions remain explicitly historical, with no executable consumer.

| Scope | Final conclusion |
|---|---|
| A: publication | Three engine timing refusals and the command preguard are removed. Sign-off, authority, publication and OIL controls remain. REPORT_ORDER still selects hard warning severity and freezes with the issued snapshot; it no longer gates issue. Real original/AL/correcting, hide/restore, old-version and read-only paths are represented. |
| B: suggested brief | Missing/unparseable typed B uses suggested-brief wording via the existing parser. Typed B retains brief wording. Chronology comparisons, malformed-note advisory behaviour and exemptions remain. |
| C: demo/parity | Exactly 13 week1 and5 week2 clocks change to their own TO−180; words and already-valid clocks stay. Strict parity receives identical reporting inputs, with no reference edit, broad filter or relaxed comparison. Invalid authored cases remain. |
| D: mint clock | Existing resolved reporting wins; otherwise earliest uncancelled valid TO minus the configured lead supplies the clock. No valid TO stays text-only. The global wave fallback is unchanged. |
| D2: settings | Separate text spec/default/normalizer replaces newlines, trims, caps60 and defaults empty strings; stored nonstrings are rejected. Numeric keys retain finite/range validation and own-key lookup. The optional string uses the existing rules record and settings capture/restore/reset-before-overlay/write route. Admin editing and escaped editable/read-only values remain. Literal later clocks do not replace the first minted clock. |
| D2: presentation | Text-only Logic CSS makes the new field and long read-only text usable without changing numeric widths. Actual controls, reset/Undo/Redo and reload/new sign-in are covered at both widths; malformed stored types/snapshot permutations are declared unit proof. No dedicated export UI is invented. |
| E: dated wording | Shared signed clock formatting adds the correct day cue. Rest overlap states a positive duration against the actual duty-end date. The source-frame leave-by uses source.restIndex or source.di without changing arithmetic, warning identity or trace. Header repair disposition is R1 above. |
| F: contracts | Current grammar, activities, first clock, immediate rally, scope, earliest duplicates, previous day, warnings, legacy RALLYING and ring-only Late Show are documented. Historical grammar/formula claims have explicit supersession. No earned-credit or Late Show policy changed. |

Fixture changes preserve their tests' purpose: explicit reporting for brief-driven crossday and late-report SANS; compact personnel sorties isolate the flying exemption; corrected demo trace clocks; next-day midnight wording; competing LONGDAY retained in hide tests; forward tight-only authored separately. They neither weaken comparisons nor restore a silent fixture precondition.

D489 tidiness note, changed non-engine lines only: the text setting fits the existing rule-spec/Logic responsibility; no feature-only branch was inserted into an unrelated shared flow; existing parser, save/reset and settings helpers are reused. No concrete new tidiness finding is filed, and no restructuring was performed during inspection.

## Proof retained and limits

Read raw gate outcomes: final units **7627/7627 in479 files**, reference **728/0**, full browser **518 passed/49 existing skips**, Tracker **445/0**, build/rulecheck/docsize PASS. Fifteen deliberate disconnected wires went RED and passed after restoration. The broad browser/Tracker run precedes the narrow Logic field-width repair, and all broad gates precede R1's CSS-only repair. The later31 focused Logic tests, fresh walks, final161 affected browser tests/build/rulecheck, exact-bundle six adapted probes and performance **4/0** cover those later changes. This is the D499 scoped sequence, not a claim that every broad gate reran after the final CSS byte. No ceiling widened: week5131≤5450, Board1018≤1150, day isolation held and scroll400→400.

The original main walk and supplement retain their failed harness attempts and successful stages. The first short-screen “readable” label is superseded by R1's measured evidence. Print/CSV source and actual results confirm flying-row exports without a reporting/header/hide field; the plan corrects that mistaken assumption. The CSV retains16 columns. Both A4 portrait PDF pages were independently opened with readable rows/page breaks and issued-versus-working selection asserted. No export expansion is needed.

Independently opened **23** saved images at readable resolution under `docs/img/handpass/2026-10-03-rally-review-fixes/`:

- `header-width-red/landscape-previous-day-header.png`; all four `header-width-green/{desktop,phone,landscape,tablet}-previous-day-header.png`.
- Both `header-actions/{same-day-header,issued-previous-day-header}.png`.
- `logic-width-green/phone-long-readonly.png` and `desktop-custom.png`.
- `walk-04/{phone-issued-wrong-pair-preview,phone-hidden-warning-AL,phone-previous-day-week,phone-suggested-brief-mint}.png`.
- Both `supplement/issued-page-{1,2}.png`.
- Both `downstream-01/{I1-issued-work-hours,I1-amended-work-hours}.png`.
- `downstream-07/{I2-prior-date-picker,I2-target-AM-picker,I2-target-AM-placed,I3-earned-360,I3-actual-report-credit-unchanged,I3-earned-300}.png`.

Malformed storage, no-TO/cancelled/older-source and exact pre-drop variants use named unit/disconnection evidence, not invented browser coverage. Physical Safari/native phone week navigation and49 browser skips remain unproved. Guest gets no changed entry door and relies on unchanged authorization regressions; actual member read-only UI is covered. Previously filed first-crew hint and palette/topbar overlap retain their dispositions, alongside the explicit SANS follow-up. These limits are not universal approval or owner acceptance.

**OWED: Claude's read after the reset — codex/rally-workspan:** FULL independent walk, code/scenario/plan reads, blind walker trial and working-guide reads after Monday5 Oct2026 19:00, before main. No main push, merge, PR for merging or Insights build is authorized. The two Discard leftovers remain a separate subsequent job. Host must retain this report and run the document check after its final status/handoff updates; this inspector ran no application gates.

Rulings: none in this inspection; D512 remains next.
