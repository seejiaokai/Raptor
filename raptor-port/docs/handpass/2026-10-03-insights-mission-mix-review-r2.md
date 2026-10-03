# Insights mission mix — independent Astra final code inspection, round 2

**Verdict: PASS for the exact freeze5 implementation inspected.** No additional concrete defect found.
R1's dirty-text defect is repaired in both production editors. This is the second and final Codex inspection,
not permission to merge. **OWED: Claude's later code/scenario read on `codex/insights-mission-mix` before main.**

Reviewer: fresh independent Astra (`astra_final_r2`), 3 Oct 2026. I did not author the application, plan,
coordination drivers or R1 review. I changed only this new report. No source, test, plan, brief or prior-review
changes; no new runtime run, no main push, merge or merging PR. Rulings: none new.

## Scope and snapshot

- Inspected the complete implementation against `origin/claude/planning-filing-3-oct`, including new files and
  then-staged changes, not merely HEAD or the unstaged diff. Baseline verified as
  `5f9bf9781874f7ee8dcaf69ebe1b532606e851a7`; branch verified as `codex/insights-mission-mix`.
- Independently checked every entry of `docs/img/insights-build-freeze-5.json`: **804 files, zero mismatches**,
  including source, tests, browser tests and production output. Repeated the check immediately before this report.
- Revised plan hash independently verified as
  `A51541CA5557914E37989A6F445BD828D1FDDE2ADBFD0930E557234DE4B99DBD`.
- Read the required handoff, rules, project guide and relevant full guide headings/rulings; approved spec;
  complete revised plan and its reviews, including Opus section 7; complete immutable R1 and R2 briefs;
  R1 report; coordination route map; evidence sheet; affected contracts; implementation and all new tests.
  The D512–D532 product decisions, approved picture and Logic placement were treated as settled.
- Read adjacent production writers, publication identity, template application, command permission,
  persistence, history and Undo routes where a missing connection could invalidate otherwise-correct new code.
  Source changes are confined to this batch; no engine-body tidying or test weakening found.

## Promise, qualifying objects and visible routes

The promise is one formation-wide Blue/Red interpretation, outside the signed programme, derived automatically
only where specified. A conditional cue stays unresolved until an authorized answer. Answers follow stable
formation/context identity; every occupied counted seat gets that formation's result. Tracking starts Off.
Role changes must preserve programme/signature/pending bytes, ordinary totals, standby and work-hours behavior.

| Qualifying object or surface | Visible sign and working gesture inspected | Result |
|---|---|---|
| Latest issued ordinary formation, with divergent working text | Board's issued preview exposes focusable readonly Remarks; focus offers Choose/Change, clearly labelled Published and version; Blue/Red/Later underneath the formation | Correct separate issued target; no programme writer on readonly field |
| Historical issued preview | Frozen programme remains readable; no mission-role action | Historical version cannot acquire a current-role editing door |
| Same-label reissue | Latest preview can answer; an old retained action cannot write | Issuance discriminator, view/generation, revision and formation identity are rechecked |
| Working Board formation | Actual native Mission and aircraft Remarks fields; eligible own edit may ask once; refocused Remarks exposes Choose/Change | One transient formation-level offer; current visible text saved first |
| Working week formation | Actual Mission/Remarks contenteditable fields with the same formation-level action and question | Same controller and intent, using the existing week writer |
| Multiple aircraft, empty seats and repeated person | Role belongs to the formation; aggregation applies to each occupied seat already counted by Insights | Both seats counted; empty seats add nothing; no person/aircraft unit substitution |
| Exact DS, RED and RED AIR and approved aliases | Automatically Red, without question | Exact-name path wins; conditional substrings are not guessed |
| Conditional Mission or Remarks cue | Question after a qualifying changed context; otherwise manual Choose/Change from Remarks | Bounded tokens and canonical context; both house clause separators supported |
| No cue, cancelled formations/aircraft, standalone and SC rows | Existing inclusion/exclusion and work-hours behavior | No extra role door for ineligible formations; no standby-sortie conversion |
| Structural aircraft/line/wave-kind edit | Existing actual add/delete/kind controls; one changed eligible context may ask | Capture-before/resolve-after connection inspected; multi-target/template loads stay silent |
| Day-template library and destination day | Existing save/reload/pick controls; copied answers arrive silently on fresh destination identities | Validated sidecar, current final destination IDs, independent answer and atomic Undo |
| Plans, parked plans, same-identity moves and older-version load | Existing plan/version controls; returning to an identical context shows its current correction | No stale annotation copied over a newer answer; issued source remains distinct |
| Logic, admin and read-only viewers | Admin Edit rules exposes Mission role tracking; other viewers see read-only state | Persisted default Off, own Undo/Redo, no rule-count/reset coupling or enable burst |
| Desktop Board | Insights button beside bell; modal opens above Board and closes back to same day/scroll | Actual callback retained; desktop-only wrapper matches standing toolbar convention |
| Phone Board | More → Insights; desktop opener hidden | Menu closes, topmost shared modal opens; original direct-child toolbar geometry passes |
| Shell and drawer | Existing Insights doors show the same current aggregate | Historical preview does not turn the shared modal into historical Insights |
| Shared flying-load chart | First twelve names and Show all when needed; total-only unresolved row or complete Blue/Red split | Zero/12/13/many, fallback names and escaping inspected; work-hours list unchanged |
| Admin, member, guest and pending/invalid authority | Admin edits; member shares figures through existing doors; guest retains existing issued-only app | Central changed-record guard also rejects forged nonadmin writes; no new guest opener invented |

