/* The narrow read of D2328 (ALL AVAIL and the post-in date) — the fresh, blind Opus reader's tests, 22 Nov 26.
   The fixture is allavail-sans-posted.test.ts's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex,
   a WSO; `nick` is SANS at the start. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOn } from '../engine/people'
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
import { getState, initStore as lwInitStore, setPeople, setPostIn, setShowSans } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { archivePerson, availableFor, postOut, restoreArchivedPerson, runOilPass, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const MON = 0, TUE = 1, THU = 3, SAT = 5
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
const inBoth = (iso: string, di: number, id: string, want: boolean, why = '') => {
  const { off, on } = crowdBothWays(iso, di)
  expect(off.includes(id), `${why} — switch off`).toBe(want)
  expect(on.includes(id), `${why} — switch on`).toBe(want)
}

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

/* ---------------- FINDING: a restore with a later post-in date takes him out of days he flew with us as SANS ---------------- */
describe('FINDING R1: posted out as SANS, archived, restored with a later post-in date', () => {
  const setUp = () => {
    onlyTheEvent(TUE); plan(TUE, 'rocky')
    expect(postOut('rocky', MON_ISO, 'sans')).toBe(true); raptorNotify()      // SANS from Mon 13 Jul — runs today
    expect(sansOn('rocky', TUE_ISO), 'SANS by his posting on Tue 14 Jul').toBe(true)
    expect(availableFor(TUE_ISO, WIN, DAYS[TUE] as any), 'Tue: SANS and named with us').toContain('rocky')
  }
  it('R1a: the crowd of Tue 14 Jul (SANS by posting, named with us) is unchanged by the restore — both ways', () => {
    setUp()
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()            // archived Wed 15 Jul
    expect(P('rocky').archived).toBe(true)
    inBoth(TUE_ISO, TUE, 'rocky', true, 'archived: in before his archive (D327)')
    expect(restoreArchivedPerson('rocky', SAT_ISO)).toBe(true); raptorNotify() // back from Sat 18 Jul
    expect(P('rocky').archived).toBeFalsy()
    expect(sansOn('rocky', TUE_ISO), 'his SANS days by the posting are kept (D2313)').toBe(true)
    const po = getState().postOuts.rocky
    expect(po?.from).toBe(SAT_ISO)
    expect(po?.past?.length).toBe(1)
    inBoth(TUE_ISO, TUE, 'rocky', true, 'Tue 14 Jul: SANS and flying with us (D283, D27) — a restore must not take him out')
  })
  it('R1b: a published Tue 14 Jul does not read pending after the archive and the restore', () => {
    setUp()
    sign(TUE); commitSetDayApproved(TUE, true); runOilPass()
    expect(dayPendingItems(TUE).length, 'published clean').toBe(0)
    const before = availableFor(TUE_ISO, WIN, DAYS[TUE] as any)
    expect(before).toContain('rocky')
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify(); runOilPass()
    const afterArchive = JSON.stringify(dayPendingItems(TUE))
    expect(afterArchive, 'after the archive: no pending line about who earns OIL').not.toMatch(/oil/i)
    expect(restoreArchivedPerson('rocky', SAT_ISO)).toBe(true); raptorNotify(); runOilPass()
    expect(JSON.stringify(dayPendingItems(TUE)), 'the restore adds no pending line about who earns OIL').not.toMatch(/oil/i)
    expect(availableFor(TUE_ISO, WIN, DAYS[TUE] as any), 'the crowd as it was published').toEqual(before)
  })

  /* THE HOST'S, with the repair of R1 (chat 141): what the repair must NOT open. It counts a day inside a SANS stretch
     a posting made and an archive ended. A day after the archive and before the new post-in date is a real gap (D2328,
     D327) — for the same man, and for a man an admin ticked SANS on the Quals page, whose tick no archive ends. */
  it('after the restore, a day between his archive and his new post-in date is a real gap: out though named — both ways', () => {
    setUp()
    onlyTheEvent(THU); plan(THU, 'rocky')
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()            // archived Wed 15 Jul
    expect(restoreArchivedPerson('rocky', SAT_ISO)).toBe(true); raptorNotify() // back from Sat 18 Jul
    expect(getState().postOuts.rocky?.from).toBe(SAT_ISO)
    expect(sansOn('rocky', THU_ISO), 'his SANS ended at the archive').toBe(false)
    inBoth(THU_ISO, THU, 'rocky', false, 'Thu 16 Jul: archived then, not yet posted in again')
  })
  it('a man an admin ticked SANS, archived and restored from Sat: named on Thu 16 Jul he is out — both ways', () => {
    onlyTheEvent(THU); plan(THU, 'rocky')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()   // SANS from Wed 15 Jul, on Quals
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    expect(restoreArchivedPerson('rocky', SAT_ISO)).toBe(true); raptorNotify()
    expect(P('rocky').archived).toBeFalsy()
    expect(getState().postOuts.rocky?.from).toBe(SAT_ISO)
    expect(sansOn('rocky', THU_ISO), 'the Quals tick is not ended by an archive').toBe(true)
    inBoth(THU_ISO, THU, 'rocky', false, 'Thu 16 Jul: before his new post-in date (D2328)')
  })
})

