# Insights mission mix and Board entry — implementation plan

Author: Astra, 3 Oct 2026, under D496. **For Sol's independent challenge and the owner's final look; not build approval.**
Source baseline inspected: `claude/planning-filing-3-oct`, HEAD `34eb603f`, plus the host's uncommitted D525–D527
records. Source was unchanged during planning. This document alone is authored by the delegate; the host owns the
spec, rulings, pictures, backlog and handoff. The writer does not approve this plan.

## 1. Authority, remaining approval and branch boundary

Build only in a **new chat** after agreement (D515), on reserved `codex/insights-mission-mix`, created from the
then-committed planning/filing branch. No application implementation in this planning chat. A sequential local chat
needs no new worktree. Do not work on, partially cherry-pick or rebase the checked Rally or Discard builds. This
independent preview initially has the planning baseline's work-hours behaviour; it does not contain the Rally fix.
Later authorized integration follows the owner's merge order and rechecks the combined schedule/Insights paths.

D496: Sol independently challenges this Astra plan (at most three rounds), then builds and fixes; a **fresh Astra
inspector** reads Sol's final code after the running-app walk. Keep complete reports and dispositions. No Claude run
before the reset; **OWED: Claude's read after the reset — codex/insights-mission-mix**, plan and code/scenarios, after
Monday 5 Oct 2026 19:00 Asia/Singapore, before main. Re-read the operative model arrangement if building after that
time. No main push, merge, or pull request for merging. Branch pushes remain allowed under the standing checks.

The owner has settled the lifecycle; do not ask these choices again. D520 approves the after-edit question below
AREA, and D524 approves the shown Logic control labelled **Track blue/red sorties**, initially Off. The **complete
chart, Board opener, incomplete-bar explanation and correction/missing-role access pictures remain pending**.
Bind the eventual approved pictures and this plan's final path/hash in the handoff. Earlier mockups and read reports
are historical evidence, not cumulative requirements. A materially different product choice returns to the owner;
routine technical implementation remains the builder's responsibility.

## 2. Acceptance contract

| Rule | Required outcome |
|---|---|
| D512, D517, D518 | One role for the whole formation. With tracking On, exact normalized Mission DS, RED or RED AIR is automatically Red. Another Mission with DS/RED in aircraft Remarks needs a chosen Blue/Red answer; wording never supplies the answer. Another Mission without that cue is Blue. |
| D514 | DS FOR, DS FROM, DS naming another formation and RED wording may all cue the question; never infer direction or side. |
| D519 | No extra role label/colour/flag on schedule lines and no permanent role dropdown. Existing mission dots, warning flags and scheduler red flags keep their meanings. |
| D520 | Ask after a completed Remarks edit loses focus, below that formation's AREA strip, outside its aircraft rows. Keep Remarks visible, finish the next tap/Tab transition, never interrupt typing; either answer removes the temporary space. |
| D521–D524 | One squadron setting on Logic, Off when absent/first setup. Off preserves ordinary Insights/totals and suppresses role questions/split. On immediately changes presentation using applicable data; it does not write schedule days or issued copies. |
| D523, D526 | If any counted sortie role for a person is unresolved, show that person's **whole ordinary total bar**, not a partial blue/red bar, guessed colour or third category. No bulk prompt on enabling. Completed Remarks save even unanswered. |
| D525 | Remember a valid answer until Mission or relevant DS/RED wording changes. Crew, times and ordinary reordering do not ask again. Save stale-answer invalidation with the relevant edit. |
| D527 | Temporarily offer **Change mission role** while editing relevant Remarks, so an answer can be corrected without rewriting text. Same formation question and permission. Automatic red Missions have no override. |
| D513 | First twelve flying people initially, then Show all. Preserve total-descending/callsign tie-break sorting and the complete work-hours list. |
| D481 | The Board has a usable Insights opener. Proposed desktop bar/phone overflow placement needs the final picture approval. |
| D478, D482 | All Insights figures read each day's latest issued version, working copy only before first publication. Draft role answers on an issued day wait for AL. Today's Logic work-hour rules still apply immediately, unchanged. |
| D516 | SC/AVALON/BB standalone waves never count as flying load. SC main still contributes its existing work hours. |

