/* The home handle's second question and a man's stints (the reshape plan §3.2 A-i — Fable 7 of round 2): the days his
   squadron CHANGES are read from the resolved squadron against the day before, never from a row's date as such. */
import { describe, it, expect } from 'vitest'
import { homeChangesIn, homeUnitOn, stintsIn, type UnitRows, type Home } from './units-model'

const rows = (homes: Home[]): UnitRows => ({ units: [], places: [], unitplaces: [], grants: [], homes })
const h = (id: string, unit: string, from: string, pid = 'bane'): Home => ({ id, pid, unit, from })
const ALL = ['2000-01-01', '2099-12-31'] as const

describe('homeChangesIn — the days his squadron changes', () => {
  it('a move: one change, on the move day', () => {
    const r = rows([h('h1', 'u142', '2026-07-15'), h('h2', 'u149', '2026-07-16')])
    expect(homeChangesIn(r, 'bane', ...ALL, 'u142')).toEqual(['2026-07-16'])
  })
  it('the baseline row setHome writes for a demo man with none (his squadron of today, from today) is no change', () => {
    const r = rows([h('h1', 'u142', '2026-07-15')])
    expect(homeChangesIn(r, 'bane', ...ALL, 'u142')).toEqual([])
  })
  it('a first placing from no squadron is no change (his first row reaches back over every day before it)', () => {
    const r = rows([h('h1', 'u149', '2026-07-15')])
    expect(homeChangesIn(r, 'bane', ...ALL, null)).toEqual([])
    expect(homeUnitOn(r, 'bane', '2026-07-01', null)).toBe('u149')
  })
  it('a same-day take-back (a second row of the same date naming his old squadron) is no change', () => {
    const r = rows([h('h1', 'u142', '2026-07-15'), h('h2', 'u149', '2026-07-16'), h('h3', 'u142', '2026-07-16')])
    expect(homeChangesIn(r, 'bane', ...ALL, 'u142')).toEqual([])
  })
  it('a second row of the same squadron is no change; a move there and back is two', () => {
    const r = rows([h('h1', 'u142', '2026-07-15'), h('h2', 'u142', '2026-07-20'), h('h3', 'u149', '2026-08-01'), h('h4', 'u142', '2026-09-01')])
    expect(homeChangesIn(r, 'bane', ...ALL, 'u142')).toEqual(['2026-08-01', '2026-09-01'])
  })
  it('the range: a excluded, b included', () => {
    const r = rows([h('h1', 'u142', '2026-07-15'), h('h2', 'u149', '2026-07-16')])
    expect(homeChangesIn(r, 'bane', '2026-07-16', '2026-07-20', 'u142')).toEqual([])
    expect(homeChangesIn(r, 'bane', '2026-07-15', '2026-07-16', 'u142')).toEqual(['2026-07-16'])
    expect(homeChangesIn(r, 'bane', '2026-07-10', '2026-07-15', 'u142')).toEqual([])
  })
  it('another man\'s rows never count, and a man with no row never changes', () => {
    const r = rows([h('h1', 'u142', '2026-07-15', 'x'), h('h2', 'u149', '2026-07-16', 'x')])
    expect(homeChangesIn(r, 'bane', ...ALL, 'u142')).toEqual([])
  })
  it('the per-person index follows new rows (a fresh list, or the same list grown)', () => {
    const homes = [h('h1', 'u142', '2026-07-15')]
    const r = rows(homes)
    expect(homeUnitOn(r, 'bane', '2026-07-20', 'u142')).toBe('u142')
    homes.push(h('h2', 'u149', '2026-07-16'))
    expect(homeUnitOn(r, 'bane', '2026-07-20', 'u142')).toBe('u149')
  })
})

describe('stintsIn — his runs of days in a unit', () => {
  it('a move: his old squadron up to the day before, the new from the move day', () => {
    const r = rows([h('h1', 'u142', '2026-07-15'), h('h2', 'u149', '2026-07-16')])
    expect(stintsIn(r, 'bane', 'u142', 'u142')).toEqual([{ from: null, to: '2026-07-15' }])
    expect(stintsIn(r, 'bane', 'u149', 'u142')).toEqual([{ from: '2026-07-16', to: null }])
  })
  it('there and back: two stints in 142, one in 149 between', () => {
    const r = rows([h('h1', 'u142', '2026-01-01'), h('h2', 'u149', '2026-07-16'), h('h3', 'u142', '2026-08-03')])
    expect(stintsIn(r, 'bane', 'u142', 'u142')).toEqual([{ from: null, to: '2026-07-15' }, { from: '2026-08-03', to: null }])
    expect(stintsIn(r, 'bane', 'u149', 'u142')).toEqual([{ from: '2026-07-16', to: '2026-08-02' }])
  })
  it('two rows of one squadron are one stint; a same-day take-back leaves one stint', () => {
    expect(stintsIn(rows([h('h1', 'u142', '2026-01-01'), h('h2', 'u142', '2026-03-01')]), 'bane', 'u142', null)).toEqual([{ from: null, to: null }])
    const back = rows([h('h1', 'u142', '2026-07-15'), h('h2', 'u149', '2026-07-16'), h('h3', 'u142', '2026-07-16')])
    expect(stintsIn(back, 'bane', 'u142', 'u142')).toEqual([{ from: null, to: null }])
    expect(stintsIn(back, 'bane', 'u149', 'u142')).toEqual([])
  })
  it('no row: the fallback\'s for ever, nobody else\'s', () => {
    expect(stintsIn(rows([]), 'bane', 'u142', 'u142')).toEqual([{ from: null, to: null }])
    expect(stintsIn(rows([]), 'bane', 'u149', 'u142')).toEqual([])
    expect(stintsIn(rows([]), 'bane', 'u142', null)).toEqual([])
  })
})
