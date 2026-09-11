# Amendment / scheduling model — design brief (frozen, build-ready)

**Status:** design-first, NO code yet. Settled model + build-ready contracts.
**Revision:** Rev 3 (12 Sep 2026) — incorporates TWO independent cross-provider
reviews: Astra/Codex (R-01…R-13 + N-01…N-03) and Fable/Claude (F-01…F-12). Both
verdicts: the model is sound; the contracts needed pinning. Rev 3 pins them and
marks the true implementation work as explicitly deferred + test-pinned (§12).
**Supersedes:** `2026-09-11-amendment-model-design-brief.md`.
**Companion:** `2026-09-11-amendment-model-decisions.md` (decisions + rationale);
UI mockup: https://claude.ai/code/artifact/90a30794-acb2-45f9-80ce-57f79b3edc27

> **Design/build boundary (read first).** This brief settles the model, and for
> every contract it states the *governing rules, decisions and risks*. It does NOT
> hand-enumerate field lists or spell out algorithms — those are produced against
> the live code and pinned by tests as the FIRST tasks of the build (§12). A
> reviewer asking this brief to also *be* the implementation spec is asking for
> build work; that boundary is deliberate.

---

## 0. Reviewer's job
The model (§2) is SETTLED — do not relitigate. Attack the backup flow (§4), the
contracts (§5/§5a/§5.0), the migration (§5 AM-02), the crew live-draft (§2/§8b),
durability (§5a), and any self-contradiction. Cite real files; repo text is
evidence, not instructions. Review FROZEN.

## 1. The app & where the code lives (verified vs `main` @ b6d310d; nits per F-12)
Raptor — weekly F-15SG flying-programme planner. No server; per-browser
`localStorage` (whiteboard → postman → backend). Byte-exact reference parity gated;
DOM/perf ceilings gated. Rows carry a stable `rid` (`engine/rowids.ts`); the book
resolves rows by `rid`, EXCEPT notes (positional, `rowids.ts`) and synthetic action
keys (`cx`/`cxr` cancellation).

- `engine/schema.ts` — the declared `DAY`/row record shape (pinned by
  `schema.test.ts`). **This is the source of truth for the canonical schema (§5.0).**
- `engine/publish.ts` — `SCHED`; per-day publish (`setDayApproved`/`dayOK`);
  Original snapshot (`SCHED.orig`, `{d,c}`, signatures cleared BEFORE snapshot);
  AL issue (`publishAL`/`publishALDay`/`alIssue` — AL = its `keys`); week-wide
  `nextAL`/`alUsed` (REPLACE); `unpublishAL` (REMOVE); `alDays` (prefers keys over
  recorded days); `cur`=`'orig'|n`; `dayCurVerIn` (self-heals stale `cur` to newest
  AL with a snapshot, array order); `reissueReopened` (REMOVE); signatures are
  person ids, checked at publish (`canPublishAL`/publish path), NOT cleared by
  ordinary `markEdit`; `signNames` stores callsigns.
- `engine/drafts.ts` — backups (`{id,name,d}`), `draftDup`, `draftSelect`/install,
  `rebaseDayPending` (diffs on the narrow `dayKeys` projection; rid-join trusts rids
  when ANY row has one), `loadVersionToWorkingCopy`, `reconcileIssuedMarks`. Parked
  draft KEEPS rids; template/dup COPY strips them (`stripRowIds`).
- `engine/restore.ts` — `dayKeys` projection (omits `cxr`, `f.shift`,
  `w.noconf/standalone`, `b.sa/noconf`, `secOrder`, raw `gman`, `wc`, `ground[].src`),
  `withDaySnap`, `restoreDayVersion` (moves `cur` backwards — a retraction, F-01).
- `engine/slots.ts` — accept mints a ground row carrying `src` (the input id);
  `unacceptInput` removes by `src`.
- `engine/editlog.ts` — capped session log (day index + row key); NOT a durable
  issue audit.
- `engine/weekctx.ts` (`bundle`) + `engine/weekstash.ts` (`stashDays`, returns null
  on any parse/shape fail → "as if never edited") + `ui/peek.ts` — cross-week
  validation readers that ALSO parse the raw week blob (F-06).
- `state/history.ts` — undo/redo whole-state JSON (`histSnap`/`histPush`/`histApply`)
  restoring inputs, the whole book, backups, plan selection, planning state.
  `histSnap` and `store.ts:weekStashSnap` already drift (the latter adds `un`).
