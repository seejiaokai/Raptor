import { describe, expect, it } from 'vitest'
import { warAutoName } from './warname'

/* [LW-WAR-AUTONAME] (his D2158): the periods' own form, "JAN - DEC 26" */
describe('a new leave war’s name from its dates (D2158)', () => {
  it('two months of one year: the months, a spaced hyphen, the two-digit year', () => {
    expect(warAutoName('2027-01-01', '2027-03-31')).toBe('JAN - MAR 27')
    expect(warAutoName('2026-01-01', '2026-12-31')).toBe('JAN - DEC 26')
  })
  it('one month alone: the month and the year', () => {
    expect(warAutoName('2027-01-01', '2027-01-31')).toBe('JAN 27')
    expect(warAutoName('2027-07-15', '2027-07-15')).toBe('JUL 27')
  })
  it('across a year’s end: each month with its own year', () => {
    expect(warAutoName('2026-12-01', '2027-02-28')).toBe('DEC 26 - FEB 27')
    expect(warAutoName('2026-01-01', '2027-01-31')).toBe('JAN 26 - JAN 27')
  })
  it('the days inside a month play no part', () => {
    expect(warAutoName('2027-01-15', '2027-03-10')).toBe('JAN - MAR 27')
  })
  it('nothing until both dates are picked', () => {
    expect(warAutoName('', '')).toBe('')
    expect(warAutoName('2027-01-01', '')).toBe('')
  })
})
