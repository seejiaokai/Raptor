# ARCH-STACK step 4 — ONE absence record (design, Rev 1, 19 Sep 26)

Status: **DESIGN — for cross-provider red-team (Codex + Fable) before any code.**
Branch `claude/db-step4-one-absence`. Own gated PR; nothing merges without the owner's
"merge live". Author: Opus 5 (high). Owner's instruction (19 Sep 26): read OUTSTANDING
[DB-STEP]/[ARCH-STACK], `architecture-direction.md`, `data-model.md`, `undo-contract.md`;
propose; red-team across both providers; then build.

Read with: `2026-09-13-architecture-rootcause-plan.md` (RC2 + step 4), `docs/undo-contract.md`,
`2026-09-17-arch-stack-3-global-undo-design.md` (§2, §7 SEQ-004, §11, §13),
`2026-09-13-sync-delete-undo-integrity-spec.md` (findings A–J), and
`2026-09-16-arch-stack-2-command-layer-review-log.md` CMD-010.

---

## 0. The problem in one paragraph

"X is away on 15 Jul" is stored **twice** today — as a Raptor **Input** (`INPUTS[]`, keyed by
`iid`) and as a **Leave War cell** (`war.grid[person][date]` + `war.states[person][date]`) — and a
background diff engine (`sync.ts runOutbound` / `runInbound`) photographs both piles on every
notify and copies differences, blinded by a loop-breaker pair (`Input.lw` / `BidRecord.source`).
Worse, **the authority flips with provenance**: a war-approved leave's truth is the war cell
(`source:'bid'`, `state:'approved'`, the Input is a minted copy tagged `lw`); a Raptor-filed
leave's truth is the Input (the cell is a `source:'raptor'` copy). Every delete, undo, edit or
move is therefore a guess about which copy wins — findings A, D, E, F, I, J — and the command
layer can't record the ripple honestly: `retractLwRow` writes the war *outside* the input
command's enlisted set (CMD-010), so an undo of an input delete cannot rebuild the approval.

## 1. The decision

**An absence is ONE record — the Input. It is the only authority for every absence, whatever
screen it was created on. The war cell for an approved/filed absence is a projection of that
record, keyed by its id, written ONLY inside the same command that changed the record. The
war's own records are REQUESTS (pending / acknowledged / refused bids) and nothing else.**

Consequences, each a direct read of RC2 ("approve/retract as commands, `bid.inputId`, the sync
becomes an event handler on the change stream, not a diff engine"):

1. **Approve is a command that writes the Absence.** Approving pending bids on the war creates
   (or extends) an Input and consumes the bids in ONE `user` envelope. It is no longer "flip the
   cell to approved and let a reconciler mint an Input later".
2. **The projector is an event handler, keyed by id, fed by before/after.** For each Input the
   envelope changed, `projectAbsence(before, after)` computes `cellsOf(before)` and
   `cellsOf(after)` (pure functions of the record) and writes only that difference to the war,
   as a joined child (`txn.child`) of the same command. It never scans the whole world, never
   reads another input, never decides ownership.
3. **The reverse wire disappears.** Nothing in the war ever writes an Input from a cell. There is
   no loop, so there is no loop-breaker: `Input.lw` stops being a blindness tag (it becomes
   provenance — "approved on the war, war id W") and `BidRecord.source` is retired.
4. **Every projected cell carries `inputId`.** A cell with an `inputId` is a projection; a cell
   without one is a request. Nothing else distinguishes them.
5. **Undo is exact for free.** Because the projection joins the envelope, the envelope holds the
   before-images of the Input AND its cells AND the consumed bids. Undo replays them through the
   existing `write()` seams (undo-contract §3). CMD-010 closes: the leave effect is inside the
   originating command's own inverse data, by construction.

### 1.1 Why the cell is a stored projection, not a pure read-time view (rejected alternative)

The purest form (RC2's "reads approved absences by id, never copies") would delete approved
cells from `war.grid` and compute an effective grid at read time from INPUTS. **Rejected for
this step**, for four measured reasons:

- **Balance maths reads the grid.** `engine/charge.ts chargedDays` walks `src.grid[personId]`
  and counts every counter-bearing cell whose state removes availability (pending AND approved).
  A read-time view means every balance path changes; a stored projection means none does.
- **Leave War render performance.** The grid's window engine and memoised `PersonMonth` rows
  rely on per-person object identity (`docs/performance.md` §Leave War window engine). A view
  recomputed on every Raptor notify would need structural sharing to avoid repainting ~7k nodes
  per edit — a performance project of its own.
- **Dataverse ownership.** `data-model.md` §8: a module writes only its own tables; Leave War owns
  `LeaveBid`. The approved cell as an `inputId`-carrying `LeaveBid` row derived by the owning
  module is exactly §8's shape (and §9's per-cell conflict unit). A pure view would put the war's
  display entirely on the scheduler's table.
- **Blast radius.** Only four files read `.grid` directly (`charge.ts`, `seed.ts`, `store.ts`,
  `sync.ts`); screens read through `getState()`. Keeping the stored shape keeps them untouched.

What makes the stored projection safe where today's copy is not: **one writer** (the projector,
inside the absence command), **one direction** (record → cell), **addressed by id**, and an
**invariant** (§6) that the war's projected cells always equal `⋃ cellsOf(input)` for live inputs.
A copy you can rebuild deterministically from the record at any moment is a cache, not a second
truth. *Red-team: attack this choice first.*

