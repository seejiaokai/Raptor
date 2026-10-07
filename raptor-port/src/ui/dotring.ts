/* THE DOTTED RING'S THICKNESS ON A SCALED SCREEN ([PUCK-DOT-ZOOM], owner, 6 Oct 26 — "i cant see the red crew rest
   warning, over the amber line … its when im at default zoom"; his screen runs Windows at 125%).

   The dotted red ring on a puck ("this day breaks tomorrow's crew rest", `.puck.boxdot` in
   scheduler/04-pucks-sections.css) is asked for at 1.5px, 2px clear of the puck. A browser rounds both DOWN to whole
   screen pixels. On an unscaled screen that is a one-pixel ring two pixels out, clear of an advisory's amber ring
   (1.5px of shadow). At Windows' 125% the ring is still ONE screen pixel thick, but its clearance comes to two
   screen pixels while the amber ring now spreads nearly two — so the dots sit hard against the amber and read as
   that ring's dark edge. Zoomed out it is one pixel against a ring that has shrunk to meet it. Measured in Chromium
   started at each scaling, 6 Oct 26 (scripts/handpass/zoom-dot.mjs — pixels of the ring's own red round one puck):
   at 125%, 100 one pixel thick against 233 two thick; at 80%, 34 against 92.
   (Two wrong turns, so nobody takes them again: moving the ring further out changes nothing the browser does not
   already round away; and Playwright's `deviceScaleFactor` cannot show any of this — it scales the finished picture
   and leaves the page's arithmetic at 1.)

   So on a screen whose scaling is not a whole number the ring is drawn TWO screen pixels thick. A stylesheet has no
   unit for a screen pixel, so the page works the width out here and hands it over as `--dot-w`. On a whole-number
   scaling — an unscaled desktop, his phone at 2x or 3x — nothing is handed over and the stylesheet's own 1.5px
   stands, exactly as before; scalings from about 135% up already drew two pixels and are unchanged. */
export function dotRingWidth(dpr: number): string | null {
  if (typeof dpr !== 'number' || !isFinite(dpr) || dpr <= 0) return null
  if (Math.abs(dpr - Math.round(dpr)) < 0.01) return null           // whole-number scaling: the stylesheet's own width stands
  const dev = Math.max(2, Math.floor(1.5 * dpr))
  /* a hair over, so the browser's own rounding-down of an outline's width to whole pixels cannot drop one */
  return (Math.round(((dev + 0.02) / dpr) * 10000) / 10000) + 'px'
}

/** Sets (or clears) `--dot-w` on the page now and whenever the scaling changes: a browser zoom arrives as a resize,
    a window dragged to a screen with another scaling as a resolution change. Returns the way to stop following. */
export function installDotRing(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {}
  let live = true, mq: MediaQueryList | null = null
  const set = () => {
    if (!live) return
    const w = dotRingWidth(window.devicePixelRatio)
    if (w) document.documentElement.style.setProperty('--dot-w', w)
    else document.documentElement.style.removeProperty('--dot-w')
    /* a resolution query matches ONE value, so it is re-armed at each new one */
    try {
      if (mq) mq.removeEventListener('change', set)
      mq = typeof window.matchMedia === 'function' ? window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`) : null
      if (mq && mq.addEventListener) mq.addEventListener('change', set)
    } catch (_) { mq = null }
  }
  set()
  window.addEventListener('resize', set)
  return () => {
    live = false
    window.removeEventListener('resize', set)
    try { if (mq) mq.removeEventListener('change', set) } catch (_) { /* nothing to stop */ }
  }
}
