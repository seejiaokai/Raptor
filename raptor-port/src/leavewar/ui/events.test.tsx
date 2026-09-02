import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  addEventBand,
  addEventRow,
  getState,
  initStore,
  removeEventRow,
  setDayEvent,
  setDayEventRange,
  setRole,
} from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
})

describe('the two event lines', () => {
  it('gives every day two of them', () => {
    render(<Matrix />)
    expect(screen.getByTestId('event-row-0')).toBeTruthy()
    expect(screen.getByTestId('event-row-1')).toBeTruthy()
    expect(screen.getByTestId('event-0-2026-01-05')).toBeTruthy()
    expect(screen.getByTestId('event-1-2026-01-05')).toBeTruthy()
  })

  it('an admin can add a third event row, and it appears (owner, 18 Aug 26)', () => {
    setRole('admin')
    addEventRow()
    render(<Matrix />)
    expect(screen.getByTestId('event-row-2')).toBeTruthy()
    expect(screen.getByTestId('event-2-2026-01-05')).toBeTruthy()
    // and it is editable — a write lands on the new row
    setDayEvent('2026-01-05', 2, 'Range det')
    expect(getState().period.days.find(d => d.date === '2026-01-05')!.events[2]).toBe('Range det')
  })

  it('the add/remove-row controls show inside ⚙ Settings for an admin only', () => {
    setRole('admin')
    const { rerender } = render(<Matrix />)
    // off the row entirely — reached only by opening ⚙ Settings (owner, 3 Sep 26)
    expect(screen.queryByTestId('event-add')).toBeNull()
    fireEvent.click(screen.getByTestId('settings-open'))
    rerender(<Matrix />)
    expect(screen.getByTestId('event-add')).toBeTruthy()
    // remove only appears once above the default two rows
    expect(screen.queryByTestId('event-remove')).toBeNull()
    addEventRow()
    rerender(<Matrix />)
    expect(screen.getByTestId('event-remove')).toBeTruthy()
    removeEventRow()
  })

  /* The SANS enable switch (owner, 18 Aug 26) now lives inside ⚙ Settings, admin
     only. The roster effect itself is pinned in roster.test.ts — this pins where
     the control lives and that a click lands on the store. */
  it('the Show SANS switch shows inside ⚙ Settings for an admin only, and flips the store', () => {
    const { rerender, unmount } = render(<Matrix />)
    expect(screen.queryByTestId('settings-open'), 'a member has no settings').toBeNull()
    expect(screen.queryByTestId('sans-toggle'), 'a member never sees it').toBeNull()
    unmount()
    setRole('admin')
    const r2 = render(<Matrix />)
    expect(screen.queryByTestId('sans-toggle'), 'not until Settings is opened').toBeNull()
    fireEvent.click(screen.getByTestId('settings-open'))
    r2.rerender(<Matrix />)
    const btn = screen.getByTestId('sans-toggle')
    expect(btn.textContent).toBe('Show SANS')
    expect(getState().showSans).toBe(false)
    fireEvent.click(btn)
    r2.rerender(<Matrix />)
    expect(getState().showSans).toBe(true)
    expect(screen.getByTestId('sans-toggle').textContent).toBe('✓ SANS shown')
  })

  // The seed marks public holidays on line 0, so the row is not empty on
  // first run and the surface is visible without anyone typing.
  it('shows what the seed already put there', () => {
    render(<Matrix />)
    expect(screen.getByTestId('event-0-2026-01-01').textContent).toBe('PH')
  })

  // A member reads events; only an admin can open the editor on one.
  it('is read-only for a member and tappable for an admin', () => {
    render(<Matrix />)
    expect(screen.getByTestId('event-0-2026-01-05').className).not.toContain('editable')
    fireEvent.click(screen.getByTestId('event-0-2026-01-05'))
    expect(screen.queryByTestId('event-sheet')).toBeNull()

    setRole('admin')
    render(<Matrix />)
    expect(screen.getAllByTestId('event-0-2026-01-05')[1]!.className).toContain('editable')
  })
})

describe('event classification colours', () => {
  it('tints a PH column green (off day) on the header and the cells', () => {
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-01-01').className).toContain('evoff')
    // a person cell in the same column carries it too — the whole bar
    const anyPerson = getState().people[0]!.id
    expect(screen.getByTestId(`cell-${anyPerson}-2026-01-01`).className).toContain('evoff')
  })

  it('tints a no-leave column orange', () => {
    setRole('admin')
    setDayEvent('2026-01-08', 0, 'No Leave')
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-01-08').className).toContain('evnolv')
  })

  it('never tints the column for a work word, but reddens the word', () => {
    setRole('admin')
    setDayEvent('2026-01-08', 0, 'SC')
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-01-08').className).not.toContain('evoff')
    expect(screen.getByTestId('head-2026-01-08').className).not.toContain('evnolv')
    expect(screen.getByTestId('event-0-2026-01-08').className).toContain('work')
  })

  it('lets off win over no-leave on one day', () => {
    setRole('admin')
    setDayEvent('2026-01-08', 0, 'No Leave')
    setDayEvent('2026-01-08', 1, 'PH')
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-01-08').className).toContain('evoff')
    expect(screen.getByTestId('head-2026-01-08').className).not.toContain('evnolv')
  })
})

