/* FABLE OIL READ F1, 22 Nov 26 — THE HALF LEFT AS IT IS. The fix (leavewar/sync.ts availableFor, engine/publish.ts
   peopleAttrsNow) reads a SANS tick a POSTING put on by the posting's date, so the crowd of a day before it stays as it
   went out (fableoil-sans-crowd.test.ts). These pin what that fix must NOT move:
   - from his posting date on he is SANS, out of the ALL AVAIL crowd (D283), and a day already published for those dates
     still reads pending — nothing on a published day changes without the scheduler acknowledging it (D44, D45);
   - (a SANS tick made by hand on Quals was pinned here as "keeps no date, read on every date — a question for the owner".
     He answered it the same day, D2313: a hand tick counts from the day it is made, a re-tick after a posting keeps the
     posting's date. The three tests below now hold that; the full set is sans-from-date.test.ts.)
   - a SANS posting still to come changes no crowd. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, dayPendingItems } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { commitSetDayApproved } from '../state/sched-commit'
import { afterSchedMutate } from '../state/view'
import { updatePersonField } from '../state/quals-write'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { availableFor, postOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const MON = 0, MON_ISO = '2026-07-13', WED = 2, WED_ISO = '2026-07-15', THU = 3, THU_ISO = '2026-07-16'
const WIN: [number, number] = [600, 660]
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
/* the day holds one thing: a squadron event for ALL AVAIL, 08:00 to 15:00 — so nobody is named on it */
const onlyTheEvent = (di: number) => { const d: any = DAYS[di]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = [{ prog: 'SQN EVENT', str: '0800', end: '1500', who: 'ALL AVAIL' }]; afterSchedMutate() }
const crowd = (iso: string, di: number) => availableFor(iso, WIN, DAYS[di] as any)

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))                      // Wed 15 Jul 26, the demo week
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

describe('a man posted out as SANS — from his posting date on he is out of the ALL AVAIL crowd, as before', () => {
  it('the posting date itself and the day after leave him out; the day before keeps him', () => {
    onlyTheEvent(MON); onlyTheEvent(WED); onlyTheEvent(THU)
    expect(crowd(WED_ISO, WED), 'before the posting: in the crowd on Wed').toContain('rocky')
    expect(crowd(THU_ISO, THU), 'before the posting: in the crowd on Thu').toContain('rocky')
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true)
    raptorNotify()
    expect(P('rocky').san).toBe(true)
    expect(P('rocky').sanBy, 'the tick is the posting’s own').toBe('po')
    expect(crowd(WED_ISO, WED), 'Wed 15 Jul, the posting date: SANS, out').not.toContain('rocky')
    expect(crowd(THU_ISO, THU), 'Thu 16 Jul, after it: SANS, out').not.toContain('rocky')
    expect(crowd(MON_ISO, MON), 'Mon 13 Jul, before it: the crowd as it was').toContain('rocky')
  })

  it('a day already published for a date after his posting still reads pending when the posting runs', () => {
    onlyTheEvent(THU)
    sign(THU); commitSetDayApproved(THU, true)
    expect(dayPendingItems(THU).length, 'nothing pending on the day as published').toBe(0)
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true)
    raptorNotify()
    expect(crowd(THU_ISO, THU)).not.toContain('rocky')
    expect(dayPendingItems(THU).length, 'he left Thursday’s crowd: the scheduler is shown it').toBeGreaterThan(0)
  })

  it('a SANS posting still to come changes no crowd', () => {
    onlyTheEvent(MON); onlyTheEvent(WED); onlyTheEvent(THU)
    expect(postOut('rocky', '2026-07-17', 'sans')).toBe(true)          // Fri 17 Jul — two days ahead
    raptorNotify()
    expect(P('rocky').san, 'not yet run').toBeFalsy()
    expect(crowd(MON_ISO, MON)).toContain('rocky')
    expect(crowd(WED_ISO, WED)).toContain('rocky')
    expect(crowd(THU_ISO, THU), 'his last day as a regular').toContain('rocky')
  })
})

describe('a SANS tick made by hand on Quals counts from the day it is made (owner D2313, 22 Nov 26)', () => {
  it('he is out of the crowd from the day of the tick; the days before it keep him', () => {
    onlyTheEvent(MON); onlyTheEvent(THU)
    expect(crowd(MON_ISO, MON)).toContain('rocky')
    expect(updatePersonField('rocky', { tick: 'san' } as any)).toBeNull()   // ticked Wed 15 Jul
    raptorNotify()
    expect(P('rocky').san).toBe(true)
    expect(P('rocky').sanBy, 'a hand tick carries no posting mark').toBeUndefined()
    expect(P('rocky').sanFrom, 'it keeps the day it was made').toBe(WED_ISO)
    expect(crowd(MON_ISO, MON), 'Mon 13 Jul, before the tick: the crowd as it was').toContain('rocky')
    expect(crowd(THU_ISO, THU), 'Thu 16 Jul: out').not.toContain('rocky')
  })

  it('a published day before the tick reads nothing pending; one after it still does', () => {
    onlyTheEvent(MON); onlyTheEvent(THU)
    sign(MON); commitSetDayApproved(MON, true)
    sign(THU); commitSetDayApproved(THU, true)
    expect(dayPendingItems(MON).length).toBe(0)
    expect(dayPendingItems(THU).length).toBe(0)
    expect(updatePersonField('rocky', { tick: 'san' } as any)).toBeNull()
    raptorNotify()
    expect(dayPendingItems(MON).length, 'Mon 13 Jul went out before he was SANS: unchanged').toBe(0)
    expect(dayPendingItems(THU).length, 'he left Thursday’s crowd: the scheduler is shown it (D44, D45)').toBeGreaterThan(0)
  })

  it('a hand tick put back after a SANS posting keeps the posting’s date, though the mark is the admin’s own', () => {
    onlyTheEvent(MON); onlyTheEvent(THU)
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true)
    raptorNotify()
    expect(crowd(MON_ISO, MON)).toContain('rocky')
    /* unticked, then ticked again by hand: the tick is now the admin's own (state/quals-write.ts drops `sanBy`) */
    expect(updatePersonField('rocky', { tick: 'san' } as any)).toBeNull()
    expect(updatePersonField('rocky', { tick: 'san' } as any)).toBeNull()
    raptorNotify()
    expect(P('rocky').san).toBe(true)
    expect(P('rocky').sanBy).toBeUndefined()
    expect(P('rocky').sanFrom, 'SANS from the posting’s date still').toBe(WED_ISO)
    expect(crowd(MON_ISO, MON), 'Mon 13 Jul, before his SANS date: in').toContain('rocky')
    expect(crowd(THU_ISO, THU), 'Thu 16 Jul: out').not.toContain('rocky')
  })
})
