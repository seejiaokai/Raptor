import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'
import { DayLine, dayLineCode } from './DayLine'
import type { DayWhatIf } from '../engine/whatif'

/* THE BID WINDOWS' DAY LINE (owner D1144, D1213; M3, batch 5): at the window's top, what the bid does to manning — his
   seat's Available row before → after, then each Manning row it turns amber or red, each on its own line, the name and
   the figure in separate cells (his design lessons 20 and 29); a calm line where none turns. */

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

const day = (over: Partial<DayWhatIf> = {}): DayWhatIf => ({
  date: '2026-02-11',
  avail: { seat: 'p', label: 'Available P', before: 24.5, after: 23.5, level: 'red' },
  turned: [{ ruleId: 'ip', label: 'IP', before: 3, after: 2, level: 'amber' }],
  ...over,
})

describe('the day line', () => {
  it('draws the Available row first, then each turned row, names and figures apart, halves as .5', () => {
    render(<DayLine days={[day()]} />)
    const line = screen.getByTestId('bid-dayline')
    const rows = [...line.querySelectorAll('.dl-row')]
    expect(rows.map(r => r.getAttribute('data-testid'))).toEqual(['bid-dayline-avail', 'bid-dayline-ip'])
    expect(within(rows[0] as HTMLElement).getByText('Available P').className).toBe('dl-name')
    expect(rows[0]!.querySelector('.dl-fig')!.textContent).toBe('24.5 → 23.5 · red')
    expect(rows[1]!.querySelector('.dl-fig')!.textContent).toBe('3 → 2 · amber')
    expect(line.textContent).not.toContain('½')
    expect(screen.queryByTestId('bid-dayline-calm')).toBeNull()
  })

  it('says so in one calm line where no row turns', () => {
    render(<DayLine days={[day({ avail: { seat: 'p', label: 'Available P', before: 26, after: 25, level: null }, turned: [] })]} />)
    expect(screen.getByTestId('bid-dayline-avail').textContent).toContain('26 → 25')
    expect(screen.getByTestId('bid-dayline-calm').textContent).toBe('No manning row turns amber or red')
  })

  it('a range names the day it hurts most, its date first', () => {
    render(<DayLine days={[day({ date: '2026-02-10', avail: { seat: 'p', label: 'Available P', before: 25, after: 24, level: null }, turned: [] }), day()]} />)
    expect(screen.getByTestId('bid-dayline-when').textContent).toMatch(/11/)
  })

  it('the half picked: a morning and an afternoon ask as such', () => {
    expect([dayLineCode('full'), dayLineCode('am'), dayLineCode('pm')]).toEqual(['LL', '*LL', 'LL*'])
  })

  it('the one-day window carries it at its top, and a morning lowers his row by a half', () => {
    render(<Matrix />)
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.san && getState().grid[p.id]?.['2026-02-11'] === undefined)!
    fireEvent.click(screen.getByTestId(`cell-${pilot.id}-2026-02-11`))
    const sheet = screen.getByTestId('bid-picker')
    const line = within(sheet).getByTestId('bid-dayline')
    /* first under the title bar */
    expect(line.previousElementSibling?.className).toContain('bidsheet-hd')
    const whole = within(line).getByTestId('bid-dayline-avail').textContent!
    const [b, a] = whole.match(/[\d.]+/g)!.map(Number)
    expect(b! - a!).toBe(1)
    fireEvent.click(within(sheet).getByTestId('portion-am'))
    const half = within(sheet).getByTestId('bid-dayline-avail').textContent!.match(/[\d.]+/g)!.map(Number)
    expect(half[0]! - half[1]!).toBe(0.5)
  })
})

describe('the day line in the drag-selection window', () => {
  it('a drag across two men names the man and the day it hurts most', async () => {
    const { SelectSheet } = await import('./SelectSheet')
    const sel = { people: ['a', 'b'], from: '2026-02-10', to: '2026-02-11', cells: [
      { personId: 'a', date: '2026-02-10' }, { personId: 'b', date: '2026-02-11' }] }
    const read = (pid: string, dates: readonly string[]) => dates.map(d => day({
      date: d, avail: { seat: 'p', label: 'Available P', before: 25, after: pid === 'b' ? 22 : 24, level: pid === 'b' ? 'red' : null }, turned: [] }))
    render(<SelectSheet sel={sel as any} people={id => (id === 'a' ? 'Anvil' : 'Blade')} dayLine={read} role="admin" canDecide={false}
      onDone={() => {}} onMove={() => {}} onClose={() => {}} />)
    expect(screen.getByTestId('bid-dayline-when').textContent).toMatch(/^Blade · /)
    expect(screen.getByTestId('bid-dayline-avail').textContent).toContain('25 → 22 · red')
  })
})

/* HIS D1296: on a day already holding the bid the line reads the day as it stands — "Available P 27 · red", no arrow —
   and the calm line only where no row is amber or red */
describe('the day line on a day holding the bid (D1296)', () => {
  it('draws the figure as it stands, with its level, and no calm line while a row is red', () => {
    render(<DayLine days={[day({ standing: true, avail: { seat: 'p', label: 'Available P', before: 27, after: 27, level: 'red' }, turned: [{ ruleId: 'ip', label: 'IP', before: 2, after: 2, level: 'amber' }] })]} />)
    expect(screen.getByTestId('bid-dayline-avail').querySelector('.dl-fig')!.textContent).toBe('27 · red')
    expect(screen.getByTestId('bid-dayline-ip').querySelector('.dl-fig')!.textContent).toBe('2 · amber')
    expect(screen.queryByTestId('bid-dayline-calm')).toBeNull()
  })

  it('where nothing is amber or red it says so in the present tense', () => {
    render(<DayLine days={[day({ standing: true, avail: { seat: 'p', label: 'Available P', before: 30, after: 30, level: null }, turned: [] })]} />)
    expect(screen.getByTestId('bid-dayline-avail').querySelector('.dl-fig')!.textContent).toBe('30')
    expect(screen.getByTestId('bid-dayline-calm').textContent).toBe('No manning row is amber or red')
  })
})

describe('the one-day window reopened on his bid (D1296, his case)', () => {
  it('reads the day as it stands — one figure, no arrow, never "turns"', async () => {
    const { setCell } = await import('../state/store')
    render(<Matrix />)
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.san && getState().grid[p.id]?.['2026-02-11'] === undefined)!
    expect(setCell(pilot.id, '2026-02-11', 'LL')).toBe(true)
    fireEvent.click(screen.getByTestId(`cell-${pilot.id}-2026-02-11`))
    const line = within(screen.getByTestId('bid-picker')).getByTestId('bid-dayline')
    const fig = within(line).getByTestId('bid-dayline-avail').querySelector('.dl-fig')!.textContent!
    expect(fig).not.toContain('→')
    expect(fig).toMatch(/^\d+(\.5)?( · (amber|red))?$/)
    expect(line.textContent).not.toContain('turns')
  })
})
