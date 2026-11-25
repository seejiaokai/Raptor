/* The Fable reader's probes of round 4b (22 Nov 26) — a NEW file, proving or clearing states the brief asks about.
   The fixture is d2328-r4b.test.ts's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex, a WSO. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOn, sansSig } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, dayPendingItems } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { commitSetDayApproved } from '../state/sched-commit'
import { afterSchedMutate } from '../state/view'
import { updatePersonField } from '../state/quals-write'
import { deletePerson } from '../state/person-delete'
import { sansGate } from '../engine/avail'
import { sansRefusal } from '../ui/inputedit'
import { getState, initStore as lwInitStore, setPeople, setPostIn, setShowSans, balanceProblem } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { restoreArchivedPerson, archivePerson, availableFor, postOut, runOilPass, undoPostOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const TUE = 1, THU = 3, SAT = 5
const MON_ISO = '2026-07-13', TUE_ISO = '2026-07-14', WED_ISO = '2026-07-15', THU_ISO = '2026-07-16', FRI_ISO = '2026-07-17', SAT_ISO = '2026-07-18'
const WIN: [number, number] = [600, 660]
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const onlyTheEvent = (di: number) => { const d: any = DAYS[di]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = [{ prog: 'SQN EVENT', str: '0800', end: '1500', who: 'ALL AVAIL' }]; afterSchedMutate() }
const plan = (di: number, id: string, str = '1600', end = '1700') => { (DAYS[di] as any).ground.push({ prog: 'BRIEFING', str, end, who: id }); afterSchedMutate() }
const crowdBothWays = (iso: string, di: number) => {
  expect(setShowSans(false)).toBe(true); raptorNotify()
  const off = availableFor(iso, WIN, DAYS[di] as any)
  expect(setShowSans(true)).toBe(true); raptorNotify()
  const on = availableFor(iso, WIN, DAYS[di] as any)
  expect(setShowSans(false)).toBe(true); raptorNotify()
  return { off, on }
}
const show = (label: string, iso: string, di: number, id: string) => {
  const { off, on } = crowdBothWays(iso, di)
  console.log(`PROBE ${label}: off=${off.includes(id)} on=${on.includes(id)}`)
  return { off: off.includes(id), on: on.includes(id) }
}
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m, d, 9, 0, 0))
void [THU, WED_ISO, THU_ISO, sign, dayPendingItems, commitSetDayApproved, restoreArchivedPerson, runOilPass, undoPostOut]

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(INPUTS0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  stashClear()
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  signInAs('ad', 'a')
})
afterEach(() => { resetSession(null); vi.restoreAllMocks() })

/* FINDING 1 — a man ticked SANS on the Quals page, never shown a row on the war ("+ SANS" off, how the squadron works),
   with no leave, input or OIL of his own before the archive: archiving him takes him out of the crowd of every day
   before his archive (against D327), and the answer depends on how the "+ SANS" switch stood WHEN he was archived. */
describe('FABLE 1: a hand-ticked SANS man with no row on the war, archived — the days before his archive', () => {
  const setUp = () => {
    at(2026, 6, 13)                                                        // Mon 13 Jul
    onlyTheEvent(TUE); plan(TUE, 'rocky')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()   // SANS by hand from Mon
    const before = crowdBothWays(TUE_ISO, TUE)
    expect(before.off, 'before the archive: SANS and named Tue — in').toContain('rocky')
    expect(before.on).toContain('rocky')
    at(2026, 6, 17)                                                        // Fri 17 Jul
  }
  it('archived Fri with "+ SANS" off: still in the crowd of Tue, the day he was named with us (D327) — both ways', () => {
    setUp()
    expect(setShowSans(false)).toBe(true); raptorNotify()
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    const tue = crowdBothWays(TUE_ISO, TUE)
    expect(tue.off, 'switch off').toContain('rocky')
    expect(tue.on, 'switch on').toContain('rocky')
  })
  it('the control: archived Fri with "+ SANS" on, he IS in the crowd of Tue — so the switch decides who is counted', () => {
    setUp()
    expect(setShowSans(true)).toBe(true); raptorNotify()
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    const tue = crowdBothWays(TUE_ISO, TUE)
    expect(tue.off).toContain('rocky')
    expect(tue.on).toContain('rocky')
  })
  it('a Tuesday published with him keeps its crowd when he is archived Fri with "+ SANS" off', () => {
    at(2026, 6, 13)
    onlyTheEvent(TUE); plan(TUE, 'rocky')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    sign(TUE); commitSetDayApproved(TUE, true); runOilPass()
    const before = availableFor(TUE_ISO, WIN, DAYS[TUE] as any)
    expect(before).toContain('rocky')
    at(2026, 6, 17)
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify(); runOilPass()
    expect(availableFor(TUE_ISO, WIN, DAYS[TUE] as any), 'the crowd as published').toEqual(before)
  })
})

