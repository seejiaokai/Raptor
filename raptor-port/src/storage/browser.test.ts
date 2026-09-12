// src/storage/browser.test.ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserBackend, BROWSER_PREFIX } from './browser'

beforeEach(() => { localStorage.clear() })

/* a Storage whose setItem can be told to fail for a chosen key, to drive the
   quota-mid-import path deterministically */
function fakeStorage() {
  const m = new Map<string, string>()
  const s: any = {
    failOn: (_k: string) => false,
    get length() { return m.size },
    key(i: number) { return [...m.keys()][i] ?? null },
    getItem(k: string) { return m.has(k) ? m.get(k)! : null },
    setItem(k: string, v: string) { if (s.failOn(k)) throw new Error('QuotaExceededError'); m.set(k, String(v)) },
    removeItem(k: string) { m.delete(k) },
    clear() { m.clear() },
  }
  return s as Storage & { failOn: (k: string) => boolean }
}
const DONE = BROWSER_PREFIX + '__legacy__/done'
const LEDGER = BROWSER_PREFIX + '__legacy__/ledger'
const STARTED = BROWSER_PREFIX + '__legacy__/started'

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

  /* bug-check 11 Sep 26: the one-time legacy import used to be declared done on
     the first raptor: key it saw, so a copy interrupted by a full store hid
     every legacy record it had not reached — for good. */
  it('a legacy import interrupted by a full store RESUMES on the next load instead of hiding the rest', async () => {
    const ls = fakeStorage()
    ls.setItem('sqn142_rules', '{"a":1}')
    ls.setItem('ocu:v3:courses', '["A"]')
    ;(ls as any).failOn = (k: string) => k === BROWSER_PREFIX + 'tracker/v3:courses'   // the store refuses the 2nd record
    const snap1 = await new BrowserBackend(ls).loadAll()
    expect(snap1.settings['rules'], 'both are served this boot from memory').toBe('{"a":1}')
    expect(snap1.tracker['v3:courses']).toBe('["A"]')
    expect(ls.getItem(BROWSER_PREFIX + 'settings/rules'), 'the first is durable').toBe('{"a":1}')
    expect(ls.getItem(BROWSER_PREFIX + 'tracker/v3:courses'), 'the refused one is not').toBeNull()
    expect(ls.getItem(DONE), 'and the import is NOT marked done').toBeNull()
    ;(ls as any).failOn = () => false                                                  // space freed
    const snap2 = await new BrowserBackend(ls).loadAll()
    expect(snap2.tracker['v3:courses'], 'the missing record is imported on the retry').toBe('["A"]')
    expect(ls.getItem(BROWSER_PREFIX + 'tracker/v3:courses')).toBe('["A"]')
    expect(ls.getItem(DONE), 'now the clean pass marks it done').toBe('1')
  })

  /* bug-check 11 Sep 26 (Astra/Codex, second pass): the resume above relied on
     the LEDGER being written on the interrupted boot. If the store is so full
     that even the tiny ledger write fails too, the next boot saw records-but-no-
     ledger and GRANDFATHERED — hiding the un-copied rest, the very loss the
     resume exists to prevent. A `started` marker, written before any copy, marks
     an import as genuinely mid-flight so it can never be mistaken for an existing
     install. */
  it('a partial import whose LEDGER write ALSO fails still RESUMES — it is not grandfathered away', async () => {
    const ls = fakeStorage()
    ls.setItem('sqn142_rules', '{"a":1}')
    ls.setItem('ocu:v3:courses', '["A"]')
    /* the store is so full that BOTH the 2nd record and the ledger are refused */
    ;(ls as any).failOn = (k: string) => k === BROWSER_PREFIX + 'tracker/v3:courses' || k === LEDGER
    const snap1 = await new BrowserBackend(ls).loadAll()
    expect(snap1.settings['rules'], 'both served this boot from memory').toBe('{"a":1}')
    expect(snap1.tracker['v3:courses']).toBe('["A"]')
    expect(ls.getItem(BROWSER_PREFIX + 'settings/rules'), 'the first is durable').toBe('{"a":1}')
    expect(ls.getItem(LEDGER), 'the ledger could not be written').toBeNull()
    expect(ls.getItem(STARTED), 'but the import is marked STARTED').toBe('1')
    expect(ls.getItem(DONE), 'and it is NOT marked done').toBeNull()
    ;(ls as any).failOn = () => false                                                  // space freed
    const snap2 = await new BrowserBackend(ls).loadAll()
    expect(snap2.tracker['v3:courses'], 'the missing record is imported on retry, NOT grandfathered away').toBe('["A"]')
    expect(ls.getItem(BROWSER_PREFIX + 'tracker/v3:courses')).toBe('["A"]')
    expect(ls.getItem(DONE), 'now the clean pass marks it done').toBe('1')
  })

  /* the invariant behind the marker: a record is persisted ONLY when the
     marker is durable, so a later boot can never find records with neither
     marker nor ledger and wrongly grandfather them (Astra 2nd pass). */
  it('if the STARTED marker cannot be written, NOTHING is persisted this boot and it resumes next boot', async () => {
    const ls = fakeStorage()
    ls.setItem('sqn142_rules', '{"a":1}')
    ls.setItem('ocu:v3:courses', '["A"]')
    ;(ls as any).failOn = (k: string) => k === STARTED           // the marker itself is refused
    const snap1 = await new BrowserBackend(ls).loadAll()
    expect(snap1.settings['rules'], 'still served this boot from memory').toBe('{"a":1}')
    expect(snap1.tracker['v3:courses']).toBe('["A"]')
    expect(ls.getItem(BROWSER_PREFIX + 'settings/rules'), 'but nothing is persisted without a durable marker').toBeNull()
    expect(ls.getItem(BROWSER_PREFIX + 'tracker/v3:courses')).toBeNull()
    expect(ls.getItem(STARTED)).toBeNull()
    expect(ls.getItem(DONE), 'and not marked done').toBeNull()
    ;(ls as any).failOn = () => false                            // space freed
    const snap2 = await new BrowserBackend(ls).loadAll()
    expect(snap2.settings['rules'], 'the retry imports everything').toBe('{"a":1}')
    expect(snap2.tracker['v3:courses']).toBe('["A"]')
    expect(ls.getItem(DONE)).toBe('1')
  })

  it('a completed import never repeats, and a record deleted afterwards is NOT resurrected', async () => {
    const ls = fakeStorage()
    ls.setItem('ocu:v3:courses', '["A"]')
    await new BrowserBackend(ls).loadAll()
    expect(ls.getItem(DONE)).toBe('1')
    ls.removeItem(BROWSER_PREFIX + 'tracker/v3:courses')          // the user deletes it; the legacy ocu: key still exists
    const snap = await new BrowserBackend(ls).loadAll()
    expect(snap.tracker['v3:courses'], 'the deletion stands — the legacy key does not bring it back').toBeUndefined()
  })

  it('an existing install (raptor: records already, no ledger) is GRANDFATHERED — legacy left alone, marked done, nothing resurrected', async () => {
    const ls = fakeStorage()
    ls.setItem(BROWSER_PREFIX + 'settings/daytpl', 'null')        // a record from before this fix
    ls.setItem('sqn142_rules', '{"v":{"dur":1},"s":{}}')          // legacy still present
    const snap = await new BrowserBackend(ls).loadAll()
    expect(snap.settings['rules'], 'the legacy is NOT re-imported').toBeUndefined()
    expect(snap.settings['daytpl']).toBe('null')
    expect(ls.getItem(DONE), 'the install is grandfathered done').toBe('1')
    expect(ls.getItem(BROWSER_PREFIX + 'settings/rules')).toBeNull()
  })
})
