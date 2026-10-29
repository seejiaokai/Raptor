/* THE EVENTS LIST'S LINES (owner D1500, 29 Oct 26 — "All as recommended"; the drawing m5b-d2-events-*): the Event rows'
   events over the period in View, one line each by date — a merged band one line, a word repeated on next-door days on
   one row one line (as a band is one event) — its kind the event's own tag, else its word's preset (the fold the grid's
   colour and the event peek use); past ones by the app's today. */
import { describe, expect, it } from 'vitest'
import { eventLines } from './eventlist'
import type { EventDef } from './eventdefs'

const DEFS: EventDef[] = [
  { name: 'PH', kind: 'off' }, { name: 'Off day', kind: 'free' }, { name: 'No Leave', kind: 'nolv' }, { name: 'SC', kind: 'work' },
] as EventDef[]
const day = (date: string, events: string[] = [], kinds?: (string | null)[]) =>
  ({ date, events, blocked: false, blockedReason: '', ph: false, ...(kinds ? { eventKinds: kinds } : {}) })
const days = (from: string, n: number) => Array.from({ length: n }, (_, i) => {
  const d = new Date(from + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + i); return day(d.toISOString().slice(0, 10))
})
const period = (patch: (ds: any[]) => void, bands: any[] = []) => {
  const ds = days('2026-01-01', 365); patch(ds)
  return { id: 'w', name: 'JAN – DEC 26', start: '2026-01-01', end: '2026-12-31', open: [], days: ds, bands } as any
}
const at = (ds: any[], date: string) => ds.find(d => d.date === date)

describe('eventLines (D1500)', () => {
  it('a word on one day is one line; its kind comes from its preset', () => {
    const p = period(ds => { at(ds, '2026-01-01').events = ['PH'] })
    expect(eventLines(p, 2, DEFS, '2026-01-08')).toEqual([
      { line: 0, from: '2026-01-01', to: '2026-01-01', text: 'PH', kind: 'off', past: true },
    ])
  })

  it('a word repeated on next-door days on one row is one line; a gap starts a new one', () => {
    const p = period(ds => {
      for (const d of ['2026-02-09', '2026-02-10', '2026-02-11']) at(ds, d).events = ['EX SHIELD']
      at(ds, '2026-02-13').events = ['EX SHIELD']
    })
    expect(eventLines(p, 2, DEFS, '2026-01-08').map(l => [l.from, l.to, l.kind])).toEqual([
      ['2026-02-09', '2026-02-11', null], ['2026-02-13', '2026-02-13', null],
    ])
  })

  it('a merged band is one line, with its own tag; a band on the second row keeps its row', () => {
    const p = period(() => {}, [{ line: 1, from: '2026-03-02', to: '2026-03-06', text: 'No Leave', kind: 'nolv' }])
    expect(eventLines(p, 2, DEFS, '2026-01-08')).toEqual([
      { line: 1, from: '2026-03-02', to: '2026-03-06', text: 'No Leave', kind: 'nolv', past: false },
    ])
  })

  it("an event's own tag wins over its word's preset, and the same word with another tag is another event", () => {
    const p = period(ds => {
      at(ds, '2026-01-20').events = ['PH']; at(ds, '2026-01-20').eventKinds = ['free']
      at(ds, '2026-01-21').events = ['PH']
    })
    expect(eventLines(p, 2, DEFS, '2026-01-08').map(l => [l.from, l.to, l.kind])).toEqual([
      ['2026-01-20', '2026-01-20', 'free'], ['2026-01-21', '2026-01-21', 'off'],
    ])
  })

  it('sorted by first day, then by row; a row past the rows in use is not listed', () => {
    const p = period(ds => {
      at(ds, '2026-01-23').events = ['', 'Off day']
      at(ds, '2026-01-23').events[2] = 'stray'
      at(ds, '2026-01-05').events = ['SC']
    }, [{ line: 0, from: '2026-01-23', to: '2026-01-24', text: 'EX A', kind: null }])
    expect(eventLines(p, 2, DEFS, '2026-01-08').map(l => [l.from, l.line, l.text])).toEqual([
      ['2026-01-05', 0, 'SC'], ['2026-01-23', 0, 'EX A'], ['2026-01-23', 1, 'Off day'],
    ])
  })

  it('a word under a band is the band, not a line of its own', () => {
    const p = period(ds => { at(ds, '2026-04-02').events = ['old'] }, [{ line: 0, from: '2026-04-01', to: '2026-04-03', text: 'DET', kind: 'work' }])
    expect(eventLines(p, 2, DEFS, '2026-01-08').map(l => l.text)).toEqual(['DET'])
  })

  it('past is by the last day: an event running over today is not past', () => {
    const p = period(ds => { for (const d of ['2026-01-07', '2026-01-08', '2026-01-09']) at(ds, d).events = ['DET'] })
    expect(eventLines(p, 2, DEFS, '2026-01-08')[0]!.past).toBe(false)
    expect(eventLines(p, 2, DEFS, '2026-01-10')[0]!.past).toBe(true)
  })
})
