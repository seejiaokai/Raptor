/* THE BOX BEING TYPED IN SHOWS ABOVE THE KEYBOARD ([KEYBOARD-SCROLL], owner D1048, 19 Oct 26 — "when I select or type on
   anything on my phone that's at my keyboard area. When the keyboard pops up the thing I selected to type will show
   above the keyboard. Like auto scroll to it." — every box in the app), AND IT RISES WITH THE KEYS, NOTHING ELSE MOVING
   (owner D1412, 27 Oct 26 — his four recordings: "all the text areas I click screen jerks or bounce a little when the
   keyboard opens. Even for text that are above the keyboard … Why can't the text box I click on, auto scroll
   proportionately with the keyboard that appears and the window doesn't shrink awhile. My idea is a smooth feel for
   this app and this made it worse").

   WHY THE PHONE DOES NOT DO IT BY ITSELF — AND WHAT IT DOES DO. An iPhone's keyboard does not shorten the page: the
   layout stays its full height and only the VISUAL viewport (window.visualViewport — the slice actually on screen)
   shrinks and pans. Safari then pans that slice over the page, smoothly with the keys, by exactly as much as it takes to
   bring the box being typed in into view — and everything fixed to the layout, a window included, rides up with the
   page in the same motion. What it does not do is scroll a panel that scrolls INSIDE a fixed layer (a window's or a
   sheet's own scrolling body; the Scheduler Board's scrolling panel): a box low in such a panel can stay behind the
   panel's own pinned foot, or — on a browser that shrinks the visible screen without panning to the box — under the keys.

   WHAT THIS DOES. When a box to type in takes the focus, and once the keyboard has shrunk the visual viewport (its
   `resize`) and the phone's own pan to the box has come to rest (its `scroll` steps — the lift never adds to a pan still
   running), the box's own scrolling panels are scrolled, nearest first, just far enough that its bottom clears the
   panel's own foot (its scroll padding, a pinned button row) and the keys — then the page itself, unless the box sits in
   a fixed layer (a window, a sheet), where scrolling the page would only move what is behind it (D686). The Scheduler
   Board is page content of its own (SchedBoard.tsx, D1081): there the page comes FIRST — the scroll the phone itself
   makes for the keys — then the board's list (keepAboveKeyboard). Never more than that: a box already in sight is left
   where it is, and a box taller than the room left keeps its TOP in sight.

   WHAT IT NO LONGER DOES (D1412 — the six rounds of 25 Oct 26, kept whole in docs/handpass/2026-10-25-kbs-other-remarks.md).
   A window whose box the keys would cover used to be moved by the app: raised, or held to the room the keys left
   (shrunk to it and pinned to the visible top), brought down when the phone's pan carried it off the top, then — rounds
   five and six — moved frame by frame against a model of the phone's own slide so that it would hold still while the
   page slid under it. Every round passed the stand-in keyboard and failed on his iPhone: the model of Safari's slide was
   always a little wrong, and he saw the window dip and show the page behind it, shrink, and jump back as the keys
   closed. Now the window is not touched while the keys move: the phone's own pan carries it, with the box, exactly in
   step with the keys, as it carries the page — one motion, the phone's, and nothing of the app's own. A window is
   RAISED only as a last resort, once the pan has come to rest and the box is still under the keys (a browser that
   shrank the visible screen without revealing the box — never Safari, which always does): up by what the box needs,
   never past the visible top, by the CSS `translate` property; and put back when the typing ends or the keys go down. No
   window is ever held, shrunk or re-placed for the keys, and nothing glides.

   WHEN IT DOES NOTHING. With no keyboard up — the visible screen within KEYBOARD_MIN of the layout's height: a desktop,
   a phone with a hardware keyboard (an Android phone's Chrome, since its version 108, shrinks only the visible screen as an
   iPhone does, so this works there too — not walked) — and while the page is pinch-zoomed (the board leaves a zoom alone too). A resize long after the
   focus (Safari's own bars folding as he scrolls) does not pull the box back: only those within FOCUS_WINDOW of the
   focus act. So nothing changes on a desktop, and a box he scrolled away from on purpose stays where he put it.

   Chromium cannot raise an iPhone's keyboard, so the browser test and the walk stand a stand-in visual viewport in
   for it (scripts/handpass/am/b3-03-keyboard.mjs's way), playing the pans his phone was seen to make; his iPhone is the
   real test (the look card). */

