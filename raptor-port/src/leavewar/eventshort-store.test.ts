// @vitest-environment jsdom
/* AN EVENT'S SHORT FORM THROUGH EVERY WRITER (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.12; owner D643, D644, D645, D652).

   Text, kind and short form travel TOGETHER through every writer that makes or re-makes an event (both readers'
   finding C): a day's event, a repeated range, a merged band, a move of either, a band replaced, a replacement refused
   and restored, a delete, and the Holidays list's writers. The Event sheet's Save is ONE command now (`saveEvent`):
   checked whole BEFORE the band it replaces is taken away, and one Undo step whose words say what was saved.
   A deliberately non-derived short form — "NAT" for National Day, where the name alone would give "ND" — is what
   proves a writer carried it rather than re-made it.

   Its own file: the wired sync leaves a live Raptor subscription behind. Dates keep clear of the demo year's seeded
   holidays (1 Jan, 17–18 Feb, 9 Aug, 25 Dec 26). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { HOOKS } from '../engine/hooks'
import { initStore as raptorInitStore } from '../state/store'
import { setSession } from '../state/auth'
import { COMMAND_OPS, T } from '../state/perms'
import { globalRedo, globalUndo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { projectPeople } from './state/raptorRoster'
import { dayEventShort, shortOf, SHORT_RULE } from './engine'
import {
  addEventBand, addEventRow, addEventType, deleteEvent, getState, holidayAdd, holidayChange, initStore as lwInitStore,
  lwHistInit, moveEvent, resetEventTypes, saveEvent, setDayEvent, setDayEventRange, setPeople, setRole, updateEventType,
} from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'
import { dayFacts, holidaysIn, wireLeaveWarSync } from './sync'

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

const period = () => getState().wars.find(w => w.period.id === 'y2026')!.period
const day = (iso: string) => period().days.find(d => d.date === iso)!
const bands = () => period().bands
/* what one Event line holds on a day: its text, its own kind and its own short form */
const ev = (iso: string, line = 0) => [day(iso).events[line] ?? '', day(iso).eventKinds?.[line] ?? null, dayEventShort(day(iso), line)]
/* what the grid prints there */
const prints = (iso: string, line = 0) => {
  const b = bands().find(x => x.line === line && x.from <= iso && iso <= x.to)
  return b ? shortOf(getState().eventDefs, b.text, b.short) : shortOf(getState().eventDefs, day(iso).events[line] ?? '', dayEventShort(day(iso), line))
}
const D = '2026-05-12'

describe('the plain writers carry it', () => {
  it('a day’s event: text, kind and short form in one write', () => {
    expect(setDayEvent(D, 0, 'National Day', 'off', 'nat')).toBe(true)
    expect(ev(D)).toEqual(['National Day', 'off', 'NAT'])
    expect(prints(D)).toBe('NAT')
  })
  it('a short form that breaks the rule is refused, nothing written', () => {
    expect(setDayEvent(D, 0, 'National Day', 'off', 'NATL')).toBe(false)
    expect(setDayEvent(D, 0, 'National Day', 'off', 'N D')).toBe(false)
    expect(ev(D)).toEqual(['', null, null])
  })
  it('written with none, it prints the preset’s or the derived one', () => {
    setDayEvent(D, 0, 'National Day', 'off')
    expect(ev(D)).toEqual(['National Day', 'off', null])
    expect(prints(D)).toBe('ND')
    setDayEvent('2026-05-13', 0, 'Off day')
    expect(prints('2026-05-13')).toBe('OFF')
  })
  it('a member writes none', () => {
    setRole('member')
    expect(setDayEvent(D, 0, 'National Day', 'off', 'NAT')).toBe(false)
    expect(ev(D)).toEqual(['', null, null])
  })
  it('a repeated range: on every day of it', () => {
    expect(setDayEventRange('2026-05-12', '2026-05-14', 1, 'Exercise', 'work', 'ex2')).toBe(true)
    for (const iso of ['2026-05-12', '2026-05-13', '2026-05-14']) expect(ev(iso, 1)).toEqual(['Exercise', 'work', 'EX2'])
    expect(setDayEventRange('2026-05-12', '2026-05-14', 1, 'Exercise', 'work', 'EXER')).toBe(false)
  })
  it('a merged band: on the band', () => {
    expect(addEventBand(0, '2026-05-12', '2026-05-15', 'National Day', 'off', 'nat')).toBe('set')
    expect(bands()).toEqual([{ line: 0, from: '2026-05-12', to: '2026-05-15', text: 'National Day', kind: 'off', short: 'NAT' }])
    expect(addEventBand(1, '2026-05-12', '2026-05-15', 'Exercise', 'work', 'E X')).toBe('badshort')
    expect(bands()).toHaveLength(1)
  })
  it('a band with none is stored exactly as before', () => {
    addEventBand(0, '2026-05-12', '2026-05-15', 'Exercise', 'work')
    expect(bands()).toEqual([{ line: 0, from: '2026-05-12', to: '2026-05-15', text: 'Exercise', kind: 'work' }])
  })
})