Preserve the current count unit: the Sorties tile counts eligible aircraft, even with empty crew; a person's count
adds one per occupied front/rear seat. The existing same-person-in-both-seats warning remains; do not silently dedupe
its two entries. Skip cancelled formations/aircraft and standalone waves before adding load. Formations, idle roster,
warnings and hours keep their current definitions. Person keys remain stable IDs; callsign is a label. Do not use
airborne hours, change date range, add mission filtering or alter work-hour/OIL calculations.

## 3. Inspected implementation and change map

Paths below are relative to `raptor-port/`. Read the current version and callers again in the build chat.

| Area | Current source / contract | Planned change |
|---|---|---|
| Computation | `src/engine/insights.ts`, `validate.ts issuedWorld`, `insights.test.ts`, `ui/insights-published.test.tsx` | Add per-person blue/red/unresolved counts to the existing eligible seat traversal; retain `n` and all other outputs. Read role from the same issued formation being counted. |
| Chart and openers | `src/ui/Modals.tsx insightsHTML/InsightsModal`, `pops.ts`, `Shell.tsx`, `Drawer.tsx`, `SchedBoard.tsx` | One shared chart, transient expansion state, Board routes to the same modal. No separate Board calculation. |
| Mission/Remarks | `src/engine/schema.ts Formation/AircraftSeat`, `slots.ts txtSet`, `ui/textedit.ts routeFocusOut`, `board.ts boardChange`, `html.ts` | Mission belongs to Formation; aircraft owns Remarks. Board repeats the Mission box but every copy edits the same formation. Wire both editing routes to one role/context service. |
| Commands/saving | `src/state/sched-commit.ts`, `history.ts`, `weekrows.ts`, `persist.ts`, `holderbase.ts`, `docs/undo-contract.md` | Role saved inside the day through the scheduler command, never through an independent browser key. Context invalidation is part of the triggering forward edit. |
| Canonical record | `src/engine/restore.ts dayKeys`, `canonical.ts`, `rowids.ts`, `drafts.ts`, `publish.ts`, `editlog.ts`, `state/changelines.ts` | Role-only changes participate in comparison, pending/history, sign validity, AL and restoration. A serialized field alone is insufficient. |
| Writers/copies | `ui/board.ts`, `engine/wavetpl.ts`, `daytpl.ts`, `drafts.ts`, `reorder.ts`, `waves.ts`, storage readers | Apply the same validity rules across creation, structural edits, saved plans, templates and supported ingestion routes. |
| Configuration | `ui/LogicPage.tsx`, `engine/rules.ts`, `engine/hooks.ts`, `state/people-settings-commit.ts`, `state/perms.ts` | A distinct typed feature setting through the existing settings seam; admin Edit rules UI and central authorization. Not a warning threshold/severity or off-standard rule stamp. |
| Layout/performance | `ui/scheduler.css`, `dayswap.ts`, Board rendering; `docs/performance.md` Part 1 | Preserve dense HTML builders, caret guards, scroll holds, control sizes and existing ceilings. Add only transient question content. |

Current Logic `ruleApply` calls save/validate/notify. `store.set` has a settings-command hook behind it; this planning
read has **not verified the real Logic Undo lifecycle**. Use the established configuration persistence and permission
semantics, test the resulting route, and make no unsupported owner-facing Undo promise for the switch.

## 4. One role resolver and saved representation

Add one small pure engine module, proposed `src/engine/mission-role.ts`, and its focused tests. It owns normalization,
cue/context extraction, answer validation and effective role; all readers and writers call it. Never parse support
direction. Suggested declared formation field:

```ts
missionRole?: { side: 'blue' | 'red'; context: string }
```

Only an explicit conditional answer is stored. Automatic Blue/Red is derived. Missing, malformed or mismatched
answer plus a cue is **unresolved**, not Blue. No third saved user choice is introduced. Context is normalized source
material for validating the answer, not a secret inferred category. Declare the shape in `schema.ts` and update its
runtime conformance checks. Keep source naming distinct from aircraft `role` (MAIN/SPARE).

Technical context policy to bind with the independent plan challenge:

