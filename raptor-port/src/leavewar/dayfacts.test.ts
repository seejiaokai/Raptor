// WHAT THE CALENDARS READ FROM THE LEAVE WAR (the build plan
// docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.1, §3.3, §5 "The Leave War reads"; owner D617,
// D626, D627, D637, D640).
//
// Two stores hold the facts of one day: the flying class and the required figures are the scheduler's, the holiday and
// who is available are the war's. `dayFacts` is the war's half, handed to the ONE resolver (state/flyplan-model.ts
// planFor). What these tests pin:
//   - a public holiday, an Off day and a seeded holiday flag are told apart, and No Leave is not a holiday;
//   - a date no leave period covers says so and offers no availability (the need is then unknown, never zero);
//   - who is available is the war's own count, day by day — a half day of leave is half a man;
//   - the two Available rows are ordinary count rows an admin can rename and re-define (D640), but a SANS man is never
//     counted whatever they say (D626), they cannot be deleted or turned into a team count, and they carry no amber or
//     red of their own;
//   - the calendars HEAR the war change — a signal of its own, moved by what these reads read and by nothing else.

import { beforeEach, describe, expect, it } from 'vitest'
import {
  AVAIL_P, AVAIL_W, AVAIL_DELETE_MSG, builtinAvailRule, countsFor, evaluateDay, isAvailId, type ManningRule, type Person,
} from './engine'
import {
  addEventBand, availRules, createWar, deleteManningRule, focusDay, getState, initStore, manningDeleteProblem,
  manningRowIds, orderedManningIds, saveManningRule, selectWar, setCell, setDayEvent, setDayEventRange,
  setManningThreshold, setPeople, setRole, setViewer, updateEventType,
} from './state/store'
import { memoryBackend } from './state/storage'
import { elevenCounters, fileAbsence } from './testkit'
import { dayFacts, holidaysIn, subscribeWarFacts, warFactsVersion } from './sync'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})

/* every pilot / WSO the war's own category counts see on a date — the independent sum the Available rows must equal
   while nobody on the roster is SANS and the rows are as built in */
function seats(date: string): { p: number; w: number } {
  const s = getState()
  const c = countsFor(s.people, s.grid, s.states, date, s.views)
  return { p: c.byCategory.IP + c.byCategory.OPSP, w: c.byCategory.IWSO + c.byCategory.OPSW }
}
const pilot = () => getState().people.find(p => p.seat === 'pilot' && !p.pers)!
const sansMan = (id: string, seat: 'pilot' | 'wso'): Person =>
  ({ id, callsign: id.toUpperCase(), seat, band: 'ops', sxo: false, from: null, to: null, san: true }) as Person

