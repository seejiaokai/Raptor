/* HOLIDAYS BY FILE — THE SHEET (owner D1501, 29 Oct 26 — "All as recommended"; his D1155: the app runs on a network with
   no internet, so it exports a sheet, he has it filled offline, and imports it). The sheet is a plain spreadsheet file
   the app writes and reads itself (the M5 plan §4, the builder's call): From, To, Name, Kind (PH or Off day), On grid.
   This file pins the pure half — the rows written, and every row read back as a holiday or as "not read" with how to put
   it right. What is new and what is already here is the store's to say (holidayimport.test.ts). */
import { describe, expect, it } from 'vitest'
import { holidaySheetRows, readHolidaySheet, SHEET_HEAD } from './holidaysheet'

const CSV = (rows: string[][]) => rows.map(r => r.join(',')).join('\r\n')

describe('the sheet written (Export sheet)', () => {
  it('a header row, then one line a holiday: dates as 2026-08-09, Kind PH or Off day, On grid its short form', () => {
    const rows = holidaySheetRows([
      { from: '2026-01-01', to: '2026-01-01', name: 'New Year’s Day', kind: 'ph', short: 'PH' },
      { from: '2026-02-17', to: '2026-02-18', name: 'Chinese New Year', kind: 'ph', short: 'CNY' },
      { from: '2026-01-23', to: '2026-01-23', name: 'Off day', kind: 'off', short: 'OFF' },
    ])
    expect(rows[0]).toEqual(SHEET_HEAD)
    expect(SHEET_HEAD).toEqual(['From', 'To', 'Name', 'Kind', 'On grid'])
    expect(rows.slice(1)).toEqual([
      ['2026-01-01', '2026-01-01', 'New Year’s Day', 'PH', 'PH'],
      ['2026-02-17', '2026-02-18', 'Chinese New Year', 'PH', 'CNY'],
      ['2026-01-23', '2026-01-23', 'Off day', 'Off day', 'OFF'],
    ])
  })
})

describe('the sheet read (Import sheet)', () => {
  it('reads what Export writes, row numbers counting the header as row 1', () => {
    const r = readHolidaySheet('﻿' + CSV([SHEET_HEAD, ['2026-08-09', '2026-08-09', 'National Day', 'PH', 'ND'], ['2026-02-17', '2026-02-18', 'Chinese New Year', 'PH', '']]))
    expect(r).toEqual([
      { row: 2, name: 'National Day', draft: { kind: 'ph', name: 'National Day', from: '2026-08-09', to: '2026-08-09', short: 'ND' } },
      { row: 3, name: 'Chinese New Year', draft: { kind: 'ph', name: 'Chinese New Year', from: '2026-02-17', to: '2026-02-18' } },
    ])
  })

  it('reads the quoted cells and the leading apostrophe Export puts before a formula-like name', () => {
    const t = '"From","To","Name","Kind","On grid"\r\n"2026-05-01","2026-05-01","Labour Day, the long one","PH",""\r\n"2026-05-02","","\'-Off","Off day",""'
    const r = readHolidaySheet(t)
    expect(r.map(x => x.draft?.name)).toEqual(['Labour Day, the long one', '-Off'])
    expect(r[1]!.draft!.to, 'an empty To is one day').toBe('2026-05-02')
  })

  it('a day-first date as a spreadsheet saves one in Singapore, and a month by its name, are read', () => {
    const r = readHolidaySheet(CSV([SHEET_HEAD, ['9/8/2026', '10/08/26', 'National Day', 'PH', ''], ['1-Jan-2027', '1 Jan 27', 'New Year', 'public holiday', '']]))
    expect(r.map(x => x.draft && [x.draft.from, x.draft.to, x.draft.kind])).toEqual([
      ['2026-08-09', '2026-08-10', 'ph'], ['2027-01-01', '2027-01-01', 'ph'],
    ])
  })

  it('a date with no year, or one that is no date, is not read — and says how to write it, with the sheet’s year', () => {
    const r = readHolidaySheet(CSV([SHEET_HEAD, ['2026-11-09', '', 'Deepavali (in lieu)', 'PH', ''], ['8/11', '', 'Deepavali', 'PH', ''], ['soon', '', 'Mystery', 'PH', '']]))
    expect(r[1]).toEqual({ row: 3, name: 'Deepavali', why: 'Row 3: the date “8/11” cannot be read. Write it as 2026-11-08.' })
    expect(r[2]).toEqual({ row: 4, name: 'Mystery', why: 'Row 4: the date “soon” cannot be read. Write it as year-month-day, like 2026-11-08.' })
  })

  it('a date that does not exist is not read', () => {
    const r = readHolidaySheet(CSV([SHEET_HEAD, ['2026-02-30', '', 'Odd', 'PH', '']]))
    expect(r[0]!.why).toMatch(/^Row 2: the date “2026-02-30” cannot be read/)
  })

  it('the kind is PH or Off day — any case; anything else is not read', () => {
    const r = readHolidaySheet(CSV([SHEET_HEAD, ['2026-03-01', '', 'A', 'ph', ''], ['2026-03-02', '', 'B', 'OFF', ''], ['2026-03-03', '', 'C', 'Holiday', ''], ['2026-03-04', '', 'D', '', '']]))
    expect(r.map(x => x.draft?.kind ?? x.why)).toEqual([
      'ph', 'off',
      'Row 4: the kind “Holiday” is not one the sheet takes. Write PH or Off day.',
      'Row 5: say what it is. Write PH or Off day.',
    ])
  })

  it('a last day before the first, a name too long and a bad short form are not read, each saying why', () => {
    const r = readHolidaySheet(CSV([SHEET_HEAD, ['2026-03-05', '2026-03-04', 'Back', 'PH', ''], ['2026-03-06', '', 'x'.repeat(41), 'PH', ''], ['2026-03-07', '', 'Short', 'PH', 'TOO LONG']]))
    expect(r[0]!.why).toBe('Row 2: its last day is before its first.')
    expect(r[1]!.why).toBe('Row 3: the name is longer than 40 letters.')
    expect(r[2]!.why).toBe('Row 4: The short form is one to three letters or digits, with no space.')
  })

  it('blank rows are skipped; a sheet with no header is read in the sheet’s own order', () => {
    const r = readHolidaySheet(CSV([['2026-04-03', '', 'Good Friday', 'PH', ''], ['', '', '', '', ''], ['2026-05-27', '', 'Hari Raya Haji', 'PH', '']]))
    expect(r.map(x => [x.row, x.draft?.name])).toEqual([[1, 'Good Friday'], [3, 'Hari Raya Haji']])
  })

  it('a header in another order, with semicolons, is read by its words', () => {
    const r = readHolidaySheet('Name;Kind;From;To\n Vesak Day ;PH;2026-06-01;\n')
    expect(r).toEqual([{ row: 2, name: 'Vesak Day', draft: { kind: 'ph', name: 'Vesak Day', from: '2026-06-01', to: '2026-06-01' } }])
  })

  it('an empty file reads as no rows', () => {
    expect(readHolidaySheet('')).toEqual([])
    expect(readHolidaySheet('﻿' + SHEET_HEAD.join(',') + '\r\n')).toEqual([])
  })
})
