# Session handoff — Mon–Sun week, inputs calendar + pencil edit, break-day rule, bug sweep

## Where it started
Owner asked for five things in two batches: a Sat/Sun week starting Monday; the
inputs date pair replaced by one two-click calendar; a pencil edit on each
input row; `Other` inputs to read by what was typed; then a warning when
anyone works 7 days in a row (6 max). He was asleep for all of it and said to
make the decisions. The last ask was an explicit "test for any bugs and fix
it", which found seven — three of them corrupting state, all from features
shipped earlier the same night.

## Shipped
All merged, all deploys green.
- Two-click range calendar, pencil edit, `Other` reads by its remarks — PR #50
- The demo week runs Monday to Sunday — PR #51
- Two edit bugs the pencil introduced (accepted-row link rot; editor held a
  model index) — PR #52
- Break day due after `VCONF.maxRun` (6) consecutive days — PR #53
- Bug sweep: five more fixes around accepted inputs and date spans — PR #54

## Unfinished
- none. No open PR, no red or unrun gate, no half-applied edit, nothing under
  `subscribe_pr_activity` watch.

## Branch state
- Designated branch: `claude/raptor-port-pr-merge-j0g7hx`
- Its PR is **merged** (#54).
- Reset before starting new work, or commits stack onto merged history:
  `git fetch origin main && git checkout -B claude/raptor-port-pr-merge-j0g7hx origin/main`

## Gates
- `npm test` (460) · `npm run build` · `node reference/tfin.js` (728/0) — last
  run **green**. Run them from `raptor-port/`, not the repo root.
- Browser: `wrap-async` 36/0, `drop-async` 9/0. Full 53-probe sweep run against
  the 7-day week — failures identical to the documented baseline, no new
  breakage. `audit2` 17/18 by design; `perf-port.cjs` flaky in-container.
- **Perf was measured, not assumed**, when the week went 5→7 days: baseline
  5-day port 2 fails in 5 runs, 7-day 3 in 7. Same rate — the weekend days are
  nearly empty markup. Do not re-litigate this without re-measuring.

## Open questions
Nine judgment calls taken without an answer, all shipped, all cheap to reverse.

Tonight's five:
1. **Weekend content is invented** — Sat/Sun are non-flying with one SDO on
   call 0800–1800. Nothing else was fabricated.
2. **The break-day warning is hard (red)**, ranked just above crew rest, because
   the owner phrased it as a limit ("6 days max").
3. **The demo seeds no 7-day violation** — longest run is 4 days, so the new
   warning is invisible until someone is genuinely planned across seven. Not
   faked to make it visible.
4. **Add now REFUSES an input with no date picked.** It used to default
   silently to Monday while the readout said "pick a start date". This changed
   two existing tests, which now pick a date first.
5. **The Flight box stayed** in the Add row (the owner listed only
   callsign/initials/pilot-WSO/cat but asked to remove only first+last name).

Carried, still unruled:
6. **Selection is person-wide by DECISION.** Clicking a puck lights EVERY copy
   of that person. Per-puck scoping was built (#43) and explicitly reverted
   (#45) — "u should allow me to see all the pucks of the same name that i
   clicked". Do not re-narrow it. The separate "you"-indicator fix (#44, the
   view-as puck yields to a selection) was KEPT and is not part of that revert.
7. **Initials are editable in edit mode**, not add-only.
8. **A callsign rename marks nothing pending** — it is not a schedule amendment.
9. **Published day snapshots keep the spelling they were issued with.**

## Pick up here
No work is queued. If the owner rules against 2 or 3, both live in
`raptor-port/src/engine/validate.ts` (the `DAYS_RUN` block) and
`raptor-port/src/engine/rules.ts` (`VCONF.maxRun`); 1 is
`raptor-port/src/engine/data.ts`; 4 and 5 are
`raptor-port/src/ui/InputsPage.tsx`.
