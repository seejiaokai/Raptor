/* PICKING DAYS ON A MONTH — the one pointer machine for a calendar's dates (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.5, §3.6).

   Owner, D621 / D626 (7 Oct 26): several days are picked "by hold-and-drag on a phone and by mouse drag on a desktop,
   the 'Select dates' button gone". It replaces three things the first calendar did apart: a mouse drag that picked a
   range, a "Select dates" mode with two taps, and a held finger that added one day.

   A press on a date (an element carrying `data-icday`) can mean four things:
     · a TAP                              → onTap(date): the day opens;
     · a finger SLID sideways, quickly    → onSwipe(±1): the month turns (left = the next month, the way a page turns);
     · a MOUSE DRAGGED across dates       → the run is lit as it goes (onPicking) and given on release (onRange);
     · a finger HELD STILL, then dragged  → the same; held and let go without moving = that one day.
   WHY A HOLD FIRST ON A PHONE: a finger moving on the month is, most of the time, the PAGE being scrolled (on a phone
   the month is as tall as the screen and the page scrolls as one — D664) or the month being turned. A pick is the
   rarer wish, so it is the one that asks to be meant: hold, and the day lights to say the hold has taken.
   ONCE IT HAS TAKEN the finger's moves are claimed (touchmove's default is prevented — the only thing that stops a
   browser from scrolling under a finger; a passive listener cannot), so the page stands still while the run is drawn.
   A finger that moves BEFORE the hold has taken was never a pick: the timer is dropped and the browser has it.

   `canPick()` — whether this person may add here at all. Where he may not, a tap and a slide behave as ever, and a drag
   or a hold picks nothing (the screen says who may add, in words).

   The date under a moving pointer is asked of the PAGE's geometry (elementFromPoint), never of the event's target: a
   captured or a touch pointer keeps reporting the element it went down on. Presses that begin on a control inside a
   date are that control's own. */

/** how long a finger is held still before a pick begins — past a deliberate tap, short of a wait */
export const PICK_HOLD = 400
/** the drift a still hold, or a tap, may carry */
export const PICK_SLOP = 8
/** how far sideways a slide must go to turn the month — about one phone date wide, so a stray finger never does */
export const SWIPE_MIN = 50

export interface CalPick {
  canPick: () => boolean
  onTap: (iso: string) => void
  /** the run being drawn, first day first; null when nothing is being drawn any more */
  onPicking: (run: { a: string; b: string } | null) => void
  /** the run picked, first day first (one day: a === b) */
  onRange: (a: string, b: string) => void
  /** 1 = the next month, -1 = the one before */
  onSwipe: (dir: 1 | -1) => void
}

export function initCalPick(el: HTMLElement, o: CalPick): () => void {
  let st: { iso: string; end: string; mouse: boolean; armed: boolean; ranged: boolean; x0: number; y0: number; timer: any; id: number } | null = null
  let retire: (() => void) | null = null

  const dayAt = (x: number, y: number, fallback: EventTarget | null): string | null => {
    const hit = typeof document.elementFromPoint === 'function' ? document.elementFromPoint(x, y) : (fallback as Element | null)
    const cell = hit && typeof (hit as Element).closest === 'function' ? (hit as Element).closest('[data-icday]') as HTMLElement | null : null
    return cell && el.contains(cell) ? cell.dataset.icday || null : null
  }
  const run = (s: NonNullable<typeof st>) => (s.iso <= s.end ? { a: s.iso, b: s.end } : { a: s.end, b: s.iso })
  /* THE CLICK THAT FOLLOWS A RELEASE lands on whatever is under the pointer NOW — and a tap or a pick has just opened a
     window there (found on the first look at the running build, 8 Oct 26: a tap on a date opened the day's window
     under the finger, and the click that followed pressed its "+ Commitment"). The dates themselves do nothing on a
     click, so the click after ANY tap or pick here is swallowed, once; the next real press, or a short wait, retires
     the guard so a click that never comes cannot eat a later one. */
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
    document.addEventListener('click', eat, { capture: true, once: true })
    document.addEventListener('pointerdown', offAll, { capture: true, once: true })
    timer = setTimeout(offAll, 350)
    retire = offAll
  }
  const drop = () => { if (st) clearTimeout(st.timer); st = null }

  const onDown = (e: PointerEvent) => {
    if (e.isPrimary === false || (e.button != null && e.button !== 0)) return
    const t = e.target as HTMLElement
    if (!t || typeof t.closest !== 'function' || t.closest('button,input,select,textarea,a')) return
    const cell = t.closest('[data-icday]') as HTMLElement | null
    if (!cell || !el.contains(cell)) return
    drop()
    const iso = cell.dataset.icday!
    const mouse = e.pointerType === 'mouse'
    const rec = { iso, end: iso, mouse, armed: false, ranged: false, x0: e.clientX, y0: e.clientY, timer: 0 as any, id: e.pointerId }
    if (o.canPick()) {
      if (mouse) rec.armed = true                       // a mouse needs no hold: its drag means nothing else here
      else rec.timer = setTimeout(() => { if (st === rec) { rec.armed = true; o.onPicking(run(rec)) } }, PICK_HOLD)
    }
    st = rec
  }
  const onMove = (e: PointerEvent) => {
    if (!st || e.pointerId !== st.id) return
    if (!st.armed) {
      /* a finger that has left where it went down is not holding still: no pick will begin */
      if (Math.abs(e.clientX - st.x0) > PICK_SLOP || Math.abs(e.clientY - st.y0) > PICK_SLOP) clearTimeout(st.timer)
      return
    }
    const at = dayAt(e.clientX, e.clientY, e.target)
    if (!at || at === st.end) return
    st.end = at
    if (st.mouse) st.ranged = true                      // a mouse has picked once it has reached a second date
    o.onPicking(run(st))
  }
  const onUp = (e: PointerEvent) => {
    if (!st || e.pointerId !== st.id) return
    const s = st
    drop()
    if (s.armed && (s.ranged || !s.mouse)) {
      o.onPicking(null)
      /* a mouse let go outside the month has changed its mind */
      if (s.mouse && !dayAt(e.clientX, e.clientY, e.target)) return
      const r = run(s)
      swallowClick()
      o.onRange(r.a, r.b)
      return
    }
    const dx = e.clientX - s.x0, dy = e.clientY - s.y0
    if (!s.mouse && Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) { o.onSwipe(dx < 0 ? 1 : -1); return }
    if (Math.abs(dx) <= PICK_SLOP && Math.abs(dy) <= PICK_SLOP) { swallowClick(); o.onTap(s.iso) }
  }
  const onCancel = (e: PointerEvent) => {
    if (!st || e.pointerId !== st.id) return
    const lit = st.armed
    drop()
    if (lit) o.onPicking(null)
  }
  /* claimed only while a held finger is drawing a run — at every other time the page scrolls as it should */
  const onTouchMove = (e: Event) => { if (st && st.armed && !st.mouse && e.cancelable) e.preventDefault() }
  /* a long press must not raise the browser's own menu over a day that is being picked */
  const onMenu = (e: Event) => { if (st && st.armed && !st.mouse) e.preventDefault() }

  el.addEventListener('pointerdown', onDown, { passive: true })
  el.addEventListener('touchmove', onTouchMove, { passive: false })
  el.addEventListener('contextmenu', onMenu)
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  window.addEventListener('pointercancel', onCancel, { passive: true })
  return () => {
    drop()
    retire?.()
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('contextmenu', onMenu)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onCancel)
  }
}