1. Normalize Mission with trim, collapsed whitespace and case folding; match only whole names DS / RED / RED AIR.
2. Recognize DS and RED as whole lexical tokens, case-insensitively, bounded by start/end or non-letter/digit/underscore.
   Thus `DS FOR VL`, `4-Ship DS (external unit)`, `DS [external unit]`, `DS FROM` and `RED AIR` cue a question;
   `REDS`, `CREDIBLE` and an embedded `DS` substring do not. Do not expand synonyms or guess misspellings.
3. Context contains normalized Mission plus the sorted unique normalized **cue-bearing clauses** from all aircraft's
   Remarks. Split at explicit semicolons, then retain only clauses containing a whole DS/RED token. Normalize case
   and whitespace within each clause. The actual shared `slots.ts txtSet` collapses all whitespace (including newlines)
   to spaces, while preserving semicolons; Board and Edit Schedule both call it. Therefore newline is NOT a reliable
   delimiter, and no input-normalization change is part of this feature. Do not split at commas, slashes or ordinary
   punctuation that may belong to support wording. Keep all wording within a retained clause: FOR→FROM or a supported
   formation-name edit invalidates without inferring the answer. Do not include IDs, crew/time fields, area, stores,
   aircraft order or flags. Non-cued clauses/aircraft Remarks are outside the context: changing
   `DS FOR VL; REJOIN 1430` to `DS FOR VL; REJOIN 1440` retains the answer and does not ask again.
   **Bounded limitation:** undelimited prose is one clause. An edit anywhere in `DS FOR VL REJOIN 1430` changes that
   cue-bearing clause and invalidates; the resolver cannot establish that part of an unseparated phrase is unrelated
   without interpreting prose. Do not infer support direction, silently strip numbers/times, or claim semantic
   understanding. This lexical boundary is a technical proposal for Sol's challenge, not a new owner wording rule.
4. Because role is formation-wide, cancellation alone does not rewrite its answer; Remarks on a cancelled aircraft
   remain part of that formation's context. Counting still excludes cancelled aircraft. Removing/replacing the
   last distinct cue changes context; ordinary aircraft reorder or an identical duplicated cue does not.
5. Eligibility gates **questions and counting**, not destructive normalization: standalone/cancelled formations show
   no question and contribute no flying load. Retain valid content on them so uncancelling can reuse it. A newly
   eligible unresolved formation becomes resolvable through its Remarks editor, without opening a queue of questions.

The pure resolver returns automatic Blue, automatic Red, chosen Blue, chosen Red, or unresolved, with an explicit
conditional/context result. This is internal status, not a five-category chart. It must not mutate during rendering,
validation, enabling, loading an issued view or computing Insights. If tracking is Off, the presentation bypasses the
split/questions; answer validity remains governed by context so an off-mode edit cannot resurrect an old answer later.

## 5. Save, history and all writers

Introduce one typed role-answer command through the existing scheduler command seam and central permission map.
Capture pending UI identity as week key + day identity + formation `rid` + context. At answer time, resolve the live
formation afresh; check edit permission, working-view state, tracking On, eligibility, conditional Mission and exact
context. A stale/missing target must not write a different formation or overwrite changed context. Close/re-evaluate
the obsolete transient question; do not add a warning or publication block. Re-answering the identical valid side is
a no-op with no extra history/Undo entry.

Use a shared forward-write normalizer for role validity, restricted to formations/days actually changed by that
command. Integrate it **before final canonical reconciliation and command baseline capture**, not as an after-save
effect or read-time repair. In particular, current text edits mutate before their synchronous lagging-baseline command;
the stale clear must be captured with that edit. Structural/copy paths must reach the same finalization. Do not sweep
every week/day, touch an issued snapshot, or attach schedule writes to a member's unrelated input command. A defensive
pure reader still rejects a mismatched answer if untrusted input bypassed a normal writer.

