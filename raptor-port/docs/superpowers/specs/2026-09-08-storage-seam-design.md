# Storage seam — design (stage 1 of 4)

**Date:** 8 Sep 26 · **Branch:** `claude/storage-seam` · **Status:** implemented
on `claude/storage-seam` (plan: `docs/superpowers/plans/2026-09-08-storage-seam.md`, at the repo root).

The end state is RAPTOR on Dataverse, shared by the whole squadron, with
live-ish collaboration. This spec covers **stage 1 only**: one storage
door for the whole app, a "load once, write behind" architecture that
keeps the engine, undo and the Leave War sync unaware that saving became
slow, and a clean-start mock with timing knobs so the slow-save bugs are
tested rather than hoped away. Stages 2–4 (stable row ids, live-ish sync,
the Dataverse adapter) are sketched at the end so this design does not
have to be reopened for them.

Reference for every record shape named here: `docs/data-schema.md`.

## Decisions taken in the brainstorm (owner, 8 Sep 26)

| Question | Decision |
|---|---|
| What persists once a database exists | **Everything**: weeks (draft and published), inputs, roster, Leave War, Tracker, settings. Development and tests still start clean (the mock). |
| Two people editing the same week | **Live-ish** (stage 3): autosave, others' changes within ~2 s while editing with idle backoff, presence, same-cell clash = latest wins with a notice. Not Google-level push; not lock-based. |
| Scope of this round | **Stage 1 only** — the door and the mock. Whole-record letters; per-change letters wait for stage 3 (needs stage 2's stable ids). |
| The Tracker | **Same door.** File Open / Save / Import stay as first-class import/export, because a new syllabus is authored on another machine and brought in as a file. The database is where the Tracker lives; the file is a format. |
| Approach | **A — whiteboard first, write behind** (over "make every save wait" and "three swappable doors"). |
| The demo site | Starts **remembering everything between reloads** (per browser), replacing today's deliberate forget-on-exit. All of it persists together, so the old half-remembered confusion cannot recur. |

## Architecture

```
  screens / engine / undo / Leave War sync / Tracker     ← unchanged
        │            │             │            │
   storeBackend   StorageBackend  storage.js   weekstash / inputs / people   ← existing doors, re-pointed
        └────────────┴─────────────┴────────────┘
                       WHITEBOARD  (sync, instant, in memory)             src/storage/whiteboard.ts
                            │ change signal
                         POSTMAN  (coalesce · retry · status)             src/storage/postman.ts
                            │ put / remove
                         BACKEND  (async, can fail)                        src/storage/backend.ts (contract)
                    ┌───────┼────────────┐
               Memory    Browser     Dataverse (stage 4)
              (mock)   (demo site)
```

The only code that ever *waits* is the boot gate (one `loadAll`) and the
postman. Everything above the whiteboard keeps today's synchronous
assumptions, which is what makes the three timing bugs (undo of a
half-saved state, sync writing twice, a screen drawn on stale settings)
structurally impossible rather than carefully avoided.

## Components

All new code lives in `src/storage/`. Each unit has one job, one
interface, and can be tested alone.

### `backend.ts` — the contract

```ts
export type Collection = 'settings' | 'weeks' | 'inputs' | 'people' | 'plan' | 'leavewar' | 'tracker'
export interface Backend {
  /** Everything, once, at boot. Resolves to {collection: {id: json}}. */
  loadAll(): Promise<Record<Collection, Record<string, string>>>
  put(collection: Collection, id: string, json: string): Promise<void>
  remove(collection: Collection, id: string): Promise<void>
}
```

Values are JSON strings, never objects, so every backend is a dumb
key/value store and the shapes in `data-schema.md` stay the app's
business. This is the whole surface the Dataverse adapter implements.

### `whiteboard.ts` — the front side

An in-memory `Map<'collection/id', string>` with `get`, `set`, `delete`,
`keys(collection)`, and `subscribe(listener)`. Synchronous, never throws,
never waits. Filled once by the boot gate from `loadAll()`.

The three existing doors become thin adapters over it:

| Existing door | Adapter |
|---|---|
| `storeBackend.impl` (`src/engine/hooks.ts`) — `getItem/setItem` with the `sqn142_` prefix | strips the prefix, reads/writes `settings/<key>` |
| Leave War `StorageBackend` (`src/leavewar/state/storage.ts`) — `read/write` | `leavewar/<key>` |
| Tracker `storage` (`src/tracker/storage.js`) — async `get/set/delete/list` | same async signatures, resolving immediately from `tracker/<key>` |

`src/main.tsx` plugs these in where it plugs `window.localStorage` and
`memoryBackend()` today. No change above the doors.

### Live scheduler state joins the whiteboard

These are session-only today and become records:

| Record | Written when | Contents |
|---|---|---|
| `weeks/<dd-mm-yyyy>` (the stash's `dd/mm/yyyy` week-start key with `/` → `-`, because `/` is the collection/id separator) | every history step (`histPush`, undo/redo, week swap) writes the loaded week once it has changed since load, plus every stashed week from its stash entry; a record nothing backs any more (the loaded week undone back to its load state, a week the Admin sweep dropped) is deleted on the same step; inside `loadWeek`'s swap window only the stash is written, the arriving week once its baseline is set (8 Sep 26 bug pass — the live-week line used to file the LEAVING week under the ARRIVING id) | the week-stash snapshot (`weekStashSnap()`: `{d, c, p, ad, a, al, ok, sg, o, cv, dr, cd, wo, un}`) — exactly what `applyWeekModel` restores |
| `inputs/all` | every inputs write (the `writeInputs*` funnel in `src/state/store.ts`) | the `INPUTS` list |
| `people/all` | every quals-page tick / archive change | the whole `PEOPLE` map |
| `plan/all` | every planning-layer write (`src/state/persist.ts`) | `{pp: PLANPUCKS, dm: DAYRMK}` — the planning layer |

Inputs are global across weeks, so they are stored once in `inputs/all`,
not inside each week record; the planning layer is likewise global, in
`plan/all`. On load:
`INPUTS` from `inputs/all`, each week from `weeks/*`, `PEOPLE` from
`people/all` when present (the whole map replaces the seed), else the code
seed exactly as today, which is then written once.

The week stash (`src/engine/weekstash.ts`) keeps its in-session role and
gains a write-through: its header comment, which says "session-only,
deliberately", is rewritten to describe this.

### `postman.ts` — write behind

Subscribes to the whiteboard. Rules:

- **Coalesce per record**: after a change, wait 300 ms; further changes to
  the *same* record within that window replace it. Different records are
  never merged into one letter.
- **Order**: letters for one record are sent in order; records are
  independent.
- **Retry**: on failure, back off 1 s → 2 s → 4 s → … capped at 30 s, for
  ever. The whiteboard is never rolled back.
- **Status** (one value, subscribable): `saved` · `saving` · `unsaved`
  (queued, no failure yet) · `failed` (at least one retry pending).
- **Unload guard** (`boot.ts guardUnload`, revised 8 Sep 26 bug pass):
  `pagehide`, a hidden `visibilitychange` and `beforeunload` each call
  `flush()` first — the Browser backend writes inside `put()` before its
  first await, so every letter still in its 300 ms wait lands synchronously
  and a reload right after an edit keeps the edit (it was lost, and on iOS
  Safari — which never fires `beforeunload` — silently). Only if the status
  is still `failed` or `unsaved` after the flush does `beforeunload` ask the
  browser to confirm leaving; a letter merely in flight is on its way.
- `flush()`: send everything queued now, ignoring the 300 ms wait. Used by
  tests, by Retry and by the unload path. Known limit: a letter already in
  flight is not awaited by the returned promise; its newer queued value
  follows when that send completes.

### `boot.ts` — the gate

```ts
export async function bootStorage(backend: Backend): Promise<{ wb: Whiteboard; postman: Postman }>
```

Calls `loadAll()`, fills a whiteboard, starts the postman, returns. On
rejection it rethrows; `main.tsx` renders a full-screen error with a Retry
button and boots nothing. The app never draws on a partial whiteboard.

`main.tsx` becomes: choose backend → `await bootStorage` → plug the three
adapters → today's boot sequence, unchanged (`initStore`, Leave War init,
`installDemoWorld`, `wireLeaveWarSync`, history baselines) → render.

### Backend choice

| Context | Backend |
|---|---|
| Unit tests (vitest) | **Memory** — always a clean start |
| Browser (Playwright) tests, Tracker smoke | **Browser** — the built site's backend, so persistence is ON; a fresh context per test starts empty, but a write survives a reload WITHIN a test (the reload proof in `e2e/leavewar.spec.ts`) |
| `npm run dev` | **Memory** by default (`VITE_STORAGE=browser` opts in to persistence while developing) |
| Built site (GitHub Pages, Vercel previews) | **Browser**; `?fresh=1` on the URL forces Memory for a clean-start demo |

### `memory.ts` — the mock

`MemoryBackend` implements the contract over a `Map`, plus test knobs:

- `latency: number` — ms each call waits (default 0);
- `failNext(n)` — the next `n` calls reject;
- `dropOne()` — the next `put` resolves but stores nothing (a lost letter);
- `shuffle: boolean` — in-flight calls resolve in random order;
- `journal: {op, collection, id, at}[]` — every call, in order, for
  assertions;
- `seed(snapshot)` — pre-fill before `loadAll`.

### `browser.ts` — the demo-site backend

`BrowserBackend` stores each record at `localStorage['raptor:<collection>/<id>']`.
`loadAll` scans that prefix. Storage errors (private mode, quota) reject
`put`, which the postman surfaces as `failed`; they never throw into the
app.

**One-time legacy import**: on `loadAll`, if no `raptor:` keys exist and
legacy keys do, it imports `sqn142_*` → `settings` and `ocu:*` → `tracker`,
so a browser that used the site before keeps its templates and Tracker
work. Legacy keys are never deleted. The unwired `leavewar:*` keys are
ignored.

### The Tracker's file workflow

Open / Save changes / Import stay as they are on screen. Underneath, Open
and Import write the file's `charts` / `students` **through the
whiteboard** (`tracker/*` records), and Save changes builds the file from
the whiteboard. The file is a format, not a store.

### Saved / unsaved indicator

One small element in the header, wired to the postman's status: hidden
when `saved`; "Saving…" while `saving`/`unsaved`; "Not saved — Retry" in
the warning colour when `failed`, where Retry calls `flush()`. No other
screen changes in stage 1.

## Failure handling

| Situation | Behaviour |
|---|---|
| A `put` fails | whiteboard keeps the work; status `failed`; postman retries with backoff; indicator offers Retry; editing continues |
| `loadAll` fails | full-screen error with Retry; nothing boots |
| A stored record does not parse, or parses to the wrong shape | treated as absent (settings: the shipped standard applies; a week: the plan seed applies; a null row inside `inputs/all` / `plan/all` is dropped; a Tracker record that is not the array/object its reader expects reads as absent), logged to console, never a crash — the rule Leave War's `readStored` already follows (8 Sep 26 bug pass: a wrong-shape `inputs/all` used to throw out of `hydrate` into the boot-failure screen, and a corrupt Tracker `courses`/`syls` record killed the Tracker tab on every visit) |
| Tab closed or reloaded with letters queued | flushed on the way out (see the unload guard); the leave-page confirmation only if something still failed to land |
| The same browser has two tabs open | not synchronised in stage 1: each tab writes whole records, so an unrelated edit in one tab can overwrite the other tab's newer `inputs/all` / `people/all` / `plan/all` / Leave War records (per-record week snapshots are only re-sent when they changed). Silent, no corruption. Stage 3's incoming side is the fix; until then, one tab per browser (8 Sep 26 bug pass) |

## Testing

All in the existing vitest suite, part of the normal gates.

1. **Contract tests** — `src/storage/contract.test.ts` exports
   `contractTests(makeBackend)` and runs it for Memory and Browser (jsdom
   localStorage). Cases: empty `loadAll`; put then loadAll round-trip;
   overwrite; remove; absent id; many puts across collections; a
   non-JSON value survives as a string (the backend does not parse); the
   Browser legacy import. Stage 4 runs the same function against the
   Dataverse adapter.
2. **Timing tests** — as built they live beside the code they pin
   (`src/state/persist.test.ts`, `src/storage/postman.test.ts`,
   `src/storage/boot.test.ts`, `src/leavewar/storage-seam.test.ts`) rather
   than in one `timing.test.ts`; the cases, with the Memory knobs:
   - undo during a slow save (`latency: 500`) restores exactly the
     previous whiteboard state;
   - the Leave War sync with delayed writes lands an approved leave on the
     schedule **once** (journal shows one `put` per record);
   - boot waits: with `latency` on `loadAll`, no render and no settings
     loader runs before it resolves;
   - `failNext(3)` then success: status goes `failed` → `saved`, the
     record arrives once, the whiteboard never changed;
   - `dropOne()`: the journal shows the put; a following `loadAll` on a
     fresh backend shows the loss — documents that stage 1 trusts the
     backend's ack (stage 3's version check catches this for real);
   - two different records changed within 300 ms produce two letters,
     never one;
   - every test starts from an empty Memory backend.
