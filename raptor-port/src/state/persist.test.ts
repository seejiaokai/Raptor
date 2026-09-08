import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, nameToId } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear, stashHas, stashDrop } from '../engine/weekstash'
import { PLANPUCKS, DAYRMK, addPlanPuck } from './plan'
import { initStore, writeInputs, weekStashSnap, weekDirty, loadWeek, moveSectionTo, resetSession } from './store'
import { undo } from './history'
import { setSession } from './auth'
import { hydrate, persistAll, persistPeople, wirePersist, isHydrated, weekId, weekKey } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const BOOT_WEEK = CURWEEK
const WEEK_B = '20/07/2026'   // the authored second demo week: an input lands on it
const WEEK_C = '12/10/2026'   // a blank far-off week: nothing lands
const ROW = { person: 'dj', date: 'Jul 14', allday: true, type: 'LL', remarks: 'persist test', mod: '2026-07-01' }

function resetWorld() {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  for (const id of Object.keys(PEOPLE)) ID_BY_CS[PEOPLE[id].cs.toLowerCase()] = id
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  stashClear()
  if (CURWEEK !== BOOT_WEEK) loadWeek(BOOT_WEEK)   // the swap tests leave the loaded week elsewhere
  stashClear()
}

async function boot(be: MemoryBackend) {
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb, postman } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  return { wb, postman }
}

beforeEach(() => { vi.useFakeTimers(); resetWorld() })
afterEach(() => { vi.useRealTimers(); resetWorld(); setSession(null) })

describe('week ids', () => {
  it('converts the stash key to a record id and back', () => {
    expect(weekId('13/07/2026')).toBe('13-07-2026')
    expect(weekKey('13-07-2026')).toBe('13/07/2026')
  })
})

describe('hydrate', () => {
  it('a fresh backend: not hydrated, seeds run, nothing is lost', async () => {
    const be = new MemoryBackend()
    await boot(be)
    expect(isHydrated()).toBe(false)
    expect(INPUTS.length).toBeGreaterThan(0)
  })

  it('stored inputs REPLACE the seed and the seed merges are skipped; new ids do not collide', async () => {
    const be = new MemoryBackend()
    const stored = [{ ...ROW, iid: 'i57', yr: 2026 }, { ...ROW, date: 'Jul 15', iid: 'i58', yr: 2026 }]
    be.seed({ inputs: { all: JSON.stringify(stored) } })
    await boot(be)
    expect(isHydrated()).toBe(true)
    expect(INPUTS).toHaveLength(2)
    expect(inpId({} as any)).toBe('i59')
  })

  it('stored people replace the roster', async () => {
    const be = new MemoryBackend()
    const people = JSON.parse(PSNAP); people.dj.quals.tf = true
    be.seed({ people: { all: JSON.stringify(people) } })
    await boot(be)
    expect(PEOPLE.dj.quals.tf).toBe(true)
  })

  it('a stored plan layer restores pucks and titles; new puck ids do not collide', async () => {
    const be = new MemoryBackend()
    be.seed({ plan: { all: JSON.stringify({ pp: [{ id: 'pp4', iso: '2026-07-14', kind: 'note', text: 'x' }], dm: { '2026-07-14': 'Title' } }) } })
    await boot(be)
    expect(PLANPUCKS).toHaveLength(1)
    expect(DAYRMK['2026-07-14']).toBe('Title')
    setSession({ user: 'ad', role: 'admin' })
    addPlanPuck('2026-07-15', 'y')
    /* addPlanPuck UNSHIFTS (plan.ts), so the fresh no-collision puck lands at
       index 0 with the restored pp4 pushed to index 1 — its id is pp5, proving
       seedPuckCounter climbed the counter past the stored pp4 */
    expect(PLANPUCKS[0].id).toBe('pp5')
  })

  it('a stored week snapshot is restored into the loaded week at boot', async () => {
    const be1 = new MemoryBackend()
    await boot(be1)
    DAYS[0].notes.push('PERSISTED NOTE')
    const snap = weekStashSnap()
    resetWorld()
    const be2 = new MemoryBackend()
    be2.seed({ weeks: { [weekId(CURWEEK)]: snap } })
    await boot(be2)
    expect(stashHas(CURWEEK)).toBe(true)
    expect(DAYS[0].notes).toContain('PERSISTED NOTE')
  })
})

