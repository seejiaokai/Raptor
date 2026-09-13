import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { stashClear, stashPut } from '../engine/weekstash'
import { HIST, initStore, writeInputsBatch } from '../state/store'
import { histApply } from '../state/history'
import { applyMedPlan, mintMedSegments, removeInput } from '../ui/inputedit'
import { advanceStage, getState, initStore as lwInitStore, setBidState, setCell, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { retractLwRow, runInbound, runOutbound, wireLeaveWarSync } from './sync'

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
const freeze = () => stashPut('09/02/2026', 'null')

describe('Pile 1 medical cascade quarantine', () => {
  it('the withdrawal source refuses a protected synced row', () => {
    setCell('ammo', '2026-02-09', 'OML')
    runOutbound()
    freeze()
    const before = JSON.stringify(getState().wars)
    retractLwRow(mine()[0])
    expect(JSON.stringify(getState().wars)).toBe(before)
  })

  it.each(['delete', 'trim'])('preflights every row before a %s plan has any side effect', action => {
    setCell('ammo', '2026-02-05', 'OML')
    setCell('ammo', '2026-02-09', 'OML')
    runOutbound()
    freeze()
    const before = JSON.stringify(INPUTS), war = JSON.stringify(getState().wars)
    const rows = mine().sort((a: any, b: any) => a.date.localeCompare(b.date))
    writeInputsBatch(() => applyMedPlan(rows.map(row => ({ row, action, newEndOrd: 20260204 }))))
    expect(JSON.stringify(getState().wars)).toBe(war)
    expect(JSON.stringify(INPUTS)).toBe(before)
    said = []
    runOutbound(); runInbound(); runOutbound()
    expect(said).toEqual([])
  })

  it('preflights later segment trims before minting or withdrawing any sibling', () => {
    setCell('ammo', '2026-02-05', 'OML')
    setCell('ammo', '2026-02-06', 'OML')
    setCell('ammo', '2026-02-09', 'OML')
    runOutbound()
    freeze()
    const before = JSON.stringify(INPUTS), war = JSON.stringify(getState().wars)
    const base = { person: 'ammo', type: 'ATT C', date: 'Feb 2', yr: 2026, allday: true }
    writeInputsBatch(() => mintMedSegments(base, [
      { startOrd: 20260205, endOrd: 20260205 },
      { startOrd: 20260209, endOrd: 20260209 },
    ]))
    expect(JSON.stringify(getState().wars)).toBe(war)
    expect(JSON.stringify(INPUTS)).toBe(before)
  })

  it('normal multi-segment medical cascades still withdraw and trim', () => {
    setCell('ammo', '2026-02-05', 'OML')
    setCell('ammo', '2026-02-09', 'OML')
    runOutbound()
    writeInputsBatch(() => mintMedSegments({ person: 'ammo', type: 'ATT C', date: 'Feb 2', yr: 2026, allday: true }, [
      { startOrd: 20260205, endOrd: 20260205 }, { startOrd: 20260209, endOrd: 20260209 },
    ]))
    runOutbound(); runInbound()
    expect(getState().grid.ammo['2026-02-05']).toBe('ATTC')
    expect(getState().grid.ammo['2026-02-09']).toBe('ATTC')
    expect(mine()).toHaveLength(0)
  })
})

describe('Pile 1 outbound boundary pairs', () => {
  it.each(['extend', 'shorten'])('%s across a protected boundary preserves the existing row without duplicates', direction => {
    approve(direction === 'extend' ? ['2026-02-06'] : ['2026-02-06', '2026-02-07', '2026-02-08', '2026-02-09'])
    runOutbound()
    const before = JSON.stringify(mine())
    freeze()
    if (direction === 'extend') approve(['2026-02-07', '2026-02-08', '2026-02-09'])
    else ['2026-02-07', '2026-02-08', '2026-02-09'].forEach(d => setBidState('ammo', d, 'refused'))
    approve(['2026-02-05'], 'rocky')
    runOutbound(); runInbound(); runOutbound()
    expect(JSON.stringify(mine())).toBe(before)
    expect(INPUTS.filter((r: any) => r.person === 'rocky' && r.lw)).toHaveLength(1)
    expect(said).toEqual([])
  })
})

describe('Pile 1 live-war history reconciliation', () => {
  it('delete, undo, redo, undo preserves the leave on both sides with the real subscriptions', () => {
    approve(['2026-02-02', '2026-02-03'])
    runOutbound()
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
