import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { displayRoster, getState, groupsInOrder, initStore, setRole, setRosterOrder } from '../state/store'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { LIFT_LAND_MS } from '../../ui/lift'
import { Matrix } from './Matrix'
import { askLw } from './lwnav'

/* ⚙ stands at the top row's right end since D1254 (Chrome.tsx `Topbar`), outside the grid: the grid rendered alone is
   asked as the ⚙ press asks it (ui/lwnav.ts). */
const openSettings = () => act(() => { askLw({ kind: 'settings' }) })
/* Rearrange's way in is a line in ⚙ since D1254 ("⇅ Rearrange the grid"); the bar's "⇅ Done" is only the way out. */
const startRearrange = () => { openSettings(); fireEvent.click(screen.getByTestId('settings-rearrange')) }

beforeEach(() => {
  initStore(memoryBackend())
  elevenCounters()   // the app starts with NO counters (D669); these tests are about counters, so they make the old eleven — testkit
})

/* The grid card's ONE-ROW bar (owner, 5 Sep 26 — "all in 1 row to minimise row height space"; the old "JAN – DEC 26 ·
   365 days · 50 people" line dropped). WAS "Manning · ⚙ · Rearrange · OIL · − · +". CHANGED by D1254 (22 Oct 26 — the
   navigation as drawn in round 19): the bar is [Manning | n red ›] · the open dates · … · − + · Legend, the same for
   everyone; ⚙ went up to the top row's right end, OIL became a tab there, and Rearrange's way in is a line in ⚙ — the bar
   carries only its "⇅ Done" while it is on. jsdom can't see the single line, but it pins the DOM: which controls live in
   the bar, in order, by role, and that the date/size text is gone. */
