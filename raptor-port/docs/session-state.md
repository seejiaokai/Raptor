# Session handoff — [AMEND] Phase 2: built + gates green, but Codex inspection = REVISE (fixes pending)

## Where it stands
Phase 2 — the coupled amendment-record rewrite — is **built and gate-green** on
`claude/amendment-engine-core` (steps 2–7 + step 3), committed (not merged). BUT the
**fresh Codex inspection came back REVISE with 12 findings (6 high)** — see
`2026-09-12-amendment-phase2-code-inspection-log.md`. All 12 read as VALID; several
refute the "safe-degradation" shortcut behind the minimal step-3 classifier, and two
(P2-IMPL-06/07) expose a real `dayHasChanges`/`dayDelta` invariant gap partly in
step-0/1 `canonical.ts`. **Do NOT merge. Next is the FIX CYCLE, then a fresh
re-inspection, then the owner's explicit "merge live."**

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

## Pick up here — the FIX CYCLE (round-1 Codex findings)
1. Work `2026-09-12-amendment-phase2-code-inspection-log.md` finding by finding.
   Suggested order (contained first, then the design work):
   - Quick/contained: P2-IMPL-04 (stamp `amV` on first publish), P2-IMPL-12
     (validate each `dayCurVerIn` candidate by descending seq), P2-IMPL-09
     (capture the recovery delta count before `withDaySnap`), P2-IMPL-10/11
     (week/edit-scope the template arm + disarm the slot), P2-IMPL-07 (make
     `dayHasChanges` derive only from `dayDelta`, drop the digest fast-path).
   - Larger design: P2-IMPL-06 (`canonicalDiff` surviving-row field additions —
     who[]/more[]/pax[]/bxr), P2-IMPL-08 (canonical-only mark attribution +
     reconcile/rebase), P2-IMPL-01 (OIL protect-not-delete for unsupported/
     wrong-week), P2-IMPL-02 (real byte-preservation: bypass migration/writeback
     for an unsupported book), P2-IMPL-03 (input-path read-only guards),
     P2-IMPL-05 (persist the 4-state filing across navigation).
   Test-first each; keep the full gate set green; do NOT weaken assertions.
2. **Re-inspect** in a fresh Codex session (`inspect` mode, same runner,
   `PYTHONUTF8=1`, `--base d125fd5`) — MAX_INSPECTION_ROUNDS budget: this initial
   round + one after fixes.
3. **Merge only on the owner's explicit "merge live"** AND a clean Codex pass.
   No-auto-merge stands (2 Sep 26). Leave PR #395 and the EOD feature alone.
