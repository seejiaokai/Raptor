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

  it('writes waiting together travel as ONE group (one putMany), each record once', async () => {
    const { be, wb } = rig()
    wb.set('inputs', 'all', '[]')
    wb.set('people', 'all', '{}')
    await vi.advanceTimersByTimeAsync(300)
    const puts = be.journal.filter(j => j.op === 'put')
    expect(puts.map(j => `${j.collection}/${j.id}`).sort()).toEqual(['inputs/all', 'people/all'])
    expect(new Set(puts.map(j => j.group)).size).toBe(1)
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

  /* [ARCH-STACK-4] phase 0 — groups, one at a time (design §20.2, §21.2) */
  it('a whiteboard transaction reaches the backend as ONE group', async () => {
    const { be, wb } = rig()
    const t = wb.transaction()
    wb.set('inputs', 'all', '[1]'); wb.set('leavewar', 'wars', '[]'); wb.delete('tracker', 'nope')
    t.commit()
    await vi.advanceTimersByTimeAsync(300)
    const groups = new Set(be.journal.filter(j => j.op !== 'loadAll').map(j => j.group))
    expect(groups.size).toBe(1)
    expect(be.peek('inputs', 'all')).toBe('[1]')
    expect(be.peek('leavewar', 'wars')).toBe('[]')
  })

  it('at most one group in flight: a write during a send waits and goes as the next group', async () => {
    const { be, wb, pm } = rig(500)
    wb.set('inputs', 'all', '[1]')
    await vi.advanceTimersByTimeAsync(300)           // group 1 in flight
    wb.set('people', 'all', 'P')
    wb.set('inputs', 'all', '[2]')
    await vi.advanceTimersByTimeAsync(500)           // group 1 lands; group 2 arms its coalesce wait
    expect(pm.status).toBe('unsaved')
    await vi.advanceTimersByTimeAsync(300 + 500)
    expect(be.peek('inputs', 'all')).toBe('[2]')
    expect(be.peek('people', 'all')).toBe('P')
    const g = be.journal.filter(j => j.op === 'put').map(j => j.group)
    expect(g).toEqual([g[0], g[1], g[1]])           // [1] alone, then people + [2] together
    expect(g[0]).not.toBe(g[1])
  })

  it('a failed group is merged UNDER newer writes: the retry is a superset and the newest value wins', async () => {
    const { be, wb } = rig()
    be.failNext(1)
    const t = wb.transaction()
    wb.set('inputs', 'all', 'I1'); wb.set('leavewar', 'wars', 'W1')
    t.commit()
    await vi.advanceTimersByTimeAsync(300)           // fails
    wb.set('inputs', 'all', 'I2')                    // newer, while waiting to retry
    await vi.advanceTimersByTimeAsync(1000)
    expect(be.peek('inputs', 'all')).toBe('I2')
    expect(be.peek('leavewar', 'wars')).toBe('W1')   // the failed group's other key still went
    const last = be.journal.filter(j => j.op === 'put').at(-1)!.group
    expect(be.journal.filter(j => j.group === last).map(j => j.collection).sort()).toEqual(['inputs', 'leavewar'])
  })

  it('a waiting backoff is not skipped by a fresh write', async () => {
    const { be, wb } = rig()
    be.failNext(1)
    wb.set('inputs', 'all', '[1]')
    await vi.advanceTimersByTimeAsync(300)           // fails → retry in 1s
    wb.set('people', 'all', 'P')
    await vi.advanceTimersByTimeAsync(300)
    expect(be.peek('people', 'all')).toBeNull()      // still waiting out the backoff
    await vi.advanceTimersByTimeAsync(700)
    expect(be.peek('people', 'all')).toBe('P')
  })

  it('an unfinished group from boot starts as FAILED, retries, and later writes merge over it', async () => {
    const be = new MemoryBackend()
    const wb = new Whiteboard()
    const pm = new Postman(be, { initialFailed: [{ collection: 'tracker', id: 't', value: 'T0' }, { collection: 'people', id: 'all', value: 'P0' }] })
    pm.attach(wb)
    expect(pm.status).toBe('failed')
    expect(pm.hasWork()).toBe(true)
    wb.set('people', 'all', 'P1')
    await vi.advanceTimersByTimeAsync(1000)
    expect(pm.status).toBe('saved')
    expect(be.peek('tracker', 't')).toBe('T0')
    expect(be.peek('people', 'all')).toBe('P1')
  })

  it('flush sends a pending group straight away, even mid-backoff', async () => {
    const { be, wb, pm } = rig()
    be.failNext(1)
    wb.set('inputs', 'all', '[1]')
    await vi.advanceTimersByTimeAsync(300)           // fails
    await pm.flush()
    expect(be.peek('inputs', 'all')).toBe('[1]')
    expect(pm.status).toBe('saved')
  })
})
