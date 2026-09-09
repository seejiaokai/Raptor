// src/storage/dbreadiness.test.ts
/* DATABASE-READINESS CHARACTERISATION (owner, 9 Sep 26 — "bug-test the
   database side by faking a database").

   Drives the REAL whiteboard + postman against the MemoryBackend turned into
   a fake NETWORK DATABASE — latency, a dropped-but-acked write, and (the
   cases a single local backend can never show) TWO independent clients
   sharing ONE backend, i.e. two tabs or two people.

   Two kinds of test live here on purpose:
   - HOLDS: guarantees the seam already keeps under database-like faults.
     These must stay green.
   - GAP: current behaviour that only the SHARED DATABASE stage can fix
     (write-verify against a dropped ack; per-row writes/merge against a
     two-writer clobber). They are characterisation tests — they assert what
     happens TODAY so the gap is visible and can't regress silently. When the
     database stage lands, these expectations flip, and that is the reminder
     to flip them. They are NOT bugs to fix inside stage 1. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Whiteboard } from './whiteboard'
import { MemoryBackend } from './memory'
import { Postman } from './postman'
import type { Collection } from './backend'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

const client = (be: MemoryBackend) => { const wb = new Whiteboard(); const pm = new Postman(be); pm.attach(wb); return { wb, pm } }

/* a fake database that fails puts for ONE key N times — for the per-record
   isolation test (MemoryBackend.failNext is global across keys) */
class FailKeyBackend extends MemoryBackend {
  private failKey = ''
  private failN = 0
  failKeyNext(collection: Collection, id: string, n: number) { this.failKey = `${collection}/${id}`; this.failN = n }
  async put(collection: Collection, id: string, json: string): Promise<void> {
    if (`${collection}/${id}` === this.failKey && this.failN > 0) { this.failN -= 1; throw new Error('db down for this key') }
    return super.put(collection, id, json)
  }
}

describe('storage seam — database readiness', () => {
  it('HOLDS: a slow database never blocks the app (whiteboard read is instant)', async () => {
    const be = new MemoryBackend(); be.latency = 800
    const { wb } = client(be)
    wb.set('inputs', 'all', '[{"x":1}]')
    expect(wb.get('inputs', 'all')).toBe('[{"x":1}]')   // instant, before the DB has it
    expect(be.peek('inputs', 'all')).toBeNull()          // still in flight
    await vi.advanceTimersByTimeAsync(1100)
    expect(be.peek('inputs', 'all')).toBe('[{"x":1}]')   // lands once the DB answers
  })

  it('HOLDS: one record failing does not starve OTHER records', async () => {
    const be = new FailKeyBackend()
    const { wb } = client(be)
    be.failKeyNext('inputs', 'all', 2)                   // inputs keeps failing twice
    wb.set('inputs', 'all', '[1]')
    wb.set('people', 'all', '{"a":1}')                   // unrelated record
    await vi.advanceTimersByTimeAsync(300)
    expect(be.peek('people', 'all')).toBe('{"a":1}')     // landed despite inputs failing
    await vi.advanceTimersByTimeAsync(3000)              // inputs backs off then lands
    expect(be.peek('inputs', 'all')).toBe('[1]')
  })

  it('HOLDS: per-key order is preserved within ONE client even under latency', async () => {
    const be = new MemoryBackend(); be.latency = 200
    const { wb } = client(be)
    wb.set('inputs', 'all', '[1]')
    await vi.advanceTimersByTimeAsync(300)               // first send in flight
    wb.set('inputs', 'all', '[2]')                       // queued behind it (postman serialises per key)
    await vi.advanceTimersByTimeAsync(1000)
    expect(be.peek('inputs', 'all')).toBe('[2]')         // newer value ends last, never the older
  })

  it('HOLDS: two clients editing DIFFERENT records both survive', async () => {
    const be = new MemoryBackend()
    const a = client(be), b = client(be)
    a.wb.set('inputs', 'all', '["only-A"]')
    b.wb.set('people', 'all', '{"onlyB":1}')
    await a.pm.flush(); await b.pm.flush()
    const fresh = await be.loadAll()
    expect(fresh.inputs['all']).toBe('["only-A"]')
    expect(fresh.people['all']).toBe('{"onlyB":1}')      // the clobber below is per-record, not global
  })

  it('GAP (needs DB write-verify): a dropped-but-acked write is lost silently', async () => {
    const be = new MemoryBackend()
    const { wb, pm } = client(be)
    be.dropOne()                                          // the DB acks but never durably lands it
    wb.set('inputs', 'all', '[{"kept":true}]')
    await vi.advanceTimersByTimeAsync(300)
    expect(pm.status).toBe('saved')                       // the client BELIEVES it saved...
    expect(be.peek('inputs', 'all')).toBeNull()           // ...but the DB has nothing
    const fresh = await be.loadAll()                      // a reload / another device
    expect(fresh.inputs['all']).toBeUndefined()           // the edit is gone — no error, no retry
    // DB stage must confirm the write (version / read-back); then this flips to "kept".
  })

  it('GAP (needs per-row writes): two people editing the SAME blob clobber each other', async () => {
    const be = new MemoryBackend()
    be.seed({ inputs: { all: '["seed"]' } })
    const a = client(be), b = client(be)
    a.wb.fill(await be.loadAll()); b.wb.fill(await be.loadAll())   // both boot from the same state
    a.wb.set('inputs', 'all', JSON.stringify(['seed', 'alpha']))  // A adds alpha
    b.wb.set('inputs', 'all', JSON.stringify(['seed', 'beta']))   // B adds beta — different edit, same one-blob record
    await a.pm.flush(); await b.pm.flush()                         // B writes last
    const fresh = await be.loadAll()
    expect(fresh.inputs['all']).toBe('["seed","beta"]')  // last writer won...
    expect(fresh.inputs['all']).not.toContain('alpha')   // ...A's edit is gone (INPUTS is a single 'all' blob)
    // DB stage must write per row / merge; then both survive.
  })
})
