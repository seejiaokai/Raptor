// HOW MANY DAYS A GRANTED OIL CREDIT IS WORTH (owner, 20 Sep 26 — "on the
// leave war i can also grant more than 1 day of OIL credit just like how the
// oil tracker does it").
//
// THIS FILE REPLACED `credithours.test.tsx`, WRITTEN THE DAY BEFORE, and the
// reason is the model changing under it rather than those tests being wrong.
// The hours existed so a two-hour call-out beside afternoon leave would not
// flag the day. Then the owner ruled that OIL may be granted "for any reason,
// doesnt have to be like working on weekends" and told us to drop the hours —
// which together mean a granted credit is an AWARD, not a record of
// attendance. An award cannot contradict a day off, so there is nothing for
// hours to prevent. The hours live on only where they are real: the AUTOMATIC
// credit, which reads them off the published schedule.

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { balanceOf } from '../engine'
import { getState, initStore, rawState, setCell, setCellDays, setManualCredit, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

const P = 'slammed'
const TUE = '2026-01-13'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})

const creditOn = (person: string, date: string) =>
  (rawState().wars.find(w => w.period.start <= date && date <= w.period.end)!.recs[person]?.[date] ?? [])
    .find(r => r.kind === 'credit') as { code: string; oil: string; days?: number } | undefined

const oilOf = (person: string) => {
  const { openings, ledger, wars } = getState()
  return balanceOf(openings, ledger, wars, person, 'oil')
}

describe('a grant worth more than one day', () => {
  it('a quantity moves the balance by that much, not by the code’s own worth', () => {
    const before = oilOf(P)
    expect(setManualCredit(P, TUE, 'FO', { note: 'Exercise', days: 3 })).toBeNull()
    expect(creditOn(P, TUE)!.days).toBe(3)
    expect(oilOf(P)).toBe(before + 3)
  })

  it('no quantity means the code’s own worth, which is the ordinary case', () => {
    const before = oilOf(P)
    expect(setManualCredit(P, TUE, 'HO', { note: 'Recall' })).toBeNull()
    expect(creditOn(P, TUE)!.days).toBeUndefined()
    expect(oilOf(P)).toBe(before + 0.5)
  })

  it('goes in halves, and refuses what is not a real quantity', () => {
    expect(setManualCredit(P, TUE, 'FO', { days: 1.5 })).toBeNull()
    expect(oilOf(P)).toBeGreaterThan(0)
    expect(setManualCredit(P, TUE, 'FO', { days: 1.3 })).toContain('halves')
    expect(setManualCredit(P, TUE, 'FO', { days: 0 })).toContain('how many days')
    expect(setManualCredit(P, TUE, 'FO', { days: -2 })).toContain('how many days')
    expect(setManualCredit(P, TUE, 'FO', { days: 9999 })).toContain('more than')
  })

  it('is COUNTED ONCE — one record, one number', () => {
    // The rule counters.ts enforces: never two records of one fact. A grant is
    // the credit on the day; nothing mints a ledger entry beside it.
    const before = oilOf(P)
    expect(setManualCredit(P, TUE, 'FO', { days: 2 })).toBeNull()
    expect(oilOf(P)).toBe(before + 2)
    expect(getState().ledger.filter(e => e.personId === P && e.date === TUE)).toHaveLength(0)
  })

  it('setCellDays changes it afterwards, and clearing it puts the code’s worth back', () => {
    expect(setManualCredit(P, TUE, 'FO', { days: 2 })).toBeNull()
    expect(setCellDays(P, TUE, 4)).toBeNull()
    expect(creditOn(P, TUE)!.days).toBe(4)
    expect(setCellDays(P, TUE, null)).toBeNull()
    expect(creditOn(P, TUE)!.days).toBeUndefined()
  })

  it('leaves a credit the published schedule owns alone', () => {
    expect(setManualCredit(P, TUE, 'FO')).toBeNull()
    const list = rawState().wars[0]!.recs[P]![TUE]!
    ;(list.find(r => r.kind === 'credit') as { oil: string }).oil = 'auto'
    expect(setCellDays(P, TUE, 3)).toContain('published schedule')
  })
})

describe('a granted credit still behaves like every other credit', () => {
  it('lands beside leave and does NOT flag it, whatever quantity it carries', () => {
    /* The question this test used to park — whether a grant should stop
       flagging — was PUT TO THE OWNER and answered on 20 Sep 26: a granted
       credit is an AWARD. It says a man is owed days, not that he was at work,
       so it cannot contradict his leave and the day must not go amber. Both
       records still land; the quantity never mattered either way. */
    expect(setCell(P, TUE, 'LL')).toBe(true)
    expect(setManualCredit(P, TUE, 'FO', { note: 'Exercise', days: 2 })).toBeNull()
    const v = getState().views[P]?.[TUE]
    expect(v?.all.filter(c => c.kind === 'request')).toHaveLength(1)
    expect(v?.all.filter(c => c.kind === 'credit')).toHaveLength(1)
    expect(v?.amber).toBe(false)
  })
})

