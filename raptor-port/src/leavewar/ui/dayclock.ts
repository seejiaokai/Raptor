/* THE LEAVE WAR'S DAY CLOCK (owner D1266, 23 Oct 26 — "today moves at midnight with the page left open"). What reads
   today — a member's open dates from his today (D1211), his dimmed and locked days, his outline, the landing mark — was
   worked out at the last change, so a page left open across midnight stayed a day behind until something changed. This
   watches for the day to turn and tells the store (state/store.ts dayTurned): a timer set for just after the next local
   midnight, and a look whenever the page is shown again — a phone that slept through midnight runs no timer, and a
   timer set on a sleeping phone can fire late. One clock for the page; it holds nothing but the day it last saw. */
import { memberToday } from '../engine'
import { dayTurned } from '../state/store'

/** Milliseconds from `now` to one second past the next local midnight. */
export function msToMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1)
  return Math.max(1000, next.getTime() - now.getTime())
}

/** Start the clock; returns its clean-up. */
export function installDayClock(): () => void {
  let seen = memberToday()
  let timer: ReturnType<typeof setTimeout> | null = null
  const check = () => {
    const now = memberToday()
    if (now !== seen) { const prev = seen; seen = now; dayTurned(prev, now) }
  }
  const arm = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { check(); arm() }, msToMidnight(new Date()))
  }
  const onShow = () => { if (typeof document === 'undefined' || document.visibilityState !== 'hidden') { check(); arm() } }
  arm()
  document.addEventListener('visibilitychange', onShow)
  window.addEventListener('pageshow', onShow)
  window.addEventListener('focus', onShow)
  return () => {
    if (timer) clearTimeout(timer)
    document.removeEventListener('visibilitychange', onShow)
    window.removeEventListener('pageshow', onShow)
    window.removeEventListener('focus', onShow)
  }
}
