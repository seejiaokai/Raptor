// @vitest-environment jsdom
/* [KEYBOARD-SCROLL] (D1048): the box being typed in is scrolled to sit just above a phone's keyboard. jsdom has no
   layout, so every box is given a stand-in place: an element's top is its place on the page less every scroll above
   it; the visual viewport is a stand-in object, as the walk's is. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { keepAboveKeyboard, keyboardUp, isTypingBox, installKbScroll, dropLifts, noteFullHeight, GAP } from './kbscroll'

const H = 800, KB = 340                                   // the layout's height; the keys' height
const vvUp = { height: H - KB, offsetTop: 0, scale: 1 }   // the visible screen with the keys up

/* give `el` a box: `y` its top on an unscrolled page, `h` its height; its live top takes off the scroll of every
   element above it (the page's included) */
function place(el: HTMLElement, y: number, h: number) {
  el.getBoundingClientRect = () => {
    let top = y
    for (let a = el.parentElement; a; a = a.parentElement) top -= a.scrollTop   // the page's own, on <html>, included
    for (let a: HTMLElement | null = el; a; a = a.parentElement) top -= +(a.dataset?.kblift || 0)   // a window raised for the keys
    return { top, bottom: top + h, left: 0, right: 100, width: 100, height: h, x: 0, y: top, toJSON() {} } as DOMRect
  }
}
/* a panel that scrolls: its own box, and room to scroll `room` pixels */
function panel(el: HTMLElement, y: number, h: number, room: number) {
  el.style.overflowY = 'auto'
  let st = 0
  Object.defineProperty(el, 'scrollTop', { configurable: true, get: () => st, set: v => { st = Math.max(0, Math.min(room, v)) } })
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => h + room })
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => h })
  place(el, y, h)
}
let pageST = 0
beforeEach(() => {
  document.body.innerHTML = ''
  pageST = 0
  /* jsdom has no scrollingElement: the page's scroll is <html>'s, as the code falls back to */
  Object.defineProperty(document.documentElement, 'scrollTop', { configurable: true, get: () => pageST, set: v => { pageST = Math.max(0, Math.min(2000, v)) } })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: H })
})

describe('keepAboveKeyboard', () => {
  it('scrolls the box\'s own panel so its bottom sits GAP above the keys, and no further', () => {
    document.body.innerHTML = '<div id="fx" style="position:fixed"><div id="p"><input id="b"></div></div>'
    const p = document.getElementById('p')!, b = document.getElementById('b') as HTMLInputElement
    panel(p, 0, H, 1000)
    place(b, 700, 30)                                          // 700–730: under the keys (they start at 460)
    keepAboveKeyboard(b, vvUp)
    expect(b.getBoundingClientRect().bottom).toBe(H - KB - GAP)
    expect(pageST).toBe(0)                                     // in a fixed layer: the page behind never moves (D686)
  })
  it('leaves a box already in sight where it is', () => {
    document.body.innerHTML = '<div id="p"><input id="b"></div>'
    const p = document.getElementById('p')!, b = document.getElementById('b') as HTMLInputElement
    panel(p, 0, H, 1000); place(b, 200, 30)
    expect(keepAboveKeyboard(b, vvUp)).toBe(0)
    expect(p.scrollTop).toBe(0)
  })
  it('a box taller than the room left keeps its top in sight', () => {
    document.body.innerHTML = '<div id="fx" style="position:fixed"><div id="p"><textarea id="b"></textarea></div></div>'
    const p = document.getElementById('p')!, b = document.getElementById('b')!
    panel(p, 0, H, 2000); place(b, 600, 700)
    keepAboveKeyboard(b, vvUp)
    expect(b.getBoundingClientRect().top).toBe(GAP)
  })
  it('scrolls the page where the box is in the page\'s own flow, after its panels', () => {
    document.body.innerHTML = '<div id="p"><input id="b"></div>'
    const p = document.getElementById('p')!, b = document.getElementById('b') as HTMLInputElement
    panel(p, 300, 400, 50)                                     // the panel can only give 50
    place(b, 680, 30)
    keepAboveKeyboard(b, vvUp)
    expect(p.scrollTop).toBe(50)
    expect(b.getBoundingClientRect().bottom).toBe(H - KB - GAP)
  })
  it('a panel whose own foot is above the keys brings the box above that foot', () => {
    document.body.innerHTML = '<div id="fx" style="position:fixed"><div id="p"><input id="b"></div></div>'
    const p = document.getElementById('p')!, b = document.getElementById('b') as HTMLInputElement
    panel(p, 100, 250, 500)                                    // the panel ends at 350, above the keys
    place(b, 400, 30)                                          // hidden below the panel's foot
    keepAboveKeyboard(b, vvUp)
    expect(b.getBoundingClientRect().bottom).toBe(350 - GAP)
  })
  /* HIS REPORT, 25 Oct 26 07:06 (the input window, "Other", Remarks tapped on his iPhone — Document, then Cancel / Add, no
     Remarks): a window's buttons pinned to the foot of its scrolling body cover that foot, and the body says so by its
     scroll-padding-bottom (the input window's 64px, 25-inputs-calendar.css). The box was lifted to the body's very foot —
     behind the buttons. */
  it('a panel whose foot its own pinned buttons cover (its scroll padding) brings the box above them, not behind them', () => {
    document.body.innerHTML = '<div id="fx" style="position:fixed"><div id="p" style="scroll-padding-bottom:64px"><input id="b"></div></div>'
    const p = document.getElementById('p')!, b = document.getElementById('b') as HTMLInputElement
    panel(p, 100, 250, 500)                                    // the panel ends at 350, above the keys; its buttons 286–350
    place(b, 400, 30)
    keepAboveKeyboard(b, vvUp)
    expect(b.getBoundingClientRect().bottom).toBe(350 - 64 - GAP)
  })
  it('a pinned button row it does not declare (Holidays) is measured and cleared too', () => {
    document.body.innerHTML = '<div id="fx" style="position:fixed"><div id="p"><div><input id="b"><div id="acts" style="position:sticky;bottom:0"></div></div></div></div>'
    const p = document.getElementById('p')!, b = document.getElementById('b') as HTMLInputElement, acts = document.getElementById('acts')!
    panel(p, 100, 250, 500)                                    // the panel ends at 350; its buttons 280–350, 70 tall
    acts.getBoundingClientRect = () => ({ top: 280, bottom: 350, left: 0, right: 100, width: 100, height: 70, x: 0, y: 280, toJSON() {} }) as DOMRect
    place(b, 400, 30)
    keepAboveKeyboard(b, vvUp)
    expect(b.getBoundingClientRect().bottom).toBe(350 - 70 - GAP)
  })
  it('and where that foot is under the keys, the keys are the floor, as before', () => {
    document.body.innerHTML = '<div id="fx" style="position:fixed"><div id="p" style="scroll-padding-bottom:64px"><input id="b"></div></div>'
    const p = document.getElementById('p')!, b = document.getElementById('b') as HTMLInputElement
    panel(p, 0, H, 1000)                                       // the panel's foot (and its buttons) under the keys
    place(b, 700, 30)
    keepAboveKeyboard(b, vvUp)
    expect(b.getBoundingClientRect().bottom).toBe(H - KB - GAP)
  })
})

