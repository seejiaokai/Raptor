// AN ADMIN CAN RECORD THAT SOMEONE WORKED (owner, 20 Sep 26 — "the admin can
// also credit OIL on the leave sheet for convenience. We should enable that
// even on any day"), AND CAN PLACE LEAVE ON A DAY OUTSIDE THEIR POSTING DATES
// ("we should also allow putting inputs when we click on days that were posted
// out").
//
// Both close gaps found by hand-testing, and the first is the more serious: the
// store accepted a hand-typed FO/HO credit, the OIL tracker edited its reason
// and the hours box edited its times — but NOTHING in the app could create
// one. The only writers were the automatic pass off the published schedule and
// the demo seed, so all three editors could only ever reach a credit nobody
// was able to type.
//
// ANY DAY is deliberate and is the owner's ruling. The weekend / public-holiday
// restriction is real, but it belongs to the AUTOMATIC pass, which reads the
// published schedule. A credit an admin types is the squadron recording that a
// man worked with no schedule behind it — which is exactly why it carries a
// reason and who said so, and why it DOES move his OIL balance.

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { balanceOf, isWeekend } from '../engine'
import { getState, ingestDutyCredit, initStore, rawState, setCell, setManualCredit, setPostOut, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

const P = 'slammed'
const TUE = '2026-01-13'      // an ordinary weekday
const SAT = '2026-01-03'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})

const creditOn = (person: string, date: string) =>
  (rawState().wars.find(w => w.period.start <= date && date <= w.period.end)!.recs[person]?.[date] ?? [])
    .find(r => r.kind === 'credit') as
    { code: string; oil: string; note?: string; givenBy?: string; days?: number } | undefined

const oilOf = (person: string) => {
  const { openings, ledger, wars } = getState()
  return balanceOf(openings, ledger, wars, person, 'oil')
}

describe('setManualCredit', () => {
  it('records the day, the reason, who said so and how many days — in ONE step', () => {
    expect(setManualCredit(P, SAT, 'FO', { note: 'Call-out', givenBy: 'OC Ops', days: 2 })).toBeNull()
    expect(creditOn(P, SAT)).toMatchObject({
      code: 'FO', oil: 'manual', note: 'Call-out', givenBy: 'OC Ops', days: 2,
    })
  })

  it('lands on ANY day, not only a weekend or a public holiday', () => {
    expect(isWeekend(TUE)).toBe(false)
    const before = oilOf(P)
    expect(setManualCredit(P, TUE, 'FO', { note: 'Recall' })).toBeNull()
    expect(creditOn(P, TUE)?.code).toBe('FO')
    // …and it really does move the balance. That is the point of typing it.
    expect(oilOf(P)).toBe(before + 1)
  })

  it('HO is half a day', () => {
    const before = oilOf(P)
    expect(setManualCredit(P, TUE, 'HO')).toBeNull()
    expect(oilOf(P)).toBe(before + 0.5)
  })

  it('no quantity means the code’s own worth, which is the ordinary case', () => {
    expect(setManualCredit(P, SAT, 'FO', { note: 'Duty' })).toBeNull()
    expect(creditOn(P, SAT)!.days).toBeUndefined()
  })

  it('refuses only where refusing is the truth', () => {
    setRole('member')
    expect(setManualCredit(P, SAT, 'FO')).toContain('admin')
    setRole('admin')
    expect(setManualCredit(P, SAT, 'FO', { days: 1.3 })).toContain('halves')
    expect(setManualCredit(P, SAT, 'FO', { days: 0 })).toContain('how many days')
    expect(creditOn(P, SAT)).toBeUndefined()
  })

  it('leaves a day the published schedule already earns to the schedule', () => {
    expect(setManualCredit(P, SAT, 'FO')).toBeNull()
    const list = rawState().wars[0]!.recs[P]![SAT]!
    ;(list.find(r => r.kind === 'credit') as { oil: string }).oil = 'auto'
    expect(setManualCredit(P, SAT, 'HO')).toContain('published schedule')
  })

  it('never refuses for clashing with leave — both land, and an award does not flag the day', () => {
    /* The credit still lands beside the leave — that is the older half of the
       rule. What changed on 20 Sep 26 is the flag: a credit typed in by hand is
       an AWARD, it says nothing about where the man was, so there is nothing
       for an admin to resolve and the day stays grey. */
    expect(setCell(P, SAT, 'LL')).toBe(true)                 // leave first…
    expect(setManualCredit(P, SAT, 'FO')).toBeNull()         // …then the award
    const v = getState().views[P]?.[SAT]
    expect(v?.all.filter(c => c.kind === 'request')).toHaveLength(1)
    expect(v?.all.filter(c => c.kind === 'credit')).toHaveLength(1)
    expect(v?.amber).toBe(false)
  })
})

