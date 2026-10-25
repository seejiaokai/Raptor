// @vitest-environment jsdom
/* THE BID BUBBLE (D1227, widened by D1272 to every width, D1274 to a moved bid; since his D1358, 25 Oct 26, ALWAYS at the
   foot of the screen, with Show › only while the Manning rows are out of view; since D1360 / D1364 its words are each row's
   figures in the bid window's day-line form — "This bid: Available P 27 → 26").
   A bid that turns a Manning or Available row amber or red, or takes one already there lower (D1345), opens the Manning
   rows and raises the note naming each row with its figures, gone at his next tap or key.

   This pins: a bid placed through the bid window raises it; a bid MOVED onto a day raises it too (D1274); a move that
   makes nothing worse raises nothing; the note goes at the next tap; it sits at the foot always (D1358) with Show only while
   the Manning button is out of view; its words carry the figures (D1364), several rows side by side (D1360).

   The row that turns: a counter of everyone, red below the number of people free on the day the bid lands on — so one
   more bid there takes it under. Its id is the test's own. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ruleHave } from '../engine'
import { actCount, filedSince, fileStraight, getState, initStore, lwHistInit, lwUndo, recordsAt, saveManningRule, setBidStates, setCell, setRequestWords, setRole } from '../state/store'
import { setLwOnScreen } from '../state/screen'
import { memoryBackend } from '../state/storage'
import { bubbleParts, bubbleWords, Matrix, worsenedRows, type BubbleFlags } from './Matrix'

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
 *  only level it can reach there is red. Returns its figure on that day before any bid. */
function rowRedPastOneMore(day: string, label = 'Test crew'): number {
  const s = getState()
  const count = { kind: 'people' as const, filter: {} }
  const have = ruleHave(count, s.people, s.grid, s.states, day)
  expect(have, 'the seed has people free that day').toBeGreaterThan(1)
  expect(saveManningRule({ id: 'test-bubble', label, count, threshold: { amber: have, red: have } })).toBe(true)
  return have
}

const bubble = () => screen.queryByTestId('manning-bubble')
const said = () => bubble()?.getAttribute('aria-label') ?? null
const land = async (testid: string) => {
  await act(async () => { await new Promise(r => setTimeout(r, 420)) })   // past the double-click guard every move opens with
  fireEvent.click(screen.getByTestId(testid))
}
/** the words the day-line form gives a row from `a` to `b` */
const one = (lead: string, a: number, b: number, label = 'Test crew') => `${lead}: ${label} ${a} → ${b}`

