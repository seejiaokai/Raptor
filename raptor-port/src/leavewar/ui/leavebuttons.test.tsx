import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { balanceAfterFill, getState, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'
import { LeaveButtons } from './LeaveButtons'

/* THE BID WINDOWS' LEAVE BUTTONS (M3 5.2–5.6; D1144, D1153, D1183, D1246; red-team fixes A8, A9). */

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

describe('the leave buttons', () => {
  it('each reads what is left of its balance — the figure the balance column shows — halves as .5, negatives in red', () => {
    const left: Record<string, number | null> = { LL: 14.5, OL: 14.5, OIL: 0, CCL: -1.5, FCL: 2, PL: 0, EL: 0, CL: 0 }
    render(<LeaveButtons portion="full" onPick={() => {}} filled={false} figure={code => left[code] ?? null} />)
    expect(screen.getByTestId('bid-LL-left').textContent).toBe('14.5')
    expect(screen.getByTestId('bid-CCL-left').textContent).toBe('−1.5')
    expect(screen.getByTestId('bid-CCL-left').className).toContain('lv-neg')
    expect(screen.getByTestId('bid-OIL').className).toContain('lv-dim')      // at 0: kept, dimmed, pressable
    expect(document.body.textContent).not.toContain('½')
  })

  it('a kind that spends nothing shows no figure', () => {
    render(<LeaveButtons portion="full" onPick={() => {}} filled={false} figure={() => null} />)
    expect(screen.queryByTestId('bid-LL-left')).toBeNull()
  })

  it('each wears its kind and the pending look, or the approved look when filled', () => {
    const { rerender } = render(<LeaveButtons portion="full" onPick={() => {}} filled={false} />)
    expect(screen.getByTestId('bid-LL').className).toMatch(/\bk-ll\b.*\bs-w\b/)
    expect(screen.getByTestId('bid-OL').className).toContain('k-ol')
    expect(screen.getByTestId('bid-OIL').className).toContain('k-oil')
    expect(screen.getByTestId('bid-CCL').className).toContain('k-care')
    rerender(<LeaveButtons portion="full" onPick={() => {}} filled />)
    expect(screen.getByTestId('bid-LL').className).toContain('s-a')
  })

  it('eight in one grid, in the catalogue order — LL OL OIL CCL, then FCL PL EL CL', () => {
    render(<LeaveButtons portion="am" onPick={() => {}} filled={false} />)
    const grid = screen.getByTestId('bid-leave-grid')
    expect([...grid.querySelectorAll('button')].map(b => b.getAttribute('data-testid'))).toEqual(
      ['bid-LL', 'bid-OL', 'bid-OIL', 'bid-CCL', 'bid-FCL', 'bid-PL', 'bid-EL', 'bid-CL'])
    expect(screen.getByTestId('bid-LL').textContent).toMatch(/^<LL/)   // the box's own voice for a morning
  })

  it('on the one-day window, the LL button shows the balance column\'s own figure for him', () => {
    render(<Matrix />)
    const man = getState().people.find(p => !p.san && getState().grid[p.id]?.['2026-02-11'] === undefined)!
    fireEvent.click(screen.getByTestId(`cell-${man.id}-2026-02-11`))
    const sheet = screen.getByTestId('bid-picker')
    const want = balanceAfterFill(man.id, ['2026-02-11'], 'LL')!.before
    expect(within(sheet).getByTestId('bid-LL-left').textContent).toBe(String(want).replace('-', '−'))
  })
})
