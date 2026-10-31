import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { balanceAfterFill, getState, initStore, leaveFiguresOf, setRole } from '../state/store'
import { figWords } from './balancefigs'
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
    expect(screen.getByTestId('bid-OIL').className).toContain('k-oilt')   // the OIL taken's own colour (D1323)
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

  /* WAS "on the one-day window, the LL button shows the balance column's own figure for him" (`.before` — his War bal as it
     stood). The M5a spec §1.6 reads the buttons' "left" through the engine's what-if: what is left AFTER this leave is placed
     on the window's day and half (walker D's FAILs 1–4, 29 Oct 26: every button read the figure as it stood, whatever the
     day or the half) */
  it('on the one-day window, a leave button reads his War bal after placing it there: a weekday −1, its afternoon −0.5', () => {
    render(<Matrix />)
    const D = '2026-02-11'                                                     // a Wednesday, no holiday
    const man = getState().people.find(p => !p.san && getState().grid[p.id]?.[D] === undefined)!
    const war = leaveFiguresOf(man.id).kinds.LVE.war
    fireEvent.click(screen.getByTestId(`cell-${man.id}-${D}`))
    let sheet = screen.getByTestId('bid-picker')
    expect(within(sheet).getByTestId('bid-LL-left').textContent).toBe(figWords(war - 1))
    expect(within(sheet).getByTestId('bid-OL-left').textContent).toBe(figWords(war - 1))
    expect(within(sheet).getByTestId('bid-LL-left').textContent).toBe(figWords(balanceAfterFill(man.id, [D], 'LL')!.after))
    fireEvent.click(within(sheet).getByTestId('portion-pm'))
    expect(within(sheet).getByTestId('bid-LL-left').textContent).toBe(figWords(war - 0.5))
  })
  it('on the drag window, a leave button reads his War bal after the leave is placed on the days dragged', async () => {
    const { SelectSheet } = await import('./SelectSheet')
    const man = getState().people.find(p => !p.san && ['2026-02-10', '2026-02-11'].every(d => getState().grid[p.id]?.[d] === undefined))!
    const sel = { people: [man.id], from: '2026-02-10', to: '2026-02-11', cells: [{ personId: man.id, date: '2026-02-10' }, { personId: man.id, date: '2026-02-11' }] }
    const war = leaveFiguresOf(man.id).kinds.LVE.war
    render(<SelectSheet sel={sel as any} people={() => man.callsign} wouldLeave={(pid, ds, code) => balanceAfterFill(pid, ds, code)}
      role="admin" canDecide={false} onDone={() => {}} onMove={() => {}} onClose={() => {}} />)
    expect(screen.getByTestId('sel-LL-left').textContent).toBe(figWords(war - 2))
  })
  it('on a Saturday the leave button\'s "left" is his War bal unchanged', () => {
    render(<Matrix />)
    const D = '2026-02-14'                                                     // a Saturday
    const man = getState().people.find(p => !p.san && getState().grid[p.id]?.[D] === undefined && getState().grid[p.id]?.['2026-02-13'] === undefined && getState().grid[p.id]?.['2026-02-16'] === undefined)!
    const war = leaveFiguresOf(man.id).kinds.LVE.war
    fireEvent.click(screen.getByTestId(`cell-${man.id}-${D}`))
    expect(within(screen.getByTestId('bid-picker')).getByTestId('bid-LL-left').textContent).toBe(figWords(war))
  })
})

describe('the window\'s row names (D1212) and the Also row (A9)', () => {
  /* WAS "asks Date and Duration; an admin's extra actions stand on a row labelled Also" (D1212, A9). Round 3 (D1332): the
     row labels went — the Duration row keeps D1212's word as its name for a screen reader, "Pick a range" ends it (the Date
     row went), and the admin's three extra actions stand behind the ⋯ in the row under the leaves (D1326) */
  it('the one-day window\'s Duration row keeps its word for a screen reader; an admin\'s extra actions are behind the ⋯', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    const sheet = screen.getByTestId('bid-picker')
    expect(sheet.querySelectorAll('.bidsheet-row > .lab')).toHaveLength(0)
    expect(within(sheet).getByTestId('portion-full').closest('.bidsheet-row')!.getAttribute('aria-label')).toBe('Duration')
    expect(sheet.textContent).not.toContain('How many')
    expect(sheet.textContent).not.toContain('How much')
    expect(within(sheet).queryByTestId('bid-also')).toBeNull()
    expect(within(sheet).getByTestId('bid-more')).toBeTruthy()
  })
  it('a member’s ⋯ holds Attach alone — no Other, no posting (D1379)', () => {
    setRole('member')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    const sheet = screen.queryByTestId('bid-picker')
    if (!sheet) return
    fireEvent.click(within(sheet).getByTestId('bid-more'))
    expect([...screen.getByTestId('bid-more-menu').querySelectorAll('button')].map(b => b.textContent)).toEqual(['Attach'])
  })
})
