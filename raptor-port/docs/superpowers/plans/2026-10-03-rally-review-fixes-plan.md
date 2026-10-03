# Rally review fixes — implementation and independent scenarios

3 Oct 26. Astra planning/scenario artifact for Sol's independent challenge under D496.
This is a plan, not a report of tests run or approval of any code.
Authority: `../briefs/2026-10-03-codex-review-fixes.md`, fixes A–F including D and D2;
D509–D511 prevail over D502's publication block and the superseded brief-time mint.
Baseline supplied by host: `codex/rally-workspan`, fast-forwarded to `8002699d` from
`origin/claude/codex-review-3-oct`, clean before work. Host verifies the actual ref.
No new product decision is needed. Next ruling number remains D512.

## Scope and independent challenge

Implement only the approved fixes. Preserve the Reporting resolver's formation-only grammar,
per-activity scope, earliest resolved duplicates, previous-day interpretation, equality and
standalone exemptions (D497–D507). Preserve live inline feedback, warning anchors and headings.
No new parser, person targeting, publication policy, storage service or settings key outside
the existing rules record. No main push, merge, PR for merging, Insights feature work, or
working-guide change. Claude's FULL check and reads remain owed after the reset on this branch.

Read before implementation: AGENTS and the latest handoff; all six mandatory rules; project
guide; scheduler, OIL and People/account rulings and applicable full rows; executor; checking
order; Codex workflow; approved brief. The planner read these and the affected source paths.
Read Leave War's area rules before opening or altering its tests for fixture cleanup. Read
the relevant reference-document sections and gate traps before those actions. This plan is
to be independently challenged by Sol, never self-approved by its Astra writer.

The following decisions are technical implementations of the approved brief:

1. The week currently has no derived report clock in its wave header; Board does. Add only a
   compact previous-day clock/marker beside the week wave label when the resolved report is
   negative. No new routine same-day interpretation line or day control (D503). Board uses
   its existing summary. Do not rewrite the raw reporting strings to add display wording.
2. Reuse `stated` in reporting as the one signed clock formatter, with a short suffix option
   for headers. It formats a number in the caller's stated day frame; it never moves dates.
   `first`/`instructed` use the target day's frame; existing `leaveBy = first + 1440 - crewRest`
   uses the preceding reference day's frame. Preserve arithmetic. A trace attached to an
   older actual source date must state its anchor correctly; do not append "previous day"
   merely because a value originated on an earlier source date.
3. D510's seed correction covers the 13 offending week-1 formations and five week-2
   formations. Preserve already-valid seed clocks, all non-clock words and all other data.
4. For D2 use one explicit text-kind spec entry (proposed key `reportText`) inside `VCONF`
   and `RULE_SPEC`, stored under existing `rules.v`. Use a 60-character cap. A shared text
   normalizer replaces line breaks with spaces, trims, caps, then falls back to the default
   when empty. Treat stored non-string values as invalid/default, not String(object).
   Numeric settings retain their number validation unchanged. No new permission entry.

## Risk tier and roll-call

| Standing question | Answer and reason |
|---|---|
| 1 Earned entitlement/presence | YES — changed publication doors and the shared nominal report setting meet existing OIL consumers; prove unchanged actual-versus-nominal meaning |
| 2 Published record | YES — first issue, amendments, correcting issue, issued warnings, hides and Undo |
| 3 Saved data | YES — new text value in the rules record and its reset/restore/Undo/export paths |
| 4 Shared drawing | YES — reporting/header/warning/trace strings on several surfaces |
| 5 New gesture/control | YES — free-text Logic input; existing mint button's result changes |
| 6 New surface | NO — existing Logic setting row and existing schedule headers only |
| 7 Roles | YES — new editable input must inherit Logic's existing admin gate at every layer |
| 8 Warnings | YES — nonblocking red warning, suggested brief wording and signed-time text |