describe('the quantity in the OIL tracker', () => {
  it('shows on the row and can be changed beside the reason', () => {
    expect(setManualCredit(P, TUE, 'FO', { note: 'Exercise', givenBy: 'OC Ops', days: 3 })).toBeNull()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('oil-tracker'))
    expect(screen.getByTestId(`oil-entry-${P}-award:0:${TUE}`).textContent).toContain('3 days')
    fireEvent.click(screen.getByTestId(`oil-note-${P}-award:0:${TUE}`))
    expect((screen.getByTestId('oil-note-days') as HTMLInputElement).value).toBe('3')
    fireEvent.change(screen.getByTestId('oil-note-days'), { target: { value: '2.5' } })
    fireEvent.click(screen.getByTestId('oil-note-save'))
    expect(creditOn(P, TUE)!.days).toBe(2.5)
  })

  it('says so rather than guessing when the quantity cannot be read', () => {
    expect(setManualCredit(P, TUE, 'FO', { note: 'Exercise' })).toBeNull()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('oil-tracker'))
    fireEvent.click(screen.getByTestId(`oil-note-${P}-award:0:${TUE}`))
    fireEvent.change(screen.getByTestId('oil-note-days'), { target: { value: 'lots' } })
    fireEvent.click(screen.getByTestId('oil-note-save'))
    expect(screen.getByTestId('oil-note-err').textContent).toContain('how many days')
    expect(creditOn(P, TUE)!.days).toBeUndefined()
  })
})

describe('tapping an OIL day shows what is on it', () => {
  // Owner, 20 Sep 26: "when I click on FO or HO on the leave war, i should be
  // able to see the reason and given by who if applicable and quantity."
  const openDay = () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${TUE}`))
  }

  it('the button names it instead of offering to add one', () => {
    expect(setManualCredit(P, TUE, 'FO', { note: 'Exercise', givenBy: 'OC Ops', days: 3 })).toBeNull()
    openDay()
    expect(screen.getByTestId('bid-oil').textContent).toBe('FO · 3 days')
  })

  it('opens already filled in, and says it in words above the boxes', () => {
    expect(setManualCredit(P, TUE, 'HO', { note: 'Exercise', givenBy: 'OC Ops' })).toBeNull()
    openDay()
    fireEvent.click(screen.getByTestId('bid-oil'))
    expect(screen.getByTestId('oil-current').textContent).toContain('half a day of OIL')
    expect(screen.getByTestId('oil-current').textContent).toContain('Exercise')
    expect(screen.getByTestId('oil-current').textContent).toContain('OC Ops')
    expect((screen.getByTestId('oil-why') as HTMLInputElement).value).toBe('Exercise')
    expect((screen.getByTestId('oil-given-by') as HTMLInputElement).value).toBe('OC Ops')
  })

  it('changing it writes over the same record rather than adding a second', () => {
    expect(setManualCredit(P, TUE, 'FO', { note: 'Exercise', days: 3 })).toBeNull()
    openDay()
    fireEvent.click(screen.getByTestId('bid-oil'))
    fireEvent.change(screen.getByTestId('oil-days'), { target: { value: '1' } })
    fireEvent.click(screen.getByTestId('oil-fo'))
    const credits = (rawState().wars[0]!.recs[P]![TUE] ?? []).filter(r => r.kind === 'credit')
    expect(credits).toHaveLength(1)
    expect(creditOn(P, TUE)!.days).toBe(1)
  })

  it('Remove takes it off the day', () => {
    expect(setManualCredit(P, TUE, 'FO', { note: 'Exercise' })).toBeNull()
    openDay()
    fireEvent.click(screen.getByTestId('bid-oil'))
    fireEvent.click(screen.getByTestId('oil-clear'))
    expect(creditOn(P, TUE)).toBeUndefined()
  })

  it('a credit the SCHEDULE earned is not offered for editing at all — it is the schedule’s', () => {
    // It opens the READ-ONLY sheet, not the bid sheet: the cell belongs to
    // Raptor, and the OIL pass would overwrite anything typed onto it on its
    // next run. That is the existing lock, and the +OIL control inherits it.
    expect(setManualCredit(P, TUE, 'FO')).toBeNull()
    const list = rawState().wars[0]!.recs[P]![TUE]!
    ;(list.find(r => r.kind === 'credit') as { oil: string }).oil = 'auto'
    openDay()
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(screen.queryByTestId('bid-oil')).toBeNull()
  })
})

describe('the marks on the box', () => {
  it('an arrow points at the half, and a star means the app put it there', () => {
    expect(setCell(P, TUE, '*LL')).toBe(true)
    render(<Matrix />)
    expect(screen.getByTestId(`cell-${P}-${TUE}`).textContent).toContain('<LL')
  })
})
