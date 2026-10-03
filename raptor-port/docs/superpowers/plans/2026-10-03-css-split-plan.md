# Scheduler stylesheet split — Astra plan, 3 Oct 26

Status: proposed to Sol for independent challenge; not self-approved. D493, D539–D541 authorize only the mechanical split. D496 assigns Sol implementation and a fresh Astra final inspection. Later visual work needs its own product answers and pictures.

## Bound baseline and scope

Branch: `codex/workflow-ui`. Integrated baseline: `0804877ca099c844b77bfd8692cd2d055e5534c7`, containing refreshed Insights, Rally and Discard builds. `src/ui/scheduler.css` SHA256: `0C16A9F046ABAEDB4F06E7876E2811A78E4695CF930FEE884E3432D3C0F26FEC`. Capture against this combined baseline, not main or an earlier individual branch. The host built it and serves it at port 4230; that is host-reported readiness, not a walk result.

No selector, declaration, comment, whitespace within the original sheet, media condition, order, specificity, button size, markup, behavior, engine body or stored record changes in the split. No layers, CSS modules, selector cleanup, dead-rule removal, formatting pass or lazy style loading. Keep `main.tsx` importing the existing `scheduler.css` path once. That file becomes comments plus an explicit ordered list of CSS `@import` statements; all imports precede declarations. Vite remains the production importer. No new dependency.

## Exact physical split

Each part is one contiguous byte slice, ending immediately before the next part's start. Keep existing line endings and trailing bytes. Use Buffer offsets, not PowerShell text serialization. The table's line numbers describe the bound baseline; the exact existing anchors, each unique in its context, are authoritative. Never split a comment, selector, declaration, keyframes or media block. Files live in `src/ui/scheduler/`. No glob decides import order.

| Order/file | Baseline start | Existing start anchor / ownership |
|---|---:|---|
| `00-foundation-login.css` | 1 | Start of file, `:root{`; tokens, defaults, login and access chrome |
| `01-logic.css` | 209 | `/* ============ LOGIC ============`; includes Rally text fields |
| `02-shell.css` | 299 | `/* ============ TOP BAR ============ */`; top bar, pages, filters |
| `03-week.css` | 617 | `/* ============ WEEK / DAY ============ */`; week, palette, day heads and flying grid |
| `04-pucks-sections.css` | 1226 | `/* ============ PUCK ============ */`; shared pucks, reporting, warnings and closing sections |
| `05-quals.css` | 1998 | `/* ============ QUALS PAGE ============ */` |
| `06-inputs.css` | 2167 | `/* ============ INPUTS PAGE ============ */` |
| `07-inputs-calendar.css` | 2550 | `/* ============ INPUTS PAGE — MONTH CALENDAR ============ */` |
| `08-windows-tools.css` | 2903 | `/* ============ MODALS / DRAWER / AIRSPACE ============ */`; shared windows, templates, warnings, Insights base, drawer |
| `09-week-responsive.css` | 3341 | `@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}`; retain global reduced-motion and existing phone/desktop overrides together |
| `10-board-history.css` | 3772 | `/* ============ SCHEDULER BOARD (deep single-day editor) ============ */`; Board chrome and existing history styles |
| `11-drag.css` | 4260 | `/* BOTH GHOSTS RIDE THEIR OWN COMPOSITOR LAYER AND MOVE BY TRANSFORM (6 Sep 26,` |
| `12-schedule-editing.css` | 4441 | Opening comment immediately before `B9 — EDITABLE TEXT · CANCELLED LINES · RED FLAGS · BOARD PANELS` |
| `13-board-rows-responsive.css` | 4799 | `/* ---- scheduler-board line controls`; Board rows, shared lift recipe, phone and forced-wide layout |
| `14-input-editors.css` | 5721 | `/* ---- the type legend and the AM/PM span picker`; input editing, medical/OIL questions |
| `15-admin-help.css` | 5975 | `/* ---- The Admin page`; keep Help and the later Admin responsive rules in place |
| `16-medical.css` | 6111 | `/* ---- THE MEDICAL PAPERWORK`; documents and Medical page |
| `17-save-status.css` | 6240 | `/* the postman's indicator`; late shell override must stay here |
| `18-oil-board.css` | 6261 | Opening comment immediately before `OIL ON THE SCHEDULE — [OIL-AUTO-REMOVE]`; includes later Board controls |
| `19-availability.css` | 6415 | `/* ============ [ALL-AVAIL-WINDOW] · the counter's window ============ */` |
| `20-changes-quals.css` | 6541 | `/* D149 ([ACCOUNTS], 26 Sep 26):`; retain six-line Quals override before Changes window |
| `21-insights.css` | 6703 | `/* D515/D524/D532 Insights: one shared modal and temporary controls below AREA. */` through EOF |

