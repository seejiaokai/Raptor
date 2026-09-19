# ARCH-STACK step 4 — ONE absence record (design, Rev 10, 19 Sep 26)

Status: **DESIGN — round 10 of the cross-provider red-team (Codex + Fable). No code yet.**
Rev 10 (§24): un-approving never overwrites a stored request; the one-contributor interim state is pinned.
Rev 9 (§23): the refusal discriminator, a failed journal rewrite stops the boot, conflict cells act per absence.
Rev 8 (§22): savepoints per pipeline, recovery obeys the selective reset, deferred effects drain fully.
Rev 6 (§20) made the all-or-nothing save exact; Rev 7 (§21) makes a refused command leave nothing
in storage and carries an unfinished recovery into the save queue. Later sections override earlier.
Rev 3 folded in Fable's round-2 findings (§16) and the owner's answers (§13). Fable APPROVED Rev 3
(§17) and Rev 4 (§18, with the round-4 items now in §19). **Later sections override earlier ones:
§19 over §18 over the body.** Rev 5's one big change (§19): a command's saves land all-or-nothing
in the storage seam, so the `consumedBy` workaround of §18 OA3-005 is withdrawn.
Branch `claude/db-step4-one-absence`. Own gated PR; nothing merges without the owner's
"merge live". Author: Opus 5 (high). Review transcript + dispositions:
`2026-09-19-arch-stack-4-one-absence-review-log.md`.

Read with: `2026-09-13-architecture-rootcause-plan.md` (RC2 + step 4), `docs/undo-contract.md`,
`2026-09-17-arch-stack-3-global-undo-design.md` (§2, §7 SEQ-004, §11, §13),
`2026-09-13-sync-delete-undo-integrity-spec.md` (findings A–J),
`2026-09-16-arch-stack-2-command-layer-review-log.md` CMD-010.

**What changed from Rev 1.** Rev 1 kept approved leave as a STORED cell on the war, written by
the absence command ("a stored projection"). Both reviewers (Codex OA-001/002/004/005, Fable
FB-01/02/03/04/05) broke it the same way: a war cell is a function of *several* absences at once
(AM + PM from two filings combine into one cell), and a stored copy must be re-built at a list of
moments (boot, war creation, a blocking request cleared, a half-finished save, roster gain) — miss
one and it silently shows the wrong thing. That list is the same fragility step 4 exists to remove.
**Rev 2 stops storing absences on the war at all: the war stores only what is its own (requests
and OIL credits); absences are DERIVED on read from the one record.** Most Rev-1 findings dissolve
with that change; the rest are folded in below (§14 maps every finding).

---

## 0. The problem in one paragraph

"X is away on 15 Jul" is stored **twice** today — as a Raptor **Input** (`INPUTS[]`, keyed by
`iid`) and as a **Leave War cell** (`war.grid[person][date]` + `war.states[person][date]`) — and a
diff engine (`sync.ts runOutbound` / `runInbound`) re-compares both piles on every notify,
blinded by a loop-breaker pair (`Input.lw` / `BidRecord.source`). The authority also flips with
provenance: a war-approved leave's truth is the war cell (the Input is a minted copy tagged `lw`);
a Raptor-filed leave's truth is the Input (the cell is a `source:'raptor'` copy). Every delete,
undo, edit or move is a guess about which copy wins — findings A, D, E, F, I, J — and the command
layer cannot record the ripple honestly: `retractLwRow` writes the war outside the input command's
enlisted set (CMD-010).

## 1. The decision

**An absence is ONE record — the Input — whatever screen created it. The Leave War stores only
its own records: leave REQUESTS (a member's bid and the admin's decision on it while undecided or
refused) and OIL CREDITS. Everything the war shows for an approved or filed absence is DERIVED on
read from the Input records, by id. Nothing copies an absence into the war; nothing copies a war
cell into an Input.**

1. **Approve is a command that writes the Absence.** Approving requests creates (or extends) an
   Input and deletes the requests, in ONE `user` envelope. Approved leave is never "a cell flipped
   to approved".
2. **The war's display = requests ∪ OIL credits ∪ the derived absence layer.** The absence layer is
   an in-memory index computed from INPUTS (§4). It is never persisted, so it can never disagree
   with the record after a reload, a half-finished save, a war being created, a request being
   cleared or a person joining the roster — each of those simply reads the record again.
3. **No reverse wire, no loop-breaker.** `runOutbound`, `runInbound`, `retractLwRow`, the ingest /
   withdraw mutators, `outboundToRaptor`, `BidRecord.source` and the `lw`-as-blindness rule are
   deleted (§6). `Input.lw` stays, as provenance: "approved in war W".
4. **Undo is exact for free.** The envelopes hold only real records — Inputs, requests, OIL
   credits. Approving five days records five request deletions + one Input put; undo replays those
   before-images through the existing `write()` seams (undo-contract §3). There is no projected
   cell to double-write on a restore, because there is no projected cell. CMD-010 closes: the leave
   effect is the Input itself.

### 1.1 Why derived-on-read and not the Rev-1 stored copy

| Concern | Rev 1 (stored copy) | Rev 2 (derived on read) |
|---|---|---|
| AM + PM from two absences | one cell, one `inputId` — cannot represent (OA-001/FB-01) | the index computes each (person, date) from ALL covering absences, `inputIds[]` |
| Boot, new war, cleared request, roster gain | needs a rebuild trigger each (OA-002/004, FB-02) | nothing to rebuild — the next read sees it |
| Half-finished save, then reload | the two blobs disagree forever (OA-005) | no second blob; the Input is all there is |
| Projected cells persisted mid-reducer on a refused command (FB-04) | real | no LW write for an absence at all |
| War notify firing mid-reducer (FB-05) | real | no LW write for an absence at all |
| Leave balance maths | untouched | untouched — `chargedDays`/`availabilityOf` read `grid`/`states` through `getState()`, which serves the merged view (§4.2) |
| Dataverse ownership (data-model §8) | LeaveBid copy derived from the feed | cleaner: `LeaveBid` = requests + credits only; the war READS `inputs/leave` as an API view — cross-module reads are exactly what §8 allows |
| Render performance | untouched | the cost moves to the merge — solved by per-person structural sharing (§4.3); a named perf gate |

---

## 2. The records

### 2.1 Input (the one absence record)

Current shape kept (`engine/schema.ts:148-185`). Changes:

| Field | Today | Step 4 |
|---|---|---|
| `lw?: string` | loop-breaker: "minted by the war, inbound skips me" | **provenance**: the war this absence was approved in. Rules in §5.4 |
| `lwMoved?: Record<iso, iso>` | — (was `BidRecord.shiftedFrom`) | **new.** Per covered date, the date it was shifted from by a closed-bidding move — so the dotted "moved" mark survives undo and edits (finding D) |
| all else | unchanged | unchanged |

### 2.2 Leave War records — three variants, one field decides

`BidRecord` (`engine/bids.ts:45`) becomes a tagged record. `source` is **retired**.

| Variant | Stored in | Fields | Who writes |
|---|---|---|---|
| **Request** | `war.grid` code + `war.states` record | `state: pending \| acknowledged \| refused`, `shiftedFrom?`, `note?` | members bid (own row, `canEditRow`), admin decides (`canDecide`) — today's `lw.edit` |
| **OIL credit** | same | `state:'approved'`, `oil: 'auto' \| 'manual'`, `note?` (the FO/HO reason) | `runOilPass` (`auto`) and `setCellNote` / direct FO-HO entry (`manual`) — unchanged behaviour; replaces `source` (OA-006, FB-06, OA3-003) |
| **Absence** | **nowhere** — derived (§4) | `state:'approved'`, `inputIds: string[]`, `shiftedFrom?` | nobody; it is a read |

