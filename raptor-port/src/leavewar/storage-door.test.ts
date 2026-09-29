// [DB-READINESS] group A, phase 0 — the Leave War's storage door can REMOVE a record and LIST its keys
// (phase 3 saves one record per bid, so a deleted bid must be removable and the war's rows enumerable).
import { describe, it, expect } from 'vitest'
import { memoryBackend, localBackend } from './state/storage'
import { leavewarAdapter } from '../storage/adapters'
import { Whiteboard } from '../storage/whiteboard'

describe('the Leave War storage door', () => {
  for (const [name, make] of [
    ['memory', () => memoryBackend()],
    ['local', () => { localStorage.clear(); return localBackend() }],
    ['whiteboard', () => leavewarAdapter(new Whiteboard())],
  ] as const) {
    it(`${name}: write, list, remove`, () => {
      const b = make()
      b.write('war:a', '1'); b.write('war:b', '2')
      expect([...b.keys()].sort()).toEqual(['war:a', 'war:b'])
      b.remove('war:a')
      expect(b.read('war:a')).toBeNull()
      expect(b.keys()).toEqual(['war:b'])
      b.remove('never')                       // removing an absent key is not an error
    })
  }
  it('local: only its own leavewar: keys are listed', () => {
    localStorage.clear()
    localStorage.setItem('raptor:inputs/all', '[]')
    const b = localBackend()
    b.write('x', '1')
    expect(b.keys()).toEqual(['x'])
  })
})
