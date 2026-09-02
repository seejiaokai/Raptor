import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getState, groupsInOrder, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
})

/* The one ⚙ SETTINGS button (owner, 3 Sep 26): every admin config control folds
   into the sheet it opens, off the top row. Rearranging is NOT in it — that is on
   the grid, started from the ⠿ in the corner. */
describe('the ⚙ Settings sheet', () => {
  it('is admin-only, and folds the config controls into one sheet', () => {
    // a member has neither the button nor any of the controls it holds
    const member = render(<Matrix />)
    expect(screen.queryByTestId('settings-open')).toBeNull()
    expect(screen.queryByTestId('counter-add')).toBeNull()
    member.unmount()

    setRole('admin')
    const { rerender } = render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    rerender(<Matrix />)
    expect(screen.getByTestId('settings-sheet')).toBeTruthy()
    // counters & rows live here now
    expect(screen.getByTestId('counter-add')).toBeTruthy()
    expect(screen.getByTestId('event-add')).toBeTruthy()
    expect(screen.getByTestId('sans-toggle')).toBeTruthy()
    expect(screen.getByTestId('counter-reset-all')).toBeTruthy()
    // the groups editor is folded in
    expect(screen.getByTestId('group-reset')).toBeTruthy()
    // …but rearranging is NOT in the sheet — no Auto-sort here
    expect(screen.queryByTestId('roster-autosort')).toBeNull()
  })

  it('Show SANS adds the SANS group row, whose ✕ hides SANS again', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    // no SANS group row until the switch is on
    expect(screen.queryByTestId('grow-SANS')).toBeNull()
    fireEvent.click(screen.getByTestId('sans-toggle'))
    expect(getState().showSans).toBe(true)
    expect(screen.getByTestId('grow-SANS')).toBeTruthy()
    // the SANS row's ✕ is the hide, not a stored-group removal
    fireEvent.click(screen.getByTestId('gdrop-SANS'))
    expect(getState().showSans).toBe(false)
    expect(screen.queryByTestId('grow-SANS')).toBeNull()
  })

  it('keeps the who-wins list tucked behind a disclosure', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    expect(screen.queryByTestId('group-priority')).toBeNull()
    fireEvent.click(screen.getByTestId('who-wins-toggle'))
    expect(screen.getByTestId('group-priority')).toBeTruthy()
  })
})

/* Rearranging happens ON THE GRID (owner, 3 Sep 26 — "I thought the rearrange
   could be done on the grid main page itself"): the ⠿ in the corner turns it on,
   a slim bar (Auto-sort + Done) appears, and Done turns it off. */
describe('on-grid rearrange', () => {
  it('the corner ⠿ toggles rearrange mode and the bar, and Done ends it', () => {
    setRole('admin')
    const { rerender } = render(<Matrix />)
    // not rearranging: no bar
    expect(screen.queryByTestId('rearrange-bar')).toBeNull()
    fireEvent.click(screen.getByTestId('roster-arrange'))       // the corner toggle
    rerender(<Matrix />)
    const bar = screen.getByTestId('rearrange-bar')
    expect(bar).toBeTruthy()
    // Auto-sort and Done live on the bar, beside the grid
    expect(screen.getByTestId('roster-autosort')).toBeTruthy()
    fireEvent.click(screen.getByTestId('roster-arrange-done'))
    rerender(<Matrix />)
    expect(screen.queryByTestId('rearrange-bar')).toBeNull()
  })

  it('a member has no rearrange corner', () => {
    render(<Matrix />)
    expect(screen.queryByTestId('roster-arrange')).toBeNull()
  })
})

/* A qualification group's COLOUR is the admin's pick (owner, 3 Sep 26 — "allow
   me to pick the colour i want"): adding the group opens a palette under its
   row, a tap on a dot stores the pick, and the row's swatch reopens it. */
describe('group colours in ⚙', () => {
  const SCD = 'q:scDay'

  it('adding a qualification group opens its palette; a dot picks the colour', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    expect(screen.queryByTestId(`gpalette-${SCD}`)).toBeNull()
    fireEvent.click(screen.getByTestId(`gadd-${SCD}`))
    expect(screen.getByTestId(`grow-${SCD}`)).toBeTruthy()
    expect(screen.getByTestId(`gpalette-${SCD}`)).toBeTruthy()
    fireEvent.click(screen.getByTestId(`gdot-${SCD}-7bc043`))
    expect(getState().groupColors[SCD]).toBe('#7BC043')
    // the swatch on the row wears it, and the grid heading's swatch too
    expect((screen.getByTestId(`gcolor-${SCD}`) as HTMLElement).style.background.toLowerCase()).toBe('rgb(123, 192, 67)')
    const heading = screen.getByTestId(`group-${SCD}`)
    expect((heading.querySelector('.gsw') as HTMLElement).style.background.toLowerCase()).toBe('rgb(123, 192, 67)')
    // the swatch toggles the palette shut and open again
    fireEvent.click(screen.getByTestId(`gcolor-${SCD}`))
    expect(screen.queryByTestId(`gpalette-${SCD}`)).toBeNull()
    fireEvent.click(screen.getByTestId(`gcolor-${SCD}`))
    expect(screen.getByTestId(`gpalette-${SCD}`)).toBeTruthy()
  })

  it('a built-in category has no colour button — it wears its CAT colour', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    expect(screen.queryByTestId('gcolor-SXO')).toBeNull()
    expect(screen.getByTestId('grow-SXO').querySelector('.set-sw.g-sxo')).toBeTruthy()
  })
})

/* The ⚙ list reorders by drag too (owner, 3 Sep 26 — "allow me to drag and drop
   to rearrange the groups"), on the same machine and the same write as the
   grid's heading grip, so the page follows. */
describe('drag to reorder in ⚙', () => {
  const origEFP = document.elementFromPoint
  afterEach(async () => { document.elementFromPoint = origEFP; await new Promise(r => setTimeout(r, 0)) })
  const pointer = (type: 'pointerdown' | 'pointermove' | 'pointerup', target: EventTarget, init: PointerEventInit) =>
    act(() => { target.dispatchEvent(new PointerEvent(type, { bubbles: true, ...init })) })

  it('dragging IP above SXO puts IP first on the page', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    expect(groupsInOrder().map(d => d.id).slice(0, 2)).toEqual(['SXO', 'IP'])
    // jsdom has no layout: the hit-test answers with the row the pointer "is over"
    document.elementFromPoint = () => screen.getByTestId('grow-SXO')
    pointer('pointerdown', screen.getByTestId('gsdrag-IP'), { pointerType: 'mouse', button: 0, clientX: 10, clientY: 40, pointerId: 1 })
    pointer('pointermove', window, { pointerType: 'mouse', clientX: 10, clientY: 10, pointerId: 1 })
    pointer('pointerup', window, { pointerType: 'mouse', clientX: 10, clientY: 10, pointerId: 1, button: 0 })
    expect(groupsInOrder().map(d => d.id).slice(0, 2)).toEqual(['IP', 'SXO'])
  })

  it('the SANS row has no grip — it is always at the foot', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    fireEvent.click(screen.getByTestId('sans-toggle'))
    expect(screen.queryByTestId('gsdrag-SANS')).toBeNull()
    expect(screen.getByTestId('gsdrag-IP')).toBeTruthy()
  })
})
