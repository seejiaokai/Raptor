/* Week panning — the reference's horizontal-scroll block, bodies verbatim:
   the ‹ › arrows (one click = exactly one day box), shift+wheel, the pinned
   proxy scrollbar at the foot of the window (two-way sync with no ownership
   lock — see the B33 note), the palette following the visible day, the day
   dots on a phone, and the wave blocks in a day mirroring each other's
   sideways swipe. */
import * as view from '../state/view'
import { notify } from '../state/store'

const $ = (id: string) => document.getElementById(id) as HTMLElement | null

/* ---- week horizontal-scroll arrows ---- */
function activeWeekEl() { return view.CURPAGE === 'editsched' ? $('eWeek') : $('vWeek') }
export function updateWeekNav() {
  const on = (view.CURPAGE === 'viewsched' || view.CURPAGE === 'editsched') && window.innerWidth > 820
  const p = $('weekPrev'), n = $('weekNext')
  if (p) (p as any).hidden = !on
  if (n) (n as any).hidden = !on
  hsSync()
}
/* one click = exactly one day box. Measured from the live layout (box + gap) so
   it stays right whatever the day width is, and it lands ON a day boundary
   rather than drifting by a fraction of a box each time. */
function dayStep(w: any) {
  const ds = w.querySelectorAll('.day')
  if (ds.length > 1) return Math.round(ds[1].offsetLeft - ds[0].offsetLeft)
  if (ds.length === 1) return Math.round(ds[0].getBoundingClientRect().width + 14)
  return Math.round(w.clientWidth * 0.9)
}
/* One click = one WHOLE day box, landing on the boundary. Rounding to the
   nearest day would stall on a click when the view sits mid-day, so step from
   the day you are leaving: floor going right, ceil going left. */
export function panDays(dir: number) {
  const w = activeWeekEl(); if (!w) return
  const st = dayStep(w); if (!st) return
  const n = w.querySelectorAll('.day').length || 1
  const at = w.scrollLeft / st
  const cur = dir > 0 ? Math.floor(at + 0.02) : Math.ceil(at - 0.02)
  const tgt = Math.max(0, Math.min(n - 1, cur + dir)) * st
  w.scrollTo({ left: Math.min(tgt, Math.max(0, w.scrollWidth - w.clientWidth)), behavior: 'smooth' })
}

/* ---- sticky bottom horizontal scroll bar (desktop) ----
   A proxy track pinned to the bottom of the viewport that scrolls the active
   week. Kept in two-way sync with the week's own scrollLeft. */
/* B33 · the two-way sync no longer needs an ownership lock at all.
   The loop is self-terminating if the two mappings are exact inverses, which
   they are: track→week is trk/tmax*wmax and week→track is week/wmax*tmax. So a
   write only has to be suppressed when the element is ALREADY where it belongs.
   Round-trip rounding error is bounded by 0.5 + 0.5*(tmax/wmax) and tmax/wmax =
   trackWidth/weekWidth < 1, so it never exceeds 1px — HS_EPS=1.5 stops the
   bounce after one hop while still passing every real move through 1:1. */
const HS_EPS = 1.5
/* behavior must be 'instant', NOT 'auto'. 'auto' means "obey the element's CSS"
   and .week carries scroll-behavior:smooth — so every mirror write was being
   ANIMATED. 'instant' applies the position in the same tick, which is what a
   scrollbar is. Returns true when it actually moved anything. */
