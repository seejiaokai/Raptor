/* THE PHONE SWIPE'S ON-SCREEN LOG — on only with `?swdebug` in the address, off for everyone else.
   Why it exists ([WEEK-SWIPE-CROSS], his iPhone recording of 3 Nov 26, 05:41): swiping back from Tuesday to Monday and
   straight on toward Sunday, the first swipe only bounced Monday and the next one crossed. Every test browser crossed on
   that swipe; only Safari on his iPhone did not, and a recording shows the day moving but not what Safari told the page.
   This prints, per swipe, what the swipe reading saw — whether the touch began, moved and ended or was cancelled, how far,
   where the week stood, and how far the week itself was pulled past its end — so one recording shows which it was.
   Nothing here changes what a swipe does. The same pattern as the keyboard's `?kbdebug` (ui/kbscroll.ts). */
export const swDebugOn = typeof location !== 'undefined' && /[?&]swdebug\b/.test(location.search)
let el: HTMLElement | null = null
const lines: string[] = []
const t0 = Date.now()
export function swLog(line: string) {
  if (!swDebugOn) return
  if (!el) {
    el = document.createElement('div'); el.setAttribute('aria-hidden', 'true')
    Object.assign(el.style, { position: 'fixed', left: '0', bottom: '0', zIndex: '2147483647', pointerEvents: 'none', font: '11px/1.3 monospace', color: '#7CFC7C', background: 'rgba(0,0,0,.85)', padding: '2px 4px', whiteSpace: 'pre', maxWidth: '100vw' })
    document.body.appendChild(el)
  }
  lines.push(`${((Date.now() - t0) / 1000).toFixed(2)} ${line}`)
  while (lines.length > 14) lines.shift()
  el.textContent = lines.join('\n')
}
/* the week's own scroll position between two log lines: its lowest and highest, and how many scroll events */
let lo = Infinity, hi = -Infinity, n = 0
export function swScroll(sl: number) { if (!swDebugOn) return; n++; if (sl < lo) lo = sl; if (sl > hi) hi = sl }
export function swScrollTake(): string {
  const s = n ? `sc${n} ${Math.round(lo)}..${Math.round(hi)}` : 'sc0'
  lo = Infinity; hi = -Infinity; n = 0
  return s
}
