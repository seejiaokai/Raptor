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
     · Escape closes it FIRST, and the window or sheet behind only on a second press — the key is taken on the way
       DOWN, at the window, before any other listener hears it, and only while the layer is up;
     · the keyboard goes onto the picked date as it opens, stays inside it (Tab goes round — taken at the window too,
       ahead of a Leave War sheet's own Tab-keeper), and returns to the box;
     · nothing pressed or typed in it is heard by the form behind (React hands a portal's events to the form that drew
       it — a press in the calendar must never count as a press on that form's row or label).
   ON A PHONE the card sits in the middle of the screen (the stylesheet's); on a desktop it is placed under its box —
   above it where there is no room beneath — and kept on the screen, following the box if the page moves.

   Its look: ui/scheduler/26-date-calendar.css. */
import { useEffect, useLayoutEffect, useRef, useState, type SyntheticEvent } from 'react'
import { createPortal } from 'react-dom'
import { DateCal } from './DateCal'
import { phoneLayout } from './floatwin'
import { sayDateY } from './daysfmt'
import { validIso } from '../state/flyplan-model'

const GAP = 6
const EDGE = 8
/** the patch that takes a second click: how long it stands, and how wide (a finger's wobble between two taps) */
const SETTLE_MS = 400
const SETTLE_PX = 24

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
  /* THE SAME TAP MADE TWICE DOES NOTHING MORE. The calendar goes at the first click of a double-click, and the second
     fell on whatever of the form lay under that date — Save, a rule's Remove, a leave chip, the shade that closes a
     Leave War sheet (the read of the finished code, 13 Oct 26 — F1). So for a moment after a pick or a tap outside
     MADE BY A POINTER a small see-through patch stands where that click landed and takes the click that may follow
     there: by place AND time, as the Leave War guards its Move button (leavewar/ui/select.ts MOVE_SETTLE — a time
     alone ate deliberate quick clicks elsewhere). It is an element of the layer's own class, on the page itself, so a
     Leave War sheet's tap shield lets it through as it does the calendar. A pick by the keyboard leaves none.
     AND THE TAP THAT OPENS THE CALENDAR LEAVES ONE TOO (the read of the Tracker's date boxes, 13 Oct 26 — F1): on a
     phone the card is put in the middle of the screen, so it can land under the finger that opened it, and the second
     half of a double tap fell on a date — which in the Tracker is saved at once. Where the card is under its box the
     second half fell on the veil and shut the calendar it had just opened. The patch lies OVER the card (its z-index). */
  const [patch, setPatch] = useState<{ x: number; y: number } | null>(null)
  const patchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropPatch = () => { if (patchTimer.current) clearTimeout(patchTimer.current); patchTimer.current = null; setPatch(null) }
  useEffect(() => () => { if (patchTimer.current) clearTimeout(patchTimer.current) }, [])
  /* a box switched off while its calendar is up is closed for good — not left to spring open when it is switched on */
  useEffect(() => { if (p.disabled && open) setOpen(false) }, [p.disabled, open])
  const standPatch = (at: { x: number; y: number }) => {
    if (patchTimer.current) clearTimeout(patchTimer.current)
    setPatch(at)
    patchTimer.current = setTimeout(() => { patchTimer.current = null; setPatch(null) }, SETTLE_MS)
  }
  const close = (at?: { x: number; y: number } | null) => {
    setOpen(false)
    if (at) standPatch(at)
    const b = box.current
    const kb = document.activeElement
    /* the keyboard returns to the box — unless he has already put it somewhere else on the page */
    if (b && (!kb || kb === document.body || !!(kb as HTMLElement).closest?.('.dcal-layer'))) b.focus({ preventScroll: true })
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
        onClick={e => { if (open) close(); else { setOpen(true); if (e.detail > 0) standPatch({ x: e.clientX, y: e.clientY }); else dropPatch() } }}
      >
        <span className="datebox-txt">{has ? sayDateY(p.value) : 'Pick a date'}</span>
        <span className="datebox-v" aria-hidden="true">&#9662;</span>
      </button>
      {open && !p.disabled && createPortal(
        <Layer
          label={p.label} value={has ? p.value : ''} min={p.min} markWd={p.markWd}
          at={p.at || (validIso(p.min) ? p.min : undefined)} box={box.current}
          onPick={(iso, at) => { close(at); if (iso !== p.value) p.onChange(iso) }}
          onClose={close}
        />, document.body)}
      {patch && createPortal(
        <div className="dcal-layer dcal-patch" data-testid="dcal-patch" aria-hidden="true"
          style={{ inset: 'auto', left: patch.x - SETTLE_PX / 2, top: patch.y - SETTLE_PX / 2, width: SETTLE_PX, height: SETTLE_PX }}
          onClick={e => { e.stopPropagation(); dropPatch() }} onPointerDown={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
        />, document.body)}
    </>
  )
}

function Layer({ label, value, min, markWd, at, box, onPick, onClose }: {
  label: string; value: string; min?: string; markWd?: number; at?: string
  box: HTMLElement | null
  /** `at` — where the click that picked landed; null for a pick by the keyboard */
  onPick: (iso: string, at: { x: number; y: number } | null) => void
  onClose: (at?: { x: number; y: number } | null) => void
}) {
  /* where the last click on the layer landed — a pointer's; a click made by the keyboard (Enter on a date) has no place */
  const pt = useRef<{ x: number; y: number } | null>(null)
  const card = useRef<HTMLDivElement>(null)
  /* A PHONE OR NOT is asked again whenever the screen changes size: a phone turned on its side with the calendar up
     crosses the line (620px), and a card still wearing the other layout's place was left half off the screen (the
     walk, 13 Oct 26 — W1's scenario 14). */
  const [phone, setPhone] = useState(phoneLayout)
  useEffect(() => {
    const on = () => setPhone(phoneLayout())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  /* ESCAPE AND TAB ARE THE CALENDAR'S WHILE IT IS UP — heard on the way DOWN, at the window, before any listener of
     the form behind it. Escape: the windows shell closes its front window on it (at the window, on the way back up) and
     a Leave War sheet closes itself (at the document, on the way down) — either would close the FORM under a calendar
     that is still open. Tab: the veil has taken the page away, so Tab goes round inside the card — and a Leave War
     sheet keeps Tab inside ITSELF with a listener of its own ("focus left behind it is brought in"), which pulled the
     keyboard back behind the veil at every press (found by the break tests, 13 Oct 26: no test held this listener at
     the window; writing one showed the fault). Only while the calendar is up. */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      e.preventDefault(); e.stopPropagation()
      const n = card.current
      if (!n) return
      const stops = [...n.querySelectorAll<HTMLElement>('button, [tabindex]')].filter(x => !(x as HTMLButtonElement).disabled && x.tabIndex >= 0)
      if (!stops.length) return
      const i = stops.indexOf(document.activeElement as HTMLElement)
      /* the keyboard somewhere else (it should not be): into the card, at its first stop — its last for Shift+Tab */
      const to = i < 0 ? (e.shiftKey ? stops.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length
      stops[to].focus({ preventScroll: true })
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
    if (!n) return
    /* a phone's card is the stylesheet's: a place written for the desktop's panel is taken back */
    if (phone) { n.style.left = ''; n.style.top = ''; return }
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
      /* and never off the screen, wherever its box has gone (a page scrolled behind it by something other than a wheel) */
      n.style.top = Math.max(EDGE, Math.min(top, vh - EDGE - h)) + 'px'
    }
    const later = () => { if (!raf) raf = requestAnimationFrame(place) }
    place()
    window.addEventListener('resize', later)
    window.addEventListener('scroll', later, true)
    return () => { if (raf) cancelAnimationFrame(raf); window.removeEventListener('resize', later); window.removeEventListener('scroll', later, true) }
  }, [box, phone])

  /* THE PAGE BEHIND DOES NOT SCROLL UNDER THE CALENDAR. The veil has taken the page away, but a mouse wheel over it
     still scrolled the page — and the desktop's panel, kept on the screen, ended up over its own box (the walk,
     13 Oct 26 — W2's scenario 9). So a wheel anywhere on the layer moves nothing; over a month-and-year list it is
     that list's (which hands nothing on — the stylesheet's). A native listener: only one that is not passive may
     refuse a wheel, and React's are passive. A finger is held by the stylesheet (`touch-action`). */
  const layer = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const n = layer.current
    if (!n) return
    const onWheel = (e: WheelEvent) => { if (!(e.target instanceof Element) || !e.target.closest('.dcal-col')) e.preventDefault() }
    n.addEventListener('wheel', onWheel, { passive: false })
    return () => n.removeEventListener('wheel', onWheel)
  }, [])
  /* nothing done in the layer is the form's behind it */
  const mine = (e: SyntheticEvent) => e.stopPropagation()

  return (
    <div className={'dcal-layer' + (phone ? ' is-phone' : '')} ref={layer} onClickCapture={e => { pt.current = e.detail > 0 ? { x: e.clientX, y: e.clientY } : null }} onClick={mine} onPointerDown={mine} onMouseDown={mine} onKeyDown={mine}>
      <div className="dcal-scrim" data-testid="dcal-scrim" onClick={() => onClose(pt.current)} />
      <div className="dcal-card" ref={card} role="dialog" aria-modal="true" aria-label={`${label} — pick a date`} data-testid="dcal-card">
        <DateCal value={value} min={min} markWd={markWd} at={at} onPick={iso => onPick(iso, pt.current)} />
      </div>
    </div>
  )
}
