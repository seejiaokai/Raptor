# Interface readability and scroll build plan — 4 Oct 26

Author: Astra coordinator/scenario designer. Status: proposed, awaiting Sol's independent challenge and
numbered candidate picture checkpoint before source work. Owner authorized the three-feature batch after
D560–D562; no repeated build-permission question is needed. Spec:
`../specs/2026-10-04-interface-readability-scroll.md`.
Baseline source: `2f7ad9b1311fdb15959ef398ee9cdc6f99e8b584`; current entry is the records-only continuation
on `codex/workflow-ui`. Host verifies current HEAD and origin before execution. Same checkout; preserve
the two old untracked folders, every prior evidence snapshot and private attachments.

## 1. Read and source findings

Required context read: AGENTS bridge, current handoff, all six general rules, project guide and applicable
full-text slices, Scheduler and Tracker rulings, executor, D496 workflow including D499, bug-check order,
performance Part 1, feature-impact surface map/checklist and Impeccable SKILL/shape as read-only advice.
Applicable decisions: D157, D464, D487, D496/D499, D536–D538, D541, D550–D562 and the subsequent batch-start
word (host records its ruling). The shared-colour and authored-font boundaries are constraints, not proposals.

- `src/tracker/app/core.js` `innerShape` emits a narrow ten-point flight polygon; `ballGroup` puts dark text
  over it. Outer geometry is independently fixed at 58 units with a 0.33 inner radius. `ballFontFor` reads
  saved per-ball/global font choices. `renderBoard`/`wireBoard` serve normal, Details and Edit chart layout
  modes through the same SVG, with different interaction wiring. Change shape output only; never its writers.
- Existing `trk-palette.test.ts` and Tracker smoke measure a colour contrast floor of 4.5:1. They do not prove
  that label ink actually lies over that colour. Add geometric backing proof, not another token-only assertion.
- `LogicPage.tsx` renders one `.lgbar`: search, filter group, editing group, count. `01-logic.css` makes it
  sticky at `top:0`; Shell's `.topbar` also sticks at zero with higher stacking. Measure the actual occlusion
  before fixing it. Phone search and count each force a full row; filters/edit group wrap independently.
- `Modals.tsx` Insights uses one `.modal-box` scroller and its existing `.modal-head`/`#insightClose`.
  `08-windows-tools.css` owns all windows' height; `21-insights.css` is the scoped home for this change.
  `ScheduleInsightsMenu.tsx` restores phone opener focus through the unchanged close id. Existing outside
  dismissal helper preserves a drag begun inside. Do not add a new Escape behaviour under cover of this task.
- Existing targeted coverage: `logic.test.tsx`, `outside.test.tsx`, `modal-phone-height.test.ts`,
  `schedule-insights-menu.test.tsx`, `trk-palette.test.ts`, Tracker smoke, `e2e/insights.spec.ts` and geometry.

## 2. Risk tier and execution boundaries

| Standing question | Answer and reason |
|---|---|
| 1 earned leave/presence | No: no entitlement or count calculation changes. |
| 2 published record | No: no version, sign-off, publish or issued-copy changes. |
| 3 saved data | No: rendered polygon and local chrome only; no new stored fields or writers. |
| 4 shared drawer | Yes: one flight renderer across modes/charts, one Insights window across its doors. |
| 5 new gesture/control | No new action; existing hit targets and scroll reachability change and are walked. |
| 6 new surface | No: three existing surfaces. |
| 7 roles | No: current permissions and role-specific actions remain. |
| 8 warning/rule meaning | No: Logic chrome changes; rule words, filtering algorithm, values and engine stay intact. |

**WALK for the whole batch**, all normal gates retained; estimate roughly 1–1.5 hours of checks after build,
excluding repairs. Reclassify FULL before changing a writer, rule meaning, permission or published reader.
One independent scenario list below, one evidence sheet, fresh separate Astra final inspection after walk/gates.
Sol's challenge is independent plan approval only. Astra coordinator does not approve this plan or final code.

