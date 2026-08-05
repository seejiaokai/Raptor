/* CSV encoding. The LoX prints an en dash in the AAR cells a WSO cannot hold,
   and Excel showed it as "â€“" (owner, 5 Aug 26) because a .csv with no
   byte-order mark is decoded in the machine's ANSI codepage rather than UTF-8.
   These pin the BOM and the bytes behind it — the glyph alone would still pass
   if the file were written as Latin-1. */
import { describe, expect, it } from 'vitest'
import { csvText, schedRows } from './export'

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
