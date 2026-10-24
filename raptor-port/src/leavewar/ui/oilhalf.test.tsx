// THE TWO WINDOWS WHERE AN HO'S HALF IS PICKED (owner, D1164 — an HO is drawn in the morning or the afternoon of its
// day, the half the admin picks, the morning unless he picks the afternoon; beside a half day's leave, the other half).
//
// The bid window's +OIL panel and the OIL tracker's grant form each offer the window's own AM / PM chips once the award
// is half a day, open on the day's default, and save the half picked; the tracker's editor and the day's list change it;
// an award opened read only says which half. The data under them is pinned in `oilaward-half.test.ts`.

import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { awardsOnDay, getState, initStore, setCell, setDayAward, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { AwardSheet } from './BidPicker'
import { Matrix } from './Matrix'
import { askLw } from './lwnav'
import { more } from './more-testkit'   // round 3: the three behind the ⋯ (D1326)

/* the OIL tracker opens from the OIL tab of the top row since D1254 (Chrome.tsx `Topbar`): the grid rendered alone is
   asked as the tab's press asks it (ui/lwnav.ts). */
const openOil = () => act(() => { askLw({ kind: 'oil' }) })

const P = 'slammed'
const TUE = '2026-01-13'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})

const pressed = (id: string) => screen.getByTestId(id).getAttribute('aria-pressed')

describe('the bid window’s +OIL panel', () => {
  const openOil = () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${TUE}`))
    fireEvent.click(more('bid-oil'))
  }
  const days = (v: string) => fireEvent.change(screen.getByTestId('oil-days'), { target: { value: v } })

  it('offers the half only for half a day, opening on the morning, and saves the half picked', () => {
    openOil()
    expect(screen.queryByTestId('oil-half-am'), 'a whole day has no half').toBeNull()
    days('0.5')
    expect(pressed('oil-half-am')).toBe('true')
    expect(pressed('oil-half-pm')).toBe('false')
    fireEvent.click(screen.getByTestId('oil-half-pm'))
    expect(pressed('oil-half-pm')).toBe('true')
    days('1')
    expect(screen.queryByTestId('oil-half-pm'), 'gone again for a whole day').toBeNull()
    days('0.5')
    fireEvent.click(screen.getByTestId('oil-give'))
    expect(awardsOnDay(P, TUE)[0]).toMatchObject({ amount: 0.5, half: 'pm' })
  })

  it('beside a morning leave it opens on the afternoon — and the morning can still be picked', () => {
    expect(setCell(P, TUE, '*LL')).toBe(true)
    openOil()
    days('0.5')
    expect(pressed('oil-half-pm')).toBe('true')
    fireEvent.click(screen.getByTestId('oil-half-am'))
    fireEvent.click(screen.getByTestId('oil-give'))
    expect(awardsOnDay(P, TUE)[0]!.half).toBe('am')
  })

  it('an HO already on the day opens on its own half, says it in words, and its half can be changed', () => {
    expect(setDayAward(P, TUE, 0.5, { half: 'pm', note: 'Recall' })).toBeNull()
    openOil()
    expect(screen.getByTestId('oil-current').textContent).toContain('half a day of OIL, afternoon')
    expect(screen.getByTestId('oil-detail-days').textContent).toContain('half a day, afternoon')
    expect(pressed('oil-half-pm')).toBe('true')
    fireEvent.click(screen.getByTestId('oil-half-am'))
    fireEvent.click(screen.getByTestId('oil-give'))
    expect(awardsOnDay(P, TUE)).toHaveLength(1)
    expect(awardsOnDay(P, TUE)[0]).toMatchObject({ half: 'am', reason: 'Recall' })
  })

  it('an FO says no half', () => {
    expect(setDayAward(P, TUE, 1)).toBeNull()
    openOil()
    expect(screen.getByTestId('oil-detail-days').textContent).toBe('a day')
  })
})

describe('an award opened read only says which half', () => {
  it('the member’s own award window', () => {
    render(<AwardSheet callsign="SLAMMED" date={TUE} award={{ code: 'HO', days: 0.5, note: 'Recall', half: 'pm' }} onClose={() => {}} />)
    expect(screen.getByTestId('oil-detail-days').textContent).toBe('half a day, afternoon')
  })

  it('the day’s list, when the day holds more than one record, and its editor changes the half', () => {
    expect(setDayAward(P, TUE, 0.5, { half: 'am' })).toBeNull()
    expect(setCell(P, TUE, 'LL*')).toBe(true)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${TUE}`))
    const id = awardsOnDay(P, TUE)[0]!.id
    expect(screen.getByTestId(`oil-detail-days-${id}`).textContent).toBe('half a day, morning')
    expect(screen.getByTestId('daylist-sheet').textContent).toContain('OIL award, morning')   // beside its HO box (round 3, D1327)
    expect(screen.getByTestId('daylist-sheet').querySelector('.dl-box .c.k-oil')!.textContent).toBe('HO')
    fireEvent.click(screen.getByTestId(`dl-oil-edit-${id}`))
    expect(screen.getByTestId(`oil-edit-half-${id}-am`).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByTestId(`oil-edit-half-${id}-pm`))
    fireEvent.click(screen.getByTestId(`oil-edit-save-${id}`))
    expect(awardsOnDay(P, TUE)[0]!.half).toBe('pm')
  })
})