describe('merged bands render as one spanning cell', () => {
  it('draws a band and skips the days it covers', () => {
    setRole('admin')
    addEventBand(0, '2026-02-02', '2026-02-06', 'Exercise')
    render(<Matrix />)
    const band = screen.getByTestId('event-band-0-2026-02-02')
    expect(band.textContent).toBe('Exercise')
    expect(band.getAttribute('colspan')).toBe('5')
    // a day under the band is no longer its own cell
    expect(screen.queryByTestId('event-0-2026-02-03')).toBeNull()
    // a day just outside it still is
    expect(screen.getByTestId('event-0-2026-02-07')).toBeTruthy()
  })

  it('reddens a merged band whose label is a work type', () => {
    setRole('admin')
    addEventBand(1, '2026-02-02', '2026-02-04', 'SC')
    render(<Matrix />)
    expect(screen.getByTestId('event-band-1-2026-02-02').className).toContain('work')
  })

  it('repeats a word into each day of a range', () => {
    setRole('admin')
    setDayEventRange('2026-02-02', '2026-02-04', 0, 'SC')
    render(<Matrix />)
    expect(screen.getByTestId('event-0-2026-02-02').textContent).toBe('SC')
    expect(screen.getByTestId('event-0-2026-02-03').textContent).toBe('SC')
    expect(screen.getByTestId('event-0-2026-02-04').textContent).toBe('SC')
  })
})

/* The blocked-week reason on the event row (owner, 18 Aug 26 — "it should
   show exercise on the event"). The amber header said leave was discouraged
   but the WHY lived in a hover title, invisible on a phone. */
describe('a blocked run prints its reason on the first event line', () => {
  it('merges the seed exercise week into one spanning amber cell', () => {
    render(<Matrix />)
    const cell = screen.getByTestId('event-blocked-2026-03-09')
    expect(cell.textContent).toBe('Exercise week')
    expect(cell.getAttribute('colspan')).toBe('6') // 9–14 Mar inclusive
    expect(cell.className).toContain('blk')
    // the covered days draw no plain event cells of their own on line 0
    expect(screen.queryByTestId('event-0-2026-03-10')).toBeNull()
    // line 1 is untouched — still a plain (empty) cell
    expect(screen.getByTestId('event-1-2026-03-10')).toBeTruthy()
  })

  it('a real event typed on a blocked day breaks the run around it', () => {
    setRole('admin')
    setDayEvent('2026-03-11', 0, 'Det brief')
    render(<Matrix />)
    // the run now stops before the typed day and restarts after it
    expect(screen.getByTestId('event-blocked-2026-03-09').getAttribute('colspan')).toBe('2')
    expect(screen.getByTestId('event-0-2026-03-11').textContent).toBe('Det brief')
    expect(screen.getByTestId('event-blocked-2026-03-12').getAttribute('colspan')).toBe('3')
  })

  it('an admin can tap the reason bar to open the event sheet on its first day', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('event-blocked-2026-03-09'))
    expect(screen.getByTestId('event-sheet')).toBeTruthy()
  })
})

/* Per-event tags reach the column tint (owner, 18 Aug 26): a one-off word
   tagged on the event itself tints the day exactly as a library word does. */
describe('instance tags colour the column', () => {
  it('a day event tagged no-leave tints its column orange without a library type', () => {
    setRole('admin')
    setDayEvent('2026-02-10', 0, 'Standby', 'nolv')
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-02-10').className).toContain('evnolv')
    expect(getState().eventDefs.some(d => d.name === 'Standby')).toBe(false)
  })

  it('a band tagged off tints every day it covers green', () => {
    setRole('admin')
    addEventBand(1, '2026-02-16', '2026-02-18', 'Det stand-down', 'off')
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-02-17').className).toContain('evoff')
  })

  it('an instance tag wins over the library word match', () => {
    setRole('admin')
    // "PH" is a library off-day word; tagging this one instance no-leave wins
    setDayEvent('2026-02-20', 0, 'PH', 'nolv')
    render(<Matrix />)
    expect(screen.getByTestId('head-2026-02-20').className).toContain('evnolv')
  })
})