No general fresh-row copy/import UI exists to connect. I searched the relevant copy/template/move paths: actual
fresh day-template creation is connected, while same-identity moves and plan copies retain IDs. That absence is
qualified N/A, not an untested claim of an import feature.

## Writers, readers and downstream closure

1. **Text writers:** `textedit.ts` and Board `boardChange` remain the sole real editor write routes. The offer
   adapter dispatches their native bubbling focusout/change event when visible text differs, verifies the saved
   value and resolves a fresh role target. It does not mutate schedule text itself. Synthetic writer notification
   does not move the native input/contenteditable focus; the existing typing guard prevents its replacement.
2. **Annotation writer:** `setMissionRole` enlists only `roleStore`. The target carries week/date/rid/context,
   role/day revision, actual formation identity, issuance/view/session/generation and tracking epoch. Apply
   re-resolves them under the real command authority. Same-side answers are no-ops; Later writes no answer.
3. **Setting writer:** the registered `insights` setting uses the existing settings command/persistence path.
   Loading defaults missing or malformed values to Off. Tracking changes invalidate queued offers.
4. **Fresh-copy writer:** the real day-template outer command enlists scheduler and role stores before mutation.
   The private nested copy path validates canonical seed context, final fresh identity, collisions and authority.
   A late failure rolls back both stores and emits no partial save group. Missing/future/altered seeds stay inert.
5. **Readers:** the pure resolver validates identity/context/version and never guesses a conditional answer.
   `readRole` returns a clone; the aggregate reader snapshots cloned values. Hydration replaces the map and
   invalidates stale targets. Raw role-setting edits are blocked; malformed opaque rows are retained inertly.
6. **Save and boot:** registration → change mapper → Whiteboard → Postman → backend → hydration is connected.
   Tests use the real save pipeline for retry, slow-save Undo, crash replay and empty/malformed hydration.
   Existing demo wipe includes annotation keys and journal; no migration or separate storage channel was added.
7. **History and global Undo:** collection/module/scope metadata, actor description and off-week landing are
   connected. Text and answer are separate commands. Restore of pure role records returns before scheduler
   post-restore machinery, avoiding publication barriers or canonical day writes. Same-key actor conflicts refuse
   rather than overwrite; unrelated contexts do not conflict. Refused/no-op actions add no misleading history.
8. **Publication and aggregate:** issued programme traversal still chooses the effective published source.
   Role lookup happens once per ordinary formation within that traversal. Unresolved participation keeps the
   whole person's row unsplit; completing the issued answer updates bars without changing issued bytes.
   Working B's answer does not change issued A's bars; AL/withdrawal changes the selected programme source.
9. **Downstream isolation:** sign bindings, pending/AL records, warnings, OIL, Inputs/holder expansion, standby,
   work-hours and Tracker remain outside role-only command closure. Existing schedule edits still use their own
   normal downstream behavior. I found no annotation field inserted into the signed programme or publication diff.