export function hsSet(el: any, px: number) {
  if (!el) return false
  const max = Math.max(0, el.scrollWidth - el.clientWidth)
  px = Math.max(0, Math.min(max, Math.round(px)))
  if (Math.abs(el.scrollLeft - px) <= HS_EPS) return false   // already in sync — do not echo
  try { el.scrollTo({ left: px, behavior: 'instant' }) } catch (e) { el.scrollLeft = px }
  if (Math.abs(el.scrollLeft - px) > HS_EPS) el.scrollLeft = px // browser ignored 'instant'
  return true
}
function hsWeek() {
  const sb = $('schedBoard')
  if (sb && !(sb as any).hidden) return null
  if (view.CURPAGE !== 'viewsched' && view.CURPAGE !== 'editsched') return null
  const w = activeWeekEl()
  return (w && w.offsetParent !== null) ? w : null
}
export function hsSync() {
  const bar = $('hscroll'), trk = $('hsTrack'), inn = $('hsIn'), lbl = $('hsLbl')
  if (!bar || !trk) return
  const w = hsWeek()
  const over = w ? (w.scrollWidth - w.clientWidth) : 0
  const on = !!w && window.innerWidth > 820 && over > 12
  bar.classList.toggle('on', on)
  if (!on) return
  const r = w!.getBoundingClientRect()
  bar.style.left = Math.max(0, Math.round(r.left)) + 'px'
  bar.style.width = Math.round(r.width) + 'px'
  // proportional thumb: make the proxy's scrollable width mirror the week's,
  // scaled to the track width, so 1px of thumb travel maps linearly
  const tw = trk.clientWidth || 1
  /* thumb size stays proportional; the ENDS are what must line up, so travel is
     mapped overflow-to-overflow rather than by a width ratio */
  inn!.style.width = Math.round(w!.scrollWidth * (tw / w!.clientWidth)) + 'px'
  const tmax = trk.scrollWidth - trk.clientWidth
  hsSet(trk, over > 0 ? (w!.scrollLeft / over) * tmax : 0)
  const days = w!.querySelectorAll('.day').length
  if (days) {
    const dw = w!.scrollWidth / days
    const a = Math.floor(w!.scrollLeft / dw) + 1, b = Math.min(days, Math.ceil((w!.scrollLeft + w!.clientWidth) / dw))
    lbl!.textContent = `day ${a}–${b} of ${days}`
  } else lbl!.textContent = ''
}
function hsLabel() {
  const w = hsWeek(), lbl = $('hsLbl'); if (!w || !lbl) return
  const days = w.querySelectorAll('.day').length; if (!days) return
  const dw = w.scrollWidth / days
  const a = Math.floor(w.scrollLeft / dw) + 1, b = Math.min(days, Math.ceil((w.scrollLeft + w.clientWidth) / dw))
  lbl.textContent = `day ${a}–${b} of ${days}`
}

/* the palette shows one day's availability. Panning the week changes which day
   you are looking at, so the palette walks along with it — debounced, because a
   scroll fires on every frame and rebuilding 60 pucks per frame is wasteful. */
/* the reading itself is state/view.ts's weekLeftDay — the same one setPage
   takes when it carries the day across a page switch, shared rather than
   copied so the palette and the carry can never disagree about which day is
   "the one you are looking at". ROSDAY stands in when there is nothing to
   read (no week built yet), which is what this always did. */
function weekDay() {
  const d = view.weekLeftDay(activeWeekEl())
  return d == null ? view.ROSDAY : d
}
let ROSDAY_T: any = 0
export function rosDayFollow() {
  if (view.ARM) return                       // an armed slot pins the palette to ITS day
  clearTimeout(ROSDAY_T)
  ROSDAY_T = setTimeout(() => { const d = weekDay(); if (d !== view.ROSDAY) { view.setRosDay(d); notify() } }, 110)
}

/* ---- the document-level listeners, verbatim wiring ---- */
/* shift+wheel pans the week. Routed through hsSet for the same reason the proxy
   is: a bare `scrollLeft +=` obeys .week{scroll-behavior:smooth}, so each notch
   started a fresh animation and the pan stuttered instead of following the wheel. */
/* This listener is registered NON-PASSIVE (it must preventDefault when it pans),
   which means the browser waits for it before every scroll step, everywhere on
   the page. So the common case — no shift held — has to cost a boolean test and
   nothing more. It used to walk the DOM (closest) on every wheel tick first,
   which a fast JIT hides completely; Edge's "enhanced security" mode runs
   unfamiliar sites without the JIT, and there that walk was a visible per-tick
   tax the scroll had to wait for (owner, 11 Aug 26 — Edge scroll stutter). */
