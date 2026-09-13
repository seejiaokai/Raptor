# [ARCH-STACK] Step 1A — stable ids (scheduler side): input filing-by-id + note ids

**Date:** 13 Sep 26 (rev. after Astra round-1 REVISE) · **Branch:** `claude/amendment-engine-core`
· **Model:** Opus build, Astra (Codex) red-team lead (Fable low until Mon 19:00). **Hold for owner
"merge live."**

Parent: `2026-09-13-architecture-rootcause-plan.md` (RC3/ARCH-03, step 1). Review log:
`2026-09-13-stable-ids-step1a-review-log.md`. FIRST slice of step 1, split by risk (owner, 13 Sep):

- **1A (this spec):** input filing-by-id + note ids. Both scheduler-side; the ids are NEVER
  printed, so both are parity-safe *by render* — but see §Parity for the harness adapter.
- **1B (after Mon 19:00, Fable final review):** Tracker course/syllabus ids — `[TRK-CSID]`.
- **1C (own spec + red-team):** `who → personId` — the printed puck value (~112 uses/28 files,
  byte-pinned by `reference/tfin.js`); large, parity-gated, least urgent. OUT of 1A.

> **Scope correction (Astra round 1):** "input filing-by-id" is NOT just `ground.src`. Content
> keys are used as **action addresses** across accept/undo/edit routing, the week stash's persisted
> removals, and two reconcilers. All of them must convert together or the twin bug just moves. And
> note-objects reach the day-template save/apply paths and the parity harness. 1A is real, not
> "surgical" — but still contained to the scheduler module and still pre-live.

## Why (root cause this closes)
The app addresses cross-references by **content or position**, not identity, so it can only guess
which record a delete/undo/accept means. Two scheduler faces:

1. **Input identity is used by content key as an action address.** An accepted input's landing
   (`ground.src`), its Accept/Undo controls (`data-acck`), its editor relink (`data-inpedit`), the
   SANS label producer, `interactions.ts` action routing (resolves the FIRST content-key match),
   `acceptedDay`, `reconcileLandedAcc` (store.ts), `reconcileDayFiling` (slots.ts), and the week
   stash's persisted removals (`unacceptedKeys()`/restore) all key off `inpKey`
   (person·date·type·start-minute). Two content-identical inputs (twins) therefore cross: accepting
   both then undoing/editing/removing one hits the other. Today this is only *mitigated* by
   **refusing the second accept** — a guardrail, not a fix. `[INP-CSID]` / finding J (DU-007).
2. **Notes have no identity.** `day.notes` is a `string[]`; note lines are addressed positionally
   (`dn:di.i`), a middle delete calls `shiftKeys('dn:di.',…)`, and notes are a reorder `MOVE_KIND`.
   Every other editable row carries a hidden `rid`; notes can't, being bare strings.

Inputs already carry an `iid` (minted at creation, saved, reseeded on hydrate) but it is a
**session counter** `'i'+N` and **filing/action-routing ignore it**. So 1A: (a) route ALL input
actions by the id, (b) upgrade the id to an opaque/DB-ready form, (c) give notes an id by
promoting them to objects, (d) reset pre-1A persisted data so no old-shape blob survives.

## Shared primitive: `newId(prefix)`
One opaque-id minter, reusing the proven `rid` algorithm
(`'r'+Date.now(36)+Math.random(36).slice`). Export `newId(prefix)` (from `engine/rowids.ts` or a
new `engine/newid.ts`); `mintRowId`, input `iid`, and note ids all call it. Format
`<prefix>+base36(time)+base36(random)` — collision-resistant across sessions/devices, never parsed,
never printed. This is the primitive steps 2–3 and the DB adapter reuse.

---

## Work item 1 — route every input ACTION by id (`inpKey` → `inpId`)

### 1.1 `iid` → opaque id
- `engine/inputs.ts`: `inpId(inp)` mints `newId('i')` (was `'i'+(++IIDN)`). Keep `inpId` (lazy
  backstop) and `mintInpIds`. **Retire** `IIDN`, `seedIidCounter`, and persist.ts's
  `maxNum(...'i')` seeding — opaque ids need no counter and gain the cross-device uniqueness the
  counter lacks (the DB step needs this).