## 3. Implementation sequence

1. **Candidate and failures first.** Record baseline geometry and one failure per promised behaviour on the
   actual built baseline. Host makes private, numbered phone/desktop candidates using the existing palette
   and source structure, opens them and shows them before source edits. Record exactly which candidate is
   used. Picture evidence is design evidence only. Preserve initial failures. Do not install packages.
2. **Flight shape.** Replace only the `type === 'flight'` polygon with the shown broad-wing silhouette. Its
   horizontal label band must contain the standard flight-code glyph area, including descenders, while
   keeping tips/body inside the crew-ring hole. Keep one filled shape immediately before text so existing
   colour checks still measure the right element; no opaque rectangle over wedges. Retain all colours,
   number badges, fonts, hit disc, ordering, event ids and stored layout. Other shape branches byte-unchanged.
   If a band cannot accommodate normal built-in labels inside the existing hole, return to the picture
   choice rather than clipping, shrinking or silently increasing the radius.
3. **Logic offset and density.** Fix `.lgbar` clearance below the actual topbar; use a narrowly scoped
   measurement in LogicPage observing topbar size/resize, initially measured when Logic is visible. Write
   only the bar's own style, not a custom property on body/root/dense-tree ancestors. Disconnect on unmount,
   avoid React store notifications and per-scroll layout loops. Verify hide/return and long/wrapped header.
   Repack existing groups with local flex/grid styles or minimal grouping markup; no duplicate controls,
   field remount on typing, handler rewrites or new menus. Keep search's id/value and native input operation;
   scope density styles to Logic so shared `.abtn`/`.fchip` sizes elsewhere remain unchanged. Prefer reduced
   gaps/padding over smaller text; 320px may need an extra row, never overflow or concealed actions.
4. **Insights header.** Make `#insightModal .modal-head` sticky within its existing `.modal-box`, with opaque
   matching background and local stacking sufficient over the chart; retain radius and button dimensions.
   Keep header text wrap from squeezing/hiding the cross. Do not change shared window heights or close/focus
   code. Verify sticky containment rather than moving to a second scroller unless actual evidence requires it.
5. **Focused regressions.** Use real browser geometry for painted/hit results. Add meaningful mounted tests
   only for any changed Logic measurement lifecycle/cleanup or grouping behaviour; do not test CSS text as a
   substitute for scroll proof. Keep current tests and assertions. Add D560–D562 trace names to relevant tests.
   Small targeted runs during fixes; one combined broad run after the final build and walk fixes settle.
6. **Record and freeze.** Host updates the lasting contracts, backlog and own handoff, with new file-map
   entries for any new source/test/driver; no working-guide edits or document trimming in the source change.
   Bind snapshot to source/tests/plan/driver/bundle hashes and nonempty actual served-asset matches before walk.

## 4. Surface and door roll-call

Fill actual outcomes before final inspection; these are required expectations, not pre-filled passes.

| Surface/door | Must show/operate | Preserved overlap or exclusion |
|---|---|---|
| Tracker Flow, all loaded charts | New blue flight centre; centre still opens existing grading action | Every student wedge, selected edge, failure ticks, number, availability/search rings. |
| Tracker Details on, Flow | Same new centre; hover/tap opens existing details | Text crossing the centre must not cause flicker or intercept label clicks. |
| Tracker Edit chart layout | Same new centre; move/select/text/connect hit behaviour retained | Existing grips, ports, selection, pinch take-back and saved chart positions. |
| Tracker non-flight symbols/key | No redesign: non-flight symbols and key remain | Their label colours and student picker are unchanged. |
| Logic admin view/edit/modified | Search plus all eligible filters/actions/count remain visible on scroll | Topbar overhang, Reset/Done, long count, keyboard/focus. |
| Logic member | Search/filters/count visible; existing read-only restriction | No edit/Done/Reset authority introduced. |
| Insights from desktop week direct door | Cross visible through long-list scroll and closes | Existing chart/Show all, body last row, surrounding sheet. |
| Insights from both phone schedule menus | Same header and working close, return focus preserved | Week toolbar remains behind; selected context/data unchanged. |
| Insights from Board desktop/phone overflow | Same close stays on top of Board and returns to it | Modal above fixed Board; own-hit test at header/cross centre. |
| Guest tree and unrelated popup | No new Insights entry or generic sticky-header redesign | Existing guest access/request route and unrelated window geometry. |

