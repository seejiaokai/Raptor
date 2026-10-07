// @vitest-environment jsdom
/* THE FLYING PLAN'S STORE — its rows, its typed admin commands, Undo and what a reload reads back (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.2, §5 "The store"). The resolver itself is pinned
   by flyplan-model.suite.ts. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { setSession, setEffectiveRole } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo, globalRedo, undoState } from '../undo'
import { initStore } from './store'
import { commandStream, setConflictChecker } from '../command'
import { SETTINGS_ROW_PREFIXES, SETTINGS_KEYS } from './people-settings-commit'
import { COMMAND_OPS } from './perms'
import {
  getFlyPlan, getTones, getFlyNames, setFlyDays, setFlyRule, removeFlyRule, setFlyRun, dropFlyRun, saveTones, saveFlyNames,
  flyplanLoad, FLY_NAME_DEFAULTS,
} from './flyplan'
import { planFor } from './flyplan-model'

const mem = new Map<string, string>()
const backend = () => ({ getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] })
beforeEach(() => {
  mem.clear()
  storeBackend.impl = backend()
  initStore()
  setSession({ user: 'admin-test', role: 'admin' })
  _resetTimeline(); installGlobalUndo()
})
afterEach(() => { setConflictChecker(null); setSession(null); storeBackend.impl = null; _resetTimeline(); vi.restoreAllMocks() })

const facts = { covered: true, kind: null, availP: 0, availW: 0 } as const
const req = (iso: string) => planFor(iso, getFlyPlan(), facts, { p: 0, w: 0 }).req
const cls = (iso: string) => planFor(iso, getFlyPlan(), facts, { p: 0, w: 0 }).cls
const MON = '2026-01-12', THU = '2026-01-15'

describe('the flying plan is three kinds of settings row, each written by its own admin command', () => {
  it('is registered where every guard reads it: the row kinds, the permission list, the key for the rows\' names', () => {
    for (const p of ['flyday:', 'flyrule:', 'flyrun:']) expect(SETTINGS_ROW_PREFIXES).toContain(p)
    expect(SETTINGS_KEYS).toContain('flynames')
    for (const t of ['fly.day.set', 'fly.rule.set', 'fly.rule.remove', 'fly.run.set', 'settings.flynames', 'settings.sanscalendar'])
      expect(COMMAND_OPS[t], t).toMatchObject({ table: 'Setting, SchemaVersion', act: 'U', own: 'never' })
  })
  it('a typed figure for one date is one row, and a second date is untouched', () => {
    expect(setFlyDays([{ iso: MON, p: 16, w: 14 }]).ok).toBe(true)
    expect(setFlyDays([{ iso: THU, p: 12 }]).ok).toBe(true)
    expect(req(MON)).toEqual({ p: 16, w: 14 }); expect(req(THU)).toEqual({ p: 12, w: null })
    const env = commandStream().at(-1)!
    expect(env.type).toBe('fly.day.set')
    expect(env.changes.filter(c => c.collection === 'settings').map(c => c.id)).toEqual(['flyday:' + THU])
  })
  it('a patch names only what it changes: null clears a field, a field not named is left, an emptied row goes', () => {
    setFlyDays([{ iso: MON, p: 16, w: 14, cls: 'night' }])
    setFlyDays([{ iso: MON, p: null }])
    expect(store.get('flyday:' + MON, null)).toEqual({ cls: 'night', w: 14 })
    setFlyDays([{ iso: MON, w: null, cls: null }])
    expect(store.get('flyday:' + MON, null)).toBeNull()
    expect(mem.has('sqn142_flyday:' + MON)).toBe(false)
  })
  it('a class is stored only where it differs from what the date would inherit', () => {
    setFlyDays([{ iso: MON, cls: 'day' }])                       // a weekday is day flying anyway
    expect(store.get('flyday:' + MON, null)).toBeNull()
    setFlyRule({ wd: 3, cls: 'nf', from: '2026-01-01' })
    setFlyDays([{ iso: THU, cls: 'day' }])                       // set apart from its rule
    expect(store.get('flyday:' + THU, null)).toEqual({ cls: 'day' }); expect(cls(THU)).toBe('day')
    setFlyDays([{ iso: THU, cls: 'nf' }])                        // stepped back to it: the row goes
    expect(store.get('flyday:' + THU, null)).toBeNull(); expect(cls(THU)).toBe('nf')
  })
  it('a picked block of ten cells is ONE command and ONE Undo step', () => {
    const block = ['12', '13', '14', '15', '16'].flatMap(d => [{ iso: `2026-01-${d}`, p: 18, w: 16 }])
    const n = commandStream().length
    expect(setFlyDays(block).ok).toBe(true)
    expect(commandStream().length).toBe(n + 1)
    expect(commandStream().at(-1)!.changes.filter(c => c.collection === 'settings')).toHaveLength(5)
    expect(req('2026-01-16')).toEqual({ p: 18, w: 16 })
    expect(globalUndo().ok).toBe(true)
    for (const b of block) expect(req(b.iso)).toEqual({ p: null, w: null })
    expect(globalRedo().ok).toBe(true)
    expect(req('2026-01-14')).toEqual({ p: 18, w: 16 })
  })
  it('a weekday rule: a second one for the same weekday and start replaces the first; removed by its id', () => {
    const a = setFlyRule({ wd: 3, cls: 'nf', from: '2026-01-15' })
    expect(a.ok).toBe(true); expect(cls(THU)).toBe('nf')
    const b = setFlyRule({ wd: 3, cls: 'night', from: '2026-01-15' })
    expect(b.ok).toBe(true); expect(b.id).toBe(a.id)
    expect(getFlyPlan().rules).toHaveLength(1); expect(cls(THU)).toBe('night')
    setFlyRule({ wd: 3, cls: 'nf', from: '2026-03-05', until: '2026-03-26' })
    expect(getFlyPlan().rules).toHaveLength(2)
    expect(removeFlyRule(a.id!).ok).toBe(true)
    expect(getFlyPlan().rules).toHaveLength(1); expect(cls(THU)).toBe('day')
    expect(removeFlyRule('no-such-rule').ok).toBe(false)
  })
  it('a running figure: per seat, ended with null, and dropped again', () => {
    expect(setFlyRun(MON, { p: 18, w: 16 }).ok).toBe(true)
    expect(setFlyRun('2026-02-02', { p: 20 }).ok).toBe(true)
    expect(req('2026-02-03')).toEqual({ p: 20, w: 16 })
    expect(setFlyRun('2026-02-02', { w: null }).ok).toBe(true)               // the WSOs' run ends there; the pilots' stays
    expect(store.get('flyrun:2026-02-02', null)).toEqual({ p: 20, w: null })
    expect(req('2026-02-03')).toEqual({ p: 20, w: null })
    expect(dropFlyRun('2026-02-02', ['w']).ok).toBe(true)                    // not spoken for again: the earlier run carries on
    expect(req('2026-02-03')).toEqual({ p: 20, w: 16 })
    expect(dropFlyRun('2026-02-02', ['p']).ok).toBe(true)
    expect(store.get('flyrun:2026-02-02', null)).toBeNull()
    expect(req('2026-02-03')).toEqual({ p: 18, w: 16 })
  })
})

describe('what is refused, and that a refusal writes nothing', () => {
  it('a bad date, a negative or fractional figure, an unknown class or field — the whole block with it', () => {
    for (const bad of [
      [{ iso: '2026-02-30', p: 5 }], [{ iso: MON, p: -1 }], [{ iso: MON, w: 1.5 }], [{ iso: MON, cls: 'both' }],
      [{ iso: MON, p: 5, required: 4 }], [{ iso: MON, p: 5 }, { iso: 'soon', p: 5 }], [],
    ]) expect(setFlyDays(bad as any).ok, JSON.stringify(bad)).toBe(false)
    expect(getFlyPlan().days).toEqual({})
    expect(setFlyRule({ wd: 7, cls: 'nf', from: MON } as any).ok).toBe(false)
    expect(setFlyRule({ wd: 3, cls: 'nf', from: THU, until: MON }).ok).toBe(false)
    expect(setFlyRun('2026-13-01', { p: 5 }).ok).toBe(false)
    expect(setFlyRun(MON, { p: 2.5 } as any).ok).toBe(false)
    expect(setFlyRun(MON, {}).ok).toBe(false)
    expect(getFlyPlan()).toEqual({ days: {}, rules: [], runs: {} })
  })
  it('a member, and an admin in the member view, at the command itself', () => {
    setSession({ user: 'member-test', role: 'member' })
    expect(setFlyDays([{ iso: MON, p: 5 }]).ok).toBe(false)
    expect(setFlyRule({ wd: 3, cls: 'nf', from: THU }).ok).toBe(false)
    expect(setFlyRun(MON, { p: 5 }).ok).toBe(false)
    expect(saveTones({ yellowFrom: 2, amberFrom: 4, redFrom: 6 }).ok).toBe(false)
    expect(saveFlyNames({ p: 'Pilots needed', w: 'WSOs needed' }).ok).toBe(false)
    setSession({ user: 'admin-test', role: 'admin' }); setEffectiveRole('main')
    expect(setFlyDays([{ iso: MON, p: 5 }]).ok).toBe(false)
    expect(getFlyPlan()).toEqual({ days: {}, rules: [], runs: {} })
  })
  it('a raw write, outside every command', () => {
    expect(() => store.set('flyday:' + MON, { p: 9 })).toThrow()
    expect(() => store.set('flyrule:x', { id: 'x', wd: 3, cls: 'nf', from: THU })).toThrow()
    expect(() => store.set('flyrun:' + MON, { p: 9 })).toThrow()
    expect(() => store.set('flynames', { p: 'x', w: 'y' })).toThrow()
    expect(setFlyDays([{ iso: MON, p: 5 }]).ok).toBe(true)
  })
  it('a refused update goes back to exactly what was there', () => {
    setFlyDays([{ iso: MON, p: 5 }])
    setConflictChecker(changes => changes.some(c => c.id === 'flyday:' + MON) ? 'test conflict' : null)
    expect(setFlyDays([{ iso: MON, p: 8 }]).ok).toBe(false)
    expect(req(MON)).toEqual({ p: 5, w: null })
  })
  it('a save the storage swallowed is reported, and the figure stays as it was', () => {
    setFlyDays([{ iso: MON, p: 5 }])
    const original = storeBackend.impl!
    storeBackend.impl = { ...original, setItem: () => { throw new Error('storage unavailable') } }
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(setFlyDays([{ iso: MON, p: 8 }]).ok).toBe(false)
    storeBackend.impl = original; flyplanLoad()
    expect(req(MON)).toEqual({ p: 5, w: null })
  })
})

describe('Undo, Redo, and the words they say', () => {
  it('a required figure, one date and a block', () => {
    setFlyDays([{ iso: MON, p: 16, w: 14 }])
    expect(undoState().undoLabel).toContain('the required pilots and WSOs for 12 Jan')
    expect(globalUndo().ok).toBe(true); expect(req(MON)).toEqual({ p: null, w: null })
    expect(globalRedo().ok).toBe(true); expect(req(MON)).toEqual({ p: 16, w: 14 })
    setFlyDays([{ iso: MON, p: 18 }, { iso: '2026-01-16', p: 18 }])
    expect(undoState().undoLabel).toContain('the required pilots and WSOs for 12–16 Jan')
  })
  it('a day\'s class', () => {
    setFlyDays([{ iso: THU, cls: 'night' }])
    expect(undoState().undoLabel).toContain('day or night flying on Thu 15 Jan')
    expect(globalUndo().ok).toBe(true); expect(cls(THU)).toBe('day')
    expect(globalRedo().ok).toBe(true); expect(cls(THU)).toBe('night')
  })
  it('a weekday rule, made and removed', () => {
    const r = setFlyRule({ wd: 3, cls: 'nf', from: '2026-11-05' })
    expect(undoState().undoLabel).toContain('Thursdays as no-fly days from 5 Nov')
    expect(globalUndo().ok).toBe(true); expect(getFlyPlan().rules).toHaveLength(0)
    expect(globalRedo().ok).toBe(true); expect(cls('2026-11-05')).toBe('nf')
    removeFlyRule(r.id!)
    expect(undoState().undoLabel).toContain('Thursdays as no-fly days from 5 Nov')
    expect(globalUndo().ok).toBe(true); expect(cls('2026-11-05')).toBe('nf')
  })
  it('a running figure', () => {
    setFlyRun(MON, { p: 18, w: 16 })
    expect(undoState().undoLabel).toContain('a required figure running from 12 Jan')
    expect(globalUndo().ok).toBe(true); expect(req('2026-01-20')).toEqual({ p: null, w: null })
    expect(globalRedo().ok).toBe(true); expect(req('2026-01-20')).toEqual({ p: 18, w: 16 })
  })
  /* typed "From <date> on" over a cell that already held a figure typed for that date (the plan §3.3, step 2): the
     date's own figure would hide the run on the very day it starts, so the same command takes it away */
  it('a running figure typed over a date\'s own figure: the date\'s figure goes in the SAME command, one Undo step', () => {
    setFlyDays([{ iso: MON, p: 16, w: 14, cls: 'night' }])
    const n = commandStream().length
    expect(setFlyRun(MON, { p: 18 }, { clearDay: true }).ok).toBe(true)
    expect(commandStream().length).toBe(n + 1)
    expect(commandStream().at(-1)!.type).toBe('fly.run.set')
    expect(store.get('flyday:' + MON, null)).toEqual({ cls: 'night', w: 14 })   // the other seat's figure and the class stay
    expect(req(MON)).toEqual({ p: 18, w: 14 }); expect(req('2026-01-13')).toEqual({ p: 18, w: null })
    expect(undoState().undoLabel).toContain('a required figure running from 12 Jan')
    expect(globalUndo().ok).toBe(true)
    expect(req(MON)).toEqual({ p: 16, w: 14 }); expect(getFlyPlan().runs[MON]).toBeUndefined()
    expect(globalRedo().ok).toBe(true); expect(req(MON)).toEqual({ p: 18, w: 14 })
  })
  it('without that option the date\'s own figure is left, as before; a seat the run ENDS for keeps its typed figure too', () => {
    setFlyDays([{ iso: MON, p: 16, w: 14 }])
    expect(setFlyRun(MON, { p: 18 }).ok).toBe(true)
    expect(req(MON)).toEqual({ p: 16, w: 14 })
    expect(setFlyRun(MON, { p: null, w: 9 }, { clearDay: true }).ok).toBe(true)
    expect(store.get('flyday:' + MON, null)).toEqual({ p: 16 })
  })
  it('the three colours and the rows\' names', () => {
    expect(getTones()).toEqual({ yellowFrom: 1, amberFrom: 3, redFrom: 5 })
    expect(saveTones({ yellowFrom: 2, amberFrom: 4, redFrom: 6 }).ok).toBe(true)
    for (const bad of [{ yellowFrom: 0, amberFrom: 3, redFrom: 5 }, { yellowFrom: 2, amberFrom: 2, redFrom: 5 }, { amberFrom: 1, redFrom: 3 }])
      expect(saveTones(bad as any).ok).toBe(false)
    expect(getTones()).toEqual({ yellowFrom: 2, amberFrom: 4, redFrom: 6 })
    expect(globalUndo().ok).toBe(true); expect(getTones()).toEqual({ yellowFrom: 1, amberFrom: 3, redFrom: 5 })
    expect(getFlyNames()).toEqual(FLY_NAME_DEFAULTS)
    expect(saveFlyNames({ p: '  Pilots to fly ', w: '' }).ok).toBe(true)
    expect(getFlyNames()).toEqual({ p: 'Pilots to fly', w: FLY_NAME_DEFAULTS.w })
    expect(undoState().undoLabel).toContain('the names of the Required rows')
    expect(saveFlyNames({ p: 'x'.repeat(41), w: 'W' }).ok).toBe(false)
    expect(globalUndo().ok).toBe(true); expect(getFlyNames()).toEqual(FLY_NAME_DEFAULTS)
    expect(globalRedo().ok).toBe(true); expect(getFlyNames().p).toBe('Pilots to fly')
  })
})

