// @vitest-environment jsdom
/* WHOSE PEOPLE, WHOSE INPUTS — multi-squadron batch 1, step 3 (the plan
   docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4: "Inputs stay one list", "People", "OIL never reads
   the schedule in view"). Red first, each against the code before step 3:
   - a 149 member's input — filed, the units switched, his day published, the app reloaded — never stands on 142's day,
     and a 142 man's never on 149's;
   - switching between 142's and 149's same week many times moves no OIL credit of 142's;
   - a person's delete and a restore's "is he still named" read a stored week of the squadron NOT in view.
   149's people here are seeded inside the test only (the demo's 149 is step 4's). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inputsOn } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend } from '../engine/hooks'
import { stashClear, stashPut, setPreservedBlob } from '../engine/weekstash'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { storesReset } from '../engine/stores'
import { SCHED, signOf, setDayApproved, dayInputsFrozen } from '../engine/publish'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, writeInputs, weekStashSnap, weekDirty, loadWeek, resetSession, switchUnit, forgetUnitPlans, notify } from './store'
import { setSession } from './auth'
import { signIn, sessionFor, accountsLoad } from './accounts'
import { hydrate, wirePersist } from './persist'
import { setHome } from './units'
import { deletePerson } from './person-delete'
import { rosterRestoreProblem } from './roster-restore'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { getState, initStore as lwInitStore, setPeople as lwSetPeople, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { runOilPass, installAbsenceDoor } from '../leavewar/sync'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const BOOT_WEEK = CURWEEK                // 13/07/2026 — the same dates in both units
const FAR_WEEK = '12/10/2026'
const TUE = 1, SAT = 5                   // 14 Jul; 18 Jul, the seed Saturday plasma stands SDO on and earns a full day
const signInAs = (name: string, pass = 'x') => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

function resetWorld() {
  if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT)
  forgetUnitPlans()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  for (const id of Object.keys(PEOPLE)) ID_BY_CS[PEOPLE[id].cs.toLowerCase()] = id
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  stashClear(); loadWeek(FAR_WEEK); stashClear(); loadWeek(BOOT_WEEK); stashClear()
  storesReset()
}
async function boot(be: MemoryBackend) {
  be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  return { wb }
}
async function reload(be: MemoryBackend) {
  await vi.advanceTimersByTimeAsync(300)
  setSession(null)
  resetWorld()
  await boot(be)
  signInAs('ad', 'a')
}
/* a 149 man, seeded here only: a pilot like bane, at home in 149 from before the demo week (setHome runs "from today",
   so the clock is set to 1 Jul 26 first) */
function seed149(id: string, cs: string) {
  ;(PEOPLE as any)[id] = { ...JSON.parse(JSON.stringify((PEOPLE as any).bane)), cs }
  indexCallsigns()
  expect(setHome(id, 'u149').ok, `${cs} at home in 149`).toBe(true)
}
const iidOf = (pred: (r: any) => boolean) => String((INPUTS.find(pred) as any).iid)
const standsOn = (di: number, iid: string) => inputsOn(DAYS[di].dt).some((r: any) => String(r.iid) === iid)
const landedOn = (iid: string) => JSON.stringify(DAYS).includes(`"src":"${iid}"`)

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 1, 9, 0, 0)); resetWorld(); _resetTimeline(); installGlobalUndo() })
afterEach(() => { vi.useRealTimers(); setSession(null); resetWorld(); _resetTimeline(); storeBackend.impl = null })

describe('a squadron\'s inputs stand on its own days only', () => {
  it('a 149 member\'s leave and his accepted training — filed, switched, published, reloaded — never on 142\'s day; a 142 man\'s never on 149\'s', async () => {
    const be = new MemoryBackend()
    await boot(be)
    signInAs('ad', 'a')                                   // Saber: the master, at home in 142
    seed149('zulu', 'Zulu')
    expect(writeInputs(() => {
      INPUTS.push({ person: 'zulu', date: 'Jul 14', yr: 2026, allday: true, type: 'OL', remarks: 'ZULU LEAVE', mod: '2026-07-01' })
      INPUTS.push({ person: 'zulu', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, type: 'Training', remarks: 'ZULU TRAINING', mod: '2026-07-01' })
    })).toBe(true)
    const leave = iidOf(r => r.person === 'zulu' && r.type === 'OL')
    const training = iidOf(r => r.person === 'zulu' && r.type === 'Training')
    const salsa = iidOf(r => r.person === 'salsa' && r.date === 'Jul 14')   // a 142 man's appointment, the seed's
    expect(standsOn(TUE, salsa), '142\'s own request stands on its own day').toBe(true)
    expect(standsOn(TUE, leave), '149\'s leave is not on 142\'s Tuesday').toBe(false)

    /* 149 accepts the training onto its Ground Programme, and publishes the Tuesday and the Wednesday */
    switchUnit('u149')
    expect(standsOn(TUE, leave), 'on 149\'s Tuesday').toBe(true)
    expect(standsOn(TUE, salsa), 'a 142 man\'s request is not on 149\'s day').toBe(false)
    expect(writeInputs(() => { (INPUTS.find((r: any) => String(r.iid) === training) as any).acc = 'g' })).toBe(true)
    loadWeek(FAR_WEEK); loadWeek(BOOT_WEEK)
    expect(landedOn(training), '149\'s training lands on 149\'s Ground Programme').toBe(true)
    expect(Object.keys(dayInputsFrozen(TUE)), '149\'s version freezes its own leave').toContain(leave)
    expect(Object.keys(dayInputsFrozen(TUE)), '…and no 142 request').not.toContain(salsa)
    sign(TUE); setDayApproved(TUE, true); sign(2); setDayApproved(2, true)

    for (let i = 0; i < 5; i++) {
      switchUnit('u142')
      expect(standsOn(TUE, leave), `142, swap ${i}`).toBe(false)
      expect(landedOn(training), `142, swap ${i}: no 149 row on 142's days`).toBe(false)
      expect(Object.keys(dayInputsFrozen(TUE)), `142, swap ${i}: 142's version would freeze no 149 leave`).not.toContain(leave)
      switchUnit('u149')
      expect(standsOn(TUE, leave), `149, swap ${i}`).toBe(true)
      expect(landedOn(training), `149, swap ${i}`).toBe(true)
    }
    /* 142 publishes its own Tuesday: its version holds its own requests, never 149's */
    switchUnit('u142')
    sign(TUE); setDayApproved(TUE, true)
    expect(JSON.stringify(SCHED.cur), '142\'s issued day').not.toContain('ZULU')

    await reload(be)
    expect(UNIT).toBe('u142')
    expect(standsOn(TUE, leave), 'after a reload, 142').toBe(false)
    expect(landedOn(training), 'after a reload, 142').toBe(false)
    expect(standsOn(TUE, salsa)).toBe(true)
    switchUnit('u149')
    expect(standsOn(TUE, leave), 'after a reload, 149').toBe(true)
    expect(landedOn(training), 'after a reload, 149').toBe(true)
    expect(standsOn(TUE, salsa)).toBe(false)
  })
})

