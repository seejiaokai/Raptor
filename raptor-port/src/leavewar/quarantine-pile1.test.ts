import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { stashClear, stashPut } from '../engine/weekstash'
import { HIST, initStore, writeInputsBatch } from '../state/store'
import { histApply } from '../state/history'
import { applyMedPlan, mintMedSegments, removeInput } from '../ui/inputedit'
import { advanceStage, clearCells, getState, initStore as lwInitStore, setBidState, setCell, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { syncAbsences, wireLeaveWarSync } from './sync'
import { fileAbsence } from './testkit'

const seed = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[]
beforeEach(() => {
  stashClear()
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  initStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  setRole('admin')
  said = []
  HOOKS.toast = (m: any) => { said.push(String(m)) }
})
afterEach(() => { stashClear(); HOOKS.toast = toast })

function approve(dates: string[], person = 'ammo') {
  dates.forEach(d => setCell(person, d, 'LL'))
  if (getState().period.stage === 'open') advanceStage()
  dates.forEach(d => setBidState(person, d, 'approved'))
}
const mine = () => INPUTS.filter((r: any) => r.person === 'ammo' && r.lw)
const oml = () => INPUTS.filter((r: any) => r.person === 'ammo' && r.type === 'OML')
// the week of Mon 9 Feb 2026 is stashed as an unreadable book → its dates are protected
const freeze = () => stashPut('09/02/2026', 'null')

/* [ARCH-STACK] step 4 — medical is never typed on the war (it is filed on the
   Inputs page), and approved leave IS its Input, so there is no outbound copy
   to withdraw. These scenarios now plant the medical as the Inputs it is and
   drive the war's own door; the quarantine rule is unchanged: a protected row
   is never touched, and a refused plan leaves no trace on either side. */
describe('Pile 1 medical cascade quarantine', () => {
  it('removing approved leave on a locked week is refused and changes nothing', () => {
    approve(['2026-02-09'])
    expect(mine()).toHaveLength(1)
    freeze()
    const before = JSON.stringify(INPUTS), war = JSON.stringify(getState().wars)
    clearCells([{ personId: 'ammo', date: '2026-02-09' }])
    expect(JSON.stringify(INPUTS)).toBe(before)
    expect(JSON.stringify(getState().wars)).toBe(war)
    expect(getState().grid.ammo['2026-02-09']).toBe('LL')
  })

  it.each(['delete', 'trim'])('preflights every row before a %s plan has any side effect', action => {
    fileAbsence('ammo', 'OML', '2026-02-05')
    fileAbsence('ammo', 'OML', '2026-02-09')
    freeze()
    const before = JSON.stringify(INPUTS), war = JSON.stringify(getState().wars)
    const rows = oml().sort((a: any, b: any) => a.date.localeCompare(b.date))
    writeInputsBatch(() => applyMedPlan(rows.map(row => ({ row, action, newEndOrd: 20260204 }))))
    syncAbsences()
    expect(JSON.stringify(getState().wars)).toBe(war)
    expect(JSON.stringify(INPUTS)).toBe(before)
  })

  it('preflights later segment trims before minting or withdrawing any sibling', () => {
    fileAbsence('ammo', 'OML', '2026-02-05', '2026-02-06')
    fileAbsence('ammo', 'OML', '2026-02-09')
    freeze()
    const before = JSON.stringify(INPUTS), war = JSON.stringify(getState().wars)
    const base = { person: 'ammo', type: 'ATT C', date: 'Feb 2', yr: 2026, allday: true }
    writeInputsBatch(() => mintMedSegments(base, [
      { startOrd: 20260205, endOrd: 20260205 },
      { startOrd: 20260209, endOrd: 20260209 },
    ]))
    syncAbsences()
    expect(JSON.stringify(getState().wars)).toBe(war)
    expect(JSON.stringify(INPUTS)).toBe(before)
  })

  it('normal multi-segment medical cascades still replace and trim', () => {
    fileAbsence('ammo', 'OML', '2026-02-05')
    fileAbsence('ammo', 'OML', '2026-02-09')
    writeInputsBatch(() => mintMedSegments({ person: 'ammo', type: 'ATT C', date: 'Feb 2', yr: 2026, allday: true }, [
      { startOrd: 20260205, endOrd: 20260205 }, { startOrd: 20260209, endOrd: 20260209 },
    ]))
    syncAbsences()
    expect(getState().grid.ammo['2026-02-05']).toBe('ATTC')
    expect(getState().grid.ammo['2026-02-09']).toBe('ATTC')
    expect(oml()).toHaveLength(0)
  })
})

describe('Pile 1 approvals across a locked boundary', () => {
  it('extending up to a locked week approves the open days and refuses the locked one', () => {
    approve(['2026-02-06'])
    freeze()
    approve(['2026-02-07', '2026-02-08', '2026-02-09'])
    approve(['2026-02-05'], 'rocky')
    const rows = mine()
    expect(rows).toHaveLength(1)
    expect(rows[0].date).toBe('Feb 6')
    expect(rows[0].endDate).toBe('Feb 8')                         // grew over the open days only
    expect(getState().states.ammo['2026-02-09']?.state).toBe('pending')   // the locked day stays a request
    expect(INPUTS.filter((r: any) => r.person === 'rocky' && r.lw)).toHaveLength(1)
  })

  it('shortening leave that reaches into a locked week is refused whole', () => {
    approve(['2026-02-06', '2026-02-07', '2026-02-08', '2026-02-09'])
    const before = JSON.stringify(mine())
    freeze()
    ;['2026-02-07', '2026-02-08', '2026-02-09'].forEach(d => setBidState('ammo', d, 'refused'))
    approve(['2026-02-05'], 'rocky')
    expect(JSON.stringify(mine())).toBe(before)
    expect(getState().states.ammo['2026-02-07']?.state).toBe('approved')
    expect(INPUTS.filter((r: any) => r.person === 'rocky' && r.lw)).toHaveLength(1)
  })
})

describe('Pile 1 live-war history reconciliation', () => {
  it('delete, undo, redo, undo preserves the leave on both sides with the real subscriptions', () => {
    approve(['2026-02-02', '2026-02-03'])
    // The boot wire has no teardown; run it only in this final, isolated case.
    wireLeaveWarSync()
    const ix = HIST.ix
    expect(removeInput(mine()[0])).toBe(true)
    expect(getState().grid.ammo?.['2026-02-02']).toBeUndefined()
    histApply(ix)
    expect(getState().grid.ammo['2026-02-02']).toBe('LL')
    histApply(ix + 1)
    expect(getState().grid.ammo?.['2026-02-02']).toBeUndefined()
    histApply(ix)
    expect(INPUTS.filter((r: any) => r.person === 'ammo' && r.type === 'LL' && r.date === 'Feb 2')).toHaveLength(1)
    expect(getState().grid.ammo['2026-02-02']).toBe('LL')
    expect(getState().grid.ammo['2026-02-03']).toBe('LL')
  })
})
