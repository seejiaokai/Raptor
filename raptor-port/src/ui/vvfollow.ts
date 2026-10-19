/* FOLLOW THE VISIBLE SCREEN FRAME BY FRAME WHILE THE KEYBOARD MOVES (owner D1081, 19 Oct 26 — his iPhone recording: "when
   I close my keyboard there is 1 frame of some other out of position screen then back … It makes it look like a
   stutter"; frame by frame, the Scheduler Board stood about a keyboard's height lower for three frames as the keys
   started down, the dark page behind it above).

   WHY. A layer placed by the visible screen (window.visualViewport — its offsetTop, its height) followed it only on the
   visual viewport's own `resize` and `scroll` events. An iPhone pans the screen to show a box being typed in, and when
   the keys go down it pans back at once — but its events arrive frames later, so for those frames the layer still stood
   where the pan had been.

   WHAT THIS DOES. Besides those events, the layer is placed again on every animation frame for a short while after
   anything that moves the keyboard begins: a box gaining or losing the focus (the keys start to open or close at that
   moment, before any event), and each event itself. Each frame reads the visible screen as it is then, so the layer
   moves with it. Outside those moments it costs nothing. */
const FOLLOW_MS = 900

/** Calls `place` now, on the visual viewport's resize and scroll, and on every frame for FOLLOW_MS after one of them or
    after a focus change. Returns the way to stop. With no visual viewport (jsdom, an old browser) only `place` now. */
export function followVisible(place: () => void): () => void {
  const vv = typeof window !== 'undefined' ? window.visualViewport : null
  place()
  if (!vv) return () => {}
  let until = 0, raf = 0
  const tick = () => {
    raf = 0
    place()
    if (performance.now() < until) raf = requestAnimationFrame(tick)
  }
  const kick = () => {
    until = performance.now() + FOLLOW_MS
    place()
    if (!raf) raf = requestAnimationFrame(tick)
  }
  vv.addEventListener('resize', kick); vv.addEventListener('scroll', kick)
  document.addEventListener('focusin', kick, true); document.addEventListener('focusout', kick, true)
  return () => {
    vv.removeEventListener('resize', kick); vv.removeEventListener('scroll', kick)
    document.removeEventListener('focusin', kick, true); document.removeEventListener('focusout', kick, true)
    if (raf) cancelAnimationFrame(raf)
  }
}
