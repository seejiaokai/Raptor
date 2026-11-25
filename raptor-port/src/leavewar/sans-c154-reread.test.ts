import {
  afterAll, afterEach, beforeAll, beforeEach, expect, it, vi,
} from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { PEOPLE, indexCallsigns, sansOnP } from '../engine/people'
import {
  INPUTS, holds, inputCoversDate, idsOf, sansAvailOn, inputSpanIso, sansNewDayProblem, sansShownAny,
} from '../engine/inputs'
import { DAYS } from '../engine/data'
import {
  SCHED, signOf, setDayApproved, dayApproved, dayCurVer, dayPendingItems,
} from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore, notify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { unitsLoad } from '../state/units'
import { NOTICES } from '../state/notices'
import { updatePersonField } from '../state/quals-write'
import { deletePerson } from '../state/person-delete'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import {
  commitInput, commitNewInput, draftOf, fmt,
} from '../ui/inputedit'
import { withDaySnap } from '../ui/html'
import { sbSansPanel } from '../ui/board-html'
import { initStore as warInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const FRI = '2026-07-17'
const SAT = '2026-07-18'
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

const shared = (end = '') => {
  posting('rocky')
  posting('bane') // Hex and Ranger
  expect(
    commitInput(null, draft('bane', SAT, end), ['bane', 'rocky']),
    messages.join('|'),
  ).toBe(true)
}
const sign = () => Object.assign(signOf(5), {
  cur: 'ignite', sked: 'bane', plan: 'stiff', appr: 'pump',
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

it('R1a: Hex can Undo yesterday\'s own SANS tick', () => {
  login('hex')
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(PEOPLE.rocky.sanFrom).toBe('2026-07-15')

  at(2026, 7, 16)
  expect(globalUndo().ok).toBe(true)
  expect(sansOnP(PEOPLE.rocky, '2026-07-15')).toBe(false)
})

it('R1b: next-day Redo restores the original SANS start', () => {
  login('hex')
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(globalUndo().ok).toBe(true)

  at(2026, 7, 16)
  expect(globalRedo().ok).toBe(true)
  expect(PEOPLE.rocky.sanFrom).toBe('2026-07-15')
})

/* (the host, chat 155: the replay vouches only for the step the timeline is applying — a command that merely calls itself
   a restore, setting his SANS start back to 1 Jan, is still refused) */
it('R1c: a made-up restore of his own row setting his SANS start back is refused', () => {
  login('hex')
  const p: any = PEOPLE.rocky
  const env: any = {
    type: 'undo.restore', origin: 'restore', actor: deriveActor(),
    changes: [{ collection: 'people', id: 'rocky', op: 'put', before: { ...p }, after: { ...p, san: true, sanFrom: '2026-01-01' } }],
  }
  expect(ownershipViolation(env)).toMatch(/his SANS days/)
})

it('R2: the issued board keeps Hex after his posting moves', () => {
  shared()
  sign()
  setDayApproved(5, true)
  expect(dayApproved(5)).toBe(true)
  const version = dayCurVer(5)

  posting('rocky', LATER)
  expect(sansAvailOn('rocky', DAYS[5].dt)).toBeNull()
  expect(withDaySnap(5, version,
    () => sansAvailOn('rocky', DAYS[5].dt))).toBeTruthy()

  const html = withDaySnap(5, version,
    () => sbSansPanel(DAYS[5], 5, undefined, true))
  expect(html).toContain('data-person="bane"')
  expect(html).toContain('data-person="rocky"')
})

it('R3: an extension after day 400 cannot add non-SANS days', () => {
  at(2025, 1, 1)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(
    commitNewInput(draft('rocky', '2025-01-01', '2026-07-14')),
    messages.join('|'),
  ).toBe(true)

  at(2026, 7, 15)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(sansOnP(PEOPLE.rocky, '2026-07-14')).toBe(true)
  expect(sansOnP(PEOPLE.rocky, '2026-07-15')).toBe(false)

  const r = record('rocky', '2026-07-14')
  expect(r).toBeTruthy()
  expect(
    commitInput(r, { ...draftOf(r), end: '2026-07-16' }, ['rocky']),
    messages.join('|'),
  ).toBe(false)
})

/* (the host, chat 155: the same at the final save's own check, asked directly — the window's check could hide it) */
it('R3b: the final save\'s check names the new day past day 400', () => {
  at(2025, 1, 1)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(commitNewInput(draft('rocky', '2025-01-01', '2026-07-14')), messages.join('|')).toBe(true)
  at(2026, 7, 15)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  const r = record('rocky', '2026-07-14')
  const after = { ...r, endDate: String(r.endDate).replace('14', '16') }
  const sp = inputSpanIso(after)
  expect(sp?.[1], 'premise: the record now runs to Thu 16').toBe('2026-07-16')
  expect(sansNewDayProblem(r, after)).toEqual(['rocky', '2026-07-15'])
  expect(sansNewDayProblem(r, r), 'the days it already held still save').toBeNull()
})

it('R4: deleting Hex preserves his past hidden shared-input slice', () => {
  shared('2026-07-20')
  posting('rocky', LATER)
  at(2026, 7, 19)

  expect(deletePerson('rocky'), messages.join('|')).toBeNull()
  expect(PEOPLE.rocky.deleted).toBe(true)
  expect(record('rocky', SAT)).toBeTruthy()
  expect(record('rocky', '2026-07-19')).toBeUndefined()
  expect(idsOf(record('bane', '2026-07-20'))).toEqual(['bane'])
})

/* (the fresh Opus re-read's one open check, chat 154 — D109, D113: one act, one change): Sat 18 published with Ranger and
   Hex on one shared offer, then Hex's posting moved later, hiding his part — the day reads ONE pending change, not two
   (the offer's, and his person-attribute record's "SANS yes → no") */
it('R5: one posting move hiding Hex reads one pending change on the published day', () => {
  shared()
  sign()
  setDayApproved(5, true)
  expect(dayApproved(5)).toBe(true)
  expect(dayPendingItems(5), 'premise: nothing waits once published').toEqual([])
  posting('rocky', LATER)
  const items = dayPendingItems(5)
  expect(items.length, JSON.stringify(items)).toBe(1)
})

/* (the host, chat 155: the split's allowance is narrow — a row split off the shared offer that reaches back to Thu 16, a
   day the offer never held, is still refused at the final save; so is one naming someone the offer never held) */
it('R4b: a split-off row adding a day, or another man, is still refused', () => {
  shared('2026-07-20')
  posting('rocky', LATER)
  const src: any = record('bane', SAT)
  const his = src.people.find((e: any) => e.p === 'rocky')
  const rest = { ...src, people: src.people.filter((e: any) => e.p !== 'rocky') }
  const env = (own: any): any => ({
    type: 'input.edit', origin: 'user', actor: deriveActor(),
    changes: [
      { collection: 'inputs', id: src.iid, op: 'put', before: src, after: rest },
      { collection: 'inputs', id: own.iid, op: 'put', before: null, after: own },
    ],
  })
  const kept = { ...src, iid: 'isplit1', people: [his] }
  expect(ownershipViolation(env(kept)), 'premise: the plain split passes').toBeNull()
  expect(ownershipViolation(env({ ...kept, date: 'Jul 16' }))).toMatch(/not one of his SANS days/)
  expect(ownershipViolation(env({ ...kept, people: [{ ...his, p: 'drift' }] }))).toBeTruthy()
})

/* (the fresh Opus re-read 2, chat 155 — the same 400-day limit in the lists' own question): a long record whose shown days
   all fall after its 400th still shows on the lists; one with no SANS day of his at all does not */
it('R6: a long record shown only after its 400th day still shows on the lists', () => {
  const long = { type: 'SANS Availability', people: [{ p: 'rocky' }], person: 'rocky', date: '2025-01-01', endDate: '2026-12-31', allday: true, sans: { f: true } }
  expect(sansShownAny(long), 'premise: Hex is SANS on none of its days yet').toBe(false)
  posting('rocky')
  expect(sansShownAny(long)).toBe(true)
})
