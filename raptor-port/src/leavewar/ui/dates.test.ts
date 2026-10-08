import { describe, expect, it } from 'vitest'
import { shortDate, shortSpan, spanInYear } from './dates'

describe('shortDate', () => {
  it('reads a date the way the squadron writes one', () => {
    expect(shortDate('2027-01-05')).toBe('5 Jan 27')
    expect(shortDate('2026-12-31')).toBe('31 Dec 26')
  })

  // A leading zero on the day is storage's business, not the reader's.
  it('drops the leading zero on the day but keeps the month name', () => {
    expect(shortDate('2026-08-01')).toBe('1 Aug 26')
    expect(shortDate('2026-08-10')).toBe('10 Aug 26')
  })

  // The whole reason this does not use `toLocaleDateString` or a `Date`: both
  // read the runtime's timezone, and an aircrew east of UTC would be shown
  // the day BEFORE the one they clicked. Slicing the string cannot drift, so
  // this holds under a timezone that would break the obvious implementation.
  it('is the same date in every timezone', () => {
    const original = process.env.TZ
    try {
      for (const tz of ['UTC', 'Pacific/Kiritimati', 'Pacific/Midway', 'Asia/Singapore']) {
        process.env.TZ = tz
        expect(shortDate('2026-01-01')).toBe('1 Jan 26')
        expect(shortDate('2026-12-31')).toBe('31 Dec 26')
      }
    } finally {
      process.env.TZ = original
    }
  })
})

describe('shortSpan', () => {
  it('joins two dates with a dash', () => {
    expect(shortSpan('2027-01-01', '2027-12-31')).toBe('1 Jan 27 – 31 Dec 27')
  })

  // A single-day war is legal, and "5 Jan 27 – 5 Jan 27" reads as a mistake.
  it('says a single day once', () => {
    expect(shortSpan('2027-01-05', '2027-01-05')).toBe('5 Jan 27')
  })
})

/* The bidding dates on a phone ([LW-PHONE-HEADER-SPACE], D678 — reading 3: "the bidding dates read without their year").
   The period's own name on the line above carries the year, and four characters a date is what lets the Stage line
   hold one row at 360px. */
describe('spanInYear', () => {
  it('drops the year where both dates are in the same year', () => {
    expect(spanInYear('2026-01-01', '2026-03-31')).toBe('1 Jan – 31 Mar')
    expect(spanInYear('2027-09-22', '2027-11-30')).toBe('22 Sep – 30 Nov')
  })

  it('says a single day once', () => {
    expect(spanInYear('2026-08-09', '2026-08-09')).toBe('9 Aug')
  })

  // "15 Dec – 15 Jan" could be read either way round a year's end, and "1 Jan – 1 Jan" as one day. Where the two
  // dates are in different years the year is the only thing that tells them apart, so it stays.
  it('keeps both years where the dates fall in different years', () => {
    expect(spanInYear('2026-12-15', '2027-01-15')).toBe('15 Dec 26 – 15 Jan 27')
    expect(spanInYear('2026-01-01', '2027-01-01')).toBe('1 Jan 26 – 1 Jan 27')
  })

  it('is the same in every timezone, as shortDate is', () => {
    const original = process.env.TZ
    try {
      for (const tz of ['UTC', 'Pacific/Kiritimati', 'Pacific/Midway', 'Asia/Singapore']) {
        process.env.TZ = tz
        expect(spanInYear('2026-01-01', '2026-12-31')).toBe('1 Jan – 31 Dec')
      }
    } finally {
      process.env.TZ = original
    }
  })
})
