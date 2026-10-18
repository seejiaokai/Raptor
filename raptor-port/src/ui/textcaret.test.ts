// @vitest-environment jsdom
/* THE BOX A PRESS IS TAKING THE CARET TO ([EDIT-SECOND-CLICK], ui/textedit.ts textCaret) — and that it never sticks.
   The fresh read of the batch (19 Oct 26, F1): the mark was set on a press of a text box and cleared only when the focus
   arrived or a press ENDED — a finger that landed on a box and then scrolled ends in pointercancel, not pointerup, and a
   focus that went nowhere kept the mark; while it stood, the week and the board held their redraw back for it. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { textCaret, editingText, routeFocusOut } from './textedit'
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
  it('a finger that lands on a box and then scrolls (pointercancel) lets it go at once, and the page repaints', () => {
    const n = vi.spyOn(store, 'notify')
    press(box, 'pointerdown')
    press(box, 'pointercancel')
    expect(textCaret(), 'no caret').toBeNull()
    expect(editingText()).toBe(false)
    expect(n, 'the held redraw is let go').toHaveBeenCalled()
  })
  it('a focus that goes nowhere, with no press down, keeps no mark', () => {
    press(box, 'pointerdown'); press(box, 'pointerup', 'mouse')
    routeFocusOut(Object.assign(new FocusEvent('focusout'), {}) as FocusEvent)
    expect(textCaret()).toBeNull()
  })
})
