import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { RangePicker, type Range } from './RangePicker'

/* SINCE STEP TWO OF THE APP'S ONE DATE CALENDAR (owner D901, 15 Oct 26) the range calendar IS that calendar
   (ui/DateCal.tsx). Every behaviour pinned here before is pinned still; only how the test finds the parts changed
   (docs/superpowers/briefs/2026-10-15-calendar-step-two-test-map.md). Two behaviours changed by his word, and the
   tests say so: no Clear but the bidding dates' "Clear dates" (D901 (1)); the weekday row reads MON … SUN. */

/** The picker is controlled, so testing it needs something to hold the value —
 *  the same job the three sheets do in the app. */
function Harness({ min, max, initial = null, clear }: { min?: string; max?: string; initial?: Range | null; clear?: boolean }) {
  const [range, setRange] = useState<Range | null>(initial)
  return (
    <>
      <RangePicker min={min} max={max} value={range} onChange={setRange} clear={clear} />
      <span data-testid="value">{range ? `${range.from}..${range.to}` : 'none'}</span>
    </>
  )
}

const value = () => screen.getByTestId('value').textContent
const day = (d: string) => screen.getByTestId(`range-day-${d}`)
/** the month shown, "yyyy-mm" */
const month = () => screen.getByTestId('range').getAttribute('data-month')

