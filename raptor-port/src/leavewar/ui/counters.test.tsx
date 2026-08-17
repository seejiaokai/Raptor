import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { getState, initStore, moveFigure, resetFigureOrder, setBidState, setCell, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
})

/** Open the counter sheet and choose one. The whole column header is the
 *  control now — the two arrows it replaced were 13px glyphs in a 44px
 *  column, which the owner could not hit on a phone. */
function pick(counter: string) {
  fireEvent.click(screen.getByTestId('counter-pick'))
  fireEvent.click(screen.getByTestId(`counter-${counter}`))
}

describe('the counter column', () => {
  it('shows one counter at a time, not one column per counter', () => {
    render(<Matrix />)
    // One header cell for the counter column, whatever the six hold.
    expect(screen.getAllByTestId(/^counter-head$/)).toHaveLength(1)
    expect(screen.getAllByTestId(/^bal-/)).toHaveLength(getState().people.length)
  })

  it('opens on the leave balance, which is the one people ask about', () => {
    render(<Matrix />)
    expect(screen.getByTestId('counter-name').textContent).toBe('LVE BAL')
  })

  // RAMP's LVE BAL is the annual pool: 12 opening + 14 top-up − 1 (OL on 1
  // Jan, approved) = 25.
  it('shows the leave balance: opening plus grants less what the grid has drawn', () => {
    render(<Matrix />)
    expect(screen.getByTestId('bal-ramp').textContent).toBe('25')
  })

  // The reason the panel cycles figures rather than showing all of them: every
  // row has to change together, or row 1 shows LVE BAL while row 2 shows OIL CON.
  it('changes every row at once when the figure changes', () => {
    render(<Matrix />)
    const before = getState().people.map(p => screen.getByTestId(`bal-${p.id}`).textContent)
    pick('oil')
    expect(screen.getByTestId('counter-name').textContent).toBe('OIL USED')
    const after = getState().people.map(p => screen.getByTestId(`bal-${p.id}`).textContent)
    expect(after).not.toEqual(before)
    // RAMP has one *OIL (10 Feb, pending) — half a day of OIL taken.
    expect(screen.getByTestId('bal-ramp').textContent).toBe('0.5')
  })

  // Every figure is reachable, and each is ONE tap from any other. That is
  // the point of the sheet: the arrows it replaced made the last figure many
  // taps away, on a control the owner could not reliably hit even once.
  it('offers every figure, in order, each a single tap away', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect([...screen.getByTestId('counter-sheet').querySelectorAll('.crow .cn')].map(e => e.textContent))
      .toEqual([
        'LL USED', 'OL USED', 'OIL USED', 'OIL BAL', 'OFF USED', 'CCL USED', 'PL USED',
        'FCL USED', 'MED USED', 'OML USED', 'LVE BAL', 'LVE USED',
      ])
    fireEvent.click(screen.getByTestId('counter-lvecon'))
    expect(screen.getByTestId('counter-name').textContent).toBe('LVE USED')
    expect(screen.queryByTestId('counter-sheet')).toBeNull()

    // ...and back again, without walking through the ten in between.
    pick('lvebal')
    expect(screen.getByTestId('counter-name').textContent).toBe('LVE BAL')
  })

  it('marks which figure is already showing', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.getByTestId('counter-lvebal').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('counter-ll').getAttribute('aria-pressed')).toBe('false')
  })

  // MED CON and LVE CON are the two aggregates, and the sheet is where the
  // owner asked their make-up to show — the "= …" caption is the legend bubble.
  it('states the legend and each aggregate composition in the sheet', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.getByTestId('counter-legend').textContent).toContain('BAL')
    expect(screen.getByTestId('counter-legend').textContent).toContain('USED')
    expect(screen.getByTestId('figsub-med').textContent).toBe('= ATT C + HL + OML')
    expect(screen.getByTestId('figsub-lvecon').textContent).toBe('= LL + OL + OIL + OFF + CCL + PL + FCL')
  })

  // The figure is what makes the list answerable: "which counter" is a
  // question people settle by looking for the one running out.
  it('shows the squadron-wide total beside each counter', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    const oil = screen.getByTestId('counter-oil').textContent!
    expect(oil).toContain('OIL')
    expect(oil).toMatch(/-?\d/)
  })

  // §Counters: balances already go negative in the squadron's own workbook,
  // and negative shows red and is never refused.
  it('paints a negative balance red without refusing it', () => {
    render(<Matrix />)
    // LVE BAL is the one figure that can go negative, and it is the default.
    // RESET opens it below zero (2, less four days pending in the 2027 war),
    // and negative shows red, never refused (§Counters).
    const reset = screen.getByTestId('bal-reset')
    expect(reset.textContent!.startsWith('-')).toBe(true)
    expect(reset.className).toContain('neg')
  })

  // A consumed figure counts days taken, so it is never negative — the red is
  // the balance's alone.
  it('never paints a consumed figure red', () => {
    render(<Matrix />)
    pick('ll')
    for (const p of getState().people) {
      expect(screen.getByTestId(`bal-${p.id}`).className).not.toContain('neg')
    }
  })

  it('does not paint a positive balance red', () => {
    render(<Matrix />)
    expect(screen.getByTestId('bal-ramp').className).not.toContain('neg')
  })

  // A pending bid has been asked for, so it cannot be asked for twice. The
  // figure has to move the moment the bid is placed, not when it is decided.
  it('draws down as soon as a bid is placed, and gives it back on refusal', () => {
    render(<Matrix />)
    const before = Number(screen.getByTestId('bal-dusk').textContent)
    act(() => setCell('dusk', '2026-02-11', 'LL'))
    expect(Number(screen.getByTestId('bal-dusk').textContent)).toBe(before - 1)
    act(() => setBidState('dusk', '2026-02-11', 'refused'))
    expect(Number(screen.getByTestId('bal-dusk').textContent)).toBe(before)
  })

  it('draws a half day as half', () => {
    render(<Matrix />)
    const before = Number(screen.getByTestId('bal-dusk').textContent)
    act(() => setCell('dusk', '2026-02-11', '*LL'))
    expect(Number(screen.getByTestId('bal-dusk').textContent)).toBe(before - 0.5)
  })

  // The count rows have no leave balance — they are rules, not people — so
  // their cell in this column is empty rather than showing a stray figure.
  it('leaves the count rows blank in the counter column', () => {
    render(<Matrix />)
    expect(screen.getByTestId('counter-count-ip').textContent).toBe('')
  })

  it('names the figure for a screen reader, not just in the chip', () => {
    render(<Matrix />)
    const label = screen.getByTestId('counter-pick').getAttribute('aria-label')!
    expect(label).toContain('LVE BAL')
    expect(label.toLowerCase()).toContain('choose')
  })
})

