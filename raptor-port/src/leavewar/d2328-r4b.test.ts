/* Round 4b's reads of D2328 / D2329, 22 Nov 26 (chat 146) — the fresh, blind Opus reader's probes (O1, O2, copied from
   its copy, each failing before the fix) and Astra's finding 2, reproduced by the host before they counted. The fixture
   is d2328-astra.test.ts's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex, a WSO. */
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
import { getState, initStore as lwInitStore, setPeople, setShowSans } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { restoreArchivedPerson, archivePerson, availableFor, postOut, runOilPass, undoPostOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const THU = 3, SAT = 5
const MON_ISO = '2026-07-13', WED_ISO = '2026-07-15', THU_ISO = '2026-07-16', FRI_ISO = '2026-07-17', SAT_ISO = '2026-07-18'
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
const at = (y: number, m: number, d: number) => vi.setSystemTime(new Date(y, m, d, 9, 0, 0))

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

describe('O1: a SANS posting whose SANS is not marked the posting\'s, then an archive — the days he flew with us', () => {
  it('O1a: SANS by hand Wed, posted out as SANS from Wed (runs today), named Thu, archived Fri: in on Thu — both ways', () => {
    onlyTheEvent(THU); plan(THU, 'rocky')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()   // SANS by hand from Wed
    expect(setShowSans(true)).toBe(true); raptorNotify()                             // a hidden SANS man has no row to post out from
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true); raptorNotify()             // runs now: his own tick kept
    expect(setShowSans(false)).toBe(true); raptorNotify()
    expect(getState().postOuts.rocky?.poDone, 'the posting has run').toBe(WED_ISO)
    inBoth(THU_ISO, THU, 'rocky', true, 'before the archive: SANS, posted out as SANS, named Thu')
    at(2026, 6, 17)
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    inBoth(THU_ISO, THU, 'rocky', true, 'Thu, the day before his archive (D327, D283, D27)')
  })
  it('O1b: the same, published Thu: archiving him Fri leaves the published Thursday clean', () => {
    onlyTheEvent(THU); plan(THU, 'rocky')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
    expect(setShowSans(true)).toBe(true); raptorNotify()
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true); raptorNotify()
    expect(setShowSans(false)).toBe(true); raptorNotify()
    sign(THU); commitSetDayApproved(THU, true); runOilPass()
    expect(dayPendingItems(THU).length, 'published clean').toBe(0)
    const before = availableFor(THU_ISO, WIN, DAYS[THU] as any)
    expect(before).toContain('rocky')
    at(2026, 6, 17)
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify(); runOilPass()
    expect(availableFor(THU_ISO, WIN, DAYS[THU] as any), 'the crowd as published').toEqual(before)
    /* (the host's narrowing of the reader's probe: a man NAMED on a published day who is archived reads "1 pending" there
       by D327 — what must not move is the crowd, and nothing about who earns OIL, as d2328-read.test.ts R1b) */
    expect(JSON.stringify(dayPendingItems(THU)), 'no pending line about who earns OIL').not.toMatch(/oil/i)
  })
  it('O1c: SANS posting from Mon (ran), SANS unticked and re-ticked on Quals the same day Wed (no gap), named Thu, archived Fri: in on Thu', () => {
    at(2026, 6, 13)
    onlyTheEvent(THU); plan(THU, 'rocky')
    expect(postOut('rocky', MON_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 6, 15)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()   // off
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()   // on again, same day
    expect(P('rocky').san).toBe(true)
    expect(P('rocky').sanFrom, 'a same-day re-tick leaves no gap: SANS from the posting\'s Monday').toBe(MON_ISO)
    inBoth(THU_ISO, THU, 'rocky', true, 'before the archive')
    at(2026, 6, 17)
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    inBoth(THU_ISO, THU, 'rocky', true, 'Thu, the day before his archive (D327, D283)')
  })
})

describe('O2: part 3 widens every day-reader — the next-week preview\'s key does not see it', () => {
  it('a SANS posting set ahead changes the SANS signature the preview is kept by (as a posting run or taken back does)', () => {
    const before = sansSig()
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    expect(sansOn('rocky', SAT_ISO), 'Sat now reads SANS (D2329)').toBe(true)
    expect(sansSig(), 'the preview drawn before the posting must be drawn again').not.toBe(before)
  })
  it('…and "Undo post out" of a posting set ahead changes it back', () => {
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()
    const ahead = sansSig()
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    expect(sansOn('rocky', SAT_ISO)).toBe(false)
    expect(sansSig()).not.toBe(ahead)
  })
})

describe('ASTRA r4b 2: a hand tick the day of a restore keeps the days he flew with us as SANS', () => {
  it('posted out as SANS Mon, named Tue, archived Wed, restored to Sat and ticked SANS on Quals the same Wed: in on Tue, out on Thu — both ways', () => {
    at(2026, 6, 13)
    onlyTheEvent(1); plan(1, 'rocky'); onlyTheEvent(THU); plan(THU, 'rocky')
    expect(postOut('rocky', MON_ISO, 'sans')).toBe(true); raptorNotify()
    at(2026, 6, 15)
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    expect(restoreArchivedPerson('rocky', SAT_ISO)).toBe(true); raptorNotify()
    inBoth('2026-07-14', 1, 'rocky', true, 'Tue after the restore')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()   // SANS by hand, the same day
    expect(P('rocky').san).toBe(true)
    inBoth('2026-07-14', 1, 'rocky', true, 'Tue after the hand tick: still the days he flew with us (D327, D2313)')
    inBoth(THU_ISO, THU, 'rocky', false, 'Thu: before his new post-in date (D2328)')
  })
})
