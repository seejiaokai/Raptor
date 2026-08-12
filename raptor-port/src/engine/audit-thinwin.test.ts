/* AUDIT FOLLOW-UP — a "thin" input record (owner, 12 Aug 26: "fix all").

   A record carrying neither the all-day flag nor both times used to split the
   two halves of the same question: awayAllDay called the man away and struck
   him out of the palette, while inpWin handed the validator null and every
   overlap against it was false — so planting him anyway raised NOTHING. That
   is the one drift this app's comments repeatedly say must never exist.
   inpWin now fails CLOSED like its neighbour, returning the whole day.

   No UI entry path can mint such a record (both always write the flag or both
   times), so this is a guard for what a restore, an import or a probe might
   hand over — pinned here so it cannot quietly regress to null. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpWin, awayAllDay } from './inputs'
import { validate } from './validate'
import { slotBar } from './avail'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const hits = (code: string, id: string) =>
  validate().all.filter((x: any) => x.code === code && (x.who || []).includes(id))

describe('inpWin and awayAllDay answer the same question the same way', () => {
  it('a record with no flag and no times reads as the WHOLE day, not as unknown', () => {
    const thin: any = { person: 'split', date: 'Jul 14', type: 'OL', remarks: '', mod: '' }
    expect(awayAllDay(thin), 'the picker side has always failed closed').toBe(true)
    expect(inpWin(thin), 'and now so does the validator side').toEqual([0, 1439])
  })

  it('exactly 1439 wide, so validate.ts reads it as all-day rather than timed', () => {
    const w: any = inpWin({ person: 'split', date: 'Jul 14', type: 'OL' })
    expect(w[1] - w[0]).toBe(1439)
  })

  it('a half-record with only a start is whole-day too — both ends are required', () => {
    const half: any = { person: 'split', date: 'Jul 14', type: 'OL', s: 600 }
    expect(awayAllDay(half)).toBe(true)
    expect(inpWin(half)).toEqual([0, 1439])
  })

  it('the ordinary shapes are untouched', () => {
    expect(inpWin({ allday: true, s: null, e: null })).toEqual([0, 1439])
    expect(inpWin({ allday: false, s: 540, e: 660 })).toEqual([540, 660])
    expect(inpWin({ allday: false, s: 1320, e: 120 }), 'still rolls past midnight').toEqual([1320, 1560])
    expect(inpWin(null)).toBe(null)
  })
})

describe('the picker and the warning list no longer drift on a thin record', () => {
  it('the man barred from the palette is the man the validator warns about', () => {
    INPUTS.push({ person: 'split', date: 'Jul 14', type: 'OL', remarks: '', mod: '' } as any)
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    expect(() => validate()).not.toThrow()
    /* the picker side, unchanged */
    const bar = (slotBar as any)('split', '1.0.0.0.p')
    expect(bar, bar).toMatch(/overseas leave/)
    /* the validator side, which used to say nothing at all */
    expect(hits('LEAVE_FLY', 'split').length, 'planting him now raises the warning').toBeGreaterThan(0)
  })

  it('a man with a thin record on ANOTHER day is still free to fly', () => {
    INPUTS.push({ person: 'split', date: 'Jul 16', type: 'OL', remarks: '', mod: '' } as any)
    DAYS[1].waves[0].formations[0].aircraft[0].p = 'split'
    expect(hits('LEAVE_FLY', 'split').filter((x: any) => x.di === 1), 'the wrong day never borrows it').toEqual([])
  })
})
