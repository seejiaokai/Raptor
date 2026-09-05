import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getState, groupsInOrder, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
})

/* The counter block's ONE-ROW top bar (owner, 5 Sep 26 — "all in 1 row to
   minimise row height space"): Manning · ⚙ · Rearrange lead, OIL tracker trails,
   the old "JAN – DEC 26 · 365 days · 50 people" line dropped, and the Rearrange
   toggle moved up from the grid corner into this row. jsdom can't see the single
   line, but it pins the DOM: which controls live in the header, in order, by
   role, and that the date/size text is gone. */
describe('the counter top bar', () => {
  it('is Manning · ⚙ · Rearrange · OIL · − · + in the header for an admin, with no date/size line', () => {
    setRole('admin')
    const { container } = render(<Matrix />)
    const hd = container.querySelector('.card-hd')!
    expect(hd).toBeTruthy()
    // the "… · 365 days · 50 people" line is gone
    expect(hd.textContent).not.toMatch(/days ·|· \d+ people/)
    // all six controls live in this one header row, left-to-right in order —
    // the zoom pair right after OIL (owner, 6 Sep 26), moved off the month strip
    const ids = ['counts-toggle', 'settings-open', 'roster-arrange', 'oil-tracker', 'lw-zoom-out', 'lw-zoom-in']
    const found = [...hd.querySelectorAll('[data-testid]')]
      .map(el => el.getAttribute('data-testid'))
      .filter(id => ids.includes(id!))
    expect(found).toEqual(ids)
    // the rearrange trigger moved OUT of the grid header into the card header
    const arrange = screen.getByTestId('roster-arrange')
    expect(arrange.closest('.card-hd')).toBe(hd)
    expect(arrange.closest('.mxhead')).toBeNull()
  })

  it('gives a member only Manning and the OIL tracker — no config, no rearrange', () => {
    render(<Matrix />)   // default role is member
    const hd = document.querySelector('.card-hd')!
    expect(hd.querySelector('[data-testid="counts-toggle"]')).toBeTruthy()
    expect(hd.querySelector('[data-testid="oil-tracker"]')).toBeTruthy()
    expect(hd.querySelector('[data-testid="settings-open"]')).toBeNull()
    expect(hd.querySelector('[data-testid="roster-arrange"]')).toBeNull()
    // …plus the zoom pair, a view control for both roles
    expect(hd.querySelector('[data-testid="lw-zoom-out"]')).toBeTruthy()
    expect(hd.querySelector('[data-testid="lw-zoom-in"]')).toBeTruthy()
    // the zoom no longer rides the month strip
    expect(screen.getByTestId('month-strip').querySelector('[data-testid="lw-zoom"]')).toBeNull()
  })

  it('the header ⇅ toggle turns arrange mode on — the grips appear, the column widens, no bar', () => {
    setRole('admin')
    render(<Matrix />)
    const outer = () => document.querySelector('.mx-outer')!
    expect(screen.queryByTestId('manning-drag-sets')).toBeNull()
    expect(outer().classList.contains('mx-arranging')).toBe(false)
    fireEvent.click(screen.getByTestId('roster-arrange'))
    expect(screen.getByTestId('manning-drag-sets')).toBeTruthy()
    expect(outer().classList.contains('mx-arranging')).toBe(true)
    expect(screen.getByTestId('roster-arrange').classList.contains('on')).toBe(true)
    // the old strip under the header (Auto-sort / Done) is gone (owner, 6 Sep 26)
    expect(screen.queryByTestId('rearrange-bar')).toBeNull()
    expect(screen.queryByTestId('roster-autosort')).toBeNull()
    expect(screen.queryByTestId('roster-arrange-done')).toBeNull()
  })

  it('the toggle reads ⇅ with the word on a droppable tail — icon-only on a phone', () => {
    setRole('admin')
    render(<Matrix />)
    const btn = screen.getByTestId('roster-arrange')
    expect(btn.textContent!.trim().startsWith('⇅')).toBe(true)
    expect(btn.querySelector('.rtlbl')!.textContent).toMatch(/Rearrange/)
    fireEvent.click(btn)
    expect(btn.querySelector('.rtlbl')!.textContent).toMatch(/Rearranging/)
  })
})