3. **Existing gates unchanged**: `npm test`, `npm run build`,
   `node reference/tfin.js` (728/0), `npm run test:e2e`,
   `npm run smoke:tracker`.

## Watch-areas (reviewer's checklist)

- Any read of a setting **before** the boot gate — module-scope
  `*Load()` calls (`rulesLoad` runs at module scope today; it must run
  again, or first, after the whiteboard is filled).
- The Leave War `SYNCING` flag and the two history baselines taken after
  the boot sync: their order relative to the gate must not change.
- `weekstash.ts`'s "session-only" doctrine: comments and the one test that
  pins it must be updated with the behaviour, not left contradicting it.
- The Tracker's Import must write through the whiteboard, never straight
  to `localStorage`.
- Coalescing must key on `collection/id`; never merge two records.
- Settings: `null` still means "standard" through the whole trip
  (`put` of the string `"null"` is a valid record; absent is also
  standard).
- `histSnap` must keep `i` for undo even though the week record drops it.
- The unload guard must not fire when status is `saved`, and must flush
  before it decides (a reload inside the coalesce wait must keep the edit).
- **Every mutation of persisted state must end in a history step or an
  explicit `persistPeople()`** (8 Sep 26 bug pass — the class of bug found
  most often: the Quals page's edits, Restore, the auto-archive on a PO
  date, a section drag calling the raw `histPush` instead of
  `HOOKS.histPush`). A new write path that bypasses `HOOKS.histPush` is
  a silent loss until proven otherwise.