describe('persistAll and the hooks', () => {
  it('an undoable edit lands on the whiteboard at once and reaches the backend after the coalesce wait', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    writeInputs(() => { INPUTS.push({ ...ROW }) })
    expect(JSON.parse(wb.get('inputs', 'all')!)).toHaveLength(INPUTS.length)
    await vi.advanceTimersByTimeAsync(300)
    expect(be.peek('inputs', 'all')).toBe(wb.get('inputs', 'all'))
  })

  it('the pristine seed week is NOT persisted, an edited week is', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    expect(wb.has('weeks', weekId(CURWEEK))).toBe(false)
    writeInputs(() => { INPUTS.push({ ...ROW }) })     // inputs landing changes the week's `un`/acc → dirty
    HOOKS.histPush()
    expect(wb.has('weeks', weekId(CURWEEK)) || weekDirty() === false).toBe(true)
    DAYS[0].notes.push('X'); HOOKS.histPush()
    expect(wb.has('weeks', weekId(CURWEEK))).toBe(true)
  })

  it('UNDO during a slow save: the whiteboard and the backend both end on the pre-edit state, one letter each', async () => {
    const be = new MemoryBackend(); be.latency = 500
    const { wb } = await boot(be)
    const before = wb.get('inputs', 'all')
    writeInputs(() => { INPUTS.push({ ...ROW }) })
    await vi.advanceTimersByTimeAsync(300)            // letter 1 in flight (500 ms)
    undo()
    expect(wb.get('inputs', 'all')).toBe(before)      // whiteboard already back
    await vi.advanceTimersByTimeAsync(500 + 300 + 500)
    expect(be.peek('inputs', 'all')).toBe(before)
    expect(be.journal.filter(j => j.op === 'put' && j.collection === 'inputs')).toHaveLength(2)
  })

  it('a failed save keeps the whiteboard, reports failed, then saved after the retry', async () => {
    const be = new MemoryBackend()
    const { wb, postman } = await boot(be)
    be.failNext(1)
    writeInputs(() => { INPUTS.push({ ...ROW }) })
    const want = wb.get('inputs', 'all')
    await vi.advanceTimersByTimeAsync(300)
    expect(postman.status).toBe('failed')
    expect(wb.get('inputs', 'all')).toBe(want)
    await vi.advanceTimersByTimeAsync(1000)
    expect(postman.status).toBe('saved')
    expect(be.peek('inputs', 'all')).toBe(want)
  })

  it('a dropped letter is acknowledged but absent — documents that stage 1 trusts the ack', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    /* boot persists inputs/people/plan together (persistAll writes them every
       step). Settle those first so the one letter in flight at the drop is the
       inputs edit below — otherwise the single dropped letter is consumed by
       the boot-time people letter that fires ahead of it. */
    await vi.advanceTimersByTimeAsync(300)
    be.dropOne()
    writeInputs(() => { INPUTS.push({ ...ROW }) })     // only inputs changes now
    await vi.advanceTimersByTimeAsync(300)
    expect(be.journal.filter(j => j.op === 'put' && j.collection === 'inputs')).toHaveLength(2)
    expect(be.peek('inputs', 'all')).not.toBe(wb.get('inputs', 'all'))
  })

  it('persistPeople writes the roster', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    PEOPLE.dj.quals.tf = true
    persistPeople()
    expect(JSON.parse(wb.get('people', 'all')!).dj.quals.tf).toBe(true)
  })

  it('persistAll is a no-op before wirePersist', () => {
    expect(() => persistAll()).not.toThrow()
  })
})

/* The 8 Sep 26 bug pass on the seam: every case here was a real loss or
   corruption found by the audit probes, each pinned so it cannot return. */