A **request** may also carry `carried?: { remarks: string; lwMoved?: Record<iso, iso> }` — written
by `lw.decideApproved` from the Input it un-approves, consumed by the next `lw.approve` of that run
— so refuse → reconsider → approve keeps the member's remark ("in Bali till 17 Jul") and the moved
mark. Leave only; medical is never un-approved, so documents never travel (FB2-06; replaces the
session-only `RETAINED`).

`readRecord` (store.ts:392) accepts the first two shapes; a stored record carrying `source`, or
`approved` without `oil`, is **rejected** (demo data is reset, §9 — reset, don't migrate). Because
`readRecord` rejecting a record rejects the whole war blob and re-seeds (FB-06), the reset in §9
must run first; a test pins that an old-shape blob is replaced, not half-read.

## 3. Where the absence layer comes from — `cellFor`

ONE pure function, the single statement of how absences appear on the war:

`cellFor(person, date, covering: Input[]) → { code, inputIds, shiftedFrom? } | { clash: Input[] } | null`

- `covering` = every live off-type Input (`isOffType` = leave ∪ medical) of that person covering
  that date. The body is today's `runInbound` `parts → desired` combine (`sync.ts:538-596`) moved
  in verbatim: AM + PM of the same type → full day; a full day subsumes a matching half; an
  un-representable pair lands AM and reports a clash; medical six-hour portion rule (`medRowPortion`)
  unchanged. Answers OA-001 / FB-01 — pinned by today's `sync.test.ts:190-209` cases, kept.
- **War resolution is outside `cellFor` AND outside the index** (FB-02, OA-004, FB2-03): the index
  is war-agnostic (`personId → date → cell`); the MERGE step (§4.2) files each date under
  `warHolding(rawWars, date)`. A date in no war shows on no war, and a war created later (by
  `createWar`, or replaced wholesale by `loadWars`) shows the absences it covers on its first merge,
  with no index change. The `onCommit` subscriber also drops the merge cache on any `lw.war` change.
- **No roster filter** (FB-02.3, answers Rev-1 §12-Q3): cells exist for any person id; the matrix
  draws only roster rows. Finding H's "cells cleared on archive" goes away — the person's record is
  untouched, and restoring them shows it again.

### 3.1 Requests and absences on the same (person, date)

A request is the war's own record; an absence is the squadron's record of fact. At one address:

| Stored record there | Absence there | Displayed | Clash list |
|---|---|---|---|
| none | yes | the absence | — |
| request / credit | none | the stored record | — |
| pending / acknowledged request, same code | yes | the absence (the filing consumed the request — §5.2; a leftover is dropped at merge) | — |
| pending / acknowledged request, different code | yes | **the request** (today's behaviour: the war keeps what was bid; only reachable when the request predates the filing) | the absence, as today's clash note |
| **refused** request, any code | yes | **the absence** — a refusal removes nobody, and the absence is fact (FB2-02; today a refused chip can hide a filed leave and count the person available — fixed) | — |
| OIL credit (was there first) | yes | **the credit** — today's behaviour; the OIL pass never places a NEW credit on an absence day (§7, §18 OA3-004) | the absence |
| — | two or more that cannot combine | the deterministic effective cell (§19 OA4-004) | every conflicting absence |

**New stored records never land on an absence day** (FB2-02). One module-internal read,
`absenceAt(person, date)` (from the index, no war walk), replaces every deleted `raptorOwns(...)`
occupancy check with the same meaning — "occupied by a filed absence": `setCell` (store.ts
~1966/1988), `setCellRange` (~2058), `setCells` (~2110), `setBidState`/`setBidStates` (~2147,
~2170 — an absence address routes to `lw.decideApproved`), `shiftBid` (~3221/3246),
`isMovableSource` (~3282), `moveProblem` (~3329-3343), `ingestDutyCreditImpl` (~3070-3081). So a
member cannot bid OL onto their own filed LL day, and a move cannot land a request on an absence.

The clash list is itself **derived** (`clashesOf`, computed on read, never stored — FB-02.4). When
the blocking request is refused, cleared or moved, the absence shows on the next read with no
trigger (OA-002). The invariant (§12) is stated over this table, not over "every absence is shown".

## 4. The merged view

### 4.1 The index

`absenceIndex`: `personId → date → cell` (the `cellFor` output), built from INPUTS. War-agnostic
(§3). In memory only. Maintenance:

- **Primary — the per-person signature, on every Raptor notify** (FB2-04.3: phase 8's legacy
  `notify` runs BEFORE phase 9's `onCommit` delivery, `commit.ts:253-254`, so this path always fires
  first). For each person, a signature over their off-type rows =
  `iid|type|date|endDate|yr|allday|half|s|e|lwMoved`, a row counted under its CURRENT `person` (a
  reassign changes both persons). Excluded, because `cellFor` ignores them: `acc`, `mod`,
  `remarks`, `oil`, `docIds`, `lw` (FB2-08). A changed signature rebuilds that person. This covers
  every INPUTS mutation, command or not — boot hydrate, `initStore`'s seeds, the `yr` stamp,
  `installDemoWorld`, `remapPersonKeys` — and every later one is followed by a Raptor notify
  (the `writeInputs*` epilogue, `loadWeek`, a restore's deferred reflow). Cost: one pass over
  INPUTS (hundreds of rows) per notify, measured in the perf gate.
- **Secondary — `onCommit`**: an envelope's `inputs/<iid>` Changes (before + after) invalidate the
  persons named; an `lw.war` Change drops the merge cache. Belt-and-braces; never the only path.
- **Full build** at `wireLeaveWarSync` start (after `installDemoWorld`), after the storage reset,
  and inside `loadWars`.

**The war repaints when the index changes** (FB2-04). Every Leave War screen subscribes to the LW
store version only (`useSyncExternalStore(subscribe, getVersion)`). Today an Inputs-page filing
reaches the war through `ingestFromRaptor`'s write, which bumps that version; with the write gone,
a changed index calls `rawNotify()` — a repaint, no persist, no envelope. Loop-safe: LW notify →
`reprojectRoster` (signature-guarded) → the pending-OIL signature (notifies Raptor only on change)
→ the index finds no input change → stops. **Order in the Raptor lane** (`sync.ts:1186-1195`):
`setViewer → reprojectRoster → refreshAbsenceIndex → lwSyncTurn(runPoArchive, runOilPass)` — the
index is fresh before the OIL pass reads the merged cell.

### 4.2 The one read door

`getState()` (`leavewar/state/store.ts:951`) today returns the module `state`. Step 4 makes it the
**only merge door**; the module `state` is never assigned a merged view:

- `getState()` → the **merged** state: each war's `grid`/`states` (and the current war's top-level
  `grid`/`states`) = stored records ∪ absence layer per §3.1, identity-stable per (raw `state`
  ref, index version) so `useMemo([version])` and `evaluatePeriod`'s identity memo
  (`Matrix.tsx:539-543`) keep their bail-outs.
- The module `state` stays raw — requests and credits only. Writers, `rawPersist`,
  `records()`/`capture()`/`write()`, `reconcile()`, `installDemoOil`, `remapPersonKeys`,
  `clearRaptorCell`, `setCellNote`, `loadWars` and the dormant legacy history all keep reading it,
  so an absence can never be persisted or diffed into an `lw.*` Change (Fable verified each).

**Readers of the module `state` that must move to the merged view** (FB2-01). The balance figures do
NOT go through `getState()` today: `figureCtxOf()` (store.ts ~2528) builds `sources: state.wars`
and is the one builder for the Matrix counter column, `CounterSheet`, `FiguresDrawer`, `OilTracker`
and `BalanceBar`; `setBalance` (~2676) calls `drawnFrom(state.wars, …)` directly. Both switch to
the merged wars — otherwise approved leave stops charging, USED reads 0 and "set balance to 20"
shows a different number. The build's first task is a complete audit: every read of
`state.grid`/`state.states`/`state.wars` in `leavewar/` classified as **writer/persist (raw)** or
**display/figure/validation of a new write against existing absences (merged or `absenceAt`)**,
recorded in the build plan, with a test per display/figure reader.

Verified by Fable: `chargedDays` charges any non-refused cell and `availabilityOf` likewise, so a
request consumed into an absence at the same code moves nothing in any balance — provided those
functions are handed the merged wars.

### 4.3 Performance — structural sharing (a named gate)

Corrected in Rev 3 (FB2-07): `PersonRow`/`PersonMonth` take `version` and the WHOLE
`grid`/`states` maps as props (`Matrix.tsx:283, 405`), so per-person row identity is not a React
memo input — every store change already repaints through them, exactly as today. What sharing buys
is the **cost of the merge itself**, which would otherwise copy every person's row on every version
bump (every bid keystroke). So the merge:
- is cached per (raw `state` ref, index version) — a view-only render pays nothing;
- reuses the raw per-person row objects for anyone with no absence cells, and the previously merged
  row for anyone whose raw row and absence row are both unchanged — bounding the work to the
  persons that changed.

Gate: **merge time per store change on the seed store — a measured number, reported**, plus the
existing `npm run perf` ceilings. The row-reuse identity test stays as a cheap unit pin, not the gate.

## 5. The commands

All ordinary `commit()` commands (undo-contract §2), one `user` envelope per gesture, registered
with `definePermission` (FB-09) and a `TYPE_PHRASE` in `undo/describe.ts`. None writes a projected
cell — so none needs the Rev-1 in-reducer projector.

### 5.1 The absence door

`absence.*` is not a new wrapper around each call site. The existing inputs commands
(`commitInputsWith` → `inputs.batch`, `sched-commit.ts:401`) already carry every Input write —
`commitNewInput`, the Inputs page's own `rowBody`/`unshift` (`InputsPage.tsx:453,511`),
`mintMedSegments`, `applyMedPlan`, `commitInputEdit`, `dropInputRow`, `reassignInput` (FB-03). They
stay the door; the change is deletions inside them: `retractLwRow` and `delete r.lw` go.

### 5.2 War commands

| Gesture | Command | Reducer (enlists `schedStore` + `lwStore`) |
|---|---|---|
| Approve request(s) | `lw.approve` | preflight each date against covering Inputs (§18 OA3-002) → group the rest into contiguous same-code same-portion same-remarks runs per person → one Input per run (`lw` = war id, `lwMoved` from each request's `shiftedFrom`, remarks from `carried`) → delete those requests; the whole command saves as one all-or-nothing group (§19) |
| Un-approve / refuse an approved day | `lw.decideApproved(state)` | shrink / split / remove the owning Input(s); re-create a request at exactly those dates with the chosen state (`pending`, `acknowledged` or `refused`) |
| Delete approved day(s) on the war | `lw.removeApproved` | shrink / split / remove the owning Input(s). **Deliberate delete propagates and sticks** (owner decision 2, 13 Sep 26) |
| Move approved day(s) | `lw.moveApproved` | shift the owning Input's dates (split for a sub-run); record `lwMoved` when bidding is closed (today's `biddingClosed` rule); `moveProblem` stays the one validation body |
| Request edits | `lw.edit` (unchanged) | bid / set / clear / move / note a request |

**Full transition table** (OA-007) — the decide sheet (`BidPicker.tsx:360-386`) may move a cell to
any state `canDecide` allows:

| From → To | pending | acknowledged | refused | approved |
|---|---|---|---|---|
| pending / acknowledged / refused (request) | `lw.edit` | `lw.edit` | `lw.edit` | `lw.approve` |
| approved (absence with `lw`) | `lw.decideApproved` | `lw.decideApproved` | `lw.decideApproved` | no-op |
| approved (absence without `lw`, or medical) | refused — display-only on the war (§5.4) | | | |

**No war write persists before the command is sealed** (FB2-05). `lw.approve` and a same-code
filing both delete requests inside an inputs-writing command that `runInputWrite` can still refuse
AFTER the reducer (`state/store.ts:147-172`). Today the nested branch of `persistNotify`
(store.ts ~1252) runs `rawPersist()` inside the reducer, so a refused command would leave the
request deletion in storage. Fix: in that branch keep `t.enlist(lwStore); LW_BASELINE = state`
inline and move the backend write to `cmdDeferEffect(() => locked(() => rawPersist()))` —
discarded on rollback, run at phase 8 on success; the inline `rawNotify()` is deferred the same way.

**One gesture = one envelope** (OA-003): every bulk entry point (`setCells`, `clearCells`,
`setBidStates`, `moveCells`, `shiftBid`) opens ONE outer `commit` before touching any cell, enlists
both stores, and runs request edits and absence edits as reducer helpers inside it. A mixed
selection (some requests, some approved) is one envelope. Partial skips keep today's
`{decided, skipped}` report; any refusal inside the reducer (a locked week) rolls the whole
gesture back and reports it.

**Filing over a request** (the Inputs page): a same-code request on a covered date is deleted in the
same `inputs.batch` envelope (the member's bid became real — needs `lwStore` enlisted in that
batch); a different-code request is left and the absence goes on the derived clash list. *(Today
this upgrades the bid to raptor-owned — finding F's root. There is no ownership to upgrade now.)*

**Splitting.** Removing or moving the middle of a five-day absence splits it: the first part keeps
the `iid`; the later part gets a fresh `iid` with `lw`, remarks, docs, its slice of `lwMoved`, **the
original `mod` verbatim** (so it is not falsely late), and inherits a `LATEOFF` forgiveness if the
original had one (FB-11).

**Locked weeks** (FB-12): `lw.approve` pre-checks `protectedDates()` against the selection and
reports "N days are on a locked week — not approved" in the sheet's own words, instead of the
scheduler's toast.

### 5.3 Permissions

`lw.approve`, `lw.decideApproved`, `lw.removeApproved`, `lw.moveApproved` → admin (`canDecide`
stage rules unchanged). `inputs.batch` → unchanged (member own / admin any). A joined helper runs
under its parent's permission (`commit.ts:316-324`). `mayReverse` is unchanged and correct (Fable
verified): an admin approval closure cannot be undone by a member; a member's own filing can.

### 5.4 Who may edit an absence on the war (no behaviour change)

Today a Raptor-owned cell is locked on the war and a war-approved leave is editable on both. Kept,
now read from the record: an absence cell whose every Input has `lw` is war-editable (admin); any
other absence cell, and every medical cell, is display-only on the war ("filed on the Inputs page").

`lw` provenance survives a remarks-only edit and any admin edit. **A member's own date / type /
person edit of a war-approved leave clears `lw`** (owner, 19 Sep 26 — §13 Q1): the cell stays
green (approved) and gains the blue left edge the war already uses for "Filed on the Inputs page —
change it there, not here" (`matrix.css .c.raptor`, `Chrome.tsx:471` legend); from then on it is
changed on the Inputs page. This is today's visible behaviour, now produced by one record instead of
a withdraw-and-re-mint. The `.raptor` class is kept for the edge; it is driven by `lockedOnWar`.

## 6. What is deleted

| Seam | Fate |
|---|---|
| `sync.ts runOutbound`, `desiredRuns`, `runSig`/`rowSig`, `OUTBOUND_PENDING`, `RETAINED`/`priorRemark`/`priorLoose` | deleted |
| `sync.ts runInbound` (forward write + reverse sweep) | deleted — its combine body moves into `cellFor` |
| `sync.ts retractLwRow` + its calls in `commitInputEdit` / `dropInputRow` | deleted |
| `store.ts ingestFromRaptor`, `withdrawLeaveCell` | deleted |
| `store.ts clearRaptorCell`, `ingestDutyCredit` | kept, OIL only, keyed on `oil:true` |
| `raptor.ts outboundToRaptor`, `bids.ts raptorOwns`/`sourceOf` | deleted; every reader re-pointed (FB-06): `oiltracker.ts:209` → `rec.oil`; `Matrix.tsx:199,475,3753,3986,4055` → `lockedOnWar(cell)` (§5.4); `sync.ts:947,973,988` → `rec.oil`; `reconcile()` (store.ts:839) keeps requests + credits only |
| `sync.ts leaveInputAt` | replaced by `inputIds` on the merged cell; the remarks sheet opens the Input whose portion matches the tapped half, else the first (FB-01.4) |
| `lwSyncTurn` / `LW_PROJ_PENDING` for the leave passes | shrinks to OIL + roster + archive |

## 7. OIL (FO/HO) — stays a stored, derived pass; one marker change

OIL credits come from the **published schedule** and acknowledged duty claims (`row.oil`), not from
absences. `runOilPass` stays; its cells carry `oil:true` instead of `source:'raptor'`, and its
clash rule ("a leave cell blocks a credit") reads the **merged** view (an absence or request at
that address blocks it) — including inside `ingestDutyCreditImpl`, which today re-reads the raw
cell and would otherwise write a credit onto an absence day (FB2-02.2). It runs after the index
refresh in the Raptor lane (§4.1). Making OIL a read-time derivation too is a later item (it reads issued
snapshots, so it touches the amendment engine) — filed in OUTSTANDING, not built here.

## 8. The landing (schedule side)

Off-type absences (leave, medical) never land a ground row (`acceptInput`'s `isUnavail` gate,
`slots.ts:366` — Fable verified), so the absence model does not touch the Ground Programme. Two
fixes the prior record defers here:

1. **`srcType` on the landed ground row** (1A follow-up (b)): `acceptInput` writes the input's
   type; `shiftHardGround` (`events.ts:84-98`) falls back to `row.srcType` when `inpById(row.src)`
   is gone, so an orphaned `Other` keeps its hard-clash grade. Correct the stale `schema.ts:223`
   doc (`src` is the iid, not `inpKey`).
2. **Off-week landings keep the refusal guard** (`landedOnUnloadedWeek`) — honest, live, and the
   guardrail-over-cascade choice.

**Dropped from Rev 1:** "`acc:'g'` fully derived" (FB-10). It is frozen into every issued
snapshot's filing fingerprint and read by `isAway` and `acceptInput`; nothing in the absence model
needs it. Global-undo §11's restore-time strip-and-reland stays as built.

## 9. Migration — reset, don't migrate (owner's dev-phase rule)

Bump `SCHEMA_VERSION` 3→4; the versioned reset already clears `inputs`, `weeks` and `leavewar`
together (`reset.test.ts`), so no ground row or filing fingerprint can cite a dead iid (Fable
verified). The demo world is re-seeded with the new shapes: absences as Inputs (with `lw` where the
demo shows war-approved leave), requests as requests, credits with `oil:true`. Seeding runs before
`installGlobalUndo` and before `LW_READY`, so it is raw on both sides and creates no undo entries
(FB-09); the signature fallback (§4.1) picks it up.

## 10. Undo and the command layer

- One gesture = one envelope = one undo step. Approve: N request deletes + Input put(s). Remove
  approved: Input put/delete (+ split's new Input). Move: Input put(s). Filing over a same-code
  request: Input put + request delete.
- Restores replay recorded Inputs and requests through `schedWriteRecords` / `lwStore.write`; the
  absence index updates from the restore envelope (§4.1). Reconciler fixpoint: a restore produces
  zero writes anywhere else.
- Existing collections (`inputs`, `lw.cell`, `lw.bid`) are reused, so `ingest`, `foldProjection`,
  `isEligible` need no change (Fable verified).
- Unblocks global-undo phase 6 (deleting the three dormant snapshot stacks, SEQ-004) — its own step
  after this one.

## 11. Data-model.md changes (why this is designed now)

- `Input`: `leaveWarId` becomes provenance ("approved in war W"); add `movedFrom` JSON (date→date).
  Remove "the sync loop-breaker: it must survive".
- `LeaveBid`: holds **requests** (`pending|acknowledged|refused`) and **OIL credits**
  (`isOilCredit`, `approved`). No approved-leave rows. `source` and the proposed `inputId` are
  dropped.
- §8: the two sync wires are replaced by **one read**: the Leave War reads `inputs/leave` (an API
  view the scheduler already exposes) and derives what it shows. Approval is the Leave War calling
  the scheduler's absence function, never writing the `Input` table — the shape `Person` changes
  already have.
- Diagram: `LEAVEWAR |o--o{ INPUT : "approved in"` (provenance); `INPUT |o--o{ LEAVEBID` removed.

## 12. Tests (written FIRST)

Machinery (vitest):
- `cellFor` table — today's `sync.test.ts:190-209` combine cases kept, plus full/AM/PM, medical
  six-hour rule, multi-day, cross-month, cross-war.
- **The invariant**, asserted after every command in the property tests: for every (war, person,
  date), the merged cell = §3.1 table applied to (stored request, `cellFor`); no stored record is an
  absence; every Input `lw` names a war that exists. A random sequence of file / edit / remove /
  approve / decide / move / undo / redo keeps it true.
- Exact before-image round-trip per command (N actions → N undos → N redos).
- Structural sharing: one person's edit re-creates exactly that person's row objects.
- A refused gesture (locked week) writes nothing to the Leave War backend journal and adds nothing
  to `commandStream` (FB-04 pin, still worth keeping).
- Regressions A, D, E, F, I, J — each a named test that fails on `main` first.
- The reviewers' scenarios: AM LL + PM OIL, remove one, undo, redo (FB-01); pending OL blocking a
  filed LL, refuse the OL → LL shows (OA-002); leave filed for dates in no war, then create the war
  → leave shows (OA-004); reload after an Input-only save → consistent (OA-005); Inputs-page form
  add and `mintMedSegments` segments both show (FB-03); split with an early `mod` → neither half
  late (FB-11).
- Round-2 pins: file a 3-day LL on the Inputs page → balance drops by 3, USED = 3, "set balance to
  20" reads 20, the OIL tracker lists an OIL absence (FB2-01); bid over own LL day refused, move a
  request onto an absence day → occupied, OIL pass over an absence day → no credit, refused OL on
  a filed LL day → shows LL and the person counts away (FB2-02); leave in a no-war year, then
  `createWar`, and `loadWars` → cells show (FB2-03); Inputs-page filing bumps the LW version exactly
  once with no `lw.*` envelope, a board keystroke touching no input bumps it zero times (FB2-04);
  an approve refused by `protectedTouched` leaves no `leavewar/wars` write in the backend journal
  (FB2-05); approve → refuse → approve keeps the remark (FB2-06).
- Fixture budget: the vendored Leave War suite and `engine/seed.ts` carry `source:` literals
  (e.g. `deciding.test.tsx`, `seed.ts:216-332`); the record reshape rewrites them in phase 2.

Scenario (in the running app, the 16 Sep standing rule): a real week + the war; approve a 5-day
bid, delete its middle day on the war, undo, redo; file leave over a pending request; move an
approved leave after closing, undo, check the dotted mark; delete an `Other` landed input and
check the clash grade; each outcome eyeballed on the RIGHT day.

Gates: vitest, build, `tfin.js` 728/0, e2e, tracker smoke, `npm run perf`.

## 13. Owner decisions (asked and answered 19 Sep 26)

1. **A member changes the dates of a leave the admin approved on the war** (FB-07). Owner: "Stay
   green but it has an input blue line at the left just like the input standard." → it stays
   approved-green, gains the blue "filed on the Inputs page" edge, and is changed on the Inputs page
   from then on (§5.4). Equivalent to today's visible behaviour.
2. **A new absence covering an already-published day** silently changes that day's published
   Unavailable list (FB-08, pre-existing — `html.ts:1515` reads live INPUTS on every face;
   `publish.ts:256-260` compares `acc` only). Owner: **its own follow-up, straight after step 4**
   — filed in OUTSTANDING as `[PUB-UNAVAIL]`; not built here.

One behaviour change is a bug fix, not a question (a one-line heads-up to the owner): a REFUSED
request no longer hides a filed absence on the war (§3.1).

## 14. Build phases (each gate-green before the next)

0. All-or-nothing group saves in the storage seam (§19) — whiteboard `transaction`, postman
   groups, `putMany` + journal + boot replay, phase-8 release wrapped — with its fault-injection
   tests. Independently useful; lands first so everything after it relies on it.
1. Tests + `cellFor` + the invariant checker (red on the regressions).
2. Record variants (§2.2), `lw` provenance + `lwMoved`, reset + re-seed.
3. The absence index + merged `getState()` / `rawState()` split + structural sharing + perf gate.
4. Delete `runInbound`/`retractLwRow`/ingest/withdraw; inputs commands consume same-code requests.
5. War commands (`lw.approve`, `lw.decideApproved`, `lw.removeApproved`, `lw.moveApproved`),
   one-envelope bulk entry points, delete `runOutbound` + the loop-breaker, re-point every `source`
   reader.
6. Landing `srcType` + OIL marker.
7. Docs (data-model.md, undo-contract.md, CLAUDE.md sync paragraph, feature-impact, HANDOFF,
   OUTSTANDING) → cross-provider code inspection → hold for "merge live".

Effort: M–L, several sessions.

## 15. Rev-1 findings → disposition

| Finding | Disposition in Rev 2 |
|---|---|
| OA-001 / FB-01 multi-absence cell | §3 `cellFor` over all covering absences, `inputIds[]` |
| OA-002 request/absence clash never re-shown | §3.1 derived display + derived clash list — no trigger needed |
| OA-003 bulk gesture = many envelopes | §5.2 one outer commit per bulk entry point |
| OA-004 war creation | dissolved — war resolution on read (§3) |
| OA-005 partial save, no recovery | dissolved — nothing stored to disagree (§1.1) |
| OA-006 / FB-06 OIL + manual credits vs "approved needs inputId"; `source` readers | §2.2 three variants; §6 every reader re-pointed |
| OA-007 incomplete transitions | §5.2 full table |
| FB-02 boot/war/clash/roster rebuild triggers | dissolved (derived); §4.1 signature fallback covers raw INPUTS mutations |
| FB-03 projector hook / missed write paths | dissolved — no projector; the inputs command is the door (§5.1) |
| FB-04 projected cells persisted before rollback | dissolved — absences never written to the war; test kept |
| FB-05 LW notify mid-reducer | dissolved for absences; war commands defer notify to the boundary (`cmdDeferEffect`) |
| FB-07 member edit and `lw` provenance | owner question §13 Q1 |
| FB-08 published-day Unavailable face | owner question §13 Q2 (pre-existing) |
| FB-09 permissions / phrases / seed origin | §5, §9 |
| FB-10 `acc:'g'` derived = scope creep | dropped (§8) |
| FB-11 split `mod` / `LATEOFF` | §5.2 Splitting |
| FB-12 locked-week approve wording | §5.2 Locked weeks |

## 16. Round-2 findings (Fable, on Rev 2) → disposition

| Finding | Disposition in Rev 3 |
|---|---|
| FB2-01 balances read raw `state.wars` (`figureCtxOf`, `setBalance`) | §4.2 both move to the merged wars + a full raw/merged reader audit as build task 1 |
| FB2-02 writers/affordances lose `raptorOwns` occupancy; credit/refused vs absence undefined | §3.1 extended table + `absenceAt` at every former `raptorOwns` site; §7 OIL Impl reads merged |
| FB2-03 index keyed by war misses later wars | §3 / §4.1 index war-agnostic; war resolved in the merge; `lw.war` drops the cache; `loadWars` full build |
| FB2-04 nothing repaints the war after an Inputs filing | §4.1 index change → `rawNotify()`; lane order fixed; signature path is primary |
| FB2-05 nested `persistNotify` persists before rollback | §5.2 backend write + notify deferred via `cmdDeferEffect` |
| FB2-06 refuse → approve loses the remark | §2.2 `carried` on the request |
| FB2-07 structural-sharing rationale wrong | §4.3 reworded; gate = measured merge time + perf ceilings |
| FB2-08 signature fields / full-build points | §4.1 spelled out |

## 17. Round-3 items (Fable APPROVED Rev 3 with these folded into the build)

- **FB3-01 — the drag-move must reach approved leave.** `isMovableSource` (store.ts ~3281) and
  `moveProblem`'s source loop (~3327) test `isBiddable` on the RAW grid, so an approved selection
  yields zero movers and the sheet offers no Move. Build: `isMovableSource` = raw request test OR
  (`absenceAt` is an absence whose every Input has `lw` AND `canDecide`); `moveProblem` accepts
  that source and excludes the selection's own absence sources from the landing check (a block can
  slide over itself); `moveCells` becomes the one-envelope dispatcher — request cells moved raw,
  absence cells via the `lw.moveApproved` helper. Tests: admin drags a 3-day approved block +2
  after close → one envelope, Input shifted, dotted mark on the landing days; a member's drag → no
  Move offered; a mixed selection → one envelope.
- **FB3-02 — the clash strip must be published.** `refreshAbsenceIndex` recomputes
  `LEAVE_CLASHES = clashesOf(merged)` (§3.1 row 4 only) after any rebuild and calls
  `publishClashes()`; the OIL pass keeps its half. Test: pending OL over a filed LL → strip lists
  it; refuse the OL → the strip empties with no other write.
- **FB3-03 — `carried` must survive storage and moves.** `readRecord` (store.ts ~385) is an
  allow-list: add `carried` (shape-validated). `shiftBid` / `moveCells` spread `carried` from the
  source record onto the landing record. Test: approve → refuse → reload → approve keeps the
  remark; refuse → move → approve keeps it.
- Copy: `BidPicker.tsx:339` and the `RaptorSheet` copy say "Filed on the Inputs page — change it
  there". Reducers read the module `state`, never `getState()`, so no merge is paid inside a loop.

## 18. Round-3 items (Codex, on Rev 3) → Rev 4 rules. WHERE THIS SECTION DISAGREES WITH AN EARLIER ONE, THIS SECTION WINS.

- **OA3-001 — actions target what is displayed.** Source actions (decide, refuse, clear, move,
  note) dispatch on the DISPLAYED record's variant (§3.1): a displayed request is acted on as a
  request (`lw.edit`) even when an absence lies under it; only a displayed absence routes to the
  `lw.*Approved` commands. `absenceAt` is for DESTINATION occupancy (a new write landing), never the
  sole source discriminator. Test: pending OL masking a filed LL → refuse the OL → the request is
  refused, the LL shows, the Input is untouched.
- **OA3-002 — approval preflights overlaps; `cellFor` never drops a conflict silently.** Before
  consuming anything, `lw.approve` runs `cellFor` over (covering Inputs + the would-be Input) for
  every selected date: a different-code or same-portion conflict → that cell is SKIPPED and reported
  (`{decided, skipped}`), nothing consumed; the same code already approved → idempotent (the request
  is consumed, no new Input); a complementary half (AM approved, PM requested) → allowed and
  combines. `cellFor` returns `{clash}` for ANY two contributions it cannot represent together —
  including two full-day contributions, which today's body (`sync.ts:571-575`) keeps first-wins
  silently. The combine table is re-pinned, not copied blind.
- **OA3-003 — two kinds of credit.** The credit variant is `oil: 'auto' | 'manual'` (not `true`):
  `runOilPass` generates and cleans up only `auto`; `setCellNote`/direct FO/HO entry writes `manual`,
  which the pass never deletes; `oiltracker.ts:209` reads `oil === 'manual'` for the reason editor
  (`OilTracker.tsx:431`). `readRecord` validates the value.
- **OA3-004 — a credit that was there first keeps the cell** (today's behaviour: the leave went to
  the clash list). §3.1's "OIL credit + absence cannot arise" row is REPLACED by: stored credit +
  absence → **the credit is displayed; the absence goes on the clash list**. The OIL pass never
  PLACES a new credit on an absence day (merged check) and does its `auto` cleanup over the RAW
  credits, so an obsolete generated credit is removed whether or not anything covers it; a `manual`
  credit is never auto-removed. Undo of either is ordinary record replay.
- **OA3-005 — WITHDRAWN in Rev 5; superseded by §19 (all-or-nothing group saves). Kept below only
  as the record of what was tried.** Saves go out per storage key, each
  retried independently (`storage/postman.ts:45-82`), so an approval (Input + request) can land
  half-saved if the tab closes inside the save window. Rules, replacing "delete those requests"
  in §5.2:
  1. Approving (and a same-code filing over a request) does NOT delete the request; it marks it
     `consumedBy: <iid>` in the same envelope. The merge hides a request whose `consumedBy` names a
     live Input. If that Input never reached storage, the request is simply shown again after the
     reload — the member's bid is back, the admin re-approves. No loss.
  2. Removing / un-approving an Input deletes the requests it consumed in the same envelope (and
     `lw.decideApproved` re-creates requests with `carried`). A half-save here can leave a leftover
     request visible again — visible and correctable, never a silent loss.
  3. A boot tidy (seed origin, not an undo step) deletes consumed requests whose Input loaded, and
     clears a dangling `consumedBy` whose Input did not.
  4. The residual — an admin action not fully applied after a tab closed mid-save — is the storage
     door's transactional save, owned by ARCH-STACK step 5 (RC5, with [TRK-DISK]); recorded as a
     known limitation, not solved twice.
  Tests: backend fault injection (`MemoryBackend` failing `inputs/all` once, then `leavewar/wars`
  once) around approve, remove-approved, un-approve and same-code filing → after reload, no request
  and no absence is lost in any order.
- **OA3-006 — remarks are per contributor.** `carried` is a list, one entry per contributing Input
  per date: `{ portion, remarks, lwMoved? }[]`. Un-approving a cell that combined two Inputs keeps
  both; re-approval groups into one run only fragments whose remarks match, else mints one Input per
  distinct fragment. Tests: two adjacent same-code Inputs with different remarks, and an AM + PM pair
  with different remarks, each round-trip approve → un-approve → approve with both remarks intact.
- **OA3-007 — undo snaps to the right war.** `lw.approve` / `lw.decideApproved` / `lw.removeApproved`
  / `lw.moveApproved` set the envelope `scope` to `{ module:'lw', warId, dates }`; `undo-wire.ts`
  `snapView` selects `scope.warId` and lands the first of `scope.dates` when an envelope has no
  `lw.cell`/`lw.bid` change (`deriveContexts` maps it to the war, not the Inputs page). Test: move
  approved leave in war A, switch to war B, undo → war A, that date.

## 19. Round-4 → Rev 5: fix the half-save at its root; the `consumedBy` workaround is WITHDRAWN. THIS SECTION OVERRIDES §18 OA3-005 AND EVERY `consumedBy` MENTION.

**Why (guardrail-over-cascade).** OA3-005's `consumedBy` markers existed only to survive a
half-finished save across two storage keys. In one round they produced five new findings — Fable
FB4-01 (an Inputs-page delete resurrects the consumed bid), FB4-02, FB4-03, and Codex OA4-001
(un-approve after a boot tidy still loses both records) and OA4-002 (hidden records blocking moves).
A workaround that grows a finding per round is the wrong decision, so the decision is changed.

**The root fix — one command's saves land all-or-nothing.** Every durable write already reaches
storage through ONE whiteboard, ONE postman and ONE backend (`src/storage/`). Add, in that seam:
1. `Whiteboard.transaction(fn)` — the `set`/`delete` calls made inside `fn` are emitted as ONE
   grouped change instead of one per key.
2. The command layer releases phase 8 (the latched `persistAll`, the Leave War `rawPersist`, and
   any other store's persist) inside `wb.transaction(...)`, so one command = one group.
3. The postman sends a group as one unit (`backend.putMany(entries)`, an optional `Backend` method
   with a sequential fallback for a backend that lacks it), retries it as one unit with today's
   backoff, and lets a newer value for a key supersede the older within pending, as now.
4. `BrowserBackend.putMany` writes a single journal key (`raptor:__txn`, the whole group in ONE
   `setItem`), then applies each entry, then removes the journal. `loadAll` replays a journal it
   finds BEFORE reading anything, then removes it. A failed journal write applies nothing (the
   group retries whole); a crash or quota failure mid-apply is completed at the next boot. Memory
   backend: trivially atomic. `contractTests` gain the group cases.
5. This is the Dataverse shape too — a `$batch` changeset is the same all-or-nothing group. It
   pulls a narrow, real slice of ARCH-STACK step 5 ("transactional save") forward because step 4
   needs it; the rest of step 5 (record-oriented door, versions) stays there.

**Consequences for the design.**
- Approve **deletes** the requests it consumes (Rev 2/3 semantics); `consumedBy` is gone from §2.2,
  §3.1 and §5.2, and so are the boot tidy and the "leftover" row. FB4-01, FB4-02, OA4-001 and
  OA4-002 dissolve: there is no hidden record to resurrect, block a move or be lost.
- Un-approve, remove-approved, move-approved and a same-code filing are each one group: the Input
  change and the request change land together or not at all.
- Risk to carry: a group roughly doubles the bytes written for that command while the journal
  exists (a near-full browser store could refuse the journal and retry — the save status shows
  "failed" rather than half-saving). Measured in the build; the storage-full behaviour is pinned.
- Tests: fault-injection on `putMany` (journal write fails; apply fails after entry k; process
  "dies" before journal removal) around approve, un-approve, remove-approved, move-approved and a
  same-code filing → after reload, the world is exactly before OR exactly after, never between;
  plus the existing postman/whiteboard/boot/contract suites.

**Other round-4 items, folded:**
- **FB4-01 (remaining half)** — every Input change, from ANY screen, keeps the requests consistent
  through the one inputs-command door (`commitInputsWith`, after `fn()`): a same-code request on a
  date an Input newly covers is deleted (the filing rule, §5.2). Nothing else is needed now that
  approval deletes requests outright.
- **FB4-03** — `readRecord` (store.ts ~385, an allow-list) validates and keeps `carried` as the
  list `{ portion: 'am'|'pm'|'full', remarks, lwMoved? }[]`, dropping a malformed entry, never the
  record. Test: a two-entry `carried` round-trips a reload byte-equal.
- **FB4-04** — widen `Scope` (`command/types.ts:55-62`) to `{ module:'lw'; warId; dates?: string[] }`;
  in `timeline.ts` `recordEntry`/`foldProjection`, an `lw`-scoped entry with no derived war context
  gains `{ kind:'war', warId }`; `snapView` falls back to `scope.dates[0]`.
- **OA4-003 — clashes are published whenever the war's stored records OR the absence index change**
  (not only on an index rebuild), from the merge step, with an equality guard so an unchanged list
  notifies nothing. The list covers every conflict class: a request over an absence (§3.1), a credit
  over an absence (OA3-004), and Input-vs-Input conflicts from `cellFor`. Tests: refuse a blocking
  request, remove a credit, file two conflicting absences — each updates the strip with no unrelated
  Input edit.
- **OA4-004 — a conflict still has a total, deterministic cell.** When `cellFor` cannot represent
  its contributions, it returns an effective cell AND the conflict: the displayed code is the first
  contribution in a fixed order (AM before PM before full-day, then earliest `iid`) — today's
  "lands the first, reports a clash" rule made deterministic; `inputIds` lists every contributor; the
  cell counts the person AWAY (safe for manning) and charges the displayed code; the remarks sheet
  offers each contributor; all conflicting Inputs go on the clash list. Tests: two full-day filings
  of different codes, and incompatible halves — pinned display, availability, charge and action target.

## 20. Round-5 → Rev 6: the group-save mechanics made exact. THIS SECTION OVERRIDES §19's MECHANICS (items 1–4) AND §19 OA4-004's ORDER.

Host-verified before deciding (the reviewers disagreed): `wirePersist` sets
`HOOKS.histPush = () => { push(); persistAll() }` (`state/persist.ts:137-138`) — `push()` defers the
undo snapshot, but **`persistAll()` runs immediately, inside the reducer** (`runInputWrite` calls the
hook at `state/store.ts:170`). Codex OA5-001 is right: "wrap phase 8" misses real persists. The
Leave War standalone branch (FB5-03), settings and people paths write inline too, and `commit.ts`
drains the latch twice (`:253`, `:255`).

1. **The group is the whiteboard's NET change over the whole command** (OA5-001). The outermost
   `commit()` opens `wb.transaction()` before phase 1 and closes it after the second latch drain.
   Inside it, `set`/`delete` update the map at once (readers see new values) but emit nothing; at
   close the whiteboard emits ONE group = every key whose value differs from its value when the
   transaction opened. A rolled-back command (whose restore re-persists the old world) therefore
   nets to an EMPTY group — nothing leaves the browser. In-reducer persists, both drains, settings,
   people, Tracker and Leave War writes are all captured without re-routing any of them. A nested
   `commit` joins the outer transaction; the hook is `setTxnWrapper` on `commit.ts`, installed by
   `wirePersist`, identity when unset (headless tests, parity harness). Writes outside any command
   (boot, legacy import, reset, seeds before `LW_READY`) stay single-key groups — idempotent, not
   step-4 transitions. The Leave War standalone branch still moves its persist to `cmdDeferEffect`
   (FB5-03) for undo-snapshot hygiene, but correctness no longer depends on it.
2. **The postman sends one group at a time, in order, and merges instead of superseding**
   (OA5-002). State: at most ONE group in flight + ONE accumulating pending group. A new group from
   the whiteboard merges into pending (latest value per key wins — the merge of consecutive net
   changes is itself the net change, so it is always a consistent world). When the in-flight group
   succeeds, pending (if any) is sent after the coalesce wait. When it FAILS, it is merged UNDER
   pending (pending's newer values win) and the result retries with today's backoff. No per-key
   parallel sends remain; `status`, `hasWork`, `flush` and the unload prompt keep their meaning.
3. **One journal, only ever replaced by a superset, removed only after full apply** (OA5-003).
   Because at most one group is in flight and a retry is always a superset of the failed group,
   `raptor:__txn` is either absent, or holds the group being applied, or holds a failed group
   awaiting its (superset) retry. A new journal overwrites the old only as that superset; the journal
   is removed only after every entry applied. Boot replays it (FB5-02: per-entry try; on failure keep
   the journal AND overlay its values onto the loaded snapshot so the app boots on the acknowledged
   world; a malformed journal is dropped). `putMany` is ONE synchronous block — `setItem(journal)`,
   apply all, `removeItem(journal)`, no `await` inside (FB5-01). Cross-TAB writers are out of scope:
   two tabs already clobber each other whole-record today, a known limitation owned by ARCH-STACK
   step 5 ([DB-STEP] two-tab safety); recorded, not solved here.
4. **No sequential fallback** (OA5-004). `putMany` is REQUIRED on `Backend`: Memory implements it
   natively, Browser via the journal; `contractTests` enforce atomic-or-recoverable group
   application (fail after entry k → reload shows before OR after, never between). A future backend
   (Dataverse `$batch` changeset) must meet the same contract.
5. **A conflict cell always counts the person fully away** (OA5-005). Order for the displayed code
   is today's (`sync.ts:586-589`): a full-day contribution beats a half; among halves, AM first;
   ties by earliest `iid`. The merged state record carries `awayFull: true` whenever `cellFor`
   reported a conflict. `availabilityOf` (`availability.ts:85`) gains the record as an optional
   argument and returns 0 when `awayFull`; its callers (`:216`, `:223`, `:266`) and
   `evaluatePeriod` pass the merged record. Charging stays on the displayed code only (today's
   behaviour — the other absence sits on the clash list). Tests: AM LL + full-day OIL → shows OIL,
   away, charges OIL; incompatible AM + PM → shows the AM code, away, both on the clash list.

Tests added: a real boot (`main.tsx` wiring, not an isolated command) where one Inputs filing that
deletes a same-code request produces exactly ONE postman group containing both keys, and a refused
command produces ZERO; overlapping commands and an undo before the coalesce timer fires → groups
merge, never split; G1 fails mid-apply, G2 arrives, the tab "closes" before the retry → reload
shows the world after G1∪G2 or after neither, never between. *(Corrected in Rev 7, §21.3.)*

## 21. Round-6 → Rev 7. THIS SECTION OVERRIDES §20 WHERE THEY DIFFER.

1. **A refused command leaves NOTHING in storage — by abort, not by assumption** (Codex OA6-001 +
   Fable FB6-01, converged). §20.1's premise "a rollback re-persists the old world" is false:
   `schedStore.restore` = `histRestore` (`sched-commit.ts:323`), which never persists;
   `lwStore.restore` (`leavewar/state/store.ts:1179`) and `restorePeople`
   (`people-settings-commit.ts:140-150`) only reset memory. (This is a live bug today too: a refused
   batch's mutation reaches storage until the next unrelated save.) Three changes, all required:
   a. `Whiteboard.transaction` returns a handle with `commit()` and `abort()`. `abort()` restores
      every key touched since open to its opening value (or deletes it, if it did not exist) and
      emits nothing.
   b. `dispatch` (`commit.ts:145-151`) opens the transaction when `phase === 'idle'` and closes it in
      its outer `finally`, AFTER `drainQueue()` (FB6-02 — so causally-chained projections drained
      there, e.g. an OIL credit woken by an approval's notify, land in the same group). It calls
      `abort()` when the outermost pipeline's result is `conflict | invalid | unauthorized |
      refused` (these return a result, not a throw — `commit.ts:240-244`), and on a throw from
      phases 1–6; it calls `commit()` otherwise, including when a phase-8/9 effect throws after the
      envelope was sealed (the command DID happen).
   c. Belt: `wirePersist` sets `HOOKS.histPush = () => { push(); if (!deferEffect(persistAll))
      persistAll() }`, so the scheduler's persist joins the deferred effects and a rollback discards
      it (this also stops serialising INPUTS twice per command); the Leave War standalone branch's
      persist moves to `cmdDeferEffect` as REQUIRED (FB5-03), not hygiene.
   Test (real `main.tsx` wiring): an Input write refused by `protectedTouched`, one refused by a
   stale `expectedRevs`, and one failing `guardCheck` (`commit.ts:395`) each leave every
   whiteboard value byte-equal to before and deliver ZERO groups to the postman.
2. **An unfinished recovery is carried into the new session's save queue** (OA6-002). If boot
   replay of `raptor:__txn` fails (§20.3), `loadAll` returns the journal's group alongside the
   snapshot; `bootStorage` (`storage/boot.ts:11-21`) hands it to the new `Postman` as its initial
   FAILED group. Status reads "failed" (never "saved") until it applies; it retries with backoff;
   every later write merges OVER it, so the next journal is always a superset of it. A storage reset
   (`resetPreSchema`, which runs before the postman exists) deletes the journal with everything else
   — a reset discards the old world by design. Test: replay fails at boot → an unrelated edit →
   reload → the recovered group AND the edit are both present; the save status showed failed until
   then.
3. **Fault-test expectation corrected** (OA6-002): G1 fails mid-apply, G2 arrives, the tab closes
   before the retry → after reload the world is **exactly after G1** if G2 never reached a durable
   journal, or **exactly after G1∪G2** if it did — never a mix, never before G1.
4. **Unload** (FB6-02): `flush()` on pagehide sends the pending group straight through `putMany`;
   safe because the browser backend's group write is synchronous. With a future asynchronous backend
   that gap is step 5's to close — recorded.

## 22. Round-7 → Rev 8. THIS SECTION OVERRIDES §21 WHERE THEY DIFFER.

1. **A savepoint per pipeline** (Codex OA7-001). `drainQueue` runs queued commands as separate
   pipelines and isolates their failures (`commit.ts:170-182`), and some writers still persist
   inline (`people-settings-commit.ts:203`, while `restorePeople` resets memory only). So the ONE
   whiteboard transaction per outermost `dispatch` stays (one delivered group), but every pipeline —
   the outermost and each drained one — takes a SAVEPOINT on entry (`wb.savepoint()` records the
   current value of each key as it is first touched after that point). A pre-seal rejection of that
   pipeline (`conflict | invalid | unauthorized | refused`, or a phase 1–6 throw) rolls the whiteboard
   back to ITS savepoint only, keeping the parent's and earlier siblings' writes. The outermost
   pipeline's rejection rolls back to the outermost savepoint = the §21 `abort()`. Tests: a
   successful parent followed by a rejected queued pipeline (both touching `people/all`, and touching
   different keys) → the group carries exactly the parent's values.
2. **Recovery obeys the SELECTIVE reset** (Codex OA7-002, sharpening Fable FB7-01). The storage reset
   clears only `inputs`, `weeks`, `leavewar` and keeps `settings`, `people`, `tracker`
   (`storage/reset.ts:32-34`). `bootStorage` order, each step durable before the next:
   a. `loadAll` replays the journal; on failure it returns the unfinished group.
   b. If a reset is due, FILTER the group: drop entries in reset collections, keep the rest. Write
      the filtered group back as the journal (or remove the journal if nothing is left) — BEFORE any
      reset removal runs, so an interruption can neither lose a preserved entry nor resurrect a reset
      one.
   c. Run the reset removals, then stamp the version.
   d. Seed the new `Postman` with the (filtered) group as its initial failed group; it retries and
      later writes merge over it (§21.2).
   `Backend` gains `writeJournal(group | null)` for step b (Memory: in-memory; Browser: one
   `setItem`/`removeItem`). Test: a journal holding a `tracker` entry and an `inputs` entry, replay
   failing, a version bump due → after boot and another reload, the tracker entry is present, the
   inputs entry is gone, the reset world is intact, no journal remains once applied.
3. **Every deferred effect runs, however deep** (Fable FB7-02). `releaseLatch` loops
   `while (txn.deferred.length)` with a bounded guard (8 rounds, then a console diagnostic and a
   final drain), because the scheduler's `histPush` now defers `persistAll` during phase 8. Test: an
   effect deferring another two levels deep → both run inside the same command's group.

## 23. Round-8 → Rev 9. THIS SECTION OVERRIDES §22 WHERE THEY DIFFER.

1. **Roll back on a RETURNED refusal, keep on a THROW** (Fable FB8-01). `runPipeline` returns
   `ok:false` for every phase 1–6 failure (`commit.ts:240-244`) but re-throws a phase 8/9 failure
   after the envelope is sealed (`:259`), which `drainQueue` also maps to `ok:false` (`:180`). The
   one discriminator, for the outermost pipeline and every drained one: a RETURNED `ok:false` → roll
   the whiteboard back to that pipeline's savepoint; a THROW out of `runPipeline` → the command
   happened → keep its writes. Test: a drained projection whose phase-8 effect throws keeps its keys
   in the group; one refused at phase 5 drops them and keeps the parent's.
2. **A failed journal rewrite stops the boot** (Fable FB8-02). If §22.2 step b's `writeJournal`
   fails, `bootStorage` rejects (the Retry screen), exactly as the reset's own delete/verify/stamp
   failures do (`reset.ts:53-58`); nothing after it runs, the store stays unstamped with the old
   journal intact. Test: step b throws once → boot rejects; next boot with space → filtered, reset,
   stamped, the preserved entry retried.
3. **Conflict cells are acted on per absence, never as a block** (Codex OA8-001). Two war-approved
   absences of different types can overlap (an admin date edit keeps `lw`, §5.4), making a conflict
   cell with several `inputIds`. On such a cell the decide/remove/move actions for approved leave are
   OFFERED ONLY PER CONTRIBUTOR: the sheet lists each absence (type, dates, remarks) and the admin
   picks which one to un-approve, remove or move; the others are untouched. A multi-cell selection
   that includes a conflict cell skips it and reports it ("N days hold two absences — change them one
   at a time"). `carried` therefore never has to hold more than one type per request. Test: approve LL
   and OIL on separate dates, admin re-dates one to overlap → the cell offers two separate absences;
   un-approve the OIL → reload → approve → the LL is untouched and the OIL comes back as OIL.

## 24. Round-9 → Rev 10.

1. **Un-approving never overwrites a request** (Codex OA9-001). `lw.decideApproved` (and
   `lw.moveApproved`'s landing) preflights the request it would create against the RAW stored record
   at that address: if a different request is already stored there (e.g. the OIL request left by
   un-approving one contributor of a conflict cell), the action is REFUSED for that date, the Input
   is left unchanged, and the sheet says which request must be decided first ("OIL request on 15 Jul
   — decide it before changing the LL"). A multi-date action reports those dates as skipped. Test:
   overlapping war-approved LL and OIL → refuse the OIL → refuse the LL → refused with the message,
   the OIL request and its `carried` intact; reload; undo/redo round-trips both steps.
2. **The interim state after un-approving one contributor is accepted and pinned** (Fable FB9-01,
   option a). After un-approving the OIL of an LL+OIL conflict cell, the cell shows the pending OIL
   request, the remaining LL goes on the clash list, and the person counts away (a pending request
   removes availability, `bids.ts:118-124`); the charged counter follows the displayed request until
   the admin decides it. §3.1 row 4 is reachable this way by design. Test asserts that interim state.

## 25. Round 10 — the LAST design round (owner, 19 Sep 26: "10 rounds is a long loop")

Design review is closed after round 10. Remaining corners go into the build and are checked at the
cross-provider CODE inspection, the full gates and the in-app scenarios. Future ARCH-STACK steps cap
design review at 3 rounds by default.

**Codex OA10-001 (MEDIUM), folded by the host with no further round:** after §24's refusal, the
blocking request can be hidden under the remaining absence with no way to reach it. Fix: the cell's
sheet lists EVERY record at that address — each contributing absence (§23.3) AND any stored request
or credit the merge is hiding — each as its own line with its own permission-checked actions; a
request line's actions address the stored request and leave the absence untouched. The §24 refusal
message links to that line. Test: overlapping approved LL + OIL → refuse OIL → reload → the sheet
lists the OIL request → decide or clear it → un-approving the LL now succeeds.

**Open owner question (asked 19 Sep 26): refuse overlapping leave on the same half-day?** If yes, the
inputs-command door (§5.1) refuses any filing or edit whose absence would overlap another leave or
medical absence of the same person on the same portion of a day (AM + PM of different types stays
allowed and combines as today), with a plain message naming the existing absence. That makes the
conflict-cell corner (§19 OA4-004, §20.5, §23.3, §24, OA10-001) unreachable by new actions; the
machinery stays as a defensive fallback. **Decision: pending.**
