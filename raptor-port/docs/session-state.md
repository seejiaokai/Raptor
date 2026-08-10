# Session handoff — build two shipped; the AVALON spare rule is still his

## Where it started

The previous session shipped build one of the leave-types work and stopped,
because the owner had not used it yet and build two was his call. He came back
with two things: move the AM half-day to start at midnight, and start build
two. No other direction was given, and none was asked for.

## Shipped

- **AM is now 00:00–12:00** (was 04:00–12:00). PM is unchanged at 12:01–23:59.
  One constant plus the words that describe it — the Logic page's rules text,
  the type-picker tooltip, `engine-rules.md` and `remarks-vocabulary.md`. The
  only behaviour it changes is that a morning absence now also covers the small
  hours, which no wave in the demo week touches.
- **BUILD TWO — editing an input from the week or the board.** Times, type,
  remarks and delete, from Edit Schedule and from the schedule board, writing
  back to the Inputs page. The control is the input's own TYPE LABEL turned
  into a button; the dialog is `InputEditor` in the new `ui/inputedit.tsx`,
  which also now holds the halves, the span picker, the draft shape and the
  commit that the Inputs page uses, so there is one edit path and not two.
  Contract: `docs/ui-contracts.md` §Editing an input from the schedule.

## Unfinished

- **The AVALON spare rule is RESERVED BY HIM** (unchanged for three sessions
  now). He said it follows "the same modality" as the SC spare and that he
  would specify it separately. **Do not infer it.** The spare rule is already
  written against "a standalone spare" with SC the only kind enforced, so his
  answer is a small edit rather than a re-cut.
- **Integration heads-up, out of scope:** a separate app,
  `github.com/seejiaokai/leave-war`, will eventually feed these inputs and
  update the schedule automatically.

## Decisions made while building, so they are not re-asked

| Question | What was decided, and why |
|---|---|
| Where does the edit control go? | The input's own type label. Three separate-button shapes were built and measured first; every one of them cost the row a line at one width or the other, because both rows are grids with no spare track. Reasoning in `ui-contracts.md`. |
| Person and dates in the dialog? | No. The four fields he asked for all keep the row on the day it was opened from; moving it to another man or date makes it vanish from the surface being looked at. The dialog's footer says where to do that. |
| Who may use it? | A scheduler on Edit Schedule, and a live board. A member still edits his own inputs on the Inputs page — opening the schedule surfaces to him needs an ownership check the app does not have. |

## Gates

Run first-hand and locally at this commit, from `raptor-port/`:

- `npm test` 911 across 52 files · `npm run build` clean ·
  `node reference/tfin.js` 728/0 · `npm run test:e2e` 62/62
- `npm run probes:adapted` 6/6 · `npm run perf` 7/0

`test:e2e` was run with no preview up; the probes and `perf` need one. The
one-day-edit per-node reading came up red once at 1.16× and green on the three
runs around it (1.05×–1.09×), which is the documented straddle in
`docs/probe-sweep.md` §The performance gate, not a regression — the `noop`
cross-check held at 0.57×–0.58× throughout.

**No DOM ceiling was raised, and one nearly was.** An earlier shape of this
work (a separate button per row) took the board from 862 to 872 against its
880 ceiling and the ceiling was raised to 920 for it. Making the label the
control put the count back to 864 — one node in, one node out — so that raise
was reverted. The week is 5065 against 5530 (+9, the block hints).

## Open questions

- **The AVALON spare rule** — his, reserved, listed under Unfinished above.
- **Does he want anything changed in build one or build two?** He has used
  neither. The two consequences of build one that will look like bugs and are
  not: a morning absence still bars a wave that STEPS before noon (Monday's
  first VL takes off 12:40 and steps at 11:40), and a half-day man no longer
  counts in the day-info "off" tally.

## Pick up here

Nothing is owed until he answers. The next things on the list, in his own
order of asking: the AVALON spare rule (his to specify), then the USER GUIDE
(`HANDOFF.md` has what is already collected for it).
