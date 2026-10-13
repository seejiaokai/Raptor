/* A SIDEWAYS FINGER TURNS A PAGE — the Calendar window's month and its Holidays list ([CAL-PHONE-SWIPE-FIT]; the design
   of record docs/superpowers/specs/2026-10-13-one-date-calendar.md §The swipe).

   Owner, D786 (13 Oct 26): "allow me to swipe as well on the phone to go between months. Likewise for the holidays page
   to swipe between years." D795: the swipe is the Inputs calendar's — ui/calpick.ts `SWIPE_MIN`, 50px and more sideways
   than up-and-down; left = the next, right = the last — "anywhere on the month or the Holidays list", and it "never
   presses a date's button".

   WHY NOT ui/calpick.ts ITSELF: that machine is for a month whose DATES are pressed and dragged — it starts only on a
   date and leaves every button alone. Here the dates ARE buttons (a date's D / N / NF), and the swipe must work on
   them, on the head, and on the empty room under a short month or list. So this listens for the touch itself, anywhere
   on the element it is given.

   TOUCH EVENTS, not pointer events: a mouse sends none, so a mouse is untouched (D786's reading: "the swipe is for a
   phone only — a desktop keeps the arrows"); and a touch's later events go to the element the finger LANDED on, in
   every engine he uses, so the lift is heard here even when the finger ends over something else. The element carries
   `touch-action:pan-y` (the stylesheet's), so the browser scrolls up and down as ever and never takes a sideways move.

   THE CLICK THAT COULD FOLLOW A SWIPE IS SWALLOWED, ONCE. A browser sends no click after a finger has travelled this
   far — but "no click" is the browser's habit, not a promise, and here a stray one would set a day's flying or open a
   form. The next real press, or a short wait, retires the guard, so a click that never comes cannot eat a later one
   (ui/calpick.ts has the same guard, and the finding that made it). */
import { SWIPE_MIN } from './calpick'

export function initSideSwipe(el: HTMLElement, onSwipe: (dir: 1 | -1, from: Element | null) => void): () => void {
  let st: { x0: number; y0: number; from: Element | null } | null = null
  let retire: (() => void) | null = null

  const swallowClick = () => {
    retire?.()
    let timer: ReturnType<typeof setTimeout>
    const offAll = () => {
      document.removeEventListener('click', eat, true)
      document.removeEventListener('pointerdown', offAll, true)
      clearTimeout(timer)
      retire = null
    }
    const eat = (e: Event) => { e.preventDefault(); e.stopPropagation(); offAll() }
    document.addEventListener('click', eat, true)
    document.addEventListener('pointerdown', offAll, true)
    timer = setTimeout(offAll, 350)
    retire = offAll
  }

  const onStart = (e: TouchEvent) => {
    const t = e.touches && e.touches[0]
    /* a second finger is a pinch or a mistake — never a swipe */
    if (!t || e.touches.length !== 1) { st = null; return }
    st = { x0: t.clientX, y0: t.clientY, from: e.target instanceof Element ? e.target : null }
  }
  const onEnd = (e: TouchEvent) => {
    const s = st
    st = null
    const t = e.changedTouches && e.changedTouches[0]
    if (!s || !t) return
    const dx = t.clientX - s.x0, dy = t.clientY - s.y0
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) <= Math.abs(dy)) return
    swallowClick()
    onSwipe(dx < 0 ? 1 : -1, s.from)
  }
  const onCancel = () => { st = null }

  el.addEventListener('touchstart', onStart, { passive: true })
  el.addEventListener('touchend', onEnd, { passive: true })
  el.addEventListener('touchcancel', onCancel, { passive: true })
  return () => {
    st = null
    retire?.()
    el.removeEventListener('touchstart', onStart)
    el.removeEventListener('touchend', onEnd)
    el.removeEventListener('touchcancel', onCancel)
  }
}

/** the new page comes in from the side it was turned from — the Inputs calendar's own slide (28px over 240ms;
 *  ui/SansCal.tsx), and not at all for a person who has asked for less motion */
export function slideIn(el: Element | null | undefined, dir: number): void {
  if (!el || !dir || typeof (el as HTMLElement).animate !== 'function') return
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ;(el as HTMLElement).animate([{ transform: `translateX(${dir > 0 ? 28 : -28}px)`, opacity: 0.25 }, { transform: 'translateX(0)', opacity: 1 }],
    { duration: 240, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' })
}
