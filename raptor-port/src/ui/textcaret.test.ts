// @vitest-environment jsdom
/* THE BOX A PRESS IS TAKING THE CARET TO ([EDIT-SECOND-CLICK], ui/textedit.ts textCaret) — and that it never sticks.
   The fresh read of the batch (19 Oct 26, F1): the mark was set on a press of a text box and cleared only when the focus
   arrived or a press ENDED — a finger that landed on a box and then scrolled ends in pointercancel, not pointerup, and a
   focus that went nowhere kept the mark; while it stood, the week and the board held their redraw back for it. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { textCaret, editingText, routeFocusOut, CARET_GONE } from './textedit'
import { setSession } from '../state/auth'
import * as store from '../state/store'

const press = (el: Element, type: string, pointerType = 'touch') => el.dispatchEvent(Object.assign(new Event(type, { bubbles: true }), { pointerType }))
let box: HTMLElement
beforeEach(() => {
  setSession({ user: 'a', role: 'admin' } as any)
  box = document.createElement('span'); box.dataset.txt = 'ff:0.0.0.msn'; box.setAttribute('contenteditable', 'true')
  document.body.append(box)
  ;(document.activeElement as HTMLElement | null)?.blur?.()
})
afterEach(() => { box.remove(); vi.restoreAllMocks(); press(document.body, 'pointercancel') })

describe('the pressed box counts as the caret only while the press is on its way', () => {
  it('a press on a box makes it the caret while the page itself has the focus', () => {
    press(box, 'pointerdown')
    expect(textCaret()).toBe(box)
    expect(editingText()).toBe(true)
  })
  /* …and it says so to the two surfaces that may hold a redraw for it, never by the whole app's notify (the narrow read
     of the fix round, 19 Oct 26 — N1): most of a phone's scrolls start on a text box, and a notify there rebuilt all seven
     days at the start of every fling for nothing (docs/performance.md — a gesture that only moves the view never notifies) */
  it('a finger that lands on a box and then scrolls (pointercancel) lets it go at once, says so, and repaints nothing itself', () => {
    const n = vi.spyOn(store, 'notify')
    let gone = 0; const said = () => { gone++ }
    document.addEventListener(CARET_GONE, said)
    press(box, 'pointerdown')
    press(box, 'pointercancel')
    document.removeEventListener(CARET_GONE, said)
    expect(textCaret(), 'no caret').toBeNull()
    expect(editingText()).toBe(false)
    expect(gone, 'the surfaces holding a redraw are told').toBe(1)
    expect(n, 'no whole-app repaint for a scroll').not.toHaveBeenCalled()
  })
  it('a focus that goes nowhere, with no press down, keeps no mark', () => {
    press(box, 'pointerdown'); press(box, 'pointerup', 'mouse')
    routeFocusOut(Object.assign(new FocusEvent('focusout'), {}) as FocusEvent)
    expect(textCaret()).toBeNull()
  })
})
