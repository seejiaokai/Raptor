import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { advanceStage, getState, initStore, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { runInbound } from '../sync'
import { StageBar, Topbar } from './Chrome'
import { Matrix } from './Matrix'

/* these open the admin sheets (decision, counter, person), and advancing the
   cycle to reach them is admin-only since 27 Aug 26 (owner) — so run as an
   admin */
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => { initStore(memoryBackend()); setRole('admin') })
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

const scrim = () => screen.getByTestId('sheet-scrim')

// Every sheet, opened the way a person opens it. Kept as one table rather
// than one test each, because the point is that NO sheet is missing the
// behaviour — a per-sheet test would pass happily while an eighth sheet was
// written without one.
const SHEETS: { name: string; testid: string; open: () => void }[] = [
  {
    name: 'the counter sheet',
    testid: 'counter-sheet',
    open: () => {
      render(<Matrix />)
      fireEvent.click(screen.getByTestId('counter-pick'))
    },
  },
  {
    name: 'the bid picker',
    testid: 'bid-picker',
    open: () => {
      render(<Matrix />)
      fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    },
  },
  {
    name: 'the decision sheet',
    testid: 'bid-picker',
    open: () => {
      advanceStage()
      setRole('admin')
      render(<Matrix />)
      fireEvent.click(screen.getByTestId('cell-asics-2026-01-23'))
    },
  },
  {
    name: 'the person sheet',
    testid: 'person-sheet',
    open: () => {
      setRole('admin')
      render(<Matrix />)
      // The editor sits behind the figures sheet since 17 Aug 26.
      fireEvent.click(screen.getByTestId('person-ramp'))
      fireEvent.click(screen.getByTestId('person-edit'))
    },
  },
  {
    name: 'the person figures sheet',
    testid: 'person-figures',
    open: () => {
      render(<Matrix />)
      fireEvent.click(screen.getByTestId('person-ramp'))
    },
  },
  {
    name: 'the new-war sheet',
    testid: 'war-sheet',
    open: () => {
      setRole('admin')
      render(<Topbar />)
      fireEvent.click(screen.getByTestId('war-new'))
    },
  },
  {
    name: 'the bidding-window sheet',
    testid: 'window-sheet',
    open: () => {
      setRole('admin')
      render(<StageBar />)
      fireEvent.click(screen.getByTestId('bid-window'))
    },
  },
  {
    name: 'the published remarks sheet',
    testid: 'remarks-sheet',
    open: () => {
      // a filed leave, synced in, then published — an admin taps it to edit
      // the note (owner, 27 Aug 26)
      INPUTS.push({ iid: 'scrim-rmk', person: 'dusk', type: 'LL', date: 'Feb 11', yr: 2026, allday: true, remarks: 'x' })
      runInbound()
      advanceStage(); advanceStage()   // open -> closed -> published (admin)
      setViewer('dusk')
      render(<Matrix />)
      fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    },
  },
]

describe('clicking outside a sheet closes it', () => {
  for (const sheet of SHEETS) {
    it(`closes ${sheet.name}`, () => {
      sheet.open()
      expect(screen.getByTestId(sheet.testid)).toBeTruthy()
      fireEvent.click(scrim())
      expect(screen.queryByTestId(sheet.testid)).toBeNull()
    })

    it(`puts a scrim behind ${sheet.name} rather than leaving it unreachable`, () => {
      sheet.open()
      expect(screen.queryByTestId('sheet-scrim')).toBeTruthy()
    })
  }

  it('leaves no scrim behind once every sheet is shut', () => {
    render(<Matrix />)
    expect(screen.queryByTestId('sheet-scrim')).toBeNull()
    fireEvent.click(screen.getByTestId('counter-pick'))
    fireEvent.click(scrim())
    expect(screen.queryByTestId('sheet-scrim')).toBeNull()
  })

  // The scrim must not swallow a click meant for the sheet itself. Clicking a
  // control inside has to keep doing what it does — the counter sheet's rows
  // choose a counter, and choosing one closes the sheet by picking, not by
  // being dismissed.
  it('does not intercept a click on the sheet itself', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    fireEvent.click(screen.getByTestId('counter-oil'))
    expect(screen.queryByTestId('counter-sheet')).toBeNull()
    // The choice landed, which a swallowed click would not have done.
    expect(screen.getByTestId('counter-pick').textContent).toContain('OIL')
  })

  // Dismissing is not deciding. A bid left pending must still be pending after
  // the sheet is waved away, or "click outside" becomes a way to lose work.
  it('changes nothing about the bid it was opened on', () => {
    advanceStage()
    setRole('admin')
    render(<Matrix />)
    const before = getState().states.asics['2026-01-23']?.state
    fireEvent.click(screen.getByTestId('cell-asics-2026-01-23'))
    fireEvent.click(scrim())
    expect(getState().states.asics['2026-01-23']?.state).toBe(before)
  })
})

