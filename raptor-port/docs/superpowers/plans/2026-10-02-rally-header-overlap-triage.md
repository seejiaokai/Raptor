# Rally: wrapped header covers desktop palette — bounded geometry triage

Author: Astra, 2 Oct 2026. Evidence/source-cause triage only, not final code inspection or approval. No browser run, production edit or test change by this author. The owner has not accepted this defect.

## Failure and evidence

At1280×560, with the actual Ranger · Admin account badge and a104px wrapped top bar, the Edit Schedule ALL AVAIL palette control is covered and cannot receive its own pointer hit. The new REPORT warning jump can reach this state. This is a real interaction defect, not merely a helper failure or a stored-demo peculiarity.

Evidence root: `C:/Users/User/.codex/visualizations/2026/10/02/01a0fab0-9850-7130-8da0-de797da4a3ba/`.

- Current raw: `rally-placeholder-current-retry/results.json`. Source fingerprint `c767f243dc1bd58415c9aa1f7574d8ba9bb81f19161ed0eb36c7db26a9e24786`; bundle `be356d3d8a98977b33dfb8f537432a7888042ac8ca6ec51a74618a0509bcd48b`.
- Baseline raw: `rally-placeholder-baseline-retry/results.json`. Base `9cc5d4ff1d1d03301c4f6b74685db38ffd540c1b`; bundle `a0d92a2eb40fa6a68a3be6efe464bb6e39bb963872d370f52dbec40d2b7eb460`.
- Both saved identity arrays contain19 served files with matching expected/actual hashes, including index; both error arrays are empty. Walker corrected an earlier verbal count of16 to19.
- Current has an actual rendered REPORT warning, clicked through its real door. Before the jump the placeholder is at y327 and receives its own hit. The covered state has placeholder rect x1016/y64/w230/h15; the hit is `#roleBadge`. Roster rect starts at y8; top bar spans y0–104. Target scrolling does not remove the covering bar.
- Baseline has no REPORT warning door, explicitly recorded as absent. With the same real account badge, flight and reporting strings, native main-page wheel scrolling already produces coverage; subsequent target scrolling reproduces the identical y64 placeholder, y8 roster,104px header and role-badge hit. Thus this is not an identical-door A/B comparison, but it independently establishes the inherited layout failure without the new door.
- Pictures: `rally-placeholder-current-retry/pictures/ALL-AVAIL-warning-jump-covered-1280x560.png` and `rally-placeholder-baseline-retry/pictures/ALL-AVAIL-sticky-covered-1280x560.png`. Walker reports all seven diagnostic pictures inspected. This author read the raw evidence, not the pictures anew.
- Consolidated record: `rally-walk-consolidated-evidence.json`, `geometryTriage`; original failure retained in `rally-final-supplement/results.json`.

## Concrete source cause

The relevant rules are present unchanged in baseline `9cc5d4ff`:

- `src/ui/scheduler.css:307`: `.topbar` is sticky at `top:0`, permits wrapping, and paints at `z-index:60`.
- `src/ui/scheduler.css:663`: desktop `.edit-board .eroster` sticks at fixed `top:8px`, paints at `z-index:5`, and uses a fixed viewport subtraction for its maximum height.
- The palette's internal sticky heading rules around `:705` keep its own labels visible within that box; they do not reserve space for the outer account bar.

Consequently, when the page scrolls, the palette pins at8px regardless of the actual top-bar height. Its ALL AVAIL row at64px remains inside the104px top bar's painted/hit-test region. Native scrolling can cause this without any reporting action. `src/ui/highlights.ts:336–412` uses the existing shared warning-focus scroll path and ultimately `scrollIntoView` with centre alignment; it does not repair the palette's independent sticky inset. Scrolling a target into its scroll container does not guarantee visibility through a higher painted sticky sibling.

## Scope disposition

The new REPORT door supplies another real route into the inherited state. The evidence does not show a new header height, stacking rule, palette inset or separate REPORT-specific layout regression. Therefore classify this as an inherited desktop scrolling/layout defect to carry into the workflow UI batch under D490/D495, after its required CSS-split first step. Do not silently count this1280×560 route as passing or describe the overlap as owner-accepted.

The required1440×480 check and six named-picker phone/short routes reportedly pass. Those results bound the failure; they do not cancel it. Deferral is a scoped batch recommendation, not release approval. If later evidence shows the reporting target itself cannot be reached, or the new jump introduces a distinct obstruction absent from ordinary scrolling, reassess that separate failure in the current batch.

## Minimal repair direction for that batch

Make the desktop palette's sticky inset and available height respect the actual shell top-bar height plus the intended gap. Prefer an existing shared measured chrome-height value if available; otherwise maintain one small layout-owned measurement updated on resize/wrapping/account-control changes, rather than reading layout on every scroll. Preserve the established z-order: raising the palette above the account bar would hide controls instead of solving the overlap. Do not hard-code104px or change phone-drawer/Board geometry as a workaround.

Keep CSS extraction behaviour-preserving; apply this deliberate geometry change as an explicit subsequent step in the same workflow batch. Verify1280×560 with the wrapped real badge via native wheel, warning jump and target scroll; assert both full visible bounds below the header and own-element hit success, including the first palette controls. Also retain a single-row desktop-header case, resize/wrap changes, short-height scrolling and the already-passing phone/Board routes. Confirm lower palette rows remain reachable and scrolling does not jump. No additional generic walk is proposed by this triage.

Rulings: none added. Backlog/evidence/brief linkage remains with the host; this report does not alter the original bound plan or either final inspector's report.
