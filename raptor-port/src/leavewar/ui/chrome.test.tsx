import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { advanceStage, getState, initStore, setBidState, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { StageBar, Topbar } from './Chrome'

beforeEach(() => {
  initStore(memoryBackend())
})

describe('the stage strip', () => {
  it('names the stage the period is in', () => {
    render(<StageBar />)
    expect(getState().period.stage).toBe('open')
    expect(screen.getByTestId('stage-now').textContent).toBe('OPEN FOR BIDDING')
  })

  // Advancing the cycle is an admin function (owner, 27 Aug 26 — "for a member
  // i shouldnt be able to click on bidding closed or published"). The control
  // is ABSENT for a member, not merely disabled — the same idiom the step-back
  // control already uses — so there is nothing for them to click. A member
  // still sees the stage and bids as before; this is the only change.
  it('shows the stage-advance control to an admin and hides it from a member', () => {
    act(() => setRole('member'))
    const m = render(<StageBar />)
    expect(screen.queryByTestId('stage-advance')).toBeNull()
    expect(screen.getByTestId('stage-now').textContent).toBe('OPEN FOR BIDDING')
    m.unmount()
    act(() => setRole('admin'))
    render(<StageBar />)
    expect(screen.getByTestId('stage-advance')).toBeTruthy()
  })

  // The under-manned tally is the one number in the chrome that depends on
  // the bid states, and it is counted from its own evaluatePeriod call
  // rather than shared with the Matrix. A strip still passing `{}` there
  // would render the right stage and the wrong count, so this drives a
  // refusal through and asserts the tally moves.
  //
  // RAMP is the only SXO on the roster and the SXO rule reds at 1, so his
  // approved OL on 1 Jan is what makes that day red. Refusing it puts him
  // back at work and the day with him.
  it('counts under-manned days against the live bid states', () => {
    render(<StageBar />)
    const before = screen.getByTestId('undermanned').textContent
    // deciding is the admin's, once bidding is closed (canDecide — the store
    // refuses it otherwise since the 27 Aug overnight pass)
    act(() => { setRole('admin'); advanceStage(); setBidState('ramp', '2026-01-01', 'refused') })
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
    expect(text).toContain('Pending')
    expect(text).toContain('Refused')
    expect(text).toContain('Filed on the Inputs page')
    expect(text).toContain('AM (before the code)')
    expect(text).toContain('PM (after the code)')
    // The moved row appears only once bidding has closed — at `open` no cell
    // can wear the stripe (movedShown), and a legend advertising a mark the
    // grid cannot show sends readers hunting for it (27 Aug 26).
    expect(text).not.toContain('Moved here from another day')
    // the swatches reuse the grid's own classes, so the key cannot drift from
    // the cells (the blue 'raptor' edge mark; the dotted-orange 'moved' below)
    expect(leg.querySelector('.leg-sw.raptor')).toBeTruthy()
  })

  it('the moved row joins the key once bidding is closed', () => {
    setRole('admin')
    advanceStage()
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('legend-open'))
    const leg = screen.getByTestId('legend')
    expect(leg.textContent).toContain('Moved here from another day')
    expect(leg.querySelector('.leg-sw.moved')).toBeTruthy()
  })

  // Owner, 28 Aug 26: the legend must also explain the LETTERS — above all
  // FS/HS, which appear only on the war grid and are never typed on Inputs.
  it('explains the grid codes, FS/HS first and marked as war-only', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('legend-open'))
    const leg = screen.getByTestId('legend')
    const text = leg.textContent || ''
    // the two codes the owner named — with their meanings, not just the letters
    expect(text).toContain('full day SC duty'.replace(/^./, c => c.toUpperCase()))
    expect(text).toContain('half day SC duty'.replace(/^./, c => c.toUpperCase()))
    expect(text).toContain('off in lieu')
    // flagged as the group that lives only here, and given the grid's duty colour
    expect(text).toContain('not on the Inputs page')
    expect(leg.querySelector('.leg-sec-here')).toBeTruthy()
    const fs = Array.from(leg.querySelectorAll('.leg-sw')).find(s => s.textContent === 'FS')
    expect(fs, 'FS has a swatch').toBeTruthy()
    expect(fs!.classList.contains('sc'), 'FS wears the grid duty colour').toBe(true)
    // the medical shorthand the grid shows (B / C) and the leave codes are keyed too
    expect(Array.from(leg.querySelectorAll('.leg-sw')).some(s => s.textContent === 'B')).toBe(true)
    expect(Array.from(leg.querySelectorAll('.leg-sw')).some(s => s.textContent === 'LL')).toBe(true)
    expect(text).toContain('Local leave')
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
