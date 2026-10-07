// A PUBLIC HOLIDAY OR AN OFF DAY, WRITTEN AS THE WAR'S OWN RECORD — the pure half of the Holidays list's three writers
// (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4; owner D631, D638).
//
// A public holiday and an Off day each have TWO DOORS onto ONE record (D638): the Leave War's Event row, and the
// Holidays list in Days. There is no second record: a holiday IS a day event carrying a kind tag (`off` = public
// holiday, `free` = Off day), or a merged band of them over a run of dates — exactly what the Event sheet writes. So
// the list's writers are these three small transformations of a Period, and the store wraps each in one named command
// (state/store.ts holidayAdd / holidayChange / holidayRemove).
//
// - `freeEventLine` — the first Event row with nothing on it across the WHOLE range (a day's own text, or a band).
// - `withHoliday`   — one day is that day's tagged event; a run is ONE merged band. The kind rides the event itself
//                     (its instance tag), so a name of the squadron's own ("National Day") needs no matching type.
// - `withoutHoliday`— takes away the record a list line stands for, and ONLY while it is still what the line said: a
//                     line read a moment ago may have been changed since on the Leave War, and removing "whatever is
//                     there now" would delete somebody's SC week. Null = no longer there.
// A seeded holiday flag (`DayInfo.ph`, written by nothing but the seed) goes with the public holiday on its day:
// otherwise the removed holiday would come straight back in the list as a bare "PH".

import { defKey, type EventKind } from './eventdefs'
import { normShort } from './eventshort'
import { writeDayEvent, type Period } from './period'

export type HolidayKind = 'ph' | 'off'
/** what the list's form holds: the kind, a name (empty = the kind's usual word), the first and last day */
export interface HolidayDraft {
  kind: HolidayKind; name: string; from: string; to: string
  /** what the calendars and the grid print for it ("On grid" — the build plan §3.12, D652); absent = none of its own */
  short?: string
}
/** the record a list line stands for, as it was read (sync.ts holidaysIn) */
export interface HolidayRef {
  warId: string
  /** a day's own Event line (one day, or the same word repeated over a run), a merged band, or the seeded flag alone */
  src: 'day' | 'band' | 'flag'
  /** its Event row; null for a flag */
  line: number | null
  from: string
  to: string
  kind: HolidayKind
  name: string
  /** what it prints — its own short form, else its preset's, else one derived from its name (eventdefs.ts shortOf);
   *  filled by the reader (sync.ts holidaysIn), never matched on by the writers */
  short?: string
}
export const MAX_HOLIDAY_NAME = 40
export const holidayEventKind = (k: HolidayKind): EventKind => (k === 'ph' ? 'off' : 'free')

/** a real calendar date written yyyy-mm-dd (2026-02-30 is not one) — through UTC, as every date here */
export function validDate(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const d = new Date(Date.UTC(+v.slice(0, 4), +v.slice(5, 7) - 1, +v.slice(8, 10)))
  return d.toISOString().slice(0, 10) === v
}

/** the first Event row (of `rows`) free on every date of the range, or -1 */
export function freeEventLine(p: Period, rows: number, from: string, to: string): number {
  for (let line = 0; line < rows; line++) {
    if (p.bands.some(b => b.line === line && b.from <= to && from <= b.to)) continue
    if (p.days.some(d => d.date >= from && d.date <= to && !!d.events[line])) continue
    return line
  }
  return -1
}

/** the period with the holiday written on `line` — which the caller found free across the range */
export function withHoliday(p: Period, line: number, h: HolidayDraft): Period {
  const kind = holidayEventKind(h.kind)
  /* text, kind and short form are written together (the build plan §3.12) */
  const short = normShort(h.short)
  if (h.from === h.to) return { ...p, days: p.days.map(d => (d.date === h.from ? writeDayEvent(d, line, h.name, kind, short) : d)) }
  return { ...p, bands: [...p.bands, { line, from: h.from, to: h.to, text: h.name, kind, ...(short ? { short } : {}) }] }
}

/** the period with that record taken away — null where it is no longer what the line said */
export function withoutHoliday(p: Period, ref: HolidayRef): Period | null {
  const inRun = (date: string) => date >= ref.from && date <= ref.to
  /* the seeded flag under a public holiday goes with it */
  const unflag = ref.kind === 'ph'
  if (ref.src === 'band') {
    const band = p.bands.find(b => b.line === ref.line && b.from === ref.from && b.to === ref.to && defKey(b.text) === defKey(ref.name))
    if (!band) return null
    return {
      ...p,
      bands: p.bands.filter(b => b !== band),
      days: unflag && p.days.some(d => inRun(d.date) && d.ph) ? p.days.map(d => (inRun(d.date) && d.ph ? { ...d, ph: false } : d)) : p.days,
    }
  }
  if (ref.src === 'day') {
    const line = ref.line
    if (line == null) return null
    let hit = false
    const days = p.days.map(d => {
      const t = d.events[line]
      if (!inRun(d.date) || !t || defKey(t) !== defKey(ref.name)) return d
      hit = true
      const out = writeDayEvent(d, line, '', null)
      return unflag && out.ph ? { ...out, ph: false } : out
    })
    return hit ? { ...p, days } : null
  }
  let hit = false
  const days = p.days.map(d => {
    if (!inRun(d.date) || !d.ph) return d
    hit = true
    return { ...d, ph: false }
  })
  return hit ? { ...p, days } : null
}
