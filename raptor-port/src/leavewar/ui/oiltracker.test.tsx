import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { balanceOf } from '../engine'
import { getState, ingestDutyCredit, initStore, setCell, setOilPolicy, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
})

const openTracker = () => {
  render(<Matrix />)
  fireEvent.click(screen.getByTestId('oil-tracker'))
  return screen.getByTestId('oil-sheet')
}

/** An earned day (with the sync wire's note) and a day taken for SLAMMED (no
 *  opening figure, no grants), so the FIFO story is one credit and one debit. */
function slammedStory() {
  setRole('admin')
  expect(ingestDutyCredit('slammed', '2026-01-03', 'FO', 'FLT')).toBe('written')   // a Saturday
  setCell('slammed', '2026-01-12', 'OIL')
}

describe('the OIL tracker grid', () => {
  it('is on the toolbar for a member and an admin alike: one row per person, the balance beside the name', () => {
    const sheet = openTracker()
    expect(sheet.textContent).toContain('OIL TRACKER')
    expect(sheet.className).toContain('full')
    const { openings, ledger, wars, people } = getState()
    expect(screen.getAllByTestId(/^oil-row-/)).toHaveLength(people.length)
    // The figure is the same number the column shows (no expiry policy).
    expect(screen.getByTestId('oil-bal-ramp').textContent).toBe(String(balanceOf(openings, ledger, wars, 'ramp', 'oil')))
    expect(screen.getByTestId('oil-bal-decal').textContent).toContain('-')
    // Group headings, in the grid's order; the year lanes as a header row.
    expect(screen.getByTestId('oil-grp-SXO')).toBeTruthy()
    expect(screen.getByTestId('oil-year-2026')).toBeTruthy()
    // A member reads only: the name is not a pick target, no settings, no bar.
    expect(screen.getByTestId('oil-name-ramp').getAttribute('role')).toBeNull()
    expect(screen.queryByTestId('oil-settings')).toBeNull()
    expect(screen.queryByTestId('oil-bar-idle')).toBeNull()
    expect(screen.queryByTestId('oil-credit-panel')).toBeNull()
  })

  it('the admin sees the same grid, plus settings and the idle credit bar', () => {
    setRole('admin')
    openTracker()
    expect(screen.getByTestId('oil-settings')).toBeTruthy()
    expect(screen.getByTestId('oil-bar-idle').textContent).toContain('hold and drag')
    expect(screen.getByTestId('oil-name-ramp').getAttribute('role')).toBe('button')
  })

  it('the ? chip opens the legend', () => {
    openTracker()
    expect(screen.queryByTestId('oil-legend-text')).toBeNull()
    fireEvent.click(screen.getByTestId('oil-legend'))
    expect(screen.getByTestId('oil-legend-text').textContent).toContain('oldest credit is used first')
  })
})

describe('the Cinch sheet hands over to the tracker', () => {
  it('OIL BAL opens the tracker on that person\'s row; other rows still open their breakdown', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    fireEvent.click(screen.getByTestId('pfig-oilbal').querySelector('.crow')!)
    expect(screen.queryByTestId('person-figures')).toBeNull()
    expect(screen.getByTestId('oil-sheet')).toBeTruthy()
    expect(screen.getByTestId('oil-row-ramp').className).toContain('here')
  })
})

