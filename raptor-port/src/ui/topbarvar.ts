/* THE TOP BAR'S LIVE HEIGHT, AS A CSS VARIABLE (owner D1116, 21 Oct 26 — "when i scroll down on the desktop, i cant see
   the day pick on the right panel like monday"). The app's top bar is fixed, so anything else held to the top of the
   window while the page scrolls must be held UNDER it, not behind it — Edit Schedule's crew panel, whose "AIRCREW ·
   ‹ MONDAY ›" heading sat 8 from the window's top, under the bar. The bar's height is not fixed (58 to 67 on a desktop as
   its buttons wrap, taller with the "Not saved" band), so it is measured and kept on the page's root as --topbar-h, which
   the stylesheets read (03-week.css .edit-board .eroster). D1873: it also reserves the fixed bar's space in Shell and
   GuestApp. Keep the exact height, not rounded pixels, so the page starts at the same place as with the in-flow bar.
   Both trees call this before paint. Without ResizeObserver it still measures on mount and window resize. */
export function syncTopbarVar(bar: HTMLElement | null) {
  if (!bar) return
  const root = document.documentElement
  const height = bar.getBoundingClientRect().height + 'px'
  // A keyboard/toolbar resize with the same bar height must not invalidate the whole page's inherited styles.
  if (root.style.getPropertyValue('--topbar-h') !== height) root.style.setProperty('--topbar-h', height)
}
export function wireTopbarVar(bar: HTMLElement | null) {
  if (!bar) return () => { }
  const root = document.documentElement
  const set = () => syncTopbarVar(bar)
  set()
  /* the BORDER box: the "Not saved" band and the OIL bar make the bar taller by its padding alone, which a watch on the
     content box never sees (the blind read of 21 Oct 26, F1); and a window resize as well, the way the Shell itself
     answers the bands */
  window.addEventListener('resize', set)
  /* D1873 round 2: writing the spacer from inside a resize notification changes the body's height after its
     observer has already run (the Leave War watches it too). WebKit then reports undelivered notifications.
     Leave the observer's delivery cycle before changing layout; collapse multiple wraps into one live read.
     Mount and window resize still measure before paint, and an unchanged height never writes anything. The bands the
     app itself puts in the bar ("Not saved", the OIL answer's bar) are written before paint by the page's own layout
     effect calling syncTopbarVar (Shell, GuestApp), so the page moves down in the band's first frame. */
  let frame = 0
  const resized = () => {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; set() })
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(resized) : null
  ro?.observe(bar, { box: 'border-box' })
  return () => {
    ro?.disconnect()
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', set)
    root.style.removeProperty('--topbar-h')
  }
}
