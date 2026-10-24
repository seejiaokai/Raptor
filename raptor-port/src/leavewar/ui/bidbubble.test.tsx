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
import { actCount, filedSince, getState, initStore, lwHistInit, lwUndo, placeUna, recordsAt, saveManningRule, setCell, setRequestWords, setRole } from '../state/store'
import { setLwOnScreen } from '../state/screen'
import { memoryBackend } from '../state/storage'
import { bubbleWords, Matrix, worsenedRows, type BubbleFlags } from './Matrix'

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
    /* a pending bid, as a member places it: the admin's "Approve what I enter" (D1186, ticked each time it opens) is
       unticked, so the Leave War's own Undo below can take the bid back (an approved leave lives on the Inputs page) */
    fireEvent.click(screen.getByTestId('bid-approve-tick'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(bubble()).toBeTruthy()
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    fireEvent.pointerDown(document.body)
    expect(bubble()).toBeNull()
    /* …and at the next key (the read's note: this test pressed only): the bid undone, placed again, a key */
    act(() => { lwUndo() })
    expect(getState().grid.dusk?.[TARGET]).toBeFalsy()
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    /* left off, it stays off in the next window (his D1302 — it was ticked again on each opening, D1186) */
    expect(screen.getByTestId('bid-approve-tick').getAttribute('aria-checked'), 'remembered off (D1302)').toBe('false')
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(bubble()).toBeTruthy()
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    fireEvent.keyDown(document.body, { key: 'a' })
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

/* HIS REPORT (25 Oct 26 — "this bid turns available P red. the box is in amber can u make it red. and why any other
   subsequent inputs that put that further red does not show that bubble? And why when i scroll down and cant see the
   manning bar theres no red bubble that show up at the bottom of my screen?"). D1344: the bubble wears the colour of the
   worst level it names — red when it says red, amber when amber. D1345: every bid or filing that takes a row LOWER on a
   day where it then stands amber or red raises it, not only the one that first turned it; a row already red that goes
   further down raises it again — under the button, and at the foot of the screen when the button is out of view. D1351:
   after a filing it names what was filed ("This UNA …", "This overseas duty …", "This course …"); a bid keeps "This bid".
   Red first: the bubble was amber whatever it said, and a second bid on a red day raised nothing anywhere. */
describe('his report: red when red, and every lowering raises it (D1344, D1345, D1351)', () => {
  const foot = () => screen.queryByTestId('manning-bubble-foot')
  const offTop = () => {
    const btn = screen.getByTestId('counts-toggle')
    btn.getBoundingClientRect = () => ({ top: -300, bottom: -273, left: 26, right: 106, width: 80, height: 27, x: 26, y: -300, toJSON: () => ({}) }) as DOMRect
  }
  const bidOn = (who: string) => {
    fireEvent.click(screen.getByTestId(`cell-${who}-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-LL'))
  }
  const tapAway = async () => {
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    fireEvent.pointerDown(document.body)
  }
  /** a counter of everyone, amber the moment one more is off and red only far below (so it can stand amber) */
  function rowAmberPastOneMore(day: string, label = 'Test crew') {
    const s = getState()
    const count = { kind: 'people' as const, filter: {} }
    const have = ruleHave(count, s.people, s.grid, s.states, day)
    expect(have).toBeGreaterThan(3)
    expect(saveManningRule({ id: 'test-bubble', label, count, threshold: { amber: have, red: 1 } })).toBe(true)
  }

  it('a bubble that says red is drawn red (D1344)', () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    bidOn('dusk')
    expect(bubble()?.textContent).toBe('This bid turns Test crew red.')
    expect(bubble()?.getAttribute('data-level'), 'red, as it says').toBe('red')
    expect(bubble()?.className).toContain('mnb-red')
  })
  it('…and one that says amber is drawn amber (D1344)', () => {
    rowAmberPastOneMore(TARGET)
    render(<Matrix />)
    bidOn('dusk')
    expect(bubble()?.textContent).toBe('This bid turns Test crew amber.')
    expect(bubble()?.getAttribute('data-level')).toBe('amber')
    expect(bubble()?.className).toContain('mnb-amber')
  })

  it('a second bid on a day already red raises it again, saying so (D1345)', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    bidOn('dusk')
    expect(bubble()?.textContent).toBe('This bid turns Test crew red.')
    await tapAway()
    expect(bubble()).toBeNull()
    bidOn('asics')
    expect(getState().grid.asics?.[TARGET], 'the second bid was placed').toBeTruthy()
    expect(bubble()?.textContent).toBe('This bid takes Test crew lower, still red.')
    expect(bubble()?.getAttribute('data-level')).toBe('red')
  })

  it('a row already amber that goes lower and stays amber raises it too (D1345)', async () => {
    rowAmberPastOneMore(TARGET)
    render(<Matrix />)
    bidOn('dusk')
    await tapAway()
    bidOn('asics')
    expect(bubble()?.textContent).toBe('This bid takes Test crew lower, still amber.')
    expect(bubble()?.getAttribute('data-level')).toBe('amber')
  })

  it('with the Manning button out of view, the second bid\'s note sits at the foot, in red (D1345, D1277)', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    offTop()
    bidOn('dusk')
    expect(screen.getByTestId('manning-bubble-text').textContent).toBe('This bid turns Test crew red.')
    expect(foot()?.getAttribute('data-level')).toBe('red')
    await tapAway()
    expect(foot()).toBeNull()
    bidOn('asics')
    expect(foot(), 'a second bid on the red day: the note at the foot').toBeTruthy()
    expect(screen.getByTestId('manning-bubble-text').textContent).toBe('This bid takes Test crew lower, still red.')
    expect(foot()?.getAttribute('data-level')).toBe('red')
    expect(bubble()).toBeNull()
  })

  it('a UNA placed from the bid window names itself (D1351)', () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-una'))
    expect(bubble()?.textContent).toBe('This UNA turns Test crew red.')
  })

  it('a bid placed after a UNA in the same session is a bid again (D1351)', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-una'))
    await tapAway()
    bidOn('asics')
    expect(bubble()?.textContent).toBe('This bid takes Test crew lower, still red.')
  })

  /* the night's scenario designer, gap 3: the bubble speaks for what was placed here — a window opened and closed with
     nothing placed raises nothing, even when a row got worse behind it (a counter changed while it stood open) */
  it('a window opened and closed with nothing placed raises nothing, though a row got worse behind it', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    act(() => {
      const s = getState()
      const count = { kind: 'people' as const, filter: {} }
      const have = ruleHave(count, s.people, s.grid, s.states, TARGET)
      expect(saveManningRule({ id: 'test-bubble', label: 'Test crew', count, threshold: { amber: have + 1, red: have + 1 } })).toBe(true)
    })
    fireEvent.click(screen.getByTestId('bid-cancel'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(bubble()).toBeNull()
    expect(foot()).toBeNull()
  })

  /* gap 1: words saved after a filing (a window's closing saves them) are not a placing act — the filing stays the latest */
  it('words saved after a filing leave the filing named', () => {
    const before = actCount()
    expect(placeUna([{ personId: 'dusk', date: TARGET }], 'full').done).toBe(1)
    const rec = recordsAt('asics', '2026-01-23').find(r => r.kind === 'request')!
    expect(setRequestWords('asics', '2026-01-23', rec.id, { remarks: 'form attached' })).toBe(true)
    expect(filedSince(before)).toBe('UNA')
    expect(setCell('asics', TARGET, 'LL')).toBe(true)
    expect(filedSince(before), 'a bid placed after it is a bid').toBeNull()
  })

  it('a bid that makes a row better or leaves it as it was raises nothing', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    bidOn('dusk')
    await tapAway()
    /* the bid's own window opened again and closed with nothing pressed: nothing went lower */
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-cancel'))
    expect(screen.queryByTestId('bid-picker'), 'the window closed').toBeNull()
    expect(bubble()).toBeNull()
    expect(foot()).toBeNull()
  })
})

describe('the bubble\'s words (bubbleWords — D1345, D1351)', () => {
  const w = (e: [string, 'amber' | 'red', 'turns' | 'lower'][]) => new Map(e.map(([l, lv, how]) => [l, { lv, how }]))
  it('names what was filed', () => {
    expect(bubbleWords(w([['Available P', 'red', 'turns']]), 'OD')).toBe('This overseas duty turns Available P red.')
    expect(bubbleWords(w([['Available P', 'red', 'turns']]), 'CSE')).toBe('This course turns Available P red.')
    expect(bubbleWords(w([['Available P', 'red', 'turns']]), 'UNA')).toBe('This UNA turns Available P red.')
    expect(bubbleWords(w([['Available P', 'red', 'turns']]), null)).toBe('This bid turns Available P red.')
  })
  it('a row turned and a row taken lower, in one sentence', () => {
    expect(bubbleWords(w([['FCP', 'amber', 'turns'], ['Available P', 'red', 'lower']]), null))
      .toBe('This bid turns FCP amber and takes Available P lower, still red.')
    expect(bubbleWords(w([['IP', 'red', 'lower'], ['Available P', 'red', 'lower']]), null))
      .toBe('This bid takes IP and Available P lower, still red.')
    expect(bubbleWords(w([['IP', 'amber', 'turns'], ['Available P', 'red', 'turns']]), null))
      .toBe('This bid turns IP amber and Available P red.')
    expect(bubbleWords(w([['IP', 'amber', 'turns'], ['FCP', 'red', 'turns'], ['Available P', 'red', 'lower']]), null))
      .toBe('This bid turns IP amber, FCP red and takes Available P lower, still red.')
  })
})

describe('the rows a bid took lower (worsenedRows — D1345)', () => {
  const flags = (entries: [string, string, number, number][], drawn: string[] = []): BubbleFlags =>
    ({ m: new Map(entries.map(([k, label, lv, have]) => [k, { label, lv, have }])), drawn: new Set(drawn) })
  it('a red row one lower: "lower", at red', () => {
    const before = flags([['ip|2026-02-10', 'IP', 2, 5]])
    const now = flags([['ip|2026-02-10', 'IP', 2, 4]])
    expect([...worsenedRows(before, now)]).toEqual([['IP', { lv: 'red', how: 'lower' }]])
  })
  it('a red row at the same figure: nothing', () => {
    const before = flags([['ip|2026-02-10', 'IP', 2, 5]])
    expect([...worsenedRows(before, flags([['ip|2026-02-10', 'IP', 2, 5]]))]).toEqual([])
  })
  it('a row that turns red on one day and goes lower on another: "turns", at red', () => {
    const before = flags([['ip|2026-02-10', 'IP', 2, 5]])
    const now = flags([['ip|2026-02-10', 'IP', 2, 4], ['ip|2026-02-11', 'IP', 2, 3]])
    expect([...worsenedRows(before, now)]).toEqual([['IP', { lv: 'red', how: 'turns' }]])
  })
  it('an amber row taken lower but still amber: "lower", at amber', () => {
    const before = flags([['ip|2026-02-10', 'IP', 1, 6]])
    expect([...worsenedRows(before, flags([['ip|2026-02-10', 'IP', 1, 5]]))]).toEqual([['IP', { lv: 'amber', how: 'lower' }]])
  })
})

/* THE CODE READ'S FINDING (23 Oct 26, a fresh Opus reader): the two Available rows are read over the days DRAWN, and a
   month drawn while a bid window was open (the page behind a window still scrolls) had no "before" — a day already amber
   there counted as newly turned, and a bid that made nothing worse said "This bid turns Available P amber". A day that
   was not drawn when the "before" was taken is never counted as turned. Red first. */
describe('a day drawn only after the "before" is never "turned" (the code read)', () => {
  const flags = (entries: [string, string, number][], drawn: string[]): BubbleFlags =>
    ({ m: new Map(entries.map(([k, label, lv]) => [k, { label, lv }])), drawn: new Set(drawn) })
  it('an Available row already amber on a month drawn since: not reported', () => {
    const before = flags([], ['2026-01-13'])
    const now = flags([['availp|2026-02-10', 'Available P', 1]], ['2026-01-13', '2026-02-10'])
    expect([...worsenedRows(before, now)]).toEqual([])
  })
  it('an Available row the bid turned on a day drawn both times: reported', () => {
    const before = flags([], ['2026-01-13'])
    const now = flags([['availp|2026-01-13', 'Available P', 2]], ['2026-01-13'])
    expect([...worsenedRows(before, now)]).toEqual([['Available P', { lv: 'red', how: 'turns' }]])
  })
  it('a Manning row (read on every day, drawn or not) is still compared as before', () => {
    const before = flags([['ip|2026-02-10', 'IP', 1]], [])
    const now = flags([['ip|2026-02-10', 'IP', 2]], ['2026-02-10'])
    expect([...worsenedRows(before, now)]).toEqual([['IP', { lv: 'red', how: 'turns' }]])
  })
})
