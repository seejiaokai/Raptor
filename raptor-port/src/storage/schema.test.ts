// src/storage/schema.test.ts
/* [DB-READINESS] group A, phase 0 (plan §2.6, §2.8, §8 P0-BOOTSTRAP, P0-CHANGES-COLLECTION).
   The stored schema stamp becomes ONE object — `stage`, `dataFormatVersion`, `initialized`,
   `appliedAt`, `minClient` — and "has this store already started?" is its `initialized`, never a
   sniff of whether one particular record happens to exist. A wipe clears it; the boot that seeds
   a store sets it, in the SAME saved group as the seed. */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { MemoryBackend } from './memory'
import { BrowserBackend, JOURNAL_KEY, BROWSER_PREFIX } from './browser'
import { bootStorage } from './boot'
import { resetPreSchema, SCHEMA_VERSION, RESET } from './reset'
import { COLLECTIONS, parseGroup } from './backend'
import { Whiteboard } from './whiteboard'
import { readSchema, storeInitialized, openBootGroup, STAGE, StoreAheadError } from './schema'
import { clientBootId } from './client'

afterEach(() => { vi.useRealTimers() })

const stored = (be: MemoryBackend) => readSchema(be.peek('settings', 'schema'))

describe('the schema stamp is one object', () => {
  it('a fresh store is stamped with the object form, NOT yet initialized', async () => {
    const be = new MemoryBackend()
    await bootStorage(be)
    const m = stored(be)!
    expect(m.legacy).toBe(false)
    expect(m.stage).toBe(STAGE)
    expect(m.dataFormatVersion).toBe(SCHEMA_VERSION)
    expect(m.initialized).toBe(false)
    expect(m.minClient).toBe(SCHEMA_VERSION)
    expect(typeof m.appliedAt).toBe('string')
  })

  it('a bare-number stamp (every store written before this build) still reads — as legacy, initialized unknown', () => {
    const m = readSchema(JSON.stringify(5))!
    expect(m).toMatchObject({ legacy: true, dataFormatVersion: 5, initialized: null })
  })

  it('an unreadable stamp reads as no stamp at all (format 0 — the wipe path)', () => {
    expect(readSchema('{not json')).toBeNull()
    expect(readSchema(JSON.stringify({ stage: 'x' }))).toBeNull()
    expect(readSchema(null)).toBeNull()
  })

  it('a wipe removes `initialized` — so the next boot seeds his preview again (F2-06)', async () => {
    const be = new MemoryBackend()
    be.seed({
      settings: { schema: JSON.stringify({ stage: 1, dataFormatVersion: 4, initialized: true, appliedAt: 'x', minClient: 4 }) },
      inputs: { all: '[]' },
    })
    const snap = await be.loadAll()
    await resetPreSchema(be, snap)
    const m = stored(be)!
    expect(m.dataFormatVersion).toBe(SCHEMA_VERSION)
    expect(m.initialized).toBe(false)
    expect(be.peek('inputs', 'all')).toBeNull()
  })
})

describe('the boot group — the seed and `initialized` land together', () => {
  it('a first boot: every seed write and the stamp reach storage as ONE group', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    const { wb } = await bootStorage(be)
    const groups: unknown[][] = []
    wb.subscribe(g => groups.push(g))
    const boot = openBootGroup(wb)
    wb.set('inputs', 'all', '["seed"]')        // stands for the scheduler's seed persist
    wb.set('leavewar', 'wars', '["war"]')      // and the Leave War's
    expect(groups).toHaveLength(0)             // nothing leaves until the seal
    boot.seal()
    expect(groups).toHaveLength(1)
    expect(groups[0].map((e: any) => `${e.collection}/${e.id}`).sort()).toEqual(['inputs/all', 'leavewar/wars', 'settings/schema'])
    expect(storeInitialized(wb)).toBe(true)
    await vi.advanceTimersByTimeAsync(400)
    expect(stored(be)!.initialized).toBe(true)
  })

  it('a boot that dies before its seal leaves the store un-started — the next boot seeds again', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    const first = await bootStorage(be)
    openBootGroup(first.wb)
    first.wb.set('inputs', 'all', '["half"]')  // … and the tab dies here: no seal
    await vi.advanceTimersByTimeAsync(400)
    expect(be.peek('inputs', 'all')).toBeNull()
    const again = await bootStorage(be)
    expect(storeInitialized(again.wb)).toBe(false)
  })

  it('a repeat boot of a started store opens no group and rewrites nothing', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    const one = await bootStorage(be)
    const b1 = openBootGroup(one.wb); b1.seal()
    await vi.advanceTimersByTimeAsync(400)
    const raw = be.peek('settings', 'schema')
    const two = await bootStorage(be)
    const groups: unknown[][] = []
    two.wb.subscribe(g => groups.push(g))
    const b2 = openBootGroup(two.wb)
    two.wb.set('settings', 'rules', '"r"')     // a write during this boot goes out at once, as today
    expect(groups).toHaveLength(1)
    b2.seal()
    expect(groups).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(400)
    expect(be.peek('settings', 'schema')).toBe(raw)
  })

  it('a legacy bare-number store (every browser today) is upgraded to the object form at its seal, format unchanged', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) }, inputs: { all: '[]' } })
    const { wb } = await bootStorage(be)
    expect(storeInitialized(wb)).toBeNull()    // unknown: each part falls back to its own record
    openBootGroup(wb).seal()
    await vi.advanceTimersByTimeAsync(400)
    expect(stored(be)).toMatchObject({ legacy: false, dataFormatVersion: SCHEMA_VERSION, initialized: true })
  })
})

