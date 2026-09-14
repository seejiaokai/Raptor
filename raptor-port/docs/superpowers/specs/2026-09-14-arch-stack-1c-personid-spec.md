# [ARCH-STACK] Step 1C — `who → personId` (the last piece of "stable ids")

**Status:** DESIGN (pre-red-team). Parity-sensitive, foundational. Build only
after a cross-provider red-team of this plan (Claude + Codex), on
`claude/arch-stack-1c-personid` off `main`, and hold for the owner's explicit
"merge live".

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

### 4.2 Read paths — already id-tolerant, no change required

`slotVal`/`rowCrew` ground+allhands already resolve `nameToId(who)`
(`slots.ts:80-81,56`), which is id-tolerant (`people.ts:276`). Reading an
id-form `who` returns the id unchanged. (Optional simplification: ground/allhands
`slotVal` could return `who` directly once writes are id-form, but keeping
`nameToId` is harmless and tolerates any residual callsign — **keep it**, it is
the safety net.)

### 4.3 `renameCallsign` → label-only

Keep: the uniqueness guard (`slots.ts:556-557`), `p.cs = cs`, and the `ID_BY_CS`
remap. **Delete** the `DAYS.forEach` row-rewrite (`slots.ts:564-570`). Rewrite
the header comment to state the new invariant (rename moves nothing; rows hold
ids). This is the 1B `renCourse`/`renSyl` pattern.

### 4.4 Sim `.who` — documented free text, not a person field

Sim `who` never renders as a puck (`html.ts:1355` renders it as free text only
when the row has no seated crew). Its only person use is the availability/event
resolve via `nameToId` (`avail.ts:36`, `events.ts:406`), which stays id-tolerant.
`setSlotVal` never writes it. So: it is **out of scope** as a person-storage
field; dropping it from `renameCallsign`'s walk is correct. Document it as free
text in `schema.ts`.

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

## 6. Storage format — DECISION REQUIRED (owner)

Persisted week/day snapshots written by **interactive edits before 1C** may hold
cs-form `who` on ground/allhands rows. They still render/validate correctly
(id-tolerant `nameToId`), but they retain the narrow crossing exposure until
overwritten, because `renameCallsign` no longer rewrites them.

- **Option A — coordinated storage reset (recommended).** Bump the persist
  format version; on boot from an older version, reset persisted weeks/books to
  seed. Matches 1A's coordinated reset and the standing rule
  `dev-phase-reset-demo-data-not-migrate`. Cheapest, lowest-risk, delivers the
  guarantee immediately. **Cost: wipes the owner's current demo edits/weeks.**
- **Option B — non-destructive normalize pass.** A one-time, version-gated walk
  (shape of `backfillSnapshotIds`, `rowids.ts:325`) over persisted DAYS +
  snapshots: `who = nameToId(who) || who` (cs→id where resolvable; free text
  left as-is). Keeps edits. Costs more code + its own tests + a parity-safe
  guarantee it never touches free text/sentinels.

Recommendation: **A**, per the standing reset rule and to keep a foundational
step small — but this wipes current on-screen work, so it is the owner's call.

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
7. Storage: a test for the chosen §6 option (reset gate, or the normalize pass).

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
| Residual cs-form `who` in old snapshots crosses after rename | Medium (demo only) | §6 decision (reset or normalize). |
| Added-person id collision (same-ms adds) | Very low | §4.6 `newId('p')`. |
| A test asserts the old renameCallsign row-rewrite | Certain | §9.6 update tests to label-only. |
