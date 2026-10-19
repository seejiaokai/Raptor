/* A HIDDEN READOUT OF THE KEYBOARD'S NUMBERS (owner D1082, 19 Oct 26 — "Add the readout"; TAKEN OUT BEFORE "MERGE LIVE").
   Every fix of the iPhone keyboard faults ([KEYBOARD-SCROLL] — the board's black band below it, the tap that does not
   take the caret) passed in Chromium and failed on his iPhone: Chromium cannot raise an iPhone's keyboard, so the agent
   never saw the numbers the iPhone sees. This box shows them on his own screen, for a screenshot at the moment a fault
   shows. It is drawn only when the app is opened with ?kbdebug=1 on its link (kept for the visit; ?kbdebug=0 ends it),
   reads and changes nothing of the app, lets every touch through, and stands at the visible screen's top-left corner —
   placed by the visual viewport, so it stays in sight however the iPhone pans. */
import { keyboardUp } from './kbscroll'

const KEY = 'raptor:kbdebug'
const r0 = (n: number) => Math.round(n)
/* a box's name as the app addresses it, else its id or tag and first class */
function nameOf(e: any): string {
  if (!e || e.nodeType !== 1) return '—'
  const a = e.getAttribute('data-bfld') || e.getAttribute('data-txt') || e.getAttribute('data-inp') || e.getAttribute('data-ifld')
  if (a) return a
  if (e.id) return '#' + e.id
  const c = typeof e.className === 'string' ? e.className.split(' ')[0] : ''
  return e.tagName.toLowerCase() + (c ? '.' + c : '')
}
function enabled(): boolean {
  let on = false
  try {
    const q = new URLSearchParams(location.search).get('kbdebug')
    if (q === '0') sessionStorage.removeItem(KEY)
    else if (q != null) sessionStorage.setItem(KEY, '1')
    on = sessionStorage.getItem(KEY) === '1'
  } catch { on = /[?&]kbdebug=(?!0)/.test(location.search) }
  return on
}

/** Draws the readout when the link asks for it (called once, from main.tsx). Returns the way to stop. */
export function installKbDebug(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !enabled()) return () => {}
  const box = document.createElement('div')
  box.setAttribute('data-kbdebug', ''); box.setAttribute('aria-hidden', 'true')
  box.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;font:9px/1.25 ui-monospace,Menlo,monospace;color:#b6ffb6;background:rgba(0,0,0,.78);padding:3px 5px;white-space:pre;max-width:72vw;overflow:hidden;border-bottom-right-radius:6px'
  document.body.appendChild(box)
  const log: string[] = []
  const t0 = performance.now()
  const note = (s: string) => { log.unshift(((performance.now() - t0) / 1000).toFixed(2) + ' ' + s); if (log.length > 4) log.length = 4 }
  let tapAt = '—', tapY = 0, maxShift = 0, maxGap = 0
  const onTouch = (e: TouchEvent) => {
    const p = e.changedTouches[0]
    if (e.type === 'touchstart' && p) { tapY = r0(p.clientY); tapAt = nameOf(document.elementFromPoint(p.clientX, p.clientY)) }
    note(e.type.replace('touch', 't-') + ' ' + nameOf(e.target) + (p ? ' y' + r0(p.clientY) : ''))
  }
  const onFocus = (e: FocusEvent) => note(e.type + ' ' + nameOf(e.target))
  const onClick = (e: MouseEvent) => note('click ' + nameOf(e.target) + ' y' + r0(e.clientY))
  const vv = window.visualViewport
  const onVv = (e: Event) => { if (vv) note('vv ' + e.type + ' h' + r0(vv.height) + ' top' + r0(vv.offsetTop)) }
  const onScroll = () => note('page scroll y' + r0(window.scrollY))
  document.addEventListener('touchstart', onTouch, true); document.addEventListener('touchend', onTouch, true)
  document.addEventListener('focusin', onFocus, true); document.addEventListener('focusout', onFocus, true)
  document.addEventListener('click', onClick, true)
  vv?.addEventListener('resize', onVv); vv?.addEventListener('scroll', onVv)
  window.addEventListener('scroll', onScroll, { passive: true })
  let raf = 0
  const draw = () => {
    raf = requestAnimationFrame(draw)
    const v = window.visualViewport
    const vTop = v ? v.offsetTop : 0, vH = v ? v.height : window.innerHeight
    const up = keyboardUp(v)
    const lines = [
      `screen ${window.innerWidth}x${window.innerHeight}  visible h${r0(vH)} shifted ${r0(vTop)}${v && v.scale > 1.01 ? ' zoom ' + v.scale.toFixed(2) : ''}`,
      `page y${r0(window.scrollY)} of ${r0(document.documentElement.scrollHeight)}  keys up: ${up ? 'yes' : 'no'}`,
    ]
    /* the worst seen while the keys were up: the moments his faults show */
    if (up) maxShift = Math.max(maxShift, vTop)
    const b = document.getElementById('schedBoard')
    if (b && !b.hidden) {
      const r = b.getBoundingClientRect()
      /* the black band: the visible screen's foot below the board's own foot */
      const gap = r0(vTop + vH - r.bottom)
      if (up && r.height > 0) maxGap = Math.max(maxGap, gap)
      const list = b.querySelector('[data-kbroom]') as HTMLElement | null
      lines.push(`board top ${r0(r.top)} foot ${r0(r.bottom)}  gap below ${gap > 0 ? gap : 0}${list ? '  room ' + list.style.getPropertyValue('--kbroom') : ''}`)
    }
    lines.push(`most shifted ${r0(maxShift)}  most gap ${r0(maxGap)}`)
    lines.push(`tap on ${tapAt} y${tapY}  caret in ${nameOf(document.activeElement)}`)
    box.textContent = lines.concat(log).join('\n')
    /* stand at the visible screen's corner, wherever the iPhone has panned it */
    box.style.transform = `translate(${r0(v ? v.offsetLeft : 0)}px,${r0(vTop)}px)`
  }
  draw()
  return () => {
    cancelAnimationFrame(raf); box.remove()
    document.removeEventListener('touchstart', onTouch, true); document.removeEventListener('touchend', onTouch, true)
    document.removeEventListener('focusin', onFocus, true); document.removeEventListener('focusout', onFocus, true)
    document.removeEventListener('click', onClick, true)
    vv?.removeEventListener('resize', onVv); vv?.removeEventListener('scroll', onVv)
    window.removeEventListener('scroll', onScroll)
  }
}
