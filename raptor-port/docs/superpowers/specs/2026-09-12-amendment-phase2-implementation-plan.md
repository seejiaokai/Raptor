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
(splits with `parseVerId`) and still accepts a `'d:<id>'` draft blob (unchanged
draft-preview branch). **It MUST validate that the identity belongs to the requested
day (P2-R2-05), because the flat `als` list no longer implies day-membership the way
the old `snap[di]` lookup did:**
- seq 0 → return `sc.orig[di]` ONLY if `sc.orig[di].id === ver` (an exact Original-id
  match — not "any id ending `#0`", which would let Tuesday's `iso#0` resolve for Monday);
- else find the `als` record whose `id === ver` AND `di === di` AND (defensively)
  `iso`/`seq` agree with the parsed id; a record for another day or a malformed/foreign
  id resolves to `null`, never to a wrong day's snapshot.
- The `iso` used for validation is derived from the SUPPLIED snapshot context `sc`
  (the stashed week's own date), NOT live `CURWEEK`, so a stashed-week read stays
  correct. `loadVersionToWorkingCopy` installs the returned day at `DAYS[di]`, so a
  wrong-day resolve would be a silent cross-day corruption — hence the hard checks.
- Legacy back-compat: a bare number/`'orig'` from an OLD-format book is NOT resolved
  here — an old-format book is quarantined at load (§5, P2-05), so it never reaches
  this resolver as authoritative.

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

## 3. ONE normalized delta drives eligibility, counts AND the stored diff (F-02)

> **Revised twice.** Round-1 (P2-02/03/07/09): a bare day digest is blind to an
> input filing (`INPUTS.acc`, no `DAYS` change) and to a content-identical reorder.
> Round-2 (P2-R2-01/02/03): eligibility and the stored diff must NOT be two different
> computations, the reorder axis must come from ACTUAL surviving order (not
> accumulated `mov:` marks, which survive a move-and-move-back), the rid translator
> must cover the new canonical addresses, and the `ar:`/`at:` composites hide
> positional aircraft data inside a formation-level value.

**ONE function `dayDelta(di, {sched})` — the single source of truth.** Eligibility,
the panel counts, and the record's stored `diff` ALL derive from it; nothing reads
the accumulated pending `mov:`/`inp:` marks as the authority (those stay a DISPLAY
concern only). `dayDelta` compares the live draft against the current issued snapshot
(`daySnapOf(di, dayCurVerIn(sched, di))`) on **three independent axes plus inputs**,
every row joined by stable `rid` resolved INDEPENDENTLY in each snapshot:

1. **Values** — `canonicalContent` field values, rid-joined. Excludes `gman` (a
   workspace field, §1). `ar:`/`at:` are **decomposed** (P2-R2-03): the formation-level
   override and each aircraft's area/time become SEPARATE addresses joined by the
   aircraft's own rid, so swapping/deleting an aircraft can't fake a formation-field
   change. Includes `ground[].src` linkage (P2-09, was §3a): a per-ground-row `gx:`
   address carrying `S(r.src)`.
2. **Structure** — rid set-difference (add / remove), ancestor-collapsing (a whole
   wave gone = ONE entry), exactly the `enumRows` pattern in `drafts.ts:294-337`.
3. **Order** — per section, compare the order of the SURVIVING rids (draft vs issued)
   — the `movIf` pattern (`drafts.ts:352-376`). This is computed from actual order, so
   a move-and-move-back nets to no change (P2-R2-01). Ground uses its EFFECTIVE display
   order `groundOrder(rows, gman)` (a `gman`-driven reorder IS a real order change even
   though the raw `gman` value is excluded from axis 1); notes (no rid) use positional
   order, and swapping two identical notes is a no-op (no positional value difference).
4. **Inputs** — the day's input-filing state (which `inp:` filings apply), compared
   draft vs issued, not read off accumulated marks.

**Rid translator gap (P2-R2-02).** `rowids.ts:keyLevels`/`ridKey`/`posKey` don't
recognise the canonical-only address families (`wx/fx/bx/bxr` and the new `gx`), so
they pass through positionally — which would reintroduce the edit-plus-move error for
exactly these addresses. Teach the translator each family's ancestry (`wx`→wave,
`fx`→formation, `bx`→dutyblock, `bxr`→duty row, `gx`→ground row) so canonical
addresses translate by rid, and use it in `dayDelta`, `rebaseDayPending` AND
`reconcileIssuedMarks`.

**Trigger + affordances.** `dayHasChanges(di)` = `dayApproved(di)` AND `dayDelta` is
non-empty. This gates `publishALDay(di)` AND **every** publication affordance — the
per-day publish button (`html.ts:973`, today `dayPendCount`), panel enable/disable,
pending summary. So a canonical-only change (e.g. a cancelled formation's reason,
in `fx` not `dayKeys`) shows publishable even if its live pending mark was reconciled
away. The stored `diff` = the four `dayDelta` axes serialized (`{addr, kind:'add'|
'delete'|'change'|'move'|'input', from?, to?}`); counts derive from it by `kind`.

**Reconcile/rebase (P2-07).** Extend `reconcileIssuedMarks`/`rebaseDayPending` to the
canonical-only addresses (via the same translator) so they cannot erase a mark whose
only difference lives in `wx/fx/bx/bxr/gx`. Marks remain display; `dayDelta` is the
authority. `SCHED.changes[key]` still carries the seq for colour; `alColor` keys on
seq (§1). Full marks-off-delta rewiring stays out of scope — this is the minimal
consistency the trigger requires.

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
- **Legacy-format isolation — a SHARED classifier across every reader AND writer
  (P2-05, sharpened by P2-R2-04), not a single load guard.** The amendment book IS
  persisted (`persistAll` persist.ts:99-105 writes each week's `weekSnap()`;
  `store.ts:384-387` restores it, guarded only by `ridV`), and — critically — it is
  reached by MORE than the scheduler load: `sync.ts:745-754` independently decodes
  UNVISITED stashes and rebuilds `sc` without ever passing `applyWeekModel`, so an
  old-shape week can reach OIL directly; and `runOilPass:897-904` DELETES existing
  credits absent from the desired map (so "return null / skip" is NOT safe — missing
  desired work reads as "clear these dates"). Writers also hazard it:
  `store.ts:451` replaces a stash on departure, `persist.ts:105` re-serializes the
  loaded week even when unchanged. So Phase 2 adds:
  - an **amendment-book format stamp** `SCHED.amV` (the `ridV` precedent) and a ONE
    shared classifier `amFormatOf(sc)` → `current | unsupported`, plus a
    `protectedWeek/protectedDate` predicate;
  - **consulted by ALL of:** hydration (`persist.ts`), scheduler load
    (`applyWeekModel`), the stashed-week OIL decode (`sync.ts:745`), BOTH OIL
    reconciliation directions (`runOilPass` desired-map build AND its credit-delete
    at 897), stash-on-leave (`store.ts:451`), and `persistAll` (persist.ts:105);
  - **behaviour for an unsupported book:** preserve its raw blob byte-for-byte through
    navigation and unrelated saves (never re-serialize it as new-shape), suppress
    publication and the authoritative issued-fallback for its dates, and treat its OIL
    dates as PROTECTED — missing desired work must NOT delete their credits (the AM-02
    `insufficient-evidence` posture). Full migration stays Phase 5.
  - **Pins:** an unsupported week that is never opened keeps its OIL credits; navigating
    away from / an unrelated save while such a week is loaded does not rewrite it; a
    supported new-shape week round-trips normally.
- **Parity stays 728/0.** The book is internal state; `alAttr` short-circuits on a
  pristine model (`bookEmpty()`), so no marks emit and the printed bytes are
  unchanged. Phase 2 touches no renderer / no `dayKeys` output. Run `node reference/tfin.js`.

---

## 6. Ecosystem ripple (the standing "whole-app" walk)

- **Leave War OIL** reads publish state out of a stashed week snapshot via
  `daySnapIn(wk.sc, di, dayCurVerIn(wk.sc, di))` (`sync.ts:829`) AND independently
  decodes unvisited stashes (`sync.ts:745`). Updating the parameterized `(sc,…)`
  resolvers is necessary but NOT sufficient (P2-R2-04): the OIL wire must ALSO consult
  the shared `amFormatOf`/`protectedWeek` classifier (§5) so an old-shape stash it
  decodes directly is protected, not misread — and its credit-delete pass must treat
  protected dates as "leave alone", never "clear". **Test:** the `oilsync` suite stays
  green with the new shape AND an unsupported stash keeps its credits.
- **Recovery control ("Load onto working copy", P2-R2-06).** Its no-change shortcut
  and its "N edits will be replaced" confirmation currently read `dayPendCount`
  (`interactions.ts:834,842`). With the digest trigger, a day can have real changes and
  ZERO pending marks — so these must read the live `dayDelta`, not `dayPendCount`, or
  loading an older version silently bypasses the confirm and discards real draft work.
  Capture that live delta BEFORE the preview snapshot is swapped in — `withDaySnap`
  (`html.ts:68`) temporarily clears `SCHED.pending`, so a count taken inside it reads
  zero. Keep the existing disarm + single mutation epilogue.
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
  cannot be retracted); `dayHasChanges` fires on `dayDelta` — including an input-only
  or content-identical-reorder-only change (NOT "equal day digest → no publish", which
  Round-2 P2-R2-01/-07 corrected); **record shape survives a plain JSON serialization
  round-trip** (NOT a `publish → undo → redo` test — undo-across-publish is Phase 3, §5).
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
  **`leavewar/oilsync.test.ts` (~3)**, **`ui/interact.test.tsx` (~2)** (BUG-2: the
  beak is inert on a published day — cannot un-publish the live day; §9), **`engine/daytpl.test.ts` (~2)**,
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
- **New/extended pins (Round-2 findings):**
  - **Move-and-move-back nets to no change** (order axis from actual surviving order,
    not accumulated `mov:` marks); **identical-note swap** is a no-op; a **`gman`-only
    ground reorder** IS a change (P2-R2-01) — `publish.test.ts`.
  - **Canonical-only edit combined with a parent move/delete** diffs correctly (the rid
    translator covers `wx/fx/bx/bxr/gx`) (P2-R2-02).
  - **Aircraft move / delete with distinct area/time** produces no spurious
    formation-field change (`ar:`/`at:` decomposed) (P2-R2-03) — `canonical.test.ts`.
  - **Cross-day / cross-week / malformed version id** resolves to `null`, never a wrong
    day's snapshot (P2-R2-05) — `restore.test.ts` / `publish.test.ts`.
  - **Unsupported stash reaching OIL keeps its credits**; navigation/unrelated save
    doesn't rewrite it (P2-R2-04) — `oilsync.test.ts` / `amformat.test.ts`.
  - **Recovery over a canonical-only divergence with zero pending keys** still confirms
    + reports the real replacement, doesn't silently discard (P2-R2-06) — `interact.test.tsx`.

