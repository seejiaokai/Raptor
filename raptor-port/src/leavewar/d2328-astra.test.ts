/* Astra's read of D2328 (ALL AVAIL and the post-in date), 22 Nov 26 — his findings, reproduced by the host before they
   counted; the fixture copied from d2328-read.test.ts (the fresh, blind Opus reader's tests).
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


/* ASTRA'S READ OF D2328, 22 Nov 26 (round 4 of the bug check) — his findings 2 and 3, reproduced by the host before they
   count. Finding 1 is the fresh Opus reader's R1, already repaired (d2328-read.test.ts R1a, R1b). */
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m, d, 9, 0, 0))

describe('ASTRA 2: a man deleted before he ever arrived does not count on a day before his post-in date', () => {
  it('an ordinary new man, post-in Fri, deleted Wed: out on Tue — both ways', () => {
    onlyTheEvent(TUE)
    expect(setPostIn('rocky', FRI_ISO)).toBe(true); raptorNotify()
    inBoth(TUE_ISO, TUE, 'rocky', false, 'before the delete: before his post-in date (D2328)')
    expect(deletePerson('rocky')).toBeNull(); raptorNotify()
    inBoth(TUE_ISO, TUE, 'rocky', false, 'after the delete: still before his post-in date (D2328, D297)')
  })
  for (const sw of [false, true]) it(`a new man ticked SANS Mon, post-in Fri, named Tue, deleted Wed with "+ SANS" ${sw ? 'on' : 'off'}: out on Tue — both ways`, () => {
    at(2026, 6, 13)
    onlyTheEvent(TUE); plan(TUE, 'rocky')
    expect(setPostIn('rocky', FRI_ISO)).toBe(true); raptorNotify()           // the post-in date set as he is added
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    at(2026, 6, 15)
    inBoth(TUE_ISO, TUE, 'rocky', false, 'before the delete')
    expect(setShowSans(sw)).toBe(true); raptorNotify()
    expect(deletePerson('rocky')).toBeNull(); raptorNotify()
    inBoth(TUE_ISO, TUE, 'rocky', false, 'after the delete')
  })
})

describe('ASTRA, the tests missing: the exact post-in date', () => {
  it('a new man ticked SANS Mon, post-in Thu, named Wed and Thu: out on Wed, in on Thu itself — both ways', () => {
    at(2026, 6, 13)
    onlyTheEvent(2); plan(2, 'rocky'); onlyTheEvent(THU); plan(THU, 'rocky')
    expect(setPostIn('rocky', THU_ISO)).toBe(true); raptorNotify()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    at(2026, 6, 15)
    inBoth(WED_ISO, 2, 'rocky', false, 'the day before his post-in date (D2328)')
    inBoth(THU_ISO, THU, 'rocky', true, 'his post-in date itself, SANS and named with us (D2328, D2329)')
  })
})

describe('ASTRA 3: archiving a returning man before his return does not fill the gap he was away', () => {
  for (const sw of [false, true]) it(`posted Overseas Mon, restored to return Sat, ticked SANS Mon, named Tue, archived again Wed with "+ SANS" ${sw ? 'on' : 'off'}: out on Tue — both ways`, () => {
    at(2026, 6, 13)
    onlyTheEvent(TUE); plan(TUE, 'rocky')
    expect(postOut('rocky', MON_ISO, 'overseas')).toBe(true); raptorNotify()
    expect(P('rocky').archived).toBe(true)
    expect(restoreArchivedPerson('rocky', SAT_ISO)).toBe(true); raptorNotify()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(sansOn('rocky', TUE_ISO)).toBe(true)
    at(2026, 6, 15)
    inBoth(TUE_ISO, TUE, 'rocky', false, 'before the second archive: away until Sat (D320, D2328)')
    expect(setShowSans(sw)).toBe(true); raptorNotify()
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    expect(P('rocky').archived).toBe(true)
    inBoth(TUE_ISO, TUE, 'rocky', false, 'after the second archive: the gap stays a gap (D320, D323)')
    inBoth(TUE_ISO, TUE, 'rocky', false, 'and still after the switch is moved back and forth')
  })
  /* THE HOST'S, found while repairing it: the R1 repair counts a day inside an ENDED SANS stretch that began the day after
     an earlier stint's end — meant for the stretch a SANS posting made and an archive ended. A tick an admin made on the
     Quals page the day the man's Overseas posting ran, then took off, is the same shape and is not that: the days
     between his posting and his return are a real gap (D320, D2328). */
  it('posted Overseas Mon, restored to return Sat, ticked SANS on Quals Mon and unticked Wed, named Tue: out on Tue — both ways', () => {
    at(2026, 6, 13)
    onlyTheEvent(TUE); plan(TUE, 'rocky')
    expect(postOut('rocky', MON_ISO, 'overseas')).toBe(true); raptorNotify()
    expect(restoreArchivedPerson('rocky', SAT_ISO)).toBe(true); raptorNotify()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    at(2026, 6, 15)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(P('rocky').san).toBeFalsy()
    expect(sansOn('rocky', TUE_ISO), 'SANS on Tue by the tick, kept (D2313)').toBe(true)
    inBoth(TUE_ISO, TUE, 'rocky', false, 'Tue: away until Sat — a hand tick fills no gap (D320, D2328)')
  })
})
