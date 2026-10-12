/* THE APP'S OWN DATE BOX — a date that is one box among others on a form ([ONE-DATE-CALENDAR] step one; the design of
   record docs/superpowers/specs/2026-10-13-one-date-calendar.md §Where it sits).

   Owner, D786 (13 Oct 26): "the from date box is too wide and it doesn't fit the phone screen width". The box was the
   phone's own date box: an iPhone gives that box a width of its own, which no stylesheet rule and no Windows browser
   could hold or even reproduce — so NOTHING of the phone's own is left in a date box. That is the fit. D795: "the app's
   own field". D797: one box among others opens the calendar OVER its form — "a tap picks and it goes; a tap outside
   closes it and changes nothing"; "on a desktop a small panel right under the box, on a phone the centred card".

   THE BOX is a button that reads its date in words ("Thu 5 Nov 2026"; "Pick a date" when it has none). It hands its
   form the same "yyyy-mm-dd" string the phone's box did, and only ever a real date: there is no way to empty it (D796 —
   no Reset), so a form that must be able to go without a date offers that choice itself ("No end").

   THE CALENDAR (ui/DateCal.tsx) FLOATS ON THE PAGE ITSELF — a layer on `document.body`, above every window and sheet a
   date box can stand in (the windows shell, the Admin page, the Leave War's sheets, an input's own window). Inside its
   form it would be cut by the form's own scrolling and trapped under whatever that form sits beneath; on the page it is
   one look everywhere, the Leave War included (whose own stylesheet is scoped to its page and so never reaches it).
   The layer is a veil over the whole screen with the card on it:
     · a tap on a date picks, and the layer goes;
     · a tap on the veil closes it and changes nothing. It closes on the CLICK, not the press: a layer that went at the
       press would hand the click that follows to whatever of the form lies under the finger (ui/calpick.ts met this);
     · Escape closes it FIRST, and the window behind only on a second press — the key is taken on the way DOWN, before
       any window's own listener hears it, and only while the layer is up;
     · the keyboard goes onto the picked date as it opens, stays inside it (Tab goes round), and returns to the box;
     · nothing pressed or typed in it is heard by the form behind (React hands a portal's events to the form that drew
       it — a press in the calendar must never count as a press on that form's row or label).
   ON A PHONE the card sits in the middle of the screen (the stylesheet's); on a desktop it is placed under its box —
   above it where there is no room beneath — and kept on the screen, following the box if the page moves.

   Its look: ui/scheduler/26-date-calendar.css. */
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type SyntheticEvent } from 'react'
import { createPortal } from 'react-dom'
import { DateCal } from './DateCal'
import { phoneLayout } from './floatwin'
import { sayDateY } from './daysfmt'
import { validIso } from '../state/flyplan-model'

const GAP = 6
const EDGE = 8