FULL for the complete batch, with one final broad gate set and targeted checks between fixes.
Expected total is the standing FULL range of 3–5 hours plus implementation/defect repair.
The table below is required coverage, not an assertion that it has passed. Host records actual
has-it / must-not-because / MISSING results and pictures in the existing evidence sheet.

| Surface/consumer | Visible requirement / usable door | Roles and overlays | Proof |
|---|---|---|---|
| Logic editable/read-only | Time and text settings adjacent; hint says first clock wins; Edit rules, commit, Done, reset, Undo/Redo | Admin edits; member reads; guest keeps existing page access; modified badge, search/filter, long literal value | L1–L4 |
| Edit Schedule reporting box/header | Add fills configured clock/text; typing retained; negative header says `(prev day)`; inline pair says suggested/typed brief correctly | Admin; warning anchor, change mark, gold history dot, long wave label | M1–M4, T1–T3 |
| Board reporting box/header | Same add writer and text; existing summary says `(prev day)`; buttons/caret remain reachable | Admin; full-screen bar, controls, pucks, warning chips and AL tags | M1–M4, T1–T3 |
| View-only Schedule, current issued and working draft | Same reporting text and previous-day header marker in correct world; no editing control | Admin/member; guest existing read-only restrictions; issued tag and rings | P1–P4, T3 |
| Issued-version look on week and Board | Historical text, warning and hide state; negative marker reflects viewed snapshot | Admin/member according to existing gates; preview banner | P2–P4 |
| Day warning list on week and Board | Red order warning persists, can jump/hide/unhide; previous-day and overlap wording readable | Admin full actions, member read-only; guest no new warning door | P1–P4, T1–T3 |
| Crew pucks and trace rows | CR/LD rings and chips correspond to shown warnings; leave-by/puck tooltip carries correct date frame | Week/Board/view/issued; selection/own-person/AL/history overlays | T1–T4, P3 |
| Pre-drop crew warning / picker | Same resolved report and relative-day text; normal placement still validates | Admin; existing first-empty-formation limitation declared | T2, T4 |
| Print/PDF schedule | Issued content and negative header marker; hidden warning flags follow issued hide state | Existing print routes; page breaks and narrow label | X1 |
| CSV schedule export | Preserve format and issued-content choice; it has no reporting/header column today | No fabricated claim that it exports a report clock | X2 |
| Settings storage/snapshot/exports | New text travels with existing `rules` record, reset and restore remove stale overrides | Same settings command/permission seam; no separate store | L3–L4 |
| Insights, hours, long-day | Actual report gives nonnegative span; issued content versus live Logic semantics retained | Same Insights doorway, no new Board button | T3, I1 |
| Availability, busy windows, SANS | Actual report consumers retain resolver; busy windows stay step/dekit; prior-date SANS gap explicitly evaluated | Slot picker and accepted placement; named SANS crew | I2 |
| OIL and Leave War result | Actual text/report does not replace nominal reportLead; published grant unchanged until allowed publication route | Read actual earned credit, no new OIL policy | I3 |
| Next-week peek | Reporting controls must not appear: inert planned-programme-only surface; identify whether header consumes report | Same current peek contract; no unsolicited issued-peek work | T3 negative control |
| Tracker / unrelated calendars | Must not gain reporting UI; no changed data route feeds Tracker | Existing smoke and full regressions cover unrelated seams | Gates; no bespoke new Tracker walk |

## Implementation sequence — red before each fix

### A and B: publication and brief wording

First make the replacement expectations in `state/rally-publish.test.ts` fail against the
unmodified source. Cover all three engine doors and the command-layer publishing route;
first publication, AL issue and correcting reissue succeed with an order problem. Assert
the hard warning in the working list and stored issued warning bundle, not merely a truthy
return. Assert no Cannot-publish toast. Other guards (role, sign-offs, OIL coverage) remain.

