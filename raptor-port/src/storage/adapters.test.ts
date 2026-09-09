import { describe, it, expect } from 'vitest'
import { Whiteboard } from './whiteboard'
import { settingsAdapter, leavewarAdapter, trackerTarget } from './adapters'

describe('adapters', () => {
  it('settingsAdapter strips the sqn142_ prefix both ways', () => {
    const wb = new Whiteboard()
    const a = settingsAdapter(wb)
    a.setItem('sqn142_rules', 'null')
    expect(wb.get('settings', 'rules')).toBe('null')
    expect(a.getItem('sqn142_rules')).toBe('null')
    expect(a.getItem('sqn142_missing')).toBeNull()
  })
  it('leavewarAdapter maps read/write to the leavewar collection', () => {
    const wb = new Whiteboard()
    const a = leavewarAdapter(wb)
    expect(a.read('wars')).toBeNull()
    a.write('wars', '[]')
    expect(wb.get('leavewar', 'wars')).toBe('[]')
    expect(a.read('wars')).toBe('[]')
  })
  it('trackerTarget maps get/set/remove/keys to the tracker collection', () => {
    const wb = new Whiteboard()
    const t = trackerTarget(wb)
    t.set('v3:master', '{}'); t.set('v3:courses', '[]')
    expect(t.get('v3:master')).toBe('{}')
    expect(t.keys().sort()).toEqual(['v3:courses', 'v3:master'])
    t.remove('v3:master')
    expect(t.get('v3:master')).toBeNull()
  })
})