export function DateBox(p: {
  /** what the date is — the name a screen reader says before the date ("From: Thu 5 Nov 2026") */
  label: string
  /** the date held, "yyyy-mm-dd"; "" for none */
  value: string
  /** a date was picked — always a real date, and only when it differs from the one held */
  onChange: (iso: string) => void
  id?: string
  testid?: string
  /** the look of the form it stands in, beside `datebox` */
  className?: string
  /** the first date that may be picked */
  min?: string
  /** a weekday that stands out on the calendar (0 = Monday) */
  markWd?: number
  /** the month an empty box opens on — a date in it */
  at?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLButtonElement>(null)
  const has = validIso(p.value)
  const close = () => {
    setOpen(false)
    const b = box.current
    const at = document.activeElement
    /* the keyboard returns to the box — unless he has already put it somewhere else on the page */
    if (b && (!at || at === document.body || !!(at as HTMLElement).closest?.('.dcal-layer'))) b.focus({ preventScroll: true })
  }
  return (
    <>
      <button
        type="button"
        ref={box}
        id={p.id}
        className={'datebox' + (p.className ? ' ' + p.className : '') + (has ? '' : ' is-empty') + (open ? ' is-open' : '')}
        data-testid={p.testid}
        data-value={has ? p.value : ''}
        aria-label={`${p.label}: ${has ? sayDateY(p.value) : 'no date picked'}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={p.disabled}
        onClick={() => { if (open) close(); else setOpen(true) }}
      >
        <span className="datebox-txt">{has ? sayDateY(p.value) : 'Pick a date'}</span>
        <span className="datebox-v" aria-hidden="true">&#9662;</span>
      </button>
      {open && !p.disabled && createPortal(
        <Layer
          label={p.label} value={has ? p.value : ''} min={p.min} markWd={p.markWd}
          at={p.at || (validIso(p.min) ? p.min : undefined)} box={box.current}
          onPick={iso => { close(); if (iso !== p.value) p.onChange(iso) }}
          onClose={close}
        />, document.body)}
    </>
  )
}

function Layer({ label, value, min, markWd, at, box, onPick, onClose }: {
  label: string; value: string; min?: string; markWd?: number; at?: string
  box: HTMLElement | null
  onPick: (iso: string) => void
  onClose: () => void
}) {
  const card = useRef<HTMLDivElement>(null)
  const phone = phoneLayout()
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  /* ESCAPE IS THE CALENDAR'S WHILE IT IS UP — heard on the way down, at the window, so the form's window behind (the
     windows shell listens at the window too, on the way back up) never hears this press and stays open */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault(); e.stopPropagation()
      closeRef.current()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  /* the keyboard goes onto the calendar's one tab stop — the picked date, or today */
  useLayoutEffect(() => {
    const n = card.current
    const to = n && (n.querySelector<HTMLElement>('.dcal-grid button[tabindex="0"]') || n.querySelector<HTMLElement>('button'))
    if (to) to.focus({ preventScroll: true })
  }, [])

  /* A DESKTOP: under its box, above it where there is no room beneath, and always on the screen. The page behind can
     still move (a wheel over the veil scrolls it), so the card follows its box. A phone's card is the stylesheet's. */
  useLayoutEffect(() => {
    const n = card.current
    if (!n || phone) return
    let raf = 0
    const place = () => {
      raf = 0
      if (!box || !box.isConnected) return
      const r = box.getBoundingClientRect()
      const w = n.offsetWidth, h = n.offsetHeight
      const vw = window.innerWidth, vh = window.innerHeight
      const below = r.bottom + GAP, above = r.top - GAP - h
      const top = below + h <= vh - EDGE ? below : above >= EDGE ? above : Math.max(EDGE, vh - EDGE - h)
      n.style.left = Math.max(EDGE, Math.min(r.left, vw - EDGE - w)) + 'px'
      n.style.top = top + 'px'
    }
    const later = () => { if (!raf) raf = requestAnimationFrame(place) }
    place()
    window.addEventListener('resize', later)
    window.addEventListener('scroll', later, true)
    return () => { if (raf) cancelAnimationFrame(raf); window.removeEventListener('resize', later); window.removeEventListener('scroll', later, true) }
  }, [box, phone])

  /* Tab goes round inside the card: the veil has taken the page away, so there is nowhere else for it to go */
  const onKey = (e: KeyboardEvent) => {
    e.stopPropagation()
    if (e.key !== 'Tab') return
    const n = card.current
    if (!n) return
    const stops = [...n.querySelectorAll<HTMLElement>('button, [tabindex]')].filter(x => !(x as HTMLButtonElement).disabled && x.tabIndex >= 0)
    if (!stops.length) return
    const i = stops.indexOf(document.activeElement as HTMLElement)
    e.preventDefault()
    stops[(i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length].focus({ preventScroll: true })
  }
  /* nothing done in the layer is the form's behind it */
  const mine = (e: SyntheticEvent) => e.stopPropagation()

  return (
    <div className={'dcal-layer' + (phone ? ' is-phone' : '')} onClick={mine} onPointerDown={mine} onMouseDown={mine} onKeyDown={onKey}>
      <div className="dcal-scrim" data-testid="dcal-scrim" onClick={onClose} />
      <div className="dcal-card" ref={card} role="dialog" aria-modal="true" aria-label={`${label} — pick a date`} data-testid="dcal-card">
        <DateCal value={value} min={min} markWd={markWd} at={at} onPick={onPick} />
      </div>
    </div>
  )
}
