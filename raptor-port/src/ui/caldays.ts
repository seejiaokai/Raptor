/* THE DATE UNDER A POINT OF A MONTH — one body for every pointer machine of the two calendars (ui/calpick.ts: picking
   days; ui/caldrag.ts: moving a bar or a planning note).

   A date is an element carrying `data-icday`. On the SANS month nothing lies over the dates, so the element under the
   pointer is (or is inside) the date. On the Inputs month an input is a BAR lying across several dates (owner D626:
   "bars the way Google calendar does") — the element under the pointer is then the bar, which belongs to no one date.
   So the date is asked of everything stacked at the point, top first: the first that is, or is inside, a date of this
   month answers. That is the plan's "from the day grid's geometry" (§3.6) — and it is why a pick drawn across a bar
   carries on, and why a bar grabbed on its Wednesday knows it was grabbed on its Wednesday.

   Never the event's target: a captured or a touch pointer keeps reporting the element it went down on. Where the page
   has no layout to ask (a unit test), `fallback` — the event's target — is all there is. */
export function dayAtPoint(root: HTMLElement, x: number, y: number, fallback?: EventTarget | null): string | null {
  const doc = document as any
  const stack: unknown[] = typeof doc.elementsFromPoint === 'function' ? doc.elementsFromPoint(x, y) || []
    : typeof doc.elementFromPoint === 'function' ? [doc.elementFromPoint(x, y)]
      : [fallback]
  for (const hit of stack) {
    const cell = hit && typeof (hit as Element).closest === 'function' ? (hit as Element).closest('[data-icday]') as HTMLElement | null : null
    if (cell && root.contains(cell)) return cell.dataset.icday || null
  }
  return null
}

/** the date's own element in this month (the one a pointer machine lights), or null */
export const dayEl = (root: HTMLElement, iso: string | null): HTMLElement | null =>
  iso ? root.querySelector(`[data-icday="${iso}"]`) as HTMLElement | null : null

/* THE ELEMENT A FINGER LANDED ON KEEPS ITS EVENTS (the night's own find, 15 Oct 26 — D897, D898; the bug-check order
   §7.9). Since a drag held at the month's side turns the month, the date or the bar under a held finger can be drawn
   away mid-gesture. Safari sends a touch's later events to the element it landed on even after that element has left
   the page, and an event on an element no longer in the page reaches neither the month nor the window — the drag would
   go dead (no move, no release), its turn still turning. So for the life of one press the landed-on element hears the
   gesture too; while it is still in the page the same event also reaches the month or the window, and `once` lets each
   event be handled one time only. Returns the detach. */
export function heldOn(target: EventTarget | null, on: { move: (e: PointerEvent) => void; up: (e: PointerEvent) => void; cancel: (e: PointerEvent) => void; touchmove?: (e: TouchEvent) => void }, finger?: number): () => void {
  if (!target || typeof (target as any).addEventListener !== 'function') return () => {}
  const t = target as EventTarget
  t.addEventListener('pointermove', on.move as EventListener, { passive: true })
  t.addEventListener('pointerup', on.up as EventListener, { passive: true })
  t.addEventListener('pointercancel', on.cancel as EventListener, { passive: true })
  if (on.touchmove) t.addEventListener('touchmove', on.touchmove as EventListener, { passive: false })
  /* AND ITS TOUCH EVENTS (his find on his iPhone, 15 Oct 26: a run turned forward into January would not turn back —
     Chromium did). A touch's events go to the element it landed on, always, even after it has left the page — the one
     delivery every browser keeps; Safari's pointer events for that finger may stop or be cancelled once the turn has
     drawn the element away. So for a finger the touch events drive the same handlers, each made a pointer-like event
     for this press's pointer (`isTouchTwin` marks it). A pointer event and its touch twin for one move do the same thing
     twice harmlessly; whichever ends the press first ends it, and the other finds nothing to end. */
  const twin = (e: TouchEvent): PointerEvent | null => {
    const tp = e.changedTouches && e.changedTouches[0]
    if (!tp || finger === undefined) return null
    return { clientX: tp.clientX, clientY: tp.clientY, pointerId: finger, pointerType: 'touch', isPrimary: true, target: t, isTouchTwin: true } as unknown as PointerEvent
  }
  const tm = (e: Event) => { const x = twin(e as TouchEvent); if (x) on.move(x) }
  const te = (e: Event) => { const x = twin(e as TouchEvent); if (x) on.up(x) }
  const tc = (e: Event) => { const x = twin(e as TouchEvent); if (x) on.cancel(x) }
  if (finger !== undefined) {
    t.addEventListener('touchmove', tm, { passive: true })
    t.addEventListener('touchend', te, { passive: true })
    t.addEventListener('touchcancel', tc, { passive: true })
  }
  return () => {
    t.removeEventListener('pointermove', on.move as EventListener)
    t.removeEventListener('pointerup', on.up as EventListener)
    t.removeEventListener('pointercancel', on.cancel as EventListener)
    if (on.touchmove) t.removeEventListener('touchmove', on.touchmove as EventListener)
    if (finger !== undefined) { t.removeEventListener('touchmove', tm); t.removeEventListener('touchend', te); t.removeEventListener('touchcancel', tc) }
  }
}
/** a pointer cancel to set aside: Safari's, for a finger whose landed-on element the turn has drawn away — its touch events
 *  carry the gesture on, and a real cancel still comes as a touchcancel (its twin is never set aside) */
export const strayCancel = (e: PointerEvent, landed: Element | null, mouse: boolean): boolean =>
  !mouse && !(e as any).isTouchTwin && !!landed && !landed.isConnected
/** a handler that takes each event once, however many of the places it listens on the event reaches */
export function once<E extends Event>(fn: (e: E) => void): (e: E) => void {
  let last: E | null = null
  return (e: E) => { if (e === last) return; last = e; fn(e) }
}
