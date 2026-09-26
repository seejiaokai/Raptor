// @vitest-environment jsdom
/* THE INPUTS CALENDAR BY FINGER (the absence-record re-test, 26 Sep 26 — found by the calendar walker W1 on a phone,
   reproduced by the host with the walker's own probe).

   W1-F1 — the month SWIPE (owner, 22 Aug 26: "allow me to swipe left and right… to see different months") never paged
   on a phone: the grid set no touch rule, so the browser took a sideways finger as its own pan and cancelled the
   pointer after one move — the calendar never saw the release its swipe is decided on. A mouse paged at once.

   W1-F2 — a TAP on a chip opens that input's edit on the finger's lift; the phone then delivers the same tap's click,
   which landed on the dim backdrop of the window it had just opened and closed it (10 of 33 July chips in the walk's
   survey: a flicker and nothing). The drag already ate its own release click; the tap did not.

   Its own file: a gesture test elsewhere can leave a one-shot click eater armed under fake timers. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initCalDrag } from './caldrag'

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'scheduler.css'), 'utf8')

describe('the month swipe reaches the calendar on a phone (W1-F1)', () => {
  it('the calendar grid hands a sideways finger to its own swipe, and keeps the vertical scroll', () => {
    const rules = css.match(/\.ic-grid\{[^}]*\}/g) || []
    expect(rules.some(r => /touch-action:\s*pan-y/.test(r))).toBe(true)
  })
})

describe('a finger’s tap on a chip opens its edit once (W1-F2)', () => {
  let root: HTMLElement, chip: HTMLElement, off: () => void, taps = 0
  const ptr = (type: string, kind: string) => new PointerEvent(type,
    { bubbles: true, cancelable: true, clientX: 10, clientY: 10, pointerId: 1, pointerType: kind, isPrimary: true })
  const nextClickHeard = () => {
    const heard = vi.fn()
    document.body.addEventListener('click', heard)
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    document.body.removeEventListener('click', heard)
    return heard.mock.calls.length > 0
  }
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = `<div id="root"><div class="ic-day" data-icday="2026-07-20"><div class="ic-chip" data-icdrag data-iid="t1">chip</div></div></div>`
    root = document.getElementById('root')!
    chip = root.querySelector('[data-icdrag]') as HTMLElement
    taps = 0
    off = initCalDrag(root, { onTap: () => { taps++ } })
  })
  afterEach(() => { off(); vi.runOnlyPendingTimers(); vi.useRealTimers(); document.body.innerHTML = '' })

  it('the tap’s own click, arriving after the lift, does not reach the window the tap opened', () => {
    chip.dispatchEvent(ptr('pointerdown', 'touch'))
    chip.dispatchEvent(ptr('pointerup', 'touch'))
    expect(taps).toBe(1)
    vi.advanceTimersByTime(20)
    expect(nextClickHeard()).toBe(false)
  })

  it('a mouse click on a chip leaves the next real click alone', () => {
    chip.dispatchEvent(ptr('pointerdown', 'mouse'))
    chip.dispatchEvent(ptr('pointerup', 'mouse'))
    expect(taps).toBe(1)
    vi.advanceTimersByTime(20)
    expect(nextClickHeard()).toBe(true)
  })
})
