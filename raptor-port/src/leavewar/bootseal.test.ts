// src/leavewar/bootseal.test.ts
/* [DB-READINESS] group A, phase 0 (plan §2.8). Once "already started" is the stamp's `initialized`
   (not "is there a `wars` record?"), a first boot must SAVE the Leave War's demo world in the same
   group that seals `initialized` — or the reload would read a started store, skip the demo, and
   find no war. Drives main.tsx's order on the real whiteboard and postman. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, weekStashSnap, weekDirty } from '../state/store'
import { hydrate, wirePersist, leaveWarStarted } from '../state/persist'
import { initStore as lwInitStore, rawState } from './state/store'
import { installDemoWorld } from './state/demoworld'
import { wireLeaveWarSync } from './sync'
import { resyncSchedBaseline } from '../state/sched-commit'
import { bootStorage } from '../storage/boot'
import { settingsAdapter, leavewarAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { openBootGroup, readSchema } from '../storage/schema'

const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => { vi.useFakeTimers(); INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)); stashClear() })
afterEach(() => { vi.useRealTimers() })

async function boot(be: MemoryBackend) {
  const { wb, postman } = await bootStorage(be)
  const group = openBootGroup(wb)
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  raptorInitStore()
  const had = leaveWarStarted(wb)
  lwInitStore(leavewarAdapter(wb))
  installDemoWorld(had)
  resyncSchedBaseline()
  wireLeaveWarSync()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  group.seal()
  await postman.flush()
  return { had }
}

describe('the first boot saves the Leave War world with its seal', () => {
  it('fresh store → demo world saved in the sealed group → the reload keeps it, demo not re-applied', async () => {
    const be = new MemoryBackend()
    const first = await boot(be)
    expect(first.had).toBe(false)
    expect(readSchema(be.peek('settings', 'schema'))!.initialized).toBe(true)
    const stored = be.peek('leavewar', 'wars')
    expect(stored).not.toBeNull()
    /* whose rows the demo bids sit on — the dressed roster (slipway, wolf …), never the seed's invented callsigns */
    const recs = () => JSON.stringify(rawState().wars.map(w => w.recs))
    const wars = recs()
    expect(JSON.stringify(JSON.parse(stored!).map((w: any) => w.recs))).toBe(wars)
    const ledger = JSON.stringify(rawState().ledger)

    INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)); stashClear()
    const second = await boot(be)
    expect(second.had).toBe(true)
    expect(recs()).toBe(wars)
    expect(JSON.stringify(rawState().ledger)).toBe(ledger)   // the demo OIL story was not added twice
  })
})