describe('a day’s holiday, as the calendars read it', () => {
  it('a public holiday typed on the Event row', () => {
    setDayEvent('2026-05-01', 0, 'PH')
    expect(dayFacts('2026-05-01')).toMatchObject({ covered: true, kind: 'ph', name: 'PH', weekend: false })
  })

  it('an Off day', () => {
    setDayEvent('2026-05-04', 0, 'Off day')
    expect(dayFacts('2026-05-04')).toMatchObject({ covered: true, kind: 'off', name: 'Off day' })
  })

  it('No Leave is not a holiday — the day flies', () => {
    setDayEvent('2026-05-05', 0, 'No Leave')
    expect(dayFacts('2026-05-05')).toMatchObject({ covered: true, kind: null, name: '' })
  })

  it('a working event is not a holiday', () => {
    setDayEvent('2026-05-06', 0, 'SC')
    expect(dayFacts('2026-05-06').kind).toBeNull()
  })

  it('a merged band covers every one of its dates', () => {
    expect(addEventBand(0, '2026-06-01', '2026-06-03', 'PH')).toBe('set')
    for (const d of ['2026-06-01', '2026-06-02', '2026-06-03']) expect(dayFacts(d)).toMatchObject({ kind: 'ph', name: 'PH' })
    expect(dayFacts('2026-06-04').kind).toBeNull()
  })

  it('a typed name with its own tag is that kind, whatever the word', () => {
    setDayEvent('2026-08-10', 0, 'National Day', 'off')
    expect(dayFacts('2026-08-10')).toMatchObject({ kind: 'ph', name: 'National Day' })
  })

  it('an untagged word takes its kind from the squadron’s own event types', () => {
    setDayEvent('2026-05-07', 0, 'ph')
    expect(dayFacts('2026-05-07')).toMatchObject({ kind: 'ph', name: 'ph' })
  })

  it('a public holiday on a declared Off day is a public holiday', () => {
    setDayEvent('2026-05-11', 0, 'Off day')
    setDayEvent('2026-05-11', 1, 'PH')
    expect(dayFacts('2026-05-11')).toMatchObject({ kind: 'ph', name: 'PH' })
  })

  it('a seeded holiday flag with no event on it still reads as a public holiday', () => {
    /* the seed's 1 Jan carries the flag AND the word; clear the word and the flag stands alone */
    setDayEvent('2026-01-01', 0, '')
    expect(getState().period.days[0]!.ph).toBe(true)
    expect(dayFacts('2026-01-01')).toMatchObject({ kind: 'ph', name: 'PH' })
  })

  it('a Saturday is a weekend and no holiday', () => {
    expect(dayFacts('2026-05-02')).toMatchObject({ covered: true, kind: null, weekend: true })
  })

  it('a date no leave period covers says so: no holiday, and nobody counted', () => {
    expect(dayFacts('2028-03-01')).toEqual({ covered: false, kind: null, name: '', short: '', weekend: false, availP: null, availW: null })
  })

  it('…and the same for a date BETWEEN two periods', () => {
    expect(createWar('2029', '2029-01-01', '2029-12-31')).toBe('created')
    expect(dayFacts('2028-06-03')).toMatchObject({ covered: false, availP: null, availW: null, weekend: true })
    expect(dayFacts('2029-06-04').covered).toBe(true)
  })

  it('a date in another period is read from THAT period, not the one on screen', () => {
    expect(getState().period.id).toBe('y2026')
    const f = dayFacts('2027-04-13')
    expect(f.covered).toBe(true)
    expect(f.availP).not.toBeNull()
  })

  it('something that is not a date is covered by nothing', () => {
    expect(dayFacts('2026-02-30')).toMatchObject({ covered: false, availP: null })
    expect(dayFacts('')).toMatchObject({ covered: false, availP: null })
  })
})

describe('who is available, per seat', () => {
  it('equals the war’s own count of pilots and of WSOs, date by date', () => {
    for (const d of ['2026-01-05', '2026-01-12', '2026-02-03', '2026-02-17', '2026-07-15', '2026-11-30']) {
      const f = dayFacts(d), s = seats(d)
      expect([d, f.availP, f.availW]).toEqual([d, s.p, s.w])
    }
  })

  it('a whole day of leave takes one man; a half day takes half', () => {
    const p = pilot()
    const before = dayFacts('2026-10-06').availP!
    fileAbsence(p.id, 'LL', '2026-10-06')
    expect(dayFacts('2026-10-06').availP).toBe(before - 1)
    const b2 = dayFacts('2026-10-07').availP!
    fileAbsence(p.id, '*LL', '2026-10-07')
    expect(dayFacts('2026-10-07').availP).toBe(b2 - 0.5)
  })

  it('a bid on the war takes him off the count as the grid does', () => {
    const p = pilot()
    const before = dayFacts('2026-03-03').availP!
    expect(setCell(p.id, '2026-03-03', 'LL')).toBe(true)
    expect(dayFacts('2026-03-03').availP).toBe(seats('2026-03-03').p)
    expect(dayFacts('2026-03-03').availP).toBe(before - 1)
  })

  it('a SANS man is never counted — whatever the row says it counts', () => {
    const base = dayFacts('2026-10-08')
    setPeople([...getState().people, sansMan('sansp', 'pilot'), sansMan('sansw', 'wso')])
    /* the war's own category counts DO see him (a shown SANS counts in manning by seat) … */
    expect(seats('2026-10-08').p).toBe(base.availP! + 1)
    /* … the two Available rows never do */
    expect(dayFacts('2026-10-08')).toMatchObject({ availP: base.availP, availW: base.availW })
    /* and re-defining the row to "everyone" does not let him in */
    expect(saveManningRule({ id: AVAIL_P, label: 'Avail P', count: { kind: 'people', filter: { seats: ['pilot'] } }, threshold: { amber: 0, red: 0 } })).toBe(true)
    expect(dayFacts('2026-10-08').availP).toBe(base.availP)
  })

  it('ground crew are never counted', () => {
    const base = dayFacts('2026-10-08').availP
    setPeople([...getState().people, { id: 'gnd1', callsign: 'GND1', seat: 'gnd', band: 'ops', sxo: false, from: null, to: null, pers: true } as Person])
    expect(dayFacts('2026-10-08').availP).toBe(base)
  })
})