describe('a move carries it', () => {
  it('a day’s event', () => {
    setDayEvent(D, 0, 'National Day', 'off', 'NAT')
    expect(moveEvent(0, D, D, 3)).toBe('moved')
    expect(ev(D)).toEqual(['', null, null])
    expect(ev('2026-05-15')).toEqual(['National Day', 'off', 'NAT'])
  })
  it('a merged band', () => {
    addEventBand(0, '2026-05-12', '2026-05-13', 'National Day', 'off', 'NAT')
    expect(moveEvent(0, '2026-05-12', '2026-05-13', 7)).toBe('moved')
    expect(bands()).toEqual([{ line: 0, from: '2026-05-19', to: '2026-05-20', text: 'National Day', kind: 'off', short: 'NAT' }])
  })
  it('on an added Event row too', () => {
    expect(addEventRow()).toBe(true)
    setDayEvent(D, 2, 'National Day', 'off', 'NAT')
    moveEvent(2, D, D, 1)
    expect(ev('2026-05-13', 2)).toEqual(['National Day', 'off', 'NAT'])
    addEventBand(2, '2026-06-01', '2026-06-02', 'Stand down', 'free', 'SD1')
    moveEvent(2, '2026-06-01', '2026-06-02', 2)
    expect(bands().find(b => b.line === 2)).toMatchObject({ from: '2026-06-03', short: 'SD1' })
  })
  it('Undo and Redo of a move keep it', () => {
    setDayEvent(D, 0, 'National Day', 'off', 'NAT')
    moveEvent(0, D, D, 3)
    globalUndo()
    expect(ev(D)).toEqual(['National Day', 'off', 'NAT'])
    globalRedo()
    expect(ev('2026-05-15')).toEqual(['National Day', 'off', 'NAT'])
  })
})

