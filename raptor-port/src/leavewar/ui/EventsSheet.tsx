/* THE EVENTS LIST (owner D1500, 29 Oct 26 — "All as recommended"; his D1155: "a list view to be able to see all the
   Squadron events and to add the type of events"). Opened by Events… in ⚙ Settings, an admin's only (Matrix mounts it
   for an admin, as ⚙ Settings).
   AS REDRAWN AND APPROVED ON 29 OCT 26 (his D1512–D1516; the drawing of record is the F- frames of
   scripts/handpass/mock-events-split.mjs — its comment block names each value used here):
   - the Settings window's own frame and title bar, "EVENTS" and the period in View; "＋ Event" (the Settings window's own
     ＋ button) at the left, "Edit presets" (the Event window's own button) at the right;
   - TWO LISTS (D1514, D1516): Squadron events first — every kind but a public holiday or an Off day, and events with no
     kind — then Holidays (public holidays and Off days); on a desktop the two side by side in a window twice as wide, on a
     phone (the Leave War's phone, ui/phone.ts — where the window is a full page, D1511) one under the other. Each is
     headed with the Settings window's own section heading (`.gs-sec`, as "Groups") and its count; an empty one keeps its
     heading, 0, and one line saying so (D1515 fix 6);
   - each event one line, by date, several days one line (engine/eventlist.ts), drawn as a line of the Calendar window's
     Holidays list (`.hol-line`): its date or run, its full name, then its KIND IN ONE COLUMN (D1513 — the square and word
     a tap on a filled event cell already shows, `.evpeek-kind`; the column as wide as its longest word, empty on a line
     with no kind), then its own EDIT and DELETE (D1512): the app's one pencil (D1134), which opens the event's window as a
     tap on the line does, and the Leave War's red cross (D676), which ASKS ONCE (D1516): its first press arms it IN PLACE —
     its box keeps its size and place, filled red, and the kind's column reads "Delete — sure?" (D1515 fixes 1 and 4) — and
     a second press deletes; any other press takes the question back. After a delete a note at the foot names it, with
     Undo (fix 2) — the top bar's own Undo, one step. The two buttons are 14px apart, each a 40px tap area round its drawn
     22px box, their edges lighter (fix 3);
   - the date column as wide as the widest date the app can write, plus 12px (fix 5): measured in the line's own letters,
     so on his iPhone it is measured in its letters too;
   - a past event (its last day before the app's today) greyed; a new one ringed in its own list and brought into view.
   It keeps nothing of the events: it re-reads the store on every paint (an Undo, a change on the grid). */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { EVENT_KIND_WORDS, eventLines, memberToday, type EventLine, type EventKind } from '../engine'
import { deleteEvent, getState, saveEvent } from '../state/store'
import { isLwOnScreen, subLwScreen } from '../state/screen'
import { PenIcon } from '../../ui/icons'
import { globalUndoEngine } from '../../ui/topbits'
import { Sheet } from './Sheet'
import { usePhone } from './phone'
import { useVersion } from './useStore'
import './bidpicker.css'

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "Thu 1 Jan" — the Holidays list's own date voice (ui/daysfmt.ts sayDate) */
const sayD = (d: Date): string => `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`
const say = (iso: string): string => sayD(new Date(iso + 'T00:00:00Z'))
/** a run as the Holidays list says it: "Mon 9 – Fri 13 Feb" inside one month, "Thu 31 Dec – Fri 1 Jan" across two */
const whenSaid = (from: string, to: string): string => {
  if (to <= from) return say(from)
  return from.slice(0, 7) === to.slice(0, 7) ? `${say(from).replace(/ [A-Za-z]+$/, '')} – ${say(to)}` : `${say(from)} – ${say(to)}`
}

/** The widest date the list can write (the design review's fix 5, his question "even with the longest date it will not
 *  touch the name?"), as the drawing found it: every run of up to 60 days from 1 Jan of `year` to the end of the year
 *  after, written as the list writes it, the widest by `width`. Each letter is measured once and a run's width taken as
 *  the sum of its letters', so the 44,000 runs cost no more than adding; the caller measures the winner whole. */
