/* ON A PHONE THE PAGE NEVER ZOOMS — ONLY THE GRIDS DO (owner D1567, 2 Nov 26 — "Can u disable the other kind of
   zooming? So only allow the grids to be zoomed. Not the page. Sometimes I get stuck and I can't zoom out if the page
   zooms in." — with his iPhone screen recording).

   Three locks, because each browser listens to a different one:
   · the stylesheet's `touch-action:pan-x pan-y` on the page (00-foundation-login.css) — a finger pans, nothing of the
     browser's zooms; Chrome, Android's browsers and Safari all read it;
   · Android's page setting, `maximum-scale=1, user-scalable=no` (index.html) — iOS has ignored it since iOS 10;
   · HERE, an iPhone's own pinch: Safari zooms the page by its `gesturestart` / `gesturechange` events as well as by the
     touches, so both are cancelled on the whole document.
   The grids that zoom by their own pinch read the TOUCHES (ui/pinchzoom.ts, the Tracker's chart), never these gesture
   events, so they keep zooming; each already cancels the gestures over itself the same way.

   Nothing else is listened for: a document-wide touchmove listener that could cancel would make every scroll of every
   page wait on the app (D991), and the three locks above already cover a pinch. Only on a touch-first screen — a
   desktop Safari's trackpad pinch rides the same gesture events, and a desktop keeps the browser's own zoom (D1286). */

/** true on a screen whose main pointer is a finger — a phone or a tablet, never a desktop with a mouse or trackpad */
export function touchFirst(win: Window = window): boolean {
  return typeof win.matchMedia === 'function' && win.matchMedia('(pointer: coarse)').matches
}

const GESTURES = ['gesturestart', 'gesturechange'] as const

/** Hold the page from zooming on a touch-first screen; returns the way to take the hold off (for tests). */
export function installNoPageZoom(doc: Document = document, win: Window = window): () => void {
  if (!touchFirst(win)) return () => {}
  const hold = (e: Event) => e.preventDefault()
  for (const t of GESTURES) doc.addEventListener(t, hold, { passive: false })
  return () => { for (const t of GESTURES) doc.removeEventListener(t, hold) }
}