| Writer / restore route | Required role treatment |
|---|---|
| Edit Schedule contenteditable; Board input/textarea | Save completed text normally. A material Mission/cue-context change clears stale answer in the same command. Leave no unsaved role-dependent text draft. |
| New formation/aircraft/wave, including plus controls | Derived named Mission role or ordinary Blue needs no stored answer. Conditional formation without a valid answer is saved unresolved; no pre-creation prompt requirement. |
| Aircraft add/delete/move, formation/wave conversion and reorder | Re-evaluate only affected formation contexts. Retain when identical; clear stale answer with the structural edit when changed. No crew/time or reorder-only reprompt. |
| Wave templates | Existing templates contain Mission/times, not Remarks or a role editor. Derive role from produced content; do not add new template controls. |
| Day template save/apply; supported whole-day copy | Copy a valid answer with unchanged Mission/cue context as content; keep unresolved unresolved. Existing copy strips IDs and mints destination IDs. Revalidate after template transformations; never carry source popup identity or share mutable answer objects. |
| Saved-plan duplicate/switch; load issued version onto working copy | Preserve the saved content and answers, validate through the same resolver; role-only differences must be pending against the current issued version. Keep existing draft identity/sign-off semantics. Loading does not rewrite the issued original. |
| Supported imports/config readers/ingestion | Audit actual routes, including day-template blobs and persisted working records. Accept only valid shape/context; otherwise conditional content is unresolved. No invented scheduler-import UI, bulk prompts, or import-block requirement. Record each found route in the writer roll-call. |
| Normal reload/week stash/hydration | Read without role backfill or writes. Preserve valid/unresolved state and the explicit switch setting. Do not normalize unrelated days merely because the week was opened. |
| Undo/Redo and command rollback | Restore exact recorded before/after data, including answer and context, without the forward normalizer clearing the inverse. Revalidate only transient questions. Undo of later answer leaves saved text unresolved; the next Undo reverses the preceding text edit and its invalidation. |

Add a canonical formation role address (for example `ff:…missionRole`) to `dayKeys` and all actual consumers of that
grammar. Serialize the small structure deterministically; map its UI jump/history label to the formation/Remarks
context and describe values as Blue / Red / not chosen, never raw context JSON. Ensure canonical comparison,
signature digest, pending units, amendment details, per-item history, draft rebase, role-only revert and version-load
restoration all agree. Inspect the actual key/label readers before choosing the final address. Do not introduce a
permanent visible role mark to make an amendment key clickable: existing history/changes navigation may reach the
formation and its temporary editing action. Check role-only changes remain visible in the changes window.

Role answer is a separate gesture/command/Undo step from the prior Remarks save (D526); do not keep an asynchronous
transaction open across the question. Preserve actor ownership, conflict refusal, rollback and one command's atomic
storage write. Role-only edits on an issued day invalidate the working sign-offs and become pending like other day
content; original/latest AL stays unchanged until the next AL. Publish and restore must deep-copy the role data.
Unanswered roles do not add a new warning or refusal to publishing/signing.

No retrospective cleanup, migration, issued rewrite or historical answer invention. D56 excludes harm confined to
old demo data only when forward code is correct; it never licenses treating new off-mode/unanswered records as Blue.
Use the same non-mutating missing-answer resolver for untracked conditional data rather than adding a legacy
backfill mechanism. No dedicated campaign to repair pre-field demo records is part of this build.

## 6. Logic feature setting

Use a distinct typed setting, proposed `settings/insights` with `{ trackMissionMix: boolean }`, default false. Route
through `engine/hooks` settings storage and `state/people-settings-commit` registration/load/reset/rollback, with
`state/perms.ts` Setting update authorization and the schema/table documentation. Absent/null reads Off; accept only
a real boolean, not truthy strings. Follow the existing default-value storage convention. In today's one-squadron
browser this is squadron configuration, not a per-login preference or a promise of current multi-device sync.

Use the approved Logic card and existing admin **Edit rules** permission/edit state; read-only users see its state
but cannot change it, including through stale markup/direct command calls. Keep it out of `RULE_SPEC`, warning
severity filters/counts and `rulesOffCount` / RULES MODIFIED stamp. Ordinary Reset to standard resets warning rules,
not this independent opt-in; the switch itself turns it Off. Wire boot/session reset and settings restore to avoid a
previous fixture/session leaking the value. Verify the actual settings command's undo behavior if exposed; do not
promise a new special Undo capability or refactor unrelated Logic configuration.

Toggling Off retains valid answers and suppresses question UI. Toggling On reuses applicable answers and automatic
roles; unresolved people keep ordinary total bars. This is the minimal reversible technical policy implementing the
approved setting and memory behaviour, not authorization to delete answers. Context-changing edits while Off still
invalidate stale answers within that edit. The toggle itself changes no day, pending count, issued record, signature,
crew, warning or OIL amount; never stamp role data onto issued days. No mass prompt upon enable or reload.

