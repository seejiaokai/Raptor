// @vitest-environment jsdom
// @vitest-environment-options { "url": "http://localhost/" }
/* [LW-HARNESS-VIEWER-PIN] (filed 27 Sep 26) — in the Leave War's browser tests, a role switched through the
   developer's-PC bridge (w.raptorRole) quietly ended the viewer pinned with w.lwSetViewer: the switch copies the session
   object the pin was keyed to, so the next repaint lit the signed-in man's row instead of the pinned one. Driven through
   the bridge's own globals, as the browser tests drive them. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { installProbeBridge } from './probe-bridge'
import { initStore as raptorInitStore, resetSession, notify } from './state/store'
import { initStore as lwInitStore, getState, setPeople } from './leavewar/state/store'
import { memoryBackend } from './leavewar/state/storage'
import { projectPeople } from './leavewar/state/raptorRoster'
import { wireLeaveWarSync } from './leavewar/sync'

const w = window as any
beforeEach(() => {
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  installProbeBridge()
})
afterEach(() => resetSession(null))

describe('the bridge keeps a pinned Leave War viewer across a role switch', () => {
  it('pin, switch role, repaint: the pinned row is still the one lit', () => {
    resetSession({ user: 'acus', role: 'main', pid: 'bane', name: 'us' }); notify()
    expect(getState().viewer).toBe('bane')
    w.lwSetViewer('stiff')
    w.raptorRole('admin'); notify()
    expect(getState().viewer, 'the pin outlives a role switched in place').toBe('stiff')
    w.raptorRole('member'); notify(); notify()
    expect(getState().viewer, 'and a second switch').toBe('stiff')
  })
  it('a real sign-in still ends the pin', () => {
    resetSession({ user: 'acus', role: 'main', pid: 'bane', name: 'us' }); notify()
    w.lwSetViewer('stiff')
    w.raptorRole('admin')
    resetSession({ user: 'acoutlaw', role: 'main', pid: 'casper', name: 'outlaw' }); notify()
    expect(getState().viewer).toBe('casper')
  })
})