Remove `publicationTimingOK`, its three calls and required early return exactly as the brief
states; restore `const {sign,count}=alIssue(di)`. Remove sched-commit's timing parameter and
import/call-site argument. Either preserve `blocking` only as the hard/adv severity selector,
or rename it to `hard` throughout the small reporting consumer set; prefer the rename if it
has no unrelated impact. No remaining reader may use it to refuse publication. Search old
toast and blocking text across source/tests and live contracts; historical reports stay intact.

B's red tests contrast `br:''` (and unparseable br, per exact `parseHM` rule) with typed B:
`VL: in-time 12:00 is later than suggested brief 10:20.` versus `brief 10:20` when typed.
Change only the stage name. Equality stays allowed, malformed reporting stays advisory.
Update RT6 and the named live contracts/backlog entries in the same change.

### C: fresh seeds and faithful parity

Add a fresh-seed test for each authored week before source edits: zero REPORT_ORDER must
fail with 13/5. Assert clocks are take-off minus 180 for the exact corrected formations, and
assert every original non-clock word remains. Use pristine data/default rules, never the
validReportingFixture precondition in this test. Correct only those 18 clocks.

Reference files remain byte-for-byte untouched. The UI parity harness already projects the
port's reporting strings into the reference before validation; extend the identical-input
approach to engine parity. Compare both engines' events, existing warnings/marks, REST/EVD,
seed structure and HTML with all existing strict comparisons retained. Do not add broad
normalizers, omit minutes/marks, lower counts or remove assertions. Keep positive tests for
Rally-only differences. The former 13-invalid-seed assertion becomes the explicitly approved
zero-warning seed assertion, with a separate authored invalid case retaining hard-warning
coverage. STOP if strict same-input parity cannot be preserved.

Remove `validReportingFixture()` import/calls for seed preconditions throughout all found
consumers; A means even invalid publication fixtures no longer need silent correction. For
any retained helper use, name the file, its actual authored scenario and why required. Delete
the helper only if no consumers remain; update file map. Do not delete focused invalid cases.
Run affected groups after each batch of fixture removals; preserve raw old failures.

### D and D2: one setting route, two mint inputs

Pin D before changing the add writer: no resolved report, TO12:00 gives09:00 at180;
at120 gives10:00 and warning names suggested brief09:40. Add cancelled-early formation,
unordered formations, midnight (TO01:00 ->22:00 previous day), no valid TO, existing resolved
report, and existing unrecognised/no-clock line cases. The fallback subtracts reportLead
from earliest uncancelled valid TO only. Keep an existing resolved report; do not subtract
the lead twice or change global waveInTime's fallback used by other consumers. No valid TO
keeps the existing text-only mint. Existing day strings never change when a default changes.

Retitle reportLead, retaining key/range/default and its existing consumers. Add the text spec
and normalizer first with RED tests: default, RALLY, empty, whitespace, line breaks, 60/61,
non-string stored input, quote/ampersand/angle-bracket payload, and a second embedded clock.
Extend ruleFmt/ruleParse/rulesLoad for text explicitly; keep numeric guards intact. Add own-key
checks on spec lookup if required so stored prototype names cannot become writable settings.
Use existing rulesSave/rulesReset/standard count and Logic command route. Update the declared
RuleOverrides schema with an accurately typed text property; do not weaken every numeric key
to arbitrary strings merely to pass typechecking. Update VCONF_KEYS and its shape pin.

Logic gets its text input and explanatory hint next to reportLead, maximum length stated and
enforced through the shared normalizer. No numeric bounds message for text. Escape all values
in editable value attributes, read-only values, standard labels and any toast/HTML sinks.
Mint configured words through the existing it: mutation/history/Undo/persistence writer;
the ordinary parser decides their meaning. No eval/new Function, extra clock parser or special
RALLY flag. A text such as `RALLY 13:00` still takes the minted leading09:00 as operative.

Inspect settingsStore capture/restore/write (already carries `rules`), reset-before-load,
export/snapshot pathways and Undo labels. Demonstrate actual text values through these
routes. The new value must remain inside the same existing rules record; if no user-facing
settings export exists, test the existing serializable settings snapshot route and record
that exact limitation rather than inventing an export feature. Update data-schema/data-model.