- `state/persist.ts:~45`: drop `seedIidCounter(maxNum(...))`; hydration reads `iid` back unchanged.
- Tests: `persist.test.ts:73` asserts literal `i59` → change to assert *shape* (`/^i/`) or
  round-trip `iid` equality, never a specific value. Grep for any other literal-`iid` assertion.

### 1.2 convert the full set of content-key ACTION addresses to the id
The landing link AND every producer/consumer that routes an action off the input's content key:
- **Landing:** `engine/slots.ts` `acceptInput` — `const key = inpId(inp)` (was `inpKey`). The
  existing `DAYS.some(...r.src===key...)` becomes a correct **idempotency** guard ("this exact
  input already landed"), not the false-collision refusal it is now; keep it, update the comment.
- **Resolution readers:** `slots.ts` `acceptedDay`, `unacceptInput`; `reconcileLandedAcc`
  (store.ts:~408); `reconcileDayFiling` (slots.ts:~475); `srcInput`/late-indicator + board
  ground-deletion resolver (Astra coverage) — resolve landed rows via `inpId`/`inpById`.
- **UI action addresses (SID-01):** the producers AND consumers of `data-acck` (Accept/Undo) and
  `data-inpedit` (editor relink), the SANS label producer (html.ts:~1564/1573), and
  `interactions.ts:~479` (and the editor route ~656) — emit the input **id** and resolve via
  `inpById`, so twin B's Undo/Edit hits B, not the first content match.
- **Week stash (SID-02):** `state/store.ts` `unacceptedKeys()` (~341) must store input **IDs**, and
  the restore path (~521) must look them up by `inpId` — token and lookup change together, or an
  unaccept of one twin still sets the other's `acc='r'` on a week round-trip.
- `engine/publish.ts:437` (`r.src===at[1]`): NO change — `at[1]` is the stored `src` value, agnostic
  to key vs id.
- Leave any `inpKey` that is a genuine **display/dedup hint** (not an action address) in place.

### 1.3 tests (item 1)
- Update `accept.test.ts`, `inputground.test.ts`, `crossyear.test.ts` (`r.src===inpKey` → `inpId`).
- **New twin regressions (required):** two inputs identical on person·date·type·start-minute — (a)
  both accept and land two distinct rows; (b) each twin's **Undo, Edit, delete** hits its own row
  (UI-level via interactions); (c) unaccept one twin, **navigate away and back** (week stash
  round-trip): the other keeps its landing and its `acc` (the SID-02 case).

---

## Work item 2 — note ids (`string[]` → objects)

### 2.1 model
`day.notes: string[]` → `day.notes: { id: string; t: string }[]` (`t` = text). `schema.ts` note
type updated; `schema.test.ts` re-pinned.

### 2.2 addressing scope — staged (Astra-endorsed, with the SID-04 constraint)
Notes gain a stable `id`; **amendment addressing stays positional** (`dn:di.i`, `shiftKeys` on
delete) for 1A. Rewiring the AL to address notes by id belongs with **step 2 (write/command layer)**.
Astra endorsed this boundary **provided** note identity (a) survives restores/undo/drafts and (b) is
renewed for independent copies — see 2.4.

### 2.3 conversion sites (read/write `.t`; verify each at build via grep)
- `engine/slots.ts:~200` `dn` resolver `{o:d.notes,k:+a[1]}` — get/set must target `note.t`.
- Renderers → pass `n.t` (parity anchor — byte-identical printed string): `ui/html.ts:~1138`,
  `ui/board-html.ts:~179`, `ui/peek.ts:~130`.
- `ui/board.ts:~814` add → `push({id:newId('n'), t:''})`; `~824/826` delete → splice + the same
  `shiftKeys('dn:di.',…)` (addressing unchanged).
- Read-`.t` sites, addresses unchanged: `engine/canonical.ts:217-218`, `engine/drafts.ts:355`,
  `engine/restore.ts:43`, `engine/publish.ts:428`, `engine/reorder.ts` (dn move).
- Seed/demo notes literals → objects with **fixed** ids (deterministic; never `newId()` at module
  scope — the parity harness reads pristine; mirrors the rid seed rule).

### 2.4 day templates (SID-03 + SID-04) — the note-object blast radius
- **SID-03:** `engine/daytpl.ts` `sanitiseBlob` (~299), `DayTplBlob`, `mintBlob` (~231) currently
  keep/declare **string** notes → a saved template silently drops notes after reload. Update the
  template note representation + its types + capture/save/sanitise/apply paths together. Pin: save a
  template with notes, reload, apply — notes text survives.
- **SID-04:** template **apply** deep-copies notes and `stripRowIds`/`ensureRowIds`/`rowsOf`
  (daytpl.ts:~97, rowids.ts:~24) don't enumerate notes → two applications share note ids. **Mint
  fresh note ids on every template application** (before snapshots), the same copy-vs-version rule
  as `rid`: a COPY (template apply, duplicated day) re-mints; an undo/recovery/alternate **draft**
  of the same day KEEPS ids. Extend `stripRowIds`/`ensureRowIds` (or a note-aware sibling) to
  enumerate notes. Pin: one template applied to two days → distinct note ids; an undo/draft → same.

### 2.5 tests (item 2)
- Re-pin `schema.test.ts`; update tests constructing `notes:['x']`.
- Template save→reload→apply retains notes (SID-03); template-to-two-days note-id uniqueness vs
  draft/undo identity (SID-04).

---

## Work item 3 — coordinated storage-format reset (SID-05, required, before hydration)
The loader installs any parsed `days` array — live days, issued **snapshots** and **drafts** — and
`amFormatOf` doesn't inspect note/src shape, so a valid **pre-1A blob bypasses reseeding**, leaving
old `notes: string[]` and content-key `src` in recoverable snapshots/drafts; and discarding only
weeks leaves hydrated inputs at `acc='g'` with no landing (initStore's no-stash auto-accept skips
already-accepted inputs). Under `dev-phase-reset-demo-data-not-migrate` (pre-live, demo data):

- Add an **explicit storage-format reset step that runs before hydration** (a stored format-version
  stamp; when it is below 1A, clear the relevant persisted scheduler state rather than migrate).
- **Scope of the reset:** persisted inputs, ALL saved weeks *and their nested snapshots/drafts*, and
  any incompatible day templates — everything that could carry an old note/src shape into a renderer
  or a filing lookup.
- **Landing invariant:** after reset, retained `acc` values must NOT suppress fresh landings — the
  boot auto-accept must re-land accepted inputs (clear `acc`/re-run land, per the `loadWeek` `acc`
  clear idiom) so no input is left "accepted with no ground row."
- **Restart-safe ordering (SID-07, required).** The completion stamp is the LAST write and is
  committed ONLY after every required backend deletion has durably succeeded and been verified.
  This cannot go through the normal `Postman` path: `bootStorage` attaches Postman before
  hydration, `Postman.flush` sends records **concurrently** and `send` **catches failures and
  schedules retries rather than rejecting** (`storage/postman.ts`), so a week-deletion can fail
  while the stamp succeeds — and the next reload then skips the reset and hydrates the surviving
  incompatible week. **Use the actual `Backend` instance passed to `bootStorage(backend)`** — NOT
  `storeBackend` (engine/hooks.ts is a sync settings KV `{getItem,setItem}`, no delete) and NOT the
  Postman queue. Protocol: for each record to drop, `await backend.remove(collection, id)` and
  **verify** it (re-get returns null / absent from `list`); then `await backend.put(...)` the
  completion stamp; then **fill the whiteboard from the verified post-cleanup snapshot** and only
  then attach Postman and hydrate. If any required deletion fails, leave the stamp UNSET (next boot
  retries) and do NOT hydrate the incompatible records this boot.
- Pin (SID-05): a synthesised pre-1A blob (string notes + content-key src + `acc='g'`) → after
  boot, no string-note renders, no dangling `src`, every accepted input has a landing. Cover reload,
  week navigation, and version-preview/recovery.
- Pin (SID-07): with one required deletion forced to fail while the stamp write would succeed —
  boot leaves the stamp unset and does not hydrate the incompatible record; on reboot the cleanup
  resumes and completes. (Same durability family as `[TRK-DISK]`.)

## Parity (SID-06) — the harness adapter, not just the render
`reference/tfin.js` stays **728/0**, but that alone can't validate the port. The parity ADAPTER
`src/testing/refwin.ts` `reday` (~108) copies port notes straight into the string-based reference
DAYS, and `parity.test.ts` (~87) deep-equals raw DAYS — so once port notes are objects, the
reference renderer stringifies them and/or the deep-equal fails on shape.
- Update `reday` to **project `note.t`** into the reference (reference stays strings).
- Change the raw-DAYS assertion to compare **equivalent content with note identity excluded**.
- KEEP an independent **text-render** assertion so changing the adapter can't conceal a real port
  note-render regression.
- Live-view proof: render a day carrying notes + an accepted activity input; confirm identical text.

## Migration stance
Pre-live, demo only, `dev-phase-reset-demo-data-not-migrate`: no back-compat readers — Work item 3
is the concrete reset that replaces migration. The seed re-runs `autoAcceptSeedInputs` at boot, so
seed landings get fresh `inpId`-based `src` automatically; seed notes are objects from the seed.

## Ecosystem walk (STANDING ORDER)
- **AL/amendments:** filing `src` read by `publish.ts` deletion-was-issued — stored value, agnostic.
  Note `dn:` addressing stays positional → AL note marks unchanged.
- **Leave War:** reconciles inputs by content/type, NOT by `ground.src`; no numeric-`iid` dependency
  found (Astra). Re-grep at build to confirm.
- **History/undo:** `iid` and note `id` ride snapshots like `rid`; opaque values replay fine;
  drafts/undo KEEP note ids (2.4).
- **CSV export:** does NOT emit day notes (Astra) → no export change.
- **Risks carried:** (1) a missed content-key action address (grep `inpKey(` exhaustively); (2) a
  renderer stringifying a note object; (3) a template path dropping/duplicating note identity; (4) a
  pre-1A blob surviving the reset. All gate/live-view catchable; none silent once item 3 lands.
- **No blocking owner question.** Scope grew (per Astra) but the 1A/1B/1C split stands.

## Build order & gates
1. Item 1 (input action-routing by id + iid) — one commit, ship-green.
2. Item 2 (note objects) + Item 3 (storage reset) + parity adapter — one commit (they're coupled).
3. Full gates from `raptor-port/`: `npm test`, `npm run build`, `node reference/tfin.js` (**728/0**),
   `npm run test:e2e`, `npm run smoke:tracker`; live `vite preview` render of a day with notes + an
   accepted activity input; the twin + pre-1A-blob regressions above.
4. Push branch, hand owner the Vercel link, **HOLD** — no merge without "merge live."
5. Final code inspection by a fresh Codex/Astra session (plan review ≠ code review).

## Dispositions (Astra rounds 1–2 → all accepted, folded above)
R1: SID-01 → §1.2 UI action addresses + §1.3 twin UI regression. SID-02 → §1.2 week stash +
reconcilers + §1.3 round-trip regression. SID-03 → §2.4 templates. SID-04 → §2.4 fresh-id-on-copy.
SID-05 → §Work item 3. SID-06 → §Parity. Staged note addressing (§2.2) endorsed by reviewer.
R2: SID-07 → §Work item 3 restart-safe ordering (stamp last, after verified durable cleanup, off
the Postman queue) + SID-07 pin. R3: SID-08 → §Work item 3 uses the real `Backend` instance from
`bootStorage(backend)` (`await remove`+verify, `await put` stamp, fill whiteboard from the verified
snapshot), not the non-existent `HOOKS.storeBackend`. All verified against source. No rejections.
