/* [ACCOUNTS] (26 Sep 26) — the Leave War's viewer follows the signed-in person on every
   repaint (D166 (4)), and the developer's-PC bridge pin (w.lwSetViewer → sync.ts pinViewer)
   holds for the sign-in it was set in and no longer. Found by the gates: with the mirror
   re-deriving the viewer on every notify, the e2e's plain setViewer was overwritten by the
   next repaint and 53 Leave War browser tests could no longer drive a row. Register AC2. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore as raptorInitStore, resetSession, notify } from '../state/store'
import { initStore as lwInitStore, getState, setPeople, grantOil } from './state/store'
import { PEOPLE } from '../engine/people'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { pinViewer, wireLeaveWarSync } from './sync'

beforeEach(() => {
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
})
afterEach(() => resetSession(null))

describe('AC2 — the war follows the signed-in person; a probe pin lasts one sign-in', () => {
  it('a member signed in: the war is scoped to him, on every repaint', () => {
    resetSession({ user: 'acus', role: 'main', pid: 'bane', name: 'us' }); notify()
    expect(getState().viewer).toBe('bane')
    notify()
    expect(getState().viewer).toBe('bane')
  })
  it('a pin holds across repaints, and the next sign-in ends it', () => {
    resetSession({ user: 'acus', role: 'main', pid: 'bane', name: 'us' }); notify()
    pinViewer(null)
    notify(); notify()
    expect(getState().viewer, 'the pin holds for this sign-in').toBe(null)
    pinViewer('stiff'); notify()
    expect(getState().viewer).toBe('stiff')
    resetSession({ user: 'acoutlaw', role: 'main', pid: 'casper', name: 'outlaw' }); notify()
    expect(getState().viewer, 'a new sign-in ends the pin').toBe('casper')
  })
  it('an admin whose own callsign is off the war\'s roster (archived) still grants under his callsign, never "admin" (Fable code read)', () => {
    const was = PEOPLE.stiff.archived
    try {
      PEOPLE.stiff.archived = true
      setPeople(projectPeople())
      resetSession({ user: 'acad', role: 'admin', pid: 'stiff', name: 'ad' }); notify()
      expect(getState().people.some(p => p.id === 'stiff'), 'he is not on the war\'s roster').toBe(false)
      const to = getState().people[0].id
      expect(grantOil([to], 1, '2026-02-02', 'walk check')).toBe(null)
      const e = getState().ledger.filter(x => x.personId === to && x.reason === 'walk check')
      expect(e.length).toBe(1)
      expect(e[0].approvedBy).toBe(PEOPLE.stiff.cs)
    } finally { PEOPLE.stiff.archived = was }
  })
})
