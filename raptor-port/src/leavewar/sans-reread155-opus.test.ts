/* THE FRESH OPUS NARROW RE-READ 2 (chat 155) — written to FAIL on the code as read. Fixture: sans-c154-reread.test.ts's own
   (the demo week of Mon 13 Jul 26, today Wed 15 Jul; Hex = `rocky`, Ranger = `bane`, Saber the admin = `ad` / `a`).
   F4a / F4b / F4c: fix 4 picks the FIRST SANS record of the command that dropped the man as the split row's source — a
   delete that also takes Hex out of a second, later shared offer judges his kept part against the wrong record and is
   refused (one of F4a / F4b fails, whichever filing order puts the later offer first in the list; F4c pins it directly).
   F3w / F3r: fix 3 walks past 31 Dec 9999 into a made-up day ("+010000-01") and refuses a filing whose every day is his. */
import {
  afterAll, afterEach, beforeAll, beforeEach, expect, it, vi,
} from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { PEOPLE, indexCallsigns, sansOnP } from '../engine/people'
import {
  INPUTS, holds, inputCoversDate, idsOf, inputSpanIso, sansNewDayProblem,
} from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore, notify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { unitsLoad } from '../state/units'
import { NOTICES } from '../state/notices'
import { updatePersonField } from '../state/quals-write'
import { deletePerson } from '../state/person-delete'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { commitInput, commitNewInput, fmt, sansRefusal } from '../ui/inputedit'
import { initStore as warInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const FRI = '2026-07-17'
const SAT = '2026-07-18'
const MON = '2026-07-20'
const THU23 = '2026-07-23'
const LATER = '2026-07-24'
const mem: Record<string, string> = {}
let p0 = '', d0 = '', i0 = ''
const toast0 = HOOKS.toast
const messages: string[] = []

const at = (y: number, m: number, d: number) =>
  vi.setSystemTime(new Date(y, m - 1, d, 9))
const login = (name: string, pass = 'x') => {
  resetSession(sessionFor(signIn(name, pass)))
  notify()
}
const posting = (id: string, day = FRI) => {
  expect(postOut(id, day, 'sans'), messages.join('|')).toBe(true)
  notify()
}
const draft = (person: string, start: string, end = '') => ({
  _new: true, person, type: 'SANS Availability', start, end,
  allday: true, sTime: '06:00', eTime: '18:00',
  remarks: '', sans: { f: true },
})
const record = (person: string, day = SAT): any =>
  INPUTS.find(r => r.type === 'SANS Availability'
    && holds(r, person) && inputCoversDate(r, fmt(day)))
/* one offer for Ranger and Hex */
const offer = (start: string, end = '') => {
  expect(commitInput(null, draft('bane', start, end), ['bane', 'rocky']), messages.join('|')).toBe(true)
}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  p0 = JSON.stringify(PEOPLE)
  d0 = JSON.stringify(DAYS)
  i0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  at(2026, 7, 15)
  for (const k of Object.keys(mem)) delete mem[k]
  storeBackend.impl = {
    getItem: k => mem[k] ?? null,
    setItem: (k, v) => { mem[k] = v },
    keys: () => Object.keys(mem),
  }
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(p0))
  indexCallsigns()
  DAYS.length = 0
  DAYS.push(...JSON.parse(d0))
  INPUTS.length = 0
  INPUTS.push(...JSON.parse(i0))
  NOTICES.length = 0
  Object.assign(SCHED, {
    pending: {}, changes: {}, added: {}, als: [], al: 0,
    dayOK: {}, sign: {}, orig: {}, cur: {}, signBind: {},
    drafts: {}, curDraft: {}, retired: {}, correcting: {},
  })
  stashClear()
  warInit(memoryBackend())
  initStore()
  accountsLoad()
  unitsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  login('ad', 'a')
  _resetTimeline()
  installGlobalUndo()
  messages.length = 0
  HOOKS.toast = m => { messages.push(String(m)) }
})
afterEach(() => {
  HOOKS.toast = toast0
  resetSession(null)
  _resetTimeline()
  vi.restoreAllMocks()
})
afterAll(() => {
  vi.useRealTimers()
  storeBackend.impl = null
})