## 7. Editing interaction and presentation

Share one transient role-question controller between Edit Schedule and Board, with source-specific adapters for
their different native commit/focus events. Do not make a role field permanently visible or reuse the SC role picker.

For a newly saved relevant edit, commit text first and request the question only when tracking is On, the formation
is eligible/conditional and unresolved. Show it after the blur/change and the next pointer/Tab transition settle.
For existing unresolved data reached later, focusing and leaving its relevant Remarks editor offers the same question
even if text is unchanged; do not require fake text edits. A valid chosen answer offers **Change mission role** only
while that Remarks editing context is active (D527). Clicking it opens the same question without changing text or
clearing the answer in advance. Leaving without a replacement retains the valid answer. Exact access appearance and
incomplete-bar explanatory copy await the final pictures.

Allow one active question at a time; another actual relevant editing action can replace the transient question.
Switching day/week, closing Board, changing page, signing out or losing edit permission dismisses it without changing
saved text. No automatic re-open loop on notify/render, no persisted dismissal record, no queued bulk questioning.
Returning to the relevant editor is the door to answer later. Turning tracking Off also dismisses it. The resolver,
not a stored popup flag, decides whether the data is unresolved.

Insert the callout after AREA inside the formation's normal flow, outside aircraft rows. It may move later content
down temporarily (approved D520); it must not cover Remarks, steal focus, scroll automatically or destroy the next
input/caret. Preserve the existing Enter-to-commit and Escape-to-restore-text semantics. Entering/leaving the correction
action must not erase it before its click fires. Use real labelled buttons and a polite announcement; no focus trap.
Test keyboard Tab/Shift-Tab, mouse/touch, short viewport and visual-viewport shrink. Chromium emulation is not proof
of physical iPhone keyboard behavior; any remaining device-only limit goes on the owner's look card.

The chart consumes one `computeInsights()` result. Keep total `n`; add blue, red and unresolved counts from each
eligible occupied seat. Assert `blue + red + unresolved === n`; when unresolved is zero, `blue + red === n`.
If Off or unresolved > 0, render the ordinary total style with no blue-only claim. If On/resolved, draw contiguous
blue then red segments scaled against the largest person's total; the bar's combined length and right-hand total
stay the same. Use readable text/accessibility counts so colour is not the sole distinction. No hours split.

Show all expands the same sorted list, preserving total scale and scroll. Reset to initial twelve on a newly opened
modal/week; keep expansion during ordinary updates within that opening. No new persistent preference or pagination.
Zero/one-sided/mixed cases must render without phantom segments. Preserve every other Insights section.

Board opener uses the existing shared `setInsights` modal. Final pictures are to confirm the desktop position and
phone overflow item without resizing existing buttons (D487) or adding a second toolbar row. Ensure Insights is above
Board and other actual opening surfaces, with real hit testing; close returns to the same Board/day/scroll. Put the
phone overflow menu away before opening; Board itself remains open. D478 still counts the latest issued day even when
the Board is previewing an older version. Do not silently broaden Board read-only/edit access.

## 8. Build sequence and first failing tests

1. **Bind plan/pictures in the new chat.** Re-read AGENTS and full governing rows; verify branch/source baseline and
   independent plan dispositions. Inspect overlapping active work. Establish FULL evidence sheet and writer/surface
   roll-call before source changes. Keep the untouched behaviours pinned. No branch reuse from other reviewed builds.
2. **Pure roles + schema.** Write failing examples for exact Mission matching, token cues without direction inference,
   conditional unanswered state, context retention/invalidation and malformed values. Implement one resolver/types.
3. **Saved lifecycle.** First failing production-route tests for Remarks+invalidation atomicity, role answer Undo/Redo,
   stale popup identity, role-only pending/signature/AL/history/revert, copies/templates and off-mode forward edits.
   Implement the central writer/finalization and canonical/restore wiring, then exercise each actual writer route.
4. **Logic configuration.** First failing tests for default Off, persisted On/Off, runtime setting restore, permissions,
   no rules stamp, no day/signature mutation and no enabling prompt burst. Add the approved card and typed settings path.