describe('the counter follows the leave just entered', () => {
  // The owner's ask: "If the user inputs a leave for e.g OIL, the leave
  // counter will snap to show how many OIL they have." The figure then
  // answers the question the bidder is holding in their head at that moment,
  // instead of showing a pool they were not thinking about.
  it('snaps to the consumed figure of the leave just entered', () => {
    render(<Matrix />)
    expect(screen.getByTestId('counter-name').textContent).toBe('LVE BAL')
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-OIL'))
    expect(screen.getByTestId('counter-name').textContent).toBe('OIL USED')
  })

  it('snaps for a half day exactly as for a whole one', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    fireEvent.click(screen.getByTestId('portion-am'))
    fireEvent.click(screen.getByTestId('bid-CCL'))
    expect(screen.getByTestId('counter-name').textContent).toBe('CCL USED')
  })

  // LL and OL now have SEPARATE consumed figures — the whole reason the column
  // reads per-type consumed rather than per-counter, which could not tell the
  // two apart (both spend the one annual pool).
  it('snaps each leave to its own consumed figure, LL and OL apart', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(screen.getByTestId('counter-name').textContent).toBe('LL USED')
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-12'))
    fireEvent.click(screen.getByTestId('bid-OL'))
    expect(screen.getByTestId('counter-name').textContent).toBe('OL USED')
  })

  // OFF has its own consumed figure now (OFF CON), so entering it snaps there
  // rather than being left where it was — free leave is still leave taken.
  it('snaps to OFF CON for free leave', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-OFF'))
    expect(screen.getByTestId('counter-name').textContent).toBe('OFF USED')
  })

  it('clearing a cell moves nothing', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(screen.getByTestId('counter-name').textContent).toBe('LVE BAL')
  })
})