This table is the expected manifest order. Shared blocks have honest shared names; moving every later override next to its screen would change the cascade. Twenty-two coherent existing runs avoid both thousands of arbitrary fragments and an inaccurate claim of one file per screen. The largest remaining Board block owns its existing interleaved shared lift recipe; no second extraction is needed for this job. Future deliberate style work edits its appropriate run, retaining this order.

The baseline has one `url(...)`, a data SVG, and no CSS imports, namespaces or layers. Recheck that inventory before extraction. A new relative resource discovered later is a stop for path analysis; never silently rewrite a URL while claiming byte equality.

## First tests and exact-preservation proof

1. Before rule moves, add `src/ui/scheduler-css-order.test.ts`. It must fail against the monolith because the required ordered manifest is absent. Assert exact expected filenames/order, each once, no unlisted CSS part in the directory, all referenced files present, and no executable CSS beside the entry's imports. Assert every part parses independently and has no nested import. Pin one production import of the entry and no production imports of its fragments.
2. Add one test-only reader in `src/testing/scheduler-css.ts` to expand the declared entry order. It may initially read the monolith for baseline characterization, then the final manifest; never sort a glob. Missing/duplicate/reordered parts must cause a named failure. Migrate only CSS-reading setup in the current consumers: `amendretest`, `caltouch`, `css-invalidation`, `drawerlock`, `flagglow-css`, `layers`, `lift-css`, `modal-phone-height`, `topbar-css`, and Tracker `trk-palette` (confirm the inventory by search: a file can contain several reads). Preserve all assertions and comment-removal behavior. The test belongs to architecture, not a new framework.
3. Record the untouched integrated source bytes/hash and built CSS before extraction. Concatenate the ordered fragments with no inserted separator and prove exact equality to the baseline bytes, including comments and whitespace. Retain baseline ref/hash, per-fragment hashes and exact comparison result in evidence. This one-off preservation proof is not a permanent test banning later authorized CSS edits.
4. Build the split. Compare emitted stylesheet content against baseline, using logical asset ownership rather than hashed filenames. Expect byte equality where Vite serialization allows it; otherwise compare parsed ordered CSS ASTs with source-location metadata omitted, and explain the serialization-only difference. No selector/declaration/order differences are accepted. Include lazy Leave War/Tracker stylesheet ordering in the output inventory. Do not edit assertions to accept a mismatch.
5. Re-search raw consumers. `scripts/handpass/trk-palette-breaks.mjs` names the monolith as a mutation target: update its target to the foundation fragment if that helper remains executable. Historical narrative references need no mass rewrite. Update the file map and the layout row of feature-impact with the manifest/parts pointer; contracts remain unchanged.

## Characterize first, then compare

Use one repository Playwright driver on the production bundle, existing browser fallback. Before any rule moves record the following matrix as machine-readable JSON. Roles admin and actual member; widths 390×844 phone, 1280×700 laptop, 1600×900 desktop. Fresh deterministic contexts, same date/data/navigation/scroll and settled fonts. Keep full computed values for selected properties and rects; compare exact values at the same viewport, with at most explicit subpixel rounding for rect serialization. No blanket tolerance or auto-updated expected output.

| Sample | Real route and stable target families | Capture |
|---|---|---|
| Shell and schedule | Login; View-only Sched; `#viewChrome`, `.topbar`, `#vWeek .day`, `.day-head`, `.puck` | display, visibility, position, dimensions, gap, grid/flex, font, padding, color, border, overflow, z-index; `::before`/`::after` on marked puck |
| Editor and Board | Admin Edit Schedule, open a day using its Board door; `#eWeek`, `.eroster`, `#sbSign`, `#sbWarn`, `#sbBoard`, `.sb-actions`, `.sb-go-h`, `.intimes` | same; row/control bounds and center hit tests; member edit doors absent, read-only equivalent where offered |
| Inputs and Quals | Navigation to Inputs and Quals; `.ingrid`, `.intbl`, `.qtbl`, frozen header/callsign, own/other row | card/table switch, overflow, sticky geometry, edit affordance; perform existing own/other-row operation |
| Windows | Week Insights via desktop button or phone Menu; `.modal`, `.modal-box`; one input editor; Changes and availability frames through visible doors | placement, max-height, scroll ownership, close/footer reachability, layering and target hit |
| Logic | Navigation to Logic; numeric and reporting-text cell plus mission switch | text wrapping, input versus read-only value, disabled visibility |

Use the same driver after splitting. Omit only a structurally unavailable role/surface with its explicit reason; absence is itself asserted. Missing selectors never silently skip. Add phone landscape 844×390 and 1440×480 checks for Board, drawer, tall/short modal, Changes/availability, Inputs calendar and Tracker tools. Check all edge-docked controls, not just the close button. Measure breakpoint-sensitive samples at 620/621, 820/821 and 1499/1500 where those rules apply; these can be machine-only measurements without a picture at every pixel boundary.

