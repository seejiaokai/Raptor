import { describe, it, expect } from 'vitest'
import { TestDouble, ConflictError } from './versioned'

describe('versioned storage contract (SEQ-003) — proven against a fault-injecting double', () => {
  it('a create then get returns the value at version 1', async () => {
    const be = new TestDouble()
    const { version } = await be.put('inputs', 'i1', '{"a":1}', { ifVersion: 0 })
    expect(version).toBe(1)
    expect(await be.get('inputs', 'i1')).toEqual({ value: '{"a":1}', version: 1, deleted: false })
  })

  it('a put with the correct ifVersion succeeds and increments; a stale ifVersion is REJECTED, not queued', async () => {
    const be = new TestDouble()
    await be.put('inputs', 'i1', 'v1', { ifVersion: 0 })
    await be.put('inputs', 'i1', 'v2', { ifVersion: 1 })
    await expect(be.put('inputs', 'i1', 'vX', { ifVersion: 1 })).rejects.toBeInstanceOf(ConflictError)
    expect((await be.get('inputs', 'i1'))!.value).toBe('v2') // unchanged by the rejected write
  })

  it('delete leaves a versioned tombstone; a create over it needs the tombstone version, not 0', async () => {
    const be = new TestDouble()
    await be.put('inputs', 'i1', 'v1', { ifVersion: 0 }) // v1
    const { version: tomb } = await be.delete('inputs', 'i1', { ifVersion: 1 }) // v2 tombstone
    expect(tomb).toBe(2)
    expect(await be.get('inputs', 'i1')).toEqual({ value: null, version: 2, deleted: true })
    await expect(be.put('inputs', 'i1', 'again', { ifVersion: 0 })).rejects.toBeInstanceOf(ConflictError)
    const { version } = await be.put('inputs', 'i1', 'again', { ifVersion: 2 })
    expect(version).toBe(3) // fresh, never reuses v1
  })

  it('ack-not-trusted: a write that landed but whose ACK was dropped is confirmable by read-back', async () => {
    const be = new TestDouble()
    be.injectDropAck(1) // the next write lands durably but its ack is lost
    await expect(be.put('inputs', 'i1', 'v1', { ifVersion: 0 })).rejects.toThrow(/ack/i)
    // transport failed, but the value is durable — read-back confirms (data-model §9)
    expect(await be.get('inputs', 'i1')).toEqual({ value: 'v1', version: 1, deleted: false })
  })

  it('a competing writer between read and write makes the put stale → ConflictError (durable A/B clobber blocked)', async () => {
    const be = new TestDouble()
    await be.put('inputs', 'i1', 'v1', { ifVersion: 0 })
    const read = await be.get('inputs', 'i1') // caller reads v1
    be.injectCompetingWrite('inputs', 'i1', 'other') // another client writes v2 first
    await expect(be.put('inputs', 'i1', 'mine', { ifVersion: read!.version })).rejects.toBeInstanceOf(ConflictError)
    expect((await be.get('inputs', 'i1'))!.value).toBe('other')
  })

  it('subscribers are notified of committed writes (incl. competing remote writes)', async () => {
    const be = new TestDouble()
    const seen: string[] = []
    be.subscribe((c, id) => seen.push(`${c}/${id}`))
    await be.put('people', 'p1', 'x', { ifVersion: 0 })
    await be.delete('people', 'p1', { ifVersion: 1 })
    be.injectCompetingWrite('people', 'p2', 'remote') // a real remote write notifies too
    expect(seen).toEqual(['people/p1', 'people/p1', 'people/p2'])
  })

  it('delay/reorder fault: two concurrent writes with the same ifVersion race — exactly one wins (F10)', async () => {
    const be = new TestDouble()
    await be.put('inputs', 'i1', 'v1', { ifVersion: 0 }) // v1
    be.injectDelay(5)
    const results = await Promise.allSettled([
      be.put('inputs', 'i1', 'A', { ifVersion: 1 }),
      be.put('inputs', 'i1', 'B', { ifVersion: 1 }),
    ])
    const ok = results.filter(r => r.status === 'fulfilled')
    const bad = results.filter(r => r.status === 'rejected')
    expect(ok).toHaveLength(1)
    expect(bad).toHaveLength(1)
    expect((bad[0] as PromiseRejectedResult).reason).toBeInstanceOf(ConflictError)
  })

  it('partial-write fault: a multi-record batch that fails midway leaves earlier writes durable (F10)', async () => {
    const be = new TestDouble()
    await expect(be.writeBatch([
      { op: 'put', collection: 'inputs', id: 'i1', value: 'v1', ifVersion: 0 },
      { op: 'put', collection: 'weeks', id: 'w1', value: 'W', ifVersion: 0 },
    ], { failAtIndex: 1 })).rejects.toThrow(/partial write/)
    // i1 landed, w1 did not — the caller must recover the whole envelope (step-5 journal)
    expect((await be.get('inputs', 'i1'))!.value).toBe('v1')
    expect(await be.get('weeks', 'w1')).toBeNull()
  })

  it('a dropped ack is bound to its own write, not consumed by a subscriber-triggered write (INC1-006)', async () => {
    const be = new TestDouble()
    be.injectDropAck(1)
    let fired = false
    be.subscribe(() => {
      if (fired) return
      fired = true
      void be.put('inputs', 'B', 'b', { ifVersion: 0 }) // a write started from within A's notification
    })
    await expect(be.put('inputs', 'A', 'a', { ifVersion: 0 })).rejects.toThrow(/ack/i) // A's ack dropped
    expect((await be.get('inputs', 'A'))!.value).toBe('a') // A durable
    expect((await be.get('inputs', 'B'))!.value).toBe('b') // B unaffected by A's fault
  })
})
