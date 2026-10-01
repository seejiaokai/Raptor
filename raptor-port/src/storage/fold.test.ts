// src/storage/fold.test.ts
/* [DB-READINESS] group A, phase 0 — THE FOLD (plan §2.6; F13, R2-02, F2-11). Old records (one blob
   per kind) are turned into the new one-row-per-thing records ONCE, atomically, and only by a build
   that can fold them ALL: the format becomes 6 only in the build that registers every converter. A
   converter manifest refuses to stamp 6 while any is missing — the store stays at 5 and the app
   boots exactly as today. These tests clear the registry and register a stand-in set (the app's own eight — complete since
   phase 5b — are pinned by src/tracker/trk-rows.test.ts, through the app's boot). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryBackend } from './memory'
import { bootStorage } from './boot'
import { SCHEMA_VERSION } from './reset'
import type { Entry, Snapshot } from './backend'
import { readSchema } from './schema'
import {
  REQUIRED_CONVERTERS, FOLD_FORMAT, registerConverter, missingConverters, targetFormat, foldDue,
  _resetConvertersForTest, type Converter,
} from './fold'

afterEach(() => { vi.useRealTimers(); _resetConvertersForTest() })
beforeEach(() => { _resetConvertersForTest() })

const at5 = (initialized: boolean | null = true) => ({
  schema: initialized === null
    ? JSON.stringify(SCHEMA_VERSION)
    : JSON.stringify({ stage: 1, dataFormatVersion: SCHEMA_VERSION, initialized, appliedAt: 'x', minClient: SCHEMA_VERSION }),
})

/* the stand-in converters: `inputs/all` (a JSON list of {iid}) → one `inputs/<iid>` row each, and
   the old blob removed; every other required name converts nothing */
const inputsConverter: Converter = {
  name: 'inputs',
  collections: ['inputs'],
  convert(snap: Snapshot): Entry[] {
    const raw = snap.inputs.all
    if (raw == null) return []
    const rows = JSON.parse(raw) as Array<{ iid: string }>
    return [
      ...rows.map(r => ({ collection: 'inputs' as const, id: r.iid, value: JSON.stringify(r) })),
      { collection: 'inputs', id: 'all', value: null },
    ]
  },
}
const noop = (name: string): Converter => ({ name, collections: [], convert: () => [] })
function registerAll(except?: string) {
  for (const n of REQUIRED_CONVERTERS) {
    if (n === except) continue
    registerConverter(n === 'inputs' ? inputsConverter : noop(n))
  }
}

describe('the converter manifest', () => {
  it('with no converter registered, the target stays 5 and no fold is ever due', async () => {
    expect(missingConverters()).toEqual([...REQUIRED_CONVERTERS])
    expect(targetFormat()).toBe(SCHEMA_VERSION)
    const be = new MemoryBackend(); be.seed({ settings: at5() })
    expect(foldDue(await be.loadAll())).toBe(false)
  })

  it('names every old kind of record: weeks, inputs, people, plan, the Leave War, the edit log, accounts, the Tracker', () => {
    expect([...REQUIRED_CONVERTERS].sort()).toEqual(['accounts', 'elog', 'inputs', 'leavewar', 'people', 'plan', 'tracker', 'weeks'])
  })

  it('an INCOMPLETE manifest writes no stamp 6 and touches no record', async () => {
    registerAll('accounts')
    expect(missingConverters()).toEqual(['accounts'])
    expect(targetFormat()).toBe(SCHEMA_VERSION)
    const be = new MemoryBackend()
    be.seed({ settings: at5(), inputs: { all: JSON.stringify([{ iid: 'i1' }]) } })
    await bootStorage(be)
    expect(readSchema(be.peek('settings', 'schema'))!.dataFormatVersion).toBe(SCHEMA_VERSION)
    expect(be.peek('inputs', 'all')).not.toBeNull()
    expect(be.peek('inputs', 'i1')).toBeNull()
  })

  it('a converter name nobody asked for, or registered twice, is refused', () => {
    expect(() => registerConverter(noop('mystery'))).toThrow()
    registerConverter(noop('weeks'))
    expect(() => registerConverter(noop('weeks'))).toThrow()
  })
})

