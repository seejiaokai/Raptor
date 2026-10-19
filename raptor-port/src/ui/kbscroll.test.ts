// @vitest-environment jsdom
/* [KEYBOARD-SCROLL] (D1048): the box being typed in is scrolled to sit just above a phone's keyboard. jsdom has no
   layout, so every box is given a stand-in place: an element's top is its place on the page less every scroll above
   it; the visual viewport is a stand-in object, as the walk's is. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { keepAboveKeyboard, keyboardUp, isTypingBox, installKbScroll, dropLifts, GAP } from './kbscroll'

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
    const wh = () => (w.style.maxHeight ? parseInt(w.style.maxHeight) : 600)
    Object.defineProperty(w, 'scrollTop', { configurable: true, get: () => st, set: v => { st = Math.max(0, Math.min(600 - wh(), v)) } })
    Object.defineProperty(w, 'scrollHeight', { configurable: true, get: () => 600 })
    Object.defineProperty(w, 'clientHeight', { configurable: true, get: () => wh() })
    w.getBoundingClientRect = () => { const top = 300 - +(w.dataset.kblift || 0); return { top, bottom: top + wh(), left: 0, right: 100, width: 100, height: wh(), x: 0, y: top, toJSON() {} } as DOMRect }
    place(b, 860, 30)                   // its last row, which rising to the top alone cannot bring above the keys
    keepAboveKeyboard(b, vvUp)
    expect(w.style.maxHeight).toBe(`${H - KB - 2 * GAP}px`)
    expect(w.getBoundingClientRect().top).toBe(GAP)
    expect(b.getBoundingClientRect().bottom).toBeLessThanOrEqual(H - KB - GAP)
    expect(b.getBoundingClientRect().top).toBeGreaterThanOrEqual(GAP)
    dropLifts()
    expect([w.style.maxHeight, w.style.translate], 'all put back').toEqual(['', ''])
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
})
