import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { displayRoster, getState, groupIdOf, groupsInOrder, initStore, rosterFollowsDefault, setQualCatalog, setRole, setRosterOrder } from '../state/store'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { LIFT_LAND_MS } from '../../ui/lift'
import { Matrix } from './Matrix'
import { SettingsSheet } from './SettingsSheet'
import { setLwOnScreen } from '../state/screen'
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
   navigation as drawn in round 19): the bar is [Manning | n red ›] · the open dates · … · Legend, the same for
   everyone (its − / + went with pinch to zoom — D1228, D1276, 23 Oct 26); ⚙ went up to the top row's right end, OIL became a tab there, and Rearrange's way in is a line in ⚙ — the bar
   carries only its "⇅ Done" while it is on. jsdom can't see the single line, but it pins the DOM: which controls live in
   the bar, in order, by role, and that the date/size text is gone. */
describe('the grid card\'s bar (D1254)', () => {
  const BAR = ['counts-toggle', 'undermanned', 'open-chip', 'legend-open']
  const inBar = (hd: Element) => [...hd.querySelectorAll('[data-testid]')].map(el => el.getAttribute('data-testid'))

  it('is Manning | n red · the open dates · Legend for an admin, with no ⚙, OIL, Rearrange or − / + and no date/size line', () => {
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
    // D1228, D1276: the grid is pinched (Ctrl+scroll on a desktop) — no − / + on the bar or anywhere on the page
    for (const id of ['lw-zoom', 'lw-zoom-out', 'lw-zoom-in']) expect(screen.queryByTestId(id), id).toBeNull()
  })

  it('is the same bar for a member — the view controls only', () => {
    render(<Matrix />)   // default role is member
    const hd = document.querySelector('.card-hd')!
    // D1254: "the same for everyone"
    expect(inBar(hd).filter(id => BAR.includes(id!))).toEqual(BAR)
    expect(hd.querySelector('[data-testid="settings-open"]')).toBeNull()
    expect(hd.querySelector('[data-testid="roster-arrange"]')).toBeNull()
    // no − / + for a member either (D1228, D1276) — nor on the month strip, where they once rode
    expect(screen.queryByTestId('lw-zoom')).toBeNull()
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
    // D1254: while it is on, the bar carries "⇅ Done", lit, in the bar before Legend
    const done = screen.getByTestId('roster-arrange')
    expect(done.classList.contains('on')).toBe(true)
    expect(done.getAttribute('aria-pressed')).toBe('true')
    expect(done.closest('.card-hd')).toBeTruthy()
    expect(done.closest('.mxhead')).toBeNull()
    const ids = inBar(document.querySelector('.card-hd')!)
    expect(ids.indexOf('roster-arrange')).toBeLessThan(ids.indexOf('legend-open'))
    // the old strip under the header (Auto-sort / Done) is gone (owner, 6 Sep 26)
    expect(screen.queryByTestId('rearrange-bar')).toBeNull()
    expect(screen.queryByTestId('roster-autosort')).toBeNull()
    expect(screen.queryByTestId('roster-arrange-done')).toBeNull()
  })

  /* WAS "the toggle reads ⇅ with the word on a droppable tail — icon-only on a phone" (Rearrange → Rearranging). Since
     D1254 the bar's button is the way out only. RE-EXPRESSED by D1275 (23 Oct 26): "⇅ Done" in words on a phone too — the
     word is never on the droppable tail the phone hides. The − / + it stepped aside for went with pinch to zoom (D1276). */
  it('Done reads "⇅ Done", its word never on the droppable tail (D1275)', () => {
    setRole('admin')
    render(<Matrix />)
    startRearrange()
    const btn = screen.getByTestId('roster-arrange')
    expect(btn.textContent!.replace(/\s+/g, ' ').trim()).toBe('⇅ Done')
    expect(btn.querySelector('.rtlbl')).toBeNull()
    expect(screen.queryByTestId('lw-zoom')).toBeNull()
    fireEvent.click(btn)
    expect(screen.queryByTestId('roster-arrange')).toBeNull()
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
    expect(screen.getByTestId('gadd-SANS')).toBeTruthy()   // "+ SANS" in place of the Show SANS switch (D1221, D1499)
    expect(screen.queryByTestId('counter-reset-all')).toBeNull()   // "Reset counters" left with the built-in counters (D669)
    // the groups editor is folded in
    expect(screen.getByTestId('group-reset')).toBeTruthy()
    // D1254: Rearrange's way in is here now — still no Auto-sort
    expect(screen.getByTestId('settings-rearrange')).toBeTruthy()
    expect(screen.queryByTestId('roster-autosort')).toBeNull()
  })

  it('"+ SANS" adds the SANS group row, whose ✕ hides SANS again (D1221)', () => {
    setRole('admin')
    render(<Matrix />)
    openSettings()
    // no SANS group row until it is added
    expect(screen.queryByTestId('grow-SANS')).toBeNull()
    fireEvent.click(screen.getByTestId('gadd-SANS'))
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
    // a press anywhere else in the sheet shuts it: hidden at the press, gone once the press resolves (F7, below)
    fireEvent.pointerDown(screen.getByTestId('settings-sheet'))
    expect(screen.getByTestId(`gpalette-${SCD}`).classList.contains('closing')).toBe(true)
    fireEvent.click(screen.getByTestId('settings-sheet'))
    expect(screen.queryByTestId(`gpalette-${SCD}`)).toBeNull()
  })

  /* NOTHING MOVES UNDER THE FINGER (the M5b walk's F7, 29 Oct 26). Adding a group opens its palette under its row; on a
     phone the next tap — on another "+" chip — closed the palette on the PRESS, the chips below slid up into its room,
     and the iPhone, which places the tap where the finger lifts, gave it to the chip that slid under the finger: "+ NVG"
     added for "+ SC DAY". The palette now hides at the press but keeps its room until the press resolves (its click, a
     cancel, or a short wait after the lift with no click), so the chip pressed is the chip that gets the tap. */
  it('F7: a press outside the palette hides it but keeps its room until the press resolves', () => {
    setRole('admin')
    if (!getState().qualCatalog.some(q => q.k === 'mgmt')) setQualCatalog([...getState().qualCatalog, { k: 'mgmt', label: 'Management' }])
    render(<Matrix />)
    openSettings()
    fireEvent.click(screen.getByTestId('gadd-q:mgmt'))
    const pal = screen.getByTestId('gpalette-q:mgmt')
    // the press on the next chip: the palette is hidden, still in the page (its room kept) — nothing below it moves
    fireEvent.pointerDown(screen.getByTestId(`gadd-${SCD}`))
    expect(screen.getByTestId('gpalette-q:mgmt')).toBe(pal)
    expect(pal.classList.contains('closing')).toBe(true)
    expect(pal.getAttribute('aria-hidden')).toBe('true')
    // the tap lands: the chip pressed adds ITS group, the old palette goes, the new group's palette opens
    fireEvent.click(screen.getByTestId(`gadd-${SCD}`))
    expect(screen.getByTestId(`grow-${SCD}`)).toBeTruthy()
    expect(screen.queryByTestId('gpalette-q:mgmt')).toBeNull()
    expect(screen.getByTestId(`gpalette-${SCD}`).classList.contains('closing')).toBe(false)
  })

  it('F7: a press that never becomes a tap (a scroll, a cancel) still closes the palette', () => {
    vi.useFakeTimers()
    try {
      setRole('admin')
      render(<Matrix />)
      openSettings()
      fireEvent.click(screen.getByTestId(`gadd-${SCD}`))
      // cancelled (the browser took the touch for a scroll): gone at once
      fireEvent.pointerDown(screen.getByTestId('settings-sheet'))
      fireEvent.pointerCancel(screen.getByTestId('settings-sheet'))
      act(() => { vi.runOnlyPendingTimers() })
      expect(screen.queryByTestId(`gpalette-${SCD}`)).toBeNull()
      // lifted with no click after it: gone after the short wait
      fireEvent.click(screen.getByTestId(`gcolor-${SCD}`))
      expect(screen.getByTestId(`gpalette-${SCD}`)).toBeTruthy()
      fireEvent.pointerDown(screen.getByTestId('settings-sheet'))
      fireEvent.pointerUp(screen.getByTestId('settings-sheet'))
      expect(screen.getByTestId(`gpalette-${SCD}`).classList.contains('closing')).toBe(true)
      act(() => { vi.advanceTimersByTime(1000) })
      expect(screen.queryByTestId(`gpalette-${SCD}`)).toBeNull()
    } finally { vi.useRealTimers() }
  })

  /* A GRIP ABOVE THE PALETTE starts a drag: the palette goes at once (its hidden room would be a gap a drop falls into —
     the fix read, 29 Oct 26); a grip below it keeps the hold, or it would jump under the finger. */
  it('F7: a press on a group’s grip above the open palette closes it at once; one below holds it', () => {
    setRole('admin')
    render(<Matrix />)
    openSettings()
    fireEvent.click(screen.getByTestId(`gadd-${SCD}`))              // its row goes above the categories, palette open
    fireEvent.pointerDown(screen.getByTestId('gsdrag-SXO'))         // a category's grip: below the palette
    expect(screen.getByTestId(`gpalette-${SCD}`).classList.contains('closing')).toBe(true)
    fireEvent.pointerUp(screen.getByTestId('gsdrag-SXO')); fireEvent.click(screen.getByTestId('gsdrag-SXO'))
    expect(screen.queryByTestId(`gpalette-${SCD}`)).toBeNull()
    fireEvent.click(screen.getByTestId(`gcolor-${SCD}`))
    fireEvent.pointerDown(screen.getByTestId(`gsdrag-${SCD}`))      // its own grip: above its palette
    expect(screen.queryByTestId(`gpalette-${SCD}`)).toBeNull()
  })

  /* F8 of the same walk ("a chip for a column nobody holds adds nothing") did not reproduce on the build (29 Oct 26 — a
     new column with no holder, desktop and phone, each added its group): what the walker met was F7's slide. Pinned. */
  it('F8: the chip of a Quals column nobody holds adds its group', () => {
    setRole('admin')
    setQualCatalog([...getState().qualCatalog, { k: 'nobodyq', label: 'NOBODY Q' }])
    expect(getState().people.some(p => (p as any).quals?.nobodyq)).toBe(false)
    render(<Matrix />)
    openSettings()
    fireEvent.click(screen.getByTestId('gadd-q:nobodyq'))
    expect(screen.getByTestId('grow-q:nobodyq')).toBeTruthy()
    expect(screen.getByTestId('grow-q:nobodyq').textContent).toContain('NOBODY Q')
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
    fireEvent.click(screen.getByTestId('gadd-SANS'))
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
    // its line went with D1499; the button's own title says so
    expect(btn().title).toBe('The roster is already in the default order')
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
    expect(btn().title).toBe('The roster is already in the default order')
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
  /* [LW-SETTINGS-SMALL] (2): the Leave War is kept mounted, so the sheet stays open across a page switch — an armed
     question must not wait there for one tap that would reset fifty rows */
  it('leaving the Leave War takes the question back, the sheet still open', () => {
    act(() => setLwOnScreen(true))
    setRosterOrder(['ramp', 'ace'])
    open()
    fireEvent.click(btn())
    expect(btn().textContent).toBe('Really reset?')
    act(() => setLwOnScreen(false))                                  // another page in front
    act(() => setLwOnScreen(true))                                   // and back
    expect(btn().textContent).toMatch(/Reset order/)
    fireEvent.click(btn())
    expect(getState().rosterOrder, 'the first tap after coming back only asks again').toEqual(['ramp', 'ace'])
  })
  /* [LW-SETTINGS-SMALL] (1): the line is judged over the men the grid draws (Matrix hands the sheet its row test) */
  it('a hand order that differs only for a man the grid does not draw is greyed, and lights once he is drawn', () => {
    /* two neighbours whose swap the grid draws (one group, one seat): the first adjacent pair whose swap is a hand order */
    const ids = displayRoster().map(p => p.id)
    let a = ''
    for (let i = 0; i + 1 < ids.length && !a; i++) {
      setRosterOrder([...ids.slice(0, i), ids[i + 1]!, ids[i]!, ...ids.slice(i + 2)])
      if (!rosterFollowsDefault()) a = ids[i]!
    }
    expect(a, 'a swap the grid draws').not.toBe('')
    const props = { onClose: () => {}, onAddCounter: () => {}, onDays: () => {} }
    const { unmount } = render(<SettingsSheet {...props} shown={p => p.id !== a} />)
    expect(btn().disabled, 'without him the grid draws the default').toBe(true)
    unmount()
    render(<SettingsSheet {...props} shown={() => true} />)
    expect(btn().disabled, 'with him drawn, it is a hand order').toBe(false)
  })
  /* the blind read's L2 (21 Oct 26): an armed question never waits on a greyed line — the grid scrolled to months where
     the order is the default, then back, must not leave one tap to reset */
  it('an armed "Really reset?" is taken back when the line greys under it', () => {
    const ids = displayRoster().map(p => p.id)
    let a = ''
    for (let i = 0; i + 1 < ids.length && !a; i++) {
      setRosterOrder([...ids.slice(0, i), ids[i + 1]!, ids[i]!, ...ids.slice(i + 2)])
      if (!rosterFollowsDefault()) a = ids[i]!
    }
    const props = { onClose: () => {}, onAddCounter: () => {}, onDays: () => {} }
    const { rerender } = render(<SettingsSheet {...props} shown={() => true} />)
    fireEvent.click(btn())
    expect(btn().textContent).toBe('Really reset?')
    rerender(<SettingsSheet {...props} shown={p => p.id !== a} />)          // scrolled to months that do not draw him
    expect(btn().disabled).toBe(true)
    rerender(<SettingsSheet {...props} shown={() => true} />)               // and back
    expect(btn().textContent).toMatch(/Reset order/)
    const order = getState().rosterOrder.slice()
    fireEvent.click(btn())
    expect(getState().rosterOrder, 'one tap only asks again').toEqual(order)
  })
})

/* THE SETTINGS WINDOW AS DRAWN IN M5b ROUND 1 (owner D1499, 29 Oct 26 — "All as recommended"; the drawing
   docs/mock/lw-overhaul/full/m5b/m5b-d1-settings-*; it answers D1205 "very wordy and not clean"). Label rows Year
   (Calendar…, Events…), Manning (＋ Counter, ＋ Event row) and Order (Rearrange the grid, Reset order); the groups with
   Everyone else as a greyed last row; "+ SANS" first among the add chips; the explanatory sentences gone. */
describe('the Settings window as drawn (D1499)', () => {
  beforeEach(() => { setRole('admin') })
  const rowOf = (lab: string) => [...document.querySelectorAll('[data-testid="settings-sheet"] .set-rows .bidsheet-row')]
    .find(r => r.querySelector('.lab')?.textContent === lab) as HTMLElement | undefined
  const ids = (el: Element | undefined) => [...(el?.querySelectorAll('button[data-testid]') ?? [])].map(b => b.getAttribute('data-testid'))

  it('its title is "SETTINGS" alone, and its three label rows carry their buttons in order', () => {
    render(<Matrix />)
    openSettings()
    const hd = screen.getByTestId('settings-sheet').querySelector('.bidsheet-hd')!
    expect(hd.querySelector('.who')!.textContent).toBe('SETTINGS')
    expect(hd.querySelector('.dt'), 'no "counters, rows & groups"').toBeNull()
    const labs = [...document.querySelectorAll('[data-testid="settings-sheet"] .set-rows .lab')].map(l => l.textContent)
    expect(labs).toEqual(['Year', 'Manning', 'Order'])
    expect(ids(rowOf('Year'))).toEqual(['settings-days', 'settings-events'])
    expect(ids(rowOf('Manning'))).toEqual(['counter-add', 'event-add'])
    expect(ids(rowOf('Order'))).toEqual(['settings-rearrange', 'roster-reset-order'])
    expect(screen.getByTestId('settings-events').textContent).toBe('Events…')
  })

  it('the trays, their headings and every explanatory sentence are gone', () => {
    render(<Matrix />)
    openSettings()
    const sheet = screen.getByTestId('settings-sheet')
    expect(sheet.querySelector('.set-tray'), 'no trays').toBeNull()
    expect(sheet.querySelector('.set-hint, .gs-hint, .gs-note'), 'no sentence at rest').toBeNull()
    expect(screen.queryByTestId('sans-toggle'), 'the Show SANS switch went (D1221)').toBeNull()
    const heads = [...sheet.querySelectorAll('.gs-sec')].map(h => h.textContent)
    expect(heads).toEqual(['Groups', 'Add a group'])
    expect(sheet.textContent).not.toMatch(/rarely needed/)
    expect(screen.getByTestId('who-wins-toggle').textContent).toMatch(/follows the page/)
  })

  it('"+ SANS" is the first add chip while SANS is off, and comes back when its row\'s ✕ takes SANS off (D1215)', () => {
    render(<Matrix />)
    openSettings()
    const chips = () => [...screen.getByTestId('group-offer').querySelectorAll('button')].map(b => b.textContent)
    expect(chips()[0]).toBe('+ SANS')
    fireEvent.click(screen.getByTestId('gadd-SANS'))
    expect(getState().showSans).toBe(true)
    expect(chips()).not.toContain('+ SANS')
    expect(screen.getByTestId('grow-SANS').textContent).toMatch(/shown · counted/)
    fireEvent.click(screen.getByTestId('gdrop-SANS'))
    expect(getState().showSans).toBe(false)
    expect(chips()[0]).toBe('+ SANS')
  })

  it('Everyone else is the last, greyed row — no grip, no colour, no ✕ — with "last" and its count', () => {
    render(<Matrix />)
    openSettings()
    const list = screen.getByTestId('group-chosen')
    const ee = screen.getByTestId('grow-OTHER')
    expect(list.lastElementChild).toBe(ee)
    expect(ee.classList.contains('other')).toBe(true)
    expect(ee.querySelector('.set-gname')!.textContent).toBe('Everyone else')
    expect(ee.querySelector('.set-gkd')!.textContent).toBe('last')
    expect(ee.querySelector('.set-gct')!.textContent, 'the standard groups claim everyone').toBe('0')
    expect(ee.querySelector('[data-testid^="gsdrag-"]'), 'it never moves').toBeNull()
    expect(ee.querySelector('button.set-gdel'), 'it cannot be removed').toBeNull()
    expect(ee.hasAttribute('data-grow'), 'a drag never lands on it').toBe(false)
    expect(ee.querySelector('.set-sw')!.classList.contains('set-swnone')).toBe(true)
  })

  it('Everyone else counts the people no group claims', () => {
    render(<Matrix />)
    openSettings()
    // drop every built-in group but SXO: everyone who is not an SXO falls to Everyone else
    for (const id of ['IP', 'OPSP', 'IWSO', 'OPSW', 'OCU', 'PERS']) fireEvent.click(screen.getByTestId(`gdrop-${id}`))
    const n = getState().people.filter(p => groupIdOf(p) === 'OTHER').length
    expect(n, 'the case: people no group claims').toBeGreaterThan(0)
    expect(screen.getByTestId('grow-OTHER').querySelector('.set-gct')!.textContent).toBe(String(n))
  })

  it('Events… closes Settings and opens the Events list', () => {
    render(<Matrix />)
    openSettings()
    fireEvent.click(screen.getByTestId('settings-events'))
    expect(screen.queryByTestId('settings-sheet')).toBeNull()
    expect(screen.getByTestId('events-sheet')).toBeTruthy()
  })
})
