// @vitest-environment jsdom
/* THE DAYS BREAKING A MANNING RULE TAKE THE AVAILABLE ROWS AT RED (D1243, 22 Oct 26, narrowing D1213): the under-manned
   count and its list — "Days breaking a manning rule" — count a day with an Available P or W row under its red point,
   naming the row and its figure as a Manning row is named; a day with one only at amber is never counted. How the chip
   is drawn is not this file's (it becomes the Manning button's right half — the overhaul's top rows); what it counts is.
   The Available rows' red reads the day's Required from the scheduler's plan, so a figure typed there moves the count
   with no reload. undermanned.test.tsx is the list's own behaviour, on the Manning rows alone. */
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../../engine/hooks'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { setFlyDays } from '../../state/flyplan'
import { AVAIL_P } from '../engine'
import { initStore, saveAvailRow, availRules, setAvailPoints, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { availVerdictAt, dayFacts } from '../sync'
import { StageBar } from './Chrome'

const mem = new Map<string, string>()
beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  initStore(memoryBackend())
  elevenCounters()
  setRole('admin')
})
afterEach(() => { cleanup(); setSession(null); storeBackend.impl = null })

/* the seeded war's red days on the Manning rows alone (undermanned.test.tsx) */
const RED = ['2026-01-01', '2026-01-08', '2026-01-15', '2026-02-10']
const TUE = '2026-01-06', WED = '2026-01-07'
const listed = () => {
  fireEvent.click(screen.getByTestId('undermanned'))
  return within(screen.getByTestId('undermanned-list')).getAllByTestId(/^undermanned-day-/).map(r => r.getAttribute('data-testid')!.replace('undermanned-day-', ''))
}

describe('an Available row at red counts; at amber it does not', () => {
  it('a day with Available P under Required joins the list, named with its figure', () => {
    const have = dayFacts(TUE).availP!
    setFlyDays([{ iso: TUE, p: have + 1 }])
    render(<StageBar />)
    expect(screen.getByTestId('undermanned').textContent).toContain(`${RED.length + 1} days`)
    expect(listed()).toEqual([...RED.slice(0, 1), TUE, ...RED.slice(1)])
    expect(screen.getByTestId(`undermanned-day-${TUE}`).textContent).toContain(`Available P ${have}`)
  })
  it('a day only at amber is not counted', () => {
    const have = dayFacts(WED).availP!
    setFlyDays([{ iso: WED, p: have }])                                // meets Required: not red …
    expect(setAvailPoints(AVAIL_P, { amber: 2, red: 0 })).toBe(true)   // … but under Required + 2: amber
    expect(availVerdictAt(WED, 'p')).toBe('amber')
    render(<StageBar />)
    expect(listed()).toEqual(RED)
  })
  it('a day already red on a Manning row lists the Available row beside it', () => {
    const d = RED[1]!
    setFlyDays([{ iso: d, p: dayFacts(d).availP! + 3 }])
    render(<StageBar />)
    expect(listed()).toEqual(RED)
    const line = screen.getByTestId(`undermanned-day-${d}`).textContent!
    expect(line).toContain('IWSO')
    expect(line).toContain('Available P')
  })
  it('the row is listed by its own name', () => {
    setFlyDays([{ iso: TUE, p: dayFacts(TUE).availP! + 1 }])
    expect(saveAvailRow({ ...availRules().p, label: 'Pilots here' })).toBe(true)
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('undermanned'))
    expect(screen.getByTestId(`undermanned-day-${TUE}`).textContent).toContain('Pilots here')
  })
  it('a Required figure typed while the strip is up moves the count, with no reload', () => {
    render(<StageBar />)
    expect(screen.getByTestId('undermanned').textContent).toContain(`${RED.length} days`)
    act(() => { setFlyDays([{ iso: TUE, p: dayFacts(TUE).availP! + 1 }]) })
    expect(screen.getByTestId('undermanned').textContent).toContain(`${RED.length + 1} days`)
  })
})
