# [ARCH-STACK] Step 4 — ONE Absence Record — DESIGN (Rev 2, 19 Sep 26 — dual red-team folded)

> **Status: Rev 2 — cross-provider red-teamed (Codex/GPT-6 Astra high + Fable 5.1), both REVISE,
> both affirm the direction; all 7+11 findings ACCEPTED and folded (log:
> `2026-09-19-arch-stack-4-one-absence-record-review-log.md`).** Two findings surfaced **new owner
> decisions** the design cannot resolve (§8.5, §8.6). **GATE: this is decision-ready, not
> build-ready** — it branches on §8; after the owner answers, Rev 3 + a second red-team round run
> before any build. **No code. Nothing merged.**

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

The approved absence is **ONE record of truth: the Input** (`inputs/<iid>`). The Leave War **keeps no
persisted copy** of an approved absence. Concretely:
1. **The war owns only bids and its period/config.** An approved bid becomes a **request record**
   pointing at the Input (`bid.inputId`) — it no longer holds the leave dates as live `grid` cells.
2. **Approved absences are a PURE, in-memory PROJECTION** (§4.3): `PROJ: Map<warId,{grid,states}>` held
   **outside `state.wars`** (so `rawPersist`/`lwDecompose` never serialize it — F-5/ARCH4-004).
   `effectiveWars() = stored ∪ PROJ` is what every war consumer reads. No stored second copy ⇒ nothing
   to drift, GC, or guess; nothing to persist twice; the undo closure carries only the `inputs` change.
3. **Approve / retract / edit / move are COMMANDS** (§4.1) on the live command layer; the reconciler's
   leave passes retire and become a **synchronous projection handler** (§4.3).
4. **OIL stays a separate derived pass but is NOT "untouched"** — it reads leave through the new
   `absenceAt()` effective view instead of the retired stored marker (§4.4). Bids, the Ground-row
   landing, remarks + the cert all stay where they are.

**What this dissolves:** delete = delete (no demote/rebuild); undo restores one record; move moves one
record; remarks/cert can't be lost in a copy. Findings A/D/E/F become structural non-events.
**CORRECTION (ARCH4-001): cross-week (finding I) is NOT fixed for free** — displaying leave by id in
the war does not clean the scheduler's Ground rows in *stashed* weeks; that needs explicit atomic
cleanup (§4.5). The off-week guard stays until §4.5 lands.

## 4. Mechanics (rebuilt for Rev 2)

### 4.1 The commands and the bid model (F-1/ARCH4-002)
A war **bid** and an approved **Absence** are different things. Bids are date-keyed cells; a run of
adjacent approved cells today merges into ONE multi-day Input (`desiredRuns`, `sync.ts:173-201`) — so
**bid↔Input is many-days-to-one-record**, and "retract one day of a three-day approval" is a
**partial-span split**, not a whole-Input delete.

- **`approveBid(bidSpan)`** — ONE txn: create/confirm `inputs/<iid>` for the span AND convert the bid
  cells to a **request record** `{state:'approved', inputId, askedFrom, askedTo, shiftedFrom?}`; **remove
  the bid's live `grid`/`states` cells** (the displayed cell becomes the Input projection). Span
  identity is stable (a bidId over the asked span), so approval/refusal/move target it, not loose cells.
- **`retractAbsence(iid | iid+dayRange)`** — deletes the Input, or **splits** it (shorten/hole) for a
  partial-span retract, preserving remarks/links on the surviving parts; the linked request returns to
  **open at its asked dates** (owner decision §8.1) or is removed. One deliberate delete/split.
- **`editAbsence(iid, patch)` / `moveAbsence(iid, span)`** — edits the one record; the request record
  keeps `shiftedFrom`. **Whether a *moved approved bid* keeps approval or returns to pending is owner
  decision §8.5** (it changes a live 27 Aug admin feature).
- **The four admin grid ops on a projected cell are defined, not left to the old reconciler:**
  `setBidState` refuse/un-approve → `retractAbsence` + bid back to pending; `moveCells`/`shiftBid` →
  `moveAbsence` (or retract+pending per §8.5); `setCell('')`/`clearCells` → `retractAbsence`;
  `setCell(code)` over an approved cell → **refused as a clash** (`absenceAt` hit).

All commands take **ISO inputs, never `baseYear()` labels** (convert via `isoToLabel`/year-suffix as
`runOutbound` does — F-10), and call `inputProtected` first, **refusing with a toast** on a protected
week (F-10). Each emits a `user` closure the live timeline consumes.

