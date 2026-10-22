import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { closeDates, getState, initStore, setBidState, setCell, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { setSession } from '../../state/auth'
import { StageBar, Topbar } from './Chrome'

beforeEach(() => {
  initStore(memoryBackend())
  elevenCounters()   // the app starts with NO counters (D669); these tests are about counters, so they make the old eleven — testkit
})

/* THE STAGE STRIP WENT WITH THE STAGES (owner, D1177, 21 Oct 26): its stage chip and its two moves are one chip now,
   the open dates, whose tap opens the "Open for bidding" window (the window's own tests: window.test.tsx; the phone's
   words: phonehead.test.tsx). */
describe('the open-dates strip', () => {
  /* WAS "names the stage the period is in". The chip names what is open instead. */
  it('names the dates open for bidding', () => {
    render(<StageBar />)
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
    expect(screen.getByTestId('open-chip').textContent).toBe('Open for bidding 1 Jan – 31 Mar')
  })

  // Opening and closing dates is an admin function (owner, 27 Aug 26 — "for a member i shouldnt be able to click on
  // bidding closed or published", carried over to the open dates by D1177). The CONTROLS are absent for a member, not
  // merely disabled where they can be — nothing for him to press — while the chip still opens the window for him to
  // read what is open.
  it('gives the controls to an admin and hides them from a member', () => {
    act(() => setRole('member'))
    const m = render(<StageBar />)
    fireEvent.click(screen.getByTestId('open-chip'))
    expect(screen.getByTestId('open-dates')).toBeTruthy()
    expect(screen.queryByTestId('od-more')).toBeNull()
    expect(screen.queryByTestId('od-cal-2026-01-01')).toBeNull()
    m.unmount()
    act(() => setRole('admin'))
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('open-chip'))
    expect(screen.getByTestId('od-more')).toBeTruthy()
    expect(screen.getByTestId('od-cal-2026-01-01')).toBeTruthy()
  })

  // The under-manned tally is the one number in the chrome that depends on
  // the bid states, and it is counted from its own evaluatePeriod call
  // rather than shared with the Matrix. A strip still passing `{}` there
  // would render the right dates and the wrong count, so this drives a
  // refusal through and asserts the tally moves.
  //
  // RAMP is the only SXO on the roster and the SXO rule reds at 1, so his
  // approved OL on 1 Jan is what makes that day red. Refusing it puts him
  // back at work and the day with him.
  it('counts under-manned days against the live bid states', () => {
    render(<StageBar />)
    const before = screen.getByTestId('undermanned').textContent
    // deciding is the admin's, at any time (canDecide — D1177; the store refuses anyone else)
    act(() => { setRole('admin'); setBidState('ramp', '2026-01-01', 'refused') })
    const after = screen.getByTestId('undermanned').textContent
    expect(after).not.toBe(before)
    expect(Number(after!.split(' ')[0])).toBe(Number(before!.split(' ')[0]) - 1)
  })
})

