/* THE "DAYS…" LINE IN THE LEAVE WAR'S ⚙ SETTINGS (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3: "⚙ Settings gains one line, 'Days…', which
   closes the sheet and opens Days. Nothing else in it changes"; the fourth mock-ups' "the way in": the same line is in
   the SANS calendar's, the Inputs calendar's and the Leave War's settings, admins only).

   Days is the scheduler's window (ui/DaysWindow.tsx). The war reaches it through its one seam file, sync.ts `openDays`
   — never by importing the scheduler's screens — and asks for the month the war is showing. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { DAYSWIN, setDaysWin } from '../../ui/pops'
import { getVersion as raptorVersion } from '../../state/store'
import { openDays } from '../sync'
import { Matrix } from './Matrix'
import { askLw } from './lwnav'

/* ⚙ stands at the top row's right end since D1254 (Chrome.tsx `Topbar`), outside the grid: the grid rendered alone is
   asked as the ⚙ press asks it (ui/lwnav.ts). */
const openSettings = () => act(() => { askLw({ kind: 'settings' }) })

beforeEach(() => { initStore(memoryBackend()); setRole('admin'); setDaysWin(null) })
afterEach(() => { setDaysWin(null) })

describe('⚙ Settings → Days…', () => {
  /* WAS "says what it is for" (a tray headed Calendar, its sentence under it). CHANGED by D1499 (M5b, 29 Oct 26): it
     stands on the "Year" row beside Events…, and its sentence went — its title still says what it is for. */
  it('is in the sheet for an admin, on the Year row, and sits above the counters', () => {
    render(<Matrix />)
    openSettings()
    const line = screen.getByTestId('settings-days')
    /* on screen the window is "Calendar" (owner, D675, 8 Oct 26) */
    expect(line.textContent).toBe('Calendar…')
    expect(line.closest('.bidsheet-row')!.querySelector('.lab')!.textContent).toBe('Year')
    expect(screen.queryByTestId('settings-days-hint'), 'the sentence went (D1499)').toBeNull()
    expect(line.getAttribute('title')).toMatch(/day flying, night flying or no fly/)
    const sheet = screen.getByTestId('settings-sheet')
    const order = [...sheet.querySelectorAll('[data-testid]')].map(n => n.getAttribute('data-testid'))
    expect(order.indexOf('settings-days')).toBeLessThan(order.indexOf('counter-add'))
  })
  it('closes the sheet and opens Days on a month of the period on screen', () => {
    render(<Matrix />)
    openSettings()
    const v = raptorVersion()
    fireEvent.click(screen.getByTestId('settings-days'))
    expect(screen.queryByTestId('settings-sheet')).toBeNull()
    expect(DAYSWIN).toMatch(/^\d{4}-\d\d-\d\d$/)
    expect(getState().period.days.some(d => d.date === DAYSWIN)).toBe(true)
    /* the scheduler's screens are told, so the window draws at once */
    expect(raptorVersion()).toBeGreaterThan(v)
  })
  it('the seam: openDays asks for a date’s month and tells the scheduler', () => {
    const v = raptorVersion()
    openDays('2026-11-05')
    expect(DAYSWIN).toBe('2026-11-05'); expect(raptorVersion()).toBeGreaterThan(v)
  })
  it('a date that is not a date opens nothing', () => {
    openDays('soon' as string)
    expect(DAYSWIN).toBeNull()
  })
})
