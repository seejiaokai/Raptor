# Addressing by `rid` — the amendment book resolves rows by id, not position — design

**Date:** 10 Sep 26 · **Branch:** `claude/read-handoff-docs-wuftw9` (foundation, merged as #384) · **Status:** REVISED (11 Sep 26) after four red-team rounds — now on the "**drafts keep their ids**" model (owner decision), which removes the swap-time adoption machinery entirely. To re-review before build.

This is stage-2 follow-up #1 (the "addressing rewrite"), the piece the
`2026-09-10-stable-ids-design.md` round explicitly left out: *"re-addressing
schedule rows by id (the `keys.ts` rewrite)."* Every schedule row already
carries a stable `rid` (minted by `engine/rowids.ts` before every baseline and
snapshot). This change makes the **amendment book resolve a row by that `rid`
instead of by its array position**, so deleting or reordering a row no longer
renumbers the marks on the rows around it — the identity survives across the
shared-database boundary, the same safety the Tracker's students just got.

**Nothing a screen shows changes.** The byte-parity gate (`tfin.js` 728/0), the
`html.test.ts` byte-compare, the geometry suite and the smoke suite stay the
proof. The whole change is *behind* the rendered HTML.

---

## Red-team closure (READ FIRST)

Two independent reviewers — **Astra (GPT-6 Astra, Codex)** and **Fable 5.1** —
reviewed this spec at high effort, read-only, four times. **Round 1**
(`…-REDTEAM.md`): both REVISE, 6 convergent findings + 4 Fable additions.
**Round 2:** both REVISE, **converged on one central defect** (two `rid`-spaces).
**Rounds 3–4:** every attempt to reconcile the two `rid`-spaces *at swap time*
(adopt issued rids by `pathsOf` position, then behind a collision-gate) was
defeated by a new scenario. Astra RID-R4-01 was the tell: the gate cannot
distinguish a genuine add from a deleted-and-replaced row — delete B, add X in its
slot, switch away and back, and X **inherits B's identity and AL tint**. The two
reviewers ended **split** on whether the gate was sound; hand-tracing RID-R4-01
confirmed it is **not**, because position/vacancy cannot encode identity. This is
Round 4's closure — and it changes the approach rather than patching it again.

**Two owner decisions (taken, not open):**
- **Key-shape = ancestor-RETAINING** (`di.«wRid».«fRid».«aRid».p`), matching the
  merged foundation (`rowids.ts`, `rowids.test.ts:70`). Table below is correct
  for all 11 prefix groups (both reviewers confirmed).
- **Draft identity — drafts KEEP their ids (11 Sep 26, revised from "Design Y +
  re-mint").** A saved draft is an alternate *version* of the same day, not an
  independent copy, so `draftDup` **stops stripping/re-minting** — a parked draft's
  rows keep the identities of the rows they were copied from. The live day, its
  saved drafts and its issued document then all speak **one** `rid`-space, so the
  two-`rid`-spaces problem is gone at the root: **no swap-time adoption, no lineage,
  no gate.** Genuinely new rows added inside a draft still get fresh ids
  (`ensureRowIds`), so a real add is never confused with a survivor. (`dayKeys`
  still stays positional; only the persisted book is `rid`-anchored via boundary
  translation — the "Design Y" half is unchanged.)

**Why this is right for the database and for debugging (the owner's criteria).**
Grounded in `docs/data-model.md`: a `DayDraft` is stored as an **opaque JSON blob**
(`DayDraft.blob`, line 354), not as normalized row records — so a draft reusing the
published rows' ids collides with nothing in the database. And an `Amendment` is
**append-only / immutable once issued** (lines 414-415): re-minting draft rows
would leave those frozen amendments pointing at ids no live row holds — permanent
dangling references, bad for DB integrity and miserable to debug. Keeping the ids
keeps every frozen amendment pointing at a real row, in one id-space. It also
honours the *original* intent of the merged re-mint comment (`drafts.ts:103-116` —
"the identity chain must lead to the day on screen"): not re-minting achieves that
more directly than re-minting the parked copy ever did.

**Why not "new ids + a lineage back-pointer" (the alternative).** It keeps the
re-mint but adds a `sourceId` per copied row so the machinery can follow the trail.
Robust, but the trail would live *inside the opaque draft blob* (not a queryable DB
relationship, since drafts are blobs), the append-only amendments would still hold
dangling ids resolved only via lineage at read time — forever — and it adds a
field threaded through every boundary. More surface, worse debugging. Rejected in
favour of "keep the ids", which deletes machinery instead of adding it.

**What still applies from Rounds 2–4** (all orthogonal to the draft-id choice, all
kept): structural-add attribution → `rid`
set-difference **with ancestor-collapsing** (skip a `rid` whose parent `rid` is
also in the difference, then the existing per-kind expansion), not tail index
(Astra RID-02, Fable #2); delete cleanup captures the removed **root** rids (a
typed subtree/root capture — **not** `rowsOf`, which takes a whole day and would
collect nothing from a passed row), and an implicitly-emptied parent (a formation
whose last aircraft went) is captured too — ancestor-retaining keys then sweep the
descendants (Astra RID-R3-03); reconcile/rebase **join by `rid` resolved
independently in the live day and in `snap.d`**, comparing per-row values — never a
single live position matched into the snapshot (Astra RID-R3-02); `rowKeyOf` stays
**positional** (Astra RID-03 ≡ Fable #2); `deletionWasIssued` builds positional →
`ridKey`; `structuralAddExists` receives stored → `posKey` (Fable #2); legacy
migration keeps position-pairing (see *Migration*); `HistoryModal` emits a group
**index** handle (Fable #4); the self-healing helper is prefix-gated (Fable #5); a
shared restring helper for ~214 assertions across 29 files (Fable #6); `keyLabel`
accepts either key form (Fable #7); wording/short-circuit fixes (Fable #8, #9).

**Reviewer divergence, adjudicated with code evidence (finding 6 / legacy
migration).** Astra (RID-04/RID-R3-04) held that position-pairing legacy snapshot
rows corrupts identity after a reorder (`al.keys` migrated against live vs `snap.c`
against `snap.d` resolve to different rids). Fable (#3, Round 3) adjudicated with
line-level evidence: `keys.ts:37-40/69-71` renumber pending/changes/added/`al.keys`
**live**, so a legacy book's keys *are* live positions; `migrateBookKeys:168-173`
re-keys `snap.c` against its **own** `snap.d`; `backfillSnapshotIds:185-186` pairs
by path against the live day at upgrade time — the only identity that book ever
had. For Astra's reorder case the re-installed `snap.c` mark lands positionally at
rebase (`drafts.ts:234`), **byte-for-byte what legacy did**; safe-pairing/fresh
mint would instead cause a tombstone/add storm on the first rebase. **Adopted: keep
`backfillSnapshotIds` position-pairing; add only Fable-B (`orig[di].c`).** Bounded
residual documented in *Migration* (a published day structurally edited before the
upgrade). Round-3 reviewers to confirm.

---

## The problem, precisely

A slot key addresses a row by its **position**: `wl:0.2` is "day 0, wave index
2"; `ff:0.1.0.cs` is "day 0, wave 1, formation 0, callsign"; the bare flying
seat `0.1.0.0.p` is "day 0, wave 1, formation 0, aircraft 0, FCP". The
amendment book (`SCHED.pending` / `SCHED.changes` / `SCHED.added`, every AL's
`keys` / `adds` / `structAdds` / `snap.c`), the edit log, and key-addressed
view state are all keyed by these strings.

Because the address is positional, **deleting a row shifts every row after it
onto a new address.** `keys.ts` exists solely to paper over that: `shiftKeys`
(delete), `permuteKeys` / `moveKeys` (reorder), and the per-level wrappers
`shiftWave` / `shiftFormation` / `shiftAircraft` rewrite the entire key space so
a mark stays glued to its row on **this** browser.

That renumber is correct for one browser and **wrong across a database.** When
two clients share the book, a delete on client A renumbers A's keys; client B
never saw the delete, so the two books now disagree about which row `wl:0.2`
means. The row needs an address that no splice can move: its `rid`.

## The one hard constraint — byte parity keeps the DOM positional

The rendered HTML carries positional key strings in real attributes —
`data-slot="0.1.0.0.p"`, `data-area="0.1.0"`, `data-atime`, `data-intimes`, the
`alAttr()` amendment colours, **and the History window's `data-hkey`/`data-hgrp`**
— computed from loop indices, never by stringifying a row. That is what keeps
`tfin.js` and `html.test.ts` byte-identical. `rid` is random per browser, so a
`rid` in any of those attributes would break parity outright and leak a
non-deterministic value into the compared output.

**Therefore the DOM address stays positional and the stored book address
becomes `rid`-anchored,** with a translation boundary between them. This is the
central decision and everything else follows from it.

## The design — one canonical stored form, translated at the edges

### The `rid`-anchored key form (ancestor-RETAINING)

A row-addressing key replaces each position component **on the path** with that
row's `rid`, **keeping the ancestor ids** (a `rid` is `r`+base36 and never a
literal, so the two forms are always told apart; retaining the ancestors is what
lets `dropRowMarks` recognise a deleted parent's child marks). The **day index
stays first**. Matches `ridKey`/`posKey` in `engine/rowids.ts`, pinned by
`rowids.test.ts:63-71`.

| positional (DOM / today's book) | `rid`-anchored (stored book) | levels collapsed |
|---|---|---|
| `wl:di.gi` · `it:di.gi` · `tr:di.gi` | `wl:di.«wRid»` · `it:di.«wRid»` · `tr:di.«wRid»` | wave |
| `ff:di.gi.li.cs` (…`.msn/.to/.ld/.br`) · `ar:di.gi.li` · `at:di.gi.li` | `ff:di.«wRid».«fRid».cs` · `ar:di.«wRid».«fRid»` · `at:di.«wRid».«fRid»` | wave + formation |
| `fr:di.gi.li.ai` · `st:di.gi.li.ai` · seat `di.gi.li.ai.p`/`.w` | `fr:di.«wRid».«fRid».«aRid»` · `st:di.«wRid».«fRid».«aRid»` · `di.«wRid».«fRid».«aRid».p`/`.w` | wave + formation + aircraft |
| `dl:di.wi` | `dl:di.«bRid»` | duty block |
| `dr:di.wi.ri.role` (…`.str/.end/.rmks`) · `d:di.wi.ri` · `d:di.wi.ri.xN` | `dr:di.«bRid».«rRid».role` · `d:di.«bRid».«rRid»` · `d:di.«bRid».«rRid».xN` | duty block + duty row |
| `sr:di.kind.ri.label` (…) · `s:di.kind.ri.p`/`.w` · `s:di.kind.ri.pax.k` · `s:di.kind.ri.xN` | `sr:di.kind.«rRid».label` · `s:di.kind.«rRid».p` · `s:di.kind.«rRid».pax.k` · `s:di.kind.«rRid».xN` | sim row (`kind` literal, slot 1) |
| `ap:di.ri.prog` (…`.sub/.str/.end/.rmks`) · `a:di.ri.k` | `ap:di.«rRid».prog` · `a:di.«rRid».k` | programme (allhands) row |
| `gr:di.ri.prog` (…) · `g:di.ri` · `g:di.ri.xN` | `gr:di.«rRid».prog` · `g:di.«rRid»` · `g:di.«rRid».xN` | ground row |

Within-row sub-addresses stay literal: the field selector (`.cs`, `.prog`, …),
the seat `.p`/`.w`, the overflow `.xN`, the crew index `.k`, `pax.k`, the `.+`
append, and the sim `kind` (`amt`/`oft`). A position component reads `\d+`; a
`rid` never does — so `ridKey`/`posKey` are self-checking and idempotent.

**Stays positional — the fallback spaces** (in `NONROW`, unchanged): notes
`dn:di.ni`; day-level `sn:`/`pn:`/`dtn:`/`gn:`; synthetic `del:`/`mov:`/`inp:`/`iu:`.

### The two pure functions (`engine/rowids.ts` — already merged)

```ts
export function ridKey(posKey: string, days: any[]): string       // positional → rid; unchanged on any un-anchorable row (fallback); idempotent
export function posKey(ridKey: string, days: any[]): string | null // rid → current positional; null if the row is gone
```

`restore.ts:dayKeys` remains the executable positional grammar these two are
tested against, prefix for prefix. `ridKey` is a pure function of `(key, days)` —
it mints nothing, so it never leaks a fresh `rid` into a compared string.

### The addressing model — Design Y

**`dayKeys` stays positional and unchanged.** It remains the diff walker and the
executable grammar; `restore.test.ts` / `keys.test.ts` **dayKeys-output** expected
strings stay positional. The reconcile/rebase/diff logic that consumes it is **not
rewritten**; it keeps comparing positional keys.

**Only the persisted book is `rid`-anchored**, by translating where a value
crosses the DOM↔book or diff↔book boundary. That gives the cross-database win (the
stored artifact is `rid`-anchored, immune to a splice) while leaving the delicate
diff machinery in the positional world it already trusts.

### One `rid`-space per published day — by construction (drafts keep their ids)

The persisted book, `snap.c`, and every `al.keys` for a published day are keyed in
the **issued document's** `rid`-space. The live day must share it, or the amendment
machinery mis-resolves after a wholesale content swap. Rounds 2–4 tried to *make*
them share by reconstructing identity at swap time (adopt by position, then a
collision-gate); that cannot distinguish a genuine add from a deleted-and-replaced
row (Astra RID-R4-01). The owner decision removes the problem instead of gating it:

- **`draftDup` stops stripping/re-minting** (`drafts.ts:117,129`): the parked copy
  is a plain `clone(DAYS[di])` — it keeps the source day's rids. So a parked draft
  and the live day carry the **same** identities; switching between them installs a
  blob that already speaks the issued `rid`-space. **No adopt step anywhere.**
- **`draftSelect` / `loadVersionToWorkingCopy` / `restoreDayVersion`** just install
  the blob (and, for restore, `snap.d`+`snap.c` as the matched pair it already
  installs) — no identity fix-up. The incoming rows already hold the right ids.
- **Genuinely new rows** added inside a draft still get fresh ids via
  `ensureRowIds(DAYS)` on the next `histPush` (a new row is a new identity), so a
  real add is never confused with a survivor — the exact case the gate got wrong.
- **No collision risk.** A parked draft lives in `SCHED.drafts[di][]` (a stashed
  blob), never in `DAYS`, so `ensureRowIds` (which walks `DAYS`) never sees a draft
  and the live day together — the shared ids never trigger its first-seen dedupe.
  `backfillSnapshotIds` walks drafts but only *fills missing* ids (no dedupe). Only
  one blob is live at a time.
- **Stow hardening (Fable #2): `ensureRowIds(DAYS)` before each stow** in `draftDup`
  (`:117,129`) and `draftSelect` (`:171`). UI paths already `histPush` (mint) between
  an add and a stow, but a programmatic path could stow a blob holding an id-less
  new row; then `backfillSnapshotIds:185-186` would position-pair it to the live
  row's rid at boot — RID-R4-01 re-entering through the backfill. Minting before the
  stow makes the safety structural, not incidental.

**This changes a documented invariant — flag it in the build.** CLAUDE.md
§Architecture lists a copied row's ids as stripped on "day template, duplicated
wave, **draft**". The carve-out: a **duplicated wave / day template** genuinely
*coexists* in the live model and MUST keep stripping (or `ensureRowIds` dedupes
it); a **parked draft** never coexists in `DAYS`, so it keeps its ids. Update that
CLAUDE.md line, the stale comments (`rowids.ts:14-16,38-40`; `drafts.ts:103-116,
125-128`), and the merged pins that assert re-mint on dup — the ones to re-string
are **`rowids.test.ts:307-335`** and **`drafts.test.ts:26-34,63-76`** (`:70-71`
assert the parked copy carries rids while `DAYS[0]` has none — that flips under
keep-ids; `:66` tightens to exact equality). **`drafts.test.ts:174` needs no change**
(it passes under keep-ids and is the natural decision pin). All deliberate, reviewed
changes — the dup's behaviour genuinely changes (a dup no longer re-mints).

`withDaySnap` (`html.ts:64-72`) already swaps `DAYS[di]=snap.d` **and**
`SCHED.changes=snap.c` together for preview painting, so preview stays
space-consistent (confirmed clean). Its regression test is the
AL-tint-survives-a-draft-switch case below — which now passes because the switched
draft already carries the issued ids, no fix-up.

### Where translation happens — the boundary

- **Write in (positional → `rid`):** `slots.ts:noteChange` and
  `publish.ts:markEdit` / `markStructuralAdd` store `ridKey(posKey)`. The synthetic
  minters (`markDeletion`/`markMove`/`markInputFiling` — all `NONROW`) pass through.
  - **The one translate helper is SELF-HEALING (finding 1, Fable #4/#5).** `ridKey`
    can only anchor a row that already has a `rid`; today `ensureRowIds` mints
    inside `histPush`, AFTER the mark. So the shared write-in helper does: if
    `ridKey` returns a key **unchanged** whose prefix is a **`keyLevels`-known
    row prefix** (gate on that — `posKey` returns the string, not `null`, for an
    unknown prefix `rowids.ts:124`, so an ungated check would waste a walk on
    `dn:` etc.) and that row exists positionally but carries no `rid`, call
    **`ensureRowIds(DAYS)`** (whole-week, so a cross-day duplicate id is caught —
    NOT per-day) and retry once. Then a missed creation site cannot silently store
    a positional key. Per-site minting (`board.ts` add handlers
    `:730,740,777,845,868,881×3,903,1102,1138,1149,1209,1455`; `slots.ts:376`
    `acceptInput` — each using **`ensureRowIds(DAYS)`**, not per-day, or a cross-day
    dup is re-minted at `histPush` and orphans the mark; `board.ts:760` is `dn:`,
    needs nothing) becomes an optimisation, not the safety mechanism.
- **Read out for painting (positional → `rid`):** `publish.ts:alAttr(posKey)`
  translates before reading `SCHED.changes`/`pending`. Hot path — `ridKey` is
  O(depth); keep it here. **Short-circuit with a GLOBAL empty check** (`pendCount()===0
  && !Object.keys(SCHED.changes).length`) or a per-render memo — not a per-call
  per-day scan (Fable #9).
- **Positional parsers — get the DIRECTION right (Fable #2):**
  - `publish.ts:deletionWasIssued` **builds** positional identity keys and looks
    them up in `SCHED.added` (now `rid`) → translate the built key via **`ridKey`**
    before the lookup. (`issued` is computed BEFORE the delete splice —
    `board.ts:717,745`, `slots.ts:447` — so the live rows still resolve. Confirmed.)
  - `publish.ts:structuralAddExists` **receives STORED** keys (from `alIssue:358`,
    `unpublishAL:392,398`) → **`posKey(key, DAYS)`** (null → false) then the
    existing positional check. **Not `ridKey`.**
- **Reorder / move reads of `SCHED.added` (finding 5):** `reorder.ts:60` (`done`)
  and `:84-95` (`sortedKey`) look up a positional head key in `SCHED.added` (now
  `rid`) → translate the lookup key via **`ridKey`**. Both run AFTER the permute, so
  `ridKey(keyAt(n))` resolves the row now at `n` — correct (confirmed).
- **Edit-log (session-only — never migrated):** `logEdit` stores the `rid` key.
  **`keyLabel` accepts EITHER form** — when a slot is non-numeric it `posKey`s
  first, then walks `DAYS[+a[0]].waves[+a[1]]…` for the words — so the
  label-vs-store ordering is irrelevant and the 12 UI `markEdit` call sites
  (`board.ts:999`, `interactions.ts:329,566,604,1140,1158`, `textedit.ts:107-194`)
  need no ordering discipline (Fable #7, supersedes the first revision's strict
  "label then store"). `elogFor`/`elogAllFor`/`elogGroups` translate the DOM key in
  (`ridKey`) at the read; `elogRemap` inert on `rid` keys (kept for the note space).
- **Flash / DOM-node-by-key (`rid` → positional):** hand `HOOKS.flashAdded` the
  **positional** key (before translating) — simpler than `posKey`-ing in
  `paintFreshAdds` (`highlights.ts:163-167` matches `data-bfld`). `HOOKS.remapViewKeys`
  is already a no-op (`store.ts:530`) — drop it from the map.
  - **`jumpToChange`/`findHistCell`** (`interactions.ts:73` → `histbubble.ts:105`)
    `posKey` the stored key before the positional DOM scan (Fable-A).
- **Diff walker (`restore.ts:dayKeys`) — POSITIONAL, unchanged.** But the
  reconcile/rebase **join is by `rid`, resolved independently in each structure** —
  never a single live position matched into the snapshot (a shared `rid` does NOT
  imply a shared position, so after an edit-then-move the live and snap positions
  differ and a one-sided `posKey` would compare two different rows and drop a real
  mark — Astra RID-R3-02). The consumers, precisely:
  - **`reconcileIssuedMarks`**: `:369` the pending keys are `rid`. For each, resolve
    **both sides separately**: `livePk = posKey(k, DAYS)` and `issPk = posKey(k,
    dayArr(snap.d))` (the same `rid` located in the live day and in `snap.d`, both
    in the shared id-space); let `lv = dayKeys(DAYS).get(livePk)`, `iv =
    issPk==null ? undefined : dayKeys(snap.d,di).get(issPk)`. **The full four-way
    rule** (Fable #2 — the phantom-drop the code has today must be restated in `rid`
    terms, or a raised-then-trimmed add key is kept forever and rides the next AL):
    - `livePk` null (row gone from live) → **drop** (`shiftKeys`' drop-half);
    - `lv` and `iv` both undefined → **drop** (the phantom: an overflow/append key
      raised then trimmed, gone from both — `drafts.ts:378-388` today);
    - `lv` defined, `iv` undefined → **keep** (a genuine add);
    - `lv` undefined, `iv` defined → **keep** (a genuine clear of a surviving row —
      the who[]-hole);
    - both defined → equal ⇒ **drop** + re-tint `snap.c[k]` (shared space), else
      **keep**.
  - **`rebaseDayPending` value diff JOINS BY `rid`** (Astra RID-R5-01 — overturns
    the Round-4 "keep it positional / Fable #3": a positional value diff produces a
    silent FALSE NEGATIVE that reconcile cannot fix, because reconcile only ever
    *removes* marks. Worked case: issued `[A(08:30), B(09:00)]`, draft reordered to
    `[B(08:30), A(08:30)]`; positionally `now[0]=B(08:30)` vs `was[0]=A(08:30)` are
    equal → B's real 09:00→08:30 change is never marked, and the `A`-slot mark that
    IS raised is correctly dropped by reconcile → the edit vanishes). So: wipe
    pending/changes/added by `keyDay` (`:229-233`), then for **each `rid` in
    `live ∪ snap.d`**: resolve the row in each structure and compare its fields AND
    its sub-lists (`who[]`/`more[]`/`pax[]`) element-wise — a differing field →
    `pend(ridKey(fieldKey))`; a sub-value present in `snap.d` but gone from live →
    `pend` its removal key; a `rid` in live only → structural add; in `snap.d` only →
    tombstone. This **subsumes the positional `rowKeyOf` who[]-hole trick** (the
    matched-row sub-list compare finds a shrunk `who[]` directly), so `rowKeyOf` is no
    longer needed in rebase. `:234` `snap.c` re-install is single-hop (shared space).
  - **Structural diff = `rid` SET-DIFFERENCES, ancestor-collapsing.** Take only the
    **topmost** removed/added `rid` (skip a `rid` whose parent `rid` is also in the
    difference), then the **existing per-kind expansion** so counts/seqs are unchanged:
    a whole wave gone → ONE `wave` tombstone (not per aircraft); a formation gone →
    one `line` per aircraft (`:263`); a wave added → `wl:` + `ff:` per formation, no
    `fr:` (`:266-268`). Replaces the length+tail-index form (Astra RID-02). **Notes
    (`dn:`, `NONROW`) stay on the length diff** (`:269`); `deletionKey` (`:248`) is
    `NONROW`, untranslated.
  - **`mov:` on a reorder-only draft swap (Fable #1).** Order-only change → equal
    values, empty set-differences, so nothing above records it — but `reorder.ts:50-60`
    requires an issued-row move to be an amendment. So in the structural pass, per
    section/kind, if the **surviving** rids' order in `snap.d` ≠ their order in the
    live day → `pend(moveKey(di, kind))` once per permuted section (`moveKey`, not
    `markMove`; no `histPush`). Exclude displacement caused solely by adds/deletes.
  - **`rowKeyOf` (`drafts.ts:286`)** — with the rid-native value diff above it is no
    longer called from rebase; leave the function in place (unused, or remove with its
    test) rather than half-converting it.

### `keys.ts` after the change

The `shiftKeys` / `permuteKeys` / `moveKeys` **calls stay** (`shiftWave` /
`shiftFormation` / `shiftAircraft` too): they are **automatically inert** on
`rid`-anchored keys (`+a[pos]` on a `rid` is `NaN`, so the key returns unchanged —
`keys.ts:31,64`), and still correct for the positional-fallback keys and the note
space (`dn:`). "Stop renumbering" describes their **effect** on `rid` keys, not a
removal of the calls (Fable #8). `reorder.ts` keeps minting the `mov:` tombstone on
a published reorder (an amendment record, not an address). Confirm inertness by
test rather than deleting anything.

### Delete cleanup — `dropRowMarks`, at the real delete sites (finding 2)

Every actual delete lives in **`board.ts` (~717–926)** and
**`slots.ts:unacceptInput`** — not `reorder.ts`.
1. **`dropRowMarks(rids)`** sweeps every stored key whose ancestry path contains
   one of those rids — but **only across the LIVE book (`SCHED.pending`/`changes`/
   `added`), NEVER an issued AL's `keys`/`adds`/`structAdds` or `snap.c`** (Astra
   RID-R5-03 ≡ Fable #1, convergent — and it honours the append-only/immutable
   amendment model, `data-model.md:414-416`). Reason keep-ids forces this: a deleted
   rid is **routinely resurrected** by switching to a parked draft that still holds
   the row (the 5b flow), after which `rebaseDayPending` re-tints it from `snap.c`.
   If the sweep had emptied `AL1.keys`, `unpublishAL` (`publish.ts:391`, acts only
   where `changes[k]===n`) could never return that mark to pending — a stale tint
   that outlives its AL; a swept `structAdds` likewise makes `unpublishAL:398` mint a
   false tombstone for a resurrected add. Left intact, stale AL entries are **inert**
   on a day whose row is gone: `unpublishAL` finds no live match, `structuralAddExists`
   is `posKey→null→false`, `syntheticKey` reads only `del:`/`mov:` (`NONROW`). AL
   applicability is resolved when READ against the current day, never by mutating the
   record. Ancestor-RETAINING keys mean a deleted **parent** rid alone sweeps its
   children in the live book — so only the removed **root** rid(s) need capturing.
2. **Capture the removed root rid(s) BEFORE the splice** — after it the rows are
   gone. **Do NOT use `rowsOf(removedSubtree)`** (Astra RID-R3-03): `rowsOf` takes a
   whole **day** object and walks its section arrays, so it collects nothing from a
   bare wave/formation/aircraft/row and never includes its own argument. Read
   `removedRow.rid` directly (a typed one-liner per delete site), and **capture an
   implicitly-emptied parent too** — deleting the last aircraft also removes its
   formation (`board.ts:721-723`), so capture that formation's `rid` as well. Then
   splice, then `dropRowMarks(rids)`, keeping the `del:` tombstone.

`shiftKeys`'s old drop-half is replaced by this active sweep; its renumber-half is
the automatic no-op above. (`store.ts:84 writeDelete` has no callers — confirmed.)

### Migration — the persisted book (findings 6 + Fable-B; Astra/Fable divergence resolved)

`SCHED` persists per browser. A book written before this change holds positional
keys. `migrateBookKeys` (already merged) converts it once per boot/week-load,
**after `backfillSnapshotIds`** and **before `weekBaseline`** (so the re-keying is
not read as a dirtying edit). It rewrites `pending`/`changes`/`added`, every
`al.keys`/`adds`/`structAdds`, and each `al.snap[di].c` (against its OWN `snap.d`),
idempotently; an unresolvable key stays positional.

Three build items:
- **Fable-B — also migrate `SCHED.orig[di].c`** against `sched.orig[di].d`
  (`backfillSnapshotIds` already fills `orig[k].d` rows). Missing today; without it
  the reissue/original preview loses its marks.
- **Pre-upgrade re-minted DRAFT blobs (Astra RID-R5-02 ≡ Fable #4).** #384 (the
  merged foundation) re-mints parked drafts, and drafts persist with the week
  (`store.ts:486-491`). So a draft saved by the CURRENT build carries rids **foreign**
  to its day; under keep-ids its first switch after upgrade would read as whole-day
  tombstones+adds. `backfillSnapshotIds` skips non-empty rids, so it won't fix them.
  **One-shot at migration:** a persisted `DayDraft` blob that shares **zero** rids
  with its live day is `pathsOf`-paired to the live day and adopts those ids (exact
  for an unchanged clone — the common case; legacy-faithful, the same rule
  `backfillSnapshotIds` uses). Bounded residual: a pre-upgrade draft that was itself
  structurally edited reads as more-changed than it is on first switch — per-browser,
  days-old prototype window, cosmetic, self-heals on next save. Document it beside the
  position-pairing residual.
- **Finding 6 — keep `backfillSnapshotIds` position-pairing (do NOT safe-pair).** A
  pre-`rid` book had no identity beyond position; `shiftKeys` kept `al.keys`
  renumbered, so pairing `snap.d` to the live day by position reproduces exactly
  what that book meant, and `restoreDayVersion`/`unpublishAL` stay legacy-faithful.
  The first revision's "match section lengths, else mint fresh" would hand the live
  day a foreign `rid`-space and orphan every `al.key` — a regression (Fable #3,
  adopted over Astra RID-04 with line-level evidence: see the closure section).
  **Bounded residual:** a day that was *published and then structurally edited*
  before this upgrade migrates to a book that is only as identity-faithful as the
  legacy positional book was — i.e. no worse than today, and self-consistent per
  snapshot (`snap.c` re-keyed against its own `snap.d`); any key that genuinely
  cannot resolve stays positional (the standing fallback). A pin fixture exercises a
  pre-`rid`, row-marked, reordered book through migrate → restore → unpublish.

---

## Why this is safe against the parity and amendment gates

- **Parity:** `html.ts` is unchanged except `alAttr` translates its lookup key
  internally; `HistoryModal` emits positional/deterministic handles, never a `rid`
  (see UI map). Emitted HTML is byte-identical for any (schedule, marks) state.
- **Single-browser behaviour:** the diff still runs in the positional world and,
  on a published day, in one shared `rid`-space, so "which cells are marked at which
  AL" is identical to today; only the stored string changed. `publish.test.ts`,
  `drafts.test.ts`, `restore.test.ts`, the `audit-*` suites stay green — with the
  **stored-key** expected strings restrung to `rid` (deliberate, never weakened);
  `dayKeys`-output assertions stay positional.
- **The cross-browser win** is the new property: a delete/reorder on one client
  leaves every other row's stored key unchanged. Pinned by new tests.

## Risks / open questions carried into the build

1. **Completeness of the boundary** — a single un-translated read = a silent
   mis-paint. Build from the consumer map; tick every site.
2. **`draftDup` no longer re-mints** — the one behaviour change to merged code;
   confirm no other consumer relied on a draft's rows differing in id from the
   day it was copied from, and update the merged dup pins deliberately. Its AL-tint-
   survives-a-draft-switch regression test is mandatory.
3. **The diff-consumer shell** — positional core, translate at the boundary, with
   the `posKey`-null drop rule; re-anchor the `audit-*` oracle to `rid` WITHOUT
   weakening reads-back-its-value / none-orphaned / none-collided.
4. **`del:`/`mov:` counting** — confirm nothing relied on a *row* key that moved.
5. **`weekBaseline`/`weekDirty`** — migration runs before the baseline.
6. **Notes staying positional** — confirm no generic remap now skips them.

## Confirmed CLEAN (don't re-worry)

- No `rid` leaks into rendered HTML once `HistoryModal` is handled (`html.ts`,
  `board.ts`, `board-html.ts`, `peek.ts` never touches `SCHED`, `ALPanel.tsx`,
  `Shell.tsx`); `alAttr` only translates its lookup key.
- `NONROW` fallback spaces; `shiftKeys`/`permuteKeys` inert on `rid` keys
  (`keys.ts:31,64`).
- `ridKey` O(depth) on the paint path; `posKey` O(n) off it.
- Key-form table matches `keyLevels` for all 11 prefix groups.
- `withDaySnap` swaps `DAYS`+`SCHED.changes` together (preview space-consistent);
  `applyDayTpl` refuses published days and strips ids; migration wired at
  `store.ts:491→492`, `:634→635`.

## Surfaces — the map

**Engine**
- `slots.ts` — write funnel (`noteChange`→`markEdit`, self-healing translate-in);
  `acceptInput` (376) mint-before-mark; `unacceptInput` capture `rid` + `dropRowMarks`.
- `publish.ts` — `alAttr` (translate-for-paint, global short-circuit),
  `markEdit`/`markStructuralAdd` (write-in), `deletionWasIssued` (built key →
  `ridKey`), `structuralAddExists` (stored key → `posKey`), `alIssue`/`unpublishAL`/
  `daySnap` (iterate stored `rid` keys; single-hop — the day, its drafts and its
  issued document share one id-space), synthetic minters (no translation).
- `restore.ts` — `dayKeys` positional/unchanged; `restoreDayVersion` installs
  `snap.d`+`snap.c` (matched pair, no id fix-up — the snapshot already carries the
  ids); iterates by `keyDay`.
- `drafts.ts` — **`draftDup` stops stripping/re-minting the parked copy** (keeps the
  source ids); `draftSelect`/`loadVersionToWorkingCopy` install the blob, no adopt;
  `rebaseDayPending` positional value diff + `rid` set-difference (ancestor-collapsing)
  structural diff + a `mov:` per permuted section, writes `ridKey`;
  `reconcileIssuedMarks` joins by `rid` resolved separately in live & `snap.d`, the
  four-way null table; `rowKeyOf` positional/unchanged.
- `reorder.ts` — `done`/`sortedKey` `SCHED.added` lookups via `ridKey`;
  `shiftKeys`/`permuteKeys` inert (confirm by test); `mov:` unchanged.
- `board.ts` — add handlers mint-before-mark; delete handlers capture rids before
  splice + `dropRowMarks`.
- `keys.ts` — calls retained, inert on `rid`, live for `dn:`/positional-fallback.
- `daytpl.ts` — audit for positional-key assumptions (copies strip+re-mint already).
- `editlog.ts` — `logEdit` stores `rid`; `keyLabel` accepts either form;
  `elogFor`/`elogAllFor`/`elogGroups` translate DOM key in; `elogRemap` inert.

**State**
- `history.ts` — `histSnap`/`histApply` opaque to key form (no change).
- `store.ts` — `migrateBookKeys(SCHED, DAYS)` after `backfillSnapshotIds`, before
  `weekBaseline`, in `initStore` + `loadWeek`; add `orig[di].c` (Fable-B); keep
  `backfillSnapshotIds` position-pairing.

**UI**
- `html.ts` — `alAttr(posKey)` sites unchanged (translation is inside).
- `ALPanel.tsx`, `peek.ts` — iterate stored `rid` keys, resolve to rows for display.
- `HistoryModal.tsx` (Astra RID-05, **was missing**; refined by Fable #4) —
  `rowHTML:56` emits `r.key` into `data-hkey` and `groupedHTML:86` emits `g.key`
  into `data-hgrp`; once the log stores `rid` keys these would leak a non-deterministic
  `rid` into rendered HTML. These are the ONLY DOM sites carrying a stored key
  (`ALPanel.tsx:41` emits `a.n`; `histbubble.ts`/`peek.ts`/`html.ts` emit nothing
  keyed — checked). **Emit a group INDEX handle** `data-hgrp="${i}"` and map back via
  `elogGroups(di)[i].key` in `onBody:113`; keep the `HISTOPEN` fold-state keyed on
  the stored `rid` key (a `posKey` handle would shift under a delete above it and
  drop the fold). Render an unresolved historical row without a live jump. NB: the
  modal is not in `tfin.js`/`html.test.ts`, so this is test **determinism**, not the
  728 gate — but the "no `rid` in the DOM" rule still applies. Add coverage that
  detects `rid` leakage and preserves grouping/nav.
- `histbubble.ts`, `interactions.ts` — translate the DOM key in / `posKey` before
  the scan (Fable-A).
- `highlights.ts` — arm/drop targeting stays positional (never touches the book) —
  audit only.

## Task plan (each task: red test → build → review → affected tests green)

**Task 1 (Foundation) is DONE and merged (#384).**

2. **Write/read boundary** — `slots.ts` self-healing translate-in +
   `acceptInput` mint; `publish.ts` `alAttr` (short-circuit), `markEdit`/
   `markStructuralAdd`, `deletionWasIssued`(`ridKey`)/`structuralAddExists`(`posKey`);
   `board.ts` add handlers mint-before-mark; `editlog.ts` `logEdit` store `rid` +
   `keyLabel` either-form + read-side translate. Green `publish.test.ts`,
   `editlog.test.ts`, `audit-a-*` (stored-key strings → `rid`).
3. **Drafts keep ids + diff consumers** — **`draftDup` stops stripping/re-minting**
   (`drafts.ts:117,129`; the one merged-behaviour change — update its pins
   deliberately); `rebaseDayPending` positional value diff + `rid` set-difference
   (ancestor-collapsing) structural diff + `mov:` per permuted section;
   `reconcileIssuedMarks` join-by-`rid` (resolve in live & `snap.d` separately) +
   the four-way null table; `rowKeyOf` unchanged; `draftSelect`/`loadVersionToWorkingCopy`/
   `restoreDayVersion` install the blob with no id fix-up. Green `drafts.test.ts`,
   `restore.test.ts`, reconcile/rebase tests. `dayKeys`/`restore.test.ts`/
   `keys.test.ts` **dayKeys-output** strings stay positional.
4. **Delete sweep (LIVE book only) + reorder inert** — `dropRowMarks` at `board.ts` /
   `slots.ts:unacceptInput` (capture root rids before splice), **scoped to
   `SCHED.pending`/`changes`/`added` — never an issued AL's `keys`/`adds`/`structAdds`/
   `snap.c`** (Astra RID-R5-03 ≡ Fable #1); `reorder.ts` `done`/`sortedKey` via
   `ridKey`; confirm `shiftKeys`/`permuteKeys` inertness. Re-anchor `audit-d-*` oracle
   to `rid` WITHOUT weakening.
5. **Migration wiring** — `store.ts` `migrateBookKeys` after `backfillSnapshotIds`,
   before `weekBaseline` (both entry points); add `orig[di].c` (Fable-B); keep
   position-pairing. Green `loadweek.test.ts`/`persist.test.ts`/`weekstash.test.ts`.
6. **UI audit** — `ALPanel.tsx`, `peek.ts`, `histbubble.ts`,
   `interactions.ts:jumpToChange/findHistCell`, **`HistoryModal.tsx` render
   translation (RID-05)**, `highlights.ts` (audit only).
7. **Full gates + built-bundle drive** + Fable bug-check; HANDOFF/docs; PR on the
   branch, preview link, HOLD for "merge live".

## Tests — red first

**A shared restring helper.** ~**214** `SCHED.pending/changes/added[...]`
assertions live across **29** test files (not the ~9 the first plan named). Add a
test helper `const rk = (k: string) => ridKey(k, DAYS)` and wrap stored-key
expectations with it, so the restring is mechanical and reviewable. Row-keyed
files to restring include `reorder.test.ts` (24), `sort.test.ts` (11),
`store.test.ts` (11), `interact.test.tsx` (10), `board.test.tsx` (9),
`brieftime-ui.test.tsx` (9), `daytpl.test.ts` (9), `stores-edit.test.tsx` (7),
`pubsweep.test.tsx` (5), plus `audit-a-hist.test.tsx:192`,
`audit-d-rowdrag-stale.test.tsx:78`. `dayKeys`-output assertions stay positional.

New / regression cases:
1. `ridKey`/`posKey` round-trip every prefix (ancestor ids retained); unresolvable →
   positional fallback; deleted `rid` → `posKey` null. *(merged in task 1)*
2. Delete a row mid-list → every *other* row's stored key unchanged; the deleted
   row's mark gone (`dropRowMarks`), including a deleted **parent's** child marks.
3. Reorder → no stored key changes; marks ride their rows.
4. `alAttr` paints the same cell before/after an unrelated insert above it.
5. **AL tint survives a published-day draft switch (the core pin):** publish an AL
   on a ROW key (e.g. `ff:0.0.0.cs`), `draftDup`, switch to Draft 1, assert
   `alAttr('ff:0.0.0.cs')` still carries `data-alc="1"` AND `unpublishAL` returns
   that mark to pending. (Passes because the switched draft already carries the
   issued ids — no fix-up. No unchanged-path caveat now.)
5b. **`draftDup` keeps ids; a genuine add is still distinct (the decision pin):**
   `draftDup`, assert every parked-draft row's `rid` equals the source day's; then
   add a wave in a draft and assert it gets a FRESH `rid` (not shared with any
   source row). And the delete-then-replace case that defeated the old gate: publish
   [A,B], `draftDup`, in a draft delete B and add X, switch away/back → assert X
   keeps its own `rid` (never inherits B's), B's removal mints a tombstone, X is
   tracked as an add (Astra RID-R4-01 — trivially correct under keep-ids).
6. **Add → reorder → switch away/back → delete both the added row and an issued
   neighbour** — the add's `rid` (set-difference) is attributed to the added row,
   the issued neighbour's deletion mints its tombstone (Astra RID-02).
6b. **Edit-then-move keeps the field mark:** on a published day edit a ground row's
   time and move it past a later row whose issued value equals the new one; assert
   `reconcileIssuedMarks` does NOT drop the genuine change mark (it resolves the
   row's issued value by `rid` in `snap.d`, not by live position) (Astra RID-R3-02).
6c. **Reorder-only draft swap still records a `mov:`:** publish [A,B] with equal
   labels, `draftDup`, swap the two in a draft, switch → assert a `mov:` pending and
   the day counts as changed after reconcile (Fable #1).
6d. **Reorder + edit does NOT lose the edit (Astra RID-R5-01):** issued
   `[A(08:30), B(09:00)]`, draft reordered to `[B(08:30), A(08:30)]`, switch → assert
   B's 09:00→08:30 change carries a pending mark after reconcile (the rid-native
   rebase value diff catches it; a positional diff would not).
6e. **Delete then resurrect via a draft, then unpublish (Astra RID-R5-03 ≡ Fable #1):**
   publish {A,B}, mark B.cs → AL1, `draftDup`, delete B live, switch to the draft that
   still has B → B's tint restored; `unpublishAL(1)` → B's mark returns to pending and
   AL1's own record was never mutated. (Pins that `dropRowMarks` touched only the live
   book.)
7. `migrateBookKeys`: positional book → `rid`, idempotent, unresolvable left
   positional; `orig[di].c` migrated (Fable-B); an equal-length reorder /
   delete-plus-replacement legacy book, migrated then restored + unpublished, stays
   consistent (position-pairing is legacy-faithful). **A pre-upgrade re-minted draft
   blob** (foreign rids) is path-paired into the day's id-space on migration and its
   first switch reads as a diff, not a whole-day replace (Astra RID-R5-02).
8. **History render emits no `rid`** — `data-hkey`/`data-hgrp` are positional after
   the log holds `rid` keys (RID-05).
9. `html.test.ts` byte-identical, `parity.test.ts` unchanged, `tfin.js` 728/0, the
   `audit-*` keyspace suites green with restrung **stored-key** strings.

## Not in this round

`EditLog.rowId` as a separate persisted field · course/syllabus ids · `Attempt`
history · giving notes a `rid`.

## Order of work and time (est.)

Task 1 merged. Remaining: write/read boundary + self-healing helper ≈ 1.5 h;
published-day anchor + diff consumers (the subtle one) ≈ 2 h; delete sweep +
reorder + audit-d restring ≈ 1.5 h; migration + `orig[di].c` ≈ 0.75 h; UI audit
(incl. HistoryModal) + the ~214-assertion restring + full gates + built-bundle
drive ≈ 2 h. One PR on the branch, the preview link, HOLD for "merge live". HEAVY
throughout — a silent defect here mis-attributes an issued amendment.