## Full screen walk and qualifying transient families

The independent roll-call and precise operation list are in `2026-10-03-css-split-coordination.md`. Every listed reachable screen is opened, operated, pictured and visually inspected at phone and desktop. This is wider than the measured sample matrix. Screens served by their own CSS still receive the navigation/appearance check because scheduler globals and shell styles reach them.

Use existing demo data and prior handpass helpers. Do not build new application fixtures just to exercise unchanged obscure dialogs. Byte/AST equality covers their selectors; runtime separately covers each screen and each shared window family with a reachable representative. Any family omitted gets an explicit reason and equivalent structural proof, never an invented successful walk. Do not turn all existing app workflows into a new parallel exhaustive test framework for this split.

Create any necessary new example through actual controls in isolated browser data. Never inject a popup-open flag and claim its door was tested. Observe console/page errors and failing requests. For each physical screen's paint assertion, run a named break test that temporarily removes its representative winning CSS declaration through CSSOM, observe the assertion fail, then reload/restore. Cover manifest missing, duplicate and reversed imports separately. Do not commit damaged styles or change a served build while walkers use it.

Capture distinct screens/states only, plus useful failures. Open every saved PNG; record who inspected it. A contact sheet locates pictures but does not excuse unreadable details. Preserve failure pictures in their original folder. D499 shares identical functional lifecycles once while repeating distinct phone/desktop doors, gestures and layout.

## Integration checks before claiming preservation

No CSS split failure may conceal a broken integration baseline. Run focused combined tests and these short real routes on the integrated build, then replay affected ones after the split:

- Both editing surfaces: own Mission/Remarks edit offers Blue/Red; changing In-time/Rally on the same day preserves that question; answer, Later and Escape keep their current meanings. The current text saves before an answer.
- Logic retains both the reporting text/nominal-time controls and the independent mission-tracking switch. Add In-time/Rally uses the settings. Wrong timing paints its explanation and warning; **D509 allows publication**, superseding D502's historical block.
- Board keeps the Rally header, Insights desktop/More doors, current phone modal top/height and press-origin surround closing. Dragging text to the surround does not close the window.
- One published/unpublished example keeps corrected work hours and immediate role answers together; working wording still waits for publication. Discard marks stays absent; initial publication clears draft marks as already built. Use existing tests for detailed persistence/Undo laws; no new policy.

## Tier, gates, independence and completion

Eight answers: earned-leave calculation NO (styles only, appearance checked); published record YES (marks/sign-off visibility); saved data NO (no stored shape/write changes); shared drawer YES (global styles); new gesture NO; new surface NO; roles YES (visibility/edit affordances); warnings YES (paint/count presentation). **FULL**, consistent with the approved audit. Integration also imports previously built high-consequence work; its prior evidence is retained and its join checked.

Plan/roll-call before moves → characterization + failing architecture test → extraction → focused consumers + equality/build → frozen full screen walk and fixes → required final gates → fresh independent Astra inspection of final code and evidence → affected re-walk/gates only for new changes. Do not rerun completed broad gates without new code, a failure or unresolved concern (D499). Hold/release the shared PC lock around the full unit suite, multi-file e2e, Tracker smoke and fanned-out walks.

Required gates from `raptor-port`: `npm test`, `npm run build`, `node reference/tfin.js`, `npm run test:e2e`, `npm run smoke:tracker`, `npm run rulecheck`, `npm run docsize`; UI checks `npm run probes:adapted`, `npm run perf` against the exact frozen production preview. Keep the existing DOM ceilings. Perf checklist: original bytes/compiled rules/DOM unchanged; no new paint/scroll/drag architecture; compare measured open/tap/close/jump/return/scroll/drag/drop at 4×, with 8× only if a heavy-path difference needs explanation. No timing ceiling, no unsupported speed claim. Physical iPhone keyboard, Safari fling and browser-bar behavior remain owner-device evidence limits.

Fresh Astra reviews the split, raw-test adaptations, import/output order, integration joins, exact snapshot hashes and complete evidence after the walk. Planner does not approve its own plan; Sol supplies the plan challenge; initial final read plus at most one fresh follow-up. Concrete findings need failure/cause/fix. D56 stored-demo-only exclusions remain in the brief.

One evidence sheet: `docs/handpass/2026-10-03-css-split.md`; picture folder `docs/img/handpass/2026-10-03-css-split/`. Record eight answers, roll-call, before/after styles and equality, broken sensors, errors, all picture inspections, unresolved/unchanged baseline faults, gates and Walk line. Update only this branch's handoff block; preserve three earlier builds and all owed Claude reads. Branch push only, no PR for merging, no main push/merge. OWED: Claude's read after Monday 5 Oct 26, 19:00 for this branch and the three inherited builds. No working-guide edits or source/doc trimming.
