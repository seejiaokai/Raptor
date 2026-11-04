/* THE PAGE NAMES BESIDE TALON, OR THE SIDE MENU (owner D1641, D1642, D1643, 4 Nov 26 — "there's a lot of empty space
   on the right of talon. Could u move the titles up there? If all the titles can't fit … make it the same as a side
   menu"). The top bar's page names stand on its first row beside TALON wherever they ALL fit there; where they do not,
   they fold into the ☰ side menu (ui/Drawer.tsx) as on a phone, and the bar is one row. Whether they fit is MEASURED on
   the bar in use, never set at a width: an iPhone's letters are wider than a PC's (the mock-up of 4 Nov 26 — at 874 wide
   the PC needed 695 of 706 and fitted; his iPhone wrapped), a member has two names fewer, and the lit name is bolder.
   A phone held sideways always folds, for everyone (D1643): its height is too little to give the buttons a second row.
   Below 821 wide the phone layout already has its own ☰ (09-week-responsive.css), so nothing is decided there. */

/* a touch screen with no fine pointer, on its side, no taller than a phone — an iPad keeps the measure (D1643's reading) */
export const SIDEWAYS_PHONE = '(pointer: coarse) and (orientation: landscape) and (max-height: 500px)'
const PHONE_LAYOUT = '(max-width: 820px)'

const mq = (q: string) => typeof window.matchMedia === 'function' && window.matchMedia(q).matches

/* the pure half: do names `need` px wide fit in `room`? Half a pixel of slack for rounding, never more — a name that
   would be cut by a pixel wraps on the device, which is exactly what this exists to stop */
export function namesFit(need: number, room: number) { return need <= room + 0.5 }

/* the room beside TALON on the bar's first row: the bar's inner width less TALON, the gap after it and the names' own
   left margin. ☰ is not counted: it shows only once the names have folded. */
export function roomBeside(bar: HTMLElement, mark: HTMLElement, nav: HTMLElement) {
  const cs = getComputedStyle(bar)
  const inner = bar.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0)
  const gap = parseFloat(cs.columnGap) || 0
  return inner - mark.getBoundingClientRect().width - gap - (parseFloat(getComputedStyle(nav).marginLeft) || 0)
}

export function mustFold(bar: HTMLElement): boolean {
  const nav = bar.querySelector<HTMLElement>('#topnav'), mark = bar.querySelector<HTMLElement>('.mark')
  if (!nav || !mark) return false
  if (mq(SIDEWAYS_PHONE)) return true
  if (mq(PHONE_LAYOUT)) return false
  /* no layout (the unit tests' jsdom): nothing to measure, so the names stay where the markup puts them */
  if (!bar.clientWidth) return false
  /* folded, the names are laid out out of the bar's flow at their own full width (02-shell.css .nav-fold), so they
     are measured the same either way and folding never changes the answer */
  return !namesFit(nav.getBoundingClientRect().width, roomBeside(bar, mark, nav))
}

/* watch the bar: its width (the window, the "Not saved" band), the names' width (a role switch, the Admin badge, the lit
   name) and the screen turning. `set` is the Shell's state setter — React leaves an unchanged value alone, so a watch
   that fires with the same answer repaints nothing. */
export function wireNavFold(bar: HTMLElement | null, set: (fold: boolean) => void) {
  if (!bar) return () => { }
  const check = () => set(mustFold(bar))
  check()
  window.addEventListener('resize', check)
  const turned = typeof window.matchMedia === 'function' ? window.matchMedia(SIDEWAYS_PHONE) : null
  turned?.addEventListener?.('change', check)
  const nav = bar.querySelector<HTMLElement>('#topnav')
  let ro: ResizeObserver | null = null
  if (typeof ResizeObserver === 'function') {
    /* a frame later: folding changes the bar's height, and an answer given inside the observer's own callback would
       make the browser report a resize loop */
    ro = new ResizeObserver(() => requestAnimationFrame(check))
    ro.observe(bar)
    if (nav) ro.observe(nav)
  }
  return () => { window.removeEventListener('resize', check); turned?.removeEventListener?.('change', check); ro?.disconnect() }
}