/* FINDING 2 (lesser) — a SANS posting dated BEFORE the day an admin ticked him SANS by hand: the posting runs, keeps his
   hand tick's later start, and the days from the posting's date to the tick read him as an ordinary man of ours —
   counted though not named (D283: SANS on the posting date; D27: a SANS man only when planned with us). */
describe('FABLE 2: a SANS posting dated before a hand tick', () => {
  /* FILED, not fixed (chat 147, 22 Nov 26): [FABLE-READ-FAULTS] (s) — the fix needs a new saved stretch and
     "Undo post out" taught to remove exactly it; rare. it.fails keeps the proof: once it is fixed this goes red, and
     it.fails goes back to it. */
  it.fails('ticked SANS by hand Wed, posted out as SANS from Mon (runs at once): Tue, not named, is a SANS day — out, both ways', () => {
    onlyTheEvent(TUE)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(setShowSans(true)).toBe(true); raptorNotify()
    expect(postOut('rocky', MON_ISO, 'sans')).toBe(true); raptorNotify()
    expect(getState().postOuts.rocky?.poDone, 'the posting has run').toBe(MON_ISO)
    const tue = crowdBothWays(TUE_ISO, TUE)
    expect(tue.off, 'switch off').not.toContain('rocky')
    expect(tue.on, 'switch on').not.toContain('rocky')
  })
})

/* OBSERVATION, answered by his D2340 (23 Nov 26, narrowing D2327): with a SANS posting set ahead, a day past its date reads
   him as SANS at once, so a flying seat there asks for his SANS availability — and it may now be filed ahead, from the save,
   for days from the posting's date (filing goes by the day filed); a day before the date is still refused. */
describe('FABLE 3 (D2340): SANS availability for a man whose SANS posting is set ahead', () => {
  it('posting Fri set Wed: Sat reads SANS, a flying seat finds no availability filed, and filing it for Sat is allowed; Thu refused', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(sansOn('rocky', SAT_ISO)).toBe(true)
    expect(sansGate('rocky', (DAYS[SAT] as any).dt, 'fly', 600, 660, SAT_ISO).status).toBe('none')
    expect(sansRefusal('rocky', { f: true }, SAT_ISO)).toBe('')
    expect(sansRefusal('rocky', { f: true }, THU_ISO)).toBe('Hex is SANS from Fri 17 Jul: file SANS availability for days from then')
  })
})

/* CLEARED (pass): states the brief asks about, run and found right. */
describe('FABLE cleared: a SANS posting set ahead, then an archive or a delete before it runs', () => {
  it('posting Fri set Wed, named Sat, archived Thu: in on Tue (D327), out on Sat — both ways; no SANS days kept', () => {
    onlyTheEvent(TUE); onlyTheEvent(SAT); plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 6, 16)
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    expect(P('rocky').sanPo).toBeUndefined()
    const tue = crowdBothWays(TUE_ISO, TUE), sat = crowdBothWays(SAT_ISO, SAT)
    expect(tue.off).toContain('rocky'); expect(tue.on).toContain('rocky')
    expect(sat.off).not.toContain('rocky'); expect(sat.on).not.toContain('rocky')
  })
  it('posting Fri set Wed, deleted Thu: in on Tue (D297), out on Sat — both ways; Sat no longer reads SANS', () => {
    onlyTheEvent(TUE); onlyTheEvent(SAT); plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const ahead = sansSig()
    at(2026, 6, 16)
    expect(deletePerson('rocky')).toBeNull(); raptorNotify()
    expect(sansOn('rocky', SAT_ISO)).toBe(false)
    expect(sansSig()).not.toBe(ahead)
    const tue = crowdBothWays(TUE_ISO, TUE), sat = crowdBothWays(SAT_ISO, SAT)
    expect(tue.off).toContain('rocky'); expect(tue.on).toContain('rocky')
    expect(sat.off).not.toContain('rocky'); expect(sat.on).not.toContain('rocky')
  })
  it('a man deleted before he arrived: his kept record puts no row back on the war, at the delete or at the next install', () => {
    expect(setPostIn('rocky', FRI_ISO)).toBe(true); raptorNotify()
    expect(deletePerson('rocky')).toBeNull(); raptorNotify()
    expect(getState().postOuts.rocky).toMatchObject({ from: FRI_ISO, to: null, gone: true })
    expect(getState().people.some(p => p.id === 'rocky')).toBe(false)
    setPeople(projectPeople()); raptorNotify()
    expect(getState().people.some(p => p.id === 'rocky')).toBe(false)
    void balanceProblem
  })
})
