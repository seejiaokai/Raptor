# Storage Seam (stage 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One storage door for the whole app — a synchronous in-memory whiteboard the app reads and writes as today, filled once at boot from an async backend, with a write-behind postman that coalesces, retries and reports status — plus a clean-start Memory mock with timing knobs and a Browser backend for the demo site.

**Architecture:** Everything above the whiteboard stays synchronous and untouched (engine, undo, Leave War sync, Tracker). The three existing doors (`storeBackend.impl`, Leave War `StorageBackend`, Tracker `storage`) are re-pointed at the whiteboard through thin adapters. Live scheduler state (inputs, people, planning layer, per-week snapshots) joins the whiteboard through `src/state/persist.ts`, driven off the existing `HOOKS.histPush` / new `HOOKS.histApplied` / `HOOKS.weekSwapped` hooks. `main.tsx` becomes an async boot: `loadAll` → fill → adapters → hydrate → today's boot sequence → render.

**Tech Stack:** TypeScript (strict, `verbatimModuleSyntax` → use `import type`), React 18, Vite, vitest (two projects: non-Leave-War files default to node with a per-file `// @vitest-environment jsdom` pragma; `src/leavewar/**` runs jsdom + globals), Playwright for e2e. Spec: `raptor-port/docs/superpowers/specs/2026-09-08-storage-seam-design.md`. Record shapes: `raptor-port/docs/data-schema.md`.

## Global Constraints

- All paths below are relative to `raptor-port/` unless they start with `docs/`, `HANDOFF.md`, `BUG-TESTING.md` or `.claude/` (repo root). Run every command from `raptor-port/`.
- New files use the Leave War style: 2-space indent, no semicolons, single quotes, `import type` for types.
- Repository is public: fixtures use only the existing invented demo callsigns/dates. No real names, marks or dates.
- Gates that must stay green before every commit that touches `src/`: `npm test`, `npm run build`. Before the final commit also `node reference/tfin.js` (must print 728 passed / 0 failed), `npm run test:e2e`, `npm run smoke:tracker`.
- Settings semantics: a `put` of the string `"null"` is a valid record meaning "shipped standard"; an absent record also means standard.
- Coalescing keys on `collection/id`; two different records never merge into one letter.
- Commit footer on every commit (verbatim):
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_016LFnjPuNLdJi2NmL6nPxW3
  ```
- Never push to any branch other than `claude/storage-seam`. Do not merge.

## Spec deltas (decided while planning — apply to the spec in Task 10)

1. The week record is the **week-stash snapshot** (`weekStashSnap()` in `src/state/store.ts`: `{d, c, p, ad, a, al, ok, sg, o, cv, dr, cd, wo, un}`), not "histSnap minus i". It is exactly what `applyWeekModel` restores, so hydration is a `stashPut`.
2. A seventh collection, `plan`, holds the planning layer (`{pp: PLANPUCKS, dm: DAYRMK}`) as one record `plan/all`. The spec had it riding the week record; it is global, like inputs.
3. Leave War persists **every key its `persist()` writes** (about twenty), not "eight". The adapter is key-agnostic.
4. Browser (Playwright) tests run the built site on the **Browser** backend in a fresh browser context per test (empty `localStorage`), which is the clean start the spec wants; they do not use Memory.

## File structure

| File | Responsibility |
|---|---|
| `src/storage/backend.ts` (new) | `Collection`, `Snapshot`, `Backend` contract, key helpers |
| `src/storage/whiteboard.ts` (new) | sync in-memory record map with change signal |
| `src/storage/memory.ts` (new) | `MemoryBackend` mock with knobs + `peek` |
| `src/storage/postman.ts` (new) | write-behind: coalesce, retry/backoff, status, flush |
| `src/storage/browser.ts` (new) | `BrowserBackend` over `localStorage` + one-time legacy import |
| `src/storage/adapters.ts` (new) | settings / Leave War / Tracker adapters over the whiteboard |
| `src/storage/boot.ts` (new) | `bootStorage`, `chooseBackend`, `guardUnload` |
| `src/storage/contract.test.ts` (new) | `contractTests(makeBackend)` + runs for Memory and Browser |
| `src/storage/*.test.ts` (new) | unit tests per module |
| `src/state/persist.ts` (new) | `hydrate`, `persistAll`, `persistPeople`, `wirePersist`, `isHydrated` |
| `src/state/persist.test.ts` (new) | hydration + timing tests (node) |
| `src/leavewar/storage-seam.test.ts` (new) | Leave War sync with delayed writes lands once (jsdom project) |
| `src/ui/SaveStatus.tsx` (new) | header indicator bound to postman status |
| `src/engine/hooks.ts` | add `histApplied` hook |
| `src/engine/inputs.ts`, `src/state/plan.ts` | id-counter seeding for hydrated records |
| `src/state/history.ts` | call `HOOKS.histApplied()` at the end of `histApply` |
| `src/state/store.ts` | export `weekStashSnap`, add `weekDirty`, gate seeds on hydration, restore a stashed current week in `initStore` |
| `src/engine/weekstash.ts` | header comment: session-only → persisted through the whiteboard |
| `src/tracker/storage.js` | pluggable sync target (`useStorageImpl`) |
| `src/leavewar/state/demoworld.ts` | gate the demo Raptor inputs on `!hadStoredWars` |
| `src/ui/QualsPage.tsx` | `persistPeople()` after quals tick / archive |
| `src/ui/Shell.tsx`, `src/ui/scheduler.css` | mount `<SaveStatus />` after the nav; `.savestat` rules |
| `src/main.tsx` | async boot with the gate and error screen |
| docs (Task 10) | spec deltas, `data-schema.md`, `CLAUDE.md`, `HANDOFF.md`, `BUG-TESTING.md` |

---

### Task 1: Backend contract and Whiteboard

**Files:**
- Create: `src/storage/backend.ts`
- Create: `src/storage/whiteboard.ts`
- Test: `src/storage/whiteboard.test.ts`

**Interfaces:**
- Produces: `type Collection`, `COLLECTIONS`, `type Snapshot`, `interface Backend { loadAll(); put(c,id,json); remove(c,id) }`, `emptySnapshot()`, `recordKey(c,id)`, `splitKey(key)`; `class Whiteboard { fill, get, has, keys, set, delete, subscribe, snapshot }`, `type Change = { collection, id, value: string | null }`.

- [ ] **Step 1: Write the failing test**

```ts
// src/storage/whiteboard.test.ts
import { describe, it, expect } from 'vitest'
import { Whiteboard } from './whiteboard'
import { emptySnapshot } from './backend'

describe('Whiteboard', () => {
  it('fills from a snapshot and reads back by collection/id', () => {
    const wb = new Whiteboard()
    const snap = emptySnapshot()
    snap.settings['rules'] = '{"v":{"dur":99},"s":{}}'
    wb.fill(snap)
    expect(wb.get('settings', 'rules')).toBe('{"v":{"dur":99},"s":{}}')
    expect(wb.get('settings', 'missing')).toBeNull()
    expect(wb.has('settings', 'rules')).toBe(true)
    expect(wb.keys('settings')).toEqual(['rules'])
  })

  it('set returns true only when the value changed, and notifies once per change', () => {
    const wb = new Whiteboard()
    const seen: any[] = []
    wb.subscribe(ch => seen.push(ch))
    expect(wb.set('inputs', 'all', '[]')).toBe(true)
    expect(wb.set('inputs', 'all', '[]')).toBe(false)
    expect(wb.set('inputs', 'all', '[1]')).toBe(true)
    expect(seen).toEqual([
      { collection: 'inputs', id: 'all', value: '[]' },
      { collection: 'inputs', id: 'all', value: '[1]' },
    ])
  })

  it('delete notifies with value null and is a no-op on an absent record', () => {
    const wb = new Whiteboard()
    const seen: any[] = []
    wb.subscribe(ch => seen.push(ch))
    expect(wb.delete('tracker', 'x')).toBe(false)
    wb.set('tracker', 'x', '1')
    expect(wb.delete('tracker', 'x')).toBe(true)
    expect(wb.get('tracker', 'x')).toBeNull()
    expect(seen[1]).toEqual({ collection: 'tracker', id: 'x', value: null })
  })

  it('a throwing listener does not break the caller or other listeners', () => {
    const wb = new Whiteboard()
    const seen: string[] = []
    wb.subscribe(() => { throw new Error('boom') })
    wb.subscribe(ch => seen.push(ch.id))
    expect(() => wb.set('weeks', '13-07-2026', '{}')).not.toThrow()
    expect(seen).toEqual(['13-07-2026'])
  })

  it('ids may contain slashes and dashes; snapshot() round-trips', () => {
    const wb = new Whiteboard()
    wb.set('tracker', 'v3:master', 'a')
    wb.set('weeks', '13-07-2026', 'b')
    const snap = wb.snapshot()
    expect(snap.tracker['v3:master']).toBe('a')
    expect(snap.weeks['13-07-2026']).toBe('b')
    const wb2 = new Whiteboard(); wb2.fill(snap)
    expect(wb2.get('weeks', '13-07-2026')).toBe('b')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/storage/whiteboard.test.ts`
Expected: FAIL — cannot resolve `./whiteboard` / `./backend`.

- [ ] **Step 3: Write the two modules**

```ts
// src/storage/backend.ts
/* THE STORAGE CONTRACT. Every backend — the Memory mock, the Browser store,
   the Dataverse adapter (stage 4) — implements exactly this. Values are JSON
   strings, never objects: a backend is a dumb key/value store and the record
   shapes (docs/data-schema.md) stay the app's business. */
export type Collection = 'settings' | 'weeks' | 'inputs' | 'people' | 'plan' | 'leavewar' | 'tracker'
export const COLLECTIONS: Collection[] = ['settings', 'weeks', 'inputs', 'people', 'plan', 'leavewar', 'tracker']

export type Snapshot = Record<Collection, Record<string, string>>

export interface Backend {
  /** Everything, once, at boot. */
  loadAll(): Promise<Snapshot>
  put(collection: Collection, id: string, json: string): Promise<void>
  remove(collection: Collection, id: string): Promise<void>
}

export function emptySnapshot(): Snapshot {
  const s = {} as Snapshot
  for (const c of COLLECTIONS) s[c] = {}
  return s
}

export const isCollection = (x: string): x is Collection => (COLLECTIONS as string[]).includes(x)

/* `collection/id` — the id may itself contain '/' (none do today, but the
   Tracker's free-text keys could), so split on the FIRST separator only. */
export const recordKey = (collection: Collection, id: string) => `${collection}/${id}`
export function splitKey(key: string): [Collection, string] {
  const i = key.indexOf('/')
  return [key.slice(0, i) as Collection, key.slice(i + 1)]
}
```

```ts
// src/storage/whiteboard.ts
/* THE WHITEBOARD — the app's working memory, made explicit. Synchronous,
   instant, never throws, never waits. Filled once at boot from
   Backend.loadAll(); everything above it (engine, undo, Leave War sync,
   Tracker) keeps today's synchronous assumptions. The postman subscribes
   here and is the only thing that ever talks to a backend after boot. */
import { type Collection, type Snapshot, emptySnapshot, recordKey } from './backend'

export type Change = { collection: Collection; id: string; value: string | null }
export type Listener = (change: Change) => void

export class Whiteboard {
  private map = new Map<string, string>()
  private listeners = new Set<Listener>()

