import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { closeDates, getState, initStore, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { syncAbsences } from '../sync'
import { StageBar, Topbar } from './Chrome'
import { Matrix } from './Matrix'

/* "+ New period" is the period list's last line since D1244 — no "+ New" button on the row: choosing it opens the
   new-period window. */
const chooseNewPeriod = () => fireEvent.change(screen.getByTestId('war-picker'), { target: { value: '\u0000new' } })

/* these open the admin sheets (decision, counter, person), and closing the
   dates to reach them is admin-only (owner, 27 Aug 26, carried to the open
   dates by D1177) — so run as an admin */
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => { initStore(memoryBackend()); setRole('admin') })
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

const scrim = () => screen.getByTestId('sheet-scrim')

// Every sheet, opened the way a person opens it. Kept as one table rather
// than one test each, because the point is that NO sheet is missing the
// behaviour — a per-sheet test would pass happily while an eighth sheet was
// written without one.
const SHEETS: { name: string; testid: string; open: () => void; gone?: true }[] = [
  /* GONE BY D1245 (22 Oct 26 — "on the grid each name keeps only its LVE figure beside it"): the column's heading is a
     plain LVE label, so nothing on the grid opens the counter sheet any more. Its entry stays, skipped (`gone`), so the
     sheet's behaviour is on record; the picker's code leaves whole with M5. */
  {
    name: 'the counter sheet',
    testid: 'counter-sheet',
    gone: true,
    open: () => {
      render(<Matrix />)
      fireEvent.click(screen.getByTestId('person-ramp'))
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
      closeDates('2026-01-01', '2026-12-31')   // every date closed (D1177 — was the closed stage)
      setRole('admin')
      render(<Matrix />)
      fireEvent.click(screen.getByTestId('cell-asics-2026-01-23'))
    },
  },
  /* (the person sheet — the war's Edit person — is gone: D460, D461) */
  {
    name: 'a figure breakdown',
    testid: 'figure-breakdown',
    open: () => {
      render(<Matrix />)
      fireEvent.click(screen.getByTestId('person-ramp'))
      fireEvent.click(screen.getByTestId('pfig-lve').querySelector('.crow')!)
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
      chooseNewPeriod()
    },
  },
  /* was the bidding-window sheet — the stages' one window went for the "Open for bidding" window (D1177) */
  {
    name: 'the Open for bidding window',
    testid: 'open-dates',
    open: () => {
      setRole('admin')
      render(<StageBar />)
      fireEvent.click(screen.getByTestId('open-chip'))
    },
  },
  {
    name: 'the remarks sheet',
    testid: 'remarks-sheet',
    open: () => {
      // a filed leave, synced in — the member taps his own approved leave to edit its note, at any time (D418 narrowed
      // by D1177: it was the published stage's, and an admin's tap too; an admin's tap now opens the decide window)
      INPUTS.push({ iid: 'scrim-rmk', person: 'dusk', type: 'LL', date: 'Feb 11', yr: 2026, allday: true, remarks: 'x' })
      syncAbsences()
      setRole('member')
      setViewer('dusk')
      render(<Matrix />)
      fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    },
  },
]

/* ESCAPE CLOSES EVERY SHEET (bug sweep, 28 Aug 26). Not one Leave War sheet
   answered Escape — the ✕ and a scrim tap were the only ways out — while the
   input editor and the Medical as-of picker both did, so the tab read as broken
   on a keyboard and left anyone there stuck inside a `role="dialog"`. Driven
   over the SAME table as the scrim, for the same reason: a per-sheet test would
   pass while an eighth sheet shipped without it. */