import { scaleOf } from './pinchzoom'

/* the same threshold as the Leave War's sheets (leavewar/ui/Sheet.tsx KEYBOARD_MIN): a visible screen this much
   shorter than the layout means a keyboard is up — the address bar alone never takes this much */
export const KEYBOARD_MIN = 120
/* the clear strip left between the box and what the app itself scrolls or raises it clear of (the keys, a panel's
   pinned foot); where the PHONE placed the box, its place is taken as it is */
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
  return fullHeight(vv) - vv.height > KEYBOARD_MIN
}
/* the screen's full height: the layout's, the tallest seen with nothing typed in (BASE), and the fixed mark's (screenBox,
   below) — his iPhone gives the layout's as what is left below the visible top once the keys have panned the screen
   (684 − 184 = 500), which alone read as the keys gone down */
function fullHeight(vv: { height: number, offsetTop: number }): number {
  return Math.max(window.innerHeight, BASE.w === window.innerWidth ? BASE.h : 0, typeof document !== 'undefined' ? screenBox(vv).layH : 0)
}

/* THE VISIBLE SCREEN, IN THE MEASURE THE PAGE'S OWN BOXES ARE GIVEN IN (his ?kbdebug recordings of 25 Oct 26 10:10, 10:18
   and 10:30 — the input window opened from an Inputs or a SANS calendar day, and the Tracker's event editor, a box tapped:
   the form pushed down inside its window, an empty band under the title, the box under the keys). With the keys up and
   the screen panned, his iPhone gives every box's place from the top of the VISIBLE screen — the window that stands 12
   from the layout's top read −172 with the screen panned 184 — and the layout's height as what is left below that top
   (684 − 184 = 500). A desktop, Chromium and the iPhones before gave a box's place from the top of the layout, the
   visible screen then starting at the pan (offsetTop). The lift read his numbers the second way: the visible screen
   184–577 where everything it measured was 0–393 — so the window, read as standing above the screen and as tall as the
   "layout" left, was taken for a full-screen backdrop and the form inside it brought down 280 instead of the window.
   A mark the app keeps fixed at the layout's top and foot, never seen, says where the layout stands in whatever measure
   the browser gives: the visible screen starts at its top plus the pan, the layout's full height is its height, and a
   place measured from the layout is a measured box less its top (`layTop`). On a desktop, in Chromium and on the older
   phones the mark stands at 0, as tall as the layout, so every reading is what it always was. The Leave War's sheets
   and bar, the board's pick-list, the History bubble and the two calendars' fit read it too. */
let PROBE: HTMLElement | null = null
export type ScreenBox = { top: number, bottom: number, left: number, layTop: number, layLeft: number, layH: number }
export function screenBox(vv: { height: number, offsetTop: number, offsetLeft?: number }): ScreenBox {
  if (!PROBE || !PROBE.isConnected) {
    PROBE = document.querySelector('[data-kbprobe]') as HTMLElement | null
    if (!PROBE) {
      PROBE = document.createElement('div')
      PROBE.setAttribute('data-kbprobe', ''); PROBE.setAttribute('aria-hidden', 'true')
      Object.assign(PROBE.style, { position: 'fixed', top: '0', bottom: '0', left: '0', width: '0', visibility: 'hidden', pointerEvents: 'none' })
      document.body.appendChild(PROBE)
    }
  }
  const r = PROBE.getBoundingClientRect()
  /* no layout (jsdom): the mark measures nothing, and the layout is the window's own height */
  const layH = r.height > 0 ? r.height : window.innerHeight
  const top = r.top + vv.offsetTop
  return { top, bottom: top + vv.height, left: r.left + (vv.offsetLeft || 0), layTop: r.top, layLeft: r.left, layH }
}

