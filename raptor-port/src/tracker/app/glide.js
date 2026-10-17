/* THE FINGER GLIDE — the numbers and the motion behind the Tracker's chart and Info half when a finger scrolls them
   (owner D985, 17 Oct 26 — "I want the scroll to have acceleration and deceleration when I scroll on my phone";
   round 1 answered D986–D989). Plain functions, no DOM state of their own, so the feel can be pinned by unit tests
   (glide.test.ts) and tuned in one place. `dragScroll` in core.js is the one caller.

   The model is one position per axis that may run PAST the scroll range: the box is scrolled to the part inside the
   range, and the part outside is drawn as a stretch — the content moved by `rubber()` of it — which springs back.
   - While the finger is down the view follows it exactly; past an end it gives less and less (D987).
   - At the lift the finger's speed over its last moments carries on and decays at the iPhone's own rate (D985).
   - A glide that reaches an end carries past it and springs back (D987); so does a stretch the finger lets go of. */

/* UIScrollView's "normal" deceleration: the speed keeps this share of itself every thousandth of a second. A flick at
   2 px/ms (a brisk swipe) runs on about 1000px before it stops — the same throw as the phone's own lists. */
export const DECEL = 0.998
/* below this speed (px/ms — 20px a second) a glide is over, and a lift slower than it starts none */
export const MIN_V = 0.02
/* a flick's speed is capped here (px/ms), so one stray sample at the lift cannot fling the chart off to its end */
export const MAX_V = 8
/* the finger's speed is read over its last 80ms; a finger that rested longer than 60ms before lifting meant to stop */
export const V_WINDOW = 80
export const V_REST = 60
/* how much a stretch gives (the iPhone's 0.55): pulled a box-height past the end, the content moves about a third of it */
export const RUBBER = 0.55
/* the spring that brings a stretch back — critically damped, so it settles without swinging through the end.
   At 0.012/ms a glide meeting an end at 2 px/ms runs about 60px past it at the peak (~85ms), back within ~0.5s. */
export const SPRING = 0.012

/* The stretch drawn for `over` px past an end, in a box `dim` px long: never as far as the box itself. */
export function rubber(over, dim) {
  if (!over || !(dim > 0)) return 0
  const a = Math.abs(over)
  return Math.sign(over) * (1 - 1 / (a * RUBBER / dim + 1)) * dim
}
/* The other way: how far past the end a drawn stretch `r` stands for (used when a finger catches a stretch mid-bounce). */
export function unrubber(r, dim) {
  if (!r || !(dim > 0)) return 0
  const a = Math.min(Math.abs(r), dim * 0.999)
  return Math.sign(r) * (dim / RUBBER) * (1 / (1 - a / dim) - 1)
}

/* The finger's speed at the lift, from its recent samples ({t, x, y}, oldest first, in the scroll direction already:
   a finger moving up gives a positive y, the way the scroll position grows). Returns {vx, vy} in px/ms. */
export function liftVelocity(samples, now) {
  const n = samples.length
  if (n < 2) return { vx: 0, vy: 0 }
  const last = samples[n - 1]
  if (now - last.t > V_REST) return { vx: 0, vy: 0 }
  let i = n - 2
  while (i > 0 && last.t - samples[i - 1].t <= V_WINDOW) i--
  const first = samples[i], dt = last.t - first.t
  if (dt <= 0) return { vx: 0, vy: 0 }
  const cap = v => Math.max(-MAX_V, Math.min(MAX_V, v))
  return { vx: cap((last.x - first.x) / dt), vy: cap((last.y - first.y) / dt) }
}

/* One axis of the motion. `a` is {p, v, max}: p the position (may be past 0 or max), v its speed in px/ms, max the
   end of the scroll range. Advances it by dt ms in place; returns true while it is still moving. Inside the range the
   speed decays at DECEL (integrated exactly, so the distance does not depend on the frame rate); once past an end, the
   overshoot is a critically damped spring toward that end, stepped in short slices so it stays stable. */
export function stepAxis(a, dt) {
  if (dt <= 0) return moving(a)
  const max = Math.max(0, a.max)
  if (a.p >= 0 && a.p <= max) {
    const k = Math.pow(DECEL, dt), lnD = Math.log(DECEL)
    const np = a.p + a.v * (k - 1) / lnD, nv = a.v * k
    if (np < 0 || np > max) {
      /* it reaches an end inside this step: put it on the end, at the speed it has there, and let the spring take
         the rest of the step */
      const edge = np < 0 ? 0 : max
      /* time to reach the edge: solve p + v(D^t - 1)/lnD = edge */
      const f = 1 + (edge - a.p) * lnD / a.v
      const te = f > 0 ? Math.log(f) / lnD : dt
      const tHit = Math.max(0, Math.min(dt, te))
      a.v = a.v * Math.pow(DECEL, tHit); a.p = edge
      return stepSpring(a, dt - tHit, edge, np < 0 ? -1 : 1)
    }
    a.p = np; a.v = nv
    if (Math.abs(a.v) < MIN_V) a.v = 0
    return a.v !== 0
  }
  return a.p < 0 ? stepSpring(a, dt, 0, -1) : stepSpring(a, dt, max, 1)
}
/* side: -1 past the start, +1 past the end */
function stepSpring(a, dt, edge, side) {
  const w = SPRING
  let o = a.p - edge, v = a.v, left = dt
  while (left > 0) {
    const h = Math.min(4, left); left -= h
    const acc = -w * w * o - 2 * w * v
    v += acc * h; o += v * h
    /* back inside the range: a critically damped spring never gets there by itself (a coarse step can), but a finger
       that flicked a stretch back inward does — the end is the rest point, and any inward speed glides on from it */
    if (o * side < 0) { o = 0; if (Math.abs(v) < MIN_V) v = 0; break }
  }
  if (Math.abs(o) < 0.5 && Math.abs(v) < MIN_V) { o = 0; v = 0 }
  a.p = edge + o; a.v = v
  return moving(a)
}
function moving(a) { return a.v !== 0 || a.p < 0 || a.p > Math.max(0, a.max) }