describe('Escape closes a sheet', () => {
  for (const sheet of SHEETS) {
    // a sheet the grid no longer opens (D1245) is skipped, never dropped
    const test = sheet.gone ? it.skip : it
    test(`closes ${sheet.name}`, () => {
      sheet.open()
      expect(screen.getByTestId(sheet.testid)).toBeTruthy()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByTestId(sheet.testid)).toBeNull()
    })
  }

  /* Leave War sheets REPLACE one another rather than stacking (a figure's
     breakdown takes the figures sheet's place; a decision sheet yields to the
     remarks editor), so one press closes the one sheet there is and the grid is
     left clear — no orphan scrim, nothing to tab into. */
  it('leaves no sheet and no scrim behind', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    fireEvent.click(screen.getByTestId('pfig-lve').querySelector('.crow')!)
    expect(screen.getByTestId('figure-breakdown')).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('figure-breakdown')).toBeNull()
    expect(screen.queryByTestId('person-figures')).toBeNull()
    expect(screen.queryByTestId('sheet-scrim')).toBeNull()
  })

  /* And no listener outlives its sheet: an Escape with nothing open must not
     reach into the grid or throw. */
  // Re-expressed for D1245: the grid's proof of life was the column's picker, gone with the picker; it is the column's
  // plain LVE heading now.
  it('does nothing when no sheet is open', () => {
    render(<Matrix />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('sheet-scrim')).toBeNull()
    expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
  })

  /* KEPT-MOUNTED guard (bug-hunt fix, 1 Sep 26). Inside Raptor the tab stays
     mounted behind a tab switch, so a sheet left open keeps this capture
     listener alive on a RAPTOR page — where it used to swallow the Escape
     Raptor's cell editing restores on, and close the hidden sheet unseen.
     The listener acts only while `#page-leavewar` carries `.on` (no wrapper —
     the standalone app — means always, which the suite above already runs). */
  it('ignores Escape while the Leave War section is hidden, acts once it shows', () => {
    const pg = document.createElement('section')
    pg.id = 'page-leavewar'; pg.className = 'page doze'
    document.body.appendChild(pg)
    try {
      render(<Matrix />)
      fireEvent.click(screen.getByTestId('person-ramp'))
      expect(screen.getByTestId('person-figures')).toBeTruthy()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.getByTestId('person-figures'), 'a hidden tab must not answer Escape').toBeTruthy()
      pg.className = 'page on'
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByTestId('person-figures')).toBeNull()
    } finally { pg.remove() }
  })
})