describe('the Event sheet’s Save is one command', () => {
  const save = (over: Partial<Parameters<typeof saveEvent>[0]> = {}) =>
    saveEvent({ line: 0, date: D, scope: 'day', text: 'National Day', kind: 'off', short: 'NAT', ...over })

  it('this day', () => {
    expect(save()).toEqual({ ok: true })
    expect(ev(D)).toEqual(['National Day', 'off', 'NAT'])
  })
  it('a range repeated each day', () => {
    expect(save({ scope: 'repeat', from: '2026-05-12', to: '2026-05-14' })).toEqual({ ok: true })
    for (const iso of ['2026-05-12', '2026-05-13', '2026-05-14']) expect(ev(iso)).toEqual(['National Day', 'off', 'NAT'])
  })
  it('a range as one merged bar', () => {
    expect(save({ scope: 'merge', from: '2026-05-12', to: '2026-05-14' })).toEqual({ ok: true })
    expect(bands()).toEqual([{ line: 0, from: '2026-05-12', to: '2026-05-14', text: 'National Day', kind: 'off', short: 'NAT' }])
  })
  it('is ONE Undo step, and its words say what was saved', () => {
    save({ scope: 'merge', from: '2026-05-12', to: '2026-05-14' })
    expect(undoState().undoLabel).toContain('the event “National Day” on 12–14 May')
    globalUndo()
    expect(bands()).toEqual([])
    globalRedo()
    expect(bands()).toEqual([{ line: 0, from: '2026-05-12', to: '2026-05-14', text: 'National Day', kind: 'off', short: 'NAT' }])
  })
  it('a band replaced: the old one goes and the new one lands in ONE step', () => {
    save({ scope: 'merge', from: '2026-05-12', to: '2026-05-14' })
    expect(save({ scope: 'merge', from: '2026-05-13', to: '2026-05-20', text: 'Exercise', kind: 'work', short: 'EX2' })).toEqual({ ok: true })
    expect(bands()).toEqual([{ line: 0, from: '2026-05-13', to: '2026-05-20', text: 'Exercise', kind: 'work', short: 'EX2' }])
    /* ONE Undo puts the old band back whole — had the removal and the new band been two steps, it would leave none */
    globalUndo()
    expect(bands()).toEqual([{ line: 0, from: '2026-05-12', to: '2026-05-14', text: 'National Day', kind: 'off', short: 'NAT' }])
    globalUndo()
    expect(bands()).toEqual([])
  })
  it('a replacement REFUSED leaves the band it would have replaced exactly as it was — short form and all', () => {
    save({ scope: 'merge', from: '2026-05-12', to: '2026-05-14' })
    addEventBand(0, '2026-05-18', '2026-05-20', 'Exercise', 'work', 'EX2')
    const was = bands(), step = undoState().undoLabel
    const r = save({ scope: 'merge', from: '2026-05-12', to: '2026-05-19', text: 'Longer' })
    expect(r).toMatchObject({ ok: false, reason: 'overlap' })
    expect(bands()).toEqual(was)
    /* and it left no Undo step of its own behind */
    expect(undoState().undoLabel).toBe(step)
    expect(save({ scope: 'merge', from: '2026-05-12', to: '2027-01-02' })).toMatchObject({ ok: false, reason: 'outside' })
    expect(save({ scope: 'merge', from: '2026-05-14', to: '2026-05-12' })).toMatchObject({ ok: false, reason: 'backwards' })
    expect(bands()).toEqual(was)
  })
  it('a band turned back into one day’s event', () => {
    save({ scope: 'merge', from: '2026-05-12', to: '2026-05-14' })
    expect(save({ scope: 'day', date: '2026-05-13' })).toEqual({ ok: true })
    expect(bands()).toEqual([])
    expect(ev('2026-05-13')).toEqual(['National Day', 'off', 'NAT'])
    expect(ev('2026-05-12')).toEqual(['', null, null])
  })
  it('a merged bar clears the single words under it, short forms with them', () => {
    setDayEvent('2026-05-13', 0, 'Visit', 'work', 'VIS')
    save({ scope: 'merge', from: '2026-05-12', to: '2026-05-14' })
    expect(ev('2026-05-13')).toEqual(['', null, null])
  })
  it('refuses a short form that breaks the rule, with the sentence', () => {
    expect(save({ short: 'NATL' })).toEqual({ ok: false, reason: 'short', message: SHORT_RULE })
    expect(save({ short: 'N D' })).toMatchObject({ ok: false, reason: 'short' })
    expect(ev(D)).toEqual(['', null, null])
  })
  it('an empty short form is "none typed": the preset’s or the derived one prints', () => {
    expect(save({ short: '' })).toEqual({ ok: true })
    expect(ev(D)).toEqual(['National Day', 'off', null])
    expect(prints(D)).toBe('ND')
  })
  it('a NEW event whose name holds no letter or digit needs one typed', () => {
    expect(save({ text: '!!!', short: '' })).toMatchObject({ ok: false, reason: 'noshort' })
    expect(save({ text: '!!!', short: 'x' })).toEqual({ ok: true })
    expect(prints(D)).toBe('X')
  })
  it('an OLD one is left alone: saved again unchanged, it keeps its name and kind and prints a dot', () => {
    setDayEvent(D, 0, '!!!', 'work')
    expect(save({ text: '!!!', kind: 'work', short: '' })).toEqual({ ok: true })
    expect(ev(D)).toEqual(['!!!', 'work', null])
    expect(prints(D)).toBe('•')
  })
  it('a merged bar needs a name; a member saves nothing', () => {
    expect(save({ scope: 'merge', from: '2026-05-12', to: '2026-05-14', text: '  ' })).toMatchObject({ ok: false, reason: 'label' })
    setRole('member')
    expect(save()).toMatchObject({ ok: false, reason: 'forbidden' })
    expect(ev(D)).toEqual(['', null, null])
  })
  it('an untagged "PH" stays a public holiday by its name — "no tag" is not "no kind"', () => {
    expect(save({ text: 'PH', kind: null, short: '' })).toEqual({ ok: true })
    expect(ev(D)).toEqual(['PH', null, null])
    expect(dayFacts(D)).toMatchObject({ kind: 'ph', name: 'PH', short: 'PH' })
  })
})

