/* UPCHIT IS INERT EVERYWHERE AN ABSENCE WOULD SHOW (owner, 27 Aug 26 —
   "Upchit complete will not show on edit schedule, view schedule and
   scheduler board"). The type exists so the write path can close a
   medical-down period; these pins keep it a paperwork record: no warning,
   no palette strike, no row in either day block, no seat in the +Add lists.
   The reference-parity half of the same guarantee is inputFlags itself —
   refwin seeds the reference through it, so the reference never receives an
   upchit row (the dormancy precedent; leave.test.ts pins the predicate). */
import { beforeAll, describe, expect, it } from 'vitest'
import { initStore, writeInputs } from '../state/store'
import { INPUTS } from '../engine/inputs'
import { validate, WARN } from '../engine/validate'
import { dayOff } from '../engine/avail'
import { DAYS } from '../engine/data'
import { dayHTML } from './html'
import { sbUnavailPanel, sbInputsGroupPanel } from './board-html'
import { TYPE_ALLOW } from './inputedit'

beforeAll(() => {
  initStore()
  /* an all-day Upchit on the loaded Monday, for a man the seed leaves clean */
  writeInputs(() => INPUTS.unshift({
    person: 'bane', date: 'Jul 13', allday: true,
    type: 'Upchit', remarks: 'fit to fly', mod: 'now',
  } as any))
})

describe('an upchit row is invisible to every schedule surface', () => {
  it('raises no warning of its own', () => {
    const before = JSON.stringify(WARN.all)
    validate()
    expect(JSON.stringify(WARN.all)).toBe(before)
  })
  it('never strikes the man from the day (he is fit AGAIN)', () => {
    expect(dayOff(DAYS[0]).has('bane')).toBe(false)
  })
  it('draws in neither week block', () => {
    const h = dayHTML(0, true)
    expect(h).not.toContain('Upchit')
  })
  it('draws in neither board panel', () => {
    expect(sbUnavailPanel(DAYS[0], 0)).not.toContain('Upchit')
    expect(sbInputsGroupPanel(DAYS[0], 0)).not.toContain('Upchit')
  })
  it('the board Unavailable + Add does not offer the type', () => {
    expect(TYPE_ALLOW.u('Upchit')).toBe(false)
    expect(TYPE_ALLOW.g('Upchit')).toBe(false)
    expect(TYPE_ALLOW.s('Upchit')).toBe(false)
  })
})
