import { beforeEach, describe, expect, it } from 'vitest'
import { balanceAfterFill, getState, grantTo, initStore, setCell, setOilPolicy, setRole } from './store'
import { memoryBackend } from './storage'
import { goesBelow } from '../ui/belowzero'

/* THE ONE QUESTION BOTH LEAVE SHEETS ASK before taking someone below zero (his ruling D418, 29 Sep 26 — "Drag asks
   too"): what the balance column would read after the fill, against what it reads now. Read of the wars as the fill
   would leave them, through the column's own figure — so the ask quotes what the column will show. Astra's final read
   (29 Sep 26) found the three cases the first cut got wrong; each is pinned here through the real store. */

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

describe('balanceAfterFill', () => {
  it('an afternoon beside a morning already held spends its half — the morning is not forgotten (F1)', () => {
    expect(setCell('dusk', '2026-02-11', '*FCL')).toBe(true)
    const r = balanceAfterFill('dusk', ['2026-02-11'], 'FCL*')!
    expect(r.counter).toBe('fcl')
    expect(r.before).toBe(-0.5)
    expect(r.after).toBe(-1)
    expect(goesBelow(r)).toBe(true)
  })

  it('a Saturday of FCL costs nothing — no ask, even at zero', () => {
    const r = balanceAfterFill('dusk', ['2026-02-14'], 'FCL')!
    expect(r.after).toBe(r.before)
    expect(goesBelow(r)).toBe(false)
  })

  it('a man already in the red whom the fill costs nothing is not asked about (F4)', () => {
    expect(setCell('dusk', '2026-02-11', 'FCL')).toBe(true)                // FCL -1
    const r = balanceAfterFill('dusk', ['2026-02-11'], 'FCL')!              // the same leave again: no change
    expect(r.before).toBe(-1)
    expect(r.after).toBe(-1)
    expect(goesBelow(r)).toBe(false)
  })

  it("OIL reads through the tracker's FIFO and expiry: a day that uses a credit about to expire costs the balance nothing (F3)", () => {
    // ROULETTE holds no OIL at all; one day credited 5 Jan, lasting 30 days, has long expired by today
    expect(setOilPolicy({ expiry: { n: 30, unit: 'days' } })).toBe(true)
    expect(grantTo(['roulette'], 'oil', 1, '2026-01-05', 'walk')).toBeNull()
    const inTime = balanceAfterFill('roulette', ['2026-01-12'], 'OIL')!    // taken before it expired: it uses it
    expect(inTime.before).toBe(0)
    expect(inTime.after).toBe(0)
    expect(goesBelow(inTime)).toBe(false)
    const late = balanceAfterFill('roulette', ['2026-03-10'], 'OIL')!       // after it expired: nothing backs it
    expect(late.after).toBe(-1)
    expect(goesBelow(late)).toBe(true)
  })

  it('only the days the store would write count, and asking writes nothing', () => {
    const r = balanceAfterFill('dusk', ['2026-02-11', '2031-06-02'], 'FCL')!   // the second date is in no war
    expect(r.before - r.after).toBe(1)
    expect(balanceAfterFill('dusk', ['2026-02-11'], 'EL')?.counter).toBe('el')
    expect(getState().grid.dusk?.['2026-02-11']).toBeUndefined()           // asking writes nothing
  })
})