describe('the grid card\'s bar (D1254)', () => {
  const BAR = ['counts-toggle', 'undermanned', 'open-chip', 'lw-zoom-out', 'lw-zoom-in', 'legend-open']
  const inBar = (hd: Element) => [...hd.querySelectorAll('[data-testid]')].map(el => el.getAttribute('data-testid'))

  it('is Manning | n red · the open dates · − + · Legend for an admin, with no ⚙, OIL or Rearrange and no date/size line', () => {
    setRole('admin')
    const { container } = render(<Matrix />)
    const hd = container.querySelector('.card-hd')!
    expect(hd).toBeTruthy()
    // the "… · 365 days · 50 people" line is gone
    expect(hd.textContent).not.toMatch(/days ·|· \d+ people/)
    // D1254: the controls in this one row, left to right in order (the test roster has red days, so "n red ›" is drawn — D1243)
    expect(inBar(hd).filter(id => BAR.includes(id!))).toEqual(BAR)
    // D1254: ⚙ and OIL are the top row's (Chrome.tsx `Topbar`), and Rearrange's way in is ⚙'s — none of them on this bar
    for (const id of ['settings-open', 'oil-tracker', 'roster-arrange']) expect(hd.querySelector(`[data-testid="${id}"]`), id).toBeNull()
  })

  it('is the same bar for a member — the view controls only', () => {
    render(<Matrix />)   // default role is member
    const hd = document.querySelector('.card-hd')!
    // D1254: "the same for everyone"
    expect(inBar(hd).filter(id => BAR.includes(id!))).toEqual(BAR)
    expect(hd.querySelector('[data-testid="settings-open"]')).toBeNull()
    expect(hd.querySelector('[data-testid="roster-arrange"]')).toBeNull()
    // the zoom no longer rides the month strip
    expect(screen.getByTestId('month-strip').querySelector('[data-testid="lw-zoom"]')).toBeNull()
  })

  it('⚙ → "⇅ Rearrange the grid" turns arrange mode on — the sheet closes, the grips appear, the column widens, the bar carries Done', () => {
    setRole('admin')
    render(<Matrix />)
    const outer = () => document.querySelector('.mx-outer')!
    expect(screen.queryByTestId('manning-drag-sets')).toBeNull()
    expect(outer().classList.contains('mx-arranging')).toBe(false)
    // D1254: the way in is a line in ⚙, and it closes the sheet so the grid is in reach
    openSettings()
    expect(screen.getByTestId('settings-rearrange').textContent!.trim()).toBe('⇅ Rearrange the grid')
    fireEvent.click(screen.getByTestId('settings-rearrange'))
    expect(screen.queryByTestId('settings-sheet')).toBeNull()
    expect(screen.getByTestId('manning-drag-sets')).toBeTruthy()
    expect(outer().classList.contains('mx-arranging')).toBe(true)
    // D1254: while it is on, the bar carries "⇅ Done", lit, in the bar before the zoom pair
    const done = screen.getByTestId('roster-arrange')
    expect(done.classList.contains('on')).toBe(true)
    expect(done.getAttribute('aria-pressed')).toBe('true')
    expect(done.closest('.card-hd')).toBeTruthy()
    expect(done.closest('.mxhead')).toBeNull()
    const ids = inBar(document.querySelector('.card-hd')!)
    expect(ids.indexOf('roster-arrange')).toBeLessThan(ids.indexOf('lw-zoom-out'))
    // the old strip under the header (Auto-sort / Done) is gone (owner, 6 Sep 26)
    expect(screen.queryByTestId('rearrange-bar')).toBeNull()
    expect(screen.queryByTestId('roster-autosort')).toBeNull()
    expect(screen.queryByTestId('roster-arrange-done')).toBeNull()
  })

  /* WAS "the toggle reads ⇅ with the word on a droppable tail — icon-only on a phone" (Rearrange → Rearranging). Since
     D1254 the bar's button is the way out only. RE-EXPRESSED by D1275 (23 Oct 26): "⇅ Done" in words on a phone too — the
     word is never on the droppable tail the phone hides — and while it is on, the − / + are marked to step aside (the
     phone's stylesheet hides them; the browser test "while rearranging, the bar reads ⇅ Done" measures it). */
  it('Done reads "⇅ Done", its word never on the droppable tail; the − / + step aside while it is on (D1275)', () => {
    setRole('admin')
    render(<Matrix />)
    expect(screen.getByTestId('lw-zoom').classList.contains('aside')).toBe(false)
    startRearrange()
    const btn = screen.getByTestId('roster-arrange')
    expect(btn.textContent!.replace(/\s+/g, ' ').trim()).toBe('⇅ Done')
    expect(btn.querySelector('.rtlbl')).toBeNull()
    expect(screen.getByTestId('lw-zoom').classList.contains('aside')).toBe(true)
    fireEvent.click(btn)
    expect(screen.getByTestId('lw-zoom').classList.contains('aside')).toBe(false)
  })
})

/* The one ⚙ SETTINGS button (owner, 3 Sep 26): every admin config control folds into the sheet it opens. WAS "Rearranging
   is NOT in the sheet — it is its own toggle in the top row (owner, 5 Sep 26)". CHANGED by D1254: Rearrange's way in is a
   line in the sheet; the rearranging itself still happens hands-on-grid. */
describe('the ⚙ Settings sheet', () => {
  it('is admin-only, and folds the config controls into one sheet', () => {
    // a member has no sheet, and none of the controls it holds — even asked for (⚙ is an admin's only, D1254)
    const member = render(<Matrix />)
    openSettings()
    expect(screen.queryByTestId('settings-sheet')).toBeNull()
    expect(screen.queryByTestId('counter-add')).toBeNull()
    member.unmount()

    setRole('admin')
    const { rerender } = render(<Matrix />)
    openSettings()
    rerender(<Matrix />)
    expect(screen.getByTestId('settings-sheet')).toBeTruthy()
    // counters & rows live here now
    expect(screen.getByTestId('counter-add')).toBeTruthy()
    expect(screen.getByTestId('event-add')).toBeTruthy()
    expect(screen.getByTestId('sans-toggle')).toBeTruthy()
    expect(screen.queryByTestId('counter-reset-all')).toBeNull()   // "Reset counters" left with the built-in counters (D669)
    // the groups editor is folded in
    expect(screen.getByTestId('group-reset')).toBeTruthy()
    // D1254: Rearrange's way in is here now — still no Auto-sort
    expect(screen.getByTestId('settings-rearrange')).toBeTruthy()
    expect(screen.queryByTestId('roster-autosort')).toBeNull()
  })

  it('Show SANS adds the SANS group row, whose ✕ hides SANS again', () => {
    setRole('admin')
    render(<Matrix />)
    openSettings()
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
    openSettings()
    expect(screen.queryByTestId('group-priority')).toBeNull()
    fireEvent.click(screen.getByTestId('who-wins-toggle'))
    expect(screen.getByTestId('group-priority')).toBeTruthy()
  })
})

