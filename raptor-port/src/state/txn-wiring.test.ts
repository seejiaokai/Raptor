/* [ARCH-STACK-4] phase 0 — the all-or-nothing save on the REAL wiring (design
   §20 "Tests added", §21.1). The same boot main.tsx runs — storage gate,
   hydrate, initStore, the Leave War store on the whiteboard, wirePersist — then
   what reaches the backend is counted in GROUPS (one putMany each). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SCHEMA_VERSION } from '../storage/reset'
import { INPUTS } from '../engine/inputs'
import { HOOKS, storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { initStore, weekStashSnap, weekDirty, writeInputs } from './store'
import { hydrate, wirePersist } from './persist'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { getState, initStore as lwInitStore, setCell, setPeople, setRole } from '../leavewar/state/store'
import { bootStorage } from '../storage/boot'
import { settingsAdapter, leavewarAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { commit, definePermission, anyone, CmdRefused } from '../command'

const ISNAP = JSON.stringify(INPUTS)
const ROW = { person: 'dj', date: 'Jul 14', allday: true, type: 'LL', remarks: 'txn test', mod: '2026-07-01' }
beforeEach(() => { vi.useFakeTimers(); INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)); stashClear() })
afterEach(() => { vi.useRealTimers() })

async function boot() {
  const be = new MemoryBackend()
  be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const { wb, postman } = await bootStorage(be)
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  lwInitStore(leavewarAdapter(wb))
  setPeople(projectPeople())
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  await vi.advanceTimersByTimeAsync(600)                     // let the boot-time letters settle
  be.journal.length = 0
  return { be, wb, postman }
}
const groupsSent = (be: MemoryBackend) => [...new Set(be.journal.filter(j => j.op !== 'loadAll').map(j => j.group))]

describe('the all-or-nothing save, real wiring', () => {
  it('one gesture touching the scheduler AND the Leave War reaches storage as exactly ONE group', async () => {
    const { be } = await boot()
    definePermission('test.both', anyone)
    setRole('admin')
    const pid = getState().people[0].id
    commit({ type: 'test.both', scope: { module: 'inputs' } as any, apply: () => {
      writeInputs(() => { INPUTS.push({ ...ROW }) })
      setCell(pid, '2026-02-02', 'LL')
    } })
    await vi.advanceTimersByTimeAsync(300)
    const g = groupsSent(be)
    expect(g).toHaveLength(1)
    const cols = be.journal.filter(j => j.group === g[0]).map(j => j.collection)
    expect(cols).toContain('inputs')
    expect(cols).toContain('leavewar')
    expect(JSON.parse(be.peek('inputs', 'all')!).some((r: any) => r.remarks === 'txn test')).toBe(true)
  })

  it('a refused Input write that persisted inside its reducer leaves every stored value byte-equal and sends ZERO groups', async () => {
    const { be, wb } = await boot()
    const before = wb.snapshot()
    const ok = writeInputs(() => {
      INPUTS.push({ ...ROW })
      HOOKS.histPush()                                         // an engine helper's own persist, mid-reducer
      throw new CmdRefused('locked week')
    })
    expect(ok).toBe(false)
    expect(wb.snapshot()).toEqual(before)
    await vi.advanceTimersByTimeAsync(600)
    expect(groupsSent(be)).toEqual([])
  })

  it('an ordinary Leave War edit is one group too (its persist deferred to the seal)', async () => {
    const { be } = await boot()
    setRole('admin')
    const pid = getState().people[0].id
    setCell(pid, '2026-02-03', 'LL')
    await vi.advanceTimersByTimeAsync(300)
    expect(groupsSent(be)).toHaveLength(1)
    expect(be.journal.every(j => j.op === 'loadAll' || j.collection === 'leavewar')).toBe(true)
  })
})
