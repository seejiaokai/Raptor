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

/** An earned day and a day taken for SLAMMED (no opening figure, no grants),
 *  so the FIFO story is one credit and one debit. */
function slammedStory() {
  setRole('admin')
  expect(ingestDutyCredit('slammed', '2026-01-03', 'FO')).toBe('written')   // a Saturday
  setCell('slammed', '2026-01-12', 'OIL')
}

describe('the OIL tracker button and the everyone view', () => {
  it('is on the toolbar for a member and an admin alike, and lists everyone with their OIL BAL', () => {
    const sheet = openTracker()
    expect(sheet.textContent).toContain('OIL TRACKER')
    const { openings, ledger, wars, people } = getState()
    expect(screen.getAllByTestId(/^oil-row-/)).toHaveLength(people.length)
    // The figure is the same number the column shows (no expiry policy).
    expect(screen.getByTestId('oil-bal-ramp').textContent).toBe(`${balanceOf(openings, ledger, wars, 'ramp', 'oil')} left`)
    expect(screen.getByTestId('oil-bal-decal').textContent).toContain('-')
    // Group headings, in the grid's order.
    expect(screen.getByTestId('oil-grp-SXO')).toBeTruthy()
    // A member reads only: no pick boxes, no settings, no select-all.
    expect(screen.queryByTestId('oil-pick-ramp')).toBeNull()
    expect(screen.queryByTestId('oil-settings')).toBeNull()
    expect(screen.queryByTestId(/^oil-grpsel-/)).toBeNull()
  })

  it('the admin sees the same button, plus the pick boxes and settings', () => {
    setRole('admin')
    openTracker()
    expect(screen.getByTestId('oil-pick-ramp')).toBeTruthy()
    expect(screen.getByTestId('oil-settings')).toBeTruthy()
  })

  it('a row opens that person\'s ledger, and Everyone goes back', () => {
    openTracker()
    fireEvent.click(screen.getByTestId('oil-open-ramp'))
    expect(screen.getByTestId('oil-sheet').textContent).toContain('RAMP')
    expect(screen.getByTestId('oil-person-bal')).toBeTruthy()
    fireEvent.click(screen.getByTestId('oil-back'))
    expect(screen.getByTestId('oil-bal-ramp')).toBeTruthy()
  })
})

describe('the Cinch sheet hands over to the tracker', () => {
  it('OIL BAL opens the tracker on that person; other rows still open their breakdown', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    fireEvent.click(screen.getByTestId('pfig-oilbal').querySelector('.crow')!)
    expect(screen.queryByTestId('person-figures')).toBeNull()
    const sheet = screen.getByTestId('oil-sheet')
    expect(sheet.textContent).toContain('RAMP')
    expect(screen.getByTestId('oil-person-bal')).toBeTruthy()
  })
})