describe('the colour/mark legend', () => {
  // Owner, 27 Aug 26: a pop-out key for the grid's colours and marks. Open to
  // everyone (it explains the grid, it does not change it) and self-consistent
  // with the cells — the swatches carry the grid's own state/edge classes.
  it('opens a key explaining the states, the edge marks and the half-day *', () => {
    render(<StageBar />)
    expect(screen.queryByTestId('legend')).toBeNull()
    fireEvent.click(screen.getByTestId('legend-open'))
    const leg = screen.getByTestId('legend')
    const text = leg.textContent || ''
    expect(text).toContain('Approved')
    // "Ack" since 21 Sep 26 — the owner renamed his own 27 Aug "Pending", and
    // the legend has to say what the button says or the key explains a word
    // that is no longer on any screen.
    expect(text).toContain('Ack')
    expect(text).toContain('Refused')
    expect(text).toContain('Filed on the Inputs page')
    expect(text).toContain('AM (before the code)')
    expect(text).toContain('PM (after the code)')
    // The moved row ALWAYS shows since the stages went (D1177's reading: the dotted "moved" mark shows on any move of
    // a leave already approved, so the grid can wear it whatever is open). Its own test is below.
    expect(text).toContain('Moved here from another day')
    // the swatches reuse the grid's own classes, so the key cannot drift from
    // the cells (the blue 'raptor' edge mark; the dotted-orange 'moved' below)
    expect(leg.querySelector('.leg-sw.raptor')).toBeTruthy()
  })

  /* ESCAPE CLOSES IT (bug sweep, 28 Aug 26). The legend and the under-manned
     list hang over a full-page scrim, so a pointer always had a way out — but a
     keyboard had none, while the input editor and the Medical as-of picker both
     answered Escape. These two use their own overlay rather than `Sheet`, which
     is why they need their own pin. */
  it('closes on Escape, not only on a scrim tap', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('legend-open'))
    expect(screen.getByTestId('legend')).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('legend')).toBeNull()
  })

  /* KEPT-MOUNTED guard (bug-hunt fix, 1 Sep 26) — same rule as Sheet.tsx: a
     legend left open behind a Raptor tab switch must not answer (or swallow)
     an Escape pressed on a Raptor page. */
  it('ignores Escape while the Leave War section is hidden', () => {
    const pg = document.createElement('section')
    pg.id = 'page-leavewar'; pg.className = 'page doze'
    document.body.appendChild(pg)
    try {
      render(<StageBar />)
      fireEvent.click(screen.getByTestId('legend-open'))
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.getByTestId('legend'), 'a hidden tab must not answer Escape').toBeTruthy()
      pg.className = 'page on'
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByTestId('legend')).toBeNull()
    } finally { pg.remove() }
  })

  /* WAS "the moved row joins the key once bidding is closed" (27 Aug 26: a legend advertising a mark the grid could
     not show at `open` sent readers hunting for it). CHANGED by D1177's reading — the mark shows on ANY move of an
     approved leave, whatever is open — so the row is always in the key: with the dates open and with none. */
  it('the moved row is in the key whatever is open', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('legend-open'))
    expect(screen.getByTestId('legend').textContent).toContain('Moved here from another day')
    expect(screen.getByTestId('legend').querySelector('.leg-sw.moved')).toBeTruthy()
    act(() => { setRole('admin'); closeDates('2026-01-01', '2026-12-31') })
    expect(getState().period.open).toEqual([])
    const leg = screen.getByTestId('legend')
    expect(leg.textContent).toContain('Moved here from another day')
    expect(leg.querySelector('.leg-sw.moved')).toBeTruthy()
  })

  // Owner, 28 Aug 26: the legend must also explain the LETTERS — above all
  // FO/HO, which appear only on the war grid and are never typed on Inputs.
  it('explains the grid codes, FO/HO first and marked as war-only', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('legend-open'))
    const leg = screen.getByTestId('legend')
    const text = leg.textContent || ''
    // the two codes the owner named — with their meanings, not just the letters
    expect(text).toContain('full day OIL'.replace(/^./, c => c.toUpperCase()))
    expect(text).toContain('half day OIL'.replace(/^./, c => c.toUpperCase()))
    expect(text).toContain('off in lieu')
    // flagged as the group that lives only here, and given the grid's duty colour
    expect(text).toContain('not on the Inputs page')
    expect(leg.querySelector('.leg-sec-here')).toBeTruthy()
    const fo = Array.from(leg.querySelectorAll('.leg-sw')).find(s => s.textContent === 'FO')
    expect(fo, 'FO has a swatch').toBeTruthy()
    expect(fo!.classList.contains('sc'), 'FO wears the grid duty colour').toBe(true)
    // the medical shorthand the grid shows (B / C) and the leave codes are keyed too
    expect(Array.from(leg.querySelectorAll('.leg-sw')).some(s => s.textContent === 'B')).toBe(true)
    expect(Array.from(leg.querySelectorAll('.leg-sw')).some(s => s.textContent === 'LL')).toBe(true)
    expect(text).toContain('Local leave')
  })

  // The figures section (owner, 6 Sep 26): the same colours the boxes wear,
  // then every column read off the FIGURES catalogue — one source, so this
  // can never drift from the grid or the picker.
  it('explains the figures — the colours and each column', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('legend-open'))
    const sec = screen.getByTestId('legend-figures')
    expect(sec.textContent).toContain('white')
    expect(sec.textContent).toContain('amber')
    expect(sec.textContent).toContain('+LVE')
    expect(sec.textContent).toContain('Medical days: ATT C + HL + OML')
  })
})

describe('the viewer badge (owner, 28 Aug 26)', () => {
  // The whole page answers for the viewing person; the badge says so out loud,
  // at the top, so nobody wonders whose numbers the counter column shows.
  it('names whose page this is, prominently, when a viewer is set', () => {
    act(() => setViewer('ramp'))
    render(<Topbar />)
    const chip = screen.getByTestId('lw-viewing')
    expect(chip.textContent).toContain('Viewing as')
    expect(chip.textContent).toContain('RAMP')
  })

  // Nobody in the roster being viewed → no "you" to name, so the badge is
  // absent rather than showing an empty or dashed one (mirrors the picker).
  it('is absent when nobody in the roster is being viewed', () => {
    act(() => setViewer('nobody'))
    render(<Topbar />)
    expect(screen.queryByTestId('lw-viewing')).toBeNull()
  })
})

describe('the leave war picker', () => {
  it('says what the picker is, not just which war is in it', () => {
    render(<Topbar />)
    // "JAN - DEC 26" on its own does not say it is the period being bid for,
    // and the picker is the first thing on the screen. The stage strip below
    // labels every one of its chips this way; this one was the odd one out.
    expect(screen.getByTestId('period-label').textContent).toBe('Period')
    // The label has to name the control for a screen reader too, not just
    // sit beside it — `aria-label` was carrying a different word entirely.
    expect(screen.getByTestId('war-picker').getAttribute('aria-label')).toContain('Period')
  })
})

/* [UNDO-TOPBAR] (owner D347, 28 Sep 26): the war's Undo / Redo left this Period row for the app's top bar — the same one
   undo, in Edit Schedule's place and look. Its pressing and its roll-call (every page, every role) are in
   ui/topbar-pair.test.tsx; here, only that this row no longer draws a pair of its own. */
describe('the undo / redo buttons', () => {
  it('are no longer drawn in the war’s own Period row — the app’s top bar carries them', () => {
    setSession({ user: 'ad', role: 'admin' })
    render(<Topbar />)
    expect(screen.queryByTestId('lw-undo')).toBeNull()
    expect(screen.queryByTestId('lw-redo')).toBeNull()
    expect(screen.queryByTestId('lw-hist')).toBeNull()
  })
})
