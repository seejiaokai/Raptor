/* THE DAY PANEL (owner D1143, D1198; the Leave War overhaul's M3, batch 6): a tap on a date's heading opens that day — its
   open-for-bidding line, its figures (names and figures apart, in their amber or red), who is away (puck, box, dates,
   days, state) — never a remark; ‹ › step across months and into a date no period holds. */
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { closeDates, initStore, setCell, setCellRange, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { _resetFloatWins } from '../../ui/FloatWindow'
import { Matrix } from './Matrix'
import { closeDayPanel, dayPanelDate, openDayPanel } from './DayPanel'

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })
afterEach(() => { act(() => { closeDayPanel() }); _resetFloatWins() })

const openOn = (iso: string) => {
  render(<Matrix />)
  fireEvent.click(screen.getByTestId(`head-${iso}`))
  return screen.getByTestId('win-lwday')
}

describe('the day panel', () => {
  it('a tap on a date heading opens that day; ‹ › step, across a month', () => {
    const w = openOn('2026-02-27')
    expect(dayPanelDate()).toBe('2026-02-27')
    expect(w.textContent).toContain('27 Feb')
    fireEvent.click(within(w).getByTestId('lwday-next'))
    fireEvent.click(within(screen.getByTestId('win-lwday')).getByTestId('lwday-next'))
    expect(dayPanelDate()).toBe('2026-03-01')
    fireEvent.click(within(screen.getByTestId('win-lwday')).getByTestId('lwday-prev'))
    expect(dayPanelDate()).toBe('2026-02-28')
  })

  it('the figures: Required and Available first, then the Manning rows, names and figures in separate cells', () => {
    const w = openOn('2026-02-11')
    const figs = within(w).getByTestId('lwday-figs')
    const rows = [...figs.querySelectorAll('.dl-row')]
    expect(rows.slice(0, 4).map(r => r.getAttribute('data-testid'))).toEqual(['lwday-fig-reqp', 'lwday-fig-availp', 'lwday-fig-reqw', 'lwday-fig-availw'])
    for (const r of rows) {
      expect(r.querySelector('.dl-name')).toBeTruthy()
      expect(r.querySelector('.dl-fig')).toBeTruthy()
    }
    expect(figs.textContent).not.toContain('½')
  })

  it('who is away: one line a person — the box, the run\u2019s dates, the days, the state — and never a remark', () => {
    setCellRange('dusk', '2026-02-10', '2026-02-12', 'LL', { remarks: 'SECRET-REMARK' })
    const w = openOn('2026-02-11')
    const line = within(w).getByTestId('lwday-away-dusk')
    expect(line.querySelector('.ll-box')!.className).toMatch(/\bk-ll\b.*\bs-w\b/)
    expect(line.querySelector('.ll-dates')!.textContent).toBe('10 – 12 Feb')
    expect(line.querySelector('.ll-days')!.textContent).toBe('3')
    expect(line.querySelector('.ll-state')!.textContent).toBe('Pending')
    expect(line.querySelector('.ll-puck')!.innerHTML, 'his puck, or his callsign where the roster draws none').toMatch(/puck|ll-cs/)
    expect(w.textContent).not.toContain('SECRET-REMARK')
    expect(within(w).getByTestId('lwday-away-h').textContent).toMatch(/^Away · \d+$/)
  })

  it('a half day counts .5', () => {
    setCell('dusk', '2026-02-11', '*LL')
    const w = openOn('2026-02-11')
    expect(within(w).getByTestId('lwday-away-dusk').querySelector('.ll-days')!.textContent).toBe('0.5')
  })

  it('a member\u2019s closed day says so on its first line', () => {
    act(() => { closeDates('2026-01-01', '2026-12-31') })
    act(() => { setRole('member'); setViewer('dusk') })
    const w = openOn('2026-02-11')
    expect(within(w).getByTestId('lwday-closed').textContent).toBe('Not open for bidding')
  })

  it('a date no period holds says so, with dashes', () => {
    render(<Matrix />)
    act(() => { openDayPanel('2031-06-02') })
    const w2 = screen.getByTestId('win-lwday')
    expect(within(w2).getByTestId('lwday-nocover').textContent).toBe('No leave period covers this date')
    expect(within(w2).getByTestId('lwday-fig-availp').querySelector('.dl-fig')!.textContent).toBe('–')
  })
})