---

## 8. Build order (test-first, one coherent unit)

0. Canonical foundation: add `ground[].src` (`gx:`) to `canonicalContent`, decompose
   `ar:`/`at:` into per-aircraft rid-joined addresses, and add `wx/fx/bx/bxr/gx` to the
   `rowids.ts` translator (§3, P2-09/P2-R2-02/03) — pin the completeness + src-only cases.
1. The ONE delta: `dayDelta(di,{sched})` (values/structure/order/inputs, rid-joined,
   §3) + `dayHasChanges(di)` — pin input-only, reorder-only, move-and-move-back,
   identical-note, `gman`-only, delete-before-survivor, edit-plus-move, canonical-only.
2. Identity re-key: `daySnapIn`/`dayCurVerIn`/`daySnapOf`/`dayVersions`/`verLabel`
   over verId; `orig` gains `id`; `cur` stores verId. **Resolver validates
   identity-belongs-to-day** (§1, P2-R2-05). Pin the resolver + OIL-wire parity.
3. Shared legacy-format classifier: `SCHED.amV` + `amFormatOf`/`protectedWeek`,
   consulted by hydration, scheduler load, the stashed-week OIL decode, both OIL
   directions, stash-on-leave and `persistAll` (§5, P2-05/P2-R2-04) — pin the
   never-opened credit-keep + no-rewrite-on-navigation cases.
