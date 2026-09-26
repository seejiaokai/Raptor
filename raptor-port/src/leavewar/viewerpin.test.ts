/* [ACCOUNTS] (26 Sep 26) — the Leave War's viewer follows the signed-in person on every
   repaint (D166 (4)), and the developer's-PC bridge pin (w.lwSetViewer → sync.ts pinViewer)
   holds for the sign-in it was set in and no longer. Found by the gates: with the mirror
   re-deriving the viewer on every notify, the e2e's plain setViewer was overwritten by the
   next repaint and 53 Leave War browser tests could no longer drive a row. Register AC2. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore as raptorInitStore, resetSession, notify } from '../state/store'
import { initStore as lwInitStore, getState, setPeople } from './state/store'
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
})
