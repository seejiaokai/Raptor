/* THE EVENTS LIST (owner D1500, 29 Oct 26 — "All as recommended"; his D1155: "a list view to be able to see all the
   Squadron events and to add the type of events"). Opened by Events… in ⚙ Settings. Built as drawn in M5b round 1
   (docs/mock/lw-overhaul/full/m5b/m5b-d2-events-*, made by full-m5b-draw.mjs — its EVENTS_T and EV_CSS are this
   window's markup and spacing):
   - the Settings window's own frame and title bar, "EVENTS" and the period in View;
   - "＋ Event" (the Settings window's own ＋ button) at the left, "Edit presets" (the Event window's own button) at the
     right — no filter chips;
   - the Event rows' events over the period in View, one line each by date, several days one line (engine/eventlist.ts),
     each drawn as a line of the Calendar window's Holidays list (`.hol-line`: its date or run, its full name) with its
     kind's mark — the square and word a tap on a filled event cell already shows (`.evpeek-kind`); an event with no kind
     shows none; one whose last day is before the app's today greyed (`is-past`).
   A tap on a line opens that event's own window (EventSheet), "＋ Event" a new one with nothing picked, "Edit presets"
   that window's presets; Matrix keeps this list open behind them and shows it again when they close. It keeps nothing:
   it re-reads the store on every paint (an Undo, a change on the grid). Admin only — Matrix mounts it for an admin, as
   ⚙ Settings. */
import { useEffect, useRef } from 'react'
import { EVENT_KIND_WORDS, eventLines, memberToday, type EventLine } from '../engine'
import { getState } from '../state/store'
import { Sheet } from './Sheet'
import { useVersion } from './useStore'
import './bidpicker.css'

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "Thu 1 Jan" — the Holidays list's own date voice (ui/daysfmt.ts sayDate) */
const say = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00Z')
  return `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`
}
/** a run as the Holidays list says it: "Mon 9 – Fri 13 Feb" inside one month, "Thu 31 Dec – Fri 1 Jan" across two */
export const whenSaid = (from: string, to: string): string => {
  if (to <= from) return say(from)
  return from.slice(0, 7) === to.slice(0, 7) ? `${say(from).replace(/ [A-Za-z]+$/, '')} – ${say(to)}` : `${say(from)} – ${say(to)}`
}

export function EventsSheet({ onClose, onOpenEvent, onAdd, onPresets, fresh }: {
  onClose: () => void
  /** open this event's own window (EventSheet on its row and first day) */
  onOpenEvent: (l: EventLine) => void
  /** open a new event's window, nothing picked */
  onAdd: () => void
  /** open the Event window's presets */
  onPresets: () => void
  /** the line a new event was just saved as (`<row>-<first day>`): ringed with the app's just-added mark and brought into
   *  view (D850, D860 — the walk's F3: on a phone it sat at the list's cut-off foot, unmarked) */
  fresh?: string | null
}) {
  useVersion()
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!fresh) return
    const el = listRef.current?.querySelector(`[data-testid="evline-${fresh}"]`) as HTMLElement | null
    el?.scrollIntoView?.({ block: 'nearest' })
  }, [fresh])
  const { period, eventRows, eventDefs } = getState()
  const lines = eventLines(period, eventRows, eventDefs, memberToday())
  return (
    <Sheet testid="events-sheet" label="Events" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">EVENTS</span>
        <span className="dt" data-testid="events-period">{period.name}</span>
        <button className="x" data-testid="events-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="bidsheet-row ev-top">
        <button className="rtbtn" data-testid="events-add" title="Add an event — pick its day or days" onClick={onAdd}>＋ Event</button>
        <button className="evtypes-open" data-testid="events-presets" onClick={onPresets}>Edit presets</button>
      </div>
      {lines.length === 0
        ? <p className="hol-empty ev-empty" data-testid="events-empty">No events in {period.name}.</p>
        : (
          <div className="hol-list ev-list" data-testid="events-list" ref={listRef}>
            {lines.map(l => (
              <button
                key={`${l.line}-${l.from}`}
                type="button"
                className={'hol-line' + (l.past ? ' is-past' : '') + (fresh === `${l.line}-${l.from}` ? ' innew' : '')}
                data-testid={`evline-${l.line}-${l.from}`}
                aria-label={`Open: ${l.text}, ${whenSaid(l.from, l.to)}${l.kind ? ', ' + EVENT_KIND_WORDS[l.kind] : ''}`}
                onClick={() => onOpenEvent(l)}
              >
                <span className="hol-when">{whenSaid(l.from, l.to)}</span>
                <span className="hol-name">{l.text}</span>
                {l.kind && <span className={`evpeek-kind ${l.kind}`}>{EVENT_KIND_WORDS[l.kind]}</span>}
              </button>
            ))}
          </div>
        )}
    </Sheet>
  )
}
