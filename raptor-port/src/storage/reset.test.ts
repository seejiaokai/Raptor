import { describe, it, expect } from 'vitest'
import { MemoryBackend } from './memory'
import { resetPreSchema, SCHEMA_VERSION } from './reset'

/* a store carrying pre-1A demo data: a bare-string note and a content-key
   ground.src on a saved week, plus people/settings that must be KEPT. */
const withPreV1AData = () => {
  const be = new MemoryBackend()
  be.seed({
    inputs: { all: JSON.stringify([{ iid: 'i1', person: 'x', type: 'LL' }]) },
    weeks: { '2026-07-13': JSON.stringify({ d: [{ notes: ['OLD STRING NOTE'], ground: [{ src: 'x|Jul 13|Meeting|600|2026' }] }] }) },
    people: { all: JSON.stringify({ dj: { cs: 'DJ' } }) },
    settings: { rules: '{"x":1}' },
  })
  return be
}

describe('resetPreSchema — ARCH-STACK 1A storage reset (Astra SID-05/07)', () => {
  it('clears pre-1A inputs+weeks, keeps people/settings, and stamps last', async () => {
    const be = withPreV1AData()
    const snap = await be.loadAll()
    await resetPreSchema(be, snap)
    // the in-memory snapshot is cleared for the incompatible collections, kept for the rest
    expect(snap.inputs).toEqual({})
    expect(snap.weeks).toEqual({})
    expect(JSON.parse(snap.people.all).dj.cs).toBe('DJ')
    expect(snap.settings.rules).toBe('{"x":1}')
    // durably gone in the backend, and the version stamped
    expect(be.peek('inputs', 'all')).toBeNull()
    expect(be.peek('weeks', '2026-07-13')).toBeNull()
    expect(be.peek('people', 'all')).not.toBeNull()
    expect(JSON.parse(be.peek('settings', 'schema')!)).toBe(SCHEMA_VERSION)
  })

  it('is a no-op on an already-stamped store — no deletes, no re-stamp', async () => {
    const be = withPreV1AData()
    be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
    const snap = await be.loadAll()
    const writes = be.journal.filter(e => e.op !== 'loadAll').length
    await resetPreSchema(be, snap)
    expect(snap.inputs.all).toBeTruthy()                    // untouched
    expect(be.peek('inputs', 'all')).not.toBeNull()
    expect(be.journal.filter(e => e.op !== 'loadAll').length).toBe(writes)   // no backend writes at all
  })

  it('stamps a fresh empty store (nothing to reset)', async () => {
    const be = new MemoryBackend()
    const snap = await be.loadAll()
    await resetPreSchema(be, snap)
    expect(JSON.parse(be.peek('settings', 'schema')!)).toBe(SCHEMA_VERSION)
  })

  it('SID-07: a failed delete leaves the stamp UNSET and hydrates nothing pre-1A — next boot retries and completes', async () => {
    const be = withPreV1AData()
    const snap = await be.loadAll()
    be.failNext(1)                                          // the first backend.remove throws
    await resetPreSchema(be, snap)
    // this boot: the in-memory snapshot is cleared, so no pre-1A record can hydrate
    expect(snap.inputs).toEqual({})
    expect(snap.weeks).toEqual({})
    // the stamp is NOT written (cleanup was not verified durable), so a retry will run
    expect(be.peek('settings', 'schema')).toBeNull()
    expect(be.peek('weeks', '2026-07-13')).not.toBeNull()  // the failed delete left the record in place
    // next boot re-reads the still-present data and the reset completes
    const snap2 = await be.loadAll()
    await resetPreSchema(be, snap2)
    expect(be.peek('inputs', 'all')).toBeNull()
    expect(be.peek('weeks', '2026-07-13')).toBeNull()
    expect(JSON.parse(be.peek('settings', 'schema')!)).toBe(SCHEMA_VERSION)
  })
})