describe('the fold — once, atomically, before anything reads the store', () => {
  /* one converter at a time (the group-A final read, Fable F3, 30 Sep 26): the Browser backend journals a group in ONE
     string, so a fold that was one group the size of the store could never run on a store over about half full */
  it('a complete manifest folds a format-5 store one converter at a time: its rows first, its old blob last, then stamp 6', async () => {
    registerAll()
    expect(targetFormat()).toBe(FOLD_FORMAT)
    const be = new MemoryBackend()
    be.seed({ settings: at5(), inputs: { all: JSON.stringify([{ iid: 'i1' }, { iid: 'i2' }]) } })
    const { wb } = await bootStorage(be)
    const writes = be.journal.filter(e => e.group !== undefined)
    const groups = [...new Set(writes.map(e => e.group))].map(g => writes.filter(e => e.group === g))
    expect(groups).toHaveLength(2)                                          // the inputs converter's group, then the stamp
    expect(groups[0]!.map((e: any) => `${e.collection}/${e.id}`)).toEqual(['inputs/i1', 'inputs/i2', 'inputs/all'])
    expect(groups[1]!.map((e: any) => `${e.collection}/${e.id}`)).toEqual(['settings/schema'])
    expect(be.peek('inputs', 'all')).toBeNull()
    expect(JSON.parse(be.peek('inputs', 'i1')!)).toEqual({ iid: 'i1' })
    expect(readSchema(be.peek('settings', 'schema'))).toMatchObject({ dataFormatVersion: FOLD_FORMAT, initialized: true, minClient: FOLD_FORMAT })
    // and the whiteboard fills with the NEW world, never the old blob
    expect(wb.has('inputs', 'all')).toBe(false)
    expect(wb.get('inputs', 'i2')).toBe(JSON.stringify({ iid: 'i2' }))
  })

  it('a store already at 6 is never folded and never looked at for old blobs', async () => {
    registerAll()
    const be = new MemoryBackend()
    be.seed({
      settings: { schema: JSON.stringify({ stage: 1, dataFormatVersion: FOLD_FORMAT, initialized: true, appliedAt: 'x', minClient: FOLD_FORMAT }) },
      inputs: { all: JSON.stringify([{ iid: 'stray' }]) },
    })
    await bootStorage(be)
    expect(be.journal.filter(e => e.op !== 'loadAll')).toHaveLength(0)
    expect(be.peek('inputs', 'stray')).toBeNull()
  })

  it('a legacy bare-5 store with records folds as a started store (initialized true)', async () => {
    registerAll()
    const be = new MemoryBackend()
    be.seed({ settings: at5(null), inputs: { all: JSON.stringify([{ iid: 'i1' }]) } })
    await bootStorage(be)
    expect(readSchema(be.peek('settings', 'schema'))).toMatchObject({ dataFormatVersion: FOLD_FORMAT, initialized: true })
  })

  it('a converter that writes outside its own collections stops the boot, nothing written', async () => {
    registerAll('people')
    registerConverter({ name: 'people', collections: ['people'], convert: () => [{ collection: 'weeks', id: 'x', value: '1' }] })
    const be = new MemoryBackend(); be.seed({ settings: at5() })
    await expect(bootStorage(be)).rejects.toThrow(/people/)
    expect(be.journal.filter(e => e.op !== 'loadAll')).toHaveLength(0)
  })

  it('a converter that throws stops the boot (the Retry screen), nothing written', async () => {
    registerAll('plan')
    registerConverter({ name: 'plan', collections: ['plan'], convert: () => { throw new Error('bad plan') } })
    const be = new MemoryBackend(); be.seed({ settings: at5() })
    await expect(bootStorage(be)).rejects.toThrow()
    expect(be.journal.filter(e => e.op !== 'loadAll')).toHaveLength(0)
    expect(readSchema(be.peek('settings', 'schema'))!.dataFormatVersion).toBe(SCHEMA_VERSION)
  })

  it('an unfinished group + a fold, the tab dying right after the fold\'s journal is written: the next boot has the NEW world, that group\'s values included', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: at5(), inputs: { all: JSON.stringify([{ iid: 'i1' }]) } })
    // an edit's group, journalled, the tab died before it applied; its replay also fails at the next boot
    be.crashNextAfter(0)
    await expect(be.putMany([
      { collection: 'inputs', id: 'all', value: JSON.stringify([{ iid: 'i1' }, { iid: 'i9' }]) },
      { collection: 'tracker', id: 't', value: 'T1' },
    ])).rejects.toThrow()
    be.failReplay(1)
    registerAll()
    be.crashNextAfter(1)                          // the fold's own putMany: journal written, one entry applied, dies
    await expect(bootStorage(be)).rejects.toThrow()
    const { wb, postman } = await bootStorage(be)  // the reopened tab
    expect(readSchema(be.peek('settings', 'schema'))!.dataFormatVersion).toBe(FOLD_FORMAT)
    expect(be.peek('inputs', 'all')).toBeNull()
    expect(be.peek('inputs', 'i9')).not.toBeNull() // the unfinished group's input, folded
    expect(be.peek('tracker', 't')).toBe('T1')     // and its untouched entry, carried whole
    expect(wb.get('tracker', 't')).toBe('T1')
    expect(be.peekJournal()).toBeNull()
    expect(postman.status).toBe('saved')
  })

  it('an unfinished group + a clean fold: the fold group is the superset, nothing left to retry', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: at5(), inputs: { all: '[]' } })
    be.crashNextAfter(0)
    await expect(be.putMany([{ collection: 'tracker', id: 't', value: 'T2' }])).rejects.toThrow()
    be.failReplay(1)
    registerAll()
    const { postman } = await bootStorage(be)
    expect(be.peek('tracker', 't')).toBe('T2')
    expect(be.peekJournal()).toBeNull()
    expect(postman.status).toBe('saved')
  })

  it('a store too full to take the largest group stops the boot with StoreFullError — nothing written', async () => {
    registerAll()
    class FullBackend extends MemoryBackend { canHold(_chars: number) { return false } }
    const be = new FullBackend()
    be.seed({ settings: at5(), inputs: { all: JSON.stringify([{ iid: 'i1' }]) } })
    await expect(bootStorage(be)).rejects.toMatchObject({ name: 'StoreFullError' })
    expect(be.journal.filter(e => e.op !== 'loadAll')).toHaveLength(0)
    expect(be.peek('inputs', 'all')).not.toBeNull()
    expect(readSchema(be.peek('settings', 'schema'))!.dataFormatVersion).toBe(SCHEMA_VERSION)
  })

  it('a fold interrupted part-way resumes at the next boot to the very store a clean fold makes', async () => {
    const clean = new MemoryBackend()
    registerAll()
    clean.seed({ settings: at5(), inputs: { all: JSON.stringify([{ iid: 'i1' }, { iid: 'i2' }]) } })
    await bootStorage(clean)
    const be = new MemoryBackend()
    be.seed({ settings: at5(), inputs: { all: JSON.stringify([{ iid: 'i1' }, { iid: 'i2' }]) } })
    be.crashNextAfter(1)                          // the inputs group: its journal written, one row applied, the tab dies
    await expect(bootStorage(be)).rejects.toThrow()
    await bootStorage(be)                         // the reopened tab: the journal replayed, the fold finished
    for (const id of ['i1', 'i2', 'all']) expect(be.peek('inputs', id)).toBe(clean.peek('inputs', id))
    expect(readSchema(be.peek('settings', 'schema'))).toMatchObject({ dataFormatVersion: FOLD_FORMAT, initialized: true })
    expect(be.peekJournal()).toBeNull()
  })

  it('a legacy bare-5 store is marked STARTED before any old blob is removed — an interrupted fold never reads as a new store', async () => {
    registerAll()
    const be = new MemoryBackend()
    be.seed({ settings: at5(null), inputs: { all: JSON.stringify([{ iid: 'i1' }]) } })
    let n = 0
    const put = be.putMany.bind(be)
    be.putMany = async (entries: Entry[]) => { if (++n === 3) throw new Error('the tab dies before the stamp at 6'); return put(entries) }
    await expect(bootStorage(be)).rejects.toThrow()
    expect(be.peek('inputs', 'all'), 'the old blob went with its converter').toBeNull()
    expect(readSchema(be.peek('settings', 'schema'))).toMatchObject({ dataFormatVersion: SCHEMA_VERSION, initialized: true })
    be.putMany = put
    await bootStorage(be)
    expect(readSchema(be.peek('settings', 'schema'))).toMatchObject({ dataFormatVersion: FOLD_FORMAT, initialized: true })
    expect(be.peek('inputs', 'i1')).not.toBeNull()
  })

  it('an old store below 5 is wiped first, then folded: the kept records are converted too', async () => {
    registerAll()
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify(3) }, inputs: { all: JSON.stringify([{ iid: 'gone' }]) } })
    await bootStorage(be)
    expect(be.peek('inputs', 'gone')).toBeNull()   // the wipe won
    expect(readSchema(be.peek('settings', 'schema'))).toMatchObject({ dataFormatVersion: FOLD_FORMAT, initialized: false })
  })
})
