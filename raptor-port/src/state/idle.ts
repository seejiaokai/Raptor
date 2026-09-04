// App-wide "how long since the user last did anything" — one timestamp, bumped
// by document-level input listeners, read by background work that must only run
// during a genuine pause. The Leave War pre-warm uses it: after login it draws
// its first months only once the user has been hands-off for a moment, so a
// draw never lands under a keystroke, a scroll, or a puck drag (owner, 4 Sep 26
// — "does typing text lag when it's pre-downloading? … draw the first 3 months
// quietly … only when my hands are off"). Nothing here touches app state; it is
// a plain timestamp so the listeners can be passive and cost a single write.

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

let lastInputTs = now()

/** Milliseconds since the last pointer / key / scroll / touch event anywhere in
 *  the app. Large == the user is idle. */
export function msSinceInput(): number {
  return now() - lastInputTs
}

/** For tests / the very first tick: treat the user as active right now. */
export function markInput(): void {
  lastInputTs = now()
}

let installed = false

/** Wire the document-level listeners once (Shell mount). Idempotent; returns a
 *  teardown, though in practice the tracking lives for the whole session. Every
 *  listener does nothing but stamp the clock — passive + capture so it never
 *  interferes with a real handler and is seen even when a child stops
 *  propagation. pointermove / touchmove are included so an in-progress DRAG
 *  keeps the app "active" (a drag fires no fresh pointerdown), which is exactly
 *  when a background draw must stay away. */
export function installIdleTracking(): () => void {
  if (installed || typeof document === 'undefined') return () => {}
  installed = true
  const bump = () => { lastInputTs = now() }
  const opts: AddEventListenerOptions = { passive: true, capture: true }
  const evts = ['pointerdown', 'pointermove', 'pointerup', 'keydown', 'wheel', 'touchstart', 'touchmove', 'scroll'] as const
  for (const e of evts) document.addEventListener(e, bump, opts)
  return () => {
    installed = false
    for (const e of evts) document.removeEventListener(e, bump, opts)
  }
}
