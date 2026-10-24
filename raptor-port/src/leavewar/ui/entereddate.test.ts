import { describe, expect, it } from 'vitest'
import { enteredDay } from './dates'

/* [LW-ENTERED-DATE-UTC] (M3 §4): the Leave War suite runs in Pacific/Midway (UTC−11 — vite.config.ts), so an instant early
   on 23 Oct in UTC is still the 22nd where it is read; the cut-off UTC date printed the 23rd. */
describe('an entered date is the local day of the instant', () => {
  it('03:00 UTC on 23 Oct reads 22 Oct where the clock is eleven hours behind', () => {
    expect(enteredDay('2026-10-23T03:00:00Z')).toBe('22 Oct 26')
  })
  it('no instant, or a broken one, prints nothing', () => {
    expect(enteredDay(undefined)).toBe('')
    expect(enteredDay('not a date')).toBe('')
  })
})
