/* THE MANNING BLOCK'S SETTINGS OF THE OVERHAUL'S BATCH 3, IN THE STORE — the Available rows' amber and red points
   (D1190, D1191, D1202) and the Required rows' names (D1193, narrowing D668).

   What is pinned here: each is kept over a reload and through the war's stored rows; a row stored before either existed
   reads as it always did; Undo takes each back; a member cannot write either (the permission side is
   permsparity.test.ts); the calendars' signal moves when either changes, so the war's rows and the SANS calendar repaint;
   and the days breaking a manning rule take an Available row at red and never one at amber (D1243). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { initStore as raptorInitStore } from '../state/store'
import { setSession } from '../state/auth'
import { setFlyDays } from '../state/flyplan'
import { AVAIL_P, AVAIL_W, availPointsOf, evaluatePeriod } from './engine'
import {
  availRules, getState, initStore, lwHistInit, lwUndo, manningRowIds, saveAvailRow, saveManningRule, setAvailPoints,
  setPeople, setReqName, setRole,
} from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { elevenCounters } from './testkit'
import { availRedAt, availVerdictAt, dayFacts, manningRedDays, reqRowNames, warFactsVersion } from './sync'

const mem = new Map<string, string>()
let be: StorageBackend
beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  be = memoryBackend()
  initStore(be)
  setRole('admin')
  setPeople(projectPeople())
})
afterEach(() => { setSession(null); storeBackend.impl = null })

const TUE = '2026-01-06', WED = '2026-01-07', THU = '2026-01-08'
const storedKey = (end: string) => be.keys().find(k => k.endsWith(end))

describe('the Available rows\' points', () => {
  it('kept over a reload, negatives too — on the row, never as a threshold', () => {
    expect(setAvailPoints(AVAIL_P, { amber: 2, red: -1 })).toBe(true)
    expect(saveAvailRow({ ...availRules().w, label: 'WSOs here', points: { red: 1 } })).toBe(true)
    initStore(be)
    expect(availRules().p.points).toEqual({ amber: 2, red: -1 })
    expect(availRules().p.threshold).toEqual({ amber: 0, red: 0 })
    expect(availRules().w).toMatchObject({ label: 'WSOs here', points: { red: 1 } })
    const stored = JSON.parse(be.read(storedKey('manningdefs')!)!)
    expect(stored.find((r: any) => r.id === AVAIL_P).points).toEqual({ amber: 2, red: -1 })
  })
  it('a row stored before the points existed reads as today: red under Required, no amber', () => {
    saveManningRule({ ...availRules().p, label: 'Old P' })          // the save the counter form made before D1190
    const key = storedKey('manningdefs')!
    const rules = JSON.parse(be.read(key)!)
    expect(rules.find((r: any) => r.id === AVAIL_P).points).toBeUndefined()
    initStore(be)
    expect(availRules().p.label).toBe('Old P')
    expect(availPointsOf(availRules().p)).toEqual({ red: 0 })
  })
  it('a stored pair that will not read is left out, and the row still reads', () => {
    saveManningRule({ ...availRules().p, label: 'Kept' })
    const key = storedKey('manningdefs')!
    const rules = JSON.parse(be.read(key)!)
    rules.find((r: any) => r.id === AVAIL_P).points = { amber: 'lots', red: 'x' }
    be.write(key, JSON.stringify(rules))
    initStore(be)
    expect(availRules().p.label).toBe('Kept')
    expect(availRules().p.points).toBeUndefined()
  })
  it('a counter (not one of the two) carries no points, whatever is sent', () => {
    elevenCounters()
    const ip = getState().requirements.default.rules.find(r => r.id === 'ip')!
    expect(saveManningRule({ ...ip, points: { amber: 3, red: 1 } } as any)).toBe(true)
    expect(getState().requirements.default.rules.find(r => r.id === 'ip')!.points).toBeUndefined()
  })
  it('a pair that is not one is refused, and nothing changes', () => {
    expect(setAvailPoints(AVAIL_P, { red: Number.NaN })).toBe(false)
    expect(setAvailPoints(AVAIL_P, { red: 500 })).toBe(false)
    expect(setAvailPoints('ip', { red: 1 })).toBe(false)
    expect(availRules().p.points).toBeUndefined()
  })
  it('a member writes neither', () => {
    setRole('member')
    expect(setAvailPoints(AVAIL_P, { amber: 2, red: 0 })).toBe(false)
    expect(saveAvailRow({ ...availRules().w, label: 'Mine now' })).toBe(false)
    expect(availRules().p.points).toBeUndefined()
    expect(availRules().w.label).toBe('Available W')
  })
  it('Undo takes the points back', () => {
    lwHistInit()
    expect(setAvailPoints(AVAIL_P, { amber: 2, red: 0 })).toBe(true)
    lwUndo()
    expect(availRules().p.points).toBeUndefined()
  })
  it('the calendars\' signal moves, so the rows repaint', () => {
    const v = warFactsVersion()
    setAvailPoints(AVAIL_W, { amber: 1, red: 0 })
    expect(warFactsVersion()).toBeGreaterThan(v)
  })
  it('they stay out of the Manning list (manningRowIds)', () => {
    elevenCounters()
    setAvailPoints(AVAIL_P, { amber: 2, red: 0 })
    expect(manningRowIds()).not.toContain(AVAIL_P)
    expect(manningRowIds()).not.toContain(AVAIL_W)
  })
})

describe('the Required rows\' names', () => {
  it('start as Required P and Required W', () => {
    expect(reqRowNames()).toEqual({ p: 'Required P', w: 'Required W' })
  })
  it('a rename is kept over a reload, under its own key', () => {
    expect(setReqName('p', '  Pilots to fly  ')).toBe(true)
    initStore(be)
    expect(reqRowNames()).toEqual({ p: 'Pilots to fly', w: 'Required W' })
    expect(JSON.parse(be.read(storedKey('reqnames')!)!)).toEqual({ p: 'Pilots to fly' })
  })
  it('a blank name, or the original typed back, puts the original back', () => {
    setReqName('w', 'WSOs to fly')
    expect(setReqName('w', '   ')).toBe(true)
    expect(getState().reqNames).toEqual({})
    setReqName('w', 'WSOs to fly')
    expect(setReqName('w', 'Required W')).toBe(true)
    expect(reqRowNames().w).toBe('Required W')
    expect(getState().reqNames.w).toBeUndefined()
  })
  it('a member cannot rename one', () => {
    setRole('member')
    expect(setReqName('p', 'Mine')).toBe(false)
    expect(reqRowNames().p).toBe('Required P')
  })
  it('Undo puts the old name back', () => {
    lwHistInit()
    setReqName('p', 'Pilots to fly')
    lwUndo()
    expect(reqRowNames().p).toBe('Required P')
  })
  it('the calendars\' signal moves on a rename', () => {
    const v = warFactsVersion()
    setReqName('p', 'Pilots to fly')
    expect(warFactsVersion()).toBeGreaterThan(v)
  })
  it('a stored name that is not one is ignored at the read', () => {
    setReqName('p', 'Pilots to fly')
    be.write(storedKey('reqnames')!, JSON.stringify({ p: 42, w: 'WSOs to fly' }))
    initStore(be)
    expect(reqRowNames()).toEqual({ p: 'Required P', w: 'WSOs to fly' })
  })
})

describe('where an Available row stands on a day, and the days breaking a manning rule (D1243)', () => {
  it('red on its own point counts; amber never does; a no-fly day needs nobody', () => {
    const p = dayFacts(TUE).availP!, w = dayFacts(WED).availW!
    /* Tue: Available P one short of Required (red, "+ 0"); Wed: Available W meets Required exactly but amber is "+ 2";
       Thu: a no-fly day asking for more pilots than there are */
    setFlyDays([{ iso: TUE, p: p + 1 }, { iso: WED, w }, { iso: THU, cls: 'nf', p: 99 }])
    setAvailPoints(AVAIL_W, { amber: 2, red: 0 })
    expect(availVerdictAt(TUE, 'p')).toBe('red')
    expect(availVerdictAt(WED, 'w')).toBe('amber')
    expect(availVerdictAt(THU, 'p')).toBe('')
    expect(availRedAt(TUE)).toEqual([{ ruleId: AVAIL_P, label: 'Available P', have: p, need: expect.any(Number) }])  // the day's Required rides the line (r19c, D1243)
    expect(availRedAt(WED)).toEqual([])

    const s = getState()
    const dates = s.period.days.map(d => d.date)
    const red = manningRedDays(dates, evaluatePeriod(s.people, s.grid, s.states, s.requirements, dates, s.views))
    expect(red.find(d => d.date === TUE)!.lines).toContainEqual({ ruleId: AVAIL_P, label: 'Available P', have: p, need: expect.any(Number) })
    expect(red.some(d => d.date === WED)).toBe(false)
    expect(red.some(d => d.date === THU)).toBe(false)
  })
  it('a renamed Available row is listed by its own name', () => {
    const p = dayFacts(TUE).availP!
    setFlyDays([{ iso: TUE, p: p + 1 }])
    saveAvailRow({ ...availRules().p, label: 'Pilots here' })
    expect(availRedAt(TUE)).toEqual([{ ruleId: AVAIL_P, label: 'Pilots here', have: p, need: expect.any(Number) }])
  })
  it('moving red lower takes the day off the list', () => {
    const p = dayFacts(TUE).availP!
    setFlyDays([{ iso: TUE, p: p + 1 }])
    setAvailPoints(AVAIL_P, { red: -1 })
    expect(availVerdictAt(TUE, 'p')).toBe('')
    expect(availRedAt(TUE)).toEqual([])
  })
})