### 4.2 The `absenceAt` effective view (F-3/ARCH4-005 — the load-bearing addition)
One predicate is the single source every non-render consumer uses:
`absenceAt(personId, iso): { iid, code, portion } | null` — resolves from the projection index (all
covering Inputs for that person/day). It replaces the retired stored `source:'raptor'` leave marker:
- Every `raptorOwns`-based guard that today blocks writing over approved leave —
  `setCell`/`setCellRange`/`setCells`/`setBidState(s)`/`shiftBid`/`isMovableSource`/`moveProblem`
  (`store.ts:1966,2053,2107,2141,2168,3220,3275,3322`) — becomes `absenceAt()!=null || raptorOwns()`
  (`raptorOwns` stays for FO/HO ownership only).
- `ingestDutyCredit` returns **`'clash'`** when `absenceAt` hits (leave wins over a would-be FO/HO —
  `store.ts:3061-3081`), so OIL never writes a credit onto an approved-absent day.
- The composer never overlays a projected leave onto a stored FO/HO cell — it emits a clash entry, so
  a cell shows exactly one code (F-3, F-11).

### 4.3 The projection handler (F-6/ARCH4-003)
An `onCommit` subscriber, run **synchronously inside the causing commit's delivery** (never deferred to
an idle `lwSyncTurn` — an orphan projection sets a sticky undo barrier and refuses the earlier undo —
F-6). On any envelope touching a leave/medical `inputs/<iid>`:
1. Invalidate the affected `(person, day)` cells from the **union of `Change.before` and `Change.after`**
   (so a delete, a shorten, a person/type change all clear the OLD coverage too — ARCH4-003).
2. Recompute those cells in `PROJ` from **ALL covering Inputs** (AM/PM aggregation, §4.6), as
   `{state:'approved', source:'input', iid}`.
3. Emit as `commitProjection` (origin `projection`, `causedBy = causalSeq`) so it folds into the user
   closure and is never its own undo entry.
Also re-projects on **war create/restore and boot hydration** (a leave filed before a war exists, then
`createWar`, must populate — ARCH4-003); change-guarded by a per-`(person,span)` signature so an
unrelated edit doesn't reproject a whole person (F-6 condition b, moot under pure projection but kept
as a perf guard).

### 4.4 OIL (stays a derived pass, reads the effective view)
`runOilPass` is unchanged in spirit but reads leave via `absenceAt` (§4.2), not the retired stored
marker; FO/HO credits keep their own `source:'raptor'` ownership + `clearRaptorCell`-equivalent (OIL
credits ARE genuinely war-owned derived cells). Precedence when leave and earned work cover one day:
**leave wins the cell display; the OIL credit is still computed for balance purposes per the [OIL]
worked-day rule** — the interaction with [OIL] is noted, not changed here.

### 4.5 Cross-week ground-row cleanup (ARCH4-001)
`retractAbsence`/`moveAbsence`/`editAbsence` must clean the scheduler's working Ground rows in **every
affected week, including stashed weeks**, in one reversible transaction (preserving issued snapshots),
so no stale `acc='g'`/orphan row is left — and the orphaned-`Other`-grade case (§2.1) closes because
the row and its Input go together. Until this atomic cleanup exists the off-week guard
(`inputedit.tsx:836-845`) stays; §7 pins a real off-week `Other` scenario.

### 4.6 AM/PM aggregation + medical portions (F-11/ARCH4-006, F-4)
A projected cell records its **contributing Input id(s) + portion** (same-type AM+PM combine to a full
day; incompatible portions raise a clash — `sync.ts:538-595`). A cell-level remarks/edit/retract action
targets the contributing Input for that portion; a two-contributor cell is not undercounted. The two
portion rules `rowPortion`/`medRowPortion` (`sync.ts:108-142`) stay in the composer.

### 4.7 Medical + certificate (F-4, F-9)
Medical is member-filed only — **[SYNC-INTEG] P2 is a PREREQUISITE** (§10), so the admin grid-medical
outlet is gone before step 4 retires the mint. The cert stays append-only in IndexedDB keyed to the
Input's `docId`/`docIds`; on retract the Input goes, the **document is not deleted** (decision 3). The
Rev 1 "a re-file can re-link" claim is **dropped** (no surface maps `docId`→person after the Input is
gone — F-9); an orphaned document is accepted.

## 5. Migration — reset, not migrate (+ seed + drift guard — F-7)
Reset the demo world; no back-compat. **Also (F-7):** remove the two seeded `source:'raptor'` cells in
`seed.ts:223,332` (seed the matching Inputs if the demo needs them), and add **one drift-guard line to
`reconcile()`** — drop any stored record whose `source==='raptor'` on a non-FO/HO code on load — so a
tester's un-reset browser can't reload a stale copy. This is a load guard the path already owns, not a
migration. Invariant test: after boot, no stored `lw.bid` has `source:'raptor'` on a leave/medical code.