## 5. Independent scenarios — Astra, before Sol builds

Use one synthetic reusable Tracker course/chart built by normal controls, with at least three students,
all event types, standard and long flight labels, custom saved font/position/details, mixed grades, N.A.,
failures, number, availability and search rings. Existing shipped course is also read without modifying its
syllabus. Scheduler fixture uses existing everything-day helper through legitimate controls/signers; keep a
published day with pending edit and an unpublished day. No private owner data enters fixtures or artifacts.

| ID | Setup/action order | Required result / concrete failure signal |
|---|---|---|
| T1 | Actual shipped flights, Flow and Edit layout, normal plus longest codes at phone/desktop | Label ink has continuous blue backing; dark/blue contrast >=4.5:1. Fail if glyph-area sample lies outside filled flight silhouette. Assert nonempty flight count and inspect readable crops. |
| T2 | Synthetic label/custom font/number; three students with different grades, fail and N.A.; select another wedge then centre, reverse order | Wedge selects the right person, centre opens their existing popup, overlays remain legible. No lost wedge area, different student or changed saved font/layout. |
| T3 | Details on→tap/hover flight→cross text/wing; Details off→tap; leave/return Tracker | Correct details/marking modes, no hover flicker caused by new shape, no altered chart or lost place. |
| T4 | Search flight→available/search rings together→zoom; edit mode→move→Undo/Redo; two-finger pinch after first-finger drag | Rings stay distinguishable, new centre stays inside ring, move/undo work and pinch takes back drag as before. Actual touch sequence, not screenshots as gesture proof. |
| T5 | Save synthetic details/font/layout, close/reopen and reload, inspect/export via existing UI | Same chart ids/labels/fonts/positions/details and student marks. Presentation change writes no chart or student data. Current export data unchanged in meaning. |
| L1 | Logic top→scroll well below first screen→native type into search→clear; reverse search→scroll | Search and all strip controls remain below topbar, on-screen and own-hit. Correct filtered results/count and no rule writes. No forced page jump that conceals the input. |
| L2 | All/Warnings/Advisories/Notes/Fired filters with/without text and zero match, both action orders | Same filtering/content/count as baseline; strip height reduced at reference phone width, no lost action or page overflow. |
| L3 | Admin Edit→change one legitimate setting→Done→Reset; scroll before/after each; query retained | Controls remain usable, legitimate rule change and existing reset work normally; no accidental writes from scroll/filter. Restore fixture through real Reset. |
| L4 | Actual member opens Logic and repeats search/filter/scroll | Current read-only text and absent edit actions; no permitted field gained. |
| L5 | Resize 320/390/820/821/1440; short landscape/700px laptop; long account header; navigate away/back | Local offset updates to true topbar height, control rows fit and no stale header clearance. Search survives input/focus; no animation/frame loop on scroll. |
| I1 | Every roll-call Insights opener→Show all→scroll top/middle/bottom→native tap cross | Cross stays visible, own-hit and closes to correct underlying surface; body last row remains reachable. No Board stacking trap. |
| I2 | Phone schedule keyboard opener→scroll→close, reopen via pointer; Board close/reopen | Existing focus return still works; no new Escape or focus policy. No stuck menu, wrong day/context or unexpected scroll lock. |
| I3 | Long/short Insights content, narrow title and short viewport, resize while scrolled | Title can wrap but cannot consume the cross. D536/D537 visible-screen bound/thin top strip and short sheet sizing retained; no chart text through header. |
| I4 | Start text drag inside→release outside; then real outside press/click; close cross | First gesture stays open, true outside and cross retain dismissal. Break if sticky layer intercepts or changes dismissal ownership. |
| I5 | Published day with pending edit vs unpublished fixture, open via all available doors | Charts/values/version labels equal the unchanged baseline for each context; search/scroll/open/close/Show all cause no domain, issue, sign-off, history or storage mutation. |
| X1 | Tracker→Logic→week→Insights and back; actual admin/member plus guest route | No CSS leakage, stranded scroll/focus, permission change or new guest door; errors collected throughout. |

