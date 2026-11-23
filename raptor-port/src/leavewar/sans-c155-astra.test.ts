import {
  afterAll, afterEach, beforeAll, beforeEach, expect, it, vi,
} from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOnP } from '../engine/people'
import {
  INPUTS, holds, inputCoversDate, idsOf,
  sansNewDayProblem, sansShownOn,
} from '../engine/inputs'
import { takePerson } from '../engine/inputown'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore, notify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { unitsLoad } from '../state/units'
import { NOTICES } from '../state/notices'
import { updatePersonField } from '../state/quals-write'
import { deletePerson } from '../state/person-delete'
import { commitInputsWith } from '../state/sched-commit'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import {
  commitInput, commitNewInput, fmt, sansRefusal,
} from '../ui/inputedit'
import { inputsInMode } from '../ui/sans-calendar-model'
import { initStore as warInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const FRI = '2026-07-17'
const SAT = '2026-07-18'
const LATER = '2026-07-24'
const mem: Record<string, string> = {}
const messages: string[] = []
const toast0 = HOOKS.toast
let p0 = '', d0 = '', i0 = ''

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

const shared = (end = '') => {
  posting('rocky')
  posting('bane')
  expect(
    commitInput(null, draft('bane', SAT, end), ['bane', 'rocky']),
    messages.join('|'),
  ).toBe(true)
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
  login('ad', 'a')
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

it('F1: deleting Hex matches his retained slice to its own source', () => {
  shared('2026-07-20')
  expect(
    commitInput(
      null,
      draft('bane', '2026-07-21', '2026-07-22'),
      ['bane', 'rocky'],
    ),
    messages.join('|'),
  ).toBe(true)
  posting('rocky', LATER)
  at(2026, 7, 19)

  const result = deletePerson('rocky')
  expect(result, messages.join('|')).toBeNull()
  expect(PEOPLE.rocky.deleted).toBe(true)
  expect(record('rocky', SAT)).toBeTruthy()
  expect(record('rocky', '2026-07-19')).toBeUndefined()
  expect(idsOf(record('bane', '2026-07-21'))).toEqual(['bane'])
})

it('F2: one take-out cannot excuse two fresh hidden filings by Hex', () => {
  shared()
  posting('rocky', LATER)
  at(2026, 7, 16)
  login('hex')
  const src = record('rocky')
  const copies = [0, 1].map(n => ({
    ...JSON.parse(JSON.stringify(src)),
    iid: 'ic155duplicate' + n,
    by: 'rocky',
    at: Date.now(),
    people: [{ p: 'rocky', by: 'rocky', at: Date.now(), h: 0 }],
    sans: n ? { o: true } : { f: true },
  }))

  // The same new filing without a donor is correctly refused.
  expect(ownershipViolation({
    type: 'inputs.batch',
    origin: 'user',
    actor: deriveActor(),
    changes: [{
      collection: 'inputs',
      id: copies[0].iid,
      op: 'put',
      after: copies[0],
    }],
  } as any)).toBeTruthy()

  const result = commitInputsWith([], 'inputs.batch', () => {
    takePerson(src, 'rocky')
    INPUTS.push(...copies)
  })
  expect(
    result.ok,
    'a single removed holding was spent twice',
  ).toBe(false)
})

it('F3: a long filing stays in the calendar when later days remain SANS', () => {
  posting('rocky')
  expect(
    commitNewInput(draft('rocky', SAT, '2028-07-18')),
    messages.join('|'),
  ).toBe(true)
  const r = record('rocky')
  posting('rocky', '2027-09-01')

  expect(sansShownOn(r, '2027-09-01')).toBe(true)
  expect(inputsInMode([r], 'sans')).toContain(r)
})

for (const gate of [true, false]) {
  it(
    'F4: ' + (gate ? 'commit gate' : 'window')
      + ' stops after the requested final day',
    () => {
      expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
      notify()
      const end = '9999-12-31'
      expect(sansOnP(PEOPLE.rocky, end)).toBe(true)
      const r = {
        iid: 'ic155lastday',
        type: 'SANS Availability',
        people: [{ p: 'rocky' }],
        date: end,
        sans: { f: true },
      }

      if (gate) {
        expect(sansNewDayProblem(null, r)).toBeNull()
      } else {
        expect(sansRefusal('rocky', { f: true }, end)).toBe('')
      }
    },
  )
}
