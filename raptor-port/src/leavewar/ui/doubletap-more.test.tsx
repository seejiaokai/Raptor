// @vitest-environment jsdom
/* A DOUBLE TAP ON SIX MORE WINDOWS' CLOSING BUTTONS OPENS NOTHING BEHIND THEM ([LW-DOUBLETAP-MORE-WINDOWS] — the two
   reads of the night of 11 Nov 26: the Opus read's F1, Astra's §1). The guard of `doubletap-windows.test.tsx` saw a window
   go only when its open state lived in `Matrix`; these keep theirs elsewhere — the Required rows' selection panel, rename
   form and number pad (`FlyRows`), the day-details panel (its own listener set), the under-manned days list and Open for
   bidding (`StageBar`), New period (`Topbar`) — or were no window bit at all (the move banners, in `Matrix`). A finger's
   second tap a moment after their closing press fell through to the day where the button had stood. Each now arms the SAME
   guard through one door (`gridguard.ts`), and a press inside each counts as a press inside a window — the same place
   (32 px), the same moment (600 ms), the same things let through. Red first. */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../../engine/hooks'
import { INPUTS } from '../../engine/inputs'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { installGlobalUndo } from '../../state/undo-wire'
import { _resetTimeline } from '../../undo/timeline'
import { setFlyDays } from '../../state/flyplan'
import { initStore, lwHistInit, setRole } from '../state/store'
import { setLwOnScreen } from '../state/screen'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { openDayPanel } from './daypanelopen'
import { Topbar } from './Chrome'
import { Matrix } from './Matrix'

const ISNAP = JSON.stringify(INPUTS)
const CELL = 'cell-asics-2026-01-29'
const PENDING = 'cell-asics-2026-01-23'   // the seed's pending half day of LL — its window's Move picks it up
const MON = '2026-01-05', TUE = '2026-01-06', WED = '2026-01-07'
const picker = () => screen.queryByTestId('bid-picker')
/* a finger's tap: its press (a touch) and then its click */
const tap = (el: Element, x = 10, y = 10) => {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 3, pointerType: 'touch', button: 0, clientX: x, clientY: y }))
  fireEvent.click(el, { detail: 1, clientX: x, clientY: y })
}
/* the second tap, where the first one landed: a day's cell behind the window that just closed */
const second = (what: string, cell = CELL) => {
  tap(screen.getByTestId(cell))
  expect(picker(), `${what}: the second tap opens no window behind it`).toBeNull()
}
const opens = (what: string) => {
  tap(screen.getByTestId(CELL))
  expect(picker(), `${what}: the tap on the day is his — it opens`).toBeTruthy()
}
const wait = (ms: number) => act(async () => { await new Promise(r => setTimeout(r, ms)) })

const mem = new Map<string, string>()
const origEFP = document.elementFromPoint
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  mem.clear()
  /* the Required rows save into the scheduler's settings rows: a store to save into */
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  _resetTimeline(); installGlobalUndo()
  initStore(memoryBackend()); lwHistInit(); setRole('admin'); setLwOnScreen(true)
  /* jsdom draws nothing: the grid's press machine asks what is under a finger */
  document.elementFromPoint = () => null
})
afterEach(() => {
  cleanup(); setSession(null); storeBackend.impl = null; _resetTimeline(); document.elementFromPoint = origEFP
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
})

