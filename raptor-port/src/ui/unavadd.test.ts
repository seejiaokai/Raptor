/* THE UNAVAILABLE LIST'S "+ ADD" OFFERS WHAT LANDS THERE (the M3 code read's Q3, 25 Oct 26). Its kinds were "what makes a
   man absent" — leave, medical, an overseas duty. Since his D1372 (a course) and D1374 (an Attach) those two land under
   Unavailable by themselves, and an Other goes there on its filer's "Goes to" (D1356) — so the scheduler adding one from
   the Unavailable list was offered none of them and had to go round by the Ground Programme's "+ Inputs". Now the list
   offers the two that land there by themselves and the Other, and an Other opened from there starts on "Unavailable". */
import { describe, expect, it } from 'vitest'
import { TYPE_ALLOW, draftOf } from './inputedit'

describe('the Unavailable list’s + Add', () => {
  it('offers a course, an Attach and an Other beside leave, medical and an overseas duty', () => {
    for (const t of ['CSE', 'Attach', 'Other', 'OL', 'LL', 'OML', 'OD']) expect(TYPE_ALLOW.u(t), t).toBe(true)
  })
  it('still offers no other commitment, no SANS availability and no upchit', () => {
    for (const t of ['Training', 'Meeting', 'Duty', 'Event', 'Appointment', 'Personal', 'SANS Availability', 'Upchit'])
      expect(TYPE_ALLOW.u(t), t).toBe(false)
  })
  it('an Other opened from it starts with Goes to on Unavailable; from the Ground Programme on the Ground Programme', () => {
    expect(draftOf({ _new: true, _ctx: 'u', type: 'Other', person: 'bane', date: 'Jul 14' } as any).goes).toBe('u')
    expect(draftOf({ _new: true, _ctx: 'g', type: 'Other', person: 'bane', date: 'Jul 14' } as any).goes).toBe('g')
  })
})
