// [LW-MOVE-STANDARD] — the one day where a record can MOVE but a block's Delete cannot take it: a leave the WAR approved
// beside leave filed on the Inputs page (Fable's scenario S10). The move reads records by id (D265), so the approved
// leave moves — the grid used to refuse the whole day as "owned by Raptor" while the day's list, by id, could move it.
// A block's Delete still asks the day's top record and takes a war-approved leave only when it is the day's one absence
// (`clearCells` / `warEditable`); the day's list's own Delete takes it by id. So the block offers Move and NOT Delete
// there — the house rule, a control is drawn only where it would do something (D332). This is the one case that reaches
// the block's inner Delete gate, which the break test B18 proved no other test did. Mounted with the real wiring (sync.ts
// wireLeaveWarSync, as main.tsx does), because an approved leave lives on the Inputs page.
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { initStore as raptorInitStore, writeInputs } from '../../state/store'
import { setMe, setSession } from '../../state/auth'
import { projectPeople } from '../state/raptorRoster'
import { advanceStage, deletableIn, initStore as lwInitStore, movableRecords, moveCells, setBidStates, setCell, setPeople, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { wireLeaveWarSync } from '../sync'
import { SelectSheet } from './SelectSheet'
import type { Selection } from './select'

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

const D = '2026-02-18'
const cells = [{ personId: 'ammo', date: D }]

describe('approved leave beside leave filed on the Inputs page (Fable’s S10)', () => {
  beforeEach(() => {
    expect(setCell('ammo', D, '*LL')).toBe(true)
    advanceStage()                                                  // bidding closed — the admin decides
    setBidStates(cells, 'approved')
    const row = { iid: 'mss1', person: 'ammo', type: 'LL', date: 'Feb 18', yr: 2026, half: 'pm', s: 721, e: 1439, remarks: '', mod: '2026-02-01' }
    expect(writeInputs(() => { INPUTS.unshift(row) })).toBe(true)
    expect(INPUTS.filter((r: any) => r.person === 'ammo' && r.type === 'LL' && r.date === 'Feb 18')).toHaveLength(2)
  })

  it('the approved leave is a record that moves; a block’s Delete would take nothing', () => {
    expect(movableRecords(cells).map(m => m.kind)).toEqual(['absence'])
    expect(deletableIn(cells)).toBe(0)
  })

  it('the block offers Move and not Delete', () => {
    const sel: Selection = { people: ['ammo'], from: D, to: D, cells }
    render(<SelectSheet sel={sel} people={id => id} role="admin" canDecide={true} onDone={() => {}} onMove={() => {}} onClose={() => {}} />)
    expect(screen.getByTestId('sel-move')).toBeTruthy()
    expect(screen.queryByTestId('sel-delete')).toBeNull()
  })

  it('and the move goes: the approved morning slides, the filed afternoon stays', () => {
    expect(moveCells(cells, 2)).toBe('moved')
    const ll = INPUTS.filter((r: any) => r.person === 'ammo' && r.type === 'LL')
    expect(ll.find((r: any) => r.lw)?.date).toBe('Feb 20')
    expect(ll.some((r: any) => !r.lw && r.date === 'Feb 18')).toBe(true)
  })
})
