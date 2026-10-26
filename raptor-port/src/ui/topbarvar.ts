/* THE TOP BAR'S LIVE HEIGHT, AS A CSS VARIABLE (owner D1116, 21 Oct 26 — "when i scroll down on the desktop, i cant see
   the day pick on the right panel like monday"). The app's top bar is sticky, so anything else held to the top of the
   window while the page scrolls must be held UNDER it, not behind it — Edit Schedule's crew panel, whose "AIRCREW ·
   ‹ MONDAY ›" heading sat 8 from the window's top, under the bar. The bar's height is not fixed (58 to 67 on a desktop as
   its buttons wrap, taller with the "Not saved" band), so it is measured and kept on the page's root as --topbar-h, which
   the stylesheets read (03-week.css .edit-board .eroster). A browser without ResizeObserver (the test runner) keeps the
   stylesheet's fallback. */
export function wireTopbarVar(bar: HTMLElement | null) {
  if (!bar) return () => { }
  const root = document.documentElement
  const set = () => root.style.setProperty('--topbar-h', Math.round(bar.getBoundingClientRect().height) + 'px')
  set()
  /* the BORDER box: the "Not saved" band and the OIL bar make the bar taller by its padding alone, which a watch on the
     content box never sees (the blind read of 21 Oct 26, F1); and a window resize as well, the way the Shell itself
     answers the bands */
  window.addEventListener('resize', set)
  if (typeof ResizeObserver !== 'function') return () => window.removeEventListener('resize', set)
  const ro = new ResizeObserver(set)
  ro.observe(bar, { box: 'border-box' })
  return () => { ro.disconnect(); window.removeEventListener('resize', set) }
}