- `loadWeek` must never let `persistAll` file the live DAYS while CURWEEK
  has moved on (the swap window, `persist.ts swapping`).
- Anything Leave War owns about a person beyond the projection (the PO
  window, an identity override) must be in a persisted record and laid
  back on by `setPeople`; `state.people` itself is never stored.

## How stages 2–4 attach

- **Stage 2 — stable row ids**: changes the *contents* of a week record
  (every row gains an id; `keys.ts` remaps become id lookups). The door is
  untouched.
- **Stage 3 — live-ish**: the contract gains
  `since(version): Promise<changes>`; the postman gains an incoming side
  (poll with backoff: 2 s editing on-screen, 15 s after a minute idle,
  60 s after five, off when hidden, one catch-up on return) that applies
  others' records to the whiteboard; presence rides the same poll; letters
  shrink to per-change deltas. Nothing above the whiteboard changes.
- **Stage 4 — Dataverse**: one new backend passing `contractTests`, plus
  Microsoft sign-in feeding `HOOKS.whoami()`.

## Out of scope for stage 1

Real sign-in (the two prototype accounts and `HOOKS.whoami()` stay);
per-change letters; any screen change beyond the indicator and the two error
surfaces; deleting legacy browser keys.

**Amended 8 Sep 26 — attachment bytes now persist per browser.** They were
out of scope at stage-1 design, but once the seam began saving the inputs
(and their `docId`), a persisted input on a reload showed a paperclip whose
blob was gone (owner, from the preview: "there is no persistence when I saved
documents on medical"). Blobs are still deliberately OFF the ~5 MB text seam;
they get their own drawer instead — IndexedDB `raptor-docs`
(`src/storage/docstore.ts`), wired by `docBoot` from `main.tsx` on the browser
backend only. `state/docs`' in-memory map stays the synchronous read path the
viewer needs in render; `docAdd` writes through, `docBoot` fills the cache
back at boot and advances the id counter past every stored id. A SHARED file
store (visible across people/devices) is still the later database step.

## What the 8 Sep 26 bug pass changed (implementation deltas)

Found by two code audits, a 34-scenario browser drive and one e2e failure;
each fixed and pinned by a test that was verified failing first:

- `loadWeek` swap window — the leaving week was filed under the arriving
  week's id (data corruption on any week change); a merely visited week was
  persisted when an input landed on it during the swap.
- `persistAll` reconciles the stored week records: undo back to the load
  state and the Admin "clear old data" sweep now delete what they undo.
- Page-leaving flush (`guardUnload`): reload/close inside the coalesce
  wait, and iOS Safari, no longer lose the last edit.
- `hydrate` rebuilds the callsign index and drops non-object rows.
- Section drag on the board, the auto-archive on a PO date, the Leave War
  posting-out window and identity overrides (`leavewar/postouts`,
  `leavewar/personedits`) and the LoX column list (`settings/qualcols`)
  are now persisted.
- The planning layer (`plan/all`) survives a logout — clearing it in
  memory destroyed the saved copy on the next edit. Owner-reversible.
- The Tracker reads a corrupt record as absent instead of dying.
- `?fresh=1` IGNORES the browser's data for that load; it does not wipe
  it. The "Not saved — Retry" state cannot be produced by losing wifi on
  this backend (browser storage needs no network) — only by a full or
  locked-down store.

## Public-repository rule

The Memory backend's seed and every test fixture use the existing invented
demo callsigns and dates only. No real names, marks or dates are ever
committed.
