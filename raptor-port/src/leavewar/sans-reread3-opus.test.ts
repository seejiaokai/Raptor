/* FRESH OPUS NARROW RE-READ 3 (chat 155) — written to FAIL on the code as read. Save as
   raptor-port/src/leavewar/sans-reread3-opus.test.ts. Fixture: sans-reread155-opus.test.ts's own (demo week Mon 13 Jul 26,
   today Wed 15 Jul; Hex = `rocky`, Ranger = `bane`, Saber the admin = `ad` / `a`).
   G1 / G1w / G1d: a record that runs to 31 Dec 9999 (savable since fix 2 while he is open-ended SANS) — once his tick is
   taken off, ANY change that keeps or shortens it (his delete included) walks past 31 Dec 9999: the jump over the days he
   already held lands on 9999-12-31, the next step is "+010000-01", which is 10 characters long (the length guard does not
   stop it) and sorts BEFORE every real date, so the walk goes on and refuses a made-up day. (A from-always SANS man — no
   sanFrom, e.g. a demo SANS man — is SANS on "+010000-01" by his ended stretch ['', untick day], the next step wraps to
   1909-12-02, and the walk loops for ever: the save hangs the tab.)
   G2: the door split re-states the copy's first day under the year on screen (commitInputEdit: r.date = fmt(start),
   r.yr = baseYear()), so a copy made while a 2027 week is in view no longer matches its source's raw `date`/`yr`. */
import {
  afterAll, afterEach, beforeAll, beforeEach, expect, it, vi,
} from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { PEOPLE, indexCallsigns, sansOnP } from '../engine/people'
import {
  INPUTS, holds, inputCoversDate, inputSpanIso, sansNewDayProblem,
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
import { commitInput, fmt, sansRefusal } from '../ui/inputedit'
import { initStore as warInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const FRI = '2026-07-17'
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
const record = (person: string, day: string): any =>
  INPUTS.find(r => r.type === 'SANS Availability'
    && holds(r, person) && inputCoversDate(r, fmt(day)))
const tickSans = () => { expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); notify() }
/* Hex's own SANS availability, Wed 15 Jul 26 "until further notice" — to 31 Dec 9999 */
const long = (): any => ({
  iid: 'ilong9999', type: 'SANS Availability', people: [{ p: 'rocky' }], person: 'rocky',
  date: 'Jul 15', yr: 2026, endDate: 'Dec 31 9999', allday: true, sans: { f: true },
})

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

/* Saber ticks Hex SANS today; Hex's record runs Wed 15 Jul 26 – 31 Dec 9999 (saved: every day from today is his).
   Thu 16 Saber takes the tick off: Wed 15 stays a SANS day of his (D2313). Ending the record on Wed 15 adds no day. */
it('G1: shortening a record that ran to 31 Dec 9999 asks no new day (the final save)', () => {
  tickSans()
  const r = long()
  expect(inputSpanIso(r), 'premise').toEqual(['2026-07-15', '9999-12-31'])
  expect(sansNewDayProblem(null, r), 'premise: savable while he is SANS with no end').toBeNull()
  at(2026, 7, 16)
  tickSans()
  expect(sansOnP(PEOPLE.rocky, '2026-07-15'), 'premise: Wed 15 still his').toBe(true)
  const short = { ...r, endDate: undefined }
  expect(sansNewDayProblem(r, short)).toBeNull()          // fails: ['rocky', '+010000-01']
  expect(sansNewDayProblem(r, { ...r, remarks: 'x' })).toBeNull()   // fails the same way: an unchanged span
})
it('G1w: the window refuses the same unchanged record', () => {
  tickSans()
  const r = long()
  at(2026, 7, 16)
  tickSans()
  expect(sansRefusal('rocky', { f: true }, '2026-07-15', '9999-12-31', r)).toBe('')   // fails: "…for SANS aircrew only"
})
/* D299: on Thu 16 Saber deletes Hex — his record ends Wed 15, the day before. The delete is refused. */
it('G1d: deleting Hex is refused by the made-up day', () => {
  tickSans()
  INPUTS.push(long())
  at(2026, 7, 16)
  tickSans()
  expect(deletePerson('rocky'), messages.join('|')).toBeNull()   // fails: "…for rocky on +010000-01…"
})

/* Ranger and Hex share Tue 5 – Thu 7 Jan 27 (filed with a 2026 week in view: 'Jan 5 2027', yr 2026). Hex's posting
   moves to Wed 6 Jan, so Tue 5 is hidden for him (D2341). With a 2027 week in view a time is typed on Hex's row
   (setInpField → saveFromRow → ownPartSave): his copy is re-stated 'Jan 5', yr 2027 — the same days. */
it('G2: a door split re-stated under the year on screen is still matched to its own source', () => {
  posting('rocky'); posting('bane')
  expect(commitInput(null, draft('bane', '2027-01-05', '2027-01-07'), ['bane', 'rocky']), messages.join('|')).toBe(true)
  posting('rocky', '2027-01-06')
  const a: any = record('bane', '2027-01-05')
  expect(sansOnP(PEOPLE.rocky, '2027-01-05'), 'premise: Tue 5 hidden for Hex').toBe(false)
  const drop = (x: any) => ({ ...x, people: x.people.filter((e: any) => e.p !== 'rocky') })
  const his = a.people.find((e: any) => e.p === 'rocky')
  const sameLabel = { ...a, iid: 'isplitG2', people: [his] }
  const restated = { ...sameLabel, date: 'Jan 5', endDate: 'Jan 7', yr: 2027 }
  expect(inputSpanIso(restated), 'premise: the same days').toEqual(inputSpanIso(a))
  const env = (own: any): any => ({
    type: 'input.edit', origin: 'user', actor: deriveActor(),
    changes: [
      { collection: 'inputs', id: a.iid, op: 'put', before: a, after: drop(a) },
      { collection: 'inputs', id: own.iid, op: 'put', before: null, after: own },
    ],
  })
  expect(ownershipViolation(env(sameLabel)), 'premise: the copy as stored passes').toBeNull()
  expect(ownershipViolation(env(restated))).toBeNull()   // fails: "…for rocky on 2027-01-05…"
})
