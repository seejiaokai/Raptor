/* [ALL-AVAIL-WINDOW] — the counter opens a movable window of PUCKS, not a
   bubble of names (owner, D38; mock-up approved as the design of record, D41:
   docs/mock/allavail-window.html).

   HIS WORDS: "the current interface to show just names on a bubble … is not
   intuitive … a window that is movable and … resizable and a user can still
   click and edit/scroll the schedule behind while that window is still opened
   … show the pucks just like how the placeholder shows the personnel and I can
   click on the flagging as well … pilot then wso, left right column".

   ONE WINDOW, TWO JOBS. Tapping either counter opens this same panel: who is
   AVAILABLE behind an ALL AVAIL / ALL puck, and — only while OIL Earn is on —
   who is CREDITED OIL, where he switches individual pucks off.

   IT IS A THIRD KIND OF TRANSIENT SURFACE AND THE APP'S FIRST. Not a Sheet
   (scrim + Escape, blocks everything) and not an inline popup (dismisses on an
   outside click — the 4 Sep 26 standing rule). Its contract is written into
   docs/ui-contracts.md, INCLUDING that the outside-click rule does not apply to
   it, because otherwise a later session will read the rule and "fix" this.

   WHY THE FLAGS ARE THE POINT (D36 + D38, two halves of one decision): a man
   whose ops brief sits inside his standard debrief must APPEAR, FLAGGED, so the
   scheduler sees the overlap and judges it. The availability window stays
   narrow precisely because the app's job here is to SURFACE the clash, not to
   remove him from the list. Do not let this drift into filtering him out. */
import { useEffect, useLayoutEffect, useRef } from 'react'
import { notify } from '../state/store'
import { PEOPLE, byCrew } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { useVersion } from './useStore'
import { canEditSched } from '../state/auth'
import { esc } from '../state/view'
import { personPuckHTML, personWarnMsgs, withDaySnap } from './html'
import { oilModeOn, oilSeatHTML, oilSentinelPeople, toggleOilPerson, oilFigureFor, oilBlanketOn, oilFromWords, oilItemLabel } from './oilmode'
import { crowdClashes } from '../engine/validate'
import {
  AVAILWIN, setAvailWin, setAvailTab, AVAILWIN_FOOT, setAvailFoot,
  AVAILWIN_BOX, setAvailWinBox,
  AVAILWIN_W, AVAILWIN_MIN_W, AVAILWIN_H, AVAILWIN_MIN_H,
} from './pops'

/* THE ONE RESOLVER, THROUGH THE VERSION THE CHIP WAS DRAWN IN (Codex
   OSE-R2-05, D44). Reading the live day here would list whoever is free NOW
   under a number frozen when the day went out. Empty `ver` = the chip came
   from the working copy, so the live read is the right one. */
function crowd(di: number, item: string, ver: string): string[] {
  const read = () => oilSentinelPeople(di, item)
  return ver ? withDaySnap(di, ver, read) : read()
}

/* D38/D51 — the LEFT column is the pilots and the RIGHT column is the WSOs, so
   the split says something rather than just saving space. That is the pairing
   the sim seat grid already uses (front-seat left / rear-seat right) and the
   seat colours the app already paints. A WSO is the rear-cockpit seat, which is
   the same test `puck()` itself uses to decide the `r` class — asked of the one
   record, never re-derived from a qualification letter. */
const isWso = (id: string) => ((PEOPLE as any)[id] || {}).seat === 'RCP'