describe('room below the page (walker A: A11)', () => {
  afterEach(() => dropLifts())
  it('the page at its foot: an empty block after it, as tall as is missing, then the page once more; gone when the typing ends', () => {
    document.body.innerHTML = '<div id="pg"><input id="b"></div>'
    const b = document.getElementById('b') as HTMLInputElement
    /* the page can scroll 30px, plus whatever is put after it */
    const room = () => 30 + (parseFloat((document.querySelector('[data-kbspacer]') as HTMLElement | null)?.style.height || '0') || 0)
    Object.defineProperty(document.documentElement, 'scrollTop', { configurable: true, get: () => pageST, set: v => { pageST = Math.max(0, Math.min(room(), v)) } })
    place(b, 700, 30)
    keepAboveKeyboard(b, vvUp)
    expect(b.getBoundingClientRect().bottom).toBe(H - KB - GAP)
    expect(document.querySelector('[data-kbspacer]')).toBeTruthy()
    dropLifts(b)
    expect(document.querySelector('[data-kbspacer]'), 'kept between two boxes').toBeTruthy()
    dropLifts()
    expect(document.querySelector('[data-kbspacer]')).toBeNull()
  })
})

describe('the narrow read round 2', () => {
  it('L1: a box taller than the room, the page far from its foot: no block below the page, however often it refits', () => {
    document.body.innerHTML = '<div id="pg"><textarea id="b"></textarea></div>'
    const b = document.getElementById('b')!
    place(b, 300, 500)
    keepAboveKeyboard(b, vvUp); keepAboveKeyboard(b, vvUp); keepAboveKeyboard(b, vvUp)
    expect(document.querySelector('[data-kbspacer]')).toBeNull()
    expect(b.getBoundingClientRect().top).toBe(GAP)
    dropLifts()
  })
})