function widestWhen(year: number, width: (s: string) => number): string {
  const ch = new Map<string, number>()
  const w = (s: string) => { let n = 0; for (const c of s) { let v = ch.get(c); if (v === undefined) { v = width(c); ch.set(c, v) } n += v } return n }
  const sameMonth = (a: Date, b: Date) => a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear()
  let best = '', bw = -1
  for (let t = Date.UTC(year, 0, 1), end = Date.UTC(year + 2, 0, 1); t < end; t += 864e5) {
    const a = new Date(t)
    for (let k = 0; k <= 60; k++) {
      const b = new Date(t + k * 864e5)
      const s = k === 0 ? sayD(a) : sameMonth(a, b) ? `${sayD(a).replace(/ [A-Za-z]+$/, '')} – ${sayD(b)}` : `${sayD(a)} – ${sayD(b)}`
      const v = w(s)
      if (v > bw) { bw = v; best = s }
    }
  }
  return best
}

/** The two lists: a public holiday or an Off day is a holiday; every other kind, and an event with no kind, a squadron
 *  event (D1514) */
const isHoliday = (k: EventKind | null) => k === 'off' || k === 'free'
type Part = 'squadron' | 'holidays'
const PARTS: { key: Part; word: string; none: string }[] = [
  { key: 'squadron', word: 'Squadron events', none: 'squadron events' },
  { key: 'holidays', word: 'Holidays', none: 'holidays' },
]
const SURE = 'Delete — sure?'
/* the widest date, once for each letters and year */
const WIDEST = new Map<string, string>()
/* the note after a delete stays as the app's other offer with a button does ("Set as default", SecDefaultSnackbar.tsx) */
const NOTE_MS = 7000

/** Delete one line of the list as the event's own window deletes it (EventSheet.tsx `del`): a run of one word over several
 *  days (no merged band) every day of it, in one command; a band, or one day, through deleteEvent. One Undo step each. */
