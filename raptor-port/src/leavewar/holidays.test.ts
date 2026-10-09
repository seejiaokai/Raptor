// @vitest-environment jsdom
/* THE HOLIDAYS LIST'S THREE WRITERS — add, change, remove (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4, §5 "The holiday list"; owner D631, D638).

   A public holiday and an Off day each have TWO DOORS onto ONE record (D638): the Leave War's Event row and the
   Holidays list in Days. The list is the war's own record seen as a list (sync.ts holidaysIn), and these three write
   that same record — a tagged day event for one day, a merged band for a run — into the leave period HOLDING the
   date, which need not be the one on screen. Each is ONE named command, so Undo says "a public holiday on 9 Aug" and
   never "the war's dates or name".

   Its own file: the wired sync leaves a live Raptor subscription behind. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { HOOKS } from '../engine/hooks'
import { initStore as raptorInitStore } from '../state/store'
import { setSession } from '../state/auth'
import { COMMAND_OPS, T } from '../state/perms'
import { commandStream } from '../command'
import { globalRedo, globalUndo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { projectPeople } from './state/raptorRoster'
import {
  addEventBand, addEventRow, getState, holidayAdd, holidayChange, holidayRemove, initStore as lwInitStore, lwHistInit,
  setDayEvent, setPeople, setRole,
} from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'
import { dayFacts, holidaysIn, wireLeaveWarSync, type HolidayLine } from './sync'

const toast = HOOKS.toast
let backend: StorageBackend
beforeEach(() => {
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  backend = memoryBackend()
  lwInitStore(backend)
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  setRole('admin')
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null) })

const war = (id: string) => getState().wars.find(w => w.period.id === id)!
const day = (iso: string) => war('y' + iso.slice(0, 4)).period.days.find(d => d.date === iso)!
const bands = (id = 'y2026') => war(id).period.bands
const line = (year: number, from: string): HolidayLine => holidaysIn(year).find(h => h.from === from)!
const one = (iso: string, kind: 'ph' | 'off' = 'ph', name = '') => ({ kind, name, from: iso, to: iso })

describe('add', () => {
  it('one day is a tagged event on that day, on the first Event row', () => {
    expect(holidayAdd(one('2026-05-01'))).toEqual({ ok: true })
    expect(day('2026-05-01').events[0]).toBe('PH')
    expect(day('2026-05-01').eventKinds?.[0]).toBe('off')
    expect(dayFacts('2026-05-01')).toMatchObject({ kind: 'ph', name: 'PH' })
    expect(line(2026, '2026-05-01')).toMatchObject({ to: '2026-05-01', kind: 'ph', name: 'PH', src: 'day', line: 0 })
  })

  it('a name of its own is kept, and the kind rides the event — the word need not be a known one', () => {
    expect(holidayAdd(one('2026-08-10', 'ph', '  National Day '))).toEqual({ ok: true })
    expect(day('2026-08-10').events[0]).toBe('National Day')
    expect(dayFacts('2026-08-10')).toMatchObject({ kind: 'ph', name: 'National Day' })
  })

  it('an Off day is one, named "Off day" unless he names it', () => {
    holidayAdd(one('2026-05-04', 'off'))
    expect(day('2026-05-04').events[0]).toBe('Off day')
    expect(day('2026-05-04').eventKinds?.[0]).toBe('free')
    expect(dayFacts('2026-05-04').kind).toBe('off')
  })

  it('a run of days is ONE merged band', () => {
    expect(holidayAdd({ kind: 'off', name: 'Block leave', from: '2026-06-01', to: '2026-06-05' }).ok).toBe(true)
    expect(bands()).toEqual([{ line: 0, from: '2026-06-01', to: '2026-06-05', text: 'Block leave', kind: 'free' }])
    expect(line(2026, '2026-06-01')).toMatchObject({ to: '2026-06-05', kind: 'off', name: 'Block leave', src: 'band' })
  })

  it('takes the first Event row free across the WHOLE range', () => {
    setDayEvent('2026-06-03', 0, 'SC')
    holidayAdd({ kind: 'ph', name: '', from: '2026-06-01', to: '2026-06-05' })
    expect(bands()[0]).toMatchObject({ line: 1, from: '2026-06-01', to: '2026-06-05' })
    expect(day('2026-06-03').events[0]).toBe('SC')
  })

  it('a band already on a row keeps that row taken', () => {
    addEventBand(0, '2026-06-01', '2026-06-10', 'Exercise')
    holidayAdd(one('2026-06-05'))
    expect(day('2026-06-05').events[1]).toBe('PH')
  })

  it('is refused, with nothing changed, when no Event row is free on those dates', () => {
    setDayEvent('2026-06-03', 0, 'SC')
    setDayEvent('2026-06-04', 1, 'Range closed')
    const before = JSON.stringify(war('y2026').period)
    const r = holidayAdd({ kind: 'ph', name: '', from: '2026-06-01', to: '2026-06-05' })
    expect(r).toMatchObject({ ok: false, reason: 'full' })
    expect((r as any).message).toMatch(/Event row/)
    expect(JSON.stringify(war('y2026').period)).toBe(before)
  })

  it('…and an added Event row is used', () => {
    setDayEvent('2026-06-03', 0, 'SC')
    setDayEvent('2026-06-03', 1, 'Range closed')
    expect(addEventRow()).toBe(true)
    expect(holidayAdd(one('2026-06-03')).ok).toBe(true)
    expect(day('2026-06-03').events[2]).toBe('PH')
  })

  it('is written to the period HOLDING the date, not the one on screen', () => {
    expect(getState().period.id).toBe('y2026')
    expect(holidayAdd(one('2027-08-09')).ok).toBe(true)
    expect(day('2027-08-09').events[0]).toBe('PH')
    expect(getState().period.id).toBe('y2026')
    expect(holidaysIn(2027).map(h => h.from)).toEqual(['2027-08-09'])
  })

  it('a run across two periods is refused', () => {
    const r = holidayAdd({ kind: 'off', name: '', from: '2026-12-30', to: '2027-01-02' })
    expect(r).toMatchObject({ ok: false, reason: 'crosses' })
    expect(bands('y2026')).toEqual([]); expect(bands('y2027')).toEqual([])
  })

  it('a date no period covers is refused, and says which', () => {
    const r = holidayAdd(one('2028-08-09'))
    expect(r).toMatchObject({ ok: false, reason: 'noperiod' })
    expect((r as any).message).toContain('9 Aug 28')
  })

  it('a member is refused', () => {
    setRole('member')
    expect(holidayAdd(one('2026-05-01'))).toMatchObject({ ok: false, reason: 'forbidden' })
    expect(day('2026-05-01').events[0]).toBe('')
  })

  it('what is not a holiday is refused: a bad date, a backwards run, a kind that is neither, a name too long', () => {
    expect(holidayAdd(one('2026-02-30'))).toMatchObject({ ok: false, reason: 'bad' })
    expect(holidayAdd({ kind: 'ph', name: '', from: '2026-05-05', to: '2026-05-01' })).toMatchObject({ ok: false, reason: 'bad' })
    expect(holidayAdd({ kind: 'nolv' as any, name: '', from: '2026-05-05', to: '2026-05-05' })).toMatchObject({ ok: false, reason: 'bad' })
    expect(holidayAdd(one('2026-05-01', 'ph', 'x'.repeat(41)))).toMatchObject({ ok: false, reason: 'bad' })
    expect(holidayAdd(null as any)).toMatchObject({ ok: false, reason: 'bad' })
    expect(holidaysIn(2026)).toHaveLength(4)
  })

  it('is ONE command of its own name, and one Undo step that says what it was', () => {
    holidayAdd(one('2026-08-10', 'ph', 'National Day'))
    expect(commandStream().at(-1)!.type).toBe('lw.holiday.add')
    expect(undoState().undoLabel).toContain('a public holiday on 10 Aug')
    expect(globalUndo().ok).toBe(true)
    expect(day('2026-08-10').events[0]).toBe('')
    expect(dayFacts('2026-08-10').kind).toBeNull()
    expect(globalRedo().ok).toBe(true)
    expect(dayFacts('2026-08-10')).toMatchObject({ kind: 'ph', name: 'National Day' })
  })

  it('…a run, and an Off day, in their own words', () => {
    holidayAdd({ kind: 'off', name: '', from: '2026-06-01', to: '2026-06-05' })
    expect(undoState().undoLabel).toContain('an Off day on 1–5 Jun')
    holidayAdd({ kind: 'ph', name: '', from: '2026-07-30', to: '2026-08-02' })
    expect(undoState().undoLabel).toContain('a public holiday on 30 Jul – 2 Aug')
  })

  it('survives a reload', () => {
    holidayAdd(one('2026-08-10', 'ph', 'National Day'))
    holidayAdd({ kind: 'off', name: 'Block leave', from: '2026-06-01', to: '2026-06-05' })
    lwInitStore(backend)
    expect(holidaysIn(2026).filter(h => h.from === '2026-08-10' || h.from === '2026-06-01').map(h => [h.name, h.kind, h.src]))
      .toEqual([['Block leave', 'off', 'band'], ['National Day', 'ph', 'day']])
  })
})

describe('remove', () => {
  it('a one-day holiday goes, and only it', () => {
    setDayEvent('2026-05-01', 1, 'SC')
    holidayAdd(one('2026-05-01'))
    expect(holidayRemove(line(2026, '2026-05-01'))).toEqual({ ok: true })
    expect(day('2026-05-01').events).toEqual(['', 'SC'])
    expect(day('2026-05-01').eventKinds?.[0] ?? null).toBeNull()
    expect(dayFacts('2026-05-01').kind).toBeNull()
  })

  it('a merged band goes whole', () => {
    holidayAdd({ kind: 'off', name: 'Block leave', from: '2026-06-01', to: '2026-06-05' })
    expect(holidayRemove(line(2026, '2026-06-01')).ok).toBe(true)
    expect(bands()).toEqual([])
  })

  it('the same word repeated over a run of days goes as the one line it is listed as', () => {
    /* the seed's 17 and 18 Feb: "PH" typed on each day */
    const h = line(2026, '2026-02-17')
    expect(h).toMatchObject({ to: '2026-02-18', src: 'day' })
    expect(holidayRemove(h).ok).toBe(true)
    expect(day('2026-02-17').events[0]).toBe(''); expect(day('2026-02-18').events[0]).toBe('')
  })

  it('a seeded holiday is gone for good — its word and the flag under it', () => {
    expect(holidayRemove(line(2026, '2026-12-25')).ok).toBe(true)
    expect(day('2026-12-25').ph).toBe(false)
    expect(dayFacts('2026-12-25').kind).toBeNull()
    expect(holidaysIn(2026).some(h => h.from === '2026-12-25')).toBe(false)
  })

  it('a holiday that is only the seeded flag can be removed too', () => {
    setDayEvent('2026-01-01', 0, '')
    const h = line(2026, '2026-01-01')
    expect(h.src).toBe('flag')
    expect(holidayRemove(h).ok).toBe(true)
    expect(day('2026-01-01').ph).toBe(false)
    expect(holidaysIn(2026).some(x => x.from === '2026-01-01')).toBe(false)
  })

  it('a line that has since changed on the Leave War is not touched: "no longer there"', () => {
    holidayAdd(one('2026-05-01'))
    const stale = line(2026, '2026-05-01')
    setDayEvent('2026-05-01', 0, 'SC')
    expect(holidayRemove(stale)).toMatchObject({ ok: false, reason: 'gone' })
    expect(day('2026-05-01').events[0]).toBe('SC')
  })
  /* SOL'S READ of the calendar job's bug check (8 Oct 26), S1. The match compared the row, the dates and the NAME - not
     the kind, and for a run of repeated days one surviving day was enough. A holiday form left open while its event
     was made a working event on the Leave War (same name, same date) could still delete it, or write the old holiday
     back over it. */
  it('the SAME name on the same date, made a working event on the Leave War since: the stale line is refused, Delete and Change alike', () => {
    holidayAdd(one('2026-05-04', 'ph', 'National Day'))
    const stale = line(2026, '2026-05-04')
    setDayEvent('2026-05-04', stale.line!, 'National Day', 'work')
    expect(holidayRemove(stale)).toMatchObject({ ok: false, reason: 'gone' })
    expect(day('2026-05-04').events[stale.line!], 'the working event is still there').toBe('National Day')
    expect(holidayChange(stale, { ...one('2026-05-04', 'ph', 'National Day'), short: 'XX' })).toMatchObject({ ok: false, reason: 'gone' })
    expect(day('2026-05-04').eventKinds?.[stale.line!]).toBe('work')
  })
  it('a run of repeated days, ONE of them changed since: the whole stale line is refused and nothing is taken away', () => {
    for (const d of ['2026-05-11', '2026-05-12', '2026-05-13']) setDayEvent(d, 0, 'PH')
    const stale = line(2026, '2026-05-11')
    expect(stale.to, 'read as one run').toBe('2026-05-13')
    setDayEvent('2026-05-12', 0, 'SC')
    expect(holidayRemove(stale)).toMatchObject({ ok: false, reason: 'gone' })
    expect([day('2026-05-11').events[0], day('2026-05-12').events[0], day('2026-05-13').events[0]]).toEqual(['PH', 'SC', 'PH'])
  })

  it('a member is refused', () => {
    holidayAdd(one('2026-05-01'))
    const h = line(2026, '2026-05-01')
    setRole('member')
    expect(holidayRemove(h)).toMatchObject({ ok: false, reason: 'forbidden' })
    expect(day('2026-05-01').events[0]).toBe('PH')
  })

  it('in a period that is not on screen', () => {
    holidayAdd(one('2027-08-09'))
    expect(holidayRemove(line(2027, '2027-08-09')).ok).toBe(true)
    expect(day('2027-08-09').events[0]).toBe('')
    expect(getState().period.id).toBe('y2026')
  })

  it('is one command of its own name and one Undo step, in words', () => {
    holidayAdd(one('2026-08-10', 'ph', 'National Day'))
    holidayRemove(line(2026, '2026-08-10'))
    expect(commandStream().at(-1)!.type).toBe('lw.holiday.remove')
    expect(undoState().undoLabel).toContain('removing the public holiday on 10 Aug')
    expect(globalUndo().ok).toBe(true)
    expect(dayFacts('2026-08-10')).toMatchObject({ kind: 'ph', name: 'National Day' })
  })

  it('an Undo of a seeded holiday’s removal brings back the word and the flag', () => {
    holidayRemove(line(2026, '2026-12-25'))
    expect(globalUndo().ok).toBe(true)
    expect(day('2026-12-25').ph).toBe(true)
    expect(day('2026-12-25').events[0]).toBe('PH')
  })
})