describe('reordering the figures', () => {
  // The ARRANGEMENT is management's since 17 Aug 26 ("normal user should
  // not have authority to change the leave war column arrangement") — every
  // reorder test runs as admin, and the member case pins the gate.
  beforeEach(() => setRole('admin'))

  it('offers a member no reorder controls, and the store refuses the write anyway', () => {
    setRole('member')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.queryByTestId('figdown-ll')).toBeNull()
    expect(screen.queryByTestId('counter-reset')).toBeNull()
    // The write path is the real gate — the interface only hides it.
    expect(moveFigure('ll', 1)).toBe(false)
    resetFigureOrder()
    expect(getState().figureOrder[0]).toBe('ll')
  })

  it('moves a figure down, and the column follows the new order', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    // LL CON is first; nudging it down puts OL CON at the top of the list.
    fireEvent.click(screen.getByTestId('figdown-ll'))
    const labels = [...screen.getByTestId('counter-sheet').querySelectorAll('.crow .cn')].map(e => e.textContent)
    expect(labels[0]).toBe('OL USED')
    expect(labels[1]).toBe('LL USED')
    expect(getState().figureOrder[0]).toBe('ol')
  })

  it('clamps at the ends — the first cannot go up, the last cannot go down', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect((screen.getByTestId('figup-ll') as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByTestId('figdown-lvecon') as HTMLButtonElement).disabled).toBe(true)
  })

  it('resets to the catalogue order', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    fireEvent.click(screen.getByTestId('figdown-ll'))
    expect(getState().figureOrder[0]).toBe('ol')
    fireEvent.click(screen.getByTestId('counter-reset'))
    expect(getState().figureOrder[0]).toBe('ll')
  })

  it('keeps the SAME figure shown across a reorder, not the same slot', () => {
    render(<Matrix />)
    // Show OL CON, then move it down. The column must still show OL CON.
    pick('ol')
    expect(screen.getByTestId('counter-name').textContent).toBe('OL USED')
    fireEvent.click(screen.getByTestId('counter-pick'))
    fireEvent.click(screen.getByTestId('figdown-ol'))
    expect(screen.getByTestId('counter-name').textContent).toBe('OL USED')
  })

  it('persists the order through the backend', () => {
    const backend = memoryBackend()
    initStore(backend)
    // initStore resets the role (never persisted); re-arm the admin.
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    fireEvent.click(screen.getByTestId('figdown-ll'))
    // A fresh boot on the same backend reads the saved order back.
    initStore(backend)
    expect(getState().figureOrder[0]).toBe('ol')
  })
})

describe('going negative is asked about, never refused', () => {
  // §Counters, and the owner twice: balances already run negative in the
  // squadron's own workbook, so this can never be a refusal. What was wrong
  // was doing it silently.
  it('asks before a bid takes someone below zero, and writes nothing yet', () => {
    render(<Matrix />)
    // RESET already reads −2 annual — he opens at 2 with four days pending in
    // the 2027 war — so any further day is unambiguously past zero. JAGUAR
    // was the first choice here and was wrong: he sits at 2, and one day
    // leaves him at 1, which is exactly the case that must NOT warn.
    fireEvent.click(screen.getByTestId('cell-reset-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-LL'))

    expect(screen.getByTestId('span-note').textContent).toContain('RESET')
    expect(getState().grid.reset?.['2026-02-11']).toBeUndefined()
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  })

  it('goes ahead when the same leave is tapped again', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-reset-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(getState().grid.reset['2026-02-11']).toBe('LL')
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })

  it('says the figure it would land on', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-reset-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    const said = screen.getByTestId('span-note').textContent!
    expect(said).toContain('ANNUAL')
    expect(said).toMatch(/-\d/)
  })

  // A bid that stays in credit must not stop to ask — the warning is only
  // worth anything if it is rare.
  it('does not ask when the balance stays positive', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(screen.queryByTestId('span-note')).toBeNull()
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
  })

  // A FORTNIGHT is where this matters most: one day may stay in credit while
  // twelve do not, so the check has to count the whole span.
  it('counts the whole range, not just its first day', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-09'))
    fireEvent.click(screen.getByTestId('span-range'))
    fireEvent.click(screen.getByTestId('span-day-2026-02-27'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(screen.getByTestId('span-note').textContent).toContain('DUSK')
    expect(getState().grid.dusk?.['2026-02-09']).toBeUndefined()
  })

  // Free leave has no balance to overdraw.
  it('never asks about leave that spends nothing', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-reset-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-OFF'))
    expect(getState().grid.reset['2026-02-11']).toBe('OFF')
  })
})