const scrolls = (a: Element) => {
  const oy = getComputedStyle(a).overflowY
  return (oy === 'auto' || oy === 'scroll' || oy === 'overlay') && a.scrollHeight > a.clientHeight + 1
}
/* WHAT A PANEL KEEPS CLEAR AT ITS FOOT AND ITS TOP (his report, 25 Oct 26 07:06 — the input window on his iPhone, "Other"
   picked, Remarks tapped: Document, then Cancel / Add, and no Remarks — "The page seems to be too small"). A window whose
   buttons are pinned to the foot of its own scrolling body (the input window's Cancel / Add, Holidays' buttons) covers that
   foot, and says by how much in the standard way, its scroll padding — the margin the browser itself keeps clear when it
   scrolls a thing into view there (25-inputs-calendar.css, 23-days.css). The lift measured the panel's bare edge, so a box
   brought to the panel's foot sat exactly behind the buttons. In screen pixels, as the panel's box is. */
function keptClear(a: Element): { top: number, bottom: number } {
  const cs = getComputedStyle(a), k = scaleOf(a)
  const px = (v: string) => (parseFloat(v) || 0) * k
  /* and a pinned foot it does not declare, measured as it stands: its last child, or that child's own last child (three
     deep at most), held sticky to its foot — so a button row that wraps to two lines on an iPhone's wider letters is
     cleared whole */
  let foot = 0
  for (let f = a.lastElementChild, d = 0; f && d < 3; f = f.lastElementChild, d++) {
    const s = getComputedStyle(f)
    if (s.position === 'sticky' && s.bottom !== 'auto') { foot = f.getBoundingClientRect().height; break }
  }
  return { top: px(cs.scrollPaddingTop || cs.getPropertyValue('scroll-padding-top')), bottom: Math.max(foot, px(cs.scrollPaddingBottom || cs.getPropertyValue('scroll-padding-bottom'))) }
}
/* scroll `sc` so `el`'s bottom sits at `bot` or above, never taking its top above `top` */
function lift(sc: Element, el: HTMLElement, bot: number, top: number): number {
  const r = el.getBoundingClientRect()
  let d = r.bottom - bot
  if (d <= 0) return 0
  d = Math.min(d, r.top - top)
  if (d <= 0) return 0
  /* in screen pixels, both ways: inside the board's zoomed day (D1109) a list's own pixels are drawn smaller or larger
     (ui/pinchzoom.ts scaleOf — 1 everywhere else) */
  const k = scaleOf(sc)
  const was = sc.scrollTop
  sc.scrollTop = was + Math.ceil(d / k)
  return (sc.scrollTop - was) * k
}

/* A WINDOW IS RAISED ONLY AS A LAST RESORT (the walk's KS3, 19 Oct 26: Admin → Duty templates on a phone — its rows
   all fit, so nothing in it scrolls, and its last time box sat under the keys; D1412, 27 Oct 26: on his iPhone the
   phone's own pan brings the box into view, the window riding up with it, so the app has nothing to do). Once the
   phone's pan has come to rest, a box still under the keys in a fixed layer — a browser that shrank the visible screen
   without panning to the box — has its window raised: inside a backdrop that fills the screen (a .modal), the box on it;
   else the fixed layer — by the CSS `translate` property, which adds to any transform a window is dragged by, up by what
   the box needs and never so far that the window's top leaves the visible screen. It is put back where it was when the
   typing ends or the keys go down, and comes down again — never below its own place — when a box further up the same
   window is tapped or the phone's pan has since brought the box up. A window is never held to the room or shrunk
   (D1412): a box its raising cannot reach is the phone's to show, and on an iPhone it is. */
const LIFTED = new Set<HTMLElement>()
const shiftOf = (l: HTMLElement) => +(l.dataset.kblift || 0)
/* `s` up the screen, never below zero */
function setShift(l: HTMLElement, s: number) {
  if (s > 0.5) { l.style.translate = `0 ${-Math.round(s)}px`; l.dataset.kblift = String(Math.round(s)); LIFTED.add(l); return }
  l.style.translate = ''; delete l.dataset.kblift
  LIFTED.delete(l)
}

