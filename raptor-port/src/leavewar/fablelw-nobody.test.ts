/* Fable's read — the war's doors do not ask whether the person exists: a bid, an approved leave (a real Input) and an OIL
   award are all written for an id that names nobody. No screen sends such an id today (the grid hands over its own rows);
   it is the store that should refuse, as `grantTo` and `balanceProblem` already do. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { initStore as raptorInitStore } from '../state/store'
import { setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import { grantOil, grantOilDays, initStore as lwInitStore, lwHistInit, placeApproved, rawState, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  setRole('admin')
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null) })

describe('an id that names nobody', () => {
  it('is nobody', () => {
    expect((PEOPLE as any).nobody).toBeUndefined()
    expect(rawState().people.some(p => p.id === 'nobody')).toBe(false)
  })
  it('the tracker\'s grant refuses it (the rule that exists)', () => {
    expect(grantOil(['nobody'], 1, '2026-08-03', 'x')).toBe('Pick at least one person')
  })
  it('place-and-approve must write no leave for it', () => {
    const r = placeApproved([{ personId: 'nobody', date: '2026-08-03' }], 'LL')
    expect({ approved: r.approved, inputs: INPUTS.filter((x: any) => JSON.stringify(x).includes('nobody')).length }).toEqual({ approved: 0, inputs: 0 })
  })
  it('the grid\'s Grant OIL must give it no award', () => {
    grantOilDays([{ personId: 'nobody', date: '2026-08-03' }], 1)
    expect(rawState().ledger.filter(e => e.personId === 'nobody')).toHaveLength(0)
  })
})
