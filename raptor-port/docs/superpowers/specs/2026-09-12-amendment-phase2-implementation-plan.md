# Amendment engine — Phase 2 implementation plan (the coupled record rewrite)

**Status:** plan (no code yet). Branch `claude/amendment-engine-core`.
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

## 3. The canonical diff + the digest-based publish trigger (F-02)

**Trigger.** A day's issue is offered/allowed when
`digest(liveDraft, di) !== digest(currentIssuedSnap.d, di)` — the Phase-1a `digest`,
NOT `pendCount()` / `publishableKeys()`. New predicate `dayHasChanges(di)`:
`dayApproved(di) && digest(DAYS[di],di) !== digest(daySnapOf(di, dayCurVerIn(SCHED,di)).d, di)`.
This is what `publishALDay(di)` gates on and what the panel's enable/disable reads.

**Stored diff.** On issue, compute `diff = canonicalDiff(prevIssued.d, newDraft.d, di)`
from `canonicalContent` (Phase 1a) — a set-difference of the two address→value maps:

- address in new, not in old → `{addr, kind:'add'}`
- address in old, not in new → `{addr, kind:'delete'}`
- in both, value differs → `{addr, kind:'change', from, to}`

PLUS the input-filing marks that address INPUTS (not day content, so not in
`canonicalContent`): the `inp:` keys pending for this day at issue time are folded
in as `{addr, kind:'input'}`. (Freezing input VALUES into content is AM-04 — later;
Phase 2 only preserves that an input-filing amendment stays visible.)

The panel's counts (items / removals / reorders / input filings) derive from `diff`
by `kind`, replacing the old `deleteCount/moveCount/inputActionCount(rec.keys)`.
`mov:` reorders: a reorder changes no `canonicalContent` value, so — as today — it is
carried as an explicit synthetic mark; the pending `mov:` keys for the day fold into
`diff` as `{addr, kind:'move'}` at issue, same treatment as `inp:`.

**Marks unchanged.** The live pending/changes marks and `alAttr` on-screen tinting
are NOT rewired in Phase 2 — they keep driving what is highlighted while editing.
The record's `diff` becomes the authoritative account of what the version changed
(the thing Phase 3 signs and Phase 4's backup three-way compare reads). `SCHED.changes[key]`
continues to carry the seq for colour; `alColor` now keys on seq (§1).

---

## 4. Per-path replacement map

| Current path | Phase 2 disposition |
|---|---|
| `publish.ts unpublishAL(n)` | **DELETE.** Its `surviving`/`structAdds`-restore body goes too (§2). Removes BUG-1 (unpublish an older AL). |
| `ALPanel.tsx` per-AL `✕` unpublish control + its click handler | **DELETE.** The AL list becomes read-only history. |
| `restore.ts restoreDayVersion(di,ver)` | **DELETE.** Only survivor for "old content" is `loadVersionToWorkingCopy` (loads onto working copy → republish as next AL). The `dayKeys` walker stays (it is `rebaseDayPending`'s executable slot-grammar doc + probe/tests). |
| `publish.ts reissueReopened(di)` + `setDayApproved`'s `else reissueReopened` branch | **DELETE.** After Original there is no re-issue-in-place. |
| `setDayApproved(di,false)` (the reopen "beak" un-publish) | **REPLACE.** A published day cannot be un-approved. `setDayApproved` keeps only the first-approve (`on=true`) path. The `off` branch is removed. |
| `interactions.ts` beak handler (`data-beak` → `setDayApproved(di,!approved)`) | **REPLACE** with the Amend affordance: on a published day the control loads the current issued version onto the working copy for editing (`loadVersionToWorkingCopy(di, dayCurVerIn)`), which republishes as the next AL. First-approve of a never-published day still calls `setDayApproved(di,true)`. This also closes BUG-2 (the handler can no longer act on the live day as an un-publish). Keep the existing preview guards. |
| `publish.ts publishAL(n)` (caller-numbered, week-wide, multi-day) | **DELETE.** Only the per-day `publishALDay(di)` issue remains, numbered by the day's own next sequence. |
| `ALPanel.tsx` week-wide AL-number `<select>` + `publishAL(value)` Publish button | **REPLACE** with per-day publish: the panel publishes the pending day(s) each as its own next-sequence AL (drive `publishALDay` per published-with-changes day). Drop the number dropdown. |
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
  so the stash and the undo snapshot cannot drift. **No change to the schedFields key
  set is needed** — the shapes inside the existing keys change, and both the undo
  round-trip and the stash round-trip carry them for free. Add a test that a publish →
  undo → redo round-trips the new record shape (incl `diff` and verId `cur`).
- **Parity stays 728/0.** The book is internal state; `alAttr` short-circuits on a
  pristine model (`bookEmpty()`), so no marks emit and the printed bytes are
  unchanged. Phase 2 touches no renderer / no `dayKeys` output. Run `node reference/tfin.js`.
- **In-session only.** All snapshots created this session are new-shape. A saved
  week written under the OLD shape would need Phase 5's migration to read; within
  this build only new-shape data exists (most of this state is session-only until the
  DB step). State this limitation; do not backfill.

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
- **New/extended:** BUG-1 & BUG-2 impossibility pins live in `publish.test.ts` /
  `interact.test.tsx` per the plan's Phase-2 proof line.

---

## 8. Build order (test-first, one coherent unit)

1. Diff primitive: `canonicalDiff(a,b,di)` in `canonical.ts` + `dayHasChanges` — pin first.
2. Identity re-key: `daySnapIn`/`dayCurVerIn`/`daySnapOf`/`dayVersions`/`verLabel`
   over verId; `orig` gains `id`; `cur` stores verId. Pin the resolver + OIL-wire parity.
3. Issue rewrite: `nextSeq`, `alIssue`/`publishALDay` store the new record + `diff` +
   stamp `cur=id`; gate on the digest trigger.
4. Take-back removal: delete `unpublishAL`/`restoreDayVersion`/`reissueReopened`/
   `publishAL(n)`; strip the `else` branch of `setDayApproved`; simplify `alIssue`
   ownership (§2); replace the beak handler with Amend; update ALPanel; prune
   probe-bridge + store re-exports.
5. Sweep the test list (§7) to green, file by file.
6. Full gate set ONCE at green: `npm test`, `npm run build`, `node reference/tfin.js`
   (728/0), `npm run test:e2e`, `npm run smoke:tracker`. Then a plain report + a
   fresh Codex inspection of the finished diff before any "merge live".

---

## 9. Open question for the owner (raised, not absorbed)

The **reopen "beak"** on a published day is being repurposed from "un-publish this
day back to draft" into **Amend** (load the issued version onto the working copy to
edit → publish as the next AL) — because the model removed un-publishing. That is a
behaviour change a scheduler will feel: today the beak makes a published day editable
by un-approving it; after Phase 2 it makes it editable by starting an amendment, and
the published version stays live for viewers until the new AL goes out. The mockup UI
(Phase 7) will give this its own affordance; Phase 2 wires the *behaviour* onto the
existing control. Flagging in case you'd rather the published-day beak simply do
nothing (hidden) until the Phase-7 UI, rather than become Amend now. Default if you
say nothing: wire it to Amend, since "a published day can only change via Amend" is
the settled model and leaving no path to edit a published day would be a worse gap.
