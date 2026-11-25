import {
  afterAll, afterEach, beforeAll, beforeEach, expect, it, vi,
} from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOnP } from '../engine/people'
import {
  INPUTS, holds, inputCoversDate, inputSpanIso,
  sansNewDayProblem, sansShownOn, sansShownAny,
} from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { CURWEEK } from '../engine/waves'
import { stashClear } from '../engine/weekstash'
import { initStore, notify, resetSession, loadWeek } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { unitsLoad } from '../state/units'
import { NOTICES } from '../state/notices'
import { updatePersonField } from '../state/quals-write'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import {
  commitInput, commitNewInput, fmt, sansRefusal,
  setInpField, setLeaveRemarks,
} from '../ui/inputedit'
import { initStore as warInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const FRI = '2026-07-17'
const SAT = '2026-07-18'
const mem: Record<string, string> = {}
const messages: string[] = []
const toast0 = HOOKS.toast
let p0 = '', d0 = '', i0 = ''

const at = (y: number, m: number, d: number) =>
  vi.setSystemTime(new Date(y, m - 1, d, 9))

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

const sharedAcrossYears = () => {
  posting('rocky')
  posting('bane')
  expect(
    commitInput(null, draft('bane', SAT, '2027-01-10'), ['bane', 'rocky']),
    messages.join('|'),
  ).toBe(true)
  posting('rocky', '2027-01-05')
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
  DAYS.splice(0, DAYS.length, ...JSON.parse(d0))
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(i0))
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
  resetSession(sessionFor(signIn('ad', 'a')))
  notify()
  messages.length = 0
  HOOKS.toast = m => { messages.push(String(m)) }
})
afterEach(() => {
  HOOKS.toast = toast0
  resetSession(null)
  vi.restoreAllMocks()
})
afterAll(() => {
  vi.useRealTimers()
  storeBackend.impl = null
})

for (const door of ['row', 'remarks'] as const) {
  it('F1: a split survives date normalization through ' + door, () => {
    sharedAcrossYears()
    const wk = CURWEEK
    try {
      loadWeek('04/01/2027')
      const src = record('rocky', '2027-01-05')
      expect(sansShownOn(src, '2027-01-05')).toBe(true)
      const ok = door === 'row'
        ? setInpField(src, 'str', '0900', 'rocky')
        : setLeaveRemarks(src, 'Hex only', 'rocky')
      expect(ok, messages.join('|')).toBe(true)
    } finally {
      loadWeek(wk)
    }
  })
}

it('F1: the gate matches equal dates expressed under different anchor years', () => {
  sharedAcrossYears()
  const src = record('rocky')
  const his = src.people.find((e: any) => e.p === 'rocky')
  const own = {
    ...src, iid: 'inormalizedsplit', people: [his],
    date: 'Jul 18 2026', yr: 2027,
  }
  expect(inputSpanIso(own)).toEqual(inputSpanIso(src))
  const env = (o: any): any => ({
    type: 'inputs.batch', origin: 'user', actor: deriveActor(),
    changes: [
      {
        collection: 'inputs', id: src.iid, op: 'put', before: src,
        after: {
          ...src, people: src.people.filter((e: any) => e.p !== 'rocky'),
        },
      },
      { collection: 'inputs', id: o.iid, op: 'put', after: o },
    ],
  })
  expect(ownershipViolation(
    env({ ...own, date: src.date, yr: src.yr }),
  )).toBeNull()
  expect(ownershipViolation(env(own))).toBeNull()
})

for (const gate of [true, false]) {
  it('F2: an unchanged hidden final-day filing passes '
    + (gate ? 'the commit check' : 'the window check'), () => {
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
    notify()
    expect(
      commitNewInput(draft('rocky', '9999-12-31')),
      messages.join('|'),
    ).toBe(true)
    const r = record('rocky', '9999-12-31')
    expect(r).toBeTruthy()
    at(2026, 7, 16)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
    notify()
    expect(sansOnP(PEOPLE.rocky, '9999-12-31')).toBe(false)
    if (gate) {
      expect(sansNewDayProblem(r, r)).toBeNull()
    } else {
      expect(sansRefusal('rocky', { f: true }, '9999-12-31', '', r)).toBe('')
    }
  })
}

it('F2: a list cannot find a shown day outside the record span after year 9999', () => {
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(
    commitNewInput(draft('rocky', '9999-12-31')),
    messages.join('|'),
  ).toBe(true)
  const r = record('rocky', '9999-12-31')
  expect(r).toBeTruthy()
  at(9999, 12, 31)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(inputSpanIso(r)).toEqual(['9999-12-31', '9999-12-31'])
  expect(sansOnP(PEOPLE.rocky, '9999-12-31')).toBe(false)
  expect(sansShownOn(r, '9999-12-31')).toBe(false)
  expect(sansShownAny(r)).toBe(false)
})