### E and F: signed clocks and truthful contracts

Write RED string pins for every listed call site before sharing the formatter: crew rest
`told to report`, earlier event `his day starts` and its report clause, leave-by, long-day
start, pre-drop backward and forward messages, trace row/puck explanation, Board header,
week header/current/issued look. Use numbers, not substring-only checks: target Tuesday
report Monday22:00 (−120), previous duty Monday23:00 means `1h00 before his Monday duty ends`,
never negative rest. An actual Monday duty ending Tuesday01:00 needs its real end-date named,
not the source row's Monday label. Check zero rest and positive rest retain sensible wording.

Export the shared signed-time helper with short header suffix; preserve hm24 formatting and
all rest arithmetic. Resolve source/target date labels from existing provenance; add no stored
day selector. Negative start annotation must not leak into raw data or be parsed as a new
instruction. Same-day output remains byte-compatible wherever E makes no change. Do not
truncate a long header, shrink buttons or relax geometry ceilings.

Before F's edits, add a RED documentation-contract test to an existing Rally test file
using the repository's file-read testing idiom; pin required vocabulary/examples and the
two supersession pointers. This is a focused contract pin, not a new app feature.
Rewrite remarks vocabulary exactly as F lists, including IN TIME, RALLY, immediate rally,
first valid clock, own-wave formation recognition, per-activity overrides, earliest resolved
duplicates, D503, REPORT_ORDER/REPORT_UNRESOLVED, RALLYING legacy fallback and Late Show.
Mark the two old engine-rules passages superseded with a pointer. Correct live contracts
that still promise publication refusal. Historical immutable briefs/reviews are not edited.

## Independent runtime scenarios

Each row names setup/action/expected result. A mismatch disproves the corresponding claim.
Fresh production bundle; no `?fresh=1` for reload proof. Fixture creation through ordinary
controls. Useful fixture: published Saturday and draft Sunday plus weekday, with normal
flying, SC MAIN/SPARE, AVALON/BB, timed/untimed duty, sim/passengers, ground/input/info-only,
cancelled/zero-length row, Common Programme ALL AVAIL/named crew, SANS, pending amendment,
parked plan and warning/AL/history overlays. Reuse existing authored fixture machinery;
isolated worlds per walker, never rebuild their served output mid-walk.

