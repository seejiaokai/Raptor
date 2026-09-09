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
