# Session handoff — [AMEND] Phase 2 (coupled record rewrite): COMPLETE, all gates green

## Where it stands
Phase 2 — the coupled amendment-record rewrite — is **built and green** on
`claude/amendment-engine-core`. The whole plan §8 (steps 2–7) plus step 3 (the
legacy-format classifier) is done, committed (not merged). **Not merged; awaiting
a fresh Codex inspection of the finished code, then the owner's explicit "merge live."**

## Gate set (run once at green, this session)
- `npm test` (unit) — **4544 / 4544 pass** (isolated run; a concurrent run with e2e
  produced 6 contention flakes that vanished in isolation — do NOT run heavy suites
  in parallel, see the observation log).
- `node reference/tfin.js` (parity) — **728 / 0**. The re-key touches no renderer /
  no `dayKeys` output; marks short-circuit on a pristine book.
- `npm run build` (tsc -b + vite) — **clean** (only the pre-existing
  INEFFECTIVE_DYNAMIC_IMPORT warnings).
- `npm run test:e2e` — **424 / 425**. The ONE failure (`geometry.spec.ts:1976`,
  the board flying-line brief-cell inline at phone width) is **PRE-EXISTING and
  environment**: it fails identically on the pre-re-key commit `889812e`, and the
  e2e recipe is calibrated for the Linux CI, not this Windows box. Linux CI is the
  arbiter for that gate. NOT caused by Phase 2.
- `npm run smoke:tracker` — **426 / 0** (Tracker is a separate app, untouched).

## What shipped (branch commits, newest last)
- `e8d2f4a` wip — identity re-key core (steps 2/4/5), publish.test green.
- `5b4dd9f` test — full re-key + test sweep, unit suite 4537/4537.
- `5c61dff` feat — step 3, the shared legacy-format classifier.

## The model, in one paragraph
`SCHED.als` is now a list of **single-day** records keyed by an immutable `verId`
(`iso#seq`; Original = `iso#0`): `{id, di, iso, seq, snap:{d,c,fil}, diff, sign}`.
`diff` (the frozen canonical `dayDelta` at issue) REPLACES the old `keys` list;
`SCHED.cur[di]` and `SCHED.orig[di].id` are verId strings. Per-day sequence, so
Monday-AL1 and Tuesday-AL1 are distinct. Publish eligibility is `dayHasChanges` =
`dayApproved && dayDelta non-empty` (the canonical delta, F-02) — NOT a pending
count. All take-backs are gone (`unpublishAL`/`publishAL(n)`/`restoreDayVersion`/
`reissueReopened`/reopen); a published version is frozen — changing a day is a new
AL that supersedes it. `applyDayTpl` on a published day now applies to the working
draft (P2-R3-04). Resolver validates identity-belongs-to-day AND the passed-in week
key (P2-R2-05/P2-R3-03). `nextSeq(di)` replaces `nextAL`.

## Notes for the fresh Codex inspection (be adversarial here)
- **Classifier scope (step 3).** Implemented DETECTION (`SCHED.amV` stamp,
  `amFormatOf`, `protectedWeek`) + a read-only quarantine via `editMode()` (which
  gates every rendered edit affordance AND the board mutation handlers, both edit
  week and board). I did NOT add explicit `amFormatOf` consults to the OIL wire /
  `persistAll` / hydration, or a slots-funnel guard, because those paths already
  handle a pre-Phase-2 book SAFELY: the verId resolvers return null for old ids
  (publication naturally suppressed), OIL falls back to the raw stashed days so
  credits STAND (never deleted — a naive "skip" would delete them, which the plan
  itself warned against), and `persistAll`/stash re-serialize `SCHED` verbatim so
  the old book round-trips byte-for-byte (never upgraded). So P2-R3-02's "no edit
  silently dropped" holds via preservation + editMode read-only, not via a funnel
  refusal. **Codex should judge whether the fuller consult-everywhere guard is
  warranted, or whether safe-degradation + editMode is sufficient.**
- **P2-07 (reconcile/rebase).** No change made: canonical-only address families
  (`wx/fx/bx/bxr/gx`) are NEVER raised as pending marks (only `dayKeys`-grammar
  addresses are), so there is no such mark for reconcile to erase; eligibility comes
  from `dayDelta`, which the step-0 translator already rid-joins for these families.
- **`keys.ts`.** `shiftKeys`/`permuteKeys` still remap `a.keys`/`adds`/`structAdds`
  — a no-op on a Phase-2 record (no live keys), legacy records remapped as before;
  the frozen `snap`/`diff` are never touched.

## Pick up here
1. **Fresh Codex inspection of the finished diff** (owner + plan require it before
   merge). Route it cross-provider — `claudex-loop` / `codex-review`, host=claude,
   reviewer=codex. On Windows set `PYTHONUTF8=1` first (see observation-log #1: a
   `charmap` crash is display-only, the `result.json` may already be valid).
2. **Merge only on the owner's explicit "merge live"** AND a clean Codex pass.
   No-auto-merge stands (2 Sep 26). Leave PR #395 and the EOD feature alone.
