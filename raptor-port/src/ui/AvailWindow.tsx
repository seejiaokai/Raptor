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
import { esc, selectPerson } from '../state/view'
import { personPuckHTML, personWarnMsgs, withChipWorld } from './html'
import { oilModeOn, oilSeatHTML, toggleOilPerson, oilFigureFor, oilBlanketOn, oilItemMasked, oilFromWords, oilItemLabel, oilRequestName, oilPersonSays, evOf } from './oilmode'
import { oilSentOf, oilReadPass } from '../engine/oilev'
import { logAction } from '../engine/editlog'
import { crowdClashes } from '../engine/validate'
import {
  AVAILWIN, setAvailWin, setAvailTab, AVAILWIN_FOOT, setAvailFoot,
  AVAILWIN_BOX, setAvailWinBox,
} from './pops'

/* OPENING THE WINDOW FROM A COUNT CHIP — one body for the board and the week,
   which both draw the chip. A second opener is how the chip and its tap came to
   disagree once before (Fable correction 2). The title is read IN THE CHIP'S
   WORLD, so an issued chip is titled by the issued row even if it has been
   renamed since; it is kept as the fallback the window shows if the row is
   later deleted behind it (S14).

   WHICH HALF IT OPENS ON. Availability is the default and is always offered;
   inside the earn mode the counter IS the door to switching men off — the job
   he opened it for — so it lands on that half. Not for a VERSION's chip: a
   record is read, never edited, so it lands on availability. */