5. **Both editing surfaces.** Failing route tests for save-first, delayed question, correction without rewriting,
   automatic-red suppression, dismissed/unanswered reopening through Remarks, and no typing/Tab/click disruption.
   Wire the shared controller to real editor events and add scoped styling.
6. **Insights/Board.** Failing tests for mixed/full-total/incomplete counts, latest-issued answer boundary, preserved
   cancellation/standalone/identity/hours, Show all and both actual Board openers. Build only the final approved look.
7. **Real app check.** Finish meaningful tests, gates and FULL frozen-build walk below. Record every finding and fix with
   its initially failing test; re-walk affected routes. Fresh Astra final inspection receives code and complete evidence.

Suggested suites to extend: `engine/insights.test.ts`, `ui/insights-published.test.tsx`, `ui/textedit.test.tsx`, Board
Remarks/edit tests, schema/canonical/restore/drafts/publish tests, `state/sched-routing.test.ts`,
`state/sched-dayrecords.test.ts`, `state/people-settings-commit.test.ts`, permissions and settings reader tests.
Add focused mission-role tests and one feature route suite rather than scattering duplicate expected-value tables.
Use actual screen writers for integration claims; direct-object fixtures are fine for pure resolver tests and must
be labelled as such. No test weakening, unrelated tidy-up, dependency change or engine reformatting.

## 9. Independent scenario matrix (Astra-authored for Sol's build)

This matrix is scenario design by the non-builder, **not execution or approval**. Every row needs setup, action,
observed assertion, result and evidence link in the build sheet. Tests must fail when the named route is disconnected.