describe('a window that cannot scroll is raised instead', () => {
  const win = () => {
    document.body.innerHTML = '<div id="bd" style="position:fixed"><div id="w"><input id="b"><input id="t"></div></div>'
    const bd = document.getElementById('bd')!, w = document.getElementById('w')!
    const b = document.getElementById('b') as HTMLInputElement, t = document.getElementById('t') as HTMLInputElement
    place(bd, 0, H)                     // a backdrop as tall as the layout (a .modal)
    place(w, 300, 300)                  // the window on it, in the middle: 300–600
    place(b, 560, 30)                   // its last box, under the keys (they start at 460)
    place(t, 320, 30)                   // a box near its top
    return { bd, w, b, t }
  }
  afterEach(() => dropLifts())
  it('the window on the backdrop goes up just enough; the backdrop and the page stay', () => {
    const { bd, w, b } = win()
    keepAboveKeyboard(b, vvUp)
    expect(b.getBoundingClientRect().bottom).toBe(H - KB - GAP)
    expect(w.style.translate).toBe(`0 -${590 - (H - KB - GAP)}px`)
    expect(bd.dataset.kblift).toBeUndefined()
    expect(pageST).toBe(0)
  })
  it('never so far that its top leaves the screen', () => {
    const { w, b } = win()
    place(b, 590, 400)                  // a box taller than the room: its top keeps in sight, so does the window's
    keepAboveKeyboard(b, vvUp)
    expect(w.getBoundingClientRect().top).toBeGreaterThanOrEqual(GAP)
  })
  it('a box higher in the same window lets it back down, never below where it stood', () => {
    const { w, b, t } = win()
    keepAboveKeyboard(b, vvUp)
    keepAboveKeyboard(t, vvUp)
    expect(w.dataset.kblift).toBeUndefined()
    expect(t.getBoundingClientRect().top).toBe(320)
  })
  /* D1412 (27 Oct 26 — his four recordings): a window is never held to the room or shrunk. A box its raising cannot reach
     is the phone's to show, and on an iPhone the phone's own pan shows it before the app measures anything. */
  it('a window taller than the room is never held or shrunk (D1412): raised to the visible top at most, as tall as it was, its body left alone', () => {
    document.body.innerHTML = '<div id="bd" style="position:fixed"><div id="w"><input id="b"></div></div>'
    const bd = document.getElementById('bd')!, w = document.getElementById('w')!, b = document.getElementById('b') as HTMLInputElement
    place(bd, 0, H)
    /* the window: 300–900, as tall as its content, which fits it (nothing to scroll) */
    w.style.overflowY = 'auto'
    Object.defineProperty(w, 'scrollHeight', { configurable: true, get: () => 600 })
    Object.defineProperty(w, 'clientHeight', { configurable: true, get: () => 600 })
    w.getBoundingClientRect = () => { const top = 300 - +(w.dataset.kblift || 0); return { top, bottom: top + 600, left: 0, right: 100, width: 100, height: 600, x: 0, y: top, toJSON() {} } as DOMRect }
    place(b, 860, 30)                   // its last row, which rising to the top alone cannot bring above the keys
    keepAboveKeyboard(b, vvUp)
    expect([w.dataset.kbcap, w.style.getPropertyValue('--kbcap'), w.style.maxHeight], 'never held, never shrunk').toEqual([undefined, '', ''])
    expect(w.getBoundingClientRect().height, 'as tall as it was').toBe(600)
    expect(w.getBoundingClientRect().top, 'raised to the visible top, no further').toBe(GAP)
    dropLifts()
    expect([w.dataset.kblift, w.style.translate], 'put back').toEqual([undefined, ''])
  })
  it('a window already at the top with a box still under the keys: left exactly as it is (never held)', () => {
    document.body.innerHTML = '<div id="w" style="position:fixed"><input id="b"></div>'
    const w = document.getElementById('w')!, b = document.getElementById('b') as HTMLInputElement
    w.getBoundingClientRect = () => ({ top: GAP, bottom: GAP + 700, left: 0, right: 100, width: 100, height: 700, x: 0, y: GAP, toJSON() {} }) as DOMRect
    place(b, 650, 30)
    expect(keepAboveKeyboard(b, vvUp)).toBe(0)
    expect([w.dataset.kbcap, w.dataset.kblift, w.style.translate]).toEqual([undefined, undefined, ''])
  })
  it('put back when the typing ends', () => {
    const { w, b } = win()
    keepAboveKeyboard(b, vvUp)
    dropLifts()
    expect(w.style.translate).toBe('')
    expect(b.getBoundingClientRect().bottom).toBe(590)
  })
})

/* THE PHONE'S OWN PAN CARRIES THE WINDOW (D1412, 27 Oct 26 — his recordings of 25 Oct 26 20:43–20:45 and 27 Oct 26 08:20, after
   the six rounds of 25 Oct 26 that held, pinned, brought down and glided a window against a model of his iPhone's slide:
   "the window top screen will shorten and I can see the background … Then it expands back out again. Why can't the text
   box I click on, auto scroll proportionately with the keyboard that appears and the window doesn't shrink awhile").
   Safari pans the visible screen to show the box, the window riding up with the page in the same motion; the app leaves
   the window exactly where that pan put it. */
