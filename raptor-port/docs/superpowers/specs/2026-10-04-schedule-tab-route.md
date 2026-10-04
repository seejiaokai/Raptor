# Schedule Tab route — proposal for the owner, 4 Oct 26

**Status: product choices settled — B, D554; supporting headings/notes, D555.**
**D556, 4 Oct:** owner accepts the full numbered week/Board pictures, "Ok looks good
u can build". Implement the agreed route under the independently challenged R2 plan;
FULL checks and a fresh independent final read follow. No broader layout or main approval.
Owner, 4 Oct 26: "lets do B flow". B now governs the existing flight details on both
screens: Callsign → Mission → Brief → Take-off → Landing → Remarks → stores text.
Shift+Tab reverses B. This is a route choice after the shown comparison, not code
approval or a broader layout change. The candidates below remain as the design record.
Read-only source findings below are not proof of a working new route. The host captured
the unchanged app at desktop/phone sizes; Astra opened both week-formation crops and
read their measured geometry. Numbered annotations show proposals before owner choice.
Picture: [unchanged-screen route comparison](2026-10-04-schedule-tab-route.png).
Sol recommended across-first to preserve the original right-first intent; Astra
recommended B for familiarity. The owner settled that tradeoff by choosing B (D554).

## Settled scope

D550–D553 accept both Edit Schedule's week and the Scheduler Board; text boxes already
available for typing, empty ones included; reverse Shift+Tab; and leaving the day's last
box for ordinary controls without looping or changing day. D554 narrows D545's original
rightward/next-row intent to B, even when it first moves down on the week view.
D544 keeps Enter/Escape. D529 keeps unchanged Remarks silent.

The job is faster schedule entry by a scheduler already working in the dense day view.
Impeccable's Shape/Operate guidance is used for task order and familiar controls. The
existing app is the visual authority. No layout, button-size, popup, crew-header, or
phone Desktop repair change is proposed (D487, D547–D549). No skill/configuration edit.

## Choice 1 — B chosen, D554; comparison retained

The week stacks Callsign above Mission, and Brief above Take-off. Landing and Remarks
are in columns to their right. The Board places the five flight fields across one strip.
Normal phone Board places Remarks/stores below that strip. These are existing layouts.

Two concrete readings must be shown, not silently conflated:

- **Spatial reading:** across the visible columns, then the lower fields. For the
  captured two-aircraft example: Callsign → editable Brief → Landing → Remarks 1;
  return left: Mission → Take-off → stores text 1; then Remarks 2 → stores text 2;
  finish Area → Area time. The editable Brief is the empty dash below the blue
  suggested time, not that suggestion. This deliberately groups staggered controls;
  it does not claim equal vertical coordinates. The observed desktop top edges are
  Callsign 452.9, Brief 462.9, Landing/Remarks 453.9, Mission 468.3, Take-off 476.7;
  phone stores text also wraps below its chips. A purely pixel-sorted route would
  differ. This candidate is closest to D545's right-first intention; its field order
  differs between week and Board. Long/missing content still needs the chosen rule
  defined explicitly, not rediscovered from accidental text baselines.
- **Task sequence (recommendation, requiring explicit clarification of D545):**
  Callsign → Mission → Brief → Take-off → Landing → Remarks → stores text, keeping
  the flight details together even when a pair is stacked or Remarks wraps below.
  This moves DOWN from week Callsign to Mission, not to the next box on the right.
  Benefit: a stable entry sequence shared with the Board, unaffected by text wrapping.
  Cost: it is not the week's literal visual row-reading order. Now chosen under D554.

For the task-sequence proposal, the week visits its shared formation fields once,
then each aircraft's Remarks/stores in displayed order, then Area → Area time.
The Board visits every displayed aircraft row, including its repeated editable flight
fields, before Area → Area time. Do not silently deduplicate Board boxes. A standalone
wave visits only the fields it actually shows; do not add the Board's SC report box
to the week. Shift+Tab is the exact reverse of the selected route.

