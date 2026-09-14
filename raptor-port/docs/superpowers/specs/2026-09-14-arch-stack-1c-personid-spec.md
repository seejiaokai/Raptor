# [ARCH-STACK] Step 1C — `who → personId` (the last piece of "stable ids")

**Status:** REVISED after cross-provider red-team (Claude + Codex, both REVISE →
dispositions in §12); owner confirmed the §6 reset. **Approved to build** on
`claude/arch-stack-1c-personid` off `main`, test-first on Opus 4.8 high;
independent cross-provider inspection of the final code; full gates; hold for the
owner's explicit "merge live". Parity-sensitive, foundational.

**Companion records:** `2026-09-13-architecture-rootcause-plan.md` (the backbone;
1C is RC3/ARCH-03 "identity is partial"), the 1A/1B specs
(`2026-09-13-trk-csid-*.md`) for the "renaming is a label change that moves
nothing" pattern this mirrors, and OUTSTANDING `[ARCH-STACK]` / `[TRK-CSID]`.

---

## 1. Goal (plain)

A crew slot that names a person by **callsign text** is fragile: rename the
person, or give an old callsign to someone new, and the stored text can point at
the **wrong body**. Give every person-reference on a schedule row the person's
**stable hidden id** instead, so a rename moves nothing and two look-alikes can
never cross — exactly what courses and syllabuses got in 1B.

## 2. The current model — two identity systems, unevenly used

Every `PEOPLE` entry is stored under an **opaque, stable, never-printed key**
(`bane`, `freak`, `p<ts>` for added people — `people.ts:50`,
`QualsPage.tsx:695`). `cs` is the display callsign on top of it
(`schema.ts:87-126`). That key is already the id that **almost everything** stores:

| Reference | Stores | Evidence |
|---|---|---|
| Flying seat `.p`/`.w` | **id** | `schema.ts:234`; seed `data.ts:9` |
| Duty row `.id` | **id** | `schema.ts:329`; `slots.ts:76,110` |
| Sim `.p`/`.w`/`.pax[]` | **id** | `schema.ts:305`; `slots.ts:77-79,111-116` |
| `row.more[]` overflow | **id** | `slots.ts:52-63` |
| INPUTS `.person` | **id** | `schema.ts:148`; `inputedit.tsx:1122` |
| SCHED sign-offs | **id** (→ cs on issued AL) | `publish.ts:615,622` |
| Leave War roster | **Raptor id** | `raptorRoster.ts:53,59`; `sync.ts:991,1002` |
| Tracker enrolment `pid` | **Raptor id** | `core.js:527,531` |
| Plan pucks `.ids[]` | **id** | plan.ts |
| **Ground `.who`** | **callsign string** (or id, from seed) | `slots.ts:80,117`; `html.ts:1380` |
| **Common-Programme (`allhands`) `.who`** | **callsign string** (or id) | `slots.ts:81,123`; `html.ts:1150` |
| Sim `.who` | free text (or id) | `slots.ts:57`; `html.ts:1355` |

So the seam is **three write sites** in `slots.ts` plus `renameCallsign`:

- `setSlotVal` ground branch writes `PEOPLE[id].cs` (`slots.ts:117`).
- `setSlotVal` allhands branch writes `PEOPLE[id].cs` into the array (`slots.ts:123`).
- `acceptInput` writes `PEOPLE[inp.person].cs` onto the landed ground row
  (`slots.ts:384`).
- `renameCallsign` (`slots.ts:549-572`) exists **only** to paper over the seam:
  it walks every DAY rewriting the callsign string on ground/allhands/sim rows.

## 3. The bug this closes

`renameCallsign` walks `DAYS` only (`slots.ts:566-570`). It does **not** touch
persisted snapshots — AL `snap.d`, `SCHED.orig`, parked drafts, or any
stashed/other week. So after a rename:

1. A published/issued day keeps the **old** callsign string on its
   ground/programme rows.
2. If that callsign is later given to a **different** person (the add path
   allows any free callsign — `QualsPage.tsx:694`), `nameToId` on that stale
   string now resolves to the **new** person.