/* a mouse drag over the Required rows picks a block and opens their panel (reqpanel.test.tsx's own drag) */
async function pickReq(from: string, to: string) {
  const a = screen.getByTestId(`req-p-${from}`), b = screen.getByTestId(`req-w-${to}`)
  document.elementFromPoint = () => b
  a.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: 5, clientY: 5, button: 0 }))
  act(() => { window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 40, clientY: 5 })) })
  act(() => { window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', button: 0 })) })
  await wait(2)
  document.elementFromPoint = () => null
  expect(screen.getByTestId('req-panel')).toBeTruthy()
}

describe('the Required rows\' windows ([LW-DOUBLETAP-MORE-WINDOWS])', () => {
  it('the selection panel\'s ✕', async () => {
    render(<Matrix />)
    await pickReq(MON, TUE)
    tap(screen.getByTestId('req-panel-x'))
    expect(screen.queryByTestId('req-panel')).toBeNull()
    second('the selection panel\'s ✕')
  })

  it('the selection panel\'s Apply', async () => {
    render(<Matrix />)
    await pickReq(MON, TUE)
    fireEvent.change(screen.getByTestId('req-panel-num'), { target: { value: '14' } })
    tap(screen.getByTestId('req-panel-apply'))
    expect(screen.queryByTestId('req-panel'), 'applied and closed').toBeNull()
    second('the selection panel\'s Apply')
  })

  it('the selection panel\'s Clear', async () => {
    setFlyDays([{ iso: MON, p: 12, w: 8 }])
    render(<Matrix />)
    await pickReq(MON, TUE)
    tap(screen.getByTestId('req-panel-clear'))
    expect(screen.queryByTestId('req-panel'), 'cleared and closed').toBeNull()
    second('the selection panel\'s Clear')
  })

  it('the rename form\'s ✕, Save and Cancel', async () => {
    render(<Matrix />)
    for (const [btn, what] of [['reqname-close', '✕'], ['reqname-save', 'Save'], ['reqname-cancel', 'Cancel']] as const) {
      fireEvent.click(screen.getByTestId('fly-name-req-p'))
      expect(screen.getByTestId('req-name-form')).toBeTruthy()
      if (btn === 'reqname-save') fireEvent.change(screen.getByTestId('reqname-name'), { target: { value: `Pilots ${what}` } })
      tap(screen.getByTestId(btn))
      expect(screen.queryByTestId('req-name-form'), `${what}: closed`).toBeNull()
      second(`the rename form's ${what}`)
      await wait(650)
    }
  })

  it('the number pad\'s Done', () => {
    render(<Matrix />)
    tap(screen.getByTestId(`req-p-${WED}`))
    expect(screen.getByTestId('fly-pad'), 'a finger gets the app\'s own pad').toBeTruthy()
    tap(screen.getByTestId('fly-pad-5'))
    tap(screen.getByTestId('fly-pad-done'))
    expect(screen.queryByTestId('fly-pad'), 'saved and closed').toBeNull()
    second('the number pad\'s Done')
  })
})

describe('the day-details panel', () => {
  it('its ✕', () => {
    render(<Matrix />)
    act(() => openDayPanel('2026-01-12'))
    expect(screen.getByTestId('win-lwday')).toBeTruthy()
    tap(screen.getByTestId('win-lwday-x'))
    expect(screen.queryByTestId('win-lwday')).toBeNull()
    second('the day panel\'s ✕')
  })

  it('its ‹ › step it and keep it up: a double tap on › steps twice, and arms nothing', () => {
    render(<Matrix />)
    act(() => openDayPanel('2026-01-12'))
    tap(screen.getByTestId('lwday-next'))
    tap(screen.getByTestId('lwday-next'))
    expect(screen.getByTestId('lwday-body').getAttribute('data-iso')).toBe('2026-01-14')
    opens('the day panel still up')
  })
})

describe('the under-manned days list', () => {
  it('a row tapped takes the grid to that day and closes the list: a second tap there opens nothing', () => {
    elevenCounters()   // the red days come from the counters (undermanned.test.tsx); the app starts with none (D669)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('undermanned'))
    tap(screen.getByTestId('undermanned-day-2026-01-08'))
    expect(screen.queryByTestId('undermanned-list')).toBeNull()
    second('the under-manned list\'s row')
  })
})

describe('the move banners', () => {
  const pickUp = () => {
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-shift'))
    expect(screen.getByTestId('move-banner')).toBeTruthy()
  }

  it('the move banner\'s Cancel', async () => {
    render(<Matrix />)
    pickUp()
    await wait(450)   // past the move's own guard on the spot Move was pressed (D262)
    tap(screen.getByTestId('move-cancel'))
    expect(screen.queryByTestId('move-banner')).toBeNull()
    second('the move banner\'s Cancel')
  })

  it('the move banner\'s Confirm (a phone stages the landing)', async () => {
    const orig = window.matchMedia
    const listeners = new Set<() => void>()
    let narrow = false
    window.matchMedia = ((q: string) => ({ get matches() { return q.includes('max-width: 700px') ? narrow : false }, media: q,
      addEventListener: (_: string, f: () => void) => listeners.add(f), removeEventListener: (_: string, f: () => void) => listeners.delete(f),
      addListener: (f: () => void) => listeners.add(f), removeListener: (f: () => void) => listeners.delete(f), onchange: null, dispatchEvent: () => true })) as any
    try {
      render(<Matrix />)
      pickUp()
      act(() => { narrow = true; listeners.forEach(f => f()) })
      await wait(450)
      fireEvent.click(screen.getByTestId('cell-asics-2026-01-30'))
      tap(screen.getByTestId('move-confirm'))
      expect(screen.queryByTestId('move-banner'), 'landed').toBeNull()
      second('the move banner\'s Confirm')
    } finally { window.matchMedia = orig }
  }, 60_000)                                        // the grid redrawn at phone width is heavy on a loaded machine

  it('the event move banner\'s Cancel', async () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('event-0-2026-01-01'))
    fireEvent.click(screen.getByTestId('event-peek-edit'))
    fireEvent.click(screen.getByTestId('event-move'))
    expect(screen.getByTestId('event-move-banner')).toBeTruthy()
    await wait(450)
    tap(screen.getByTestId('event-move-cancel'))
    expect(screen.queryByTestId('event-move-banner')).toBeNull()
    second('the event move banner\'s Cancel')
  })
})

