/* IS A ROW ALREADY ON SCREEN? — what decides whether an Undo or a Redo moves the page (owner, D672, 8 Oct 26: "if
   it's already in view, undo/redo don't need to snap to view. Unless it's outside the screen view then it's ok to snap
   into view" — his D670 for the Leave War, asked for across the app).

   Two landings moved the page every time: Quals put the man's row in the middle of the screen, and the Inputs list
   moved the changed input to the top of the list. Both now ask this first. A row is "on screen" when it is laid out
   (a hidden page has no boxes) and WHOLLY between the bottom of whatever is fixed over the page's top — the app's top
   bar, a table's stuck heading — and the bottom of the window.

   Pure, on plain boxes; the pages hand it the real ones, and the browser gate proves the pages stay put. */
import { describe, expect, it } from 'vitest'
import { boxOnScreen, scrollToShow } from './onscreen'

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

/* HOW FAR THE PAGE MOVES TO BRING A ROW ON SCREEN — the other half of D672 ("unless it's outside the screen view then
   it's ok to snap into view"). The browser's own "bring it to the nearest edge" puts a row that was ABOVE the screen at
   the window's very top, which is UNDER the app's top bar: found by the browser check of the Inputs list (8 Oct 26) —
   Undo lifted the input to the head of the list, the page came to it, and the row sat hidden behind the bar. So the
   distance is worked out here, against the same two edges "on screen" is judged by, with a little air (8px). */
describe('scrollToShow', () => {
  it('a row already on screen moves nothing', () => {
    expect(scrollToShow(row(400), TOP, BOTTOM)).toBe(0)
    expect(scrollToShow(row(60), TOP, BOTTOM)).toBe(0)
    expect(scrollToShow(row(760), TOP, BOTTOM)).toBe(0)
  })
  it('a row above the window is brought down to just under the top bar — never to the window’s own top, behind the bar', () => {
    const dy = scrollToShow(row(-300), TOP, BOTTOM)
    expect(dy).toBe(-368)
    expect(-300 - dy, 'where its top lands').toBe(TOP + 8)
  })
  it('a row partly under the top bar comes clear of it', () => {
    const dy = scrollToShow(row(40), TOP, BOTTOM)
    expect(dy).toBe(-28)
    expect(boxOnScreen(row(40 - dy), TOP, BOTTOM)).toBe(true)
  })
  it('a row below the window, or cut off at its foot, comes up by just enough', () => {
    expect(scrollToShow(row(2000), TOP, BOTTOM)).toBe(1248)
    expect(scrollToShow(row(780), TOP, BOTTOM)).toBe(28)
    expect(boxOnScreen(row(780 - 28), TOP, BOTTOM)).toBe(true)
  })
  it('a row taller than the room under the bar shows its HEAD: its top is never pushed behind the bar', () => {
    const tall = { top: 500, bottom: 1400, height: 900 }
    expect(scrollToShow(tall, TOP, BOTTOM)).toBe(432)
    expect(500 - 432).toBe(TOP + 8)
  })
  it('a row with no height — nothing is laid out — moves nothing', () => {
    expect(scrollToShow({ top: 0, bottom: 0, height: 0 }, TOP, BOTTOM)).toBe(0)
  })
})
