// @vitest-environment jsdom
/* THE INPUTS PAGE SPEAKS ONE DAY-FIRST DATE VOICE (owner, 21 Aug 26 —
   "standardise the way the inputs are shown … change the modified date to show
   day month year"). Pins the two helpers and that a rendered row is compact and
   uniform: a same-day timed input carries its whole span in Start and an empty
   End (so the card hides it), an all-day one-day input reads just its date, a
   span keeps both cells, and Last-modified reads 'D Mon YY'. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { InputsPage } from './InputsPage'
import { initStore, setSession, notify, writeInputs } from '../state/store'
import { INPUTS } from '../engine/inputs'
import { fmtDay, fmtDMY } from './inputedit'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (r: Element, s: string) => r.querySelector(s) as HTMLElement

describe('the Inputs page date helpers', () => {
  it('fmtDay reads day-first, and keeps a year only when it is not this one', () => {
    expect(fmtDay('2026-07-13')).toBe('13 Jul')
    expect(fmtDay('2026-01-03')).toBe('3 Jan')
    expect(fmtDay('2027-01-03')).toBe('3 Jan 2027')
    expect(fmtDay('')).toBe('')
  })
  it('fmtDMY is day-month-two-digit-year, and passes "now" and blanks through', () => {
    expect(fmtDMY('2026-07-06')).toBe('6 Jul 26')
    expect(fmtDMY('2026-11-20')).toBe('20 Nov 26')
    expect(fmtDMY('now')).toBe('now')
    expect(fmtDMY('')).toBe('')
    expect(fmtDMY(undefined)).toBe('')
  })
})

describe('a rendered input row is compact and uniform', () => {
  let host: HTMLDivElement, root: any
  const rowOf = (person: string) =>
    [...host.querySelectorAll('#inBody tr')].find(tr => (tr.textContent || '').includes(person)) as HTMLElement
  const cell = (tr: HTMLElement, label: string) => $(tr, `td[data-label="${label}"]`)

  beforeAll(async () => {
    initStore()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    // three shapes, each an id nothing else in the seed carries
    await act(async () => {
      writeInputs(() => {
        INPUTS.unshift({ person: 'zzt', date: 'Jul 14', allday: false, s: 600, e: 660, type: 'Appointment', remarks: 'timed one-day', mod: '2026-07-06' })
        INPUTS.unshift({ person: 'zza', date: 'Jul 14', allday: true, type: 'LL', remarks: 'allday one-day', mod: '2026-11-20' })
        INPUTS.unshift({ person: 'zzs', date: 'Jul 14', endDate: 'Jul 16', allday: true, type: 'OL', remarks: 'span', mod: 'now' })
      })
    })
    host = document.createElement('div'); document.body.appendChild(host)
    root = createRoot(host)
    await act(async () => { root.render(<InputsPage />) })
    // show everything so the July rows are certainly on screen
    if (!host.querySelector('#inRangePop')) await act(async () => { $(host, '#inRangeBtn').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { $(host, '#inRangeAll').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
  })

  it('a same-day TIMED input carries its whole span in Start, and hides End', () => {
    const tr = rowOf('timed one-day')
    expect(cell(tr, 'Start').textContent).toBe('14 Jul 10:00–11:00')
    expect(cell(tr, 'End').textContent).toBe('')
    expect(cell(tr, 'End').hasAttribute('data-same'), 'the card drops the empty End').toBe(true)
    expect(cell(tr, 'Modified').textContent).toBe('6 Jul 26')
  })
  it('an all-day one-day input reads just its date', () => {
    const tr = rowOf('allday one-day')
    expect(cell(tr, 'Start').textContent).toBe('14 Jul')
    expect(cell(tr, 'End').textContent).toBe('')
    expect(cell(tr, 'End').hasAttribute('data-same')).toBe(true)
    expect(cell(tr, 'Modified').textContent).toBe('20 Nov 26')
  })
  it('a span keeps both cells and the "now" stamp passes through', () => {
    const tr = rowOf('span')
    expect(cell(tr, 'Start').textContent).toBe('14 Jul')
    expect(cell(tr, 'End').textContent).toBe('16 Jul')
    expect(cell(tr, 'End').hasAttribute('data-same'), 'a real span shows its End').toBe(false)
    expect(cell(tr, 'Modified').textContent).toBe('now')
  })
})
