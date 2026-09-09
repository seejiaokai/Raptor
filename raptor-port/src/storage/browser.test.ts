// src/storage/browser.test.ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserBackend, BROWSER_PREFIX } from './browser'

beforeEach(() => { localStorage.clear() })

describe('BrowserBackend', () => {
  it('stores each record at raptor:<collection>/<id>', async () => {
    const b = new BrowserBackend()
    await b.put('settings', 'rules', 'null')
    expect(localStorage.getItem(BROWSER_PREFIX + 'settings/rules')).toBe('null')
    await b.remove('settings', 'rules')
    expect(localStorage.getItem(BROWSER_PREFIX + 'settings/rules')).toBeNull()
  })

  it('ignores raptor: keys whose collection is unknown', async () => {
    localStorage.setItem(BROWSER_PREFIX + 'bogus/x', '1')
    const snap = await new BrowserBackend().loadAll()
    expect(Object.values(snap).every(c => Object.keys(c).length === 0)).toBe(true)
  })

  it('imports legacy sqn142_* and ocu:* keys ONCE when no raptor: keys exist, and writes them under raptor:', async () => {
    localStorage.setItem('sqn142_rules', '{"v":{"dur":99},"s":{}}')
    localStorage.setItem('ocu:v3:courses', '["A"]')
    localStorage.setItem('leavewar:wars', '[]')        // unwired today — must be ignored
    const snap = await new BrowserBackend().loadAll()
    expect(snap.settings['rules']).toBe('{"v":{"dur":99},"s":{}}')
    expect(snap.tracker['v3:courses']).toBe('["A"]')
    expect(snap.leavewar).toEqual({})
    expect(localStorage.getItem(BROWSER_PREFIX + 'settings/rules')).toBe('{"v":{"dur":99},"s":{}}')
    expect(localStorage.getItem(BROWSER_PREFIX + 'tracker/v3:courses')).toBe('["A"]')
    expect(localStorage.getItem('sqn142_rules')).not.toBeNull()   // legacy keys are never deleted
  })

  it('does not import legacy keys when raptor: keys already exist', async () => {
    localStorage.setItem(BROWSER_PREFIX + 'settings/daytpl', 'null')
    localStorage.setItem('sqn142_rules', '{"v":{"dur":1},"s":{}}')
    const snap = await new BrowserBackend().loadAll()
    expect(snap.settings['rules']).toBeUndefined()
    expect(snap.settings['daytpl']).toBe('null')
  })

  it('put rejects when the store throws (quota / private mode) instead of throwing into the caller', async () => {
    const broken = { setItem() { throw new Error('QuotaExceededError') }, removeItem() {}, getItem() { return null }, key() { return null }, length: 0, clear() {} } as unknown as Storage
    const b = new BrowserBackend(broken)
    await expect(b.put('inputs', 'all', '[]')).rejects.toThrow()
  })
})
