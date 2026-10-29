/* THE EVENTS LIST'S LINES (owner D1500, 29 Oct 26 — "All as recommended": the Event rows' events over the period in
   View, one line each by date, several days one line, its kind's mark, past ones greyed). Pure — the list window
   (ui/EventsSheet.tsx) draws what this returns.

   ONE EVENT, ONE LINE, as the grid shows it: a merged band (`period.bands`) is one line; a word written into each day
   (`day.events[line]`) is one line for every run of next-door days on one row that carry the same word, the same own
   tag and the same short form — the drawing read the grid's runs the same way (full-m5b-draw.mjs `readEvents`). A word
   under a band is not listed (the grid draws the band over it). Only the Event rows in use (`rows`) are read, as the
   grid draws only those.

   ITS KIND is the event's own tag, else the kind of the preset its word matches (`classifyEvent`) — the fold the grid's
   colour and the event peek already use, so the list never names a kind the grid does not show. */
import { classifyEvent, type EventDef, type EventKind } from './eventdefs'
import { bandAt, dayEventKind, dayEventShort, type Period } from './period'

export interface EventLine {
  /** the Event row (0-based) it is on */
  line: number
  from: string
  to: string
  /** its full name, as the event peek shows it */
  text: string
  kind: EventKind | null
  /** its last day is before today */
  past: boolean
}

const nextDay = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10)
}

export function eventLines(period: Period, rows: number, defs: EventDef[], today: string): EventLine[] {
  const out: EventLine[] = []
  for (const b of period.bands) {
    if (b.line < 0 || b.line >= rows || !b.text) continue
    out.push({ line: b.line, from: b.from, to: b.to, text: b.text, kind: b.kind ?? classifyEvent(defs, b.text), past: b.to < today })
  }
  /* the day words, row by row, each run of next-door days with one word, tag and short form */
  const days = [...period.days].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  for (let line = 0; line < rows; line++) {
    let run: (EventLine & { own: EventKind | null; short: string | null }) | null = null
    const close = () => { if (run) { const { own: _o, short: _s, ...l } = run; out.push(l) } run = null }
    for (const d of days) {
      const text = d.events[line] ?? ''
      if (!text || bandAt(period.bands, line, d.date)) { close(); continue }
      const own = dayEventKind(d, line), short = dayEventShort(d, line)
      if (run && run.text === text && run.own === own && run.short === short && nextDay(run.to) === d.date) {
        run.to = d.date
        continue
      }
      close()
      run = { line, from: d.date, to: d.date, text, kind: own ?? classifyEvent(defs, text), past: false, own, short }
    }
    close()
  }
  for (const l of out) l.past = l.to < today
  return out.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : a.line - b.line))
}