/** Puts one window back where it stood — also for a window about to be dragged by its bar (floatwin.ts). */
export function putBack(l: HTMLElement) {
  l.style.translate = ''; delete l.dataset.kblift
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
    typing has ended (no `keep`) — taken away between two boxes, the page would jump back and forth. At once: nothing
    the app moved for the keys is animated (D1412 — the phone's own slide is the only motion as the keys come and go). */
export function dropLifts(keep?: Element | null) {
  for (const l of [...LIFTED]) if (!keep || !l.contains(keep)) putBack(l)
  for (const p of [...ROOMED]) if (!keep || !p.contains(keep)) unroom(p)
  for (const l of [...FULL]) if (!keep || !l.contains(keep)) unholdFull(l)
  if (!keep && SPACER) { SPACER.remove(); SPACER = null }
}
/* the window a fixed layer holds the box in: the layer itself, or — a backdrop exactly on the layout — its child that
   holds the box. A backdrop stands exactly on the layout, its top on the layout's top and as tall, read by the fixed mark
   (screenBox), never by the window's own height, which his iPhone gives as what is left below the visible top while the
   screen is panned (a window 12 from the layout's top, 660 tall, then read as a backdrop — his recordings of 25 Oct 26
   10:10); a window a little TALLER than the screen, centred on it (the Tracker's All events, 88% of a tall screen), is a
   window. */
function windowIn(fixedEl: HTMLElement, el: HTMLElement, sb: ScreenBox): HTMLElement | null {
  const fr = fixedEl.getBoundingClientRect()
  if (Math.abs(fr.top - sb.layTop) <= 1 && Math.abs(fr.height - sb.layH) <= 2) {
    let c: Element | null = el
    while (c && c.parentElement !== fixedEl) c = c.parentElement
    return c as HTMLElement | null
  }
  return fixedEl
}
function raise(fixedEl: HTMLElement, el: HTMLElement, sb: ScreenBox): number {
  const visTop = sb.top, visBot = sb.bottom
  const layer = windowIn(fixedEl, el, sb)
  if (!layer) return 0
  const s0 = shiftOf(layer)
  const r = el.getBoundingClientRect(), lr = layer.getBoundingClientRect()
  /* where the phone itself placed the box in sight — to the keys' very edge — a window never raised is left as it is:
     nothing of the app's own moves after the phone's slide (D1412; the fresh read's F3: measured against the clear strip,
     a box the pan left a few points above the keys was still lifted, mid-slide); a box under the keys rises to the strip */
  if (s0 === 0 && r.bottom <= visBot + 0.5) return 0
  const need = r.bottom - (visBot - GAP)
  /* up by what the box needs, never past the visible top; down again (towards where it stood) when it is higher than it
     need be — a box further up the same window, or the phone's pan since bringing the box up */
  const room = lr.top - (visTop + GAP)
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
  const r = el.getBoundingClientRect(), pr = p.getBoundingClientRect(), kc = keptClear(p)
  const bot = Math.min(pr.bottom - kc.bottom, visBot) - GAP, top = Math.max(pr.top + kc.top, visTop) + GAP
  const want = Math.min(r.bottom - bot, r.top - top)
  if (want <= 0.5) return 0
  const base = ROOMED.has(p) ? parseFloat(p.style.getPropertyValue('--kbroom')) || 0 : parseFloat(getComputedStyle(p).paddingBottom) || 0
  p.dataset.kbroom = ''; p.style.setProperty('--kbroom', Math.ceil(base + want) + 'px'); ROOMED.add(p)
  return lift(p, el, bot, top)
}

/* A LAYER over the page: anything position:fixed, and the Scheduler Board, which stands as page content while it is open
   (data-kblayer — SchedBoard.tsx, owner D1081: an iPhone draws a fixed full-screen layer out of place for a frame as the
   keys close) but is still a whole screen of its own: never raised as a window is (panelRoom), and kept at the
   height it had when a box in it was tapped (holdFull). */
const isLayer = (a: Element) => a.hasAttribute('data-kblayer') || getComputedStyle(a).position === 'fixed'
const layerOf = (el: HTMLElement): HTMLElement | null => {
  for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) if (isLayer(a)) return a
  return null
}

/* THE BOARD'S BOX RIDES THE PAGE'S OWN SCROLL FIRST (Fable's read of his recordings, 19 Oct 26). An iPhone shows a box
   being typed in by scrolling the PAGE — the keys let the page scroll on by their own height even when the document is
   held to one screen (html.sb-board-up), and that is exactly what the phone does by itself, smoothly with the keys, before
   any script runs. The board is page content, so that scroll carries the board, its bar sliding off the top, and the box
   lands at the keys' edge. What the lift still owes is the GAP above the keys: it asks the page for it first — the same
   scroll the phone itself just made, driven by the browser's own scrolling view, so a tap that follows is never judged
   against a stale picture of where things stand — and only where the page can go no further (a desktop or Chromium,
   whose held document does not scroll at all; a box at the very end of the list) scrolls the board's own list, with room
   at its foot (panelRoom). Before this the list was scrolled by script after every tap on the board; a tap that landed
   right after one sometimes chose nothing ("I have to tap again" — his eighth report, 17:10) — a stale hit test after a
   script scroll of a touch-scrolled list is the likeliest cause Fable could name without the phone; his readout decides. */

/** Scrolls `el`'s scrolling panels (nearest first), then the page unless `el` is inside a fixed layer — where, if the box
    is still under the keys once the phone's own pan has shown what it will, the window is raised instead (raise) — so the
    box sits clear of the keys and of its panel's pinned foot. In the Scheduler Board the page comes first (above), then
    its list. Returns how far it moved things in all (0: it was already in sight). */
export function keepAboveKeyboard(el: HTMLElement, vv: VV): number {
  /* the visible screen in the measure the boxes are given in (screenBox — his iPhone measures from the visible top) */
  const sb = screenBox(vv)
  const visTop = sb.top, visBot = sb.bottom
  let moved = 0
  const layer = layerOf(el)
  /* in a window the keys' floor is the keys' own edge — a box the phone's pan left in sight, to that edge, is not scrolled
     (D1412); the floor of the panel's own pinned foot keeps its clear strip, and the page and the board keep theirs */
  const keysFloor = layer && !layer.hasAttribute('data-kblayer') ? visBot : visBot - GAP
  const panels = () => {
    for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      if (!scrolls(a)) continue
      const ar = a.getBoundingClientRect(), kc = keptClear(a)
      /* the panel's own edge (its foot less what covers it) with the clear strip where it stands above the keys; else the keys */
      const edge = ar.bottom - kc.bottom
      moved += lift(a, el, edge < keysFloor ? edge - GAP : keysFloor, Math.max(ar.top + kc.top, visTop) + GAP)
    }
  }
  const page = document.scrollingElement || document.documentElement
  const pageLift = () => (page ? lift(page, el, visBot - GAP, visTop + GAP) : 0)
  if (layer && layer.hasAttribute('data-kblayer')) {
    /* the board: the page as far as it goes, then its list, then room at the list's foot — never raised */
    moved += pageLift()
    panels()
    return moved + panelRoom(el, layer, visTop, visBot)
  }
  panels()
  if (layer) {
    const r = raise(layer, el, sb)
    /* a window raised may now scroll its own body: the panels once more */
    if (r) { moved += r; panels() }
    return moved
  }
  if (page) {
    moved += pageLift()
    /* the page at its foot and the box still under the keys: room below it, then the page once more — only as much as
       the box can still rise with its top in sight (the narrow read round 2's L1: a box taller than the room had a block
       added at every refit, the page nowhere near its foot) */
    const r2 = el.getBoundingClientRect()
    const want = Math.min(r2.bottom - (visBot - GAP), r2.top - (visTop + GAP))
    if (want > 0.5) { roomBelow(want); moved += pageLift() }
  }
  return moved
}

