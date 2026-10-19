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
   would only move what is behind it (D686) — there, a box still under the keys raises its window instead (raise, below). Never more than that: a box already in sight is left where it is, and a
   box taller than the room left keeps its TOP in sight. Instant, not smooth: the keys are still sliding up, and a
   smooth scroll measured mid-slide overshoots (D991 — no motion to wait on).

   WHEN IT DOES NOTHING. With no keyboard up — the visible screen within KEYBOARD_MIN of the layout's height: a desktop,
   a phone with a hardware keyboard (an Android phone's Chrome, since its version 108, shrinks only the visible screen as an
   iPhone does, so this works there too — not walked) — and while the page is pinch-zoomed (the board leaves a zoom alone too). A resize long after the
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
/* THE SCREEN'S FULL HEIGHT, AS SEEN WITH NO BOX BEING TYPED IN (his iPhone, 19 Oct 26 — "I go to another screen on my phone
   then back to chrome … initially works then it doesn't"): a browser that comes back from another app can shorten its
   LAYOUT for the keys too, and then the layout's height no longer tells a keyboard; the tallest visible screen seen at
   this width with nothing being typed in still does. */
let BASE = { w: 0, h: 0 }
export function noteFullHeight() {
  const vv = typeof window !== 'undefined' ? window.visualViewport : null
  /* a visible screen taller than the layout it is measured against is a reading from before the page had its size (the
     walk's stand-in keyboard, read before the page's width was set) — never a screen: kept, the keys would read as up for
     good and nothing raised for them would ever be put back */
  if (!vv || vv.scale > 1.01 || isTypingBox(document.activeElement) || vv.height > window.innerHeight + 1) return
  if (BASE.w !== window.innerWidth) BASE = { w: window.innerWidth, h: 0 }
  BASE.h = Math.max(BASE.h, vv.height)
}
export function keyboardUp(vv: VV | null | undefined): boolean {
  if (!vv || vv.scale > 1.01) return false
  const full = Math.max(window.innerHeight, BASE.w === window.innerWidth ? BASE.h : 0)
  return full - vv.height > KEYBOARD_MIN
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

/* A WINDOW THAT CANNOT SCROLL IS RAISED INSTEAD (the walk's KS3, 19 Oct 26: Admin → Duty templates on a phone — its rows
   all fit, so nothing in it scrolls, and its last time box sat under the keys). A window stands in the middle of the
   layout's height (D997), which the keyboard does not shorten, so its lower half can be under the keys with nothing to
   scroll. What is raised is the window itself — inside a backdrop that fills the screen (a .modal), the box on it; else
   the fixed layer — by the CSS `translate` property, which adds to any transform a window is dragged by, never so far
   that its top leaves the visible screen; and it is put back where it was when the typing ends or the keys go down.
   A WINDOW TALLER THAN THE ROOM LEFT (the fresh read's F1, 19 Oct 26: Duty templates with eight roles — risen to the top
   of the screen, its last rows were still under the keys; its own height limit is the layout's, which the keys do not
   shorten, so its body had nothing more to scroll): it is held to the visible screen's height for as long as the keys are
   up, its top at the top, and its own body then scrolls the box into sight — the Leave War's sheets do the same for
   themselves (leavewar/ui/Sheet.tsx). A window that already sets its own height limit is left to it.
   THE HOLD IS ITS OWN PROPERTY (the narrow read's 1, 19 Oct 26): a movable window writes its own inline max-height on
   every redraw (floatwin.ts place() — and the input window redraws on every key), which wiped a hold written there, so
   the box fell back under the keys at the first key. The hold is the custom property --kbcap, read by one rule
   (`[data-kbcap]`, 08-windows-tools.css) that outranks the window's own. AND IT STAYS HELD (the narrow read's 2, 3): a box
   higher in a held window, or a window already at the top, never lets the hold go while the keys are up — only the typing
   ending, the keys going down or the focus leaving the window put it back (putBack). */
const LIFTED = new Set<HTMLElement>()
const shiftOf = (l: HTMLElement) => +(l.dataset.kblift || 0)
const held = (l: HTMLElement) => l.dataset.kbcap != null
function setShift(l: HTMLElement, s: number) {
  if (s > 0.5) { l.style.translate = `0 ${-Math.round(s)}px`; l.dataset.kblift = String(Math.round(s)); LIFTED.add(l); return }
  l.style.translate = ''; delete l.dataset.kblift
  if (!held(l)) LIFTED.delete(l)
}
/* hold `l` to `h` tall — never over a height limit the window set itself */
function cap(l: HTMLElement, h: number): boolean {
  if (!held(l)) { if (l.style.maxHeight) return false; l.dataset.kbcap = '' }
  l.style.setProperty('--kbcap', Math.round(h) + 'px'); LIFTED.add(l)
  return true
}
/** Puts one window back where it stood, unheld — also for a window about to be dragged by its bar (floatwin.ts). */
export function putBack(l: HTMLElement) {
  l.style.translate = ''; delete l.dataset.kblift
  l.style.removeProperty('--kbcap'); delete l.dataset.kbcap
  LIFTED.delete(l)
}
/* ROOM BELOW THE PAGE (walker A's A11, 19 Oct 26: Admin → Users, the new person's last box — the page already at its
   foot, the box 5px under the keys): the keys cover the page's last few hundred pixels and the page cannot scroll past
   its own end, so an empty block, as tall as is missing, is put after it while the keys are up — nothing shows in it,
   it sits under the keys — and taken away when the typing ends or the keys go down. */
let SPACER: HTMLElement | null = null
function roomBelow(px: number) {
  if (!SPACER || !SPACER.isConnected) {
    SPACER = document.createElement('div')
    SPACER.setAttribute('data-kbspacer', ''); SPACER.setAttribute('aria-hidden', 'true')
    document.body.appendChild(SPACER)
  }
  SPACER.style.height = Math.ceil((parseFloat(SPACER.style.height) || 0) + px) + 'px'
}
/** Puts back every window raised for the keys, but the one that holds `keep`; the room below the page only when the
    typing has ended (no `keep`) — taken away between two boxes, the page would jump back and forth. */
export function dropLifts(keep?: Element | null) {
  for (const l of [...LIFTED]) if (!keep || !l.contains(keep)) putBack(l)
  for (const p of [...ROOMED]) if (!keep || !p.contains(keep)) unroom(p)
  if (!keep && SPACER) { SPACER.remove(); SPACER = null }
}
/* a held window: held to the room again (the room may have changed), its top at the top */
function pin(l: HTMLElement, s0: number, visTop: number, visBot: number) {
  cap(l, visBot - visTop - 2 * GAP)
  setShift(l, Math.max(0, s0 + l.getBoundingClientRect().top - (visTop + GAP)))
}
function raise(fixedEl: HTMLElement, el: HTMLElement, visTop: number, visBot: number): number {
  const fr = fixedEl.getBoundingClientRect()
  /* a backdrop as tall as the layout: raise the window on it, the backdrop's child that holds the box */
  let layer = fixedEl
  if (fr.top <= 1 && fr.height >= window.innerHeight - 2) {
    let c: Element | null = el
    while (c && c.parentElement !== fixedEl) c = c.parentElement
    if (!c) return 0
    layer = c as HTMLElement
  }
  const s0 = shiftOf(layer)
  /* a held window stays held and pinned while the keys are up — its own body scrolls to whichever box he taps */
  if (held(layer)) { pin(layer, s0, visTop, visBot); return 1 }
  const r = el.getBoundingClientRect(), lr = layer.getBoundingClientRect()
  const need = r.bottom - (visBot - GAP)
  /* up by what the box needs, never past the visible top; down again (towards where it stood) when it is higher than it
     need be — a box further up the same window */
  const room = lr.top - (visTop + GAP)
  if (need > room + 0.5 && cap(layer, visBot - visTop - 2 * GAP)) {
    /* held to the room, measured again (a window centred on its backdrop re-centres as it shrinks): its top to the top */
    pin(layer, s0, visTop, visBot)
    return 1
  }
  const d = need > 0 ? Math.min(need, room) : Math.max(need, -s0)
  if (Math.abs(d) < 0.5) return 0
  setShift(layer, Math.max(0, s0 + d))
  return Math.abs(shiftOf(layer) - s0)
}

/* ROOM AT THE FOOT OF THE BOARD'S OWN LIST (his seventh report, 19 Oct 26 16:49 — "the screen jumps abit for every tap",
   "sometimes bottom black screen"; three pictures): a box near the end of the Scheduler Board's list had nothing left to
   scroll it up by, so the board's body was raised and held like a window — it slid up over the board's own bar (the day,
   ✓ Done) at every tap, and when the iPhone then panned the screen as well, the held body ended above the keys with the
   board's empty background below it. The board is never raised or held now: its nearest scrolling list is given room
   below its end while the keys are up (padding, the custom property --kbroom read by one rule, 08-windows-tools.css), as
   much as the box still has to rise with its top in sight, and scrolled; the bar stays, nothing else moves. The room
   goes when the typing ends, the keys go down or the focus leaves that list (dropLifts). */
const ROOMED = new Set<HTMLElement>()
const scroller = (a: Element) => /^(auto|scroll|overlay)$/.test(getComputedStyle(a).overflowY)
function unroom(p: HTMLElement) { delete p.dataset.kbroom; p.style.removeProperty('--kbroom'); ROOMED.delete(p) }
function panelRoom(el: HTMLElement, layer: Element, visTop: number, visBot: number): number {
  let p = el.parentElement
  while (p && p !== layer && !scroller(p)) p = p.parentElement
  if (!p || p === layer) return 0
  const r = el.getBoundingClientRect(), pr = p.getBoundingClientRect()
  const bot = Math.min(pr.bottom, visBot) - GAP, top = Math.max(pr.top, visTop) + GAP
  const want = Math.min(r.bottom - bot, r.top - top)
  if (want <= 0.5) return 0
  const base = ROOMED.has(p) ? parseFloat(p.style.getPropertyValue('--kbroom')) || 0 : parseFloat(getComputedStyle(p).paddingBottom) || 0
  p.dataset.kbroom = ''; p.style.setProperty('--kbroom', Math.ceil(base + want) + 'px'); ROOMED.add(p)
  return lift(p, el, bot, top)
}

/* A LAYER over the page: anything position:fixed, and the Scheduler Board, which stands as page content while it is open
   (data-kblayer — SchedBoard.tsx, owner D1081: an iPhone draws a fixed full-screen layer out of place for a frame as the
   keys close) but is still a whole screen of its own, raised and held as it was while it was fixed. */
const isLayer = (a: Element) => a.hasAttribute('data-kblayer') || getComputedStyle(a).position === 'fixed'

/** Scrolls `el`'s scrolling panels (nearest first), then the page unless `el` is inside a fixed layer — where, if the box
    is still under the keys, the window is raised instead (raise) — so the box sits GAP above the visible screen's foot.
    Returns how far it moved things in all (0: it was already in sight). */
export function keepAboveKeyboard(el: HTMLElement, vv: VV): number {
  const visTop = vv.offsetTop, visBot = vv.offsetTop + vv.height
  let moved = 0, fixed: HTMLElement | null = null
  const panels = () => {
    for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      if (!fixed && isLayer(a)) fixed = a
      if (!scrolls(a)) continue
      const ar = a.getBoundingClientRect()
      moved += lift(a, el, Math.min(ar.bottom, visBot) - GAP, Math.max(ar.top, visTop) + GAP)
    }
  }
  panels()
  /* the board is never raised: room at the foot of its own list instead (below) */
  if (fixed && (fixed as HTMLElement).hasAttribute('data-kblayer')) return moved + panelRoom(el, fixed, visTop, visBot)
  if (fixed) {
    const r = raise(fixed, el, visTop, visBot)
    /* a window raised, or held to the room, may now scroll its own body: the panels once more */
    if (r) { moved += r; panels() }
    return moved
  }
  const page = document.scrollingElement || document.documentElement
  if (page) {
    moved += lift(page, el, visBot - GAP, visTop + GAP)
    /* the page at its foot and the box still under the keys: room below it, then the page once more — only as much as
       the box can still rise with its top in sight (the narrow read round 2's L1: a box taller than the room had a block
       added at every refit, the page nowhere near its foot) */
    const r2 = el.getBoundingClientRect()
    const want = Math.min(r2.bottom - (visBot - GAP), r2.top - (visTop + GAP))
    if (want > 0.5) { roomBelow(want); moved += lift(page, el, visBot - GAP, visTop + GAP) }
  }
  return moved
}

