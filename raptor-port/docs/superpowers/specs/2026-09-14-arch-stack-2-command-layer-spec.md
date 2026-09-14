# [ARCH-STACK] Step 2 — the ONE write/command layer (RC4) — DESIGN Rev 4 (NARROWED, build-ready)

**Status:** DESIGN, build-ready. Hardened over three red-team rounds (round 1: Claude + Fable + Codex;
round 2: Fable; round 3: **independent Codex** + Fable confirmatory). Owner decision 14 Sep 26:
**narrow scope** — build the pure in-memory command core + prove the transaction/conflict contract against
an in-memory storage test-double; **defer real durable multi-key/two-tab-safe saving to step 5** (the
record-oriented storage door), which is built for it. This deletes the entire class of findings that kept
recurring (the durability-on-whole-blob cluster). Backbone confirmed sound across all rounds.

**Build gate:** increment 1 is safe to build now. HOLD for "merge live". Model: Opus 4.8, test-first.

**Review log:** `2026-09-14-arch-stack-2-review-log.md` (rounds 1–3; F/CMD/B/RC4 findings + dispositions).
**Reads:** `2026-09-13-architecture-rootcause-plan.md` (RC4; SEQ-001/002/003/004 — note SEQ-003 explicitly
allows the concrete durable adapter to land at step 5), `architecture-direction.md`, `data-model.md`.

---

## 0. Why NARROWED (the scope decision)

The recurring hard findings across three rounds (round-2 B4; round-3 RC4-301/302/304; Fable-final 1/5/6)
all traced to ONE over-reach: trying to make production saving **crash-safe, two-tab-safe, and atomic
across multiple whole-file blobs IN THIS STEP**, on top of the current whiteboard→postman→localStorage
pipeline, which was not built for it. Per the owner's "many bugs from one decision → step back" guardrail:
that machinery is REMOVED from step 2 and lives at step 5 (the record-oriented storage door / Dataverse),
whose whole purpose is per-record, versioned, atomic durability. SEQ-003 is still satisfied — it asked
for the transaction/conflict **contract + a storage test-double** in step 2 (the concrete durable adapter
"can land late, step 5/7"). We prove the contract now against the test-double; we do not deploy it on
whole-blob production storage.

**Consequence:** in step 2, production persistence is UNCHANGED (whole-blob via the existing postman +
snapshot undo remain). The command layer drives the SAME persistence as today. No journal, no writer
lease, no confirmed/eventual durability modes, no remote pipeline — all step 5. [AMEND] keeps its own
narrow single-week safe-publish until step 5 generalises durability.

---

## 1. Current state (verified — three code maps + three review rounds)
(unchanged from Rev 3 §1; summarised)
- **Scheduler:** slot funnel + INPUTS funnel + two ungoverned bypasses (PEOPLE via `persistPeople`,
  VCONF via `HOOKS.storeBackend`) + layout/planning writers. `canonicalDiff` is a publication delta
  (not a complete change producer). Undo = whole-world snapshot; persistence = whole-blob via `persistAll`
  on every `histPush`. Publish: `setDayApproved` freezes `orig`, `alIssue` freezes `als[].snap`; the live
  published day stays editable; live/draft/issued share a rid-space. Storage contract: `backend.ts`
  `{loadAll, put(c,id,json), remove}`; whiteboard→postman (300 ms coalesce per key, retries, never rolls
  back)→backend; individual `setItem` per key.
- **Leave War:** persists in prod; own store + snapshot undo pushed inside `persist()`; undo drives sync;
  RC2 (leave stored twice, joined by diff); **verified RC1 bug** — an outbound-minted input reaches
  `HOOKS.histPush` (`sync.ts:279`→`writeInputsBatch`→`runInputWrite`→`store.ts:153`→`persist.ts:138`), so
  an LW undo creates a scheduler undo step today.
- **Tracker:** no single commit door (~30 `save*`); SYL deferred vs layout auto-saved; volatile undo.
- **Writer identity:** `HOOKS.whoami()` returns an account LABEL, not a person id.

---

## 2. Design — the concepts (narrowed to what step 2 builds)

### 2.1 Record catalogue & identity (keys corrected per RC4-303)
Only LIVE working data is row-granular; issued snapshots and parked drafts are single blob records.
**Keys are week/day-qualified where the underlying state is per-week/day** (RC4-303 — draft ids are minted
`dr1/dr2` PER DAY, and `sign`/`pointers` are restored per week, so an unqualified key collides):

