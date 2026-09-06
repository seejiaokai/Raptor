import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_FIGURE_ORDER, FIGURES } from '../engine'
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

  // The key is stated once, and every row's caption is the owner's own words
  // (`Figure.desc`) — the one source the title pop-up, this sheet and the
  // page Legend all read, so the three can never disagree (owner, 6 Sep 26).
  it('states the key once and each column\'s meaning under its row', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.getByTestId('counter-legend').textContent).toBe('+ balance left · − days used · LL amber · OL red')
    expect(screen.getByTestId('figsub-lvetot').textContent).toBe('All leave taken: LL + OL + OIL + CCL + FCL + CL + PL')
    expect(screen.getByTestId('figsub-lve').textContent).toBe('Balance of local + overseas leave: opening + granted − LL − OL')
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
    // …and a medical mark, matching the title's own claim.
    fireEvent.click(screen.getByTestId('cell-ramp-2026-03-04'))
    fireEvent.click(screen.getByTestId('bid-HL'))
    expect(screen.getByTestId('counter-name').textContent).toBe('−MED TOT')
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

  // The admin eye (owner, 6 Sep 26 — "admin should also be able to
  // customise" which figures show at all): hiding a figure in the picker
  // drops it from the column's cycle at once — the dots are `visibleFigures`.
  it('offers an admin an eye per figure; hiding one drops it from the column\'s cycle', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    fireEvent.click(screen.getByTestId('figeye-pl'))
    expect(screen.getByTestId('figeye-pl').getAttribute('aria-pressed')).toBe('true')
    expect(getState().figureHidden).toEqual(['pl'])
    fireEvent.click(screen.getByTestId('counter-cancel'))
    // the column cycles seven now
    expect(screen.getByTestId('counter-head').querySelectorAll('.cdot')).toHaveLength(7)
  })
  it('offers a member no eye', () => {
    setRole('member')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.queryByTestId('figeye-pl')).toBeNull()
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
  it('opens from a tap on a person’s counter cell and breaks MED TOT into its three markers', () => {
    render(<Matrix />)
    pick('medtot')
    // splice's seed medical: one ATT C (5 Jan) and one OML (6 Jan).
    fireEvent.click(screen.getByTestId('bal-splice'))
    const sheet = screen.getByTestId('figure-breakdown')
    expect(sheet.textContent).toContain('SPLICE')
    expect(sheet.textContent).toContain('MED TOT')
    const rows = [...sheet.querySelectorAll('.crow-top')].map(r => r.textContent)
    expect(rows).toEqual(['ATT C1', 'HL0', 'OML1', 'Total2'])
  })

  it('breaks a balance into opening + granted − taken, and closes', () => {
    render(<Matrix />)
    // +LVE is the default figure. RAMP: 12 opening + 14 granted − 0 taken = 26.
    fireEvent.click(screen.getByTestId('bal-ramp'))
    const sheet = screen.getByTestId('figure-breakdown')
    const rows = [...sheet.querySelectorAll('.crow-top')].map(r => r.textContent)
    // ramp's OL is on New Year's Day (a seeded PH) — taken reads 0 since 3 Sep
    // 26 — and LVE now splits its taken line per type (LL, OL) rather than one
    // generic "taken" row (6 Sep 26).
    expect(rows).toEqual(['opening figure12', 'granted14', 'LL taken0', 'OL taken0', 'Total26'])
    fireEvent.click(screen.getByTestId('breakdown-close'))
    expect(screen.queryByTestId('figure-breakdown')).toBeNull()
  })

  // OIL keeps its own ledger (earned + granted, not only opening), so it no
  // longer restates as a single line — every one of the eight figures now
  // defines its own parts (engine/counters.test.ts pins the fallback branch
  // against a stand-in figure instead, since no real one still takes it).
  it('breaks OIL into opening, granted, earned and taken, and still sums to the balance', () => {
    render(<Matrix />)
    pick('oil')
    fireEvent.click(screen.getByTestId('bal-ramp'))
    const rows = [...screen.getByTestId('figure-breakdown').querySelectorAll('.crow-top')].map(r => r.textContent)
    // ramp: opening 3, no OIL grant, one earned FO day (3 Jan), one pending
    // half-day OIL taken (10 Feb) = 3 + 0 + 1 − 0.5 = 3.5.
    expect(rows).toEqual(['opening figure3', 'granted0', 'earned by weekend/PH work1', 'OIL taken-0.5', 'Total3.5'])
  })
})

describe('the picker answers with the viewer\'s own numbers (owner, 17 Aug 26)', () => {
  // Each row's value is now the SAME two-line box the grid cell wears — a
  // balance on top, its used lines under it — rather than plain "26 left"
  // text (owner, 6 Sep 26). "yours" stays gone from the rows: the VIEWING AS
  // header already says whose numbers these are, once (28 Aug 26).
  it('shows the viewing person\'s box on each row — balance and used', () => {
    setViewer('ramp')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.getByTestId('counter-lve').querySelector('.fb')!.textContent).toBe('26')
    // RAMP's +OIL: opening 3 + earned 1 (FO) − 0.5 taken = 3.5, half a day
    // (OIL) taken shown as the used line under it.
    expect(screen.getByTestId('counter-oil').querySelector('.fb')!.textContent).toBe('3.5')
    expect(screen.getByTestId('counter-oil').querySelector('.fu b')!.textContent).toBe('0.5')
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
  // Set on every plain balance (owner, 6 Sep 26): the eight figures, LVE/
  // CCL/FCL/CL/PL each grow a Set button, OIL does not (the tracker owns it).
  it('lists the eight with that person\'s numbers, Set on every plain balance', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    const sheet = screen.getByTestId('person-figures')
    expect(sheet.querySelectorAll('.crow-wrap')).toHaveLength(8)
    for (const id of ['lve', 'ccl', 'fcl', 'cl', 'pl']) expect(screen.getByTestId(`${id}-edit`)).toBeTruthy()
    expect(screen.queryByTestId('oil-edit')).toBeNull()   // OIL is the tracker's
  })

  it('a figure row opens that figure\'s breakdown for that person', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-splice'))
    fireEvent.click(screen.getByTestId('pfig-medtot').querySelector('.crow')!)
    // The figures sheet hands over to the breakdown — MED TOT, splice's parts.
    expect(screen.queryByTestId('person-figures')).toBeNull()
    const bd = screen.getByTestId('figure-breakdown')
    expect(bd.textContent).toContain('SPLICE')
    expect(bd.textContent).toContain('MED TOT')
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
  // Mirrors moveFigure's own unknown-id no-op (store.ts) — an id naming no
  // real figure must be refused, not recorded as hidden forever.
  it('refuses an id that names no real figure', () => {
    setRole('admin')
    expect(toggleFigure('bogus')).toBe(false)
    expect(getState().figureHidden).toEqual([])
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
  // A stale `fighidden` blob naming EVERY figure (a squadron's storage from
  // before a figure was added, or plain corruption) must not boot to an
  // empty column — `visibleFigures` falls back to the whole order rather
  // than showing nothing.
  it('falls back to the whole order when every figure is hidden in storage', () => {
    const backend = memoryBackend()
    backend.write('fighidden', JSON.stringify(FIGURES.map(f => f.id)))
    initStore(backend)
    expect(visibleFigures().map(f => f.id)).toEqual([...DEFAULT_FIGURE_ORDER])
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
