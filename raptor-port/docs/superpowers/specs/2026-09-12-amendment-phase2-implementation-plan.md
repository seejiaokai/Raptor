# Amendment engine — Phase 2 implementation plan (the coupled record rewrite)

**Status:** plan (no code yet), hardened after **Round-1 Codex/Astra review**
(all 9 findings accepted — dispositions in `2026-09-12-amendment-phase2-review-log.md`).
Branch `claude/amendment-engine-core`.
**Governs:** Phase 2(b/c) of `2026-09-12-amendment-core-build-plan.md` — the
digest-based publish trigger (F-02), the per-day version stack keyed by the
immutable `verId`, the AL record storing the canonical **diff** not `keys`, and
the removal of every take-back (closes BUG-1 + BUG-2).
**Frozen spec:** `2026-09-12-amendment-core-build-brief.md` (Rev 5) §2, §3, §5.0,
§7, F-01, F-02.
**Depends on (done & committed):** `engine/canonical.ts` (Phase 1a — `canonicalContent`,
`digest`), `engine/verid.ts` (Phase 1c — `dayIso`, `verId`, `parseVerId`, `verSeqLabel`),
`discardPending` restricted to never-published days (Phase 2a, F-01).
**Out of Phase 2 (later phases, do NOT pull in):** freezing input VALUES / person
identities / resolved memberships into canonical content (AM-04); signatures bound
to the digest (Phase 3); saved-week migration to the new shape (AM-02, Phase 5);
durable write / single-writer lease (Phase 5a/6); the crew live-draft projection
and the mockup UI (Phase 7). EOD is a separate item `[EOD]`, untouched here.

---

## 0. Why this is ONE unit (the sequencing finding)

The take-backs are not independent buttons. `unpublishAL` and `restoreDayVersion`
are woven into the structural-add OWNERSHIP machinery (`SCHED.added` / `structAdds`
/ the `surviving` set) and into the version-pointer machinery (`SCHED.cur`,
`dayCurVer`). Removing them in isolation would force a rewrite of that machinery
that the record-shape restructure below would then rewrite again. So the record
shape, the identity re-key, the diff storage, the digest trigger, and the
take-back removal land together, test-first, as one coherent change.

---

## 1. The new amendment-record shape

Today `SCHED.als` is a flat list of **week-wide-numbered, possibly multi-day**
records: `{n, keys, sign, days, n0, adds, structAdds, snap:{di:{d,c}}}`, and
`SCHED.cur[di]` is `'orig' | n`. `n` comes from `nextAL()` = lowest week-wide
unused number — which is exactly why Tuesday's first amendment is labelled "AL2"
(week-wide) and why `unpublishAL(n)` can reach across days (BUG-1).

**New shape — every issued version is SINGLE-DAY and identified by its immutable
`verId`:**

- `SCHED.orig[di]` gains an `id`: `{ id: verId(iso,0), d, c }` (Original = seq 0).
- `SCHED.als` entry becomes:

  ```
  { id,      // verId(iso, seq) — the immutable KEY (AM-01); e.g. "2026-07-13#1"
    di,      // day index (0..6) — one record = one day
    iso,     // the day's full ISO date (verid.ts:dayIso), incl the year
    seq,     // per-day sequence: 1 = AL1, 2 = AL2 … (DISPLAY number, per day)
    snap,    // { d, c }  the frozen day + its issued marks slice (unchanged shape)
    diff,    // the canonical diff vs the PRIOR issued version (see §3) — REPLACES keys
    sign }   // { di: {cur,sked,plan,appr} } the four callsigns (Phase 3 binds them)
  ```

  Dropped from the record: `n` (→ `seq`, per day), `keys` (→ `diff`), `days`
  (always `[di]` now), `n0`, `adds`, `structAdds` (see §2 — the ownership tangle
  that only existed to serve `unpublishAL` is gone).