describe("a window the phone's own pan carried to show the box (D1412)", () => {
  const vvPanned = { height: 416, offsetTop: 186, scale: 1 }   // the visible screen: 186–602 of the layout
  afterEach(() => dropLifts())
  const tall = (h: number) => {
    document.body.innerHTML = '<div id="w" style="position:fixed"><input id="b"></div>'
    const w = document.getElementById('w')!, b = document.getElementById('b') as HTMLInputElement
    let st = 0
    w.style.overflowY = 'auto'
    Object.defineProperty(w, 'scrollTop', { configurable: true, get: () => st, set: v => { st = Math.max(0, Math.min(Math.max(0, 700 - h), v)) } })
    Object.defineProperty(w, 'scrollHeight', { configurable: true, get: () => Math.max(700, h) })
    Object.defineProperty(w, 'clientHeight', { configurable: true, get: () => h })
    w.getBoundingClientRect = () => { const top = 12 - +(w.dataset.kblift || 0); return { top, bottom: top + h, left: 0, right: 100, width: 100, height: h, x: 0, y: top, toJSON() {} } as DOMRect }
    return { w, b }
  }
  it('a window taller than the room, its top carried above the visible screen, the box in sight: not held, not shrunk, not brought down — left where the phone put it', () => {
    const { w, b } = tall(700)
    place(b, 470, 30)                                          // in sight of the visible screen (186–602) already
    expect(keepAboveKeyboard(b, vvPanned)).toBe(0)
    expect([w.dataset.kbcap, w.style.getPropertyValue('--kbcap'), w.dataset.kblift, w.style.translate]).toEqual([undefined, '', undefined, ''])
    expect(w.getBoundingClientRect().top, 'where the phone left it').toBe(12)
    expect(w.scrollTop, 'its body not scrolled').toBe(0)
  })
  it('a window that fits, its top above the visible screen: left there too', () => {
    const { w, b } = tall(300)
    place(b, 200, 30)
    expect(keepAboveKeyboard(b, vvPanned)).toBe(0)
    expect([w.dataset.kbcap, w.dataset.kblift, w.style.translate]).toEqual([undefined, undefined, ''])
  })
  it("a box the pan left a little under the keys: the window's own body scrolls it clear, the window itself untouched", () => {
    const { w, b } = tall(600)                                 // 12–612, scrolling 700 of content
    place(b, 580, 30)                                          // 580–610: 16 under the keys' clear strip (602 − 8)
    keepAboveKeyboard(b, vvPanned)
    expect(w.scrollTop).toBe(16)
    expect(b.getBoundingClientRect().bottom).toBe(602 - GAP)
    expect([w.dataset.kbcap, w.dataset.kblift, w.style.translate], 'the window itself never moved or held').toEqual([undefined, undefined, ''])
  })
})

/* HIS ?kbdebug RECORDINGS, 25 Oct 26 10:10 and 10:18 — the input window opened from a calendar day (OL; the SANS
   calendar's SANS Availability), Remarks tapped, the keys up and the screen panned 184: his iPhone measured everything
   from the top of the VISIBLE screen — the window that stands 12 from the layout's top read −172, the layout's height
   684 − 184 = 500 — where the lift took the visible screen to start at the pan (184–577). So the window, read as standing
   above it and as tall as the "layout" left, was taken for a full-screen backdrop, and the form inside it was brought
   down 280 instead of the window: an empty band under the window's title, Remarks under the keys. A mark the app keeps
   fixed at the layout's top and foot says where the layout stands in the phone's own measure. */