describe('a reload, and what an older store holds', () => {
  it('reads back exactly what was written', () => {
    setFlyDays([{ iso: MON, p: 16, w: 14 }, { iso: THU, cls: 'night' }])
    setFlyRule({ wd: 4, cls: 'nf', from: '2026-02-06' })
    setFlyRun('2026-03-02', { p: 20, w: null })
    saveTones({ yellowFrom: 2, amberFrom: 4, redFrom: 6 }); saveFlyNames({ p: 'Req pilots', w: 'Req WSOs' })
    const was = JSON.stringify([getFlyPlan(), getTones(), getFlyNames()])
    initStore()                                                   // the same storage, a new page life
    expect(JSON.stringify([getFlyPlan(), getTones(), getFlyNames()])).toBe(was)
  })
  it('a `sansday:` row and a two-figure colour record left by the earlier build break nothing and are read as nothing', () => {
    mem.set('sqn142_sansday:2026-10-09', JSON.stringify({ required: 5, flying: 'both' }))
    mem.set('sqn142_sanscalendar', JSON.stringify({ amberFrom: 2, redFrom: 4 }))
    mem.set('sqn142_flyday:2026-10-09', JSON.stringify({ p: -3 }))
    mem.set('sqn142_flyrule:zz', JSON.stringify({ id: 'other', wd: 3, cls: 'nf', from: THU }))
    initStore()
    expect(getFlyPlan()).toEqual({ days: {}, rules: [], runs: {} })
    expect(getTones()).toEqual({ yellowFrom: 1, amberFrom: 3, redFrom: 5 })
    expect(setFlyDays([{ iso: '2026-10-09', p: 4 }]).ok).toBe(true)
    expect(req('2026-10-09')).toEqual({ p: 4, w: null })
  })
})
