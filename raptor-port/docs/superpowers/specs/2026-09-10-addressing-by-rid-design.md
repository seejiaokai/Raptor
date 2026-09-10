# Addressing by `rid` — the amendment book resolves rows by id, not position — design

**Date:** 10 Sep 26 · **Branch:** `claude/read-handoff-docs-wuftw9` · **Status:** DRAFT, to review before build.

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
`shiftWave` / `shiftFormation` / `shiftAircraft` rewrite the entire key space —
pending, changes, added, every issued AL, the edit log (`elogRemap`), and view
keys (`HOOKS.remapViewKeys`) — so a mark stays glued to its row on **this**
browser.

That renumber is correct for one browser and **wrong across a database.** When
two clients share the book, a delete on client A renumbers A's keys; client B
never saw the delete, so the two books now disagree about which row `wl:0.2`
means. The row needs an address that no splice can move: its `rid`.

## The one hard constraint — byte parity keeps the DOM positional

The rendered HTML carries positional key strings in real attributes —
`data-slot="0.1.0.0.p"`, `data-area="0.1.0"`, `data-atime`, `data-intimes`,
and the `alAttr()` amendment colours computed from them. `html.ts` builds every
one of these from the loop index and **never stringifies a row** — that is what
keeps `tfin.js` and `html.test.ts` byte-identical. `rid` is random per browser,
so a `rid` in the DOM would break parity outright and leak a non-deterministic
value into the compared output.

**Therefore the DOM address stays positional and the stored book address
becomes `rid`-anchored,** with a translation boundary between them. This is the
central decision and everything else follows from it.

## The design — one canonical form, translated at the edges

### The `rid`-anchored key form

A row-addressing key replaces the row's **own** position component with its
`rid` and drops the now-redundant ancestor position components (`rid` is unique
across the whole week, so the parent indices carry no identity). The **day
index stays first** after the prefix — `keyDay` / `uniqDays` / every per-day
filter and snapshot slice depend on it and are unchanged.