/* Rearranging happens ON THE GRID (owner, 3 Sep 26 — "I thought the rearrange could be done on the grid main page
   itself"); the strip with Auto-sort + Done that used to sit under the header is gone. WAS "the header ⇅ turns it on, and
   the SAME ⇅ turns it off (owner, 6 Sep 26)". CHANGED by D1254: the way in is ⚙'s line, and the bar's "⇅ Done" — drawn
   only while it is on — is the one way out, as that ⇅ was. */
describe('on-grid rearrange', () => {
  it('⚙\'s line turns rearrange mode on, and the bar\'s Done ends it — and goes with it', () => {
    setRole('admin')
    const { rerender } = render(<Matrix />)
    const grips = () => document.querySelectorAll('[data-testid^="drag-"]').length
    expect(grips()).toBe(0)
    expect(screen.queryByTestId('roster-arrange')).toBeNull()          // D1254: no Done while it is off
    startRearrange()
    rerender(<Matrix />)
    expect(grips()).toBeGreaterThan(0)
    expect(screen.getByTestId('roster-arrange').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByTestId('roster-arrange'))
    rerender(<Matrix />)
    expect(grips()).toBe(0)
    expect(screen.queryByTestId('roster-arrange')).toBeNull()          // D1254: Done leaves with the mode
    expect(document.querySelector('.mx-outer')!.classList.contains('mx-arranging')).toBe(false)
  })

  it('a member has no way into Rearrange', () => {
    render(<Matrix />)
    expect(screen.queryByTestId('roster-arrange')).toBeNull()
    // D1254: the way in is ⚙'s line — a member asking for ⚙ gets no sheet
    openSettings()
    expect(screen.queryByTestId('settings-rearrange')).toBeNull()
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
    openSettings()
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
    openSettings()
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
    openSettings()
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
    openSettings()
    fireEvent.click(screen.getByTestId(`gadd-${SCD}`))
    ;(getState() as any).groupColors[SCD] = '#7bc043'
    fireEvent.click(screen.getByTestId(`gcolor-${SCD}`))   // close
    fireEvent.click(screen.getByTestId(`gcolor-${SCD}`))   // reopen, re-read
    expect(screen.getByTestId(`gdot-${SCD}-7bc043`).className).toContain('on')
  })

  it('a built-in category has no colour button — it wears its CAT colour', () => {
    setRole('admin')
    render(<Matrix />)
    openSettings()
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
  const pointer = (type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel', target: EventTarget, init: PointerEventInit) =>
    act(() => { target.dispatchEvent(new PointerEvent(type, { bubbles: true, ...init })) })

  it('dragging IP above SXO puts IP first on the page', () => {
    setRole('admin')
    render(<Matrix />)
    openSettings()
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
  /* ONE LINE A GAP (owner D890, D891 — "Yes fix them too"): the lower half of a row and the upper half of the row
     below it are one drop, so they draw ONE bar — on the top of the row below. Only the last movable row (the SANS
     row under it never moves) keeps its bar on its foot. */
  const growRows = () => [...document.querySelectorAll('[data-testid="group-chosen"] [data-grow]')] as HTMLElement[]
  const lowerHalf = (el: HTMLElement) => { el.getBoundingClientRect = () => ({ top: 0, height: 20, bottom: 20, left: 0, right: 100, width: 100, x: 0, y: 0, toJSON() {} }) as DOMRect }
  it('the lower half of a row draws the bar on the top of the row below — one bar a gap', () => {
    setRole('admin')
    render(<Matrix />)
    openSettings()
    const rows = growRows()
    expect(rows.length).toBeGreaterThanOrEqual(3)
    const [a, b, c] = rows as [HTMLElement, HTMLElement, HTMLElement]
    expect(a.nextElementSibling).toBe(b)                                         // the case: two rows side by side
    document.elementFromPoint = () => a
    lowerHalf(a)
    pointer('pointerdown', c.querySelector('[data-testid^="gsdrag-"]')!, { pointerType: 'mouse', button: 0, clientX: 10, clientY: 40, pointerId: 1 })
    pointer('pointermove', window, { pointerType: 'mouse', clientX: 10, clientY: 15, pointerId: 1 })
    expect(b.className).toContain('dragover')
    expect(b.className).not.toContain('after')
    expect(a.className).not.toContain('dragover')
    pointer('pointermove', window, { pointerType: 'mouse', clientX: 10, clientY: 5, pointerId: 1 })   // the upper half: the same row's top
    expect(a.className).toContain('dragover')
    expect(a.className).not.toContain('after')
    pointer('pointerup', window, { pointerType: 'mouse', clientX: 10, clientY: 5, pointerId: 1, button: 0 })
  })
  it('the last movable row keeps its bar on its foot — nothing it can land before follows it', () => {
    setRole('admin')
    render(<Matrix />)
    openSettings()
    const rows = growRows()
    const last = rows[rows.length - 1]!, first = rows[0]!
    expect(last.nextElementSibling?.hasAttribute('data-grow') ?? false).toBe(false)  // the case
    document.elementFromPoint = () => last
    lowerHalf(last)
    pointer('pointerdown', first.querySelector('[data-testid^="gsdrag-"]')!, { pointerType: 'mouse', button: 0, clientX: 10, clientY: 40, pointerId: 1 })
    pointer('pointermove', window, { pointerType: 'mouse', clientX: 10, clientY: 15, pointerId: 1 })
    expect(last.className).toContain('dragover after')
    pointer('pointercancel', window, { pointerType: 'mouse', clientX: 10, clientY: 15, pointerId: 1 })
  })

  it('the SANS row has no grip — it is always at the foot', () => {
    setRole('admin')
    render(<Matrix />)
    openSettings()
    fireEvent.click(screen.getByTestId('sans-toggle'))
    expect(screen.queryByTestId('gsdrag-SANS')).toBeNull()
    expect(screen.getByTestId('gsdrag-IP')).toBeTruthy()
  })
})

/* ONE LIFT, EVERY DRAG (owner, 6 Sep 26): these two lists are React-managed
   rows, so the picked-up look rides the prop-driven `dragging` class instead
   of an imperative `.lift` (matrix.css .set-grow.dragging / .crow-wrap.gs-row
   .dragging, pinned as a CSS contract in rowglow.test.ts) — an imperative
   class here would be wiped by the very re-render the arm causes. What that
   CSS pin cannot see is the DOM half: that `dragging` actually appears and
   disappears through the real pointer path, and that the row landOn's once
   the store's move has re-rendered it (design: "Finding the landed thing" —
   GROUP_DRAG serves the grid heading too, so the landed row is found OUTSIDE
   `.mx-wrap`). */
describe('one lift, every drag — the ⚙ lists (6 Sep 26)', () => {
  const origEFP = document.elementFromPoint
  afterEach(async () => {
    document.elementFromPoint = origEFP
    vi.useRealTimers()
    await new Promise(r => setTimeout(r, 0))
  })
  const pointer = (type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel', target: EventTarget, init: PointerEventInit) =>
    act(() => { target.dispatchEvent(new PointerEvent(type, { bubbles: true, ...init })) })
  // A row's own rect, mocked so "hover the fourth row" resolves to its LOWER
  // half (the after-bar test's same rect) — jsdom lays nothing out for real.
  const lowerHalfRect = () => ({ top: 0, height: 20, bottom: 20, left: 0, right: 100, width: 100, x: 0, y: 0, toJSON() {} }) as DOMRect

  it('the row being dragged wears the recipe through its dragging class, and the moved row flashes once', () => {
    vi.useFakeTimers()
    setRole('admin')
    render(<Matrix />)
    openSettings()
    // arm on the Groups list's second row (IP), hover the fourth row's
    // (IWSO) lower half, release — drops IP just after IWSO.
    const iwso = screen.getByTestId('grow-IWSO')
    document.elementFromPoint = () => iwso
    iwso.getBoundingClientRect = lowerHalfRect
    pointer('pointerdown', screen.getByTestId('gsdrag-IP'), { pointerType: 'mouse', button: 0, clientX: 10, clientY: 40, pointerId: 1 })
    // picked up: the row wears the recipe through the class React writes,
    // the same class the grid's own dragging row wears.
    expect(screen.getByTestId('grow-IP').className).toMatch(/\bdragging\b/)
    pointer('pointermove', window, { pointerType: 'mouse', clientX: 10, clientY: 15, pointerId: 1 })
    pointer('pointerup', window, { pointerType: 'mouse', clientX: 10, clientY: 15, pointerId: 1, button: 0 })
    // landed: `[data-grow="IP"]` outside `.mx-wrap` — the grid heading can
    // carry the same attribute, which is exactly why the lookup excludes it.
    const moved = document.querySelector('[data-grow="IP"]:not(.mx-wrap [data-grow])') as HTMLElement
    expect(moved.className).not.toMatch(/\bdragging\b/)
    expect(moved.classList.contains('lift-land')).toBe(true)
    vi.advanceTimersByTime(LIFT_LAND_MS + 50)
    expect(moved.classList.contains('lift-land')).toBe(false)
  })

  it('the who-wins list lands the same way', () => {
    vi.useFakeTimers()
    setRole('admin')
    render(<Matrix />)
    openSettings()
    fireEvent.click(screen.getByTestId('who-wins-toggle'))   // tucked behind a disclosure
    const iwso = screen.getByTestId('gprio-IWSO')
    document.elementFromPoint = () => iwso
    iwso.getBoundingClientRect = lowerHalfRect
    pointer('pointerdown', screen.getByTestId('gpdrag-IP'), { pointerType: 'mouse', button: 0, clientX: 10, clientY: 40, pointerId: 1 })
    expect(screen.getByTestId('gprio-IP').className).toMatch(/\bdragging\b/)
    pointer('pointermove', window, { pointerType: 'mouse', clientX: 10, clientY: 15, pointerId: 1 })
    pointer('pointerup', window, { pointerType: 'mouse', clientX: 10, clientY: 15, pointerId: 1, button: 0 })
    const moved = document.querySelector('[data-gprio="IP"]') as HTMLElement
    expect(moved.className).not.toMatch(/\bdragging\b/)
    expect(moved.classList.contains('lift-land')).toBe(true)
    vi.advanceTimersByTime(LIFT_LAND_MS + 50)
    expect(moved.classList.contains('lift-land')).toBe(false)
  })

  /* ONE LINE A GAP on the who-wins list too (owner D891): a row's lower half draws the bar on the row below */
  it('the who-wins list draws one bar a gap — a row’s lower half marks the top of the row below', () => {
    setRole('admin')
    render(<Matrix />)
    openSettings()
    fireEvent.click(screen.getByTestId('who-wins-toggle'))
    const rows = [...document.querySelectorAll('[data-testid="group-priority"] [data-gprio]')] as HTMLElement[]
    const [a, b, c] = rows as [HTMLElement, HTMLElement, HTMLElement]
    expect(a.nextElementSibling).toBe(b)                                         // the case: two rows side by side
    document.elementFromPoint = () => a
    a.getBoundingClientRect = lowerHalfRect
    pointer('pointerdown', c.querySelector('[data-testid^="gpdrag-"]')!, { pointerType: 'mouse', button: 0, clientX: 10, clientY: 40, pointerId: 1 })
    pointer('pointermove', window, { pointerType: 'mouse', clientX: 10, clientY: 15, pointerId: 1 })
    expect(b.className).toMatch(/\bdragover\b/)
    expect(b.className).not.toMatch(/\bafter\b/)
    expect(a.className).not.toMatch(/\bdragover\b/)
    pointer('pointercancel', window, { pointerType: 'mouse', clientX: 10, clientY: 15, pointerId: 1 })
  })

  it('a pointercancel leaves neither class behind', () => {
    setRole('admin')
    render(<Matrix />)
    openSettings()
    pointer('pointerdown', screen.getByTestId('gsdrag-IP'), { pointerType: 'mouse', button: 0, clientX: 10, clientY: 40, pointerId: 1 })
    expect(screen.getByTestId('grow-IP').className).toMatch(/\bdragging\b/)
    pointer('pointercancel', window, { pointerType: 'mouse', pointerId: 1 })
    const row = screen.getByTestId('grow-IP')
    expect(row.className).not.toMatch(/\bdragging\b/)
    expect(row.classList.contains('lift')).toBe(false)
    expect(row.classList.contains('lift-land')).toBe(false)
  })
})

/* ⚙ Settings → RESET ORDER (owner, D160, 24 Sep 26 — "9 yes" to a "Reset order" line in ⚙ Settings; no button on the
   grid, no strip). It asks once, like Reset counters beside it — a hand arrangement of fifty rows is real work — and it
   is greyed when the roster already follows the default, with a line saying so, so a press never looks like it did
   nothing. The store half (clearing the saved order, admin-only, one Undo step) is pinned in roster.test.ts and
   undoaudit.test.ts. */
describe('⚙ Settings — Reset order', () => {
  /* the role first: a hand order is an admin's write, and the store refuses it from anyone else */
  beforeEach(() => { setRole('admin') })
  const open = () => { render(<Matrix />); openSettings() }
  const btn = () => screen.getByTestId('roster-reset-order') as HTMLButtonElement
  it('is in the sheet, greyed while the roster follows the default, and says so', () => {
    open()
    expect(getState().rosterOrder).toEqual([])
    expect(btn().disabled).toBe(true)
    expect(btn().textContent).toMatch(/Reset order/)
    expect(screen.getByTestId('roster-order-hint').textContent).toMatch(/default order/)
  })
  it('asks once, then puts a hand-arranged roster back in the default order', () => {
    setRosterOrder(['ramp', 'ace'])
    open()
    expect(btn().disabled).toBe(false)
    fireEvent.click(btn())
    expect(btn().textContent).toBe('Really reset?')
    expect(getState().rosterOrder, 'the first tap only asks').toEqual(['ramp', 'ace'])
    fireEvent.click(btn())
    expect(getState().rosterOrder).toEqual([])
    expect(btn().disabled, 'greyed again once it follows the default').toBe(true)
    expect(btn().textContent).toMatch(/Reset order/)
  })
  it('a saved order that draws exactly the default reads as the default — greyed (a drag away and back, Fable F10)', () => {
    setRosterOrder(displayRoster().map(p => p.id))
    expect(getState().rosterOrder.length).toBeGreaterThan(0)
    open()
    expect(btn().disabled).toBe(true)
    expect(screen.getByTestId('roster-order-hint').textContent).toMatch(/In the default order/)
  })
  /* (W2's walk, 26 Sep 26, had Reset counters and Reset order take each other's "Really reset?" back. Reset counters is
     gone — D669, 8 Oct 26 — so Reset order's is the only such question on the sheet; its test went with the button.) */
  it('closing the sheet takes the question back', () => {
    setRosterOrder(['ramp', 'ace'])
    open()
    fireEvent.click(btn())
    expect(btn().textContent).toBe('Really reset?')
    fireEvent.click(screen.getByTestId('settings-close'))
    openSettings()
    expect(btn().textContent).toMatch(/Reset order/)
    expect(getState().rosterOrder).toEqual(['ramp', 'ace'])
  })
})
