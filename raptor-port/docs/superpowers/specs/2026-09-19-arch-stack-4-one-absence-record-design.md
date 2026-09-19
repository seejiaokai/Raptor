# [ARCH-STACK] Step 4 — ONE Absence Record — DESIGN (Rev 7, 20 Sep 26 — owner OIL ruling; build-ready pending a quick OIL re-check)

> **Status: Rev 7 — CONVERGED over four cross-provider rounds (Rev 6), then an owner OIL ruling
> (20 Sep 26) SIMPLIFIED §4.4.** Eight reviews (Codex/GPT-6 Astra high + Fable 5.1 ×4), **direction affirmed
> every time**, each round strictly narrower (structural → mechanics → edge cases → spec text). Round 4
> both REVISE-narrow and both said fold-and-build; Fable explicit: *"fold into Rev 6 and build; a further
> review round is not needed."* Rev 6 folds the last spec-text fixes, all pinnable by one test, no design
> change, no re-decision: (1) the absence guard runs AFTER the role/stage gates and before the stored-grid
> short-circuit (a member can't decide/drag their own war-approved leave — rt4-1/R4-002); (2) `oilLedgerFor`
> splits credits (stored `earned` grid+states, reason preserved) from debits (effective) — rt4-3/R4-001;
> (3) the duty/absence advisory is derived on every OIL pass, one producer — rt4-4/R4-003; (4) the
> bid-sheet balance preview + a few readers repointed; (5) the doc index + `docLink` write-through.
> **All six §8 owner decisions RESOLVED.** **OWNER RULING 20 Sep 26 (§4.4): an approved leave on a
> non-working day earns NO OIL — leave SUPPRESSES the credit (not just the display).** This SIMPLIFIES
> the design — it removes the `earned`-field/`oilLedgerFor`-split machinery the last two rounds built.
> One half-day sub-case left for the owner (§8.7). Because this touches balances (HEAVY), the OIL change
> wants a quick targeted re-check before build. **NEXT: confirm §8.7 + a quick OIL re-check, then BUILD
> (heavy, test-first) after the P2/P4 prerequisites. No code. Nothing merged.**

**Plan of record:** `2026-09-13-architecture-rootcause-plan.md` (RC2; step 4; SEQ-004).
**Builds on (DONE + live):** Step 1 stable ids, Step 2 command layer, Step 3 [GLOBAL-UNDO].
**PREREQUISITES (must land first — §10):** [SYNC-INTEG] **P2** (medical member-filed only) and **P4**
(clutter-only clear-data). **Feeds:** Step 5 [DB-STEP] (settles the Dataverse tables before freeze),
[RECALL].
**Related, settled 19 Sep 26:** the archive/return model — old leave history is **frozen, never
deleted**; a returning person gets a **starting balance number**, not a rebuilt record set (§8.4).

---

## 1. The problem, in one line
"Person X is on approved leave on 15 Jul" is stored **twice** — a scheduler **Input** and a Leave War
**cell** — and a background reconciler copies differences between them. Two copies + a guesser = every
delete/undo/edit/move is a guess about which wins. Root cause **RC2**; the fix is structural.

## 2. Current state (from three read-only code maps — accurate as verified by both reviewers)

### 2.1 The scheduler Input (`src/engine/`)
`Input` type `schema.ts:148-185`; array `inputs.ts:453`. Key fields: `iid` (stable id), `person`
(PEOPLE id), `date`/`endDate`/`yr` (labels not ISO), `type`, `remarks`, `mod`, `acc` (`g|u|r` landing
state), `lw` (war-source loop-breaker), `docId`/`docIds` (medical cert), `oil`. Lifecycle: file →
`writeInputsBatch`; an *activity* input auto-lands on the Ground Programme (`acceptInput`,
`slots.ts:344,422`) pushing a Ground row with **`src = iid`**; leave/medical/OD are `isUnavail` and
**never land** (`slots.ts:366`); edit = un-accept→edit→re-accept + `retractLwRow`; delete =
`removeInput`→`dropInputRow` (retract LW, un-accept, splice). **Off-week guard:** editing/deleting an
input whose ground row is on a *stashed* week is refused today (`inputedit.tsx:836-845`) because
`dropInputRow` can't reach stashed-week rows.

### 2.2 The Leave War copy (`src/leavewar/`)
War = `grid` (person→date→code) + `states` (`BidRecord{state,source,shiftedFrom?,note?}`,
`bids.ts:45-60`) + `period`, sparse. `source:'raptor'` = approved/owned elsewhere (the copy).
Remarks + cert live on the **Input**, not the cell; `note` is OIL-reason only. Roster is a boot
projection of `PEOPLE` (`raptorRoster.ts`), reprojected on notify — **the pattern one-Absence
extends to leave.**

### 2.3 The reconciler (`sync.ts`) — three passes
Outbound (LW→Raptor, mints `lw`-tagged inputs from approved non-raptor cells), inbound (Raptor→LW,
copies each non-`lw` leave/medical input day-by-day into `{approved,raptor}` cells via
`ingestFromRaptor`; `clearRaptorCell` GCs), OIL (published work→FO/HO, **derived, stays**). Loop-breaker
= outbound skips raptor-owned / inbound skips `lw` / OIL partitions by vocabulary. **The copy machinery
(`ingestFromRaptor`, `clearRaptorCell`, outbound splice/mint, `RETAINED`, `lw`, `source:'raptor'` on
leave) exists only to keep two copies in step.**

### 2.4 Command / undo (`src/command/`, `src/undo/`) — both BUILT + live
`commit`/`commitAs`/`commitProjection`; `Txn.enlist/child`; origin `user|remote|projection|restore|seed`
(only `user` is an undo entry; `projection` folds into its cause by `causedBy`, never its own entry);
`EnlistableStore.write(entries,{restore})`; conflict via `expectedRevs`. Undo = inverse-patch timeline;
a user action + its projection ripple fold into ONE closure (`resolveRoot`/`foldProjection`); publish
boundary enforced (`computePubBar`). **Input+leave undo already reverses together today** (retractLwRow
child-joins one envelope). **Deferred to THIS step:** the fully-clean form (one record); the orphaned
`Other` grade; the cross-week landing model. **NOT this step (GLOBAL-UNDO's own phases):** CMDLF-002
postouts rebuild, import-undo granularity.

## 3. The target model — ONE record, read by id (PURE PROJECTION)

The approved absence is **ONE record of truth: the Input** (`inputs/<iid>`). The Leave War **persists
NOTHING about an approved absence.** Concretely (Rev 4 — round-2 corrected):
1. **The war owns only bids and its period/config. There is NO request record** (Rev-4 simplification,
   fR2-3): an approved bid does **not** become a stored `{approved,inputId,…}` record — a states record
   whose grid cell is empty is deleted by `reconcile()` on reload. Instead the link + the moved-stripe
   live on the **Input**: reuse the existing **`lw: warId`** tag as *"approved on the war"* (its old
   loop-breaker meaning dies with inbound) and **add `shiftedFrom?` to the Input**. `approveBid` = delete
   the bid's grid/states cells + create the Input in one txn; the war stores nothing further.
2. **Stored vs effective grid — the load-bearing seam (fR2-1).** `state.grid`/`state.states` stay
   **STORED-only** (the writers' contract — every writer clones the person's row from them). `withCurrent`
   gains **derived** `egrid`/`estates` = `stored ∪ PROJ.get(currentId)`, recomputed whenever `PROJ`
   changes. **PROJ** (`Map<warId,{grid,states}>`) is held OUTSIDE `state.wars`, so `rawPersist`/
   `lwDecompose` never serialize a projected cell. **READERS** (guards, render, counters, OIL) read the
   **effective** fields; **WRITERS** stay on stored. A build-time assert in `lwDecompose` throws if any
   `lw.bid` has `source:'input'` — pinning "no persisted approved-leave cell" mechanically.
3. **Approve / retract / edit are COMMANDS** (§4.1); the reconciler's leave passes retire and become a
   **synchronous projection rebuild** (§4.3) — NOT an emitted envelope.
4. **OIL reads the effective view for DISPLAY but keeps its own ACCOUNTING data** (§4.4, fR2-4/R2-003).

**What this dissolves:** delete = delete; undo restores one record; move = retract + fresh bid;
remarks/cert can't be lost in a copy. Findings A/D/E/F become non-events. **Cross-week (finding I) is
NOT free** — the scheduler Ground rows in *stashed* weeks still need atomic cleanup (§4.5).

## 4. Mechanics (Rev 4 — both round-2 reviews folded)

### 4.1 The commands and the bid model (fR2-2, fR2-3)
Bids are date-keyed cells; adjacent approved cells merge into ONE multi-day Input (`desiredRuns`,
`sync.ts:173-201`) — **bid↔Input is many-days-to-one-record**; "retract one day of three" is a
**partial-span split**, not a whole delete.
- **`approveBid(bidSpan)`** — ONE txn: delete the bid's grid/states cells + create `inputs/<iid>` for
  the span, tagged **`lw = warId`** (= war-approved) with `shiftedFrom?` if moved. No stored request
  record.
- **`retractAbsence(iid | iid+dayRange)`** — deletes the Input (or **splits** it for a partial-span),
  preserving remarks on the survivors. **The bid VANISHES (owner §8.1 = B); there is NO return-to-open
  branch** (Rev-1 text struck — fR2-8).
- **`editAbsence(iid, patch)`** — edits the one record in place (a member editing their own leave via
  Inputs, §8.2 = B, is this). A war-side **drag** of an approved request (§8.5 = B) is **retract + a
  fresh PENDING bid at the new date at the Input's current dates**, as today — **no `moveAbsence`, no
  keep-approval path** (all `moveAbsence` references struck — fR2-8). Carry `remarks` onto the pending
  bid so a same-session re-approve doesn't lose them (fR2-7).
- **The war grid ops route by `warLinked` (fR2-2 — the discriminator that makes §4.1 and §4.2
  compatible):** `absenceAt()` returns `{iid, code, portion, warLinked, shiftedFrom?}`.
  **`warLinked===false`** (Inputs-filed leave) → the op is **REFUSED** exactly as `raptorOwns` refuses
  today (the war may not touch an Inputs-filed leave — §8.1 model). **`warLinked===true`** (war-approved)
  → the op maps to a command: `setBidState` refuse/un-approve → `retractAbsence` (+ bid back as
  pending/refused at current dates); `shiftBid`/`moveCells` → retract + pending; `setCell('')`/
  `clearCells` → `retractAbsence`. **`setBidState` must order the `absenceAt` branch BEFORE the
  `isBiddable(state.grid…)` short-circuit** (`store.ts:2164`), since the stored grid has no projected
  cell (fR2-4).

All commands take **ISO inputs** (never `baseYear()` labels — F-10) and call `inputProtected` first,
**refusing with a toast** on a protected week. Each emits a `user` closure the live timeline consumes.

**Per-day move provenance (R3-006):** `desiredRuns` merges adjacent cells by war/person/type/portion
(`sync.ts:187-197`), but `shiftedFrom` is per-DATE today, and `Matrix.tsx:476` consumes it per-day —
merging two adjacent approved cells where only the first was shifted would give one Input with one
`shiftedFrom` (both get a moved stripe, or the first loses its history). So **`approveBid` merges into
one Input only when provenance + remarks are lossless; otherwise it keeps them as separate Inputs** (or
retains per-day `shiftedFrom` on the Input). **The pending bid carries remarks in a NEW `BidRecord.remarks?`
field, NOT `note` (L4)** — `reconcile():839` keys duty-record retention on `!!record.note`. **On an
Inputs-side edit of a war-approved leave (L3): a span change drops `lw` → `warLinked` false (the war may
no longer touch it); a remarks-only edit keeps `lw`** — the existing `inputedit.tsx:925-927` rule, stated
so the guard is deterministic.

### 4.2 `absenceAt` — the effective view predicate (fR2-2, fR2-4)
`absenceAt(personId, iso): { iid, code, portion, warLinked, shiftedFrom? } | null` resolves from the
PROJ index (all covering Inputs). It replaces the retired stored `source:'raptor'` leave marker at
every guard/read, using the `warLinked` rule (§4.1) rather than a blanket refuse:
- Guards `setCell`/`setCellRange`/`setCells`/`setBidState(s)`/`isMovableSource` — the `absenceAt`
  branch (refuse-or-dispatch by `warLinked`) runs first.
- **Ordering (fM3, corrected by rt4-1/R4-002 — a role-gate bug):** the absence branch runs **AFTER the
  role/stage gates** (`canDecide`, `canEditRow`, `canEditCell`, `medBlocked`, `inSquadron` — none read
  the grid) and **BEFORE the first stored-grid read** (`isBiddable(state.grid…)`/`=== undefined`) in
  `shiftBid` (`store.ts:3219,3230`), `moveProblem` (`3321`), `setBidStates` (`2134`), `setCells`
  (`2106`), `setBidState` (`2160`). Putting it first (Rev-5 wording) would let a **member** decide/drag/
  clear their own war-approved leave out of window/stage — a roles-class break (HEAVY). The war-side
  `retractAbsence` carries the gate of the op it replaces; the new commands enforce equivalent
  role/stage/window checks; `moveProblem`/`isMovableSource` stay **read-only — validate, never dispatch**.
  Pin: member + projected approved leave → `setBidState`/`shiftBid`/`clearCells`/`moveProblem` all refuse.
- **Move destinations (fR2-4) validate POST-retract occupancy (R3-004):** `shiftBid`/`moveProblem` call
  `absenceAt(pid, to)` → `'occupied'`, but **exclude the selected contributor ranges the same txn will
  remove** (else a valid overlapping self-move, 13–15 → 14–16, refuses on its own cells); keep collisions
  with unselected survivors + unrelated Inputs.

### 4.3 The projection rebuild handler (fR2-5 — reshaped)
An `onCommit` subscriber, run **synchronously in the causing commit's delivery** (delivery is already
synchronous — queued items drain before `commit()` returns). On any envelope touching a leave/medical
`inputs/<iid>` — for **ALL origins** (`user`/`restore`/`seed`/`projection`) so undo/redo/boot recompute:
1. Invalidate the affected `(person,day)` cells from the **union of `Change.before` + `Change.after`**.
2. Rebuild those cells in `PROJ` from **ALL covering Inputs** (AM/PM aggregation, §4.6).
3. **Re-derive the effective fields** (`egrid`/`estates`, §3.2) and call **`rawNotify()`** — **NO
   envelope, NO `rawPersist`/`recordHistory`** (a projection envelope would carry zero changes and a
   persist would be a spurious backend write + LW snapshot — fR2-5).
4. **Clash strip (fM2), partitioned by vocabulary (rt4-4):** where a rebuilt PROJ cell overlays a stored
   `grid` entry with a different code, the handler emits into `LEAVE_CLASHES` via `publishClashes()` —
   BUT **only for a stored BID cell** (a member's pending bid under an Inputs-filed leave); it **SKIPS a
   stored FO/HO cell** — the OIL pass owns that duty-vs-absence advisory (§4.4), so one producer per cell,
   no double entry. `LEAVE_CLASHES` was produced only in the retiring `runInbound`, so without this the
   `Chrome.tsx:222-223` strip goes silent. The projected absence wins the effective cell; the stored bid
   stays stored (decidable once the absence goes).
- **War topology (R3-003):** the handler also fires on **`createWar`/war-restore/war-remove** (which
  touch the war collection, not Inputs — `store.ts:3488-3502`), rebuilding that war's PROJ from existing
  Inputs; the signature guard includes war-topology changes. (A leave filed before its war exists must
  populate on `createWar` — §7(h).)
**Boot:** run once in `wireLeaveWarSync` **after `remapPersonKeys`** (INPUTS hydrate before `lwInitStore`
— `main.tsx:51,58,69`). Change-guarded by a per-`(person,span)` signature (perf).

### 4.4 OIL — an approved leave SUPPRESSES the day's OIL credit (OWNER RULING 20 Sep 26)
**OWNER RULING (20 Sep 26): a leave on a non-working day is not a worked day, so it earns NO OIL.**
This SUPERSEDES Rev-4/5's "the credit still lands, leave wins the display only" and **REMOVES the
`earned`-field machinery** (fM1/R3-001/R4-001) the last two rounds built — there is no credit to keep
visible, so no split is needed. An approved absence on a day (`absenceAt` hit) **suppresses the OIL
credit for that day:** no FO/HO lands, and a credit already landed is **removed** when leave is added.
- `runOilPass`/`ingestDutyCredit`: **skip crediting a day where `absenceAt` hits**; the existing
  reverse-and-replace sweep clears an FO/HO the leave now suppresses. **Order-independent:** work-first →
  credit lands, then cleared when leave is added; leave-first → never credited — both end at no credit.
  (`ingestDutyCredit` already returns `'clash'` on a conflict — extend the conflict test to `absenceAt`,
  `store.ts:3074`.)
- **Display AND accounting agree trivially:** a leave day shows leave and counts no credit. No `earned`
  field, no `oilLedgerFor` split, no dual-source contract — the rt4-3/R4-001 complexity is dropped.
- **Consistent with [OIL]** (lock earned OIL on an already-WORKED day): a day actually WORKED earns +
  locks; a day on LEAVE earns nothing; [OIL] still governs the already-worked lock and the "didn't work
  it after all" amendment. This ruling is the forward case; [OIL] is the already-worked case.
- **The advisory** (a day the schedule would have earned OIL but the person is on leave) is optional
  information only — still derived on every OIL pass, one producer (rt4-4/R4-003), never a credit.
- `figureCtxOf`/`oilCreditBidAgainst` balance reads use `effectiveWars()`; the `landed` FO/HO check
  (`sync.ts:947`) stays STORED. No credit ever coexists with leave on a cell, so there is nothing to
  hide.
- **HALF-DAY EDGE — OWNER TO CONFIRM (§8.7):** a half-day leave + half-day *actual* work on a
  non-working day — does the worked half still earn (a half-day HO per the envelope), or does any leave
  that day suppress the whole credit? *(Rec: the worked half still earns — they did work it; but "any
  leave that day = no credit" is simpler. Your call.)*

### 4.5 Cross-week ground-row cleanup (ARCH4-001)
`retractAbsence`/`editAbsence` must clean the scheduler's working Ground rows in **every affected week,
incl. stashed weeks**, in one reversible txn (issued snapshots preserved), so no stale `acc='g'`/orphan
row is left — closing the orphaned-`Other`-grade case (§2.1). Until this exists the off-week guard
(`inputedit.tsx:836-845`) stays; §7 pins a real off-week `Other` scenario.

### 4.6 AM/PM aggregation + medical portions (ARCH4-006)
A projected cell records its **contributing Input id(s) + portion** (same-type AM+PM combine; incompatible
portions clash — `sync.ts:538-595`); a cell-level remarks/edit/retract targets the right portion's Input;
a two-contributor cell is not undercounted. The portion rules `rowPortion`/`medRowPortion` stay in the
composer.

### 4.7 Medical + certificate (§8.3; mechanism fixed for Rev 4 — fR2-6/R2-005)
Medical is member-filed only — **[SYNC-INTEG] P2 is a PREREQUISITE** (§10). **Certificates are
USER-MANAGED and NOT UNDOABLE (owner §8.3).** The Rev-3 "keep the blobs out of undo" was NOT enough: the
`docId`/`docIds` **link lives ON the Input** (`schema.ts:178-180`, written `inputedit.tsx:977-979`),
which IS undoable — so undoing an unrelated Input edit restores a stale/deleted certificate id, or the
write goes out-of-band and sets the sticky undo barrier that refuses earlier edits. **Rev-4 fix (move
the link OFF the Input, fR2-6):** the drawer row carries the owner. **The link is MANY-TO-MANY
(R3-002/L1)** — a split mints a NEW input `iid` (`inputedit.tsx:325-334,382-394`) that must still see the
original's certificate, so `DocRec { id, iids: string[], name, mime, size, blob }` (not one `iid`);
**`docsFor(iid)` = rows whose `iids` include it**; a split calls **`docLink(id, iid)`** (a non-undoable
cert op) to add the tail's id; `docFields`/`docId`/`docIds`-on-Input retire (all readers listed in the
review log). Add **`docDelete(id)`** which **deletes IndexedDB FIRST (await), then memory + repaint**
(L2 — memory-first resurrects on reload); on rejection keep the chip + toast (mirror `onDurableError`);
delete drops the row for ALL its owners, behind a confirm guard. Now a certificate op touches **no
command-layer record** → no undo entry, no barrier; an undone-then-redone input finds its paperwork by
`iid`; a permanent delete of a wrong file is truly gone. A new input mints its `iid` in the draft so an
upload links before save (**L5: the upload now binds IMMEDIATELY — Cancel no longer un-attaches; a
visible change, consistent with §8.3, state it in the UI**). (a cancelled
draft's orphan blobs are swept on cancel). `DocViewer.tsx:51` already null-guards → "no document".
**Perf (rt4-6):** `docsFor(iid)` as a filter over the drawer is O(docs) per row — maintain a
`Map<iid, id[]>` built at `docBoot`, updated by `docLink`/`docDelete`; **`docLink` must write-through
(`put`) to IndexedDB** or the link is lost on reload. Existing `DocRec` rows lack `iids` — covered by the
§5 reset. Split undo removes the tail Input but leaving its id in `iids` is harmless (redo re-links).

**OWNER RULING 19 Sep 26 — the mandatory-document rule is RELAXED (a SMALL STANDALONE change, not part
of step 4; SUPERSEDES the 27 Aug 26 "a medical input does not go in without its document").** Filing a
bare medical input must NOT hard-refuse — the rule is enforced in **TWO places** that must BOTH be
replaced or the Inputs-page form keeps refusing (fR2-9): `inputedit.tsx:567-569` AND
`InputsPage.tsx:366`. Instead, saving a
document-less medical input **prompts ONCE** — [Upload] or [**No document**]; "No document" files the
input with no certificate (for when the record genuinely isn't available). Kept unless owner says
otherwise: an entry that already HAS a document keeps the replace-not-strip guard; a bare entry stays
freely bare. **FOLDED INTO the [SYNC-INTEG] P2 medical batch (owner, 19 Sep 26)** — affects the five
certificate types **ATT C, ATT B, HL, OML, Up-chit**; not a step-4 item.

## 5. Migration — reset, not migrate (+ seed + drift guard — F-7)
Reset the demo world; no back-compat. **Also (F-7):** remove the two seeded `source:'raptor'` cells in
`seed.ts:223,332` (seed the matching Inputs if the demo needs them), and add **one drift-guard line to
`reconcile()`** that drops **both the grid CODE and its state record** for any stale approved-leave cell
(fR2-6/R2-006 — `reconcile()` today returns new States but KEEPS the grid, so a stateless `LL` cell still
removes availability + charges leave); or reject the obsolete stored world at the reset/version boundary.
This is a load guard the path already owns, not a migration. Invariant: after boot, no legacy
approved-absence grid contribution survives independent of an Input (stronger than "no `source:'raptor'`
marker").

## 6. Ecosystem walk (readers → effective; writers stay stored — fR2-1, fR2-4, R2-007)
**READERS** move to the derived effective fields (`egrid`/`estates`, §3.2) / `effectiveWars()`; **WRITERS
stay on stored `state.grid`/`state.states`.** The reader list (verified by both reviewers — Matrix render
read is `grid[p.id]?.[d.date]` at `Matrix.tsx:409`, NOT only the guard lines): `Matrix.tsx:198-217,409,
453,475-476,3069,3745,3757,3989-3995,4058-4066`; **`Matrix.tsx:4046`** (the bid-sheet `balanceOf`
would-this-go-negative preview reads stored `wars` at `:532` — under one-record it must read
`figureCtx.sources`/`effectiveWars()` or it stops warning on approved leave — rt4-2); **`Chrome.tsx:225`** (red-day summary via
`evaluatePeriod`) and **`CounterForm.tsx:177`** (rule preview) — MISSED in Rev 2/3, they read
`getState().grid/states` independently (R2-007/fR2-1); `charge.ts:145-148`, `availability.ts:216-266`,
`counters.ts:197`, `evaluate.ts:49-79`, `oiltracker.ts:201-213`. **`effectiveWars()`** feeds
`figureCtxOf().sources` (`store.ts:2525`), the balance WRITER **`setBalance`** (`:2664-2673` — else a
set-balance stores a wrong opening while the display shows the reduced value — ARCH4-007), and
`sync.ts:937-952`. FO/HO landed checks (`sync.ts:947`) correctly stay on stored. Period-only readers
(`WarSheet`, `createWar:3499`, `isNonWorkingISO:657`, `eventRowUsed:2452`) and boot-only stored writers
(`remapPersonKeys:1901`, `installDemoOil:1918`) are unaffected (PROJ builds after them — §4.3).
Scheduler surfaces (`isAway`, `inpShow`, the Ground row) already read the Input. **Undo focus must select
the WAR, not just a date (R3-005/fR2-10):** an inputs-only closure makes only a `page:inputs` context
(`derive.ts:57-73`) and `loadContext` selects a war only for a war context (`undo-wire.ts:77-83`) — so
delete a war-approved leave in war A, switch to war B, undo → it would focus an A date while B stays
selected. Absence commands must define BOTH context selection (derive the war from the command's Input
coverage / the `lw` tag) AND the focus date (label→ISO), selecting the war before focusing; specify undo
vs redo date.
`PersonMonth` row identity preserved for the perf memo. Perf: projection is data, not a render rewrite.

## 7. Testing (invariants + real-app scenarios)
- **Hard invariants:** exactly one Absence per approved absence; **no persisted war cell for approved
  leave** (only FO/HO + open bids persist) — pinned MECHANICALLY by the `lwDecompose` assert (throw if any
  `lw.bid` has `source:'input'` — fR2-1); a stateless stored grid cell for a leave code is a defect
  (fR2-6/R2-006: `reconcile()` must drop the grid CODE too, not just the state record); a retract leaves
  no orphan cell and no orphan Ground row (incl. stashed weeks).
- **Advisory:** effective war display == the Inputs-by-id projection; the Matrix, the red-day summary
  (`Chrome`) and the rule preview (`CounterForm`) AGREE after approve/retract/undo (fR2-1); OIL FO/HO
  correct after a leave retract; `setBalance` reaches the requested value with projected leave present.
- **Frozen:** issued snapshots + signatures unchanged.
- **Real-app scenarios (mandatory — `[[scenario-based-rule-testing]]`):** (a) member bids → approve →
  ONE input tagged `lw`, no stored `raptor`/`input` cell; (b) scheduler files leave → war shows it, no
  ingest; (c) delete → gone both places, no resurrection on next notify or reload; (d) undo → back once,
  war jumps to the day; (e) move an approved bid → old input gone, fresh pending bid at new date,
  remarks carried; (f) retract ONE day of a 3-day approval → split, other days stand; (g) **off-week**:
  delete a landed `Other` whose ground row is on a stashed week → cleaned, no orphan grade; (h) file
  leave, THEN create a war → populated; (i) OIL **both orders** (§4.4 ruling): leave-then-work-day
  AND work-day-then-leave → **NO OIL credit** either way (work-first: credit lands, cleared when leave is
  added; leave-first: never credited); (j) set a
  balance with projected leave present → correct opening, stable after undo/reload; (k) replace cert
  A→B, then undo an unrelated input edit → B stays, A not resurrected (fR2-6); (l) do (c) on a published
  day → silent, no AL (§8.6).

## 8. DECISIONS FOR THE OWNER (each has my recommendation)
1. **DECIDED (owner, 19 Sep 26) — VANISHES (option 1B).** Retracting a leave does NOT resurrect a
   war request. **Owner's model (load-bearing, informs 2/5/6):** the Leave War is the **bidding
   window** — while open, requests + approvals are the shared reference for all; once leave is
   approved and **published**, that phase closes and subsequent changes are made via the **Input
   section** (they reflect requests already agreed *outside the app*; any war-side change is
   communicated outside the app too). So a post-publish retract simply removes the leave — there is no
   war request to bring back. **This SIMPLIFIES §4.1:** `retractAbsence` deletes; no "return the
   request to open" branch. **Boundary to confirm:** *during bidding* (war still open), un-approving a
   bid still returns it to pending (ordinary bidding); the vanish rule is the **post-publish** path.
2. **DECIDED (owner, 19 Sep 26) — B (KEEP CURRENT):** a member can edit their OWN leave in the Input
   section even after approval; they cannot edit others' leave or reassign it (both scheduler-only —
   `inputedit.tsx:875,886`). Editing re-projects the war. No change from today; consistent with the
   §8.1 "changes via Inputs" model. Under one-record a member edits the one Input; the war re-reads it.
3. **DECIDED (owner, 19 Sep 26) — medical certificates are NOT UNDOABLE; the user manages them
   directly.** SUPERSEDES the old "append-only, never delete" stance (sync-spec decision 3) and my
   Rev-1/Rev-2 "keep + retrieval surface" framing. Rationale (owner): keeping every upload forever
   would POLLUTE the record with wrong screenshots; the correctly-uploaded ones are already viewable
   in the existing medical archive (`MedicalView`, Inputs page → "med"). The clean fix: certificate
   operations (upload / replace / **delete a wrong one** via the ✕) are **direct and permanent, kept
   OUT of the undo timeline** — which is safe precisely because the ONLY risk of deleting was the
   undo interaction ("did it come back?"), and the document blobs already live outside the command
   stream. So a wrong upload can be truly deleted (no pollution, no orphan) with no undo bug. Types
   carrying a certificate (confirmed by owner + `needsDoc`): **HL, OML, ATT B, ATT C, and the up-chit**.
   **Build:** a confirm-before-delete guard (so a correct cert isn't zapped by accident); a missing
   file renders "no document", never an error; there is NO "keep vs delete on entry-removal" rule —
   the certificate is user-managed. Retracting a medical entry does not auto-delete its certificate.
4. **DECIDED (owner, 19 Sep 26) — A: build one-record NOW; the [RECALL] chapter/freeze/starting-balance
   model sits on top later.**
5. **DECIDED (owner, 19 Sep 26) — B (KEEP CURRENT): a *moved* approved bid RETURNS TO PENDING.** Dragging
   an approved request to new dates drops it back to "requested" (needs re-approval), as today. Mapped to
   the command model: the drag `retractAbsence` (the old input goes) + a pending bid lands at the new
   date; NO `moveAbsence`-keeps-approval path is built. No behaviour change; less work.
6. **DECIDED (owner, 19 Sep 26) — A (KEEP CURRENT): a leave change on an already-published day is
   SILENT.** No amendment (AL) is created for a leave filed/changed/retracted on a published day — it
   updates the working copy quietly, as today (leave has no filing-delta). **This REMOVES the F-2
   amendment-machinery work** (`dayFilingFingerprint`/`filingDelta`/`computePubBar` for absences stay as
   they are). Consistent with the owner's model (post-publish leave changes are agreed + communicated
   outside the app). The undo publish-boundary itself is unchanged.

7. **DECIDED (owner, 20 Sep 26) — an approved leave on a non-working day earns NO OIL; leave SUPPRESSES
   the credit** (§4.4; supersedes the earlier "credit still lands" and removes the `earned`-field
   machinery). **STILL OPEN (owner to confirm): the half-day sub-case** — a half-day leave + half-day
   *actual* work on a non-working day: does the worked half still earn (a half-day HO), or does any
   leave that day suppress the whole credit? *(Rec: the worked half still earns; simplest is "any leave
   that day = none.")*

**ALSO DECIDED (owner, 19 Sep 26) — the relaxed mandatory-document rule (§4.7) is FOLDED INTO the
[SYNC-INTEG] P2 medical batch** (not a step-4 item), affecting the five certificate types: **ATT C,
ATT B, HL, OML, Up-chit**. Saving a bare medical input prompts once ([Upload] / [No document]); "No
document" files it with none.

## 9. Open questions (engineering — for round 3)
1. Consumer-list completeness — round 2 already added `Chrome`/`CounterForm` (fR2-1); round 3 confirms
   `egrid`/`estates` covers every reader and no writer accidentally reads effective.
2. Partial-span split (§4.1) — verify it preserves the edit-log and the Input's `shiftedFrom`.
3. OIL both-orders equivalence (§4.4) — verify the display-vs-accounting split gives identical balances.
4. `PersonMonth` row identity preserved under the effective fields (perf memo, §6).

## 10. PREREQUISITES + gate
- **[SYNC-INTEG] P2 (medical member-filed only — block medical creation on the war for ALL roles, incl.
  admin, and HIDE the war medical pickers: `store.ts:1983,2044,2096` still allow admin; `BidPicker`
  `medical` prop + `Matrix.tsx:3770 medical={role==='admin'}` still show them)** and **P4 (clutter-only
  clear-data)** must land first — step 4 retires the admin grid-medical outlet and must not let "Clear
  old data" erase the frozen leave history. **The relaxed mandatory-document prompt (§4.7, five cert
  types, TWO enforcement sites) is folded into this P2 batch.**
- **Gate — CLEARED for build.** owner answered §8 (all six) → 4 red-team rounds (Rev 1/3/4/5), each
  narrower, direction affirmed every time → **Rev 6 folds round 4 (this doc)** → **BOTH reviewers clear
  it for build with no further round.** Build = test-first, Opus, per-phase parity gates (`tfin` 728/0,
  vitest, e2e, tracker smoke), the mandatory RUNNING-APP scenarios (§7), post-build cross-provider CODE
  inspection, hold for "merge live". **PREREQUISITES first: [SYNC-INTEG] P2 + P4.**

---

*Process: design (Opus, high) → round 1 (Rev 1) → owner §8 → Rev 3 → round 2 → Rev 4 → round 3 → Rev 5
→ round 4 → Rev 6 (build-ready). Four rounds, both providers, all REVISE→converged. Reviewers are a
different model/provider from the author.*