describe('the one-person ledger', () => {
  it('shows the earned day as an auto credit and the day taken drawing from it, struck through once used', () => {
    slammedStory()
    setRole('member')
    openTracker()
    fireEvent.click(screen.getByTestId('oil-open-slammed'))
    // The default window is the last six months, and January is outside it.
    expect(screen.queryByTestId('oil-entry-auto:0:2026-01-03')).toBeNull()
    fireEvent.click(screen.getByTestId('oil-range-first'))
    const credit = screen.getByTestId('oil-entry-auto:0:2026-01-03')
    expect(credit.className).toContain('used')
    expect(credit.textContent).toContain('weekend duty')
    expect(credit.textContent).toContain('auto')
    expect(screen.getByTestId('oil-status-auto:0:2026-01-03').textContent).toBe('used 12 Jan 26')
    const take = screen.getByTestId('oil-entry-take:0:2026-01-12')
    expect(take.textContent).toContain('OIL taken')
    expect(screen.getByTestId('oil-status-take:0:2026-01-12').textContent).toBe('from 3 Jan 26')
    expect(screen.getByTestId('oil-person-bal').textContent).toBe('0')
    // Newest first.
    const ids = [...screen.getByTestId('oil-entries').querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.getAttribute('data-testid'))
    expect(ids).toEqual(['oil-entry-take:0:2026-01-12', 'oil-entry-auto:0:2026-01-03'])
    // A member gets no editor.
    expect(screen.queryByTestId('oil-add')).toBeNull()
  })

  it('a picked date range narrows the window', () => {
    slammedStory()
    openTracker()
    fireEvent.click(screen.getByTestId('oil-open-slammed'))
    fireEvent.click(screen.getByTestId('oil-range-pick'))
    // The picker opens on this month; page back to January 2026.
    for (let i = 0; i < 240 && !screen.queryByTestId('oilrange-day-2026-01-05'); i++) {
      fireEvent.click(screen.getByTestId('oilrange-prev-month'))
    }
    // 5 Jan – 31 Jan holds the day taken but not the earned day.
    fireEvent.click(screen.getByTestId('oilrange-day-2026-01-05'))
    fireEvent.click(screen.getByTestId('oilrange-day-2026-01-31'))
    expect(screen.getByTestId('oil-window').textContent).toBe('5 Jan 26 – 31 Jan 26')
    expect(screen.getByTestId('oil-entry-take:0:2026-01-12')).toBeTruthy()
    expect(screen.queryByTestId('oil-entry-auto:0:2026-01-03')).toBeNull()
  })

  it('a grant shows who gave it and, for an admin, can be edited and deleted (two taps)', () => {
    setRole('admin')
    openTracker()
    fireEvent.click(screen.getByTestId('oil-open-jaguar'))
    fireEvent.click(screen.getByTestId('oil-range-first'))
    // The seed's CNY grant, l4.
    const row = screen.getByTestId('oil-entry-l4')
    expect(row.textContent).toContain('CNY workplan')
    expect(row.textContent).toContain('by SQNCDR')
    fireEvent.click(screen.getByTestId('oil-edit-l4'))
    fireEvent.change(screen.getByTestId('oil-edit-amt'), { target: { value: '3' } })
    fireEvent.change(screen.getByTestId('oil-edit-reason'), { target: { value: 'CNY workplan (three days)' } })
    fireEvent.click(screen.getByTestId('oil-edit-save'))
    expect(getState().ledger.find(e => e.id === 'l4')).toMatchObject({ amount: 3, reason: 'CNY workplan (three days)' })
    expect(screen.getByTestId('oil-entry-l4').textContent).toContain('+3')
    fireEvent.click(screen.getByTestId('oil-del-l4'))
    expect(screen.getByTestId('oil-del-l4').textContent).toBe('Really delete?')
    fireEvent.click(screen.getByTestId('oil-del-l4'))
    expect(getState().ledger.some(e => e.id === 'l4')).toBe(false)
    expect(screen.queryByTestId('oil-entry-l4')).toBeNull()
  })
})