describe('the OIL control on the day sheet', () => {
  const openSheet = (date: string) => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${date}`))
    fireEvent.click(screen.getByTestId('bid-oil'))
  }

  it('is folded behind one button, because it is the opposite fact to the rows above it', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${TUE}`))
    expect(screen.getByTestId('bid-oil')).toBeTruthy()
    expect(screen.queryByTestId('oil-fo')).toBeNull()
  })

  it('writes the whole thing from the sheet, on a WEEKDAY', () => {
    openSheet(TUE)
    fireEvent.change(screen.getByTestId('oil-why'), { target: { value: 'Recall' } })
    fireEvent.change(screen.getByTestId('oil-given-by'), { target: { value: 'OC Ops' } })
    fireEvent.change(screen.getByTestId('oil-days'), { target: { value: '2' } })
    fireEvent.click(screen.getByTestId('oil-fo'))
    expect(creditOn(P, TUE)).toMatchObject({
      code: 'FO', oil: 'manual', note: 'Recall', givenBy: 'OC Ops', days: 2,
    })
  })

  it('says so rather than guessing when the quantity cannot be read', () => {
    openSheet(TUE)
    fireEvent.change(screen.getByTestId('oil-days'), { target: { value: 'lots' } })
    fireEvent.click(screen.getByTestId('oil-fo'))
    expect(screen.getByTestId('oil-err').textContent).toContain('how many days')
    expect(creditOn(P, TUE)).toBeUndefined()
  })

  it('a member never sees it', () => {
    setRole('member')
    setViewer(P)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${TUE}`))
    expect(screen.queryByTestId('bid-oil')).toBeNull()
  })
})

describe('placing leave on a day outside the posting dates', () => {
  it('the posting sheet hands the day to the bid sheet, and back on close', () => {
    setPostOut(P, '2026-02-01')
    render(<Matrix />)
    const day = '2026-09-08'
    fireEvent.click(screen.getByTestId(`cell-${P}-${day}`))
    // The common tap still manages the POSTING — that is what he means most
    // of the time, and it must not change.
    expect(screen.getByTestId('postout-sheet')).toBeTruthy()
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    // …with one button through to placing something.
    fireEvent.click(screen.getByTestId('postout-place'))
    expect(screen.queryByTestId('postout-sheet')).toBeNull()
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  })

  it('the leave placed there actually lands, on a day he has already left', () => {
    setPostOut(P, '2026-02-01')
    render(<Matrix />)
    const day = '2026-09-08'
    fireEvent.click(screen.getByTestId(`cell-${P}-${day}`))
    fireEvent.click(screen.getByTestId('postout-place'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(getState().grid[P]?.[day]).toBe('LL')
  })

  it('and OIL can be recorded there too, which is why the button says both', () => {
    setPostOut(P, '2026-02-01')
    render(<Matrix />)
    const day = '2026-09-08'
    fireEvent.click(screen.getByTestId(`cell-${P}-${day}`))
    fireEvent.click(screen.getByTestId('postout-place'))
    fireEvent.click(screen.getByTestId('bid-oil'))
    fireEvent.change(screen.getByTestId('oil-why'), { target: { value: 'Clearing' } })
    fireEvent.click(screen.getByTestId('oil-fo'))
    expect(creditOn(P, day)?.note).toBe('Clearing')
  })

  it('the switch is for THAT cell only — the next day opens on the posting sheet again', () => {
    setPostOut(P, '2026-02-01')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-09-08`))
    fireEvent.click(screen.getByTestId('postout-place'))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    fireEvent.click(screen.getByTestId('bid-cancel'))
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-09-09`))
    expect(screen.getByTestId('postout-sheet')).toBeTruthy()
  })
})

describe('who said so is RECORDED and VISIBLE', () => {
  // Recording it and never showing it would be the same shape as the bug this
  // branch opened with: a man charged for leave his row no longer showed.
  it('shows on the OIL tracker row and can be changed there', () => {
    expect(setManualCredit(P, TUE, 'FO', { note: 'Recall', givenBy: 'OC Ops' })).toBeNull()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('oil-tracker'))
    const row = screen.getByTestId(`oil-entry-${P}-auto:0:${TUE}`)
    expect(row.textContent).toContain('OC Ops')
    fireEvent.click(screen.getByTestId(`oil-note-${P}-auto:0:${TUE}`))
    expect((screen.getByTestId('oil-note-given') as HTMLInputElement).value).toBe('OC Ops')
    fireEvent.change(screen.getByTestId('oil-note-given'), { target: { value: 'SQNCDR' } })
    fireEvent.click(screen.getByTestId('oil-note-save'))
    expect(creditOn(P, TUE)!.givenBy).toBe('SQNCDR')
  })

  it('shows on the day’s record list', () => {
    // A credit beside a bid is two records, so the tap opens the list rather
    // than a single-record sheet — which is where a person reads what is on
    // their day.
    expect(setCell(P, TUE, 'LL')).toBe(true)
    expect(setManualCredit(P, TUE, 'FO', { note: 'Recall', givenBy: 'OC Ops' })).toBeNull()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${TUE}`))
    const list = screen.getByTestId('daylist')
    expect(list.textContent).toContain('Recall')
    expect(list.textContent).toContain('OC Ops')
  })
})