describe('the per-person breakdown sheet (owner, 17 Aug 26)', () => {
  it('opens from a tap on a person’s counter cell and breaks MED USED into its three markers', () => {
    render(<Matrix />)
    pick('med')
    // splice's seed medical: one ATT C (5 Jan) and one OML (6 Jan).
    fireEvent.click(screen.getByTestId('bal-splice'))
    const sheet = screen.getByTestId('figure-breakdown')
    expect(sheet.textContent).toContain('SPLICE')
    expect(sheet.textContent).toContain('MED USED')
    const rows = [...sheet.querySelectorAll('.crow-top')].map(r => r.textContent)
    expect(rows).toEqual(['ATT C1', 'HL0', 'OML1', 'Total2'])
  })

  it('breaks a balance into opening + granted − taken, and closes', () => {
    render(<Matrix />)
    // LVE BAL is the default figure. RAMP: 12 opening + 14 granted − 1 taken = 25.
    fireEvent.click(screen.getByTestId('bal-ramp'))
    const sheet = screen.getByTestId('figure-breakdown')
    const rows = [...sheet.querySelectorAll('.crow-top')].map(r => r.textContent)
    expect(rows).toEqual(['opening figure12', 'granted14', 'taken-1', 'Total25'])
    fireEvent.click(screen.getByTestId('breakdown-close'))
    expect(screen.queryByTestId('figure-breakdown')).toBeNull()
  })

  it('restates a single-code figure as one line, so every figure answers', () => {
    render(<Matrix />)
    pick('oil')
    fireEvent.click(screen.getByTestId('bal-ramp'))
    const rows = [...screen.getByTestId('figure-breakdown').querySelectorAll('.crow-top')].map(r => r.textContent)
    expect(rows).toEqual(['days taken0.5', 'Total0.5'])
  })
})

describe('the picker answers with the viewer\'s own numbers (owner, 17 Aug 26)', () => {
  it('shows YOUR figure per row when the roster knows who is looking', () => {
    setViewer('ramp')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    // RAMP's own LVE BAL is 25; the squadron-wide sum is not.
    expect(screen.getByTestId('counter-lvebal').textContent).toContain('25 left, yours')
    // RAMP's *OIL half-day: 0.5 taken.
    expect(screen.getByTestId('counter-oil').textContent).toContain('0.5 taken, yours')
    // The header names whose numbers these are.
    expect(screen.getByTestId('counter-sheet').textContent).toContain('your numbers — RAMP')
  })

  it('falls back to the squadron-wide sums when nobody (or an unknown id) is viewing', () => {
    setViewer('nobody-here')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.getByTestId('counter-lvebal').textContent).toContain('squadron-wide')
  })
})

describe('the viewer\'s row is lit (owner, 17 Aug 26)', () => {
  it('marks exactly the viewing person\'s row, and follows a viewer change', () => {
    setViewer('ramp')
    const { rerender } = render(<Matrix />)
    expect(screen.getByTestId('row-ramp').className).toBe('me')
    expect(screen.getByTestId('row-tata').className).toBe('')
    act(() => setViewer('tata'))
    rerender(<Matrix />)
    expect(screen.getByTestId('row-ramp').className).toBe('')
    expect(screen.getByTestId('row-tata').className).toBe('me')
  })

  it('marks nobody when the viewer is not on this roster', () => {
    render(<Matrix />)
    for (const p of getState().people) {
      expect(screen.getByTestId(`row-${p.id}`).className).toBe('')
    }
  })
})

describe('a callsign opens the all-figures sheet, for everyone (owner, 17 Aug 26)', () => {
  it('lists every figure with that person\'s own number, for a member', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    const sheet = screen.getByTestId('person-figures')
    expect(sheet.textContent).toContain('RAMP')
    // All twelve figures, in the column's own order.
    expect(sheet.querySelectorAll('.crow-wrap')).toHaveLength(12)
    expect(screen.getByTestId('pfig-lvebal').textContent).toContain('25 left')
    expect(screen.getByTestId('pfig-oil').textContent).toContain('0.5 taken')
    // A member gets no editor path.
    expect(screen.queryByTestId('person-edit')).toBeNull()
  })

  it('a figure row opens that figure\'s breakdown for that person', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-splice'))
    fireEvent.click(screen.getByTestId('pfig-med').querySelector('.crow')!)
    // The figures sheet hands over to the breakdown — MED USED, splice's parts.
    expect(screen.queryByTestId('person-figures')).toBeNull()
    const bd = screen.getByTestId('figure-breakdown')
    expect(bd.textContent).toContain('SPLICE')
    expect(bd.textContent).toContain('MED USED')
    const rows = [...bd.querySelectorAll('.crow-top')].map(r => r.textContent)
    expect(rows).toEqual(['ATT C1', 'HL0', 'OML1', 'Total2'])
  })
})
