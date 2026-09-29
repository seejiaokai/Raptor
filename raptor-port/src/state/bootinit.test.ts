// src/state/bootinit.test.ts
/* [DB-READINESS] group A, phase 0 (plan §2.8, §3 phase 0 tests). "Has this store already started?"
   is the schema stamp's `initialized` — never a sniff of whether `inputs/all` or `leavewar/wars`
   happens to exist. Those two blobs are about to be split into one row per thing, and a store with
   NO inputs (or, later, no war rows) must not read as a brand-new one and get the demo put back. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { CURWEEK } from '../engine/waves'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from './store'
import { hydrate, wirePersist, isHydrated, leaveWarStarted } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { openBootGroup, readSchema } from '../storage/schema'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const BOOT_WEEK = CURWEEK
function resetWorld() {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  for (const id of Object.keys(PEOPLE)) ID_BY_CS[PEOPLE[id].cs.toLowerCase()] = id
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  stashClear()
  if (CURWEEK !== BOOT_WEEK) loadWeek(BOOT_WEEK)
  stashClear()
}
const stamp = (initialized: boolean, format = SCHEMA_VERSION) =>
  JSON.stringify({ stage: 1, dataFormatVersion: format, initialized, appliedAt: 'x', minClient: format })

/* main.tsx's scheduler half, in its order: storage boot → the boot group → hydrate → initStore → wirePersist → seal */
async function boot(be: MemoryBackend) {
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb, postman } = await p
  const group = openBootGroup(wb)
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  group.seal()
  await postman.flush()
  return { wb, postman }
}

beforeEach(() => { vi.useFakeTimers(); resetWorld() })
afterEach(() => { vi.useRealTimers(); resetWorld() })

describe('the scheduler reads "already started" from the stamp', () => {
  it('a STARTED store holding no inputs at all reloads with none — the demo does not come back', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: stamp(true) } })            // started; every input deleted (no inputs record)
    await boot(be)
    expect(isHydrated()).toBe(true)
    expect(INPUTS).toHaveLength(0)
  })

  it('a first boot seeds, and seals `initialized` together with the seed it saved', async () => {
    const be = new MemoryBackend()
    await boot(be)
    expect(isHydrated()).toBe(false)
    expect(INPUTS.length).toBeGreaterThan(0)
    expect(readSchema(be.peek('settings', 'schema'))!.initialized).toBe(true)
    /* the seed saved as one row per request ([DB-READINESS] group A, phase 2) */
    expect(Object.keys((await be.loadAll()).inputs).length).toBe(INPUTS.length)
    // the reload: started, so the stored world comes back and nothing is re-seeded
    const n = INPUTS.length
    resetWorld()
    await boot(be)
    expect(isHydrated()).toBe(true)
    expect(INPUTS).toHaveLength(n)
  })

  it('a wipe removes the stamp\'s `initialized`, and the next boot seeds', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: stamp(true, SCHEMA_VERSION - 1) }, inputs: { all: '[]' } })
    await boot(be)
    expect(isHydrated()).toBe(false)
    expect(INPUTS.length).toBeGreaterThan(0)
  })

  it('a store stamped the old way (a bare number) boots exactly as before: its own record decides', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) }, inputs: { all: '[]' } })
    await boot(be)
    expect(isHydrated()).toBe(true)
    expect(INPUTS).toHaveLength(0)
    expect(readSchema(be.peek('settings', 'schema'))).toMatchObject({ legacy: false, initialized: true })
  })
})

describe('the Leave War reads "already started" from the stamp', () => {
  it('a started store with NO war record never gets the demo world (its OIL story, its inputs)', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: stamp(true) } })
    const { wb } = await bootStorage(be)
    expect(leaveWarStarted(wb)).toBe(true)
  })
  it('a store not yet started gets it', async () => {
    const be = new MemoryBackend()
    const { wb } = await bootStorage(be)
    expect(leaveWarStarted(wb)).toBe(false)
  })
  it('a bare-number store: its own war record decides, as before', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
    expect(leaveWarStarted((await bootStorage(be)).wb)).toBe(false)
    const be2 = new MemoryBackend()
    be2.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) }, leavewar: { wars: '[]' } })
    expect(leaveWarStarted((await bootStorage(be2)).wb)).toBe(true)
  })
})
