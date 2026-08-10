# Session handoff — leave types built (build one of two); board editing not started

## Where it started

The owner re-opened the leave-types requirement that the previous session had
parked, added two things to it (AM/PM half-days, and editing an input from the
schedule), and answered the open questions. It was brainstormed, spec'd and
built in one sitting.

## Shipped

- **PR #133 — the squadron's real absence vocabulary.** Twenty input types in
  one rule table, the ATT B "grounded but at work" axis, derived spare
  eligibility, every input counting from the moment it is typed, AM/PM
  half-days that genuinely free the other half, a generated type legend, and
  `Downchit`/`Detachment` removed in favour of OML / ATT B / ATT C / OD.
  Design note: `docs/superpowers/specs/2026-08-10-leave-types-design.md`.

## Unfinished

- **BUILD TWO: editing an input from the week or the board.** The owner asked
  for FULL edit — times, type, remarks and delete — from Edit Schedule or the
  schedule board, writing back to the Inputs page. Nothing was built and
  nothing was designed. He chose two builds deliberately so build one could be
  seen working first. This is the whole of what he is owed next.

- **The AVALON spare rule is still RESERVED BY HIM.** Unchanged from the last
  session: he said it follows "the same modality" as the SC spare and that he
  would specify it separately. **Do not infer it.** The spare rule is already
  written against "a standalone spare" with SC the only kind enforced, so his
  answer is a small edit rather than a re-cut.

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
- Its PR is **open, #133**, three commits ahead of `main`.
- **Do NOT reset the branch while #133 is open.** Once it merges, reset before
  new work:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-4vbob2 origin/main`

## Gates

All six run first-hand at the head of #133, from `raptor-port/`:

- `npm test` 900 across 51 files · `npm run build` clean ·
  `node reference/tfin.js` 728/0 · `npm run test:e2e` 59/59
- `npm run probes:adapted` 6/6 · `npm run perf` 7/0 (twice)

`test:e2e` was run with **no preview up**; the probes and perf need one on
4173. A fresh container needs `npm ci` first.

The built bundle was also driven in Chromium at 1440px and 390px — no console
errors, no 4xx, no horizontal overflow.

## Pick up here

If #133 has merged, reset the branch and start **build two** — but only after
asking him what he wants first, since he has not been shown build one working
on the live site yet and may want changes to it before more is layered on.

The four things build one deliberately left open are in `HANDOFF.md`, under
the leave-types bullet. None of them is urgent and none is a defect.