describe('Delete takes all three', () => {
  it('a day’s event, one Undo step that brings all three back', () => {
    setDayEvent(D, 0, 'National Day', 'off', 'NAT')
    expect(deleteEvent(0, D)).toBe(true)
    expect(ev(D)).toEqual(['', null, null])
    expect(undoState().undoLabel).toContain('removing the event “National Day” on 12 May')
    globalUndo()
    expect(ev(D)).toEqual(['National Day', 'off', 'NAT'])
  })
  it('a merged band', () => {
    addEventBand(0, '2026-05-12', '2026-05-14', 'National Day', 'off', 'NAT')
    expect(deleteEvent(0, '2026-05-13')).toBe(true)
    expect(bands()).toEqual([])
    globalUndo()
    expect(bands()[0]).toMatchObject({ text: 'National Day', short: 'NAT' })
  })
  it('nothing there, or a member: nothing happens', () => {
    expect(deleteEvent(0, D)).toBe(false)
    setDayEvent(D, 0, 'National Day', 'off', 'NAT')
    setRole('member')
    expect(deleteEvent(0, D)).toBe(false)
    expect(ev(D)).toEqual(['National Day', 'off', 'NAT'])
  })
})

describe('a reload keeps it', () => {
  it('a day’s, a band’s and a preset’s', () => {
    setDayEvent(D, 0, 'National Day', 'off', 'NAT')
    addEventBand(1, '2026-06-01', '2026-06-03', 'Exercise', 'work', 'EX2')
    expect(updateEventType(0, { short: 'HOL' })).toBeNull()
    lwInitStore(backend)
    expect(ev(D)).toEqual(['National Day', 'off', 'NAT'])
    expect(bands().find(b => b.line === 1)).toEqual({ line: 1, from: '2026-06-01', to: '2026-06-03', text: 'Exercise', kind: 'work', short: 'EX2' })
    expect(getState().eventDefs[0]).toEqual({ name: 'PH', kind: 'off', short: 'HOL' })
  })
  it('then Undo, Redo and a second reload', () => {
    saveEvent({ line: 0, date: D, scope: 'day', text: 'National Day', kind: 'off', short: 'NAT' })
    globalUndo()
    expect(ev(D)).toEqual(['', null, null])
    globalRedo()
    lwInitStore(backend)
    expect(ev(D)).toEqual(['National Day', 'off', 'NAT'])
  })
})

describe('the presets’ own short forms, through the store', () => {
  it('added with one, changed, kept through a rename and a change of kind, and reset to the standard', () => {
    expect(addEventType('National Day', 'off', 'nat')).toBeNull()
    expect(getState().eventDefs.at(-1)).toEqual({ name: 'National Day', kind: 'off', short: 'NAT' })
    const i = getState().eventDefs.length - 1
    expect(updateEventType(i, { name: 'Natl Day' })).toBeNull()
    expect(updateEventType(i, { kind: 'free' })).toBeNull()
    expect(getState().eventDefs[i]).toEqual({ name: 'Natl Day', kind: 'free', short: 'NAT' })
    expect(updateEventType(i, { short: 'TOOLONG' })).toBe(SHORT_RULE)
    expect(updateEventType(0, { short: 'hol' })).toBeNull()
    resetEventTypes()
    expect(getState().eventDefs.map(d => d.short)).toEqual(['PH', 'OFF', 'NL', 'SC'])
  })
  it('an event with no short form of its own follows its preset’s', () => {
    setDayEvent(D, 0, 'PH')
    expect(prints(D)).toBe('PH')
    updateEventType(0, { short: 'HOL' })
    expect(prints(D)).toBe('HOL')
    expect(dayFacts(D).short).toBe('HOL')
  })
})

