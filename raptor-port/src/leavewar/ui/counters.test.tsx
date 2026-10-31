import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setLwOnScreen } from '../state/screen'

import { DEFAULT_FIGURE_ORDER, FIGURES } from '../engine'
import { closeDates, getState, grantTo, selectWar, initStore, leaveFiguresOf, setBidState, setCell, setPeople, setRole, setTypedBalance, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { fileAbsence, elevenCounters } from '../testkit'
import { FigureCell } from './FigureCell'
import { figWords } from './figwords'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
  elevenCounters()   // the app starts with NO counters (D669); these tests are about counters, so they make the old eleven — testkit
  // SPLICE's medical is MEMBER-FILED now (owner, 13 Sep 26) — the pristine seed
  // carries none, so ingest one member-filed ATT C / OML (exactly as a member's
  // Inputs filing syncs in) to exercise the MED TOT breakdown the war displays.
  fileAbsence('splice', 'ATTC', '2026-01-05')
  fileAbsence('splice', 'OML', '2026-01-06')
})

/* THE COLUMN BESIDE THE NAMES IS LVE ALONE (D1245, 22 Oct 26 — "on the grid each name keeps only its LVE figure beside
   it"; every other balance lives on the Balances tab, M5). Its heading is a plain label now: no picker, no dots, no swipe,
   no jump to the balance just written. The tests below that only proved the picker (choosing a figure, the counter
   sheet opened from the grid, the snap after a write) are skipped, not deleted — the picker's code leaves whole with M5,
   and these go with it. A figure's numbers, its breakdown and the store's gates are still live, and are re-expressed
   through what the grid still offers: the person's window (a tap on his name) and his LVE cell. */

/** Open the counter sheet and choose one — only the skipped picker tests (D1245) still call it. */
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

  /* REWRITTEN FOR M5a (the build spec §1.4, finding 12): the second line was LL amber and OL red, of all time; it is now
     ONE amber number — his LL and OL days in the View period, approved and pending, as charged (the drawings' Ranger
     "12.5 / 7.5"); the top his War bal, the bids already off it (D1153). RAMP's OL on 1 Jan is a public holiday and
     charges nothing, so his three bids make it 3. */
  it('stacks his LL and OL days of the View period under his War bal — one amber number, no minus, nothing for zero', () => {
    setRole('admin')
    setCell('ramp', '2026-03-02', 'LL')
    setCell('ramp', '2026-03-03', 'LL')
    setCell('ramp', '2026-03-04', 'OL')
    render(<Matrix />)
    expect(top('ramp')).toBe('23')
    const used = screen.getByTestId('bal-ramp').querySelectorAll('.fu b')
    expect([...used].map(b => b.textContent)).toEqual(['3'])
    expect(used[0]!.className).toBe('amber')
    // a person with nothing taken shows no used line at all
    expect(screen.getByTestId('bal-tata').querySelectorAll('.fu b')).toHaveLength(0)
  })

  // The reason the panel cycles figures rather than showing all of them: every
  // row has to change together, or row 1 shows +LVE while row 2 shows −OIL.
  // Gone by D1245: the column no longer changes figure (the picker's code leaves whole with M5).
  it.skip('changes every row at once when the figure changes', () => {
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
  // Gone by D1245: nothing on the grid opens the counter sheet (the picker's code leaves whole with M5).
  it.skip('offers every figure, in order, each a single tap away', () => {
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

  // Gone by D1245: there is one figure, and no counter sheet from the grid to mark it in (leaves whole with M5).
  it.skip('marks which figure is already showing', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.getByTestId('counter-lve').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('counter-oil').getAttribute('aria-pressed')).toBe('false')
  })

  // The key is stated once, and every row's caption is the owner's own words
  // (`Figure.desc`) — the one source the title pop-up, this sheet and the
  // page Legend all read, so the three can never disagree (owner, 6 Sep 26).
  // Gone by D1245: the counter sheet that carried these captions is no longer opened from the grid (leaves with M5).
  it.skip('states the key once and each column\'s meaning under its row', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.getByTestId('counter-legend').textContent).toBe('+ balance left · − days used · LL amber · OL red')
    expect(screen.getByTestId('figsub-lvetot').textContent).toBe('All leave taken: LL + OL + OIL + CCL + FCL + CL + PL')
    expect(screen.getByTestId('figsub-lve').textContent).toBe('Balance of local + overseas leave: opening + granted − LL − OL')
  })

  // The figure is what makes the list answerable: each row previews the
  // VIEWING person's number so "which counter" can be settled by looking for
  // the one running out.
  // Gone by D1245: a preview for choosing the column, and the column no longer chooses (leaves whole with M5).
  it.skip('shows the viewing person\'s number beside each counter', () => {
    setViewer('ramp')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    const oil = screen.getByTestId('counter-oil').textContent!
    expect(oil).toContain('OIL')
    expect(oil).toMatch(/-?\d/)
  })

  // Gone by D1245: the counter sheet's preview, no longer opened from the grid (the picker's code leaves whole with M5).
  it.skip('shows a dash, not a squadron-wide sum, when no one is being viewed (owner, 18 Aug 26)', () => {
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
    // the refusal is management's (canDecide — the admin, at any time since the stages went, D1177)
    act(() => { setRole('admin'); closeDates('2026-01-01', '2026-12-31'); setBidState('dusk', '2026-02-11', 'refused') })
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

  // Re-expressed for D1245: the heading is no longer a control, so it no longer says "choose" — but it still names its
  // figure in words, not only in the chip, and offers no picker.
  it('names the figure for a screen reader, not just in the chip', () => {
    render(<Matrix />)
    const head = screen.getByTestId('counter-head')
    const label = head.getAttribute('aria-label')!   // on the heading cell, which a screen reader honours
    expect(label).toContain('LVE')
    expect(head.querySelector('button')).toBeNull()
    expect(screen.queryByTestId('counter-pick')).toBeNull()
  })

  // §Counters: a balance is allowed to run negative, and negative shows red — with its minus — and is never
  // refused; a USED number never carries one (the column title's own minus,
  // and the colour, already say it is spent). RESET is the seed's standing
  // example: opens at 2 annual, less four LL days pending in the 2027 war
  // (a balance counts across every war, not just the one on screen) = −2.
  // Since M5a the second line counts the VIEW period's LL and OL alone (the build spec §1.4): none in Jan – Dec 26, so no
  // `.fu` entry at all; with Jan – Dec 27 in view, his four — never with a minus.
  it('paints a negative balance red, with its minus, and never a used number with one', () => {
    render(<Matrix />)
    const box = screen.getByTestId('bal-reset')
    expect(box.querySelector('.fb')!.textContent).toBe('−2')
    expect(box.querySelector('.fb')!.classList.contains('neg')).toBe(true)
    expect(usedOf('reset')).toEqual([])
    act(() => selectWar(getState().wars[1]!.period.id))
    expect(screen.getByTestId('bal-reset').querySelector('.fb')!.textContent).toBe('−2')
    expect(usedOf('reset')).toEqual(['4'])
  })
})