function onWheel(e: WheelEvent) {
  if (!e.shiftKey || !e.deltaY) return
  const w = (e.target as HTMLElement).closest('.week')
  if (w) { hsSet(w, (w as HTMLElement).scrollLeft + e.deltaY); e.preventDefault() }
}
function onTrackScroll() {
  const w = hsWeek(); if (!w) return
  const trk = $('hsTrack')!
  const tmax = trk.scrollWidth - trk.clientWidth
  const wmax = w.scrollWidth - w.clientWidth
  hsSet(w, tmax > 0 ? (trk.scrollLeft / tmax) * wmax : 0)
  hsLabel()
}
function onDocScroll(e: Event) {
  const w = e.target as HTMLElement
  if (!w || !w.classList) return
  /* a week panned → mirror to the proxy, follow with the palette */
  if (w.classList.contains('week')) {
    hsLabel(); rosDayFollow()
    const trk = $('hsTrack'); if (!trk) return
    const tmax = trk.scrollWidth - trk.clientWidth, wmax = w.scrollWidth - w.clientWidth
    hsSet(trk, wmax > 0 ? (w.scrollLeft / wmax) * tmax : 0)
    return
  }
  /* Swiping one wave block sideways drags every other wave in the same day with
     it, so RMKS / AREA / TIME stay lined up down the column instead of each wave
     needing its own swipe. The >1px guard stops the mirrored writes from
     ping-ponging. */
  if (window.innerWidth <= 820 && w.classList.contains('go')) {
    const day = w.closest('.day'); if (!day) return
    const x = w.scrollLeft
    day.querySelectorAll('.go').forEach((o: any) => { if (o !== w && Math.abs(o.scrollLeft - x) > 1) o.scrollLeft = x })
    return
  }
  /* the view week under the day dots (phone) — light the nearest day's dot */
  if (w.id === 'vWeek') { /* handled by the week branch above */ }
}
/* the day dots (phone): light the dot nearest the middle of the view */
function onDotsScroll(e: Event) {
  const wk = (e.target as HTMLElement).closest && (e.target as HTMLElement).closest('#vWeek') as HTMLElement | null
  if (!wk) return
  const dots = $('vDots'); if (!dots) return
  const mid = wk.scrollLeft + wk.clientWidth / 2; let best = 0, bd = 1e9
  wk.querySelectorAll('.day').forEach((el: any, i: number) => { const c = el.offsetLeft + el.offsetWidth / 2; const dd = Math.abs(c - mid); if (dd < bd) { bd = dd; best = i } })
  dots.querySelectorAll('button').forEach((b: any, i: number) => b.classList.toggle('on', i === best))
}
function onDotsClick(e: MouseEvent) {
  const b = (e.target as HTMLElement).closest('#vDots [data-day]') as HTMLElement | null; if (!b) return
  const el = $('vWeek')!.querySelectorAll('.day')[+b.dataset.day!]
  el && el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
}
function onResize() { updateWeekNav() }

export function initPan() {
  const trk = $('hsTrack')
  document.addEventListener('wheel', onWheel, { passive: false })
  document.addEventListener('scroll', onDocScroll, true)
  document.addEventListener('scroll', onDotsScroll, true)
  document.addEventListener('click', onDotsClick)
  if (trk) trk.addEventListener('scroll', onTrackScroll)
  window.addEventListener('resize', onResize)
  updateWeekNav()
  /* on a phone, jump to today's column, as bootApp does */
  if (window.innerWidth <= 820) setTimeout(() => { const t = document.querySelector('#vWeek .day.today'); if (t) t.scrollIntoView({ inline: 'start', block: 'nearest' }) }, 120)
  return () => {
    clearTimeout(ROSDAY_T)
    document.removeEventListener('wheel', onWheel)
    document.removeEventListener('scroll', onDocScroll, true)
    document.removeEventListener('scroll', onDotsScroll, true)
    document.removeEventListener('click', onDotsClick)
    if (trk) trk.removeEventListener('scroll', onTrackScroll)
    window.removeEventListener('resize', onResize)
  }
}
