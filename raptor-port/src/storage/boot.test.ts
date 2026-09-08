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
