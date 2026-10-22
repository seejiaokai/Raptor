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
  /* WAS "opens a key explaining the states, the edge marks and the half-day *". The Legend is redrawn for look F
     (D1175, D1158, D1160, D1167): the colour is the kind, the fill where it stands (Approved / Pending a decision /
     Refused — Ack is gone, D1158), the size how much of the day (the "*" half-day section went with the arrows, D1160);
     every swatch is the grid's own box (`.leg-box .c`, the cell's classes). */
  const rowBox = (leg: HTMLElement, words: string) => {
    const row = Array.from(leg.querySelectorAll('.leg-row')).find(r => r.querySelector('.leg-t')?.textContent === words)
    expect(row, `a legend row "${words}"`).toBeTruthy()
    return Array.from(row!.querySelectorAll('.leg-box .c'))
  }
  it('opens a key explaining the colour, the fill, the size and the edge marks (look F)', () => {
    render(<StageBar />)
    expect(screen.queryByTestId('legend')).toBeNull()
    fireEvent.click(screen.getByTestId('legend-open'))
    const leg = screen.getByTestId('legend')
    const text = leg.textContent || ''
    const secs = Array.from(leg.querySelectorAll('.leg-sec')).map(s => s.textContent)
    expect(secs.slice(0, 5)).toEqual(['The colour: what kind', 'The fill: where it stands', 'The size: how much of the day', 'The dates', 'The left edge: where it came from'])
    // the colour: one box per kind, each its own kind and filled
    const kinds = [['Local leave', 'k-ll'], ['Overseas leave', 'k-ol'], ['Course', 'k-cse'], ['Overseas duty', 'k-od'], ['Medical: B, C, OML, HL', 'k-med'], ['Other leave: CCL, FCL, PL, CL, EL', 'k-care']]
    for (const [words, k] of kinds) {
      const [box] = rowBox(leg, words!)
      expect(box!.classList.contains(k!) && box!.classList.contains('s-a'), `${words} is ${k}, filled`).toBe(true)
    }
    expect(text).toContain('Off in lieu (OIL')
    // the fill: approved filled, pending hollow, refused struck — and no Ack (D1158)
    expect(rowBox(leg, 'Approved')[0]!.classList.contains('s-a')).toBe(true)
    expect(rowBox(leg, 'Pending a decision')[0]!.classList.contains('s-w')).toBe(true)
    expect(rowBox(leg, 'Refused')[0]!.classList.contains('s-r')).toBe(true)
    expect(text).not.toContain('Ack')
    // the size: whole, top, bottom — and two entries side by side (D1167)
    expect(rowBox(leg, 'A whole day')[0]!.classList.contains('whole')).toBe(true)
    expect(rowBox(leg, 'Morning (AM)')[0]!.classList.contains('top')).toBe(true)
    expect(rowBox(leg, 'Afternoon (PM)')[0]!.classList.contains('bot')).toBe(true)
    const two = rowBox(leg, 'Two entries on one day')
    expect(two.map(b => [b.classList.contains('left'), b.classList.contains('right')])).toEqual([[true, false], [false, true]])
    // the "*" half-day section is gone with the arrows (D1160)
    expect(text).not.toContain('AM (before the code)')
    expect(text).not.toContain('PM (after the code)')
    expect(text).toContain('Filed on the Inputs page')
    // The moved row ALWAYS shows since the stages went (D1177's reading: the dotted "moved" mark shows on any move of
    // a leave already approved, so the grid can wear it whatever is open). Its own test is below.
    expect(text).toContain('Moved here from another day')
    // the swatches ARE the grid's own box, so the key cannot drift from the cells (the blue 'raptor' edge mark; the
    // dotted 'moved' below)
    expect(rowBox(leg, 'Filed on the Inputs page: change it there, not here')[0]!.classList.contains('raptor')).toBe(true)
    // none of the old swatch classes is left in the colour/fill/size key
    for (const old of ['appr', 'tbc', 'ref']) expect(leg.querySelector(`.leg-box .c.${old}`)).toBeNull()
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
    // its swatch is the grid's own box wearing the moved edge (`.leg-box .c.moved` — look F's LegBox, D1175)
    expect(screen.getByTestId('legend').textContent).toContain('Moved here from another day')
    expect(screen.getByTestId('legend').querySelector('.leg-box .c.moved')).toBeTruthy()
    act(() => { setRole('admin'); closeDates('2026-01-01', '2026-12-31') })
    expect(getState().period.open).toEqual([])
    const leg = screen.getByTestId('legend')
    expect(leg.textContent).toContain('Moved here from another day')
    expect(leg.querySelector('.leg-box .c.moved')).toBeTruthy()
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
    // flagged as the group that lives only here, and given the colour the grid gives it — look F (D1175): FO is OIL's
    // kind, green, and filled (`k-oil s-a`), where it wore the grid's old duty class `sc`
    expect(text).toContain('not on the Inputs page')
    expect(leg.querySelector('.leg-sec-here')).toBeTruthy()
    const swatches = Array.from(leg.querySelectorAll('.leg-box .c'))
    const fo = swatches.find(s => s.textContent === 'FO')
    expect(fo, 'FO has a swatch').toBeTruthy()
    expect(fo!.classList.contains('k-oil') && fo!.classList.contains('s-a'), 'FO wears the grid’s OIL colour, filled').toBe(true)
    // the medical shorthand the grid shows (B / C) and the leave codes are keyed too
    const b = swatches.find(s => s.textContent === 'B')
    expect(b && b.classList.contains('k-med')).toBe(true)
    expect(swatches.some(s => s.textContent === 'LL' && s.classList.contains('k-ll'))).toBe(true)
    expect(text).toContain('Local leave')
  })

  /* EVERY GLOSSARY SWATCH WEARS THE COLOUR THE GRID GIVES ITS CODE (look F — D1175: "ONE map, read by the grid's box
     and its Legend"). The grid draws an app-credited FO as `FO*` in OIL green (`kindOf('FO')`, the star only in its
     text — `boxText`). LEFT FAILING ON PURPOSE at 5042a50e4: the Legend's FO* row passes the string 'FO*' to
     `kindOf`, which `parseCell` cannot read, so the swatch is drawn duty grey (`k-od`). */
  it('the FO* swatch is OIL green, as the grid draws an app-credited FO (D1175)', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('legend-open'))
    const star = Array.from(screen.getByTestId('legend').querySelectorAll('.leg-box .c')).find(s => s.textContent === 'FO*')
    expect(star, 'FO* has a swatch').toBeTruthy()
    expect(star!.className).toContain('k-oil')
  })

  /* NO ARROWS ON THE GRID, SO NONE IN ITS KEY (D1160, D1145 — "the split cell replaces today's <LL and LL> marks"; the
     brief: the "*" half-day section is gone): the half is said by "The size: how much of the day". LEFT FAILING ON
     PURPOSE at 5042a50e4: the code glossary (`CODE_GLOSSARY`, engine/codes.ts) still carries its "Half days" group —
     `<LL` "The arrow points at the half of the day…" and `LL>` — drawn as grey boxes with the arrow in their letters. */
  it('the key explains no half-day arrow the grid no longer prints (D1160)', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('legend-open'))
    const leg = screen.getByTestId('legend')
    expect(Array.from(leg.querySelectorAll('.leg-box .c')).map(s => s.textContent).filter(t => /[<>]/.test(t ?? ''))).toEqual([])
    expect(leg.textContent).not.toContain('The arrow points at the half')
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
