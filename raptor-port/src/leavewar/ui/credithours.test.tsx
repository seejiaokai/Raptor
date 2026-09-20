// THE HOURS ON A HAND-TYPED OIL CREDIT (CURRENT-STATE item E; clash check B8,
// "a manual credit MAY carry work times; none = the whole day").
//
// B8's field and every check that reads it have existed all along. What was
// missing was any way to WRITE it: the only writer was the automatic pass, so
// a credit an admin typed by hand always meant the WHOLE DAY and therefore
// always overlapped any leave on it. The consequence was not cosmetic — since
// the owner's 20 Sep 26 ruling that recorded work never bars a write, the leave
// goes through and the day goes AMBER, so the warning list called for a human
// every time, on credits that in truth clashed with nothing. A two-hour
// Saturday call-out beside afternoon leave should be quiet.

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, rawState, setCell, setCellHours, setCellNote, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})

const SAT = '2026-01-03'
const P = 'slammed'
const creditOn = (person: string, date: string) =>
  (rawState().wars.find(w => w.period.start <= date && date <= w.period.end)!.recs[person]?.[date] ?? [])
    .find(r => r.kind === 'credit') as { spans?: Array<[number, number]>; note?: string } | undefined

describe('setCellHours', () => {
  it('records the hours worked, and clearing them puts the whole day back', () => {
    expect(setCell(P, SAT, 'FO')).toBe(true)
    expect(creditOn(P, SAT)!.spans).toBeUndefined()        // B8's default: the whole day
    expect(setCellHours(P, SAT, 480, 600)).toBeNull()      // 08:00–10:00
    expect(creditOn(P, SAT)!.spans).toEqual([[480, 600]])
    expect(setCellHours(P, SAT, null, null)).toBeNull()
    expect(creditOn(P, SAT)!.spans).toBeUndefined()
  })

  it('a two-hour call-out no longer flags an afternoon leave — the whole point of the box', () => {
    expect(setCell(P, SAT, 'FO')).toBe(true)
    expect(setCell(P, SAT, 'OL*')).toBe(true)              // afternoon leave beside it
    // Whole-day credit: the two overlap, so the day calls for a human.
    expect(getState().views[P]?.[SAT]?.amber).toBe(true)
    // Told the real hours, they do not meet, and the day goes quiet.
    expect(setCellHours(P, SAT, 480, 600)).toBeNull()
    expect(getState().views[P]?.[SAT]?.amber).toBe(false)
  })

  it('refuses a half-typed or impossible span, and says which', () => {
    expect(setCell(P, SAT, 'FO')).toBe(true)
    expect(setCellHours(P, SAT, 480, null)).toContain('both')
    expect(setCellHours(P, SAT, 600, 480)).toContain('before the start')
    expect(setCellHours(P, SAT, -1, 600)).toContain('not a real time')
    expect(creditOn(P, SAT)!.spans).toBeUndefined()
  })

  it('is the ADMIN’s, and only on a credit he typed himself', () => {
    expect(setCell(P, SAT, 'FO')).toBe(true)
    setRole('member')
    expect(setCellHours(P, SAT, 480, 600)).toContain('admin')
    setRole('admin')
    expect(setCellHours(P, '2026-01-04', 480, 600)).toContain('no OIL credit')
  })

  it('leaves a credit that comes from the published schedule alone', () => {
    // Its hours are the schedule's, and the reverse pass would overwrite them
    // on its next run, so accepting the edit would be a lie.
    expect(setCell(P, SAT, 'FO')).toBe(true)
    const list = rawState().wars[0]!.recs[P]![SAT]!
    ;(list.find(r => r.kind === 'credit') as { oil: string }).oil = 'auto'
    expect(setCellHours(P, SAT, 480, 600)).toContain('published schedule')
  })
})

describe('the hours box in the OIL tracker', () => {
  const openCredit = () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('oil-tracker'))
    const btn = screen.getByTestId(`oil-note-${P}-auto:0:${SAT}`)
    fireEvent.click(btn)
    return btn
  }

  it('takes the hours beside the reason and saves both on one button', () => {
    expect(setCell(P, SAT, 'FO')).toBe(true)
    openCredit()
    fireEvent.change(screen.getByTestId('oil-note-input'), { target: { value: 'Call-out' } })
    fireEvent.change(screen.getByTestId('oil-hours-from'), { target: { value: '0800' } })
    fireEvent.change(screen.getByTestId('oil-hours-to'), { target: { value: '10:00' } })
    fireEvent.click(screen.getByTestId('oil-note-save'))
    const c = creditOn(P, SAT)!
    expect(c.spans).toEqual([[480, 600]])
    expect(c.note).toBe('Call-out')
  })

  it('refuses hours it cannot read, and does NOT save the reason on its own', () => {
    // Half-working would be worse than not working: the message would read as
    // being about the part that landed.
    expect(setCell(P, SAT, 'FO')).toBe(true)
    expect(setCellNote(P, SAT, 'before')).toBeNull()
    openCredit()
    fireEvent.change(screen.getByTestId('oil-note-input'), { target: { value: 'after' } })
    fireEvent.change(screen.getByTestId('oil-hours-from'), { target: { value: 'lunchtime' } })
    fireEvent.change(screen.getByTestId('oil-hours-to'), { target: { value: '10:00' } })
    fireEvent.click(screen.getByTestId('oil-note-save'))
    expect(screen.getByTestId('oil-note-err').textContent).toContain('08:00')
    expect(creditOn(P, SAT)!.note).toBe('before')
  })

  it('shows the hours back on the row once they are set', () => {
    expect(setCell(P, SAT, 'FO')).toBe(true)
    expect(setCellHours(P, SAT, 480, 600)).toBeNull()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('oil-tracker'))
    expect(screen.getByTestId(`oil-note-${P}-auto:0:${SAT}`).textContent).toContain('08:00–10:00')
  })
})
