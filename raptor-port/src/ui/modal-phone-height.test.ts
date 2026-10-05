import { readSchedulerCss } from '../testing/scheduler-css'
/* His find on the Insights preview, 3 Oct 26 (D536): on his iPhone the Insights window's title bar and ✕ sat under the
   browser's address bar and no scrolling reached them. A phone pop-up window is a bottom sheet (29 Aug 26), and its
   height limit was written in `vh` — on an iPhone that is the screen WITHOUT the browser's bars, so with the bars showing
   the sheet is taller than what is visible and its top is pushed off the top.
   The check's browser has no address bar that shrinks the screen (`vh` and `dvh` are equal there), so no real-browser
   test can go red on this: the stylesheet itself is pinned — the sheet's limit is measured against the visible screen
   (`%` of the fixed backdrop, then `dvh`), never left as `vh`. His look on his own phone is the proof. */
import { describe, expect, it } from 'vitest'

const css = readSchedulerCss()
/* every `max-height` value of the `.modal-box{…}` rule that starts at `from`, in the order written (the last valid wins) */
const limits = (from: number) => {
  const open = css.indexOf('.modal-box{', from), close = css.indexOf('}', open)
  expect(open, 'the rule exists').toBeGreaterThan(-1)
  return [...css.slice(open, close).matchAll(/max-height:([^;}]+)/g)].map(m => m[1]!.trim())
}

describe('a pop-up window never grows taller than the visible screen (D536)', () => {
  it('the phone bottom sheet is limited by the visible screen, not by the screen without the browser bars', () => {
    const phone = css.indexOf('.modal{align-items:flex-end;padding:0}')
    expect(phone, 'the phone bottom-sheet block').toBeGreaterThan(-1)
    const v = limits(phone)
    /* D537 (the same day): the limit is the visible screen less a thin 24px strip — it was 90%, a tenth of the screen of gap */
    expect(v[v.length - 1], 'the limit that wins is the dynamic height, less the thin strip').toBe('calc(100dvh - 24px - env(safe-area-inset-top))')
    expect(v, 'a browser without dvh falls back to the fixed backdrop, which tracks the visible screen').toContain('calc(100% - 24px)')
    expect(v.some(x => /\dvh$/.test(x) && !/dvh$/.test(x)), 'never plain vh').toBe(false)
  })
  it('the desktop / tablet card ends on the dynamic height too', () => {
    const v = limits(css.indexOf('.modal{position:fixed;inset:0'))
    expect(v[v.length - 1]).toBe('84dvh')
  })
  it('the backdrop the sheet is measured against is pinned to the screen edges', () => {
    expect(css).toContain('.modal{position:fixed;inset:0;')
  })
})