- `SCHED.cur[di]` stores a **`verId`** (Original = `verId(iso,0)`, i.e. `iso#0`),
  never `'orig' | n` again. This is AM-01's "convert cur off the numeric key".

**Identity resolution — the ONE place records are found by identity:**
`daySnapIn(sc, di, ver)` becomes the single resolver. It accepts a `verId`
(splits with `parseVerId`; seq 0 → `sc.orig[di]`; else finds the `als` record
whose `id === ver`), still accepts a `'d:<id>'` draft blob (unchanged draft-preview
branch), and — for legacy in-session robustness only — still resolves a bare
number/`'orig'` by mapping it to this day's record of that seq (a thin
back-compat shim; genuine legacy saved data is Phase 5's migration, not this).

`dayCurVerIn(sc, di)` returns a **`verId`** now: the stamped `cur[di]` if its snap
still resolves, else the newest surviving `als` record for `di` by `seq` (array
scan, highest seq with a snap), else `verId(iso,0)` if an Original exists, else
`null`. This is the same self-healing orphan-guard it is today, expressed over
verIds. **Both readers stay parameterized `(sc, …)`** — that is the one body the
Leave War OIL wire calls on a STASHED snapshot (`sync.ts:829`,
`daySnapIn(wk.sc, di, dayCurVerIn(wk.sc, di))`), so updating these two functions
updates the live path and the stash path together (one-body-two-callers).

**Display adapters (so labels/colours stay right):** `verSeqLabel(seq)` (Phase 1c)
gives "Original"/"AL1"…; a version's colour keys off `seq` via `alColor(seq)` — so
the AL1-cyan…AL7-orange ramp becomes **per-day** (Monday-AL1 and Tuesday-AL1 are
both cyan), which is more correct under per-day numbering and leaves the pristine
byte output untouched (marks never emit on a pristine model — parity safe).

---

## 2. Structural-add ownership once there is no take-back

`SCHED.added` (draft-added structural keys) and `deletionWasIssued` exist to answer
one live question: **"is this row-deletion a real removal of issued structure, or
an add-then-delete-before-issue no-op?"** That question is about the LIVE draft vs
the CURRENT issued snapshot — it survives unchanged, and `deletionWasIssued` keeps
reading `dayCurVer(di) → daySnapOf` (now verId-addressed) for the published-day
branch. Its identity-key checks against `SCHED.added` stay.

What is DELETED is the half that only ever served `unpublishAL`:

- `alIssue`'s `carried` / `structAdds` union (it existed so a later unpublish could
  hand ownership back). An issue now simply **clears** the `SCHED.added` entries it
  issued (they became part of the frozen snapshot) and records nothing for a future
  unpublish.
- The `surviving`-set recomputation and `rec.structAdds` restore inside `unpublishAL`
  — gone with the function.

Net: `SCHED.added` shrinks to its live-only role (draft adds not yet issued, cleared
on issue, wiped on draft-switch / restore-load / discard exactly as today). No record
carries `adds`/`structAdds` any more.

---

## 3. The publication projection + the change-detecting publish trigger (F-02)

> **Revised after Round-1 review (P2-02, P2-03, P2-07, P2-09).** The trigger is NOT
> a bare day-content digest — a bare digest is blind to two amendments the app
> supports: an **input filing** (`slots.ts` changes `INPUTS.acc` and mints an `inp:`
> mark with NO change to `DAYS` → equal day digest) and a **content-identical
> reorder** (two blank waves swapped → equal `canonicalContent`, only a `mov:` mark).
> A digest-only gate would refuse to publish either. And a naive positional
> set-difference misreads a deletion before a surviving row. Both are fixed here.

**ONE publication projection, used for BOTH eligibility AND the stored diff.**
`pubProjection(di, {sched})` returns the day's full publishable state:
- `canonicalContent(d, di)` (Phase 1a) — **extended to include `ground[].src`
  linkage** (P2-09; see §3a), the completeness the digest gate depends on; PLUS
