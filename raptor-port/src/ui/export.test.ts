/* CSV encoding. The LoX prints an en dash in the AAR cells a WSO cannot hold,
   and Excel showed it as "â€“" (owner, 5 Aug 26) because a .csv with no
   byte-order mark is decoded in the machine's ANSI codepage rather than UTF-8.
   These pin the BOM and the bytes behind it — the glyph alone would still pass
   if the file were written as Latin-1. */
import { describe, expect, it } from 'vitest'
import { csvText, schedRows, inputRows } from './export'

const bytes = (s: string) => Array.from(new TextEncoder().encode(s))

describe('CSV export encoding', () => {
  it('starts with a UTF-8 BOM', () => {
    expect(csvText([['a']]).charCodeAt(0)).toBe(0xfeff)
    /* the BOM only tells Excel anything as the bytes EF BB BF */
    expect(bytes(csvText([['a']])).slice(0, 3)).toEqual([0xef, 0xbb, 0xbf])
  })

  it('carries an en dash through as UTF-8, not as three Latin-1 glyphs', () => {
    const out = csvText([['DAAR'], ['–']])
    expect(out).toContain('–')
    /* E2 80 93 is U+2013 in UTF-8; read one byte at a time in cp1252 those are
       exactly the "â€“" the owner saw in the spreadsheet */
    const b = bytes(out)
    expect(b.join(',')).toContain([0xe2, 0x80, 0x93].join(','))
    expect(out).not.toContain('â€“')
  })

  it('still quotes, escapes and ends rows the way it did', () => {
    /* the BOM is a prefix, not a change of format — a reader that strips it
       must find precisely the old file underneath */
    const out = csvText([['a', 'b'], ['say "hi"', '']])
    expect(out.slice(1)).toBe('"a","b"\r\n"say ""hi""",""')
  })

  it('null and undefined cells stay empty rather than printing their names', () => {
    expect(csvText([[null, undefined]]).slice(1)).toBe('"",""')
  })

  it('the schedule export is exported through the same encoder', () => {
    const out = csvText(schedRows())
    expect(out.charCodeAt(0)).toBe(0xfeff)
    /* the BOM leads the first line, so strip it before comparing the header */
    expect(out.slice(1).split('\r\n')[0]).toBe('"Day","Date","Wave","CS","Mission","Brief","TO","Land","FCP","FCP lvl","RCP","RCP lvl","Area","Area time","Rmks","Stores"')
  })
})

/* THE INPUTS PAGE'S EXPORT CARRIES EACH INPUT'S WHOLE SPAN (the absence-record re-test, AB10, 26 Sep 26). Its
   columns carried the start and end TIMES but only the FIRST date, so a leave 20–24 Jul reached the spreadsheet as
   "Jul 20" — four of its five days gone from the only copy that leaves the app. */
describe('the Inputs export (142-inputs.csv)', () => {
  const rows = inputRows([
    { person: 'bapster', type: 'LL', date: 'Jul 20', endDate: 'Jul 24', allday: true, s: 0, e: 1439, remarks: 'Bali' },
    { person: 'bapster', type: 'ATT C', date: 'Jul 22', allday: true, s: 0, e: 1439, remarks: 'sick' },
    { person: 'bane', type: 'Appointment', date: 'Jul 16', allday: false, s: 1020, e: 1110, remarks: 'PHA' },
  ])
  it('names both ends of the span', () => {
    expect(rows[0]).toEqual(['Name', 'From', 'To', 'Start', 'End', 'Type', 'Remarks'])
    expect(rows[1].slice(1, 3)).toEqual(['Jul 20', 'Jul 24'])
  })
  it('a one-day input reads the same date at both ends; a timed one keeps its times', () => {
    expect(rows[2].slice(1, 3)).toEqual(['Jul 22', 'Jul 22'])
    expect(rows[3].slice(1, 5)).toEqual(['Jul 16', 'Jul 16', '17:00', '18:30'])
  })
})
