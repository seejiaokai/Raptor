# [ARCH-STACK] Step 4 — ONE Absence Record — DESIGN (Rev 1, 19 Sep 26)

> **Status: DRAFT for red-team.** Foundation + current-state map (from three read-only code maps)
> + target model + mechanics + owner-decision list written. NEXT: dual cross-provider red-team
> (Codex + Fable), fold-in, then a plain-language owner summary. **No code. Nothing merged.**

**Plan of record:** `2026-09-13-architecture-rootcause-plan.md` (RC2; step 4; SEQ-004 binding).
**Builds on (all DONE + live):** Step 1 stable ids, Step 2 the one command/commit layer, Step 3
[GLOBAL-UNDO]. **Feeds:** Step 5 [DB-STEP] (the Dataverse tables this must settle *before* they
freeze) and the [RECALL] archive/return model.
**Related, settled this session (19 Sep 26):** the archive/return model — a returning person's old
detailed leave history is **frozen, never deleted**; they return with a **single starting balance
number**, not a rebuilt record set. This design must leave room for it (an absence belongs to a
posting "chapter"; closing a chapter freezes its records; a fresh chapter starts empty with a
seeded balance). See OUTSTANDING `[RECALL]` and §8.4.

---

## 1. The problem, in one line

Today **one fact — "Person X is on approved leave on 15 Jul" — is stored twice**: once as a
scheduler **Input** (`inputs/<iid>`) and once as a **Leave War cell** (`states[person][date]`). A
background reconciler in `leavewar/sync.ts` constantly re-computes the two copies and copies the
differences across. Because there are two copies and a guesser between them, **every delete, undo,
edit or move is a guess about which copy wins** — the documented root of the whole delete/undo/
ownership bug family (`2026-09-13-sync-delete-undo-integrity-spec.md`, findings A/D/E/F/I:
resurrection, double-landing, ownership-flip, lost remarks, orphaned grades). Root cause **RC2**:
*"one fact stored twice, joined by diff-reconciliation."* The fix is structural.

## 2. Current state (how an approved absence is represented today)

### 2.1 The scheduler Input record (`src/engine/`) — MAPPED
The authoritative type is `Input` (`schema.ts:148-185`); the live array is `INPUTS`
(`inputs.ts:453`). Fields that matter here: **`iid`** (stable opaque id, `newId('i')`, the address
for file/accept/undo/edit since 1A); **`person`** (a PEOPLE id since 1C); **`date`/`endDate`/`yr`**
(labels, not ISO — see the ISO-date debt, split out of 1b); **`type`** (catalogue code, everything
via `INPUT_META`); **`remarks`**; **`mod`** (frozen last-modified ISO); **`acc`** (`'g'|'u'|'r'` —
the LANDING state: landed on a Ground row / actioned to Unavailable / dormant; absent = never
landed); **`lw`** (the Leave War loop-breaker: the id of the war this leave came from);
**`docId`/`docIds`** (medical certificate attachment ids, IndexedDB); **`oil`** (per-day OIL credit
decision from the ask-flow); **`sans`**.

**Lifecycle** (anchors): filed → `writeInputsBatch` history step; an *activity* input auto-lands on
its day's Ground Programme (`autoAcceptInput` → `acceptInput`, `slots.ts:344,422`) pushing a Ground
row `{who:inp.person, rmks, src: inp.iid}` and setting `acc='g'` — **`src` = the input's `iid`**
(`slots.ts:385-388`); on week-swap/undo the `'g'` is re-derived by `reconcileLandedAcc`
(`slots.ts:461`, no re-push); edit = un-accept → edit → re-accept through the real path
(`commitInputEdit`, `inputedit.tsx:849`), which **withdraws the LW grant first** if the leave itself
changed (`retractLwRow`, drops `lw`); un-accept parks the input **dormant `acc='r'`, not deleted**
(`unacceptInput`, `slots.ts:539`, finds the row by `src===iid` across the week); delete = `removeInput`
→ `dropInputRow` (`inputedit.tsx:1186,1225`) retracts LW, un-accepts, splices.