describe('the credit boxes', () => {
  it('an earned day is a box that lists the day taken from it, reads its note as the reason, and strikes out once used up', () => {
    slammedStory()
    setRole('member')
    openTracker()
    // The window opens on everything on record (owner, 2 Sep 26) — but a
    // used-up credit sits in the ARCHIVE until that column is tapped: the
    // row reads idle, its archive cell counts one.
    expect(screen.getByTestId('oil-window').textContent).toMatch(/– today$/)
    expect(screen.getByTestId('oil-range-first').className).toContain(' on')
    expect(screen.queryByTestId('oil-entry-slammed-auto:0:2026-01-03')).toBeNull()
    expect(screen.getByTestId('oil-row-slammed').className).toContain('idle')
    expect(screen.getByTestId('oil-arch-slammed').textContent).toBe('1')
    expect(screen.getByTestId('oil-archive').getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(screen.getByTestId('oil-archive'))
    expect(screen.getByTestId('oil-archive').getAttribute('aria-pressed')).toBe('true')
    const credit = screen.getByTestId('oil-entry-slammed-auto:0:2026-01-03')
    expect(credit.className).toContain('used')
    expect(credit.textContent).toContain('+1')
    expect(credit.textContent).toContain('3 Jan')
    expect(credit.textContent).toContain('FLT')
    expect(credit.textContent).toContain('Auto')
    // The take sits INSIDE the box it drew from, with what is left.
    expect(credit.textContent).toContain('−1 12 Jan')
    expect(screen.getByTestId('oil-status-slammed-auto:0:2026-01-03').textContent).toBe('0 left')
    // Covered takes get no box of their own.
    expect(screen.queryByTestId('oil-entry-take:0:2026-01-12')).toBeNull()
    expect(screen.getByTestId('oil-bal-slammed').textContent).toBe('0')
    expect(screen.getByTestId('oil-pm-slammed').textContent).toBe('+1−1')
    // A second tap folds the archive away again; a tap on the row's own
    // archive cell is the same switch.
    fireEvent.click(screen.getByTestId('oil-archive'))
    expect(screen.queryByTestId('oil-entry-slammed-auto:0:2026-01-03')).toBeNull()
    fireEvent.click(screen.getByTestId('oil-arch-slammed'))
    expect(screen.getByTestId('oil-entry-slammed-auto:0:2026-01-03')).toBeTruthy()
  })

  it('every take is its own row and "n left" is the last thing in the box; a part-drawn credit is never archived', () => {
    setRole('admin')
    expect(ingestDutyCredit('slammed', '2026-01-03', 'FO', 'FLT')).toBe('written')
    expect(ingestDutyCredit('slammed', '2026-01-10', 'FO', 'SIM')).toBe('written')
    setCell('slammed', '2026-01-12', '*OIL')
    setCell('slammed', '2026-01-13', 'OIL*')
    setCell('slammed', '2026-01-20', '*OIL')
    openTracker()
    // 1.5 taken from the oldest credit (used up, archived) and the rest
    // from the next (0.5 left — still on the strip, with its one take).
    expect(screen.queryByTestId('oil-entry-slammed-auto:0:2026-01-03')).toBeNull()
    const live = screen.getByTestId('oil-entry-slammed-auto:0:2026-01-10')
    expect(live.className).not.toContain('used')
    expect(live.querySelectorAll('.tk1')).toHaveLength(1)
    fireEvent.click(screen.getByTestId('oil-archive'))
    const used = screen.getByTestId('oil-entry-slammed-auto:0:2026-01-03')
    const takes = [...used.querySelectorAll('.tk1')].map(x => x.textContent)
    expect(takes).toEqual(['−0.5 12 Jan', '−0.5 13 Jan'])
    const l3 = used.querySelector('.l3')!
    expect(l3.lastElementChild!.getAttribute('data-testid')).toBe('oil-status-slammed-auto:0:2026-01-03')
    expect(l3.lastElementChild!.textContent).toBe('0 left')
  })

  it('the CAT chip sits under the name on every row, idle ones included', () => {
    openTracker()
    for (const id of ['ramp', 'switcher']) {
      const cell = screen.getByTestId(`oil-name-${id}`)
      expect(cell.children[0]!.className).toBe('who')
      expect(cell.children[1]!.className).toContain('catchip')
    }
    expect(screen.getByTestId('oil-row-switcher').className).toContain('idle')
  })

  it('a day taken with nothing to draw from is its own red box, and the balance reads negative', () => {
    openTracker()
    fireEvent.click(screen.getByTestId('oil-range-first'))
    // The seed's DECAL carries a negative opening figure.
    expect(screen.getByTestId('oil-bal-decal').className).toContain('neg')
    const takes = screen.getAllByTestId(/^oil-entry-decal-open:decal/)
    expect(takes[0]!.className).toContain('take')
    expect(takes[0]!.textContent).toContain('not covered')
  })

  it('a picked date range narrows the window; a credit stays while a day taken from it is inside', () => {
    slammedStory()
    openTracker()
    fireEvent.click(screen.getByTestId('oil-range-pick'))
    // The picker opens on this month; page back to January 2026.
    for (let i = 0; i < 240 && !screen.queryByTestId('oilrange-day-2026-01-05'); i++) {
      fireEvent.click(screen.getByTestId('oilrange-prev-month'))
    }
    // 5 Jan – 31 Jan holds the day taken but not the earned day itself —
    // the box still shows, because its take is in the window.
    fireEvent.click(screen.getByTestId('oilrange-day-2026-01-05'))
    fireEvent.click(screen.getByTestId('oilrange-day-2026-01-31'))
    expect(screen.getByTestId('oil-window').textContent).toBe('5 Jan 26 – 31 Jan 26')
    fireEvent.click(screen.getByTestId('oil-archive'))   // the credit is used up
    expect(screen.getByTestId('oil-entry-slammed-auto:0:2026-01-03')).toBeTruthy()
    // 20 Jan – 31 Jan holds neither: the row is idle.
    fireEvent.click(screen.getByTestId('oilrange-day-2026-01-20'))
    fireEvent.click(screen.getByTestId('oilrange-day-2026-01-31'))
    expect(screen.queryByTestId('oil-entry-slammed-auto:0:2026-01-03')).toBeNull()
    expect(screen.getByTestId('oil-row-slammed').className).toContain('idle')
  })

  it('a grant box shows who gave it; an admin taps it to edit (given by too) and deletes with two taps', () => {
    setRole('admin')
    openTracker()
    fireEvent.click(screen.getByTestId('oil-range-first'))
    // The seed's CNY grant, l4, on JAGUAR.
    const box = screen.getByTestId('oil-entry-l4')
    expect(box.textContent).toContain('CNY workplan')
    expect(box.className).toContain('grant')
    fireEvent.click(box)
    fireEvent.change(screen.getByTestId('oil-edit-amt'), { target: { value: '3' } })
    fireEvent.change(screen.getByTestId('oil-edit-reason'), { target: { value: 'CNY workplan (three days)' } })
    fireEvent.change(screen.getByTestId('oil-edit-given'), { target: { value: 'OC Ops' } })
    fireEvent.click(screen.getByTestId('oil-edit-save'))
    expect(getState().ledger.find(e => e.id === 'l4')).toMatchObject({ amount: 3, reason: 'CNY workplan (three days)', givenBy: 'OC Ops' })
    expect(screen.getByTestId('oil-entry-l4').textContent).toContain('+3')
    expect(screen.getByTestId('oil-entry-l4').textContent).toContain('OC Ops')
    // The column snapped to OIL BAL on the edit.
    expect(screen.getByTestId('counter-name').textContent).toBe('OIL BAL')
    fireEvent.click(screen.getByTestId('oil-entry-l4'))
    fireEvent.click(screen.getByTestId('oil-del-l4'))
    expect(screen.getByTestId('oil-del-l4').textContent).toBe('Really delete?')
    fireEvent.click(screen.getByTestId('oil-del-l4'))
    expect(getState().ledger.some(e => e.id === 'l4')).toBe(false)
    expect(screen.queryByTestId('oil-entry-l4')).toBeNull()
  })

  it('a hand-typed FO reads "typed by admin" until the admin writes its reason', () => {
    setRole('admin')
    act(() => { setCell('slammed', '2026-01-10', 'HO') })   // a Saturday, typed on the grid
    openTracker()
    fireEvent.click(screen.getByTestId('oil-range-first'))
    const box = screen.getByTestId('oil-entry-slammed-auto:0:2026-01-10')
    expect(box.textContent).toContain('+0.5')
    expect(box.textContent).not.toContain('Auto')
    fireEvent.click(screen.getByTestId('oil-note-slammed-auto:0:2026-01-10'))
    fireEvent.change(screen.getByTestId('oil-note-input'), { target: { value: 'SIM' } })
    fireEvent.click(screen.getByTestId('oil-note-save'))
    expect(getState().wars[0]!.states.slammed!['2026-01-10']).toMatchObject({ note: 'SIM' })
    expect(screen.getByTestId('oil-entry-slammed-auto:0:2026-01-10').textContent).toContain('SIM')
  })
})

describe('crediting OIL (admin)', () => {
  it('a tap on a name picks it; the bar credits a dated, reasoned grant with an optional given-by, and the column shows OIL BAL', () => {
    setRole('admin')
    openTracker()
    expect(screen.getByTestId('oil-bal-slammed').textContent).toBe('0')
    fireEvent.click(screen.getByTestId('oil-name-slammed'))
    expect(screen.getByTestId('oil-row-slammed').className).toContain(' on')
    expect(screen.getByTestId('oil-credit-who').textContent).toBe('Credit SLAMMED')
    expect(screen.queryByTestId('oil-bar-idle')).toBeNull()
    fireEvent.change(screen.getByTestId('oil-amt'), { target: { value: '1.5' } })
    fireEvent.change(screen.getByTestId('oil-reason'), { target: { value: 'Det recovery' } })
    fireEvent.change(screen.getByTestId('oil-given'), { target: { value: 'CO' } })
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(getState().ledger.at(-1)).toMatchObject({ personId: 'slammed', counter: 'oil', amount: 1.5, reason: 'Det recovery', approvedBy: 'admin', givenBy: 'CO' })
    expect(screen.getByTestId('oil-bal-slammed').textContent).toBe('1.5')
    expect(screen.queryByTestId('oil-credit-panel')).toBeNull()
    expect(screen.getByTestId('oil-bar-idle')).toBeTruthy()
    const box = screen.getByTestId(`oil-entry-${getState().ledger.at(-1)!.id}`)
    expect(box.textContent).toContain('Det recovery')
    expect(box.textContent).toContain('CO')
    expect(box.textContent).toContain('1.5 left')
    expect(screen.getByTestId('counter-name').textContent).toBe('OIL BAL')
  })

  it('a bad grant is refused with the reason, and nothing is written', () => {
    setRole('admin')
    openTracker()
    fireEvent.click(screen.getByTestId('oil-name-slammed'))
    const n = getState().ledger.length
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toBe('Give a reason')
    expect(getState().ledger).toHaveLength(n)
  })

  it('several names picked make one batch; Deselect clears it', () => {
    setRole('admin')
    openTracker()
    fireEvent.click(screen.getByTestId('oil-name-ramp'))
    fireEvent.click(screen.getByTestId('oil-name-dusk'))
    expect(screen.getByTestId('oil-credit-who').textContent).toBe('Credit RAMP, DUSK')
    // A second tap on a name un-picks it.
    fireEvent.click(screen.getByTestId('oil-name-dusk'))
    expect(screen.getByTestId('oil-credit-who').textContent).toBe('Credit RAMP')
    fireEvent.click(screen.getByTestId('oil-name-dusk'))
    const n = getState().ledger.length
    fireEvent.change(screen.getByTestId('oil-amt'), { target: { value: '2' } })
    fireEvent.change(screen.getByTestId('oil-reason'), { target: { value: 'Exercise weekend' } })
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    const added = getState().ledger.slice(n)
    expect(added.map(e => [e.personId, e.amount, e.reason])).toEqual([
      ['ramp', 2, 'Exercise weekend'],
      ['dusk', 2, 'Exercise weekend'],
    ])
    expect(screen.queryByTestId('oil-credit-panel')).toBeNull()
    fireEvent.click(screen.getByTestId('oil-name-ramp'))
    fireEvent.click(screen.getByTestId('oil-credit-cancel'))
    expect(screen.queryByTestId('oil-credit-panel')).toBeNull()
  })

  describe('a drag down the names selects the run under it (the grid\'s own gesture)', () => {
    const origEFP = document.elementFromPoint
    // A committed drag installs a one-shot click swallow that a zero-delay
    // timer removes; drain it, or it eats the next test's first click.
    afterEach(async () => { document.elementFromPoint = origEFP; await new Promise(r => setTimeout(r, 0)) })

    const pointer = (type: 'pointerdown' | 'pointermove' | 'pointerup', target: EventTarget, init: PointerEventInit) =>
      act(() => { target.dispatchEvent(new PointerEvent(type, { bubbles: true, ...init })) })

    it('a mouse drag selects every row between the anchor and where it ended, and the bar names them', () => {
      setRole('admin')
      openTracker()
      const rows = [...screen.getByTestId('oil-list').querySelectorAll('[data-oilrow]')] as HTMLElement[]
      const [a, b, c] = rows
      // jsdom has no layout: the hit-test answers with whichever row the
      // pointer "is over", scripted here.
      let over: HTMLElement = a!
      document.elementFromPoint = () => over
      pointer('pointerdown', screen.getByTestId(`oil-name-${a!.getAttribute('data-oilrow')}`), { pointerType: 'mouse', button: 0, clientX: 10, clientY: 10, pointerId: 1 })
      over = c!
      pointer('pointermove', window, { pointerType: 'mouse', clientX: 10, clientY: 90, pointerId: 1 })
      // The run is painted while the drag is live…
      expect(b!.className).toContain('selrow')
      pointer('pointerup', window, { pointerType: 'mouse', clientX: 10, clientY: 90, pointerId: 1, button: 0 })
      // …and committed on release: three rows picked, the bar up.
      for (const r of [a, b, c]) expect(r!.className).toContain(' on')
      const who = screen.getByTestId('oil-credit-who').textContent!
      expect(who.startsWith('Credit ')).toBe(true)
      expect(who.split(',')).toHaveLength(3)
    })

    it('a finger that holds arms the drag; a quick flick scrolls instead', async () => {
      setRole('admin')
      openTracker()
      const rows = [...screen.getByTestId('oil-list').querySelectorAll('[data-oilrow]')] as HTMLElement[]
      document.elementFromPoint = () => rows[2]!
      const name = screen.getByTestId(`oil-name-${rows[0]!.getAttribute('data-oilrow')}`)
      // A flick: moves past the slop before the hold → cedes to the scroll.
      pointer('pointerdown', name, { pointerType: 'touch', button: 0, clientX: 10, clientY: 10, pointerId: 2 })
      pointer('pointermove', window, { pointerType: 'touch', clientX: 10, clientY: 90, pointerId: 2 })
      pointer('pointerup', window, { pointerType: 'touch', clientX: 10, clientY: 90, pointerId: 2, button: 0 })
      expect(screen.queryByTestId('oil-credit-panel')).toBeNull()
      // A hold: 180ms still, then the drag selects the run.
      pointer('pointerdown', name, { pointerType: 'touch', button: 0, clientX: 10, clientY: 10, pointerId: 3 })
      await act(async () => { await new Promise(r => setTimeout(r, 230)) })   // past HOLD (180ms) → armed
      pointer('pointermove', window, { pointerType: 'touch', clientX: 10, clientY: 90, pointerId: 3 })
      pointer('pointerup', window, { pointerType: 'touch', clientX: 10, clientY: 90, pointerId: 3, button: 0 })
      for (const r of rows.slice(0, 3)) expect(r.className).toContain(' on')
      expect(screen.getByTestId('oil-credit-panel')).toBeTruthy()
    })
  })
})

describe('an admin\'s manual OIL on the grid opens the tracker', () => {
  it('writing OIL on a cell opens the tracker on that person with the day lit; a member\'s bid does not', () => {
    render(<Matrix />)
    // A member's own bid: no tracker.
    fireEvent.click(screen.getByTestId('cell-ramp-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-OIL'))
    expect(screen.queryByTestId('oil-sheet')).toBeNull()
    act(() => setRole('admin'))
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-OIL'))
    expect(screen.getByTestId('oil-sheet')).toBeTruthy()
    expect(screen.getByTestId('oil-row-dusk').className).toContain('here')
    expect(screen.getByTestId('counter-name').textContent).toBe('OIL BAL')
  })
})

describe('the settings (admin): expiry and the default window', () => {
  it('an expiry retires an old credit — the box says so, the balance drops, the column agrees', () => {
    setRole('admin')
    act(() => { expect(ingestDutyCredit('slammed', '2026-01-03', 'FO', 'FLT')).toBe('written') })
    openTracker()
    expect(screen.getByTestId('oil-bal-slammed').textContent).toBe('1')
    fireEvent.click(screen.getByTestId('oil-settings'))
    fireEvent.click(screen.getByTestId('oil-exp-days'))
    expect(getState().oilPolicy.expiry).toEqual({ n: 90, unit: 'days' })
    fireEvent.change(screen.getByTestId('oil-exp-n'), { target: { value: '30' } })
    fireEvent.blur(screen.getByTestId('oil-exp-n'))
    expect(getState().oilPolicy.expiry).toEqual({ n: 30, unit: 'days' })
    fireEvent.click(screen.getByTestId('oil-settings-done'))
    expect(screen.getByTestId('oil-bal-slammed').textContent).toBe('0')
    // Expired = dead, so it is in the archive like a used-up credit.
    expect(screen.queryByTestId('oil-entry-slammed-auto:0:2026-01-03')).toBeNull()
    expect(screen.getByTestId('oil-arch-slammed').textContent).toBe('1')
    fireEvent.click(screen.getByTestId('oil-archive'))
    const credit = screen.getByTestId('oil-entry-slammed-auto:0:2026-01-03')
    expect(credit.className).toContain('expired')
    expect(screen.getByTestId('oil-status-slammed-auto:0:2026-01-03').textContent).toBe('expired 2 Feb')
    // Forever brings it back.
    fireEvent.click(screen.getByTestId('oil-settings'))
    fireEvent.click(screen.getByTestId('oil-exp-forever'))
    expect(getState().oilPolicy.expiry).toBeNull()
    fireEvent.click(screen.getByTestId('oil-settings-done'))
    expect(screen.getByTestId('oil-bal-slammed').textContent).toBe('1')
  })

  it('the default window follows the policy: from the first entry, or N months back', () => {
    setRole('admin')
    setOilPolicy({ historyMonths: null })
    openTracker()
    expect(screen.getByTestId('oil-range-first').className).toContain(' on')
    fireEvent.click(screen.getByTestId('oil-settings'))
    fireEvent.click(screen.getByTestId('oil-hist-months'))
    fireEvent.change(screen.getByTestId('oil-hist-n'), { target: { value: '3' } })
    fireEvent.blur(screen.getByTestId('oil-hist-n'))
    expect(getState().oilPolicy.historyMonths).toBe(3)
    fireEvent.click(screen.getByTestId('oil-settings-done'))
    expect(screen.getByTestId('oil-range-months').textContent).toBe('Last 3 months')
  })
})

describe('the Cinch sheet: an admin sets LVE BAL', () => {
  it('a member sees no Set; an admin types the balance and LL/OL deduct from it', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    expect(screen.queryByTestId('lvebal-edit')).toBeNull()
    fireEvent.click(screen.getByTestId('pfig-close'))
    act(() => setRole('admin'))
    fireEvent.click(screen.getByTestId('person-ramp'))
    expect(screen.getByTestId('pfig-lvebal').textContent).toContain('25 left')
    fireEvent.click(screen.getByTestId('lvebal-edit'))
    fireEvent.change(screen.getByTestId('lvebal-input'), { target: { value: '30' } })
    fireEvent.click(screen.getByTestId('lvebal-save'))
    expect(screen.getByTestId('pfig-lvebal').textContent).toContain('30 left')
    expect(screen.queryByTestId('lvebal-input')).toBeNull()
    fireEvent.click(screen.getByTestId('pfig-close'))
    expect(screen.getByTestId('bal-ramp').textContent).toBe('30')
    act(() => { setCell('ramp', '2026-01-20', 'LL') })
    expect(screen.getByTestId('bal-ramp').textContent).toBe('29')
  })
})