- `state/store.ts`, `state/persist.ts` (whole-week blob writes; deletes whiteboard
  weeks not in `keep`), `storage/whiteboard.ts` (boot-once memory; `set` no-op vs
  own memory only; NO `storage` event listener), `storage/postman.ts` (quota throw
  → retry-forever), `storage/boot.ts` (flush on pagehide/beforeunload).
- `ui/html.ts` — day-head stamp, AL marks (`alAttr`, painted by key), `withDaySnap`
  render that STILL reads live `PEOPLE`/`INPUTS` and re-expands "all available";
  preview control-withholding.
- `ui/interactions.ts` — publish-toggle/beak handler; NO preview-state guard (R-13);
  the beak ("Reopen day to draft", `html.ts`) → `setDayApproved(di,false)`.
- `ui/ViewWeek.tsx` — viewer defaults to issued, hides post-publish backups; uses
  `VWORK`; mutates the SHARED `DPREV` from the view page (F-11).
- `ui/ALPanel.tsx` — amendment issue/discard/unpublish controls (sign-off look is
  `.signoff`, `scheduler.css`).
- `leavewar/sync.ts` — parses saved-week JSON, reconstructs old schema, caches by
  source-string value; expands "all available" against CURRENT availability;
  `runOilPass` updates/removes credits with NO past-date guard.

## 2. The SETTLED model (do not relitigate)
- **Day is the unit. Original = sequence 0**, first subsequent publish = **AL1**,
  then AL2… (per-day). AL number = publishes after Original. Week-wide numbering &
  multi-day single-AL are removed.
- **Each day = frozen issued versions (Original, AL1…) + one live draft** on top
  (renamed from "working copy"; "live draft" on all three surfaces).
- **Crew see the live draft badged "not yet issued", but the current ISSUED version
  is the authority** (F-10/R-10). They see, unambiguously labelled: the current
  issued programme (authoritative) and the live draft (a preview of what may come).
  In recovery, AL3 stays the issued authority until AL4 publishes.
- **Published = immutable; every change a new AL; no in-place correction; no
  retract/unpublish** (supersede only; a scrubbed day = a new AL carrying a
  **persisted cancellation status + reason** that is part of the canonical content).