describe('New period and Open for bidding', () => {
  const newPeriod = () => {
    fireEvent.change(screen.getByTestId('war-picker'), { target: { value: '\u0000new' } })
    expect(screen.getByTestId('war-sheet')).toBeTruthy()
  }

  it('New period\'s ✕', () => {
    render(<><Topbar /><Matrix /></>)
    newPeriod()
    tap(screen.getByTestId('war-cancel'))
    expect(screen.queryByTestId('war-sheet')).toBeNull()
    second('New period\'s ✕')
  })

  it('New period\'s Create (the grid goes to the new period)', () => {
    render(<><Topbar /><Matrix /></>)
    newPeriod()
    fireEvent.change(screen.getByTestId('war-name'), { target: { value: 'JUL 28' } })
    const goTo = (yyyymm: string) => {
      for (let i = 0; i < 72; i++) {
        const at = screen.getByTestId('war').getAttribute('data-month')!
        if (at === yyyymm) return
        fireEvent.click(screen.getByTestId(at < yyyymm ? 'war-next' : 'war-prev'))
      }
    }
    goTo('2028-07')
    fireEvent.click(screen.getByTestId('war-day-2028-07-01'))
    fireEvent.click(screen.getByTestId('war-day-2028-07-31'))
    tap(screen.getByTestId('war-create'))
    expect(screen.queryByTestId('war-sheet'), 'made and closed').toBeNull()
    second('New period\'s Create', 'cell-asics-2028-07-10')
  })

  it('Open for bidding\'s ✕', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('open-chip'))
    expect(screen.getByTestId('open-dates')).toBeTruthy()
    tap(screen.getByTestId('open-dates-close'))
    expect(screen.queryByTestId('open-dates')).toBeNull()
    second('Open for bidding\'s ✕')
  })
})

/* what the built guard lets through, it lets through here too */
describe('what still goes through', () => {
  it('a finger\'s quick tap on another day, away from the ✕, opens it', () => {
    render(<Matrix />)
    act(() => openDayPanel('2026-01-12'))
    tap(screen.getByTestId('win-lwday-x'))
    tap(screen.getByTestId(CELL), 200, 300)
    expect(picker()).toBeTruthy()
  })

  it('a tap after the moment opens as ever', async () => {
    render(<Matrix />)
    act(() => openDayPanel('2026-01-12'))
    tap(screen.getByTestId('win-lwday-x'))
    await wait(650)
    opens('after the moment')
  })

  it('a window closed by Escape leaves no press to guard: a tap at once opens', () => {
    render(<Matrix />)
    act(() => openDayPanel('2026-01-12'))
    tap(screen.getByTestId('lwday-body'))   // a press inside the window, at the old spot
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('win-lwday')).toBeNull()
    opens('after Escape')
  })

  it('the under-manned list closed by a tap outside it (its shade) leaves the day tapped next to open', () => {
    elevenCounters()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('undermanned'))
    tap(screen.getByTestId('undermanned-scrim'))
    expect(screen.queryByTestId('undermanned-list')).toBeNull()
    opens('after the shade')
  })

  it('a move landed by a tap on a day (a desktop click) arms nothing: the next day tapped at once is his', async () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-shift'))
    await wait(450)
    tap(screen.getByTestId('cell-asics-2026-01-30'))
    expect(screen.queryByTestId('move-banner'), 'landed').toBeNull()
    opens('after a move landed on the grid')
  })
})
