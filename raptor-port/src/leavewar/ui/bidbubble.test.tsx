// @vitest-environment jsdom
/* THE BID BUBBLE (D1227, widened by D1272 to every width, D1274 to a moved bid, D1277 to a Manning button out of view).
   A bid that turns a Manning or Available row amber or red on a day where it was not opens the Manning rows and raises a
   short note under the Manning button naming each row — "This bid turns <row> red." — gone at his next tap or key.

   Until 23 Oct 26 nothing pinned it in a unit test (M2's walk carried it, walker 3's scenarios 58–61). This pins: a bid
   placed through the bid window raises it; a bid MOVED onto a day (the window's Move, then a tap on the day — the one way
   every move of the grid lands) raises it too (D1274, [LW-BUBBLE-MOVE] — red first: a move raised nothing); a move that
   makes nothing worse raises nothing; and the note goes at the next tap.

   The row that turns: a counter of everyone, red below the number of people free on the day the bid lands on — so one
   more bid there takes it under. Its id is the test's own. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ruleHave } from '../engine'
import { getState, initStore, lwHistInit, saveManningRule, setRole } from '../state/store'
import { setLwOnScreen } from '../state/screen'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

// Seed: ASICS has a pending half day of LL on 23 Jan (moveone.test.tsx's chip).
const PENDING = 'cell-asics-2026-01-23'
const TARGET = '2026-01-30'

beforeEach(() => {
  initStore(memoryBackend())
  lwHistInit()
  setRole('admin')
  setLwOnScreen(true)
})

/** A counter of everyone that is red the moment one more person is off on `day` — and amber at the same point, so the
 *  only level it can reach there is red. */
function rowRedPastOneMore(day: string, label = 'Test crew') {
  const s = getState()
  const count = { kind: 'people' as const, filter: {} }
  const have = ruleHave(count, s.people, s.grid, s.states, day)
  expect(have, 'the seed has people free that day').toBeGreaterThan(1)
  expect(saveManningRule({ id: 'test-bubble', label, count, threshold: { amber: have, red: have } })).toBe(true)
}

const bubble = () => screen.queryByTestId('manning-bubble')
const land = async (testid: string) => {
  await act(async () => { await new Promise(r => setTimeout(r, 420)) })   // past the double-click guard every move opens with
  fireEvent.click(screen.getByTestId(testid))
}

describe('the bid bubble (D1227, D1272)', () => {
  it('a bid placed through the bid window that turns a row red raises it, naming the row', () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    expect(bubble()).toBeNull()
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(bubble()?.textContent).toBe('This bid turns Test crew red.')
  })

  it('goes at the next tap, and at the next key', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(bubble()).toBeTruthy()
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    fireEvent.pointerDown(document.body)
    expect(bubble()).toBeNull()
  })
})

describe('a moved bid raises it too (D1274)', () => {
  it('the window\'s Move, then a tap on a day it turns red: the bubble, naming the row', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-shift'))
    expect(screen.getByTestId('move-banner')).toBeTruthy()
    expect(bubble(), 'picking the chip up changes nothing yet').toBeNull()
    await land(`cell-asics-${TARGET}`)
    expect(getState().grid.asics[TARGET]).toBe('*LL')                 // it landed
    expect(bubble()?.textContent).toBe('This bid turns Test crew red.')
  })

  it('a move that makes no row worse raises nothing', async () => {
    /* no test counter: the seed's own rows stay as they were on the day it lands (the test above names only its own
       row), and the day it leaves can only get better */
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-shift'))
    await land(`cell-asics-${TARGET}`)
    expect(getState().grid.asics[TARGET]).toBe('*LL')
    expect(bubble()?.textContent ?? null).toBeNull()
  })

  it('a move that is refused raises nothing', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-shift'))
    await land('cell-asics-2026-01-23')                               // its own day: "already on that day", no move
    expect(getState().grid.asics['2026-01-23']).toBe('*LL')
    expect(bubble()).toBeNull()
  })
})

/* D1277 (23 Oct 26 — "Yes to the bid note as recommended"): with the Manning button out of view — scrolled off the top, or
   under the screen's foot — the same words sit at the foot of the screen with "Show ›", which takes him up to the Manning
   rows, opened; gone at his next tap or key, as the bubble is. With the button in view nothing changes (the tests above:
   jsdom draws no layout, so the button there counts as in view). [LW-BUBBLE-OFFSCREEN], red first. */
describe('with the Manning button out of view, the note sits at the foot of the screen (D1277)', () => {
  const offTop = () => {
    const btn = screen.getByTestId('counts-toggle')
    btn.getBoundingClientRect = () => ({ top: -300, bottom: -273, left: 26, right: 106, width: 80, height: 27, x: 26, y: -300, toJSON: () => ({}) }) as DOMRect
    return btn
  }
  const placeBid = () => {
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-LL'))
  }
  const foot = () => screen.queryByTestId('manning-bubble-foot')

  it('the words at the foot with "Show ›", and no bubble under the button', () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    offTop()
    placeBid()
    expect(bubble()).toBeNull()
    expect(foot()?.getAttribute('role')).toBe('status')
    expect(screen.getByTestId('manning-bubble-text').textContent).toBe('This bid turns Test crew red.')
    expect(screen.getByTestId('manning-bubble-show').textContent).toBe('Show ›')
  })

  it('Show takes him up to the Manning button — the rows opened — moves the keyboard there, and the note goes', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    const btn = offTop()
    const seen: Element[] = []
    const was = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function (this: Element) { seen.push(this) }
    try {
      placeBid()
      expect(btn.getAttribute('aria-expanded')).toBe('true')               // the rows opened by the bid, as the bubble does
      await act(async () => { await new Promise(r => setTimeout(r, 0)) })
      const show = screen.getByTestId('manning-bubble-show')
      fireEvent.pointerDown(show)                                           // a press on Show is not "a tap elsewhere"
      expect(foot()).toBeTruthy()
      fireEvent.click(show)
      expect(seen).toContain(btn)
      expect(document.activeElement).toBe(btn)
      expect(foot()).toBeNull()
    } finally { Element.prototype.scrollIntoView = was }
  })

  it('a tap elsewhere or a key ends it — but Tab, on the way to Show, does not', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    offTop()
    placeBid()
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    fireEvent.keyDown(document.body, { key: 'Tab' })
    expect(foot()).toBeTruthy()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(foot()).toBeNull()
  })

  it('a moved bid with the button out of view: the note at the foot too', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    offTop()
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-shift'))
    await land(`cell-asics-${TARGET}`)
    expect(screen.getByTestId('manning-bubble-text').textContent).toBe('This bid turns Test crew red.')
    expect(bubble()).toBeNull()
  })
})