// The grid keeps scrolling sideways while a sheet is up (owner, 28 Aug 26).
// A horizontal DRAG on the scrim forwards onto the grid and leaves the sheet
// up; only a plain TAP (no movement) still dismisses.
describe('a sideways drag scrolls the grid, it does not dismiss', () => {
  it('keeps the sheet up when the scrim is dragged left-right', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.getByTestId('counter-sheet')).toBeTruthy()
    const s = scrim()
    fireEvent.pointerDown(s, { clientX: 260, clientY: 300, pointerId: 1 })
    fireEvent.pointerMove(s, { clientX: 160, clientY: 302, pointerId: 1 }) // 100px left, ~horizontal
    fireEvent.pointerUp(s, { clientX: 160, clientY: 302, pointerId: 1 })
    fireEvent.click(s) // the trailing click a mouse drag produces
    expect(screen.queryByTestId('counter-sheet')).toBeTruthy()
  })

  it('still closes on a plain tap with no drag', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    const s = scrim()
    fireEvent.pointerDown(s, { clientX: 260, clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(s, { clientX: 260, clientY: 300, pointerId: 1 })
    fireEvent.click(s)
    expect(screen.queryByTestId('counter-sheet')).toBeNull()
  })

  it('forwards the drag distance onto the grid scroller', () => {
    render(<Matrix />)
    const wrap = document.querySelector('.mx-wrap') as HTMLElement
    // jsdom has no layout, so scrollLeft is inert — make it a real number for
    // the length of this test so the forwarding can be observed.
    let sl = 0
    Object.defineProperty(wrap, 'scrollLeft', { configurable: true, get: () => sl, set: v => { sl = v } })
    wrap.scrollLeft = 500
    fireEvent.click(screen.getByTestId('counter-pick'))
    const s = scrim()
    fireEvent.pointerDown(s, { clientX: 300, clientY: 300, pointerId: 1 })
    fireEvent.pointerMove(s, { clientX: 200, clientY: 300, pointerId: 1 }) // dragged 100px left
    // started at 500, dragged 100px left → scrollLeft = 500 − (−100) = 600
    expect(wrap.scrollLeft).toBe(600)
  })
})

// The page is no longer frozen behind a sheet (owner, 28 Aug 26 — reversing
// the 17 Aug one-scroll lock), and the panel can be dragged out of the way.
describe('the page stays live behind a sheet, and the panel moves', () => {
  it('never locks the page scroll behind the sheet', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    // The old lock added this body class; removing it is the reversal.
    expect(document.body.classList.contains('lw-sheet-lock')).toBe(false)
  })

  it('slides the panel when its title strip is dragged', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    const panel = screen.getByTestId('counter-sheet')
    const hd = panel.querySelector('.bidsheet-hd') as HTMLElement
    expect(hd).toBeTruthy()
    // jsdom reports every rect 0×0, so the panel starts at (0,0) and the clamp
    // (keep 48px on screen, inside the default 1024×768 window) leaves this
    // move untouched: dx/dy come through as the raw drag distance.
    fireEvent.pointerDown(hd, { clientX: 100, clientY: 100, pointerId: 2 })
    fireEvent.pointerMove(hd, { clientX: 180, clientY: 140, pointerId: 2 })
    fireEvent.pointerUp(hd, { clientX: 180, clientY: 140, pointerId: 2 })
    expect(panel.style.getPropertyValue('--lw-dx')).toBe('80px')
    expect(panel.style.getPropertyValue('--lw-dy')).toBe('40px')
  })

  it('does not start a drag from a control on the title strip', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    const panel = screen.getByTestId('counter-sheet')
    // Pressing the ✕ (a button in the strip) must not move the panel — it
    // closes. A press that begins on a button is ignored by the drag handler.
    const x = screen.getByTestId('counter-cancel')
    fireEvent.pointerDown(x, { clientX: 100, clientY: 100, pointerId: 3 })
    fireEvent.pointerMove(x, { clientX: 180, clientY: 140, pointerId: 3 })
    expect(panel.style.getPropertyValue('--lw-dx')).toBe('')
  })
})