| ID | Setup and action | Required observable / disproof target |
|---|---|---|
| M01 | Tracking On; Mission DS / RED / RED AIR, case/spacing variants; unrelated Missions | Automatic named Red, no question/override; exact other names follow cue policy, never substring Mission matches. |
| M02 | ACM with DS FOR, DS FROM, external-unit DS and RED AIR Remarks; then near-miss words | Every real cue asks without preselecting a side; near-miss substrings do not. All aircraft in a formation share the chosen side. |
| M03 | One person has Blue2+Red2, another only Blue, another only Red, one unresolved among four seats | Totals unchanged; mixed segments total4; one-sided bars valid; unresolved person's whole bar ordinary4, never a misleading partial split. |
| M04 | Empty seat, pilot+WSO, same id both seats, cancelled aircraft/form, SC/AVALON/BB and SC main hours | Existing aircraft/person count units preserved; exclusions add no unresolved role or colour; hours equal baseline. |
| M05 | Choose role; edit crew/time/area/non-cued Remarks; reorder aircraft/formations | No repeated question or lost choice; active popup follows stable formation identity, not positional index. |
| M06 | Choose role; edit Mission, FOR→FROM, supported name, add/remove last distinct cue; case/space only | Material changes invalidate with the text edit; normalization-only changes retain. No old answer becomes applicable merely by toggling On. |
| M06a | ACM, choose Red for `DS FOR VL; REJOIN 1430`; change only `1430`→`1440` through each real Remarks editor, then change VL→RU / FOR→FROM in the cue clause | Timing-only separate-clause edit saves and retains Red without asking again; cue-clause changes clear the answer with that edit. This is Sol's independent R1-01 regression case. |
| M06b | Reorder semicolon-separated clauses; change case/space; add/remove a non-cued clause; supply a newline and inspect the saved text; finally edit undelimited `DS FOR VL REJOIN 1430` | Equivalent retained clause set keeps the answer; newlines collapse to spaces and cannot masquerade as preserved delimiters; undelimited cue-clause edits follow the explicitly bounded policy, never direction inference. |
| M07 | Save cued Remarks and leave unanswered; close Board/page, reload, switch week and return | Text persists, role unresolved, ordinary total. No save/publish block. Relevant Remarks access can reopen without a fake edit; no render loop. |
| M08 | Correct answered role through temporary action, abandon once, then answer opposite side | Wording untouched; abandonment keeps prior valid answer; replacement is one separate action; no permanent schedule marker. |
| M09 | Answer after Remarks save; Undo, Undo, Redo, Redo; repeat after publication | First Undo removes later answer only; next restores text+old answer together. Correct history attribution and no accidental issued mutation. |
| M10 | Open question, then reorder/delete formation, change context, navigate day/week, lose permission or turn Off | Cannot answer onto wrong/stale record. Harmless dismissal/re-evaluation; no answer command after authority/context is gone. |
| M11 | Create/copy through each plus, wave/day template, saved plan and supported ingestion path | New unresolved is legal; exact applicable answers copy as independent content with new IDs where appropriate; transformed context never keeps stale answer. |
| M12 | Signed issued day with one conditional answer; change role only; compare every Insights opener; publish AL | Pending/history/signatures reflect role-only edit; figures keep latest issued answer until AL, then move together; untouched day's signs/records unchanged. |
| M13 | Publish unresolved, later answer; preview Original while latest AL exists; load earlier version onto working copy | No answer-required publish block; latest-issued rule always wins in Insights; loading content is pending, not historical mutation. |
| M14 | Role-only change then revert to issued answer; duplicate/select saved plan; Undo/Redo publication | Canonical pending clears on true revert; plan/signatures keep proper identity; publication Undo follows existing boundary/disclosure rules. |
| M15 | Default missing setting; enable, reload, disable, relevant edit while Off, enable | Uniform Off default; persistence works; valid answers retained, stale rejected; no mass prompt, no day/pending/signature or OIL writes from toggle. |
| M16 | Admin editing/not editing Logic; member, guest/pending, stale enabled markup/direct setter | Existing permission policy enforced in UI and write/command paths; feature toggle never counted as changed warning severity. |
| M17 | Twelve, thirteen, many flyers; long callsigns; empty week; mixed/unresolved display; Show all | Initial12 and reachable expansion, correct sort/scale/counts, work-hours list remains complete; no clipped numbers or misleading legend. |
| M18 | Shell desktop, phone drawer, Board desktop and phone overflow; older Board version selected | Every real opener works and modal is topmost by elementFromPoint; close returns to the original state; all use identical data. |
| M19 | Both editors: type cue, Tab/Shift-Tab/click next input, Enter, Escape; correction-action click | Text saves when intended; no question during typing; next target/caret survives; Escape does not manufacture an edit; Remarks never covered. |
| M20 | Phone390×844, desktop1440×1000, short390×568 and short laptop; simulated keyboard viewport shrink | Question/access stays reachable by normal scrolling, existing controls keep size and toolbar rows; no automatic scroll/focus theft. Record real-device limits. |
| M21 | Repeat targeted changes on long everything-day, then unrelated day edit, wheel/drag/week navigation | No unrelated repaint/write, scroll retained, transient nodes bounded, one shared computation; current perf/geometry ceilings respected. |
| M22 | Failed/unauthorized role command or invalid imported answer; Undo after another actor changes same day | No partial text/role save or unauthorized write; recorded before-images restore correctly; existing actor/conflict refusal preserved. |

Meaningful action pairs, both orders, on draft and issued days: cue edit ↔ role answer; Mission change ↔ answer;
crew/time edit ↔ answer; Off/On ↔ relevant edit; copy/template application ↔ role answer; correction ↔ publish;
cancel/uncancel ↔ answer; navigation/reload ↔ unanswered state. Do not test impossible orders by inventing controls:
state the precondition and use the legitimate unresolved/automatic outcome. Shared backend proof may run once under
D499, but each editor route and each different phone/desktop control is operated. Add a row for any discovered writer.

## 10. FULL verification and delivery

Risk answers: (1) earned leave **No**, no earning/count-as-present change; regression invariance is still observed;
(2) published record **Yes**; (3) saved data **Yes**; (4) shared drawing **Yes**; (5) new controls **Yes**;
(6) new temporary row **Yes**; (7) permission enforcement **Yes**; (8) warning/rule meaning **No**, deliberately
unchanged with regression checks. Therefore **FULL**, superseding early WALK estimates. Tell the owner the checks and
rough 3–5 hour check allowance before executing; evidence determines completion, not elapsed time.

Before the walk, produce the full roll-call: Logic read/edit; Edit Schedule remarks/correction; Board remarks/correction;
View-only/issued/print/peek (no role editing/line marker); Insights from shell/drawer/Board; every writer in §5;
changes/history/pending/signatures/version loading; persistence/Undo consumers. Each entry states has it / must not,
with reason / missing, its usable door, and overlapping warning/history/toolbar pixels. No blank cells.

