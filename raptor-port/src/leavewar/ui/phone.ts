// IS THIS A PHONE? — the Leave War's one answer for a component that must DRAW something different on a phone, not
// merely size it differently ([LW-PHONE-HEADER-SPACE], owner D678, 8 Oct 26: the top of the page is two lines there,
// with the stage's two moves behind the stage button).
//
// "A phone" is the width the Leave War's own stylesheets already call one — `@media (max-width: 430px)` in chrome.css
// and matrix.css, and the Required panel's own check. It is deliberately the SAME query string as the stylesheet's:
// the words a component draws and the layout the stylesheet gives them change at one width, never at two. A tablet
// and a desktop are everything wider, and D679 ("keep the same for desktop") keeps their top exactly as it was.
//
// Followed LIVE, unlike the one-shot reads elsewhere in this folder: a phone turned on its side, or a desktop window
// dragged narrow, crosses the width while the page is up, and a strip half-drawn for the other size would put the
// stage's moves nowhere at all. Where the browser has no matchMedia (jsdom, a very old engine) the answer is "not a
// phone" — which is why every unit test written before this one still sees the desktop's strip.
import { useSyncExternalStore } from 'react'

export const PHONE_QUERY = '(max-width: 430px)'

const query = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(PHONE_QUERY) : null)

function subscribe(onChange: () => void) {
  const mq = query()
  if (!mq) return () => {}
  /* `addEventListener` on a media query arrived in Safari 14; the older `addListener` is the same signal */
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }
  mq.addListener(onChange)
  return () => mq.removeListener(onChange)
}

const isPhone = () => !!query()?.matches

export function usePhone(): boolean {
  return useSyncExternalStore(subscribe, isPhone, () => false)
}