/* "A column never widens and a number never wraps — the rare over-wide value
   (a three-digit balance) drops one type size inside its box" (spec §2). The
   TYPE SIZE is CSS, which jsdom cannot see; what it can prove is which boxes
   ask for it, which is the half that would silently stop happening. The
   measurement that chose four characters is in FigureCell.tsx. */
describe('an over-wide value drops a type size rather than spilling (spec §2)', () => {
  /** A box with exactly these lines, drawn the way the grid draws it. */
  const box = (top: number, used: { label: string; tone: 'white' | 'amber' | 'red'; value: number }[]) => {
    const { container } = render(
      <FigureCell figure={FIGURES[0]!} lines={{ top, used }} personId="x" extraClass="bal act" />,
    )
    return container.querySelector('td')!
  }
  const LL = (value: number) => ({ label: 'LL', tone: 'amber' as const, value })
  const OL = (value: number) => ({ label: 'OL', tone: 'red' as const, value })

  it('leaves an ordinary box alone — two digits over one', () => {
    expect(box(26, [OL(4)]).classList.contains('wide')).toBe(false)
  })

  it('shrinks a four-character balance', () => {
    expect(box(-100, []).classList.contains('wide')).toBe(true)
    // Three still fits, so it is not shrunk for nothing.
    expect(box(100, []).classList.contains('wide')).toBe(false)
    expect(box(-10, []).classList.contains('wide')).toBe(false)
  })

  it('shrinks a used line of two two-digit numbers — they share one line', () => {
    expect(box(26, [LL(12), OL(10)]).classList.contains('wide')).toBe(true)
    // ...but a zero shows nothing, so it costs the line nothing either.
    expect(box(26, [LL(12), OL(0)]).classList.contains('wide')).toBe(false)
  })

  /* (the figure is TYPED since M5a — `setTypedBalance`, the person window's and the Balances page's door; the old "Set" that
     moved an opening went with the figures sheet. The box beside his name reads his War bal — D1153.) */
  it('reaches the real grid cell, not just the component', () => {
    setRole('admin')
    expect(setTypedBalance('ramp', 'LVE', -200)).toBe(true)
    render(<Matrix />)
    const war = leaveFiguresOf('ramp').kinds.LVE.war
    expect(war).toBeLessThan(-99)                      // four characters: the box drops a type size
    expect(screen.getByTestId('bal-ramp').classList.contains('wide')).toBe(true)
    expect(top('ramp')).toBe(figWords(war))            // its true minus, as every surface writes it (walker D's FAIL 5)
    // Every box carries `figbox` — the class the box's own styling hangs off,
    // so `td.bal` at large no longer decides how the manning rows' cell reads.
    expect(screen.getByTestId('bal-ramp').classList.contains('figbox')).toBe(true)
    expect(screen.getByTestId('counter-count-ip').classList.contains('figbox')).toBe(false)
  })
})

