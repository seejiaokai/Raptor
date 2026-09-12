# Session handoff — [AMEND] Phase 2 (coupled record rewrite): plan APPROVED, build steps 0–1 done

## Where it started
Owner (non-technical) resumed the amendment-engine CORE build, Phase 2 — the coupled
record rewrite — on `claude/amendment-engine-core`. This session: wrote a focused
Phase-2 implementation plan, hardened it through a **5-round cross-provider red-team
(Codex / GPT-6 Astra, high)** to a clean **APPROVED** (findings 9→7→4→1→0), then began
the test-first build. Owner chose (deliberately) to **hand off the remaining atomic
re-key to a fresh session** at a clean committed checkpoint, because that part can't be
checkpointed green mid-way and a long chat re-sends itself each turn.

## Shipped
- Nothing to `main`. All work committed and pushed to `origin/claude/amendment-engine-core`.
  Do NOT merge — owner's explicit "merge live" only (no-auto-merge, 2 Sep 26). No
  Vercel preview for this phase — it's engine work, nothing visible yet.

## The approved plan is the spec — READ IT FIRST
- **`raptor-port/docs/superpowers/specs/2026-09-12-amendment-phase2-implementation-plan.md`**
  — APPROVED (SHA `c4f028…`), §8 is the build-order checklist. Governs everything below.
- Review trail: `…-amendment-phase2-review-log.md` (every finding + disposition, rounds 1–5).
- Frozen brief: `…-2026-09-12-amendment-core-build-brief.md` (Rev 5) §2/§3/§5.0/§7/F-01/F-02.

## Done this session (committed, green)
- **Step 0 (commit `7baa692`)** — canonical foundation. `canonicalContent` now adds
  `ground[].src` (`gx:`) and DECOMPOSES `ar:`/`at:` into `fa:`/`ft:` (formation) +
  `aa:`/`au:` (per-aircraft); rid translator (`rowids.ts:keyLevels`) taught
  `wx/fx/bx/bxr/gx/fa/ft/aa/au`. `canonical.test.ts` extended. `dayKeys` UNCHANGED
  (marks/parity path untouched).
- **Step 1 (commit `889812e`)** — the ONE normalized delta. `canonical.ts:canonicalDiff`
  (pure, rid-joined value/structure/order axes; 8 cases green in `daydelta.test.ts`
  incl delete-before-survivor, move-and-move-back=nothing, edit-plus-move).
  `publish.ts`: `dayFilingFingerprint` (4 states u/g/r/'' — see P2-R4-01), `dayDelta`/
  `dayDeltaIn`, `dayHasChanges`; `daySnap` now stores `fil`. **NOT yet wired into
  `publishALDay`** — that is step 4.
- Gates run this session: `npx vitest run` on `canonical` `rowids` `publish` `daydelta`
  = green. **Full gate set NOT run** (build is mid-way by design; will go red until the
  atomic re-key is complete — expected).

## Unfinished — the atomic re-key (plan §8 steps 2–7). RED until complete.
This is one coherent change; the record-shape change breaks every reader at once. Do it
as a focused push, honouring these (all from the review — do NOT re-open the settled model):
- **Step 2 — identity re-key.** `SCHED.als` record → `{id:verId, di, iso, seq, snap:{d,c,fil}, diff, sign}`;
  `SCHED.orig[di]` gains `id`; `SCHED.cur[di]` stores a **verId** (not `'orig'|n`).
  Rewire `daySnapIn`/`dayCurVerIn`/`daySnapOf`/`dayVersions`/`verLabel` over verId; add
  `nextSeq(di)`. **Resolver MUST validate identity-belongs-to-day AND the passed-in week
  key** (`dayIso(weekKey,di)`; live=CURWEEK, stash=its own key) — P2-R2-05/P2-R3-03.
  `alColor` keys on `seq`.
- **Step 3 — shared legacy-format classifier.** `SCHED.amV` + `amFormatOf`/`protectedWeek`,
  consulted by hydration (`persist.ts`), scheduler load (`store.ts:applyWeekModel`), the
  stashed-week OIL decode (`leavewar/sync.ts:745`), BOTH OIL directions (incl the
  credit-delete `runOilPass:~897`), stash-on-leave (`store.ts:451`), `persistAll`
  (`persist.ts:105`). Unsupported book → preserve blob, suppress publication/authoritative-
  fallback/destructive-OIL, and make the week **read-only** at UI + mutation entry
  (P2-05/P2-R2-04/P2-R3-02).
- **Step 4 — issue rewrite.** `nextSeq`; `alIssue`/`publishALDay` store the new record +
  `diff` (from `dayDelta`) + `fil` + stamp `cur=id`; gate on `dayHasChanges` (NOT
  `pendCount`); extend `reconcileIssuedMarks`/`rebaseDayPending` to the canonical
  addresses via the translator (P2-07).
- **Step 5 — take-back removal + sweep.** DELETE `unpublishAL`, `restoreDayVersion`,
  `reissueReopened`, `publishAL(n)`; strip `setDayApproved`'s `off` branch; simplify
  `alIssue` ownership (drop `carried`/`structAdds` union); beak inert on a published day
  (no reload — §9); ALPanel **per-day** publish (NOT publish-all, brief §10); recovery
  "Load onto working copy" dirty-check reads `dayDelta` not `dayPendCount` (P2-R2-06);
  convert `applyDayTpl` on a published day to working-draft+confirm→next AL (P2-R3-04);
  sweep old-identity UI consumers `Shell.tsx:154/79-80`, `interactions.ts:831`,
  `html.ts:955-957/1568-1569`, all `nextAL` callers (P2-R2-04); prune `probe-bridge.ts`
  + `state/store.ts` re-exports of the deleted fns; update `engine/schema.ts` AlRecord/Sched types.
- **Step 6 — test sweep to green** (~11 files; the removal-target symbols + new pins in
  plan §7). Record the record shape via a SERIALIZATION round-trip, NOT undo-across-publish
  (undo boundary is Phase 3 — P2-R2-01).
- **Step 7 — full gate set ONCE** (`npm test`, `npm run build`, `node reference/tfin.js`
  =**728/0**, `npm run test:e2e`, `npm run smoke:tracker`), then a fresh **Codex inspection
  of the finished code** before any "merge live".

## Branch state
- Designated branch: `claude/amendment-engine-core` (pushed). Its PR is open/awaiting
  "merge live" — do NOT merge. NOT merged, so do NOT reset to main; continue ON this branch.

## Gates
- `npm test` · `npm run build` · `node reference/tfin.js` · `npm run test:e2e` ·
  `npm run smoke:tracker` — **not run** this session (mid-build). Affected unit files only:
  green. Run all from `raptor-port/`; a fresh container needs `npm ci` first. Parity must
  stay **728/0**; the amendment book is internal state (marks only emit on published days,
  `alAttr` short-circuits pristine), so parity is safe if `dayKeys`/renderers are untouched.

## Open questions
- None outstanding. Owner confirmed the immutability model (a published version is frozen;
  changing it = a new AL; the reopen "beak" loses its un-publish job — plan §9). The
  cross-provider inspection of the FINISHED code (fresh Codex) is still owed before merge.

## Pick up here
Follow the approved plan `2026-09-12-amendment-phase2-implementation-plan.md` §8 from
**step 2** (identity re-key). Steps 0–1 are done and committed; the delta primitive and
filing fingerprint exist but are not yet wired into `publishALDay`.