## 6. Ecosystem walk (surfaces to repoint — F-5, ARCH4-007)
Every war consumer that reads `war.grid/states` reads **`effectiveWars()`** instead:
`charge.ts:145-148`, `availability.ts:216-266`, `counters.ts:197`, `evaluate.ts:49-79`,
`oiltracker.ts:201-209`, `Matrix.tsx` (`:199,475,3753,3987,4057`), `sync.ts:947`. **The balance WRITER
`setBalance`** (`store.ts:2664-2673`) computes opening from `drawnFrom(state.wars)` — it must use the
same effective selector, or a set-balance stores a wrong opening while the display shows the reduced
value (ARCH4-007). Scheduler surfaces (`isAway`, `inpShow`, the Ground row) already read the Input, so
they're unaffected. `PersonMonth` row identity must be preserved for the perf memo (reuse an unchanged
row reference — performance.md). Perf: projection is data, not a render rewrite; string builders
untouched.

## 7. Testing (invariants + real-app scenarios)
- **Hard invariants:** exactly one Absence per approved absence; **no persisted war cell for approved
  leave** (only FO/HO + open bids persist); a retract leaves no orphan cell and no orphan Ground row
  (incl. stashed weeks).
- **Advisory:** war display == the Inputs-by-id projection; OIL FO/HO correct after a leave retract;
  `setBalance` reaches the requested value with projected leave present.
- **Frozen:** issued snapshots + signatures unchanged.
- **Real-app scenarios (mandatory — `[[scenario-based-rule-testing]]`):** (a) member bids → approve →
  ONE input, no `raptor` copy, bid is a request record; (b) scheduler files leave → war shows it, no
  ingest; (c) delete → gone both places, no resurrection on next notify; (d) undo → back once; (e) move
  dates → one record moves, remarks/cert intact; (f) retract ONE day of a 3-day approval → split, other
  days stand; (g) **off-week**: delete a landed `Other` whose ground row is on a stashed week → cleaned,
  no orphan grade; (h) file leave, THEN create a war → populated; (i) OIL: approve leave on a weekend
  work day → clash, no double cell; (j) set a balance with projected leave present → correct opening;
  (k) do (c) on a published day → per owner decision §8.6.

## 8. DECISIONS FOR THE OWNER (each has my recommendation)
1. **Approved-then-retracted bid — request returns to "open", or vanishes?** *(Rec: return to open.)*
2. **Who edits an approved absence's dates?** *(Rec: scheduler-side stays the one writer; a member
   re-bids — but see §8.5 which governs the war-side move.)*
3. **Keep the medical certificate on retract?** *(Rec: yes — append-only, orphaned document accepted.)*
4. **Timing vs [RECALL].** *(Rec: build one-record now; the chapter/freeze/starting-balance model sits
   on top later.)*
5. **NEW — a *moved* approved bid (admin drags an approved bid to new dates, a live 27 Aug feature at
   closed/published): does it KEEP its approval (the absence just moves), or RETURN TO PENDING (today's
   behaviour — the old input is spliced and a pending bid lands at the new date)?** *(Rec: KEEP approval
   — `moveAbsence` edits the one record; cleaner and matches "one record moves." But this is a real
   behaviour change to a feature you use, so it's your call.)*
6. **NEW — an approved/retracted absence on an already-PUBLISHED day: a SILENT working-copy change
   (today — leave has no amendment path at all), or a PENDING AMENDMENT like an activity input?** *(Rec:
   make it a pending amendment for consistency with the published-day-input rule — but it's new
   machinery (`filingDelta` must count an absence-record change), so if you'd rather keep leave silent
   on published days for now, say so and I strike it.)*

## 9. Open questions (engineering — resolved in Rev 2, listed for the second round)
1. Pure projection is now the committed choice (§3, §4.3); the `PROJ`-outside-serialization contract
   and the ~10 repointed consumers are the build's spine — second round verifies completeness of the
   consumer list.
2. Bid↔Input cardinality + partial-span split (§4.1) — verify the split preserves the AL/edit-log and
   the request record's `shiftedFrom`.
3. Clash precedence (§4.2, §4.6) — the composed cell shows leave; the bid/clash surfaces via
   `LEAVE_CLASHES`/`Chrome.tsx:524` (unchanged surface).
4. Confirm `effectiveWars()` preserves `PersonMonth` row identity for the perf memo (§6).

## 10. PREREQUISITES + gate
- **[SYNC-INTEG] P2 (medical member-filed only)** and **P4 (clutter-only clear-data)** must land first
  (F-4, F-8) — step 4 retires the admin grid-medical outlet and must not let "Clear old data" erase the
  frozen leave history. These are the small guardrails already specced.
- **Gate:** the owner answers §8 (esp. 5 & 6) → Rev 3 folds the answers → a SECOND cross-provider
  red-team round → then build (test-first, Opus; per-phase parity gates; post-build cross-provider code
  inspection; hold for "merge live"). No build before that.

---

*Process: design (Opus, high) → dual red-team round 1 (Codex + Fable, both REVISE→folded) → owner §8 →
Rev 3 → red-team round 2 → build. Reviewers are a different model/provider from the author.*
