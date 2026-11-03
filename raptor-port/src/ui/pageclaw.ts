/* THE LOADING CLAW WHILE A SLOW PAGE OPENS ([TALON-CLAW-PAGES], D1607, D1610). One overlay for the whole app: the same
   claw the app shows while it starts (index.html's #bootclaw, D1605), laid over the page area under the top bar, the bar
   staying in view and in reach. Its styles are index.html's own (.pgclaw beside #bootclaw — one definition, nothing more
   to download): hidden for its first 0.3 s, so a quick page shows nothing; moving only by sliding and fading, which the
   browser keeps running while the page's code is busy drawing; still for a reader who asked for less motion.
   A page raises it by rendering <PageClaw page="…" /> while it is not yet drawn — the Leave War's separate download
   first (D1610: tried first on the Leave War, before the other pages are measured). It is not a React-drawn element: it
   is put on the page by hand and taken away by hand, so that when the page arrives it can fade out over it in 0.2 s, as
   the start-up claw does, instead of vanishing with the placeholder that held it. Never added to the page's time: it
   goes the moment its page is drawn, without waiting for its round to finish. */
import { useLayoutEffect } from 'react'
import { CURPAGE } from '../state/view'
import { BOOTCLAW_FADE_MS } from './bootclaw'

// the logo's own three claws (ui/Login.tsx, index.html), each in its own window laid along it — index.html's
// windows #bc-w0..2, here the classes .pw0..2 (pinned to match by pageclaw.test.ts)
export const PAGECLAW_PATHS = [
  'M3 8 Q4.9 38.3 24 62 Q11.5 35.8 3 8 Z',
  'M16 0 Q17.4 35.0 42 60 Q26.6 31.0 16 0 Z',
  'M31 -2 Q36.4 23.5 58 38 Q42.9 19.1 31 -2 Z',
]

/** Lay the claw over the page area; returns the element. */
export function raisePageClaw(page: string): HTMLElement {
  const el = document.createElement('div')
  el.className = 'pgclaw'
  // TEST ONLY (D1610's test on his phone): ?pageclaw=now drops the 0.3 s wait — taken out once he has chosen
  if (new URLSearchParams(window.location.search).get('pageclaw') === 'now') el.classList.add('now')
  el.setAttribute('role', 'img')
  el.setAttribute('aria-label', 'TALON is loading')
  el.dataset.page = page
  el.innerHTML = '<div class="mk" aria-hidden="true"><div class="cs">'
    + PAGECLAW_PATHS.map((d, i) => `<div class="w pw${i}"><svg viewBox="0 -2 60 64"><path class="c" d="${d}"/></svg></div>`).join('')
    + '</div></div>'
  document.body.appendChild(el)
  return el
}

/** Take the claw away. `arrived`: its page has just been drawn (fade over it), else he left first (go at once). */
export function dismissPageClaw(el: HTMLElement, arrived: boolean): void {
  if (!el.isConnected || el.classList.contains('gone')) return
  const still = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // still inside its first 0.3 s, the claw was never seen: nothing to fade
  const unseen = typeof getComputedStyle === 'function' && getComputedStyle(el).opacity === '0'
  if (!arrived || still || unseen) { el.remove(); return }
  el.classList.add('gone')
  window.setTimeout(() => el.remove(), BOOTCLAW_FADE_MS)
}

/** Rendered where a page is not yet drawn (a Suspense placeholder); the claw stays while this is mounted. */
export function PageClaw({ page }: { page: string }) {
  useLayoutEffect(() => {
    const el = raisePageClaw(page)
    // read at the moment it goes: still on this page means the page has arrived; anywhere else, he left before it did
    return () => dismissPageClaw(el, CURPAGE === page)
  }, [page])
  return null
}

