/* IS A ROW ALREADY ON SCREEN? — what decides whether an Undo or a Redo moves the page (owner, D672, 8 Oct 26: "if
   it's already in view, undo/redo don't need to snap to view. Unless it's outside the screen view then it's ok to snap
   into view" — his D670 for the Leave War, asked for across the app).

   Two landings moved the page every time: Quals put the man's row in the middle of the screen, and the Inputs list
   moved the changed input to the top of the list. Both now ask this first. A row is "on screen" when it is laid out
   (a hidden page has no boxes) and WHOLLY between the bottom of whatever is fixed over the page's top — the app's top
   bar, a table's stuck heading — and the bottom of the window.

   Pure, on plain boxes; the pages hand it the real ones, and the browser gate proves the pages stay put. */
import { describe, expect, it } from 'vitest'
import { boxOnScreen } from './onscreen'

const row = (top: number, height = 40) => ({ top, bottom: top + height, height })
/* a window 800 tall with a top bar 60 tall */
const TOP = 60, BOTTOM = 800

describe('boxOnScreen', () => {
  it('a row in the middle of the window is on screen', () => { expect(boxOnScreen(row(400), TOP, BOTTOM)).toBe(true) })
  it('the first row under the top bar and the last one that fits are on screen', () => {
    expect(boxOnScreen(row(60), TOP, BOTTOM)).toBe(true)
    expect(boxOnScreen(row(760), TOP, BOTTOM)).toBe(true)
  })
  it('a row partly under the top bar is not; nor one above the window', () => {
    expect(boxOnScreen(row(40), TOP, BOTTOM)).toBe(false)
    expect(boxOnScreen(row(-300), TOP, BOTTOM)).toBe(false)
  })
  it('a row cut off at the foot of the window is not; nor one below it', () => {
    expect(boxOnScreen(row(780), TOP, BOTTOM)).toBe(false)
    expect(boxOnScreen(row(2000), TOP, BOTTOM)).toBe(false)
  })
  it('half a pixel is forgiven', () => {
    expect(boxOnScreen(row(59.6), TOP, BOTTOM)).toBe(true)
    expect(boxOnScreen(row(760.4), TOP, BOTTOM)).toBe(true)
  })
  it('a row with no height — nothing is laid out — is not on screen', () => {
    expect(boxOnScreen({ top: 0, bottom: 0, height: 0 }, 0, 0)).toBe(false)
  })
  it('no row at all is not on screen', () => { expect(boxOnScreen(null, TOP, BOTTOM)).toBe(false) })
})