**Effect read-sites (projections, never a second store):** availability/palette/crew-strip via
`isAway` (`inputs.ts:263`, consumed `avail.ts:75-76`); the validator gate `inpShow`
(`events.ts:21`, feeds `day.input`); the landed Ground row itself (`who`/`rmks`/`src=iid`); OIL
(`row.oil`, `sync.ts:894,905`). **Drift seams today:** (1) `acc='g'` is a derived pointer to a
Ground row keyed by `src===iid` — a whole-day DAYS replace can strand it (`reconcileDayFiling` heals);
(2) dormant `'r'` vs never-landed; (3) **the two-record LW seam** (this design's target); (4) an
accepted `Other` whose input is deleted strands a ground row that can't resolve its clash type
(`shiftHardGround`) — the orphaned-grade finding step 4 owns.

### 2.2 The Leave War copy (`src/leavewar/`) — MAPPED
A war is three parallel maps — `grid` (personId→date→code) + `states` + `period` — not one record.
Decision + ownership live in **`BidRecord`** (`engine/bids.ts:45-60`): `state`
(`pending|acknowledged|approved|refused`), **`source`** (`bid|raptor` — the ownership tag, "the last
authority to write this cell"; **`raptor` = approved/owned elsewhere**, i.e. the copy), `shiftedFrom?`,
`note?` (OIL-reason / hand FO-HO note, cap 40). `states` is **sparse** — only bid/owned cells exist.
**Remarks and the medical certificate link do NOT live on the war cell** — they live on the Raptor
input (`remarks`, `docId`/`docIds`); the war's `note` is OIL-reason only. The **roster is a boot
projection of `PEOPLE`** (`raptorRoster.ts:41-87`), reprojected on every notify (`reprojectRoster`,
`sync.ts:1029-1084`), laying back LW-owned `personEdits` + `postOuts`; the store never persists
`people`. **This roster-as-read-through is the exact pattern one-Absence extends to approved leave.**

### 2.3 The reconciler (`src/leavewar/sync.ts`) — MAPPED
All leave sync is **derived reconciliation** — compute desired-from-source, diff the other side,
write the difference (`sync.ts:11-23`); one `SYNCING` re-entrancy latch. Three passes:
- **Outbound (LW→Raptor):** approved, biddable, **non-raptor-owned** cells mint `lw`-tagged Raptor
  inputs (`runOutbound`, `:248-388`). This is the **member-bids-then-approved** path.
- **Inbound (Raptor→LW):** every **non-`lw`** leave/medical input is copied day-by-day into
  `{approved, raptor}` war cells via `ingestFromRaptor` (`:526-641`, `store.ts:2990-3037`); a reverse
  sweep `clearRaptorCell` GCs a copy whose input is gone. This is the **scheduler-files-directly**
  path — the war holds a *second copy*.
- **OIL (published work→FO/HO):** `runOilPass` credits weekend/PH work (`:957-1003`, `engine/oil.ts`
  — envelope-based, DOM-free). **Genuinely DERIVED, not a copy of a filed absence — STAYS a computed
  projection.**
- **Loop-breaker:** outbound skips raptor-owned; inbound skips `lw`-tagged; OIL partitions the shared
  `raptor` marker **by vocabulary** (leave = inbound's, FO/HO = OIL's). `warSupersedes`/demote
  (`:227-231,310-331`): a stale `lw` row is spliced or **demoted** (`delete row.lw`) into an ordinary
  input; edit/delete on the Inputs page runs `retractLwRow`→`withdrawLeaveCell`.

**The copy machinery to be replaced:** `ingestFromRaptor` (copy-in) + `clearRaptorCell` (GC) +
outbound splice/mint + the `RETAINED`/`priorRemark` carry + the `lw` tag + `source:'raptor'` all
exist *only* to keep two copies of one fact in step. **FO/HO stays derived; the roster projection is
the pattern to follow.**

### 2.4 The command / undo layer (`src/command/`, `src/undo/`) — MAPPED (both BUILT + live)
- **Commands** ride `commit(cmd)` (public, `'user'` origin) / `commitAs(cmd,{actor,origin,causedBy})`
  (internal) / `commitProjection(cmd)` (`systemActor`+`'projection'`) — `command/commit.ts`. A
  `Command` is `{type,scope,meta?,apply,expectedRevs?}`, `apply` synchronous mutation only. `Txn`
  gives `enlist(store)`, **`child(cmd)`** (in-reducer join → shared snapshot/rollback, ONE envelope),
  `boundary(b)`. Origin taxonomy `user|remote|projection|restore|seed` — **only `user` is an undo
  entry; `projection` emits but folds into its cause, never its own entry.** `causedBy`/`causalSeq`
  chain a projection to the user command that caused it. **`EnlistableStore`** exposes
  `capture/restore/records` and the batch seam **`write(entries,{allowIssued?,restore?})`** (the
  `restore` opt lets a store re-reconcile derived per-week state on undo but not on a forward write).
  Conflict via `Command.expectedRevs` checked at phase 5.
- **Undo** (`src/undo/`) is an append-only inverse-patch timeline fed from `onCommit`; a user action
  **plus its projection ripple fold into ONE reversible closure** (`resolveRoot`/`foldProjection`,
  transitively by `causedBy`); a projection whose chain reaches `restore`/`seed` is a hard stop
  (never spliced in); undo replays the inverse as one `commitAs({type:'undo.restore'},{origin:'restore'})`.
  Actor/session scoped (`mayReverse`: admin any; else same `personId` + owns every change). The
  amendment publish boundary is enforced (`computePubBar`: no undo behind a later publish).
- **Input+leave undo ALREADY works today:** `commitInputEdit`/`removeInput` call `retractLwRow`
  **inside** the `writeInputsBatch` reducer, and `retractLwRow`→`withdrawLeaveCell` **child-joins**,
  so ONE `user` envelope carries both the `inputs` Change and the `lw.cell` Change; undo replays both.
  Both `inputs` and `lw` are cut over (`undo-wire.ts:145`).
- **Explicitly deferred to THIS step (step 4):** (1) the *fully-clean* input+leave undo — the current
  closure-carries-its-own-inverse form is the interim; the clean form is one record
  (OUTSTANDING:504-508); (2) the orphaned `Other` ground-row grade (OUTSTANDING:310-312); the
  cross-week landing model step 4 dissolves (OUTSTANDING:268,286,306-312).
- **NOT step 4 (belongs to GLOBAL-UNDO's own phases — do not fold in):** CMDLF-002 (the postouts
  posting-window rebuild — GLOBAL-UNDO §10.1/phase 5) and import-undo granularity (§10.2/phase 4).

## 3. The target model — ONE record, read by id

The approved absence is **ONE record of truth: the Input** (`inputs/<iid>`). The Leave War **stops
keeping its own copy of an approved absence.** Concretely:

1. **The war keeps only what is genuinely its own:** open **bids** (a member's request before
   approval) and its period/config. It no longer stores `{approved, source:'raptor'}` leave cells.
2. **Approved absences are READ by id, never copied.** Every war surface that shows approved leave
   derives it from `INPUTS` at projection/render time — exactly as the roster already derives from
   `PEOPLE` (§2.2). No stored second copy ⇒ nothing to drift, GC, or guess.
3. **Approve / retract / edit become COMMANDS** on the live command layer, not reconciler
   side-effects (details §4). One transaction, one envelope, atomic.
4. **The reconciler becomes an event handler, not a diff engine:** an `onCommit` handler keyed by id
   re-projects exactly the affected war cells as `projection` origin — which the live undo timeline
   already folds into the causing user closure (§2.4). The outbound/inbound diff passes, the
   `RETAINED` carry, `clearRaptorCell`, the `lw` tag and the `source:'raptor'` marker all retire.
5. **What deliberately STAYS:** **FO/HO OIL credit** (genuinely derived work, its own `runOilPass`
   projection, keeps its own cell vocabulary); **bids** (member requests, war-owned until approved);
   **the Ground-row landing** (`acc`, `src=iid`) — that is the input's landing on the *scheduler*, a
   separate projection from the LW one; **remarks + the medical certificate**, which already live on
   the Input.

**Why this dissolves the bug family:** with one record and read-by-id, a delete is a delete (no
demote-and-rebuild), an undo restores the one record (there is only one "side"), a move moves one
record (no splice/mint, no `RETAINED`), and remarks/doc-links can't be lost in a copy. Findings
A/D/E/F/I are structural non-events, not fixes. **Cross-week (finding I) is fixed for free:** `INPUTS`
is a global collection, so reading approved leave by id needs no per-week copy — the off-week
stale-cell class disappears.

## 4. Mechanics

### 4.1 The commands (on the live `commit`/`Txn` API)
- **`approveBid(bidId)`** — in ONE txn: create (or confirm) the `inputs/<iid>` Absence from the bid's
  span/type/person AND stamp **`bid.inputId = iid`** (the pointer). Replaces the outbound mint. The
  bid stays as the member's request record, now marked approved and linked.
- **`fileAbsence(...)`** (scheduler-filed leave/medical) — creates the one `inputs/<iid>` directly, as
  today, and is simply *readable* by the war by id. Replaces the inbound copy — there is nothing to
  ingest.
- **`editAbsence(iid, patch)`** — edits the one record in place (dates/type/remarks). No un-accept/
  re-accept dance for the LW half and no `retractLwRow`; the ground-row landing still re-derives via
  `reconcileLandedAcc`, and the war re-projects. (The scheduler-side un-accept→edit→re-accept for the
  *ground row* may remain, since that is the landing projection; §6 verifies.)
- **`retractAbsence(iid)`** — deletes the one Input; in the same txn the linked bid returns to open
  (or is removed — owner decision §8.1). Replaces demote/rebuild + `clearRaptorCell` +
  `withdrawLeaveCell`.

Each command implements/uses `EnlistableStore.write(entries,{restore})` so undo replays it, and emits
a `user` closure the live timeline already consumes (§2.4). A causal war re-projection raised inside
the reducer child-joins (`txn.child`) or is a `commitProjection` chained by `causedBy` — folded, not
a separate undo entry (SEQ-004).

### 4.2 The projection handler (replaces the three diff passes for leave)
`onCommit`: when an envelope touches `inputs/<iid>` for a leave/medical type, re-derive the affected
war cells for that person over the record's span from `INPUTS` (by id) and write them as `projection`.
No diff-against-held, no loop-breaker (there is no second authoritative copy to loop with). The war
render reads these projected cells; **balances/counters** (`leavewar/engine/counters`) read the same
projection. **OIL is untouched** — `runOilPass` stays a separate derived pass over the published
schedule + acknowledged `row.oil`.

### 4.3 Medical + the certificate
Medical is member-filed only ([SYNC-INTEG] P2) and carries a certificate in the append-only IndexedDB
doc store, keyed by `docId`/`docIds` **on the one Input**. On `retractAbsence` the Input goes but the
**document is NOT deleted** (decision 3 of the sync spec — it is history). The absence record simply
stops pointing at it; a re-file can re-link. No change to the doc store.

### 4.4 The Ground-row landing and the orphaned-grade fix
The scheduler landing (`acc`, Ground row `src=iid`) is a *separate* projection and stays. Step 4
closes the orphaned-`Other`-grade finding: when a landed `Other` input is retracted, its ground row
must not be left unable to resolve its clash type (`shiftHardGround`). Under one-record the ground row
resolves its type from the one Absence by `src=iid` while it exists; the retract command removes the
row in the same txn (as `dropInputRow` already does), so no orphan is left. §7 pins this with a test.

## 5. Migration — reset, not migrate
Per `[[dev-phase-reset-demo-data-not-migrate]]`: existing two-copy war cells are demo data → **reset
the demo world, no migration/back-compat code.** The builder only ensures the new model boots cleanly
on a reset world and reprojects approved leave from `INPUTS`. The DB step owns any real migration once,
server-side. *(Confirm in build: which stored keys reset; that a reset world reprojects with no orphan
`raptor` cells.)*

## 6. What this must NOT break (ecosystem walk — CLAUDE.md standing order)
- **Week view / board** — `isAway`, `inpShow`, the landed Ground row all read the Input directly, not
  the war; unaffected by dropping the war copy. Verify repaint on retract.
- **The war matrix + counters/balances** — today read `states` cells; must now read the projection.
  This is the main surface to re-point; the roster projection proves the pattern.
- **OIL credit** — untouched (separate derived pass). Verify a retracted leave still leaves earned
  FO/HO intact where the [OIL] worked-day rule applies (interaction with [OIL], not changed here).
- **The amendment publish boundary** — an approved-leave change on a *published* day is a pending
  amendment on the working copy (memory `published-day-input-is-pending-amendment`); the command must
  route through the same amendment path, and the undo publish-boundary (`computePubBar`) still applies.
- **Undo/redo** — already one closure; one-record makes it fully clean. No new undo entries for the
  projection (folded).
- **Perf** — the war/board string builders are untouched; projection is data, not a render rewrite.
- **Medical display** — member-filed medical still shows on the war (now a read-through, not a copy).

## 7. Testing (invariants + real-app scenario — `[[scenario-based-rule-testing]]`)
- **Hard invariants:** exactly one Absence record per approved absence; **no persisted war leave cell
  that isn't a live projection of an Input**; a retract leaves no orphan cell and no orphan ground row.
- **Advisory:** the war's displayed approved leave == the Inputs-by-id projection (cross-consumer
  agreement); OIL FO/HO unchanged by a leave retract.
- **Frozen:** issued snapshots + signatures unchanged (one-record is a live-state model change only).
- **Real-app scenario (mandatory):** build a real week + a real war with neighbours; (a) member bids →
  approve → assert ONE input + war reads it by id, no `raptor` copy; (b) scheduler files leave → war
  shows it, no ingest; (c) delete it → gone both places, no resurrection on the next notify; (d) undo
  → back once, not twice; (e) move its dates → one record moves, remarks/cert intact; (f) do (c) on a
  *published* day → a pending amendment, boundary honoured; (g) a cross-week absence shows on an
  unloaded week with no stale cell.

## 8. DECISIONS FOR THE OWNER (answer when fresh — each has my recommendation)
1. **A bid that is approved, then retracted — does the member's original request (the bid) come back
   to "open", or vanish?** *(Rec: return to open — the member's request isn't silently lost; they
   cancel it themselves if they no longer want it.)*
2. **Editing an approved absence's dates — whose action is it?** Today it can be edited scheduler-side.
   *(Rec: scheduler-side edit stays the one writer; a member wanting a different date re-bids. One
   clear writer per record.)*
3. **Medical certificate on retract — keep the document?** *(Rec: yes — append-only, keyed to the
   Input's id, never deleted on retract; it is history. The record just stops pointing at it.)*
4. **Timing vs the archive/return work ([RECALL]).** *(Rec: design/build one-record now; the
   "chapter / freeze / starting-balance" model sits cleanly on top later and needn't block this — an
   Absence simply gains a chapter owner when RECALL lands.)*

## 9. Open questions (engineering — I resolve these; listed for the red-team)
1. **Does the war need ANY persisted cell for an approved absence, or pure projection?** Lean **pure
   projection** (like the roster), cached for render, reprojected on notify — removes the second copy
   entirely. Risk: any war feature that *writes* to an approved-leave cell (a hand note on an owned
   cell?) must move to the Input. Enumerate war writers to `raptor` cells before committing.
2. **How does a bid relate to its approved Absence across a date shift?** `bid.inputId` links them; a
   shift edits the Input; the bid keeps its `shiftedFrom` history. Confirm the link survives edit.
3. **Clash:** a member bids on a day they are already approved-absent → surface (as `SyncClash` does
   today), never overwrite. Confirm the projection makes the clash visible, not a silent no-op.
4. **Counters/balances read path** — confirm `leavewar/engine/counters` can read the projection with
   no perf regression (it reads `states` today; the projection must present the same shape).
5. **The FO/HO ↔ leave vocabulary partition** — with leave cells gone as stored records, confirm the
   OIL pass's "touch only FO/HO" reverse sweep still has a clean space (no shared stored map to
   partition; OIL keeps its own projected cells).

---

*Process: design (Opus, high) → dual cross-provider red-team (Codex + Fable) → fold → owner review.
No build until the owner approves §8 and the red-team converges. Model note: the reviewers are a
different model/provider from the author (Opus), per the owner's cross-provider rule.*
