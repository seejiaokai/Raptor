# ARCH-STACK step 4 — ONE absence record (design, Rev 2, 19 Sep 26)

Status: **DESIGN — round 2 of the cross-provider red-team (Codex + Fable). No code yet.**
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
| **OIL credit** | same | `state:'approved'`, `oil: true`, `note?` (the FO/HO reason) | `runOilPass` (generated) and `setCellNote` (manual reason) — unchanged behaviour, marker renamed from `source:'raptor'` (OA-006, FB-06) |
| **Absence** | **nowhere** — derived (§4) | `state:'approved'`, `inputIds: string[]`, `shiftedFrom?` | nobody; it is a read |

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
- **War resolution is outside `cellFor`** (FB-02, OA-004, §12-Q6 of Rev 1): the index files a
  (person, date) under `warHolding(wars, date)`; a date in no war shows on no war, and appears the
  moment a war covering it is created — because the next read computes it.
- **No roster filter** (FB-02.3, answers Rev-1 §12-Q3): cells exist for any person id; the matrix
  draws only roster rows. Finding H's "cells cleared on archive" goes away — the person's record is
  untouched, and restoring them shows it again.

### 3.1 Requests and absences on the same (person, date)

A request is the war's own record; an absence is the squadron's record of fact. At one address:

| Request there | Absence there | Displayed | Clash list |
|---|---|---|---|
| none | yes | the absence | — |
| yes | none | the request | — |
| same code | yes | the absence (the request is **consumed** by the filing — §5.2) | — |
| different code | yes | **the request** (today's behaviour: the war keeps what was bid) | the absence, as today's clash note |

The clash list is itself **derived** (`clashesOf`, computed on read, never stored — FB-02.4). When
the blocking request is refused, cleared or moved, the absence shows on the next read with no
trigger (OA-002). The invariant (§12) is stated over this table, not over "every absence is shown".

## 4. The merged view

### 4.1 The index

`absenceIndex`: `warId → personId → date → cell` (the `cellFor` output), built from INPUTS.
In memory only. Two maintenance paths:

- **Incremental, from the change stream.** An `onCommit` subscriber reads each envelope's
  `inputs/<iid>` Changes (the before AND after values are in the envelope — undo-contract §1.2) and
  invalidates the persons named by either. Restores and seeds emit envelopes too, so undo/redo and
  command-routed seeding are covered.
- **Signature fallback** (FB-02(a), FB-03): on every Raptor notify, a per-person signature of that
  person's off-type inputs (iid + dates + type + portion fields + `lwMoved`) is compared to the
  last build; a changed person is rebuilt. This catches every INPUTS mutation that does not pass
  through a command — boot hydrate, `initStore`'s seeding (`otherWeekInputs`, `seedDemoSans`,
  `seedDemoMedical`), the `yr` stamp, `installDemoWorld`, `remapPersonKeys` — so no call site has
  to remember anything. Cost: one pass over INPUTS (hundreds of rows) per notify; measured in the
  perf gate.
- **Full build** at `wireLeaveWarSync` start and after a storage reset.

### 4.2 The one read door

`getState()` (`leavewar/state/store.ts:951`) today returns the raw store state; every screen and
all the balance maths (`drawnFrom`, `balanceOf`, `takenOf`, `chargedDays`, `availabilityOf`,
`oiltracker`) read `grid`/`states`/`wars` through it. Step 4 splits it:

- `getState()` → the **merged** state: each war's `grid`/`states` (and the current war's top-level
  `grid`/`states`) = requests ∪ credits ∪ absence layer per §3.1. Screens and balance maths are
  unchanged.
- `rawState()` (module-internal) → requests and credits only. Every **writer** and the store's own
  `persist()` / `records()` / `capture()` / `write()` use it, so an absence can never be persisted
  or diffed into an `lw.*` Change.

Verified by Fable: `chargedDays` charges any non-refused cell and `availabilityOf` likewise, so a
request consumed into an absence at the same code moves nothing in any balance.

### 4.3 Performance — structural sharing (a named gate)

The Leave War grid's window engine and memoised `PersonMonth` rows rely on per-person object
identity (`docs/performance.md` §Leave War window engine). The merge therefore:
- caches the merged war per (raw war object, absence-index version for that war);
- reuses the raw per-person `grid`/`states` row objects untouched for any person with no absence
  cells, and reuses the previously merged row for any person whose raw row AND absence row are
  both unchanged since the last merge.

Gate: a scripted edit of one person's absence re-creates exactly one person's row objects
(identity test in vitest), and `npm run perf` DOM/interaction ceilings hold. If they don't, the
fallback is a per-war memo only — measured, not guessed.

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
| Approve request(s) | `lw.approve` | group selected requests into contiguous same-code same-portion runs per person → one Input per run (`lw` = war id, `lwMoved` from each request's `shiftedFrom`) → delete those requests |
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

`lw` provenance survives a remarks-only edit and any admin edit. **What a member's own date/type
edit of a war-approved leave does is the owner's call — §13 Q1.**

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
that address blocks it). Making OIL a read-time derivation too is a later item (it reads issued
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

Scenario (in the running app, the 16 Sep standing rule): a real week + the war; approve a 5-day
bid, delete its middle day on the war, undo, redo; file leave over a pending request; move an
approved leave after closing, undo, check the dotted mark; delete an `Other` landed input and
check the clash grade; each outcome eyeballed on the RIGHT day.

Gates: vitest, build, `tfin.js` 728/0, e2e, tracker smoke, `npm run perf`.

## 13. Questions for the OWNER (product, not technical)

1. **A member changes the dates of a leave the admin approved on the war.** Today it quietly
   becomes the member's own filing: locked on the war, no longer "approved on the war". Keep that
   (recommended — nobody approved the new days), or keep it as war-approved? (FB-07)
2. **A new absence covering an already-published day.** Today the published schedule's
   Unavailable list silently shows the new absence — no amendment count, no re-sign, no history
   line — because that list reads the live records, not the issued copy. Your 16 Sep rule says a
   filing on a published day is a pending amendment and the issued face stays frozen. This gap is
   older than step 4. Recommended: fix it as its own follow-up item right after step 4, not inside
   it. (FB-08)

## 14. Build phases (each gate-green before the next)

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