| ID | Setup/action | Expected / disproof |
|---|---|---|
| P1 | Fresh both weeks, normal sign-offs, publish Mon–Thu; then deliberately type wrong in/rally/brief pair and publish original/AL | All authorized publications succeed, red order warning remains; issued bundle contains it; no timing-refusal toast. Unrelated refusals remain |
| P2 | Publish wrong pair, correct draft, inspect issued, issue AL, Undo/Redo publication, reload | Issued old warning persists until corrected issue; after issue it disappears; Undo/Redo restores exact version/marks/signatures/credit according to existing contract; reload retains final state |
| P3 | Wrong warning published; hide in working copy, inspect week/Board/view/print, sign and AL, then unhide and repeat | Pending count and sign-offs change normally; issued flag remains until AL; after AL hidden line strikes out, counts/rings clear for that warning only; member has no restore action; reload keeps hide |
| P4 | Look at original then latest AL on week and Board; load old version onto draft; issue correcting version | Each viewed snapshot shows its own text/warning/hide state and date marker; load never mutates issued snapshots; correcting reissue succeeds with remaining wrong pair |
| L1 | Admin edits lead180→120 and text default→RALLY, leaves/returns, Done | Both fields commit and show modified/standard states; next add uses10:00 RALLY atTO12:00; earlier minted09:00 line remains unchanged |
| L2 | Member opens Logic and affected view; admin switches member view; guest visits existing allowed surfaces | Same literal setting visible where permitted, no edit/mint/publish/hide authority gained; attempted route cannot write |
| L3 | Text edit→Undo→Redo→Reset to standard→Undo→Redo, navigate and reload; also lead change then text and reverse order | Stored and live rules agree at each step; independent numeric value not lost; reset clears text override; reload uses current normalized default/override, Undo session lifetime unchanged |
| L4 | Through UI enter `<b>RALLY</b>`, quotes/ampersand, embedded13:00, blank, long text and newline paste; save/load settings snapshot through existing route | Literal text in Logic and mint, no b/script/event nodes or execution, first minted clock wins; blank defaults; single line/cap identical before and after reload; bad stored types safely default |
| M1 | TO12:00 blank B/no reporting, add from week then Board in separate fresh cases,180 then120 |09:00 default words with no order warning;10:00 at120 with suggested brief09:40 warning; caret and delete/add work on each route |
| M2 | Earliest formation cancelled, later valid formation, no valid TO, existing resolved report and midnight TO01:00 | Cancelled one excluded for fallback; no invented clock for missing TO; existing report retained;22:00 reads previous day, no double subtraction |
| M3 | Add→type→delete versus type existing→change defaults→add; after publication, Undo/Redo and reload | Existing text stays unchanged by defaults, same it: history/marks and issued boundary, deleted final line has usable add door |
| M4 | RALLY, RALLY AFTER IN TIME, RALLYING, lowercase/hyphen variants, formation names in remarks and extra clock | Ordinary parser behavior exactly D500–D507; unsupported words retain legacy in-time; no individual targets or silently new grammar |
| T1 | Tuesday TO01:00 report22:00; Monday duty ends23:00; then ends21:00; inspect warnings/puck |22:00(previous day), overlap1h before Monday duty ends; positive rest2h afterward; no negative duration text |
| T2 | Earlier qualifying commitment binds before report; previous duty crosses midnight; inspect trace/leave-by/pre-drop on source and target | Correct actual end day, report day and source-frame leave-by wording; pre-drop and placed warning agree in occupied formation; no unrelated arithmetic change |
| T3 | Previous-evening rally generates long-day and header; inspect Edit/Board/view/original/AL/peek/print | Long-day starts22:00(previous day), nonnegative duration, negative header only; unchanged raw text; no header/control on excluded peek route unless existing renderer actually shares it |
| T4 | Late Show where rest clears before step then after step; hide/unhide rest warning; multi-source rest across week | Dashed then solid ring as before; report/order semantics unchanged; trace and target hide stay paired, older source date labelled accurately |
| X1 | Publish previous-day rally with long label and literal markup words; print before/after working edits and hide AL | Print contains issued date annotation and literal words, no clipped header; hide flags follow issued copy. Open rendered print/PDF picture |
| X2 | Download schedule CSV with issued record and different working edit | Existing columns/data come from issued version; no reporting/header column claimed or silently added; CSV escaping preserved |
| I1 | Measure actual report22:00→last commitment/debrief next13:00; change draft then publish |15h nonnegative actual work span; Insights follows latest issued content, current applicable Logic; text-default-only change leaves existing hours unchanged |
| I2 | SANS previous-day PM offer versus target-day AM offer, previous-evening report, valid seat and earlier actual reporting | Compare picker and placed SANS warning. Prior-date offer limitation is explicitly unproven in old review; reproduce and file any forward-live defect with priority, never call it D56 or silently invent cross-date availability policy |
| I3 | Weekend flying12:00→13:00, nominal report180/debrief120; change actual words/time and publish, then lead120 and amend | Numeric worked-credit basis remains nominal (09:00→15:00 =360min vs10:00→15:00 =300min), existing 361min full threshold respected; actual report affects rest/hours but does not redefine OIL; inspect earned result in Leave War |

At both desktop and phone widths operate every changed control and each distinct renderer.
Shared lifecycle proof may run once under D499, but M1 and L1/L4/reload run at both widths
because the brief explicitly requires them. Add short laptop and landscape phone checks for
Board and edge-docked panels: controls inside viewport, actual elementFromPoint hit targets,
long warning wrap, no overlapping report/header/button/puck/AL/history pixels. Do not force
click a covered target. Open every saved picture; choose distinct states instead of repetitive
screenshots. Record physical Safari/touch differences as unproved, not inferred from Chromium.

