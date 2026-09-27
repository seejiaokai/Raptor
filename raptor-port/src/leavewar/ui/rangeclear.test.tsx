// THE BID SHEET'S RANGE CLEAR GOES THROUGH THE SAME DOOR AS ITS ONE-DAY CLEAR (Fable's D260–D262 final read, F5,
// 27 Sep 26). The one-day Clear moved to `clearCells` on 21 Sep 26 — the door that reaches a leave the WAR approved (it
// removes it through the absence door, as a dragged block's Delete does); the range Clear still wrote an empty code
// over each day, which strips only the war's own records. So a war-approved leave inside a picked range was neither
// removed nor said, and the sheet closed as though it had been cleared. Mounted with the real wiring (sync.ts
// wireLeaveWarSync, as main.tsx does), because an approved leave lives on the Inputs page.

import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { initStore as raptorInitStore } from '../../state/store'
import { setMe, setSession } from '../../state/auth'
import { projectPeople } from '../state/raptorRoster'
import { advanceStage, initStore as lwInitStore, setBidStates, setCells, setPeople, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { wireLeaveWarSync } from '../sync'
import { Matrix } from './Matrix'

const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  setRole('admin')
})
afterEach(() => { setSession(null); setMe('bane') })

const warLeave = () => INPUTS.filter((r: any) => r.person === 'ammo' && r.type === 'LL' && r.lw)

describe('the range Clear (F5)', () => {
  it('takes a leave the war approved inside the span, as the one-day Clear does', () => {
    setCells([{ personId: 'ammo', date: '2026-02-16' }, { personId: 'ammo', date: '2026-02-17' }], 'LL')
    advanceStage()                                                  // bidding closed — the admin decides
    setBidStates([{ personId: 'ammo', date: '2026-02-16' }, { personId: 'ammo', date: '2026-02-17' }], 'approved')
    expect(warLeave().length).toBeGreaterThan(0)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-ammo-2026-02-15'))
    fireEvent.click(screen.getByTestId('span-range'))
    fireEvent.click(screen.getByTestId('span-day-2026-02-17'))
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(warLeave()).toHaveLength(0)
  })
})