describe('clicking outside a sheet closes it', () => {
  for (const sheet of SHEETS) {
    // a sheet the grid no longer opens (D1245) is skipped, never dropped
    const test = sheet.gone ? it.skip : it
    test(`closes ${sheet.name}`, () => {
      sheet.open()
      expect(screen.getByTestId(sheet.testid)).toBeTruthy()
      fireEvent.click(scrim())
      expect(screen.queryByTestId(sheet.testid)).toBeNull()
    })

    test(`puts a scrim behind ${sheet.name} rather than leaving it unreachable`, () => {
      sheet.open()
      expect(screen.queryByTestId('sheet-scrim')).toBeTruthy()
    })
  }

  // Re-expressed for D1245: the sheet opened is the person's window (a tap on his name) — the counter sheet it used to
  // open is no longer reachable from the grid.
  it('leaves no scrim behind once every sheet is shut', () => {
    render(<Matrix />)
    expect(screen.queryByTestId('sheet-scrim')).toBeNull()
    fireEvent.click(screen.getByTestId('person-ramp'))
    fireEvent.click(scrim())
    expect(screen.queryByTestId('sheet-scrim')).toBeNull()
  })

  // The scrim must not swallow a click meant for the sheet itself. Clicking a
  // control inside has to keep doing what it does. Re-expressed for D1245: the
  // counter sheet (whose rows chose a counter) is no longer opened from the grid,
  // so the person's window stands in — a tap on one of its rows hands over to
  // that figure's breakdown, closing the window by choosing, not by dismissal.
  it('does not intercept a click on the sheet itself', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    fireEvent.click(screen.getByTestId('pfig-lve').querySelector('.crow')!)
    expect(screen.queryByTestId('person-figures')).toBeNull()
    // The choice landed, which a swallowed click would not have done.
    expect(screen.getByTestId('figure-breakdown')).toBeTruthy()
  })

  // Dismissing is not deciding. A bid left pending must still be pending after
  // the sheet is waved away, or "click outside" becomes a way to lose work.
  it('changes nothing about the bid it was opened on', () => {
    closeDates('2026-01-01', '2026-12-31')
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
// Re-expressed for D1245 here and in the next block: these opened the counter
// sheet from the column's picker, which is gone; the sheet under test is now the
// person's window (a tap on his name) — the same Sheet, scrim and title strip.
describe('a sideways drag scrolls the grid, it does not dismiss', () => {
  it('keeps the sheet up when the scrim is dragged left-right', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    expect(screen.getByTestId('person-figures')).toBeTruthy()
    const s = scrim()
    fireEvent.pointerDown(s, { clientX: 260, clientY: 300, pointerId: 1 })
    fireEvent.pointerMove(s, { clientX: 160, clientY: 302, pointerId: 1 }) // 100px left, ~horizontal
    fireEvent.pointerUp(s, { clientX: 160, clientY: 302, pointerId: 1 })
    fireEvent.click(s) // the trailing click a mouse drag produces
    expect(screen.queryByTestId('person-figures')).toBeTruthy()
  })

  it('still closes on a plain tap with no drag', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    const s = scrim()
    fireEvent.pointerDown(s, { clientX: 260, clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(s, { clientX: 260, clientY: 300, pointerId: 1 })
    fireEvent.click(s)
    expect(screen.queryByTestId('person-figures')).toBeNull()
  })

  it('forwards the drag distance onto the grid scroller', () => {
    render(<Matrix />)
    const wrap = document.querySelector('.mx-wrap') as HTMLElement
    // jsdom has no layout, so scrollLeft is inert — make it a real number for
    // the length of this test so the forwarding can be observed.
    let sl = 0
    Object.defineProperty(wrap, 'scrollLeft', { configurable: true, get: () => sl, set: v => { sl = v } })
    wrap.scrollLeft = 500
    fireEvent.click(screen.getByTestId('person-ramp'))
    const s = scrim()
    fireEvent.pointerDown(s, { clientX: 300, clientY: 300, pointerId: 1 })
    fireEvent.pointerMove(s, { clientX: 200, clientY: 300, pointerId: 1 }) // dragged 100px left
    // started at 500, dragged 100px left → scrollLeft = 500 − (−100) = 600
    expect(wrap.scrollLeft).toBe(600)
  })

  // Owner, 2 Sep 26: "when I click on a date in September the month in the
  // background jumps back to JAN". A mouse fires pointermove on a bare hover,
  // and the scrim spans the page behind a sheet — so the first motion after a
  // cell opened its sheet was read as a drag from (0,0) and forwarded as a
  // negative scrollLeft. No press, no pan.
  it('never pans the grid on a bare mouse hover over the scrim', () => {
    render(<Matrix />)
    const wrap = document.querySelector('.mx-wrap') as HTMLElement
    let sl = 0
    Object.defineProperty(wrap, 'scrollLeft', { configurable: true, get: () => sl, set: v => { sl = v } })
    wrap.scrollLeft = 6500
    fireEvent.click(screen.getByTestId('person-ramp'))
    const s = scrim()
    fireEvent.pointerMove(s, { clientX: 900, clientY: 300, pointerId: 1, pointerType: 'mouse' })
    fireEvent.pointerMove(s, { clientX: 700, clientY: 320, pointerId: 1, pointerType: 'mouse' })
    expect(wrap.scrollLeft).toBe(6500)
    expect(screen.queryByTestId('person-figures')).toBeTruthy()
  })

  it('stops panning once the mouse button has been released elsewhere', () => {
    render(<Matrix />)
    const wrap = document.querySelector('.mx-wrap') as HTMLElement
    let sl = 0
    Object.defineProperty(wrap, 'scrollLeft', { configurable: true, get: () => sl, set: v => { sl = v } })
    wrap.scrollLeft = 500
    fireEvent.click(screen.getByTestId('person-ramp'))
    const s = scrim()
    fireEvent.pointerDown(s, { clientX: 300, clientY: 300, pointerId: 1, pointerType: 'mouse', buttons: 1 })
    fireEvent.pointerMove(s, { clientX: 200, clientY: 300, pointerId: 1, pointerType: 'mouse', buttons: 1 })
    expect(wrap.scrollLeft).toBe(600)
    // The button came up over the panel (no pointerup reaches the scrim); a
    // later hover reports buttons 0 and must not keep dragging the grid.
    fireEvent.pointerMove(s, { clientX: 100, clientY: 300, pointerId: 1, pointerType: 'mouse', buttons: 0 })
    fireEvent.pointerMove(s, { clientX: 50, clientY: 300, pointerId: 1, pointerType: 'mouse', buttons: 0 })
    expect(wrap.scrollLeft).toBe(600)
  })
})

// The page is no longer frozen behind a sheet (owner, 28 Aug 26 — reversing
// the 17 Aug one-scroll lock), and the panel can be dragged out of the way.
describe('the page stays live behind a sheet, and the panel moves', () => {
  it('never locks the page scroll behind the sheet', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    // The old lock added this body class; removing it is the reversal.
    expect(document.body.classList.contains('lw-sheet-lock')).toBe(false)
  })

  it('slides the panel when its title strip is dragged', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    const panel = screen.getByTestId('person-figures')
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
    fireEvent.click(screen.getByTestId('person-ramp'))
    const panel = screen.getByTestId('person-figures')
    // Pressing the ✕ (a button in the strip) must not move the panel — it
    // closes. A press that begins on a button is ignored by the drag handler.
    const x = screen.getByTestId('pfig-close')
    fireEvent.pointerDown(x, { clientX: 100, clientY: 100, pointerId: 3 })
    fireEvent.pointerMove(x, { clientX: 180, clientY: 140, pointerId: 3 })
    expect(panel.style.getPropertyValue('--lw-dx')).toBe('')
  })
})

// THE SWIPE UNDER A SHEET IS THE BROWSER'S OWN (owner, 6 Sep 26 — "when a window
// like this is open, the swipe on the background … doesn't decelerate smoothly.
// Like it stops immediately … fix the swipe animation to be exactly the same").
// ON A TOUCH SCREEN THE FINGER FALLS THROUGH TO THE GRID (owner, 6 Sep 26 —
// the swipe behind a sheet must coast "exactly the same" as the bare grid, and
// after a first fix that mirrored a scroller onto it, "it feels more laggy /
// stuttery"). Sheet.tsx useGridPan takes the scrim out of the finger's way
// (`pointer-events: none` when `(pointer: coarse)` matches) so the browser
// flings `.mx-wrap` itself, and a document-level shield does what the scrim
// did by being in the way: a tap or press aimed under the sheet never reaches
// the grid's handlers, the tap closes the sheet, and the touch is never
// cancelled — that is what keeps it a scroll. jsdom has no matchMedia (a fine
// pointer, the scrim in the way — every test above), so a touch screen is
// stubbed in here. The fling itself is a real touch in e2e/leavewar.spec.ts.
describe('on a touch screen the finger falls through to the grid, and a tap is shielded', () => {
  const touchScreen = () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (q: string) => ({ matches: q === '(pointer: coarse)', media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false }),
    })
  }
  afterEach(() => { delete (window as any).matchMedia })
  const wrap = () => document.querySelector('.mx-wrap') as HTMLElement
  const openBid = () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  }
  // What the grid would hear: a listener on the scroller itself, below the
  // document-level shield.
  const heard = () => {
    const got: string[] = []
    for (const t of ['pointerdown', 'touchstart', 'mousedown', 'click']) wrap().addEventListener(t, () => got.push(t))
    return got
  }

  it('is out of the finger\'s way on a touch screen, and in it for a mouse', () => {
    openBid()
    expect(scrim().style.pointerEvents).toBe('') // jsdom: a fine pointer
    fireEvent.click(screen.getByTestId('bid-cancel'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    touchScreen() // the next sheet mounts onto a touch screen
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(scrim().style.pointerEvents).toBe('none')
  })

  it('a tap on a cell behind the sheet closes it, opens nothing, and never reaches the grid', () => {
    touchScreen()
    openBid()
    const got = heard()
    const cell = screen.getByTestId('cell-dusk-2026-02-12')
    fireEvent.pointerDown(cell, { pointerType: 'touch' })
    fireEvent.touchStart(cell)
    fireEvent.touchEnd(cell)
    fireEvent.mouseDown(cell)
    fireEvent.click(cell)
    expect(got).toEqual([])
    // The sheet is gone, and the tapped cell did NOT open its own.
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })

  it('never cancels the touch — that is what keeps it a native scroll — but does cancel the tap\'s mousedown, so no cell is focused', () => {
    touchScreen()
    openBid()
    const cell = screen.getByTestId('cell-dusk-2026-02-12')
    const ts = new Event('touchstart', { bubbles: true, cancelable: true })
    const pd = new Event('pointerdown', { bubbles: true, cancelable: true })
    const md = new Event('mousedown', { bubbles: true, cancelable: true })
    cell.dispatchEvent(ts); cell.dispatchEvent(pd); cell.dispatchEvent(md)
    expect(ts.defaultPrevented).toBe(false)
    expect(pd.defaultPrevented).toBe(false)
    expect(md.defaultPrevented).toBe(true)
  })

  it('leaves the sheet\'s own panel alone', () => {
    touchScreen()
    openBid()
    // A control inside the panel still works: the ✕ closes it.
    fireEvent.click(screen.getByTestId('bid-cancel'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })

  it('is gone with the sheet: the next tap on that cell opens its sheet again', () => {
    touchScreen()
    openBid()
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-12')) // shielded: closes
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    const got = heard()
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-12')) // bare: opens
    expect(got).toEqual(['click'])
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  })

  it('stands down while the Leave War section is not the one showing (the kept-mounted guard)', () => {
    touchScreen()
    render(<div id="page-leavewar" className="on"><Matrix /></div>)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    document.getElementById('page-leavewar')!.classList.remove('on')
    const got = heard()
    fireEvent.click(wrap())
    expect(got).toEqual(['click']) // reached the grid: not swallowed
    expect(screen.getByTestId('bid-picker')).toBeTruthy() // and not closed
  })

  it('keeps the vertical page pan for a finger on the scrim where the scrim is still in the way (a fine pointer)', () => {
    // The class rule is `touch-action: pan-y`, as since 28 Aug — the scrim
    // forwards a sideways drag by hand on a fine-pointer device only.
    openBid()
    expect(scrim().className).toBe('sheetscrim')
    expect(scrim().style.pointerEvents).toBe('')
  })
})