## Completion evidence and exclusions

Maintain the A–F/D2 red/green ledger with exact named tests and original outputs. Each wired
surface needs one deliberate disconnected-wire RED test, followed by restored PASS; group
shared consumers only with explicit reason and a named surface assertion. Do not mutate a
served snapshot while walkers run. Record source/bundle/test hashes and ports.

Run affected units between fixes. Final broad run under the one-PC lock: unit suite, build,
reference tfin728/0, geometry/browser suite, Tracker smoke; release immediately on completion.
Also rulecheck/docsize and required adapted probes/performance against the same frozen bundle.
Do not repeat broad green runs absent a relevant change, failure or unresolved concern.
Preserve failures; prove baseline provenance before calling a failure pre-existing.

Append this round to `docs/handpass/2026-10-02-rally-workspan.md`: tier, roll-call, scenarios,
meaningful orders, actual observed downstream values, red breaks, opened pictures, errors,
gates and every omission. Fresh independent Astra inspector then reads final Sol snapshot
and evidence; neither this planner nor Sol approves its own artifact. Repair/re-walk before
the next allowed fresh inspection. Final handoff says `OWED: Claude's read after the reset —
codex/rally-workspan`, including FULL check, blind trial and working-guide reads.

D56 excludes only already-stored harm where new writes are already correct. Fresh seeds,
new typed text, newly issued warnings, failed reset/reload and newly reached old code do not
qualify. No historical store migration is authorized. Existing REST-FIRST-CREW-HINT and
PALETTE-WRAPPED-HEADER remain explicitly filed with their prior priority; new evidence does
not manufacture owner acceptance. No physical-device claim. No new export fields or guessed
SANS policy. No bespoke Tracker fixture because no new reporting route reaches its store;
required smoke still runs. No Insights feature work; existing downstream values are checked.

After Rally has its independent result and branch handoff, host handles only the two Discard
leftovers on `codex/discard-marks-remove`: unused import and six script retirement comments.
That separate branch gets its appropriate documented verification; no Rally changes copied
there. Host links this plan from the backlog and records file-map addition as required.

Rulings: none in this planning task; D509–D511 were already recorded before delegation.

## Sol independent challenge —3 Oct26

Sol read Astra's plan SHA256 7EB12FA55C89C5249E9C9D9D2A21479FC13EC9180026699C175FC70DA0EE7479 before implementation. Challenges: preserve global waveInTime fallback for unrelated readers; retain existing report in the mint rather than subtracting twice; leaveBy's numeric frame is the previous reference day, not the target day; negative overlap must name actual end weekday when the source rolls overnight. Astra accepted all four. Week adds only the exceptional negative-report header marker; export format and other feature scope stay unchanged. Text safety remains scoped to D511. This is Sol's independent plan disposition, not code approval. Implementation, observed test corrections and final frozen evidence belong in the existing evidence sheet. Rulings: none.

Sol runtime-roll-call correction before final inspection: agency PDF is rendered from the same16-column flying rows as CSV, not dayHTML; it contains no reporting header/text or warning-list field. X1's header/hide claim therefore cannot pass and is replaced with actual issued row content/unchanged print-format verification. No export fields are added. dayHTML header proof covers week/view/issued-version rendering only. The settings serializable snapshot route is checked; no dedicated settings export UI was found. This correction records concrete source evidence and does not expand owner scope.

Runtime text-width addition: Astra identified the new text kind inheriting the numeric66/58px field. Sol challenged the scope: one text-cell modifier only, label above a full-width single-line field; readonly and standard text wrap; cap/storage/permissions and numeric widths unchanged. The desktop and phone measured readability test was RED at52/44 usable pixels versus120 needed, then GREEN at362/237; numeric fields remain66/58. This is a usability repair inside D2, not a new setting or product ruling. Fresh final code inspection remains independent and pending.