describe('OIL never reads the schedule in view', () => {
  it('switching between 142\'s and 149\'s same week many times moves none of 142\'s credits', async () => {
    /* the Leave War's own OIL harness (leavewar/oil-bidagainst.test.ts): no storage boot, no sign-in — with nobody
       signed in the OIL pass's squadron is the boot squadron, 142. This file runs in the scheduler's test project, so
       the hooks the Leave War's own setup wires on every initStore (the day's date, its earning, the absence door —
       leavewar/test-setup.ts) are wired here by hand; without them the published Saturday freezes no OIL evidence. */
    SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
    SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
    stashClear(); initStore()
    lwInitStore(memoryBackend()); installAbsenceDoor(); lwSetPeople(projectPeople()); lwSetRole('admin')
    sign(SAT); setDayApproved(SAT, true)                 // 142 publishes the Saturday plasma stands SDO on
    runOilPass()
    const cell = () => getState().wars[0].grid['plasma']?.['2026-07-18']
    expect(cell(), 'plasma earns a full day').toBe('FO')
    for (let i = 0; i < 6; i++) {
      switchUnit('u149'); runOilPass()
      expect(cell(), `149 in view, swap ${i}: 142's credit stays`).toBe('FO')
      switchUnit('u142'); runOilPass()
      expect(cell(), `142 in view, swap ${i}`).toBe('FO')
    }
    /* and another week of 149's in view, then back */
    switchUnit('u149'); loadWeek(FAR_WEEK); runOilPass()
    expect(cell(), '149\'s far week in view').toBe('FO')
  })
})

describe('a delete and a restore read the stored weeks of the squadron not in view', () => {
  const NEXT_YEAR = '04/01/2027'         // a Monday after any delete's cutoff
  const mem: Record<string, string> = {}
  beforeEach(() => {
    vi.useRealTimers()
    Object.keys(mem).forEach(k => delete mem[k])
    storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) }
    initStore(); accountsLoad(); resetSession(sessionFor(signIn('ad', 'a'))); notify()
  })
  afterEach(() => { resetSession(null) })
  const week = (who: string) => JSON.stringify({ d: [{ ground: [{ who, t: 'x' }] }] })

  it('a 149 week that cannot be read refuses the delete, as a 142 one does', () => {
    stashPut('u149@' + NEXT_YEAR, '{ not a week')
    expect(deletePerson('bane'), 'the week of 149\'s').toBe(`The week of ${NEXT_YEAR} can't be read — the delete was not made`)
    expect((PEOPLE as any).bane.deleted, 'nothing was deleted').toBeFalsy()
  })
  it('a 149 week kept byte for byte that holds him from the cutoff refuses it', () => {
    stashPut('u149@' + NEXT_YEAR, week('bane')); setPreservedBlob('u149@' + NEXT_YEAR, week('bane'))
    expect(deletePerson('bane')).toBe(`The week of ${NEXT_YEAR} can't be changed — the delete was not made`)
  })
  it('a restore that would remove a man is refused while a stored week of EITHER squadron names him', () => {
    ;(PEOPLE as any).newman = { cs: 'Newman', ini: 'NM', seat: 'FCP', cat: 'C', quals: {} }
    indexCallsigns()
    const removal = [{ collection: 'people', id: 'newman', op: 'delete', before: { cs: 'Newman' } }]
    const REFUSAL = 'Newman is on the schedule, an input or the Leave War — take him off first.'
    expect(rosterRestoreProblem(removal, 'undo'), 'named nowhere').toBeNull()
    stashPut('u149@' + NEXT_YEAR, week('newman'))
    expect(rosterRestoreProblem(removal, 'undo'), 'named in a stored week of 149\'s').toBe(REFUSAL)
    stashClear()
    stashPut(NEXT_YEAR, week('newman'))                   // the schedule in view's own (142's)
    expect(rosterRestoreProblem(removal, 'undo'), 'named in a stored week of 142\'s').toBe(REFUSAL)
  })
})