| positional (DOM / today's book) | `rid`-anchored (stored book) | anchor row |
|---|---|---|
| `wl:di.gi` · `it:di.gi` · `tr:di.gi` | `wl:di.«wRid»` · `it:di.«wRid»` · `tr:di.«wRid»` | wave |
| `ff:di.gi.li.cs` (…`.msn/.to/.ld/.br`) · `ar:di.gi.li` · `at:di.gi.li` | `ff:di.«fRid».cs` · `ar:di.«fRid»` · `at:di.«fRid»` | formation |
| `fr:di.gi.li.ai` · `st:di.gi.li.ai` · seat `di.gi.li.ai.p`/`.w` | `fr:di.«aRid»` · `st:di.«aRid»` · `di.«aRid».p`/`.w` | aircraft (seat pair) |
| `dl:di.wi` | `dl:di.«bRid»` | duty block |
| `dr:di.wi.ri.role` (…`.str/.end/.rmks`) · `d:di.wi.ri` · `d:di.wi.ri.xN` | `dr:di.«rRid».role` · `d:di.«rRid»` · `d:di.«rRid».xN` | duty row |
| `sr:di.kind.ri.label` (…) · `s:di.kind.ri.p`/`.w` · `s:di.kind.ri.pax.k` · `s:di.kind.ri.xN` | `sr:di.«rRid».label` · `s:di.«rRid».p` · `s:di.«rRid».pax.k` · `s:di.«rRid».xN` | sim row |
| `ap:di.ri.prog` (…`.sub/.str/.end/.rmks`) · `a:di.ri.k` | `ap:di.«rRid».prog` · `a:di.«rRid».k` | programme (allhands) row |
| `gr:di.ri.prog` (…) · `g:di.ri` · `g:di.ri.xN` | `gr:di.«rRid».prog` · `g:di.«rRid»` · `g:di.«rRid».xN` | ground row |

Within-row sub-addresses stay literal: the field selector (`.cs`, `.prog`,
`.role`, `.str`…), the seat `.p`/`.w`, the overflow `.xN`, the crew index `.k`,
`pax.k`. Only the row's identity collapses to `«rid»`.

**Stays positional — the fallback spaces** (no `rid`, unchanged, still
`keys.ts`-renumbered where relevant):

- **Notes** `dn:di.ni` — a note is not a `ScheduleRow`; the design deliberately
  gave it no `rid`. Notes keep positional addressing and `shiftKeys('dn:di.',…)`.
- **Day-level fields** `sn:di` · `pn:di` · `dtn:di` · `gn:di` — one per day, no
  position component to move. Untouched.
- **Synthetic day-anchored keys** `del:di.seq.kind` · `mov:di.seq.kind` ·
  `inp:di.«iid»` — already row-position-immune by construction. Untouched.

### The two pure functions (`engine/rowids.ts`)

```ts
// resolve a live row at a positional key to its rid-anchored key; on any row
// that has no rid or cannot be resolved, return the key UNCHANGED (fallback).
export function ridKey(posKey: string, days: any[]): string
// the inverse: resolve a rid-anchored key to the row's CURRENT positional key;
// a rid no longer present (deleted row) returns null.
export function posKey(ridKey: string, days: any[]): string | null
```

Both parse the prefix, read `di` (first component), walk that day's rows to map
position↔`rid`, and rebuild. They are the ONLY place the grammar is encoded for
translation; `restore.ts:dayKeys` remains the executable spec of the positional
grammar and is what these two are tested against, prefix for prefix.

Determinism note: `ridKey` is a pure function of `(key, days)` — it reads live
row objects, mints nothing — so it never leaks a fresh `rid` into a compared
string. Every `rid` it emits was already minted by `ensureRowIds` before the
baseline.

### Where translation happens — the boundary

- **Write in (positional → `rid`):** the mutation funnel is the single choke.
  `slots.ts:noteChange` and `publish.ts:markEdit` / `markStructuralAdd` receive
  a positional key (built from DOM/loop indices) and store its `ridKey(…)`. The
  synthetic minters (`markDeletion`, `markMove`, `markInputFiling`) already
  produce row-immune keys and skip translation.
- **Read out for painting (positional → `rid`):** `publish.ts:alAttr(posKey)`
  translates before it reads `SCHED.changes` / `SCHED.pending`. The DOM string
  it is called with is unchanged; only the lookup key is translated.
- **Edit-log read (positional → `rid`):** `elogFor` / `elogAllFor` / `notePub`
  and any hover match translate the DOM key before matching the stored `rid`
  key; `keyLabel(ridKey)` resolves the `rid` to its row for the words.
- **Flash / DOM-node-by-key (`rid` → positional):** anywhere a stored key is
  handed back to find a DOM node (`HOOKS.flashAdded`, any future
  `remapViewKeys` consumer) translates `rid` → positional first.
- **Diff walker (`restore.ts:dayKeys`):** emits `rid`-anchored keys directly
  (it walks the row objects, so it uses `r.rid`), with the positional fallback
  per row. Both live and snapshot are walked by the same function, so
  `reconcileIssuedMarks` and `rebaseDayPending` compare like against like and
  their resulting pending keys are already `rid`-anchored. The tombstone /
  add-identity strings those two build (`wl:${di}.${i}`, `ff:…`, `dr:…`,
  `sr:…`, `gr:…`) resolve the live row at index `i` to its `rid`.

### `keys.ts` after the change

`shiftKeys` / `permuteKeys` / `moveKeys` become **no-ops on `rid`-anchored key
spaces** — a `rid` does not move when the array splices, which is the whole
point — and are retained ONLY for the fallback spaces (`dn:` notes). Concretely:
the per-level wrappers `shiftWave` / `shiftFormation` / `shiftAircraft` and the
reorder callers stop renumbering the row dimensions that are now `rid`-anchored;
`reorder.ts` keeps minting the `mov:` tombstone on a published reorder (that is
an *amendment record*, not an address, and still must be counted). The
functions themselves stay in the file, tested, for the note space and as the
documented history of why the book used to renumber.

### Migration — the persisted book (fallback to position)

`SCHED` now persists per browser (storage seam). A book written before this
change holds **positional** keys. One pass converts it, run once per boot /
week-load right after `backfillSnapshotIds` (which has already put a `rid` on
every snapshot row) and before the baseline:

```ts
// engine/rowids.ts — rewrite every stored key from positional to rid form,
// against the live DAYS; a key whose row is unresolvable is left positional.
export function migrateBookKeys(sched: any, days: any[]): number
```

It rewrites `sched.pending` / `changes` / `added`, every `al.keys` / `adds` /
`structAdds` and the keys of every `al.snap[di].c` slice, and the edit-log rows'
`key` field. Idempotent: an already-`rid` key resolves to itself. This is the
"fallback to position for any row or persisted snapshot still without one" the
scope names — a pre-`rid` snapshot row that `backfillSnapshotIds` could not pair
keeps its positional key and still works, exactly as today.

---

## Why this is safe against the parity and amendment gates

- **Parity:** `html.ts` is unchanged except that `alAttr` translates its lookup
  key internally. The emitted HTML — every `data-*` attribute and every AL
  colour — is byte-identical for any given (schedule, marks) state, because the
  translation is a pure relabelling of the lookup, not of the output.
- **Single-browser behaviour:** for any sequence of edits on one browser the
  set of "which cells are marked at which AL" is identical to today; only the
  *string used to remember it* changed. The existing behavioural suites
  (`publish.test.ts`, `drafts.test.ts`, `restore.test.ts`, the `audit-*`
  keyspace tests) are the proof and stay green — with the keyspace tests'
  *expected key strings* updated from positional to `rid` form where they assert
  the stored key directly (a deliberate, reviewed edit, never a weakened
  assertion).
- **The cross-browser win** is the new property: a delete/reorder on one client
  leaves every other row's stored key unchanged, so a second client's book is
  never silently reindexed. Pinned by new tests in `rowids.test.ts` /
  `keys.test.ts`.

## Risks / open questions carried into the build

1. **Completeness of the boundary.** A single un-translated read of
   `SCHED.pending`/`changes`/`added` by a DOM key = a silent mis-paint. The
   build starts from the exhaustive consumer map (below) and every site is
   ticked off against it. *This is the primary risk and the reason for the
   HEAVY process.*
2. **`del:`/`mov:` counting.** These stay day-anchored; confirm nothing in
   `deletionWasIssued` / `reconcile` / `rebase` relied on a *row* key that has
   now moved to `rid` form in a way that changes the count.
3. **`weekBaseline` / `weekDirty`.** A pristine week has an empty book, so no
   key strings serialize and `weekDirty` stays `false` — but confirm the
   migration pass runs *before* `weekBaseline` is taken so a persisted book's
   re-keying is not seen as a dirtying edit.
4. **Notes staying positional** is a deliberate asymmetry; confirm no path
   assumes all sections are `rid`-anchored uniformly (e.g. a generic remap that
   would now skip notes).

**Confirmed traps for the wiring (Fable bug-check of the foundation, 10 Sep 26)**
— none are foundation bugs; each is a site that PARSES positional components and
will silently break the moment the book holds `rid` keys:

5. **Positional parsers that must resolve through `posKey` first:**
   `publish.ts:structuralAddExists` (`(d.waves||[])[+a[1]]` → `NaN` on a rid
   → always `false`), `publish.ts:deletionWasIssued` (builds positional
   identity keys and looks them up in `SCHED.added`), `drafts.ts:rowKeyOf`
   (rebuilds a row key from parts), and `editlog.ts:keyLabel` (`DAYS[+a[0]]
   .waves[+a[1]]…`). Each either translates the stored key back with `posKey`
   or resolves the row by `rid` directly.
6. **Ordering at the write funnel:** `keyLabel` is frozen INTO the log row at
   `logEdit` time from the key it is handed. Compute the label from the
   POSITIONAL key, then store the `rid` key — translate *after* labelling,
   or `keyLabel` sees a `rid` and falls through to `'Schedule'`.
7. **Keep the hot path cheap:** `alAttr` runs for every cell on every paint,
   and `ridKey` is direct array indexing (O(depth)) — keep it there. `posKey`
   resolves by `findIndex` (O(n) per key) and belongs OFF the paint path (flash
   / migrate / label only). Re-check `npm run perf` after wiring.
8. **Migration ordering:** `migrateBookKeys` must run AFTER
   `backfillSnapshotIds` (so `snap.d` rows carry ids) and BEFORE
   `weekBaseline`; a snapshot slice translates against its OWN `snap.d`, never
   the live day (a moved row would map onto the wrong id — caught and fixed in
   the foundation, pinned by test).

## Surfaces — the map (from the survey)

Every site that reads/writes `SCHED.pending`/`changes`/`added` by key, or emits
/consumes a positional DOM key. Each is a translation boundary or an
audited-unchanged site.

**Engine**
- `engine/slots.ts` — the write funnel (`noteChange` → `markEdit`). **Translate
  in** (positional → `rid`) here, the single choke for value edits.
- `engine/publish.ts` — `alAttr` (**translate for paint**), `markEdit` /
  `markStructuralAdd` (write in), `alIssue` / `unpublishAL` / `daySnap` (iterate
  keys — already stored form, no translation, but `daySnap`'s `c` slice is now
  `rid`-keyed), the synthetic minters (`del:`/`mov:`/`inp:` — **no translation**),
  `deletionWasIssued` / `structuralAddExists` (build positional identity keys →
  resolve live row to `rid`).
- `engine/restore.ts` — `dayKeys` **emits `rid` keys** (walks row objects);
  `restoreDayVersion` iterates by `keyDay` (day filter unchanged).
- `engine/drafts.ts` — `reconcileIssuedMarks` / `rebaseDayPending` diff via
  `dayKeys` (now `rid` on both sides); the tombstone/add-key builders resolve
  live rows to `rid`; `rowKeyOf` rebuilt in `rid` terms.
- `engine/reorder.ts` — the delete/reorder callers: **`shiftKeys` becomes inert
  on `rid` keys automatically** (`+a[pos]` on a `rid` is `NaN` → returns the key
  unchanged), so reorder no longer renumbers; **but a DELETE must actively drop
  the removed row's `rid`-keyed marks** (new `dropRowMarks(rid)` sweep,
  replacing `shiftKeys`'s drop-half), keeping the `del:` tombstone. `mov:` on a
  published reorder unchanged.
- `engine/keys.ts` — `shiftKeys`/`permuteKeys`/`moveKeys` retained for the note
  space (`dn:`), inert on `rid` keys; `keyDay`/`uniqDays` unchanged (day first).
- `engine/daytpl.ts` — touches `SCHED` maps on template apply; audit for
  positional-key assumptions (a copied day mints fresh `rid`s via `stripRowIds`
  + `ensureRowIds` already).
- `engine/editlog.ts` — `logEdit` writes the key (translate in via `markEdit`);
  `elogFor`/`elogAllFor`/`elogGroups` match by stored key (translate the DOM
  key in at the read); `keyLabel` resolves a `rid` key to its row; `elogRemap`
  becomes inert on `rid` keys (kept for the note space).

**State**
- `state/history.ts` — `histSnap`/`histApply` serialize/restore `SCHED` verbatim
  (key form is opaque to them — no change).
- `state/store.ts` — wire `migrateBookKeys(SCHED, DAYS)` after
  `backfillSnapshotIds` and **before** `weekBaseline`, in both `initStore` and
  `loadWeek`.

**UI**
- `ui/html.ts` — `alAttr(posKey)` call sites (translation is inside `alAttr`, so
  these are unchanged); DOM keys stay positional.
- `ui/ALPanel.tsx`, `ui/peek.ts` — read `SCHED` maps to summarise/preview an
  AL: iterate the stored (`rid`) keys, resolve to rows for display; audit each.
- `ui/histbubble.ts` — reads the DOM cell's `data-slot`/`data-*` key to find its
  log entry: **translate in** before matching the stored `rid` key.
- `ui/highlights.ts` — arm/drop targeting matches `ARM.key` against DOM
  `data-slot`/`data-fill`; `ARM.key` is a positional DOM key and the DOM is
  positional, so **arm targeting stays entirely positional** (it never touches
  the stored book) — audit only, no change expected.

## Task plan (each task: red test → build → review → affected tests green)

1. **Foundation** — `ridKey(posKey, days)` / `posKey(ridKey, days)` /
   `migrateBookKeys(sched, days)` in `engine/rowids.ts`, exhaustive red-first
   tests (`rowids.test.ts`): every prefix round-trips; unresolvable → positional
   fallback; deleted `rid` → `posKey` null; migrate is idempotent. _No app
   behaviour changes; all gates stay green._ **← this session.**
2. **`dayKeys` → `rid`** (`restore.ts`) with fallback; update `restore.test.ts`
   / `keys.test.ts` expected strings (deliberate re-string, never weakened);
   confirm `reconcile`/`rebase`/`restore` behavioural tests green.
3. **Write/read boundary** — `slots.ts` translate-in, `publish.ts` `alAttr`
   translate-for-paint, `editlog.ts` read-side translate + `keyLabel`; green
   `publish.test.ts`, `editlog.test.ts`, `audit-a-editlog.test.ts`.
4. **Delete sweep + reorder inert** — `reorder.ts` `dropRowMarks`, confirm
   `shiftKeys` inertness; re-anchor `audit-d-keyspace.test.ts` /
   `audit-d-published.test.ts` / `audit-d-applymove.test.ts` oracle to `rid`
   **without weakening** the "reads back its value / none orphaned / none
   collided" invariant.
5. **Migration wiring** — `store.ts` `migrateBookKeys` before baseline;
   `loadweek.test.ts` / `persist.test.ts` / `weekstash.test.ts` green; a
   persisted positional book upgrades on load.
6. **UI audit** — `ALPanel.tsx`, `peek.ts`, `histbubble.ts`, `highlights.ts`.
7. **Full gates + built-bundle drive** + Fable bug-check pass; HANDOFF/docs
   updated; PR on the branch, preview link, HOLD for "merge live".

## Tests — red first

_(Scheduler)_ new `rowids.test.ts` / `keys.test.ts` cases:
1. `ridKey`/`posKey` round-trip every prefix in `dayKeys`'s grammar; an
   unresolvable row falls back to the positional string; a deleted `rid` →
   `posKey` is `null`.
2. Delete a row mid-list → every *other* row's stored `SCHED.changes` key is
   **unchanged** (the property `shiftKeys` used to have to fake); the deleted
   row's mark is gone.
3. Reorder → same: no stored key changes, the marks ride their rows.
4. `alAttr` paints the same cell before and after an unrelated insert above it
   (the mis-attribution bug the positional book had across a database).
5. `migrateBookKeys` on a positional book → `rid` keys, idempotent, an
   unresolvable key left positional.
6. `html.test.ts` byte-identical (unchanged), `parity.test.ts` unchanged,
   `tfin.js` 728/0, the `audit-*` keyspace suites green with updated expected
   strings.

## Not in this round

`EditLog.rowId` as a separate persisted field (the `rid` now lives *in* the log
key, which is the resolver the earlier note said was missing — revisit whether a
dedicated field is still wanted) · course/syllabus ids · `Attempt` history ·
giving notes a `rid`.

## Order of work and time (est.)

Translation fns + tests (red) ≈ 1 h; `dayKeys` → `rid` + walker tests ≈ 1 h;
the write/read/flash/editlog boundary + `migrateBookKeys` ≈ 2 h; `keys.ts`
no-op + reorder callers ≈ 1 h; keyspace-test restring + full gates + the
built-bundle drive ≈ 1.5 h. One PR on the branch, the preview link, HOLD for
"merge live". HEAVY throughout — a silent defect here mis-attributes an issued
amendment.