describe('a phone that measures from the top of the visible screen (his iPhone, 25 Oct 26 10:10)', () => {
  const PAN = 184, LAY = 684, VH = 393
  const vvHis = { height: VH, offsetTop: PAN, scale: 1 }
  const rect = (top: number, h: number) => ({ top, bottom: top + h, left: 0, right: 100, width: 100, height: h, x: 0, y: top, toJSON() {} }) as DOMRect
  afterEach(() => dropLifts())
  const build = () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: LAY - PAN })
    document.body.innerHTML = '<div data-kbprobe></div><div id="w" style="position:fixed"><div id="bar"></div><div id="bd"><input id="b"></div></div>'
    const probe = document.querySelector('[data-kbprobe]') as HTMLElement
    probe.getBoundingClientRect = () => rect(-PAN, LAY)
    const w = document.getElementById('w')!, bd = document.getElementById('bd')!, b = document.getElementById('b') as HTMLInputElement
    /* the window centres itself on the layout, 12 from its edges, as tall as it is held to (660 unheld) */
    const wh = () => (w.dataset.kbcap != null ? parseInt(w.style.getPropertyValue('--kbcap')) : 660)
    const wTop = () => 12 + (LAY - 24 - wh()) / 2 - PAN - +(w.dataset.kblift || 0)
    w.getBoundingClientRect = () => rect(wTop(), wh())
    /* its body under a 44 bar, scrolling 800 of form */
    let st = 0
    bd.style.overflowY = 'auto'
    const bh = () => wh() - 44
    Object.defineProperty(bd, 'scrollTop', { configurable: true, get: () => st, set: v => { st = Math.max(0, Math.min(800 - bh(), v)) } })
    Object.defineProperty(bd, 'scrollHeight', { configurable: true, get: () => 800 })
    Object.defineProperty(bd, 'clientHeight', { configurable: true, get: () => bh() })
    const bdTop = () => wTop() + 44 - +(bd.dataset.kblift || 0)
    bd.getBoundingClientRect = () => rect(bdTop(), bh())
    b.getBoundingClientRect = () => rect(bdTop() + 309 - st, 31)   // Remarks: 353 down the window
    return { w, bd, b }
  }
  it('the window is left where the phone\'s pan put it (D1412): nothing inside it moves, it is never held, and Remarks, shown by the pan, is left alone', () => {
    const { w, bd, b } = build()
    expect(keepAboveKeyboard(b, vvHis)).toBe(0)
    expect([bd.style.translate, bd.dataset.kbcap, bd.scrollTop], 'the form inside the window not moved, held or scrolled').toEqual(['', undefined, 0])
    expect([w.dataset.kbcap, w.style.getPropertyValue('--kbcap'), w.dataset.kblift, w.style.translate], 'the window never held or shifted').toEqual([undefined, '', undefined, ''])
    expect(w.getBoundingClientRect().top, 'its top where the pan carried it: 12 from the layout\'s top, 184 panned').toBe(12 - PAN)
    expect(b.getBoundingClientRect().bottom, 'Remarks above the keys, by the phone\'s own pan').toBeLessThanOrEqual(VH - GAP)
  })
  it('a window a little taller than the screen, centred on it (the Tracker\'s All events, his recording of 10:30): never held or brought down; a box the pan did not reach is scrolled into sight by its own list, the window untouched', () => {
    const P2 = 294, V2 = 390
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: LAY - P2 })
    document.body.innerHTML = '<div data-kbprobe></div><div id="w" style="position:fixed"><div id="hd"></div><div id="bd"><input id="b"></div></div>'
    ;(document.querySelector('[data-kbprobe]') as HTMLElement).getBoundingClientRect = () => rect(-P2, LAY)
    const w = document.getElementById('w')!, bd = document.getElementById('bd')!, b = document.getElementById('b') as HTMLInputElement
    /* centred on the layout by its middle (top 50%, translate −50%): 696 tall, 6 above the layout's top */
    const wTop = () => LAY / 2 - 696 / 2 - P2 - +(w.dataset.kblift || 0)
    w.getBoundingClientRect = () => rect(wTop(), 696)
    let st = 0
    bd.style.overflowY = 'auto'
    Object.defineProperty(bd, 'scrollTop', { configurable: true, get: () => st, set: v => { st = Math.max(0, Math.min(2000 - 646, v)) } })
    Object.defineProperty(bd, 'scrollHeight', { configurable: true, get: () => 2000 })
    Object.defineProperty(bd, 'clientHeight', { configurable: true, get: () => 646 })
    const bdTop = () => wTop() + 50 - +(bd.dataset.kblift || 0)
    bd.getBoundingClientRect = () => rect(bdTop(), 646)
    b.getBoundingClientRect = () => rect(bdTop() + 700 - st, 30)        // the event's Name box, well down the list
    keepAboveKeyboard(b, { height: V2, offsetTop: P2, scale: 1 })
    expect([w.dataset.kbcap, w.dataset.kblift, w.style.translate], 'the window never held, shrunk or shifted').toEqual([undefined, undefined, ''])
    expect(w.getBoundingClientRect().top, 'where the pan carried it').toBe(LAY / 2 - 348 - P2)
    expect(bd.style.translate, 'the list inside the window never moved').toBe('')
    expect(bd.scrollTop, 'the list scrolled the box clear of the keys').toBe(98)
    expect(b.getBoundingClientRect().bottom, 'the box above the keys').toBeLessThanOrEqual(V2 - GAP)
  })
  it('the same numbers read the classic way (the layout measured from its own top): unchanged — the visible screen starts at the pan', () => {
    const { w, b } = build()
    /* a browser measuring from the layout's top: the mark at 0, the window where its place puts it */
    ;(document.querySelector('[data-kbprobe]') as HTMLElement).getBoundingClientRect = () => rect(0, LAY)
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: LAY })
    w.getBoundingClientRect = () => rect(12 - +(w.dataset.kblift || 0), 660)
    expect(keepAboveKeyboard(b, vvHis)).toBe(0)
    expect([w.dataset.kbcap, w.dataset.kblift], 'nothing moved: the box was in sight by the pan').toEqual([undefined, undefined])
    expect(w.getBoundingClientRect().top, 'where its place puts it').toBe(12)
  })
})