describe('the counter follows the leave just entered — to the balance it comes off (6 Sep 26)', () => {
  // The owner's ask: "If the user inputs a leave for e.g OIL, the leave
  // counter will snap to show how many OIL they have." The figure then
  // answers the question the bidder is holding in their head at that moment,
  // instead of showing a pool they were not thinking about. LL and OL both
  // come off the ONE LVE balance now (its two used lines, not two figures),
  // so entering either lands on the same +LVE.
  // Gone by D1245 ("no jump to OIL or CCL after a write" — the M2 code read's F2): the column stays LVE whatever is
  // written (bidding.test.tsx and oiltracker.test.tsx pin that it stays). Skipped; the picker's code leaves whole with M5.
  it.skip('switches to LVE for LL and OL, OIL for OIL', () => {
    // The medical case is gone: medical is member-filed only now (owner,
    // 13 Sep 26), so there is no war picker to enter a medical mark and snap
    // the column to MED TOT. LL/OL → +LVE and OIL → +OIL still apply.
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

  // Gone by D1245: there is no snap, for a half day or a whole one.
  it.skip('snaps for a half day exactly as for a whole one', () => {
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
    // Re-expressed for D1245: the last check opened the counter sheet to find no OFF figure there; that sheet is no
    // longer opened from the grid, so it reads the figure catalogue the sheet listed from instead.
    expect(FIGURES.some(f => f.id === 'off')).toBe(false)
  })

  /* Delete (the old Clear, D332) is drawn only where there is something to delete, so the day holds a bid first — one
     placed off the sheet, which snaps no column — and Deleting it leaves the column where it was. */
  it('deleting a cell moves nothing', () => {
    setCell('dusk', '2026-02-11', 'EL')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(getState().grid.dusk?.['2026-02-11']).toBeFalsy()
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

  /* SWITCHING THE COLUMN'S FIGURE FLASHES NOTHING. The flash means "this
     person's number just moved"; every number on screen changing because the
     column now shows a different figure is not that, and sixty rows lighting up
     on every picker tap would make the signal worthless. The `prev` ref is keyed
     by figure id for exactly this reason (FigureCell), and the contract is
     stated in three docs — so it is pinned here rather than left to be
     rediscovered. The existing test proves a flash HAPPENS; this proves the
     other half.
     Gone by D1245: the column's figure no longer switches, so there is nothing for it to flash on (leaves with M5). */
  it.skip('flashes NO row when the picker merely switches the figure', () => {
    render(<Matrix />)
    const before = getState().people.map(p => top(p.id))
    pick('oil')
    // Every number on screen changed...
    expect(getState().people.map(p => top(p.id))).not.toEqual(before)
    // ...and not one box asked for the flash.
    expect([...document.querySelectorAll('td.bal.flash')]).toHaveLength(0)
  })

  /* The class comes off on `animationend` — but under `prefers-reduced-motion`
     matrix.css turns the animation off, so that event never arrives. Without a
     fallback the class stayed on the cell for the life of the row: invisible,
     and a lie to anything reading the DOM for "what just changed". */
  it('clears the flash on a timer too, for the browser that runs no animation', () => {
    vi.useFakeTimers()
    try {
      setRole('admin')
      render(<Matrix />)
      fireEvent.click(screen.getByTestId('cell-ramp-2026-03-02'))
      fireEvent.click(screen.getByTestId('bid-LL'))
      expect(screen.getByTestId('bal-ramp').classList.contains('flash')).toBe(true)
      // Deliberately NO `animationend` — that is the whole case.
      act(() => { vi.advanceTimersByTime(700) })
      expect(screen.getByTestId('bal-ramp').classList.contains('flash')).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('reordering the figures', () => {
  // The ARRANGEMENT is management's since 17 Aug 26 ("normal user should
  // not have authority to change the leave war column arrangement") — every
  // reorder test runs as admin, and the member case pins the gate.
  beforeEach(() => setRole('admin'))
  /* The reorder and hide controls lived in the counter sheet, which the grid no longer opens (D1245). The tests that
     only drove those controls are skipped (the picker's code leaves whole with M5); the store's own gate and its saving
     are still live, and are re-expressed through the store. */

  /* (Two tests stood here and below — a member refused the reorder at the store, and the order saved and read back. Their
     writers, `moveFigure` and `resetFigureOrder`, went with M5a: their one reader, the figures sheet and its picker, was
     replaced by the person window, which lists every kind whatever a saved order says. The skipped picker tests stay on
     record.) */

  // The admin eye (owner, 6 Sep 26 — "admin should also be able to
  // customise" which figures show at all): hiding a figure in the picker
  // drops it from the column's cycle at once — the dots are `visibleFigures`.
  // Gone by D1245: no eye, no cycle and no dots on the grid (the picker's code leaves whole with M5).
  it.skip('offers an admin an eye per figure; hiding one drops it from the column\'s cycle', () => {
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
  // Gone by D1245: the eye was the counter sheet's, no longer opened from the grid (leaves whole with M5).
  it.skip('offers a member no eye', () => {
    setRole('member')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect(screen.queryByTestId('figeye-pl')).toBeNull()
  })

  // Gone by D1245: the counter sheet's arrows, and a column that has no order to follow (leaves whole with M5).
  it.skip('moves a figure down, and the column follows the new order', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    // LVE is first; nudging it down puts OIL at the top of the list.
    fireEvent.click(screen.getByTestId('figdown-lve'))
    const labels = [...screen.getByTestId('counter-sheet').querySelectorAll('.crow .cn')].map(e => e.textContent)
    expect(labels[0]).toBe('OIL')
    expect(labels[1]).toBe('LVE')
    expect(getState().figureOrder[0]).toBe('oil')
  })

  // Gone by D1245: the counter sheet's arrows, no longer opened from the grid (leaves whole with M5).
  it.skip('clamps at the ends — the first cannot go up, the last cannot go down', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect((screen.getByTestId('figup-lve') as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByTestId('figdown-medtot') as HTMLButtonElement).disabled).toBe(true)
  })

  // Gone by D1245: the counter sheet's Reset button (the store's reset is pinned below, "Reset puts the order back").
  it.skip('resets to the catalogue order', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    fireEvent.click(screen.getByTestId('figdown-lve'))
    expect(getState().figureOrder[0]).toBe('oil')
    fireEvent.click(screen.getByTestId('counter-reset'))
    expect(getState().figureOrder[0]).toBe('lve')
  })

  // Gone by D1245: the column shows LVE alone, so there is no figure "shown" to keep (leaves whole with M5).
  it.skip('keeps the SAME figure shown across a reorder, not the same slot', () => {
    render(<Matrix />)
    // Show OIL, then move it down. The column must still show OIL.
    pick('oil')
    expect(screen.getByTestId('counter-name').textContent).toBe('+OIL')
    fireEvent.click(screen.getByTestId('counter-pick'))
    fireEvent.click(screen.getByTestId('figdown-oil'))
    expect(screen.getByTestId('counter-name').textContent).toBe('+OIL')
  })

})

describe('going negative is asked about, never refused', () => {
  // §Counters, and the owner twice: a balance is allowed to run negative,
  // so this can never be a refusal. What was wrong
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

  it('[LW-ARMS-PAGE-LEAVE-REST] the below-zero ask is taken back when the Leave War leaves the screen', () => {
    setLwOnScreen(true)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-reset-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(screen.getByTestId('span-note').textContent).toContain('RESET')
    act(() => setLwOnScreen(false))                                  // another page in front
    act(() => setLwOnScreen(true))                                   // and back
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(getState().grid.reset?.['2026-02-11'], 'asked again, nothing written').toBeUndefined()
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
    // named as its COLUMN names it — "LVE" (the +LVE figure), not the counter's inner name "annual", which no screen
    // shows (D418's shared words, ui/belowzero.ts, 29 Sep 26 — the drag sheet asks in the same sentence)
    expect(said).toContain('LVE')
    expect(said).not.toContain('ANNUAL')
    expect(said).toMatch(/−\d/)                       // the true minus, as every surface writes it (walker D's FAIL 5)
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
  // Counted by the balance column's OWN rule since D418 (29 Sep 26 — the store's `balanceAfterFill`): a weekend or a holiday day of
  // leave costs nothing, so the span's WORKING days are what it spends. (This test used to take DUSK from 9 to 27 Feb
  // and ask — only because every calendar day was counted; the fortnight's working days, two holidays off, leave him in
  // credit, and the column agrees.) From a balance of 5, one Monday alone stays in credit; Mon 9 – Fri 20 Feb spends
  // ten working days less the two public holidays the demo war marks (17–18 Feb) — 8, so it asks, at -3.
  it('counts the whole range, not just its first day — its working days, as the column does', () => {
    const was = getState().role
    setRole('admin')                                   // a balance is typed by an admin here; the bid itself as before
    // a War bal of 5 — App bal is typed, his days already pending come off it (D1479)
    expect(setTypedBalance('dusk', 'LVE', 5 + leaveFiguresOf('dusk').kinds.LVE.pending)).toBe(true)
    expect(leaveFiguresOf('dusk').kinds.LVE.war).toBe(5)
    setRole(was)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-09'))
    fireEvent.click(screen.getByTestId('span-range'))
    fireEvent.click(screen.getByTestId('span-day-2026-02-20'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    const said = screen.getByTestId('span-note').textContent!
    expect(said).toContain('DUSK')
    expect(said).toContain('to −3 LVE')
    expect(getState().grid.dusk?.['2026-02-09']).toBeUndefined()
  })

})

/* (THE PER-PERSON BREAKDOWN SHEET — opening + granted − taken, MED TOT's markers, each grant itemised — went with M5a: a tap
   on the LVE figure beside a name opens his person window (reading 15), which shows the figures as the official leave app
   keeps them (D1479) and no breakdown; OIL's own ledger, every award and correction itemised, is the OIL tracker's
   (oiltracker.test.tsx). Its tests went with it.) */

describe('the picker answers with the viewer\'s own numbers (owner, 17 Aug 26)', () => {
  // Each row's value is now the SAME two-line box the grid cell wears — a
  // balance on top, its used lines under it — rather than plain "26 left"
  // text (owner, 6 Sep 26). "yours" stays gone from the rows: the VIEWING AS
  // header already says whose numbers these are, once (28 Aug 26).
  // Gone by D1245 (both tests here): the counter sheet's preview, no longer opened from the grid — a person's own
  // numbers are in his window (pinned under "a callsign opens the all-figures sheet"). Leaves whole with M5.
  it.skip('shows the viewing person\'s box on each row — balance and used', () => {
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

  it.skip('shows a dash, not a squadron-wide sum, when nobody (or an unknown id) is viewing', () => {
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
  /* Re-expressed for M5a (D1480, D1201): the callsign opens his PERSON WINDOW — every kind's tile at once, a box on every
     typed kind for an admin, OIL never a box (the tracker is its editor — D1209), MED his medical days. The figures sheet's
     eight rows (LVE TOT among them, which went to the Balances page's Days taken — D1480's reading) and a row's breakdown
     went with it. */
  it('lists every kind with that person\'s figures, a box on every typed kind, never on OIL', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-ramp'))
    for (const k of ['LVE', 'OIL', 'MED', 'CCL', 'FCL', 'PL', 'EL', 'CL']) expect(screen.getByTestId(`pw-tile-${k}`)).toBeTruthy()
    for (const k of ['LVE', 'CCL', 'FCL', 'PL', 'EL', 'CL']) expect(screen.getByTestId(`pw-${k}`).tagName).toBe('INPUT')
    expect(screen.queryByTestId('pw-OIL')).toBeNull()
    expect(screen.getByTestId('pw-oil').tagName).toBe('BUTTON')
  })

  it('his MED tile counts his medical days this year up to today', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('person-splice'))
    expect(screen.getByTestId('pw-med').textContent).toBe(String(leaveFiguresOf('splice').medTaken))
    expect(screen.queryByTestId('figure-breakdown')).toBeNull()
  })
})

/* (HIDING A FIGURE — `toggleFigure`, `visibleFigures` and Reset — went with M5a: the figures sheet that read the hidden list
   was replaced by the person window, which shows every kind whatever an old hidden list says (the spec §4). The saved list
   is still read and written whole with the war's settings; nothing changes it now.) */
