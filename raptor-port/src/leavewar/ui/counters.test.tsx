import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_FIGURE_ORDER } from '../engine'
import { advanceStage, getState, initStore, moveFigure, resetFigureOrder, setBidState, setCell, setPeople, setRole, setViewer, toggleFigure, visibleFigures } from '../state/store'
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

/** The top number of a person's counter box — the balance (or total). */
const top = (id: string) => screen.getByTestId(`bal-${id}`).querySelector('.fb')!.textContent
/** The used numbers under it, in order. */
const usedOf = (id: string) => [...screen.getByTestId(`bal-${id}`).querySelectorAll('.fu b')].map(b => b.textContent)

/** `fireEvent.animationEnd` never reaches a real `onAnimationEnd` — jsdom has
 *  no `AnimationEvent` constructor, so React's own feature-detection (built
 *  for pre-standard Safari) assumes a vendor prefix is needed; jsdom's CSSOM
 *  DOES happen to model a `WebkitAnimation` style property (just not the
 *  event class), so React lands on listening for `webkitAnimationEnd`
 *  instead of the plain name testing-library fires. A real browser has
 *  `AnimationEvent` and never takes this branch — `FigureCell` itself only
 *  ever names `onAnimationEnd`, unchanged. */
const fireAnimationEnd = (el: Element) => fireEvent(el, new Event('webkitAnimationEnd', { bubbles: true }))