export function openAvailWinFrom(osn: HTMLElement) {
  const di = +(osn.dataset.oilday || -1), item = osn.dataset.oilsent || '', ver = osn.dataset.oilver || ''
  const ofw = osn.dataset.oilofw === '1'
  const lbl = withChipWorld(di, ver, ofw, () => oilItemLabel(di, item))
  setAvailWin({ di, item, ver, ofw, name: lbl.name, when: lbl.when, tab: oilModeOn(di) && !ver ? 'oil' : 'who' })
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

  /* WHERE THE WINDOW SITS — ONE BODY for every render and every browser resize
     (Fable S8, S11, S15). He edits the schedule behind it, so every keystroke
     re-renders this; the box lives in the module, never in component state, or
     the window would jump back to the corner mid-drag-and-type.
     · NO BOX: the STYLESHEET places and sizes it — the top-right corner at 212
       wide on a desktop, the full-width bottom panel on a phone (the approved
       design, D41). So every inline position and size is CLEARED: the element is
       reused between windows, and a drag's left/top left on it used to open the
       next window where the last one had been dragged (S11), while the inline
       212x540 React used to pin beat the phone rule outright (S8).
     · A BOX (he dragged or resized it): put it back where he left it, then CLAMP
       it into the screen, so a browser narrowed or a tablet turned after the
       drag never strands the bar — and with it the ✕, the only way to close a
       window that has no scrim and no Escape (S15). The clamp is for display
       only: the box keeps where he put it, so a browser widened again gives it
       back. Never while a drag is in flight, which writes the element itself. */
  const place = () => {
    const n = el.current
    if (!n || !AVAILWIN || drag.current) return
    const b = AVAILWIN_BOX
    if (!b) {
      n.style.left = n.style.top = n.style.right = n.style.bottom = n.style.width = n.style.height = ''
      return
    }
    n.style.right = 'auto'; n.style.bottom = 'auto'
    n.style.width = b.w + 'px'; n.style.height = b.h + 'px'
    /* measured AFTER the size is written, so the stylesheet's max-width and
       max-height have had their say on a screen smaller than the box */
    const r = n.getBoundingClientRect()
    const x = Math.min(Math.max(0, b.x), Math.max(0, window.innerWidth - r.width))
    const y = Math.min(Math.max(0, b.y), Math.max(0, window.innerHeight - 42))
    n.style.left = x + 'px'; n.style.top = y + 'px'
  }
  useLayoutEffect(place)
  /* a browser resize moves nothing in React, so it re-places the window itself */
  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open && open.di, open && open.item])

  /* A RESIZE IS COMMITTED WITHOUT A RE-RENDER, for the same reason a drag is.
     CSS `resize` fires no pointer events of its own, so the observer is the
     only honest way to learn the new size; it writes straight to the module
     box, which the layout effect above then honours on the next real render. */
  useEffect(() => {
    const n = el.current
    if (!n || !open || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      /* ONLY A SIZE HE CHOSE IS REMEMBERED. The observer also fires for the
         window's first layout and for every size the STYLESHEET decides — the
         phone's full-width panel, a browser resized — and committing those froze
         the window at pixel values on its very first frame, so it could never
         follow the phone rule again. A size he chose is one the resize handle
         wrote onto the element, or, once he has a box, one that differs from it. */
      if (drag.current) return
      const b = AVAILWIN_BOX
      if (!b && !n.style.width && !n.style.height) return
      const r = n.getBoundingClientRect()
      if (b && Math.abs(r.width - b.w) < 1 && Math.abs(r.height - b.h) < 1) return
      setAvailWinBox({ x: r.left, y: r.top, w: r.width, h: r.height })
    })
    ro.observe(n)
    return () => ro.disconnect()
  }, [open && open.di, open && open.item])

  if (!open) return <div className="availwin" hidden />

  const { di, item, ver, ofw, name, when, tab } = open
  const mode = oilModeOn(di)
  /* THE MODE RULE, confirmed with him 22 Sep 26. Tapping the counter always
     shows WHO IS AVAILABLE, any day, OIL or not. The "Who earns OIL" half
     exists ONLY while OIL Earn is switched on; with the mode off there are no
     tabs at all, just the one list. That is D27 carried through — availability
     is a scheduling fact, earning is a mode. */
  const oil = mode && tab === 'oil'

  /* Only a scheduler may switch a man off earning. Reading who is available is
     open to anybody — the count chip's own handler says so, and a member
     reading the schedule may fairly ask who the puck stands for. So the window
     has a read-only half and an edit half, and the roles differ between them. */
  const canEdit = canEditSched()

  /* EVERYTHING THE WINDOW SHOWS IS READ IN THE CHIP'S OWN WORLD (Fable S3), and
     in ONE read-only pass. The crowd, the flags, the figures, the puck marks and
     the title all come from the version the chip was drawn in — the working
     copy, a preview, or the issued face with its official flags — never a mix
     of the record and today. The pass memoises each day's evidence for the
     length of this render (Fable S10: it was rebuilt five to eight times per man
     on every keystroke behind the window); nothing inside may write. */
  const m = withChipWorld(di, ver, ofw, (ok: boolean) => oilReadPass(() => {
    /* THE VERSION IS GONE — unpublished, or the publish undone (Fable S5).
       prunePreviews closes the window on those paths; this is the belt, so a
       path nobody listed can never read on and label today's list "issued". */
    if (!ok) return null
    const lbl = oilItemLabel(di, item)
    const sent = oilSentOf(evOf(di), item)
    const people = sent.people

    /* A MAN THE ROSTER NO LONGER HOLDS. An issued day's membership is a FROZEN
       list of ids (D44), so a man posted out since publication is still in it —
       he is on the everything-day for exactly this reason. He has no puck to
       draw and no seat to sort by, and `byCrew` reads `PEOPLE[id].seat` with no
       guard, so sorting him THREW and took the whole window with it.
       He is not silently dropped either: the chip's number comes from this same
       list, so a window showing fewer men than the chip counted would be the
       chip-and-list disagreement that Fable correction 2 exists to stop — in a
       new place. He is counted, and said out loud under the columns. */
    const known = people.filter(id => !!(PEOPLE as any)[id])
    const gone = people.filter(id => !(PEOPLE as any)[id])
    const pilots = known.filter(id => !isWso(id)).sort(byCrew)
    const wsos = known.filter(id => isWso(id)).sort(byCrew)

    const earners = (ids: string[]) =>
      ids.filter(id => !!oilFigureFor(di, id, item)).length

    /* EVERY FLAG A MAN WEARS IN THIS WINDOW — ONE BODY, three readers: his row,
       the tap's sentence, and the count under the list. They were three
       separate reads of the warning list, which is how the count and the rows
       could come to disagree the moment a second kind of flag arrived.

       THE SECOND KIND IS THE OWNER'S OWN CASE (D36 + D38, Fable S2): this event
       sitting inside one of his own flying legs' brief or debrief. The warning
       list can never say it — its pass skips placeholders, so a man only BEHIND
       one is on no event at all — so it is asked here, of THIS event, through
       the warning list's own rule and words (validate.ts crowdClashes). It
       comes FIRST, so among equal flags the one about this event is the one he
       reads; a red day-wide flag still outranks it (worst first).

       The event's window is read LIVE, every render, so the flag follows the
       row if he edits its times behind the window. Only on the working copy:
       it reads the live day's events, and an issued face shows its own world's
       flags or none (Fable S3). */
    const own = !ver && lbl.found
    const flagsFor = (id: string) => [
      ...(own ? crowdClashes(di, id, lbl.s, lbl.e, lbl.name) : []),
      ...personWarnMsgs(di, id),
    ]
    const worst: Record<string, { sev: string, msg: string } | undefined> = {}
    for (const id of known) { const ws = flagsFor(id); worst[id] = ws.find(w => w.sev === 'hard') || ws[0] }

    const rowHTML = (id: string) => {
      /* IN THE OIL VIEW THE PUCK COMES FROM `oilSeatHTML`, not from here. That
         body owns all five states and their five sentences — inert, masked, on,
         and the four different reasons a man can be off — and re-deriving any
         of them here would be a second reader of the same question. It is
         handed this window's own puck builder, so the flags still come from the
         one drawer. */
      const pk = oil
        ? oilSeatHTML(di, id, item, (o: any) => personPuckHTML(di, id, o))
        : personPuckHTML(di, id)
      const w = worst[id]
      /* D40 — at 212px a flagged man's reason will not fit beside his puck, so
         it WRAPS onto its own line under him, and sits beside him only when the
         window is dragged wider. It is never dropped, only moved: the flex-basis
         in the stylesheet is what decides, not a width test here. */
      const why = w ? `<span class="rwhy">${esc(w.msg)}</span>` : ''
      const cls = 'rpuck' + (w ? (w.sev === 'hard' ? ' clash' : ' flagged') : '')
      return `<span class="${cls}" data-awp="${esc(id)}">${pk}${why}</span>`
    }
    const col = (title: string, ids: string[]) =>
      `<div class="rcol"><div class="rh">${esc(title)} &middot; `
      + (oil ? `${earners(ids)} earn` : String(ids.length))
      + `</div>`
      + (ids.length ? ids.map(rowHTML).join('') : `<div class="rnone">&mdash; none &mdash;</div>`)
      + `</div>`

    /* THE ROW IS GONE, OR ITS PLACEHOLDER IS (Fable S14). The window outlives
       the row that opened it — he edits behind it — so a row deleted, or a puck
       dragged off it, must read as exactly that. It used to fall through to an
       empty list under the old title: "Who's available 0 — none —", which reads
       as "nobody is free for OPS BRIEF". Undo brings the row back, and the list
       with it, because this is read afresh on every render. */
    const lost = !lbl.found
      ? 'This row is no longer on the schedule.'
      : sent.state !== 'resolved'
        ? 'There is no ALL or ALL AVAIL puck on this row any more.'
        : ''
    const body = lost
      ? `<div class="win-lost">${esc(lost)}</div>`
      : `<div class="rcols">${col('Pilots', pilots)}${col('WSOs', wsos)}</div>`
        + (gone.length
          ? `<div class="rgone">${gone.length === 1 ? 'One man' : `${gone.length} men`} behind this puck `
            + `${gone.length === 1 ? 'is' : 'are'} no longer on the roster.</div>`
          : '')
    return {
      lbl, lost, body, worst,
      n: people.length,
      earn: earners(people),
      flagged: known.filter(id => !!worst[id]).length,
    }
  }))

  const close = () => { setAvailWin(null); notify() }

  const onBody = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement
    const r = t.closest('[data-awp]') as HTMLElement | null
    if (!r || !m) return
    const id = r.dataset.awp || ''
    /* D65 — WHAT A TAP ON A MAN SELECTS DEPENDS ON THE MODE (owner, 23 Sep 26).
       OIL Earn OFF: the ordinary puck selection — he lights up blue everywhere
       on the schedule behind the window, so the scheduler sees every row he is
       already on — AND the footer still gives his reason. A second tap clears
       it, as on any puck. OIL Earn ON: the tap only switches him on or off
       earning and selects NOTHING, matching every other tap inside the mode —
       on the "who's available" tab too, because the ruling keys it to the mode,
       not the tab. The window owns this outright and stops the click here: it
       used to fall through to the document's puck branch and select him in
       every case (Fable S9). `false` = not a week tap: his reason is already in
       the footer, so the week's warning boxes are not flung open under him. */
    e.stopPropagation()
    if (!mode) selectPerson(id, false)
    const cs = ((PEOPLE as any)[id] || {}).cs || id
    if (oil) {
      /* A RECORD IS READ, NEVER EDITED. A window opened from an issued or
         preview chip lists the version's men and figures; a switch here would
         land on the WORKING copy while the list above it could not move — a tap
         that seems to do nothing, or flips a man who is not even in today's
         crowd. The earn half of a version is for reading who earned. */
      if (ver) { setAvailFoot('This is the day as it was issued. Change who earns on the working copy.'); notify(); return }
      if (!canEdit) { HOOKS.toast('Only a scheduler can change who earns', 'warn'); return }
      /* UNDER A MASK THE TAP HAS NO MEANING, and it must say so in the board's
         own words (Fable S6). A man drawn inert or masked carries no switch —
         the board's `[data-oilp]` never fires for him — but the window's row
         made him tappable anyway, so the tap reached a write that refused and
         then said "X earns nothing from this event", which is not why. */
      if (oilItemMasked(di, item)) {
        HOOKS.toast(oilBlanketOn(di)
          ? 'Nothing on this day earns — turn that off first'
          : 'This event earns nobody any OIL — turn the event back on first')
        return
      }
      const seat = r.querySelector('[data-oilp]') as HTMLElement | null
      if (!seat) {
        /* INERT — nothing for him to earn from this event at all. The board
           would never reach a write here, and neither may the window: a `deny`
           written for a man with nothing to earn is a decision about nothing,
           and it would still cost an amendment on a published day. His seat
           says why; the footer repeats it. */
        const why = (r.querySelector('.seat.oilpk') as HTMLElement | null)?.title || `${cs} has nothing to earn from this event.`
        setAvailFoot(why); notify(); return
      }
      /* the real write, through the same body the board's tap uses, so it lands
         on the day, rides the snapshot and a publish makes it a real amendment
         exactly as a tap on the board would — and it leaves the SAME history
         line (Fable S7: it left none, and the window is now the only door to
         switching one crowd member off). */
      const on = toggleOilPerson(di, id, item)
      const said = oilPersonSays(cs, oilRequestName(item) || m.lbl.name, on)
      logAction(di, said)
      setAvailFoot(said + '.')
      notify()
      return
    }
    /* D38 — "I can click on the flagging as well". The reason is already under
       his puck; the tap gives the FULL sentence, which is the one the warning
       list uses, because a wrapped line is cut to fit and this one is not. */
    const w = m.worst[id]
    setAvailFoot(w
      ? `${cs} — ${w.msg}`
      : `${cs} — nothing else on the programme at that time.`)
    notify()
  }

  const hint = !m ? '' : AVAILWIN_FOOT || (m.lost ? '' : oil
    ? (ver ? 'Who earned OIL on the day as it was issued.' : 'Tap a puck to stop a man earning from this event.')
    : m.flagged
      ? `Tap a puck for why. ${m.flagged === 1 ? 'One man is' : `${m.flagged} men are`} flagged.`
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
      aria-label={`${m && m.lbl.found ? m.lbl.name : name} — who is available`}
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
        <span className="win-ttl">{m && m.lbl.found ? m.lbl.name : name}<small>{m && m.lbl.found ? m.lbl.when : when}</small></span>
        <button className="win-x" onClick={close} title="Close" aria-label="Close">&#10005;</button>
      </div>

      {mode ? (
        <div className="win-tabs" role="tablist">
          <button
            className={'win-tab' + (oil ? '' : ' on')} role="tab" aria-selected={!oil}
            onClick={() => { setAvailTab('who'); notify() }}
          >Who&rsquo;s available <span className="c">{m && !m.lost ? m.n : '—'}</span></button>
          <button
            className={'win-tab' + (oil ? ' on' : '')} role="tab" aria-selected={oil}
            onClick={() => { setAvailTab('oil'); notify() }}
          >Who earns OIL <span className="c">{m && !m.lost ? `${m.earn} of ${m.n}` : '—'}</span></button>
        </div>
      ) : (
        /* MODE OFF: no tabs at all, just one heading saying what the list is.
           D39 — the counter drops the word "free", and so does this: the
           window's own job is to show the men who are FLAGGED rather than
           assert they are clear, which is exactly the claim D37 warns about. */
        <div className="win-one">Who&rsquo;s available <span className="c">{m && !m.lost ? m.n : '—'}</span></div>
      )}

      <div
        className={'win-body' + (oil ? ' oilview' : '')}
        onClick={onBody}
        dangerouslySetInnerHTML={{ __html: m ? m.body : '' }}
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