describe('change', () => {
  it('a new name', () => {
    holidayAdd(one('2026-09-10'))
    expect(holidayChange(line(2026, '2026-09-10'), one('2026-09-10', 'ph', 'National Day'))).toEqual({ ok: true })
    expect(day('2026-09-10').events[0]).toBe('National Day')
    expect(holidaysIn(2026).filter(h => h.from === '2026-09-10')).toHaveLength(1)
  })

  it('a public holiday made an Off day', () => {
    holidayAdd(one('2026-09-10'))
    holidayChange(line(2026, '2026-09-10'), one('2026-09-10', 'off', 'Stand-down'))
    expect(dayFacts('2026-09-10')).toMatchObject({ kind: 'off', name: 'Stand-down' })
  })

  it('a holiday added beside one of the same name reads — and is changed — as the one run it now is', () => {
    /* the seed's 9 Aug is "PH"; another "PH" on the 10th makes the list's line 9–10 Aug */
    holidayAdd(one('2026-08-10'))
    expect(line(2026, '2026-08-09')).toMatchObject({ to: '2026-08-10', src: 'day' })
    expect(holidaysIn(2026).some(h => h.from === '2026-08-10')).toBe(false)
    expect(holidayChange(line(2026, '2026-08-09'), { kind: 'ph', name: 'National Day', from: '2026-08-09', to: '2026-08-10' }).ok).toBe(true)
    expect(bands()).toEqual([{ line: 0, from: '2026-08-09', to: '2026-08-10', text: 'National Day', kind: 'off' }])
    expect(day('2026-08-09').events[0]).toBe(''); expect(day('2026-08-10').events[0]).toBe('')
    expect(holidaysIn(2026).filter(h => h.from === '2026-08-09').map(h => [h.to, h.name, h.src])).toEqual([['2026-08-10', 'National Day', 'band']])
  })

  it('one day stretched to a run becomes a band; a run cut to a day becomes that day’s event', () => {
    holidayAdd(one('2026-06-01', 'off', 'Block leave'))
    holidayChange(line(2026, '2026-06-01'), { kind: 'off', name: 'Block leave', from: '2026-06-01', to: '2026-06-03' })
    expect(bands()).toEqual([{ line: 0, from: '2026-06-01', to: '2026-06-03', text: 'Block leave', kind: 'free' }])
    expect(day('2026-06-01').events[0]).toBe('')
    holidayChange(line(2026, '2026-06-01'), one('2026-06-02', 'off', 'Block leave'))
    expect(bands()).toEqual([])
    expect(day('2026-06-02').events[0]).toBe('Block leave')
    expect(holidaysIn(2026).filter(h => h.name === 'Block leave')).toHaveLength(1)
  })

  it('moved to other dates, the old ones are cleared', () => {
    holidayAdd(one('2026-09-10'))
    holidayChange(line(2026, '2026-09-10'), one('2026-09-11'))
    expect(day('2026-09-10').events[0]).toBe('')
    expect(day('2026-09-11').events[0]).toBe('PH')
  })

  it('its own days count as free: a run moved by a day stays on its row', () => {
    setDayEvent('2026-06-02', 1, 'SC')
    holidayAdd({ kind: 'off', name: 'Block leave', from: '2026-06-01', to: '2026-06-03' })
    expect(holidayChange(line(2026, '2026-06-01'), { kind: 'off', name: 'Block leave', from: '2026-06-02', to: '2026-06-04' }).ok).toBe(true)
    expect(bands()).toEqual([{ line: 0, from: '2026-06-02', to: '2026-06-04', text: 'Block leave', kind: 'free' }])
  })

  it('is checked BEFORE the old one is taken away: refused, the holiday stays exactly as it was', () => {
    holidayAdd(one('2026-06-01', 'off', 'Block leave'))
    setDayEvent('2026-06-03', 0, 'SC')
    setDayEvent('2026-06-03', 1, 'Range closed')
    const before = JSON.stringify(war('y2026').period)
    expect(holidayChange(line(2026, '2026-06-01'), { kind: 'off', name: 'Block leave', from: '2026-06-01', to: '2026-06-04' })).toMatchObject({ ok: false, reason: 'full' })
    expect(JSON.stringify(war('y2026').period)).toBe(before)
    expect(holidayChange(line(2026, '2026-06-01'), one('2028-06-01', 'off'))).toMatchObject({ ok: false, reason: 'noperiod' })
    expect(holidayChange(line(2026, '2026-06-01'), { kind: 'off', name: '', from: '2026-12-30', to: '2027-01-02' })).toMatchObject({ ok: false, reason: 'crosses' })
    expect(JSON.stringify(war('y2026').period)).toBe(before)
  })

  it('a seeded holiday re-named keeps one line and loses the bare flag', () => {
    holidayChange(line(2026, '2026-12-25'), one('2026-12-25', 'ph', 'Christmas Day'))
    expect(holidaysIn(2026).filter(h => h.from === '2026-12-25').map(h => [h.name, h.src])).toEqual([['Christmas Day', 'day']])
    expect(day('2026-12-25').ph).toBe(false)
    expect(dayFacts('2026-12-25')).toMatchObject({ kind: 'ph', name: 'Christmas Day' })
  })

  it('moved into another period: gone from one, in the other, as one step', () => {
    holidayAdd(one('2026-08-10', 'ph', 'National Day'))
    expect(holidayChange(line(2026, '2026-08-10'), one('2027-08-09', 'ph', 'National Day')).ok).toBe(true)
    expect(day('2026-08-10').events[0]).toBe('')
    expect(day('2027-08-09').events[0]).toBe('National Day')
    expect(globalUndo().ok).toBe(true)
    expect(day('2026-08-10').events[0]).toBe('National Day')
    expect(day('2027-08-09').events[0]).toBe('')
  })

  it('a line that is no longer there is refused; a member is refused', () => {
    holidayAdd(one('2026-05-01'))
    const stale = line(2026, '2026-05-01')
    setDayEvent('2026-05-01', 0, '')
    expect(holidayChange(stale, one('2026-05-02'))).toMatchObject({ ok: false, reason: 'gone' })
    expect(day('2026-05-02').events[0]).toBe('')
    holidayAdd(one('2026-05-01'))
    setRole('member')
    expect(holidayChange(line(2026, '2026-05-01'), one('2026-05-02'))).toMatchObject({ ok: false, reason: 'forbidden' })
  })

  it('is one command of its own name and ONE Undo step, in words', () => {
    holidayAdd(one('2026-09-10'))
    holidayChange(line(2026, '2026-09-10'), { kind: 'ph', name: 'National Day', from: '2026-09-10', to: '2026-09-11' })
    expect(commandStream().at(-1)!.type).toBe('lw.holiday.change')
    expect(undoState().undoLabel).toContain('a change to the public holiday on 10–11 Sep')
    expect(globalUndo().ok).toBe(true)
    expect(bands()).toEqual([])
    expect(day('2026-09-10').events[0]).toBe('PH')
    expect(holidaysIn(2026).filter(h => h.from === '2026-09-10')).toHaveLength(1)
  })
})

describe('the three are an admin’s, by the one permissions list', () => {
  it('each has its row: the leave period’s, an admin’s to change', () => {
    for (const t of ['lw.holiday.add', 'lw.holiday.change', 'lw.holiday.remove'])
      expect(COMMAND_OPS[t], t).toMatchObject({ table: T.war, act: 'U', own: 'never' })
  })
})
