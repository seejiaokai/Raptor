# Amendment engine — CORE build plan (test-first)

**Status:** building. Branch `claude/amendment-engine-core` off `main`.
**Progress (12 Sep 2026):** Phase 1a DONE & committed (`09f49ab`) — canonical
day-content schema + digest, test-pinned (`engine/canonical.ts` +
`canonical.test.ts`, completeness + per-field visibility green). **Phase 1c DONE**
— version identity (AM-01) primitive test-pinned (`engine/verid.ts` +
`verid.test.ts`: immutable full-date-incl-year id, no Mon/Tue AL1 collision,
sequence vs display label separated). Phase-1 gates run: `npm test` 4545/4545,
`npm run build` clean, `reference/tfin.js` 728/0. The two browser gates
(`test:e2e`, `smoke:tracker`) have a documented Windows-local-only failure
(commit `d9fbb81`); authoritative on CI Linux, run on push.

**Phase 2 STARTED (12 Sep 2026).** First lock committed: `discardPending`
restricted to never-published days (F-01), pinned in `publish.test.ts`. Full
unit suite green (4546/4546), build clean, parity 728/0.

**Phase 2 sequencing finding (act on this next).** The take-back removal is NOT
a set of independent button-deletions — it is a COUPLED rewrite, best done as
one deliberate test-first unit rather than piecemeal:
- `unpublishAL` and `restoreDayVersion` are woven into the structural-add
  OWNERSHIP machinery (`SCHED.added`/`structAdds`, the `surviving` computation),
  probed by ~40 test references across ~12 files (`publish.test.ts`,
  `restore.test.ts`, `rowids.test.ts`, `drafts.test.ts`, UI suites). Removing
  them in isolation would force a rewrite of that machinery that the per-day /
  diff-not-keys AL-record restructure (below) would then rewrite AGAIN.
- The three remaining Phase-2 pieces are interdependent and should land together
  or in a tight sequence, each test-first: (a) digest-based publish trigger
  (`digest(draft) ≠ digest(issued)`, F-02) using Phase 1a's `digest`; (b) AL
  record stores the canonical DIFF, not `keys`; (c) per-day SEQUENCE keyed by
  the immutable `verId` (Phase 1c) — this is where `unpublishAL`,
  `restoreDayVersion` (→ `loadVersionToWorkingCopy`), `reissueReopened`,
  caller-numbered `publishAL(n)` and the reopen-beak are removed/replaced, and
  BUG-1/BUG-2 close.
- Recommended next step: write a focused Phase-2 implementation plan (the new
  AL-record shape, how structural-add ownership behaves with no take-back, the
  per-path replacement map, and the test-rewrite list), then build it test-first
  as a coherent unit. HEAVY, silent-defect, saved-data territory.

**Resume at Phase 2 (b/c) — the coupled record rewrite** (per-day sequence +
verId key + stored diff + take-back removal), following the sequencing note
above.
**Spec (frozen):** `2026-09-12-amendment-core-build-brief.md` (Rev 5, core scope).
**Decisions/rationale:** `2026-09-11-amendment-model-decisions.md`.
**Scope:** the Rev 3-converged core + four must-fixes + durability/undo/crew.
**Deferred:** `[EOD]` (end-of-day actuals) and the Rev 4 OIL-simplification's EOD
half — see the brief's CORE-BUILD preface. OIL here = §6-CORE (latest AL/Original
per day, per-day, read-failure protection); worked-day lock stays `[OIL]`.

## Working rules (owner's standing process)
- **Test-first every phase**: write/extend the pinning test, watch it fail, build to
  green. Never weaken a failing assertion.
- **Gates**: run only the affected `npx vitest run <file>` while iterating; the full
  gate set (`npm test`, `npm run build`, `node reference/tfin.js` = 728/0,
  `npm run test:e2e`, `npm run smoke:tracker`) once per phase before moving on.
- **Parity is sacred**: `reference/tfin.js` must stay **728/0**; the amendment book is
  internal state, not reference output — a diff there must not change printed bytes.
- **Saved data**: every new persisted field rides `schedFields()` and restores in
  `histApply`; unify `histSnap`/`weekStashSnap` (they already drift on `un`).
- **Mutation funnel only**; addressing by `rid` (with the §5.0 note/synthetic
  exceptions). Dense surfaces stay string-built.
- **Ship**: one accumulating branch; Vercel preview link per meaningful push; **merge
  to main ONLY on the owner's "merge live"**; don't watch the PR.
- **Final safety net**: a fresh **Codex** inspection of the finished code before merge;
  **Fable** reserved for a single high-stakes uncertain finding.

## Phase order (each maps to the brief; each is one review+fix unit)

### Phase 1 — Foundations: canonical content schema + digest (§5.0, AM-01)
- **1a. Canonical schema + completeness test.** Derive the canonical field set from
  `engine/schema.ts`'s `Day` (the source of truth), classify every field
  canonical|excluded, and pin `canonical ∪ excluded == every schema key` so a future
  field can't escape unclassified. Excluded: `dow`,`dt`,`today`,`wc` (restamped/derived),
  `secOrder`,`gman` (workspace arrangement, owner: not a published property), `rid`
  (join key). Canonical content-bearing fields WITHOUT a slot key (`cxr`, `f.shift`,
  `w.noconf/standalone`, `b.sa/noconf`, aircraft `spare/role`, `ground[].src` linkage,
  notes) get a **synthetic mark address** (`inp:`/`del:`/`mov:`-style) so `alAttr`/the
  AL panel can paint & list them. Notes are positional — define a stable note identity
  or an explicit positional-diff rule so a note change is always visible.
  *Proof:* new `canonical.test.ts` — completeness (`∪ == schema`); mutate EACH canonical
  field → a visible, publishable diff; mutate EACH excluded field → NO phantom diff.