## Choice 2 — supporting text and section boundaries accepted, D555

**Owner answered "Yes", D555:** include each already-available text heading,
in-time/Rally line, row and notes box in its displayed position within the day:
heading/intro text → rows → notes below those rows → next open section. Follow the
owner's current section arrangement, not a fixed canonical list. An empty or folded
section with no available text contributes no stops and stays closed.

This includes editable week wave labels and duty-block labels, existing overall notes,
section Scheduler/Public notes, Area/time, stores text, and input-owned times/Remarks.
Board's wave selector, crew pucks, suggested-brief acceptance, buttons and popup doors
are not text stops. Focusing a text box must not simulate a click to open its picker.
Normal phone wrapping changes where a box sits, not which logical item owns it; under
the task-sequence choice, finish the wrapped item's Remarks before the next item.

Forward day exit is already settled by D553. D555 also accepts the symmetric reverse exit:
Shift+Tab from the first text box leaves to the preceding ordinary control without
looping or changing day. Keep the end caption "Leave text entry; stay on this day".
Ordinary-control destinations are a focus-preservation detail, not a new product
question unless an actual user-visible day switch or competing choice is demonstrated.
Focusing a button does not itself activate it or change day. Do not label Done as the universal
forward destination: Board Done precedes its schedule in DOM, and the week's following
day has its own controls. Ordinary exit must not focus the hidden week behind Board,
enter a different day's text route, activate a control, or open anything automatically.

## Annotation data for the unchanged app

**Complete numbered examples requested by the owner, 4 Oct:**
[Edit Schedule week](2026-10-04-tab-flow-pictures/week-flow.png) and
[Scheduler Board](2026-10-04-tab-flow-pictures/board-flow.png).
Each displayed section has one representative row/formation, with repeated rows
and final notes stated explicitly. Numbers restart in each section; actual section
order remains user-controlled. [Phone week flying](2026-10-04-tab-flow-pictures/phone/week-flow.png)
and [phone Board flying](2026-10-04-tab-flow-pictures/phone/board-flow.png) show wrapping.
The full editable-field manifest, originals and browser annotation scripts are
retained in that folder. The host inspected both final posters and phone originals;
Astra inspected all fifteen desktop originals and both posters, asking for the
week Ground notes to be recaptured above the fixed bar. That capture was corrected
and the final week poster reopened. These are pre-build design examples; current
implementation proof is recorded separately below.

Use the captured real editable two-aircraft formation with its empty Brief: mark the
editable dash distinctly from the blue suggested time. Keep original labels/values and
add external numbered markers only. A separate phone image shows
the existing wrapped Board row. A short section strip shows header → rows → notes →
next open section. Pictures are design aids, not evidence that the new route works.

The addresses below assume day/wave/formation/aircraft `0.0.0.0`; substitute a verified
visible formation as needed. Scope week queries to its live day and Board queries to
the exact aircraft row so repeated keys do not annotate the wrong node.

| Label | Week selector under `#eWeek .day[data-day="0"]` | Board selector under `#sbBoard .sb-line[data-move="mv:ac.0.0.0.0"]` |
|---|---|---|
| Callsign | `[data-txt="ff:0.0.0.cs"]` | `[data-bfld="ff:0.0.0.cs"]` |
| Mission | `[data-txt="ff:0.0.0.msn"]` | `[data-bfld="ff:0.0.0.msn"]` |
| Brief | `[data-txt="ff:0.0.0.br"]` | `[data-bfld="ff:0.0.0.br"]` |
| Take-off | `[data-txt="ff:0.0.0.to"]` | `[data-bfld="ff:0.0.0.to"]` |
| Landing | `[data-txt="ff:0.0.0.ld"]` | `[data-bfld="ff:0.0.0.ld"]` |
| Remarks | `[data-txt="fr:0.0.0.0"]` | `[data-bfld="fr:0.0.0.0"]` |
| Stores text | `[data-bombs="0.0.0.0"]` | `[data-bombs="0.0.0.0"]` |

