import { describe, it, expect, vi, afterEach } from 'vitest'
import { bootStorage, chooseBackend, guardUnload } from './boot'
import { MemoryBackend } from './memory'
import { BrowserBackend } from './browser'
import { SCHEMA_VERSION } from './reset'

afterEach(() => { vi.useRealTimers() })

describe('bootStorage', () => {
  it('waits for loadAll before returning a filled whiteboard with the postman attached', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend(); be.latency = 100
    /* already on the current schema, so the pre-1A reset (tested in reset.test.ts)
       is a no-op here and boot waits on the single loadAll this test measures */
    be.seed({ settings: { rules: '{"v":{"dur":99},"s":{}}', schema: JSON.stringify(SCHEMA_VERSION) } })
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

  /* [ARCH-STACK-4] phase 0 — recovery at boot (design §21.2, §22.2, §23.2) */
  const stamped = { settings: { schema: JSON.stringify(SCHEMA_VERSION) } }
  async function crashGroup(be: MemoryBackend, group: any[]) {
    be.crashNextAfter(0)
    await expect(be.putMany(group)).rejects.toThrow()
  }

  it('an unfinished group the replay cannot finish is carried into the save queue as FAILED, and lands with a later edit', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend(); be.seed(stamped)
    await crashGroup(be, [{ collection: 'tracker', id: 't', value: 'T1' }])
    be.failReplay(1)
    const { wb, postman } = await bootStorage(be)
    expect(wb.get('tracker', 't')).toBe('T1')                // booted on the acknowledged world
    expect(postman.status).toBe('failed')
    wb.set('settings', 'rules', 'R')                        // an unrelated edit merges over it
    await vi.advanceTimersByTimeAsync(1000)
    expect(postman.status).toBe('saved')
    const again = await bootStorage(be)                     // reload
    expect(again.wb.get('tracker', 't')).toBe('T1')
    expect(again.wb.get('settings', 'rules')).toBe('R')
    expect(be.peekJournal()).toBeNull()
  })

  it('a reset due at boot FILTERS the unfinished group: kept collections survive, reset ones never land', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION - 1) }, inputs: { all: 'OLD' } })
    await crashGroup(be, [{ collection: 'tracker', id: 't', value: 'T1' }, { collection: 'inputs', id: 'all', value: 'I1' }])
    be.failReplay(1)
    const { wb, postman } = await bootStorage(be)
    expect(wb.has('inputs', 'all')).toBe(false)             // the reset world
    expect(wb.get('tracker', 't')).toBe('T1')
    await vi.advanceTimersByTimeAsync(1000)
    expect(postman.status).toBe('saved')
    const again = await bootStorage(be)
    expect(again.wb.get('tracker', 't')).toBe('T1')
    expect(again.wb.has('inputs', 'all')).toBe(false)
    expect(be.peekJournal()).toBeNull()
  })

  it('a failed journal rewrite stops the boot (Retry), the old journal intact; next boot filters, resets and stamps', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION - 1) }, inputs: { all: 'OLD' } })
    await crashGroup(be, [{ collection: 'tracker', id: 't', value: 'T1' }, { collection: 'inputs', id: 'all', value: 'I1' }])
    be.failReplay(1)
    const orig = be.writeJournal.bind(be)
    let failOnce = true
    be.writeJournal = async (g) => { if (failOnce) { failOnce = false; throw new Error('full') } return orig(g) }
    await expect(bootStorage(be)).rejects.toThrow()
    expect(be.peekJournal()?.map(e => e.collection)).toEqual(['tracker', 'inputs'])
    expect(be.peek('settings', 'schema')).toBe(JSON.stringify(SCHEMA_VERSION - 1))   // unstamped
    const { wb } = await bootStorage(be)
    expect(wb.get('tracker', 't')).toBe('T1')
    expect(wb.has('inputs', 'all')).toBe(false)
    expect(be.peek('settings', 'schema')).toBe(JSON.stringify(SCHEMA_VERSION))
  })
})

/* 8 Sep 26 bug pass: a reload inside the 300 ms coalesce wait lost the last
   edit — the guard only asked "leave?", and on a phone (no beforeunload) it
   could not even ask. The page-leaving events now flush first. */
describe('guardUnload', () => {
  const fakeWin = (visibility = 'hidden') => {
    const h: Record<string, (e?: any) => void> = {}
    const win = { addEventListener: (t: string, fn: any) => { h[t] = fn }, document: { visibilityState: visibility } } as unknown as Window
    return { win, h }
  }
  const unloadEvent = () => ({ preventDefault: vi.fn(), returnValue: undefined as any })

  it('pagehide lands every letter still in its coalesce wait — a phone leaving the page keeps the last edit', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    const { wb, postman } = await bootStorage(be)
    const { win, h } = fakeWin()
    guardUnload(postman, win)
    wb.set('settings', 'rules', '"just typed"')
    expect(be.peek('settings', 'rules')).toBeNull()
    h.pagehide()
    await vi.advanceTimersByTimeAsync(0)
    expect(be.peek('settings', 'rules')).toBe('"just typed"')
  })

  it('a hidden visibilitychange flushes too; a visible one does not', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    const { wb, postman } = await bootStorage(be)
    const seen = fakeWin('visible')
    guardUnload(postman, seen.win)
    wb.set('settings', 'rules', '"a"')
    seen.h.visibilitychange()
    await vi.advanceTimersByTimeAsync(0)
    expect(be.peek('settings', 'rules')).toBeNull()
    ;(seen.win.document as any).visibilityState = 'hidden'
    seen.h.visibilitychange()
    await vi.advanceTimersByTimeAsync(0)
    expect(be.peek('settings', 'rules')).toBe('"a"')
  })

  it('beforeunload flushes and, with the letter on its way, does not prompt', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    const { wb, postman } = await bootStorage(be)
    const { win, h } = fakeWin()
    guardUnload(postman, win)
    wb.set('settings', 'rules', '"b"')
    const e = unloadEvent()
    h.beforeunload(e)
    expect(e.preventDefault).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(0)
    expect(be.peek('settings', 'rules')).toBe('"b"')
  })

  it('beforeunload still prompts while a letter has failed to land', async () => {
    vi.useFakeTimers()
    const be = new MemoryBackend()
    const { wb, postman } = await bootStorage(be)
    const { win, h } = fakeWin()
    guardUnload(postman, win)
    be.failNext(2)
    wb.set('settings', 'rules', '"c"')
    await vi.advanceTimersByTimeAsync(300)
    expect(postman.status).toBe('failed')
    const e = unloadEvent()
    h.beforeunload(e)
    expect(e.preventDefault).toHaveBeenCalled()
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
