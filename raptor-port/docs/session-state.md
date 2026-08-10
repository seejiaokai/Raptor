# Session handoff — a day of small owner-driven fixes; leave types parked mid-spec

## Where it started

The owner read HANDOFF, then drove a series of unrelated asks in one sitting:
move the LATE mark, carry the day between the two week pages, add an AAR
back-seat instructor qualification, fix a stale-warning bug he spotted, fix
flag colours, and collect the app's "magic text" for a future user guide. The
last ask — a large expansion of input types — was parked mid-brainstorm.

## Shipped

- LATE mark moved into the Remarks cell on every surface — PR #125, merged,
  deploy green and verified live.
- Decision record: the word stays, a compact dot was declined — PR #126,
  merged.
- The day you are looking at carries between View-only and Edit Schedule,
  both directions — PR #127, merged, deploy green and verified live.
- AAR instructor mark (`I` on DAAR/NAAR for instructor pilots) and the
  `AAR_INSTR` warning, with the front-seat warning suppressed when a qualified
  instructor is aboard — PR #128, merged, verified live.
- Quals edits re-run `validate()` (tick, CAT change, archive). Fixes a
  stale-warning bug OLDER than the AAR work — PR #129, merged, verified live.
- `docs/remarks-vocabulary.md` — every text trigger, for the user guide the
  owner wants eventually — PR #130, merged.
- A blank click clears every highlight (chips and search too), and flag colour
  now follows the tier the rule is raised at — PR #131, merged, verified live.

## Unfinished

- **PR #132 is OPEN and unmerged.** Docs only: corrects HANDOFF's stale gate
  counts and deletes the previous session's session-state. Its `build` check is
  GREEN. It only needs merging, and then this file replaces what it deleted.

- **The owner's leave-types requirement is PARKED, and this file is the only
  record of it.** Nothing was built, nothing was designed, and no rule below
  was checked against the engine. It is his ask, verbatim in substance:

  New types, to sit BELOW `OIL` in the list:

  | Type | Meaning and rule as he gave it |
  |---|---|
  | `OFF` | leave consuming no counter, granted by Management (Admin), LOCAL only |
  | `CCL` | childcare leave |
  | `PL` | paternity leave |
  | `FCL` | family care leave |
  | `EL` | embarkation leave |
  | `HL` | hospitalisation leave. **Cannot be a spare.** |
  | `OML` | ordinary medical leave. Counts as a **downchit**: cannot fly, cannot come to work, cannot be a spare. Needs its own downchit rule. |
  | `ATT C` | medically down, unable to report to work. **Cannot be a spare.** |
  | `ATT B` | a **downchit**: unable to FLY but still able to report to work. **Cannot be a spare.** |
  | `Training` | |
  | `CSE` | course |
  | `Personal` | |
  | `Appointment` | |
  | `OD` | overseas duty. Cannot be planned for **anything**, including an SC spare. **Replaces `Detachment`**, which he wants removed. |
  | `Other` | |

  All of them land in the **Unavailable** section.

  The axis that matters: **local vs overseas decides spare eligibility.** A
  local absence may still stand a spare; an overseas one may not, and must
  raise a conflict warning. This mirrors a rule the engine already has —
  `isLocalLeave` (LL + OIL) may stand an SC SPARE, `OL` may not
  (`docs/engine-rules.md`, the leave bullet).

  He also wants a **legend button** near the type field, popping up what each
  abbreviation means.

  **Pending from him, do NOT infer:** the AVALON spare rule. He said it
  follows "the same modality" as the SC spare and that he will specify it
  separately.

  **Integration heads-up, out of scope:** a separate app,
  `github.com/seejiaokai/leave-war`, will eventually feed these inputs and
  update the schedule automatically.

## Branch state

- Designated branch: `claude/read-handoff-docs-5h6ow6`
- Its PR is **open, #132**, one commit ahead of `main` (`7cda740`).
- **Do NOT reset the branch while #132 is open** — that commit is not yet in
  main. Once #132 merges, reset before new work:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-5h6ow6 origin/main`

## Gates

- `npm test` 878 across 51 files · `npm run build` clean ·
  `node reference/tfin.js` 728/0 · `npm run test:e2e` 59/59 — all green, run
  first-hand at the head of PR #131.
- `npm run probes:adapted` 6/6 · `npm run perf` 7/0 — green, run first-hand.
  Both need `npx vite preview --port 4173` running first; kill it again before
  any `test:e2e` run or that gate silently reuses the stale bundle.
- PR #132 changes no source, so no gate can have moved since.
- Run all of these from `raptor-port/`, not the repo root; a fresh container
  needs `npm ci` first.

## Open questions

- The whole leave-types spec above is unanswered in detail. Before building
  it, at minimum: which of the new types block work entirely versus only
  flying; whether `OFF` being "Admin-granted" needs a role check or is just
  convention; and the Avalon spare rule, which he has explicitly reserved.
- He asked for a user guide "eventually" (recorded in `HANDOFF.md`). Not
  started.

## Pick up here

Merge PR #132. Then, only if the owner raises it again, re-open the
leave-types spec above — he parked it deliberately, and it needs his answers
before any of it is designed.