| Record | Key | Notes |
|---|---|---|
| Day field | `(week, di, field)` | `secOrder` persisted/undoable/**non-canonical**; `gman` canonical (ORDER). |
| Schedule row | `(week, di, container, rid)` | `container ∈ live | draft:<draftId>`. |
| Container order | parent's `children: rid[]` field | reorder = one `put` on the parent. |
| Amendment marks | **DERIVED, not stored** — `canonicalDiff(issued(di), live(di)) ∪ filingDiff`; memoised for `alAttr` by `(di, live version, cur verId)` | no `pending`/`changes`/`added` records. |
| Draft sign | `(week, di, sign)` = `{signers, boundDigest}` | **digest-bound, not event-cleared** (RC4/ Fable-3): valid iff `boundDigest == digest(live(di))`; no hook "clears" it — validity is recomputed, so undo keeps a still-matching signature ([AMEND] Phase 3 / §3(c)). |
| Unaccepted list | `(un, week)` | source of truth for deliberately-unaccepted inputs; `inputs.acc` is its on-load projection (direction declared — RC4-308/Fable-8). |
| Original / Amendment | `(amendments, week, verId)` — frozen blob | read for diff/preview only. |
| Draft (parked) | `(drafts, week, di, draftId)` — blob | qualified (RC4-303). |
| Day pointer | `(pointers, week, di)` = `{cur, dayOK, curDraft}` | mutable; advances on issue. |
| Input | `(inputs, iid)` | ownership + quarantine rules; medical docs (IndexedDB) out of step-2 scope. |
| PEOPLE / Setting | `(people, id)` / `(settings, key)` | shell-owned; `store.set` becomes the settings adapter so VCONF/templates/qualcols join as `(settings,key)` commands. |
| PLANPUCKS / DAYRMK | `(plan, pp)` / `(plan, date)` | |
| WARNOFF etc. | session collection (§2.6) | audited/undoable; NOTE it IS persisted inside the week blob today (`store.ts:584`) — treat as `persisted`, not `session`, so muted checks survive a reload. |

**Identity-injectivity test:** across multiple days AND weeks, no two distinct records share a key
(serializer-key completeness alone can't catch the draft/sign/pointer collisions). **Completeness test:**
every key from `schedFields()` (excluding dead `al`/format stamps `ridV`/`amV`) + `weekStashSnap()` +
`persistAll()` + `store.set` settings keys maps to exactly one row. LW adapter: `LeaveBid(warId, personId,
date)` = one record `{code,state,source,shiftedFrom}`; others one blob each. Tracker: SYL vs layout distinct.

### 2.2 Change
```
Change = { collection, id, op: 'put' | 'delete', before, after, baseVersion }
```
Whole record `before`/`after`. Delete is logical/versioned (tombstone). **Inverse table (RC4-306
corrected):** create→delete; update→put(prev VALUE); delete→restore(prev VALUE) — and in ALL cases the
result is stamped a FRESH, higher version (never restore a historical version — that would let a stale
`baseVersion` pass the conflict check). Reversal precondition = the current record's result/tombstone
version.

### 2.3 Command
```
Command = { id, ts, principal, origin, kind, label, changes, coalesce? }
```
- **`principal`** — trusted SESSION identity, NOT `whoami()`'s label (separate person-map/display for
  audit). Two prototype accounts until SSO ⇒ "principal's actions" ≈ "this session's actions" (fine — undo
  is session-scoped).
- **`origin`** = provenance, never authority; privileged producers are separate bound entry points:
  `causal` (undoable), `derived` (a projection produced by a hook inside a causal command — §2.4 step 2),
  `system` (a producer with no causal parent — the notify-driven sync passes, PO archive, week-landing;
  **never an undo entry**; bound to allowed collections; this is what stops an LW undo from creating a
  scheduler undo step — RC1), `boot`.
- **No `durability` field in step 2** (narrowed). All commands persist AS TODAY (see §2.4 step 7). The
  confirmed/eventual distinction is a step-5 concept.
- `coalesce?:{key,windowMs}`; `batch(label, fn)` = ONE command; all-`before≡after` = no-op.

### 2.4 `commit(command)` — THE one write path (in-memory, atomic)
1. **Authorize — per-collection POLICY** `allow(principal, effectiveRole, change{before,after}, ctx) →
   ok|reason` (ctx = read-only store view: stage, window, ownership). Preserves ownership, field
   restrictions (medical admin-only), stage/window law, uniqueness, schema/value validity, cross-module
   ownership. `effectiveRole` = view-as preview; `principal` = login identity.
2. **Derivation hooks INSIDE the transaction** — **pure functions of the provisional VIEW** (Fable-3):
   `derive(provisionalView) → (desired − actual) Change[]`, with NO access to the command's change list.
   Fixed order (roster-reproject → inbound → OIL → outbound); each appends `derived` changes; the
   provisional view = store + causal changes + earlier hooks' changes, spanning the stash/all weeks (OIL).
   **Fixed-point proof:** re-run the hook set in dry-run on the result; any change whose content differs
   (excluding core stamps `updatedBy/At`, re-minted ids) → the command FAILS with a diagnostic (property
   test asserts the fixed point). A hook that must refuse (derived input on a quarantined date) fails the
   whole command.
3. **Conflict check** — each change's `baseVersion` == current in-memory version, else REJECT the whole
   command; caller re-reads. Prevents A→Y / B→Z / A-undo clobber.
4. **Frozen check — RECORD CLASS only:** refuse `put`/`delete` to a frozen record (issued
   Amendment/Original snapshot, Signoff of an issued version; pre-live, a preserved quarantined book). The
   live published Day + rows, pointer, drafts and draft sign are MUTABLE.
5. **Publication-transition validators** (creating an issued record): recompute `digest`; verify
   base-issued id + candidate revision + signature bindings; rerun validation (hard blocks, advisories
   need a recorded ack); allocate a fresh `verId`. (In step 2 this reuses [AMEND]'s existing
   publish machinery as the validator body — see §7 increment 2.)
6. **Apply** all changes to the in-memory store — all or nothing.
7. **Stamp + persist AS TODAY.** Bump each record's in-memory `version` + `updatedBy/At` + `localSeq`
   (version/seq in a side table keyed by `(collection,id)`, OFF the domain objects — no week-format/parity
   risk; in-memory only this step). Then **persist through the existing path unchanged** — `commit` calls
   `persistAll()` for EVERY origin (so a `system` command persists too — Fable-4), and the
   `histPush→persistAll` wrapper is unwound in the same increment it adopts. No journal/lease/confirmed
   mode (step 5).
8. **Append & notify — AFTER the transaction releases** (RC4-308/Fable-2): append the command to the ONE
   global change stream, then fan `notify()` to subscribed module stores OUTSIDE the transaction guard. A
   `commit` started synchronously by a notify listener (the notify-driven sync in step 2/3) is a NEW
   top-level command, processed via a deterministic follow-up QUEUE — `commit` is not re-entrant, but the
   post-commit phase drains queued `system` follow-ups in order.

### 2.5 The change stream (ONE global stream)
One global, monotonically-sequenced stream. Each module keeps its own store/version for repaint and
subscribes to the collections it reads. Consumers: undo (step 3), sync (step 4), record-level persistence
+ Dataverse + remote pipeline (step 5). In step 2 the stream is BUILT and consumed by the invariant
harness + the (designed, not-yet-shipped) undo seam; production persistence does not yet consume it (it
stays whole-blob).

### 2.6 What is NOT a command
Ephemeral view/session state (`CURPAGE`, `SBDAY`, `ARM`, selection, `focus`, role affordance, `viewer`,
`LATEOFF`/`DPREV`/`WMOPEN`) — plain setters. `loadWeek` is a view change; its `acc` clear +
`autoAcceptSeedInputs` are `system`-origin commands. The week stash is a storage artefact.

---

## 3. Invariant harness — CLASSIFIED (SEQ-001)
- **(a) HARD (BLOCK):** authorization policy; referential integrity ON CREATE (dangling tolerated on
  delete via tombstone); schema/value validity; uniqueness; cross-module ownership; version + `localSeq`
  monotonic; multi-record atomicity; **identity injectivity** (no key collision across days/weeks).
- **(b) ADVISORY (detect, never block):** scheduling rules (double-booking warn-not-block, etc.). Test
  detection/severity/exemptions/cross-consumer agreement over valid AND conflicting generated schedules.
- **(c) FROZEN:** issued snapshots + signoffs immutable; **signatures are digest-bound** (valid iff
  `boundDigest == digest(live)`), so undo/restore keeps a still-matching signature; publication-transition
  validity is HARD on creating an issued record.

Deliverables NOW: the harness + classification + **command-layer stateful property tests** (random
command+undo/redo sequences preserve every HARD invariant, never mutate a frozen record, and the
derivation reaches a fixed point). Grown at step 4; persistence fault tests at step 5.

---

## 4. Transaction/conflict contract + storage test-double (SEQ-003 — proven, not deployed)
- **Contract:** `get→{value,version}`, `put(...,{ifVersion})→{version}`, `delete(...,{ifVersion})→
  {version}` (versioned tombstone), `subscribe`. Mismatch REJECTED, not queued; ack by read-back.
- **Storage test-double (deliverable):** in-memory backend implementing the contract WITH fault injection
  (drop ack, partial write, competing version bump, delay/reorder). The transaction/conflict/atomicity
  tests run against it. **Production storage is NOT changed this step** — the contract is proven here and
  DEPLOYED at step 5 (the record-oriented door), where the writer lease, write-ahead journal, whole-envelope
  recovery, and remote pipeline are built. (All the round-3 durability findings RC4-301/302/304 + Fable
  1/5/6 live in that step-5 work, by design.)

---

## 5. Undo — DESIGN THE SEAM now, BUILD in step 3
- Inverse-patch via the explicit inverse table (§2.2), through the SAME gate; **restore VALUE only, fresh
  version** (RC4-306). Reversal precondition = current result/tombstone version; a conflicting later edit
  BLOCKS the undo (plain message).
- Re-checks: authorization (recheck) → conflict → frozen/publish barrier. **Publish barrier (per-day):**
  publish is non-undoable and SKIPPED; on commit it DROPS WHOLE any undo entry touching that day (live
  rows, Day fields, drafts, sign, pointer, or an input whose date-range covers the day); clears redo.
- Origin scoping: only `causal` are undo entries; `derived` recompute; `system`/`remote` never.
- **Interim (increment 2, before the stream owns undo):** the retained snapshot-undo control must carry
  the causal command's changed-record set + result versions and restrict its inverse to that set (RC4-307
  — a `system` write between two user edits must not be reversed by a snapshot diff); OR retire snapshot
  undo in the same increment the stream switches on. Increment 2 picks one and states when each legacy
  stack retires. Any diff the bridge computes is a COLD-path exemption from the no-whole-world-diff rule.

## 6. Sync in step 2/3 (notify-driven via `system`); hooks + dissolution at step 4
- Step 2/3: sync stays NOTIFY-DRIVEN as today; its Raptor-side writes enter through `commit` via the bound
  `system` producer (audited, versioned, NOT undo entries — the RC1 fix). LW-side writes stay LW-native.
  Two pinned tests: an LW undo produces zero scheduler undo entries; a scheduler undo of "file leave"
  converges the LW grid without pushing an LW history step. **Static guard:** after increment 2,
  `leavewar/sync.ts` no longer imports `writeInputsBatch` (the only notify-driven Raptor-side writer that
  reaches `histPush`; `runPoArchive` already writes via `persistPeople` without a push).
- Step 4: reconcilers become derivation hooks; one-Absence record dissolves RC2; "undo stops driving sync"
  is a step-4 deliverable.
- Remote pipeline: step 5.

## 7. Migration — incremental, behind a flag
1. **Increment 1 — command core** (NOW; no scheduler file overlap; pure + in-memory): the module-agnostic
   `commit`/change-stream/version-side-table; the per-collection policy interface; the derivation-hook
   registry + fixed-point checker + post-commit follow-up queue; the invariant harness + property tests;
   the transaction/conflict CONTRACT + the in-memory storage test-double (+ fault tests). NO
   journal/lease/durability. **Fully testable with zero UI/production change.**
2. **Increment 2 — scheduler adoption** (AFTER [AMEND] Phases 2–5 merge — they rewrite the `publish.ts`
   paths this re-plumbs): slot/INPUTS funnels + layout/planning + PEOPLE + settings (via `store.set`
   adapter) route through `commit`; complete model→record adapters STAGE mutations (row-scoped
   `before=clone(row)`→mutate→`after=clone(row)`, never a whole-world diff); marks become derived; frozen
   check + publication-transition validators (reusing [AMEND] machinery) replace scattered guards;
   `commit` calls `persistAll()` for every origin, then the `histPush→persistAll` wrapper unwinds; the
   snapshot-undo bridge (§5) lands. Tests: catalogue-completeness + identity-injectivity walks; the two
   RC1 tests; the sync-import static guard.
3. **Increment 2b — Leave War**; `LeaveBid` record; sync writers → derivation hooks; LW undo at step 4.
4. **Increment 2c — Tracker**; `save*` → `commit`; SYL vs layout distinct records (fixes `sylDirty`).

Each increment: behind a flag, gated, shippable, with rename/reorder/delete/copy + conflict tests. While
the stream is on but undo not yet switched, `histSnap` still runs — measure against `probes/perf-port.cjs`
+ `performance.md` Part 1; forbid any `JSON.stringify(DAYS)` inside `commit()`.

---

## 8. What step 2 (this build) delivers vs defers
**Delivers (increment 1 now; increment 2 after [AMEND]):** the one in-memory write door (`commit`) + the
ONE global change stream; the per-collection authorization policy; the record model + qualified-key
catalogue + identity-injectivity; the derivation-hook engine (pure, fixed-point, post-commit queue); the
invariant harness + classification + property tests; the transaction/conflict contract + in-memory
test-double (+ fault tests); PEOPLE/settings joined; the issued-snapshot frozen boundary +
publication-transition validators; the RC1 fix (sync writes as `system`); the seam undo/sync/persistence
plug into.

**Defers to step 5 (the record-oriented storage door / Dataverse):** real per-record durable persistence,
the writer lease, the write-ahead journal + whole-envelope recovery, confirmed/eventual durability modes,
the remote change pipeline, and true cross-tab safety. **Defers to step 3/4:** the global undo button; the
one-Absence record; "undo stops driving sync". **Honesty:** in step 2 production persistence is UNCHANGED
(whole-blob via postman + snapshot undo); the version side-table is in-memory; the contract is PROVEN
against the test-double, DEPLOYED at step 5.

---

## 9. OPEN DECISIONS
- **DECISION 1 (resolved by narrowing):** the durable-write guarantee is NOT built in step 2 and NOT
  pulled from [AMEND]. [AMEND] keeps its own narrow single-week safe-publish; step 5 generalises durability
  for all modules. **No cross-effort edit to the [AMEND] plan is needed** (its Phase 6 stays with it as a
  scheduler-local concern; step 5 supersedes it later). Owner: confirmed narrow (14 Sep 26).
- **DECISION 2 (my call):** step 2 build = increment 1 now (parallel, no overlap) + increment 2 after
  [AMEND] Phases 2–5 merge. LW (2b) / Tracker (2c) follow.
- **DECISION 4 (owner sub-decision, deferrable to 2c):** Tracker ✓ Save changes — (i) SYL edits are
  commands on a persisted `syldraft` record, ✓ Save copies draft→def (survives reload; `beforeunload`
  changes) or (ii) `syldraft` is `session` (today's lose-on-reload). Recommend (i). Not needed until 2c.
- **HEADS-UP (not step-2 scope):** [AMEND] Phase 5 "safe migration of saved weeks" migrates demo data
  ruled reset-not-migrate — worth a look before it sinks more cost.

## 10. Whole-ecosystem ripple
- **Perf:** `commit` is an in-memory write primitive; render path untouched; row-scoped capture (never a
  whole-world diff) on the hot path; version/seq off the domain objects; measure the stream-on window
  against the DOM ceilings. Increment 1 touches NO existing hot path (pure new module).
- **Amendment:** `canonicalDiff`/`digest`/`verId`/AL book REUSED as consumers + validator bodies; frozen +
  publication-transition rules moved to one gate. Grep publish/quarantine writers + prose at increment 2.
- **Leave War:** behaviour unchanged; sync writes become audited `system` entries → FIXES RC1.
- **Roles/auth:** authorization at the gate as per-collection policy; `principal` from session,
  `effectiveRole` for preview (preview must not wipe undo).
- **Reset-not-migrate:** no storage-format change this step (persistence unchanged), so no `SCHEMA_VERSION`
  bump.

## 11. Residual notes (fold during build; none blocks increment 1)
- Increment 2: RC4-307 (bridge causal-only), Fable-7 (walk-test trips on dead `al`/format stamps + settings
  bypasses — make `store.set` the settings adapter), Fable-8 (`un` direction declared).
- Cross-module atomicity of input-delete→LW-withdrawal (RC4-305): under narrowing this is UNCHANGED from
  today (not made worse); true atomicity arrives with step 4 (one-Absence) / step 5 (durable txn).
- `data-model.md` §9: update to block-with-message (not "clear undo stack") when step 5 lands; note the DB
  `editingBy` lease and a tab lease are different layers. Not needed this step.

## 12. Model & process
- Design Rev 1→4: Opus 4.8. Red-team: round 1 Claude+Fable+Codex; round 2 Fable; round 3 independent Codex
  + Fable confirmatory — all REVISE→folded; narrowing removes the recurring cluster. Build: Opus 4.8,
  test-first, per increment, gates each. Final code inspection: both providers (Fable + Codex) on the built
  diff. HOLD for "merge live".