describe('the counter column', () => {
  it('shows one counter at a time, not one column per counter', () => {
    render(<Matrix />)
    // One header cell for the counter column, whatever the six hold.
    expect(screen.getAllByTestId(/^counter-head$/)).toHaveLength(1)
    expect(screen.getAllByTestId(/^bal-/)).toHaveLength(getState().people.length)
  })

  it('opens on the leave balance, which is the one people ask about', () => {
    render(<Matrix />)
    expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
  })

  // RAMP's LVE is the annual pool: 12 opening + 14 top-up − 0 (OL on 1 Jan, a
  // seeded public holiday, charges nothing since 3 Sep 26 — charge.ts) = 26.
  it('shows the leave balance on top: opening plus grants less what the grid has drawn', () => {
    render(<Matrix />)
    expect(top('ramp')).toBe('26')
  })

  it('stacks the days taken under the balance, LL amber then OL red, no minus, nothing for zero', () => {
    setRole('admin')
    setCell('ramp', '2026-03-02', 'LL')
    setCell('ramp', '2026-03-03', 'LL')
    setCell('ramp', '2026-03-04', 'OL')
    render(<Matrix />)
    expect(top('ramp')).toBe('23')
    const used = screen.getByTestId('bal-ramp').querySelectorAll('.fu b')
    expect([...used].map(b => b.textContent)).toEqual(['2', '1'])
    expect(used[0]!.className).toBe('amber')
    expect(used[1]!.className).toBe('red')
    // a person with nothing taken shows no used line at all
    expect(screen.getByTestId('bal-tata').querySelectorAll('.fu b')).toHaveLength(0)
  })

  // The reason the panel cycles figures rather than showing all of them: every
  // row has to change together, or row 1 shows +LVE while row 2 shows −OIL.
  it('changes every row at once when the figure changes', () => {
    render(<Matrix />)
    const before = getState().people.map(p => top(p.id))
    pick('oil')
    expect(screen.getByTestId('counter-name').textContent).toBe('+OIL')
    const after = getState().people.map(p => top(p.id))
    expect(after).not.toEqual(before)
  })

  // Every figure is reachable, and each is ONE tap from any other. That is
  // the point of the sheet: the arrows it replaced made the last figure many
  // taps away, on a control the owner could not reliably hit even once.
  it('offers every figure, in order, each a single tap away', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect([...screen.getByTestId('counter-sheet').querySelectorAll('.crow .cn')].map(e => e.textContent))
      .toEqual(['LVE', 'OIL', 'CCL', 'FCL', 'CL', 'PL', 'LVE TOT', 'MED TOT'])
    fireEvent.click(screen.getByTestId('counter-lvetot'))
    expect(screen.getByTestId('counter-name').textContent).toBe('−LVE TOT')

    // ...and back again, without walking through the six in between.
    pick('lve')
    expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
  })

  it('marks which figure is already showing', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.getByTestId('counter-lve').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('counter-oil').getAttribute('aria-pressed')).toBe('false')
  })

  // MED CON and LVE CON are the two aggregates, and the sheet is where the
  // owner asked their make-up to show — the "= …" caption is the legend bubble.
  it('states the legend and each aggregate composition in the sheet', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.getByTestId('counter-legend').textContent).toContain('BAL')
    expect(screen.getByTestId('counter-legend').textContent).toContain('USED')
    expect(screen.getByTestId('figsub-med').textContent).toBe('= ATT C + HL + OML')
    expect(screen.getByTestId('figsub-lvecon').textContent).toBe('= LL + OL + OIL + CCL + PL + FCL + CL')
  })

  // The figure is what makes the list answerable: each row previews the
  // VIEWING person's number so "which counter" can be settled by looking for
  // the one running out.
  it('shows the viewing person\'s number beside each counter', () => {
    setViewer('ramp')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    const oil = screen.getByTestId('counter-oil').textContent!
    expect(oil).toContain('OIL')
    expect(oil).toMatch(/-?\d/)
  })

  it('shows a dash, not a squadron-wide sum, when no one is being viewed (owner, 18 Aug 26)', () => {
    // The owner does not want a squadron total here — the number answers "how
    // much do I have left", which has no meaning without a person, and a
    // squadron sum only mixed aircrew with ground crew. With nobody viewed the
    // row shows a dash; adding a ground-crew body with leave does not conjure
    // a number back.
    setViewer(null)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.getByTestId('counter-lve').textContent).toContain('—')
    expect(screen.getByTestId('counter-lve').textContent).not.toMatch(/\d/)
    act(() => {
      setPeople([...getState().people, { id: 'gnd_x', callsign: 'GNDX', seat: 'gnd', band: 'ops', sxo: false, from: null, to: null, pers: true } as any])
      setCell('gnd_x', '2026-02-10', 'LL')
    })
    expect(screen.getByTestId('counter-lve').textContent).toContain('—')
  })

  it('does not paint a positive balance red', () => {
    render(<Matrix />)
    expect(screen.getByTestId('bal-ramp').querySelector('.fb')!.classList.contains('neg')).toBe(false)
  })

  // A pending bid has been asked for, so it cannot be asked for twice. The
  // figure has to move the moment the bid is placed, not when it is decided.
  it('draws down as soon as a bid is placed, and gives it back on refusal', () => {
    render(<Matrix />)
    const before = Number(top('dusk'))
    act(() => setCell('dusk', '2026-02-11', 'LL'))
    expect(Number(top('dusk'))).toBe(before - 1)
    // the refusal is management's, once bidding is closed (canDecide)
    act(() => { setRole('admin'); advanceStage(); setBidState('dusk', '2026-02-11', 'refused') })
    expect(Number(top('dusk'))).toBe(before)
  })

  it('draws a half day as half', () => {
    render(<Matrix />)
    const before = Number(top('dusk'))
    act(() => setCell('dusk', '2026-02-11', '*LL'))
    expect(Number(top('dusk'))).toBe(before - 0.5)
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
    expect(label).toContain('LVE')
    expect(label.toLowerCase()).toContain('choose')
  })

  // §Counters: a balance already goes negative in the squadron's own
  // workbook, and negative shows red — with its minus — and is never
  // refused; a USED number never carries one (the column title's own minus,
  // and the colour, already say it is spent). RESET is the seed's standing
  // example: opens at 2 annual, less four LL days pending in the 2027 war
  // (a balance counts across every war, not just the one on screen) = −2;
  // OL taken is 0, so it draws no `.fu` entry at all.
  it('paints a negative balance red, with its minus, and never a used number with one', () => {
    render(<Matrix />)
    const box = screen.getByTestId('bal-reset')
    expect(box.querySelector('.fb')!.textContent).toBe('-2')
    expect(box.querySelector('.fb')!.classList.contains('neg')).toBe(true)
    expect(usedOf('reset')).toEqual(['4'])
  })
})

