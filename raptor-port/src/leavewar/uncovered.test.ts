// @vitest-environment jsdom
/* WHICH DATES OF A YEAR NO LEAVE PERIOD COVERS — what the Holidays list in Days says before a holiday is refused (the
   build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4: "A date no leave period covers: where
   the WHOLE year has none, D19's line and its button … Where the year is PARTLY covered … the line says which dates are
   not covered"). A public holiday or an Off day is the war's own record, kept in the period HOLDING its date — so a date
   outside every period has nowhere to be written. `sync.ts uncoveredIn(year)` is the one reader of that. */
import { beforeEach, describe, expect, it } from 'vitest'
import { createWar, getState, initStore, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { uncoveredIn } from './sync'

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

/** a year nothing in the demo world reaches */
const FREE = 2031
const wars = () => getState().wars.map(w => [w.period.start, w.period.end])

describe('uncoveredIn', () => {
  it('a year no period reaches: the whole year, as one run', () => {
    expect(wars().some(([s, e]) => e >= `${FREE}-01-01` && s <= `${FREE}-12-31`)).toBe(false)
    expect(uncoveredIn(FREE)).toEqual([{ from: `${FREE}-01-01`, to: `${FREE}-12-31` }])
  })
  it('a year one period holds whole: nothing', () => {
    expect(createWar('Whole', `${FREE}-01-01`, `${FREE}-12-31`)).toBe('created')
    expect(uncoveredIn(FREE)).toEqual([])
  })
  it('a period over the first quarter: the rest of the year', () => {
    createWar('Q1', `${FREE}-01-01`, `${FREE}-03-31`)
    expect(uncoveredIn(FREE)).toEqual([{ from: `${FREE}-04-01`, to: `${FREE}-12-31` }])
  })
  it('two periods with a hole between them, and room at both ends: three runs, in date order', () => {
    createWar('Spring', `${FREE}-02-01`, `${FREE}-04-30`)
    createWar('Autumn', `${FREE}-09-01`, `${FREE}-11-30`)
    expect(uncoveredIn(FREE)).toEqual([
      { from: `${FREE}-01-01`, to: `${FREE}-01-31` },
      { from: `${FREE}-05-01`, to: `${FREE}-08-31` },
      { from: `${FREE}-12-01`, to: `${FREE}-12-31` },
    ])
  })
  it('a period that starts the year before and ends the year after covers it whole', () => {
    createWar('Long', `${FREE - 1}-07-01`, `${FREE + 1}-06-30`)
    expect(uncoveredIn(FREE)).toEqual([])
    expect(uncoveredIn(FREE - 1)).toContainEqual({ from: `${FREE - 1}-01-01`, to: `${FREE - 1}-06-30` })
  })
  it('two periods back to back leave no hole between them', () => {
    createWar('H1', `${FREE}-01-01`, `${FREE}-06-30`)
    createWar('H2', `${FREE}-07-01`, `${FREE}-12-31`)
    expect(uncoveredIn(FREE)).toEqual([])
  })
  it('a year that is not a year answers nothing', () => {
    expect(uncoveredIn('soon')).toEqual([])
    expect(uncoveredIn(31)).toEqual([])
  })
})