3. The old record has silently **crossed** to someone else — in the exact
   place (issued/published history) that is supposed to be immutable.

Storing the stable id removes every step: the row holds `bane`, rename touches
nothing, and no new person can ever be `bane` (keys are minted unique and never
reused — `newId`/`p<ts>`).

## 4. The design

**Principle:** the personId is the **existing stable PEOPLE key**. 1C makes the
three string-writing sites store that key, and turns `renameCallsign` into a
pure label change. No new id space is introduced (see §8 for why not).

### 4.1 Write paths → store the id

- `setSlotVal` ground: `d.ground[i].who = id || ''` (was `PEOPLE[id].cs`).
- `setSlotVal` allhands: push/set `id` into the `who` array (was `PEOPLE[id].cs`).
  `whoSet`/`whoArr` are id-agnostic — no change.
- `acceptInput`: `who: inp.person` (was `PEOPLE[inp.person].cs`). Update the
  now-inverted comment at `slots.ts:377-381`.
- `fillSlot` empty-seat checks read `r.who`/`r.id` truthiness only — unaffected.

### 4.2 Read paths → **id-FIRST authoritative** (revised after red-team — BLOCKER)

**Both reviewers (Claude Finding 1, Codex PID-01) found the original "keep
`nameToId` as a harmless safety net" plan REOPENS the crossing bug**, because
`nameToId` resolves **callsign FIRST**, id only as fallback (`people.ts:276`),
and `addPerson` guards a new callsign only against existing *callsigns*, not
existing *ids* (`QualsPage.tsx:694`). So after 1C stores `who='bane'`, a
scheduler who **adds** a new person with callsign "Bane" sets
`ID_BY_CS['bane']=<new id>`, and `nameToId('bane')` then returns the new person —
crossing every row that seats Ranger, in issued history included. 1C would
*widen* the exposure from seed rows to every scheduler-filled row.

Resolution (do both):

