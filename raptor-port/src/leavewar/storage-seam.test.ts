// src/leavewar/storage-seam.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, weekStashSnap, weekDirty } from '../state/store'
import { hydrate, wirePersist } from '../state/persist'
import { projectPeople } from './state/raptorRoster'
import { advanceStage, getState, initStore as lwInitStore, setBidState, setCell, setPeople, setRole } from './state/store'
import { runInbound, runOutbound } from './sync'
import { bootStorage } from '../storage/boot'
import { settingsAdapter, leavewarAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'

const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => { vi.useFakeTimers(); INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)); stashClear() })
afterEach(() => { vi.useRealTimers() })

function approve(person: string, dates: string[], code = 'LL') {
  const wasRole = getState().role
  setRole('admin')
  for (const d of dates) setCell(person, d, code)
  if (getState().period.stage === 'open') advanceStage()
  for (const d of dates) setBidState(person, d, 'approved')
  setRole(wasRole)
}

describe('storage seam ⇄ Leave War sync', () => {
  it('an approved leave with SLOW saves reaches the backend exactly once, and a second pass sends nothing', async () => {
    const be = new MemoryBackend(); be.latency = 200
    const p = bootStorage(be)
    await vi.advanceTimersByTimeAsync(200)
    const { wb } = await p
    storeBackend.impl = settingsAdapter(wb)
    hydrate(wb)
    raptorInitStore()
    lwInitStore(leavewarAdapter(wb))
    setPeople(projectPeople())
    wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
    await vi.advanceTimersByTimeAsync(600)                      // let the boot-time letters settle
    const putsBefore = be.journal.filter(j => j.op === 'put' && j.collection === 'inputs').length

    approve('ammo', ['2026-02-02', '2026-02-03', '2026-02-04'])
    runOutbound()
    const rows = INPUTS.filter((r: any) => r.lw)
    expect(rows).toHaveLength(1)
    expect(JSON.parse(wb.get('inputs', 'all')!).filter((r: any) => r.lw)).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(300 + 200 + 50)
    const inputPuts = () => be.journal.filter(j => j.op === 'put' && j.collection === 'inputs').length
    expect(inputPuts()).toBe(putsBefore + 1)
    expect(JSON.parse(be.peek('inputs', 'all')!).filter((r: any) => r.lw)).toHaveLength(1)

    runOutbound(); runInbound()                                 // a fixed point: nothing changes
    await vi.advanceTimersByTimeAsync(600)
    expect(inputPuts()).toBe(putsBefore + 1)
  })
})