10. **Lifecycle and cost:** one installed transient controller, bounded queued callbacks, existing view/session
    resets, shared modal state reset, and no per-row React conversion. Off/On adds no standing dense-grid nodes.
    There is no feature-specific undo stack or fourth persistence pattern.

## Ranked failure scenarios challenged

Rank below is inspection priority, starting with the least-shared surfaces, not a list of defects.

| Rank | Setup and action | Expected result / observation that would disprove it | Inspection outcome |
|---|---|---|---|
| 1 | Publish unanswered A; type divergent B without blur; Choose then answer B; preview and answer A | Save B first, distinct answers; A bytes/signatures unchanged. An answer keyed to A while B is visible disproves correctness | Repaired source, twelve red-first mounted cases and actual publication driver establish the correct order |
| 2 | On latest issued readonly phone Remarks, Choose, correct, Later; also open phone More at short height | No text writer, context visible, buttons hit-testable, Board preserved. Any programme command, covered control or historical door disproves correctness | Readonly guard and actual touch-emulated routes inspected; all seven locked freeze5 images opened independently |
| 3 | Retain action across withdrawal/reissue, plan/week/session change, Off/On, removal or same-key other actor | Stale action refuses without history; fresh action resolves current target. Any stale accepted write disproves correctness | Guard conjunction, mounted/state tests and labelled retained-DOM runtime check cover distinct invalidation sources |
| 4 | Dirty Choose, Change or open-question answer; active Mission or another same-formation Remarks; Later/cue removal/exact DS | Actual active text commits before fresh target; only intended text/answer commands; original node/range survives | Both adapters and active-field selection inspected; real dirty walks plus mounted cases pin repaired orders |
| 5 | Apply saved day template; then collide fresh ID or fail second store; Undo/Redo successful creation | Independent destination answer; both stores roll back/restore together. Partial day/annotation persistence disproves correctness | Real template pipeline tests and actual save/reload/apply/correction walk cover the connection |
| 6 | Correct B, return A, duplicate/select parked plans, load older wording | Same-context current answer survives; different context stays distinct; issued pointer unaffected by load | Stable identity/context and actual plan/version controls inspected |
| 7 | Answer, edit wording, answer again; Undo/Redo, navigate off-week, competing actor changes same key | Separate ordered steps, correct actor/date landing, no scheduler restore side effects | Real commands, off-week runtime and conflict tests inspected |
| 8 | Backend rejects or lags; Undo while saving; crash/replay/reload; fresh empty hydrate | Durable atomic annotations, no resurrected answer or stale map; malformed rows inert | Eight real pipeline tests inspected; no helper-only persistence substitute |
| 9 | Exact/bounded false positives, two separators, clause reorder/timing edit, cancelled aircraft carrying cue | Only approved normalization and cue clauses affect context; unchanged context retains answer | Resolver vectors and both running editor routes inspected |
| 10 | Complete 2 Blue/2 Red participant then one unresolved formation; empty/repeated seats and standby | Ordinary counts unchanged; incomplete person unsplit; work-hours unchanged | Actual aggregate/shared-renderer cases inspected, not appearance alone |
| 11 | Enable after edits while Off; reset warning rules; member opens same chart | No question burst, warning independence, persisted tracking and shared read-only figures | Actual Logic callback, settings Undo/reload, member runtime and central permission tests inspected |
| 12 | Open every Insights door, twelve/all/close/reopen, long 4× CPU fixture | Shared topmost modal, same Board/day/scroll, bounded work and unchanged standard ceilings | Actual opener drivers, hit tests, node/command counts and freeze5 perf log inspected |

## R1 and toolbar repairs

**R1 P2: resolved.** The former path captured saved A and prevented pointer blur, so unsaved B could remain on
screen while A received the answer. `saveVisibleText` now reuses the real writer, checks its result, then refreshes
the guarded target. It captures the live selection before activation and restores it on the original connected
node; the writer's deferred duplicate offer is invalidated. Readonly published targets bypass that writer.
I read the actual failing log: twelve new cases failed while thirteen earlier cases passed; after the repair,
the focused three-file run passed 53 tests. Those failures meaningfully expose the old bug, rather than mirror
the new implementation. I found no replacement dirty-text ordering defect in the inspected paths.