1. **Read person-reference fields id-FIRST.** Where a stored `who` is now
   authoritatively an id, resolve `PEOPLE[who] ? who : nameToId(who)` — the id
   wins, `nameToId` remains only the residual-callsign fallback. Apply at
   `slotVal`/`rowCrew` ground+allhands (`slots.ts:56,80-81`) and every render/
   read consumer of ground/allhands `who`: `html.ts:1150,1380`,
   `board-html.ts:208,476`, `peek.ts:135,189`, and the `nameToId(g.who)` /
   `nameToId(nm)` matchers in `avail.ts` and `events.ts` for ground+programme.
   (A one small shared helper — `whoId(v)=PEOPLE[v]?v:nameToId(v)` — keeps the
   sites from drifting; this is the §Architecture "one function, never a second
   literal" rule.)
2. **Harden `addPerson` with the id-tolerant guard `renameCallsign` already
   uses.** Refuse a new callsign when `nameToId(cs)` (id-tolerant) resolves to
   any existing person, not only when `ID_BY_CS[cs]` exists
   (`QualsPage.tsx:694` → mirror `slots.ts:556-557`). This closes the add
   back-door; rename is already guarded.

Note: id-first does **not** close a person named identically to genuine free
text (e.g. adding a callsign "EXT SQN"); that residual is inherent to a field
that holds both text and person refs and is handled for sims in §4.4.

### 4.3 `renameCallsign` → label-only

Keep: the uniqueness guard (`slots.ts:556-557`), `p.cs = cs`, and the `ID_BY_CS`
remap. **Delete** the `DAYS.forEach` row-rewrite (`slots.ts:564-570`). Rewrite
the header comment to state the new invariant (rename moves nothing; rows hold
ids). This is the 1B `renCourse`/`renSyl` pattern.

### 4.4 Sim `.who` → **pure free text** (revised after red-team — Codex PID-02)

Sim `who` is **displayed** as free text (`html.ts:1355`, `board-html.ts:450` —
never a puck) but is still **resolved as a person** by `events.ts:406,418`,
`avail.ts:36,57` and `oil.ts:144` via `nameToId`. That split is a latent
inconsistency 1C must not inherit: with the seed's `who:'EXT SQN'` (`data.ts:26`),
adding or renaming a person to callsign "EXT SQN" makes that external-squadron
row start occupying the person's time — and it survives the storage reset.

Resolution: make sim `who` **pure free text** — remove person-resolution
(`nameToId(sim.who)`) from `events.ts`, `avail.ts` and `oil.ts`; sim crew is
**exclusively** `p`/`w`/`pax[]`/`more[]` (all already ids). Drop sim `who` from
`renameCallsign` entirely. Document it as free text in `schema.ts`.

**Parity-safe:** the seed's only sim `who` is `'EXT SQN'`, which `nameToId`
resolves to nobody today, so removing the resolution changes no compared byte
(verify with the gate). **Verify during build** that no existing test/fixture
relies on a person-valued sim `who`; if one does, narrow to a documented
boundary rather than silently changing its result.

### 4.5 Free-text and sentinels — preserved

`nameToId` returns undefined for genuine free text ("EXT SQN", "ALL PILOTS"), so
the renderers keep printing it verbatim (`html.ts:1355,1381`). The `ALL` /
`ALL AVAIL` sentinels resolve as ids already (`people.ts:132-138`) and are
unaffected. No behaviour change.

### 4.6 Added-person id hardening (small, aligned)

Switch `QualsPage.tsx:695` from `'p' + Date.now()` to `newId('p')`
(`newid.ts:13`) — collision-resistant across two adds in the same millisecond and
format-consistent with `rid`/`iid`. Opaque, never printed, no parity impact
(added people are not in the seed/reference). **Optional** — flag for red-team.

## 5. Parity invariant (the hard gate: `node reference/tfin.js` 728/0, `html.test.ts`)

**Claim: output is byte-identical whether `who` holds an id or a callsign.**

Why it holds:
1. The reference-parity harness reads `DAYS`/`INPUTS` **pristine from the seed**
   and never calls `setSlotVal`/`acceptInput` — so changing the write paths
   cannot move any compared byte.
2. The seed already stores **id-form** `who` (`data.ts:30` `who:'dj'`,
   `week2.ts:25,44,60,78,90,98`), which only render because the render path
   resolves them via id-tolerant `nameToId`. This is proof the resolve works
   for ids today.
3. Rendering: ground (`html.ts:1380-1381`) and allhands (`html.ts:1150-1151`)
   emit `lSeat(di, nameToId(who), …)` → `puck` → `data-person="${id}"` +
   text `esc(PEOPLE[id].cs)`. Both `data-person` and the visible text are
   derived from the **resolved id**, so they are identical for id-form and
   cs-form `who`.
4. `refwin.ts` reconciles the reference to `people.ts` **by id** and patches the
   reference's `nameToId` to the id-tolerant form (`refwin.ts:67-82`). Nothing
   in 1C changes `nameToId`, the render, or `cs`, so the shim is untouched;
   `reground` (`refwin.ts:89-99`) copies the port's `who` onto the reference,
   so both engines resolve the identical value.
5. `tfin.js` asserts `.puck[data-person=id]` (by id) and `.dwwho` text = callsign
   — both unchanged.

**Standing rule honoured:** display source stays `cs`; the refwin id-shim stays
intact; a callsign the owner renames still never needs a dayHTML-side refwin
edit, because a rename now changes only `cs` (already mirrored by `recs`).

## 6. Storage format — **Option A (reset), OWNER CONFIRMED 2026-09-14**

Persisted week/day snapshots written by **interactive edits before 1C** may hold
cs-form `who` on ground/allhands rows. Once `renameCallsign` stops walking rows
(§4.3), a **loaded** pre-1C week whose `who` is still cs-form would, on a rename,
**lose the person from the row** (`renameCallsign` deletes the old `ID_BY_CS`
entry, so the stale callsign resolves to nobody) — a *visible* regression, not
just a latent crossing (Claude Finding 3). So the storage question is part of
1C's correctness and **must land in the same PR**.

**Chosen: Option A — coordinated storage reset** (owner: "reset to the sample
week" is fine; current on-screen edits cleared). Matches 1A's coordinated reset
and the standing rule `dev-phase-reset-demo-data-not-migrate`. Delivers the
guarantee immediately and needs no fragile historical-ownership recovery.

**Option B (non-destructive normalize) — REJECTED by red-team.** Codex PID-03:
a callsign renamed-then-reused before the upgrade cannot be recovered from the
current callsign index (`nameToId('Ace')` is undefined for a stale snapshot, so
the pass either preserves a crossable string or writes the *wrong* current id).
Codex PID-04: the suggested `backfillSnapshotIds`-shaped traversal walks
`al.snap[day].d` but current ALs store `al.snap.d` directly (`publish.ts:210`),
so it would skip issued AL days — and `loadVersionToWorkingCopy` copies those
back into DAYS (`drafts.ts:454-458`). Not worth the risk; reset is clean.

**Build note (Claude Finding 3):** the persist whiteboard writes bare
`(collection,id)` with no format-version field, so the reset gate must be built
— follow exactly how **1A** did its coordinated storage-format reset (find its
version stamp + boot reset path; mirror it). Confirm the mechanism first-hand
before coding; do not invent a second reset idiom.

## 7. Cross-module ripple — none of substance

- **Leave War** projects/reprojects and matches by Raptor **id** already
  (`raptorRoster.ts:53`, `sync.ts:991`). Only the *displayed* `callsign` field
  reads `cs`; unaffected.
- **Tracker** links enrolments by `pid` = Raptor **id** already (`core.js:527`);
  archive-not-delete keeps ids resolvable (`QualsPage.tsx:462`).
- **INPUTS / reassign / medical** are id-based already (`schema.ts:148`,
  `inputedit.tsx:1122`, `medical.ts:43`).
- **Persist** rebuilds `ID_BY_CS` from stored `cs` on hydrate (`persist.ts:67`)
  — unchanged; rename still persists via `persistPeople`.

## 8. Why NOT a new opaque UUID for people now

The PEOPLE key is already opaque, stable, hidden, minted-unique, and the id that
flying/duty/sim/inputs/sign-offs/Leave War/Tracker/plan **all already store**.
Introducing a second id (a `pid` UUID) would force re-keying every one of those,
plus `ID_BY_CS` and the `refwin` shim — a large, parity-sensitive churn for no
near-term gain, and it does not make the crossing bug any more fixed. The
database step (RC5/[DB-STEP]) is where PEOPLE becomes a table with server keys;
map the existing key to the server key there, once. **1C reuses the key.**
(Red-team: challenge this if the multi-squadron [XFER] identity model needs a
device-independent id sooner.)

## 9. Test plan (first harness increment — rename/reorder/delete/copy)

Per the sequence re-review ("ship each conversion with rename/reorder/delete/copy
behaviour tests as the first harness increment"):

1. **Rename moves nothing / no crossing** (new): drop person A onto a ground and
   a programme row; rename A's callsign; assert the rows still resolve to A
   (unchanged model), then give A's *old* callsign to a new person B and assert
   the rows still resolve to A, not B. Include a snapshot/published row in the
   assertion (the case the old walk missed).
2. **Write stores id**: `setSlotVal`/`fillSlot`/`acceptInput` on ground +
   allhands store the id; `slotVal`/`rowCrew` read it back.
3. **Reorder/delete**: deleting/reordering a ground row leaves other rows'
   person refs intact (rides existing `rid` addressing).
4. **Free text preserved**: "EXT SQN"/"ALL PILOTS" and `ALL`/`ALL AVAIL`
   sentinels render unchanged.
5. **Parity**: full `tfin.js` (728/0), `html.test.ts`, `parity.test.ts`
   unchanged.
6. Update `renameCallsign`'s existing tests to the label-only contract.
7. **Update the assertions that pin the callsign form** (Claude Finding 2 — these
   go red the moment `who` stores an id): `accept.test.ts:82` (`'Zenith'`→`'vinci'`),
   `accept.test.ts:117` (`'Talisman'`→`'haowen'`), `audit-c-gaps.test.ts:235`
   (`'Vandal'`→`'split'`), `audit-c-gaps.test.ts:243` (`'Fable'`→`'plasma'`),
   `audit-e-commit-relink.test.tsx:123` (`PEOPLE.stiff.cs`→`'stiff'`). Rewrite to
   the id contract, not deleted.
8. **New: add-back-door test** (PID-01) — add a person whose callsign equals an
   existing person's id ("Bane" vs id `bane`); assert `addPerson` refuses it, and
   that a seated row still resolves to the original person.
9. **New: sim `who` free-text test** (PID-02) — a person renamed/added to a sim
   `who` free-text value ("EXT SQN") does NOT get that sim's time in
   avail/events/oil.
10. Storage: a test for the §6 reset gate (older-format book resets to seed;
    modern book untouched).

## 10. Gates & process

Full gate set once before the PR (`npm test`, `npm run build`,
`node reference/tfin.js` = 728/0, `npm run test:e2e`, `npm run smoke:tracker`),
plus the live-view drive of the built bundle. Build on Opus 4.8 high; independent
cross-provider inspection of the final diff (Codex lead; Fable for any high-stakes
crux); **hold for "merge live"**.

## 11. Ripple / risk summary

| Risk | Likelihood | Mitigation |
|---|---|---|
| Parity byte-drift | Low | §5 — writes not on the parity path; render already resolves id→cs; refwin untouched. Gate proves it. |
| A render path prints raw `who` instead of resolving | Low | Audited: ground/allhands resolve `nameToId`; sim `who` is deliberate free text. |
| Crossing reopened via `addPerson` (callsign = an existing id) | **was unhandled** | §4.2 — id-first reads + id-tolerant add guard (BLOCKER, both providers). |
| Sim `who` free-text value captured by a same-named person | Medium | §4.4 — sim `who` becomes pure free text; resolution removed. |
| Pre-1C loaded week loses person from row on rename | High if unhandled | §6 — Option A reset in the same PR. |
| Added-person id collision (same-ms adds) | Very low | §4.6 `newId('p')`. |
| Callsign-form assertions in existing tests go red | Certain | §9.7 — update the 5 listed assertions to the id contract. |

## 12. Red-team dispositions (Claude + Codex/GPT-6-Astra high, 2026-09-14)

Both providers independently returned **REVISE**; backbone SOUND. They
**converged on the same blocker**. Dispositions:

- **PID-01 / Claude Finding 1 (HIGH, ACCEPTED)** — crossing reopened via
  `addPerson` + cs-first `nameToId`. → §4.2 (id-first authoritative reads +
  id-tolerant `addPerson` guard). This is the fix that makes 1C actually deliver
  its guarantee.
- **PID-02 (MEDIUM, ACCEPTED)** — sim `who` displayed as text but resolved as a
  person. → §4.4 (sim `who` becomes pure free text; resolution removed from
  avail/events/oil). Verify parity + no person-valued sim fixture.
- **Claude Finding 3 (MED, ACCEPTED)** — dropping the DAYS-walk regresses a
  pre-1C loaded week on rename; §6 not optional. → §6 Option A in the same PR;
  build the reset gate off 1A's mechanism.
- **PID-03 / PID-04 (ACCEPTED as rejection of Option B)** — non-destructive
  normalize is unsafe (historical ownership unrecoverable; wrong traversal). →
  §6 Option A (reset) chosen; Option B dropped.
- **Claude Finding 2 (ACCEPTED)** — 5 callsign-form test assertions break. →
  §9.7 lists them for rewrite.
- **Verified-correct (both), no change:** parity architecture (§5) holds three
  ways; `renameCallsign` label-only is safe for id-form; `acceptInput`/
  `reconcile`/`unaccept` are `src`-keyed not `who`-keyed; `restore.ts` folds
  cs/id to one fingerprint (no phantom amendments); all render/export/board/peek/
  drag consumers resolve correctly; write-site enumeration complete;
  `newId('p')` is clean.

**Next:** build on Opus 4.8 high, test-first; then independent cross-provider
inspection of the FINAL DIFF (Codex lead, Fable for any crux); full gates; hold
for "merge live". A second plan-review round is not run — the agreed fixes are
concrete and the final-code inspection is the backstop.