Maintain a deterministic everything-day fixture containing ordinary/automatic/conditional/unanswered/mixed flights,
both seat types, cancellation, standalone/main/spare duties, warnings, thirteen-plus flyers, signed issued and draft
days, latest AL and parked plan. Extend the existing demo fixture appropriately without rewriting issued history or
bulk backfilling roles; ordinary fixture setup for the walk uses app controls, including enabling tracking and choosing
roles. Do not inject role values and call the editor door proven. Reuse existing fixtures for unchanged cross-area
baselines; do not add unrelated feature work.

Read `docs/gates-and-deploy.md` before running the actual checks. From the build checkout's `raptor-port/`, run the
required unit, build, reference, browser, Tracker, rule and document checks plus the UI performance check:
`npm test`, `npm run build`, `node reference/tfin.js`, `npm run test:e2e`, `npm run smoke:tracker`,
`npm run rulecheck`, `npm run docsize`, `npm run perf`. Preserve applicable adapted probes required by the current
guide. Take the PC lock from the repo root before full unit, multi-file browser, Tracker or fanned-out walk:
`node raptor-port/scripts/gatelock.mjs take "codex/insights-mission-mix — <run>"`; release immediately after the run,
success or failure. One full check at a time across all checkouts. Use absolute working directories for background work.

Freeze the exact production bundle/source fingerprint for the scripted runtime walk. Do not rebuild while walkers
use it. Long walks may split distinct scenarios across Sol helpers with isolated browser worlds/ports, under one
coordinated lock; Claude's cheaper-walker trial stays owed after the reset. Capture distinct proof states at the
required widths and short heights, open **every** saved picture, watch page errors, assert focus/geometry/hit targets
and visible outcomes. One deliberately disconnected-wire failing test per wired surface, restored afterwards; do not
claim a screenshot proves an interaction. New behavior tests go red before implementation; preserved behavior stays
pinned against baseline. New source changes after a frozen walk require affected re-walk and appropriate rechecks.

Keep the sheet at `docs/handpass/<build-date>-insights-mission-mix.md` with pictures under the matching `docs/img/handpass/`
folder, exact baseline/fingerprint, rule sweep, matrix results, failure evidence, dispositions, gates, omissions and
device limits. Fresh Astra inspector gets this sheet, final diff, applicable rules and the standing finder brief,
including D56's **two-condition** exclusion. Max two inspection rounds (initial plus fresh after fixes); report any
unresolved finding honestly. Do not claim owner/Claude approval from green tests or from this scenario plan.

Update lasting `ui-contracts`, `engine-rules`/behaviour register as applicable, `remarks-vocabulary`, `feature-impact`,
`data-schema`, `data-model` (Formation and Setting tables/permission mapping), `file-map`, backlog and own HANDOFF
block in the same build change. Do not trim documents with source changes. Keep protected working guides/reviewer
briefs unchanged. Host runs docsize for planning-only edits too. Owner look card: split totals; unresolved total and
answer-later route; quiet Remarks editing/correction; optional Logic switch; Board entry/return, with device caveat.

End build report with actual checks and Walk line, recorded rulings, preview link once ready, and the explicit owed
Claude read. Commit/push only the build branch when permitted by the standing running-check rule. This plan itself
has no executed test or application-walk evidence and cannot authorize the new-chat build before final agreement.

## 11. Independent plan challenge dispositions

**Sol round 1, R1-01 — accepted and revised, not self-approved.** Reviewed draft SHA256:
`E18368543A1C0635A87D3A6358F5A50105A78B71B4143A611F479F91CAC3129D`.
The previous whole-Remarks context cleared a valid role after a separate timing-clause edit, although its support
wording had not changed. Section 4 now fingerprints semicolon-delimited cue-bearing clauses only. Source inspection
confirmed semicolons survive the shared text funnel and newlines do not; neither editing route receives a new parser
or normalization behaviour. M06a carries the exact independently supplied counterexample and both invalidating
support edits; M06b checks the delimiter boundary and documented undelimited-prose limitation. Sol must independently
assess the revision. All other scope/approval boundaries remain unchanged.