describe('the week swap and the stored week records (8 Sep 26 bug pass)', () => {
  it('leaving an edited week for a blank one files the edit under ITS OWN id and nothing under the blank one — and a reload agrees', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    const A = CURWEEK
    DAYS[0].notes.push('WEEK-A-NOTE'); HOOKS.histPush()
    loadWeek(WEEK_C)
    expect(wb.has('weeks', weekId(WEEK_C))).toBe(false)
    expect(wb.get('weeks', weekId(A))).toContain('WEEK-A-NOTE')
    loadWeek(A)                                            // and back: A's record is not overwritten with C's blank days
    expect(wb.has('weeks', weekId(WEEK_C))).toBe(false)
    expect(wb.get('weeks', weekId(A))).toContain('WEEK-A-NOTE')
    expect(DAYS[0].notes).toContain('WEEK-A-NOTE')
    await vi.advanceTimersByTimeAsync(300)
    resetWorld()                                           // the reload
    await boot(be)
    expect(DAYS[0].notes).toContain('WEEK-A-NOTE')
    loadWeek(WEEK_C)
    expect(DAYS[0].notes).not.toContain('WEEK-A-NOTE')
    expect(DAYS[0].waves.length).toBe(0)
  })

  it('a week merely visited is not persisted, even though an input lands on it during the swap', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    loadWeek(WEEK_B)
    expect(wb.has('weeks', weekId(WEEK_B))).toBe(false)
    expect(wb.has('weeks', weekId(BOOT_WEEK))).toBe(false)
  })

  it('undo back to the load state removes the stored record, so the undone edit does not come back after a reload', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    DAYS[0].notes.push('UNDONE'); HOOKS.histPush()
    expect(wb.has('weeks', weekId(CURWEEK))).toBe(true)
    undo()
    expect(wb.has('weeks', weekId(CURWEEK))).toBe(false)
    await vi.advanceTimersByTimeAsync(300)
    expect(be.peek('weeks', weekId(CURWEEK))).toBeNull()
  })

  it("a week dropped from the stash (the Admin sweep) leaves storage on the next persistAll", async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    const A = CURWEEK
    DAYS[0].notes.push('OLD'); HOOKS.histPush()
    loadWeek(WEEK_C)                                       // A is stashed and stored
    expect(wb.has('weeks', weekId(A))).toBe(true)
    stashDrop(A); persistAll()
    expect(wb.has('weeks', weekId(A))).toBe(false)
    await vi.advanceTimersByTimeAsync(300)
    expect(be.peek('weeks', weekId(A))).toBeNull()
  })

  it('a section reorder on the board is filed like any other edit', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    setSession({ user: 'ad', role: 'admin' })
    expect(wb.has('weeks', weekId(CURWEEK))).toBe(false)
    expect(moveSectionTo(0, 'notes', 'waves')).toBe(true)
    const rec = JSON.parse(wb.get('weeks', weekId(CURWEEK))!)
    expect(rec.d[0].secOrder[0]).not.toBe('notes')
  })

  it('a logout keeps the saved planning layer', async () => {
    const be = new MemoryBackend()
    const { wb } = await boot(be)
    setSession({ user: 'ad', role: 'admin' })
    writeInputs(() => { addPlanPuck('2026-07-15', 'keep me') })
    expect(wb.get('plan', 'all')).toContain('keep me')
    resetSession(null)
    HOOKS.histPush()
    expect(wb.get('plan', 'all')).toContain('keep me')
  })
})

describe('hydrate hardening (8 Sep 26 bug pass)', () => {
  it('a null row in a stored record is dropped, not a crash', async () => {
    const be = new MemoryBackend()
    be.seed({
      inputs: { all: JSON.stringify([null, { ...ROW, iid: 'i57', yr: 2026 }]) },
      plan: { all: JSON.stringify({ pp: [null, { id: 'pp4', iso: '2026-07-14', kind: 'note', text: 'x' }], dm: {} }) },
    })
    await boot(be)
    expect(INPUTS).toHaveLength(1)
    expect(PLANPUCKS).toHaveLength(1)
  })

  it('a stored roster rebuilds the callsign index — a renamed callsign resolves after the reload, the old one no longer', async () => {
    const be = new MemoryBackend()
    const people = JSON.parse(PSNAP)
    const oldCs = people.dj.cs; people.dj.cs = 'Renamed'
    be.seed({ people: { all: JSON.stringify(people) } })
    await boot(be)
    expect(nameToId('renamed')).toBe('dj')
    expect(nameToId(oldCs)).toBeUndefined()
  })
})
