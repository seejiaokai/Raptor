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
    wb.subscribe(ch => seen.push(ch))
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
    wb.subscribe(ch => seen.push(ch))
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
    wb.subscribe(ch => seen.push(ch.id))
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
})
