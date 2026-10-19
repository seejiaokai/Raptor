/* THE BOX BEING TYPED IN SHOWS ABOVE THE KEYBOARD ([KEYBOARD-SCROLL], owner D1048, 19 Oct 26 — "when I select or type on
   anything on my phone that's at my keyboard area. When the keyboard pops up the thing I selected to type will show
   above the keyboard. Like auto scroll to it." — every box in the app).

   WHY THE PHONE DOES NOT DO IT BY ITSELF. An iPhone's keyboard does not shorten the page: the layout stays its full
   height and only the VISUAL viewport (window.visualViewport — the slice actually on screen) shrinks and pans. Safari
   then scrolls the PAGE so the box shows, but it does not reliably scroll a panel that scrolls inside a fixed layer —
   the Scheduler Board's scrolling panel (the board itself follows the visual viewport, SchedBoard.tsx), a window's or a
   sheet's own scrolling body — so a box low in such a panel stayed under the keys.

   WHAT THIS DOES. When a box to type in takes the focus, and once the keyboard has shrunk the visual viewport (its
   `resize`, which also arrives while the keys slide up), the box's own scrolling panels are scrolled, nearest first,
   just far enough that its bottom sits GAP above the keyboard (or above the panel's own foot, if that is higher) —
   then the page itself, unless the box sits in a fixed layer (a window, a sheet, the board), where scrolling the page
   would only move what is behind it (D686). Never more than that: a box already in sight is left where it is, and a
   box taller than the room left keeps its TOP in sight. Instant, not smooth: the keys are still sliding up, and a
   smooth scroll measured mid-slide overshoots (D991 — no motion to wait on).

   WHEN IT DOES NOTHING. With no keyboard up — the visible screen within KEYBOARD_MIN of the layout's height: a desktop,
   a phone with a hardware keyboard, an Android phone (whose browser shortens the whole page and scrolls the box into
   view itself) — and while the page is pinch-zoomed (the board leaves a zoom alone too). A resize long after the
   focus (Safari's own bars folding as he scrolls) does not pull the box back: only those within FOCUS_WINDOW of the
   focus act. So nothing changes on a desktop, and a box he scrolled away from on purpose stays where he put it.

   Chromium cannot raise an iPhone's keyboard, so the browser test and the walk stand a stand-in visual viewport in
   for it (scripts/handpass/am/b3-03-keyboard.mjs's way); his iPhone is the real test (the look card). */

/* the same threshold as the Leave War's sheets (leavewar/ui/Sheet.tsx KEYBOARD_MIN): a visible screen this much
   shorter than the layout means a keyboard is up — the address bar alone never takes this much */
export const KEYBOARD_MIN = 120
/* the clear strip left between the box and the keys */
export const GAP = 8
/* how long after a focus a visual-viewport resize still counts as that keyboard opening (the keys' slide is ~250ms;
   the word-suggestion bar can follow it) */
const FOCUS_WINDOW = 1500

/* a box to type in: a text-like <input>, a <textarea>, a <select> (its wheel takes the keyboard's place on a phone),
   or a typing cell of the dense surfaces (contenteditable) — never a tick, a switch, a slider or a button */
const NOT_TYPED = /^(checkbox|radio|button|submit|reset|range|color|file|image|hidden)$/i
export function isTypingBox(el: any): el is HTMLElement {
  if (!el || el.nodeType !== 1) return false
  if (el instanceof HTMLInputElement) return !NOT_TYPED.test(el.type) && !el.disabled && !el.readOnly
  if (el instanceof HTMLTextAreaElement) return !el.disabled && !el.readOnly
  if (el instanceof HTMLSelectElement) return !el.disabled
  return !!el.isContentEditable
}

type VV = { height: number, offsetTop: number, scale: number }
export function keyboardUp(vv: VV | null | undefined): boolean {
  return !!vv && !(vv.scale > 1.01) && window.innerHeight - vv.height > KEYBOARD_MIN
}

const scrolls = (a: Element) => {
  const oy = getComputedStyle(a).overflowY
  return (oy === 'auto' || oy === 'scroll' || oy === 'overlay') && a.scrollHeight > a.clientHeight + 1
}
/* scroll `sc` so `el`'s bottom sits at `bot` or above, never taking its top above `top` */
function lift(sc: Element, el: HTMLElement, bot: number, top: number): number {
  const r = el.getBoundingClientRect()
  let d = r.bottom - bot
  if (d <= 0) return 0
  d = Math.min(d, r.top - top)
  if (d <= 0) return 0
  const was = sc.scrollTop
  sc.scrollTop = was + Math.ceil(d)
  return sc.scrollTop - was
}

/** Scrolls `el`'s scrolling panels (nearest first), then the page unless `el` is inside a fixed layer, so the box sits
    GAP above the visible screen's foot. Returns how far it moved things in all (0: it was already in sight). */
export function keepAboveKeyboard(el: HTMLElement, vv: VV): number {
  const visTop = vv.offsetTop, visBot = vv.offsetTop + vv.height
  let moved = 0, fixed = false
  for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
    if (getComputedStyle(a).position === 'fixed') fixed = true
    if (!scrolls(a)) continue
    const ar = a.getBoundingClientRect()
    moved += lift(a, el, Math.min(ar.bottom, visBot) - GAP, Math.max(ar.top, visTop) + GAP)
  }
  const page = document.scrollingElement || document.documentElement
  if (!fixed && page) moved += lift(page, el, visBot - GAP, visTop + GAP)
  return moved
}

/** Follows the focus and the visual viewport from now on (called once, from main.tsx). Returns the way to stop. */
export function installKbScroll(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {}
  let box: HTMLElement | null = null, at = 0, raf = 0
  const place = () => {
    raf = 0
    const vv = window.visualViewport
    if (!box || document.activeElement !== box || !box.isConnected || !keyboardUp(vv)) return
    keepAboveKeyboard(box, vv!)
  }
  /* two frames on: the board and the sheets re-fit themselves to the same resize first (their own listeners), and the
     box is measured where they left it */
  const soon = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => { raf = requestAnimationFrame(place) })
  }
  const focusin = (e: FocusEvent) => {
    if (!isTypingBox(e.target)) { box = null; return }
    box = e.target as HTMLElement; at = Date.now()
    soon()
  }
  /* read fresh each time: the walk stands a stand-in viewport in after the page has loaded */
  let vvNow: VisualViewport | null = null
  const resize = () => { if (box && Date.now() - at < FOCUS_WINDOW) soon() }
  const follow = () => {
    const vv = window.visualViewport
    if (vv === vvNow) return
    vvNow?.removeEventListener('resize', resize)
    vvNow = vv; vvNow?.addEventListener('resize', resize)
  }
  follow()
  const focusAlso = (e: FocusEvent) => { follow(); focusin(e) }
  document.addEventListener('focusin', focusAlso, true)
  return () => {
    document.removeEventListener('focusin', focusAlso, true)
    vvNow?.removeEventListener('resize', resize)
    if (raf) cancelAnimationFrame(raf)
  }
}
