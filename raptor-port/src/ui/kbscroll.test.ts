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
  it('a window taller than the room is held to the visible screen, its top at the top, and its own body scrolls the box into sight (the fresh read\'s F1)', () => {
    document.body.innerHTML = '<div id="bd" style="position:fixed"><div id="w"><input id="b"></div></div>'
    const bd = document.getElementById('bd')!, w = document.getElementById('w')!, b = document.getElementById('b') as HTMLInputElement
    place(bd, 0, H)
    /* the window: 300–900 tall as its content, and once held to a height, that tall, scrolling the rest */
    let st = 0
    w.style.overflowY = 'auto'
    /* the hold is --kbcap, read by the stylesheet's [data-kbcap] rule (jsdom has no stylesheet: read it here) */
    const wh = () => (w.dataset.kbcap != null ? parseInt(w.style.getPropertyValue('--kbcap')) : 600)
    Object.defineProperty(w, 'scrollTop', { configurable: true, get: () => st, set: v => { st = Math.max(0, Math.min(600 - wh(), v)) } })
    Object.defineProperty(w, 'scrollHeight', { configurable: true, get: () => 600 })
    Object.defineProperty(w, 'clientHeight', { configurable: true, get: () => wh() })
    w.getBoundingClientRect = () => { const top = 300 - +(w.dataset.kblift || 0); return { top, bottom: top + wh(), left: 0, right: 100, width: 100, height: wh(), x: 0, y: top, toJSON() {} } as DOMRect }
    place(b, 860, 30)                   // its last row, which rising to the top alone cannot bring above the keys
    keepAboveKeyboard(b, vvUp)
    expect(w.style.getPropertyValue('--kbcap')).toBe(`${H - KB - 2 * GAP}px`)
    expect(w.style.maxHeight, 'the own height limit of the window untouched').toBe('')
    expect(w.getBoundingClientRect().top).toBe(GAP)
    expect(b.getBoundingClientRect().bottom).toBeLessThanOrEqual(H - KB - GAP)
    expect(b.getBoundingClientRect().top).toBeGreaterThanOrEqual(GAP)
    /* the window redraws and writes its own limit (floatwin.ts place()): the hold is a property of its own, untouched */
    w.style.maxHeight = ''
    expect(w.dataset.kbcap).toBe('')
    /* a box higher in the held window (the narrow read's 2): still held, still pinned at the top */
    const t = document.createElement('input'); w.appendChild(t); place(t, 320, 30)
    keepAboveKeyboard(t, vvUp)
    expect([w.dataset.kbcap, w.getBoundingClientRect().top]).toEqual(['', GAP])
    dropLifts()
    expect([w.style.getPropertyValue('--kbcap'), w.dataset.kbcap, w.style.translate], 'all put back').toEqual(['', undefined, ''])
  })
  it('a window already at the top is held all the same (the narrow read: 3)', () => {
    document.body.innerHTML = '<div id="w" style="position:fixed"><input id="b"></div>'
    const w = document.getElementById('w')!, b = document.getElementById('b') as HTMLInputElement
    let st = 0
    w.style.overflowY = 'auto'
    const wh = () => (w.dataset.kbcap != null ? parseInt(w.style.getPropertyValue('--kbcap')) : 700)
    Object.defineProperty(w, 'scrollTop', { configurable: true, get: () => st, set: v => { st = Math.max(0, Math.min(700 - wh(), v)) } })
    Object.defineProperty(w, 'scrollHeight', { configurable: true, get: () => 700 })
    Object.defineProperty(w, 'clientHeight', { configurable: true, get: () => wh() })
    w.getBoundingClientRect = () => ({ top: GAP, bottom: GAP + wh(), left: 0, right: 100, width: 100, height: wh(), x: 0, y: GAP, toJSON() {} }) as DOMRect
    place(b, 650, 30)
    keepAboveKeyboard(b, vvUp)
    expect(w.dataset.kbcap).toBe('')
    expect(b.getBoundingClientRect().bottom).toBeLessThanOrEqual(H - KB - GAP)
  })
  it('a window that sets its own height limit is left to it', () => {
    const { w, b } = win()
    w.style.maxHeight = '200px'
    place(b, 590, 400)
    keepAboveKeyboard(b, vvUp)
    expect(w.style.maxHeight).toBe('200px')
    dropLifts()
    expect(w.style.maxHeight).toBe('200px')
  })
  it('put back when the typing ends', () => {
    const { w, b } = win()
    keepAboveKeyboard(b, vvUp)
    dropLifts()
    expect(w.style.translate).toBe('')
    expect(b.getBoundingClientRect().bottom).toBe(590)
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
  /* HIS RECORDING, 25 Oct 26 07:40 (the input window, "Other", Remarks tapped on his iPhone): the window was held to the room
     the keys left, then — later than the focus window — the iPhone's password bar rose and the phone panned the visible screen
     some 170 points down; the held window stayed where it had been pinned, its top above the screen, an empty band under it.
     A window held or raised for the keys follows the visible screen for as long as the keys are up and its box has the focus. */
  const heldWin = () => {
    document.body.innerHTML = '<div id="bd" style="position:fixed"><div id="w"><input id="b"></div></div>'
    const bd = document.getElementById('bd')!, w = document.getElementById('w')!, b = document.getElementById('b') as HTMLInputElement
    place(bd, 0, H)
    let st = 0
    w.style.overflowY = 'auto'
    const wh = () => (w.dataset.kbcap != null ? parseInt(w.style.getPropertyValue('--kbcap')) : 600)
    Object.defineProperty(w, 'scrollTop', { configurable: true, get: () => st, set: v => { st = Math.max(0, Math.min(600 - wh(), v)) } })
    Object.defineProperty(w, 'scrollHeight', { configurable: true, get: () => 600 })
    Object.defineProperty(w, 'clientHeight', { configurable: true, get: () => wh() })
    w.getBoundingClientRect = () => { const top = 300 - +(w.dataset.kblift || 0); return { top, bottom: top + wh(), left: 0, right: 100, width: 100, height: wh(), x: 0, y: top, toJSON() {} } as DOMRect }
    place(b, 860, 30)
    return { w, b }
  }
  it('a held window follows a late pan of the visible screen: its top at the screen\'s top again, no band under it', () => {
    const { w, b } = heldWin()
    b.focus(); keysUp(); frames()
    expect([w.dataset.kbcap, w.getBoundingClientRect().top], 'the fixture: held, pinned at the top').toEqual(['', GAP])
    vi.advanceTimersByTime(3000)                               // long after the focus
    vv.offsetTop = 170; vv.dispatchEvent(new Event('scroll')); frames()
    expect(w.getBoundingClientRect().top, 'pinned to the visible screen as it now stands').toBe(170 + GAP)
    expect(b.getBoundingClientRect().bottom, 'the box still in sight').toBeLessThanOrEqual(170 + H - KB - GAP)
  })
  it('and a late shrink of the room (the password bar over the keys) holds it to the smaller room, its box kept in sight', () => {
    const { w, b } = heldWin()
    b.focus(); keysUp(); frames()
    vi.advanceTimersByTime(3000)
    vv.height = H - KB - 80; vv.dispatchEvent(new Event('resize')); frames()
    expect(w.style.getPropertyValue('--kbcap')).toBe(`${H - KB - 80 - 2 * GAP}px`)
    expect(b.getBoundingClientRect().bottom).toBeLessThanOrEqual(H - KB - 80 - GAP)
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
