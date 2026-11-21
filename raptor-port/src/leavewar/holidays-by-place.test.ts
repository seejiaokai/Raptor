// @vitest-environment jsdom
/* PUBLIC HOLIDAYS BY PLACE AND DATE; OFF DAYS BY SQUADRON — multi-squadron batch 1, step 4 (the plan
   docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4; D2160, D2165, D2184: "squadrons at one place share
   one public-holiday list, each its own Off day"). Each squadron's Leave War is a world of its own (sync.ts swapWarWorld,
   each from its own door); a public holiday entered in 149's list is laid onto 142's on read — never stored in 142's — on
   every date both are at the same place, and the OIL earning day (HOOKS.oilEarningDay) and the published days a new
   holiday puts out of date (holidayOutOfDate, D2184 R32) read it so. 149's Off day stays 149's.
   Red first: before step 4 a holiday was read from the loaded war alone, so 149's holiday was a working day for 142. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { DAYS } from '../engine/data'
import { setDayApproved, signOf } from '../engine/publish'
import { initStore as raptorInitStore, resetSession, notify } from '../state/store'
import { setSession } from '../state/auth'
import { signIn, sessionFor } from '../state/accounts'
import { moveUnit, setPlace } from '../state/units'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { projectPeople } from './state/raptorRoster'
import { getState, holidayAdd, initStore as lwInitStore, lwHistInit, rawState, setPeople, setRole, worldUnit } from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'
import { dayFacts, holidayOutOfDate, nonWorkingFor, setWarWorldDoor, swapWarWorld, wireLeaveWarSync } from './sync'
import { outOfDateSaid } from '../ui/oilday'

const toast = HOOKS.toast
let doors: Record<string, StorageBackend>
/* the settings rows (a place, a squadron's move) are saved and read back — a write the store does not keep fails */
const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const WED = '2026-07-15', THU = '2026-07-16'      // in the demo week, 13–19 Jul 26: Wednesday is day 2, Thursday day 3
const WED_DI = 2, THU_DI = 3
const one = (iso: string, kind: 'ph' | 'off' = 'ph') => ({ kind, name: '', from: iso, to: iso })
const storedText = (b: StorageBackend) => b.keys().map(k => b.read(k) || '').join('\n')
/* a squadron's own admin signs in, and his squadron's Leave War is the one loaded (an admin of 142 may not write 149's
   holidays — the unit gate reads his role in the war's squadron) */
const as = (name: string, pass: string, unit: string) => {
  const r = signIn(name, pass); resetSession(sessionFor(r)); notify()
  swapWarWorld(unit); setRole('admin')
  expect(worldUnit()).toBe(unit)
}
const as142 = () => as('ad', 'a', 'u142'), as149 = () => as('ad9', 'a9', 'u149')
const publish = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; setDayApproved(di, true) }

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 1, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  doors = { u142: memoryBackend(), u149: memoryBackend() }
  lwInitStore(doors.u142, { unit: 'u142' })
  setPeople(projectPeople())
  wireLeaveWarSync()
  setWarWorldDoor(u => ({ backend: doors[u]!, seedDemo: true }))
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  as142()
})
afterEach(() => {
  setWarWorldDoor(null)
  for (let di = 0; di < DAYS.length; di++) setDayApproved(di, false)
  HOOKS.toast = toast; _resetTimeline(); setSession(null); vi.useRealTimers(); storeBackend.impl = null
})