describe('RangePicker', () => {
  // The whole ask: two weeks of leave in two taps, not fourteen.
  it('takes a start and an end in two taps', () => {
    render(<Harness min="2026-01-01" max="2026-12-31" />)
    fireEvent.click(day('2026-01-05'))
    expect(value()).toBe('2026-01-05..2026-01-05')
    fireEvent.click(day('2026-01-18'))
    expect(value()).toBe('2026-01-05..2026-01-18')
  })

  // Every day between the two ends is painted, which is the reason this is
  // not two native date inputs: they cannot draw a span at all.
  it('paints every day in the span, not only its ends', () => {
    render(<Harness min="2026-01-01" max="2026-12-31" />)
    fireEvent.click(day('2026-01-05'))
    fireEvent.click(day('2026-01-08'))
    for (const d of ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08']) {
      expect(day(d).className).toContain('is-in')
    }
    expect(day('2026-01-04').className).not.toContain('is-in')
    expect(day('2026-01-09').className).not.toContain('is-in')
  })

  it('marks the two ends of the span differently from its middle', () => {
    render(<Harness min="2026-01-01" max="2026-12-31" />)
    fireEvent.click(day('2026-01-05'))
    fireEvent.click(day('2026-01-08'))
    expect(day('2026-01-05').className).toContain('is-from')
    expect(day('2026-01-08').className).toContain('is-to')
    expect(day('2026-01-05').className).toContain('is-sel')
    expect(day('2026-01-08').className).toContain('is-sel')
    expect(day('2026-01-06').className).toContain('is-mid')
    expect(day('2026-01-06').className).not.toContain('is-sel')
  })

  // Reaching for an earlier start is the ordinary correction. Refusing it —
  // or building a backwards range out of it — would leave the person tapping
  // a day that appears to do nothing.
  it('restarts from a day tapped before the pending start', () => {
    render(<Harness min="2026-01-01" max="2026-12-31" />)
    fireEvent.click(day('2026-01-18'))
    fireEvent.click(day('2026-01-05'))
    expect(value()).toBe('2026-01-05..2026-01-05')
  })

  it('starts a new span once one is complete', () => {
    render(<Harness min="2026-01-01" max="2026-12-31" />)
    fireEvent.click(day('2026-01-05'))
    fireEvent.click(day('2026-01-08'))
    fireEvent.click(day('2026-01-20'))
    expect(value()).toBe('2026-01-20..2026-01-20')
  })

  it('walks months without losing the selection', () => {
    render(<Harness min="2026-01-01" max="2026-12-31" />)
    fireEvent.click(day('2026-01-28'))
    fireEvent.click(screen.getByTestId('range-next'))
    expect(month()).toBe('2026-02')
    expect(screen.getByTestId('range-title').textContent).toMatch(/^February 2026/)
    fireEvent.click(day('2026-02-06'))
    expect(value()).toBe('2026-01-28..2026-02-06')
  })

  // December to January is where a naive month-shift breaks, and a leave war
  // that crosses a year is the case this app was built for.
  it('crosses a year boundary in both directions', () => {
    render(<Harness min="2026-01-01" max="2027-12-31" initial={{ from: '2026-12-05', to: '2026-12-05' }} />)
    fireEvent.click(screen.getByTestId('range-next'))
    expect(month()).toBe('2027-01')
    fireEvent.click(screen.getByTestId('range-prev'))
    fireEvent.click(screen.getByTestId('range-prev'))
    expect(month()).toBe('2026-11')
  })

  // February is the month a "days in month" table gets wrong, and 2028 is a
  // leap year — neither may be a case.
  it('draws a short February and a leap one', () => {
    render(<Harness min="2026-01-01" max="2028-12-31" initial={{ from: '2026-02-01', to: '2026-02-01' }} />)
    expect(screen.queryByTestId('range-day-2026-02-28')).toBeTruthy()
    expect(screen.queryByTestId('range-day-2026-02-29')).toBeNull()

    render(<Harness min="2026-01-01" max="2028-12-31" initial={{ from: '2028-02-01', to: '2028-02-01' }} />)
    expect(screen.getAllByTestId('range-day-2028-02-29')).toHaveLength(1)
  })

  // Bounds are the war's own span. A day outside it is drawn — the month has
  // to keep its shape — but dead, so nobody opens bidding on a date the war
  // does not contain.
  it('refuses a day outside the bounds', () => {
    render(<Harness min="2026-01-10" max="2026-01-20" />)
    expect((day('2026-01-09') as HTMLButtonElement).disabled).toBe(true)
    expect((day('2026-01-21') as HTMLButtonElement).disabled).toBe(true)
    expect((day('2026-01-10') as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(day('2026-01-09'))
    expect(value()).toBe('none')
  })

  // The month has to start under the right weekday or every date reads a
  // column out. 1 Jan 2026 is a Thursday, which is column 3 Monday-first.
  // Counted as the places BEFORE the first day: there are trailing blanks too
  // (every month is six rows), so the LEAD is what positions the 1st.
  it('pads the first row so the 1st lands under its own weekday', () => {
    const { container } = render(<Harness min="2026-01-01" max="2026-12-31" />)
    const cells = Array.from(container.querySelectorAll('.dcal-grid > .dcal-d'))
    const firstDay = cells.findIndex(c => !c.classList.contains('is-blank'))
    expect(firstDay).toBe(3)
    expect(cells[3].getAttribute('data-iso')).toBe('2026-01-01')
  })

  // Monday-first, because leave is asked for in working weeks and a
  // Sunday-first grid splits every weekend across two rows.
  it('runs Monday first', () => {
    render(<Harness min="2026-01-01" max="2026-12-31" />)
    expect([...screen.getByTestId('range-dow').children].map(e => e.textContent))
      .toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])
  })

  it('reads the chosen span back in words', () => {
    render(<Harness min="2026-01-01" max="2026-12-31" />)
    expect(screen.getByTestId('range-selection').textContent).toBe('Pick a start date')
    fireEvent.click(day('2026-01-05'))
    fireEvent.click(day('2026-01-18'))
    expect(screen.getByTestId('range-selection').textContent).toBe('5 Jan 26 – 18 Jan 26')
  })

  // NO CLEAR BUT THE BIDDING DATES (owner D901 (1), 15 Oct 26): a tap on a new day starts a run over, as on every
  // calendar of the app (D796); only the bidding dates, where no dates means "Open the whole year", keep a small
  // "Clear dates".
  it('has no Clear unless its form asks for one', () => {
    render(<Harness min="2026-01-01" max="2026-12-31" />)
    fireEvent.click(day('2026-01-05'))
    expect(screen.queryByTestId('range-clear')).toBeNull()
    expect(screen.queryByText(/clear/i)).toBeNull()
  })

  it('the bidding dates\' "Clear dates" clears back to nothing — and shows only while there are dates', () => {
    render(<Harness min="2026-01-01" max="2026-12-31" clear />)
    expect(screen.queryByTestId('range-clear')).toBeNull()
    fireEvent.click(day('2026-01-05'))
    expect(screen.getByTestId('range-clear').textContent).toBe('Clear dates')
    fireEvent.click(screen.getByTestId('range-clear'))
    expect(value()).toBe('none')
    expect(screen.queryByTestId('range-clear')).toBeNull()
  })

  // It opens on the war's dates, not on today: a calendar that opened on today
  // would show a month the leave war may not even cover. (Today is SHOWN now —
  // D901 (2) — but the month it opens on is still the war's.)
  it('opens on the month the bounds start in, not on today', () => {
    render(<Harness min="2026-07-01" max="2026-09-30" />)
    expect(month()).toBe('2026-07')
  })

  // The grid holds a CONSTANT six rows every month (owner, 2 Sep 26 — the
  // arrows must not hop as the month length changes): 42 places = 6 × 7,
  // so the grid is one fixed height and the ‹ › arrows never move. Walks a
  // year, crossing 4-, 5- and 6-row months (Feb 2027 starts Monday = exactly
  // four rows unpadded; an August starts Saturday = six).
  it('keeps a constant six rows every month, so the arrows never move', () => {
    const { container } = render(<Harness min="2026-01-01" max="2029-12-31" />)
    const cellCount = () => container.querySelectorAll('.dcal-grid > .dcal-d').length
    expect(cellCount()).toBe(42)
    for (let i = 0; i < 13; i++) {
      fireEvent.click(screen.getByTestId('range-next'))
      expect(cellCount()).toBe(42)
    }
  })
})
