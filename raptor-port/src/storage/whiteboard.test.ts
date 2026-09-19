// src/storage/whiteboard.test.ts
import { describe, it, expect } from 'vitest'
import { Whiteboard } from './whiteboard'
import { emptySnapshot } from './backend'

describe('Whiteboard', () => {
  it('fills from a snapshot and reads back by collection/id', () => {
    const wb = new Whiteboard()
    const snap = emptySnapshot()
    snap.settings['rules'] = '{"v":{"dur":99},"s":{}}'
    wb.fill(snap)
    expect(wb.get('settings', 'rules')).toBe('{"v":{"dur":99},"s":{}}')
    expect(wb.get('settings', 'missing')).toBeNull()
    expect(wb.has('settings', 'rules')).toBe(true)
    expect(wb.keys('settings')).toEqual(['rules'])
  })

  it('set returns true only when the value changed, and notifies once per change', () => {
    const wb = new Whiteboard()
    const seen: any[] = []
    wb.subscribe(g => seen.push(...g))
    expect(wb.set('inputs', 'all', '[]')).toBe(true)
    expect(wb.set('inputs', 'all', '[]')).toBe(false)
    expect(wb.set('inputs', 'all', '[1]')).toBe(true)
    expect(seen).toEqual([
      { collection: 'inputs', id: 'all', value: '[]' },
      { collection: 'inputs', id: 'all', value: '[1]' },
    ])
  })

  it('delete notifies with value null and is a no-op on an absent record', () => {
    const wb = new Whiteboard()
    const seen: any[] = []
    wb.subscribe(g => seen.push(...g))
    expect(wb.delete('tracker', 'x')).toBe(false)
    wb.set('tracker', 'x', '1')
    expect(wb.delete('tracker', 'x')).toBe(true)
    expect(wb.get('tracker', 'x')).toBeNull()
    expect(seen[1]).toEqual({ collection: 'tracker', id: 'x', value: null })
  })

  it('a throwing listener does not break the caller or other listeners', () => {
    const wb = new Whiteboard()
    const seen: string[] = []
    wb.subscribe(() => { throw new Error('boom') })
    wb.subscribe(g => seen.push(g[0].id))
    expect(() => wb.set('weeks', '13-07-2026', '{}')).not.toThrow()
    expect(seen).toEqual(['13-07-2026'])
  })

  it('ids may contain slashes and dashes; snapshot() round-trips', () => {
    const wb = new Whiteboard()
    wb.set('tracker', 'v3:master', 'a')
    wb.set('weeks', '13-07-2026', 'b')
    const snap = wb.snapshot()
    expect(snap.tracker['v3:master']).toBe('a')
    expect(snap.weeks['13-07-2026']).toBe('b')
    const wb2 = new Whiteboard(); wb2.fill(snap)
    expect(wb2.get('weeks', '13-07-2026')).toBe('b')
  })

  /* [ARCH-STACK-4] phase 0 — the all-or-nothing group (design §20.1, §21.1, §22.1) */
  describe('transactions', () => {
    it('outside a transaction every write is its own one-entry group', () => {
      const wb = new Whiteboard()
      const groups: any[] = []
      wb.subscribe(g => groups.push(g))
      wb.set('inputs', 'all', '[1]')
      wb.set('people', 'all', '{}')
      expect(groups).toEqual([
        [{ collection: 'inputs', id: 'all', value: '[1]' }],
        [{ collection: 'people', id: 'all', value: '{}' }],
      ])
    })

    it('inside: readers see new values at once, nothing is emitted until commit, then ONE net group', () => {
      const wb = new Whiteboard()
      wb.set('leavewar', 'wars', 'W0'); wb.set('tracker', 'gone', 'x')
      const groups: any[] = []
      wb.subscribe(g => groups.push(g))
      const t = wb.transaction()
      wb.set('inputs', 'all', '[1]')
      wb.set('inputs', 'all', '[2]')             // rewritten: only the last value travels
      wb.set('leavewar', 'wars', 'W1')
      wb.set('leavewar', 'wars', 'W0')           // written back to where it started: not a change
      wb.delete('tracker', 'gone')
      expect(wb.get('inputs', 'all')).toBe('[2]')
      expect(groups).toEqual([])
      t.commit()
      expect(groups).toEqual([[
        { collection: 'inputs', id: 'all', value: '[2]' },
        { collection: 'tracker', id: 'gone', value: null },
      ]])
    })

    it('a transaction with no net change emits nothing', () => {
      const wb = new Whiteboard()
      wb.set('inputs', 'all', '[1]')
      const groups: any[] = []
      wb.subscribe(g => groups.push(g))
      const t = wb.transaction()
      wb.set('inputs', 'all', '[9]'); wb.set('inputs', 'all', '[1]')
      t.commit()
      expect(groups).toEqual([])
    })

    it('abort puts every touched key back (created keys removed) and emits nothing', () => {
      const wb = new Whiteboard()
      wb.set('inputs', 'all', '[1]'); wb.set('tracker', 'x', 'kept')
      const groups: any[] = []
      wb.subscribe(g => groups.push(g))
      const t = wb.transaction()
      wb.set('inputs', 'all', '[2]'); wb.set('people', 'all', 'new'); wb.delete('tracker', 'x')
      t.abort()
      expect(wb.get('inputs', 'all')).toBe('[1]')
      expect(wb.has('people', 'all')).toBe(false)
      expect(wb.get('tracker', 'x')).toBe('kept')
      expect(groups).toEqual([])
      expect(wb.inTransaction()).toBe(false)
    })

    it('a savepoint rolls back only the writes made after it; earlier ones travel', () => {
      const wb = new Whiteboard()
      wb.set('people', 'all', 'P0')
      const groups: any[] = []
      wb.subscribe(g => groups.push(g))
      const t = wb.transaction()
      const outer = t.savepoint()
      wb.set('people', 'all', 'P1')               // the parent's write
      t.release(outer)
      const child = t.savepoint()
      wb.set('people', 'all', 'P2')               // a refused drained pipeline's write, same key
      wb.set('inputs', 'all', 'I2')               // … and a different key
      t.rollbackTo(child)
      expect(wb.get('people', 'all')).toBe('P1')
      expect(wb.has('inputs', 'all')).toBe(false)
      t.commit()
      expect(groups).toEqual([[{ collection: 'people', id: 'all', value: 'P1' }]])
    })

    it('a nested transaction joins the outer one: only the outermost commit emits', () => {
      const wb = new Whiteboard()
      const groups: any[] = []
      wb.subscribe(g => groups.push(g))
      const t = wb.transaction()
      wb.set('inputs', 'all', 'a')
      const inner = wb.transaction()
      wb.set('people', 'all', 'b')
      inner.commit()
      expect(groups).toEqual([])
      const inner2 = wb.transaction()
      wb.set('plan', 'all', 'c')
      inner2.abort()                              // rolls back only what it wrote
      expect(wb.has('plan', 'all')).toBe(false)
      t.commit()
      expect(groups).toHaveLength(1)
      expect(groups[0].map((e: any) => e.collection)).toEqual(['inputs', 'people'])
    })
  })
})
