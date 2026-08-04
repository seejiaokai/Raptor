# Session handoff — puck selection, the stores "+" picker, Quals callsign/initials

## Where it started
Owner asked for three things: scope the puck-click highlight, replace the NAV
toggle under Remarks with an additive "+" config picker, and (later) rework the
Quals page columns. The selection half went back and forth twice — see Shipped;
the final word is that clicking a puck lights EVERY copy of that person.

## Shipped
- Per-puck selection scoping + stores "+" picker (NAV/N/C/3 TKS/CL) — PR #43,
  merged, deploy green.
- 2 TKS + TPOD added to the picker; the view-as "you" indicator now yields to an
  active selection — PR #44, merged, deploy green.
- **Selection scoping REVERTED** — clicking a puck lights every copy of that
  person again (owner: "u should allow me to see all the pucks of the same name
  that i clicked"). The "you"-yields fix from #44 was KEPT — PR #45, merged,
  deploy green.
- Quals: `NAME`→`CALLSIGN`, new `INITIALS` column beside it, Add person takes
  callsign/initials/pilot-WSO/cat with first+last name removed — PR #46, merged,
  deploy green. Also carried the docs-only drag-to-section won't-do commit.

## Unfinished
- none (no open PR, no red gate, no half-applied edit, nothing under
  `subscribe_pr_activity` watch).

## Branch state
- Designated branch: `claude/raptor-port-pr-merge-j0g7hx`
- Its PR is **merged** (#46).
- Reset before starting new work, or commits stack onto merged history:
  `git fetch origin main && git checkout -B claude/raptor-port-pr-merge-j0g7hx origin/main`

## Gates
- `npm test` (424) · `npm run build` · `node reference/tfin.js` (728/0) — last
  run **green**. Run them from `raptor-port/`, not the repo root.
- Browser: `wrap-async` 36/0, `drop-async` 9/0; `perf-port.cjs` at its usual
  in-container flake rate (judge over several runs). `audit2` 17/18 by design.

## Open questions
Three judgment calls on PR #46, flagged to the owner, unanswered. All shipped
and reversible — do not treat any as settled:
1. **The Flight input was KEPT** in the Add-person row. The owner listed only
   callsign/initials/pilot-WSO/cat but explicitly asked to remove only first and
   last name; dropping Flight would leave the Flight column unfillable.
2. **Initials are editable in edit mode** (`input.qinit[data-init]`, commits on
   change not input), not add-only. Without it the 34 seeded people would carry a
   permanently blank INITIALS column.
3. **The Excel export swapped its `Name` column for `Initials`**, names no longer
   being collectable.

## Pick up here
Seeded people have BLANK initials by design — `engine/people.ts` carries only
callsigns, never names, so there is nothing to derive them from. Do not invent
initials for the roster; wait for the owner to supply them or fill them through
edit mode.