  fill(snap: Snapshot): void {
    this.map.clear()
    for (const c of Object.keys(snap) as Collection[]) {
      for (const id of Object.keys(snap[c])) this.map.set(recordKey(c, id), snap[c][id])
    }
  }

  get(collection: Collection, id: string): string | null {
    return this.map.get(recordKey(collection, id)) ?? null
  }

  has(collection: Collection, id: string): boolean {
    return this.map.has(recordKey(collection, id))
  }

  keys(collection: Collection): string[] {
    const prefix = collection + '/'
    const out: string[] = []
    for (const k of this.map.keys()) if (k.startsWith(prefix)) out.push(k.slice(prefix.length))
    return out
  }

  /** true when the stored value changed (a same-value set is silent). */
  set(collection: Collection, id: string, value: string): boolean {
    const k = recordKey(collection, id)
    if (this.map.get(k) === value) return false
    this.map.set(k, value)
    this.emit({ collection, id, value })
    return true
  }

  delete(collection: Collection, id: string): boolean {
    const k = recordKey(collection, id)
    if (!this.map.has(k)) return false
    this.map.delete(k)
    this.emit({ collection, id, value: null })
    return true
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  snapshot(): Snapshot {
    const snap = emptySnapshot()
    for (const [k, v] of this.map) {
      const i = k.indexOf('/')
      const c = k.slice(0, i) as Collection
      if (snap[c]) snap[c][k.slice(i + 1)] = v
    }
    return snap
  }

  private emit(change: Change): void {
    for (const l of [...this.listeners]) {
      try { l(change) } catch (e) { console.error('whiteboard listener threw', e) }
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/storage/whiteboard.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/storage/backend.ts src/storage/whiteboard.ts src/storage/whiteboard.test.ts
git commit -m "storage: Backend contract and Whiteboard (stage 1 seam, part 1)"
```

---

### Task 2: MemoryBackend mock with knobs, and the contract test harness

**Files:**
- Create: `src/storage/memory.ts`
- Create: `src/storage/contract.test.ts`
- Test: `src/storage/memory.test.ts`

**Interfaces:**
- Consumes: `Backend`, `Snapshot`, `emptySnapshot`, `Collection` from Task 1.
- Produces: `class MemoryBackend implements Backend` with `latency: number`, `shuffle: boolean`, `journal: JournalEntry[]`, `seed(partial)`, `failNext(n)`, `dropOne()`, `peek(c,id): string | null`; `export function contractTests(name: string, make: () => Backend | Promise<Backend>): void` (a `describe` block factory).

- [ ] **Step 1: Write the failing tests**

```ts
// src/storage/contract.test.ts
/* THE CONTRACT every backend must pass. Stage 4 runs this same function
   against the Dataverse adapter; if it passes, the app cannot tell the
   difference. Add a case here, never in a backend's own test file. */
import { describe, it, expect } from 'vitest'
import type { Backend } from './backend'
import { MemoryBackend } from './memory'

export function contractTests(name: string, make: () => Backend | Promise<Backend>): void {
  describe(`Backend contract: ${name}`, () => {
    it('loadAll on an empty store returns every collection, empty', async () => {
      const b = await make()
      const snap = await b.loadAll()
      expect(Object.keys(snap).sort()).toEqual(['inputs', 'leavewar', 'people', 'plan', 'settings', 'tracker', 'weeks'])
      for (const c of Object.values(snap)) expect(c).toEqual({})
    })
    it('put then loadAll round-trips the exact string', async () => {
      const b = await make()
      await b.put('settings', 'rules', '{"v":{"dur":99},"s":{}}')
      const snap = await b.loadAll()
      expect(snap.settings['rules']).toBe('{"v":{"dur":99},"s":{}}')
    })
    it('a later put overwrites', async () => {
      const b = await make()
      await b.put('inputs', 'all', '[1]')
      await b.put('inputs', 'all', '[2]')
      expect((await b.loadAll()).inputs['all']).toBe('[2]')
    })
    it('remove deletes; removing an absent id is not an error', async () => {
      const b = await make()
      await b.put('weeks', '13-07-2026', '{}')
      await b.remove('weeks', '13-07-2026')
      await b.remove('weeks', 'never-there')
      expect((await b.loadAll()).weeks).toEqual({})
    })
    it('many puts across collections all come back', async () => {
      const b = await make()
      await b.put('settings', 'daytpl', 'null')
      await b.put('leavewar', 'wars', '[]')
      await b.put('tracker', 'v3:master', '{"order":[]}')
      await b.put('plan', 'all', '{"pp":[],"dm":{}}')
      const snap = await b.loadAll()
      expect(snap.settings['daytpl']).toBe('null')
      expect(snap.leavewar['wars']).toBe('[]')
      expect(snap.tracker['v3:master']).toBe('{"order":[]}')
      expect(snap.plan['all']).toBe('{"pp":[],"dm":{}}')
    })
    it('does not parse values: a non-JSON string survives untouched', async () => {
      const b = await make()
      await b.put('leavewar', 'current', 'war-2026')
      expect((await b.loadAll()).leavewar['current']).toBe('war-2026')
    })
  })
}

contractTests('MemoryBackend', () => new MemoryBackend())
```

```ts
// src/storage/memory.test.ts
import { describe, it, expect, vi } from 'vitest'
import { MemoryBackend } from './memory'

describe('MemoryBackend knobs', () => {
  it('latency delays every call by the configured ms', async () => {
    vi.useFakeTimers()
    const b = new MemoryBackend(); b.latency = 500
    let done = false
    b.put('inputs', 'all', '[]').then(() => { done = true })
    await vi.advanceTimersByTimeAsync(499)
    expect(done).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(done).toBe(true)
    vi.useRealTimers()
  })
  it('failNext(n) rejects the next n calls, then works', async () => {
    const b = new MemoryBackend(); b.failNext(2)
    await expect(b.put('inputs', 'all', '[]')).rejects.toThrow()
    await expect(b.put('inputs', 'all', '[]')).rejects.toThrow()
    await expect(b.put('inputs', 'all', '[1]')).resolves.toBeUndefined()
    expect(b.peek('inputs', 'all')).toBe('[1]')
  })
  it('dropOne() acknowledges the next put but stores nothing', async () => {
    const b = new MemoryBackend(); b.dropOne()
    await b.put('inputs', 'all', '[1]')
    expect(b.peek('inputs', 'all')).toBeNull()
    await b.put('inputs', 'all', '[2]')
    expect(b.peek('inputs', 'all')).toBe('[2]')
  })
  it('journal records every call in order', async () => {
    const b = new MemoryBackend()
    await b.put('settings', 'rules', 'null')
    await b.remove('settings', 'rules')
    await b.loadAll()
    expect(b.journal.map(j => j.op)).toEqual(['put', 'remove', 'loadAll'])
    expect(b.journal[0]).toMatchObject({ collection: 'settings', id: 'rules' })
  })
  it('seed pre-fills before loadAll', async () => {
    const b = new MemoryBackend()
    b.seed({ settings: { rules: '{"v":{},"s":{}}' } })
    expect((await b.loadAll()).settings['rules']).toBe('{"v":{},"s":{}}')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/storage/contract.test.ts src/storage/memory.test.ts`
Expected: FAIL — cannot resolve `./memory`.

- [ ] **Step 3: Write MemoryBackend**

```ts
// src/storage/memory.ts
/* THE MOCK DATABASE — what sits behind the whiteboard in development and in
   every test. A clean start every time, plus the knobs the timing tests turn:
   latency (the letter takes time), failNext (the post office is down),
   dropOne (a letter is lost but acknowledged), shuffle (letters arrive out
   of order), and a journal of every call for assertions. */
import { type Backend, type Collection, type Snapshot, emptySnapshot } from './backend'

export type JournalEntry = { op: 'loadAll' | 'put' | 'remove'; collection?: Collection; id?: string; at: number }

export class MemoryBackend implements Backend {
  latency = 0
  shuffle = false
  journal: JournalEntry[] = []
  private data: Snapshot = emptySnapshot()
  private failing = 0
  private dropping = 0
  private seq = 0

  seed(partial: Partial<Snapshot>): void {
    for (const c of Object.keys(partial) as Collection[]) Object.assign(this.data[c], partial[c])
  }
  failNext(n: number): void { this.failing = n }
  dropOne(): void { this.dropping += 1 }
  /** test-only read, no latency, no journal */
  peek(collection: Collection, id: string): string | null {
    return this.data[collection][id] ?? null
  }

  async loadAll(): Promise<Snapshot> {
    await this.wait()
    this.journal.push({ op: 'loadAll', at: ++this.seq })
    this.check()
    return JSON.parse(JSON.stringify(this.data))
  }

  async put(collection: Collection, id: string, json: string): Promise<void> {
    await this.wait()
    this.journal.push({ op: 'put', collection, id, at: ++this.seq })
    this.check()
    if (this.dropping > 0) { this.dropping -= 1; return }
    this.data[collection][id] = json
  }

  async remove(collection: Collection, id: string): Promise<void> {
    await this.wait()
    this.journal.push({ op: 'remove', collection, id, at: ++this.seq })
    this.check()
    delete this.data[collection][id]
  }

  private check(): void {
    if (this.failing > 0) { this.failing -= 1; throw new Error('MemoryBackend: simulated failure') }
  }

  private wait(): Promise<void> {
    const extra = this.shuffle && this.latency > 0 ? Math.floor(Math.random() * this.latency) : 0
    const ms = this.latency + extra
    return ms > 0 ? new Promise(r => setTimeout(r, ms)) : Promise.resolve()
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/storage/contract.test.ts src/storage/memory.test.ts`
Expected: PASS (6 contract + 5 knob tests).

- [ ] **Step 5: Commit**

```bash
git add src/storage/memory.ts src/storage/memory.test.ts src/storage/contract.test.ts
git commit -m "storage: MemoryBackend mock with timing knobs + the backend contract tests"
```

---

### Task 3: Postman — write behind with coalescing, retry and status

**Files:**
- Create: `src/storage/postman.ts`
- Test: `src/storage/postman.test.ts`

**Interfaces:**
- Consumes: `Whiteboard`, `Change` (Task 1); `Backend`, `recordKey` (Task 1); `MemoryBackend` (Task 2, tests only).
- Produces: `type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'failed'`; `class Postman { constructor(backend, opts?); attach(wb); detach(); status; onStatus(fn): () => void; flush(): Promise<void>; hasWork(): boolean }`.

- [ ] **Step 1: Write the failing test**

```ts
// src/storage/postman.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Whiteboard } from './whiteboard'
import { MemoryBackend } from './memory'
import { Postman } from './postman'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

function rig(latency = 0) {
  const be = new MemoryBackend(); be.latency = latency
  const wb = new Whiteboard()
  const pm = new Postman(be)
  pm.attach(wb)
  return { be, wb, pm }
}

describe('Postman', () => {
  it('coalesces rapid edits to ONE record into one letter, sending the last value', async () => {
    const { be, wb, pm } = rig()
    wb.set('inputs', 'all', '[1]')
    wb.set('inputs', 'all', '[2]')
    wb.set('inputs', 'all', '[3]')
    expect(pm.status).toBe('unsaved')
    await vi.advanceTimersByTimeAsync(300)
    expect(be.journal.filter(j => j.op === 'put')).toHaveLength(1)
    expect(be.peek('inputs', 'all')).toBe('[3]')
    expect(pm.status).toBe('saved')
  })

  it('never merges two DIFFERENT records', async () => {
    const { be, wb } = rig()
    wb.set('inputs', 'all', '[]')
    wb.set('people', 'all', '{}')
    await vi.advanceTimersByTimeAsync(300)
    expect(be.journal.filter(j => j.op === 'put').map(j => `${j.collection}/${j.id}`).sort()).toEqual(['inputs/all', 'people/all'])
  })

  it('a delete on the whiteboard becomes a remove', async () => {
    const { be, wb } = rig()
    wb.set('tracker', 'x', '1')
    await vi.advanceTimersByTimeAsync(300)
    wb.delete('tracker', 'x')
    await vi.advanceTimersByTimeAsync(300)
    expect(be.journal.map(j => j.op)).toEqual(['put', 'remove'])
    expect(be.peek('tracker', 'x')).toBeNull()
  })

  it('reports saving while a letter is in flight', async () => {
    const { wb, pm } = rig(500)
    wb.set('inputs', 'all', '[]')
    await vi.advanceTimersByTimeAsync(300)
    expect(pm.status).toBe('saving')
    await vi.advanceTimersByTimeAsync(500)
    expect(pm.status).toBe('saved')
  })

  it('retries with backoff after failures, the whiteboard is never rolled back, then saved', async () => {
    const { be, wb, pm } = rig()
    const seen: string[] = []
    pm.onStatus(s => seen.push(s))
    be.failNext(3)
    wb.set('inputs', 'all', '[1]')
    await vi.advanceTimersByTimeAsync(300)          // attempt 1 fails
    expect(pm.status).toBe('failed')
    expect(wb.get('inputs', 'all')).toBe('[1]')
    await vi.advanceTimersByTimeAsync(1000)         // attempt 2 fails (1s)
    await vi.advanceTimersByTimeAsync(2000)         // attempt 3 fails (2s)
    expect(pm.status).toBe('failed')
    await vi.advanceTimersByTimeAsync(4000)         // attempt 4 succeeds (4s)
    expect(pm.status).toBe('saved')
    expect(be.peek('inputs', 'all')).toBe('[1]')
    expect(be.journal.filter(j => j.op === 'put')).toHaveLength(4)
    expect(seen.at(-1)).toBe('saved')
  })

  it('a newer value written during a failed retry wins', async () => {
    const { be, wb } = rig()
    be.failNext(1)
    wb.set('inputs', 'all', '[1]')
    await vi.advanceTimersByTimeAsync(300)          // fails
    wb.set('inputs', 'all', '[2]')                  // newer value while waiting to retry
    await vi.advanceTimersByTimeAsync(1000)
    expect(be.peek('inputs', 'all')).toBe('[2]')
    expect(be.journal.filter(j => j.op === 'put')).toHaveLength(2)
  })

  it('flush sends everything queued immediately', async () => {
    const { be, wb, pm } = rig()
    wb.set('inputs', 'all', '[]')
    wb.set('people', 'all', '{}')
    await pm.flush()
    expect(be.journal.filter(j => j.op === 'put')).toHaveLength(2)
    expect(pm.hasWork()).toBe(false)
  })

  it('hasWork is true while anything is queued, in flight or failed', async () => {
    const { be, wb, pm } = rig(200)
    expect(pm.hasWork()).toBe(false)
    wb.set('inputs', 'all', '[]')
    expect(pm.hasWork()).toBe(true)
    await vi.advanceTimersByTimeAsync(300)
    expect(pm.hasWork()).toBe(true)                 // in flight
    await vi.advanceTimersByTimeAsync(200)
    expect(pm.hasWork()).toBe(false)
    be.failNext(1)
    wb.set('inputs', 'all', '[1]')
    await vi.advanceTimersByTimeAsync(500)
    expect(pm.hasWork()).toBe(true)                 // failed, retry pending
  })

  it('detach stops listening', async () => {
    const { be, wb, pm } = rig()
    pm.detach()
    wb.set('inputs', 'all', '[]')
    await vi.advanceTimersByTimeAsync(300)
    expect(be.journal).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/storage/postman.test.ts`
Expected: FAIL — cannot resolve `./postman`.

- [ ] **Step 3: Write the Postman**

```ts
// src/storage/postman.ts
/* THE POSTMAN — write behind. Watches the whiteboard; every change is a
   letter to the backend. Rules (spec §postman): coalesce per record for
   300 ms (rapid edits to one record collapse into one letter; different
   records never merge); one send in flight per record, in order; on
   failure back off 1s → 2s → 4s … capped at 30s, for ever, never rolling
   the whiteboard back; one status value for the header indicator. */
import type { Backend } from './backend'
import { recordKey } from './backend'
import type { Change, Whiteboard } from './whiteboard'

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'failed'
export type PostmanOptions = { coalesceMs: number; maxBackoffMs: number }

export class Postman {
  private pending = new Map<string, Change>()
  private timers = new Map<string, ReturnType<typeof setTimeout>>()
  private inflight = new Set<string>()
  private failed = new Map<string, number>()
  private listeners = new Set<(s: SaveStatus) => void>()
  private unsub: (() => void) | null = null
  private last: SaveStatus = 'saved'
  private opts: PostmanOptions

  constructor(private backend: Backend, opts?: Partial<PostmanOptions>) {
    this.opts = { coalesceMs: 300, maxBackoffMs: 30000, ...opts }
  }

  attach(wb: Whiteboard): void { this.unsub = wb.subscribe(ch => this.enqueue(ch)) }
  detach(): void { this.unsub?.(); this.unsub = null }

  get status(): SaveStatus {
    if (this.failed.size) return 'failed'
    if (this.inflight.size) return 'saving'
    if (this.pending.size) return 'unsaved'
    return 'saved'
  }
  onStatus(fn: (s: SaveStatus) => void): () => void {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }
  hasWork(): boolean { return this.pending.size > 0 || this.inflight.size > 0 || this.failed.size > 0 }

  /** send everything queued now, ignoring the coalesce wait */
  async flush(): Promise<void> {
    const keys = [...this.pending.keys()]
    for (const k of keys) this.clearTimer(k)
    await Promise.all(keys.map(k => this.send(k)))
  }

  private enqueue(ch: Change): void {
    const key = recordKey(ch.collection, ch.id)
    this.pending.set(key, ch)
    this.clearTimer(key)
    if (!this.inflight.has(key)) this.timers.set(key, setTimeout(() => { void this.send(key) }, this.opts.coalesceMs))
    this.notify()
  }

  private clearTimer(key: string): void {
    const t = this.timers.get(key)
    if (t !== undefined) { clearTimeout(t); this.timers.delete(key) }
  }

  private async send(key: string): Promise<void> {
    this.timers.delete(key)
    if (this.inflight.has(key)) return            // the running send re-checks pending when done
    const ch = this.pending.get(key)
    if (!ch) return
    this.pending.delete(key)
    this.inflight.add(key)
    this.notify()
    try {
      if (ch.value === null) await this.backend.remove(ch.collection, ch.id)
      else await this.backend.put(ch.collection, ch.id, ch.value)
      this.failed.delete(key)
    } catch (e) {
      const n = (this.failed.get(key) ?? 0) + 1
      this.failed.set(key, n)
      if (!this.pending.has(key)) this.pending.set(key, ch)   // a newer value, if any, wins
      this.clearTimer(key)
      const delay = Math.min(this.opts.maxBackoffMs, 1000 * 2 ** (n - 1))
      this.inflight.delete(key)
      this.timers.set(key, setTimeout(() => { void this.send(key) }, delay))
      this.notify()
      return
    }
    this.inflight.delete(key)
    if (this.pending.has(key) && !this.timers.has(key)) {
      this.timers.set(key, setTimeout(() => { void this.send(key) }, this.opts.coalesceMs))
    }
    this.notify()
  }

  private notify(): void {
    const s = this.status
    if (s === this.last) return
    this.last = s
    for (const l of [...this.listeners]) { try { l(s) } catch (e) { console.error('postman listener threw', e) } }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/storage/postman.test.ts`
Expected: PASS (9 tests). If the backoff test is off by a tick, the cause is the fake-timer advance boundaries; the delays are exactly 1000 / 2000 / 4000 ms after each failure and the coalesce wait is exactly 300 ms.

- [ ] **Step 5: Commit**

```bash
git add src/storage/postman.ts src/storage/postman.test.ts
git commit -m "storage: Postman — write-behind with per-record coalescing, backoff retry and status"
```

---

### Task 4: BrowserBackend with one-time legacy import

**Files:**
- Create: `src/storage/browser.ts`
- Test: `src/storage/browser.test.ts`
- Modify: `src/storage/contract.test.ts` (add the Browser run)

**Interfaces:**
- Consumes: `Backend`, `Snapshot`, `emptySnapshot`, `isCollection`, `recordKey`, `splitKey` (Task 1); `contractTests` (Task 2).
- Produces: `class BrowserBackend implements Backend { constructor(ls?: Storage) }`, `export const BROWSER_PREFIX = 'raptor:'`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/storage/browser.test.ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserBackend, BROWSER_PREFIX } from './browser'

beforeEach(() => { localStorage.clear() })

describe('BrowserBackend', () => {
  it('stores each record at raptor:<collection>/<id>', async () => {
    const b = new BrowserBackend()
    await b.put('settings', 'rules', 'null')
    expect(localStorage.getItem(BROWSER_PREFIX + 'settings/rules')).toBe('null')
    await b.remove('settings', 'rules')
    expect(localStorage.getItem(BROWSER_PREFIX + 'settings/rules')).toBeNull()
  })

  it('ignores raptor: keys whose collection is unknown', async () => {
    localStorage.setItem(BROWSER_PREFIX + 'bogus/x', '1')
    const snap = await new BrowserBackend().loadAll()
    expect(Object.values(snap).every(c => Object.keys(c).length === 0)).toBe(true)
  })

  it('imports legacy sqn142_* and ocu:* keys ONCE when no raptor: keys exist, and writes them under raptor:', async () => {
    localStorage.setItem('sqn142_rules', '{"v":{"dur":99},"s":{}}')
    localStorage.setItem('ocu:v3:courses', '["A"]')
    localStorage.setItem('leavewar:wars', '[]')        // unwired today — must be ignored
    const snap = await new BrowserBackend().loadAll()
    expect(snap.settings['rules']).toBe('{"v":{"dur":99},"s":{}}')
    expect(snap.tracker['v3:courses']).toBe('["A"]')
    expect(snap.leavewar).toEqual({})
    expect(localStorage.getItem(BROWSER_PREFIX + 'settings/rules')).toBe('{"v":{"dur":99},"s":{}}')
    expect(localStorage.getItem(BROWSER_PREFIX + 'tracker/v3:courses')).toBe('["A"]')
    expect(localStorage.getItem('sqn142_rules')).not.toBeNull()   // legacy keys are never deleted
  })

  it('does not import legacy keys when raptor: keys already exist', async () => {
    localStorage.setItem(BROWSER_PREFIX + 'settings/daytpl', 'null')
    localStorage.setItem('sqn142_rules', '{"v":{"dur":1},"s":{}}')
    const snap = await new BrowserBackend().loadAll()
    expect(snap.settings['rules']).toBeUndefined()
    expect(snap.settings['daytpl']).toBe('null')
  })

  it('put rejects when the store throws (quota / private mode) instead of throwing into the caller', async () => {
    const broken = { setItem() { throw new Error('QuotaExceededError') }, removeItem() {}, getItem() { return null }, key() { return null }, length: 0, clear() {} } as unknown as Storage
    const b = new BrowserBackend(broken)
    await expect(b.put('inputs', 'all', '[]')).rejects.toThrow()
  })
})
```

And append to `src/storage/contract.test.ts` (below the Memory run):

```ts
import { BrowserBackend } from './browser'
// the Browser run needs a DOM; the file-level pragma applies to the whole file,
// so add `// @vitest-environment jsdom` as the FIRST line of contract.test.ts
contractTests('BrowserBackend', () => { localStorage.clear(); return new BrowserBackend() })
```

Put `// @vitest-environment jsdom` as line 1 of `src/storage/contract.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/storage/browser.test.ts src/storage/contract.test.ts`
Expected: FAIL — cannot resolve `./browser`.

- [ ] **Step 3: Write BrowserBackend**

```ts
// src/storage/browser.ts
/* THE DEMO-SITE BACKEND — browser storage, per browser, no sharing. Each
   record lives at `raptor:<collection>/<id>`. On the first load of a browser
   that used the site before the seam, the legacy `sqn142_*` (settings) and
   `ocu:*` (Tracker) keys are imported once and written under `raptor:` so
   later loads find them there; legacy keys are never deleted. The unwired
   `leavewar:*` keys are ignored (main.tsx booted Leave War on memory). */
import { type Backend, type Collection, type Snapshot, emptySnapshot, isCollection, recordKey, splitKey } from './backend'

export const BROWSER_PREFIX = 'raptor:'
const LEGACY: Array<[string, Collection]> = [['sqn142_', 'settings'], ['ocu:', 'tracker']]

export class BrowserBackend implements Backend {
  constructor(private ls: Storage = localStorage) {}

  async loadAll(): Promise<Snapshot> {
    const snap = emptySnapshot()
    let found = false
    for (let i = 0; i < this.ls.length; i++) {
      const k = this.ls.key(i)
      if (!k || !k.startsWith(BROWSER_PREFIX)) continue
      found = true
      const [c, id] = splitKey(k.slice(BROWSER_PREFIX.length))
      if (!isCollection(c)) continue
      const v = this.ls.getItem(k)
      if (v != null) snap[c][id] = v
    }
    if (!found) this.importLegacy(snap)
    return snap
  }

  async put(collection: Collection, id: string, json: string): Promise<void> {
    this.ls.setItem(BROWSER_PREFIX + recordKey(collection, id), json)   // a throw rejects → postman retries
  }

  async remove(collection: Collection, id: string): Promise<void> {
    this.ls.removeItem(BROWSER_PREFIX + recordKey(collection, id))
  }

  private importLegacy(snap: Snapshot): void {
    const keys: string[] = []
    for (let i = 0; i < this.ls.length; i++) { const k = this.ls.key(i); if (k) keys.push(k) }
    for (const k of keys) {
      for (const [prefix, c] of LEGACY) {
        if (!k.startsWith(prefix)) continue
        const id = k.slice(prefix.length)
        const v = this.ls.getItem(k)
        if (v == null) continue
        snap[c][id] = v
        try { this.ls.setItem(BROWSER_PREFIX + recordKey(c, id), v) } catch (e) { /* read-only store: import still serves this boot */ }
      }
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/storage/browser.test.ts src/storage/contract.test.ts`
Expected: PASS (5 browser + 12 contract).

- [ ] **Step 5: Commit**

```bash
git add src/storage/browser.ts src/storage/browser.test.ts src/storage/contract.test.ts
git commit -m "storage: BrowserBackend for the demo site, with one-time legacy key import"
```

---

### Task 5: Boot gate, backend choice, and the three door adapters

**Files:**
- Create: `src/storage/boot.ts`
- Create: `src/storage/adapters.ts`
- Test: `src/storage/boot.test.ts`, `src/storage/adapters.test.ts`

**Interfaces:**
- Consumes: Tasks 1–4; Leave War's `StorageBackend` type from `src/leavewar/state/storage.ts` (`{ read(key): string | null; write(key, value): void }`).
- Produces: `bootStorage(backend): Promise<{ wb: Whiteboard; postman: Postman }>`; `chooseBackend(env?, search?, ls?): Backend`; `guardUnload(postman, win?)`; `settingsAdapter(wb): { getItem(k): string | null; setItem(k, v): void }`; `leavewarAdapter(wb): StorageBackend`; `trackerTarget(wb): { get(k): string | null; set(k, v): void; remove(k): void; keys(): string[] }`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/storage/boot.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { bootStorage, chooseBackend } from './boot'
import { MemoryBackend } from './memory'
import { BrowserBackend } from './browser'

afterEach(() => { vi.useRealTimers() })

describe('bootStorage', () => {
  it('waits for loadAll before returning a filled whiteboard with the postman attached', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend(); be.latency = 100
    be.seed({ settings: { rules: '{"v":{"dur":99},"s":{}}' } })
    let done = false
    const p = bootStorage(be).then(r => { done = true; return r })
    await vi.advanceTimersByTimeAsync(50)
    expect(done).toBe(false)
    await vi.advanceTimersByTimeAsync(50)
    const { wb, postman } = await p
    expect(done).toBe(true)
    expect(wb.get('settings', 'rules')).toBe('{"v":{"dur":99},"s":{}}')
    wb.set('settings', 'rules', 'null')
    await vi.advanceTimersByTimeAsync(300 + 100)
    expect(be.peek('settings', 'rules')).toBe('null')
    expect(postman.status).toBe('saved')
  })
  it('rejects when loadAll fails, and nothing is attached', async () => {
    const be = new MemoryBackend(); be.failNext(1)
    await expect(bootStorage(be)).rejects.toThrow()
  })
})

describe('chooseBackend', () => {
  const fake = { length: 0, key: () => null, getItem: () => null, setItem() {}, removeItem() {}, clear() {} } as unknown as Storage
  it('?fresh=1 always means Memory', () => {
    expect(chooseBackend({ MODE: 'production', DEV: false }, '?fresh=1', fake)).toBeInstanceOf(MemoryBackend)
  })
  it('tests and VITE_STORAGE=memory mean Memory', () => {
    expect(chooseBackend({ MODE: 'test', DEV: false }, '', fake)).toBeInstanceOf(MemoryBackend)
    expect(chooseBackend({ MODE: 'production', DEV: false, VITE_STORAGE: 'memory' }, '', fake)).toBeInstanceOf(MemoryBackend)
  })
  it('dev defaults to Memory unless VITE_STORAGE=browser', () => {
    expect(chooseBackend({ MODE: 'development', DEV: true }, '', fake)).toBeInstanceOf(MemoryBackend)
    expect(chooseBackend({ MODE: 'development', DEV: true, VITE_STORAGE: 'browser' }, '', fake)).toBeInstanceOf(BrowserBackend)
  })
  it('a built site defaults to Browser, falling back to Memory when storage is unusable', () => {
    expect(chooseBackend({ MODE: 'production', DEV: false }, '', fake)).toBeInstanceOf(BrowserBackend)
    const broken = { get length() { throw new Error('denied') } } as unknown as Storage
    expect(chooseBackend({ MODE: 'production', DEV: false }, '', broken)).toBeInstanceOf(MemoryBackend)
  })
})
```

```ts
// src/storage/adapters.test.ts
import { describe, it, expect } from 'vitest'
import { Whiteboard } from './whiteboard'
import { settingsAdapter, leavewarAdapter, trackerTarget } from './adapters'

describe('adapters', () => {
  it('settingsAdapter strips the sqn142_ prefix both ways', () => {
    const wb = new Whiteboard()
    const a = settingsAdapter(wb)
    a.setItem('sqn142_rules', 'null')
    expect(wb.get('settings', 'rules')).toBe('null')
    expect(a.getItem('sqn142_rules')).toBe('null')
    expect(a.getItem('sqn142_missing')).toBeNull()
  })
  it('leavewarAdapter maps read/write to the leavewar collection', () => {
    const wb = new Whiteboard()
    const a = leavewarAdapter(wb)
    expect(a.read('wars')).toBeNull()
    a.write('wars', '[]')
    expect(wb.get('leavewar', 'wars')).toBe('[]')
    expect(a.read('wars')).toBe('[]')
  })
  it('trackerTarget maps get/set/remove/keys to the tracker collection', () => {
    const wb = new Whiteboard()
    const t = trackerTarget(wb)
    t.set('v3:master', '{}'); t.set('v3:courses', '[]')
    expect(t.get('v3:master')).toBe('{}')
    expect(t.keys().sort()).toEqual(['v3:courses', 'v3:master'])
    t.remove('v3:master')
    expect(t.get('v3:master')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/storage/boot.test.ts src/storage/adapters.test.ts`
Expected: FAIL — cannot resolve `./boot` / `./adapters`.

- [ ] **Step 3: Write boot.ts and adapters.ts**

```ts
// src/storage/boot.ts
/* THE GATE. The one place the app waits: loadAll, fill the whiteboard,
   start the postman, and only then may main.tsx run today's boot sequence
   and draw. A rejected loadAll boots nothing (main.tsx shows Retry). */
import type { Backend } from './backend'
import { Whiteboard } from './whiteboard'
import { Postman } from './postman'
import { MemoryBackend } from './memory'
import { BrowserBackend } from './browser'

export async function bootStorage(backend: Backend): Promise<{ wb: Whiteboard; postman: Postman }> {
  const snap = await backend.loadAll()
  const wb = new Whiteboard()
  wb.fill(snap)
  const postman = new Postman(backend)
  postman.attach(wb)
  return { wb, postman }
}

/* Which backend (spec §Backend choice): ?fresh=1 → Memory; tests or
   VITE_STORAGE=memory → Memory; `vite` dev → Memory unless
   VITE_STORAGE=browser; a built site → Browser, or Memory when browser
   storage cannot even be touched (locked-down / private browsing). */
export function chooseBackend(
  env: Record<string, any> = import.meta.env as any,
  search: string = typeof location !== 'undefined' ? location.search : '',
  ls?: Storage,
): Backend {
  if (/[?&]fresh=1(&|$)/.test(search)) return new MemoryBackend()
  if (env.MODE === 'test' || env.VITE_STORAGE === 'memory') return new MemoryBackend()
  if (env.DEV && env.VITE_STORAGE !== 'browser') return new MemoryBackend()
  try {
    const store = ls ?? localStorage
    void store.length
    return new BrowserBackend(store)
  } catch (e) {
    return new MemoryBackend()
  }
}

/* Leaving the page with letters still queued or failed asks the browser's
   "are you sure?" — the only UI the postman has besides the indicator. */
export function guardUnload(postman: Postman, win: Window = window): void {
  win.addEventListener('beforeunload', e => {
    if (!postman.hasWork()) return
    e.preventDefault()
    e.returnValue = ''
  })
}
```

```ts
// src/storage/adapters.ts
/* THE THREE EXISTING DOORS, RE-POINTED. Nothing above a door changes: the
   scheduler's `store` (engine/hooks.ts) still calls getItem/setItem with its
   sqn142_ prefix, Leave War's store still calls read/write, the Tracker's
   storage.js still exposes its async get/set/delete/list. Each now lands
   on the whiteboard, which is the one thing with a route to a backend. */
import type { Whiteboard } from './whiteboard'
import type { StorageBackend } from '../leavewar/state/storage'

const SQN = 'sqn142_'
const strip = (k: string) => (k.startsWith(SQN) ? k.slice(SQN.length) : k)

export function settingsAdapter(wb: Whiteboard): { getItem(k: string): string | null; setItem(k: string, v: string): void } {
  return {
    getItem: k => wb.get('settings', strip(k)),
    setItem: (k, v) => { wb.set('settings', strip(k), v) },
  }
}

export function leavewarAdapter(wb: Whiteboard): StorageBackend {
  return {
    read: key => wb.get('leavewar', key),
    write: (key, value) => { wb.set('leavewar', key, value) },
  }
}

/* the sync target tracker/storage.js's useStorageImpl accepts */
export function trackerTarget(wb: Whiteboard): { get(k: string): string | null; set(k: string, v: string): void; remove(k: string): void; keys(): string[] } {
  return {
    get: k => wb.get('tracker', k),
    set: (k, v) => { wb.set('tracker', k, v) },
    remove: k => { wb.delete('tracker', k) },
    keys: () => wb.keys('tracker'),
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/storage/boot.test.ts src/storage/adapters.test.ts`
Expected: PASS (6 + 3). If TypeScript complains about `import.meta.env` typing, `vite-env.d.ts` already declares it; the `as any` cast keeps `chooseBackend`'s parameter loose on purpose.

- [ ] **Step 5: Commit**

```bash
git add src/storage/boot.ts src/storage/adapters.ts src/storage/boot.test.ts src/storage/adapters.test.ts
git commit -m "storage: boot gate, backend choice, unload guard, and the three door adapters"
```

---

### Task 6: Tracker pluggable storage target; Leave War demo inputs gated on stored wars

**Files:**
- Modify: `src/tracker/storage.js:28-36` (the `storage` object)
- Modify: `src/leavewar/state/demoworld.ts` (the `for (const rec of DEMO_RAPTOR_INPUTS)` loop inside `installDemoWorld`)
- Test: `src/tracker/storage.test.ts` (new), `src/leavewar/demoworld-stored.test.ts` (new)

**Interfaces:**
- Consumes: `trackerTarget` shape from Task 5 (`{ get, set, remove, keys }`).
- Produces: `export function useStorageImpl(target | null)` in `src/tracker/storage.js`; `installDemoWorld(true)` no longer files the demo Raptor inputs.

- [ ] **Step 1: Write the failing tests**

```ts
// src/tracker/storage.test.ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { storage, useStorageImpl } from './storage.js'

beforeEach(() => { localStorage.clear() })
afterEach(() => { useStorageImpl(null) })

describe('tracker storage target', () => {
  it('without a target it uses localStorage under ocu: (today’s behaviour)', async () => {
    await storage.set('v3:master', '{}')
    expect(localStorage.getItem('ocu:v3:master')).toBe('{}')
    expect(await storage.get('v3:master')).toEqual({ key: 'v3:master', value: '{}' })
    expect(await storage.list('v3:')).toEqual({ keys: ['v3:master'] })
    expect(await storage.delete('v3:master')).toEqual({ key: 'v3:master', deleted: true })
  })
  it('with a target every verb goes to the target and never to localStorage, same return shapes', async () => {
    const mem: Record<string, string> = {}
    useStorageImpl({ get: k => mem[k] ?? null, set: (k, v) => { mem[k] = v }, remove: k => { delete mem[k] }, keys: () => Object.keys(mem) })
    expect(await storage.set('v3:courses', '[]')).toEqual({ key: 'v3:courses', value: '[]' })
    expect(mem['v3:courses']).toBe('[]')
    expect(localStorage.length).toBe(0)
    expect(await storage.get('v3:courses')).toEqual({ key: 'v3:courses', value: '[]' })
    expect(await storage.get('nope')).toBeNull()
    expect(await storage.list('v3:')).toEqual({ keys: ['v3:courses'] })
    expect(await storage.list()).toEqual({ keys: ['v3:courses'] })
    expect(await storage.delete('v3:courses')).toEqual({ key: 'v3:courses', deleted: true })
    expect(mem['v3:courses']).toBeUndefined()
  })
})
```

```ts
// src/leavewar/demoworld-stored.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore } from '../state/store'
import { initStore as lwInitStore } from './state/store'
import { memoryBackend } from './state/storage'
import { installDemoWorld } from './state/demoworld'

const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  raptorInitStore()
  lwInitStore(memoryBackend())
})

describe('installDemoWorld and stored wars', () => {
  it('a fresh world (no stored wars) files the demo Raptor inputs', () => {
    const before = INPUTS.length
    installDemoWorld(false)
    expect(INPUTS.length).toBeGreaterThan(before)
  })
  it('a stored world (hadStoredWars) files NONE of them — persisted inputs must not be re-seeded', () => {
    const before = INPUTS.length
    installDemoWorld(true)
    expect(INPUTS.length).toBe(before)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/tracker/storage.test.ts src/leavewar/demoworld-stored.test.ts`
Expected: the tracker test fails (`useStorageImpl` is not exported); the demoworld "stored world" test fails (inputs are still filed).

- [ ] **Step 3: Make the Tracker target pluggable**

In `src/tracker/storage.js`, replace the `export const storage = { ... }` block (lines 28–36) with:

```js
/* THE PLUGGABLE TARGET (8 Sep 26, the storage seam). Raptor's main.tsx
   plugs the whiteboard in through useStorageImpl; with no target (the
   standalone smoke, a test that never boots main) every verb keeps its
   localStorage path under `ocu:` exactly as before. Return shapes are
   identical either way — core.js cannot tell which is behind it. */
let target = null   // { get(k), set(k, v), remove(k), keys() } — sync, unprefixed
export function useStorageImpl(t) { target = t }

export const storage = {
  async get(k) {
    if (target) { const v = target.get(k); return v == null ? null : { key: k, value: v } }
    const s = ls(); if (!s) return null; const v = s.getItem(LP + k); return v == null ? null : { key: k, value: v }
  },
  async set(k, v) {
    if (target) { target.set(k, v); return { key: k, value: v } }
    const s = ls(); if (!s) throw new Error('no storage'); s.setItem(LP + k, v); return { key: k, value: v }
  },
  async delete(k) {
    if (target) { target.remove(k); return { key: k, deleted: true } }
    const s = ls(); if (s) s.removeItem(LP + k); return { key: k, deleted: true }
  },
  async list(prefix) {
    let keys = []
    if (target) keys = target.keys()
    else { const s = ls(); if (s) for (let i = 0; i < s.length; i++) { const k = s.key(i); if (k && k.startsWith(LP)) keys.push(k.slice(LP.length)) } }
    return { keys: prefix ? keys.filter(x => x.startsWith(prefix)) : keys }
  },
}
```

- [ ] **Step 4: Gate the demo Raptor inputs**

In `src/leavewar/state/demoworld.ts`, inside `installDemoWorld`, wrap the whole `for (const rec of DEMO_RAPTOR_INPUTS) { ... }` loop:

```ts
  /* The demo inputs are SEED, like the OIL story above them: a world that
     came back from storage (hadStoredWars) already holds whatever inputs
     survived — re-filing a demo row a scheduler deleted would resurrect it
     on every boot (storage seam, 8 Sep 26). */
  if (!hadStoredWars) {
    for (const rec of DEMO_RAPTOR_INPUTS) {
      /* … the existing loop body, unchanged … */
    }
  }
```

(Keep the loop body byte-identical; only add the `if` and re-indent.)

- [ ] **Step 5: Run tests to verify they pass, plus the Tracker smoke and the Leave War suite**

Run: `npx vitest run src/tracker/storage.test.ts src/leavewar/demoworld-stored.test.ts && npm run smoke:tracker && npx vitest run src/leavewar`
Expected: all PASS; smoke unchanged (346/0).

- [ ] **Step 6: Commit**

```bash
git add src/tracker/storage.js src/tracker/storage.test.ts src/leavewar/state/demoworld.ts src/leavewar/demoworld-stored.test.ts
git commit -m "storage: Tracker storage takes a pluggable target; demo Raptor inputs only seed a fresh world"
```

---

### Task 7: `state/persist.ts` — hydrate, persistAll, wirePersist; store/history/hooks changes

**Files:**
- Create: `src/state/persist.ts`
- Modify: `src/engine/hooks.ts` (add `histApplied`)
- Modify: `src/state/history.ts:86` (call `HOOKS.histApplied()` right after `HIST.lock=false;`)
- Modify: `src/engine/inputs.ts:32-34` (add `seedIidCounter`)
- Modify: `src/state/plan.ts:48-49` (add `seedPuckCounter`)
- Modify: `src/state/store.ts` — `weekStashSnap` (line 295) exported; new `weekDirty()`; `initStore` (lines 533–586) gates and stashed-week restore
- Modify: `src/engine/weekstash.ts:1-22` (header comment)
- Modify: `src/ui/QualsPage.tsx:451,462` (`persistPeople()`)
- Test: `src/state/persist.test.ts`

**Interfaces:**
- Consumes: `Whiteboard` (Task 1); `MemoryBackend`, `bootStorage`, `settingsAdapter` (Tasks 2, 5, tests only).
- Produces: `hydrate(wb)`, `persistAll()`, `persistPeople()`, `wirePersist(wb, { weekSnap, weekDirty })`, `isHydrated()`, `weekId(key)`, `weekKey(id)`; `HOOKS.histApplied`; `weekStashSnap()` and `weekDirty()` exported from `src/state/store.ts`; `seedIidCounter(n)`; `seedPuckCounter(n)`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/state/persist.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear, stashHas } from '../engine/weekstash'
import { PLANPUCKS, DAYRMK, addPlanPuck } from './plan'
import { initStore, writeInputs, weekStashSnap, weekDirty } from './store'
import { undo } from './history'
import { setSession } from './auth'
import { hydrate, persistAll, persistPeople, wirePersist, isHydrated, weekId, weekKey } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const ROW = { person: 'dj', date: 'Jul 14', allday: true, type: 'LL', remarks: 'persist test', mod: '2026-07-01' }

function resetWorld() {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  stashClear()
}

async function boot(be: MemoryBackend) {
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb, postman } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  return { wb, postman }
}

beforeEach(() => { vi.useFakeTimers(); resetWorld() })
afterEach(() => { vi.useRealTimers(); resetWorld(); setSession(null) })

describe('week ids', () => {
  it('converts the stash key to a record id and back', () => {
    expect(weekId('13/07/2026')).toBe('13-07-2026')
    expect(weekKey('13-07-2026')).toBe('13/07/2026')
  })
})

describe('hydrate', () => {
  it('a fresh backend: not hydrated, seeds run, nothing is lost', async () => {
    const be = new MemoryBackend()
    await boot(be)
    expect(isHydrated()).toBe(false)
    expect(INPUTS.length).toBeGreaterThan(0)
  })

  it('stored inputs REPLACE the seed and the seed merges are skipped; new ids do not collide', async () => {
    const be = new MemoryBackend()
    const stored = [{ ...ROW, iid: 'i57', yr: 2026 }, { ...ROW, date: 'Jul 15', iid: 'i58', yr: 2026 }]
    be.seed({ inputs: { all: JSON.stringify(stored) } })
    await boot(be)
    expect(isHydrated()).toBe(true)
    expect(INPUTS).toHaveLength(2)
    expect(inpId({} as any)).toBe('i59')
  })

  it('stored people replace the roster', async () => {
    const be = new MemoryBackend()
    const people = JSON.parse(PSNAP); people.dj.quals.tf = true
    be.seed({ people: { all: JSON.stringify(people) } })
    await boot(be)
    expect(PEOPLE.dj.quals.tf).toBe(true)
  })

  it('a stored plan layer restores pucks and titles; new puck ids do not collide', async () => {
    const be = new MemoryBackend()
    be.seed({ plan: { all: JSON.stringify({ pp: [{ id: 'pp4', iso: '2026-07-14', kind: 'note', text: 'x' }], dm: { '2026-07-14': 'Title' } }) } })
    await boot(be)
    expect(PLANPUCKS).toHaveLength(1)
    expect(DAYRMK['2026-07-14']).toBe('Title')
    setSession({ user: 'ad', role: 'admin' })
    addPlanPuck('2026-07-15', 'y')
    expect(PLANPUCKS[1].id).toBe('pp5')
  })

  it('a stored week snapshot is restored into the loaded week at boot', async () => {
    const be1 = new MemoryBackend()
    await boot(be1)
    DAYS[0].notes.push('PERSISTED NOTE')
    const snap = weekStashSnap()
    resetWorld()
    const be2 = new MemoryBackend()
    be2.seed({ weeks: { [weekId(CURWEEK)]: snap } })
    await boot(be2)
    expect(stashHas(CURWEEK)).toBe(true)
    expect(DAYS[0].notes).toContain('PERSISTED NOTE')
  })
})

describe('persistAll and the hooks', () => {
  it('an undoable edit lands on the whiteboard at once and reaches the backend after the coalesce wait', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    writeInputs(() => { INPUTS.push({ ...ROW }) })
    expect(JSON.parse(wb.get('inputs', 'all')!)).toHaveLength(INPUTS.length)
    await vi.advanceTimersByTimeAsync(300)
    expect(be.peek('inputs', 'all')).toBe(wb.get('inputs', 'all'))
  })

  it('the pristine seed week is NOT persisted, an edited week is', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    expect(wb.has('weeks', weekId(CURWEEK))).toBe(false)
    writeInputs(() => { INPUTS.push({ ...ROW }) })     // inputs landing changes the week's `un`/acc → dirty
    HOOKS.histPush()
    expect(wb.has('weeks', weekId(CURWEEK)) || weekDirty() === false).toBe(true)
    DAYS[0].notes.push('X'); HOOKS.histPush()
    expect(wb.has('weeks', weekId(CURWEEK))).toBe(true)
  })

  it('UNDO during a slow save: the whiteboard and the backend both end on the pre-edit state, one letter each', async () => {
    const be = new MemoryBackend(); be.latency = 500
    const { wb } = await boot(be)
    const before = wb.get('inputs', 'all')
    writeInputs(() => { INPUTS.push({ ...ROW }) })
    await vi.advanceTimersByTimeAsync(300)            // letter 1 in flight (500 ms)
    undo()
    expect(wb.get('inputs', 'all')).toBe(before)      // whiteboard already back
    await vi.advanceTimersByTimeAsync(500 + 300 + 500)
    expect(be.peek('inputs', 'all')).toBe(before)
    expect(be.journal.filter(j => j.op === 'put' && j.collection === 'inputs')).toHaveLength(2)
  })

  it('a failed save keeps the whiteboard, reports failed, then saved after the retry', async () => {
    const be = new MemoryBackend()
    const { wb, postman } = await boot(be)
    be.failNext(1)
    writeInputs(() => { INPUTS.push({ ...ROW }) })
    const want = wb.get('inputs', 'all')
    await vi.advanceTimersByTimeAsync(300)
    expect(postman.status).toBe('failed')
    expect(wb.get('inputs', 'all')).toBe(want)
    await vi.advanceTimersByTimeAsync(1000)
    expect(postman.status).toBe('saved')
    expect(be.peek('inputs', 'all')).toBe(want)
  })

  it('a dropped letter is acknowledged but absent — documents that stage 1 trusts the ack', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    be.dropOne()
    writeInputs(() => { INPUTS.push({ ...ROW }) })
    await vi.advanceTimersByTimeAsync(300)
    expect(be.journal.filter(j => j.op === 'put' && j.collection === 'inputs')).toHaveLength(1)
    expect(be.peek('inputs', 'all')).not.toBe(wb.get('inputs', 'all'))
  })

  it('persistPeople writes the roster', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    PEOPLE.dj.quals.tf = true
    persistPeople()
    expect(JSON.parse(wb.get('people', 'all')!).dj.quals.tf).toBe(true)
  })

  it('persistAll is a no-op before wirePersist', () => {
    expect(() => persistAll()).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/state/persist.test.ts`
Expected: FAIL — cannot resolve `./persist`; `weekStashSnap`/`weekDirty` not exported.

- [ ] **Step 3: Add the hook, the counters, and the store exports**

`src/engine/hooks.ts` — add after `weekSwapped`:

```ts
  /* UNDO / REDO JUST REPLACED THE WHOLE MODEL (state/history.ts histApply).
     state/persist.ts wires this to re-persist everything: an undo is a
     change the backend must see, and histApply never calls histPush. */
  histApplied: (): void => {},
```

`src/state/history.ts` line 86 — change `HIST.lock=false;` to:

```ts
  HIST.lock=false;
  HOOKS.histApplied();
```

`src/engine/inputs.ts` — after `let IIDN=0;` (line 32):

```ts
/* hydration seeds the counter past every stored iid so a row minted this
   session cannot collide with one that came back from storage */
export function seedIidCounter(n:number){ if(n>IIDN)IIDN=n; }
```

`src/state/plan.ts` — after `let PPN = 0` (line 48):

```ts
export function seedPuckCounter(n: number) { if (n > PPN) PPN = n }
```

`src/state/store.ts`:

1. Line 295: `function weekStashSnap() {` → `export function weekStashSnap() {`.
2. Directly after `let weekBaseline = ''` (line 309) add:
   ```ts
   /* has the loaded week changed since it was loaded — the stash-on-leave
      yardstick, exposed for state/persist.ts (a pristine seed week is never
      persisted; see weekstash.ts's "persisted pristine copy is a trap") */
   export function weekDirty() { return weekStashSnap() !== weekBaseline }
   ```
3. Add the imports at the top: `import { isHydrated } from './persist'` and make sure `applyWeekModel` is reachable (it is a module-local function in the same file — no export needed) and `stashHas` is already imported (line 29).
4. In `initStore()`:
   - wrap the `otherWeekInputs().forEach(...)` block, `seedDemoSans()` and `seedDemoMedical(docAdd)` in `if (!isHydrated()) { ... }` (three separate wraps or one block around all three — one block is fine since they are consecutive apart from comments);
   - replace the line `autoAcceptSeedInputs()` (line 582, the one just before `weekBaseline = weekStashSnap()`) with:
     ```ts
     /* a week that came back from storage (state/persist.ts hydrate stashed
        it) is restored exactly as loadWeek would — applyWeekModel also
        re-lands the inputs — otherwise the seed lands as before */
     if (stashHas(CURWEEK)) applyWeekModel(CURWEEK)
     else autoAcceptSeedInputs()
     ```

`src/engine/weekstash.ts` — replace the header paragraph that begins `SESSION-ONLY, DELIBERATELY (owner, 23 Aug 26 …` through `… do not re-add a browser-local envelope for just this piece. */` with:

```
   PERSISTED THROUGH THE WHITEBOARD (8 Sep 26, the storage seam — owner:
   "everything persists"). This module is still the in-session memory and
   holds no opinion about storage; state/persist.ts reads every stashed
   week out of here on each history step and writes it to the whiteboard
   (`weeks/<dd-mm-yyyy>`), and at boot stashes every stored week back in
   BEFORE initStore, which restores the current one through applyWeekModel.
   The 23 Aug 26 session-only decision is superseded; the lockstep worry it
   answered (a schedule that remembered while its inputs forgot) cannot
   recur because inputs, people, the plan layer and every week now persist
   together or not at all. */
```

`src/ui/QualsPage.tsx`: add `import { persistPeople } from '../state/persist'`; line 451 `validate(); notify(); return` → `validate(); persistPeople(); notify(); return`; line 462 `PEOPLE[arch.dataset.arch!].archived = true; validate(); notify()` → `PEOPLE[arch.dataset.arch!].archived = true; validate(); persistPeople(); notify()`.

- [ ] **Step 4: Write persist.ts**

```ts
// src/state/persist.ts
/* LIVE SCHEDULER STATE ⇄ THE WHITEBOARD. Inputs, the roster, the planning
   layer and every week snapshot were session-only; they now ride the
   whiteboard (src/storage) like the settings always did. Two verbs:
   hydrate (boot: whiteboard → the module singletons, BEFORE initStore) and
   persistAll (every history step: singletons → whiteboard; the whiteboard
   ignores unchanged strings, so this is cheap and sends no idle letters).
   No import of state/store.ts here — store.ts imports isHydrated from us,
   and the two snapshot helpers it owns arrive through wirePersist. */
import { INPUTS, seedIidCounter } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { CURWEEK } from '../engine/waves'
import { HOOKS } from '../engine/hooks'
import { stashPut, stashKeys, stashGet, stashHas } from '../engine/weekstash'
import { PLANPUCKS, DAYRMK, seedPuckCounter } from './plan'
import type { Whiteboard } from '../storage/whiteboard'

/* the stash key is dd/mm/yyyy; '/' is the collection/id separator */
export const weekId = (key: string) => String(key).replace(/\//g, '-')
export const weekKey = (id: string) => id.replace(/-/g, '/')

type Snapshots = { weekSnap: () => string; weekDirty: () => boolean }
let wbRef: Whiteboard | null = null
let snaps: Snapshots | null = null
let hydrated = false

export const isHydrated = () => hydrated

function parse(json: string | null): any {
  if (json == null) return null
  try { return JSON.parse(json) } catch (e) { console.warn('persist: unreadable record ignored', e); return null }
}
const maxNum = (ids: string[], prefix: string) =>
  ids.reduce((m, id) => { const n = id.startsWith(prefix) ? Number(id.slice(prefix.length)) : NaN; return Number.isFinite(n) && n > m ? n : m }, 0)

/** whiteboard → module singletons; call BEFORE initStore() */
export function hydrate(wb: Whiteboard): void {
  hydrated = false
  const inputs = parse(wb.get('inputs', 'all'))
  if (Array.isArray(inputs)) {
    INPUTS.length = 0
    inputs.forEach((r: any) => INPUTS.push(r))
    seedIidCounter(maxNum(inputs.map((r: any) => String(r.iid ?? '')), 'i'))
    hydrated = true
  }
  const people = parse(wb.get('people', 'all'))
  if (people && typeof people === 'object' && !Array.isArray(people)) {
    for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
    Object.assign(PEOPLE, people)
  }
  const plan = parse(wb.get('plan', 'all'))
  if (plan && Array.isArray(plan.pp)) {
    PLANPUCKS.length = 0
    plan.pp.forEach((p: any) => PLANPUCKS.push(p))
    for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
    Object.assign(DAYRMK, plan.dm && typeof plan.dm === 'object' ? plan.dm : {})
    seedPuckCounter(maxNum(plan.pp.map((p: any) => String(p.id ?? '')), 'pp'))
  }
  for (const id of wb.keys('weeks')) {
    const json = wb.get('weeks', id)
    if (json) stashPut(weekKey(id), json)
  }
}

/** module singletons → whiteboard; wired to every history step */
export function persistAll(): void {
  if (!wbRef || !snaps) return
  wbRef.set('inputs', 'all', JSON.stringify(INPUTS))
  wbRef.set('people', 'all', JSON.stringify(PEOPLE))
  wbRef.set('plan', 'all', JSON.stringify({ pp: PLANPUCKS, dm: DAYRMK }))
  /* the loaded week: only once it has changed since load (or was already
     stashed) — a byte-copy of the pristine seed must never be persisted */
  if (stashHas(CURWEEK) || snaps.weekDirty()) wbRef.set('weeks', weekId(CURWEEK), snaps.weekSnap())
  for (const k of stashKeys()) {
    if (k === CURWEEK) continue
    const j = stashGet(k)
    if (j) wbRef.set('weeks', weekId(k), j)
  }
}

/** the Quals page's writes are not history steps — it calls this itself */
export function persistPeople(): void {
  wbRef?.set('people', 'all', JSON.stringify(PEOPLE))
}

/** call AFTER initStore() (wireStore sets HOOKS.histPush there) */
export function wirePersist(wb: Whiteboard, s: Snapshots): void {
  wbRef = wb
  snaps = s
  const push = HOOKS.histPush
  HOOKS.histPush = () => { push(); persistAll() }
  const applied = HOOKS.histApplied
  HOOKS.histApplied = () => { applied(); persistAll() }
  const swapped = HOOKS.weekSwapped
  HOOKS.weekSwapped = () => { swapped(); persistAll() }
  persistAll()
}
```

- [ ] **Step 5: Run the tests, then the whole suite**

Run: `npx vitest run src/state/persist.test.ts`
Expected: PASS (12 tests).

Then: `npm test`
Expected: all green. Watch for: (a) tests that stub `HOOKS.histPush` — `wirePersist` is only called by tests that opt in, so untouched suites see no change; (b) `stores-boot.test.ts` still passes because `initStore` runs the seeds when not hydrated; (c) if a Leave War suite now fails on `installDemoWorld(false)`, Task 6 gated only the `true` branch — re-check the wrap.

- [ ] **Step 6: Commit**

```bash
git add src/state/persist.ts src/state/persist.test.ts src/state/store.ts src/state/history.ts src/state/plan.ts src/engine/hooks.ts src/engine/inputs.ts src/engine/weekstash.ts src/ui/QualsPage.tsx
git commit -m "state: persist — hydrate live scheduler state from the whiteboard and write it back on every history step"
```

---

### Task 8: Async boot in `main.tsx`, the SaveStatus indicator, and the error screen

**Files:**
- Create: `src/ui/SaveStatus.tsx`
- Modify: `src/main.tsx` (whole file)
- Modify: `src/ui/Shell.tsx` (import; mount `<SaveStatus />` immediately after the closing `</nav>` of `#topnav`)
- Modify: `src/ui/scheduler.css` (append rules)
- Test: `src/ui/SaveStatus.test.tsx`

**Interfaces:**
- Consumes: `bootStorage`, `chooseBackend`, `guardUnload` (Task 5); `settingsAdapter`, `leavewarAdapter`, `trackerTarget` (Task 5); `useStorageImpl` (Task 6); `hydrate`, `wirePersist` (Task 7); `weekStashSnap`, `weekDirty` (Task 7); `Postman`, `SaveStatus` type (Task 3).
- Produces: `setSaveStatusSource(postman)`, `<SaveStatus />`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/ui/SaveStatus.test.tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import { SaveStatus, setSaveStatusSource } from './SaveStatus'
import { Postman } from '../storage/postman'
import { Whiteboard } from '../storage/whiteboard'
import { MemoryBackend } from '../storage/memory'

afterEach(() => { cleanup(); vi.useRealTimers() })

describe('SaveStatus', () => {
  it('renders nothing while saved, "Saving…" while a letter is queued or in flight, and Retry when failed', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    const wb = new Whiteboard()
    const pm = new Postman(be); pm.attach(wb)
    setSaveStatusSource(pm)
    render(<SaveStatus />)
    expect(screen.queryByRole('status')).toBeNull()
    be.failNext(1)
    act(() => { wb.set('inputs', 'all', '[]') })
    expect(screen.getByRole('status').textContent).toContain('Saving')
    await act(async () => { await vi.advanceTimersByTimeAsync(300) })
    expect(screen.getByRole('status').textContent).toContain('Not saved')
    await act(async () => { screen.getByRole('button', { name: 'Retry' }).click(); await vi.advanceTimersByTimeAsync(1000) })
    expect(screen.queryByRole('status')).toBeNull()
  })
})
```

If `@testing-library/react` is not a dependency of the non-Leave-War project, check `package.json`; it is used by `src/leavewar/**` tests already, so it is installed — the pragma is what matters.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/SaveStatus.test.tsx`
Expected: FAIL — cannot resolve `./SaveStatus`.

- [ ] **Step 3: Write SaveStatus.tsx and the CSS**

```tsx
// src/ui/SaveStatus.tsx
/* THE SAVED / SAVING / NOT SAVED INDICATOR — the postman's one visible
   surface (spec §indicator). Hidden while saved; "Saving…" while queued or
   in flight; "Not saved — Retry" when a letter has failed and is retrying. */
import { useSyncExternalStore } from 'react'
import type { Postman, SaveStatus as Status } from '../storage/postman'

let source: Postman | null = null
const subs = new Set<() => void>()
export function setSaveStatusSource(p: Postman): void {
  source = p
  p.onStatus(() => { for (const f of [...subs]) f() })
  for (const f of [...subs]) f()
}
const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn) } }
const read = (): Status => (source ? source.status : 'saved')

export function SaveStatus() {
  const s = useSyncExternalStore(subscribe, read, read)
  if (s === 'saved') return null
  if (s === 'failed') {
    return (
      <span className="savestat failed" role="status">
        Not saved — <button type="button" onClick={() => { void source?.flush() }}>Retry</button>
      </span>
    )
  }
  return <span className="savestat" role="status">Saving…</span>
}
```

Append to `src/ui/scheduler.css`:

```css
/* the postman's indicator (storage seam, 8 Sep 26) — sits after the nav */
.savestat{margin-left:8px;padding:6px 10px;border-radius:10px;font-size:12px;color:var(--ink-2);background:var(--raised);white-space:nowrap}
.savestat.failed{color:#E5C24A}
.savestat button{margin-left:4px;padding:2px 8px;border-radius:8px;border:1px solid currentColor;background:transparent;color:inherit;font:inherit;cursor:pointer}
```

In `src/ui/Shell.tsx`: add `import { SaveStatus } from './SaveStatus'` with the other `./` imports, and place `<SaveStatus />` on its own line immediately after the `</nav>` that closes `<nav className="nav" id="topnav">`.

- [ ] **Step 4: Rewrite main.tsx**

Replace the whole of `src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/scheduler.css'
import { initStore, setToast, histInit, weekStashSnap, weekDirty } from './state/store'
import { storeBackend } from './engine/hooks'
import { toast } from './ui/toast'
import { App } from './ui/App'
import { initStore as lwInitStore, lwHistInit } from './leavewar/state/store'
import { installDemoWorld } from './leavewar/state/demoworld'
import { wireLeaveWarSync } from './leavewar/sync'
import { installProbeBridge } from './probe-bridge'
import { bootStorage, chooseBackend, guardUnload } from './storage/boot'
import { settingsAdapter, leavewarAdapter, trackerTarget } from './storage/adapters'
import { useStorageImpl } from './tracker/storage.js'
import { hydrate, wirePersist } from './state/persist'
import { setSaveStatusSource } from './ui/SaveStatus'

/* THE BOOT (storage seam, 8 Sep 26 — docs/superpowers/specs/2026-09-08-
   storage-seam-design.md). The ONE place the app waits: fetch everything
   from the backend into the whiteboard, plug the three doors in, hydrate
   the live scheduler state, then run the boot sequence exactly as before
   the seam, then draw. Nothing below bootStorage ever waits on storage. */
async function boot(): Promise<void> {
  const { wb, postman } = await bootStorage(chooseBackend())

  /* the three doors (storage/adapters.ts): settings, Leave War, Tracker */
  storeBackend.impl = settingsAdapter(wb)
  useStorageImpl(trackerTarget(wb))
  setToast(toast)

  /* inputs / roster / plan layer / stashed weeks: whiteboard → singletons,
     BEFORE initStore so its seeds know to stand down (state/persist.ts) */
  hydrate(wb)
  initStore()

  /* Leave War boots on the whiteboard too. installDemoWorld's flag is now
     REAL: a world that came back from storage keeps its wars, its OIL story
     and its inputs; only a first-ever boot gets the demo overlay. */
  const hadStoredWars = wb.has('leavewar', 'wars')
  lwInitStore(leavewarAdapter(wb))
  installDemoWorld(hadStoredWars)

  /* same order as before the seam: the boot sync's writes are the world the
     session STARTS in, and both history baselines are taken after it */
  wireLeaveWarSync()
  histInit()
  lwHistInit()

  /* every history step, undo/redo and week swap now re-persists; the
     indicator and the unload guard hang off the postman */
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  setSaveStatusSource(postman)
  guardUnload(postman)

  installProbeBridge()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

boot().catch((err: unknown) => {
  console.error('RAPTOR could not load its data', err)
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML =
    '<div class="bootfail" role="alert" style="max-width:520px;margin:20vh auto;padding:24px;font:14px system-ui,sans-serif;color:#eee">' +
    '<h1 style="font-size:18px;margin:0 0 8px">RAPTOR could not load its data</h1>' +
    '<p style="margin:0 0 16px">Nothing was opened, so nothing can be lost. Check the connection and try again.</p>' +
    '<button id="bootRetry" type="button" style="padding:8px 14px;border-radius:10px;border:1px solid #888;background:transparent;color:inherit;cursor:pointer">Retry</button></div>'
  document.getElementById('bootRetry')?.addEventListener('click', () => location.reload())
})
```

- [ ] **Step 5: Run the indicator test, the suite, the build, and look at it in a browser**

Run: `npx vitest run src/ui/SaveStatus.test.tsx && npm test && npm run build`
Expected: all PASS; build clean (TypeScript: `useStorageImpl` resolves through `allowJs`; if `tsc` objects to the `.js` extension in the import, use `'./tracker/storage'` without the extension, matching how `TrackerPage.tsx` imports `./app/core`).

Then drive it (the `run` skill's recipe: `executablePath:'/opt/pw-browsers/chromium'`, `chromiumSandbox:false`): `npm run build && npx vite preview --port 4173` and open `http://localhost:4173/`. Verify: the login page draws; after sign-in (admin), add a note to Monday, reload — the note is still there (Browser backend); open `http://localhost:4173/?fresh=1` — the note is gone (Memory). Confirm in DevTools → Application → Local Storage that keys are `raptor:weeks/13-07-2026`, `raptor:inputs/all`, `raptor:people/all`, `raptor:plan/all`, `raptor:leavewar/*` and no `sqn142_*` was written newly. Screenshot the header showing "Saving…" is optional (it flashes for 300 ms).

- [ ] **Step 6: Commit**

```bash
git add src/main.tsx src/ui/SaveStatus.tsx src/ui/SaveStatus.test.tsx src/ui/Shell.tsx src/ui/scheduler.css
git commit -m "boot: async storage gate in main.tsx, SaveStatus indicator, boot-failure screen"
```

---

### Task 9: Leave War sync with delayed writes lands once (timing test in the jsdom project)

**Files:**
- Create: `src/leavewar/storage-seam.test.ts`

**Interfaces:**
- Consumes: everything above; the Leave War test helpers exactly as `src/leavewar/sync.test.ts` uses them (`setRole`, `setCell`, `advanceStage`, `setBidState`, `getState`, `setPeople`, `projectPeople`, `runOutbound`, `runInbound`).

- [ ] **Step 1: Write the test (it should pass first time — it pins behaviour; if it fails, that is a real bug to fix in Task 7's wiring, not in the test)**

```ts
// src/leavewar/storage-seam.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, weekStashSnap, weekDirty } from '../state/store'
import { hydrate, wirePersist } from '../state/persist'
import { projectPeople } from './state/raptorRoster'
import { advanceStage, getState, initStore as lwInitStore, setBidState, setCell, setPeople, setRole } from './state/store'
import { runInbound, runOutbound } from './sync'
import { bootStorage } from '../storage/boot'
import { settingsAdapter, leavewarAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'

const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => { vi.useFakeTimers(); INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)); stashClear() })
afterEach(() => { vi.useRealTimers() })

function approve(person: string, dates: string[], code = 'LL') {
  const wasRole = getState().role
  setRole('admin')
  for (const d of dates) setCell(person, d, code)
  if (getState().period.stage === 'open') advanceStage()
  for (const d of dates) setBidState(person, d, 'approved')
  setRole(wasRole)
}

describe('storage seam ⇄ Leave War sync', () => {
  it('an approved leave with SLOW saves reaches the backend exactly once, and a second pass sends nothing', async () => {
    const be = new MemoryBackend(); be.latency = 200
    const p = bootStorage(be)
    await vi.advanceTimersByTimeAsync(200)
    const { wb } = await p
    storeBackend.impl = settingsAdapter(wb)
    hydrate(wb)
    raptorInitStore()
    lwInitStore(leavewarAdapter(wb))
    setPeople(projectPeople())
    wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
    await vi.advanceTimersByTimeAsync(600)                      // let the boot-time letters settle
    const putsBefore = be.journal.filter(j => j.op === 'put' && j.collection === 'inputs').length

    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    runOutbound()
    const rows = INPUTS.filter((r: any) => r.lw)
    expect(rows).toHaveLength(1)
    expect(JSON.parse(wb.get('inputs', 'all')!).filter((r: any) => r.lw)).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(300 + 200 + 50)
    const inputPuts = () => be.journal.filter(j => j.op === 'put' && j.collection === 'inputs').length
    expect(inputPuts()).toBe(putsBefore + 1)
    expect(JSON.parse(be.peek('inputs', 'all')!).filter((r: any) => r.lw)).toHaveLength(1)

    runOutbound(); runInbound()                                 // a fixed point: nothing changes
    await vi.advanceTimersByTimeAsync(600)
    expect(inputPuts()).toBe(putsBefore + 1)
  })
})
```

- [ ] **Step 2: Run it**

Run: `npx vitest run src/leavewar/storage-seam.test.ts`
Expected: PASS. If the outbound write does not reach the whiteboard, check that `runOutbound` writes through `writeInputsBatch` (it does — `src/leavewar/sync.ts` imports it), which ends in `HOOKS.histPush()`, which `wirePersist` wraps. If `putsBefore + 1` is off by one, a boot-time letter had not settled — raise the first advance to 1000 ms rather than loosening the assertion.

- [ ] **Step 3: Commit**

```bash
git add src/leavewar/storage-seam.test.ts
git commit -m "test: Leave War sync with delayed saves lands once through the storage seam"
```

---

### Task 10: Gates, docs, spec deltas, handoff

**Files:**
- Modify: `docs/superpowers/specs/2026-09-08-storage-seam-design.md` (the four deltas)
- Modify: `docs/data-schema.md` (persistence table + storage-worlds table)
- Modify: `CLAUDE.md` (file map: `src/storage/`, `src/state/persist.ts`; the "Where things live" row for the spec)
- Modify: `../HANDOFF.md` (the "In flight" section), `../BUG-TESTING.md` (one row)

- [ ] **Step 1: Run every gate**

Run, from `raptor-port/`:
```bash
npm test && npm run build && node reference/tfin.js && npm run test:e2e && npm run smoke:tracker
```
Expected: vitest green; build clean; `tfin` prints `728 passed, 0 failed`; Playwright green (each test gets a fresh context → empty localStorage → clean start on the Browser backend); Tracker smoke 346/0. Any red here is this branch's to fix before the docs commit.

- [ ] **Step 2: Apply the spec deltas**

In `docs/superpowers/specs/2026-09-08-storage-seam-design.md`:
- Collections table: add a row `| \`plan\` | \`all\` | \`{pp: PLANPUCKS, dm: DAYRMK}\` — the planning layer |` and change the `weeks` row's contents to "the week-stash snapshot (`weekStashSnap()`: `{d, c, p, ad, a, al, ok, sg, o, cv, dr, cd, wo, un}`) — exactly what `applyWeekModel` restores".
- Under "Live scheduler state joins the whiteboard", replace the `weeks/<dd-mm-yyyy>` row's "the `histSnap()` object **minus `i`**" with "the week-stash snapshot" and delete the sentence beginning "The in-memory undo snapshot (`histSnap`) is unchanged and still carries `i`" (it is still true, but it no longer explains the record).
- `backend.ts` contract block: `Collection` gains `'plan'`.
- Backend choice table: change the "Unit tests, browser tests" row to two rows: `| Unit tests | Memory |` and `| Browser (Playwright) tests | Browser — a fresh context per test is an empty store |`.
- Leave War keys sentence: "`wars`, `current`, … eight" → "every key its `persist()` writes (about twenty, `src/leavewar/state/store.ts`)".
- Status line at the top: `**Status:** implemented on \`claude/storage-seam\` (plan: docs/superpowers/plans/2026-09-08-storage-seam.md)`.

- [ ] **Step 3: Update data-schema.md**

In the "What persists" table: every "session memory" row now reads "whiteboard → backend (Browser on the built site, Memory in dev/tests)" with "Survives reload? **Yes** on the built site (per browser); no in dev/tests by design". Add one sentence after the table: "Since the storage seam (8 Sep 26) everything persists together; `?fresh=1` on the URL gives a clean start." In the three-worlds table, the "Backed by today" column becomes "the whiteboard (`src/storage/`)" for all three, with the door column unchanged.

- [ ] **Step 4: CLAUDE.md, HANDOFF.md, BUG-TESTING.md**

- `CLAUDE.md` "Where things live": add `| **Storage: the whiteboard, postman, backends, boot gate** | \`src/storage/\` — the ONE route to a backend; \`src/state/persist.ts\` hydrates/persists live scheduler state |` after the `docs/data-schema.md` row.
- `../HANDOFF.md` "In flight": replace the stale audit-fixes paragraph with: the storage seam (stage 1) is on `claude/storage-seam`, draft PR #377; what it does in three lines (whiteboard + postman + Memory/Browser backends; everything persists per browser on the built site; `?fresh=1` clean start); stages 2–4 pending (stable ids, live-ish, Dataverse); merge only on the owner's explicit "merge live".
- `../BUG-TESTING.md`: one row for #377 with owner device checks: (1) add a note, reload, still there; (2) `?fresh=1` shows the demo again; (3) Leave War approvals survive reload and appear once on the schedule; (4) Tracker: import a syllabus file, reload, still there; (5) turn off wifi, edit — "Not saved — Retry" appears, turn wifi on, Retry → gone; (6) phone: same as (1).

- [ ] **Step 5: Commit and push**

```bash
git add docs/superpowers/specs/2026-09-08-storage-seam-design.md docs/data-schema.md CLAUDE.md ../HANDOFF.md ../BUG-TESTING.md
git commit -m "docs: storage seam stage 1 — spec deltas, data-schema persistence, file map, handoff, device checks"
for i in 1 2 3 4; do git push -u origin claude/storage-seam && break || sleep $((2**i)); done
```

Then update draft PR #377's title to `storage seam (stage 1): whiteboard, postman, Memory/Browser backends — everything persists` and its body to the plan's Goal + Architecture paragraphs, the gate results, and the owner device checks. Do not mark it ready; do not merge.

---

## Self-review

**Spec coverage.** Contract → Task 1. Whiteboard + three adapters → Tasks 1, 5, 6 (Tracker), main.tsx plug-in → Task 8. Live state joins the whiteboard (weeks/inputs/people + plan delta) → Task 7. Postman rules (coalesce 300 ms, per-record order, backoff capped 30 s, status, unload guard, flush) → Tasks 3, 5, 8. Boot gate + error screen → Tasks 5, 8. Backend choice matrix incl. `?fresh=1` → Task 5. MemoryBackend knobs (latency, failNext, dropOne, shuffle, journal, seed) → Task 2. BrowserBackend + legacy import, storage errors reject not throw → Task 4. Tracker file workflow through the whiteboard → Task 6 (Open/Import already write via `sSet` → `storage.set` → target). Indicator → Task 8. Failure handling table → Tasks 3, 4, 7 (`parse` tolerance), 8. Contract tests → Tasks 2, 4. Timing tests → Task 7 (undo, boot waits, failNext, dropOne, coalescing) and Task 9 (sync once); "two different records" → Task 3. Existing gates → Task 10. Watch-areas: module-scope `rulesLoad` runs before the gate today and again inside `initStore` after the adapter is plugged (Task 8 order) ✔; `SYNCING` + baselines order preserved (Task 8 keeps `wireLeaveWarSync` → `histInit` → `lwHistInit`) ✔; weekstash doctrine rewritten (Task 7) ✔; Tracker Import via whiteboard (Task 6) ✔; coalescing per `collection/id` (Task 3 test) ✔; `"null"` is a valid record (Task 2 contract test) ✔; `histSnap` keeps `i` (untouched) ✔; unload guard silent when saved (Task 5 `hasWork`) ✔. Out of scope untouched: sign-in, attachment bytes, per-change letters.

**Placeholder scan.** No TBD/TODO. Every code step has its code. Task 6 Step 4 says "existing loop body, unchanged" — the body is in the file and must not be retyped; that is an instruction, not a placeholder.

**Type consistency.** `Whiteboard.set/get/has/keys/delete/subscribe/fill/snapshot` used identically in Tasks 3, 5, 7, 8. `Postman.status/onStatus/flush/hasWork/attach/detach` match between Tasks 3, 5, 8. `MemoryBackend.latency/failNext/dropOne/peek/journal/seed` match Tasks 2, 3, 5, 7, 9. `trackerTarget` returns `{get,set,remove,keys}` = what `useStorageImpl` consumes (Task 6). `wirePersist(wb, { weekSnap, weekDirty })` identical in Tasks 7, 8, 9. `HOOKS.histApplied` defined (Task 7) before use (Task 7). `seedIidCounter` / `seedPuckCounter` defined and used in Task 7 only.
