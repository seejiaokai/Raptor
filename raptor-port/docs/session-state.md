# Session handoff — Quals column editing, member permissions, then this doc brought current

## Where it started
Long session, cleared partway through (`/clear`), so its own early context is
gone — the record of what it shipped is `git log`, not memory. It ran from the
perf-budget close through the Quals rework into column editing and the
member/admin permission line. The final ask was to bring this file current: it
had been written at PR #71 and still described the state as of #70, three PRs
and 17 tests behind, while claiming its gate numbers were live.

## Shipped
This session (`session_017TQdUyjoNZMnMSarXSxs4s`), all merged, all Pages
deploys green. Rules and rationale live in `HANDOFF.md` and
`raptor-port/docs/` — not repeated here.

- Perf gate moved to a per-node budget + DOM ceiling — PR #69, merged, deploy green
- Quals page: heading sort, fixed column order, TF, View Pilots/WSOs/All — PR #70, merged, deploy green
- Handoff written at that point — PR #71, merged, deploy green
- EDIT QUALS: add, remove and drag qualification columns — PR #72, merged, deploy green
- Edit quals button reversed: blue to enter, dark ✕ to leave — PR #73, merged, deploy green
- A member may edit their own Inputs and tick their own quals — PR #74, merged, deploy green

**Not this session:** PR #75 (crew combination matrix, Table 1.5-2) is a
parallel session's work — `session_01QbakhXEbHvMKMQXgp3zSLv`, branch
`claude/read-handoff-96fxlr`. It is merged and deployed green, it changed
`src/engine/validate.ts`, `src/testing/refwin.ts` and `logic-html.ts`, and it
is the current tip of `main`.

## Unfinished
- Nothing half-applied, no open PR beyond the one carrying this file, nothing
  under `subscribe_pr_activity` watch.
- **`npm run probes:adapted` and `npm run perf` were NOT run against #75.**
  Both were last green before it (6/6 and 9/0). #75 changed `validate.ts`, and
  the adapted probes (`aar`, `audit`, `sa`, `sc2`) all exercise validation, so
  their state on the current tip is unverified. Neither is in CI and both need
  `npx vite preview --port 4173` first. Run them before the next UI-visible or
  validation change.

## Branch state
- Designated branch: `claude/read-handoff-docs-3xuleg`
- Its PR (#74) is **merged**. The branch was therefore reset onto the new tip
  this session (`git checkout -B claude/read-handoff-docs-3xuleg origin/main`
  at `8d5f94d`) and now carries only this handoff commit.
- Reset again before starting new work:
  `git fetch origin main && git checkout -B claude/read-handoff-docs-3xuleg origin/main`
- **`main` moved twice during this session** (#74 → #75) and a second session is
  active on `claude/read-handoff-96fxlr`. Fetch before assuming what `main` or
  any `claude/read-handoff-*` branch points at, and expect commits neither you
  nor this session wrote. That session may also overwrite this file.

## Gates
Run first-hand from `raptor-port/` at `8d5f94d` (main incl. #75), all green:
- `npm test` — **520 passed**, 30 files
- `npm run build` — clean (the two INEFFECTIVE_DYNAMIC_IMPORT warnings from
  `probe-bridge.ts` are long-standing, not new)
- `node reference/tfin.js` — **728 passed, 0 failed**
- `npm run test:e2e` — **11/11**
- `npm run probes:adapted` / `npm run perf` — see Unfinished; not run at this tip.

## Open questions
None. The perf-budget question the earlier handoff carried was answered by the
owner ("i am ok to loose the performance standards") and closed in #69.

## Pick up here
Nothing is mid-flight. The next substantial items are the long-standing three
in `HANDOFF.md`: no shared data between devices, prototype auth, one dataset —
the first of which is also what would make EDIT QUALS column changes survive a
reload.