describe('a public holiday is the place\'s, an Off day the squadron\'s', () => {
  it('149\'s public holiday is 142\'s too (laid on, never stored in 142\'s world); 149\'s Off day is not', () => {
    expect(dayFacts(WED).kind, 'a working Wednesday for 142 to start').not.toBe('ph')
    expect(HOOKS.oilEarningDay(WED_DI)).toBe(false)

    as149()
    expect(holidayAdd(one(WED))).toEqual({ ok: true })
    expect(holidayAdd(one(THU, 'off'))).toEqual({ ok: true })
    expect(dayFacts(THU).kind, '149\'s own Off day').toBe('off')

    as142()
    expect(dayFacts(WED), '142 reads 149\'s public holiday at their one place').toMatchObject({ kind: 'ph' })
    expect(HOOKS.oilEarningDay(WED_DI), '…and its OIL is earned on it').toBe(true)
    expect(nonWorkingFor('u149', WED), '149 answers the same from its own door').toBe(true)
    expect(dayFacts(THU).kind, '149\'s Off day is not 142\'s').not.toBe('off')
    expect(HOOKS.oilEarningDay(THU_DI)).toBe(false)
    expect(nonWorkingFor('u142', THU)).toBe(false)
    /* laid on at read, never written into 142's own records */
    const day = rawState().wars.flatMap(w => w.period.days).find(d => d.date === WED)
    expect(JSON.stringify(day?.events ?? []), 'not in 142\'s raw war').not.toMatch(/"PH"|"ph"/)
  })

  it('by date: once 142 has moved to another place, 149\'s later holidays are not 142\'s — its earlier ones still are', () => {
    const p = setPlace({ name: 'Det base', tz: 'Australia/Darwin' })
    expect(p.ok).toBe(true)
    expect(moveUnit('u142', p.id!).ok, '142 moves from tomorrow, 2 Jul').toBe(true)
    as149()
    expect(holidayAdd(one('2026-07-01'))).toEqual({ ok: true })   // today: both still at home
    expect(holidayAdd(one(WED))).toEqual({ ok: true })            // after 142's move
    as142()
    expect(dayFacts('2026-07-01').kind, 'a day both were at home').toBe('ph')
    expect(dayFacts(WED).kind, 'a day 142 is elsewhere').not.toBe('ph')
    expect(HOOKS.oilEarningDay(WED_DI)).toBe(false)
  })
})

/* A4 (the reshape plan §7 — the review's proof a-a04-holiday-reaches-other-sqn, word for word, in the harness it names):
   one squadron's public holiday still reached the other squadron at the same place. Correct per D2195 ("a holiday one
   squadron adds never touches another squadron's days, OIL or bell") and D2207. */
describe('A4 — a holiday 142 adds stays 142’s (D2195)', () => {
  it('149 asked from its own door: Wed 15 Jul stays a working day', () => {
    expect(holidayAdd(one(WED))).toEqual({ ok: true })
    expect(nonWorkingFor('u149', WED), '149’s day is untouched').toBe(false)
  })
  it('149’s own Leave War loaded: Wed 15 Jul is not a public holiday, and earns no OIL', () => {
    expect(holidayAdd(one(WED))).toEqual({ ok: true })
    as149()
    expect(dayFacts(WED).kind, '149’s war').not.toBe('ph')
    expect(HOOKS.oilEarningDay(WED_DI), '149 earns no OIL on 142’s holiday').toBe(false)
  })
})

describe('R32 (D2184): a new public holiday names, before it is saved, each squadron\'s published days it puts out of date', () => {
  it('142\'s published Wednesday is named; an unpublished day, or a day already a holiday, is not', () => {
    publish(WED_DI)
    expect(holidayOutOfDate(WED, THU), 'only the published day').toEqual([{ unit: 'u142', days: [WED] }])
    expect(outOfDateSaid(holidayOutOfDate(WED, THU))).toBe('This puts a published day out of date: 142\'s Wed 15 Jul. Publish it again so OIL is earned.')
    publish(THU_DI)
    expect(outOfDateSaid(holidayOutOfDate(WED, THU))).toBe('This puts published days out of date: 142\'s Wed 15 Jul and Thu 16 Jul. Publish them again so OIL is earned.')
    expect(holidayAdd(one(WED))).toEqual({ ok: true })
    expect(holidayOutOfDate(WED, WED), 'already a holiday: nothing more goes out of date').toEqual([])
  })

  it('the words name each squadron, its days joined as a person would say them', () => {
    expect(outOfDateSaid([])).toBe('')
    expect(outOfDateSaid([{ unit: 'u142', days: ['2026-07-20'] }, { unit: 'u149', days: ['2026-07-20', '2026-07-21', '2026-07-22'] }]))
      .toBe('This puts published days out of date: 142\'s Mon 20 Jul; 149\'s Mon 20 Jul, Tue 21 Jul and Wed 22 Jul. Publish them again so OIL is earned.')
  })
})