describe('the bid bubble (D1227, D1272, D1364)', () => {
  it('a bid placed through the bid window that turns a row red raises it, naming the row with its figures', () => {
    const h = rowRedPastOneMore(TARGET)
    render(<Matrix />)
    expect(bubble()).toBeNull()
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(said()).toBe(one('This bid', h, h - 1))
    expect(screen.getByTestId('manning-bubble-text').textContent).toBe(one('This bid', h, h - 1))
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
    const h = rowRedPastOneMore(TARGET)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-shift'))
    expect(screen.getByTestId('move-banner')).toBeTruthy()
    expect(bubble(), 'picking the chip up changes nothing yet').toBeNull()
    await land(`cell-asics-${TARGET}`)
    expect(getState().grid.asics[TARGET]).toBe('*LL')                 // it landed
    expect(said()).toBe(one('This bid', h, h - 0.5))                   // a half day off: half a person
  })

  it('a move that makes no row worse raises nothing', async () => {
    /* no test counter: the seed's own rows stay as they were on the day it lands (the test above names only its own
       row), and the day it leaves can only get better */
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-shift'))
    await land(`cell-asics-${TARGET}`)
    expect(getState().grid.asics[TARGET]).toBe('*LL')
    expect(bubble()).toBeNull()
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

/* D1358 (25 Oct 26 — "why don't just make it always at the foot?", his "3 yes"), narrowing D1277: the note sits at the foot
   of the screen ALWAYS — the one note, never a second under the Manning button — and its "Show ›", which takes him up to the
   Manning rows, opened, is offered only while those rows are out of view; it follows them in and out as the page scrolls.
   Red first: with the button in view the note stood under it, with no foot. (jsdom draws no layout, so a button with no
   box counts as in view; the tests give it a box above the screen to take it out of view.) */
describe('always at the foot; Show › only while the Manning rows are out of view (D1358)', () => {
  const offTop = () => {
    const btn = screen.getByTestId('counts-toggle')
    btn.getBoundingClientRect = () => ({ top: -300, bottom: -273, left: 26, right: 106, width: 80, height: 27, x: 26, y: -300, toJSON: () => ({}) }) as DOMRect
    return btn
  }
  const backInView = (btn: HTMLElement) => { btn.getBoundingClientRect = () => ({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect }
  const placeBid = () => {
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-LL'))
  }

  it('with the Manning button in view: at the foot, with no Show', () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    placeBid()
    expect(bubble()?.className).toContain('mn-foot')
    expect(bubble()?.getAttribute('role')).toBe('status')
    expect(screen.queryByTestId('manning-bubble-show')).toBeNull()
  })

  it('with it out of view: at the foot, with "Show ›"', () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    offTop()
    placeBid()
    expect(bubble()?.className).toContain('mn-foot')
    expect(screen.getByTestId('manning-bubble-show').textContent).toBe('Show ›')
  })

  it('Show › follows the rows: scrolled into view it goes, out again it comes back', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    const btn = offTop()
    placeBid()
    expect(screen.queryByTestId('manning-bubble-show')).toBeTruthy()
    backInView(btn)
    await act(async () => { window.dispatchEvent(new Event('scroll')); await new Promise(r => setTimeout(r, 40)) })
    expect(screen.queryByTestId('manning-bubble-show'), 'in view: no Show').toBeNull()
    expect(bubble(), 'the note itself stays').toBeTruthy()
    offTop()
    await act(async () => { window.dispatchEvent(new Event('scroll')); await new Promise(r => setTimeout(r, 40)) })
    expect(screen.queryByTestId('manning-bubble-show')).toBeTruthy()
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
      expect(btn.getAttribute('aria-expanded')).toBe('true')               // the rows opened by the bid
      await act(async () => { await new Promise(r => setTimeout(r, 0)) })
      const show = screen.getByTestId('manning-bubble-show')
      fireEvent.pointerDown(show)                                           // a press on Show is not "a tap elsewhere"
      expect(bubble()).toBeTruthy()
      fireEvent.click(show)
      expect(seen).toContain(btn)
      expect(document.activeElement).toBe(btn)
      expect(bubble()).toBeNull()
    } finally { Element.prototype.scrollIntoView = was }
  })

  it('a press on the note itself is not his next tap; a key ends it — but Tab, on the way to Show, does not', async () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    offTop()
    placeBid()
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    fireEvent.pointerDown(screen.getByTestId('manning-bubble-text'))
    expect(bubble()).toBeTruthy()
    fireEvent.keyDown(document.body, { key: 'Tab' })
    expect(bubble()).toBeTruthy()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(bubble()).toBeNull()
  })

  it('a moved bid with the button out of view: the note at the foot, with Show', async () => {
    const h = rowRedPastOneMore(TARGET)
    render(<Matrix />)
    offTop()
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-shift'))
    await land(`cell-asics-${TARGET}`)
    expect(said()).toBe(one('This bid', h, h - 0.5))
    expect(screen.getByTestId('manning-bubble-show')).toBeTruthy()
  })
})

/* HIS REPORT (25 Oct 26 — "this bid turns available P red. the box is in amber can u make it red. and why any other
   subsequent inputs that put that further red does not show that bubble?"). D1344: the bubble wears the colour of the
   worst level it names. D1345: every bid or filing that takes a row LOWER on a day where it then stands amber or red raises
   it, not only the one that first turned it. D1351: after a filing it names what was filed ("This overseas duty", "This
   course", "This Other"); a bid keeps "This bid". D1364: every one of them with its figures. */
describe('his report: red when red, and every lowering raises it (D1344, D1345, D1351, D1364)', () => {
  const bidOn = (who: string) => {
    fireEvent.click(screen.getByTestId(`cell-${who}-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-LL'))
  }
  const tapAway = async () => {
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    fireEvent.pointerDown(document.body)
  }
  /** a counter of everyone, amber the moment one more is off and red only far below (so it can stand amber) */
  function rowAmberPastOneMore(day: string, label = 'Test crew'): number {
    const s = getState()
    const count = { kind: 'people' as const, filter: {} }
    const have = ruleHave(count, s.people, s.grid, s.states, day)
    expect(have).toBeGreaterThan(3)
    expect(saveManningRule({ id: 'test-bubble', label, count, threshold: { amber: have, red: 1 } })).toBe(true)
    return have
  }

  it('a bubble that says red is drawn red, its pair red (D1344, D1360)', () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    bidOn('dusk')
    expect(bubble()?.getAttribute('data-level'), 'red, as it says').toBe('red')
    expect(bubble()?.className).toContain('mnb-red')
    expect(screen.getByTestId('manning-bubble-pair').className).toContain('mnp-red')
  })
  it('…and one that says amber is drawn amber (D1344)', () => {
    const h = rowAmberPastOneMore(TARGET)
    render(<Matrix />)
    bidOn('dusk')
    expect(said()).toBe(one('This bid', h, h - 1))
    expect(bubble()?.getAttribute('data-level')).toBe('amber')
    expect(bubble()?.className).toContain('mnb-amber')
    expect(screen.getByTestId('manning-bubble-pair').className).toContain('mnp-amber')
  })

  it('a second bid on a day already red raises it again, with its figures (D1345, D1364)', async () => {
    const h = rowRedPastOneMore(TARGET)
    render(<Matrix />)
    bidOn('dusk')
    expect(said()).toBe(one('This bid', h, h - 1))
    await tapAway()
    expect(bubble()).toBeNull()
    bidOn('asics')
    expect(getState().grid.asics?.[TARGET], 'the second bid was placed').toBeTruthy()
    expect(said()).toBe(one('This bid', h - 1, h - 2))
    expect(bubble()?.getAttribute('data-level')).toBe('red')
  })

  /* the scenario designer's G6: a refused bid counts nobody out (D998); a second tap on its lit Refuse sends it back to
     waiting (D1361), and a bid waiting counts — so the row goes lower, and the window that did it raises the bubble */
  it('a refused bid sent back to waiting, taking a row red, raises it as the window closes (D1345, D1361; G6)', () => {
    act(() => { setCell('dusk', TARGET, 'LL') })
    act(() => { setBidStates([{ personId: 'dusk', date: TARGET }], 'refused') })
    const h = rowRedPastOneMore(TARGET)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    const refuse = screen.getByTestId('decide-refuse')
    expect(refuse.textContent).toBe('Refused')
    fireEvent.click(refuse)
    if (screen.queryByTestId('bid-picker')) fireEvent.click(screen.getByTestId('bid-cancel'))
    expect(said()).toBe(one('This bid', h, h - 1))
  })

  it('a row already amber that goes lower and stays amber raises it too (D1345)', async () => {
    const h = rowAmberPastOneMore(TARGET)
    render(<Matrix />)
    bidOn('dusk')
    await tapAway()
    bidOn('asics')
    expect(said()).toBe(one('This bid', h - 1, h - 2))
    expect(bubble()?.getAttribute('data-level')).toBe('amber')
  })

  it('an overseas duty filed from the bid window names itself, with its figures (D1351, D1364)', () => {
    const h = rowRedPastOneMore(TARGET)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-file-OD'))
    expect(said()).toBe(one('This overseas duty', h, h - 1))
  })

  it('a bid placed after a filing in the same session is a bid again (D1351)', async () => {
    const h = rowRedPastOneMore(TARGET)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-file-OD'))
    await tapAway()
    bidOn('asics')
    expect(said()).toBe(one('This bid', h - 1, h - 2))
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
  })

  /* gap 1: words saved after a filing (a window's closing saves them) are not a placing act — the filing stays the latest */
  it('words saved after a filing leave the filing named', () => {
    const before = actCount()
    expect(fileStraight([{ personId: 'dusk', date: TARGET }], 'OD').done).toBe(1)
    const rec = recordsAt('asics', '2026-01-23').find(r => r.kind === 'request')!
    expect(setRequestWords('asics', '2026-01-23', rec.id, { remarks: 'form attached' })).toBe(true)
    expect(filedSince(before)).toBe('OD')
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
  })
})

describe('the bubble\'s words (bubbleParts, bubbleWords — D1351, D1360, D1364)', () => {
  const w = (e: [string, 'amber' | 'red', 'turns' | 'lower', number?, number?][]) =>
    new Map(e.map(([l, lv, how, before, after]) => [l, { lv, how, ...(before !== undefined ? { before } : {}), ...(after !== undefined ? { after } : {}) }]))
  it('names what was filed, with each row’s figures', () => {
    expect(bubbleWords(w([['Available P', 'red', 'turns', 27, 26]]), 'OD')).toBe('This overseas duty: Available P 27 → 26')
    expect(bubbleWords(w([['Available P', 'red', 'turns', 27, 26]]), 'CSE')).toBe('This course: Available P 27 → 26')
    expect(bubbleWords(w([['Available P', 'red', 'turns', 27, 26]]), 'OTH')).toBe('This Other: Available P 27 → 26')
    expect(bubbleWords(w([['Available P', 'red', 'turns', 27, 26]]), null)).toBe('This bid: Available P 27 → 26')
  })
  it('several rows side by side in the day-line form, each in its colour (D1360)', () => {
    expect(bubbleWords(w([['IP', 'amber', 'turns', 16, 15], ['SXO', 'red', 'lower', 12, 11]]), null)).toBe('This bid: IP 16 → 15 · SXO 12 → 11')
    expect(bubbleParts(w([['IP', 'amber', 'turns', 16, 15], ['SXO', 'red', 'lower', 12, 11]]), null).pairs.map(p => p.lv)).toEqual(['amber', 'red'])
  })
  it('halves read .5; a row with no figure before reads its figure alone', () => {
    expect(bubbleWords(w([['Available P', 'amber', 'turns', 27, 26.5]]), null)).toBe('This bid: Available P 27 → 26.5')
    expect(bubbleWords(w([['Available P', 'amber', 'turns', undefined, 26]]), null)).toBe('This bid: Available P 26')
  })
})

describe('the rows a bid took lower (worsenedRows — D1345, D1364)', () => {
  const flags = (entries: [string, string, number, number][], drawn: string[] = []): BubbleFlags =>
    ({ m: new Map(entries.map(([k, label, lv, have]) => [k, { label, lv, have }])), drawn: new Set(drawn) })
  it('a red row one lower: "lower", at red, with both figures', () => {
    const before = flags([['ip|2026-02-10', 'IP', 2, 5]])
    const now = flags([['ip|2026-02-10', 'IP', 2, 4]])
    expect([...worsenedRows(before, now)]).toEqual([['IP', { lv: 'red', how: 'lower', before: 5, after: 4 }]])
  })
  it('a row clear before and red now: "turns", its figure before kept (D1364)', () => {
    const before = flags([['ip|2026-02-10', 'IP', 0, 6]])
    const now = flags([['ip|2026-02-10', 'IP', 2, 5]])
    expect([...worsenedRows(before, now)]).toEqual([['IP', { lv: 'red', how: 'turns', before: 6, after: 5 }]])
  })
  it('a row still clear is never reported', () => {
    expect([...worsenedRows(flags([['ip|2026-02-10', 'IP', 0, 6]]), flags([['ip|2026-02-10', 'IP', 0, 5]]))]).toEqual([])
  })
  it('a red row at the same figure: nothing', () => {
    const before = flags([['ip|2026-02-10', 'IP', 2, 5]])
    expect([...worsenedRows(before, flags([['ip|2026-02-10', 'IP', 2, 5]]))]).toEqual([])
  })
  it('a row that turns red on one day and goes lower on another: "turns", at red', () => {
    const before = flags([['ip|2026-02-10', 'IP', 2, 5], ['ip|2026-02-11', 'IP', 1, 4]])
    const now = flags([['ip|2026-02-10', 'IP', 2, 4], ['ip|2026-02-11', 'IP', 2, 3]])
    expect([...worsenedRows(before, now)]).toEqual([['IP', { lv: 'red', how: 'turns', before: 4, after: 3 }]])
  })
  it('an amber row taken lower but still amber: "lower", at amber', () => {
    const before = flags([['ip|2026-02-10', 'IP', 1, 6]])
    expect([...worsenedRows(before, flags([['ip|2026-02-10', 'IP', 1, 5]]))]).toEqual([['IP', { lv: 'amber', how: 'lower', before: 6, after: 5 }]])
  })
})

/* THE CODE READ'S FINDING (23 Oct 26, a fresh Opus reader): the two Available rows are read over the days DRAWN, and a
   month drawn while a bid window was open (the page behind a window still scrolls) had no "before" — a day already amber
   there counted as newly turned. A day that was not drawn when the "before" was taken is never counted as turned. */
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

/* [LW-NIGHT1025-OLDER] (g): on a phone the day panel rests at the foot of the screen, and the note lay under it. With a
   panel up the note stands just above the panel's top. Red first. */
describe('above a resting day panel ((g))', () => {
  it('a day panel 300 tall at the foot: the note stands 312 from the foot', () => {
    rowRedPastOneMore(TARGET)
    const panel = document.createElement('div')
    panel.dataset.testid = 'win-lwday'
    panel.getBoundingClientRect = () => ({ top: window.innerHeight - 300, bottom: window.innerHeight, left: 0, right: 400, width: 400, height: 300, x: 0, y: window.innerHeight - 300, toJSON: () => ({}) }) as DOMRect
    document.body.appendChild(panel)
    try {
      render(<Matrix />)
      fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
      fireEvent.click(screen.getByTestId('bid-LL'))
      expect(bubble()?.style.bottom).toBe('312px')
    } finally { panel.remove() }
  })
  it('with no panel up it keeps its own place', () => {
    rowRedPastOneMore(TARGET)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(bubble()?.style.bottom).toBe('')
  })
})
