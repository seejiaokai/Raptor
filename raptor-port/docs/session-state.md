# Session handoff — leave types built (build one of two); board editing not started

## Where it started

The owner re-opened the leave-types requirement the previous session had
parked, answered the questions it was blocked on, and added two things to it:
AM/PM half-days, and editing an input from the schedule. He chose to split it
into two builds so he could see the first working before the second was
layered on. Build one was brainstormed, spec'd and shipped in one sitting.

## Shipped

- **PR #133 — twenty input types in one rule table.** `INPUT_META` is the
  single source: the type list is derived from its keys, every predicate is a
  lookup, and the Inputs page's type legend and the Logic page's matrix are
  both generated from it. Adds the `ATT B` grounded-but-at-work axis
  (`canWork`), derived spare eligibility (`canSpare` = local && not medical),
  every input counting from the moment it is typed, AM/PM half-days that
  genuinely free the other half, and a `?` type legend. `Downchit` and
  `Detachment` removed in favour of OML / ATT B / ATT C / OD.
  Merged, deploy green, **verified on the live site** (20 types in order, PM
  filling 12:01–23:59, legend opening, no console errors, no 4xx).
  Design note: `raptor-port/docs/superpowers/specs/2026-08-10-leave-types-design.md`.
- **PR #134 — corrected this file**, which still claimed #133 was open.
  Merged.
- **A short tail of docs-only PRs** (#135 onward) — the handoff check's own
  findings, and a correction to HANDOFF's stale-status-API advice after
  `list_workflow_jobs` was measured reporting a finished gate as still
  running for over half an hour.

## Unfinished

- **BUILD TWO: editing an input from the week or the board.** The owner asked
  for FULL edit — times, type, remarks and delete — from Edit Schedule or the
  schedule board, writing back to the Inputs page. Nothing built, nothing
  designed. This is the whole of what he is owed next.
- **The AVALON spare rule is RESERVED BY HIM** (unchanged from the previous
  session). He said it follows "the same modality" as the SC spare and that
  he would specify it separately. **Do not infer it.** The spare rule is
  already written against "a standalone spare" with SC the only kind
  enforced, so his answer is a small edit rather than a re-cut.
- **Integration heads-up, out of scope:** a separate app,
  `github.com/seejiaokai/leave-war`, will eventually feed these inputs and
  update the schedule automatically.

## Decisions he made this session, so they are not re-asked

| Question | Answer |
|---|---|
| Do the activity types still wait for a scheduler before blocking? | No — every type blocks the moment it is entered |
| Does `→ Ground` survive? | Yes, for Training, CSE, Meeting, Fly, Personal, Appointment, Other |
| Keep the plain `Downchit` type? | No |
| Is `OFF` admin-only to enter? | No — anyone may pick it |
| Which types get AM / PM? | Leave and medical only |
| May the activity types stand a spare? | Yes (so: local yes, overseas no, medical never) |

## Branch state

- Designated branch: `claude/read-handoff-docs-4vbob2`
- **#133 and #134 are merged and live.** The branch was reset onto `main`
  afterwards — do NOT stack new work on merged history. If it has drifted:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-4vbob2 origin/main`
- **Do not trust any PR number in this file as still-open.** The session
  closed with several small docs PRs landing one after another, and a file
  that names "the open one" is stale the moment the next is raised. Ask git
  and GitHub instead: `git log --oneline origin/main -5`, and check the
  repository for any open PR on this branch. Everything this session produced
  is either merged or in such a PR; nothing lives only on a local machine.
- The last of those docs PRs carried the four things the handoff check turned
  up, all of which were real:
  - `raptor-port/look3.mjs`, a throwaway browser script committed by accident
    in #133 (it hardcodes a container scratch path, so it is useless as well
    as unwanted) — deleted.
  - `HANDOFF.md`'s file map still listed `isDetach` on `inputs.ts`, deleted
    with the `Detachment` type.
  - `docs/engine-rules.md` still said an actioned input "clashes like a
    Detachment" and described the all-day `Fly` carve-out in its old,
    narrower form. An earlier edit to that paragraph had silently failed to
    match and nobody noticed.
  - `CLAUDE.md`'s late-mark note still said "leave and detachments stay in
    scope".

## Gates

Run **first-hand and locally at the head of #133**, from `raptor-port/`:

- `npm test` 900 across 51 files · `npm run build` clean ·
  `node reference/tfin.js` 728/0 · `npm run test:e2e` 59/59
- `npm run probes:adapted` 6/6 · `npm run perf` 7/0 (twice — the board DOM
  measured 864 against its 880 ceiling, up 2 from 862, which is data rather
  than markup; the ceiling was deliberately NOT raised)

`test:e2e` was run with **no preview up**. A live preview on 4173 is silently
reused and measures a stale bundle. The probes and `perf` need one running.

Nothing since #133 has touched source, so no gate can have moved: #134 and
#135 are documentation, plus one deleted file that nothing imports and no
glob matches. **#135's gate result is CI's, not a local run** — this
container was reset mid-session and `node_modules` went with it.

## Open questions

- **The AVALON spare rule** — his, reserved, listed under Unfinished above.
- **Does he want anything changed in build one before build two starts?** He
  has been told it is live and what to expect from it, including the two
  consequences that will look like bugs and are not: a morning absence still
  bars a wave that STEPS before noon (Monday's first VL takes off 12:40 and
  steps at 11:40), and a half-day man no longer counts in the day-info "off"
  tally. He has not used it yet.

## Pick up here

Ask him whether build one needs changes, then start **build two**. Do not
start it unprompted — he has not used build one.

Note for whoever reads this in a fresh container: this session's container
was reset partway through and the working copy silently rewound to a commit
from before the day's work, with a stale `session-state.md` in the tree.
Nothing was lost — everything was already on `origin/main` — but check
`git log --oneline -1` against `origin/main` before trusting the working copy.
