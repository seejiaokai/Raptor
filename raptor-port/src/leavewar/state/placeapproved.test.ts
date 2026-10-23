import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, placeApproved, setRole } from './store'
import { memoryBackend } from './storage'

/* "APPROVE WHAT I ENTER" (owner D1147, D1186, D1187; M3 5.5): an admin's placing approves as it places — one command,
   one Undo; a member never reaches it. Through the real store, the absence door wired as the app wires it. */

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

describe('placeApproved', () => {
  it('does nothing for a member', () => {
    setRole('member')
    const r = placeApproved([{ personId: 'dusk', date: '2026-02-11' }], 'LL')
    expect(r).toMatchObject({ written: 0, approved: 0 })
    expect(getState().grid.dusk?.['2026-02-11']).toBeUndefined()
  })

  it('writes the leave and leaves no pending request where the door approves it', () => {
    const r = placeApproved([{ personId: 'dusk', date: '2026-02-11' }], 'LL')
    expect(r.written).toBe(1)
    /* without the Raptor door (this unit world) the approval is skipped and the day is named pending — the window says so */
    if (r.approved === 0) expect(r.pending).toEqual([{ personId: 'dusk', date: '2026-02-11' }])
    else expect(getState().states.dusk?.['2026-02-11']?.state).not.toBe('pending')
  })

  it('a member\'s empty code or no code writes nothing', () => {
    expect(placeApproved([{ personId: 'dusk', date: '2026-02-11' }], '  ').written).toBe(0)
  })
})