describe('the OIL tracker', () => {
  const openTracker = () => {
    render(<Matrix />)
    openOil()
  }

  it('the grant form offers the half for half a day, the morning by default, and saves the half picked', () => {
    openTracker()
    fireEvent.click(screen.getByTestId(`oil-name-${P}`))
    fireEvent.change(screen.getByTestId('oil-amt'), { target: { value: '1' } })
    expect(screen.queryByTestId('oil-half-am')).toBeNull()
    fireEvent.change(screen.getByTestId('oil-amt'), { target: { value: '0.5' } })
    expect(pressed('oil-half-am')).toBe('true')
    fireEvent.click(screen.getByTestId('oil-half-pm'))
    fireEvent.change(screen.getByTestId('oil-reason'), { target: { value: 'Recall' } })
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(getState().ledger.at(-1)).toMatchObject({ personId: P, amount: 0.5, reason: 'Recall', half: 'pm' })
  })

  it('unpicked, it saves the morning', () => {
    openTracker()
    fireEvent.click(screen.getByTestId(`oil-name-${P}`))
    fireEvent.change(screen.getByTestId('oil-amt'), { target: { value: '0.5' } })
    fireEvent.change(screen.getByTestId('oil-reason'), { target: { value: 'Recall' } })
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(getState().ledger.at(-1)).toMatchObject({ amount: 0.5, half: 'am' })
  })

  it('its line names the half beside the date, and its editor changes it', () => {
    expect(setDayAward(P, TUE, 0.5, { half: 'pm', note: 'Recall' })).toBeNull()
    const id = awardsOnDay(P, TUE)[0]!.id
    openTracker()
    expect(screen.getByTestId(`oil-entry-${id}`).querySelector('.dt')!.textContent).toMatch(/ PM$/)
    fireEvent.click(screen.getByTestId(`oil-entry-${id}`))
    expect(pressed('oil-edit-half-pm')).toBe('true')
    fireEvent.click(screen.getByTestId('oil-edit-half-am'))
    fireEvent.click(screen.getByTestId('oil-edit-save'))
    expect(awardsOnDay(P, TUE)[0]).toMatchObject({ half: 'am', reason: 'Recall' })
  })

  /* M4 (the scenario designer, 23 Oct 26): an FO turned 0.5 in the editor lights the default of the day it saves on — the
     afternoon beside a morning leave (D1164) — and saving without a pick stores the half that was lit. The editor shows
     the award's date read only (D260), so that day is its own. */
  it('an FO turned 0.5 in the editor lights its day\'s free half, and saving unpicked stores the half lit', () => {
    expect(setDayAward(P, TUE, 1, { note: 'Recall' })).toBeNull()
    expect(setCell(P, TUE, '*LL')).toBe(true)
    const id = awardsOnDay(P, TUE)[0]!.id
    openTracker()
    fireEvent.click(screen.getByTestId(`oil-entry-${id}`))
    expect(screen.getByTestId('oil-edit-date').tagName).toBe('SPAN')     // the day is read, never changed (D260)
    expect(screen.queryByTestId('oil-edit-half-am')).toBeNull()          // a whole day takes no half
    fireEvent.change(screen.getByTestId('oil-edit-amt'), { target: { value: '0.5' } })
    expect(pressed('oil-edit-half-pm')).toBe('true')
    expect(pressed('oil-edit-half-am')).toBe('false')
    fireEvent.click(screen.getByTestId('oil-edit-save'))
    expect(awardsOnDay(P, TUE)[0]).toMatchObject({ amount: 0.5, half: 'pm' })
  })
})