- the day's pending synthetic marks that live outside day content — `inp:` (input
  filings, addressing INPUTS) and `mov:` (reorders that leave content equal).

**Trigger.** `dayHasChanges(di)` = `dayApproved(di)` AND the projection of the live
draft differs from the projection of the current issued version
(`daySnapOf(di, dayCurVerIn(SCHED, di))`). This is what `publishALDay(di)` gates on
AND — critically (P2-07) — what **every** publication affordance reads: the per-day
publish button/visibility (`html.ts:973`, today gated on `dayPendCount`), the panel
enable/disable, and the pending summary. A day whose only change is canonical-only
(e.g. a cancelled formation's reason, which lives in `fx` but not `dayKeys`) must
still show as publishable even if the live pending mark was reconciled away.

**Stored diff — joined by `rid`, never by raw position (P2-03).** On issue compute
`diff = canonicalDiff(prevIssued.d, newDraft.d, di)` by the SAME rid-join the code
already uses (`drafts.ts:rebaseDayPending` / `reconcileIssuedMarks`): resolve each
row's address to its `rid` and back **independently in each snapshot**, so a shared
rid is compared to the same row even after an edit-then-move, and a deletion before a
surviving row is attributed to the row that actually went — not misread as a chain of
field changes + a false tail removal. Structure is diffed as a **rid set-difference**
(add / remove), reorder as a per-section rid-order compare (the `enumRows` / `movIf`
patterns in `drafts.ts:294-376`), and only NOTES (no rid) fall back to positional
pairing. The diff entries:
- rid present in new, absent in old → `{addr, kind:'add'}`
- rid present in old, absent in new → `{addr, kind:'delete'}` (topmost rid only —
  a whole wave gone is ONE wave entry, ancestor-collapsing, as `rebaseDayPending` does)
- surviving rid, field value differs → `{addr, kind:'change', from, to}`
- surviving-set order differs per section → `{addr, kind:'move'}`
- pending `inp:` for the day → `{addr, kind:'input'}` (input-filing amendment)

The panel counts (items / removals / reorders / input filings) derive from `diff` by
`kind`, replacing `deleteCount/moveCount/inputActionCount(rec.keys)`.

**Marks and reconcile — the ONE change forced here (P2-07).** The live pending/changes
marks and `alAttr` tinting keep driving on-screen highlight, and the record's `diff`
is the authoritative account of what changed. But `reconcileIssuedMarks` /
`rebaseDayPending` currently compare only `dayKeys`, so they can ERASE a pending mark
whose difference lives in a canonical-only field (`wx/fx/bx/bxr`) — leaving the day
looking unchanged while the projection says it changed. Extend both to compare the
canonical-only addresses too, so a real difference can never be reconciled to
invisible. `SCHED.changes[key]` still carries the seq for colour; `alColor` keys on
seq (§1). Full marks-off-diff rewiring stays out of scope; this is the minimal
consistency fix the digest trigger requires.

## 3a. Phase-1a touch-up — `ground[].src` in canonical content (P2-09)

Phase 1a's `canonicalContent` (built on `dayKeys` + wave/duty extras) omits
`ground[].src` — the accepted-input linkage — although the build plan classes it as
canonical content. Add a synthetic address per ground row carrying its `src` token
(e.g. `gx:${di}.${ri}` = `S(r.src)`), so two ground rows identical on screen but
linked to different inputs have different digests and a visible diff. Add a
src-link-only mutation case to `canonical.test.ts`'s per-field-visibility set, and
verify it stays visible through a backup/recovery publish (the reason it matters:
`slots.ts` uses `src` for unaccept/removal and `store.ts:341` promotes `INPUTS.acc`
to `'g'` from it). This is distinct from AM-04's deferred freezing of input VALUES.

---

## 4. Per-path replacement map

| Current path | Phase 2 disposition |
|---|---|
| `publish.ts unpublishAL(n)` | **DELETE.** Its `surviving`/`structAdds`-restore body goes too (§2). Removes BUG-1 (unpublish an older AL). |
| `ALPanel.tsx` per-AL `✕` unpublish control + its click handler | **DELETE.** The AL list becomes read-only history. |
| `restore.ts restoreDayVersion(di,ver)` | **DELETE.** Only survivor for "old content" is `loadVersionToWorkingCopy` (loads onto working copy → republish as next AL). The `dayKeys` walker stays (it is `rebaseDayPending`'s executable slot-grammar doc + probe/tests). |
| `publish.ts reissueReopened(di)` + `setDayApproved`'s `else reissueReopened` branch | **DELETE.** After Original there is no re-issue-in-place. |
| `setDayApproved(di,false)` (the reopen "beak" un-publish) | **REMOVE the `off` branch.** A published day cannot be un-approved. `setDayApproved` keeps only first-approve (`on=true`). |
| `interactions.ts` beak handler (`data-beak` → `setDayApproved(di,!approved)`) | **REFRAMED after Round-1 (P2-06 + owner Q):** the beak simply LOSES its un-publish job — it does NOT become a destructive "reload issued onto working copy". A published day is **already editable**; the scheduler edits it in place and publishing those edits = the next AL. So on a never-published day the beak still first-approves (`setDayApproved(di,true)`); on an already-published day the beak is inert/hidden (there is nothing to un-publish, and no reload — editing + publish is the amend path). This closes BUG-2 (the handler can no longer act on the live day as an un-publish) with no risk of clobbering live edits. The **only** path that pulls OLD content forward stays the existing guarded "Load onto working copy" control (`data-restore` → `loadVersionToWorkingCopy`), which already has the confirm-arm / disarm / single-epilogue guard — untouched. |
| `publish.ts publishAL(n)` (caller-numbered, week-wide, multi-day) | **DELETE.** Only the per-day `publishALDay(di)` issue remains, numbered by the day's own next sequence. |
| `ALPanel.tsx` week-wide AL-number `<select>` + one `publishAL(value)` button | **REPLACE with PER-DAY publish (P2-08 — brief §10 forbids "publish all days").** Each pending published day gets its OWN "Publish AL#" action; one click issues exactly that one day (`publishALDay(di)`), leaving every other day's draft and signatures untouched. Drop the week-wide number dropdown; a single button that loops over all changed days is NOT allowed. |
| **Old-identity UI consumers (P2-04)** | **CONVERT off numeric `'orig'\|n`.** `Shell.tsx:154` (`+v` on an issued selection → NaN on a verId) → keep verId strings, compare as strings; `Shell.tsx:79-80` + `html.ts:1568-1569` (read `a.n`/`a.keys`) → read `seq`/`diff`; `html.ts:955-957` (renders `cv` as an AL number) → label via `verSeqLabel(verSeq(cv))`; `interactions.ts:831` (`rver==='orig'?'orig':+rver` recovery payload) → carry the verId string through the action; every `nextAL()` caller → `nextSeq(di)`. Update the declared `AlRecord`/`Sched` types in `engine/schema.ts` to the new shape. Verify each line during the build (grep `a\.n\b`, `a\.keys`, `\+.*rver`, `nextAL`). |
| `publish.ts nextAL()` / `SCHED.al` (week-wide next number) | **REPLACE** with `nextSeq(di)` = max seq among `di`'s issued versions + 1. `SCHED.al` (week-wide max) is dropped as a numbering source; keep a no-op shim only if a straggler reads it. |
| `publish.ts discardPending()` | **KEEP** (Phase 2a already restricted it to never-published days). |
| `publishALDay(di)` | **KEEP, rewire:** gate on `dayHasChanges(di)` (digest) not `pendCount`; number via `nextSeq(di)`; `alIssue` stores `id/di/iso/seq/diff` and stamps `cur[di]=id`. |
| `dayCurVer/dayCurVerIn/daySnapIn/daySnapOf/dayVersions/verLabel` | **REWIRE to verId** (§1). `dayVersions(di)` lists `['live', verId(iso,0)?, …als seqs…]` as verIds; `verLabel(verId)` → `verSeqLabel(verSeq(id))`. |
| `probe-bridge.ts` exports of `unpublishAL`, `restoreDayVersion` | **REMOVE** those two lines; keep `loadVersionToWorkingCopy`, `reconcileIssuedMarks`, `setDayApproved`, `publishALDay`. Keep the bridge in sync (repo invariant). |
| `state/store.ts` re-export line (`unpublishAL, publishAL`) | **REMOVE** `unpublishAL`, `publishAL`; keep `setDayApproved, publishALDay, discardPending, markEdit`. |

`daytpl.ts` / `drafts.ts` reference `restoreDayVersion`'s *contract* only in comments
(the "direct-write, caller owns the one undo step" idiom) — no code call; leave the
behaviour, refresh the comment pointers.

---

## 5. Persistence, undo, parity (the standing rules)

- **Every new persisted field rides `schedFields()` + `histApply`.** `id`, `iso`,
  `seq`, `diff` live *inside* `SCHED.als` records, and the verId-shaped `cur`/`orig`
  live inside `SCHED.cur`/`SCHED.orig` — all already serialized by `schedFields()`
  (`a:SCHED.als, cv:SCHED.cur, o:SCHED.orig`) and restored by `histApply`. `schedFields()`
  is the ONE serializer shared by `history.ts:histSnap` and `store.ts:weekStashSnap`,
  so the stash and the undo snapshot cannot drift. The shapes inside the existing keys
  change; both round-trips carry them for free.
- **Undo boundary — corrected after Round-1 (P2-01).** Test the record SHAPE with a
  **plain serialization round-trip** (`JSON.parse(JSON.stringify(schedFields()))`
  restores identical records incl `diff` + verId `cur`) — NOT a `publish → undo → redo`
  test. Undo crossing a publish is exactly what would retract AL1 and let
  `nextSeq(di) = max(seq)+1` reuse `iso#1` for DIFFERENT content, breaking the
  immutable-id contract. The brief (§2/§9) forbids undo crossing a publish, and the
  **"undo is scoped to the live draft, cannot cross a publish" boundary is Phase 3**
  (§9). So Phase 2 does NOT claim total immutability on its own: it removes every
  **explicit take-back PATH** (`unpublishAL`/`restoreDayVersion`/`reissueReopened`/
  `publishAL(n)`/reopen-un-publish) — which is what closes BUG-1/BUG-2 — and the
  remaining undo-across-publish reuse hazard is closed by Phase 3's undo contract.
  Word the tests and the report to that precise scope; do not pin undo-across-publish
  behaviour in Phase 2.
- **Legacy-format isolation — REQUIRED in Phase 2, not deferred (P2-05).** The
  amendment book IS persisted: `persistAll` (persist.ts:99-105) writes each week's
  `weekSnap()` (= `schedFields`, incl `als/cur/orig`) to the backend, and
  `store.ts:384-387` restores them at load guarded ONLY by `ridV`. An OLD-shape book
  (`n`/`'orig'|n`) restored after Phase 2 would be silently misread by the new verId
  resolver (legacy AL not found by id/di/seq → falls back to Original), changing
  issued rendering AND the OIL authority (`sync.ts:811/829`), then written back.
  So Phase 2 adds an **amendment-book format stamp** (following the `ridV` precedent —
  e.g. `SCHED.amV`) and a **load-time guard**: a book without the current `amV` is
  treated as unsupported — its blob is PRESERVED untouched, but publication, the
  authoritative issued-fallback, and destructive OIL reconciliation are SUPPRESSED for
  those weeks (the AM-02 `insufficient-evidence` posture) until Phase 5's real
  migration. A prose caveat does not enforce this; the guard does. Pin it:
  a saved OLD-shape week loads without corrupting or being written back as new-shape.
- **Parity stays 728/0.** The book is internal state; `alAttr` short-circuits on a
  pristine model (`bookEmpty()`), so no marks emit and the printed bytes are
  unchanged. Phase 2 touches no renderer / no `dayKeys` output. Run `node reference/tfin.js`.

---

## 6. Ecosystem ripple (the standing "whole-app" walk)

- **Leave War OIL** reads publish state out of a stashed week snapshot via
  `daySnapIn(wk.sc, di, dayCurVerIn(wk.sc, di))` (`sync.ts:829`). Because both readers
  stay parameterized `(sc,…)` and are updated in one place (§1), the OIL wire keeps
  working; the verIds it reads come from the same `schedFields` short keys the stash
  already carries. **Test:** the `oilsync` suite must stay green with the new shape.
- **History bubble / changes list** find cells by key + edit log, not by the AL
  record — unaffected. The AL list rendering (ALPanel) is the visible change (counts
  from `diff`, no unpublish ✕).
- **View page (ViewWeek / DPREV / VWORK)** reads issued content through `daySnapOf`
  by version — now verId-addressed. `DPREV`/`VWORK` preview *selections* that stored
  `'orig'|n` become verIds. This is the AM-01 "preview selections" conversion; keep it
  minimal (the value stored in the preview map is whatever `dayVersions` now yields).
- **Board & html renderers** paint marks via `alAttr` (seq-coloured) and version
  chips via `verLabel` — both adapted in §1/§4. No structural render change.
- **User-error / missing-input walk:** `dayHasChanges`/`publishALDay` must no-op
  cleanly when a day has no issued baseline (never approved) and when draft==issued
  (digest equal → "no changes pending", the F-11 collapse, surfaced honestly).

---

## 7. Test-rewrite list (~40 material refs across ~12 files)

Build test-first: extend/repoint the pinning test, watch it fail, build to green.
Never weaken a failing assertion — understand it.

- **`engine/publish.test.ts` (~20 refs) — the core rewrite.** Repoint every
  `publishAL(n)`/`unpublishAL`/`reissueReopened` assertion. New pins: per-day
  sequence (Mon-AL1 and Tue-AL1 are distinct verIds, both seq 1); record carries
  `id/di/iso/seq/diff`; **BUG-1 impossible** (no `unpublishAL` export; an older AL
  cannot be retracted); `dayHasChanges` digest trigger (equal digest → no publish);
  publish → undo → redo round-trips the shape.
- **`engine/restore.test.ts` (~15 refs).** `restoreDayVersion` is gone — delete its
  cases or repoint to `loadVersionToWorkingCopy` (working-copy load leaves `cur`
  untouched until republish). Keep the `dayKeys` slot-grammar pins.
- **`ui/pubsweep.test.tsx` (~10).** Repoint to per-day publish + the removed unpublish.
- **`engine/rowids.test.ts` (~9).** Uses `unpublishAL`/`restoreDayVersion` in rid
  round-trips — repoint to `loadVersionToWorkingCopy` / re-issue as next AL; the rid
  survival assertions must still hold across the new issue path.
- **`engine/drafts.test.ts` (~7).** `rebaseDayPending`/`loadVersionToWorkingCopy`
  against verId-addressed snapshots; draft-switch on a published day still rebases.
- **`state/store.test.ts` (~4)**, **`ui/html.test.ts` (~3)**, **`engine/audit-d-published.test.ts` (~3)**,
  **`leavewar/oilsync.test.ts` (~3)**, **`ui/interact.test.tsx` (~2)** (BUG-2: beak
  is Amend, cannot un-publish the live day), **`engine/daytpl.test.ts` (~2)**,
  **`state/loadweek.test.ts` (~1)**, **`engine/audit-d-keyspace.test.ts` (~1)**.
- **`ui/ALPanel.test.tsx`** (if present) — panel no longer renders the unpublish ✕
  or the week-wide number select; Publish is per-day.
- **New/extended pins (Round-1 findings):**
  - BUG-1 & BUG-2 impossibility (`publish.test.ts` / `interact.test.tsx`).
  - **Input-only publish** and **content-identical reorder-only publish** are
    publishable — the projection detects them though the day digest is equal (P2-02).
  - **Delete-before-a-surviving-row** and **edit-plus-reorder** produce a correct
    rid-joined diff — no misattributed change, no false removal count (P2-03).
  - **Canonical-only edit** (cancelled-formation reason) shows publishable and is NOT
    reconciled to invisible (P2-07).
  - **`ground[].src`-link-only** change is a visible canonical diff (P2-09) — in
    `canonical.test.ts`.
  - **Per-day publish only** — one Publish issues exactly one day (P2-08).
  - **Legacy-shape isolation** — a saved OLD-shape book loads without being misread or
    written back as new-shape; publication/OIL suppressed for it (P2-05) —
    `loadweek.test.ts` / a new `amformat.test.ts`.
  - **Serialization round-trip** of the new record shape (NOT undo-across-publish) —
    `publish.test.ts` (P2-01).
  - Old-identity UI consumers no longer coerce a verId to a number (P2-04) —
    `interact.test.tsx` / a Shell/render test.

---

## 8. Build order (test-first, one coherent unit)

0. Phase-1a touch-up: add `ground[].src` to `canonicalContent` + completeness test (§3a).
1. Projection + diff primitives: `pubProjection(di)`, `canonicalDiff(a,b,di)` (rid-joined,
   §3), `dayHasChanges(di)` — pin input-only / reorder-only / delete-before-survivor /
   canonical-only first.
2. Identity re-key: `daySnapIn`/`dayCurVerIn`/`daySnapOf`/`dayVersions`/`verLabel`
   over verId; `orig` gains `id`; `cur` stores verId. Pin the resolver + OIL-wire parity.
3. Legacy-format guard: add `SCHED.amV`; load-time isolation of an unsupported book
   (§5, P2-05) — pin a saved OLD-shape week loading without corruption/writeback.
4. Issue rewrite: `nextSeq`, `alIssue`/`publishALDay` store the new record + `diff` +
   stamp `cur=id`; gate on `dayHasChanges`; extend reconcile/rebase to canonical fields.
5. Take-back removal: delete `unpublishAL`/`restoreDayVersion`/`reissueReopened`/
   `publishAL(n)`; strip `setDayApproved`'s `off` branch; simplify `alIssue` ownership
   (§2); beak loses un-publish (no reload — §9); ALPanel per-day publish (no publish-all);
   sweep the old-identity UI consumers (§4, P2-04); prune probe-bridge + store re-exports;
   update `schema.ts` types.
6. Sweep the test list (§7) to green, file by file.
7. Full gate set ONCE at green: `npm test`, `npm run build`, `node reference/tfin.js`
   (728/0), `npm run test:e2e`, `npm run smoke:tracker`. Then a plain report + a
   fresh Codex inspection of the finished diff before any "merge live".

---

## 9. The reopen "beak" — RESOLVED (owner Q + Round-1 P2-06)

The owner's instinct was right: **changing a published day = another AL, always** —
there is no editing-in-place and no take-back. And a published day is **already
editable** in this app: the scheduler edits it and publishing those edits becomes the
next AL. So the beak does NOT need to "reload the issued version" (Round-1 P2-06
showed that would destructively overwrite live edits). Resolution:
- The beak simply **loses its un-publish job**. On a never-published day it still
  first-approves; on a published day it is inert/hidden — there is nothing to
  un-publish and no reload.
- Editing a published day + Publish AL# = the next AL (the whole "amend" flow, no new
  concept).
- Pulling an OLD version's content forward stays the existing guarded **"Load onto
  working copy"** control (`loadVersionToWorkingCopy`, confirm-armed), untouched.

This leaves a scheduler a clear, non-destructive way to amend a published day and
matches the settled model exactly.
