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
import { protectedWeek } from '../engine/publish'
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

describe('an unsupported (pre-Phase-2) book is preserved byte-for-byte (P2-IMPL-02)', () => {
  it('a legacy book survives load + an unrelated save without being reconstructed', async () => {
    /* build a PRE-Phase-2 blob for WEEK_B: real days, but the OLD amendment
       shape and NO amV/ridV, so it classifies as unsupported. */
    const be0 = new MemoryBackend()
    await boot(be0)
    loadWeek(WEEK_B)
    DAYS[0].notes.push('LEGACY EVIDENCE')
    const base: any = JSON.parse(weekStashSnap())
    delete base.am; delete base.v
    base.ok = { 0: 1 }
    base.o = { 0: { d: JSON.parse(JSON.stringify(DAYS[0])), c: {} } }   // old orig: no id
    base.cv = { 0: 'orig' }                                             // old pointer
    base.a = [{ n: 1, keys: ['dn:0.0'] }]                              // old AL record
    const legacyBlob = JSON.stringify(base)
    resetWorld()

    const be = new MemoryBackend()
    be.seed({ weeks: { [weekId(WEEK_B)]: legacyBlob } })
    const { wb } = await boot(be)
    loadWeek(WEEK_B)
    expect(protectedWeek(), 'classified unsupported → read-only').toBe(true)
    /* an UNRELATED save (any history step) must NOT reconstruct the frozen week */
    HOOKS.histPush()
    expect(wb.get('weeks', weekId(WEEK_B)), 'the original blob is preserved byte-for-byte').toBe(legacyBlob)
    expect(wb.get('weeks', weekId(WEEK_B))).toContain('LEGACY EVIDENCE')   // the recovery evidence still reads
  })
})

describe('a DAMAGED saved week is quarantined, never seeded over (P2-REV2-01)', () => {
  it('an UNREADABLE (unparseable) stored week loads read-only and its bytes survive an unrelated save', async () => {
    /* a truncated / corrupt JSON blob — it will not parse. Before the fix,
       applyWeekModel treated this as "never stashed", loaded the seed, cleared
       preservation, and the next persistAll serialized the SEED over the damaged
       record — destroying it. */
    const damaged = '{"d":[{"dow":"Mon","notes":["DAMAGED EVIDENCE"'
    const be = new MemoryBackend()
    be.seed({ weeks: { [weekId(WEEK_B)]: damaged } })
    const { wb } = await boot(be)
    loadWeek(WEEK_B)
    expect(protectedWeek(), 'a damaged saved week is held read-only').toBe(true)
    /* an unrelated history step must NOT reconstruct or seed over the damaged week */
    HOOKS.histPush()
    expect(wb.get('weeks', weekId(WEEK_B)), 'the original damaged bytes are preserved verbatim').toBe(damaged)
  })

  it('a stored week that parses but has NO days array is treated as damaged, not absent', async () => {
    const noDays = JSON.stringify({ ok: { 0: 1 }, note: 'no d array here' })
    const be = new MemoryBackend()
    be.seed({ weeks: { [weekId(WEEK_B)]: noDays } })
    const { wb } = await boot(be)
    loadWeek(WEEK_B)
    expect(protectedWeek(), 'read-only — not silently seeded over as if missing').toBe(true)
    HOOKS.histPush()
    expect(wb.get('weeks', weekId(WEEK_B)), 'the original bytes are preserved, not a seed re-serialization').toBe(noDays)
  })

  it("a stored week whose JSON is the text 'null' is damaged, not absent — preserved read-only (P2-QREV-06)", async () => {
    const be = new MemoryBackend()
    be.seed({ weeks: { [weekId(WEEK_B)]: 'null' } })      // parses to a falsy value — must not read as missing
    const { wb } = await boot(be)
    loadWeek(WEEK_B)
    expect(protectedWeek(), 'read-only — a falsy-parsing blob is damaged, not absent').toBe(true)
    HOOKS.histPush()
    expect(wb.get('weeks', weekId(WEEK_B)), 'the original bytes are preserved, not overwritten with seed').toBe('null')
  })

  it('a MISSING week (no stash at all) still loads the seed and is EDITABLE — not falsely quarantined', async () => {
    const be = new MemoryBackend()
    await boot(be)
    loadWeek(WEEK_C)                       // never stored → genuinely absent, not damaged
    expect(protectedWeek(), 'an absent week is editable, not read-only').toBe(false)
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