describe('keyboardUp', () => {
  it('reads a keyboard from a visible screen much shorter than the layout, never while pinch-zoomed', () => {
    expect(keyboardUp(vvUp)).toBe(true)
    expect(keyboardUp({ height: H - 60, offsetTop: 0, scale: 1 })).toBe(false)   // the address bar alone
    expect(keyboardUp({ height: H - KB, offsetTop: 0, scale: 2 })).toBe(false)   // a pinch zoom
    expect(keyboardUp(null)).toBe(false)                                          // jsdom, an old browser
  })
  it('a visible screen read taller than the layout is never taken for the full screen (KS3b: the keys read as up for good)', () => {
    const had = Object.getOwnPropertyDescriptor(window, 'visualViewport')
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: { height: 2000, offsetTop: 0, scale: 1 } })
    try {
      noteFullHeight()
      expect(keyboardUp({ height: H, offsetTop: 0, scale: 1 }), 'the keys down').toBe(false)
    } finally {
      if (had) Object.defineProperty(window, 'visualViewport', had); else delete (window as any).visualViewport
    }
  })
})

describe('isTypingBox', () => {
  it('boxes to type in, never ticks, switches or buttons', () => {
    document.body.innerHTML = '<input id="t"><input id="n" inputmode="numeric"><input id="c" type="checkbox"><input id="r" type="range"><input id="ro" readonly><textarea id="a"></textarea><select id="s"></select><div id="ce" contenteditable="true"></div><button id="bt"></button>'
    const g = (id: string) => document.getElementById(id)
    /* jsdom does not compute isContentEditable */
    Object.defineProperty(g('ce')!, 'isContentEditable', { value: true })
    expect(['t', 'n', 'a', 's', 'ce'].map(i => isTypingBox(g(i)))).toEqual([true, true, true, true, true])
    expect(['c', 'r', 'ro', 'bt'].map(i => isTypingBox(g(i)))).toEqual([false, false, false, false])
  })
})

