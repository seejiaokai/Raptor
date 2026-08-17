// The viewing person — Raptor's "View as" — mirrored into Leave War so the
// matrix can light the viewer's row and the counter picker can answer with
// their numbers (owner, 17 Aug 26). Its own file rather than a block in
// sync.test.ts because wireLeaveWarSync leaves a live subscription on
// Raptor's store behind, and that must not run under the other file's
// tests.

import { beforeEach, describe, expect, it } from 'vitest'
import { ME, setMe } from '../state/auth'
import { initStore as raptorInitStore, notify } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, setPeople, setViewer } from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'

describe('the viewer mirror', () => {
  beforeEach(() => {
    raptorInitStore()
    lwInitStore(memoryBackend())
    setPeople(projectPeople())
  })

  it('boots to nobody, and is never persisted — the mirror is the only writer', () => {
    expect(getState().viewer).toBeNull()
    const backend = memoryBackend()
    lwInitStore(backend)
    setViewer('plasma')
    lwInitStore(backend)
    expect(getState().viewer).toBeNull()
  })

  it('takes Raptor\'s View-as person at wire-up, and follows every change', () => {
    setMe('bane')
    wireLeaveWarSync()
    expect(getState().viewer).toBe('bane')
    // The Shell's own gesture is setMe + notify; the mirror rides the notify.
    setMe('plasma')
    notify()
    expect(getState().viewer).toBe('plasma')
    expect(ME).toBe('plasma')
  })
})