D499: share identical functional proof once on frozen build, but each distinct door/surface has actual operation
and geometry at both widths. Repeat differently wired actions; do not multiply the same long data lifecycle only
because viewport changes. 320 and short-screen coverage is geometric/interaction proof, not a second whole walk.
Geometry tests may set scroll position to pin layout, but the recorded native walk actually scrolls through the
surface. Label proof uses glyph/character geometry or equivalent rendered coverage, not a bounding-box colour
assumption. Avoid a brittle “all text bbox corners” assertion when corners include empty space; combine actual
ink-region sampling, silhouette containment and inspected closeups.

## 6. Break tests, gates, evidence and release

Before production changes, retain failing L1/I1/T1 checks against the baseline. After wiring, deliberately
restore old wing, remove Logic clearance/compact styling, and remove Insights header stickiness one at a time;
each corresponding named test must fail on every required renderer/door family it claims. Restore exact final
bytes before rebuilding/freezing. Do not weaken an old assertion or change expected data to make it pass.

Take the single-PC lock before full unit, multi-file browser, Tracker smoke or fanned-out walk; release immediately
after each run. Gates from `C:/Users/User/projects/Raptor/raptor-port`: `npm test`, `npm run build`,
`node reference/tfin.js`, `npm run test:e2e`, `npm run smoke:tracker`, `npm run probes:adapted`, `npm run perf`,
`npm run rulecheck`, `npm run docsize`. Preserve complete logs/exit codes. Run focused tests after a repair;
repeat broad gates only for a new relevant change/failure/concern. No rebuild beneath an active frozen walk.

Evidence sheet: `docs/handpass/2026-10-04-interface-readability-scroll.md`, with eight answers, rules, completed
roll-call, named scenario results, first failures/dispositions, red break tests, gate output, omissions and Walk
line. All screenshots/fixtures with images stay in PRIVATE task storage outside public repo. Open every saved
picture before counting its step as inspected; use a deliberate small set of distinct states and readable crops.
Measure before/after strip rows, hit ownership, label backing and touched interactions on built bundle at 4x
CPU; do not claim speed gains without paired results. Preserve existing DOM ceilings and no-per-scroll-write rule.

Fresh Astra inspector receives immutable brief, exact final snapshot, complete evidence and reports, scenarios,
roll-call and D56 exclusion; demand concrete failure/cause/fix and missing-door checks. Initial read plus one fresh
read after repairs; unresolved after that is reported. No code edits while read is in flight. Plan challenge cap
three. Keep exact plan hash at dispatch and all dispositions. Sol never approves its own code; coordinator never
approves its own plan or substitutes this list for the later fresh read.

OWED: Claude's plan/code/scenario and independent desktop/phone app reads after Monday 5 Oct 2026 19:00
Asia/Singapore on `codex/workflow-ui`, including this batch and the earlier split/repair/keyboard/menu work, before
main. Physical Safari/address-bar and hardware keyboard proof stays explicitly unverified unless owner supplies it.
Earlier branches' separate owed reads remain. Branch-only text/source push after checking PR runs, Ready preview
receipt and owner link; never publish private images, never main/merge/merging PR. Host closes its own handoff only.