describe('crediting OIL (admin)', () => {
  it('+ Add OIL on a person writes a dated, reasoned grant and moves the balance', () => {
    setRole('admin')
    openTracker()
    fireEvent.click(screen.getByTestId('oil-open-slammed'))
    expect(screen.getByTestId('oil-person-bal').textContent).toBe('0')
    fireEvent.click(screen.getByTestId('oil-add'))
    fireEvent.change(screen.getByTestId('oil-amt'), { target: { value: '1.5' } })
    fireEvent.change(screen.getByTestId('oil-reason'), { target: { value: 'Det recovery' } })
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(getState().ledger.at(-1)).toMatchObject({ personId: 'slammed', counter: 'oil', amount: 1.5, reason: 'Det recovery', approvedBy: 'admin' })
    expect(screen.getByTestId('oil-person-bal').textContent).toBe('1.5')
    expect(screen.queryByTestId('oil-credit-panel')).toBeNull()
    const row = screen.getByTestId(`oil-entry-${getState().ledger.at(-1)!.id}`)
    expect(row.textContent).toContain('Det recovery')
    expect(row.textContent).toContain('1.5 left')
  })

  it('a bad grant is refused with the reason, and nothing is written', () => {
    setRole('admin')
    openTracker()
    fireEvent.click(screen.getByTestId('oil-open-slammed'))
    fireEvent.click(screen.getByTestId('oil-add'))
    const n = getState().ledger.length
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toBe('Give a reason')
    expect(getState().ledger).toHaveLength(n)
  })

  it('pick boxes and a group\'s Select all build a batch; one save credits them all', () => {
    setRole('admin')
    openTracker()
    fireEvent.click(screen.getByTestId('oil-pick-ramp'))
    fireEvent.click(screen.getByTestId('oil-pick-dusk'))
    expect(screen.getByTestId('oil-credit-who').textContent).toContain('2 people')
    // Select-all on a group adds everyone under it; a second tap clears them.
    const ip = [...screen.getByTestId('oil-list').querySelectorAll('[data-oilrow]')]
    fireEvent.click(screen.getByTestId('oil-grpsel-IP'))
    const ipCount = getState().people.filter(p => screen.getByTestId(`oil-row-${p.id}`).className.includes('on')).length
    expect(ipCount).toBeGreaterThan(2)
    fireEvent.click(screen.getByTestId('oil-grpsel-IP'))
    expect(ip.filter(r => r.className.includes(' on'))).toHaveLength(2)
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
  })

  describe('a mouse drag down the rows selects the run under it', () => {
    const origEFP = document.elementFromPoint
    afterEach(() => { document.elementFromPoint = origEFP })

    it('selects every row between the anchor and where the drag ended', () => {
      setRole('admin')
      openTracker()
      const rows = [...screen.getByTestId('oil-list').querySelectorAll('[data-oilrow]')] as HTMLElement[]
      const [a, b, c] = rows
      // jsdom has no layout: the hit-test answers with whichever row the
      // pointer "is over", scripted here.
      let over: HTMLElement = a
      document.elementFromPoint = () => over
      fireEvent.pointerDown(a.querySelector('.crow')!, { pointerType: 'mouse', button: 0, clientX: 10, clientY: 10, pointerId: 1 })
      over = c
      fireEvent.pointerMove(screen.getByTestId('oil-list'), { pointerType: 'mouse', clientX: 10, clientY: 90, pointerId: 1 })
      // The run is previewed while the drag is live…
      expect(b.className).toContain('pre')
      fireEvent.pointerUp(screen.getByTestId('oil-list'), { pointerType: 'mouse', clientX: 10, clientY: 90, pointerId: 1 })
      // …and committed on release: three rows selected, credit panel up.
      for (const r of [a, b, c]) expect(r.className).toContain(' on')
      expect(screen.getByTestId('oil-credit-who').textContent).toContain('3 people')
      // The click that trails the drag did not open the row it ended on.
      fireEvent.click(c.querySelector('.crow')!)
      expect(screen.queryByTestId('oil-person-bal')).toBeNull()
    })

    it('a finger never drags — it scrolls, and taps the boxes instead', () => {
      setRole('admin')
      openTracker()
      const rows = [...screen.getByTestId('oil-list').querySelectorAll('[data-oilrow]')] as HTMLElement[]
      document.elementFromPoint = () => rows[2]
      fireEvent.pointerDown(rows[0].querySelector('.crow')!, { pointerType: 'touch', button: 0, clientX: 10, clientY: 10, pointerId: 2 })
      fireEvent.pointerMove(screen.getByTestId('oil-list'), { pointerType: 'touch', clientX: 10, clientY: 90, pointerId: 2 })
      fireEvent.pointerUp(screen.getByTestId('oil-list'), { pointerType: 'touch', clientX: 10, clientY: 90, pointerId: 2 })
      expect(screen.queryByTestId('oil-credit-panel')).toBeNull()
    })
  })
})

describe('the settings (admin): expiry and the default window', () => {
  it('an expiry retires an old credit — the row says so, the balance drops, the column agrees', () => {
    setRole('admin')
    act(() => { expect(ingestDutyCredit('slammed', '2026-01-03', 'FO')).toBe('written') })
    openTracker()
    expect(screen.getByTestId('oil-bal-slammed').textContent).toBe('1 left')
    fireEvent.click(screen.getByTestId('oil-settings'))
    fireEvent.click(screen.getByTestId('oil-exp-days'))
    expect(getState().oilPolicy.expiry).toEqual({ n: 90, unit: 'days' })
    fireEvent.change(screen.getByTestId('oil-exp-n'), { target: { value: '30' } })
    fireEvent.blur(screen.getByTestId('oil-exp-n'))
    expect(getState().oilPolicy.expiry).toEqual({ n: 30, unit: 'days' })
    fireEvent.click(screen.getByTestId('oil-settings-done'))
    expect(screen.getByTestId('oil-bal-slammed').textContent).toBe('0 left')
    fireEvent.click(screen.getByTestId('oil-open-slammed'))
    fireEvent.click(screen.getByTestId('oil-range-first'))
    const credit = screen.getByTestId('oil-entry-auto:0:2026-01-03')
    expect(credit.className).toContain('expired')
    expect(screen.getByTestId('oil-status-auto:0:2026-01-03').textContent).toBe('expired 2 Feb 26')
    // Forever brings it back.
    fireEvent.click(screen.getByTestId('oil-settings'))
    fireEvent.click(screen.getByTestId('oil-exp-forever'))
    expect(getState().oilPolicy.expiry).toBeNull()
    fireEvent.click(screen.getByTestId('oil-settings-done'))
    expect(screen.getByTestId('oil-person-bal').textContent).toBe('1')
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