**Phone toolbar repair: resolved.** The new desktop button is now inside the existing desktop-only `sb-dayctl`
wrapper. The callback and geometry assertions are retained. The locked freeze5 actual-control record measures
one direct-action row, minimum width 30, toolbar height 75 and zero horizontal overflow before/after modal use.
I independently opened all seven pictures from that record. The failed freeze4 full browser run is not clean
evidence; the affected freeze5 Raptor project is the applicable passing rerun.

## Evidence actually used and limits

Walk: I read both complete production walk drivers and their final result records. I did not launch a new
browser walk or claim another inspector's actions as my own. I independently opened these eleven saved PNGs
at original resolution: all seven in `insights-build-publication/freeze-5-publication-door-locked/`, plus
`desktop-Board-dirty-choose.png`, `phone-week-dirty-open-answer.png`, `phone-week-keyboard-selection.png` from
`insights-build-editing/freeze-4-editing-r2/`, and
`dirty-working-published-latest-A-still-unanswered.png` from `insights-build-publication/freeze-4-publication/`.
The other saved pictures remain the named prior inspectors' evidence, not eleven newly executed scenarios.

- Actual final unit log, read after completion: **480 files, 7,642 tests, zero failures, 278.87 seconds** on freeze5.
  The immutable brief's earlier timing is superseded by that actual final log. No verdict was issued while running.
- Actual freeze5 logs: production build PASS; rulecheck OK; affected Raptor browser **197 passed**;
  performance **4 passed / 0 failed**, week 5,134 nodes and Board 1,024 under unchanged 5,450/1,150 ceilings.
- Actual final runtime records: freeze4 editing **24 PASS**, publication **22 PASS**, browser errors zero;
  freeze5 locked Board-door/published-phone supplement **5 PASS**, errors zero. The phone toolbar is the only
  later implementation adjustment; freeze5 hashes tie the final code and built output together.
- The evidence sheet qualifies all S01–S33 with production unit, mounted, persistence and/or actual-control
  routes. I read the relevant tests and drivers rather than accepting that table's labels alone. Four deliberate
  disconnections to real editor, persistence, Logic and Board wires are retained as connection evidence.
- Completed reference **728/0** and Tracker **445/0** gates remain relevant to unchanged engine/downstream
  bodies. Earlier failing unit, browser and partial driver runs remain disclosed; they are not counted as passes.
- Adapted groups are GREEN, but adapted audit is **24/3**, with the same three failures recorded on the unchanged
  planning baseline. This remains a qualified baseline comparison, not a clean adapted audit or new exemption.

Evidence gaps and nonblocking limits: physical iPhone/Safari keyboard and native touch selection are unverified;
Chromium touch/short-height checks do not prove those. Guest UI entry is N/A under the existing issued-only guest
app; shared reader/permission behavior is tested. General import is N/A because there is no such UI. Long stress
fixture growth and timing are diagnostic and separate from standard demo ceilings. The first unlocked freeze5
walk remains diagnostic only; the successfully locked rerun is the final record. None of these limits establishes
a concrete implementation defect. Claude's later independent read and the owner's acceptance are still owed.

## Inspected negatives and D489

Explicit negatives: no automatic guessing for conditional cues; no question on unchanged Tab, merely enabling,
Undo/Redo, plan restoration or template loading; no silent loss of Later's text; no stale same-label issuance
write; no role mutation of canonical programme/signatures/pending state; no role overwrite through old plans;
no source/destination answer alias; no partial two-store save; no member/guest bypass via an otherwise allowed
command; no extra refused/no-op history; no aggregate unit or hours change; no hidden direct phone action added
to the toolbar query; no alternate guest/import door invented; no migration-only finding or numeric source ceiling.

D489 review of changed non-engine lines: the new resolver, guarded state and transient UI responsibility have
separate modules. Busy shared files receive bounded registration/render/permission/persistence connections.
The role-only Undo branch is necessary isolation at the shared restore seam. R1's already-filed duplicated
history/Undo metadata parsing remains a nonblocking maintenance note, with no demonstrated current failure;
I found no additional responsibility-based tidiness note requiring filing. No refactor is an acceptance condition.

**Final disposition: PASS, zero new concrete defects, R1 repaired.** Keep this report with the exact inspected
snapshot and the qualified evidence. Any later implementation change requires its own appropriate validation;
this report does not waive Claude's owed read or the restriction on main/merging.