describe('the Holidays list and the calendars read the same name and short form (D652)', () => {
  it('a holiday added with a short form of its own carries it — one day and a run', () => {
    expect(holidayAdd({ kind: 'ph', name: 'National Day', short: 'nat', from: D, to: D })).toEqual({ ok: true })
    expect(ev(D)).toEqual(['National Day', 'off', 'NAT'])
    expect(dayFacts(D)).toMatchObject({ kind: 'ph', name: 'National Day', short: 'NAT' })
    expect(holidayAdd({ kind: 'off', name: 'Block leave', short: 'BL', from: '2026-06-01', to: '2026-06-05' }).ok).toBe(true)
    expect(bands()).toEqual([{ line: 0, from: '2026-06-01', to: '2026-06-05', text: 'Block leave', kind: 'free', short: 'BL' }])
    expect(dayFacts('2026-06-03')).toMatchObject({ kind: 'off', name: 'Block leave', short: 'BL' })
    expect(holidaysIn(2026).filter(h => h.from === D || h.from === '2026-06-01').map(h => [h.name, h.short]))
      .toEqual([['National Day', 'NAT'], ['Block leave', 'BL']])
  })
  it('added with none, it shows the preset’s or the derived one — and stores none', () => {
    holidayAdd({ kind: 'ph', name: '', from: D, to: D })
    expect(ev(D)).toEqual(['PH', 'off', null])
    expect(dayFacts(D).short).toBe('PH')
    holidayAdd({ kind: 'ph', name: 'Labour Day', from: '2026-05-14', to: '2026-05-14' })
    expect(dayFacts('2026-05-14').short).toBe('LD')
    expect(holidaysIn(2026).find(h => h.from === '2026-05-14')!.short).toBe('LD')
  })
  it('a short form that breaks the rule is refused with the sentence, nothing written', () => {
    expect(holidayAdd({ kind: 'ph', name: 'National Day', short: 'NATL', from: D, to: D })).toEqual({ ok: false, reason: 'bad', message: SHORT_RULE })
    expect(ev(D)).toEqual(['', null, null])
  })
  it('a change that names one writes it; one that names none keeps it while the name stands', () => {
    holidayAdd({ kind: 'ph', name: 'National Day', short: 'NAT', from: D, to: D })
    const line = () => holidaysIn(2026).find(h => h.name === 'National Day' || h.name === 'Labour Day')!
    expect(holidayChange(line(), { kind: 'ph', name: 'National Day', from: '2026-05-13', to: '2026-05-13' }).ok).toBe(true)
    expect(ev('2026-05-13')).toEqual(['National Day', 'off', 'NAT'])
    expect(holidayChange(line(), { kind: 'ph', name: 'National Day', short: 'N8', from: '2026-05-13', to: '2026-05-13' }).ok).toBe(true)
    expect(dayFacts('2026-05-13').short).toBe('N8')
    /* a new name with none named: the old short form does not stay behind to mis-name it */
    expect(holidayChange(line(), { kind: 'ph', name: 'Labour Day', from: '2026-05-13', to: '2026-05-13' }).ok).toBe(true)
    expect(ev('2026-05-13')).toEqual(['Labour Day', 'off', null])
    expect(dayFacts('2026-05-13').short).toBe('LD')
  })
  it('the seeded holiday flag alone is "PH"; a day that is no holiday has none', () => {
    expect(dayFacts('2026-12-25')).toMatchObject({ kind: 'ph', short: 'PH' })
    expect(dayFacts(D)).toMatchObject({ kind: null, name: '', short: '' })
    expect(dayFacts('1999-01-01').short).toBe('')
  })
  it('No Leave is not a holiday, whatever it prints', () => {
    setDayEvent(D, 0, 'No Leave')
    expect(prints(D)).toBe('NL')
    expect(dayFacts(D)).toMatchObject({ kind: null, short: '' })
  })
})

describe('permissions: the two new commands are the leave period’s own record, an admin’s to change', () => {
  it('both are in the one list every gate asks', () => {
    expect(COMMAND_OPS['lw.event.save']).toMatchObject({ table: T.war, act: 'U' })
    expect(COMMAND_OPS['lw.event.remove']).toMatchObject({ table: T.war, act: 'U' })
  })
})
