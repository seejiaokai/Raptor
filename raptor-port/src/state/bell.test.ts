import { describe, it, expect, beforeEach } from 'vitest'
import { BELLLIT, markBell, bellLit, clearBell, setPage } from './view'
import { setMe } from './auth'

/* The notification bell's session-only seam (owner, Aug 26). What RAISES a bell
   is the owner's next step; this pins the part the shell reads now — a glow that
   is specific to the current page AND the current view-as person, and that a
   login/logout wipes (BELLLIT.clear in resetSession, covered by the store). */
beforeEach(() => { BELLLIT.clear(); setPage('viewsched'); setMe('bane') })

describe('the notification bell is per view + per person', () => {
  it('lights only for the page and person it was marked for', () => {
    markBell('inputs', 'bane')
    expect(bellLit(), 'not on this page yet').toBe(false)
    setPage('inputs')
    expect(bellLit(), 'now on the marked page').toBe(true)
    setMe('kestrel')
    expect(bellLit(), 'a different person does not inherit it').toBe(false)
    setMe('bane')
    expect(bellLit()).toBe(true)
  })

  it('clearBell drops the current view/person only', () => {
    markBell('inputs', 'bane'); markBell('inputs', 'kestrel')
    setPage('inputs'); setMe('bane')
    clearBell()
    expect(bellLit(), 'mine is acknowledged').toBe(false)
    setMe('kestrel')
    expect(bellLit(), 'the other person\'s stands').toBe(true)
  })

  it('markBell(…, false) turns a glow off', () => {
    markBell('quals', 'bane')
    markBell('quals', 'bane', false)
    setPage('quals')
    expect(bellLit()).toBe(false)
  })
})
