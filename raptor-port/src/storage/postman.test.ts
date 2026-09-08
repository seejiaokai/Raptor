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