export function AvailWindow() {
  useVersion()
  const open = AVAILWIN
  const el = useRef<HTMLDivElement | null>(null)
  const drag = useRef<{ dx: number, dy: number, w: number, h: number } | null>(null)

  /* PUT THE WINDOW BACK WHERE HE LEFT IT, on every render. He edits the
     schedule behind it, so every keystroke notifies and re-renders this; a box
     held in component state would be thrown away on the first one, and the
     window would jump back to the corner mid-drag-and-type. */
  useLayoutEffect(() => {
    const n = el.current
    if (!n || !open) return
    const b = AVAILWIN_BOX
    if (b) {
      n.style.left = b.x + 'px'; n.style.top = b.y + 'px'
      n.style.right = 'auto'; n.style.bottom = 'auto'
      n.style.width = b.w + 'px'; n.style.height = b.h + 'px'
    }
  })

  /* A RESIZE IS COMMITTED WITHOUT A RE-RENDER, for the same reason a drag is.
     CSS `resize` fires no pointer events of its own, so the observer is the
     only honest way to learn the new size; it writes straight to the module
     box, which the layout effect above then honours on the next real render. */
  useEffect(() => {
    const n = el.current
    if (!n || !open || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const r = n.getBoundingClientRect()
      setAvailWinBox({ x: r.left, y: r.top, w: r.width, h: r.height })
    })
    ro.observe(n)
    return () => ro.disconnect()
  }, [open && open.di, open && open.item])

  if (!open) return <div className="availwin" hidden />

  const { di, item, ver, name, when, tab } = open
  const people = crowd(di, item, ver)
  const mode = oilModeOn(di)
  /* THE MODE RULE, confirmed with him 22 Sep 26. Tapping the counter always
     shows WHO IS AVAILABLE, any day, OIL or not. The "Who earns OIL" half
     exists ONLY while OIL Earn is switched on; with the mode off there are no
     tabs at all, just the one list. That is D27 carried through — availability
     is a scheduling fact, earning is a mode. */
  const oil = mode && tab === 'oil'
  /* A MAN THE ROSTER NO LONGER HOLDS. An issued day's membership is a FROZEN
     list of ids (D44), so a man posted out since publication is still in it —
     he is on the everything-day for exactly this reason. He has no puck to draw
     and no seat to sort by, and `byCrew` reads `PEOPLE[id].seat` with no guard,
     so sorting him THREW and took the whole window with it.

     He is not silently dropped either: the chip's number comes from this same
     list, so a window showing fewer men than the chip counted would be the
     chip-and-list disagreement that Fable correction 2 exists to stop — in a
     new place. He is counted, and said out loud under the columns. */
  const known = people.filter(id => !!(PEOPLE as any)[id])
  const gone = people.filter(id => !(PEOPLE as any)[id])
  const pilots = known.filter(id => !isWso(id)).sort(byCrew)
  const wsos = known.filter(id => isWso(id)).sort(byCrew)

  /* Only a scheduler may switch a man off earning. Reading who is available is
     open to anybody — the count chip's own handler says so, and a member
     reading the schedule may fairly ask who the puck stands for. So the window
     has a read-only half and an edit half, and the roles differ between them. */
  const canEdit = canEditSched()

  const earners = (ids: string[]) =>
    ids.filter(id => !!oilFigureFor(di, id, item)).length

  /* EVERY FLAG A MAN WEARS IN THIS WINDOW — ONE BODY, three readers: his row,
     the tap's sentence, and the count under the list. They were three separate
     reads of the warning list, which is how the count and the rows could come to
     disagree the moment a second kind of flag arrived.

     THE SECOND KIND IS THE OWNER'S OWN CASE (D36 + D38, Fable S2): this event
     sitting inside one of his own flying legs' brief or debrief. The warning
     list can never say it — its pass skips placeholders, so a man only BEHIND
     one is on no event at all — so it is asked here, of THIS event, through the
     warning list's own rule and words (validate.ts crowdClashes). It comes
     FIRST, so among equal flags the one about this event is the one he reads;
     a red day-wide flag still outranks it (worst first, below).

     The event's window is read LIVE, every render, so the flag follows the row
     if he edits its times behind the window. Only on the working copy: an
     issued face shows its own world's flags or none (Fable S3), and this check
     reads the live day. */
  const live = ver ? null : oilItemLabel(di, item)
  const flagsFor = (id: string) => [
    ...(live ? crowdClashes(di, id, live.s, live.e, live.name) : []),
    ...personWarnMsgs(di, id),
  ]
  const worstOf = (ws: { sev: string, msg: string }[]) => ws.find(w => w.sev === 'hard') || ws[0]

  const rowHTML = (id: string) => {
    const p = (PEOPLE as any)[id]
    if (!p) return ''
    /* IN THE OIL VIEW THE PUCK COMES FROM `oilSeatHTML`, not from here. That
       body owns all five states and their five sentences — inert, masked, on,
       and the four different reasons a man can be off — and re-deriving any of
       them here would be a second reader of the same question. It is handed
       this window's own puck builder, so the flags still come from the one
       drawer. */
    const pk = oil
      ? oilSeatHTML(di, id, item, (o: any) => personPuckHTML(di, id, o))
      : personPuckHTML(di, id)
    const worst = worstOf(flagsFor(id))
    /* D40 — at 212px a flagged man's reason will not fit beside his puck, so it
       WRAPS onto its own line under him, and sits beside him only when the
       window is dragged wider. It is never dropped, only moved: the flex-basis
       in the stylesheet is what decides, not a width test here. */
    const why = worst
      ? `<span class="rwhy">${esc(worst.msg)}</span>`
      : ''
    const cls = 'rpuck'
      + (worst ? (worst.sev === 'hard' ? ' clash' : ' flagged') : '')
    return `<span class="${cls}" data-awp="${esc(id)}">${pk}${why}</span>`
  }

  const col = (title: string, ids: string[]) =>
    `<div class="rcol"><div class="rh">${esc(title)} &middot; `
    + (oil ? `${earners(ids)} earn` : String(ids.length))
    + `</div>`
    + (ids.length ? ids.map(rowHTML).join('') : `<div class="rnone">&mdash; none &mdash;</div>`)
    + `</div>`

  const body = `<div class="rcols">${col('Pilots', pilots)}${col('WSOs', wsos)}</div>`
    + (gone.length
      ? `<div class="rgone">${gone.length === 1 ? 'One man' : `${gone.length} men`} behind this puck `
        + `${gone.length === 1 ? 'is' : 'are'} no longer on the roster.</div>`
      : '')

  const close = () => { setAvailWin(null); notify() }

  const onBody = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement
    const r = t.closest('[data-awp]') as HTMLElement | null
    if (!r) return
    const id = r.dataset.awp || ''
    if (oil) {
      if (!canEdit) { HOOKS.toast('Only a scheduler can change who earns', 'warn'); return }
      if (oilBlanketOn(di)) { HOOKS.toast('Nothing on this day earns — turn that off first'); return }
      /* the real write, through the same body the in-row crowd uses, so it
         lands on the day, rides the snapshot and a publish makes it a real
         amendment exactly as a tap on the board would */
      const on = toggleOilPerson(di, id, item)
      const cs = ((PEOPLE as any)[id] || {}).cs || id
      setAvailFoot(on ? `${cs} earns from this event again.` : `${cs} earns nothing from this event.`)
      notify()
      return
    }
    /* D38 — "I can click on the flagging as well". The reason is already under
       his puck; the tap gives the FULL sentence, which is the one the warning
       list uses, because a wrapped line is cut to fit and this one is not. */
    const cs = ((PEOPLE as any)[id] || {}).cs || id
    const worst = worstOf(flagsFor(id))
    setAvailFoot(worst
      ? `${cs} — ${worst.msg}`
      : `${cs} — nothing else on the programme at that time.`)
    notify()
  }

  const flagged = [...pilots, ...wsos].filter(id => flagsFor(id).length).length
  const hint = AVAILWIN_FOOT || (oil
    ? 'Tap a puck to stop a man earning from this event.'
    : flagged
      ? `Tap a puck for why. ${flagged === 1 ? 'One man is' : `${flagged} men are`} flagged.`
      : 'Tap a puck for why.')

  const onBarDown = (e: React.PointerEvent) => {
    const n = el.current
    if (!n) return
    if ((e.target as HTMLElement).closest('.win-x')) return
    const r = n.getBoundingClientRect()
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, h: r.height }
    n.style.left = r.left + 'px'; n.style.top = r.top + 'px'
    n.style.right = 'auto'; n.style.bottom = 'auto'
    n.style.width = r.width + 'px'; n.style.height = r.height + 'px'
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* jsdom */ }
    e.preventDefault()
  }
  /* A DRAG WRITES THE ELEMENT'S STYLE DIRECTLY AND NOTIFIES NOBODY. Re-rendering
     the app on every pointer frame would repaint the whole board behind the
     window sixty times a second — and the board is the thing he is supposed to
     still be able to read while he drags. The move is committed to the module
     box on release, which is what survives the next real render. */
  const onBarMove = (e: React.PointerEvent) => {
    const d = drag.current, n = el.current
    if (!d || !n) return
    const x = Math.min(Math.max(0, e.clientX - d.dx), Math.max(0, window.innerWidth - d.w))
    /* never let the bar itself go off the bottom: a window dragged past the
       edge could not be grabbed again, and it has no scrim to dismiss it */
    const y = Math.min(Math.max(0, e.clientY - d.dy), Math.max(0, window.innerHeight - 42))
    n.style.left = x + 'px'; n.style.top = y + 'px'
  }
  const onBarUp = () => {
    const n = el.current
    if (drag.current && n) {
      const r = n.getBoundingClientRect()
      setAvailWinBox({ x: r.left, y: r.top, w: r.width, h: r.height })
    }
    drag.current = null
  }

  return (
    <div
      className="availwin"
      ref={el}
      role="dialog"
      aria-label={`${name} — who is available`}
      style={{ width: AVAILWIN_W, height: AVAILWIN_H, minWidth: AVAILWIN_MIN_W, minHeight: AVAILWIN_MIN_H }}
    >
      <div
        className="win-bar"
        onPointerDown={onBarDown}
        onPointerMove={onBarMove}
        onPointerUp={onBarUp}
        onPointerCancel={onBarUp}
      >
        {/* D40 — THE GRIP IS THE APP'S OWN SIX-DOT BRAILLE GLYPH, the same one
            every draggable row and section header wears. Not taste: it is the
            app's existing vocabulary for "drag me", so the window reads as
            movable without being explained. */}
        <span className="win-grip" aria-hidden="true">&#10303;</span>
        <span className="win-ttl">{name}<small>{when}</small></span>
        <button className="win-x" onClick={close} title="Close" aria-label="Close">&#10005;</button>
      </div>

      {mode ? (
        <div className="win-tabs" role="tablist">
          <button
            className={'win-tab' + (oil ? '' : ' on')} role="tab" aria-selected={!oil}
            onClick={() => { setAvailTab('who'); notify() }}
          >Who&rsquo;s available <span className="c">{people.length}</span></button>
          <button
            className={'win-tab' + (oil ? ' on' : '')} role="tab" aria-selected={oil}
            onClick={() => { setAvailTab('oil'); notify() }}
          >Who earns OIL <span className="c">{earners(people)} of {people.length}</span></button>
        </div>
      ) : (
        /* MODE OFF: no tabs at all, just one heading saying what the list is.
           D39 — the counter drops the word "free", and so does this: the
           window's own job is to show the men who are FLAGGED rather than
           assert they are clear, which is exactly the claim D37 warns about. */
        <div className="win-one">Who&rsquo;s available <span className="c">{people.length}</span></div>
      )}

      <div
        className={'win-body' + (oil ? ' oilview' : '')}
        onClick={onBody}
        dangerouslySetInnerHTML={{ __html: body }}
      />

      {/* WHICH OF THE TWO ANSWERS THIS IS (D37, D44) — the ONE thing the toast
          this window replaced always said, and the first version of this window
          dropped. `oilwords.test.tsx` caught it: the chip's own title carries the
          phrase, so without this the face he reads and the chip above it would be
          saying different amounts of truth about the same number. Always on
          screen, never only in the footer, because the footer is overwritten the
          moment he taps a man. */}
      <div className="win-from">{oilFromWords(ver)}</div>

      <div className="win-foot"><span className="hint">{hint}</span></div>
    </div>
  )
}