---

## 2. The record

The Input keeps its current shape (`engine/schema.ts:148-185`). Changes:

| Field | Today | Step 4 |
|---|---|---|
| `lw?: string` | loop-breaker: "minted by the war, inbound must skip me" | **provenance**: the war id this absence was approved in. Set by the approve command; kept across every edit (today an Inputs-page date edit deletes it — finding D's face). Drives today's editability rule unchanged (§4.4) |
| `lwMoved?: Record<iso, iso>` | — (lives on the cell as `shiftedFrom`) | **new.** Per covered date, the date it was shifted from by a closed-bidding move. Replaces `BidRecord.shiftedFrom` for approved leave, so the dotted "moved" mark survives undo and edits (finding D) |
| `lwNote?` | — | not needed: FO/HO notes are OIL's, not absences' (§5) |
| everything else | unchanged | unchanged — `iid`, `person`, dates, type, remarks, `mod`, `acc`, `oil`, `sans`, `docId(s)` |

`BidRecord` (`engine/bids.ts:45`):

| Field | Step 4 |
|---|---|
| `state` | requests only: `pending \| acknowledged \| refused`. A projected cell has `state:'approved'` and `inputId` — `approved` without `inputId` is **invalid** and dropped by `reconcile()` at load (demo data is reset, §7) |
| `source` | **retired** (the loop-breaker). OIL's FO/HO credits keep a marker of their own: `oil:true` (§5) |
| `shiftedFrom` | kept for **requests** moved while closed-but-undecided; for approved leave it lives on the Input (`lwMoved`) and the projector copies it onto the cell for display |
| `inputId` | **new.** Present ⇔ the cell is a projection of that Input |

`cellsOf(input)` — the ONE pure function that says which war cells an absence occupies:
`{person, date, code, portion, inputId, shiftedFrom?}` per covered date, for leave and medical
types only (`isOffType`), with today's half-day / six-hour portion rules (`sync.ts medRowPortion`)
moved in unchanged. Everything that today recomputes that mapping (`desiredRuns`, the inbound
`parts→desired` walk, `rowSig`/`runSig`) collapses into it.

## 3. The commands

All are ordinary `commit()` commands (undo-contract §2), enlisting `schedStore` + `lwStore`,
one `user` envelope each, authorised at the gate (`permissions.ts`), with the projector joining as
a child. Names are working names.

| Command | Where from | Reducer |
|---|---|---|
| `absence.file` | Inputs page, calendar, board add | today's `commitNewInput` body (mint `iid`, `mod`, auto-land) — then the projector writes its cells |
| `absence.edit` | Inputs page edit, remarks sheet, reassign (`iu:`) | today's `commitInputEdit` body **minus** `retractLwRow` and **minus** `delete r.lw`; the projector moves the cells |
| `absence.remove` | Inputs page delete | today's `dropInputRow` **minus** `retractLwRow`; the projector clears the cells |
| `lw.approve(cells)` | war sheet / batch decide, admin at closed or published (`canDecide`) | group the selected pending bids into contiguous same-code same-portion runs per person → one Input per run (`lw = war id`, `lwMoved` from each bid's `shiftedFrom`), consume the bids; the projector writes the approved cells |
| `lw.unapprove(cells)` | admin moves an approved cell back to pending / refuses it | shrink / split / remove the Input(s) owning those cells; re-create pending (or refused) request bids for exactly those dates |
| `lw.removeApproved(cells)` | war clear / `clearCells` / day-by-day delete on approved cells | shrink / split / remove the owning Input(s) — i.e. `absence.edit`/`absence.remove` under a war-side entry point. **Deliberate delete propagates and sticks** (owner decision 2, 13 Sep 26) |
| `lw.moveApproved(cells, Δ)` | `moveCells`/`shiftBid` on approved cells | shift the owning Input's dates (split where the selection is a sub-run), record `lwMoved` when bidding is closed (today's `biddingClosed` rule); `moveProblem` stays the one validation body |

Request-only war writes (`setCell`, `setCellRange`, `setCells`, `setBidState` to pending /
acknowledged / refused on a request, `setCellNote`) are unchanged `lw.edit` commands and never
touch an Input. A war writer handed an approved cell routes to the command above instead of
editing the cell (the one door).

**Splitting.** Removing or moving the middle of a five-day absence splits it: the first part keeps
the original `iid`, the later part gets a fresh `iid`, both keep `lw`, remarks, docs, and their
own slice of `lwMoved`. This is today's behaviour (runs re-mint), made explicit and deterministic.

**Clash.** Approving a request over a date where the person already has an absence of a different
code refuses that cell (today's `'clash'`); same code = nothing to do. Filing an absence on the
Inputs page over a date holding a pending **request** of the same code consumes the request (the
member's bid became real); a different code leaves the request and shows today's clash note.
*(Today this upgrades the bid to raptor-owned — finding F's root. After step 4 there is no
ownership to upgrade.)*

## 4. What is deleted

| Seam (from the code maps) | Fate |
|---|---|
| `sync.ts runOutbound` + `desiredRuns` + `runSig`/`rowSig` + `OUTBOUND_PENDING` + `RETAINED`/`priorRemark`/`priorLoose` | **deleted** — approval writes the Input directly |
| `sync.ts runInbound` (forward write + reverse GC sweep) | **deleted** — replaced by the projector |
| `sync.ts retractLwRow` + its calls in `commitInputEdit` / `dropInputRow` | **deleted** — the projector clears cells from the before-image |
| `store.ts ingestFromRaptor`, `withdrawLeaveCell`, `clearRaptorCell` (leave half) | **deleted**; the projector's `writeProjectedCells` is the one writer of `inputId` cells. `clearRaptorCell` survives only as OIL's FO/HO clear |
| `raptor.ts outboundToRaptor`, `bids.ts raptorOwns`/`sourceOf` | **deleted** (OIL uses `oil:true`) |
| `sync.ts leaveInputAt` (search by type+portion, lw outranks plain) | **replaced** by `inpById(cell.inputId)` — the remarks sheet opens the exact record |
| `lwSyncTurn` / `LW_PROJ_PENDING` coalescing for the leave passes | shrinks to OIL + roster only |

### 4.4 Editability (no behaviour change)

Today a Raptor-owned cell is locked on the war (you edit it on the Inputs page) and a war-approved
leave is editable on both. Kept exactly, now derived from the record instead of the cell's
`source`: a projected cell whose Input has `lw` set is war-editable (admin, `canDecide`); one
without `lw` (filed on Inputs) and every medical cell are display-only on the war. Member-filed
medical stays member-filed only (13 Sep 26); it projects onto the war for display, which today's
inbound wire already does.

## 5. OIL (FO/HO) — out of the absence model, one marker change

OIL credits are not absences: they are derived from the **published schedule** and acknowledged
duty claims (`row.oil`). `runOilPass` stays a derived pass this step (it reads issued snapshots,
not INPUTS' leave). Two changes only: its cells are marked `oil:true` instead of
`source:'raptor'` (the source field is retired), and its clash rule ("an owned leave cell blocks
a credit") reads "a cell with `inputId` blocks a credit". Turning OIL into a by-id projection of
issued snapshots is a separate, later item (it touches the amendment engine), recorded in
OUTSTANDING, not built here.

## 6. The landing (the schedule side)

The Unavailable / Personal-Inputs blocks are already **derived at render** from global INPUTS by
date (`html.ts:1515`) — nothing to change. The **Ground Programme landing** stays a stored schedule
row (it is the scheduler's row: timed, reorderable, amendable, frozen into issued snapshots, parity
728/0 depends on it) that **cites** the absence by id (`src = iid`, ARCH-STACK 1A). Three fixes
the prior record defers here:

1. **`srcType` on the landed row** (1A follow-up (b), Fable inspect #2). `acceptInput` writes the
   input's type onto the ground row; `shiftHardGround` reads `row.srcType` when the input is gone,
   so an orphaned `Other` keeps its hard-clash grade. `schema.ts:223` doc corrected (`src` is the
   iid, not `inpKey`).
2. **`acc:'g'` is fully derived** (global-undo §11, GU2-004, F7): stored only as the authored
   decisions `'u'`/`'r'`; "landed" is computed from the presence of a row citing the iid. The §11
   restore-time strip-and-reland code becomes unnecessary for `'g'` and is simplified.
3. **Off-week landings keep the refusal guard** (`inputedit.tsx landedOnUnloadedWeek`, finding I):
   editing/removing an absence whose ground row sits on an unloaded week is refused with "Load the
   week of …". Cascading an edit into another week's working copy — possibly a published day —
   silently is the riskier path (guardrail over cascade); the guard is honest and already live.
   *Red-team: is there any remaining path that orphans a ground row?*

## 7. Migration — reset, don't migrate (owner's dev-phase rule)

Demo data only. Bump `SCHEMA_VERSION` 3→4 and reset `inputs` + `leavewar` in the versioned storage
reset (as [SYNC-INTEG] did 2→3). The demo world is re-seeded **through the new commands**
(`absence.file`, `lw.approve`), so the seed itself exercises the path. No back-compat readers for
`source`, `approved`-without-`inputId`, or `lw`-as-blindness: `reconcile()` at load drops anything
of the old shape. Data-model.md is updated in the same PR (§9).

## 8. Undo and the command layer

- One user action = one envelope = one undo step: approve (bids consumed + Input + cells),
  remove (Input + cells + landed row), move (Input dates + cells + `lwMoved`).
- The projector runs as `txn.child` inside the reducer (undo-contract §1.3 "join in-reducer"),
  not as a phase-8 subscriber — so there is no queued `projection` envelope to chain, and a
  `restore` replays the cells from the recorded before-images instead of re-projecting. The
  projector must be a no-op on a restore (the before/after of the Input is restored AND the cells
  are restored; re-projecting would double-write). Proven by the reconciler-fixpoint test (§10).
- `mayReverse` is unchanged: approve/unapprove/move-approved are admin types; a member cannot undo
  them (finding C stays closed).
- This unblocks global-undo phase 6 (deleting the three dormant snapshot stacks, SEQ-004). That
  deletion is **its own step after this one**, not bundled here.

## 9. Data-model.md changes (the reason to design this now)

- `Input`: `leaveWarId` becomes provenance ("approved in war W"), not "derived from"; add
  `movedFrom` JSON (date → date). The note "the sync loop-breaker: it must survive" is replaced.
- `LeaveBid`: holds requests (`pending|acknowledged|refused`) and projections (`approved` with
  **required** `inputId`, derived by the Leave War module from the `Input` by id). `source` is
  dropped; FO/HO credits carry `isOilCredit`.
- §8: "the two sync wires become two derivations" is replaced by **one**: the Leave War derives
  approved/medical cells from `inputs/leave` by `inputId`. Approval is the Leave War calling the
  scheduler's absence function (`absence.file`), never writing the `Input` table — the same shape
  as `Person` changes going through one shell function.
- Diagram: `INPUT ||--o{ LEAVEBID : "projected as"`; `LEAVEWAR |o--o{ INPUT` stays as provenance.

## 10. Tests (written FIRST — test-driven, and the owner's scenario rule)

Machinery (vitest):
- `cellsOf` pure-function table (full/AM/PM, medical six-hour rule, multi-day, cross-month).
- Invariant `projectedCells(war) == ⋃ cellsOf(live inputs)` asserted after **every** command in
  the command-layer property tests; a random sequence of file/edit/remove/approve/unapprove/
  move/undo/redo keeps it true.
- Exact before-image round-trip per command (N actions → N undos → N redos).
- Reconciler fixpoint: a restore produces zero projector writes.
- Regressions A, D, E, F, I, J — each a named test that fails on `main` first.

Scenario (in the running app, per the 16 Sep standing rule): build a real week + the war;
approve a 5-day bid, delete its middle day on the war, undo, redo; file leave on Inputs over a
pending request; move an approved leave after closing and check the dotted mark survives an undo;
delete an `Other` landed input and check the clash grade; each outcome eyeballed on the RIGHT day.

Gates: vitest, build, `tfin.js` 728/0 (parity must not move), e2e, tracker smoke.

## 11. Build phases (each gate-green before the next)

1. Tests + `cellsOf` + invariant checker (red on the regressions).
2. Record changes (`lw` provenance, `lwMoved`, `BidRecord.inputId`, retire `source`) + reset.
3. The projector + `absence.file/edit/remove` (delete `retractLwRow`, `runInbound`).
4. `lw.approve/unapprove/removeApproved/moveApproved` (delete `runOutbound`, the ingest/withdraw
   mutators, the loop-breaker).
5. Landing fixes (§6) + OIL marker (§5).
6. Docs: data-model.md, undo-contract.md, CLAUDE.md sync paragraph, feature-impact, HANDOFF,
   OUTSTANDING; then cross-provider code inspection; then hold for "merge live".

Effort: M–L, several sessions.

## 12. Questions for the red-team (attack these)

1. Stored projection vs read-time view (§1.1) — is "one writer + invariant" really enough, or is
   there a write path to `war.grid` this misses (import, seed, `installDemoOil`, `reconcile`,
   roster re-projection clearing a posted-out person's cells, `clearHistoryData`)?
2. The projector as an in-reducer child: any path where an Input changes OUTSIDE a command that
   enlisted `lwStore` (boot hydrate, `loadWeek`'s `acc` clear, `autoAcceptSeedInputs`, the week
   stash) and so leaves the cells stale?
3. Roster re-projection (`reprojectRoster`) today clears an excluded person's cells and splices
   their inputs (finding H). Under one record, which side leads?
4. Splitting identity: first part keeps the `iid` — does anything (documents, OIL `row.oil`,
   landed ground row `src`, the late mark's `mod`) break when the later part gets a fresh id?
5. Published days: an approval / move that changes an absence covering a published day — does it
   need the "pending amendment on the working copy" treatment (16 Sep 26 rule), and does the
   Unavailable block on a published day read live INPUTS or the issued snapshot?
6. Multiple wars: a date belongs to at most one war (store refuses overlap) — does `cellsOf` need
   the war resolution, and what happens to an absence whose dates fall outside every war?
7. Anything in the prior record's step-4 list (global-undo §7/§11/§12, CMD-010, SEQ-004) this
   design fails to deliver.