describe('installKbScroll', () => {
  let stop = () => {}
  let vv: any
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'Date'] })
    class FakeVV extends EventTarget { height = H; offsetTop = 0; scale = 1 }
    vv = new FakeVV()
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => vv })
    stop = installKbScroll()
  })
  afterEach(() => { stop(); vi.useRealTimers(); Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined }) })
  const fixture = () => {
    document.body.innerHTML = '<div style="position:fixed"><div id="p"><input id="b"><button id="x"></button></div></div>'
    const p = document.getElementById('p')!, b = document.getElementById('b') as HTMLInputElement
    panel(p, 0, H, 1000); place(b, 700, 30)
    return { p, b }
  }
  const keysUp = () => { vv.height = H - KB; vv.dispatchEvent(new Event('resize')) }
  const frames = () => vi.advanceTimersByTime(40)

  it('a box focused, then the keys up: the box is lifted above them', () => {
    const { b } = fixture()
    b.focus(); frames()
    expect(b.getBoundingClientRect().bottom).toBe(730)        // no keyboard yet: nothing moves
    keysUp(); frames()
    expect(b.getBoundingClientRect().bottom).toBe(H - KB - GAP)
  })
  it('with the keys already up, focusing another box lifts it at once', () => {
    const { b } = fixture()
    vv.height = H - KB
    b.focus(); frames()
    expect(b.getBoundingClientRect().bottom).toBe(H - KB - GAP)
  })
  it('a resize long after the focus does not pull the box back (Safari\'s bars folding)', () => {
    const { p, b } = fixture()
    b.focus(); frames()
    vi.advanceTimersByTime(3000)
    keysUp(); frames()
    expect(p.scrollTop).toBe(0)
  })
  it('L2: a pinch zoom while typing leaves a raised window raised (it is not the keys going down)', () => {
    document.body.innerHTML = '<div id="bd" style="position:fixed"><div id="w"><input id="b"></div></div>'
    const bd = document.getElementById('bd')!, w = document.getElementById('w')!, b = document.getElementById('b') as HTMLInputElement
    place(bd, 0, H); place(w, 300, 300); place(b, 560, 30)
    b.focus(); keysUp(); frames()
    expect(w.style.translate).not.toBe('')
    vv.scale = 2; vv.height = (H - KB) / 2; vv.dispatchEvent(new Event('resize')); frames()
    expect(w.style.translate, 'zoomed: still raised').not.toBe('')
    vv.scale = 1; vv.height = H; vv.dispatchEvent(new Event('resize'))
    expect(w.style.translate, 'the keys down: put back').toBe('')
  })
  /* HIS FOUR RECORDINGS (D1412, 27 Oct 26 — 25 Oct 26 20:43 and 27 Oct 26 08:20, the sign-in page: "all the text areas I click
     screen jerks or bounce a little when the keyboard opens. Even for text that are above the keyboard"; 25 Oct 26 20:44
     and 20:45, the input window, "Other" → Remarks: "the window top screen will shorten and I can see the background like
     the cyan input. Then it expands back out again"). The phone's own pan carries a window with its box, in step with the
     keys; the app moves, holds or shifts nothing — not at the pan's word, not two frames after it. */
  it('the sign-in card, its box above the keys, the phone panning 19: the app moves nothing — at the word of the pan or after it', () => {
    document.body.innerHTML = '<div id="bd" style="position:fixed"><div id="card"><input id="b"></div></div>'
    const bd = document.getElementById('bd')!, card = document.getElementById('card')!, b = document.getElementById('b') as HTMLInputElement
    place(bd, 0, H); place(card, 150, 300); place(b, 215, 30)
    b.focus(); frames()
    vv.height = H - 320; vv.dispatchEvent(new Event('resize')); frames()
    vv.offsetTop = 19; vv.dispatchEvent(new Event('scroll'))
    const untouched = () => [card.style.translate, card.dataset.kblift, bd.style.translate, bd.dataset.kblift]
    expect(untouched(), 'at the word of the pan').toEqual(['', undefined, '', undefined])
    frames(); frames()
    expect(untouched(), 'two frames on').toEqual(['', undefined, '', undefined])
    expect(card.getBoundingClientRect().top, 'the card where its place puts it').toBe(150)
  })
  it('the input window, "Other" → Remarks: the keys\' resize, the pan of 272 a moment later — the window never held, shrunk or shifted; the keys down, nothing put back', () => {
    document.body.innerHTML = '<div id="w" style="position:fixed"><div id="bd"><input id="b"></div></div>'
    const w = document.getElementById('w')!, bd = document.getElementById('bd')!, b = document.getElementById('b') as HTMLInputElement
    place(w, 12, 660); panel(bd, 56, 616, 400); place(b, 517, 33)
    b.focus(); frames()
    vv.height = 390; vv.dispatchEvent(new Event('resize'))
    vi.advanceTimersByTime(15)
    vv.offsetTop = 272; vv.dispatchEvent(new Event('scroll'))
    const untouched = () => [w.style.translate, w.dataset.kblift, w.dataset.kbcap, w.style.getPropertyValue('--kbcap'), bd.scrollTop]
    expect(untouched(), 'at the word of the pan').toEqual(['', undefined, undefined, '', 0])
    frames(); frames()
    expect(untouched(), 'two frames on').toEqual(['', undefined, undefined, '', 0])
    expect(b.getBoundingClientRect().bottom - vv.offsetTop, 'Remarks above the keys by the phone\'s pan alone').toBeLessThanOrEqual(390 - GAP)
    vv.offsetTop = 0; vv.height = H; vv.dispatchEvent(new Event('resize')); frames()
    expect(untouched(), 'the keys down: nothing to put back').toEqual(['', undefined, undefined, '', 0])
  })
  it('a raised window goes back down when the keys do', () => {
    document.body.innerHTML = '<div id="bd" style="position:fixed"><div id="w"><input id="b"></div></div>'
    const bd = document.getElementById('bd')!, w = document.getElementById('w')!, b = document.getElementById('b') as HTMLInputElement
    place(bd, 0, H); place(w, 300, 300); place(b, 560, 30)
    b.focus(); keysUp(); frames()
    expect(b.getBoundingClientRect().bottom).toBe(H - KB - GAP)
    vv.height = H; vv.dispatchEvent(new Event('resize'))
    expect(w.style.translate).toBe('')
  })
  it('a button focused does nothing; with no keyboard, nothing moves (a desktop)', () => {
    const { p, b } = fixture()
    ;(document.getElementById('x') as HTMLButtonElement).focus(); keysUp(); frames()
    expect(p.scrollTop).toBe(0)
    vv.height = H; b.focus(); vv.dispatchEvent(new Event('resize')); frames()
    expect(p.scrollTop).toBe(0)
  })

  /* Fable, 19 Oct 26: the board's height held from the tap; the lift measured once the phone's own pan has come to rest */
  const board = () => {
    document.body.innerHTML = '<div id="bd" data-kblayer><div id="p"><input id="b"><input id="c"></div></div>'
    const bd = document.getElementById('bd')!, p = document.getElementById('p')!
    const b = document.getElementById('b') as HTMLInputElement, c = document.getElementById('c') as HTMLInputElement
    place(bd, 0, H); panel(p, 0, H, 1000); place(b, 700, 30); place(c, 100, 30)
    return { bd, p, b, c }
  }
  it('the board keeps the height its layout had when a box in it took the focus — from one box to the next — until the keys go down (--kbfull)', () => {
    const { bd, b, c } = board()
    b.focus(); frames()
    expect(bd.dataset.kbfull, 'held from the tap, before any keys').toBe('')
    expect(bd.style.getPropertyValue('--kbfull')).toBe(`${H}px`)
    keysUp(); frames()
    c.focus(); frames()
    expect(bd.dataset.kbfull, 'kept from one box of the board to the next').toBe('')
    vv.height = H; vv.dispatchEvent(new Event('resize'))
    expect(bd.dataset.kbfull, 'the keys down: let go').toBeUndefined()
    expect(bd.style.getPropertyValue('--kbfull')).toBe('')
  })
  it('… and let go when the typing ends with the keys still up', () => {
    const { bd, b } = board()
    b.focus(); keysUp(); frames()
    expect(bd.dataset.kbfull).toBe('')
    b.blur(); frames()
    expect(bd.dataset.kbfull).toBeUndefined()
  })
  it("a window raised for the keys comes back down by what the phone's own pan then brought it; a pan long after the focus moves the window with it", () => {
    document.body.innerHTML = '<div id="bd" style="position:fixed"><div id="w"><input id="b"></div></div>'
    const bd = document.getElementById('bd')!, w = document.getElementById('w')!, b = document.getElementById('b') as HTMLInputElement
    place(bd, 0, H); place(w, 300, 300); place(b, 560, 30)
    b.focus(); keysUp(); frames()
    const raised = 590 - (H - KB - GAP)
    expect(w.style.translate).toBe(`0 -${raised}px`)
    /* the phone pans the visible screen 100 down the layout (the box is 100 higher on the screen than the layout says) */
    vv.offsetTop = 100; vv.dispatchEvent(new Event('scroll')); frames()
    expect(w.style.translate, 'down again by the pan: the box stays GAP above the keys, moved once in all').toBe(`0 -${raised - 100}px`)
    expect(b.getBoundingClientRect().bottom - vv.offsetTop).toBe(H - KB - GAP)
    /* a pan long after the focus: the window follows it, so its box stays GAP above the keys (his recording, 25 Oct 26
       07:40 — this line used to say "nothing", and the window left behind put the box under the keys or a band under it);
       nothing inside the window is scrolled, so a box he scrolled away from in it would stay where he put it */
    vi.advanceTimersByTime(3000)
    vv.offsetTop = 0; vv.dispatchEvent(new Event('scroll')); frames()
    expect(w.style.translate, 'a pan long after the focus: the window follows').toBe(`0 -${raised}px`)
    expect(b.getBoundingClientRect().bottom - vv.offsetTop).toBe(H - KB - GAP)
  })
})