describe('the two Available rows are ordinary count rows (D640)', () => {
  const noOcu: ManningRule = { id: AVAIL_P, label: 'Avail P (no OCU)', count: { kind: 'people', filter: { seats: ['pilot'], notCats: ['OCU'] } }, threshold: { amber: 0, red: 0 } }

  it('a store that holds neither uses the built-in ones', () => {
    expect(getState().requirements.default.rules.some(r => isAvailId(r.id))).toBe(false)
    expect(availRules()).toEqual({ p: builtinAvailRule(AVAIL_P), w: builtinAvailRule(AVAIL_W) })
    expect(availRules().p).toMatchObject({ label: 'Available P', count: { kind: 'people', filter: { seats: ['pilot'] } }, threshold: { amber: 0, red: 0 } })
    expect(availRules().w).toMatchObject({ label: 'Available W', count: { kind: 'people', filter: { seats: ['wso'] } } })
  })

  it('renamed and re-defined to leave out OCU, the calendars’ figure follows', () => {
    const ocu = { ...pilot(), id: 'ocu1', callsign: 'OCU1', q: 'OCU', band: 'ops' } as Person
    setPeople([...getState().people, ocu])
    const withOcu = dayFacts('2026-10-08').availP!
    expect(saveManningRule(noOcu)).toBe(true)
    expect(availRules().p.label).toBe('Avail P (no OCU)')
    expect(dayFacts('2026-10-08').availP).toBe(withOcu - 1)
    expect(dayFacts('2026-10-08').availW).toBe(seats('2026-10-08').w)
  })

  it('they are never drawn or judged with the Manning rows', () => {
    saveManningRule(noOcu)
    expect(getState().requirements.default.rules.some(r => r.id === AVAIL_P)).toBe(true)
    expect(manningRowIds()).not.toContain(AVAIL_P)
    expect(orderedManningIds()).not.toContain(AVAIL_P)
    const s = getState()
    const v = evaluateDay(s.people, s.grid, s.states, s.requirements, '2026-10-08', s.views)
    expect(v.results.some(r => isAvailId(r.ruleId))).toBe(false)
  })

  it('they carry no amber or red of their own: a saved threshold is held at 0', () => {
    expect(saveManningRule({ ...noOcu, threshold: { amber: 9, red: 7 } })).toBe(true)
    expect(availRules().p.threshold).toEqual({ amber: 0, red: 0 })
    expect(setManningThreshold(AVAIL_P, 5, 4)).toBe(false)
    expect(availRules().p.threshold).toEqual({ amber: 0, red: 0 })
  })

  it('a "teams" count is refused for them', () => {
    const team: ManningRule = { id: AVAIL_W, label: 'Avail W', count: { kind: 'team', slots: [{ count: 1, filter: { seats: ['wso'] } }] }, threshold: { amber: 0, red: 0 } }
    expect(saveManningRule(team)).toBe(false)
    expect(availRules().w).toEqual(builtinAvailRule(AVAIL_W))
  })

  it('a member cannot change them', () => {
    setRole('member')
    expect(saveManningRule(noOcu)).toBe(false)
    expect(availRules().p).toEqual(builtinAvailRule(AVAIL_P))
  })

  it('delete is refused, with the reason', () => {
    elevenCounters()   // an ordinary counter to set beside them — the app starts with none (D669)
    saveManningRule(noOcu)
    expect(manningDeleteProblem(AVAIL_P)).toBe(AVAIL_DELETE_MSG)
    expect(manningDeleteProblem(AVAIL_W)).toBe(AVAIL_DELETE_MSG)
    expect(manningDeleteProblem('ip')).toBeNull()
    expect(deleteManningRule(AVAIL_P)).toBe(false)
    expect(availRules().p.label).toBe('Avail P (no OCU)')
    /* an ordinary counter still deletes */
    expect(deleteManningRule('ip')).toBe(true)
  })

  /* ("Reset counters" put the built-in Available rows back too, and was tested here until D669, 8 Oct 26 — the button
     left with the built-in counters. An Available row he has changed goes back by Undo, or by changing it again.) */

  it('a re-defined row survives a reload', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    saveManningRule({ ...noOcu, threshold: { amber: 4, red: 2 } })
    initStore(backend)
    expect(availRules().p).toMatchObject({ label: 'Avail P (no OCU)', threshold: { amber: 0, red: 0 } })
    expect(availRules().p.count).toEqual(noOcu.count)
  })

  it('a stored row of the wrong shape is ignored at the read — the built-in one serves', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    elevenCounters()   // the squadron's own counters, which the damage must leave alone — the app starts with none (D669)
    saveManningRule(noOcu)
    /* damage the stored set by hand: a team count and a threshold under the linked id */
    const key = backend.keys().find(k => k.endsWith('manningdefs'))!
    const rules = JSON.parse(backend.read(key)!)
    const i = rules.findIndex((r: any) => r.id === AVAIL_P)
    rules[i] = { id: AVAIL_P, label: 'X', count: { kind: 'team', slots: [{ count: 1, filter: {} }] }, threshold: { amber: 3, red: 2 } }
    backend.write(key, JSON.stringify(rules))
    initStore(backend)
    expect(availRules().p).toEqual(builtinAvailRule(AVAIL_P))
    expect(getState().requirements.default.rules.some(r => r.id === 'ip')).toBe(true)
  })

  it('the squadron’s sixty counters do not crowd them out', () => {
    for (let i = 0; getState().requirements.default.rules.length < 60; i++) {
      expect(saveManningRule({ id: 'x' + i, label: 'X' + i, count: { kind: 'people', filter: {} }, threshold: { amber: 0, red: 0 } })).toBe(true)
    }
    expect(saveManningRule({ id: 'over', label: 'Over', count: { kind: 'people', filter: {} }, threshold: { amber: 0, red: 0 } })).toBe(false)
    expect(saveManningRule(noOcu)).toBe(true)
    expect(saveManningRule({ ...noOcu, id: AVAIL_W, label: 'Avail W', count: { kind: 'people', filter: { seats: ['wso'] } } })).toBe(true)
    expect(availRules().p.label).toBe('Avail P (no OCU)')
  })

  it('…and sixty counters plus the two still read back whole after a reload', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    for (let i = 0; getState().requirements.default.rules.length < 60; i++) {
      saveManningRule({ id: 'x' + i, label: 'X' + i, count: { kind: 'people', filter: {} }, threshold: { amber: 0, red: 0 } })
    }
    saveManningRule(noOcu)
    saveManningRule({ ...noOcu, id: AVAIL_W, label: 'Avail W', count: { kind: 'people', filter: { seats: ['wso'] } } })
    initStore(backend)
    expect(getState().requirements.default.rules.length).toBe(62)
    expect(manningRowIds().length).toBe(60)
    expect(availRules().p.label).toBe('Avail P (no OCU)')
  })
})