/* Ranger and Hex share Sat 18 – Mon 20 and Thu 23; Hex's posting moves to Fri 24 (both hidden for him, D2341); on Sun 19
   Saber deletes Hex: his Sat 18 part is kept as a row of its own (D299), he leaves the Thu 23 offer. Either filing order
   must delete him. */
it('F4a: Hex deleted — the later shared offer filed first', () => {
  posting('rocky'); posting('bane')
  offer(THU23)
  offer(SAT, MON)
  posting('rocky', LATER)
  at(2026, 7, 19)
  expect(deletePerson('rocky'), messages.join('|')).toBeNull()
  expect(record('rocky', SAT), 'his Sat 18 kept').toBeTruthy()
  expect(idsOf(record('bane', THU23))).toEqual(['bane'])
})
it('F4b: Hex deleted — the spanning shared offer filed first', () => {
  posting('rocky'); posting('bane')
  offer(SAT, MON)
  offer(THU23)
  posting('rocky', LATER)
  at(2026, 7, 19)
  expect(deletePerson('rocky'), messages.join('|')).toBeNull()
  expect(record('rocky', SAT), 'his Sat 18 kept').toBeTruthy()
  expect(idsOf(record('bane', THU23))).toEqual(['bane'])
})
/* the same at the gate, the envelope as deriveChanges lists it (the records in their stored order, the new row last) */
it('F4c: the split row is judged against the offer it came from, whichever dropped record comes first', () => {
  posting('rocky'); posting('bane')
  offer(SAT, MON)
  offer(THU23)
  posting('rocky', LATER)
  const a: any = record('bane', SAT), f: any = record('bane', THU23)
  expect(a && f && a.iid !== f.iid, 'premise: two offers').toBeTruthy()
  const drop = (r: any) => ({ ...r, people: r.people.filter((e: any) => e.p !== 'rocky') })
  const own = { ...a, iid: 'isplit2', people: [a.people.find((e: any) => e.p === 'rocky')] }
  const env = (first: any, second: any): any => ({
    type: 'input.edit', origin: 'user', actor: deriveActor(),
    changes: [
      { collection: 'inputs', id: first.iid, op: 'put', before: first, after: drop(first) },
      { collection: 'inputs', id: second.iid, op: 'put', before: second, after: drop(second) },
      { collection: 'inputs', id: own.iid, op: 'put', before: null, after: own },
    ],
  })
  expect(ownershipViolation(env(a, f)), 'premise: its own offer listed first, the split passes').toBeNull()
  expect(ownershipViolation(env(f, a))).toBeNull()
})

/* Hex ticked SANS today, open-ended: every day from Wed 15 is his. A filing on 30–31 Dec 9999 holds only his days. */
it('F3w: the final save does not walk past 31 Dec 9999 into a made-up day', () => {
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(commitNewInput(draft('rocky', '2026-07-15')), messages.join('|')).toBe(true)
  const r = record('rocky', '2026-07-15')
  expect(r).toBeTruthy()
  const far = { ...r, date: 'Dec 30 9999', endDate: 'Dec 31 9999' }
  expect(inputSpanIso(far), 'premise').toEqual(['9999-12-30', '9999-12-31'])
  expect(sansOnP(PEOPLE.rocky, '9999-12-31'), 'premise: his day').toBe(true)
  expect(sansNewDayProblem(null, far)).toBeNull()
})
it('F3r: the window\'s check does not walk past 31 Dec 9999 either', () => {
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(sansRefusal('rocky', { f: true }, '9999-12-30', '9999-12-31')).toBe('')
})