/* THE BOARD KEEPS ITS HEIGHT WHILE A BOX IN IT IS TYPED IN (Fable, 19 Oct 26 — his black band: the board ending a third
   of the way down the screen, the page's dark background below it to the keys). The board is as tall as the layout
   (position:absolute, inset:0). An iPhone's Safari never shortens the layout for the keys — only the visible screen — but
   Chrome on an iPhone can (his "works, then stops" after another app, noteFullHeight above), and the picture of 17:10 was of
   a build that held the board's body to the visible height by script: either way a board cut short while the phone has
   already scrolled the page on for the keys ends above them, the page's dark foot below. So from the moment a box in the
   board takes the focus until the typing ends or the keys go down, the board's height is held at what the layout was
   then (the custom property --kbfull, read by one rule, [data-kbfull] in 08-windows-tools.css — a floor, never a cap:
   the board still grows with its layout). The page's scroll range follows the board's height, so the phone's own scroll
   stays within board. Nothing is held between taps that end the typing: a board that then meets a shorter layout (a turn
   to landscape) follows it again. */
const FULL = new Set<HTMLElement>()
function holdFull(l: HTMLElement) {
  if (FULL.has(l)) return
  l.dataset.kbfull = ''; l.style.setProperty('--kbfull', Math.round(window.innerHeight) + 'px'); FULL.add(l)
}
function unholdFull(l: HTMLElement) { delete l.dataset.kbfull; l.style.removeProperty('--kbfull'); FULL.delete(l) }

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
  let box: HTMLElement | null = null, at = 0, raf = 0, onlyWindow = false
  const place = () => {
    raf = 0
    const vv = window.visualViewport
    if (!box || document.activeElement !== box || !box.isConnected || !keyboardUp(vv)) return
    /* a pan long after the focus with the window raised: the raise is read again against the visible screen as it now
       stands (down by what the pan brought), and nothing inside the window is scrolled — a box he scrolled away from in
       it stays where he put it */
    const b = box
    if (onlyWindow) { onlyWindow = false; const l = layerOf(b); if (l) raise(l, b, screenBox(vv!)); placed('placed-win'); return }
    keepAboveKeyboard(b, vv!)
    placed('placed')
  }
  /* the readout's line after each placing (below); a no-op without ?kbdebug */
  let placed: (ev: string) => void = () => {}
  /* two frames on: the board and the sheets re-fit themselves to the same resize first (their own listeners), and the
     box is measured where they left it */
  const soon = (windowOnly = false) => {
    if (raf) cancelAnimationFrame(raf)
    onlyWindow = windowOnly
    raf = requestAnimationFrame(() => { raf = requestAnimationFrame(place) })
  }
  /* A WINDOW RAISED FOR THE KEYS IS READ AGAINST THE VISIBLE SCREEN FOR AS LONG AS THEY ARE UP (his recording, 25 Oct 26
     07:40 — the iPhone's password bar rose over the keys and the phone panned the visible screen some 170 points down,
     later than the focus window below). The focus window is for the page and its panels, where a late resize is Safari's
     own bars folding as he scrolls; a window raised for the keys stands in a fixed layer that no scroll of his moves, so
     a late pan has its raise read again (down by what the pan brought, never below its place). A window the app never
     raised — every window on his iPhone — is the phone's: it rides the pan as page content does, and nothing is read. */
  const lifted = () => !!box && [...LIFTED].some(l => l.contains(box!))
  const focusin = (e: FocusEvent) => {
    dropLifts(e.target as Element)
    if (!isTypingBox(e.target)) { box = null; return }
    box = e.target as HTMLElement; at = Date.now()
    /* a box in the board: the board's height held from now, before the keys can shorten the layout (holdFull) */
    const layer = layerOf(box)
    if (layer && layer.hasAttribute('data-kblayer')) holdFull(layer)
    soon()
  }
  /* the typing ended (the focus went to nothing, as a tap on blank page does): a raised window goes back at once; a
     window the app never touched has nothing to go back from — the phone's own slide carries it down with the keys */
  const focusout = (e: FocusEvent) => {
    if (e.relatedTarget) return
    requestAnimationFrame(() => { if (!isTypingBox(document.activeElement)) dropLifts() })
  }
  /* read fresh each time: the walk stands a stand-in viewport in after the page has loaded */
  let vvNow: VisualViewport | null = null
  const resize = () => {
    noteFullHeight()
    const vv = window.visualViewport
    /* the keys down — read with the zoom taken out, so a pinch while typing (the narrow read round 2's L2) neither puts the
       window back nor takes the room below the page away; a zoomed frame itself changes nothing. A window still raised
       (the focus went to a button, not to nothing) goes back */
    if (!vv || fullHeight(vv) - vv.height * (vv.scale || 1) <= KEYBOARD_MIN) { dropLifts(); return }
    if (vv.scale > 1.01) return
    if (box && (Date.now() - at < FOCUS_WINDOW || lifted())) soon()
  }
  /* THE LIFT WAITS FOR THE PHONE'S OWN PAN TO END (Fable, 19 Oct 26). An iPhone scrolls the page to show the box over the
     frames the keys take to rise, and tells of each step by the visual viewport's `scroll`. A lift measured while that pan
     is still running adds its own move to one the phone has not finished — the screen then rises by more than the keys
     did (his recordings). Each step of the pan sets the measuring back two frames, so the box is measured once the screen
     has come to rest, against where the phone left it: most often nothing is left to do. (His iPhone tells of the whole
     pan in one `scroll`, some 30ms into a slide of a quarter second — his recordings of 25 Oct 26 11:49 and 11:54: the
     numbers are final at once, the picture follows over the slide, and the app leaves the picture to the phone, D1412.) */
  const scroll = () => {
    if (!box || !keyboardUp(window.visualViewport)) return
    if (Date.now() - at < FOCUS_WINDOW) soon()
    else if (lifted()) soon(true)
  }
  const follow = () => {
    const vv = window.visualViewport
    if (vv === vvNow) return
    vvNow?.removeEventListener('resize', resize); vvNow?.removeEventListener('scroll', scroll)
    vvNow = vv; vvNow?.addEventListener('resize', resize); vvNow?.addEventListener('scroll', scroll)
  }
  follow(); noteFullHeight()
  /* THE PHONE'S OWN NUMBERS ON SCREEN, ON ASKING (his recordings of 25 Oct 26 — Chromium cannot raise an iPhone's keyboard,
     so what his phone does is read off his screen): with `?kbdebug` in the address, a small box at the top of the visible
     screen shows the layout's height, the visible screen's height and pan, whether the keys count as up, and the window of
     the box typed in — its top and foot, and its raise — line by line as each event comes. Nothing without it. */
  const debug = typeof location !== 'undefined' && /[?&]kbdebug\b/.test(location.search)
  let dbgEl: HTMLElement | null = null
  const dbgLines: string[] = []
  const dbg = (ev: string) => {
    if (!debug) return
    if (!dbgEl) {
      dbgEl = document.createElement('div'); dbgEl.setAttribute('aria-hidden', 'true')
      Object.assign(dbgEl.style, { position: 'fixed', left: '0', zIndex: '2147483647', pointerEvents: 'none', font: '10px/1.3 monospace', color: '#7CFC7C', background: 'rgba(0,0,0,.8)', padding: '2px 4px', whiteSpace: 'pre', maxWidth: '100vw' })
      document.body.appendChild(dbgEl)
    }
    const vv = window.visualViewport
    /* the window itself — on a backdrop, the window on it, not the backdrop (the fresh read's F4) */
    const l0 = box ? layerOf(box) : null, l = l0 && box && vv ? windowIn(l0, box, screenBox(vv)) : l0, r = l?.getBoundingClientRect()
    const t = box ? Date.now() - at : 0
    /* L: where the layout's top stands in the page's measure (screenBox) — 0 on a desktop, minus the pan on his iPhone */
    const lay = vv ? screenBox(vv).layTop : 0
    dbgLines.push(`${t}ms ${ev} iH${Math.round(window.innerHeight)} vv${vv ? Math.round(vv.height) + '@' + Math.round(vv.offsetTop) : '-'} L${Math.round(lay)} ${keyboardUp(vv) ? 'UP' : 'dn'}` +
      (r ? ` win${Math.round(r.top)}-${Math.round(r.bottom)} sh${l!.dataset.kblift || 0}` : ''))
    while (dbgLines.length > 9) dbgLines.shift()
    dbgEl.textContent = dbgLines.join('\n')
    dbgEl.style.top = Math.round(vv ? vv.offsetTop : 0) + 'px'
  }
  if (debug) {
    placed = dbg
    for (const [tgt, ev] of [[document, 'focusin'], [document, 'focusout'], [window, 'resize']] as const) tgt.addEventListener(ev, () => requestAnimationFrame(() => dbg(ev)), true)
    window.visualViewport?.addEventListener('resize', () => requestAnimationFrame(() => dbg('vv-resize')))
    window.visualViewport?.addEventListener('scroll', () => requestAnimationFrame(() => dbg('vv-scroll')))
  }
  const focusAlso = (e: FocusEvent) => { follow(); focusin(e) }
  document.addEventListener('focusin', focusAlso, true)
  document.addEventListener('focusout', focusout, true)
  return () => {
    document.removeEventListener('focusin', focusAlso, true)
    document.removeEventListener('focusout', focusout, true)
    dropLifts()
    vvNow?.removeEventListener('resize', resize); vvNow?.removeEventListener('scroll', scroll)
    if (raf) cancelAnimationFrame(raf)
  }
}