/* WHAT THE OIL ON A DAY SAYS, ON ONE CLICK (owner, 21 Sep 26 — "When i click
   on like FO or HO once, At the bottom i want to see the reason, given by and
   days granted"). Three lines, the same three whichever kind of credit it is;
   the app's own credit answers them from the schedule it was earned off. */
describe('the OIL on a day, read back on one click', () => {
  const open = (date: string) => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${date}`))
  }

  it('an AWARD shows the reason, the giver and how many days — without opening anything', () => {
    expect(setManualCredit(P, TUE, 'FO', { note: 'Exercise recovery', givenBy: 'OC Ops', days: 2 })).toBeNull()
    open(TUE)
    expect(screen.getByTestId('oil-detail-why').textContent).toBe('Exercise recovery')
    expect(screen.getByTestId('oil-detail-given').textContent).toBe('OC Ops')
    expect(screen.getByTestId('oil-detail-days').textContent).toBe('2 days')
  })

  it('says so plainly when an award was given with no reason and no name', () => {
    expect(setManualCredit(P, TUE, 'HO')).toBeNull()
    open(TUE)
    expect(screen.getByTestId('oil-detail-why').textContent).toBe('Not given')
    expect(screen.getByTestId('oil-detail-given').textContent).toBe('Not given')
    expect(screen.getByTestId('oil-detail-days').textContent).toBe('half a day')
  })

  it('OIL the app earned names the WEEKEND as its giver, and the hours behind it', () => {
    expect(ingestDutyCredit(P, SAT, 'FO', 'Duty', [[480, 1080]])).toBe('written')
    open(SAT)
    expect(screen.getByTestId('oil-detail-why').textContent).toBe('Duty')
    expect(screen.getByTestId('oil-detail-given').textContent).toBe('Weekend/PH')
    expect(screen.getByTestId('oil-detail-days').textContent).toContain('a day')
    expect(screen.getByTestId('oil-detail-days').textContent).toContain('worked 08:00–18:00')
  })

  it('OIL earned from an accepted duty INPUT says so instead — the two are not the same evidence', () => {
    expect(ingestDutyCredit(P, SAT, 'HO', 'Duty', [[480, 720]], 'input')).toBe('written')
    open(SAT)
    expect(screen.getByTestId('oil-detail-given').textContent).toBe('Duty input')
  })

  it('shows nothing at all on a day with no OIL on it', () => {
    open(TUE)
    expect(screen.queryByTestId('oil-detail')).toBeNull()
  })
})