function deleteLine(l: EventLine): boolean {
  const band = getState().period.bands.some(b => b.line === l.line && b.from <= l.from && l.from <= b.to)
  if (l.to > l.from && !band) return saveEvent({ line: l.line, date: l.from, scope: 'repeat', from: l.from, to: l.to, text: '', kind: null }).ok
  return deleteEvent(l.line, l.from)
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
  const phone = usePhone()
  const listRef = useRef<HTMLDivElement>(null)
  /* the line whose ✕ was pressed once and now asks (D1516) */
  const [armed, setArmed] = useState<string | null>(null)
  /* the note after a delete: the event's name and line, whether the keyboard was on its ✕, and a count so a second delete
     restarts the clock */
  const [gone, setGone] = useState<{ name: string; key: string; kb: boolean; n: number } | null>(null)
  const undoRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!fresh) return
    const el = listRef.current?.querySelector(`[data-testid="evline-${fresh}"]`) as HTMLElement | null
    el?.scrollIntoView?.({ block: 'nearest' })
  }, [fresh])
  /* ANY OTHER PRESS TAKES THE QUESTION BACK — anywhere but the asking ✕ itself, a press on another line's ✕ moving it there
     (its own press arms it after this has cleared the first) — so a second press never lands on a question nobody
     remembers asking */
  useEffect(() => {
    if (!armed) return
    const down = (e: PointerEvent) => {
      const t = e.target as Element | null
      if (t?.closest?.(`[data-testid="evdel-${armed}"]`)) return
      setArmed(null)
    }
    document.addEventListener('pointerdown', down, true)
    return () => document.removeEventListener('pointerdown', down, true)
  }, [armed])
  /* …and when the Leave War leaves the screen: the page is kept mounted, so the question could wait across a page switch
     for a press from someone who no longer knows it was the second ([LW-ARMS-PAGE-LEAVE-REST]) */
  useEffect(() => subLwScreen(() => { if (!isLwOnScreen()) { setArmed(null); setGone(null) } }), [])
  /* THE KEYBOARD AFTER A DELETE (the fresh code read's R2, 29 Oct 26): the ✕ it was on goes with its line, so it is put on
     the note's Undo — which it could not otherwise reach, the window holding Tab inside itself — and when the note goes by
     itself, back into the window */
  useEffect(() => {
    if (!gone) return
    if (gone.kb) undoRef.current?.focus()
    const t = setTimeout(() => {
      if (document.activeElement === undoRef.current) (document.querySelector('[data-testid="events-add"]') as HTMLElement | null)?.focus()
      setGone(null)
    }, NOTE_MS)
    return () => clearTimeout(t)
  }, [gone])

  const { period, eventRows, eventDefs } = getState()
  const lines = eventLines(period, eventRows, eventDefs, memberToday())
  const byPart: Record<Part, EventLine[]> = { squadron: [], holidays: [] }
  for (const l of lines) byPart[isHoliday(l.kind) ? 'holidays' : 'squadron'].push(l)

  /* THE TWO COLUMNS' WIDTHS, measured in the line's own letters (a phone's are wider than a PC's): the kind's — its widest
     word, or "Delete — sure?" asking, so the buttons after it never move (D1513, fix 1) — and, on a desktop where the date
     stands beside the name, the date's (fix 5). Where nothing can be measured (no line yet, a browser with no canvas) the
     stylesheet's own widths stand. */
  const [cols, setCols] = useState<{ kw?: number; dw?: number }>({})
  const hasLines = lines.length > 0
  useLayoutEffect(() => {
    const root = listRef.current
    const when = root?.querySelector('.ev-line .hol-when') as HTMLElement | null
    const kind = root?.querySelector('.ev-line .ev-kind') as HTMLElement | null
    /* (nothing laid out — a browser without layout, as the unit tests' — measures nothing) */
    if (!when || !kind || !when.getBoundingClientRect().width) return
    const cv = document.createElement('canvas').getContext('2d')
    if (!cv) return
    const fontOf = (e: HTMLElement, weight?: string) => { const s = getComputedStyle(e); return `${s.fontStyle} ${weight ?? s.fontWeight} ${s.fontSize} ${s.fontFamily}` }
    const measure = (font: string, s: string) => { cv.font = font; return cv.measureText(s).width }
    const kf = fontOf(kind, '400')
    /* the square and its gap before the word (matrix.css .evpeek-kind: 9px and 6px) */
    const kw = Math.ceil(Math.max(...Object.values(EVENT_KIND_WORDS).map(w => measure(kf, w) + 15), measure(fontOf(kind, '700'), SURE)))
    let dw: number | undefined
    if (!phone) {
      const df = fontOf(when)
      /* worked out once for each letters and year (about 35 ms — the read's R4): the list opens again each time an event
         opened from it closes */
      const ck = `${df}|${period.start.slice(0, 4)}`
      let widest = WIDEST.get(ck)
      if (widest === undefined) { widest = widestWhen(Number(period.start.slice(0, 4)), c => measure(df, c)); WIDEST.set(ck, widest) }
      dw = Math.ceil(measure(df, widest)) + 12
    }
    setCols(c => (c.kw === kw && c.dw === dw ? c : { kw, dw }))
  }, [phone, hasLines, period.start])
  const vars = { ...(cols.kw ? { '--ev-kw': `${cols.kw}px` } : {}), ...(cols.dw ? { '--ev-dw': `${cols.dw}px` } : {}) } as CSSProperties

  const armedLine = armed ? lines.find(l => `${l.line}-${l.from}` === armed) : undefined
  const saidNow = armedLine ? `Delete ${armedLine.text}, ${whenSaid(armedLine.from, armedLine.to)}? Press again to delete.` : ''
  /* Escape on the note closes the note only (the window's own Escape leaves it to the note), the keyboard back in the window */
  const noteKey = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Escape') return
    e.stopPropagation()
    setGone(null)
    ;(document.querySelector('[data-testid="events-add"]') as HTMLElement | null)?.focus()
  }
  const pressX = (key: string, l: EventLine) => {
    if (armed !== key) { setArmed(key); return }
    setArmed(null)
    const kb = document.activeElement instanceof HTMLElement && document.activeElement.dataset.testid === `evdel-${key}`
    if (deleteLine(l)) setGone(g => ({ name: l.text, key, kb, n: (g?.n ?? 0) + 1 }))
  }
  /* Undo, and the keyboard back on the line it brought back (its ✕), else on the window's first button */
  const undo = () => {
    const key = gone?.key, kb = document.activeElement === undoRef.current
    setGone(null)
    globalUndoEngine().undo()
    if (kb) setTimeout(() => ((document.querySelector(`[data-testid="evdel-${key}"]`) ?? document.querySelector('[data-testid="events-add"]')) as HTMLElement | null)?.focus(), 0)
  }

  const line = (l: EventLine) => {
    const key = `${l.line}-${l.from}`
    const sure = armed === key
    /* its date in each button's name too, so two events of one name are told apart when read aloud (the read's R5) */
    const when = whenSaid(l.from, l.to)
    return (
      <div
        key={key}
        className={'hol-line ev-line' + (l.past ? ' is-past' : '') + (fresh === key ? ' innew' : '')}
        data-testid={`evline-${key}`}
        onClick={() => onOpenEvent(l)}
      >
        <span className="ev-tx">
          <span className="hol-when">{when}</span>
          <span className="hol-name">{l.text}</span>
        </span>
        <span className={`evpeek-kind ev-kind ${sure ? 'sure' : (l.kind ?? 'none')}`} data-testid={`evkind-${key}`}>
          {sure ? SURE : (l.kind ? EVENT_KIND_WORDS[l.kind] : '')}
        </span>
        <span className="ev-ctls">
          <button type="button" className="ev-ctl ev-pen" data-testid={`evedit-${key}`} aria-label={`Edit ${l.text}, ${when}`} title="Edit"
            onClick={e => { e.stopPropagation(); onOpenEvent(l) }}><PenIcon solo /></button>
          <button type="button" className={'ev-ctl ev-x' + (sure ? ' arm' : '')} data-testid={`evdel-${key}`}
            aria-label={sure ? `Delete ${l.text}, ${when} — press again to delete` : `Delete ${l.text}, ${when}`} title={sure ? 'Press again to delete' : 'Delete'}
            onClick={e => { e.stopPropagation(); pressX(key, l) }}
            onBlur={() => { if (sure) setArmed(null) }}>✕</button>
        </span>
      </div>
    )
  }

  /* on a phone a full page from the top, as "Open for bidding" (D1511 — "Events should show at the top") */
  return (
    <>
      <Sheet testid="events-sheet" label="Events" onClose={onClose} page>
        <div className="bidsheet-hd">
          <span className="who">EVENTS</span>
          <span className="dt" data-testid="events-period">{period.name}</span>
          <button className="x" data-testid="events-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="bidsheet-row ev-top">
          <button className="rtbtn" data-testid="events-add" title="Add an event — pick its day or days" onClick={onAdd}>＋ Event</button>
          <button className="evtypes-open" data-testid="events-presets" onClick={onPresets}>Edit presets</button>
        </div>
        {/* THE QUESTION SAID ALOUD (the read's R5): one polite region for the window, which speaks the asking only — a region on
            each line's kind also spoke the kind's word when the question was taken back (the fix's narrow read) */}
        <span className="ev-said" data-testid="events-said" aria-live="polite">{saidNow}</span>
        <div className="ev-split" data-testid="events-list" ref={listRef} style={vars}>
          {PARTS.map(p => (
            <section key={p.key} className="ev-col" data-testid={`events-sec-${p.key}`} aria-label={p.word}>
              <div className="gs-sec ev-sec" data-testid={`events-head-${p.key}`}>{p.word} · {byPart[p.key].length}</div>
              {byPart[p.key].length
                ? <div className="hol-list ev-list">{byPart[p.key].map(line)}</div>
                : <p className="hol-empty ev-empty" data-testid={`events-empty-${p.key}`}>No {p.none} in {period.name}.</p>}
            </section>
          ))}
        </div>
      </Sheet>
      {gone && (
        <div key={gone.n} className="secdef-snack ev-undo sheet-part" role="status" data-testid="events-undo-note" onKeyDown={noteKey}>
          <span className="secdef-msg">{gone.name} deleted</span>
          <button ref={undoRef} type="button" className="secdef-btn yes" data-testid="events-undo" onClick={undo}>Undo</button>
        </div>
      )}
    </>
  )
}
