// @vitest-environment jsdom
/* KF1–KF4 — one tap then typing replaces, in four more places (owner D1080, 19 Oct 26 — "1 Template times, 2 Leave War
   numbers, 3 SANS and cut-off, 4 Logic settings"): the templates' time boxes, the Leave War's typed numbers, the SANS
   settings' and late cut-off's numbers, the Logic page's settings take a fresh value from the first change after a PRESS,
   through the schedule's own armFreshTime (D1047). The same boxes' markup is used here — each screen's class names — and
   a React box is driven through React itself, since React keeps its own note of a box's value. The real browser is
   e2e/kbscroll.spec.ts KS5. */
import { afterEach, describe, expect, it } from 'vitest'
import { useState } from 'react'
import { cleanup, render } from '@testing-library/react'
import './interactions'

const press = (el: HTMLElement) => { el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.focus() }
const type = (el: HTMLInputElement, v: string, kind = 'insertText') => {
  el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: kind }))
  /* as the browser types: past React's own note of the value */
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v)
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: kind }))
}
const mk = (html: string) => { document.body.innerHTML = html; return document.querySelector('input') as HTMLInputElement }
afterEach(() => { cleanup(); document.body.innerHTML = '' })

describe('KF1 — the four places are armed by a press', () => {
  const places: [string, string][] = [
    ['a duty template\'s time', '<div id="tplModal"><input class="tm" value="07:00"></div>'],
    ['a wave template\'s T/O', '<div id="waveTplModal"><input class="tm" value="09:00"></div>'],
    ['a counter\'s amber number', '<input class="mth-in" type="number" value="0">'],
    ['an OIL figure', '<input class="oil-num" value="1">'],
    ['a SANS colour number', '<input class="sset-num" value="3">'],
    ['the late cut-off\'s days', '<input class="sset-num" value="14">'],
    ['a Logic setting', '<input class="lgin" value="12h">'],
  ]
  for (const [what, html] of places) it(what, () => {
    const i = mk(html); press(i)
    expect(i.dataset.fresh, 'armed').toBe('1')
    const was = i.value
    type(i, was + '5'); expect(i.value, 'only what was typed').toBe('5')
  })
})

describe('KF2 — what is left alone', () => {
  it('the Logic page\'s words setting is edited, never retyped', () => {
    const i = mk('<input class="lgin lgin-text" value="in time + WX/NOTAMS">'); press(i)
    expect(i.dataset.fresh || '').toBe('')
  })
  it('a box focused with no press (Tab, a window opening on it) is not armed', () => {
    const i = mk('<input class="sset-num" value="3">'); i.focus()
    expect(i.dataset.fresh || '').toBe('')
  })
  it('a press on one box, the focus landing on another, arms neither', () => {
    document.body.innerHTML = '<input class="sset-num" id="a" value="1"><input class="sset-num" id="b" value="3">'
    const a = document.getElementById('a') as HTMLInputElement, b = document.getElementById('b') as HTMLInputElement
    a.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); b.focus()
    expect(b.dataset.fresh || '').toBe('')
  })
  it('an empty box, a read-only one and a disabled one are left as they are', () => {
    for (const html of ['<input class="sset-num" value="">', '<input class="sset-num" value="3" readonly>', '<input class="sset-num" value="3" disabled>']) {
      const i = mk(html); press(i); expect(i.dataset.fresh || '', html).toBe('')
    }
  })
  it('a template time box outside its window (any other .tm) is not this rule\'s', () => {
    const i = mk('<div><input class="tm" value="07:00"></div>'); press(i)
    expect(i.dataset.fresh || '').toBe('')
  })
})

describe('KF5 — the fresh read\'s F2, F3', () => {
  it('a press on a box\'s label (a SANS colour row) is a press on its box', () => {
    document.body.innerHTML = '<label class="sset-row"><span id="w">Yellow from</span><input class="sset-num" value="1"></label>'
    const i = document.querySelector('input') as HTMLInputElement
    document.getElementById('w')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); i.focus()
    expect(i.dataset.fresh).toBe('1')
    type(i, '12'); expect(i.value).toBe('2')
  })
  it('a box its screen opens with the focus in it (the balance "Set") is armed as it opens; one with nothing in it is not', () => {
    let i = mk('<input class="oil-num" data-freshfocus="" value="4.5">'); i.focus()
    expect(i.dataset.fresh).toBe('1')
    i = mk('<input class="oil-num" data-freshfocus="" value="">'); i.focus()
    expect(i.dataset.fresh || '').toBe('')
  })
  it('…once per opening: coming back to it later (another app and back, a Tab) arms nothing (the narrow read: 4)', () => {
    const i = mk('<input class="oil-num" data-freshfocus="" value="4.5">'); i.focus()
    i.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); i.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(i.dataset.fresh || '', 'a second press: ordinary').toBe('')
    i.blur(); i.focus()
    expect(i.dataset.fresh || '').toBe('')
  })
  it('a second press on the LABEL of an armed box leaves it armed — it put no caret anywhere (the narrow read: 5)', () => {
    document.body.innerHTML = '<label class="sset-row"><span id="w">Yellow from</span><input class="sset-num" value="1"></label>'
    const i = document.querySelector('input') as HTMLInputElement, w = document.getElementById('w')!
    w.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); i.focus()
    w.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); w.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(i.dataset.fresh).toBe('1')
    type(i, '15'); expect(i.value).toBe('5')
  })
})

describe('KF3 — a second press, an arrow key, Backspace', () => {
  it('a second press on the waiting box gives back ordinary editing', () => {
    const i = mk('<input class="lgin" value="12h">'); press(i)
    /* a second press is decided at its end (the D1047 narrow read's M3): a scroll started on the box keeps it armed */
    i.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    i.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    expect(i.dataset.fresh || '').toBe('')
    type(i, '12h5'); expect(i.value).toBe('12h5')
  })
  it('Backspace clears the whole number', () => {
    const i = mk('<input class="sset-num" value="14">'); press(i)
    type(i, '1', 'deleteContentBackward'); expect(i.value).toBe('')
  })
})

describe('KF4 — a React box keeps what replaced its value (React notes a box\'s value itself)', () => {
  it('the state holds the fresh number, not the old one with the digit added', () => {
    let seen = ''
    function Box() {
      const [v, setV] = useState('14')
      seen = v
      return <input className="sset-num" value={v} onChange={e => setV(e.target.value)} />
    }
    render(<Box />)
    const i = document.querySelector('input') as HTMLInputElement
    press(i); type(i, '147')
    expect(i.value).toBe('7')
    expect(seen, 'React\'s own value').toBe('7')
  })
})