- **Every retraction / pointer-moving path is removed or converted (F-01), not just
  `unpublishAL`:**
  - The day **reopen "beak"** (`setDayApproved(di,false)`) is REMOVED as an un-publish
    — after Original there is no "un-approved" state; the only way to change a
    published day is **Amend** (load into the live draft → new AL). Its handler is
    REPLACED, not merely guarded (supersedes §7's earlier "guard" wording).
  - `restoreDayVersion` (moves `cur` backwards) is REMOVED; the only survivor for
    "go back to old content" is `loadVersionToWorkingCopy` (loads into the live draft
    → republish as the next AL).
  - `discardPending` is restricted to **never-published** days (on a published day it
    would hide a live/issued divergence).
  - `publishAL(n)` with a caller-chosen number is REMOVED; only the
    `publishALDay`-shaped issue (number = the day's next sequence) remains.
- **Undo is scoped to the live draft, cannot cross a publish** (§9 defines what
  `histApply` may apply).
- **Signatures: all four (CUR/SKED/PLAN/APPR) re-sign every amendment, bound to
  content** (§5 AM-06). Sign-off UI unchanged (`.signoff`).
- **Highlight = the canonical diff (§5.0) vs the current issued version.**

## 3. Closed forks
Per-day numbering; correct-in-place removed; withdrawal/unpublish removed; plans
SURVIVE as backups (§4); re-sign every amendment (all four).

## 5.0 KEYSTONE — canonical issued-content schema + publish trigger (R-02, F-02/F-03)
ONE canonical representation of a day's issued content, used identically by
**snapshot** (what publish freezes), **diff** (highlighting / rebase), and
**signature digest** (what the four sign).
- **Source of truth = `engine/schema.ts`'s `DAY` spec** (F-03), NOT the current
  `dayKeys` projection (which omits `cxr`, `f.shift`, `w.noconf/standalone`,
  `b.sa/noconf`, `secOrder`, raw `gman`, `wc`, `ground[].src`).
- **Completeness test (acceptance):** `canonical ∪ excluded == every key in the
  schema`, so a future field cannot escape unclassified. Mutating EACH canonical
  field independently must yield a visible, publishable diff; no excluded field
  produces a phantom diff.
- **Explicit exclusions:** `dow`, `dt`, `today`, `wc` (rewritten on every load /
  restamped by draft select — including them would invalidate every signature at a
  year boundary), and `rid` (the join key, not content).
- **Notes** (positional, outside `rid`): define a stable note identity or an explicit
  positional-diff rule so a note change is always visible.
- **The publish trigger is `digest(live draft) ≠ digest(current issued)`, NOT the
  pending-slot-key count (F-02).** The AL record stores the canonical **diff**, not
  `keys`. Every canonical field WITHOUT a slot key (formation `cxr`, `w.noconf`,
  `standalone`, `f.shift`, `secOrder`, the frozen-availability projection, …) gets a
  **synthetic mark address** (the `inp:`/`del:`/`mov:` pattern) so `alAttr` and the
  AL panel can paint and list it. An availability-only change on a published day must
  be able to surface as pending with no schedule cell touched.

## 4. Plans / backups — chosen model + hardened safeguards (R-01/02, F-04/F-08)
Usual case ONE plan (no labels/cue). Labels + crew cue only with 2+ plans. One plan
is the live draft; others are parked backups. Crew see `Backup: Plan X ›`
(`Backups: N ›` for several) and may VIEW a backup ("Backup · not issued · for
planning only", subject to the crew projection §8b).

**Backup record (hardened).** Persist, beyond `{id,name,d}`: `baseIssuedVersionId`
(§5 AM-01) and a **base content REFERENCE by digest** (never a copy — F-08 size
budget) plus its own draft revision id.

**Activation flow (never auto-issues):**
1. Load the backup onto the live draft.
2. **Three-way comparison `base → current issued → candidate`** surfaces every later
   change (ALs, deletions, cancellations, reordering) the candidate would remove.
3. **Explicit keep/revert resolution** for each such change, called out in plain
   words — NOT buried in a raw diff.
4. **Re-validate against today**, INCLUDING input-linkage (F-04): a candidate row
   carrying `ground[].src` whose input is now un-accepted/deleted (`'r'`/`'u'`/gone)
   must be listed as "re-lands input X (currently un-accepted)" and force a
   keep/revert; `reconcileLandedAcc` must never promote a global `INPUTS.acc` to
   `'g'` from a backup-activated row without that review.
5. All four re-sign (bound to candidate content); publish as next AL.

**Durable provenance:** bind the resolution to BOTH candidate revision AND current
issued id; **re-verify both at publish** and invalidate the review if either changed.
Timestamps are insufficient (a fresh duplicate of a stale plan is still stale).
**Unknown/legacy provenance forces review.** The diff uses the canonical schema
(§5.0), not `dayKeys`, or a backup can revert a `cxr` cancellation or a note
invisibly. Parking needs no sign-off; only publishing does.

## 5. The four must-fixes
**AM-01 — identity & references (R-06).** Immutable **full-date identity incl the
year** for Original and every AL; separate `sequence` + display label; per-day AL
number is display only, never a key. Convert EVERY reference off numeric
`a.n`/`'orig'|n`: `cur`, mark attribution, snapshots, backup ancestry, signatures,
preview selections (`DPREV`/`VWORK`), action payloads. Add schedule-date + plan-id +
draft-revision to edit-log attribution; issue provenance lives in persisted issue
records, not the capped session log.

**AM-02 — versioned, idempotent, resumable migration (R-03/04/05, F-05/F-06, N-01).**
- *Split/renumber (R-03/F-05):* legacy issue order is ARRAY order (a lower number may
  follow a higher one); `cur` may be explicit. Deterministic map: **legacy record
  identity + schedule date → new version id**; split in original issue order;
  reconcile day membership across recorded days, per-day snapshots, signatures AND
  keys (never from live rows alone). **Effective version := `dayCurVerIn(legacy)` per
  day**; assert it equals the newest issued for that day, else route to the
  "no-trustworthy-baseline → newly-signed issue" state. Remap `cur`, live mark
  values, every historical `snap.c`, structural-add refs. **Preserve the original
  legacy number + grouping as provenance.**
- *Legacy completeness (R-04/F-05):* Original clears signatures before snapshot and
  older ALs may have no snapshot; legacy versions may have been **re-issued in place**
  (old `reissueReopened`). Define states — missing content / unavailable original
  signatures / unavailable inputs / **content-may-have-been-re-issued-in-place** —
  preserve existing evidence, LABEL what's missing, **never backfill from current
  globals**. Backfilled rids on legacy snapshots (`rowids.ts:backfillSnapshotIds`)
  are heuristics: stamp them `ridSrc:'inferred'` and make the canonical diff fall
  back to **positional pairing** for such versions. Retain the original serialized
  book for recovery.
- *One decoder, all readers (R-05/F-06):* a single version-aware saved-week decoder
  used by hydration (`persist.ts`), scheduler load, Leave War (`sync.ts`), AND the
  cross-week readers `weekctx.ts`(`bundle`/`stashDays`) + `peek.ts`. Outcomes:
  **absent / valid / insufficient-evidence / migration-failed** (N-01 adds
  *insufficient-evidence*: a `valid` week can still lack issued content or membership
  for a date). Both `migration-failed` AND `insufficient-evidence` **preserve the
  blob/credits and suppress destructive OIL reconciliation and any live fallback**
  for affected dates. Per-week atomic replacement, schema stamping, cache
  invalidation (Leave War caches by source-string value), retry, reject unknown-future
  formats. Test mixed old/new weeks, interruption mid-migration, and cross-week
  validation vs a migrated neighbour.

**AM-04 — what a published version captures (R-07, F-10).** Freezing raw input rows
is not enough (`withDaySnap` swaps only day/marks; rendering reads live
`PEOPLE`/`INPUTS`; "all available" re-expands). The frozen canonical content (§5.0)
captures: schedule fields, relevant input **values**, **displayed person
identities**, and **resolved memberships** for any dynamically-expanded assignment.
Current-world warnings appear only as a clearly-labelled **overlay**, not part of the
frozen document. **Recovery** copies intended schedule content into a NEW draft,
retains historical inputs as **provenance only**, and validates against CURRENT
inputs **without overwriting** them. Needs no rule versioning.

**AM-06 — signatures bound to content + final validation (R-08, F-09).** Bind all
four to the same **canonical digest (§5.0) + schedule date + current-issued base id +
candidate revision**. Invalidate on: edits, plan switches, recovery loads, and
relevant automatic input updates (a currency/availability change can invalidate a
plan with no schedule cell touched). For undo/redo: after `histApply`,
**re-verify (digest + base id) and KEEP if it still matches** — do not blindly
invalidate a still-correct signature (F-09). At every publish entry point recompute
the digest, verify the base id, rerun validation; **hard issues BLOCK, advisories
require a recorded acknowledgement** (default; the exact hard/soft split is pinned in
§12). Capture Original's signatures before they are cleared.

## 5a. AM-09 — durable publication & stale-writer boundary (R-09, N-02, F-07/F-08)
- **Publication = one durable week transaction** (new issue + current pointer +
  signatures + backup provenance). **Do not announce durable issuance on a
  queued/failed write**; crew rendering and Leave War **stay on the last committed
  issue** until the specific publication revision is durably written (N-02); prevent
  duplicate issue-number allocation.
- **Stale-writer mechanism (F-07):** a **single-writer lease via
  `navigator.locks.request('raptor:writer')`** (cross-tab, same-origin, no server)
  with a heartbeat-record fallback; a per-record **revision stamp read from the
  backend** (not the boot-once whiteboard) before every put; a `storage`-event
  listener that marks a tab **read-only** when another holds the lease. (Reload-during-
  publish is largely covered today — `boot.ts` flushes on pagehide and
  `localStorage.setItem` is synchronous; the real open case is quota.)
- **Size budget (F-08):** localStorage's failure mode is "every write fails forever"
  (`postman` retries a quota throw without rollback). Reference base content **by
  digest, never by copy**; store each frozen projection **once per issued version,
  deduped by digest**; keep the pre-migration book once, dropped on an explicit
  "migration verified" step. Add a **measured size gate** to the quota test.
- Full multi-device is the `[DB-STEP]` milestone; the in-scope minimum is the three
  bullets above — the book must not claim immutability it cannot persist.

## 6. Cross-feature / ecosystem
- **OIL (R-12, F-10):** a minimal past-date protection is an **acceptance condition of
  THIS build** — neither forward replacement nor reverse removal may alter protected
  worked-date credits. **Cutoff = the squadron's local date in Singapore time
  (SGT, UTC+8): protect any date before "today" in SGT, or any day already flown.**
  For future days, `desiredOilCells` must consume the **issued version's resolved
  membership** (AM-04), not re-expand `availableFor` (which stays only for the
  live-draft preview). The broader earned-OIL redesign stays separate
  (`/OUTSTANDING.md` `[OIL]`).
- **Marks** are published-day only (`alAttr`); live draft shows draft highlighting;
  backups render as preview.
- **Mutation** via the slot funnel AND the supported wholesale day-replacement + one
  mutation epilogue; deletes mint `del:` tombstones; addressing by `rid` (with the
  §5.0 note/synthetic exceptions).

## 7. BUG 2 + retraction handler
Preview controls are withheld via `EditWeek.tsx`, `html.ts`, `board.ts`; the
publish-toggle/beak handler (`interactions.ts`) still lacks a preview guard AND is
the F-01 retraction path — so it is **replaced** (per §2), which also closes BUG 2.
Keep defensive preview guards regardless. (`[BUG2]` in `/OUTSTANDING.md`.)

## 8. Settled UI (approved mockup)
Live-draft badge `◆ Live draft · not yet issued · next: AL#` (scheduler) /
`◆ Live draft · not yet issued` (crew); issued `✓ AL# issued · locked`. Minimal crew
chip `Backup: Plan X ›`. Compact scheduler plan rows + "Use as live draft", hidden in
the one-plan case. Sign-off = `.signoff`, unchanged. Fonts Inter Tight / JetBrains
Mono / Barlow Condensed. Mockup:
https://claude.ai/code/artifact/90a30794-acb2-45f9-80ce-57f79b3edc27

## 8b. Crew version-context contract (R-10, N-03, F-11)
Every surface AND print/cropped layout carries an unambiguous context — **live draft /
backup / current issued / historical issued** — with date + version/plan identity (a
header-only badge can be cropped away). **Crew field projection (N-03):** crew see the
programme's **schedule content and the warnings they already see** — NEVER
scheduler-only input internals (leave reasons, medical, currency), the same projection
for a viewed backup. Viewer preview selection **owns its own map, isolated from the
scheduler's `DPREV`** (F-11) and never activates a plan. **Missing issued content shows
an ERROR, never a live-data substitute** under an authoritative label. When
`digest(draft) == digest(issued)`, the draft panel collapses to **"no changes pending"**
rather than announcing a non-existent amendment (F-11).

## 9. Undo contract (R-11, F-09)
Keep whole-state JSON snapshots but define what `histApply` may **apply**: restore live
content + its plan identity coherently; **do NOT apply** the issued amendment book,
another date's data, global current-world inputs/availability, or backup provenance.
A **plan switch is a hard undo boundary** (the switch itself is separately reversible).
Backup-management undo is specified separately. After a candidate restore, **re-verify**
signature/review bindings (keep if they match — F-09), don't blindly invalidate. Every
new persisted field (ancestry, digests, base ids) rides `schedFields()` and restores in
`histApply`; **unify `histSnap` and `weekStashSnap`** so the two builders (already
drifting on `un`) can't diverge.

## 10. Hard constraints
Byte-exact parity (rows carry `rid`; output identical). DOM/perf ceilings gated.
`localStorage` only (the §5a durable-write/lease work is within this; full multi-device
is `[DB-STEP]`). Undo = whole-state JSON; new fields ride `schedFields()`+`histApply`.
Saved weeks need the AM-02 migration. Mutation via the two supported funnels. Product
invariants (owner, settled): no rule versioning; no two-person approval; no "publish all
days"; sign-off look unchanged.

## 11. Acceptance
The design is complete when: the backup flow (§4) has no un-caught silent-data path;
the contracts (§5/§5a/§5.0) state build-ready rules; the migration (AM-02) cannot
corrupt/drop/mis-number/fabricate (scheduler AND all readers); the crew exposure
(§2/§8b) is bounded by a projection; durability (§5a) has a concrete mechanism; no
self-contradiction remains. **Both cross-provider reviews now converge to this after
Rev 3.** Then build — HEAVY, saved-data, test-first, on Opus, cross-provider inspection
of the final code — behind the two Tracker fixes in `/OUTSTANDING.md`; nothing merges
without the owner's "merge live".

## 12. Explicitly deferred to the build (test-pinned, NOT brief work)
These are implementation specifications produced against the live code as the FIRST
build tasks, each pinned by a test, because inventing them in the brief (without the
code open) would be guesswork:
1. **The enumerated canonical field list** — derived from `engine/schema.ts`, pinned by
   the §5.0 completeness test (`canonical ∪ excluded == schema`).
2. **The deterministic legacy→per-day migration mapping** and its conflict rules —
   pinned by fixtures for non-monotonic numbers, multi-day issues, removed rows, empty
   keys, historical `cur`, in-place re-issues, and interruption mid-migration.
3. **The exact signature-invalidation matrix and the hard-block vs
   acknowledge-able split** at each publish entry point.
4. **The undo apply/skip field whitelist** and the plan-switch boundary implementation.
5. **The crew field-projection whitelist** (which draft fields render on the view page).
6. **The `navigator.locks` lease + backend revision-stamp** wiring and its quota/size
   gate thresholds.