Area/time sit outside the Board row: use the appropriate live surface's
`[data-area="0.0.0"]` and `[data-atime="0.0.0"]`. Header examples are week
`[data-txt="wl:0.0"]`, both surfaces' `[data-itline="0|0|0"]`, and
`[data-txt="dl:0.0"]` / `[data-bfld="dl:0.0"]`. Section notes use
`pn:0`, `dtn:0`, `sn:0`, `gn:0` with the surface's `data-txt` / `data-bfld` attribute.

## Source and preservation evidence

- Week formation structure: `src/ui/html.ts:1744–1807`; grid/stacking:
  `src/ui/scheduler/03-week.css:517–570`. Wave label/Rally: `html.ts:1669–1680`.
- Board row and Area: `src/ui/board.ts:286–334`; phone wrapping:
  `src/ui/scheduler/13-board-rows-responsive.css:720–724,809–829`.
- Actual section order: `board.ts:390`, `html.ts:2020`; section notes:
  `board-html.ts:273`, `html.ts:780`; Board duty labels/rows: `board-html.ts:415–445`.
- Existing write/commit protections: `textedit.ts:31–45,73–246,248–356`,
  `board.ts:1114–1212`, `EditWeek.tsx:110`, `SchedBoard.tsx:209–244`.
  Both effects defer repaint under `editingText()`. Board input-owned `data-ifld`
  boxes are missing from that guard; final unchanged Board blur may not request the
  deferred repaint. Empty in-time deletion removes its node immediately while later
  live nodes retain old indices. These are source risks to pin with failing-first
  mounted checks, not verified runtime failures. Native focus/blur/change should
  retain existing writes; do not duplicate commits or add a permanent focus registry.
  Preserve no-op derived values, real save/history/Undo and refused-edit healing.
- Eligibility: preserve `HOOKS.editMode()`, effective editing permission, protected-week,
  issued-preview and OIL-mode gates. Exclude disabled/read-only/hidden/folded content,
  next-week peek and the mounted week behind Board. Latest-published Remarks access
  is a read-only role door, not a typing box (`board.ts:301`). Do not alter permissions.
- Mission-role offers: `mission-role-offer.ts:150–170` defers post-edit questions;
  D529/D535 and the destination caret remain intact. No automatic question on no-op Tab.
- Contracts: `docs/ui-contracts.md` §Inline text editing; `docs/feature-impact.md`
  Flows A/A1 and the per-feature checklist; `docs/performance.md` Part 1. No new
  stored route state, schema, engine rule, component conversion or DOM expansion is proposed.

Executor, performance Part 1 and relevant guide detail were read for this proposal.
The owner selected B after the picture, D554. Existing DOM field order already matches
B on both surfaces, so an allowlisted, day/surface-scoped collector is the smallest
candidate; no geometry sort or extra builder ordering attributes are proposed.
The supporting-text answer is now accepted, D555. Astra independently plans the build
and scenarios, followed by Sol's independent challenge before source changes.
Implementation status after D556: agreed route built with existing native writers,
shifted in-time addresses repaired, destination freshness and deferred Board paint
settlement; no-op formatted clock writes suppressed and covered focus revealed.
Fresh Astra R1 found week exit stale paint and two required proof gaps; week
settlement and blur-established focus protection added, distinct input durable
lifecycle and accurate context cancellation checked. FULL7765/current affected
browser168 and frozen21-step corrected Chromium walk PASS, with explicit
role/device omissions in `docs/handpass/2026-10-04-schedule-tab.md`. Fresh Astra
final inspection R2 PASS for exact freeze18, independently of planner/author;
full immutable report is retained beside the evidence sheet. R1 findings and
correction proof remain intact. No code approval inferred from picture acceptance.
Original source-risk prose above records design orientation, not current unbuilt
status. R2 plan remains frozen; no source/test/driver edits after final PASS.
Claude's plan/code/scenario/app reads after Monday
5 Oct 2026 at 19:00 Singapore remain owed before main. No main push, merge or merging PR.