- **1b. `digest(day)`** — stable canonical serialization used identically by snapshot,
  diff and signature. *Proof:* same digest for reordered-but-equal content; different
  digest for each canonical mutation; stable across a `wc`/`dow` restamp.
- **1c. Version identity (AM-01).** Immutable full-date identity **incl. the year** for
  Original + each AL; separate `sequence` + display label; per-day AL number is display
  only, never a key. *Proof:* Monday-AL1 and Tuesday-AL1 don't collide as keys.

### Phase 2 — Locked publishing (§2, §7, F-01; closes BUG 1 + BUG 2)
- Publish trigger = `digest(draft) ≠ digest(issued)`, NOT the pending-key count (F-02);
  the AL record stores the canonical **diff**, not `keys`.
- Remove every retraction/pointer-mover: `unpublishAL`, the reopen-beak-as-unpublish
  (`setDayApproved(di,false)`), `restoreDayVersion`, `reissueReopened`, caller-numbered
  `publishAL(n)`; restrict `discardPending` to never-published days. Only survivor for
  "old content" is `loadVersionToWorkingCopy` → republish as next AL.
- *Proof:* `publish.test.ts` — BUG-1 repro (unpublish older AL) is gone/impossible;
  BUG-2 (preview reopen) can't act on the live day; a published day is immutable.

### Phase 3 — Signatures bound to content (AM-06, §9 undo re-verify)
- Bind all four (CUR/SKED/PLAN/APPR) to `digest + schedule-date + base-issued-id +
  candidate-revision`. Invalidate on edits/plan-switch/recovery/relevant auto input
  updates. After `histApply`, **re-verify and KEEP if still matching** (F-09). Recompute
  digest + verify base id + rerun validation at every publish entry (hard blocks;
  advisories need a recorded ack). Capture Original's sigs before they clear.
- *Proof:* `signbind.test.ts` — sign A → switch to B → publish is refused; undo keeps a
  still-matching signature; an availability-only change invalidates with no cell touched.

### Phase 4 — Backups / contingency plans (§4)
- Backup record `{id,name,d}` + `baseIssuedVersionId` + base-content **reference by
  digest** (never a copy) + own draft-revision id. Plan names = free-text labels
  (colon allowed, id-tracked, auto A/B kept). Activation: load → three-way
  `base→current issued→candidate` → explicit keep/revert in plain words → re-validate
  incl input-linkage (`ground[].src` un-accepted/gone) → all four re-sign → publish next
  AL. Bind resolution to candidate-rev AND current-issued-id; re-verify both at publish.
- *Proof:* `backups.test.ts` — a stale backup can't silently revert a later AL; an
  invalid contingency (crew on leave) forces a keep/revert; parking needs no sign-off.

### Phase 5 — Safe migration (AM-02) — the riskiest
- Versioned, idempotent, resumable. ONE version-aware decoder for ALL readers
  (`persist.ts`, scheduler load, `leavewar/sync.ts`, `weekctx.ts` bundle/stashDays,
  `peek.ts`). Outcomes absent|valid|insufficient-evidence|migration-failed; the last two
  preserve blob/credits and suppress destructive OIL + live fallback. Deterministic
  legacy→per-day map (identity+date→id) in original issue order; label missing evidence,
  never backfill from live globals; keep the pre-migration book for recovery.
- *Proof:* `migrate.test.ts` fixtures — non-monotonic numbers, multi-day issues, removed
  rows, empty keys, historical `cur`, in-place re-issues, interruption mid-migration,
  mixed old/new weeks, cross-week validation vs a migrated neighbour.

### Phase 6 — Durability & stale-writer (AM-09 / §5a)
- One durable week transaction (issue + pointer + signatures + provenance); don't
  announce issuance on a queued/failed write — crew/Leave War stay on the last committed
  issue. `navigator.locks('raptor:writer')` single-writer lease + heartbeat fallback;
  backend revision stamp read before every put; `storage`-event → read-only. Reference
  base content by digest, dedupe per issued version; measured size gate in the quota test.
- *Proof:* `durable.test.ts` — a failed/quota write never advances the issued pointer;
  a second writer goes read-only; size gate trips before quota-forever.

### Phase 7 — OIL (core slice) + crew live-draft & projection (§6-CORE, §2/§8b)
- OIL: latest AL/Original per day, per-day derivation, read-failure protection (above).
- Crew: live-draft badge `◆ not yet issued`; issued `✓ AL# issued · locked`; crew field
  **projection whitelist** (schedule + warnings they already see; never leave reasons/
  medical/currency); viewer preview owns its own map isolated from `DPREV` (F-11);
  missing issued content → ERROR, never a live substitute; `digest==issued` → "no changes
  pending".
- *Proof:* `crewproj.test.tsx` + OIL per-day tests; parity 728/0 holds.

### Deferred to build, test-pinned (brief §12) — produced inside the phases above
1 canonical field list (1a) · 2 migration map (5) · 3 signature-invalidation matrix (3)
· 4 undo apply/skip whitelist (3) · 5 crew projection whitelist (7) · 6 locks lease +
revision stamp (6).

## Rough size (honest)
Multi-session. Phase 1 and Phase 5 are the biggest. Each phase: build test-first, full
gates, preview link, report. No merge without "merge live"; fresh Codex inspection of
the whole diff before that.