/* ---------------- question 2: the states around the change, both switch positions ---------------- */
describe('Q2: states the function already handled', () => {
  it('a regular, no posting record: in, both ways', () => {
    onlyTheEvent(THU)
    expect(getState().postOuts.rocky).toBeUndefined()
    inBoth(THU_ISO, THU, 'rocky', true)
  })
  it('a regular posted in Mon 13 Jul: in on Tue, both ways; posted in Fri: out on Tue', () => {
    onlyTheEvent(TUE)
    expect(setPostIn('rocky', MON_ISO)).toBe(true); raptorNotify()
    expect(getState().postOuts.rocky?.from).toBe(MON_ISO)
    inBoth(TUE_ISO, TUE, 'rocky', true)
    expect(setPostIn('rocky', FRI_ISO)).toBe(true); raptorNotify()
    inBoth(TUE_ISO, TUE, 'rocky', false)
  })
  it('a SANS posting still to come (Fri), on a day before its date (Thu): the regular he is, in, both ways', () => {
    onlyTheEvent(THU)
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(sansOn('rocky', THU_ISO)).toBe(false)
    inBoth(THU_ISO, THU, 'rocky', true)
  })
  it('Overseas Sqn posting run (Wed): out on Thu though named, in on Tue — both ways', () => {
    onlyTheEvent(THU); plan(THU, 'rocky'); onlyTheEvent(TUE)
    expect(postOut('rocky', WED_ISO, 'overseas')).toBe(true); raptorNotify()
    inBoth(THU_ISO, THU, 'rocky', false)
    inBoth(TUE_ISO, TUE, 'rocky', true)
  })
  it('Overseas Sqn posting to come (Fri), regular: in on Thu, out on Sat — both ways', () => {
    onlyTheEvent(THU); onlyTheEvent(SAT); plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'overseas')).toBe(true); raptorNotify()
    inBoth(THU_ISO, THU, 'rocky', true)
    inBoth(SAT_ISO, SAT, 'rocky', false)
  })
  it('Delete posting to come (Fri): in on Thu, out on Sat — both ways', () => {
    onlyTheEvent(THU); onlyTheEvent(SAT); plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'delete')).toBe(true); raptorNotify()
    inBoth(THU_ISO, THU, 'rocky', true)
    inBoth(SAT_ISO, SAT, 'rocky', false)
  })
  it('no chip posting (Fri): in on Thu, out on Sat — both ways', () => {
    onlyTheEvent(THU); onlyTheEvent(SAT); plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'none')).toBe(true); raptorNotify()
    inBoth(THU_ISO, THU, 'rocky', true)
    inBoth(SAT_ISO, SAT, 'rocky', false)
  })
  it('a regular archived (Wed) and restored from Sat: in Tue (first stint), out Thu (the gap), in Sat — both ways', () => {
    onlyTheEvent(TUE); onlyTheEvent(THU); onlyTheEvent(SAT)
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    expect(restoreArchivedPerson('rocky', SAT_ISO)).toBe(true); raptorNotify()
    expect(getState().postOuts.rocky?.past?.length).toBe(1)
    inBoth(TUE_ISO, TUE, 'rocky', true)
    inBoth(THU_ISO, THU, 'rocky', false)
    inBoth(SAT_ISO, SAT, 'rocky', true)
  })
  it('a deleted man (today): in Tue, out Thu — both ways', () => {
    onlyTheEvent(TUE); onlyTheEvent(THU)
    expect(deletePerson('rocky')).toBeNull(); raptorNotify()
    expect(P('rocky').deleted).toBe(true)
    inBoth(TUE_ISO, TUE, 'rocky', true)
    inBoth(THU_ISO, THU, 'rocky', false)
  })
  it('the war holding no row: nick, SANS from the start, no posting record — named in, not named out, both ways', () => {
    onlyTheEvent(THU); plan(THU, 'nick'); onlyTheEvent(TUE)
    expect(getState().postOuts.nick).toBeUndefined()
    expect(getState().people.some(p => p.id === 'nick')).toBe(false)
    inBoth(THU_ISO, THU, 'nick', true)
    inBoth(TUE_ISO, TUE, 'nick', false)
  })
  it('a SANS man archived, then his archive date lost (D56 — demo data only): the window decides, both ways', () => {
    onlyTheEvent(TUE); plan(TUE, 'rocky')
    expect(postOut('rocky', MON_ISO, 'sans')).toBe(true); raptorNotify()
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    delete P('rocky').archivedOn
    const { off, on } = crowdBothWays(TUE_ISO, TUE)
    expect(off).toEqual(on)
  })
  it('a SANS posting run (Mon), Monday itself named: in, both ways', () => {
    onlyTheEvent(MON); plan(MON, 'rocky')
    expect(postOut('rocky', MON_ISO, 'sans')).toBe(true); raptorNotify()
    inBoth(MON_ISO, MON, 'rocky', true)
  })
})
