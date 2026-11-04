/* THE LOADING CLAW WHILE A SLOW PAGE OPENS ([TALON-CLAW-PAGES], D1607, D1610, D1611). One overlay for the whole app: the
   same claw the app shows while it starts (index.html's #bootclaw, D1605), laid over the page area under the top bar, the
   bar staying in view and in reach. Its styles are index.html's own (.pgclaw beside #bootclaw — one definition, nothing
   more to download), drawing from the tap with no 0.3 s wait (D1611); moving only by sliding and fading, which the browser
   keeps running while the page's code is busy drawing; still for a reader who asked for less motion.
   A page raises it by rendering <PageClaw page="…" /> while it is not yet drawn. Only the pages measured to go blank do
   (3 Nov 26, scripts/handpass/talon-page-blank.mjs): the Leave War and the Tracker, each a separate download fetched on
   its first open (Shell.tsx); every other page is drawn at the tap and never raises it. It is not a React-drawn element: it
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

/* WHAT IT SAYS ([TALON-CLAW-SPOKEN], 4 Nov 26): the claw is a quiet status naming the page, so a VoiceOver user who taps
   the Leave War hears "Loading Leave War" rather than nothing until the page appears; the picture itself is hidden from a
   screen reader, and the page area is marked busy while the claw is up. The start-up claw keeps its own label. */
const PAGE_NAMES: Record<string, string> = { leavewar: 'Leave War', tracker: 'Tracker' }
/* A WAIT THAT DOES NOT LOOK STUCK (D1632): still up after this long — a very slow signal — a grey "Still loading…" stands
   under the claw, shown and spoken, and goes with it. Most opens take well under a second and never show it. */
export const PAGECLAW_STILL_MS = 8000
const busy = (page: string | undefined, on: boolean) => {
  const sec = page ? document.getElementById(`page-${page}`) : null
  if (!sec) return
  if (on) sec.setAttribute('aria-busy', 'true'); else sec.removeAttribute('aria-busy')
}

/** Lay the claw over the page area; returns the element. */
export function raisePageClaw(page: string): HTMLElement {
  const el = document.createElement('div')
  el.className = 'pgclaw'
  el.dataset.up = String(Date.now())
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', 'polite')
  el.dataset.page = page
  el.innerHTML = '<div class="mk" aria-hidden="true"><div class="cs">'
    + PAGECLAW_PATHS.map((d, i) => `<div class="w pw${i}"><svg viewBox="0 -2 60 64"><path class="c" d="${d}"/></svg></div>`).join('')
    + '</div></div><span class="pgclaw-say"></span>'
  document.body.appendChild(el)
  busy(page, true)
  /* a screen reader reads what CHANGES in a status, not what it held as it appeared (the fresh code read's finding 5):
     the page's name goes in a moment after the claw */
  window.setTimeout(() => {
    const say = el.querySelector('.pgclaw-say')
    if (say && el.isConnected && !el.classList.contains('gone')) say.textContent = `Loading ${PAGE_NAMES[page] ?? 'the page'}`
  }, 100)
  window.setTimeout(() => {
    if (!el.isConnected || el.classList.contains('gone')) return
    const still = document.createElement('div')
    still.className = 'pgclaw-still'
    still.textContent = 'Still loading…'
    el.appendChild(still)
  }, PAGECLAW_STILL_MS)
  return el
}

/* A claw up for less than this has barely begun its first scratch: it goes at once rather than fade, so a page that
   arrives quickly is never veiled for 0.2 s by a dark screen with nothing on it. */
export const PAGECLAW_QUICK_MS = 200

/** Take the claw away. `arrived`: its page has just been drawn (fade over it), else he left first (go at once). */
export function dismissPageClaw(el: HTMLElement, arrived: boolean): void {
  if (!el.isConnected || el.classList.contains('gone')) return
  busy(el.dataset.page, false)
  const still = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const quick = Date.now() - Number(el.dataset.up || 0) < PAGECLAW_QUICK_MS
  if (!arrived || still || quick) { el.remove(); return }
  el.classList.add('gone')
  window.setTimeout(() => el.remove(), BOOTCLAW_FADE_MS)
}

/* The longest the claw waits, once its page's code has arrived, for what `until` names — so a page that fails to draw it
   (an empty Tracker, an error) is never left under the claw. */
export const PAGECLAW_WAIT_MAX_MS = 3000

/** After the placeholder goes: hold the claw until `until` matches (the page's own drawing), then fade it; at once if he
 *  has left the page meanwhile. Checked the moment anything is added to the page (so the fade starts in the frame the
 *  drawing appears — a 16 ms timer, delayed by the busy page, started it three frames late in WebKit), and every 0.1 s
 *  besides, for the cap and a page change that adds nothing. */
export function dismissWhenDrawn(el: HTMLElement, page: string, until: string, maxMs = PAGECLAW_WAIT_MAX_MS): void {
  const deadline = Date.now() + maxMs
  let done = false
  const stop = () => { done = true; mo?.disconnect(); window.clearInterval(iv) }
  const check = () => {
    if (done) return
    if (!el.isConnected) { stop(); return }
    if (CURPAGE !== page) { stop(); dismissPageClaw(el, false); return }
    if (document.querySelector(until) || Date.now() > deadline) { stop(); dismissPageClaw(el, true) }
  }
  const mo = typeof MutationObserver === 'function' ? new MutationObserver(check) : null
  mo?.observe(document.body, { childList: true, subtree: true })
  const iv = window.setInterval(check, 100)
  check()
}

/** Rendered where a page is not yet drawn (a Suspense placeholder); the claw stays while this is mounted. `until`: a
 *  page that draws its content only after it appears (the Tracker's chart, drawn by its engine once mounted) names
 *  that content, and the claw stays until it is there (3 Nov 26: in WebKit the chart came about 0.2 s after the page). */
export function PageClaw({ page, until }: { page: string; until?: string }) {
  useLayoutEffect(() => {
    const el = raisePageClaw(page)
    // read at the moment it goes: still on this page means the page has arrived; anywhere else, he left before it did
    return () => { if (until && CURPAGE === page) dismissWhenDrawn(el, page, until); else dismissPageClaw(el, CURPAGE === page) }
  }, [page, until])
  return null
}

