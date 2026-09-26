// @vitest-environment jsdom
/* AC15 — the undo list is per sign-in (owner, 13 Sep 26; D148 "the list clears when they sign
   out"). The global undo never cleared it at a sign-in, so an admin signing in after a member
   could reverse the member's change under his own name (Fable R1-7, Astra R1-10); since
   [ACCOUNTS] resetSession calls undo/timeline.ts endUndoSession on every sign-in and sign-out. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { INPUTS, inpId, mintInpIds } from '../engine/inputs'
import { initStore, resetSession, writeInputs } from './store'
import { installGlobalUndo } from './undo-wire'
import { undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { resyncSchedBaseline } from './sched-commit'

const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  initStore(); installGlobalUndo(); mintInpIds(); resyncSchedBaseline()
})
afterEach(() => { _resetTimeline(); resetSession(null) })

const fileOwn = (pid: string) => writeInputs(() => {
  const row: any = { person: pid, type: 'LL', date: 'Jul 20', allday: true, remarks: '', mod: '2026-01-01' }
  inpId(row); INPUTS.unshift(row)
})

describe('AC15 — the undo list empties at every sign-in and sign-out', () => {
  it('member → admin: the admin inherits nothing to undo', () => {
    resetSession({ user: 'acus', role: 'main', pid: 'bane', name: 'us' })
    expect(fileOwn('bane')).toBe(true)
    expect(undoState().canUndo).toBe(true)
    resetSession({ user: 'acad', role: 'admin', pid: 'stiff', name: 'ad' })
    expect(undoState().canUndo).toBe(false)
  })
  it('admin → admin, and sign-out → sign-in', () => {
    resetSession({ user: 'acad', role: 'admin', pid: 'stiff', name: 'ad' })
    expect(fileOwn('pike')).toBe(true)
    expect(undoState().canUndo).toBe(true)
    resetSession(null)
    resetSession({ user: 'acad2', role: 'admin', pid: 'nact', name: 'boss' })
    expect(undoState().canUndo).toBe(false)
  })
})