/* The one ⚙ SETTINGS button (owner, 3 Sep 26): every admin config control folds
   into the sheet it opens, off the top row. Rearranging is NOT in the sheet — it
   is its own toggle in the top row (owner, 5 Sep 26 — moved there from the grid
   corner), and the actual rearranging still happens hands-on-grid. */
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
   could be done on the grid main page itself"): the header ⇅ turns it on, and
   the SAME ⇅ turns it off (owner, 6 Sep 26 — "when I click on it, it exits the
   rearrange mode"); the strip with Auto-sort + Done that used to sit under the
   header is gone. */
describe('on-grid rearrange', () => {
  it('the ⇅ toggle turns rearrange mode on, and the same ⇅ ends it', () => {
    setRole('admin')
    const { rerender } = render(<Matrix />)
    const grips = () => document.querySelectorAll('[data-testid^="drag-"]').length
    expect(grips()).toBe(0)
    fireEvent.click(screen.getByTestId('roster-arrange'))
    rerender(<Matrix />)
    expect(grips()).toBeGreaterThan(0)
    expect(screen.getByTestId('roster-arrange').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByTestId('roster-arrange'))
    rerender(<Matrix />)
    expect(grips()).toBe(0)
    expect(screen.getByTestId('roster-arrange').getAttribute('aria-pressed')).toBe('false')
    expect(document.querySelector('.mx-outer')!.classList.contains('mx-arranging')).toBe(false)
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
    // picking a colour closes the palette (owner, 4 Sep 26 — "after i selected a
    // colour it will auto close")
    expect(screen.queryByTestId(`gpalette-${SCD}`)).toBeNull()
    // the swatch on the row wears it, and the grid heading's swatch too
    expect((screen.getByTestId(`gcolor-${SCD}`) as HTMLElement).style.background.toLowerCase()).toBe('rgb(123, 192, 67)')
    const heading = screen.getByTestId(`group-${SCD}`)
    expect((heading.querySelector('.gsw') as HTMLElement).style.background.toLowerCase()).toBe('rgb(123, 192, 67)')
    // the swatch reopens the palette, and toggles it shut again
    fireEvent.click(screen.getByTestId(`gcolor-${SCD}`))
    expect(screen.getByTestId(`gpalette-${SCD}`)).toBeTruthy()
    fireEvent.click(screen.getByTestId(`gcolor-${SCD}`))
    expect(screen.queryByTestId(`gpalette-${SCD}`)).toBeNull()
  })

  /* A click-open popup closes when you click outside it (owner, 4 Sep 26 — the
     app's standing rule; here the colour palette). A press on the palette or on
     a colour swatch is NOT outside — the swatch owns its own toggle. */
  it('a click outside the open palette closes it', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    fireEvent.click(screen.getByTestId(`gadd-${SCD}`))
    expect(screen.getByTestId(`gpalette-${SCD}`)).toBeTruthy()
    // a press inside the palette leaves it open
    fireEvent.pointerDown(screen.getByTestId(`gpalette-${SCD}`))
    expect(screen.getByTestId(`gpalette-${SCD}`)).toBeTruthy()
    // a press anywhere else in the sheet shuts it
    fireEvent.pointerDown(screen.getByTestId('settings-sheet'))
    expect(screen.queryByTestId(`gpalette-${SCD}`)).toBeNull()
  })

  /* Escape peels one layer: the palette first, the sheet only on the next press
     (bug hunt, 4 Sep 26 — before, Escape with the palette open shut the whole
     sheet). */
  it('Escape closes the open palette and leaves the sheet up; a second Escape closes the sheet', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    fireEvent.click(screen.getByTestId(`gadd-${SCD}`))
    expect(screen.getByTestId(`gpalette-${SCD}`)).toBeTruthy()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId(`gpalette-${SCD}`)).toBeNull()
    expect(screen.getByTestId('settings-sheet')).toBeTruthy()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('settings-sheet')).toBeNull()
  })

  it('a stored pick in lower-case still rings its dot', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    fireEvent.click(screen.getByTestId(`gadd-${SCD}`))
    ;(getState() as any).groupColors[SCD] = '#7bc043'
    fireEvent.click(screen.getByTestId(`gcolor-${SCD}`))   // close
    fireEvent.click(screen.getByTestId(`gcolor-${SCD}`))   // reopen, re-read
    expect(screen.getByTestId(`gdot-${SCD}-7bc043`).className).toContain('on')
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

  /* The drop bar points at the seam the row will land in: top edge for the
     upper half of the hovered row, bottom edge (`after`) for the lower half
     (bug hunt, 4 Sep 26 — the list used to show only the top bar). */
  it('the hovered row shows the after-bar when the pointer is in its lower half', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('settings-open'))
    const sxo = screen.getByTestId('grow-SXO')
    document.elementFromPoint = () => sxo
    sxo.getBoundingClientRect = () => ({ top: 0, height: 20, bottom: 20, left: 0, right: 100, width: 100, x: 0, y: 0, toJSON() {} }) as DOMRect
    pointer('pointerdown', screen.getByTestId('gsdrag-IP'), { pointerType: 'mouse', button: 0, clientX: 10, clientY: 40, pointerId: 1 })
    pointer('pointermove', window, { pointerType: 'mouse', clientX: 10, clientY: 15, pointerId: 1 })
    expect(sxo.className).toContain('dragover after')
    pointer('pointermove', window, { pointerType: 'mouse', clientX: 10, clientY: 5, pointerId: 1 })
    expect(sxo.className).toContain('dragover')
    expect(sxo.className).not.toContain('after')
    pointer('pointerup', window, { pointerType: 'mouse', clientX: 10, clientY: 5, pointerId: 1, button: 0 })
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