describe('the counter follows the leave just entered — to the balance it comes off (6 Sep 26)', () => {
  // The owner's ask: "If the user inputs a leave for e.g OIL, the leave
  // counter will snap to show how many OIL they have." The figure then
  // answers the question the bidder is holding in their head at that moment,
  // instead of showing a pool they were not thinking about. LL and OL both
  // come off the ONE LVE balance now (its two used lines, not two figures),
  // so entering either lands on the same +LVE.
  it('switches to LVE for LL and OL, OIL for OIL, MED TOT for a medical mark', () => {
    setRole('admin')
    render(<Matrix />)
    pick('medtot')
    fireEvent.click(screen.getByTestId('cell-ramp-2026-03-02'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
    fireEvent.click(screen.getByTestId('cell-ramp-2026-03-03'))
    fireEvent.click(screen.getByTestId('bid-OIL'))
    expect(screen.getByTestId('counter-name').textContent).toBe('+OIL')
  })

  it('snaps for a half day exactly as for a whole one', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    fireEvent.click(screen.getByTestId('portion-am'))
    fireEvent.click(screen.getByTestId('bid-CCL'))
    expect(screen.getByTestId('counter-name').textContent).toBe('+CCL')
  })

  // OFF stopped being a leave code on 2 Sep 26 (it is a management Off day
  // event now), so the bid sheet offers no OFF chip at all. Restored 6 Sep 26
  // (coordinator correction): this pins the BID SHEET's chip list, not the
  // figure catalogue — 'LVE BAL' is the only line the 6 Sep rename actually
  // touches (now '+LVE'); everything else here is untouched from 285367b.
  it('offers no OFF chip — OFF is not a person\'s leave', () => {
    render(<Matrix />)
    expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.queryByTestId('bid-OFF')).toBeNull()
    expect(screen.getByTestId('bid-EL')).toBeTruthy()
    expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.queryByTestId('counter-off')).toBeNull()
  })

  it('clearing a cell moves nothing', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
  })

  it('flashes the changed box once, and only that box', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-ramp-2026-03-02'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(screen.getByTestId('bal-ramp').classList.contains('flash')).toBe(true)
    expect(screen.getByTestId('bal-tata').classList.contains('flash')).toBe(false)
    fireAnimationEnd(screen.getByTestId('bal-ramp'))
    expect(screen.getByTestId('bal-ramp').classList.contains('flash')).toBe(false)
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
    expect(screen.queryByTestId('figdown-lve')).toBeNull()
    expect(screen.queryByTestId('counter-reset')).toBeNull()
    // The write path is the real gate — the interface only hides it.
    expect(moveFigure('lve', 1)).toBe(false)
    resetFigureOrder()
    expect(getState().figureOrder[0]).toBe('lve')
  })

  it('moves a figure down, and the column follows the new order', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    // LVE is first; nudging it down puts OIL at the top of the list.
    fireEvent.click(screen.getByTestId('figdown-lve'))
    const labels = [...screen.getByTestId('counter-sheet').querySelectorAll('.crow .cn')].map(e => e.textContent)
    expect(labels[0]).toBe('OIL')
    expect(labels[1]).toBe('LVE')
    expect(getState().figureOrder[0]).toBe('oil')
  })

  it('clamps at the ends — the first cannot go up, the last cannot go down', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect((screen.getByTestId('figup-lve') as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByTestId('figdown-medtot') as HTMLButtonElement).disabled).toBe(true)
  })

  it('resets to the catalogue order', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    fireEvent.click(screen.getByTestId('figdown-lve'))
    expect(getState().figureOrder[0]).toBe('oil')
    fireEvent.click(screen.getByTestId('counter-reset'))
    expect(getState().figureOrder[0]).toBe('lve')
  })

  it('keeps the SAME figure shown across a reorder, not the same slot', () => {
    render(<Matrix />)
    // Show OIL, then move it down. The column must still show OIL.
    pick('oil')
    expect(screen.getByTestId('counter-name').textContent).toBe('+OIL')
    fireEvent.click(screen.getByTestId('counter-pick'))
    fireEvent.click(screen.getByTestId('figdown-oil'))
    expect(screen.getByTestId('counter-name').textContent).toBe('+OIL')
  })

  it('persists the order through the backend', () => {
    const backend = memoryBackend()
    initStore(backend)
    // initStore resets the role (never persisted); re-arm the admin.
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    fireEvent.click(screen.getByTestId('figdown-lve'))
    // A fresh boot on the same backend reads the saved order back.
    initStore(backend)
    expect(getState().figureOrder[0]).toBe('oil')
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
    // ramp's OL is on New Year's Day (a seeded PH) — taken reads 0 since 3 Sep 26.
    expect(rows).toEqual(['opening figure12', 'granted14', 'taken0', 'Total26'])
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
    // RAMP's own LVE BAL is 25; the squadron-wide sum is not. ("yours" is gone
    // from the rows now — the VIEWING AS header says whose once, 28 Aug 26.)
    expect(screen.getByTestId('counter-lvebal').textContent).toContain('26 left')
    expect(screen.getByTestId('counter-lvebal').textContent).not.toContain('yours')
    // RAMP's *OIL half-day: 0.5 taken.
    expect(screen.getByTestId('counter-oil').textContent).toContain('0.5 taken')
    // The header names whose numbers these are, and prominently (28 Aug 26).
    expect(screen.getByTestId('counter-viewer').textContent).toContain('VIEWING AS')
    expect(screen.getByTestId('counter-viewer').textContent).toContain('RAMP')
  })

  it('shows a dash, not a squadron-wide sum, when nobody (or an unknown id) is viewing', () => {
    setViewer('nobody-here')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    const txt = screen.getByTestId('counter-lve').textContent!
    expect(txt).not.toContain('squadron-wide')
    expect(txt).toContain('—')
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
    // All eleven figures, in the column's own order (OFF USED went 2 Sep 26).
    expect(sheet.querySelectorAll('.crow-wrap')).toHaveLength(13)
    expect(screen.getByTestId('pfig-lvebal').textContent).toContain('26 left')
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

describe('hiding a figure (owner, 6 Sep 26 — "admin should also be able to customise")', () => {
  it('lets an admin hide a figure, and the visible list drops it', () => {
    setRole('admin')
    expect(visibleFigures().map(f => f.id)).toEqual(['lve', 'oil', 'ccl', 'fcl', 'cl', 'pl', 'lvetot', 'medtot'])
    expect(toggleFigure('fcl')).toBe(true)
    expect(getState().figureHidden).toEqual(['fcl'])
    expect(visibleFigures().map(f => f.id)).toEqual(['lve', 'oil', 'ccl', 'cl', 'pl', 'lvetot', 'medtot'])
    expect(toggleFigure('fcl')).toBe(true)
    expect(visibleFigures()).toHaveLength(8)
  })
  it('refuses a member', () => {
    setRole('member')
    expect(toggleFigure('fcl')).toBe(false)
    expect(getState().figureHidden).toEqual([])
  })
  it('never hides the last figure showing', () => {
    setRole('admin')
    for (const id of ['oil', 'ccl', 'fcl', 'cl', 'pl', 'lvetot', 'medtot']) toggleFigure(id)
    expect(visibleFigures().map(f => f.id)).toEqual(['lve'])
    expect(toggleFigure('lve')).toBe(false)
    expect(visibleFigures().map(f => f.id)).toEqual(['lve'])
  })
  it('persists the hidden list and reads it back', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    toggleFigure('pl')
    expect(JSON.parse(backend.read('fighidden')!)).toEqual(['pl'])
    initStore(backend)
    expect(getState().figureHidden).toEqual(['pl'])
  })
  it('Reset puts the order back AND shows everything again', () => {
    setRole('admin')
    toggleFigure('pl')
    moveFigure('medtot', -1)
    resetFigureOrder()
    expect(getState().figureHidden).toEqual([])
    expect(getState().figureOrder).toEqual([...DEFAULT_FIGURE_ORDER])
  })
})