/* NO LIFT ON THE PRESS (his recording, 19 Oct 26 16:59 — "everytime I click on SC it doesn't select the CS text box but
   the screen snaps down"): a finger's tap on a low box used to scroll its panels up at the end of the touch, before the
   keys, cancel the touch's own click and give the box the focus itself. On his iPhone that focus never took: the board
   moved and no box was chosen. Chromium takes such a focus, so no check saw it. The tap is left to the browser now; the
   box is brought above the keys once they are up (below), and since the board is page content (SchedBoard.tsx, D1081)
   the iPhone's own pan to a box carries the board with it in the same frame. */

/** Brings the box being typed in above the keys again, now — for a window put back by a tap on its bar that turned out
    not to be a drag (floatwin.ts, FloatWindow.tsx — the narrow read round 2's L3): no focus arrives to do it. */
export function refit() {
  if (typeof document === 'undefined') return
  const a = document.activeElement, vv = window.visualViewport
  if (isTypingBox(a) && keyboardUp(vv)) keepAboveKeyboard(a, vv!)
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
    dropLifts(e.target as Element)
    if (!isTypingBox(e.target)) { box = null; return }
    box = e.target as HTMLElement; at = Date.now()
    soon()
  }
  /* the typing ended (the focus went to nothing, as a tap on blank page does): a raised window goes back */
  const focusout = (e: FocusEvent) => { if (!e.relatedTarget) requestAnimationFrame(() => { if (!isTypingBox(document.activeElement)) dropLifts() }) }
  /* read fresh each time: the walk stands a stand-in viewport in after the page has loaded */
  let vvNow: VisualViewport | null = null
  const resize = () => {
    noteFullHeight()
    const vv = window.visualViewport
    /* the keys down — read with the zoom taken out, so a pinch while typing (the narrow read round 2's L2) neither puts the
       window back nor takes the room below the page away; a zoomed frame itself changes nothing */
    if (!vv || Math.max(window.innerHeight, BASE.w === window.innerWidth ? BASE.h : 0) - vv.height * (vv.scale || 1) <= KEYBOARD_MIN) { dropLifts(); return }
    if (vv.scale > 1.01) return
    if (box && Date.now() - at < FOCUS_WINDOW) soon()
  }
  const follow = () => {
    const vv = window.visualViewport
    if (vv === vvNow) return
    vvNow?.removeEventListener('resize', resize)
    vvNow = vv; vvNow?.addEventListener('resize', resize)
  }
  follow(); noteFullHeight()
  const focusAlso = (e: FocusEvent) => { follow(); focusin(e) }
  document.addEventListener('focusin', focusAlso, true)
  document.addEventListener('focusout', focusout, true)
  return () => {
    document.removeEventListener('focusin', focusAlso, true)
    document.removeEventListener('focusout', focusout, true)
    dropLifts()
    vvNow?.removeEventListener('resize', resize)
    if (raf) cancelAnimationFrame(raf)
  }
}