/* Fable, 19 Oct 26 — his eighth report ("sometimes I press on a new text box the page jumps a little and I couldn't click
   that text box I wanted"): in the board the page is scrolled first — the scroll the phone itself makes for the keys, by
   its own scrolling view — and the board's list only where the page can go no further */
describe('the Scheduler Board: the page first, then its list', () => {
  const board = () => {
    document.body.innerHTML = '<div id="bd" data-kblayer><div id="p"><input id="b"></div></div>'
    const bd = document.getElementById('bd')!, p = document.getElementById('p')!, b = document.getElementById('b') as HTMLInputElement
    place(bd, 0, H); panel(p, 0, H, 1000); place(b, 700, 30)   // the box 700–730, the keys from 460
    return { bd, p, b }
  }
  const pageRoom = (room: number) => Object.defineProperty(document.documentElement, 'scrollTop', { configurable: true, get: () => pageST, set: v => { pageST = Math.max(0, Math.min(room, v)) } })
  afterEach(() => dropLifts())
  it('a page that can scroll far enough (an iPhone: on by the keys\' own height) takes the whole lift; the list is left alone', () => {
    const { p, b } = board()
    keepAboveKeyboard(b, vvUp)
    expect(pageST).toBe(730 - (H - KB - GAP))
    expect(p.scrollTop).toBe(0)
    expect(b.getBoundingClientRect().bottom).toBe(H - KB - GAP)
  })
  it('a page that cannot move (a desktop, Chromium — the held document scrolls nowhere): the list, as before', () => {
    pageRoom(0)
    const { p, b } = board()
    keepAboveKeyboard(b, vvUp)
    expect(pageST).toBe(0)
    expect(p.scrollTop).toBe(730 - (H - KB - GAP))
    expect(b.getBoundingClientRect().bottom).toBe(H - KB - GAP)
  })
  it('a page that can give only part of it: the rest from the list', () => {
    pageRoom(100)
    const { p, b } = board()
    keepAboveKeyboard(b, vvUp)
    expect([pageST, p.scrollTop]).toEqual([100, 730 - (H - KB - GAP) - 100])
    expect(b.getBoundingClientRect().bottom).toBe(H - KB - GAP)
  })
})
