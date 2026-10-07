/* THE NEW-PERIOD SHEET, ASKED FOR FROM OUTSIDE THE WAR'S OWN "+ NEW" (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4: "Where the year is PARTLY covered … the line
   says which dates are not covered and opens the war's own '+ New' period sheet with the gap's dates filled in").

   The Holidays list in Days — the scheduler's window — cannot write a holiday on a date no leave period holds. Its way
   out is the war's OWN sheet, the one "+ New" opens, with the dates left out already picked: nothing about making a
   period is rebuilt anywhere else. The ask crosses the boundary through the war's one seam file (sync.ts
   `openNewPeriod`); the war's top row answers it. The sheet is drawn ABOVE the scheduler's movable windows (it is a
   question to be answered; Days stays up behind it, holding the holiday that waits). */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createWar, getState, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { CURPAGE, setPage } from '../../state/view'
import { getVersion as raptorVersion } from '../../state/store'
import { openNewPeriod } from '../sync'
import { peekNewWarAsk, clearNewWarAsk } from './warask'
import { Topbar } from './Chrome'

beforeEach(() => { initStore(memoryBackend()); setRole('admin'); clearNewWarAsk(); setPage('leavewar') })
afterEach(() => { clearNewWarAsk() })

const FREE = 2031
const sheet = () => screen.queryByTestId('war-sheet')

describe('openNewPeriod — the seam', () => {
  it('records the ask, brings the Leave War to the front and tells the scheduler’s screens', () => {
    setPage('viewsched')
    const v = raptorVersion()
    openNewPeriod(`${FREE}-04-01`, `${FREE}-12-31`)
    expect(peekNewWarAsk()).toEqual({ from: `${FREE}-04-01`, to: `${FREE}-12-31` })
    expect(CURPAGE).toBe('leavewar')
    expect(raptorVersion()).toBeGreaterThan(v)
  })
  it('dates that are not dates, or run backwards, ask nothing', () => {
    openNewPeriod('soon', `${FREE}-12-31`)
    openNewPeriod(`${FREE}-12-31`, `${FREE}-04-01`)
    expect(peekNewWarAsk()).toBeNull()
  })
})

describe('the war’s top row answers it', () => {
  it('opens its own New-period sheet with those dates picked, above the scheduler’s windows — and the ask is spent', () => {
    render(<Topbar />)
    expect(sheet()).toBeNull()
    act(() => { openNewPeriod(`${FREE}-04-01`, `${FREE}-12-31`) })
    expect(sheet()).toBeTruthy()
    expect(sheet()!.className).toContain('raised')
    expect(document.querySelector('.bidscrim.raised, .sheetscrim.raised, [data-testid="sheet-scrim"].raised')).toBeTruthy()
    /* the dates are picked: the calendar opens on April and says the span */
    expect(screen.getByTestId('war-month').textContent).toMatch(/Apr/i)
    expect(screen.getByTestId('war-selection').textContent).toMatch(/1 Apr/)
    expect(screen.getByTestId('war-selection').textContent).toMatch(/31 Dec/)
    expect(peekNewWarAsk()).toBeNull()
    /* a name, and Create makes exactly that period */
    expect((screen.getByTestId('war-create') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByTestId('war-name'), { target: { value: 'Rest of 31' } })
    fireEvent.click(screen.getByTestId('war-create'))
    expect(getState().wars.some(w => w.period.start === `${FREE}-04-01` && w.period.end === `${FREE}-12-31` && w.period.name === 'Rest of 31')).toBe(true)
    expect(sheet()).toBeNull()
  })
  it('an ask made BEFORE the Leave War was on screen is answered when it is drawn', () => {
    openNewPeriod(`${FREE}-04-01`, `${FREE}-12-31`)
    render(<Topbar />)
    expect(sheet()).toBeTruthy()
    expect(screen.getByTestId('war-selection').textContent).toMatch(/1 Apr/)
  })
  it('the sheet "+ New" opens by itself is as it was: no dates picked, not raised', () => {
    render(<Topbar />)
    fireEvent.click(screen.getByTestId('war-new'))
    expect(sheet()!.className).not.toContain('raised')
    expect(screen.queryByTestId('war-clear')).toBeNull()
    /* and closed, a later ask still opens it with ITS dates */
    fireEvent.click(screen.getByTestId('war-cancel'))
    act(() => { openNewPeriod(`${FREE}-04-01`, `${FREE}-12-31`) })
    expect(screen.getByTestId('war-selection').textContent).toMatch(/1 Apr/)
  })
  it('closed without creating, the asked dates go with it: the next "+ New" opens with none, at its own layer', () => {
    render(<Topbar />)
    act(() => { openNewPeriod(`${FREE}-04-01`, `${FREE}-12-31`) })
    fireEvent.click(screen.getByTestId('war-cancel'))
    expect(sheet()).toBeNull()
    fireEvent.click(screen.getByTestId('war-new'))
    expect(sheet()!.className).not.toContain('raised')
    expect(screen.queryByTestId('war-clear')).toBeNull()
    expect(screen.getByTestId('war-selection').textContent).toBe('Pick a start date')
  })
  it('a member has no such sheet: the ask is dropped, and making him an admin later does not bring it up', () => {
    setRole('member')
    render(<Topbar />)
    act(() => { openNewPeriod(`${FREE}-04-01`, `${FREE}-12-31`) })
    expect(sheet()).toBeNull(); expect(peekNewWarAsk()).toBeNull()
    act(() => { setRole('admin') })
    expect(sheet()).toBeNull()
  })
  it('dates another period already holds are refused by the sheet as always — the ask grants nothing', () => {
    createWar('Q2', `${FREE}-04-01`, `${FREE}-06-30`)
    render(<Topbar />)
    act(() => { openNewPeriod(`${FREE}-04-01`, `${FREE}-12-31`) })
    fireEvent.change(screen.getByTestId('war-name'), { target: { value: 'Clash' } })
    fireEvent.click(screen.getByTestId('war-create'))
    expect(screen.getByTestId('war-problem').textContent).toMatch(/already covered by Q2/)
    expect(sheet()).toBeTruthy()
  })
})