describe('the year’s public holidays and Off days, as one list', () => {
  const line = (from: string) => holidaysIn(2026).find(h => h.from === from)

  it('lists the seeded year in date order, each with its kind and name', () => {
    const list = holidaysIn(2026)
    expect(list.map(h => [h.from, h.to, h.kind, h.name])).toEqual([
      ['2026-01-01', '2026-01-01', 'ph', 'PH'],
      ['2026-02-17', '2026-02-18', 'ph', 'PH'],
      ['2026-08-09', '2026-08-09', 'ph', 'PH'],
      ['2026-12-25', '2026-12-25', 'ph', 'PH'],
    ])
    expect(list.every(h => h.warId === 'y2026')).toBe(true)
  })

  it('takes a year as a number or as text, and a year with nothing is an empty list', () => {
    expect(holidaysIn('2026').length).toBe(4)
    expect(holidaysIn(2027)).toEqual([])
    expect(holidaysIn(2031)).toEqual([])
  })

  it('an Off day is listed as one; No Leave and a working event are not', () => {
    setDayEvent('2026-05-04', 0, 'Off day')
    setDayEvent('2026-05-05', 0, 'No Leave')
    setDayEvent('2026-05-06', 0, 'SC')
    expect(line('2026-05-04')).toMatchObject({ kind: 'off', name: 'Off day', src: 'day', line: 0 })
    expect(line('2026-05-05')).toBeUndefined()
    expect(line('2026-05-06')).toBeUndefined()
  })

  it('the same word repeated over a run of days is ONE line', () => {
    setDayEventRange('2026-04-06', '2026-04-08', 1, 'Block leave', 'free')
    expect(line('2026-04-06')).toMatchObject({ to: '2026-04-08', kind: 'off', name: 'Block leave', src: 'day', line: 1 })
    expect(line('2026-04-07')).toBeUndefined()
  })

  it('two different holidays on neighbouring days stay two lines', () => {
    setDayEvent('2026-04-13', 0, 'Good Friday', 'off')
    setDayEvent('2026-04-14', 0, 'Easter', 'off')
    expect(line('2026-04-13')).toMatchObject({ to: '2026-04-13', name: 'Good Friday' })
    expect(line('2026-04-14')).toMatchObject({ to: '2026-04-14', name: 'Easter' })
  })

  it('a merged band is one line over its dates', () => {
    addEventBand(1, '2026-06-01', '2026-06-03', 'Mid-year break', 'free')
    expect(line('2026-06-01')).toMatchObject({ to: '2026-06-03', kind: 'off', name: 'Mid-year break', src: 'band', line: 1 })
  })

  it('a seeded holiday flag with no event shows as "PH"', () => {
    setDayEvent('2026-01-01', 0, '')
    expect(line('2026-01-01')).toMatchObject({ kind: 'ph', name: 'PH', src: 'flag', line: null })
  })

  it('a flagged day that also carries the word is listed once, by its event', () => {
    expect(holidaysIn(2026).filter(h => h.from === '2026-12-25')).toHaveLength(1)
    expect(line('2026-12-25')).toMatchObject({ src: 'day', line: 0 })
  })

  it('reads every period of the year, not only the one on screen', () => {
    selectWar('y2027')
    setDayEvent('2027-01-01', 0, 'PH')
    selectWar('y2026')
    expect(holidaysIn(2027).map(h => [h.from, h.kind, h.warId])).toEqual([['2027-01-01', 'ph', 'y2027']])
    expect(holidaysIn(2026).length).toBe(4)
  })

  it('every line has an id of its own', () => {
    setDayEvent('2026-05-04', 0, 'Off day')
    addEventBand(1, '2026-06-01', '2026-06-03', 'PH')
    const ids = holidaysIn(2026).map(h => h.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('hearing the war change', () => {
  const moved = (fn: () => void): boolean => { const v = warFactsVersion(); fn(); return warFactsVersion() !== v }

  it('the version stands still while nothing it reads has moved', () => {
    const v = warFactsVersion()
    expect(warFactsVersion()).toBe(v)
    dayFacts('2026-05-01'); holidaysIn(2026)
    expect(warFactsVersion()).toBe(v)
  })

  it('moves for a holiday typed, a band, and an event type re-kinded', () => {
    expect(moved(() => setDayEvent('2026-05-01', 0, 'PH'))).toBe(true)
    expect(moved(() => addEventBand(1, '2026-06-01', '2026-06-03', 'PH'))).toBe(true)
    setDayEvent('2026-05-05', 0, 'No Leave')
    expect(dayFacts('2026-05-05').kind).toBeNull()
    expect(moved(() => updateEventType(2, { kind: 'off' }))).toBe(true)
    expect(dayFacts('2026-05-05').kind).toBe('ph')
  })

  it('moves for a period made, a count row re-defined, the roster, a bid and an absence', () => {
    expect(moved(() => createWar('2029', '2029-01-01', '2029-12-31'))).toBe(true)
    expect(moved(() => saveManningRule({ id: AVAIL_P, label: 'P', count: { kind: 'people', filter: { seats: ['pilot'], notCats: ['OCU'] } }, threshold: { amber: 0, red: 0 } }))).toBe(true)
    expect(moved(() => setPeople([...getState().people, sansMan('sansp', 'pilot')]))).toBe(true)
    expect(moved(() => setCell(pilot().id, '2026-03-03', 'LL'))).toBe(true)
    expect(moved(() => fileAbsence(pilot().id, 'LL', '2026-10-06'))).toBe(true)
  })

  it('does NOT move for a look: the day in view, the viewer, the role', () => {
    expect(moved(() => focusDay('2026-07-01'))).toBe(false)
    expect(moved(() => setViewer(pilot().id))).toBe(false)
    expect(moved(() => setRole('member'))).toBe(false)
  })

  it('a reader that never asked before still gets the fresh answer after a change', () => {
    expect(dayFacts('2026-05-01').kind).toBeNull()
    setDayEvent('2026-05-01', 0, 'PH')
    expect(dayFacts('2026-05-01').kind).toBe('ph')
    setDayEvent('2026-05-01', 0, '')
    expect(dayFacts('2026-05-01').kind).toBeNull()
  })

  it('a subscriber is told once per change that matters, and not for a look', () => {
    let n = 0
    const off = subscribeWarFacts(() => { n++ })
    setDayEvent('2026-05-01', 0, 'PH')
    expect(n).toBe(1)
    focusDay('2026-07-01')
    expect(n).toBe(1)
    off()
    setDayEvent('2026-05-04', 0, 'PH')
    expect(n).toBe(1)
  })
})