describe('a store AHEAD of this build is never touched (P0-BOOTSTRAP)', () => {
  it('ahead in format: the boot refuses, nothing written', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify({ stage: 1, dataFormatVersion: 99, initialized: true, appliedAt: 'x', minClient: 99 }) } })
    const writes = () => be.journal.filter(e => e.op !== 'loadAll').length
    await expect(bootStorage(be)).rejects.toBeInstanceOf(StoreAheadError)
    expect(writes()).toBe(0)
  })
  it('ahead in stage: the boot refuses, nothing written', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify({ stage: STAGE + 1, dataFormatVersion: SCHEMA_VERSION, initialized: true, appliedAt: 'x', minClient: SCHEMA_VERSION }) } })
    await expect(bootStorage(be)).rejects.toBeInstanceOf(StoreAheadError)
    expect(be.journal.filter(e => e.op !== 'loadAll')).toHaveLength(0)
  })
  it('a store whose minClient is above this build refuses too', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify({ stage: 1, dataFormatVersion: SCHEMA_VERSION, initialized: true, appliedAt: 'x', minClient: 99 }) } })
    await expect(bootStorage(be)).rejects.toBeInstanceOf(StoreAheadError)
  })
  it('initialized but empty: boots, and stays initialized (nothing seeds it)', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify({ stage: 1, dataFormatVersion: SCHEMA_VERSION, initialized: true, appliedAt: 'x', minClient: SCHEMA_VERSION }) } })
    const { wb } = await bootStorage(be)
    expect(storeInitialized(wb)).toBe(true)
  })
})

describe('the change log has its own collection (P0-CHANGES-COLLECTION, F3-05)', () => {
  it('`changes` is a collection, and a wipe clears it with the rest', () => {
    expect(COLLECTIONS).toContain('changes')
    expect(RESET).toContain('changes')
  })
  it('a stored group holding a change-log entry is a well-formed group — never dropped whole', () => {
    const g = [{ collection: 'inputs', id: 'all', value: '[1]' }, { collection: 'changes', id: 'c1-0', value: '{}' }]
    expect(parseGroup(JSON.stringify(g))).toEqual(g)
  })
  it('an unfinished group holding a change-log entry is replayed WHOLE at the next boot', async () => {
    const mem = new Map<string, string>()
    const ls = {
      get length() { return mem.size },
      key: (i: number) => [...mem.keys()][i] ?? null,
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => { mem.set(k, v) },
      removeItem: (k: string) => { mem.delete(k) },
      clear: () => mem.clear(),
    } as unknown as Storage
    mem.set(BROWSER_PREFIX + '__legacy__/done', '1')
    mem.set(JOURNAL_KEY, JSON.stringify([
      { collection: 'inputs', id: 'all', value: '[1]' },
      { collection: 'changes', id: 'c1-0', value: '{"items":[]}' },
    ]))
    const snap = await new BrowserBackend(ls).loadAll()
    expect(snap.inputs.all).toBe('[1]')
    expect(snap.changes['c1-0']).toBe('{"items":[]}')
    expect(mem.has(JOURNAL_KEY)).toBe(false)
  })
})

describe('the client boot id', () => {
  it('is minted once per page life, with the c prefix', () => {
    expect(clientBootId()).toMatch(/^c[0-9a-z]+$/)
    expect(clientBootId()).toBe(clientBootId())
  })
})

describe('Whiteboard sanity for the boot group', () => {
  it('a command-shaped nested transaction inside the boot group joins it (one group at the seal)', () => {
    const wb = new Whiteboard()
    wb.set('settings', 'schema', JSON.stringify({ stage: 1, dataFormatVersion: SCHEMA_VERSION, initialized: false, appliedAt: 'x', minClient: SCHEMA_VERSION }))
    const groups: unknown[][] = []
    wb.subscribe(g => groups.push(g))
    const boot = openBootGroup(wb)
    const inner = wb.transaction(); wb.set('inputs', 'all', '[2]'); inner.commit()
    expect(groups).toHaveLength(0)
    boot.seal()
    expect(groups).toHaveLength(1)
  })
})