4. Issue rewrite: `nextSeq`, `alIssue`/`publishALDay` store the new record + `diff`
   (from `dayDelta`) + stamp `cur=id`; gate on `dayHasChanges`; extend reconcile/rebase
   to the canonical addresses via the translator.
5. Take-back removal: delete `unpublishAL`/`restoreDayVersion`/`reissueReopened`/
   `publishAL(n)`; strip `setDayApproved`'s `off` branch; simplify `alIssue` ownership
   (§2); beak inert on a published day (no reload — §9); ALPanel per-day publish (no
   publish-all); recovery control's dirty-check reads `dayDelta` not `dayPendCount`
   (§6, P2-R2-06); sweep the old-identity UI consumers (§4, P2-04); prune probe-bridge
   + store re-exports; update `schema.ts` types.
6. Sweep the test list (§7) to green, file by file. Record the shape via serialization
   round-trip (NOT undo-across-publish, §5).
7. Full gate set ONCE at green: `npm test`, `npm run build`, `node reference/tfin.js`
   (728/0), `npm run test:e2e`, `npm run smoke:tracker`. Then a plain report + a
   fresh Codex inspection of the finished diff before any "merge live".

---

## 9. The reopen "beak" — RESOLVED (owner Q + Round-1 P2-06)

The owner's instinct was right: **a published version is frozen forever — it can
never be edited. Changing a published day always means issuing a NEW AL that
supersedes it; the old version stays immutable in the history.** Precisely (correcting
loose "the published day is editable" wording): each day has its frozen issued
versions PLUS one **live working draft** on top. The scheduler edits the WORKING
DRAFT — never a published version — and publishing the draft mints the next AL. Crew
keep seeing the current issued version until that next AL goes out. So the beak does
NOT need to "reload the issued version" (Round-1 P2-06 showed that would destructively
overwrite the working draft). Resolution:
- The beak simply **loses its un-publish job**. On a never-published day it still
  first-approves; on a published day it is inert/hidden — there is nothing to
  un-publish and no reload.
- Editing the working draft + Publish AL# = the next AL (the whole "amend" flow, no new
  concept; the frozen versions are never touched).
- Pulling an OLD version's content forward stays the existing guarded **"Load onto
  working copy"** control (`loadVersionToWorkingCopy`, confirm-armed), untouched.

This leaves a scheduler a clear, non-destructive way to amend a published day and
matches the settled model exactly.
