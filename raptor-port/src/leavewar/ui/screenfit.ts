/* A PAGE FITTED TO THE SCREEN UNDER THE TAB ROW, SCROLLING INSIDE ITSELF — the one rule the Balances page (BalancesPage.tsx)
   and, on a PC, the Approvals page (ApprovalsPage.tsx — his D2006: "as Balances does") are both fitted by, so the two can
   never be fitted two ways. Moved whole from BalancesPage.tsx, 13 Nov 26 ([APPROVALS-SCROLL-INSIDE]); the Balances tests of
   his 11 Nov 26 fault still hold it (balances.test.tsx "the page is fitted to the screen's true height").

   THE SCREEN'S TRUE HEIGHT, NOT THE BROWSER'S ROUNDED ONE (his fault, 11 Nov 26 — Chrome on his PC's 125% display):
   a real window is a whole number of SCREEN pixels tall, so at 125% the page's own height is often a fraction — 733.6
   — and `innerHeight` rounds it up to 734. Fitted to 734 the page stood 0.4 taller than the screen, the window behind
   it could scroll by one screen pixel (he saw "the whole page shifts a bit up"), and the browser handed a wheel turned
   at the list's foot to that window: rolled up at once, the list stayed stuck until the wheel had rested. The viewport
   figure is the unrounded one (what is in view, times a trackpad pinch's zoom); it is taken only where it is the same
   height to within a pixel — a keyboard or anything else that shortens what is in view never shrinks the page — and
   the page is never made taller than the rounded figure. (Lesson 31 of the bug-check order.) */
export function screenHeight(): number {
  const vv = window.visualViewport, inner = window.innerHeight
  const real = vv ? vv.height * vv.scale : inner
  return Math.abs(real - inner) < 1 ? Math.min(inner, Math.floor(real + 0.01)) : inner
}

/* Its top is read in the PAGE's measure (the screen's plus how far the window is scrolled): the page opens at the window's
   top (LeaveWarPage.tsx Body scrolls there, after this has run), and opened from a grid scrolled down, a top read off the
   screen was short by that scroll — the page came out 120 taller than the phone's screen and the whole window scrolled, the
   tab row going under the top bar (the M5a walk's B-F5, 29 Oct 26). Never shorter than 240. */
export function fitToScreen(el: HTMLElement): void {
  const top = el.getBoundingClientRect().top + (window.scrollY || 0)
  el.style.height = `${Math.max(240, screenHeight() - Math.max(0, top))}px`
}
